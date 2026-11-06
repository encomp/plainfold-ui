import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PfSelectionBar } from '../components/PfSelectionBar'

const bar = (count: number, onClear = vi.fn()) => (
  <PfSelectionBar count={count} noun="fruits" hint="Tick fruits to act on them" onClear={onClear}
    data-testid="bar">
    <button disabled>Eat selected</button>
  </PfSelectionBar>
)

describe('PfSelectionBar', () => {
  it('count 0 shows the hint, no Clear button, not highlighted', () => {
    render(bar(0))
    expect(screen.getAllByText('Tick fruits to act on them').length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull()
    expect(screen.getByTestId('bar')).toHaveAttribute('data-active', 'false')
  })

  it('count 2 reads "2 fruits selected", shows Clear, highlighted', () => {
    render(bar(2))
    expect(screen.getAllByText('2 fruits selected').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument()
    expect(screen.getByTestId('bar')).toHaveAttribute('data-active', 'true')
  })

  it('Clear calls onClear', () => {
    const onClear = vi.fn()
    render(bar(2, onClear))
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('children render in both states and a disabled child stays disabled', () => {
    const { rerender } = render(bar(0))
    expect(screen.getByRole('button', { name: 'Eat selected' })).toBeDisabled()
    rerender(bar(2))
    expect(screen.getByRole('button', { name: 'Eat selected' })).toBeDisabled()
  })

  it('the status region says the hint when nothing is selected, and the count once when rows are ticked', () => {
    const { rerender } = render(bar(2))
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveTextContent('2 fruits selected')
    rerender(bar(0))
    expect(screen.getByRole('status')).toHaveTextContent('Tick fruits to act on them')
    rerender(bar(2))
    expect(screen.getAllByText('2 fruits selected', { ignore: '[aria-hidden="true"]' })).toHaveLength(1)
  })

  it('wraps on a narrow width and honours clearText', () => {
    render(<PfSelectionBar count={1} noun="pears" hint="h" onClear={() => {}} clearText="Reset" data-testid="b" />)
    expect(screen.getByTestId('b').style.flexWrap).toBe('wrap')
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
  })
})
