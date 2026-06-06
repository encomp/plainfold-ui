import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PfSegmentedButton } from '../components/PfSegmentedButton'

const options = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]

describe('PfSegmentedButton', () => {
  it('renders all options', () => {
    render(
      <PfSegmentedButton options={options} value="day" onChange={() => {}} />
    )
    expect(screen.getByText('Day')).toBeInTheDocument()
    expect(screen.getByText('Week')).toBeInTheDocument()
    expect(screen.getByText('Month')).toBeInTheDocument()
  })

  it('highlights the active option with aria-pressed', () => {
    render(
      <PfSegmentedButton options={options} value="week" onChange={() => {}} />
    )
    expect(screen.getByText('Week')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Day')).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText('Month')).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onChange when an option is clicked', () => {
    const handleChange = vi.fn()
    render(
      <PfSegmentedButton options={options} value="day" onChange={handleChange} />
    )
    fireEvent.click(screen.getByText('Month'))
    expect(handleChange).toHaveBeenCalledWith('month')
  })

  it('applies disabled state', () => {
    const handleChange = vi.fn()
    render(
      <PfSegmentedButton options={options} value="day" onChange={handleChange} disabled />
    )
    const dayButton = screen.getByText('Day')
    expect(dayButton).toBeDisabled()
    expect(dayButton.style.opacity).toBe('0.5')
    expect(dayButton.style.cursor).toBe('not-allowed')

    fireEvent.click(screen.getByText('Week'))
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('applies sm size styles', () => {
    render(
      <PfSegmentedButton options={options} value="day" onChange={() => {}} size="sm" />
    )
    const button = screen.getByText('Day')
    expect(button.style.fontSize).toBe('12px')
    expect(button.style.padding).toBe('3px 10px')
  })

  it('applies md size styles by default', () => {
    render(
      <PfSegmentedButton options={options} value="day" onChange={() => {}} />
    )
    const button = screen.getByText('Day')
    expect(button.style.fontSize).toBe('13px')
    expect(button.style.padding).toBe('5px 14px')
  })

  it('active option has fontWeight 600', () => {
    render(
      <PfSegmentedButton options={options} value="month" onChange={() => {}} />
    )
    expect(screen.getByText('Month').style.fontWeight).toBe('600')
    expect(screen.getByText('Day').style.fontWeight).toBe('400')
  })
})
