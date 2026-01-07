import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useStatistics } from './useStatistics'
import { SocialClass, type Citizen } from '../../types/Citizen'

describe('useStatistics', () => {
  it('calculates total number of citizens', () => {
    const citizens = SUT.createCitizens(150)
    const statistics = SUT.useStatistics(citizens)

    expect(statistics.total).toBe(150)
  })

  it('calculates statistics for all social classes', () => {
    const citizens = SUT.createBalancedCitizens()
    const statistics = SUT.useStatistics(citizens)

    expect(statistics.byClass).toHaveLength(4)
  })

  it('calculates correct count for each social class', () => {
    const citizens = SUT.createBalancedCitizens()
    const statistics = SUT.useStatistics(citizens)

    const desposeidos = SUT.findClassStatistic(statistics.byClass, SocialClass.DESPOSEIDOS)
    const obreros = SUT.findClassStatistic(statistics.byClass, SocialClass.OBREROS)
    const claseMedia = SUT.findClassStatistic(statistics.byClass, SocialClass.CLASE_MEDIA)
    const elites = SUT.findClassStatistic(statistics.byClass, SocialClass.ELITES)

    expect(desposeidos?.count).toBe(25)
    expect(obreros?.count).toBe(25)
    expect(claseMedia?.count).toBe(25)
    expect(elites?.count).toBe(25)
  })

  it('calculates correct percentage for each social class', () => {
    const citizens = SUT.createBalancedCitizens()
    const statistics = SUT.useStatistics(citizens)

    statistics.byClass.forEach(stat => {
      expect(stat.percentage).toBe(25)
    })
  })

  it('handles empty citizen array', () => {
    const citizens: Citizen[] = []
    const statistics = SUT.useStatistics(citizens)

    expect(statistics.total).toBe(0)
    expect(statistics.byClass).toHaveLength(0)
  })

  it('calculates correct percentages for unbalanced distribution', () => {
    const citizens = SUT.createUnbalancedCitizens()
    const statistics = SUT.useStatistics(citizens)

    const desposeidos = SUT.findClassStatistic(statistics.byClass, SocialClass.DESPOSEIDOS)
    const obreros = SUT.findClassStatistic(statistics.byClass, SocialClass.OBREROS)

    expect(desposeidos?.count).toBe(60)
    expect(desposeidos?.percentage).toBe(60)
    expect(obreros?.count).toBe(40)
    expect(obreros?.percentage).toBe(40)
  })
})

class SUT {
  static useStatistics(citizens: Citizen[]) {
    const { result } = renderHook(() => useStatistics(citizens))
    return result.current
  }

  static createCitizens(total: number): Citizen[] {
    const classes = Object.values(SocialClass)
    return Array.from({ length: total }, (_, id) => ({
      id,
      socialClass: classes[id % classes.length]
    }))
  }

  static createBalancedCitizens(): Citizen[] {
    const citizens: Citizen[] = []
    let id = 0

    for (const socialClass of Object.values(SocialClass)) {
      for (let i = 0; i < 25; i++) {
        citizens.push({ id: id++, socialClass })
      }
    }

    return citizens
  }

  static createUnbalancedCitizens(): Citizen[] {
    const citizens: Citizen[] = []
    let id = 0

    for (let i = 0; i < 60; i++) {
      citizens.push({ id: id++, socialClass: SocialClass.DESPOSEIDOS })
    }

    for (let i = 0; i < 40; i++) {
      citizens.push({ id: id++, socialClass: SocialClass.OBREROS })
    }

    return citizens
  }

  static findClassStatistic(statistics: { socialClass: SocialClass; count: number; percentage: number }[], socialClass: SocialClass) {
    return statistics.find(stat => stat.socialClass === socialClass)
  }
}
