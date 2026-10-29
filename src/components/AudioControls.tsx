import { useEffect, useId, useRef } from 'react'
import { useAudio } from '../audio/AudioProvider'
import { audioStatus } from '../audio/audioEngine'
import { AUDIO_STUDIES } from '../audio/studies'
import type { AudioId } from '../audio/types'

export function AudioPlayButton({ id, hero = false }: { id: AudioId; hero?: boolean }) {
  const { engine, snapshot } = useAudio()
  const active = snapshot.activeId === id && (snapshot.status === 'playing' || snapshot.status === 'starting')
  const name = AUDIO_STUDIES[id].name
  return <button className={`audio-play ${active ? 'is-playing' : ''}`} disabled={!snapshot.supported} aria-label={`${active ? 'Stop' : 'Play'} ${name}${hero ? '' : ' study'}`} onClick={event => {
    if (active) engine.stop()
    else {
      void engine.play(id)
      const dialog = event.currentTarget.closest('.study-dialog')
      dialog?.querySelector('.study-panel:not([hidden]) .panel-visual')?.scrollIntoView({ block: 'nearest', behavior: document.querySelector('#top')?.getAttribute('data-motion') === 'on' ? 'smooth' : 'instant' })
    }
  }}>
    <svg viewBox="0 0 20 20" aria-hidden="true">{active ? <path d="M5 5h10v10H5z" /> : <path d="m6 4 10 6-10 6z" />}</svg>
    {snapshot.supported ? active ? hero ? 'Stop PHASE' : 'Stop study' : hero ? 'Hear PHASE' : 'Play study' : 'Audio unavailable'}
  </button>
}

export function SoundToggle() {
  const { engine, snapshot } = useAudio()
  return <button className="sound-toggle" disabled={!snapshot.supported} aria-pressed={snapshot.enabled} aria-label={snapshot.supported ? snapshot.enabled ? 'Turn sound off' : 'Enable sound' : 'Audio unavailable'} title="Enable sound without starting a study" onClick={() => { if (snapshot.enabled) engine.disable(); else void engine.enable() }}>
    <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 8h3l4-4v12l-4-4H2z" />{snapshot.enabled ? <path d="M13 6q5 4 0 8m-2-6q2 2 0 4" /> : <path d="m13 7 5 6m0-6-5 6" />}</svg>
    <span className="sound-label">{!snapshot.supported ? 'Sound unavailable' : snapshot.enabled ? 'Sound enabled' : 'Sound off'}</span>
  </button>
}

export function VolumeControl({ panel = false }: { panel?: boolean }) {
  const { engine, snapshot } = useAudio()
  const id = useId()
  const percent = Math.round(snapshot.volume * 100)
  return <div className="volume-control"><label htmlFor={id}>Volume <output aria-hidden="true">{percent}%</output></label><input id={id} type="range" min="0" max="100" step="1" value={percent} aria-label={panel ? 'Study volume' : 'Playback volume'} aria-valuetext={`${percent}%`} onChange={event => engine.setVolume(Number(event.currentTarget.value) / 100)} /></div>
}

export function PanelAudioControls({ id }: { id: AudioId }) {
  const { snapshot } = useAudio()
  return <div className="panel-audio-controls"><div className="panel-audio-row"><AudioPlayButton id={id} /><VolumeControl panel /></div><p className="audio-status" role="status">{audioStatus(snapshot)}</p></div>
}

function AudioProgress() {
  const { engine, snapshot } = useAudio()
  const progress = useRef<HTMLProgressElement>(null)
  const time = useRef<HTMLSpanElement>(null)
  const id = snapshot.activeId || snapshot.lastId
  const duration = id ? AUDIO_STUDIES[id].duration : 0
  useEffect(() => engine.subscribeMeter(() => {
    const elapsed = snapshot.status === 'playing' ? engine.energy.elapsed : snapshot.position
    if (progress.current) progress.current.value = elapsed
    if (time.current) time.current.textContent = `${Math.floor(elapsed)}s / ${duration}s`
  }), [engine, snapshot, duration])
  return <div className="audio-progress"><progress ref={progress} max={duration || 1} value={snapshot.position} aria-label="Playback progress" /><span ref={time} aria-hidden="true">0s / {duration}s</span></div>
}

export function GlobalAudioPlayer() {
  const { engine, snapshot } = useAudio()
  if (!snapshot.enabled && snapshot.status !== 'error') return null
  const active = snapshot.status === 'playing' || snapshot.status === 'starting'
  return <aside className="global-audio-player" aria-label="Audio player">
    <div className="player-state"><span className="playback-dot" data-playing={snapshot.status === 'playing'} aria-hidden="true" /><p role="status">{audioStatus(snapshot)}</p></div>
    {snapshot.lastId && <AudioProgress />}
    {active ? <button className="player-stop" aria-label="Stop playback" onClick={() => engine.stop()}>■ <span>Stop</span></button> : snapshot.lastId ? <button className="player-stop" aria-label="Play again" onClick={() => { void engine.play(snapshot.lastId!) }}>▷ <span>Play again</span></button> : <a className="player-choose" href="#work">Choose a study</a>}
    <VolumeControl />
    <button className="player-off" aria-label="Turn sound off" onClick={() => engine.disable()}>Sound off</button>
  </aside>
}

export function AudioDiagnostics() {
  const { engine, snapshot } = useAudio()
  const ref = useRef<HTMLDivElement>(null)
  const inspect = new URLSearchParams(location.search).has('inspect')
  useEffect(() => {
    if (!inspect) return
    return engine.subscribeMeter(() => {
      if (!ref.current) return
      ref.current.dataset.energy = JSON.stringify(engine.energy)
      ref.current.dataset.maxPeak = String(engine.stats.maxPeak)
    })
  }, [engine, inspect])
  return inspect ? <div ref={ref} hidden data-audio-debug="" data-contexts={engine.stats.contexts} data-voices={engine.stats.voices} data-max-voices={engine.stats.maxVoices} data-nodes={engine.stats.nodes} data-state={snapshot.status} data-active={snapshot.activeId || ''} data-last={snapshot.lastId || ''} data-reason={snapshot.reason || ''} data-enabled={snapshot.enabled} data-volume={snapshot.volume} /> : null
}

