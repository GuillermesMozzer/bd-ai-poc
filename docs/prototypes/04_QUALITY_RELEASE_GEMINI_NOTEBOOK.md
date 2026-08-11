# Prototype Deep Dive 04 — Quality Release

**Product:** BD Smart Factory / Inside Logistics (`bd-ai-poc`)  
**App Library card:** Quality Release  
**Screen key:** `quality_release`  
**Category:** Logistic → Inbound / Post-Steril  
**Live demo:** https://guillermesmozzer.github.io/bd-ai-poc/  
**Audience:** Gemini Notebook analysis (single-prototype pack)

---

## 0. Document control

| Field | Value |
|---|---|
| Prototype name | Quality Release |
| Primary journey (V7) | Dra. Alejandra González Sánchez — QA Workstation & E-Signature |
| Capacity contract (V7) | **ID — Inspect & Disposition** (regulatory ceiling **N1**) |
| Happy Path position | Step **3 of 4** (Lupita → Pepe → **Alejandra** → Gaby) |
| Editions | Classic (status board) **and** Inside Logistics V7 (reactive e-sign workstation) |
| Spec source (V7) | `src/FilesMD/cursor-prompt-specification-v7.md` § Dra. Alejandra |
| Contract source | `src/logistics/contracts/capacityContracts.ts` (`ID`) |
| Router | `src/logistics/AppRoutesLogistics.tsx` |
| Primary files | V7: `QualityReleasePage.tsx` · Classic: `QualityReleasePageLegacy.tsx` |
| Visual system | Light `LogisticsPageShell` + `lx` / typography tokens (not dark CT) |

---

## 1. Executive summary

**Quality Release** is the **quarantine / QA disposition** prototype for medical-device materials.

It is **one App Library card** that routes to **two different products** depending on edition:

| Edition | What the user actually sees | Persona / framing |
|---|---|---|
| **Smart Factory (classic)** | Multi-tab **Quality Release Status Board**: Incoming RM, Post-Sterilization, SQE/QNs, Hold cage, Released Today, Aging & SLA · shipping urgency requests · **Approve release disabled** (human gate “not in this UI”) | Logistics-visible QA queue (M. Chen / R. Patel owners in mock) |
| **Inside Logistics (V7)** | Risk-sorted quarantine queue + laboratory evidence pack + **21 CFR Part 11 e-signature dialog** that sets lot `RELEASED` and unlocks Gaby’s SpaceX sterilization light | **Dra. Alejandra González Sánchez** |

In V7, this screen is the **regulatory N1 gate** of the reactive Happy Path: Lupita’s dock custody puts `ELP2026.101` / `LOT-A-114` into `IN_INSPECTION`; Alejandra’s e-sign writes `RELEASED` into `localStorage`; `syncShipmentsFromPallets` turns `SHIP-QRO-15.checks.sterilizationPass` **GREEN** for Gaby.

Classic Quality Release uses static CDF Gold `logisticsMockData` and is **not** connected to the Happy Path bus.

---

## 2. How to open this prototype

### Path A — App Library (both editions)
1. Sign in.
2. Header → **apps grid** (top-left).
3. Category pill **Logistic**.
4. Card **Quality Release**  
   - Subheading: *Inbound / Post-Steril*  
   - Description: *“QA queues, SQE notifications, hold cage, and shipping urgency requests.”*

### Path B — Inside Logistics Happy Path (V7 only)
1. At entry, choose **Inside Logistics (new version)**.
2. Either:
   - Header orange button **Inside Logistics** → `3. Alejandra — QA Release`, or
   - App Library top block **Inside Logistics · Happy Path** → `3. Alejandra` / `Alejandra QA`.

### Path C — Side navigation
- Logistic children → **Quality Release** (classic label) or **Dra. Alejandra — Quality Workstation** (Inside Logistics nav label via `navigationConfig` edition labels).

### Path D — Name map
`AppContent.tsx`: `'Quality Release'` → `'quality_release'`.

