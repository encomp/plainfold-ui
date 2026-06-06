import React from 'react'
import { useBreakpoint } from '../utils/useBreakpoint'
import { PfNavDrawer } from './PfNavDrawer'
import { PfNavBar } from './PfNavBar'
import type { PfNavItem } from './PfNavDrawer'

interface PfAppScaffoldProps {
  children: React.ReactNode
  navItems: PfNavItem[]
  onNavigate: (path: string) => void
  activeItemId: string
  appName?: string
  logo?: React.ReactNode
}

export function PfAppScaffold({
  children,
  navItems,
  onNavigate,
  activeItemId,
  appName,
  logo,
}: PfAppScaffoldProps) {
  const bp = useBreakpoint()

  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    height: '100dvh',
  }

  const mainStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
    paddingBottom: bp === 'mobile' ? '64px' : undefined,
  }

  return (
    <div style={wrapperStyle} data-testid="app-scaffold">
      {bp === 'desktop' && (
        <PfNavDrawer
          items={navItems}
          onNavigate={onNavigate}
          activeItemId={activeItemId}
          appName={appName}
          logo={logo}
          collapsed={false}
        />
      )}
      {bp === 'tablet' && (
        <PfNavDrawer
          items={navItems}
          onNavigate={onNavigate}
          activeItemId={activeItemId}
          appName={appName}
          logo={logo}
          collapsed={true}
        />
      )}
      <main style={mainStyle} data-testid="app-main">
        {children}
      </main>
      {bp === 'mobile' && (
        <PfNavBar
          items={navItems}
          onNavigate={onNavigate}
          activeItemId={activeItemId}
        />
      )}
    </div>
  )
}
