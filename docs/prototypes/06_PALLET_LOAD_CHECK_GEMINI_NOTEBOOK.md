# Prototype Deep Dive 06 — Pallet Load Check

**Product:** BD Smart Factory / Inside Logistics (`bd-ai-poc`)  
**App Library card:** Pallet Load Check  
**Screen key:** `pallet_verification`  
**Category:** Logistic → Outbound / FG  
**Live demo:** https://guillermesmozzer.github.io/bd-ai-poc/  
**Audience:** Gemini Notebook analysis (single-prototype pack)

---

## 0. Document control

| Field | Value |
|---|---|
| Prototype name | Pallet Load Check |
| Primary journey role | Warehouse / FG operator guided pallet verification (sample: **Maria Santos**) |
| Happy Path position | **Outside** Lupita → Pepe → Alejandra → Gaby reactive chain |
| Editions | **Same UI** for Classic and Inside Logistics (no edition fork) |
| Spec / data | Dedicated mock `palletVerificationMockData.ts` (ported from logistics-mock/3d-pallet-verification) |
| Router | `src/logistics/AppRoutesLogistics.tsx` |
| Primary file | `src/logistics/pages/PalletVerificationPage.tsx` (~1,242 lines) |
| 3D engine | Three.js WebGL via `createPalletViewer.ts` + `PalletViewerCanvas.tsx` |
| Visual system | Light `LogisticsPageShell` + dark 3D canvas `#0f2744` / camera mock `#0f172a` |
| Explicit non-goal | **Does not automate Quality release** (footer + subtitle) |

---

## 1. Executive summary

**Pallet Load Check** is a **guided FG pallet verification MVP** with a real **3D WebGL stack model**, operator checklist, simulated multi-side photo capture, AI-assisted issue review (simulated), result states (**Ready / Needs Review / Blocked**), exception creation, supervisor queue, and analytics.

It prototypes the outbound physical-configuration gate that classic **Shipment Readiness** links as **Open 3D Load Check** — replacing paper pallet config sheets with a digital expected build + inspection trail.

It is **session-local React state** on a single sample pallet (`PLT-EP-000483`). There is **no** write-back to `reactiveLogisticsDemo`, classic `outbound_shipments`, or Quality Release. Toast chips simulate feedback; supervisor Approve/Correct only flash messages.

Product framing (exact footer):

> Prototype Coach draft · Phase 1 Guided Verification MVP · Sample pallet PLT-EP-000483 · Does not automate Quality release · Designer + QA/Validation review required.

---

## 2. How to open this prototype

### Path A — App Library
1. Sign in.
2. Header → **apps grid**.
3. Category **Logistic**.
4. Card **Pallet Load Check**  
   - Subheading: *Outbound / FG*  
   - Description: *“3D guided pallet verification with checklist, photo capture, exceptions, and supervisor queue.”*

### Path B — Side navigation (Logistic)
Child **Pallet Load Check** → `pallet_verification`.

### Path C — AI Home / Smart Hub
Tile **Pallet Load Check**  
- Caption: *3D guided pallet verification, checklist, photo evidence, and supervisor queue.*  
- KPI chip: *Scan → Ready / Blocked*

### Path D — From classic Shipment Readiness
**Digital Pallet Configuration** panel → **Open 3D Load Check** → `setCurrentScreen('pallet_verification')`.

### Path E — Name map
`AppContent.tsx`: `'Pallet Load Check'` → `'pallet_verification'`.

### Edition / deep links
- Edition query does **not** change UI.
- No `?screen=` deep-link into a specific wizard step (nav chips only).

### Back navigation
Default shell → **Logistics Control Tower**.

---

## 3. Routing & architecture

```text
App Library / Nav / AI Home / Shipment Readiness (classic)
        │
        ▼
screen key: pallet_verification
        │
        ▼
AppRoutesLogistics.tsx
        │
        └── PalletVerificationPage.tsx   (lazy, edition-agnostic)
                │
                ├── LogisticsPageShell
                ├── FLOW_STEPS progress strip
                ├── NAV chip rail (10 screens)
                ├── local state: checklist, captures, issues, resultMode, filters
                └── PalletViewerCanvas
                        └── createPalletViewer (Three.js + OrbitControls)
```

