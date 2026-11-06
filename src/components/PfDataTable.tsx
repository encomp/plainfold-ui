import React, { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useBreakpoint } from '../utils/useBreakpoint'
import { sortRows } from './sortRows'
import { pageRows, PF_PAGE_SIZES } from './pageRows'

// the smallest size is also the threshold: a list that fits one smallest page needs no pager
const PAGER_MIN = PF_PAGE_SIZES[0]
import { PfSkeleton, PfSkeletonRegion } from './PfSkeleton'
import { useSkeletonGate } from '../utils/useSkeletonGate'
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
  /** Adornment (e.g. a hint trigger) rendered in the `<th>` after, not inside, the sort button, and in the card label line. Not part of the sort button's name; may be interactive. */
  headerExtra?: ReactNode
  hideOnCard?: boolean
}

/**
 * Generic table (cards on phones). Sorting: client mode sorts by `sortValue`; passing
 * `onSortChange` switches to controlled (server) mode where the table never reorders.
 * On phones the "Sort by" select picks a column and uses that column's first direction
 * (`firstDir`, or desc for number/money/date, asc otherwise); Ascending/Descending buttons then flip it.
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
    /** disables select-all and announces this text as its description (e.g. rows locked while a job runs) */
    allDisabledReason?: string
  }
  /** omit the checkbox of rows `selection.isSelectable` rules out (cap-disabled boxes stay) */
  hideDisabledSelection?: boolean
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
  /** Without `page` or `loadMore` the table pages the full `rows` list itself (size 25, options PF_PAGE_SIZES); `false` shows every row. */
  paging?: false
  /** server numbered paging: `rows` is one page */
  page?: number
  onPageChange?: (p: number) => void
  total?: number
  pageSize?: number
  /** server paging: with `page`, `total` and `pageSize`, adds "Showing a–b of N" and a "Rows per page" select (needs `onPageSizeChange`); `pageSize` must be one of the options */
  pageSizeOptions?: number[]
  onPageSizeChange?: (n: number) => void
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

const BONE_WIDTHS = ['60%', '85%', '45%', '70%']

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

const checkboxStyle: CSSProperties = { accentColor: 'var(--pf-accent-text, var(--pf-accent))', width: 18, height: 18, cursor: 'pointer' }
const flatButton: CSSProperties = {
  font: 'inherit', fontSize: 14, padding: '6px 12px', cursor: 'pointer', color: 'var(--pf-text-primary)',
  background: 'var(--pf-bg-surface)', border: '1px solid var(--pf-border)', borderRadius: 6,
}

