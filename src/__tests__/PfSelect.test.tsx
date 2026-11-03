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

  it('styles the trigger from tokens', () => {
    render(<PfSelect aria-label="S" value="" onChange={() => {}} options={options} data-testid="s" />)
    const style = screen.getByTestId('s').getAttribute('style') ?? ''
    expect(style).toContain('var(--pf-border-strong)')
    expect(style).toContain('var(--pf-bg-surface)')
    expect(style).toContain('border-radius: 8px')
  })

  it('marks a disabled option', () => {
    render(<PfSelect aria-label="S" value="" onChange={() => {}} options={options} />)
    openSelect(screen.getByRole('combobox'))
    expect(screen.getByRole('option', { name: 'Done' })).toHaveAttribute('aria-disabled', 'true')
  })

  it('shows the accent as text-safe colour on the checked mark', () => {
    render(<PfSelect aria-label="S" value="running" onChange={() => {}} options={options} />)
    openSelect(screen.getByRole('combobox'))
    const html = screen.getByRole('option', { name: 'Running' }).innerHTML
    expect(html).toContain('var(--pf-accent-text, var(--pf-accent))')
  })
})
