import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useBreakpoint } from '../utils/useBreakpoint'
import { PfAppScaffold } from '../components/PfAppScaffold'
import type { PfNavItem } from '../components/PfNavDrawer'

vi.mock('../utils/useBreakpoint', () => ({
  useBreakpoint: vi.fn(() => 'desktop'),
  BREAKPOINTS: { mobile: 0, tablet: 768, desktop: 1024 },
}))

const navItems: PfNavItem[] = [
  { id: 'home', label: 'Home', icon: <span>H</span>, path: '/' },
  { id: 'settings', label: 'Settings', icon: <span>S</span>, path: '/settings' },
]

describe('PfAppScaffold', () => {
  it('renders children', () => {
    render(
      <PfAppScaffold navItems={navItems} onNavigate={() => {}} activeItemId="home">
        <div data-testid="content">Page Content</div>
      </PfAppScaffold>
    )
    expect(screen.getByTestId('content')).toBeInTheDocument()
    expect(screen.getByText('Page Content')).toBeInTheDocument()
  })

  it('renders nav items', () => {
    render(
      <PfAppScaffold navItems={navItems} onNavigate={() => {}} activeItemId="home">
        <div>Content</div>
      </PfAppScaffold>
    )
    expect(screen.getByTestId('nav-home')).toBeInTheDocument()
    expect(screen.getByTestId('nav-settings')).toBeInTheDocument()
  })

  it('renders PfNavDrawer on desktop', () => {
    vi.mocked(useBreakpoint).mockReturnValue('desktop')
    render(
      <PfAppScaffold navItems={navItems} onNavigate={() => {}} activeItemId="home">
        <div>Content</div>
      </PfAppScaffold>
    )
    expect(screen.getByTestId('nav-drawer')).toBeInTheDocument()
    expect(screen.queryByTestId('nav-bar')).not.toBeInTheDocument()
  })

  it('renders PfNavDrawer in collapsed mode on tablet', () => {
    vi.mocked(useBreakpoint).mockReturnValue('tablet')
    render(
      <PfAppScaffold navItems={navItems} onNavigate={() => {}} activeItemId="home">
        <div>Content</div>
      </PfAppScaffold>
    )
    expect(screen.getByTestId('nav-drawer')).toBeInTheDocument()
    // In collapsed mode, labels are hidden
    expect(screen.queryByText('Home')).not.toBeInTheDocument()
  })

  it('renders PfNavBar on mobile', () => {
    vi.mocked(useBreakpoint).mockReturnValue('mobile')
    render(
      <PfAppScaffold navItems={navItems} onNavigate={() => {}} activeItemId="home">
        <div>Content</div>
      </PfAppScaffold>
    )
    expect(screen.getByTestId('nav-bar')).toBeInTheDocument()
    expect(screen.queryByTestId('nav-drawer')).not.toBeInTheDocument()
  })

  it('passes appName and logo to PfNavDrawer', () => {
    vi.mocked(useBreakpoint).mockReturnValue('desktop')
    render(
      <PfAppScaffold
        navItems={navItems}
        onNavigate={() => {}}
        activeItemId="home"
        appName="TestApp"
        logo={<span data-testid="app-logo">L</span>}
      >
        <div>Content</div>
      </PfAppScaffold>
    )
    expect(screen.getByText('TestApp')).toBeInTheDocument()
    expect(screen.getByTestId('app-logo')).toBeInTheDocument()
  })
})
