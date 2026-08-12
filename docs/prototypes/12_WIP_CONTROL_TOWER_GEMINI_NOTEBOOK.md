# Prototype Deep Dive 12 — WIP Control Tower

**Product:** BD Smart Factory / Inside Logistics (`bd-ai-poc`)  
**App Library card:** WIP Control Tower  
**Screen key:** `wip_control_tower`  
**Category:** Logistic → WIP Traceability  
**Live demo:** https://guillermesmozzer.github.io/bd-ai-poc/  
**Audience:** Gemini Notebook analysis (single-prototype pack)

---

## 0. Document control

| Field | Value |
|---|---|
| Prototype name | WIP Control Tower |
| Primary journey role | WIP planner / warehouse operator / quality — **traceable WIP objects**, scan moves, genealogy, exceptions |
| Happy Path position | **Outside** Lupita → Pepe → Alejandra → Gaby reactive chain |
| Editions | **Same UI** for Classic and Inside Logistics (no edition fork) |
| Spec / data alignment | `wipMockData.ts` + `types/wip.ts` — **separate** from `workshopDay2Data` and `logisticsMockData` CT KPIs |
| Process map claim | **Level 2 · IN02 + WIP** — ST38–ST43 · supply, genealogy, exceptions |
| Router | `src/logistics/AppRoutesLogistics.tsx` |
| Primary file | `src/logistics/pages/WipControlTowerPage.tsx` (~1761 lines) |
| Visual system | Light `LogisticsPageShell` + 7 tabs + 520px drawer + dialogs |

---

## 1. Executive summary

**WIP Control Tower** is the **richest logistics prototype** in the App Library — a multi-tab operational workspace for **work-in-process traceability** across three sites.

It prototypes:

1. **Dashboard** — KPIs, aging averages, top stagnant WIP list.
2. **Inventory** — full WIP table, **Create WIP**, **Print label**.
3. **Exceptions / Actions** — WIP exceptions board + prioritized action queue.
4. **Scan / Move** — handheld-style scan workflow (find · move · stage · consume · validate).
5. **Location map** — plant zone heatmap → drill to Inventory filters.
6. **Transfers** — inter-site transfer table + receive + create from selected WIP.
7. **Planner** — material/lot/order/next-step filter board for available WIP.

**Session-local state:** `useState(structuredClone(wipMockSeed))` — create, scan, split, combine, quality actions, exception resolve, and transfer receive all mutate in-memory until refresh.

**Role simulator** in toolbar drives permission gates (Quality · Adjust · Close).

**Naming:** App Library **WIP Control Tower** · page title matches · shell banner *Drill-down from Logistics Control Tower macroflows IN02 / WIP.*

Unlike V7 Happy Path, **no Reset Demo Data** and **no `reactiveLogisticsDemo`**.

---

## 2. How to open this prototype

### Path A — App Library
1. Sign in.
2. Header → **apps grid**.
3. Category **Logistic**.
4. Card **WIP Control Tower**  
   - Subheading: *WIP Traceability*  
   - Description: *“Traceable WIP objects, genealogy, scan moves, aging, and exception actions.”*

### Path B — Side navigation (Logistic)
Child **WIP Control Tower** → `wip_control_tower`.

### Path C — AI Home / Smart Hub
Tile **WIP Control Tower**  
- Caption: *Traceable WIP objects, scan moves, genealogy, and exceptions.*  
- KPI chip: *Plant-wide WIP*

### Path D — Logistics Control Tower (primary L2 entry)

| Entry | Target |
|---|---|
| Area tower card **WIP Control Tower** | `go('wip_control_tower')` |
| Macroflow **IN02** or **WIP** → **GO TO AREA VIEW** | `area: 'wip'` → same screen |
| **Page 2** WIP lane cards (4 lines) | `go('wip_control_tower')` |

Shell banner on WIP page echoes this relationship.

### Path E — Name map
`AppContent.tsx`: `'WIP Control Tower'` → `'wip_control_tower'`.

### Edition / deep links
- Edition query does **not** change UI.
- No `?wip=WIP-EP-24001` URL param.

### Back navigation
Default shell → **Logistics Control Tower**.

---

## 3. Routing & architecture

