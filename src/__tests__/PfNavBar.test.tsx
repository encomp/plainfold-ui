import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PfNavBar } from '../components/PfNavBar'
import type { PfNavItem } from '../components/PfNavDrawer'

const items: PfNavItem[] = [
  { id: 'home', label: 'Home', icon: <span>H</span>, path: '/' },
  { id: 'search', label: 'Search', icon: <span>S</span>, path: '/search' },
  { id: 'profile', label: 'Profile', icon: <span>P</span>, path: '/profile' },
]

describe('PfNavBar', () => {
  it('renders tab items', () => {
    render(
      <PfNavBar items={items} onNavigate={() => {}} activeItemId="home" />
    )
    expect(screen.getByTestId('nav-home')).toBeInTheDocument()
    expect(screen.getByTestId('nav-search')).toBeInTheDocument()
    expect(screen.getByTestId('nav-profile')).toBeInTheDocument()
  })

  it('highlights the active item', () => {
    render(
      <PfNavBar items={items} onNavigate={() => {}} activeItemId="search" />
    )
    const activeItem = screen.getByTestId('nav-search')
    expect(activeItem.style.fontWeight).toBe('600')
  })

  it('calls onNavigate when a tab is clicked', () => {
    const handleNavigate = vi.fn()
    render(
      <PfNavBar items={items} onNavigate={handleNavigate} activeItemId="home" />
    )
    fireEvent.click(screen.getByTestId('nav-profile'))
    expect(handleNavigate).toHaveBeenCalledWith('/profile')
  })

  it('shows More button when items exceed maxVisible', () => {
    const manyItems: PfNavItem[] = [
      { id: 'a', label: 'A', icon: <span>A</span>, path: '/a' },
      { id: 'b', label: 'B', icon: <span>B</span>, path: '/b' },
      { id: 'c', label: 'C', icon: <span>C</span>, path: '/c' },
      { id: 'd', label: 'D', icon: <span>D</span>, path: '/d' },
      { id: 'e', label: 'E', icon: <span>E</span>, path: '/e' },
    ]
    render(
      <PfNavBar items={manyItems} onNavigate={() => {}} activeItemId="a" maxVisible={4} />
    )
    expect(screen.getByTestId('nav-more')).toBeInTheDocument()
    expect(screen.getByText('More')).toBeInTheDocument()
  })

  it('does not show More button when items fit within maxVisible', () => {
    render(
      <PfNavBar items={items} onNavigate={() => {}} activeItemId="home" maxVisible={4} />
    )
    expect(screen.queryByTestId('nav-more')).not.toBeInTheDocument()
  })

  it('switching the active item logs no mixed-border style warning', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { rerender } = render(<PfNavBar items={items} onNavigate={() => {}} activeItemId="home" />)
    rerender(<PfNavBar items={items} onNavigate={() => {}} activeItemId="settings" />)
    expect(err.mock.calls.flat().join(' ')).not.toMatch(/conflicting property/)
    err.mockRestore()
  })
})
