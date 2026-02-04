import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  generateNarrativeLog,
  getDominantSocialChange,
  getDominantMilitancyGrowth
} from './narrativeLog'
import { SocialClass } from '../types/Citizen'
import { Militancy } from '../types/Militancy'
import { createCitizen } from '../test/fixtures'

describe('getDominantSocialChange', () => {
  it('retorna null cuando no hay cambios', () => {
    const citizens = NarrativeLogSUT.createBySocialClass({
      [SocialClass.DESPOSEIDOS]: 10,
      [SocialClass.OBREROS]: 10,
      [SocialClass.CLASE_MEDIA]: 10,
      [SocialClass.ELITES]: 10
    })

    const result = getDominantSocialChange(citizens, citizens)

    expect(result).toBeNull()
  })

  it('detecta cuando CLASE_MEDIA crece más', () => {
    const before = NarrativeLogSUT.createBySocialClass({
      [SocialClass.DESPOSEIDOS]: 10,
      [SocialClass.OBREROS]: 20,
      [SocialClass.CLASE_MEDIA]: 10,
      [SocialClass.ELITES]: 10
    })
    const after = NarrativeLogSUT.createBySocialClass({
      [SocialClass.DESPOSEIDOS]: 10,
      [SocialClass.OBREROS]: 15,
      [SocialClass.CLASE_MEDIA]: 15,
      [SocialClass.ELITES]: 10
    })

    const result = getDominantSocialChange(before, after)

    expect(result).toEqual({
      socialClass: SocialClass.CLASE_MEDIA,
      diff: 5
    })
  })

  it('detecta cuando DESPOSEIDOS crece más', () => {
    const before = NarrativeLogSUT.createBySocialClass({
      [SocialClass.DESPOSEIDOS]: 10,
      [SocialClass.OBREROS]: 20,
      [SocialClass.CLASE_MEDIA]: 10,
      [SocialClass.ELITES]: 10
    })
    const after = NarrativeLogSUT.createBySocialClass({
      [SocialClass.DESPOSEIDOS]: 18,
      [SocialClass.OBREROS]: 15,
      [SocialClass.CLASE_MEDIA]: 10,
      [SocialClass.ELITES]: 7
    })

    const result = getDominantSocialChange(before, after)

    expect(result).toEqual({
      socialClass: SocialClass.DESPOSEIDOS,
      diff: 8
    })
  })

  it('prefiere crecimiento sobre encogimiento de igual magnitud', () => {
    const before = NarrativeLogSUT.createBySocialClass({
      [SocialClass.DESPOSEIDOS]: 10,
      [SocialClass.OBREROS]: 20,
      [SocialClass.CLASE_MEDIA]: 10,
      [SocialClass.ELITES]: 10
    })
    const after = NarrativeLogSUT.createBySocialClass({
      [SocialClass.DESPOSEIDOS]: 10,
      [SocialClass.OBREROS]: 15,
      [SocialClass.CLASE_MEDIA]: 15,
      [SocialClass.ELITES]: 10
    })
    // OBREROS -5, CLASE_MEDIA +5 → ambos tienen |diff| = 5
    // Pero CLASE_MEDIA crece, OBREROS encoge
    // Debe preferir CLASE_MEDIA (crecimiento)

    const result = getDominantSocialChange(before, after)

    expect(result?.socialClass).toBe(SocialClass.CLASE_MEDIA)
    expect(result?.diff).toBe(5)
  })

  it('cuando encogimiento domina, retorna la clase que más se reduce', () => {
    const before = NarrativeLogSUT.createBySocialClass({
      [SocialClass.DESPOSEIDOS]: 10,
      [SocialClass.OBREROS]: 20,
      [SocialClass.CLASE_MEDIA]: 20,
      [SocialClass.ELITES]: 10
    })
    const after = NarrativeLogSUT.createBySocialClass({
      [SocialClass.DESPOSEIDOS]: 12,
      [SocialClass.OBREROS]: 25,
      [SocialClass.CLASE_MEDIA]: 10,
      [SocialClass.ELITES]: 13
    })
    // CLASE_MEDIA -10, DESPOSEIDOS +2, OBREROS +5, ELITES +3
    // El mayor cambio absoluto es CLASE_MEDIA -10 (mayor que DESPOSEIDOS +2)
    // Aunque hay crecimiento en otros, el encogimiento domina

    const result = getDominantSocialChange(before, after)

    expect(result?.socialClass).toBe(SocialClass.CLASE_MEDIA)
    expect(result?.diff).toBe(-10)
  })

  it('detecta cuando ELITES crece', () => {
    const before = NarrativeLogSUT.createBySocialClass({
      [SocialClass.DESPOSEIDOS]: 10,
      [SocialClass.OBREROS]: 20,
      [SocialClass.CLASE_MEDIA]: 20,
      [SocialClass.ELITES]: 10
    })
    const after = NarrativeLogSUT.createBySocialClass({
      [SocialClass.DESPOSEIDOS]: 8,
      [SocialClass.OBREROS]: 18,
      [SocialClass.CLASE_MEDIA]: 18,
      [SocialClass.ELITES]: 16
    })

    const result = getDominantSocialChange(before, after)

    expect(result?.socialClass).toBe(SocialClass.ELITES)
    expect(result?.diff).toBe(6)
  })

  it('detecta cuando OBREROS crece', () => {
    const before = NarrativeLogSUT.createBySocialClass({
      [SocialClass.DESPOSEIDOS]: 10,
      [SocialClass.OBREROS]: 10,
      [SocialClass.CLASE_MEDIA]: 10,
      [SocialClass.ELITES]: 10
    })
    const after = NarrativeLogSUT.createBySocialClass({
      [SocialClass.DESPOSEIDOS]: 5,
      [SocialClass.OBREROS]: 25,
      [SocialClass.CLASE_MEDIA]: 10,
      [SocialClass.ELITES]: 10
    })

    const result = getDominantSocialChange(before, after)

    expect(result?.socialClass).toBe(SocialClass.OBREROS)
    expect(result?.diff).toBe(15)
  })

  it('en empate de crecimiento, usa prioridad (DESPOSEIDOS > OBREROS > CLASE_MEDIA > ELITES)', () => {
    const before = NarrativeLogSUT.createBySocialClass({
      [SocialClass.DESPOSEIDOS]: 10,
      [SocialClass.OBREROS]: 10,
      [SocialClass.CLASE_MEDIA]: 10,
      [SocialClass.ELITES]: 10
    })
    const after = NarrativeLogSUT.createBySocialClass({
      [SocialClass.DESPOSEIDOS]: 15,
      [SocialClass.OBREROS]: 15,
      [SocialClass.CLASE_MEDIA]: 10,
      [SocialClass.ELITES]: 10
    })
    // DESPOSEIDOS +5, OBREROS +5 → empate
    // DESPOSEIDOS tiene prioridad

    const result = getDominantSocialChange(before, after)

    expect(result?.socialClass).toBe(SocialClass.DESPOSEIDOS)
  })
})

