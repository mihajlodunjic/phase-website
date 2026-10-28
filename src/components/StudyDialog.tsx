import { useLayoutEffect, useRef, useState } from 'react'
import type { StudyId } from '../data/content'
import { studies } from '../data/content'
import { trapModalTab } from '../lib/modalFocus'
import { studyForKey } from '../lib/studySelection'
import { StudyVisual } from '../visuals/StudyVisual'
import { MotionControl } from './MotionControl'
import type { MotionSettings } from './MotionControl'

type Props = { selected: StudyId; open: boolean; motion: MotionSettings; onSelect: (id: StudyId) => void; onClose: () => void }
export function StudyDialog({ selected, open, motion, onSelect, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const tabs = useRef<Partial<Record<StudyId, HTMLButtonElement | null>>>({})
  const [replay, setReplay] = useState(0)
  useLayoutEffect(() => {
    if (open && !dialog.current?.open) { dialog.current?.showModal(); dialog.current?.scrollTo(0, 0) }
  }, [open])

  return <dialog ref={dialog} className="study-dialog" onKeyDown={trapModalTab} aria-labelledby={`study-title-${selected}`} onClose={onClose}>
    <div className="study-dialog-top"><span>Self-initiated study</span><button className="close-study" aria-label="Close study" onClick={() => dialog.current?.close()}>Close <span aria-hidden="true">×</span></button></div>
    <div className="study-tabs" role="tablist" aria-label="Studies">
      {studies.map(study => <button key={study.id} ref={element => { tabs.current[study.id] = element }} role="tab" id={`study-tab-${study.id}`} aria-controls={`study-panel-${study.id}`} aria-selected={selected === study.id} tabIndex={selected === study.id ? 0 : -1}
        onClick={() => { onSelect(study.id); setReplay(0) }} onKeyDown={event => {
          const next = studyForKey(selected, event.key)
          if (next) { event.preventDefault(); onSelect(next); setReplay(0); tabs.current[next]?.focus() }
        }}>{study.name}</button>)}
    </div>
    {studies.map(study => <div key={study.id} role="tabpanel" id={`study-panel-${study.id}`} aria-labelledby={`study-tab-${study.id}`} hidden={selected !== study.id} tabIndex={0} className="study-panel">
      <div className="panel-visual">{open && selected === study.id && <StudyVisual key={study.id} kind={study.id} motion={motion.enabled} sequence replay={replay} />}</div>
      <div className="panel-copy"><p className="study-field">{study.field}</p><h2 id={`study-title-${study.id}`}>{study.name}</h2><p className="study-description">{study.description}</p><p>{study.concept}</p><p className="visual-description">{study.visualDescription}</p>
        <div className="study-panel-controls"><button className="button" disabled={!motion.enabled} onClick={event => {
          setReplay(value => value + 1)
          event.currentTarget.closest('[role=tabpanel]')?.querySelector('.panel-visual')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        }}>Replay motion <span aria-hidden="true">↻</span></button><span className="panel-sound-status">Sound off</span></div>
      </div>
    </div>)}
    <div className="study-dialog-bottom"><span>Sound, made visible.</span><MotionControl motion={motion} context="in study" /></div>
  </dialog>
}
