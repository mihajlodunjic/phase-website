import { describe, expect, it } from 'vitest'
import { mapStudyMotion, processRingPose, studyDuration } from './studyMotion'
import { createAfterimageBands, createFormRings } from './studyGeometry'

const pose = () => ({ compression: 0, signal: 0, drift: 0, wave: 0 })
describe('procedural study motion', () => {
  it('gathers FORM to one impulse and returns to an open resting state', () => {
    expect(mapStudyMotion('form', 0, true, pose()).compression).toBe(0)
    expect(mapStudyMotion('form', studyDuration('form') / 2, true, pose()).compression).toBeCloseTo(1)
    expect(mapStudyMotion('form', studyDuration('form'), true, pose()).compression).toBeCloseTo(0)
  })
  it('moves ECHO through a bounded signal sequence', () => {
    expect(mapStudyMotion('echo', 0, true, pose()).signal).toBe(0)
    expect(mapStudyMotion('echo', 1000, true, pose()).signal).toBe(7)
  })
  it('keeps nonfinite time and extreme replay positions finite', () => {
    for (const kind of ['form', 'echo', 'afterimage'] as const) {
      for (const elapsed of [NaN, Infinity, -20, 1e20]) {
        const result = mapStudyMotion(kind, elapsed, true, pose())
        expect(Object.values(result).every(Number.isFinite)).toBe(true)
        expect(result.compression).toBeGreaterThanOrEqual(0)
        expect(result.compression).toBeLessThanOrEqual(1)
        expect(Math.abs(result.drift)).toBeLessThanOrEqual(8)
      }
    }
  })
  it('preserves one smooth 18-second preview cycle', () => {
    const first = mapStudyMotion('afterimage', 3, false, pose())
    const next = mapStudyMotion('afterimage', 21, false, pose())
    expect(first.wave).toBeCloseTo(next.wave, 10)
    expect(first.drift).toBeCloseTo(next.drift, 10)
  })
  it('brings loose process rings into order, then gathers the larger rings', () => {
    const listen = processRingPose(0, 0, 9)
    const shape = processRingPose(1, 0, 9)
    const refine = processRingPose(2, 0, 9)
    expect(Math.abs(listen.y)).toBeGreaterThan(0)
    expect(shape).toEqual({ x: 0, y: 0, scale: 1 })
    expect(refine.scale).toBeLessThan(processRingPose(2, 8, 9).scale)
    expect(refine.scale).toBeGreaterThan(0)
  })
  it('generates reproducible closed surface paths without invalid coordinates', () => {
    for (const paths of [createFormRings(), createAfterimageBands()]) {
      expect(paths.length).toBeGreaterThan(0)
      for (const path of paths) { expect(path.d).not.toMatch(/NaN|Infinity/); expect(path.d.endsWith('Z')).toBe(true) }
    }
    expect(createFormRings()).toEqual(createFormRings())
  })
})
