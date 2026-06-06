import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

interface PfDialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  'data-testid'?: string
}

const sizeMaxWidth: Record<string, string> = {
  sm: '400px',
  md: '560px',
  lg: '720px',
}

let styleInjected = false

function injectStyles() {
  if (styleInjected) return
  if (typeof document === 'undefined') return
  styleInjected = true
  const style = document.createElement('style')
  style.textContent = `
    @keyframes pf-dialog-open {
      from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
      to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    @keyframes pf-dialog-close {
      from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      to { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
    }
    .pf-dialog-content[data-state="open"] {
      animation: pf-dialog-open 150ms ease-out;
    }
    .pf-dialog-content[data-state="closed"] {
      animation: pf-dialog-close 100ms ease-in;
    }
  `
  document.head.appendChild(style)
}

export function PfDialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  'data-testid': dataTestId,
}: PfDialogProps) {
  injectStyles()

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'var(--pf-bg-overlay)',
    zIndex: 99,
  }

  const contentStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'var(--pf-bg-surface)',
    border: '1px solid var(--pf-border)',
    borderRadius: 'var(--pf-radius-lg)',
    padding: '24px',
    maxWidth: sizeMaxWidth[size],
    width: '90vw',
    maxHeight: '90vh',
    overflowY: 'auto',
    zIndex: 100,
    outline: 'none',
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--pf-text-primary)',
    fontFamily: 'var(--pf-font-ui)',
    margin: 0,
  }

  const descriptionStyle: React.CSSProperties = {
    fontSize: '14px',
    color: 'var(--pf-text-secondary)',
    fontFamily: 'var(--pf-font-ui)',
    margin: '4px 0 0 0',
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
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

  const footerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    borderTop: '1px solid var(--pf-border)',
    paddingTop: '16px',
    marginTop: '16px',
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay style={overlayStyle} data-testid={dataTestId ? `${dataTestId}-overlay` : undefined} />
        <Dialog.Content
          className="pf-dialog-content"
          style={contentStyle}
          data-testid={dataTestId}
        >
          <div style={headerStyle}>
            <div>
              <Dialog.Title style={titleStyle}>{title}</Dialog.Title>
              {description && (
                <Dialog.Description style={descriptionStyle}>
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button style={closeButtonStyle} aria-label="Close">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>
          {children}
          {footer && <div style={footerStyle}>{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
