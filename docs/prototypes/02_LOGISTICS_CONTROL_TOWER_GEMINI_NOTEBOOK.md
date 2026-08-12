# Prototype Deep Dive 02 — Logistics Control Tower

**Product:** BD Smart Factory / Inside Logistics (`bd-ai-poc`)  
**App Library card:** Logistics Control Tower  
**Screen key:** `logistics_control_tower` (alias: `receiving_control_tower` → same page)  
**Category:** Logistic → End-to-End Visibility  
**Live demo:** https://guillermesmozzer.github.io/bd-ai-poc/  
**Audience:** Gemini Notebook analysis (single-prototype pack)

---

## 0. Document control

| Field | Value |
|---|---|
| Prototype name | Logistics Control Tower |
| Primary journey role | Executive / plant logistics leadership visibility (not a Happy Path operator step) |
| Happy Path position | **Outside** the Lupita → Pepe → Alejandra → Gaby reactive chain; companion overview |
| Editions | **Same UI** for Classic and Inside Logistics (no edition fork) |
| Spec / data alignment | CDF Gold mock `logisticsMockData` (ST01–ST108 entities); receiving L2 uses `receivingMockData` (ST01–ST07) |
| Router | `src/logistics/AppRoutesLogistics.tsx` |
| Primary file | `src/logistics/pages/LogisticsControlTowerPage.tsx` |
| Visual system | CoreSight-inspired dark cockpit (`src/logistics/cockpit/cockpitTheme.ts`) |

---

## 1. Executive summary

**Logistics Control Tower (CT)** is the plant-wide **executive logistics cockpit** for El Paso (demo site).

It prototypes:

1. **Level 1 (L1) macroflow cockpit** — six macroflows **IN01 · IN02 · WIP · OB01 · OB02 · OB03** with healthscores, capacity %, KPI tiles, exception pulse, and AI site summary.
2. **Carousel lenses** — three auto-rotating pages (Overall status → Journey & leadership → WIP lane lens).
3. **Progressive drill-down** — KPI modal (Level 3), embedded Receiving L2 layer, and navigation into WIP CT / Sterilization–Outbound CT / operational screens.
4. **Area towers** — three launch cards (Inbound detail embedded; WIP CT; Sterilization / Outbound CT).

It is **read-mostly mock visibility**: horizon and site selectors are cosmetic; comments in the KPI modal do not persist; there is **no** write-back into the V7 Happy Path `localStorage` bus (`reactiveLogisticsDemo`).

**Receiving Control Tower is not a separate App Library product.** Screen key `receiving_control_tower` routes to the **same** `LogisticsControlTowerPage`. The inbound receiving board is an **embedded L2 layer** (`layer === 'receiving'`) switched in-page, backed by `receivingMockData`.

---

## 2. How to open this prototype

### Path A — App Library
1. Sign in.
2. Header → **apps grid** (top-left).
3. Category pill **Logistic**.
4. Card **Logistics Control Tower**  
   - Subheading: *End-to-End Visibility*  
   - Description: *“Plant-wide executive cockpit: IN01–OB03 macroflow KPIs, carousel lenses, and progressive drill-down.”*

### Path B — Side navigation (Logistic)
1. Left nav → **Logistic** (parent default screen is already `logistics_control_tower`).
2. Child **Logistics Control Tower**.

Related nav children (reachable from CT or independently):
- **WIP Control Tower** → `wip_control_tower`
- **Sterilization / Outbound CT** → `sterilization_outbound_control_tower`

### Path C — AI Home / Smart Hub tiles
From `src/aiHome/data.tsx`:
- Title: **Logistics Control Tower**
- Caption: *“Single-screen executive cockpit with macroflow KPIs (IN01–OB03) and progressive drill-down (inbound receiving included).”*
- KPI chip: *“6 macroflows · L1 cockpit”*
- Action → `setCurrentScreen('logistics_control_tower')`

Also listed: **WIP Control Tower**, **Sterilization / Outbound CT**.

### Path D — Back-links from other logistics screens
Many operator / QA / shipping shells use `LogisticsPageShell` with default back:
- Label: **Logistics Control Tower**
- Action: `setCurrentScreen('logistics_control_tower')`

Examples: Mobile Ops (V7), Quality Release, Shipment Readiness, Guided Tasks, WIP CT, Receiving L2 (“Back to cockpit”), Sterilization / Outbound CT header button.

### Path E — Alias screen key
- `receiving_control_tower` → same React page as `logistics_control_tower` (starts on **cockpit** layer, not receiving).
- There is **no** dedicated App Library card for Receiving Control Tower.

### Deep links / edition
- Edition query (`?edition=classic` / `?edition=inside_logistics`) does **not** change CT UI.
- No CT-specific query params for carousel page or layer.

---

## 3. Routing & architecture

```text
App Library / Nav / AI Home / Back buttons
        │
        ▼
screen key: logistics_control_tower
   (or alias: receiving_control_tower)
        │
        ▼
AppRoutesLogistics.tsx
        │
        └── LogisticsControlTowerPage.tsx
                │
                ├── layer === 'cockpit'  (default)
                │     ├── Page 0 — Overall status (KPIs + macroflows + area towers)
                │     ├── Page 1 — Journey heatmap + critical materials + leadership KPIs
                │     ├── Page 2 — WIP lane lens + related launches
                │     └── KpiDrilldownModal (Level 3)
                │
                └── layer === 'receiving'
                      └── ReceivingControlTowerPage (onBackToCockpit → layer cockpit)
                            └── data: receivingMockData
```