```text
App Library / Nav / AI Home / CT area tower / CT WIP lanes / IN02+WIP GO TO
        │
        ▼
screen key: wip_control_tower
        │
        ▼
AppRoutesLogistics.tsx  (no edition fork)
        │
        └── WipControlTowerPage.tsx
                │
                ├── wipMockSeed (structuredClone)
                ├── types/wip.ts
                ├── recomputeAvailability()
                ├── role gates (canQuality / canAdjust / canClose)
                └── 7 tabs + drawer + 2 dialogs + Snackbar
```

### Data bus isolation (critical)

| Data source | Used by |
|---|---|
| **`wipMockData`** | **This page only** |
| `workshopDay2Data` | Job Readiness · Production Alerts · Machine Status |
| `logisticsMockData` | Control Tower KPIs · macroflows · wip_lanes lens |
| `reactiveLogisticsDemo` | V7 Happy Path |

CT **page 2 WIP lane cards** (`logisticsMockData.wip_lanes`) and **this page** share narrative (Line 3 blocked) but **different object models and IDs**.

---

## 4. Progressive disclosure model

| Tab | Purpose |
|---|---|
| 0 Dashboard | KPIs · filters · aging cards · stagnant list |
| 1 Inventory | Table · Create WIP · Print label · row → drawer |
| 2 Exceptions / Actions | WEX-* exceptions · WA-* action queue |
| 3 Scan / Move | Barcode workflow (max-width 520px centered) |
| 4 Location map | Zone cards by plant |
| 5 Transfers | XFER-* inter-site |
| 6 Planner | Production planner filter board |

**Drawer** (520px): status · identity · origin · location · aging · SAP/Datalan · availability rationale · genealogy (split/combine/consume) · quality actions (role-gated) · history · print/adjust/close.

---

## 5. Personas / roles (simulator)

Toolbar **Role** dropdown (`WIP_ROLES`):

| Role | Permissions |
|---|---|
| Warehouse Operator | Adjust qty · (not quality/close) |
| Production Operator | Read-mostly |
| Team Lead | Quality · Adjust · Close |
| Quality | Quality actions |
| Planner | Read + planner tab |
| Supervisor | Quality · Adjust · Close |

**Current user** seed: `K. Ortiz` (matches Guided Tasks / workshop material handler name).

History entries record `{ user, role, action, detail }` on each mutation.

---

## 6. Multi-site model

### Sites (`WIP_SITES`)

`El Paso` · `Sandy` · `Curitiba`

### WIP types by site (`WIP_TYPES_BY_SITE`)

| Site | Example types |
|---|---|
| El Paso | Assembled pens, Assembled catheters, Ampoules, Cannulas, FG semi-pack |
| Sandy | Cannulas, Extruded parts, Injected parts, Tubing WIP, Needle hubs |
| Curitiba | Injected parts, Assembled catheters, Extruded parts, Subassembly kit |

### Levels

`Level 1` · `Level 2` · `Level 3`

### Process steps (`WIP_PROCESS_STEPS`)

Assembly · Packaging · Quality · RM Warehouse · Staging · Shipping to another site · Sterilization prep · Consumption on line

---

## 7. WIP status & availability

### Status enum (`WIP_STATUSES`)

Created · Available · In Transit · Staged · Consumed · Blocked · Quarantined · Under Quality Review · Shipped · Received · Closed

### `recomputeAvailability(w)` rule

Available when **all** true:

- Status not in hold set: Blocked, Quarantined, Under Quality Review, Consumed, Closed, In Transit, Shipped  
- `quantity > 0`  
- Location matches expected (display or area)  
- `next_step` is non-empty  

Drawer **Availability rationale** shows five checks (Status OK · Quality hold · Qty · Location match · Available for next).

---

## 8. Seeded WIP objects (6)

### WIP-EP-24001 — hero staged L2 (available)

| Field | Value |
|---|---|
| Type / Level | Assembled pens · **Level 2** |
| Site | El Paso |
| Lot / Qty | LOT-26-0712-P · **480 EA** |
| Location | El Paso · Assembly · **LINE-03** · STG-A |
| Status | **Staged** · **available_for_next: true** |
| Next | Packaging → DOCK-OUT-02 |
| PO / SAP | **PO-100234** · material 12045 |
| Genealogy | Upstream WIP-EP-23988 (Cannulas) · WIP-SD-11820 (Sandy extrusion) |
| Aging loc / dwell | 6h / 8h (not stagnant) |

Cross-pack: same PO as Job Readiness JOB-100234 · workshop LINE-03 narratives.

### WIP-EP-23988 — blocked cannulas L1 (stagnant)

