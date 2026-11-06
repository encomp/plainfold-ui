import type { ReactNode } from 'react'
import { pfText } from '../tokens/type'
import { PfButton } from './PfButton'

export interface PfSelectionBarProps {
  /** ticked rows */
  count: number
  /** plural noun: "N fruits selected" */
  noun: string
  /** singular noun for a count of 1: "1 fruit selected"; default the plural without its final s; pass it for an irregular noun */
  nounOne?: string
  /** shown while count is 0 */
  hint: string
  onClear(): void
  /** default "Clear" */
  clearText?: string
  /** the action buttons, rendered after the text */
  children?: ReactNode
  'data-testid'?: string
}

export function PfSelectionBar(p: PfSelectionBarProps) {
  const active = p.count > 0
  const one = p.nounOne ?? p.noun.replace(/s$/, '')
  const text = active ? `${p.count} ${p.count === 1 ? one : p.noun} selected` : p.hint
  return (
    <div data-testid={p['data-testid']} data-active={active ? 'true' : 'false'}
      style={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: '8px 12px',
        fontSize: pfText.body, borderRadius: 'var(--pf-radius-sm)',
        background: active ? 'var(--pf-bg-surface)' : 'transparent',
        borderLeft: `3px solid ${active ? 'var(--pf-accent-text, var(--pf-accent))' : 'transparent'}`,
        color: active ? 'var(--pf-text-primary)' : 'var(--pf-text-secondary)',
      }}>
      <span aria-hidden="true">{text}</span>
      <span role="status" aria-live="polite"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
        {text}
      </span>
      {active && <PfButton variant="ghost" size="sm" onClick={p.onClear}>{p.clearText ?? 'Clear'}</PfButton>}
      {p.children}
    </div>
  )
}
