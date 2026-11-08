import React, { useEffect, useRef, useState } from 'react'
import { PfButton } from './PfButton'
import { useBreakpoint } from '../utils/useBreakpoint'

interface PfSnackbarProps {
  open: boolean
  onClose: () => void
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  /** Milliseconds before onClose fires; null keeps it open until closed. */
  autoHideDuration?: number | null
  /** When set, shows a close button with this accessible name. */
  closeLabel?: string
  /** Distance from the bottom edge (number = px), to clear fixed bottom UI. Default 24px; the safe-area inset is added. */
  bottomOffset?: number | string
}

export function PfSnackbar({
  open,
  onClose,
  message,
  action,
  autoHideDuration = 5000,
  closeLabel,
  bottomOffset = 24,
}: PfSnackbarProps) {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const narrow = useBreakpoint() === 'mobile'
  const paused = hovered || focused
  const remaining = useRef(autoHideDuration)

  // A new onClose restarts the countdown, as before; pause/resume does not.
  useEffect(() => {
    remaining.current = autoHideDuration
  }, [open, autoHideDuration, onClose])

  // An unmounted node may never fire leave/blur, so clear both on close.
  useEffect(() => {
    if (!open) {
      setHovered(false)
      setFocused(false)
    }
  }, [open])

  // Runs after the reset effect above; cleanup banks the time already elapsed.
  useEffect(() => {
    if (!open || paused || autoHideDuration === null) return
    const startedAt = Date.now()
    const timer = setTimeout(onClose, remaining.current ?? 0)
    return () => {
      clearTimeout(timer)
      remaining.current = (remaining.current ?? 0) - (Date.now() - startedAt)
    }
  }, [open, paused, autoHideDuration, onClose])

  if (!open) return null

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: `calc(${typeof bottomOffset === 'number' ? `${bottomOffset}px` : bottomOffset} + env(safe-area-inset-bottom, 0px))`,
    ...(narrow
      ? { left: '16px', right: '16px', transform: 'none' }
      : { left: '50%', transform: 'translateX(-50%)', maxWidth: 'min(560px, calc(100vw - 32px))' }),
    boxSizing: 'border-box',
    background: 'var(--pf-bg-elevated, var(--pf-bg-surface))',
    border: '1px solid var(--pf-border)',
    borderRadius: 'var(--pf-radius-md)',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    zIndex: 9999,
    opacity: 1,
    transition: 'opacity var(--pf-duration-fast) var(--pf-easing-default)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  }

  const messageStyle: React.CSSProperties = {
    color: 'var(--pf-text-primary)',
    fontSize: '14px',
    fontFamily: 'var(--pf-font-ui)',
  }

  return (
    <div
      style={containerStyle}
      role="alert"
      data-testid="pf-snackbar"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <span style={messageStyle}>{message}</span>
      {action && (
        <PfButton variant="ghost" size="sm" onClick={action.onClick}>
          {action.label}
        </PfButton>
      )}
      {closeLabel && (
        <PfButton variant="ghost" size="sm" aria-label={closeLabel} onClick={onClose}>
          ×
        </PfButton>
      )}
    </div>
  )
}
