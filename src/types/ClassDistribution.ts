import { Citizen, SocialClass, SOCIAL_CLASSES } from './Citizen'

export class ClassDistribution {
  private constructor(private readonly counts: Map<SocialClass, number>) {}

  static fromCitizens(citizens: Citizen[]): ClassDistribution {
    const counts = new Map<SocialClass, number>()

    for (const socialClass of SOCIAL_CLASSES) {
      counts.set(socialClass, 0)
    }

    for (const citizen of citizens) {
      const count = counts.get(citizen.socialClass) ?? 0
      counts.set(citizen.socialClass, count + 1)
    }

    return new ClassDistribution(counts)
  }

  get(socialClass: SocialClass): number {
    return this.counts.get(socialClass) ?? 0
  }

  has(socialClass: SocialClass): boolean {
    return this.counts.has(socialClass)
  }

  toMap(): Map<SocialClass, number> {
    return new Map(this.counts)
  }
}
