import React from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import * as Select from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'

interface PfFormSelectProps {
  name: string
  label?: string
  options: Array<{ label: string; value: string }>
  placeholder?: string
  'data-testid'?: string
}

export function PfFormSelect({
  name,
  label,
  options,
  placeholder,
  'data-testid': dataTestId,
}: PfFormSelectProps) {
  const { control } = useFormContext()

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--pf-text-primary)',
    fontFamily: 'var(--pf-font-ui)',
    marginBottom: '4px',
  }

  const triggerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'var(--pf-bg-surface-alt)',
    border: '1px solid var(--pf-border)',
    borderRadius: 'var(--pf-radius-sm)',
    fontSize: '14px',
    padding: '8px 12px',
    fontFamily: 'var(--pf-font-ui)',
    color: 'var(--pf-text-primary)',
    minWidth: '160px',
    cursor: 'pointer',
    outline: 'none',
    gap: '8px',
  }

  const contentStyle: React.CSSProperties = {
    background: 'var(--pf-bg-surface)',
    border: '1px solid var(--pf-border)',
    borderRadius: 'var(--pf-radius-sm)',
    zIndex: 1000,
    overflow: 'hidden',
  }

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    fontFamily: 'var(--pf-font-ui)',
    color: 'var(--pf-text-primary)',
    cursor: 'pointer',
    outline: 'none',
    userSelect: 'none',
  }

  const errorStyle: React.CSSProperties = {
    fontSize: '12px',
    color: 'var(--pf-danger)',
    fontFamily: 'var(--pf-font-ui)',
    marginTop: '4px',
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState.error

        return (
          <div style={{ marginBottom: '12px' }} data-testid={dataTestId}>
            {label && <label style={labelStyle}>{label}</label>}
            <Select.Root value={field.value} onValueChange={field.onChange}>
              <Select.Trigger
                style={{
                  ...triggerStyle,
                  borderColor: hasError ? 'var(--pf-danger)' : 'var(--pf-border)',
                }}
              >
                <Select.Value placeholder={placeholder} />
                <Select.Icon>
                  <ChevronDown size={16} />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content style={contentStyle} position="popper" sideOffset={4}>
                  <Select.Viewport>
                    {options.map((option) => (
                      <Select.Item key={option.value} value={option.value} style={itemStyle}>
                        <Select.ItemText>{option.label}</Select.ItemText>
                        <Select.ItemIndicator>
                          <Check size={14} style={{ color: 'var(--pf-accent)' }} />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
            {hasError && (
              <div style={errorStyle} role="alert">
                {fieldState.error?.message}
              </div>
            )}
          </div>
        )
      }}
    />
  )
}
