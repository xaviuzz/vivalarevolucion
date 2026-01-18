import { WELFARE_STATE_ACTION } from '../../game/actions'
import { ActionToggle } from './ActionToggle'
import styles from './GameControls.module.css'

interface GameControlsProps {
  currentTurn: number
  onEndTurn: () => void
}

export function GameControls({ currentTurn, onEndTurn }: GameControlsProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <button className={styles.endTurnButton} onClick={onEndTurn}>
          Acabar turno
        </button>
        <ActionToggle action={WELFARE_STATE_ACTION} />
        <span className={styles.turnDisplay}>Turno {currentTurn}</span>
      </div>
    </div>
  )
}
