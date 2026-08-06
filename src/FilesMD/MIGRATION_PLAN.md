# Tier Meeting Board Migration Plan

This document describes how to migrate the user-facing features from `tier-meeting-board-advanced/` into the main application in this repository.

Reference implementation:
- `tier-meeting-board-advanced/`

Target implementation:
- Main application rooted at `src/App.tsx`

Important scope rule:
- Treat `tier-meeting-board-advanced/` as a reference implementation only.
- Migrate concepts and features into the main application.
- Do not copy the reference architecture blindly when the main app already has a stronger or more integrated implementation.

## Goals

Bring the main application to feature parity with the reference tier meeting board while preserving:
- The current BLU.AI navigation and screen model
- The current MUI-based visual system
- The stronger action tracker flows already present in the main app
- Existing routes, drawers, and workflows that already integrate with maintenance, document management, and operations

## Current State Summary

### Migration progress snapshot

Status as of the current implementation:
- Completed:
  - Tier Meeting now opens a real lane-based board instead of the old summary page
  - Safety, Quality, Delivery, Cost, and People lane content exist in target-side modules
  - A reusable lane shell exists with status controls, action summary footer, expand action, and BLU affordances
  - Board-driven Action Tracker integration is live
  - Lane visibility controls are live
  - Lane settings dialog and local per-lane settings are live
  - Expanded pillar drill-in view infrastructure is live
  - Layout editing is live with drag reordering, 60-column width resizing, and lane-height resizing
  - Board layout state persists locally
  - Action Tracker screen extraction is complete
  - Shared Action Tracker types extraction is complete
- Partially completed:
  - Expanded pillar experiences exist, but they are still using a shared drill-in pattern rather than fully distinct reference-level deep views for every pillar
  - Lane customization exists for visibility toggles and component ordering, but component visibility is still coarse-grained and not fully pillar-specific
  - Lane status state exists and is persisted, but there is not yet a user-facing status control in the lane header
  - The Tier Meeting route has been replaced by the new board, but the legacy Tier Meeting screen was not extracted into a standalone preservation component
- Still missing or not yet decided:
  - Custom pillar lane / rename flow
  - Full custom pillar creation
  - Reference-style board-native Action Tracker lane
  - Fully distinct expanded views for Safety, Quality, Delivery, and Cost at the same depth as the reference
  - Review of reference-only placeholder interactions and final product decisions around them

### What the reference app provides

The reference app provides a dedicated tier meeting board experience with:
- Pillar-based lanes for Safety, Quality, Delivery, Cost, People, Custom, and Action Tracker
- Drag/resizable board layout
- Lane visibility controls
- Per-pillar status controls
- Per-pillar customization and ordering
- Expanded full-screen pillar views
- Pillar-specific KPI, chart, insight, and action modules
- A board-native Action Tracker lane
- A People lane with recognition and communication modules

### What the main app already has

The main app already provides:
- A `tier_meeting` route with summary cards and a generated agenda
- A more advanced standalone `action_tracker` route
- Action tracker table and kanban modes
- Action tracker filters modal
- Action creation drawer
- Action details drawer with comments
- BLU.AI entry points into Tier Meeting and Action Tracker
- Related operations, work order, and document workflows

### Main gap

The original main gap was the board itself, and that gap has now been closed:
- The main app now has a configurable, lane-based tier meeting board
- The remaining gap is feature depth and parity around custom pillars, deeper expanded views, and a few reference-only interactions

### Lane parity snapshot

This section tracks KPI and component parity against `tier-meeting-board-advanced/`.

#### Safety

Reference KPIs:
- Fatality
- Serious Inj
- Minor Injury
- Near Misses
- Unsafe Act
- Submitted ESO

Current target KPIs:
- Fatality
- Serious Inj
- Minor Injury
- Near Misses
- Unsafe Act
- Submitted ESO

Reference components:
- Day grid tracker
- KPI cards
- Additional information cards

Current target components:
- Day grid tracker
- KPI cards
- Additional information cards
- Month-to-date note

Parity status:
- [x] Day grid exists
- [x] KPI list matches reference
- [x] Additional information cards match reference

Gap notes:
- Safety board-level parity is now aligned with the reference lane.
- Expanded Safety drill-in depth is still separate work.

#### Quality

Reference KPIs:
- Field Actions
- Complaints
- NCs
- CAPAs

Current target KPIs:
- Field Actions
- Complaints
- NCs
- CAPAs

