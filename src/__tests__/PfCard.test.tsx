import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PfCard } from '../components/PfCard'

describe('PfCard', () => {
  it('renders with default props', () => {
    render(<PfCard data-testid="card">Card content</PfCard>)
    const card = screen.getByTestId('card')
    expect(card).toBeInTheDocument()
    expect(card).toHaveTextContent('Card content')
    expect(card.style.padding).toBe('20px')
  })

  it('applies sm padding', () => {
    render(<PfCard padding="sm" data-testid="card">Content</PfCard>)
    expect(screen.getByTestId('card').style.padding).toBe('12px')
  })

  it('applies md padding', () => {
    render(<PfCard padding="md" data-testid="card">Content</PfCard>)
    expect(screen.getByTestId('card').style.padding).toBe('20px')
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
})
