import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { LoopFallback } from './LoopFallback'

const Scene = lazy(() => import('./Scene'))

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(_error: Error, _info: ErrorInfo) { this.props.onFailure() }
  render() { return this.state.failed ? null : this.props.children }
}

export function PhaseCanvas({ motion }: { motion: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  const inputs = useRef({ pointerX: 0, pointerY: 0, scroll: 0 })
  const [active, setActive] = useState(() => !document.hidden)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const element = host.current
    if (!element) return
    let visible = false
    const update = () => setActive(visible && !document.hidden)
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting
      update()
    }, { threshold: 0 })
    observer.observe(element)
    document.addEventListener('visibilitychange', update)
    const scroll = () => {
      const hero = element.closest('section')
      if (hero) inputs.current.scroll = -hero.getBoundingClientRect().top / hero.offsetHeight
    }
    const resize = new ResizeObserver(scroll)
    const hero = element.closest('section')
    if (hero) resize.observe(hero)
    window.addEventListener('scroll', scroll, { passive: true })
    scroll()
    return () => {
      observer.disconnect()
      resize.disconnect()
      document.removeEventListener('visibilitychange', update)
      window.removeEventListener('scroll', scroll)
    }
  }, [])

  useEffect(() => {
    if (!motion || !active) { inputs.current.pointerX = 0; inputs.current.pointerY = 0 }
  }, [motion, active])

  return (
    <div ref={host} className="phase-visual" aria-hidden="true" data-renderer={failed ? 'fallback' : 'webgl'} data-motion={motion ? 'on' : 'off'} data-active={active}
      onPointerMove={event => {
        if (!motion || event.pointerType === 'touch') return
        const rect = event.currentTarget.getBoundingClientRect()
        if (!rect.width || !rect.height) return
        inputs.current.pointerX = (event.clientX - rect.left) / rect.width * 2 - 1
        inputs.current.pointerY = 1 - (event.clientY - rect.top) / rect.height * 2
      }}
      onPointerLeave={() => { inputs.current.pointerX = 0; inputs.current.pointerY = 0 }}
      onPointerCancel={() => { inputs.current.pointerX = 0; inputs.current.pointerY = 0 }}>
      <div className="fallback-layer"><LoopFallback /></div>
      {!failed && <SceneBoundary onFailure={() => setFailed(true)}><Suspense fallback={null}>
        <Scene motion={motion} active={active} inputs={inputs} host={host} onFailure={() => setFailed(true)} />
      </Suspense></SceneBoundary>}
    </div>
  )
}