Reference components:
- Day grid tracker
- KPI cards
- Additional information cards

Current target components:
- Day grid tracker
- KPI cards
- Additional information cards
- Month-to-date note

Parity status:
- [x] KPI list matches reference
- [x] Day grid exists
- [x] Additional information cards match reference

Gap notes:
- Quality board-level parity is now aligned with the reference lane.
- Expanded Quality drill-in depth is still separate work.

#### Delivery

Reference KPIs:
- Last Changeover
- Last Start-up

Current target KPIs:
- Last Changeover
- Last Start-up

Reference components:
- KPI cards
- OEE card
- Product info
- Graphs & charts

Current target components:
- KPI cards
- Product info
- OEE card
- Graphs & charts

Parity status:
- [x] Core changeover/start-up KPIs exist
- [x] KPI list matches reference exactly
- [x] OEE card exists
- [x] Product info exists
- [x] Graph/chart support exists at board level

Gap notes:
- Delivery board-level parity is now aligned with the reference lane.
- Expanded Delivery drill-in depth is still separate work.

#### Cost

Reference KPIs:
- Total Scrap Produced

Current target KPIs:
- Total Scrap Produced

Reference components:
- KPI cards
- Hourly Scrap Production chart
- Hourly Downtime chart

Current target components:
- KPI cards
- Hourly Scrap Production chart
- Hourly Downtime chart

Parity status:
- [x] Scrap KPI intent exists
- [x] KPI list matches reference exactly
- [x] Hourly scrap chart exists
- [x] Hourly downtime chart exists

Gap notes:
- Cost board-level parity is now aligned with the reference lane.
- Expanded Cost drill-in depth is still separate work.

#### People

Reference KPIs:
- Absenteeism

Reference summary module:
- Absences
- Medical Leaves
- Days Off
- Vacation

Current target KPIs:
- Absenteeism
- Open swaps
- OT hours

Current target components:
- Summary module
- Recognition
- Communications
- Start Meeting CTA

Parity status:
- [x] Absenteeism KPI exists
- [x] Summary module matches reference
- [x] Recognition and communications exist

Gap notes:
- People board-level parity is now aligned with the reference lane while still preserving the useful target-side qualitative modules.
- Expanded People-specific depth, if desired, is still separate follow-up work.

## Migration Principles

1. Keep the main app as the source of truth.
2. Reuse existing target-side workflows when they are already stronger than the reference.
3. Port features in small vertical slices.
4. Separate data-model migration from visual migration.
5. Avoid dropping the entire reference app into `App.tsx`.
6. Extract target features into modules before adding new board behavior.

## Feature Mapping

### Board shell

Reference:
- Board container
- Lane order
- Lane visibility
- Grid layout
- Expanded panel orchestration

Reference files:
- `tier-meeting-board-advanced/src/components/Dashboard.tsx`

Target status:
- Implemented
- `tier_meeting` now renders the target-side board shell

Migration action:
- Completed via `TierMeetingBoard` under the existing `tier_meeting` route

### Pillar lanes

Reference:
- Safety, Quality, Delivery, Cost, People, Custom lane shells
- Header controls
- Status selector
- Expand CTA
- Footer action summary

Reference files:
- `tier-meeting-board-advanced/src/components/PillarColumn.tsx`

Target status:
- Implemented for Safety, Quality, Delivery, Cost, and People
- Still missing for Custom and Action Tracker board-native lanes

Migration action:
- Continue using the reusable target-side lane shell and extend it only for missing lane types

### Pillar content

Reference:
- Pillar-specific KPI cards
- Charts
- Daily tracker grid
- Recognition and communications
- Product/schedule/details sections

Reference files:
- `tier-meeting-board-advanced/src/components/PillarColumn.tsx`
- `tier-meeting-board-advanced/src/components/KPICard.tsx`
- `tier-meeting-board-advanced/src/components/InsightCard.tsx`

Target status:
- Implemented as reusable target-side modules for Safety, Quality, Delivery, Cost, and People
- Still shallower than the reference for some pillar-specific deep content

Migration action:
- Continue deepening pillar-specific content where parity still matters

### Expanded pillar experiences

Reference:
- Delivery expanded view
- Cost expanded view
- Quality expanded view
- Safety expanded view

Reference files:
- `tier-meeting-board-advanced/src/components/Dashboard.tsx`

