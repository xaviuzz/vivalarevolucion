import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { GameControls } from './GameControls'

describe('GameControls', () => {
  it('displays the current turn number', () => {
    SUT.render(5)

    expect(SUT.getTurnDisplay(5)).toBeInTheDocument()
  })

  it('calls onEndTurn when button is clicked', async () => {
    SUT.render(1)

    const button = SUT.getEndTurnButton()
    await SUT.user.click(button)

    expect(SUT.mockOnEndTurn).toHaveBeenCalledTimes(1)
  })

  it('renders button with correct text', () => {
    SUT.render(1)

    const button = SUT.getEndTurnButton()
    expect(button).toBeInTheDocument()
  })
})

class SUT {
  static mockOnEndTurn = vi.fn()
  static user = userEvent.setup()

  static render(currentTurn: number) {
    SUT.mockOnEndTurn.mockClear()
    render(<GameControls currentTurn={currentTurn} onEndTurn={SUT.mockOnEndTurn} />)
  }

  static getTurnDisplay(turn: number): HTMLElement {
    return screen.getByText(`Turno ${turn}`)
  }

  static getEndTurnButton(): HTMLElement {
    return screen.getByRole('button', { name: /acabar turno/i })
  }
}
