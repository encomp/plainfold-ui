# @plainfold/ui

Material Design 3 component library for the Plainfold ecosystem. Components covering core, feedback, overlay, form, navigation, data display, and utility categories.

## Architecture

Position in dependency graph: **presentation layer**. Depends on @plainfold/design-tokens for CSS custom properties. All other Plainfold packages that need UI (preferences, backup, onboarding) depend on this.

Styling: inline `React.CSSProperties` objects using `--pf-*` CSS custom properties. NO Tailwind, NO CSS modules, NO CVA. Hover/focus states managed via `useState`.

Navigation: router-agnostic via `onNavigate(path)` callback + `activeItemId` string. No react-router dependency.

Forms: wraps react-hook-form + zod (both peer dependencies). PfForm provides FormProvider, PfForm* components use Controller.

## Public API

### Core
- **pfText** — the six text sizes as CSS values with px fallbacks (`page` 24, `section` 17, `card` 15, `body` 14, `meta` 13, `label` 12); new and changed components use these; older components still carry some literal font sizes and are being migrated
- **PfButton** — variants: primary, secondary, quiet, ghost, danger. Sizes: sm, md, lg. Loading state (spinner beside the label, `aria-busy`). `disabled` renders grey surface + muted text (never a pale accent); `reason` shows why it is disabled as text beside the button, wrapping below it on narrow screens (linked with `aria-describedby`). Also passes `aria-*` attributes (expanded, controls, haspopup, pressed, current)
- **PfActionLink** — the action link, "Place →": accent text, no underline until hover/focus. `kind="back"` draws "← Parent" in muted text (colour change on hover, no underline); `external` opens a new tab with `rel` and a hidden note
- **PfPageHeader** — page title row with optional back link ("← Parent"), subtitle and actions; wraps on phones
- **PfTabs** — tab list that scrolls sideways when it does not fit
- **PfCard** — surface container with padding sizes and hoverable elevation; optional `accent` (CSS color: 3px top border and title color), `title`, `meta` (right-aligned, also without a title) and `footer`
- **PfBadge** — status labels: default, success, warning, danger, muted; `outline` and `dashed` variations
- **PfStatus** — status text with a `tone` (`ok`, `warn`, `off`, `danger`, `busy`)

### Feedback
- **PfLinearProgress** — determinate progress bar with aria attributes
- **PfEmptyState** — icon + heading + subtext + optional actions; always left-aligned inside a dashed box; subtext is capped at 52ch
- **PfEmptyLine** — one-line empty note for small areas where a full empty state is too large
- **PfSkeleton** / **PfSkeletonRegion** / `useSkeletonGate` — loading placeholder bones (`Line`, `Block`, `Circle`, `CardBody`, `TableRows`, `ChartArea`) on one shared shimmer; the region is a `role="status"` named "Loading <label>" and `aria-busy` while bones are inside; the hook `useSkeletonGate(loading, hasData)` shows bones only on a first empty load (after 250 ms, for at least 300 ms)
- **PfSnackbar** — toast with auto-hide and optional action. Props: `open`, `onClose`
- **PfTooltip** — Radix Tooltip wrapper; optional controlled `open` / `onOpenChange`

### Overlay
- **PfDialog** — modal dialog. Props: `open`, `onClose` (not onOpenChange)
- **PfConfirmDialog** — confirm/cancel dialog with default/danger variants
- **PfBottomSheet** — mobile bottom sheet

