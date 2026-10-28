import { useState } from 'react'
import { approach } from '../data/content'
import { ProcessVisual } from '../visuals/ProcessVisual'

export function Approach({ motion }: { motion: boolean }) {
  const [selected, setSelected] = useState(0)
  return <section id="approach" tabIndex={-1} className="approach page-width section-space" aria-labelledby="approach-title">
    <div className="approach-stage"><h2 id="approach-title">From intention<br />to resonance.</h2><div className="approach-main-visual"><ProcessVisual step={selected} motion={motion} /></div><p className="approach-hint">Select a step to explore the form.</p></div>
    <ol>{approach.map((step, index) => <li key={step.id} className={selected === index ? 'is-selected' : ''}>
      <div className="approach-step-head"><h3><button aria-pressed={selected === index} onClick={() => setSelected(index)}>{step.title}<span aria-hidden="true">{selected === index ? '●' : '○'}</span></button></h3><div className="approach-small-visual"><ProcessVisual step={index} motion={false} /></div></div><p>{step.text}</p>
    </li>)}</ol>
  </section>
}
