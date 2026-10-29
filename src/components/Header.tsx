import { useEffect, useRef, useState } from 'react'
import { SoundToggle } from './AudioControls'

type Props = { onStartProject: () => void }

export function Header({ onStartProject }: Props) {
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const nav = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return
    nav.current?.querySelector('a')?.focus()
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); menuButton.current?.focus() }
    }
    const outside = (event: PointerEvent) => {
      if (!nav.current?.contains(event.target as Node) && !menuButton.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', close)
    document.addEventListener('pointerdown', outside)
    return () => {
      document.removeEventListener('keydown', close)
      document.removeEventListener('pointerdown', outside)
    }
  }, [open])

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 761px)')
    const update = () => { if (desktop.matches) setOpen(false) }
    desktop.addEventListener('change', update)
    return () => desktop.removeEventListener('change', update)
  }, [])

  const navigate = (hash: string) => {
    setOpen(false)
    requestAnimationFrame(() => document.querySelector<HTMLElement>(hash)?.focus({ preventScroll: true }))
  }

  return <header className="header page-width">
    <a className="wordmark" href="#top" aria-label="PHASE home">PHASE<span>/</span></a>
    <nav ref={nav} id="primary-nav" className={`navigation ${open ? 'is-open' : ''}`} aria-label="Main navigation">
      <a href="#work" onClick={() => navigate('#work')}>Work</a>
      <a href="#approach" onClick={() => navigate('#approach')}>Approach</a>
      <a href="#studio" onClick={() => navigate('#studio')}>Studio</a>
    </nav>
    <div className="header-actions">
      <SoundToggle />
      <button className="project-link" onClick={onStartProject}>Start a project <span aria-hidden="true">↗</span></button>
      <button ref={menuButton} className="menu-toggle" aria-expanded={open} aria-controls="primary-nav" onClick={() => setOpen(value => !value)}>{open ? 'Close' : 'Menu'}<span aria-hidden="true">{open ? '−' : '+'}</span></button>
    </div>
  </header>
}
