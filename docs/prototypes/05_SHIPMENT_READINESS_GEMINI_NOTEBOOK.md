# Prototype Deep Dive 05 — Shipment Readiness

**Product:** BD Smart Factory / Inside Logistics (`bd-ai-poc`)  
**App Library card:** Shipment Readiness  
**Screen key:** `shipment_readiness`  
**Category:** Logistic → Outbound  
**Live demo:** https://guillermesmozzer.github.io/bd-ai-poc/  
**Audience:** Gemini Notebook analysis (single-prototype pack)

---

## 0. Document control

| Field | Value |
|---|---|
| Prototype name | Shipment Readiness |
| Primary journey (V7) | Gabriela “Gaby” Rodríguez Pérez — SpaceX Shipping Cockpit |
| Capacity contracts (V7) | **DA** (customs re-verify / gating) + **MD** (GO / PGI release) |
| Happy Path position | Step **4 of 4** (Lupita → Pepe → Alejandra → **Gaby**) |
| Editions | Classic (readiness cockpit board) **and** Inside Logistics V7 (4-light SpaceX console) |
| Spec source (V7) | `src/FilesMD/cursor-prompt-specification-v7.md` § Gaby |
| Router | `src/logistics/AppRoutesLogistics.tsx` |
| Primary files | V7: `ShipmentReadinessPage.tsx` · Classic: `ShipmentReadinessPageLegacy.tsx` |
| Related widget | `spacex_shipping_gating` → `SpaceXShippingGatingWidget.tsx` |
| Visual system | Classic: light `LogisticsPageShell` · V7: dark navy cockpit panels `#0B132B` inside light shell |

---

## 1. Executive summary

**Shipment Readiness** is the **outbound fulfillment / shipping gate** prototype.

It is **one App Library card** that routes to **two different products** by edition:

| Edition | What the user actually sees | Persona / framing |
|---|---|---|
| **Smart Factory (classic)** | **Shipment Readiness Cockpit**: priority-tier list (pledge / 48h / standard / backorder), readiness %, hazmat, daily shipping report, outbound exception board, digital pallet config → Pallet Load Check, backorder/EOM table, drawer with 11 readiness gates | FG shipping ops (L. Nguyen et al.) · ST86–ST108 |
| **Inside Logistics (V7)** | **SpaceX Shipping Cockpit — Gaby**: truck list + four traffic lights + **GO — RELEASE SHIPMENT**; steril light listens to Alejandra’s release of `LOT-A-114`; Reno truck has customs exception path | **Gabriela “Gaby” Rodríguez Pérez** |

In V7, this screen is the **Happy Path finale**: after Alejandra e-signs, `SHIP-QRO-15.checks.sterilizationPass` becomes **GREEN**; when all four lights are green, Gaby can pulse-launch PGI. Classic board uses static CDF Gold `outbound_shipments` and does **not** share state with the Happy Path bus.

---

## 2. How to open this prototype

### Path A — App Library (both editions)
1. Sign in.
2. Header → **apps grid**.
3. Category **Logistic**.
4. Card **Shipment Readiness**  
   - Subheading: *Outbound*  
   - Description: *“Pledge, 48h, and backorder readiness with hazmat and pallet configuration gates.”*

### Path B — Inside Logistics Happy Path (V7)
1. Choose **Inside Logistics**.
2. Header **Inside Logistics** → `4. Gaby — SpaceX Cockpit`, or App Library Happy Path → `4. Gaby` / `Gaby Shipping`.

### Path C — Side navigation
- Classic label: **Shipment Readiness**
- Inside Logistics label: **Gaby — SpaceX Shipping Cockpit**

### Path D — From classic Digital Pallet Configuration
Button **Open 3D Load Check** → `setCurrentScreen('pallet_verification')`.

### Path E — Related widget (not the App Library card)
Workstation dashboard widget **SpaceX Shipping Gating Console** (`spacex_shipping_gating`) mirrors Querétaro gate lights (read-mostly; Launch button is non-mutating).

