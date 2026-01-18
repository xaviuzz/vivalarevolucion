import type { Citizen } from '../../types/Citizen'
import { useStatistics } from './useStatistics'
import { ClassStatisticItem } from './ClassStatisticItem'
import styles from './Statistics.module.css'

interface StatisticsProps {
  citizens: Citizen[]
}

export function Statistics({ citizens }: StatisticsProps) {
  const { byClass } = useStatistics(citizens)

  return (
    <div className={styles.container}>
      <ul className={styles.classList}>
        {byClass.map(({ socialClass, count, percentage, trend }) => (
          <ClassStatisticItem
            key={socialClass}
            socialClass={socialClass}
            count={count}
            percentage={percentage}
            trend={trend}
          />
        ))}
      </ul>
    </div>
  )
}
