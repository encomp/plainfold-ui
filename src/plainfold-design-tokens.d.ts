declare module '@plainfold/design-tokens' {
  export interface PfTheme {
    id: string
    name: string
    description: string
    version: string
    tokens: Record<string, string>
    icons?: Record<string, string>
  }
  export function applyTheme(theme: PfTheme): void
  export function resetTheme(theme: PfTheme): void
  export function sanitizeSvgIcon(raw: string): string
  export const BUNDLED_THEMES: PfTheme[]
  export const BUNDLED_THEME_IDS: Set<string>
}
