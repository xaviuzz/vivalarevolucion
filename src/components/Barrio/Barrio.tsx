import { Citizen as CitizenComponent } from '../Citizen/Citizen'
import type { Citizen } from '../../types'
import { useBarrioLayout } from './useBarrioLayout'
import styles from './Barrio.module.css'

interface BarrioProps {
  citizens: Citizen[]
}

export function Barrio({ citizens }: BarrioProps) {
  const dimensions = useBarrioLayout(citizens.length)

  const gridStyle = {
    gridTemplateRows: `repeat(${dimensions.rows}, 1fr)`,
    gridTemplateColumns: `repeat(${dimensions.columns}, 1fr)`
  }

  return (
    <div className={styles.grid} style={gridStyle}>
      {citizens.map((citizen) => (
        <CitizenComponent key={citizen.id} citizen={citizen} />
      ))}
    </div>
  )
}
