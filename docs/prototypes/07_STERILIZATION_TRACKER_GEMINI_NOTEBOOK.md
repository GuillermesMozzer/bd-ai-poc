# Prototype Deep Dive 07 — Sterilization Tracker

**Product:** BD Smart Factory / Inside Logistics (`bd-ai-poc`)  
**App Library card:** Sterilization Tracker  
**Screen key:** `sterilization_tracker`  
**Category:** Logistic → Outbound  
**Live demo:** https://guillermesmozzer.github.io/bd-ai-poc/  
**Audience:** Gemini Notebook analysis (single-prototype pack)

---

## 0. Document control

| Field | Value |
|---|---|
| Prototype name | Sterilization Tracker |
| Primary journey role | Sterilization coordinator / logistics visibility for **external provider loads** |
| Happy Path position | **Outside** Lupita → Pepe → Alejandra → Gaby reactive chain |
| Editions | **Same UI** for Classic and Inside Logistics (no edition fork) |
| Spec / data alignment | CDF Gold `logisticsMockData.sterilization_loads` + `providers` + `exceptions` (Sterilization) |
| Process map claim | **ST47–ST83** (subtitle) · macroflow **OB01 / OB02** adjacency |
| Router | `src/logistics/AppRoutesLogistics.tsx` |
| Primary file | `src/logistics/pages/SterilizationTrackerPage.tsx` (~410 lines) |
| Visual system | Light `LogisticsPageShell` + `lx` tokens · drawer lifecycle chips |

---

## 1. Executive summary

**Sterilization Tracker** is the **external sterilization load visibility board** for BD El Paso demo operations.

It prototypes:

1. **Provider Load Board** — searchable table of sterilization loads with provider, lifecycle state, pallets, ETA/SLA, documentation gaps, post-steril QA aging (7-day TAT), and SAP STO numbers.
2. **KPI strip** — in transit, at provider, cert pending, pending QA, late QA (>7d), docs missing.
3. **Sterilization Exceptions** — filtered `process_area === 'Sterilization'` from global exceptions.
4. **Document Readiness** — per-load OK/Gap list.
5. **Detail drawer** — full **15-state lifecycle** chip rail, load timeline, QA aging narrative, pallet/SAP reconciliation, provider portal / manual update (Snackbar only).

It is **read-mostly mock visibility**: search and row selection are interactive; **Log provider update (manual)** shows a prototype Snackbar with no backend write. There is **no** connection to the V7 Happy Path `reactiveLogisticsDemo` loads (`LOAD-ELP-61` / Sterigenics) — those power the **Active Loads Timeline** widget instead.

**Naming:** App Library **Sterilization Tracker** · page title **Sterilization Load Tracker** · entity type **SterilizationLoad** in drawer subtitle.

---

## 2. How to open this prototype

### Path A — App Library
1. Sign in.
2. Header → **apps grid**.
3. Category **Logistic**.
4. Card **Sterilization Tracker**  
   - Subheading: *Outbound*  
   - Description: *“External sterilization loads, documentation gaps, and 7-day QA TAT.”*

### Path B — Side navigation (Logistic)
Child **Sterilization Tracker** → `sterilization_tracker`.

### Path C — AI Home / Smart Hub
Tile **Sterilization Tracker**  
- Caption: *External steril loads and post-steril QA TAT.*  
- KPI chip: *7-day QA window*

### Path D — Logistics Control Tower / Outbound CT
- Macroflow **OB01** / **OB02** declare `screen: 'sterilization_tracker'` on `MacroflowDef`.
- **Sterilization / Outbound Control Tower** (`sterilization_outbound_control_tower`) unit cards for each `sterilization_loads` row → **GO TO UNIT VIEW →** opens `sterilization_tracker` (same page, no deep-link load id).

### Path E — Name map
`AppContent.tsx`: `'Sterilization Tracker'` → `'sterilization_tracker'`.

### Edition / deep links
- Edition query does **not** change UI.
- No `?load=SL-2026-0705` query param — selection is local React state only.

### Back navigation
Default shell → **Logistics Control Tower**.

---

## 3. Routing & architecture

