import { describe, expect, it } from 'vitest'
import { Vector3 } from 'three'
import { createLoopGeometry } from './loopGeometry'

describe.each([[208, 56], [144, 40]])('loop geometry %i × %i', (segments, sides) => {
  it('closes both seams without a position or shading crack', () => {
    const geometry = createLoopGeometry(segments, sides)
    const positions = geometry.getAttribute('position')
    const normals = geometry.getAttribute('normal')
    const a = new Vector3(), b = new Vector3()
    for (let j = 0; j <= sides; j++) {
      a.fromBufferAttribute(positions, j)
      b.fromBufferAttribute(positions, segments * (sides + 1) + j)
      expect(a.distanceTo(b)).toBeLessThan(1e-5)
      a.fromBufferAttribute(normals, j)
      b.fromBufferAttribute(normals, segments * (sides + 1) + j)
      expect(a.distanceTo(b)).toBeLessThan(0.005)
    }
    for (let i = 0; i <= segments; i++) {
      a.fromBufferAttribute(positions, i * (sides + 1))
      b.fromBufferAttribute(positions, i * (sides + 1) + sides)
      expect(a.distanceTo(b)).toBeLessThan(1e-5)
    }
    geometry.dispose()
  })
  it('keeps the cavity open, vertices finite and normals normalized', () => {
    const geometry = createLoopGeometry(segments, sides)
    const positions = geometry.getAttribute('position')
    const normals = geometry.getAttribute('normal')
    const normal = new Vector3()
    const tangent = new Vector3()
    const tangents = geometry.getAttribute('tangent')
    let innerRadius = Infinity
    for (let i = 0; i < positions.count; i++) {
      const point = new Vector3().fromBufferAttribute(positions, i)
      expect(point.toArray().every(Number.isFinite)).toBe(true)
      innerRadius = Math.min(innerRadius, Math.hypot(point.x, point.y))
      normal.fromBufferAttribute(normals, i)
      expect(normal.length()).toBeCloseTo(1, 5)
      tangent.fromBufferAttribute(tangents, i)
      expect(tangent.length()).toBeCloseTo(1, 5)
      expect(Math.abs(tangent.dot(normal))).toBeLessThan(0.005)
    }
    expect(innerRadius).toBeGreaterThan(0.7)
    geometry.dispose()
  })
  it('provides culling headroom beyond the undeformed surface', () => {
    const geometry = createLoopGeometry(segments, sides)
    const positions = geometry.getAttribute('position')
    const sphere = geometry.boundingSphere!
    const point = new Vector3()
    let farthest = 0
    for (let i = 0; i < positions.count; i++) farthest = Math.max(farthest, point.fromBufferAttribute(positions, i).distanceTo(sphere.center))
    expect(sphere.radius).toBeGreaterThanOrEqual(farthest * 1.039)
    geometry.dispose()
  })
})
