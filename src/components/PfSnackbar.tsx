import React, { useEffect } from 'react'
import { PfButton } from './PfButton'

interface PfSnackbarProps {
  open: boolean
  onClose: () => void
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  autoHideDuration?: number
}

export function PfSnackbar({
  open,
  onClose,
  message,
  action,
  autoHideDuration = 5000,
}: PfSnackbarProps) {
  useEffect(() => {
    if (!open) return

    const timer = setTimeout(() => {
      onClose()
    }, autoHideDuration)

    return () => clearTimeout(timer)
  }, [open, autoHideDuration, onClose])

  if (!open) return null

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'var(--pf-bg-elevated)',
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
    <div style={containerStyle} role="alert" data-testid="pf-snackbar">
      <span style={messageStyle}>{message}</span>
      {action && (
        <PfButton variant="ghost" size="sm" onClick={action.onClick}>
          {action.label}
        </PfButton>
      )}
    </div>
  )
}
