import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export interface PfRowMenuItem {
  id: string
  label: string
  onSelect(): void
  testId?: string
}

interface Props {
  items: PfRowMenuItem[]
  label: string
  testId?: string
  popupTestId?: string
}

// Above dialogs and sheets (z-index 100), below snackbars (9999).
const MENU_Z_INDEX = 1000

/** Internal: the "⋯" trigger and menu popup of PfDataTable rows. */
export function PfRowMenu({ items, label, testId, popupTestId }: Props) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, right: 0, above: 0 })
  const trigger = useRef<HTMLButtonElement>(null)
  const popup = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    popup.current?.querySelector<HTMLElement>('[role=menuitem]')?.focus()
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (popup.current?.contains(t) || trigger.current?.contains(t)) return
      setOpen(false)
    }
    const onScroll = (e: Event) => {
      if (e.target instanceof Node && popup.current?.contains(e.target)) return
      // the focused item is about to unmount: keep focus on the trigger instead of losing it
      const held = popup.current?.contains(document.activeElement)
      setOpen(false)
      if (held) trigger.current?.focus()
    }
    document.addEventListener('mousedown', onDown)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [open])

  // flip above the trigger when the popup would run off the bottom of the viewport
  useLayoutEffect(() => {
    if (!open || !popup.current) return
    const h = popup.current.offsetHeight
    if (h > 0 && pos.top + h > window.innerHeight && pos.above - h >= 0) {
      setPos((p) => ({ ...p, top: p.above - h }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const close = (refocus: boolean) => {
    setOpen(false)
    if (refocus) trigger.current?.focus()
  }

  const move = (delta: number) => {
    const els = Array.from(popup.current?.querySelectorAll<HTMLElement>('[role=menuitem]') ?? [])
    if (!els.length) return
    const i = els.indexOf(document.activeElement as HTMLElement)
    els[(i + delta + els.length) % els.length].focus()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true) }
    else if (e.key === 'ArrowDown') { e.preventDefault(); move(1) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1) }
    else if (e.key === 'Tab') close(true) // no preventDefault: Tab then moves on from the trigger
  }

  return (
    <>
      <button
        ref={trigger}
        type="button"
        data-pf-menu-trigger=""
        data-testid={testId}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          if (!open && trigger.current) {
            const r = trigger.current.getBoundingClientRect()
            setPos({ top: r.bottom + 4, right: Math.max(0, window.innerWidth - r.right), above: r.top - 4 })
          }
          setOpen(!open)
        }}
        style={{ background: 'none', border: '1px solid transparent', borderRadius: 6, cursor: 'pointer',
          color: 'var(--pf-text-primary)', font: 'inherit', fontSize: 18, lineHeight: 1, padding: '4px 8px' }}
      >
        ⋯
      </button>
      {open && createPortal(
        <div
          ref={popup}
          role="menu"
          aria-label={label}
          data-testid={popupTestId}
          onKeyDown={onKeyDown}
          onClick={(e) => e.stopPropagation()}
          style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: MENU_Z_INDEX, minWidth: 160,
            background: 'var(--pf-bg-elevated, var(--pf-bg-surface))', color: 'var(--pf-text-primary)',
            border: '1px solid var(--pf-border)', borderRadius: 8, padding: 4,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}
        >
          {items.map((it) => (
            <button
              key={it.id}
              type="button"
              role="menuitem"
              tabIndex={-1}
              data-testid={it.testId}
              onClick={() => { close(true); it.onSelect() }}
              style={{ background: 'none', border: 0, color: 'inherit', cursor: 'pointer', font: 'inherit',
                fontSize: 14, padding: '8px 12px', textAlign: 'left', borderRadius: 4 }}
            >
              {it.label}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </>
  )
}
