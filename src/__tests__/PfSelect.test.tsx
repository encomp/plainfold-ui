import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PfSelect } from '../components/PfSelect'
import { openSelect, pickOption } from './selectHelpers'

const options = [
  { value: '', label: 'Any status' },
  { value: 'running', label: 'Running' },
  { value: 'done', label: 'Done', disabled: true },
]

describe('PfSelect', () => {
  it('round-trips the empty value', () => {
    const on = vi.fn()
    render(<PfSelect aria-label="Status" value="" onChange={on} options={options} />)
    const trigger = screen.getByRole('combobox', { name: 'Status' })
    expect(trigger).toHaveTextContent('Any status')
    openSelect(trigger)
    pickOption('Running')
    expect(on).toHaveBeenLastCalledWith('running')
  })

  it('reports "" when the empty option is picked', () => {
    const on = vi.fn()
    render(<PfSelect aria-label="Status" value="running" onChange={on} options={options} />)
    openSelect(screen.getByRole('combobox'))
    pickOption('Any status')
    expect(on).toHaveBeenLastCalledWith('')
  })

  it('is keyboard operable', async () => {
    const on = vi.fn()
    render(<PfSelect aria-label="Status" value="" onChange={on} options={options} />)
    const trigger = screen.getByRole('combobox')
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'Enter' })
    await waitFor(() => expect(document.activeElement).toHaveAttribute('role', 'option'))
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowDown' })
    await waitFor(() => expect(document.activeElement).toHaveTextContent('Running'))
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Enter' })
    expect(on).toHaveBeenCalledWith('running')
  })

  it('shows the visible label and the placeholder', () => {
    render(<PfSelect label="Pick" value="zzz" placeholder="Choose" onChange={() => {}} options={options} />)
    expect(screen.getByRole('combobox', { name: 'Pick' })).toHaveTextContent('Choose')
  })

  it('puts the test id and disabled on the trigger', () => {
    render(<PfSelect aria-label="S" value="" onChange={() => {}} options={options} disabled data-testid="s" />)
    expect(screen.getByTestId('s')).toBeDisabled()
    expect(screen.getByRole('combobox')).toBe(screen.getByTestId('s'))
  })

  it('marks a disabled option', () => {
    render(<PfSelect aria-label="S" value="" onChange={() => {}} options={options} />)
    openSelect(screen.getByRole('combobox'))
    expect(screen.getByRole('option', { name: 'Done' })).toHaveAttribute('aria-disabled', 'true')
  })

  it('does not report a disabled option', () => {
    const on = vi.fn()
    render(<PfSelect aria-label="S" value="" onChange={on} options={options} />)
    openSelect(screen.getByRole('combobox'))
    pickOption('Done')
    expect(on).not.toHaveBeenCalled()
  })

  it('flags an invalid field and links its description', () => {
    render(<PfSelect aria-label="S" value="" onChange={() => {}} options={options} invalid describedBy="why" />)
    const t = screen.getByRole('combobox')
    expect(t).toHaveAttribute('aria-invalid', 'true')
    expect(t).toHaveAttribute('aria-describedby', 'why')
    expect(t.getAttribute('style')).toContain('var(--pf-danger)')
  })
})
