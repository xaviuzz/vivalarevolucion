import { Citizen, SocialClass } from '../types/Citizen'
import { Militancy } from '../types/Militancy'

export function countByClass(citizens: Citizen[]): Record<SocialClass, number> {
  const counts = {
    [SocialClass.DESPOSEIDOS]: 0,
    [SocialClass.OBREROS]: 0,
    [SocialClass.CLASE_MEDIA]: 0,
    [SocialClass.ELITES]: 0
  }
  citizens.forEach(c => counts[c.socialClass]++)
  return counts
}

export function filterByMilitancy(citizens: Citizen[], militancy: Militancy): Citizen[] {
  return citizens.filter(c => c.militancy === militancy)
}
