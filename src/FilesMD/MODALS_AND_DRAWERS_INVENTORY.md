# Maintenance Modals and Drawers Inventory

Generated: 2026-06-28

Purpose: identify every modal, drawer, and drawer-like overlay in `src/Maintenance/` so the next pass can standardize their layout against `src/FilesMD/design.md`.

## Standardization Target

Use this as the baseline when creating the implementation plan:

- Styling-only refactor: keep labels, data, state, behavior, actions, and user flows unchanged.
- Use token aliases from `src/workstation/theme.ts` instead of hardcoded colors where possible.
- Dialogs should share a consistent shell: `background.paper`, `1px solid tokenDivider`, `borderRadius: '12px'`, clear title row, scrollable content, and action footer.
- Drawers should share a consistent right-side shell: `background.default` outer surface, `background.paper` header/footer, fixed responsive width, `1px solid tokenDivider`, scrollable body, and footer actions.
- Buttons should use `borderRadius: '8px'`, `textTransform: 'none'`, brand tokens, and no custom pill buttons unless the control is intentionally a chip/filter.
- Inner cards inside overlays should use `background.paper`, `1px solid tokenDivider`, and radius `8px` or `12px` depending on density.
- Avoid hardcoded light-only values such as `#FFFFFF`, `#F8FAFC`, `#E5EAF2`, `#CBD5E1`, and legacy `activeTheme.primary` where token aliases already exist.

## Summary

| Area | Modals / dialogs | Drawers / side panels | Popovers / menus | Notes |
|:---|---:|---:|---:|:---|
| Shared Maintenance components | 3 | 0 | 0 | Two shared overlays are named as drawers but implemented as `Dialog`. |
| Equipment Ledger | 4 | 1 | 0 | Uses inline dialogs plus `CreateWorkOrderDrawer` imported from Follow Up Board. |
| CBM / PdM | 3 | 0 | 1 | Uses dialog shells with comparatively newer token usage. |
| Follow Up Board | 6 | 4 | 1 | Highest reuse potential; exports key drawer components used by other pages. |
| Maintenance Planner | 7 | 1 | 1 | Calendar dialogs plus imported work-order drawer and month details dialog. |
| Maintenance Plan | 4 | 0 | 0 | Four inline PM plan dialogs. |
| Maintenance Performance | 2 | 0 | 0 | KPI drilldown and AI recommendations dialogs. |
| Spare Parts Management | 2 | 5 | 0 | Has local duplicate drawers plus imported Follow Up drawer. |
| Maintenance My Team | 0 | 1 | 0 | Drawer-like fixed `Box`, not MUI `Drawer`. |
| Maintenance Request Log | 0 | 0 | 0 | Under-development placeholder only. |
| Tool Crib | 0 | 0 | 0 | Under-development placeholder only. |

## Shared Components

| Surface | Type | File | Lines | Used by | Current pattern | Standardization notes |
|:---|:---|:---|:---|:---|:---|:---|
| `EquipmentSelector` picker | Dialog | `src/Maintenance/components/EquipmentSelector.tsx` | 579 | Follow Up Board, Planner, Spare Parts | Local `drawerOpen` state inside selector; MUI `Dialog`, `maxWidth="sm"`, custom `PaperProps`. | Name/behavior reads like a picker drawer, but implementation is a centered dialog. Standardize header, close button color, radius, content padding, and token aliases. |
| `InventoryPartDrawer` | Dialog | `src/Maintenance/components/InventoryPartDrawer.tsx` | 278, 300 | Follow Up Board | Named drawer, implemented as MUI `Dialog`, `maxWidth="md"`. | Align naming/behavior with the real drawer version in `SparePartsManagementPage`; replace pill action buttons with standard 8px buttons unless intentionally chip-like. |
| `MaintenanceMonthAggregateDetailsDialog` | Dialog | `src/Maintenance/components/MaintenanceMonthAggregateDetailsDialog.tsx` | 56, 70 | Planner | Shared `Dialog`, hardcoded title/content/footer colors. | Good candidate for first shared `StandardDialog` wrapper; replace hardcoded white/grey borders and card backgrounds. |

## Equipment Ledger

File: `src/Maintenance/pages/EquipmentLedgerPage.tsx`

