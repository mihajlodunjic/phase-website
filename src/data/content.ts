export const studies = [
  {
    id: 'form', name: 'FORM', field: 'Sonic identity',
    description: 'A compact sonic signature built on clarity, tension and release.',
    concept: 'A sonic identity reduced to a few essential gestures. This study explores how a short motif can carry tension, resolve clearly and remain recognisable across different moments.',
    visualDescription: 'Concentric forms gather into one impulse, then open again.',
  },
  {
    id: 'echo', name: 'ECHO', field: 'Product sound',
    description: 'Small signals that make digital interactions feel considered.',
    concept: 'A family of small signals for the moments between actions. Each gesture has a clear role; together, they suggest a consistent product voice.',
    visualDescription: 'Points and short paths pass a signal from one gesture to the next.',
  },
  {
    id: 'afterimage', name: 'AFTERIMAGE', field: 'Original composition',
    description: 'A slow-moving atmosphere that leaves a trace.',
    concept: 'A composition study built around slow harmonic movement and fading detail. It explores how atmosphere can hold an identity without asking for the foreground.',
    visualDescription: 'A folded surface moves slowly through a field of lingering traces.',
  },
] as const
export type StudyId = typeof studies[number]['id']
export type Study = typeof studies[number]

export const approach = [
  { id: 'listen', title: 'Listen', text: 'We start with context: the people, the feeling and the role sound needs to play.' },
  { id: 'shape', title: 'Shape', text: 'We explore a focused palette, finding the rhythm and texture that belong to the idea.' },
  { id: 'refine', title: 'Refine', text: 'We test the details across real moments, keeping what makes the sound clear and recognisable.' },
] as const
