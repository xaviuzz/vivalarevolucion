import { describe, it, expect } from 'vitest'
import { calculateMatrixDimensions } from './matrixLayout'

describe('calculateMatrixDimensions', () => {
  it('creates a grid that fits all citizens', () => {
    const testSizes = [100, 250, 500]

    testSizes.forEach((size) => {
      const { rows, columns } = calculateMatrixDimensions(size)
      expect(rows * columns).toBeGreaterThanOrEqual(size)
    })
  })

  it('creates a rectangular horizontal shape (wider than tall)', () => {
    const testSizes = [100, 250, 500]

    testSizes.forEach((size) => {
      const { rows, columns } = calculateMatrixDimensions(size)
      expect(columns).toBeGreaterThan(rows)
    })
  })

  it('maintains aspect ratio of at least 1.5:1', () => {
    const testSizes = [100, 250, 500]

    testSizes.forEach((size) => {
      const { rows, columns } = calculateMatrixDimensions(size)
      const aspectRatio = columns / rows
      expect(aspectRatio).toBeGreaterThanOrEqual(1.5)
    })
  })

  it('returns consistent results for same input', () => {
    const size = 300
    const result1 = calculateMatrixDimensions(size)
    const result2 = calculateMatrixDimensions(size)

    expect(result1).toEqual(result2)
  })
})
