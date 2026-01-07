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

    const { container } = render(<Barrio citizens={citizens} />)

    const citizenElements = container.querySelectorAll('[data-class]')
    expect(citizenElements.length).toBe(3)
  })

  it('renders citizens with correct social classes', () => {
    const citizens: CitizenType[] = [
      { id: 0, socialClass: SocialClass.ELITES },
      { id: 1, socialClass: SocialClass.OBREROS }
    ]

    const { container } = render(<Barrio citizens={citizens} />)

    const eliteElements = container.querySelectorAll('[data-class="ELITES"]')
    const obreroElements = container.querySelectorAll('[data-class="OBREROS"]')

    expect(eliteElements.length).toBe(1)
    expect(obreroElements.length).toBe(1)
  })
})
