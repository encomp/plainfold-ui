import React from 'react'

export interface PfStepCardsStep {
  /** Must be unique among the steps */
  id: string
  title: string
  state: 'done' | 'current' | 'todo' | 'skipped'
  /** Small badge beside the title, e.g. "optional" */
  tag?: string
  /** The big figure */
  count?: React.ReactNode
  /** Already formatted, e.g. "$11.90". Ignored when the step is skipped. A done step without it shows "Done". */
  cost?: string
  /** One or two lines under the count */
  note?: React.ReactNode
  /** Slot for the app's button(s) or form */
  action?: React.ReactNode
}

export interface PfStepCardsProps {
  steps: PfStepCardsStep[]
  /** The highlighted card. If it matches no step, none is highlighted. Without it, the first step in state 'current' is highlighted. */
  currentId?: string
  /** Minimum card width in px before the grid wraps. Default 150. */
  minCardWidth?: number
  'data-testid'?: string
}

// Muted colour goes on title and count only (note and chip already have their own), never on the action slot.
const MUTED = 'var(--pf-text-secondary)'

const rootStyle: React.CSSProperties = {
  display: 'grid',
  gap: '8px',
  margin: 0,
  padding: 0,
}

const cardBase: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  minWidth: 0,
  padding: '12px',
  boxSizing: 'border-box',
  borderRadius: 'var(--pf-radius-md)',
  border: '1px solid var(--pf-border)',
  background: 'var(--pf-bg-surface)',
  color: 'var(--pf-text-primary)',
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '4px 6px',
  fontSize: '14px',
  fontWeight: 600,
  overflowWrap: 'anywhere',
}

const tagStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 400,
  padding: '0 6px',
  borderRadius: 'var(--pf-radius-sm)',
  border: '1px solid var(--pf-border)',
  color: 'var(--pf-text-secondary)',
}

const countStyle: React.CSSProperties = { fontSize: '24px', fontWeight: 600, lineHeight: 1.2 }

const chipStyle: React.CSSProperties = { fontSize: '12px', fontWeight: 500 }

const noteStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'var(--pf-text-secondary)',
  overflowWrap: 'anywhere',
}

const actionStyle: React.CSSProperties = { marginTop: '4px' }

export function PfStepCards({ steps, currentId, minCardWidth = 150, 'data-testid': dataTestId }: PfStepCardsProps) {
  if (steps.length === 0) return null

  // With currentId, only that card is current. Without it, only the first 'current' step is.
  const currentIndex =
    currentId !== undefined
      ? steps.findIndex((s) => s.id === currentId)
      : steps.findIndex((s) => s.state === 'current')

  return (
    <div role="list" style={{ ...rootStyle, gridTemplateColumns: `repeat(auto-fit, minmax(min(${minCardWidth}px, 100%), 1fr))` }} data-testid={dataTestId}>
      {steps.map((step, i) => {
        const isCurrent = i === currentIndex
        const state = step.state === 'current' && !isCurrent ? 'todo' : step.state
        const muted = state === 'todo' || state === 'skipped'
        const chip = state === 'skipped' ? 'skipped' : step.cost || (state === 'done' ? 'Done' : undefined)
        return (
          <div
            key={step.id}
            role="listitem"
            aria-label={`${step.title}, ${state}`}
            aria-current={isCurrent ? 'step' : undefined}
            style={{
              ...cardBase,
              ...(isCurrent && {
                border: '2px solid var(--pf-accent-text, var(--pf-accent))',
                padding: '11px',
                background: 'var(--pf-bg-surface-alt)',
              }),
            }}
          >
            <div style={muted ? { ...headerStyle, color: MUTED } : headerStyle}>
              <span>{step.title}</span>
              {step.tag && <span style={tagStyle}>{step.tag}</span>}
            </div>
            {step.count != null && <div style={muted ? { ...countStyle, color: MUTED } : countStyle}>{step.count}</div>}
            {chip && (
              <div
                style={{
                  ...chipStyle,
                  color: state === 'done' ? 'var(--pf-positive)' : 'var(--pf-text-secondary)',
                }}
              >
                {chip}
              </div>
            )}
            {step.note != null && <div style={noteStyle}>{step.note}</div>}
            {step.action != null && <div style={actionStyle}>{step.action}</div>}
          </div>
        )
      })}
    </div>
  )
}
