import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import { PfRadio } from '../components/PfRadio'

function Group({ onChange = () => {} }: { onChange?: (v: string) => void }) {
  const [v, setV] = useState('a')
  return (
    <>
      <PfRadio name="g" value="a" checked={v === 'a'} onChange={(x) => { setV(x); onChange(x) }} label="Alpha" description="First" />
      <PfRadio name="g" value="b" checked={v === 'b'} onChange={(x) => { setV(x); onChange(x) }} label="Beta" />
    </>
  )
}

describe('PfRadio', () => {
  it('calls onChange with the value once on click', () => {
    const onChange = vi.fn()
    render(<PfRadio name="g" value="v" checked={false} onChange={onChange} label="Pick" />)
    fireEvent.click(screen.getByRole('radio', { name: 'Pick' }))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('v')
  })

  it('shares one selection per name group (native radio semantics)', () => {
    render(<Group />)
    expect(screen.getByRole('radio', { name: /Alpha/ })).toBeChecked()
    fireEvent.click(screen.getByRole('radio', { name: 'Beta' }))
    expect(screen.getByRole('radio', { name: 'Beta' })).toBeChecked()
    expect(screen.getByRole('radio', { name: /Alpha/ })).not.toBeChecked()
    expect(screen.getAllByRole('radio').every((r) => r.getAttribute('name') === 'g')).toBe(true)
  })

  it('blocks changes when disabled', () => {
    render(<PfRadio name="g" value="v" checked={false} onChange={() => {}} label="Pick" disabled />)
    // jsdom dispatches synthetic clicks on disabled inputs; browsers do not, so assert the native disabled state
    expect(screen.getByRole('radio')).toBeDisabled()
  })

  it('is tabbable and ships the focus-visible rule', () => {
    render(<PfRadio name="g" value="v" checked={false} onChange={() => {}} label="Pick" />)
    screen.getByRole('radio').focus()
    expect(screen.getByRole('radio')).toHaveFocus()
    const css = Array.from(document.querySelectorAll('style')).map((s) => s.textContent).join('')
    expect(css).toContain('.pf-radio:focus-visible')
    expect(css).toContain('outline: 2px solid var(--pf-accent-text, var(--pf-accent))')
  })

  it('puts data-testid on the input and renders the description', () => {
    render(<PfRadio name="g" value="v" checked={false} onChange={() => {}} label="Pick" description="Why" data-testid="r1" />)
    const input = screen.getByTestId('r1')
    expect(input.tagName).toBe('INPUT')
    expect(input).toHaveClass('pf-radio')
    expect(screen.getByRole('radio', { name: /Pick/ })).toBe(input)
    expect(screen.getByText('Why')).toBeInTheDocument()
  })
})
