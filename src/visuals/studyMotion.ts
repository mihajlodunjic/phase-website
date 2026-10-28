import type { StudyId } from '../data/content'

const TAU = Math.PI * 2
const durations: Record<StudyId, number> = { form: 2.8, echo: 5.6, afterimage: 6.4 }
export const studyDuration = (kind: StudyId) => durations[kind]
export const bounded = (value: number, low = 0, high = 1) => Math.max(low, Math.min(high, Number.isFinite(value) ? value : low))

export type StudyMotion = { compression: number; signal: number; drift: number; wave: number }
/** Pure visual targets. No audio state, fake analyser or playback side effects. */
export function mapStudyMotion(kind: StudyId, elapsed: number, sequence: boolean, out: StudyMotion): StudyMotion {
  const time = bounded(elapsed, 0, 1e6)
  const progress = bounded(time / durations[kind])
  const phase = sequence ? progress * TAU : time * TAU / 18
  out.compression = kind === 'form' ? (sequence ? Math.sin(progress * Math.PI) ** 6 : (Math.sin(phase) + 1) * 0.025) : 0
  out.signal = sequence ? progress * 7 : (time % 8) / 8 * 7
  out.drift = Math.sin(phase) * (sequence ? 8 : 3)
  out.wave = Math.sin(phase - 0.5) * (sequence ? 1 : 0.25)
  return out
}

export function processRingPose(step: number, index: number, count: number) {
  const state = bounded(step, 0, 2)
  const loose = Math.max(0, 1 - state)
  const gather = Math.max(0, state - 1)
  return {
    x: Math.sin(index * 2.1) * 24 * loose,
    y: Math.cos(index * 1.7) * 18 * loose,
    scale: 1 - gather * (0.15 + (count - index - 1) / Math.max(1, count - 1) * 0.48),
  }
}
