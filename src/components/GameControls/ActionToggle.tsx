import { Action } from '../../types/Action'
import { useActionToggle } from './useActionToggle'
import styles from './GameControls.module.css'

interface ActionToggleProps {
  action: Action
}

export function ActionToggle({ action }: ActionToggleProps) {
  const { isActive, toggle } = useActionToggle(action)

  return (
    <label className={styles.actionToggle} title={action.description}>
      <input type="checkbox" checked={isActive} onChange={toggle} />
      {action.name}
    </label>
  )
}
