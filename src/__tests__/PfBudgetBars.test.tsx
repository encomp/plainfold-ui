import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, within, fireEvent, waitFor, act } from '@testing-library/react'
import { PfBudgetBars } from '../components/PfBudgetBars'
import type { PfBudgetRow, PfBudgetBarsProps } from '../components/PfBudgetBars'

const usd = (n: number) => `$${n.toFixed(2)}`
const base: PfBudgetRow[] = [
  { id: 'a', label: 'Alpha', actual: 12.5, limit: 50 },
  { id: 'b', label: 'Beta', actual: 14, limit: 10 },
  { id: 'c', label: 'Gamma', actual: 10, limit: 10 },
  { id: 'd', label: 'Delta', actual: 3, limit: null },
  { id: 'e', label: 'Eps', actual: 5, limit: 0 },
]
function setup(p: Partial<PfBudgetBarsProps> = {}) {
  return render(<PfBudgetBars rows={base} format={usd} data-testid="bars" {...p} />)
}
const row = (id: string) => screen.getByTestId(`bb-row-${id}`)
const bar = (name: string) => screen.getByRole('progressbar', { name })
const fill = (name: string) => bar(name).firstElementChild as HTMLElement

describe('PfBudgetBars display', () => {
  it('within limit: text, positive fill, progressbar values', () => {
    setup({ testIdPrefix: 'bb' })
    expect(row('a')).toHaveTextContent('$12.50 / $50.00')
    const b = bar('Alpha spent')
    expect(b).toHaveAttribute('aria-valuemin', '0')
    expect(b).toHaveAttribute('aria-valuemax', '50')
    expect(b).toHaveAttribute('aria-valuenow', '12.5')
    expect(fill('Alpha spent').style.background).toBe('var(--pf-positive)')
    expect(fill('Alpha spent').style.width).toBe('25%')
    expect(screen.getByTestId('bars')).toBeInTheDocument()
  })

  it('over limit: danger fill capped at 100%, warning mark with sr text, danger text', () => {
    setup({ testIdPrefix: 'bb' })
    expect(fill('Beta spent').style.background).toBe('var(--pf-danger)')
    expect(fill('Beta spent').style.width).toBe('100%')
    expect(bar('Beta spent')).toHaveAttribute('aria-valuenow', '10')
    expect(row('b')).toHaveTextContent('⚠')
    expect(within(row('b')).getByText('Over limit')).toBeInTheDocument()
    const amount = within(row('b')).getByText('$14.00 / $10.00')
    expect(amount.style.color).toBe('var(--pf-danger)')
  })

  it('exactly at the limit is within', () => {
    setup({ testIdPrefix: 'bb' })
    expect(fill('Gamma spent').style.background).toBe('var(--pf-positive)')
    expect(fill('Gamma spent').style.width).toBe('100%')
    expect(within(row('c')).queryByText('Over limit')).toBeNull()
  })

  it('null or 0 limit: no bar, no-limit text, defaults', () => {
    setup({ testIdPrefix: 'bb' })
    for (const id of ['d', 'e']) {
      expect(within(row(id)).queryByRole('progressbar')).toBeNull()
      expect(row(id)).toHaveTextContent('No limit')
    }
    expect(row('e')).toHaveTextContent('$5.00')
  })

  it('custom no-limit text', () => {
    setup({ testIdPrefix: 'bb', rows: [base[3]].map((r) => ({ ...r, noLimitText: "No cap: paid steps can't run" })) })
    expect(row('d')).toHaveTextContent("No cap: paid steps can't run")
  })

  it('non-editable no-limit row links to setLimitHref', () => {
    setup({ testIdPrefix: 'bb', rows: [{ ...base[3], setLimitText: 'Set a cap', setLimitHref: '/x?p=d' }] })
    expect(screen.getByRole('link', { name: 'Set a cap' })).toHaveAttribute('href', '/x?p=d')
  })

  it('no action when neither editable nor href', () => {
    setup({ testIdPrefix: 'bb', rows: [base[3]] })
    expect(within(row('d')).queryByRole('link')).toBeNull()
    expect(within(row('d')).queryByRole('button')).toBeNull()
  })

  it('negative actual renders as an empty fill', () => {
    setup({ testIdPrefix: 'bb', rows: [{ id: 'n', label: 'Neg', actual: -4, limit: 10 }] })
    expect(fill('Neg spent').style.width).toBe('0%')
    expect(bar('Neg spent')).toHaveAttribute('aria-valuenow', '0')
  })

  it('huge amounts wrap rather than clip', () => {
    setup({ testIdPrefix: 'bb', rows: [{ id: 'h', label: 'Huge', actual: 99999999.99, limit: 99999999.99 }] })
    expect(row('h')).toHaveTextContent('$99999999.99 / $99999999.99')
    expect(row('h').style.overflowWrap).toBe('anywhere')
  })

  it('highlighted rows carry data-highlight and notes render', () => {
    setup({ testIdPrefix: 'bb', rows: [{ ...base[0], highlighted: true, note: <em>careful</em> }, base[1]] })
    expect(row('a')).toHaveAttribute('data-highlight', 'true')
    expect(row('b')).not.toHaveAttribute('data-highlight')
    expect(screen.getByText('careful')).toBeInTheDocument()
  })

  it('track outlines the bar so fills keep contrast', () => {
    setup({ testIdPrefix: 'bb' })
    expect(bar('Alpha spent').style.background).toBe('var(--pf-bg-surface-alt)')
    expect(bar('Alpha spent').style.border).toContain('var(--pf-border)')
  })
})

