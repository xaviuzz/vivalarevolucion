import { Militancy } from '../../types/Militancy'
import type { Trend } from './useStatistics'
import type { ClassDistribution } from './useMilitancyStatistics'

const MILITANCY_DISPLAY_NAMES: Record<Militancy, string> = {
  [Militancy.FASCISMO]: 'Fascismo',
  [Militancy.STATUSQUO]: 'Status Quo',
  [Militancy.ANARQUISMO]: 'Anarquismo'
}

const TREND_SYMBOLS: Record<Trend, string> = {
  up: '▲',
  down: '▼',
  stable: '—'
}

function getMilitancyDisplayName(militancy: Militancy): string {
  return MILITANCY_DISPLAY_NAMES[militancy]
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

function formatTooltip(militancy: Militancy, count: number): string {
  return `${getMilitancyDisplayName(militancy)}: ${count}`
}

function getTrendSymbol(trend: Trend): string {
  return TREND_SYMBOLS[trend]
}

function buildDistributionGradient(dist: ClassDistribution): string {
  const desposeidos = dist.desposeidos
  const obreros = desposeidos + dist.obreros
  const claseMedia = obreros + dist.claseMedia

  return `linear-gradient(to top,
    var(--class-desposeidos) 0% ${desposeidos}%,
    var(--class-obreros) ${desposeidos}% ${obreros}%,
    var(--class-clase-media) ${obreros}% ${claseMedia}%,
    var(--class-elites) ${claseMedia}% 100%
  )`
}

interface MilitancyStatisticItemData {
  tooltipText: string
  distributionBarStyle: { background: string }
  formattedPercentage: string
  trendSymbol: string
}

export function useMilitancyStatisticItem(
  militancy: Militancy,
  count: number,
  percentage: number,
  trend: Trend,
  classDistribution: ClassDistribution
): MilitancyStatisticItemData {
  return {
    tooltipText: formatTooltip(militancy, count),
    distributionBarStyle: { background: buildDistributionGradient(classDistribution) },
    formattedPercentage: formatPercentage(percentage),
    trendSymbol: getTrendSymbol(trend)
  }
}
