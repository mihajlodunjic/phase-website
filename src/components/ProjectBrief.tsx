import { useLayoutEffect, useRef, useState } from 'react'
import type { FormEvent, RefObject } from 'react'
import { trapModalTab } from '../lib/modalFocus'
import { generateBrief, validateBrief } from '../lib/brief'
import type { BriefErrors, BriefInput } from '../lib/brief'

type Props = { dialogRef: RefObject<HTMLDialogElement | null>; onClose: () => void }
export function ProjectBrief({ dialogRef, onClose }: Props) {
  const [brief, setBrief] = useState('')
  const [stage, setStage] = useState<'details' | 'result'>('details')
  const [errors, setErrors] = useState<BriefErrors>({})
  const [status, setStatus] = useState('')
  const [copying, setCopying] = useState(false)
  const body = useRef<HTMLDivElement>(null)
  const form = useRef<HTMLFormElement>(null)
  const output = useRef<HTMLTextAreaElement>(null)
  const resultTitle = useRef<HTMLHeadingElement>(null)
  const revision = useRef(0)

  useLayoutEffect(() => {
    if (stage === 'result') { body.current?.scrollTo(0, 0); resultTitle.current?.focus({ preventScroll: true }) }
  }, [stage, brief])

  const generate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const get = (name: string) => String(values.get(name) || '')
    const input: BriefInput = { project: get('project'), type: get('type'), description: get('description'), timing: get('timing'), budget: get('budget') }
    const nextErrors = validateBrief(input)
    setErrors(nextErrors); setStatus('')
    const first = Object.keys(nextErrors)[0]
    if (first) {
      form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    revision.current++
    setBrief(generateBrief(input)); setStage('result')
    setStatus('Brief ready. Copy it or return to your details.')
  }
  const copy = async () => {
    const version = ++revision.current
    setCopying(true)
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(brief)
      if (version === revision.current) setStatus('Brief copied.')
    } catch {
      if (version !== revision.current) return
      output.current?.focus(); output.current?.select()
      setStatus('The brief is selected. Copy it manually with your keyboard or device menu.')
    } finally { if (version === revision.current) setCopying(false) }
  }

  return <dialog ref={dialogRef} className="brief-dialog" data-stage={stage} aria-labelledby="brief-title" aria-describedby="brief-intro" onKeyDown={trapModalTab} onClose={() => {
    revision.current++; setCopying(false); setStatus(''); onClose()
  }}>
    <div className="dialog-top"><span className="wordmark" aria-hidden="true">PHASE/</span><button autoFocus aria-label="Close project brief" onClick={() => dialogRef.current?.close()}>Close <span aria-hidden="true">×</span></button></div>
    <div ref={body} className="brief-body">
      <h2 ref={resultTitle} tabIndex={-1} id="brief-title">{stage === 'details' ? 'Start with a feeling.' : 'Your project brief.'}</h2>
      <p id="brief-intro">{stage === 'details' ? 'Build a brief to keep or share. Your details stay in this page; nothing is sent.' : 'Ready to keep or share. Nothing is sent.'}</p>
      <form ref={form} id="project-brief-form" hidden={stage !== 'details'} noValidate onSubmit={generate} onInput={event => {
        const field = event.target as HTMLInputElement
        if ((field.name === 'project' || field.name === 'description') && field.value.trim() && errors[field.name]) setErrors(previous => ({ ...previous, [field.name]: undefined }))
      }}>
        <label htmlFor="brief-project">Project name <span>(required)</span></label>
        <input id="brief-project" name="project" required maxLength={120} aria-invalid={!!errors.project} aria-describedby={errors.project ? 'brief-project-error' : undefined} />
        {errors.project && <p id="brief-project-error" className="field-error">{errors.project}</p>}
        <label htmlFor="brief-type">Type of work</label>
        <select id="brief-type" name="type"><option>Sonic identity</option><option>Product sound</option><option>Original composition</option><option>Let’s figure it out</option></select>
        <label htmlFor="brief-description">What do you have in mind? <span>(required)</span></label>
        <textarea id="brief-description" name="description" required maxLength={2000} rows={4} aria-invalid={!!errors.description} aria-describedby={errors.description ? 'brief-description-error' : undefined} />
        {errors.description && <p id="brief-description-error" className="field-error">{errors.description}</p>}
        <div className="form-row"><div><label htmlFor="brief-timing">Timing <span>(optional)</span></label><input id="brief-timing" name="timing" maxLength={120} /></div><div><label htmlFor="brief-budget">Budget <span>(optional)</span></label><input id="brief-budget" name="budget" placeholder="Not sure yet" maxLength={120} /></div></div>
      </form>
      <div className="brief-output" hidden={stage !== 'result'}>
        <label htmlFor="brief-output">Your brief</label><textarea ref={output} id="brief-output" value={brief} readOnly rows={11} />
      </div>
    </div>
    <div className="brief-actions">
      {stage === 'details' ? <button className="button button-accent" type="submit" form="project-brief-form">Generate brief</button> : <>
        <button className="button brief-edit" disabled={copying} onClick={() => {
          revision.current++; setStage('details'); setStatus('')
          requestAnimationFrame(() => form.current?.querySelector<HTMLInputElement>('input')?.focus())
        }}>Edit details</button>
        <button className="button button-accent" disabled={copying} onClick={() => { void copy() }}>{copying ? 'Copying…' : 'Copy brief'}</button>
      </>}
      <p className="brief-status" role="status" aria-atomic="true">{status}</p>
    </div>
  </dialog>
}

