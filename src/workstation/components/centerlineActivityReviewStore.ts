import {useEffect, useState} from 'react';

export type CenterlineReviewStatus = 'Waiting Review' | 'Done' | 'Pending' | 'Overdue';

export type CenterlineReviewQueueItem = {
  id: string;
  activityId: string;
  task: string;
  line: 'Line A' | 'Line B';
  area: 'Area A' | 'Area B';
  equipment: string;
  shift: 'Shift 1' | 'Shift 2' | 'Shift 3';
  avgTime: string;
  machineState: 'Running / External' | 'Stopped / Internal';
  actualTime: string;
  completedAt: string;
  createdAt: string;
  responsible: string;
  status: CenterlineReviewStatus;
  replayId: string;
  elapsedSeconds: number;
  comment?: string;
  parameter?: string;
  targetRange?: string;
  actualReading?: string;
};

const centerlineReviewQueueStorageKey = 'workstation-centerline-review-queue-v1';
const centerlineReviewQueueChangedEvent = 'workstation-centerline-review-queue-changed';
const mockCenterlineWaitingReviewItems: CenterlineReviewQueueItem[] = [
  {
    id: 'centerline-review-mock-1',
    activityId: 'CL-100401',
    task: 'Z3 Sealing Module - Temperature and Pressure Verification',
    line: 'Line B',
    area: 'Area A',
    equipment: 'Z3 Sealing Module',
    shift: 'Shift 2',
    avgTime: '9 min',
    machineState: 'Running / External',
    actualTime: '7 min',
    completedAt: '2026-05-26 10:18',
    createdAt: '2026-05-26 10:18',
    responsible: 'Delila Bran',
    status: 'Waiting Review',
    replayId: 'centerline-review-mock-replay-1',
    elapsedSeconds: 420,
    comment: 'Unable to complete temperature and pressure checks due to unstable readings on the sealing head. Activity must be rescheduled.',
    parameter: 'Temperature / Pressure',
    targetRange: '95-105 C | 4.0-6.0 bar',
    actualReading: 'Temp unstable | Pressure oscillating',
  },
  {
    id: 'centerline-review-mock-overdue-1',
    activityId: 'CL-100402',
    task: 'Z1 Feeder - Pressure setpoint verification',
    line: 'Line A',
    area: 'Area B',
    equipment: 'Z1 Feeder',
    shift: 'Shift 3',
    avgTime: '5 min',
    machineState: 'Running / External',
    actualTime: '-',
    completedAt: '-',
    createdAt: '2026-05-26 07:10',
    responsible: 'Maria Garcia',
    status: 'Overdue',
    replayId: 'centerline-review-mock-replay-overdue-1',
    elapsedSeconds: 0,
    comment: 'Pressure verification was not completed before the shift window closed.',
    parameter: 'Pressure',
    targetRange: '4.0-6.0 bar',
    actualReading: '-',
  },
];

function sanitizeQueueItem(candidate: unknown): CenterlineReviewQueueItem | null {
  if (typeof candidate !== 'object' || candidate === null) return null;
  const row = candidate as Record<string, unknown>;
  if (
    typeof row.id !== 'string'
    || typeof row.activityId !== 'string'
    || typeof row.task !== 'string'
    || typeof row.line !== 'string'
    || typeof row.area !== 'string'
    || typeof row.equipment !== 'string'
    || typeof row.shift !== 'string'
    || typeof row.avgTime !== 'string'
    || typeof row.machineState !== 'string'
    || typeof row.actualTime !== 'string'
    || typeof row.completedAt !== 'string'
    || typeof row.createdAt !== 'string'
    || typeof row.responsible !== 'string'
    || typeof row.status !== 'string'
    || typeof row.replayId !== 'string'
    || typeof row.elapsedSeconds !== 'number'
  ) {
    return null;
  }
  if (row.line !== 'Line A' && row.line !== 'Line B') return null;
  if (row.area !== 'Area A' && row.area !== 'Area B') return null;
  if (row.shift !== 'Shift 1' && row.shift !== 'Shift 2' && row.shift !== 'Shift 3') return null;
  if (row.machineState !== 'Running / External' && row.machineState !== 'Stopped / Internal') return null;
  if (row.status !== 'Waiting Review' && row.status !== 'Done' && row.status !== 'Pending' && row.status !== 'Overdue') return null;

  return {
    id: row.id,
    activityId: row.activityId,
    task: row.task,
    line: row.line,
    area: row.area,
    equipment: row.equipment,
    shift: row.shift,
    avgTime: row.avgTime,
    machineState: row.machineState,
    actualTime: row.actualTime,
    completedAt: row.completedAt,
    createdAt: row.createdAt,
    responsible: row.responsible,
    status: row.status,
    replayId: row.replayId,
    elapsedSeconds: row.elapsedSeconds,
    comment: typeof row.comment === 'string' ? row.comment : undefined,
    parameter: typeof row.parameter === 'string' ? row.parameter : undefined,
    targetRange: typeof row.targetRange === 'string' ? row.targetRange : undefined,
    actualReading: typeof row.actualReading === 'string' ? row.actualReading : undefined,
  };
}

