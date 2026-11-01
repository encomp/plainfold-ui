# @plainfold/ui

Material Design 3 component library for the Plainfold ecosystem. 27 components covering core, feedback, overlay, form, navigation, data display, and utility categories.

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
- **PfTooltip** — Radix Tooltip wrapper; optional controlled `open` / `onOpenChange`

### Overlay
- **PfDialog** — modal dialog. Props: `open`, `onClose` (not onOpenChange)
- **PfConfirmDialog** — confirm/cancel dialog with default/danger variants
- **PfBottomSheet** — mobile bottom sheet

### Form
- **PfForm** — FormProvider wrapper with zodResolver
- **PfFormTextField** — text input connected to react-hook-form
- **PfFormSelect** — Radix Select connected to react-hook-form. Props: `options=[{label, value}]`
- **PfFormSlider** — Radix Slider connected to react-hook-form
- **PfRadio** — native radio input in a label with optional `description`; `onChange(value)`, accent colour, focus-visible ring
- **PfFormSwitch** — Radix Switch connected to react-hook-form

### Navigation
- **PfAppScaffold** — root layout, switches between drawer (desktop/tablet) and bottom nav (mobile)
- **PfNavDrawer** — sidebar nav, full (240px) or collapsed/rail (64px); optional item `group` labels and `navFooter` slot
- **PfNavBar** — mobile bottom tab bar with "More" overflow
- **PfNavItem** — type: `{ id, label, icon, path }`

### Data Display
- **PfSegmentedButton** — segmented control with aria-pressed
- **PfDataList** — table on desktop, cards on mobile
- **PfStageBar** — stateless stage bar: one segment per step (`done`, `current` with `progress` 0–1, `todo`, `optional`), optional `currentLabel` after the bar; `role="list"` with per-step aria-labels and `aria-current="step"`
- **PfStepCards** — stateless step cards in a responsive grid: per step `title`, `state` (`done`, `current`, `todo`, `skipped`), optional `tag`, `count`, `cost`, `note` and an `action` slot; `currentId` picks the highlighted card (`aria-current="step"`); `role="list"` with `"<title>, <state>"` aria-labels
- **PfCompareTable** — stateless comparison table, generic over the column type: `columns`, `getColumnId`, `renderColumnHeader`, `rows` (`id`, `label`, optional `group` heading per run, `get`, optional `value`, `best` `max`/`min`, `tone`). Real `<table>` in an `overflow-x: auto` container, sticky first column; best cells bold positive with hidden "best", `bad` cells negative with hidden "fails" (never colour alone). `onlyDifferences` (controlled) hides rows equal across columns; `emptyState` for no columns or when `onlyDifferences` hides every row; NaN counts as null; optional `aria-label` names the scroll region (then a focusable `role="region"`; without it the container is neither focusable nor a landmark) and is not repeated on the table; `ok`/`warning` tones also carry a hidden word per cell
- **PfModelPicker** — controlled provider + model pair of native selects in a `role="group"` (`label`, default "Model"); changing the provider emits its first model; `disabled` providers show `disabledNote`; model `note` (e.g. a price) follows the label
- **PfChatPanel** — controlled chat column: `mode` `hidden` (renders nothing) / `docked` (resizable, `width` 280–720 via `role="separator"`, pointer or ←/→) / `expanded` (shows `summary`); docked is full-screen on phones. Messages in a `role="log"` (meta, sources, pending, error, `renderMessageActions`), composer (Enter sends, Shift+Enter newline), `⋯` menu from `menuItems`, slots `header`/`context`/`footer`/`emptyState`. Escape stays inside the panel. Optional per-message `steps` (`{id,label,state: running|done|error}`: live `role="status"` list while pending, folded into a closed "<n> steps" details when done, an error step stays visible), `sourcesLabel` (default "Sources"), `question` (`{text, choices?, onChoose?}`: one button per choice, disabled after the first pick) and `stopped` (`{message, onContinue}`: message plus a Continue button, `data-testid="chat-panel-continue"`). Optional `costMeter` (`{spentUsd, ceilingUsd, label?}`: `role="meter"` above the messages, "$0.07 of $0.25", warning colour from 80%, danger at 100%, bar and `aria-valuenow` clamp at the ceiling). Optional `slashItems` (`{id,name,description,whoLabel}[]`) + `onSlashSelect`: a draft matching `^/\S*$` opens a listbox above the composer of items whose name starts with the typed text; ↑/↓ move, Enter or click sets the draft to `/name ` and calls `onSlashSelect`, Escape closes; without `slashItems` (or with none matching) `/` is plain text. Plain-text answers; no markdown

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
npm run build      # ESM + CJS via Vite library mode, plus .d.ts via tsc
npm run lint       # ESLint
npm run typecheck  # TypeScript
```

## Testing

Uses jsdom with `@testing-library/react`. test-setup.ts provides `window.matchMedia` and `ResizeObserver` polyfills.

## CI/CD

PR: lint → typecheck → test → build. Publishing via Changesets.
