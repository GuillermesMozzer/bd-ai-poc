# Prototype Deep Dive 03 — ASN Portal

**Product:** BD Smart Factory / Inside Logistics (`bd-ai-poc`)  
**App Library card:** ASN Portal  
**Screen key:** `external_transfer_portal` (aliases: `asn_portal`, path `asn-portal` / `logistic/asn-portal`)  
**Category:** Logistic → External Partners  
**Live demo:** https://guillermesmozzer.github.io/bd-ai-poc/  
**Audience:** Gemini Notebook analysis (single-prototype pack)

---

## 0. Document control

| Field | Value |
|---|---|
| Prototype name | ASN Portal |
| Primary journey role | External partner / provider tenant operator (sandbox: **Provider A**) |
| Happy Path position | **Outside** the Lupita → Pepe → Alejandra → Gaby reactive chain |
| Editions | **Same UI** for Classic and Inside Logistics (no edition fork) |
| Spec / data alignment | Mostly **local hardcoded queue** inside the page; light touch of CDF Gold `logisticsMockData` (`as_of`, `loads_at_provider`, carrier `CAR-220`) |
| Router | `src/logistics/AppRoutesLogistics.tsx` |
| Primary file | `src/logistics/pages/ExternalTransferPortalPage.tsx` (~1,248 lines, single component file) |
| Visual system | Light logistics shell (`LogisticsPageShell` + `lx` theme tokens); BD blue `#194890` / orange `#F07822` accents |

---

## 1. Executive summary

**ASN Portal** is the **partner-facing Advanced Shipping Notice / external transfer workspace**.

It prototypes how an **external provider tenant** (demo label: *Sandbox tenant: Provider A*) works a controlled transfer package **before** BD receiving takes custody:

1. **Dashboard queue** — open transfer requests with PO/STO linkage, SKU quantities, SLA, and next action.
2. **Transfer request** — accept / acknowledge / reject a PO- or STO-linked ASN package (with partner-visible reject reason).
3. **Vehicle / driver identity** — confirm appointment, driver credential, vehicle/trailer, capacity, auth method.
4. **Assessment (ASN closure gate)** — dual gate:
   - **Quantitative:** expected vs received SKU qty by pallet; optional quantity return gate.
   - **Qualitative:** CoC, CoA, BOL, packing list checklist; optional document return gate.
5. **Post-ASN receiving views (implemented but not navigable from section chrome)** — custody handoff, structured status/cycle events, evidence package, discrepancy routing — explicitly framed as **Receiving-owned** after ASN assessment.

It is **visibility + orchestration mock**, not a real partner API or file vault. Toast/Snackbar messages simulate audit payloads. There is **no** write-back into the V7 Happy Path `localStorage` bus (`reactiveLogisticsDemo`).

**Naming note:** App Library title is **ASN Portal**; implementation component / historical screen key is **`ExternalTransferPortalPage` / `external_transfer_portal`**. Treat them as the same product.

---

## 2. How to open this prototype

### Path A — App Library
1. Sign in.
2. Header → **apps grid** (top-left).
3. Category pill **Logistic**.
4. Card **ASN Portal**  
   - Subheading: *External Partners*  
   - Description: *“Track inbound ASNs, dock appointments, carrier confirmations, and exception handling in one logistics portal.”*

### Path B — Side navigation (Logistic)
1. Left nav → **Logistic**.
2. Child **ASN Portal** (`external_transfer_portal`).

### Path C — Deep links / path normalization
From `src/workstation/hooks/useWorkstationActions.ts`, any of these resolve to `external_transfer_portal`:

| Input | Resolves to |
|---|---|
| path `asn-portal` | `external_transfer_portal` |
| path `logistic/asn-portal` | `external_transfer_portal` |
| screen param `external_transfer_portal` | same |
| screen param `asn_portal` | same |

### Path D — AppContent name map
`src/AppContent.tsx` maps display name `'ASN Portal'` → `'external_transfer_portal'`.

### Path E — Not on AI Home
Unlike Logistics Control Tower, ASN Portal has **no** dedicated tile in `src/aiHome/data.tsx` (as of this pack). Entry is App Library / nav / deep link.

### Deep links / edition
- Edition query (`?edition=classic` / `?edition=inside_logistics`) does **not** change ASN Portal UI.
- No section deep-link query param (e.g. `?section=assessment`) — section state is local React `useState`.

### Back navigation
Default `LogisticsPageShell` back control:
- Label: **Logistics Control Tower**
- Action: `setCurrentScreen('logistics_control_tower')`

---

## 3. Routing & architecture

