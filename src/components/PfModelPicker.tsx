import React from 'react'
import { PfSelect } from './PfSelect'

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

export function PfModelPicker({
  providers,
  value,
  onChange,
  label = 'Model',
  'data-testid': dataTestId,
}: PfModelPickerProps) {
  const current = providers.find((p) => p.id === value.provider)

  return (
    <div role="group" aria-label={label} style={groupStyle} data-testid={dataTestId}>
      <PfSelect
        aria-label="Provider"
        value={value.provider}
        data-testid={dataTestId && `${dataTestId}-provider`}
        options={providers.map((p) => ({
          value: p.id,
          label: p.disabled && p.disabledNote ? `${p.label} (${p.disabledNote})` : p.label,
          disabled: p.disabled,
        }))}
        onChange={(id) => {
          const next = providers.find((p) => p.id === id)
          if (next?.models[0]) onChange({ provider: next.id, model: next.models[0].id })
        }}
      />
      <PfSelect
        aria-label="Model"
        value={value.model}
        data-testid={dataTestId && `${dataTestId}-model`}
        options={(current?.models ?? []).map((m) => ({
          value: m.id,
          label: m.note ? `${m.label} · ${m.note}` : m.label,
        }))}
        onChange={(model) => onChange({ provider: value.provider, model })}
      />
    </div>
  )
}
