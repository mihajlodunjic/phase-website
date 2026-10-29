import { useEffect, useState, useSyncExternalStore } from 'react'
import type { RefObject } from 'react'

// One observer/listener shared by decorative WebGL/SVG views. A modal owns the
// visible layer: its own motif may run, while every obscured background rests.
let snapshot: { visible: boolean; modal: HTMLDialogElement | null } = { visible: true, modal: null }
const listeners = new Set<() => void>()
let observer: MutationObserver | null = null
const update = () => {
  const visible = !document.hidden
  const modal = document.querySelector<HTMLDialogElement>('dialog[open]')
  if (snapshot.visible === visible && snapshot.modal === modal) return
  snapshot = { visible, modal }
  listeners.forEach(listener => listener())
}
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  if (listeners.size === 1) {
    document.addEventListener('visibilitychange', update)
    observer = new MutationObserver(update)
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] })
    update()
  }
  return () => {
    listeners.delete(listener)
    if (!listeners.size) { document.removeEventListener('visibilitychange', update); observer?.disconnect(); observer = null }
  }
}
const getSnapshot = () => snapshot

export function useVisualActivity(ref: RefObject<Element | null>, enabled: boolean) {
  const [visible, setVisible] = useState(false)
  const page = useSyncExternalStore(subscribe, getSnapshot)
  useEffect(() => {
    if (!ref.current) return
    const intersection = new IntersectionObserver(entries => setVisible(entries[0].isIntersecting), { threshold: 0 })
    intersection.observe(ref.current)
    return () => intersection.disconnect()
  }, [ref])
  return enabled && visible && page.visible && (!page.modal || page.modal.contains(ref.current))
}
