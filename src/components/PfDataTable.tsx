import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useBreakpoint } from '../utils/useBreakpoint'
import {
  pfTableStyle,
  pfTableHeaderStyle,
  pfTableCellStyle,
  pfTableNumberStyle,
} from './tableStyles'

export type PfCellKind =
  | 'text' | 'link' | 'pill' | 'money' | 'number' | 'date' | 'stage' | 'checkbox' | 'actions'
export type PfSort = { id: string; dir: 'asc' | 'desc' }

export interface PfColumn<T> {
  id: string
  header: ReactNode
  kind?: PfCellKind
  /** null/undefined/'' renders an em dash */
  cell: (row: T) => ReactNode
  /** client mode: presence makes the column sortable */
  sortValue?: (row: T) => string | number | Date | null
  /** controlled mode: the header is a sort button */
  sortable?: boolean
  /** default: number, money, date desc; others asc */
  firstDir?: 'asc' | 'desc'
  width?: string
  minWidth?: string
  srOnlyHeader?: boolean
  hideOnCard?: boolean
}

/**
 * Generic table (cards on phones). Sorting: client mode sorts by `sortValue`; passing
 * `onSortChange` switches to controlled (server) mode where the table never reorders.
 * On phones the "Sort by" select picks a column and uses that column's first direction
 * (`firstDir`, or desc for number/money/date, asc otherwise); there is no direction toggle.
 */
export interface PfDataTableProps<T> {
  rows: T[]
  columns: PfColumn<T>[]
  getRowId: (r: T) => string
  'data-testid'?: string
  rowTestId?: (r: T) => string
  'aria-label'?: string
  emptyState?: ReactNode
  loading?: boolean
  loadingState?: ReactNode
  /** Controlled when onSortChange is present (the table never reorders); otherwise the initial sort. */
  sort?: PfSort | null
  onSortChange?: (s: PfSort | null) => void
  /** phone only: replaces the card body */
  renderCard?: (r: T) => ReactNode
}

const EMPTY = '—'
const isNumeric = (c: { kind?: PfCellKind }) => c.kind === 'number' || c.kind === 'money'

function firstDirOf<T>(c: PfColumn<T>): 'asc' | 'desc' {
  if (c.firstDir) return c.firstDir
  return c.kind === 'number' || c.kind === 'money' || c.kind === 'date' ? 'desc' : 'asc'
}

function show(v: ReactNode): ReactNode {
  return v === null || v === undefined || v === '' ? EMPTY : v
}

type Scalar = string | number | Date | null

function scalar(v: Scalar | undefined): string | number | null {
  if (v === null || v === undefined) return null
  if (v instanceof Date) {
    const t = v.getTime()
    return Number.isNaN(t) ? null : t
  }
  if (typeof v === 'number' && Number.isNaN(v)) return null
  return v
}

function compare(a: string | number, b: string | number): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  // shortcut: plain localeCompare, no numeric collation ("a10" < "a2"), upgrade if a text column holds numbered names
  return String(a).localeCompare(String(b))
}

function sortRows<T>(rows: T[], col: PfColumn<T> | undefined, dir: 'asc' | 'desc'): T[] {
  if (!col?.sortValue) return rows
  const get = col.sortValue
  const keyed = rows.map((row, i) => ({ row, i, v: scalar(get(row)) }))
  const sign = dir === 'asc' ? 1 : -1
  keyed.sort((x, y) => {
    if (x.v === null && y.v === null) return x.i - y.i
    if (x.v === null) return 1 // nulls last in both directions
    if (y.v === null) return -1
    return sign * compare(x.v, y.v) || x.i - y.i
  })
  return keyed.map((k) => k.row)
}

const srOnly: CSSProperties = {
  position: 'absolute', width: 1, height: 1, margin: -1, padding: 0,
  overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0,
}

function Arrow({ dir, visible }: { dir: 'asc' | 'desc'; visible: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false"
      style={{ marginLeft: 4, flexShrink: 0, visibility: visible ? 'visible' : 'hidden' }}>
      <path d={dir === 'asc' ? 'M5 1 L9 8 L1 8 Z' : 'M5 9 L9 2 L1 2 Z'} fill="currentColor" />
    </svg>
  )
}

const sortButtonStyle: CSSProperties = {
  background: 'none',
  border: 0,
  padding: 0,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  font: 'inherit',
  color: 'inherit',
}

