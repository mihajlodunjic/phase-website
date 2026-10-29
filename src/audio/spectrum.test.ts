import { describe, expect, it } from 'vitest'
import { readSpectrum } from './spectrum'
import { createAudioEnergy } from './types'
import { tonesFor, AUDIO_STUDIES } from './studies'
import type { AudioId } from './types'
import { mapAudioStudy, audioMatches } from '../visuals/audioMapping'
import { mapScenePose, neutralPose } from '../scene/sceneController'

describe('generated score and measured energy', () => {
  it('has finite, different scores whose envelopes finish inside their studies', () => {
    const ids: AudioId[] = ['phase', 'form', 'echo', 'afterimage']
    expect(new Set(ids.map(id => JSON.stringify(tonesFor(id)))).size).toBe(4)
    for (const id of ids) for (const tone of tonesFor(id)) {
      expect(tone.at).toBeGreaterThanOrEqual(0)
      expect(tone.at + tone.duration).toBeLessThan(AUDIO_STUDIES[id].duration)
      expect(tone.attack).toBeLessThan(tone.duration - 0.02)
      expect(tone.frequency).toBeGreaterThan(20)
      expect(tone.amplitude).toBeLessThanOrEqual(0.12)
    }
  })
  it('uses real waveform RMS and cannot show smoothed FFT activity when muted', () => {
    const energy = createAudioEnergy()
    const frequencies = new Float32Array(1024).fill(-20)
    const waveform = new Float32Array(2048).fill(0.025)
    readSpectrum(frequencies, waveform, 48000, 2048, energy)
    expect(energy.rms).toBeCloseTo(0.025)
    expect(energy.level).toBeCloseTo(0.4)
    waveform.fill(0)
    readSpectrum(frequencies, waveform, 48000, 2048, energy)
    expect([energy.bass, energy.mid, energy.high, energy.level, energy.peak]).toEqual([0, 0, 0, 0, 0])
  })
  it('separates low/mid/high bands and ignores nonfinite FFT samples', () => {
    const frequencies = new Float32Array(1024).fill(-Infinity)
    const waveform = new Float32Array(2048).fill(0.01)
    for (const [bin, band] of [[4, 'bass'], [30, 'mid'], [200, 'high']] as const) {
      frequencies.fill(-Infinity); frequencies[bin] = -30
      const energy = readSpectrum(frequencies, waveform, 48000, 2048, createAudioEnergy())
      expect(energy[band]).toBeGreaterThan(0)
      for (const other of ['bass', 'mid', 'high'] as const) if (other !== band) expect(energy[other]).toBe(0)
    }
    waveform.fill(NaN); frequencies.fill(NaN)
    expect(readSpectrum(frequencies, waveform, 48000, 2048, createAudioEnergy()).level).toBe(0)
  })
  it('bounds audio deformation independently of idle and removes it for reduced motion', () => {
    const audio = { ...createAudioEnergy(), playing: true, study: 'form' as const, bass: 100, mid: 100, high: 100 }
    const input = { pointerX: 1, pointerY: 1, scroll: 1, audio }
    for (let time = 0; time < 18; time += 0.2) {
      const pose = mapScenePose(input, time, true, neutralPose())
      expect(Math.abs(pose.breath)).toBeLessThanOrEqual(0.021)
      expect(Math.abs(pose.twist)).toBeLessThanOrEqual(0.04)
      expect(pose.shine).toBeLessThanOrEqual(1.12)
    }
    expect(mapScenePose(input, 4, false, neutralPose())).toEqual(neutralPose())
    audio.playing = false
    expect(mapScenePose(input, 4, true, neutralPose()).shine).toBe(1)
  })
  it('maps only the playing study and follows audio time instead of the idle clock', () => {
    const audio = { ...createAudioEnergy(), playing: true, study: 'echo' as const, elapsed: 4.2, bass: 1, mid: 1, high: 1, level: 1 }
    expect(audioMatches('form', audio)).toBe(false)
    expect(audioMatches('echo', audio)).toBe(true)
    const pose = { compression: 0, drift: 0, signal: 0, wave: 0 }
    expect(mapAudioStudy('echo', audio, pose).signal).toBe(4)
    expect(mapAudioStudy('form', audio, pose).compression).toBe(0.65)
    expect(mapAudioStudy('afterimage', audio, pose)).toMatchObject({ drift: 6, wave: 0.7 })
  })
})
