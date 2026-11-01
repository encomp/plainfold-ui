import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PfTooltip } from '../components/PfTooltip'

describe('PfTooltip', () => {
  it('renders children', () => {
    render(
      <PfTooltip content="Helpful tip">
        <button>Hover me</button>
      </PfTooltip>
    )
    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument()
  })

  it('renders trigger element', () => {
    render(
      <PfTooltip content="Info">
        <span data-testid="trigger">Target</span>
      </PfTooltip>
    )
    expect(screen.getByTestId('trigger')).toBeInTheDocument()
    expect(screen.getByTestId('trigger')).toHaveTextContent('Target')
  })

  it('keeps children interactive', () => {
    render(
      <PfTooltip content="Click info">
        <button type="button">Action</button>
      </PfTooltip>
    )
    const button = screen.getByRole('button', { name: 'Action' })
    expect(button).toBeInTheDocument()
    expect(button).not.toBeDisabled()
  })

  describe('controlled open', () => {
    it('shows content when open={true}', () => {
      render(
        <PfTooltip content="Shown tip" open={true}>
          <button>Target</button>
        </PfTooltip>
      )
      expect(screen.getAllByText('Shown tip').length).toBeGreaterThan(0)
    })

    it('hides content when open={false} despite hover', () => {
      render(
        <PfTooltip content="Hidden tip" open={false} delayDuration={0}>
          <button>Target</button>
        </PfTooltip>
      )
      const button = screen.getByRole('button', { name: 'Target' })
      fireEvent.pointerMove(button)
      fireEvent.mouseEnter(button)
      expect(screen.queryByText('Hidden tip')).not.toBeInTheDocument()
    })

    it('fires onOpenChange on hover', async () => {
      const onOpenChange = vi.fn()
      render(
        <PfTooltip content="Tip" open={false} onOpenChange={onOpenChange} delayDuration={0}>
          <button>Target</button>
        </PfTooltip>
      )
      const button = screen.getByRole('button', { name: 'Target' })
      fireEvent.pointerMove(button)
      await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true))
    })

    it('fires onOpenChange(false) on Escape', () => {
      const onOpenChange = vi.fn()
      render(
        <PfTooltip content="Tip" open={true} onOpenChange={onOpenChange}>
          <button>Target</button>
        </PfTooltip>
      )
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('uncontrolled: opens on focus', async () => {
    render(
      <PfTooltip content="Focus tip">
        <button>Target</button>
      </PfTooltip>
    )
    fireEvent.focus(screen.getByRole('button', { name: 'Target' }))
    expect((await screen.findAllByText('Focus tip')).length).toBeGreaterThan(0)
  })
})
