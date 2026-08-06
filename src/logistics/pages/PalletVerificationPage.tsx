import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import LogisticsPageShell from '../components/LogisticsPageShell';
import KpiRow from '../components/KpiRow';
import PanelCard from '../components/PanelCard';
import { StatusPill, SeverityPill } from '../components/StatusPill';
import { LOGISTICS_ACCENT } from '../constants';
import { lx } from '../themeTokens';
import PalletViewerCanvas from '../palletVerification/PalletViewerCanvas';
import {
  FLOW_STEPS,
  SCREEN_FLOW_STEP,
  captureSteps,
  checklistItems,
  issueCategories,
  palletAnalytics,
  palletExceptions,
  palletOperator,
  palletStats,
  recentVerifications,
  seedDetectedIssues,
  supervisorQueue,
  verificationPallet,
  type DetectedIssue,
  type PalletScreen,
} from '../data/palletVerificationMockData';

type CheckResult = 'pass' | 'fail' | null;
type ChecklistState = Record<string, { result: CheckResult; comment: string; photo: boolean }>;

const NAV: { id: PalletScreen; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'identified', label: 'Identified' },
  { id: 'viewer', label: '3D Config' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'camera', label: 'Camera' },
  { id: 'issues', label: 'Issues' },
  { id: 'result', label: 'Result' },
  { id: 'exception', label: 'Exception' },
  { id: 'supervisor', label: 'Supervisor' },
  { id: 'analytics', label: 'Analytics' },
];

function emptyChecklist(): ChecklistState {
  return Object.fromEntries(
    checklistItems.map((i) => [i.id, { result: null as CheckResult, comment: '', photo: false }]),
  );
}

function emptyCaptures(): Record<string, boolean> {
  return Object.fromEntries(captureSteps.map((s) => [s.id, false]));
}

