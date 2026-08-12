# Prototype Deep Dive 13 — Inside Logistics V7 Workstation Widgets

**Product:** BD Smart Factory / Inside Logistics (`bd-ai-poc`)  
**Scope:** Four **Workstation dashboard widgets** (not App Library cards)  
**Category:** Logistic → Workstation personalization  
**Edition:** **Inside Logistics (V7)** — widgets are logistics-specific but render on any edition once added  
**Live demo:** https://guillermesmozzer.github.io/bd-ai-poc/  
**Audience:** Gemini Notebook analysis (multi-widget pack)

---

## 0. Document control

| Field | Value |
|---|---|
| Pack name | Inside Logistics V7 Workstation Widgets |
| Widget count | **4** |
| Primary journey role | **Supervisor / planner / export coordinator** dashboard lenses on the reactive Happy Path |
| Happy Path position | **Parallel observers** — widgets surface state from Lupita → Pepe → Alejandra → Gaby without replacing journey screens |
| Data bus | `src/logistics/data/reactiveLogisticsDemo.ts` (`localStorage` + custom event) |
| Static-only widget | `inbound_sla_chart` (hardcoded Recharts series — **no** demo bus) |
| Reactive widgets | `active_loads_timeline`, `line_shortage_risk`, `spacex_shipping_gating` |
| Spec source | `src/FilesMD/cursor-prompt-specification-v7.md` |
| Registry | `src/workstation/data/widgetRegistry.ts` + `src/logistics/widgets/index.ts` |
| Render switch | `StandardWorkstationDashboard.tsx` · `PersonalWorkstationDashboard.tsx` |

### Widget inventory

| # | Widget id | Component | Title (UI) | Contract lens |
|---|---|---|---|---|
| W1 | `inbound_sla_chart` | `InboundSlaWidget.tsx` | Dock-to-Stock Cycle Time (SLA Mapped) | KPI / inbound SLA (implicit MD timing) |
| W2 | `active_loads_timeline` | `ActiveLoadsTimelineWidget.tsx` | Custody Tracking: LOAD-ELP-61 | External sterilization custody (OB adjacency) |
| W3 | `line_shortage_risk` | `LineShortageRiskWidget.tsx` | Line Shortage Risk | **DA — Assisted Decision** |
| W4 | `spacex_shipping_gating` | `SpaceXShippingGatingWidget.tsx` | SpaceX Release Console: SHIP-QRO-15 | **DA gating** preview (MD release on full page only) |

---

## 1. Executive summary

The **Inside Logistics V7 widget pack** extends the reactive Happy Path from full-screen journey pages onto the **personalizable Workstation dashboard**. Operators and supervisors can pin logistics KPIs beside production widgets without leaving their home screen.

Unlike the **12 App Library cards** (packs 01–12), these four widgets:

1. **Do not appear** in App Library → Logistic category.
2. **Do appear** in Workstation widget picker under category **Logistics**.
3. Ship with **`defaultVisible: false`** — users must add them via dashboard personalization.
4. Share **`reactiveLogisticsDemo`** for three of four; **`inbound_sla_chart`** is a standalone Recharts mock.

### Reactive vs static split

| Widget | Reads demo bus | Writes demo bus | Updates on Alejandra e-sign |
|---|---|---|---|
| W1 Inbound SLA | No | No | No |
| W2 Active Loads | `getLoads()` | No | No (load ETA only; steps are static) |
| W3 Line Shortage | `getShortages()` | No | No (rows never auto-clear) |
| W4 SpaceX Gating | `getPallets()` + `getShipments()` | No | **Yes** — steril light turns green |

**Key product insight:** Widgets are **read-mostly mirrors**. Only full journey pages (`quality_release`, `shipment_readiness`, etc.) perform mutating actions. The SpaceX widget’s **LAUNCH SHIPMENT (GO)** button is a **false affordance** — it renders when gates pass but does not call PGI / `setShipments`.

### Naming map (common confusion)

