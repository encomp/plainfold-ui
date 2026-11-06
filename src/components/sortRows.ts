import type { PfColumn } from './PfDataTable'

type Scalar = string | number | Date | null

function scalar(v: Scalar | undefined): string | number | null {
  if (v === null || v === undefined) return null
  if (v instanceof Date) {
    const t = v.getTime()
    return Number.isNaN(t) ? null : t
  }
  if (typeof v === 'number' && Number.isNaN(v)) return null
  return v
}

function compare(a: string | number, b: string | number): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  // shortcut: plain localeCompare, no numeric collation ("a10" < "a2"), upgrade if a text column holds numbered names
  return String(a).localeCompare(String(b))
}

/** The table's own client sort (nulls last, stable), exported so a caller can sort a full list the same way. */
export function sortRows<T>(rows: T[], col: Pick<PfColumn<T>, 'sortValue'> | undefined, dir: 'asc' | 'desc'): T[] {
  if (!col?.sortValue) return rows
  const get = col.sortValue
  const keyed = rows.map((row, i) => ({ row, i, v: scalar(get(row)) }))
  const sign = dir === 'asc' ? 1 : -1
  keyed.sort((x, y) => {
    if (x.v === null && y.v === null) return x.i - y.i
    if (x.v === null) return 1 // nulls last in both directions
    if (y.v === null) return -1
    return sign * compare(x.v, y.v) || x.i - y.i
  })
  return keyed.map((k) => k.row)
}
