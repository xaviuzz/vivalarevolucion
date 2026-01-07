import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Barrio } from './Barrio'
import {
  SocialClass,
  Citizen as CitizenType
} from '../../types/Citizen'

describe('Barrio', () => {
  it('renders all citizens', () => {
    const citizens: CitizenType[] = [
      { id: 0, socialClass: SocialClass.DESPOSEIDOS },
      { id: 1, socialClass: SocialClass.OBREROS },
      { id: 2, socialClass: SocialClass.CLASE_MEDIA }
    ]

    SUT.render(citizens)
    expect(SUT.getCitizenCount()).toBe(3)
  })

  it('renders citizens with correct social classes', () => {
    const citizens: CitizenType[] = [
      { id: 0, socialClass: SocialClass.ELITES },
      { id: 1, socialClass: SocialClass.OBREROS }
    ]

    SUT.render(citizens)
    expect(SUT.getCitizenCountByClass(SocialClass.ELITES)).toBe(1)
    expect(SUT.getCitizenCountByClass(SocialClass.OBREROS)).toBe(1)
  })
})

class SUT {
  static render(citizens: CitizenType[]) {
    render(<Barrio citizens={citizens} />)
  }

  static getCitizenCount(): number {
    return document.querySelectorAll('[data-class]').length
  }

  static getCitizenCountByClass(socialClass: SocialClass): number {
    return document.querySelectorAll(`[data-class="${socialClass}"]`).length
  }
}
