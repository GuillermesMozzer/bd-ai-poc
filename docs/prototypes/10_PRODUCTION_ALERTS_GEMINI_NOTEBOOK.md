# Prototype Deep Dive 10 — Production Alerts

**Product:** BD Smart Factory / Inside Logistics (`bd-ai-poc`)  
**App Library card:** Production Alerts  
**Screen key:** `production_alerts`  
**Category:** Logistic → Production Supply  
**Live demo:** https://guillermesmozzer.github.io/bd-ai-poc/  
**Audience:** Gemini Notebook analysis (single-prototype pack)

---

## 0. Document control

| Field | Value |
|---|---|
| Prototype name | Production Alerts |
| Primary journey role | Production planner / shift lead — **change alert triage** with escalation and resolve cascades |
| Happy Path position | **Outside** Lupita → Pepe → Alejandra → Gaby reactive chain |
| Editions | **Same UI** for Classic and Inside Logistics (no edition fork) |
| Spec / data alignment | `workshopDay2Data.ts` — shared **Workshop Day 2** bus with Job Readiness + Machine Material Status |
| Process map claim | Production supply change management · shift-handoff escalation |
| Router | `src/logistics/AppRoutesLogistics.tsx` |
| Primary file | `src/logistics/pages/ProductionAlertsPage.tsx` (~523 lines) |
| Visual system | Light `LogisticsPageShell` + alert feed list + 560px action drawer |

---

## 1. Executive summary

**Production Alerts** is the **Production Change Alert Center** for El Paso demo operations.

It prototypes:

1. **Alert feed** — chronological list of production change events (priority, lot, machine stop, schedule, material release) with severity, lifecycle state, owner, and due time.
2. **KPI strip** — new unacknowledged, in progress, escalated/due soon, resolved counts.
3. **Detail drawer** — change narrative, linked job/machine, downstream impact, **shift-change escalation chain**, action buttons, audit trail.
4. **Interactive lifecycle** — Acknowledge · Assign owner · Escalate · **Resolve** (session-local mutations).
5. **Resolve cascade (demo-only)** — resolving **ALT-DEMO-001** mutates **JOB-DEMO-001** stages and **LINE-03** machine row **within this page’s React state** — the only Workshop Day 2 screen with cross-entity cascade on resolve.

It completes the **Workshop Day 2 connected flow**:

```text
ALT-DEMO-001 (THIS PAGE — Resolve)
        │
        ├──► JOB-DEMO-001 label_cage_prep → complete · readiness 85%
        └──► LINE-03 status running · material staged
```

**Naming:** App Library **Production Alerts** · page title **Production Change Alert Center** · subtitle *Lot, priority, machine, schedule changes*.

Unlike V7 Happy Path screens, this page does **not** use `reactiveLogisticsDemo` or **Reset Demo Data**. Mutations are **lost on refresh** and **do not sync** to Job Readiness or Machine Status if those pages were opened separately.

---

## 2. How to open this prototype

### Path A — App Library
1. Sign in.
2. Header → **apps grid**.
3. Category **Logistic**.
4. Card **Production Alerts**  
   - Subheading: *Production Supply*  
   - Description: *“Change alerts with shift-change escalation and resolve cascades.”*

### Path B — Side navigation (Logistic)
Child **Production Alerts** → `production_alerts`.

### Path C — Machine Material Status (indirect)
LINE-03 card shows related alert **ALT-DEMO-001** — cross-link works only if `onNavigate` is wired (currently **not** from App Library route).

### Path D — Name map
`AppContent.tsx`: `'Production Alerts'` → `'production_alerts'`.

### Path E — Deep-link props (defined but unwired)
`ProductionAlertsPage` accepts `initialAlertId`, `initialJobId`, `initialMachineId`, `onNavigate` — **`AppRoutesLogistics` renders `<ProductionAlertsPage />` with no props**.

### Edition / deep links
- Edition query does **not** change UI.
- No `?alert=ALT-DEMO-001` URL param.

### Back navigation
Default shell → **Logistics Control Tower**.

---

## 3. Routing & architecture

