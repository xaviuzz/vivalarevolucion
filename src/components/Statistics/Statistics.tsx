import type { Citizen } from '../../types/Citizen'
import { useStatistics } from './useStatistics'
import { ClassStatisticItem } from './ClassStatisticItem'
import styles from './Statistics.module.css'

interface StatisticsProps {
  citizens: Citizen[]
}

export function Statistics({ citizens }: StatisticsProps) {
  const { total, byClass } = useStatistics(citizens)

  return (
    <div className={styles.container}>
      <div className={styles.total}>{total}</div>

      <ul className={styles.classList}>
        {byClass.map(({ socialClass, count, percentage }) => (
          <ClassStatisticItem
            key={socialClass}
            socialClass={socialClass}
            count={count}
            percentage={percentage}
          />
        ))}
      </ul>
    </div>
  )
}
