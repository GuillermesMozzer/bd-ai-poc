# BD Smart Factory — Logistics Prototypes Catalog

**Purpose:** Reference pack for Gemini Notebook analysis of the **Logistic** prototypes available in the App Library of `bd-ai-poc` (Radix / BD).  
**Scope:** Only the logistics screens listed under App Library → category **Logistic**.  
**Live demo:** https://guillermesmozzer.github.io/bd-ai-poc/  
**Repo:** https://github.com/GuillermesMozzer/bd-ai-poc  

---

## 1. How to open these prototypes in the UI

1. Open the app and sign in.
2. On the dark header, click the **apps grid** icon (top-left, next to the BD logo).
3. In App Library, click the **Logistic** category pill.
4. Click any card below to open that prototype.

### Edition note (important)

At first entry the app asks for an edition:

| Edition | Effect on Logistic screens |
|---|---|
| **Smart Factory (classic)** | Classic / legacy logistics UIs |
| **Inside Logistics (V7)** | Reactive Happy Path UIs for 4 journeys: Lupita, Pepe, Alejandra, Gaby |

Deep links: `?edition=classic` or `?edition=inside_logistics`

Inside Logistics shortcuts after login:
- Header orange button **Inside Logistics**
- App Library block **Inside Logistics · Happy Path** (Lupita → Pepe → Alejandra → Gaby)

---

## 2. Product framing

These prototypes cover **Inside Logistics** for medical-device manufacturing (BD context: El Paso and multi-plant rollout).

Physical / logical flow is governed by three **Capacity Contracts**:

| Code | Name | Engineering rigor | Meaning |
|---|---|---|---|
| **MD** | Directed Movement | Idempotency | Move a physical unit (pallet/box) origin → destination without double-posting |
| **DA** | Assisted Decision | Autonomy threshold | System prioritizes; humans override with audit; quarantine blocks never auto-bypass |
| **ID** | Inspect & Disposition | Regulatory ceiling (FDA 21 CFR Part 11) | Evidence can be assisted (N2); commercial release disposition stays human gate (N1 forever) |

Macroflow reference: **IN01 → OB03** (inbound through outbound).

---

## 3. Prototype inventory (App Library → Logistic)

### 3.1 Mobile Operations

#### Logistics Mobile Ops
- **Screen key:** `logistics_mobile_ops`
- **App Library blurb:** Mobile-first area selection for inside logistics operator execution.
- **Classic edition:** Area selection + inbound receiving / unloading mobile flows.
- **Inside Logistics V7:** **Lupita — Dock Tablet**
  - Persona: María Guadalupe “Lupita” Hernández López
  - Contract: **MD** (+ inspection evidence capture)
  - SAP appointment queue → 4-point dock checklist → **Mark Dock Ready (Transfer Custody)**
  - State writes to shared demo store (`localStorage`) and creates pending work for QA (Alejandra)
- **Primary files:**
  - V7: `src/logistics/MobileReceivingPage.tsx` via `LogisticsMobileOpsPage.tsx`
  - Classic: `src/logistics/pages/LogisticsMobileOpsPageLegacy.tsx`

---

### 3.2 End-to-End Visibility

#### Logistics Control Tower
- **Screen key:** `logistics_control_tower` (also used by `receiving_control_tower`)
- **App Library blurb:** Plant-wide executive cockpit: IN01–OB03 macroflow KPIs, carousel lenses, and progressive drill-down.
- **What it prototypes:** Executive logistics cockpit, site lenses, KPI tiles, progressive drill-down into areas/processes.
- **Primary file:** `src/logistics/pages/LogisticsControlTowerPage.tsx`

---

### 3.3 External Partners

#### ASN Portal
- **Screen key:** `external_transfer_portal`
- **App Library blurb:** Track inbound ASNs, dock appointments, carrier confirmations, and exception handling in one logistics portal.
- **What it prototypes:** Partner-facing ASN / transfer portal (appointments, confirmations, exceptions).
- **Primary file:** `src/logistics/pages/ExternalTransferPortalPage.tsx`

---

### 3.4 Inbound / Post-Sterilization

