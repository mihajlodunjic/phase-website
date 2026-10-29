import { clampAudio } from './types'

export function rampParameter(parameter: AudioParam, target: number, now: number, seconds = 0.03) {
  if (typeof parameter.cancelAndHoldAtTime === 'function') parameter.cancelAndHoldAtTime(now)
  else { parameter.cancelScheduledValues(now); parameter.setValueAtTime(parameter.value, now) }
  parameter.linearRampToValueAtTime(target, now + seconds)
}

export function createAudioGraph(context: BaseAudioContext, initialVolume = 0.2) {
  const input = context.createGain()
  input.gain.value = 0.6 // Headroom is independent of the user volume.
  const volume = context.createGain()
  volume.gain.value = clampAudio(initialVolume)
  const limiter = context.createDynamicsCompressor()
  limiter.threshold.value = -12
  limiter.knee.value = 12
  limiter.ratio.value = 12
  limiter.attack.value = 0.004
  limiter.release.value = 0.12
  const analyser = context.createAnalyser()
  analyser.fftSize = 2048
  analyser.smoothingTimeConstant = 0.55
  input.connect(volume).connect(limiter).connect(analyser).connect(context.destination)
  const nodes = [input, volume, limiter, analyser]
  return { input, volume, analyser, nodes, dispose: () => nodes.forEach(node => node.disconnect()) }
}
export type AudioGraph = ReturnType<typeof createAudioGraph>
