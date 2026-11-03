import type { CSSProperties } from 'react'

/** Style for the caller's `role="radiogroup"` wrapper around `card` PfRadios. */
export const pfRadioGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '10px',
}