```text
App Library / Nav / Deep link (asn-portal)
        │
        ▼
screen key: external_transfer_portal
        │
        ▼
AppRoutesLogistics.tsx
        │
        └── ExternalTransferPortalPage.tsx  (lazy)
                │
                ├── LogisticsPageShell (title ASN Portal)
                │     banner: partner-visible; Receiving owns post-ASN
                │     toolbar Chip: Sandbox tenant: Provider A
                │
                ├── SectionNav  → ONLY 4 partner ASN views
                │     dashboard | request | identity | assessment
                │
                ├── activeContent registry (8 keys)
                │     dashboard, request, identity, assessment,
                │     custody, status, evidence, issue
                │
                └── receivingOnlySections (defined, UNUSED in SectionNav)
                      custody | status | evidence | issue
```

### Critical implementation details

| Topic | Behavior |
|---|---|
| Edition fork | **None** — one page for Classic and Inside Logistics |
| Happy Path bus | **Not connected** |
| Data | Hardcoded `queue[]` + local component state; `logisticsData` only for `as_of`, `executive_kpis.loads_at_provider`, `carriers['CAR-220'].name` |
| Navigation model | Local `active: PortalSection` — **not** multi-route |
| Primary happy path in UI | Dashboard → Request → Identity → Assessment → Dashboard |
| Post-ASN sections | Code + `activeContent` exist; **SectionNav does not expose them**; no queue row targets them → effectively **orphan views** unless `setActive` is triggered from internal handlers that themselves start from those views |

### Orphan / product-boundary finding (important for Gemini)

`receivingOnlySections` documents four Receiving-owned steps with icons and copy, but **`SectionNav` maps only `sections`** (4 items). Queue `target` values are only `'request' | 'identity' | 'assessment'`. Assessment approval returns to **dashboard**. Therefore **custody / status / evidence / issue panels are currently unreachable in a normal demo click path**, even though their JSX, handlers, and toast copy are fully implemented.

Banner copy reinforces the product intent:

> “This view is visibility and orchestration only. Receiving owns custody, cycle/status, evidence, and discrepancy handling after ASN assessment. Quality release remains a human approval gate.”

Interpretation for analysis: ASN Portal intentionally **stops at assessment approval**; post-ASN screens are either (a) leftover scaffold for a future Receiving partner handoff, or (b) demo leftovers that should be removed or re-homed into Receiving / Mobile Ops.

---

## 4. Progressive disclosure model (product framing)

| Layer | Name | What partner sees | Implementation |
|---|---|---|---|
| L0 | Tenant chrome | Sandbox tenant chip + partner banner + back to Logistics CT | `LogisticsPageShell` |
| L1 | Dashboard | KPI strip + filterable work queue + end-to-end flow strip | `active === 'dashboard'` |
| L2 | Work object views | Request / Identity / Assessment (nav tiles) | `SectionNav` + `activeContent` |
| L3 | Dual assessment gates | Quantitative SKU table + qualitative document checklist + return gates | Assessment panel |
| L4* | Receiving-owned (scaffold) | Custody / Status / Evidence / Issue | Present in code; **not in SectionNav** |

\*L4 is architectural residue relative to the live nav.

---

## 5. Personas / roles (intended audience)

ASN Portal does **not** bind a Happy Path named persona. Implied roles from copy and mock:

| Role | How ASN Portal serves them |
|---|---|
| External provider operator (tenant A) | Queue work, accept/reject ASN, confirm identity, approve assessment |
| Carrier / driver desk | Driver credential + vehicle/trailer confirmation (Southwest Freight) |
| BD dock / receiving coordinator | Downstream owner of custody & discrepancies (banner + orphan sections) |
| Shipment readiness / Quality leads | Issue-owner routing map when discrepancies exist (scaffold) |
| Sterilization tracker coordinator | Owner for `DELAYED_RETURN` issue code (scaffold) |
| Security | Co-owner for `LOST_CUSTODY` |

Demo narrative objects center on **TR-1048 / Load L-58241**, route **BD El Paso → SteriTech El Paso**, appointment **Jul 28, Dock A**.

---

## 6. Data sources — what ASN Portal actually uses

### 6.1 Used

| Source | Used by | Role |
|---|---|---|
| Inline `queue: QueueItem[]` in page | Dashboard table, request/assessment SKU lines | Primary demo transfers (4 rows) |
| Inline constants (`flowSteps`, `evidenceItems`, `qualitativeDocumentItems`) | Flow strip, assessment docs, evidence checklist | Static catalogs |
| Component `useState` | Filters, decisions, gates, toasts, checklists | Interactive demo state (session only) |
| `logisticsData.as_of` | Shell “as of” | Timestamp chrome (`2026-07-09T14:30:00-06:00`) |
| `logisticsData.executive_kpis.loads_at_provider` | KPI tile | Value **3** |
| `logisticsData.carriers['CAR-220'].name` | Identity metrics | **Southwest Freight** |

### 6.2 Not used (despite adjacency)

