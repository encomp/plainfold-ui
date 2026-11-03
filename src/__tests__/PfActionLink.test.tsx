import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, createEvent } from '@testing-library/react'
import { PfActionLink } from '../components/PfActionLink'

describe('PfActionLink', () => {
  it('renders an action link with a hidden arrow', () => {
    render(<PfActionLink href="/settings/budgets">Budgets</PfActionLink>)
    const a = screen.getByRole('link', { name: 'Budgets' })
    expect(a).toHaveAttribute('href', '/settings/budgets')
    expect(a.textContent).toBe('Budgets →')
    expect(a.querySelector('[aria-hidden="true"]')).not.toBeNull()
  })
  it('back kind puts the arrow first', () => {
    render(<PfActionLink kind="back" href="/parent">Parent</PfActionLink>)
    expect(screen.getByRole('link', { name: 'Parent' }).textContent).toBe('← Parent')
  })
  it('does not underline a back link on hover', () => {
    render(<PfActionLink kind="back" href="/x">X</PfActionLink>)
    const css = document.querySelector('style')!.textContent!
    expect(css).toContain('.pf-action-link:not(.pf-action-link-back):hover')
    expect(css).not.toMatch(/(^|,)\.pf-action-link:hover/)
  })
  it('calls onNavigate on a plain click and prevents default', () => {
    const nav = vi.fn()
    render(<PfActionLink href="/jobs" onNavigate={nav}>Jobs</PfActionLink>)
    const ev = createEvent.click(screen.getByRole('link'), { button: 0 })
    fireEvent(screen.getByRole('link'), ev)
    expect(nav).toHaveBeenCalledWith('/jobs')
    expect(ev.defaultPrevented).toBe(true)
  })
  it('lets modified clicks through', () => {
    const nav = vi.fn()
    // hash href so jsdom does not log "navigation not implemented" when the browser default runs
    render(<PfActionLink href="#jobs" onNavigate={nav}>Jobs</PfActionLink>)
    for (const init of [{ metaKey: true }, { ctrlKey: true }, { shiftKey: true }, { button: 1 }]) {
      const ev = createEvent.click(screen.getByRole('link'), init)
      fireEvent(screen.getByRole('link'), ev)
      expect(ev.defaultPrevented).toBe(false)
    }
    expect(nav).not.toHaveBeenCalled()
  })
  it('styles action and back differently, with a focus outline rule', () => {
    const { container, rerender } = render(<PfActionLink href="/a">A</PfActionLink>)
    const a = screen.getByRole('link')
    expect(a.getAttribute('style')).toContain('--pf-accent-text')
    expect(a.getAttribute('style')).toContain('text-decoration: none')
    expect(container.querySelector('style')?.textContent).toContain(':focus-visible')
    rerender(<PfActionLink kind="back" href="/a">A</PfActionLink>)
    expect(screen.getByRole('link').getAttribute('style')).toContain('--pf-text-secondary')
  })
  it('external opens a new tab safely, never calls onNavigate, and announces it', () => {
    const nav = vi.fn()
    render(<PfActionLink external href="#docs" onNavigate={nav}>Docs</PfActionLink>)
    const a = screen.getByRole('link')
    expect(a).toHaveAttribute('target', '_blank')
    expect(a).toHaveAttribute('rel', 'noopener noreferrer')
    expect(a.textContent).toBe('Docs (opens in a new tab) →')
    expect(a.getAttribute('style')).toContain('--pf-accent-text')
    const ev = createEvent.click(a, { button: 0 })
    fireEvent(a, ev)
    expect(nav).not.toHaveBeenCalled()
    expect(ev.defaultPrevented).toBe(false)
  })
  it('internal links have no target, rel or hidden text', () => {
    render(<PfActionLink href="/a">A</PfActionLink>)
    const a = screen.getByRole('link')
    expect(a).not.toHaveAttribute('target')
    expect(a).not.toHaveAttribute('rel')
    expect(a.textContent).not.toContain('new tab')
  })
  it('external appends the new-tab note to an aria-label', () => {
    render(<PfActionLink external href="#d" aria-label="Read the docs">Docs</PfActionLink>)
    expect(screen.getByRole('link')).toHaveAttribute('aria-label', 'Read the docs (opens in a new tab)')
  })
})
