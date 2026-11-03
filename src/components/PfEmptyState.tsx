import React from 'react'
import { PfButton } from './PfButton'
import { pfText } from '../tokens/type'

interface PfEmptyStateProps {
  icon?: React.ReactNode
  heading: string
  subtext: React.ReactNode
  actions?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  'data-testid'?: string
}

export function PfEmptyState({
  icon,
  heading,
  subtext,
  actions,
  action,
  'data-testid': dataTestId,
}: PfEmptyStateProps) {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    borderWidth: '1px',
    borderStyle: 'dashed',
    borderColor: 'var(--pf-border-strong)',
    borderRadius: 'var(--pf-radius-md)',
    padding: '28px 24px',
    gap: '12px',
  }

  const iconStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    color: 'var(--pf-text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const headingStyle: React.CSSProperties = {
    color: 'var(--pf-text-primary)',
    fontSize: pfText.card,
    fontWeight: 600,
    margin: 0,
  }

  const subtextStyle: React.CSSProperties = {
    color: 'var(--pf-text-secondary)',
    fontSize: pfText.body,
    margin: 0,
    maxWidth: '52ch',
  }

  return (
    <div style={containerStyle} data-testid={dataTestId}>
      {icon && <div style={iconStyle}>{icon}</div>}
      <h2 style={headingStyle}>{heading}</h2>
      <p style={subtextStyle}>{subtext}</p>
      {action && (
        <PfButton variant="primary" onClick={action.onClick}>
          {action.label}
        </PfButton>
      )}
      {actions}
    </div>
  )
}
