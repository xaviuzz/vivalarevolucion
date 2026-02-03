import { describe, it, expect } from 'vitest'
import { PROPAGANDA_ACTION } from './action'
import { SocialClass, SOCIAL_CLASSES, Citizen } from '../../../types/Citizen'
import { Militancy } from '../../../types/Militancy'
import { MilitancyModifierTable } from '../../../types/Action'

describe('PROPAGANDA_ACTION', () => {
  describe('estructura de la accion', () => {
    it('tiene id correcto', () => {
      expect(PropagandaSUT.getId()).toBe('propaganda')
    })

    it('tiene nombre en espanol', () => {
      expect(PropagandaSUT.getName()).toBe('Propaganda')
    })

    it('tiene descripcion que menciona anarquismo', () => {
      expect(PropagandaSUT.getDescription()).toContain('anarquista')
    })

    it('tiene modificadores de militancia definidos', () => {
      expect(PropagandaSUT.hasMilitancyModifiers()).toBe(true)
    })

    it('no tiene modificadores de clase social', () => {
      expect(PropagandaSUT.hasSocialClassModifiers()).toBe(false)
    })
  })

  describe('efecto concentrado en clases altas', () => {
    it('no tiene efecto en DESPOSEIDOS', () => {
      expect(PropagandaSUT.getAnarchismModifier(SocialClass.DESPOSEIDOS)).toBe(0)
    })

    it('no tiene efecto en OBREROS', () => {
      expect(PropagandaSUT.getAnarchismModifier(SocialClass.OBREROS)).toBe(0)
    })

    it('tiene efecto en CLASE_MEDIA', () => {
      expect(PropagandaSUT.getAnarchismModifier(SocialClass.CLASE_MEDIA)).toBeGreaterThan(0)
    })

    it('tiene efecto en ELITES', () => {
      expect(PropagandaSUT.getAnarchismModifier(SocialClass.ELITES)).toBeGreaterThan(0)
    })
  })

  describe('valores de modificadores base', () => {
    it('aumenta probabilidad de ANARQUISMO en clases altas', () => {
      expect(PropagandaSUT.getAnarchismModifier(SocialClass.CLASE_MEDIA)).toBeGreaterThan(0)
      expect(PropagandaSUT.getAnarchismModifier(SocialClass.ELITES)).toBeGreaterThan(0)
    })

    it('reduce probabilidad de STATUSQUO en clases altas', () => {
      expect(PropagandaSUT.getStatusquoModifier(SocialClass.CLASE_MEDIA)).toBeLessThan(0)
      expect(PropagandaSUT.getStatusquoModifier(SocialClass.ELITES)).toBeLessThan(0)
    })

    it('no afecta probabilidad de FASCISMO', () => {
      for (const socialClass of SOCIAL_CLASSES) {
        expect(PropagandaSUT.getFascismoModifier(socialClass)).toBe(0)
      }
    })

    it('modificadores suman cero para cada clase (balance)', () => {
      for (const socialClass of SOCIAL_CLASSES) {
        const sum = PropagandaSUT.sumModifiersForClass(socialClass)
        expect(sum).toBeCloseTo(0, 10)
      }
    })
  })

  describe('CLASE_MEDIA y ELITES tienen igual acogida', () => {
    it('CLASE_MEDIA y ELITES tienen el mismo modificador', () => {
      const claseMedia = PropagandaSUT.getAnarchismModifier(SocialClass.CLASE_MEDIA)
      const elites = PropagandaSUT.getAnarchismModifier(SocialClass.ELITES)
      expect(claseMedia).toBe(elites)
    })
  })
})

class PropagandaSUT {
  private static readonly ALL_ANARCHIST_CITIZENS: Citizen[] = [
    { id: 1, socialClass: SocialClass.OBREROS, militancy: Militancy.ANARQUISMO }
  ]

  static getId(): string {
    return PROPAGANDA_ACTION.id
  }

  static getName(): string {
    return PROPAGANDA_ACTION.name
  }

  static getDescription(): string {
    return PROPAGANDA_ACTION.description
  }

  static hasMilitancyModifiers(): boolean {
    return PROPAGANDA_ACTION.calculateMilitancyModifiers !== undefined
  }

  static hasSocialClassModifiers(): boolean {
    return PROPAGANDA_ACTION.modifiers !== undefined
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
    return PROPAGANDA_ACTION.calculateMilitancyModifiers!(this.ALL_ANARCHIST_CITIZENS)
  }
}
