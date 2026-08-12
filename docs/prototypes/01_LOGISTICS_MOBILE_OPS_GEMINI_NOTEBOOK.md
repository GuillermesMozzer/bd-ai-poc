# Prototype Deep Dive 01 — Logistics Mobile Ops

**Product:** BD Smart Factory / Inside Logistics (`bd-ai-poc`)  
**App Library card:** Logistics Mobile Ops  
**Screen key:** `logistics_mobile_ops`  
**Category:** Logistic → Mobile Operations  
**Live demo:** https://guillermesmozzer.github.io/bd-ai-poc/  
**Audience:** Gemini Notebook analysis (single-prototype pack)

---

## 0. Document control

| Field | Value |
|---|---|
| Prototype name | Logistics Mobile Ops |
| Primary journey (V7) | Lupita — Dock Tablet Receiving |
| Capacity contract | **MD — Directed Movement** |
| Happy Path position | Step **1 of 4** (Lupita → Pepe → Alejandra → Gaby) |
| Editions | Classic (legacy mobile ops) **and** Inside Logistics V7 (reactive dock tablet) |
| Spec source | `src/FilesMD/cursor-prompt-specification-v7.md` |
| Router | `src/logistics/AppRoutesLogistics.tsx` |

---

## 1. Executive summary

**Logistics Mobile Ops** is the inbound receiving prototype for warehouse / dock operators.

It is **one App Library card** that routes to **two different products** depending on the selected edition:

| Edition | What the user actually sees | Persona |
|---|---|---|
| **Smart Factory (classic)** | Phone-first area selection → inbound unloading → LP generate/print/confirm | Charles Gavin (Warehouse Operator) |
| **Inside Logistics (V7)** | 10" dock tablet: SAP appointment queue + 4-point checklist + custody transfer into QA | María Guadalupe “Lupita” Hernández López |

In V7, this screen is the **entry gate of the reactive Happy Path**: transferring custody of LP `ELP2026.101` / lot `LOT-A-114` creates the pending inspection that Dra. Alejandra later e-signs, which eventually unlocks Gaby’s SpaceX sterilization light.

---

## 2. How to open this prototype

### Path A — App Library (both editions)
1. Sign in.
2. Header → **apps grid** (top-left).
3. Category pill **Logistic**.
4. Card **Logistics Mobile Ops**  
   Description: *“Mobile-first area selection for inside logistics operator execution.”*

### Path B — Inside Logistics Happy Path (V7 only)
1. At entry, choose **Inside Logistics (new version)**.
2. Either:
   - Header orange button **Inside Logistics** → `1. Lupita — Dock Tablet`, or
   - App Library top block **Inside Logistics · Happy Path** → `1. Lupita` / `Dock Tablet`.

### Path C — Side navigation
- Logistic children → **Logistics Mobile Ops** (classic label) or **Lupita — Dock Tablet** (Inside Logistics label).

### Deep links
- `?edition=classic`
- `?edition=inside_logistics`

Edition is stored in `localStorage` key `bd-smart-factory-edition`.

---

## 3. Routing & architecture

```text
App Library / Nav / Happy Path
        │
        ▼
screen key: logistics_mobile_ops
        │
        ▼
AppRoutesLogistics.tsx
        │
        ├── isInsideLogistics === true  → LogisticsMobileOpsPage.tsx
        │                                   └── re-exports MobileReceivingPage.tsx   (V7)
        │
        └── isInsideLogistics === false → LogisticsMobileOpsPageLegacy.tsx
                                            └── mobileOps/components/*             (Classic)
```

### Critical implementation detail
Both editions share the **same screen key** but **do not share**:
- data model
- persistence
- persona
- UI shell
- Happy Path reactivity

Treat them as **two prototypes behind one launcher**.

---

## 4. Capacity contract & regulatory context (V7)

### Contract: Directed Movement (MD)
Defined in `src/logistics/contracts/capacityContracts.ts`.

