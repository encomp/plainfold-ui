import { useLayoutEffect, useRef, useState } from 'react'

const SHOW_DELAY_MS = 250
const MIN_VISIBLE_MS = 300

/**
 * True while skeleton bones should show. `hasData` means content was already on screen when the
 * load started: such a load never shows bones. Bones that did show outlive the load by the minimum.
 */
export function useSkeletonGate(loading: boolean, hasData: boolean): boolean {
  const [shown, setShown] = useState(false)
  const shownAt = useRef(0)

  // A layout effect: its cleanup runs in the commit itself, so a show timer can never fire after
  // `loading` ended and cover rendered content (passive cleanup can be deferred past the timer).
  // Only a change of `loading` starts or ends a load; `hasData` is read as it was at that moment.
  useLayoutEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (loading && !hasData) {
      timer = setTimeout(() => {
        shownAt.current = Date.now()
        setShown(true)
      }, SHOW_DELAY_MS)
    } else {
      timer = setTimeout(
        () => setShown(false),
        Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt.current)),
      )
    }
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  return shown
}
