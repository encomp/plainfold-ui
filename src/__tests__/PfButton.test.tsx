import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PfButton } from '../components/PfButton'

describe('PfButton', () => {
  it('renders with default props', () => {
    render(<PfButton>Click me</PfButton>)
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).not.toBeDisabled()
  })

  it('renders all variants', () => {
    const variants = ['primary', 'secondary', 'quiet', 'ghost', 'danger'] as const
    for (const variant of variants) {
      const { unmount } = render(
        <PfButton variant={variant} data-testid={`btn-${variant}`}>
          {variant}
        </PfButton>
      )
      expect(screen.getByTestId(`btn-${variant}`)).toBeInTheDocument()
      unmount()
    }
  })

  it('applies disabled state', () => {
    render(<PfButton disabled>Disabled</PfButton>)
    const button = screen.getByRole('button', { name: 'Disabled' })
    expect(button).toBeDisabled()
    expect(button.style.cursor).toBe('not-allowed')
  })

  it('shows loading spinner when loading', () => {
    render(<PfButton loading>Save</PfButton>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(screen.getByTestId('pf-button-spinner')).toBeInTheDocument()
    expect(screen.queryByText('Save')).not.toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<PfButton onClick={handleClick}>Click</PfButton>)
    fireEvent.click(screen.getByRole('button', { name: 'Click' }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn()
    render(
      <PfButton onClick={handleClick} disabled>
        Click
      </PfButton>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Click' }))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('does not call onClick when loading', () => {
    const handleClick = vi.fn()
    render(
      <PfButton onClick={handleClick} loading>
        Click
      </PfButton>
    )
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renders with icon', () => {
    render(
      <PfButton icon={<span data-testid="icon">*</span>}>With Icon</PfButton>
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('With Icon')).toBeInTheDocument()
  })

  it('applies aria-label', () => {
    render(<PfButton aria-label="Close dialog">X</PfButton>)
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument()
  })

  it('applies size styles', () => {
    render(<PfButton size="lg" data-testid="lg-btn">Large</PfButton>)
    const button = screen.getByTestId('lg-btn')
    expect(button.style.fontSize).toBe('16px')
    expect(button.style.padding).toBe('12px 20px')
  })

  it('has the pf-button class and a focus-visible rule that beats the inline outline', () => {
    render(<PfButton>Go</PfButton>)
    expect(screen.getByRole('button', { name: 'Go' })).toHaveClass('pf-button')
    const css = Array.from(document.querySelectorAll('style')).map((s) => s.textContent).join('')
    expect(css).toContain('.pf-button:focus-visible')
    expect(css).toMatch(/\.pf-button:focus-visible\s*\{[^}]*outline: 2px solid var\(--pf-accent-text, var\(--pf-accent\)\) !important/)
  })

  it('describes the disabled button by its reason', () => {
    render(<PfButton disabled reason="Pick a decision first.">Save</PfButton>)
    const b = screen.getByRole('button', { name: 'Save' })
    expect(b).toHaveAccessibleDescription('Pick a decision first.')
  })

  it('hides the reason when enabled', () => {
    render(<PfButton reason="Pick a decision first.">Save</PfButton>)
    expect(screen.queryByText('Pick a decision first.')).toBeNull()
  })

  it('draws disabled primary grey, not accent', () => {
    render(<PfButton variant="primary" disabled>Save</PfButton>)
    const s = screen.getByRole('button').style
    expect(s.background).toBe('var(--pf-bg-surface-alt)')
    expect(s.color).toBe('var(--pf-text-muted)')
    expect(s.opacity).toBe('')
  })

  it('quiet uses accent text with no border', () => {
    render(<PfButton variant="quiet">Find sources</PfButton>)
    const s = screen.getByRole('button').style
    expect(s.color).toBe('var(--pf-accent-text, var(--pf-accent))')
    expect(s.borderColor === 'transparent' || s.border.includes('transparent')).toBe(true)
  })

  it('takes sm and md font sizes from the type scale', () => {
    render(<><PfButton size="sm" data-testid="sm">a</PfButton><PfButton data-testid="md">b</PfButton></>)
    expect(screen.getByTestId('sm').getAttribute('style')).toContain('var(--pf-text-meta, 13px)')
    expect(screen.getByTestId('md').getAttribute('style')).toContain('var(--pf-text-body, 14px)')
  })
})
