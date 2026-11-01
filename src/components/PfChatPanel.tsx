import React, { useEffect, useId, useRef, useState } from 'react'
import { PfButton } from './PfButton'
import { useBreakpoint } from '../utils/useBreakpoint'

export type PfChatMode = 'hidden' | 'docked' | 'expanded'

export interface PfChatSource {
  label: string
  href?: string
}

export interface PfChatStep {
  id: string
  label: string
  state: 'running' | 'done' | 'error'
}

export interface PfChatQuestion {
  text: string
  /** No choices: the composer is the way to answer */
  choices?: { id: string; label: string }[]
  /** Fires once; the choices are disabled afterwards */
  onChoose?(id: string): void
}

export interface PfChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  /** e.g. "Model A · $0.002", shown under the message */
  meta?: string
  sources?: PfChatSource[]
  /** Still streaming: a typing indicator after the text */
  pending?: boolean
  /** Shown under the text in the danger colour */
  error?: string
  /** Lookups done for this reply: a live list while pending, one folded line when all are done */
  steps?: PfChatStep[]
  /** Heading before the sources. Default "Sources" */
  sourcesLabel?: string
  /** The reply asks instead of guessing */
  question?: PfChatQuestion
  /** The reply stopped at a limit; Continue starts another */
  stopped?: { message: string; onContinue(): void }
}

export interface PfChatMenuItem {
  id: string
  label: string
  onSelect(): void
}

export interface PfChatCostMeter {
  spentUsd: number
  ceilingUsd: number
  /** Default "This reply so far" */
  label?: string
}

export interface PfChatSlashItem {
  id: string
  /** Without the slash */
  name: string
  description: string
  /** Who may use it, shown as "for <whoLabel>" */
  whoLabel: string
}

export interface PfChatPanelProps {
  mode: PfChatMode
  onModeChange(mode: PfChatMode): void
  messages: PfChatMessage[]
  status: 'idle' | 'sending' | 'error'
  /** Shown in an alert above the composer when status is 'error'; a node so it can hold a link */
  error?: React.ReactNode
  draft: string
  onDraftChange(text: string): void
  onSend(text: string): void
  /** Default "Chat" */
  title?: React.ReactNode
  header?: React.ReactNode
  context?: React.ReactNode
  menuItems?: PfChatMenuItem[]
  renderMessageActions?(m: PfChatMessage): React.ReactNode
  footer?: React.ReactNode
  /** Spend against a limit, above the messages: warning colour from 80%, danger at 100% */
  costMeter?: PfChatCostMeter
  /** Typing "/" in the composer lists these; without them "/" is plain text */
  slashItems?: PfChatSlashItem[]
  onSlashSelect?(item: PfChatSlashItem): void
  emptyState?: React.ReactNode
  /** Expanded only: the page's summary strip at the top */
  summary?: React.ReactNode
  /** Docked only, px. Default 380, min 280, max 720 */
  width?: number
  onWidthChange?(width: number): void
  'data-testid'?: string
}

const MIN_WIDTH = 280
const MAX_WIDTH = 720
const DEFAULT_WIDTH = 380
const KEY_STEP = 20

// Sources may come from model output: link only web and site-relative URLs, never javascript: or data:, nor a form a browser reads as protocol-relative.
const SAFE_HREF = /^(https?:\/\/|\/(?![/\\\t\n\r]))/i

const clamp = (n: number) => Math.min(Math.max(n, MIN_WIDTH), MAX_WIDTH)

const rootBase: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  height: '100%',
  minWidth: 0,
  background: 'var(--pf-bg-surface)',
  color: 'var(--pf-text-primary)',
  fontFamily: 'var(--pf-font-ui)',
}

const phoneStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 40,
  width: '100%',
  height: '100%',
}

const handleStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: '-3px',
  width: '6px',
  cursor: 'col-resize',
  touchAction: 'none',
  background: 'transparent',
  zIndex: 1,
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '4px',
  padding: '8px 12px',
  borderBottom: '1px solid var(--pf-border)',
}

const titleStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  margin: 0,
  fontSize: '16px',
  fontWeight: 600,
  overflowWrap: 'anywhere',
}

const menuWrapStyle: React.CSSProperties = { position: 'relative' }

const menuButtonStyle: React.CSSProperties = {
  padding: '6px 10px',
  fontSize: '16px',
  lineHeight: 1,
  color: 'var(--pf-text-secondary)',
  background: 'transparent',
  border: '1px solid transparent',
  borderRadius: 'var(--pf-radius-sm)',
  cursor: 'pointer',
}