| Field | Value |
|---|---|
| Type | Cannulas · Level 1 |
| Status | **Blocked** |
| Qty | 20 recorded · **18 scanned** (divergence) |
| Location | Supermarket R-12 / B-04 |
| Dwell | **72h / 24h expected** (stagnant) |
| Quality | Incoming QA discrepancy |
| Owner | R. Patel (QA) |

Exceptions: WEX-001 (qty) · WEX-002 (dwell) · WEX-005 (blocked).

### WIP-SD-11820 — Sandy extrusion (transfer ready)

| Field | Value |
|---|---|
| Site | Sandy |
| Status | Available · transfer_id **XFER-SD-EP-009** |
| Next | Shipping to another site → El Paso DOCK-RM-01 |
| Datalan | DL-WIP-55210-11820 |
| Qty | 1200 EA |

### WIP-EP-24055 — wrong location ampoules

| Field | Value |
|---|---|
| Status | **Under Quality Review** |
| Location | Packaging **TEMP-CART-07** (unexpected) |
| Expected | Quality **QA-HOLD-2** |
| Qty | 2400 EA |
| Exception | WEX-003 wrong_location |
| Action | WA-01 Move to QA-HOLD-2 (critical) |

### WIP-CT-3301 — Curitiba in transit

| Field | Value |
|---|---|
| Status | **In Transit** |
| Transfer | **XFER-CT-EP-012** · SH-CT-EP-77 |
| ETA | Jul 16, 2026 10:00 |
| Qty | 300 assembled catheters |

### WIP-EP-24100 — no destination (new manual)

| Field | Value |
|---|---|
| Status | Created · **qty 0** |
| Next step/location | **empty** |
| PO | PO-100280 · LINE-05 |
| Exception | WEX-004 no_destination |
| Action | WA-04 assign destination |

---

## 9. Exceptions & action queue (seed)

### Exceptions (5)

| ID | WIP | Type | State |
|---|---|---|---|
| WEX-001 | WIP-EP-23988 | quantity_divergence | assigned |
| WEX-002 | WIP-EP-23988 | exceeded_dwell | open |
| WEX-003 | WIP-EP-24055 | wrong_location | open |
| WEX-004 | WIP-EP-24100 | no_destination | open |
| WEX-005 | WIP-EP-23988 | blocked | open |

### Action queue (6)

| ID | Priority | Title |
|---|---|---|
| WA-01 | critical | Move ampoules to QA-HOLD-2 |
| WA-02 | critical | Investigate qty divergence on cannulas |
| WA-03 | high | Quality review for release/reject |
| WA-04 | high | Assign next step for new WIP |
| WA-05 | normal | Prepare Sandy→El Paso transfer ship |
| WA-06 | normal | Reprint staging label |

---

## 10. Inter-site transfers (seed)

| transfer_id | Route | WIP | Status |
|---|---|---|---|
| XFER-SD-EP-009 | Sandy → El Paso | WIP-SD-11820 | Created |
| XFER-CT-EP-012 | Curitiba → El Paso | WIP-CT-3301 | **In Transit** |

**Receive transfer** (In Transit only): sets transfer Received · WIP site El Paso · status Received · location El Paso · Receiving · DOCK-RM-02.

**Create transfer**: requires selected WIP with `available_for_next: true`.

---

## 11. Location map zones (seed)

| zone_id | Plant | Area | WIP | Blocked | Max aging |
|---|---|---|---|---|---|
| Z-ASM | El Paso | Assembly | 2 | 0 | 18h |
| Z-SM | El Paso | Supermarket | 1 | **1** | **72h** |
| Z-PKG | El Paso | Packaging | 1 | 0 | 8h |
| Z-QA | El Paso | Quality | 0 | 0 | 0 |
| Z-SD | Sandy | Extrusion | 1 | 0 | 40h |
| Z-CT | Curitiba | Shipping | 1 | 0 | 120h |

Click zone → sets site + area filters · switches to **Inventory** tab.

---

## 12. KPI strip (computed, all sites)

| Label | Seed value |
|---|---|
| Total WIP objects | **6** |
| Blocked / quarantined | **1** |
| In transit | **1** |
| Stagnant (aging > dwell) | **1** |
| Exceptions open | **5** |
| Available for next | **2** |

Site filter in toolbar narrows KPI object set.

---

## 13. UX — key workflows

### 13.1 Create WIP (Inventory tab)

Dialog fields: Site · Type · Level · Lot · Qty · Location display · Next step · Next location · PO · Machine · Source system.