### Deep links / edition
- `?edition=classic` → Status Board (`QualityReleasePageLegacy`)
- `?edition=inside_logistics` → Alejandra workstation (`QualityReleasePage`)
- Edition stored in `localStorage` key `bd-smart-factory-edition`

### Back navigation
Default shell back → **Logistics Control Tower**.

---

## 3. Routing & architecture

```text
App Library / Nav / Happy Path
        │
        ▼
screen key: quality_release
        │
        ▼
AppRoutesLogistics.tsx
        │
        ├── isInsideLogistics === true  → QualityReleasePage.tsx          (V7)
        │                                   └── reactiveLogisticsDemo
        │                                         (pallets + audit + shipment sync)
        │
        └── isInsideLogistics === false → QualityReleasePageLegacy.tsx    (Classic)
                                            └── logisticsMockData
                                                  (qa_inspections, QNs, holds, capacity)
```

### Critical implementation details

| Topic | Classic | V7 |
|---|---|---|
| Data bus | In-memory clone of `qa_inspections` (+ read-only QNs/holds/capacity) | `localStorage` via `reactiveLogisticsDemo` |
| Can commercially release? | **No** — Approve button permanently `disabled` | **Yes** — e-sign sets `RELEASED` |
| Happy Path link | None | Step 3; unlocks Gaby steril light |
| Reset Demo Data | None | `ResetDemoDataButton` in toolbar |
| Evidence UX | Placeholder text in drawer | Hardcoded success chips (COA / bioburden / BI) |
| Primary object | `QAInspection` rows (CDF) | `PalletUnit` (`ELP2026.101` / `LOT-A-114`) |

---

## 4. Capacity contract & regulatory framing (V7)

From `CAPACITY_CONTRACTS.ID`:

| Field | Value |
|---|---|
| Code | **ID** |
| Name | Inspect & Disposition |
| Engineering rigor | Regulatory Ceiling (FDA 21 CFR Part 11) |
| Max autonomy | **`N1_HUMAN_GATE`** |
| Rule | Commercial release disposition must **NEVER** be automatic (**N3**). Evidence may be assisted (**N2**); release gate remains **N1**. |

Page banner (exact intent):

> Regulatory ceiling: commercial release is **never automatic (N3)**. Evidence may be assisted (N2); disposition remains a permanent human gate (N1).

URS references in copy / audit detail: **`[URS-610-002]`**.

Classic board reinforces the same product rule with a disabled button titled *“QA release requires human approval in regulated system”* and label *“Approve release (human gate only — not in this UI)”* — i.e. classic demos **visibility + urgency signaling**, not disposition authority.

---

## 5. Personas / roles

### 5.1 V7 — named Happy Path persona

| Field | Value |
|---|---|
| Name | Dra. Alejandra González Sánchez |
| Role | QA Workstation / e-signature authority |
| Device | Desktop / widescreen |
| Audit actor string | Exact: `Dra. Alejandra González Sánchez` |
| Action code | `QA_E_SIGNATURE_RELEASE` |
| Contract stamped on audit | `ID` |

### 5.2 Classic — implied roles from mock owners

| User id | Display |
|---|---|
| `USR-qa-insp` | M. Chen — QA Inspector |
| `USR-qa-super` | R. Patel — QA Supervisor |
| `USR-sqe` | C. Alvarez — Supplier Quality Engineer |
| `USR-fg-lead` | L. Nguyen — FG Team Leader (urgency requester) |
| `USR-wh-tl` | Warehouse TL (urgency on QA-0709-002) |

Logistics users **see** the QA timeline so they know where Quality is — **without owning the decision** (drawer caption).

---

## 6. Data sources

### 6.1 V7 — `reactiveLogisticsDemo.ts`

| API | Role for Quality Release |
|---|---|
| `getPallets` / `subscribeLogisticsDemo` | Queue source |
| `updatePallet` → `setPallets` → `syncShipmentsFromPallets` | Release writes status + unlocks steril gate |
| `appendAudit` | Immutable trail + mirror key `src/FilesMD/AUDIT_TRAIL` |
| `resetLogisticsDemoData` | Presentation reset (clears keys + reload) |
| `loginPassword` from `AuthContext` | E-sign password check (with demo fallback) |

