import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AudioEngine, audioStatus } from './audioEngine'
import type { createSynthVoice, SynthVoice } from './synth'
import { AUDIO_STUDIES } from './studies'

class Param {
  value = 0
  cancelAndHoldAtTime = vi.fn()
  cancelScheduledValues = vi.fn()
  setValueAtTime = vi.fn()
  linearRampToValueAtTime = vi.fn()
}
class Node {
  gain = new Param(); threshold = new Param(); knee = new Param(); ratio = new Param(); attack = new Param(); release = new Param()
  fftSize = 2048; smoothingTimeConstant = 0
  disconnect = vi.fn()
  connect(node: Node) { return node }
  getFloatFrequencyData(array: Float32Array) { array.fill(-Infinity) }
  getFloatTimeDomainData(array: Float32Array) { array.fill(0) }
}
class Context extends EventTarget {
  state = 'suspended'; currentTime = 0; sampleRate = 48000; destination = new Node()
  gains: Node[] = []
  createGain() { const node = new Node(); this.gains.push(node); return node }
  createDynamicsCompressor() { return new Node() }
  createAnalyser() { return new Node() }
  setState(state: string) { this.state = state; this.dispatchEvent(new Event('statechange')) }
  resume = vi.fn(async () => { this.setState('running') })
  suspend = vi.fn(async () => { this.setState('suspended') })
  close = vi.fn(async () => { this.setState('closed') })
}
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve() }

function fixture() {
  const context = new Context()
  let hidden = false
  const created: (SynthVoice & { end: () => void })[] = []
  const createVoice: typeof createSynthVoice = (_context, id, startedAt, _input, onEnded) => {
    const duration = AUDIO_STUDIES[id].duration
    const voice = { id, duration, startedAt, endsAt: startedAt + duration, nodeCount: 20, fadeOut: vi.fn(), dispose: vi.fn(), end: onEnded }
    created.push(voice)
    return voice
  }
  const factory = vi.fn(() => context as unknown as AudioContext)
  const engine = new AudioEngine({ createContext: factory, createVoice, isHidden: () => hidden })
  return { engine, context, factory, created, hide: (value: boolean) => { hidden = value; document.dispatchEvent(new Event('visibilitychange')) } }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal('document', new EventTarget())
  vi.stubGlobal('window', new EventTarget())
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1))
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
})
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })

