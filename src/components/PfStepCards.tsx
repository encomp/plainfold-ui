import React, { useEffect, useRef } from 'react'
import { PfButton } from './PfButton'

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
  /** Guide layout: the open step's instruction, primary action and help link */
  body?: React.ReactNode
  /** Guide layout: the one-row result of a done or skipped step. Replaces count and note there. */
  summary?: React.ReactNode
}

export interface PfStepCardsProps {
  steps: PfStepCardsStep[]
  /** The highlighted card. If it matches no step, none is highlighted. Without it, the first step in state 'current' is highlighted. */
  currentId?: string
  /** Minimum card width in px before the grid wraps. Default 150. */
  minCardWidth?: number
  'data-testid'?: string
  /** 'grid' (default) is the card grid. 'guide' is a vertical list with one open step. */
  layout?: 'grid' | 'guide'
  /** Guide layout: the step that is expanded */
  openId?: string
  /** Guide layout: default `Step ${n} of ${total}` */
  positionLabel?: (n: number, total: number) => string
  /** Guide layout: Back is hidden on the first step */
  onBack?(): void
  onContinue?(): void
  /** Guide layout: disables Continue and shows this beside it */
  continueDisabledReason?: string
  /** Default "Back" */
  backLabel?: string
  /** Default "Continue" */
  continueLabel?: string
  /** Guide layout: shown under the Back and Continue buttons */
  footerNote?: React.ReactNode
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

export function PfStepCards(props: PfStepCardsProps) {
  if (props.steps.length === 0) return null
  return props.layout === 'guide' ? <Guide {...props} /> : <Grid {...props} />
}

const rowStyle: React.CSSProperties = { ...cardBase, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: '4px 12px' }

function Guide({
  steps,
  openId,
  positionLabel = (n, total) => `Step ${n} of ${total}`,
  onBack,
  onContinue,
  continueDisabledReason,
  backLabel = 'Back',
  continueLabel = 'Continue',
  footerNote,
  'data-testid': dataTestId,
}: PfStepCardsProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const first = useRef(true)
  // After Continue or Back the old button is gone; put focus on the newly open step's title.
  useEffect(() => {
    if (first.current) first.current = false
    else headingRef.current?.focus()
  }, [openId])

  return (
    <div role="list" style={{ ...rootStyle, gridTemplateColumns: '1fr' }} data-testid={dataTestId}>
      {steps.map((step, i) => {
        const isOpen = step.id === openId
        const muted = step.state === 'todo' || step.state === 'skipped'
        const chip = step.state === 'skipped' ? 'skipped' : step.cost || (step.state === 'done' ? 'Done' : undefined)
        const title = (
          <span style={muted ? { ...headerStyle, color: MUTED } : headerStyle}>
            <span>{step.title}</span>
            {step.tag && <span style={tagStyle}>{step.tag}</span>}
          </span>
        )
        if (!isOpen) {
          return (
            <div key={step.id} role="listitem" aria-label={`${step.title}, ${step.state}`} style={rowStyle}>
              {title}
              {step.summary != null ? (
                <span style={noteStyle}>{step.summary}</span>
              ) : (
                <>
                  {step.count != null && <span style={muted ? { ...chipStyle, color: MUTED } : chipStyle}>{step.count}</span>}
                  {step.note != null && <span style={noteStyle}>{step.note}</span>}
                </>
              )}
              {chip && <span style={{ ...chipStyle, color: step.state === 'done' ? 'var(--pf-positive)' : 'var(--pf-text-secondary)' }}>{chip}</span>}
              {step.action != null && <span>{step.action}</span>}
            </div>
          )
        }
        return (
          <div
            key={step.id}
            role="listitem"
            aria-label={`${step.title}, ${positionLabel(i + 1, steps.length)}`}
            aria-current="step"
            style={{ ...cardBase, border: '2px solid var(--pf-accent-text, var(--pf-accent))', padding: '11px', background: 'var(--pf-bg-surface-alt)' }}
          >
            <div style={noteStyle}>{positionLabel(i + 1, steps.length)}</div>
            <h3 ref={headingRef} tabIndex={-1} style={{ ...headerStyle, margin: 0, fontSize: '16px' }}>
              <span>{step.title}</span>
              {step.tag && <span style={tagStyle}>{step.tag}</span>}
            </h3>
            {step.body != null && <div>{step.body}</div>}
            {(onBack || onContinue) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                {i > 0 && onBack && (
                  <PfButton variant="secondary" onClick={onBack}>
                    {backLabel}
                  </PfButton>
                )}
                {onContinue && (
                  <PfButton disabled={!!continueDisabledReason} reason={continueDisabledReason} onClick={onContinue}>
                    {continueLabel}
                  </PfButton>
                )}
              </div>
            )}
            {footerNote != null && <div style={noteStyle}>{footerNote}</div>}
          </div>
        )
      })}
    </div>
  )
}

function Grid({ steps, currentId, minCardWidth = 150, 'data-testid': dataTestId }: PfStepCardsProps) {

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