Target status:
- Partially implemented
- A shared expanded drill-in view exists, but pillar-specific deep views are still missing

Migration action:
- Add expanded pillar overlays or full-page drill-ins one by one

### Action tracker integration

Reference:
- Board-native lane
- Simple kanban/list behavior
- Action summary jump-off

Reference files:
- `tier-meeting-board-advanced/src/components/Dashboard.tsx`
- `tier-meeting-board-advanced/src/components/ActionCard.tsx`

Target status:
- Already stronger in the main app

Migration action:
- Reuse the target’s existing action tracker data, detail drawer, create flow, and filtering
- Connect board lanes into the existing action tracker instead of replacing it

### Data model

Reference:
- `Pillar`, `KPI`, `Insight`, `Action`, `DashboardData`

Reference files:
- `tier-meeting-board-advanced/src/types.ts`
- `tier-meeting-board-advanced/src/data/mockData.ts`

Target status:
- Implemented in target-side typed models and board state

Migration action:
- Completed, continue extending types only where new features need it

## Proposed Target Architecture

Create a new feature area for tier meeting:

```text
src/
  tierMeeting/
    components/
      TierMeetingBoard.tsx
      TierMeetingLane.tsx
      TierMeetingHeader.tsx
      TierMeetingExpandedView.tsx
      TierMeetingActionSummary.tsx
      pillars/
        SafetyLaneContent.tsx
        QualityLaneContent.tsx
        DeliveryLaneContent.tsx
        CostLaneContent.tsx
        PeopleLaneContent.tsx
        CustomLaneContent.tsx
    data/
      tierMeetingMockData.ts
    hooks/
      useTierMeetingBoardState.ts
    types.ts
```

This keeps the migration out of `src/App.tsx` and makes the feature testable and replaceable later.

## Migration Steps

### Phase 1: Stabilize the target structure

Current status:
- Mostly completed
- Remaining gap: the legacy Tier Meeting screen was not preserved as its own component, and some Action Tracker helpers still remain in `App.tsx`

1. Extract the current `tier_meeting` screen from `src/App.tsx` into its own module.
2. Extract the current `action_tracker` screen from `src/App.tsx` into its own module.
3. Extract target-side action tracker shared types and helpers from `App.tsx`.
4. Keep behavior identical during this phase.

Exit criteria:
- No visual or behavioral changes yet
- Tier Meeting and Action Tracker render from their own modules

### Phase 2: Introduce a board domain model

Current status:
- Completed

1. Create `src/tierMeeting/types.ts`.
2. Define types inspired by the reference:
   - `TierMeetingPillar`
   - `TierMeetingKPI`
   - `TierMeetingInsight`
   - `TierMeetingActionSummary`
   - `TierMeetingBoardState`
3. Map target naming and statuses to target conventions.
4. Create `src/tierMeeting/data/tierMeetingMockData.ts`.

Exit criteria:
- The target has typed tier-meeting data independent of `App.tsx`

### Phase 3: Add a static board shell

Current status:
- Completed

1. Create `TierMeetingBoard.tsx`.
2. Render static lanes for:
   - Safety
   - Quality
   - Delivery
   - Cost
   - People
3. Use target MUI styling, not the reference Tailwind styling.
4. Replace the current `tier_meeting` summary page with the new board shell behind the same route.

Exit criteria:
- `tier_meeting` opens a board layout instead of only summary cards

### Phase 4: Add lane headers and basic interactions

Current status:
- Partially completed
- Lane shell, expand action, action summaries, and visibility are live
- User-facing lane status controls are still missing even though status state exists

1. Add lane header title, status chip/select, expand button, and BLU affordances.
2. Add lane-level action summary footer.
3. Wire action summary clicks to the existing target `action_tracker` route.
4. Add lane visibility state.

Exit criteria:
- Users can view a multi-lane board and jump into Action Tracker from each lane

### Phase 5: Port pillar content incrementally

Current status:
- Completed for the initial board-level pillar content
- Still open later: deeper pillar-specific expanded content for parity

Implement in this order:

1. Safety lane
   - KPI cards
   - Day grid
   - Additional summary cards
2. Quality lane
   - KPI cards
   - Day grid
   - Additional summary cards
3. Delivery lane
   - KPI cards
   - production/schedule cards
4. Cost lane
   - KPI cards
   - charts
5. People lane
   - recognition
   - communications
   - start meeting CTA

Exit criteria:
- The board is useful without expanded views yet

