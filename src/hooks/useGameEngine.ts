import { useState, useCallback } from 'react'
import { Citizen } from '../types/Citizen'
import { GameEngine } from '../game/GameEngine'

export interface GameEngineHook {
  citizens: Citizen[]
  currentTurn: number
  endTurn: () => void
}

export function useGameEngine(): GameEngineHook {
  const [engine, setEngine] = useState<GameEngine>(() => GameEngine.createNew())

  const endTurn = useCallback(() => {
    setEngine(prevEngine => prevEngine.endTurn())
  }, [])

  return {
    citizens: engine.getCitizens(),
    currentTurn: engine.getCurrentTurn(),
    endTurn
  }
}
