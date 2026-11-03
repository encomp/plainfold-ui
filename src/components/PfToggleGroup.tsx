import React from 'react'
import { pfText } from '../tokens/type'

export interface PfToggleGroupProps {
  options: Array<{ value: string; label: string }>
  values: string[]
  onChange: (values: string[]) => void
  'aria-label': string
  disabled?: boolean
  'data-testid'?: string
}

export function PfToggleGroup({
  options,
  values,
  onChange,
  'aria-label': ariaLabel,
  disabled = false,
  'data-testid': dataTestId,
}: PfToggleGroupProps) {
  function toggle(value: string) {
    const next = new Set(values)
    if (!next.delete(value)) next.add(value)
    onChange(options.map((o) => o.value).filter((v) => next.has(v)))
  }

  return (
    <>
      <style>{`.pf-toggle:focus-visible { outline: 2px solid var(--pf-accent-text, var(--pf-accent)); outline-offset: 2px }`}</style>
      <div
        role="group"
        aria-label={ariaLabel}
        data-testid={dataTestId}
        style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}
      >
        {options.map((o) => {
          const pressed = values.includes(o.value)
          const style: React.CSSProperties = {
            fontFamily: 'var(--pf-font-ui)',
            fontSize: pfText.meta,
            fontWeight: 600,
            padding: '6px 10px',
            borderRadius: '8px',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: disabled ? (pressed ? 'var(--pf-border-strong)' : 'var(--pf-border)') : pressed ? 'transparent' : 'var(--pf-border-strong)',
            background: disabled ? 'var(--pf-bg-surface-alt)' : pressed ? 'var(--pf-accent)' : 'var(--pf-bg-surface)',
            color: disabled
              ? pressed ? 'var(--pf-text-primary)' : 'var(--pf-text-muted)'
              : pressed ? 'var(--pf-on-accent, var(--pf-bg-base))' : 'var(--pf-text-secondary)',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }
          return (
            <button
              key={o.value}
              type="button"
              className="pf-toggle"
              aria-pressed={pressed}
              disabled={disabled}
              style={style}
              onClick={() => toggle(o.value)}
            >
              {disabled && pressed && <span aria-hidden="true">✓ </span>}
              {o.label}
            </button>
          )
        })}
      </div>
    </>
  )
}