| Attribute | Value |
|---|---|
| Code | `MD` |
| Name | Directed Movement |
| Engineering rigor | **Idempotency** |
| Intent | Move a physical unit (pallet/box) from origin to destination |
| Max autonomy | N2 assisted |
| Design rule | Confirming the same task twice must not double-move stock; confirmation is a state transition anchored on immutable keys (`idempotency_key` / LP) |

### Evidence capture aspect
Although the commercial release disposition is owned by contract **ID** (Alejandra), Lupita’s checklist captures **physical evidence gates** before custody transfer (COA attached, label printed, documentary match). In product language: MD movement with inbound inspection evidence prerequisites.

### URS references touched by this screen
| Code | Where it appears | Meaning in demo |
|---|---|---|
| `URS-400-003` | SAP sync failure / retry toast | PO paperwork cannot be verified until SAP sync recovers |
| (downstream) `URS-610-002` | Quality Release e-sign | Not on Mobile Ops UI, but is the consumer of Lupita’s handoff |

---

## 5. Personas

### V7 — Lupita
| Field | Value |
|---|---|
| Full name | María Guadalupe “Lupita” Hernández López |
| Device | 10" tablet |
| Site context | El Paso Dock |
| Primary CTA | **MARK DOCK READY (TRANSFER CUSTODY)** |
| Success outcome | Pallet → `IN_INSPECTION`, location `QA-HOLD-01`, pending QA for Alejandra |

### Classic — Charles Gavin
| Field | Value |
|---|---|
| Name | Charles Gavin |
| Role chip | Warehouse Operator · Active session |
| Avatar | `/images/charles-gavin-avatar.jpg` |
| Secondary mock operator | Mia Torres (on trailer TRL-1187) |
| Primary flow | Assign → Start unloading → Generate/Print/Confirm LPs |

---

## 6. Inside Logistics V7 — detailed specification

### 6.1 Page chrome
Rendered by `LogisticsPageShell`:

| Element | Copy / behavior |
|---|---|
| Overline | `LOGISTICS` |
| Title (H1) | `Tablet Receiving — Lupita` |
| Subtitle | `Dock tablet · SAP appointment queue · Directed Movement (MD)` |
| Toolbar | **Reset Demo Data** |
| Back control | `Logistics Control Tower` |
| Banner | `Persona: María Guadalupe “Lupita” Hernández López · 10" tablet view · El Paso Dock` |

Typography is intentionally densified to app scale (`logisticsType`), not oversized marketing headings.

### 6.2 Layout structure
Responsive 2-column grid (`maxWidth: 980`):

```text
┌─────────────────────┬──────────────────────────────────────┐
│ SAP Appointment     │ Dock detail panel                    │
│ Queue               │  - Carrier / dock / time             │
│  - truck cards      │  - SKU / material / batch / LP       │
│  - keyboard listbox │  - SAP exception OR checklist        │
│                     │  - MARK DOCK READY CTA               │
└─────────────────────┴──────────────────────────────────────┘
                         Snackbar (bottom center)
```

### 6.3 Left panel — SAP Appointment Queue
- Section title: `SAP Appointment Queue`
- Role semantics: `listbox` / `option` with keyboard activation (Enter/Space)
- Each card shows:
  - `{carrierName} — {dock}`
  - `{scheduledTime} · {poNumber} · Status: {status}` (+ `· Selected` when active)
- Selecting a truck **resets the checklist** to all unchecked.

### 6.4 Seed appointments (demo data)

#### Truck A — Happy Path (default selected)
| Field | Value |
|---|---|
| LP id | `ELP2026.101` |
| Carrier | Swift Transport |
| Dock | Dock 3 |
| Scheduled | 10:40 AM |
| PO | PO-98440 |
| SKU | BD-8805-SYR |
| Material | Syringe Plunger 5ml |
| Batch | **LOT-A-114** |
| Expected qty | 500 |
| Initial status | `EXPECTED` |
| Initial location | `STAGING-DOCK-3` |
| Line-stop risk (downstream QA) | `critical` |
| Divergences | none |