```text
App Library / Nav
        │
        ▼
screen key: production_alerts
        │
        ▼
AppRoutesLogistics.tsx  (no edition fork)
        │
        └── ProductionAlertsPage.tsx
                │
                ├── useState(structuredClone(workshopData))
                ├── patchAlert / pushAudit
                ├── resolve() cascade → jobs + machines (ALT-DEMO-001 only)
                └── LogisticsDrawer (560px)
```

### Workshop Day 2 trio

| Screen key | Page | Primary entity | Cascade on resolve |
|---|---|---|---|
| `job_readiness` | JobReadinessPage | jobs | No |
| **`production_alerts`** | **This page** | **alerts** | **Yes (ALT-DEMO-001)** |
| `machine_status` | MachineStatusPage | machines | No |

Each page clones `workshopData` independently at mount.

---

## 4. Progressive disclosure model

| Layer | What user sees | Implementation |
|---|---|---|
| L0 | KPI strip (4 tiles) | `useMemo` over `alerts` |
| L1 | Alert feed rows | State filter · sort by lifecycle priority |
| L2 | Row summary | humanize(alert_type) · severity · state · original→new · job · machine · due · owner |
| L3 | Drawer overview + change details | Reason, area, required action |
| L4 | Linked records | job_id + machine_id (buttons if `onNavigate`) |
| L5 | Downstream impact list | Optional bullet list |
| L6 | Escalation chain | Chip rail + auto-escalate timestamp |
| L7 | Actions + audit | Four buttons · `actionMsg` feedback |

---

## 5. Personas / roles

| User id | Display name | Role in alert flows |
|---|---|---|
| `USR-planner` | J. Chen — Production Planner | Default audit actor · acknowledges alerts · created ALT-DEMO-001 |
| `USR-label-cage` | P. Walsh — Label Cage Operator | Assign target for ALT-DEMO-001 · resolve actor (hardcoded) |
| `USR-wh-lead` | A. Brooks — Warehouse Team Lead | Default assign target for non-demo alerts · escalation chain step 2 |
| `USR-line-lead` | M. Santos — Production Line Lead | Escalation chain step 3 · resolved ALT-004 |
| `USR-qa` | R. Patel — QA Supervisor | Owner on ALT-003 |
| `USR-mat-handler` | K. Ortiz — Material Handler | Owner on ALT-004 |

Escalation chain on ALT-DEMO-001: Label Cage → Warehouse TL → Line Lead.

---

## 6. Data sources

### 6.1 Used

| Source | Role |
|---|---|
| `workshopData.alerts` | Primary feed (5 alerts) |
| `workshopData.jobs` | Linked job context in drawer · **resolve cascade** target |
| `workshopData.machines` | **resolve cascade** target for LINE-03 |
| `workshopData.as_of` | Shell timestamp `2026-07-09T15:45:00-06:00` |
| `workshopUsers` | Owner / audit display names |

### 6.2 Alert lifecycle states

`new` → `acknowledged` → `assigned` → `escalated` → `resolved`

*(Any state can jump via action buttons — not a strict state machine guard beyond Acknowledge disabled unless `new`.)*

### 6.3 Alert types (seed)

| alert_type | humanized (approx) |
|---|---|
| `job_priority_changed` | Job priority changed |
| `machine_stopped` | Machine stopped |
| `material_not_released` | Material not released |
| `required_time_advanced` | Required time advanced |
| `lot_changed` | Lot changed |

### 6.4 Not used

| Source | Note |
|---|---|
| `logisticsMockData.exceptions` | Separate CT exception board (EXC-0709-*) |
| `reactiveLogisticsDemo` | V7 Happy Path |
| CT macroflow | No dedicated `production_alerts` screen on macro cards |

---

## 7. Seeded alerts (exact)

### ALT-DEMO-001 — connected demo anchor (critical / new)

| Field | Value |
|---|---|
| Type | job_priority_changed |
| Job / Machine | **JOB-DEMO-001** · **LINE-03** |
| Change | Normal → **Critical** |
| Reason | Line 3 changeover completed early — required start advanced 45 min |
| Required action | Expedite label prep and material staging for JOB-DEMO-001 |
| Owner | **Unassigned** |
| Due | Jul 9, 2026 16:00 |
| Downstream | LINE-03 waiting for material · JOB-100234 queue delayed |
| Escalation | 30 min · chain [label-cage, wh-lead, line-lead] · index 0 |
| Auto-escalate | **2026-07-09T15:52:00-06:00** (shown while state=new) |

