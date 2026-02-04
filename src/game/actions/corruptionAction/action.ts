import { Action } from '../../../types/Action'
import { calculateEffectiveModifiers } from './calculator'

export const CORRUPTION_ACTION: Action = {
  id: 'corruption',
  name: 'Corrupción',
  description: 'Las élites sucumben a la corrupción y tienden hacia el fascismo. Más efectivo cuantos más fascistas haya en la sociedad.',
  calculateMilitancyModifiers: calculateEffectiveModifiers
}
