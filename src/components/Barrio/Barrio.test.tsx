import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Barrio } from './Barrio'
import {
  SocialClass,
  Citizen as CitizenType
} from '../../types/Citizen'
import { Militancy } from '../../types/Militancy'

describe('Barrio', () => {
  it('renders all citizens', () => {
    const citizens: CitizenType[] = [
      { id: 0, socialClass: SocialClass.DESPOSEIDOS, militancy: Militancy.STATUSQUO },
      { id: 1, socialClass: SocialClass.OBREROS, militancy: Militancy.STATUSQUO },
      { id: 2, socialClass: SocialClass.CLASE_MEDIA, militancy: Militancy.STATUSQUO }
    ]

    SUT.render(citizens)
    expect(SUT.getCitizenCount()).toBe(3)
  })

  it('renders citizens with correct social classes', () => {
    const citizens: CitizenType[] = [
      { id: 0, socialClass: SocialClass.ELITES, militancy: Militancy.STATUSQUO },
      { id: 1, socialClass: SocialClass.OBREROS, militancy: Militancy.STATUSQUO }
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
