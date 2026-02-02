import { Citizen } from '../../types/Citizen'
import { Militancy } from '../../types/Militancy'
import { MilitancyTransitionTable, MILITANCY_TRANSITION_PROBABILITIES } from '../config/militancyProbabilities'

const MILITANCY_ORDER = [
  Militancy.FASCISMO,
  Militancy.STATUSQUO,
  Militancy.ANARQUISMO
] as const

const LAST_MILITANCY_AS_FALLBACK = MILITANCY_ORDER[MILITANCY_ORDER.length - 1]

function isWithinProbabilityRange(
  threshold: number,
  lowerBound: number,
  upperBound: number
): boolean {
  return threshold >= lowerBound && threshold < upperBound
}

function selectMilitancyByProbability(transitions: MilitancyTransitionTable): Militancy {
  const randomThreshold = Math.random()
  let cumulativeProbability = 0

  for (const militancy of MILITANCY_ORDER) {
    const lowerBound = cumulativeProbability
    cumulativeProbability += transitions[militancy]
    const upperBound = cumulativeProbability

    if (isWithinProbabilityRange(randomThreshold, lowerBound, upperBound)) {
      return militancy
    }
  }

  return LAST_MILITANCY_AS_FALLBACK
}

export function evolveCitizenMilitancy(
  citizen: Citizen,
  probabilities: Record<Militancy, MilitancyTransitionTable>
): Citizen {
  const transitions = probabilities[citizen.militancy]
  const newMilitancy = selectMilitancyByProbability(transitions)

  return {
    ...citizen,
    militancy: newMilitancy
  }
}

export function evolveCitizensMilitancy(
  citizens: Citizen[],
  probabilities: Record<Militancy, MilitancyTransitionTable> = MILITANCY_TRANSITION_PROBABILITIES
): Citizen[] {
  return citizens.map(citizen => evolveCitizenMilitancy(citizen, probabilities))
}
