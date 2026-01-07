import styles from './GameControls.module.css'

interface GameControlsProps {
  currentTurn: number
  onEndTurn: () => void
}

export function GameControls({ currentTurn, onEndTurn }: GameControlsProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <p className={styles.turnDisplay}>Turno {currentTurn}</p>
        <button className={styles.endTurnButton} onClick={onEndTurn}>
          Acabar turno
        </button>
      </div>
    </div>
  )
}
