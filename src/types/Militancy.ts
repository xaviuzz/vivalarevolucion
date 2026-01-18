/**
 * Militancy categories for citizens
 */
export enum Militancy {
  FASCISMO = 'FASCISMO',
  STATUSQUO = 'STATUSQUO',
  ANARQUISMO = 'ANARQUISMO'
}

/**
 * Get all militancy values as an array
 */
export const MILITANCIES = [
  Militancy.FASCISMO,
  Militancy.STATUSQUO,
  Militancy.ANARQUISMO
] as const
