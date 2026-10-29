// Targeted regressions for the local review. Uses real DOM focus / audio UI.
async (page) => {
  const browser = page.context().browser()
  const assert = (v, message) => { if (!v) throw new Error(message) }
  const results = { layouts: [], errors: [] }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  try {
    const test = await context.newPage()
    test.on('pageerror', error => results.errors.push(error.message))
    test.on('console', message => { if (message.type() === 'error') results.errors.push(message.text()) })
    for (const font of ['native', 'Arial']) for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [1280, 720], [1440, 900]]) {
      await test.setViewportSize({ width, height })
      await test.goto('http://127.0.0.1:4173/?inspect=1')
      if (font === 'Arial') await test.addStyleTag({ content: ':root { --display: Arial, Helvetica, sans-serif; }' })
      await test.locator('.phase-visual[data-ready="true"]').waitFor()
      const layout = await test.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, titleRight: Math.max(...[...document.querySelectorAll('h1 span, .study-entry h3 button')].map(el => el.getBoundingClientRect().right)), contexts: document.querySelector('[data-audio-debug]').dataset.contexts }))
      assert(layout.scroll <= layout.client && layout.titleRight <= layout.client, `Font overflow ${font}/${width}: ${JSON.stringify(layout)}`)
      assert(layout.contexts === '0', 'Visual review activated audio')
      if (font === 'native' && [1440, 390, 320].includes(width)) await test.screenshot({ path: `artifacts/qa/review-after-${width}.png`, fullPage: true })
      if (font === 'Arial' && width === 320) { await test.locator('#work').scrollIntoViewIfNeeded(); await test.screenshot({ path: 'artifacts/qa/review-after-font-320.png', fullPage: true }) }
      results.layouts.push({ font, width, height, ...layout })
    }
    await test.setViewportSize({ width: 390, height: 844 })
    await test.goto('http://127.0.0.1:4173/?inspect=1')
    await test.getByRole('button', { name: 'Enable sound', exact: true }).click()
    await test.waitForFunction(() => document.querySelector('[data-audio-debug]').dataset.state === 'ready')
    await test.locator('.global-audio-player').getByRole('button', { name: 'Turn sound off', exact: true }).focus()
    await test.keyboard.press('Enter')
    await test.waitForFunction(() => document.activeElement.classList.contains('sound-toggle'))
    assert(await test.getByRole('button', { name: 'Enable sound', exact: true }).evaluate(el => document.activeElement === el), 'Player dismissal did not restore activation focus')
    await test.keyboard.press('Tab')
    assert(await test.evaluate(() => document.activeElement.classList.contains('menu-toggle')), 'Tab restarted from page beginning')
    await test.getByRole('button', { name: 'Play ECHO study', exact: true }).click()
    await test.waitForFunction(() => document.querySelector('[data-audio-debug]').dataset.state === 'playing')
    await test.locator('.global-audio-player').getByRole('button', { name: 'Turn sound off', exact: true }).focus()
    await test.keyboard.press('Enter')
    await test.waitForFunction(() => document.activeElement.getAttribute('aria-label') === 'Play ECHO study')
    const restored = await test.getByRole('button', { name: 'Play ECHO study', exact: true }).evaluate(el => ({ focused: document.activeElement === el, top: el.getBoundingClientRect().top, bottom: el.getBoundingClientRect().bottom, height: innerHeight }))
    assert(restored.focused && restored.top >= 0 && restored.bottom <= restored.height, 'Restored study focus not visible')
    await test.waitForFunction(() => document.querySelector('[data-audio-debug]').dataset.voices === '0')
    assert(await test.locator('[data-audio-debug]').getAttribute('data-state') === 'off', 'Focus restoration restarted sound')
    results.focus = { headerReturn: true, nextTabMenu: true, studyReturn: restored, state: 'off' }
  } finally { await context.close() }
  const moving = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  try {
    const test = await moving.newPage()
    await test.goto('http://127.0.0.1:4173/?inspect=1')
    await test.getByRole('button', { name: 'View ECHO study', exact: true }).click()
    const note = test.locator('.study-panel:not([hidden]) .panel-sound-status')
    assert(await note.innerText() === 'Visual preview', 'Silent preview label')
    await test.getByRole('dialog').getByRole('button', { name: 'Play ECHO study', exact: true }).click()
    await test.waitForFunction(() => document.querySelector('[data-audio-debug]').dataset.state === 'playing')
    assert(await note.innerText() === 'Following sound', 'Playing visual label contradictory')
    await test.screenshot({ path: 'artifacts/qa/review-after-playing-label.png' })
    await test.getByRole('button', { name: 'Pause motion in study', exact: true }).click()
    assert(await note.innerText() === 'Static visual', 'Paused visual label')
    await test.getByRole('button', { name: 'Enable motion in study', exact: true }).click()
    assert(await note.innerText() === 'Following sound', 'Resumed visual label')
    await test.getByRole('dialog').getByRole('button', { name: 'Stop ECHO study', exact: true }).click()
    assert(await note.innerText() === 'Visual preview', 'Stopped visual label')
    results.labels = ['Visual preview', 'Following sound', 'Static visual', 'Following sound', 'Visual preview']
  } finally { await moving.close() }
  const pending = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  try {
    await pending.addInitScript(() => {
      const Native = window.AudioContext
      window.AudioContext = class extends Native {
        resume() { return super.resume().then(() => new Promise(resolve => { window.__reviewResume = resolve })) }
      }
    })
    const test = await pending.newPage()
    await test.goto('http://127.0.0.1:4173/?inspect=1')
    await test.getByRole('button', { name: 'Enable sound', exact: true }).click()
    const status = test.locator('.global-audio-player [role=status]')
    assert(await status.innerText() === 'Enabling sound\u2026', 'Broken enable feedback')
    await test.waitForFunction(() => typeof window.__reviewResume === 'function')
    await test.getByRole('button', { name: 'Stop playback', exact: true }).click()
    await test.evaluate(() => window.__reviewResume())
    await test.getByRole('button', { name: 'Play FORM study', exact: true }).click()
    assert(await status.innerText() === 'Starting FORM\u2026', 'Broken study feedback')
    await test.screenshot({ path: 'artifacts/qa/review-after-starting-text.png' })
    await test.getByRole('button', { name: 'Stop playback', exact: true }).click()
    results.pendingMessages = ['Enabling sound\u2026', 'Starting FORM\u2026']
  } finally { await pending.close() }
  assert(results.errors.length === 0, results.errors.join('\n'))
  return results
}

