import { useEffect, useMemo, useRef } from 'react'
import type { Citizen } from '../../types/Citizen'
import { Militancy, MILITANCIES } from '../../types/Militancy'
import type { Trend } from './useStatistics'

export interface MilitancyStatistic {
  militancy: Militancy
  count: number
  percentage: number
  trend: Trend
}

export interface MilitancyStatistics {
  total: number
  byMilitancy: MilitancyStatistic[]
}

function countCitizensByMilitancy(citizens: Citizen[]): Record<Militancy, number> {
  const counts = {
    [Militancy.FASCISMO]: 0,
    [Militancy.STATUSQUO]: 0,
    [Militancy.ANARQUISMO]: 0
  }
  for (const citizen of citizens) {
    counts[citizen.militancy]++
  }
  return counts
}

const MILITANCY_ORDER = [
  Militancy.FASCISMO,
  Militancy.STATUSQUO,
  Militancy.ANARQUISMO
]

function getMilitancyIndex(militancy: Militancy): number {
  return MILITANCY_ORDER.indexOf(militancy)
}

function sortByMilitancyOrder(statistics: MilitancyStatistic[]): MilitancyStatistic[] {
  return [...statistics].sort((a, b) => {
    return getMilitancyIndex(a.militancy) - getMilitancyIndex(b.militancy)
  })
}

function calculateTrend(current: number, previous: number | undefined): Trend {
  if (previous === undefined) return 'stable'
  if (current > previous) return 'up'
  if (current < previous) return 'down'
  return 'stable'
}

function calculateMilitancyStatistics(
  citizens: Citizen[],
  previousPercentages: Map<Militancy, number>
): MilitancyStatistic[] {
  const total = citizens.length
  const militancyCounts = countCitizensByMilitancy(citizens)

  const statistics = MILITANCIES.map(militancy => {
    const count = militancyCounts[militancy]
    const percentage = total > 0 ? (count / total) * 100 : 0
    const trend = calculateTrend(percentage, previousPercentages.get(militancy))
    return { militancy, count, percentage, trend }
  })

  return sortByMilitancyOrder(statistics)
}

export function useMilitancyStatistics(citizens: Citizen[]): MilitancyStatistics {
  const previousPercentagesRef = useRef<Map<Militancy, number>>(new Map())

  const result = useMemo(() => {
    const total = citizens.length
    const byMilitancy = calculateMilitancyStatistics(citizens, previousPercentagesRef.current)
    return { total, byMilitancy }
  }, [citizens])

  useEffect(() => {
    const newPercentages = new Map<Militancy, number>()
    for (const stat of result.byMilitancy) {
      newPercentages.set(stat.militancy, stat.percentage)
    }
    previousPercentagesRef.current = newPercentages
  }, [result.byMilitancy])

  return result
}
