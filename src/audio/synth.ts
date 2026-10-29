import { AUDIO_STUDIES, tonesFor } from './studies'
import type { AudioId } from './types'
import { rampParameter } from './audioGraph'

export type SynthVoice = {
  id: AudioId; duration: number; startedAt: number; endsAt: number; nodeCount: number
  fadeOut: (now: number, seconds: number) => void; dispose: () => void
}

/** Entirely generated oscillators / buffers. No media loader or microphone. */
export function createSynthVoice(context: BaseAudioContext, id: AudioId, startedAt: number, destination: AudioNode, onEnded: () => void): SynthVoice {
  const duration = AUDIO_STUDIES[id].duration
  const endsAt = startedAt + duration
  const nodes: AudioNode[] = []
  const sources: AudioScheduledSourceNode[] = []
  const own = <T extends AudioNode>(node: T): T => { nodes.push(node); return node }
  const source = <T extends AudioScheduledSourceNode>(node: T): T => { own(node); sources.push(node); return node }
  const output = own(context.createGain())
  output.gain.setValueAtTime(0, startedAt)
  output.gain.linearRampToValueAtTime(0.85, startedAt + 0.012)
  output.gain.setValueAtTime(0.85, endsAt - 0.18)
  output.gain.linearRampToValueAtTime(0, endsAt)
  output.connect(destination)
  let instrument: AudioNode = output
  if (id === 'afterimage') {
    const filter = own(context.createBiquadFilter())
    filter.type = 'lowpass'
    filter.Q.value = 0.6
    filter.frequency.setValueAtTime(600, startedAt)
    filter.frequency.linearRampToValueAtTime(1800, startedAt + 5)
    filter.frequency.linearRampToValueAtTime(500, endsAt - 0.8)
    const dry = own(context.createGain()); dry.gain.value = 0.8
    filter.connect(dry).connect(output)
    const delay = own(context.createDelay(1)); delay.delayTime.value = 0.31
    const feedback = own(context.createGain()); feedback.gain.value = 0.22
    const wet = own(context.createGain()); wet.gain.value = 0.22
    filter.connect(delay); delay.connect(feedback).connect(delay); delay.connect(wet).connect(output)
    instrument = filter
  }
  const modal = context.createPeriodicWave(new Float32Array(5), new Float32Array([0, 1, 0.25, 0.1, 0.025]))
  for (const tone of tonesFor(id)) {
    const start = startedAt + tone.at
    const end = start + tone.duration
    const oscillator = source(context.createOscillator())
    const gain = own(context.createGain())
    if (tone.wave === 'modal') oscillator.setPeriodicWave(modal)
    else oscillator.type = tone.wave
    oscillator.frequency.setValueAtTime(tone.frequency, start)
    if (tone.endFrequency) oscillator.frequency.exponentialRampToValueAtTime(tone.endFrequency, end)
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(tone.amplitude, start + tone.attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, end - 0.02)
    gain.gain.linearRampToValueAtTime(0, end)
    oscillator.connect(gain).connect(instrument)
    oscillator.start(start); oscillator.stop(end + 0.01)
  }
  const noise = (at: number, length: number, amplitude: number, cutoff: number, atmospheric = false) => {
    const count = Math.ceil(context.sampleRate * (atmospheric ? 2 : length))
    const buffer = context.createBuffer(1, count, context.sampleRate)
    const samples = buffer.getChannelData(0)
    let seed = 9137 + Math.floor(at * 1000)
    for (let i = 0; i < count; i++) { seed = (Math.imul(seed, 1664525) + 1013904223) | 0; samples[i] = (seed >>> 0) / 2147483648 - 1 }
    const generator = source(context.createBufferSource()); generator.buffer = buffer; generator.loop = atmospheric
    const filter = own(context.createBiquadFilter()); filter.type = atmospheric ? 'lowpass' : 'bandpass'; filter.frequency.value = cutoff; filter.Q.value = 0.6
    const gain = own(context.createGain())
    const start = startedAt + at, end = start + length
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(amplitude, start + (atmospheric ? 1.8 : 0.004))
    gain.gain.exponentialRampToValueAtTime(0.0001, end - 0.015)
    gain.gain.linearRampToValueAtTime(0, end)
    generator.connect(filter).connect(gain).connect(instrument)
    generator.start(start); generator.stop(end)
  }
  if (id === 'echo') [0.18, 1.08, 1.98, 3.08, 4.18, 5.38, 6.58, 7.68].forEach(at => noise(at, 0.04, 0.025, 4300))
  if (id === 'afterimage') noise(0.1, 10.7, 0.018, 1200, true)
  // Silent scheduled completion includes the delay tail and runs on audio time.
  const completion = source(context.createConstantSource()); completion.offset.value = 0
  completion.connect(output); completion.onended = onEnded
  completion.start(startedAt); completion.stop(endsAt)
  let disposed = false
  return {
    id, duration, startedAt, endsAt, nodeCount: nodes.length,
    fadeOut(now, seconds) {
      rampParameter(output.gain, 0, now, seconds)
      for (const node of sources) { try { node.stop(now + seconds) } catch { /* already ended */ } }
    },
    dispose() {
      if (disposed) return
      disposed = true
      for (const node of sources) { node.onended = null; try { node.stop(context.currentTime) } catch { /* already ended */ } }
      for (const node of nodes) node.disconnect()
      sources.length = 0; nodes.length = 0
    },
  }
}
