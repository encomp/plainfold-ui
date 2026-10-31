import React, { useEffect, useId, useRef, useState } from 'react'
import { PfButton } from './PfButton'
import { useBreakpoint } from '../utils/useBreakpoint'

export type PfChatMode = 'hidden' | 'docked' | 'expanded'

export interface PfChatSource {
  label: string
  href?: string
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
}

export interface PfChatMenuItem {
  id: string
  label: string
  onSelect(): void
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
  zIndex: 1000,
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

const hiddenStyle: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
}

const alertStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: '13px',
  color: 'var(--pf-danger)',
  background: 'var(--pf-danger-muted)',
  borderTop: '1px solid var(--pf-danger)',
}

const composerStyle: React.CSSProperties = {
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

  const last = messages[messages.length - 1]
  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length, last?.text, mode])

  useEffect(() => {
    if (!menuOpen) return
    menuWrapRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
    const onDown = (e: MouseEvent) => {
      if (!menuWrapRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [menuOpen])

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

  const onResizeKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') onWidthChange?.(clamp(width + KEY_STEP))
    else if (e.key === 'ArrowRight') onWidthChange?.(clamp(width - KEY_STEP))
  }

  const rootStyle: React.CSSProperties = {
    ...rootBase,
    ...(phone
      ? phoneStyle
      : expanded
        ? { width: '100%' }
        : { width: `${clamp(width)}px`, flexShrink: 0 }),
    ...(expanded ? {} : { borderLeft: '1px solid var(--pf-border)' }),
  }

  return (
    <aside aria-labelledby={titleId} style={rootStyle} onKeyDown={onKeyDown} data-testid={testId}>
      {!expanded && (
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
          onPointerUp={() => {
            drag.current = null
          }}
          onPointerCancel={() => {
            drag.current = null
          }}
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
              <div role="menu" style={menuStyle}>
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    style={menuItemStyle}
                    data-testid={`${testId}-menu-${item.id}`}
                    onClick={() => {
                      setMenuOpen(false)
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
      <div
        ref={logRef}
        role="log"
        aria-live="polite"
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
            <div style={textStyle}>
              {m.text}
              {m.pending && (
                <span role="img" aria-label="Typing">
                  {' …'}
                </span>
              )}
            </div>
            {m.error && <div style={{ ...smallStyle, color: 'var(--pf-danger)' }}>{m.error}</div>}
            {m.sources && m.sources.length > 0 && (
              <div style={smallStyle}>
                Sources:{' '}
                {m.sources.map((s, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && ', '}
                    {s.href ? (
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
        <textarea
          aria-label="Message"
          rows={2}
          value={draft}
          style={textareaStyle}
          data-testid={`${testId}-input`}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
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