export function PfDataTable<T>({
  rows, columns, getRowId, 'data-testid': testId, rowTestId, 'aria-label': ariaLabel,
  emptyState, loading, loadingState, sort, onSortChange, renderCard,
  selection, selectedId, onRowClick, isDimmed, rowAttrs, rowMenu, rowMenuLabel, rowMenuTestId,
  popupTestId, renderDetail, groupBy, hideDisabledSelection, paging, page, onPageChange, total, pageSize, pageSizeOptions, onPageSizeChange, loadMore,
}: PfDataTableProps<T>) {
  const bp = useBreakpoint()
  const showBones = useSkeletonGate(!!loading, rows.length > 0)
  const controlled = onSortChange !== undefined
  const [innerSort, setInnerSort] = useState<PfSort | null>(sort ?? null)
  const current = controlled ? (sort ?? null) : innerSort

  const isSortable = (c: PfColumn<T>) => (controlled ? !!c.sortable : !!c.sortValue)
  const clientPaged = page === undefined && !loadMore && paging !== false
  const [clientPage, setClientPage] = useState(1)
  const [clientSize, setClientSize] = useState(25)
  const setSort = (s: PfSort | null) => {
    if (controlled) onSortChange?.(s)
    else setInnerSort(s)
    setClientPage(1)
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
  const reasonId = useId()
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
  // the whole list, not the page, so the count tells people how far "all" reaches
  const selectAllLabel = clientPaged && selectable.length > PAGER_MIN ? `Select all ${selectable.length}` : 'Select all'
  const allReason = selection?.allDisabledReason
  const selectAllReason = (style: CSSProperties) => allReason && <span id={reasonId} style={style}>{allReason}</span>
  const selectAllBox = (extra?: CSSProperties, reasonAfter = false) => (
    <>
      <input ref={allRef} type="checkbox" aria-label={selectAllLabel} data-testid={selection?.allTestId}
        checked={allChecked} onChange={toggleAll} aria-describedby={allReason ? reasonId : undefined} title={allReason}
        disabled={!!allReason || selectable.length === 0 || (atCap && !allChecked && !partial)}
        style={{ ...checkboxStyle, ...extra }} />
      {!reasonAfter && selectAllReason(srOnly)}
    </>
  )
  const rowBox = (r: T) => {
    if (hideDisabledSelection && !(selection?.isSelectable?.(r) ?? true)) return null
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
          const hit = t.closest?.('a, button, input, label, th, [role=menuitem], [role=button], [role=link], [tabindex]:not([tabindex="-1"]), [data-pf-detail]')
          if (hit && hit !== e.currentTarget && e.currentTarget.contains(hit)) return
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

  const sortCol = current ? columns.find((c) => c.id === current.id) : undefined
  const shown = !controlled && current && sortCol ? sortRows(rows, sortCol, current.dir) : rows
  // shortcut: re-slices on every render, fine for lists of a few thousand rows, memoise if a table holds far more
  // a parent-supplied pageSize wins, so a size store the parent owns stays the source of truth
  const clientPageSize = pageSize ?? clientSize
  const slices = clientPaged ? pageRows(shown, clientPageSize, groupBy && ((r) => groupBy(r).id)) : []
  // only a selection change moves the page, so manual paging is never overridden
  useEffect(() => {
    const at = slices.findIndex((sl) => sl.some((r) => getRowId(r) === selectedId))
    if (at >= 0) setClientPage(at + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])
  // the page clamps on read so a list that shrank lands on its last page
  const curPage = clientPaged ? Math.min(clientPage, Math.max(1, slices.length)) : page
  const visible = clientPaged ? (slices[curPage! - 1] ?? []) : shown
  const allTotal = clientPaged ? rows.length : total
  const size = clientPaged ? clientPageSize : pageSize
  const sizeOptions = clientPaged ? (pageSizeOptions ?? PF_PAGE_SIZES) : pageSizeOptions
  const changeSize = clientPaged ? (n: number) => { setClientSize(n); setClientPage(1); onPageSizeChange?.(n) } : onPageSizeChange
  const goTo = clientPaged ? setClientPage : onPageChange
  const offset = clientPaged ? slices.slice(0, curPage! - 1).reduce((n, s) => n + s.length, 0) : (page ?? 1) * (size ?? 0) - (size ?? 0)
  const pages = clientPaged ? Math.max(1, slices.length)
    : page !== undefined && total !== undefined && pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1
  // a page past the end (total shrank) still shows the pager so the user can go back
  const picker = !!sizeOptions && !!changeSize && size !== undefined && allTotal !== undefined
    && rows.length > 0
  const showPager = curPage !== undefined && goTo && (pages > 1 || curPage > 1
    || (picker && allTotal > PAGER_MIN))
  const pager = showPager && (
    <nav aria-label={ariaLabel ? `${ariaLabel} pagination` : 'Pagination'}
      style={{ display: 'flex', alignItems: 'center', justifyContent: picker ? 'space-between' : 'center',
        flexWrap: 'wrap', gap: 12, padding: '12px 0', color: 'var(--pf-text-primary)', fontSize: 14 }}>
      {picker && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--pf-text-secondary)' }}>
            Showing {offset + 1}–{clientPaged ? offset + visible.length : Math.min(offset + size, allTotal)} of {allTotal}
          </span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            Rows per page
            <select value={size} onChange={(e) => changeSize(Number(e.target.value))}
              style={{ font: 'inherit', padding: '6px 8px', color: 'var(--pf-text-primary)',
                background: 'var(--pf-bg-surface)', border: '1px solid var(--pf-border)', borderRadius: 6 }}>
              {sizeOptions.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        </div>
      )}
      {(pages > 1 || curPage > 1) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" style={flatButton} aria-disabled={curPage <= 1 || !!loading}
            onClick={() => { if (curPage > 1 && !loading) goTo(curPage - 1) }}>Previous</button>
          <span>Page {curPage} of {pages}</span>
          <button type="button" style={flatButton} aria-disabled={curPage >= pages || !!loading}
            onClick={() => { if (curPage < pages && !loading) goTo(curPage + 1) }}>Next</button>
        </div>
      )}
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

  // one header row for the table and its loading bones, so columns do not shift when rows arrive; the bones' copy is inert
  const colCount = columns.length + (selection ? 1 : 0) + (rowMenu ? 1 : 0)
  const boneRows = Math.min(size ?? 25, 8)
  const headRow = (live: boolean) => (
    <tr>
      {selection && (
        <th scope="col" style={{ ...pfTableHeaderStyle, width: 36 }}>{live && selectAllBox()}</th>
      )}
      {columns.map((c) => {
        const sorted = current?.id === c.id && isSortable(c) ? current : null
        const label = c.srOnlyHeader ? <span style={srOnly}>{c.header}</span> : c.header
        return (
          <th key={c.id} scope="col"
            aria-sort={sorted ? (sorted.dir === 'asc' ? 'ascending' : 'descending') : undefined}
            style={{ ...pfTableHeaderStyle, ...(isNumeric(c) ? { textAlign: 'right' } : {}),
              width: c.width, minWidth: c.minWidth }}>
            {isSortable(c) && live ? (
              <button type="button" onClick={() => cycle(c)} style={sortButtonStyle}>
                {label}
                <Arrow dir={sorted?.dir ?? 'asc'} visible={!!sorted} />
              </button>
            ) : isSortable(c) ? <span style={sortButtonStyle}>{label}<Arrow dir="asc" visible={false} /></span> : label}
            {c.headerExtra}
          </th>
        )
      })}
      {rowMenu && (
        <th scope="col" style={pfTableHeaderStyle}><span style={srOnly}>Actions</span></th>
      )}
    </tr>
  )

  if (rows.length === 0 || showBones) {
    if (rows.length === 0 && loadingState && loading) return <>{loadingState}</>
    // bones outlive `loading` by the gate's minimum, so arriving rows (or a quick empty result) do not flash
    if (showBones) {
      return (
        <PfSkeletonRegion label={ariaLabel ?? 'rows'}>
          {bp === 'mobile' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Array.from({ length: boneRows }, (_, i) => (
                <div key={i} style={{ border: '1px solid var(--pf-border)', borderRadius: 8, padding: 12, background: 'var(--pf-bg-surface)' }}>
                  <PfSkeleton.CardBody />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={pfTableStyle}>
                <thead>{headRow(false)}</thead>
                <tbody>
                  {Array.from({ length: boneRows }, (_, r) => (
                    <tr key={r}>
                      {Array.from({ length: colCount }, (_, c) => (
                        <td key={c} style={pfTableCellStyle}><PfSkeleton.Line width={BONE_WIDTHS[(r + c) % BONE_WIDTHS.length]} /></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PfSkeletonRegion>
      )
    }
    if (loading) return null
    return <>{emptyState ?? null}{pager}{more}</>
  }

  const dimmed: CSSProperties = loading ? { opacity: 0.5 } : {}

  const groups: Array<{ id: string; label: ReactNode; rows: T[] }> = []
  for (const r of visible) {
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
                  <span style={{ color: 'var(--pf-text-secondary)' }}>{c.header}</span>
                  {c.headerExtra}
                  <span style={{ color: 'var(--pf-text-secondary)' }}>: </span>
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
            {selectAllBox(undefined, true)}
            <span aria-hidden="true">{selectAllLabel}</span>
            {selectAllReason({})}
          </label>
        )}
        {sortCols.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap',
            fontSize: 13, color: 'var(--pf-text-secondary)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
            {current && sortCols.some((c) => c.id === current.id) && (
            <div role="group" aria-label="Sort direction" style={{ display: 'flex', gap: 8 }}>
            {(['asc', 'desc'] as const).map((d) => (
              <button key={d} type="button" aria-pressed={current.dir === d}
                onClick={() => setSort({ id: current.id, dir: d })}
                style={{ ...flatButton, fontSize: 13, minHeight: 40, ...(current.dir === d
                  ? { borderColor: 'var(--pf-accent-text, var(--pf-accent))', fontWeight: 600 } : {}) }}>
                {d === 'asc' ? 'Ascending' : 'Descending'}
              </button>
            ))}
            </div>
            )}
          </div>
        )}
        <div role="list" data-testid={testId} aria-label={ariaLabel}
          aria-busy={loading || undefined} style={{ display: 'flex', flexDirection: 'column', gap: 8, ...dimmed }}>
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
            : visible.map(card)}
        </div>
        {pager}
        {more}
      </>
    )
  }

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
      <div aria-busy={loading || undefined} style={{ overflowX: 'auto', position: 'relative', ...dimmed }}>
        <table style={pfTableStyle} data-testid={testId} aria-label={ariaLabel}>
          <thead>{headRow(true)}</thead>
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
