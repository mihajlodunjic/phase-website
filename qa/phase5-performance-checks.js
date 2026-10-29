// New-context startup, warm RAF and dormant render/resource measurements.
async (page) => {
  const browser = page.context().browser()
  const results = []
  for (const [width, height, dpr] of [[1440, 900, 1], [390, 844, 3]]) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dpr, isMobile: width === 390, hasTouch: width === 390 })
    try {
      await context.addInitScript(() => {
        window.__phaseLongTasks = []
        window.__phaseObserver = new PerformanceObserver(list => list.getEntries().forEach(entry => window.__phaseLongTasks.push({ start: entry.startTime, duration: entry.duration })))
        window.__phaseObserver.observe({ type: 'longtask', buffered: true })
        window.__phaseHidden = false
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => window.__phaseHidden })
      })
      const test = await context.newPage()
      await test.goto('http://127.0.0.1:4173/?inspect=1')
      await test.locator('.phase-visual[data-ready="true"]').waitFor()
      const startup = await test.evaluate(() => {
        const canvas = document.querySelector('canvas'), gl = canvas.getContext('webgl2'), debug = gl.getExtension('WEBGL_debug_renderer_info')
        return { readyAt: performance.now(), longTasks: window.__phaseLongTasks.slice(), renderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER), gpuTimerAvailable: !!gl.getExtension('EXT_disjoint_timer_query_webgl2'), buffer: [canvas.width, canvas.height], cssCanvas: [canvas.clientWidth, canvas.clientHeight] }
      })
      await test.evaluate(() => { window.scrollTo({ top: 0, behavior: 'instant' }); document.querySelector('.hero-art').scrollIntoView({ block: 'center', behavior: 'instant' }) })
      await test.evaluate(async () => { for (let i = 0; i < 30; i++) await new Promise(requestAnimationFrame) })
      const warm = await test.evaluate(async () => {
        const start = performance.now(), frames = Number(document.querySelector('.phase-visual').dataset.frames), intervals = []
        let previous = await new Promise(requestAnimationFrame)
        for (let i = 0; i < 120; i++) { const now = await new Promise(requestAnimationFrame); intervals.push(now - previous); previous = now }
        intervals.sort((a, b) => a - b)
        return { duration: performance.now() - start, p50: intervals[60], p95: intervals[114], max: intervals[119], longTasks: window.__phaseLongTasks.filter(task => task.start >= start), renderedFrames: Number(document.querySelector('.phase-visual').dataset.frames) - frames }
      })
      const gpu = await test.evaluate(async () => {
        const gl = document.querySelector('canvas').getContext('webgl2')
        const ext = gl.getExtension('EXT_disjoint_timer_query_webgl2')
        if (!ext) return { available: false }
        const original = gl.drawElements, queries = []
        gl.drawElements = function (...args) {
          if (queries.length >= 60) return original.apply(this, args)
          const query = gl.createQuery()
          gl.beginQuery(ext.TIME_ELAPSED_EXT, query)
          try { return original.apply(this, args) } finally { gl.endQuery(ext.TIME_ELAPSED_EXT); queries.push(query) }
        }
        try {
          for (let i = 0; i < 100; i++) await new Promise(requestAnimationFrame)
          const disjoint = !!gl.getParameter(ext.GPU_DISJOINT_EXT)
          const times = queries.filter(q => gl.getQueryParameter(q, gl.QUERY_RESULT_AVAILABLE)).map(q => gl.getQueryParameter(q, gl.QUERY_RESULT) / 1e6).sort((a, b) => a - b)
          return { available: true, disjoint, completed: times.length, p50: times[Math.floor(times.length * .5)], p95: times[Math.floor(times.length * .95)], max: times.at(-1) }
        } finally { gl.drawElements = original; queries.forEach(q => gl.deleteQuery(q)) }
      })
      // Return to a visible hero before opening a modal (rather than measuring offscreen pause).
      await test.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
      if (width === 390) { await test.getByRole('button', { name: 'Menu', exact: true }).tap(); await test.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Start a project' }).tap() }
      else await test.getByRole('button', { name: 'Start a project', exact: true }).first().click()
      await test.waitForFunction(() => document.querySelector('.phase-visual').dataset.active === 'false')
      const dormant = await test.evaluate(async () => {
        for (let i = 0; i < 10; i++) await new Promise(requestAnimationFrame)
        const before = Number(document.querySelector('.phase-visual').dataset.frames)
        for (let i = 0; i < 30; i++) await new Promise(requestAnimationFrame)
        return { before, after: Number(document.querySelector('.phase-visual').dataset.frames), vectorsRunning: [...document.querySelectorAll('.study-entry [data-study-visual]')].some(el => el.dataset.running === 'true') }
      })
      if (dormant.before !== dormant.after || dormant.vectorsRunning) throw new Error('Modal background did not rest')
      await test.keyboard.press('Escape')
      await test.evaluate(() => document.querySelector('.hero-art').scrollIntoView({ block: 'center', behavior: 'instant' }))
      await test.getByRole('button', { name: 'Motion on', exact: true }).click()
      const paused = await test.evaluate(async () => { for (let i = 0; i < 10; i++) await new Promise(requestAnimationFrame); const before = document.querySelector('.phase-visual').dataset.frames; for (let i = 0; i < 20; i++) await new Promise(requestAnimationFrame); return { before, after: document.querySelector('.phase-visual').dataset.frames } })
      if (paused.before !== paused.after) throw new Error('Motion off still renders')
      await test.getByRole('button', { name: 'Motion off', exact: true }).click()
      await test.evaluate(() => { window.__phaseHidden = true; document.dispatchEvent(new Event('visibilitychange')) })
      await test.waitForFunction(() => document.querySelector('.phase-visual').dataset.active === 'false')
      await test.evaluate(() => { window.__phaseHidden = false; document.dispatchEvent(new Event('visibilitychange')); document.querySelector('.hero-art').scrollIntoView({ block: 'center', behavior: 'instant' }) })
      await test.waitForFunction(() => document.querySelector('.phase-visual').dataset.active === 'true')
      const resources = await test.locator('.phase-visual').evaluate(e => ({ geometries: e.dataset.geometries, textures: e.dataset.textures, programs: e.dataset.programs, calls: e.dataset.calls, triangles: e.dataset.triangles }))
      results.push({ width, height, devicePixelRatio: dpr, startup, warm, gpu, dormant, paused, hiddenReturn: true, resources })
    } finally { await context.close() }
  }
  return results
}


