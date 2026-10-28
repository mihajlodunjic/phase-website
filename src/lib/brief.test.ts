import { describe, expect, it } from 'vitest'
import { generateBrief } from './brief'

describe('project brief', () => {
  it('preserves the brief and provides honest defaults for optional fields', () => {
    const result = generateBrief({ project: '  Resonance  ', type: 'Sonic identity', description: 'A quiet\nrecognition signal.', timing: '', budget: ' ' })
    expect(result).toContain('Project: Resonance')
    expect(result).toContain('A quiet\nrecognition signal.')
    expect(result).toContain('Timing: To be discussed')
    expect(result).toContain('Budget: Not sure yet')
    expect(result).not.toContain('sent')
  })
  it('rejects whitespace-only required fields', () => {
    expect(() => generateBrief({ project: ' ', type: 'Product sound', description: 'Something', timing: '', budget: '' })).toThrow()
  })
})