### Linked Level 2 / operational screens (navigation out of CT)

| Target screen key | How opened from CT |
|---|---|
| Embedded receiving L2 | Area tower **Inbound detail (IN01)** or Macroflow **IN01** → **GO TO AREA VIEW →** (`openArea('receiving')`) |
| `wip_control_tower` | Area tower **WIP Control Tower**; Macroflow IN02/WIP **GO TO AREA VIEW**; Page 2 WIP lane cards |
| `sterilization_outbound_control_tower` | Area tower **Sterilization / Outbound Control Tower**; Macroflow OB01–OB03 **GO TO AREA VIEW** |
| `job_readiness` | Declared on IN02 `MacroflowDef.screen` (not wired as direct click from card body — area nav uses `area`) |
| `sterilization_tracker` | From Outbound CT unit cards / OB macros’ declared screens; also related content preservation note |
| `shipment_readiness` | From Outbound CT shipment unit cards |
| `quality_release` | Page 2 related card |
| `machine_status` | Page 2 related card |

### Critical implementation details
- **One component, two screen keys** for CT entry; receiving is a **local React layer**, not a separate route when opened from the cockpit.
- Cockpit visual tokens (`ct.*`) are **scoped to the dark CT**; Receiving L2 uses the lighter `LogisticsPageShell` / `lx` theme tokens.
- Macroflow model **imports only** `logisticsMockData` — not `workshopDay2Data`, not `wipMockData`, not `reactiveLogisticsDemo` runtime state.

---

## 4. Progressive disclosure model (product framing)

| Level | Name | What user sees | Implementation |
|---|---|---|---|
| L1 | Executive cockpit | Site risk banner, 6 KPIs, 6 macroflow cards, area towers, AI summary, carousel | `LogisticsControlTowerPage` + `macroflowModel` |
| L2 | Area drill-down | Receiving board **or** WIP CT **or** Sterilization/Outbound CT | Embedded page **or** `setCurrentScreen` |
| L3 | KPI drill-down | Chart + AI insight + supporting table + comment field | `KpiDrilldownModal` |

Outbound L2 header copy explicitly: `LEVEL 2 · AREA DRILL-DOWN · OB01 · OB02 · OB03`.  
KPI modal header: `LEVEL 3 · KPI DRILL-DOWN · {macroflow}`.

---

## 5. Personas / roles (intended audience)

CT does **not** bind a Happy Path named persona. Implied roles from mock owners and copy:

| Role | How CT serves them |
|---|---|
| Plant / logistics leadership | Site risk banner, leadership KPIs, journey heatmap, AI site summary |
| Receiving lead | Exception pulse + inbound detail L2 (docks, trucks, staging) |
| Warehouse / WIP TL | WIP blocked KPIs, WIP lane lens → WIP Control Tower |
| Sterilization coordinator | OB01/OB02 macros → Sterilization / Outbound CT + Sterilization Tracker |
| FG / shipping lead | OB03 shipments not ready → Shipment Readiness |
| QA supervisors | QA hold KPI drill-down rows; related Quality Release launch (visibility only) |

Mock user directory used in drill-down owner columns (`logisticsData.users`): M. Chen, R. Patel, C. Alvarez, J. Morales, A. Brooks, L. Nguyen, D. Walsh, K. Ortiz, S. Kim, V. Torres.

---

## 6. Data sources — what CT actually uses

### 6.1 Used

| Source | Used by | Role |
|---|---|---|
| `src/logistics/data/logisticsMockData.ts` → `logisticsData` | `macroflowModel.ts`, L1 pages, Outbound CT | Unified CDF Gold mock (as_of `2026-07-09T14:30:00-06:00`, prototype_version `v2`) |
| `src/logistics/cockpit/macroflowModel.ts` | L1 + Outbound CT | Derives macroflows, cockpit KPIs, area towers, global alert, AI summary |
| `src/logistics/data/receivingMockData.ts` → `receivingControlTowerData` | `ReceivingControlTowerPage` only | Inbound L2 trucks/docks/lanes/inspections/exceptions |

### 6.2 Not used by Logistics Control Tower (despite adjacency)

| Source | Used elsewhere |
|---|---|
| `workshopDay2Data.ts` | Job Readiness, Production Alerts, Machine Material Status |
| `wipMockData.ts` | WIP Control Tower page |
| `reactiveLogisticsDemo.ts` | V7 Happy Path (Lupita / Alejandra / Gaby) — **not** wired into CT KPIs |
| `palletVerificationMockData.ts` | Pallet Load Check |

**Implication for Gemini analysis:** CT numbers will **not** change when Lupita transfers custody or Alejandra releases LOT-A-114. CT is a static mock snapshot narrative dated 2026-07-09 14:30 (El Paso −06:00).

---

## 7. Macroflow structure IN01–OB03

Defined in `macroflows: MacroflowDef[]`.

### 7.1 Catalog (exact labels + process steps)

