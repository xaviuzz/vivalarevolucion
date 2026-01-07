import { Citizen, SOCIAL_CLASSES } from '../../types/Citizen'

const MINIMUM_POPULATION = 100
const POPULATION_RANGE = 401
const NUMBER_OF_SOCIAL_CLASSES = 4

function generateRandomPopulationSize(): number {
  return Math.floor(Math.random() * POPULATION_RANGE) + MINIMUM_POPULATION
}

function generateRandomDistribution(): number[] {
  const cuts = [0, Math.random(), Math.random(), Math.random(), 1].sort((a, b) => a - b)
  const percentages = []
  for (let i = 0; i < NUMBER_OF_SOCIAL_CLASSES; i++) {
    percentages.push(cuts[i + 1] - cuts[i])
  }
  return percentages
}

function calculateClassCounts(distribution: number[], totalPopulation: number): number[] {
  const counts = distribution.map(percentage => Math.floor(percentage * totalPopulation))
  const remainder = totalPopulation - counts.reduce((sum, count) => sum + count, 0)

  for (let i = 0; i < remainder; i++) {
    counts[i]++
  }

  return counts
}

function createCitizensFromCounts(counts: number[]): Citizen[] {
  const citizens: Citizen[] = []
  let id = 0

  SOCIAL_CLASSES.forEach((socialClass, index) => {
    for (let i = 0; i < counts[index]; i++) {
      citizens.push({ id: id++, socialClass })
    }
  })

  return citizens
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function generateCitizens(): Citizen[] {
  const populationSize = generateRandomPopulationSize()
  const distribution = generateRandomDistribution()
  const counts = calculateClassCounts(distribution, populationSize)
  const citizens = createCitizensFromCounts(counts)

  return shuffleArray(citizens)
}
