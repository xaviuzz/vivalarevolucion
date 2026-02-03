import { describe, it, expect } from 'vitest'
import {
  calculateAnarchistRatio,
  calculateEffectiveModifiers
} from './calculator'
import { ATENEO_BASE_MODIFIERS } from '../../config/actions/ateneo'
import { Citizen, SocialClass } from '../../../types/Citizen'
import { Militancy } from '../../../types/Militancy'
import { createCitizen } from '../../../test/fixtures'

describe('calculateAnarchistRatio', () => {
  it('calcula el ratio de anarquistas sobre poblacion total', () => {
    const citizens = AnarchistRatioSUT.createPopulationWithAnarchists(100, 10)

    const ratio = calculateAnarchistRatio(citizens)

    expect(ratio).toBe(0.1)
  })

  it('retorna 0 cuando no hay anarquistas', () => {
    const citizens = AnarchistRatioSUT.createPopulationWithAnarchists(100, 0)

    const ratio = calculateAnarchistRatio(citizens)

    expect(ratio).toBe(0)
  })

  it('cuantos mas anarquistas, mayor el ratio', () => {
    const fewAnarchists = AnarchistRatioSUT.createPopulationWithAnarchists(100, 5)
    const manyAnarchists = AnarchistRatioSUT.createPopulationWithAnarchists(100, 50)

    const ratioFew = calculateAnarchistRatio(fewAnarchists)
    const ratioMany = calculateAnarchistRatio(manyAnarchists)

    expect(ratioMany).toBeGreaterThan(ratioFew)
  })

  it('retorna 1 cuando todos son anarquistas', () => {
    const citizens = AnarchistRatioSUT.createPopulationWithAnarchists(50, 50)

    const ratio = calculateAnarchistRatio(citizens)

    expect(ratio).toBe(1)
  })

  it('retorna 0 cuando la poblacion esta vacia', () => {
    const citizens: Citizen[] = []

    const ratio = calculateAnarchistRatio(citizens)

    expect(ratio).toBe(0)
  })
})

describe('calculateEffectiveModifiers', () => {
  it('escala los modificadores base de OBREROS por la raiz cuadrada del ratio de anarquistas', () => {
    const citizens = AnarchistRatioSUT.createPopulationWithAnarchists(100, 50)

    const effectiveModifiers = calculateEffectiveModifiers(citizens)

    expect(effectiveModifiers[SocialClass.OBREROS][Militancy.ANARQUISMO]).toBe(0.01 * Math.sqrt(0.5))
  })

  it('modificadores de OBREROS son cero cuando no hay anarquistas', () => {
    const citizens = AnarchistRatioSUT.createPopulationWithAnarchists(100, 0)

    const effectiveModifiers = calculateEffectiveModifiers(citizens)

    expect(effectiveModifiers[SocialClass.OBREROS][Militancy.ANARQUISMO]).toBe(0)
  })

  it('modificadores de OBREROS son maximos cuando todos son anarquistas', () => {
    const citizens = AnarchistRatioSUT.createPopulationWithAnarchists(100, 100)

    const effectiveModifiers = calculateEffectiveModifiers(citizens)

    expect(effectiveModifiers[SocialClass.OBREROS][Militancy.ANARQUISMO]).toBe(0.01)
  })

  it('otras clases sociales siempre tienen modificadores cero', () => {
    const citizens = AnarchistRatioSUT.createPopulationWithAnarchists(100, 50)

    const effectiveModifiers = calculateEffectiveModifiers(citizens)

    expect(effectiveModifiers[SocialClass.DESPOSEIDOS][Militancy.ANARQUISMO]).toBe(0)
    expect(effectiveModifiers[SocialClass.CLASE_MEDIA][Militancy.ANARQUISMO]).toBe(0)
    expect(effectiveModifiers[SocialClass.ELITES][Militancy.ANARQUISMO]).toBe(0)
  })

  it('modificadores de STATUSQUO son negativos solo en OBREROS', () => {
    const citizens = AnarchistRatioSUT.createPopulationWithAnarchists(100, 10)

    const effectiveModifiers = calculateEffectiveModifiers(citizens)

    expect(effectiveModifiers[SocialClass.OBREROS][Militancy.STATUSQUO]).toBeLessThan(0)
    expect(effectiveModifiers[SocialClass.DESPOSEIDOS][Militancy.STATUSQUO]).toBe(0)
    expect(effectiveModifiers[SocialClass.CLASE_MEDIA][Militancy.STATUSQUO]).toBe(0)
    expect(effectiveModifiers[SocialClass.ELITES][Militancy.STATUSQUO]).toBe(0)
  })

  it('modificadores de FASCISMO permanecen en cero', () => {
    const citizens = AnarchistRatioSUT.createPopulationWithAnarchists(100, 10)

    const effectiveModifiers = calculateEffectiveModifiers(citizens)

    expect(effectiveModifiers[SocialClass.DESPOSEIDOS][Militancy.FASCISMO]).toBe(0)
    expect(effectiveModifiers[SocialClass.OBREROS][Militancy.FASCISMO]).toBe(0)
    expect(effectiveModifiers[SocialClass.CLASE_MEDIA][Militancy.FASCISMO]).toBe(0)
    expect(effectiveModifiers[SocialClass.ELITES][Militancy.FASCISMO]).toBe(0)
  })
})

describe('ATENEO_BASE_MODIFIERS', () => {
  it('OBREROS tienen +1% base', () => {
    expect(ATENEO_BASE_MODIFIERS[SocialClass.OBREROS][Militancy.ANARQUISMO]).toBe(0.01)
  })

  it('DESPOSEIDOS no tienen modificador', () => {
    expect(ATENEO_BASE_MODIFIERS[SocialClass.DESPOSEIDOS][Militancy.ANARQUISMO]).toBe(0)
  })

  it('CLASE_MEDIA no tienen modificador', () => {
    expect(ATENEO_BASE_MODIFIERS[SocialClass.CLASE_MEDIA][Militancy.ANARQUISMO]).toBe(0)
  })

  it('ELITES no tienen modificador', () => {
    expect(ATENEO_BASE_MODIFIERS[SocialClass.ELITES][Militancy.ANARQUISMO]).toBe(0)
  })
})

class AnarchistRatioSUT {
  static createPopulationWithAnarchists(total: number, anarchistCount: number): Citizen[] {
    const citizens: Citizen[] = []
    for (let i = 0; i < total; i++) {
      const militancy = i < anarchistCount ? Militancy.ANARQUISMO : Militancy.STATUSQUO
      citizens.push(createCitizen(i, SocialClass.OBREROS, militancy))
    }
    return citizens
  }
}
