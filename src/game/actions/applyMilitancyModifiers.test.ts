import { describe, it, expect } from 'vitest'
import { applyMilitancyModifiers } from './applyMilitancyModifiers'
import { SocialClass } from '../../types/Citizen'
import { Militancy, MILITANCIES } from '../../types/Militancy'
import { MilitancyModifierTable } from '../../types/Action'
import { MilitancyTransitionTable } from '../config/militancyProbabilities'

describe('applyMilitancyModifiers', () => {
  it('aplica modificadores positivos a la probabilidad de transicion', () => {
    const baseProbabilities = ApplyMilitancyModifiersSUT.createBaseProbabilities()
    const modifiers = ApplyMilitancyModifiersSUT.createModifiersWithAnarchismBonus(0.1)

    const modified = applyMilitancyModifiers(
      baseProbabilities,
      modifiers,
      SocialClass.OBREROS
    )

    expect(modified[Militancy.STATUSQUO][Militancy.ANARQUISMO]).toBeGreaterThan(
      baseProbabilities[Militancy.STATUSQUO][Militancy.ANARQUISMO]
    )
  })

  it('aplica modificadores negativos a la probabilidad de transicion', () => {
    const baseProbabilities = ApplyMilitancyModifiersSUT.createBaseProbabilities()
    const modifiers = ApplyMilitancyModifiersSUT.createModifiersWithStatusquoPenalty(-0.1)

    const modified = applyMilitancyModifiers(
      baseProbabilities,
      modifiers,
      SocialClass.OBREROS
    )

    expect(modified[Militancy.STATUSQUO][Militancy.STATUSQUO]).toBeLessThan(
      baseProbabilities[Militancy.STATUSQUO][Militancy.STATUSQUO]
    )
  })

  it('normaliza las probabilidades para que sumen 1', () => {
    const baseProbabilities = ApplyMilitancyModifiersSUT.createBaseProbabilities()
    const modifiers = ApplyMilitancyModifiersSUT.createModifiersWithAnarchismBonus(0.5)

    const modified = applyMilitancyModifiers(
      baseProbabilities,
      modifiers,
      SocialClass.OBREROS
    )

    for (const fromMilitancy of MILITANCIES) {
      const sum = ApplyMilitancyModifiersSUT.sumRow(modified[fromMilitancy])
      expect(sum).toBeCloseTo(1, 5)
    }
  })

  it('clampea probabilidades negativas al minimo permitido', () => {
    const baseProbabilities = ApplyMilitancyModifiersSUT.createBaseProbabilities()
    const modifiers = ApplyMilitancyModifiersSUT.createModifiersWithStatusquoPenalty(-2.0)

    const modified = applyMilitancyModifiers(
      baseProbabilities,
      modifiers,
      SocialClass.OBREROS
    )

    expect(modified[Militancy.STATUSQUO][Militancy.STATUSQUO]).toBeGreaterThan(0)
  })

  it('aplica modificadores diferentes segun la clase social', () => {
    const baseProbabilities = ApplyMilitancyModifiersSUT.createBaseProbabilities()
    const modifiers = ApplyMilitancyModifiersSUT.createClassSpecificModifiers()

    const modifiedObreros = applyMilitancyModifiers(
      baseProbabilities,
      modifiers,
      SocialClass.OBREROS
    )
    const modifiedElites = applyMilitancyModifiers(
      baseProbabilities,
      modifiers,
      SocialClass.ELITES
    )

    expect(modifiedObreros[Militancy.STATUSQUO][Militancy.ANARQUISMO]).toBeGreaterThan(
      modifiedElites[Militancy.STATUSQUO][Militancy.ANARQUISMO]
    )
  })

  it('preserva la estructura de probabilidades para todas las militancias', () => {
    const baseProbabilities = ApplyMilitancyModifiersSUT.createBaseProbabilities()
    const modifiers = ApplyMilitancyModifiersSUT.createModifiersWithAnarchismBonus(0.1)

    const modified = applyMilitancyModifiers(
      baseProbabilities,
      modifiers,
      SocialClass.OBREROS
    )

    expect(modified[Militancy.FASCISMO]).toBeDefined()
    expect(modified[Militancy.STATUSQUO]).toBeDefined()
    expect(modified[Militancy.ANARQUISMO]).toBeDefined()
  })

  it('sin modificadores, las probabilidades permanecen iguales (tras normalizar)', () => {
    const baseProbabilities = ApplyMilitancyModifiersSUT.createBaseProbabilities()
    const modifiers = ApplyMilitancyModifiersSUT.createZeroModifiers()

    const modified = applyMilitancyModifiers(
      baseProbabilities,
      modifiers,
      SocialClass.OBREROS
    )

    expect(modified[Militancy.STATUSQUO][Militancy.FASCISMO]).toBeCloseTo(
      baseProbabilities[Militancy.STATUSQUO][Militancy.FASCISMO],
      5
    )
  })
})

