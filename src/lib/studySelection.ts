import { studies } from '../data/content'
import type { StudyId } from '../data/content'

export function studyForKey(current: StudyId, key: string): StudyId | null {
  const index = studies.findIndex(study => study.id === current)
  if (key === 'Home') return studies[0].id
  if (key === 'End') return studies[studies.length - 1].id
  if (key === 'ArrowRight') return studies[(index + 1) % studies.length].id
  if (key === 'ArrowLeft') return studies[(index + studies.length - 1) % studies.length].id
  return null
}
