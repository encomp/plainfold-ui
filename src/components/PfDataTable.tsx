import React, { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useBreakpoint } from '../utils/useBreakpoint'
import { PfRowMenu } from './PfRowMenu'
import type { PfRowMenuItem } from './PfRowMenu'
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

  /** Adds a leading checkbox column (and a select-all on phones). `selectedIds` may include ids from other pages. */
  selection?: {
    selectedIds: ReadonlySet<string>
    onChange(ids: Set<string>): void
    /** max selected ids, counted across pages */
    cap?: number
    isSelectable?(r: T): boolean
    label(r: T): string
    bar?: (count: number) => ReactNode
    testId?: (r: T) => string
    allTestId?: string
  }
  selectedId?: string | null
  onRowClick?: (r: T) => void
  /** dimmed rows use the secondary text colour at full opacity */
  isDimmed?: (r: T) => boolean
  rowAttrs?: (r: T) => Record<string, string>
  /** empty array = no trigger */
  rowMenu?: (r: T) => PfRowMenuItem[]
  rowMenuLabel?: (r: T) => string
  rowMenuTestId?: (r: T) => string
  popupTestId?: string
  /** full-width row after the row (inside the card on phones) */
  renderDetail?: (r: T) => ReactNode | null
  /** consecutive rows with one id share a group heading */
  groupBy?: (r: T) => { id: string; label: ReactNode }
  /** server numbered paging: `rows` is one page; hidden with a single page */
  page?: number
  onPageChange?: (p: number) => void
  total?: number
  pageSize?: number
  /** "Load more" button; the caller renders errors and keeps hasMore true to allow a retry */
  loadMore?: { hasMore: boolean; loading?: boolean; onLoadMore(): void }
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

const checkboxStyle: CSSProperties = { accentColor: 'var(--pf-accent)', width: 18, height: 18, cursor: 'pointer' }
const flatButton: CSSProperties = {
  font: 'inherit', fontSize: 14, padding: '6px 12px', cursor: 'pointer', color: 'var(--pf-text-primary)',
  background: 'var(--pf-bg-surface)', border: '1px solid var(--pf-border)', borderRadius: 6,
}

