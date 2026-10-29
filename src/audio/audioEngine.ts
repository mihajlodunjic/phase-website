import { createAudioGraph, rampParameter } from './audioGraph'
import type { AudioGraph } from './audioGraph'
import { createSynthVoice } from './synth'
import type { SynthVoice } from './synth'
import { AUDIO_STUDIES } from './studies'
import { readSpectrum } from './spectrum'
import { clampAudio, createAudioEnergy } from './types'
import type { AudioId, AudioSnapshot, StopReason } from './types'

type Options = {
  createContext?: () => AudioContext
  createVoice?: typeof createSynthVoice
  isHidden?: () => boolean
}
const FADE_SECONDS = 0.045

export class AudioEngine {
  readonly energy = createAudioEnergy()
  readonly stats = { contexts: 0, voices: 0, maxVoices: 0, nodes: 0, maxPeak: 0 }
  private snapshot: AudioSnapshot
  private context: AudioContext | null = null
  private graph: AudioGraph | null = null
  private voice: SynthVoice | null = null
  private retiring: SynthVoice | null = null
  private owned = new Set<SynthVoice>()
  private operation = 0
  private disposed = false
  private refs = 0
  private mountVersion = 0
  private silence: Promise<void> = Promise.resolve()
  private suspension: Promise<void> | null = null
  private retireTimer: ReturnType<typeof setTimeout> | null = null
  private retireResolve: (() => void) | null = null
  private frame = 0
  private lastMeter = 0
  private frequencies = new Float32Array(1024)
  private waveform = new Float32Array(2048)
  private listeners = new Set<() => void>()
  private meterListeners = new Set<() => void>()
  private factory: () => AudioContext
  private buildVoice: typeof createSynthVoice
  private hidden: () => boolean

  constructor(options: Options = {}) {
    const native = typeof window === 'undefined' ? undefined : window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    this.factory = options.createContext || (() => { if (!native) throw new Error('Web Audio unavailable'); return new native({ latencyHint: 'interactive' }) })
    this.buildVoice = options.createVoice || createSynthVoice
    this.hidden = options.isHidden || (() => document.hidden)
    this.snapshot = { supported: Boolean(options.createContext || native), enabled: false, status: 'off', activeId: null, lastId: null, volume: 0.2, position: 0, reason: null, error: null }
  }

