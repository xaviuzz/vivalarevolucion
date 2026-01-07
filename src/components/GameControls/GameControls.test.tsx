import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { GameControls } from './GameControls'

describe('GameControls', () => {
  it('displays the current turn number', () => {
    const mockOnEndTurn = vi.fn()
    render(<GameControls currentTurn={5} onEndTurn={mockOnEndTurn} />)

    expect(screen.getByText('Turno 5')).toBeInTheDocument()
  })

  it('calls onEndTurn when button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnEndTurn = vi.fn()
    render(<GameControls currentTurn={1} onEndTurn={mockOnEndTurn} />)

    const button = screen.getByRole('button', { name: /acabar turno/i })
    await user.click(button)

    expect(mockOnEndTurn).toHaveBeenCalledTimes(1)
  })

  it('renders button with correct text', () => {
    const mockOnEndTurn = vi.fn()
    render(<GameControls currentTurn={1} onEndTurn={mockOnEndTurn} />)

    const button = screen.getByRole('button', { name: /acabar turno/i })
    expect(button).toBeInTheDocument()
  })
})
