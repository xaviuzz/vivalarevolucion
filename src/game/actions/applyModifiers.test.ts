import { describe, it, expect } from 'vitest'
import { applyActionModifiers, applyMultipleActions } from './applyModifiers'
import { SocialClass } from '../../types/Citizen'
import { TRANSITION_PROBABILITIES, TransitionTable } from '../evolution/evolutionProbabilities'
import { Action, TransitionModifierTable } from '../../types/Action'
import { rowsAreEqual, sumRow } from '../../test/probability-helpers'

describe('applyActionModifiers', () => {
  it('aplica modificadores positivos correctamente', () => {
    const action = ApplyModifiersSUT.createAction({
      [SocialClass.OBREROS]: {
        [SocialClass.ELITES]: 0,
        [SocialClass.CLASE_MEDIA]: 0.05,
        [SocialClass.OBREROS]: 0,
        [SocialClass.DESPOSEIDOS]: -0.05
      }
    })

    const modified = ApplyModifiersSUT.applyAction(TRANSITION_PROBABILITIES, action)
    const baseRow = TRANSITION_PROBABILITIES[SocialClass.OBREROS]
    const modifiedRow = modified[SocialClass.OBREROS]

    expect(ApplyModifiersSUT.getRawProbability(modifiedRow, SocialClass.CLASE_MEDIA))
      .toBeGreaterThan(baseRow[SocialClass.CLASE_MEDIA])
    expect(ApplyModifiersSUT.getRawProbability(modifiedRow, SocialClass.DESPOSEIDOS))
      .toBeLessThan(baseRow[SocialClass.DESPOSEIDOS])
  })

  it('no permite probabilidades menores que MINIMUM_PROBABILITY', () => {
    const action = ApplyModifiersSUT.createAction({
      [SocialClass.DESPOSEIDOS]: {
        [SocialClass.ELITES]: -1,
        [SocialClass.CLASE_MEDIA]: 0,
        [SocialClass.OBREROS]: 0,
        [SocialClass.DESPOSEIDOS]: 0
      }
    })

    const modified = ApplyModifiersSUT.applyAction(TRANSITION_PROBABILITIES, action)

    expect(ApplyModifiersSUT.getRawProbability(modified[SocialClass.DESPOSEIDOS], SocialClass.ELITES))
      .toBeGreaterThan(0)
  })

  it('normaliza la fila para que sume 1.0', () => {
    const action = ApplyModifiersSUT.createAction({
      [SocialClass.CLASE_MEDIA]: {
        [SocialClass.ELITES]: 0.1,
        [SocialClass.CLASE_MEDIA]: 0.1,
        [SocialClass.OBREROS]: 0.1,
        [SocialClass.DESPOSEIDOS]: 0.1
      }
    })

    const modified = ApplyModifiersSUT.applyAction(TRANSITION_PROBABILITIES, action)

    expect(sumRow(modified[SocialClass.CLASE_MEDIA])).toBeCloseTo(1.0, 5)
  })

  it('no modifica filas con modificadores de cero', () => {
    const action = ApplyModifiersSUT.createActionWithZeroModifiers()

    const modified = ApplyModifiersSUT.applyAction(TRANSITION_PROBABILITIES, action)

    expect(rowsAreEqual(
      modified[SocialClass.ELITES],
      TRANSITION_PROBABILITIES[SocialClass.ELITES]
    )).toBe(true)
  })
})

describe('applyMultipleActions', () => {
  it('devuelve probabilidades base si no hay acciones', () => {
    const result = ApplyModifiersSUT.applyMultiple(TRANSITION_PROBABILITIES, [])

    expect(result).toBe(TRANSITION_PROBABILITIES)
  })

  it('aplica múltiples acciones en secuencia', () => {
    const action1 = ApplyModifiersSUT.createAction({
      [SocialClass.OBREROS]: {
        [SocialClass.ELITES]: 0,
        [SocialClass.CLASE_MEDIA]: 0.02,
        [SocialClass.OBREROS]: 0,
        [SocialClass.DESPOSEIDOS]: -0.02
      }
    })
    const action2 = ApplyModifiersSUT.createAction({
      [SocialClass.OBREROS]: {
        [SocialClass.ELITES]: 0,
        [SocialClass.CLASE_MEDIA]: 0.02,
        [SocialClass.OBREROS]: 0,
        [SocialClass.DESPOSEIDOS]: -0.02
      }
    })

    const withOne = ApplyModifiersSUT.applyAction(TRANSITION_PROBABILITIES, action1)
    const withTwo = ApplyModifiersSUT.applyMultiple(TRANSITION_PROBABILITIES, [action1, action2])

    expect(ApplyModifiersSUT.getRawProbability(withTwo[SocialClass.OBREROS], SocialClass.CLASE_MEDIA))
      .toBeGreaterThan(ApplyModifiersSUT.getRawProbability(withOne[SocialClass.OBREROS], SocialClass.CLASE_MEDIA))
  })

  it('todas las filas resultantes suman 1.0', () => {
    const action = ApplyModifiersSUT.createAction({
      [SocialClass.DESPOSEIDOS]: {
        [SocialClass.ELITES]: 0.001,
        [SocialClass.CLASE_MEDIA]: 0.05,
        [SocialClass.OBREROS]: 0.1,
        [SocialClass.DESPOSEIDOS]: -0.151
      }
    })

    const modified = ApplyModifiersSUT.applyMultiple(TRANSITION_PROBABILITIES, [action])

    for (const socialClass of Object.values(SocialClass)) {
      expect(sumRow(modified[socialClass])).toBeCloseTo(1.0, 5)
    }
  })
})

class ApplyModifiersSUT {
  static createAction(partialModifiers: Partial<TransitionModifierTable>): Action {
    const zeroModifier = {
      [SocialClass.ELITES]: 0,
      [SocialClass.CLASE_MEDIA]: 0,
      [SocialClass.OBREROS]: 0,
      [SocialClass.DESPOSEIDOS]: 0
    }

    const modifiers: TransitionModifierTable = {
      [SocialClass.ELITES]: zeroModifier,
      [SocialClass.CLASE_MEDIA]: zeroModifier,
      [SocialClass.OBREROS]: zeroModifier,
      [SocialClass.DESPOSEIDOS]: zeroModifier,
      ...partialModifiers
    }

    return {
      id: 'test-action',
      name: 'Test Action',
      description: 'Action for testing',
      modifiers
    }
  }

  static createActionWithZeroModifiers(): Action {
    return this.createAction({})
  }

  static applyAction(
    base: Record<SocialClass, TransitionTable>,
    action: Action
  ): Record<SocialClass, TransitionTable> {
    return applyActionModifiers(base, action)
  }

  static applyMultiple(
    base: Record<SocialClass, TransitionTable>,
    actions: Action[]
  ): Record<SocialClass, TransitionTable> {
    return applyMultipleActions(base, actions)
  }

  static getRawProbability(row: TransitionTable, target: SocialClass): number {
    return row[target]
  }
}
