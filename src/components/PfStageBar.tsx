import React from 'react'

export interface PfStageBarStep {
  id: string
  label: string
  state: 'done' | 'current' | 'todo' | 'optional'
  /** 0–1, only used when state is 'current' */
  progress?: number
}

export interface PfStageBarProps {
  steps: PfStageBarStep[]
  /** Shown after the bar, e.g. "Review · 9 of 25" */
  currentLabel?: React.ReactNode
  'data-testid'?: string
}

const STATE_TEXT = { done: 'done', current: 'in progress', todo: 'to do', optional: 'optional' }

const rootStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: '6px',
  rowGap: '4px',
}

const listStyle: React.CSSProperties = { display: 'flex', gap: '2px' }

const segmentBase: React.CSSProperties = {
  width: '16px',
  height: '8px',
  flexShrink: 0,
  borderRadius: 'var(--pf-radius-sm)',
  overflow: 'hidden',
  background: 'var(--pf-bg-surface-alt)',
}

const SEGMENT_BG = {
  done: 'var(--pf-positive)',
  current: 'var(--pf-bg-surface-alt)',
  todo: 'var(--pf-bg-surface-alt)',
  optional:
    'repeating-linear-gradient(45deg, var(--pf-border) 0 2px, var(--pf-bg-surface-alt) 2px 4px)',
}

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'var(--pf-text-primary)',
  minWidth: 0,
  overflowWrap: 'anywhere',
}

export function PfStageBar({ steps, currentLabel, 'data-testid': dataTestId }: PfStageBarProps) {
  if (steps.length === 0) return null

  // Only the first 'current' step is current; any later one renders as 'todo'.
  const currentIndex = steps.findIndex((s) => s.state === 'current')

  return (
    <div style={rootStyle} data-testid={dataTestId}>
      <div role="list" style={listStyle}>
        {steps.map((step, i) => {
          const state = step.state === 'current' && i !== currentIndex ? 'todo' : step.state
          const isCurrent = state === 'current'
          const pct =
            isCurrent && Number.isFinite(step.progress)
              ? Math.round(Math.min(Math.max(step.progress as number, 0), 1) * 100)
              : undefined
          const label = [step.label, STATE_TEXT[state], pct !== undefined && `${pct}%`]
            .filter(Boolean)
            .join(', ')
          return (
            <div
              key={step.id}
              role="listitem"
              aria-label={label}
              aria-current={isCurrent ? 'step' : undefined}
              style={{
                ...segmentBase,
                background: SEGMENT_BG[state],
                // Ring keeps a current step with no or 0 progress distinct from 'todo'.
                boxShadow: isCurrent ? 'inset 0 0 0 1px var(--pf-accent)' : undefined,
              }}
            >
              {isCurrent && (
                <div
                  style={{
                    height: '100%',
                    width: `${pct ?? 0}%`,
                    background: 'var(--pf-accent)',
                    transition: 'width var(--pf-duration-fast) var(--pf-easing-default)',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
      {currentLabel != null && <span style={labelStyle}>{currentLabel}</span>}
    </div>
  )
}
