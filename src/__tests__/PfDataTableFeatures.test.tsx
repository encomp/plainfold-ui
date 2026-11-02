import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, within, fireEvent } from '@testing-library/react'
import { useBreakpoint } from '../utils/useBreakpoint'
import { PfDataTable } from '../components/PfDataTable'
import type { PfDataTableProps } from '../components/PfDataTable'

vi.mock('../utils/useBreakpoint', () => ({
  useBreakpoint: vi.fn(() => 'desktop'),
  BREAKPOINTS: { mobile: 0, tablet: 768, desktop: 1024 },
}))

interface Row { id: string; name: string; grp?: string; locked?: boolean }
const mk = (n: number, start = 1): Row[] =>
  Array.from({ length: n }, (_, i) => ({ id: `r${start + i}`, name: `Name ${start + i}` }))

const columns = [
  { id: 'name', header: 'Name', cell: (r: Row) => <a href={`#${r.id}`}>{r.name}</a> },
]

function table(props: Partial<PfDataTableProps<Row>> = {}) {
  return (
    <PfDataTable<Row>
      rows={mk(3)}
      columns={columns}
      getRowId={(r) => r.id}
      data-testid="tbl"
      rowTestId={(r) => `row-${r.id}`}
      {...props}
    />
  )
}
const setup = (props: Partial<PfDataTableProps<Row>> = {}) => render(table(props))

beforeEach(() => {
  vi.mocked(useBreakpoint).mockReturnValue('desktop')
})

