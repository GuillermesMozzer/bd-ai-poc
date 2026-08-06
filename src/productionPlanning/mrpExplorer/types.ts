export type MrpPeriodKey =
  | 'w-4'
  | 'w-3'
  | 'w-2'
  | 'w-1'
  | 'w0'
  | 'w1'
  | 'w2'
  | 'w3'
  | 'w4'
  | 'w5'
  | 'w6'
  | 'w7';

export type MrpPeriod = {
  key: MrpPeriodKey;
  label: string;
  date: string;
  selected?: boolean;
};

export type MrpCellValue = {
  display: string;
  tone?: 'default' | 'inventory' | 'purchase' | 'muted';
  selectable?: boolean;
};

export type MrpStructureRow = {
  id: string;
  parentId?: string;
  label: string;
  uom: string;
  level: number;
  rowType: 'item' | 'metric';
  itemType?: 'fg' | 'sf' | 'asm' | 'raw';
  total?: string;
  cells: Partial<Record<MrpPeriodKey, MrpCellValue>>;
};

export type MrpKpi = {
  label: string;
  value: string;
  helper: string;
  tone?: 'default' | 'warning' | 'info';
};

export type MrpSelectedDemand = {
  item: string;
  period: string;
  plannedNet: string;
  adjustedGross: string;
  projectedInventory: string;
};
