import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

interface PfBottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  'data-testid'?: string
}

let styleInjected = false

function injectStyles() {
  if (styleInjected) return
  if (typeof document === 'undefined') return
  styleInjected = true
  const style = document.createElement('style')
  style.textContent = `
    @keyframes pf-bottomsheet-open {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    @keyframes pf-bottomsheet-close {
      from { transform: translateY(0); }
      to { transform: translateY(100%); }
    }
    .pf-bottomsheet-content[data-state="open"] {
      animation: pf-bottomsheet-open 200ms ease-out;
    }
    .pf-bottomsheet-content[data-state="closed"] {
      animation: pf-bottomsheet-close 150ms ease-in;
    }
  `
  document.head.appendChild(style)
}

export function PfBottomSheet({
  open,
  onClose,
  title,
  children,
  'data-testid': dataTestId,
}: PfBottomSheetProps) {
  injectStyles()

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'var(--pf-bg-overlay)',
    zIndex: 99,
  }

  const contentStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'var(--pf-bg-surface)',
    borderTop: '1px solid var(--pf-border)',
    borderTopLeftRadius: 'var(--pf-radius-lg)',
    borderTopRightRadius: 'var(--pf-radius-lg)',
    padding: '24px',
    maxHeight: '80vh',
    overflowY: 'auto',
    zIndex: 100,
    outline: 'none',
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: title ? '16px' : 0,
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--pf-text-primary)',
    fontFamily: 'var(--pf-font-ui)',
    margin: 0,
  }

  const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: 'var(--pf-text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay style={overlayStyle} />
        <Dialog.Content
          className="pf-bottomsheet-content"
          style={contentStyle}
          data-testid={dataTestId}
        >
          {title && (
            <div style={headerStyle}>
              <Dialog.Title style={titleStyle}>{title}</Dialog.Title>
              <Dialog.Close asChild>
                <button style={closeButtonStyle} aria-label="Close">
                  <X size={18} />
                </button>
              </Dialog.Close>
            </div>
          )}
          {!title && (
            <Dialog.Title style={{ display: 'none' }}>Sheet</Dialog.Title>
          )}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
