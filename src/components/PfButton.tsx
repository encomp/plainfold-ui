import React, { useState } from 'react'

type PfButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type PfButtonSize = 'sm' | 'md' | 'lg'

interface PfButtonProps {
  variant?: PfButtonVariant
  size?: PfButtonSize
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  style?: React.CSSProperties
  'aria-label'?: string
  'data-testid'?: string
}

const variantStyles: Record<PfButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--pf-accent)',
    color: 'var(--pf-on-accent, var(--pf-bg-base))',
    border: '1px solid transparent',
  },
  secondary: {
    background: 'var(--pf-bg-surface-alt)',
    color: 'var(--pf-text-primary)',
    border: '1px solid var(--pf-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--pf-text-secondary)',
    border: '1px solid transparent',
  },
  danger: {
    background: 'var(--pf-danger-muted)',
    color: 'var(--pf-danger)',
    border: '1px solid var(--pf-danger)',
  },
}

const sizeStyles: Record<PfButtonSize, React.CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: '12px', borderRadius: 'var(--pf-radius-sm)' },
  md: { padding: '8px 16px', fontSize: '14px', borderRadius: 'var(--pf-radius-md)' },
  lg: { padding: '12px 20px', fontSize: '16px', borderRadius: 'var(--pf-radius-md)' },
}

const hoverStyles: Record<PfButtonVariant, React.CSSProperties> = {
  primary: { filter: 'brightness(0.88)' },
  ghost: { background: 'var(--pf-accent-muted)' },
  secondary: { filter: 'brightness(1.08)' },
  danger: { filter: 'brightness(1.08)' },
}

const spinnerStyle: React.CSSProperties = {
  display: 'inline-block',
  width: '1em',
  height: '1em',
  border: '2px solid currentColor',
  borderTopColor: 'transparent',
  borderRadius: '50%',
  animation: 'pf-spin 0.6s linear infinite',
}

export function PfButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  onClick,
  disabled = false,
  type = 'button',
  style,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}: PfButtonProps) {
  const [hovered, setHovered] = useState(false)

  const isDisabled = disabled || loading

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'var(--pf-font-ui)',
    fontWeight: 500,
    transition: 'all var(--pf-duration-fast) var(--pf-easing-default)',
    outline: 'none',
    userSelect: 'none',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...(hovered && !isDisabled ? hoverStyles[variant] : {}),
    ...style,
  }

  return (
    <>
      <style>{`@keyframes pf-spin { to { transform: rotate(360deg); } } .pf-button:focus-visible { outline: 2px solid var(--pf-accent-text, var(--pf-accent)) !important; outline-offset: 2px }`}</style>
      <button
        type={type}
        className="pf-button"
        style={baseStyle}
        onClick={isDisabled ? undefined : onClick}
        disabled={isDisabled}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={ariaLabel}
        data-testid={dataTestId}
      >
        {loading ? (
          <span style={spinnerStyle} data-testid="pf-button-spinner" />
        ) : (
          <>
            {icon}
            {children}
          </>
        )}
      </button>
    </>
  )
}
