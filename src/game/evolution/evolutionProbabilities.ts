import { SocialClass } from '../../types/Citizen'
import { TransitionModifier } from '../../types/Action'
import { TRANSITION_PROBABILITIES } from '../config'

export type TransitionTable = TransitionModifier

export { TRANSITION_PROBABILITIES }

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
