import { useEffect, useState } from 'react'

const query = '(prefers-reduced-motion: reduce)'

export function useMotionPreference() {
  const [reduced, setReduced] = useState(() => window.matchMedia(query).matches)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setReduced(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  // The OS preference always wins; changing it is observed without a reload.
  return { enabled: !reduced && !paused, reduced, toggle: () => setPaused(value => !value) }
}
