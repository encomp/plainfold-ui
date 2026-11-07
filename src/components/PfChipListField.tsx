import React, { useEffect, useId, useRef, useState } from 'react'
import { pfText } from '../tokens/type'
import { Chip, chipCss } from './chip'

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

const css = chipCss + `
.pf-clf-box { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 6px 8px;
  background: var(--pf-bg-surface); border: 1px solid var(--pf-border-strong); border-radius: var(--pf-radius-md) }
.pf-clf-box:focus-within { outline: 2px solid var(--pf-accent-text, var(--pf-accent)); outline-offset: 1px }
.pf-clf-box[data-invalid] { border-color: var(--pf-danger) }
.pf-clf-input { flex: 1 1 120px; min-width: 0; border: 0; outline: none; background: transparent;
  color: var(--pf-text-primary); font-family: var(--pf-font-ui); font-size: ${pfText.body} }
`

export function PfChipListField({
  label, values, onChange, validate, normalize, max, disabled = false, placeholder, 'data-testid': testId,
}: PfChipListFieldProps) {
  const uid = useId()
  const errId = `${uid}-err`
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const listRef = useRef<HTMLUListElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const focusAt = useRef<number | null>(null)
  // After a remove, focus the chip that took its place, else the input.
  useEffect(() => {
    if (focusAt.current === null) return
    const btns = listRef.current?.querySelectorAll<HTMLButtonElement>('button')
    ;(btns?.[focusAt.current] ?? inputRef.current)?.focus()
    focusAt.current = null
  }, [values])

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
        <ul ref={listRef} role="list" aria-label={disabled ? label : undefined} style={{ display: 'contents', listStyle: 'none', margin: 0, padding: 0 }}>
          {values.map((v, i) => (
            <Chip
              key={v}
              plain={disabled}
              removeLabel={disabled ? undefined : `Remove ${v}`}
              onRemove={() => { focusAt.current = i; onChange(values.filter((x) => x !== v)) }}
            >
              {v}
            </Chip>
          ))}
        </ul>
        {!disabled && (
          <input
            ref={inputRef}
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
