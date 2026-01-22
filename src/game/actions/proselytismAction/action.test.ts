import { describe, it, expect } from 'vitest'
import { PROSELYTISM_ACTION } from './action'
import { SocialClass, SOCIAL_CLASSES, Citizen } from '../../../types/Citizen'
import { Militancy } from '../../../types/Militancy'
import { MilitancyModifierTable } from '../../../types/Action'

describe('PROSELYTISM_ACTION', () => {
  describe('estructura de la accion', () => {
    it('tiene id correcto', () => {
      expect(ProselytismSUT.getId()).toBe('proselytism')
    })

    it('tiene nombre en espanol', () => {
      expect(ProselytismSUT.getName()).toBe('Proselitismo')
    })

    it('tiene descripcion que menciona anarquismo', () => {
      expect(ProselytismSUT.getDescription()).toContain('anarquista')
    })

    it('tiene modificadores de militancia definidos', () => {
      expect(ProselytismSUT.hasMilitancyModifiers()).toBe(true)
    })

    it('no tiene modificadores de clase social', () => {
      expect(ProselytismSUT.hasSocialClassModifiers()).toBe(false)
    })
  })

  describe('modificadores para todas las clases sociales', () => {
    it('tiene modificadores para DESPOSEIDOS', () => {
      expect(ProselytismSUT.hasModifiersForClass(SocialClass.DESPOSEIDOS)).toBe(true)
    })

    it('tiene modificadores para OBREROS', () => {
      expect(ProselytismSUT.hasModifiersForClass(SocialClass.OBREROS)).toBe(true)
    })

    it('tiene modificadores para CLASE_MEDIA', () => {
      expect(ProselytismSUT.hasModifiersForClass(SocialClass.CLASE_MEDIA)).toBe(true)
    })

    it('tiene modificadores para ELITES', () => {
      expect(ProselytismSUT.hasModifiersForClass(SocialClass.ELITES)).toBe(true)
    })
  })

  describe('valores de modificadores base', () => {
    it('aumenta probabilidad de ANARQUISMO para todas las clases', () => {
      for (const socialClass of SOCIAL_CLASSES) {
        expect(ProselytismSUT.getAnarchismModifier(socialClass)).toBeGreaterThan(0)
      }
    })

    it('reduce probabilidad de STATUSQUO para todas las clases', () => {
      for (const socialClass of SOCIAL_CLASSES) {
        expect(ProselytismSUT.getStatusquoModifier(socialClass)).toBeLessThan(0)
      }
    })

    it('no afecta probabilidad de FASCISMO', () => {
      for (const socialClass of SOCIAL_CLASSES) {
        expect(ProselytismSUT.getFascismoModifier(socialClass)).toBe(0)
      }
    })

    it('modificadores suman cero para cada clase (balance)', () => {
      for (const socialClass of SOCIAL_CLASSES) {
        const sum = ProselytismSUT.sumModifiersForClass(socialClass)
        expect(sum).toBeCloseTo(0, 10)
      }
    })
  })

  describe('jerarquia de efectividad por clase', () => {
    it('DESPOSEIDOS tienen mayor modificador que OBREROS', () => {
      const desposeidos = ProselytismSUT.getAnarchismModifier(SocialClass.DESPOSEIDOS)
      const obreros = ProselytismSUT.getAnarchismModifier(SocialClass.OBREROS)

      expect(desposeidos).toBeGreaterThan(obreros)
    })

    it('OBREROS tienen mayor modificador que CLASE_MEDIA', () => {
      const obreros = ProselytismSUT.getAnarchismModifier(SocialClass.OBREROS)
      const claseMedia = ProselytismSUT.getAnarchismModifier(SocialClass.CLASE_MEDIA)

      expect(obreros).toBeGreaterThan(claseMedia)
    })

    it('CLASE_MEDIA tienen mayor modificador que ELITES', () => {
      const claseMedia = ProselytismSUT.getAnarchismModifier(SocialClass.CLASE_MEDIA)
      const elites = ProselytismSUT.getAnarchismModifier(SocialClass.ELITES)

      expect(claseMedia).toBeGreaterThan(elites)
    })
  })
})

class ProselytismSUT {
  private static readonly ALL_ANARCHIST_CITIZENS: Citizen[] = [
    { id: 1, socialClass: SocialClass.OBREROS, militancy: Militancy.ANARQUISMO }
  ]

  static getId(): string {
    return PROSELYTISM_ACTION.id
  }

  static getName(): string {
    return PROSELYTISM_ACTION.name
  }

  static getDescription(): string {
    return PROSELYTISM_ACTION.description
  }

  static hasMilitancyModifiers(): boolean {
    return PROSELYTISM_ACTION.calculateMilitancyModifiers !== undefined
  }

  static hasSocialClassModifiers(): boolean {
    return PROSELYTISM_ACTION.modifiers !== undefined
  }

  static hasModifiersForClass(socialClass: SocialClass): boolean {
    const modifiers = this.getModifiers()
    return modifiers[socialClass] !== undefined
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
    return PROSELYTISM_ACTION.calculateMilitancyModifiers!(this.ALL_ANARCHIST_CITIZENS)
  }
}
