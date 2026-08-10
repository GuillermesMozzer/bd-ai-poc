/**
 * Reactive Inside Logistics demo bus (V7).
 * Uses localStorage as a synchronous cross-screen state channel so QA release
 * can unlock SpaceX shipping gating in the same browser session.
 */

export type PalletStatus =
  | 'EXPECTED'
  | 'RECEIVED'
  | 'IN_INSPECTION'
  | 'HOLD'
  | 'RELEASED'
  | 'REJECTED';

export interface PalletUnit {
  id: string;
  poNumber: string;
  sku: string;
  materialName: string;
  batch: string;
  expectedQty: number;
  receivedQty: number;
  status: PalletStatus;
  location: string;
  coaAttached: boolean;
  divergences?: string[];
  carrierName?: string;
  dock?: string;
  scheduledTime?: string;
  lineStopRisk?: 'critical' | 'high' | 'medium' | 'low';
}

export type SterilizationRoute =
  | 'A_NO_STERILIZATION'
  | 'B_INTERNAL'
  | 'C_INTERCOMPANY'
  | 'D_EXTERNAL';

export type SterilizationLoadStatus =
  | 'PENDING_DISPATCH'
  | 'IN_TRANSIT_TO'
  | 'AT_PROVIDER'
  | 'IN_TRANSIT_BACK'
  | 'RETURNED_QUARANTINE'
  | 'RELEASED';

export interface SterilizationLoad {
  id: string;
  route: SterilizationRoute;
  providerName: string;
  status: SterilizationLoadStatus;
  pallets: string[];
  biIndicatorChecked: boolean;
  bioburdenTestPassed: boolean;
  carrierPlate: string;
  eta: string;
}

export type GateLight = 'GREEN' | 'YELLOW' | 'RED';

export interface OutboundShipment {
  id: string;
  destination: string;
  needDate: string;
  status: 'READINESS_CHECK' | 'PICKING' | 'LOADING' | 'RELEASED' | 'BLOCKED';
  checks: {
    batchRecord: GateLight;
    sterilizationPass: GateLight;
    customsClearance: GateLight;
    lineClearance: GateLight;
  };
  carrierName: string;
  dockSlot: string;
  linkedBatch?: string;
  linkedPalletId?: string;
}

export interface AuditTrailEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  entityId: string;
  reason?: string;
  contract: 'MD' | 'DA' | 'ID';
  detail?: string;
}

export interface GuidedPickTask {
  id: string;
  location: string;
  sku: string;
  materialName: string;
  qty: number;
  progressIndex: number;
  progressTotal: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'EXCEPTION';
  exceptionReason?: string;
}

export interface LineShortageRiskItem {
  id: string;
  line: string;
  sku: string;
  materialName: string;
  risk: 'critical' | 'high' | 'medium' | 'low';
  minutesToStop: number;
  suggestedBin: string;
  qtyNeeded: number;
}

export const LOGISTICS_DEMO_KEYS = {
  pallets: 'inbound_pallets',
  loads: 'sterilization_loads',
  shipments: 'outbound_shipments',
  audit: 'logistics_audit_trail',
  pickTasks: 'guided_pick_tasks',
  shortages: 'line_shortage_risk',
  sapSyncFixed: 'inbound_sap_sync_fixed',
} as const;

export const LOGISTICS_DEMO_EVENT = 'bd-logistics-demo-updated';

export const initialPallets: PalletUnit[] = [
  {
    id: 'ELP2026.101',
    poNumber: 'PO-98440',
    sku: 'BD-8805-SYR',
    materialName: 'Syringe Plunger 5ml',
    batch: 'LOT-A-114',
    expectedQty: 500,
    receivedQty: 500,
    status: 'EXPECTED',
    location: 'STAGING-DOCK-3',
    coaAttached: false,
    carrierName: 'Swift Transport',
    dock: 'Dock 3',
    scheduledTime: '10:40 AM',
    lineStopRisk: 'critical',
  },
  {
    id: 'ELP2026.102',
    poNumber: 'PO-98445',
    sku: 'BD-3304-NDL',
    materialName: 'Precision Needle 22G',
    batch: 'LOT-E-509',
    expectedQty: 1200,
    receivedQty: 0,
    status: 'EXPECTED',
    location: 'STAGING-DOCK-3',
    coaAttached: false,
    divergences: ['SAP_SYNC_FAILED'],
    carrierName: 'DHL Freight',
    dock: 'Dock 1',
    scheduledTime: '11:15 AM',
    lineStopRisk: 'medium',
  },
];

export const initialLoads: SterilizationLoad[] = [
  {
    id: 'LOAD-ELP-61',
    route: 'D_EXTERNAL',
    providerName: 'Sterigenics External',
    status: 'IN_TRANSIT_BACK',
    pallets: ['ELP2026.204', 'ELP2026.205'],
    biIndicatorChecked: false,
    bioburdenTestPassed: false,
    carrierPlate: 'TX-R-4402',
    eta: '10:45 AM',
  },
];

