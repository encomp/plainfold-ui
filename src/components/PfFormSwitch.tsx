import React from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import * as Switch from '@radix-ui/react-switch'

interface PfFormSwitchProps {
  name: string
  label: string
  description?: string
  'data-testid'?: string
}

export function PfFormSwitch({
  name,
  label,
  description,
  'data-testid': dataTestId,
}: PfFormSwitchProps) {
  const { control } = useFormContext()

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  }

  const labelContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--pf-text-primary)',
    fontFamily: 'var(--pf-font-ui)',
  }

  const descriptionStyle: React.CSSProperties = {
    fontSize: '12px',
    color: 'var(--pf-text-muted)',
    fontFamily: 'var(--pf-font-ui)',
    marginTop: '2px',
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const checked = !!field.value

        const rootStyle: React.CSSProperties = {
          width: '44px',
          height: '24px',
          borderRadius: '12px',
          border: checked ? 'none' : '1px solid var(--pf-border)',
          background: checked ? 'var(--pf-accent-text, var(--pf-accent))' : 'var(--pf-bg-surface-alt)',
          position: 'relative',
          cursor: 'pointer',
          padding: 0,
          outline: 'none',
          transition: 'background 150ms',
          flexShrink: 0,
        }

        const thumbStyle: React.CSSProperties = {
          display: 'block',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: 'var(--pf-bg-base)',
          transition: 'transform 150ms',
          transform: checked ? 'translateX(22px)' : 'translateX(2px)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }

        return (
          <div style={containerStyle} data-testid={dataTestId}>
            <div style={labelContainerStyle}>
              <span style={labelStyle}>{label}</span>
              {description && (
                <span style={descriptionStyle}>{description}</span>
              )}
            </div>
            <Switch.Root
              style={rootStyle}
              checked={checked}
              onCheckedChange={field.onChange}
              aria-label={label}
            >
              <Switch.Thumb style={thumbStyle} />
            </Switch.Root>
          </div>
        )
      }}
    />
  )
}
