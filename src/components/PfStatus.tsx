import React from 'react'
import { pfText } from '../tokens/type'

type PfStatusTone = 'ok' | 'warn' | 'off' | 'danger' | 'busy'

interface PfStatusProps {
  tone: PfStatusTone
  children: React.ReactNode
  'data-testid'?: string
}

const toneColours: Record<PfStatusTone, string> = {
  ok: 'var(--pf-positive)',
  warn: 'var(--pf-warning)',
  off: 'var(--pf-text-muted)',
  danger: 'var(--pf-danger)',
  busy: 'var(--pf-accent)',
}

export function PfStatus({ tone, children, 'data-testid': dataTestId }: PfStatusProps) {
  return (
    <span
      data-testid={dataTestId}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: pfText.meta,
        fontWeight: 600,
        padding: '3px 9px',
        borderRadius: '99px',
        background: 'var(--pf-bg-surface-alt)',
        color: 'var(--pf-text-primary)',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        aria-hidden="true"
        style={{ width: '7px', height: '7px', borderRadius: '50%', background: toneColours[tone] }}
      />
      {children}
    </span>
  )
}
