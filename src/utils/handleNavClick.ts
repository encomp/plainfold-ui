import type React from 'react'

/** Plain left click → onNavigate(href); modified or non-left clicks fall through to the browser. */
export function handleNavClick(
  e: React.MouseEvent<HTMLAnchorElement>,
  href: string,
  onNavigate?: (href: string) => void,
) {
  if (!onNavigate || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  e.preventDefault()
  onNavigate(href)
}
