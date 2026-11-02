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

  it('is used wherever the accent is a text color (never bare --pf-accent in a color: property)', () => {
    const textColor =
      /(?<![-\w])color\s*:(?:(?!background|border|outline|boxShadow)[^;}]){0,120}?var\(--pf-accent\)/;
    const offenders = sources
      .filter(({ text }) => textColor.test(text.replaceAll(ACCENT_TEXT, '')))
      .map(({ f }) => f);
    expect(offenders).toEqual([]);
  });

  it('is used for focus outlines', () => {
    const offenders = sources
      .filter(({ text }) =>
        /outline\s*:[^;}`'"]*(?:solid\s+)var\(--pf-accent\)/.test(
          text.replaceAll(ACCENT_TEXT, ''),
        ),
      )
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
