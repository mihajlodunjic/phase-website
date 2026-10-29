// Production UI / clipboard / keyboard / responsive verification.
async (page) => {
  const browser = page.context().browser()
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', permissions: ['clipboard-read', 'clipboard-write'] })
  const assert = (value, message) => { if (!value) throw new Error(message) }
  const results = { viewports: [], clipboard: [], errors: [] }
  try {
    const test = await context.newPage()
    test.on('pageerror', error => results.errors.push(error.message))
    test.on('console', message => { if (message.type() === 'error') results.errors.push(message.text()) })
    for (const [width, height] of [[1440, 900], [1280, 720], [768, 1024], [390, 844], [320, 568]]) {
      await test.setViewportSize({ width, height })
      await test.goto('http://127.0.0.1:4173/?inspect=1')
      await test.locator('.phase-visual[data-ready="true"]').waitFor()
      const dimensions = await test.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, heroTitle: document.querySelector('h1').getBoundingClientRect().right, ctaBottom: document.querySelector('.hero-actions').getBoundingClientRect().bottom }))
      assert(dimensions.scroll <= dimensions.client && dimensions.heroTitle <= dimensions.client, 'Page/title overflow ' + width)
      await test.screenshot({ path: `artifacts/qa/phase5-page-${width}.png`, fullPage: true })
      if (width === 1440) {
        await test.keyboard.press('Tab')
        assert(await test.evaluate(() => document.activeElement.classList.contains('skip-link')), 'Skip link not first')
        await test.keyboard.press('Enter')
        assert(await test.evaluate(() => document.activeElement.id === 'main'), 'Skip link does not focus main')
      }
      const opener = test.getByRole('button', { name: 'Start a project', exact: true }).last()
      await opener.click()
      const dialog = test.getByRole('dialog')
      assert(await test.evaluate(() => document.activeElement.getAttribute('aria-label')) === 'Close project brief', 'Initial brief focus')
      await test.keyboard.press('Shift+Tab')
      assert(await test.evaluate(() => document.activeElement.textContent) === 'Generate brief', 'Backward focus wrap')
      await test.keyboard.press('Tab')
      assert(await test.evaluate(() => document.activeElement.getAttribute('aria-label')) === 'Close project brief', 'Forward focus wrap')
      await test.getByRole('button', { name: 'Generate brief', exact: true }).click()
      assert(await test.evaluate(() => document.activeElement.id) === 'brief-project', 'Invalid field focus')
      assert(await dialog.locator('[aria-invalid="true"]').count() === 2, 'Required validation missing')
      await test.locator('#brief-project').fill('  A quieter signal  ')
      await test.locator('#brief-description').fill('A warm onset.\nA clear release for a focused reading tool.')
      await test.locator('#brief-type').selectOption({ label: 'Product sound' })
      await test.locator('#brief-timing').fill('Spring exploration')
      await test.getByRole('button', { name: 'Generate brief', exact: true }).click()
      assert(await test.evaluate(() => document.activeElement.id) === 'brief-title', 'Result not focused')
      assert(await test.getByRole('heading', { name: 'Your project brief.', exact: true }).isVisible(), 'Result heading')
      const expected = await test.locator('#brief-output').inputValue()
      assert(expected.includes('Project: A quieter signal') && expected.includes('A warm onset.\nA clear release') && expected.includes('Budget: Not sure yet'), 'Wrong generated text')
      const bounds = await dialog.evaluate(element => {
        const close = element.querySelector('.dialog-top button').getBoundingClientRect()
        const actions = element.querySelector('.brief-actions').getBoundingClientRect()
        return { client: element.clientWidth, scroll: element.scrollWidth, closeTop: close.top, actionsBottom: actions.bottom, height: innerHeight }
      })
      assert(bounds.scroll <= bounds.client && bounds.closeTop >= 0 && bounds.actionsBottom <= height, 'Brief actions out of bounds ' + width)
      await test.screenshot({ path: `artifacts/qa/phase5-brief-${width}.png` })
      await test.getByRole('button', { name: 'Copy brief', exact: true }).click()
      await test.getByRole('status').filter({ hasText: 'Brief copied.' }).waitFor()
      assert((await test.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n') === expected, 'Clipboard differs from output')
      results.clipboard.push(width)
      await test.getByRole('button', { name: 'Edit details', exact: true }).click()
      assert(await test.locator('#brief-description').inputValue() === 'A warm onset.\nA clear release for a focused reading tool.', 'Editing lost draft')
      await test.locator('#brief-project').fill('A revised signal')
      await test.getByRole('button', { name: 'Generate brief', exact: true }).click()
      assert((await test.locator('#brief-output').inputValue()).includes('Project: A revised signal'), 'Result stayed stale after edit')
      await test.keyboard.press('Escape')
      await dialog.waitFor({ state: 'hidden' })
      assert(await opener.evaluate(e => document.activeElement === e), 'Brief opener focus not restored')
      results.viewports.push({ width, height, ...dimensions, brief: bounds })
    }
    const footer = test.getByRole('navigation', { name: 'Footer navigation', exact: true })
    for (const id of ['work', 'approach', 'studio', 'top']) {
      await footer.getByRole('link', { name: id === 'top' ? 'Back to top' : id[0].toUpperCase() + id.slice(1), exact: true }).click()
      await test.waitForFunction(id => document.activeElement.id === id, id)
      assert(test.url().endsWith('#' + id), 'Footer anchor hash')
    }
    results.footerAnchors = true
    assert(results.errors.length === 0, results.errors.join('\n'))
  } finally { await context.close() }
  for (const mode of ['denied', 'absent']) {
    const fallback = await browser.newContext({ viewport: { width: 320, height: 568 }, reducedMotion: 'reduce' })
    try {
      await fallback.addInitScript(mode => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: mode === 'absent' ? undefined : { writeText: async () => { throw new DOMException('Denied', 'NotAllowedError') } } }), mode)
      if (mode === 'absent') await fallback.addInitScript(() => {
        const native = HTMLCanvasElement.prototype.getContext
        HTMLCanvasElement.prototype.getContext = function (kind, ...args) { return /webgl/.test(kind) ? null : native.call(this, kind, ...args) }
      })
      const test = await fallback.newPage()
      await test.goto('http://127.0.0.1:4173/')
      await test.getByRole('button', { name: 'Start a project', exact: true }).last().click()
      await test.locator('#brief-project').fill('Manual copy')
      await test.locator('#brief-description').fill('A single considered tone.')
      await test.getByRole('button', { name: 'Generate brief', exact: true }).click()
      await test.getByRole('button', { name: 'Copy brief', exact: true }).click()
      await test.getByRole('status').filter({ hasText: 'Copy it manually' }).waitFor()
      const selection = await test.locator('#brief-output').evaluate(element => ({ focused: document.activeElement === element, start: element.selectionStart, end: element.selectionEnd, length: element.value.length }))
      assert(selection.focused && selection.start === 0 && selection.end === selection.length, 'Manual copy does not select complete text')
      results[mode] = selection
      if (mode === 'absent') { await test.locator('.phase-visual[data-renderer=fallback]').waitFor(); results.briefWithoutWebGL = true }
      if (mode === 'denied') await test.screenshot({ path: 'artifacts/qa/phase5-copy-fallback-320.png' })
    } finally { await fallback.close() }
  }
  return results
}


