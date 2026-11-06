import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

const STYLE_ID = 'pf-skeleton-style'
const ANIMATION = 'pf-skeleton-shimmer'
const PERIOD_MS = 1600
const BONE = 'var(--pf-bg-surface-alt)'
const SHEEN = 'color-mix(in srgb, var(--pf-bg-surface-alt), var(--pf-bg-surface) 60%)'

// One keyframe, injected once per document, so every bone shares the same clock.
function useShimmerStyle() {
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return
    const el = document.createElement('style')
    el.id = STYLE_ID
    el.textContent = `@keyframes ${ANIMATION} { from { background-position: 100% 0 } to { background-position: -100% 0 } } @media (prefers-reduced-motion: reduce) { [data-pf-bone] { animation: none !important; background: ${BONE} !important } }`
    document.head.appendChild(el)
  }, [])
}

interface BoneProps {
  width?: string | number
  height?: string | number
  radius?: string
}

function Bone({ width = '100%', height = 12, radius = 'var(--pf-radius-sm)' }: BoneProps) {
  useShimmerStyle()
  // A negative delay puts a late-mounted bone on the document timeline's phase, so all bones stay in step.
  const [phase] = useState(() => -(performance.now() % PERIOD_MS))
  const style: React.CSSProperties = {
    display: 'block',
    width,
    height,
    borderRadius: radius,
    background: `linear-gradient(90deg, ${BONE} 0%, ${SHEEN} 50%, ${BONE} 100%) 0 0 / 200% 100%`,
    animationName: ANIMATION,
    animationDuration: `${PERIOD_MS}ms`,
    animationTimingFunction: 'linear',
    animationDelay: `${phase}ms`,
    animationIterationCount: 'infinite',
  }
  return <span data-pf-bone="" aria-hidden="true" style={style} />
}

const stack: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '10px' }
const COLUMN_WIDTHS = ['60%', '85%', '45%', '70%']

// eslint-disable-next-line react-refresh/only-export-components -- a namespace of shape components, not a component
export const PfSkeleton = {
  Line: ({ width }: { width?: string | number }) => <Bone width={width} />,
  Block: ({ width, height }: { width: string | number; height: string | number }) => (
    <Bone width={width} height={height} />
  ),
  Circle: ({ size }: { size: number }) => <Bone width={size} height={size} radius="50%" />,
  CardBody: ({ lines = 3 }: { lines?: number }) => (
    <div style={stack}>
      {Array.from({ length: lines }, (_, i) => (
        <Bone key={i} width={i === lines - 1 ? '60%' : '100%'} />
      ))}
    </div>
  ),
  TableRows: ({ columns, rows }: { columns: number; rows: number }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} style={{ display: 'flex', gap: '16px' }}>
          {Array.from({ length: columns }, (_, c) => (
            <div key={c} style={{ flex: 1 }}>
              <Bone width={COLUMN_WIDTHS[(r + c) % COLUMN_WIDTHS.length]} />
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
  ChartArea: ({ height = 200 }: { height?: number }) => <Bone height={height} radius="var(--pf-radius-md)" />,
}

export function PfSkeletonRegion({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  // Busy only while bones are inside; an observer catches children that mount bones from their own state.
  useLayoutEffect(() => {
    const el = ref.current!
    const check = () => setBusy(!!el.querySelector('[data-pf-bone]'))
    check()
    const observer = new MutationObserver(check)
    observer.observe(el, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} role="status" aria-busy={busy} aria-label={`Loading ${label}`}>
      {children}
    </div>
  )
}
