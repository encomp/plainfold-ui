import React from 'react'
import type { PfStepCardsProps } from '../components/PfStepCards'

const steps: PfStepCardsProps['steps'] = [
  { id: 'a', title: 'Draft', state: 'done', count: '120', cost: '$11.90', note: 'All drafted' },
  { id: 'b', title: 'Review', state: 'current', tag: 'optional', count: '36', action: React.createElement('button', null, 'Go') },
  { id: 'c', title: 'Extras', state: 'skipped', cost: '$2.00' },
  { id: 'd', title: 'Publish', state: 'todo' },
  { id: 'e', title: 'Plain', state: 'done' },
]

export const gridCases: Record<string, PfStepCardsProps> = {
  withCurrentId: { steps, currentId: 'b' },
  noCurrentId: { steps },
  unmatchedCurrentId: { steps, currentId: 'zzz' },
  wide: { steps, minCardWidth: 240, 'data-testid': 'cards' },
}
