import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PfToggleGroup } from '../components/PfToggleGroup'

const options = [
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
]

describe('PfToggleGroup', () => {
  it('keeps option order', () => {
    const on = vi.fn()
    render(<PfToggleGroup aria-label="Days" options={options.slice(0, 2)} values={['tue']} onChange={on} />)
    fireEvent.click(screen.getByRole('button', { name: 'Mon' }))
    expect(on).toHaveBeenCalledWith(['mon', 'tue'])
    expect(screen.getByRole('button', { name: 'Tue' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('group', { name: 'Days' })).toBeInTheDocument()
  })

  it('removes a pressed value', () => {
    const on = vi.fn()
    render(<PfToggleGroup aria-label="Days" options={options} values={['mon', 'wed']} onChange={on} />)
    fireEvent.click(screen.getByRole('button', { name: 'Mon' }))
    expect(on).toHaveBeenCalledWith(['wed'])
  })

  it('pressed uses accent fill and on-accent text; unpressed does not', () => {
    render(<PfToggleGroup aria-label="Days" options={options} values={['mon']} onChange={() => {}} />)
    const on = screen.getByRole('button', { name: 'Mon' })
    expect(on.getAttribute('style')).toContain('var(--pf-accent)')
    expect(on.getAttribute('style')).toContain('var(--pf-on-accent, var(--pf-bg-base))')
    expect(screen.getByRole('button', { name: 'Tue' }).getAttribute('style')).not.toContain('var(--pf-accent)')
  })

  it('disabled blocks changes', () => {
    const on = vi.fn()
    render(<PfToggleGroup aria-label="Days" options={options} values={[]} onChange={on} disabled data-testid="g" />)
    fireEvent.click(screen.getByRole('button', { name: 'Mon' }))
    expect(on).not.toHaveBeenCalled()
    expect(screen.getByTestId('g')).toHaveAttribute('role', 'group')
  })
})
