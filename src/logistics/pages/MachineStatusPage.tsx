import React, { useMemo, useState } from 'react';
import { Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import LogisticsPageShell from '../components/LogisticsPageShell';
import KpiRow from '../components/KpiRow';
import PanelCard from '../components/PanelCard';
import LogisticsDrawer, { DrawerSection, DetailList } from '../components/LogisticsDrawer';
import { StatusPill } from '../components/StatusPill';
import { workshopData, workshopUsers, getMachine } from '../data/workshopDay2Data';
import { LOGISTICS_ACCENT } from '../constants';
import { fmtTime, fmtDuration, humanize, type KpiTone } from '../utils';
import { lx } from '../themeTokens';

type Props = {
  initialJobId?: string;
  initialAlertId?: string;
  initialMachineId?: string;
  onNavigate?: (screen: string, id?: string) => void;
};

const MACHINE_STATUSES = [
  'running',
  'stopped',
  'changeover',
  'waiting_for_material',
  'maintenance',
] as const;

const statusTopBorder: Record<string, string> = {
  running: lx.ok,
  stopped: lx.danger,
  waiting_for_material: lx.warn,
  changeover: LOGISTICS_ACCENT,
  maintenance: '#94A3B8',
};

function machineStatusTone(status: string): KpiTone {
  if (status === 'running') return 'ok';
  if (status === 'stopped') return 'danger';
  if (status === 'waiting_for_material' || status === 'changeover') return 'warn';
  return 'default';
}

export default function MachineStatusPage({ initialMachineId, onNavigate }: Props) {
  const [data, setData] = useState(() => structuredClone(workshopData));
  const [statusFilter, setStatusFilter] = useState('');
  const [matFilter, setMatFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(
    initialMachineId && getMachine(initialMachineId) ? initialMachineId : null,
  );
  const [manualStatus, setManualStatus] = useState('');

  const machines = data.machines;
  const selected = selectedId ? machines.find((m) => m.machine_id === selectedId) ?? null : null;

  const kpis = useMemo(() => {
    const m = machines;
    return [
      { label: 'Running', value: m.filter((x) => x.status === 'running').length, tone: 'ok' as const },
      { label: 'Stopped', value: m.filter((x) => x.status === 'stopped').length, tone: 'danger' as const },
      {
        label: 'Waiting for material',
        value: m.filter((x) => x.status === 'waiting_for_material').length,
        tone: 'warn' as const,
      },
      {
        label: 'Replenishment paused',
        value: m.filter((x) => x.replenishment_action === 'pause').length,
      },
      {
        label: 'Material blocked',
        value: m.filter((x) => x.material_status === 'blocked').length,
        tone: 'warn' as const,
      },
      { label: 'Lines monitored', value: m.length },
    ];
  }, [machines]);

  const filtered = useMemo(() => {
    let rows = [...machines];
    if (statusFilter) rows = rows.filter((m) => m.status === statusFilter);
    if (matFilter) rows = rows.filter((m) => m.material_status === matFilter);
    return rows;
  }, [machines, statusFilter, matFilter]);

  const openDetail = (machineId: string) => {
    const m = machines.find((x) => x.machine_id === machineId);
    if (!m) return;
    setSelectedId(machineId);
    setManualStatus(m.status);
  };

  const updateMachineStatus = () => {
    if (!selectedId || !manualStatus) return;
    setData((prev) => ({
      ...prev,
      machines: prev.machines.map((m) =>
        m.machine_id === selectedId
          ? {
              ...m,
              status: manualStatus,
              replenishment_action:
                manualStatus === 'stopped' || manualStatus === 'maintenance' ? 'pause' : 'continue',
              last_update_at: new Date().toISOString(),
            }
          : m,
      ),
    }));
  };

  const curJob = selected?.current_job_id
    ? data.jobs.find((j) => j.job_id === selected.current_job_id) ?? null
    : null;
  const nextJob = selected?.next_job_id
    ? data.jobs.find((j) => j.job_id === selected.next_job_id) ?? null
    : null;
  const relatedAlert = selected?.related_alert_id
    ? data.alerts.find((a) => a.alert_id === selected.related_alert_id) ?? null
    : null;

  return (
    <LogisticsPageShell
      title="Machine Material Status Board"
      subtitle="Machine status × material readiness · Clean Line CT §6.4"
      asOf={data.as_of}
    >
      <KpiRow items={kpis} />

      <PanelCard
        title="Machine / Line board"
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <TextField
              select
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">All machine status</MenuItem>
              {MACHINE_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {humanize(s)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              value={matFilter}
              onChange={(e) => setMatFilter(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">All material status</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="in_transit">In transit</MenuItem>
              <MenuItem value="staged">Staged</MenuItem>
              <MenuItem value="blocked">Blocked</MenuItem>
              <MenuItem value="not_requested">Not requested</MenuItem>
              <MenuItem value="requested">Requested</MenuItem>
              <MenuItem value="picked">Picked</MenuItem>
            </TextField>
          </Stack>
        }
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 1.5,
          }}
        >
          {filtered.map((m) => {
            const job = m.current_job_id
              ? data.jobs.find((j) => j.job_id === m.current_job_id)
              : null;
            const alert = m.related_alert_id
              ? data.alerts.find((a) => a.alert_id === m.related_alert_id)
              : null;
            return (
              <Box
                key={m.machine_id}
                onClick={() => openDetail(m.machine_id)}
                sx={{
                  p: 1.8,
                  borderRadius: 2,
                  border: `1px solid ${lx.border}`,
                  borderTop: `3px solid ${statusTopBorder[m.status] ?? lx.border}`,
                  cursor: 'pointer',
                  bgcolor: selectedId === m.machine_id ? 'rgba(11, 92, 171, 0.04)' : 'background.paper',
                  '&:hover': { boxShadow: '0 4px 12px rgba(16, 24, 40, 0.08)' },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: lx.text }}>
                    {m.machine_name}
                  </Typography>
                  <StatusPill label={m.status} tone={machineStatusTone(m.status)} />
                </Stack>
                <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block', mt: 0.4 }}>
                  {m.area} · {m.bags_in_line} bags in line
                </Typography>

                <Typography variant="caption" sx={{ display: 'block', mt: 1.2, color: lx.text }}>
                  <strong>Current job:</strong>{' '}
                  {m.current_job_id ? (
                    onNavigate ? (
                      <Button
                        size="small"
                        sx={{ p: 0, minWidth: 0, textTransform: 'none', verticalAlign: 'baseline' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('job-readiness', m.current_job_id);
                        }}
                      >
                        {m.current_job_id}
                      </Button>
                    ) : (
                      m.current_job_id
                    )
                  ) : (
                    '—'
                  )}
                  <br />
                  <strong>Next job:</strong> {m.next_job_id ?? '—'}
                </Typography>

                {m.material_needed_now ? (
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: lx.text }}>
                    <strong>Material now:</strong> {m.material_needed_now.sku} · {m.material_needed_now.lot}
                    <br />
                    <Box component="span" sx={{ color: lx.textMuted }}>
                      {m.material_needed_now.description}
                    </Box>
                  </Typography>
                ) : null}

                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: lx.text }}>
                  Material: <strong>{humanize(m.material_status)}</strong>
                  {m.eta_material_need_min != null
                    ? ` · Need in ${fmtDuration(m.eta_material_need_min)}`
                    : ''}
                  {m.material_handler_id ? (
                    <>
                      <br />
                      Handler: {workshopUsers[m.material_handler_id]}
                    </>
                  ) : null}
                </Typography>

                {m.material_blocker ? (
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.8, color: lx.danger, fontWeight: 600 }}>
                    {m.material_blocker}
                  </Typography>
                ) : null}

                <Box
                  sx={{
                    mt: 1,
                    px: 1,
                    py: 0.6,
                    borderRadius: 1,
                    fontSize: 11,
                    bgcolor: m.replenishment_action === 'pause' ? lx.dangerSoft : lx.okSoft,
                    color: lx.text,
                  }}
                >
                  Replenishment:{' '}
                  <strong>
                    {m.replenishment_action === 'pause' ? 'PAUSE prep' : 'Continue prep'}
                  </strong>
                </Box>

                {alert ? (
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.8 }}>
                    {onNavigate ? (
                      <Button
                        size="small"
                        sx={{ p: 0, minWidth: 0, textTransform: 'none' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('production-alerts', alert.alert_id);
                        }}
                      >
                        {alert.alert_id}
                      </Button>
                    ) : (
                      alert.alert_id
                    )}
                  </Typography>
                ) : null}

                {job?.main_blocker ? (
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.4, color: lx.warn }}>
                    Job blocker: {job.main_blocker}
                  </Typography>
                ) : null}
              </Box>
            );
          })}
        </Box>
      </PanelCard>
<LogisticsDrawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.machine_name ?? ''}
        subtitle={selected ? `ProductionLine · ${selected.machine_id}` : undefined}
        width={560}
      >
        {selected ? (
          <Stack spacing={2.5}>
            <DrawerSection title="Machine status">
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <StatusPill label={selected.status} tone={machineStatusTone(selected.status)} />
                <Typography variant="body2">
                  Work order: {selected.current_work_order_id ?? '—'}
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block', mt: 0.8 }}>
                Last update: {fmtTime(selected.last_update_at)}
              </Typography>
            </DrawerSection>

            <DrawerSection title="Material need — now">
              {selected.material_needed_now ? (
                <Typography variant="body2">
                  {selected.material_needed_now.sku} · {selected.material_needed_now.lot}
                  <br />
                  {selected.material_needed_now.description}
                </Typography>
              ) : (
                <Typography variant="body2" sx={{ color: lx.textMuted }}>
                  None
                </Typography>
              )}
              <Typography variant="body2" sx={{ mt: 1 }}>
                Status: <strong>{humanize(selected.material_status)}</strong>
                {selected.material_blocker ? (
                  <>
                    <br />
                    <Box component="span" sx={{ color: lx.danger, fontWeight: 700 }}>
                      {selected.material_blocker}
                    </Box>
                  </>
                ) : null}
              </Typography>
            </DrawerSection>

            <DrawerSection title="Material need — next">
              {selected.material_needed_next ? (
                <Typography variant="body2">
                  {selected.material_needed_next.sku} · {selected.material_needed_next.lot}
                  <br />
                  {selected.material_needed_next.description}
                </Typography>
              ) : (
                <Typography variant="body2" sx={{ color: lx.textMuted }}>
                  None scheduled
                </Typography>
              )}
              {selected.eta_material_need_min != null ? (
                <Typography variant="body2" sx={{ mt: 0.8 }}>
                  ETA: {fmtDuration(selected.eta_material_need_min)}
                </Typography>
              ) : null}
            </DrawerSection>

            <DrawerSection title="Jobs">
              <Typography variant="body2">
                Current:{' '}
                {selected.current_job_id ? (
                  onNavigate ? (
                    <Button
                      size="small"
                      sx={{ p: 0, minWidth: 0, textTransform: 'none' }}
                      onClick={() => onNavigate('job-readiness', selected.current_job_id)}
                    >
                      {selected.current_job_id}
                    </Button>
                  ) : (
                    <strong>{selected.current_job_id}</strong>
                  )
                ) : (
                  '—'
                )}
                {curJob ? (
                  <>
                    <br />
                    Readiness {curJob.readiness_pct}% · {curJob.main_blocker ?? 'On track'}
                  </>
                ) : null}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.8 }}>
                Next: {selected.next_job_id ?? '—'}
                {nextJob ? ` · ${nextJob.lot}` : ''}
              </Typography>
            </DrawerSection>

            <DrawerSection title="Replenishment guidance">
              <Typography variant="body2">
                {selected.status === 'stopped' ? 'Machine stopped — ' : ''}
                <strong>
                  {selected.replenishment_action === 'pause'
                    ? 'Pause warehouse preparation'
                    : 'Continue preparing material'}
                </strong>
              </Typography>
              <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block', mt: 0.6 }}>
                Handler:{' '}
                {selected.material_handler_id
                  ? workshopUsers[selected.material_handler_id]
                  : 'Unassigned'}
              </Typography>
            </DrawerSection>

            {relatedAlert ? (
              <DrawerSection title="Related alert">
                <Typography variant="body2">
                  {onNavigate ? (
                    <Button
                      size="small"
                      sx={{ p: 0, minWidth: 0, textTransform: 'none' }}
                      onClick={() => onNavigate('production-alerts', relatedAlert.alert_id)}
                    >
                      {relatedAlert.alert_id}
                    </Button>
                  ) : (
                    <strong>{relatedAlert.alert_id}</strong>
                  )}{' '}
                  — {relatedAlert.required_action}
                </Typography>
              </DrawerSection>
            ) : null}

            <DrawerSection title="Manual update">
              <TextField
                select
                fullWidth
                size="small"
                value={manualStatus || selected.status}
                onChange={(e) => setManualStatus(e.target.value)}
              >
                {MACHINE_STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {humanize(s)}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="contained"
                fullWidth
                onClick={updateMachineStatus}
                sx={{ mt: 1, bgcolor: LOGISTICS_ACCENT, '&:hover': { bgcolor: '#094a8c' } }}
              >
                Update machine status
              </Button>
            </DrawerSection>

            <DrawerSection title="Details">
              <DetailList
                items={[
                  { label: 'Machine ID', value: selected.machine_id },
                  { label: 'Area', value: selected.area },
                  { label: 'Bags in line', value: String(selected.bags_in_line) },
                  {
                    label: 'Replenishment',
                    value: selected.replenishment_action === 'pause' ? 'Pause' : 'Continue',
                  },
                ]}
              />
            </DrawerSection>
          </Stack>
        ) : null}
      </LogisticsDrawer>
    </LogisticsPageShell>
  );
}
