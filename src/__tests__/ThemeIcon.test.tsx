import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeIcon } from '../components/ThemeIcon'

describe('ThemeIcon', () => {
  it('renders SVG when provided', () => {
    const svgMarkup = '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="5"/></svg>'
    render(<ThemeIcon svg={svgMarkup} data-testid="icon" />)
    const icon = screen.getByTestId('icon')
    expect(icon).toBeInTheDocument()
    expect(icon.innerHTML).toContain('<svg')
    expect(icon.innerHTML).toContain('circle')
  })

  it('renders fallback when no SVG', () => {
    render(
      <ThemeIcon fallback={<span data-testid="fallback-icon">F</span>} data-testid="icon" />
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByTestId('fallback-icon')).toBeInTheDocument()
    expect(screen.getByText('F')).toBeInTheDocument()
  })

  it('renders nothing when neither SVG nor fallback provided', () => {
    const { container } = render(<ThemeIcon />)
    expect(container.innerHTML).toBe('')
  })

  it('applies default size of 20px', () => {
    render(<ThemeIcon fallback={<span>X</span>} data-testid="icon" />)
    const icon = screen.getByTestId('icon')
    expect(icon.style.width).toBe('20px')
    expect(icon.style.height).toBe('20px')
  })

  it('applies custom size', () => {
    render(<ThemeIcon fallback={<span>X</span>} size={32} data-testid="icon" />)
    const icon = screen.getByTestId('icon')
    expect(icon.style.width).toBe('32px')
    expect(icon.style.height).toBe('32px')
  })

  it('applies custom style', () => {
    render(
      <ThemeIcon
        fallback={<span>X</span>}
        style={{ color: 'red' }}
        data-testid="icon"
      />
    )
    const icon = screen.getByTestId('icon')
    expect(icon.style.color).toBe('red')
  })

  it('prefers SVG over fallback when both provided', () => {
    const svgMarkup = '<svg><rect/></svg>'
    render(
      <ThemeIcon
        svg={svgMarkup}
        fallback={<span data-testid="fallback">F</span>}
        data-testid="icon"
      />
    )
    expect(screen.getByTestId('icon').innerHTML).toContain('<svg')
    expect(screen.queryByTestId('fallback')).not.toBeInTheDocument()
  })
})
