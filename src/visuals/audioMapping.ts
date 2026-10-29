import { clampAudio } from '../audio/types'
import type { AudioEnergy } from '../audio/types'
import type { StudyId } from '../data/content'
import type { StudyMotion } from './studyMotion'
import { echoSignal } from './studyMotion'
export function audioMatches(kind:StudyId,energy:AudioEnergy){return energy.playing&&(energy.study===kind||kind==='form'&&energy.study==='phase')}
export function mapAudioStudy(kind:StudyId,energy:AudioEnergy,out:StudyMotion){
  out.compression=kind==='form'?clampAudio(energy.bass)*.06:0
  out.drift=kind==='afterimage'?clampAudio(energy.bass)*4:0
  out.wave=kind==='afterimage'?clampAudio(energy.mid)*.55:0
  out.signal=kind==='echo'?echoSignal(energy.elapsed):0
  return out
}
