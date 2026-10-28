import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

export function useVisualActivity(ref: RefObject<Element | null>, enabled: boolean) {
  const [visible, setVisible] = useState(false)
  const [pageVisible, setPageVisible] = useState(() => !document.hidden)
  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(entries => setVisible(entries[0].isIntersecting), { threshold: 0 })
    observer.observe(ref.current)
    const visibility = () => setPageVisible(!document.hidden)
    document.addEventListener('visibilitychange', visibility)
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility) }
  }, [ref])
  return enabled && visible && pageVisible
}