export function PfDataTable<T>({
  rows, columns, getRowId, 'data-testid': testId, rowTestId, 'aria-label': ariaLabel,
  emptyState, loading, loadingState, sort, onSortChange, renderCard,
}: PfDataTableProps<T>) {
  const bp = useBreakpoint()
  const controlled = onSortChange !== undefined
  const [innerSort, setInnerSort] = useState<PfSort | null>(sort ?? null)
  const current = controlled ? (sort ?? null) : innerSort

  const isSortable = (c: PfColumn<T>) => (controlled ? !!c.sortable : !!c.sortValue)
  const setSort = (s: PfSort | null) => {
    if (controlled) onSortChange?.(s)
    else setInnerSort(s)
  }
  const cycle = (c: PfColumn<T>) => {
    const first = firstDirOf(c)
    if (!current || current.id !== c.id) return setSort({ id: c.id, dir: first })
    if (current.dir === first) return setSort({ id: c.id, dir: first === 'asc' ? 'desc' : 'asc' })
    setSort(null)
  }

  if (rows.length === 0) {
    if (loading) {
      return (
        <>{loadingState ?? <div role="status" style={{ padding: 16, color: 'var(--pf-text-secondary)' }}>Loading...</div>}</>
      )
    }
    return <>{emptyState ?? null}</>
  }

  const sortCol = current ? columns.find((c) => c.id === current.id) : undefined
  const shown = !controlled && current && sortCol ? sortRows(rows, sortCol, current.dir) : rows
  const dimmed: CSSProperties = loading ? { opacity: 0.5 } : {}

  if (bp === 'mobile') {
    const sortCols = columns.filter(isSortable)
    const body = columns.filter((c) => c.kind !== 'checkbox' && !c.hideOnCard)
    const titleCol = body.find((c) => c.kind !== 'actions')
    const lines = body.filter((c) => c !== titleCol && c.kind !== 'actions')
    const actions = body.filter((c) => c.kind === 'actions')
    return (
      <>
        {sortCols.length > 0 && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
            fontSize: 13, color: 'var(--pf-text-secondary)' }}>
            Sort by
            <select
              value={current && sortCols.some((c) => c.id === current.id) ? current.id : ''}
              onChange={(e) => {
                const col = sortCols.find((c) => c.id === e.target.value)
                setSort(col ? { id: col.id, dir: firstDirOf(col) } : null)
              }}
              style={{ font: 'inherit', padding: '6px 8px', color: 'var(--pf-text-primary)',
                background: 'var(--pf-bg-surface)', border: '1px solid var(--pf-border)', borderRadius: 6 }}
            >
              <option value="">Default order</option>
              {sortCols.map((c) => (
                <option key={c.id} value={c.id}>{typeof c.header === 'string' ? c.header : c.id}</option>
              ))}
            </select>
          </label>
        )}
        <div role="list" data-testid={testId} aria-label={ariaLabel}
          style={{ display: 'flex', flexDirection: 'column', gap: 8, ...dimmed }}>
          {shown.map((r) => (
            <div key={getRowId(r)} role="listitem" data-testid={rowTestId?.(r)}
              style={{ border: '1px solid var(--pf-border)', borderRadius: 8, padding: 12,
                background: 'var(--pf-bg-surface)', color: 'var(--pf-text-primary)',
                overflowWrap: 'anywhere', minWidth: 0 }}>
              {renderCard ? renderCard(r) : (
                <>
                  {titleCol && (
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: lines.length ? 6 : 0 }}>
                      {show(titleCol.cell(r))}
                    </div>
                  )}
                  {lines.map((c) => (
                    <div key={c.id} style={{ fontSize: 14, marginTop: 2 }}>
                      <span style={{ color: 'var(--pf-text-secondary)' }}>{c.header}: </span>
                      <span>{show(c.cell(r))}</span>
                    </div>
                  ))}
                  {actions.map((c) => (
                    <div key={c.id} style={{ marginTop: 8 }}>{show(c.cell(r))}</div>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <div style={{ overflowX: 'auto', ...dimmed }}>
      <table style={pfTableStyle} data-testid={testId} aria-label={ariaLabel}>
        <thead>
          <tr>
            {columns.map((c) => {
              const sorted = current?.id === c.id && isSortable(c) ? current : null
              const label = c.srOnlyHeader ? <span style={srOnly}>{c.header}</span> : c.header
              return (
                <th key={c.id} scope="col"
                  aria-sort={sorted ? (sorted.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                  style={{ ...pfTableHeaderStyle, ...(isNumeric(c) ? { textAlign: 'right' } : {}),
                    width: c.width, minWidth: c.minWidth }}>
                  {isSortable(c) ? (
                    <button type="button" onClick={() => cycle(c)} style={sortButtonStyle}>
                      {label}
                      <Arrow dir={sorted?.dir ?? 'asc'} visible={!!sorted} />
                    </button>
                  ) : label}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {shown.map((r) => (
            <tr key={getRowId(r)} data-testid={rowTestId?.(r)}>
              {columns.map((c) => (
                <td key={c.id} style={{ ...pfTableCellStyle, ...(isNumeric(c) ? pfTableNumberStyle : {}) }}>
                  {show(c.cell(r))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
