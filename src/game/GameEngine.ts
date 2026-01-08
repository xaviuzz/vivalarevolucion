import { Citizen, SocialClass, SOCIAL_CLASSES } from '../types/Citizen'
import { generateCitizens } from './population/citizenGenerator'
import { evolveCitizens } from './evolution/evolutionEngine'

export interface GameEngineState {
  citizens: Citizen[]
  currentTurn: number
}

export class GameEngine {
  private constructor(private readonly state: GameEngineState) {}

  static createNew(): GameEngine {
    const citizens = generateCitizens()
    return new GameEngine({
      citizens,
      currentTurn: 1
    })
  }

  static fromState(state: GameEngineState): GameEngine {
    return new GameEngine(state)
  }

  getState(): GameEngineState {
    return {
      citizens: [...this.state.citizens],
      currentTurn: this.state.currentTurn
    }
  }

  getCitizens(): Citizen[] {
    return [...this.state.citizens]
  }

  getCurrentTurn(): number {
    return this.state.currentTurn
  }

  endTurn(): GameEngine {
    const evolvedCitizens = evolveCitizens(this.state.citizens)
    const newState: GameEngineState = {
      citizens: evolvedCitizens,
      currentTurn: this.state.currentTurn + 1
    }
    return new GameEngine(newState)
  }

  getCitizenCount(): number {
    return this.state.citizens.length
  }

  getClassDistribution(): Map<SocialClass, number> {
    const distribution = new Map<SocialClass, number>()

    for (const socialClass of SOCIAL_CLASSES) {
      distribution.set(socialClass, 0)
    }

    for (const citizen of this.state.citizens) {
      const count = distribution.get(citizen.socialClass) ?? 0
      distribution.set(citizen.socialClass, count + 1)
    }

    return distribution
  }
}
