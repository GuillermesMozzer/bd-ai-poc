# Prototype Deep Dive 09 — Job Readiness

**Product:** BD Smart Factory / Inside Logistics (`bd-ai-poc`)  
**App Library card:** Job Readiness  
**Screen key:** `job_readiness`  
**Category:** Logistic → Production Supply  
**Live demo:** https://guillermesmozzer.github.io/bd-ai-poc/  
**Audience:** Gemini Notebook analysis (single-prototype pack)

---

## 0. Document control

| Field | Value |
|---|---|
| Prototype name | Job Readiness |
| Primary journey role | Production supply planner / warehouse lead visibility — **10-stage picking readiness** before line start |
| Happy Path position | **Outside** Lupita → Pepe → Alejandra → Gaby reactive chain |
| Editions | **Same UI** for Classic and Inside Logistics (no edition fork) |
| Spec / data alignment | `workshopDay2Data.ts` — shared **Workshop Day 2** bus with Production Alerts + Machine Material Status |
| Process map claim | **IN02** production supply · **ST26–ST43** |
| Router | `src/logistics/AppRoutesLogistics.tsx` |
| Primary file | `src/logistics/pages/JobReadinessPage.tsx` (~509 lines) |
| Visual system | Light `LogisticsPageShell` + job card grid + 560px drawer timeline |

---

## 1. Executive summary

**Job Readiness** is the **production supply picking-readiness cockpit** for El Paso demo operations.

It prototypes:

1. **Picking Dashboard** — searchable, risk-filtered grid of production jobs with readiness % bar, SLA risk pill, stage label, blocker, owner, and next action.
2. **KPI strip** — active jobs, on track / at risk / blocked-late counts, label-cage blockers, QA-blocked jobs.
3. **Detail drawer** — job card, **10-stage readiness timeline**, related alerts (with cross-nav hooks), comments, manual stage update, audit trail.
4. **Session-local mutations** — save comment and manual stage update modify in-memory clone of `workshopData` only (lost on refresh).

It is part of a **connected Day 2 trio** documented in `workshopDay2Data.ts`:

```text
Machine Material Status  ←→  Job Readiness  ←→  Production Alerts
         (LINE-03)              (JOB-DEMO-001)        (ALT-DEMO-001)
```

**Naming tension:** App Library **Job Readiness** · page title **Picking Readiness Timeline** · macroflow **IN02 Prod. Supply**.

Unlike V7 Happy Path screens, this page does **not** use `reactiveLogisticsDemo` or **Reset Demo Data**.

---

## 2. How to open this prototype

### Path A — App Library
1. Sign in.
2. Header → **apps grid**.
3. Category **Logistic**.
4. Card **Job Readiness**  
   - Subheading: *Production Supply*  
   - Description: *“10-stage picking readiness timeline and blockers for production jobs.”*

### Path B — Side navigation (Logistic)
Child **Job Readiness** → `job_readiness`.

### Path C — Logistics Control Tower (indirect)
- Macroflow card **IN02 Prod. Supply** declares `screen: 'job_readiness'` on `MacroflowDef` — maximize / metadata reference only.
- **GO TO AREA VIEW** for IN02 routes to **`wip`** area → **WIP Control Tower**, **not** Job Readiness (see §13).
- CT page 2 **RELATED · MACHINE MATERIAL STATUS** card → `machine_status` (sibling IN02 screen).

### Path D — Name map
`AppContent.tsx`: `'Job Readiness'` → `'job_readiness'`.

### Path E — Deep-link props (defined but unwired)
`JobReadinessPage` accepts `initialJobId`, `initialAlertId`, `initialMachineId`, `onNavigate` — **`AppRoutesLogistics` renders `<JobReadinessPage />` with no props**, so App Library entry never pre-selects a job or enables drawer cross-links.

### Edition / deep links
- Edition query does **not** change UI.
- No `?job=JOB-DEMO-001` URL param — selection is local React state only.

### Back navigation
Default shell → **Logistics Control Tower**.

---

## 3. Routing & architecture

