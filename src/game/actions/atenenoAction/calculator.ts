import { Citizen, SOCIAL_CLASSES } from '../../../types/Citizen'
import { Militancy } from '../../../types/Militancy'
import { MilitancyModifierTable } from '../../../types/Action'
import { ATENEO_BASE_MODIFIERS } from '../../config/actions/ateneo'

export function calculateAnarchistRatio(citizens: Citizen[]): number {
  const totalPopulation = citizens.length
  return totalPopulation === 0 ? 0 : citizens.filter(c => c.militancy === Militancy.ANARQUISMO).length / totalPopulation
}

export function calculateEffectiveModifiers(citizens: Citizen[]): MilitancyModifierTable {
  const ratio = calculateAnarchistRatio(citizens)
  const scalingFactor = Math.sqrt(ratio)

  const effectiveModifiers = {} as MilitancyModifierTable

  for (const socialClass of SOCIAL_CLASSES) {
    const baseRow = ATENEO_BASE_MODIFIERS[socialClass]
    effectiveModifiers[socialClass] = {
      [Militancy.FASCISMO]: baseRow[Militancy.FASCISMO] * scalingFactor,
      [Militancy.STATUSQUO]: baseRow[Militancy.STATUSQUO] * scalingFactor,
      [Militancy.ANARQUISMO]: baseRow[Militancy.ANARQUISMO] * scalingFactor
    }
  }

  return effectiveModifiers
}