#### Truck B — Exception path
| Field | Value |
|---|---|
| LP id | `ELP2026.102` |
| Carrier | DHL Freight |
| Dock | Dock 1 |
| Scheduled | 11:15 AM |
| PO | PO-98445 |
| SKU | BD-3304-NDL |
| Material | Precision Needle 22G |
| Batch | LOT-E-509 |
| Expected qty | (seeded) |
| Received qty | 0 |
| Initial status | `EXPECTED` |
| Divergences | `['SAP_SYNC_FAILED']` |

### 6.5 Right panel — dock detail states

#### State: no selection
Copy: `Select a truck appointment.`

#### State: normal truck (or SAP already fixed)
Shows material identity line:

`{sku} · {materialName} · Batch {batch} · LP {id}`

Then **4-Point Dock Checklist**.

#### State: SAP exception truck (DHL, not yet fixed)
Shows error alert:

> Warning: PO paperwork could not be verified — SAP sync failed [URS-400-003]

Action button: **Retry SAP Sync**  
While loading: spinner + `Retrying…`  
Checklist is **hidden**.

After successful retry (1.2s simulated delay):
- Alert becomes success: `SAP sync recovered. PO paperwork verified — checklist unlocked.`
- Toast: `SAP sync restored — checklist unlocked [URS-400-003]`
- Checklist appears.

### 6.6 4-Point Dock Checklist (exact labels)

| # | UI label | State field |
|---|---|---|
| 1 | Physical vs documentary match? | `physicalMatch` |
| 2 | Invoice & BOL match the PO? | `bolMatch` |
| 3 | Physical Pallet ID label printed? | `labelPrinted` |
| 4 | Supplier COA attached? | `coaAttached` |

Helper text:
- Incomplete: `Complete all four checklist items before transferring custody.`
- Complete: `All checklist items complete. Ready to transfer custody.`

### 6.7 Primary CTA — MARK DOCK READY (TRANSFER CUSTODY)

Enabled only when `canTransfer` is true:

```text
canTransfer =
  selected exists
  AND not (SAP_SYNC_FAILED && !sapFixed)
  AND all 4 checklist boxes true
  AND status ∉ { IN_INSPECTION, RELEASED }
```

On click (`markDockReady`):

1. `updatePallet(id, {`
   - `status: 'IN_INSPECTION'`
   - `receivedQty: expectedQty`
   - `coaAttached: true`
   - `location: 'QA-HOLD-01'`
   - `})`
2. `appendAudit({`
   - `actor: María Guadalupe “Lupita” Hernández López`
   - `action: MARK_DOCK_READY_TRANSFER_CUSTODY`
   - `entityId: LP id`
   - `contract: 'MD'`
   - `detail: Barcode LP {id} confirmed. Custody transferred to QA inspection queue.`
   - `})`
3. Toast: `LP {id} barcoded → IN_INSPECTION. Pending item created for Dra. Alejandra.`
4. Checklist cleared.

If already transferred, success alert:

`Custody already transferred · status {IN_INSPECTION|RELEASED}`

### 6.8 Status state machine (V7, this screen)

Declared pallet statuses in demo model:

`EXPECTED | RECEIVED | IN_INSPECTION | HOLD | RELEASED | REJECTED`

**Transition exercised by Mobile Ops:**

```text
EXPECTED ──MARK DOCK READY──► IN_INSPECTION
```

Notes:
- Status `RECEIVED` exists in the type system but is **not used** by this screen.
- Orthogonal flag `inbound_sap_sync_fixed` unlocks the exception truck checklist without changing pallet status.

### 6.9 Persistence / reactivity bus

Source: `src/logistics/data/reactiveLogisticsDemo.ts`

| Key | Role for Mobile Ops |
|---|---|
| `inbound_pallets` | Pallet queue + status |
| `inbound_sap_sync_fixed` | SAP exception cleared flag |
| `logistics_audit_trail` | Audit events |
| `src/FilesMD/AUDIT_TRAIL` | Mirrored audit (spec compatibility) |

Subscription: `subscribeLogisticsDemo` listens to custom event `bd-logistics-demo-updated` and `storage` (cross-tab).

### 6.10 Reset Demo Data
Confirm dialog:

