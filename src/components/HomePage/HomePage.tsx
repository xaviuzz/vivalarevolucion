import { Barrio } from '../Barrio/Barrio'
import { Title } from '../Title/Title'
import { GameControls } from '../GameControls/GameControls'
import { Statistics } from '../Statistics/Statistics'
import { MilitancyStatistics } from '../Statistics/MilitancyStatistics'
import { GameConsole } from '../GameConsole/GameConsole'
import { GameEngineProvider, useGameEngineContext } from '../../contexts/GameEngineContext'
import { AVAILABLE_ACTIONS } from '../../game/actions'
import styles from './HomePage.module.css'

function HomePageContent() {
  const { citizens, currentTurn, logs, endTurn } = useGameEngineContext()

  return (
    <div className={styles.layout}>
      <Title />
      <div className={styles.mainContent}>
        <div className={styles.barrioSection}>
          <Barrio citizens={citizens} />
          <GameControls currentTurn={currentTurn} onEndTurn={endTurn} availableActions={AVAILABLE_ACTIONS} />
          <GameConsole logs={logs} />
        </div>
        <div className={styles.statisticsSection}>
          <Statistics citizens={citizens} />
          <MilitancyStatistics citizens={citizens} />
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