### Deep links / edition
- `?edition=classic` → Legacy cockpit  
- `?edition=inside_logistics` → Gaby SpaceX  
- Edition key: `bd-smart-factory-edition`

### Back navigation
Shell default → **Logistics Control Tower**.

---

## 3. Routing & architecture

```text
App Library / Nav / Happy Path
        │
        ▼
screen key: shipment_readiness
        │
        ▼
AppRoutesLogistics.tsx
        │
        ├── isInsideLogistics === true  → ShipmentReadinessPage.tsx        (V7)
        │                                   └── reactiveLogisticsDemo
        │                                         getShipments / setShipments / appendAudit
        │                                         (sterilPass synced from RELEASED pallets)
        │
        └── isInsideLogistics === false → ShipmentReadinessPageLegacy.tsx  (Classic)
                                            └── logisticsMockData
                                                  outbound_shipments, shipping_daily,
                                                  backorders, exceptions(Shipping),
                                                  READINESS_GATES
```

### Critical implementation details

| Topic | Classic | V7 |
|---|---|---|
| Data | Static CDF mock | `localStorage` shipments + live sync from pallets |
| Can post PGI / release? | **No** (readiness visibility only) | **Yes** — GO sets `status: 'RELEASED'` + audit MD |
| Happy Path | None | Step 4 finale |
| Gate model | 11 boolean `READINESS_GATES` | 4 `GateLight` traffic lights |
| Dark UI | No | Yes (truck + detail panels) |
| Reset Demo Data | No | Yes (toolbar) |
| Link to Pallet Load Check | Yes | No |
| Widget twin | No | `SpaceXShippingGatingWidget` |

---

## 4. Capacity contracts (V7)

| Action | Contract | Rigor | Meaning in this UI |
|---|---|---|---|
| Re-Verify Customs XML | **DA** | Autonomy threshold | Assisted override of blocked customs light after simulated SAP QM / Receita check |
| GO — RELEASE SHIPMENT | **MD** | Idempotency | Directed movement / PGI state transition; truck cleared from dock |

Page does **not** perform ID (Inspect & Disposition). Sterilization gate is an **input** from Alejandra’s ID e-sign — Gaby must not override a RED steril light manually (no UI control for that).

Upstream regulatory story: quarantine release remains N1 on Quality Release; shipping GO assumes steril pass is already GREEN.

---

## 5. Personas / roles

### 5.1 V7 — named Happy Path persona

| Field | Value |
|---|---|
| Name | Gabriela “Gaby” Rodríguez Pérez |
| Role | Shipping / SpaceX release console operator |
| Audit actor | Exact: `Gabriela “Gaby” Rodríguez Pérez` |
| Actions | `REVERIFY_CUSTOMS_XML` (DA), `GO_RELEASE_SHIPMENT_PGI` (MD) |

### 5.2 Classic — implied roles

| User id | Display |
|---|---|
| `USR-fg-lead` | L. Nguyen — FG Team Leader |
| `USR-fg-op` | S. Kim — FG Operator |
| `USR-cs` | V. Torres — Customer Service |

Customers in seed: Mayo Clinic Supply Chain, Cardinal Health — West, McKesson Medical, BD Playas DC (scheduled).

---

## 6. Data sources

### 6.1 V7 — `reactiveLogisticsDemo`

| Entity | Role |
|---|---|
| `OutboundShipment` (`SHIP-QRO-15`, `SHIP-RNO-08`) | Truck list + gates |
| `getShipments()` | Always runs `syncShipmentsFromPallets` so steril light reflects RELEASED LPs |
| `setShipments` | Persist customs fix / GO release |
| `appendAudit` | Customs + PGI events (+ `src/FilesMD/AUDIT_TRAIL` mirror) |
| Linked pallet | `ELP2026.101` / batch `LOT-A-114` on Querétaro |

