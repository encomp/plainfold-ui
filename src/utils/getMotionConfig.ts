export interface MotionConfig {
  duration: number
  ease: number[]
}

export function getMotionConfig(): MotionConfig {
  if (typeof window === 'undefined') {
    return { duration: 0, ease: [0, 0, 1, 1] }
  }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) {
    return { duration: 0, ease: [0, 0, 1, 1] }
  }

  const style = getComputedStyle(document.documentElement)
  const intensity = parseFloat(style.getPropertyValue('--pf-motion-intensity').trim()) || 1
  const baseDuration = parseFloat(style.getPropertyValue('--pf-duration-normal').trim()) || 300

  return {
    duration: (baseDuration / 1000) * intensity,
    ease: [0.4, 0, 0.2, 1],
  }
}
