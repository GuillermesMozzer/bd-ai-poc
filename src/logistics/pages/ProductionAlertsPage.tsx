import React, { useMemo, useState } from 'react';
import { Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import LogisticsPageShell from '../components/LogisticsPageShell';
import KpiRow from '../components/KpiRow';
import PanelCard from '../components/PanelCard';
import LogisticsDrawer, { DrawerSection, DetailList } from '../components/LogisticsDrawer';
import { StatusPill, SeverityPill } from '../components/StatusPill';
import { workshopData, workshopUsers, getAlert } from '../data/workshopDay2Data';
import { LOGISTICS_ACCENT } from '../constants';
import { fmtTime, humanize, type KpiTone } from '../utils';
import { lx } from '../themeTokens';

type Props = {
  initialJobId?: string;
  initialAlertId?: string;
  initialMachineId?: string;
  onNavigate?: (screen: string, id?: string) => void;
};

const stateBorder: Record<string, string> = {
  new: lx.danger,
  acknowledged: lx.warn,
  assigned: LOGISTICS_ACCENT,
  escalated: '#9E77ED',
  resolved: lx.ok,
};

function alertStateTone(state: string): KpiTone {
  if (state === 'new' || state === 'escalated') return 'danger';
  if (state === 'acknowledged' || state === 'assigned') return 'warn';
  if (state === 'resolved') return 'ok';
  return 'default';
}

export default function ProductionAlertsPage({ initialAlertId, onNavigate }: Props) {
  const [data, setData] = useState(() => structuredClone(workshopData));
  const [stateFilter, setStateFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(
    initialAlertId && getAlert(initialAlertId) ? initialAlertId : null,
  );
  const [actionMsg, setActionMsg] = useState('');

  const alerts = data.alerts;
  const selected = selectedId ? alerts.find((a) => a.alert_id === selectedId) ?? null : null;
  const selectedJob = selected ? data.jobs.find((j) => j.job_id === selected.job_id) ?? null : null;

  const kpis = useMemo(() => {
    const a = alerts;
    const pendingEsc = a.filter((x) => x.state === 'new' && x.auto_escalate_at).length;
    return [
      {
        label: 'New unacknowledged',
        value: a.filter((x) => x.state === 'new').length,
        tone: 'danger' as const,
      },
      {
        label: 'In progress',
        value: a.filter((x) => x.state === 'acknowledged' || x.state === 'assigned').length,
        tone: 'warn' as const,
      },
      {
        label: 'Escalated / due soon',
        value: a.filter((x) => x.state === 'escalated').length + pendingEsc,
        tone: 'danger' as const,
      },
      {
        label: 'Resolved',
        value: a.filter((x) => x.state === 'resolved').length,
        tone: 'ok' as const,
      },
    ];
  }, [alerts]);

  const filtered = useMemo(() => {
    const ord: Record<string, number> = {
      new: 0,
      escalated: 1,
      assigned: 2,
      acknowledged: 3,
      resolved: 9,
    };
    let rows = [...alerts].sort((a, b) => (ord[a.state] ?? 5) - (ord[b.state] ?? 5));
    if (stateFilter) rows = rows.filter((a) => a.state === stateFilter);
    return rows;
  }, [alerts, stateFilter]);

  const openDetail = (alertId: string) => {
    setSelectedId(alertId);
    setActionMsg('');
  };

  const pushAudit = (alert: (typeof alerts)[0], action: string, detail: string) => {
    const entry = {
      at: new Date().toISOString(),
      user_id: 'USR-planner',
      action,
      detail,
    };
    return {
      ...alert,
      audit_trail: [entry, ...(alert.audit_trail ?? [])],
    };
  };

  const patchAlert = (
    alertId: string,
    updater: (alert: (typeof alerts)[0], draft: typeof data) => typeof data,
  ) => {
    setData((prev) => {
      const alert = prev.alerts.find((a) => a.alert_id === alertId);
      if (!alert) return prev;
      return updater(alert, structuredClone(prev));
    });
  };

  const acknowledge = () => {
    if (!selectedId) return;
    patchAlert(selectedId, (alert, draft) => {
      const next = pushAudit(
        {
          ...alert,
          state: 'acknowledged',
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: 'USR-planner',
        },
        'Acknowledged',
        'By planner',
      );
      draft.alerts = draft.alerts.map((a) => (a.alert_id === selectedId ? next : a));
      return draft;
    });
    setActionMsg('Alert acknowledged.');
  };

  const assignOwner = () => {
    if (!selectedId) return;
    patchAlert(selectedId, (alert, draft) => {
      const owner = alert.alert_id === 'ALT-DEMO-001' ? 'USR-label-cage' : 'USR-wh-lead';
      const next = pushAudit({ ...alert, state: 'assigned', owner_user_id: owner }, 'Owner assigned', workshopUsers[owner]);
      draft.alerts = draft.alerts.map((a) => (a.alert_id === selectedId ? next : a));
      if (alert.job_id) {
        draft.jobs = draft.jobs.map((j) =>
          j.job_id === alert.job_id ? { ...j, owner_user_id: owner } : j,
        );
      }
      return draft;
    });
    const owner =
      selected?.alert_id === 'ALT-DEMO-001' ? 'USR-label-cage' : 'USR-wh-lead';
    setActionMsg(`Assigned to ${workshopUsers[owner]}.`);
  };

  const escalate = () => {
    if (!selectedId || !selected) return;
    let nextOwnerLabel: string | null = null;
    if (selected.escalation_chain?.length) {
      const idx = Math.min(
        (selected.escalation_index ?? 0) + 1,
        selected.escalation_chain.length - 1,
      );
      nextOwnerLabel = workshopUsers[selected.escalation_chain[idx]] ?? selected.escalation_chain[idx];
    }
    patchAlert(selectedId, (alert, draft) => {
      let next = { ...alert, state: 'escalated' as const };
      if (alert.escalation_chain?.length) {
        const idx = Math.min((alert.escalation_index ?? 0) + 1, alert.escalation_chain.length - 1);
        const owner = alert.escalation_chain[idx];
        next = pushAudit(
          { ...next, escalation_index: idx, owner_user_id: owner },
          'Escalated',
          `Next owner: ${workshopUsers[owner]} (shift-change / no ack)`,
        );
      } else {
        next = pushAudit(next, 'Escalated', 'Production lead notified');
      }
      draft.alerts = draft.alerts.map((a) => (a.alert_id === selectedId ? next : a));
      return draft;
    });
    setActionMsg(nextOwnerLabel ? `Escalated to ${nextOwnerLabel}.` : 'Escalated.');
  };

  const resolve = () => {
    if (!selectedId) return;
    patchAlert(selectedId, (alert, draft) => {
      const next = pushAudit(
        {
          ...alert,
          state: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: 'USR-label-cage',
        },
        'Resolved',
        'Labels staged — job can proceed',
      );
      draft.alerts = draft.alerts.map((a) => (a.alert_id === selectedId ? next : a));

      if (alert.alert_id === 'ALT-DEMO-001') {
        const now = new Date().toISOString();
        draft.jobs = draft.jobs.map((j) => {
          if (j.job_id !== 'JOB-DEMO-001') return j;
          return {
            ...j,
            readiness_pct: 85,
            readiness_risk: 'at_risk',
            main_blocker: null,
            current_stage_id: 'warehouse_preparation',
            stages: j.stages.map((s) =>
              s.stage_id === 'label_cage_prep'
                ? { ...s, status: 'complete', completed_at: now }
                : s,
            ),
          };
        });
        draft.machines = draft.machines.map((m) =>
          m.machine_id === 'LINE-03'
            ? {
                ...m,
                status: 'running',
                material_status: 'staged',
                material_blocker: null,
                replenishment_action: 'continue',
                related_alert_id: null,
              }
            : m,
        );
      }
      return draft;
    });
    setActionMsg(
      onNavigate
        ? 'Resolved. Machine LINE-03 updated to on-track.'
        : 'Resolved. Machine LINE-03 updated to on-track.',
    );
  };

  return (
    <LogisticsPageShell
      title="Production Change Alert Center"
      subtitle="Lot, priority, machine, schedule changes"
      asOf={data.as_of}
    >
      <KpiRow items={kpis} />

      <PanelCard
        title="Alert feed"
        action={
          <TextField
            select
            size="small"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All states</MenuItem>
            <MenuItem value="new">New</MenuItem>
            <MenuItem value="acknowledged">Acknowledged</MenuItem>
            <MenuItem value="assigned">Assigned</MenuItem>
            <MenuItem value="escalated">Escalated</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
          </TextField>
        }
      >
        <Stack spacing={0}>
          {filtered.map((a) => (
            <Box
              key={a.alert_id}
              onClick={() => openDetail(a.alert_id)}
              sx={{
                px: 2,
                py: 1.6,
                borderBottom: `1px solid ${lx.divider}`,
                borderLeft: `4px solid ${stateBorder[a.state] ?? lx.border}`,
                cursor: 'pointer',
                bgcolor: selectedId === a.alert_id ? 'rgba(11, 92, 171, 0.04)' : 'transparent',
                opacity: a.state === 'resolved' ? 0.85 : 1,
                '&:hover': { bgcolor: lx.hover },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: lx.text }}>
                  {humanize(a.alert_type)}
                </Typography>
                <Stack direction="row" spacing={0.6} alignItems="center">
                  <SeverityPill severity={a.severity} />
                  <StatusPill label={a.state} tone={alertStateTone(a.state)} />
                </Stack>
              </Stack>
              <Typography variant="body2" sx={{ mt: 0.4 }}>
                {a.original_value} → <strong>{a.new_value}</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block', mt: 0.4 }}>
                {a.job_id} · {a.machine_id} · Due {fmtTime(a.due_at)}
                <br />
                Action: {a.required_action}
                <br />
                Owner:{' '}
                {a.owner_user_id ? (
                  workshopUsers[a.owner_user_id]
                ) : (
                  <Box component="span" sx={{ color: lx.danger, fontWeight: 700 }}>
                    Unassigned
                  </Box>
                )}
              </Typography>
            </Box>
          ))}
        </Stack>
      </PanelCard>
<LogisticsDrawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.alert_id ?? ''}
        subtitle={selected ? `${humanize(selected.alert_type)} · Alert` : undefined}
        width={560}
      >
        {selected ? (
          <Stack spacing={2.5}>
            <DrawerSection title="Overview">
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <SeverityPill severity={selected.severity} />
                <StatusPill label={selected.state} tone={alertStateTone(selected.state)} />
              </Stack>
              <Typography variant="body2" sx={{ mt: 1.2 }}>
                {selected.reason}
              </Typography>
            </DrawerSection>

            <DrawerSection title="Change details">
              <DetailList
                items={[
                  {
                    label: 'Original → New',
                    value: (
                      <>
                        {selected.original_value} → <strong>{selected.new_value}</strong>
                      </>
                    ),
                  },
                  { label: 'Area impacted', value: selected.area_impacted },
                  { label: 'Required action', value: selected.required_action },
                  { label: 'Due', value: fmtTime(selected.due_at) },
                  {
                    label: 'Owner',
                    value: selected.owner_user_id
                      ? workshopUsers[selected.owner_user_id]
                      : '—',
                  },
                ]}
              />
            </DrawerSection>

            <DrawerSection title="Linked records">
              <Typography variant="body2">
                Job:{' '}
                {onNavigate ? (
                  <Button
                    size="small"
                    sx={{ p: 0, minWidth: 0, textTransform: 'none' }}
                    onClick={() => onNavigate('job-readiness', selected.job_id)}
                  >
                    {selected.job_id}
                  </Button>
                ) : (
                  <strong>{selected.job_id}</strong>
                )}
                {selectedJob ? ` — ${selectedJob.main_blocker ?? 'no blocker'}` : ''}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.6 }}>
                Machine:{' '}
                {onNavigate ? (
                  <Button
                    size="small"
                    sx={{ p: 0, minWidth: 0, textTransform: 'none' }}
                    onClick={() => onNavigate('machine-status', selected.machine_id)}
                  >
                    {selected.machine_id}
                  </Button>
                ) : (
                  <strong>{selected.machine_id}</strong>
                )}
              </Typography>
            </DrawerSection>

            {selected.downstream_impact?.length ? (
              <DrawerSection title="Downstream impact">
                <Box component="ul" sx={{ m: 0, pl: 2.2 }}>
                  {selected.downstream_impact.map((d) => (
                    <Typography component="li" key={d} variant="body2" sx={{ mb: 0.4 }}>
                      {d}
                    </Typography>
                  ))}
                </Box>
              </DrawerSection>
            ) : null}

            {selected.escalation_chain?.length ? (
              <DrawerSection title="Shift-change escalation chain">
                <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block', mb: 1 }}>
                  If no ack within {selected.escalate_after_min ?? 30} min (or end of shift), escalate to
                  next owner.
                </Typography>
                <Stack direction="row" flexWrap="wrap" alignItems="center" useFlexGap spacing={0.8}>
                  {selected.escalation_chain.map((uid, i) => {
                    const idx = selected.escalation_index ?? 0;
                    const isDone = i < idx;
                    const isCurrent = i === idx;
                    return (
                      <React.Fragment key={uid}>
                        <Box
                          sx={{
                            px: 1,
                            py: 0.4,
                            borderRadius: 1,
                            fontSize: 12,
                            fontWeight: isCurrent ? 800 : 600,
                            border: '1px solid',
                            borderColor: isDone ? 'rgba(16,185,129,0.55)' : isCurrent ? 'rgba(245,158,11,0.55)' : lx.border,
                            bgcolor: isDone ? lx.okSoft : isCurrent ? lx.warnSoft : lx.chipBg,
                            color: lx.text,
                          }}
                        >
                          {workshopUsers[uid] ?? uid}
                        </Box>
                        {i < selected.escalation_chain.length - 1 ? (
                          <Typography variant="caption" sx={{ color: lx.textDisabled }}>
                            →
                          </Typography>
                        ) : null}
                      </React.Fragment>
                    );
                  })}
                </Stack>
                {selected.auto_escalate_at && selected.state === 'new' ? (
                  <Typography variant="caption" sx={{ color: lx.warn, display: 'block', mt: 1 }}>
                    Auto-escalate at {fmtTime(selected.auto_escalate_at)} if unanswered
                  </Typography>
                ) : null}
                <DetailList
                  items={[
                    {
                      label: 'Escalate after',
                      value: `${selected.escalate_after_min ?? 30} min`,
                    },
                    {
                      label: 'Auto-escalate at',
                      value: fmtTime(selected.auto_escalate_at),
                    },
                    {
                      label: 'Chain index',
                      value: String(selected.escalation_index ?? 0),
                    },
                  ]}
                />
              </DrawerSection>
            ) : null}

            <DrawerSection title="Actions">
              <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  disabled={selected.state !== 'new'}
                  onClick={acknowledge}
                  sx={{ bgcolor: LOGISTICS_ACCENT, '&:hover': { bgcolor: 'var(--token-brand-dark)' } }}
                >
                  Acknowledge
                </Button>
                <Button variant="outlined" size="small" onClick={assignOwner}>
                  Assign owner (Label Cage)
                </Button>
                <Button variant="outlined" color="error" size="small" onClick={escalate}>
                  Escalate to next in chain
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={resolve}
                  sx={{ bgcolor: lx.ok, '&:hover': { bgcolor: lx.ok } }}
                >
                  Resolve
                </Button>
              </Stack>
              {actionMsg ? (
                <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block', mt: 1 }}>
                  {actionMsg}
                  {selected.state === 'resolved' && onNavigate ? (
                    <>
                      {' '}
                      <Button
                        size="small"
                        sx={{ p: 0, minWidth: 0, textTransform: 'none' }}
                        onClick={() => onNavigate('machine-status', 'LINE-03')}
                      >
                        Open LINE-03
                      </Button>
                    </>
                  ) : null}
                </Typography>
              ) : null}
            </DrawerSection>

            <DrawerSection title="Audit trail">
              <Box component="ul" sx={{ m: 0, pl: 2.2 }}>
                {(selected.audit_trail ?? []).length ? (
                  selected.audit_trail.map((e, i) => (
                    <Typography component="li" key={`${e.at}-${i}`} variant="caption" sx={{ mb: 0.6 }}>
                      {fmtTime(e.at)} · {workshopUsers[e.user_id] ?? e.user_id} — {e.action}: {e.detail}
                    </Typography>
                  ))
                ) : (
                  <Typography component="li" variant="caption">
                    No entries
                  </Typography>
                )}
              </Box>
            </DrawerSection>
          </Stack>
        ) : null}
      </LogisticsDrawer>
    </LogisticsPageShell>
  );
}
