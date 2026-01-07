import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Statistics } from './Statistics'
import { SocialClass, type Citizen } from '../../types/Citizen'

describe('Statistics', () => {
  it('displays the total number of citizens', () => {
    const citizens = SUT.createCitizens(100)
    SUT.render(citizens)

    expect(SUT.getTotalCitizens()).toBe(100)
  })

  it('displays all four social classes', () => {
    const citizens = SUT.createCitizens(100)
    SUT.render(citizens)

    expect(SUT.hasAllSocialClasses()).toBe(true)
  })

  it('displays correct count for each social class', () => {
    const citizens = SUT.createBalancedCitizens()
    SUT.render(citizens)

    expect(SUT.getClassCount(SocialClass.DESPOSEIDOS)).toBe(25)
    expect(SUT.getClassCount(SocialClass.OBREROS)).toBe(25)
    expect(SUT.getClassCount(SocialClass.CLASE_MEDIA)).toBe(25)
    expect(SUT.getClassCount(SocialClass.ELITES)).toBe(25)
  })

  it('displays correct percentage for each social class', () => {
    const citizens = SUT.createBalancedCitizens()
    SUT.render(citizens)

    expect(SUT.getClassPercentage(SocialClass.DESPOSEIDOS)).toBe('25.0%')
    expect(SUT.getClassPercentage(SocialClass.OBREROS)).toBe('25.0%')
    expect(SUT.getClassPercentage(SocialClass.CLASE_MEDIA)).toBe('25.0%')
    expect(SUT.getClassPercentage(SocialClass.ELITES)).toBe('25.0%')
  })

  it('displays color indicators for each social class', () => {
    const citizens = SUT.createCitizens(100)
    SUT.render(citizens)

    expect(SUT.hasColorIndicator(SocialClass.DESPOSEIDOS)).toBe(true)
    expect(SUT.hasColorIndicator(SocialClass.OBREROS)).toBe(true)
    expect(SUT.hasColorIndicator(SocialClass.CLASE_MEDIA)).toBe(true)
    expect(SUT.hasColorIndicator(SocialClass.ELITES)).toBe(true)
  })

  it('displays class names correctly', () => {
    const citizens = SUT.createCitizens(100)
    SUT.render(citizens)

    expect(SUT.hasClassName('Desposeídos')).toBe(true)
    expect(SUT.hasClassName('Obreros')).toBe(true)
    expect(SUT.hasClassName('Clase Media')).toBe(true)
    expect(SUT.hasClassName('Élites')).toBe(true)
  })
})

class SUT {
  static render(citizens: Citizen[]) {
    render(<Statistics citizens={citizens} />)
  }

  static createCitizens(total: number): Citizen[] {
    const classes = Object.values(SocialClass)
    return Array.from({ length: total }, (_, id) => ({
      id,
      socialClass: classes[id % classes.length]
    }))
  }

  static createBalancedCitizens(): Citizen[] {
    const citizens: Citizen[] = []
    let id = 0

    for (const socialClass of Object.values(SocialClass)) {
      for (let i = 0; i < 25; i++) {
        citizens.push({ id: id++, socialClass })
      }
    }

    return citizens
  }

  static getTotalCitizens(): number {
    const totalText = screen.getByText(/^\d+$/).textContent
    return totalText ? parseInt(totalText, 10) : 0
  }

  static hasAllSocialClasses(): boolean {
    const classes = Object.values(SocialClass)
    return classes.every(socialClass => {
      const indicator = document.querySelector(`[data-class="${socialClass}"]`)
      return indicator !== null
    })
  }

  static getClassCount(socialClass: SocialClass): number {
    const listItem = SUT.findListItemBySocialClass(socialClass)
    if (!listItem) return 0

    const titleText = listItem.getAttribute('title') || ''
    const match = titleText.match(/:\s*(\d+)/)
    return match ? parseInt(match[1], 10) : 0
  }

  static getClassPercentage(socialClass: SocialClass): string {
    const listItem = SUT.findListItemBySocialClass(socialClass)
    if (!listItem) return ''

    const valueText = listItem.textContent || ''
    const match = valueText.match(/([\d.]+%)/)
    return match ? match[1] : ''
  }

  static hasColorIndicator(socialClass: SocialClass): boolean {
    const indicator = document.querySelector(`[data-class="${socialClass}"]`)
    return indicator !== null
  }

  static hasClassName(displayName: string): boolean {
    const allItems = document.querySelectorAll('li[title]')
    return Array.from(allItems).some(item => {
      const title = item.getAttribute('title') || ''
      return title.includes(displayName)
    })
  }

  static getDisplayName(socialClass: SocialClass): string {
    const names: Record<SocialClass, string> = {
      [SocialClass.DESPOSEIDOS]: 'Desposeídos',
      [SocialClass.OBREROS]: 'Obreros',
      [SocialClass.CLASE_MEDIA]: 'Clase Media',
      [SocialClass.ELITES]: 'Élites'
    }
    return names[socialClass]
  }

  static findListItemBySocialClass(socialClass: SocialClass): HTMLElement | null {
    const indicator = document.querySelector(`[data-class="${socialClass}"]`)
    return indicator?.closest('li') || null
  }
}
