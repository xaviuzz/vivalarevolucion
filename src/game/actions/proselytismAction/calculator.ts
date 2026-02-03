import { Citizen, SOCIAL_CLASSES } from '../../../types/Citizen'
import { Militancy } from '../../../types/Militancy'
import { MilitancyModifierTable } from '../../../types/Action'
import { PROSELYTISM_BASE_MODIFIERS } from '../../config/actions/proselytism'

export function calculateAnarchistRatio(citizens: Citizen[]): number {
  const totalPopulation = citizens.length
  if (totalPopulation === 0) return 0

  const anarchistCount = citizens.filter(c => c.militancy === Militancy.ANARQUISMO).length
  return anarchistCount / totalPopulation
}

export function calculateEffectiveModifiers(citizens: Citizen[]): MilitancyModifierTable {
  const ratio = calculateAnarchistRatio(citizens)
  const scalingFactor = Math.sqrt(ratio)

  const effectiveModifiers = {} as MilitancyModifierTable

  for (const socialClass of SOCIAL_CLASSES) {
    const baseRow = PROSELYTISM_BASE_MODIFIERS[socialClass]
    effectiveModifiers[socialClass] = {
      [Militancy.FASCISMO]: baseRow[Militancy.FASCISMO] * scalingFactor,
      [Militancy.STATUSQUO]: baseRow[Militancy.STATUSQUO] * scalingFactor,
      [Militancy.ANARQUISMO]: baseRow[Militancy.ANARQUISMO] * scalingFactor
    }
  }

  return effectiveModifiers
}