export function PfDataTable<T>({
  rows, columns, getRowId, 'data-testid': testId, rowTestId, 'aria-label': ariaLabel,
  emptyState, loading, loadingState, sort, onSortChange, renderCard,
  selection, selectedId, onRowClick, isDimmed, rowAttrs, rowMenu, rowMenuLabel, rowMenuTestId,
  popupTestId, renderDetail, groupBy, page, onPageChange, total, pageSize, loadMore,
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

  // selection
  const selIds = selection?.selectedIds
  const cap = selection?.cap ?? Infinity
  const atCap = !!selIds && selIds.size >= cap
  const selectable = selection ? rows.filter((r) => selection.isSelectable?.(r) ?? true) : []
  const pageSelected = selIds ? selectable.filter((r) => selIds.has(getRowId(r))) : []
  const allChecked = selectable.length > 0 && pageSelected.length === selectable.length
  const partial = pageSelected.length > 0 && !allChecked
  const allRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (allRef.current) allRef.current.indeterminate = partial
  })
  const toggleAll = () => {
    if (!selection || !selIds) return
    const next = new Set(selIds)
    const room = cap - selIds.size
    if (pageSelected.length > 0 && (allChecked || room <= 0)) {
      pageSelected.forEach((r) => next.delete(getRowId(r)))
    } else {
      for (const r of selectable) {
        if (next.size >= cap) break
        next.add(getRowId(r))
      }
    }
    selection.onChange(next)
  }
  const toggleRow = (r: T) => {
    if (!selection || !selIds) return
    const next = new Set(selIds)
    const id = getRowId(r)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    selection.onChange(next)
  }
  const selectAllBox = (extra?: CSSProperties) => (
    <input ref={allRef} type="checkbox" aria-label="Select all" data-testid={selection?.allTestId}
      checked={allChecked} disabled={selectable.length === 0 || (atCap && !allChecked && !partial)} onChange={toggleAll}
      style={{ ...checkboxStyle, ...extra }} />
  )
  const rowBox = (r: T) => {
    const checked = !!selIds?.has(getRowId(r))
    const disabled = !(selection?.isSelectable?.(r) ?? true) || (!checked && atCap)
    return (
      <input type="checkbox" aria-label={selection!.label(r)} data-testid={selection!.testId?.(r)}
        checked={checked} disabled={disabled} onChange={() => toggleRow(r)} style={checkboxStyle} />
    )
  }
  const selectionBar = selection && selIds && selIds.size > 0 && (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '8px 0',
      color: 'var(--pf-text-primary)', fontSize: 14 }}>
      <span>{selIds.size} selected</span>
      {selection.bar?.(selIds.size)}
    </div>
  )
  // always mounted so the live region announces when it fills
  const limitNote = selection && (
    <div role="status" style={{ fontSize: 13, color: 'var(--pf-text-secondary)', padding: atCap ? '4px 0' : 0 }}>
      {atCap ? `Limit of ${cap} reached` : null}
    </div>
  )

  // row behaviour
  const menuFor = (r: T) => {
    const items = rowMenu?.(r) ?? []
    if (!items.length) return null
    return (
      <PfRowMenu items={items} label={rowMenuLabel?.(r) ?? 'Row actions'}
        testId={rowMenuTestId?.(r)} popupTestId={popupTestId} />
    )
  }
  const rowProps = (r: T) => ({
    'data-testid': rowTestId?.(r),
    ...(selectedId != null && selectedId === getRowId(r)
      ? { 'data-selected': 'true' } : {}),
    ...(isDimmed?.(r) ? { 'data-dimmed': 'true' } : {}),
    ...(rowAttrs?.(r) ?? {}),
    onClick: onRowClick
      ? (e: React.MouseEvent<HTMLElement>) => {
          const t = e.target as Element
          const hit = t.closest?.('a, button, input, label, th, [role=menuitem], [data-pf-detail]')
          if (hit && e.currentTarget.contains(hit)) return
          onRowClick(r)
        }
      : undefined,
    onKeyDown: onRowClick
      ? (e: React.KeyboardEvent<HTMLElement>) => {
          if (e.key !== 'Enter') return
          const first = Array.from(
            e.currentTarget.querySelectorAll('a, button:not([data-pf-menu-trigger])'),
          ).find((el) => !el.closest('[data-pf-detail]'))
          if (first && e.target === first) onRowClick(r)
        }
      : undefined,
  })
  const selectedStyle = (r: T): CSSProperties =>
    selectedId != null && selectedId === getRowId(r)
      ? { outline: '2px solid var(--pf-accent-text, var(--pf-accent))', outlineOffset: -2 } : {}
  const cursor: CSSProperties = onRowClick ? { cursor: 'pointer' } : {}

  const pages = page !== undefined && total !== undefined && pageSize
    ? Math.max(1, Math.ceil(total / pageSize)) : 1
  // a page past the end (total shrank) still shows the pager so the user can go back
  const pager = page !== undefined && onPageChange && (pages > 1 || page > 1) && (
    <nav aria-label={ariaLabel ? `${ariaLabel} pagination` : 'Pagination'}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, padding: '12px 0', color: 'var(--pf-text-primary)', fontSize: 14 }}>
      <button type="button" style={flatButton} aria-disabled={page <= 1 || !!loading}
        onClick={() => { if (page > 1 && !loading) onPageChange(page - 1) }}>Previous</button>
      <span>Page {page} of {pages}</span>
      <button type="button" style={flatButton} aria-disabled={page >= pages || !!loading}
        onClick={() => { if (page < pages && !loading) onPageChange(page + 1) }}>Next</button>
    </nav>
  )
  // aria-disabled (not disabled) so a focused button keeps keyboard focus while loading
  const more = loadMore?.hasMore && (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
      <button type="button" style={flatButton} aria-disabled={!!loadMore.loading} aria-busy={!!loadMore.loading}
        onClick={() => { if (!loadMore.loading) loadMore.onLoadMore() }}>
        Load more
      </button>
    </div>
  )

  if (rows.length === 0) {
    if (loading) {
      return (
        <>{loadingState ?? <div role="status" style={{ padding: 16, color: 'var(--pf-text-secondary)' }}>Loading...</div>}</>
      )
    }
    return <>{emptyState ?? null}{pager}{more}</>
  }

  const sortCol = current ? columns.find((c) => c.id === current.id) : undefined
  const shown = !controlled && current && sortCol ? sortRows(rows, sortCol, current.dir) : rows
  const dimmed: CSSProperties = loading ? { opacity: 0.5 } : {}

  const groups: Array<{ id: string; label: ReactNode; rows: T[] }> = []
  for (const r of shown) {
    const g = groupBy?.(r)
    const last = groups[groups.length - 1]
    if (last && last.id === (g?.id ?? '')) last.rows.push(r)
    else groups.push({ id: g?.id ?? '', label: g?.label, rows: [r] })
  }

  if (bp === 'mobile') {
    const sortCols = columns.filter(isSortable)
    const body = columns.filter((c) => c.kind !== 'checkbox' && !c.hideOnCard)
    const titleCol = body.find((c) => c.kind !== 'actions')
    const lines = body.filter((c) => c !== titleCol && c.kind !== 'actions')
    const actions = body.filter((c) => c.kind === 'actions')
    const card = (r: T) => {
      const menu = menuFor(r)
      const detail = renderDetail?.(r)
      const dim = isDimmed?.(r)
      return (
        <div key={getRowId(r)} role="listitem" {...rowProps(r)}
          style={{ border: '1px solid var(--pf-border)', borderRadius: 8, padding: 12,
            background: 'var(--pf-bg-surface)', color: dim ? 'var(--pf-text-secondary)' : 'var(--pf-text-primary)',
            overflowWrap: 'anywhere', minWidth: 0, ...cursor, ...selectedStyle(r) }}>
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
          {(selection || menu) && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <span>{selection && rowBox(r)}</span>
              {menu}
            </div>
          )}
          {detail != null && <div data-pf-detail="" style={{ marginTop: 8 }}>{detail}</div>}
        </div>
      )
    }
    return (
      <>
        {selectionBar}
        {limitNote}
        {selection && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13,
            color: 'var(--pf-text-secondary)' }}>
            {selectAllBox()}
            <span aria-hidden="true">Select all</span>
          </label>
        )}
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
          {groupBy
            ? groups.map((g, i) => (
                <div key={`${g.id}:${i}`} role="listitem" style={{ minWidth: 0 }}>
                  <div role="heading" aria-level={3}
                    style={{ fontWeight: 600, fontSize: 13, color: 'var(--pf-text-secondary)', margin: '8px 0' }}>
                    {g.label}
                  </div>
                  <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {g.rows.map(card)}
                  </div>
                </div>
              ))
            : shown.map(card)}
        </div>
        {pager}
        {more}
      </>
    )
  }

  const colCount = columns.length + (selection ? 1 : 0) + (rowMenu ? 1 : 0)
  const renderRow = (r: T) => {
    const detail = renderDetail?.(r)
    const dim = isDimmed?.(r)
    const menu = menuFor(r)
    return (
      <React.Fragment key={getRowId(r)}>
        <tr {...rowProps(r)} style={{ ...cursor, ...selectedStyle(r) }}>
          {selection && (
            <td style={{ ...pfTableCellStyle, width: 36, ...(dim ? { color: 'var(--pf-text-secondary)' } : {}) }}>
              {rowBox(r)}
            </td>
          )}
          {columns.map((c) => (
            <td key={c.id} style={{ ...pfTableCellStyle, ...(isNumeric(c) ? pfTableNumberStyle : {}),
              color: dim ? 'var(--pf-text-secondary)' : 'var(--pf-text-primary)' }}>
              {show(c.cell(r))}
            </td>
          ))}
          {rowMenu && (
            <td style={{ ...pfTableCellStyle, width: 48, textAlign: 'right' }}>{menu}</td>
          )}
        </tr>
        {detail != null && (
          <tr>
            <td colSpan={colCount} style={pfTableCellStyle}>{detail}</td>
          </tr>
        )}
      </React.Fragment>
    )
  }

  return (
    <>
      {selectionBar}
      {limitNote}
      <div style={{ overflowX: 'auto', ...dimmed }}>
        <table style={pfTableStyle} data-testid={testId} aria-label={ariaLabel}>
          <thead>
            <tr>
              {selection && (
                <th scope="col" style={{ ...pfTableHeaderStyle, width: 36 }}>{selectAllBox()}</th>
              )}
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
              {rowMenu && (
                <th scope="col" style={pfTableHeaderStyle}><span style={srOnly}>Actions</span></th>
              )}
            </tr>
          </thead>
          {groups.map((g, i) => (
            <tbody key={`${g.id}:${i}`}>
              {groupBy && (
                <tr>
                  <th scope="rowgroup" colSpan={colCount}
                    style={{ ...pfTableHeaderStyle, background: 'var(--pf-bg-surface)' }}>{g.label}</th>
                </tr>
              )}
              {g.rows.map(renderRow)}
            </tbody>
          ))}
        </table>
      </div>
      {pager}
      {more}
    </>
  )
}
