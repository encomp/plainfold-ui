import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PfSkeleton, PfSkeletonRegion } from '../components/PfSkeleton'

const bones = (c: HTMLElement) => Array.from(c.querySelectorAll<HTMLElement>('[data-pf-bone]'))

describe('PfSkeleton', () => {
  afterEach(() => vi.restoreAllMocks())

  it('region has aria-busy true and the name "Loading orders"', () => {
    render(
      <PfSkeletonRegion label="orders">
        <PfSkeleton.Line />
      </PfSkeletonRegion>,
    )
    const region = screen.getByRole('status', { name: 'Loading orders' })
    expect(region).toHaveAttribute('aria-busy', 'true')
  })

  it('region without bones is not aria-busy', () => {
    render(
      <PfSkeletonRegion label="orders">
        <p>done</p>
      </PfSkeletonRegion>,
    )
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'false')
  })

  it('bones use only var(--pf-bg-surface-alt) and the mix, no hex or rgb literal', () => {
    const { container } = render(
      <PfSkeletonRegion label="orders">
        <PfSkeleton.CardBody />
        <PfSkeleton.Circle size={24} />
        <PfSkeleton.ChartArea />
      </PfSkeletonRegion>,
    )
    const all = bones(container)
    expect(all.length).toBeGreaterThan(3)
    for (const b of all) {
      const css = b.getAttribute('style') ?? ''
      expect(css).toContain('var(--pf-bg-surface-alt)')
      expect(css).toContain('color-mix(in srgb, var(--pf-bg-surface-alt), var(--pf-bg-surface) 60%)')
      expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i)
    }
  })

  it('TableRows renders columns x rows bones with varied widths', () => {
    const { container } = render(<PfSkeleton.TableRows columns={4} rows={3} />)
    const all = bones(container)
    expect(all).toHaveLength(12)
    expect(new Set(all.map((b) => b.style.width)).size).toBeGreaterThan(1)
  })

  it('all bones share one animation name', () => {
    const { container } = render(
      <>
        <PfSkeleton.Line />
        <PfSkeleton.Block width={10} height={10} />
        <PfSkeleton.TableRows columns={2} rows={2} />
      </>,
    )
    const names = new Set(bones(container).map((b) => b.style.animationName))
    expect([...names]).toEqual(['pf-skeleton-shimmer'])
    expect(document.querySelectorAll('style#pf-skeleton-style')).toHaveLength(1)
    expect(document.getElementById('pf-skeleton-style')?.textContent).toContain('@keyframes pf-skeleton-shimmer')
  })

  it('bones mounted at different times land in the same phase', () => {
    const now = vi.spyOn(performance, 'now')
    const phaseAt = (t: number) => {
      now.mockReturnValue(t)
      const { container, unmount } = render(<PfSkeleton.Line />)
      const delay = parseFloat(bones(container)[0].style.animationDelay)
      unmount()
      return (20_000 - t - delay) % 1600 // animation phase at one shared later moment
    }
    expect(phaseAt(10_000)).toBeCloseTo(phaseAt(12_345), 6)
  })

  it('reduced motion: the injected style turns the animation off', () => {
    render(<PfSkeleton.Line />)
    const css = document.getElementById('pf-skeleton-style')?.textContent ?? ''
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[^}]*\{[^}]*animation: none/)
  })
})
