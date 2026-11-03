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

  it('dims a disabled aria-label-only checkbox on the input itself', () => {
    const { container } = render(<PfCheckbox checked onChange={() => {}} aria-label="x" disabled />)
    expect(container.querySelector('label')).toBeNull()
    expect(container.querySelector('style')?.textContent).toMatch(/\.pf-checkbox:disabled \{[^}]*opacity: 0\.5/)
  })

  it('mutes a disabled label without dimming it twice', () => {
    render(<PfCheckbox checked onChange={() => {}} label="Hide" disabled />)
    const style = screen.getByText('Hide').closest('label')!.getAttribute('style')!
    expect(style).toContain('var(--pf-text-muted)')
    expect(style).not.toContain('opacity')
  })

  it('passes aria-disabled and aria-describedby to the input', () => {
    render(<PfCheckbox checked onChange={() => {}} aria-label="x" aria-disabled aria-describedby="why" />)
    const input = screen.getByRole('checkbox')
    expect(input).toHaveAttribute('aria-disabled', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'why')
  })
})