**Seed pallets relevant to QA queue filter:**

| LP | Lot | SKU | Material | Risk | Initial status |
|---|---|---|---|---|---|
| `ELP2026.101` | **LOT-A-114** | BD-8805-SYR | Syringe Plunger 5ml | **critical** | `EXPECTED` |
| `ELP2026.102` | LOT-E-509 | BD-3304-NDL | Precision Needle 22G | medium | `EXPECTED` (+ `SAP_SYNC_FAILED` divergence) |

Linked outbound shipment unlocked by release:

| Shipment | Destination | Linked pallet / batch | sterilPass seed |
|---|---|---|---|
| `SHIP-QRO-15` | Querétaro, MX (Export) | `ELP2026.101` / `LOT-A-114` | **RED** until RELEASED |

### 6.2 Classic — `logisticsMockData.ts`

| Collection | Role |
|---|---|
| `qa_inspections` (5 rows) | Main release queue |
| `quality_notifications` (2 QNs) | SQE tab |
| `quarantine_holds` (2 holds) | Hold / Blocked tab |
| `receiving_capacity` | Staging capacity panel |
| `materials` / `users` / `backorders` | Lookups for SKU, owners, linked BOs |
| `as_of` | Shell timestamp `2026-07-09T14:30:00-06:00` |

**Not used by either edition:** ASN Portal queue, CT `macroflowModel` live values, `receivingMockData` trucks.

---

## 7. Happy Path reactivity (V7) — exact chain

```text
1. Lupita (logistics_mobile_ops)
   Mark Dock Ready → updatePallet(ELP2026.101, { status: 'IN_INSPECTION', ... })
   Toast: pending item for Dra. Alejandra

2. Alejandra (quality_release)   ← THIS PROTOTYPE
   Queue shows IN_INSPECTION · risk CRITICAL · Urgent — Line Stop
   Open E-Signature Gateway → password + disposition reason + attestation
   Confirm Release →
        updatePallet(..., { status: 'RELEASED' })
        appendAudit({ action: 'QA_E_SIGNATURE_RELEASE', contract: 'ID', ... })
        syncShipmentsFromPallets → SHIP-QRO-15.sterilizationPass = GREEN

3. Gaby (shipment_readiness)
   SpaceX lights: steril light GREEN → GO enabled (if other lights already GREEN)
```

**Prerequisite warning on page:** if selected lot still `EXPECTED`, Alert:

> Waiting for Lupita dock transfer (status EXPECTED). Complete Mobile Receiving first.

**Post-release Alert:**

> Already RELEASED — Gaby SpaceX steril light should be GREEN.

**Success notice after confirm:**

> Lot {batch} RELEASED — SpaceX sterilization light unlocked for SHIP-QRO-15.

### Sync logic (important)

`syncShipmentsFromPallets` sets `sterilizationPass` GREEN when `linkedPalletId` is in the set of pallets with `status === 'RELEASED'`. Once GREEN, it **stays GREEN** even if a later read would otherwise fall back (ternary preserves prior GREEN). Shipment status is nudged toward `READINESS_CHECK` when all four gates are green (unless already `RELEASED`).

---

## 8. V7 UX — step-by-step

### 8.1 Chrome

| Element | Exact |
|---|---|
| Title | **QA Release Workstation — Dra. Alejandra** |
| Subtitle | Quarantine disposition · FDA 21 CFR Part 11 · Inspect & Disposition (ID / N1 gate) |
| Toolbar | **Reset Demo Data** |
| Banner | Regulatory ceiling Alert (warning) |
| Layout | 2-column grid: queue (1.2) · detail (0.8) on `lg` |

### 8.2 Quarantine Queue (risk-sorted)

Filter: status ∈ `{ IN_INSPECTION, HOLD, EXPECTED, RELEASED }`  
Sort: `lineStopRisk` rank `critical → high → medium → low`.

