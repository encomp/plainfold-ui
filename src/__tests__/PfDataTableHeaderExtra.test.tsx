import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, within, fireEvent } from '@testing-library/react'
import { useBreakpoint } from '../utils/useBreakpoint'
import { PfDataTable } from '../components/PfDataTable'
import type { PfColumn } from '../components/PfDataTable'

vi.mock('../utils/useBreakpoint', () => ({
  useBreakpoint: vi.fn(() => 'desktop'),
  BREAKPOINTS: { mobile: 0, tablet: 768, desktop: 1024 },
}))

interface Row { id: string; name: string }
const rows: Row[] = [{ id: 'a', name: 'Bravo' }, { id: 'b', name: 'alpha' }]
const hintClick = vi.fn()
const columns: PfColumn<Row>[] = [
  {
    id: 'name', header: 'Name', cell: (r) => r.name, sortValue: (r) => r.name,
    headerExtra: <button type="button" aria-label="About names" onClick={hintClick}>?</button>,
  },
]

function setup(extra: Partial<React.ComponentProps<typeof PfDataTable<Row>>> = {}) {
  return render(<PfDataTable<Row> rows={rows} columns={columns} getRowId={(r) => r.id} {...extra} />)
}

beforeEach(() => {
  vi.mocked(useBreakpoint).mockReturnValue('desktop')
  hintClick.mockClear()
})

describe('PfColumn.headerExtra (desktop)', () => {
  it('keeps the sort button name equal to the header text', () => {
    setup()
    expect(screen.getByRole('button', { name: 'Name' })).toBeTruthy()
  })

  it('renders the extra as a sibling of the sort button, in the th, focusable separately', () => {
    setup()
    const sortBtn = screen.getByRole('button', { name: 'Name' })
    const extra = screen.getByRole('button', { name: 'About names' })
    expect(sortBtn.contains(extra)).toBe(false)
    expect(extra.closest('th')).toBe(sortBtn.closest('th'))
    extra.focus()
    expect(document.activeElement).toBe(extra)
  })

  it('clicking the extra does not change sort', () => {
    setup()
    const th = screen.getByRole('columnheader')
    fireEvent.click(screen.getByRole('button', { name: 'About names' }))
    expect(hintClick).toHaveBeenCalledTimes(1)
    expect(th.getAttribute('aria-sort')).toBeNull()
  })

  it('has no interactive element nested in the sort button', () => {
    setup()
    const sortBtn = screen.getByRole('button', { name: 'Name' })
    expect(sortBtn.querySelectorAll(
      'a, button, input, select, textarea, [role=button], [role=link], [tabindex]',
    ).length).toBe(0)
  })

  it('renders the extra for non-sortable columns too', () => {
    setup({ columns: [{ id: 'p', header: 'Plain', cell: (r) => r.name, headerExtra: <span>hint</span> }] })
    expect(screen.getByText('hint').closest('th')).toBeTruthy()
  })
})

describe('PfColumn.headerExtra (phone)', () => {
  beforeEach(() => { vi.mocked(useBreakpoint).mockReturnValue('mobile') })

  it('Sort by lists the string header text, not the id', () => {
    setup({ columns: [{ ...columns[0], id: 'name_col' }] })
    const select = screen.getByLabelText('Sort by')
    expect(within(select).getByRole('option', { name: 'Name' })).toBeTruthy()
  })

  it('falls back to the id for a non-string header', () => {
    setup({ columns: [{ ...columns[0], id: 'name_col', header: <em>Name</em> }] })
    expect(within(screen.getByLabelText('Sort by')).getByRole('option', { name: 'name_col' })).toBeTruthy()
  })

  it('shows the extra in the card label line', () => {
    setup({ columns: [
      { id: 't', header: 'Title', cell: (r) => r.name },
      { ...columns[0], id: 'n2' },
    ] })
    expect(screen.getAllByRole('button', { name: 'About names' }).length).toBe(rows.length)
  })

  it.each([
    ['role=button', '<span role="button" data-x>x</span>'],
    ['role=link', '<span role="link" data-x>x</span>'],
    ['tabindex=0', '<span tabindex="0" data-x>x</span>'],
  ])('tapping an interactive adornment (%s) in a card does not click the row', (_n, html) => {
    const onRowClick = vi.fn()
    setup({
      onRowClick,
      columns: [{ id: 'n', header: 'Name', cell: (r) => <span dangerouslySetInnerHTML={{ __html: html }} data-r={r.id} /> }],
    })
    fireEvent.click(document.querySelector('[data-x]')!)
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('tabindex=-1 does not block row click', () => {
    const onRowClick = vi.fn()
    setup({
      onRowClick,
      columns: [{ id: 'n', header: 'Name', cell: () => <span tabIndex={-1} data-x>x</span> }],
    })
    fireEvent.click(document.querySelector('[data-x]')!)
    expect(onRowClick).toHaveBeenCalledTimes(1)
  })
})

describe('row click with a focusable row', () => {
  it('still selects when the row itself carries tabindex=0 (rowAttrs)', () => {
    const onRowClick = vi.fn()
    setup({ onRowClick, rowAttrs: () => ({ tabindex: '0' }), rowTestId: (r) => `row-${r.id}` })
    fireEvent.click(within(screen.getByTestId('row-a')).getByText('Bravo'))
    expect(onRowClick).toHaveBeenCalledTimes(1)
  })
})