ID format: `WIP-{EP|SD|CT}-{seq}`.

If next step/location empty → auto **action queue** item + **no_destination** exception.

### 13.2 Scan / Move tab

Inputs: Barcode/WIP ID/QR · Scan location · Quantity · Confirm qty adjust checkbox.

Actions:

| Action | Effect |
|---|---|
| find | Locate WIP · open drawer |
| move | Update location · status Available if loc provided |
| stage | status → Staged |
| consume | status Consumed · qty 0 |
| validate | Scan validation without status change |

**Wrong location** → WEX auto-create + history exception.  
**Qty divergence** → exception unless confirm checkbox + canAdjust role.

### 13.3 Genealogy operations (drawer)

- **Split** — child WIP with split qty  
- **Combine** — select upstream checkboxes → new Level 2 WIP · parents Consumed  
- **Consume upstream** — mark upstream Consumed  
- **Quality actions** (role): Block · Quarantine · Under Review · Release · Reject  

### 13.4 Exception handling (tab 2)

Select exception → Assign owner + comment · **Assign** or **Resolve**.

New exceptions from scans use `WEX-{nnn}` auto-id.

### 13.5 Print label

Snackbar simulates label payload:

> Label: {wip_id} | {barcode} | {qr} | {type} | Lot {lot} | {qty} {uom} | {location}

---

## 14. Control Tower & macroflow relationships

### Area tower (`areaTowers` in macroflowModel)

| Field | Value |
|---|---|
| id | wip |
| title | WIP Control Tower |
| subtitle | IN02 + WIP · supply, lines, material readiness |
| screen | **wip_control_tower** |
| macroflows | IN02 · WIP |
| tone | danger |

### Macroflow cards

| Macro | screen on def | GO TO area |
|---|---|---|
| IN02 Prod. Supply | job_readiness | **wip** → this page |
| WIP Floor | wip_control_tower | **wip** → this page |

**Quirk:** IN02 declares `screen: 'job_readiness'` on macro card but area navigation opens **WIP CT**, not Job Readiness.

### CT KPI `wip_blocked`

Uses `logisticsMockData.wip_lanes` — not `wipMockData` counts.

---

## 15. Relationship to Workshop Day 2 & other prototypes

| Link | Detail |
|---|---|
| PO-100234 | WIP-EP-24001 · Job Readiness JOB-100234 · Guided Tasks TO-0709-102 |
| LINE-03 | WIP-EP-24001 staging at LINE-03 · Machine Status LINE-03 waiting |
| R. Patel | QA owner on WIP-EP-23988 · workshop USR-qa |
| K. Ortiz | current_user · material handler across logistics |
| Quality Release | WIP quality actions parallel classic QA hold narrative |
| ASN Portal | Inter-site transfer story adjacent to partner logistics |

**No live sync** between workshop trio and wipMockData.

---

## 16. Accessibility & localization

- English-only UI.
- StatusPill / SeverityPill text labels.
- Scan tab large barcode input (22px font).
- Table rows clickable; scan action buttons keyboard accessible.
- Role-gated sections hidden when role lacks permission (not disabled with explanation).
- Snackbar for operation feedback.

---

## 17. Exact copy catalog (high-signal)

### App Library / AI Home
- WIP Control Tower · WIP Traceability  
- Traceable WIP objects, genealogy, scan moves, aging, and exception actions.  
- Plant-wide WIP  

### Page
- WIP Control Tower  
- Level 2 · IN02 + WIP — supply, genealogy, exceptions  
- Drill-down from Logistics Control Tower macroflows IN02 / WIP.  
- Dashboard · Inventory · Exceptions / Actions · Scan / Move · Location map · Transfers · Planner  
- Create WIP · Print label · Receive transfer  
- Replenishment / availability copy in drawer  
- Location dwell exceeded expected dwell  
- Combine selected upstream → L2 · Split · Close WIP  

---

## 18. File map

| File | Responsibility |
|---|---|
| `src/logistics/pages/WipControlTowerPage.tsx` | **Full 7-tab WIP workspace** |
| `src/logistics/data/wipMockData.ts` | Seed objects, exceptions, actions, transfers, map |
| `src/logistics/types/wip.ts` | TypeScript domain model |
| `src/logistics/AppRoutesLogistics.tsx` | Route |
| `src/logistics/cockpit/macroflowModel.ts` | Area tower + IN02/WIP macro |
| `src/logistics/pages/LogisticsControlTowerPage.tsx` | L2 entry · WIP lane cards |
| `src/aiHome/data.tsx` | Smart Hub tile |
| `src/workstation/components/WorkstationsLibraryScreen.tsx` | App Library card |

