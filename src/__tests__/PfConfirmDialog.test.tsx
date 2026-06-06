import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PfConfirmDialog } from '../components/PfConfirmDialog'

describe('PfConfirmDialog', () => {
  it('renders when open', () => {
    render(
      <PfConfirmDialog
        open
        onClose={() => {}}
        title="Confirm Action"
        description="Are you sure?"
        onConfirm={() => {}}
      />
    )
    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
  })

  it('shows title and description', () => {
    render(
      <PfConfirmDialog
        open
        onClose={() => {}}
        title="Delete Item"
        description="This action cannot be undone."
        onConfirm={() => {}}
      />
    )
    expect(screen.getByText('Delete Item')).toBeInTheDocument()
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
  })

  it('calls onConfirm and onClose when confirm button is clicked', () => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()
    render(
      <PfConfirmDialog
        open
        onClose={onClose}
        title="Confirm"
        description="Proceed?"
        onConfirm={onConfirm}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn()
    render(
      <PfConfirmDialog
        open
        onClose={onClose}
        title="Confirm"
        description="Proceed?"
        onConfirm={() => {}}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
