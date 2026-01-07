import { useMemo } from 'react'
import { MatrixDimensions } from '../../types/Barrio'

const MINIMUM_HORIZONTAL_ASPECT_RATIO = 1.5

function calculateAspectRatio(columns: number, rows: number): number {
  return columns / rows
}

function findBaselineDimensions(totalCitizens: number): MatrixDimensions {
  const sqrt = Math.sqrt(totalCitizens)
  const rows = Math.floor(sqrt)
  const columns = Math.ceil(totalCitizens / rows)

  return { rows, columns }
}

function findHorizontalLayout(totalCitizens: number, baselineRows: number): MatrixDimensions {
  for (let rows = baselineRows; rows >= 1; rows--) {
    const columns = Math.ceil(totalCitizens / rows)
    const aspectRatio = calculateAspectRatio(columns, rows)

    if (aspectRatio >= MINIMUM_HORIZONTAL_ASPECT_RATIO) {
      return { rows, columns }
    }
  }

  return findBaselineDimensions(totalCitizens)
}

function calculateMatrixDimensions(totalCitizens: number): MatrixDimensions {
  const baseline = findBaselineDimensions(totalCitizens)
  return findHorizontalLayout(totalCitizens, baseline.rows)
}

export function useBarrioLayout(citizensCount: number): MatrixDimensions {
  return useMemo(() => calculateMatrixDimensions(citizensCount), [citizensCount])
}