**Seed shipments (exact):**

| id | Destination | Need date | Seed status | Lights (B/S/C/L) | Carrier · Dock |
|---|---|---|---|---|---|
| **SHIP-QRO-15** | Querétaro, MX (Export) | 2026-08-12 | READINESS_CHECK | GREEN / **RED** / GREEN / GREEN | Swift Transport · DOCK-14 |
| **SHIP-RNO-08** | Reno, NV (Domestic) | 2026-08-11 | BLOCKED | GREEN / GREEN / **RED** / GREEN | FedEx Freight · DOCK-15 |

After Alejandra releases `ELP2026.101`, QRO steril → GREEN. Reno steril stays GREEN from seed (exception story is customs).

`OutboundShipment.status` union: `READINESS_CHECK | PICKING | LOADING | RELEASED | BLOCKED`.

`GateLight`: `GREEN | YELLOW | RED` (YELLOW supported in type/color helper; seed uses GREEN/RED only).

### 6.2 Classic — `logisticsMockData`

| Collection | Role |
|---|---|
| `outbound_shipments` (6) | Readiness list + drawer + pallet grid |
| `shipping_daily` | Daily report + KPI cases |
| `backorders` (3) | Backorder & EOM panel |
| `exceptions` where `process_area === 'Shipping'` | Exception board (3 items) |
| `customers` / `carriers` / `users` / `materials` | Lookups |
| `READINESS_GATES` (`constants.ts`) | Drawer checklist labels |

---

## 7. Happy Path reactivity (V7) — exact chain

```text
Lupita → ELP2026.101 IN_INSPECTION
Alejandra → ELP2026.101 RELEASED
            syncShipmentsFromPallets → SHIP-QRO-15.sterilizationPass = GREEN
Gaby (this prototype)
  Select SHIP-QRO-15
  All 4 lights GREEN → GO pulse enabled
  Click GO → 1.6s launch → status RELEASED + audit GO_RELEASE_SHIPMENT_PGI (MD)
```

**Banner (exact intent):** Persona Gaby · Sterilization light listens to Dra. Alejandra RELEASE of LOT-A-114 via localStorage.

**If steril still RED:** GO locked; help text *GO is locked until every gate shows Pass (GREEN).*

**Alternate path — Reno customs:**
1. Select `SHIP-RNO-08`
2. Error Alert + **Re-Verify Customs XML** (2.0s spinner)
3. Sets `customsClearance: GREEN`, status `READINESS_CHECK`, audit `REVERIFY_CUSTOMS_XML` (DA)
4. Then GO available

---

## 8. V7 UX — step-by-step

### 8.1 Chrome

| Element | Exact |
|---|---|
| Title | **SpaceX Shipping Cockpit — Gaby** |
| Subtitle | 4-light release console · Querétaro / Reno · Control Tower aesthetic |
| Toolbar | Reset Demo Data |
| Info banner | Persona + Alejandra listenership |
| Layout | `280px` truck rail + detail cockpit (`md+`) |

### 8.2 Trucks list (dark panel)

- `role="listbox"` / options with `aria-selected`, keyboard activate
- Default selection: **SHIP-QRO-15**
- Shows destination, id, status, Selected marker

### 8.3 Four release gates

| Key | Label (exact) |
|---|---|
| `batchRecord` | BATCH RECORD VALIDATION |
| `sterilizationPass` | STERILIZATION CYCLE CONFIRMED |
| `customsClearance` | CUSTOMS DOCUMENTATION READY |
| `lineClearance` | LINE CLEARANCE OK |

Each gate shows color disc + `Status: {Pass\|Caution\|Blocked} ({GREEN\|YELLOW\|RED})` via `gateStatusLabel` (not color-only).

RED discs **pulse** (1.2s); respects `reducedMotionSx`.

### 8.4 Customs exception UI (Reno only)

