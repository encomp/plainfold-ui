import type { CSSProperties } from 'react'

/** Single source of table styling for PfDataTable (exported for other tables that must match). */
export const pfTableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
}

export const pfTableHeaderStyle: CSSProperties = {
  background: 'var(--pf-bg-surface-alt)',
  color: 'var(--pf-text-secondary)',
  fontSize: '13px',
  fontWeight: 600,
  fontVariant: 'small-caps',
  letterSpacing: '0.04em',
  padding: '8px 12px',
  textAlign: 'left',
  borderBottom: '1px solid var(--pf-border)',
  whiteSpace: 'nowrap',
}

export const pfTableCellStyle: CSSProperties = {
  padding: '12px',
  borderBottom: '1px solid var(--pf-border)',
  color: 'var(--pf-text-primary)',
  fontSize: '14px',
  textAlign: 'left',
  verticalAlign: 'top',
  overflowWrap: 'anywhere',
}

export const pfTableNumberStyle: CSSProperties = {
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
}
