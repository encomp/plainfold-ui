import { useRef, type KeyboardEvent } from 'react'
import { tabFocusCss, tabListStyle, tabStyle, type TabLevel } from './tabStyle'

export interface PfTabStripItem {
  id: string
  label: string
  'data-testid'?: string
}

export interface PfTabStripProps {
  items: PfTabStripItem[]
  value: string
  onChange(id: string): void
  'aria-label': string
  /** 'page' matches PfTabs (default); 'sub' is smaller so it does not read as the page tabs above it */
  level?: TabLevel
  'data-testid'?: string
}

export function PfTabStrip({ items, value, onChange, 'aria-label': ariaLabel, level = 'page', 'data-testid': testId }: PfTabStripProps) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({})
  function onKey(e: KeyboardEvent, i: number) {
    const n = items.length
    const to = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n
      : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1
    if (to < 0) return
    e.preventDefault()
    onChange(items[to].id)
    refs.current[items[to].id]?.focus()
  }
  return (
    <div role="tablist" aria-label={ariaLabel} data-testid={testId} style={tabListStyle(level)}>
      <style>{tabFocusCss}</style>
      {items.map((item, i) => {
        const active = item.id === value
        return (
          <button
            key={item.id}
            ref={(el) => { refs.current[item.id] = el }}
            role="tab"
            type="button"
            className="pf-tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            data-testid={item['data-testid']}
            onClick={() => onChange(item.id)}
            onKeyDown={(e) => onKey(e, i)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              ...tabStyle({ active, level }),
            }}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
