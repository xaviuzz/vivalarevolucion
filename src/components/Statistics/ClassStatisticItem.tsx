import { SocialClass } from '../../types/Citizen'
import styles from './Statistics.module.css'

interface ClassStatisticItemProps {
  socialClass: SocialClass
  count: number
  percentage: number
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

function getClassDisplayName(socialClass: SocialClass): string {
  const names: Record<SocialClass, string> = {
    [SocialClass.DESPOSEIDOS]: 'Desposeídos',
    [SocialClass.OBREROS]: 'Obreros',
    [SocialClass.CLASE_MEDIA]: 'Clase Media',
    [SocialClass.ELITES]: 'Élites'
  }
  return names[socialClass]
}

function formatTooltip(socialClass: SocialClass, count: number): string {
  return `${getClassDisplayName(socialClass)}: ${count}`
}

export function ClassStatisticItem({ socialClass, count, percentage }: ClassStatisticItemProps) {
  const tooltipText = formatTooltip(socialClass, count)

  return (
    <li
      className={styles.classItem}
      title={tooltipText}
      aria-label={tooltipText}
    >
      <span
        className={styles.colorIndicator}
        data-class={socialClass}
      />
      <span className={styles.classValue}>
        {formatPercentage(percentage)}
      </span>
    </li>
  )
}
