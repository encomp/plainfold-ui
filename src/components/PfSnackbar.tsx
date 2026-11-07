import React, { useEffect, useRef, useState } from 'react'
import { PfButton } from './PfButton'

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
}

export function PfSnackbar({
  open,
  onClose,
  message,
  action,
  autoHideDuration = 5000,
  closeLabel,
}: PfSnackbarProps) {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const paused = hovered || focused
  const remaining = useRef(autoHideDuration)

  useEffect(() => {
    remaining.current = autoHideDuration
  }, [open, autoHideDuration])

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
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
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
