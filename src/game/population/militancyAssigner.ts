import type { Citizen } from '../../types/Citizen'
import { Militancy } from '../../types/Militancy'

function selectTwoRandomIndices(length: number): [number, number] {
  const first = Math.floor(Math.random() * length)
  let second = Math.floor(Math.random() * (length - 1))
  if (second >= first) {
    second++
  }
  return [first, second]
}

export function assignInitialMilitancy(citizens: Citizen[]): Citizen[] {
  if (citizens.length < 2) {
    return citizens.map(c => ({ ...c, militancy: Militancy.STATUSQUO }))
  }

  const [fascistIndex, anarchistIndex] = selectTwoRandomIndices(citizens.length)

  return citizens.map((citizen, index) => {
    if (index === fascistIndex) {
      return { ...citizen, militancy: Militancy.FASCISMO }
    }
    if (index === anarchistIndex) {
      return { ...citizen, militancy: Militancy.ANARQUISMO }
    }
    return { ...citizen, militancy: Militancy.STATUSQUO }
  })
}
