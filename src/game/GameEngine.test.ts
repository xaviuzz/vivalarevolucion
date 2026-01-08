import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GameEngine } from './GameEngine'
import { SocialClass } from '../types/Citizen'

vi.mock('./population/citizenGenerator', () => ({
  generateCitizens: vi.fn(() => [
    { id: 1, socialClass: SocialClass.CLASE_MEDIA },
    { id: 2, socialClass: SocialClass.OBREROS },
    { id: 3, socialClass: SocialClass.ELITES }
  ])
}))

describe('GameEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createNew', () => {
    it('crea motor con ciudadanos generados y turno 1', () => {
      const engine = GameEngine.createNew()

      expect(engine.getCurrentTurn()).toBe(1)
      expect(engine.getCitizens()).toHaveLength(3)
      expect(engine.getCitizens()[0].id).toBe(1)
    })
  })

  describe('fromState', () => {
    it('crea motor desde estado proporcionado', () => {
      const state = {
        citizens: [
          { id: 10, socialClass: SocialClass.DESPOSEIDOS },
          { id: 20, socialClass: SocialClass.ELITES }
        ],
        currentTurn: 5
      }

      const engine = GameEngine.fromState(state)

      expect(engine.getCurrentTurn()).toBe(5)
      expect(engine.getCitizens()).toHaveLength(2)
      expect(engine.getCitizens()[0].id).toBe(10)
    })
  })

  describe('endTurn', () => {
    it('devuelve nueva instancia (inmutabilidad)', () => {
      const engine = GameEngine.createNew()
      const nextEngine = engine.endTurn()

      expect(nextEngine).not.toBe(engine)
      expect(nextEngine).toBeInstanceOf(GameEngine)
    })

    it('incrementa contador de turno', () => {
      const engine = GameEngine.createNew()
      const nextEngine = engine.endTurn()

      expect(nextEngine.getCurrentTurn()).toBe(2)
    })

    it('evoluciona ciudadanos', () => {
      const engine = GameEngine.createNew()
      const originalCitizens = engine.getCitizens()
      const nextEngine = engine.endTurn()
      const evolvedCitizens = nextEngine.getCitizens()

      expect(evolvedCitizens).not.toBe(originalCitizens)
      expect(evolvedCitizens).toHaveLength(originalCitizens.length)
    })

    it('preserva estado original del motor', () => {
      const engine = GameEngine.createNew()
      const originalTurn = engine.getCurrentTurn()
      const originalCitizens = engine.getCitizens()

      engine.endTurn()

      expect(engine.getCurrentTurn()).toBe(originalTurn)
      expect(engine.getCitizens()).toEqual(originalCitizens)
    })

    it('puede avanzar múltiples turnos', () => {
      let engine = GameEngine.createNew()

      engine = engine.endTurn()
      engine = engine.endTurn()
      engine = engine.endTurn()

      expect(engine.getCurrentTurn()).toBe(4)
    })
  })

  describe('getCitizenCount', () => {
    it('devuelve número total de ciudadanos', () => {
      const engine = GameEngine.createNew()

      expect(engine.getCitizenCount()).toBe(3)
    })
  })

  describe('getClassDistribution', () => {
    it('devuelve conteo de ciudadanos por clase', () => {
      const engine = GameEngine.createNew()
      const distribution = engine.getClassDistribution()

      expect(distribution.get(SocialClass.CLASE_MEDIA)).toBe(1)
      expect(distribution.get(SocialClass.OBREROS)).toBe(1)
      expect(distribution.get(SocialClass.ELITES)).toBe(1)
      expect(distribution.get(SocialClass.DESPOSEIDOS)).toBe(0)
    })

    it('incluye todas las clases sociales en el mapa', () => {
      const engine = GameEngine.createNew()
      const distribution = engine.getClassDistribution()

      expect(distribution.has(SocialClass.ELITES)).toBe(true)
      expect(distribution.has(SocialClass.CLASE_MEDIA)).toBe(true)
      expect(distribution.has(SocialClass.OBREROS)).toBe(true)
      expect(distribution.has(SocialClass.DESPOSEIDOS)).toBe(true)
    })
  })

  describe('inmutabilidad', () => {
    it('getState devuelve copia del estado', () => {
      const engine = GameEngine.createNew()
      const state1 = engine.getState()
      const state2 = engine.getState()

      expect(state1).toEqual(state2)
      expect(state1).not.toBe(state2)
    })

    it('getCitizens devuelve copia del array', () => {
      const engine = GameEngine.createNew()
      const citizens1 = engine.getCitizens()
      const citizens2 = engine.getCitizens()

      expect(citizens1).toEqual(citizens2)
      expect(citizens1).not.toBe(citizens2)
    })

    it('modificar array retornado no afecta estado interno', () => {
      const engine = GameEngine.createNew()
      const citizens = engine.getCitizens()

      citizens.push({ id: 999, socialClass: SocialClass.ELITES })

      expect(engine.getCitizens()).toHaveLength(3)
    })
  })
})
