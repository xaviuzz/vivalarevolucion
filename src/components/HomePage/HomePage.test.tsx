import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('renders the title correctly', () => {
    render(<HomePage />)
    const title = screen.getByRole('heading', { level: 1 })
    expect(title).toBeInTheDocument()
    expect(title).toHaveTextContent('VIVA LA REVOLUCION!!')
  })

  it('renders the Barrio component', () => {
    const { container } = render(<HomePage />)

    // Check that citizen cells are rendered
    const citizenElements = container.querySelectorAll('[data-class]')
    expect(citizenElements.length).toBeGreaterThan(0)
  })

  it('generates citizens within expected range', () => {
    const { container } = render(<HomePage />)

    const citizenElements = container.querySelectorAll('[data-class]')
    expect(citizenElements.length).toBeGreaterThanOrEqual(100)
    expect(citizenElements.length).toBeLessThanOrEqual(500)
  })

  it('includes all social classes in the barrio', () => {
    const { container } = render(<HomePage />)

    const desposeidos = container.querySelectorAll('[data-class="DESPOSEIDOS"]')
    const obreros = container.querySelectorAll('[data-class="OBREROS"]')
    const claseMedia = container.querySelectorAll('[data-class="CLASE_MEDIA"]')
    const elites = container.querySelectorAll('[data-class="ELITES"]')

    // All classes should appear at least once (statistically certain)
    expect(desposeidos.length).toBeGreaterThan(0)
    expect(obreros.length).toBeGreaterThan(0)
    expect(claseMedia.length).toBeGreaterThan(0)
    expect(elites.length).toBeGreaterThan(0)
  })
})