describe('PfBudgetBars segments', () => {
  const segs = [
    { label: 'One', value: 3, color: 'red' },
    { label: 'Two', value: 1, color: 'blue' },
  ]
  it('renders one slice per segment with caller colours and a legend', () => {
    setup({ testIdPrefix: 'bb', rows: [{ id: 's', label: 'Seg', actual: 4, limit: 8, segments: segs }] })
    const slices = Array.from(bar('Seg spent').children) as HTMLElement[]
    expect(slices.length).toBe(2)
    expect(slices.map((s) => s.style.background)).toEqual(['red', 'blue'])
    expect(slices.map((s) => s.style.width)).toEqual(['37.5%', '12.5%'])
    expect(row('s')).toHaveTextContent('One $3.00')
    expect(row('s')).toHaveTextContent('Two $1.00')
    expect(row('s')).toHaveTextContent('$4.00 / $8.00')
  })
  it('separators only between segments (n-1), none at the bar ends', () => {
    const three = [...segs, { label: 'Three', value: 0, color: 'green' }]
    setup({ testIdPrefix: 'bb', rows: [{ id: 's', label: 'Seg', actual: 4, limit: 8, segments: three }] })
    const slices = Array.from(bar('Seg spent').children) as HTMLElement[]
    expect(slices.map((s) => s.hasAttribute('data-separator'))).toEqual([true, true, false])
    expect(slices[0].style.boxShadow).toContain('var(--pf-bg-surface)')
    expect(slices[2].style.boxShadow).toBe('')
  })
  it('legend swatches have a 1px border token and keep label and amount', () => {
    setup({ testIdPrefix: 'bb', rows: [{ id: 's', label: 'Seg', actual: 4, limit: 8, segments: segs }] })
    const li = within(row('s')).getByText(/One/).closest('li') as HTMLElement
    expect((li.firstElementChild as HTMLElement).style.border).toContain('1px solid var(--pf-border)')
    expect(li).toHaveTextContent('One $3.00')
  })
  it('single fill and segment-less rows have no separators', () => {
    setup({ testIdPrefix: 'bb', rows: [{ id: 's', label: 'Seg', actual: 5, limit: 8, segments: segs }] })
    expect(document.querySelector('[data-separator]')).toBeNull()
    expect(fill('Seg spent').style.boxShadow).toBe('')
  })
  it('a single segment has no separator', () => {
    setup({ testIdPrefix: 'bb', rows: [{ id: 's', label: 'Seg', actual: 3, limit: 8, segments: [segs[0]] }] })
    expect(document.querySelector('[data-separator]')).toBeNull()
  })
  it('mismatching segments fall back to a single fill', () => {
    setup({ testIdPrefix: 'bb', rows: [{ id: 's', label: 'Seg', actual: 5, limit: 8, segments: segs }] })
    expect(bar('Seg spent').children.length).toBe(1)
    expect(row('s')).not.toHaveTextContent('One $3.00')
  })
  it('sums within 0.005 are accepted', () => {
    setup({ testIdPrefix: 'bb', rows: [{ id: 's', label: 'Seg', actual: 4.004, limit: 8, segments: segs }] })
    expect(bar('Seg spent').children.length).toBe(2)
  })
  it('the legend shows on a no-limit row too, without a bar', () => {
    setup({ testIdPrefix: 'bb', rows: [{ id: 's', label: 'Seg', actual: 4, limit: null, segments: segs }] })
    expect(within(row('s')).queryByRole('progressbar')).toBeNull()
    expect(row('s')).toHaveTextContent('One $3.00')
    expect(row('s')).toHaveTextContent('Two $1.00')
  })
  it('compact rows are separated by a gap', () => {
    setup({ testIdPrefix: 'bb', compact: true, 'data-testid': 'cb' })
    expect(screen.getByTestId('cb').style.gap).toBe('10px')
  })
  it('over limit with segments stays within the track', () => {
    setup({ testIdPrefix: 'bb', rows: [{ id: 's', label: 'Seg', actual: 4, limit: 2, segments: segs }] })
    const w = (Array.from(bar('Seg spent').children) as HTMLElement[]).map((s) => parseFloat(s.style.width))
    expect(w.reduce((a, b) => a + b, 0)).toBeCloseTo(100)
    expect(row('s')).toHaveTextContent('⚠')
  })
  it('over limit with segments: the track gets a danger outline; within limit it does not', () => {
    const { unmount } = setup({ testIdPrefix: 'bb', rows: [{ id: 's', label: 'Seg', actual: 4, limit: 2, segments: segs }] })
    expect(bar('Seg spent').style.border).toContain('var(--pf-danger)')
    expect(bar('Seg spent')).toHaveAttribute('data-over', 'true')
    unmount()
    setup({ testIdPrefix: 'bb', rows: [{ id: 's', label: 'Seg', actual: 4, limit: 8, segments: segs }] })
    expect(bar('Seg spent').style.border).not.toContain('var(--pf-danger)')
    expect(bar('Seg spent')).not.toHaveAttribute('data-over')
  })
})

