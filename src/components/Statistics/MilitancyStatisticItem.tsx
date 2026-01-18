import { Militancy } from '../../types/Militancy'
import type { Trend } from './useStatistics'
import styles from './Statistics.module.css'

interface MilitancyStatisticItemProps {
  militancy: Militancy
  count: number
  percentage: number
  trend: Trend
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

function getMilitancyDisplayName(militancy: Militancy): string {
  const names: Record<Militancy, string> = {
    [Militancy.FASCISMO]: 'Fascismo',
    [Militancy.STATUSQUO]: 'Status Quo',
    [Militancy.ANARQUISMO]: 'Anarquismo'
  }
  return names[militancy]
}

function formatTooltip(militancy: Militancy, count: number): string {
  return `${getMilitancyDisplayName(militancy)}: ${count}`
}

function getTrendSymbol(trend: Trend): string {
  switch (trend) {
    case 'up': return '▲'
    case 'down': return '▼'
    case 'stable': return '—'
  }
}

export function MilitancyStatisticItem({ militancy, count, percentage, trend }: MilitancyStatisticItemProps) {
  const tooltipText = formatTooltip(militancy, count)

  return (
    <li
      className={styles.classItem}
      title={tooltipText}
      aria-label={tooltipText}
    >
      <span
        className={styles.shapeIndicator}
        data-militancy={militancy}
      />
      <span className={styles.classValue}>
        {formatPercentage(percentage)}
      </span>
      <span className={styles.trendIndicator} data-trend={trend}>
        {getTrendSymbol(trend)}
      </span>
    </li>
  )
}