**Resolve cascade** (only this alert):

- Job: `readiness_pct` 85 · `readiness_risk` at_risk · `main_blocker` null · `current_stage_id` warehouse_preparation · `label_cage_prep` stage → complete  
- Machine LINE-03: `status` running · `material_status` staged · `material_blocker` null · `replenishment_action` continue · `related_alert_id` null

### ALT-002 — machine stopped (high / acknowledged)

| Field | Value |
|---|---|
| Job / Machine | JOB-100228 · LINE-05 |
| Change | Running → Stopped |
| Reason | Unplanned downtime — feeder jam |
| Owner | USR-wh-lead |
| Downstream | Replenishment task **TO-0709-104** paused |

### ALT-003 — QA blocked material (high / assigned)

| Field | Value |
|---|---|
| Job / Machine | **JOB-100234** · LINE-03 |
| Change | Released → **QA Blocked** |
| Reason | Incoming inspection pending — SAP batch blocked |
| Owner | USR-qa |
| Downstream | JOB-100234 blocked · LINE-03 next job at risk |

Cross-pack: Guided Tasks TO-0709-102 · Job Readiness JOB-100234 · Quality Release narrative.

### ALT-004 — resolved success story (medium / resolved)

| Field | Value |
|---|---|
| Job / Machine | JOB-100215 · LINE-01 |
| Change | Required time 15:00 → **14:00** |
| Reason | Customer pull-forward on downstream FG order |
| Owner | USR-mat-handler |
| Resolved by | USR-line-lead — *Material delivered — job ready to run* |

### ALT-005 — lot change (medium / new)

| Field | Value |
|---|---|
| Job / Machine | JOB-100228 · LINE-05 |
| Change | LOT-26-0708-A → **LOT-26-0710-A** |
| Reason | FIFO override — earlier lot depleted |
| Owner | **Unassigned** |
| Downstream | KIT-0709-012 restart required |
| Escalation | **none** (no chain / no auto_escalate_at) |

---

## 8. KPI strip (computed from seed)

| Label | Seed value | Logic |
|---|---|---|
| New unacknowledged | **2** | ALT-DEMO-001, ALT-005 |
| In progress | **2** | ALT-002 acknowledged + ALT-003 assigned |
| Escalated / due soon | **1** | 0 escalated + 1 new with `auto_escalate_at` (ALT-DEMO-001) |
| Resolved | **1** | ALT-004 |

---

## 9. UX — step-by-step

### 9.1 Page chrome

| Element | Exact |
|---|---|
| Title | **Production Change Alert Center** |
| Subtitle | Lot, priority, machine, schedule changes |
| Panel | **Alert feed** |
| Filter | All states · New · Acknowledged · Assigned · Escalated · Resolved |

### 9.2 Feed sort order

Priority by state: `new` (0) → `escalated` (1) → `assigned` (2) → `acknowledged` (3) → `resolved` (9).

Left border color (`stateBorder`):

| state | color |
|---|---|
| new | danger red |
| acknowledged | warn amber |
| assigned | LOGISTICS_ACCENT blue |
| escalated | purple `#9E77ED` |
| resolved | ok green |

Resolved rows render at **opacity 0.85**.

### 9.3 Drawer sections

1. **Overview** — SeverityPill + StatusPill + reason text  
2. **Change details** — Original→New · area · required action · due · owner  
3. **Linked records** — Job (with blocker snippet from job row) · Machine  
4. **Downstream impact** — bullet list when present  
5. **Shift-change escalation chain** — when `escalation_chain` defined  
6. **Actions** — four buttons + feedback caption  
7. **Audit trail** — chronological entries  

### 9.4 Action buttons