Shown when `id === 'SHIP-RNO-08' && customsClearance === 'RED'`:

> CUSTOMS DOCUMENTATION blocked (RED) — GO locked until SAP QM / Receita re-verify.

Action: **Re-Verify Customs XML** / **Verifying…** with `aria-busy`.

### 8.5 GO control

| State | Button |
|---|---|
| Not all green | Disabled gray `#546E7A` · **GO — RELEASE SHIPMENT** |
| All green & not released | Green `#2e7d32` · **goPulse** animation · enabled |
| Launching | Spinner · `aria-busy` · 1600 ms |
| Already RELEASED | **SHIPMENT RELEASED** · disabled |

Help captions:
- Shipment already released.
- All four gates passed. Ready to release.
- GO is locked until every gate shows Pass (GREEN).

Success banners:
- `{id}: Customs XML re-verified successfully.`
- `{id}: GO — shipment released / PGI posted.`

---

## 9. Classic UX — step-by-step

### 9.1 Chrome

| Element | Exact |
|---|---|
| Title | **Shipment Readiness Cockpit** |
| Subtitle | Pledge · 48h · domestic/intl · hazmat · backorders · **ST86–ST108** |
| As-of | `2026-07-09T14:30:00-06:00` |

### 9.2 KPI strip (computed from seed)

| Label | Seed logic | Approx value |
|---|---|---|
| Pledge not ready | tier pledge ∧ readiness &lt; 100 | **2** (OB-001, OB-002) danger |
| 48h window open | window_48h ∧ &lt;100 | **1** (OB-003) warn |
| Ready (100%) | readiness === 100 | **1** (OB-004) ok |
| Open cases today | `shipping_daily.open_cases_today` | **42** |
| Cases shipped today | 18 | ok |
| Open backorders | `backorders.length` | **3** danger |

### 9.3 Daily shipping report

| Field | Seed |
|---|---|
| Open cases | 42 |
| Shipped today | 18 |
| Pledge remaining | 2 |
| 48h remaining | 5 |
| Overtime risk | Yes — review staffing |
| Saturday candidate | No |
| EOM volume flag | Yes — *Customer service OTP push — elevated volume expected last week of month* |

### 9.4 Shipment Readiness List

Filters:
- Priority chips: All / Pledge today / 48-hour / Standard / Backorders
- Ship type: All / Domestic / International
- Search: SO, customer, shipment id
- Sort: pledge → window_48h → backorder → standard

Columns: Priority · Readiness%+bar · Shipment · SO · Type · Customer · Due · Cases · Hazmat · Blockers · Owner

### 9.5 Seeded outbound shipments (exact)

| ID | SO | Customer | Tier | Type | Ready% | Hazmat | Highlight blockers |
|---|---|---|---|---|---|---|---|
| **OB-0709-001** | SO-8802142 | Mayo Clinic | **pledge** | intl | **45%** | Gap | picking, carrier, documents (+ hazmat) |
| OB-0709-002 | SO-8802155 | Cardinal Health — West | pledge | domestic | 92% | — | sap_delivery_ready |
| OB-0709-003 | SO-8802160 | McKesson Medical | window_48h | domestic | 28% | — | inventory, reboxing RBX-0709-001, carrier |
| OB-0709-004 | SO-8802171 | Mayo Clinic | window_48h | domestic | **100%** | — | none · PGI-0709-004 |
| OB-0709-005 | SO-8802188 | BD Playas DC | standard | domestic | 70% | — | picking_complete |
| OB-0709-006 | SO-8802199 | Cardinal Health — West | backorder | intl | 55% | Gap | inventory, documents · EOM air note |

OB-001 links **BO-0709-01** (Mayo / QA hold post-steril — same story as Quality Release classic QA-0708-014).  
OB-002 has 2 pallets (drives Digital Pallet Configuration grid preference).

### 9.6 Eleven readiness gates (`READINESS_GATES`)

