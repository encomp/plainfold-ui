import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, within, fireEvent } from '@testing-library/react'
import { useBreakpoint } from '../utils/useBreakpoint'
import { PfDataTable } from '../components/PfDataTable'
import type { PfColumn, PfSort } from '../components/PfDataTable'

vi.mock('../utils/useBreakpoint', () => ({
  useBreakpoint: vi.fn(() => 'desktop'),
  BREAKPOINTS: { mobile: 0, tablet: 768, desktop: 1024 },
}))

interface Row {
  id: string
  name: string | null
  count: number | null
  price: number | null
  when: Date | null
  note?: string
}

const rows: Row[] = [
  { id: 'a', name: 'Bravo', count: 5, price: 10, when: new Date('2026-01-02') },
  { id: 'b', name: 'alpha', count: 20, price: 2.5, when: new Date('2026-03-01') },
  { id: 'c', name: null, count: null, price: null, when: null },
  { id: 'd', name: 'Charlie', count: 5, price: 7, when: new Date('2025-12-31') },
]

const columns: PfColumn<Row>[] = [
  { id: 'name', header: 'Name', cell: (r) => r.name, sortValue: (r) => r.name },
  { id: 'count', header: 'Count', kind: 'number', cell: (r) => r.count, sortValue: (r) => r.count },
  { id: 'price', header: 'Price', kind: 'money', cell: (r) => r.price, sortValue: (r) => r.price },
  { id: 'when', header: 'When', kind: 'date', cell: (r) => r.when?.toISOString().slice(0, 10), sortValue: (r) => r.when },
  { id: 'plain', header: 'Plain', cell: (r) => r.note },
]

function setup(extra: Partial<React.ComponentProps<typeof PfDataTable<Row>>> = {}) {
  return render(
    <PfDataTable<Row>
      rows={rows}
      columns={columns}
      getRowId={(r) => r.id}
      data-testid="tbl"
      rowTestId={(r) => `row-${r.id}`}
      {...extra}
    />,
  )
}

const names = () =>
  Array.from(document.querySelectorAll('tbody tr')).map((tr) => tr.getAttribute('data-testid'))

beforeEach(() => {
  vi.mocked(useBreakpoint).mockReturnValue('desktop')
})

