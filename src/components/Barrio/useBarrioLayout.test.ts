import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useBarrioLayout } from './useBarrioLayout'

describe('useBarrioLayout', () => {
  it('creates a grid that fits all citizens', () => {
    const testSizes = [100, 250, 500]

    testSizes.forEach((size) => {
      const { result } = renderHook(() => useBarrioLayout(size))
      const { rows, columns } = result.current
      expect(rows * columns).toBeGreaterThanOrEqual(size)
    })
  })

  it('creates a rectangular horizontal shape (wider than tall)', () => {
    const testSizes = [100, 250, 500]

    testSizes.forEach((size) => {
      const { result } = renderHook(() => useBarrioLayout(size))
      const { rows, columns } = result.current
      expect(columns).toBeGreaterThan(rows)
    })
  })

  it('maintains aspect ratio of at least 1.5:1', () => {
    const testSizes = [100, 250, 500]

    testSizes.forEach((size) => {
      const { result } = renderHook(() => useBarrioLayout(size))
      const { rows, columns } = result.current
      const aspectRatio = columns / rows
      expect(aspectRatio).toBeGreaterThanOrEqual(1.5)
    })
  })

  it('returns consistent results for same input', () => {
    const size = 300
    const { result: result1 } = renderHook(() => useBarrioLayout(size))
    const { result: result2 } = renderHook(() => useBarrioLayout(size))

    expect(result1.current).toEqual(result2.current)
  })
})