| Source | Used elsewhere |
|---|---|
| `reactiveLogisticsDemo.ts` | V7 Happy Path |
| `receivingMockData.ts` | Receiving Control Tower L2 |
| `workshopDay2Data.ts` | Job Readiness / Alerts / Machine Status |
| `wipMockData.ts` | WIP CT |
| Provider entities `PROV-STER-01` SteriTech El Paso | Referenced in **copy** (“SteriTech El Paso”) but **not** looked up from `logisticsData.providers` |

**Implication for Gemini analysis:** ASN Portal numbers and queue rows will **not** change when Lupita transfers custody or Alejandra releases a lot. Refreshing the page resets all local approvals, filters, and checkboxes.

---

## 7. Domain model (types & catalogs)

### 7.1 `PortalSection`

```text
dashboard | request | identity | assessment | custody | status | evidence | issue
```

### 7.2 `SkuLine`

| Field | Meaning |
|---|---|
| `orderLine` | PO/STO line number (`10`, `20`, …) |
| `palletNumber` | Pallet range string (e.g. `P-77101 - P-77108`) |
| `sku` | Material code |
| `description` | Material text |
| `expectedQty` | ASN expected quantity |
| `receivedQty` | Counted / declared received quantity |
| `uom` | Unit of measure (`EA`, `CS`, `BAG`, `KIT`) |

Variance = `expectedQty !== receivedQty`. UI shows soft warn row background + StatusPill with signed delta when `showReceived`.

### 7.3 `QueueItem`

| Field | Values / meaning |
|---|---|
| `object` | Display id (e.g. `TR-1048 / Load L-58241`) |
| `type` | `Load` \| `Pallet` \| `Return` |
| `orderType` | `PO` \| `STO` |
| `orderRef` | Order number |
| `skuLines` | Array of `SkuLine` |
| `context` | Partner-visible narrative |
| `nextAction` | Operator cue |
| `status` | `Requested` \| `Confirmed` \| `Assessment` \| `Return gate` \| `Approved` \| `In custody` \| `Issue` |
| `sla` | Human SLA string |
| `target` | Section to open (`request` / `identity` / `assessment` only in seed data) |

### 7.4 Status → StatusPill tone

| Status | Tone |
|---|---|
| `Issue` | danger |
| `Requested` | warn |
| `Assessment` | default |
| `Return gate` | danger |
| `In custody` | default |
| else (`Confirmed`, `Approved`, …) | ok |

### 7.5 Section nav catalog (visible)

| id | Label | Subtitle (exact) | Icon |
|---|---|---|---|
| `dashboard` | Dashboard | Partner-facing queue for transfer requests and open follow-up work. | InsightsOutlined |
| `request` | Transfer request | Acknowledge, accept, or reject the controlled request package. | AssignmentTurnedIn |
| `identity` | Vehicle / driver | Confirm appointment, driver, vehicle, trailer, and capacity. | DirectionsCarFilledOutlined |
| `assessment` | Assessment | Approve quantitative SKU quantities and qualitative PO/STO documents before ASN closure. | FactCheckOutlined |

### 7.6 Receiving-only catalog (defined, not wired to SectionNav)

| id | Label | Subtitle (exact) |
|---|---|---|
| `custody` | Custody transfer | Record shared proof that responsibility transferred at a known time and place. |
| `status` | Status / cycle | Submit structured lifecycle events with sequence and retry control. |
| `evidence` | Evidence / return | Attach required partner evidence to the correct transfer object. |
| `issue` | Discrepancy | Route custody, identity, timing, and evidence issues to the right owner. |

### 7.7 End-to-end partner flow strip (`flowSteps`)

| # | Label | Helper | Seed state | Visual tone |
|---|---|---|---|---|
| 1 | Request | PO/STO-linked ASN package | `done` | ok green |
| 2 | SKU quantities | Expected quantity per SKU | `done` | ok green |
| 3 | Identity | Driver and capacity | `active` | BD blue |
| 4 | Assessment | Quantitative + document gates | `default` | muted |
| 5 | Return gate | Only when variance or document gap exists | `blocked` | danger |

**Important:** This strip is **illustrative static seed**, not driven by live `active` section or queue status.

### 7.8 Qualitative documents

1. Certificate of Conformance (CoC) — seed checked **true**  
2. Certificate of Analysis (CoA) — seed checked **true**  
3. Bill of Lading (BOL) — seed checked **false** (blocks document approval until checked)  
4. Packing list — seed checked **true**

### 7.9 Evidence checklist (scaffold)

1. Provider cycle report — false  
2. Delivery or return photo — false  
3. Seal verification — **true**  
4. Exception-free statement — false  

---

## 8. Seeded transfer queue (exact demo objects)

Active working object for Request/Identity/Assessment forms is always **`queue[0]`** (`activeTransfer`), regardless of which row the user clicked **Open** on. **Open** only changes `active` section (`item.target`); it does **not** select a different transfer for the detail forms. That is a major demo limitation.

