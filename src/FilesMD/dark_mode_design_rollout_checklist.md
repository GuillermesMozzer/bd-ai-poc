# Dark Mode and Design System Rollout Checklist

Use this checklist to track the dark mode implementation and the follow-up screen styling cleanup guided by:

- `src/FilesMD/guide_DarkMode.md`
- `src/FilesMD/design.md`
- `design-system/Light.tokens.json`
- `design-system/Dark.tokens.json`

## Phase 1 - Dark Mode Foundation

Progress note: Phase 1 foundation code has been implemented. `npm.cmd run build` passed on 2026-06-27; `npm.cmd run lint` was attempted but currently fails on existing TypeScript issues across the project, so lint remains unchecked until those are cleaned up.

### Theme State

- [x] Create `src/common/contexts/ThemeModeContext.tsx`.
- [x] Define `ThemeMode = 'light' | 'dark'`.
- [x] Expose `themeMode`, `setThemeMode`, and `toggleThemeMode`.
- [x] Read saved preference from `localStorage`.
- [x] Fall back to `prefers-color-scheme` when no saved preference exists.
- [x] Persist changes back to `localStorage`.
- [x] Apply `data-theme="light"` or `data-theme="dark"` to `<html>`.
- [x] Handle browser/server safety with `typeof window !== 'undefined'`.

### First Paint

- [x] Add an early theme initialization script in `index.html`.
- [x] Confirm the script sets `document.documentElement.dataset.theme` before React loads.
- [ ] Confirm page reload does not flash the wrong theme.

### MUI Theme

- [x] Refactor `src/theme.ts` from static `muiTheme` to `getMuiTheme(mode)`.
- [x] Keep MUI `palette.*` values as real hex colors, not CSS variables.
- [x] Set `palette.mode` to the active theme mode.
- [x] Convert `activeTheme` values to CSS variable references where safe.
- [x] Update `MuiCssBaseline` to use theme-aware body background, text color, selection, scrollbar, and focus styles.
- [x] Update global `MuiPaper`, `MuiCard`, `MuiButton`, `MuiTextField`, `MuiSelect`, `MuiChip`, `MuiDrawer`, and `MuiAppBar` overrides.

### CSS Variables

- [x] Add light variables under `:root` in `src/index.css`.
- [x] Add dark variables under `:root[data-theme="dark"]` in `src/index.css`.
- [x] Include active app theme variables.
- [x] Include text, divider, background, paper, drawer, shadow, focus, button, input, chip, and status variables.
- [x] Include workstation token variables.
- [x] Include chart and priority/status variables where existing components depend on them.

### App Wiring

- [x] Wrap the app with `ThemeModeProvider` in `src/App.tsx`.
- [x] Create the MUI theme with `React.useMemo(() => getMuiTheme(themeMode), [themeMode])`.
- [x] Keep existing providers in their current behavior order unless a theme dependency requires moving them.
- [ ] Confirm login screen still renders.
- [ ] Confirm authenticated app still renders.

### Profile Menu Toggle

- [x] Import `useThemeMode` in `src/navigation/MainLayout.tsx`.
- [x] Import `Switch` or the chosen MUI control.
- [x] Add a `Dark Mode` row in the existing profile menu.
- [x] Place the row after `Notifications`.
- [x] Place it before the divider and `Sign Out`.
- [x] Ensure the switch reflects `themeMode === 'dark'`.
- [x] Ensure changing the switch toggles the theme immediately.
- [x] Ensure keyboard users can focus and toggle the switch.

### Shared Shell Styling

- [x] Tokenize `MainLayout` root background.
- [x] Tokenize app header surfaces, borders, hover states, and search field.
- [x] Tokenize user menu popover surface, border, text, dividers, hover states, and sign-out color.
- [x] Tokenize alerts popover surface, text, border, and alert rows.
- [x] Tokenize site menu popover surface and border.
- [x] Tokenize `HeaderHierarchyPicker`.
- [x] Tokenize shared drawers such as `StandardDrawer`.
- [x] Tokenize shared assistant/AI panels such as `AssistantBanner`.

### Phase 1 Verification

- [ ] Run `npm run lint`.
- [x] Run `npm run build`.
- [ ] Start the app locally.
- [ ] Login successfully.
- [ ] Open the profile menu.
- [ ] Toggle dark mode on.
- [ ] Toggle dark mode off.
- [ ] Reload in dark mode and confirm persistence.
- [ ] Reload in light mode and confirm persistence.
- [ ] Verify app shell, header, popovers, drawers, inputs, buttons, chips, and cards in both modes.

## Phase 2 - Token Bridge for Feature Areas

Progress note: Phase 2 token bridge code has been implemented for workstation and production planning tokens. `npm.cmd run build` passed after the Phase 2 changes on 2026-06-27. Visual screen validation remains open.

### Workstation Tokens

- [x] Refactor `src/workstation/theme.ts` token exports to use CSS variables.
- [x] Preserve existing export names to avoid broad component churn.
- [x] Update `tokenBrand`, `tokenError`, `tokenWarning`, `tokenSuccess`, `tokenInfo`, `tokenNeutral`, `tokenText`, `tokenDivider`, and `tokenCommon`.
- [x] Update `workstationVisuals`.
- [x] Update `workstationChartSemantic`.
- [x] Update shared workstation `sx` constants.
- [x] Replace invalid alpha concatenation patterns such as `${color}33` with `color-mix(...)`.

### Production Planning Tokens

- [x] Refactor `src/productionPlanning/ui/planningTheme.ts` to use CSS variables.
- [x] Preserve `planningTokens`, `planningStatusTones`, `planningSurfaceSx`, and `planningCardSx`.
- [ ] Validate planning status badges in both themes.
- [ ] Validate planning cards, tables, filters, and AI panels in both themes.