---

## 19. Demo script (recommended)

### Script A — Staged pens genealogy (hero)
1. App Library → **WIP Control Tower**.  
2. Tab **Inventory** → open **WIP-EP-24001**.  
3. Walk genealogy upstream to WIP-EP-23988 (blocked) and WIP-SD-11820 (Sandy).  
4. Note PO-100234 / LINE-03 alignment with Job Readiness pack.  

### Script B — Scan wrong location
1. Tab **Scan / Move**.  
2. Enter `WIP-EP-24055` · location `El Paso · Packaging · TEMP-CART-07` · **move**.  
3. Observe warning Alert · new exception if mismatch vs expected.  

### Script C — Exception + action queue
1. Tab **Exceptions / Actions**.  
2. Select **WEX-002** exceeded dwell · assign · resolve.  
3. Click **WA-01** → opens WIP-EP-24055.  

### Script D — Inter-site receive
1. Tab **Transfers**.  
2. **XFER-CT-EP-012** → **Receive transfer**.  
3. Open WIP-CT-3301 → status Received at El Paso dock.  

### Script E — Create WIP without destination
1. **Create WIP** · El Paso · qty 100 · leave next step empty · Save.  
2. Tab Exceptions → new **no_destination** exception + action queue item.  

### Script F — CT entry
1. **Logistics Control Tower** → WIP area tower **GO TO AREA VIEW**.  
2. Compare page 2 lane card “Line 3 blocked” vs WIP-EP-23988 blocked cannulas — explain dual mocks.

### Script G — Role gates
1. Set Role **Warehouse Operator** → Quality section hidden in drawer.  
2. Switch **Quality** → Block / Release buttons appear.  

---

## 20. Analysis prompts for Gemini Notebook

1. Unify `wipMockData` with `logisticsMockData.wip_lanes` and `workshopDay2Data.machines`.  
2. Wire CT WIP lane card click → deep-link `?wip=` + pre-filter LINE-03.  
3. Persist WIP state to sessionStorage for demo continuity across refresh.  
4. Map WIP exception types to CT EXC-* and Production Alerts ALT-* — single exception bus?  
5. SAP/Datalan integration spec behind SAP / Datalan drawer sections.  
6. Formalize `recomputeAvailability` vs planner “available for next only” filter.  
7. Split/combine genealogy — regulatory traceability for medical device lots.  
8. Scan tab mobile RF layout — reuse Pepe Zebra patterns from Guided Tasks V7.  
9. IN02 macro `screen: job_readiness` vs area `wip` — product navigation fix.  
10. Transfer receive → trigger Lupita receiving checklist narrative for DOCK-RM-02.  
11. Quality Release e-sign → auto **Release** WIP from Blocked status.  
12. Stagnant KPI vs exception exceeded_dwell — single rule engine?  
13. Multi-site planner — Sandy supply feeding El Paso assembly chain demo script.  
14. Add Reset Demo Data for WIP CT parity with V7 journeys.  
15. WIP-EP-24001 → Shipment Readiness / Pallet Load Check FG chain specification.

---

## 21. Known gaps & demo limitations

1. **Isolated mock bus** — not synced with workshop Day 2 or CT KPI derivation.  
2. **No persistence** — refresh loses creates/scans/splits.  
3. **No URL deep-link** for WIP id.  
4. **CT wip_lanes** ≠ wipMockData objects (narrative overlap only).  
5. **IN02 macro screen** metadata points to Job Readiness, not this page.  
6. **Not in V7 Happy Path** — no reactiveLogisticsDemo.  
7. **Print label** — Snackbar only, no print service.  
8. **Auto-escalation** N/A (unlike Production Alerts).  
9. **Genealogy combine** consumes parents — irreversible in session without refresh.  
10. **Role simulator** does not authenticate real user.  
11. **6 seed objects** vs “plant-wide WIP” AI Home KPI implies broader scope.  
12. **Map zone counts** static — do not auto-update on create/delete.  
13. **Transfer Created** status never auto-advances to In Transit in UI.  
14. **WIP-EP-24100** qty 0 Created — edge case for availability display.  
15. **Quality Reject** button maps to Blocked status (not Closed).  
16. **Exception age_hours** seed static — not incremented live.  
17. **No edition fork** or Inside Logistics persona rename.

