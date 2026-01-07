import { Citizen } from './Citizen'

/**
 * Configuration for matrix layout dimensions
 */
export interface MatrixDimensions {
  rows: number
  columns: number
}

/**
 * Represents the complete barrio with all citizens
 */
export interface Barrio {
  citizens: Citizen[]
  dimensions: MatrixDimensions
}
