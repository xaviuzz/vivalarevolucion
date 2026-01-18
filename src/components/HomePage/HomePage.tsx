import { Barrio } from '../Barrio/Barrio'
import { Title } from '../Title/Title'
import { GameControls } from '../GameControls/GameControls'
import { Statistics } from '../Statistics/Statistics'
import { GameEngineProvider, useGameEngineContext } from '../../contexts/GameEngineContext'
import styles from './HomePage.module.css'

function HomePageContent() {
  const { citizens, currentTurn, endTurn } = useGameEngineContext()

  return (
    <>
      <Title />
      <GameControls currentTurn={currentTurn} onEndTurn={endTurn} />
      <div className={styles.container}>
        <div className={styles.barrioSection}>
          <Barrio citizens={citizens} />
        </div>
        <div className={styles.statisticsSection}>
          <Statistics citizens={citizens} />
        </div>
      </div>
    </>
  )
}

export function HomePage() {
  return (
    <GameEngineProvider>
      <HomePageContent />
    </GameEngineProvider>
  )
}
