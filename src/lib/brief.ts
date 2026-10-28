export type BriefInput = { project: string; type: string; description: string; timing: string; budget: string }

export function generateBrief(input: BriefInput) {
  if (!input.project.trim() || !input.description.trim()) throw new Error('Add a project name and a short description.')
  return [
    'PHASE / Project brief',
    `Project: ${input.project.trim()}`,
    `Work: ${input.type}`,
    `About the project: ${input.description.trim()}`,
    `Timing: ${input.timing.trim() || 'To be discussed'}`,
    `Budget: ${input.budget.trim() || 'Not sure yet'}`,
  ].join('\n\n')
}
