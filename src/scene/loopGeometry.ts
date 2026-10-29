import { BufferGeometry, Float32BufferAttribute } from 'three'
import { sampleResonance } from './resonanceSurface'

const TAU = Math.PI * 2

/** A swept, asymmetric loop. The cross-section rolls around a non-planar spine.
 * Flattened sections turn through a full revolution; broad, shallow folds replace ribbing.
 */
export function createLoopGeometry(segments = 160, sides = 32) {
  const positions: number[] = []
  const indices: number[] = []
  const uvs: number[] = []
  for (let i = 0; i <= segments; i++) {
    const u = i / segments * TAU
    const point = [0, 0, 0]
    for (let j = 0; j <= sides; j++) {
      const v = j / sides * TAU
      sampleResonance(u, v, 0, 0, 0, 0, point)
      positions.push(point[0], point[1], point[2])
      uvs.push(i / segments, j / sides)
      if (i < segments && j < sides) {
        const aIndex = i * (sides + 1) + j
        const bIndex = aIndex + sides + 1
        indices.push(aIndex, bIndex, aIndex + 1, bIndex, bIndex + 1, aIndex + 1)
      }
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  // Weld the normals at both periodic seams without adding another dependency.
  const normals = geometry.getAttribute('normal')
  const average = (a: number, b: number) => {
    const x = normals.getX(a) + normals.getX(b)
    const y = normals.getY(a) + normals.getY(b)
    const z = normals.getZ(a) + normals.getZ(b)
    const length = Math.hypot(x, y, z) || 1
    normals.setXYZ(a, x / length, y / length, z / length)
    normals.setXYZ(b, x / length, y / length, z / length)
  }
  for (let i = 0; i <= segments; i++) average(i * (sides + 1), i * (sides + 1) + sides)
  for (let j = 0; j <= sides; j++) average(j, segments * (sides + 1) + j)
  // Smooth per-vertex tangents keep anisotropic highlights continuous across
  // triangles. Fragment derivatives alone expose the triangulation on chrome.
  geometry.computeTangents()
  const tangents = geometry.getAttribute('tangent')
  const averageTangent = (a: number, b: number) => {
    const x = tangents.getX(a) + tangents.getX(b)
    const y = tangents.getY(a) + tangents.getY(b)
    const z = tangents.getZ(a) + tangents.getZ(b)
    const length = Math.hypot(x, y, z) || 1
    tangents.setXYZ(a, x / length, y / length, z / length)
    tangents.setXYZ(b, x / length, y / length, z / length)
  }
  for (let i = 0; i <= segments; i++) averageTangent(i * (sides + 1), i * (sides + 1) + sides)
  for (let j = 0; j <= sides; j++) averageTangent(j, segments * (sides + 1) + j)
  geometry.computeBoundingSphere()
  // Conservative allowance for the bounded shader spread and y-axis twist.
  geometry.boundingSphere!.radius *= 1.22
  return geometry
}

