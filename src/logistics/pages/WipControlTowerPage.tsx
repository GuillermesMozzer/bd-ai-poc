import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import LogisticsPageShell from '../components/LogisticsPageShell';
import KpiRow from '../components/KpiRow';
import PanelCard from '../components/PanelCard';
import LogisticsDrawer, { DrawerSection, DetailList } from '../components/LogisticsDrawer';
import { StatusPill, SeverityPill } from '../components/StatusPill';
import { LOGISTICS_ACCENT } from '../constants';
import { fmtDuration, fmtTime, humanize } from '../utils';
import { lx } from '../themeTokens';
import {
  WIP_LEVELS,
  WIP_PROCESS_STEPS,
  WIP_ROLES,
  WIP_SITES,
  WIP_STATUSES,
  WIP_TYPES_BY_SITE,
  wipMockSeed,
} from '../data/wipMockData';
import type { WipObject, WipRole, WipSite, WipStatus, WipException } from '../types/wip';
import type { WipMockState } from '../data/wipMockData';

function canQuality(role: WipRole) {
  return ['Quality', 'Supervisor', 'Team Lead'].includes(role);
}
function canAdjust(role: WipRole) {
  return ['Supervisor', 'Team Lead', 'Warehouse Operator'].includes(role);
}
function canClose(role: WipRole) {
  return ['Supervisor', 'Team Lead'].includes(role);
}

function siteCode(site: WipSite): string {
  if (site === 'El Paso') return 'EP';
  if (site === 'Sandy') return 'SD';
  return 'CT';
}

function statusTone(status: WipStatus) {
  if (status === 'Available' || status === 'Received' || status === 'Staged') return 'ok' as const;
  if (status === 'Blocked' || status === 'Quarantined') return 'danger' as const;
  if (status === 'Under Quality Review' || status === 'In Transit' || status === 'Created') return 'warn' as const;
  return 'default' as const;
}

function exceptionSeverity(type: WipException['type']) {
  if (type === 'blocked' || type === 'quantity_divergence' || type === 'wrong_location') return 'critical';
  if (type === 'exceeded_dwell' || type === 'stagnant' || type === 'quality_hold') return 'high';
  return 'medium';
}

function nowIso() {
  return new Date().toISOString();
}

function recomputeAvailability(w: WipObject): boolean {
  const hold = ['Blocked', 'Quarantined', 'Under Quality Review', 'Consumed', 'Closed', 'In Transit', 'Shipped'].includes(
    w.status,
  );
  const locOk = w.location.display === w.expected_location.display || w.location.area === w.expected_location.area;
  return !hold && w.quantity > 0 && locOk && Boolean(w.next_step);
}

type CreateForm = {
  site: WipSite;
  wip_type: string;
  level: WipObject['level'];
  lot: string;
  quantity: string;
  location_display: string;
  next_step: string;
  next_location: string;
  production_order: string;
  machine_id: string;
  source_system: WipObject['origin']['source_system'];
};

const emptyCreate = (site: WipSite): CreateForm => ({
  site,
  wip_type: WIP_TYPES_BY_SITE[site][0] ?? '',
  level: 'Level 1',
  lot: '',
  quantity: '',
  location_display: `${site} · `,
  next_step: '',
  next_location: '',
  production_order: '',
  machine_id: '',
  source_system: 'Manual',
});

type ScanResult = {
  wip_id: string;
  action: string;
  detail: string;
  warned?: boolean;
};

const fieldSx = {
  '& .MuiInputBase-root': { bgcolor: lx.soft, color: lx.text },
  '& .MuiInputLabel-root': { color: lx.textMuted },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: lx.border },
};

