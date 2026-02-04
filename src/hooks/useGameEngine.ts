import { useState, useCallback } from 'react'
import { Citizen } from '../types/Citizen'
import { Action } from '../types/Action'
import { GameEngine } from '../game/GameEngine'
import { generateNarrativeLog } from '../game/narrativeLog'

export interface GameLog {
  turn: number
  message: string
}

export interface GameEngineHook {
  citizens: Citizen[]
  currentTurn: number
  activeActions: Action[]
  logs: GameLog[]
  endTurn: () => void
  activateAction: (action: Action) => void
  deactivateAction: (actionId: string) => void
}

export function useGameEngine(): GameEngineHook {
  const [engine, setEngine] = useState<GameEngine>(() => GameEngine.createNew())
  const [logs, setLogs] = useState<GameLog[]>([])

  const endTurn = useCallback(() => {
    const beforeCitizens = engine.getCitizens()
    const turn = engine.getCurrentTurn()
    const newEngine = engine.endTurn()
    const afterCitizens = newEngine.getCitizens()

    const message = generateNarrativeLog(beforeCitizens, afterCitizens)
    setLogs(prevLogs => [...prevLogs, { turn, message }])
    setEngine(newEngine)
  }, [engine])

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
    logs,
    endTurn,
    activateAction,
    deactivateAction
  }
}