| User-facing label | Registry id | App Library equivalent |
|---|---|---|
| KPI: Inbound Dock-to-Stock SLA | `inbound_sla_chart` | Related to pack **01** Lupita inbound timing |
| Sterilization Load Tracking | `active_loads_timeline` | **Not** pack **07** Sterilization Tracker board |
| Line Shortage Risk | `line_shortage_risk` | Aligns with pack **08** Pepe picks + pack **11** machine status |
| SpaceX Shipping Gating Console | `spacex_shipping_gating` | Twin of pack **05** Gaby 4-light cockpit |

---

## 2. How to open / add these widgets

### Path A — Personal Workstation (recommended)

1. Sign in → choose edition **Inside Logistics** (optional but aligns demo data).
2. Navigate to **My Workstation** / **Personal Workstation Dashboard**.
3. Enter **edit / personalize** mode (widget picker).
4. Filter or browse category **Logistics**.
5. Drag onto grid:
   - **KPI: Inbound Dock-to-Stock SLA**
   - **Sterilization Load Tracking**
   - **Line Shortage Risk**
   - **SpaceX Shipping Gating Console**
6. Save layout.

### Path B — Standard Workstation Dashboard

Same widget ids render via identical `if (widgetId === …)` branches in `StandardWorkstationDashboard.tsx` (line ~703).

### Path C — Demo layout shortcut (developer)

Widget ids are listed in `workstationConstants.ts`:

```text
personalWidgetDomainMap.Logistics = [
  'inbound_sla_chart',
  'active_loads_timeline',
  'line_shortage_risk',
  'spacex_shipping_gating',
]
```

Default visible widgets (`defaultPersonalVisibleWidgetIds`) **exclude** all four — they are opt-in.

### Path D — Edition / seed prerequisites

1. For reactive widgets, **`ensureLogisticsDemoSeeded()`** runs on first read (via `getPallets`, `getLoads`, etc.).
2. Happy Path demo: complete **Lupita → Alejandra** before expecting SpaceX steril green.
3. **Reset Demo Data** button (V7 journey pages) calls `resetLogisticsDemoData()` → reload → widgets refresh via `subscribeLogisticsDemo`.

### What these widgets are NOT

- Not routable via `setCurrentScreen('inbound_sla_chart')` — no screen key.
- Not in side nav under Logistic children.
- Not in AI Home Smart Hub tiles.

---

## 3. Architecture & render pipeline

```text
User adds widget id to personal layout JSON
        │
        ▼
PersonalWorkstationDashboard / StandardWorkstationDashboard
        │
        ├── widgetId === 'inbound_sla_chart'      → <InboundSlaWidget />
        ├── widgetId === 'active_loads_timeline'  → <ActiveLoadsTimelineWidget />
        ├── widgetId === 'line_shortage_risk'     → <LineShortageRiskWidget />
        └── widgetId === 'spacex_shipping_gating' → <SpaceXShippingGatingWidget />
        │
        ▼
src/logistics/widgets/*.tsx
        │
        ├── Static: slaData[] inline in InboundSlaWidget
        └── Reactive: subscribeLogisticsDemo(refresh) + get*() readers
```

### Registration layers (three files)

| File | Role |
|---|---|
| `src/workstation/data/widgetRegistry.ts` | Canonical registry: label, type, `defaultLayout`, `defaultVisible: false` |
| `src/workstation/workstationConstants.ts` | Personal picker: category **Logistics**, tags, layout schema v37 |
| `src/logistics/widgets/index.ts` | `LOGISTICS_WIDGETS` metadata map (title, description, grid size hint) |

### Default grid layouts (personal picker)

| Widget id | defaultLayout (w × h) | minW × minH |
|---|---|---|
| `inbound_sla_chart` | 6 × 10 | 4 × 8 |
| `active_loads_timeline` | 4 × 10 | 3 × 8 |
| `line_shortage_risk` | 6 × 10 | 4 × 8 |
| `spacex_shipping_gating` | 4 × 10 | 3 × 8 |

Registry `type` hints: `chart`, `activity`, `table`, `kpi`.

---

## 4. Shared data bus — `reactiveLogisticsDemo.ts`

### Purpose

Synchronous **cross-screen state** in one browser session using `localStorage` keys and a bubbling custom event `bd-logistics-demo-updated`.

### localStorage keys (`LOGISTICS_DEMO_KEYS`)

