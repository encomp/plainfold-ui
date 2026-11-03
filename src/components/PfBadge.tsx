import React from 'react'
import { pfText } from '../tokens/type'

type PfBadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'muted'

interface PfBadgeProps {
  variant?: PfBadgeVariant
  outline?: boolean
  dashed?: boolean
  children: React.ReactNode
  'data-testid'?: string
}

const variantStyles: Record<PfBadgeVariant, React.CSSProperties> = {
  default: {
    background: 'var(--pf-accent-muted)',
    color: 'var(--pf-accent-text, var(--pf-accent))',
  },
  success: {
    background: 'var(--pf-positive-muted)',
    color: 'var(--pf-positive)',
  },
  warning: {
    background: 'var(--pf-warning-muted)',
    color: 'var(--pf-warning)',
  },
  danger: {
    background: 'var(--pf-danger-muted)',
    color: 'var(--pf-danger)',
  },
  muted: {
    background: 'var(--pf-bg-surface-alt)',
    color: 'var(--pf-text-muted)',
  },
}

export function PfBadge({
  variant = 'default',
  outline = false,
  dashed = false,
  children,
  'data-testid': dataTestId,
}: PfBadgeProps) {
  const style: React.CSSProperties = {
    borderRadius: 'var(--pf-radius-sm)',
    fontSize: pfText.label,
    padding: '2px 8px',
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    ...variantStyles[variant],
  }

  if (outline || dashed) {
    style.background = 'transparent'
    style.borderWidth = '1px'
    style.borderStyle = dashed ? 'dashed' : 'solid'
    style.borderColor = variant === 'muted' ? 'var(--pf-border-strong)' : style.color
  }

  return (
    <span style={style} data-testid={dataTestId}>
      {children}
    </span>
  )
}
