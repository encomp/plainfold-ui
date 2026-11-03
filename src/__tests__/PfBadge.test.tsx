import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PfBadge } from '../components/PfBadge'

describe('PfBadge', () => {
  it('renders with default variant', () => {
    render(<PfBadge data-testid="badge">Active</PfBadge>)
    const badge = screen.getByTestId('badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Active')
    expect(badge.style.fontSize).toBe('11px')
  })

  it('renders all variants', () => {
    const variants = ['default', 'success', 'warning', 'danger', 'muted'] as const
    for (const variant of variants) {
      const { unmount } = render(
        <PfBadge variant={variant} data-testid={`badge-${variant}`}>
          {variant}
        </PfBadge>
      )
      expect(screen.getByTestId(`badge-${variant}`)).toBeInTheDocument()
      unmount()
    }
  })

  it('applies inline-flex display', () => {
    render(<PfBadge data-testid="badge">Test</PfBadge>)
    expect(screen.getByTestId('badge').style.display).toBe('inline-flex')
  })

  it('applies nowrap white-space', () => {
    render(<PfBadge data-testid="badge">Long text here</PfBadge>)
    expect(screen.getByTestId('badge').style.whiteSpace).toBe('nowrap')
  })

  it('applies font weight 500', () => {
    render(<PfBadge data-testid="badge">Bold</PfBadge>)
    expect(screen.getByTestId('badge').style.fontWeight).toBe('500')
  })

  it('outline dashed has a transparent background and dashed border', () => {
    render(<PfBadge outline dashed data-testid="badge">Unverified</PfBadge>)
    const badge = screen.getByTestId('badge')
    expect(badge.style.borderStyle).toBe('dashed')
    expect(badge.style.background).toBe('transparent')
  })

  it('outline uses a solid border in the variant colour', () => {
    render(<PfBadge outline variant="danger" data-testid="badge">Bad</PfBadge>)
    const badge = screen.getByTestId('badge')
    expect(badge.style.borderStyle).toBe('solid')
    expect(badge.style.borderColor).toBe('var(--pf-danger)')
  })

  it('outline muted uses the strong border colour', () => {
    render(<PfBadge outline variant="muted" data-testid="badge">Idea</PfBadge>)
    expect(screen.getByTestId('badge').style.borderColor).toBe('var(--pf-border-strong)')
  })
})
