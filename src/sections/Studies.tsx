import { useRef, useState } from 'react'
import { studies } from '../data/content'
import type { StudyId } from '../data/content'
import { StudyVisual } from '../visuals/StudyVisual'
import { StudyDialog } from '../components/StudyDialog'
import { MotionControl } from '../components/MotionControl'
import type { MotionSettings } from '../components/MotionControl'

export function Studies({ motion }: { motion: MotionSettings }) {
  const [selected, setSelected] = useState<StudyId>('form')
  const [open, setOpen] = useState(false)
  const opener = useRef<HTMLButtonElement | null>(null)
  return <section id="work" tabIndex={-1} className="work page-width section-space" aria-labelledby="work-title">
    <div className="section-heading"><h2 id="work-title">Three ways<br />to be heard.</h2><div className="work-intro"><p>Self-initiated studies<br />in sound and motion.</p><MotionControl motion={motion} context="for studies" /></div></div>
    <div className="study-list">{studies.map(study => <article key={study.id} className={`study-entry study-${study.id}`} data-selected={selected === study.id} aria-labelledby={`work-title-${study.id}`}>
      <div className="study-art"><StudyVisual kind={study.id} motion={motion.enabled} active={!open} /></div>
      <div className="study-copy"><p className="study-field">{study.field}</p><h3 id={`work-title-${study.id}`}><button aria-haspopup="dialog" onClick={event => { opener.current = event.currentTarget; setSelected(study.id); setOpen(true) }}>{study.name}<span className="study-open-mark" aria-hidden="true">↗</span></button></h3><p className="study-description">{study.description}</p>
        <div className="study-entry-bottom"><button className="study-view" aria-label={`View ${study.name} study`} aria-haspopup="dialog" onClick={event => { opener.current = event.currentTarget; setSelected(study.id); setOpen(true) }}>View study <span aria-hidden="true">↗</span></button><span>Self-initiated study</span></div>
      </div>
    </article>)}</div>
    <StudyDialog selected={selected} open={open} motion={motion} onSelect={setSelected} onClose={() => { setOpen(false); opener.current?.focus({ preventScroll: true }) }} />
  </section>
}
