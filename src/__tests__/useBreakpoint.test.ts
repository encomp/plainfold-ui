import { describe, it, expect } from 'vitest'
import { BREAKPOINTS } from '../utils/useBreakpoint'

describe('BREAKPOINTS', () => {
  it('defines mobile, tablet, desktop', () => {
    expect(BREAKPOINTS.mobile).toBe(0)
    expect(BREAKPOINTS.tablet).toBe(768)
    expect(BREAKPOINTS.desktop).toBe(1024)
  })
})