> Reset Demo Data?  
>  
> This clears logistics localStorage and reloads the page to the initial Happy Path.

Clears logistics demo keys, re-seeds, reloads page.

### 6.11 Accessibility (WCAG pass applied)
- Main landmark + heading hierarchy
- Appointment cards are keyboard operable (`role="option"`, Enter/Space)
- Focus-visible rings
- Checklist grouped in `fieldset` with labelled heading
- CTA `aria-describedby` helper text
- Live region / snackbar status announcements
- Disabled CTA remains readable (improved contrast)

### 6.12 Happy Path handoff (downstream consumers)

```text
Lupita (this screen)
   transfers ELP2026.101 → IN_INSPECTION @ QA-HOLD-01
        │
        ▼
Alejandra — Quality Release
   sees risk-sorted quarantine queue
   e-signs LOT-A-114 → RELEASED
        │
        ▼
Gaby — Shipment Readiness (SHIP-QRO-15)
   sterilization gate turns GREEN → GO
```

Linked outbound shipment seed: `SHIP-QRO-15` with `linkedPalletId: ELP2026.101`, `linkedBatch: LOT-A-114`.

Pepe (Guided Tasks) is **parallel** and does not gate Lupita → Alejandra.

---

## 7. Classic edition — detailed specification

### 7.1 Shell & device model
- Component tree under `src/logistics/mobileOps/components/`
- Shell: `MobileOpsShell` (narrow, max ~560px, sticky header)
- Global AppBar is **hidden** on this screen (`MainLayout` mobile-ops mode)
- Forces true device zoom via `html[data-logistics-mobile-ops='true']`
- Operator chip: Charles Gavin · Active session
- Eyebrow text in shell: `Inside Logistics` (even under classic edition — known inconsistency)

### 7.2 View state machine

```text
areas
  └─ inbound-receiving
       ├─ ready-to-unload ──► task-detail ──► delivery execution
       │                                         ├─ pallet-lps ──► pallet-detail
       │                                         └─ receiving-checklist-placeholder
       ├─ my-active-tasks ──► task-detail ...
       ├─ waiting-for-qa (read-only summary)
       ├─ inbound-placeholder (Released for putaway)
       └─ inbound-placeholder (Exceptions)
```

Future areas on area-selection screen (disabled / Coming soon):
- Material Replenishment
- WIP Movement
- Finished Goods

### 7.3 Area selection
- Title: `Logistics Mobile Ops`
- Heading: `Select an area`
- Subcopy: `Choose your assigned logistics work area to continue.`
- Active card: **Inbound Receiving** — `Receive and stage inbound materials`
- Apps icon → Back to app library (`workstations`)

### 7.4 Inbound Receiving landing
- Title: `Inbound Receiving`
- Cards:
  - Ready to unload (dynamic count)
  - My active tasks (dynamic count)
  - Waiting for QA (static demo: 8 LPs / 8 pallets)
  - Released for putaway (hardcoded 3) → placeholder
  - Exceptions (hardcoded 1) → placeholder

### 7.5 Task model (inline React state — not localStorage)

Seed task examples:

| Id | Priority | Vendor | Trailer | Dock | Pallets | Status |
|---|---|---|---|---|---|---|
| `inbound-trl-3302` | High | GlobalPack Solutions | TRL-3302 | RM Dock A | 4 | Ready to unload / Not started / assigned Charles |
| `inbound-trl-1187` | Medium | MedSupply Components | TRL-1187 | RM Dock B | 6 | Ready to unload / In progress / Charles + Mia |

Key fields: `releaseStatus`, `unloadingStatus`, `assignedOperators`, `expectedPallets`, `purchaseOrder`, `stagingLane`, `lot`, etc.

### 7.6 Delivery execution rules
1. Assign to me (if unassigned).
2. Start unloading (Not started → In progress).
3. Delivery acknowledgements (3 toggles):
   - Pallets unloaded
   - Labels applied
   - Issues reviewed
4. Per-pallet LP lifecycle:
   - Generate LP → `LP-{trailerCode}-{seq}`
   - Print / reprint label
   - Confirm LP
