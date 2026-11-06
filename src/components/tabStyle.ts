import type { CSSProperties } from 'react'
import { pfText } from '../tokens/type'

// Internal: the one tab look, shared by PfTabs and PfTabStrip. Not exported from the package.
export type TabLevel = 'page' | 'sub'

export const tabFocusCss = `.pf-tab:focus-visible{outline:2px solid var(--pf-accent-text, var(--pf-accent));outline-offset:-2px}`

export function tabListStyle(level: TabLevel = 'page'): CSSProperties {
  return {
    display: 'flex',
    gap: '4px',
    flexWrap: 'nowrap',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    borderBottom: level === 'sub' ? '1px solid var(--pf-border-subtle, var(--pf-border))' : '1px solid var(--pf-border)',
    fontFamily: 'var(--pf-font-ui)',
  }
}

export function tabStyle({ active, level = 'page' }: { active: boolean; level?: TabLevel }): CSSProperties {
  const sub = level === 'sub'
  return {
    padding: sub ? '5px 10px' : '8px 12px',
    fontSize: sub ? pfText.meta : pfText.body,
    fontWeight: 500,
    textDecoration: 'none',
    color: active ? 'var(--pf-text-primary)' : 'var(--pf-text-secondary)',
    borderBottom: active ? '2px solid var(--pf-accent-text, var(--pf-accent))' : '2px solid transparent',
    marginBottom: '-1px',
  }
}