describe('getDominantMilitancyGrowth', () => {
  it('retorna null cuando no hay cambios en militancia', () => {
    const citizens = NarrativeLogSUT.createByMilitancy({
      [Militancy.FASCISMO]: 5,
      [Militancy.STATUSQUO]: 35,
      [Militancy.ANARQUISMO]: 10
    })

    const result = getDominantMilitancyGrowth(citizens, citizens)

    expect(result).toBeNull()
  })

  it('detecta cuando ANARQUISMO crece', () => {
    const before = NarrativeLogSUT.createByMilitancy({
      [Militancy.FASCISMO]: 5,
      [Militancy.STATUSQUO]: 40,
      [Militancy.ANARQUISMO]: 5
    })
    const after = NarrativeLogSUT.createByMilitancy({
      [Militancy.FASCISMO]: 5,
      [Militancy.STATUSQUO]: 35,
      [Militancy.ANARQUISMO]: 10
    })

    const result = getDominantMilitancyGrowth(before, after)

    expect(result).toBe(Militancy.ANARQUISMO)
  })

  it('detecta cuando FASCISMO crece', () => {
    const before = NarrativeLogSUT.createByMilitancy({
      [Militancy.FASCISMO]: 5,
      [Militancy.STATUSQUO]: 40,
      [Militancy.ANARQUISMO]: 5
    })
    const after = NarrativeLogSUT.createByMilitancy({
      [Militancy.FASCISMO]: 15,
      [Militancy.STATUSQUO]: 30,
      [Militancy.ANARQUISMO]: 5
    })

    const result = getDominantMilitancyGrowth(before, after)

    expect(result).toBe(Militancy.FASCISMO)
  })

  it('ignora cambios en STATUSQUO', () => {
    const before = NarrativeLogSUT.createByMilitancy({
      [Militancy.FASCISMO]: 5,
      [Militancy.STATUSQUO]: 40,
      [Militancy.ANARQUISMO]: 5
    })
    const after = NarrativeLogSUT.createByMilitancy({
      [Militancy.FASCISMO]: 5,
      [Militancy.STATUSQUO]: 50,
      [Militancy.ANARQUISMO]: 5
    })
    // Solo STATUSQUO cambió → no hay narrativa

    const result = getDominantMilitancyGrowth(before, after)

    expect(result).toBeNull()
  })

  it('cuando ambas crecen, retorna la que crece más', () => {
    const before = NarrativeLogSUT.createByMilitancy({
      [Militancy.FASCISMO]: 5,
      [Militancy.STATUSQUO]: 40,
      [Militancy.ANARQUISMO]: 5
    })
    const after = NarrativeLogSUT.createByMilitancy({
      [Militancy.FASCISMO]: 8,
      [Militancy.STATUSQUO]: 30,
      [Militancy.ANARQUISMO]: 12
    })
    // FASCISMO +3, ANARQUISMO +7 → ANARQUISMO

    const result = getDominantMilitancyGrowth(before, after)

    expect(result).toBe(Militancy.ANARQUISMO)
  })

  it('retorna null si STATUSQUO es el único que crece', () => {
    const before = NarrativeLogSUT.createByMilitancy({
      [Militancy.FASCISMO]: 5,
      [Militancy.STATUSQUO]: 30,
      [Militancy.ANARQUISMO]: 15
    })
    const after = NarrativeLogSUT.createByMilitancy({
      [Militancy.FASCISMO]: 5,
      [Militancy.STATUSQUO]: 35,
      [Militancy.ANARQUISMO]: 15
    })

    const result = getDominantMilitancyGrowth(before, after)

    expect(result).toBeNull()
  })
})