```text
App Library / Nav / AI Home / Outbound CT / CT macro GO TO
        │
        ▼
screen key: sterilization_tracker
        │
        ▼
AppRoutesLogistics.tsx  (no edition fork)
        │
        └── SterilizationTrackerPage.tsx
                │
                ├── logisticsData.sterilization_loads (4 rows)
                ├── logisticsData.providers
                ├── logisticsData.exceptions (Sterilization filter)
                ├── STERILIZATION_STATES (15 lifecycle states)
                └── LogisticsDrawer (detail on row click)
```

### Parallel data universe (important)

| Data source | IDs / narrative | Used by |
|---|---|---|
| `logisticsMockData.sterilization_loads` | SL-2026-* · SteriTech / GammaMed / Sandy | **This page**, CT macro KPIs, Outbound CT units |
| `reactiveLogisticsDemo.initialLoads` | LOAD-ELP-61 · Sterigenics External · IN_TRANSIT_BACK | **ActiveLoadsTimelineWidget** (V7 dashboard) |

These are **not synchronized**. Completing Happy Path or widget timeline does **not** update SL rows on this page.

---

## 4. Progressive disclosure model

| Layer | What user sees | Implementation |
|---|---|---|
| L0 | KPI strip + as-of | `useMemo` over `loads` |
| L1 | Provider Load Board table | Search + row click |
| L2 | Exceptions + Document Readiness panels | Static lists |
| L3 | Drawer: lifecycle · timeline · QA · reconciliation · portal | `selectedId` → `LogisticsDrawer` |

No multi-step wizard — single-page board + drawer drill-down.

---

## 5. Personas / roles

| Role | How this prototype serves them |
|---|---|
| **D. Walsh — Sterilization Coordinator** (`USR-steril-coord`) | Owner on EXC-0709-003 (missing certificate) |
| Logistics / plant leadership | CT OB02 “loads at provider” / steril in-flight KPIs |
| QA supervisors | Post-steril **7-day TAT** visibility; handoff to Quality Release |
| External provider ops | Portal URL display + manual update fallback |
| FG / shipping leads | Downstream pledge impact when QA late (via linked QA inspection stories) |

No named Happy Path persona on this screen.

---

## 6. Data sources

### 6.1 Used

| Source | Role |
|---|---|
| `logisticsData.sterilization_loads` | Primary table (4 loads) |
| `logisticsData.providers` | Provider names + `portal_url` |
| `logisticsData.exceptions` | Sterilization process_area (1 seed row) |
| `logisticsData.as_of` | Shell timestamp `2026-07-09T14:30:00-06:00` |
| `STERILIZATION_STATES` (`constants.ts`) | Lifecycle chip rail (15 states) |

### 6.2 Adjacent / linked narratives (not live-wired)

| Source | Link |
|---|---|
| `qa_inspections` | QA-0708-014 references `sterilization_load_id: 'SL-2026-0705'` (late post-steril) |
| `critical_materials` | SL-2026-0712 cert pending |
| `macroflowModel` | OB02 KPIs from `sterilization_loads` + `loads_at_provider` |
| `reactiveLogisticsDemo` | Separate LOAD-ELP-61 custody widget |

### 6.3 Not used

| Source | Note |
|---|---|
| Happy Path pallets / shipments | No steril gate sync |
| ASN Portal queue | Partner ASN is upstream; different object model |
| `wipMockData` / `receivingMockData` | Not on this page |

---

## 7. Provider catalog (seed)

| provider_id | Name | portal_url |
|---|---|---|
| PROV-STER-01 | SteriTech El Paso | portal.steritech.example |
| PROV-STER-02 | GammaMed Solutions | gamma.steril.example |
| PROV-STER-03 | BD Sandy Intercompany | **null** (manual CT update copy) |

Drawer: *No portal — manual CT update with evidence* when `portal_url` is null.

---

## 8. Seeded sterilization loads (exact)

### SL-2026-0712 — certificate pending / docs gap

| Field | Value |
|---|---|
| Provider | SteriTech El Paso |
| State | **certificate_pending** |
| Product | Vacutainer SST · **12 pallets** (PLT-FG-2210, PLT-FG-2211) |
| ETA return | Jul 11, 2026 08:00 |
| SLA | **at_risk** |
| Documentation | **Missing: Sterilization certificate** |
| QA aging | — (not yet at BD QA) |
| SAP | SAP-STO-449201 |
| Exception | EXC-0709-003 missing_certificate |

### SL-2026-0705 — late post-steril QA (Mayo pledge story)

