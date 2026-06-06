import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PfTooltip } from '../components/PfTooltip'

describe('PfTooltip', () => {
  it('renders children', () => {
    render(
      <PfTooltip content="Helpful tip">
        <button>Hover me</button>
      </PfTooltip>
    )
    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument()
  })

  it('renders trigger element', () => {
    render(
      <PfTooltip content="Info">
        <span data-testid="trigger">Target</span>
      </PfTooltip>
    )
    expect(screen.getByTestId('trigger')).toBeInTheDocument()
    expect(screen.getByTestId('trigger')).toHaveTextContent('Target')
  })

  it('keeps children interactive', () => {
    render(
      <PfTooltip content="Click info">
        <button type="button">Action</button>
      </PfTooltip>
    )
    const button = screen.getByRole('button', { name: 'Action' })
    expect(button).toBeInTheDocument()
    expect(button).not.toBeDisabled()
  })
})
