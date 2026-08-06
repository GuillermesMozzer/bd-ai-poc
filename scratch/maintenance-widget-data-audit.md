# Maintenance Widget Data Consistency Audit

Scope: Maintenance widgets in the workstation dashboard compared with the Maintenance pages opened by each widget. This audit does not change UI or runtime logic.

## Executive Summary

Several Maintenance widgets use local hardcoded snapshots while their destination pages use separate local datasets, derived state, or page-level calculations. This creates a high risk of KPI drift.

Highest-risk areas:

- Maintenance Analytics: widget KPIs differ materially from Maintenance Performance page KPIs.
- CBM & PdM: widget metrics and high-risk asset list are separate from page `monitoringCards` and severity counts.
- Spare Parts Monitor: widget snapshot does not derive from Spare Parts Management work order/package/inventory calculations.
- Maintenance Hub: widget headline KPIs and attention counts do not derive from Follow Up Board lanes/filters.

Lower-risk area:

- Maintenance Calendar: widget and Planner page represent very similar May 2026 calendar data, but they duplicate it in two places and can drift.

## Widget To Page Map

| Widget | Widget source | Opens | Page source | Data status |
| --- | --- | --- | --- | --- |
| My Work Orders | `src/workstation/components/WidgetWorkOrders.tsx` | Planner Calendar | `src/Maintenance/pages/MaintenancePlannerPage.tsx` | Divergent work order dataset |
| Maintenance Hub | `src/workstation/components/MaintenanceHubWidget.tsx` | Follow Up Board | `src/Maintenance/pages/MaintenanceFollowUpBoardPage.tsx` + `src/Maintenance/data.ts` | Divergent hardcoded KPI snapshot |
| Maintenance Planner / Planner | `src/workstation/components/MaintenancePlannerWidget.tsx` | Planner Calendar | `src/Maintenance/pages/MaintenancePlannerPage.tsx` | Divergent hardcoded planning summary |
| Maintenance Calendar | `src/workstation/components/MaintenanceCalendarWidget.tsx` | Planner Calendar | `src/Maintenance/pages/MaintenancePlannerPage.tsx` | Mostly aligned content, duplicated source |
| Equipment Status | `src/workstation/components/EquipmentStatusWidget.tsx` | Equipment Ledger | `src/Maintenance/pages/EquipmentLedgerPage.tsx` | Divergent equipment status and performance snapshot |
| Maintenance Analytics | `src/workstation/components/MaintenanceAnalyticsWidget.tsx` | Performance | `src/Maintenance/pages/MaintenancePerformancePage.tsx` | Divergent metrics and values |
| CBM & PdM | `src/workstation/components/MaintenanceCbmPdmWidget.tsx` | CBM & PdM | `src/Maintenance/pages/MaintenanceCbmPdmPage.tsx` | Divergent metrics and assets |
| Spare Parts Monitor | `src/workstation/components/SparePartsMonitorWidget.tsx` | Spare Parts Management | `src/Maintenance/pages/SparePartsManagementPage.tsx` | Divergent snapshot vs calculated page state |
| Maintenance Backlog | `src/workstation/components/MyMaintenanceBacklogWidget.tsx` | Follow Up Board | `src/Maintenance/pages/MaintenanceFollowUpBoardPage.tsx` | Better aligned: derives from `maintenanceLaneData`, but still has widget-only enrichment |

## Detailed Findings

### 1. My Work Orders -> Maintenance Planner Calendar

Widget facts:

- `WidgetWorkOrders` has a local `workOrders` array with 4 work orders:
  - `WO 606034603`
  - `WO 606034604`
  - `WO 606034605`
  - `WO 606034606`
- It defaults to `Today, Jan 13` and computes:
  - Scheduled count from `assignedWorkOrders.filter(status === 'Scheduled')`.
  - High Priority count from `priority === 'Emergency' || priority === 'High'`.
  - Overdue count from `getWorkOrderDueMeta`, using reference date `2026-01-13T11:00:00`.