describe('generateNarrativeLog', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('retorna frase social cuando solo cambia clase social', () => {
    const before = NarrativeLogSUT.createBySocialClass({
      [SocialClass.DESPOSEIDOS]: 10,
      [SocialClass.OBREROS]: 20,
      [SocialClass.CLASE_MEDIA]: 10,
      [SocialClass.ELITES]: 10
    })
    const after = NarrativeLogSUT.createBySocialClass({
      [SocialClass.DESPOSEIDOS]: 10,
      [SocialClass.OBREROS]: 15,
      [SocialClass.CLASE_MEDIA]: 15,
      [SocialClass.ELITES]: 10
    })

    const result = generateNarrativeLog(before, after)

    expect(result).toBe('El barrio se gentrifica')
  })

  it('retorna frase de militancia cuando solo cambia militancia', () => {
    const before = NarrativeLogSUT.createBySocialAndMilitancy(
      {
        [SocialClass.DESPOSEIDOS]: 10,
        [SocialClass.OBREROS]: 10,
        [SocialClass.CLASE_MEDIA]: 10,
        [SocialClass.ELITES]: 10
      },
      {
        [Militancy.FASCISMO]: 5,
        [Militancy.STATUSQUO]: 35,
        [Militancy.ANARQUISMO]: 5
      }
    )
    const after = NarrativeLogSUT.createBySocialAndMilitancy(
      {
        [SocialClass.DESPOSEIDOS]: 10,
        [SocialClass.OBREROS]: 10,
        [SocialClass.CLASE_MEDIA]: 10,
        [SocialClass.ELITES]: 10
      },
      {
        [Militancy.FASCISMO]: 5,
        [Militancy.STATUSQUO]: 30,
        [Militancy.ANARQUISMO]: 10
      }
    )

    const result = generateNarrativeLog(before, after)

    expect(result).toBe('Las voces del cambio se hacen más fuertes')
  })

  it('combina frases cuando cambian social y militancia', () => {
    const before = NarrativeLogSUT.createBySocialAndMilitancy(
      {
        [SocialClass.DESPOSEIDOS]: 10,
        [SocialClass.OBREROS]: 10,
        [SocialClass.CLASE_MEDIA]: 10,
        [SocialClass.ELITES]: 10
      },
      {
        [Militancy.FASCISMO]: 5,
        [Militancy.STATUSQUO]: 35,
        [Militancy.ANARQUISMO]: 5
      }
    )
    const after = NarrativeLogSUT.createBySocialAndMilitancy(
      {
        [SocialClass.DESPOSEIDOS]: 10,
        [SocialClass.OBREROS]: 5,
        [SocialClass.CLASE_MEDIA]: 15,
        [SocialClass.ELITES]: 10
      },
      {
        [Militancy.FASCISMO]: 5,
        [Militancy.STATUSQUO]: 30,
        [Militancy.ANARQUISMO]: 10
      }
    )
    // Social: CLASE_MEDIA +5
    // Militancia: ANARQUISMO +5

    const result = generateNarrativeLog(before, after)

    const expected = [
      'El barrio se gentrifica',
      'Las voces del cambio se hacen más fuertes'
    ].join('. ')

    expect(result).toBe(expected)
  })

  it('retorna frase sin cambios cuando nada cambia', () => {
    const citizens = NarrativeLogSUT.createBySocialClass({
      [SocialClass.DESPOSEIDOS]: 10,
      [SocialClass.OBREROS]: 10,
      [SocialClass.CLASE_MEDIA]: 10,
      [SocialClass.ELITES]: 10
    })

    const result = generateNarrativeLog(citizens, citizens)

    expect(result).toBe('La vida sigue su curso')
  })

  it('selecciona última frase cuando Math.random = 0.99', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)

    const citizens = NarrativeLogSUT.createBySocialClass({
      [SocialClass.DESPOSEIDOS]: 10,
      [SocialClass.OBREROS]: 10,
      [SocialClass.CLASE_MEDIA]: 10,
      [SocialClass.ELITES]: 10
    })

    const result = generateNarrativeLog(citizens, citizens)

    expect(result).toBe('El barrio respira en calma')
  })

  it('selecciona frases diferentes según Math.random', () => {
    const before = NarrativeLogSUT.createBySocialClass({
      [SocialClass.DESPOSEIDOS]: 10,
      [SocialClass.OBREROS]: 20,
      [SocialClass.CLASE_MEDIA]: 10,
      [SocialClass.ELITES]: 10
    })
    const after = NarrativeLogSUT.createBySocialClass({
      [SocialClass.DESPOSEIDOS]: 10,
      [SocialClass.OBREROS]: 15,
      [SocialClass.CLASE_MEDIA]: 15,
      [SocialClass.ELITES]: 10
    })

    // Primer random = 0
    const result1 = generateNarrativeLog(before, after)
    // Primer random = 0.5 (índice 2 de 5 frases)
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const result2 = generateNarrativeLog(before, after)

    expect(result1).not.toBe(result2)
    expect(result1).toBe('El barrio se gentrifica')
    expect(result2).toBe('Un aire de modernidad invade las calles')
  })
})

