import { useEffect, useRef, useState } from 'react'
import { approach } from '../data/content'
import { useVisualActivity } from '../hooks/useVisualActivity'
import { ProcessVisual } from '../visuals/ProcessVisual'

const STEP_DURATION = 4000

export function Approach({ motion }: { motion: boolean }) {
  const root = useRef<HTMLElement>(null)
  // A fresh selection also restarts the dwell when the current step is clicked.
  const [selection, setSelection] = useState({ step: 0 })
  const selected = selection.step
  const canAdvance = useVisualActivity(root, motion)

  useEffect(() => {
    if (!canAdvance) return
    const timer = window.setTimeout(() => {
      setSelection(current => ({ step: (current.step + 1) % approach.length }))
    }, STEP_DURATION)
    return () => window.clearTimeout(timer)
  }, [canAdvance, selection])

  return <section ref={root} id="approach" tabIndex={-1} className="approach page-width section-space" aria-labelledby="approach-title">
    <div className="approach-stage"><h2 id="approach-title">From intention<br />to resonance.</h2><div className="approach-main-visual"><ProcessVisual step={selected} motion={motion} /></div><p className="approach-hint">{motion ? 'Steps advance automatically. Select any step to explore the form.' : 'Select a step to explore the form.'}</p></div>
    <ol>{approach.map((step, index) => <li key={step.id} className={selected === index ? 'is-selected' : ''}>
      <div className="approach-step-head"><h3><button aria-pressed={selected === index} onClick={() => setSelection({ step: index })}>{step.title}<span aria-hidden="true">{selected === index ? '●' : '○'}</span></button></h3><div className="approach-small-visual"><ProcessVisual step={index} motion={false} /></div></div><p>{step.text}</p>
    </li>)}</ol>
  </section>
}
