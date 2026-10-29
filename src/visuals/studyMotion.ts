import type { StudyId } from '../data/content'
import { ECHO_EVENTS } from '../audio/events'
export const bounded=(value:number,low=0,high=1)=>Math.max(low,Math.min(high,Number.isFinite(value)?value:low))
const durations:Record<StudyId,number>={form:4.2,echo:9,afterimage:8}
export const studyDuration=(kind:StudyId)=>durations[kind]
export type StudyMotion={compression:number;signal:number;drift:number;wave:number}
export function echoSignal(time:number){
  if(time<ECHO_EVENTS[0].at)return 0
  for(let i=1;i<ECHO_EVENTS.length;i++)if(time<ECHO_EVENTS[i].at)return i-1+bounded((time-ECHO_EVENTS[i-1].at)/(ECHO_EVENTS[i].at-ECHO_EVENTS[i-1].at))
  return 7
}
export function mapStudyMotion(kind:StudyId,elapsed:number,sequence:boolean,out:StudyMotion){
  const time=bounded(elapsed,0,1e6),t=sequence?Math.min(time,durations[kind]):time%durations[kind]
  out.compression=kind==='form'?Math.exp(-Math.pow((t-.9)/.38,2))*.07:0
  out.signal=echoSignal(t);out.drift=Math.sin(t*.65)*3;out.wave=Math.sin(t*.8)*.35
  return out
}
