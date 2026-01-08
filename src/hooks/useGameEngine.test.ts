import { renderHook, act, RenderHookResult } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useGameEngine, GameEngineHook } from './useGameEngine'
import { SocialClass, Citizen } from '../types/Citizen'

vi.mock('../game/population/citizenGenerator', () => ({
  generateCitizens: vi.fn(() => [
    { id: 1, socialClass: SocialClass.CLASE_MEDIA },
    { id: 2, socialClass: SocialClass.OBREROS },
    { id: 3, socialClass: SocialClass.ELITES }
  ])
}))

describe('useGameEngine', () => {
  beforeEach(() => {
    SUT.setupMocks()
  })

  it('inicializa con ciudadanos generados y turno 1', () => {
    const hook = SUT.render()

    expect(SUT.getTurn(hook)).toBe(1)
    expect(SUT.getCitizens(hook)).toHaveLength(3)
    expect(SUT.getCitizenIds(hook)[0]).toBe(1)
  })

  it('incrementa turno al llamar endTurn', () => {
    const hook = SUT.render()

    SUT.endTurn(hook)

    expect(SUT.getTurn(hook)).toBe(2)
  })

  it('evoluciona ciudadanos al llamar endTurn', () => {
    const hook = SUT.render()
    const initialCitizens = SUT.getCitizens(hook)

    SUT.endTurn(hook)

    expect(SUT.getCitizens(hook)).not.toBe(initialCitizens)
    expect(SUT.getCitizens(hook)).toHaveLength(3)
  })

  it('callback endTurn es estable entre renders', () => {
    const hook = SUT.render()
    const firstEndTurn = SUT.getEndTurnCallback(hook)

    SUT.rerender(hook)

    expect(SUT.getEndTurnCallback(hook)).toBe(firstEndTurn)
  })

  it('mantiene IDs de ciudadanos tras evolución', () => {
    const hook = SUT.render()

    SUT.endTurn(hook)

    expect(SUT.getCitizenIds(hook)[0]).toBe(1)
    expect(SUT.getCitizenIds(hook)[1]).toBe(2)
    expect(SUT.getCitizenIds(hook)[2]).toBe(3)
  })

  it('mantiene número total de ciudadanos tras múltiples turnos', () => {
    const hook = SUT.render()

    SUT.endTurnMultiple(hook, 3)

    expect(SUT.getCitizens(hook)).toHaveLength(3)
    expect(SUT.getTurn(hook)).toBe(4)
  })
})

class SUT {
  static setupMocks() {
    vi.clearAllMocks()
  }

  static render() {
    return renderHook(() => useGameEngine())
  }

  static getTurn(hook: RenderHookResult<GameEngineHook, unknown>): number {
    return hook.result.current.currentTurn
  }

  static getCitizens(hook: RenderHookResult<GameEngineHook, unknown>): Citizen[] {
    return hook.result.current.citizens
  }

  static getEndTurnCallback(hook: RenderHookResult<GameEngineHook, unknown>): () => void {
    return hook.result.current.endTurn
  }

  static endTurn(hook: RenderHookResult<GameEngineHook, unknown>): void {
    act(() => {
      hook.result.current.endTurn()
    })
  }

  static endTurnMultiple(hook: RenderHookResult<GameEngineHook, unknown>, times: number): void {
    act(() => {
      for (let i = 0; i < times; i++) {
        hook.result.current.endTurn()
      }
    })
  }

  static getCitizenIds(hook: RenderHookResult<GameEngineHook, unknown>): number[] {
    return hook.result.current.citizens.map((c: Citizen) => c.id)
  }

  static rerender(hook: RenderHookResult<GameEngineHook, unknown>): void {
    hook.rerender()
  }
}
