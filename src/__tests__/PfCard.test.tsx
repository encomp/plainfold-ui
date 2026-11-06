import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PfCard } from '../components/PfCard'

describe('PfCard', () => {
  it('renders with default props', () => {
    render(<PfCard data-testid="card">Card content</PfCard>)
    const card = screen.getByTestId('card')
    expect(card).toBeInTheDocument()
    expect(card).toHaveTextContent('Card content')
    expect(card.style.padding).toBe('16px 18px')
  })

  it('applies sm padding', () => {
    render(<PfCard padding="sm" data-testid="card">Content</PfCard>)
    expect(screen.getByTestId('card').style.padding).toBe('12px')
  })

  it('applies md padding', () => {
    render(<PfCard padding="md" data-testid="card">Content</PfCard>)
    expect(screen.getByTestId('card').style.padding).toBe('16px 18px')
  })

  it('applies lg padding', () => {
    render(<PfCard padding="lg" data-testid="card">Content</PfCard>)
    expect(screen.getByTestId('card').style.padding).toBe('28px')
  })

  it('applies hoverable border change on hover', () => {
    render(<PfCard hoverable data-testid="card">Hover me</PfCard>)
    const card = screen.getByTestId('card')

    expect(card.style.transform).toBe('none')

    fireEvent.mouseEnter(card)
    expect(card.style.transform).toBe('translateY(-1px)')

    fireEvent.mouseLeave(card)
    expect(card.style.transform).toBe('none')
  })

  it('does not respond to hover when not hoverable', () => {
    render(<PfCard data-testid="card">Static</PfCard>)
    const card = screen.getByTestId('card')

    fireEvent.mouseEnter(card)
    expect(card.style.transform).toBe('none')
  })

  it('meta without a title still sits on the right', () => {
    render(<PfCard meta="November 2026">x</PfCard>)
    expect(screen.getByText('November 2026').style.marginLeft).toBe('auto')
  })

  it('renders title, meta and footer', () => {
    render(<PfCard title="Spend this month" meta="November 2026" footer={<a href="/b">Budgets</a>}>x</PfCard>)
    expect(screen.getByRole('heading', { level: 2, name: 'Spend this month' })).toBeInTheDocument()
    expect(screen.getByText('November 2026')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Budgets' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Spend this month' })).toBeInTheDocument()
  })

  it('renders a labelled section from aria-label alone', () => {
    render(<PfCard aria-label="Totals">x</PfCard>)
    expect(screen.getByRole('region', { name: 'Totals' })).toBeInTheDocument()
  })

  it('stays a plain div without title or aria-label', () => {
    render(<PfCard data-testid="card">x</PfCard>)
    expect(screen.getByTestId('card').tagName).toBe('DIV')
  })

  it('accent sets a 3px top border and the title color', () => {
    render(<PfCard accent="rgb(1, 2, 3)" title="T" data-testid="card">x</PfCard>)
    expect(screen.getByTestId('card').style.borderTop).toBe('3px solid rgb(1, 2, 3)')
    expect(screen.getByRole('heading', { name: 'T' }).style.color).toBe('rgb(1, 2, 3)')
  })

  it('no accent: styles identical to today', () => {
    render(<PfCard title="T" data-testid="card">x</PfCard>)
    const card = screen.getByTestId('card')
    expect(card.style.border).toBe('1px solid var(--pf-border)')
    expect(screen.getByRole('heading', { name: 'T' }).style.color).toBe('var(--pf-text-primary)')
  })

  it('the card keeps its fill, side borders and radius with accent', () => {
    render(<PfCard accent="rgb(1, 2, 3)" data-testid="card">x</PfCard>)
    const card = screen.getByTestId('card')
    expect(card.style.background).toBe('var(--pf-bg-surface)')
    expect(card.style.borderBottom).toBe('1px solid var(--pf-border)')
    expect(card.style.borderRadius).toBe('var(--pf-radius-md)')
  })

  it('accent keeps its top border while hovered', () => {
    render(<PfCard accent="rgb(1, 2, 3)" hoverable data-testid="card">x</PfCard>)
    const card = screen.getByTestId('card')
    fireEvent.mouseEnter(card)
    expect(card.style.borderTop).toBe('3px solid rgb(1, 2, 3)')
    expect(card.style.borderBottom).toBe('1px solid var(--pf-border-strong)')
  })

  it('the meta slot still renders beside the title with accent', () => {
    render(<PfCard accent="rgb(1, 2, 3)" title="T" meta="M">x</PfCard>)
    expect(screen.getByText('M')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'T' })).toBeInTheDocument()
  })
})
