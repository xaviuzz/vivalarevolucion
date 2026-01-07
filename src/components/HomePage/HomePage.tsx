import { useMemo } from 'react'
import { generateCitizens } from '../../utils/citizenGenerator'
import { calculateMatrixDimensions } from '../../utils/matrixLayout'
import { Barrio } from '../Barrio/Barrio'
import { Title } from '../Title/Title'
import styles from './HomePage.module.css'

export function HomePage() {
  const barrio = useMemo(() => {
    const citizens = generateCitizens()
    const dimensions = calculateMatrixDimensions(citizens.length)
    return { citizens, dimensions }
  }, [])

  return (
    <>
      <Title />
      <div className={styles.container}>
        <Barrio citizens={barrio.citizens} dimensions={barrio.dimensions} />
      </div>
    </>
  )
}