Columns: Lot / LP · Material · Risk · Status.

Row UX:
- Click or keyboard activate (`onActivateKey` / `tabIndex={0}` / `aria-selected`)
- Risk Chip via `riskChipSx`
- For `LOT-A-114` only: red caption **Urgent — Line Stop**
- Default `selectedId = 'ELP2026.101'`

Caption: *Select a lot row to open disposition details. Rows are keyboard-activatable.*

### 8.3 Lot detail panel

Shows:
- Lot heading, material · PO · LP
- **Laboratory Evidence Pack** chips (always success in demo):
  - COA Uploaded (OK)
  - Bioburden Micro Test (Passed)
  - Biological Indicators (Sterile)
- Info Alert: Contract ID · Evidence automation allowed (N2). Final disposition requires e-signature (N1).
- Primary CTA: **Open E-Signature Gateway**
  - Enabled only when `status === 'IN_INSPECTION' || status === 'HOLD'`
  - Disabled styling preserves readable contrast (`a11y` pattern)

### 8.4 E-Signature dialog (21 CFR Part 11)

| Control | Behavior |
|---|---|
| Title | Electronic Signature (E-Signature) — 21 CFR Part 11 |
| Password | Required; `type="password"`; autocomplete current-password |
| Disposition reason | Select; default first reason |
| Attestation Alert | Immutable legal text with [URS-610-002] |
| Cancel | Closes dialog |
| Confirm Release | Enabled when `passwordOk` |

**Disposition reasons (exact catalog):**

1. Post-sterilization release  
2. Raw-material quarantine release  
3. Full laboratory review — conforming  
4. Hold for deviation — insufficient evidence  

**Password acceptance rule (demo):**

```text
password.trim().length > 0
  && (password === loginPassword || password.length >= 4)
```

So **any ≥4 character password works** even if it does not match the login password — intentional demo convenience / compliance-gap for Gemini to flag.

**On Confirm Release:**
- `updatePallet(id, { status: 'RELEASED' })`
- `appendAudit` with detail:  
  `FDA 21 CFR Part 11 attestation recorded. Sterilization gate unlocked for SpaceX cockpit (Gaby). [URS-610-002]`
- Close dialog; set success notice

**What Confirm does *not* do:** change evidence chips, write CoA flags on pallet (`coaAttached` untouched), create classic `qa_inspections` rows, or call SAP.

---

## 9. Classic UX — step-by-step

### 9.1 Chrome

| Element | Exact |
|---|---|
| Title | **Quality Release Status Board** |
| Subtitle | Blocked materials, aging, impact, SQE QNs · **ST12–ST22, ST78–ST81** |
| As-of | From `logisticsData.as_of` |

### 9.2 KPI strip

| Label | Computation | Seed tone/value |
|---|---|---|
| In release queue | `qa_status !== 'released'` | **4** (warn) |
| Late (SLA breach) | open ∧ `sla_risk === 'late'` | **1** (danger) |
| At risk | open ∧ `at_risk` | **2** |
| Released today | `released` length | **1** (ok) |
| Open SQE QNs | `quality_notifications.length` | **2** |
| Shipping urgency requests | open with urgency_requests.length | **2** (danger) |

### 9.3 Receiving staging capacity panel

From `receiving_capacity`:

| Metric | Seed |
|---|---|
| Utilization | **81%** (39/48 pallets) |
| Expected inbound today | **+14** pallets |
| Queued for QA release | Sum of open `pallet_qty` (= **6+4+8+5 = 23**) |
| Projected after inbound | **110%** (error progress bar) |
| Warning caption | May need to reschedule trucks if space tight |

Narrative: releasing QA frees staging space for inbound trucks (small receiving area).

### 9.4 Release queue tabs

| Tab index | Label | Content |
|---|---|---|
| 0 | Incoming RM | `inspection_type === 'incoming_raw'` ∧ not released |
| 1 | Post-Sterilization | post_sterilization ∧ not released; TAT note ≈ **7 days** |
| 2 | SQE / QNs | `quality_notifications` table (30-day close SLA · QualityNotification R-14) |
| 3 | Hold / Blocked | `quarantine_holds` paper cards |
| 4 | Released Today | released inspections |
| 5 | Aging & SLA | open queue with TAT LinearProgress vs target |