| Key constant | Storage key | Used by widgets |
|---|---|---|
| `pallets` | `inbound_pallets` | W4 (ELP2026.101 status) |
| `loads` | `sterilization_loads` | W2 (LOAD-ELP-61) |
| `shipments` | `outbound_shipments` | W4 (SHIP-QRO-15 checks) |
| `shortages` | `line_shortage_risk` | W3 |
| `pickTasks` | `guided_pick_tasks` | (Pepe page — not widgets) |
| `audit` | `logistics_audit_trail` | (journey pages) |
| `sapSyncFixed` | `inbound_sap_sync_fixed` | (Lupita SAP sync) |

### Subscription pattern (all reactive widgets)

```typescript
useEffect(() => {
  const refresh = () => { /* read get*() */ };
  refresh();
  return subscribeLogisticsDemo(refresh);
}, []);
```

`subscribeLogisticsDemo` listens to:

- `window` event `bd-logistics-demo-updated` (same-tab writes)
- `storage` event (cross-tab)

### Sterilization sync cascade (critical for W4)

When Alejandra calls `updatePallet(id, { status: 'RELEASED' })`:

1. `setPallets` persists pallets.
2. `syncShipmentsFromPallets` sets `sterilizationPass: GREEN` on shipments whose `linkedPalletId` is released.
3. `emitDemoUpdate()` fires.
4. **SpaceX widget** re-reads → `isReleased === true` → steril light green → **LAUNCH** button appears.

Widget logic:

```typescript
const isReleased = palletStatus === 'RELEASED' || shipment?.checks.sterilizationPass === 'GREEN';
```

### Seed highlights tied to widgets

**Pallet ELP2026.101** (Lupita / Alejandra / Gaby thread):

| Field | Initial value |
|---|---|
| sku | BD-8805-SYR |
| batch | LOT-A-114 |
| status | EXPECTED → IN_INSPECTION (Lupita) → RELEASED (Alejandra) |
| lineStopRisk | critical |

**Shipment SHIP-QRO-15**:

| Check | Initial |
|---|---|
| batchRecord | GREEN |
| sterilizationPass | RED |
| customsClearance | GREEN |
| lineClearance | GREEN |
| linkedPalletId | ELP2026.101 |
| linkedBatch | LOT-A-114 |

**Load LOAD-ELP-61** (W2):

| Field | Value |
|---|---|
| providerName | Sterigenics External |
| status | IN_TRANSIT_BACK |
| carrierPlate | TX-R-4402 |
| eta | 10:45 AM |

**Shortages** (W3) — three rows SHORT-01..03; see §8.

---

## 5. Widget W1 — Inbound Dock-to-Stock SLA (`inbound_sla_chart`)

### Role

Hourly **dock-to-stock cycle time** area chart with 60-minute SLA target line. Gives inbound supervisors a trend view complementary to Lupita’s dock tablet (pack **01**).

### Implementation summary

| Aspect | Detail |
|---|---|
| File | `src/logistics/widgets/InboundSlaWidget.tsx` (~90 lines) |
| Chart library | Recharts `AreaChart` |
| Data | **Inline** `slaData` array (7 hourly points 08:00–14:00) |
| Target | 60 minutes (dashed orange `target` series) |
| Breaches | 13:00 @ 65 min (only hour above SLA) |
| Demo bus | **None** — chart never changes during Happy Path |

### Seed data (exact)

| time | cycleTime | target |
|---|---|---|
| 08:00 | 45 | 60 |
| 09:00 | 52 | 60 |
| 10:00 | 58 | 60 |
| 11:00 | 42 | 60 |
| 12:00 | 38 | 60 |
| 13:00 | **65** | 60 |
| 14:00 | 48 | 60 |

### UX / visual

- Light MUI `Card`, `logisticsType.sectionTitle`.
- Blue gradient fill `#044ED7` on cycle time area.
- Orange dashed `#C2410C` SLA limit line.
- Caption: *Target: 60 min. Dashed orange line marks the regulatory tolerance limit.*

### Accessibility

- `aria-labelledby="inbound-sla-heading"`.
- Visually hidden `<p>` with computed summary (breach list).
- Chart wrapper `role="img"` + `aria-label={summary}`.

### Product gaps

