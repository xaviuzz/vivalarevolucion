import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useTurnManager } from './useTurnManager'

describe('useTurnManager', () => {
  it('starts at turn 1', () => {
    const { result } = renderHook(() => useTurnManager())
    expect(result.current.currentTurn).toBe(1)
  })

  it('increments turn when endTurn is called', () => {
    const { result } = renderHook(() => useTurnManager())

    act(() => {
      result.current.endTurn()
    })

    expect(result.current.currentTurn).toBe(2)
  })

  it('increments turn multiple times', () => {
    const { result } = renderHook(() => useTurnManager())

    act(() => {
      result.current.endTurn()
      result.current.endTurn()
      result.current.endTurn()
    })

    expect(result.current.currentTurn).toBe(4)
  })
})
