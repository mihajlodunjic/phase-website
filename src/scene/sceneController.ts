import { Euler, Quaternion } from 'three'
import type { AudioEnergy } from '../audio/types'

export const MAX_TILT = 12 * Math.PI / 180
export const IDLE_PERIOD = 16
export const WAVE_PERIOD = 8
export const MAX_TENSION = 0.5
export const MAX_TWIST = 0.32
const TAU = Math.PI * 2
export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : 0))
export type SceneInputs = { pointerX: number; pointerY: number; scroll: number; audio?: AudioEnergy }
export type ScenePose = { x: number; y: number; z: number; lift: number; retreat: number; scale: number; phase: number; wave: number; tension: number; twist: number; shine: number }
export type SceneOptions = { motion: boolean; active: boolean; compact: boolean }
export const neutralPose = (): ScenePose => ({ x: 0, y: 0, z: 0, lift: 0, retreat: 0, scale: 1, phase: 0, wave: 0, tension: 0, twist: 0, shine: 1 })
export function mapScenePose(input: SceneInputs, time: number, motion: boolean, out: ScenePose, compact = false): ScenePose {
  if (!motion) return Object.assign(out, neutralPose())
  const seconds = clamp(time, 0, Number.MAX_SAFE_INTEGER)
  const cycle = seconds * TAU / IDLE_PERIOD
  const intensity = compact ? 0.72 : 1
  const pointerLimit = compact ? 0.025 : 0.06
  const scroll = clamp(input.scroll, 0, 1)
  out.x = -clamp(input.pointerY,-1,1)*pointerLimit + Math.sin(cycle)*0.075*intensity
  out.y = clamp(input.pointerX,-1,1)*pointerLimit + Math.sin(cycle+0.9)*0.14*intensity
  out.z = Math.sin(cycle-0.4)*0.045*intensity
  const tilt = Math.hypot(out.x,out.y,out.z)
  if (tilt > MAX_TILT) { const ratio = MAX_TILT/tilt; out.x*=ratio; out.y*=ratio; out.z*=ratio }
  out.lift = scroll*(compact?0.1:0.18); out.retreat = -scroll*(compact?0.22:0.5); out.scale = 1-scroll*(compact?0.025:0.045)
  out.phase = seconds*TAU/WAVE_PERIOD
  out.wave = compact ? 0.82 : 1
  const audio = input.audio
  out.tension = audio?.playing ? clamp(audio.bass,0,1)*MAX_TENSION : 0
  out.twist = audio?.playing ? clamp(audio.mid,0,1)*MAX_TWIST : 0
  out.shine = 1+(audio?.playing ? clamp(audio.high,0,1)*0.18 : 0)
  return out
}
export function damp(current: number, target: number, delta: number, rate = 5) { return current+(target-current)*(1-Math.exp(-rate*clamp(delta,0,0.05))) }
export function createSceneController(inputs: SceneInputs) {
  const pose=neutralPose(), target=neutralPose(), orientation=new Quaternion(), targetOrientation=new Quaternion(), identity=new Quaternion(), euler=new Euler()
  let time=0
  return { inputs, pose, orientation, get time(){return time}, step(rawDelta: number, {motion,active,compact}: SceneOptions){
    if(!motion){Object.assign(pose,neutralPose());orientation.identity();return pose}
    if(!active)return pose
    const delta=clamp(rawDelta,0,0.05)
    time=(time+delta)%IDLE_PERIOD
    mapScenePose(inputs,time,true,target,compact)
    targetOrientation.setFromEuler(euler.set(target.x,target.y,target.z));const angle=targetOrientation.angleTo(identity);if(angle>MAX_TILT)targetOrientation.slerp(identity,1-MAX_TILT/angle);orientation.slerp(targetOrientation,1-Math.exp(-4*delta))
    pose.x=target.x;pose.y=target.y;pose.z=target.z;pose.phase=target.phase
    pose.lift=damp(pose.lift,target.lift,delta);pose.retreat=damp(pose.retreat,target.retreat,delta);pose.scale=damp(pose.scale,target.scale,delta)
    pose.wave=damp(pose.wave,target.wave,delta,6)
    pose.tension=damp(pose.tension,target.tension,delta,target.tension>pose.tension?13:3.2)
    pose.twist=damp(pose.twist,target.twist,delta,target.twist>pose.twist?10:3)
    pose.shine=damp(pose.shine,target.shine,delta,target.shine>pose.shine?12:3.5)
    return pose
  }}
}
