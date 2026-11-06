import { tabFocusCss, tabListStyle, tabStyle } from './tabStyle'
import { handleNavClick } from '../utils/handleNavClick'

export interface PfTabItem {
  id: string
  label: string
  href: string
  'data-testid'?: string
}

export interface PfTabsProps {
  items: PfTabItem[]
  current: string
  'aria-label': string
  onNavigate?: (href: string) => void
}

export function PfTabs({ items, current, 'aria-label': ariaLabel, onNavigate }: PfTabsProps) {
  return (
    <nav
      aria-label={ariaLabel}
      style={tabListStyle()}
    >
      <style>{tabFocusCss}</style>
      {items.map((item) => {
        const active = item.id === current
        return (
          <a
            key={item.id}
            href={item.href}
            className="pf-tab"
            aria-current={active ? 'page' : undefined}
            data-testid={item['data-testid']}
            onClick={(e) => handleNavClick(e, item.href, onNavigate)}
            style={tabStyle({ active })}
          >
            {item.label}
          </a>
        )
      })}
    </nav>
  )
}
