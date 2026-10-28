import { afterEach, describe, expect, it, vi } from 'vitest'
import { subscribeVisualFrame } from './visualScheduler'

const cleanup: (() => void)[] = []
afterEach(() => { cleanup.splice(0).forEach(stop => stop()); vi.unstubAllGlobals() })

describe('shared vector animation scheduler', () => {
  it('shares one frame request and releases it after the last visual stops', () => {
    const pending = new Map<number, FrameRequestCallback>()
    let index = 0
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { pending.set(++index, callback); return index })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => pending.delete(id))
    const first = vi.fn(), second = vi.fn()
    const stopFirst = subscribeVisualFrame(first)
    const stopSecond = subscribeVisualFrame(second)
    cleanup.push(stopFirst, stopSecond)
    expect(pending.size).toBe(1)
    const tick = (time: number) => { const callbacks = [...pending.values()]; pending.clear(); callbacks.forEach(callback => callback(time)) }
    tick(1000)
    tick(1034)
    expect(first).toHaveBeenCalledOnce()
    expect(second).toHaveBeenCalledOnce()
    expect(pending.size).toBe(1)
    stopFirst()
    tick(1068)
    expect(first).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledTimes(2)
    stopSecond()
    expect(pending.size).toBe(0)
  })
  it('caps a long frame and can finish a finite sequence inside its callback', () => {
    const pending = new Map<number, FrameRequestCallback>()
    let index = 0
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { pending.set(++index, callback); return index })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => pending.delete(id))
    let received = 0
    let stop = () => {}
    stop = subscribeVisualFrame(delta => { received = delta; stop() })
    cleanup.push(stop)
    const tick = (time: number) => { const callbacks = [...pending.values()]; pending.clear(); callbacks.forEach(callback => callback(time)) }
    tick(1000)
    tick(100000)
    expect(received).toBe(0.05)
    expect(pending.size).toBe(0)
  })
})
