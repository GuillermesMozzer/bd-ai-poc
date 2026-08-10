import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import LogisticsPageShell from '../components/LogisticsPageShell';
import KpiRow from '../components/KpiRow';
import PanelCard from '../components/PanelCard';
import LogisticsDrawer, { DrawerSection, DetailList } from '../components/LogisticsDrawer';
import { StatusPill } from '../components/StatusPill';
import { logisticsData } from '../data/logisticsMockData';
import { LOGISTICS_ACCENT } from '../constants';
import { fmtTime, humanize } from '../utils';
import { lx } from '../themeTokens';

const data = logisticsData;
const tasks = data.guided_tasks;

const TASK_LABELS: Record<string, string> = {
  putaway: 'Guided Putaway',
  rm_picking: 'Guided RM Picking',
  kitting: 'Guided Kitting',
  replenishment: 'Kanban Replenishment',
  fg_picking: 'FG Picking',
  fg_staging: 'FG Shipping Staging',
  receiving_validation: 'Receiving Validation',
};

const GUIDED_COPY: Record<string, string> = {
  putaway: '1. Scan pallet → 2. System suggests destination → 3. Scan location → 4. Confirm movement',
  rm_picking: 'Scan source bin → scan pallet → confirm qty → scan destination',
  kitting: 'Digital kit checklist — scan each BOM component and confirm quantity',
  replenishment: 'Kanban trigger → replenish to supermarket 415 → scan confirm',
  fg_staging: 'Pick released FG → stage shipment → confirm pallet config → scan dock/container',
};

type ScanStepState = 'pending' | 'active' | 'done' | 'fail';

function priorityTone(priority: string) {
  if (priority === 'critical') return 'danger' as const;
  if (priority === 'high') return 'warn' as const;
  return 'default' as const;
}

function statusTone(status: string) {
  if (status === 'blocked') return 'danger' as const;
  if (status === 'in_progress') return 'ok' as const;
  if (status === 'completed') return 'ok' as const;
  return 'default' as const;
}

function operatorLabel(opId: string | null | undefined) {
  if (!opId) return 'Unassigned';
  return data.users[opId] ?? opId;
}

