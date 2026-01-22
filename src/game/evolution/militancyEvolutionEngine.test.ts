import { describe, it, expect, vi, afterEach } from 'vitest'
import { evolveCitizenMilitancy, evolveCitizensMilitancy } from './militancyEvolutionEngine'
import { Citizen, SocialClass } from '../../types/Citizen'
import { Militancy } from '../../types/Militancy'
import { MilitancyTransitionTable, MILITANCY_TRANSITION_PROBABILITIES } from '../config/militancyProbabilities'
import { createCitizen } from '../../test/fixtures'

describe('evolveCitizenMilitancy', () => {
  it('preserva el ID del ciudadano durante la evolucion', () => {
    const citizen = createCitizen(42, SocialClass.OBREROS, Militancy.STATUSQUO)

    const evolved = EvolveMilitancySUT.evolveWithCustomProbabilities(citizen)

    expect(EvolveMilitancySUT.getId(evolved)).toBe(42)
  })

  it('preserva la clase social del ciudadano', () => {
    const citizen = createCitizen(1, SocialClass.ELITES, Militancy.STATUSQUO)

    const evolved = EvolveMilitancySUT.evolveWithCustomProbabilities(citizen)

    expect(EvolveMilitancySUT.getSocialClass(evolved)).toBe(SocialClass.ELITES)
  })

  it('puede cambiar la militancia con probabilidades custom', () => {
    EvolveMilitancySUT.mockRandom(0.99)

    const citizen = createCitizen(1, SocialClass.OBREROS, Militancy.STATUSQUO)
    const evolved = EvolveMilitancySUT.evolveWithCustomProbabilities(citizen)

    expect(EvolveMilitancySUT.getMilitancy(evolved)).toBe(Militancy.ANARQUISMO)

    EvolveMilitancySUT.restoreMocks()
  })

  it('mantiene militancia con probabilidades base (matriz identidad)', () => {
    const citizen = createCitizen(1, SocialClass.OBREROS, Militancy.STATUSQUO)

    const evolved = EvolveMilitancySUT.evolveWithBaseProbabilities(citizen)

    expect(EvolveMilitancySUT.getMilitancy(evolved)).toBe(Militancy.STATUSQUO)
  })

  describe('seleccion por probabilidad acumulada con probabilidades custom', () => {
    afterEach(() => {
      EvolveMilitancySUT.restoreMocks()
    })

    it('STATUSQUO: random=0.005 selecciona FASCISMO (1ra opcion)', () => {
      EvolveMilitancySUT.mockRandom(0.005)

      const citizen = createCitizen(1, SocialClass.OBREROS, Militancy.STATUSQUO)
      const evolved = EvolveMilitancySUT.evolveWithCustomProbabilities(citizen)

      expect(EvolveMilitancySUT.getMilitancy(evolved)).toBe(Militancy.FASCISMO)
    })

    it('STATUSQUO: random=0.5 selecciona STATUSQUO (2da opcion)', () => {
      EvolveMilitancySUT.mockRandom(0.5)

      const citizen = createCitizen(1, SocialClass.OBREROS, Militancy.STATUSQUO)
      const evolved = EvolveMilitancySUT.evolveWithCustomProbabilities(citizen)

      expect(EvolveMilitancySUT.getMilitancy(evolved)).toBe(Militancy.STATUSQUO)
    })

    it('STATUSQUO: random=0.995 selecciona ANARQUISMO (3ra opcion)', () => {
      EvolveMilitancySUT.mockRandom(0.995)

      const citizen = createCitizen(1, SocialClass.OBREROS, Militancy.STATUSQUO)
      const evolved = EvolveMilitancySUT.evolveWithCustomProbabilities(citizen)

      expect(EvolveMilitancySUT.getMilitancy(evolved)).toBe(Militancy.ANARQUISMO)
    })
  })

  describe('tests estadisticos con probabilidades custom', () => {
    it('STATUSQUO permanece como STATUSQUO ~98% del tiempo', () => {
      const ITERATIONS = 10000

      const actualRate = EvolveMilitancySUT.calculateTransitionRate(
        Militancy.STATUSQUO,
        Militancy.STATUSQUO,
        ITERATIONS
      )

      expect(actualRate).toBeCloseTo(0.98, 1)
    })

    it('STATUSQUO transiciona a ANARQUISMO ~1% del tiempo', () => {
      const ITERATIONS = 10000

      const actualRate = EvolveMilitancySUT.calculateTransitionRate(
        Militancy.STATUSQUO,
        Militancy.ANARQUISMO,
        ITERATIONS
      )

      expect(actualRate).toBeCloseTo(0.01, 1)
    })
  })

  describe('probabilidades base (matriz identidad)', () => {
    it('sin acciones, STATUSQUO siempre permanece STATUSQUO', () => {
      const ITERATIONS = 100

      const allRemain = EvolveMilitancySUT.allRemainSame(Militancy.STATUSQUO, ITERATIONS)

      expect(allRemain).toBe(true)
    })

    it('sin acciones, FASCISMO siempre permanece FASCISMO', () => {
      const ITERATIONS = 100

      const allRemain = EvolveMilitancySUT.allRemainSame(Militancy.FASCISMO, ITERATIONS)

      expect(allRemain).toBe(true)
    })

    it('sin acciones, ANARQUISMO siempre permanece ANARQUISMO', () => {
      const ITERATIONS = 100

      const allRemain = EvolveMilitancySUT.allRemainSame(Militancy.ANARQUISMO, ITERATIONS)

      expect(allRemain).toBe(true)
    })
  })
})

