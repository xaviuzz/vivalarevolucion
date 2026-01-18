import { SocialClass } from '../../types/Citizen'
import { TransitionModifier } from '../../types/Action'

export const TRANSITION_PROBABILITIES: Record<SocialClass, TransitionModifier> = {
  [SocialClass.ELITES]: {
    [SocialClass.ELITES]: 0.975,
    [SocialClass.CLASE_MEDIA]: 0.02,
    [SocialClass.OBREROS]: 0,
    [SocialClass.DESPOSEIDOS]: 0.005
  },
  [SocialClass.CLASE_MEDIA]: {
    [SocialClass.ELITES]: 0.01,
    [SocialClass.CLASE_MEDIA]: 0.57,
    [SocialClass.OBREROS]: 0.40,
    [SocialClass.DESPOSEIDOS]: 0.02
  },
  [SocialClass.OBREROS]: {
    [SocialClass.ELITES]: 0.001,
    [SocialClass.CLASE_MEDIA]: 0.25,
    [SocialClass.OBREROS]: 0.649,
    [SocialClass.DESPOSEIDOS]: 0.10
  },
  [SocialClass.DESPOSEIDOS]: {
    [SocialClass.ELITES]: 0.000001,
    [SocialClass.CLASE_MEDIA]: 0.000001,
    [SocialClass.OBREROS]: 0.000001,
    [SocialClass.DESPOSEIDOS]: 0.999997
  }
}