| Field | Value |
|---|---|
| Provider | GammaMed Solutions |
| State | **pending_qa_release** |
| Product | Vacutainer SST · **8 pallets** (PLT-FG-2201) |
| ETA return | — |
| SLA | **late** |
| Documentation | Complete |
| Arrived BD | Jul 7, 2026 14:00 |
| QA aging | **7.5d / 7d LATE** |
| QA reason | Past 7-day expected TAT — flag as late pending |
| SAP | SAP-STO-448890 |
| Cross-links | QA-0708-014 · quarantine hold QH-002 · OB-0709-001 pledge |

### SL-2026-0714 — inbound to provider

| Field | Value |
|---|---|
| Provider | SteriTech El Paso |
| State | **in_transit_to_provider** |
| Product | Luer-Lok Syringe · 10 pallets (PLT-FG-2230) |
| ETA return | Jul 15, 2026 10:00 |
| SLA | on_track |
| Departed BD | Jul 9, 2026 06:00 |
| Documentation | Complete |

### SL-2026-0701 — at provider (in progress)

| Field | Value |
|---|---|
| Provider | BD Sandy Intercompany (intercompany) |
| State | **sterilization_in_progress** |
| Product | Luer-Lok Syringe · 6 pallets (PLT-FG-2198) |
| ETA return | Jul 12, 2026 16:00 |
| SLA | on_track |
| Documentation | Complete |
| QA fields on row | qa_aging_days **5.2** with reason *Within 7-day TAT — expected process, not late* |

**Demo quirk:** QA aging fields appear while state is still `sterilization_in_progress` (not yet `pending_qa_release`) — useful for Gemini to flag as seed inconsistency or “early QA clock” narrative.

---

## 9. Lifecycle model (`STERILIZATION_STATES`)

15 states in order (drawer chip rail uses `humanize()` labels):

| # | state key | humanized label (approx) |
|---|---|---|
| 1 | `load_created` | Load created |
| 2 | `ready_for_pickup` | Ready for pickup |
| 3 | `picked_up` | Picked up |
| 4 | `in_transit_to_provider` | In transit to provider |
| 5 | `received_by_provider` | Received by provider |
| 6 | `sterilization_in_progress` | Sterilization in progress |
| 7 | `sterilization_completed` | Sterilization completed |
| 8 | `certificate_pending` | Certificate pending |
| 9 | `ready_for_return` | Ready for return |
| 10 | `pickup_scheduled` | Pickup scheduled |
| 11 | `in_transit_to_bd` | In transit to bd |
| 12 | `arrived_at_bd` | Arrived at bd |
| 13 | `receiving_validation` | Receiving validation |
| 14 | `pending_qa_release` | Pending qa release |
| 15 | `released` | Released |

Drawer highlights: states before current index = done styling; current = accent fill; future = muted.

### KPI “At provider” bucket

Counts loads where state matches any of:

`includes('provider')` OR  
`sterilization_in_progress` · `sterilization_completed` · `certificate_pending` · `ready_for_return` · `pickup_scheduled`

Seed count: **3** (0712, 0701, and transit-to-provider 0714 matches `provider` in string).

### KPI “In transit”

`state.includes('transit')` → seed **1** (0714; 0705 has no transit in state name).

---

## 10. Post-sterilization QA TAT (7-day rule)

Helper `isLateQa(load)`:

```text
qa_aging_days != null AND qa_aging_days > (qa_expected_tat_days ?? 7)
```

UI:
- Table column shows `{days}d / {expected}d` + **LATE** in danger color
- Drawer **Post-sterilization QA aging** section when `qa_aging_days != null`
- Copy: *When QA releases in SAP, status syncs here automatically.* (aspirational — no live SAP sync in prototype)

**Product rule (from Quality Release classic copy):** Within 7 days = on-track process; past 7 days = **late pending**, not “expected process.”

Seed late: **1** (SL-2026-0705).

---

## 11. UX — step-by-step

### 11.1 Page chrome

| Element | Exact |
|---|---|
| Title | **Sterilization Load Tracker** |
| Subtitle | External provider visibility · load lifecycle · **ST47–ST83** |
| As-of | From `logisticsData.as_of` |

### 11.2 KPI strip (computed)

| Label | Seed value | Tone |
|---|---|---|
| In transit | 1 | default |
| At provider | 3 | default |
| Cert pending | 1 | warn |
| Pending QA | 1 | warn |
| Late QA (>7d TAT) | 1 | danger |
| Docs missing | 1 | warn |

