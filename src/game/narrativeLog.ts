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

/**
 * Finds the dominant social class change by comparing before/after populations.
 * When a class gains significantly, growth dominates shrinkage in the narrative.
 * Returns null if no changes.
 */
export function getDominantSocialChange(
  before: Citizen[],
  after: Citizen[]
): SocialChange | null {
  const beforeCounts = countByClass(before)
  const afterCounts = countByClass(after)

  let bestGainer: SocialChange | null = null
  let bestLoser: SocialChange | null = null

  for (const sc of SOCIAL_CLASS_PRIORITY) {
    const diff = (afterCounts.get(sc) ?? 0) - (beforeCounts.get(sc) ?? 0)

    if (diff > 0 && (bestGainer === null || diff > bestGainer.diff)) {
      bestGainer = { socialClass: sc, diff }
    }

    if (diff < 0 && (bestLoser === null || Math.abs(diff) > Math.abs(bestLoser.diff))) {
      bestLoser = { socialClass: sc, diff }
    }
  }

  // Prefer gainer; if equal absolute values, gainer wins
  if (bestGainer && bestLoser) {
    return bestGainer.diff >= Math.abs(bestLoser.diff) ? bestGainer : bestLoser
  }

  return bestGainer ?? bestLoser
}

/**
 * Finds which militancy grew the most (ANARQUISMO or FASCISMO).
 * Returns null if neither grew.
 */
export function getDominantMilitancyGrowth(
  before: Citizen[],
  after: Citizen[]
): Militancy | null {
  const beforeCounts = countByMilitancy(before)
  const afterCounts = countByMilitancy(after)

  const growingMilitancies = [Militancy.ANARQUISMO, Militancy.FASCISMO] as const
  let dominant: { militancy: Militancy; diff: number } | null = null

  for (const m of growingMilitancies) {
    const diff = (afterCounts.get(m) ?? 0) - (beforeCounts.get(m) ?? 0)
    if (diff <= 0) continue
    if (dominant === null || diff > dominant.diff) {
      dominant = { militancy: m, diff }
    }
  }

  return dominant?.militancy ?? null
}

/**
 * Generates a narrative description of the turn based on citizen changes.
 * If both social and militancy change, combines two phrases separated by ". "
 */
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
