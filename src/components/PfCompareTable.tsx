import React from 'react'

export type PfCompareTone = 'ok' | 'warn' | 'bad' | 'neutral'

export interface PfCompareRow<T> {
  /** Must be unique among the rows */
  id: string
  label: React.ReactNode
  /** Consecutive rows with the same group share a heading row */
  group?: string
  /** The cell */
  get(col: T): React.ReactNode
  /** For best-value and 'only differences'. Omit it and the row never highlights and counts as different. */
  value?(col: T): number | string | null
  /** Highlight the best numeric value(s) in the row */
  best?: 'max' | 'min' | null
  /** Default 'neutral'. 'bad' is marked with the word 'fails' for screen readers. */
  tone?(col: T): PfCompareTone
}

export interface PfCompareTableProps<T> {
  columns: T[]
  getColumnId(col: T): string
  renderColumnHeader(col: T): React.ReactNode
  rows: PfCompareRow<T>[]
  /** Controlled. Hides rows whose value() is equal across all columns (null equals null). */
  onlyDifferences?: boolean
  /** Shown when there are no columns */
  emptyState?: React.ReactNode
  'data-testid'?: string
}

const wrapStyle: React.CSSProperties = { overflowX: 'auto', maxWidth: '100%' }

const tableStyle: React.CSSProperties = {
  borderCollapse: 'separate',
  borderSpacing: 0,
  width: '100%',
  fontSize: '14px',
  color: 'var(--pf-text-primary)',
}

const cellStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid var(--pf-border)',
  textAlign: 'left',
  verticalAlign: 'top',
  overflowWrap: 'anywhere',
}

const stickyStyle: React.CSSProperties = {
  ...cellStyle,
  position: 'sticky',
  left: 0,
  background: 'var(--pf-bg-surface)',
  fontWeight: 600,
  minWidth: '96px',
  maxWidth: '160px',
}

const COL_MIN = 110
const LABEL_MIN = 96

const groupStyle: React.CSSProperties = {
  ...cellStyle,
  background: 'var(--pf-bg-surface-alt)',
  color: 'var(--pf-text-secondary)',
  fontSize: '12px',
  fontWeight: 600,
}

// Visually hidden but read by screen readers
const hiddenStyle: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  margin: '-1px',
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
}

function isDifferent<T>(row: PfCompareRow<T>, columns: T[]): boolean {
  if (!row.value || columns.length < 2) return true
  const first = row.value(columns[0])
  return columns.some((c) => row.value!(c) !== first)
}

function bestIndexes<T>(row: PfCompareRow<T>, columns: T[]): Set<number> {
  const out = new Set<number>()
  if (!row.value || !row.best) return out
  const nums = columns.map((c) => {
    const v = row.value!(c)
    return typeof v === 'number' && Number.isFinite(v) ? v : null
  })
  const valid = nums.filter((n): n is number => n !== null)
  if (valid.length < 2 || valid.every((n) => n === valid[0])) return out
  const target = row.best === 'max' ? Math.max(...valid) : Math.min(...valid)
  nums.forEach((n, i) => {
    if (n === target) out.add(i)
  })
  return out
}

export function PfCompareTable<T>({
  columns,
  getColumnId,
  renderColumnHeader,
  rows,
  onlyDifferences,
  emptyState,
  'data-testid': dataTestId,
}: PfCompareTableProps<T>) {
  if (columns.length === 0) {
    return emptyState != null ? <div data-testid={dataTestId}>{emptyState}</div> : null
  }

  const visible = onlyDifferences ? rows.filter((r) => isDifferent(r, columns)) : rows
  const span = columns.length + 1
  // Consecutive rows with the same group share one tbody and heading
  const runs: { group?: string; rows: PfCompareRow<T>[] }[] = []
  visible.forEach((r, i) => {
    if (i > 0 && r.group === visible[i - 1].group) runs[runs.length - 1].rows.push(r)
    else runs.push({ group: r.group, rows: [r] })
  })

  return (
    <div style={wrapStyle} data-testid={dataTestId}>
      <table style={{ ...tableStyle, minWidth: `${LABEL_MIN + COL_MIN * columns.length}px` }}>
        <thead>
          <tr>
            <th scope="col" style={stickyStyle}>
              <span style={hiddenStyle}>Item</span>
            </th>
            {columns.map((c) => (
              <th key={getColumnId(c)} scope="col" style={{ ...cellStyle, minWidth: `${COL_MIN}px`, fontWeight: 600 }}>
                {renderColumnHeader(c)}
              </th>
            ))}
          </tr>
        </thead>
        {runs.map((run, runIndex) => (
          <tbody key={runIndex}>
            {run.group != null && (
              <tr>
                <th scope="rowgroup" colSpan={span} style={groupStyle}>
                  {run.group}
                </th>
              </tr>
            )}
            {run.rows.map((r) => {
              const best = bestIndexes(r, columns)
              return (
                <tr key={r.id}>
                  <th scope="row" style={stickyStyle}>
                    {r.label}
                  </th>
                  {columns.map((c, ci) => {
                    const tone = r.tone?.(c) ?? 'neutral'
                    const isBest = best.has(ci) && tone !== 'bad'
                    const color =
                      tone === 'bad'
                        ? 'var(--pf-negative)'
                        : isBest
                          ? 'var(--pf-positive)'
                          : tone === 'warn'
                            ? 'var(--pf-warning)'
                            : tone === 'ok'
                              ? 'var(--pf-positive)'
                              : undefined
                    return (
                      <td
                        key={getColumnId(c)}
                        style={{ ...cellStyle, minWidth: `${COL_MIN}px`, ...(color && { color }), ...(isBest && { fontWeight: 600 }) }}
                      >
                        {r.get(c)}
                        {isBest && <span style={hiddenStyle}> best</span>}
                        {tone === 'bad' && <span style={hiddenStyle}> fails</span>}
                        {tone === 'warn' && <span style={hiddenStyle}> warning</span>}
                        {tone === 'ok' && <span style={hiddenStyle}> ok</span>}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        ))}
      </table>
    </div>
  )
}