### 11.3 Provider Load Board

Search matches load id or provider name (case-insensitive).

Columns: Load ID · Provider · Status · Product family · Pallets · ETA/SLA · Documentation · QA aging · SAP shipment.

Row click → opens drawer (`selectedId`).

Status pill tone: `pending`/`certificate` → warn; `transit` → default; `released` → ok.

Documentation cell: green **Complete** chip OR red *Missing: {docs}*.

### 11.4 Bottom panels

**Sterilization Exceptions** — seed EXC-0709-003:
- Type: missing certificate · Medium
- *Sterilization certificate not received from provider*
- Next: Request cert from SteriTech
- Linked SL-2026-0712

**Document Readiness** — all 4 loads listed with OK/Gap pills.

### 11.5 Detail drawer sections

1. **Status lifecycle** — 15 chips  
2. **Load timeline** — Departed BD (if `departed_at`) · At provider · Arrived BD (if `arrived_at_bd`) · QA release Pending/—  
3. **Post-sterilization QA aging** — when qa days present  
4. **Digital load / unload reconciliation** — expected pallets · tracked IDs · SAP STO  
5. **Provider portal / manual fallback** — portal URL or manual message · **Log provider update (manual)**  
6. **Control Tower link** — copy about Exception N-26 auto-create (informational)

Snackbar on manual log:

> Manual portal update logged (prototype — no backend write).

---

## 12. Control Tower & macroflow relationships

### OB01 / OB02 (from `macroflowModel`)

| Macro | Title | Declared screen | KPI story |
|---|---|---|---|
| OB01 | Pre-Sterilization | `sterilization_tracker` | Pre-steril queue / staging |
| OB02 | Sterilization | `sterilization_tracker` | In flight / at provider · SLA risk loads |

Executive KPI **Sterilization at risk** uses `sla_risk !== 'on_track'` on loads (seed **2**: 0712, 0705).

### Sterilization / Outbound CT

Each `sterilization_loads` row becomes a unit card → navigates to **`sterilization_tracker`** (not load-specific deep link).

Outbound shipments (first 4) navigate to **`shipment_readiness`**.

---

## 13. Related widget (not this page)

**Active Loads Timeline** (`active_loads_timeline` / `ActiveLoadsTimelineWidget.tsx`):

- Reads `reactiveLogisticsDemo.getLoads()` → **LOAD-ELP-61**
- Provider label **Sterigenics External** · carrier **TX-R-4402**
- Static 5-step custody timeline (Return Transit ACTIVE)
- **Inside Logistics V7** workstation widget only

Do not conflate with SL-2026-* board on this App Library product.

---

## 14. Accessibility & localization

- English-only UI.
- Status uses **StatusPill** / **SlaPill** / **SeverityPill** text labels.
- Table rows are click-only (no keyboard row selection like V7 QA queue).
- Snackbar Alert for manual log feedback.
- Lifecycle chips are visual-only progress (no `aria-current` on state step).

---

## 15. Exact copy catalog (high-signal)

### App Library / AI Home
- Sterilization Tracker · Outbound  
- External sterilization loads, documentation gaps, and 7-day QA TAT.  
- 7-day QA window  

### Page
- Sterilization Load Tracker  
- External provider visibility · load lifecycle · ST47–ST83  
- Provider Load Board  
- Sterilization Exceptions / Document Readiness  
- Log provider update (manual)  
- Manual portal update logged (prototype — no backend write).  
- When QA releases in SAP, status syncs here automatically.  
- Delayed loads or missing docs auto-create Exception N-26 entries in Control Tower.  
- All certificates on file / Missing: …  
- No loads match search  

---

## 16. File map

