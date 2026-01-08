import { SocialClass } from '../../types/Citizen'

export interface TransitionTable {
  [SocialClass.ELITES]: number
  [SocialClass.CLASE_MEDIA]: number
  [SocialClass.OBREROS]: number
  [SocialClass.DESPOSEIDOS]: number
}

export const TRANSITION_PROBABILITIES: Record<SocialClass, TransitionTable> = {
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

export function validateTransitionProbabilities(): boolean {
  const classes = Object.keys(TRANSITION_PROBABILITIES) as SocialClass[]

  for (const socialClass of classes) {
    const transitions = TRANSITION_PROBABILITIES[socialClass]
    const sum = Object.values(transitions).reduce((acc, prob) => acc + prob, 0)

    if (Math.abs(sum - 1.0) > 0.000001) {
      return false
    }
  }

  return true
}
