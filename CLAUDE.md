# @plainfold/ui

Material Design 3 component library for the Plainfold ecosystem. 23 components covering core, feedback, overlay, form, navigation, data display, and utility categories.

## Architecture

Position in dependency graph: **presentation layer**. Depends on @plainfold/design-tokens for CSS custom properties. All other Plainfold packages that need UI (preferences, backup, onboarding) depend on this.

Styling: inline `React.CSSProperties` objects using `--pf-*` CSS custom properties. NO Tailwind, NO CSS modules, NO CVA. Hover/focus states managed via `useState`.

Navigation: router-agnostic via `onNavigate(path)` callback + `activeItemId` string. No react-router dependency.

Forms: wraps react-hook-form + zod (both peer dependencies). PfForm provides FormProvider, PfForm* components use Controller.

## Public API

### Core
- **PfButton** — variants: primary, secondary, ghost, danger. Sizes: sm, md, lg. Loading state.
- **PfCard** — surface container with padding sizes and hoverable elevation
- **PfBadge** — status labels: default, success, warning, danger, muted

### Feedback
- **PfLinearProgress** — determinate progress bar with aria attributes
- **PfEmptyState** — centered icon + heading + subtext + optional action
- **PfSnackbar** — toast with auto-hide and optional action. Props: `open`, `onClose`
- **PfTooltip** — Radix Tooltip wrapper

### Overlay
- **PfDialog** — modal dialog. Props: `open`, `onClose` (not onOpenChange)
- **PfConfirmDialog** — confirm/cancel dialog with default/danger variants
- **PfBottomSheet** — mobile bottom sheet

### Form
- **PfForm** — FormProvider wrapper with zodResolver
- **PfFormTextField** — text input connected to react-hook-form
- **PfFormSelect** — Radix Select connected to react-hook-form. Props: `options=[{label, value}]`
- **PfFormSlider** — Radix Slider connected to react-hook-form
- **PfFormSwitch** — Radix Switch connected to react-hook-form

### Navigation
- **PfAppScaffold** — root layout, switches between drawer (desktop/tablet) and bottom nav (mobile)
- **PfNavDrawer** — sidebar nav, full (240px) or collapsed/rail (64px)
- **PfNavBar** — mobile bottom tab bar with "More" overflow
- **PfNavItem** — type: `{ id, label, icon, path }`

### Data Display
- **PfSegmentedButton** — segmented control with aria-pressed
- **PfDataList** — table on desktop, cards on mobile
- **PfStageBar** — stateless stage bar: one segment per step (`done`, `current` with `progress` 0–1, `todo`, `optional`), optional `currentLabel` after the bar; `role="list"` with per-step aria-labels and `aria-current="step"`

### Misc
- **PfErrorBoundary** — class component error boundary with reset
- **ThemeIcon** — renders theme SVG or fallback icon

### Utilities
- **useBreakpoint()** — returns 'mobile' | 'tablet' | 'desktop'
- **cn()** — clsx wrapper
- **getMotionConfig()** — respects prefers-reduced-motion + --pf-motion-intensity

## Key Decisions

- **Radix UI for complex interactions** — Dialog, Select, Slider, Switch, Tooltip. Radix APIs NOT exposed; wrapped with standard React conventions (`open`/`onClose`, `onChange`, `options`)
- **No className prop** on most components — styling is fully controlled via CSS custom properties
- **React >= 19 only**
- **Peer dependencies:** react, react-dom, react-hook-form, @hookform/resolvers, zod, lucide-react

## Development

```bash
npm install
npm test           # Vitest with jsdom
npm run build      # ESM + CJS via Vite library mode
npm run lint       # ESLint
npm run typecheck  # TypeScript
```

## Testing

Uses jsdom with `@testing-library/react`. test-setup.ts provides `window.matchMedia` and `ResizeObserver` polyfills.

## CI/CD

PR: lint → typecheck → test → build. Publishing via Changesets.
