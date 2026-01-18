import { Barrio } from '../Barrio/Barrio'
import { Title } from '../Title/Title'
import { GameControls } from '../GameControls/GameControls'
import { Statistics } from '../Statistics/Statistics'
import { GameConsole } from '../GameConsole/GameConsole'
import { GameEngineProvider, useGameEngineContext } from '../../contexts/GameEngineContext'
import styles from './HomePage.module.css'

function HomePageContent() {
  const { citizens, currentTurn, logs, endTurn } = useGameEngineContext()

  return (
    <div className={styles.layout}>
      <Title />
      <div className={styles.mainContent}>
        <div className={styles.barrioSection}>
          <Barrio citizens={citizens} />
          <GameControls currentTurn={currentTurn} onEndTurn={endTurn} />
          <GameConsole logs={logs} />
        </div>
        <div className={styles.statisticsSection}>
          <Statistics citizens={citizens} />
        </div>
      </div>
    </div>
  )
}

export function HomePage() {
  return (
    <GameEngineProvider>
      <HomePageContent />
    </GameEngineProvider>
  )
}
