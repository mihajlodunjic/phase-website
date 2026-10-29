// Warm browser RAF sampling and owned resource counters, not a GPU benchmark.
async (page) => {
  const context = await page.context().browser().newContext({ viewport: { width: 1440, height: 900 } })
  try {
    const test = await context.newPage()
    await test.goto('http://127.0.0.1:4173/?inspect=1')
    await test.locator('.phase-visual[data-ready="true"]').waitFor()
    const sample = async () => test.evaluate(async () => {
      const longTasks = []
      const observer = new PerformanceObserver(list => list.getEntries().forEach(entry => longTasks.push(entry.duration)))
      observer.observe({ type: 'longtask' })
      const intervals = [], energy = [], poses = []
      let previous = await new Promise(requestAnimationFrame)
      for (let i = 0; i < 120; i++) {
        const now = await new Promise(requestAnimationFrame)
        intervals.push(now - previous); previous = now
        energy.push(JSON.parse(document.querySelector('[data-audio-debug]').dataset.energy).level)
        poses.push(JSON.parse(document.querySelector('.phase-visual').dataset.pose))
      }
      observer.disconnect(); intervals.sort((a, b) => a - b)
      return { p50: intervals[60], p95: intervals[114], max: intervals[119], longTasks, maxEnergy: Math.max(...energy), maxBreath: Math.max(...poses.map(p => Math.abs(p.breath))), maxTwist: Math.max(...poses.map(p => Math.abs(p.twist))), maxShine: Math.max(...poses.map(p => p.shine)) }
    })
    await test.evaluate(async () => { for(let i = 0; i < 30; i++) await new Promise(requestAnimationFrame) })
    const idle = await sample()
    await test.getByRole('button', { name: 'Play FORM study', exact: true }).click()
    await test.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
    await test.waitForFunction(() => JSON.parse(document.querySelector('[data-audio-debug]').dataset.energy).level > .01)
    const playing = await sample()
    if (idle.maxEnergy !== 0 || playing.maxEnergy <= 0 || playing.maxBreath > .021 || playing.maxTwist > .04 || playing.maxShine > 1.12) throw new Error('Energy/visual bounds')
    await test.screenshot({ path: 'artifacts/qa/phase4-audio-hero.png' })
    await test.getByRole('button', { name: 'Stop playback', exact: true }).click()
    await test.waitForFunction(() => document.querySelector('[data-audio-debug]').dataset.voices === '0')
    const cycles = []
    for (let i = 0; i < 15; i++) {
      const name = ['FORM', 'ECHO', 'AFTERIMAGE'][i % 3]
      await test.getByRole('button', { name: `Play ${name} study`, exact: true }).click()
      await test.waitForFunction(() => document.querySelector('[data-audio-debug]').dataset.state === 'playing')
      await test.getByRole('button', { name: 'Stop playback', exact: true }).click()
      await test.waitForFunction(() => document.querySelector('[data-audio-debug]').dataset.voices === '0')
      const result = await test.locator('[data-audio-debug]').evaluate(e => ({ contexts: e.dataset.contexts, nodes: e.dataset.nodes, maxVoices: e.dataset.maxVoices }))
      if (result.contexts !== '1' || result.nodes !== '4' || result.maxVoices !== '1') throw new Error('Resource growth ' + JSON.stringify(result))
      cycles.push(result)
    }
    return { viewport: '1440x900 DPR1', userAgent: await test.evaluate(() => navigator.userAgent), idle, playing, cycles: cycles.length, final: cycles.at(-1), renderer: await test.locator('.phase-visual').evaluate(e => ({ geometries: e.dataset.geometries, textures: e.dataset.textures, programs: e.dataset.programs, triangles: e.dataset.triangles, calls: e.dataset.calls })) }
  } finally { await context.close() }
}
