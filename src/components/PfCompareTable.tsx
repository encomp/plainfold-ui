import React from 'react'
import { PfBadge } from './PfBadge'

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
  /** Shown when there are no columns, or when onlyDifferences hides every row */
  emptyState?: React.ReactNode
  /** Names the scroll region around the table (a focusable region landmark); without it the region is neither focusable nor a landmark */
  'aria-label'?: string
  'data-testid'?: string
  /** Overrides the one word a cell carries (defaults "best", "fails", "warning", "ok"). An empty word renders nothing. */
  toneWords?: Partial<Record<'best' | PfCompareTone, string>>
  /** Show the word as a PfBadge instead of visually hidden text */
  wordsVisible?: boolean
  /** An extra column after the row label. Not part of best or onlyDifferences. */
  leadColumn?: { header: React.ReactNode; get(row: PfCompareRow<T>): React.ReactNode }
}

const DEFAULT_WORDS = { best: 'best', bad: 'fails', warn: 'warning', ok: 'ok', neutral: '' }
const BADGE_VARIANT = { best: 'success', ok: 'success', bad: 'danger', warn: 'warning' } as const

// position: relative is the containing block for the visually hidden spans, so they stay inside the clip
const wrapStyle: React.CSSProperties = {
  overflowX: 'auto',
  maxWidth: '100%',
  position: 'relative',
}

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

// NaN counts as null
function known(v: number | string | null): number | string | null {
  return typeof v === 'number' && Number.isNaN(v) ? null : v
}

function isDifferent<T>(row: PfCompareRow<T>, columns: T[]): boolean {
  if (!row.value || columns.length < 2) return true
  const first = known(row.value(columns[0]))
  return columns.some((c) => known(row.value!(c)) !== first)
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
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
  toneWords,
  wordsVisible,
  leadColumn,
}: PfCompareTableProps<T>) {
  if (columns.length === 0) {
    return emptyState != null ? <div data-testid={dataTestId}>{emptyState}</div> : null
  }

  const visible = onlyDifferences ? rows.filter((r) => isDifferent(r, columns)) : rows
  if (visible.length === 0 && emptyState != null) return <div data-testid={dataTestId}>{emptyState}</div>
  const span = columns.length + (leadColumn ? 2 : 1)
  // Consecutive rows with the same group share one tbody and heading
  const runs: { group?: string; rows: PfCompareRow<T>[] }[] = []
  visible.forEach((r, i) => {
    if (i > 0 && r.group === visible[i - 1].group) runs[runs.length - 1].rows.push(r)
    else runs.push({ group: r.group, rows: [r] })
  })

  return (
    <div style={wrapStyle} tabIndex={ariaLabel ? 0 : undefined}
      role={ariaLabel ? 'region' : undefined}
      aria-label={ariaLabel} data-testid={dataTestId}>
      <table
        style={{
          ...tableStyle,
          minWidth: `${LABEL_MIN + COL_MIN * (columns.length + (leadColumn ? 1 : 0))}px`,
        }}
      >
        <thead>
          <tr>
            <th scope="col" style={stickyStyle}>
              <span style={hiddenStyle}>Item</span>
            </th>
            {leadColumn && (
              <th scope="col" style={{ ...cellStyle, minWidth: `${COL_MIN}px`, fontWeight: 600 }}>
                {leadColumn.header}
              </th>
            )}
            {columns.map((c) => (
              <th
                key={getColumnId(c)}
                scope="col"
                style={{
                  ...cellStyle,
                  minWidth: `${COL_MIN}px`,
                  fontWeight: 600,
                }}
              >
                {renderColumnHeader(c)}
              </th>
            ))}
          </tr>
        </thead>
        {runs.map((run, runIndex) => (
          <tbody key={runIndex}>
            {run.group && (
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
                  {leadColumn && (
                    <td style={{ ...cellStyle, minWidth: `${COL_MIN}px` }}>{leadColumn.get(r)}</td>
                  )}
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
                    // One word per cell: best wins over the tone word, except for bad
                    const key = isBest ? 'best' : tone
                    const word = toneWords?.[key] ?? DEFAULT_WORDS[key]
                    return (
                      <td
                        key={getColumnId(c)}
                        style={{
                          ...cellStyle,
                          minWidth: `${COL_MIN}px`,
                          ...(color && { color }),
                          ...(isBest && { fontWeight: 600 }),
                        }}
                      >
                        {r.get(c)}
                        {word &&
                          (wordsVisible && key !== 'neutral' ? (
                            <>
                              {' '}
                              <PfBadge variant={BADGE_VARIANT[key]}>{word}</PfBadge>
                            </>
                          ) : (
                            <span style={hiddenStyle}>{` ${word}`}</span>
                          ))}
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
