import { useEffect, useMemo, useRef } from 'react'
import type { Citizen } from '../../types/Citizen'
import { SocialClass } from '../../types/Citizen'

export type Trend = 'up' | 'down' | 'stable'

export interface ClassStatistic {
  socialClass: SocialClass
  count: number
  percentage: number
  trend: Trend
}

export interface Statistics {
  total: number
  byClass: ClassStatistic[]
}

function countCitizensByClass(citizens: Citizen[]): Record<SocialClass, number> {
  return citizens.reduce((counts, citizen) => {
    counts[citizen.socialClass] = (counts[citizen.socialClass] || 0) + 1
    return counts
  }, {} as Record<SocialClass, number>)
}

const CLASS_HIERARCHY_ORDER = [
  SocialClass.ELITES,
  SocialClass.CLASE_MEDIA,
  SocialClass.OBREROS,
  SocialClass.DESPOSEIDOS
]

function getClassHierarchyIndex(socialClass: SocialClass): number {
  return CLASS_HIERARCHY_ORDER.indexOf(socialClass)
}

function sortByClassHierarchy(statistics: ClassStatistic[]): ClassStatistic[] {
  return [...statistics].sort((a, b) => {
    return getClassHierarchyIndex(a.socialClass) - getClassHierarchyIndex(b.socialClass)
  })
}

function calculateTrend(current: number, previous: number | undefined): Trend {
  if (previous === undefined) return 'stable'
  if (current > previous) return 'up'
  if (current < previous) return 'down'
  return 'stable'
}

function calculateClassStatistics(
  citizens: Citizen[],
  previousPercentages: Map<SocialClass, number>
): ClassStatistic[] {
  const total = citizens.length
  const classCounts = countCitizensByClass(citizens)

  const statistics = Object.entries(classCounts).map(([socialClass, count]) => {
    const sc = socialClass as SocialClass
    const percentage = (count / total) * 100
    const trend = calculateTrend(percentage, previousPercentages.get(sc))
    return { socialClass: sc, count, percentage, trend }
  })

  return sortByClassHierarchy(statistics)
}

export function useStatistics(citizens: Citizen[]): Statistics {
  const previousPercentagesRef = useRef<Map<SocialClass, number>>(new Map())

  const result = useMemo(() => {
    const total = citizens.length
    const byClass = calculateClassStatistics(citizens, previousPercentagesRef.current)
    return { total, byClass }
  }, [citizens])

  useEffect(() => {
    const newPercentages = new Map<SocialClass, number>()
    for (const stat of result.byClass) {
      newPercentages.set(stat.socialClass, stat.percentage)
    }
    previousPercentagesRef.current = newPercentages
  }, [result.byClass])

  return result
}
