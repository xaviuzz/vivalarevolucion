import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { evolveCitizen, evolveCitizens } from './evolutionEngine'
import { Citizen, SocialClass } from '../../types/Citizen'

describe('evolveCitizen', () => {
  it('preserva el ID del ciudadano durante la evoluci\u00f3n', () => {
    const citizen = createCitizen(42, SocialClass.CLASE_MEDIA)

    const evolved = EvolveCitizenSUT.evolve(citizen)

    expect(EvolveCitizenSUT.getId(evolved)).toBe(42)
  })

  it('puede cambiar la clase social del ciudadano', () => {
    EvolveCitizenSUT.mockRandom(0.005)

    const citizen = createCitizen(1, SocialClass.CLASE_MEDIA)
    const evolved = EvolveCitizenSUT.evolve(citizen)

    expect(EvolveCitizenSUT.getSocialClass(evolved)).toBe(SocialClass.ELITES)

    EvolveCitizenSUT.restoreMocks()
  })

  it('puede mantener la clase social del ciudadano', () => {
    EvolveCitizenSUT.mockRandom(0.5)

    const citizen = createCitizen(1, SocialClass.CLASE_MEDIA)
    const evolved = EvolveCitizenSUT.evolve(citizen)

    expect(EvolveCitizenSUT.getSocialClass(evolved)).toBe(SocialClass.CLASE_MEDIA)

    EvolveCitizenSUT.restoreMocks()
  })

  describe('selecci\u00f3n por probabilidad acumulada', () => {
    beforeEach(() => {
      EvolveCitizenSUT.mockRandom(0)
    })

    afterEach(() => {
      EvolveCitizenSUT.restoreMocks()
    })

    it('CLASE_MEDIA: random=0.005 selecciona ELITES (1ra opci\u00f3n)', () => {
      vi.mocked(Math.random).mockReturnValue(0.005)

      const citizen = createCitizen(1, SocialClass.CLASE_MEDIA)
      const evolved = EvolveCitizenSUT.evolve(citizen)

      expect(EvolveCitizenSUT.getSocialClass(evolved)).toBe(SocialClass.ELITES)
    })

    it('CLASE_MEDIA: random=0.02 selecciona CLASE_MEDIA (2da opci\u00f3n)', () => {
      vi.mocked(Math.random).mockReturnValue(0.02)

      const citizen = createCitizen(1, SocialClass.CLASE_MEDIA)
      const evolved = EvolveCitizenSUT.evolve(citizen)

      expect(EvolveCitizenSUT.getSocialClass(evolved)).toBe(SocialClass.CLASE_MEDIA)
    })

    it('CLASE_MEDIA: random=0.70 selecciona OBREROS (3ra opci\u00f3n)', () => {
      vi.mocked(Math.random).mockReturnValue(0.70)

      const citizen = createCitizen(1, SocialClass.CLASE_MEDIA)
      const evolved = EvolveCitizenSUT.evolve(citizen)

      expect(EvolveCitizenSUT.getSocialClass(evolved)).toBe(SocialClass.OBREROS)
    })

    it('CLASE_MEDIA: random=0.99 selecciona DESPOSEIDOS (4ta opci\u00f3n)', () => {
      vi.mocked(Math.random).mockReturnValue(0.99)

      const citizen = createCitizen(1, SocialClass.CLASE_MEDIA)
      const evolved = EvolveCitizenSUT.evolve(citizen)

      expect(EvolveCitizenSUT.getSocialClass(evolved)).toBe(SocialClass.DESPOSEIDOS)
    })
  })

  describe('tests estad\u00edsticos de probabilidades', () => {
    it('CLASE_MEDIA evoluciona a OBREROS ~40% del tiempo', () => {
      const ITERATIONS = 10000

      const actualRate = EvolveCitizenSUT.calculateTransitionRate(
        SocialClass.CLASE_MEDIA,
        SocialClass.OBREROS,
        ITERATIONS
      )

      expect(actualRate).toBeCloseTo(0.40, 1)
    })

    it('OBREROS evoluciona a CLASE_MEDIA ~25% del tiempo', () => {
      const ITERATIONS = 10000

      const actualRate = EvolveCitizenSUT.calculateTransitionRate(
        SocialClass.OBREROS,
        SocialClass.CLASE_MEDIA,
        ITERATIONS
      )

      expect(actualRate).toBeCloseTo(0.25, 1)
    })

    it('ELITES nunca evoluciona a OBREROS', () => {
      const ITERATIONS = 1000

      const neverEvolves = EvolveCitizenSUT.neverEvolvesTo(
        SocialClass.ELITES,
        SocialClass.OBREROS,
        ITERATIONS
      )

      expect(neverEvolves).toBe(true)
    })
  })
})