| ID | UI title | Process label · steps | Area tower | Declared `screen` on def | Primary KPI story |
|---|---|---|---|---|---|
| **IN01** | IN01 Receiving | Raw material receiving & dock · **ST01–ST25** | `receiving` (embedded) | `logistics_control_tower` | Inbound today / dock backlog / staging capacity |
| **IN02** | IN02 Prod. Supply | Production supply & kanban · **ST26–ST43** | `wip` | `job_readiness` | Supply open (from journey heatmap `production_supply`) |
| **WIP** | WIP Floor | Work-in-process visibility · **ST38–ST43** | `wip` | `wip_control_tower` | Blocked / waiting lines |
| **OB01** | OB01 Pre-Steril | Pre-sterilization load prep · **ST44–ST61** | `outbound` | `sterilization_tracker` | Loads staging (`pre_steril` open_count) |
| **OB02** | OB02 Sterilization | Provider / post-steril QA · **ST62–ST83** | `outbound` | `sterilization_tracker` | In transit / at provider; SLA risk loads |
| **OB03** | OB03 Shipping | FG fulfillment & customer ship · **ST86–ST108** | `outbound` | `shipment_readiness` | Shipments not ready / pledges / backorders |

Note: Receiving L2 subtitle says **ST01–ST07** (IB-01 Raw Material Receiving process coverage strip), while macroflow card says **ST01–ST25** — intentional breadth vs detail mismatch to document.

### 7.2 Computed seed values (from mock as of 2026-07-09)

Base `executive_kpis`:

| Field | Value |
|---|---|
| `inbound_today` | 5 |
| `qa_hold_count` | 13 |
| `shipments_not_ready` | 6 |
| `critical_exceptions` | 4 |
| `quarantine_aging_avg_days` | 3.2 |
| `dock_backlog` | 2 |
| `qa_release_lead_time_hours` | 38 |
| `loads_at_provider` | 3 |
| `receiving_capacity_pct` | 81 |
| `open_backorders` | 7 |
| `pledge_due_today` | 2 |

Derived in `macroflowModel`:

| Derived | Formula / source | Value |
|---|---|---|
| `blockedWip` | WIP lanes `blocked` ∨ `waiting` | **2** (Line 3, Line 5) |
| `sterilAtRisk` | loads with `sla_risk !== 'on_track'` | **2** |
| `sterilInFlight` | states in `{in_transit_to_provider, sterilization_in_progress, received_by_provider}` | **2** |
| `preSterilOpen` | journey step `pre_steril`.open_count | **2** |
| `supplyOpen` | journey step `production_supply`.open_count | **4** |
| `exceptions.length` | full exceptions array | **7** |

### 7.3 Per-macroflow card metrics (seeded demo)

| ID | Tone | Healthscore (approx) | Capacity % | Secondary label → value | Delta copy | Insight (exact) |
|---|---|---|---|---|---|---|
| IN01 | warn | 70 | 81 | Dock backlog → 2 | +1 vs yest. | Staging projected over capacity after next inbound wave; prioritize QA release to free slots. |
| IN02 | warn | 52 | 72 | QA holds feeding supply → 13 | +2 at risk | Supermarket short on Line 5; kanban SLA at risk until QA releases lot LOT-26-0709-B. |
| WIP | danger | 44 | 68 | Running lines → 2 | Line 3 blocked | Line 3 waiting labels; Line 5 supermarket short — escalate to warehouse TL. |
| OB01 | ok | 80 | 61 | Demand open → 3 | Revail link check | Pre-steril queue stable; verify load number governance before next dispatch window. |
| OB02 | danger | 40 | 84 | Post-steril QA late → 5 | 2 at risk | SL-2026-0708 past 7-day QA TAT — treat as late pending, not expected process. |
| OB03 | danger | 32 | 55 | Open backorders → 7 | 2 pledge today | Mayo pledge blocked on picking + hazmat docs; air-ship option if QA releases BO-0709-01. |

**Macroflow card UI chrome (exact):**
- Button: **GO TO AREA VIEW →**
- Labels: **Healthscore**, **Capacity %**
- Maximize (OpenInFull) → opens Level 3 for first KPI mapped to that macroflow ID (see §9.3 fallback behavior).

### 7.4 Area towers (exact copy)

| id | Title | Subtitle | Macroflows shown | Tone | Behavior |
|---|---|---|---|---|---|
| `receiving` | Inbound detail (IN01) | Merged receiving layer · docks, staging, inspection | IN01 | warn | `embedded: true` → `setLayer('receiving')` |
| `wip` | WIP Control Tower | IN02 + WIP · supply, lines, material readiness | IN02 · WIP | danger | `go('wip_control_tower')` |
| `outbound` | Sterilization / Outbound Control Tower | OB01–OB03 · steril network & shipment readiness | OB01 · OB02 · OB03 | danger | `go('sterilization_outbound_control_tower')` |

Section header: **AREA TOWERS · RISK & AI**

---

## 8. Level 1 UX — step-by-step

### 8.1 Page chrome (header)

| Element | Exact / behavior |
|---|---|
| Brand mark | **BD LOGISTICS CT** (teal accent, letter-spaced) |
| Site select | Value **El Paso** (`SITE_LABEL`); only one `MenuItem` — non-functional multi-site |
| Horizon select | **Hourly / Shift / Daily / Weekly** — state stored in `horizon`, default **`shift`**; **does not filter data** |
| Global alert banner (md+) | Title **SITE LOGISTICS RISK**; message: `{critical_exceptions} critical exceptions · QA hold {qa_hold_count} · {shipments_not_ready} shipments not ready · receiving at {receiving_capacity_pct}%` → seed: **4 critical exceptions · QA hold 13 · 6 shipments not ready · receiving at 81%** |
| As-of | `As of {fmtTime(logisticsData.as_of)}` |
| Live clock | Local `en-US` datetime; refreshes every **30s** |

