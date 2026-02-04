import { describe, it, expect } from 'vitest'
import { CORRUPTION_ACTION } from './action'
import { SocialClass, SOCIAL_CLASSES, Citizen } from '../../../types/Citizen'
import { Militancy } from '../../../types/Militancy'
import { MilitancyModifierTable } from '../../../types/Action'

describe('CORRUPTION_ACTION', () => {
  describe('estructura de la accion', () => {
    it('tiene id correcto', () => {
      expect(CorruptionSUT.getId()).toBe('corruption')
    })

    it('tiene nombre en espanol', () => {
      expect(CorruptionSUT.getName()).toBe('Corrupción')
    })

    it('tiene descripcion que menciona fascismo', () => {
      expect(CorruptionSUT.getDescription()).toContain('fascismo')
    })

    it('tiene modificadores de militancia definidos', () => {
      expect(CorruptionSUT.hasMilitancyModifiers()).toBe(true)
    })

    it('no tiene modificadores de clase social', () => {
      expect(CorruptionSUT.hasSocialClassModifiers()).toBe(false)
    })
  })

  describe('efecto concentrado solo en ELITES', () => {
    it('no tiene efecto en DESPOSEIDOS', () => {
      expect(CorruptionSUT.getFascismoModifier(SocialClass.DESPOSEIDOS)).toBe(0)
    })

    it('no tiene efecto en OBREROS', () => {
      expect(CorruptionSUT.getFascismoModifier(SocialClass.OBREROS)).toBe(0)
    })

    it('no tiene efecto en CLASE_MEDIA', () => {
      expect(CorruptionSUT.getFascismoModifier(SocialClass.CLASE_MEDIA)).toBe(0)
    })

    it('tiene efecto en ELITES', () => {
      expect(CorruptionSUT.getFascismoModifier(SocialClass.ELITES)).toBeGreaterThan(0)
    })
  })

  describe('valores de modificadores base', () => {
    it('aumenta probabilidad de FASCISMO solo en ELITES', () => {
      expect(CorruptionSUT.getFascismoModifier(SocialClass.ELITES)).toBeGreaterThan(0)
      expect(CorruptionSUT.getFascismoModifier(SocialClass.DESPOSEIDOS)).toBe(0)
      expect(CorruptionSUT.getFascismoModifier(SocialClass.OBREROS)).toBe(0)
      expect(CorruptionSUT.getFascismoModifier(SocialClass.CLASE_MEDIA)).toBe(0)
    })

    it('reduce probabilidad de STATUSQUO solo en ELITES', () => {
      expect(CorruptionSUT.getStatusquoModifier(SocialClass.ELITES)).toBeLessThan(0)
      expect(CorruptionSUT.getStatusquoModifier(SocialClass.DESPOSEIDOS)).toBe(0)
      expect(CorruptionSUT.getStatusquoModifier(SocialClass.OBREROS)).toBe(0)
      expect(CorruptionSUT.getStatusquoModifier(SocialClass.CLASE_MEDIA)).toBe(0)
    })

    it('no afecta probabilidad de ANARQUISMO', () => {
      for (const socialClass of SOCIAL_CLASSES) {
        expect(CorruptionSUT.getAnarchismModifier(socialClass)).toBe(0)
      }
    })

    it('modificadores suman cero para cada clase (balance)', () => {
      for (const socialClass of SOCIAL_CLASSES) {
        const sum = CorruptionSUT.sumModifiersForClass(socialClass)
        expect(sum).toBeCloseTo(0, 10)
      }
    })
  })

  describe('magnitud de efecto en ELITES', () => {
    it('incremento de fascismo es +20% base', () => {
      expect(CorruptionSUT.getFascismoModifier(SocialClass.ELITES)).toBe(0.20)
    })

    it('decremento de statusquo es -20% base', () => {
      expect(CorruptionSUT.getStatusquoModifier(SocialClass.ELITES)).toBe(-0.20)
    })

    it('fascismo y statusquo se cancelan exactamente', () => {
      const fascismo = CorruptionSUT.getFascismoModifier(SocialClass.ELITES)
      const statusquo = CorruptionSUT.getStatusquoModifier(SocialClass.ELITES)
      expect(fascismo + statusquo).toBeCloseTo(0, 10)
    })
  })
})

class CorruptionSUT {
  private static readonly ALL_FASCIST_CITIZENS: Citizen[] = [
    { id: 1, socialClass: SocialClass.ELITES, militancy: Militancy.FASCISMO }
  ]

  static getId(): string {
    return CORRUPTION_ACTION.id
  }

  static getName(): string {
    return CORRUPTION_ACTION.name
  }

  static getDescription(): string {
    return CORRUPTION_ACTION.description
  }

  static hasMilitancyModifiers(): boolean {
    return CORRUPTION_ACTION.calculateMilitancyModifiers !== undefined
  }

  static hasSocialClassModifiers(): boolean {
    return CORRUPTION_ACTION.modifiers !== undefined
  }

  static getFascismoModifier(socialClass: SocialClass): number {
    return this.getModifiers()[socialClass][Militancy.FASCISMO]
  }

  static getStatusquoModifier(socialClass: SocialClass): number {
    return this.getModifiers()[socialClass][Militancy.STATUSQUO]
  }

  static getAnarchismModifier(socialClass: SocialClass): number {
    return this.getModifiers()[socialClass][Militancy.ANARQUISMO]
  }

  static sumModifiersForClass(socialClass: SocialClass): number {
    const modifiers = this.getModifiers()[socialClass]
    return modifiers[Militancy.FASCISMO] + modifiers[Militancy.STATUSQUO] + modifiers[Militancy.ANARQUISMO]
  }

  private static getModifiers(): MilitancyModifierTable {
    return CORRUPTION_ACTION.calculateMilitancyModifiers!(this.ALL_FASCIST_CITIZENS)
  }
}
