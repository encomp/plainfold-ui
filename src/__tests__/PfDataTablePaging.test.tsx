import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { useBreakpoint } from '../utils/useBreakpoint'
import { PfDataTable } from '../components/PfDataTable'
import type { PfDataTableProps } from '../components/PfDataTable'
import { pageRows, PF_PAGE_SIZES } from '../components/pageRows'

vi.mock('../utils/useBreakpoint', () => ({
  useBreakpoint: vi.fn(() => 'desktop'),
  BREAKPOINTS: { mobile: 0, tablet: 768, desktop: 1024 },
}))

interface Order { id: string; n: number; grp?: string }
// n runs backwards so a whole-list sort visibly differs from page order
const mk = (count: number): Order[] =>
  Array.from({ length: count }, (_, i) => ({ id: `o${i + 1}`, n: count - i }))
const columns = [
  { id: 'id', header: 'Order', cell: (r: Order) => r.id },
  { id: 'n', header: 'Qty', kind: 'number' as const, cell: (r: Order) => r.n, sortValue: (r: Order) => r.n },
]
const table = (props: Partial<PfDataTableProps<Order>> = {}) => (
  <PfDataTable<Order> rows={mk(3)} columns={columns} getRowId={(r) => r.id} data-testid="tbl"
    rowTestId={(r) => `row-${r.id}`} aria-label="Orders" {...props} />
)
const setup = (props: Partial<PfDataTableProps<Order>> = {}) => render(table(props))
const rowCount = () => screen.queryAllByTestId(/^row-/).length
const next = () => fireEvent.click(screen.getByRole('button', { name: 'Next' }))

beforeEach(() => { vi.mocked(useBreakpoint).mockReturnValue('desktop') })
afterEach(() => { vi.useRealTimers() })