- It filters by `currentUserName`, but falls back to all work orders if there is no match.
- Header action says "Open Maintenance Calendar" and opens `onOpenMaintenance('calendar')`.

Page facts:

- Destination page is `MaintenancePlannerPage`.
- Planner page uses different sources:
  - `planningQueue` for queue items.
  - `initialCalendarCards` for weekly calendar work orders.
  - `monthWorkOrderMap` and `monthMaintenancePlanMap` for monthly view.
- The page's work order identifiers are mostly `PM-WO-2026-*`, `CM-WO-2026-*`, and `AM-WO-2026-*`, not the widget's `WO 60603460*` set.

Observed mismatch:

- Widget work orders are not represented in the opened Planner Calendar source data.
- Widget date scope is January 13, 2026, while Planner Calendar source data is mostly May 2026.
- Widget "Scheduled", "High Priority", and "Overdue" counts cannot be reconciled with the calendar cards visible after opening the destination page.
- The modal opened inside the widget has richer WO details, but that detail model is local to the widget and not shared with Planner, Follow Up Board, or Spare Parts.

Recommendation:

- Decide whether My Work Orders should open:
  - the Planner Calendar filtered to the same assigned/date work orders, or
  - a dedicated work-order execution/detail page.
- If it continues opening Planner Calendar, derive widget work orders from Planner page calendar cards or a shared work-order dataset.
- Align date handling so the selected widget date maps to the same calendar period on the opened page.
- Extract due/priority count rules into a shared selector.

Priority: High.

### 2. Maintenance Hub -> Follow Up Board

Widget facts:

- `maintenanceKpis`: 14 Open Requests, 8 Active WOs, 3 Overdue WOs, 5 Breakdowns.
- `needsAttention`: 3 overdue WOs, 2 waiting assignment, 1 PM overdue, 4 MRs older than 7 days.
- `recentBreakdowns` and `upcomingMaintenance` are local arrays.

Page facts:

- Follow Up Board builds lanes from `maintenanceLaneData` plus runtime state:
  - requests: `maintenanceLaneData.requests`
  - planning: runtime planning WOs + `maintenanceLaneData.team.scheduling`
  - scheduled: runtime scheduled WOs + `maintenanceLaneData.team.scheduled`
  - progress: runtime feedback WOs + `maintenanceLaneData.team.progress`
  - done: `maintenanceLaneData.review`
  - closed: rejected/closed runtime cards + `maintenanceLaneData.closed`
- The page's date filter logic marks overdue only when `card.priority === 'Emergency' || card.id === 'mr-2'`.

Observed mismatch:

- Base `maintenanceLaneData.requests` has 8 open request cards, not 14.
- Base active WOs from `team.scheduling + team.scheduled + team.progress` are 2 + 5 + 3 = 10, not 8.
- Base overdue from page filter rules appears to be 1 request (`mr-2`) plus any emergency cards in scoped lanes, not clearly 3 overdue WOs.
- Widget "Breakdowns Last 7 days" is local and not traceable to the Follow Up Board lane data.
- Widget stores filter intents in session storage, but its displayed counts are not generated by the same filter rules used by the page.

Recommendation:

- Create a shared Follow Up Board summary selector that receives the same lane inputs and filter predicates used by the page.
- Use it for:
  - widget KPIs,
  - needs-attention rows,
  - optional filtered intent counts,
  - page summary cards if/when present.
- If the desired product story is a broader operational snapshot, rename labels to include scope and do not imply direct equality with opened page rows.

Priority: High.

### 3. Maintenance Planner / Planner -> Maintenance Planner Page

Widget facts:

- Planning Queue: 11.
- Ready to Schedule: 8.
- Capacity Risk: Wed, 12 WOs queued.
- Parts Readiness: 82%, 2 PMs missing parts.
- Planning Actions: local list of 5 action rows.
- Next Maintenance Plans: local Jun 12, Jun 16, Jun 19 list.

Page facts:

- Page `planningQueue` has 8 work orders.
- Page calendar uses `initialCalendarCards` for week scheduling and `monthWorkOrderMap` / `monthMaintenancePlanMap` for the May 2026 month view.
- Page month data contains 21 work orders in `monthWorkOrderMap` and 5 maintenance plans in `monthMaintenancePlanMap`.
- Page reference dates shown in the loaded datasets are mostly May 2026, while the widget's "next plans" are Jun 2026.

Observed mismatch:

- Widget "Planning Queue 11" does not match page `planningQueue` length of 8.
- Widget "Ready to Schedule 8" might be intended to match page planning queue length, but this is not explicit.
- Widget "Wed: 12 WOs queued" does not map directly to page weekly cards from `initialCalendarCards`.
- Widget "Parts Readiness 82%" is not derived from the Planner page or Spare Parts page.
- Widget next plans use June dates while Planner page month data is May 2026.

Recommendation:

- Decide whether this widget should summarize the Planner page or a cross-page planning readiness model.
- If it summarizes Planner page, derive:
  - planning queue from `planningQueue.length`;
  - scheduled workload/capacity risk from `initialCalendarCards`;
  - next plans from `monthMaintenancePlanMap`;
  - parts readiness from a shared Spare Parts readiness selector, not a hardcoded number.
- Align dates and labels before changing values.

Priority: High.

### 4. Maintenance Calendar -> Maintenance Planner Calendar

Widget facts:

- `maintenanceCalendarEvents` contains May 2026 events and opens the Planner Calendar.
- In month mode, it builds aggregate dialogs from its own event data.

Page facts:

- Planner page has matching May 2026 source concepts:
  - `monthWorkOrderMap`
  - `monthMaintenancePlanMap`
  - `calendarBlocks`

Observed mismatch:

- Content is substantially similar, and many work order codes/dates match.
- However, the data is duplicated rather than shared.
- Widget uses event objects by day number; page uses date-keyed maps. A future edit to one side can easily drift.
- Widget has some assignee differences versus page data, for example `PM-WO-2026-309` appears as Bruno Arruda in widget and Priya Patel in the page.

Recommendation:

- Extract the May calendar event source or a normalizer into shared Maintenance calendar data.
- Have widget and page consume the same date-keyed source.
- Keep the widget's compact/interaction-only transformation local.

Priority: Medium.

### 5. Equipment Status -> Equipment Ledger

Widget facts:

- Headline: Overall Equipment Availability 87.4%, `-2.1% vs last week`.
- Metrics:
  - In Maintenance: 6.
  - Blocked: 3.
  - Critical Condition: 2.
  - Current Downtime: 11h 24m.
  - Availability %: 87.4%.
  - OEE: 81.2%.
  - Recent Status Changes: 9.
- Equipment list is local and includes Crusher CR-01, Mixer MX-07, Labeler LB-03, Compressor C-04, Pump P-101, etc.

Page facts:

- Destination page is `EquipmentLedgerPage`.
- Ledger page is asset-centric, with active hierarchy item `Syringe Assembly Machine SA-204`.
- Performance cards include:
  - Availability: 94.2%.
  - OEE: 81.6%.
  - MTBF: 412 h.
  - MTTR: 2.4 h.
  - Maint. Cost: $2.9k.
- Ledger page has `initialEvents`, future open work orders, maintenance requests, upcoming PMs, BOM, spare parts, and recommendations for the selected asset/hierarchy.

Observed mismatch:

- Widget headline availability 87.4% does not match Equipment Ledger availability 94.2%.
- Widget OEE 81.2% is close to but not equal to ledger OEE 81.6%.
- Widget equipment rows are site/fleet style, while the opened page is focused on a single asset ledger.
- Widget metrics like In Maintenance, Blocked, Critical Condition, Current Downtime, and Recent Status Changes are not calculated by the ledger page.
- Selecting a widget metric filters local widget rows, but opening the Equipment Ledger does not carry that metric/equipment context.

Recommendation:

- Decide if Equipment Status is a fleet/status widget or an asset-ledger preview.
- If it is a fleet widget, it should open an equipment list/status page, not a single asset ledger, or pass selected equipment context into the ledger.
- If it is an asset-ledger preview, derive Availability/OEE/open WO/requests/upcoming PMs from `EquipmentLedgerPage` data for the selected asset.
- Create shared selectors for:
  - equipment performance summary;
  - current equipment attention rows;
  - open work orders / requests / upcoming PM counts;
  - current downtime/status changes if those remain in scope.

Priority: High.

### 6. Maintenance Analytics -> Maintenance Performance

Widget facts:

- MTTR: 4.2h.
- MTBF: 186h.
- PM Compliance: 78%.
- Emergency Work %: 14%.
- Equipment Availability: 87.4%.
- KPI requiring attention: PM Compliance, -9% MoM.

Page facts:

- Maintenance Performance page metrics include:
  - Equipment Availability: 96.2%.
  - MTTR: 0.0h.
  - MTBF: 7.7h.
  - Preventive Maintenance Compliance (PMC): 100.0%.
  - Preventive Maintenance Overdue Ratio: 6.3%.
- Page does not appear to expose "Emergency Work %" as a top metric in the same form.

Observed mismatch:

- Directly comparable values differ:
  - Equipment Availability: widget 87.4% vs page 96.2%.
  - MTTR: widget 4.2h vs page 0.0h.
  - MTBF: widget 186h vs page 7.7h.
  - PM Compliance: widget 78% vs page PMC 100.0%.
- Widget "KPI Requiring Attention" identifies PM Compliance, while page labels PMC as good at 100.0%.
- The labels are close enough that users will assume they refer to the same metrics.

Recommendation:

- Treat this as the most urgent consistency fix.
- Either:
  - derive widget cards from the same `sections` data used by the page, or
  - explicitly scope widget metrics to a different period/equipment selection and make the page open with that same scope.
- Add tests for metric label/value extraction so page and widget cannot silently drift.

Priority: Critical.

### 7. CBM & PdM -> MaintenanceCbmPdmPage

Widget facts:

- Metrics:
  - Assets Being Monitored: 148.
  - Active Failures: 4.
  - Critical Sensor Deviations: 12.
  - High Failure Probability: 6.
  - Urgent MRs/WOs: 9.
  - Alerts Without WO: 5.
- Critical Condition Alerts: 7.
- High-risk assets list is local and includes Motor M-08, Pump P-101, Gearbox G-14, etc.

Page facts:

- Page `monitoringCards` has 17 cards.
- Page computes counts from `monitoringCards`:
  - critical: 3.
  - mediumCritical: 5.
  - lessCritical: 1.
  - normal: 8.
  - avgHealth from card health scores.
- Page filters cards by hierarchy and active tab.

Observed mismatch:

- Widget "Critical Condition Alerts 7" does not match page computed critical count of 3 or non-normal count of 9.
- Widget "Assets Being Monitored 148" is not traceable to page `monitoringCards.length` of 17.
- Widget "Active Failures 4", "Critical Sensor Deviations 12", "High Failure Probability 6", "Urgent MRs/WOs 9", and "Alerts Without WO 5" do not have direct shared calculations in the page.
- Widget high-risk assets do not match page `monitoringCards` assets.

Recommendation:

- Define a shared CBM summary model:
  - monitored assets = total cards or total unique assets, depending on intended domain meaning;
  - critical alerts = severity `critical`;
  - non-normal alerts = severity not `normal`;
  - avg health = page's existing average formula;
  - high-risk list = top cards by severity/health/daysToFailure.
- Use page `monitoringCards` or an extracted shared dataset for both widget and page.
- Keep any metrics that are not supported by page data out of the widget, or add explicit source fields.

Priority: Critical.

### 8. Spare Parts Monitor -> Spare Parts Management

Widget facts:

- KPIs:
  - Missing Parts Requests: 7.
  - PMs at Risk: 4.
  - Safety Stock Alerts: 9.
  - Reservations Pending: 5.
- Work at Risk list has 5 rows.
- Inventory at Risk list has 6 parts.

Page facts:

- Spare Parts Management builds work orders from:
  - `maintenanceLaneData.autonomous`
  - `maintenanceLaneData.team.scheduling`
  - `maintenanceLaneData.team.scheduled`
  - `maintenanceLaneData.team.progress`
  - additional local extra work orders.
- Page computes:
  - missing part request alerts from work order stock snapshots and inventory rows;
  - missing part request summary from `missingPartRequestAlerts.length`;
  - work order package status summary from `filteredWorkOrders`;
  - inventory summary from `filteredInventoryParts`;
  - planning insights as local array.

Observed mismatch:

- Widget KPIs are a standalone snapshot, not derived from page `missingPartRequestSummary`, `workOrderPackageStatusSummary`, or `inventorySummary`.
- Widget "Missing Parts Requests 7" should be checked against `missingPartRequestAlerts.length`.
- Widget "Reservations Pending 5" might correspond to page package statuses `reserved` or `awaiting-pick-up`, but not directly.
- Widget "Safety Stock Alerts 9" should derive from inventory stock state, not local list count.
- Widget "PMs at Risk 4" should derive from PM work orders with missing parts or safety stock risk, but no shared helper exists.

Recommendation:

- Extract spare parts selectors from page calculations:
  - missing part request count;
  - PMs at risk;
  - safety stock alert count;
  - reservation/pick-up pending count;
  - work at risk list;
  - inventory at risk list.
- Feed widget and page from those selectors.
- This may require moving page-local inventory/work-order mock generation into `src/Maintenance/data` or a new `src/Maintenance/sparePartsData.ts`.

Priority: High.

### 9. Maintenance Backlog -> Follow Up Board

Widget facts:

- Unlike Maintenance Hub, this widget imports `maintenanceLaneData`.
- Request KPIs derive from `maintenanceLaneData.requests`.
- Work order KPIs derive from `maintenanceLaneData.team.scheduling`.
- It enriches cards locally with request IDs, ageDays, activity type, equipment criticality, etc.

Page facts:

- Follow Up Board also consumes `maintenanceLaneData`, plus runtime state.

Observed mismatch:

- This is more coherent than the other widgets because it shares the base data source.
- Still, widget-only enrichment can diverge:
  - ageDays are calculated by index, not due/request date;
  - work orders only use `team.scheduling`, while Follow Up Board active WOs include scheduled/progress/review state;
  - overdue is based on widget index, while page overdue uses priority/id rule.

Recommendation:

- Keep this widget as a model for shared source usage, but move enrichment/filter calculations to shared helpers.
- Reuse the exact Follow Up Board date/type/assigned filters when widget opens the board with intent.

Priority: Medium.

## Proposed Adjustment Sequence

1. Add shared selector functions without changing UI:
   - `getMyWorkOrdersSummary`
   - `getFollowUpBoardSummary`
   - `getMaintenancePlannerSummary`
   - `getMaintenanceCalendarEvents`
   - `getEquipmentStatusSummary`
   - `getMaintenancePerformanceSummary`
   - `getCbmPdmSummary`
   - `getSparePartsSummary`

2. Add focused unit tests for the selectors.

3. Replace widget hardcoded KPIs with selector output.

4. Replace page duplicate calculations only after widgets are aligned, to reduce blast radius.

5. Review labels/scopes after values align:
   - "Last 7 days" vs "24h"
   - "PM Compliance" vs "Preventive Maintenance Compliance (PMC)"
   - "Critical Condition Alerts" vs "Critical" vs "Non-normal alerts"
   - "Reservations Pending" vs "Awaiting pick-up" vs "Reserved"

## Acceptance Criteria For Future Fixes

- Every widget KPI must have one of:
  - a shared selector also used by the destination page;
  - a documented distinct scope shown in the widget label and used when opening the page.
- Clicking a widget KPI/row with a filter intent must open a page state whose visible count matches that KPI.
- No widget should keep a manually typed count if the destination page has the underlying records.
- Unit tests should cover at least one happy path and one filtered/count edge case per widget family.
