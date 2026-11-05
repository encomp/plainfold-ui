import { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

export interface PfBudgetSegment { label: string; value: number; color: string }

export interface PfBudgetRow {
  id: string
  label: string
  actual: number
  /** null or 0 = no limit */
  limit: number | null
  /** edit input prefill when it differs from the displayed `limit` (e.g. limit = base + extra, editable = base); default: `limit` */
  editValue?: number
  /** used only if sum(value) equals actual (within 0.005); otherwise a single fill */
  segments?: PfBudgetSegment[]
  noLimitText?: string
  setLimitText?: string
  /** link target for the no-limit action when the row is not editable */
  setLimitHref?: string
  editable?: boolean
  highlighted?: boolean
  note?: ReactNode
  /** drawn in secondary text with a quieter fill; no limit actions; amount stays readable */
  muted?: boolean
}

export interface PfBudgetBarsProps {
  rows: PfBudgetRow[]
  format: (n: number) => string
  /** no padding, no inline editing */
  compact?: boolean
  /** resolve = saved, and only after the new data is in `rows` (focus returns to the Edit button then);  reject(Error(message)) = message shown, form stays open. The amount is rounded to cents. */
  onEditLimit?: (id: string, next: number) => Promise<void>
  editLabel?: string
  editAriaLabel?: (r: PfBudgetRow) => string
  editInputLabel?: string
  /** `${p}-row-${id}`, `${p}-edit-${id}`, `${p}-input`, `${p}-save`, `${p}-cancel` */
  testIdPrefix?: string
  /** texts (English defaults) */
  saveLabel?: string
  cancelLabel?: string
  overLimitText?: string
  invalidAmountText?: string
  saveErrorText?: string
  'data-testid'?: string
}

const srOnly: CSSProperties = {
  position: 'absolute', width: 1, height: 1, margin: -1, padding: 0,
  overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0,
}
const linkButton: CSSProperties = {
  background: 'none', border: 0, padding: 0, font: 'inherit', fontSize: 13, cursor: 'pointer',
  color: 'var(--pf-accent-text, var(--pf-accent))', textDecoration: 'underline',
}
const smallButton: CSSProperties = {
  font: 'inherit', fontSize: 13, padding: '4px 10px', cursor: 'pointer', color: 'var(--pf-text-primary)',
  background: 'var(--pf-bg-surface)', border: '1px solid var(--pf-border)', borderRadius: 6,
}

function BudgetRow({ r, o }: { r: PfBudgetRow; o: PfBudgetBarsProps }) {
  const { format, compact, onEditLimit, testIdPrefix: p } = o
  const hasLimit = r.limit !== null && r.limit > 0
  const limit = r.limit ?? 0
  const over = hasLimit && r.actual > limit
  const muted = !!r.muted
  const canEdit = !!r.editable && !muted && !compact && !!onEditLimit
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const inFlight = useRef(false)
  const errorId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const refocus = useRef(false)

  // a row that turns read-only (e.g. the caller moved to a past month) closes its form
  useEffect(() => {
    if (!canEdit) setEditing(false)
  }, [canEdit])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
    else if (refocus.current) {
      refocus.current = false
      triggerRef.current?.focus()
    }
  }, [editing])

  const openEdit = () => {
    setValue(r.editValue !== undefined ? String(r.editValue) : hasLimit ? String(limit) : '')
    setError(null)
    setEditing(true)
  }
  const close = () => {
    refocus.current = true
    setEditing(false)
  }
  const save = async () => {
    if (inFlight.current || !onEditLimit || !canEdit) return
    const raw = value.trim() === '' ? NaN : Number(value)
    if (!Number.isFinite(raw) || raw < 0) {
      setError(o.invalidAmountText ?? 'Enter an amount of 0 or more.')
      return
    }
    const n = Math.round(raw * 100) / 100
    setError(null)
    inFlight.current = true
    setPending(true)
    try {
      await onEditLimit(r.id, n)
      inFlight.current = false
      setPending(false)
      close()
    } catch (e) {
      inFlight.current = false
      setPending(false)
      setError(e instanceof Error && e.message ? e.message : (o.saveErrorText ?? 'Could not save.'))
    }
  }

  const segs = r.segments && r.segments.length > 0
    && Math.abs(r.segments.reduce((a, s) => a + s.value, 0) - r.actual) <= 0.005
    ? r.segments : null
  const fillPct = hasLimit && r.actual > 0 ? Math.min(100, (r.actual / limit) * 100) : 0
  const tid = (s: string) => (p ? `${p}-${s}` : undefined)

  const action = !hasLimit && !muted && (canEdit ? (
    <button ref={triggerRef} type="button" data-testid={tid(`edit-${r.id}`)} style={linkButton}
      aria-label={o.editAriaLabel?.(r)} onClick={openEdit}>
      {r.setLimitText ?? 'Set a limit'}
    </button>
  ) : r.setLimitHref ? (
    <a href={r.setLimitHref} style={{ fontSize: 13, color: 'var(--pf-accent-text, var(--pf-accent))' }}>
      {r.setLimitText ?? 'Set a limit'}
    </a>
  ) : null)

  return (
    <div data-testid={tid(`row-${r.id}`)} data-highlight={r.highlighted ? 'true' : undefined}
      data-muted={muted ? 'true' : undefined}
      style={{ padding: compact ? 0 : '12px 0', overflowWrap: 'anywhere', minWidth: 0,
        borderBottom: compact ? undefined : '1px solid var(--pf-border)',
        ...(r.highlighted ? { outline: '2px solid var(--pf-accent-text, var(--pf-accent))', outlineOffset: 2, borderRadius: 6 } : {}) }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        gap: 12, flexWrap: 'wrap', marginBottom: 6, fontSize: 14,
        color: muted ? 'var(--pf-text-secondary)' : 'var(--pf-text-primary)' }}>
        <span style={{ fontWeight: muted ? 500 : 600 }}>{r.label}</span>
        <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
          {over && (
            <span style={{ color: 'var(--pf-danger)' }}>
              <span aria-hidden="true">⚠</span><span style={srOnly}>{o.overLimitText ?? 'Over limit'}</span>
            </span>
          )}
          <span style={over ? { color: 'var(--pf-danger)' } : muted ? { color: 'var(--pf-text-secondary)' } : undefined}>
            {hasLimit ? `${format(r.actual)} / ${format(limit)}` : format(r.actual)}
          </span>
          {canEdit && hasLimit && !editing && (
            <button ref={triggerRef} type="button" data-testid={tid(`edit-${r.id}`)} style={linkButton}
              aria-label={o.editAriaLabel?.(r) ?? `Edit ${r.label} limit`} onClick={openEdit}>
              {o.editLabel ?? 'Edit'}
            </button>
          )}
        </span>
      </div>
      {hasLimit ? (
        <div role="progressbar" aria-label={`${r.label} spent`} aria-valuemin={0} aria-valuemax={limit}
          aria-valuenow={Math.min(Math.max(r.actual, 0), limit)}
          aria-valuetext={`${format(r.actual)} of ${format(limit)}`}
          // segmented fills keep their caller colours, so an over-limit track is marked by a danger outline instead
          data-over={over && segs ? 'true' : undefined}
          style={{ display: 'flex', height: 10, overflow: 'hidden', borderRadius: 5,
            background: 'var(--pf-bg-surface-alt)',
            border: over && segs ? '2px solid var(--pf-danger)' : '1px solid var(--pf-border)' }}>
          {segs ? segs.map((s, i) => (
            <div key={`${s.label}:${i}`} title={`${s.label} ${format(s.value)}`}
              data-separator={i < segs.length - 1 ? 'true' : undefined}
              style={{ background: s.color, height: '100%', opacity: muted ? 0.55 : undefined,
                // surface-coloured divider inside each slice's right edge, so close colours still read as separate
                boxShadow: i < segs.length - 1 ? 'inset -2px 0 0 var(--pf-bg-surface)' : undefined,
                width: `${r.actual > 0 ? (Math.max(s.value, 0) / r.actual) * fillPct : 0}%` }} />
          )) : (
            <div style={{ background: over ? 'var(--pf-danger)' : muted ? 'var(--pf-border-strong)' : 'var(--pf-positive)', height: '100%',
              width: `${fillPct}%` }} />
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'baseline', fontSize: 13,
          color: 'var(--pf-text-secondary)' }}>
          <span>{r.noLimitText ?? 'No limit'}</span>
          {!editing && action}
        </div>
      )}
      {segs && (
        <ul style={{ listStyle: 'none', margin: '6px 0 0', padding: 0, display: 'flex', gap: 12,
          flexWrap: 'wrap', fontSize: 12, color: 'var(--pf-text-secondary)' }}>
          {segs.map((s, i) => (
            <li key={`${s.label}:${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 2, background: s.color,
                border: '1px solid var(--pf-border)' }} />
              {s.label} {format(s.value)}
            </li>
          ))}
        </ul>
      )}
      {r.note != null && <div style={{ marginTop: 6, fontSize: 13, color: 'var(--pf-text-secondary)' }}>{r.note}</div>}
      {editing && canEdit && (
        <form noValidate onKeyDown={(e) => { if (e.key === 'Escape') close() }} onSubmit={(e) => { e.preventDefault(); void save() }}
          style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13,
            color: 'var(--pf-text-secondary)' }}>
            <span>{o.editInputLabel ?? 'Limit'}</span>
            <input ref={inputRef} type="number" min="0" step="0.01" value={value} data-testid={tid('input')}
              onChange={(e) => setValue(e.target.value)}
              aria-invalid={error ? true : undefined} aria-describedby={error ? errorId : undefined}
              style={{ font: 'inherit', fontSize: 14, padding: '4px 8px', width: 140,
                color: 'var(--pf-text-primary)', background: 'var(--pf-bg-surface)',
                border: '1px solid var(--pf-border)', borderRadius: 6 }} />
          </label>
          <button type="submit" disabled={pending} data-testid={tid('save')} style={smallButton}>{o.saveLabel ?? 'Save'}</button>
          <button type="button" data-testid={tid('cancel')} style={smallButton} onClick={close}>{o.cancelLabel ?? 'Cancel'}</button>
          {error && <span id={errorId} role="alert" style={{ color: 'var(--pf-danger)', fontSize: 13 }}>{error}</span>}
        </form>
      )}
    </div>
  )
}

export function PfBudgetBars(props: PfBudgetBarsProps) {
  return (
    <div data-testid={props['data-testid']} style={{ display: 'flex', flexDirection: 'column', gap: props.compact ? 10 : 0 }}>
      {props.rows.map((r) => <BudgetRow key={r.id} r={r} o={props} />)}
    </div>
  )
}
