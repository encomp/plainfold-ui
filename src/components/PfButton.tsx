import React, { useId, useState } from 'react'
import { pfText } from '../tokens/type'

export type PfButtonVariant = 'primary' | 'secondary' | 'quiet' | 'ghost' | 'danger'
type PfButtonSize = 'sm' | 'md' | 'lg'

interface PfButtonProps {
  variant?: PfButtonVariant
  size?: PfButtonSize
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  reason?: string
  type?: 'button' | 'submit' | 'reset'
  style?: React.CSSProperties
  'aria-label'?: string
  'aria-expanded'?: boolean
  'aria-controls'?: string
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'dialog'
  'aria-pressed'?: boolean
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false'
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
  quiet: {
    background: 'transparent',
    color: 'var(--pf-accent-text, var(--pf-accent))',
    border: '1px solid transparent',
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
  sm: { padding: '6px 12px', fontSize: pfText.meta, borderRadius: 'var(--pf-radius-sm)' },
  md: { padding: '8px 16px', fontSize: pfText.body, borderRadius: 'var(--pf-radius-md)' },
  lg: { padding: '12px 20px', fontSize: pfText.section, borderRadius: 'var(--pf-radius-md)' },
}

const hoverStyles: Record<PfButtonVariant, React.CSSProperties> = {
  primary: { filter: 'brightness(0.88)' },
  quiet: { background: 'var(--pf-accent-muted)' },
  ghost: { background: 'var(--pf-accent-muted)' },
  secondary: { filter: 'brightness(1.08)' },
  danger: { filter: 'brightness(1.08)' },
}

const disabledStyle: React.CSSProperties = {
  background: 'var(--pf-bg-surface-alt)',
  color: 'var(--pf-text-muted)',
  border: '1px solid var(--pf-border)',
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
  reason,
  type = 'button',
  style,
  'aria-label': ariaLabel,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls,
  'aria-haspopup': ariaHasPopup,
  'aria-pressed': ariaPressed,
  'aria-current': ariaCurrent,
  'data-testid': dataTestId,
}: PfButtonProps) {
  const [hovered, setHovered] = useState(false)

  const reasonId = useId()
  const isDisabled = disabled || loading
  const showReason = disabled && !!reason

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'var(--pf-font-ui)',
    fontWeight: 500,
    transition: 'all var(--pf-duration-fast) var(--pf-easing-default)',
    outline: 'none',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...(disabled ? disabledStyle : {}),
    ...(hovered && !isDisabled ? hoverStyles[variant] : {}),
    ...style,
  }

  const button = (
    <button
      type={type}
      className="pf-button"
      style={baseStyle}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-haspopup={ariaHasPopup}
      aria-pressed={ariaPressed}
      aria-current={ariaCurrent}
      aria-busy={loading || undefined}
      aria-describedby={showReason ? reasonId : undefined}
      data-testid={dataTestId}
    >
      {loading && <span style={spinnerStyle} aria-hidden="true" data-testid="pf-button-spinner" />}
      {!loading && icon}
      {children}
    </button>
  )

  return (
    <>
      <style>{`@keyframes pf-spin { to { transform: rotate(360deg); } } .pf-button:focus-visible { outline: 2px solid var(--pf-accent-text, var(--pf-accent)) !important; outline-offset: 2px }`}</style>
      {showReason ? (
        <span style={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          {button}
          <span id={reasonId} style={{ fontSize: pfText.meta, color: 'var(--pf-text-secondary)' }}>
            {reason}
          </span>
        </span>
      ) : (
        button
      )}
    </>
  )
}