1. Sales order selected  
2. Inventory available  
3. Picking complete  
4. Pallet configuration complete  
5. Damage check complete  
6. Reboxing resolved  
7. Documents ready  
8. Hazmat docs ready (intl) — shown if hazmat_required **or** international  
9. Carrier booked  
10. Dock / container ready  
11. SAP delivery / shipment ready  

Icons: check (ok) vs empty radio (pending).

### 9.7 Outbound Exception Board (Shipping only)

| ID | Type | Linked | Severity | Story |
|---|---|---|---|---|
| EXC-0709-004 | reboxing_delay | OB-0709-003 | medium | McKesson 48h · RBX-0709-001 |
| EXC-0709-006 | carrier_delay | BK-0709-002 | medium | Cardinal SO-8802155 pickup |
| EXC-0709-007 | hazmat_doc_gap | OB-0709-001 | high | Mayo intl pledge · port rejection risk |

### 9.8 Digital Pallet Configuration

- Prefers selected shipment with pallets, else first with ≥2 pallets, else any with pallets → typically **OB-0709-002** when nothing selected.
- 6-slot dashed grid (empty slots labeled).
- CTA → **Open 3D Load Check** (`pallet_verification`).

### 9.9 Backorder & EOM pressure

| BO | SO | Material | Qty | Reason | If released | EOM |
|---|---|---|---|---|---|---|
| BO-0709-01 | SO-8802142 | 12045 | 240 | QA hold post-sterilization | air_fedex_box_label | Yes |
| BO-0709-02 | SO-8802190 | 12088 | 600 | Partial ship — inventory short | ground | Yes |
| BO-0709-03 | SO-8802201 | 12045 | 120 | Waiting end-of-month quality releases | air_fedex_box_label | Yes |

### 9.10 Drawer sections
Readiness % · gates checklist · hazmat (if required) · linked BOs · carrier/dock timeline · SAP delivery/PGI when present.

**No GO / PGI action** on classic — pure visibility + navigation to Pallet Load Check.

---

## 10. SpaceX widget twin (`spacex_shipping_gating`)

| Aspect | Behavior |
|---|---|
| Focus | Always **SHIP-QRO-15** narrative |
| Steril green | `pallet ELP2026.101 === RELEASED` **or** shipment sterilPass GREEN |
| Customs | GREEN unless shipment customs is RED |
| Batch / Line | Hardcoded green |
| CTA when unlocked | **LAUNCH SHIPMENT (GO)** — **does not call** `setShipments` / PGI |
| CTA when locked | **CUSTODY LOCKED** · Lot LOT-A-114 pending digital signature… |

**Implication:** Widget is a dashboard **preview** of gate state; only the full **Shipment Readiness** V7 page performs GO / customs mutate.

---

## 11. Gate models compared

| Dimension | Classic | V7 |
|---|---|---|
| Count | 11 operational readiness booleans | 4 release traffic lights |
| Scoring | `readiness_pct` (author-seeded, not derived live) | `allGreen` boolean AND of 4 lights |
| Hazmat | Explicit gate + column | Not modeled (customs stands in for export docs on QRO) |
| SAP PGI | Shown as gate / docs when ready | Simulated on GO click |
| QA steril dependency | Via backorder/QA stories in copy | Hard-wired to pallet RELEASED sync |

These are **parallel universes**: OB-0709-* ≠ SHIP-QRO-15 / SHIP-RNO-08.

---

## 12. Accessibility notes (V7)

| Pattern | Where |
|---|---|
| `role="status"` / `role="alert"` | Banners, customs error |
| listbox / option truck selection | Keyboard + aria-selected |
| Gate list + `aria-label` with Pass/Blocked text | Not color-only |
| `aria-busy` on Verify / GO | Loading states |
| `focusVisibleOnDarkSx` / `touchTargetSx` | Dark panels |
| `reducedMotionSx` | Pulse / goPulse animations |
| Disabled contrast | Light text on gray GO |

