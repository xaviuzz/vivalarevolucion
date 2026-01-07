import type { Citizen as CitizenType } from '../../models/Citizen'
import styles from './Citizen.module.css'

interface CitizenProps {
  citizen: CitizenType
}

export function Citizen({ citizen }: CitizenProps) {
  return <div className={styles.citizen} data-class={citizen.socialClass} />
}
