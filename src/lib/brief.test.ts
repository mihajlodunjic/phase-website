import { describe, expect, it } from 'vitest'
import { generateBrief, validateBrief } from './brief'

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
  it('identifies each invalid field so the form can focus and describe it', () => {
    expect(validateBrief({ project: ' ', type: 'Product sound', description: '\n', timing: '', budget: '' })).toEqual({ project: 'Add a project name.', description: 'Add a short description of your idea.' })
    expect(validateBrief({ project: 'Idea', type: '', description: 'A clear signal.', timing: '', budget: '' })).toEqual({})
  })
  it('keeps supplied details and multiline text in the generated copy', () => {
    const result = generateBrief({ project: ' Field notes ', type: ' Product sound ', description: ' Quiet onset.\r\nClear release. ', timing: ' Spring ', budget: ' To be defined ' })
    expect(result).toBe('PHASE / Project brief\n\nProject: Field notes\n\nWork: Product sound\n\nAbout the project: Quiet onset.\nClear release.\n\nTiming: Spring\n\nBudget: To be defined')
  })
})

