import { describe, it, expect } from 'vitest'
import { calculateEffectiveModifiers } from './calculator'
import { PROPAGANDA_BASE_MODIFIERS } from '../../config/actions/propaganda'
import { Citizen, SocialClass } from '../../../types/Citizen'
import { Militancy } from '../../../types/Militancy'
import { createCitizen } from '../../../test/fixtures'

describe('calculateEffectiveModifiers', () => {
  it('escala los modificadores base por el ratio lineal de anarquistas', () => {
    const citizens = PropagandaSUT.createPopulationWithAnarchists(100, 50)

    const effectiveModifiers = calculateEffectiveModifiers(citizens)

    expect(effectiveModifiers[SocialClass.CLASE_MEDIA][Militancy.ANARQUISMO]).toBe(0.01 * 0.5)
  })

  it('modificadores son cero cuando no hay anarquistas', () => {
    const citizens = PropagandaSUT.createPopulationWithAnarchists(100, 0)

    const effectiveModifiers = calculateEffectiveModifiers(citizens)

    expect(effectiveModifiers[SocialClass.CLASE_MEDIA][Militancy.ANARQUISMO]).toBe(0)
  })

  it('modificadores son maximos cuando todos son anarquistas', () => {
    const citizens = PropagandaSUT.createPopulationWithAnarchists(100, 100)

    const effectiveModifiers = calculateEffectiveModifiers(citizens)

    expect(effectiveModifiers[SocialClass.CLASE_MEDIA][Militancy.ANARQUISMO]).toBe(0.01)
  })

  it('CLASE_MEDIA y ELITES tienen igual modificador efectivo', () => {
    const citizens = PropagandaSUT.createPopulationWithAnarchists(100, 30)

    const effectiveModifiers = calculateEffectiveModifiers(citizens)

    expect(effectiveModifiers[SocialClass.CLASE_MEDIA][Militancy.ANARQUISMO]).toBe(
      effectiveModifiers[SocialClass.ELITES][Militancy.ANARQUISMO]
    )
  })

  it('DESPOSEIDOS y OBREROS no se ven afectados por el ratio', () => {
    const citizens = PropagandaSUT.createPopulationWithAnarchists(100, 50)

    const effectiveModifiers = calculateEffectiveModifiers(citizens)

    expect(effectiveModifiers[SocialClass.DESPOSEIDOS][Militancy.ANARQUISMO]).toBe(0)
    expect(effectiveModifiers[SocialClass.OBREROS][Militancy.ANARQUISMO]).toBe(0)
  })

  it('modificadores de STATUSQUO son negativos en clases altas', () => {
    const citizens = PropagandaSUT.createPopulationWithAnarchists(100, 10)

    const effectiveModifiers = calculateEffectiveModifiers(citizens)

    expect(effectiveModifiers[SocialClass.CLASE_MEDIA][Militancy.STATUSQUO]).toBeLessThan(0)
    expect(effectiveModifiers[SocialClass.ELITES][Militancy.STATUSQUO]).toBeLessThan(0)
  })

  it('modificadores de FASCISMO permanecen en cero', () => {
    const citizens = PropagandaSUT.createPopulationWithAnarchists(100, 10)

    const effectiveModifiers = calculateEffectiveModifiers(citizens)

    expect(effectiveModifiers[SocialClass.DESPOSEIDOS][Militancy.FASCISMO]).toBe(0)
    expect(effectiveModifiers[SocialClass.OBREROS][Militancy.FASCISMO]).toBe(0)
    expect(effectiveModifiers[SocialClass.CLASE_MEDIA][Militancy.FASCISMO]).toBe(0)
    expect(effectiveModifiers[SocialClass.ELITES][Militancy.FASCISMO]).toBe(0)
  })
})

describe('PROPAGANDA_BASE_MODIFIERS', () => {
  it('CLASE_MEDIA tiene +1% base', () => {
    expect(PROPAGANDA_BASE_MODIFIERS[SocialClass.CLASE_MEDIA][Militancy.ANARQUISMO]).toBe(0.01)
  })

  it('ELITES tienen +1% base', () => {
    expect(PROPAGANDA_BASE_MODIFIERS[SocialClass.ELITES][Militancy.ANARQUISMO]).toBe(0.01)
  })

  it('DESPOSEIDOS no tiene efecto', () => {
    expect(PROPAGANDA_BASE_MODIFIERS[SocialClass.DESPOSEIDOS][Militancy.ANARQUISMO]).toBe(0)
  })

  it('OBREROS no tiene efecto', () => {
    expect(PROPAGANDA_BASE_MODIFIERS[SocialClass.OBREROS][Militancy.ANARQUISMO]).toBe(0)
  })
})

class PropagandaSUT {
  static createPopulationWithAnarchists(total: number, anarchistCount: number): Citizen[] {
    const citizens: Citizen[] = []
    for (let i = 0; i < total; i++) {
      const militancy = i < anarchistCount ? Militancy.ANARQUISMO : Militancy.STATUSQUO
      citizens.push(createCitizen(i, SocialClass.OBREROS, militancy))
    }
    return citizens
  }
}
