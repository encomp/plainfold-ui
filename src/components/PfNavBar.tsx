import React, { useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import type { PfNavItem } from './PfNavDrawer'

interface PfNavBarProps {
  items: PfNavItem[]
  onNavigate: (path: string) => void
  activeItemId: string
  maxVisible?: number
}

export function PfNavBar({
  items,
  onNavigate,
  activeItemId,
  maxVisible = 4,
}: PfNavBarProps) {
  const [moreOpen, setMoreOpen] = useState(false)

  const needsMore = items.length > maxVisible
  const visibleItems = needsMore ? items.slice(0, maxVisible - 1) : items
  const overflowItems = needsMore ? items.slice(maxVisible - 1) : []

  const barStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '64px',
    background: 'var(--pf-bg-surface)',
    borderTop: '1px solid var(--pf-border)',
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  }

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    flex: 1,
    height: '100%',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: isActive ? 'var(--pf-accent-text, var(--pf-accent))' : 'var(--pf-text-secondary)',
    fontFamily: 'var(--pf-font-ui)',
    fontSize: '0.65rem',
    fontWeight: isActive ? 600 : 400,
    padding: 0,
    transition: 'color var(--pf-duration-fast) var(--pf-easing-default)',
  })

  const iconWrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
  }

  const sheetOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'var(--pf-bg-overlay)',
    zIndex: 49,
  }

  const sheetStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '64px',
    left: 0,
    right: 0,
    background: 'var(--pf-bg-surface)',
    borderTop: '1px solid var(--pf-border)',
    borderTopLeftRadius: 'var(--pf-radius-lg)',
    borderTopRightRadius: 'var(--pf-radius-lg)',
    padding: '8px 0',
    zIndex: 51,
  }

  const sheetItemStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px 20px',
    background: isActive ? 'var(--pf-accent-muted)' : 'transparent',
    color: isActive ? 'var(--pf-accent-text, var(--pf-accent))' : 'var(--pf-text-secondary)',
    // one set of border properties (width, style, colour) so React never mixes a shorthand with its parts
    borderWidth: '0 0 0 2px',
    borderStyle: 'solid',
    borderColor: `transparent transparent transparent ${isActive ? 'var(--pf-accent-text, var(--pf-accent))' : 'transparent'}`,
    cursor: 'pointer',
    fontFamily: 'var(--pf-font-ui)',
    fontSize: '14px',
    fontWeight: isActive ? 600 : 400,
    boxSizing: 'border-box',
  })

  const handleMoreClick = () => {
    setMoreOpen(!moreOpen)
  }

  const handleOverflowNav = (path: string) => {
    setMoreOpen(false)
    onNavigate(path)
  }

  const isOverflowActive = overflowItems.some((item) => item.id === activeItemId)

  return (
    <>
      {moreOpen && (
        <div
          style={sheetOverlayStyle}
          onClick={() => setMoreOpen(false)}
          data-testid="nav-more-overlay"
        />
      )}
      {moreOpen && (
        <div style={sheetStyle} data-testid="nav-more-sheet">
          {overflowItems.map((item) => (
            <button
              key={item.id}
              style={sheetItemStyle(item.id === activeItemId)}
              onClick={() => handleOverflowNav(item.path)}
              data-testid={`nav-${item.id}`}
            >
              <span style={iconWrapperStyle}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
      <nav style={barStyle} data-testid="nav-bar">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            style={tabStyle(item.id === activeItemId)}
            onClick={() => onNavigate(item.path)}
            data-testid={`nav-${item.id}`}
          >
            <span style={iconWrapperStyle}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
        {needsMore && (
          <button
            style={tabStyle(isOverflowActive)}
            onClick={handleMoreClick}
            data-testid="nav-more"
          >
            <span style={iconWrapperStyle}>
              <MoreHorizontal size={24} />
            </span>
            <span>More</span>
          </button>
        )}
      </nav>
    </>
  )
}
