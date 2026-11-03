import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, createEvent } from '@testing-library/react'
import { PfPageHeader } from '../components/PfPageHeader'

describe('PfPageHeader', () => {
  it('renders back link, h1 title, context and actions', () => {
    render(
      <PfPageHeader
        title="Sample Item"
        context="Idea"
        back={{ label: 'Parent', href: '/parent' }}
        actions={<button>Share</button>}
      />,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Sample Item' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Parent' })).toHaveAttribute('href', '/parent')
    expect(screen.getByText('Idea')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument()
  })
  it('lays out wrapping, bottom-aligned, with a page-size bold title', () => {
    render(<PfPageHeader title="T" data-testid="hd" />)
    const root = screen.getByTestId('hd')
    expect(root.style.justifyContent).toBe('space-between')
    expect(root.style.alignItems).toBe('flex-end')
    expect(root.style.flexWrap).toBe('wrap')
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1.style.fontWeight).toBe('700')
    expect(h1.getAttribute('style')).toContain('--pf-text-page')
  })
  it('omits back, context and actions when not given', () => {
    render(<PfPageHeader title="T" />)
    expect(screen.queryByRole('link')).toBeNull()
  })
  it('passes onNavigate to the back link', () => {
    const nav = vi.fn()
    render(<PfPageHeader title="T" back={{ label: 'Parent', href: '/parent' }} onNavigate={nav} />)
    const a = screen.getByRole('link')
    const ev = createEvent.click(a, { button: 0 })
    fireEvent(a, ev)
    expect(nav).toHaveBeenCalledWith('/parent')
    expect(ev.defaultPrevented).toBe(true)
  })
})