describe('evolveCitizens', () => {
  it('evoluciona todos los ciudadanos del array', () => {
    const citizens = EvolveCitizensSUT.createCitizens([
      { id: 1, socialClass: SocialClass.CLASE_MEDIA },
      { id: 2, socialClass: SocialClass.OBREROS },
      { id: 3, socialClass: SocialClass.ELITES }
    ])

    const evolved = EvolveCitizensSUT.evolve(citizens)

    expect(EvolveCitizensSUT.getLength(evolved)).toBe(3)
    expect(EvolveCitizensSUT.getIds(evolved)).toEqual([1, 2, 3])
  })

  it('devuelve un nuevo array (inmutabilidad)', () => {
    const citizens = EvolveCitizensSUT.createCitizens([
      { id: 1, socialClass: SocialClass.CLASE_MEDIA }
    ])

    const evolved = EvolveCitizensSUT.evolve(citizens)

    expect(evolved).not.toBe(citizens)
  })

  it('mantiene la longitud del array de ciudadanos', () => {
    const citizens = EvolveCitizensSUT.createCitizens([
      { id: 1, socialClass: SocialClass.CLASE_MEDIA },
      { id: 2, socialClass: SocialClass.OBREROS },
      { id: 3, socialClass: SocialClass.ELITES },
      { id: 4, socialClass: SocialClass.DESPOSEIDOS }
    ])

    const evolved = EvolveCitizensSUT.evolve(citizens)

    expect(EvolveCitizensSUT.getLength(evolved)).toBe(EvolveCitizensSUT.getLength(citizens))
  })

  it('preserva todos los IDs de ciudadanos', () => {
    const citizens = EvolveCitizensSUT.createCitizens([
      { id: 10, socialClass: SocialClass.CLASE_MEDIA },
      { id: 20, socialClass: SocialClass.OBREROS },
      { id: 30, socialClass: SocialClass.ELITES }
    ])

    const evolved = EvolveCitizensSUT.evolve(citizens)

    expect(EvolveCitizensSUT.getIds(evolved)).toEqual([10, 20, 30])
  })

  it('puede cambiar la clase de algunos ciudadanos', () => {
    const citizens = EvolveCitizensSUT.createManyCitizens(100, SocialClass.CLASE_MEDIA)

    const evolved = EvolveCitizensSUT.evolve(citizens)

    expect(EvolveCitizensSUT.countClassChanges(SocialClass.CLASE_MEDIA, evolved)).toBeGreaterThan(0)
  })
})

function createCitizen(id: number, socialClass: SocialClass): Citizen {
  return { id, socialClass }
}

class EvolveCitizenSUT {
  static mockRandom(value: number): void {
    vi.spyOn(Math, 'random').mockReturnValue(value)
  }

  static restoreMocks(): void {
    vi.restoreAllMocks()
  }

  static evolve(citizen: Citizen): Citizen {
    return evolveCitizen(citizen)
  }

  static getId(citizen: Citizen): number {
    return citizen.id
  }

  static getSocialClass(citizen: Citizen): SocialClass {
    return citizen.socialClass
  }

  static calculateTransitionRate(
    fromClass: SocialClass,
    toClass: SocialClass,
    iterations: number
  ): number {
    let transitions = 0
    for (let i = 0; i < iterations; i++) {
      const citizen = createCitizen(i, fromClass)
      const evolved = evolveCitizen(citizen)
      if (evolved.socialClass === toClass) {
        transitions++
      }
    }
    return transitions / iterations
  }

  static neverEvolvesTo(fromClass: SocialClass, toClass: SocialClass, iterations: number): boolean {
    for (let i = 0; i < iterations; i++) {
      const citizen = createCitizen(i, fromClass)
      const evolved = evolveCitizen(citizen)
      if (evolved.socialClass === toClass) {
        return false
      }
    }
    return true
  }
}

class EvolveCitizensSUT {
  static createCitizens(specs: Array<{ id: number; socialClass: SocialClass }>): Citizen[] {
    return specs.map(spec => createCitizen(spec.id, spec.socialClass))
  }

  static createManyCitizens(count: number, socialClass: SocialClass): Citizen[] {
    return Array.from({ length: count }, (_, i) => createCitizen(i, socialClass))
  }

  static evolve(citizens: Citizen[]): Citizen[] {
    return evolveCitizens(citizens)
  }

  static getLength(citizens: Citizen[]): number {
    return citizens.length
  }

  static getIds(citizens: Citizen[]): number[] {
    return citizens.map(c => c.id)
  }

  static countClassChanges(originalClass: SocialClass, evolved: Citizen[]): number {
    return evolved.filter(c => c.socialClass !== originalClass).length
  }
}