5. Receiving checks unlock only when:
   - all expected pallets confirmed, AND
   - all 3 acknowledgements true  
   → currently opens a **placeholder** (`Receiving checklist coming next`)
6. Report issue / Complete receiving are locked stubs.

### 7.7 Classic statuses
```text
releaseStatus: Pending release | Ready to unload
unloadingStatus: Not started → In progress → Completed (Completed never auto-set in current UI)
Pallet LP: Not started → LP generated → Label printed → LP confirmed
```

### 7.8 Classic limitations (explicit)
- No shared demo store / no audit trail
- No QA handoff reactivity
- Receiving checklist unfinished
- Putaway / Exceptions counts are static placeholders
- Completing a delivery end-to-end is not possible in current UI

---

## 8. UI copy catalog (English, V7)

### Titles / navigation
- `Logistics Mobile Ops` (App Library)
- `Tablet Receiving — Lupita`
- `Lupita — Dock Tablet`
- `1. Lupita — Dock Tablet`
- `Dock Tablet`
- `SAP Appointment Queue`
- `4-Point Dock Checklist`
- `Logistics Control Tower` (back)

### Checklist
- `Physical vs documentary match?`
- `Invoice & BOL match the PO?`
- `Physical Pallet ID label printed?`
- `Supplier COA attached?`

### Actions
- `MARK DOCK READY (TRANSFER CUSTODY)`
- `Retry SAP Sync`
- `Retrying…`
- `Reset Demo Data`

### Messages
- `Select a truck appointment.`
- `Complete all four checklist items before transferring custody.`
- `All checklist items complete. Ready to transfer custody.`
- `Warning: PO paperwork could not be verified — SAP sync failed [URS-400-003]`
- `SAP sync recovered. PO paperwork verified — checklist unlocked.`
- `SAP sync restored — checklist unlocked [URS-400-003]`
- `LP {id} barcoded → IN_INSPECTION. Pending item created for Dra. Alejandra.`
- `Custody already transferred · status {status}`
- Happy Path tip: `Start with Lupita (Dock 3) to unlock Alejandra's lot and Gaby's GO.`

---

## 9. File map

| File | Responsibility |
|---|---|
| `src/logistics/AppRoutesLogistics.tsx` | Edition-aware routing for `logistics_mobile_ops` |
| `src/logistics/pages/LogisticsMobileOpsPage.tsx` | V7 wrapper re-export |
| `src/logistics/MobileReceivingPage.tsx` | **V7 implementation (Lupita)** |
| `src/logistics/pages/LogisticsMobileOpsPageLegacy.tsx` | Classic orchestrator |
| `src/logistics/mobileOps/components/*` | Classic UI modules (shell, landing, tasks, LP detail, etc.) |
| `src/logistics/data/reactiveLogisticsDemo.ts` | V7 pallets, SAP flag, audit, reset |
| `src/logistics/contracts/capacityContracts.ts` | MD/DA/ID definitions |
| `src/logistics/components/LogisticsPageShell.tsx` | V7 page chrome |
| `src/logistics/components/ResetDemoDataButton.tsx` | Demo reset control |
| `src/logistics/a11y.ts` | Shared a11y helpers |
| `src/logistics/typography.ts` | Shared type scale |
| `src/common/contexts/EditionContext.tsx` | classic / inside_logistics |
| `src/navigation/navigationConfig.tsx` | Labels / screen keys |
| `src/navigation/MainLayout.tsx` | Mobile-ops chrome hide + Happy Path menu |
| `src/workstation/components/AppLibraryDrawer.tsx` | Happy Path launcher |
| `src/workstation/components/WorkstationsLibraryScreen.tsx` | App Library card definition |
| `src/FilesMD/cursor-prompt-specification-v7.md` | Original V7 product/engineering prompt |

---

## 10. Demo script (recommended for executives)