Shared filters (tabs 0–1): search material/lot/pallet/id · SLA risk All / on_track / at_risk / late.

### 9.5 Seeded inspections (exact)

| ID | Type | SKU · Lot | Status | SLA | Aging | Impact highlight | Blocker |
|---|---|---|---|---|---|---|---|
| QA-0709-001 | incoming | 88210 · LOT-26-0712-A | lab_testing | at_risk | 1.2d | PO-100228 | test_pending |
| QA-0709-002 | incoming | 44102 · LOT-26-0709-B | pending_qa_review | at_risk | 1.1d | PO-100234 — URGENT | discrepancy (+ WH urgency) |
| QA-0708-014 | post | 12045 · LOT-26-0701-FG | lab_testing | **late** | 7.5d / 7d | SO-8802142 pledge + air risk · load **SL-2026-0705** | test_pending (+ FG urgency) |
| QA-0708-015 | post | 12088 · LOT-26-0698-FG | sampling_collected | on_track | 5.2d / 7d | 3 SOs waiting · load SL-2026-0701 | test_pending |
| QA-0709-010 | incoming | 88210 · LOT-26-0710-C | **released** | on_track | 0 | frees 3 staging slots · released_at 11:00 | null |

### 9.6 SQE notifications

| QN | Defect | Disposition | Close left | Next action |
|---|---|---|---|---|
| QN-26-4410 / QN-10004410 | Dimensional vs incoming spec | under_review | 26d / 30d | Supplier review call scheduled |
| QN-26-4388 / QN-10004388 | CoA mismatch vs PO | return_to_vendor | 8d / 30d | Arrange RTV pickup |

Close-SLA pill heuristic: `<7d left` → late; `<14d` → at_risk; else on_track.

### 9.7 Hold cage

| Hold | SKU · Lot | Location | Disposition |
|---|---|---|---|
| QH-001 | 44102 · LOT-26-0709-B | Hold Cage A | pending_review · QN-26-4410 |
| QH-002 | 12045 · LOT-26-0701-FG | Main Warehouse Quarantine | awaiting_lab |

### 9.8 Inspection drawer (LogisticsDrawer 480px)

Sections:
1. **QA Status Timeline (visible to Logistics)** — Received → Sampling → Lab → QA review → Released/Rejected (`timelineDone` helper)
2. **Material Impact Panel** — impact text, pallet qty frees capacity, optional note
3. **Linked backorders** — e.g. BO-0709-01 on QA-0708-014 (Mayo / SO-8802142 story)
4. **Shipping urgency requests** — list + **Request priority release (Shipping → QA)** appends from `USR-fg-lead` with canned reason; message *Urgency signal sent… Release decision remains with Quality.*
5. **Release Evidence Panel** — placeholder for docs/CoA; shows blocker + required_action + owner
6. **Actions** — disabled Approve release

Urgency does **not** change `sla_risk` or reorder the queue — signal only.

---

## 10. Status models compared

### V7 `PalletStatus`
`EXPECTED | RECEIVED | IN_INSPECTION | HOLD | REJECTED | RELEASED`

Queue includes EXPECTED (waiting Lupita) and RELEASED (post e-sign). `RECEIVED` / `REJECTED` are typed but not used in the QA page filter story.

### Classic `qa_status` (string statuses in mock)
`sampling_collected | lab_testing | pending_qa_review | released` (+ timeline treats `received` as always done)

No e-sign; no mapping between classic QA-0709-* IDs and V7 `ELP2026.*` LPs — **parallel universes**.

---

## 11. Accessibility notes (V7 emphasis)

V7 page applies shared logistics a11y helpers:

| Pattern | Where |
|---|---|
| `role="status"` Alerts | Banner, notices, EXPECTED/RELEASED |
| `aria-labelledby` section headings | Queue + detail |
| `aria-live="polite"` | Detail panel |
| Keyboard row activation | `tabIndex={0}`, `onActivateKey`, `aria-selected` |
| Dialog labelling | `aria-labelledby` / `aria-describedby` attestation |
| Focus / touch targets | `focusVisibleSx`, `touchTargetSx` |
| Disabled contrast | Explicit disabled button colors |
| Risk not color-only | Chip label text + Urgent caption |

Classic table rows are click-only (no keyboard selection parity with V7).

---

## 12. Exact copy catalog (high-signal)

### App Library / nav
- Quality Release
- Inbound / Post-Steril
- QA queues, SQE notifications, hold cage, and shipping urgency requests.
- Dra. Alejandra — Quality Workstation (edition nav label)
- 3. Alejandra — QA Release / Alejandra QA

### V7
- QA Release Workstation — Dra. Alejandra
- Quarantine Queue (risk-sorted)
- Laboratory Evidence Pack
- Open E-Signature Gateway
- Electronic Signature (E-Signature) — 21 CFR Part 11
- Confirm Release
- Urgent — Line Stop
- Already RELEASED — Gaby SpaceX steril light should be GREEN.
- Waiting for Lupita dock transfer (status EXPECTED). Complete Mobile Receiving first.

### Classic
- Quality Release Status Board
- Incoming RM / Post-Sterilization / SQE / QNs / Hold / Blocked / Released Today / Aging & SLA
- Request priority release (Shipping → QA)
- Approve release (human gate only — not in this UI)
- Expected post-sterilization TAT ≈ 7 days…
- Supplier Quality Engineers — 30-day close SLA · QualityNotification R-14
- Logistics sees this queue process so they know where Quality is — without owning the decision.

---

## 13. File map

| File | Responsibility |
|---|---|
| `src/logistics/pages/QualityReleasePage.tsx` | **V7 Alejandra workstation + e-sign** |
| `src/logistics/pages/QualityReleasePageLegacy.tsx` | **Classic status board** |
| `src/logistics/AppRoutesLogistics.tsx` | Edition fork routing |
| `src/logistics/data/reactiveLogisticsDemo.ts` | V7 bus, sync, audit |
| `src/logistics/data/logisticsMockData.ts` | Classic inspections / QNs / holds / capacity |
| `src/logistics/contracts/capacityContracts.ts` | ID / N1 definition |
| `src/logistics/components/ResetDemoDataButton.tsx` | Demo reset |
| `src/logistics/components/LogisticsPageShell.tsx` | Shared chrome |
| `src/logistics/components/LogisticsDrawer.tsx` | Classic detail drawer |
| `src/logistics/MobileReceivingPage.tsx` | Upstream Happy Path writer |
| `src/logistics/pages/ShipmentReadinessPage.tsx` | Downstream steril light consumer |
| `src/logistics/widgets/SpaceXShippingGatingWidget.tsx` | Widget mirror of gating |
| `src/FilesMD/cursor-prompt-specification-v7.md` | Persona + e-sign spec |
| `src/navigation/navigationConfig.tsx` | Screen key + edition labels |
| `src/workstation/components/WorkstationsLibraryScreen.tsx` | App Library card |
| `src/auth/contexts/AuthContext.tsx` | `loginPassword` for e-sign |

---

## 14. Visual / interaction notes

| Aspect | Classic | V7 |
|---|---|---|
| Shell | Light logistics | Light logistics |
| Density | KPI + capacity + tabbed tables + drawer | Two-pane queue/detail + modal |
| Accent | `LOGISTICS_ACCENT` tabs/timeline | Contained `#044ED7` CTA |
| Typography | Mixed MUI + `lx` | `logisticsType` section/body/caption |
| Cards | PanelCard / Paper holds | Paper sections (interaction containers) |

---

## 15. Demo script (recommended)