| Surface | Type | Lines | Trigger / state | Current pattern | Standardization notes |
|:---|:---|:---|:---|:---|:---|
| Cavity map details | Dialog | 2475 | `isCavityMapDialogOpen` | Inline MUI `Dialog`, `fullWidth`, `maxWidth="lg"`. | Needs shared dialog shell, title/footer divider tokens, and consistent action footer. |
| Add molding occurrence | Dialog | 2571 | `isMoldingDialogOpen` | Inline MUI `Dialog`, `fullWidth`, `maxWidth="md"`. | Similar to cavity map, but simpler form. Good candidate to unify with molding occurrence modal below. |
| `MoldingOccurrenceModal` | Dialog | 3088, 3143 | `isModalOpen`, mode create/edit | Local component with title/content/actions and hardcoded `#F8FAFC`, `#E5EAF2`, `#FFFFFF`. | Convert to standard form-dialog layout. Keep create/edit logic unchanged. |
| `LedgerEventDetailsDialog` | Dialog | 3514, 3518 | `detailEvent` | Local component; event detail card with hardcoded content background and footer border. | Replace hardcoded surfaces and align title/content/action spacing. |
| Work order drawer | Drawer | 4184 | `isWorkOrderDrawerOpen` | Imported `CreateWorkOrderDrawer` from Follow Up Board. | Standardization should happen at exported drawer component, not in Equipment Ledger. |

## Maintenance CBM / PdM

File: `src/Maintenance/pages/MaintenanceCbmPdmPage.tsx`

| Surface | Type | Lines | Trigger / state | Current pattern | Standardization notes |
|:---|:---|:---|:---|:---|:---|
| Hierarchy picker | Menu | 839 | `anchorEl` | MUI `Menu` with custom `PaperProps`. | Not a modal/drawer, but should use overlay tokens if menu standardization is included. |
| `AddParameterMonitoringDialog` | Dialog | 1510, 1526 | `isAddParameterOpen` | Local form dialog, `maxWidth={false}`, custom width, token-heavy styling. | One of the better-aligned implementations; use as reference for form-dialog density after replacing any remaining hardcoded values. |
| `SparePartsAvailabilityDialog` | Dialog | 1734, 1750 | Inside card detail flow | Local availability dialog, custom width. | Standardize footer/action spacing and inner cards. |
| Monitoring card detail | Dialog | 2121 | `selectedCard` | Inline card detail dialog, `maxWidth={false}`, `borderRadius: '16px'`. | Decide whether large analytical details should use 12px modal radius or documented large panel radius. |

## Maintenance Follow Up Board

File: `src/Maintenance/pages/MaintenanceFollowUpBoardPage.tsx`

| Surface | Type | Lines | Trigger / state | Current pattern | Standardization notes |
|:---|:---|:---|:---|:---|:---|
| Attachment preview | Dialog | 2087 | `isAttachmentOpen` | Inline attachment dialog, `maxWidth="md"`. | Needs standard title row, close affordance, content padding. |
| `MaintenanceAiChatDrawer` | Drawer | 2232, 2439 | `isAiChatOpen` | Local right MUI `Drawer`. | Standardize drawer width, header/footer surfaces, token usage. |
| Filter panel | Popover | 2760 | `filtersAnchorEl` | MUI `Popover`. | Adjacent overlay; include if filter overlays need consistent styling. |
| `MoldingCavityCheckDialog` | Dialog | 4140, 4159 | Request detail action | Local dialog with green hardcoded header (`#F0FDF4`, `#DCFCE7`). | Replace severity-specific hardcoded shell with standard shell; keep status content inside body. |
| `MaintenanceRequestRejectDialog` | Dialog | 4901, 4924 | `isRejectDialogOpen` | Local rejection form dialog. | Align form-dialog title, body, footer, buttons. |
| `MaintenanceRequestDrawer` | Drawer | 5062, 5094 | `selectedRequestCard` | Exported right MUI `Drawer`; includes nested link and reject dialogs. | Key standard component. Also contains inline link dialog at line 5292 and reject dialog usage. |
| Link work order dialog | Dialog | 5292 | `isLinkDialogOpen` inside `MaintenanceRequestDrawer` | Inline nested dialog. | Standardize with related-work dialog because both are small selection dialogs. |
| `AssignmentSelectorDrawer` | Dialog | 5989, 6068 | `isAssignmentSelectorOpen` in work order drawer | Named drawer, implemented as `Dialog`. | Decide whether this should become a standard dialog/picker or a true drawer. |
| `RelatedWorkDialog` | Dialog | 6758, 6768 | `isRelatedWorkDialogOpen` | Local small dialog. | Use same compact-selection dialog standard as link work order. |
| `CreateWorkOrderDrawer` | Drawer | 7313, 7603 | `isWorkOrderDrawerOpen`; imported by Equipment Ledger and Planner | Exported right MUI `Drawer`, complex multi-section work-order form. | Highest-priority standardization target because it is reused across pages. Contains nested `RelatedWorkDialog`, `AssignmentSelectorDrawer`, shared `InventoryPartDrawer`, and workstation `WorkOrderDrawer`. |