### Form
- **PfForm** — FormProvider wrapper with zodResolver
- **PfFormTextField** — text input connected to react-hook-form
- **PfSelect** — select with `options=[{label, value}]`, a required `label` or `aria-label` (the trigger's name), `value` (`''` = no choice), `onChange(value)`, `size`, `placeholder`, `invalid` and `describedBy`
- **PfSearchMultiSelect** — searchable multi-select with per-option counts: `options=[{value, label, count?, disabled?}]`, `values` (pick order), `onChange(values)`, a visible `label` (the combobox's name), `placeholder`, `noResultsText`, `clearAllText`, `countLabel(n)` (screen-reader text for a count), `loading` (`aria-busy` and a "Loading" row), `onSearch(text)` (server search: options are then not filtered locally). WAI-ARIA 1.2 combobox: input `role="combobox"` with `aria-controls`, `aria-activedescendant`, `aria-autocomplete="list"`; list `role="listbox"` with `aria-multiselectable`; options `role="option"` with `aria-selected`; picks are a `role="list"` of chips outside the listbox, each with a "Remove X" button, plus Clear all. The list stays open while picking and focus stays in the input. Keys: ↓/↑ open and move (wrapping), Home/End, Enter toggles, Escape closes and clears the text, Backspace in an empty box removes the last chip, Tab leaves. A polite `role="status"` announces result counts and picks. Picked values missing from `options` still show as chips (value as label). The list is `max-height: 40vh` and scrolls; chips wrap
- **PfFormSelect** — PfSelect connected to react-hook-form. Props: `name`, `options=[{label, value}]`, and a `label` or an `aria-label`
- **PfCheckbox** — checkbox with label, accent colour and focus-visible ring; disabled draws a grey box with a muted tick; also takes `aria-disabled`
- **PfToggleGroup** — multi-select group of toggle buttons (`values[]`, `onChange(values)`, kept in option order); disabled toggles go grey like a disabled button
- **PfFormSlider** — Radix Slider connected to react-hook-form
- **PfRadio** — native radio input in a label with optional `description`; `onChange(value)`, accent colour, focus-visible ring. `card` draws it as a selectable card (native input, tick when checked, grey when disabled); `pfRadioGridStyle` lays cards out in a responsive grid
- **PfFormSwitch** — Radix Switch connected to react-hook-form

### Navigation
- **PfAppScaffold** — root layout, switches between drawer (desktop/tablet) and bottom nav (mobile)
- **PfNavDrawer** — sidebar nav, full (240px) or collapsed/rail (64px); optional item `group` labels and `navFooter` slot
- **PfNavBar** — mobile bottom tab bar with "More" overflow
- **PfNavItem** — type: `{ id, label, icon, path }`

### Data Display
- **PfSegmentedButton** — segmented control with aria-pressed
- PfDataList was removed; use PfDataTable
- **PfDataTable** — generic table that becomes cards on phones (`useBreakpoint() === 'mobile'`, < 768 px). `rows`, `columns` (`id`, `header`, `kind` for alignment, `cell` where null/undefined/'' shows "—", `sortValue` for client sort or `sortable` for server sort, `firstDir`, `width`, `minWidth`, `srOnlyHeader`, `headerExtra`, `hideOnCard`), `getRowId`, `data-testid` (table, or the phone list), `rowTestId`, `emptyState`, `loading` / `loadingState`. Sorting: client mode sorts by `sortValue` (nulls last, stable); passing `onSortChange` makes it controlled and the table never reorders. Click cycle: first direction (number, money, date desc; text asc; `firstDir` overrides), opposite, then none. On phones a "Sort by" select above the cards is the sort control and always uses each column's first direction (no direction toggle). `headerExtra` (e.g. a hint/tooltip trigger) renders in the `<th>` after the sort button, never inside it (no nested interactive markup, not part of the button's name), and in the card label line; interactive adornments (`[role=button]`, `[role=link]`, focusable `[tabindex]`) never trigger `onRowClick`. The phone "Sort by" option text is the column's string `header` (id for non-string headers). Default card: first non-checkbox/actions column is the title, other columns `label: value`; `renderCard` replaces the body. Options: `selection` (checkbox column, select-all across pages with `cap`, count bar), `selectedId`, `onRowClick` (also Enter on the row's first link or button; rows add no tab stops), `isDimmed` (secondary text colour, not opacity), `rowAttrs`, `rowMenu` (`⋯` menu), `renderDetail`, `groupBy`, server paging (`page`, `onPageChange`, `total`, `pageSize`; with `pageSizeOptions` + `onPageSizeChange` it adds "Showing a–b of N" and a "Rows per page" select on the left, page buttons on the right; no select on an empty page) and `loadMore` (the caller renders errors). `sortRows(rows, column, dir)` is the table's own client sort, exported for sorting a full list before paging. `pfTableHeaderStyle` / `pfTableCellStyle` are exported for tables that must match. Unlike `PfCompareTable` (columns are the things being compared), columns here are fields of one row type.
- **PfBudgetBars** — generic spend-versus-limit rows. Each row has `label`, `actual`, `limit` (null or 0 = no limit, shows `noLimitText` and a "set a limit" action), optional stacked `segments` (used only when they sum to `actual`; a legend lists each with label and amount; slices are divided by a 2px surface-coloured separator between neighbours only, and legend swatches carry a 1px border, so near-identical colours stay distinguishable), `highlighted`, `note`. Within the limit the fill is positive; over it the fill is danger with a ⚠, hidden "Over limit" and danger-coloured text (never colour alone). Each bar is a `role="progressbar"` named "{label} spent". `format` renders money. Optional inline edit: `onEditLimit(id, next)` must resolve only after the caller's rows hold the new data (focus then returns to the Edit button) and reject with an `Error` to show its message with the form kept open; amounts are rounded to cents; optional row `editValue` prefills the input instead of `limit` (for a displayed limit that is base + extra while the editable value is the base); the form closes if the row stops being `editable`. Labels, test ids and texts come from the caller (`editLabel`, `editAriaLabel`, `editInputLabel`, `testIdPrefix`, `saveLabel`, ...). `compact` drops padding and editing.
- **PfStageBar** — stateless stage bar: one segment per step (`done`, `current` with `progress` 0–1, `todo`, `optional`), optional `currentLabel` after the bar; `role="list"` with per-step aria-labels and `aria-current="step"`
- **PfStepCards** — stateless step cards in a responsive grid: per step `title`, `state` (`done`, `current`, `todo`, `skipped`), optional `tag`, `count`, `cost`, `note` and an `action` slot; `currentId` picks the highlighted card (`aria-current="step"`); `role="list"` with `"<title>, <state>"` aria-labels
- **PfCompareTable** — stateless comparison table, generic over the column type: `columns`, `getColumnId`, `renderColumnHeader`, `rows` (`id`, `label`, optional `group` heading per run, `get`, optional `value`, `best` `max`/`min`, `tone`). Real `<table>` in an `overflow-x: auto` container, sticky first column; best cells bold positive with hidden "best", `bad` cells negative with hidden "fails" (never colour alone). `onlyDifferences` (controlled) hides rows equal across columns; `emptyState` for no columns or when `onlyDifferences` hides every row; NaN counts as null; optional `aria-label` names the scroll region (then a focusable `role="region"`; without it the container is neither focusable nor a landmark) and is not repeated on the table; `ok`/`warning` tones also carry a hidden word per cell
- **PfModelPicker** — controlled provider + model pair of PfSelects in a `role="group"` (`label`, default "Model"); changing the provider emits its first model; `disabled` providers show `disabledNote`; model `note` (e.g. a price) follows the label
- **PfChatPanel** — controlled chat column: `mode` `hidden` (renders nothing) / `docked` (resizable, `width` 280–720 via `role="separator"`, pointer or ←/→) / `expanded` (shows `summary`); docked is full-screen on phones. Messages in a `role="log"` (meta, sources, pending, error, `renderMessageActions`), composer (Enter sends, Shift+Enter newline), `⋯` menu from `menuItems`, slots `header`/`context`/`footer`/`emptyState`. Escape stays inside the panel. Optional per-message `steps` (`{id,label,state: running|done|error}`: live `role="status"` list while pending, folded into a closed "<n> steps" details when done, an error step stays visible), `sourcesLabel` (default "Sources"), `question` (`{text, choices?, onChoose?}`: one button per choice, disabled after the first pick) and `stopped` (`{message, onContinue}`: message plus a Continue button, `data-testid="chat-panel-continue"`). Optional `costMeter` (`{spentUsd, ceilingUsd, label?}`: `role="meter"` above the messages, "$0.07 of $0.25", warning colour from 80%, danger at 100%, bar and `aria-valuenow` clamp at the ceiling). Optional `slashItems` (`{id,name,description,whoLabel}[]`) + `onSlashSelect`: a draft matching `^/\S*$` opens a listbox above the composer of items whose name starts with the typed text; ↑/↓ move, Enter or click sets the draft to `/name ` and calls `onSlashSelect`, Escape closes; the textarea stays a plain textarea (no `role="combobox"`; only `aria-controls` + `aria-autocomplete="list"`) and a visually hidden polite `role="status"` announces the highlighted item; without `slashItems` (or with none matching) `/` is plain text. Small lines (meta, sources, steps) use the secondary text colour (not the muted one) for AA contrast: a deliberate default change. Plain-text answers; no markdown Header title never shrinks (`flexShrink:0`, `nowrap`); the `header` slot sits in a flex-wrap container taking the remaining space.

