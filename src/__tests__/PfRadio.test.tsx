import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import { PfRadio } from '../components/PfRadio'
import { pfRadioGridStyle } from '../tokens/radio'

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

  it('draws a disabled checked card grey, not a pale accent', () => {
    render(<PfRadio card name="g" value="v" checked onChange={() => {}} label="Pick" disabled />)
    const card = screen.getByRole('radio').closest('label')!
    expect(card.style.background).toBe('var(--pf-bg-surface-alt)')
    expect(card.style.color).toBe('var(--pf-text-muted)')
    expect(card.style.opacity).toBe('')
  })

  it('sizes the plain radio from pfText', () => {
    render(<PfRadio name="g" value="v" checked={false} onChange={() => {}} label="Pick" description="d" />)
    expect(screen.getByText('Pick').style.fontSize).toBe('var(--pf-text-body, 14px)')
    expect(screen.getByText('d').style.fontSize).toBe('var(--pf-text-label, 12px)')
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

  describe('card mode', () => {
    function Cards() {
      const [v, setV] = useState('a')
      return (
        <div role="radiogroup" aria-label="Pick one" style={pfRadioGridStyle}>
          <PfRadio card name="c" value="a" checked={v === 'a'} onChange={setV} label="Alpha" description="First" />
          <PfRadio card name="c" value="b" checked={v === 'b'} onChange={setV} label="Beta" description="Second" />
        </div>
      )
    }

    it('selects via label click inside a radiogroup grid', () => {
      render(<Cards />)
      const group = screen.getByRole('radiogroup', { name: 'Pick one' })
      expect(group.style.gridTemplateColumns).toContain('auto-fit')
      fireEvent.click(screen.getByText('Beta'))
      expect(screen.getByRole('radio', { name: 'Beta' })).toBeChecked()
      expect(screen.getByRole('radio', { name: 'Alpha' })).not.toBeChecked()
    })

    it('shows the check mark only on the checked card', () => {
      render(<Cards />)
      expect(screen.getAllByTestId('pf-radio-check')).toHaveLength(1)
      fireEvent.click(screen.getByText('Beta'))
      const check = screen.getByTestId('pf-radio-check')
      expect(check.closest('label')).toContainElement(screen.getByRole('radio', { name: 'Beta' }))
    })

    it('exposes the description as the accessible description', () => {
      render(<Cards />)
      expect(screen.getByRole('radio', { name: 'Alpha' })).toHaveAccessibleDescription('First')
    })

    it('keeps the input in the DOM and ships the card focus rule', () => {
      render(<Cards />)
      const css = Array.from(document.querySelectorAll('style')).map((s) => s.textContent).join('')
      expect(css).toContain('.pf-radio-card:has(:focus-visible)')
      expect(screen.getByRole('radio', { name: 'Alpha' })).toHaveClass('pf-radio')
    })

    it('non-card mode has no check mark', () => {
      render(<Group />)
      expect(screen.queryByTestId('pf-radio-check')).toBeNull()
    })
  })
})
