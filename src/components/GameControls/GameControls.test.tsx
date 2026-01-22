import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { GameControls } from './GameControls'
import { ActionToggle } from './ActionToggle'
import { WELFARE_STATE_ACTION, AVAILABLE_ACTIONS } from '../../game/actions'

const mockToggle = vi.fn()
const mockUseActionToggle = vi.fn()

vi.mock('./useActionToggle', () => ({
  useActionToggle: () => mockUseActionToggle()
}))

describe('GameControls', () => {
  beforeEach(() => {
    mockUseActionToggle.mockReturnValue({ isActive: false, toggle: mockToggle })
    mockToggle.mockClear()
  })

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

  it('renders welfare state checkbox', () => {
    SUT.render(1)

    const checkbox = SUT.getWelfareCheckbox()
    expect(checkbox).toBeInTheDocument()
  })
})

describe('ActionToggle', () => {
  beforeEach(() => {
    mockToggle.mockClear()
  })

  it('calls toggle when checkbox is clicked', async () => {
    mockUseActionToggle.mockReturnValue({ isActive: false, toggle: mockToggle })
    const user = userEvent.setup()
    render(<ActionToggle action={WELFARE_STATE_ACTION} />)

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(mockToggle).toHaveBeenCalledTimes(1)
  })

  it('shows checkbox as checked when action is active', () => {
    mockUseActionToggle.mockReturnValue({ isActive: true, toggle: mockToggle })
    render(<ActionToggle action={WELFARE_STATE_ACTION} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('shows checkbox as unchecked when action is inactive', () => {
    mockUseActionToggle.mockReturnValue({ isActive: false, toggle: mockToggle })
    render(<ActionToggle action={WELFARE_STATE_ACTION} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })
})

class SUT {
  static mockOnEndTurn = vi.fn()
  static user = userEvent.setup()

  static render(currentTurn: number) {
    SUT.mockOnEndTurn.mockClear()
    render(
      <GameControls
        currentTurn={currentTurn}
        onEndTurn={SUT.mockOnEndTurn}
        availableActions={AVAILABLE_ACTIONS}
      />
    )
  }

  static getTurnDisplay(turn: number): HTMLElement {
    return screen.getByText(`Turno ${turn}`)
  }

  static getEndTurnButton(): HTMLElement {
    return screen.getByRole('button', { name: /acabar turno/i })
  }

  static getWelfareCheckbox(): HTMLElement {
    return screen.getByRole('checkbox', { name: /estado del bienestar/i })
  }
}
