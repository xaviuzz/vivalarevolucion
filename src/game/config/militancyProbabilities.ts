import { Militancy } from '../../types/Militancy'
import { SocialClass } from '../../types/Citizen'

export type MilitancyTransitionTable = Record<Militancy, number>

/**
 * Probabilidades base de transición de militancia.
 * Sin acciones activas, todos mantienen su militancia (matriz identidad).
 * Solo las acciones pueden cambiar la militancia.
 */
export const MILITANCY_TRANSITION_PROBABILITIES: Record<Militancy, MilitancyTransitionTable> = {
  [Militancy.FASCISMO]: {
    [Militancy.FASCISMO]: 1.0,
    [Militancy.STATUSQUO]: 0,
    [Militancy.ANARQUISMO]: 0
  },
  [Militancy.STATUSQUO]: {
    [Militancy.FASCISMO]: 0,
    [Militancy.STATUSQUO]: 1.0,
    [Militancy.ANARQUISMO]: 0
  },
  [Militancy.ANARQUISMO]: {
    [Militancy.FASCISMO]: 0,
    [Militancy.STATUSQUO]: 0,
    [Militancy.ANARQUISMO]: 1.0
  }
}

/**
 * Modificadores por clase social (placeholder).
 * Estructura preparada para cuando se definan las interacciones
 * entre clase social y militancia.
 *
 * Ejemplo futuro:
 * - Élites más propensas a fascismo
 * - Desposeídos más propensos a anarquismo
 */
export const CLASS_MILITANCY_MODIFIERS: Record<SocialClass, Partial<MilitancyTransitionTable>> = {
  [SocialClass.ELITES]: {},
  [SocialClass.CLASE_MEDIA]: {},
  [SocialClass.OBREROS]: {},
  [SocialClass.DESPOSEIDOS]: {}
}
