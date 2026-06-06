import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PfSnackbar } from '../components/PfSnackbar'

describe('PfSnackbar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders when open', () => {
    render(
      <PfSnackbar open onClose={() => {}} message="Item saved" />
    )
    expect(screen.getByText('Item saved')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('does not render when not open', () => {
    render(
      <PfSnackbar open={false} onClose={() => {}} message="Hidden" />
    )
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
  })

  it('calls onClose after autoHideDuration', () => {
    const onClose = vi.fn()
    render(
      <PfSnackbar open onClose={onClose} message="Auto hide" autoHideDuration={3000} />
    )

    expect(onClose).not.toHaveBeenCalled()

    vi.advanceTimersByTime(3000)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('uses default autoHideDuration of 5000ms', () => {
    const onClose = vi.fn()
    render(
      <PfSnackbar open onClose={onClose} message="Default timeout" />
    )

    vi.advanceTimersByTime(4999)
    expect(onClose).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders action button', () => {
    const handleAction = vi.fn()
    render(
      <PfSnackbar
        open
        onClose={() => {}}
        message="Deleted"
        action={{ label: 'Undo', onClick: handleAction }}
      />
    )

    const actionButton = screen.getByRole('button', { name: 'Undo' })
    expect(actionButton).toBeInTheDocument()

    fireEvent.click(actionButton)
    expect(handleAction).toHaveBeenCalledTimes(1)
  })

  it('does not render action button when not provided', () => {
    render(
      <PfSnackbar open onClose={() => {}} message="Simple" />
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