### Screen model (`PalletScreen`)

| id | Label (NAV) | In FLOW_STEPS? |
|---|---|---|
| `home` | Home | No (pre-flow) |
| `identified` | Identified | Step 0 Identify |
| `viewer` | 3D Config | Step 1 3D View |
| `checklist` | Checklist | Step 2 Checklist |
| `camera` | Camera | Step 3 Capture |
| `issues` | Issues | Step 4 Issues |
| `result` | Result | Step 5 Result |
| `exception` | Exception | Side path |
| `supervisor` | Supervisor | Side path |
| `analytics` | Analytics | Side path |

`FLOW_STEPS` = Identify · 3D View · Checklist · Capture · Issues · Result  
`SCREEN_FLOW_STEP` maps only the six wizard screens; Home / Exception / Supervisor / Analytics leave the strip inactive (no highlight).

---

## 4. Progressive disclosure / operator flow

```text
[home] Scan / Enter ID / Exceptions / Analytics
   │
   ├─ Simulate Scan / Continue ──► [identified]
   │                                  │ View 3D Configuration
   │                                  ▼
   │                               [viewer]  ◄── Three.js orbit + view commands
   │                                  │ Start Verification
   │                                  ▼
   │                               [checklist]  (critical gates)
   │                                  │ Continue to Camera Scan
   │                                  ▼
   │                               [camera]  (5 captures)
   │                                  │ Review Issues
   │                                  ▼
   │                               [issues]  Confirm / Dismiss / Escalate
   │                                  │ Submit Verification
   │                                  ▼
   │                               [result]  Ready | Needs Review | Blocked
   │                                  ├─ Confirm Ready to Move → home
   │                                  └─ Create Exception → [exception] → [supervisor]
   │
   └─ Open Exceptions Queue ──► [supervisor] ──► [analytics]
```

NAV chips allow **jumping to any screen** without completing prerequisites (demo freedom / also a product gap).

---

## 5. Personas / roles

| Role | How this prototype serves them |
|---|---|
| **Maria Santos** — Warehouse Operator · Zone B · Shift A Day | Banner identity; primary verifier of sample pallet |
| Warehouse Lead | Exception owner in seed `palletExceptions` |
| Supervisor | Queue Approve / Correct / Close (toast-only) |
| Quality / Validation reviewer | Explicitly **out of automated scope** — footer warning |
| FG shipping ops | Consumes outcome conceptually from Shipment Readiness pallet config |

Operators named in recent/supervisor lists: M. Santos, J. Ortiz, A. Chen, K. Lee.

---

## 6. Data sources

### 6.1 Used

| Source | Role |
|---|---|
| `src/logistics/data/palletVerificationMockData.ts` | Entire demo catalog (pallet, checklist, captures, issues, queue, analytics) |
| Component `useState` | Checklist answers, photos flags, captures, issue statuses, filters, dialogs |
| Three.js runtime | Visual expected configuration (layers × boxes) |

### 6.2 Not used

| Source | Note |
|---|---|
| `reactiveLogisticsDemo` | Happy Path bus — **not connected** |
| `logisticsMockData.outbound_shipments` | Classic OB pallets (PLT-FG-*) — **different IDs** |
| Quality Release / ASN evidence | No shared document state |

**Implication:** Completing Ready to Move does **not** change Shipment Readiness readiness %, Gaby lights, or CT KPIs.

---

## 7. Sample verification object (exact)

`verificationPallet` — single working object for the wizard:

| Field | Value |
|---|---|
| Pallet ID | **PLT-EP-000483** |
| Handling Unit | HU-78392014 |
| SKU | BD-45021 |
| Product family | Finished Goods |
| Batch / Lot | B240719-A / L-98231 |
| Quantity | 96 boxes |
| Pallet type | Standard 48×40 |
| Layers × boxes/layer | **6 × 16** (= 96) |
| Gross weight | 1,248 lb |
| Destination | Shipping Staging |
| Location | Warehouse Zone B · Lane 4 |
| Quality status | **Released** (already commercially released — verification is physical config) |
| System status | Pending Verification |
| Data status | Data complete |
| Dimensions | Pallet 48×40×6 in · Box 12×10×8 in |
| Wrapping | Full stretch wrap · 4 sides + top |
| Lashing | 2 horizontal ties · mid + upper third |
| Labels | HU label front · SKU label visible on 2 sides |