const mockQueueById = new Map<string, CenterlineReviewQueueItem>(
  mockCenterlineWaitingReviewItems.map((item) => [item.id, item]),
);

function normalizeMockQueueItems(items: CenterlineReviewQueueItem[]) {
  return items.map((item) => {
    const mock = mockQueueById.get(item.id);
    if (!mock) return item;
    return {
      ...item,
      task: mock.task,
      equipment: mock.equipment,
      line: mock.line,
      area: mock.area,
      shift: mock.shift,
      avgTime: mock.avgTime,
      machineState: mock.machineState,
      replayId: mock.replayId,
      comment: item.comment ?? mock.comment,
      parameter: item.parameter ?? mock.parameter,
      targetRange: item.targetRange ?? mock.targetRange,
      actualReading: item.actualReading ?? mock.actualReading,
    };
  });
}

export function readCenterlineReviewQueueItems() {
  if (typeof window === 'undefined') return [] as CenterlineReviewQueueItem[];
  try {
    const raw = window.localStorage.getItem(centerlineReviewQueueStorageKey);
    if (!raw) return [...mockCenterlineWaitingReviewItems];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...mockCenterlineWaitingReviewItems];
    const sanitized = parsed
      .map(sanitizeQueueItem)
      .filter((item): item is CenterlineReviewQueueItem => Boolean(item));
    const normalized = normalizeMockQueueItems(sanitized).filter((item) => (
      item.activityId === 'CL-100401'
        || !/^CL-\d{12,}$/.test(item.activityId)
    ));
    const presentIds = new Set(normalized.map((item) => item.id));
    const missingPrimaryMock = mockCenterlineWaitingReviewItems
      .filter((item) => !presentIds.has(item.id));
    return [...missingPrimaryMock, ...normalized];
  } catch {
    return [...mockCenterlineWaitingReviewItems];
  }
}

function writeCenterlineReviewQueueItems(items: CenterlineReviewQueueItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(centerlineReviewQueueStorageKey, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent<CenterlineReviewQueueItem[]>(centerlineReviewQueueChangedEvent, {detail: items}));
}

export function appendCenterlineReviewQueueItem(item: Omit<CenterlineReviewQueueItem, 'id'>) {
  const currentItems = readCenterlineReviewQueueItems();
  const nextItem: CenterlineReviewQueueItem = {
    ...item,
    id: `centerline-review-${Date.now()}`,
  };
  writeCenterlineReviewQueueItems([nextItem, ...currentItems]);
  return nextItem;
}

export function updateCenterlineReviewQueueItemStatus(itemId: string, status: CenterlineReviewStatus) {
  const currentItems = readCenterlineReviewQueueItems();
  const nextItems = currentItems.map((item) => (
    item.id === itemId
      ? {
        ...item,
        status,
      }
      : item
  ));
  writeCenterlineReviewQueueItems(nextItems);
}

export function useCenterlineReviewQueueItems() {
  const [items, setItems] = useState<CenterlineReviewQueueItem[]>(() => readCenterlineReviewQueueItems());

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleChanged = (event: Event) => {
      const nextItems = (event as CustomEvent<CenterlineReviewQueueItem[]>).detail;
      setItems(Array.isArray(nextItems) ? nextItems : readCenterlineReviewQueueItems());
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === centerlineReviewQueueStorageKey) {
        setItems(readCenterlineReviewQueueItems());
      }
    };
    window.addEventListener(centerlineReviewQueueChangedEvent, handleChanged as EventListener);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(centerlineReviewQueueChangedEvent, handleChanged as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return {items};
}