export const initialShipments: OutboundShipment[] = [
  {
    id: 'SHIP-QRO-15',
    destination: 'Querétaro, MX (Export)',
    needDate: '2026-08-12',
    status: 'READINESS_CHECK',
    checks: {
      batchRecord: 'GREEN',
      sterilizationPass: 'RED',
      customsClearance: 'GREEN',
      lineClearance: 'GREEN',
    },
    carrierName: 'Swift Transport',
    dockSlot: 'DOCK-14',
    linkedBatch: 'LOT-A-114',
    linkedPalletId: 'ELP2026.101',
  },
  {
    id: 'SHIP-RNO-08',
    destination: 'Reno, NV (Domestic)',
    needDate: '2026-08-11',
    status: 'BLOCKED',
    checks: {
      batchRecord: 'GREEN',
      sterilizationPass: 'GREEN',
      customsClearance: 'RED',
      lineClearance: 'GREEN',
    },
    carrierName: 'FedEx Freight',
    dockSlot: 'DOCK-15',
  },
];

export const initialPickTasks: GuidedPickTask[] = [
  {
    id: 'PW-9021',
    location: 'BIN-RMW-B-14-02',
    sku: 'BD-8805-SYR',
    materialName: 'Syringe Plunger',
    qty: 3,
    progressIndex: 1,
    progressTotal: 3,
    status: 'OPEN',
  },
  {
    id: 'PW-9022',
    location: 'BIN-RMW-C-08-01',
    sku: 'BD-3304-NDL',
    materialName: 'Precision Needle 22G',
    qty: 2,
    progressIndex: 1,
    progressTotal: 2,
    status: 'OPEN',
  },
];

export const initialShortages: LineShortageRiskItem[] = [
  {
    id: 'SHORT-01',
    line: 'LINE-03 Filling',
    sku: 'BD-8805-SYR',
    materialName: 'Syringe Plunger 5ml',
    risk: 'critical',
    minutesToStop: 18,
    suggestedBin: 'BIN-RMW-B-14-02',
    qtyNeeded: 3,
  },
  {
    id: 'SHORT-02',
    line: 'LINE-05 Assembly',
    sku: 'BD-3304-NDL',
    materialName: 'Precision Needle 22G',
    risk: 'high',
    minutesToStop: 42,
    suggestedBin: 'BIN-RMW-C-08-01',
    qtyNeeded: 2,
  },
  {
    id: 'SHORT-03',
    line: 'LINE-01 Molding',
    sku: 'BD-4410-RES',
    materialName: 'Medical-grade PP resin',
    risk: 'medium',
    minutesToStop: 95,
    suggestedBin: 'BIN-RMW-A-02-11',
    qtyNeeded: 8,
  },
];

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function emitDemoUpdate() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(LOGISTICS_DEMO_EVENT));
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return structuredClone(fallback);
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return structuredClone(fallback);
    return JSON.parse(raw) as T;
  } catch {
    return structuredClone(fallback);
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
  emitDemoUpdate();
}

export function ensureLogisticsDemoSeeded() {
  if (!canUseStorage()) return;
  if (!window.localStorage.getItem(LOGISTICS_DEMO_KEYS.pallets)) {
    writeJson(LOGISTICS_DEMO_KEYS.pallets, initialPallets);
  }
  if (!window.localStorage.getItem(LOGISTICS_DEMO_KEYS.loads)) {
    writeJson(LOGISTICS_DEMO_KEYS.loads, initialLoads);
  }
  if (!window.localStorage.getItem(LOGISTICS_DEMO_KEYS.shipments)) {
    writeJson(LOGISTICS_DEMO_KEYS.shipments, initialShipments);
  }
  if (!window.localStorage.getItem(LOGISTICS_DEMO_KEYS.audit)) {
    writeJson(LOGISTICS_DEMO_KEYS.audit, [] as AuditTrailEntry[]);
  }
  if (!window.localStorage.getItem(LOGISTICS_DEMO_KEYS.pickTasks)) {
    writeJson(LOGISTICS_DEMO_KEYS.pickTasks, initialPickTasks);
  }
  if (!window.localStorage.getItem(LOGISTICS_DEMO_KEYS.shortages)) {
    writeJson(LOGISTICS_DEMO_KEYS.shortages, initialShortages);
  }
}

export function resetLogisticsDemoData() {
  if (!canUseStorage()) return;
  Object.values(LOGISTICS_DEMO_KEYS).forEach((key) => {
    window.localStorage.removeItem(key);
  });
  ensureLogisticsDemoSeeded();
  emitDemoUpdate();
  window.location.reload();
}

export function getPallets(): PalletUnit[] {
  ensureLogisticsDemoSeeded();
  return readJson(LOGISTICS_DEMO_KEYS.pallets, initialPallets);
}

export function setPallets(pallets: PalletUnit[]) {
  writeJson(LOGISTICS_DEMO_KEYS.pallets, pallets);
  syncShipmentsFromPallets(pallets);
}