#### Quality Release
- **Screen key:** `quality_release`
- **App Library blurb:** QA queues, SQE notifications, hold cage, and shipping urgency requests.
- **Classic edition:** QA queues, hold cage, urgency requests.
- **Inside Logistics V7:** **Dra. Alejandra — QA Workstation & E-Signature**
  - Persona: Dra. Alejandra González Sánchez
  - Contract: **ID** (N1 regulatory ceiling)
  - Risk-sorted quarantine queue
  - Laboratory evidence pack (COA / bioburden / biological indicators)
  - E-signature dialog (password + disposition reason + 21 CFR Part 11 attestation)
  - Releasing lot **LOT-A-114** unlocks Gaby’s sterilization gate via shared demo store
- **Primary files:**
  - V7: `src/logistics/pages/QualityReleasePage.tsx`
  - Classic: `src/logistics/pages/QualityReleasePageLegacy.tsx`

---

### 3.5 Outbound

#### Shipment Readiness
- **Screen key:** `shipment_readiness`
- **App Library blurb:** Pledge, 48h, and backorder readiness with hazmat and pallet configuration gates.
- **Classic edition:** Outbound readiness board with priority tiers and readiness %.
- **Inside Logistics V7:** **Gaby — SpaceX Shipping Cockpit**
  - Persona: Gabriela “Gaby” Rodríguez Pérez
  - Contracts: **DA** gating + **MD** PGI release
  - 4 lights: Batch Record / Sterilization / Customs / Line Clearance
  - Sterilization light listens to Alejandra’s release of LOT-A-114
  - **GO — Release Shipment** only when all gates are GREEN
- **Primary files:**
  - V7: `src/logistics/pages/ShipmentReadinessPage.tsx`
  - Classic: `src/logistics/pages/ShipmentReadinessPageLegacy.tsx`

#### Sterilization Tracker
- **Screen key:** `sterilization_tracker`
- **App Library blurb:** External sterilization loads, documentation gaps, and 7-day QA TAT.
- **What it prototypes:** Custody / documentation visibility for external sterilization loads (e.g. Sterigenics context).
- **Primary file:** `src/logistics/pages/SterilizationTrackerPage.tsx`

---

### 3.6 Outbound / Finished Goods

#### Pallet Load Check
- **Screen key:** `pallet_verification`
- **App Library blurb:** 3D guided pallet verification with checklist, photo capture, exceptions, and supervisor queue.
- **What it prototypes:** 3D pallet verification workspace (checklist, exceptions, supervisor queue).
- **Primary file:** `src/logistics/pages/PalletVerificationPage.tsx`

---

### 3.7 Warehouse Execution

#### Guided Tasks
- **Screen key:** `guided_tasks`
- **App Library blurb:** Operator task inbox with RF scan simulation for RM and FG movements.
- **Classic edition:** Task inbox with scan simulation for RM/FG.
- **Inside Logistics V7:** **Pepe — Zebra RF Guided Picking**
  - Persona: José Luis “Pepe” Martínez Gómez
  - Contracts: **MD** + **DA** exceptions
  - Handheld aesthetic (Zebra TC57)
  - Scan bin → scan pallet; wrong bin triggers SOURCE_MISMATCH
  - **F2 · Exception** opens recount path / redirect
- **Primary files:**
  - V7: `src/logistics/guided_tasks/ZebraPickingPage.tsx` via `GuidedTasksPage.tsx`
  - Classic: `src/logistics/pages/GuidedTasksPageLegacy.tsx`

---

### 3.8 Production Supply

#### Job Readiness
- **Screen key:** `job_readiness`
- **App Library blurb:** 10-stage picking readiness timeline and blockers for production jobs.
- **What it prototypes:** Multi-stage readiness timeline and blocker visibility before production start.
- **Primary file:** `src/logistics/pages/JobReadinessPage.tsx`

#### Production Alerts
- **Screen key:** `production_alerts`
- **App Library blurb:** Change alerts with shift-change escalation and resolve cascades.
- **What it prototypes:** Operational change alerts and escalation / resolve patterns across shifts.
- **Primary file:** `src/logistics/pages/ProductionAlertsPage.tsx`

