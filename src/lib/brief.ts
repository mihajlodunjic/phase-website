export type BriefInput = { project: string; type: string; description: string; timing: string; budget: string }
export type BriefErrors = Partial<Record<'project' | 'description', string>>

export function validateBrief(input: BriefInput): BriefErrors {
  const errors: BriefErrors = {}
  if (!input.project.trim()) errors.project = 'Add a project name.'
  if (!input.description.trim()) errors.description = 'Add a short description of your idea.'
  return errors
}

export function generateBrief(input: BriefInput) {
  if (Object.keys(validateBrief(input)).length) throw new Error('Add a project name and a short description.')
  return [
    'PHASE / Project brief',
    `Project: ${input.project.trim()}`,
    `Work: ${input.type.trim() || 'Let’s figure it out'}`,
    `About the project: ${input.description.trim().replace(/\r\n/g, '\n')}`,
    `Timing: ${input.timing.trim() || 'To be discussed'}`,
    `Budget: ${input.budget.trim() || 'Not sure yet'}`,
  ].join('\n\n')
}