Layout: full-bleed dark `#0c0e12`, IBM Plex Sans/Mono stacks (falls back to Segoe UI / system / ui-monospace). Overflow hidden — designed as a **control-room single viewport**, not a long scroll page.

### 8.2 Carousel mechanics

| Constant / control | Value |
|---|---|
| Interval | **12000 ms** (`CAROUSEL_MS`) |
| Pages | 3 (`page` 0..2) |
| Auto-advance | Only when `carouselOn && layer === 'cockpit'` |
| Prev / Next | IconButtons; aria-labels **Previous cockpit page** / **Next cockpit page** |
| Dots | Click to jump; active dot wider |
| Pause / Resume | PauseIcon when on; PlayArrow when off; aria **Pause carousel** / **Resume carousel** |
| Lens label (exact) | page0: **Overall status** · page1: **Journey & leadership** · page2: **WIP lane lens** |

### 8.3 Page 0 — Overall status (default lens)

Three-column grid (lg): left KPIs · center macroflows · right towers/risk/AI.

#### Left — EXECUTIVE COCKPIT · MACROFLOW KPIs
Six `BigKpiCard`s from `cockpitKpis.slice(0, 6)` — see §9.

Click card or OpenInFull → `setSelectedKpi(kpi)`.

#### Center — MACROFLOW STATUS · IN01 · IN02 · WIP · OB01 · OB02 · OB03
Six `MacroflowCard`s — see §7.

#### Right — AREA TOWERS · RISK & AI
1. Three area tower cards (clickable).
2. **EXCEPTION PULSE** — first **3** of `logisticsData.exceptions`:
   - EXC-0709-001 — humanize(`truck_delay`) · Receiving · Assign dock when arrived
   - EXC-0709-002 — `qa delay` · Quality · Escalate lab TAT
   - EXC-0709-003 — `missing certificate` · Sterilization · Request cert from SteriTech
3. **AI SITE SUMMARY** (exact):

> Highest risk this hour: post-sterilization QA aging and pledge shipments. Free receiving capacity by releasing inbound holds, then clear Line 3 label block before EOD. Sterilization loads at provider remain within dispatch cadence except SL-2026-0708.

### 8.4 Page 1 — Journey & leadership

#### JOURNEY HEATMAP · PRESERVED FROM E2E CT
Nine steps from `journey_heatmap`:

| step_id | Label | Level | Open | SLA | Aging h |
|---|---|---|---|---|---|
| receiving | Receiving | yellow | 3 | at_risk | 4 |
| quality | Quality | red | 8 | late | 52 |
| rm_warehouse | RM Warehouse | green | 1 | on_track | 2 |
| production_supply | Production Supply | yellow | 4 | at_risk | 6 |
| pre_steril | Pre-Sterilization | green | 2 | on_track | 1 |
| provider | Provider | yellow | 3 | at_risk | 36 |
| post_steril_qa | Post-Steril QA | red | 5 | late | 168 |
| fg_warehouse | FG Warehouse | green | 2 | on_track | 3 |
| shipping | Shipping | yellow | 6 | at_risk | 8 |

Cell footer pattern: `{sla_status} · {aging_hours}h aging`

#### CRITICAL MATERIALS
| SKU · Lot | Impact |
|---|---|
| 44102 · LOT-26-0709-B | Production Order PO-100234 — line stop risk |
| 12045 · LOT-26-0701-FG | Sales Order SO-8802142 — Mayo Clinic pledge |
| 12088 · LOT-26-0698-FG | Sterilization Load SL-2026-0712 — cert pending |

#### LEADERSHIP KPIs (exact labels)
| Label | Value |
|---|---|
| Quarantine aging | 3.2d |
| QA lead time | 38h |
| Loads at provider | 3 |
| Pledge today | 2 |
| Backorders | 7 |
| Staging cap. | 81% |

### 8.5 Page 2 — WIP lane lens

Four cards from `wip_lanes` (click → `wip_control_tower`):

| Status | Name | Job · SKU | Note |
|---|---|---|---|
| blocked | Line 3 — Filling | JOB-DEMO-001 · SKU 88210 | Waiting labels |
| waiting | Line 5 — Assembly | JOB-100228 · SKU 44102 | Supermarket short |
| running | Line 1 — Molding | JOB-100215 · SKU 55301 | On track |
| running | Line 2 — Assembly | JOB-100218 · SKU 12045 | Material staged |

Plus related cards:

| Title | Body | Navigate |
|---|---|---|
| RELATED · MACHINE MATERIAL STATUS | Open shop-floor board for clean-line bags, readiness %, and material call-offs (IN02). | `machine_status` |
| RELATED · QUALITY RELEASE | `{qa_hold_count} lots on hold — visibility only; human QA approval gate preserved.` → **13 lots on hold…** | `quality_release` |

---

## 9. Cockpit KPIs & Level 3 drill-down

### 9.1 Six Big KPI tiles (exact labels as shown)

Displayed label format: `{macroflow} · {kpi.label}`