Classic: click-only table rows (no V7 keyboard parity).

---

## 13. Exact copy catalog (high-signal)

### App Library / nav
- Shipment Readiness · Outbound  
- Pledge, 48h, and backorder readiness with hazmat and pallet configuration gates.  
- Gaby — SpaceX Shipping Cockpit / 4. Gaby — SpaceX Cockpit / Gaby Shipping  

### V7
- SpaceX Shipping Cockpit — Gaby  
- BATCH RECORD VALIDATION / STERILIZATION CYCLE CONFIRMED / CUSTOMS DOCUMENTATION READY / LINE CLEARANCE OK  
- GO — RELEASE SHIPMENT / SHIPMENT RELEASED  
- Re-Verify Customs XML  
- CUSTOMS DOCUMENTATION blocked (RED) — GO locked until SAP QM / Receita re-verify.  

### Classic
- Shipment Readiness Cockpit  
- Daily shipping report / Shipment Readiness List  
- Outbound Exception Board / Digital Pallet Configuration / Backorder & EOM pressure  
- Open 3D Load Check  
- ShipmentReadiness N-25  
- Incomplete — digital form required before carrier pickup  

### Widget
- SpaceX Release Console: SHIP-QRO-15  
- CUSTODY LOCKED / LAUNCH SHIPMENT (GO)  

---

## 14. File map

| File | Responsibility |
|---|---|
| `src/logistics/pages/ShipmentReadinessPage.tsx` | **V7 Gaby SpaceX cockpit** |
| `src/logistics/pages/ShipmentReadinessPageLegacy.tsx` | **Classic readiness board** |
| `src/logistics/widgets/SpaceXShippingGatingWidget.tsx` | Dashboard twin (read-mostly) |
| `src/logistics/data/reactiveLogisticsDemo.ts` | Shipments + steril sync + audit |
| `src/logistics/data/logisticsMockData.ts` | Classic shipments / daily / BOs / exceptions |
| `src/logistics/constants.ts` | `READINESS_GATES` |
| `src/logistics/contracts/capacityContracts.ts` | MD / DA definitions |
| `src/logistics/a11y.ts` | `gateStatusLabel`, dark focus, reduced motion |
| `src/logistics/AppRoutesLogistics.tsx` | Edition fork |
| `src/logistics/pages/QualityReleasePage.tsx` | Upstream steril unlock |
| `src/logistics/pages/PalletVerificationPage.tsx` | Classic deep-link target |
| `src/FilesMD/cursor-prompt-specification-v7.md` | Gaby / 4-light spec |
| `src/navigation/navigationConfig.tsx` | Labels / screen key |
| `src/workstation/components/WorkstationsLibraryScreen.tsx` | App Library card |
| `src/workstation/data/widgetRegistry.ts` | Widget registration |

---

## 15. Visual / implementation notes

| Aspect | Classic | V7 |
|---|---|---|
| Shell | Light logistics | Light shell + **dark** `#0B132B` composition |
| Metaphor | Ops readiness board | Mission-control / SpaceX launch |
| Motion | Progress bars | RED pulse + GO pulse (reduced-motion aware) |
| Primary CTA color | Accent chips / links | Green GO `#2e7d32` |

First viewport (V7): brand via title **SpaceX Shipping Cockpit — Gaby**, one persona banner, truck list + lights + one GO — fits a single composition (dark panels as the dominant visual plane).

---

## 16. Demo script (recommended)

### Script A — V7 Happy Path finale
1. Inside Logistics → Reset Demo Data.  
2. Complete Lupita → Alejandra release of LOT-A-114.  
3. Open **Shipment Readiness** / Gaby.  
4. SHIP-QRO-15: show steril light flipped GREEN; other three already GREEN.  
5. Pulsing **GO — RELEASE SHIPMENT** → launch → SHIPMENT RELEASED + success banner.  

