# Prototype Deep Dive 11 — Machine Material Status

**Product:** BD Smart Factory / Inside Logistics (`bd-ai-poc`)  
**App Library card:** Machine Material Status  
**Screen key:** `machine_status`  
**Category:** Logistic → Production Supply  
**Live demo:** https://guillermesmozzer.github.io/bd-ai-poc/  
**Audience:** Gemini Notebook analysis (single-prototype pack)

---

## 0. Document control

| Field | Value |
|---|---|
| Prototype name | Machine Material Status |
| Primary journey role | Line supervisor / material handler — **machine run state × material readiness** with replenishment pause/continue guidance |
| Happy Path position | **Outside** Lupita → Pepe → Alejandra → Gaby reactive chain |
| Editions | **Same UI** for Classic and Inside Logistics (no edition fork) |
| Spec / data alignment | `workshopDay2Data.ts` — shared **Workshop Day 2** bus with Job Readiness + Production Alerts |
| Process map claim | **Clean Line CT §6.4** · IN02 shop-floor material call-offs |
| Router | `src/logistics/AppRoutesLogistics.tsx` |
| Primary file | `src/logistics/pages/MachineStatusPage.tsx` (~482 lines) |
| Visual system | Light `LogisticsPageShell` + 4-column line card grid + 560px drawer |

---

## 1. Executive summary

**Machine Material Status** is the **shop-floor line board** correlating **production line state** with **material readiness** for El Paso demo operations.

It prototypes:

1. **Machine / Line board** — grid of 8 production lines with machine status pill, bags-in-line, current/next job, material-now SKU/lot, material status, ETA, handler, replenishment guidance, related alert, and job blocker snippet.
2. **KPI strip** — running, stopped, waiting for material, replenishment paused, material blocked, lines monitored.
3. **Dual filters** — machine status (5 values) · material status (7 values).
4. **Detail drawer** — machine status, material need now/next, jobs with readiness %, replenishment guidance, related alert, manual status update, details list.
5. **Session-local mutations** — manual machine status update adjusts `replenishment_action` (pause when stopped/maintenance).

It completes the **Workshop Day 2 trio** as the **line-consumer view**:

```text
Job Readiness (when material ready) → Production Alerts (change events)
        │
        ▼
Machine Material Status (THIS — line runs, waits, or pauses prep)
```

**Hero line:** **LINE-03 — Filling** — `waiting_for_material` · material **blocked** · replenishment **PAUSE** · related **ALT-DEMO-001** · current job **JOB-DEMO-001**.

**Naming:** App Library **Machine Material Status** · page title **Machine Material Status Board** · nav label matches App Library.

Unlike V7 Happy Path screens, this page does **not** use `reactiveLogisticsDemo` or **Reset Demo Data**. Production Alerts **resolve cascade** updates LINE-03 only within the Alerts page clone — opening Machine Status separately still shows seed **waiting** state.

---

## 2. How to open this prototype

### Path A — App Library
1. Sign in.
2. Header → **apps grid**.
3. Category **Logistic**.
4. Card **Machine Material Status**  
   - Subheading: *Production Supply*  
   - Description: *“Line run state versus material readiness with pause/continue guidance.”*

### Path B — Side navigation (Logistic)
Child **Machine Material Status** → `machine_status`.

### Path C — Logistics Control Tower (direct)
**Page 2 (WIP lane lens)** → card **RELATED · MACHINE MATERIAL STATUS** → `go('machine_status')`.

Copy on card:

> Open shop-floor board for clean-line bags, readiness %, and material call-offs (IN02).

### Path D — Production Alerts (narrative)
After resolving ALT-DEMO-001 on Production Alerts, caption suggests **Open LINE-03** — requires `onNavigate` wiring (not active from App Library).

### Path E — Name map
`AppContent.tsx`: `'Machine Material Status'` → `'machine_status'`.

### Deep-link props (defined but unwired)
`MachineStatusPage` accepts `initialMachineId`, `initialJobId`, `initialAlertId`, `onNavigate` — **`AppRoutesLogistics` renders `<MachineStatusPage />` with no props**.