1. No link to Lupita appointments or CT inbound macroflow IN01.
2. No live update when dock checklist completes.
3. Description says *Real-time monitoring* but data is static mock.
4. Should eventually read from same telemetry as CT **Receiving Control Tower** KPIs.

---

## 6. Widget W2 — Sterilization Load Tracking (`active_loads_timeline`)

### Role

Five-step **custody timeline** for external sterilization return transit — narrative companion to Sterigenics network story. **Not** the full Sterilization Tracker table (pack **07**).

### Implementation summary

| Aspect | Detail |
|---|---|
| File | `src/logistics/widgets/ActiveLoadsTimelineWidget.tsx` (~102 lines) |
| Data | `getLoads()[0]` — first load only |
| Dynamic fields | `load.id`, `load.eta`, `load.carrierPlate`, `load.providerName` |
| Static fields | Step labels, COMPLETE/ACTIVE/PENDING statuses, most timestamps |

### Timeline steps (hardcoded progression)

| # | Label | Status | Time display |
|---|---|---|---|
| 1 | Load Dispatched | COMPLETE | 08:15 AM |
| 2 | Provider Arrival | COMPLETE | 09:30 AM |
| 3 | In Sterilization | COMPLETE | 11:00 AM |
| 4 | Return Transit | **ACTIVE** | `ETA ${load?.eta ?? '10:45 AM'}` |
| 5 | Quarantine Release | PENDING | --:-- |

Active step shows animated **Truck** icon (`animate-bounce`, respects `reducedMotionSx`).

### Default fallbacks (no load in storage)

| Field | Fallback |
|---|---|
| id | LOAD-ELP-61 |
| carrierPlate | TX-R-4402 |
| providerName | Sterigenics |

### Relationship to pack 07

| Dimension | Widget W2 | App Library Sterilization Tracker |
|---|---|---|
| Data source | `reactiveLogisticsDemo.initialLoads` | `logisticsMockData.sterilization_loads` (SL-2026-*) |
| Load ids | LOAD-ELP-61 | SL-2026-0712, etc. |
| Interactivity | Read-only timeline | Full table + drawer + 15-state lifecycle |
| QA 7-day TAT | Not shown | KPI strip + drawer narrative |

**Do not demo both as the same system** without explaining dual mock universes.

### Product gaps

1. Step statuses do not advance when load `status` changes in storage.
2. No click-through to `sterilization_tracker` or `quality_release`.
3. Only first load rendered — multi-load network invisible.
4. Quarantine Release step never auto-completes when Alejandra releases lot.

---

## 7. Widget W4 — SpaceX Shipping Gating Console (`spacex_shipping_gating`)

### Role

Dark **mission-control** card mirroring Gaby’s four release gates for **SHIP-QRO-15** (Querétaro export). Primary reactive widget for Happy Path step 4 visibility on dashboard.

### Implementation summary

| Aspect | Detail |
|---|---|
| File | `src/logistics/widgets/SpaceXShippingGatingWidget.tsx` (~154 lines) |
| Background | `#0B132B` (navy) |
| Shipment focus | `SHIP-QRO-15` (fallback first shipment) |
| Pallet watch | `ELP2026.101` status |

### Four gates

| Gate | Green when |
|---|---|
| Batch Record | Always `true` (hardcoded) |
| Sterilization | `palletStatus === 'RELEASED'` OR `sterilizationPass === 'GREEN'` |
| Customs XML | `shipment.checks.customsClearance !== 'RED'` |
| Line Clearance | Always `true` (hardcoded) |

Red gates pulse (CSS `@keyframes pulse`, disabled via `reducedMotionSx`).

### CTA states

**Locked** (`!isReleased`):

- Red panel **CUSTODY LOCKED**
- Copy: *Lot LOT-A-114 pending digital signature for quarantine release.*
- `ShieldAlert` icon

**Unlocked** (`isReleased`):

- Green full-width button **LAUNCH SHIPMENT (GO)**
- `aria-label="Launch shipment, all gates passed"`
- **No onClick handler** — display only

### Comparison to Shipment Readiness page (pack 05)

