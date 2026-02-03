import { describe, it, expect } from 'vitest'
import { ATENEO_ACTION } from './action'
import { SocialClass, SOCIAL_CLASSES, Citizen } from '../../../types/Citizen'
import { Militancy } from '../../../types/Militancy'
import { MilitancyModifierTable } from '../../../types/Action'

describe('ATENEO_ACTION', () => {
  describe('estructura de la accion', () => {
    it('tiene id correcto', () => {
      expect(AtenenoSUT.getId()).toBe('ateneo')
    })

    it('tiene nombre en espanol', () => {
      expect(AtenenoSUT.getName()).toBe('Ateneo')
    })

    it('tiene descripcion que menciona anarquismo', () => {
      expect(AtenenoSUT.getDescription()).toContain('anarquista')
    })

    it('tiene modificadores de militancia definidos', () => {
      expect(AtenenoSUT.hasMilitancyModifiers()).toBe(true)
    })

    it('no tiene modificadores de clase social', () => {
      expect(AtenenoSUT.hasSocialClassModifiers()).toBe(false)
    })
  })

  describe('efecto concentrado solo en OBREROS', () => {
    it('no tiene efecto en DESPOSEIDOS', () => {
      expect(AtenenoSUT.getAnarchismModifier(SocialClass.DESPOSEIDOS)).toBe(0)
    })

    it('tiene efecto en OBREROS', () => {
      expect(AtenenoSUT.getAnarchismModifier(SocialClass.OBREROS)).toBeGreaterThan(0)
    })

    it('no tiene efecto en CLASE_MEDIA', () => {
      expect(AtenenoSUT.getAnarchismModifier(SocialClass.CLASE_MEDIA)).toBe(0)
    })

    it('no tiene efecto en ELITES', () => {
      expect(AtenenoSUT.getAnarchismModifier(SocialClass.ELITES)).toBe(0)
    })
  })

  describe('valores de modificadores base', () => {
    it('aumenta probabilidad de ANARQUISMO solo en OBREROS', () => {
      expect(AtenenoSUT.getAnarchismModifier(SocialClass.OBREROS)).toBeGreaterThan(0)
      expect(AtenenoSUT.getAnarchismModifier(SocialClass.DESPOSEIDOS)).toBe(0)
      expect(AtenenoSUT.getAnarchismModifier(SocialClass.CLASE_MEDIA)).toBe(0)
      expect(AtenenoSUT.getAnarchismModifier(SocialClass.ELITES)).toBe(0)
    })

    it('reduce probabilidad de STATUSQUO solo en OBREROS', () => {
      expect(AtenenoSUT.getStatusquoModifier(SocialClass.OBREROS)).toBeLessThan(0)
      expect(AtenenoSUT.getStatusquoModifier(SocialClass.DESPOSEIDOS)).toBe(0)
      expect(AtenenoSUT.getStatusquoModifier(SocialClass.CLASE_MEDIA)).toBe(0)
      expect(AtenenoSUT.getStatusquoModifier(SocialClass.ELITES)).toBe(0)
    })

    it('no afecta probabilidad de FASCISMO', () => {
      for (const socialClass of SOCIAL_CLASSES) {
        expect(AtenenoSUT.getFascismoModifier(socialClass)).toBe(0)
      }
    })

    it('modificadores suman cero para cada clase (balance)', () => {
      for (const socialClass of SOCIAL_CLASSES) {
        const sum = AtenenoSUT.sumModifiersForClass(socialClass)
        expect(sum).toBeCloseTo(0, 10)
      }
    })
  })

  describe('impacto exclusivo en OBREROS', () => {
    it('OBREROS son los unicos afectados por el aumento de anarquismo', () => {
      const obreros = AtenenoSUT.getAnarchismModifier(SocialClass.OBREROS)
      const otrasClases = [
        AtenenoSUT.getAnarchismModifier(SocialClass.DESPOSEIDOS),
        AtenenoSUT.getAnarchismModifier(SocialClass.CLASE_MEDIA),
        AtenenoSUT.getAnarchismModifier(SocialClass.ELITES)
      ]

      expect(obreros).toBeGreaterThan(0)
      expect(otrasClases.every(m => m === 0)).toBe(true)
    })
  })
})

class AtenenoSUT {
  private static readonly ALL_ANARCHIST_CITIZENS: Citizen[] = [
    { id: 1, socialClass: SocialClass.OBREROS, militancy: Militancy.ANARQUISMO }
  ]

  static getId(): string {
    return ATENEO_ACTION.id
  }

  static getName(): string {
    return ATENEO_ACTION.name
  }

  static getDescription(): string {
    return ATENEO_ACTION.description
  }

  static hasMilitancyModifiers(): boolean {
    return ATENEO_ACTION.calculateMilitancyModifiers !== undefined
  }

  static hasSocialClassModifiers(): boolean {
    return ATENEO_ACTION.modifiers !== undefined
  }

  static getAnarchismModifier(socialClass: SocialClass): number {
    return this.getModifiers()[socialClass][Militancy.ANARQUISMO]
  }

  static getStatusquoModifier(socialClass: SocialClass): number {
    return this.getModifiers()[socialClass][Militancy.STATUSQUO]
  }

  static getFascismoModifier(socialClass: SocialClass): number {
    return this.getModifiers()[socialClass][Militancy.FASCISMO]
  }

  static sumModifiersForClass(socialClass: SocialClass): number {
    const modifiers = this.getModifiers()[socialClass]
    return modifiers[Militancy.FASCISMO] + modifiers[Militancy.STATUSQUO] + modifiers[Militancy.ANARQUISMO]
  }

  private static getModifiers(): MilitancyModifierTable {
    return ATENEO_ACTION.calculateMilitancyModifiers!(this.ALL_ANARCHIST_CITIZENS)
  }
}
