import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMilitancyStatisticItem } from './useMilitancyStatisticItem'
import { Militancy } from '../../types/Militancy'
import type { Trend } from './useStatistics'
import type { ClassDistribution } from './useMilitancyStatistics'

describe('useMilitancyStatisticItem', () => {
  describe('tooltipText', () => {
    it('formats tooltip with militancy name and count', () => {
      const result = SUT.render(Militancy.FASCISMO, 42)

      expect(result.tooltipText).toBe('Fascismo: 42')
    })

    it('formats Status Quo tooltip correctly', () => {
      const result = SUT.render(Militancy.STATUSQUO, 100)

      expect(result.tooltipText).toBe('Status Quo: 100')
    })

    it('formats Anarquismo tooltip correctly', () => {
      const result = SUT.render(Militancy.ANARQUISMO, 33)

      expect(result.tooltipText).toBe('Anarquismo: 33')
    })
  })

  describe('formattedPercentage', () => {
    it('formats percentage with one decimal', () => {
      const result = SUT.render(Militancy.FASCISMO, 10, 33.333)

      expect(result.formattedPercentage).toBe('33.3%')
    })

    it('formats whole number percentage', () => {
      const result = SUT.render(Militancy.FASCISMO, 10, 50)

      expect(result.formattedPercentage).toBe('50.0%')
    })

    it('formats zero percentage', () => {
      const result = SUT.render(Militancy.FASCISMO, 0, 0)

      expect(result.formattedPercentage).toBe('0.0%')
    })
  })

  describe('trendSymbol', () => {
    it('returns up arrow for up trend', () => {
      const result = SUT.render(Militancy.FASCISMO, 10, 50, 'up')

      expect(result.trendSymbol).toBe('▲')
    })

    it('returns down arrow for down trend', () => {
      const result = SUT.render(Militancy.FASCISMO, 10, 50, 'down')

      expect(result.trendSymbol).toBe('▼')
    })

    it('returns dash for stable trend', () => {
      const result = SUT.render(Militancy.FASCISMO, 10, 50, 'stable')

      expect(result.trendSymbol).toBe('—')
    })
  })

  describe('distributionBarStyle', () => {
    it('builds gradient with all classes', () => {
      const distribution: ClassDistribution = {
        desposeidos: 25,
        obreros: 25,
        claseMedia: 25,
        elites: 25
      }
      const result = SUT.render(Militancy.FASCISMO, 10, 50, 'stable', distribution)

      expect(result.distributionBarStyle.background).toContain('linear-gradient')
      expect(result.distributionBarStyle.background).toContain('var(--class-desposeidos)')
      expect(result.distributionBarStyle.background).toContain('var(--class-obreros)')
      expect(result.distributionBarStyle.background).toContain('var(--class-clase-media)')
      expect(result.distributionBarStyle.background).toContain('var(--class-elites)')
    })

    it('calculates cumulative percentages correctly', () => {
      const distribution: ClassDistribution = {
        desposeidos: 10,
        obreros: 20,
        claseMedia: 30,
        elites: 40
      }
      const result = SUT.render(Militancy.FASCISMO, 10, 50, 'stable', distribution)
      const gradient = result.distributionBarStyle.background

      expect(gradient).toContain('0% 10%')
      expect(gradient).toContain('10% 30%')
      expect(gradient).toContain('30% 60%')
      expect(gradient).toContain('60% 100%')
    })

    it('handles single class distribution', () => {
      const distribution: ClassDistribution = {
        desposeidos: 100,
        obreros: 0,
        claseMedia: 0,
        elites: 0
      }
      const result = SUT.render(Militancy.FASCISMO, 10, 50, 'stable', distribution)
      const gradient = result.distributionBarStyle.background

      expect(gradient).toContain('0% 100%')
    })
  })
})

class SUT {
  private static DEFAULT_DISTRIBUTION: ClassDistribution = {
    desposeidos: 25,
    obreros: 25,
    claseMedia: 25,
    elites: 25
  }

  static render(
    militancy: Militancy,
    count: number,
    percentage: number = 50,
    trend: Trend = 'stable',
    classDistribution: ClassDistribution = SUT.DEFAULT_DISTRIBUTION
  ) {
    const { result } = renderHook(() =>
      useMilitancyStatisticItem(militancy, count, percentage, trend, classDistribution)
    )
    return result.current
  }
}
