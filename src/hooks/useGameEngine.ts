import { useState, useCallback } from 'react'
import { Citizen, SOCIAL_CLASSES } from '../types/Citizen'
import { Action } from '../types/Action'
import { GameEngine } from '../game/GameEngine'
import { countByClass } from '../utils/citizenUtils'

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

function generateTurnLog(before: Citizen[], after: Citizen[]): string {
  const beforeCounts = countByClass(before)
  const afterCounts = countByClass(after)

  const changes: string[] = []
  for (const sc of SOCIAL_CLASSES) {
    const diff = (afterCounts.get(sc) ?? 0) - (beforeCounts.get(sc) ?? 0)
    if (diff !== 0) {
      changes.push(`${sc}: ${diff > 0 ? '+' : ''}${diff}`)
    }
  }

  return changes.length > 0 ? changes.join(', ') : 'Sin cambios'
}

export function useGameEngine(): GameEngineHook {
  const [engine, setEngine] = useState<GameEngine>(() => GameEngine.createNew())
  const [logs, setLogs] = useState<GameLog[]>([])

  const endTurn = useCallback(() => {
    const beforeCitizens = engine.getCitizens()
    const turn = engine.getCurrentTurn()
    const newEngine = engine.endTurn()
    const afterCitizens = newEngine.getCitizens()

    const message = generateTurnLog(beforeCitizens, afterCitizens)
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
