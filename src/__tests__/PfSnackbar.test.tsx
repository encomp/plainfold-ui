import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
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

  it('stays open when autoHideDuration is null', () => {
    const onClose = vi.fn()
    render(<PfSnackbar open onClose={onClose} message="Stay" autoHideDuration={null} />)
    act(() => { vi.advanceTimersByTime(60000) })
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByTestId('pf-snackbar')).toBeInTheDocument()
  })

  it('pauses while hovered and resumes after leave', () => {
    const onClose = vi.fn()
    render(<PfSnackbar open onClose={onClose} message="Hover" autoHideDuration={10000} />)
    const el = screen.getByTestId('pf-snackbar')
    act(() => { vi.advanceTimersByTime(4000) })
    fireEvent.pointerEnter(el)
    act(() => { vi.advanceTimersByTime(20000) })
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.pointerLeave(el)
    act(() => { vi.advanceTimersByTime(5999) })
    expect(onClose).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(1) })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('pauses while focus is inside', () => {
    const onClose = vi.fn()
    render(
      <PfSnackbar
        open
        onClose={onClose}
        message="Focus"
        autoHideDuration={10000}
        action={{ label: 'Undo', onClick: () => {} }}
      />
    )
    const btn = screen.getByRole('button', { name: 'Undo' })
    act(() => { vi.advanceTimersByTime(4000) })
    act(() => { btn.focus() })
    act(() => { vi.advanceTimersByTime(20000) })
    expect(onClose).not.toHaveBeenCalled()
    act(() => { btn.blur() })
    act(() => { vi.advanceTimersByTime(6000) })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('close button calls onClose and has the given name', () => {
    const onClose = vi.fn()
    render(<PfSnackbar open onClose={onClose} message="Closable" autoHideDuration={null} closeLabel="Close" />)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
