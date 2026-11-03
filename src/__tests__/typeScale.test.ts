import { describe, it, expect } from 'vitest'
import { pfText } from '../tokens/type'

describe('pfText', () => {
  it('has exactly the six sizes with px fallbacks', () => {
    expect(pfText).toEqual({
      page: 'var(--pf-text-page, 24px)',
      section: 'var(--pf-text-section, 17px)',
      card: 'var(--pf-text-card, 15px)',
      body: 'var(--pf-text-body, 14px)',
      meta: 'var(--pf-text-meta, 13px)',
      label: 'var(--pf-text-label, 12px)',
    })
  })
})
