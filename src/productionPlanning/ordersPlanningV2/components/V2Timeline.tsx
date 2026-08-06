import {DragEvent, Fragment, useMemo, useRef, useState} from 'react';
import {
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  PrecisionManufacturing as PrecisionManufacturingIcon,
} from '@mui/icons-material';
import {Box, Chip, Tooltip, Typography} from '@mui/material';
import WoHoverCard, {mockWoHoverData} from './WoHoverCard';
import WoDragInfoPanel from './WoDragInfoPanel';
import type {
  MachineWorkOrder,
  V2ColumnLine,
  V2ObjectCategoryConfig,
  V2TimelineDropTarget,
  V2TimelineEvent,
  V2TimeSlot,
} from '../types';
import {parseDragPayload, serializeDragPayload, V2_DRAG_MIME} from '../scheduleUtils';
import {
  V2_COLUMN_WIDTH,
  V2_DATE_COL_WIDTH,
  V2_HOUR_COL_WIDTH,
  V2_ROW_HEIGHT,
  V2_TIME_COL_WIDTH,
} from '../mock';

const TRANSPOSE_LABEL_COL_WIDTH = 190;
const TRANSPOSE_META_COL_WIDTH = 70;
const TRANSPOSE_SLOT_COL_WIDTH = 36;
const TRANSPOSE_LINE_ROW_HEIGHT = 38;
const TRANSPOSE_MACHINE_ROW_HEIGHT = 52;

const woStatusColors: Record<string, {bg: string; border: string; text: string}> = {
  Running: {bg: '#DCFCE7', border: '#16A34A', text: '#15803D'},
  Released: {bg: '#DBEAFE', border: '#2563EB', text: '#1D4ED8'},
  Ready: {bg: '#E0F2FE', border: '#0284C7', text: '#0369A1'},
  Planned: {bg: '#EEF2FF', border: '#6366F1', text: '#4338CA'},
  Blocked: {bg: '#FEE2E2', border: '#DC2626', text: '#B91C1C'},
  OnHold: {bg: '#FEF3C7', border: '#D97706', text: '#92400E'},
  Paused: {bg: '#F3F4F6', border: '#6B7280', text: '#374151'},
  Completed: {bg: '#F0FDF4', border: '#86EFAC', text: '#15803D'},
};

const machineStatusColors: Record<string, string> = {
  Running: '#16A34A',
  Available: '#2563EB',
  Down: '#DC2626',
  Maintenance: '#F59E0B',
  Idle: '#94A3B8',
  Setup: '#8B5CF6',
  Blocked: '#DC2626',
  AtRisk: '#F97316',
};

const lineStatusColors: Record<string, string> = {
  Running: '#16A34A',
  AtRisk: '#F97316',
  Idle: '#94A3B8',
  Down: '#DC2626',
  Maintenance: '#F59E0B',
  Overloaded: '#DC2626',
  Available: '#2563EB',
};

const eventConfig: Record<V2TimelineEvent['type'], {bg: string; border: string; text: string; tag: string}> = {
  maintenance: {bg: '#FEF3C7', border: '#F59E0B', text: '#78350F', tag: 'MNT'},
  downtime: {bg: '#FAE8FF', border: '#b910ae', text: '#701A75', tag: 'DWT'},
  cleaning: {bg: '#EDE9FE', border: '#7C3AED', text: '#3B0764', tag: 'CLN'},
};

function computeLanes<T extends {slotIndex: number; slotCount: number}>(
  items: T[],
): Array<T & {laneIndex: number; laneCount: number}> {
  if (items.length === 0) return [];

  const ends = items.map((item) => item.slotIndex + item.slotCount);
  const order = items.map((_, i) => i).sort((a, b) => items[a].slotIndex - items[b].slotIndex);
  const laneEnds: number[] = [];
  const assignments: number[] = new Array(items.length);

  for (const i of order) {
    let lane = laneEnds.findIndex((end) => end <= items[i].slotIndex);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(0);
    }
    laneEnds[lane] = ends[i];
    assignments[i] = lane;
  }

  return items.map((item, i) => {
    let maxLane = assignments[i];
    for (let j = 0; j < items.length; j++) {
      if (i !== j && item.slotIndex < ends[j] && ends[i] > items[j].slotIndex) {
        maxLane = Math.max(maxLane, assignments[j]);
      }
    }
    return {...item, laneIndex: assignments[i], laneCount: maxLane + 1};
  });
}

function oeeColor(v: number) {
  return v >= 85 ? '#16A34A' : v >= 70 ? '#D97706' : '#DC2626';
}

function OeeTrendSparkline({
  points,
  width,
  height,
  showLabels = false,
}: {
  points: number[];
  width: number;
  height: number;
  showLabels?: boolean;
}) {
  if (points.length < 2) return null;
  const pad = showLabels ? 10 : 3;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const xs = points.map((_, i) => pad + (i / (points.length - 1)) * w);
  const ys = points.map((v) => pad + h - (v / 100) * h);
  const polyline = xs.map((x, i) => `${x},${ys[i]}`).join(' ');
  const avg = points.reduce((s, v) => s + v, 0) / points.length;
  const stroke = oeeColor(avg);

  return (
    <svg width={width} height={height} style={{display: 'block', overflow: 'visible'}}>
      <polyline
        points={polyline}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.85}
      />
      {points.map((v, i) => (
        <circle key={i} cx={xs[i]} cy={ys[i]} r={2} fill={oeeColor(v)} />
      ))}
      {showLabels &&
        points.map((v, i) => (
          <text
            key={i}
            x={xs[i]}
            y={ys[i] - 5}
            textAnchor="middle"
            fontSize={7}
            fill={oeeColor(v)}
            fontWeight="700"
          >
            {v}%
          </text>
        ))}
    </svg>
  );
}

function isoToDate(iso: string) {
  return iso.slice(0, 10);
}

function isoToHourFraction(iso: string) {
  const d = new Date(iso);
  return d.getHours() + d.getMinutes() / 60;
}

