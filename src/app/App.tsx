import { useEffect,useRef } from 'react'
import { attachStudyRenderers } from '../visuals/studyRendererLifetime'
import { useHeroIntro } from '../hooks/useHeroIntro'
import { Header } from '../components/Header'
import { ProjectBrief } from '../components/ProjectBrief'
import { PhaseCanvas } from '../scene/PhaseCanvas'
import { useMotionPreference } from '../hooks/useMotionPreference'
import { Statement } from '../sections/Statement'
import { Studies } from '../sections/Studies'
import { Approach } from '../sections/Approach'
import { Studio } from '../sections/Studio'
import { useAudio } from '../audio/AudioProvider'
import { AudioDiagnostics, AudioPlayButton, GlobalAudioPlayer } from '../components/AudioControls'
import { MotionControl } from '../components/MotionControl'

export function App() {
  useEffect(attachStudyRenderers,[])
  const motion = useMotionPreference()
  const intro = useHeroIntro(motion.enabled)
  const { engine } = useAudio()
  const brief = useRef<HTMLDialogElement>(null)
  const briefOpener = useRef<HTMLElement | null>(null)
  const openBrief = () => { briefOpener.current = document.activeElement as HTMLElement; engine.stop('brief'); brief.current?.showModal() }

  return (
    <div id="top" data-intro={intro ? 'on' : 'off'} tabIndex={-1} onClick={event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]')
      const target = link?.getAttribute('href')?.slice(1)
      if (target) requestAnimationFrame(() => document.getElementById(target)?.focus({ preventScroll: true }))
    }} data-motion={motion.enabled ? 'on' : 'off'}>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header onStartProject={openBrief} />
      <main id="main" tabIndex={-1}>
        <section className="hero page-width" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title"><span>SOUND,</span><span>MADE</span><span>VISIBLE.</span></h1>
            <p className="hero-description">We shape how brands are heard. Sonic identities, product sounds and original compositions with a character of their own.</p>
            <div className="hero-actions"><a className="button button-accent explore" href="#work">Explore the studies <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M10 3v13m-5-5 5 5 5-5" /></svg></a><AudioPlayButton id="phase" hero /></div>
          </div>
          <div className="hero-art">
            <PhaseCanvas motion={motion.enabled} />
            <div className="sculpture-caption"><span>PHASE Loop</span><span>A study in resonance</span></div>
          </div>
          <div className="hero-bottom">
            <span className="studio-signature"><span className="phase-symbol" aria-hidden="true">∿</span>Independent sound studio</span>
            <MotionControl motion={motion} />
          </div>
        </section>
        <Statement />
        <Studies motion={motion} />
        <Approach motion={motion.enabled} />
        <Studio />
        <section className="contact page-width section-space" aria-labelledby="contact-title"><h2 id="contact-title">What should your<br />brand sound like?</h2><button className="button button-accent" onClick={openBrief}>Start a project <span aria-hidden="true">↗</span></button></section>
      </main>
      <footer className="footer page-width"><a className="wordmark" href="#top" aria-label="PHASE home">PHASE<span>/</span></a><nav aria-label="Footer navigation"><a href="#work">Work</a><a href="#approach">Approach</a><a href="#studio">Studio</a><a href="#top">Back to top <span aria-hidden="true">↑</span></a></nav><p>Independent studio concept.<br />Design &amp; development by Mihajlo Dunjić.</p></footer>
      <ProjectBrief dialogRef={brief} onClose={() => briefOpener.current?.focus({ preventScroll: true })} />
      <GlobalAudioPlayer />
      <AudioDiagnostics />
    </div>
  )
}

