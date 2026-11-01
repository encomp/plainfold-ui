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

  describe('groups and footer', () => {
    const grouped: PfNavItem[] = [
      { id: 'home', label: 'Home', icon: <span>H</span>, path: '/' },
      { id: 'a1', label: 'Leads', icon: <span>L</span>, path: '/a1', group: 'Agency' },
      { id: 'a2', label: 'Clients', icon: <span>C</span>, path: '/a2', group: 'Agency' },
      { id: 'r1', label: 'Sites', icon: <span>S</span>, path: '/r1', group: 'Rank & Rent' },
    ]

    it('renders each group label once, in order', () => {
      const { container } = render(
        <PfNavDrawer items={grouped} onNavigate={() => {}} activeItemId="home" />
      )
      expect(screen.getAllByText('Agency')).toHaveLength(1)
      expect(screen.getAllByText('Rank & Rent')).toHaveLength(1)
      const order = Array.from(
        container.querySelectorAll('[data-testid^="nav-"]')
      ).map((e) => e.getAttribute('data-testid'))
      expect(order).toEqual([
        'nav-drawer', 'nav-home', 'nav-group-agency', 'nav-a1', 'nav-a2',
        'nav-group-rank-rent', 'nav-r1',
      ])
      expect(screen.getByTestId('nav-group-agency')).toHaveAttribute('role', 'presentation')
    })

    it('renders no label without groups', () => {
      render(<PfNavDrawer items={items} onNavigate={() => {}} activeItemId="home" />)
      expect(document.querySelector('[data-testid^="nav-group-"]')).toBeNull()
    })

    it('hides label text when collapsed', () => {
      render(<PfNavDrawer items={grouped} onNavigate={() => {}} activeItemId="home" collapsed />)
      expect(screen.queryByText('Agency')).toBeNull()
      expect(screen.queryByText('Rank & Rent')).toBeNull()
    })

    it('renders footer only when expanded', () => {
      const { rerender } = render(
        <PfNavDrawer items={items} onNavigate={() => {}} activeItemId="home" navFooter={<div>Foot</div>} />
      )
      expect(screen.getByText('Foot')).toBeInTheDocument()
      rerender(
        <PfNavDrawer items={items} onNavigate={() => {}} activeItemId="home" navFooter={<div>Foot</div>} collapsed />
      )
      expect(screen.queryByText('Foot')).toBeNull()
    })
  })
})
