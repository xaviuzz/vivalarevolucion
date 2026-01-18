import { SocialClass } from '../../types/Citizen'
import { Action, TransitionModifierTable } from '../../types/Action'

const WELFARE_STATE_MODIFIERS: TransitionModifierTable = {
  [SocialClass.ELITES]: {
    [SocialClass.ELITES]: 0,
    [SocialClass.CLASE_MEDIA]: 0,
    [SocialClass.OBREROS]: 0,
    [SocialClass.DESPOSEIDOS]: 0
  },
  [SocialClass.CLASE_MEDIA]: {
    [SocialClass.ELITES]: 0,
    [SocialClass.CLASE_MEDIA]: 0.05,
    [SocialClass.OBREROS]: -0.03,
    [SocialClass.DESPOSEIDOS]: -0.02
  },
  [SocialClass.OBREROS]: {
    [SocialClass.ELITES]: 0,
    [SocialClass.CLASE_MEDIA]: 0.03,
    [SocialClass.OBREROS]: 0.02,
    [SocialClass.DESPOSEIDOS]: -0.05
  },
  [SocialClass.DESPOSEIDOS]: {
    [SocialClass.ELITES]: 0.00001,
    [SocialClass.CLASE_MEDIA]: 0.02,
    [SocialClass.OBREROS]: 0.08,
    [SocialClass.DESPOSEIDOS]: -0.10001
  }
}

export const WELFARE_STATE_ACTION: Action = {
  id: 'welfare-state',
  name: 'Estado del Bienestar',
  description: 'Políticas sociales que mejoran la movilidad de las clases bajas y estabilizan la clase media',
  modifiers: WELFARE_STATE_MODIFIERS
}