Home KPIs (`palletStats`): verified today **18** · Needs Review **3** · Blocked **1**.

---

## 8. Checklist model

10 items; Pass / Fail / Add photo; comment required path for critical fails.

| # | id | Label | Critical |
|---|---|---|---|
| 1 | `id_match` | Pallet ID matches system record | **Yes** |
| 2 | `pallet_type` | Correct pallet type | **Yes** |
| 3 | `box_count` | Correct box count | **Yes** |
| 4 | `stack_pattern` | Correct stacking pattern | **Yes** |
| 5 | `alignment` | Boxes aligned within pallet footprint | No |
| 6 | `damage` | No visible damaged boxes | **Yes** |
| 7 | `labels` | Labels are visible and readable | **Yes** |
| 8 | `wrap` | Stretch wrap is complete | No |
| 9 | `lashing` | Lashing / tie points are correct | No |
| 10 | `safe_move` | Pallet is safe to move | **Yes** |

### Gate to leave checklist (`canContinueChecklist`)

Must have:
- `criticalIncomplete === 0` (every critical item answered)
- `criticalFailMissingEvidence === 0` (critical Fail must have **comment or photo**)

Non-critical items may remain unanswered.

---

## 9. Camera capture model

5 guided steps (`captureSteps`):

| id | Label | Guidance |
|---|---|---|
| `front` | Front side | Capture front side |
| `left` | Left side | Move around the pallet — capture left side |
| `right` | Right side | Capture right side |
| `label` | Label area | Capture label area |
| `top` | Top / angle | Capture top / angle view |

**Capture Photo** marks current step true and advances index. No real camera / file — dashed frame mock on dark panel.

When `allCaptured`, **AI Detection (simulated)** reveals chips from `issues` + fixed chip *Low Confidence — Manual Review Needed*. Caption: *Prototype only — detections are simulated. No live CV model.*

---

## 10. Issue / exception model

### Seed AI issues (`seedDetectedIssues`)

| id | Type | Severity | Conf. | Location | Required action |
|---|---|---|---|---|---|
| iss-001 | Damaged Box | Medium | 84% | Front-right corner, layer 3 | Supervisor review before movement |
| iss-002 | Alignment Issue | Low | 62% | Right edge, layers 4–5 | Confirm overhang within tolerance |
| iss-003 | Label Not Detected | Medium | 71% | Front face | Verify HU label present/readable |

Statuses: `pending` → `confirmed` | `dismissed`.  
**Escalate** confirms + jumps to Exception.  
**Flag Issue** dialog adds a manual confirmed Medium issue (confidence 100%).

### Issue categories (manual flag / exception select)

Damaged box · Missing label · Misalignment · Wrong stack pattern · Overhang · Incorrect wrapping · Incorrect lashing · Quantity mismatch · Other

### Seed exception record (`palletExceptions[0]`)

| Field | Value |
|---|---|
| ID | EXC-2026-00419 |
| Pallet | PLT-EP-000483 |
| Issue | Damaged Box · Medium |
| Owner | Warehouse Lead |
| Area | Warehouse Zone B |
| Status | Needs Review |
| Photos | 3 |
| Recommended | Replace damaged box and re-wrap before movement |

Exception form fields are mostly uncontrolled `defaultValue` — Submit only flashes + navigates to supervisor.

---

## 11. Result computation (`computeResult`)

Called when navigating to `result` via `go('result')`:

| Condition | Mode |
|---|---|
| Critical checklist Fail **or** confirmed issue severity Critical/High | **blocked** |
| Else any confirmed issue **or** any checklist Fail | **review** |
| Else | **ready** |

UI also offers **Preview:** Ready / Needs Review / Blocked buttons to override display for demo storytelling (does not rewrite issues).

Outcomes copy:
- Ready → *Pallet verified and ready to move.* → **Confirm Ready to Move** → home  
- Needs Review → *Pallet requires supervisor or quality review.* → **Create Exception**  
- Blocked → *Pallet blocked due to critical issue.* → **Create Exception**

