import React from 'react'
import { pfText } from '../tokens/type'
import { PfActionLink } from './PfActionLink'

export interface PfPageHeaderProps {
  title: React.ReactNode
  context?: React.ReactNode
  back?: { label: string; href: string }
  actions?: React.ReactNode
  onNavigate?: (href: string) => void
  'data-testid'?: string
}

export function PfPageHeader({
  title,
  context,
  back,
  actions,
  onNavigate,
  'data-testid': dataTestId,
}: PfPageHeaderProps) {
  return (
    <header
      data-testid={dataTestId}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: '16px',
        fontFamily: 'var(--pf-font-ui)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
        {back && (
          <span>
            <PfActionLink kind="back" href={back.href} onNavigate={onNavigate}>
              {back.label}
            </PfActionLink>
          </span>
        )}
        <h1
          style={{
            margin: 0,
            fontSize: pfText.page,
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
            color: 'var(--pf-text-primary)',
          }}
        >
          {title}
        </h1>
        {context && (
          <span style={{ fontSize: pfText.meta, color: 'var(--pf-text-secondary)' }}>{context}</span>
        )}
      </div>
      {actions && <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{actions}</div>}
    </header>
  )
}