### Script B — V7 without Alejandra
1. Reset → open Gaby immediately.  
2. Steril RED pulsing; GO locked; explain listenership.  

### Script C — Reno customs exception
1. Select **Reno, NV (SHIP-RNO-08)**.  
2. Re-Verify Customs XML (2s) → customs GREEN → GO → release.  

### Script D — Classic Mayo pledge board
1. Edition classic → Shipment Readiness.  
2. KPI pledge not ready; open **OB-0709-001** Mayo 45% hazmat gap.  
3. Show EXC hazmat_doc_gap; Backorder BO-0709-01.  
4. Open 3D Load Check from pallet panel.  

### Script E — Edition contrast
Same card; classic = 11-gate % board; V7 = 4-light launch console; no shared IDs.

---

## 17. Analysis prompts for Gemini Notebook

1. Map classic 11 readiness gates to V7’s 4 lights — which collapse, which are missing (hazmat, picking, pallet config)?  
2. Assess whether shipping GO (MD) correctly refuses to override RED steril (ID upstream) — propose enforcement tests.  
3. Design idempotent PGI: double-click GO must not double-post (MD rigor).  
4. Evaluate widget **LAUNCH** without mutation — product risk of false affordance.  
5. Trace Mayo Clinic story across CT, Quality Release, classic OB-0709-001, BO-0709-01.  
6. Propose unifying shipment IDs between classic OB-* and V7 SHIP-* for one demo narrative.  
7. Specify customs re-verify SLA, failure modes, and when DA override is forbidden.  
8. Accessibility: classic row keyboard parity; announce gate changes on steril sync.  
9. Should readiness_pct be computed from gates instead of seeded? Provide formula.  
10. Define YELLOW gate semantics (typed but unused in seed).  
11. EOM / overtime / Saturday signals — connect to staffing decision support (DA).  
12. International hazmat + customs: single export-compliance model across editions.  
13. Relationship to Sterilization / Outbound CT unit cards that deep-link here.  
14. Audit trail UX: surface Gaby’s MD/DA events on-screen for demos.  
15. Compare SpaceX aesthetic vs plant FG ops language — when to use which metaphor.

---

## 18. Known gaps & demo limitations

1. **Two products, one card** — edition switch required.  
2. **No shared shipment IDs** across editions.  
3. **Classic cannot release / PGI** — visibility only.  
4. **`readiness_pct` not derived** from gate booleans.  
5. **Widget Launch is non-functional** (display only).  
6. **YELLOW lights unused** in seed data.  
7. **No manual steril override** (good) but also **no explain drawer** when RED beyond banner.  
8. **GO does not clear dock slot / carrier** fields — only status string.  
9. **Customs verify always succeeds** after 2s — no failure path.  
10. **Classic table** not keyboard-selectable.  
11. **Digital pallet panel** may show OB-002 while drawer selection is another ship.  
12. **Priority chip “Backorders”** filters `priority_tier === 'backorder'` (one row), not all linked BOs.  
13. **V7 need dates (Aug 2026)** vs classic as_of **Jul 2026** — timeline mismatch across packs.  
14. **No AI Home tile** specific to Shipment Readiness (entry via App Library / Happy Path).  
15. **Pepe optional** — Gaby does not require Guided Tasks completion.  
16. **Reset** reloads page — any in-flight GO spinner cancelled.  
17. **International QRO** has no hazmat light — only steril/customs story.  
18. **Audit UI** not embedded on page.

---

## 19. Relationship to other logistics prototypes

