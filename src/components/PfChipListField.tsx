import React, { useId, useState } from 'react'
import { pfText } from '../tokens/type'

export interface PfChipListFieldProps {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  /** Return an error message to refuse the entry, or null to accept it */
  validate?: (value: string) => string | null
  /** Applied to the entry before validation and the duplicate check */
  normalize?: (value: string) => string
  max?: number
  /** Read-only: chips only, no input and no remove buttons */
  disabled?: boolean
  placeholder?: string
  'data-testid'?: string
}

const css = `
.pf-clf-box { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 6px 8px;
  background: var(--pf-bg-surface); border: 1px solid var(--pf-border-strong); border-radius: var(--pf-radius-md) }
.pf-clf-box:focus-within { outline: 2px solid var(--pf-accent-text, var(--pf-accent)); outline-offset: 1px }
.pf-clf-box[data-invalid] { border-color: var(--pf-danger) }
.pf-clf-input { flex: 1 1 120px; min-width: 0; border: 0; outline: none; background: transparent;
  color: var(--pf-text-primary); font-family: var(--pf-font-ui); font-size: ${pfText.body} }
.pf-clf-chip-x { border: 0; background: transparent; color: var(--pf-text-secondary); cursor: pointer; padding: 0 2px;
  font-size: ${pfText.body}; line-height: 1; border-radius: 4px }
.pf-clf-chip-x:hover { color: var(--pf-text-primary) }
.pf-clf-chip-x:focus-visible { outline: 2px solid var(--pf-accent-text, var(--pf-accent)) }
`

export function PfChipListField({
  label, values, onChange, validate, normalize, max, disabled = false, placeholder, 'data-testid': testId,
}: PfChipListFieldProps) {
  const uid = useId()
  const errId = `${uid}-err`
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const add = () => {
    const v = (normalize ?? ((s: string) => s))(text.trim())
    if (!v) return
    const err =
      values.includes(v) ? `${v} is already added`
      : max !== undefined && values.length >= max ? `At most ${max} entries`
      : validate?.(v) ?? null
    setError(err)
    if (err) return
    onChange([...values, v])
    setText('')
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add()
    }
  }

  return (
    <div data-testid={testId} style={{ fontFamily: 'var(--pf-font-ui)', color: 'var(--pf-text-primary)' }}>
      <style>{css}</style>
      {disabled ? (
        <div style={{ fontSize: pfText.meta, color: 'var(--pf-text-secondary)', marginBottom: 4 }}>{label}</div>
      ) : (
        <label htmlFor={`${uid}-input`} style={{ display: 'block', fontSize: pfText.meta, color: 'var(--pf-text-secondary)', marginBottom: 4 }}>
          {label}
        </label>
      )}
      <div className="pf-clf-box" data-invalid={error ? '' : undefined}>
        <ul role="list" aria-label={disabled ? label : undefined} style={{ display: 'contents', listStyle: 'none', margin: 0, padding: 0 }}>
          {values.map((v) => (
            <li
              key={v}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, padding: disabled ? '2px 8px' : '2px 4px 2px 8px', fontSize: pfText.meta,
                background: 'var(--pf-accent-muted)', border: '1px solid var(--pf-border)', borderRadius: 'var(--pf-radius-sm)',
              }}
            >
              {v}
              {!disabled && (
                <button type="button" className="pf-clf-chip-x" aria-label={`Remove ${v}`} onClick={() => onChange(values.filter((x) => x !== v))}>
                  <span aria-hidden="true">×</span>
                </button>
              )}
            </li>
          ))}
        </ul>
        {!disabled && (
          <input
            id={`${uid}-input`}
            className="pf-clf-input"
            autoComplete="off"
            placeholder={placeholder}
            value={text}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errId : undefined}
            onChange={(e) => { setText(e.target.value); setError(null) }}
            onKeyDown={onKeyDown}
          />
        )}
      </div>
      {error && (
        <div id={errId} role="alert" style={{ fontSize: pfText.meta, color: 'var(--pf-danger)', marginTop: 4 }}>{error}</div>
      )}
    </div>
  )
}
