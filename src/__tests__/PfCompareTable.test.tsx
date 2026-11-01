import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { PfCompareTable } from '../components/PfCompareTable'
import type { PfCompareRow } from '../components/PfCompareTable'

interface Col {
  id: string
  name: string
  score: number | null
  cost: number | null
  tag: string
}

const cols: Col[] = [
  { id: 'a', name: 'Alpha', score: 80, cost: 5, tag: 'x' },
  { id: 'b', name: 'Beta', score: 60, cost: 3, tag: 'x' },
]

const row = (over: Partial<PfCompareRow<Col>> = {}): PfCompareRow<Col> => ({
  id: 'score',
  label: 'Score',
  get: (c) => String(c.score),
  value: (c) => c.score,
  ...over,
})

function renderTable(rows: PfCompareRow<Col>[], columns: Col[] = cols, extra: object = {}) {
  return render(
    <PfCompareTable
      columns={columns}
      getColumnId={(c) => c.id}
      renderColumnHeader={(c) => c.name}
      rows={rows}
      data-testid="t"
      {...extra}
    />,
  )
}

describe('PfCompareTable', () => {
  it('renders a column header per column and cells from get()', () => {
    renderTable([row(), row({ id: 'cost', label: 'Cost', get: (c) => `$${c.cost}` })])
    expect(screen.getByRole('columnheader', { name: 'Alpha' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Beta' })).toBeInTheDocument()
    expect(screen.getByRole('rowheader', { name: 'Score' })).toBeInTheDocument()
    expect(screen.getByText('$5')).toBeInTheDocument()
    expect(screen.getByText('$3')).toBeInTheDocument()
    expect(screen.getByTestId('t')).toBeInTheDocument()
  })

  it('shows a group heading once per run of rows', () => {
    renderTable([
      row({ id: 'r1', label: 'R1', group: 'G1' }),
      row({ id: 'r2', label: 'R2', group: 'G1' }),
      row({ id: 'r3', label: 'R3', group: 'G2' }),
      row({ id: 'r4', label: 'R4', group: 'G1' }),
    ])
    expect(screen.getAllByText('G1')).toHaveLength(2)
    expect(screen.getAllByText('G2')).toHaveLength(1)
  })

  it('marks the max value as best, ties mark all, null is never best', () => {
    const c: Col[] = [
      { id: 'a', name: 'Alpha', score: 80, cost: null, tag: '' },
      { id: 'b', name: 'Beta', score: 80, cost: null, tag: '' },
      { id: 'c', name: 'Gamma', score: null, cost: null, tag: '' },
      { id: 'd', name: 'Delta', score: 60, cost: null, tag: '' },
    ]
    renderTable([row({ best: 'max' })], c)
    expect(screen.getAllByText('best')).toHaveLength(2)
  })

  it('best min marks the lowest', () => {
    renderTable([row({ best: 'min' })])
    const cells = screen.getAllByRole('cell')
    expect(within(cells[0]).queryByText('best')).toBeNull()
    expect(within(cells[1]).getByText('best')).toBeInTheDocument()
  })

  it('never highlights without best or value', () => {
    renderTable([row(), row({ id: 'n', best: 'max', value: undefined })])
    expect(screen.queryByText('best')).toBeNull()
  })

  it('adds fails text for a bad tone only', () => {
    renderTable([row({ tone: (c) => (c.score === 60 ? 'bad' : 'ok') })])
    expect(screen.getAllByText('fails')).toHaveLength(1)
    expect(within(screen.getAllByRole('cell')[1]).getByText('fails')).toBeInTheDocument()
  })

  it('onlyDifferences hides equal rows, keeps a row with one null among numbers and rows without value()', () => {
    const c: Col[] = [
      { id: 'a', name: 'Alpha', score: 1, cost: 2, tag: 'x' },
      { id: 'b', name: 'Beta', score: 1, cost: null, tag: 'x' },
    ]
    renderTable(
      [
        row({ id: 'same', label: 'Same', value: (x) => x.tag }),
        row({ id: 'nulls', label: 'Nulls', value: () => null }),
        row({ id: 'cost', label: 'Cost', value: (x) => x.cost }),
        row({ id: 'nov', label: 'NoValue', value: undefined }),
      ],
      c,
      { onlyDifferences: true },
    )
    expect(screen.queryByRole('rowheader', { name: 'Same' })).toBeNull()
    expect(screen.queryByRole('rowheader', { name: 'Nulls' })).toBeNull()
    expect(screen.getByRole('rowheader', { name: 'Cost' })).toBeInTheDocument()
    expect(screen.getByRole('rowheader', { name: 'NoValue' })).toBeInTheDocument()
  })

  it('onlyDifferences with one column hides nothing', () => {
    renderTable([row(), row({ id: 'c', label: 'Cost' })], [cols[0]], { onlyDifferences: true })
    expect(screen.getByRole('rowheader', { name: 'Score' })).toBeInTheDocument()
    expect(screen.getByRole('rowheader', { name: 'Cost' })).toBeInTheDocument()
  })

  it('shows emptyState for zero columns', () => {
    renderTable([row()], [], { emptyState: <p>Nothing to compare</p> })
    expect(screen.getByText('Nothing to compare')).toBeInTheDocument()
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('scroll container is focusable and named with the table', () => {
    renderTable([row()], cols, { 'aria-label': 'Alpha vs Beta' })
    const region = screen.getByRole('region', { name: 'Alpha vs Beta' })
    expect(region.tabIndex).toBe(0)
    expect(region.getAttribute('aria-label')).toBe('Alpha vs Beta')
    const table = screen.getByRole('table')
    expect(table.hasAttribute('aria-label')).toBe(false)
  })

  it('without aria-label the scroll container is not a focusable region', () => {
    renderTable([row()], cols)
    expect(screen.queryByRole('region')).toBeNull()
    const table = screen.getByRole('table')
    const wrap = table.parentElement as HTMLElement
    expect(wrap.hasAttribute('tabindex')).toBe(false)
    expect(wrap.hasAttribute('role')).toBe(false)
  })

  it('treats NaN as null for differences', () => {
    renderTable([row({ id: 'n', label: 'Ratio', value: () => NaN })], cols, { onlyDifferences: true })
    expect(screen.queryByRole('rowheader', { name: 'Ratio' })).toBeNull()
  })

  it('empty group draws no heading row', () => {
    renderTable([row({ group: '' })])
    expect(screen.queryByRole('rowheader', { name: '' })).toBeNull()
    expect(screen.getAllByRole('rowheader')).toHaveLength(1)
  })

  it('shows emptyState when onlyDifferences hides every row', () => {
    renderTable([row({ value: () => 1 })], cols, { onlyDifferences: true, emptyState: <p>No differences</p> })
    expect(screen.getByText('No differences')).toBeInTheDocument()
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('no best in an all-equal row or with a single valid number', () => {
    renderTable([row({ best: 'max', value: () => 5 })])
    expect(screen.queryByText('best')).toBeNull()
    renderTable([row({ id: 'one', best: 'max' })], [cols[0]])
    expect(screen.queryByText('best')).toBeNull()
  })

  it('a bad cell that is also best has no best label or bold', () => {
    renderTable([row({ best: 'max', tone: (c) => (c.score === 80 ? 'bad' : 'neutral') })])
    const cell = screen.getAllByRole('cell')[0]
    expect(within(cell).queryByText('best')).toBeNull()
    expect(within(cell).getByText('fails')).toBeInTheDocument()
    expect(cell.style.fontWeight).toBe('')
  })

  it('ok and warn tones carry text cues', () => {
    renderTable([row({ tone: (c) => (c.score === 80 ? 'ok' : 'warn') })])
    expect(screen.getByText('ok')).toBeInTheDocument()
    expect(screen.getByText('warning')).toBeInTheDocument()
  })

  it('hides a group with no differing rows under onlyDifferences, groups use rowgroup scope', () => {
    renderTable(
      [
        row({ id: 's', label: 'Same', group: 'Hidden', value: () => 1 }),
        row({ id: 'd', label: 'Diff', group: 'Shown' }),
      ],
      cols,
      { onlyDifferences: true },
    )
    expect(screen.queryByText('Hidden')).toBeNull()
    expect(screen.getByText('Shown')).toHaveAttribute('scope', 'rowgroup')
  })

  it('first column is sticky', () => {
    renderTable([row()])
    const th = screen.getByRole('rowheader', { name: 'Score' })
    expect(th.style.position).toBe('sticky')
    expect(th.style.left).toBe('0px')
  })

  it('keeps columns readable and scrolls inside its container when narrow', () => {
    const { container } = render(
      <PfCompareTable
        columns={cols}
        getColumnId={(c) => c.id}
        renderColumnHeader={(c) => c.name}
        rows={[row()]}
        data-testid="t"
      />,
    )
    expect(screen.getByTestId('t').style.overflowX).toBe('auto')
    expect(screen.getByTestId('t').style.position).toBe('relative')
    const table = container.querySelector('table') as HTMLTableElement
    expect(table.style.minWidth).toBe(`${96 + 110 * cols.length}px`)
    expect(screen.getByRole('columnheader', { name: 'Alpha' }).style.minWidth).toBe('110px')
    const label = screen.getByRole('rowheader', { name: 'Score' })
    expect(label.style.minWidth).toBe('96px')
    expect(label.style.maxWidth).toBe('160px')
  })
})
