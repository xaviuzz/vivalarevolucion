import { SocialClass } from '../../../types/Citizen'
import { Militancy } from '../../../types/Militancy'
import { MilitancyModifierTable } from '../../../types/Action'

export const ATENEO_BASE_MODIFIERS: MilitancyModifierTable = {
  [SocialClass.DESPOSEIDOS]: {
    [Militancy.FASCISMO]: 0,
    [Militancy.STATUSQUO]: 0,
    [Militancy.ANARQUISMO]: 0
  },
  [SocialClass.OBREROS]: {
    [Militancy.FASCISMO]: 0,
    [Militancy.STATUSQUO]: -0.01,
    [Militancy.ANARQUISMO]: 0.01
  },
  [SocialClass.CLASE_MEDIA]: {
    [Militancy.FASCISMO]: 0,
    [Militancy.STATUSQUO]: 0,
    [Militancy.ANARQUISMO]: 0
  },
  [SocialClass.ELITES]: {
    [Militancy.FASCISMO]: 0,
    [Militancy.STATUSQUO]: 0,
    [Militancy.ANARQUISMO]: 0
  }
}
