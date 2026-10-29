// Full real-time endings. No saved audio files; each starts from an actual Play click.
async (page) => {
  const context = await page.context().browser().newContext({ reducedMotion: 'reduce' })
  const results = []
  try {
    const test = await context.newPage()
    await test.goto('http://127.0.0.1:4173/?inspect=1')
    for (const [id, seconds] of [['PHASE', 4], ['FORM', 8], ['ECHO', 9], ['AFTERIMAGE', 12]]) {
      const start = Date.now()
      await test.getByRole('button', { name: id === 'PHASE' ? 'Play PHASE' : `Play ${id} study`, exact: true }).click()
      await test.waitForFunction(() => document.querySelector('[data-audio-debug]').dataset.state === 'playing')
      await test.waitForFunction(() => JSON.parse(document.querySelector('[data-audio-debug]').dataset.energy).peak > .0001)
      await test.waitForFunction(() => document.querySelector('[data-audio-debug]').dataset.reason === 'ended', undefined, { timeout: (seconds + 3) * 1000 })
      const result = await test.locator('[data-audio-debug]').evaluate(element => ({ ...element.dataset, energy: JSON.parse(element.dataset.energy), progress: document.querySelector('progress').value }))
      if (result.state !== 'stopped' || result.voices !== '0' || result.nodes !== '4' || result.contexts !== '1' || result.maxVoices !== '1' || result.energy.level !== 0 || result.progress !== seconds) throw new Error(`${id} did not finish cleanly: ${JSON.stringify(result)}`)
      results.push({ id, seconds, wallMilliseconds: Date.now() - start, maxOutputPeak: Number(result.maxPeak), voices: result.voices, nodes: result.nodes, progress: result.progress })
    }
    return results
  } finally { await context.close() }
}

