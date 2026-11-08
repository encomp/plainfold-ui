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

  it('keeps focus when the list itself (padding, scrollbar) is pressed', () => {
    const { input } = setup()
    fireEvent.click(input)
    expect(fireEvent.mouseDown(screen.getByRole('listbox'))).toBe(false)
    expect(fireEvent.mouseDown(screen.getByRole('option', { name: /Apples/ }))).toBe(false)
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

  it('onSearch announces the options that arrive, not the stale list', () => {
    const onChange = vi.fn()
    const { input, rerender } = setup({ onSearch: vi.fn() })
    fireEvent.change(input, { target: { value: 'pl' } })
    expect(screen.getByRole('status')).toHaveTextContent('4 results') // the options on screen so far
    rerender(<PfSearchMultiSelect options={options.slice(0, 2)} values={[]} onChange={onChange} label="Fruit" onSearch={vi.fn()} />)
    expect(screen.getByRole('status')).toHaveTextContent('2 results')
    rerender(<PfSearchMultiSelect options={options.slice(0, 2)} values={[]} onChange={onChange} label="Fruit" onSearch={vi.fn()} loading />)
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    rerender(<PfSearchMultiSelect options={[]} values={[]} onChange={onChange} label="Fruit" onSearch={vi.fn()} />)
    expect(screen.getByRole('status')).toHaveTextContent('No matches')
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

  describe('render props and groups', () => {
    const rows = [
      { value: 'e', label: 'Electrical contractors', count: 4 },
      { value: 'p', label: 'Plumbing contractors' },
    ]

    it('without render props the output is unchanged', () => {
      const { container, input } = setup({ values: ['Pears-value'] })
      fireEvent.click(input)
      expect(container.innerHTML).toMatchSnapshot()
    })

    it('renderOption replaces the visible row and keeps the accessible name', () => {
      const { input } = setup({
        options: rows,
        renderOption: (o) => <b data-testid="custom-row">{o.label.toUpperCase()}</b>,
      })
      fireEvent.click(input)
      const opt = screen.getByRole('option', { name: 'Electrical contractors, 4 items' })
      expect(within(opt).getByTestId('custom-row')).toHaveTextContent('ELECTRICAL CONTRACTORS')
      expect(screen.getByRole('option', { name: 'Plumbing contractors' })).toBeInTheDocument()
    })

    it('renderChip shows custom chip content and the remove button still works', () => {
      const { onChange } = setup({
        options: rows,
        values: ['e'],
        renderChip: (v) => <i data-testid="custom-chip">chip:{v}</i>,
      })
      expect(screen.getByTestId('custom-chip')).toHaveTextContent('chip:e')
      fireEvent.click(screen.getByRole('button', { name: 'Remove Electrical contractors' }))
      expect(onChange).toHaveBeenLastCalledWith([])
    })

    it('options with a group get one heading per group', () => {
      const { input } = setup({
        options: [
          { value: 'a', label: 'Alpha', group: 'First' },
          { value: 'b', label: 'Beta', group: 'First' },
          { value: 'c', label: 'Gamma', group: 'Second' },
          { value: 'd', label: 'Delta' },
        ],
      })
      fireEvent.click(input)
      const groups = screen.getAllByRole('group')
      expect(groups.map((g) => g.getAttribute('aria-label'))).toEqual(['First', 'Second'])
      expect(screen.getAllByRole('option')).toHaveLength(4)
    })

    it('the list stays open after a pick and a second pick adds a second value', () => {
      const { input, onChange, rerender } = setup()
      fireEvent.click(input)
      fireEvent.click(screen.getByRole('option', { name: /Apples/ }))
      rerender(<PfSearchMultiSelect options={options} values={['Apples-value']} onChange={onChange} label="Fruit" />)
      expect(input).toHaveAttribute('aria-expanded', 'true')
      fireEvent.click(screen.getByRole('option', { name: /Quinces/ }))
      expect(onChange).toHaveBeenLastCalledWith(['Apples-value', 'Quinces-value'])
    })
  })

  describe('max', () => {
    const grouped = [
      { value: 'a', label: 'Apples', group: 'Sweet' },
      { value: 'b', label: 'Pears', group: 'Sweet' },
      { value: 'c', label: 'Lemons', group: 'Sour' },
    ]
    const rich = { options: grouped, renderOption: (o: { label: string }) => <b>{o.label}</b>, renderChip: (v: string) => <i>{v}</i> }

    it('max 1 replaces the value and closes the list', () => {
      const { input, onChange } = setup({ ...rich, values: ['a'], max: 1 })
      fireEvent.click(input)
      fireEvent.click(screen.getByRole('option', { name: 'Pears' }))
      expect(onChange).toHaveBeenCalledWith(['b'])
      expect(screen.queryByRole('listbox')).toBeNull()
    })

    it('max 1 keeps groups and renderOption', () => {
      const { input } = setup({ ...rich, values: ['a'], max: 1 })
      fireEvent.click(input)
      expect(screen.getAllByRole('group').map((g) => g.textContent)).toEqual(['Sweet', 'Sour'])
      expect(within(screen.getByRole('option', { name: 'Lemons' })).getByText('Lemons').tagName).toBe('B')
    })

    it('max 2 disables further options at the limit', () => {
      const { input, onChange } = setup({ ...rich, values: ['a', 'b'], max: 2 })
      fireEvent.click(input)
      const c = screen.getByRole('option', { name: 'Lemons' })
      expect(c).toHaveAttribute('aria-disabled', 'true')
      fireEvent.click(c)
      expect(onChange).not.toHaveBeenCalled()
      expect(screen.getByRole('option', { name: 'Apples' })).not.toHaveAttribute('aria-disabled')
      fireEvent.click(screen.getByRole('option', { name: 'Apples' }))
      expect(onChange).toHaveBeenCalledWith(['b'])
    })

    it('no max keeps today\'s behaviour: list stays open, nothing disabled', () => {
      const { input, onChange } = setup({ ...rich, values: ['a', 'b'] })
      fireEvent.click(input)
      fireEvent.click(screen.getByRole('option', { name: 'Lemons' }))
      expect(onChange).toHaveBeenCalledWith(['a', 'b', 'c'])
      expect(screen.getByRole('listbox')).toBeVisible()
      screen.getAllByRole('option').forEach((o) => expect(o).not.toHaveAttribute('aria-disabled'))
      expect(screen.getAllByRole('group')).toHaveLength(2)
    })
  })
})
