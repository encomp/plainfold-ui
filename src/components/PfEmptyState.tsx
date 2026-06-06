import React from 'react'
import { PfButton } from './PfButton'

interface PfEmptyStateProps {
  icon?: React.ReactNode
  heading: string
  subtext: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function PfEmptyState({
  icon,
  heading,
  subtext,
  action,
}: PfEmptyStateProps) {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '32px',
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
    fontSize: '16px',
    fontWeight: 600,
    margin: 0,
  }

  const subtextStyle: React.CSSProperties = {
    color: 'var(--pf-text-secondary)',
    fontSize: '14px',
    margin: 0,
  }

  return (
    <div style={containerStyle}>
      {icon && <div style={iconStyle}>{icon}</div>}
      <h3 style={headingStyle}>{heading}</h3>
      <p style={subtextStyle}>{subtext}</p>
      {action && (
        <PfButton variant="primary" onClick={action.onClick}>
          {action.label}
        </PfButton>
      )}
    </div>
  )
}