### Misc
- **PfErrorBoundary** — class component error boundary with reset
- **ThemeIcon** — renders theme SVG or fallback icon

### Utilities
- **useBreakpoint()** — returns 'mobile' | 'tablet' | 'desktop'
- **cn()** — clsx wrapper
- **getMotionConfig()** — respects prefers-reduced-motion + --pf-motion-intensity

## Design rules

- **Three link kinds.** Action link (`PfActionLink`, "Place →"): accent text, no underline until hover/focus. Back link ("← Parent", in `PfPageHeader`). Underlined text link: only inside a sentence. No "Settings ›" style text.
- **One primary button per view.** Everything else is secondary, ghost or quiet.
- **Disabled = grey + reason.** A disabled button is a grey surface with muted text, never a pale accent, and says why via `reason`.
- **Six text sizes.** Use `pfText` (page 24, section 17, card 15, body 14, meta 13, label 12); new and changed components use `pfText` rather than literal sizes.  Older components still carry literal sizes and are being migrated.
- **Contrast.** `src/__tests__/kitContrast.test.ts` checks the kit's colour pairings (action link, disabled text, checked toggle) against every bundled theme at 4.5:1, with an explicit allow-list of known theme failures.

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

## Theming tokens: accent text and on-accent

Components read two optional tokens in addition to `--pf-accent`. Neither is required; when a theme does not define them every component renders exactly as it did before.

- `--pf-accent-text` — the accent used as text, thin foreground, borders, indicators, focus rings and checked-state controls (link text, accent-coloured labels, active nav text and indicator bars, focus borders/outlines, checked switch/checkbox/radio, slider range and thumb). Components always write `var(--pf-accent-text, var(--pf-accent))`. Set it when your accent is bright enough for fills (buttons, active segments, backgrounds, progress fills) but too light to be seen or read against the page background.
- `--pf-on-accent` — text or icons placed on an accent fill (primary button label, active segmented-button label). Components write `var(--pf-on-accent, var(--pf-bg-base))`. Set it when the accent fill needs a different label colour than the page background.

Fills, backgrounds and bars keep using `--pf-accent`. `src/__tests__/accentTextFallback.test.ts` guards both rules: never a bare `--pf-accent` in `color`, `outline`, `accentColor`, `border*`, `caretColor`, `fill`, `stroke` or `boxShadow`, and never either new token without its fallback.
