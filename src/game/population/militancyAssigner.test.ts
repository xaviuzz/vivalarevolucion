import { describe, it, expect } from 'vitest'
import { assignInitialMilitancy } from './militancyAssigner'
import { SocialClass } from '../../types/Citizen'
import { Militancy } from '../../types/Militancy'

function createTestCitizens(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    socialClass: SocialClass.OBREROS,
    militancy: Militancy.STATUSQUO
  }))
}

describe('assignInitialMilitancy', () => {
  it('asigna exactamente 1 FASCISMO', () => {
    const citizens = createTestCitizens(100)
    const result = assignInitialMilitancy(citizens)
    const fascists = result.filter(c => c.militancy === Militancy.FASCISMO)
    expect(fascists).toHaveLength(1)
  })

  it('asigna exactamente 1 ANARQUISMO', () => {
    const citizens = createTestCitizens(100)
    const result = assignInitialMilitancy(citizens)
    const anarchists = result.filter(c => c.militancy === Militancy.ANARQUISMO)
    expect(anarchists).toHaveLength(1)
  })

  it('asigna STATUSQUO al resto', () => {
    const citizens = createTestCitizens(100)
    const result = assignInitialMilitancy(citizens)
    const statusquo = result.filter(c => c.militancy === Militancy.STATUSQUO)
    expect(statusquo).toHaveLength(98)
  })

  it('asigna FASCISMO y ANARQUISMO a ciudadanos diferentes', () => {
    const citizens = createTestCitizens(100)
    const result = assignInitialMilitancy(citizens)
    const fascist = result.find(c => c.militancy === Militancy.FASCISMO)
    const anarchist = result.find(c => c.militancy === Militancy.ANARQUISMO)
    expect(fascist?.id).not.toBe(anarchist?.id)
  })

  it('mantiene IDs y socialClass sin cambios', () => {
    const citizens = createTestCitizens(10)
    const result = assignInitialMilitancy(citizens)
    result.forEach((citizen, index) => {
      expect(citizen.id).toBe(index)
      expect(citizen.socialClass).toBe(SocialClass.OBREROS)
    })
  })

  it('maneja poblacion de 2 ciudadanos', () => {
    const citizens = createTestCitizens(2)
    const result = assignInitialMilitancy(citizens)
    const fascists = result.filter(c => c.militancy === Militancy.FASCISMO)
    const anarchists = result.filter(c => c.militancy === Militancy.ANARQUISMO)
    expect(fascists).toHaveLength(1)
    expect(anarchists).toHaveLength(1)
  })

  it('maneja poblacion de 1 ciudadano', () => {
    const citizens = createTestCitizens(1)
    const result = assignInitialMilitancy(citizens)
    expect(result[0].militancy).toBe(Militancy.STATUSQUO)
  })
})
