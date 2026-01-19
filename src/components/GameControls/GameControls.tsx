import { Action } from '../../types/Action'
import { ActionToggle } from './ActionToggle'
import styles from './GameControls.module.css'

interface GameControlsProps {
  currentTurn: number
  onEndTurn: () => void
  availableActions: Action[]
}

export function GameControls({ currentTurn, onEndTurn, availableActions }: GameControlsProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <button className={styles.endTurnButton} onClick={onEndTurn}>
          Acabar turno
        </button>
        {availableActions.map(action => (
          <ActionToggle key={action.id} action={action} />
        ))}
        <span className={styles.turnDisplay}>Turno {currentTurn}</span>
      </div>
    </div>
  )
}
