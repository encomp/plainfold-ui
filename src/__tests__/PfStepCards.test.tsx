import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { PfStepCards } from '../components/PfStepCards'
import type { PfStepCardsStep } from '../components/PfStepCards'

const steps: PfStepCardsStep[] = [
  { id: 'a', title: 'Draft', state: 'done', count: '120', cost: '$11.90', note: 'All drafted' },
  { id: 'b', title: 'Review', state: 'current', tag: 'optional', count: '36' },
  { id: 'c', title: 'Extras', state: 'skipped' },
  { id: 'd', title: 'Publish', state: 'todo' },
]

describe('PfStepCards', () => {
  it('renders one list item per step inside a list', () => {
    render(<PfStepCards steps={steps} currentId="b" />)
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(4)
  })

  it('marks the currentId card and labels each card with title and state', () => {
    render(<PfStepCards steps={steps} currentId="b" />)
    const cur = screen.getByRole('listitem', { current: 'step' })
    expect(cur).toHaveAttribute('aria-label', 'Review, current')
    expect(screen.getByLabelText('Extras, skipped')).toBeInTheDocument()
    expect(screen.getByLabelText('Draft, done')).toBeInTheDocument()
    expect(screen.getByLabelText('Publish, todo')).toBeInTheDocument()
  })

  it('renders tag, count, cost and note, and the skipped chip', () => {
    render(<PfStepCards steps={steps} currentId="b" />)
    expect(screen.getByText('optional')).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByText('$11.90')).toBeInTheDocument()
    expect(screen.getByText('All drafted')).toBeInTheDocument()
    expect(screen.getByText('skipped')).toBeInTheDocument()
  })

  it('leaves no empty element for absent fields', () => {
    render(<PfStepCards steps={[{ id: 'p', title: 'Publish', state: 'todo' }]} />)
    const card = screen.getByRole('listitem')
    expect(card).toHaveTextContent(/^Publish$/)
    const empty = [...card.querySelectorAll('*')].filter((el) => !el.textContent)
    expect(empty).toHaveLength(0)
  })

  it('renders the action slot and calls the app handler', () => {
    const onClick = vi.fn()
    render(
      <PfStepCards
        steps={[{ id: 'a', title: 'Draft', state: 'current', action: <button onClick={onClick}>Go</button> }]}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('marks none when currentId matches no step', () => {
    render(<PfStepCards steps={steps} currentId="zzz" />)
    expect(screen.queryByRole('listitem', { current: 'step' })).toBeNull()
  })

  it('marks only the first current step when there is no currentId', () => {
    render(
      <PfStepCards
        steps={[
          { id: 'x', title: 'One', state: 'current' },
          { id: 'y', title: 'Two', state: 'current' },
        ]}
      />,
    )
    expect(screen.getAllByRole('listitem', { current: 'step' })).toHaveLength(1)
    expect(screen.getByLabelText('One, current')).toBeInTheDocument()
    expect(screen.getByLabelText('Two, todo')).toBeInTheDocument()
  })

  it('passes data-testid to the root', () => {
    render(<PfStepCards steps={steps} data-testid="cards" />)
    expect(screen.getByTestId('cards')).toBeInTheDocument()
  })

  it('shows a Done cue for a done step without cost, not for others', () => {
    render(
      <PfStepCards
        steps={[
          { id: 'a', title: 'A', state: 'done' },
          { id: 'b', title: 'B', state: 'done', cost: '$1.00' },
          { id: 'c', title: 'C', state: 'todo' },
        ]}
      />,
    )
    expect(screen.getAllByText('Done')).toHaveLength(1)
    expect(within(screen.getByLabelText('A, done')).getByText('Done')).toBeInTheDocument()
    expect(within(screen.getByLabelText('B, done')).queryByText('Done')).toBeNull()
    expect(within(screen.getByLabelText('C, todo')).queryByText('Done')).toBeNull()
  })

  it('shows only the skipped chip on a skipped step even with a cost', () => {
    render(<PfStepCards steps={[{ id: 's', title: 'S', state: 'skipped', cost: '$2.00' }]} />)
    expect(screen.getByText('skipped')).toBeInTheDocument()
    expect(screen.queryByText('$2.00')).toBeNull()
  })

  it('mutes title and count but not the card or the action slot', () => {
    render(
      <PfStepCards
        steps={[{ id: 'p', title: 'Publish', state: 'todo', count: '5', action: <button>Go</button> }]}
      />,
    )
    const card = screen.getByRole('listitem')
    expect(card.style.color).toBe('var(--pf-text-primary)')
    expect(screen.getByText('Publish').parentElement!.style.color).toBe('var(--pf-text-secondary)')
    expect(screen.getByText('5').style.color).toBe('var(--pf-text-secondary)')
    const action = screen.getByRole('button', { name: 'Go' }).parentElement!
    expect(action.style.color).toBe('')
  })

  it('renders nothing for no steps', () => {
    const { container } = render(<PfStepCards steps={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('defaults the grid to a 150px minimum card width', () => {
    render(<PfStepCards steps={steps} />)
    expect(screen.getByRole('list').style.gridTemplateColumns).toBe('repeat(auto-fit, minmax(min(150px, 100%), 1fr))')
  })

  it('takes minCardWidth', () => {
    render(<PfStepCards steps={steps} minCardWidth={240} />)
    expect(screen.getByRole('list').style.gridTemplateColumns).toBe('repeat(auto-fit, minmax(min(240px, 100%), 1fr))')
  })
})
