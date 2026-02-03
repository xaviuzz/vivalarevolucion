import { Action } from '../../../types/Action'
import { calculateEffectiveModifiers } from './calculator'

export const ATENEO_ACTION: Action = {
  id: 'ateneo',
  name: 'Ateneo',
  description: 'Promueve la educación popular y fortalece la conciencia anarquista. Más efectivo cuantos más anarquistas haya en la sociedad.',
  calculateMilitancyModifiers: calculateEffectiveModifiers
}
