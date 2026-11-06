import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { PfSearchMultiSelect } from '../components/PfSearchMultiSelect'
import type { PfSearchMultiSelectProps } from '../components/PfSearchMultiSelect'

const options = [
  { value: 'Apples-value', label: 'Apples', count: 12 },
  { value: 'Pears-value', label: 'Pears', count: 5 },
  { value: 'Plums-value', label: 'Plums', count: 0 },
  { value: 'Quinces-value', label: 'Quinces', count: 3 },
]

function setup(props: Partial<PfSearchMultiSelectProps> = {}) {
  const onChange = vi.fn()
  const p: PfSearchMultiSelectProps = {
    options,
    values: [],
    onChange,
    label: 'Fruit',
    countLabel: (n) => `${n} items`,
    ...props,
  }
  const view = render(<PfSearchMultiSelect {...p} />)
  return { onChange, input: screen.getByRole('combobox', { name: 'Fruit' }) as HTMLInputElement, ...view }
}

const labels = () => screen.queryAllByRole('option').map((o) => within(o).getByText(/^[A-Za-z]+$/).textContent)

describe('PfSearchMultiSelect', () => {
  it('renders a named combobox', () => {
    const { input } = setup()
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).toHaveAttribute('aria-autocomplete', 'list')
  })

  it('opens on typing and narrows by case-insensitive substring', () => {
    const { input } = setup()
    fireEvent.change(input, { target: { value: 'PL' } })
    expect(input).toHaveAttribute('aria-expanded', 'true')
    expect(labels()).toEqual(['Apples', 'Plums'])
    fireEvent.change(input, { target: { value: 'zz' } })
    expect(screen.queryAllByRole('option')).toHaveLength(0)
    expect(within(screen.getByRole('listbox')).getByText('No matches')).toBeVisible()
  })

  it('lists in the given order with each count', () => {
    const { input } = setup()
    fireEvent.click(input)
    const opts = screen.getAllByRole('option')
    expect(opts.map((o) => o.textContent)).toEqual(['Apples12', 'Pears5', 'Plums0', 'Quinces3'])
    expect(opts[0]).toHaveAccessibleName('Apples, 12 items')
  })

  it('multi-picks and keeps the list open', () => {
    const { input, onChange, rerender } = setup()
    fireEvent.click(input)
    fireEvent.click(screen.getByRole('option', { name: /Apples/ }))
    expect(onChange).toHaveBeenLastCalledWith(['Apples-value'])
    rerender(<PfSearchMultiSelect options={options} values={['Apples-value']} onChange={onChange} label="Fruit" />)
    fireEvent.click(screen.getByRole('option', { name: /Pears/ }))
    expect(onChange).toHaveBeenLastCalledWith(['Apples-value', 'Pears-value'])
    rerender(
      <PfSearchMultiSelect options={options} values={['Apples-value', 'Pears-value']} onChange={onChange} label="Fruit" />,
    )
    expect(screen.getByRole('option', { name: /Apples/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', { name: /Pears/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', { name: /Plums/ })).toHaveAttribute('aria-selected', 'false')
    expect(input).toHaveAttribute('aria-expanded', 'true')
  })

  it('picks show as chips with a remove button', () => {
    const { onChange } = setup({ values: ['Apples-value', 'Pears-value'] })
    const chips = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(chips).toHaveLength(2)
    expect(chips[0]).toHaveTextContent(/^Apples/)
    fireEvent.click(screen.getByRole('button', { name: 'Remove Apples' }))
    expect(onChange).toHaveBeenLastCalledWith(['Pears-value'])
  })

  it('Clear all appears only with picks', () => {
    const { onChange, rerender } = setup()
    expect(screen.queryByRole('button', { name: 'Clear all' })).toBeNull()
    rerender(<PfSearchMultiSelect options={options} values={['Apples-value']} onChange={onChange} label="Fruit" clearAllText="Reset" />)
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(onChange).toHaveBeenLastCalledWith([])
  })

  it('keyboard', () => {
    const { input, onChange, rerender } = setup()
    const active = () => document.getElementById(input.getAttribute('aria-activedescendant')!)?.textContent
    input.focus()
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(input).toHaveAttribute('aria-expanded', 'true')
    expect(active()).toBe('Apples12')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(active()).toBe('Pears5')
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(active()).toBe('Quinces3')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(active()).toBe('Apples12')
    fireEvent.keyDown(input, { key: 'End' })
    expect(active()).toBe('Quinces3')
    fireEvent.keyDown(input, { key: 'Home' })
    expect(active()).toBe('Apples12')
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).toHaveBeenLastCalledWith(['Apples-value'])
    expect(document.activeElement).toBe(input)
    fireEvent.change(input, { target: { value: 'pe' } })
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input.value).toBe('')
    rerender(<PfSearchMultiSelect options={options} values={['Apples-value', 'Pears-value']} onChange={onChange} label="Fruit" />)
    fireEvent.keyDown(input, { key: 'Backspace' })
    expect(onChange).toHaveBeenLastCalledWith(['Apples-value'])
    fireEvent.change(input, { target: { value: 'a' } })
    fireEvent.keyDown(input, { key: 'Backspace' })
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(fireEvent.keyDown(input, { key: 'Tab' })).toBe(true)
  })

  it('announces results and picks', () => {
    const { input, rerender, onChange } = setup()
    fireEvent.change(input, { target: { value: 's' } })
    expect(screen.getByRole('status')).toHaveTextContent('4 results')
    fireEvent.change(input, { target: { value: 'zz' } })
    expect(screen.getByRole('status')).toHaveTextContent('No matches')
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.click(input)
    fireEvent.click(screen.getByRole('option', { name: /Apples/ }))
    expect(screen.getByRole('status')).toHaveTextContent('Apples selected')
    rerender(<PfSearchMultiSelect options={options} values={['Apples-value']} onChange={onChange} label="Fruit" />)
    fireEvent.click(screen.getByRole('option', { name: /Apples/ }))
    expect(screen.getByRole('status')).toHaveTextContent('Apples removed')
  })

  it('a disabled option cannot be picked', () => {
    const { input, onChange } = setup({ options: [{ value: 'a', label: 'Apples', disabled: true }] })
    fireEvent.click(input)
    fireEvent.click(screen.getByRole('option', { name: /Apples/ }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('onSearch shows the options unfiltered', () => {
    const onSearch = vi.fn()
    const { input } = setup({ onSearch })
    fireEvent.change(input, { target: { value: 'pl' } })
    expect(onSearch).toHaveBeenCalledWith('pl')
    expect(screen.getAllByRole('option')).toHaveLength(4)
  })

  it('loading marks the box busy and shows a Loading row', () => {
    const { input, container } = setup({ loading: true })
    fireEvent.click(input)
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull()
    expect(screen.getByText('Loading')).toBeVisible()
  })

  it('picked values missing from options still show as chips', () => {
    setup({ values: ['Gone-value'] })
    expect(screen.getByRole('button', { name: 'Remove Gone-value' })).toBeInTheDocument()
  })
})
