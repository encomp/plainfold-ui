import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PfNavDrawer } from '../components/PfNavDrawer'
import type { PfNavItem } from '../components/PfNavDrawer'

const items: PfNavItem[] = [
  { id: 'home', label: 'Home', icon: <span>H</span>, path: '/' },
  { id: 'settings', label: 'Settings', icon: <span>S</span>, path: '/settings' },
  { id: 'profile', label: 'Profile', icon: <span>P</span>, path: '/profile' },
]

describe('PfNavDrawer', () => {
  it('renders all nav items', () => {
    render(
      <PfNavDrawer items={items} onNavigate={() => {}} activeItemId="home" />
    )
    expect(screen.getByTestId('nav-home')).toBeInTheDocument()
    expect(screen.getByTestId('nav-settings')).toBeInTheDocument()
    expect(screen.getByTestId('nav-profile')).toBeInTheDocument()
  })

  it('shows labels in full mode', () => {
    render(
      <PfNavDrawer items={items} onNavigate={() => {}} activeItemId="home" collapsed={false} />
    )
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
  })

  it('hides labels in collapsed mode', () => {
    render(
      <PfNavDrawer items={items} onNavigate={() => {}} activeItemId="home" collapsed={true} />
    )
    // Labels should not be rendered as visible text nodes in collapsed mode
    expect(screen.queryByText('Home')).not.toBeInTheDocument()
    expect(screen.queryByText('Settings')).not.toBeInTheDocument()
    // But the buttons should have title attributes
    expect(screen.getByTestId('nav-home')).toHaveAttribute('title', 'Home')
    expect(screen.getByTestId('nav-settings')).toHaveAttribute('title', 'Settings')
  })

  it('highlights the active item', () => {
    render(
      <PfNavDrawer items={items} onNavigate={() => {}} activeItemId="settings" />
    )
    const activeItem = screen.getByTestId('nav-settings')
    expect(activeItem.style.fontWeight).toBe('600')
  })

  it('calls onNavigate when an item is clicked', () => {
    const handleNavigate = vi.fn()
    render(
      <PfNavDrawer items={items} onNavigate={handleNavigate} activeItemId="home" />
    )
    fireEvent.click(screen.getByTestId('nav-settings'))
    expect(handleNavigate).toHaveBeenCalledWith('/settings')
  })

  it('renders app name and logo when provided', () => {
    render(
      <PfNavDrawer
        items={items}
        onNavigate={() => {}}
        activeItemId="home"
        appName="My App"
        logo={<span data-testid="logo">L</span>}
      />
    )
    expect(screen.getByText('My App')).toBeInTheDocument()
    expect(screen.getByTestId('logo')).toBeInTheDocument()
  })

  it('hides app name in collapsed mode', () => {
    render(
      <PfNavDrawer
        items={items}
        onNavigate={() => {}}
        activeItemId="home"
        appName="My App"
        collapsed={true}
      />
    )
    expect(screen.queryByText('My App')).not.toBeInTheDocument()
  })
})
