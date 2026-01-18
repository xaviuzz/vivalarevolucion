import { GameLog } from '../../hooks/useGameEngine'
import styles from './GameConsole.module.css'

interface GameConsoleProps {
  logs: GameLog[]
}

export function GameConsole({ logs }: GameConsoleProps) {
  return (
    <div className={styles.console}>
      {logs.length === 0 ? (
        <p className={styles.empty}>Esperando acciones...</p>
      ) : (
        [...logs].reverse().map((log, index) => (
          <p key={index} className={styles.logEntry}>
            <span className={styles.turn}>Turno {log.turn}:</span> {log.message}
          </p>
        ))
      )}
    </div>
  )
}
