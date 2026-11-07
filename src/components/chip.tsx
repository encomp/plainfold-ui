import React from 'react'
import { pfText } from '../tokens/type'

/** Internal: the removable chip shared by PfSearchMultiSelect and PfChipListField. Not exported from the package. */
export const chipCss = `
.pf-chip-x { border: 0; background: transparent; color: var(--pf-text-secondary); cursor: pointer; padding: 0 2px;
  font-size: ${pfText.body}; line-height: 1; border-radius: 4px }
.pf-chip-x:hover { color: var(--pf-text-primary) }
.pf-chip-x:focus-visible { outline: 2px solid var(--pf-accent-text, var(--pf-accent)) }
`

export function Chip({ children, removeLabel, onRemove, plain }: {
  children: React.ReactNode
  removeLabel?: string
  onRemove?: () => void
  /** No remove button (read-only) */
  plain?: boolean
}) {
  return (
    <li
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, padding: plain ? '2px 8px' : '2px 4px 2px 8px', fontSize: pfText.meta,
        background: 'var(--pf-accent-muted)', border: '1px solid var(--pf-border)', borderRadius: 'var(--pf-radius-sm)',
      }}
    >
      {children}
      {!plain && (
        <button type="button" className="pf-chip-x" aria-label={removeLabel} onClick={onRemove}>
          <span aria-hidden="true">×</span>
        </button>
      )}
    </li>
  )
}
