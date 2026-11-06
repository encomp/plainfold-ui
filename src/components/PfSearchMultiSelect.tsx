import React, { useId, useRef, useState } from 'react'
import { pfText } from '../tokens/type'
import { PfButton } from './PfButton'

export interface PfSearchMultiSelectOption {
  value: string
  label: string
  count?: number
  disabled?: boolean
}

export interface PfSearchMultiSelectProps {
  /** Shown in the given order when nothing is typed */
  options: PfSearchMultiSelectOption[]
  /** Picked values, in pick order */
  values: string[]
  onChange: (values: string[]) => void
  /** Visible label, also the combobox's name */
  label: string
  placeholder?: string
  noResultsText?: string
  clearAllText?: string
  /** The screen-reader text for a count, e.g. n => `${n} items` */
  countLabel?: (n: number) => string
  /** aria-busy, adds a "Loading" row */
  loading?: boolean
  /** Server search: when given, options are not filtered locally */
  onSearch?: (text: string) => void
  'data-testid'?: string
}

const hiddenStyle: React.CSSProperties = {
  position: 'absolute', width: 1, height: 1, margin: -1, padding: 0,
  overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0,
}

const css = `
.pf-sms-box { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 6px 8px;
  background: var(--pf-bg-surface); border: 1px solid var(--pf-border-strong); border-radius: var(--pf-radius-md) }
.pf-sms-box:focus-within { outline: 2px solid var(--pf-accent-text, var(--pf-accent)); outline-offset: 1px }
.pf-sms-input { flex: 1 1 120px; min-width: 0; border: 0; outline: none; background: transparent;
  color: var(--pf-text-primary); font-family: var(--pf-font-ui); font-size: ${pfText.body} }
.pf-sms-chip-x { border: 0; background: transparent; color: var(--pf-text-secondary); cursor: pointer; padding: 0 2px;
  font-size: ${pfText.body}; line-height: 1; border-radius: 4px }
.pf-sms-chip-x:hover { color: var(--pf-text-primary) }
.pf-sms-chip-x:focus-visible { outline: 2px solid var(--pf-accent-text, var(--pf-accent)) }
`