## Maintenance Planner

File: `src/Maintenance/pages/MaintenancePlannerPage.tsx`

| Surface | Type | Lines | Trigger / state | Current pattern | Standardization notes |
|:---|:---|:---|:---|:---|:---|
| Imported `CreateWorkOrderDrawer` | Drawer | 2016, 6008 | Planning queue / calendar work order actions | Uses exported Follow Up Board drawer. | Standardize at source component. |
| Shared `EquipmentSelector` | Dialog | 3062 | Work order planning form | Shared selector dialog. | Standardize in shared component. |
| Filter panel | Popover | 3000 | Filter `anchorEl` | MUI `Popover`. | Adjacent overlay; include in overlay token pass if desired. |
| `MaintenanceMonthAggregateDetailsDialog` | Dialog | 3678 | Month aggregate selection | Shared component. | Standardize in shared component. |
| `CalendarRevertPlanningDialog` | Dialog | 4370, 4390 | `pendingRevertCard` | Local confirmation/reason dialog. | Standard confirmation-dialog candidate. |
| `CalendarAssignTechnicianDialog` | Dialog | 4561, 4575 | `pendingTechnicianAssignment` | Local assignment confirmation dialog. | Standard confirmation-dialog candidate. |
| `AdditionalAssigneesDialog` | Dialog | 4736, 4768 | `additionalAssigneeDialog` | Local compact selection dialog. | Align with Follow Up related/link dialogs. |
| `StaffWorkloadDialog` | Dialog | 4961, 5168 | `staffWorkloadDialog` | Local workload detail dialog. | Standard analytical-detail dialog candidate. |
| Calendar work order detail | Dialog | 6062 | Calendar selected work order/detail state | Inline dialog near calendar workspace. | Needs manual naming during refactor; not extracted. |
| `CalendarRescheduleDialog` | Dialog | 6159, 6195 | `pendingReschedule` + selected card | Local reschedule form/confirmation dialog. | Standard form-dialog candidate. |
| `CalendarDayTimelineDialog` | Dialog | 6430, 6443 | `timelineSlot` | Local timeline detail dialog. | Standard detail-dialog candidate. |

## Maintenance Plan

File: `src/Maintenance/pages/MaintenancePlan.tsx`

| Surface | Type | Lines | Trigger / state | Current pattern | Standardization notes |
|:---|:---|:---|:---|:---|:---|
| Generate work order review | Dialog | 4298 | `generateWOPlan` | Inline review dialog with custom title/content/actions. | Standard review/confirmation dialog candidate. |
| Delete/archive confirmation | Dialog | 4564 | `deleteArchivePlan` | Inline destructive confirmation dialog. | Standard confirmation dialog with warning/error tone. |
| Add maintenance item | Dialog | 4711 | `addItemPlan` | Inline form dialog. | Standard form-dialog candidate; large content body. |
| Add/edit PM plan | Dialog | 5066 | `isPlanFormOpen` from add/edit state | Inline large form dialog. | Highest priority in this page; large multi-section form needs consistent drawer-vs-dialog decision. |

## Maintenance Performance

File: `src/Maintenance/pages/MaintenancePerformancePage.tsx`

| Surface | Type | Lines | Trigger / state | Current pattern | Standardization notes |
|:---|:---|:---|:---|:---|:---|
| `AiRecommendationsDialog` | Dialog | 525, 541 | `isRecommendationsOpen` usage at 1855 | Local dialog. | Standard AI/insight dialog shell; align with BLU.AI panel rules where applicable. |
| `MaintenanceDrilldownDialog` | Dialog | 1368, 1386 | `openDrilldown` usage at 1854 | Local KPI drilldown dialog. | Standard analytical-detail dialog; preserve chart/content logic. |

## Spare Parts Management

File: `src/Maintenance/pages/SparePartsManagementPage.tsx`

