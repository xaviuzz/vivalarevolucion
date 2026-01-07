import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Citizen } from './Citizen'
import { SocialClass, Citizen as CitizenType } from '../../models/Citizen'

describe('Citizen', () => {
  it('renders without crashing', () => {
    const citizen: CitizenType = {
      id: 1,
      socialClass: SocialClass.OBREROS
    }

    const { container } = render(<Citizen citizen={citizen} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('includes the social class in data attribute for styling', () => {
    const citizen: CitizenType = {
      id: 1,
      socialClass: SocialClass.DESPOSEIDOS
    }

    const { container } = render(<Citizen citizen={citizen} />)
    const element = container.firstChild as HTMLElement
    expect(element.dataset.class).toBe(SocialClass.DESPOSEIDOS)
  })
})
