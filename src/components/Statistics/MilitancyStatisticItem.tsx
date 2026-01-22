import { Militancy } from '../../types/Militancy'
import type { Trend } from './useStatistics'
import type { ClassDistribution } from './useMilitancyStatistics'
import { useMilitancyStatisticItem } from './useMilitancyStatisticItem'
import styles from './Statistics.module.css'

interface MilitancyStatisticItemProps {
  militancy: Militancy
  count: number
  percentage: number
  trend: Trend
  classDistribution: ClassDistribution
}

export function MilitancyStatisticItem({ militancy, count, percentage, trend, classDistribution }: MilitancyStatisticItemProps) {
  const { tooltipText, distributionBarStyle, formattedPercentage, trendSymbol } = useMilitancyStatisticItem(
    militancy,
    count,
    percentage,
    trend,
    classDistribution
  )

  return (
    <li
      className={styles.classItem}
      title={tooltipText}
      aria-label={tooltipText}
    >
      <span
        className={styles.distributionBar}
        style={distributionBarStyle}
      />
      <span
        className={styles.shapeIndicator}
        data-militancy={militancy}
      />
      <span className={styles.classValue}>
        {formattedPercentage}
      </span>
      <span className={styles.trendIndicator} data-trend={trend}>
        {trendSymbol}
      </span>
    </li>
  )
}
