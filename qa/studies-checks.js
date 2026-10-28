// Execute with the browser tool's filename argument after npm run preview :4173.
async (page) => {
  const browser = page.context().browser()
  const base = 'http://127.0.0.1:4173/?inspect=1'
  const assert = (condition, message) => { if (!condition) throw new Error(message) }
  const results = { viewports: [], tabsAndFocus: [], anchors: [], audioContexts: 0 }
  const guardAudio = () => {
    window.__phaseAudioContexts = 0
    for (const key of ['AudioContext', 'webkitAudioContext']) {
      if (key in window) Object.defineProperty(window, key, { configurable: true, value: function () { window.__phaseAudioContexts++; throw new Error('Unexpected audio activation') } })
    }
  }
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  try {
    await context.addInitScript(guardAudio)
    const test = await context.newPage()
    const errors = []
    test.on('pageerror', error => errors.push(error.message))
    for (const width of [1440, 768, 390, 320]) {
      await test.setViewportSize({ width, height: width === 320 ? 568 : width === 390 ? 844 : 900 })
      await test.goto(base)
      await test.evaluate(() => document.querySelector('#work').scrollIntoView({ behavior: 'instant', block: 'start' }))
      const dimensions = await test.evaluate(() => ({ width: innerWidth, client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }))
      assert(dimensions.scroll <= dimensions.client, 'Page overflow')
      results.viewports.push(dimensions)
      if ([1440, 390, 320].includes(width)) await test.screenshot({ path: `artifacts/qa/phase3-work-${width}.png` })
      for (const id of ['FORM', 'ECHO', 'AFTERIMAGE']) {
        await test.getByRole('button', { name: `View ${id} study`, exact: true }).click()
        const dialog = test.getByRole('dialog')
        await dialog.waitFor({ state: 'visible' })
        const bounds = await dialog.evaluate(element => ({ client: element.clientWidth, scroll: element.scrollWidth }))
        assert(bounds.scroll <= bounds.client, `Dialog overflow: ${width} / ${id}`)
        assert(await test.getByRole('tabpanel').count() === 1, 'More than one visible panel')
        assert(await test.getByRole('tab', { name: id, exact: true }).getAttribute('aria-selected') === 'true', 'Wrong study selected')
        assert(await test.getByRole('button', { name: 'Replay motion' }).isDisabled(), 'Reduced motion replay')
        assert(await test.evaluate(() => document.activeElement.getAttribute('aria-label')) === 'Close study', 'Initial dialog focus')
        await test.getByRole('tab', { name: id, exact: true }).focus()
        await test.keyboard.press('Home')
        await test.keyboard.press('ArrowLeft')
        assert(await test.getByRole('tab', { name: 'AFTERIMAGE', exact: true }).getAttribute('aria-selected') === 'true', 'Left wrap')
        await test.keyboard.press('ArrowRight')
        await test.keyboard.press('ArrowRight')
        assert(await test.getByRole('tab', { name: 'ECHO', exact: true }).getAttribute('aria-selected') === 'true', 'Arrow selection')
        for (let i = 0; i < 8; i++) {
          await test.keyboard.press('Tab')
          assert(await dialog.evaluate(element => element.contains(document.activeElement)), 'Focus left modal')
        }
        if (width === 320 && id === 'AFTERIMAGE') await test.screenshot({ path: 'artifacts/qa/phase3-panel-320.png' })
        await test.keyboard.press('Escape')
        await dialog.waitFor({ state: 'hidden' })
        assert(await test.evaluate(() => document.activeElement.getAttribute('aria-label')) === `View ${id} study`, 'Opener focus not restored')
        results.tabsAndFocus.push(`${width}/${id}`)
      }
      if (width <= 390) {
        for (const section of ['Work', 'Approach', 'Studio']) {
          await test.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
          await test.getByRole('button', { name: 'Menu', exact: true }).click()
          assert(await test.evaluate(() => document.activeElement.textContent) === 'Work', 'Menu did not focus first link')
          await test.getByRole('navigation').getByRole('link', { name: section, exact: true }).click()
          await test.waitForFunction(id => document.activeElement.id === id, section.toLowerCase())
          assert(test.url().endsWith(`#${section.toLowerCase()}`), 'Anchor URL missing')
          assert(await test.getByRole('button', { name: 'Menu', exact: true }).getAttribute('aria-expanded') === 'false', 'Menu remained open')
          results.anchors.push(`${width}/${section}`)
        }
        await test.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
        await test.getByRole('button', { name: 'Menu', exact: true }).click()
        await test.keyboard.press('Escape')
        assert(await test.evaluate(() => document.activeElement.classList.contains('menu-toggle')), 'Menu Escape focus')
      }
    }
    results.audioContexts = await test.evaluate(() => window.__phaseAudioContexts)
    assert(results.audioContexts === 0 && errors.length === 0, errors.join('\n') || 'Audio was activated')
  } finally { await context.close() }

  const moving = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  try {
    await moving.addInitScript(guardAudio)
    const test = await moving.newPage()
    await test.goto(base)
    await test.getByRole('button', { name: 'View FORM study', exact: true }).click()
    const visual = test.locator('.study-panel:not([hidden]) svg')
    await test.waitForFunction(() => Number(document.querySelector('.study-panel:not([hidden]) svg').dataset.elapsed) > 1.25)
    const transform = await visual.locator('[data-ring]').first().getAttribute('transform')
    assert(/scale\(0\.[123]/.test(transform), 'FORM did not gather into an impulse')
    await test.screenshot({ path: 'artifacts/qa/phase3-form-pulse.png' })
    await visual.locator('g').first().waitFor()
    await test.waitForFunction(() => document.querySelector('.study-panel:not([hidden]) svg').dataset.running === 'false')
    const ended = await visual.getAttribute('data-frames')
    await test.evaluate(async () => { for (let i = 0; i < 12; i++) await new Promise(requestAnimationFrame) })
    assert(ended === await visual.getAttribute('data-frames'), 'Finite study still rendering')
    const background = await test.locator('.study-entry svg').evaluateAll(elements => elements.every(element => element.dataset.running === 'false'))
    assert(background, 'Background study motion not paused')
    await test.getByRole('button', { name: 'Replay motion' }).click()
    await test.waitForFunction(() => document.querySelector('.study-panel:not([hidden]) svg').dataset.running === 'true')
    await test.getByRole('button', { name: 'Pause motion in study' }).click()
    await test.getByRole('tab', { name: 'ECHO', exact: true }).click()
    assert(await test.getByRole('button', { name: 'Replay motion' }).isDisabled(), 'Paused replay remained enabled')
    assert(await test.evaluate(() => window.__phaseAudioContexts) === 0, 'Visual actions activated audio')
    results.motion = { impulse: true, finiteSequenceStopped: true, replay: true, backgroundPaused: true, selectionWithMotionOff: true }
  } finally { await moving.close() }

  const unsupported = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  try {
    await unsupported.addInitScript(guardAudio)
    await unsupported.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        if (['webgl', 'webgl2', 'experimental-webgl'].includes(type)) return null
        return original.call(this, type, ...args)
      }
    })
    const test = await unsupported.newPage()
    await test.goto(base)
    await test.locator('.phase-visual[data-renderer="fallback"]').waitFor()
    for (const name of ['FORM', 'ECHO', 'AFTERIMAGE']) {
      await test.getByRole('button', { name: `View ${name} study`, exact: true }).click()
      assert(await test.getByRole('tabpanel').isVisible(), 'Study unavailable without WebGL')
      await test.keyboard.press('Escape')
    }
    results.noWebgl = true
  } finally { await unsupported.close() }
  return results
}