class ApplyMilitancyModifiersSUT {
  static createBaseProbabilities(): Record<Militancy, MilitancyTransitionTable> {
    return {
      [Militancy.FASCISMO]: {
        [Militancy.FASCISMO]: 0.98,
        [Militancy.STATUSQUO]: 0.02,
        [Militancy.ANARQUISMO]: 0
      },
      [Militancy.STATUSQUO]: {
        [Militancy.FASCISMO]: 0.01,
        [Militancy.STATUSQUO]: 0.98,
        [Militancy.ANARQUISMO]: 0.01
      },
      [Militancy.ANARQUISMO]: {
        [Militancy.FASCISMO]: 0,
        [Militancy.STATUSQUO]: 0.02,
        [Militancy.ANARQUISMO]: 0.98
      }
    }
  }

  static createZeroModifiers(): MilitancyModifierTable {
    const zeroRow = {
      [Militancy.FASCISMO]: 0,
      [Militancy.STATUSQUO]: 0,
      [Militancy.ANARQUISMO]: 0
    }
    return {
      [SocialClass.DESPOSEIDOS]: { ...zeroRow },
      [SocialClass.OBREROS]: { ...zeroRow },
      [SocialClass.CLASE_MEDIA]: { ...zeroRow },
      [SocialClass.ELITES]: { ...zeroRow }
    }
  }

  static createModifiersWithAnarchismBonus(bonus: number): MilitancyModifierTable {
    const modifierRow = {
      [Militancy.FASCISMO]: 0,
      [Militancy.STATUSQUO]: -bonus,
      [Militancy.ANARQUISMO]: bonus
    }
    return {
      [SocialClass.DESPOSEIDOS]: { ...modifierRow },
      [SocialClass.OBREROS]: { ...modifierRow },
      [SocialClass.CLASE_MEDIA]: { ...modifierRow },
      [SocialClass.ELITES]: { ...modifierRow }
    }
  }

  static createModifiersWithStatusquoPenalty(penalty: number): MilitancyModifierTable {
    const modifierRow = {
      [Militancy.FASCISMO]: 0,
      [Militancy.STATUSQUO]: penalty,
      [Militancy.ANARQUISMO]: -penalty
    }
    return {
      [SocialClass.DESPOSEIDOS]: { ...modifierRow },
      [SocialClass.OBREROS]: { ...modifierRow },
      [SocialClass.CLASE_MEDIA]: { ...modifierRow },
      [SocialClass.ELITES]: { ...modifierRow }
    }
  }

  static createClassSpecificModifiers(): MilitancyModifierTable {
    return {
      [SocialClass.DESPOSEIDOS]: {
        [Militancy.FASCISMO]: 0,
        [Militancy.STATUSQUO]: -0.1,
        [Militancy.ANARQUISMO]: 0.1
      },
      [SocialClass.OBREROS]: {
        [Militancy.FASCISMO]: 0,
        [Militancy.STATUSQUO]: -0.075,
        [Militancy.ANARQUISMO]: 0.075
      },
      [SocialClass.CLASE_MEDIA]: {
        [Militancy.FASCISMO]: 0,
        [Militancy.STATUSQUO]: -0.05,
        [Militancy.ANARQUISMO]: 0.05
      },
      [SocialClass.ELITES]: {
        [Militancy.FASCISMO]: 0,
        [Militancy.STATUSQUO]: -0.025,
        [Militancy.ANARQUISMO]: 0.025
      }
    }
  }

  static sumRow(row: MilitancyTransitionTable): number {
    return MILITANCIES.reduce((sum, m) => sum + row[m], 0)
  }
}
