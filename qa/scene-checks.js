// Playwright function fixture. Run against npm run preview on port 4173.
// The browser tool can execute this file directly; no app-side test hooks.
async (page) => {
  const browser = page.context().browser()
  const base = 'http://127.0.0.1:4173/?inspect=1'
  const results = { viewports: [], resources: [], shaderFallback: false, webglFallback: false }
  const assert = (condition, message) => { if (!condition) throw new Error(message) }
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  try {
    const test = await context.newPage()
    const errors = []
    test.on('pageerror', error => errors.push(error.message))
    await test.goto(base)
    await test.locator('.phase-visual[data-ready="true"]').waitFor()
    for (const [width, height] of [[1440, 900], [1280, 720], [768, 1024], [390, 844], [320, 568]]) {
      await test.setViewportSize({ width, height })
      await test.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
      await test.evaluate(async () => { await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame) })
      const state = await test.evaluate(() => {
        const visual = document.querySelector('.phase-visual')
        return { width: innerWidth, layout: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, titleRight: document.querySelector('h1').lastElementChild.getBoundingClientRect().right, material: visual.dataset.material, pose: JSON.parse(visual.dataset.pose) }
      })
      assert(state.scroll <= state.layout && state.titleRight <= state.layout, 'Horizontal overflow')
      assert(state.material === 'shader', 'Custom shader was not compiled')
      assert(state.pose.breath === 0 && state.pose.twist === 0, 'Reduced-motion deformation')
      results.viewports.push(state)
      if (width === 1440 || width === 390) await test.screenshot({ path: `artifacts/qa/phase2-fixture-${width}.png` })
    }
    for (let cycle = 0; cycle < 10; cycle++) {
      const full = cycle % 2 === 0
      await test.setViewportSize({ width: full ? 1440 : 390, height: full ? 900 : 844 })
      await test.waitForFunction(quality => document.querySelector('.phase-visual').dataset.quality === quality, full ? 'full' : 'compact')
      await test.evaluate(async () => { await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame) })
      const state = await test.locator('.phase-visual').evaluate(element => ({ geometries: element.dataset.geometries, textures: element.dataset.textures, programs: element.dataset.programs }))
      assert(state.geometries === '1' && state.textures === '2' && state.programs === '1', 'Resource count changed after resize')
      results.resources.push(state)
    }
    assert(errors.length === 0, errors.join('\n'))
  } finally { await context.close() }

  const broken = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  try {
    await broken.addInitScript(() => {
      const original = WebGL2RenderingContext.prototype.shaderSource
      let injected = false
      WebGL2RenderingContext.prototype.shaderSource = function (shader, source) {
        if (!injected && source.includes('vec3 phasePosition')) {
          injected = true
          source = source.replace('vec3 phasePosition', 'vec3 INVALID_SYNTAX phasePosition')
        }
        return original.call(this, shader, source)
      }
    })
    const test = await broken.newPage()
    await test.goto(base)
    await test.locator('.phase-visual[data-material="standard"][data-ready="true"]').waitFor()
    results.shaderFallback = await test.locator('canvas').isVisible()
    assert(results.shaderFallback, 'Standard material fallback did not render')
  } finally { await broken.close() }

  const unsupported = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  try {
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
    results.webglFallback = await test.locator('.loop-fallback').isVisible()
    assert(results.webglFallback && await test.getByRole('link', { name: 'Explore the studies' }).isVisible(), 'SVG/HTML fallback missing')
  } finally { await unsupported.close() }
  return results
}
