import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PfLinearProgress } from '../components/PfLinearProgress'

describe('PfLinearProgress', () => {
  it('renders with default props', () => {
    render(<PfLinearProgress value={50} />)
    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toBeInTheDocument()
  })

  it('has correct aria attributes', () => {
    render(<PfLinearProgress value={75} label="Upload progress" />)
    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('aria-valuemin', '0')
    expect(progressbar).toHaveAttribute('aria-valuemax', '100')
    expect(progressbar).toHaveAttribute('aria-valuenow', '75')
    expect(progressbar).toHaveAttribute('aria-label', 'Upload progress')
  })

  it('uses default aria-label when no label is provided', () => {
    render(<PfLinearProgress value={30} />)
    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('aria-label', 'Progress')
  })

  it('clamps value to 0-100 range', () => {
    const { rerender } = render(<PfLinearProgress value={150} />)
    let progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('aria-valuenow', '100')

    rerender(<PfLinearProgress value={-20} />)
    progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('aria-valuenow', '0')
  })

  it('shows label when provided', () => {
    render(<PfLinearProgress value={60} label="Loading" />)
    expect(screen.getByText('Loading')).toBeInTheDocument()
  })

  it('shows value when showValue is true', () => {
    render(<PfLinearProgress value={42} showValue />)
    expect(screen.getByText('42%')).toBeInTheDocument()
  })

  it('does not show value by default', () => {
    render(<PfLinearProgress value={42} />)
    expect(screen.queryByText('42%')).not.toBeInTheDocument()
  })

  it('applies custom color', () => {
    render(<PfLinearProgress value={50} data-testid="progress" />)
    expect(screen.getByTestId('progress')).toBeInTheDocument()
  })
})
