import { Action } from '../../types/Action'
import { useGameEngineContext } from '../../contexts/GameEngineContext'

export function useActionToggle(action: Action) {
  const { activeActions, activateAction, deactivateAction } = useGameEngineContext()

  const isActive = activeActions.some(a => a.id === action.id)

  const toggle = () => {
    if (isActive) {
      deactivateAction(action.id)
    } else {
      activateAction(action)
    }
  }

  return { isActive, toggle }
}
