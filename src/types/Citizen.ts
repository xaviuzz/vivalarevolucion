/**
 * Social class categories for citizens
 */
export enum SocialClass {
  DESPOSEIDOS = 'DESPOSEIDOS',
  OBREROS = 'OBREROS',
  CLASE_MEDIA = 'CLASE_MEDIA',
  ELITES = 'ELITES'
}

/**
 * Represents an individual citizen in the barrio
 */
export interface Citizen {
  id: number
  socialClass: SocialClass
}

/**
 * Get all social class values as an array
 */
export const SOCIAL_CLASSES = [
  SocialClass.DESPOSEIDOS,
  SocialClass.OBREROS,
  SocialClass.CLASE_MEDIA,
  SocialClass.ELITES
] as const
