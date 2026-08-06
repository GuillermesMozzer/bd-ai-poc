import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import LogisticsPageShell from '../components/LogisticsPageShell';
import KpiRow from '../components/KpiRow';
import PanelCard from '../components/PanelCard';
import LogisticsDrawer, { DrawerSection, DetailList } from '../components/LogisticsDrawer';
import { StatusPill, SlaPill, SeverityPill } from '../components/StatusPill';
import { logisticsData } from '../data/logisticsMockData';
import { STERILIZATION_STATES, LOGISTICS_ACCENT } from '../constants';
import { fmtTime, humanize } from '../utils';
import { lx } from '../themeTokens';

const data = logisticsData;
const loads = data.sterilization_loads;

function providerName(providerId: string) {
  return data.providers[providerId]?.name ?? providerId;
}

function isLateQa(load: (typeof loads)[number]) {
  if (load.qa_aging_days == null) return false;
  return load.qa_aging_days > (load.qa_expected_tat_days ?? 7);
}

function stateTone(state: string) {
  if (state.includes('pending') || state.includes('certificate')) return 'warn' as const;
  if (state.includes('transit')) return 'default' as const;
  if (state === 'released') return 'ok' as const;
  return 'default' as const;
}

export default function SterilizationTrackerPage() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [snackOpen, setSnackOpen] = useState(false);

  const selected = useMemo(
    () => loads.find((l) => l.sterilization_load_id === selectedId) ?? null,
    [selectedId],
  );

  const kpis = useMemo(() => {
    const inTransit = loads.filter((l) => l.state.includes('transit')).length;
    const atProvider = loads.filter(
      (l) =>
        l.state.includes('provider')
        || l.state === 'sterilization_in_progress'
        || l.state === 'sterilization_completed'
        || l.state === 'certificate_pending'
        || l.state === 'ready_for_return'
        || l.state === 'pickup_scheduled',
    ).length;
    const certPending = loads.filter((l) => l.state === 'certificate_pending').length;
    const pendingQa = loads.filter((l) => l.state === 'pending_qa_release').length;
    const lateQa = loads.filter(isLateQa).length;
    const docsMissing = loads.filter((l) => !l.documentation_ok).length;
    return [
      { label: 'In transit', value: inTransit },
      { label: 'At provider', value: atProvider },
      { label: 'Cert pending', value: certPending, tone: 'warn' as const },
      { label: 'Pending QA', value: pendingQa, tone: 'warn' as const },
      { label: 'Late QA (>7d TAT)', value: lateQa, tone: 'danger' as const },
      { label: 'Docs missing', value: docsMissing, tone: 'warn' as const },
    ];
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return loads;
    return loads.filter((l) => {
      const prov = providerName(l.provider_id).toLowerCase();
      return l.sterilization_load_id.toLowerCase().includes(q) || prov.includes(q);
    });
  }, [search]);

  const exceptions = data.exceptions.filter((e) => e.process_area === 'Sterilization');
  const stateIdx = selected ? STERILIZATION_STATES.indexOf(selected.state as (typeof STERILIZATION_STATES)[number]) : -1;
  const selectedProvider = selected ? data.providers[selected.provider_id] : null;

  return (
    <LogisticsPageShell
      title="Sterilization Load Tracker"
      subtitle="External provider visibility · load lifecycle · ST47–ST83"
      asOf={data.as_of}
    >
      <KpiRow items={kpis} />

      <PanelCard
        title="Provider Load Board"
        action={
          <TextField
            size="small"
            placeholder="Search load ID, provider…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 220 }}
          />
        }
        sx={{ mb: 2 }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Load ID</TableCell>
                <TableCell>Provider</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Product family</TableCell>
                <TableCell>Pallets</TableCell>
                <TableCell>ETA / SLA</TableCell>
                <TableCell>Documentation</TableCell>
                <TableCell>QA aging</TableCell>
                <TableCell>SAP shipment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((l) => {
                const late = isLateQa(l);
                return (
                  <TableRow
                    key={l.sterilization_load_id}
                    hover
                    selected={selectedId === l.sterilization_load_id}
                    onClick={() => setSelectedId(l.sterilization_load_id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {l.sterilization_load_id}
                      </Typography>
                    </TableCell>
                    <TableCell>{providerName(l.provider_id)}</TableCell>
                    <TableCell>
                      <StatusPill label={l.state} tone={stateTone(l.state)} />
                    </TableCell>
                    <TableCell>{l.product_family}</TableCell>
                    <TableCell>
                      {l.pallets_count}
                      <Typography component="span" variant="caption" sx={{ color: lx.textMuted, display: 'block' }}>
                        {l.pallets.join(', ')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{l.eta_return ? fmtTime(l.eta_return) : '—'}</Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <SlaPill status={l.sla_risk} />
                      </Box>
                    </TableCell>
                    <TableCell>
                      {l.documentation_ok ? (
                        <Chip size="small" label="Complete" color="success" variant="outlined" />
                      ) : (
                        <Typography variant="caption" sx={{ color: lx.danger, fontWeight: 700 }}>
                          Missing: {l.missing_docs.join(', ')}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {l.qa_aging_days == null ? (
                        '—'
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{ color: late ? lx.danger : lx.text, fontWeight: late ? 700 : 600 }}
                        >
                          {l.qa_aging_days}d / {l.qa_expected_tat_days ?? 7}d
                          {late ? ' LATE' : ''}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{l.external_sap_shipment_number}</Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ color: lx.textMuted, py: 3 }}>
                    No loads match search
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      </PanelCard>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
        }}
      >
        <PanelCard title="Sterilization Exceptions">
          {exceptions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No sterilization exceptions
            </Typography>
          ) : (
            <List disablePadding>
              {exceptions.map((e) => (
                <ListItem
                  key={e.exception_id}
                  alignItems="flex-start"
                  sx={{ px: 0, borderBottom: `1px solid ${lx.divider}`, '&:last-child': { borderBottom: 0 } }}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography variant="body2" fontWeight={700}>
                          {humanize(e.exception_type)}
                        </Typography>
                        <SeverityPill severity={e.severity} />
                      </Stack>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ color: lx.text, mt: 0.4 }}>
                          {e.description}
                        </Typography>
                        <Typography variant="caption" sx={{ color: lx.textMuted }}>
                          {e.next_action}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </PanelCard>

        <PanelCard title="Document Readiness">
          <List disablePadding>
            {loads.map((l) => (
              <ListItem
                key={l.sterilization_load_id}
                alignItems="flex-start"
                sx={{ px: 0, borderBottom: `1px solid ${lx.divider}`, '&:last-child': { borderBottom: 0 } }}
              >
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                      <Typography variant="body2" fontWeight={700}>
                        {l.sterilization_load_id}
                      </Typography>
                      <StatusPill
                        label={l.documentation_ok ? 'OK' : 'Gap'}
                        tone={l.documentation_ok ? 'ok' : 'danger'}
                      />
                    </Stack>
                  }
                  secondary={
                    l.documentation_ok
                      ? 'All certificates on file'
                      : `Missing: ${l.missing_docs.join(', ')}`
                  }
                />
              </ListItem>
            ))}
          </List>
        </PanelCard>
      </Box>
<LogisticsDrawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.sterilization_load_id ?? ''}
        subtitle={selected ? `SterilizationLoad · ${providerName(selected.provider_id)}` : undefined}
        width={480}
      >
        {selected ? (
          <>
            <DrawerSection title="Status lifecycle">
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {STERILIZATION_STATES.map((s, i) => {
                  const done = stateIdx >= 0 && i < stateIdx;
                  const active = i === stateIdx;
                  return (
                    <Chip
                      key={s}
                      size="small"
                      label={humanize(s)}
                      sx={{
                        fontWeight: active ? 800 : 600,
                        fontSize: 11,
                        bgcolor: active
                          ? LOGISTICS_ACCENT
                          : done
                            ? 'rgba(11, 92, 171, 0.12)'
                            : lx.chipBg,
                        color: active ? '#fff' : done ? LOGISTICS_ACCENT : lx.textMuted,
                        border: active ? 'none' : `1px solid ${done ? 'rgba(11, 92, 171, 0.25)' : lx.border}`,
                      }}
                    />
                  );
                })}
              </Box>
            </DrawerSection>

            <DrawerSection title="Load timeline">
              <List dense disablePadding>
                {selected.departed_at ? (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText primary={`Departed BD — ${fmtTime(selected.departed_at)}`} />
                  </ListItem>
                ) : null}
                <ListItem sx={{ px: 0 }}>
                  <ListItemText primary={`At provider — ${providerName(selected.provider_id)}`} />
                </ListItem>
                {selected.arrived_at_bd ? (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText primary={`Arrived at BD — ${fmtTime(selected.arrived_at_bd)}`} />
                  </ListItem>
                ) : null}
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary={`QA release — ${selected.state === 'pending_qa_release' ? 'Pending' : '—'}`}
                    primaryTypographyProps={{
                      color: selected.state === 'pending_qa_release' ? 'warning.main' : 'text.primary',
                    }}
                  />
                </ListItem>
              </List>
            </DrawerSection>

            {selected.qa_aging_days != null ? (
              <DrawerSection title="Post-sterilization QA aging">
                <Typography variant="body2" fontWeight={700}>
                  {selected.qa_aging_days}d / expected {selected.qa_expected_tat_days ?? 7}d TAT
                </Typography>
                <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block', mt: 0.75 }}>
                  {selected.qa_pending_reason
                    ?? (isLateQa(selected)
                      ? 'Past expected TAT — treat as late pending'
                      : 'Within expected process window')}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.75 }}>
                  When QA releases in SAP, status syncs here automatically.
                </Typography>
              </DrawerSection>
            ) : null}

            <DrawerSection title="Digital load / unload reconciliation">
              <DetailList
                items={[
                  { label: 'Expected pallets', value: selected.pallets_count },
                  { label: 'Tracked', value: selected.pallets.join(', ') },
                  { label: 'SAP', value: selected.external_sap_shipment_number },
                ]}
              />
            </DrawerSection>

            <DrawerSection title="Provider portal / manual fallback">
              <Typography variant="body2" sx={{ mb: 1.2 }}>
                {selectedProvider?.portal_url
                  ? `Portal: ${selectedProvider.portal_url}`
                  : 'No portal — manual CT update with evidence'}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setSnackOpen(true)}
                sx={{ borderColor: LOGISTICS_ACCENT, color: LOGISTICS_ACCENT }}
              >
                Log provider update (manual)
              </Button>
            </DrawerSection>

            <DrawerSection title="Control Tower link">
              <Typography variant="caption" sx={{ color: lx.textMuted }}>
                Delayed loads or missing docs auto-create Exception N-26 entries in Control Tower.
              </Typography>
            </DrawerSection>
          </>
        ) : null}
      </LogisticsDrawer>

      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" onClose={() => setSnackOpen(false)} variant="filled">
          Manual portal update logged (prototype — no backend write).
        </Alert>
      </Snackbar>
    </LogisticsPageShell>
  );
}