#### Machine Material Status
- **Screen key:** `machine_status`
- **App Library blurb:** Line run state versus material readiness with pause/continue guidance.
- **What it prototypes:** Line running vs material readiness; pause/continue operator guidance.
- **Primary file:** `src/logistics/pages/MachineStatusPage.tsx`

---

### 3.9 WIP Traceability

#### WIP Control Tower
- **Screen key:** `wip_control_tower`
- **App Library blurb:** Traceable WIP objects, genealogy, scan moves, aging, and exception actions.
- **What it prototypes:** WIP object traceability, genealogy, aging, scan moves, exceptions.
- **Primary file:** `src/logistics/pages/WipControlTowerPage.tsx`

---

## 4. Inside Logistics V7 — Happy Path (reactive demo)

Use edition **Inside Logistics**. Shared state bus: `src/logistics/data/reactiveLogisticsDemo.ts` (localStorage).

### Demo sequence

1. **Lupita** (`logistics_mobile_ops`) — complete dock checklist → transfer custody of LP / lot into QA inspection.
2. **Pepe** (`guided_tasks`) — execute guided RF pick (optional parallel warehouse motion).
3. **Alejandra** (`quality_release`) — e-sign release of **LOT-A-114**.
4. **Gaby** (`shipment_readiness`) — sterilization light turns GREEN → **GO**.

**Reset Demo Data** button on V7 journey pages restores the initial Happy Path.

### Related V7 widgets (Workstation dashboard, not App Library cards)

| Widget id | Title | Role |
|---|---|---|
| `inbound_sla_chart` | Inbound Dock-to-Stock SLA | Inbound cycle-time SLA chart |
| `active_loads_timeline` | Sterilization Load Tracking | External sterilizer custody timeline |
| `line_shortage_risk` | Line Shortage Risk | Pick queues by line-stop risk (DA) |
| `spacex_shipping_gating` | SpaceX Shipping Gating Console | 4-gate release status for outbound |

Registered in `src/workstation/data/widgetRegistry.ts` and implemented under `src/logistics/widgets/`.

---

## 5. Screen key → file map (quick index)

| Screen key | App Library title | Main implementation |
|---|---|---|
| `logistics_mobile_ops` | Logistics Mobile Ops | `MobileReceivingPage.tsx` (V7) / `LogisticsMobileOpsPageLegacy.tsx` |
| `logistics_control_tower` | Logistics Control Tower | `LogisticsControlTowerPage.tsx` |
| `external_transfer_portal` | ASN Portal | `ExternalTransferPortalPage.tsx` |
| `quality_release` | Quality Release | `QualityReleasePage.tsx` (V7) / `*Legacy.tsx` |
| `shipment_readiness` | Shipment Readiness | `ShipmentReadinessPage.tsx` (V7) / `*Legacy.tsx` |
| `sterilization_tracker` | Sterilization Tracker | `SterilizationTrackerPage.tsx` |
| `pallet_verification` | Pallet Load Check | `PalletVerificationPage.tsx` |
| `guided_tasks` | Guided Tasks | `ZebraPickingPage.tsx` (V7) / `GuidedTasksPageLegacy.tsx` |
| `job_readiness` | Job Readiness | `JobReadinessPage.tsx` |
| `production_alerts` | Production Alerts | `ProductionAlertsPage.tsx` |
| `machine_status` | Machine Material Status | `MachineStatusPage.tsx` |
| `wip_control_tower` | WIP Control Tower | `WipControlTowerPage.tsx` |

Router: `src/logistics/AppRoutesLogistics.tsx`  
App Library source list: `src/workstation/components/WorkstationsLibraryScreen.tsx` (category `Logistic`)

---

## 6. Suggested analysis questions for Gemini Notebook

1. Which prototypes primarily serve **operators** vs **supervisors** vs **QA / compliance** vs **partners**?
2. Where do contracts **MD / DA / ID** appear explicitly, and where are they only implied?
3. What is missing to harden the Happy Path into a production release candidate (integration, audit, offline, roles)?
4. How should classic vs V7 editions converge without breaking demos?
5. Which screens are strongest for an executive BD walkthrough in under 10 minutes?
6. What KPI widgets belong on a standard Inside Logistics workstation by persona?
7. Map each prototype to IN01–OB03 macroflow stages and identify coverage gaps.