---

## 12. Supervisor queue & analytics

### Queue seed (6 rows)

| Pallet | Status | Severity | Area | Age |
|---|---|---|---|---|
| PLT-EP-000483 | Needs Review | Medium | Zone B | 12 min |
| PLT-EP-000479 | Needs Review | High | Shipping | 48 min |
| PLT-EP-000472 | Blocked | Critical | Zone A | 2.1 h |
| PLT-EP-000481 | Ready | — | Zone B | — |
| PLT-EP-000476 | Ready | — | Zone B | — |
| PLT-EP-000468 | Needs Review | Low | Zone C | 1.4 h |

Filters: Area (Zone A/B/C/Shipping) · Status · Severity.  
Area filter special-cases Shipping vs Zone string includes.

Actions: Approve / Correct / Close → **toast only** (queue not mutated).

### Analytics (`palletAnalytics`)

KPIs: total verified **142** · exceptions today **7** · avg review **18 min** · top issue Damaged Box.

Bar panels: by issue type / SKU / area / shift (normalized LinearProgress bars).

---

## 13. 3D viewer (Three.js)

### Stack

| File | Role |
|---|---|
| `PalletViewerCanvas.tsx` | Host div, lifecycle, `viewCommand` bridge |
| `createPalletViewer.ts` | Full WebGL scene (`@ts-nocheck` port) |

### Capabilities

- Volumetric wood pallet base + **4×4 boxes × N layers** (seed 6)
- OrbitControls (damped), shadows, fog, grid floor
- Background `#0f2744`
- Damaged box highlighted in red (layer 3 sample) — called out in UI copy
- View commands: `iso` / `front` / `side` / `top` / `layer` (cycle highlight) / `explode` / `ties` (wrap/ties toggle) / `reset`
- `fireView` sets command for 50ms to retrigger effect
- `aria-label="3D pallet model"` on host and canvas
- Dispose on unmount; refresh when screen becomes active

**Not:** AR, depth camera, or binding to real HU scan data — geometry driven only by `expectedLayers` / `boxesPerLayer`.

---

## 14. UX chrome & dialogs

| Element | Behavior |
|---|---|
| Title | Pallet Load Check |
| Subtitle | 3D pallet verification · guided inspection MVP · does not automate Quality release |
| Banner | `Maria Santos · Warehouse Zone B · Shift A · Day` |
| Toast | Chip in toolbar, ~2200 ms |
| Scan dialog | Simulated scanner → **Simulate Scan** → identified |
| Manual ID | Prefills PLT-EP-000483; Continue ignores wrong IDs (always same pallet) |
| Flag Issue | Adds confirmed issue to list |

Home CTAs: **Scan Pallet** · Enter Pallet ID · Open Exceptions Queue · Analytics.

---

## 15. Accessibility & localization notes

- English-only UI.
- Status/severity use labeled pills, not color alone.
- 3D canvas has aria-label but **no** keyboard alternative for orbit (mouse/touch OrbitControls).
- NAV chips and Pass/Fail are mouse-first; limited keyboard patterns vs V7 Happy Path screens.
- Camera / scan are visual mocks without live region announcements beyond toast Chip.
- Result mode preview uses symbols ✓ / ! / ✕ plus text labels.

---

## 16. Exact copy catalog (high-signal)

### Product / App Library / AI Home
- Pallet Load Check  
- Outbound / FG  
- 3D guided pallet verification with checklist, photo capture, exceptions, and supervisor queue.  
- Scan → Ready / Blocked  
- BD Inside Logistics  

### Flow / gates
- Scan the pallet label to retrieve the expected configuration.  
- Does not automate Quality release  
- Critical (checklist caption)  
- Prototype only — detections are simulated. No live CV model.  
- Capture all sides to run simulated detection…  
- Low Confidence — Manual Review Needed  
- Ready / Needs Review / Blocked  
- Confirm Ready to Move / Create Exception  
- Assign to Supervisor / Submit Exception  

### 3D
- Rotate the 3D model to review the correct stacking pattern. Damaged box highlighted in red (layer 3 sample).  
- Isometric / Front / Side / Top / Layer view / Exploded / Ties / wrap / Reset  

---

## 17. File map

