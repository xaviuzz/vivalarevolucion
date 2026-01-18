import { createContext, useContext, ReactNode } from 'react'
import { useGameEngine, GameEngineHook } from '../hooks/useGameEngine'

const GameEngineContext = createContext<GameEngineHook | null>(null)

interface GameEngineProviderProps {
  children: ReactNode
}

export function GameEngineProvider({ children }: GameEngineProviderProps) {
  const gameEngine = useGameEngine()
  return (
    <GameEngineContext.Provider value={gameEngine}>
      {children}
    </GameEngineContext.Provider>
  )
}

export function useGameEngineContext(): GameEngineHook {
  const context = useContext(GameEngineContext)
  if (!context) {
    throw new Error('useGameEngineContext must be used within GameEngineProvider')
  }
  return context
}