| Button | Enabled | Effect |
|---|---|---|
| **Acknowledge** | Only when `state === 'new'` | → acknowledged · sets acknowledged_at/by USR-planner · audit |
| **Assign owner (Label Cage)** | Always | ALT-DEMO-001 → USR-label-cage · else USR-wh-lead · state → assigned · updates linked job owner |
| **Escalate to next in chain** | Always | state → escalated · increments escalation_index · sets owner to next chain member · audit |
| **Resolve** | Always | state → resolved · resolved_by USR-label-cage (all alerts) · **ALT-DEMO-001 cascade** |

**Button label quirk:** Assign always shows *(Label Cage)* even when assigning USR-wh-lead for non-demo alerts.

### 9.5 Escalation chain UI

Chip rail with done (green) · current (amber) · future (muted) styling.

When `state === 'new'` and `auto_escalate_at` set:

> Auto-escalate at {time} if unanswered

Detail rows: Escalate after · Auto-escalate at · Chain index.

**Note:** Auto-escalate is **display-only** — no timer fires in prototype.

### 9.6 Resolve feedback

After resolve (any alert):

> Resolved. Machine LINE-03 updated to on-track.

Message shows even when resolving ALT-005 (no LINE-03 update) — **copy is hardcoded/generic**.

If `onNavigate` and resolved: optional **Open LINE-03** link in caption (still requires wiring).

---

## 10. Resolve cascade specification (ALT-DEMO-001)

Only path that mutates sibling entities in `data` state:

```typescript
// After resolve on ALT-DEMO-001:
jobs[JOB-DEMO-001]:
  readiness_pct: 85
  readiness_risk: 'at_risk'
  main_blocker: null
  current_stage_id: 'warehouse_preparation'
  stages[label_cage_prep]: status 'complete', completed_at: now

machines[LINE-03]:
  status: 'running'
  material_status: 'staged'
  material_blocker: null
  replenishment_action: 'continue'
  related_alert_id: null
```

**Does not** update:

- Other alerts (ALT-003 still assigned)  
- Job Readiness page if open in another tab (separate clone)  
- Machine Status page clone  
- `warehouse_preparation` stage status on job (still waiting in seed overrides until manual visit Job Readiness)

---

## 11. Cross-navigation design

`onNavigate` targets (kebab-case — **mismatch** with AppScreen snake_case):

| Call | Target id |
|---|---|
| `'job-readiness'` | job_id |
| `'machine-status'` | machine_id |

**AppRoutesLogistics** does not pass `onNavigate` — drawer shows bold text IDs only.

Post-resolve **Open LINE-03** uses same `'machine-status'` string.

---

## 12. Control Tower relationships

Production Alerts is **not** a declared macroflow destination in `macroflowModel.ts`.

Indirect ties:

| Mechanism | Story |
|---|---|
| IN02 insight | QA release LOT-26-0709-B · supermarket Line 5 |
| CT exceptions | Separate EXC-* board — not synced with ALT-* |
| WIP page 2 lanes | LINE-03 blocked narrative aligns with ALT-DEMO-001 / JOB-DEMO-001 |
| Guided Tasks TO-0709-104 | ALT-002 downstream replenishment pause |

No **GO TO** from Control Tower directly to Production Alerts today.

---

## 13. Relationship to Job Readiness & Machine Status

| Link | Detail |
|---|---|
| ALT-DEMO-001 | Job Readiness JOB-DEMO-001 `related_alert_ids` |
| LINE-03 | Machine Status `related_alert_id: ALT-DEMO-001` until resolve cascade clears it |
| Assign owner | Updates `jobs[].owner_user_id` for alert’s job_id in **this page’s state only** |
| Resolve | Only screen that demonstrates **connected Day 2** intent end-to-end |

Recommended demo order:

1. Job Readiness → see JOB-DEMO-001 blocked  
2. **Production Alerts** → triage ALT-DEMO-001 → Resolve  
3. Machine Status → LINE-03 should show running **only if user stays on same page state** — open Machine Status fresh and LINE-03 still shows waiting (clone isolation)

---

## 14. Accessibility & localization

- English-only UI.
- **SeverityPill** and **StatusPill** text labels (not color-only).
- Feed rows click-only — no keyboard row pattern.
- Action buttons are standard MUI — keyboard accessible.
- Resolved feed opacity may reduce contrast slightly.