| File | Responsibility |
|---|---|
| `src/logistics/pages/PalletVerificationPage.tsx` | **Full multi-screen MVP UI** |
| `src/logistics/data/palletVerificationMockData.ts` | Sample pallet + catalogs |
| `src/logistics/palletVerification/PalletViewerCanvas.tsx` | React bridge to WebGL |
| `src/logistics/palletVerification/createPalletViewer.ts` | Three.js viewer engine |
| `src/logistics/AppRoutesLogistics.tsx` | Route (no edition fork) |
| `src/logistics/components/LogisticsPageShell.tsx` | Chrome / back to CT |
| `src/logistics/pages/ShipmentReadinessPageLegacy.tsx` | Entry link Open 3D Load Check |
| `src/aiHome/data.tsx` | Smart Hub tile |
| `src/workstation/components/WorkstationsLibraryScreen.tsx` | App Library card |
| `src/navigation/navigationConfig.tsx` | Nav child |
| `src/AppContent.tsx` | Name → screen map |

Dependency: `three` + `OrbitControls` from `three/examples/jsm/...`.

---

## 18. Visual / implementation notes

| Aspect | Detail |
|---|---|
| Shell | Light logistics operational |
| Hero of flow | Home scan composition + later dark 3D plane |
| Accents | `LOGISTICS_ACCENT` chips / primary buttons |
| Pass/Fail cards | Soft green/red borders via `lx.ok*` / `lx.danger*` |
| Motion | 3D orbit continuous; toast timeout; no reduced-motion hooks on viewer |

---

## 19. Demo script (recommended)

### Script A — Happy guided path to Ready
1. App Library → **Pallet Load Check**.  
2. **Scan Pallet** → Simulate Scan → show system record vs expected config.  
3. **View 3D Configuration** → orbit; click Layer / Exploded / Ties; note red damaged box.  
4. **Start Verification** → Pass all criticals (or Fail one with comment/photo).  
5. Camera: Capture all 5 sides → show simulated AI chips.  
6. Issues: **Dismiss** all → Submit → Ready → **Confirm Ready to Move**.  

### Script B — Blocked / exception path
1. Fail critical **damage** without evidence → Continue disabled.  
2. Add photo/comment → continue.  
3. On Issues, **Confirm** Damaged Box → Result Needs Review/Blocked → Create Exception → Assign Supervisor.  
4. Supervisor filters Shipping / High → Approve toast.  

### Script C — Jump / analytics
1. Home → Analytics → defect bars.  
2. Use NAV chips to jump Result preview modes for stakeholder storytelling.  

### Script D — Boundary vs QA / Happy Path
1. Note Quality status **Released** already on sample pallet.  
2. Confirm footer: does not automate Quality release.  
3. Optionally open Quality Release / Gaby — no shared live state.  

---

## 20. Analysis prompts for Gemini Notebook

1. Position Pallet Load Check in OB03 vs Quality ID: physical config gate after commercial release vs before.  
2. Propose binding scan result to real HU/SAP handling unit instead of always `PLT-EP-000483`.  
3. Design CV architecture to replace simulated detection (confidence thresholds, human-in-loop).  
4. Enforce NAV gating so users cannot skip checklist/camera before Result.  
5. Align pallet IDs with classic Shipment Readiness `PLT-FG-*` configurations.  
6. Accessibility for 3D: keyboard camera presets, captions for damaged-box highlight.  
7. Define Ready-to-Move write-back into shipment gates (`pallet_config_complete`, `damage_check_complete`).  
8. Severity taxonomy consistency (SeverityPill lowercase vs seed Title Case).  
9. Evidence retention: photo flags vs real blob storage / audit trail.  
10. Supervisor queue mutation + SLA aging vs toast-only Approve.  
11. Three.js performance budget on RF tablets / shared workstations.  
12. Reduced-motion / WebGL fallback (2D layer diagram) policy.  
13. Should critical Fail always force Blocked even if issue dismissed? Reconcile checklist vs AI issue engines.  
14. Multi-pallet batch verification for shipping waves.  
15. Validation pack: what Designer + QA/Validation must sign before production (footer callout).

---

## 21. Known gaps & demo limitations

