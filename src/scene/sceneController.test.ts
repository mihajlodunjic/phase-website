import { describe,expect,it } from 'vitest'
import { Quaternion } from 'three'
import { createSceneController,damp,IDLE_PERIOD,WAVE_PERIOD,mapScenePose,MAX_TILT,MAX_TENSION,MAX_TWIST,neutralPose } from './sceneController'
import { createAudioEnergy } from '../audio/types'
const input={pointerX:0,pointerY:0,scroll:0},running={motion:true,active:true,compact:false}
describe('resonance scene controller',()=>{
 it('bounds combined orientation and independent audio channels across full cycles',()=>{
  for(let time=0;time<IDLE_PERIOD*2;time+=.13){const pose=mapScenePose({pointerX:100,pointerY:-100,scroll:50,audio:{...createAudioEnergy(),playing:true,bass:100,mid:100,high:100}},time,true,neutralPose());expect(Math.hypot(pose.x,pose.y,pose.z)).toBeLessThanOrEqual(MAX_TILT+1e-10);expect(pose.tension).toBe(MAX_TENSION);expect(pose.twist).toBe(MAX_TWIST);expect(pose.shine).toBeCloseTo(1.18);expect(pose.scale).toBeCloseTo(.955)}
 })
 it('has a composed stationary state for every reduced-motion input',()=>{
  const controller=createSceneController({pointerX:1,pointerY:1,scroll:1});controller.step(.05,running);controller.step(.05,{...running,motion:false});expect(controller.pose).toEqual(neutralPose());expect(controller.orientation.equals(new Quaternion())).toBe(true)
 })
 it('makes a complete surface wave in eight seconds and reduces phone budgets',()=>{
  const a=mapScenePose(input,0,true,neutralPose()),b=mapScenePose(input,WAVE_PERIOD,true,neutralPose()),phone=mapScenePose(input,3,true,neutralPose(),true),desktop=mapScenePose(input,3,true,neutralPose())
  expect(b.phase-a.phase).toBeCloseTo(Math.PI*2);expect(phone.wave).toBeLessThan(desktop.wave);expect(Math.abs(phone.y)).toBeLessThan(Math.abs(desktop.y));expect(Math.abs(desktop.y)).toBeGreaterThan(.1)
 })
 it('freezes while hidden and clamps a resumed timestep',()=>{
  const controller=createSceneController(input);controller.step(.05,running);const before={...controller.pose},time=controller.time;controller.step(20,{...running,active:false});expect(controller.pose).toEqual(before);expect(controller.time).toBe(time)
  const second=createSceneController(input);second.step(60,running);expect(second.time).toBe(.05)
 })
 it('smooths audio attack and release instead of following FFT discontinuities',()=>{
  const audio={...createAudioEnergy(),playing:true,bass:1,mid:1,high:1},controller=createSceneController({...input,audio});controller.step(.016,running)
  expect(controller.pose.tension).toBeGreaterThan(0);expect(controller.pose.tension).toBeLessThan(MAX_TENSION);const peak=controller.pose.tension;audio.playing=false;controller.step(.016,running);expect(controller.pose.tension).toBeLessThan(peak);expect(controller.pose.tension).toBeGreaterThan(0)
 })
 it('damps consistently and keeps malformed input finite',()=>{
  let slow=0,fast=0;for(let i=0;i<30;i++)slow=damp(slow,1,1/30);for(let i=0;i<120;i++)fast=damp(fast,1,1/120);expect(slow).toBeCloseTo(fast,8)
  expect(Object.values(mapScenePose({pointerX:NaN,pointerY:Infinity,scroll:NaN},Infinity,true,neutralPose())).every(Number.isFinite)).toBe(true)
 })
 it('settles as a normalized bounded quaternion',()=>{
  const controller=createSceneController({pointerX:100,pointerY:-100,scroll:1});for(let i=0;i<360;i++){controller.step(1/60,running);expect(controller.orientation.length()).toBeCloseTo(1,8);expect(controller.orientation.angleTo(new Quaternion())).toBeLessThan(MAX_TILT+.001)}
 })
})
