import { useState, useCallback } from 'react'

export interface TurnManager {
  currentTurn: number
  endTurn: () => void
}

export function useTurnManager(): TurnManager {
  const [currentTurn, setCurrentTurn] = useState(1)

  const endTurn = useCallback(() => {
    setCurrentTurn(prev => prev + 1)
  }, [])

  return { currentTurn, endTurn }
}
