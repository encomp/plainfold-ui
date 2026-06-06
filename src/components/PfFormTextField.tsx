import React, { useState } from 'react'
import { useFormContext, Controller } from 'react-hook-form'

interface PfFormTextFieldProps {
  name: string
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number'
  'data-testid'?: string
}

export function PfFormTextField({
  name,
  label,
  placeholder,
  type = 'text',
  'data-testid': dataTestId,
}: PfFormTextFieldProps) {
  const { control } = useFormContext()
  const [focused, setFocused] = useState(false)

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--pf-text-primary)',
    fontFamily: 'var(--pf-font-ui)',
    marginBottom: '4px',
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

        const inputStyle: React.CSSProperties = {
          width: '100%',
          background: 'var(--pf-bg-surface-alt)',
          border: `1px solid ${hasError ? 'var(--pf-danger)' : focused ? 'var(--pf-accent)' : 'var(--pf-border)'}`,
          borderRadius: 'var(--pf-radius-sm)',
          fontSize: '14px',
          padding: '8px 12px',
          fontFamily: 'var(--pf-font-ui)',
          color: 'var(--pf-text-primary)',
          outline: 'none',
          boxSizing: 'border-box',
          boxShadow: focused && !hasError ? '0 0 0 2px var(--pf-accent-muted)' : 'none',
          transition: 'border-color 150ms, box-shadow 150ms',
        }

        return (
          <div style={{ marginBottom: '12px' }}>
            {label && <label style={labelStyle}>{label}</label>}
            <input
              {...field}
              type={type}
              placeholder={placeholder}
              style={inputStyle}
              onFocus={() => setFocused(true)}
              onBlur={() => {
                setFocused(false)
                field.onBlur()
              }}
              data-testid={dataTestId}
            />
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