| # | id | Display label | Value | Unit | Target | Delta | Tone | Macroflow |
|---|---|---|---|---|---|---|---|---|
| 1 | inbound_today | IN01 · Inbound today | 5 | trucks | Target ≤ 8 | +1 | warn | IN01 |
| 2 | qa_hold | IN01 · Materials on QA hold | 13 | lots | SLA ≤ 2d inbound | 38h lead | warn | IN01 |
| 3 | wip_blocked | WIP · WIP blocked / waiting | 2 | lines | 0 blocked | Labels + supermarket | danger | WIP |
| 4 | steril_risk | OB02 · Sterilization SLA risk | 2 | loads | 0 late | 3 at provider | danger | OB02 |
| 5 | ship_not_ready | OB03 · Shipments not ready | 6 | orders | Pledge = 0 overdue | 7 BOs | danger | OB03 |
| 6 | exceptions | WIP · Open exceptions | 7 | active | Clear critical < 4h | 4 critical | danger | WIP |

**Gap:** There is **no** dedicated cockpit KPI row for **IN02** or **OB01** (only macroflow cards).

### 9.2 Insights & supporting table sources

| KPI id | Insight (exact) | tableRows source |
|---|---|---|
| inbound_today | Five trucks expected; staging at 81% — projected 110% after unload without QA releases. | `critical_materials` where step ∈ {Quality, Receiving} |
| qa_hold | Inbound QA TAT averaging 38h; one discrepancy lot blocks production order PO-100234. | `qa_inspections` first 5 |
| wip_blocked | Two lines impacted by material readiness — escalate WIP CT exceptions. | all `wip_lanes` |
| steril_risk | Provider + post-steril QA aging is the primary outbound bottleneck this shift. | all `sterilization_loads` |
| ship_not_ready | Pledge tier consumes overtime risk; prioritize hazmat docs and SAP delivery postings. | `outbound_shipments` first 5 |
| exceptions | Exceptions span receiving, QA, steril, and shipping — use area towers for owned queues. | all `exceptions` |

### 9.3 Maximize from macroflow → KPI mapping

`openMacroKpi(id)` picks the **first** `cockpitKpis` entry whose `macroflow === id`, else `cockpitKpis[0]`.

| Macroflow maximize | Opens KPI |
|---|---|
| IN01 | inbound_today |
| IN02 | **fallback** inbound_today (no IN02 KPI) |
| WIP | wip_blocked |
| OB01 | **fallback** inbound_today (no OB01 KPI) |
| OB02 | steril_risk |
| OB03 | ship_not_ready |

### 9.4 KpiDrilldownModal (exact UI copy)

| Region | Copy / behavior |
|---|---|
| Header overline | `LEVEL 3 · KPI DRILL-DOWN · {macroflow}` |
| Title | `{label}` optional ` · {unit}` |
| Close | aria-label **Close KPI drill-down** |
| Chart | Recharts line from sparkline points labeled `T-n` … `T-0` |
| Right panel title | **Comments & notifications** |
| AI card label | **AI insight** → `kpi.insight` |
| System card | **SAP · system** · *Linked visibility record refreshed from CDF Gold. Delta: {kpi.delta}.* |
| Comment field | Placeholder **Add comment…** (no submit / no persistence) |
| Table title | **Supporting data** |
| Columns | **ID · Detail · Age / status · Owner** |
| Empty | **No detail rows in mock index for this KPI.** |

---

## 10. Embedded Receiving L2 (IN01 detail)

Rendered when `layer === 'receiving'` via `ReceivingControlTowerPage` with `onBackToCockpit`.

### 10.1 Shell copy

| Element | Exact text |
|---|---|
| Back | **Back to cockpit** (calls `onBackToCockpit`, not screen change) |
| Overline | LOGISTICS |
| Title | **Inbound · Receiving (IN01)** |
| Subtitle | Logistics Control Tower · Level 2 detail — docks, staging, inspection · ST01–ST07 |
| Banner | Part of the main Logistics Control Tower. Traceability back to IN01 cockpit KPIs. |
| Theme | Light logistics shell (`lx` / accent blue) — **not** dark cockpit |

### 10.2 KPI row (computed from receiving mock)

| Label | Seed value |
|---|---|
| Trucks scheduled today | 5 |
| In transit / arrived | count status ∈ {expected, arrived} |
| Unloading now | count status === unloading (tone ok) |
| Open exceptions | non-resolved exceptions (tone danger) |
| Docks available | available/idle over total docks |
| Staging lanes open | open lanes over total |

### 10.3 Panels & interactions

1. **Truck Schedule** — search placeholder **Search trailer, supplier, PO…**; chips **All / Expected / Arrived / Unloading / Closed**; priority-sorted table; row click opens drawer.
2. **Dock / Port Assignment** — RM Dock A/B, Import Port (blocked: *Forklift maintenance until 16:00*).
3. **Staging Space Availability** — lanes with occupation % and next_action.
4. **Inspection Status** — TAT vs target; **· OVER TAT** when breached.
5. **Open Exceptions** — receiving-scoped EXC rows with SeverityPill.
6. **LogisticsDrawer** — Truck schedule / Purchase orders / Staging lanes / Inspections / Exceptions / Process coverage:  
   `ST01 Schedule → ST02 Priority → ST03 Communicate → ST04 Arrive → ST05 Unload → ST06 Stage → ST07 Inspect (IB-01 Raw Material Receiving)`

### 10.4 Seed trucks (receivingMockData)