export default function WipControlTowerPage() {
  const [data, setData] = useState<WipMockState>(() => structuredClone(wipMockSeed) as WipMockState);
  const [tab, setTab] = useState(0);
  const [site, setSite] = useState<WipSite | ''>('');
  const [area, setArea] = useState('');
  const [wipType, setWipType] = useState('');
  const [level, setLevel] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<WipRole>('Warehouse Operator');
  const [selectedWipId, setSelectedWipId] = useState<string | null>(null);
  const [selectedExceptionId, setSelectedExceptionId] = useState<string | null>(null);
  const [snack, setSnack] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>(() => emptyCreate('El Paso'));
  const [scanBarcode, setScanBarcode] = useState('');
  const [scanLocation, setScanLocation] = useState('');
  const [scanQty, setScanQty] = useState('');
  const [qtyConfirm, setQtyConfirm] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [combineIds, setCombineIds] = useState<string[]>([]);
  const [splitQty, setSplitQty] = useState('');
  const [adjustQty, setAdjustQty] = useState('');
  const [excComment, setExcComment] = useState('');
  const [excOwner, setExcOwner] = useState('');
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferTo, setTransferTo] = useState<WipSite>('El Paso');
  const [mapPlant, setMapPlant] = useState<WipSite | ''>('');
  const [plannerMaterial, setPlannerMaterial] = useState('');
  const [plannerLot, setPlannerLot] = useState('');
  const [plannerOrder, setPlannerOrder] = useState('');
  const [plannerStep, setPlannerStep] = useState('');
  const [plannerAvailableOnly, setPlannerAvailableOnly] = useState(true);

  const selected = useMemo(
    () => data.objects.find((o) => o.wip_id === selectedWipId) ?? null,
    [data.objects, selectedWipId],
  );
  const selectedExc = useMemo(
    () => data.exceptions.find((e) => e.exception_id === selectedExceptionId) ?? null,
    [data.exceptions, selectedExceptionId],
  );

  const typeOptions = site ? WIP_TYPES_BY_SITE[site] : Array.from(new Set(Object.values(WIP_TYPES_BY_SITE).flat()));
  const areas = useMemo(() => {
    const set = new Set(data.objects.map((o) => o.location.area));
    return Array.from(set).sort();
  }, [data.objects]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.objects.filter((o) => {
      if (site && o.site !== site) return false;
      if (area && o.location.area !== area) return false;
      if (wipType && o.wip_type !== wipType) return false;
      if (level && o.level !== level) return false;
      if (status && o.status !== status) return false;
      if (q) {
        const hay = `${o.wip_id} ${o.barcode} ${o.lot} ${o.batch ?? ''} ${o.qr_code}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [data.objects, site, area, wipType, level, status, search]);

  const kpis = useMemo(() => {
    const objs = site ? data.objects.filter((o) => o.site === site) : data.objects;
    const blocked = objs.filter((o) => o.status === 'Blocked' || o.status === 'Quarantined').length;
    const transit = objs.filter((o) => o.status === 'In Transit').length;
    const stagnant = objs.filter((o) => o.aging_location_hours > o.expected_dwell_hours).length;
    const openExc = data.exceptions.filter((e) => e.state !== 'resolved').length;
    const available = objs.filter((o) => o.available_for_next).length;
    return { total: objs.length, blocked, transit, stagnant, openExc, available };
  }, [data, site]);

  const agingAvg = useMemo(() => {
    const list = filtered.length ? filtered : data.objects;
    if (!list.length) return { created: 0, location: 0, status: 0 };
    const n = list.length;
    return {
      created: list.reduce((s, o) => s + o.aging_created_hours, 0) / n,
      location: list.reduce((s, o) => s + o.aging_location_hours, 0) / n,
      status: list.reduce((s, o) => s + o.aging_status_hours, 0) / n,
    };
  }, [filtered, data.objects]);

  const stagnantList = useMemo(
    () =>
      [...filtered]
        .filter((o) => o.aging_location_hours > o.expected_dwell_hours)
        .sort((a, b) => b.aging_location_hours - a.aging_location_hours)
        .slice(0, 8),
    [filtered],
  );

  const openExceptions = useMemo(
    () => data.exceptions.filter((e) => e.state !== 'resolved'),
    [data.exceptions],
  );

  const plannerRows = useMemo(() => {
    return data.objects.filter((o) => {
      if (plannerAvailableOnly && !o.available_for_next) return false;
      if (plannerMaterial && !(o.sap?.material_number ?? '').toLowerCase().includes(plannerMaterial.toLowerCase())) {
        return false;
      }
      if (plannerLot && !o.lot.toLowerCase().includes(plannerLot.toLowerCase())) return false;
      if (
        plannerOrder
        && !(o.sap?.production_order ?? o.origin.production_order ?? '')
          .toLowerCase()
          .includes(plannerOrder.toLowerCase())
      ) {
        return false;
      }
      if (plannerStep && o.next_step !== plannerStep) return false;
      return true;
    });
  }, [data.objects, plannerAvailableOnly, plannerMaterial, plannerLot, plannerOrder, plannerStep]);

  const mapZones = useMemo(() => {
    if (!mapPlant) return data.map_zones;
    return data.map_zones.filter((z) => z.plant === mapPlant);
  }, [data.map_zones, mapPlant]);

  function patchWip(wipId: string, fn: (w: WipObject) => WipObject) {
    setData((prev) => ({
      ...prev,
      objects: prev.objects.map((o) => (o.wip_id === wipId ? fn(o) : o)),
    }));
  }

  function pushHistory(w: WipObject, action: WipObject['history'][0]['action'], detail: string, extra: Partial<WipObject['history'][0]> = {}) {
    return [
      {
        at: nowIso(),
        user: data.current_user,
        role,
        action,
        detail,
        ...extra,
      },
      ...w.history,
    ];
  }

  function addException(partial: Omit<WipException, 'exception_id' | 'created_at' | 'comments' | 'age_hours' | 'state'> & Partial<WipException>) {
    const id = `WEX-${String(data.exceptions.length + 1).padStart(3, '0')}`;
    const exc: WipException = {
      exception_id: id,
      age_hours: 0,
      state: 'open',
      comments: [],
      created_at: nowIso(),
      owner: partial.owner ?? data.current_user,
      recommended_next_step: partial.recommended_next_step ?? 'Investigate',
      wip_id: partial.wip_id,
      type: partial.type,
      reason: partial.reason,
      ...partial,
    };
    setData((prev) => ({ ...prev, exceptions: [exc, ...prev.exceptions] }));
    return id;
  }

  function openWip(id: string) {
    setSelectedWipId(id);
    setCombineIds([]);
    setSplitQty('');
    setAdjustQty('');
  }

  function handlePrintLabel(w: WipObject) {
    patchWip(w.wip_id, (cur) => ({
      ...cur,
      history: pushHistory(cur, 'label_printed', 'Label print requested'),
      updated_at: nowIso(),
    }));
    setSnack(
      `Label: ${w.wip_id} | ${w.barcode} | ${w.qr_code} | ${w.wip_type} | Lot ${w.lot} | ${w.quantity} ${w.uom} | ${w.location.display}`,
    );
  }

  function handleCreateSave() {
    const qty = Number(createForm.quantity) || 0;
    const code = siteCode(createForm.site);
    const seq = 24100 + data.objects.filter((o) => o.site === createForm.site).length + 1;
    const wipId = `WIP-${code}-${seq}`;
    const display = createForm.location_display || `${createForm.site} · Manual`;
    const loc = {
      plant: createForm.site,
      area: createForm.location_display.split('·')[1]?.trim() || 'Manual',
      display,
      location_type: 'temporary' as const,
    };
    const created: WipObject = {
      wip_id: wipId,
      barcode: `BC-${wipId}`,
      qr_code: `QR-${wipId}`,
      wip_type: createForm.wip_type,
      level: createForm.level,
      site: createForm.site,
      lot: createForm.lot || `LOT-${Date.now().toString().slice(-6)}`,
      quantity: qty,
      uom: 'EA',
      recorded_quantity: qty,
      location: loc,
      expected_location: { ...loc },
      status: 'Created',
      next_step: createForm.next_step,
      next_location: createForm.next_location,
      available_for_next: false,
      origin: {
        production_area: loc.area,
        machine_id: createForm.machine_id || undefined,
        production_order: createForm.production_order || undefined,
        lot: createForm.lot || `LOT-${Date.now().toString().slice(-6)}`,
        source_system: createForm.source_system,
      },
      aging_created_hours: 0,
      aging_location_hours: 0,
      aging_status_hours: 0,
      expected_dwell_hours: 8,
      owner: data.current_user,
      sap: createForm.production_order
        ? { production_order: createForm.production_order }
        : undefined,
      genealogy: [
        {
          wip_id: wipId,
          relationship: 'self',
          label: `${createForm.wip_type} · ${qty} EA`,
          lot: createForm.lot,
          qty,
        },
      ],
      history: [
        {
          at: nowIso(),
          user: data.current_user,
          role,
          action: 'created',
          detail: `Manual create · ${createForm.source_system}`,
          status_to: 'Created',
        },
      ],
      child_wip_ids: [],
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    created.available_for_next = recomputeAvailability(created);

    const nextActions = [...data.actions];
    if (!createForm.next_step || !createForm.next_location) {
      nextActions.unshift({
        action_id: `WA-${String(data.actions.length + 1).padStart(2, '0')}`,
        wip_id: wipId,
        action_type: 'assign_destination',
        priority: 'high',
        title: `Assign next step for ${wipId}`,
        due_hint: 'This shift',
      });
      addException({
        wip_id: wipId,
        type: 'no_destination',
        reason: 'No next expected step/location assigned',
        recommended_next_step: 'Assign next process step and location',
        owner: data.current_user,
      });
    }

    setData((prev) => ({
      ...prev,
      objects: [created, ...prev.objects],
      actions: nextActions,
    }));
    setCreateOpen(false);
    setCreateForm(emptyCreate(createForm.site));
    setSnack(`Created ${wipId}`);
    openWip(wipId);
  }

  function findScanned(): WipObject | null {
    const q = scanBarcode.trim().toLowerCase();
    if (!q) return null;
    return (
      data.objects.find(
        (o) =>
          o.wip_id.toLowerCase() === q
          || o.barcode.toLowerCase() === q
          || o.qr_code.toLowerCase() === q,
      ) ?? null
    );
  }

  function handleScanAction(action: 'find' | 'move' | 'stage' | 'consume' | 'validate') {
    const w = findScanned();
    if (!w) {
      setScanResult({ wip_id: '—', action, detail: 'No WIP found for barcode', warned: true });
      setSnack('WIP not found');
      return;
    }
    openWip(w.wip_id);
    if (action === 'find') {
      setScanResult({ wip_id: w.wip_id, action: 'find', detail: `Found ${w.wip_type} @ ${w.location.display}` });
      return;
    }

    const locInput = scanLocation.trim();
    const qtyInput = scanQty.trim() === '' ? null : Number(scanQty);
    let warned = false;

    if (locInput && locInput !== w.expected_location.display && !locInput.includes(w.expected_location.area)) {
      warned = true;
      addException({
        wip_id: w.wip_id,
        type: 'wrong_location',
        reason: `Scanned location "${locInput}" vs expected "${w.expected_location.display}"`,
        recommended_next_step: `Move to ${w.expected_location.display}`,
        owner: data.current_user,
      });
      patchWip(w.wip_id, (cur) => ({
        ...cur,
        history: pushHistory(cur, 'exception', `Wrong-location warning: scanned ${locInput}`),
        updated_at: nowIso(),
      }));
    }

    if (qtyInput != null && qtyInput !== w.recorded_quantity) {
      warned = true;
      addException({
        wip_id: w.wip_id,
        type: 'quantity_divergence',
        reason: `Recorded ${w.recorded_quantity} vs scanned ${qtyInput}`,
        recommended_next_step: 'Confirm count and adjust or investigate',
        owner: data.current_user,
      });
      if (!qtyConfirm) {
        setScanResult({
          wip_id: w.wip_id,
          action,
          detail: `Qty divergence (${w.recorded_quantity} vs ${qtyInput}). Confirm checkbox to adjust.`,
          warned: true,
        });
        setSnack('Quantity divergence — confirm to adjust');
        return;
      }
    }

    const nextStatus: WipStatus =
      action === 'stage' ? 'Staged' : action === 'consume' ? 'Consumed' : action === 'move' ? (locInput ? 'Available' : w.status) : w.status;

    patchWip(w.wip_id, (cur) => {
      const next: WipObject = {
        ...cur,
        scanned_quantity: qtyInput ?? cur.scanned_quantity,
        status: action === 'validate' ? cur.status : nextStatus,
        location: locInput
          ? {
              ...cur.location,
              display: locInput,
              area: locInput.split('·')[1]?.trim() || cur.location.area,
            }
          : cur.location,
        quantity:
          qtyInput != null && qtyConfirm && canAdjust(role) ? qtyInput : cur.quantity,
        recorded_quantity:
          qtyInput != null && qtyConfirm && canAdjust(role) ? qtyInput : cur.recorded_quantity,
        history: pushHistory(
          cur,
          action === 'stage' ? 'staged' : action === 'consume' ? 'consumed' : action === 'move' ? 'moved' : 'scanned',
          `${humanize(action)} via scan`,
          {
            from_location: cur.location.display,
            to_location: locInput || cur.location.display,
            status_from: cur.status,
            status_to: action === 'validate' ? cur.status : nextStatus,
          },
        ),
        updated_at: nowIso(),
      };
      if (action === 'consume') {
        next.available_for_next = false;
        next.quantity = 0;
      } else {
        next.available_for_next = recomputeAvailability(next);
      }
      return next;
    });

    setScanResult({
      wip_id: w.wip_id,
      action,
      detail: warned
        ? `Completed with warnings · ${action} → ${nextStatus}`
        : `OK · ${action} → ${nextStatus}`,
      warned,
    });
    setQtyConfirm(false);
    setSnack(`${action} applied to ${w.wip_id}`);
  }

  function applyQuality(next: WipStatus) {
    if (!selected || !canQuality(role)) return;
    const released = next === 'Available';
    patchWip(selected.wip_id, (cur) => {
      const updated: WipObject = {
        ...cur,
        status: next,
        quality_hold_reason: released ? undefined : cur.quality_hold_reason || `Set to ${next}`,
        history: pushHistory(
          cur,
          released ? 'quality_release' : 'quality_block',
          `Quality action → ${next}`,
          { status_from: cur.status, status_to: next },
        ),
        updated_at: nowIso(),
      };
      updated.available_for_next = recomputeAvailability(updated);
      return updated;
    });
    setSnack(`${selected.wip_id} → ${next}`);
  }

  function handleAdjustQty() {
    if (!selected || !canAdjust(role)) return;
    const q = Number(adjustQty);
    if (Number.isNaN(q)) return;
    patchWip(selected.wip_id, (cur) => {
      const updated: WipObject = {
        ...cur,
        quantity: q,
        recorded_quantity: q,
        history: pushHistory(cur, 'quantity_adjust', `Quantity adjusted to ${q} ${cur.uom}`),
        updated_at: nowIso(),
      };
      updated.available_for_next = recomputeAvailability(updated);
      return updated;
    });
    setSnack(`Quantity adjusted on ${selected.wip_id}`);
  }

  function handleClose() {
    if (!selected || !canClose(role)) return;
    patchWip(selected.wip_id, (cur) => ({
      ...cur,
      status: 'Closed',
      available_for_next: false,
      history: pushHistory(cur, 'status_change', 'WIP closed', {
        status_from: cur.status,
        status_to: 'Closed',
      }),
      updated_at: nowIso(),
    }));
    setSnack(`${selected.wip_id} closed`);
  }

  function handleSplit() {
    if (!selected) return;
    const qty = Number(splitQty);
    if (!qty || qty <= 0 || qty >= selected.quantity) {
      setSnack('Enter a valid split quantity less than parent qty');
      return;
    }
    const code = siteCode(selected.site);
    const seq = 25000 + data.objects.length;
    const childId = `WIP-${code}-${seq}`;
    const child: WipObject = {
      ...structuredClone(selected),
      wip_id: childId,
      barcode: `BC-${childId}`,
      qr_code: `QR-${childId}`,
      quantity: qty,
      recorded_quantity: qty,
      status: 'Created',
      available_for_next: false,
      parent_wip_id: selected.wip_id,
      child_wip_ids: [],
      genealogy: [
        { wip_id: childId, relationship: 'self', label: `${selected.wip_type} (split)`, lot: selected.lot, qty },
        {
          wip_id: selected.wip_id,
          relationship: 'upstream',
          label: `${selected.wip_type} parent`,
          lot: selected.lot,
          qty: selected.quantity - qty,
        },
      ],
      history: [
        {
          at: nowIso(),
          user: data.current_user,
          role,
          action: 'split',
          detail: `Split ${qty} ${selected.uom} from ${selected.wip_id}`,
          status_to: 'Created',
        },
      ],
      created_at: nowIso(),
      updated_at: nowIso(),
      aging_created_hours: 0,
      aging_location_hours: 0,
      aging_status_hours: 0,
    };
    setData((prev) => ({
      ...prev,
      objects: [
        child,
        ...prev.objects.map((o) => {
          if (o.wip_id !== selected.wip_id) return o;
          const updated: WipObject = {
            ...o,
            quantity: o.quantity - qty,
            recorded_quantity: o.recorded_quantity - qty,
            child_wip_ids: [...(o.child_wip_ids ?? []), childId],
            genealogy: [
              ...o.genealogy,
              { wip_id: childId, relationship: 'downstream', label: 'Split child', lot: o.lot, qty },
            ],
            history: pushHistory(o, 'split', `Split ${qty} ${o.uom} → ${childId}`),
            updated_at: nowIso(),
          };
          updated.available_for_next = recomputeAvailability(updated);
          return updated;
        }),
      ],
    }));
    setSplitQty('');
    setSnack(`Split created ${childId}`);
    openWip(childId);
  }

  function handleCombine() {
    if (!selected || combineIds.length === 0) {
      setSnack('Select upstream WIP IDs to combine');
      return;
    }
    const upstream = data.objects.filter((o) => combineIds.includes(o.wip_id));
    if (!upstream.length) return;
    const code = siteCode(selected.site);
    const seq = 26000 + data.objects.length;
    const newId = `WIP-${code}-${seq}`;
    const totalQty = upstream.reduce((s, o) => s + o.quantity, 0) + selected.quantity;
    const combined: WipObject = {
      ...structuredClone(selected),
      wip_id: newId,
      barcode: `BC-${newId}`,
      qr_code: `QR-${newId}`,
      level: 'Level 2',
      quantity: totalQty,
      recorded_quantity: totalQty,
      status: 'Created',
      available_for_next: false,
      genealogy: [
        { wip_id: newId, relationship: 'self', label: `${selected.wip_type} combined L2`, lot: selected.lot, qty: totalQty },
        ...[selected, ...upstream].map((o) => ({
          wip_id: o.wip_id,
          relationship: 'upstream' as const,
          label: o.wip_type,
          lot: o.lot,
          qty: o.quantity,
        })),
      ],
      history: [
        {
          at: nowIso(),
          user: data.current_user,
          role,
          action: 'combined',
          detail: `Combined from ${[selected.wip_id, ...combineIds].join(', ')}`,
          status_to: 'Created',
        },
      ],
      created_at: nowIso(),
      updated_at: nowIso(),
      aging_created_hours: 0,
      aging_location_hours: 0,
      aging_status_hours: 0,
      child_wip_ids: [],
    };
    setData((prev) => ({
      ...prev,
      objects: [
        combined,
        ...prev.objects.map((o) => {
          if (![selected.wip_id, ...combineIds].includes(o.wip_id)) return o;
          return {
            ...o,
            status: 'Consumed' as WipStatus,
            available_for_next: false,
            genealogy: [
              ...o.genealogy,
              { wip_id: newId, relationship: 'downstream' as const, label: 'Combined into L2', lot: combined.lot },
            ],
            history: pushHistory(o, 'consumed', `Consumed into combine ${newId}`),
            updated_at: nowIso(),
          };
        }),
      ],
    }));
    setCombineIds([]);
    setSnack(`Combined into ${newId}`);
    openWip(newId);
  }

  function handleConsumeUpstream(upstreamId: string) {
    if (!selected) return;
    patchWip(upstreamId, (cur) => ({
      ...cur,
      status: 'Consumed',
      available_for_next: false,
      quantity: 0,
      genealogy: [
        ...cur.genealogy.filter((g) => g.wip_id !== selected.wip_id),
        { wip_id: selected.wip_id, relationship: 'downstream', label: selected.wip_type, lot: selected.lot },
      ],
      history: pushHistory(cur, 'consumed', `Consumed into ${selected.wip_id}`),
      updated_at: nowIso(),
    }));
    patchWip(selected.wip_id, (cur) => ({
      ...cur,
      genealogy: cur.genealogy.some((g) => g.wip_id === upstreamId)
        ? cur.genealogy
        : [...cur.genealogy, { wip_id: upstreamId, relationship: 'upstream', label: 'Consumed input', lot: '' }],
      history: pushHistory(cur, 'consumed', `Consumed upstream ${upstreamId}`),
      updated_at: nowIso(),
    }));
    setSnack(`Consumed ${upstreamId} into ${selected.wip_id}`);
  }

  function resolveException(id: string) {
    setData((prev) => ({
      ...prev,
      exceptions: prev.exceptions.map((e) =>
        e.exception_id === id
          ? { ...e, state: 'resolved' as const, resolved_at: nowIso() }
          : e,
      ),
    }));
    setSnack(`${id} resolved`);
  }

  function assignException(id: string) {
    setData((prev) => ({
      ...prev,
      exceptions: prev.exceptions.map((e) =>
        e.exception_id === id
          ? {
              ...e,
              state: 'assigned' as const,
              owner: excOwner || data.current_user,
              comments: excComment
                ? [{ at: nowIso(), user: data.current_user, text: excComment }, ...e.comments]
                : e.comments,
            }
          : e,
      ),
    }));
    setExcComment('');
    setSnack(`${id} assigned`);
  }

  function receiveTransfer(transferId: string) {
    const xfer = data.transfers.find((t) => t.transfer_id === transferId);
    if (!xfer || xfer.status !== 'In Transit') return;
    const recvLoc = {
      plant: 'El Paso' as WipSite,
      area: 'Receiving',
      display: 'El Paso · Receiving · DOCK-RM-02',
      location_type: 'staging' as const,
      staging_zone: 'DOCK-RM-02',
    };
    setData((prev) => ({
      ...prev,
      transfers: prev.transfers.map((t) =>
        t.transfer_id === transferId ? { ...t, status: 'Received' as const } : t,
      ),
      objects: prev.objects.map((o) => {
        if (!xfer.wip_ids.includes(o.wip_id)) return o;
        const updated: WipObject = {
          ...o,
          site: 'El Paso',
          status: 'Received',
          location: recvLoc,
          expected_location: recvLoc,
          history: pushHistory(o, 'received', `Received transfer ${transferId} at El Paso receiving`, {
            status_from: o.status,
            status_to: 'Received',
            to_location: recvLoc.display,
          }),
          updated_at: nowIso(),
        };
        updated.available_for_next = recomputeAvailability(updated);
        return updated;
      }),
    }));
    setSnack(`Received ${transferId}`);
  }

  function createTransfer() {
    if (!selectedWipId) {
      setSnack('Select an available WIP first');
      return;
    }
    const w = data.objects.find((o) => o.wip_id === selectedWipId);
    if (!w || !w.available_for_next) {
      setSnack('Selected WIP must be available for next process');
      return;
    }
    const id = `XFER-${siteCode(w.site)}-${siteCode(transferTo)}-${String(data.transfers.length + 10).padStart(3, '0')}`;
    setData((prev) => ({
      ...prev,
      transfers: [
        {
          transfer_id: id,
          from_site: w.site,
          to_site: transferTo,
          wip_ids: [w.wip_id],
          status: 'Created',
          created_at: nowIso(),
          eta: nowIso(),
        },
        ...prev.transfers,
      ],
      objects: prev.objects.map((o) =>
        o.wip_id === w.wip_id
          ? {
              ...o,
              transfer_id: id,
              next_step: 'Shipping to another site',
              history: pushHistory(o, 'status_change', `Transfer ${id} created to ${transferTo}`),
              updated_at: nowIso(),
            }
          : o,
      ),
    }));
    setTransferOpen(false);
    setSnack(`Transfer ${id} created`);
  }

  function clickZone(zoneArea: string, plant: WipSite) {
    setSite(plant);
    setArea(zoneArea);
    setTab(1);
  }

  const availabilityItems = selected
    ? [
        {
          label: 'Status OK',
          value: !['Blocked', 'Quarantined', 'Under Quality Review', 'Consumed', 'Closed'].includes(selected.status)
            ? 'Yes'
            : 'No',
        },
        { label: 'Quality hold', value: selected.quality_hold_reason ? 'Hold active' : 'None' },
        { label: 'Qty > 0', value: selected.quantity > 0 ? 'Yes' : 'No' },
        {
          label: 'Location match',
          value: selected.location.display === selected.expected_location.display ? 'Match' : 'Mismatch',
        },
        { label: 'Available for next', value: selected.available_for_next ? 'Yes' : 'No' },
      ]
    : [];

  const filtersRow = (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
      <TextField select size="small" label="Site" value={site} onChange={(e) => { setSite(e.target.value as WipSite | ''); setWipType(''); }} sx={{ minWidth: 140, ...fieldSx }}>
        <MenuItem value="">All sites</MenuItem>
        {WIP_SITES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
      </TextField>
      <TextField select size="small" label="Area" value={area} onChange={(e) => setArea(e.target.value)} sx={{ minWidth: 140, ...fieldSx }}>
        <MenuItem value="">All areas</MenuItem>
        {areas.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
      </TextField>
      <TextField select size="small" label="Type" value={wipType} onChange={(e) => setWipType(e.target.value)} sx={{ minWidth: 160, ...fieldSx }}>
        <MenuItem value="">All types</MenuItem>
        {typeOptions.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
      </TextField>
      <TextField select size="small" label="Level" value={level} onChange={(e) => setLevel(e.target.value)} sx={{ minWidth: 120, ...fieldSx }}>
        <MenuItem value="">All</MenuItem>
        {WIP_LEVELS.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
      </TextField>
      <TextField select size="small" label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 160, ...fieldSx }}>
        <MenuItem value="">All</MenuItem>
        {WIP_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
      </TextField>
      <TextField
        size="small"
        label="Search ID / barcode / lot"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ minWidth: 220, flex: 1, ...fieldSx }}
      />
    </Stack>
  );

  return (
    <LogisticsPageShell
      title="WIP Control Tower"
      subtitle="Level 2 · IN02 + WIP — supply, genealogy, exceptions"
      asOf={data.as_of}
      banner="Drill-down from Logistics Control Tower macroflows IN02 / WIP."
      toolbar={
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <TextField
            select
            size="small"
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as WipRole)}
            sx={{ minWidth: 180, ...fieldSx }}
          >
            {WIP_ROLES.map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Site"
            value={site}
            onChange={(e) => { setSite(e.target.value as WipSite | ''); setWipType(''); }}
            sx={{ minWidth: 130, ...fieldSx }}
          >
            <MenuItem value="">All</MenuItem>
            {WIP_SITES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
        </Stack>
      }
    >
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2,
          borderBottom: `1px solid ${lx.divider}`,
          '& .MuiTab-root': { color: lx.textMuted, fontWeight: 700, textTransform: 'none' },
          '& .Mui-selected': { color: LOGISTICS_ACCENT },
          '& .MuiTabs-indicator': { bgcolor: LOGISTICS_ACCENT },
        }}
      >
        <Tab label="Dashboard" />
        <Tab label="Inventory" />
        <Tab label="Exceptions / Actions" />
        <Tab label="Scan / Move" />
        <Tab label="Location map" />
        <Tab label="Transfers" />
        <Tab label="Planner" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <KpiRow
            items={[
              { label: 'Total WIP objects', value: kpis.total },
              { label: 'Blocked / quarantined', value: kpis.blocked, tone: 'danger' },
              { label: 'In transit', value: kpis.transit, tone: 'warn' },
              { label: 'Stagnant (aging > dwell)', value: kpis.stagnant, tone: 'warn' },
              { label: 'Exceptions open', value: kpis.openExc, tone: 'danger' },
              { label: 'Available for next', value: kpis.available, tone: 'ok' },
            ]}
          />
          {filtersRow}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {[
              { label: 'Avg aging since created', hours: agingAvg.created },
              { label: 'Avg aging in location', hours: agingAvg.location },
              { label: 'Avg aging in status', hours: agingAvg.status },
            ].map((card) => (
              <Grid size={{ xs: 12, md: 4 }} key={card.label}>
                <Paper elevation={0} sx={{ p: 2, border: `1px solid ${lx.border}`, borderRadius: 2, bgcolor: lx.soft }}>
                  <Typography variant="caption" sx={{ color: lx.textMuted, fontWeight: 700 }}>{card.label}</Typography>
                  <Typography variant="h5" sx={{ color: lx.text, fontWeight: 800, mt: 0.5 }}>
                    {fmtDuration(card.hours * 60)}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, (card.hours / 48) * 100)}
                    sx={{ mt: 1.5, height: 6, borderRadius: 3, bgcolor: lx.chipBg, '& .MuiLinearProgress-bar': { bgcolor: LOGISTICS_ACCENT } }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
          <PanelCard title="Top stagnant WIP">
            <Stack spacing={1}>
              {stagnantList.length === 0 ? (
                <Typography variant="body2" sx={{ color: lx.textMuted }}>No stagnant WIP matching filters.</Typography>
              ) : (
                stagnantList.map((o) => (
                  <Paper
                    key={o.wip_id}
                    elevation={0}
                    onClick={() => openWip(o.wip_id)}
                    sx={{
                      p: 1.5,
                      border: `1px solid ${lx.border}`,
                      borderRadius: 2,
                      cursor: 'pointer',
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: lx.hover },
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                      <Box>
                        <Typography sx={{ fontWeight: 800, color: lx.text }}>{o.wip_id}</Typography>
                        <Typography variant="caption" sx={{ color: lx.textMuted }}>
                          {o.wip_type} · {o.location.display}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <StatusPill label={o.status} tone={statusTone(o.status)} />
                        <Chip
                          size="small"
                          label={`${fmtDuration(o.aging_location_hours * 60)} / ${fmtDuration(o.expected_dwell_hours * 60)}`}
                          sx={{ bgcolor: lx.warnSoft, color: lx.warn, border: `1px solid ${lx.border}`, fontWeight: 700 }}
                        />
                      </Stack>
                    </Stack>
                  </Paper>
                ))
              )}
            </Stack>
          </PanelCard>
        </Box>
      )}

      {tab === 1 && (
        <Box>
          {filtersRow}
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
            <Button
              variant="contained"
              onClick={() => { setCreateForm(emptyCreate((site || 'El Paso') as WipSite)); setCreateOpen(true); }}
              sx={{ bgcolor: LOGISTICS_ACCENT, fontWeight: 700 }}
            >
              Create WIP
            </Button>
            <Button
              variant="outlined"
              disabled={!selected}
              onClick={() => selected && handlePrintLabel(selected)}
              sx={{ borderColor: lx.border, color: lx.text, fontWeight: 700 }}
            >
              Print label
            </Button>
          </Stack>
          <PanelCard title={`Inventory (${filtered.length})`}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['ID', 'Type', 'Level', 'Site', 'Lot', 'Qty', 'Location', 'Status', 'Next step', 'Available', 'Aging loc'].map((h) => (
                      <TableCell key={h} sx={{ color: lx.textMuted, fontWeight: 800 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((o) => (
                    <TableRow
                      key={o.wip_id}
                      hover
                      selected={selectedWipId === o.wip_id}
                      onClick={() => openWip(o.wip_id)}
                      sx={{ cursor: 'pointer', '& td': { color: lx.text } }}
                    >
                      <TableCell sx={{ fontWeight: 700 }}>{o.wip_id}</TableCell>
                      <TableCell>{o.wip_type}</TableCell>
                      <TableCell>{o.level}</TableCell>
                      <TableCell>{o.site}</TableCell>
                      <TableCell>{o.lot}</TableCell>
                      <TableCell>{o.quantity} {o.uom}</TableCell>
                      <TableCell>{o.location.display}</TableCell>
                      <TableCell><StatusPill label={o.status} tone={statusTone(o.status)} /></TableCell>
                      <TableCell>{o.next_step || '—'}</TableCell>
                      <TableCell>
                        <StatusPill label={o.available_for_next ? 'Yes' : 'No'} tone={o.available_for_next ? 'ok' : 'default'} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: o.aging_location_hours > o.expected_dwell_hours ? lx.warn : lx.text, fontWeight: 700 }}>
                          {fmtDuration(o.aging_location_hours * 60)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </PanelCard>
        </Box>
      )}

      {tab === 2 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <PanelCard title={`Exceptions (${openExceptions.length} open)`}>
              <Stack spacing={1}>
                {data.exceptions.map((e) => (
                  <Paper
                    key={e.exception_id}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      border: `1px solid ${selectedExceptionId === e.exception_id ? LOGISTICS_ACCENT : lx.border}`,
                      borderRadius: 2,
                      bgcolor: selectedExceptionId === e.exception_id ? lx.accentSoft : 'background.paper',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedExceptionId(e.exception_id)}
                  >
                    <Stack direction="row" justifyContent="space-between" spacing={1}>
                      <Typography sx={{ fontWeight: 800, color: lx.text }}>{e.exception_id}</Typography>
                      <Stack direction="row" spacing={0.5}>
                        <SeverityPill severity={exceptionSeverity(e.type)} />
                        <StatusPill
                          label={e.state}
                          tone={e.state === 'resolved' ? 'ok' : e.state === 'assigned' ? 'warn' : 'danger'}
                        />
                      </Stack>
                    </Stack>
                    <Typography variant="body2" sx={{ color: lx.textMuted, mt: 0.5 }}>
                      {humanize(e.type)} · age {fmtDuration(e.age_hours * 60)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: lx.text, mt: 0.5 }}>{e.reason}</Typography>
                    <Button
                      size="small"
                      onClick={(ev) => { ev.stopPropagation(); openWip(e.wip_id); }}
                      sx={{ mt: 0.5, color: LOGISTICS_ACCENT, fontWeight: 700 }}
                    >
                      {e.wip_id}
                    </Button>
                  </Paper>
                ))}
              </Stack>
              {selectedExc && selectedExc.state !== 'resolved' && (
                <Box sx={{ mt: 2, p: 1.5, border: `1px solid ${lx.border}`, borderRadius: 2, bgcolor: lx.soft }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: lx.text, mb: 1 }}>
                    Act on {selectedExc.exception_id}
                  </Typography>
                  <Stack spacing={1}>
                    <TextField size="small" label="Assign owner" value={excOwner} onChange={(e) => setExcOwner(e.target.value)} sx={fieldSx} />
                    <TextField size="small" label="Comment" value={excComment} onChange={(e) => setExcComment(e.target.value)} multiline minRows={2} sx={fieldSx} />
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" onClick={() => assignException(selectedExc.exception_id)} sx={{ borderColor: lx.border, color: lx.text, fontWeight: 700 }}>
                        Assign
                      </Button>
                      <Button variant="contained" onClick={() => resolveException(selectedExc.exception_id)} sx={{ bgcolor: lx.ok, fontWeight: 700 }}>
                        Resolve
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              )}
            </PanelCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <PanelCard title="Action queue">
              <Stack spacing={1}>
                {data.actions.map((a) => (
                  <Paper
                    key={a.action_id}
                    elevation={0}
                    sx={{ p: 1.5, border: `1px solid ${lx.border}`, borderRadius: 2, cursor: 'pointer' }}
                    onClick={() => openWip(a.wip_id)}
                  >
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ fontWeight: 800, color: lx.text }}>{a.title}</Typography>
                      <SeverityPill severity={a.priority === 'normal' ? 'low' : a.priority} />
                    </Stack>
                    <Typography variant="caption" sx={{ color: lx.textMuted }}>
                      {a.wip_id} · {humanize(a.action_type)} · due {a.due_hint}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </PanelCard>
          </Grid>
        </Grid>
      )}

      {tab === 3 && (
        <Box sx={{ maxWidth: 520, mx: 'auto' }}>
          <PanelCard title="Scan / Move">
            <Stack spacing={2}>
              <TextField
                label="Barcode / WIP ID / QR"
                value={scanBarcode}
                onChange={(e) => setScanBarcode(e.target.value)}
                fullWidth
                InputProps={{ sx: { fontSize: 22, fontWeight: 700, py: 1 } }}
                sx={fieldSx}
              />
              <TextField
                label="Scan location"
                value={scanLocation}
                onChange={(e) => setScanLocation(e.target.value)}
                fullWidth
                placeholder="e.g. El Paso · Assembly · LINE-03 · STG-A"
                sx={fieldSx}
              />
              <TextField
                label="Quantity"
                value={scanQty}
                onChange={(e) => setScanQty(e.target.value)}
                type="number"
                fullWidth
                sx={fieldSx}
              />
              <FormControlLabel
                control={<Checkbox checked={qtyConfirm} onChange={(e) => setQtyConfirm(e.target.checked)} sx={{ color: lx.textMuted }} />}
                label={<Typography variant="body2" sx={{ color: lx.text }}>Confirm quantity adjust on divergence</Typography>}
              />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {(['find', 'move', 'stage', 'consume', 'validate'] as const).map((a) => (
                  <Button
                    key={a}
                    variant={a === 'find' ? 'outlined' : 'contained'}
                    onClick={() => handleScanAction(a)}
                    sx={{
                      fontWeight: 800,
                      textTransform: 'capitalize',
                      ...(a === 'find'
                        ? { borderColor: lx.border, color: lx.text }
                        : { bgcolor: a === 'consume' ? lx.danger : LOGISTICS_ACCENT }),
                    }}
                  >
                    {a}
                  </Button>
                ))}
              </Stack>
              {scanResult && (
                <Alert
                  severity={scanResult.warned ? 'warning' : 'success'}
                  sx={{
                    borderRadius: 2,
                    bgcolor: scanResult.warned ? lx.warnSoft : lx.okSoft,
                    color: lx.text,
                    border: `1px solid ${lx.border}`,
                  }}
                >
                  <Typography sx={{ fontWeight: 800 }}>{scanResult.wip_id} · {scanResult.action}</Typography>
                  <Typography variant="body2">{scanResult.detail}</Typography>
                </Alert>
              )}
            </Stack>
          </PanelCard>
        </Box>
      )}

      {tab === 4 && (
        <Box>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={mapPlant || 'all'}
              onChange={(_, v) => setMapPlant(!v || v === 'all' ? '' : (v as WipSite))}
            >
              <ToggleButton value="all" sx={{ color: lx.text, borderColor: lx.border }}>All plants</ToggleButton>
              {WIP_SITES.map((s) => (
                <ToggleButton key={s} value={s} sx={{ color: lx.text, borderColor: lx.border }}>{s}</ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>
          <Grid container spacing={2}>
            {mapZones.map((z) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={z.zone_id}>
                <Paper
                  elevation={0}
                  onClick={() => clickZone(z.area, z.plant)}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${lx.border}`,
                    bgcolor: z.blocked_count ? lx.dangerSoft : lx.soft,
                    cursor: 'pointer',
                    minHeight: 140,
                    '&:hover': { borderColor: LOGISTICS_ACCENT },
                  }}
                >
                  <Typography variant="overline" sx={{ color: lx.textMuted, fontWeight: 800 }}>{z.plant}</Typography>
                  <Typography variant="h6" sx={{ color: lx.text, fontWeight: 800 }}>{z.label}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
                    <Chip size="small" label={`${z.wip_count} WIP`} sx={{ bgcolor: lx.chipBg, color: lx.text, fontWeight: 700 }} />
                    <Chip size="small" label={`${z.blocked_count} blocked`} sx={{ bgcolor: z.blocked_count ? lx.dangerSoft : lx.chipBg, color: z.blocked_count ? lx.danger : lx.text, fontWeight: 700 }} />
                    <Chip size="small" label={`max aging ${fmtDuration(z.aging_max_hours * 60)}`} sx={{ bgcolor: lx.warnSoft, color: lx.warn, fontWeight: 700 }} />
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {tab === 5 && (
        <Box>
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
            <Button
              variant="contained"
              onClick={() => setTransferOpen(true)}
              sx={{ bgcolor: LOGISTICS_ACCENT, fontWeight: 700 }}
            >
              Create transfer from selected
            </Button>
          </Stack>
          <PanelCard title="Inter-site transfers">
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['Transfer', 'From', 'To', 'WIP IDs', 'Status', 'SAP shipment', 'ETA', ''].map((h) => (
                      <TableCell key={h || 'act'} sx={{ color: lx.textMuted, fontWeight: 800 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.transfers.map((t) => (
                    <TableRow key={t.transfer_id} sx={{ '& td': { color: lx.text } }}>
                      <TableCell sx={{ fontWeight: 700 }}>{t.transfer_id}</TableCell>
                      <TableCell>{t.from_site}</TableCell>
                      <TableCell>{t.to_site}</TableCell>
                      <TableCell>
                        {t.wip_ids.map((id) => (
                          <Button key={id} size="small" onClick={() => openWip(id)} sx={{ color: LOGISTICS_ACCENT, fontWeight: 700 }}>
                            {id}
                          </Button>
                        ))}
                      </TableCell>
                      <TableCell>
                        <StatusPill
                          label={t.status}
                          tone={t.status === 'Received' ? 'ok' : t.status === 'In Transit' ? 'warn' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{t.sap_shipment || '—'}</TableCell>
                      <TableCell>{fmtTime(t.eta)}</TableCell>
                      <TableCell>
                        {t.status === 'In Transit' && (
                          <Button size="small" variant="contained" onClick={() => receiveTransfer(t.transfer_id)} sx={{ bgcolor: lx.ok, fontWeight: 700 }}>
                            Receive transfer
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </PanelCard>
        </Box>
      )}

      {tab === 6 && (
        <Box>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
            <TextField size="small" label="Material #" value={plannerMaterial} onChange={(e) => setPlannerMaterial(e.target.value)} sx={{ minWidth: 140, ...fieldSx }} />
            <TextField size="small" label="Lot" value={plannerLot} onChange={(e) => setPlannerLot(e.target.value)} sx={{ minWidth: 140, ...fieldSx }} />
            <TextField size="small" label="Order" value={plannerOrder} onChange={(e) => setPlannerOrder(e.target.value)} sx={{ minWidth: 140, ...fieldSx }} />
            <TextField select size="small" label="Next step" value={plannerStep} onChange={(e) => setPlannerStep(e.target.value)} sx={{ minWidth: 160, ...fieldSx }}>
              <MenuItem value="">All</MenuItem>
              {WIP_PROCESS_STEPS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <FormControlLabel
              control={<Checkbox checked={plannerAvailableOnly} onChange={(e) => setPlannerAvailableOnly(e.target.checked)} sx={{ color: lx.textMuted }} />}
              label={<Typography variant="body2" sx={{ color: lx.text }}>Available for next only</Typography>}
            />
          </Stack>
          <PanelCard title={`Planner board (${plannerRows.length})`}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['WIP', 'Material', 'Lot', 'Order', 'Qty', 'Status', 'Next step', 'Location', 'Available'].map((h) => (
                      <TableCell key={h} sx={{ color: lx.textMuted, fontWeight: 800 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {plannerRows.map((o) => (
                    <TableRow key={o.wip_id} hover onClick={() => openWip(o.wip_id)} sx={{ cursor: 'pointer', '& td': { color: lx.text } }}>
                      <TableCell sx={{ fontWeight: 700 }}>{o.wip_id}</TableCell>
                      <TableCell>{o.sap?.material_number || '—'}</TableCell>
                      <TableCell>{o.lot}</TableCell>
                      <TableCell>{o.sap?.production_order || o.origin.production_order || '—'}</TableCell>
                      <TableCell>{o.quantity}</TableCell>
                      <TableCell><StatusPill label={o.status} tone={statusTone(o.status)} /></TableCell>
                      <TableCell>{o.next_step || '—'}</TableCell>
                      <TableCell>{o.location.display}</TableCell>
                      <TableCell>{o.available_for_next ? 'Yes' : 'No'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </PanelCard>
        </Box>
      )}

      <LogisticsDrawer
        open={Boolean(selected)}
        onClose={() => setSelectedWipId(null)}
        title={selected?.wip_id ?? 'WIP'}
        subtitle={selected ? `${selected.wip_type} · ${selected.site}` : undefined}
        width={520}
      >
        {selected && (
          <Stack spacing={0}>
            <DrawerSection title="Status">
              <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                <StatusPill label={selected.status} tone={statusTone(selected.status)} />
                <Chip size="small" label={selected.level} sx={{ bgcolor: lx.chipBg, color: lx.text, fontWeight: 700 }} />
                <Chip size="small" label={selected.site} sx={{ bgcolor: lx.chipBg, color: lx.text, fontWeight: 700 }} />
                <StatusPill label={selected.available_for_next ? 'Available next' : 'Not available'} tone={selected.available_for_next ? 'ok' : 'warn'} />
              </Stack>
            </DrawerSection>

            <DrawerSection title="Identity">
              <DetailList
                items={[
                  { label: 'WIP ID', value: selected.wip_id },
                  { label: 'Barcode', value: selected.barcode },
                  { label: 'QR', value: selected.qr_code },
                  { label: 'Type', value: selected.wip_type },
                  { label: 'Lot', value: selected.lot },
                  { label: 'Batch', value: selected.batch || '—' },
                  { label: 'Qty', value: `${selected.quantity} ${selected.uom}` },
                ]}
              />
            </DrawerSection>

            <DrawerSection title="Origin">
              <DetailList
                items={[
                  { label: 'Area', value: selected.origin.production_area },
                  { label: 'Machine', value: selected.origin.machine_id || '—' },
                  { label: 'PO', value: selected.origin.production_order || '—' },
                  { label: 'Batch', value: selected.origin.batch || '—' },
                  { label: 'Lot', value: selected.origin.lot },
                  { label: 'Source material', value: selected.origin.source_material || '—' },
                  { label: 'Source system', value: selected.origin.source_system },
                ]}
              />
            </DrawerSection>

            <DrawerSection title="Location & next">
              <DetailList
                items={[
                  { label: 'Current', value: selected.location.display },
                  { label: 'Expected', value: selected.expected_location.display },
                  { label: 'Next step', value: selected.next_step || '—' },
                  { label: 'Next location', value: selected.next_location || '—' },
                ]}
              />
            </DrawerSection>

            <DrawerSection title="Aging">
              <DetailList
                items={[
                  { label: 'Since created', value: fmtDuration(selected.aging_created_hours * 60) },
                  { label: 'In location', value: fmtDuration(selected.aging_location_hours * 60) },
                  { label: 'In status', value: fmtDuration(selected.aging_status_hours * 60) },
                  { label: 'Expected dwell', value: fmtDuration(selected.expected_dwell_hours * 60) },
                ]}
              />
              {selected.aging_location_hours > selected.expected_dwell_hours && (
                <Alert severity="warning" sx={{ mt: 1, bgcolor: lx.warnSoft, color: lx.text }}>
                  Location dwell exceeded expected dwell
                </Alert>
              )}
            </DrawerSection>

            <DrawerSection title="SAP / Datalan">
              <DetailList
                items={[
                  { label: 'PO', value: selected.sap?.production_order || '—' },
                  { label: 'Material', value: selected.sap?.material_number || '—' },
                  { label: 'Batch', value: selected.sap?.batch || '—' },
                  { label: 'WH loc', value: selected.sap?.warehouse_location || '—' },
                  { label: 'Shipment', value: selected.sap?.shipment_number || '—' },
                  { label: 'Datalan', value: selected.datalan_ref || '—' },
                ]}
              />
            </DrawerSection>

            <DrawerSection title="Availability rationale">
              <DetailList items={availabilityItems} />
            </DrawerSection>

            <DrawerSection title="Genealogy">
              <Stack spacing={0.8}>
                {selected.genealogy.map((g) => (
                  <Paper key={`${g.relationship}-${g.wip_id}`} elevation={0} sx={{ p: 1, border: `1px solid ${lx.border}`, borderRadius: 1.5, bgcolor: lx.soft }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="caption" sx={{ color: lx.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>
                          {g.relationship}
                        </Typography>
                        <Typography sx={{ color: lx.text, fontWeight: 700 }}>{g.wip_id}</Typography>
                        <Typography variant="caption" sx={{ color: lx.textMuted }}>{g.label}</Typography>
                      </Box>
                      {g.relationship === 'upstream' && g.wip_id !== selected.wip_id && (
                        <Stack direction="row" spacing={0.5}>
                          <Checkbox
                            size="small"
                            checked={combineIds.includes(g.wip_id)}
                            onChange={(e) => {
                              setCombineIds((prev) =>
                                e.target.checked ? [...prev, g.wip_id] : prev.filter((id) => id !== g.wip_id),
                              );
                            }}
                            sx={{ color: lx.textMuted }}
                          />
                          <Button size="small" onClick={() => handleConsumeUpstream(g.wip_id)} sx={{ color: lx.danger, fontWeight: 700 }}>
                            Consume
                          </Button>
                          <Button size="small" onClick={() => openWip(g.wip_id)} sx={{ color: LOGISTICS_ACCENT, fontWeight: 700 }}>
                            Open
                          </Button>
                        </Stack>
                      )}
                      {g.relationship === 'downstream' && g.wip_id !== selected.wip_id && (
                        <Button size="small" onClick={() => openWip(g.wip_id)} sx={{ color: LOGISTICS_ACCENT, fontWeight: 700 }}>
                          Open
                        </Button>
                      )}
                    </Stack>
                  </Paper>
                ))}
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
                <Button variant="outlined" size="small" onClick={handleCombine} sx={{ borderColor: lx.border, color: lx.text, fontWeight: 700 }}>
                  Combine selected upstream → L2
                </Button>
                <TextField
                  size="small"
                  label="Split qty"
                  value={splitQty}
                  onChange={(e) => setSplitQty(e.target.value)}
                  type="number"
                  sx={{ width: 110, ...fieldSx }}
                />
                <Button variant="outlined" size="small" onClick={handleSplit} sx={{ borderColor: lx.border, color: lx.text, fontWeight: 700 }}>
                  Split
                </Button>
              </Stack>
            </DrawerSection>

            {canQuality(role) && (
              <DrawerSection title="Quality actions">
                <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                  {([
                    ['Blocked', 'Block'],
                    ['Quarantined', 'Quarantine'],
                    ['Under Quality Review', 'Under Review'],
                    ['Available', 'Release'],
                    ['Closed', 'Reject'],
                  ] as [WipStatus, string][]).map(([st, label]) => (
                    <Button
                      key={st}
                      size="small"
                      variant="outlined"
                      onClick={() => applyQuality(label === 'Reject' ? 'Blocked' : st)}
                      sx={{
                        borderColor: lx.border,
                        color: st === 'Available' ? lx.ok : st === 'Blocked' || label === 'Reject' ? lx.danger : lx.text,
                        fontWeight: 700,
                      }}
                    >
                      {label}
                    </Button>
                  ))}
                </Stack>
              </DrawerSection>
            )}

            <DrawerSection title="History">
              <Stack spacing={1} sx={{ maxHeight: 240, overflow: 'auto' }}>
                {selected.history.map((h, idx) => (
                  <Box key={`${h.at}-${idx}`} sx={{ pl: 1.5, borderLeft: `3px solid ${LOGISTICS_ACCENT}` }}>
                    <Typography variant="caption" sx={{ color: lx.textMuted, fontWeight: 700 }}>
                      {fmtTime(h.at)} · {h.user} · {h.role}
                    </Typography>
                    <Typography variant="body2" sx={{ color: lx.text, fontWeight: 700 }}>
                      {humanize(h.action)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: lx.textMuted }}>{h.detail}</Typography>
                  </Box>
                ))}
              </Stack>
            </DrawerSection>

            <Divider sx={{ my: 2, borderColor: lx.divider }} />

            <Stack spacing={1}>
              <Button variant="contained" onClick={() => handlePrintLabel(selected)} sx={{ bgcolor: LOGISTICS_ACCENT, fontWeight: 700 }}>
                Print label
              </Button>
              {canAdjust(role) && (
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    label="Adjust qty"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    type="number"
                    sx={{ flex: 1, ...fieldSx }}
                  />
                  <Button variant="outlined" onClick={handleAdjustQty} sx={{ borderColor: lx.border, color: lx.text, fontWeight: 700 }}>
                    Adjust
                  </Button>
                </Stack>
              )}
              {canClose(role) && (
                <Button variant="outlined" onClick={handleClose} sx={{ borderColor: lx.danger, color: lx.danger, fontWeight: 700 }}>
                  Close WIP
                </Button>
              )}
            </Stack>
          </Stack>
        )}
      </LogisticsDrawer>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: lx.text, fontWeight: 800 }}>Create WIP object</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              select
              label="Site"
              value={createForm.site}
              onChange={(e) => {
                const s = e.target.value as WipSite;
                setCreateForm((f) => ({
                  ...f,
                  site: s,
                  wip_type: WIP_TYPES_BY_SITE[s][0],
                  location_display: `${s} · `,
                }));
              }}
              sx={fieldSx}
            >
              {WIP_SITES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <TextField
              select
              label="Type"
              value={createForm.wip_type}
              onChange={(e) => setCreateForm((f) => ({ ...f, wip_type: e.target.value }))}
              sx={fieldSx}
            >
              {WIP_TYPES_BY_SITE[createForm.site].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <TextField
              select
              label="Level"
              value={createForm.level}
              onChange={(e) => setCreateForm((f) => ({ ...f, level: e.target.value as WipObject['level'] }))}
              sx={fieldSx}
            >
              {WIP_LEVELS.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
            </TextField>
            <TextField label="Lot" value={createForm.lot} onChange={(e) => setCreateForm((f) => ({ ...f, lot: e.target.value }))} sx={fieldSx} />
            <TextField label="Quantity" type="number" value={createForm.quantity} onChange={(e) => setCreateForm((f) => ({ ...f, quantity: e.target.value }))} sx={fieldSx} />
            <TextField label="Location display" value={createForm.location_display} onChange={(e) => setCreateForm((f) => ({ ...f, location_display: e.target.value }))} sx={fieldSx} />
            <TextField
              select
              label="Next step"
              value={createForm.next_step}
              onChange={(e) => setCreateForm((f) => ({ ...f, next_step: e.target.value }))}
              sx={fieldSx}
            >
              <MenuItem value="">—</MenuItem>
              {WIP_PROCESS_STEPS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <TextField label="Next location" value={createForm.next_location} onChange={(e) => setCreateForm((f) => ({ ...f, next_location: e.target.value }))} sx={fieldSx} />
            <TextField label="Production order" value={createForm.production_order} onChange={(e) => setCreateForm((f) => ({ ...f, production_order: e.target.value }))} sx={fieldSx} />
            <TextField label="Machine" value={createForm.machine_id} onChange={(e) => setCreateForm((f) => ({ ...f, machine_id: e.target.value }))} sx={fieldSx} />
            <TextField
              select
              label="Source system"
              value={createForm.source_system}
              onChange={(e) => setCreateForm((f) => ({ ...f, source_system: e.target.value as CreateForm['source_system'] }))}
              sx={fieldSx}
            >
              {['Manual', 'SAP', 'Datalan', 'Logistics'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ color: lx.textMuted }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateSave} sx={{ bgcolor: LOGISTICS_ACCENT, fontWeight: 700 }}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={transferOpen} onClose={() => setTransferOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: lx.text, fontWeight: 800 }}>Create transfer</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: lx.textMuted, mb: 1.5 }}>
            From selected: {selectedWipId || 'none'}
          </Typography>
          <TextField
            select
            fullWidth
            label="To site"
            value={transferTo}
            onChange={(e) => setTransferTo(e.target.value as WipSite)}
            sx={fieldSx}
          >
            {WIP_SITES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setTransferOpen(false)} sx={{ color: lx.textMuted }}>Cancel</Button>
          <Button variant="contained" onClick={createTransfer} sx={{ bgcolor: LOGISTICS_ACCENT, fontWeight: 700 }}>Create</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(snack)} autoHideDuration={4500} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnack(null)} severity="info" sx={{ bgcolor: lx.accentSoft, color: lx.text, border: `1px solid ${lx.border}` }}>
          {snack}
        </Alert>
      </Snackbar>
    </LogisticsPageShell>
  );
}