### Phase 6: Add lane customization

Current status:
- Mostly completed
- KPI visibility, coarse section toggles, component ordering, and local persistence are live
- Fine-grained pillar-specific component visibility decisions may still need product review

1. Add per-lane settings dialog.
2. Support:
   - KPI visibility
   - component visibility
   - component ordering
3. Persist state locally first.

Exit criteria:
- Users can personalize lane composition

### Phase 7: Add expanded pillar views

Current status:
- Partially completed
- A shared expanded view exists, but distinct deep views for Safety, Quality, Delivery, and Cost are still missing

Implement expanded views in this order:

1. Safety
2. Quality
3. Delivery
4. Cost

Guidance:
- Use target dialogs/drawers/full-screen overlays
- Reuse existing charting or MUI patterns where possible
- Do not port the reference UI 1:1 if the target already has better patterns

Exit criteria:
- Each major operational pillar has a drill-down experience

### Phase 8: Integrate with the existing Action Tracker

Current status:
- Mostly completed
- Board summaries open the main Action Tracker with category context and linked actions open the existing detail flow
- A dedicated board-native Action Tracker lane is still not implemented

1. Replace any board-local temporary action logic with the target’s actual action tracker data.
2. Support filtered open behavior:
   - click a Safety summary opens Action Tracker filtered to Safety
   - click a Delivery summary opens Action Tracker filtered to Delivery
3. Connect board cards to existing detail drawers where appropriate.

Exit criteria:
- The board becomes a real front door to the existing action workflow

### Phase 9: Add layout editing

Current status:
- Completed

1. Add drag-and-drop lane ordering.
2. Add resize support.
3. Add persistence for:
   - lane order
   - visibility
   - layout sizes
4. Test on target desktop widths first, then responsive behavior.

Exit criteria:
- Users can reorganize the board like the reference implementation

### Phase 10: Decide on advanced reference-only features

Current status:
- Not started

Evaluate whether to adopt:
- Custom lane rename
- Full custom pillar creation
- Reference-specific modal actions like dismiss/create action inside insight cards
- Reference-specific dummy charts that may not match target workflows

Exit criteria:
- Only product-relevant features are migrated

## Recommended Build Order by Value

If the goal is fast user-visible progress, use this order:

1. Extract target screens from `App.tsx`
2. Add typed tier-meeting models
3. Ship static board shell
4. Connect lane action summaries to existing action tracker
5. Implement Safety and Quality lanes
6. Add lane customization
7. Add expanded views
8. Add layout editing

## Risks

### Single-file target complexity

Risk:
- The main app currently centralizes too much logic in `src/App.tsx`

Mitigation:
- Extract before migrating features

### Styling mismatch

Risk:
- The reference app is Tailwind/shadcn-based, while the target is MUI-based

Mitigation:
- Port behavior and structure, not raw styling

### Duplicate action logic

Risk:
- Rebuilding a second action tracker inside tier meeting would fragment the experience

Mitigation:
- Reuse the existing target action tracker flows

### Over-migrating mock content

Risk:
- Copying all reference mock charts and copy directly may create dead-end UI

Mitigation:
- Use the reference to define interactions, not to lock in content

## Definition of Done

The migration is complete when:
- `tier_meeting` opens a lane-based board
- Pillars are modular and configurable
- Action summaries connect into the existing target action tracker
- At least Safety, Quality, Delivery, Cost, and People have meaningful lane content
- Expanded pillar drill-downs exist for major operational pillars
- Layout and visibility can be customized
- The implementation is modular and no longer embedded entirely inside `src/App.tsx`

What still blocks full completion:
- Finish deeper pillar-specific expanded experiences for Safety, Quality, Delivery, and Cost
- Add a real user-facing lane status control in the lane shell
- Decide and implement the final direction for Custom lane support
- Review and either wire or remove reference-only placeholder interactions
- Optionally finish extracting remaining Action Tracker helpers out of `App.tsx`

## Suggested First Implementation Ticket Set

1. Extract `tier_meeting` screen into `src/tierMeeting/components/LegacyTierMeetingScreen.tsx`
2. Extract `action_tracker` screen into `src/actionTracker/components/ActionTrackerScreen.tsx`
3. Add `src/tierMeeting/types.ts`
4. Add `src/tierMeeting/data/tierMeetingMockData.ts`
5. Create `src/tierMeeting/components/TierMeetingBoard.tsx`
6. Replace current `tier_meeting` route body with `TierMeetingBoard`
7. Build `TierMeetingLane` shell
8. Build Safety lane content
9. Build Quality lane content
10. Wire lane action summary clicks into target Action Tracker

