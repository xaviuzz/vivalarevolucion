import { describe, it, expect } from 'vitest'
import {
  calculateAnarchistRatio,
  calculateEffectiveModifiers
} from './calculator'
import { PROSELYTISM_BASE_MODIFIERS } from '../../config/actions/proselytism'
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
  it('escala los modificadores base por la raiz cuadrada del ratio de anarquistas', () => {
    const citizens = AnarchistRatioSUT.createPopulationWithAnarchists(100, 50)

    const effectiveModifiers = calculateEffectiveModifiers(citizens)

    expect(effectiveModifiers[SocialClass.DESPOSEIDOS][Militancy.ANARQUISMO]).toBe(0.01 * Math.sqrt(0.5))
  })

  it('modificadores son cero cuando no hay anarquistas', () => {
    const citizens = AnarchistRatioSUT.createPopulationWithAnarchists(100, 0)

    const effectiveModifiers = calculateEffectiveModifiers(citizens)

    expect(effectiveModifiers[SocialClass.DESPOSEIDOS][Militancy.ANARQUISMO]).toBe(0)
  })

  it('modificadores son maximos cuando todos son anarquistas', () => {
    const citizens = AnarchistRatioSUT.createPopulationWithAnarchists(100, 100)

    const effectiveModifiers = calculateEffectiveModifiers(citizens)

    expect(effectiveModifiers[SocialClass.DESPOSEIDOS][Militancy.ANARQUISMO]).toBe(0.01)
  })

  it('DESPOSEIDOS tienen mayor modificador efectivo que ELITES', () => {
    const citizens = AnarchistRatioSUT.createPopulationWithAnarchists(100, 10)

    const effectiveModifiers = calculateEffectiveModifiers(citizens)

    const desposeidos = effectiveModifiers[SocialClass.DESPOSEIDOS][Militancy.ANARQUISMO]
    const elites = effectiveModifiers[SocialClass.ELITES][Militancy.ANARQUISMO]

    expect(desposeidos).toBeGreaterThan(elites)
  })

  it('mantiene proporciones entre clases sociales', () => {
    const citizens = AnarchistRatioSUT.createPopulationWithAnarchists(100, 10)

    const effectiveModifiers = calculateEffectiveModifiers(citizens)

    const desposeidos = effectiveModifiers[SocialClass.DESPOSEIDOS][Militancy.ANARQUISMO]
    const obreros = effectiveModifiers[SocialClass.OBREROS][Militancy.ANARQUISMO]
    const claseMedia = effectiveModifiers[SocialClass.CLASE_MEDIA][Militancy.ANARQUISMO]
    const elites = effectiveModifiers[SocialClass.ELITES][Militancy.ANARQUISMO]

    expect(desposeidos / obreros).toBeCloseTo(0.01 / 0.0075, 5)
    expect(obreros / claseMedia).toBeCloseTo(0.0075 / 0.005, 5)
    expect(claseMedia / elites).toBeCloseTo(0.005 / 0.0025, 5)
  })

  it('modificadores de STATUSQUO son negativos y proporcionales', () => {
    const citizens = AnarchistRatioSUT.createPopulationWithAnarchists(100, 10)

    const effectiveModifiers = calculateEffectiveModifiers(citizens)

    expect(effectiveModifiers[SocialClass.DESPOSEIDOS][Militancy.STATUSQUO]).toBeLessThan(0)
    expect(effectiveModifiers[SocialClass.OBREROS][Militancy.STATUSQUO]).toBeLessThan(0)
  })

  it('modificadores de FASCISMO permanecen en cero', () => {
    const citizens = AnarchistRatioSUT.createPopulationWithAnarchists(100, 10)

    const effectiveModifiers = calculateEffectiveModifiers(citizens)

    expect(effectiveModifiers[SocialClass.DESPOSEIDOS][Militancy.FASCISMO]).toBe(0)
    expect(effectiveModifiers[SocialClass.ELITES][Militancy.FASCISMO]).toBe(0)
  })
})

describe('PROSELYTISM_BASE_MODIFIERS', () => {
  it('DESPOSEIDOS tienen el mayor modificador base (+1%)', () => {
    expect(PROSELYTISM_BASE_MODIFIERS[SocialClass.DESPOSEIDOS][Militancy.ANARQUISMO]).toBe(0.01)
  })

  it('OBREROS tienen +0.75% base', () => {
    expect(PROSELYTISM_BASE_MODIFIERS[SocialClass.OBREROS][Militancy.ANARQUISMO]).toBe(0.0075)
  })

  it('CLASE_MEDIA tienen +0.5% base', () => {
    expect(PROSELYTISM_BASE_MODIFIERS[SocialClass.CLASE_MEDIA][Militancy.ANARQUISMO]).toBe(0.005)
  })

  it('ELITES tienen el menor modificador base (+0.25%)', () => {
    expect(PROSELYTISM_BASE_MODIFIERS[SocialClass.ELITES][Militancy.ANARQUISMO]).toBe(0.0025)
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
