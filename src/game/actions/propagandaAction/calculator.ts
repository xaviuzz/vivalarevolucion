import { Citizen, SOCIAL_CLASSES } from '../../../types/Citizen'
import { Militancy } from '../../../types/Militancy'
import { MilitancyModifierTable } from '../../../types/Action'
import { PROPAGANDA_BASE_MODIFIERS } from '../../config/actions/propaganda'

export function calculateEffectiveModifiers(citizens: Citizen[]): MilitancyModifierTable {
  const totalPopulation = citizens.length
  const ratio = totalPopulation === 0 ? 0 : citizens.filter(c => c.militancy === Militancy.ANARQUISMO).length / totalPopulation
  const scalingFactor = ratio

  const effectiveModifiers = {} as MilitancyModifierTable

  for (const socialClass of SOCIAL_CLASSES) {
    const baseRow = PROPAGANDA_BASE_MODIFIERS[socialClass]
    effectiveModifiers[socialClass] = {
      [Militancy.FASCISMO]: baseRow[Militancy.FASCISMO] * scalingFactor,
      [Militancy.STATUSQUO]: baseRow[Militancy.STATUSQUO] * scalingFactor,
      [Militancy.ANARQUISMO]: baseRow[Militancy.ANARQUISMO] * scalingFactor
    }
  }

  return effectiveModifiers
}