export function updatePallet(id: string, patch: Partial<PalletUnit>) {
  const next = getPallets().map((p) => (p.id === id ? { ...p, ...patch } : p));
  setPallets(next);
  return next.find((p) => p.id === id) ?? null;
}

export function getLoads(): SterilizationLoad[] {
  ensureLogisticsDemoSeeded();
  return readJson(LOGISTICS_DEMO_KEYS.loads, initialLoads);
}

export function setLoads(loads: SterilizationLoad[]) {
  writeJson(LOGISTICS_DEMO_KEYS.loads, loads);
}

export function getShipments(): OutboundShipment[] {
  ensureLogisticsDemoSeeded();
  const shipments = readJson(LOGISTICS_DEMO_KEYS.shipments, initialShipments);
  return syncShipmentsFromPallets(getPallets(), shipments, false);
}

export function setShipments(shipments: OutboundShipment[]) {
  writeJson(LOGISTICS_DEMO_KEYS.shipments, shipments);
}

function syncShipmentsFromPallets(
  pallets: PalletUnit[],
  currentShipments?: OutboundShipment[],
  persist = true,
): OutboundShipment[] {
  const shipments = currentShipments ?? readJson(LOGISTICS_DEMO_KEYS.shipments, initialShipments);
  const released = new Set(
    pallets.filter((p) => p.status === 'RELEASED').map((p) => p.id),
  );
  const next = shipments.map((shipment) => {
    if (!shipment.linkedPalletId) return shipment;
    const sterilGreen = released.has(shipment.linkedPalletId);
    const sterilizationPass: GateLight = sterilGreen ? 'GREEN' : shipment.checks.sterilizationPass === 'GREEN' ? 'GREEN' : 'RED';
    const allGreen =
      shipment.checks.batchRecord === 'GREEN' &&
      sterilizationPass === 'GREEN' &&
      shipment.checks.customsClearance === 'GREEN' &&
      shipment.checks.lineClearance === 'GREEN';
    return {
      ...shipment,
      checks: {
        ...shipment.checks,
        sterilizationPass,
      },
      status:
        shipment.status === 'RELEASED'
          ? shipment.status
          : allGreen
            ? 'READINESS_CHECK'
            : shipment.id === 'SHIP-RNO-08' && shipment.checks.customsClearance === 'RED'
              ? 'BLOCKED'
              : shipment.status,
    };
  });
  if (persist) writeJson(LOGISTICS_DEMO_KEYS.shipments, next);
  return next;
}

export function getAuditTrail(): AuditTrailEntry[] {
  ensureLogisticsDemoSeeded();
  return readJson(LOGISTICS_DEMO_KEYS.audit, [] as AuditTrailEntry[]);
}

export function appendAudit(entry: Omit<AuditTrailEntry, 'id' | 'at'> & { at?: string }) {
  const trail = getAuditTrail();
  const next: AuditTrailEntry = {
    id: `AUD-${Date.now()}`,
    at: entry.at ?? new Date().toISOString(),
    actor: entry.actor,
    action: entry.action,
    entityId: entry.entityId,
    reason: entry.reason,
    contract: entry.contract,
    detail: entry.detail,
  };
  writeJson(LOGISTICS_DEMO_KEYS.audit, [next, ...trail]);
  // Also mirror to FilesMD-style key requested by the V7 prompt
  if (canUseStorage()) {
    window.localStorage.setItem('src/FilesMD/AUDIT_TRAIL', JSON.stringify([next, ...trail]));
  }
  return next;
}

export function getPickTasks(): GuidedPickTask[] {
  ensureLogisticsDemoSeeded();
  return readJson(LOGISTICS_DEMO_KEYS.pickTasks, initialPickTasks);
}

export function setPickTasks(tasks: GuidedPickTask[]) {
  writeJson(LOGISTICS_DEMO_KEYS.pickTasks, tasks);
}

export function getShortages(): LineShortageRiskItem[] {
  ensureLogisticsDemoSeeded();
  return readJson(LOGISTICS_DEMO_KEYS.shortages, initialShortages);
}

export function isSapSyncFixed(): boolean {
  if (!canUseStorage()) return false;
  return window.localStorage.getItem(LOGISTICS_DEMO_KEYS.sapSyncFixed) === 'true';
}

export function setSapSyncFixed(fixed: boolean) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(LOGISTICS_DEMO_KEYS.sapSyncFixed, fixed ? 'true' : 'false');
  emitDemoUpdate();
}

export function subscribeLogisticsDemo(listener: () => void) {
  if (typeof window === 'undefined') return () => {};
  ensureLogisticsDemoSeeded();
  const onStorage = (event: StorageEvent) => {
    if (!event.key || Object.values(LOGISTICS_DEMO_KEYS).includes(event.key as any)) {
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener(LOGISTICS_DEMO_EVENT, listener);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(LOGISTICS_DEMO_EVENT, listener);
  };
}
