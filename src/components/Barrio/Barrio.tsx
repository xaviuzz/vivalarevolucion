import { Citizen as CitizenComponent } from '../Citizen/Citizen'
import type { Citizen, MatrixDimensions } from '../../models'
import styles from './Barrio.module.css'

interface BarrioProps {
  citizens: Citizen[]
  dimensions: MatrixDimensions
}

export function Barrio({ citizens, dimensions }: BarrioProps) {
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
