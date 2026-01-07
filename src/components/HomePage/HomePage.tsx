import { useMemo } from 'react'
import { generateCitizens } from '../../game/population/citizenGenerator'
import { Barrio } from '../Barrio/Barrio'
import { Title } from '../Title/Title'
import { GameControls } from '../GameControls/GameControls'
import { useTurnManager } from '../../game/turns/useTurnManager'
import styles from './HomePage.module.css'

export function HomePage() {
  const { currentTurn, endTurn } = useTurnManager()

  const citizens = useMemo(() => generateCitizens(), [])

  return (
    <>
      <Title />
      <GameControls currentTurn={currentTurn} onEndTurn={endTurn} />
      <div className={styles.container}>
        <Barrio citizens={citizens} />
      </div>
    </>
  )
}
