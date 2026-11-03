import { describe, it, expect } from 'vitest'
import { BUNDLED_THEMES } from '@plainfold/design-tokens'

type Tokens = Record<string, string>

// Resolve `var(--x, fallback)` (fallback may itself be a var()) or a plain colour against a theme.
function resolve(value: string, tokens: Tokens): string {
  const m = /^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/.exec(value.trim())
  if (!m) return value.trim()
  const own = tokens[m[1]]
  if (own) return resolve(own, tokens)
  if (m[2]) return resolve(m[2], tokens)
  throw new Error(`unresolved ${m[1]}`)
}

function channels(color: string): [number, number, number] {
  let h = color.replace('#', '')
  if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(h)) throw new Error(`not a hex colour: ${color}`)
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number]
}

function luminance(color: string): number {
  const [r, g, b] = channels(color).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(hexA: string, hexB: string): number {
  const [hi, lo] = [luminance(hexA), luminance(hexB)].sort((a, b) => b - a)
  return (hi + 0.05) / (lo + 0.05)
}

const PAIRS = [
  { name: 'action link on surface', fg: 'var(--pf-accent-text, var(--pf-accent))', bg: 'var(--pf-bg-surface)' },
  { name: 'action link on base', fg: 'var(--pf-accent-text, var(--pf-accent))', bg: 'var(--pf-bg-base)' },
  { name: 'disabled button text', fg: 'var(--pf-text-muted)', bg: 'var(--pf-bg-surface-alt)' },
  { name: 'checked toggle text', fg: 'var(--pf-on-accent, var(--pf-bg-base))', bg: 'var(--pf-accent)' },
] as const

// Known failures in the bundled themes (public theme contrast is tracker item t-pf-contrast).
// Themes are not edited here; any failure not listed fails the test, and a listed pair that now passes fails too.
const KNOWN_FAILURES: Record<string, string[]> = {
  midnight: ['disabled button text'],
  focus: ['disabled button text'],
  linen: ['disabled button text'],
}

describe('kit contrast on bundled themes', () => {
  it('has bundled themes', () => {
    expect(BUNDLED_THEMES.length).toBeGreaterThan(0)
  })

  for (const theme of BUNDLED_THEMES) {
    for (const pair of PAIRS) {
      const known = KNOWN_FAILURES[theme.id]?.includes(pair.name) ?? false
      it(`${theme.id}: ${pair.name} ${known ? 'is a known failure (< 4.5)' : '>= 4.5'}`, () => {
        const ratio = contrastRatio(resolve(pair.fg, theme.tokens), resolve(pair.bg, theme.tokens))
        if (known) expect(ratio, 'listed as failing but now passes: remove from KNOWN_FAILURES').toBeLessThan(4.5)
        else expect(ratio, `${theme.id} / ${pair.name}`).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})
