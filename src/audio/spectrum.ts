import { clampAudio } from './types'
import type { AudioEnergy } from './types'

export function readSpectrum(frequencies: Float32Array, waveform: Float32Array, sampleRate: number, fftSize: number, out: AudioEnergy) {
  const band = (low: number, high: number, gain: number) => {
    const first = Math.max(1, Math.ceil(low * fftSize / sampleRate))
    const last = Math.min(frequencies.length - 1, Math.floor(high * fftSize / sampleRate))
    let sum = 0
    for (let i = first; i <= last; i++) {
      const db = frequencies[i]
      const amplitude = Number.isFinite(db) ? Math.pow(10, Math.min(0, db) / 20) : 0
      sum += amplitude * amplitude
    }
    return clampAudio(Math.sqrt(sum / Math.max(1, last - first + 1)) * gain)
  }
  let squares = 0, peak = 0
  for (let i = 0; i < waveform.length; i++) {
    const value = Number.isFinite(waveform[i]) ? waveform[i] : 0
    squares += value * value
    peak = Math.max(peak, Math.abs(value))
  }
  out.rms = Math.sqrt(squares / Math.max(1, waveform.length))
  out.peak = peak
  out.level = clampAudio(out.rms * 16)
  // A silent output cannot inherit activity from the analyser's FFT smoothing.
  out.bass = out.rms < 1e-6 ? 0 : band(30, 190, 90)
  out.mid = out.rms < 1e-6 ? 0 : band(190, 2400, 180)
  out.high = out.rms < 1e-6 ? 0 : band(2400, 10000, 400)
  return out
}
