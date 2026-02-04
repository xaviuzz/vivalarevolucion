import { Citizen, SocialClass, SOCIAL_CLASSES } from '../types/Citizen'
import { Militancy, MILITANCIES } from '../types/Militancy'

export function countByClass(citizens: Citizen[]): Map<SocialClass, number> {
  const counts = new Map<SocialClass, number>()
  for (const sc of SOCIAL_CLASSES) {
    counts.set(sc, 0)
  }
  for (const c of citizens) {
    counts.set(c.socialClass, (counts.get(c.socialClass) ?? 0) + 1)
  }
  return counts
}

export function countByMilitancy(citizens: Citizen[]): Map<Militancy, number> {
  const counts = new Map<Militancy, number>()
  for (const m of MILITANCIES) {
    counts.set(m, 0)
  }
  for (const c of citizens) {
    counts.set(c.militancy, (counts.get(c.militancy) ?? 0) + 1)
  }
  return counts
}

export function countByClassRecord(citizens: Citizen[]): Record<SocialClass, number> {
  return citizens.reduce((counts, citizen) => {
    counts[citizen.socialClass] = (counts[citizen.socialClass] || 0) + 1
    return counts
  }, {} as Record<SocialClass, number>)
}
