import { useMemo } from 'react'
import type { Citizen } from '../../types/Citizen'
import { SocialClass } from '../../types/Citizen'

export interface ClassStatistic {
  socialClass: SocialClass
  count: number
  percentage: number
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

function calculateClassStatistics(citizens: Citizen[]): ClassStatistic[] {
  const total = citizens.length
  const classCounts = countCitizensByClass(citizens)

  const statistics = Object.entries(classCounts).map(([socialClass, count]) => ({
    socialClass: socialClass as SocialClass,
    count,
    percentage: (count / total) * 100
  }))

  return sortByClassHierarchy(statistics)
}

export function useStatistics(citizens: Citizen[]): Statistics {
  return useMemo(() => {
    const total = citizens.length
    const byClass = calculateClassStatistics(citizens)

    return { total, byClass }
  }, [citizens])
}