export default function GuidedTasksPage() {
  const [tab, setTab] = useState(0);
  const [operatorFilter, setOperatorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scanStates, setScanStates] = useState<ScanStepState[]>([]);
  const [scanMsg, setScanMsg] = useState('');
  const [exceptionMsg, setExceptionMsg] = useState('');

  const operators = useMemo(
    () => [...new Set(tasks.map((t) => t.assigned_operator_id).filter(Boolean))] as string[],
    [],
  );

  const selected = useMemo(
    () => tasks.find((t) => t.task_id === selectedId) ?? null,
    [selectedId],
  );

  const filterTasks = (list: typeof tasks) =>
    list.filter((t) => {
      if (operatorFilter && t.assigned_operator_id !== operatorFilter) return false;
      if (statusFilter && t.status !== statusFilter) return false;
      return true;
    });

  const inboxTasks = filterTasks(tasks);
  const rmTasks = filterTasks(tasks.filter((t) => t.area === 'RM'));
  const fgTasks = filterTasks(tasks.filter((t) => t.area === 'FG'));

  const openTask = (taskId: string) => {
    const t = tasks.find((x) => x.task_id === taskId);
    if (!t) return;
    setSelectedId(taskId);
    setScanStates(t.required_scans.map((_, i) => (i === 0 ? 'active' : 'pending')));
    setScanMsg('');
    setExceptionMsg('');
  };

  const onScanOk = (index: number) => {
    setScanStates((prev) => {
      const next = [...prev];
      next[index] = 'done';
      if (index + 1 < next.length && next[index + 1] !== 'done') {
        next[index + 1] = 'active';
      }
      return next;
    });
    setScanMsg(
      index + 1 < (selected?.required_scans.length ?? 0)
        ? `Step ${index + 1} confirmed. Continue to next scan.`
        : 'All scans confirmed — movement posted (audit trail recorded).',
    );
  };

  const onScanFail = (index: number) => {
    setScanStates((prev) => {
      const next = [...prev];
      next[index] = 'fail';
      return next;
    });
    setScanMsg('Wrong material / location scanned — blocked. Correct and rescan.');
  };

  const supervisorOps = operators.map((opId) => {
    const opTasks = tasks.filter((t) => t.assigned_operator_id === opId);
    const blocked = opTasks.filter((t) => t.status === 'blocked').length;
    const areas = [...new Set(opTasks.map((t) => t.area))].join(', ');
    return {
      opId,
      areas,
      active: opTasks.filter((t) => t.status === 'in_progress').length,
      total: opTasks.length,
      blocked,
      critical: opTasks.some((t) => t.priority === 'critical'),
    };
  });

  const renderTaskGrid = (list: typeof tasks) => {
    if (list.length === 0) {
      return (
        <Typography variant="body2" sx={{ color: lx.textMuted, p: 2 }}>
          No tasks match filters
        </Typography>
      );
    }
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
          gap: 1.5,
        }}
      >
        {list.map((t) => {
          const border =
            t.status === 'blocked'
              ? 'rgba(239,68,68,0.35)'
              : t.priority === 'critical'
                ? lx.danger
                : lx.border;
          return (
            <Paper
              key={t.task_id}
              elevation={0}
              onClick={() => openTask(t.task_id)}
              sx={{
                p: 1.8,
                borderRadius: 2,
                border: `1px solid ${border}`,
                bgcolor: t.status === 'blocked' ? lx.dangerSoft : 'background.paper',
                cursor: 'pointer',
                transition: 'box-shadow 120ms',
                '&:hover': { boxShadow: '0 4px 14px rgba(16,24,40,0.08)' },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: LOGISTICS_ACCENT }}>
                  {TASK_LABELS[t.task_type] ?? humanize(t.task_type)}
                </Typography>
                <StatusPill label={t.priority} tone={priorityTone(t.priority)} />
              </Stack>
              <Typography variant="body2" fontWeight={700}>
                {t.item_sku} · {t.lot} · {t.qty} {t.uom}
              </Typography>
              <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block', mt: 0.6 }}>
                {t.source} → {t.destination}
                <br />
                Deadline: {fmtTime(t.deadline)} · {operatorLabel(t.assigned_operator_id)}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <StatusPill label={t.status} tone={statusTone(t.status)} />
              </Box>
              <Stack direction="row" flexWrap="wrap" gap={0.5} mt={1}>
                {t.required_scans.map((s: string) => (
                  <Chip key={s} size="small" label={`Scan: ${humanize(s)}`} sx={{ height: 22, fontSize: 11 }} />
                ))}
              </Stack>
              {t.blocker ? (
                <Typography variant="caption" sx={{ color: lx.danger, display: 'block', mt: 0.8, fontWeight: 700 }}>
                  Blocked: {humanize(t.blocker)}
                </Typography>
              ) : null}
            </Paper>
          );
        })}
      </Box>
    );
  };

  return (
    <LogisticsPageShell
      title="Operator Task Inbox"
      subtitle="Guided RM & FG execution · RF/mobile scan confirmation"
      asOf={data.as_of}
    >
      <PanelCard title="Guided tasks">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
          mb={2}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 40,
              '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 700 },
              '& .Mui-selected': { color: LOGISTICS_ACCENT },
              '& .MuiTabs-indicator': { bgcolor: LOGISTICS_ACCENT },
            }}
          >
            <Tab label="Task Inbox" />
            <Tab label="RM Tasks" />
            <Tab label="FG Tasks" />
            <Tab label="Supervisor Board" />
          </Tabs>
          <Stack direction="row" spacing={1.5}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Operator</InputLabel>
              <Select
                label="Operator"
                value={operatorFilter}
                onChange={(e) => setOperatorFilter(e.target.value)}
              >
                <MenuItem value="">All operators</MenuItem>
                {operators.map((id) => (
                  <MenuItem key={id} value={id}>
                    {data.users[id]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All statuses</MenuItem>
                <MenuItem value="not_started">Not started</MenuItem>
                <MenuItem value="in_progress">In progress</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        {tab === 0 ? renderTaskGrid(inboxTasks) : null}
        {tab === 1 ? renderTaskGrid(rmTasks) : null}
        {tab === 2 ? renderTaskGrid(fgTasks) : null}
        {tab === 3 ? (
          <Box>
            <KpiRow
              items={[
                { label: 'Total tasks', value: tasks.length },
                {
                  label: 'In progress',
                  value: tasks.filter((t) => t.status === 'in_progress').length,
                  tone: 'ok',
                },
                {
                  label: 'Blocked',
                  value: tasks.filter((t) => t.status === 'blocked').length,
                  tone: 'danger',
                },
                {
                  label: 'Critical priority',
                  value: tasks.filter((t) => t.priority === 'critical').length,
                  tone: 'warn',
                },
              ]}
            />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Operator</TableCell>
                    <TableCell>Area</TableCell>
                    <TableCell>Active tasks</TableCell>
                    <TableCell>Blocked</TableCell>
                    <TableCell>SLA risk</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {supervisorOps.map((row) => (
                    <TableRow key={row.opId}>
                      <TableCell>{operatorLabel(row.opId)}</TableCell>
                      <TableCell>{row.areas}</TableCell>
                      <TableCell>
                        {row.active} active / {row.total} total
                      </TableCell>
                      <TableCell>{row.blocked || '—'}</TableCell>
                      <TableCell>
                        {row.critical ? (
                          <StatusPill label="Yes" tone="danger" />
                        ) : (
                          'No'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : null}
      </PanelCard>
<LogisticsDrawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected ? (TASK_LABELS[selected.task_type] ?? humanize(selected.task_type)) : ''}
        subtitle={selected ? `${selected.task_id} · TransferOrder` : undefined}
        width={460}
      >
        {selected ? (
          <>
            <DrawerSection title="Task details">
              <DetailList
                items={[
                  {
                    label: 'Item',
                    value: `${selected.item_sku} · ${selected.lot} · ${selected.qty} ${selected.uom}`,
                  },
                  { label: 'Source → Dest', value: `${selected.source} → ${selected.destination}` },
                  { label: 'Priority', value: <StatusPill label={selected.priority} tone={priorityTone(selected.priority)} /> },
                  { label: 'Status', value: <StatusPill label={selected.status} tone={statusTone(selected.status)} /> },
                  { label: 'Deadline', value: fmtTime(selected.deadline) },
                  { label: 'Operator', value: operatorLabel(selected.assigned_operator_id) },
                  {
                    label: 'Badge / device',
                    value: `${selected.badge_id ?? '—'} · ${humanize(selected.device ?? 'rf_scanner')}`,
                  },
                  ...(selected.production_order_id
                    ? [{ label: 'Production order', value: selected.production_order_id }]
                    : []),
                  ...(selected.outbound_shipment_id
                    ? [{ label: 'Outbound shipment', value: selected.outbound_shipment_id }]
                    : []),
                ]}
              />
            </DrawerSection>

            <DrawerSection title="RF scan simulation">
              <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block', mb: 1.2 }}>
                Wrong scan = red alert (FDA audit trail). Confirm each step on scanner / forklift tablet.
              </Typography>
              <Stack spacing={1}>
                {selected.required_scans.map((s: string, i: number) => {
                  const state = scanStates[i] ?? 'pending';
                  return (
                    <Box
                      key={`${s}-${i}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1.2,
                        borderRadius: 1.5,
                        border: `1px solid ${
                          state === 'fail'
                            ? 'rgba(239,68,68,0.35)'
                            : state === 'done'
                              ? 'rgba(16,185,129,0.35)'
                              : state === 'active'
                                ? 'rgba(11, 92, 171, 0.35)'
                                : lx.border
                        }`,
                        bgcolor:
                          state === 'fail'
                            ? lx.dangerSoft
                            : state === 'done'
                              ? lx.okSoft
                              : state === 'active'
                                ? 'rgba(11, 92, 171, 0.04)'
                                : 'background.paper',
                      }}
                    >
                      <Typography variant="body2" fontWeight={700} sx={{ minWidth: 18 }}>
                        {i + 1}.
                      </Typography>
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        Scan {humanize(s)}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onScanOk(i)}
                        disabled={state === 'done'}
                      >
                        OK
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => onScanFail(i)}
                      >
                        Wrong
                      </Button>
                    </Box>
                  );
                })}
              </Stack>
              {scanMsg ? (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 1,
                    fontWeight: scanMsg.startsWith('Wrong') ? 700 : 500,
                    color: scanMsg.startsWith('Wrong') ? lx.danger : lx.textMuted,
                  }}
                >
                  {scanMsg}
                </Typography>
              ) : null}
            </DrawerSection>

            {GUIDED_COPY[selected.task_type] ? (
              <DrawerSection title="Guided execution">
                <Typography variant="body2">{GUIDED_COPY[selected.task_type]}</Typography>
              </DrawerSection>
            ) : null}

            <DrawerSection title="Exception capture (at point of work)">
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {['Material not found', 'Qty mismatch', 'Damaged box', 'Blocked by Quality'].map((label) => (
                  <Button
                    key={label}
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() =>
                      setExceptionMsg(`Exception captured: ${label} (prototype placeholder)`)
                    }
                  >
                    {label}
                  </Button>
                ))}
              </Stack>
              <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block', mt: 1 }}>
                Creates Exception · ScanEvent for audit trail
              </Typography>
              {exceptionMsg ? (
                <Typography variant="caption" sx={{ display: 'block', mt: 0.75, color: LOGISTICS_ACCENT }}>
                  {exceptionMsg}
                </Typography>
              ) : null}
            </DrawerSection>
          </>
        ) : null}
      </LogisticsDrawer>
    </LogisticsPageShell>
  );
}
