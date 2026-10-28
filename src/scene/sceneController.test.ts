import { describe, expect, it } from 'vitest'
import { Quaternion } from 'three'
import { createSceneController, damp, IDLE_PERIOD, mapScenePose, MAX_BREATH, MAX_TILT, MAX_TWIST, neutralPose } from './sceneController'

const input = { pointerX: 0, pointerY: 0, scroll: 0 }
const running = { motion: true, active: true, compact: false }

describe('scene controller', () => {
  it('bounds the combined idle, pointer and shader channels at all phases', () => {
    for (let time = 0; time < IDLE_PERIOD * 2; time += 0.13) {
      for (const sign of [-1, 1]) {
        const result = mapScenePose({ pointerX: sign * 100, pointerY: -100, scroll: 50 }, time, true, neutralPose())
        expect(Math.hypot(result.x, result.y, result.z)).toBeLessThanOrEqual(MAX_TILT + 1e-10)
        expect(Math.abs(result.breath)).toBeLessThanOrEqual(MAX_BREATH)
        expect(Math.abs(result.twist)).toBeLessThanOrEqual(MAX_TWIST)
        expect(result.scale).toBeCloseTo(0.955)
        expect(result.retreat).toBe(-0.5)
        expect(result.lift).toBe(0.22)
      }
    }
  })
  it('removes every movement channel for reduced motion or motion off', () => {
    expect(mapScenePose({ pointerX: 1, pointerY: -1, scroll: 1 }, 50, false, neutralPose())).toEqual(neutralPose())
    const controller = createSceneController({ pointerX: 1, pointerY: 1, scroll: 1 })
    controller.step(0.05, running)
    controller.step(0.05, { ...running, motion: false })
    expect(controller.pose).toEqual(neutralPose())
    expect(controller.orientation.equals(new Quaternion())).toBe(true)
  })
  it('reduces the phone tilt, travel and deformation budget', () => {
    const pointer = { pointerX: 1, pointerY: 1, scroll: 1 }
    const desktop = mapScenePose(pointer, 4, true, neutralPose())
    const compact = mapScenePose(pointer, 4, true, neutralPose(), true)
    expect(Math.hypot(compact.x, compact.y)).toBeLessThan(Math.hypot(desktop.x, desktop.y) * 0.8)
    expect(Math.abs(compact.breath)).toBeCloseTo(Math.abs(desktop.breath) * 0.55)
    expect(compact.retreat).toBe(-0.22)
    expect(compact.scale).toBe(0.975)
  })
  it('has one periodic 18-second idle with no long secondary drift', () => {
    const first = mapScenePose(input, 3, true, neutralPose())
    const next = mapScenePose(input, 3 + IDLE_PERIOD, true, neutralPose())
    for (const key of Object.keys(first) as (keyof typeof first)[]) expect(first[key]).toBeCloseTo(next[key], 10)
  })
  it('freezes both time and pose while hidden or offscreen', () => {
    const controller = createSceneController(input)
    controller.step(0.05, running)
    const before = { ...controller.pose }
    const orientation = controller.orientation.clone()
    const time = controller.time
    controller.step(20, { ...running, active: false })
    expect(controller.pose).toEqual(before)
    expect(controller.time).toBe(time)
    expect(controller.orientation.equals(orientation)).toBe(true)
  })
  it('caps a resumed delta and ignores invalid frame deltas', () => {
    const first = createSceneController(input)
    const second = createSceneController(input)
    first.step(60, running)
    second.step(0.05, running)
    expect(first.pose).toEqual(second.pose)
    expect(first.orientation.equals(second.orientation)).toBe(true)
    expect(first.time).toBe(0.05)
    first.step(NaN, running)
    expect(first.time).toBe(0.05)
  })
  it('smooths consistently across frame rates', () => {
    let slow = 0
    let fast = 0
    for (let frame = 0; frame < 30; frame++) slow = damp(slow, 1, 1 / 30)
    for (let frame = 0; frame < 120; frame++) fast = damp(fast, 1, 1 / 120)
    expect(slow).toBeCloseTo(fast, 8)
  })
  it('keeps malformed inputs and time finite', () => {
    const result = mapScenePose({ pointerX: NaN, pointerY: Infinity, scroll: NaN }, Infinity, true, neutralPose())
    expect(Object.values(result).every(Number.isFinite)).toBe(true)
  })
  it('settles orientation as a normalized bounded quaternion', () => {
    const controller = createSceneController({ pointerX: 100, pointerY: -100, scroll: 1 })
    for (let frame = 0; frame < 360; frame++) {
      controller.step(1 / 60, running)
      expect(controller.orientation.length()).toBeCloseTo(1, 8)
      expect(controller.orientation.angleTo(new Quaternion())).toBeLessThan(MAX_TILT + 0.001)
    }
  })
})
