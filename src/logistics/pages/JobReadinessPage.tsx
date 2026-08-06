import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import LogisticsPageShell from '../components/LogisticsPageShell';
import KpiRow from '../components/KpiRow';
import PanelCard from '../components/PanelCard';
import LogisticsDrawer, { DrawerSection, DetailList } from '../components/LogisticsDrawer';
import { StatusPill, SlaPill } from '../components/StatusPill';
import { workshopData, workshopUsers, getJob } from '../data/workshopDay2Data';
import { JOB_READINESS_STAGES, LOGISTICS_ACCENT } from '../constants';
import { fmtTime, humanize, type KpiTone } from '../utils';
import { lx } from '../themeTokens';

type Props = {
  initialJobId?: string;
  initialAlertId?: string;
  initialMachineId?: string;
  onNavigate?: (screen: string, id?: string) => void;
};

const stageLabels = Object.fromEntries(JOB_READINESS_STAGES.map((s) => [s.id, s.label]));

const riskBorder: Record<string, string> = {
  on_track: lx.ok,
  at_risk: lx.warn,
  late: lx.danger,
};

function stageTone(status: string): KpiTone {
  if (status === 'complete') return 'ok';
  if (status === 'blocked') return 'danger';
  if (status === 'in_progress' || status === 'waiting') return 'warn';
  return 'default';
}

function readinessTone(pct: number): KpiTone {
  if (pct >= 90) return 'ok';
  if (pct >= 60) return 'warn';
  return 'danger';
}

function ReadinessBar({ pct }: { pct: number }) {
  const tone = readinessTone(pct);
  const color = tone === 'ok' ? lx.ok : tone === 'warn' ? lx.warn : lx.danger;
  return (
    <Box sx={{ minWidth: 72 }}>
      <Typography variant="caption" sx={{ fontWeight: 800, color, display: 'block', textAlign: 'right' }}>
        {pct}%
      </Typography>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, Math.max(0, pct))}
        sx={{
          height: 6,
          borderRadius: 999,
          bgcolor: lx.soft,
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 999 },
        }}
      />
    </Box>
  );
}

