import { useEffect, useMemo, useRef } from 'react'
import type { Citizen } from '../../types/Citizen'
import { SocialClass } from '../../types/Citizen'
import { Militancy, MILITANCIES } from '../../types/Militancy'
import type { Trend } from './useStatistics'

export interface ClassDistribution {
  desposeidos: number
  obreros: number
  claseMedia: number
  elites: number
}

export interface MilitancyStatistic {
  militancy: Militancy
  count: number
  percentage: number
  trend: Trend
  classDistribution: ClassDistribution
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

function calculateClassDistribution(citizens: Citizen[], militancy: Militancy): ClassDistribution {
  const militancyCitizens = citizens.filter(c => c.militancy === militancy)
  const total = militancyCitizens.length

  if (total === 0) {
    return { desposeidos: 0, obreros: 0, claseMedia: 0, elites: 0 }
  }

  const counts = {
    [SocialClass.DESPOSEIDOS]: 0,
    [SocialClass.OBREROS]: 0,
    [SocialClass.CLASE_MEDIA]: 0,
    [SocialClass.ELITES]: 0
  }

  for (const citizen of militancyCitizens) {
    counts[citizen.socialClass]++
  }

  return {
    desposeidos: (counts[SocialClass.DESPOSEIDOS] / total) * 100,
    obreros: (counts[SocialClass.OBREROS] / total) * 100,
    claseMedia: (counts[SocialClass.CLASE_MEDIA] / total) * 100,
    elites: (counts[SocialClass.ELITES] / total) * 100
  }
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
    const classDistribution = calculateClassDistribution(citizens, militancy)
    return { militancy, count, percentage, trend, classDistribution }
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
