import { SocialClass, SOCIAL_CLASSES } from '../../types/Citizen'
import { TransitionTable } from '../evolution/evolutionProbabilities'
import { Action } from '../../types/Action'

const MINIMUM_PROBABILITY = 0.000001
const NORMALIZATION_TOLERANCE = 0.000001

function clampProbability(value: number): number {
  return Math.max(MINIMUM_PROBABILITY, Math.min(1, value))
}

function normalizeTransitionTable(table: TransitionTable): TransitionTable {
  const sum = Object.values(table).reduce((acc, prob) => acc + prob, 0)

  if (Math.abs(sum - 1.0) < NORMALIZATION_TOLERANCE) {
    return table
  }

  const normalized = {} as TransitionTable
  for (const socialClass of SOCIAL_CLASSES) {
    normalized[socialClass] = table[socialClass] / sum
  }

  return normalized
}

function applyModifiersToRow(
  baseRow: TransitionTable,
  modifierRow: TransitionTable
): TransitionTable {
  const modified = {} as TransitionTable

  for (const socialClass of SOCIAL_CLASSES) {
    const base = baseRow[socialClass]
    const modifier = modifierRow[socialClass]
    modified[socialClass] = clampProbability(base + modifier)
  }

  return normalizeTransitionTable(modified)
}

export function applyActionModifiers(
  baseProbabilities: Record<SocialClass, TransitionTable>,
  action: Action
): Record<SocialClass, TransitionTable> {
  const modified = {} as Record<SocialClass, TransitionTable>

  for (const socialClass of SOCIAL_CLASSES) {
    modified[socialClass] = applyModifiersToRow(
      baseProbabilities[socialClass],
      action.modifiers[socialClass]
    )
  }

  return modified
}

export function applyMultipleActions(
  baseProbabilities: Record<SocialClass, TransitionTable>,
  actions: Action[]
): Record<SocialClass, TransitionTable> {
  if (actions.length === 0) {
    return baseProbabilities
  }

  return actions.reduce(
    (probs, action) => applyActionModifiers(probs, action),
    baseProbabilities
  )
}
