import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const sources = walk(join(__dirname, '..'))
  .filter((f) => /\.(tsx?|css)$/.test(f) && !f.includes('__tests__'))
  .map((f) => ({ f, text: readFileSync(f, 'utf8') }));

const ACCENT_TEXT = 'var(--pf-accent-text, var(--pf-accent))';

describe('--pf-accent-text', () => {
  it('is only ever written with the --pf-accent fallback', () => {
    const offenders = sources
      .filter(({ text }) =>
        text.replaceAll(ACCENT_TEXT, '').includes('--pf-accent-text'),
      )
      .map(({ f }) => f);
    expect(offenders).toEqual([]);
  });

  // Properties where the accent is text or a thin foreground. Fills
  // (background, progress bars) are deliberately not listed.
  const foregroundProps: Record<string, { re: RegExp; bare: string }> = {
    color: { re: /(?<![-\w])color\s*:/, bare: "color: 'var(--pf-accent)'" },
    outline: { re: /(?<![-\w])outline\s*:/, bare: "outline: '2px solid var(--pf-accent)'" },
    outlineCss: { re: /(?<![-\w])outline\s*:/, bare: 'outline: 2px solid var(--pf-accent);' },
    accentColor: { re: /(?<![-\w])(accentColor|accent-color)\s*:/, bare: "accentColor: 'var(--pf-accent)'" },
    border: { re: /(?<![-\w])border[\w-]*\s*:/, bare: "borderLeft: '2px solid var(--pf-accent)'" },
    borderColor: { re: /(?<![-\w])border[\w-]*\s*:/, bare: "borderLeftColor: 'var(--pf-accent)'" },
    caretColor: { re: /(?<![-\w])(caretColor|caret-color)\s*:/, bare: "caretColor: 'var(--pf-accent)'" },
    fill: { re: /(?<![-\w])fill\s*:/, bare: "fill: 'var(--pf-accent)'" },
    stroke: { re: /(?<![-\w])stroke\s*:/, bare: "stroke: 'var(--pf-accent)'" },
    boxShadow: { re: /(?<![-\w])(boxShadow|box-shadow)\s*:/, bare: "boxShadow: 'inset 0 0 0 1px var(--pf-accent)'" },
  };
  const bareAccentIn = (text: string) =>
    Object.values(foregroundProps).some(({ re }) => {
      const body = text.replaceAll(ACCENT_TEXT, '');
      const m = new RegExp(
        re.source + '(?:(?!background|;|\\})[^;}]){0,120}?var\\(--pf-accent\\)',
      );
      return m.test(body);
    });

  it('guard patterns catch a bare sample and pass a fallback sample', () => {
    for (const [name, { bare }] of Object.entries(foregroundProps)) {
      expect(bareAccentIn(bare), name).toBe(true);
      expect(bareAccentIn(bare.replace('var(--pf-accent)', ACCENT_TEXT)), name).toBe(false);
    }
    expect(bareAccentIn("background: 'var(--pf-accent)'")).toBe(false);
  });

  it('never uses a bare --pf-accent as text, border, indicator, ring or checked-state colour', () => {
    const offenders = sources
      .filter(({ text }) => bareAccentIn(text))
      .map(({ f }) => f);
    expect(offenders).toEqual([]);
  });
});

describe('--pf-on-accent', () => {
  it('is only ever written with a fallback', () => {
    const offenders = sources
      .filter(({ text }) => /var\(--pf-on-accent\s*\)/.test(text))
      .map(({ f }) => f);
    expect(offenders).toEqual([]);
  });

  it('is used for text placed on an accent fill', () => {
    for (const name of ['PfButton.tsx', 'PfSegmentedButton.tsx']) {
      const { text } = sources.find(({ f }) => f.endsWith(name))!;
      expect(text).toContain('var(--pf-on-accent, var(--pf-bg-base))');
      expect(text).not.toMatch(/color:[^,\n]*'var\(--pf-bg-base\)'/);
    }
  });
});
