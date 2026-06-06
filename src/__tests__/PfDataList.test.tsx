import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { useBreakpoint } from '../utils/useBreakpoint'
import { PfDataList } from '../components/PfDataList'

vi.mock('../utils/useBreakpoint', () => ({
  useBreakpoint: vi.fn(() => 'desktop'),
  BREAKPOINTS: { mobile: 0, tablet: 768, desktop: 1024 },
}))

interface TestItem {
  id: string
  name: string
  value: number
}

const testItems: TestItem[] = [
  { id: '1', name: 'Alpha', value: 10 },
  { id: '2', name: 'Beta', value: 20 },
]

const columns = [
  { key: 'name', header: 'Name', render: (item: TestItem) => item.name },
  { key: 'value', header: 'Value', render: (item: TestItem) => item.value },
]

const renderCard = (item: TestItem) => (
  <div data-testid={`card-${item.id}`}>{item.name}: {item.value}</div>
)

const keyExtractor = (item: TestItem) => item.id

describe('PfDataList', () => {
  it('renders a table on desktop', () => {
    vi.mocked(useBreakpoint).mockReturnValue('desktop')
    render(
      <PfDataList
        items={testItems}
        columns={columns}
        renderCard={renderCard}
        keyExtractor={keyExtractor}
        data-testid="data-list"
      />
    )
    // Should render as a table
    const table = screen.getByTestId('data-list')
    expect(table.tagName).toBe('TABLE')
    // Check header cells
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Value')).toBeInTheDocument()
    // Check data cells
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('renders a table on tablet', () => {
    vi.mocked(useBreakpoint).mockReturnValue('tablet')
    render(
      <PfDataList
        items={testItems}
        columns={columns}
        renderCard={renderCard}
        keyExtractor={keyExtractor}
        data-testid="data-list"
      />
    )
    const table = screen.getByTestId('data-list')
    expect(table.tagName).toBe('TABLE')
  })

  it('renders cards on mobile', () => {
    vi.mocked(useBreakpoint).mockReturnValue('mobile')
    render(
      <PfDataList
        items={testItems}
        columns={columns}
        renderCard={renderCard}
        keyExtractor={keyExtractor}
        data-testid="data-list"
      />
    )
    // Should render cards, not a table
    const container = screen.getByTestId('data-list')
    expect(container.tagName).toBe('DIV')
    expect(screen.getByTestId('card-1')).toBeInTheDocument()
    expect(screen.getByTestId('card-2')).toBeInTheDocument()
  })

  it('shows empty state when no items', () => {
    vi.mocked(useBreakpoint).mockReturnValue('desktop')
    render(
      <PfDataList
        items={[]}
        columns={columns}
        renderCard={renderCard}
        keyExtractor={keyExtractor}
        emptyState={<div data-testid="empty">No data available</div>}
      />
    )
    expect(screen.getByTestId('empty')).toBeInTheDocument()
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('renders nothing when items empty and no emptyState', () => {
    vi.mocked(useBreakpoint).mockReturnValue('desktop')
    const { container } = render(
      <PfDataList
        items={[]}
        columns={columns}
        renderCard={renderCard}
        keyExtractor={keyExtractor}
      />
    )
    expect(container.innerHTML).toBe('')
  })
})