### Row 1 — TR-1048 (primary)

| Field | Value |
|---|---|
| Object | `TR-1048 / Load L-58241` |
| Type | Load · PO `PO-4501182741` |
| Context | BD El Paso supplier receipt, 18 pallets, pickup Jul 28 08:00 |
| Next action | Accept transfer request |
| Status | Requested · SLA Due today · target `request` |
| SKU lines | SKU-100184 Catheter tray sterile pouch · 1200 EA (P-77101–P-77108); SKU-100299 Introducer kit carton · 640 EA (P-77109–P-77114); SKU-100377 Procedure pack shipper · 180 CS (P-77115–P-77118) |
| Qty match | All expected = received |

### Row 2 — TR-1047

| Field | Value |
|---|---|
| Object | `TR-1047 / Load L-58216` |
| Type | Load · STO `STO-68100422` |
| Context | BD Columbus West to BD El Paso, vehicle assigned, driver credential pending |
| Next action | Confirm driver identity |
| Status | Confirmed · Due in 2h · target `identity` |
| SKUs | SKU-220441 Needle hub component 2400 EA; SKU-220879 Finished good case 96 CS |

### Row 3 — TR-1039 (variance story)

| Field | Value |
|---|---|
| Object | `TR-1039 / Load L-58190` |
| Type | Load · PO `PO-4501181988` |
| Context | Supplier ASN has quantity variance on resin lot bag |
| Next action | Review quantitative return gate |
| Status | Return gate · Due tomorrow · target `assessment` |
| Variance | SKU-331021 Resin lot bag **expected 80 / received 78 BAG** (−2); packing insert 400 EA match |

### Row 4 — TR-1033

| Field | Value |
|---|---|
| Object | `TR-1033 / Load L-58172` |
| Type | Load · STO `STO-68100377` |
| Context | BD site transfer ready for qualitative document review |
| Next action | Approve assessment |
| Status | Assessment · Due in 4h · target `assessment` |
| SKUs | Line clearance kit 32 KIT; Label roll case 12 CS (match) |

**Note on variance UX bug/demo quirk:** Assessment always renders `activeTransfer.skuLines` from **row 1** (all matches). The return-gate / variance narrative of TR-1039 is visible in the **dashboard queue**, but **not** in the Assessment SKU table unless the page is later wired to selected-row state. Quantity return gate must be opened manually via **Open quantity return gate** or the select control.

---

## 9. UX — step-by-step (reachable sections)

### 9.1 Page chrome

| Element | Exact / behavior |
|---|---|
| Title | **ASN Portal** |
| Subtitle pattern | `{selectedSection.subtitle} PO/STO linkage, SKU quantities, and pre-receiving assessment visibility.` |
| Toolbar | Chip **Sandbox tenant: Provider A** |
| Banner title | **Partner-visible transfer workspace.** |
| Banner body | Visibility/orchestration only; Receiving owns post-ASN; Quality release remains human gate |
| As-of | From `logisticsData.as_of` |
| Back | Logistics Control Tower |
| Toast | Snackbar bottom-right, 3200 ms |

Brand colors in-page: `BD_BLUE = #194890`, `BD_BLUE_SOFT = rgba(25,72,144,0.08)`, `BD_ORANGE = #F07822`. Contained primary buttons often use blue hover→orange (or orange hover→blue on “New request”).

### 9.2 Dashboard

#### KPI strip (`KpiRow`) — exact tiles

| Label | Value | Helper | Tone |
|---|---|---|---|
| Open transfer requests | 4 | 2 need acknowledgement today | default |
| Identity confirmations | 3 | 1 driver credential expires soon | default |
| Assessment pending | 2 | Quantity and document gates | warn |
| Return gates | 1 | Quantity variance or document gap | danger |
| Loads at provider | `logisticsData…loads_at_provider` (=3) | Receiving owns custody/status later | default |
| Provider tenant | A | Sandbox external view | default |

#### Transfer work queue

Filters:
- **Status:** All / Requested / Confirmed / Assessment / Return gate / Approved  
  (UI filter does **not** list `In custody` or `Issue` even though types exist.)
- **Object type:** All / Load / Pallet / Return  
  (Seed data is **all Load** — Pallet/Return filters empty the table.)
- **Search:** matches object, orderRef, SKU text, description, context, nextAction (case-insensitive)
- **Reset:** clears all three filters

Columns: Object · PO/STO · SKU quantities · Partner-visible context · Next action · Status · SLA · Open

Action **New request** → jumps to `request` section (does not create a new queue row).

#### End-to-end partner flow panel
Five static step cards (§7.7).

### 9.3 Transfer request

Info alert (exact intent): Transfer Request must be linked to PO **or** STO; each line carries expected qty by SKU.

Metric pairs:
- Order reference → `PO PO-4501182741`
- Pickup window → Jul 28, 08:00 to 10:00
- Route → BD El Paso to SteriTech El Paso
- Load → 18 pallets, sealed load

