import { Citizen, SocialClass } from './Citizen'
import { Militancy } from './Militancy'

export interface TransitionModifier {
  [SocialClass.ELITES]: number
  [SocialClass.CLASE_MEDIA]: number
  [SocialClass.OBREROS]: number
  [SocialClass.DESPOSEIDOS]: number
}

export type TransitionModifierTable = Record<SocialClass, TransitionModifier>

export interface MilitancyTransitionModifier {
  [Militancy.FASCISMO]: number
  [Militancy.STATUSQUO]: number
  [Militancy.ANARQUISMO]: number
}

export type MilitancyModifierTable = Record<SocialClass, MilitancyTransitionModifier>

export type MilitancyModifierCalculator = (citizens: Citizen[]) => MilitancyModifierTable

export interface Action {
  id: string
  name: string
  description: string
  modifiers?: TransitionModifierTable
  militancyModifiers?: MilitancyModifierTable
  calculateMilitancyModifiers?: MilitancyModifierCalculator
}
