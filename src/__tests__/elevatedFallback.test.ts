import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

describe('--pf-bg-elevated', () => {
  it('is never used without a fallback (no bundled theme defines it)', () => {
    const src = join(__dirname, '..');
    const offenders = walk(src)
      .filter((f) => /\.(tsx?|css)$/.test(f) && !f.includes('__tests__'))
      .filter((f) =>
        /var\(--pf-bg-elevated\s*\)/.test(readFileSync(f, 'utf8')),
      );
    expect(offenders).toEqual([]);
  });
});
