import { clampAudio } from '../audio/types'
import type { AudioEnergy } from '../audio/types'
import type { StudyId } from '../data/content'
import type { StudyMotion } from './studyMotion'

const echoOnsets = [0.2, 1.1, 2, 3.1, 4.2, 5.4, 6.6, 7.7]
export function audioMatches(kind: StudyId, energy: AudioEnergy) {
  return energy.playing && (energy.study === kind || kind === 'form' && energy.study === 'phase')
}
export function mapAudioStudy(kind: StudyId, energy: AudioEnergy, out: StudyMotion) {
  const bass = clampAudio(energy.bass), mid = clampAudio(energy.mid), level = clampAudio(energy.level)
  out.compression = kind === 'form' ? clampAudio(bass * 0.6 + level * 0.12, 0, 0.65) : 0
  out.drift = kind === 'afterimage' ? bass * 6 : 0
  out.wave = kind === 'afterimage' ? mid * 0.7 : 0
  out.signal = 0
  if (kind === 'echo') {
    out.signal = 7
    for (let i = 1; i < echoOnsets.length; i++) {
      if (energy.elapsed <= echoOnsets[i]) {
        out.signal = i - 1 + clampAudio((energy.elapsed - echoOnsets[i - 1]) / (echoOnsets[i] - echoOnsets[i - 1]))
        break
      }
    }
  }
  return out
}