SKU table (`SkuLineReview` without received columns): SKU · Material · Pallet · Expected qty.

Response select:
- Accept request
- Acknowledge only
- Reject request

Reject requires **Partner-visible reason** (validated on submit).

Buttons:
- **Save draft** → toast *Draft saved for partner review.*
- **Submit response** → validates decision (+ reason if reject); toast *Request response submitted with partner-visible payload and audit event.*; navigates to **identity**

Operator review card shows transfer, linked order, response, visible note; caption: internal quality notes stay hidden.

### 9.4 Vehicle / driver confirmation

Metric pairs:
- Appointment → Jul 28, 08:00 - Dock A
- Carrier → Southwest Freight (`CAR-220`)
- Capacity → 48 ft trailer / 18 pallet slots
- Auth method → Portal credential + dock code

Fields:
- Driver name default **Marisol Reyes** (uncontrolled `defaultValue`)
- Driver credential controlled default **DL-885204**
- Vehicle ID controlled default **TRACTOR-302**
- Trailer ID default **TRL-7718** (uncontrolled)

Buttons:
- **Simulate mismatch** → clears credential; toast about discrepancy path
- **Confirm identity** → requires credential + vehicle ID; toast records confirmation; navigates to **assessment**

### 9.5 Quantitative + document assessment (ASN closure)

Info alert: ASN validates upstream order package **before receiving**; custody/status/evidence/discrepancies move to Receiving flow.

#### Left — Quantitative assessment
- Order, variance line count (from `activeTransfer` — seed **0** for TR-1048)
- `SkuLineReview` **with** received qty + Result pills
- Quantity return gate select: `none` | `review` | `return`
- Toggle **Approve quantitative assessment**

#### Right — Qualitative document assessment
- Required docs string; readiness `N of 4`; LinearProgress
- Checkbox rows with Ready/Missing pills
- Document return gate select: `none` | `review` | `return`
- **Approve document assessment** disabled until all four docs checked

#### Footer actions
- **Open quantity return gate** → sets quantity gate to `return` + toast
- **Open document return gate** → sets document gate to `return` + toast
- **Approve assessment** → requires both approvals; blocks if either gate === `return`; success toast; navigates to **dashboard**

`assessmentComplete` = quantityApproved ∧ documentApproved ∧ neither gate is `return`.

Panel StatusPill: **Approved** (ok) vs **Approval needed** (warn).

---

## 10. UX — scaffold sections (code-complete, nav-orphaned)

Documented for completeness and for Gemini “dead code / product boundary” analysis. To reach them today a developer would need to temporarily wire SectionNav or call `setActive` from console.

### 10.1 Custody handoff
- Warning: custody ≠ QA release / disposition / receiving validation
- Fields: handoff code `DOCK-A3-58241`, seal `SEAL-91028`, location Dock A3, timestamp 2026-07-28 10:12
- From BD El Paso logistics → To SteriTech El Paso provider tenant; reconciliation → SFP exception queue if rejected
- **Reject custody** → jumps to issue, pre-fills `LOST_CUSTODY` / Critical / summary
- **Accept custody** → toast; navigates to **status**

### 10.2 Status and cycle update
Status codes: `CYCLE_STARTED` | `CYCLE_COMPLETE` | `RETURN_READY` | `RETURN_IN_TRANSIT`

Structured payload preview (`statusPayload`):

```json
{
  "transferRequestId": "TR-1048",
  "objectReference": "L-58241",
  "statusCode": "<selected>",
  "milestoneTimestamp": "2026-07-28T12:05",
  "expectedCompletion": "2026-07-29T17:00",
  "sequence": <number>,
  "idempotencyKey": "TR-1048-L-58241-SEQ-<sequence>",
  "note": "Partner-visible lifecycle update only"
}
```

- **Simulate duplicate** → sequence `2` + reject/retry toast (UI does not actually block Send)
- **Send status** → toast *Structured status event accepted…*; navigates to **evidence**

### 10.3 Evidence and return package
Checklist + evidence type select + object reference (must be **`L-58241`**) + file name required.

- **Simulate wrong object** → sets ref `L-99999`
- Submit validation: missing ref/file; wrong object toast; incomplete vs complete package messages
- Warning alert about production file security / malware / retention
- On submit → navigates to **issue**

### 10.4 Discrepancy notification

Issue codes → owner / SLA map:

| Code | Owner | SLA (non-Critical) |
|---|---|---|
| `CRITICAL_DAMAGE` | Quality and shipment readiness leads | 1 business hour |
| `LOST_CUSTODY` | Security, Quality, and logistics owner | Immediate |
| `REJECTED_LOAD` | Shipment readiness lead | 2 business hours |
| `MISSING_EVIDENCE` | External tracker coordinator | 4 business hours |
| `IDENTITY_MISMATCH` | Dock coordinator and carrier admin | 1 business hour |
| `DELAYED_RETURN` | Sterilization tracker coordinator | 4 business hours |

