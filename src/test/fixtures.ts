import { Citizen, SocialClass } from '../types/Citizen'
import { Militancy } from '../types/Militancy'

export function createCitizen(
  id: number,
  socialClass: SocialClass,
  militancy: Militancy = Militancy.STATUSQUO
): Citizen {
  return { id, socialClass, militancy }
}

export function createCitizens(count: number): Citizen[] {
  const classes = Object.values(SocialClass)
  return Array.from({ length: count }, (_, id) => ({
    id,
    socialClass: classes[id % classes.length],
    militancy: Militancy.STATUSQUO
  }))
}

export function createBalancedCitizens(countPerClass: number = 25): Citizen[] {
  const citizens: Citizen[] = []
  let id = 0

  for (const socialClass of Object.values(SocialClass)) {
    for (let i = 0; i < countPerClass; i++) {
      citizens.push({ id: id++, socialClass, militancy: Militancy.STATUSQUO })
    }
  }

  return citizens
}

export function createManyCitizens(count: number, socialClass: SocialClass): Citizen[] {
  return Array.from({ length: count }, (_, i) => createCitizen(i, socialClass))
}
