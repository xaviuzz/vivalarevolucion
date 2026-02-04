import { Citizen, SOCIAL_CLASSES } from '../../../types/Citizen'
import { Militancy } from '../../../types/Militancy'
import { MilitancyModifierTable } from '../../../types/Action'
import { CORRUPTION_BASE_MODIFIERS } from '../../config/actions/corruption'

export function calculateFascistRatio(citizens: Citizen[]): number {
  const totalPopulation = citizens.length
  if (totalPopulation === 0) return 0

  const fascistCount = citizens.filter(c => c.militancy === Militancy.FASCISMO).length
  return fascistCount / totalPopulation
}

export function calculateEffectiveModifiers(citizens: Citizen[]): MilitancyModifierTable {
  const ratio = calculateFascistRatio(citizens)
  const scalingFactor = ratio

  const effectiveModifiers = {} as MilitancyModifierTable

  for (const socialClass of SOCIAL_CLASSES) {
    const baseRow = CORRUPTION_BASE_MODIFIERS[socialClass]
    effectiveModifiers[socialClass] = {
      [Militancy.FASCISMO]: baseRow[Militancy.FASCISMO] * scalingFactor,
      [Militancy.STATUSQUO]: baseRow[Militancy.STATUSQUO] * scalingFactor,
      [Militancy.ANARQUISMO]: baseRow[Militancy.ANARQUISMO] * scalingFactor
    }
  }

  return effectiveModifiers
}