export function PfSearchMultiSelect({
  options,
  values,
  onChange,
  label,
  placeholder = 'Type to search',
  noResultsText = 'No matches',
  clearAllText = 'Clear all',
  countLabel = (n) => `${n}`,
  loading = false,
  onSearch,
  'data-testid': testId,
}: PfSearchMultiSelectProps) {
  const uid = useId()
  const listId = `${uid}-list`
  const inputRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [said, setSaid] = useState('')
  // After typing, the status reports the rendered list (so server results are announced when they arrive, not the stale list).
  const [typing, setTyping] = useState(false)

  const needle = text.trim().toLowerCase()
  const shown = onSearch || !needle ? options : options.filter((o) => o.label.toLowerCase().includes(needle))
  const n = shown.length
  const status = typing && text.trim() ? (loading ? '' : n ? `${n} ${n === 1 ? 'result' : 'results'}` : noResultsText) : said
  const at = Math.min(active, n - 1)
  const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? v

  const type = (v: string) => {
    setText(v)
    setOpen(true)
    setActive(0)
    onSearch?.(v)
    setTyping(true)
  }
  const close = () => {
    setOpen(false)
    setActive(-1)
  }
  const toggle = (o: PfSearchMultiSelectOption) => {
    if (o.disabled) return
    const on = values.includes(o.value)
    onChange(on ? values.filter((v) => v !== o.value) : [...values, o.value])
    setTyping(false)
    setSaid(`${o.label} ${on ? 'removed' : 'selected'}`)
  }
  const remove = (v: string) => {
    onChange(values.filter((x) => x !== v))
    setTyping(false)
    setSaid(`${labelOf(v)} removed`)
    inputRef.current?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    const move = (to: number) => {
      e.preventDefault()
      setOpen(true)
      setActive(to)
      document.getElementById(`${uid}-${to}`)?.scrollIntoView?.({ block: 'nearest' })
    }
    if (e.key === 'ArrowDown') {
      if (n) move(open ? (at + 1) % n : 0)
      else e.preventDefault()
    } else if (e.key === 'ArrowUp') {
      if (n) move(open && at > 0 ? at - 1 : n - 1)
      else e.preventDefault()
    } else if (open && n && e.key === 'Home') move(0)
    else if (open && n && e.key === 'End') move(n - 1)
    else if (e.key === 'Enter' && open && at >= 0) {
      e.preventDefault()
      toggle(shown[at])
    } else if (e.key === 'Escape' && (open || text)) {
      e.preventDefault()
      e.stopPropagation()
      close()
      if (text) {
        setText('')
        onSearch?.('')
      }
      setTyping(false)
      setSaid('')
    } else if (e.key === 'Backspace' && !text && values.length) {
      remove(values[values.length - 1])
    }
  }

  return (
    <div
      data-testid={testId}
      aria-busy={loading || undefined}
      style={{ position: 'relative', fontFamily: 'var(--pf-font-ui)', color: 'var(--pf-text-primary)' }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          close()
        }
      }}
    >
      <style>{css}</style>
      <label htmlFor={`${uid}-input`} style={{ display: 'block', fontSize: pfText.meta, color: 'var(--pf-text-secondary)', marginBottom: 4 }}>
        {label}
      </label>
      <div className="pf-sms-box">
        {values.length > 0 && (
          <ul role="list" style={{ display: 'contents', listStyle: 'none', margin: 0, padding: 0 }}>
            {values.map((v) => (
              <li
                key={v}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 4px 2px 8px', fontSize: pfText.meta,
                  background: 'var(--pf-accent-muted)', border: '1px solid var(--pf-border)', borderRadius: 'var(--pf-radius-sm)',
                }}
              >
                {labelOf(v)}
                <button type="button" className="pf-sms-chip-x" aria-label={`Remove ${labelOf(v)}`} onClick={() => remove(v)}>
                  <span aria-hidden="true">×</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <input
          ref={inputRef}
          id={`${uid}-input`}
          className="pf-sms-input"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && at >= 0 ? `${uid}-${at}` : undefined}
          autoComplete="off"
          placeholder={placeholder}
          value={text}
          onChange={(e) => type(e.target.value)}
          onClick={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {values.length > 0 && (
          <PfButton variant="quiet" size="sm" onClick={() => { onChange([]); setSaid(''); inputRef.current?.focus() }}>
            {clearAllText}
          </PfButton>
        )}
      </div>
      <div role="status" aria-live="polite" style={hiddenStyle}>{status}</div>
      {open && (
        <ul
          role="listbox"
          id={listId}
          aria-label={label}
          aria-multiselectable="true"
          onMouseDown={(e) => e.preventDefault()}
          style={{
            // shortcut: absolute list, no portal or flip (clipped by an overflow:hidden ancestor, may pass the viewport bottom), upgrade when used in a clipped container
            position: 'absolute', left: 0, right: 0, top: '100%', zIndex: 10, margin: '4px 0 0', padding: 4, listStyle: 'none',
            maxHeight: '40vh', overflowY: 'auto', background: 'var(--pf-bg-elevated, var(--pf-bg-surface))',
            border: '1px solid var(--pf-border)', borderRadius: 'var(--pf-radius-md)',
          }}
        >
          {/* shortcut: renders every option and no onSearch debounce, upgrade to server search plus a debounce for large lists; strings are English only */}
          {shown.map((o, i) => {
            const on = values.includes(o.value)
            return (
              <li
                key={o.value}
                id={`${uid}-${i}`}
                role="option"
                aria-selected={on}
                aria-disabled={o.disabled || undefined}
                aria-label={o.count === undefined ? undefined : `${o.label}, ${countLabel(o.count)}`}
                onClick={() => toggle(o)}
                style={{
                  display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 12px', fontSize: pfText.body,
                  borderRadius: 'var(--pf-radius-sm)', cursor: o.disabled ? 'not-allowed' : 'pointer',
                  color: o.disabled ? 'var(--pf-text-muted)' : 'var(--pf-text-primary)',
                  fontWeight: on ? 600 : 400,
                  background: i === at ? 'var(--pf-accent-muted)' : undefined,
                }}
              >
                <span>{o.label}</span>
                {o.count !== undefined && <span style={{ color: 'var(--pf-text-secondary)', fontSize: pfText.meta }}>{o.count}</span>}
              </li>
            )
          })}
          {loading && <li role="presentation" style={{ padding: '8px 12px', fontSize: pfText.meta, color: 'var(--pf-text-secondary)' }}>Loading</li>}
          {!loading && n === 0 && (
            <li role="presentation" style={{ padding: '8px 12px', fontSize: pfText.meta, color: 'var(--pf-text-secondary)' }}>{noResultsText}</li>
          )}
        </ul>
      )}
    </div>
  )
}