const menuStyle: React.CSSProperties = {
  position: 'absolute',
  right: 0,
  top: '100%',
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  minWidth: '180px',
  padding: '4px',
  background: 'var(--pf-bg-elevated)',
  border: '1px solid var(--pf-border)',
  borderRadius: 'var(--pf-radius-md)',
}

const menuItemStyle: React.CSSProperties = {
  padding: '8px 12px',
  textAlign: 'left',
  fontSize: '14px',
  fontFamily: 'inherit',
  color: 'var(--pf-text-primary)',
  background: 'transparent',
  border: 'none',
  borderRadius: 'var(--pf-radius-sm)',
  cursor: 'pointer',
}

const contextStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid var(--pf-border)',
}

const logStyle: React.CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '12px',
}

const messageBase: React.CSSProperties = {
  maxWidth: '92%',
  padding: '8px 12px',
  borderRadius: 'var(--pf-radius-md)',
  fontSize: '14px',
  overflowWrap: 'anywhere',
}

const MESSAGE_BG = {
  user: { alignSelf: 'flex-end', background: 'var(--pf-accent-muted)' },
  assistant: { alignSelf: 'flex-start', background: 'var(--pf-bg-surface-alt)' },
} satisfies Record<PfChatMessage['role'], React.CSSProperties>

const textStyle: React.CSSProperties = { whiteSpace: 'pre-wrap' }

const smallStyle: React.CSSProperties = {
  marginTop: '4px',
  fontSize: '12px',
  color: 'var(--pf-text-muted)',
}

// muted is under 4.5:1 at 12px on the dark panel; secondary clears it in every bundled theme
const smallLegibleStyle: React.CSSProperties = { ...smallStyle, color: 'var(--pf-text-secondary)' }

const hiddenStyle: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
}

const stepsStyle: React.CSSProperties = { margin: '0 0 6px', padding: 0, listStyle: 'none', fontSize: '13px' }

const stepStyle: React.CSSProperties = { display: 'flex', gap: '6px', padding: '2px 0' }

const STEP_GLYPH = { running: '◌', done: '✓', error: '✕' } satisfies Record<PfChatStep['state'], string>
const STEP_WORD = { running: 'Running', done: 'Done', error: 'Error' } satisfies Record<PfChatStep['state'], string>

const questionStyle: React.CSSProperties = {
  marginTop: '8px',
  padding: '8px',
  border: '1px solid var(--pf-border)',
  borderRadius: 'var(--pf-radius-md)',
  background: 'var(--pf-bg-base)',
}

const choicesStyle: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }

const choiceStyle: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: '13px',
  fontFamily: 'inherit',
  color: 'var(--pf-accent)',
  background: 'transparent',
  border: '1px solid var(--pf-accent)',
  borderRadius: 'var(--pf-radius-md)',
  cursor: 'pointer',
}

const stoppedStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '8px',
  marginTop: '8px',
  fontSize: '13px',
}

const alertStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: '13px',
  color: 'var(--pf-danger)',
  background: 'var(--pf-danger-muted)',
  borderTop: '1px solid var(--pf-danger)',
}

const composerStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'flex-end',
  gap: '8px',
  padding: '8px 12px',
  borderTop: '1px solid var(--pf-border)',
}

const textareaStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  boxSizing: 'border-box',
  resize: 'none',
  padding: '8px',
  fontSize: '14px',
  fontFamily: 'inherit',
  color: 'var(--pf-text-primary)',
  background: 'var(--pf-bg-base)',
  border: '1px solid var(--pf-border)',
  borderRadius: 'var(--pf-radius-sm)',
}

const footerStyle: React.CSSProperties = { padding: '0 12px 8px', fontSize: '12px' }

const meterStyle: React.CSSProperties = { padding: '8px 12px', borderBottom: '1px solid var(--pf-border)' }

const meterTextStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '8px',
  fontSize: '12px',
  color: 'var(--pf-text-secondary)',
}

const meterTrackStyle: React.CSSProperties = {
  height: '6px',
  marginTop: '4px',
  overflow: 'hidden',
  background: 'var(--pf-bg-surface-alt)',
  borderRadius: 'var(--pf-radius-sm)',
}

const slashListStyle: React.CSSProperties = {
  position: 'absolute',
  left: '12px',
  right: '12px',
  bottom: '100%',
  zIndex: 2,
  maxHeight: '240px',
  overflowY: 'auto',
  margin: 0,
  padding: '4px',
  listStyle: 'none',
  background: 'var(--pf-bg-elevated)',
  border: '1px solid var(--pf-border)',
  borderRadius: 'var(--pf-radius-md)',
}

const slashOptionStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: '14px',
  cursor: 'pointer',
  borderRadius: 'var(--pf-radius-sm)',
}

const money = (n: number) => `$${n.toFixed(2)}`
const safe = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0)

function CostMeter({ meter }: { meter: PfChatCostMeter }) {
  const { label = 'This reply so far' } = meter
  const ceiling = safe(meter.ceilingUsd)
  const spentRaw = safe(meter.spentUsd)
  const spent = Math.min(spentRaw, ceiling)
  const ratio = ceiling > 0 ? spent / ceiling : 1
  const color = ratio >= 1 ? 'var(--pf-danger)' : ratio >= 0.8 ? 'var(--pf-warning)' : 'var(--pf-accent)'
  const text = `${money(spentRaw)} of ${money(ceiling)}`
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuenow={spent}
      aria-valuemin={0}
      aria-valuemax={ceiling}
      aria-valuetext={text}
      style={meterStyle}
      data-testid="chat-panel-cost-meter"
    >
      <div style={meterTextStyle}>
        <span>{label}</span>
        <span>{text}</span>
      </div>
      <div style={meterTrackStyle}>
        <div
          style={{ width: `${ratio * 100}%`, height: '100%', background: color }}
          data-testid="chat-panel-cost-meter-fill"
        />
      </div>
    </div>
  )
}

function StepList({ steps }: { steps: PfChatStep[] }) {
  return (
    <ul style={stepsStyle}>
      {steps.map((st) => (
        <li key={st.id} style={stepStyle}>
          <span aria-hidden="true">{STEP_GLYPH[st.state]}</span>
          <span style={hiddenStyle}>{STEP_WORD[st.state]}: </span>
          <span style={st.state === 'error' ? { color: 'var(--pf-danger)' } : undefined}>{st.label}</span>
        </li>
      ))}
    </ul>
  )
}

function MessageSteps({ steps, pending }: { steps: PfChatStep[]; pending?: boolean }) {
  if (steps.length === 0) return null
  const folded = !pending && steps.every((st) => st.state === 'done')
  // The status wrapper stays mounted so progress and finish are both announced.
  return (
    <div role="status" aria-label="Steps">
      {folded ? (
        <details style={{ ...smallLegibleStyle, marginTop: 0, marginBottom: '6px' }}>
          <summary>{steps.length === 1 ? '1 step' : `${steps.length} steps`}</summary>
          <StepList steps={steps} />
        </details>
      ) : (
        <StepList steps={steps} />
      )}
    </div>
  )
}

