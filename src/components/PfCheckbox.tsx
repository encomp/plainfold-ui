import React, { useEffect, useRef } from 'react'
import { pfText } from '../tokens/type'

export interface PfCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: React.ReactNode
  'aria-label'?: string
  disabled?: boolean
  'aria-disabled'?: boolean
  'aria-describedby'?: string
  indeterminate?: boolean
  id?: string
  'data-testid'?: string
}

const css = `
.pf-checkbox { appearance: none; -webkit-appearance: none; width: 18px; height: 18px; margin: 0; flex: none;
  border: 1.5px solid var(--pf-border-strong); border-radius: 5px; background: var(--pf-bg-surface);
  display: grid; place-items: center; cursor: pointer }
.pf-checkbox:checked, .pf-checkbox:indeterminate { background: var(--pf-accent); border-color: transparent }
.pf-checkbox:checked::after { content: ""; width: 9px; height: 5px; border: 2px solid var(--pf-on-accent, var(--pf-bg-base));
  border-top: 0; border-right: 0; transform: rotate(-45deg) translate(1px, -1px) }
.pf-checkbox:indeterminate::after { content: ""; width: 10px; height: 0; border-top: 2px solid var(--pf-on-accent, var(--pf-bg-base)) }
.pf-checkbox:focus-visible { outline: 2px solid var(--pf-accent-text, var(--pf-accent)); outline-offset: 2px }
.pf-checkbox:disabled { cursor: not-allowed; opacity: 0.5 }
`

export function PfCheckbox({
  checked,
  onChange,
  label,
  'aria-label': ariaLabel,
  disabled = false,
  'aria-disabled': ariaDisabled,
  'aria-describedby': ariaDescribedBy,
  indeterminate = false,
  id,
  'data-testid': dataTestId,
}: PfCheckboxProps) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])

  const labelled = label != null
  const input = (
    <input
      ref={ref}
      type="checkbox"
      className="pf-checkbox"
      id={id}
      checked={checked}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={ariaDisabled}
      aria-describedby={ariaDescribedBy}
      data-testid={dataTestId}
      style={labelled ? { marginTop: '1px' } : undefined}
      onChange={(e) => onChange(e.target.checked)}
    />
  )

  return (
    <>
      <style>{css}</style>
      {!labelled ? (
        input
      ) : (
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'flex-start',
            gap: '8px',
            fontFamily: 'var(--pf-font-ui)',
            fontSize: pfText.body,
            color: disabled ? 'var(--pf-text-muted)' : 'var(--pf-text-primary)',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {input}
          {label}
        </label>
      )}
    </>
  )
}