### Edition / URL
- Edition query does **not** change UI.
- No `?line=LINE-03` query param.

### Back navigation
Default shell → **Logistics Control Tower**.

---

## 3. Routing & architecture

```text
App Library / Nav / CT page 2 related card
        │
        ▼
screen key: machine_status
        │
        ▼
AppRoutesLogistics.tsx  (no edition fork)
        │
        └── MachineStatusPage.tsx
                │
                ├── useState(structuredClone(workshopData))
                ├── workshopData.machines (8 lines)
                ├── joins: jobs[], alerts[] for drawer/card enrichment
                └── LogisticsDrawer (560px)
```

### Workshop Day 2 trio

| Screen key | View | Resolves cascade into machines |
|---|---|---|
| `job_readiness` | Pick timeline | No |
| `production_alerts` | Alert triage | **Yes** (ALT-DEMO-001 → LINE-03 in Alerts clone only) |
| **`machine_status`** | **Line board** | **Displays** machine rows (read-mostly + manual update) |

---

## 4. Progressive disclosure model

| Layer | What user sees | Implementation |
|---|---|---|
| L0 | KPI strip (6 tiles) | `useMemo` over `machines` |
| L1 | Line card grid | Dual filters |
| L2 | Card summary | status top border · jobs · material now · replenishment chip |
| L3 | Drawer: machine + material now | Status pill · WO · blocker |
| L4 | Material need — next | Next SKU/lot · ETA |
| L5 | Jobs section | Current readiness % · next job lot |
| L6 | Replenishment guidance | Pause vs continue copy + handler |
| L7 | Related alert + manual update | Alert link · status dropdown |

---

## 5. Personas / roles

| User id | Display name | Role on board |
|---|---|---|
| `USR-mat-handler` | K. Ortiz — Material Handler | Handler on LINE-01, LINE-05, LINE-07, LINE-08 |
| `USR-line-lead` | M. Santos — Production Line Lead | Escalation / job comments (via linked jobs) |
| `USR-wh-lead` | A. Brooks — Warehouse Team Lead | Replenishment pause decisions (narrative) |
| `USR-label-cage` | P. Walsh — Label Cage Operator | Blocker on LINE-03 via labels |

Shop-floor supervisor persona is **implicit** — no named chip on page chrome.

---

## 6. Data sources

### 6.1 Used

| Source | Role |
|---|---|
| `workshopData.machines` | Primary grid (8 lines) |
| `workshopData.jobs` | Current/next job enrichment · readiness % · main_blocker |
| `workshopData.alerts` | `related_alert_id` lookup |
| `workshopData.as_of` | Shell `2026-07-09T15:45:00-06:00` |
| `workshopUsers` | Material handler display names |

### 6.2 Machine status enum (`MACHINE_STATUSES`)

| status | Card top border tone |
|---|---|
| `running` | ok green |
| `stopped` | danger red |
| `waiting_for_material` | warn amber |
| `changeover` | LOGISTICS_ACCENT blue |
| `maintenance` | gray `#94A3B8` |

### 6.3 Material status enum (filter + display)

`delivered` · `in_transit` · `staged` · `blocked` · `not_requested` · `requested` · `picked`

Displayed via `humanize(material_status)`.

### 6.4 Replenishment action

`continue` → card chip **Continue prep** (green soft bg)  
`pause` → **PAUSE prep** (red soft bg)

Auto-rule on manual update: `stopped` or `maintenance` → `replenishment_action: 'pause'`, else `'continue'`.

### 6.5 Not used

| Source | Note |
|---|---|
| `logisticsMockData.wip_lanes` | CT WIP lens uses different mock (4 lanes) |
| `reactiveLogisticsDemo` | V7 Happy Path |
| `wipMockData` | WIP Control Tower separate product |

### 6.6 CT WIP lane parallel (narrative only)

| CT `wip_lanes` | Workshop `machines` |
|---|---|
| Line 3 — Filling · blocked | LINE-03 waiting_for_material |
| Line 5 — Assembly · waiting | LINE-05 stopped |
| Line 1 — Molding · running | LINE-01 running |
| Line 2 — Assembly · running | LINE-02 changeover (different name/area) |

