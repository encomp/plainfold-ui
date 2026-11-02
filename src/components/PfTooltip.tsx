import React from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'

interface PfTooltipProps {
  content: string
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  delayDuration?: number
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function PfTooltip({
  content,
  children,
  side = 'top',
  delayDuration = 300,
  open,
  onOpenChange,
}: PfTooltipProps) {
  const contentStyle: React.CSSProperties = {
    background: 'var(--pf-bg-elevated, var(--pf-bg-surface))',
    color: 'var(--pf-text-primary)',
    border: '1px solid var(--pf-border)',
    borderRadius: 'var(--pf-radius-sm)',
    fontSize: '12px',
    padding: '4px 8px',
    fontFamily: 'var(--pf-font-ui)',
    zIndex: 9999,
  }

  return (
    <Tooltip.Provider delayDuration={delayDuration}>
      <Tooltip.Root open={open} onOpenChange={onOpenChange}>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content side={side} style={contentStyle} sideOffset={4}>
            {content}
            <Tooltip.Arrow
              style={{
                fill: 'var(--pf-bg-elevated, var(--pf-bg-surface))',
              }}
            />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