### Script A — Happy Path (Inside Logistics)
1. Choose edition **Inside Logistics**.
2. Open **Lupita — Dock Tablet**.
3. Keep **Swift Transport — Dock 3** selected.
4. Check all 4 checklist items.
5. Press **MARK DOCK READY (TRANSFER CUSTODY)**.
6. Confirm toast mentions Alejandra pending item.
7. Open **Quality Release** and show LOT-A-114 now actionable.
8. (Optional continue) Alejandra e-sign → Gaby GO.

### Script B — Exception recovery
1. Select **DHL Freight — Dock 1**.
2. Show SAP sync failure banner (`URS-400-003`).
3. Click **Retry SAP Sync**.
4. Complete checklist and transfer.

### Script C — Classic mobile ops (contrast)
1. Switch edition to **Smart Factory**.
2. Open Logistics Mobile Ops.
3. Walk Area selection → Inbound Receiving → Ready to unload → Assign/Start → LP generate/print/confirm.
4. Call out that receiving checklist / complete receiving are still placeholders.

---

## 11. Analysis prompts for Gemini Notebook

1. Map Lupita’s MD contract steps to IN01 inbound macroflow activities; identify missing steps between physical arrival and QA hold.
2. Compare classic LP generate/print/confirm with V7 “single transfer custody” abstraction — which model is better for operator cognitive load?
3. Evaluate whether EXPECTED → IN_INSPECTION (skipping RECEIVED) is acceptable for FDA-facing storytelling.
4. Propose offline / flaky Wi-Fi behavior for dock tablets consistent with MD idempotency.
5. Design role-based authorization: who may transfer custody vs who may only view appointments.
6. Define acceptance criteria for replacing simulated SAP retry with a real SAP QM/MM integration stub.
7. Propose telemetry events for each checklist item and the transfer CTA (for Ops analytics).
8. Identify UX risks of hiding the global AppBar in classic mode vs keeping shell navigation in V7.
9. Recommend how to unify classic and V7 under one information architecture without breaking demos.
10. Draft a validation matrix (URS-400-003 and related inbound URS) against the implemented exception path.

---

## 12. Known gaps & demo limitations

1. One launcher, two products (classic vs V7) with no shared state.
2. No real barcode scanner hardware — “barcoded” is narrative in toast/audit.
3. SAP retry is cosmetic (local flag only); divergence array on pallet is not cleared.
4. `RECEIVED` status unused by V7 path.
5. No authenticated persona binding (names are hard-coded).
6. Classic receiving checklist and complete-receiving are unfinished.
7. Classic putaway/exceptions metrics are static stubs.
8. Classic shell eyebrow says “Inside Logistics” even in classic edition.
9. Cross-device continuity requires the same browser profile / localStorage.
10. No multi-LP ASN line items under one truck appointment in V7 seed (one LP per truck card).

---

## 13. Relationship to other prototypes

| Prototype | Relationship to Mobile Ops |
|---|---|
| Quality Release | Direct consumer of V7 custody transfer |
| Shipment Readiness | Indirect beneficiary via Alejandra release of LOT-A-114 |
| Guided Tasks | Parallel warehouse execution (Pepe), not a hard gate |
| Logistics Control Tower | Executive visibility layer over inbound macroflow |
| ASN Portal | Upstream partner/appointment narrative (classic ecosystem) |
| Sterilization Tracker | Adjacent custody story for external sterilizer loads |
| Inbound SLA widget | KPI companion for dock-to-stock cycle time |

---

## 14. One-page cheat sheet

```text
OPEN: App Library → Logistic → Logistics Mobile Ops
   or Inside Logistics → 1. Lupita

V7 GOAL: Dock 3 checklist → MARK DOCK READY
RESULT: ELP2026.101 / LOT-A-114 → IN_INSPECTION → Alejandra queue

EXCEPTION: Dock 1 SAP fail → Retry SAP Sync → checklist unlocks

RESET: Reset Demo Data (V7 toolbar)

CONTRACT: MD (Directed Movement)
URS: URS-400-003 (SAP paperwork)
```

---

*End of Prototype Deep Dive 01 — Logistics Mobile Ops.*  
*Full series (01–12): see `LOGISTICS_PROTOTYPES_GEMINI_NOTEBOOK.md` §7.*