| ID | Trailer | Status | Priority | Highlights |
|---|---|---|---|---|
| TS-2026-0709-001 | TRL-4491 | closed | 2 | PP resin LOT-26-0712-A; unload 100% |
| TS-2026-0709-002 | TRL-7710 | arrived | 1 | Import catalyst 44102; exception; no dock |
| TS-2026-0709-003 | TRL-3302 | unloading | 3 | GlobalPack; Dock A; 62% |
| TS-2026-0709-004 | TRL-IC-902 | expected | 4 | Intercompany kit 11004 |
| TS-2026-0709-005 | TRL-5588 | expected | 5 | Dock B reserved 15:30 |

Empty filter copy: **No trucks match filters**

---

## 11. Sterilization / Outbound Control Tower (linked L2)

File: `SterilizationOutboundControlTowerPage.tsx`  
Screen: `sterilization_outbound_control_tower`

### 11.1 Header
- Back button: **Logistics Control Tower** → `logistics_control_tower`
- Overline: **LEVEL 2 · AREA DRILL-DOWN · OB01 · OB02 · OB03**
- Title: **Sterilization / Outbound Control Tower**
- As-of note: *preserves steril tracker + shipment readiness content*

### 11.2 KPI strip
Filters `cockpitKpis` where macroflow ∈ {OB01, OB02, OB03}.  
**Only two cards render** (OB02 steril_risk, OB03 ship_not_ready) — no OB01 KPI exists.

### 11.3 Unit board
Builds unit cards from all `sterilization_loads` + first 4 `outbound_shipments`.

Split:
- **Severity alert** — tone danger|warn
- **Normal** — tone ok

Each unit: **Healthscore %**, **Readiness / util %**, secondary, sparkline, button **GO TO UNIT VIEW →**  
- Steril units → `sterilization_tracker`  
- Shipment units → `shipment_readiness`

### 11.4 Side panels
- **AI AREA INSIGHT** — concatenates OB01–OB03 `insight` strings + *Traceability back to Level 1 macroflow indicators is preserved via OB01/OB02/OB03 healthscores.*
- **OPEN EXCEPTIONS (OUTBOUND)** — exceptions matching `/steril|ship|outbound|fg/i` on process_area + exception_type.

Also reuses `KpiDrilldownModal`.

---

## 12. State model (React local only)

| State | Default | Purpose |
|---|---|---|
| `page` | 0 | Carousel lens index |
| `carouselOn` | true | Auto-rotate |
| `clock` | nowLabel() | Header clock |
| `horizon` | `'shift'` | Cosmetic select |
| `selectedKpi` | null | Level 3 modal |
| `layer` | `'cockpit'` \| `'receiving'` | Embedded receiving |

Receiving L2 local state: `search`, `statusFilter`, `selectedId`.  
Outbound CT local state: `kpi` for modal.

**No** URL sync, **no** localStorage, **no** edition branching, **no** demo reset on CT itself.

---

## 13. Business / presentation rules

1. **Visibility, not disposition** — Quality Release related card states *human QA approval gate preserved*.
2. **Staging capacity narrative** — receiving at 81% with projected 110% after inbound unless QA frees slots (`receiving_capacity` object).
3. **SLA risk taxonomy** — journey levels green/yellow/red map to ok/warn/danger tones; steril `on_track|at_risk|late`.
4. **Critical exceptions KPI** — banner uses hardcoded `executive_kpis.critical_exceptions = 4`, while only **one** exception has `severity: 'critical'` (EXC-0709-005) — demo storytelling number ≠ filtered count.
5. **OB02 insight** mentions **SL-2026-0708**, but seeded late load id is **SL-2026-0705** — known copy inconsistency.
6. **Capacity % color** on macroflow cards: util >85 danger, >70 warn, else ok (independent of macroflow tone).
7. **GO TO AREA VIEW** maps by `area` id, not by `MacroflowDef.screen` (so IN02 goes to WIP CT area, not Job Readiness, despite `screen: 'job_readiness'` on the def).

---

## 14. UI copy catalog (English)

### Titles / navigation
- Logistics Control Tower
- BD LOGISTICS CT
- El Paso
- Sterilization / Outbound Control Tower
- Sterilization / Outbound CT (nav / AI Home short)
- WIP Control Tower
- Inbound · Receiving (IN01)
- Inbound detail (IN01)
- Back to cockpit
- GO TO AREA VIEW →
- GO TO UNIT VIEW →

### Section headers
- EXECUTIVE COCKPIT · MACROFLOW KPIs
- MACROFLOW STATUS · IN01 · IN02 · WIP · OB01 · OB02 · OB03
- AREA TOWERS · RISK & AI
- EXCEPTION PULSE
- AI SITE SUMMARY
- JOURNEY HEATMAP · PRESERVED FROM E2E CT
- CRITICAL MATERIALS
- LEADERSHIP KPIs
- RELATED · MACHINE MATERIAL STATUS
- RELATED · QUALITY RELEASE
- Severity alert / Normal
- AI AREA INSIGHT
- OPEN EXCEPTIONS (OUTBOUND)
- LEVEL 3 · KPI DRILL-DOWN · …
- Comments & notifications / AI insight / SAP · system / Supporting data
- Truck Schedule / Dock / Port Assignment / Staging Space Availability / Inspection Status / Open Exceptions

### Horizon options
- Hourly · Shift · Daily · Weekly

### Carousel lens labels
- Overall status · Journey & leadership · WIP lane lens

### Global alert
- SITE LOGISTICS RISK
- 4 critical exceptions · QA hold 13 · 6 shipments not ready · receiving at 81%

