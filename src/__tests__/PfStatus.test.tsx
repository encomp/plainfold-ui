import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PfStatus } from '../components/PfStatus'

describe('PfStatus', () => {
  it('renders its word and an aria-hidden dot in the tone colour', () => {
    render(<PfStatus tone="ok" data-testid="s">On</PfStatus>)
    const pill = screen.getByTestId('s')
    expect(pill).toHaveTextContent('On')
    const dot = pill.querySelector('[aria-hidden="true"]') as HTMLElement
    expect(dot).not.toBeNull()
    expect(dot.style.background).toBe('var(--pf-positive)')
  })

  it.each([
    ['warn', 'var(--pf-warning)'],
    ['off', 'var(--pf-text-muted)'],
    ['danger', 'var(--pf-danger)'],
    ['busy', 'var(--pf-accent)'],
  ] as const)('tone %s uses %s', (tone, colour) => {
    render(<PfStatus tone={tone} data-testid="s">x</PfStatus>)
    const dot = screen.getByTestId('s').querySelector('[aria-hidden="true"]') as HTMLElement
    expect(dot.style.background).toBe(colour)
  })
})
