import { describe, it, expect } from 'vitest'
import { assignInitialMilitancy } from './militancyAssigner'
import { SocialClass } from '../../types/Citizen'
import { Militancy } from '../../types/Militancy'
import { createManyCitizens } from '../../test/fixtures'
import { filterByMilitancy } from '../../test/citizen-helpers'

describe('assignInitialMilitancy', () => {
  it('asigna exactamente 1 FASCISMO', () => {
    const citizens = createManyCitizens(100, SocialClass.OBREROS)
    const result = assignInitialMilitancy(citizens)
    const fascists = filterByMilitancy(result, Militancy.FASCISMO)
    expect(fascists).toHaveLength(1)
  })

  it('asigna exactamente 1 ANARQUISMO', () => {
    const citizens = createManyCitizens(100, SocialClass.OBREROS)
    const result = assignInitialMilitancy(citizens)
    const anarchists = filterByMilitancy(result, Militancy.ANARQUISMO)
    expect(anarchists).toHaveLength(1)
  })

  it('asigna STATUSQUO al resto', () => {
    const citizens = createManyCitizens(100, SocialClass.OBREROS)
    const result = assignInitialMilitancy(citizens)
    const statusquo = filterByMilitancy(result, Militancy.STATUSQUO)
    expect(statusquo).toHaveLength(98)
  })

  it('asigna FASCISMO y ANARQUISMO a ciudadanos diferentes', () => {
    const citizens = createManyCitizens(100, SocialClass.OBREROS)
    const result = assignInitialMilitancy(citizens)
    const fascist = filterByMilitancy(result, Militancy.FASCISMO)[0]
    const anarchist = filterByMilitancy(result, Militancy.ANARQUISMO)[0]
    expect(fascist?.id).not.toBe(anarchist?.id)
  })

  it('mantiene IDs y socialClass sin cambios', () => {
    const citizens = createManyCitizens(10, SocialClass.OBREROS)
    const result = assignInitialMilitancy(citizens)
    result.forEach((citizen, index) => {
      expect(citizen.id).toBe(index)
      expect(citizen.socialClass).toBe(SocialClass.OBREROS)
    })
  })

  it('maneja poblacion de 2 ciudadanos', () => {
    const citizens = createManyCitizens(2, SocialClass.OBREROS)
    const result = assignInitialMilitancy(citizens)
    const fascists = filterByMilitancy(result, Militancy.FASCISMO)
    const anarchists = filterByMilitancy(result, Militancy.ANARQUISMO)
    expect(fascists).toHaveLength(1)
    expect(anarchists).toHaveLength(1)
  })

  it('maneja poblacion de 1 ciudadano', () => {
    const citizens = createManyCitizens(1, SocialClass.OBREROS)
    const result = assignInitialMilitancy(citizens)
    expect(result[0].militancy).toBe(Militancy.STATUSQUO)
  })
})
