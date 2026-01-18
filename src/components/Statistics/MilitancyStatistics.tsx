import type { Citizen } from '../../types/Citizen'
import { useMilitancyStatistics } from './useMilitancyStatistics'
import { MilitancyStatisticItem } from './MilitancyStatisticItem'
import styles from './Statistics.module.css'

interface MilitancyStatisticsProps {
  citizens: Citizen[]
}

export function MilitancyStatistics({ citizens }: MilitancyStatisticsProps) {
  const { byMilitancy } = useMilitancyStatistics(citizens)

  return (
    <div className={styles.container}>
      <ul className={styles.classList}>
        {byMilitancy.map(({ militancy, count, percentage, trend }) => (
          <MilitancyStatisticItem
            key={militancy}
            militancy={militancy}
            count={count}
            percentage={percentage}
            trend={trend}
          />
        ))}
      </ul>
    </div>
  )
}