export default function JobReadinessPage({ initialJobId, onNavigate }: Props) {
  const [data, setData] = useState(() => structuredClone(workshopData));
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(
    initialJobId && getJob(initialJobId) ? initialJobId : null,
  );
  const [commentText, setCommentText] = useState('');
  const [manualStage, setManualStage] = useState('');

  const jobs = data.jobs;
  const selected = selectedId ? jobs.find((j) => j.job_id === selectedId) ?? null : null;

  const kpis = useMemo(() => {
    const j = jobs;
    return [
      { label: 'Active jobs', value: j.length },
      { label: 'On track', value: j.filter((x) => x.readiness_risk === 'on_track').length, tone: 'ok' as const },
      { label: 'At risk', value: j.filter((x) => x.readiness_risk === 'at_risk').length, tone: 'warn' as const },
      { label: 'Blocked / late', value: j.filter((x) => x.readiness_risk === 'late').length, tone: 'danger' as const },
      { label: 'Missing labels', value: j.filter((x) => x.blocker_area === 'label_cage').length, tone: 'danger' as const },
      { label: 'QA blocked', value: j.filter((x) => x.blocker_area === 'quality_release').length, tone: 'warn' as const },
    ];
  }, [jobs]);

  const filtered = useMemo(() => {
    const pri: Record<string, number> = { critical: 0, high: 1, normal: 2 };
    let rows = [...jobs].sort((a, b) => (pri[a.priority] ?? 9) - (pri[b.priority] ?? 9));
    if (riskFilter) rows = rows.filter((j) => j.readiness_risk === riskFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((j) =>
        [j.job_id, j.production_order_id, j.lot, j.machine_name, j.sku].some((x) =>
          String(x ?? '')
            .toLowerCase()
            .includes(q),
        ),
      );
    }
    return rows;
  }, [jobs, riskFilter, search]);

  const openJob = (jobId: string) => {
    const j = jobs.find((x) => x.job_id === jobId);
    if (!j) return;
    setSelectedId(jobId);
    setManualStage(j.current_stage_id);
    setCommentText('');
  };

  const saveComment = () => {
    const text = commentText.trim();
    if (!text || !selectedId) return;
    const now = new Date().toISOString();
    setData((prev) => ({
      ...prev,
      jobs: prev.jobs.map((j) =>
        j.job_id === selectedId
          ? {
              ...j,
              comments: [...j.comments, { user_id: 'USR-wh-lead', at: now, text }],
            }
          : j,
      ),
    }));
    setCommentText('');
  };

  const updateStage = () => {
    if (!selectedId || !manualStage) return;
    const now = new Date().toISOString();
    const label = stageLabels[manualStage] ?? manualStage;
    setData((prev) => ({
      ...prev,
      jobs: prev.jobs.map((j) =>
        j.job_id === selectedId
          ? {
              ...j,
              current_stage_id: manualStage,
              last_update_at: now,
              audit_trail: [
                {
                  at: now,
                  user_id: 'USR-wh-lead',
                  action: 'Manual update',
                  detail: `Stage → ${label}`,
                },
                ...(j.audit_trail ?? []),
              ],
            }
          : j,
      ),
    }));
  };

  return (
    <LogisticsPageShell
      title="Picking Readiness Timeline"
      subtitle="IN02 production supply · ST26–ST43"
      asOf={data.as_of}
    >
      <KpiRow items={kpis} />

      <PanelCard
        title="Picking Dashboard"
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <TextField
              size="small"
              placeholder="Search job, PO, lot, machine…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 220 }}
            />
            <TextField
              select
              size="small"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">All readiness</MenuItem>
              <MenuItem value="on_track">On track</MenuItem>
              <MenuItem value="at_risk">At risk</MenuItem>
              <MenuItem value="late">Blocked / late</MenuItem>
            </TextField>
          </Stack>
        }
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 1.5,
          }}
        >
          {filtered.map((j) => (
            <Box
              key={j.job_id}
              onClick={() => openJob(j.job_id)}
              sx={{
                p: 1.8,
                borderRadius: 2,
                border: `1px solid ${lx.border}`,
                borderLeft: `4px solid ${riskBorder[j.readiness_risk] ?? '#94A3B8'}`,
                cursor: 'pointer',
                bgcolor: selectedId === j.job_id ? 'rgba(11, 92, 171, 0.04)' : 'background.paper',
                boxShadow: j.priority === 'critical' ? '0 0 0 1px rgba(220, 38, 38, 0.2)' : 'none',
                '&:hover': { boxShadow: '0 4px 12px rgba(16, 24, 40, 0.08)' },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: lx.text }}>
                    {j.job_id} · {j.production_order_id}
                  </Typography>
                  <Typography variant="caption" sx={{ color: lx.textMuted }}>
                    {j.sku} · {j.lot} → {j.machine_name}
                  </Typography>
                </Box>
                <ReadinessBar pct={j.readiness_pct} />
              </Stack>

              <Box sx={{ mt: 1.2, fontSize: 12, color: lx.text }}>
                <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap" useFlexGap>
                  <SlaPill status={j.readiness_risk} />
                  <Typography variant="caption">
                    Priority: <strong>{j.priority}</strong>
                  </Typography>
                </Stack>
                <Typography variant="caption" display="block" sx={{ mt: 0.6 }}>
                  Required start: {fmtTime(j.required_start_at)}
                </Typography>
                <Typography variant="caption" display="block">
                  Stage: <strong>{stageLabels[j.current_stage_id] ?? j.current_stage_id}</strong>
                </Typography>
              </Box>

              {j.main_blocker ? (
                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: lx.danger, fontWeight: 600 }}>
                  Blocker: {j.main_blocker}
                </Typography>
              ) : null}

              <Typography variant="caption" sx={{ mt: 1, display: 'block', color: lx.textMuted }}>
                <strong>Next:</strong> {j.next_action}
                <br />
                <strong>Owner:</strong> {workshopUsers[j.owner_user_id] ?? '—'}
              </Typography>
            </Box>
          ))}
        </Box>
      </PanelCard>
<LogisticsDrawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected ? `${selected.job_id} — ${selected.production_order_id}` : ''}
        subtitle={selected ? `BatchRecord · ${selected.machine_name}` : undefined}
        width={560}
      >
        {selected ? (
          <Stack spacing={2.5}>
            <ReadinessBar pct={selected.readiness_pct} />

            <DrawerSection title="Job card">
              <DetailList
                items={[
                  { label: 'Batch / Lot', value: `${selected.batch_id} · ${selected.lot}` },
                  { label: 'Work order', value: selected.work_order_id },
                  {
                    label: 'Material',
                    value: `${selected.sku} — ${selected.material_description}`,
                  },
                  {
                    label: 'Machine',
                    value: onNavigate ? (
                      <Button
                        size="small"
                        sx={{ p: 0, minWidth: 0, textTransform: 'none' }}
                        onClick={() => onNavigate('machine-status', selected.machine_id)}
                      >
                        {selected.machine_name}
                      </Button>
                    ) : (
                      selected.machine_name
                    ),
                  },
                  {
                    label: 'Blocker area',
                    value: selected.blocker_area ? humanize(selected.blocker_area) : '—',
                  },
                  { label: 'Last update', value: fmtTime(selected.last_update_at) },
                ]}
              />
            </DrawerSection>

            <DrawerSection title="Readiness timeline (10 stages)">
              <Stack spacing={0}>
                {selected.stages.map((s) => {
                  const label = stageLabels[s.stage_id] ?? s.stage_id;
                  return (
                    <Box
                      key={s.stage_id}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '28px 1fr',
                        gap: 1.5,
                        py: 1.2,
                        borderBottom: `1px solid ${lx.divider}`,
                      }}
                    >
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor:
                            s.status === 'complete'
                              ? lx.okSoft
                              : s.status === 'blocked'
                                ? lx.dangerSoft
                                : s.status === 'in_progress' || s.status === 'waiting'
                                  ? lx.warnSoft
                                  : lx.chipBg,
                          color:
                            s.status === 'complete'
                              ? lx.ok
                              : s.status === 'blocked'
                                ? lx.danger
                                : lx.text,
                          fontSize: 11,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {s.status === 'complete'
                          ? 'OK'
                          : s.status === 'blocked'
                            ? '!'
                            : s.status === 'in_progress'
                              ? '…'
                              : s.status === 'waiting'
                                ? 'W'
                                : '·'}
                      </Box>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {label}
                          </Typography>
                          <StatusPill label={s.status} tone={stageTone(s.status)} />
                        </Stack>
                        <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block', mt: 0.4 }}>
                          Owner: {s.owner_user_id ? workshopUsers[s.owner_user_id] : '—'}
                          {s.expected_at ? ` · Expected: ${fmtTime(s.expected_at)}` : ''}
                          {s.completed_at ? ` · Done: ${fmtTime(s.completed_at)}` : ''}
                        </Typography>
                        {s.delay_reason ? (
                          <Typography variant="caption" sx={{ color: lx.danger, display: 'block', fontWeight: 600 }}>
                            Delay: {s.delay_reason}
                          </Typography>
                        ) : null}
                        {s.notes ? (
                          <Typography variant="caption" sx={{ color: lx.text, display: 'block' }}>
                            {s.notes}
                          </Typography>
                        ) : null}
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </DrawerSection>

            {selected.related_alert_ids?.length ? (
              <DrawerSection title="Related alerts">
                <Stack spacing={0.5}>
                  {selected.related_alert_ids.map((id) => {
                    const a = data.alerts.find((x) => x.alert_id === id);
                    if (!a) return null;
                    return (
                      <Typography key={id} variant="body2">
                        {onNavigate ? (
                          <Button
                            size="small"
                            sx={{ p: 0, minWidth: 0, textTransform: 'none' }}
                            onClick={() => onNavigate('production-alerts', id)}
                          >
                            {a.alert_id}
                          </Button>
                        ) : (
                          <strong>{a.alert_id}</strong>
                        )}{' '}
                        — {humanize(a.alert_type)} ({a.state})
                      </Typography>
                    );
                  })}
                </Stack>
              </DrawerSection>
            ) : null}

            <DrawerSection title="Comments / blocker notes">
              {selected.comments.length ? (
                <Stack spacing={1} sx={{ mb: 1.5 }}>
                  {selected.comments.map((c, i) => (
                    <Box
                      key={`${c.at}-${i}`}
                      sx={{
                        p: 1.2,
                        borderRadius: 1.5,
                        bgcolor: lx.soft,
                        border: `1px solid ${lx.divider}`,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700, color: lx.text }}>
                        {workshopUsers[c.user_id] ?? c.user_id} · {fmtTime(c.at)}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.4 }}>
                        {c.text}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block', mb: 1 }}>
                  No comments
                </Typography>
              )}
              <TextField
                multiline
                minRows={2}
                fullWidth
                size="small"
                placeholder="Add blocker note"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={saveComment}
                sx={{ mt: 1, borderColor: LOGISTICS_ACCENT, color: LOGISTICS_ACCENT }}
              >
                Save note
              </Button>
            </DrawerSection>

            <DrawerSection title="Manual status update">
              <TextField
                select
                fullWidth
                size="small"
                value={manualStage || selected.current_stage_id}
                onChange={(e) => setManualStage(e.target.value)}
              >
                {JOB_READINESS_STAGES.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.label}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="contained"
                fullWidth
                onClick={updateStage}
                sx={{ mt: 1, bgcolor: LOGISTICS_ACCENT, '&:hover': { bgcolor: '#094a8c' } }}
              >
                Update stage (logs audit trail)
              </Button>
              <Typography variant="caption" sx={{ color: lx.textDisabled, display: 'block', mt: 0.8 }}>
                Future: SAP PP, Apriso WMS, label printers
              </Typography>
            </DrawerSection>

            <DrawerSection title="Audit trail">
              <Box component="ul" sx={{ m: 0, pl: 2.2 }}>
                {(selected.audit_trail ?? []).length ? (
                  selected.audit_trail.map((e, i) => (
                    <Typography component="li" key={`${e.at}-${i}`} variant="caption" sx={{ mb: 0.6 }}>
                      {fmtTime(e.at)} · {workshopUsers[e.user_id] ?? e.user_id} — <strong>{e.action}</strong>:{' '}
                      {e.detail}
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
