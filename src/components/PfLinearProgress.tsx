import React from 'react'

interface PfLinearProgressProps {
  value: number
  label?: string
  showValue?: boolean
  color?: string
  'data-testid'?: string
}

export function PfLinearProgress({
  value,
  label,
  showValue = false,
  color,
  'data-testid': dataTestId,
}: PfLinearProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100)

  const trackStyle: React.CSSProperties = {
    background: 'var(--pf-bg-surface-alt)',
    height: '8px',
    borderRadius: 'var(--pf-radius-sm)',
    overflow: 'hidden',
    width: '100%',
  }

  const fillStyle: React.CSSProperties = {
    background: color ?? 'var(--pf-accent)',
    height: '100%',
    width: `${clampedValue}%`,
    borderRadius: 'var(--pf-radius-sm)',
    transition: 'width var(--pf-duration-fast) var(--pf-easing-default)',
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
    fontSize: '12px',
  }

  const labelStyle: React.CSSProperties = {
    color: 'var(--pf-text-primary)',
    fontWeight: 500,
  }

  const valueStyle: React.CSSProperties = {
    color: 'var(--pf-text-secondary)',
  }

  const showHeader = label || showValue

  return (
    <div data-testid={dataTestId}>
      {showHeader && (
        <div style={headerStyle}>
          {label && <span style={labelStyle}>{label}</span>}
          {showValue && <span style={valueStyle}>{Math.round(clampedValue)}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clampedValue}
        aria-label={label ?? 'Progress'}
        style={trackStyle}
      >
        <div style={fillStyle} />
      </div>
    </div>
  )
}