| Surface | Type | Lines | Trigger / state | Current pattern | Standardization notes |
|:---|:---|:---|:---|:---|:---|
| `MissingPartRequestDrawer` | Drawer | 2155, 2210 | `activeMissingPartRequest` usage at 6203 | Local right MUI `Drawer`. | Standard form/detail drawer candidate. |
| `WorkOrderDrawer` | Drawer | 2672, 2736 | Work-order details / pick-up flow | Local right MUI `Drawer`. | Appears to overlap conceptually with Follow Up `CreateWorkOrderDrawer`; decide reuse vs local specialization. |
| Local `InventoryPartDrawer` | Drawer | 3211, 3233 | `selectedInventoryPart` usage at 5636 | Exported right MUI `Drawer`. | Duplicates shared `components/InventoryPartDrawer` name but uses Drawer instead of Dialog. Resolve naming and choose one standard surface type. |
| Local `CreateWorkOrderDrawer` | Drawer | 3661, 3718 | `isCreateWorkOrderOpen` usage at 6197 | Local right MUI `Drawer`. | Duplicates exported Follow Up `CreateWorkOrderDrawer`; compare required props before standardizing. |
| Imported `FollowUpWorkOrderDrawer` | Drawer | 6211 | `followUpWorkOrderDraft` | Imported `CreateWorkOrderDrawer` aliased from Follow Up Board. | Standardize at source component. |
| Consumption trend | Dialog | 6787 | `isConsumptionTrendOpen` | Inline MUI `Dialog`, `maxWidth="md"`, tokenized paper. | Standard analytical dialog candidate. |
| Barcode scan material | Dialog | 6952 | `isBarcodeModalOpen` | Inline MUI `Dialog`, custom scanner-like content. | Standard utility/scanner dialog; title and footer differ from form dialogs. |

## Maintenance My Team

File: `src/Maintenance/pages/MaintenanceMyTeamPage.tsx`

| Surface | Type | Lines | Trigger / state | Current pattern | Standardization notes |
|:---|:---|:---|:---|:---|:---|
| Add team member side panel | Fixed side panel | 520 | `isMaintenanceMemberDrawerOpen` | Conditional fixed-position `Box`, `zIndex: 1406`, hardcoded colors. | Treat as a non-standard drawer. Replace with shared drawer shell or MUI `Drawer` while preserving fields/actions. |

## Pages With No Modal / Drawer Surface

| Page | File | Notes |
|:---|:---|:---|
| Maintenance Request Log | `src/Maintenance/pages/MaintenanceRequestLogPage.tsx` | Placeholder page only; no modal, drawer, popover, or menu usage. |
| Tool Crib | `src/Maintenance/pages/ToolCribPage.tsx` | Placeholder page only; no modal, drawer, popover, or menu usage. |

## Main Duplication / Cleanup Opportunities

1. Create shared `StandardDialog` and `StandardDrawer` wrappers for Maintenance overlays, or extend `src/common/components/StandardDrawer.tsx` if it already matches the design system.
2. Consolidate duplicate drawer names:
   - `InventoryPartDrawer` exists in `src/Maintenance/components/InventoryPartDrawer.tsx` as a `Dialog`.
   - `InventoryPartDrawer` also exists in `SparePartsManagementPage.tsx` as a `Drawer`.
   - `CreateWorkOrderDrawer` exists in `MaintenanceFollowUpBoardPage.tsx` and `SparePartsManagementPage.tsx`.
3. Decide naming rules:
   - Use `Dialog` for centered modal workflows.
   - Use `Drawer` only for anchored side panels.
   - Rename picker dialogs currently called drawers if behavior stays centered.
4. Prioritize shared/exported overlays first:
   - `CreateWorkOrderDrawer` from Follow Up Board.
   - `MaintenanceRequestDrawer`.
   - Shared `EquipmentSelector`.
   - Shared/local `InventoryPartDrawer` conflict.
   - `MaintenanceMonthAggregateDetailsDialog`.
5. Then refactor page-local inline dialogs by category:
   - Confirmation dialogs: delete/archive, revert planning, assign technician.
   - Form dialogs: add/edit PM plan, add maintenance item, add parameter monitoring, reject request.
   - Analytical/detail dialogs: KPI drilldown, staff workload, CBM detail, month aggregate, consumption trend.
   - Utility dialogs: attachment preview, barcode scan, equipment selector.

## Suggested Refactor Order

1. Audit `src/common/components/StandardDrawer.tsx` and decide whether to add `StandardDialog` beside it.
2. Standardize the shared drawer/dialog shell components without changing any page behavior.
3. Migrate `CreateWorkOrderDrawer`, `MaintenanceRequestDrawer`, and both `InventoryPartDrawer` implementations.
4. Migrate shared `EquipmentSelector` and `MaintenanceMonthAggregateDetailsDialog`.
5. Migrate page-local dialogs in `MaintenancePlan`, then `MaintenancePlanner`, then `EquipmentLedgerPage`.
6. Finish smaller analytical and utility dialogs in `MaintenancePerformancePage`, `MaintenanceCbmPdmPage`, and `SparePartsManagementPage`.
7. Convert `MaintenanceMyTeamPage` fixed side panel into the shared drawer pattern.

