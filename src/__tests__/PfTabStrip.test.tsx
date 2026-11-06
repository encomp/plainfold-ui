import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import { PfTabStrip } from '../components/PfTabStrip'
import { PfTabs } from '../components/PfTabs'

const items = [
  { id: 'apples', label: 'Apples', 'data-testid': 't-apples' },
  { id: 'pears', label: 'Pears' },
  { id: 'plums', label: 'Plums' },
]

function Harness({ level }: { level?: 'page' | 'sub' }) {
  const [v, setV] = useState('apples')
  return <PfTabStrip items={items} value={v} onChange={setV} aria-label="Fruit" level={level} />
}

describe('PfTabStrip', () => {
  it('renders a named tablist with aria-selected on value', () => {
    render(<PfTabStrip items={items} value="pears" onChange={() => {}} aria-label="Fruit" />)
    expect(screen.getByRole('tablist', { name: 'Fruit' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Pears' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Apples' })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByTestId('t-apples')).toBeInTheDocument()
  })

  it('click calls onChange(id)', () => {
    const onChange = vi.fn()
    render(<PfTabStrip items={items} value="apples" onChange={onChange} aria-label="Fruit" />)
    fireEvent.click(screen.getByRole('tab', { name: 'Plums' }))
    expect(onChange).toHaveBeenCalledWith('plums')
  })

  it('ArrowRight moves selection and focus, wrapping; ArrowLeft wraps the other way; Home and End jump', () => {
    render(<Harness />)
    const tab = (n: string) => screen.getByRole('tab', { name: n })
    fireEvent.keyDown(tab('Apples'), { key: 'ArrowLeft' })
    expect(tab('Plums')).toHaveAttribute('aria-selected', 'true')
    expect(tab('Plums')).toHaveFocus()
    fireEvent.keyDown(tab('Plums'), { key: 'ArrowRight' })
    expect(tab('Apples')).toHaveAttribute('aria-selected', 'true')
    expect(tab('Apples')).toHaveFocus()
    fireEvent.keyDown(tab('Apples'), { key: 'End' })
    expect(tab('Plums')).toHaveFocus()
    fireEvent.keyDown(tab('Plums'), { key: 'Home' })
    expect(tab('Apples')).toHaveFocus()
  })

  it('only the selected tab has tabIndex 0', () => {
    render(<PfTabStrip items={items} value="pears" onChange={() => {}} aria-label="Fruit" />)
    expect(screen.getAllByRole('tab').map((t) => t.tabIndex)).toEqual([-1, 0, -1])
  })

  it('when value matches no item the first tab is tabbable', () => {
    render(<PfTabStrip items={items} value="none" onChange={() => {}} aria-label="Fruit" />)
    expect(screen.getAllByRole('tab').map((t) => t.tabIndex)).toEqual([0, -1, -1])
  })

  it('level="sub" uses a smaller font size and padding than level="page"', () => {
    const { unmount } = render(<Harness />)
    const page = screen.getByRole('tab', { name: 'Apples' }).style
    const pageFont = page.fontSize, pagePad = page.padding
    unmount()
    render(<Harness level="sub" />)
    const sub = screen.getByRole('tab', { name: 'Apples' }).style
    expect(sub.fontSize).not.toBe(pageFont)
    expect(sub.padding).not.toBe(pagePad)
    expect(pageFont).toContain('14px')
    expect(sub.fontSize).toContain('13px')
  })

  it('level="sub" has a lighter list rule than level="page"', () => {
    const { unmount } = render(<Harness />)
    const page = screen.getByRole('tablist').style.borderBottom
    unmount()
    render(<Harness level="sub" />)
    expect(screen.getByRole('tablist').style.borderBottom).not.toBe(page)
  })

  it('overflow-x is auto on the strip', () => {
    render(<Harness />)
    expect(screen.getByRole('tablist').style.overflowX).toBe('auto')
  })

  it('PfTabs and PfTabStrip level=page render the same tab styles', () => {
    render(
      <>
        <PfTabs items={[{ id: 'a', label: 'A', href: '/a' }, { id: 'b', label: 'B', href: '/b' }]} current="a" aria-label="Nav" />
        <PfTabStrip items={[{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }]} value="a" onChange={() => {}} aria-label="Strip" />
      </>,
    )
    const keys = ['padding', 'fontSize', 'fontWeight', 'color', 'borderBottom', 'marginBottom'] as const
    const pick = (el: HTMLElement) => keys.map((k) => el.style[k])
    expect(pick(screen.getByRole('tab', { name: 'A' }))).toEqual(pick(screen.getByRole('link', { name: 'A' })))
    expect(pick(screen.getByRole('tab', { name: 'B' }))).toEqual(pick(screen.getByRole('link', { name: 'B' })))
    expect(screen.getByRole('tab', { name: 'A' }).style.borderBottom).toContain('2px solid')
    const list = (el: HTMLElement) => [el.style.display, el.style.gap, el.style.overflowX, el.style.borderBottom, el.style.fontFamily]
    expect(list(screen.getByRole('tablist'))).toEqual(list(screen.getByRole('navigation', { name: 'Nav' })))
  })
})
