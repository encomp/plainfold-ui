import { fireEvent, screen } from '@testing-library/react'

/** jsdom has no PointerEvent, so Radix Select is driven with the keys it also answers to. */
export function openSelect(trigger: HTMLElement) {
  trigger.focus()
  fireEvent.keyDown(trigger, { key: 'Enter' })
}

export function pickOption(name: string | RegExp) {
  fireEvent.keyDown(screen.getByRole('option', { name }), { key: 'Enter' })
}
