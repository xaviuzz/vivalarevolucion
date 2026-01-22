import { SocialClass } from '../../types/Citizen'
import { Militancy, MILITANCIES } from '../../types/Militancy'
import { MilitancyModifierTable } from '../../types/Action'
import { MilitancyTransitionTable } from '../config/militancyProbabilities'

const MINIMUM_PROBABILITY = 0.000001
const NORMALIZATION_TOLERANCE = 0.000001

function clampProbability(value: number): number {
  return Math.max(MINIMUM_PROBABILITY, Math.min(1, value))
}

function needsNormalization(sum: number): boolean {
  return Math.abs(sum - 1.0) >= NORMALIZATION_TOLERANCE
}

function normalizeMilitancyRow(row: MilitancyTransitionTable): MilitancyTransitionTable {
  const sum = MILITANCIES.reduce((acc, militancy) => acc + row[militancy], 0)

  if (!needsNormalization(sum)) {
    return row
  }

  const normalized = {} as MilitancyTransitionTable
  for (const militancy of MILITANCIES) {
    normalized[militancy] = row[militancy] / sum
  }

  return normalized
}

function applyModifiersToRow(
  baseRow: MilitancyTransitionTable,
  classModifiers: MilitancyTransitionTable
): MilitancyTransitionTable {
  const modifiedRow = {} as MilitancyTransitionTable

  for (const toMilitancy of MILITANCIES) {
    const baseProbability = baseRow[toMilitancy]
    const modifier = classModifiers[toMilitancy]
    const adjustedProbability = baseProbability + modifier
    modifiedRow[toMilitancy] = clampProbability(adjustedProbability)
  }

  return modifiedRow
}

export function applyMilitancyModifiers(
  baseProbabilities: Record<Militancy, MilitancyTransitionTable>,
  modifiers: MilitancyModifierTable,
  citizenClass: SocialClass
): Record<Militancy, MilitancyTransitionTable> {
  const modified = {} as Record<Militancy, MilitancyTransitionTable>
  const classModifiers = modifiers[citizenClass]

  for (const fromMilitancy of MILITANCIES) {
    const baseRow = baseProbabilities[fromMilitancy]
    const modifiedRow = applyModifiersToRow(baseRow, classModifiers)
    modified[fromMilitancy] = normalizeMilitancyRow(modifiedRow)
  }

  return modified
}