| Capability | Widget W4 | Gaby full page |
|---|---|---|
| Gate display | 4 lights | 4 lights + banners |
| Customs re-verify | Read-only | **Re-Verify Customs XML** mutates |
| GO / PGI | Button visible, no action | **GO — RELEASE SHIPMENT** writes audit + status |
| Truck selection | No | listbox |
| Reset Demo | No | Yes (header) |

### aria-live

Root card `aria-live="polite"` — gate changes announce on Alejandra release without full page navigation.

### SHIP-RNO-08 note

Second seed shipment has customs RED — widget always picks QRO-15 by id search; Reno blocked story not shown on widget.

---

## 8. Widget W3 — Line Shortage Risk (`line_shortage_risk`)

### Role

Sortable table of **imminent line-stop risks** with DA prioritization — supervisor view while Pepe executes picks (pack **08**).

### Implementation summary

| Aspect | Detail |
|---|---|
| File | `src/logistics/widgets/LineShortageRiskWidget.tsx` (~118 lines) |
| Data | `getShortages()` — all rows, no client-side sort |
| Columns | Line · SKU · Risk · ETA stop · Bin |

### Seed rows (exact)

| id | line | sku | risk | min | bin | qty |
|---|---|---|---|---|---|---|
| SHORT-01 | LINE-03 Filling | BD-8805-SYR | critical | 18 | BIN-RMW-B-14-02 | 3 |
| SHORT-02 | LINE-05 Assembly | BD-3304-NDL | high | 42 | BIN-RMW-C-08-01 | 2 |
| SHORT-03 | LINE-01 Molding | BD-4410-RES | medium | 95 | BIN-RMW-A-02-11 | 8 |

### Risk chip styling

Uses `riskChipSx` from `src/logistics/a11y.ts` for critical / high / medium / low colors.

### Urgency rule

`minutesToStop < 30` → red **error.dark** text + ` · Urgent` suffix + `aria-label` mentions urgent.

SHORT-01 (18 min) qualifies; SHORT-02 (42 min) does not.

### Alignment with Pepe picks (pack 08)

| Shortage | Matching pick task | Match |
|---|---|---|
| SHORT-01 | PW-9021 @ BIN-RMW-B-14-02, qty 3 | **Exact** |
| SHORT-02 | PW-9022 @ BIN-RMW-C-08-01, qty 2 | **Exact** |
| SHORT-03 | *(no PW-* task in V7 seed)* | **Gap** |

Completing Pepe tasks **does not** remove or decrement shortage rows — known demo limitation.

### Caption

*Picking queues prioritized by imminent line-stop risk (DA — Assisted Decision).*

---

## 9. Happy Path — cross-widget demo script

**Goal:** Show dashboard widgets updating during the 4-step V7 journey.

**Setup:**

1. Edition **Inside Logistics**.
2. Reset Demo Data (any V7 journey page).
3. Add all four Logistics widgets to Personal Workstation; save.
4. Open workstation in split view or second monitor.

**Steps:**

| Step | Journey screen | Widget observation |
|---|---|---|
| 0 | Workstation only | W4 steril RED · W3 three rows · W2 Return Transit ACTIVE · W1 static chart |
| 1 | Lupita — complete dock checklist + custody | W1 unchanged · W3 unchanged · pallet → IN_INSPECTION (W4 still RED) |
| 2 | Pepe — complete PW-9021 (optional) | W3 **unchanged** (no auto-clear) |
| 3 | Alejandra — e-sign LOT-A-114 | **W4 steril → green** · LAUNCH button appears · `aria-live` update |
| 4 | Gaby — GO on full page | W4 still shows LAUNCH (non-functional) · shipment status on page mutates |

**Teaching moment:** Widget proves **cross-screen reactivity** for steril gate; shortage widget proves **intentional decoupling** from pick completion.

---

## 10. Persona → recommended widget set

| Persona | Widgets | Rationale |
|---|---|---|
| Dock / inbound lead | W1 Inbound SLA | Cycle time trend (future: tie to Lupita) |
| Sterilization coordinator | W2 Active Loads + pack 07 app | Custody + full load board |
| Warehouse supervisor / DA | W3 Line Shortage | Prioritize Pepe assignments |
| Export / shipping coordinator | W4 SpaceX Gating + pack 05 app | Dashboard gate + GO action |
| Plant logistics manager | All four | Single-pane Happy Path health |

