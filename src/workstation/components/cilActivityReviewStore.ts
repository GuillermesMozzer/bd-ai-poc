import {useEffect, useState} from 'react';

export type CilReviewStatus = 'Waiting Review' | 'Done' | 'Pending' | 'Overdue';

export type CilReviewQueueItem = {
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
  status: CilReviewStatus;
  replayId: string;
  elapsedSeconds: number;
  comment?: string;
};

const cilReviewQueueStorageKey = 'workstation-cil-review-queue-v1';
const cilReviewQueueChangedEvent = 'workstation-cil-review-queue-changed';
const mockCilWaitingReviewItems: CilReviewQueueItem[] = [
  {
    id: 'cil-review-mock-1',
    activityId: 'ACT-100001',
    task: 'Z1 Main Indexer - 2.1 Pneumatic Air Inlet Verification',
    line: 'Line A',
    area: 'Area A',
    equipment: 'AFA1-10 Zone 1',
    shift: 'Shift 1',
    avgTime: '18 min',
    machineState: 'Running / External',
    actualTime: '16 min',
    completedAt: '2026-05-26 09:40',
    createdAt: '2026-05-26 09:40',
    responsible: 'Delila Bran',
    status: 'Waiting Review',
    replayId: 'cil-review-mock-replay-1',
    elapsedSeconds: 960,
    comment: 'Ocorrencia: vazamento identificado na linha durante a etapa 2.1 (alimentacao de ar). Atividade nao concluida e requer reagendamento.',
  },
  {
    id: 'cil-review-mock-overdue-1',
    activityId: 'ACT-100002',
    task: 'Z2 Assembly Station - Guard fastener lubrication',
    line: 'Line A',
    area: 'Area B',
    equipment: 'Z2 Assembly Station',
    shift: 'Shift 1',
    avgTime: '10 min',
    machineState: 'Stopped / Internal',
    actualTime: '-',
    completedAt: '-',
    createdAt: '2026-05-26 06:45',
    responsible: 'Ana Souza',
    status: 'Overdue',
    replayId: 'cil-review-mock-replay-overdue-1',
    elapsedSeconds: 0,
    comment: 'Activity missed the planned completion window and is overdue for operator closeout.',
  },
];

function sanitizeQueueItem(candidate: unknown): CilReviewQueueItem | null {
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
  };
}

const mockQueueById = new Map<string, CilReviewQueueItem>(
  mockCilWaitingReviewItems.map((item) => [item.id, item]),
);

function normalizeMockQueueItems(items: CilReviewQueueItem[]) {
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
    };
  });
}

export function readCilReviewQueueItems() {
  if (typeof window === 'undefined') return [] as CilReviewQueueItem[];
  try {
    const raw = window.localStorage.getItem(cilReviewQueueStorageKey);
    if (!raw) return [...mockCilWaitingReviewItems];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...mockCilWaitingReviewItems];
    const sanitized = parsed
      .map(sanitizeQueueItem)
      .filter((item): item is CilReviewQueueItem => Boolean(item));
    const normalized = normalizeMockQueueItems(sanitized).filter((item) => (
      item.activityId === 'ACT-100001'
        || !/^ACT-\d{12,}$/.test(item.activityId)
    ));
    const presentIds = new Set(normalized.map((item) => item.id));
    const missingPrimaryMock = mockCilWaitingReviewItems
      .filter((item) => !presentIds.has(item.id));
    return [...missingPrimaryMock, ...normalized];
  } catch {
    return [...mockCilWaitingReviewItems];
  }
}

function writeCilReviewQueueItems(items: CilReviewQueueItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(cilReviewQueueStorageKey, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent<CilReviewQueueItem[]>(cilReviewQueueChangedEvent, {detail: items}));
}

export function appendCilReviewQueueItem(item: Omit<CilReviewQueueItem, 'id'>) {
  const currentItems = readCilReviewQueueItems();
  const nextItem: CilReviewQueueItem = {
    ...item,
    id: `cil-review-${Date.now()}`,
  };
  writeCilReviewQueueItems([nextItem, ...currentItems]);
  return nextItem;
}

export function updateCilReviewQueueItemStatus(itemId: string, status: CilReviewStatus) {
  const currentItems = readCilReviewQueueItems();
  const nextItems = currentItems.map((item) => (
    item.id === itemId
      ? {
        ...item,
        status,
      }
      : item
  ));
  writeCilReviewQueueItems(nextItems);
}

export function useCilReviewQueueItems() {
  const [items, setItems] = useState<CilReviewQueueItem[]>(() => readCilReviewQueueItems());

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleChanged = (event: Event) => {
      const nextItems = (event as CustomEvent<CilReviewQueueItem[]>).detail;
      setItems(Array.isArray(nextItems) ? nextItems : readCilReviewQueueItems());
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === cilReviewQueueStorageKey) {
        setItems(readCilReviewQueueItems());
      }
    };
    window.addEventListener(cilReviewQueueChangedEvent, handleChanged as EventListener);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(cilReviewQueueChangedEvent, handleChanged as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return {items};
}
