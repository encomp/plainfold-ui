export const PF_PAGE_SIZES = [15, 25, 50, 75, 100] as const

/** Splits rows into pages of about `size`; with `groupId`, a page only ends where the group changes, so it may run over. */
export function pageRows<T>(rows: T[], size: number, groupId?: (r: T) => string): T[][] {
  const pages: T[][] = []
  for (const r of rows) {
    const cur = pages[pages.length - 1]
    const prev = cur?.[cur.length - 1]
    const full = !cur || cur.length >= size
    if (full && (!groupId || prev === undefined || groupId(prev) !== groupId(r))) pages.push([r])
    else cur.push(r)
  }
  return pages
}