## Execution Checklist

Use this section as the delivery plan. Each task is intentionally small enough to become a single issue or PR.

Legend:
- `[x]` completed
- `[~]` partially completed
- `[ ]` not started

### EPIC 1: Extract current target screens out of `App.tsx`

#### Issue 1.1: Extract current Tier Meeting screen

Goal:
- Move the existing `currentScreen === 'tier_meeting'` JSX into its own component without changing behavior.

Files to create:
- `src/tierMeeting/components/LegacyTierMeetingScreen.tsx`

Files to update:
- `src/App.tsx`

Ownership:
- `src/tierMeeting/components/LegacyTierMeetingScreen.tsx`: Tier Meeting migration owner
- `src/App.tsx`: App shell owner

Checklist:
- [ ] Create `LegacyTierMeetingScreen.tsx`
- [ ] Move existing tier meeting props/data access into the new component
- [~] Replace inline JSX in `App.tsx` with component usage
- [~] Verify route behavior is unchanged

Acceptance criteria:
- `tier_meeting` still renders exactly as before
- `App.tsx` loses the inline Tier Meeting JSX block

Status:
- Partial. The inline Tier Meeting route was replaced by the new board implementation, but the old screen was not extracted as a standalone legacy component because the route was intentionally upgraded instead of preserved.

#### Issue 1.2: Extract current Action Tracker screen

Goal:
- Move the existing `action_tracker` screen into a standalone feature module without changing behavior.

Files to create:
- `src/actionTracker/components/ActionTrackerScreen.tsx`

Files to update:
- `src/App.tsx`

Ownership:
- `src/actionTracker/components/ActionTrackerScreen.tsx`: Action Tracker owner
- `src/App.tsx`: App shell owner

Checklist:
- [x] Create `ActionTrackerScreen.tsx`
- [x] Move table/kanban view rendering into the new component
- [x] Keep drawers/modals working from the parent state initially
- [x] Replace inline JSX in `App.tsx` with component usage

Acceptance criteria:
- Action Tracker route still supports table and kanban modes
- No behavior regressions in filters, create drawer, or details drawer

#### Issue 1.3: Extract shared Action Tracker types and helpers

Goal:
- Reduce coupling in `App.tsx` before integrating the board.

Files to create:
- `src/actionTracker/types.ts`
- `src/actionTracker/utils.ts`

Files to update:
- `src/App.tsx`
- `src/actionTracker/components/ActionTrackerScreen.tsx`

Ownership:
- `src/actionTracker/types.ts`: Action Tracker owner
- `src/actionTracker/utils.ts`: Action Tracker owner

Checklist:
- [x] Move `ActionTrackerRow` and related enums/types into `src/actionTracker/types.ts`
- [ ] Move helper functions like overdue/status helpers into `src/actionTracker/utils.ts`
- [x] Update imports in `App.tsx` and extracted screen

Acceptance criteria:
- Action Tracker types are no longer declared in `App.tsx`

Status:
- Mostly complete. Shared types were extracted, but helper utilities are still local to `App.tsx`.

### EPIC 2: Add a target-side tier meeting domain model

#### Issue 2.1: Add tier meeting types

Goal:
- Introduce explicit board data types in the main app.

Files to create:
- `src/tierMeeting/types.ts`

Reference inputs:
- `tier-meeting-board-advanced/src/types.ts`

Ownership:
- `src/tierMeeting/types.ts`: Tier Meeting migration owner

Checklist:
- [x] Define `TierMeetingPillar`
- [x] Define `TierMeetingKPI`
- [x] Define `TierMeetingInsight`
- [x] Define `TierMeetingActionSummary`
- [x] Define customization/layout state types

Acceptance criteria:
- Board data can be typed independently from `App.tsx`

#### Issue 2.2: Add initial tier meeting mock data

Goal:
- Seed the future board with target-side demo data.

Files to create:
- `src/tierMeeting/data/tierMeetingMockData.ts`

Reference inputs:
- `tier-meeting-board-advanced/src/data/mockData.ts`
- Existing target constants in `src/App.tsx`

Ownership:
- `src/tierMeeting/data/tierMeetingMockData.ts`: Tier Meeting migration owner