**Not synchronized** — different arrays, different job id labels on Line 2.

---

## 7. Seeded machines (all 8)

### LINE-03 — hero / demo line (waiting · blocked)

| Field | Value |
|---|---|
| Name | Line 3 — Filling |
| Area | Filling Hall |
| Status | **waiting_for_material** |
| Current job | **JOB-DEMO-001** (WO-88421) |
| Next job | **JOB-100234** |
| Material now | 88210 · LOT-26-0712-X · Medical-grade PP resin |
| material_status | **blocked** |
| Blocker | Labels not ready — Label Cage |
| eta_material_need_min | **0** (Need in 0m) |
| Replenishment | **pause** |
| Handler | unassigned |
| Related alert | **ALT-DEMO-001** |
| bags_in_line | 0 |

### LINE-01 — running / delivered

| Field | Value |
|---|---|
| Status | running |
| Job | JOB-100215 |
| Material | 55301 · LOT-26-0708-B · Sterile barrier film |
| material_status | delivered |
| eta | 120 min (2h) |
| Replenishment | continue |
| Handler | K. Ortiz |
| bags_in_line | 14 |

### LINE-05 — stopped / staged

| Field | Value |
|---|---|
| Status | **stopped** |
| Job | JOB-100228 |
| Material | 44102 · LOT-26-0710-A · Catalyst additive |
| material_status | staged |
| Replenishment | **pause** |
| Related alert | **ALT-002** (feeder jam) |
| Handler | K. Ortiz |
| bags_in_line | 3 |

### LINE-07 — running / in_transit

| Field | Value |
|---|---|
| Status | running |
| Job | JOB-100220 |
| Material now | 11004 · LOT-26-0707-C · Pre-sterilized component kit |
| Material next | 55318 · — · Carton insert |
| material_status | in_transit |
| eta | 15 min |
| Replenishment | continue |
| bags_in_line | 8 |

### LINE-02 — changeover

| Field | Value |
|---|---|
| Status | changeover |
| Current job | — |
| Next job | JOB-100228 |
| Material next | 44102 · LOT-26-0710-A |
| material_status | not_requested |
| eta | 90 min |
| Replenishment | continue |
| bags_in_line | 0 |

### LINE-04 — maintenance

| Field | Value |
|---|---|
| Status | **maintenance** |
| Blocker | Maintenance until 18:00 |
| material_status | not_requested |
| Replenishment | **pause** |
| bags_in_line | 0 |

### LINE-06 — running / requested

| Field | Value |
|---|---|
| Status | running |
| Material | 12045 · LOT-26-0705-FG · Vacutainer SST |
| material_status | requested |
| eta | 45 min |
| WO | WO-88500 (current_work_order_id) |
| bags_in_line | 22 |

### LINE-08 — running / picked

| Field | Value |
|---|---|
| Status | running |
| Material next | 55301 · LOT-26-0708-C · Sterile barrier film |
| material_status | picked |
| eta | 60 min |
| Handler | K. Ortiz |
| bags_in_line | 11 |

---

## 8. KPI strip (computed from seed)

| Label | Seed value | Tone |
|---|---|---|
| Running | **4** | ok |
| Stopped | **1** | danger |
| Waiting for material | **1** | warn |
| Replenishment paused | **3** | default |
| Material blocked | **1** | warn |
| Lines monitored | **8** | default |

Paused lines: LINE-03, LINE-05, LINE-04.

---

## 9. UX — step-by-step

### 9.1 Page chrome

| Element | Exact |
|---|---|
| Title | **Machine Material Status Board** |
| Subtitle | Machine status × material readiness · **Clean Line CT §6.4** |
| Panel | **Machine / Line board** |
| Filters | All machine status · All material status |

### 9.2 Line cards

Grid: 1 → 2 → 3 → 4 columns by breakpoint.

Top **3px border** encodes machine status color.

