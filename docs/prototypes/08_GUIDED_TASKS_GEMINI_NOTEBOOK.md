# Prototype Deep Dive 08 — Guided Tasks

**Product:** BD Smart Factory / Inside Logistics (`bd-ai-poc`)  
**App Library card:** Guided Tasks  
**Screen key:** `guided_tasks`  
**Category:** Logistic → Warehouse Execution  
**Live demo:** https://guillermesmozzer.github.io/bd-ai-poc/  
**Audience:** Gemini Notebook analysis (single-prototype pack)

---

## 0. Document control

| Field | Value |
|---|---|
| Prototype name | Guided Tasks |
| Primary journey role | Warehouse operator execution — **Pepe (V7)** or **Operator Task Inbox (Classic)** |
| Happy Path position | Step **2 of 4** (Lupita → **Pepe** → Alejandra → Gaby) — **optional parallel**, does not gate QA or shipping |
| Editions | **Fork:** Classic = task inbox · Inside Logistics V7 = Zebra RF single-task UI |
| Spec / data alignment | V7: `reactiveLogisticsDemo` (`guided_pick_tasks`) · Classic: CDF Gold `logisticsMockData.guided_tasks` |
| Process map claim | Warehouse execution · RM/FG directed movement · RF scan confirmation |
| Router | `src/logistics/AppRoutesLogistics.tsx` |
| Primary files | V7: `src/logistics/guided_tasks/ZebraPickingPage.tsx` (~418 lines) · Classic: `src/logistics/pages/GuidedTasksPageLegacy.tsx` (~495 lines) |
| Visual system | V7: fullscreen dark Zebra TC57 sim (#0B132B, max 420px) · Classic: light `LogisticsPageShell` + drawer |

---

## 1. Executive summary

**Guided Tasks** prototypes **directed warehouse execution** with RF scan confirmation for raw-material and finished-goods movements.

The **same App Library card** renders **two different products** depending on edition:

| Edition | Product | Operator model |
|---|---|---|
| **Inside Logistics V7** | **Pepe — Zebra RF Guided Picking** | José Luis “Pepe” Martínez Gómez on handheld TC57 |
| **Classic** | **Operator Task Inbox** | Multi-operator RM/FG task board with scan simulation drawer |

### V7 (Pepe) — Happy Path step 2

1. **One task at a time** (Instacart-style) from reactive pick queue.
2. **SCAN BIN BARCODE** → unlock **SCAN PALLET ID** (Directed Movement **MD**).
3. Wrong bin → red flash + square-wave buzzer + `SOURCE_MISMATCH` (URS-150-003, URS-170-002).
4. **F2 · Exception** → Assisted Decision (**DA**): reason picker, task → `EXCEPTION`, audit `PICK_EXCEPTION_F2`, recount narrative in Control Tower.
5. **Reset Demo Data** restores `guided_pick_tasks` + full Happy Path localStorage bus.

### Classic — CDF warehouse inbox

1. **7 seeded transfer-order tasks** (TO-0709-101 … TO-0709-203) across RM and FG.
2. Tabs: Task Inbox · RM Tasks · FG Tasks · Supervisor Board.
3. Task cards → drawer with **RF scan simulation** (OK / Wrong per step) and placeholder exception buttons.
4. **Static snapshot** — no localStorage writes; filters and drawer state are session-only.

**Naming:** App Library **Guided Tasks** · V7 nav label **Pepe — Zebra RF Scanner** · Classic page title **Operator Task Inbox**.

---

## 2. How to open this prototype

### Path A — App Library
1. Sign in.
2. Header → **apps grid**.
3. Category **Logistic**.
4. Card **Guided Tasks**  
   - Subheading: *Warehouse Execution*  
   - Description: *“Operator task inbox with RF scan simulation for RM and FG movements.”*  
   - *(V7 edition replaces inbox UI with Pepe RF screen; card copy is classic-oriented.)*

### Path B — Side navigation (Logistic)
- **Classic:** child **Guided Tasks** → `guided_tasks`.
- **Inside Logistics V7:** child **Pepe — Zebra RF Scanner** → same `guided_tasks` key.

### Path C — Inside Logistics Happy Path shortcuts
- App Library drawer block **Inside Logistics · Happy Path** → **2. Pepe** (*Zebra RF Picking*).
- MainLayout journey menu → **2. Pepe — Zebra RF**.
- Workstation quick links → **Pepe Zebra RF**.

### Path D — Edition switch
- `?edition=inside_logistics` → V7 Pepe UI.
- `?edition=classic` (or default classic) → Operator Task Inbox.

### Path E — Name map
`AppContent.tsx`: `'Guided Tasks'` → `'guided_tasks'`.

### Back navigation
- **Classic:** `LogisticsPageShell` → **Logistics Control Tower**.
- **V7:** No page shell; global AppBar remains; dark fullscreen RF viewport.

---

## 3. Routing & architecture

```text
App Library / Nav / Happy Path shortcuts
        │
        ▼
screen key: guided_tasks
        │
        ▼
AppRoutesLogistics.tsx
        │
        ├── edition === inside_logistics
        │         └── pages/GuidedTasksPage.tsx (re-export)
        │                   └── guided_tasks/ZebraPickingPage.tsx
        │
        └── edition === classic
                  └── pages/GuidedTasksPageLegacy.tsx
```

### Edition fork (critical for Gemini)

```typescript
// AppRoutesLogistics.tsx
case 'guided_tasks':
  page = isInsideLogistics ? <GuidedTasksPageV7 /> : <GuidedTasksPageClassic />;
```

**Same screen key, different data bus, different UX paradigm.**

---

## 4. Progressive disclosure model

### V7 — Pepe

| Layer | What user sees | Implementation |
|---|---|---|
| L0 | Active pick task fields (ID, location, SKU, qty) | `activeTask` = first OPEN or IN_PROGRESS |
| L1 | Progress bar (item N of M) | `progressIndex` / `progressTotal` |
| L2 | Bin scan phase | `binScanned === false` → SCAN BIN buttons |
| L3 | Pallet scan phase | After correct bin → SCAN PALLET ID |
| L4 | F2 Exception dialog | Fixed bottom-right FAB + MUI Dialog |

When no active task: success Alert *“All guided tasks complete or in exception…”*

### Classic — Task Inbox

| Layer | What user sees | Implementation |
|---|---|---|
| L0 | Tab + operator/status filters | `tab`, `operatorFilter`, `statusFilter` |
| L1 | Task card grid | Click card → `openTask(taskId)` |
| L2 | Drawer: task details | `LogisticsDrawer` 460px |
| L3 | RF scan simulation rows | Per-step OK / Wrong |
| L4 | Exception capture placeholders | Four error buttons → local `exceptionMsg` only |

---

## 5. Personas / roles

| Role | Edition | How this prototype serves them |
|---|---|---|
| **José Luis “Pepe” Martínez Gómez** | V7 | Named actor on audit trail; RF picker executing MD picks |
| **K. Ortiz — Picker** (`USR-picker-01`) | Classic | 5 RM tasks assigned |
| **S. Kim — FG Operator** (`USR-fg-op`) | Classic | 2 FG tasks (OB-0709-002 chain) |
| Warehouse supervisor | Classic | **Supervisor Board** tab — active/blocked/SLA risk per operator |
| Control Tower / supply planner | Widget | **Line Shortage Risk** widget surfaces bins matching Pepe tasks |

Pepe is **not** a named user id in `logisticsMockData.users` — persona exists only in V7 reactive audit strings.

---

## 6. Data sources

### 6.1 V7 — Used (`reactiveLogisticsDemo.ts`)

| Key / API | Role |
|---|---|
| `LOGISTICS_DEMO_KEYS.pickTasks` (`guided_pick_tasks`) | Pick task queue in localStorage |
| `getPickTasks()` / `setPickTasks()` | Read/write queue |
| `appendAudit()` | PICK_UNIT_CONFIRMED · PICK_TASK_COMPLETED · PICK_EXCEPTION_F2 |
| `subscribeLogisticsDemo()` | Cross-tab / same-page refresh on storage events |
| `resetLogisticsDemoData()` | Clears all demo keys + reload (via Reset Demo Data button) |

**localStorage keys on V7 page:** `guided_pick_tasks`, `logistics_audit_trail`, plus sibling Happy Path keys (pallets, shipments, etc.).

### 6.2 Classic — Used (`logisticsMockData.ts`)

| Source | Role |
|---|---|
| `logisticsData.guided_tasks` | 7 task rows (static) |
| `logisticsData.users` | Operator display names |
| `logisticsData.as_of` | Shell timestamp `2026-07-09T14:30:00-06:00` |

### 6.3 Parallel data universe (important)

| Track | Task IDs | SKU examples | Mutable |
|---|---|---|---|
| **V7 reactive** | PW-9021, PW-9022 | BD-8805-SYR, BD-3304-NDL | Yes (localStorage) |
| **Classic CDF** | TO-0709-101 … 203 | 88210, 44102, 12088, … | No |

**No sync** between PW-* and TO-* IDs. Demo narrators must pick one track per storyline.

### 6.4 Narrative cross-links (not live-wired)

| Classic entity | Linked narrative |
|---|---|
| TO-0709-102 | `production_order_id: PO-100234` · `picking_order_id: PICK-0709-044` · EXC-0709-005 material_not_found |
| TO-0709-201/202 | `outbound_shipment_id: OB-0709-002` → Shipment Readiness classic |
| V7 PW-9021 | Same SKU **BD-8805-SYR** as Lupita pallet ELP2026.101 / LOT-A-114 story |
| V7 shortages widget | `suggestedBin: BIN-RMW-B-14-02` matches PW-9021 location |

Completing Pepe picks does **not** auto-clear `line_shortage_risk` rows or classic exceptions.

### 6.5 Not used on this screen

| Source | Note |
|---|---|
| `logisticsMockData.guided_tasks` | V7 Pepe ignores CDF inbox |
| `wipMockData` | WIP Control Tower separate product |
| SAP WM transfer posting | Scan success copy says “movement posted” in classic only — no backend |

---

## 7. V7 seeded pick tasks (exact)

### PW-9021 — LINE-03 syringe plunger (critical shortage alignment)

| Field | Value |
|---|---|
| Location | **BIN-RMW-B-14-02** |
| SKU | **BD-8805-SYR** |
| Material | Syringe Plunger |
| Qty | **3** units |
| Progress | Item **1** of **3** (seed) |
| Status | **OPEN** |

Widget **SHORT-01**: LINE-03 Filling · critical · **18 min** to stop · same bin · qtyNeeded **3**.

### PW-9022 — LINE-05 needle

| Field | Value |
|---|---|
| Location | **BIN-RMW-C-08-01** |
| SKU | **BD-3304-NDL** |
| Material | Precision Needle 22G |
| Qty | **2** units |
| Progress | Item **1** of **2** |
| Status | **OPEN** |

Widget **SHORT-02**: LINE-05 Assembly · high · 42 min · same bin · qtyNeeded **2**.

### Task selection rule

`activeTask` = first task where `status === 'OPEN' || status === 'IN_PROGRESS'`.

Queue order: PW-9021 first, then PW-9022 after 9021 **COMPLETED** or **EXCEPTION**.

### Status enum

`OPEN` → `IN_PROGRESS` (bin confirmed) → `COMPLETED` (all units scanned) · or `EXCEPTION` (F2).

---

## 8. Classic seeded tasks (all 7)

| task_id | type | area | priority | status | operator | key links |
|---|---|---|---|---|---|---|
| TO-0709-101 | putaway | RM | high | in_progress | USR-picker-01 | WM-TO-44901 |
| TO-0709-102 | rm_picking | RM | **critical** | not_started | USR-picker-01 | **PO-100234**, PICK-0709-044 |
| TO-0709-103 | kitting | RM | normal | **blocked** | USR-picker-01 | blocker: blocked_by_quality |
| TO-0709-104 | replenishment | RM | high | not_started | *unassigned* | REPL-0709-008 |
| TO-0709-201 | fg_picking | FG | **critical** | in_progress | USR-fg-op | **OB-0709-002** |
| TO-0709-202 | fg_staging | FG | high | not_started | USR-fg-op | OB-0709-002 |
| TO-0709-203 | receiving_validation | RM | normal | not_started | USR-picker-01 | TS-2026-0709-005 |

### Task type labels (`TASK_LABELS`)

| task_type | UI label |
|---|---|
| putaway | Guided Putaway |
| rm_picking | Guided RM Picking |
| kitting | Guided Kitting |
| replenishment | Kanban Replenishment |
| fg_picking | FG Picking |
| fg_staging | FG Shipping Staging |
| receiving_validation | Receiving Validation |

### Guided execution copy (`GUIDED_COPY`) — drawer section when defined

- putaway: *1. Scan pallet → 2. System suggests destination → 3. Scan location → 4. Confirm movement*
- rm_picking: *Scan source bin → scan pallet → confirm qty → scan destination*
- kitting: *Digital kit checklist — scan each BOM component and confirm quantity*
- replenishment: *Kanban trigger → replenish to supermarket 415 → scan confirm*
- fg_staging: *Pick released FG → stage shipment → confirm pallet config → scan dock/container*

*(fg_picking and receiving_validation have no GUIDED_COPY entry — drawer omits “Guided execution” section.)*

---

## 9. V7 UX — step-by-step (Pepe)

### 9.1 Page chrome

| Element | Exact |
|---|---|
| `aria-label` on main | Zebra RF Guided Picking — Pepe |
| Heading (h1) | **Zebra TC57 · RF Guided Picking · Pepe** |
| Background | `#0B132B` full viewport |
| Device frame | maxWidth **420px**, `#111827`, border `#374151` (error: `#FCA5A5` + red flash `#7f1d1d`) |
| Reset | Top-right **Reset Demo Data** (confirm → clear localStorage → reload) |

**No `LogisticsPageShell`** — unlike most Logistic cards.

### 9.2 Active task display

Fields shown in monospace / RF typography (`logisticsType.rfLabel`, `rfValue`, `rfValueLg`):

- **TASK ID** — e.g. PW-9021  
- **LOCATION** — bin code  
- **SKU** + material name in caption  
- **QTY** — `PICK {n}x UNITS`  
- **PROGRESS** — LinearProgress + “Item X of Y”

### 9.3 Bin scan phase

| Control | Behavior |
|---|---|
| **SCAN BIN BARCODE** | `scanBin(true)` → status IN_PROGRESS · `binScanned=true` · status message confirms bin |
| **Simulate Wrong Bin Scan** | `scanBin(false)` → mismatch UI · 180Hz buzzer 220ms · red flash 500ms · **no persist** |

Wrong bin Alert copy:

> SOURCE_MISMATCH: Physical position does not match FIFO and lot rules [URS-150-003, URS-170-002]

Live region (`aria-live="assertive"`) announces `statusMessage` off-screen.

### 9.4 Pallet scan phase

**SCAN PALLET ID [URS-170-002]** — each click:

- Increments `progressIndex` (capped at `progressTotal`)
- If not done: audit `PICK_UNIT_CONFIRMED` (MD)
- If done: status `COMPLETED`, audit `PICK_TASK_COMPLETED`
- Resets `binScanned` for next unit in same task (multi-unit loop)

### 9.5 F2 Exception

| Element | Detail |
|---|---|
| FAB | **F2 · Exception** — fixed bottom-right, `#C2410C`, disabled when no active task |
| Dialog title | F2 — Yard / Bin Exception |
| Body | Safely cancels the task, opens recount in Control Tower, redirects Pepe… |
| Reasons | Aisle out of stock · Damaged pallet · Blocked bin · FIFO/lot mismatch |
| Submit | Task → `EXCEPTION` + audit `PICK_EXCEPTION_F2` (DA) with reason |

### 9.6 Completion state

When both tasks COMPLETED or EXCEPTION:

> All guided tasks complete or in exception. Reset Demo Data to replay.

---

## 10. Classic UX — step-by-step

### 10.1 Page chrome

| Element | Exact |
|---|---|
| Title | **Operator Task Inbox** |
| Subtitle | Guided RM & FG execution · RF/mobile scan confirmation |
| Panel | **Guided tasks** |

### 10.2 Tabs & filters

**Tabs:** Task Inbox · RM Tasks · FG Tasks · Supervisor Board

**Filters:** Operator (All / K. Ortiz / S. Kim) · Status (not_started · in_progress · blocked · completed)

Supervisor KPIs (tab 4): Total 7 · In progress 2 · Blocked 1 · Critical priority 2

### 10.3 Task cards

Grid 1–3 columns; click opens drawer.

Visual cues:
- **blocked** → red-tinted background + blocker caption
- **critical** priority → danger border
- Chips for each `required_scans` entry (*Scan: Pallet*, etc.)

### 10.4 Drawer sections

1. **Task details** — item, route, priority/status pills, deadline, operator, badge/device, optional PO or outbound shipment  
2. **RF scan simulation** — numbered steps with OK / Wrong  
3. **Guided execution** — if `GUIDED_COPY[task_type]` exists  
4. **Exception capture** — Material not found · Qty mismatch · Damaged box · Blocked by Quality → placeholder message only

Scan OK advances step state machine: pending → active → done; Wrong → fail state + red message.

Final OK message: *“All scans confirmed — movement posted (audit trail recorded).”* — **prototype only**, no audit write.

---

## 11. Contract model (V7 spec alignment)

| Interaction | Contract | Audit action |
|---|---|---|
| Bin + pallet confirm | **MD** (Directed Movement) | `PICK_UNIT_CONFIRMED` / `PICK_TASK_COMPLETED` |
| F2 Exception | **DA** (Assisted Decision) | `PICK_EXCEPTION_F2` |
| Wrong bin | Compliance signal | No audit row (operator must correct or F2) |

URS references embedded in UI: URS-150-003, URS-170-002.

---

## 12. Related widget (V7 workstation — not this card)

**Line Shortage Risk** (`line_shortage_risk` / `LineShortageRiskWidget.tsx`):

- Reads `getShortages()` from same reactive bus
- Caption: *Picking queues prioritized by imminent line-stop risk (DA — Assisted Decision).*
- Columns: Line · SKU · Risk · ETA stop · Bin
- THIRD row SHORT-03 (BD-4410-RES) has **no** matching PW-* task in seed — illustrates broader CT view

Widget lives on **StandardWorkstationDashboard** / **PersonalWorkstationDashboard**, not on Pepe screen.

---

## 13. Control Tower & macroflow relationships

Guided Tasks is **not** a declared macroflow screen in `macroflowModel` (unlike Sterilization Tracker or Shipment Readiness).

Indirect CT ties:

| Mechanism | Story |
|---|---|
| EXC-0709-005 | Classic rm_picking TO-0709-102 / PICK-0709-044 — material not found |
| F2 exception copy | “Recount ticket opened in Control Tower” — aspirational, no CT UI mutation |
| Line Shortage Risk widget | DA prioritization visible to leaders while Pepe executes MD |
| Job Readiness (pack 09) | Adjacent production-supply timeline — not wired to PW-* completion |

---

## 14. Happy Path position & handoff

```text
Lupita (logistics_mobile_ops) — MD dock custody
        │
        ├──────────────────────────────────┐
        ▼                                  ▼
Pepe (guided_tasks) — optional DA/MD     (parallel warehouse motion)
        │                                  │
        └────────── NOT A HARD GATE ───────┘
                        │
                        ▼
Alejandra (quality_release) — LOT-A-114 e-sign
                        │
                        ▼
Gaby (shipment_readiness) — sterilization gate → GO
```

**Pepe completion does not unlock Alejandra or Gaby.** Narrative link is SKU/material alignment (BD-8805-SYR) and shortage widget, not state machine coupling.

---

## 15. Accessibility & localization

### V7
- English-only UI.
- Dark theme with `focusVisibleOnDarkSx`, `touchTargetSx`, `reducedMotionSx`.
- Screen reader: hidden assertive live region for scan status.
- `aria-invalid` on device region when mismatch.
- Progress bar: full ARIA value props.
- Exception dialog: labelled title + description ids.

### Classic
- Light theme `focusVisible` on drawer buttons.
- Table supervisor board — standard MUI table semantics.
- Task cards are click-only (no keyboard card pattern).

---

## 16. Exact copy catalog (high-signal)

### App Library
- Guided Tasks · Warehouse Execution  
- Operator task inbox with RF scan simulation for RM and FG movements.

### V7 Pepe
- Zebra TC57 · RF Guided Picking · Pepe  
- SCAN BIN BARCODE / Simulate Wrong Bin Scan  
- SCAN PALLET ID [URS-170-002]  
- SOURCE_MISMATCH: Physical position does not match FIFO and lot rules  
- F2 · Exception / F2 — Yard / Bin Exception  
- All guided tasks complete or in exception. Reset Demo Data to replay.

### Classic inbox
- Operator Task Inbox  
- Guided RM & FG execution · RF/mobile scan confirmation  
- Wrong material / location scanned — blocked. Correct and rescan.  
- Exception captured: … (prototype placeholder)  
- Creates Exception · ScanEvent for audit trail  

### Happy Path shortcuts
- 2. Pepe · Zebra RF Picking  
- Open in this order: Lupita → Pepe → Alejandra → Gaby  

---

## 17. File map

| File | Responsibility |
|---|---|
| `src/logistics/guided_tasks/ZebraPickingPage.tsx` | **V7 full RF UI** |
| `src/logistics/pages/GuidedTasksPage.tsx` | Re-export → V7 |
| `src/logistics/pages/GuidedTasksPageLegacy.tsx` | **Classic inbox + drawer** |
| `src/logistics/data/reactiveLogisticsDemo.ts` | Pick tasks, shortages, audit, reset |
| `src/logistics/data/logisticsMockData.ts` | Classic `guided_tasks` (7 rows) |
| `src/logistics/AppRoutesLogistics.tsx` | Edition fork |
| `src/logistics/components/ResetDemoDataButton.tsx` | V7 reset toolbar |
| `src/logistics/widgets/LineShortageRiskWidget.tsx` | Related DA widget |
| `src/workstation/data/widgetRegistry.ts` | `line_shortage_risk` registration |
| `src/navigation/navigationConfig.tsx` | INSIDE_LOGISTICS_LABELS Pepe rename |
| `src/workstation/components/AppLibraryDrawer.tsx` | Happy Path step 2 tile |
| `src/workstation/components/WorkstationsLibraryScreen.tsx` | App Library card |
| `src/FilesMD/cursor-prompt-specification-v7.md` | § Pepe spec |
| `src/common/contexts/EditionContext.tsx` | Edition descriptions |

---

## 18. Visual / interaction notes

| Aspect | V7 Pepe | Classic inbox |
|---|---|---|
| Theme | Dark handheld sim | Light operational board |
| Density | Single task, large tap targets | Multi-card grid + drawer |
| Persistence | localStorage pick queue + audit | None (React state only) |
| Error UX | Flash + buzzer + border | Red step row + caption |
| Shell | No LogisticsPageShell | Standard shell + back to CT |
| Global chrome | AppBar visible | AppBar visible |

---

## 19. Demo script (recommended)

### Script A — V7 Happy Path step 2 (Pepe)
1. Set edition **Inside Logistics** (`?edition=inside_logistics`).
2. Happy Path shortcut → **2. Pepe**.
3. Confirm **PW-9021** at BIN-RMW-B-14-02 · BD-8805-SYR · 3 units.
4. **SCAN BIN BARCODE** → **SCAN PALLET ID** ×3 until task completes.
5. Open workstation widget **Line Shortage Risk** in second pane — compare SHORT-01 bin/qty (static).
6. Complete **PW-9022** or use **F2 · Exception** on second task.
7. **Reset Demo Data** → queue restores.

### Script B — V7 wrong bin compliance
1. On PW-9021, click **Simulate Wrong Bin Scan**.
2. Observe red flash + error Alert + buzzer (if audio allowed).
3. Recover with correct **SCAN BIN BARCODE**.

### Script C — Classic critical RM pick + exception chain
1. Edition **Classic** → Guided Tasks.
2. Tab **RM Tasks** → open **TO-0709-102** (critical, PO-100234).
3. Walk scan steps OK in drawer.
4. Cross-reference **Logistics Control Tower** exception **EXC-0709-005** (material not found).

### Script D — Classic FG outbound chain
1. Open **TO-0709-201** (fg_picking, OB-0709-002).
2. Then **TO-0709-202** (fg_staging, same shipment).
3. Jump to **Shipment Readiness** classic → OB-0709-002 pledge story.

### Script E — Supervisor view
1. Tab **Supervisor Board**.
2. KPIs: 2 in progress, 1 blocked, 2 critical.
3. Table: K. Ortiz (RM, blocked count) vs S. Kim (FG, critical SLA risk).

### Script F — Edition contrast (same card)
1. Open Guided Tasks classic → inbox.
2. Switch to Inside Logistics → same nav key, Pepe RF replaces entire page.

---

## 20. Analysis prompts for Gemini Notebook

1. Unify **PW-9021/9022** reactive queue with **TO-0709-*** CDF tasks — single WM task model?  
2. Should completing PW-9021 decrement **Line Shortage Risk** SHORT-01 automatically?  
3. Wire F2 **EXCEPTION** to create **EXC-0709-005**-style rows in CT exceptions list.  
4. Design deep-link `?task=PW-9021` from shortage widget bin column.  
5. Map Pepe picks to **Job Readiness** 10-stage timeline (pack 09).  
6. Classic drawer “movement posted” — implement real `appendAudit` parity with V7.  
7. Keyboard-first task selection for classic card grid.  
8. Offline RF queue sync spec for real Zebra TC57 deployment.  
9. FIFO/lot mismatch: when wrong bin should offer **alternate bin DA** vs hard stop.  
10. Multi-operator V7 — queue assignment vs single activeTask global queue.  
11. Integrate **TO-0709-103** quality blocker with Quality Release quarantine state.  
12. FG pick **TO-0709-201** → reactive **SHIP-QRO-15** / Gaby gates — define coupling rules.  
13. App Library card description: edition-aware copy (Pepe vs inbox).  
14. Audit trail unification: `logistics_audit_trail` vs classic “ScanEvent” placeholder.  
15. Supervisor Board SLA risk — define calculation behind “Yes” critical pill.

---

## 21. Known gaps & demo limitations

1. **Dual task models** (PW-* vs TO-*) confuse cross-edition demos.  
2. **Shortage widget static** — Pepe completion does not update SHORT-* rows.  
3. **F2 → Control Tower** is copy-only; no exception row created.  
4. **Classic scans** do not write audit trail despite messaging.  
5. **Classic task status** never transitions (in_progress stays in_progress).  
6. **No deep-link** query param for task id.  
7. **Pepe queue** is global, not per-operator device session.  
8. **Wrong bin** does not increment retry counters or lock operator.  
9. **EXCEPTION** tasks stay terminal — no redirect to “alternate bin” task seed.  
10. **TO-0709-104** unassigned — no UX to claim task.  
11. **V7** does not show Line Shortage context on Pepe screen itself.  
12. **App Library blurb** describes classic inbox even when V7 is default in Inside Logistics edition.  
13. **No macroflow** GO TO from Control Tower directly to Pepe.  
14. **Audio buzzer** may fail silently in restricted browser contexts (caught).  
15. **progressIndex** seed starts at 1 while label says “Item 1 of 3” before first pallet scan — confirm semantics for Gemini test scripts.  
16. **Third shortage** SHORT-03 has no matching pick task in V7 seed.

---

## 22. Relationship to other logistics prototypes

| Prototype | Relationship |
|---|---|
| **Logistics Mobile Ops (Lupita)** | Step 1 · same BD-8805-SYR / LOT-A-114 inbound narrative |
| **Quality Release (Alejandra)** | Step 3 · not gated by Pepe |
| **Shipment Readiness (Gaby)** | Step 4 · classic FG tasks link OB-0709-002 |
| **Logistics Control Tower** | Exceptions EXC-0709-005 · shortage visibility |
| **Job Readiness** | Next pack — production job timeline adjacent to RM picks |
| **Machine Material Status** | Line running vs material readiness — complementary DA view |
| **WIP Control Tower** | Internal scan moves — different object model |
| **Pallet Load Check** | Downstream FG physical verification |

Conceptual warehouse stack:

```text
Inbound (Lupita) → Directed picks (THIS — Pepe / inbox)
        │
        ▼
Production supply (Job Readiness / Machine Status / Shortage widget)
        │
        ▼
QA release → FG pick/stage (classic TO-0709-201/202) → Shipping (Gaby)
```

---

## 23. One-page cheat sheet

```text
OPEN: App Library → Logistic → Guided Tasks
   or Happy Path → 2. Pepe (V7 only)
   or Nav → Pepe — Zebra RF Scanner (inside_logistics edition)

EDITION FORK:
  inside_logistics → ZebraPickingPage (Pepe, dark RF)
  classic          → GuidedTasksPageLegacy (Operator Task Inbox)

V7 DATA: reactiveLogisticsDemo guided_pick_tasks
  PW-9021 BIN-RMW-B-14-02 BD-8805-SYR ×3
  PW-9022 BIN-RMW-C-08-01 BD-3304-NDL ×2
  Reset Demo Data restores queue

CLASSIC DATA: logisticsMockData.guided_tasks (7 TO-0709-* tasks, static)

FLOW (V7): SCAN BIN → SCAN PALLET (repeat) → next task
  Wrong bin → SOURCE_MISMATCH + buzzer
  F2 → EXCEPTION + audit PICK_EXCEPTION_F2 (DA)

WIDGET: line_shortage_risk (DA bins align with PW-* — not auto-sync)

HAPPY PATH: Step 2 optional — does NOT gate Alejandra/Gaby
```

---

## 24. Cross-pack index

| # | Prototype pack | Screen key | Doc |
|---|---|---|---|
| 01 | Logistics Mobile Ops | `logistics_mobile_ops` | `docs/prototypes/01_LOGISTICS_MOBILE_OPS_GEMINI_NOTEBOOK.md` |
| 02 | Logistics Control Tower | `logistics_control_tower` | `docs/prototypes/02_LOGISTICS_CONTROL_TOWER_GEMINI_NOTEBOOK.md` |
| 03 | ASN Portal | `external_transfer_portal` | `docs/prototypes/03_ASN_PORTAL_GEMINI_NOTEBOOK.md` |
| 04 | Quality Release | `quality_release` | `docs/prototypes/04_QUALITY_RELEASE_GEMINI_NOTEBOOK.md` |
| 05 | Shipment Readiness | `shipment_readiness` | `docs/prototypes/05_SHIPMENT_READINESS_GEMINI_NOTEBOOK.md` |
| 06 | Pallet Load Check | `pallet_verification` | `docs/prototypes/06_PALLET_LOAD_CHECK_GEMINI_NOTEBOOK.md` |
| 07 | Sterilization Tracker | `sterilization_tracker` | `docs/prototypes/07_STERILIZATION_TRACKER_GEMINI_NOTEBOOK.md` |
| 08 | **Guided Tasks** | `guided_tasks` | **this file** |
| 09 | Job Readiness | `job_readiness` | `docs/prototypes/09_JOB_READINESS_GEMINI_NOTEBOOK.md` |
| 10 | Production Alerts | `production_alerts` | `docs/prototypes/10_PRODUCTION_ALERTS_GEMINI_NOTEBOOK.md` |
| 11 | Machine Material Status | `machine_status` | `docs/prototypes/11_MACHINE_MATERIAL_STATUS_GEMINI_NOTEBOOK.md` |
| 12 | WIP Control Tower (next) | `wip_control_tower` | *(pending)* |

Catalog overview: `LOGISTICS_PROTOTYPES_GEMINI_NOTEBOOK.md`.