---

## 22. Relationship to other logistics prototypes

| Prototype | Relationship |
|---|---|
| **Logistics Control Tower** | Primary L2 parent · IN02/WIP GO TO · WIP lane lens |
| **Job Readiness** | IN02 supply timeline · PO-100234 overlap |
| **Production Alerts** | Parallel change-management · different alert IDs |
| **Machine Material Status** | LINE-03 material wait vs WIP staging |
| **Quality Release** | QA hold / release parallel to WIP quality actions |
| **Guided Tasks** | Warehouse execution · K. Ortiz persona |
| **ASN Portal** | Inter-site transfer upstream narrative |
| **Happy Path V7** | Outside reactive chain |

Logistics deep-dive series completion:

```text
Mobile Ops → CT → ASN → QA → Shipping → Pallet → Sterilization
        → Guided Tasks → Job Readiness → Alerts → Machine Status
        → WIP Control Tower (THIS — traceability capstone)
```

---

## 23. One-page cheat sheet

```text
OPEN: App Library → Logistic → WIP Control Tower
   or CT → WIP area GO TO / page 2 lane cards
   or AI Home "Plant-wide WIP"

DATA: wipMockData (6 WIP, 5 WEX, 6 WA, 2 XFER, 6 zones)
as_of: 2026-07-14T14:30 · current_user K. Ortiz

TABS: Dashboard | Inventory | Exceptions | Scan/Move | Map | Transfers | Planner

HERO: WIP-EP-24001 staged L2 LINE-03 PO-100234 (available)
BLOCKED: WIP-EP-23988 cannulas stagnant 72h/24h
TRANSIT: WIP-CT-3301 XFER-CT-EP-012

ROLE: toolbar dropdown gates Quality / Adjust / Close
MUTATIONS: session-only structuredClone state

NOT: workshopDay2Data, reactiveLogisticsDemo, logisticsMockData.wip_lanes
MACRO: IN02 + WIP area tower · ST38–ST43
```

---

## 24. Cross-pack index (Logistics series complete)

| # | Prototype pack | Screen key | Doc |
|---|---|---|---|
| 01 | Logistics Mobile Ops | `logistics_mobile_ops` | `docs/prototypes/01_LOGISTICS_MOBILE_OPS_GEMINI_NOTEBOOK.md` |
| 02 | Logistics Control Tower | `logistics_control_tower` | `docs/prototypes/02_LOGISTICS_CONTROL_TOWER_GEMINI_NOTEBOOK.md` |
| 03 | ASN Portal | `external_transfer_portal` | `docs/prototypes/03_ASN_PORTAL_GEMINI_NOTEBOOK.md` |
| 04 | Quality Release | `quality_release` | `docs/prototypes/04_QUALITY_RELEASE_GEMINI_NOTEBOOK.md` |
| 05 | Shipment Readiness | `shipment_readiness` | `docs/prototypes/05_SHIPMENT_READINESS_GEMINI_NOTEBOOK.md` |
| 06 | Pallet Load Check | `pallet_verification` | `docs/prototypes/06_PALLET_LOAD_CHECK_GEMINI_NOTEBOOK.md` |
| 07 | Sterilization Tracker | `sterilization_tracker` | `docs/prototypes/07_STERILIZATION_TRACKER_GEMINI_NOTEBOOK.md` |
| 08 | Guided Tasks | `guided_tasks` | `docs/prototypes/08_GUIDED_TASKS_GEMINI_NOTEBOOK.md` |
| 09 | Job Readiness | `job_readiness` | `docs/prototypes/09_JOB_READINESS_GEMINI_NOTEBOOK.md` |
| 10 | Production Alerts | `production_alerts` | `docs/prototypes/10_PRODUCTION_ALERTS_GEMINI_NOTEBOOK.md` |
| 11 | Machine Material Status | `machine_status` | `docs/prototypes/11_MACHINE_MATERIAL_STATUS_GEMINI_NOTEBOOK.md` |
| 12 | **WIP Control Tower** | `wip_control_tower` | **this file** |

Catalog overview: `LOGISTICS_PROTOTYPES_GEMINI_NOTEBOOK.md`.

**All 12 Logistic App Library deep dives are documented.**  
**Next:** pack **13** — V7 Workstation widgets (`13_LOGISTICS_V7_WIDGETS_GEMINI_NOTEBOOK.md`).