```text
App Library / Nav / macroflow metadata (IN02)
        │
        ▼
screen key: job_readiness
        │
        ▼
AppRoutesLogistics.tsx  (no edition fork)
        │
        └── JobReadinessPage.tsx
                │
                ├── useState(structuredClone(workshopData))
                ├── workshopUsers (display names)
                ├── JOB_READINESS_STAGES (constants.ts labels)
                └── LogisticsDrawer (560px detail)
```

### Sibling screens (same data file)

| Screen key | Page | Shared entity |
|---|---|---|
| `production_alerts` | `ProductionAlertsPage.tsx` | `workshopData.alerts` |
| `machine_status` | `MachineStatusPage.tsx` | `workshopData.machines` |
| **`job_readiness`** | **This page** | **`workshopData.jobs`** |

Each page clones `workshopData` independently — **mutations on Job Readiness do not sync** to Alerts or Machine Status in the same session.

---

## 4. Progressive disclosure model

| Layer | What user sees | Implementation |
|---|---|---|
| L0 | KPI strip (6 tiles) | `useMemo` over `jobs` |
| L1 | Picking Dashboard grid | Search + readiness risk filter; priority sort |
| L2 | Job card summary | ReadinessBar % · SlaPill · stage · blocker · next/owner |
| L3 | Drawer: job card fields | `DetailList` |
| L4 | 10-stage timeline | Per-stage status icon, owner, expected/done, delay, notes |
| L5 | Related alerts | Links to alert ids (if `onNavigate` provided) |
| L6 | Comments + manual stage + audit | Session-local writes |

---

## 5. Personas / roles

| User id | Display name | Role in seed data |
|---|---|---|
| `USR-wh-lead` | A. Brooks — Warehouse Team Lead | Manual update actor · comment author default |
| `USR-kit-lead` | T. Rivera — Kitting Team Lead | JOB-100228 owner |
| `USR-line-lead` | M. Santos — Production Line Lead | JOB-DEMO-001 comment · JOB-100215 owner |
| `USR-mat-handler` | K. Ortiz — Material Handler | JOB-100220 owner · also **Guided Tasks** classic picker |
| `USR-planner` | J. Chen — Production Planner | JOB-DEMO-001 audit · ALT-DEMO-001 creator |
| `USR-label-cage` | P. Walsh — Label Cage Operator | JOB-DEMO-001 blocked stage owner |
| `USR-qa` | R. Patel — QA Supervisor | JOB-100234 QA blocker |

No named Happy Path persona (Lupita/Pepe/Alejandra/Gaby) on this screen.

---

## 6. Data sources

### 6.1 Used

| Source | Role |
|---|---|
| `workshopData.jobs` | Primary grid (5 jobs) |
| `workshopData.alerts` | Related alerts in drawer |
| `workshopData.as_of` | Shell timestamp `2026-07-09T15:45:00-06:00` |
| `workshopUsers` | Owner/comment/audit display names |
| `JOB_READINESS_STAGES` | Stage id → human label map |
| `READINESS_STAGE_IDS` | Canonical stage order in data file |

### 6.2 Used indirectly (same file, other pages)

| Source | Relationship |
|---|---|
| `workshopData.machines` | Drawer machine link targets `machine_status` when `onNavigate` wired |
| `demo_job_id: 'JOB-DEMO-001'` | Flagged demo anchor for connected user flow |

### 6.3 Narrative cross-links (not live-wired)

| Entity | Link |
|---|---|
| JOB-100234 / PO-100234 | Classic **Guided Tasks** TO-0709-102 · EXC-0709-005 material_not_found |
| LOT-26-0709-B | IN02 macro insight · JOB-100234 QA hold |
| LINE-03 | WIP lane “Waiting labels” · Machine Status `waiting_for_material` |
| ALT-DEMO-001 | Production Alerts priority-change story |
| K. Ortiz | Material handler here + `USR-picker-01` in classic guided tasks |

### 6.4 Not used

