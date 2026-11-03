import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { openSelect, pickOption } from './selectHelpers'
import { PfModelPicker } from '../components/PfModelPicker'
import type { PfModelProvider } from '../components/PfModelPicker'

const providers: PfModelProvider[] = [
  {
    id: 'a',
    label: 'Alpha',
    models: [
      { id: 'a1', label: 'Alpha One', note: '$0.001' },
      { id: 'a2', label: 'Alpha Two' },
    ],
  },
  { id: 'b', label: 'Beta', models: [{ id: 'b1', label: 'Beta One' }] },
  {
    id: 'c',
    label: 'Gamma',
    models: [{ id: 'c1', label: 'Gamma One' }],
    disabled: true,
    disabledNote: 'no key',
  },
]

describe('PfModelPicker', () => {
  it('shows the current provider and model', () => {
    render(
      <PfModelPicker
        providers={providers}
        value={{ provider: 'a', model: 'a2' }}
        onChange={() => {}}
      />,
    )
    expect(screen.getByRole('combobox', { name: 'Provider' })).toHaveTextContent('Alpha')
    expect(screen.getByRole('combobox', { name: 'Model' })).toHaveTextContent('Alpha Two')
  })

  it('emits the first model of a newly chosen provider', () => {
    const onChange = vi.fn()
    render(
      <PfModelPicker
        providers={providers}
        value={{ provider: 'a', model: 'a2' }}
        onChange={onChange}
      />,
    )
    openSelect(screen.getByRole('combobox', { name: 'Provider' }))
    pickOption('Beta')
    expect(onChange).toHaveBeenCalledWith({ provider: 'b', model: 'b1' })
  })

  it('keeps the provider when a model is chosen', () => {
    const onChange = vi.fn()
    render(
      <PfModelPicker
        providers={providers}
        value={{ provider: 'a', model: 'a1' }}
        onChange={onChange}
      />,
    )
    openSelect(screen.getByRole('combobox', { name: 'Model' }))
    pickOption('Alpha Two')
    expect(onChange).toHaveBeenCalledWith({ provider: 'a', model: 'a2' })
  })

  it('disables a provider and shows its note', () => {
    render(
      <PfModelPicker
        providers={providers}
        value={{ provider: 'a', model: 'a1' }}
        onChange={() => {}}
      />,
    )
    openSelect(screen.getByRole('combobox', { name: 'Provider' }))
    const opt = screen.getByRole('option', { name: /Gamma/ })
    expect(opt).toHaveAttribute('aria-disabled', 'true')
    expect(opt).toHaveTextContent('Gamma (no key)')
  })

  it('shows a model note after the label', () => {
    render(
      <PfModelPicker
        providers={providers}
        value={{ provider: 'a', model: 'a1' }}
        onChange={() => {}}
      />,
    )
    openSelect(screen.getByRole('combobox', { name: 'Model' }))
    expect(screen.getByRole('option', { name: 'Alpha One · $0.001' })).toBeInTheDocument()
  })

  it('has an accessible group label, default and custom', () => {
    const { rerender } = render(
      <PfModelPicker
        providers={providers}
        value={{ provider: 'a', model: 'a1' }}
        onChange={() => {}}
      />,
    )
    expect(screen.getByRole('group', { name: 'Model' })).toBeInTheDocument()
    rerender(
      <PfModelPicker
        providers={providers}
        value={{ provider: 'a', model: 'a1' }}
        onChange={() => {}}
        label="Everyday"
      />,
    )
    expect(screen.getByRole('group', { name: 'Everyday' })).toBeInTheDocument()
  })

  it('puts test ids on both triggers', () => {
    render(
      <PfModelPicker
        providers={providers}
        value={{ provider: 'a', model: 'a1' }}
        onChange={() => {}}
        data-testid="mp"
      />,
    )
    expect(screen.getByTestId('mp-provider')).toBe(screen.getByRole('combobox', { name: 'Provider' }))
    expect(screen.getByTestId('mp-model')).toBe(screen.getByRole('combobox', { name: 'Model' }))
  })
})
