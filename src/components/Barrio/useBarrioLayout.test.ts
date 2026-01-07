import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useBarrioLayout } from './useBarrioLayout'

describe('useBarrioLayout', () => {
  it('creates a grid that fits all citizens', () => {
    const testSizes = [100, 250, 500]

    testSizes.forEach((size) => {
      const result = SUT.render(size)
      expect(SUT.getCapacity(result)).toBeGreaterThanOrEqual(size)
    })
  })

  it('creates a rectangular horizontal shape (wider than tall)', () => {
    const testSizes = [100, 250, 500]

    testSizes.forEach((size) => {
      const result = SUT.render(size)
      const { rows, columns } = result.current
      expect(columns).toBeGreaterThan(rows)
    })
  })

  it('maintains aspect ratio of at least 1.5:1', () => {
    const testSizes = [100, 250, 500]

    testSizes.forEach((size) => {
      const result = SUT.render(size)
      expect(SUT.getAspectRatio(result)).toBeGreaterThanOrEqual(1.5)
    })
  })

  it('returns consistent results for same input', () => {
    const size = 300
    const result1 = SUT.render(size)
    const result2 = SUT.render(size)

    expect(result1.current).toEqual(result2.current)
  })
})

class SUT {
  static render(size: number) {
    const { result } = renderHook(() => useBarrioLayout(size))
    return result
  }

  static getCapacity(result: { current: { rows: number; columns: number } }): number {
    const { rows, columns } = result.current
    return rows * columns
  }

  static getAspectRatio(result: { current: { rows: number; columns: number } }): number {
    const { rows, columns } = result.current
    return columns / rows
  }
}