| Source | Note |
|---|---|
| `reactiveLogisticsDemo` | V7 Happy Path bus |
| `logisticsMockData.guided_tasks` | Separate TO-* task model |
| `logisticsMockData` CT KPIs | Macroflow IN02 KPIs from `logisticsMockData`, not workshop jobs |
| `wipMockData` | WIP Control Tower uses different lane mock |

---

## 7. Ten-stage readiness model

### Stage ids (`READINESS_STAGE_IDS` / `JOB_READINESS_STAGES`)

| # | stage_id | UI label (`constants.ts`) |
|---|---|---|
| 1 | `job_created` | Job Created |
| 2 | `batch_record_available` | Batch Record / Order Available |
| 3 | `labels_requested` | Labels Requested |
| 4 | `label_cage_prep` | Label Cage / Label Prep |
| 5 | `warehouse_preparation` | Warehouse Preparation |
| 6 | `kitting_staging` | Supermarket |
| 7 | `material_handler_assigned` | Material Handler Assigned |
| 8 | `in_transit_to_machine` | In Transit to Machine |
| 9 | `arrived_at_machine` | Arrived at Machine |
| 10 | `ready_to_run` | Ready to Run |

### Per-stage status enum

`not_started` · `in_progress` · `waiting` · `blocked` · `complete`

Timeline icon mapping in UI:

| status | Icon |
|---|---|
| complete | OK |
| blocked | ! |
| in_progress | … |
| waiting | W |
| not_started | · |

### `buildStages()` helper (data seeding)

For each job, stages before `current_stage_id` default to **complete**; at index = **in_progress** unless overridden; after = **not_started**. Jobs with rich overrides (JOB-DEMO-001) replace individual stage objects.

### Readiness % (`readiness_pct`)

**Author-seeded** per job (42, 78, 100, 25, 55) — **not computed** from stage completion count in UI.

Bar color thresholds (`readinessTone`):

| pct | tone | color |
|---|---|---|
| ≥ 90 | ok | green |
| ≥ 60 | warn | amber |
| &lt; 60 | danger | red |

### Readiness risk (`readiness_risk`)

`on_track` · `at_risk` · `late` — drives left border color on cards and **SlaPill** in grid.

Filter label **“Blocked / late”** maps to value `late` (not a separate `blocked` risk enum).

### Blocker areas (`blocker_area`)

Seed values: `label_cage` · `supermarket` · `quality_release` · null

KPI tiles count jobs where `blocker_area === 'label_cage'` (Missing labels) and `=== 'quality_release'` (QA blocked).

---

## 8. Seeded jobs (exact)

### JOB-DEMO-001 — connected demo (critical / late)

| Field | Value |
|---|---|
| PO / WO | PO-100241 · WO-88421 |
| SKU / lot | 88210 · LOT-26-0712-X |
| Machine | **Line 3 — Filling** (`LINE-03`) |
| Readiness | **42%** · risk **late** |
| Current stage | **label_cage_prep** (blocked) |
| Blocker | Missing label — Label Cage backlog |
| blocker_area | label_cage |
| Next action | Print and stage labels for LOT-26-0712-X |
| Owner | USR-label-cage |
| Required start | Jul 9, 2026 16:30 |
| Related alerts | **ALT-DEMO-001** |
| Comments | 2 (line lead + label cage) |

Blocked stage detail: delay *Label printer maintenance + queue backlog* · notes *Batch labels for LOT-26-0712-X not printed* · downstream `warehouse_preparation` = **waiting** (*Blocked by label cage*).

### JOB-100228 — supermarket short (high / at_risk)

| Field | Value |
|---|---|
| PO | PO-100228 · Line **5 — Assembly** |
| SKU / lot | 44102 · LOT-26-0710-A |
| Readiness | **78%** · at_risk |
| Stage | **kitting_staging** (in_progress) |
| Blocker | Supermarket short one component |
| blocker_area | supermarket |
| Next | Complete kit scan for component 55318 |

Linked machine LINE-05 **stopped** (feeder jam) · alert ALT-002 · ALT-005 lot_changed.

### JOB-100215 — success path (normal / on_track)