describe('selection', () => {
  const sel = (ids: string[], onChange = vi.fn(), extra = {}) => ({
    selectedIds: new Set(ids), onChange, label: (r: Row) => `Select ${r.name}`, ...extra,
  })
  const all = () => screen.getByRole('checkbox', { name: 'Select all' }) as HTMLInputElement

  it('renders a checkbox per row with the caller label', () => {
    setup({ selection: sel(['r2']) })
    expect(screen.getByRole('checkbox', { name: 'Select Name 1' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Select Name 2' })).toBeChecked()
  })

  it('row toggle adds and removes one id', () => {
    const onChange = vi.fn()
    setup({ selection: sel(['r2'], onChange) })
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Name 1' }))
    expect(Array.from(onChange.mock.calls[0][0])).toEqual(['r2', 'r1'])
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Name 2' }))
    expect(Array.from(onChange.mock.calls[1][0])).toEqual([])
  })

  it('select-all selects every selectable row', () => {
    const onChange = vi.fn()
    setup({ selection: sel([], onChange) })
    fireEvent.click(all())
    expect(Array.from(onChange.mock.calls[0][0]).sort()).toEqual(['r1', 'r2', 'r3'])
  })

  it('is checked when all are selected and toggle-off keeps other pages ids', () => {
    const onChange = vi.fn()
    setup({ selection: sel(['r1', 'r2', 'r3', 'other'], onChange) })
    expect(all()).toBeChecked()
    fireEvent.click(all())
    expect(Array.from(onChange.mock.calls[0][0])).toEqual(['other'])
  })

  it('is indeterminate when partial', () => {
    setup({ selection: sel(['r1']) })
    expect(all().indeterminate).toBe(true)
    expect(all()).not.toBeChecked()
  })

  it('cap 3 with 5 rows selects 3 and shows the limit message', () => {
    const onChange = vi.fn()
    const { rerender } = setup({ rows: mk(5), selection: sel([], onChange, { cap: 3 }) })
    fireEvent.click(all())
    expect(Array.from(onChange.mock.calls[0][0])).toEqual(['r1', 'r2', 'r3'])
    rerender(table({ rows: mk(5), selection: sel(['r1', 'r2', 'r3'], onChange, { cap: 3 }) }))
    expect(screen.getByRole('status')).toHaveTextContent('Limit of 3 reached')
    expect(screen.getByRole('checkbox', { name: 'Select Name 4' })).toBeDisabled()
    expect(screen.getByRole('checkbox', { name: 'Select Name 1' })).not.toBeDisabled()
  })

  it('at the cap, clicking the partial select-all clears this page', () => {
    const onChange = vi.fn()
    setup({ rows: mk(5), selection: sel(['r1', 'r2', 'r3'], onChange, { cap: 3 }) })
    fireEvent.click(all())
    expect(Array.from(onChange.mock.calls[0][0])).toEqual([])
  })

  it('ids selected on another page count against the cap', () => {
    const onChange = vi.fn()
    setup({ rows: mk(5), selection: sel(['x1', 'x2'], onChange, { cap: 3 }) })
    fireEvent.click(all())
    expect(Array.from(onChange.mock.calls[0][0])).toEqual(['x1', 'x2', 'r1'])
  })

  it('no limit message below the cap', () => {
    setup({ selection: sel(['r1'], vi.fn(), { cap: 3 }) })
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('zero selectable rows disables select-all', () => {
    setup({ selection: sel([], vi.fn(), { isSelectable: () => false }) })
    expect(all()).toBeDisabled()
  })

  it('unselectable rows have disabled checkboxes', () => {
    setup({ selection: sel([], vi.fn(), { isSelectable: (r: Row) => r.id !== 'r2' }) })
    expect(screen.getByRole('checkbox', { name: 'Select Name 2' })).toBeDisabled()
    expect(screen.getByRole('checkbox', { name: 'Select Name 1' })).not.toBeDisabled()
  })

  it('count bar shows only when something is selected', () => {
    const { rerender } = setup({ selection: sel([], vi.fn(), { bar: (n: number) => <b>bar {n}</b> }) })
    expect(screen.queryByText(/selected/)).toBeNull()
    rerender(table({ selection: sel(['r1', 'r2'], vi.fn(), { bar: (n: number) => <b>bar {n}</b> }) }))
    expect(screen.getByText('2 selected')).toBeInTheDocument()
    expect(screen.getByText('bar 2')).toBeInTheDocument()
  })

  it('test ids for checkboxes', () => {
    setup({ selection: sel([], vi.fn(), { testId: (r: Row) => `chk-${r.id}`, allTestId: 'chk-all' }) })
    expect(screen.getByTestId('chk-r1')).toBeInTheDocument()
    expect(screen.getByTestId('chk-all')).toBeInTheDocument()
  })

  it('selection works on cards, with select-all above', () => {
    vi.mocked(useBreakpoint).mockReturnValue('mobile')
    const onChange = vi.fn()
    setup({ selection: sel([], onChange) })
    fireEvent.click(within(screen.getByTestId('row-r1')).getByRole('checkbox', { name: 'Select Name 1' }))
    expect(Array.from(onChange.mock.calls[0][0])).toEqual(['r1'])
    fireEvent.click(all())
    expect(Array.from(onChange.mock.calls[1][0]).length).toBe(3)
  })
})

describe('row click, selected, dimmed', () => {
  it('row click fires, but not from links, buttons, inputs, labels', () => {
    const onRowClick = vi.fn()
    setup({
      onRowClick,
      columns: [
        ...columns,
        { id: 'x', header: 'X', cell: () => (
          <>
            <button>btn</button><input aria-label="inp" /><label>lab<input type="checkbox" /></label>
            <span>plain</span>
          </>
        ) },
      ],
    })
    const row = screen.getByTestId('row-r1')
    fireEvent.click(within(row).getByText('Name 1'))
    fireEvent.click(within(row).getByText('btn'))
    fireEvent.click(within(row).getByLabelText('inp'))
    fireEvent.click(within(row).getByText('lab'))
    expect(onRowClick).not.toHaveBeenCalled()
    fireEvent.click(within(row).getByText('plain'))
    expect(onRowClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'r1' }))
    fireEvent.click(row.querySelector('td') as HTMLElement)
    expect(onRowClick).toHaveBeenCalledTimes(2)
  })

  it('Enter on the first link fires onRowClick; other keys and other elements do not', () => {
    const onRowClick = vi.fn()
    setup({
      onRowClick,
      columns: [...columns, { id: 'x', header: 'X', cell: () => <button>second</button> }],
    })
    const row = screen.getByTestId('row-r2')
    fireEvent.keyDown(within(row).getByText('second'), { key: 'Enter' })
    fireEvent.keyDown(within(row).getByText('Name 2'), { key: 'a' })
    expect(onRowClick).not.toHaveBeenCalled()
    fireEvent.keyDown(within(row).getByText('Name 2'), { key: 'Enter' })
    expect(onRowClick).toHaveBeenCalledTimes(1)
    expect(onRowClick.mock.calls[0][0].id).toBe('r2')
  })

  it('adds no tab stops to rows', () => {
    setup({ onRowClick: vi.fn() })
    expect(screen.getByTestId('row-r1')).not.toHaveAttribute('tabindex')
  })

  it('selectedId gets data-selected and an accent outline', () => {
    setup({ selectedId: 'r2' })
    const row = screen.getByTestId('row-r2')
    expect(row).toHaveAttribute('data-selected', 'true')
    expect(row.style.outline).toContain('2px')
    expect(row.style.outline).toContain('--pf-accent')
    expect(screen.getByTestId('row-r1')).not.toHaveAttribute('data-selected')
  })

  it('isDimmed uses secondary text colour at full opacity', () => {
    setup({ isDimmed: (r) => r.id === 'r1', rowAttrs: (r) => ({ 'data-open': r.id === 'r3' ? 'true' : 'false' }) })
    const row = screen.getByTestId('row-r1')
    expect(row).toHaveAttribute('data-dimmed', 'true')
    expect(row.style.opacity).toBe('')
    expect(row.querySelector('td')!.style.color).toBe('var(--pf-text-secondary)')
    expect(screen.getByTestId('row-r2').querySelector('td')!.style.color).toBe('var(--pf-text-primary)')
    expect(screen.getByTestId('row-r3')).toHaveAttribute('data-open', 'true')
  })

  it('works on cards too', () => {
    vi.mocked(useBreakpoint).mockReturnValue('mobile')
    const onRowClick = vi.fn()
    setup({ onRowClick, selectedId: 'r1', isDimmed: (r) => r.id === 'r2' })
    fireEvent.click(screen.getByTestId('row-r3'))
    expect(onRowClick).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('row-r1')).toHaveAttribute('data-selected', 'true')
    expect(screen.getByTestId('row-r2')).toHaveAttribute('data-dimmed', 'true')
  })
})

describe('row menu', () => {
  const menu = (onSelect = vi.fn()) => (r: Row) =>
    r.id === 'r3' ? [] : [
      { id: 'a', label: 'Alpha', onSelect, testId: `alpha-${r.id}` },
      { id: 'b', label: 'Beta', onSelect: () => {} },
      { id: 'c', label: 'Gamma', onSelect: () => {} },
    ]
  const props = (onSelect = vi.fn()) => ({
    rowMenu: menu(onSelect), rowMenuTestId: (r: Row) => `menu-${r.id}`, popupTestId: 'popup',
  })
  const trigger = (id: string) => screen.getByTestId(`menu-${id}`)

  it('empty array renders no trigger; default label', () => {
    setup(props())
    expect(screen.queryByTestId('menu-r3')).toBeNull()
    expect(trigger('r1')).toHaveAttribute('aria-label', 'Row actions')
  })

  it('custom trigger label', () => {
    setup({ ...props(), rowMenuLabel: (r) => `Actions for ${r.name}` })
    expect(trigger('r1')).toHaveAttribute('aria-label', 'Actions for Name 1')
  })

  it('opens a menu of menuitems and focuses the first', () => {
    setup(props())
    fireEvent.click(trigger('r1'))
    expect(screen.getByRole('menu')).toHaveAttribute('data-testid', 'popup')
    expect(screen.getAllByRole('menuitem').map((m) => m.textContent)).toEqual(['Alpha', 'Beta', 'Gamma'])
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Alpha' }))
    expect(trigger('r1')).toHaveAttribute('aria-expanded', 'true')
  })

  it('Escape closes and returns focus to the trigger', () => {
    setup(props())
    fireEvent.click(trigger('r1'))
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Escape' })
    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(trigger('r1'))
  })

  it('outside click closes', () => {
    setup(props())
    fireEvent.click(trigger('r1'))
    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('arrow keys move between items and wrap', () => {
    setup(props())
    fireEvent.click(trigger('r1'))
    const key = (k: string) => fireEvent.keyDown(document.activeElement as HTMLElement, { key: k })
    key('ArrowDown')
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Beta' }))
    key('ArrowDown'); key('ArrowDown')
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Alpha' }))
    key('ArrowUp')
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Gamma' }))
  })

  it('item onSelect fires and closes; item testId applied; row click not fired', () => {
    const onSelect = vi.fn()
    const onRowClick = vi.fn()
    setup({ ...props(onSelect), onRowClick })
    fireEvent.click(trigger('r1'))
    fireEvent.click(screen.getByTestId('alpha-r1'))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).toBeNull()
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('a row removed while its menu is open leaves no orphan popup', () => {
    const { rerender } = setup(props())
    fireEvent.click(trigger('r1'))
    rerender(table({ ...props(), rows: mk(2, 2) }))
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('Enter on the row does not count the menu trigger as the first button', () => {
    const onRowClick = vi.fn()
    setup({ ...props(), onRowClick })
    fireEvent.keyDown(trigger('r1'), { key: 'Enter' })
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('menu on a card', () => {
    vi.mocked(useBreakpoint).mockReturnValue('mobile')
    setup(props())
    fireEvent.click(within(screen.getByTestId('row-r1')).getByTestId('menu-r1'))
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })
})

describe('detail rows', () => {
  it('renders a full-width row only for non-null, without a row testid', () => {
    setup({ renderDetail: (r) => (r.id === 'r2' ? <div>detail {r.id}</div> : null) })
    const detail = screen.getByText('detail r2').closest('tr') as HTMLElement
    expect(detail.previousElementSibling).toBe(screen.getByTestId('row-r2'))
    expect(detail.querySelector('td')).toHaveAttribute('colspan', '1')
    expect(detail.getAttribute('data-testid')).toBeNull()
    expect(document.querySelectorAll('[data-testid^=row-]').length).toBe(3)
  })

  it('colspan counts selection and menu columns', () => {
    setup({
      renderDetail: () => <div>d</div>,
      selection: { selectedIds: new Set(), onChange: () => {}, label: () => 'x' },
      rowMenu: () => [{ id: 'a', label: 'A', onSelect: () => {} }],
    })
    expect(screen.getAllByText('d')[0].closest('td')).toHaveAttribute('colspan', '3')
  })

  it('renders inside the card on phones', () => {
    vi.mocked(useBreakpoint).mockReturnValue('mobile')
    setup({ renderDetail: (r) => (r.id === 'r2' ? <div>detail</div> : null) })
    expect(within(screen.getByTestId('row-r2')).getByText('detail')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').length).toBe(3)
  })
})

describe('groups', () => {
  const rows: Row[] = [
    { id: 'r1', name: 'A', grp: 'g1' }, { id: 'r2', name: 'B', grp: 'g1' }, { id: 'r3', name: 'C', grp: 'g2' },
  ]
  const groupBy = (r: Row) => ({ id: r.grp!, label: `Group ${r.grp}` })

  it('consecutive rows share a tbody with a rowgroup heading', () => {
    setup({ rows, groupBy })
    const bodies = screen.getByTestId('tbl').querySelectorAll('tbody')
    expect(bodies.length).toBe(2)
    const th = bodies[0].querySelector('th[scope=rowgroup]') as HTMLElement
    expect(th.textContent).toBe('Group g1')
    expect(th).toHaveAttribute('colspan', '1')
    expect(bodies[0].querySelectorAll('[data-testid^=row-]').length).toBe(2)
    expect(bodies[1].querySelectorAll('[data-testid^=row-]').length).toBe(1)
    expect(th.closest('tr')!.getAttribute('data-testid')).toBeNull()
  })

  it('a repeated group id after another group starts a new tbody', () => {
    setup({ rows: [rows[0], rows[2], { id: 'r4', name: 'D', grp: 'g1' }], groupBy })
    expect(screen.getByTestId('tbl').querySelectorAll('tbody').length).toBe(3)
  })

  it('headings appear in card mode and listitems stay row cards', () => {
    vi.mocked(useBreakpoint).mockReturnValue('mobile')
    setup({ rows, groupBy })
    expect(screen.getAllByRole('heading').map((h) => h.textContent)).toEqual(['Group g1', 'Group g2'])
    expect(screen.getAllByRole('listitem').length).toBe(3)
  })
})

describe('server paging', () => {
  it('shows Page n of m with Previous and Next', () => {
    const onPageChange = vi.fn()
    setup({ page: 2, total: 31, pageSize: 10, onPageChange })
    expect(screen.getByText('Page 2 of 4')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }))
    expect(onPageChange).toHaveBeenLastCalledWith(1)
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(onPageChange).toHaveBeenLastCalledWith(3)
  })

  it('disables Previous on page 1 and Next on the last page', () => {
    const { rerender } = setup({ page: 1, total: 31, pageSize: 10, onPageChange: vi.fn() })
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled()
    rerender(table({ page: 4, total: 31, pageSize: 10, onPageChange: vi.fn() }))
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('is hidden with one page, and exact multiples do not add a page', () => {
    const { rerender } = setup({ page: 1, total: 10, pageSize: 10, onPageChange: vi.fn() })
    expect(screen.queryByText(/Page 1/)).toBeNull()
    rerender(table({ page: 1, total: 20, pageSize: 10, onPageChange: vi.fn() }))
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
  })

  it('keeps the table wrapper free of the pager', () => {
    setup({ page: 1, total: 30, pageSize: 10, onPageChange: vi.fn() })
    expect(screen.getByTestId('tbl').parentElement!.children.length).toBe(1)
  })
})

describe('load more', () => {
  it('no button when hasMore is false', () => {
    setup({ loadMore: { hasMore: false, onLoadMore: vi.fn() } })
    expect(screen.queryByRole('button', { name: 'Load more' })).toBeNull()
  })

  it('click loads more; disabled while loading', () => {
    const onLoadMore = vi.fn()
    const { rerender } = setup({ loadMore: { hasMore: true, onLoadMore } })
    fireEvent.click(screen.getByRole('button', { name: 'Load more' }))
    expect(onLoadMore).toHaveBeenCalledTimes(1)
    rerender(table({ loadMore: { hasMore: true, loading: true, onLoadMore } }))
    expect(screen.getByRole('button', { name: 'Load more' })).toBeDisabled()
  })

  it('stays available after an error so the caller can retry', () => {
    const onLoadMore = vi.fn()
    const { rerender } = setup({ loadMore: { hasMore: true, loading: true, onLoadMore } })
    rerender(table({ loadMore: { hasMore: true, loading: false, onLoadMore } }))
    fireEvent.click(screen.getByRole('button', { name: 'Load more' }))
    expect(onLoadMore).toHaveBeenCalledTimes(1)
    expect(screen.getAllByTestId(/^row-/).length).toBe(3)
  })

  it('shows on phones too', () => {
    vi.mocked(useBreakpoint).mockReturnValue('mobile')
    setup({ loadMore: { hasMore: true, onLoadMore: vi.fn() } })
    expect(screen.getByRole('button', { name: 'Load more' })).toBeInTheDocument()
  })
})
