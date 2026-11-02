import React from 'react'

interface PfSegmentedButtonProps {
  options: Array<{ value: string; label: string }>
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  size?: 'sm' | 'md'
  'data-testid'?: string
}

const sizeStyles: Record<'sm' | 'md', React.CSSProperties> = {
  sm: { padding: '3px 10px', fontSize: '12px' },
  md: { padding: '5px 14px', fontSize: '13px' },
}

export function PfSegmentedButton({
  options,
  value,
  onChange,
  disabled = false,
  size = 'md',
  'data-testid': testId,
}: PfSegmentedButtonProps) {
  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    gap: '4px',
  }

  function getSegmentStyle(isActive: boolean): React.CSSProperties {
    return {
      ...sizeStyles[size],
      background: isActive ? 'var(--pf-accent)' : 'transparent',
      color: isActive ? 'var(--pf-on-accent, var(--pf-bg-base))' : 'var(--pf-text-muted)',
      fontWeight: isActive ? 600 : 400,
      border: '1px solid var(--pf-border)',
      borderRadius: 'var(--pf-radius-sm)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      fontFamily: 'var(--pf-font-ui)',
      transition: 'color var(--pf-duration-fast) var(--pf-easing-default)',
      outline: 'none',
    }
  }

  return (
    <div style={containerStyle} data-testid={testId}>
      {options.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            style={getSegmentStyle(isActive)}
            onClick={() => {
              if (!disabled) onChange(option.value)
            }}
            disabled={disabled}
            aria-pressed={isActive}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
