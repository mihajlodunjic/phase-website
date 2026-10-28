import { Euler, Quaternion } from 'three'

export const MAX_TILT = 7 * Math.PI / 180
export const IDLE_PERIOD = 18
export const MAX_BREATH = 0.009
export const MAX_TWIST = 0.018
const TAU = Math.PI * 2

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : 0))
export type SceneInputs = { pointerX: number; pointerY: number; scroll: number }
export type ScenePose = { x: number; y: number; z: number; lift: number; retreat: number; scale: number; breath: number; twist: number }
export type SceneOptions = { motion: boolean; active: boolean; compact: boolean }

export const neutralPose = (): ScenePose => ({ x: 0, y: 0, z: 0, lift: 0, retreat: 0, scale: 1, breath: 0, twist: 0 })

// Targets only. Every channel, including shader deformation, has a finite budget.
export function mapScenePose(input: SceneInputs, time: number, motion: boolean, out: ScenePose, compact = false): ScenePose {
  if (!motion) return Object.assign(out, neutralPose())
  const cycle = clamp(time, 0, Number.MAX_SAFE_INTEGER) * TAU / IDLE_PERIOD
  const intensity = compact ? 0.55 : 1
  const pointerLimit = MAX_TILT * (compact ? 0.45 : 0.82)
  const scroll = clamp(input.scroll, 0, 1)
  out.x = clamp(-clamp(input.pointerY, -1, 1) * pointerLimit + Math.sin(cycle) * 0.015 * intensity, -MAX_TILT, MAX_TILT)
  out.y = clamp(clamp(input.pointerX, -1, 1) * pointerLimit + Math.sin(cycle + 0.9) * 0.025 * intensity, -MAX_TILT, MAX_TILT)
  out.z = Math.sin(cycle - 0.4) * 0.012 * intensity
  const tilt = Math.hypot(out.x, out.y, out.z)
  if (tilt > MAX_TILT) {
    const ratio = MAX_TILT / tilt
    out.x *= ratio
    out.y *= ratio
    out.z *= ratio
  }
  out.lift = scroll * (compact ? 0.1 : 0.22)
  out.retreat = -scroll * (compact ? 0.22 : 0.5)
  out.scale = 1 - scroll * (compact ? 0.025 : 0.045)
  out.breath = Math.sin(cycle - 0.5) * MAX_BREATH * intensity
  out.twist = Math.sin(cycle + 0.3) * MAX_TWIST * intensity
  return out
}

export function damp(current: number, target: number, delta: number) {
  return current + (target - current) * (1 - Math.exp(-5 * clamp(delta, 0, 0.05)))
}

/** Sole owner of time, target mapping, quaternion settling and uniform smoothing.
 * Events write inputs; Fiber calls step. No event handler writes a mesh/uniform.
 */
export function createSceneController(inputs: SceneInputs) {
  const pose = neutralPose()
  const target = neutralPose()
  const orientation = new Quaternion()
  const targetOrientation = new Quaternion()
  const euler = new Euler()
  let time = 0
  return {
    inputs, pose, orientation,
    get time() { return time },
    step(rawDelta: number, { motion, active, compact }: SceneOptions) {
      if (!motion) {
        Object.assign(pose, mapScenePose(inputs, time, false, target, compact))
        orientation.identity()
        return pose
      }
      if (!active) return pose
      const delta = clamp(rawDelta, 0, 0.05)
      time = (time + delta) % IDLE_PERIOD
      mapScenePose(inputs, time, true, target, compact)
      targetOrientation.setFromEuler(euler.set(target.x, target.y, target.z))
      orientation.slerp(targetOrientation, 1 - Math.exp(-5 * delta))
      pose.x = target.x
      pose.y = target.y
      pose.z = target.z
      pose.lift = damp(pose.lift, target.lift, delta)
      pose.retreat = damp(pose.retreat, target.retreat, delta)
      pose.scale = damp(pose.scale, target.scale, delta)
      pose.breath = damp(pose.breath, target.breath, delta)
      pose.twist = damp(pose.twist, target.twist, delta)
      return pose
    },
  }
}
