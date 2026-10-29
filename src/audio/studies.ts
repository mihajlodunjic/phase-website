import type { AudioId } from './types'
export const AUDIO_STUDIES: Record<AudioId, { name: string; duration: number }> = {
  phase: { name: 'PHASE', duration: 4 }, form: { name: 'FORM', duration: 8 },
  echo: { name: 'ECHO', duration: 9 }, afterimage: { name: 'AFTERIMAGE', duration: 12 },
}
export type Tone = { at: number; duration: number; frequency: number; endFrequency?: number; amplitude: number; attack: number; wave: 'sine' | 'triangle' | 'modal' }

export function tonesFor(id: AudioId): Tone[] {
  if (id === 'echo') return [660, 880, 784, 1046.5, 659.25, 987.77, 783.99, 1174.66].flatMap((frequency, index) => {
    const at = [0.2, 1.1, 2, 3.1, 4.2, 5.4, 6.6, 7.7][index]
    return [
      { at, duration: 0.16, frequency, endFrequency: frequency * (index % 2 ? 0.89 : 1.125), amplitude: 0.12, attack: 0.007, wave: 'sine' as const },
      { at: at + 0.075, duration: 0.13, frequency: frequency * 1.5, amplitude: 0.045, attack: 0.006, wave: 'sine' as const },
    ]
  })
  if (id === 'afterimage') return [98, 146.832, 195.998, 220].flatMap((frequency, index) => [-1, 1].map(direction => ({
    at: 0.05 + index * 0.08, duration: 10.9 - index * 0.1,
    frequency: frequency * Math.pow(2, direction * (3 + index) / 1200),
    amplitude: 0.035, attack: 1.3 + index * 0.2, wave: 'sine' as const,
  })))
  const signature: Tone[] = [
    { at: 0.12, duration: 1.1, frequency: 130.8128, amplitude: 0.12, attack: 0.018, wave: 'modal' },
    { at: 0.42, duration: 0.9, frequency: 195.998, amplitude: 0.08, attack: 0.012, wave: 'modal' },
    { at: 0.82, duration: 1.55, frequency: 261.6256, amplitude: 0.12, attack: 0.02, wave: 'modal' },
  ]
  if (id === 'phase') return [...signature, { at: 1.35, duration: 2.25, frequency: 130.8128, amplitude: 0.055, attack: 0.04, wave: 'sine' }]
  return [...signature,
    { at: 2.7, duration: 2.4, frequency: 65.4064, amplitude: 0.075, attack: 0.08, wave: 'sine' },
    { at: 4.55, duration: 1.4, frequency: 261.6256, amplitude: 0.09, attack: 0.02, wave: 'modal' },
    { at: 4.78, duration: 1.5, frequency: 329.6276, amplitude: 0.065, attack: 0.025, wave: 'modal' },
    { at: 5.12, duration: 2.25, frequency: 391.9954, amplitude: 0.075, attack: 0.03, wave: 'modal' },
  ]
}