---

## 11. Accessibility & localization

| Widget | Patterns |
|---|---|
| W1 | `section` + sr-only summary + `role="img"` on chart |
| W2 | Ordered list `ol` · `aria-current="step"` on active · icon `aria-hidden` |
| W3 | Table `caption` (visually hidden) · scope on headers · urgent `aria-label` |
| W4 | `aria-live="polite"` · gate list `role="list"` · Pass/Blocked in `aria-label` · dark focus styles |

All widgets: English-only · MUI typography tokens from `logisticsType` · light cards except W4 dark theme.

---

## 12. Exact copy catalog

### Registry labels (picker)

- KPI: Inbound Dock-to-Stock SLA
- Sterilization Load Tracking
- Line Shortage Risk
- SpaceX Shipping Gating Console

### W1 headings

- Dock-to-Stock Cycle Time (SLA Mapped)
- Target: 60 min. Dashed orange line marks the regulatory tolerance limit.

### W2 headings

- Custody Tracking: {loadId}
- Truck {plate} returning from external sterilizer ({provider}).

### W2 step labels

- Load Dispatched · Provider Arrival · In Sterilization · Return Transit · Quarantine Release
- Status subtext: Complete · In progress · Pending

### W3 headings

- Line Shortage Risk
- Picking queues prioritized by imminent line-stop risk (DA — Assisted Decision).
- Column headers: Line · SKU · Risk · ETA stop · Bin
- Urgent suffix: ` · Urgent`

### W4 headings

- SpaceX Release Console: {shipmentId}
- Destination: Querétaro, MX (Export) — Critical plungers load.
- Gate labels: Batch Record · Sterilization · Customs XML · Line Clearance
- Pass / Blocked
- CUSTODY LOCKED
- Lot LOT-A-114 pending digital signature for quarantine release.
- LAUNCH SHIPMENT (GO)

---

## 13. File map

| File | Responsibility |
|---|---|
| `src/logistics/widgets/InboundSlaWidget.tsx` | W1 static SLA chart |
| `src/logistics/widgets/ActiveLoadsTimelineWidget.tsx` | W2 custody timeline |
| `src/logistics/widgets/LineShortageRiskWidget.tsx` | W3 shortage table |
| `src/logistics/widgets/SpaceXShippingGatingWidget.tsx` | W4 gate console |
| `src/logistics/widgets/index.ts` | `LOGISTICS_WIDGETS` export map |
| `src/logistics/data/reactiveLogisticsDemo.ts` | Shared bus + seeds |
| `src/logistics/a11y.ts` | `riskChipSx`, `reducedMotionSx`, dark focus |
| `src/logistics/typography.ts` | `logisticsType` tokens |
| `src/workstation/data/widgetRegistry.ts` | Widget definitions |
| `src/workstation/workstationConstants.ts` | Personal picker category Logistics |
| `src/workstation/components/PersonalWorkstationDashboard.tsx` | Render switch ~2427 |
| `src/workstation/components/StandardWorkstationDashboard.tsx` | Render switch ~703 |
| `src/FilesMD/cursor-prompt-specification-v7.md` | Original V7 widget spec |
| `src/logistics/pages/QualityReleasePage.tsx` | Upstream RELEASED → W4 unlock |
| `src/logistics/pages/ShipmentReadinessPage.tsx` | Full GO / customs (W4 twin) |
| `src/logistics/guided_tasks/ZebraPickingPage.tsx` | Pepe picks aligned with W3 |
| `src/logistics/components/ResetDemoDataButton.tsx` | Reset all bus keys |

---

## 14. Visual & interaction notes

### W1 Inbound SLA

- Recharts tooltip on hover (time + minutes).
- Y-axis may clip negative margin `left: -20` for compact fit.
- Card stretches `height: 100%` in grid cell.

### W2 Active Loads

- Vertical connector line blue when preceding step COMPLETE.
- Scrollable `CardContent` if grid height small.

### W3 Line Shortage

- Row hover highlight · no row click / drill-down.
- Monospace bin column.

### W4 SpaceX

- 2×2 grid of gate tiles on `xs: 6` (two per row).
- Success button uses MUI `color="success"` — still no handler.
- Locked state uses translucent red panel, not a button.