export default function PalletVerificationPage() {
  const pallet = verificationPallet;
  const [screen, setScreen] = useState<PalletScreen>('home');
  const [checklist, setChecklist] = useState<ChecklistState>(emptyChecklist);
  const [captures, setCaptures] = useState(emptyCaptures);
  const [captureIndex, setCaptureIndex] = useState(0);
  const [issues, setIssues] = useState<DetectedIssue[]>(() => seedDetectedIssues.map((i) => ({ ...i })));
  const [resultMode, setResultMode] = useState<'ready' | 'review' | 'blocked'>('review');
  const [scanOpen, setScanOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualId, setManualId] = useState(pallet.palletId);
  const [issueOpen, setIssueOpen] = useState(false);
  const [manualIssueType, setManualIssueType] = useState(issueCategories[0]);
  const [manualIssueComment, setManualIssueComment] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [viewCmd, setViewCmd] = useState<string | null>(null);
  const [filterArea, setFilterArea] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const go = (next: PalletScreen) => {
    if (next === 'result') setResultMode(computeResult());
    setScreen(next);
  };

  const checklistStats = useMemo(() => {
    const values = Object.values(checklist);
    const answered = values.filter((v) => v.result != null).length;
    const failed = values.filter((v) => v.result === 'fail').length;
    const criticalIncomplete = checklistItems.filter(
      (i) => i.critical && checklist[i.id].result == null,
    ).length;
    const criticalFailMissingEvidence = checklistItems.filter((i) => {
      const r = checklist[i.id];
      return i.critical && r.result === 'fail' && !r.comment && !r.photo;
    }).length;
    return {
      answered,
      failed,
      criticalIncomplete,
      criticalFailMissingEvidence,
      total: checklistItems.length,
    };
  }, [checklist]);

  function computeResult(): 'ready' | 'review' | 'blocked' {
    const confirmed = issues.filter((i) => i.status === 'confirmed');
    const criticalFail = checklistItems.some(
      (i) => i.critical && checklist[i.id].result === 'fail',
    );
    const hasCriticalIssue = confirmed.some((i) => i.severity === 'Critical' || i.severity === 'High');
    if (criticalFail || hasCriticalIssue) return 'blocked';
    if (confirmed.length > 0 || Object.values(checklist).some((c) => c.result === 'fail')) return 'review';
    return 'ready';
  }

  const identifyPallet = () => {
    setScanOpen(false);
    setManualOpen(false);
    go('identified');
    flash(`Pallet ${pallet.palletId} identified`);
  };

  const canContinueChecklist =
    checklistStats.criticalIncomplete === 0 && checklistStats.criticalFailMissingEvidence === 0;
  const allCaptured = captureSteps.every((s) => captures[s.id]);
  const flowStep = SCREEN_FLOW_STEP[screen];

  const filteredQueue = supervisorQueue.filter((r) => {
    if (filterArea) {
      const areaOk =
        filterArea === 'Shipping'
          ? r.area === 'Shipping'
          : r.area === filterArea || r.area.includes(filterArea.replace('Zone ', ''));
      if (!areaOk) return false;
    }
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterSeverity && r.severity !== filterSeverity) return false;
    return true;
  });

  const fireView = (cmd: string) => {
    setViewCmd(cmd);
    window.setTimeout(() => setViewCmd(null), 50);
  };

  return (
    <LogisticsPageShell
      title="Pallet Load Check"
      subtitle="3D pallet verification · guided inspection MVP · does not automate Quality release"
      banner={`${palletOperator.name} · ${palletOperator.area} · ${palletOperator.shift}`}
      toolbar={
        toast ? (
          <Chip label={toast} color="info" size="small" sx={{ fontWeight: 700 }} />
        ) : undefined
      }
    >
      {/* Progress */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${FLOW_STEPS.length}, 1fr)`,
          gap: 0.8,
          mb: 1.5,
        }}
      >
        {FLOW_STEPS.map((label, i) => {
          const done = flowStep != null && i < flowStep;
          const active = flowStep === i;
          return (
            <Box
              key={label}
              sx={{
                py: 0.8,
                px: 1,
                textAlign: 'center',
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 1,
                border: `1px solid ${active ? LOGISTICS_ACCENT : lx.border}`,
                bgcolor: done ? lx.okSoft : active ? lx.accentSoft : lx.soft,
                color: done ? lx.ok : active ? LOGISTICS_ACCENT : lx.textMuted,
              }}
            >
              {label}
            </Box>
          );
        })}
      </Box>

      {/* Screen nav */}
      <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        {NAV.map((n) => (
          <Chip
            key={n.id}
            label={n.label}
            size="small"
            onClick={() => go(n.id)}
            variant={screen === n.id ? 'filled' : 'outlined'}
            sx={{
              fontWeight: 700,
              bgcolor: screen === n.id ? LOGISTICS_ACCENT : undefined,
              color: screen === n.id ? '#fff' : lx.text,
              borderColor: lx.border,
            }}
          />
        ))}
      </Stack>

      {screen === 'home' && (
        <Stack spacing={2}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 4 },
              borderRadius: 2,
              border: `1px solid ${lx.border}`,
              bgcolor: lx.soft,
              textAlign: 'center',
            }}
          >
            <Typography variant="overline" sx={{ color: LOGISTICS_ACCENT, fontWeight: 800 }}>
              BD Inside Logistics
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
              Pallet Load Check
            </Typography>
            <Typography variant="body2" sx={{ color: lx.textMuted, mt: 1, mb: 2.5 }}>
              Scan the pallet label to retrieve the expected configuration.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<QrCodeScannerIcon />}
              onClick={() => setScanOpen(true)}
              sx={{ bgcolor: LOGISTICS_ACCENT, fontWeight: 800, px: 4 }}
            >
              Scan Pallet
            </Button>
            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
              <Button variant="outlined" onClick={() => setManualOpen(true)}>
                Enter Pallet ID
              </Button>
              <Button variant="outlined" onClick={() => go('supervisor')}>
                Open Exceptions Queue
              </Button>
              <Button variant="outlined" onClick={() => go('analytics')}>
                Analytics
              </Button>
            </Stack>
          </Paper>

          <KpiRow
            items={[
              { label: 'Pallets verified today', value: palletStats.verifiedToday, tone: 'ok' },
              { label: 'Needs Review', value: palletStats.needsReview, tone: 'warn' },
              { label: 'Blocked', value: palletStats.blocked, tone: 'danger' },
            ]}
          />

          <PanelCard title="Recent Verifications">
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Pallet ID', 'SKU', 'Status', 'Time', 'Operator'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {recentVerifications.map((r) => (
                  <TableRow key={r.palletId} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{r.palletId}</TableCell>
                    <TableCell>{r.sku}</TableCell>
                    <TableCell>
                      <StatusPill
                        label={r.status}
                        tone={
                          r.status === 'Ready' ? 'ok' : r.status === 'Blocked' ? 'danger' : 'warn'
                        }
                      />
                    </TableCell>
                    <TableCell>{r.time}</TableCell>
                    <TableCell>{r.operator}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </PanelCard>
        </Stack>
      )}

      {screen === 'identified' && (
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <StatusPill label={pallet.dataStatus} tone="ok" />
            <StatusPill label={pallet.systemStatus} tone="warn" />
            <StatusPill label={pallet.qualityStatus} tone="ok" />
          </Stack>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
            }}
          >
            <PanelCard title="System Record">
              <InfoGrid
                rows={[
                  ['Pallet ID', pallet.palletId],
                  ['Handling Unit', pallet.handlingUnit],
                  ['SKU', pallet.sku],
                  ['Product Family', pallet.productFamily],
                  ['Batch', pallet.batch],
                  ['Lot', pallet.lot],
                  ['Quantity', `${pallet.quantity} ${pallet.unit}`],
                  ['Destination', pallet.destination],
                  ['Current Location', pallet.currentLocation],
                ]}
              />
            </PanelCard>
            <PanelCard title="Expected Configuration">
              <InfoGrid
                rows={[
                  ['Pallet Type', pallet.palletType],
                  ['Expected Boxes', String(pallet.totalBoxes)],
                  ['Layers', String(pallet.expectedLayers)],
                  ['Boxes / Layer', String(pallet.boxesPerLayer)],
                  ['Gross Weight', pallet.expectedGrossWeight],
                  ['Wrapping', pallet.wrapping],
                  ['Lashing', pallet.lashing],
                  ['Labels', pallet.labelRequirements],
                ]}
              />
            </PanelCard>
          </Box>
          <ActionBar
            onBack={() => go('home')}
            primaryLabel="View 3D Configuration"
            onPrimary={() => go('viewer')}
          />
        </Stack>
      )}

      {screen === 'viewer' && (
        <Stack spacing={2}>
          <Typography variant="body2" sx={{ color: lx.textMuted }}>
            Rotate the 3D model to review the correct stacking pattern. Damaged box highlighted in red
            (layer 3 sample).
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
              gap: 2,
            }}
          >
            <Box>
              <PalletViewerCanvas
                layers={pallet.expectedLayers}
                boxesPerLayer={pallet.boxesPerLayer}
                active={screen === 'viewer'}
                viewCommand={viewCmd}
              />
              <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ mt: 1.2 }}>
                {[
                  ['iso', 'Isometric'],
                  ['front', 'Front'],
                  ['side', 'Side'],
                  ['top', 'Top'],
                  ['layer', 'Layer view'],
                  ['explode', 'Exploded'],
                  ['ties', 'Ties / wrap'],
                  ['reset', 'Reset'],
                ].map(([cmd, label]) => (
                  <Button key={cmd} size="small" variant="outlined" onClick={() => fireView(cmd)}>
                    {label}
                  </Button>
                ))}
              </Stack>
            </Box>
            <PanelCard title="Build Spec">
              <InfoGrid
                rows={[
                  ['Pallet dimensions', pallet.dimensions.pallet],
                  ['Box dimensions', pallet.dimensions.box],
                  ['Boxes per layer', String(pallet.boxesPerLayer)],
                  ['Number of layers', String(pallet.expectedLayers)],
                  ['Total boxes', String(pallet.totalBoxes)],
                  ['Wrapping', pallet.wrapping],
                  ['Lashing', pallet.lashing],
                  ['Label requirements', pallet.labelRequirements],
                ]}
              />
            </PanelCard>
          </Box>
          <ActionBar
            onBack={() => go('identified')}
            primaryLabel="Start Verification"
            onPrimary={() => go('checklist')}
          />
        </Stack>
      )}

      {screen === 'checklist' && (
        <Stack spacing={2}>
          <Typography variant="body2" sx={{ color: lx.textMuted }}>
            {checklistStats.answered} of {checklistStats.total} checked · {checklistStats.failed} failed
            {checklistStats.criticalIncomplete
              ? ` · ${checklistStats.criticalIncomplete} critical remaining`
              : ''}
          </Typography>
          <Stack spacing={1.2}>
            {checklistItems.map((item, idx) => {
              const r = checklist[item.id];
              return (
                <Paper
                  key={item.id}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    border: `1px solid ${
                      r.result === 'fail' ? lx.danger : r.result === 'pass' ? lx.ok : lx.border
                    }`,
                    borderRadius: 2,
                    bgcolor: r.result === 'fail' ? lx.dangerSoft : r.result === 'pass' ? lx.okSoft : lx.paper,
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    spacing={1}
                    alignItems={{ sm: 'center' }}
                  >
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <Chip label={idx + 1} size="small" sx={{ fontWeight: 800 }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {item.label}
                        </Typography>
                        {item.critical ? (
                          <Typography variant="caption" sx={{ color: lx.danger, fontWeight: 700 }}>
                            Critical
                          </Typography>
                        ) : null}
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap>
                      <Button
                        size="small"
                        variant={r.result === 'pass' ? 'contained' : 'outlined'}
                        color="success"
                        onClick={() =>
                          setChecklist((c) => ({ ...c, [item.id]: { ...c[item.id], result: 'pass' } }))
                        }
                      >
                        Pass
                      </Button>
                      <Button
                        size="small"
                        variant={r.result === 'fail' ? 'contained' : 'outlined'}
                        color="error"
                        onClick={() =>
                          setChecklist((c) => ({ ...c, [item.id]: { ...c[item.id], result: 'fail' } }))
                        }
                      >
                        Fail
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => {
                          setChecklist((c) => ({ ...c, [item.id]: { ...c[item.id], photo: true } }));
                          flash('Photo attached');
                        }}
                      >
                        {r.photo ? '✓ Photo' : 'Add photo'}
                      </Button>
                    </Stack>
                  </Stack>
                  {(r.result === 'fail' || r.comment) && (
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      minRows={2}
                      sx={{ mt: 1.2 }}
                      placeholder="Required for failed critical items — describe the issue…"
                      value={r.comment}
                      onChange={(e) =>
                        setChecklist((c) => ({
                          ...c,
                          [item.id]: { ...c[item.id], comment: e.target.value },
                        }))
                      }
                    />
                  )}
                </Paper>
              );
            })}
          </Stack>
          <ActionBar
            onBack={() => go('viewer')}
            secondaryLabel="Flag Issue"
            onSecondary={() => setIssueOpen(true)}
            primaryLabel="Continue to Camera Scan"
            onPrimary={() => go('camera')}
            primaryDisabled={!canContinueChecklist}
          />
        </Stack>
      )}

      {screen === 'camera' && (
        <Stack spacing={2}>
          <Typography variant="body2" sx={{ color: lx.textMuted }}>
            Capture all required pallet sides before submitting verification.
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' },
              gap: 2,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                minHeight: 280,
                borderRadius: 2,
                border: `1px solid ${lx.border}`,
                bgcolor: '#0f172a',
                color: '#e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontWeight: 800, mb: 1 }}>
                {allCaptured
                  ? 'All required views captured'
                  : captureSteps[captureIndex]?.guidance}
              </Typography>
              <Box
                sx={{
                  width: 140,
                  height: 160,
                  border: '2px dashed rgba(255,255,255,0.25)',
                  borderRadius: 1,
                  mb: 2,
                }}
              />
              <Button
                variant="contained"
                disabled={allCaptured}
                onClick={() => {
                  const step = captureSteps[captureIndex];
                  if (!step) return;
                  setCaptures((c) => ({ ...c, [step.id]: true }));
                  setCaptureIndex((i) => Math.min(i + 1, captureSteps.length - 1));
                  flash(`${step.label} captured`);
                }}
                sx={{ bgcolor: LOGISTICS_ACCENT, fontWeight: 800 }}
              >
                Capture Photo
              </Button>
            </Paper>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                {captureSteps.map((s, i) => (
                  <Chip
                    key={s.id}
                    label={`${s.label}${captures[s.id] ? ' ✓' : ''}`}
                    color={captures[s.id] ? 'success' : i === captureIndex ? 'primary' : 'default'}
                    variant={captures[s.id] || i === captureIndex ? 'filled' : 'outlined'}
                    size="small"
                  />
                ))}
              </Stack>
              <PanelCard title="AI Detection (simulated)">
                {allCaptured ? (
                  <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                    {issues.map((i) => (
                      <Chip
                        key={i.id}
                        size="small"
                        label={`${i.aiLabel} · ${i.confidence}%`}
                        color={i.severity === 'Low' ? 'warning' : 'error'}
                      />
                    ))}
                    <Chip size="small" label="Low Confidence — Manual Review Needed" color="warning" />
                  </Stack>
                ) : (
                  <Typography variant="body2" sx={{ color: lx.textMuted }}>
                    Capture all sides to run simulated detection…
                  </Typography>
                )}
                <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block', mt: 1 }}>
                  Prototype only — detections are simulated. No live CV model.
                </Typography>
              </PanelCard>
            </Stack>
          </Box>
          <ActionBar
            onBack={() => go('checklist')}
            primaryLabel="Review Issues"
            onPrimary={() => go('issues')}
            primaryDisabled={!allCaptured}
          />
        </Stack>
      )}

      {screen === 'issues' && (
        <Stack spacing={2}>
          <Typography variant="body2" sx={{ color: lx.textMuted }}>
            Issue detected. Confirm whether this should create an exception.
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1.2fr' },
              gap: 2,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                minHeight: 220,
                borderRadius: 2,
                border: `1px solid ${lx.border}`,
                bgcolor: lx.muted,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: lx.textMuted,
                fontWeight: 700,
              }}
            >
              Captured front view (mock)
            </Paper>
            <Stack spacing={1.2}>
              {issues.map((iss) => (
                <Paper
                  key={iss.id}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: `1px solid ${lx.border}`,
                    opacity: iss.status === 'dismissed' ? 0.55 : 1,
                    bgcolor: iss.status === 'confirmed' ? lx.warnSoft : lx.paper,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontWeight: 800 }}>{iss.type}</Typography>
                    <SeverityPill severity={iss.severity.toLowerCase()} />
                  </Stack>
                  <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block', mt: 0.6 }}>
                    Confidence {iss.confidence}% · {iss.location}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.6 }}>
                    {iss.requiredAction}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={iss.confidence}
                    sx={{ mt: 1, height: 6, borderRadius: 1 }}
                  />
                  <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap sx={{ mt: 1.2 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="warning"
                      disabled={iss.status === 'confirmed'}
                      onClick={() => {
                        setIssues((list) =>
                          list.map((x) => (x.id === iss.id ? { ...x, status: 'confirmed' } : x)),
                        );
                        flash('Issue confirmed');
                      }}
                    >
                      Confirm
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={iss.status === 'dismissed'}
                      onClick={() => {
                        setIssues((list) =>
                          list.map((x) => (x.id === iss.id ? { ...x, status: 'dismissed' } : x)),
                        );
                        flash('Issue dismissed');
                      }}
                    >
                      Dismiss
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => {
                        setIssues((list) =>
                          list.map((x) => (x.id === iss.id ? { ...x, status: 'confirmed' } : x)),
                        );
                        go('exception');
                      }}
                    >
                      Escalate
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Box>
          <ActionBar
            onBack={() => go('camera')}
            secondaryLabel="Flag Issue"
            onSecondary={() => setIssueOpen(true)}
            primaryLabel="Submit Verification"
            onPrimary={() => go('result')}
          />
        </Stack>
      )}

      {screen === 'result' && (
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {(['ready', 'review', 'blocked'] as const).map((m) => (
              <Button
                key={m}
                size="small"
                variant={resultMode === m ? 'contained' : 'outlined'}
                onClick={() => setResultMode(m)}
              >
                Preview: {m === 'ready' ? 'Ready' : m === 'review' ? 'Needs Review' : 'Blocked'}
              </Button>
            ))}
          </Stack>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 2,
              border: `1px solid ${lx.border}`,
              bgcolor:
                resultMode === 'ready'
                  ? lx.okSoft
                  : resultMode === 'blocked'
                    ? lx.dangerSoft
                    : lx.warnSoft,
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 900 }}>
              {resultMode === 'ready' ? '✓' : resultMode === 'blocked' ? '✕' : '!'}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 1 }}>
              {resultMode === 'ready' ? 'Ready' : resultMode === 'blocked' ? 'Blocked' : 'Needs Review'}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: lx.textMuted }}>
              {resultMode === 'ready'
                ? 'Pallet verified and ready to move.'
                : resultMode === 'blocked'
                  ? 'Pallet blocked due to critical issue.'
                  : 'Pallet requires supervisor or quality review.'}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: lx.textMuted }}>
              {pallet.palletId} · {pallet.sku} · {pallet.currentLocation}
            </Typography>
          </Paper>
          <PanelCard title="Verification Summary">
            <InfoGrid
              rows={[
                ['Operator', palletOperator.name],
                [
                  'Checklist',
                  `${checklistStats.answered}/${checklistStats.total} · ${checklistStats.failed} failed`,
                ],
                ['Photos', `${Object.values(captures).filter(Boolean).length} captured`],
                [
                  'Confirmed issues',
                  String(issues.filter((i) => i.status === 'confirmed').length),
                ],
              ]}
            />
          </PanelCard>
          <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
            <Button onClick={() => go('issues')}>Back</Button>
            {resultMode === 'ready' && (
              <Button
                variant="contained"
                sx={{ bgcolor: LOGISTICS_ACCENT }}
                onClick={() => {
                  flash('Ready to move confirmed');
                  go('home');
                }}
              >
                Confirm Ready to Move
              </Button>
            )}
            {resultMode !== 'ready' && (
              <Button variant="contained" color="warning" onClick={() => go('exception')}>
                Create Exception
              </Button>
            )}
          </Stack>
        </Stack>
      )}

      {screen === 'exception' && (
        <Stack spacing={2}>
          <PanelCard title="Exception Record">
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 1.5,
              }}
            >
              <TextField label="Exception ID" size="small" value={palletExceptions[0].id} InputProps={{ readOnly: true }} />
              <TextField label="Pallet ID" size="small" value={pallet.palletId} InputProps={{ readOnly: true }} />
              <TextField select label="Issue Type" size="small" defaultValue="Damaged box">
                {issueCategories.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
              <TextField select label="Severity" size="small" defaultValue="Medium">
                {['Low', 'Medium', 'High', 'Critical'].map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Recommended Action"
                size="small"
                defaultValue={palletExceptions[0].recommendedAction}
                sx={{ gridColumn: { md: '1 / -1' } }}
              />
              <TextField
                label="Comments"
                size="small"
                multiline
                minRows={3}
                defaultValue={palletExceptions[0].comment}
                sx={{ gridColumn: { md: '1 / -1' } }}
              />
            </Box>
          </PanelCard>
          <ActionBar
            onBack={() => go('result')}
            secondaryLabel="Assign to Supervisor"
            onSecondary={() => {
              flash('Assigned to supervisor queue');
              go('supervisor');
            }}
            primaryLabel="Submit Exception"
            onPrimary={() => {
              flash('Exception submitted');
              go('supervisor');
            }}
          />
        </Stack>
      )}

      {screen === 'supervisor' && (
        <Stack spacing={2}>
          <KpiRow
            items={[
              {
                label: 'Ready',
                value: supervisorQueue.filter((r) => r.status === 'Ready').length,
                tone: 'ok',
              },
              {
                label: 'Needs Review',
                value: supervisorQueue.filter((r) => r.status === 'Needs Review').length,
                tone: 'warn',
              },
              {
                label: 'Blocked',
                value: supervisorQueue.filter((r) => r.status === 'Blocked').length,
                tone: 'danger',
              },
            ]}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              select
              size="small"
              label="Area"
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="">All areas</MenuItem>
              {['Zone A', 'Zone B', 'Zone C', 'Shipping'].map((a) => (
                <MenuItem key={a} value={a}>
                  {a}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All statuses</MenuItem>
              {['Ready', 'Needs Review', 'Blocked'].map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Severity"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="">All severities</MenuItem>
              {['Low', 'Medium', 'High', 'Critical'].map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <Button variant="outlined" onClick={() => go('analytics')}>
              Analytics
            </Button>
          </Stack>
          <PanelCard title="Verification & Exception Queue">
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Pallet', 'SKU', 'Status', 'Severity', 'Area', 'Operator', 'Age', 'Actions'].map(
                    (h) => (
                      <TableCell key={h} sx={{ fontWeight: 700 }}>
                        {h}
                      </TableCell>
                    ),
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredQueue.map((r) => (
                  <TableRow key={`${r.palletId}-${r.status}`} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{r.palletId}</TableCell>
                    <TableCell>{r.sku}</TableCell>
                    <TableCell>
                      <StatusPill
                        label={r.status}
                        tone={
                          r.status === 'Ready' ? 'ok' : r.status === 'Blocked' ? 'danger' : 'warn'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {r.severity === '—' ? '—' : <SeverityPill severity={r.severity.toLowerCase()} />}
                    </TableCell>
                    <TableCell>{r.area}</TableCell>
                    <TableCell>{r.operator}</TableCell>
                    <TableCell>{r.age}</TableCell>
                    <TableCell>
                      {r.status === 'Needs Review' || r.status === 'Blocked' ? (
                        <Stack direction="row" spacing={0.5}>
                          <Button size="small" onClick={() => flash(`Approved ${r.palletId}`)}>
                            Approve
                          </Button>
                          <Button size="small" color="warning" onClick={() => flash('Correction requested')}>
                            Correct
                          </Button>
                        </Stack>
                      ) : (
                        <Button size="small" onClick={() => flash('Closed')}>
                          Close
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </PanelCard>
          <ActionBar onBack={() => go('home')} primaryLabel="New Verification" onPrimary={() => go('home')} />
        </Stack>
      )}

      {screen === 'analytics' && (
        <Stack spacing={2}>
          <KpiRow
            items={[
              { label: 'Total verified', value: palletAnalytics.totalVerified },
              { label: 'Exceptions today', value: palletAnalytics.exceptionsToday, tone: 'warn' },
              { label: 'Avg review time', value: palletAnalytics.avgReviewTime },
            ]}
          />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
            }}
          >
            <BarPanel title="Defects by Issue Type" data={palletAnalytics.byIssueType} />
            <BarPanel title="Defects by SKU" data={palletAnalytics.bySku} />
            <BarPanel title="Defects by Area" data={palletAnalytics.byArea} />
            <BarPanel title="Defects by Shift" data={palletAnalytics.byShift} />
          </Box>
          <ActionBar
            onBack={() => go('supervisor')}
            primaryLabel="New Verification"
            onPrimary={() => go('home')}
          />
        </Stack>
      )}

      {/* Scan modal */}
      <Dialog open={scanOpen} onClose={() => setScanOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Scan Pallet</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              height: 160,
              borderRadius: 2,
              bgcolor: '#0f172a',
              color: '#94a3b8',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px dashed rgba(255,255,255,0.2)',
            }}
          >
            <Typography variant="body2">Align barcode in frame</Typography>
            <Typography variant="caption">Simulated scanner</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScanOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={identifyPallet} sx={{ bgcolor: LOGISTICS_ACCENT }}>
            Simulate Scan
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={manualOpen} onClose={() => setManualOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Enter Pallet ID</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            size="small"
            label="Pallet ID"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManualOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={identifyPallet} sx={{ bgcolor: LOGISTICS_ACCENT }}>
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={issueOpen} onClose={() => setIssueOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Flag Issue</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            size="small"
            label="Issue type"
            value={manualIssueType}
            onChange={(e) => setManualIssueType(e.target.value)}
            sx={{ mt: 1, mb: 1.5 }}
          >
            {issueCategories.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            size="small"
            multiline
            minRows={3}
            label="Comment"
            value={manualIssueComment}
            onChange={(e) => setManualIssueComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIssueOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => {
              setIssues((list) => [
                ...list,
                {
                  id: `iss-manual-${Date.now()}`,
                  type: manualIssueType,
                  severity: 'Medium',
                  confidence: 100,
                  location: 'Manual flag',
                  requiredAction: 'Supervisor review',
                  status: 'confirmed',
                  aiLabel: manualIssueType,
                  comment: manualIssueComment,
                },
              ]);
              setIssueOpen(false);
              setManualIssueComment('');
              flash('Issue added');
            }}
          >
            Add Issue
          </Button>
        </DialogActions>
      </Dialog>

      <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block', mt: 3 }}>
        Prototype Coach draft · Phase 1 Guided Verification MVP · Sample pallet {pallet.palletId} ·
        Does not automate Quality release · Designer + QA/Validation review required.
      </Typography>
    </LogisticsPageShell>
  );
}

function InfoGrid({ rows }: { rows: [string, string][] }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        gap: 1.2,
      }}
    >
      {rows.map(([k, v]) => (
        <Box key={k}>
          <Typography variant="caption" sx={{ color: lx.textMuted, fontWeight: 700 }}>
            {k}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {v}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function ActionBar({
  onBack,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  secondaryLabel,
  onSecondary,
}: {
  onBack: () => void;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  return (
    <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap" useFlexGap sx={{ pt: 1 }}>
      <Button onClick={onBack}>Back</Button>
      {secondaryLabel && onSecondary ? (
        <Button variant="outlined" color="warning" onClick={onSecondary}>
          {secondaryLabel}
        </Button>
      ) : null}
      <Button
        variant="contained"
        disabled={primaryDisabled}
        onClick={onPrimary}
        sx={{ bgcolor: LOGISTICS_ACCENT, fontWeight: 800 }}
      >
        {primaryLabel}
      </Button>
    </Stack>
  );
}

function BarPanel({ title, data }: { title: string; data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <PanelCard title={title}>
      <Stack spacing={1}>
        {data.map((d) => (
          <Box key={d.label}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {d.label}
              </Typography>
              <Typography variant="caption">{d.value}</Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={(d.value / max) * 100}
              sx={{ height: 8, borderRadius: 1, mt: 0.4 }}
            />
          </Box>
        ))}
      </Stack>
    </PanelCard>
  );
}
