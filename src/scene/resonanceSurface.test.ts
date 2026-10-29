import { describe,expect,it } from 'vitest'
import { sampleResonance } from './resonanceSurface'
const TAU=Math.PI*2
const sample=(u:number,v:number,phase:number,wave=1)=>sampleResonance(u,v,phase,wave,0,0,[0,0,0])
describe('periodic resonance ribbon',()=>{
 it('joins both periodic seams with matching positions at all wave phases',()=>{
  for(const phase of [0,1,3,5.9])for(let v=0;v<=TAU;v+=.3){const a=sample(0,v,phase),b=sample(TAU,v,phase);a.forEach((value,i)=>expect(value).toBeCloseTo(b[i],8))}
  for(let u=0;u<TAU;u+=.3){const a=sample(u,0,2),b=sample(u,TAU,2);a.forEach((value,i)=>expect(value).toBeCloseTo(b[i],8))}
 })
 it('has a substantial surface change within two seconds and repeats without a snap',()=>{
  let squares=0,count=0
  for(let u=0;u<TAU;u+=.2)for(let v=0;v<TAU;v+=.6){const a=sample(u,v,0),b=sample(u,v,Math.PI/2),c=sample(u,v,TAU);for(let i=0;i<3;i++){squares+=(a[i]-b[i])**2;count++;expect(a[i]).toBeCloseTo(c[i],8)}}
  expect(Math.sqrt(squares/count)).toBeGreaterThan(.1)
 })
 it('keeps the aperture open and derivatives finite at saturated audio budgets',()=>{
  const p=[0,0,0],a=[0,0,0],b=[0,0,0],c=[0,0,0],d=[0,0,0]
  for(let phase=0;phase<TAU;phase+=.8)for(let u=0;u<TAU;u+=.3)for(let v=0;v<TAU;v+=.5){
   sampleResonance(u,v,phase,1,.5,.32,p);expect(p.every(Number.isFinite)).toBe(true);expect(Math.hypot(p[0],p[1])).toBeGreaterThan(.6);expect(Math.hypot(...p)).toBeLessThan(2.7)
   sampleResonance(u+.0004,v,phase,1,.5,.32,a);sampleResonance(u-.0004,v,phase,1,.5,.32,b);sampleResonance(u,v+.0004,phase,1,.5,.32,c);sampleResonance(u,v-.0004,phase,1,.5,.32,d)
   const ux=(a[0]-b[0])/.0008,uy=(a[1]-b[1])/.0008,uz=(a[2]-b[2])/.0008,vx=(c[0]-d[0])/.0008,vy=(c[1]-d[1])/.0008,vz=(c[2]-d[2])/.0008
   expect(Math.hypot(uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx)).toBeGreaterThan(.04)
  }
 })
 it('keeps the static pose independent of animation time',()=>{expect(sample(1,2,0,0)).toEqual(sample(1,2,4,0))})
})