  getSnapshot = () => this.snapshot
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener) } }
  subscribeMeter = (listener: () => void) => { this.meterListeners.add(listener); listener(); return () => { this.meterListeners.delete(listener) } }
  private commit(patch: Partial<AudioSnapshot>) { this.snapshot = { ...this.snapshot, ...patch }; this.listeners.forEach(listener => listener()) }
  private resetEnergy() { Object.assign(this.energy, createAudioEnergy()); this.meterListeners.forEach(listener => listener()) }

  /** Strict Mode's setup/cleanup probe never creates or closes a context. */
  attach() {
    this.refs++; this.mountVersion++
    if (this.refs === 1) { document.addEventListener('visibilitychange', this.visibility); window.addEventListener('pagehide', this.pageHide) }
    let detached = false
    return () => {
      if (detached) return
      detached = true
      if (--this.refs !== 0) return
      document.removeEventListener('visibilitychange', this.visibility)
      window.removeEventListener('pagehide', this.pageHide)
      this.stop('unmount')
      const version = ++this.mountVersion
      void this.silence.then(() => { if (!this.refs && this.mountVersion === version) this.dispose() })
    }
  }
  private visibility = () => { if (this.hidden()) this.stop('hidden') }
  private pageHide = (event: PageTransitionEvent) => { if (event.persisted) this.stop('hidden'); else this.dispose() }
  private contextState = () => {
    if (this.voice && this.context?.state !== 'running') this.stop('interrupted')
    else if (this.context?.state === 'running' && (this.snapshot.status === 'stopped' || !this.snapshot.enabled)) this.suspendWhenQuiet(this.operation)
  }

  private ensureRunning() {
    // Called synchronously from enable/play, before awaiting any fade or promise.
    if (!this.context) {
      this.context = this.factory()
      this.stats.contexts++
      this.graph = createAudioGraph(this.context, this.snapshot.volume)
      this.stats.nodes += this.graph.nodes.length
      this.context.addEventListener('statechange', this.contextState)
    }
    const context = this.context
    const resume = () => context.resume()
    return this.suspension ? this.suspension.then(resume) : resume()
  }
  private async readyWithDeadline(ready: Promise<void>, quiet: Promise<void>) {
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      await Promise.race([
        Promise.all([ready, quiet]),
        new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('Audio resume timeout')), 6000) }),
      ])
    } finally { if (timer) clearTimeout(timer) }
  }

  async enable() {
    if (this.disposed || !this.snapshot.supported || this.hidden()) return
    if (this.snapshot.enabled) return
    const operation = ++this.operation
    this.commit({ enabled: true, status: 'starting', activeId: null, error: null, reason: null })
    try {
      await this.readyWithDeadline(this.ensureRunning(), this.silence)
      if (operation !== this.operation || this.disposed || this.hidden()) return
      this.commit({ status: 'ready' })
    } catch { this.fail(operation) }
  }

  async play(id: AudioId) {
    if (this.disposed || !this.snapshot.supported || this.hidden()) return
    const operation = ++this.operation
    const quiet = this.releaseVoice()
    this.cancelMeter(); this.resetEnergy()
    this.commit({ enabled: true, status: 'starting', activeId: id, lastId: id, position: 0, reason: null, error: null })
    try {
      await this.readyWithDeadline(this.ensureRunning(), quiet)
      if (operation !== this.operation || this.disposed || this.hidden() || !this.snapshot.enabled) return
      const context = this.context!
      if (context.state !== 'running') throw new Error('Audio context not running')
      const voice = this.buildVoice(context, id, context.currentTime + 0.025, this.graph!.input, () => {
        if (this.voice === voice) this.finish(voice)
      })
      this.voice = voice; this.owned.add(voice)
      this.stats.voices++; this.stats.nodes += voice.nodeCount
      this.stats.maxVoices = Math.max(this.stats.maxVoices, this.stats.voices)
      this.energy.playing = true; this.energy.study = id
      this.commit({ status: 'playing' })
      this.frame = requestAnimationFrame(this.meter)
    } catch { this.fail(operation) }
  }

  stop(reason: StopReason = 'manual') {
    if (this.disposed) return
    const operation = ++this.operation
    const position = this.voice && this.context ? clampAudio(this.context.currentTime - this.voice.startedAt, 0, this.voice.duration) : this.snapshot.position
    const quiet = this.releaseVoice()
    this.cancelMeter(); this.resetEnergy()
    if (this.snapshot.enabled || this.snapshot.status !== 'off') this.commit({ status: 'stopped', activeId: null, position, reason, error: null })
    void quiet.then(() => this.suspendWhenQuiet(operation))
  }
  disable() {
    this.stop('disabled')
    this.commit({ enabled: false, status: 'off', activeId: null, error: null })
  }
  setVolume(value: number) {
    const volume = clampAudio(value)
    if (this.graph && this.context) rampParameter(this.graph.volume.gain, volume, this.context.currentTime)
    this.commit({ volume })
  }

  private disposeVoice(voice: SynthVoice) {
    if (!this.owned.delete(voice)) return
    this.stats.voices--; this.stats.nodes -= voice.nodeCount
    voice.dispose()
  }
  private releaseVoice() {
    if (!this.voice) return this.silence
    const old = this.voice
    this.voice = null; this.retiring = old
    try { old.fadeOut(this.context!.currentTime, FADE_SECONDS) } catch { /* interrupted context is still disconnected below */ }
    this.silence = new Promise<void>(resolve => {
      this.retireResolve = resolve
      this.retireTimer = setTimeout(() => {
        this.retireTimer = null; this.retireResolve = null
        this.disposeVoice(old); this.retiring = null
        this.commit({})
        resolve()
      }, FADE_SECONDS * 1000 + 5)
    })
    return this.silence
  }
  private finish(voice: SynthVoice) {
    this.voice = null
    const operation = ++this.operation
    this.disposeVoice(voice); this.cancelMeter(); this.resetEnergy()
    this.commit({ status: 'stopped', activeId: null, position: voice.duration, reason: 'ended' })
    this.suspendWhenQuiet(operation)
  }
  private suspendWhenQuiet(operation: number) {
    if (this.disposed || operation !== this.operation || this.voice || this.context?.state !== 'running') return
    const pending = this.context.suspend().catch(() => {})
    this.suspension = pending
    void pending.then(() => { if (this.suspension === pending) this.suspension = null })
  }
  private fail(operation: number) {
    if (operation !== this.operation || this.disposed) return
    const next = ++this.operation
    const quiet = this.releaseVoice()
    this.cancelMeter(); this.resetEnergy()
    this.commit({ enabled: false, status: 'error', activeId: null, error: 'Sound could not start. Press Play to try again.' })
    void quiet.then(() => this.suspendWhenQuiet(next))
  }

  private meter = (now: number) => {
    this.frame = 0
    const voice = this.voice
    if (!voice || !this.context || !this.graph || this.snapshot.status !== 'playing') return
    if (now - this.lastMeter >= 1000 / 30) {
      this.lastMeter = now
      this.graph.analyser.getFloatFrequencyData(this.frequencies)
      this.graph.analyser.getFloatTimeDomainData(this.waveform)
      readSpectrum(this.frequencies, this.waveform, this.context.sampleRate, this.graph.analyser.fftSize, this.energy)
      this.energy.elapsed = clampAudio(this.context.currentTime - voice.startedAt, 0, voice.duration)
      this.energy.progress = this.energy.elapsed / voice.duration
      this.stats.maxPeak = Math.max(this.stats.maxPeak, this.energy.peak)
      this.meterListeners.forEach(listener => listener())
    }
    this.frame = requestAnimationFrame(this.meter)
  }
  private cancelMeter() { cancelAnimationFrame(this.frame); this.frame = 0; this.lastMeter = 0 }

  dispose() {
    if (this.disposed) return
    this.disposed = true; ++this.operation
    this.cancelMeter(); this.resetEnergy()
    if (this.retireTimer) clearTimeout(this.retireTimer)
    if (this.voice) this.disposeVoice(this.voice)
    if (this.retiring) this.disposeVoice(this.retiring)
    this.voice = null; this.retiring = null; this.retireResolve?.(); this.retireResolve = null
    document.removeEventListener('visibilitychange', this.visibility)
    window.removeEventListener('pagehide', this.pageHide)
    this.context?.removeEventListener('statechange', this.contextState)
    this.graph?.dispose(); this.stats.nodes = 0
    if (this.context && this.context.state !== 'closed') void this.context.close().catch(() => {})
    this.listeners.clear(); this.meterListeners.clear()
  }
}

export function audioStatus(snapshot: AudioSnapshot) {
  const name = snapshot.activeId ? AUDIO_STUDIES[snapshot.activeId].name : snapshot.lastId ? AUDIO_STUDIES[snapshot.lastId].name : ''
  if (!snapshot.supported) return 'Audio is unavailable in this browser.'
  if (snapshot.status === 'error') return snapshot.error!
  if (snapshot.status === 'off') return 'Sound off.'
  if (snapshot.status === 'starting') return name ? `Starting ${name}\u2026` : 'Enabling sound\u2026'
  if (snapshot.status === 'playing') return `Playing ${name}.`
  if (snapshot.status === 'ready') return 'Sound enabled. Choose a study.'
  if (snapshot.reason === 'hidden') return 'Stopped while this tab was hidden. Press Play to start again.'
  if (snapshot.reason === 'interrupted') return 'Playback was interrupted. Press Play to start again.'
  if (snapshot.reason === 'ended') return `${name} finished.`
  return name ? `${name} stopped.` : 'Not playing.'
}


