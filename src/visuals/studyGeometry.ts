const TAU = Math.PI * 2
const n = (value: number) => value.toFixed(2)
type Point = [number, number]

function project(x: number, y: number, z: number, tilt = 0.98): Point {
  const py = y * Math.cos(tilt) - z * Math.sin(tilt)
  const pz = y * Math.sin(tilt) + z * Math.cos(tilt)
  const perspective = 820 / (820 + pz)
  const angle = -0.27
  return [360 + (x * Math.cos(angle) - py * Math.sin(angle)) * perspective, 240 + (x * Math.sin(angle) + py * Math.cos(angle)) * perspective]
}
function contour(points: Point[]) {
  return points.map((point, index) => `${index ? 'L' : 'M'}${n(point[0])},${n(point[1])}`).join(' ') + 'Z'
}

export function createFormRings(count = 9) {
  return Array.from({ length: count }, (_, index) => {
    const radius = 33 + index * 24
    const width = 7 + index * 0.65
    const height = (count - index) * 3.4
    const ring = (r: number, z: number, reverse = false) => Array.from({ length: 81 }, (_, j) => {
      const u = (reverse ? 80 - j : j) / 80 * TAU
      return project(Math.cos(u) * r, Math.sin(u) * r, z + Math.sin(u * 2) * 8)
    })
    const outer = ring(radius + width, height)
    const inner = ring(radius - width, height, true)
    return { d: `${contour(outer)} ${contour(inner)}`, depth: `${contour(ring(radius + width, height - 6))} ${contour(ring(radius - width, height - 6, true))}` }
  }).reverse()
}

export const echoNodes = [
  [110, 300], [180, 195], [280, 195], [352, 285],
  [420, 285], [475, 150], [578, 150], [620, 260],
] as const
export const echoPaths = echoNodes.slice(0,-1).map((from,index)=>{
  const to=echoNodes[index+1],dx=to[0]-from[0]
  return `M${from[0]} ${from[1]}C${from[0]+dx*.65} ${from[1]} ${to[0]-dx*.65} ${to[1]} ${to[0]} ${to[1]}`
})

export function createAfterimageBands(count = 19) {
  const sample = (x: number, row: number): Point => {
    const y = row * 9 + Math.sin(x * 0.009 + row * 0.09) * 54
    const z = Math.cos(x * 0.007 - row * 0.12) * 40 + Math.sin(row * 0.2) * 12
    return project(x, y, z, 0.48)
  }
  return Array.from({ length: count }, (_, index) => {
    const row = index - (count - 1) / 2
    const top = Array.from({ length: 51 }, (_, j) => sample(-285 + j / 50 * 570, row - 0.3))
    const bottom = Array.from({ length: 51 }, (_, j) => sample(285 - j / 50 * 570, row + 0.3))
    return { d: contour([...top, ...bottom]), edge: top.map((p, i) => `${i ? 'L' : 'M'}${n(p[0])},${n(p[1])}`).join(' ') }
  })
}

