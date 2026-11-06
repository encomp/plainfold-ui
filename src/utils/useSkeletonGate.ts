import { useEffect, useRef, useState } from 'react'

const SHOW_DELAY_MS = 250
const MIN_VISIBLE_MS = 300

/** True while skeleton bones should show: only on a first load with nothing on screen. */
export function useSkeletonGate(loading: boolean, hasData: boolean): boolean {
  const [shown, setShown] = useState(false)
  const shownAt = useRef(0)
  const active = loading && !hasData

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    // Rows on screen end the skeleton at once, so a later empty state never inherits a stale `shown`.
    if (hasData) setShown(false)
    if (active) {
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
  }, [active, hasData])

  return shown && !hasData
}