class NarrativeLogSUT {
  static createBySocialClass(
    counts: Record<SocialClass, number>
  ): import('../types/Citizen').Citizen[] {
    const citizens: import('../types/Citizen').Citizen[] = []
    let id = 0

    for (const sc of Object.values(SocialClass)) {
      const count = counts[sc] ?? 0
      for (let i = 0; i < count; i++) {
        citizens.push(createCitizen(id++, sc))
      }
    }

    return citizens
  }

  static createByMilitancy(
    counts: Record<Militancy, number>
  ): import('../types/Citizen').Citizen[] {
    const citizens: import('../types/Citizen').Citizen[] = []
    let id = 0

    for (const m of Object.values(Militancy)) {
      const count = counts[m] ?? 0
      for (let i = 0; i < count; i++) {
        citizens.push(createCitizen(id++, SocialClass.OBREROS, m))
      }
    }

    return citizens
  }

  static createBySocialAndMilitancy(
    socialCounts: Record<SocialClass, number>,
    militancyCounts: Record<Militancy, number>
  ): import('../types/Citizen').Citizen[] {
    // Create arrays of each type
    const socialClasses: SocialClass[] = []
    const militancies: Militancy[] = []

    for (const sc of Object.values(SocialClass)) {
      const count = socialCounts[sc] ?? 0
      for (let i = 0; i < count; i++) {
        socialClasses.push(sc)
      }
    }

    for (const m of Object.values(Militancy)) {
      const count = militancyCounts[m] ?? 0
      for (let i = 0; i < count; i++) {
        militancies.push(m)
      }
    }

    // Zip them together
    const citizens: import('../types/Citizen').Citizen[] = []
    for (let i = 0; i < socialClasses.length; i++) {
      citizens.push(
        createCitizen(i, socialClasses[i], militancies[i] ?? Militancy.STATUSQUO)
      )
    }

    return citizens
  }
}