Card body fields:
- Machine name + StatusPill  
- Area · **bags in line** count  
- Current job (link if `onNavigate`) · Next job  
- Material now SKU · lot · description  
- Material status humanized · **Need in {fmtDuration}** when eta set  
- Handler name when assigned  
- **material_blocker** in danger text  
- Replenishment chip PAUSE / Continue  
- Related alert id (link if `onNavigate`)  
- Job blocker from joined job row  

Click card → opens drawer.

### 9.3 Drawer sections

1. **Machine status** — pill · work order · last update  
2. **Material need — now** — SKU/lot/desc · status · blocker  
3. **Material need — next** — or *None scheduled* · ETA  
4. **Jobs** — current (readiness % · blocker) · next (+ lot)  
5. **Replenishment guidance** — pause/continue sentence · handler  
6. **Related alert** — when `related_alert_id` set  
7. **Manual update** — status dropdown · **Update machine status**  
8. **Details** — machine id · area · bags · replenishment  

Replenishment copy examples:

- Machine stopped — **Pause warehouse preparation**  
- **Continue preparing material**

### 9.4 Manual update behavior

`updateMachineStatus()`:

- Sets `status` to selected value  
- Sets `replenishment_action` to `pause` if status is `stopped` or `maintenance`, else `continue`  
- Updates `last_update_at` to now ISO  

**Does not** update `material_status`, jobs, or alerts.

---

## 10. Cross-navigation design

When `onNavigate` provided:

| Trigger | Target | Id |
|---|---|---|
| Current job (card/drawer) | `'job-readiness'` | job_id |
| Related alert (card/drawer) | `'production-alerts'` | alert_id |

**AppRoutesLogistics** does not pass `onNavigate` — plain text IDs in App Library mode.

Screen strings use **kebab-case**; AppScreen keys are **snake_case** — mapping required if wired.

---

## 11. Production Alerts resolve cascade (sibling)

When **ALT-DEMO-001** is resolved on Production Alerts **in same page session**, `machines` array in that clone updates LINE-03:

| Field | After resolve |
|---|---|
| status | running |
| material_status | staged |
| material_blocker | null |
| replenishment_action | continue |
| related_alert_id | null |

**Machine Status page** opened independently still shows seed **waiting_for_material / blocked** until manual update or shared state bus implemented.

---

## 12. Control Tower relationships

### Direct entry
CT **page 2** → **RELATED · MACHINE MATERIAL STATUS** → `machine_status` (**only CT card that opens this screen directly**).

### WIP lane lens (same page)
Four `wip_lanes` cards → `wip_control_tower` (not this screen).

### IN02 macroflow
IN02 declares `screen: 'job_readiness'` · insight mentions Line 5 supermarket — conceptual alignment, not navigation to Machine Status.

### Six Big KPIs
No dedicated cockpit KPI tile for machine material status — use page KPI strip instead.

---

## 13. Relationship to Job Readiness & Production Alerts

| Link | Detail |
|---|---|
| JOB-DEMO-001 | LINE-03 current job · 42% readiness · label cage blocker |
| JOB-100234 | LINE-03 next job · QA hold · ALT-003 |
| ALT-DEMO-001 | LINE-03 related_alert_id |
| ALT-002 | LINE-05 stopped narrative |
| K. Ortiz | Handler on multiple lines · also classic Guided Tasks picker |

Recommended **Workshop Day 2** demo (explain clone gap):

1. Machine Status → LINE-03 waiting  
2. Production Alerts → resolve ALT-DEMO-001  
3. Return to Machine Status → **still waiting** (separate clone)  
4. Manual update LINE-03 to running on this page to simulate recovery  

---

## 14. Accessibility & localization

- English-only UI.
- StatusPill text labels for machine status.
- Material/replenishment state uses text + background chips (not color-only).
- Cards click-only — no keyboard grid navigation.
- Manual update button full-width — keyboard accessible.
- `fmtDuration` provides readable ETA strings (e.g. `15m`, `2h`).

---

## 15. Exact copy catalog (high-signal)

### App Library
- Machine Material Status · Production Supply  
- Line run state versus material readiness with pause/continue guidance.

