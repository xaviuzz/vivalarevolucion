import { SocialClass } from './Citizen'

export interface TransitionModifier {
  [SocialClass.ELITES]: number
  [SocialClass.CLASE_MEDIA]: number
  [SocialClass.OBREROS]: number
  [SocialClass.DESPOSEIDOS]: number
}

export type TransitionModifierTable = Record<SocialClass, TransitionModifier>

export interface Action {
  id: string
  name: string
  description: string
  modifiers: TransitionModifierTable
}