| File | Responsibility |
|---|---|
| `src/logistics/pages/SterilizationTrackerPage.tsx` | **Full tracker UI** |
| `src/logistics/data/logisticsMockData.ts` | `sterilization_loads`, `providers`, exceptions |
| `src/logistics/constants.ts` | `STERILIZATION_STATES` |
| `src/logistics/AppRoutesLogistics.tsx` | Route (edition-agnostic) |
| `src/logistics/components/LogisticsPageShell.tsx` | Chrome |
| `src/logistics/components/LogisticsDrawer.tsx` | Detail drawer |
| `src/logistics/pages/SterilizationOutboundControlTowerPage.tsx` | L2 launch cards → this screen |
| `src/logistics/cockpit/macroflowModel.ts` | OB01/OB02 KPI derivation |
| `src/logistics/widgets/ActiveLoadsTimelineWidget.tsx` | **Separate** reactive load widget |
| `src/logistics/data/reactiveLogisticsDemo.ts` | LOAD-ELP-61 (not this page) |
| `src/aiHome/data.tsx` | Smart Hub tile |
| `src/workstation/components/WorkstationsLibraryScreen.tsx` | App Library card |

---

## 17. Visual / interaction notes

| Aspect | Detail |
|---|---|
| Theme | Light logistics operational board |
| Accent | `LOGISTICS_ACCENT` lifecycle active chip |
| Density | Single table + two lists + drawer |
| Interactivity | Search, row select, one Snackbar action |
| No dark cockpit | Unlike Outbound CT parent (dark L2) |

---

## 18. Demo script (recommended)

### Script A — Late QA / Mayo pledge chain
1. App Library → **Sterilization Tracker**.  
2. KPIs: Late QA **1**, Pending QA **1**.  
3. Open **SL-2026-0705** → lifecycle at **pending qa release** · **7.5d / 7d LATE**.  
4. Cross-reference: open **Quality Release (classic)** → QA-0708-014 same load · **Shipment Readiness** OB-0709-001 pledge.  

### Script B — Certificate gap / return blocked
1. Row **SL-2026-0712** · Missing Sterilization certificate.  
2. Read exception EXC-0709-003 · owner Sterilization Coordinator.  
3. Drawer → **Log provider update** → Snackbar.  

### Script C — In-flight network
1. **SL-2026-0714** in_transit_to_provider · departed timestamp.  
2. **SL-2026-0701** Sandy intercompany · no portal URL · manual fallback copy.  

### Script D — CT entry
1. **Logistics Control Tower** → Outbound tower → **Sterilization / Outbound CT**.  
2. Unit card SL-2026-0705 → GO TO UNIT VIEW → lands on same tracker (no pre-selected row unless user clicks).  

### Script E — Widget contrast (V7)
1. Open workstation **Active Loads Timeline** → LOAD-ELP-61 Sterigenics.  
2. Compare IDs/narrative to SL board — explain dual mock tracks.

---

## 19. Analysis prompts for Gemini Notebook

1. Unify `SL-2026-*` CDF loads with `LOAD-ELP-61` reactive bus — single sterilization domain model?  
2. Design deep-link `?load=SL-2026-0705` from Outbound CT unit cards.  
3. Map **ST47–ST83** to the 15 `STERILIZATION_STATES` — identify gaps.  
4. Specify provider portal integration vs manual CT fallback (PROV-STER-03 null portal).  
5. Formalize 7-day QA TAT clock start (arrival vs sampling) — fix SL-2026-0701 quirk.  
6. Wire QA release events from Quality Release V7/classic into load `state: released`.  
7. Exception N-26 auto-create — define spec behind drawer copy.  
8. Pallet reconciliation: expected vs tracked vs SAP STO validation rules.  
9. Compare SteriTech (ASN Portal narrative) vs Sterigenics (widget) naming in demos.  
10. Role-based views: coordinator vs QA vs leadership KPI subset.  
11. Accessibility: keyboard row selection + announce SLA/late QA changes.  
12. OB02 KPI `loads_at_provider: 3` vs computed at-provider bucket — reconcile definitions.  
13. Certificate_pending vs documentation_ok false — single source of truth.  
14. Multi-site rollout: provider catalog + SLA by route (D_EXTERNAL vs intercompany).  
15. When should this board write vs read-only relative to ASN Portal custody/status sections?

---

## 20. Known gaps & demo limitations

