import { describe,expect,it } from 'vitest'
import { echoSignal,mapStudyMotion,studyDuration } from './studyMotion'
import { formLayerImpulse,afterimagePoint } from './gpu/studyFields'
import { ECHO_EVENTS } from '../audio/events'
import { tonesFor } from '../audio/studies'
import { processPoint } from './processGeometry'
const pose=()=>({compression:0,signal:0,drift:0,wave:0})
describe('procedural motion choreography',()=>{
 it('passes FORM through layers and settles without collapsing the outline',()=>{
  expect(formLayerImpulse(.2,0,false)).toBeGreaterThan(.3);expect(formLayerImpulse(.2,8,false)).toBe(0)
  expect(formLayerImpulse(.96,8,false)).toBeGreaterThan(.4)
  for(let time=0;time<8;time+=.025)for(let layer=0;layer<9;layer++){const pulse=formLayerImpulse(time,layer,true);expect(pulse).toBeGreaterThanOrEqual(0);expect(pulse).toBeLessThanOrEqual(1)}
  expect(formLayerImpulse(4.2,8,false)).toBeLessThan(.001)
  for(let t=0;t<4.2;t+=.03)expect(mapStudyMotion('form',t,true,pose()).compression).toBeLessThanOrEqual(.07)
 })
 it('uses the same ECHO arrivals as the oscillator score',()=>{
  const tones=tonesFor('echo')
  ECHO_EVENTS.forEach((event,index)=>{expect(tones[index*2].at).toBe(event.at);expect(echoSignal(event.at)).toBe(index)})
  expect(echoSignal(.65)).toBeGreaterThan(0);expect(echoSignal(.65)).toBeLessThan(1)
 })
 it('deforms AFTERIMAGE locally, sampling its own earlier state for history',()=>{
  const a=afterimagePoint(-1,2,.8,1,0,0,[0,0,0]),b=afterimagePoint(-1,2,2.8,1,0,0,[0,0,0]);expect(Math.abs(a[2]-b[2])).toBeGreaterThan(.15)
  const history=afterimagePoint(-1,2,2.8-.55,1,0,0,[0,0,0]);expect(history).toEqual(afterimagePoint(-1,2,2.25,1,0,0,[0,0,0]));expect(history).not.toEqual(b)
 })
 it('has finite sequences and clamps malformed visual targets',()=>{
  for(const kind of ['form','echo','afterimage'] as const){expect(studyDuration(kind)).toBeGreaterThan(0);expect(Object.values(mapStudyMotion(kind,NaN,true,pose())).every(Number.isFinite)).toBe(true)}
  expect(echoSignal(9)).toBe(7)
 })
 it('morphs the same strips from rhythms to an open then closed loop',()=>{
  const listen=processPoint(0,2,.4,0,false,[0,0]),shape=processPoint(1,2,.4,0,false,[0,0]),refine=processPoint(2,2,.4,0,false,[0,0]);expect(listen).not.toEqual(shape);expect(shape).not.toEqual(refine)
  for(let i=0;i<5;i++){const a=processPoint(2,i,0,0,false,[0,0]),b=processPoint(2,i,1,0,false,[0,0]);a.forEach((value,j)=>expect(value).toBeCloseTo(b[j],8));const open=processPoint(1,i,0,0,false,[0,0]),end=processPoint(1,i,1,0,false,[0,0]);expect(Math.hypot(open[0]-end[0],open[1]-end[1])).toBeGreaterThan(60)}
 })
 it('is continuous through Shape and keeps static choices stable',()=>{
  const a=processPoint(.999,3,.5,0,false,[0,0]),b=processPoint(1.001,3,.5,0,false,[0,0]);expect(Math.hypot(a[0]-b[0],a[1]-b[1])).toBeLessThan(2)
  expect(processPoint(0,2,.5,0,false,[0,0])).toEqual(processPoint(0,2,.5,10,false,[0,0]))
 })
})
