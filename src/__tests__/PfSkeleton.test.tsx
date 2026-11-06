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

  it('all bones share one animation name and delay 0s', () => {
    const { container } = render(
      <>
        <PfSkeleton.Line />
        <PfSkeleton.Block width={10} height={10} />
        <PfSkeleton.TableRows columns={2} rows={2} />
      </>,
    )
    const names = new Set<string>()
    for (const b of bones(container)) {
      expect(b.style.animationDelay).toBe('0s')
      names.add(b.style.animationName)
    }
    expect([...names]).toEqual(['pf-skeleton-shimmer'])
    expect(document.querySelectorAll('style#pf-skeleton-style')).toHaveLength(1)
    expect(document.getElementById('pf-skeleton-style')?.textContent).toContain('@keyframes pf-skeleton-shimmer')
  })

  it('reduced motion: no animation property', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (q) => ({ matches: true, media: q }) as MediaQueryList,
    )
    const { container } = render(<PfSkeleton.TableRows columns={2} rows={1} />)
    for (const b of bones(container)) {
      expect(b.style.animationName).toBe('')
      expect(b.getAttribute('style')).not.toContain('animation')
    }
  })
})
