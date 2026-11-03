import React, { useId } from 'react'
import { pfText } from '../tokens/type'

const ACCENT = 'var(--pf-accent-text, var(--pf-accent))'

export interface PfRadioProps {
  name: string
  value: string
  checked: boolean
  onChange: (value: string) => void
  label: React.ReactNode
  description?: React.ReactNode
  disabled?: boolean
  card?: boolean
  'data-testid'?: string
}

export function PfRadio({
  name,
  value,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  card = false,
  'data-testid': dataTestId,
}: PfRadioProps) {
  const descId = useId()
  const labelId = useId()
  if (card) {
    return (
      <>
        <style>{`.pf-radio-card:has(:focus-visible) { outline: 2px solid ${ACCENT}; outline-offset: 2px }
.pf-radio-card .pf-radio { position: absolute; opacity: 0; width: 1px; height: 1px; margin: 0 }`}</style>
        <label
          className="pf-radio-card"
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            padding: '12px 14px',
            borderRadius: 'var(--pf-radius-md)',
            border: `1px solid ${checked ? ACCENT : 'var(--pf-border-strong)'}`,
            background: checked ? `color-mix(in srgb, ${ACCENT} 8%, transparent)` : 'transparent',
            fontFamily: 'var(--pf-font-ui)',
            color: 'var(--pf-text-primary)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <input
            type="radio"
            className="pf-radio"
            name={name}
            value={value}
            checked={checked}
            disabled={disabled}
            onChange={() => onChange(value)}
            aria-labelledby={labelId}
            aria-describedby={description != null ? descId : undefined}
            data-testid={dataTestId}
          />
          <span id={labelId} style={{ fontSize: pfText.body, fontWeight: 600, paddingRight: checked ? '20px' : 0 }}>{label}</span>
          {description != null && (
            <span id={descId} style={{ fontSize: pfText.meta, color: 'var(--pf-text-muted)' }}>{description}</span>
          )}
          {checked && (
            <svg
              data-testid="pf-radio-check"
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              style={{ position: 'absolute', top: '12px', right: '12px', color: ACCENT }}
            >
              <path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </label>
      </>
    )
  }
  return (
    <>
      <style>{`.pf-radio:focus-visible { outline: 2px solid var(--pf-accent-text, var(--pf-accent)); outline-offset: 2px }`}</style>
      <label
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          fontFamily: 'var(--pf-font-ui)',
          color: 'var(--pf-text-primary)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <input
          type="radio"
          className="pf-radio"
          name={name}
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={() => onChange(value)}
          data-testid={dataTestId}
          style={{ accentColor: 'var(--pf-accent-text, var(--pf-accent))', margin: '2px 0 0' }}
        />
        <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{label}</span>
          {description != null && (
            <span style={{ fontSize: '12px', color: 'var(--pf-text-secondary)' }}>{description}</span>
          )}
        </span>
      </label>
    </>
  )
}