### App Library / AI Home blurbs
- Plant-wide executive cockpit: IN01–OB03 macroflow KPIs, carousel lenses, and progressive drill-down.
- Single-screen executive cockpit with macroflow KPIs (IN01–OB03) and progressive drill-down (inbound receiving included).
- 6 macroflows · L1 cockpit

---

## 15. File map

| File | Responsibility |
|---|---|
| `src/logistics/pages/LogisticsControlTowerPage.tsx` | **Main L1 cockpit** + layer switch + carousel |
| `src/logistics/pages/ReceivingControlTowerPage.tsx` | Embedded / standalone-capable IN01 L2 board |
| `src/logistics/pages/SterilizationOutboundControlTowerPage.tsx` | OB01–OB03 L2 severity board |
| `src/logistics/pages/WipControlTowerPage.tsx` | IN02/WIP L2 (separate screen; banner references CT) |
| `src/logistics/cockpit/macroflowModel.ts` | Macroflows, KPIs, towers, alert, AI summary |
| `src/logistics/cockpit/CockpitCards.tsx` | BigKpiCard, MacroflowCard |
| `src/logistics/cockpit/Sparkline.tsx` | Sparkline, StatusBar, CockpitCard |
| `src/logistics/cockpit/KpiDrilldownModal.tsx` | Level 3 modal |
| `src/logistics/cockpit/cockpitTheme.ts` | Dark CT tokens + toneColor |
| `src/logistics/data/logisticsMockData.ts` | Primary CDF mock for L1 / outbound CT |
| `src/logistics/data/receivingMockData.ts` | Receiving L2 mock |
| `src/logistics/AppRoutesLogistics.tsx` | Screen key → page mapping |
| `src/logistics/components/LogisticsPageShell.tsx` | Shared back-to-CT chrome for other screens |
| `src/navigation/navigationConfig.tsx` | Screen keys, Logistic nav tree |
| `src/workstation/components/WorkstationsLibraryScreen.tsx` | App Library card |
| `src/aiHome/data.tsx` | Smart Hub / AI Home launcher tiles |
| `src/AppContent.tsx` | Name → screen map includes Logistics Control Tower |
| `src/logistics/utils.ts` | fmtTime, humanize helpers |

Shared Receiving L2 UI helpers: `KpiRow`, `PanelCard`, `LogisticsDrawer`, `StatusPill`, `SeverityPill`, `themeTokens`, `constants`.

---

## 16. Visual / interaction notes

| Token | Value |
|---|---|
| Background | `#0c0e12` |
| Card | `#1a1f29` / hover `#222836` |
| Accent | `#2dd4bf` (teal) |
| OK / Warn / Danger | `#22c55e` / `#f59e0b` / `#ef4444` |
| Font | IBM Plex Sans · Mono |
| Comment in theme | “CoreSight-inspired control room tokens — scoped to Logistics CT cockpit only.” |

Receiving L2 intentionally breaks dark mode to reuse the standard logistics light shell — important when comparing “one composition” vs mixed themes.

---

## 17. Demo script (recommended)

### Script A — Executive walkthrough (L1)
1. Open **Logistics Control Tower** from App Library → Logistic.
2. Point to **BD LOGISTICS CT** + **SITE LOGISTICS RISK** banner (81% receiving / 13 QA hold / 6 not ready).
3. Walk six KPI tiles left → open **Shipments not ready** drill-down (Level 3 chart + Mayo pledge rows).
4. On center, show **OB03 Shipping** healthscore vs **IN01 Receiving**.
5. Pause carousel; click dots: **Overall status** → **Journey & leadership** (red Quality / Post-Steril QA) → **WIP lane lens** (Line 3 blocked).

### Script B — Progressive drill-down IN01
1. From page 0, click area tower **Inbound detail (IN01)** or IN01 **GO TO AREA VIEW →**.
2. Show light-theme receiving board; filter **Arrived**; select **TRL-7710** (priority 1 exception).
3. Open drawer → priority note / unassigned dock.
4. **Back to cockpit**.

### Script C — Outbound severity board
1. Click **Sterilization / Outbound Control Tower** tower.
2. Show Severity alert units (late steril load + low readiness shipments).
3. **GO TO UNIT VIEW →** into Sterilization Tracker or Shipment Readiness.
4. Back via **Logistics Control Tower**.

### Script D — Contrast with Happy Path
1. Switch edition to Inside Logistics; run Lupita → Alejandra → Gaby.
2. Return to CT and call out that **CT KPIs did not change** (static mock vs reactive demo bus).

---

## 18. Analysis prompts for Gemini Notebook

1. Map each IN01–OB03 macroflow card to ST01–ST108 process map coverage; flag ST gaps (e.g. ST84–ST85 missing between OB02 and OB03).
2. Evaluate whether embedding Receiving as an in-page layer while WIP/Outbound are separate routes is the right progressive-disclosure pattern.
3. Propose a real CDF Gold refresh contract that would replace static `as_of` with live site telemetry without breaking demo determinism.
4. Design role-based CT views (Plant Manager vs Receiving Lead vs FG Lead) using the same macroflow model.
5. Resolve KPI taxonomy: add missing IN02 / OB01 Level-1 KPI tiles and fix maximize fallback to inbound_today.
6. Reconcile `critical_exceptions: 4` vs severity-tagged exception rows; recommend a single source of truth.
7. Assess carousel 12s autoplay for control-room TVs vs interactive analyst use (pause defaults, lens deep-links).
8. Specify how V7 reactive Happy Path events should optionally annotate CT (without making CT a regulatory system of record).
9. Compare dark CoreSight CT vs light Receiving L2 — propose a unified visual language that preserves hierarchy.
10. Draft acceptance criteria for making horizon (Hourly/Shift/Daily/Weekly) actually re-slice KPIs and sparklines.
11. Analyze Exception Pulse truncation (top 3) vs full exception KPI table — when should CT escalate to a dedicated exception console?
12. Trace Mayo Clinic pledge story across journey heatmap, critical materials, OB03 insight, outbound shipment OB-0709-001, and Shipment Readiness prototype.
13. Recommend telemetry / audit for Level-3 comment field if it becomes a real collaboration surface.
14. Identify demo copy bugs (SL-2026-0708 vs SL-2026-0705; “Revail link check”) and propose a glossary QA checklist for executive demos.