| Field | Value |
|---|---|
| PO | PO-100215 · Line **1 — Extrusion** |
| SKU / lot | 55301 · LOT-26-0708-B |
| Readiness | **100%** · on_track |
| Stage | **ready_to_run** (complete) |
| Blocker | none |
| Next | None — ready to run |

Alert ALT-004 (resolved) documents required-time advanced story.

### JOB-100234 — QA hold (high / late)

| Field | Value |
|---|---|
| PO | **PO-100234** · Line 3 — Filling (next job) |
| SKU / lot | 44102 · **LOT-26-0709-B** |
| Readiness | **25%** · late |
| Stage | **warehouse_preparation** (blocked) |
| Blocker | Material not released — QA hold |
| blocker_area | **quality_release** |
| Next | Await QA release for LOT-26-0709-B |
| Related alert | **ALT-003** material_not_released |

Cross-pack: same PO as Guided Tasks **TO-0709-102** and exception **EXC-0709-005**.

### JOB-100220 — handler waiting (normal / at_risk)

| Field | Value |
|---|---|
| PO | PO-100220 · Line **7 — Packaging** |
| SKU / lot | 11004 · LOT-26-0707-C |
| Readiness | **55%** · at_risk |
| Stage | **material_handler_assigned** (waiting) |
| Next | Material handler to pick up staged kit from K-02 |

---

## 9. UX — step-by-step

### 9.1 Page chrome

| Element | Exact |
|---|---|
| Title | **Picking Readiness Timeline** |
| Subtitle | IN02 production supply · **ST26–ST43** |
| As-of | `2026-07-09T15:45:00-06:00` |
| Panel | **Picking Dashboard** |

### 9.2 KPI strip (computed from 5 jobs)

| Label | Seed value | Tone |
|---|---|---|
| Active jobs | 5 | default |
| On track | 1 | ok |
| At risk | 2 | warn |
| Blocked / late | 2 | danger |
| Missing labels | 1 | danger |
| QA blocked | 1 | warn |

### 9.3 Filters & sort

- **Search:** job_id, production_order_id, lot, machine_name, sku (case-insensitive)
- **Readiness filter:** All · On track · At risk · Blocked / late
- **Sort:** priority `critical` → `high` → `normal`

### 9.4 Job cards

Left border color from `readiness_risk`. Critical priority adds red outer glow.

Click → opens drawer, sets `manualStage` to job’s `current_stage_id`, clears comment draft.

### 9.5 Drawer sections

1. **ReadinessBar** (large)  
2. **Job card** — batch/lot, WO, material, machine (button if `onNavigate`), blocker area, last update  
3. **Readiness timeline (10 stages)** — vertical list with status pills  
4. **Related alerts** — alert_id link + type/state (if ids in `related_alert_ids`)  
5. **Comments / blocker notes** — history + multiline field + **Save note** (appends as USR-wh-lead)  
6. **Manual status update** — dropdown of all 10 stages + **Update stage (logs audit trail)**  
7. **Audit trail** — chronological list  

Footer hint on manual update:

> Future: SAP PP, Apriso WMS, label printers

### 9.6 Manual update behavior

`updateStage()` sets:

- `current_stage_id` → selected stage  
- `last_update_at` → now ISO  
- Prepends audit: action **Manual update**, detail `Stage → {label}`, user **USR-wh-lead**

**Does not** mutate `stages[]` array statuses or recompute `readiness_pct` / `readiness_risk`.

---

## 10. Related alerts (drawer cross-reference)

| alert_id | Type | State | Job | Story |
|---|---|---|---|---|
| ALT-DEMO-001 | job_priority_changed | new | JOB-DEMO-001 | Normal → Critical · Line 3 changeover early |
| ALT-003 | material_not_released | assigned | JOB-100234 | QA blocked LOT-26-0709-B |

Other alerts exist in file but are not linked via `related_alert_ids` on jobs (except above).

---

## 11. Control Tower & macroflow relationships

### IN02 macroflow card (`macroflowModel.ts`)

