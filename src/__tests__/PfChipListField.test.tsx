import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PfChipListField } from '../components/PfChipListField'
import type { PfChipListFieldProps } from '../components/PfChipListField'

function setup(props: Partial<PfChipListFieldProps> = {}) {
  const onChange = vi.fn()
  render(<PfChipListField label="Hosts" values={[]} onChange={onChange} {...props} />)
  return { onChange, input: screen.getByLabelText('Hosts') as HTMLInputElement }
}
const type = (input: HTMLInputElement, v: string) => fireEvent.change(input, { target: { value: v } })

describe('PfChipListField', () => {
  it('adds on Enter', () => {
    const { onChange, input } = setup({ values: ['a.com'] })
    type(input, 'example.com')
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith(['a.com', 'example.com'])
    expect(input.value).toBe('')
  })

  it('adds on comma', () => {
    const { onChange, input } = setup()
    type(input, 'example.com')
    fireEvent.keyDown(input, { key: ',' })
    expect(onChange).toHaveBeenCalledWith(['example.com'])
  })

  it('removes with a labelled button', () => {
    const { onChange } = setup({ values: ['a.com', 'b.com'] })
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: 'Remove a.com' }))
    expect(onChange).toHaveBeenCalledWith(['b.com'])
  })

  it('normalizes before adding', () => {
    const { onChange, input } = setup({ normalize: (v) => v.toLowerCase() })
    type(input, 'Example.COM')
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith(['example.com'])
  })

  it('refuses a duplicate with a message tied to the input', () => {
    const { onChange, input } = setup({ values: ['a.com'] })
    type(input, 'a.com')
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).not.toHaveBeenCalled()
    const alert = screen.getByRole('alert')
    expect(alert.textContent).toMatch(/already/i)
    expect(input.getAttribute('aria-describedby')).toContain(alert.id)
    expect(input.getAttribute('aria-invalid')).toBe('true')
  })

  it('shows the validate error and does not add', () => {
    const { onChange, input } = setup({ validate: (v) => (v.includes('.') ? null : 'Not a host') })
    type(input, 'nodot')
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('alert').textContent).toBe('Not a host')
  })

  it('stops at max', () => {
    const { onChange, input } = setup({ values: ['a'], max: 1 })
    type(input, 'b')
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('alert').textContent).toMatch(/1/)
  })

  it('moves focus to the next remove button, then the input', () => {
    function Host() {
      const [v, setV] = useState(['a.com', 'b.com'])
      return <PfChipListField label="Hosts" values={v} onChange={setV} />
    }
    render(<Host />)
    fireEvent.click(screen.getByRole('button', { name: 'Remove a.com' }))
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Remove b.com' }))
    fireEvent.click(screen.getByRole('button', { name: 'Remove b.com' }))
    expect(document.activeElement).toBe(screen.getByLabelText('Hosts'))
  })

  it('adds the typed text on blur', () => {
    const { onChange, input } = setup()
    type(input, 'example.com')
    fireEvent.blur(input)
    expect(onChange).toHaveBeenCalledWith(['example.com'])
  })

  it('keeps an invalid value in the input on blur, with its error', () => {
    const { onChange, input } = setup({ validate: () => 'Not a host' })
    type(input, 'nodot')
    fireEvent.blur(input)
    expect(onChange).not.toHaveBeenCalled()
    expect(input.value).toBe('nodot')
    expect(screen.getByRole('alert').textContent).toBe('Not a host')
  })

  it('refuses a duplicate on blur', () => {
    const { onChange, input } = setup({ values: ['a.com'] })
    type(input, 'a.com')
    fireEvent.blur(input)
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('alert').textContent).toMatch(/already/i)
  })

  it('does nothing on blur when the input is blank', () => {
    const { onChange, input } = setup()
    fireEvent.blur(input)
    type(input, '   ')
    fireEvent.blur(input)
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('Backspace on an empty input removes nothing', () => {
    const { onChange, input } = setup({ values: ['a.com'] })
    fireEvent.keyDown(input, { key: 'Backspace' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('disabled hides add and remove', () => {
    setup({ values: ['a.com'], disabled: true })
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByText('a.com')).toBeTruthy()
  })
})