---

## 7. Deep dive packs (Gemini notebooks)

Each Logistic App Library card has a **standalone deep-dive document** under `docs/prototypes/` for Gemini Notebook analysis (~600+ lines each: routing, UX, seed data, demo scripts, gaps, cross-links).

| # | Prototype | Screen key | Deep dive doc |
|---|---|---|---|
| 01 | Logistics Mobile Ops | `logistics_mobile_ops` | [01_LOGISTICS_MOBILE_OPS_GEMINI_NOTEBOOK.md](docs/prototypes/01_LOGISTICS_MOBILE_OPS_GEMINI_NOTEBOOK.md) |
| 02 | Logistics Control Tower | `logistics_control_tower` | [02_LOGISTICS_CONTROL_TOWER_GEMINI_NOTEBOOK.md](docs/prototypes/02_LOGISTICS_CONTROL_TOWER_GEMINI_NOTEBOOK.md) |
| 03 | ASN Portal | `external_transfer_portal` | [03_ASN_PORTAL_GEMINI_NOTEBOOK.md](docs/prototypes/03_ASN_PORTAL_GEMINI_NOTEBOOK.md) |
| 04 | Quality Release | `quality_release` | [04_QUALITY_RELEASE_GEMINI_NOTEBOOK.md](docs/prototypes/04_QUALITY_RELEASE_GEMINI_NOTEBOOK.md) |
| 05 | Shipment Readiness | `shipment_readiness` | [05_SHIPMENT_READINESS_GEMINI_NOTEBOOK.md](docs/prototypes/05_SHIPMENT_READINESS_GEMINI_NOTEBOOK.md) |
| 06 | Pallet Load Check | `pallet_verification` | [06_PALLET_LOAD_CHECK_GEMINI_NOTEBOOK.md](docs/prototypes/06_PALLET_LOAD_CHECK_GEMINI_NOTEBOOK.md) |
| 07 | Sterilization Tracker | `sterilization_tracker` | [07_STERILIZATION_TRACKER_GEMINI_NOTEBOOK.md](docs/prototypes/07_STERILIZATION_TRACKER_GEMINI_NOTEBOOK.md) |
| 08 | Guided Tasks | `guided_tasks` | [08_GUIDED_TASKS_GEMINI_NOTEBOOK.md](docs/prototypes/08_GUIDED_TASKS_GEMINI_NOTEBOOK.md) |
| 09 | Job Readiness | `job_readiness` | [09_JOB_READINESS_GEMINI_NOTEBOOK.md](docs/prototypes/09_JOB_READINESS_GEMINI_NOTEBOOK.md) |
| 10 | Production Alerts | `production_alerts` | [10_PRODUCTION_ALERTS_GEMINI_NOTEBOOK.md](docs/prototypes/10_PRODUCTION_ALERTS_GEMINI_NOTEBOOK.md) |
| 11 | Machine Material Status | `machine_status` | [11_MACHINE_MATERIAL_STATUS_GEMINI_NOTEBOOK.md](docs/prototypes/11_MACHINE_MATERIAL_STATUS_GEMINI_NOTEBOOK.md) |
| 12 | WIP Control Tower | `wip_control_tower` | [12_WIP_CONTROL_TOWER_GEMINI_NOTEBOOK.md](docs/prototypes/12_WIP_CONTROL_TOWER_GEMINI_NOTEBOOK.md) |

**Status:** All **12** Logistic prototypes documented (series complete).

Recommended reading order for demos: **01 → 02** (overview) · **04 → 05** (V7 Happy Path) · **08–12** (execution & WIP) · **03 / 06 / 07** (partner, FG physical, steril network).

---

## 8. Out of scope (intentionally excluded)

This document does **not** cover:
- Non-logistic App Library categories (Operations, Maintenance, Planning, Quality, EHS/ESO, Tools)
- Workstation personalization UX beyond logistics widgets
- Full Smart Factory platform architecture outside logistics

---

*Generated for Gemini Notebook analysis from the BD Smart Factory / Inside Logistics POC (`bd-ai-poc`).*