describe('audio lifecycle and consent', () => {
  it('creates no context on mount or volume changes, and enable never plays', async () => {
    const { engine, factory, created } = fixture()
    const detach = engine.attach()
    engine.setVolume(0.4)
    expect(factory).not.toHaveBeenCalled()
    expect(engine.getSnapshot().status).toBe('off')
    await engine.enable()
    expect(factory).toHaveBeenCalledTimes(1)
    expect(created).toHaveLength(0)
    expect(engine.getSnapshot().status).toBe('ready')
    expect(engine.energy.playing).toBe(false)
    detach(); await flush()
  })
  it('fades the outgoing voice before starting the next; rapid requests only start the last', async () => {
    const { engine, factory, created } = fixture()
    await engine.play('form')
    const echo = engine.play('echo'), afterimage = engine.play('afterimage')
    expect(created).toHaveLength(1)
    expect(created[0].fadeOut).toHaveBeenCalledWith(0, 0.045)
    await vi.advanceTimersByTimeAsync(50)
    await Promise.all([echo, afterimage])
    expect(created.map(voice => voice.id)).toEqual(['form', 'afterimage'])
    expect(created[0].dispose).toHaveBeenCalledTimes(1)
    expect(factory).toHaveBeenCalledTimes(1)
    expect(engine.stats.maxVoices).toBe(1)
    created[0].end() // A retired callback cannot finish the new voice.
    expect(engine.getSnapshot().activeId).toBe('afterimage')
    engine.dispose()
  })
  it('Stop during a pending resume cannot produce late playback', async () => {
    const { engine, context, created } = fixture()
    let complete!: () => void
    context.resume.mockImplementationOnce(() => new Promise<void>(resolve => { complete = () => { context.setState('running'); resolve() } }))
    const starting = engine.play('echo')
    expect(engine.getSnapshot().status).toBe('starting')
    engine.stop()
    complete(); await starting; await flush()
    expect(created).toHaveLength(0)
    expect(engine.getSnapshot().status).toBe('stopped')
    expect(context.state).toBe('suspended')
    engine.dispose()
  })
  it('Stop clears reactive energy immediately, releases nodes after the fade and reuses its context', async () => {
    const { engine, context, created } = fixture()
    await engine.play('form')
    Object.assign(engine.energy, { bass: 0.7, mid: 0.3, high: 0.4, level: 0.6 })
    engine.stop()
    expect(engine.energy).toMatchObject({ playing: false, level: 0, bass: 0, mid: 0, high: 0 })
    await vi.advanceTimersByTimeAsync(60)
    expect(created[0].dispose).toHaveBeenCalledTimes(1)
    expect(engine.stats).toMatchObject({ contexts: 1, voices: 0, nodes: 4 })
    expect(context.state).toBe('suspended')
    await engine.play('echo')
    expect(engine.stats).toMatchObject({ contexts: 1, voices: 1, maxVoices: 1 })
    engine.dispose()
  })
  it('natural completion returns finished state, zeros the analyser and suspends', async () => {
    const { engine, context, created } = fixture()
    await engine.play('afterimage')
    created[0].end(); await flush()
    expect(engine.getSnapshot()).toMatchObject({ status: 'stopped', reason: 'ended', activeId: null, position: 12 })
    expect(engine.energy.level).toBe(0)
    expect(engine.stats.voices).toBe(0)
    expect(context.state).toBe('suspended')
    engine.dispose()
  })
  it('hidden tabs stop; returning requires a fresh click and never auto resumes', async () => {
    const { engine, context, hide } = fixture()
    const detach = engine.attach()
    await engine.play('echo')
    hide(true); await vi.advanceTimersByTimeAsync(60)
    expect(engine.getSnapshot()).toMatchObject({ status: 'stopped', reason: 'hidden' })
    const resumes = context.resume.mock.calls.length
    hide(false); await flush()
    expect(context.resume).toHaveBeenCalledTimes(resumes)
    expect(engine.stats.voices).toBe(0)
    await engine.play('form')
    expect(engine.getSnapshot().activeId).toBe('form')
    detach(); await vi.advanceTimersByTimeAsync(60)
    expect(engine.stats.nodes).toBe(0)
    expect(context.close).toHaveBeenCalledTimes(1)
  })
  it('handles system interruption, disable, rejected resume and a retry', async () => {
    const { engine, context } = fixture()
    await engine.play('form')
    context.setState('suspended')
    expect(engine.getSnapshot().reason).toBe('interrupted')
    await vi.advanceTimersByTimeAsync(60)
    engine.disable()
    context.resume.mockRejectedValueOnce(new Error('policy denied'))
    await engine.play('echo')
    expect(engine.getSnapshot()).toMatchObject({ status: 'error', enabled: false })
    await engine.play('echo')
    expect(engine.getSnapshot().status).toBe('playing')
    expect(engine.stats.contexts).toBe(1)
    engine.dispose()
  })
  it('times out resume safely and rejects hidden-page play requests', async () => {
    const { engine, context, created, hide } = fixture()
    context.resume.mockImplementationOnce(() => new Promise(() => {}))
    const pending = engine.play('echo')
    await vi.advanceTimersByTimeAsync(6001); await pending
    expect(engine.getSnapshot().status).toBe('error')
    expect(created).toHaveLength(0)
    hide(true); await engine.play('form')
    expect(created).toHaveLength(0)
    engine.dispose()
  })
  it('survives the Strict Mode attach/cleanup probe; final detach cleans every resource', async () => {
    const { engine, context } = fixture()
    engine.attach()()
    const detach = engine.attach()
    await flush(); await engine.play('form')
    expect(engine.getSnapshot().status).toBe('playing')
    detach(); await vi.advanceTimersByTimeAsync(60)
    expect(engine.stats).toMatchObject({ voices: 0, nodes: 0 })
    expect(context.close).toHaveBeenCalledTimes(1)
    engine.dispose()
    expect(context.close).toHaveBeenCalledTimes(1)
  })
  it('clamps volume and schedules a short continuous gain ramp', async () => {
    const { engine, context } = fixture()
    await engine.enable()
    engine.setVolume(3)
    expect(engine.getSnapshot().volume).toBe(1)
    expect(context.gains[1].gain.cancelAndHoldAtTime).toHaveBeenCalledWith(0)
    expect(context.gains[1].gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(1, 0.03)
    engine.setVolume(NaN)
    expect(engine.getSnapshot().volume).toBe(0)
    engine.dispose()
  })
  it('provides readable feedback while sound or a study is waiting to start', async () => {
    const { engine } = fixture()
    const enabling = engine.enable()
    expect(audioStatus(engine.getSnapshot())).toBe('Enabling sound\u2026')
    await enabling
    const starting = engine.play('echo')
    expect(audioStatus(engine.getSnapshot())).toBe('Starting ECHO\u2026')
    await starting
    engine.dispose()
  })
  it('exposes native playhead time without creating a context and meters near 30 Hz',async()=>{
    const {engine,context,factory}=fixture()
    expect(engine.getPlayheadTime()).toBe(0);expect(factory).not.toHaveBeenCalled()
    await engine.play('form')
    context.currentTime=1.025;expect(engine.getPlayheadTime()).toBeCloseTo(1)
    const listener=vi.fn(),unsubscribe=engine.subscribeMeter(listener)
    const raf=vi.mocked(requestAnimationFrame)
    for(let now=1000;now<=2000;now+=25){const callback=raf.mock.calls.at(-1)![0];callback(now)}
    expect(listener.mock.calls.length-1).toBeGreaterThanOrEqual(29);expect(listener.mock.calls.length-1).toBeLessThanOrEqual(32)
    engine.stop();expect(engine.getPlayheadTime()).toBeCloseTo(1)
    unsubscribe();engine.dispose()
  })
})

