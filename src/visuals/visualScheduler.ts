type Frame = (delta: number) => void
const subscribers = new Set<Frame>()
let frame = 0
let previous = 0
let pending = 0

function tick(now: number) {
  frame = 0
  if (previous) pending += Math.min((now - previous) / 1000, 0.05)
  previous = now
  // Slow vector motion needs only 30 updates/s. This is independent of Fiber's
  // sole WebGL renderer; no extra Canvas or renderer is created for the studies.
  if (pending >= 1 / 30) {
    const delta = Math.min(pending, 0.05)
    pending = 0
    subscribers.forEach(update => update(delta))
  }
  if (subscribers.size && !frame) frame = requestAnimationFrame(tick)
}

export function subscribeVisualFrame(update: Frame) {
  subscribers.add(update)
  if (!frame) frame = requestAnimationFrame(tick)
  return () => {
    subscribers.delete(update)
    if (!subscribers.size) {
      cancelAnimationFrame(frame)
      frame = 0
      previous = 0
      pending = 0
    }
  }
}
