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

  it('renders nothing for no steps', () => {
    const { container } = render(<PfStepCards steps={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