### Script A — V7 Happy Path gate (core)
1. Edition **Inside Logistics** → **Reset Demo Data**.
2. Run **Lupita** on `ELP2026.101` → Mark Dock Ready → status `IN_INSPECTION`.
3. Open **Quality Release** / Alejandra.
4. Select **LOT-A-114** (Urgent — Line Stop).
5. Show evidence chips → **Open E-Signature Gateway**.
6. Enter any 4+ char password → choose disposition → read attestation → **Confirm Release**.
7. Show success notice mentioning **SHIP-QRO-15**.
8. Jump to **Gaby / Shipment Readiness** → steril light **GREEN** → GO.

### Script B — V7 without Lupita first
1. Reset → open Alejandra immediately.
2. LOT-A-114 still **EXPECTED** → warning Alert; CTA disabled.
3. Call out N1 gate cannot fire without MD custody upstream.

### Script C — Classic logistics visibility board
1. Edition **classic** → App Library **Quality Release**.
2. KPIs: 4 in queue / 1 late / staging 81% → 110% projected.
3. Tab **Post-Sterilization** → open **QA-0708-014** (late 7.5d, Mayo pledge, SL-2026-0705).
4. **Request priority release** → urgency appears; Approve remains disabled.
5. Tab **SQE / QNs** + **Hold / Blocked** for supplier defect story (44102).

### Script D — Contrast editions
1. Same App Library card; switch edition; note **completely different product**.
2. Classic cannot unlock Gaby; V7 cannot show SQE 30-day QN board.

---

## 16. Analysis prompts for Gemini Notebook

1. Formalize the N1/N2/N3 autonomy matrix for ID and map each UI control to an autonomy level.
2. Assess whether password rule `length >= 4` violates the 21 CFR Part 11 story; propose a production-grade e-sign binding (re-auth, meaning of signature, audit immutability).
3. Design a single QA domain model that unifies classic `qa_inspections` and V7 `PalletUnit` without breaking Happy Path demos.
4. Recommend how Shipping urgency requests should affect prioritization without auto-releasing (DA vs ID boundary).
5. Trace Mayo Clinic pledge story: classic QA-0708-014 ↔ CT critical materials ↔ Shipment Readiness ↔ backorder BO-0709-01.
6. Evaluate evidence pack honesty: hardcoded green chips vs `coaAttached` / lab systems; what should be N2-assisted.
7. Specify HOLD / REJECT disposition paths (reason catalog includes “Hold for deviation” but Confirm always sets RELEASED).
8. Accessibility audit: classic click-only rows vs V7 keyboard patterns; propose parity.
9. Define ST12–ST22 / ST78–ST81 coverage claimed in classic subtitle against actual tabs/fields.
10. Propose multi-lot e-sign batching rules that preserve N1 per lot.
11. Analyze `src/FilesMD/AUDIT_TRAIL` mirror key naming vs real document management.
12. Recommend how ASN Portal assessment documents (CoC/CoA/BOL) should feed classic/V7 evidence panels.
13. Design role-based views: QA Inspector vs Supervisor vs SQE vs Logistics viewer (read-only timeline).
14. Specify Reset Demo Data governance for live executive demos (what must never persist across browsers/users).
15. Compare disabled classic Approve vs V7 Confirm — which better teaches the regulatory ceiling to non-QA stakeholders?

---

## 17. Known gaps & demo limitations