| Field | Value |
|---|---|
| Label | IN02 Prod. Supply |
| Steps | ST26–ST43 |
| area | `wip` |
| screen | **`job_readiness`** |
| KPI | Supply open (from `logisticsMockData` journey heatmap) |
| Insight | Supermarket short on Line 5; kanban SLA at risk until QA releases lot LOT-26-0709-B. |

### CT navigation quirk

**GO TO AREA VIEW** uses **`area`** id, not `MacroflowDef.screen`:

- IN02 `area: 'wip'` → **WIP Control Tower**, not Job Readiness
- To open Job Readiness from CT today: App Library / side nav only (unless macro maximize UX added)

### CT page 2 WIP lens

`wip_lanes` cards reference same narrative IDs (JOB-DEMO-001 on Line 3) but click → **`wip_control_tower`**, not this page.

### CT related card

**RELATED · MACHINE MATERIAL STATUS** → `machine_status` (IN02 shop-floor board).

---

## 12. Cross-navigation design (Workshop Day 2 trio)

All three pages define:

```typescript
onNavigate?: (screen: string, id?: string) => void;
```

**Job Readiness** calls:

| Target | Argument | When |
|---|---|---|
| `'machine-status'` | `machine_id` | Machine field in drawer |
| `'production-alerts'` | `alert_id` | Related alert link |

**Gap:** `AppRoutesLogistics` never passes `onNavigate`. Drawer shows **plain text** instead of links.

**Gap:** Screen strings use **kebab-case** (`machine-status`, `production-alerts`, `job-readiness`) but `AppScreen` keys are **snake_case** (`machine_status`, etc.) — even if wired, would need mapping layer.

Intended connected demo (from data file header):

```text
Resolve ALT-DEMO-001 on Production Alerts
        → JOB-DEMO-001 stages advance (aspirational)
        → LINE-03 material_status → delivered on Machine Status
```

**Not implemented** as cross-page state sync in current codebase.

---

## 13. Relationship to Guided Tasks & Quality Release

| Link | Detail |
|---|---|
| PO-100234 | JOB-100234 blocked on QA · TO-0709-102 rm_picking · EXC-0709-005 |
| LINE-03 | Shortage widget SHORT-01 (V7) · JOB-DEMO-001 · machine waiting |
| LOT-26-0709-B | QA hold narrative — Quality Release classic queue (not auto-linked) |
| K. Ortiz | USR-mat-handler here · USR-picker-01 in classic Guided Tasks |

Pepe V7 picks (PW-9021 BD-8805-SYR) align **material SKU** with LINE-03 stories but use **different task IDs** and data bus.

---

## 14. Accessibility & localization

- English-only UI.
- Readiness timeline uses color + text icons (OK, !, …, W, ·) — not solely color-dependent.
- **StatusPill** / **SlaPill** text labels on grid.
- Job cards are click-only (no keyboard row selection).
- Manual update button is full-width contained — keyboard accessible.
- No `aria-current` on timeline stage matching `current_stage_id`.

---

## 15. Exact copy catalog (high-signal)

### App Library
- Job Readiness · Production Supply  
- 10-stage picking readiness timeline and blockers for production jobs.

### Page
- Picking Readiness Timeline  
- IN02 production supply · ST26–ST43  
- Picking Dashboard  
- Search job, PO, lot, machine…  
- All readiness / On track / At risk / Blocked / late  
- Blocker: … · **Next:** … · **Owner:** …  
- Readiness timeline (10 stages)  
- Related alerts · Comments / blocker notes · Add blocker note · Save note  
- Manual status update · Update stage (logs audit trail)  
- Future: SAP PP, Apriso WMS, label printers  
- No comments · No entries  

---

## 16. File map

| File | Responsibility |
|---|---|
| `src/logistics/pages/JobReadinessPage.tsx` | **Full UI** |
| `src/logistics/data/workshopDay2Data.ts` | Jobs, alerts, machines seed + helpers |
| `src/logistics/constants.ts` | `JOB_READINESS_STAGES` labels |
| `src/logistics/AppRoutesLogistics.tsx` | Route (no props passed) |
| `src/logistics/pages/ProductionAlertsPage.tsx` | Sibling — alerts board |
| `src/logistics/pages/MachineStatusPage.tsx` | Sibling — line material status |
| `src/logistics/cockpit/macroflowModel.ts` | IN02 → screen metadata |
| `src/logistics/pages/LogisticsControlTowerPage.tsx` | WIP lens + machine_status related card |
| `src/workstation/components/WorkstationsLibraryScreen.tsx` | App Library card |

