import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PfStageBar } from '../components/PfStageBar'
import type { PfStageBarStep } from '../components/PfStageBar'

const steps: PfStageBarStep[] = [
  { id: 'a', label: 'Draft', state: 'done' },
  { id: 'b', label: 'Review', state: 'current', progress: 0.36 },
  { id: 'c', label: 'Extras', state: 'optional' },
  { id: 'd', label: 'Publish', state: 'todo' },
]

describe('PfStageBar', () => {
  it('renders one list item per step', () => {
    render(<PfStageBar steps={steps} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })

  it('marks the current step for assistive tech', () => {
    render(<PfStageBar steps={steps} />)
    const cur = screen.getByRole('listitem', { current: 'step' })
    expect(cur).toHaveAttribute('aria-label', 'Review, in progress, 36%')
    expect(cur.firstElementChild).toHaveStyle({ width: '36%' })
  })

  it('labels done, optional and todo steps', () => {
    render(<PfStageBar steps={steps} />)
    expect(screen.getByLabelText('Draft, done')).toBeInTheDocument()
    expect(screen.getByLabelText('Extras, optional')).toBeInTheDocument()
    expect(screen.getByLabelText('Publish, to do')).toBeInTheDocument()
  })

  it('shows the current label after the bar', () => {
    render(<PfStageBar steps={steps} currentLabel="Review · 9 of 25" />)
    expect(screen.getByText('Review · 9 of 25')).toBeInTheDocument()
  })

  it('renders nothing for no steps', () => {
    const { container } = render(<PfStageBar steps={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('treats only the first current step as current', () => {
    render(
      <PfStageBar
        steps={[
          { id: 'x', label: 'One', state: 'current' },
          { id: 'y', label: 'Two', state: 'current' },
        ]}
      />,
    )
    expect(screen.getAllByRole('listitem', { current: 'step' })).toHaveLength(1)
    expect(screen.getByLabelText('Two, to do')).toBeInTheDocument()
  })

  it('clamps progress', () => {
    render(<PfStageBar steps={[{ id: 'x', label: 'One', state: 'current', progress: 3 }]} />)
    expect(screen.getByRole('listitem', { current: 'step' })).toHaveAttribute(
      'aria-label',
      'One, in progress, 100%',
    )
  })

  it('announces a current step without progress as in progress only', () => {
    render(<PfStageBar steps={[{ id: 'x', label: 'One', state: 'current' }]} />)
    expect(screen.getByLabelText('One, in progress')).toBeInTheDocument()
  })

  it('ignores a non-finite progress', () => {
    render(<PfStageBar steps={[{ id: 'x', label: 'One', state: 'current', progress: NaN }]} />)
    expect(screen.getByLabelText('One, in progress')).toBeInTheDocument()
  })
})
