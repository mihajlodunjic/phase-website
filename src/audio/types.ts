import type { StudyId } from '../data/content'
export type AudioId = StudyId | 'phase'
export type AudioStatus = 'off' | 'ready' | 'starting' | 'playing' | 'stopped' | 'error'
export type StopReason = 'manual' | 'ended' | 'hidden' | 'disabled' | 'selection' | 'interrupted' | 'brief' | 'unmount'
export type AudioSnapshot = {
  supported: boolean; enabled: boolean; status: AudioStatus; activeId: AudioId | null
  lastId: AudioId | null; volume: number; position: number; reason: StopReason | null; error: string | null
}
export type AudioEnergy = {
  playing: boolean; study: AudioId | null; bass: number; mid: number; high: number
  level: number; rms: number; peak: number; elapsed: number; progress: number
}
export const createAudioEnergy = (): AudioEnergy => ({ playing: false, study: null, bass: 0, mid: 0, high: 0, level: 0, rms: 0, peak: 0, elapsed: 0, progress: 0 })
export const clampAudio = (value: number, low = 0, high = 1) => Math.min(high, Math.max(low, Number.isFinite(value) ? value : low))