---

## 15. Exact copy catalog (high-signal)

### App Library
- Production Alerts · Production Supply  
- Change alerts with shift-change escalation and resolve cascades.

### Page
- Production Change Alert Center  
- Lot, priority, machine, schedule changes  
- Alert feed · All states  
- Unassigned (owner warning styling)  
- Shift-change escalation chain  
- If no ack within {N} min (or end of shift), escalate to next owner.  
- Auto-escalate at … if unanswered  
- Acknowledge · Assign owner (Label Cage) · Escalate to next in chain · Resolve  
- Resolved. Machine LINE-03 updated to on-track. · Open LINE-03  

### Audit actions (system-generated)
- Acknowledged: By planner  
- Owner assigned: {user display name}  
- Escalated: Next owner: … (shift-change / no ack)  
- Resolved: Labels staged — job can proceed  

---

## 16. File map

| File | Responsibility |
|---|---|
| `src/logistics/pages/ProductionAlertsPage.tsx` | **Full alert center UI + cascade logic** |
| `src/logistics/data/workshopDay2Data.ts` | Alerts seed + jobs/machines for cascade |
| `src/logistics/AppRoutesLogistics.tsx` | Route (no props) |
| `src/logistics/pages/JobReadinessPage.tsx` | Sibling — job timeline |
| `src/logistics/pages/MachineStatusPage.tsx` | Sibling — line board |
| `src/workstation/components/WorkstationsLibraryScreen.tsx` | App Library card |

---

## 17. Visual / interaction notes

| Aspect | Detail |
|---|---|
| Theme | Light operational feed (list, not grid) |
| Accent | LOGISTICS_ACCENT acknowledge · green resolve |
| Density | Full-width rows + drawer |
| Interactivity | Filter, select, 4 lifecycle actions |
| Persistence | Session React state only |
| Unique | **Only trio page with resolve cascade** |

---

## 18. Demo script (recommended)

### Script A — Connected Day 2 resolve (hero path)
1. App Library → **Production Alerts**.  
2. KPIs: New **2** · Escalated/due soon **1**.  
3. Open **ALT-DEMO-001** (top — state new).  
4. Walk escalation chain · note auto-escalate time.  
5. **Acknowledge** → **Assign owner** → optional **Escalate**.  
6. **Resolve** → read cascade message.  
7. *(Same session)* inspect internal state via re-open drawer — alert resolved.  
8. Navigate to **Machine Status** in new navigation — LINE-03 **still waiting** (clone gap) — explain prototype limit.

### Script B — QA material alert
1. Filter **Assigned** → **ALT-003**.  
2. Link to JOB-100234 / LINE-03.  
3. Cross-reference **Job Readiness** JOB-100234 QA hold.  

### Script C — Machine stop + lot change
1. **ALT-002** acknowledged · feeder jam · TO-0709-104 paused.  
2. **ALT-005** new unassigned · lot FIFO override · KIT-0709-012 restart.  

### Script D — Resolved reference
1. Filter **Resolved** → **ALT-004** · required time advanced · JOB-100215 success path.  

### Script E — Escalation drill
1. On ALT-DEMO-001 click **Escalate to next in chain** twice.  
2. Observe chain index increment and owner chip advance.  

---

## 19. Analysis prompts for Gemini Notebook

1. Implement shared `WorkshopDay2Provider` context so resolve cascade syncs Job Readiness + Machine Status.  
2. Wire `onNavigate` in AppRoutes with snake_case screen map + `initialAlertId` query param.  
3. Generalize resolve cascade rules per alert_type (not only ALT-DEMO-001 hardcode).  
4. Auto-escalate timer — background job vs shift-handoff batch?  
5. Strict state machine: disable Resolve until Acknowledged+Assigned?  
6. Fix assign button label to reflect actual target owner.  
7. Fix resolve success message to be alert-specific (not always LINE-03).  
8. Map ALT-* alerts to CT EXC-* exceptions — single exception domain?  
9. ALT-002 downstream TO-0709-104 — wire Guided Tasks classic replenishment status.  
10. Escalation chain UX for alerts without chain (ALT-005) — hide vs default chain.  
11. Push notifications / Andon integration spec for `severity: critical`.  
12. Audit trail persistence — 21 CFR Part 11 alignment with Quality Release e-sign.  
13. KPI “Escalated / due soon” — separate counts for true escalated vs pending auto-escalate.  
14. Mobile shift-lead triage layout for alert feed.  
15. After resolve ALT-DEMO-001, should `warehouse_preparation` stage flip from waiting to in_progress?

