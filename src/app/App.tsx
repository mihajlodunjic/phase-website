import { useRef } from 'react'
import { Header } from '../components/Header'
import { ProjectBrief } from '../components/ProjectBrief'
import { PhaseCanvas } from '../scene/PhaseCanvas'
import { useMotionPreference } from '../hooks/useMotionPreference'
import { approach, studies } from '../data/content'

export function App() {
  const motion = useMotionPreference()
  const brief = useRef<HTMLDialogElement>(null)
  const openBrief = () => brief.current?.showModal()

  return (
    <div id="top" data-motion={motion.enabled ? 'on' : 'off'}>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header onStartProject={openBrief} />
      <main id="main">
        <section className="hero page-width" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title"><span>SOUND,</span><span>MADE</span><span>VISIBLE.</span></h1>
            <p className="hero-description">We shape how brands are heard. Sonic identities, product sounds and original compositions with a character of their own.</p>
            <a className="button button-accent explore" href="#work">Explore the studies <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M10 3v13m-5-5 5 5 5-5" /></svg></a>
          </div>
          <div className="hero-art">
            <PhaseCanvas motion={motion.enabled} />
            <div className="sculpture-caption"><span>PHASE Loop</span><span>A study in resonance</span></div>
          </div>
          <div className="hero-bottom">
            <span className="studio-signature"><span className="phase-symbol" aria-hidden="true">∿</span>Independent sound studio</span>
            <button className="motion-control" aria-pressed={!motion.enabled} disabled={motion.reduced} onClick={motion.toggle}>
              <span className="motion-icon" aria-hidden="true">{motion.enabled ? 'Ⅱ' : '▷'}</span>{motion.reduced ? 'Reduced motion' : `Motion ${motion.enabled ? 'on' : 'off'}`}
            </button>
          </div>
        </section>
        <section className="statement page-width" aria-labelledby="statement-title">
          <h2 id="statement-title">A brand is felt<br />before it is explained.</h2>
          <p>A tone. A rhythm. A moment of recognition. We explore the details that make a sound unmistakably its own.</p>
        </section>
        <section id="work" className="work page-width section-space" aria-labelledby="work-title">
          <div className="section-heading"><h2 id="work-title">Three ways<br />to be heard.</h2><p>Self-initiated studies<br />in sound and motion.</p></div>
          <div className="study-list">{studies.map(study => <article className={`study-row study-${study.id}`} key={study.id}>
            <h3>{study.name}</h3><div><p className="study-field">{study.field}</p><p>{study.description}</p></div><span className="study-note">Self-initiated study</span>
          </article>)}</div>
        </section>
        <section id="approach" className="approach page-width section-space" aria-labelledby="approach-title">
          <h2 id="approach-title">From intention<br />to resonance.</h2>
          <ol>{approach.map(step => <li key={step.title}><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
        </section>
        <section id="studio" className="studio page-width section-space" aria-labelledby="studio-title">
          <h2 id="studio-title">A practice built<br />around listening.</h2>
          <div><p>PHASE is an independent studio concept exploring the space between sound, identity and interaction. The work moves from the smallest interface signal to a complete sonic world.</p><ul><li>Sonic identities</li><li>Digital product sound</li><li>Original composition</li></ul></div>
        </section>
        <section className="contact page-width section-space" aria-labelledby="contact-title"><h2 id="contact-title">What should your<br />brand sound like?</h2><button className="button button-accent" onClick={openBrief}>Start a project <span aria-hidden="true">↗</span></button></section>
      </main>
      <footer className="footer page-width"><a className="wordmark" href="#top" aria-label="PHASE home">PHASE/</a><p>Independent studio concept.<br />Design &amp; development by Mihajlo Dunjić.</p><a href="#top">Back to top ↑</a></footer>
      <ProjectBrief dialogRef={brief} />
    </div>
  )
}
