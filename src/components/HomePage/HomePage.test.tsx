import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('renders the title correctly', () => {
    SUT.render()
    const title = SUT.getTitle()
    expect(title).toBeInTheDocument()
    expect(title).toHaveTextContent('VIVA LA REVOLUCION!!')
  })

  it('renders the Barrio component', () => {
    SUT.render()
    expect(SUT.getCitizenCount()).toBeGreaterThan(0)
  })

  it('generates citizens within expected range', () => {
    SUT.render()
    const count = SUT.getCitizenCount()
    expect(count).toBeGreaterThanOrEqual(100)
    expect(count).toBeLessThanOrEqual(500)
  })

  it('includes all social classes in the barrio', () => {
    SUT.render()
    expect(SUT.hasAllSocialClasses()).toBe(true)
  })

  it('renders the Statistics component', () => {
    SUT.render()
    expect(SUT.hasStatisticsPanel()).toBe(true)
  })

  it('displays turn counter starting at turn 1', () => {
    SUT.render()
    expect(SUT.getTurnDisplay()).toBeInTheDocument()
  })

  it('advances turn when end turn button is clicked', async () => {
    SUT.render()

    const button = SUT.getEndTurnButton()
    expect(SUT.getTurnDisplay()).toBeInTheDocument()

    await SUT.user.click(button)
    expect(screen.getByText('Turno 2')).toBeInTheDocument()

    await SUT.user.click(button)
    expect(screen.getByText('Turno 3')).toBeInTheDocument()
  })
})

class SUT {
  static user = userEvent.setup()

  static render() {
    render(<HomePage />)
  }

  static getTitle(): HTMLElement {
    return screen.getByRole('heading', { level: 1 })
  }

  static getCitizenCount(): number {
    return document.querySelectorAll('[data-class]').length
  }

  static hasAllSocialClasses(): boolean {
    const classes = ['DESPOSEIDOS', 'OBREROS', 'CLASE_MEDIA', 'ELITES']
    return classes.every(socialClass => {
      const elements = document.querySelectorAll(`[data-class="${socialClass}"]`)
      return elements.length > 0
    })
  }

  static getTurnDisplay(): HTMLElement {
    return screen.getByText('Turno 1')
  }

  static getEndTurnButton(): HTMLElement {
    return screen.getByRole('button', { name: /acabar turno/i })
  }

  static hasStatisticsPanel(): boolean {
    const allItems = document.querySelectorAll('li[title]')
    return allItems.length > 0
  }
}
