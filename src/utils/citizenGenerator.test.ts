import { describe, it, expect } from 'vitest'
import { generateCitizens } from './citizenGenerator'
import { SocialClass } from '../models/Citizen'

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

  it('distributes classes with roughly equal probability', () => {
    // Run multiple times to get statistical average
    const iterations = 10
    const results: Record<SocialClass, number> = {
      [SocialClass.DESPOSEIDOS]: 0,
      [SocialClass.OBREROS]: 0,
      [SocialClass.CLASE_MEDIA]: 0,
      [SocialClass.ELITES]: 0
    }

    for (let i = 0; i < iterations; i++) {
      const citizens = generateCitizens()
      citizens.forEach((c) => results[c.socialClass]++)
    }

    const total = Object.values(results).reduce((sum, count) => sum + count, 0)

    // Allow 10% variance (15%-35% per class is acceptable)
    Object.values(results).forEach((count) => {
      const percentage = count / total
      expect(percentage).toBeGreaterThan(0.15)
      expect(percentage).toBeLessThan(0.35)
    })
  })
})
