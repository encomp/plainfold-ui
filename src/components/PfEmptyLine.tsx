import React from 'react'
import { pfText } from '../tokens/type'

interface PfEmptyLineProps {
  children: React.ReactNode
  'data-testid'?: string
}

export function PfEmptyLine({ children, 'data-testid': dataTestId }: PfEmptyLineProps) {
  return (
    <p
      data-testid={dataTestId}
      style={{ margin: 0, fontSize: pfText.body, color: 'var(--pf-text-muted)' }}
    >
      {children}
    </p>
  )
}
