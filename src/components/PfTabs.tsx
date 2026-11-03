import { pfText } from '../tokens/type'
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

const css = `.pf-tab:focus-visible{outline:2px solid var(--pf-accent-text, var(--pf-accent));outline-offset:-2px}`

export function PfTabs({ items, current, 'aria-label': ariaLabel, onNavigate }: PfTabsProps) {
  return (
    <nav
      aria-label={ariaLabel}
      style={{
        display: 'flex',
        gap: '4px',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        borderBottom: '1px solid var(--pf-border)',
        fontFamily: 'var(--pf-font-ui)',
      }}
    >
      <style>{css}</style>
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
            style={{
              padding: '8px 12px',
              fontSize: pfText.body,
              fontWeight: 500,
              textDecoration: 'none',
              color: active ? 'var(--pf-text-primary)' : 'var(--pf-text-muted)',
              borderBottom: active ? '2px solid var(--pf-accent-text, var(--pf-accent))' : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            {item.label}
          </a>
        )
      })}
    </nav>
  )
}
