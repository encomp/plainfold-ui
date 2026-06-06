import React from 'react'
import { PfDialog } from './PfDialog'
import { PfButton } from './PfButton'

interface PfConfirmDialogProps {
  open: boolean
  onClose: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
  onConfirm: () => void
}

export function PfConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
}: PfConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <PfDialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <PfButton variant="ghost" onClick={onClose}>
            {cancelLabel}
          </PfButton>
          <PfButton variant={variant === 'danger' ? 'danger' : 'primary'} onClick={handleConfirm}>
            {confirmLabel}
          </PfButton>
        </>
      }
    >
      <></>
    </PfDialog>
  )
}
