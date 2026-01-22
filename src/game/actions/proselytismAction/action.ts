import { Action } from '../../../types/Action'
import { calculateEffectiveModifiers } from './calculator'

export const PROSELYTISM_ACTION: Action = {
  id: 'proselytism',
  name: 'Proselitismo',
  description: 'Aumenta la probabilidad de militancia anarquista. Más efectivo cuantos más anarquistas haya.',
  calculateMilitancyModifiers: calculateEffectiveModifiers
}
