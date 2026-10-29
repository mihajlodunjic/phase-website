import { ECHO_EVENTS, FORM_EVENTS } from './events'
import type { AudioId } from './types'
export const AUDIO_STUDIES: Record<AudioId, { name: string; duration: number }> = {
  phase: { name: 'PHASE', duration: 4 }, form: { name: 'FORM', duration: 8 },
  echo: { name: 'ECHO', duration: 9 }, afterimage: { name: 'AFTERIMAGE', duration: 12 },
}
export type Tone = { at: number; duration: number; frequency: number; endFrequency?: number; amplitude: number; attack: number; wave: 'sine' | 'triangle' | 'modal' }

export function tonesFor(id: AudioId): Tone[] {
  if (id === 'echo') return ECHO_EVENTS.flatMap(({frequency,at},index)=>[
    {at,duration:.16,frequency,endFrequency:frequency*(index%2?.89:1.125),amplitude:.12,attack:.007,wave:'sine' as const},
    {at:at+.075,duration:.13,frequency:frequency*1.5,amplitude:.045,attack:.006,wave:'sine' as const},
  ])
  if (id === 'afterimage') return [98, 146.832, 195.998, 220].flatMap((frequency, index) => [-1, 1].map(direction => ({
    at: 0.05 + index * 0.08, duration: 10.9 - index * 0.1,
    frequency: frequency * Math.pow(2, direction * (3 + index) / 1200),
    amplitude: 0.035, attack: 1.3 + index * 0.2, wave: 'sine' as const,
  })))
  const signature: Tone[] = FORM_EVENTS.slice(0,3).map(event=>({...event,wave:'modal'}))
  if(id==='phase')return [...signature,{at:1.35,duration:2.25,frequency:130.8128,amplitude:.055,attack:.04,wave:'sine'}]
  return [...signature,{at:2.7,duration:2.4,frequency:65.4064,amplitude:.075,attack:.08,wave:'sine'},...FORM_EVENTS.slice(3).map(event=>({...event,wave:'modal' as const}))]
}