---

## 17. Visual / interaction notes

| Aspect | Detail |
|---|---|
| Theme | Light logistics operational board |
| Accent | `LOGISTICS_ACCENT` buttons · left risk border on cards |
| Density | 3-column job grid + wide drawer |
| Interactivity | Search, filter, select job, comment, manual stage |
| Persistence | Session-only React state clone |
| No dark cockpit | Unlike Control Tower parent |

---

## 18. Demo script (recommended)

### Script A — Connected Day 2 story (JOB-DEMO-001)
1. App Library → **Job Readiness**.  
2. KPIs: Blocked/late **2**, Missing labels **1**.  
3. Open **JOB-DEMO-001** · 42% · label cage blocked.  
4. Walk timeline — note **warehouse_preparation** waiting on labels.  
5. Open **Production Alerts** (separate nav) → **ALT-DEMO-001** priority change.  
6. Open **Machine Material Status** → **LINE-03** waiting_for_material.  
7. Explain: three screens, one narrative — **no live sync** on mutations.

### Script B — QA supply chain
1. Filter **Blocked / late** → **JOB-100234**.  
2. Blocker QA hold · LOT-26-0709-B.  
3. Cross-reference **Guided Tasks** classic TO-0709-102 (PO-100234).  
4. Cross-reference CT exception **EXC-0709-005**.  
5. IN02 macro insight mentions same lot.

### Script C — Ready job contrast
1. Open **JOB-100215** · 100% · ready_to_run complete.  
2. Compare to **JOB-100228** at supermarket 78%.  

### Script D — Manual update (prototype limits)
1. Select JOB-DEMO-001 → Manual status → pick **Warehouse Preparation** → Update.  
2. Show audit trail entry · note card grid still shows old stage icons until refresh.  
3. Refresh page → manual change **lost** (not persisted).

### Script E — CT entry paths
1. **Logistics Control Tower** → IN02 card — note screen metadata vs GO TO WIP CT.  
2. Page 2 → **Machine Material Status** related card.  

---

## 19. Analysis prompts for Gemini Notebook

1. Compute `readiness_pct` from weighted stage statuses — replace seeded percentages?  
2. Wire `onNavigate` in `AppRoutesLogistics` with snake_case screen map + `initialJobId` query param.  
3. Unify `workshopDay2Data.jobs` with `logisticsMockData.guided_tasks` PO-100234 / TO-0709-102.  
4. On manual stage update, cascade `stages[]` status transitions and blocker fields.  
5. Persist workshop mutations to sessionStorage or shared React context across trio pages.  
6. IN02 **GO TO** should offer Job Readiness vs WIP CT — define product rule.  
7. Implement alert resolve → job stage advance → machine `material_status` cascade (data file intent).  
8. Map **ST26–ST43** to the 10 UI stages — identify missing SAP/Apriso integration points.  
9. Label cage blocker → integrate label printer status API (see manual update footer).  
10. Align `READINESS_STAGE_IDS` label “Supermarket” vs blocker_area `supermarket` naming.  
11. Add keyboard selection for job grid + announce readiness % changes.  
12. Should QA release on Quality Release V7/classic auto-unblock JOB-100234?  
13. Derive KPI “Missing labels” from stage `label_cage_prep` blocked vs `blocker_area` field.  
14. Priority sort vs required_start_at SLA — which wins for operator queue?  
15. Compare workshop LINE-03 vs `wip_lanes` Line 3 vs V7 `LINE-03 Filling` shortage widget — single line registry?

---

## 20. Known gaps & demo limitations

