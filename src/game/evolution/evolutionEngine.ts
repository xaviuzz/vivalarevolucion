import { Citizen, SocialClass } from '../../types/Citizen'
import { TRANSITION_PROBABILITIES, TransitionTable } from './evolutionProbabilities'

const CLASS_ORDER = [
  SocialClass.ELITES,
  SocialClass.CLASE_MEDIA,
  SocialClass.OBREROS,
  SocialClass.DESPOSEIDOS
] as const

function selectClassByProbability(transitions: TransitionTable): SocialClass {
  const randomValue = Math.random()
  let cumulativeProbability = 0

  for (const socialClass of CLASS_ORDER) {
    const previousCumulative = cumulativeProbability
    cumulativeProbability += transitions[socialClass]
    if (randomValue >= previousCumulative && randomValue < cumulativeProbability) {
      return socialClass
    }
  }

  return CLASS_ORDER[CLASS_ORDER.length - 1]
}

export function evolveCitizen(citizen: Citizen): Citizen {
  const transitions = TRANSITION_PROBABILITIES[citizen.socialClass]
  const newClass = selectClassByProbability(transitions)

  return {
    ...citizen,
    socialClass: newClass
  }
}

export function evolveCitizens(citizens: Citizen[]): Citizen[] {
  return citizens.map(evolveCitizen)
}
