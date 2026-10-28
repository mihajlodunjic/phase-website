import { useEffect, useRef, useState } from 'react'

type Props = { onStartProject: () => void }

export function Header({ onStartProject }: Props) {
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const nav = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        menuButton.current?.focus()
      }
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

  return (
    <header className="header page-width">
      <a className="wordmark" href="#top" aria-label="PHASE home">PHASE<span>/</span></a>
      <nav ref={nav} id="primary-nav" className={`navigation ${open ? 'is-open' : ''}`} aria-label="Main navigation">
        <a href="#work" onClick={() => setOpen(false)}>Work</a>
        <a href="#approach" onClick={() => setOpen(false)}>Approach</a>
        <a href="#studio" onClick={() => setOpen(false)}>Studio</a>
      </nav>
      <div className="header-actions">
        <span className="sound-status"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 8h3l4-4v12l-4-4H3zM14 7l5 6m0-6-5 6" /></svg>Sound off</span>
        <button className="project-link" onClick={onStartProject}>Start a project <span aria-hidden="true">↗</span></button>
        <button ref={menuButton} className="menu-toggle" aria-expanded={open} aria-controls="primary-nav" onClick={() => setOpen(value => !value)}>{open ? 'Close' : 'Menu'}<span aria-hidden="true">{open ? '−' : '+'}</span></button>
      </div>
    </header>
  )
}
