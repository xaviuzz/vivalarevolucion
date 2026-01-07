import { describe, it, expect } from 'vitest'
import { generateCitizens } from './citizenGenerator'
import { SocialClass } from '../../types/Citizen'

describe('generateCitizens', () => {
  it('generates between 100 and 500 citizens', () => {
    const citizens = generateCitizens()
    expect(citizens.length).toBeGreaterThanOrEqual(100)
    expect(citizens.length).toBeLessThanOrEqual(500)
  })

  it('assigns each citizen a unique ID', () => {
    const citizens = generateCitizens()
    const ids = citizens.map((c) => c.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(citizens.length)
  })

  it('assigns each citizen a valid social class', () => {
    const citizens = generateCitizens()
    const validClasses = Object.values(SocialClass)

    citizens.forEach((citizen) => {
      expect(validClasses).toContain(citizen.socialClass)
    })
  })

  it('distributes classes with random percentages that sum to 100%', () => {
    const citizens = generateCitizens()

    const counts: Record<SocialClass, number> = {
      [SocialClass.DESPOSEIDOS]: 0,
      [SocialClass.OBREROS]: 0,
      [SocialClass.CLASE_MEDIA]: 0,
      [SocialClass.ELITES]: 0
    }

    citizens.forEach((c) => counts[c.socialClass]++)

    const total = Object.values(counts).reduce((sum, n) => sum + n, 0)
    expect(total).toBe(citizens.length)

    const classesWithCitizens = Object.values(counts).filter(n => n > 0).length
    expect(classesWithCitizens).toBeGreaterThanOrEqual(3)
  })

  it('generates different distributions across multiple runs', () => {
    const distributions: string[] = []

    for (let i = 0; i < 5; i++) {
      const citizens = generateCitizens()
      const counts: Record<SocialClass, number> = {
        [SocialClass.DESPOSEIDOS]: 0,
        [SocialClass.OBREROS]: 0,
        [SocialClass.CLASE_MEDIA]: 0,
        [SocialClass.ELITES]: 0
      }

      citizens.forEach((c) => counts[c.socialClass]++)

      const percentages = Object.values(counts).map(n =>
        Math.floor((n / citizens.length) * 100)
      )
      distributions.push(percentages.join('-'))
    }

    const uniqueDistributions = new Set(distributions)
    expect(uniqueDistributions.size).toBeGreaterThanOrEqual(3)
  })
})