1. **Session-only state** — comments/stage updates lost on refresh.  
2. **No shared state** across Job Readiness / Alerts / Machine Status clones.  
3. **`onNavigate` unwired** — drawer cross-links render as plain text.  
4. **Kebab vs snake** screen ids in `onNavigate` strings.  
5. **Manual stage update** does not update timeline `stages[]` or readiness %.  
6. **`readiness_pct` not derived** from stage completion.  
7. **IN02 macro GO TO** lands on WIP CT, not this screen.  
8. **No URL deep-link** for job selection.  
9. **Not in V7 Happy Path** — no Reset Demo Data.  
10. **CT KPIs** use `logisticsMockData`, not workshop job counts — numbers may disagree.  
11. **Only 5 jobs** seeded vs CT “supply open” KPI from different source.  
12. **Related alerts** section empty for most jobs.  
13. **Save note** always attributes USR-wh-lead regardless of logged-in user.  
14. **No edition fork** but also no Inside Logistics persona rename (unlike Pepe/Gaby).  
15. **Job cards** not keyboard-accessible.  
16. **Completed job** JOB-100215 still listed as “active” in KPI (all jobs counted).  
17. **ALT-002/005** link to JOB-100228 but not shown in job’s `related_alert_ids`.  
18. **Future integration** copy only — no SAP PP / Apriso / printer stubs.

---

## 21. Relationship to other logistics prototypes

| Prototype | Relationship |
|---|---|
| **Production Alerts** | Sibling Day 2 screen · shared alerts · escalation chain on ALT-DEMO-001 |
| **Machine Material Status** | Sibling · machines reference `current_job_id` / `next_job_id` |
| **Logistics Control Tower** | IN02 macro · WIP page 2 lane lens · machine_status related card |
| **WIP Control Tower** | IN02 area navigation target (not this page) |
| **Guided Tasks** | PO-100234 / line pick tasks parallel narrative |
| **Quality Release** | QA hold on LOT-26-0709-B blocks JOB-100234 |
| **Guided Tasks / Line Shortage widget** | LINE-03 material stress shared story (different data buses) |
| **Happy Path V7** | Outside reactive chain |

Conceptual IN02 stack:

```text
Job created / batch record (planning)
        │
        ▼
Labels + label cage (THIS — stages 3–4)
        │
        ▼
Warehouse prep + supermarket kitting (stages 5–6)
        │
        ▼
Material handler + transit (stages 7–8)
        │
        ▼
Arrived at machine → Ready to run (stages 9–10)
        │
        ▼
Machine Material Status (line consumes material)
```

---

## 22. One-page cheat sheet

```text
OPEN: App Library → Logistic → Job Readiness
   or Nav → Job Readiness
   (NOT via IN02 GO TO AREA — that opens WIP CT)

DATA: workshopDay2Data.jobs (5 rows) · as_of 2026-07-09T15:45
NOT: reactiveLogisticsDemo, logisticsMockData.jobs

PAGE TITLE: Picking Readiness Timeline (≠ App Library "Job Readiness")

KEY JOBS:
  JOB-DEMO-001  42% late  label_cage blocked  LINE-03  ALT-DEMO-001
  JOB-100234    25% late  QA hold PO-100234     LINE-03 next
  JOB-100215   100% on_track ready_to_run
  JOB-100228    78% at_risk supermarket LINE-05
  JOB-100220    55% at_risk handler waiting LINE-07

STAGES: 10 (job_created → ready_to_run)
MUTATIONS: comments + manual stage (session only, no timeline sync)

SIBLINGS: production_alerts · machine_status (same data file, isolated clones)
MACRO: IN02 ST26–ST43 · screen job_readiness · area wip
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
| 07 | Sterilization Tracker | `sterilization_tracker` | `docs/prototypes/07_STERILIZATION_TRACKER_GEMINI_NOTEBOOK.md` |
| 08 | Guided Tasks | `guided_tasks` | `docs/prototypes/08_GUIDED_TASKS_GEMINI_NOTEBOOK.md` |
| 09 | **Job Readiness** | `job_readiness` | **this file** |
| 10 | Production Alerts (next) | `production_alerts` | *(pending)* |

Catalog overview: `LOGISTICS_PROTOTYPES_GEMINI_NOTEBOOK.md`.
