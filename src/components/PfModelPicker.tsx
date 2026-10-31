import React, { useId } from 'react'

export interface PfModelOption {
  id: string
  label: string
  /** Shown after the label, e.g. a price */
  note?: string
}

export interface PfModelProvider {
  id: string
  label: string
  models: PfModelOption[]
  disabled?: boolean
  /** Appended to a disabled provider's label, e.g. "no key" */
  disabledNote?: string
}

export interface PfModelPickerValue {
  provider: string
  model: string
}

export interface PfModelPickerProps {
  providers: PfModelProvider[]
  /** Must name a listed provider and one of its models; the caller falls back when a saved value is stale or its provider is disabled */
  value: PfModelPickerValue
  /** Changing the provider emits that provider's first model */
  onChange(value: PfModelPickerValue): void
  /** Accessible group label (default "Model") */
  label?: string
  'data-testid'?: string
}

const groupStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  fontFamily: 'var(--pf-font-ui)',
}

const hiddenStyle: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
}

const selectStyle: React.CSSProperties = {
  minWidth: 0,
  maxWidth: '100%',
  padding: '6px 8px',
  fontSize: '14px',
  fontFamily: 'inherit',
  color: 'var(--pf-text-primary)',
  background: 'var(--pf-bg-surface)',
  border: '1px solid var(--pf-border)',
  borderRadius: 'var(--pf-radius-sm)',
}

export function PfModelPicker({
  providers,
  value,
  onChange,
  label = 'Model',
  'data-testid': dataTestId,
}: PfModelPickerProps) {
  const uid = useId()
  const current = providers.find((p) => p.id === value.provider)

  return (
    <div role="group" aria-label={label} style={groupStyle} data-testid={dataTestId}>
      <label htmlFor={`${uid}-p`} style={hiddenStyle}>
        Provider
      </label>
      <select
        id={`${uid}-p`}
        style={selectStyle}
        value={value.provider}
        data-testid={dataTestId && `${dataTestId}-provider`}
        onChange={(e) => {
          const next = providers.find((p) => p.id === e.target.value)
          if (next?.models[0]) onChange({ provider: next.id, model: next.models[0].id })
        }}
      >
        {providers.map((p) => (
          <option key={p.id} value={p.id} disabled={p.disabled}>
            {p.disabled && p.disabledNote ? `${p.label} (${p.disabledNote})` : p.label}
          </option>
        ))}
      </select>
      <label htmlFor={`${uid}-m`} style={hiddenStyle}>
        Model
      </label>
      <select
        id={`${uid}-m`}
        style={selectStyle}
        value={value.model}
        data-testid={dataTestId && `${dataTestId}-model`}
        onChange={(e) => onChange({ provider: value.provider, model: e.target.value })}
      >
        {(current?.models ?? []).map((m) => (
          <option key={m.id} value={m.id}>
            {m.note ? `${m.label} · ${m.note}` : m.label}
          </option>
        ))}
      </select>
    </div>
  )
}
