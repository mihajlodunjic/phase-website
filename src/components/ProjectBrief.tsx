import { useRef, useState } from 'react'
import type { RefObject } from 'react'
import { generateBrief } from '../lib/brief'

export function ProjectBrief({ dialogRef }: { dialogRef: RefObject<HTMLDialogElement | null> }) {
  const [brief, setBrief] = useState('')
  const [status, setStatus] = useState('')
  const output = useRef<HTMLTextAreaElement>(null)

  return (
    <dialog ref={dialogRef} className="brief-dialog" aria-labelledby="brief-title" onClose={() => setStatus('')}>
      <div className="dialog-top"><span className="wordmark">PHASE/</span><button aria-label="Close project brief" onClick={() => dialogRef.current?.close()}>Close <span aria-hidden="true">×</span></button></div>
      <h2 id="brief-title">Start with a feeling.</h2>
      <p>Build a brief to keep or share. Your details stay in this browser; nothing is sent.</p>
      <form onSubmit={event => {
        event.preventDefault()
        const values = new FormData(event.currentTarget)
        const get = (name: string) => String(values.get(name) || '')
        try {
          setBrief(generateBrief({ project: get('project'), type: get('type'), description: get('description'), timing: get('timing'), budget: get('budget') }))
          setStatus('Brief ready. You can copy it below.')
        } catch (error) {
          setStatus(error instanceof Error ? error.message : 'Add a project name and a short description.')
        }
      }}>
        <label>Project name<input name="project" required maxLength={120} /></label>
        <label>Type of work<select name="type"><option>Sonic identity</option><option>Product sound</option><option>Original composition</option><option>Let’s figure it out</option></select></label>
        <label>What do you have in mind?<textarea name="description" required maxLength={2000} rows={3} /></label>
        <div className="form-row"><label>Timing <span>(optional)</span><input name="timing" maxLength={120} /></label><label>Budget <span>(optional)</span><input name="budget" placeholder="Not sure yet" maxLength={120} /></label></div>
        <button className="button button-accent" type="submit">Generate brief</button>
      </form>
      {brief && <div className="brief-output"><label>Your brief<textarea ref={output} value={brief} readOnly rows={9} /></label><button className="button" onClick={async () => {
        try {
          await navigator.clipboard.writeText(brief)
          setStatus('Brief copied.')
        } catch {
          output.current?.focus()
          output.current?.select()
          setStatus('Select and copy the brief above.')
        }
      }}>Copy brief</button></div>}
      <p className="brief-status" role="status">{status}</p>
    </dialog>
  )
}
