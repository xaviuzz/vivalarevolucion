import { SocialClass, Citizen } from '../types/Citizen'
import { TransitionTable } from '../game/evolution/evolutionProbabilities'
import { evolveCitizen } from '../game/evolution/evolutionEngine'
import { Militancy } from '../types/Militancy'

export function calculateTransitionRate(
  fromClass: SocialClass,
  toClass: SocialClass,
  iterations: number,
  probabilities?: Record<SocialClass, TransitionTable>
): number {
  let transitions = 0
  for (let i = 0; i < iterations; i++) {
    const citizen: Citizen = { id: i, socialClass: fromClass, militancy: Militancy.STATUSQUO }
    const evolved = probabilities
      ? evolveCitizen(citizen, probabilities)
      : evolveCitizen(citizen)
    if (evolved.socialClass === toClass) {
      transitions++
    }
  }
  return transitions / iterations
}

export function rowsAreEqual(row1: TransitionTable, row2: TransitionTable): boolean {
  for (const socialClass of Object.values(SocialClass)) {
    if (Math.abs(row1[socialClass] - row2[socialClass]) > 0.000001) {
      return false
    }
  }
  return true
}

export function sumRow(row: TransitionTable): number {
  return Object.values(row).reduce((acc, prob) => acc + prob, 0)
}