---

## 15. Additional demo scripts

### Script A — Widget-only supervisor briefing (5 min)

1. Add W3 + W4 only.
2. Narrate SHORT-01 critical 18 min + SHIP-QRO-15 steril blocked.
3. Jump to Alejandra → release → return to workstation → W4 green.

### Script B — Contrast static vs reactive

1. Add W1 + W4 side by side.
2. Complete Happy Path — W4 changes, W1 identical.
3. Discuss production need to wire W1 to real dock events.

### Script C — Dual sterilization story

1. W2 LOAD-ELP-61 timeline on workstation.
2. Open App Library **Sterilization Tracker** SL-2026-* board.
3. Explain **two mock datasets** for different demo audiences.

### Script D — False affordance test

1. Unlock W4 → click **LAUNCH SHIPMENT (GO)**.
2. Observe no navigation, no audit, no toast.
3. Open Gaby page → real **GO — RELEASE SHIPMENT**.

### Script E — Cross-tab reactivity

1. Open workstation in tab A, Alejandra in tab B.
2. Release in tab B → tab A W4 updates via `storage` event.

### Script F — Reset propagation

1. Reset Demo Data on Lupita page.
2. All reactive widgets revert to seed on reload.

---

## 16. Analysis prompts for Gemini Notebook

1. Should **`inbound_sla_chart`** subscribe to `reactiveLogisticsDemo` dock events or CT IN01 KPI feed?
2. Design **deep-link** from W3 bin cell → `guided_tasks` with `?bin=BIN-RMW-B-14-02`.
3. When Pepe completes PW-9021, should W3 auto-remove SHORT-01 or decrement qty?
4. Wire W2 step 5 **Quarantine Release** to pallet RELEASED status.
5. Add onClick to W4 LAUNCH → navigate to `shipment_readiness` with focus on GO (not fake button).
6. Unify LOAD-ELP-61 (reactive) with SL-2026-* (CDF) — single sterilization model?
7. Persona-based **default layouts** — auto-pin W3+W4 for Inside Logistics edition?
8. Should W4 show **SHIP-RNO-08** customs RED as second card or carousel?
9. Export **DA audit** when supervisor reorders picks based on W3 (not implemented).
10. WCAG review: W4 red pulse on blocked gates — sufficient non-color text? (Yes: Pass/Blocked.)
11. Mobile / tablet: minimum grid heights for Recharts readability.
12. Widget-level **Reset** vs global Reset Demo Data scope.
13. i18n: Spanish plant rollout — translate gate labels?
14. Embed W3 row click → **Machine Material Status** line filter.
15. Contract tagging: expose MD/DA/ID chips in widget headers for training mode?

---

## 17. Known gaps & demo limitations

1. **W1 entirely static** — misaligned with “real-time” registry description.
2. **W2 timeline steps static** — only ETA/id/plate/provider from bus.
3. **W3 never updates** on pick completion or production consumption.
4. **W4 LAUNCH button non-functional** — UX risk of false affordance.
5. **W4 batch + line clearance hardcoded green** — hides real failure modes.
6. **No widget → App Library navigation** from any card.
7. **No deep links** (`?widget=spacex_shipping_gating` meaningless).
8. **Dual sterilization data models** (W2 vs pack 07) confuse executives.
9. **SHORT-03** has no Pepe task — orphan row in integrated demo.
10. **defaultVisible: false** — widgets easy to miss in first Inside Logistics walkthrough.
11. **Classic edition** can add widgets but Happy Path pages differ — W4 steril story still V7-centric.
12. **No write API** on `setShortages` exposed from Pepe page.
13. **Grid schema v37** — layout migration if widget min heights change.
14. **Inbound SLA breach at 13:00** never ties to exception EXC-* in CT.
15. **Active load** only shows first array element — no load selector.

---

## 18. Relationship to App Library prototypes