describe('PfBudgetBars editing', () => {
  const editable = (extra: Partial<PfBudgetRow> = {}): PfBudgetRow[] => [
    { id: 'a', label: 'Alpha', actual: 1, limit: 5, editable: true, ...extra },
  ]
  const props = (onEditLimit: PfBudgetBarsProps['onEditLimit'], rows = editable()) => ({
    testIdPrefix: 'bb', rows, onEditLimit,
    editLabel: 'Edit cap', editAriaLabel: (r: PfBudgetRow) => `Edit ${r.label} cap`, editInputLabel: 'Monthly cap (USD)',
  })
  const open = () => fireEvent.click(screen.getByTestId('bb-edit-a'))

  it('applies labels and test ids to the Edit button', () => {
    setup(props(vi.fn()))
    const b = screen.getByTestId('bb-edit-a')
    expect(b).toHaveTextContent('Edit cap')
    expect(b).toHaveAttribute('aria-label', 'Edit Alpha cap')
  })

  it('default labels', () => {
    setup({ testIdPrefix: 'bb', rows: editable(), onEditLimit: vi.fn() })
    expect(screen.getByRole('button', { name: 'Edit Alpha limit' })).toHaveTextContent('Edit')
    open()
    expect(screen.getByLabelText('Limit')).toBeInTheDocument()
  })

  it('opens a form with a labelled input holding the limit, focused', () => {
    setup(props(vi.fn()))
    open()
    const input = screen.getByLabelText('Monthly cap (USD)') as HTMLInputElement
    expect(input).toHaveAttribute('data-testid', 'bb-input')
    expect(input.value).toBe('5')
    expect(document.activeElement).toBe(input)
    expect(screen.getByTestId('bb-save')).toHaveTextContent('Save')
  })

  it('prefills with editValue when given, not the displayed limit', () => {
    setup(props(vi.fn(), editable({ limit: 8, editValue: 5 })))
    expect(screen.getByTestId('bb-row-a')).toHaveTextContent('$1.00 / $8.00')
    open()
    expect((screen.getByTestId('bb-input') as HTMLInputElement).value).toBe('5')
  })

  it('prefills with the limit when editValue is absent', () => {
    setup(props(vi.fn(), editable({ limit: 8 })))
    open()
    expect((screen.getByTestId('bb-input') as HTMLInputElement).value).toBe('8')
  })

  it('submit sends what the user typed, not editValue', async () => {
    const onEditLimit = vi.fn().mockResolvedValue(undefined)
    setup(props(onEditLimit, editable({ limit: 8, editValue: 5 })))
    open()
    fireEvent.change(screen.getByTestId('bb-input'), { target: { value: '6.5' } })
    fireEvent.click(screen.getByTestId('bb-save'))
    await waitFor(() => expect(onEditLimit).toHaveBeenCalledWith('a', 6.5))
  })

  it('save calls onEditLimit, closes and returns focus to Edit', async () => {
    const onEditLimit = vi.fn().mockResolvedValue(undefined)
    setup(props(onEditLimit))
    open()
    fireEvent.change(screen.getByTestId('bb-input'), { target: { value: '12.5' } })
    fireEvent.click(screen.getByTestId('bb-save'))
    await waitFor(() => expect(screen.queryByTestId('bb-input')).toBeNull())
    expect(onEditLimit).toHaveBeenCalledWith('a', 12.5)
    expect(document.activeElement).toBe(screen.getByTestId('bb-edit-a'))
  })

  it('Enter in the input saves', async () => {
    const onEditLimit = vi.fn().mockResolvedValue(undefined)
    setup(props(onEditLimit))
    open()
    fireEvent.submit(screen.getByTestId('bb-input').closest('form') as HTMLFormElement)
    await waitFor(() => expect(onEditLimit).toHaveBeenCalledWith('a', 5))
  })

  it('a cap of 0 is valid', async () => {
    const onEditLimit = vi.fn().mockResolvedValue(undefined)
    setup(props(onEditLimit))
    open()
    fireEvent.change(screen.getByTestId('bb-input'), { target: { value: '0' } })
    fireEvent.click(screen.getByTestId('bb-save'))
    await waitFor(() => expect(onEditLimit).toHaveBeenCalledWith('a', 0))
  })

  it.each([[''], ['-1'], ['abc'], ['1e999']])('invalid input %j never calls onEditLimit', (v) => {
    const onEditLimit = vi.fn()
    setup(props(onEditLimit))
    open()
    fireEvent.change(screen.getByTestId('bb-input'), { target: { value: v } })
    fireEvent.click(screen.getByTestId('bb-save'))
    expect(screen.getByRole('alert')).toHaveTextContent('Enter an amount of 0 or more.')
    expect(onEditLimit).not.toHaveBeenCalled()
    expect(screen.getByTestId('bb-input')).toBeInTheDocument()
  })

  it('rejection keeps the form open and shows the message', async () => {
    const onEditLimit = vi.fn().mockRejectedValue(new Error('Could not save'))
    setup(props(onEditLimit))
    open()
    fireEvent.click(screen.getByTestId('bb-save'))
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not save')
    expect(screen.getByTestId('bb-input')).toBeInTheDocument()
    expect(screen.getByTestId('bb-save')).not.toBeDisabled()
  })

  it('Save is disabled while pending', async () => {
    let resolve!: () => void
    const onEditLimit = vi.fn(() => new Promise<void>((r) => { resolve = r }))
    setup(props(onEditLimit))
    open()
    fireEvent.click(screen.getByTestId('bb-save'))
    expect(screen.getByTestId('bb-save')).toBeDisabled()
    fireEvent.click(screen.getByTestId('bb-save'))
    expect(onEditLimit).toHaveBeenCalledTimes(1)
    await act(async () => { resolve() })
    await waitFor(() => expect(screen.queryByTestId('bb-input')).toBeNull())
  })

  it('Cancel and Escape close without saving and refocus Edit', () => {
    const onEditLimit = vi.fn()
    setup(props(onEditLimit))
    open()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByTestId('bb-input')).toBeNull()
    expect(document.activeElement).toBe(screen.getByTestId('bb-edit-a'))
    open()
    fireEvent.keyDown(screen.getByTestId('bb-input'), { key: 'Escape' })
    expect(screen.queryByTestId('bb-input')).toBeNull()
    expect(onEditLimit).not.toHaveBeenCalled()
  })

  it('an editable no-limit row opens the edit from its action, empty input, focused', () => {
    const onEditLimit = vi.fn()
    setup(props(onEditLimit, [{ id: 'a', label: 'Alpha', actual: 2, limit: null, editable: true, setLimitText: 'Set a cap' }]))
    fireEvent.click(screen.getByTestId('bb-edit-a'))
    const input = screen.getByTestId('bb-input') as HTMLInputElement
    expect(input.value).toBe('')
    expect(document.activeElement).toBe(input)
  })

  it('compact drops Edit and padding; editable no-limit falls back to the link', () => {
    setup({ ...props(vi.fn()), compact: true,
      rows: [...editable(), { id: 'z', label: 'Zed', actual: 1, limit: null, editable: true, setLimitHref: '/s' }] })
    expect(screen.queryByTestId('bb-edit-a')).toBeNull()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/s')
    expect(row('a').style.padding).toBe('0px')
  })

  it('closes the form when the row turns read-only, and never saves afterwards', () => {
    const onEditLimit = vi.fn()
    const { rerender } = setup(props(onEditLimit))
    open()
    expect(screen.getByTestId('bb-input')).toBeInTheDocument()
    rerender(<PfBudgetBars rows={editable({ editable: false })} format={usd} testIdPrefix="bb" onEditLimit={onEditLimit} />)
    expect(screen.queryByTestId('bb-input')).toBeNull()
    rerender(<PfBudgetBars rows={editable()} format={usd} testIdPrefix="bb" onEditLimit={onEditLimit} />)
    expect(screen.queryByTestId('bb-input')).toBeNull()
  })

  it('no-limit action has the per-row testid and aria label', () => {
    setup(props(vi.fn(), [{ id: 'a', label: 'Alpha', actual: 2, limit: null, editable: true, setLimitText: 'Set a cap' }]))
    const b = screen.getByTestId('bb-edit-a')
    expect(b).toHaveTextContent('Set a cap')
    expect(b).toHaveAttribute('aria-label', 'Edit Alpha cap')
  })

  it('Escape cancels from Save and Cancel focus too', () => {
    setup(props(vi.fn()))
    open()
    fireEvent.keyDown(screen.getByTestId('bb-save'), { key: 'Escape' })
    expect(screen.queryByTestId('bb-input')).toBeNull()
    open()
    fireEvent.keyDown(screen.getByTestId('bb-cancel'), { key: 'Escape' })
    expect(screen.queryByTestId('bb-input')).toBeNull()
  })

  it('same-tick double submit calls onEditLimit once', () => {
    const onEditLimit = vi.fn(() => new Promise<void>(() => {}))
    setup(props(onEditLimit))
    open()
    const form = screen.getByTestId('bb-input').closest('form') as HTMLFormElement
    fireEvent.submit(form)
    fireEvent.submit(form)
    expect(onEditLimit).toHaveBeenCalledTimes(1)
  })

  it('error is linked to the input with aria-invalid and aria-describedby', () => {
    setup(props(vi.fn()))
    open()
    fireEvent.change(screen.getByTestId('bb-input'), { target: { value: '-1' } })
    fireEvent.click(screen.getByTestId('bb-save'))
    const input = screen.getByTestId('bb-input')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(document.getElementById(input.getAttribute('aria-describedby')!)).toBe(screen.getByRole('alert'))
  })

  it('a non-Error rejection still shows a message', async () => {
    setup(props(vi.fn().mockRejectedValue('boom')))
    open()
    fireEvent.click(screen.getByTestId('bb-save'))
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not save.')
  })

  it('rounds the amount to cents', async () => {
    const onEditLimit = vi.fn().mockResolvedValue(undefined)
    setup(props(onEditLimit))
    open()
    fireEvent.change(screen.getByTestId('bb-input'), { target: { value: '12.346' } })
    fireEvent.click(screen.getByTestId('bb-save'))
    await waitFor(() => expect(onEditLimit).toHaveBeenCalledWith('a', 12.35))
  })

  it('text props override the English defaults', () => {
    setup({ ...props(vi.fn()), saveLabel: 'Guardar', cancelLabel: 'Cancelar' })
    open()
    expect(screen.getByTestId('bb-save')).toHaveTextContent('Guardar')
    expect(screen.getByTestId('bb-cancel')).toHaveTextContent('Cancelar')
  })

  it('not editable rows show no Edit', () => {
    setup(props(vi.fn(), editable({ editable: false })))
    expect(screen.queryByTestId('bb-edit-a')).toBeNull()
  })

  it('no Edit without onEditLimit', () => {
    setup(props(undefined))
    expect(screen.queryByTestId('bb-edit-a')).toBeNull()
  })

  it('rows have no testids without a prefix', () => {
    setup({ rows: editable(), onEditLimit: vi.fn() })
    expect(document.querySelector('[data-testid^=-]')).toBeNull()
    expect(screen.queryByTestId('bb-row-a')).toBeNull()
  })
})
