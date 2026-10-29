// Real offline synthesis, including a scheduled mid-phrase stop. No files emitted.
async (page) => {
  const context = await page.context().browser().newContext()
  try {
    const test = await context.newPage()
    await test.goto('http://127.0.0.1:5173/')
    return await test.evaluate(async () => {
      const { createSynthVoice } = await import('/src/audio/synth.ts')
      const { createAudioGraph } = await import('/src/audio/audioGraph.ts')
      const { AUDIO_STUDIES } = await import('/src/audio/studies.ts')
      const results = []
      for (const id of ['phase', 'form', 'echo', 'afterimage']) {
        for (const stop of [false, true]) {
          const duration = AUDIO_STUDIES[id].duration
          const sampleRate = 48000
          const ctx = new OfflineAudioContext(1, Math.ceil((duration + .3) * sampleRate), sampleRate)
          const graph = createAudioGraph(ctx, 1)
          const voice = createSynthVoice(ctx, id, .025, graph.input, () => {})
          let stopTime = 0
          const stopped = stop ? ctx.suspend(id === 'afterimage' ? 2 : .55).then(async () => { stopTime = ctx.currentTime; voice.fadeOut(stopTime, .045); await ctx.resume() }) : Promise.resolve()
          const buffer = await ctx.startRendering(); await stopped
          const data = buffer.getChannelData(0)
          let peak = 0, squares = 0, crossings = 0
          for (let i = 0; i < data.length; i++) {
            if (!Number.isFinite(data[i])) throw new Error('Nonfinite audio')
            peak = Math.max(peak, Math.abs(data[i])); squares += data[i] * data[i]
            if (i && data[i] * data[i - 1] < 0) crossings++
          }
          const silenceAt = stop ? stopTime + .15 : duration + .1
          const tailPeak = data.subarray(Math.ceil(silenceAt * sampleRate)).reduce((max, value) => Math.max(max, Math.abs(value)), 0)
          if (peak <= .01 || peak >= .95 || tailPeak > 1e-6) throw new Error(`${id}: signal bounds / tail`)
          results.push({ id, stop, duration, peak, rms: Math.sqrt(squares / data.length), zeroCrossingsPerSecond: crossings / (duration + .3), tailPeak, nodes: voice.nodeCount })
          voice.dispose(); graph.dispose()
        }
      }
      return results
    })
  } finally { await context.close() }
}
