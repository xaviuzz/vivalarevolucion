import { Citizen, SocialClass, SOCIAL_CLASSES } from '../models/Citizen'

/**
 * Returns a random social class with equal 25% probability for each
 */
function getRandomSocialClass(): SocialClass {
  const randomIndex = Math.floor(Math.random() * SOCIAL_CLASSES.length)
  return SOCIAL_CLASSES[randomIndex]
}

/**
 * Generates a random number of citizens (100-500) with random social class distribution
 * Each citizen has 25% probability of being in any social class
 */
export function generateCitizens(): Citizen[] {
  // Random population size between 100-500
  const populationSize = Math.floor(Math.random() * 401) + 100

  // Generate each citizen with random class
  const citizens: Citizen[] = []
  for (let i = 0; i < populationSize; i++) {
    citizens.push({
      id: i,
      socialClass: getRandomSocialClass()
    })
  }

  return citizens
}