---

## 20. Known gaps & demo limitations

1. **Isolated state clones** — cascade visible only within Production Alerts session.  
2. **`onNavigate` unwired** — no cross-screen deep links from App Library.  
3. **Kebab-case** screen strings vs AppScreen snake_case.  
4. **Resolve cascade** only for ALT-DEMO-001 — other alerts no downstream mutation.  
5. **Resolve message** always mentions LINE-03.  
6. **Assign button label** always says Label Cage.  
7. **Auto-escalate** timestamp is cosmetic — no timer.  
8. **Acknowledge** only gated action — Escalate/Resolve always enabled.  
9. **resolved_by** always USR-label-cage regardless of alert.  
10. **No URL deep-link** for alert id.  
11. **Not in V7 Happy Path** — no Reset Demo Data.  
12. **No CT macroflow** direct entry.  
13. **ALT-005** new but not counted in “due soon” (no auto_escalate_at).  
14. **Refresh loses** all triage progress.  
15. **Feed rows** not keyboard-accessible.  
16. **warehouse_preparation** stage not advanced in cascade after resolve.  
17. **Open LINE-03** link requires `onNavigate` + resolved state — double unwired in default route.

---

## 21. Relationship to other logistics prototypes

| Prototype | Relationship |
|---|---|
| **Job Readiness** | Sibling · shared jobs · ALT-DEMO-001 linked on JOB-DEMO-001 |
| **Machine Material Status** | Sibling · LINE-03 related_alert_id · cascade target |
| **Guided Tasks** | TO-0709-104 · KIT-0709-012 downstream strings |
| **Quality Release** | ALT-003 / JOB-100234 QA blocked narrative |
| **Logistics Control Tower** | WIP lens LINE-3 story · separate exceptions board |
| **Production Alerts** | THIS — triage + escalation + resolve cascade |
| **Happy Path V7** | Outside reactive chain |

Workshop Day 2 flow:

```text
Change event (SAP/MES) → Production Alerts (triage)
        │
        ├── Assign / Escalate (shift handoff)
        │
        └── Resolve → Job stage + Machine status (aspirational sync)
                │
                ▼
        Job Readiness timeline reflects material ready
                │
                ▼
        Machine Material Status — line runs or waits
```

---

## 22. One-page cheat sheet

```text
OPEN: App Library → Logistic → Production Alerts

DATA: workshopDay2Data.alerts (5 rows) · as_of 2026-07-09T15:45
PAGE: Production Change Alert Center

HERO ALERT: ALT-DEMO-001 (new, critical, JOB-DEMO-001, LINE-03)
  Escalation: Label Cage → WH Lead → Line Lead · auto-escalate 15:52
  RESOLVE CASCADE: job 85% + label stage complete + LINE-03 running

OTHER: ALT-002 stop · ALT-003 QA block · ALT-004 resolved · ALT-005 lot change

ACTIONS: Acknowledge (new only) · Assign · Escalate · Resolve
KPIs: new 2 · in progress 2 · due soon 1 · resolved 1

GAPS: cascade session-only · onNavigate unwired · resolve msg always LINE-03
SIBLINGS: job_readiness · machine_status
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
| 10 | **Production Alerts** | `production_alerts` | **this file** |
| 11 | Machine Material Status | `machine_status` | `docs/prototypes/11_MACHINE_MATERIAL_STATUS_GEMINI_NOTEBOOK.md` |
| 12 | WIP Control Tower | `wip_control_tower` | `docs/prototypes/12_WIP_CONTROL_TOWER_GEMINI_NOTEBOOK.md` |

Catalog overview: `LOGISTICS_PROTOTYPES_GEMINI_NOTEBOOK.md`.
