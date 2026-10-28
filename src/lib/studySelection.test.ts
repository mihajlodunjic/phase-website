import { describe, expect, it } from 'vitest'
import { studyForKey } from './studySelection'

describe('study tab navigation', () => {
  it('wraps between stable study identifiers in both directions', () => {
    expect(studyForKey('form', 'ArrowLeft')).toBe('afterimage')
    expect(studyForKey('afterimage', 'ArrowRight')).toBe('form')
    expect(studyForKey('echo', 'ArrowRight')).toBe('afterimage')
  })
  it('supports Home and End without using a temporary visual index', () => {
    expect(studyForKey('echo', 'Home')).toBe('form')
    expect(studyForKey('form', 'End')).toBe('afterimage')
  })
  it('leaves vertical arrows and ordinary tab navigation to the browser', () => {
    for (const key of ['ArrowDown', 'ArrowUp', 'Tab', 'Escape']) expect(studyForKey('echo', key)).toBe(null)
  })
})
