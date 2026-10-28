import type { KeyboardEvent } from 'react'

export function trapModalTab(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== 'Tab') return
  const dialog = event.currentTarget
  const elements = Array.from(dialog.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex]'))
    .filter(element => element.tabIndex >= 0 && !element.matches(':disabled') && element.getClientRects().length > 0)
  const first = elements[0]
  const last = elements[elements.length - 1]
  if (!first) { event.preventDefault(); return }
  if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
