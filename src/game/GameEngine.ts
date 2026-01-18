import { Citizen, SocialClass, SOCIAL_CLASSES } from '../types/Citizen'
import { Action } from '../types/Action'
import { generateCitizens } from './population/citizenGenerator'
import { evolveCitizens } from './evolution/evolutionEngine'
import { TRANSITION_PROBABILITIES } from './evolution/evolutionProbabilities'
import { applyMultipleActions } from './actions/applyModifiers'

export interface GameEngineState {
  citizens: Citizen[]
  currentTurn: number
  activeActions: Action[]
}

export class GameEngine {
  private constructor(private readonly state: GameEngineState) {}

  static createNew(): GameEngine {
    const citizens = generateCitizens()
    return new GameEngine({
      citizens,
      currentTurn: 1,
      activeActions: []
    })
  }

  static fromState(state: GameEngineState): GameEngine {
    return new GameEngine(state)
  }

  getState(): GameEngineState {
    return {
      citizens: [...this.state.citizens],
      currentTurn: this.state.currentTurn,
      activeActions: [...this.state.activeActions]
    }
  }

  getCitizens(): Citizen[] {
    return [...this.state.citizens]
  }

  getCurrentTurn(): number {
    return this.state.currentTurn
  }

  getActiveActions(): Action[] {
    return [...this.state.activeActions]
  }

  activateAction(action: Action): GameEngine {
    const actionAlreadyActive = this.state.activeActions.some(a => a.id === action.id)
    if (actionAlreadyActive) {
      return this
    }

    return new GameEngine({
      ...this.state,
      activeActions: [...this.state.activeActions, action]
    })
  }

  deactivateAction(actionId: string): GameEngine {
    return new GameEngine({
      ...this.state,
      activeActions: this.state.activeActions.filter(a => a.id !== actionId)
    })
  }

  endTurn(): GameEngine {
    const effectiveProbabilities = applyMultipleActions(
      TRANSITION_PROBABILITIES,
      this.state.activeActions
    )

    const evolvedCitizens = evolveCitizens(this.state.citizens, effectiveProbabilities)

    return new GameEngine({
      ...this.state,
      citizens: evolvedCitizens,
      currentTurn: this.state.currentTurn + 1
    })
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
