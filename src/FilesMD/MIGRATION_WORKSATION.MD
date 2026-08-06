# Workstation Migration Guide

## Goal

Use `NewSmartFactory` only as a reference implementation.
Use this repository as the target implementation.

The objective is to bring the workstation dashboard capabilities into the main app without copying the reference structure blindly and without regressing the existing navigation, AI drawer, tier meeting, action tracker, maintenance, or document flows.

## Core Rules

1. Treat `NewSmartFactory` as behavior reference, not architecture reference.
2. Prefer this app's patterns, naming, theme, routing, and interaction model over the reference project's internal structure.
3. Do not keep expanding `src/App.tsx` with large workstation code. New workstation logic must be moved into a dedicated `src/workstation/` feature area.
4. Centralize workstation mock data and widget metadata in dedicated files. Do not scatter chart data across multiple components.
5. Build widgets as small isolated components. One widget should not know about the rendering details of unrelated widgets.
6. Reuse the existing app shell, side navigation, and AI drawer where possible.
7. Add new dependencies only when the target app cannot reasonably support the behavior with its current stack.
8. Preserve existing screens during migration. Introduce the new workstation experience behind a new screen/component first, then decide whether to replace `dashboard`, `smart_hub_home`, or both.
9. Persist user customization safely. Invalid saved layouts must fall back to defaults instead of breaking render.
10. Keep the implementation mock-data friendly first. Wire live APIs only after UI parity is stable.

## Recommended Target Structure

- `src/workstation/types.ts`
- `src/workstation/data/workstationMockData.ts`
- `src/workstation/data/widgetRegistry.ts`
- `src/workstation/hooks/useWorkstationLayout.ts`
- `src/workstation/components/WorkstationHeader.tsx`
- `src/workstation/components/WorkstationAlertBanner.tsx`
- `src/workstation/components/WorkstationDashboard.tsx`
- `src/workstation/components/cards/`
- `src/workstation/components/charts/`
- `src/workstation/components/tables/`
- `src/workstation/components/actions/`
- `src/workstation/components/WidgetCatalog.tsx`
- `src/workstation/components/WidgetShell.tsx`

Existing files likely to change later:

- `src/App.tsx`
- `src/navigation/navigationConfig.tsx`
- `package.json`

## Small-Step Migration Plan

### Step 1: Carve out a workstation feature slice

- Create `src/workstation/` and move all future workstation work there.
- Define workstation domain types for line summary, KPI values, chart datasets, traceability rows, machine rows, and widget definitions.
- Create a single mock-data source that represents the workstation state for Line 10.

Exit criteria:
- No workstation-specific business data lives in `src/App.tsx`.

### Step 2: Introduce a dedicated target screen

- Add a dedicated workstation screen component in the main app.
- Keep current workstation-related screens intact while the new screen is under development.
- Wire navigation to the new screen only when the shell is ready.

Recommended approach:
- Start by attaching the new screen to the existing workstation navigation path instead of replacing unrelated shopfloor screens.

### Step 3: Build the workstation shell

- Implement the workstation header with line/product context, status chips, and primary actions.
- Recreate the workstation alert banner using this app's visual language.
- Map "Ask AI Copilot" to the existing AI drawer instead of porting the reference chat system first.

Exit criteria:
- The target screen shows the header, actions, and alert area with no grid yet.

### Step 4: Add widget registry and default layout model

- Create a widget registry file that defines widget id, label, type, description, and default size/layout.
- Create default visible widget ids.
- Create layout utilities for default layout generation and validation.

Important rule:
- The registry must be the single source of truth for widget availability and defaults.

### Step 5: Implement dashboard layout and persistence

- Add widget visibility state.
- Add layout persistence in local storage.
- Implement reset-to-default behavior.
- Support add/remove widgets from a catalog.

Decision note:
- If drag-and-resize is required for parity, introduce `react-grid-layout`.
- If only reordering is needed in the first pass, use a simpler layout approach and defer full resize.

### Step 6: Build the default-visible widgets first

Implement these widgets before secondary charts:

- `OEE & Performance`
- `Output vs Plan`
- `Downtime`
- `FPY`
- `Output Trend`
- `Scrap Trend`
- `Operator Tasks`
- `Andon / Escalation`
- `Material Risk`
- `Traceability History`
- `Machine Performance Summary`