If severity **Critical**, SLA forced to **Immediate**.

Actions: Save draft · **No discrepancy** (clears summary, closes to dashboard) · Submit issue (requires code + summary).

---

## 11. Interaction / state machine (reachable path)

```text
[dashboard]
   │ Open(target) / New request / SectionNav
   ├─► [request] --Submit response✓──► [identity]
   ├─► [identity] --Confirm identity✓──► [assessment]
   └─► [assessment]
          │ Approve assessment✓ ──► [dashboard]
          │ Open return gates (blocks approve until cleared)
          └─ (no nav to custody)

Unreachable without code change:
[custody] → [status] → [evidence] → [issue] → [dashboard]
```

Validation messages (exact toasts worth capturing for demos):

| Trigger | Message |
|---|---|
| Submit request w/o decision | Select a request response before submitting. |
| Reject w/o reason | Rejecting a request requires a partner-visible reason. |
| Confirm identity incomplete | Driver credential and vehicle ID are required before confirmation. |
| Assessment missing qty approve | Quantitative assessment must be approved before ASN closure. |
| Assessment missing doc approve | Qualitative document assessment must be approved before ASN closure. |
| Return gate active | Return gate is active. ASN cannot be closed until the return decision is resolved. |
| Assessment success | Assessment approved. PO/STO quantities and required documents are ready for receiving handoff. |

---

## 12. Shared UI building blocks (in-file + imports)

### In-file helpers
- `MetricPair` — soft bordered metric tile
- `ReviewCard` — titled review stack
- `SkuLineReview` — SKU table (optional received/result columns)
- `SectionNav` — 4-up button grid (responsive 1→4 columns)
- `statusTone` / `flowTone`

### Shared logistics components
| Import | Role |
|---|---|
| `LogisticsPageShell` | Page chrome + back to CT |
| `KpiRow` | Dashboard KPI strip |
| `PanelCard` | Section containers |
| `StatusPill` | Status / result chips |
| `lx` (`themeTokens`) | Light logistics palette |
| MUI Table / Select / Checkbox / Snackbar / Alert / LinearProgress | Form & feedback |

---

## 13. Accessibility & localization notes

- Page is English-only (repo UI language policy).
- SKU table exposes `aria-label="SKU quantities by pallet"`.
- SectionNav uses native `<button>` elements (good) but **does not** set `aria-pressed` / `aria-current` for selected tile.
- Many TextFields use `defaultValue` (uncontrolled) — mismatch simulation and drafts won’t capture driver name / trailer / location / timestamps into review payloads.
- Snackbar is the sole live feedback channel; no `aria-live` region beyond MUI Snackbar defaults.
- Color is paired with StatusPill **labels** (Match / variance qty / Ready / Missing) — not color-only for SKU results.

---

## 14. Exact copy catalog (high-signal strings)

### Shell / product
- ASN Portal
- Sandbox tenant: Provider A
- Partner-visible transfer workspace.
- ASN Portal views / External partner
- Logistics Control Tower (back)

### App Library
- External Partners
- Track inbound ASNs, dock appointments, carrier confirmations, and exception handling in one logistics portal.

### Dashboard
- Transfer work queue / New request
- End-to-end partner flow
- No transfer objects match the current filters.
- Open transfer requests / Identity confirmations / Assessment pending / Return gates / Loads at provider / Provider tenant

### Request
- Transfer request / Action needed
- Order lines to expect
- Confirm the SKU and quantity package before accepting the transfer.
- Accept request / Acknowledge only / Reject request
- Partner-visible reason / Required only when rejecting.
- Only the transfer reference, response, and partner-visible reason are shared. Internal quality notes stay hidden.

### Identity
- Vehicle and driver confirmation / Confirmed request
- Simulate mismatch / Confirm identity

### Assessment
- Quantitative and document assessment
- Quantitative assessment / Qualitative document assessment
- Quantity return gate / Document return gate
- No return gate / Needs receiving review / Return required
- Open quantity return gate / Open document return gate / Approve assessment
- CoC, CoA, BOL, packing list

### Scaffold
- Custody handoff / Dock checkpoint
- Status and cycle update / API-ready event
- Evidence and return package
- Discrepancy notification / Shared exception
- No discrepancy
- Production validation still needs file security, format rules, retention, malware scanning, and audit trail review.

---

## 15. File map

