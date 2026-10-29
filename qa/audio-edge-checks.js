// Cancellation, blocked startup and fallback browser paths.
async (page) => {
  const browser = page.context().browser()
  const assert = (v, m) => { if (!v) throw new Error(m) }
  const results = []
  for (const mode of ['delayed-resume', 'reject-resume', 'unsupported', 'no-webgl']) {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    try {
      await context.addInitScript(mode => {
        const Native = window.AudioContext
        window.__phaseContexts = []
        if (mode === 'unsupported') {
          Object.defineProperty(window, 'AudioContext', { configurable: true, value: undefined })
          Object.defineProperty(window, 'webkitAudioContext', { configurable: true, value: undefined })
        } else window.AudioContext = class extends Native {
          constructor(...args) { super(...args); window.__phaseContexts.push(this) }
          resume() {
            if (mode === 'reject-resume' && !window.__phaseRetried) { window.__phaseRetried = true; return Promise.reject(new Error('test policy denial')) }
            const ready = super.resume()
            if (mode !== 'delayed-resume' || window.__phaseReleased) return ready
            return ready.then(() => new Promise(resolve => { window.__phaseRelease = () => { window.__phaseReleased = true; resolve() } }))
          }
        }
        if (mode === 'no-webgl') {
          const get = HTMLCanvasElement.prototype.getContext
          HTMLCanvasElement.prototype.getContext = function (kind, ...args) { return /webgl/.test(kind) ? null : get.call(this, kind, ...args) }
        }
      }, mode)
      const test = await context.newPage()
      await test.goto('http://127.0.0.1:4173/?inspect=1')
      const data = () => test.locator('[data-audio-debug]').evaluate(e => ({ ...e.dataset }))
      if (mode === 'unsupported') {
        assert(await test.getByRole('button', { name: 'Audio unavailable', exact: true }).first().isDisabled(), 'Unsupported not disabled')
        await test.getByRole('button', { name: 'View ECHO study', exact: true }).click()
        await test.getByRole('tab', { name: 'FORM', exact: true }).click()
        assert((await data()).contexts === '0', 'Unsupported creates context')
      } else {
        await test.getByRole('button', { name: 'Play PHASE', exact: true }).click()
        if (mode === 'delayed-resume') {
          await test.waitForFunction(() => typeof window.__phaseRelease === 'function')
          await test.getByRole('button', { name: 'Stop playback', exact: true }).click()
          await test.evaluate(() => window.__phaseRelease())
          await test.evaluate(async () => { for(let i=0;i<12;i++) await new Promise(requestAnimationFrame) })
          assert((await data()).voices === '0' && (await data()).state === 'stopped', 'Late resume starts canceled sound')
          await test.getByRole('button', { name: 'Play PHASE', exact: true }).click()
        } else if (mode === 'reject-resume') {
          await test.waitForFunction(() => document.querySelector('[data-audio-debug]').dataset.state === 'error')
          assert((await data()).voices === '0', 'Rejected resume creates voice')
          await test.getByRole('button', { name: 'Play PHASE', exact: true }).click()
        }
        await test.waitForFunction(() => document.querySelector('[data-audio-debug]').dataset.state === 'playing')
        await test.waitForFunction(() => JSON.parse(document.querySelector('[data-audio-debug]').dataset.energy).rms > .0001)
        if (mode === 'no-webgl') assert(await test.locator('.phase-visual').getAttribute('data-renderer') === 'fallback', 'Missing SVG fallback')
        await test.getByRole('button', { name: 'Stop playback', exact: true }).click()
        await test.waitForFunction(() => document.querySelector('[data-audio-debug]').dataset.voices === '0')
        assert((await data()).contexts === '1', 'More than one context')
      }
      results.push({ mode, ...(await data()) })
    } finally { await context.close() }
  }
  return results
}
