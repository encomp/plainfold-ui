import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PfEmptyState } from '../components/PfEmptyState'

describe('PfEmptyState', () => {
  it('renders heading and subtext', () => {
    render(
      <PfEmptyState heading="No items found" subtext="Try adding some items" />
    )
    expect(screen.getByText('No items found')).toBeInTheDocument()
    expect(screen.getByText('Try adding some items')).toBeInTheDocument()
  })

  it('renders heading as h3', () => {
    render(
      <PfEmptyState heading="Empty" subtext="Nothing here" />
    )
    const heading = screen.getByRole('heading', { level: 3 })
    expect(heading).toHaveTextContent('Empty')
  })

  it('renders optional icon', () => {
    render(
      <PfEmptyState
        icon={<span data-testid="empty-icon">icon</span>}
        heading="No data"
        subtext="Come back later"
      />
    )
    expect(screen.getByTestId('empty-icon')).toBeInTheDocument()
  })

  it('does not render icon when not provided', () => {
    const { container } = render(
      <PfEmptyState heading="No data" subtext="Come back later" />
    )
    // only h3, p, and the container div should exist
    expect(container.querySelectorAll('button')).toHaveLength(0)
  })

  it('renders optional action button', () => {
    const handleClick = vi.fn()
    render(
      <PfEmptyState
        heading="No items"
        subtext="Get started"
        action={{ label: 'Add item', onClick: handleClick }}
      />
    )
    const button = screen.getByRole('button', { name: 'Add item' })
    expect(button).toBeInTheDocument()

    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not render action button when not provided', () => {
    render(
      <PfEmptyState heading="Empty" subtext="Nothing" />
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