### Phase 2 Verification

- [ ] Run `npm run lint`.
- [x] Run `npm run build`.
- [ ] Check representative workstation dashboard screens.
- [ ] Check representative production planning screens.
- [ ] Record remaining hard-coded-color issues for Phase 3.

## Phase 3 - Screen Styling Cleanup

Progress note: Phase 3 is not complete. App shell/shared navigation and the first Workstation entry-point batch have been implemented. Maintenance received a first pass plus screenshot-driven follow-ups for Analytics KPI cards, BLU.AI insight rows, Follow Up Board lanes/cards, Planner Calendar blocked windows/summary rows, Spare Parts, Equipment Ledger, shared selectors, and shared drawers. `npm.cmd run build` passed for the app shell/shared navigation batch, Workstation batch, Maintenance first pass, Maintenance screenshot follow-up, and remaining Maintenance dark-mode batch on 2026-06-27. Full browser visual review is still open because the in-app browser blocked loading `http://127.0.0.1:3000` during this pass. Production Planning, Shift, Document Management, AI Home, Smart Search, Global View, Control Tower strategy, and visual light/dark review remain open.

Apply `src/FilesMD/design.md` as a styling-only refactor. Do not change data, behavior, routes, labels, state handling, or workflows.

### Screen Batch Order

- [x] App shell and shared navigation.
- [x] Workstation widgets and dashboards.
- [ ] Maintenance screens. Code pass complete for current scope; pending browser visual review.
- [ ] Production Planning screens.
- [ ] Shift Management and Shift Logbook screens.
- [ ] Document Management screens.
- [ ] AI Home and Smart Search screens.
- [ ] Global View screens.
- [ ] Control Tower screens, handled separately because they already use a custom dark visual language.

### Per-Screen Audit

- [ ] Identify hard-coded `#FFFFFF`, `#F8FAFC`, `#334155`, `#0F172A`, and similar one-off colors.
- [ ] Identify hard-coded `rgba(15,23,42,...)` light-mode borders and shadows.
- [ ] Identify hard-coded card radii that violate the design system.
- [ ] Identify nested cards or card-in-card layouts.
- [ ] Identify tabs placed outside the main card when `design.md` says they belong inside.
- [ ] Identify overly heavy shadows, gradients, and decorative styling.
- [ ] Identify buttons that do not use 8px radius.
- [ ] Identify chips/filters that do not use pill radius.
- [ ] Identify AI panels that do not follow the BLU.AI panel spec.
- [ ] Identify icons with unnecessary circular wrappers.

### Per-Screen Refactor

- [ ] Use semantic tokens only.
- [ ] Use `tokenBrand.main` for primary actions.
- [ ] Use `tokenText.primary`, `tokenText.secondary`, and `tokenText.disabled` for text.
- [ ] Use `tokenDivider` for borders.
- [ ] Use `background.paper` or tokenized paper variables for main cards.
- [ ] Use `borderRadius: '8px'` for buttons.
- [ ] Use `borderRadius: '12px'` or `16px` for main cards/panels.
- [ ] Use `borderRadius: '999px'` for chips and filters.
- [ ] Keep tabs inside the main card where applicable.
- [ ] Keep page header focused on title and global actions.
- [ ] Keep AI insights panels visually consistent with `design.md`.

### Phase 3 Verification

- [ ] Run `npm run lint` after each screen batch.
- [ ] Run `npm run build` after each screen batch.
- [x] Build passed for app shell/shared navigation batch.
- [x] Build passed for Workstation entry-point batch.
- [x] Build passed for Maintenance first pass.
- [x] Build passed for Maintenance screenshot follow-up pass.
- [x] Build passed for remaining Maintenance batch: Spare Parts, Equipment Ledger, shared selectors, and drawers.
- [ ] Browser visual review for remaining Maintenance batch. Blocked on 2026-06-27 by in-app browser policy for `http://127.0.0.1:3000`.
- [ ] Review each changed screen in light mode.
- [ ] Review each changed screen in dark mode.
- [ ] Check keyboard focus visibility.
- [ ] Check text contrast and readability.
- [ ] Check hover, selected, disabled, and active states.
- [ ] Check responsive behavior at common viewport widths.

## Accessibility Checklist

- [ ] Normal text contrast meets WCAG AA, 4.5:1 or better.
- [ ] Large text and icon contrast meets WCAG AA, 3:1 or better.
- [ ] Focus-visible states are clear in both themes.
- [ ] Switch has an accessible label.
- [ ] Icon-only buttons have accessible labels or tooltips where needed.
- [ ] Disabled states remain distinguishable without becoming unreadable.
- [ ] Chart labels, tooltips, legends, and axis labels remain readable.
- [ ] Selection, hover, and active states are not color-only when status meaning matters.

## Known Risk Areas

- [ ] Screens with many inline hard-coded colors may only partially respond to dark mode after Phase 1.
- [ ] Chart libraries may need explicit tooltip, axis, grid, and legend colors.
- [ ] CSS variable alpha concatenation can create invalid CSS.
- [ ] Control Tower may need a separate profile-menu strategy.
- [ ] Login screen has independent hard-coded styling and must be checked separately.
- [ ] Popovers and menus can inherit MUI defaults unexpectedly when `palette.mode` changes.
- [x] LocalStorage failures should not crash the app.

## Final Acceptance

- [ ] Dark mode can be enabled and disabled from the profile menu.
- [ ] Theme preference persists after reload.
- [ ] The app shell is polished in both themes.
- [ ] Shared components are tokenized.
- [ ] High-priority screens follow `design.md`.
- [ ] Remaining screen cleanup items are documented.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.



