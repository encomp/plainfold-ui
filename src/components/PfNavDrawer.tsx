import React, { useState } from 'react'

export interface PfNavItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
  group?: string
}

interface PfNavDrawerProps {
  items: PfNavItem[]
  onNavigate: (path: string) => void
  activeItemId: string
  appName?: string
  logo?: React.ReactNode
  collapsed?: boolean
  navFooter?: React.ReactNode
}

export function PfNavDrawer({
  items,
  onNavigate,
  activeItemId,
  appName,
  logo,
  collapsed = false,
  navFooter,
}: PfNavDrawerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const navStyle: React.CSSProperties = {
    width: collapsed ? '64px' : '240px',
    height: '100%',
    background: 'var(--pf-bg-surface)',
    borderRight: '1px solid var(--pf-border)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    flexShrink: 0,
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: collapsed ? '16px 12px' : '16px 20px',
    justifyContent: collapsed ? 'center' : 'flex-start',
  }

  const appNameStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--pf-text-primary)',
    fontFamily: 'var(--pf-font-ui)',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }

  const itemsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: collapsed ? '8px 4px' : '8px 12px',
    flex: 1,
  }

  function getItemStyle(item: PfNavItem): React.CSSProperties {
    const isActive = item.id === activeItemId
    const isHovered = item.id === hoveredId

    return {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: collapsed ? '10px 0' : '10px 12px',
      justifyContent: collapsed ? 'center' : 'flex-start',
      background: isActive ? 'var(--pf-accent-muted)' : 'transparent',
      borderLeft: isActive ? '2px solid var(--pf-accent)' : '2px solid transparent',
      color: isActive
        ? 'var(--pf-accent-text, var(--pf-accent))'
        : isHovered
          ? 'var(--pf-text-primary)'
          : 'var(--pf-text-secondary)',
      border: 'none',
      borderLeftWidth: '2px',
      borderLeftStyle: 'solid',
      borderLeftColor: isActive ? 'var(--pf-accent)' : 'transparent',
      cursor: 'pointer',
      borderRadius: 'var(--pf-radius-sm)',
      fontFamily: 'var(--pf-font-ui)',
      fontSize: '14px',
      fontWeight: isActive ? 600 : 400,
      transition: 'all var(--pf-duration-fast) var(--pf-easing-default)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      width: '100%',
      boxSizing: 'border-box',
    }
  }

  const iconWrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '20px',
    height: '20px',
  }

  function groupHeader(item: PfNavItem, index: number) {
    if (!item.group || item.group === items[index - 1]?.group) return null
    const divider = index > 0 ? '1px solid var(--pf-border)' : undefined
    if (collapsed) {
      return <div role="presentation" style={{ borderTop: divider, margin: '6px 8px' }} />
    }
    return (
      <div
        role="presentation"
        data-testid={`nav-group-${item.group
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')}`}
        style={{
          borderTop: divider,
          marginTop: index > 0 ? '8px' : undefined,
          padding: '10px 12px 4px',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--pf-text-secondary)',
          fontFamily: 'var(--pf-font-ui)',
        }}
      >
        {item.group}
      </div>
    )
  }

  return (
    <nav style={navStyle} data-testid="nav-drawer">
      {(logo || appName) && (
        <div style={headerStyle}>
          {logo}
          {!collapsed && appName && <span style={appNameStyle}>{appName}</span>}
        </div>
      )}
      <div style={itemsContainerStyle}>
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            {groupHeader(item, index)}
            <button
              style={getItemStyle(item)}
              onClick={() => onNavigate(item.path)}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              data-testid={`nav-${item.id}`}
              title={collapsed ? item.label : undefined}
            >
              <span style={iconWrapperStyle}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          </React.Fragment>
        ))}
      </div>
      {!collapsed && navFooter}
    </nav>
  )
}