### Page
- Machine Material Status Board  
- Machine status × material readiness · Clean Line CT §6.4  
- Machine / Line board  
- All machine status · All material status  
- {N} bags in line  
- Current job / Next job · Material now · Material: … · Need in …  
- Replenishment: **PAUSE prep** / **Continue prep**  
- Job blocker: …  
- Material need — now / next · None scheduled  
- Replenishment guidance · Pause warehouse preparation · Continue preparing material  
- Handler: Unassigned  
- Update machine status  
- ProductionLine · {machine_id}  

### Control Tower
- RELATED · MACHINE MATERIAL STATUS  
- Open shop-floor board for clean-line bags, readiness %, and material call-offs (IN02).

---

## 16. File map

| File | Responsibility |
|---|---|
| `src/logistics/pages/MachineStatusPage.tsx` | **Full line board UI** |
| `src/logistics/data/workshopDay2Data.ts` | `machines` seed + jobs/alerts joins |
| `src/logistics/AppRoutesLogistics.tsx` | Route (no props) |
| `src/logistics/pages/JobReadinessPage.tsx` | Sibling — job timeline |
| `src/logistics/pages/ProductionAlertsPage.tsx` | Sibling · resolve cascade source |
| `src/logistics/pages/LogisticsControlTowerPage.tsx` | Page 2 related card → this screen |
| `src/logistics/utils.ts` | `fmtDuration`, `humanize`, `fmtTime` |
| `src/workstation/components/WorkstationsLibraryScreen.tsx` | App Library card |

---

## 17. Visual / interaction notes

| Aspect | Detail |
|---|---|
| Theme | Light shop-floor grid |
| Status encoding | Top border color + StatusPill |
| Density | Up to 4 columns · compact captions |
| Interactivity | Dual filters · card select · manual status |
| Persistence | Session React state only |
| bags_in_line | Clean-line WIP bags metric (§6.4 reference) |

---

## 18. Demo script (recommended)

### Script A — Hero line LINE-03
1. App Library → **Machine Material Status**.  
2. KPIs: Waiting **1** · Material blocked **1** · Replenishment paused **3**.  
3. Open **LINE-03 — Filling**.  
4. Read blocker *Labels not ready — Label Cage* · job JOB-DEMO-001 · alert ALT-DEMO-001.  
5. Cross-reference **Job Readiness** JOB-DEMO-001 (separate nav).

### Script B — Stop + replenishment pause
1. Card **LINE-05** stopped · staged material · ALT-002.  
2. Drawer replenishment: **Pause warehouse preparation**.  
3. Link narrative to Production Alerts ALT-002 · TO-0709-104 paused.

### Script C — Running lines with ETA
1. **LINE-07** in_transit · need in 15m · next material 55318.  
2. **LINE-01** delivered · 14 bags · 2h until next need.

### Script D — Manual update
1. Select LINE-04 maintenance → drawer → set status **running** → Update.  
2. Note replenishment flips to **continue** automatically.

### Script E — Control Tower entry
1. **Logistics Control Tower** → page 2 → **RELATED · MACHINE MATERIAL STATUS**.  
2. Lands on this board — compare WIP lane cards above (different navigation target).

### Script F — Resolve cascade gap
1. Resolve ALT-DEMO-001 on Production Alerts.  
2. Open Machine Status fresh → LINE-03 still **waiting** — explain isolated clones.

---

## 19. Analysis prompts for Gemini Notebook

1. Implement `WorkshopDay2Provider` so Production Alerts resolve updates this board live.  
2. Wire `onNavigate` + `?line=LINE-03` deep link from CT WIP lane cards.  
3. Unify `wip_lanes` (CT) with `workshopData.machines` — single line registry.  
4. Should manual status update also patch `material_status` / clear `material_blocker`?  
5. Auto-sync replenishment pause when related alert state changes (ALT-002).  
6. Define **bags_in_line** data source — MES vs manual count for Clean Line CT.  
7. Material status state machine: blocked → staged → delivered transitions.  
8. Handler assignment workflow — claim line from board.  
9. Mobile shop-floor layout — one line per swipe vs grid.  
10. Integrate V7 **Line Shortage Risk** widget bins with LINE-03 material_needed_now SKU.  
11. Next-job queue visualization when `next_job_id` set (LINE-03 → JOB-100234).  
12. Compare LINE-06 material 12045 to Quality Release / Sterilization FG narratives.  
13. KPI “Replenishment paused” — tie to alert severity?  
14. Andon / line-side display mode (fullscreen single line).  
15. After JOB-DEMO-001 readiness hits 100%, what should LINE-03 status become?

