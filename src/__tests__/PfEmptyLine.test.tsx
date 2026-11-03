import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PfEmptyLine } from '../components/PfEmptyLine'

describe('PfEmptyLine', () => {
  it('is muted body text', () => {
    render(<PfEmptyLine>Nothing yet.</PfEmptyLine>)
    const el = screen.getByText('Nothing yet.')
    expect(el.tagName).toBe('P')
    expect(el.style.fontSize).toBe('var(--pf-text-body, 14px)')
  })
})
