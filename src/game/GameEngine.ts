import { Citizen } from '../types/Citizen'
import { Action } from '../types/Action'
import { ClassDistribution } from '../types/ClassDistribution'
import { generateCitizens } from './population/citizenGenerator'
import { evolveCitizens } from './evolution/evolutionEngine'
import { evolveCitizenMilitancy } from './evolution/militancyEvolutionEngine'
import { TRANSITION_PROBABILITIES } from './evolution/evolutionProbabilities'
import { MILITANCY_TRANSITION_PROBABILITIES } from './config/militancyProbabilities'
import { applyMultipleActions } from './actions/applyModifiers'
import { applyMilitancyModifiers } from './actions/applyMilitancyModifiers'

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
    const actionAlreadyActive = this.state.activeActions.some(active => active.id === action.id)
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
      activeActions: this.state.activeActions.filter(action => action.id !== actionId)
    })
  }

  endTurn(): GameEngine {
    const evolvedCitizens = this.evolveMilitancy(this.evolveClasses())

    return new GameEngine({
      ...this.state,
      citizens: evolvedCitizens,
      currentTurn: this.state.currentTurn + 1
    })
  }

  private evolveClasses(): Citizen[] {
    const actions = this.state.activeActions.filter(action => action.modifiers)
    const effectiveProbabilities = applyMultipleActions(
      TRANSITION_PROBABILITIES,
      actions
    )
    return evolveCitizens(this.state.citizens, effectiveProbabilities)
  }

  private evolveMilitancy(citizens: Citizen[]): Citizen[] {
    const actions = this.state.activeActions.filter(
      action => action.militancyModifiers || action.calculateMilitancyModifiers
    )

    if (actions.length === 0) {
      return citizens
    }

    return citizens.map(citizen => this.applyMilitancyActions(citizen, citizens, actions))
  }

  private applyMilitancyActions(citizen: Citizen, allCitizens: Citizen[], actions: Action[]): Citizen {
    let probabilities = MILITANCY_TRANSITION_PROBABILITIES

    for (const action of actions) {
      const modifiers = action.calculateMilitancyModifiers
        ? action.calculateMilitancyModifiers(allCitizens)
        : action.militancyModifiers!

      probabilities = applyMilitancyModifiers(
        probabilities,
        modifiers,
        citizen.socialClass
      )
    }

    return evolveCitizenMilitancy(citizen, probabilities)
  }

  getCitizenCount(): number {
    return this.state.citizens.length
  }

  getClassDistribution(): ClassDistribution {
    return ClassDistribution.fromCitizens(this.state.citizens)
  }
}