| File | Responsibility |
|---|---|
| `src/logistics/pages/ExternalTransferPortalPage.tsx` | **Entire ASN Portal UX + local mock queue** |
| `src/logistics/AppRoutesLogistics.tsx` | Lazy route for `external_transfer_portal` |
| `src/logistics/components/LogisticsPageShell.tsx` | Shared chrome / back to CT |
| `src/logistics/components/KpiRow.tsx` | KPI strip |
| `src/logistics/components/PanelCard.tsx` | Panels |
| `src/logistics/components/StatusPill.tsx` | Status chips |
| `src/logistics/themeTokens.ts` | `lx` light tokens |
| `src/logistics/data/logisticsMockData.ts` | `as_of`, loads_at_provider, CAR-220 |
| `src/navigation/navigationConfig.tsx` | Screen key + Logistic nav child |
| `src/workstation/components/WorkstationsLibraryScreen.tsx` | App Library card |
| `src/workstation/components/AppLibraryDrawer.tsx` | Drawer shortcut label ASN Portal |
| `src/workstation/hooks/useWorkstationActions.ts` | Path/alias normalization |
| `src/AppContent.tsx` | Display name → screen map |

No dedicated ASN data module, no tests folder specific to this page in the prototype pack.

---

## 16. Visual / implementation notes

| Token | Value |
|---|---|
| Shell background | MUI `background.default` (light logistics) |
| Accent blue | `#194890` |
| Soft blue | `rgba(25, 72, 144, 0.08)` |
| Accent orange | `#F07822` |
| Borders / soft panels | `lx.border` / `lx.soft` |
| OK / Warn / Danger | via `lx.ok*`, `lx.warn*`, `lx.danger*` and StatusPill tones |

Composition: light operational portal (not dark Control Tower). Section tiles form the primary IA. Cards/panels are interaction containers for forms and queues (allowed under the repo’s “cards for interaction” exception).

---

## 17. Demo script (recommended)

### Script A — Partner ASN happy path (reachable)
1. App Library → Logistic → **ASN Portal**.
2. Point to tenant chip **Provider A** and banner (Receiving owns post-ASN).
3. Dashboard KPIs: 4 open / 1 return gate / loads at provider 3.
4. Open **TR-1048** → Transfer request; show PO + 3 SKU lines; **Accept request** → Submit.
5. Identity: Southwest Freight, Marisol Reyes, DL/vehicle → **Confirm identity**.
6. Assessment: check BOL (missing), approve quantitative + documents → **Approve assessment**.
7. Land back on dashboard; call out flow strip still static (Identity active / Return gate blocked).

### Script B — Return gate / reject stories
1. From Assessment, click **Open quantity return gate** → try Approve → blocked toast.
2. Or from Request: **Reject request** without reason → validation; with reason → submit path.
3. Identity: **Simulate mismatch** → empty credential blocks confirm.

### Script C — Queue filters (show seed limits)
1. Filter Object type **Pallet** → empty state.
2. Search `resin` → only TR-1039 row.
3. Open TR-1039 → Assessment still shows TR-1048 lines (call out selection gap).

### Script D — Boundary vs Receiving / Happy Path
1. Approve ASN assessment; note **no** custody UI appears.
2. Optionally open Logistics Mobile Ops (Lupita) / Quality Release — show no shared live state with ASN Portal.
3. Back to Logistics Control Tower — CT KPIs unchanged.

### Script E — (Optional / engineering) scaffold walkthrough
Only if temporarily exposing receiving sections: custody accept → status send → evidence → issue routing owners/SLAs.

---

## 18. Analysis prompts for Gemini Notebook

1. Redraw the partner ASN lifecycle and mark the **BD receiving ownership cut line** after assessment; recommend which scaffold screens belong in ASN vs Receiving vs Sterilization Tracker.
2. Propose a selected-transfer state model so queue **Open** binds `activeTransfer` (fix data) instead of always `queue[0]`.
3. Design a real partner API contract for request response, identity confirmation, and assessment approval (payloads, idempotency, audit).
4. Reconcile App Library blurb (“exception handling”) with banner (“Receiving owns … discrepancy”) — which product owns exceptions?
5. Evaluate whether `receivingOnlySections` should be deleted, moved, or gated behind a “Receiving partner handoff” mode.
6. Specify how PO vs STO differences should change UI (today only chip/order type differs).
7. Model return-gate workflow end-to-end: who clears `return`, what ASN status becomes, how TR-1039 variance appears in assessment.
8. Define file evidence requirements for production (format allow-list, virus scan, retention, object binding) beyond the warning Alert.
9. Map issue-code owner matrix to real BD RACI and SFP exception queue SLAs.
10. Assess multi-tenant provider UX (tenant A sandbox chip) for SteriTech vs GammaMed vs intercompany Sandy.
11. Propose deep links `?section=assessment&transfer=TR-1048` for demo and support.
12. Accessibility review: SectionNav pressed state, uncontrolled fields, Snackbar vs assertive live region.
13. Compare ASN Portal light shell vs Logistics Control Tower dark cockpit — when should partners see a distinct branded partner theme?
14. Determine integration points with Receiving L2 truck schedule / Mobile Ops dock tablet appointment queue (shared appointment Jul 28 Dock A narrative).
15. Write acceptance criteria for making the end-to-end flow strip a **live state machine** driven by the active transfer.