type VerticalBlockProps = {
  slotIndex: number;
  slotCount: number;
  rowHeight: number;
  laneIndex: number;
  laneCount: number;
};

type HorizontalBlockProps = {
  slotIndex: number;
  slotCount: number;
  columnWidth: number;
  laneIndex: number;
  laneCount: number;
};

function WorkOrderVerticalBlock({
  wo,
  slotIndex,
  slotCount,
  rowHeight,
  laneIndex,
  laneCount,
  isEditMode = false,
  onWoDragStart,
  onWoDragEnd,
}: {wo: MachineWorkOrder; isEditMode?: boolean; onWoDragStart?: (wo: MachineWorkOrder) => void; onWoDragEnd?: () => void} & VerticalBlockProps) {
  const colors = woStatusColors[wo.status] ?? woStatusColors.Planned;
  const top = slotIndex * rowHeight + 1;
  const height = slotCount * rowHeight - 2;
  const leftPct = (laneIndex / laneCount) * 100;
  const widthPct = 100 / laneCount;
  const blockRef = useRef<HTMLDivElement | null>(null);
  const [hoverAnchor, setHoverAnchor] = useState<HTMLElement | null>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleMouseEnter() {
    hoverTimeout.current = setTimeout(() => setHoverAnchor(blockRef.current), 120);
  }

  function handleMouseLeave() {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHoverAnchor(null);
  }

  const hoverData = {...mockWoHoverData, woId: wo.woNumber, status: wo.status};

  return (
    <>
      <Box
        ref={blockRef}
        draggable={isEditMode}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onDragStart={(event) => {
          if (!isEditMode) return;
          const payload = serializeDragPayload({
            source: 'planned',
            workOrderId: wo.id,
            lineId: wo.lineId,
            machineId: wo.machineId,
          });
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData(V2_DRAG_MIME, payload);
          event.dataTransfer.setData('text/plain', payload);
          onWoDragStart?.(wo);
        }}
        onDragEnd={() => {
          onWoDragEnd?.();
        }}
        sx={{
          position: 'absolute',
          top,
          left: `calc(${leftPct}% + 2px)`,
          width: `calc(${widthPct}% - 4px)`,
          height,
          bgcolor: colors.bg,
          border: `1.5px solid ${colors.border}`,
          borderRadius: 1,
          overflow: 'hidden',
          cursor: isEditMode ? 'grab' : 'pointer',
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: 0.75,
          py: 0.25,
          zIndex: 3,
          '&:hover': {boxShadow: `0 0 0 2px color-mix(in srgb, ${colors.border} 27%, transparent)`, zIndex: 4},
          transition: 'top 0.4s ease-out, height 0.4s ease-out, box-shadow 0.15s',
        }}
      >
        {height >= 24 && (
          <Typography sx={{fontSize: 10, fontWeight: 800, color: colors.text, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
            {wo.woNumber}
          </Typography>
        )}
        {height >= 40 && (
          <Typography sx={{fontSize: 9, color: colors.text, opacity: 0.8, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
            {wo.productCode}
          </Typography>
        )}
        {height >= 56 && wo.progressPercent != null && wo.progressPercent > 0 && (
          <Box sx={{position: 'absolute', bottom: 0, left: 0, width: `${wo.progressPercent}%`, height: 3, bgcolor: colors.border, borderRadius: '0 0 0 4px'}} />
        )}
      </Box>
      <WoHoverCard anchorEl={hoverAnchor} data={hoverData} />
    </>
  );
}

function EventVerticalBlock({
  event,
  slotIndex,
  slotCount,
  rowHeight,
  laneIndex,
  laneCount,
}: {event: V2TimelineEvent} & VerticalBlockProps) {
  const cfg = eventConfig[event.type];
  const top = slotIndex * rowHeight + 1;
  const height = slotCount * rowHeight - 2;
  const leftPct = (laneIndex / laneCount) * 100;
  const widthPct = 100 / laneCount;
  const startLabel = new Date(event.startDateTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  const endLabel = new Date(event.endDateTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

  const tooltip = (
    <Box sx={{p: 0.5, minWidth: 180}}>
      <Typography sx={{fontSize: 11, fontWeight: 800, color: '#FFF', mb: 0.25}}>{event.label}</Typography>
      <Typography sx={{fontSize: 10, color: 'var(--planning-text-muted)', textTransform: 'capitalize'}}>{event.type}</Typography>
      <Typography sx={{fontSize: 10, color: '#CBD5E1', mt: 0.5}}>{startLabel} → {endLabel}</Typography>
    </Box>
  );

  return (
    <Tooltip title={tooltip} placement="right" arrow componentsProps={{tooltip: {sx: {bgcolor: 'var(--planning-text-primary)', maxWidth: 220}}}}>
      <Box
        sx={{
          position: 'absolute',
          top,
          left: `calc(${leftPct}% + 2px)`,
          width: `calc(${widthPct}% - 4px)`,
          height,
          bgcolor: cfg.bg,
          border: `1.5px solid ${cfg.border}`,
          borderLeft: `4px solid ${cfg.border}`,
          borderRadius: 1,
          overflow: 'hidden',
          cursor: 'pointer',
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: 0.75,
          py: 0.25,
          zIndex: 5,
          '&:hover': {boxShadow: `0 0 0 2px color-mix(in srgb, ${cfg.border} 33%, transparent)`, zIndex: 6},
          transition: 'top 0.4s ease-out, height 0.4s ease-out, box-shadow 0.15s',
        }}
      >
        {height >= 18 && (
          <Typography sx={{fontSize: 9, fontWeight: 900, color: cfg.text, letterSpacing: '0.07em', textTransform: 'uppercase', lineHeight: 1.2}}>
            {cfg.tag}
          </Typography>
        )}
        {height >= 36 && (
          <Typography sx={{fontSize: 9, color: cfg.text, opacity: 0.85, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
            {event.label}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
}

function WorkOrderHorizontalBlock({
  wo,
  slotIndex,
  slotCount,
  columnWidth,
  laneIndex,
  laneCount,
  isEditMode = false,
  onWoDragStart,
  onWoDragEnd,
}: {wo: MachineWorkOrder; isEditMode?: boolean; onWoDragStart?: (wo: MachineWorkOrder) => void; onWoDragEnd?: () => void} & HorizontalBlockProps) {
  const colors = woStatusColors[wo.status] ?? woStatusColors.Planned;
  const left = slotIndex * columnWidth + 1;
  const width = slotCount * columnWidth - 2;
  const topPct = (laneIndex / laneCount) * 100;
  const heightPct = 100 / laneCount;
  const blockRef = useRef<HTMLDivElement | null>(null);
  const [hoverAnchor, setHoverAnchor] = useState<HTMLElement | null>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleMouseEnter() {
    hoverTimeout.current = setTimeout(() => setHoverAnchor(blockRef.current), 120);
  }

  function handleMouseLeave() {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHoverAnchor(null);
  }

  const hoverData = {...mockWoHoverData, woId: wo.woNumber, status: wo.status};

  return (
    <>
      <Box
        ref={blockRef}
        draggable={isEditMode}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onDragStart={(event) => {
          if (!isEditMode) return;
          const payload = serializeDragPayload({
            source: 'planned',
            workOrderId: wo.id,
            lineId: wo.lineId,
            machineId: wo.machineId,
          });
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData(V2_DRAG_MIME, payload);
          event.dataTransfer.setData('text/plain', payload);
          onWoDragStart?.(wo);
        }}
        onDragEnd={() => {
          onWoDragEnd?.();
        }}
        sx={{
          position: 'absolute',
          left,
          top: `calc(${topPct}% + 2px)`,
          width,
          height: `calc(${heightPct}% - 4px)`,
          bgcolor: colors.bg,
          border: `1.5px solid ${colors.border}`,
          borderRadius: 1,
          overflow: 'hidden',
          cursor: isEditMode ? 'grab' : 'pointer',
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          px: 0.75,
          zIndex: 3,
          '&:hover': {boxShadow: `0 0 0 2px color-mix(in srgb, ${colors.border} 27%, transparent)`, zIndex: 4},
          transition: 'left 0.4s ease-out, width 0.4s ease-out, box-shadow 0.15s',
        }}
      >
        {width >= 54 && (
          <Typography sx={{fontSize: 10, fontWeight: 800, color: colors.text, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
            {wo.woNumber}
          </Typography>
        )}
      </Box>
      <WoHoverCard anchorEl={hoverAnchor} data={hoverData} />
    </>
  );
}

function EventHorizontalBlock({
  event,
  slotIndex,
  slotCount,
  columnWidth,
  laneIndex,
  laneCount,
}: {event: V2TimelineEvent} & HorizontalBlockProps) {
  const cfg = eventConfig[event.type];
  const left = slotIndex * columnWidth + 1;
  const width = slotCount * columnWidth - 2;
  const topPct = (laneIndex / laneCount) * 100;
  const heightPct = 100 / laneCount;

  return (
    <Tooltip title={event.label} placement="top" arrow componentsProps={{tooltip: {sx: {bgcolor: 'var(--planning-text-primary)', maxWidth: 220}}}}>
      <Box
        sx={{
          position: 'absolute',
          left,
          top: `calc(${topPct}% + 2px)`,
          width,
          height: `calc(${heightPct}% - 4px)`,
          bgcolor: cfg.bg,
          border: `1.5px solid ${cfg.border}`,
          borderLeft: `4px solid ${cfg.border}`,
          borderRadius: 1,
          overflow: 'hidden',
          cursor: 'pointer',
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 0.75,
          zIndex: 5,
          '&:hover': {boxShadow: `0 0 0 2px color-mix(in srgb, ${cfg.border} 33%, transparent)`, zIndex: 6},
          transition: 'left 0.4s ease-out, width 0.4s ease-out, box-shadow 0.15s',
        }}
      >
        {width >= 44 && (
          <Typography sx={{fontSize: 9, fontWeight: 900, color: cfg.text, letterSpacing: '0.07em', textTransform: 'uppercase', lineHeight: 1.2}}>
            {cfg.tag}
          </Typography>
        )}
        {width >= 96 && (
          <Typography sx={{fontSize: 9, color: cfg.text, opacity: 0.85, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
            {event.label}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
}

type Props = {
  lines: V2ColumnLine[];
  slots: V2TimeSlot[];
  workOrders: MachineWorkOrder[];
  events: V2TimelineEvent[];
  categories: V2ObjectCategoryConfig[];
  transposed?: boolean;
  isEditMode?: boolean;
  onToggleLine: (lineId: string) => void;
  onDropWorkOrder: (rawPayload: string, target: V2TimelineDropTarget) => void;
};

export default function V2Timeline({
  lines,
  slots,
  workOrders,
  events,
  categories,
  transposed = false,
  isEditMode = false,
  onToggleLine,
  onDropWorkOrder,
}: Props) {
  const [activeDropTarget, setActiveDropTarget] = useState<string | null>(null);
  const [draggingWo, setDraggingWo] = useState<MachineWorkOrder | null>(null);
  const [dragTargetMachineId, setDragTargetMachineId] = useState<string | null>(null);

  const showWorkOrders = categories.find((c) => c.id === 'work-orders')?.enabled ?? true;
  const showMaintenance = categories.find((c) => c.id === 'maintenance')?.enabled ?? true;
  const showDowntime = categories.find((c) => c.id === 'changeover')?.enabled ?? true;
  const showCleaning = categories.find((c) => c.id === 'cleaning')?.enabled ?? true;

  const visibleColumns = useMemo(() => {
    const cols: Array<{id: string; lineId: string; label: string; isLine: boolean}> = [];
    for (const line of lines) {
      if (!line.expanded) {
        cols.push({id: line.id, lineId: line.id, label: line.shortLabel, isLine: true});
      } else {
        for (const machine of line.machines) {
          cols.push({id: machine.id, lineId: line.id, label: machine.shortLabel, isLine: false});
        }
      }
    }
    return cols;
  }, [lines]);

  const days = useMemo(() => {
    const map = new Map<string, {dayLabel: string; startIndex: number; count: number}>();
    slots.forEach((slot, index) => {
      if (!map.has(slot.day)) {
        map.set(slot.day, {dayLabel: slot.dayLabel, startIndex: index, count: 0});
      }
      map.get(slot.day)!.count++;
    });
    return Array.from(map.values());
  }, [slots]);

  const slotIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    slots.forEach((slot, index) => map.set(slot.id, index));
    return map;
  }, [slots]);

  const woByMachine = useMemo(() => {
    const map = new Map<string, MachineWorkOrder[]>();
    for (const wo of workOrders) {
      if (!map.has(wo.machineId)) {
        map.set(wo.machineId, []);
      }
      map.get(wo.machineId)!.push(wo);
    }
    return map;
  }, [workOrders]);

  const evByMachine = useMemo(() => {
    const map = new Map<string, V2TimelineEvent[]>();
    for (const ev of events) {
      if (!map.has(ev.machineId)) {
        map.set(ev.machineId, []);
      }
      map.get(ev.machineId)!.push(ev);
    }
    return map;
  }, [events]);

  function readDragPayload(event: DragEvent<HTMLElement>) {
    return event.dataTransfer.getData(V2_DRAG_MIME) || event.dataTransfer.getData('text/plain');
  }

  function handleDragOver(event: DragEvent<HTMLElement>, target: V2TimelineDropTarget, enabled: boolean) {
    if (!isEditMode || !enabled) return;
    // getData() is blocked by browsers during dragover for security; use types instead
    const hasPayload = event.dataTransfer.types.includes(V2_DRAG_MIME) || event.dataTransfer.types.includes('text/plain');
    if (!hasPayload) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setActiveDropTarget(`${target.machineId}:${target.slotId}`);
    setDragTargetMachineId(target.machineId);
  }

  function handleDragLeave(target: V2TimelineDropTarget) {
    if (activeDropTarget === `${target.machineId}:${target.slotId}`) {
      setActiveDropTarget(null);
    }
  }

  function handleDrop(event: DragEvent<HTMLElement>, target: V2TimelineDropTarget, enabled: boolean) {
    if (!isEditMode || !enabled) return;
    const rawPayload = readDragPayload(event);
    if (!parseDragPayload(rawPayload)) return;
    event.preventDefault();
    setActiveDropTarget(null);
    setDraggingWo(null);
    setDragTargetMachineId(null);
    onDropWorkOrder(rawPayload, target);
  }

  function getBlockSlots(startISO: string, endISO: string): {slotIndex: number; slotCount: number} | null {
    const startDate = isoToDate(startISO);
    const endDate = isoToDate(endISO);
    const startHour = isoToHourFraction(startISO);
    const endHour = isoToHourFraction(endISO);

    const firstSlotIndex = slotIndexMap.get(`${startDate}-${Math.floor(startHour)}`);
    if (firstSlotIndex == null) return null;

    const lastHour = Math.max(0, Math.ceil(endHour) - 1);
    const lastSlotIndex = slotIndexMap.get(`${endDate}-${lastHour}`) ?? slots.length - 1;
    return {slotIndex: firstSlotIndex, slotCount: Math.max(1, lastSlotIndex - firstSlotIndex + 1)};
  }

  function getWoBlocksForMachines(machineIds: string[]) {
    if (!showWorkOrders) return [];
    return machineIds.flatMap((machineId) =>
      (woByMachine.get(machineId) ?? []).flatMap((wo) => {
        const block = getBlockSlots(wo.plannedStartDateTime, wo.plannedEndDateTime);
        return block ? [{wo, ...block, laneIndex: 0, laneCount: 1}] : [];
      }),
    );
  }

  function getEventBlocksForMachines(machineIds: string[]) {
    const raw = machineIds.flatMap((machineId) =>
      (evByMachine.get(machineId) ?? [])
        .filter((event) => {
          if (event.type === 'maintenance' && !showMaintenance) return false;
          if (event.type === 'downtime' && !showDowntime) return false;
          if (event.type === 'cleaning' && !showCleaning) return false;
          return true;
        })
        .flatMap((event) => {
          const block = getBlockSlots(event.startDateTime, event.endDateTime);
          return block ? [{event, ...block}] : [];
        }),
    );
    return computeLanes(raw);
  }

  const transposeRows = useMemo(() => {
    const rows: Array<{
      id: string;
      lineId: string;
      label: string;
      sublabel: string;
      isLine: boolean;
      status: string;
      utilizationPercent: number;
      oeeTrend: Array<{day: string; value: number}>;
      machineIds: string[];
      rowHeight: number;
      clickable: boolean;
    }> = [];

    for (const line of lines) {
      rows.push({
        id: `line-row-${line.id}`,
        lineId: line.id,
        label: line.shortLabel,
        sublabel: line.label,
        isLine: true,
        status: line.status,
        utilizationPercent: line.utilizationPercent,
        oeeTrend: line.oeeTrend ?? [],
        machineIds: line.machines.map((machine) => machine.id),
        rowHeight: TRANSPOSE_LINE_ROW_HEIGHT,
        clickable: true,
      });

      if (line.expanded) {
        for (const machine of line.machines) {
          rows.push({
            id: machine.id,
            lineId: line.id,
            label: machine.shortLabel,
            sublabel: machine.label,
            isLine: false,
            status: machine.status,
            utilizationPercent: machine.utilizationPercent,
            oeeTrend: machine.oeeTrend ?? [],
            machineIds: [machine.id],
            rowHeight: TRANSPOSE_MACHINE_ROW_HEIGHT,
            clickable: false,
          });
        }
      }
    }

    return rows;
  }, [lines]);

  if (transposed) {
    const leftStickyWidth = TRANSPOSE_LABEL_COL_WIDTH + TRANSPOSE_META_COL_WIDTH;
    const totalTimelineWidth = slots.length * TRANSPOSE_SLOT_COL_WIDTH;
    const totalWidth = leftStickyWidth + totalTimelineWidth;

    return (
      <>
      <Box sx={{overflowX: 'auto', overflowY: 'auto', flex: 1, position: 'relative', bgcolor: '#FFF'}}>
        <Box sx={{minWidth: totalWidth, width: 'max-content'}}>
          <Box sx={{display: 'grid', gridTemplateColumns: `${TRANSPOSE_LABEL_COL_WIDTH}px ${TRANSPOSE_META_COL_WIDTH}px repeat(${slots.length}, ${TRANSPOSE_SLOT_COL_WIDTH}px)`}}>
            <Box sx={{position: 'sticky', top: 0, left: 0, zIndex: 40, gridColumn: '1 / span 2', gridRow: '1', height: 36, display: 'flex', alignItems: 'center', px: 1.25, bgcolor: 'var(--planning-surface-muted)', borderRight: '2px solid var(--planning-border)', borderBottom: '1px solid var(--planning-border)'}}>
              <Typography sx={{fontSize: 10, fontWeight: 800, color: '#8B95B5', letterSpacing: '0.06em', textTransform: 'uppercase'}}>
                Lines / Machines
              </Typography>
            </Box>

            {days.map((day) => (
              <Box
                key={`transpose-day-${day.dayLabel}`}
                sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 30,
                  gridColumn: `${day.startIndex + 3} / span ${day.count}`,
                  gridRow: '1',
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'var(--planning-neutral-bg)',
                  borderRight: '1px solid var(--planning-border)',
                  borderBottom: '1px solid var(--planning-border)',
                }}
              >
                <Typography sx={{fontSize: 10, fontWeight: 800, color: '#08184A', letterSpacing: '0.04em', textTransform: 'uppercase'}}>
                  {day.dayLabel}
                </Typography>
              </Box>
            ))}

            <Box sx={{position: 'sticky', top: 36, left: 0, zIndex: 40, gridColumn: '1', gridRow: '2', height: 32, bgcolor: 'var(--planning-surface-muted)', borderRight: '1px solid var(--planning-border)', borderBottom: '2px solid var(--planning-border)'}} />
            <Box sx={{position: 'sticky', top: 36, left: TRANSPOSE_LABEL_COL_WIDTH, zIndex: 40, gridColumn: '2', gridRow: '2', height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'var(--planning-surface-muted)', borderRight: '2px solid var(--planning-border)', borderBottom: '2px solid var(--planning-border)'}}>
              <Typography sx={{fontSize: 10, fontWeight: 700, color: '#8B95B5'}}>Util.</Typography>
            </Box>

            {slots.map((slot, slotIndex) => (
              <Box
                key={`transpose-slot-${slot.id}`}
                sx={{
                  position: 'sticky',
                  top: 36,
                  zIndex: 30,
                  gridColumn: slotIndex + 3,
                  gridRow: '2',
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'var(--planning-surface-muted)',
                  borderRight: '1px solid var(--planning-border)',
                  borderBottom: '2px solid var(--planning-border)',
                }}
              >
                <Typography sx={{fontSize: 10, fontWeight: 700, color: '#5B668A', transform: 'rotate(-90deg)', whiteSpace: 'nowrap'}}>
                  {slot.hourLabel}
                </Typography>
              </Box>
            ))}

            {(() => {
              const OEE_ROW_HEIGHT = 26;
              let gridRowCounter = 3;
              return transposeRows.map((row) => {
                const gridRow = gridRowCounter;
                const oeeGridRow = gridRowCounter + 1;
                gridRowCounter += 2;

                const statusColor = row.isLine
                  ? (lineStatusColors[row.status] ?? '#94A3B8')
                  : (machineStatusColors[row.status] ?? '#94A3B8');
                const rowDropEnabled = !row.isLine;
                const woBlocks = row.isLine && lines.find((line) => line.id === row.lineId)?.expanded
                  ? []
                  : getWoBlocksForMachines(row.machineIds);
                const eventBlocks = row.isLine && lines.find((line) => line.id === row.lineId)?.expanded
                  ? []
                  : getEventBlocksForMachines(row.machineIds);

                const oeeByDay = new Map(row.oeeTrend.map((p) => [p.day, p.value]));
                const uniqueDaysInSlots = [...new Set(slots.map((s) => s.day))];
                const dayOeePoints = uniqueDaysInSlots.map((dayKey) => oeeByDay.get(dayKey) ?? row.utilizationPercent);

                return (
                  <Fragment key={`transpose-row-${row.id}`}>
                    {/* Main row */}
                    <Box
                      onClick={row.clickable ? () => onToggleLine(row.lineId) : undefined}
                      sx={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 20,
                        gridColumn: '1',
                        gridRow,
                        height: row.rowHeight,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        pl: row.isLine ? 1 : 2.5,
                        pr: 1,
                        bgcolor: row.isLine ? '#F8FAFC' : '#FFFFFF',
                        borderRight: '1px solid var(--planning-border)',
                        borderBottom: '1px solid var(--planning-border)',
                        cursor: row.clickable ? 'pointer' : 'default',
                        '&:hover': row.clickable ? {bgcolor: '#EFF4FF'} : undefined,
                      }}
                    >
                      {row.isLine ? (
                        row.machineIds.length > 0 && lines.find((line) => line.id === row.lineId)?.expanded ? (
                          <ExpandMoreIcon sx={{fontSize: 16, color: statusColor, flexShrink: 0}} />
                        ) : (
                          <ChevronRightIcon sx={{fontSize: 16, color: statusColor, flexShrink: 0}} />
                        )
                      ) : (
                        <PrecisionManufacturingIcon sx={{fontSize: 13, color: statusColor, flexShrink: 0}} />
                      )}
                      <Box sx={{minWidth: 0, flex: 1}}>
                        <Typography sx={{fontSize: row.isLine ? 11 : 10, fontWeight: row.isLine ? 800 : 700, color: '#08184A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                          {row.label}
                        </Typography>
                        {row.isLine && (
                          <Typography sx={{fontSize: 9, color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                            {row.sublabel}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        position: 'sticky',
                        left: TRANSPOSE_LABEL_COL_WIDTH,
                        zIndex: 20,
                        gridColumn: '2',
                        gridRow,
                        height: row.rowHeight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: row.isLine ? '#F8FAFC' : '#FFFFFF',
                        borderRight: '2px solid var(--planning-border)',
                        borderBottom: '1px solid var(--planning-border)',
                      }}
                    >
                      <Chip
                        label={`${row.utilizationPercent}%`}
                        size="small"
                        sx={{
                          fontSize: 9,
                          height: 16,
                          fontWeight: 800,
                          bgcolor: row.utilizationPercent >= 90 ? '#FEE2E2' : row.utilizationPercent >= 75 ? '#FFF7ED' : '#F0FDF4',
                          color: row.utilizationPercent >= 90 ? '#DC2626' : row.utilizationPercent >= 75 ? '#C2410C' : '#15803D',
                        }}
                      />
                    </Box>

                    {slots.map((slot, slotIndex) => (
                      <Box
                        key={`transpose-cell-${row.id}-${slot.id}`}
                        onDragOver={(event) => handleDragOver(event, {lineId: row.lineId, machineId: row.machineIds[0], slotId: slot.id}, rowDropEnabled)}
                        onDragLeave={() => handleDragLeave({lineId: row.lineId, machineId: row.machineIds[0], slotId: slot.id})}
                        onDrop={(event) => handleDrop(event, {lineId: row.lineId, machineId: row.machineIds[0], slotId: slot.id}, rowDropEnabled)}
                        sx={{
                          gridColumn: slotIndex + 3,
                          gridRow,
                          height: row.rowHeight,
                          borderRight: '1px solid var(--planning-border)',
                          borderBottom: '1px solid var(--planning-border)',
                          bgcolor: activeDropTarget === `${row.machineIds[0]}:${slot.id}`
                            ? 'rgba(23, 105, 255, 0.14)'
                            : slotIndex % 2 === 0 ? '#FFFFFF' : '#FAFBFF',
                          outline: activeDropTarget === `${row.machineIds[0]}:${slot.id}` ? '2px solid #1769FF' : 'none',
                          outlineOffset: -2,
                          transition: 'background-color 0.12s ease, outline-color 0.12s ease',
                        }}
                      />
                    ))}

                    {(woBlocks.length > 0 || eventBlocks.length > 0) && (
                      <Box
                        sx={{
                          gridColumn: `3 / span ${slots.length}`,
                          gridRow,
                          position: 'relative',
                          height: row.rowHeight,
                          pointerEvents: 'none',
                          zIndex: 6,
                        }}
                      >
                        <Box sx={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
                          {woBlocks.map(({wo, slotIndex, slotCount, laneIndex, laneCount}) => (
                            <WorkOrderHorizontalBlock
                              key={wo.id}
                              wo={wo}
                              slotIndex={slotIndex}
                              slotCount={slotCount}
                              columnWidth={TRANSPOSE_SLOT_COL_WIDTH}
                              laneIndex={laneIndex}
                              laneCount={laneCount}
                              isEditMode={isEditMode}
                              onWoDragStart={setDraggingWo}
                              onWoDragEnd={() => { setDraggingWo(null); setDragTargetMachineId(null); }}
                            />
                          ))}
                          {eventBlocks.map(({event, slotIndex, slotCount, laneIndex, laneCount}) => (
                            <EventHorizontalBlock
                              key={event.id}
                              event={event}
                              slotIndex={slotIndex}
                              slotCount={slotCount}
                              columnWidth={TRANSPOSE_SLOT_COL_WIDTH}
                              laneIndex={laneIndex}
                              laneCount={laneCount}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* OEE trend sub-row */}
                    <Box
                      sx={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 20,
                        gridColumn: '1',
                        gridRow: oeeGridRow,
                        height: OEE_ROW_HEIGHT,
                        display: 'flex',
                        alignItems: 'center',
                        pl: row.isLine ? 1.5 : 3,
                        pr: 0.5,
                        bgcolor: row.isLine ? '#F0F4FF' : '#F8FAFF',
                        borderRight: '1px solid var(--planning-border)',
                        borderBottom: row.isLine ? '2px solid #CBD5E1' : '1px solid #E3E8F2',
                      }}
                    >
                      <Typography sx={{fontSize: 8, fontWeight: 700, color: '#8B95B5', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap'}}>
                        OEE
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        position: 'sticky',
                        left: TRANSPOSE_LABEL_COL_WIDTH,
                        zIndex: 20,
                        gridColumn: '2',
                        gridRow: oeeGridRow,
                        height: OEE_ROW_HEIGHT,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: row.isLine ? '#F0F4FF' : '#F8FAFF',
                        borderRight: '2px solid var(--planning-border)',
                        borderBottom: row.isLine ? '2px solid #CBD5E1' : '1px solid #E3E8F2',
                      }}
                    >
                      {dayOeePoints.length >= 2 && (
                        <OeeTrendSparkline points={dayOeePoints} width={TRANSPOSE_META_COL_WIDTH - 4} height={OEE_ROW_HEIGHT - 4} />
                      )}
                    </Box>

                    {slots.map((_slot, slotIndex) => (
                      <Box
                        key={`oee-cell-${row.id}-${slotIndex}`}
                        sx={{
                          gridColumn: slotIndex + 3,
                          gridRow: oeeGridRow,
                          height: OEE_ROW_HEIGHT,
                          borderRight: '1px solid var(--planning-border)',
                          borderBottom: row.isLine ? '2px solid #CBD5E1' : '1px solid #E3E8F2',
                          bgcolor: row.isLine ? '#F0F4FF' : '#F8FAFF',
                        }}
                      />
                    ))}

                    {dayOeePoints.length >= 2 && (
                      <Box
                        sx={{
                          gridColumn: `3 / span ${slots.length}`,
                          gridRow: oeeGridRow,
                          position: 'relative',
                          height: OEE_ROW_HEIGHT,
                          pointerEvents: 'none',
                          zIndex: 7,
                        }}
                      >
                        <OeeTrendSparkline
                          points={dayOeePoints}
                          width={slots.length * TRANSPOSE_SLOT_COL_WIDTH}
                          height={OEE_ROW_HEIGHT}
                          showLabels={row.isLine}
                        />
                      </Box>
                    )}
                  </Fragment>
                );
              });
            })()}
          </Box>
        </Box>
      </Box>
      <WoDragInfoPanel
        visible={draggingWo !== null}
        wo={draggingWo}
        targetMachineId={dragTargetMachineId}
        lines={lines}
        workOrders={workOrders}
        slots={slots}
      />
      </>
    );
  }

  const totalHeight = slots.length * V2_ROW_HEIGHT;
  const gridTemplateColumns = `${V2_DATE_COL_WIDTH}px ${V2_HOUR_COL_WIDTH}px ${visibleColumns.map(() => `${V2_COLUMN_WIDTH}px`).join(' ')}`;

  return (
    <Box sx={{overflowX: 'auto', overflowY: 'auto', flex: 1, position: 'relative'}}>
      <Box sx={{display: 'grid', gridTemplateColumns, minWidth: V2_TIME_COL_WIDTH + visibleColumns.length * V2_COLUMN_WIDTH}}>
        <Box sx={{position: 'sticky', top: 0, zIndex: 30, gridColumn: '1 / span 2', gridRow: '1', bgcolor: 'var(--planning-surface-muted)', borderRight: '1px solid var(--planning-border)', borderBottom: '1px solid var(--planning-border)', height: 36}} />

        {lines.map((line) => {
          const lineColumnCount = line.expanded ? line.machines.length : 1;
          const lineStart = visibleColumns.findIndex((column) => column.lineId === line.id) + 3;
          const statusColor = lineStatusColors[line.status] ?? '#94A3B8';

          return (
            <Box
              key={`line-hdr-${line.id}`}
              sx={{position: 'sticky', top: 0, zIndex: 20, gridColumn: `${lineStart} / span ${lineColumnCount}`, gridRow: '1', display: 'flex', alignItems: 'center', gap: 0.75, px: 1, height: 36, bgcolor: 'var(--planning-neutral-bg)', border: '1px solid var(--planning-border)', borderTop: 'none', borderLeft: 'none', cursor: 'pointer', '&:hover': {bgcolor: '#E8EDFF'}, overflow: 'hidden'}}
              onClick={() => onToggleLine(line.id)}
            >
              <Box sx={{color: statusColor, display: 'flex', alignItems: 'center', flexShrink: 0}}>
                {line.expanded ? <ExpandMoreIcon sx={{fontSize: 16}} /> : <ChevronRightIcon sx={{fontSize: 16}} />}
              </Box>
              <Typography sx={{fontSize: 11, fontWeight: 800, color: '#08184A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1}}>
                {line.shortLabel}
              </Typography>
              <Chip
                label={`${line.utilizationPercent}%`}
                size="small"
                sx={{
                  fontSize: 9,
                  height: 16,
                  fontWeight: 800,
                  flexShrink: 0,
                  bgcolor: line.utilizationPercent >= 90 ? '#FEE2E2' : line.utilizationPercent >= 75 ? '#FFF7ED' : '#F0FDF4',
                  color: line.utilizationPercent >= 90 ? '#DC2626' : line.utilizationPercent >= 75 ? '#C2410C' : '#15803D',
                }}
              />
            </Box>
          );
        })}

        <Box sx={{position: 'sticky', top: 36, zIndex: 30, gridColumn: '1 / span 2', gridRow: '2', bgcolor: 'var(--planning-surface-muted)', borderRight: '2px solid var(--planning-border)', borderBottom: '2px solid var(--planning-border)', height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Typography sx={{fontSize: 10, fontWeight: 700, color: '#8B95B5', letterSpacing: '0.06em', textTransform: 'uppercase'}}>Time</Typography>
        </Box>

        {visibleColumns.map((column, columnIndex) => {
          const machine = !column.isLine ? lines.flatMap((line) => line.machines).find((item) => item.id === column.id) : undefined;
          const lineStatus = column.isLine ? (lines.find((line) => line.id === column.id)?.status ?? 'Available') : undefined;
          const statusColor = column.isLine
            ? (lineStatusColors[lineStatus ?? ''] ?? '#94A3B8')
            : (machineStatusColors[machine?.status ?? ''] ?? '#94A3B8');

          return (
            <Box
              key={`mach-hdr-${column.id}`}
              sx={{position: 'sticky', top: 36, zIndex: 20, gridColumn: columnIndex + 3, gridRow: '2', display: 'flex', alignItems: 'center', gap: 0.5, px: 1, height: 32, bgcolor: 'var(--planning-surface-muted)', borderRight: '1px solid var(--planning-border)', borderBottom: '1px solid #CBD5E1', overflow: 'hidden'}}
            >
              {!column.isLine && <PrecisionManufacturingIcon sx={{fontSize: 13, color: statusColor, flexShrink: 0}} />}
              <Typography sx={{fontSize: 10, fontWeight: 700, color: '#5B668A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                {column.label}
              </Typography>
              {machine && <Box sx={{width: 6, height: 6, borderRadius: '50%', bgcolor: statusColor, flexShrink: 0, ml: 'auto'}} />}
            </Box>
          );
        })}

        {/* Row 3: OEE trend sparklines per column */}
        <Box sx={{position: 'sticky', top: 68, zIndex: 30, gridColumn: '1 / span 2', gridRow: '3', bgcolor: 'var(--planning-neutral-bg)', borderRight: '2px solid var(--planning-border)', borderBottom: '2px solid var(--planning-border)', height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Typography sx={{fontSize: 8, fontWeight: 700, color: '#8B95B5', letterSpacing: '0.06em', textTransform: 'uppercase'}}>OEE</Typography>
        </Box>
        {visibleColumns.map((column, columnIndex) => {
          const oeeTrend = column.isLine
            ? lines.find((l) => l.id === column.id)?.oeeTrend ?? []
            : lines.flatMap((l) => l.machines).find((m) => m.id === column.id)?.oeeTrend ?? [];
          const oeeByDay = new Map(oeeTrend.map((p) => [p.day, p.value]));
          const uniqueDaysInSlots = [...new Set(slots.map((s) => s.day))];
          const colOeePoints = uniqueDaysInSlots.map((dayKey) => oeeByDay.get(dayKey) ?? (column.isLine
            ? (lines.find((l) => l.id === column.id)?.utilizationPercent ?? 80)
            : (lines.flatMap((l) => l.machines).find((m) => m.id === column.id)?.utilizationPercent ?? 80)));

          return (
            <Box
              key={`oee-hdr-${column.id}`}
              sx={{position: 'sticky', top: 68, zIndex: 20, gridColumn: columnIndex + 3, gridRow: '3', height: 26, bgcolor: 'var(--planning-neutral-bg)', borderRight: '1px solid var(--planning-border)', borderBottom: '2px solid var(--planning-border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
            >
              {colOeePoints.length >= 2 && (
                <OeeTrendSparkline points={colOeePoints} width={V2_COLUMN_WIDTH} height={26} showLabels />
              )}
            </Box>
          );
        })}

        {days.map((day) => (
          <Box
            key={`day-${day.dayLabel}`}
            sx={{gridColumn: 1, gridRow: `${day.startIndex + 4} / span ${day.count}`, position: 'sticky', left: 0, zIndex: 10, bgcolor: 'var(--planning-surface-muted)', borderRight: '1px solid var(--planning-border)', borderBottom: '2px solid var(--planning-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}
          >
            <Typography sx={{fontSize: 10, fontWeight: 800, color: 'var(--planning-text-secondary)', writingMode: 'vertical-lr', transform: 'rotate(180deg)', letterSpacing: '0.04em', textTransform: 'uppercase'}}>
              {day.dayLabel}
            </Typography>
          </Box>
        ))}

        {slots.map((slot, slotIndex) => (
          <Fragment key={slot.id}>
            <Box
              sx={{gridColumn: 2, gridRow: slotIndex + 4, position: 'sticky', left: V2_DATE_COL_WIDTH, zIndex: 9, bgcolor: 'var(--planning-surface-muted)', borderRight: '2px solid var(--planning-border)', borderBottom: slot.hour === 23 ? '2px solid #CBD5E1' : '1px solid #F1F5F9', height: V2_ROW_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 0.75}}
            >
              <Typography sx={{fontSize: 10, fontWeight: 700, color: '#8B95B5'}}>{slot.hourLabel}</Typography>
            </Box>

            {visibleColumns.map((column, columnIndex) => (
              <Box
                key={`cell-${slot.id}-${column.id}`}
                onDragOver={(event) => handleDragOver(event, {lineId: column.lineId, machineId: column.id, slotId: slot.id}, !column.isLine)}
                onDragLeave={() => handleDragLeave({lineId: column.lineId, machineId: column.id, slotId: slot.id})}
                onDrop={(event) => handleDrop(event, {lineId: column.lineId, machineId: column.id, slotId: slot.id}, !column.isLine)}
                sx={{
                  gridColumn: columnIndex + 3,
                  gridRow: slotIndex + 4,
                  height: V2_ROW_HEIGHT,
                  borderRight: '1px solid var(--planning-border)',
                  borderBottom: slot.hour === 23 ? '2px solid #CBD5E1' : '1px solid #F1F5F9',
                  bgcolor: activeDropTarget === `${column.id}:${slot.id}`
                    ? 'rgba(23, 105, 255, 0.14)'
                    : slotIndex % 2 === 0 ? '#FFFFFF' : '#FAFBFF',
                  outline: activeDropTarget === `${column.id}:${slot.id}` ? '2px solid #1769FF' : 'none',
                  outlineOffset: -2,
                  position: 'relative',
                  transition: 'background-color 0.12s ease, outline-color 0.12s ease',
                }}
              />
            ))}
          </Fragment>
        ))}

        {visibleColumns.map((column, columnIndex) => {
          const machineIds = column.isLine
            ? (lines.find((line) => line.id === column.id)?.machines.map((machine) => machine.id) ?? [])
            : [column.id];

          const woBlocks = getWoBlocksForMachines(machineIds);
          const eventBlocks = getEventBlocksForMachines(machineIds);

          if (woBlocks.length === 0 && eventBlocks.length === 0) return null;

          return (
            <Box
              key={`overlay-${column.id}`}
              sx={{gridColumn: columnIndex + 3, gridRow: `4 / span ${slots.length}`, position: 'relative', pointerEvents: 'none', zIndex: 5, height: totalHeight}}
            >
              <Box sx={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
                {woBlocks.map(({wo, slotIndex, slotCount, laneIndex, laneCount}) => (
                  <WorkOrderVerticalBlock
                    key={wo.id}
                    wo={wo}
                    slotIndex={slotIndex}
                    slotCount={slotCount}
                    rowHeight={V2_ROW_HEIGHT}
                    laneIndex={laneIndex}
                    laneCount={laneCount}
                    isEditMode={isEditMode}
                    onWoDragStart={setDraggingWo}
                    onWoDragEnd={() => { setDraggingWo(null); setDragTargetMachineId(null); }}
                  />
                ))}
                {eventBlocks.map(({event, slotIndex, slotCount, laneIndex, laneCount}) => (
                  <EventVerticalBlock
                    key={event.id}
                    event={event}
                    slotIndex={slotIndex}
                    slotCount={slotCount}
                    rowHeight={V2_ROW_HEIGHT}
                    laneIndex={laneIndex}
                    laneCount={laneCount}
                  />
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
      <WoDragInfoPanel
        visible={draggingWo !== null}
        wo={draggingWo}
        targetMachineId={dragTargetMachineId}
        lines={lines}
        workOrders={workOrders}
        slots={slots}
      />
    </Box>
  );
}