| Pack | Prototype | Widget relationship |
|---|---|---|
| 01 | Logistics Mobile Ops (Lupita) | W1 thematic inbound SLA; ELP2026.101 seeds W4 |
| 02 | Logistics Control Tower | CT KPIs not wired to W1; macroflow context |
| 04 | Quality Release (Alejandra) | **Unlocks W4** via RELEASED pallet |
| 05 | Shipment Readiness (Gaby) | W4 is dashboard twin; full GO here |
| 07 | Sterilization Tracker | **Different data** from W2 — see §6 |
| 08 | Guided Tasks (Pepe) | W3 bins align with PW-9021/9022 |
| 09 | Job Readiness | LINE-03 stress shared narrative with SHORT-01 |
| 10 | Production Alerts | Escalation stories parallel DA theme |
| 11 | Machine Material Status | Line material pause vs W3 pick urgency |
| 12 | WIP Control Tower | Separate WIP object model — no widget |

```text
Workstation widgets (THIS PACK) — observe
        ↑ read
reactiveLogisticsDemo ← write — Journey pages (01, 04, 05, 08…)
        ↕ unrelated
logisticsMockData — Classic + CT + Sterilization Tracker (07)
```

---

## 19. Cheat sheet (one screen)

```text
PACK 13 — V7 LOGISTICS WORKSTATION WIDGETS (4)

IDS: inbound_sla_chart | active_loads_timeline | line_shortage_risk | spacex_shipping_gating
WHERE: Workstation personalize → category Logistics (NOT App Library)
BUS: reactiveLogisticsDemo (3/4) · W1 static Recharts

W1 INBOUND SLA: 7 hourly points · 60 min target · breach 13:00@65 · no live updates
W2 ACTIVE LOADS: LOAD-ELP-61 · Sterigenics · TX-R-4402 · step 4 ACTIVE · static steps
W3 SHORTAGE: SHORT-01..03 · DA table · Pepe bins match · no auto-clear on pick
W4 SPACEX: SHIP-QRO-15 · 4 gates · steril from ELP2026.101 RELEASED · LAUNCH=fake

HAPPY PATH: Alejandra release → W4 green · Pepe pick → W3 unchanged
RESET: Reset Demo Data on V7 pages → reload → widgets re-seed

NOT: sterilization_tracker board · CT screen keys · App Library cards
FILES: src/logistics/widgets/*.tsx · reactiveLogisticsDemo.ts · widgetRegistry.ts
```

---

## 20. Cross-pack index (Logistics documentation series)

| # | Pack | Scope | Doc |
|---|---|---|---|
| 01 | Logistics Mobile Ops | App Library | `01_LOGISTICS_MOBILE_OPS_GEMINI_NOTEBOOK.md` |
| 02 | Logistics Control Tower | App Library | `02_LOGISTICS_CONTROL_TOWER_GEMINI_NOTEBOOK.md` |
| 03 | ASN Portal | App Library | `03_ASN_PORTAL_GEMINI_NOTEBOOK.md` |
| 04 | Quality Release | App Library | `04_QUALITY_RELEASE_GEMINI_NOTEBOOK.md` |
| 05 | Shipment Readiness | App Library | `05_SHIPMENT_READINESS_GEMINI_NOTEBOOK.md` |
| 06 | Pallet Load Check | App Library | `06_PALLET_LOAD_CHECK_GEMINI_NOTEBOOK.md` |
| 07 | Sterilization Tracker | App Library | `07_STERILIZATION_TRACKER_GEMINI_NOTEBOOK.md` |
| 08 | Guided Tasks | App Library | `08_GUIDED_TASKS_GEMINI_NOTEBOOK.md` |
| 09 | Job Readiness | App Library | `09_JOB_READINESS_GEMINI_NOTEBOOK.md` |
| 10 | Production Alerts | App Library | `10_PRODUCTION_ALERTS_GEMINI_NOTEBOOK.md` |
| 11 | Machine Material Status | App Library | `11_MACHINE_MATERIAL_STATUS_GEMINI_NOTEBOOK.md` |
| 12 | WIP Control Tower | App Library | `12_WIP_CONTROL_TOWER_GEMINI_NOTEBOOK.md` |
| 13 | **V7 Workstation Widgets** | **Workstation (4 widgets)** | **this file** |

Catalog overview: `LOGISTICS_PROTOTYPES_GEMINI_NOTEBOOK.md`.

---

*Pack 13 documents the Inside Logistics V7 workstation widget layer — dashboard companions to the 12 App Library logistics prototypes.*
