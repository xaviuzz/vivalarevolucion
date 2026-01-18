import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Citizen } from './Citizen'
import { SocialClass, Citizen as CitizenType } from '../../types/Citizen'
import { Militancy } from '../../types/Militancy'

describe('Citizen', () => {
  it('renders without crashing', () => {
    const citizen: CitizenType = {
      id: 1,
      socialClass: SocialClass.OBREROS,
      militancy: Militancy.STATUSQUO
    }

    SUT.render(citizen)
    expect(SUT.getCitizenElement()).toBeInTheDocument()
  })

  it('includes the social class in data attribute for styling', () => {
    const citizen: CitizenType = {
      id: 1,
      socialClass: SocialClass.DESPOSEIDOS,
      militancy: Militancy.STATUSQUO
    }

    SUT.render(citizen)
    expect(SUT.getSocialClass()).toBe(SocialClass.DESPOSEIDOS)
  })
})

class SUT {
  static render(citizen: CitizenType) {
    render(<Citizen citizen={citizen} />)
  }

  static getCitizenElement(): HTMLElement {
    return document.querySelector('[data-class]') as HTMLElement
  }

  static getSocialClass(): string | undefined {
    const element = SUT.getCitizenElement()
    return element?.dataset.class
  }
}
