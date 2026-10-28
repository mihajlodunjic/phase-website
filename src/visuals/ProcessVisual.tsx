import { useEffect, useId, useRef } from 'react'
import { useVisualActivity } from '../hooks/useVisualActivity'
import { FormPaths, MetalDefinitions, formRings } from './StudyVisual'
import { processRingPose } from './studyMotion'
import { subscribeVisualFrame } from './visualScheduler'

export function ProcessVisual({ step, motion }: { step: number; motion: boolean }) {
  const id = `process-${useId().replace(/:/g, '')}`
  const root = useRef<SVGSVGElement>(null)
  const current = useRef(step)
  const active = useVisualActivity(root, motion)
  useEffect(() => {
    const element = root.current
    if (!element) return
    const rings = element.querySelectorAll<SVGGElement>('[data-ring]')
    const paint = () => {
      for (let i = 0; i < rings.length; i++) {
        const pose = processRingPose(current.current, i, formRings.length)
        rings[i].setAttribute('transform', `translate(${360 + pose.x} ${240 + pose.y}) scale(${pose.scale}) translate(-360 -240)`)
      }
      element.dataset.step = String(step)
    }
    if (!motion) current.current = step
    paint()
    if (!active || Math.abs(current.current - step) < 0.001) return
    let unsubscribe = () => {}
    unsubscribe = subscribeVisualFrame(delta => {
      current.current += (step - current.current) * (1 - Math.exp(-7 * delta))
      if (Math.abs(current.current - step) < 0.001) { current.current = step; unsubscribe() }
      paint()
    })
    return unsubscribe
  }, [step, motion, active])
  return <svg ref={root} className="process-visual" viewBox="0 0 720 480" aria-hidden="true" focusable="false"><MetalDefinitions id={id} /><FormPaths id={id} /></svg>
}