---

## 19. Known gaps & demo limitations

1. **No edition fork** and **no Happy Path reactivity**.
2. **Detail forms always bound to `queue[0]`** (TR-1048), ignoring which row was opened.
3. **`receivingOnlySections` unused** in SectionNav; custody/status/evidence/issue effectively orphaned.
4. **Flow strip is static** — not synced to `active` or queue status.
5. **KPIs are hardcoded** (except loads_at_provider) — not derived from `queue`.
6. **Filter options incomplete** vs status union (`In custody`, `Issue` missing from Status select).
7. **Object types Pallet/Return** have no seed rows.
8. **New request** does not create data — only navigates.
9. **Assessment variance story (TR-1039)** visible in queue but not in assessment table.
10. **Simulate duplicate** on status does not actually block Send.
11. **Uncontrolled fields** (driver name, trailer, location, timestamps, some notes) omitted from review payloads.
12. **No AI Home tile**.
13. **No persistence** — refresh loses approvals/checklists.
14. **Provider SteriTech** named in copy but not loaded from `logisticsData.providers`.
15. **No real file upload** — filename string only.
16. **Snackbar-only** audit simulation — no event log UI.
17. **Search** does not include driver/vehicle IDs despite placeholder text mentioning them.
18. **Approve assessment** returns to dashboard instead of a clear “ready for receiving” confirmation screen.
19. **Status filter “Approved”** exists but no seed row uses `Approved`.
20. **Single file monolith** (~1.2k lines) — harder to test than split view modules.

---

## 20. Relationship to other logistics prototypes

| Prototype | Relationship to ASN Portal |
|---|---|
| **Logistics Control Tower** | Default back target; executive visibility of inbound / provider loads; **no shared live state** |
| **Receiving Control Tower (L2)** | Downstream dock/truck board; should conceptually consume ASN appointment / load readiness |
| **Logistics Mobile Ops (Lupita)** | Dock execution after ASN; custody transfer is operator-side, not partner portal |
| **Quality Release (Alejandra)** | Explicitly **out of scope** — human QA gate remains separate |
| **Shipment Readiness (Gaby)** | Downstream FG; issue owners may include shipment readiness leads |
| **Sterilization Tracker** | Provider cycle / delayed return ownership adjacency; SteriTech narrative overlap |
| **Pallet Load Check** | Outbound FG verification — different object lifecycle |
| **Guided Tasks / Job Readiness / Machine Status / Production Alerts / WIP CT** | Internal plant execution — not partner-facing |

Conceptual stack:

```text
   External partner (this prototype)
   ASN Portal: Request → Identity → Assessment
                    │
                    ▼  (ownership cut)
            BD Receiving
         Mobile Ops / Receiving L2
                    │
                    ▼
              Quality Release
                    │
                    ▼
         Sterilization / Shipping apps
```

---

## 21. One-page cheat sheet

```text
OPEN: App Library → Logistic → ASN Portal
   or Nav Logistic → ASN Portal
   or deep link asn-portal / logistic/asn-portal / asn_portal

TENANT: Sandbox Provider A
SHELL: Light LogisticsPageShell → back to Logistics Control Tower
DATA: Local queue (4 loads) + light logisticsMockData touch
NOT: Happy Path bus / edition fork / AI Home tile

NAV (live): Dashboard | Transfer request | Vehicle/driver | Assessment
NAV (code only): Custody | Status/cycle | Evidence | Issue

DEMO PATH:
  TR-1048 Request Accept → Identity Confirm → Assessment
  Check BOL → Approve qty + docs → Approve assessment → Dashboard

WATCH OUTS:
  Forms always TR-1048 (queue[0])
  Flow strip static
  Return-gate variance of TR-1039 not in assessment table
  Post-ASN sections orphaned from SectionNav
  KPIs mostly hardcoded

CUT LINE: After assessment, Receiving owns custody/status/evidence/discrepancy
```

---

## 22. Cross-pack index

| # | Prototype pack | Screen key | Doc |
|---|---|---|---|
| 01 | Logistics Mobile Ops | `logistics_mobile_ops` | `docs/prototypes/01_LOGISTICS_MOBILE_OPS_GEMINI_NOTEBOOK.md` |
| 02 | Logistics Control Tower | `logistics_control_tower` | `docs/prototypes/02_LOGISTICS_CONTROL_TOWER_GEMINI_NOTEBOOK.md` |
| 03 | **ASN Portal** | `external_transfer_portal` | **this file** |
| 04 | Quality Release (next) | `quality_release` | *(pending)* |

Catalog overview: `LOGISTICS_PROTOTYPES_GEMINI_NOTEBOOK.md`.