1. **Static snapshot** — no Happy Path / localStorage updates.  
2. **Dual sterilization mocks** (SL-* vs LOAD-ELP-61) confuse demos.  
3. **No deep-link** from Outbound CT cards to selected load.  
4. **Manual provider log** — Snackbar only, no queue mutation.  
5. **No SAP sync** despite copy claiming auto-sync on QA release.  
6. **Table rows** not keyboard-accessible.  
7. **Only one** Sterilization exception seeded vs multiple doc-gap loads.  
8. **SL-2026-0701** QA aging while still `sterilization_in_progress`.  
9. **Search** does not match SAP STO, pallet IDs, or product family.  
10. **State tone** heuristic is string `includes` — fragile for new states.  
11. **No edition fork** but also **no V7 reactive enrichment**.  
12. **Released** state unused in seed data (no fully closed load).  
13. **CT insight** references SL-2026-0708 typo vs seeded SL-2026-0705 (CT pack doc).  
14. **No Reset Demo Data** (nothing mutable).  
15. **Drawer timeline** sparse for loads without `departed_at` / `arrived_at_bd`.  
16. **Cannot transition** load state in UI (read-only except fake manual log).

---

## 21. Relationship to other logistics prototypes

| Prototype | Relationship |
|---|---|
| **Logistics Control Tower / Outbound CT** | OB02 KPIs · unit launch cards |
| **Quality Release** | Post-steril QA queue · SL-2026-0705 / QA-0708-014 |
| **Shipment Readiness** | Pledge blocked when QA late on linked FG |
| **ASN Portal** | SteriTech partner narrative · upstream ASN/custody (orphan sections in ASN pack) |
| **Sterilization Tracker widget (Active Loads)** | V7 reactive custody · different IDs |
| **Pallet Load Check** | FG physical config — after steril return path |
| **Happy Path (Gaby/Alejandra)** | Not wired — steril **light** uses pallet RELEASED not SL rows |

Conceptual OB02 stack:

```text
Pre-steril staging (OB01)
        │
        ▼
External provider network (THIS PROTOTYPE — SL loads)
        │
        ▼
Return + receiving validation
        │
        ▼
Post-steril QA (Quality Release) → Shipping readiness
```

---

## 22. One-page cheat sheet

```text
OPEN: App Library → Logistic → Sterilization Tracker
   or AI Home “7-day QA window”
   or Outbound CT → GO TO UNIT VIEW (steril units)

DATA: logisticsMockData.sterilization_loads (4 rows) · as_of 2026-07-09
NOT: reactiveLogisticsDemo LOAD-ELP-61 (that’s Active Loads widget)

KEY LOADS:
  SL-2026-0705 pending_qa_release · 7.5/7d LATE · Mayo pledge chain
  SL-2026-0712 certificate_pending · missing steril cert
  SL-2026-0714 in_transit_to_provider
  SL-2026-0701 Sandy intercompany · in progress

KPIs: transit 1 · at provider 3 · cert pending 1 · pending QA 1 · late QA 1 · docs missing 1
LIFECYCLE: 15 STERILIZATION_STATES in drawer
ACTION: Log provider update → Snackbar only (no write)
```

---

## 23. Cross-pack index

| # | Prototype pack | Screen key | Doc |
|---|---|---|---|
| 01 | Logistics Mobile Ops | `logistics_mobile_ops` | `docs/prototypes/01_LOGISTICS_MOBILE_OPS_GEMINI_NOTEBOOK.md` |
| 02 | Logistics Control Tower | `logistics_control_tower` | `docs/prototypes/02_LOGISTICS_CONTROL_TOWER_GEMINI_NOTEBOOK.md` |
| 03 | ASN Portal | `external_transfer_portal` | `docs/prototypes/03_ASN_PORTAL_GEMINI_NOTEBOOK.md` |
| 04 | Quality Release | `quality_release` | `docs/prototypes/04_QUALITY_RELEASE_GEMINI_NOTEBOOK.md` |
| 05 | Shipment Readiness | `shipment_readiness` | `docs/prototypes/05_SHIPMENT_READINESS_GEMINI_NOTEBOOK.md` |
| 06 | Pallet Load Check | `pallet_verification` | `docs/prototypes/06_PALLET_LOAD_CHECK_GEMINI_NOTEBOOK.md` |
| 07 | **Sterilization Tracker** | `sterilization_tracker` | **this file** |
| 08 | Guided Tasks | `guided_tasks` | `docs/prototypes/08_GUIDED_TASKS_GEMINI_NOTEBOOK.md` |
| 09 | Job Readiness | `job_readiness` | `docs/prototypes/09_JOB_READINESS_GEMINI_NOTEBOOK.md` |
| 10 | Production Alerts (next) | `production_alerts` | *(pending)* |

Catalog overview: `LOGISTICS_PROTOTYPES_GEMINI_NOTEBOOK.md`.
