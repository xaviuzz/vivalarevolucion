import { describe, it, expect } from 'vitest'
import {
  calculateFascistRatio,
  calculateEffectiveModifiers
} from './calculator'
import { CORRUPTION_BASE_MODIFIERS } from '../../config/actions/corruption'
import { Citizen, SocialClass } from '../../../types/Citizen'
import { Militancy } from '../../../types/Militancy'
import { createCitizen } from '../../../test/fixtures'

describe('calculateFascistRatio', () => {
  it('calcula el ratio de fascistas sobre poblacion total', () => {
    const citizens = FascistRatioSUT.createPopulationWithFascists(100, 10)

    const ratio = calculateFascistRatio(citizens)

    expect(ratio).toBe(0.1)
  })

  it('retorna 0 cuando no hay fascistas', () => {
    const citizens = FascistRatioSUT.createPopulationWithFascists(100, 0)

    const ratio = calculateFascistRatio(citizens)

    expect(ratio).toBe(0)
  })

  it('cuantos mas fascistas, mayor el ratio', () => {
    const fewFascists = FascistRatioSUT.createPopulationWithFascists(100, 5)
    const manyFascists = FascistRatioSUT.createPopulationWithFascists(100, 50)

    const ratioFew = calculateFascistRatio(fewFascists)
    const ratioMany = calculateFascistRatio(manyFascists)

    expect(ratioMany).toBeGreaterThan(ratioFew)
  })

  it('retorna 1 cuando todos son fascistas', () => {
    const citizens = FascistRatioSUT.createPopulationWithFascists(50, 50)

    const ratio = calculateFascistRatio(citizens)

    expect(ratio).toBe(1)
  })

  it('retorna 0 cuando la poblacion esta vacia', () => {
    const citizens: Citizen[] = []

    const ratio = calculateFascistRatio(citizens)

    expect(ratio).toBe(0)
  })
})

describe('calculateEffectiveModifiers', () => {
  it('escala los modificadores base de ELITES por el ratio lineal de fascistas', () => {
    const citizens = FascistRatioSUT.createPopulationWithFascists(100, 50)

    const effectiveModifiers = calculateEffectiveModifiers(citizens)

    expect(effectiveModifiers[SocialClass.ELITES][Militancy.FASCISMO]).toBe(0.20 * 0.5)
  })

  it('modificadores de ELITES son cero cuando no hay fascistas', () => {
    const citizens = FascistRatioSUT.createPopulationWithFascists(100, 0)

    const effectiveModifiers = calculateEffectiveModifiers(citizens)

    expect(effectiveModifiers[SocialClass.ELITES][Militancy.FASCISMO]).toBe(0)
  })

  it('modificadores de ELITES son maximos cuando todos son fascistas', () => {
    const citizens = FascistRatioSUT.createPopulationWithFascists(100, 100)

    const effectiveModifiers = calculateEffectiveModifiers(citizens)

    expect(effectiveModifiers[SocialClass.ELITES][Militancy.FASCISMO]).toBe(0.20)
  })

  it('otras clases sociales siempre tienen modificadores cero', () => {
    const citizens = FascistRatioSUT.createPopulationWithFascists(100, 50)

    const effectiveModifiers = calculateEffectiveModifiers(citizens)

    expect(effectiveModifiers[SocialClass.DESPOSEIDOS][Militancy.FASCISMO]).toBe(0)
    expect(effectiveModifiers[SocialClass.OBREROS][Militancy.FASCISMO]).toBe(0)
    expect(effectiveModifiers[SocialClass.CLASE_MEDIA][Militancy.FASCISMO]).toBe(0)
  })

  it('modificadores de STATUSQUO son negativos solo en ELITES', () => {
    const citizens = FascistRatioSUT.createPopulationWithFascists(100, 10)

    const effectiveModifiers = calculateEffectiveModifiers(citizens)

    expect(effectiveModifiers[SocialClass.ELITES][Militancy.STATUSQUO]).toBeLessThan(0)
    expect(effectiveModifiers[SocialClass.DESPOSEIDOS][Militancy.STATUSQUO]).toBe(0)
    expect(effectiveModifiers[SocialClass.OBREROS][Militancy.STATUSQUO]).toBe(0)
    expect(effectiveModifiers[SocialClass.CLASE_MEDIA][Militancy.STATUSQUO]).toBe(0)
  })

  it('modificadores de ANARQUISMO permanecen en cero', () => {
    const citizens = FascistRatioSUT.createPopulationWithFascists(100, 10)

    const effectiveModifiers = calculateEffectiveModifiers(citizens)

    expect(effectiveModifiers[SocialClass.DESPOSEIDOS][Militancy.ANARQUISMO]).toBe(0)
    expect(effectiveModifiers[SocialClass.OBREROS][Militancy.ANARQUISMO]).toBe(0)
    expect(effectiveModifiers[SocialClass.CLASE_MEDIA][Militancy.ANARQUISMO]).toBe(0)
    expect(effectiveModifiers[SocialClass.ELITES][Militancy.ANARQUISMO]).toBe(0)
  })
})

describe('CORRUPTION_BASE_MODIFIERS', () => {
  it('ELITES tienen +20% base hacia fascismo', () => {
    expect(CORRUPTION_BASE_MODIFIERS[SocialClass.ELITES][Militancy.FASCISMO]).toBe(0.20)
  })

  it('ELITES tienen -20% base desde statusquo', () => {
    expect(CORRUPTION_BASE_MODIFIERS[SocialClass.ELITES][Militancy.STATUSQUO]).toBe(-0.20)
  })

  it('DESPOSEIDOS no tienen efecto', () => {
    expect(CORRUPTION_BASE_MODIFIERS[SocialClass.DESPOSEIDOS][Militancy.FASCISMO]).toBe(0)
    expect(CORRUPTION_BASE_MODIFIERS[SocialClass.DESPOSEIDOS][Militancy.STATUSQUO]).toBe(0)
  })

  it('OBREROS no tienen efecto', () => {
    expect(CORRUPTION_BASE_MODIFIERS[SocialClass.OBREROS][Militancy.FASCISMO]).toBe(0)
    expect(CORRUPTION_BASE_MODIFIERS[SocialClass.OBREROS][Militancy.STATUSQUO]).toBe(0)
  })

  it('CLASE_MEDIA no tienen efecto', () => {
    expect(CORRUPTION_BASE_MODIFIERS[SocialClass.CLASE_MEDIA][Militancy.FASCISMO]).toBe(0)
    expect(CORRUPTION_BASE_MODIFIERS[SocialClass.CLASE_MEDIA][Militancy.STATUSQUO]).toBe(0)
  })
})

class FascistRatioSUT {
  static createPopulationWithFascists(total: number, fascistCount: number): Citizen[] {
    const citizens: Citizen[] = []
    for (let i = 0; i < total; i++) {
      const militancy = i < fascistCount ? Militancy.FASCISMO : Militancy.STATUSQUO
      citizens.push(createCitizen(i, SocialClass.ELITES, militancy))
    }
    return citizens
  }
}
