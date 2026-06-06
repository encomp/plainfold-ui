import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PfDialog } from '../components/PfDialog'

describe('PfDialog', () => {
  it('renders when open', () => {
    render(
      <PfDialog open onClose={() => {}} title="Test Dialog">
        <p>Dialog content</p>
      </PfDialog>
    )
    expect(screen.getByText('Dialog content')).toBeInTheDocument()
  })

  it('shows title', () => {
    render(
      <PfDialog open onClose={() => {}} title="My Title">
        <p>Content</p>
      </PfDialog>
    )
    expect(screen.getByText('My Title')).toBeInTheDocument()
  })

  it('shows description', () => {
    render(
      <PfDialog open onClose={() => {}} title="Title" description="A helpful description">
        <p>Content</p>
      </PfDialog>
    )
    expect(screen.getByText('A helpful description')).toBeInTheDocument()
  })

  it('has close button', () => {
    render(
      <PfDialog open onClose={() => {}} title="Title">
        <p>Content</p>
      </PfDialog>
    )
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(
      <PfDialog open onClose={onClose} title="Title">
        <p>Content</p>
      </PfDialog>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders footer', () => {
    render(
      <PfDialog open onClose={() => {}} title="Title" footer={<button>Save</button>}>
        <p>Content</p>
      </PfDialog>
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })
})
