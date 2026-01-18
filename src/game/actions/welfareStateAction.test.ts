import { describe, it, expect } from 'vitest'
import { WELFARE_STATE_ACTION } from './welfareStateAction'
import { applyActionModifiers } from './applyModifiers'
import { SocialClass } from '../../types/Citizen'
import { TRANSITION_PROBABILITIES, TransitionTable } from '../evolution/evolutionProbabilities'
import { evolveCitizen } from '../evolution/evolutionEngine'
import { Citizen } from '../../types/Citizen'

describe('WELFARE_STATE_ACTION', () => {
  describe('estructura de la acción', () => {
    it('tiene un id válido', () => {
      expect(WelfareStateSUT.getId()).toBe('welfare-state')
    })

    it('tiene un nombre descriptivo', () => {
      expect(WelfareStateSUT.getName()).toBe('Estado del Bienestar')
    })

    it('tiene modificadores para todas las clases sociales', () => {
      const modifiers = WelfareStateSUT.getModifiers()

      expect(modifiers[SocialClass.ELITES]).toBeDefined()
      expect(modifiers[SocialClass.CLASE_MEDIA]).toBeDefined()
      expect(modifiers[SocialClass.OBREROS]).toBeDefined()
      expect(modifiers[SocialClass.DESPOSEIDOS]).toBeDefined()
    })
  })

  describe('efecto en las probabilidades', () => {
    it('no modifica las probabilidades de las ELITES', () => {
      const modified = WelfareStateSUT.applyToBase()

      expect(WelfareStateSUT.rowsAreEqual(
        modified[SocialClass.ELITES],
        TRANSITION_PROBABILITIES[SocialClass.ELITES]
      )).toBe(true)
    })

    it('aumenta la estabilidad de CLASE_MEDIA', () => {
      const modified = WelfareStateSUT.applyToBase()

      expect(modified[SocialClass.CLASE_MEDIA][SocialClass.CLASE_MEDIA])
        .toBeGreaterThan(TRANSITION_PROBABILITIES[SocialClass.CLASE_MEDIA][SocialClass.CLASE_MEDIA])
    })

    it('reduce el descenso de CLASE_MEDIA a OBREROS', () => {
      const modified = WelfareStateSUT.applyToBase()

      expect(modified[SocialClass.CLASE_MEDIA][SocialClass.OBREROS])
        .toBeLessThan(TRANSITION_PROBABILITIES[SocialClass.CLASE_MEDIA][SocialClass.OBREROS])
    })

    it('reduce el descenso de OBREROS a DESPOSEIDOS', () => {
      const modified = WelfareStateSUT.applyToBase()

      expect(modified[SocialClass.OBREROS][SocialClass.DESPOSEIDOS])
        .toBeLessThan(TRANSITION_PROBABILITIES[SocialClass.OBREROS][SocialClass.DESPOSEIDOS])
    })

    it('aumenta el ascenso de OBREROS a CLASE_MEDIA', () => {
      const modified = WelfareStateSUT.applyToBase()

      expect(modified[SocialClass.OBREROS][SocialClass.CLASE_MEDIA])
        .toBeGreaterThan(TRANSITION_PROBABILITIES[SocialClass.OBREROS][SocialClass.CLASE_MEDIA])
    })

    it('aumenta el ascenso de DESPOSEIDOS a OBREROS', () => {
      const modified = WelfareStateSUT.applyToBase()

      expect(modified[SocialClass.DESPOSEIDOS][SocialClass.OBREROS])
        .toBeGreaterThan(TRANSITION_PROBABILITIES[SocialClass.DESPOSEIDOS][SocialClass.OBREROS])
    })

    it('reduce la permanencia de DESPOSEIDOS en su clase', () => {
      const modified = WelfareStateSUT.applyToBase()

      expect(modified[SocialClass.DESPOSEIDOS][SocialClass.DESPOSEIDOS])
        .toBeLessThan(TRANSITION_PROBABILITIES[SocialClass.DESPOSEIDOS][SocialClass.DESPOSEIDOS])
    })
  })

  describe('tests estadísticos', () => {
    it('DESPOSEIDOS tienen mayor probabilidad de ascender a OBREROS con Estado del Bienestar', () => {
      const ITERATIONS = 10000

      const baseRate = WelfareStateSUT.calculateTransitionRate(
        SocialClass.DESPOSEIDOS,
        SocialClass.OBREROS,
        ITERATIONS,
        TRANSITION_PROBABILITIES
      )

      const modifiedProbs = WelfareStateSUT.applyToBase()
      const modifiedRate = WelfareStateSUT.calculateTransitionRate(
        SocialClass.DESPOSEIDOS,
        SocialClass.OBREROS,
        ITERATIONS,
        modifiedProbs
      )

      expect(modifiedRate).toBeGreaterThan(baseRate)
    })

    it('OBREROS tienen menor probabilidad de caer a DESPOSEIDOS con Estado del Bienestar', () => {
      const ITERATIONS = 10000

      const baseRate = WelfareStateSUT.calculateTransitionRate(
        SocialClass.OBREROS,
        SocialClass.DESPOSEIDOS,
        ITERATIONS,
        TRANSITION_PROBABILITIES
      )

      const modifiedProbs = WelfareStateSUT.applyToBase()
      const modifiedRate = WelfareStateSUT.calculateTransitionRate(
        SocialClass.OBREROS,
        SocialClass.DESPOSEIDOS,
        ITERATIONS,
        modifiedProbs
      )

      expect(modifiedRate).toBeLessThan(baseRate)
    })
  })
})

class WelfareStateSUT {
  static getId(): string {
    return WELFARE_STATE_ACTION.id
  }

  static getName(): string {
    return WELFARE_STATE_ACTION.name
  }

  static getModifiers() {
    return WELFARE_STATE_ACTION.modifiers
  }

  static applyToBase(): Record<SocialClass, TransitionTable> {
    return applyActionModifiers(TRANSITION_PROBABILITIES, WELFARE_STATE_ACTION)
  }

  static rowsAreEqual(row1: TransitionTable, row2: TransitionTable): boolean {
    for (const socialClass of Object.values(SocialClass)) {
      if (Math.abs(row1[socialClass] - row2[socialClass]) > 0.000001) {
        return false
      }
    }
    return true
  }

  static calculateTransitionRate(
    fromClass: SocialClass,
    toClass: SocialClass,
    iterations: number,
    probabilities: Record<SocialClass, TransitionTable>
  ): number {
    let transitions = 0
    for (let i = 0; i < iterations; i++) {
      const citizen: Citizen = { id: i, socialClass: fromClass }
      const evolved = evolveCitizen(citizen, probabilities)
      if (evolved.socialClass === toClass) {
        transitions++
      }
    }
    return transitions / iterations
  }
}
