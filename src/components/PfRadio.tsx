import React from 'react'

export interface PfRadioProps {
  name: string
  value: string
  checked: boolean
  onChange: (value: string) => void
  label: React.ReactNode
  description?: React.ReactNode
  disabled?: boolean
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
  'data-testid': dataTestId,
}: PfRadioProps) {
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
          style={{ accentColor: 'var(--pf-accent)', margin: '2px 0 0' }}
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