---

## 20. Known gaps & demo limitations

1. **Isolated state clone** — no sync from Production Alerts resolve cascade.  
2. **`onNavigate` unwired** — job/alert links are plain text from App Library.  
3. **Kebab-case** screen ids vs AppScreen snake_case.  
4. **Manual update** does not patch material_status or blockers.  
5. **No URL deep-link** for machine id.  
6. **Not in V7 Happy Path** — no Reset Demo Data.  
7. **CT wip_lanes** disagree with workshop machines (Line 2 naming, job ids).  
8. **8 lines** vs 4 WIP lane cards on CT — different coverage.  
9. **Refresh loses** manual status changes.  
10. **Cards** not keyboard-accessible.  
11. **eta_material_need_min: 0** on LINE-03 displays “Need in 0m” — edge case UX.  
12. **LINE-06/08** have `current_job_id: null` but show material_needed_now — aspirational pre-positioning.  
13. **No audit trail** on manual machine updates (unlike Job Readiness stage log).  
14. **Work order** shown but not linkable to external MES.  
15. **Related alert** only when `related_alert_id` set — ALT-003 on LINE-03 next job not surfaced on LINE-03 card.  
16. **No macroflow** tile dedicated to machine_status (only CT related card).

---

## 21. Relationship to other logistics prototypes

| Prototype | Relationship |
|---|---|
| **Job Readiness** | Upstream supply timeline · readiness % in drawer |
| **Production Alerts** | Change events · resolve cascade target (LINE-03) |
| **Logistics Control Tower** | Page 2 direct launch card |
| **WIP Control Tower** | Adjacent WIP lens on CT page 2 (different mock) |
| **Guided Tasks** | Material handler K. Ortiz · replenishment tasks |
| **Quality Release** | JOB-100234 / LOT-26-0709-B QA block on next job |
| **Line Shortage Risk widget** | V7 LINE-03 SKU alignment (separate bus) |
| **Happy Path V7** | Outside reactive chain |

Workshop Day 2 completion:

```text
Plan jobs (Job Readiness)
        │
        ▼
Handle changes (Production Alerts)
        │
        ▼
Run lines (THIS — Machine Material Status)
```

---

## 22. One-page cheat sheet

```text
OPEN: App Library → Logistic → Machine Material Status
   or CT page 2 → RELATED · MACHINE MATERIAL STATUS

DATA: workshopDay2Data.machines (8 lines) · as_of 2026-07-09T15:45
PAGE: Machine Material Status Board · Clean Line CT §6.4

HERO: LINE-03 waiting_for_material · material blocked · PAUSE prep
  JOB-DEMO-001 current · JOB-100234 next · ALT-DEMO-001

KPIs: running 4 · stopped 1 · waiting 1 · paused 3 · blocked 1 · lines 8

FILTERS: machine status (5) · material status (7)
ACTION: Manual machine status → auto pause/continue replenishment

GAPS: no Alerts cascade sync · onNavigate unwired · wip_lanes mismatch
SIBLINGS: job_readiness · production_alerts
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
| 09 | Job Readiness | `job_readiness` | `docs/prototypes/09_JOB_READINESS_GEMINI_NOTEBOOK.md` |
| 10 | Production Alerts | `production_alerts` | `docs/prototypes/10_PRODUCTION_ALERTS_GEMINI_NOTEBOOK.md` |
| 11 | **Machine Material Status** | `machine_status` | **this file** |
| 12 | WIP Control Tower | `wip_control_tower` | `docs/prototypes/12_WIP_CONTROL_TOWER_GEMINI_NOTEBOOK.md` |

Catalog overview: `LOGISTICS_PROTOTYPES_GEMINI_NOTEBOOK.md`.
