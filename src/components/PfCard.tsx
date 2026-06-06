import React, { useState } from 'react'

type PfCardPadding = 'sm' | 'md' | 'lg'

interface PfCardProps {
  children: React.ReactNode
  padding?: PfCardPadding
  hoverable?: boolean
  'data-testid'?: string
}

const paddingValues: Record<PfCardPadding, string> = {
  sm: '12px',
  md: '20px',
  lg: '28px',
}

export function PfCard({
  children,
  padding = 'md',
  hoverable = false,
  'data-testid': dataTestId,
}: PfCardProps) {
  const [hovered, setHovered] = useState(false)

  const style: React.CSSProperties = {
    background: 'var(--pf-bg-surface)',
    border: `1px solid ${hovered && hoverable ? 'var(--pf-border-strong)' : 'var(--pf-border)'}`,
    borderRadius: 'var(--pf-radius-md)',
    padding: paddingValues[padding],
    transition: 'all var(--pf-duration-fast) var(--pf-easing-default)',
    transform: hovered && hoverable ? 'translateY(-1px)' : 'none',
  }

  return (
    <div
      style={style}
      data-testid={dataTestId}
      onMouseEnter={hoverable ? () => setHovered(true) : undefined}
      onMouseLeave={hoverable ? () => setHovered(false) : undefined}
    >
      {children}
    </div>
  )
}