| Prototype | Relationship |
|---|---|
| **Quality Release (Alejandra)** | Upstream ID unlock of steril light / Mayo BO story (classic) |
| **Logistics Mobile Ops (Lupita)** | Starts Happy Path that ends here |
| **Guided Tasks (Pepe)** | Optional warehouse motion; FG picking tasks reference OB-0709-002 in classic mock |
| **Pallet Load Check** | Classic deep-link from Digital Pallet Configuration |
| **Logistics Control Tower / Outbound CT** | OB03 shipping not ready; unit cards navigate to shipment readiness |
| **Sterilization Tracker** | Upstream steril network; classic post-steril QA holds block pledges |
| **ASN Portal** | Far upstream partner ASN; not wired |
| **SpaceX widget** | Dashboard twin of V7 QRO gates |

Happy Path stack:

```text
Lupita (MD) → Pepe (DA, optional) → Alejandra (ID/N1) → Gaby (DA customs + MD PGI)
                                                      ▲
                                               THIS PROTOTYPE (V7)
```

---

## 20. One-page cheat sheet

```text
OPEN: App Library → Logistic → Shipment Readiness
  classic → Readiness Cockpit (pledge/48h/hazmat/BOs · ST86–ST108 · no PGI)
  inside_logistics → SpaceX Cockpit — Gaby (4 lights · GO)

V7 OBJECTS: SHIP-QRO-15 (Querétaro) · SHIP-RNO-08 (Reno customs)
V7 PREREQ: Alejandra RELEASE LOT-A-114 → steril GREEN on QRO
V7 ACTIONS: Re-Verify Customs (DA, 2s) · GO RELEASE (MD, 1.6s) → RELEASED
V7 CONTRACTS: DA gating + MD PGI · never override QA steril manually

CLASSIC DEMO: OB-0709-001 Mayo 45% hazmat gap · daily 42/18 · BO-0709-01
CLASSIC LINK: Open 3D Load Check → pallet_verification

WIDGET: spacex_shipping_gating mirrors QRO lights; Launch does not PGI
RESET: V7 toolbar Reset Demo Data
```

---

## 21. Cross-pack index

| # | Prototype pack | Screen key | Doc |
|---|---|---|---|
| 01 | Logistics Mobile Ops | `logistics_mobile_ops` | `docs/prototypes/01_LOGISTICS_MOBILE_OPS_GEMINI_NOTEBOOK.md` |
| 02 | Logistics Control Tower | `logistics_control_tower` | `docs/prototypes/02_LOGISTICS_CONTROL_TOWER_GEMINI_NOTEBOOK.md` |
| 03 | ASN Portal | `external_transfer_portal` | `docs/prototypes/03_ASN_PORTAL_GEMINI_NOTEBOOK.md` |
| 04 | Quality Release | `quality_release` | `docs/prototypes/04_QUALITY_RELEASE_GEMINI_NOTEBOOK.md` |
| 05 | **Shipment Readiness** | `shipment_readiness` | **this file** |
| 06 | Pallet Load Check | `pallet_verification` | `docs/prototypes/06_PALLET_LOAD_CHECK_GEMINI_NOTEBOOK.md` |
| 07 | Sterilization Tracker | `sterilization_tracker` | `docs/prototypes/07_STERILIZATION_TRACKER_GEMINI_NOTEBOOK.md` |
| 08 | Guided Tasks | `guided_tasks` | `docs/prototypes/08_GUIDED_TASKS_GEMINI_NOTEBOOK.md` |
| 09 | Job Readiness | `job_readiness` | `docs/prototypes/09_JOB_READINESS_GEMINI_NOTEBOOK.md` |
| 10 | Production Alerts | `production_alerts` | `docs/prototypes/10_PRODUCTION_ALERTS_GEMINI_NOTEBOOK.md` |
| 11 | Machine Material Status | `machine_status` | `docs/prototypes/11_MACHINE_MATERIAL_STATUS_GEMINI_NOTEBOOK.md` |
| 12 | WIP Control Tower | `wip_control_tower` | `docs/prototypes/12_WIP_CONTROL_TOWER_GEMINI_NOTEBOOK.md` |

Catalog overview: `LOGISTICS_PROTOTYPES_GEMINI_NOTEBOOK.md` (§7 deep dive index).
