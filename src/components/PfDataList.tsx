import React from 'react'
import { useBreakpoint } from '../utils/useBreakpoint'

interface PfDataListColumn<T> {
  key: string
  header: string
  render: (item: T) => React.ReactNode
  width?: string
}

interface PfDataListProps<T> {
  items: T[]
  columns: PfDataListColumn<T>[]
  renderCard: (item: T) => React.ReactNode
  keyExtractor: (item: T) => string
  emptyState?: React.ReactNode
  'data-testid'?: string
}

export function PfDataList<T>({
  items,
  columns,
  renderCard,
  keyExtractor,
  emptyState,
  'data-testid': testId,
}: PfDataListProps<T>) {
  const bp = useBreakpoint()

  if (items.length === 0) {
    return <>{emptyState ?? null}</>
  }

  const isMobile = bp === 'mobile'

  if (isMobile) {
    const cardContainerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }

    return (
      <div style={cardContainerStyle} data-testid={testId}>
        {items.map((item) => (
          <React.Fragment key={keyExtractor(item)}>
            {renderCard(item)}
          </React.Fragment>
        ))}
      </div>
    )
  }

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
  }

  const headerCellStyle = (width?: string): React.CSSProperties => ({
    background: 'var(--pf-bg-surface-alt)',
    color: 'var(--pf-text-secondary)',
    fontSize: '12px',
    fontWeight: 600,
    padding: '8px 12px',
    textAlign: 'left',
    borderBottom: '1px solid var(--pf-border)',
    width: width || undefined,
  })

  const dataCellStyle: React.CSSProperties = {
    padding: '12px',
    borderBottom: '1px solid var(--pf-border)',
    color: 'var(--pf-text-primary)',
    fontSize: '14px',
  }

  return (
    <table style={tableStyle} data-testid={testId}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} style={headerCellStyle(col.width)}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={keyExtractor(item)}>
            {columns.map((col) => (
              <td key={col.key} style={dataCellStyle}>
                {col.render(item)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
