import { useMemo } from 'react'
import { generateCitizens } from '../../utils/citizenGenerator'
import { calculateMatrixDimensions } from '../../utils/matrixLayout'
import { Barrio } from '../Barrio/Barrio'
import styles from './HomePage.module.css'

export function HomePage() {
  // Generate citizens once on mount
  const barrio = useMemo(() => {
    const citizens = generateCitizens()
    const dimensions = calculateMatrixDimensions(citizens.length)
    return { citizens, dimensions }
  }, [])

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>VIVA LA REVOLUCION!!</h1>
      <Barrio citizens={barrio.citizens} dimensions={barrio.dimensions} />
    </div>
  )
}
