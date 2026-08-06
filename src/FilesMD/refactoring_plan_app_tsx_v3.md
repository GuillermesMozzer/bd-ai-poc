# Final Refactoring Plan: Closing the App.tsx Tech Debt

Following the successful reduction of `App.tsx` from ~11,000+ lines down to ~2,300 lines, a final phase is required to fully decouple the component and align with React best practices. While routing, layout, and several hooks have been extracted, `App.tsx` still contains substantial inline rendering, deeply nested state, and massive prop-drilling into `AppRoutes`.

The goal of this final phase is to bring `App.tsx` down to < 300 lines, where it acts strictly as the root provider and layout wrapper.

## Phase 1: Purge Obsolete Inline Screens
After checking the repository, we discovered that the actual UI components for these screens have *already been extracted* into `src/shopfloor/components` (e.g., `EquipmentChangeoverScreen.tsx`, `CiltKpisScreen.tsx`, `ManageTasksScreen.tsx`) and are correctly mapped in `AppRoutes.tsx`.

Therefore, Phase 1 only requires **deleting** the leftover dead code in `App.tsx`:
- [x] **Delete `renderCilCenterlineScreen`**: Remove this 260+ line unused function from `App.tsx`.
- [x] **Delete `renderEquipmentChangeoverScreen`**: Remove this 170+ line unused function from `App.tsx`.
- [x] **Delete `renderManageTasksScreen`**: Remove this unused function from `App.tsx`.
- [x] **Delete `renderUnderConstructionScreen`**: Remove this unused function, as `AppRoutes` has its own `UnderConstructionScreen` implementation.

## Phase 2: Decouple Remaining Feature State into Custom Hooks
Many independent feature states are still held at the top level in `App.tsx`. While some hooks like `useShiftLogbookActions` and `useTeamManagementActions` have already been created, the following hooks *must still be created* and their respective states migrated out of `App.tsx`:

- [x] **Notifications State**: Create a new `src/shopfloor/hooks/useNotificationActions.ts` to extract state (`notificationFeedSearch`, `selectedNotificationAlertId`, `resolvedNotificationAlertIds`) and derived calculations (`activeNotificationAlerts`, `notificationOwnerBreakdown`).
- [x] **Action Tracker State**: Create a new `src/actionTracker/hooks/useActionTrackerActions.ts` to extract `actionTrackerView`, `actionCreateForm`, `isActionCreateDrawerOpen`, and action filter logic.
- [x] **Shift Settings State**: Create a new `src/shiftManagement/hooks/useShiftSettingsActions.ts` to extract settings, configurations, and draft logic (`shiftConfigItems`, `holidayItems`, `shiftConfigDraft`).
- [x] **Shift Schedule State**: Extend `useTeamManagementActions.ts` or create `src/shiftManagement/hooks/useShiftScheduleActions.ts` to move `shiftReplacementOverrides`, `selectedShiftMember`, `orgChartDraft`, etc.

## Phase 3: Migrate Leftover Mock Data
A few static arrays remain in the component body.

- [x] Move `initialShiftConfigItems`, `initialHolidayItems`, `initialShiftRequestItems`, and `cilResponsibilityCards` to `src/data/mockData.ts` or to feature-specific data files (e.g., `src/shiftManagement/data.ts`).
- [x] Ensure any remaining localized types (e.g., `ShiftLogbookTicket`, `ShiftConfigItem`, `CilTaskType`) are moved to their respective `types.ts` files.

## Phase 4: Implement React Context to Resolve Prop Drilling
Currently, `App.tsx` passes over 50 props down to `AppRoutes` which then distributes them to individual screens. This creates rigid coupling and unnecessary re-renders.

- [x] **Introduce Context Providers**: Create domains for state sharing:
  - `NotificationProvider`: For alert feeds and resolution status.
  - `ActionTrackerProvider`: For action creation forms, filters, and viewing states.
  - `ShiftManagementProvider`: For shift configurations, rosters, and overrides.
  - `WorkstationProvider`: For layout keys, predefined views, and streams.
- [x] **Refactor AppRoutes**: Remove feature-specific props from `AppRoutes`. Individual screens should consume the state they need directly from the contexts.

## Phase 5: Final Logic Extraction & UI Decoupling
The final push to reach the target of < 300 lines in `App.tsx`.

- [x] **Bug Fix: Action Tracker Schema Stabilization**: Resolved mismatches between `creationDate`/`dueDate` and legacy `created`/`due` fields.
- [x] **Bug Fix: Shift Logbook Context**: Restored missing state variables (`shiftLogbookRcaNumber`, `shiftLogbookFiveWhysSteps`, etc.) to the `ShiftManagementContext`.
- [x] **Bug Fix: Action Creation Argument Mismatch**: Updated `saveActionFromDrawer` to accept a draft object, aligning UI calls with the backend logic.
- [x] **Architecture: Extract AppContent**: Moved main rendering logic and feature-driven calculations from `App.tsx` into `AppContent.tsx` to allow proper Context consumption.
- [ ] **Decouple Auth Logic**: Create `src/auth/contexts/AuthContext.tsx` to remove duplicate `useAppAuth` calls and centralize session management.
- [ ] **Implement AI Context**: Move `aiMessages`, `handleAiSend`, and AI-driven recommendations into a dedicated `AiProvider`.
- [ ] **Purge UI Helper Logic**: Move remaining helpers like `shiftEfficiency` and `teamManagementStatusStyles` into their respective feature domains or utility files.

## Conclusion
Once these steps are completed, `App.tsx` will be purely responsible for initializing Context Providers, mapping the Theme, rendering `MainLayout` / `AppErrorBoundary`, and returning `AppRoutes`. This will result in an optimal, decoupled architecture ready for long-term scalability.
