import { Action } from '../../../types/Action'
import { calculateEffectiveModifiers } from './calculator'

export const PROPAGANDA_ACTION: Action = {
  id: 'propaganda',
  name: 'Propaganda',
  description: 'Aumenta la militancia anarquista en las clases altas. Requiere más anarquistas que el proselitismo para ser efectiva.',
  calculateMilitancyModifiers: calculateEffectiveModifiers
}
