import { useId } from 'react'
import * as Select from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'
import { pfText } from '../tokens/type'

export interface PfSelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface PfSelectBaseProps {
  /** '' means "no choice" (e.g. "Any") */
  value: string
  onChange: (value: string) => void
  options: PfSelectOption[]
  placeholder?: string
  disabled?: boolean
  id?: string
  size?: 'sm' | 'md'
  /** On the trigger */
  'data-testid'?: string
  invalid?: boolean
  /** Id of the element describing the field, e.g. its error text */
  describedBy?: string
}

/** A visible label or an aria-label is required */
export type PfSelectProps = PfSelectBaseProps &
  ({ label: string; 'aria-label'?: never } | { label?: never; 'aria-label': string })

// Radix forbids '' as an item value, so the empty choice travels under this key.
const EMPTY = '__pf_empty__'
const toRadix = (v: string) => (v === '' ? EMPTY : v)
const fromRadix = (v: string) => (v === EMPTY ? '' : v)

const css = `
.pf-select-trigger:focus-visible { outline: 2px solid var(--pf-accent-text, var(--pf-accent)); outline-offset: 2px }
.pf-select-trigger:disabled { cursor: not-allowed; opacity: 0.5 }
.pf-select-item[data-highlighted] { background: var(--pf-bg-surface-alt) }
.pf-select-item[data-disabled] { color: var(--pf-text-muted); cursor: not-allowed }
`

export function PfSelect({
  value,
  onChange,
  options,
  label,
  'aria-label': ariaLabel,
  placeholder,
  disabled = false,
  id,
  size = 'md',
  'data-testid': dataTestId,
  invalid = false,
  describedBy,
}: PfSelectProps) {
  const uid = useId()
  const triggerId = id ?? uid
  const known = options.some((o) => o.value === value)
  const fontSize = size === 'sm' ? pfText.meta : pfText.body

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px', maxWidth: '100%' }}>
      <style>{css}</style>
      {label && (
        <label
          htmlFor={triggerId}
          style={{
            fontSize: pfText.body,
            fontWeight: 500,
            color: 'var(--pf-text-primary)',
            fontFamily: 'var(--pf-font-ui)',
          }}
        >
          {label}
        </label>
      )}
      <Select.Root
        value={known ? toRadix(value) : ''}
        onValueChange={(v) => onChange(fromRadix(v))}
        disabled={disabled}
      >
        <Select.Trigger
          id={triggerId}
          className="pf-select-trigger"
          aria-label={label ? undefined : ariaLabel}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          data-testid={dataTestId}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            minWidth: size === 'sm' ? '120px' : '200px',
            maxWidth: '100%',
            padding: size === 'sm' ? '5px 10px' : '8px 12px',
            fontSize,
            fontFamily: 'var(--pf-font-ui)',
            color: 'var(--pf-text-primary)',
            background: 'var(--pf-bg-surface)',
            border: '1px solid',
            borderColor: invalid ? 'var(--pf-danger)' : 'var(--pf-border-strong)',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          <Select.Value placeholder={placeholder} />
          <Select.Icon style={{ display: 'inline-flex', color: 'var(--pf-text-muted)' }}>
            <ChevronDown size={14} />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={4}
            style={{
              background: 'var(--pf-bg-surface)',
              border: '1px solid var(--pf-border-strong)',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,.18)',
              minWidth: 'var(--radix-select-trigger-width)',
              maxHeight: 'var(--radix-select-content-available-height)',
              zIndex: 1000,
              overflow: 'hidden',
            }}
          >
            <Select.Viewport style={{ padding: '4px' }}>
              {options.map((o) => (
                <Select.Item
                  key={o.value}
                  value={toRadix(o.value)}
                  disabled={o.disabled}
                  className="pf-select-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    fontSize,
                    fontFamily: 'var(--pf-font-ui)',
                    color: 'var(--pf-text-primary)',
                    cursor: 'pointer',
                    outline: 'none',
                    userSelect: 'none',
                  }}
                >
                  <Select.ItemText>{o.label}</Select.ItemText>
                  <Select.ItemIndicator style={{ display: 'inline-flex' }}>
                    <Check size={14} style={{ color: 'var(--pf-accent-text, var(--pf-accent))' }} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  )
}
