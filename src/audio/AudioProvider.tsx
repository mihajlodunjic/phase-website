import { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { AudioEngine } from './audioEngine'

const AudioContextStore = createContext<AudioEngine | null>(null)
export function AudioProvider({ children }: { children: ReactNode }) {
  const [engine] = useState(() => new AudioEngine())
  useEffect(() => engine.attach(), [engine])
  return <AudioContextStore.Provider value={engine}>{children}</AudioContextStore.Provider>
}
export function useAudio() {
  const engine = useContext(AudioContextStore)
  if (!engine) throw new Error('AudioProvider is required')
  const snapshot = useSyncExternalStore(engine.subscribe, engine.getSnapshot, engine.getSnapshot)
  return { engine, snapshot }
}