1. **Two products, one card** — edition switch required; easy to confuse in demos.
2. **V7 password shortcut** (`length >= 4`) weakens Part 11 fidelity.
3. **Disposition reason “Hold for deviation” still RELEASES** — no HOLD/REJECT branch.
4. **Evidence chips are static** — not derived from pallet/`coaAttached`/lab results.
5. **Queue includes EXPECTED/RELEASED** but CTA only for IN_INSPECTION/HOLD.
6. **Only two seed pallets** — limited risk-sort demonstration.
7. **Classic Approve permanently disabled** — cannot demo disposition on classic board.
8. **Classic urgency** does not reorder or escalate SLA fields.
9. **No shared IDs** between classic QA-* and V7 ELP2026.* / LOT-A-114.
10. **Released today KPI** counts all released in seed (1), not calendar “today” filter logic beyond seed narrative.
11. **Capacity panel** does not decrease when (if) classic release existed — release isn’t possible.
12. **Search placeholder** mentions driver-like breadth only for material/lot/pallet/id.
13. **No AI Home dedicated tile** called out for Quality Release (entry via App Library / Happy Path).
14. **Audit trail UI** not shown on the page — writes only to storage.
15. **Pepe (Guided Tasks)** is optional parallel step — Alejandra does not require Pepe completion.
16. **Post-steril TAT “7 days”** is classic copy; V7 Happy Path lot is inbound RM syringe plunger narrative (not post-steril FG), despite disposition reason defaulting to “Post-sterilization release”.
17. **Default disposition reason** may mismatch inbound LOT-A-114 story (raw material) — demo should switch to “Raw-material quarantine release”.
18. **No section deep-link** for classic tabs or V7 selected lot.

---

## 18. Relationship to other logistics prototypes

| Prototype | Relationship |
|---|---|
| **Logistics Mobile Ops (Lupita)** | Upstream MD custody → `IN_INSPECTION` prerequisite |
| **Guided Tasks (Pepe)** | Parallel warehouse DA motion; not required for e-sign |
| **Shipment Readiness (Gaby)** | Downstream consumer of steril gate via linked pallet |
| **SpaceX Shipping Gating widget** | Dashboard mirror of same steril unlock story |
| **Logistics Control Tower** | Shows QA hold / journey Quality red; **static** vs V7 reactive |
| **ASN Portal** | Pre-receiving partner docs; banner says QA release remains human gate |
| **Sterilization Tracker** | Classic post-steril load SL-* adjacency (SL-2026-0705 late story) |
| **Receiving L2** | Staging capacity pressure narrative shared with classic capacity panel |

Happy Path stack:

```text
Lupita (MD) → [Pepe DA optional] → Alejandra (ID / N1) → Gaby (outbound gates)
                              ▲
                       THIS PROTOTYPE (V7)
```

---

## 19. One-page cheat sheet

```text
OPEN: App Library → Logistic → Quality Release
  classic → Status Board (queues, SQE, holds, urgency; Approve DISABLED)
  inside_logistics → Dra. Alejandra e-sign workstation

V7 CONTRACT: ID · N1 forever · evidence may be N2 · never N3 auto-release
V7 OBJECT: ELP2026.101 / LOT-A-114 (critical · Urgent — Line Stop)
V7 PREREQ: Lupita → IN_INSPECTION
V7 ACTION: Open E-Signature → password (≥4 chars demo) + reason + attest → RELEASED
V7 EFFECT: audit QA_E_SIGNATURE_RELEASE · SHIP-QRO-15 sterilPass GREEN · Gaby GO

CLASSIC: logisticsMockData · ST12–ST22 / ST78–ST81 · 7d post-steril TAT · 30d SQE SLA
CLASSIC DEMO: QA-0708-014 late Mayo pledge · Request priority · no commercial release

RESET: V7 toolbar Reset Demo Data (clears localStorage logistics keys + reload)
```

---

## 20. Cross-pack index

| # | Prototype pack | Screen key | Doc |
|---|---|---|---|
| 01 | Logistics Mobile Ops | `logistics_mobile_ops` | `docs/prototypes/01_LOGISTICS_MOBILE_OPS_GEMINI_NOTEBOOK.md` |
| 02 | Logistics Control Tower | `logistics_control_tower` | `docs/prototypes/02_LOGISTICS_CONTROL_TOWER_GEMINI_NOTEBOOK.md` |
| 03 | ASN Portal | `external_transfer_portal` | `docs/prototypes/03_ASN_PORTAL_GEMINI_NOTEBOOK.md` |
| 04 | **Quality Release** | `quality_release` | **this file** |
| 05 | Shipment Readiness (next) | `shipment_readiness` | *(pending)* |

Catalog overview: `LOGISTICS_PROTOTYPES_GEMINI_NOTEBOOK.md`.