function MessageQuestion({ question }: { question: PfChatQuestion }) {
  const [chosen, setChosen] = useState(false)
  const choices = question.choices ?? []
  return (
    <div role="group" aria-label={question.text} style={questionStyle}>
      <div style={{ fontWeight: 600 }}>{question.text}</div>
      {choices.length > 0 && (
        <div style={choicesStyle}>
          {choices.map((c) => (
            <button
              key={c.id}
              type="button"
              data-choice={c.id}
              disabled={chosen}
              style={{ ...choiceStyle, ...(chosen ? { opacity: 0.5, cursor: 'default' } : {}) }}
              onClick={() => {
                if (chosen) return
                setChosen(true)
                question.onChoose?.(c.id)
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function PfChatPanel({
  mode,
  onModeChange,
  messages,
  status,
  error,
  draft,
  onDraftChange,
  onSend,
  title = 'Chat',
  header,
  context,
  menuItems,
  renderMessageActions,
  footer,
  costMeter,
  slashItems,
  onSlashSelect,
  emptyState,
  summary,
  width = DEFAULT_WIDTH,
  onWidthChange,
  'data-testid': testId = 'pf-chat',
}: PfChatPanelProps) {
  const titleId = useId()
  const phone = useBreakpoint() === 'mobile'
  const [menuOpen, setMenuOpen] = useState(false)
  const menuWrapRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; width: number } | null>(null)

  // Follow the newest text, but not while the reader has scrolled up (streaming must not yank them).
  const last = messages[messages.length - 1]
  const nearBottom = useRef(true)
  const seenCount = useRef(0)
  useEffect(() => {
    const el = logRef.current
    if (el && (nearBottom.current || messages.length !== seenCount.current)) {
      el.scrollTop = el.scrollHeight
    }
    seenCount.current = messages.length
  }, [messages.length, last?.text, mode])

  // Hiding unmounts the log and the menu: a reopened panel starts at the newest message, menu shut.
  useEffect(() => {
    if (mode === 'hidden') {
      nearBottom.current = true
      setMenuOpen(false)
    }
  }, [mode])

  useEffect(() => {
    if (!menuOpen) return
    menuWrapRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
    const onDown = (e: MouseEvent) => {
      if (!menuWrapRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [menuOpen])

  // The slash menu: open while the draft is "/" plus a name fragment; Escape shuts it until the draft changes.
  const slashId = useId()
  const [slashIndex, setSlashIndex] = useState(0)
  const [slashShut, setSlashShut] = useState(false)
  const typed = /^\/\S*$/.test(draft) ? draft.slice(1).toLowerCase() : null
  const slashMatches =
    typed === null || !slashItems ? [] : slashItems.filter((it) => it.name.toLowerCase().startsWith(typed))
  const slashOpen = slashMatches.length > 0 && !slashShut
  const slashAt = Math.min(slashIndex, slashMatches.length - 1)
  const pickSlash = (item: PfChatSlashItem) => {
    onDraftChange(`/${item.name} `)
    onSlashSelect?.(item)
  }

  if (mode === 'hidden') return null

  // On a phone a docked panel is a full-screen layer, same as expanded.
  const expanded = mode === 'expanded' || phone
  const canSend = status !== 'sending' && draft.trim() !== ''
  const send = () => {
    if (canSend) onSend(draft.trim())
  }

  const closeMenu = () => {
    setMenuOpen(false)
    menuButtonRef.current?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Escape') return
    // Escape belongs to the chat: it closes the menu and never reaches the page behind.
    e.stopPropagation()
    if (menuOpen) closeMenu()
  }

  const onMenuKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') return closeMenu()
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'))
    const at = items.indexOf(document.activeElement as HTMLElement)
    const next = { ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: items.length - 1 }[e.key]
    if (next === undefined) return
    e.preventDefault()
    items[(next + items.length) % items.length]?.focus()
  }

  const endDrag = () => {
    drag.current = null
  }

  const onResizeKey = (e: React.KeyboardEvent) => {
    const delta = { ArrowLeft: KEY_STEP, ArrowRight: -KEY_STEP }[e.key]
    if (delta === undefined) return
    e.preventDefault()
    onWidthChange?.(clamp(width + delta))
  }

  const rootStyle: React.CSSProperties = {
    ...rootBase,
    ...(phone
      ? phoneStyle
      : expanded
        ? { width: '100%' }
        : { width: `${clamp(width)}px`, maxWidth: '60%', flexShrink: 0 }),
    ...(expanded ? {} : { borderLeft: '1px solid var(--pf-border)' }),
  }

  return (
    <aside aria-labelledby={titleId} style={rootStyle} onKeyDown={onKeyDown} data-testid={testId}>
      {!expanded && onWidthChange && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize chat"
          aria-valuenow={clamp(width)}
          aria-valuemin={MIN_WIDTH}
          aria-valuemax={MAX_WIDTH}
          tabIndex={0}
          style={handleStyle}
          data-testid={`${testId}-resize`}
          onKeyDown={onResizeKey}
          onPointerDown={(e) => {
            drag.current = { x: e.clientX, width: clamp(width) }
            e.currentTarget.setPointerCapture?.(e.pointerId)
          }}
          onPointerMove={(e) => {
            if (drag.current)
              onWidthChange?.(clamp(drag.current.width + drag.current.x - e.clientX))
          }}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        />
      )}
      {expanded && summary}
      <div style={headerStyle}>
        <h2 id={titleId} style={titleStyle}>
          {title}
        </h2>
        {header}
        {menuItems && menuItems.length > 0 && (
          <div ref={menuWrapRef} style={menuWrapStyle}>
            <button
              ref={menuButtonRef}
              type="button"
              aria-label="More"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              style={menuButtonStyle}
              data-testid={`${testId}-menu`}
              onClick={() => setMenuOpen((o) => !o)}
            >
              ⋯
            </button>
            {menuOpen && (
              <div role="menu" aria-label="Chat options" style={menuStyle} onKeyDown={onMenuKey}>
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    style={menuItemStyle}
                    data-testid={`${testId}-menu-${item.id}`}
                    onClick={() => {
                      closeMenu()
                      item.onSelect()
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {!phone && (
          <PfButton
            variant="ghost"
            size="sm"
            aria-label={expanded ? 'Dock chat' : 'Expand chat'}
            data-testid={`${testId}-expand`}
            onClick={() => onModeChange(expanded ? 'docked' : 'expanded')}
          >
            {expanded ? '⇲' : '⇱'}
          </PfButton>
        )}
        <PfButton
          variant="ghost"
          size="sm"
          aria-label="Close chat"
          data-testid={`${testId}-close`}
          onClick={() => onModeChange('hidden')}
        >
          ✕
        </PfButton>
      </div>
      {context != null && <div style={contextStyle}>{context}</div>}
      {costMeter && <CostMeter meter={costMeter} />}
      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-busy={last?.pending ? true : undefined}
        onScroll={(e) => {
          const el = e.currentTarget
          nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40
        }}
        style={logStyle}
        data-testid={`${testId}-messages`}
      >
        {messages.length === 0 && emptyState}
        {messages.map((m) => (
          <div
            key={m.id}
            style={{ ...messageBase, ...MESSAGE_BG[m.role] }}
            data-testid={`${testId}-message-${m.id}`}
          >
            <span style={hiddenStyle}>{m.role === 'user' ? 'You: ' : 'Assistant: '}</span>
            {m.steps && <MessageSteps steps={m.steps} pending={m.pending} />}
            <div style={textStyle}>
              {m.text}
              {m.pending && (
                <span role="img" aria-label="Typing">
                  {' …'}
                </span>
              )}
            </div>
            {m.question && <MessageQuestion key={m.question.text} question={m.question} />}
            {m.error && <div style={{ ...smallStyle, color: 'var(--pf-danger)' }}>{m.error}</div>}
            {m.sources && m.sources.length > 0 && (
              <div style={smallStyle}>
                {m.sourcesLabel ?? 'Sources'}:{' '}
                {m.sources.map((s, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && ', '}
                    {s.href && SAFE_HREF.test(s.href) ? (
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--pf-accent)' }}
                      >
                        {s.label}
                      </a>
                    ) : (
                      <span>{s.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
            {m.stopped && (
              <div style={stoppedStyle}>
                <span>{m.stopped.message}</span>
                <PfButton size="sm" data-testid="chat-panel-continue" onClick={m.stopped.onContinue}>
                  Continue
                </PfButton>
              </div>
            )}
            {m.meta && <div style={smallStyle}>{m.meta}</div>}
            {m.role === 'assistant' && !m.pending && renderMessageActions?.(m)}
          </div>
        ))}
      </div>
      {status === 'error' && error != null && (
        <div role="alert" style={alertStyle}>
          {error}
        </div>
      )}
      <div style={composerStyle}>
        {slashItems && (
          <div role="status" aria-live="polite" data-testid={`${testId}-slash-live`} style={hiddenStyle}>
            {slashOpen
              ? `/${slashMatches[slashAt].name}, ${slashMatches[slashAt].description}, ${slashAt + 1} of ${slashMatches.length}`
              : ''}
          </div>
        )}
        {slashOpen && (
          <ul role="listbox" aria-label="Commands" id={`${slashId}-list`} style={slashListStyle}>
            {slashMatches.map((it, i) => (
              <li
                key={it.id}
                id={`${slashId}-${i}`}
                role="option"
                aria-selected={i === slashAt}
                data-testid={`${testId}-slash-${it.id}`}
                style={{ ...slashOptionStyle, ...(i === slashAt ? { background: 'var(--pf-accent-muted)' } : {}) }}
                // mousedown would blur the textarea before click lands
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pickSlash(it)}
              >
                <span style={{ color: 'var(--pf-accent)', fontWeight: 600 }}>/{it.name}</span> {it.description}
                <div style={smallLegibleStyle}>for {it.whoLabel}</div>
              </li>
            ))}
          </ul>
        )}
        <textarea
          aria-label="Message"
          rows={2}
          value={draft}
          style={textareaStyle}
          data-testid={`${testId}-input`}
          // a textarea may not be a combobox: the highlight is announced by the live region instead
          {...(slashOpen && { 'aria-controls': `${slashId}-list`, 'aria-autocomplete': 'list' as const })}
          onChange={(e) => {
            setSlashIndex(0)
            setSlashShut(false)
            onDraftChange(e.target.value)
          }}
          onKeyDown={(e) => {
            if (slashOpen && !e.nativeEvent.isComposing && e.keyCode !== 229) {
              const n = slashMatches.length
              if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault()
                setSlashIndex((slashAt + (e.key === 'ArrowDown' ? 1 : n - 1)) % n)
                return
              }
              if (e.key === 'Enter') {
                e.preventDefault()
                pickSlash(slashMatches[slashAt])
                return
              }
              if (e.key === 'Escape') {
                setSlashShut(true)
                return
              }
            }
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
              e.preventDefault()
              send()
            }
          }}
        />
        <PfButton disabled={!canSend} data-testid={`${testId}-send`} onClick={send}>
          Send
        </PfButton>
      </div>
      {footer != null && <div style={footerStyle}>{footer}</div>}
    </aside>
  )
}