Checklist:
- [x] Create pillars for Safety, Quality, Delivery, Cost, People
- [x] Map target action tracker concepts into action summary counts
- [x] Add realistic KPI, insight, and lane metadata

Acceptance criteria:
- Board can render using target-side typed mock data

### EPIC 3: Introduce the board shell

#### Issue 3.1: Create `TierMeetingBoard` container

Goal:
- Add the new board entry component for the target route.

Files to create:
- `src/tierMeeting/components/TierMeetingBoard.tsx`

Files to update:
- `src/tierMeeting/components/LegacyTierMeetingScreen.tsx` or `src/App.tsx`

Ownership:
- `src/tierMeeting/components/TierMeetingBoard.tsx`: Tier Meeting migration owner

Checklist:
- [x] Render page header
- [x] Render a non-draggable static lane list
- [x] Use target MUI components and styling
- [x] Keep route name as `tier_meeting`

Acceptance criteria:
- The route can switch from summary page to a board shell behind a single component boundary

#### Issue 3.2: Create reusable lane shell component

Goal:
- Add one reusable lane container for all pillars.

Files to create:
- `src/tierMeeting/components/TierMeetingLane.tsx`

Reference inputs:
- `tier-meeting-board-advanced/src/components/PillarColumn.tsx`

Ownership:
- `src/tierMeeting/components/TierMeetingLane.tsx`: Tier Meeting migration owner

Checklist:
- [x] Add lane header with title
- [~] Add status control surface
- [x] Add expand action
- [x] Add footer action-summary section
- [x] Add content slot for pillar body

Acceptance criteria:
- One reusable lane component can render multiple pillar types

#### Issue 3.3: Replace legacy Tier Meeting route with board shell

Goal:
- Make the board the default Tier Meeting experience.

Files to update:
- `src/App.tsx`
- `src/tierMeeting/components/LegacyTierMeetingScreen.tsx` if retained
- `src/tierMeeting/components/TierMeetingBoard.tsx`

Ownership:
- `src/App.tsx`: App shell owner
- `src/tierMeeting/components/TierMeetingBoard.tsx`: Tier Meeting migration owner

Checklist:
- [x] Swap the route rendering to `TierMeetingBoard`
- [ ] Keep legacy screen available behind a feature flag or temporary export if needed
- [x] Verify navigation entry points still land on the correct route

Acceptance criteria:
- Opening Tier Meeting shows the new board shell

### EPIC 4: Add core board interactions

#### Issue 4.1: Add lane visibility controls

Goal:
- Let users hide/show pillars.

Files to create:
- `src/tierMeeting/hooks/useTierMeetingBoardState.ts`

Files to update:
- `src/tierMeeting/components/TierMeetingBoard.tsx`

Ownership:
- `src/tierMeeting/hooks/useTierMeetingBoardState.ts`: Tier Meeting migration owner

Checklist:
- [x] Add visible lane state
- [x] Add top-level visibility menu or control
- [x] Re-render board from visible lanes only

Acceptance criteria:
- Users can hide and restore board lanes

#### Issue 4.2: Add lane status controls

Goal:
- Support per-lane operational status.

Files to update:
- `src/tierMeeting/components/TierMeetingLane.tsx`
- `src/tierMeeting/types.ts`

Ownership:
- `src/tierMeeting/components/TierMeetingLane.tsx`: Tier Meeting migration owner

Checklist:
- [x] Define allowed lane statuses
- [ ] Add UI to set status
- [~] Reflect status visually in the header

Acceptance criteria:
- Each lane can be marked independently

Status:
- Partial. Status values exist in state and are reflected as colored header badges, but the user cannot yet change them from the UI.

#### Issue 4.3: Connect action summary clicks to Action Tracker

Goal:
- Reuse the stronger target action workflow instead of rebuilding it.

Files to update:
- `src/tierMeeting/components/TierMeetingBoard.tsx`
- `src/tierMeeting/components/TierMeetingLane.tsx`
- `src/actionTracker/components/ActionTrackerScreen.tsx`
- `src/actionTracker/types.ts`
- `src/App.tsx`

Ownership:
- Tier Meeting owner for lane click wiring
- Action Tracker owner for filtered landing behavior

Checklist:
- [x] Add pillar/category filter payload from board
- [x] Open existing Action Tracker route on click
- [x] Pre-apply lane-specific filters where feasible

Acceptance criteria:
- Clicking a lane action summary opens the target Action Tracker with relevant context

