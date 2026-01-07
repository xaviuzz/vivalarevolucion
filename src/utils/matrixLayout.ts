import { MatrixDimensions } from '../models/Barrio'

/**
 * Calculates matrix dimensions for a rectangular horizontal layout
 * Target: width > height (aspect ratio >= 1.5)
 *
 * Strategy: Find the closest divisor pair where columns >= rows * 1.5
 */
export function calculateMatrixDimensions(
  totalCitizens: number
): MatrixDimensions {
  // Start from square root as baseline
  const sqrt = Math.sqrt(totalCitizens)

  // Find optimal row count (fewer rows = wider grid)
  // Target: aspect ratio of at least 1.5:1 (width:height)
  let bestRows = Math.floor(sqrt)
  let bestColumns = Math.ceil(totalCitizens / bestRows)

  // Try reducing rows to make it more horizontal
  for (let rows = Math.floor(sqrt); rows >= 1; rows--) {
    const columns = Math.ceil(totalCitizens / rows)
    const aspectRatio = columns / rows

    // Accept if aspect ratio >= 1.5 (sufficiently horizontal)
    if (aspectRatio >= 1.5) {
      bestRows = rows
      bestColumns = columns
      break
    }
  }

  return {
    rows: bestRows,
    columns: bestColumns
  }
}