Reason:
- These are the reference dashboard's default workstation story and provide the strongest user value first.

### Step 7: Add the workstation detail widgets

Implement the tabbed and detail-driven widgets next:

- `Selected Item Details`
- `Cycle Time vs Target`
- `Output Trend by Hour`
- `Top Downtime Causes`

Important rule:
- Keep selected-item and selected-entity state local to the workstation feature, not global app state.

### Step 8: Add the secondary analytics catalog

Implement the broader chart catalog:

- Operational Metrics
- Output by Line
- Energy Consumption
- Machine Throughput
- State Distribution
- Output vs Plan by Shift
- Defect Types
- Bottleneck Monitor
- Cycle Time Trend
- Good vs Rejected
- Downtime Pareto
- WIP Levels
- Alarm Trend
- FPY by Process
- Utilities & Cost

Important rule:
- Reuse existing `@mui/material` and current theme tokens.
- Prefer existing charting in this repo when it can express the needed behavior cleanly.

### Step 9: Integrate with existing app workflows

- Connect workstation actions to current app capabilities where relevant.
- Map AI actions to the existing AI drawer.
- Map maintenance-related actions to maintenance or action tracker flows where appropriate.
- Map scan/search shortcuts to current document and smart search flows.

Important rule:
- Do not duplicate existing flows if the main app already has a better destination.

### Step 10: Decide on onboarding and AI-driven widget injection

- Evaluate whether the reference onboarding sequence is required in the target app.
- If yes, adapt it to the target app's AI drawer and state model.
- If no, keep the workstation screen always-ready and only bring over the alerting and recommended-widget behaviors.

Recommended approach:
- Defer onboarding until the workstation UI and widget system are stable.

### Step 11: Replace or consolidate legacy workstation views

- Compare the new workstation screen against current `dashboard`, `smart_hub_home`, `line_performance`, and related workstation cards.
- Decide what becomes:
  - primary workstation landing page
  - supporting overview page
  - deprecated duplicate content

Important rule:
- Remove duplication only after parity is reached and verified.

### Step 12: Verify and harden

- Validate empty state and corrupted local-storage fallback.
- Validate widget add/remove/reset flows.
- Validate mobile and desktop layouts.
- Validate no regression in navigation, AI drawer, action tracker, maintenance, and document flows.

## Feature Mapping to Build In Order

### Phase A: Shell and operator workflow

- Header
- Status chips
- Alert banner
- AI entry point
- Workstation actions

### Phase B: Core operational story

- OEE composite card
- Output/plan cards
- Downtime and FPY cards
- Output trend
- Scrap trend
- Machine performance
- Traceability history

### Phase C: Customization

- Widget registry
- Edit mode
- Add/remove widgets
- Reset defaults
- Persisted layout

### Phase D: Advanced analytics

- Secondary charts
- Selected item details
- Cycle-time drilldown
- Material risk and Andon actions

## Main Gaps To Close In This Repo

- No dedicated modular workstation feature area exists yet.
- Current workstation-related UI is spread through `src/App.tsx`.
- Current app has configurable home widgets, but not a workstation widget registry with per-widget layout persistence.
- Current app has only a narrow line-performance view, not the reference dashboard's full workstation analytics set.
- Current app does not have traceability history, selected item tabs, machine performance summary, material risk, or Andon controls as dedicated workstation widgets.
- Current app does not yet have the reference onboarding and AI-driven pending-widget pattern.
- Current app does not currently include `react-grid-layout` or `recharts`.

## Implementation Guidance

- Start with parity for the default-visible workstation layout, not the entire catalog.
- Keep every new widget independently testable and removable.
- Keep mock workstation data in one place so later API integration is straightforward.
- Use descriptive ids and stable local-storage keys.
- Avoid tight coupling between workstation widgets and unrelated app screens.
- Prefer composition over adding more conditional branches to `src/App.tsx`.

## Recommended First Delivery Slice

Build this exact sequence first:

1. workstation feature folder and types
2. workstation screen shell
3. alert banner and header actions
4. widget registry
5. layout persistence
6. default-visible widgets only
7. AI drawer integration hooks

That slice delivers visible value early and creates the right foundation for the rest of the migration.