---

## 19. Known gaps & demo limitations

1. **Static snapshot** — not connected to `reactiveLogisticsDemo` / Happy Path.
2. **Horizon & site selectors** do not change data.
3. **Comment field** in KPI modal is non-functional.
4. **No IN02 / OB01 Big KPI tiles**; maximize on those macros falls back to inbound KPI.
5. **Outbound CT KPI strip** shows 2 of 3 expected OB macros.
6. **`receiving_control_tower` alias** does not deep-link into receiving layer.
7. **No App Library card** for Receiving CT as standalone.
8. **Theme split** dark cockpit vs light receiving.
9. **Insight ID mismatch** SL-2026-0708 vs seeded SL-2026-0705.
10. **critical_exceptions** count not derived from exception severities.
11. **MacroflowDef.screen** often unused by GO TO AREA (area id wins).
12. **IBM Plex** may silently fall back if font not loaded in host app.
13. **Exception Pulse** shows only three items; no click-through to exception detail.
14. **Carousel** resets only by modulo — no “lens” query param for shareable deep links.
15. **workshopDay2Data / wipMockData** not powering CT (WIP page uses different mock than WIP lane lens).
16. **No Reset Demo Data** on CT (nothing mutable to reset).
17. **Edition-agnostic** — cannot demo “classic vs V7 CT” differences because there are none.
18. Journey heatmap cells are **not clickable** (preserved visual only).

---

## 20. Relationship to other logistics prototypes

| Prototype | Relationship to Control Tower |
|---|---|
| **Logistics Mobile Ops (Lupita / classic)** | Operator execution for inbound; CT back-link; **no shared live state** with CT KPIs |
| **Guided Tasks (Pepe)** | Warehouse execution; CT surfaces supply/WIP risk that Pepe would clear |
| **Quality Release (Alejandra)** | Human gate; CT shows QA hold counts + related launch; visibility only |
| **Shipment Readiness (Gaby)** | OB03 unit / readiness consumer; pledge story alignment in mock |
| **Sterilization Tracker** | OB01/OB02 operational detail behind Outbound CT units |
| **ASN Portal** | Upstream partner appointments; parallel to receiving schedule narrative |
| **WIP Control Tower** | Official L2 for IN02/WIP; richer than Page 2 lane lens; uses `wipMockData` |
| **Sterilization / Outbound CT** | Official L2 for OB01–OB03 severity board |
| **Job Readiness / Machine Status / Production Alerts** | IN02-adjacent shop-floor screens (`workshopDay2Data`); linked from CT page 2 / macro def |
| **Pallet Load Check** | FG outbound quality gate; not launched from CT chrome today |
| **Global / Smart Search “Control Tower”** | **Different product** (`control_tower` / nav key `smart_search`) — do not confuse with Logistics CT |

Conceptual stack:

```text
        Logistics Control Tower (this prototype)
                 │
     ┌───────────┼──────────────────────┐
     ▼           ▼                      ▼
 Receiving L2   WIP CT            Steril/Outbound CT
 (embedded)     (screen)              (screen)
     │           │                      │
  Mobile Ops   Guided Tasks /      Steril Tracker /
  (execution)  Job Readiness       Shipment Readiness
               Machine Status      Quality Release
```

---

## 21. One-page cheat sheet

```text
OPEN: App Library → Logistic → Logistics Control Tower
   or Nav Logistic → Logistics Control Tower
   or AI Home tile “6 macroflows · L1 cockpit”

L1: Dark cockpit · El Paso · Shift (cosmetic)
    Banner: 4 critical · QA 13 · 6 not ready · receiving 81%
    KPIs: Inbound 5 · QA hold 13 · WIP blocked 2 · Steril risk 2 · Ship NR 6 · Exceptions 7
    Macros: IN01 IN02 WIP OB01 OB02 OB03
    Carousel 12s: Overall | Journey & leadership | WIP lane lens

DRILL:
  KPI tile / maximize → Level 3 modal
  IN01 GO TO AREA / Inbound tower → Receiving L2 (Back to cockpit)
  WIP tower / WIP lanes → wip_control_tower
  Outbound tower → sterilization_outbound_control_tower

DATA: logisticsMockData (+ receivingMockData for L2)
NOT: reactive Happy Path, workshopDay2Data, wipMockData

REMEMBER: Visibility layer · static 2026-07-09 snapshot · no edition fork
```

---

*End of Prototype Deep Dive 02 — Logistics Control Tower.*  
*Full series (01–12): see `LOGISTICS_PROTOTYPES_GEMINI_NOTEBOOK.md` §7.*