describe('PfDataTable core (desktop)', () => {
  it('renders a table with row testids and exact header text', () => {
    setup()
    const table = screen.getByTestId('tbl')
    expect(table.tagName).toBe('TABLE')
    const ths = table.querySelectorAll('thead th')
    expect(Array.from(ths).map((t) => t.textContent)).toEqual(['Name', 'Count', 'Price', 'When', 'Plain'])
    ths.forEach((t) => expect(t.getAttribute('scope')).toBe('col'))
    expect(names()).toEqual(['row-a', 'row-b', 'row-c', 'row-d'])
  })

  it('renders an em dash for null, undefined and empty cells', () => {
    setup({
      columns: [
        { id: 'n', header: 'N', cell: (r) => r.name },
        { id: 'e', header: 'E', cell: () => '' },
        { id: 'u', header: 'U', cell: () => undefined },
      ],
    })
    const cells = within(screen.getByTestId('row-c')).getAllByRole('cell')
    expect(cells.map((c) => c.textContent)).toEqual(['—', '—', '—'])
    expect(within(screen.getByTestId('row-a')).getAllByRole('cell')[0].textContent).toBe('Bravo')
  })

  it('does not render 0 as an em dash', () => {
    setup({ columns: [{ id: 'z', header: 'Z', cell: () => 0 }] })
    expect(within(screen.getByTestId('row-a')).getByRole('cell').textContent).toBe('0')
  })

  it('right-aligns number and money headers and cells', () => {
    setup()
    const ths = screen.getByTestId('tbl').querySelectorAll('thead th')
    expect((ths[1] as HTMLElement).style.textAlign).toBe('right')
    expect((ths[2] as HTMLElement).style.textAlign).toBe('right')
    expect((ths[0] as HTMLElement).style.textAlign).not.toBe('right')
    const cells = within(screen.getByTestId('row-a')).getAllByRole('cell')
    expect(cells[1].style.textAlign).toBe('right')
    expect(cells[1].style.fontVariantNumeric).toBe('tabular-nums')
    expect(cells[2].style.textAlign).toBe('right')
    expect(cells[0].style.textAlign).not.toBe('right')
  })

  it('puts the table directly inside an overflow-x:auto wrapper', () => {
    setup()
    const wrapper = screen.getByTestId('tbl').parentElement as HTMLElement
    expect(wrapper.style.overflowX).toBe('auto')
  })

  it('applies aria-label to the table', () => {
    setup({ 'aria-label': 'Things' })
    expect(screen.getByTestId('tbl')).toHaveAttribute('aria-label', 'Things')
  })

  it('applies width and minWidth to header cells', () => {
    setup({ columns: [{ id: 'n', header: 'N', cell: (r) => r.name, width: '120px', minWidth: '80px' }] })
    const th = screen.getByTestId('tbl').querySelector('th') as HTMLElement
    expect(th.style.width).toBe('120px')
    expect(th.style.minWidth).toBe('80px')
  })

  it('keeps a screen-reader-only header in the DOM', () => {
    setup({ columns: [{ id: 'n', header: 'Hidden', cell: (r) => r.name, srOnlyHeader: true }] })
    expect(screen.getByRole('columnheader', { name: 'Hidden' })).toBeInTheDocument()
  })

  it('renders emptyState and no table when there are no rows', () => {
    setup({ rows: [], emptyState: <p>Nothing here</p> })
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
    expect(screen.queryByTestId('tbl')).toBeNull()
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('renders nothing for empty rows without an emptyState', () => {
    const { container } = setup({ rows: [] })
    expect(container.innerHTML).toBe('')
  })

  it('shows a Loading status when loading without rows', () => {
    setup({ rows: [], loading: true, emptyState: <p>Nothing here</p> })
    expect(screen.getByRole('status')).toHaveTextContent('Loading...')
    expect(screen.queryByText('Nothing here')).toBeNull()
  })

  it('shows loadingState instead of the default when given', () => {
    setup({ rows: [], loading: true, loadingState: <p>Please wait</p> })
    expect(screen.getByText('Please wait')).toBeInTheDocument()
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('dims the wrapper to opacity .5 while loading with rows', () => {
    setup({ loading: true })
    expect((screen.getByTestId('tbl').parentElement as HTMLElement).style.opacity).toBe('0.5')
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('does not dim when not loading', () => {
    setup()
    expect((screen.getByTestId('tbl').parentElement as HTMLElement).style.opacity).not.toBe('0.5')
  })
})

describe('PfDataTable sorting (client mode)', () => {
  const header = (n: string) => screen.getByRole('columnheader', { name: n })
  const click = (n: string) => fireEvent.click(within(header(n)).getByRole('button'))

  it('only columns with sortValue get a sort button', () => {
    setup()
    expect(within(header('Name')).getByRole('button')).toBeInTheDocument()
    expect(within(header('Plain')).queryByRole('button')).toBeNull()
  })

  it('number column: first click desc, nulls last, ties keep input order', () => {
    setup()
    click('Count')
    expect(names()).toEqual(['row-b', 'row-a', 'row-d', 'row-c'])
    expect(header('Count')).toHaveAttribute('aria-sort', 'descending')
  })

  it('number column: second click asc, nulls still last', () => {
    setup()
    click('Count')
    click('Count')
    expect(names()).toEqual(['row-a', 'row-d', 'row-b', 'row-c'])
    expect(header('Count')).toHaveAttribute('aria-sort', 'ascending')
  })

  it('third click restores input order and clears aria-sort', () => {
    setup()
    click('Count')
    click('Count')
    click('Count')
    expect(names()).toEqual(['row-a', 'row-b', 'row-c', 'row-d'])
    expect(document.querySelectorAll('[aria-sort]').length).toBe(0)
  })

  it('text column: first click asc by localeCompare, nulls last', () => {
    setup()
    click('Name')
    expect(names()).toEqual(['row-b', 'row-a', 'row-d', 'row-c'])
    expect(header('Name')).toHaveAttribute('aria-sort', 'ascending')
    click('Name')
    expect(names()).toEqual(['row-d', 'row-a', 'row-b', 'row-c'])
  })

  it('date and money columns start desc', () => {
    setup()
    click('When')
    expect(names()).toEqual(['row-b', 'row-a', 'row-d', 'row-c'])
    click('Price')
    expect(names()).toEqual(['row-a', 'row-d', 'row-b', 'row-c'])
  })

  it('firstDir overrides the default', () => {
    setup({
      columns: [
        { id: 'count', header: 'Count', kind: 'number', cell: (r) => r.count, sortValue: (r) => r.count, firstDir: 'asc' },
        { id: 'name', header: 'Name', cell: (r) => r.name, sortValue: (r) => r.name, firstDir: 'desc' },
      ],
    })
    click('Count')
    expect(names()).toEqual(['row-a', 'row-d', 'row-b', 'row-c'])
    click('Name')
    expect(names()).toEqual(['row-d', 'row-a', 'row-b', 'row-c'])
  })

  it('aria-sort is only on the sorted header and moves with the sort', () => {
    setup()
    click('Name')
    click('Count')
    expect(document.querySelectorAll('[aria-sort]').length).toBe(1)
    expect(header('Count')).toHaveAttribute('aria-sort')
    expect(header('Name')).not.toHaveAttribute('aria-sort')
  })

  it('sort arrow is aria-hidden and adds no text', () => {
    setup()
    click('Count')
    const th = header('Count')
    expect(th.textContent).toBe('Count')
    const svg = th.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('sort buttons keep the default focus outline and are focusable', () => {
    setup()
    const btn = within(header('Count')).getByRole('button')
    expect(btn.style.outline).toBe('')
    expect(btn.style.cssText).not.toMatch(/outline|all:/)
    btn.focus()
    expect(document.activeElement).toBe(btn)
  })

  it('header cells have scope="col" and only sortable ones can carry aria-sort', () => {
    setup({ sort: { id: 'plain', dir: 'asc' } })
    screen.getAllByRole('columnheader').forEach((th) => expect(th).toHaveAttribute('scope', 'col'))
    expect(document.querySelectorAll('[aria-sort]').length).toBe(0)
  })

  it('reserves arrow space on every sortable header, hidden when unsorted', () => {
    setup()
    const svgs = (n: string) => header(n).querySelectorAll('svg')
    expect(svgs('Count').length).toBe(1)
    expect((svgs('Count')[0] as unknown as HTMLElement).style.visibility).toBe('hidden')
    expect(svgs('Plain').length).toBe(0)
    click('Count')
    expect((svgs('Count')[0] as unknown as HTMLElement).style.visibility).toBe('visible')
    expect(header('Count').textContent).toBe('Count')
  })

  it('sort control is a native button so Enter and Space activate it', () => {
    // jsdom does not synthesize click from keys; a native type=button gets this from the browser
    setup()
    const btn = within(header('Count')).getByRole('button')
    expect(btn.tagName).toBe('BUTTON')
    expect(btn).toHaveAttribute('type', 'button')
    expect(btn).not.toHaveAttribute('tabindex', '-1')
    expect(btn).not.toHaveAttribute('disabled')
  })

  it('does not mutate the rows prop', () => {
    const copy = [...rows]
    setup()
    click('Count')
    expect(rows).toEqual(copy)
  })

  it('uses an initial sort prop when uncontrolled', () => {
    setup({ sort: { id: 'count', dir: 'asc' } })
    expect(names()).toEqual(['row-a', 'row-d', 'row-b', 'row-c'])
  })
})

describe('PfDataTable sorting (controlled mode)', () => {
  const sortableCols: PfColumn<Row>[] = [
    { id: 'name', header: 'Name', cell: (r) => r.name, sortable: true },
    { id: 'count', header: 'Count', kind: 'number', cell: (r) => r.count, sortable: true },
    { id: 'plain', header: 'Plain', cell: (r) => r.note },
  ]

  it('calls onSortChange through the cycle and never reorders', () => {
    const onSortChange = vi.fn()
    const { rerender } = render(
      <PfDataTable<Row> rows={rows} columns={sortableCols} getRowId={(r) => r.id} data-testid="tbl"
        rowTestId={(r) => `row-${r.id}`} sort={null} onSortChange={onSortChange} />,
    )
    const btn = (n: string) => within(screen.getByRole('columnheader', { name: n })).getByRole('button')
    fireEvent.click(btn('Count'))
    expect(onSortChange).toHaveBeenLastCalledWith({ id: 'count', dir: 'desc' })
    expect(names()).toEqual(['row-a', 'row-b', 'row-c', 'row-d'])

    const s = (sort: PfSort | null) =>
      rerender(
        <PfDataTable<Row> rows={rows} columns={sortableCols} getRowId={(r) => r.id} data-testid="tbl"
          rowTestId={(r) => `row-${r.id}`} sort={sort} onSortChange={onSortChange} />,
      )
    s({ id: 'count', dir: 'desc' })
    expect(screen.getByRole('columnheader', { name: 'Count' })).toHaveAttribute('aria-sort', 'descending')
    fireEvent.click(btn('Count'))
    expect(onSortChange).toHaveBeenLastCalledWith({ id: 'count', dir: 'asc' })
    s({ id: 'count', dir: 'asc' })
    fireEvent.click(btn('Count'))
    expect(onSortChange).toHaveBeenLastCalledWith(null)
    s({ id: 'count', dir: 'desc' })
    fireEvent.click(btn('Name'))
    expect(onSortChange).toHaveBeenLastCalledWith({ id: 'name', dir: 'asc' })
    expect(names()).toEqual(['row-a', 'row-b', 'row-c', 'row-d'])
  })

  it('only sortable columns get buttons', () => {
    render(
      <PfDataTable<Row> rows={rows} columns={sortableCols} getRowId={(r) => r.id}
        sort={null} onSortChange={() => {}} />,
    )
    expect(within(screen.getByRole('columnheader', { name: 'Plain' })).queryByRole('button')).toBeNull()
  })
})

describe('PfDataTable phone cards', () => {
  beforeEach(() => {
    vi.mocked(useBreakpoint).mockReturnValue('mobile')
  })

  it('renders a list of cards, no table, with row testids', () => {
    setup()
    expect(screen.queryByRole('table')).toBeNull()
    const list = screen.getByTestId('tbl')
    expect(list).toHaveAttribute('role', 'list')
    const items = within(list).getAllByRole('listitem')
    expect(items.length).toBe(4)
    expect(items.map((i) => i.getAttribute('data-testid'))).toEqual(['row-a', 'row-b', 'row-c', 'row-d'])
  })

  it('default card: first column is the title, others are "label: value"', () => {
    setup()
    const card = screen.getByTestId('row-a')
    expect(card).toHaveTextContent('Bravo')
    expect(card).toHaveTextContent('Count: 5')
    expect(card).toHaveTextContent('Price: 10')
    expect(card).toHaveTextContent('When: 2026-01-02')
  })

  it('shows an em dash for null values', () => {
    setup()
    const card = screen.getByTestId('row-c')
    expect(card).toHaveTextContent('Count: —')
    expect(card).toHaveTextContent('Plain: —')
  })

  it('title skips checkbox and actions columns', () => {
    setup({
      columns: [
        { id: 'sel', header: 'Select', kind: 'checkbox', cell: () => <input type="checkbox" aria-label="pick" /> },
        { id: 'act', header: 'Actions', kind: 'actions', cell: () => <button>Go</button> },
        ...columns,
      ],
    })
    const card = screen.getByTestId('row-a')
    expect(card.firstElementChild).toHaveTextContent('Bravo')
    expect(card).not.toHaveTextContent('Select:')
    expect(card).not.toHaveTextContent('Actions:')
    expect(within(card).getByRole('button', { name: 'Go' })).toBeInTheDocument()
  })

  it('hideOnCard columns are left out', () => {
    setup({ columns: [...columns, { id: 'secret', header: 'Secret', cell: () => 'xyz', hideOnCard: true }] })
    expect(screen.getByTestId('row-a')).not.toHaveTextContent('Secret')
    expect(screen.getByTestId('row-a')).not.toHaveTextContent('xyz')
  })

  it('renderCard replaces the card body and keeps the wrapper testid', () => {
    setup({ renderCard: (r) => <span>custom {r.id}</span> })
    const card = screen.getByTestId('row-a')
    expect(card).toHaveAttribute('role', 'listitem')
    expect(card).toHaveTextContent('custom a')
    expect(card).not.toHaveTextContent('Count:')
  })

  it('empty and loading states are unchanged', () => {
    const { unmount } = setup({ rows: [], emptyState: <p>Nothing here</p> })
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
    expect(screen.queryByRole('list')).toBeNull()
    unmount()
    setup({ rows: [], loading: true })
    expect(screen.getByRole('status')).toHaveTextContent('Loading...')
  })

  it('dims the cards while loading with rows', () => {
    setup({ loading: true })
    expect(screen.getByTestId('tbl').style.opacity).toBe('0.5')
  })

  it('wraps long unbroken text', () => {
    const long = 'x'.repeat(200)
    setup({ rows: [{ id: 'l', name: long, count: 1, price: 1, when: null }] })
    const card = screen.getByTestId('row-l')
    expect(card.style.overflowWrap).toBe('anywhere')
    expect(card).toHaveTextContent(long)
  })

  it('Sort by select lists sortable columns plus Default order', () => {
    setup()
    const select = screen.getByLabelText('Sort by') as HTMLSelectElement
    expect(Array.from(select.options).map((o) => o.textContent)).toEqual([
      'Default order', 'Name', 'Count', 'Price', 'When',
    ])
    expect(select.value).toBe('')
  })

  it('Sort by select sorts cards in uncontrolled mode using firstDir', () => {
    setup()
    const select = screen.getByLabelText('Sort by')
    fireEvent.change(select, { target: { value: 'count' } })
    expect(names().length).toBe(0)
    const ids = () => screen.getAllByRole('listitem').map((i) => i.getAttribute('data-testid'))
    expect(ids()).toEqual(['row-b', 'row-a', 'row-d', 'row-c'])
    fireEvent.change(select, { target: { value: 'name' } })
    expect(ids()).toEqual(['row-b', 'row-a', 'row-d', 'row-c'])
    fireEvent.change(select, { target: { value: '' } })
    expect(ids()).toEqual(['row-a', 'row-b', 'row-c', 'row-d'])
  })

  it('Sort by select drives onSortChange in controlled mode', () => {
    const onSortChange = vi.fn()
    render(
      <PfDataTable<Row> rows={rows} data-testid="tbl" rowTestId={(r) => `row-${r.id}`}
        columns={[
          { id: 'name', header: 'Name', cell: (r) => r.name, sortable: true },
          { id: 'count', header: 'Count', kind: 'number', cell: (r) => r.count, sortable: true },
          { id: 'plain', header: 'Plain', cell: (r) => r.note },
        ]}
        getRowId={(r) => r.id} sort={{ id: 'name', dir: 'asc' }} onSortChange={onSortChange} />,
    )
    const select = screen.getByLabelText('Sort by') as HTMLSelectElement
    expect(select.value).toBe('name')
    expect(Array.from(select.options).map((o) => o.value)).toEqual(['', 'name', 'count'])
    fireEvent.change(select, { target: { value: 'count' } })
    expect(onSortChange).toHaveBeenLastCalledWith({ id: 'count', dir: 'desc' })
    fireEvent.change(select, { target: { value: '' } })
    expect(onSortChange).toHaveBeenLastCalledWith(null)
    expect(screen.getAllByRole('listitem').map((i) => i.getAttribute('data-testid'))).toEqual([
      'row-a', 'row-b', 'row-c', 'row-d',
    ])
  })

  it('no Sort by select when nothing is sortable', () => {
    setup({ columns: [{ id: 'p', header: 'Plain', cell: (r) => r.name }] })
    expect(screen.queryByLabelText('Sort by')).toBeNull()
  })
})
