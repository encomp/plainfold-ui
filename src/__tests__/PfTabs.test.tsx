import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, createEvent } from '@testing-library/react'
import { PfTabs } from '../components/PfTabs'

const items = [
  { id: 'keys', label: 'API keys', href: '/settings/keys', 'data-testid': 'tab-keys' },
  { id: 'budgets', label: 'Budgets', href: '/settings/budgets' },
]

describe('PfTabs', () => {
  it('marks the current tab and never wraps', () => {
    render(<PfTabs aria-label="Settings" current="budgets" items={items} />)
    expect(screen.getByRole('link', { name: 'Budgets' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'API keys' })).not.toHaveAttribute('aria-current')
    const nav = screen.getByRole('navigation', { name: 'Settings' })
    expect(nav.style.overflowX).toBe('auto')
    expect(nav.style.flexWrap).toBe('nowrap')
    expect(nav.style.whiteSpace).toBe('nowrap')
  })
  it('underlines the current tab with the accent', () => {
    render(<PfTabs aria-label="Settings" current="budgets" items={items} />)
    expect(screen.getByRole('link', { name: 'Budgets' }).getAttribute('style')).toContain('2px solid var(--pf-accent-text, var(--pf-accent))')
    expect(screen.getByTestId('tab-keys')).toBeInTheDocument()
  })
  it('calls onNavigate on a plain click and lets modified clicks through', () => {
    const nav = vi.fn()
    render(<PfTabs aria-label="S" current="keys" items={[{ id: 'a', label: 'A', href: '#a' }]} onNavigate={nav} />)
    const a = screen.getByRole('link', { name: 'A' })
    const ev = createEvent.click(a, { button: 0 })
    fireEvent(a, ev)
    expect(nav).toHaveBeenCalledWith('#a')
    expect(ev.defaultPrevented).toBe(true)
    nav.mockClear()
    for (const init of [{ metaKey: true }, { ctrlKey: true }, { shiftKey: true }, { button: 1 }]) {
      const e2 = createEvent.click(a, init)
      fireEvent(a, e2)
      expect(e2.defaultPrevented).toBe(false)
    }
    expect(nav).not.toHaveBeenCalled()
  })
})
