import { Citizen, SocialClass } from '../types/Citizen'
import { Militancy } from '../types/Militancy'
import { countByClass, countByMilitancy } from '../utils/citizenUtils'
import {
  SocialPhrases,
  MilitancyPhrases,
  NoChangePhrases
} from './config/narrativeMessages'

const SOCIAL_CLASS_PRIORITY: SocialClass[] = [
  SocialClass.DESPOSEIDOS,
  SocialClass.OBREROS,
  SocialClass.CLASE_MEDIA,
  SocialClass.ELITES
]

export interface SocialChange {
  socialClass: SocialClass
  diff: number
}


export function getDominantSocialChange(
  before: Citizen[],
  after: Citizen[]
): SocialChange | null {
  const beforeCounts = countByClass(before)
  const afterCounts = countByClass(after)

  let bestGainer: SocialChange | null = null
  let bestLoser: SocialChange | null = null

  for (const socialClass of SOCIAL_CLASS_PRIORITY) {
    const diff = (afterCounts.get(socialClass) ?? 0) - (beforeCounts.get(socialClass) ?? 0)

    if (diff > 0 && (bestGainer === null || diff > bestGainer.diff)) {
      bestGainer = { socialClass: socialClass, diff }
    }

    if (diff < 0 && (bestLoser === null || Math.abs(diff) > Math.abs(bestLoser.diff))) {
      bestLoser = { socialClass: socialClass, diff }
    }
  }

  if (bestGainer && bestLoser) {
    return bestGainer.diff >= Math.abs(bestLoser.diff) ? bestGainer : bestLoser
  }

  return bestGainer ?? bestLoser
}


export function getDominantMilitancyGrowth(
  before: Citizen[],
  after: Citizen[]
): Militancy | null {
  const beforeCounts = countByMilitancy(before)
  const afterCounts = countByMilitancy(after)

  const growingMilitancies = [Militancy.ANARQUISMO, Militancy.FASCISMO] as const
  let dominant: { militancy: Militancy; diff: number } | null = null

  for (const militancy of growingMilitancies) {
    const diff = (afterCounts.get(militancy) ?? 0) - (beforeCounts.get(militancy) ?? 0)
    if (diff <= 0) continue
    if (dominant === null || diff > dominant.diff) {
      dominant = { militancy: militancy, diff }
    }
  }

  return dominant?.militancy ?? null
}

export function generateNarrativeLog(before: Citizen[], after: Citizen[]): string {
  const socialChange = getDominantSocialChange(before, after)
  const militancyGrowth = getDominantMilitancyGrowth(before, after)

  const parts: string[] = []

  if (socialChange) {
    parts.push(SocialPhrases.pick(socialChange))
  }

  if (militancyGrowth) {
    parts.push(MilitancyPhrases.pick(militancyGrowth))
  }

  return parts.length > 0
    ? parts.join('. ')
    : NoChangePhrases.pick()
}
