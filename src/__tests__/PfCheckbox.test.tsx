import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PfCheckbox } from '../components/PfCheckbox'

describe('PfCheckbox', () => {
  it('toggles through its label', () => {
    const on = vi.fn()
    render(<PfCheckbox checked={false} onChange={on} label="Hide cancelled" />)
    fireEvent.click(screen.getByText('Hide cancelled'))
    expect(on).toHaveBeenCalledWith(true)
    expect(screen.getByRole('checkbox', { name: 'Hide cancelled' })).not.toBeChecked()
  })

  it('sets the indeterminate DOM property', () => {
    render(<PfCheckbox checked={false} indeterminate onChange={() => {}} aria-label="All" />)
    expect((screen.getByRole('checkbox') as HTMLInputElement).indeterminate).toBe(true)
  })

  it('puts the testid and id on the input and honours disabled', () => {
    render(<PfCheckbox checked onChange={() => {}} aria-label="x" id="c1" data-testid="cb" disabled />)
    const input = screen.getByTestId('cb')
    expect(input.tagName).toBe('INPUT')
    expect(input).toHaveAttribute('id', 'c1')
    expect(input).toBeDisabled()
  })
})
