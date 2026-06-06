import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PfBottomSheet } from '../components/PfBottomSheet'

describe('PfBottomSheet', () => {
  it('renders when open', () => {
    render(
      <PfBottomSheet open onClose={() => {}}>
        <p>Sheet content</p>
      </PfBottomSheet>
    )
    expect(screen.getByText('Sheet content')).toBeInTheDocument()
  })

  it('shows title', () => {
    render(
      <PfBottomSheet open onClose={() => {}} title="My Sheet">
        <p>Content</p>
      </PfBottomSheet>
    )
    expect(screen.getByText('My Sheet')).toBeInTheDocument()
  })

  it('shows children', () => {
    render(
      <PfBottomSheet open onClose={() => {}}>
        <div data-testid="child">Hello</div>
      </PfBottomSheet>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByTestId('child')).toHaveTextContent('Hello')
  })

  it('has close button when title is present', () => {
    render(
      <PfBottomSheet open onClose={() => {}} title="Sheet">
        <p>Content</p>
      </PfBottomSheet>
    )
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })
})
