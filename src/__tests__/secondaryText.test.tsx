import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PfCard } from '../components/PfCard'
import { PfPageHeader } from '../components/PfPageHeader'
import { PfEmptyLine } from '../components/PfEmptyLine'
import { PfTabs } from '../components/PfTabs'
import { PfButton } from '../components/PfButton'

const SECONDARY = 'var(--pf-text-secondary)'

// Ledger Ruling K6: readable secondary text uses text-secondary; text-muted is for disabled/placeholder/decorative only.
describe('readable secondary text', () => {
  it('PfCard meta', () => {
    render(<PfCard title="T" meta="3 items">x</PfCard>)
    expect(screen.getByText('3 items').style.color).toBe(SECONDARY)
  })
  it('PfPageHeader context', () => {
    render(<PfPageHeader title="T" context="Idea" />)
    expect(screen.getByText('Idea').style.color).toBe(SECONDARY)
  })
  it('PfEmptyLine', () => {
    render(<PfEmptyLine>Nothing yet.</PfEmptyLine>)
    expect(screen.getByText('Nothing yet.').style.color).toBe(SECONDARY)
  })
  it('PfTabs inactive label', () => {
    render(<PfTabs aria-label="S" current="a" items={[{ id: 'a', label: 'A', href: '#a' }, { id: 'b', label: 'B', href: '#b' }]} />)
    expect(screen.getByText('B').style.color).toBe(SECONDARY)
  })
  it('PfButton reason', () => {
    render(<PfButton disabled reason="Pick first.">Save</PfButton>)
    expect(screen.getByText('Pick first.').style.color).toBe(SECONDARY)
  })
})