describe('evolveCitizensMilitancy', () => {
  it('evoluciona la militancia de todos los ciudadanos', () => {
    const citizens = EvolveMilitanciesSUT.createCitizens([
      { id: 1, militancy: Militancy.STATUSQUO },
      { id: 2, militancy: Militancy.FASCISMO },
      { id: 3, militancy: Militancy.ANARQUISMO }
    ])

    const evolved = EvolveMilitanciesSUT.evolve(citizens)

    expect(EvolveMilitanciesSUT.getLength(evolved)).toBe(3)
    expect(EvolveMilitanciesSUT.getIds(evolved)).toEqual([1, 2, 3])
  })

  it('devuelve un nuevo array (inmutabilidad)', () => {
    const citizens = EvolveMilitanciesSUT.createCitizens([
      { id: 1, militancy: Militancy.STATUSQUO }
    ])

    const evolved = EvolveMilitanciesSUT.evolve(citizens)

    expect(evolved).not.toBe(citizens)
  })

  it('preserva las clases sociales de todos los ciudadanos', () => {
    const citizens = [
      createCitizen(1, SocialClass.ELITES, Militancy.STATUSQUO),
      createCitizen(2, SocialClass.OBREROS, Militancy.FASCISMO),
      createCitizen(3, SocialClass.DESPOSEIDOS, Militancy.ANARQUISMO)
    ]

    const evolved = EvolveMilitanciesSUT.evolve(citizens)

    expect(evolved[0].socialClass).toBe(SocialClass.ELITES)
    expect(evolved[1].socialClass).toBe(SocialClass.OBREROS)
    expect(evolved[2].socialClass).toBe(SocialClass.DESPOSEIDOS)
  })

  it('con probabilidades base, todas las militancias permanecen igual', () => {
    const citizens = [
      createCitizen(1, SocialClass.OBREROS, Militancy.STATUSQUO),
      createCitizen(2, SocialClass.OBREROS, Militancy.FASCISMO),
      createCitizen(3, SocialClass.OBREROS, Militancy.ANARQUISMO)
    ]

    const evolved = EvolveMilitanciesSUT.evolve(citizens)

    expect(evolved[0].militancy).toBe(Militancy.STATUSQUO)
    expect(evolved[1].militancy).toBe(Militancy.FASCISMO)
    expect(evolved[2].militancy).toBe(Militancy.ANARQUISMO)
  })
})

class EvolveMilitancySUT {
  static mockRandom(value: number): void {
    vi.spyOn(Math, 'random').mockReturnValue(value)
  }

  static restoreMocks(): void {
    vi.restoreAllMocks()
  }

  static evolveWithCustomProbabilities(citizen: Citizen): Citizen {
    return evolveCitizenMilitancy(citizen, EvolveMilitancySUT.getCustomProbabilities())
  }

  static evolveWithBaseProbabilities(citizen: Citizen): Citizen {
    return evolveCitizenMilitancy(citizen, MILITANCY_TRANSITION_PROBABILITIES)
  }

  static getCustomProbabilities(): Record<Militancy, MilitancyTransitionTable> {
    return {
      [Militancy.FASCISMO]: {
        [Militancy.FASCISMO]: 0.98,
        [Militancy.STATUSQUO]: 0.02,
        [Militancy.ANARQUISMO]: 0
      },
      [Militancy.STATUSQUO]: {
        [Militancy.FASCISMO]: 0.01,
        [Militancy.STATUSQUO]: 0.98,
        [Militancy.ANARQUISMO]: 0.01
      },
      [Militancy.ANARQUISMO]: {
        [Militancy.FASCISMO]: 0,
        [Militancy.STATUSQUO]: 0.02,
        [Militancy.ANARQUISMO]: 0.98
      }
    }
  }

  static getId(citizen: Citizen): number {
    return citizen.id
  }

  static getSocialClass(citizen: Citizen): SocialClass {
    return citizen.socialClass
  }

  static getMilitancy(citizen: Citizen): Militancy {
    return citizen.militancy
  }

  static calculateTransitionRate(
    fromMilitancy: Militancy,
    toMilitancy: Militancy,
    iterations: number
  ): number {
    let transitions = 0
    for (let i = 0; i < iterations; i++) {
      const citizen = createCitizen(i, SocialClass.OBREROS, fromMilitancy)
      const evolved = evolveCitizenMilitancy(citizen, EvolveMilitancySUT.getCustomProbabilities())
      if (evolved.militancy === toMilitancy) {
        transitions++
      }
    }
    return transitions / iterations
  }

  static allRemainSame(militancy: Militancy, iterations: number): boolean {
    for (let i = 0; i < iterations; i++) {
      const citizen = createCitizen(i, SocialClass.OBREROS, militancy)
      const evolved = evolveCitizenMilitancy(citizen, MILITANCY_TRANSITION_PROBABILITIES)
      if (evolved.militancy !== militancy) {
        return false
      }
    }
    return true
  }
}

class EvolveMilitanciesSUT {
  static createCitizens(specs: Array<{ id: number; militancy: Militancy }>): Citizen[] {
    return specs.map(spec => createCitizen(spec.id, SocialClass.OBREROS, spec.militancy))
  }

  static evolve(citizens: Citizen[]): Citizen[] {
    return evolveCitizensMilitancy(citizens)
  }

  static getLength(citizens: Citizen[]): number {
    return citizens.length
  }

  static getIds(citizens: Citizen[]): number[] {
    return citizens.map(c => c.id)
  }
}
