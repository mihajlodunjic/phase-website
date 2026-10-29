// Explicit DOM/keyboard/contrast checks. This is not a screen-reader or WCAG certification.
async (page) => {
  const context = await page.context().browser().newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const assert = (v, m) => { if (!v) throw new Error(m) }
  const results = {}
  try {
    const test = await context.newPage()
    await test.goto('http://127.0.0.1:4173/?inspect=1')
    const audit = async () => test.evaluate(() => {
      const rgb = value => (value.match(/[\d.]+/g) || []).map(Number)
      const blend = (color, bg, alpha) => color.slice(0, 3).map((v, i) => v * alpha + bg[i] * (1 - alpha))
      const luminance = c => c.slice(0, 3).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4 }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0)
      const issues = [], sizes = [], ratios = []
      const scope = document.querySelector('dialog[open]') || document.body
      for (const element of scope.querySelectorAll('*')) {
        if (element.namespaceURI !== 'http://www.w3.org/1999/xhtml' || !element.getClientRects().length) continue
        const text = [...element.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.textContent).join('').trim()
        const css = getComputedStyle(element)
        if (!text || css.visibility !== 'visible' || css.display === 'none') continue
        let opacity = 1, bg = [16, 18, 17]
        const ancestors = []
        for (let node = element; node; node = node.parentElement) ancestors.unshift(node)
        for (const node of ancestors) { const style = getComputedStyle(node), color = rgb(style.backgroundColor); opacity *= Number(style.opacity); if (color.length >= 3) bg = blend(color, bg, color[3] ?? 1) }
        const color = rgb(css.color), fg = blend(color, bg, (color[3] ?? 1) * opacity)
        const first = luminance(fg), second = luminance(bg)
        const ratio = (Math.max(first, second) + .05) / (Math.min(first, second) + .05)
        const size = parseFloat(css.fontSize)
        const large = size >= 24 || size >= 18.66 && Number(css.fontWeight) >= 700
        if (ratio < (large ? 3 : 4.5)) issues.push({ text: text.slice(0, 50), ratio, size })
        if (size < 12) issues.push({ text: text.slice(0, 50), size })
        ratios.push(ratio); sizes.push(size)
      }
      return { checked: sizes.length, minRatio: Math.min(...ratios), minSize: Math.min(...sizes), issues }
    })
    results.pageContrast = await audit()
    assert(results.pageContrast.issues.length === 0, JSON.stringify(results.pageContrast.issues))
    assert(await test.locator('.phase-visual').getAttribute('aria-hidden') === 'true', 'Decorative scene exposed')
    assert(await test.locator('main').count() === 1 && await test.getByRole('heading', { level: 1 }).count() === 1, 'Landmark/heading hierarchy')
    await test.getByRole('button', { name: 'Start a project', exact: true }).first().click()
    await test.getByRole('button', { name: 'Generate brief', exact: true }).click()
    results.formContrast = await audit()
    assert(results.formContrast.issues.length === 0, JSON.stringify(results.formContrast.issues))
    for (const name of ['project', 'description']) {
      const field = test.locator('#brief-' + name)
      assert(await field.getAttribute('aria-invalid') === 'true' && !!(await field.getAttribute('aria-describedby')), 'Error not associated')
    }
    await test.keyboard.press('Escape')
    await test.setViewportSize({ width: 390, height: 844 })
    await test.getByRole('button', { name: 'Menu', exact: true }).click()
    await test.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('button', { name: 'Start a project' }).click()
    await test.keyboard.press('Escape')
    assert(await test.evaluate(() => document.activeElement.classList.contains('menu-toggle')), 'Menu brief focus return')
    results.mobileProjectMenu = true
    await test.getByRole('button', { name: 'Enable sound', exact: true }).click()
    await test.waitForFunction(() => document.querySelector('[data-audio-debug]').dataset.state === 'ready')
    const targets = [
      test.getByRole('button', { name: 'View FORM study', exact: true }),
      test.getByRole('button', { name: 'Play ECHO study', exact: true }),
      test.getByRole('button', { name: 'Start a project', exact: true }).last(),
      test.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link', { name: 'Back to top', exact: true }),
    ]
    for (const target of targets) {
      await target.focus()
      const visible = await target.evaluate(element => { const rect = element.getBoundingClientRect(), bar = document.querySelector('.global-audio-player').getBoundingClientRect(); return { top: rect.top, bottom: rect.bottom, barTop: bar.top } })
      assert(visible.top >= 0 && visible.bottom <= visible.barTop, 'Focused control obscured by player ' + JSON.stringify(visible))
    }
    results.playerFocusVisible = true
    await test.locator('.global-audio-player').getByRole('button', { name: 'Turn sound off', exact: true }).click()
    // Reflow viewport equivalent to a 1280x720 layout at 200% browser zoom.
    await test.setViewportSize({ width: 640, height: 360 })
    await test.goto('http://127.0.0.1:4173/?inspect=1')
    assert(await test.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), 'Reflow page overflow')
    await test.getByRole('button', { name: 'Start a project', exact: true }).last().click()
    await test.locator('#brief-project').fill('Reflow check')
    await test.locator('#brief-description').fill('The result stays available on a short screen.')
    await test.getByRole('button', { name: 'Generate brief', exact: true }).click()
    const reflow = await test.getByRole('dialog').evaluate(element => ({ width: element.clientWidth, scroll: element.scrollWidth, close: element.querySelector('.dialog-top button').getBoundingClientRect().top, copyBottom: element.querySelector('.brief-actions').getBoundingClientRect().bottom, height: innerHeight }))
    assert(reflow.width >= reflow.scroll && reflow.close >= 0 && reflow.copyBottom <= reflow.height, 'Reflow dialog inaccessible')
    await test.screenshot({ path: 'artifacts/qa/phase5-reflow-640x360.png' })
    results.reflow = reflow
    return results
  } finally { await context.close() }
}
