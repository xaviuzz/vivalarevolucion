export { applyActionModifiers, applyMultipleActions } from './applyModifiers'
export { applyMilitancyModifiers } from './applyMilitancyModifiers'
export { WELFARE_STATE_ACTION } from './welfareStateAction/action'
export { PROSELYTISM_ACTION } from './proselytismAction/action'
export { PROPAGANDA_ACTION } from './propagandaAction/action'
export { ATENEO_ACTION } from './atenenoAction/action'

import { WELFARE_STATE_ACTION } from './welfareStateAction/action'
import { PROSELYTISM_ACTION } from './proselytismAction/action'
import { PROPAGANDA_ACTION } from './propagandaAction/action'
import { ATENEO_ACTION } from './atenenoAction/action'
import { Action } from '../../types/Action'

export const AVAILABLE_ACTIONS: Action[] = [
  WELFARE_STATE_ACTION,
  PROSELYTISM_ACTION,
  PROPAGANDA_ACTION,
  ATENEO_ACTION
]