### EPIC 5: Port pillar content in vertical slices

#### Issue 5.1: Safety lane

Goal:
- Add the first operational lane with strong visual value.

Files to create:
- `src/tierMeeting/components/pillars/SafetyLaneContent.tsx`

Files to update:
- `src/tierMeeting/components/TierMeetingBoard.tsx`
- `src/tierMeeting/data/tierMeetingMockData.ts`

Reference inputs:
- `tier-meeting-board-advanced/src/components/PillarColumn.tsx`

Ownership:
- Safety/Tier Meeting owner

Checklist:
- [x] Add KPI cards
- [x] Add day-grid tracker
- [x] Add supporting summary cards
- [x] Add action-summary footer usage

Acceptance criteria:
- Safety lane is useful without expanded mode

#### Issue 5.2: Quality lane

Goal:
- Add the second operational lane using the same pattern as Safety.

Files to create:
- `src/tierMeeting/components/pillars/QualityLaneContent.tsx`

Files to update:
- `src/tierMeeting/components/TierMeetingBoard.tsx`
- `src/tierMeeting/data/tierMeetingMockData.ts`

Ownership:
- Quality/Tier Meeting owner

Checklist:
- [x] Add KPI cards
- [x] Add day-grid tracker
- [x] Add quality-specific summary cards

Acceptance criteria:
- Quality lane reaches parity with the target board pattern

#### Issue 5.3: Delivery lane

Goal:
- Add delivery KPIs and production/schedule context.

Files to create:
- `src/tierMeeting/components/pillars/DeliveryLaneContent.tsx`

Files to update:
- `src/tierMeeting/components/TierMeetingBoard.tsx`
- `src/tierMeeting/data/tierMeetingMockData.ts`

Ownership:
- Delivery/Tier Meeting owner

Checklist:
- [x] Add KPI cards
- [x] Add production or schedule module
- [x] Add action summary hookup

Acceptance criteria:
- Delivery lane supports meeting discussion about schedule and startup/changeover performance

#### Issue 5.4: Cost lane

Goal:
- Add cost and loss visibility.

Files to create:
- `src/tierMeeting/components/pillars/CostLaneContent.tsx`

Files to update:
- `src/tierMeeting/components/TierMeetingBoard.tsx`
- `src/tierMeeting/data/tierMeetingMockData.ts`

Ownership:
- Cost/Tier Meeting owner

Checklist:
- [x] Add KPI card(s)
- [x] Add chart section
- [x] Add action summary hookup

Acceptance criteria:
- Cost lane supports meeting review of scrap/downtime/cost signals

#### Issue 5.5: People lane

Goal:
- Add recognition and communications functionality.

Files to create:
- `src/tierMeeting/components/pillars/PeopleLaneContent.tsx`

Files to update:
- `src/tierMeeting/components/TierMeetingBoard.tsx`
- `src/tierMeeting/data/tierMeetingMockData.ts`

Ownership:
- People/Tier Meeting owner

Checklist:
- [x] Add recognition cards
- [x] Add communications list
- [x] Add Start Meeting CTA

Acceptance criteria:
- People lane supports team updates and launch behavior

### EPIC 6: Add lane customization

#### Issue 6.1: Add lane settings dialog

Goal:
- Let users configure lane composition.

Files to create:
- `src/tierMeeting/components/TierMeetingLaneSettingsDialog.tsx`

Files to update:
- `src/tierMeeting/components/TierMeetingLane.tsx`
- `src/tierMeeting/hooks/useTierMeetingBoardState.ts`
- `src/tierMeeting/types.ts`

Ownership:
- Tier Meeting migration owner

Checklist:
- [x] Add KPI visibility toggles
- [~] Add component visibility toggles
- [x] Add component order support
- [x] Persist settings locally

Acceptance criteria:
- Users can personalize lane structure without breaking rendering

Status:
- Mostly complete. KPI visibility, section toggles, ordering, and persistence are live. The remaining gap is that visibility toggles are still generalized and not tailored to every pillar module at reference depth.

### EPIC 7: Add expanded pillar views

#### Issue 7.1: Safety expanded view

Files to create:
- `src/tierMeeting/components/expanded/SafetyExpandedView.tsx`

Files to update:
- `src/tierMeeting/components/TierMeetingBoard.tsx`
- `src/tierMeeting/components/TierMeetingExpandedView.tsx`

