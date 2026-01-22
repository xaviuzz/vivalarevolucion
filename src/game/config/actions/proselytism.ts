import { SocialClass } from '../../../types/Citizen'
import { Militancy } from '../../../types/Militancy'
import { MilitancyModifierTable } from '../../../types/Action'

export const PROSELYTISM_BASE_MODIFIERS: MilitancyModifierTable = {
  [SocialClass.DESPOSEIDOS]: {
    [Militancy.FASCISMO]: 0,
    [Militancy.STATUSQUO]: -0.01,
    [Militancy.ANARQUISMO]: 0.01
  },
  [SocialClass.OBREROS]: {
    [Militancy.FASCISMO]: 0,
    [Militancy.STATUSQUO]: -0.0075,
    [Militancy.ANARQUISMO]: 0.0075
  },
  [SocialClass.CLASE_MEDIA]: {
    [Militancy.FASCISMO]: 0,
    [Militancy.STATUSQUO]: -0.005,
    [Militancy.ANARQUISMO]: 0.005
  },
  [SocialClass.ELITES]: {
    [Militancy.FASCISMO]: 0,
    [Militancy.STATUSQUO]: -0.0025,
    [Militancy.ANARQUISMO]: 0.0025
  }
}
