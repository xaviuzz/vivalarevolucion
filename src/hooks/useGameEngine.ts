import { useState, useCallback } from 'react'
import { Citizen } from '../types/Citizen'
import { Action } from '../types/Action'
import { GameEngine } from '../game/GameEngine'

export interface GameEngineHook {
  citizens: Citizen[]
  currentTurn: number
  activeActions: Action[]
  endTurn: () => void
  activateAction: (action: Action) => void
  deactivateAction: (actionId: string) => void
}

export function useGameEngine(): GameEngineHook {
  const [engine, setEngine] = useState<GameEngine>(() => GameEngine.createNew())

  const endTurn = useCallback(() => {
    setEngine(prevEngine => prevEngine.endTurn())
  }, [])

  const activateAction = useCallback((action: Action) => {
    setEngine(prevEngine => prevEngine.activateAction(action))
  }, [])

  const deactivateAction = useCallback((actionId: string) => {
    setEngine(prevEngine => prevEngine.deactivateAction(actionId))
  }, [])

  return {
    citizens: engine.getCitizens(),
    currentTurn: engine.getCurrentTurn(),
    activeActions: engine.getActiveActions(),
    endTurn,
    activateAction,
    deactivateAction
  }
}