Checklist:
- [x] Add full-screen or overlay drill-in
- [~] Include charts, insights, comments, and action context

#### Issue 7.2: Quality expanded view

Files to create:
- `src/tierMeeting/components/expanded/QualityExpandedView.tsx`

Files to update:
- `src/tierMeeting/components/TierMeetingExpandedView.tsx`

Checklist:
- [~] Add quality drill-in view
- [x] Reuse shared expanded view shell where possible

#### Issue 7.3: Delivery expanded view

Files to create:
- `src/tierMeeting/components/expanded/DeliveryExpandedView.tsx`

Files to update:
- `src/tierMeeting/components/TierMeetingExpandedView.tsx`

Checklist:
- [~] Add schedule/calendar-focused drill-in
- [~] Add delivery chart modules

#### Issue 7.4: Cost expanded view

Files to create:
- `src/tierMeeting/components/expanded/CostExpandedView.tsx`

Files to update:
- `src/tierMeeting/components/TierMeetingExpandedView.tsx`

Checklist:
- [~] Add downtime/scrap/cost drill-in

Acceptance criteria for Epic 7:
- Major pillars support focused drill-downs from the board

Status:
- Partial. Expanded drill-in support exists and is usable, but the individual pillar deep views have not yet reached full reference depth.

### EPIC 8: Add board layout editing

#### Issue 8.1: Add lane reordering

Goal:
- Support drag-and-drop lane order changes.

Files to update:
- `src/tierMeeting/components/TierMeetingBoard.tsx`
- `src/tierMeeting/hooks/useTierMeetingBoardState.ts`

Reference inputs:
- `tier-meeting-board-advanced/src/components/Dashboard.tsx`

Checklist:
- [x] Introduce reorderable lane list
- [x] Preserve current order in state

Acceptance criteria:
- Users can reorder lanes and the order persists in session/local state

#### Issue 8.2: Add lane resizing

Goal:
- Support adjustable lane sizes/layout.

Files to update:
- `src/tierMeeting/components/TierMeetingBoard.tsx`
- `src/tierMeeting/hooks/useTierMeetingBoardState.ts`
- optional: `src/tierMeeting/components/TierMeetingBoardGrid.tsx`

Checklist:
- [x] Introduce layout state
- [x] Add resize handles or equivalent behavior
- [x] Persist layout

Acceptance criteria:
- Users can change board layout without breaking responsiveness

### EPIC 9: Evaluate optional reference-only features

#### Issue 9.1: Decide on custom lane support

Goal:
- Decide whether `Custom` should exist in the main app.

Files to update:
- `MIGRATION_PLAN.md`
- future `src/tierMeeting/data/tierMeetingMockData.ts`

Checklist:
- [ ] Evaluate product need for a Custom lane
- [ ] Decide whether rename is needed
- [ ] Document final direction

#### Issue 9.2: Audit reference-only dummy interactions

Goal:
- Avoid migrating placeholder features that do not map to target workflows.

Files to review:
- `tier-meeting-board-advanced/src/components/*.tsx`

Checklist:
- [ ] Identify placeholder dialog buttons
- [ ] Decide which should map to real target workflows
- [ ] Drop purely decorative or dead-end reference actions

## Suggested Ownership Map

- App shell owner:
  - `src/App.tsx`
- Tier Meeting migration owner:
  - `src/tierMeeting/**`
- Action Tracker owner:
  - `src/actionTracker/**`
- Shared design/system owner:
  - Any extracted shared MUI primitives or styling helpers created during migration

## Recommended PR Sequence

1. PR 1:
   - Extract Tier Meeting
   - Extract Action Tracker
   - Move shared types/helpers
   - Status: mostly done
2. PR 2:
   - Add tier meeting types
   - Add mock data
   - Add static board shell
   - Status: done
3. PR 3:
   - Add lane shell
   - Add lane visibility and status
   - Connect action summary clicks
   - Status: mostly done
4. PR 4:
   - Safety and Quality lanes
   - Status: done
5. PR 5:
   - Delivery and Cost lanes
   - Status: done
6. PR 6:
   - People lane
   - Start Meeting behavior
   - Status: done
7. PR 7:
   - Lane settings and customization
   - Status: mostly done
8. PR 8:
   - Expanded views
   - Status: partially done
9. PR 9:
   - Layout editing and persistence
   - Status: done
10. PR 10:
   - User-facing lane status control
   - Custom lane / advanced reference-only decisions
   - Status: not started
