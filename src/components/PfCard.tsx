import React, { useId, useState } from 'react'
import { pfText } from '../tokens/type'

type PfCardPadding = 'sm' | 'md' | 'lg'

interface PfCardProps {
  children: React.ReactNode
  padding?: PfCardPadding
  hoverable?: boolean
  title?: React.ReactNode
  meta?: React.ReactNode
  footer?: React.ReactNode
  'aria-label'?: string
  'data-testid'?: string
}

const paddingValues: Record<PfCardPadding, string> = {
  sm: '12px',
  md: '16px 18px',
  lg: '28px',
}

export function PfCard({
  children,
  padding = 'md',
  hoverable = false,
  title,
  meta,
  footer,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}: PfCardProps) {
  const [hovered, setHovered] = useState(false)
  const titleId = useId()

  const style: React.CSSProperties = {
    background: 'var(--pf-bg-surface)',
    border: `1px solid ${hovered && hoverable ? 'var(--pf-border-strong)' : 'var(--pf-border)'}`,
    borderRadius: 'var(--pf-radius-md)',
    padding: paddingValues[padding],
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'all var(--pf-duration-fast) var(--pf-easing-default)',
    transform: hovered && hoverable ? 'translateY(-1px)' : 'none',
  }

  const Tag = title || ariaLabel ? 'section' : 'div'

  return (
    <Tag
      style={style}
      data-testid={dataTestId}
      aria-label={title ? undefined : ariaLabel}
      aria-labelledby={title ? titleId : undefined}
      onMouseEnter={hoverable ? () => setHovered(true) : undefined}
      onMouseLeave={hoverable ? () => setHovered(false) : undefined}
    >
      {(title || meta) && (
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          {title && (
            <h2 id={titleId} style={{ margin: 0, fontSize: pfText.card, fontWeight: 600, color: 'var(--pf-text-primary)' }}>
              {title}
            </h2>
          )}
          {meta && <span style={{ fontSize: pfText.meta, color: 'var(--pf-text-muted)' }}>{meta}</span>}
        </div>
      )}
      {children}
      {footer && <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>{footer}</div>}
    </Tag>
  )
}
