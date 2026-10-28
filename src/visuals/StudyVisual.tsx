import { useEffect, useId, useRef } from 'react'
import type { StudyId } from '../data/content'
import { useVisualActivity } from '../hooks/useVisualActivity'
import { createAfterimageBands, createFormRings, echoNodes, echoPaths } from './studyGeometry'
import { mapStudyMotion, studyDuration } from './studyMotion'
import { subscribeVisualFrame } from './visualScheduler'

export const formRings = createFormRings()
const afterimageBands = createAfterimageBands()

export function MetalDefinitions({ id }: { id: string }) {
  return <defs>
    <linearGradient id={`${id}-silver`} x1="95" y1="70" x2="630" y2="400" gradientUnits="userSpaceOnUse">
      <stop stopColor="#313d35" /><stop offset=".18" stopColor="#aab8ad" /><stop offset=".23" stopColor="#e9eee6" /><stop offset=".27" stopColor="#617267" /><stop offset=".38" stopColor="#151d18" /><stop offset=".55" stopColor="#9aaba0" /><stop offset=".59" stopColor="#dae2d9" /><stop offset=".65" stopColor="#4d6052" /><stop offset=".85" stopColor="#1e2d22" /><stop offset="1" stopColor="#9faea3" />
    </linearGradient>
    <linearGradient id={`${id}-edge`} x1="130" y1="110" x2="590" y2="410" gradientUnits="userSpaceOnUse"><stop stopColor="#e2e9dd" /><stop offset=".4" stopColor="#314036" /><stop offset=".66" stopColor="#b8c7b9" /><stop offset="1" stopColor="#263b2b" /></linearGradient>
  </defs>
}

export function FormPaths({ id }: { id: string }) {
  return <>{formRings.map((ring, index) => <g key={index} data-ring="">
    <path d={ring.depth} fill="#26332a" fillRule="evenodd" />
    <path d={ring.d} fill={`url(#${id}-silver)`} stroke={`url(#${id}-edge)`} strokeWidth="0.6" fillRule="evenodd" />
  </g>)}</>
}

type Props = { kind: StudyId; motion: boolean; active?: boolean; sequence?: boolean; replay?: number }
export function StudyVisual({ kind, motion, active = true, sequence = false, replay = 0 }: Props) {
  const id = `metal-${useId().replace(/:/g, '')}`
  const root = useRef<SVGSVGElement>(null)
  const elapsed = useRef(0)
  const frames = useRef(0)
  const running = useVisualActivity(root, motion && active)
  const inspect = new URLSearchParams(location.search).has('inspect')

  useEffect(() => { elapsed.current = 0 }, [kind, replay])
  useEffect(() => {
    const element = root.current
    if (!element) return
    const rings = element.querySelectorAll<SVGGElement>('[data-ring]')
    const nodes = element.querySelectorAll<SVGCircleElement>('[data-node]')
    const bands = element.querySelectorAll<SVGGElement>('[data-band]')
    const trails = element.querySelector<SVGGElement>('[data-trails]')
    const pose = { compression: 0, signal: 0, drift: 0, wave: 0 }
    const paint = () => {
      mapStudyMotion(kind, elapsed.current, sequence, pose)
      if (!motion) { pose.compression = 0; pose.signal = 3.5; pose.drift = 0; pose.wave = 0 }
      for (let i = 0; i < rings.length; i++) {
        const weight = 0.18 + (rings.length - i - 1) / Math.max(1, rings.length - 1) * 0.67
        const scale = 1 - pose.compression * weight
        rings[i].setAttribute('transform', `translate(360 240) scale(${scale}) translate(-360 -240)`)
      }
      for (let i = 0; i < nodes.length; i++) {
        const intensity = Math.exp(-Math.pow((i - pose.signal) / 0.8, 2))
        nodes[i].setAttribute('opacity', String(0.42 + intensity * 0.58))
        nodes[i].setAttribute('r', String(4.5 + intensity * 3.5))
      }
      for (let i = 0; i < bands.length; i++) {
        const shift = pose.drift + Math.sin(i * 0.3 + elapsed.current * 0.6) * pose.wave * 3
        bands[i].setAttribute('transform', `translate(0 ${shift})`)
      }
      trails?.setAttribute('opacity', String(0.17 + Math.abs(pose.wave) * 0.16))
      if (inspect) { element.dataset.frames = String(++frames.current); element.dataset.elapsed = String(elapsed.current) }
    }
    if (!motion) elapsed.current = 0
    paint()
    element.dataset.running = 'false'
    if (!running || sequence && elapsed.current >= studyDuration(kind)) return
    element.dataset.running = 'true'
    let unsubscribe = () => {}
    unsubscribe = subscribeVisualFrame(delta => {
      elapsed.current += delta
      paint()
      if (sequence && elapsed.current >= studyDuration(kind)) { unsubscribe(); element.dataset.running = 'false' }
    })
    return () => { unsubscribe(); element.dataset.running = 'false' }
  }, [kind, motion, running, sequence, replay, inspect])

  return <svg ref={root} className={`study-visual motif-${kind}`} data-motif={kind} viewBox="0 0 720 480" fill="none" aria-hidden="true" focusable="false">
    <MetalDefinitions id={id} />
    {kind === 'form' && <FormPaths id={id} />}
    {kind === 'echo' && <>
      {echoPaths.map((d, i) => <path key={i} d={d} stroke="#6e8073" strokeWidth={i === 2 ? 1 : 2} opacity={i === 2 ? 0.25 : 0.6} />)}
      {echoNodes.map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="18" stroke="#7f9285" strokeWidth="0.75" opacity=".55" /><circle data-node="" cx={x} cy={y} r="6" fill={i === 4 ? '#d8ff57' : '#c9d5cb'} /></g>)}
      <path d="M97 320h26m483-38h26" stroke="#a8b9ac" strokeWidth="1" opacity=".5" />
    </>}
    {kind === 'afterimage' && <>
      <g data-trails="" opacity=".2">{[0, 3, 6, 9].map(offset => <path key={offset} d={afterimageBands[offset].edge} transform={`translate(${28 + offset * 4} ${-35 - offset * 4})`} stroke="#8ba392" strokeWidth=".75" />)}</g>
      {afterimageBands.map((band, i) => <g key={i} data-band=""><path d={band.d} fill={`url(#${id}-silver)`} /><path d={band.edge} stroke={`url(#${id}-edge)`} strokeWidth=".6" opacity=".6" /></g>)}
    </>}
  </svg>
}
