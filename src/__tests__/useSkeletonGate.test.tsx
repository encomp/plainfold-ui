import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { useSkeletonGate } from '../utils/useSkeletonGate'

type Props = { loading: boolean; hasData: boolean }
const setup = (initial: Props) =>
  renderHook((p: Props) => useSkeletonGate(p.loading, p.hasData), { initialProps: initial })
const at = (ms: number) => act(() => void vi.advanceTimersByTime(ms))

describe('useSkeletonGate', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('gate: loading for 100 ms then done never shows', () => {
    const { result, rerender } = setup({ loading: true, hasData: false })
    at(100)
    expect(result.current).toBe(false)
    rerender({ loading: false, hasData: false })
    at(1000)
    expect(result.current).toBe(false)
  })

  it('gate: loading at 250 ms shows, finishing at 260 ms keeps it until 550 ms', () => {
    const { result, rerender } = setup({ loading: true, hasData: false })
    at(249)
    expect(result.current).toBe(false)
    at(1)
    expect(result.current).toBe(true)
    at(10)
    rerender({ loading: false, hasData: false })
    at(289)
    expect(result.current).toBe(true)
    at(1)
    expect(result.current).toBe(false)
  })

  it('gate: a load that starts with data on screen never shows, even while loading', () => {
    const { result } = setup({ loading: true, hasData: true })
    at(1000)
    expect(result.current).toBe(false)
  })

  it('gate: bones showing at 250 ms and data at 260 ms stay until 550 ms', () => {
    const { result, rerender } = setup({ loading: true, hasData: false })
    at(250)
    expect(result.current).toBe(true)
    at(10)
    rerender({ loading: false, hasData: true })
    at(289)
    expect(result.current).toBe(true)
    at(1)
    expect(result.current).toBe(false)
  })

  it('gate: data at 100 ms shows nothing', () => {
    const { result, rerender } = setup({ loading: true, hasData: false })
    at(100)
    rerender({ loading: false, hasData: true })
    at(1000)
    expect(result.current).toBe(false)
  })

  it('gate: a new load after finishing starts a fresh 250 ms delay', () => {
    const { result, rerender } = setup({ loading: true, hasData: false })
    at(250)
    rerender({ loading: false, hasData: false })
    at(300)
    expect(result.current).toBe(false)
    rerender({ loading: true, hasData: false })
    at(100)
    expect(result.current).toBe(false)
    at(150)
    expect(result.current).toBe(true)
  })

  it('gate: data then an emptied list after release does not re-show; a new load waits 250 ms again', () => {
    const { result, rerender } = setup({ loading: true, hasData: false })
    at(250)
    rerender({ loading: false, hasData: true })
    at(300)
    expect(result.current).toBe(false)
    rerender({ loading: false, hasData: false })
    at(1000)
    expect(result.current).toBe(false)
    rerender({ loading: true, hasData: false })
    at(100)
    expect(result.current).toBe(false)
    at(150)
    expect(result.current).toBe(true)
  })

  it('gate: a refetch with data on screen during the minimum window ends the bones on time', () => {
    const { result, rerender } = setup({ loading: true, hasData: false })
    at(250)
    rerender({ loading: false, hasData: true })
    at(100)
    rerender({ loading: true, hasData: true })
    at(200)
    expect(result.current).toBe(false)
  })

  it('gate: a show timer cannot fire after loading ended (guards the layout-effect cleanup)', () => {
    // outside act, as in a browser, where passive effects may be deferred
    const env = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    env.IS_REACT_ACT_ENVIRONMENT = false
    let seen = false
    function Probe({ loading }: { loading: boolean }) {
      seen = useSkeletonGate(loading, false)
      return null
    }
    const root = createRoot(document.createElement('div'))
    try {
      flushSync(() => root.render(createElement(Probe, { loading: true })))
      vi.advanceTimersByTime(100)
      flushSync(() => root.render(createElement(Probe, { loading: false })))
      vi.advanceTimersByTime(250)
      expect(seen).toBe(false)
    } finally {
      flushSync(() => root.unmount())
      env.IS_REACT_ACT_ENVIRONMENT = true
    }
  })
})