describe('client paging', () => {
  it('a full list of 40 pages by 25 on its own', () => {
    setup({ rows: mk(40) })
    expect(rowCount()).toBe(25)
    expect(screen.getByText('Showing 1–25 of 40')).toBeInTheDocument()
    expect((screen.getByRole('combobox', { name: 'Rows per page' }) as HTMLSelectElement).value).toBe('25')
    next()
    expect(rowCount()).toBe(15)
    expect(screen.getByText('Showing 26–40 of 40')).toBeInTheDocument()
  })

  it('15 rows: no pager; 16 rows: pager', () => {
    const { rerender } = setup({ rows: mk(15) })
    expect(screen.queryByRole('navigation')).toBeNull()
    rerender(table({ rows: mk(16) }))
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('20 rows shows "Showing 1–20 of 20" and Rows per page', () => {
    setup({ rows: mk(20) })
    expect(screen.getByText('Showing 1–20 of 20')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Rows per page' })).toBeInTheDocument()
  })

  it('the size list is 15/25/50/75/100', () => {
    expect(PF_PAGE_SIZES).toEqual([15, 25, 50, 75, 100])
    setup({ rows: mk(40) })
    const opts = screen.getAllByRole('option').map((o) => o.textContent)
    expect(opts).toEqual(['15', '25', '50', '75', '100'])
  })

  it('changing size goes to page 1', () => {
    setup({ rows: mk(80) })
    next()
    fireEvent.change(screen.getByRole('combobox', { name: 'Rows per page' }), { target: { value: '15' } })
    expect(rowCount()).toBe(15)
    expect(screen.getByText('Showing 1–15 of 80')).toBeInTheDocument()
  })

  it('a server-paged table (page+total) is not client-paged and shows its rows as given', () => {
    setup({ rows: mk(40), page: 1, total: 400, pageSize: 50, onPageChange: vi.fn() })
    expect(rowCount()).toBe(40)
  })

  it('loadMore tables are not client-paged', () => {
    setup({ rows: mk(40), loadMore: { hasMore: true, onLoadMore: vi.fn() } })
    expect(rowCount()).toBe(40)
    expect(screen.queryByRole('navigation')).toBeNull()
  })

  it('paging={false} shows every row and no pager', () => {
    setup({ rows: mk(40), paging: false })
    expect(rowCount()).toBe(40)
    expect(screen.queryByRole('navigation')).toBeNull()
  })

  it('sort covers the whole list, then pages', () => {
    setup({ rows: mk(40) })
    fireEvent.click(screen.getByRole('button', { name: /Qty/ }))
    // number columns sort desc first; click again for asc
    fireEvent.click(screen.getByRole('button', { name: /Qty/ }))
    const shown = screen.getAllByTestId(/^row-/).map((r) => r.getAttribute('data-testid'))
    expect(shown[0]).toBe('row-o40')
    expect(shown).toHaveLength(25)
    expect(shown).toContain('row-o16')
    expect(shown).not.toContain('row-o15')
  })

  it('a sort change goes to page 1', () => {
    setup({ rows: mk(40) })
    next()
    fireEvent.click(screen.getByRole('button', { name: /Qty/ }))
    expect(screen.getByText('Showing 1–25 of 40')).toBeInTheDocument()
  })

  it('client page past the end after rows shrink lands on the last page', () => {
    const { rerender } = setup({ rows: mk(60) })
    next(); next()
    expect(screen.getByText('Page 3 of 3')).toBeInTheDocument()
    rerender(table({ rows: mk(30) }))
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
    expect(rowCount()).toBe(5)
  })

  it('selection survives Next, and select all selects the whole list as "Select all 63"', () => {
    const onChange = vi.fn()
    const sel = (ids: string[]) => ({ selectedIds: new Set(ids), onChange, label: (r: Order) => `Pick ${r.id}` })
    const { rerender } = setup({ rows: mk(63), selection: sel(['o1']) })
    next()
    expect(screen.getByText('1 selected')).toBeInTheDocument()
    rerender(table({ rows: mk(63), selection: sel(['o1']) }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all 63' }))
    expect(onChange.mock.calls[0][0].size).toBe(63)
  })

  it('groupBy never splits a group', () => {
    const rows = mk(30).map((r, i) => ({ ...r, grp: i < 20 ? 'A' : 'B' }))
    setup({ rows, groupBy: (r) => ({ id: r.grp!, label: `Group ${r.grp}` }), pageSize: 15 })
    expect(rowCount()).toBe(20)
    expect(screen.getByText('Showing 1\u201320 of 30')).toBeInTheDocument()
    next()
    expect(rowCount()).toBe(10)
  })

  it('phone card view pages the same way', () => {
    vi.mocked(useBreakpoint).mockReturnValue('mobile')
    setup({ rows: mk(40) })
    expect(rowCount()).toBe(25)
    next()
    expect(rowCount()).toBe(15)
  })
})

describe('pager rule for server paging', () => {
  const server = { page: 1, pageSize: 25, pageSizeOptions: [15, 25], onPageSizeChange: vi.fn(), onPageChange: vi.fn() }
  it('page 1, total 20, pageSize 25 shows the pager', () => {
    setup({ ...server, total: 20 })
    expect(screen.getByText('Showing 1–20 of 20')).toBeInTheDocument()
  })
  it('total 15 hides it', () => {
    setup({ ...server, total: 15 })
    expect(screen.queryByRole('navigation')).toBeNull()
  })
})

describe('default loading look', () => {
  it('loading with no rows shows header plus 8 bone rows, no pager', () => {
    vi.useFakeTimers()
    const { container } = setup({ rows: [], loading: true })
    expect(container.querySelector('[data-pf-bone]')).toBeNull() // nothing for the first 250 ms
    act(() => { vi.advanceTimersByTime(260) })
    expect(screen.getByRole('status', { name: 'Loading Orders' })).toBeInTheDocument()
    expect(screen.getByText('Qty')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-pf-bone]')).toHaveLength(8 * columns.length)
    expect(screen.queryByRole('navigation')).toBeNull()
  })

  it('loading with rows on screen dims them and shows no bones', () => {
    vi.useFakeTimers()
    const { container } = setup({ rows: mk(5), loading: true })
    act(() => { vi.advanceTimersByTime(600) })
    expect(container.querySelector('[data-pf-bone]')).toBeNull()
    const wrap = screen.getByTestId('tbl').parentElement as HTMLElement
    expect(wrap.style.opacity).toBe('0.5')
    expect(wrap).toHaveAttribute('aria-busy', 'true')
  })

  it('empty and not loading shows emptyState, not bones', () => {
    vi.useFakeTimers()
    const { container } = setup({ rows: [], emptyState: <p>Nothing here</p> })
    act(() => { vi.advanceTimersByTime(600) })
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
    expect(container.querySelector('[data-pf-bone]')).toBeNull()
  })
})

describe('skeleton minimum and controlled sort', () => {
  it('bones stay 300 ms once shown, then the empty state replaces them', () => {
    vi.useFakeTimers()
    const { container, rerender } = setup({ rows: [], loading: true, emptyState: <p>Nothing here</p> })
    act(() => { vi.advanceTimersByTime(250) })
    expect(container.querySelector('[data-pf-bone]')).not.toBeNull()
    act(() => { vi.advanceTimersByTime(50) })
    rerender(table({ rows: [], loading: false, emptyState: <p>Nothing here</p> }))
    expect(container.querySelector('[data-pf-bone]')).not.toBeNull()
    expect(screen.queryByText('Nothing here')).toBeNull()
    act(() => { vi.advanceTimersByTime(260) })
    expect(container.querySelector('[data-pf-bone]')).toBeNull()
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('a controlled sort change on a client-paged table goes to page 1', () => {
    const cols = [{ ...columns[1], sortable: true }]
    const onSortChange = vi.fn()
    setup({ rows: mk(40), columns: cols, sort: null, onSortChange })
    next()
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Qty/ }))
    expect(onSortChange).toHaveBeenCalled()
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
  })
})

describe('client paging with a parent-owned size', () => {
  it('changing Rows per page calls onPageSizeChange with the new size', () => {
    const onPageSizeChange = vi.fn()
    setup({ rows: mk(80), onPageSizeChange })
    fireEvent.change(screen.getByRole('combobox', { name: 'Rows per page' }), { target: { value: '50' } })
    expect(onPageSizeChange).toHaveBeenCalledWith(50)
    expect(rowCount()).toBe(50)
  })

  it('a parent that re-renders with a new pageSize shows that size', () => {
    const { rerender } = setup({ rows: mk(80), pageSize: 25 })
    expect(rowCount()).toBe(25)
    rerender(table({ rows: mk(80), pageSize: 50 }))
    expect(rowCount()).toBe(50)
    expect((screen.getByRole('combobox', { name: 'Rows per page' }) as HTMLSelectElement).value).toBe('50')
  })
})

describe('pageRows', () => {
  it('chunks by size', () => {
    expect(pageRows([1, 2, 3, 4, 5], 2).map((p) => p.length)).toEqual([2, 2, 1])
  })
  it('runs over the size to finish a group', () => {
    const rows = ['a', 'a', 'a', 'b', 'b', 'c']
    expect(pageRows(rows, 2, (r) => r)).toEqual([['a', 'a', 'a'], ['b', 'b'], ['c']])
  })
})