1. **Single sample pallet** — manual ID text ignored for lookup.  
2. **No edition fork / no Happy Path bus.**  
3. **NAV free jump** bypasses gates.  
4. **No real camera / scanner / CV.**  
5. **Photos are boolean flags**, not files.  
6. **Exception form** largely uncontrolled; Submit does not persist new EXC ids.  
7. **Supervisor actions** do not mutate queue.  
8. **Result Preview buttons** can disagree with `computeResult`.  
9. **IDs diverge** from Shipment Readiness / reactive demos.  
10. **Quality Released** on sample may confuse “verification vs release” demos — intentional but needs coaching.  
11. **`@ts-nocheck`** on Three.js port — typed safety gap.  
12. **OrbitControls** mouse-centric.  
13. **Toast Chip** not a robust live region.  
14. **Analytics** static — not derived from session verifications.  
15. **No Reset Demo Data** button (state clears on remount/navigation away depending on remount).  
16. **Escalate** confirms issue then leaves issues screen — may skip Submit Verification.  
17. **Area filter** heuristic fragile (`includes` Zone substring).  
18. **Does not update** classic readiness gates after Confirm Ready to Move.

---

## 22. Relationship to other logistics prototypes

| Prototype | Relationship |
|---|---|
| **Shipment Readiness (classic)** | Explicit launch **Open 3D Load Check**; conceptual consumer of pallet_config / damage gates |
| **Shipment Readiness (V7 Gaby)** | No wiring — SpaceX lights ignore pallet verification |
| **Quality Release** | Explicitly **not** automated here; sample pallet already Quality Released |
| **Logistics Control Tower / Outbound CT** | OB03 narrative adjacency; back-link to CT |
| **Pallet LP modules in Mobile Ops** | Different inbound LP generation — do not confuse |
| **ASN Portal** | Upstream partner qty/docs — not FG stack verification |
| **Sterilization Tracker** | Different object lifecycle (loads), not stack pattern |

Conceptual stack:

```text
QA Release (commercial disposition)
        │
        ▼
FG pick / stage (Guided Tasks / classic FG tasks)
        │
        ▼
Pallet Load Check (THIS — physical config + evidence)
        │
        ▼
Shipment Readiness / dock load / PGI
```

---

## 23. One-page cheat sheet

```text
OPEN: App Library → Logistic → Pallet Load Check
   or AI Home tile “Scan → Ready / Blocked”
   or classic Shipment Readiness → Open 3D Load Check

EDITION: same UI · NOT on Happy Path bus
SAMPLE: PLT-EP-000483 · BD-45021 · 6×16 boxes · Zone B · Maria Santos
3D: Three.js WebGL · layer/explode/ties · red damaged box sample

FLOW: Scan → Identified → 3D → Checklist (critical gates) → 5 Captures
      → Issues (confirm/dismiss) → Ready | Needs Review | Blocked
      → Exception → Supervisor → Analytics

RULE: Does NOT automate Quality release
GAPS: free NAV jump · simulated CV · toast-only supervisor · no OB-* ID link
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
| 06 | **Pallet Load Check** | `pallet_verification` | **this file** |
| 07 | Sterilization Tracker | `sterilization_tracker` | `docs/prototypes/07_STERILIZATION_TRACKER_GEMINI_NOTEBOOK.md` |
| 08 | Guided Tasks | `guided_tasks` | `docs/prototypes/08_GUIDED_TASKS_GEMINI_NOTEBOOK.md` |
| 09 | Job Readiness | `job_readiness` | `docs/prototypes/09_JOB_READINESS_GEMINI_NOTEBOOK.md` |
| 10 | Production Alerts | `production_alerts` | `docs/prototypes/10_PRODUCTION_ALERTS_GEMINI_NOTEBOOK.md` |
| 11 | Machine Material Status | `machine_status` | `docs/prototypes/11_MACHINE_MATERIAL_STATUS_GEMINI_NOTEBOOK.md` |
| 12 | WIP Control Tower | `wip_control_tower` | `docs/prototypes/12_WIP_CONTROL_TOWER_GEMINI_NOTEBOOK.md` |

Catalog overview: `LOGISTICS_PROTOTYPES_GEMINI_NOTEBOOK.md` (§7 deep dive index).
