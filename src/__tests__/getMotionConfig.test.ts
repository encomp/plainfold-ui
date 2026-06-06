import { describe, it, expect } from 'vitest'
import { getMotionConfig } from '../utils/getMotionConfig'

describe('getMotionConfig', () => {
  it('returns a duration and ease', () => {
    const config = getMotionConfig()
    expect(typeof config.duration).toBe('number')
    expect(config.ease).toHaveLength(4)
  })
})
