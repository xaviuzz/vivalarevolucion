import { Action } from '../../../types/Action'
import { WELFARE_STATE_MODIFIERS } from '../../config'

export const WELFARE_STATE_ACTION: Action = {
  id: 'welfare-state',
  name: 'Estado del Bienestar',
  description: 'Políticas sociales que mejoran la movilidad de las clases bajas y estabilizan la clase media',
  modifiers: WELFARE_STATE_MODIFIERS
}
