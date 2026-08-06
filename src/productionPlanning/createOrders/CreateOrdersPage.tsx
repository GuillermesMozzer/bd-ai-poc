import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  AutoAwesome as AutoAwesomeIcon,
  CheckCircle as CheckCircleIcon,
  Circle as CircleIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FileDownload as ExportIcon,
  PlayArrow as SimulateIcon,
  Verified as ValidateIcon,
  CalendarMonth as CalendarIcon,
  Factory as FactoryIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import {planningTokens} from '../ui/planningTheme';
import {
  AI_ANALYSIS_STEPS,
  AI_IMPACT_PANELS,
  AI_RECOMMENDATIONS,
  CANDIDATE_ROWS,
  MANUAL_AI_SUGGESTION,
  MANUAL_IMPACT_PANELS,
  PLANNED_ORDER_REVIEW_ROWS,
  VALIDATION_ISSUES,
  type AiObjective,
  type AiRecommendationRow,
  type CandidateRow,
  type CreationMode,
  type ImpactPanel,
  type ManualOrderRow,
  type ManualOrderType,
  type PlanningSource,
  type ValidationIssue,
} from './mock';

// ── Constants ────────────────────────────────────────────────────────────────

const MODE_STEPS: Record<CreationMode, string[]> = {
  'ai-assisted':   ['Choose Objective', 'AI Analysis', 'Review Recommendations', 'Impact Simulation', 'Create Orders'],
  'planned-order': ['Select Planning Source', 'Candidate Selection', 'Review Planned Orders', 'Validation', 'Create Planned Orders'],
  'manual':        ['Order Type & Canvas', 'AI Assistance', 'Validation', 'Impact Simulation', 'Create Orders'],
};

const MODE_LABEL: Record<CreationMode, string> = {
  'ai-assisted':   'AI-Assisted Creation',
  'planned-order': 'Planned Order Creation',
  'manual':        'Manual Creation',
};

// ── Shared sub-components ────────────────────────────────────────────────────

function ImpactSimulationPanel({panels}: {panels: ImpactPanel[]}) {
  const toneColor = (tone: ImpactPanel['tone']) =>
    tone === 'good' ? planningTokens.success : tone === 'warning' ? planningTokens.warning : planningTokens.textSecondary;

  return (
    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr 1fr', sm: 'repeat(3, 1fr)'}, gap: 2}}>
      {panels.map((p) => (
        <Paper
          key={p.id}
          elevation={0}
          sx={{p: 2.5, borderRadius: 2, border: `1px solid ${planningTokens.border}`, bgcolor: planningTokens.surface}}
        >
          <Typography sx={{fontSize: 11, fontWeight: 700, color: planningTokens.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5}}>
            {p.title}
          </Typography>
          <Stack direction="row" alignItems="flex-end" gap={2}>
            <Box>
              <Typography sx={{fontSize: 11, color: planningTokens.textSecondary, mb: 0.25}}>Current</Typography>
              <Typography sx={{fontSize: 18, fontWeight: 700, color: planningTokens.textPrimary}}>{p.current}</Typography>
            </Box>
            <Typography sx={{fontSize: 18, color: planningTokens.textSecondary, mb: 0.25}}>→</Typography>
            <Box>
              <Typography sx={{fontSize: 11, color: planningTokens.textSecondary, mb: 0.25}}>Proposed</Typography>
              <Typography sx={{fontSize: 18, fontWeight: 700, color: planningTokens.textPrimary}}>{p.proposed}</Typography>
            </Box>
            {p.delta && (
              <Chip
                label={p.delta}
                size="small"
                sx={{bgcolor: `color-mix(in srgb, ${toneColor(p.tone)} 13%, transparent)`, color: toneColor(p.tone), fontWeight: 700, border: `1px solid color-mix(in srgb, ${toneColor(p.tone)} 25%, transparent)`, ml: 'auto'}}
              />
            )}
          </Stack>
        </Paper>
      ))}
    </Box>
  );
}

function ValidationPanel({issues}: {issues: ValidationIssue[]}) {
  const severityProps = (sev: ValidationIssue['severity']) => {
    if (sev === 'error')   return {color: 'error' as const,   icon: '✕', bg: planningTokens.dangerBg};
    if (sev === 'warning') return {color: 'warning' as const, icon: '⚠', bg: planningTokens.warningBg};
    return                        {color: 'info' as const,    icon: 'ℹ', bg: '#EFF6FF'};
  };

  return (
    <Stack gap={1.5}>
      {issues.map((issue) => {
        const {color, icon, bg} = severityProps(issue.severity);
        return (
          <Alert
            key={issue.id}
            severity={color}
            sx={{bgcolor: bg, '& .MuiAlert-icon': {pt: 1.5}}}
          >
            <Typography sx={{fontSize: 13, fontWeight: 600}}>{issue.message}</Typography>
            <Typography sx={{fontSize: 12, color: planningTokens.textSecondary, mt: 0.5}}>
              Recommendation: {issue.recommendation}
            </Typography>
            <Chip
              label={issue.category.replace('-', ' ')}
              size="small"
              sx={{mt: 0.75, textTransform: 'capitalize', fontSize: 11, height: 20}}
            />
          </Alert>
        );
      })}
    </Stack>
  );
}

// ── Mode 1: AI-Assisted steps ────────────────────────────────────────────────

const AI_OBJECTIVES: {id: AiObjective; label: string; description: string; icon: React.ReactNode; badge?: string}[] = [
  {id: 'fill-capacity',        label: 'Fill Available Capacity',     icon: <FactoryIcon />,    description: 'Identify unused production capacity and recommend orders that maximize utilization.'},
  {id: 'protect-service-level',label: 'Protect Service Level',       icon: <ValidateIcon />,   description: 'Generate orders that prevent stockouts and support customer demand.'},
  {id: 'reduce-bottlenecks',   label: 'Reduce Bottlenecks',          icon: <SimulateIcon />,   description: 'Generate orders optimized around constrained resources.'},
  {id: 'inventory-replenishment',label:'Inventory Replenishment',    icon: <InventoryIcon />,  description: 'Generate orders to restore target inventory levels.'},
  {id: 'ai-recommended',       label: 'AI Recommended Package',      icon: <AutoAwesomeIcon />,description: 'AI chooses the optimal combination of actions based on all available signals.', badge: 'Recommended'},
];

function Step_AI_ChooseObjective({value, onChange}: {value: AiObjective | null; onChange: (v: AiObjective) => void}) {
  return (
    <Box>
      <Typography sx={{fontSize: 15, fontWeight: 700, mb: 0.5}}>What do you want to achieve?</Typography>
      <Typography sx={{fontSize: 13, color: planningTokens.textSecondary, mb: 3}}>
        Select an objective and AI will tailor its analysis and recommendations accordingly.
      </Typography>
      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: '1fr 1fr'}, gap: 2}}>
        {AI_OBJECTIVES.map((obj) => {
          const selected = value === obj.id;
          return (
            <Paper
              key={obj.id}
              elevation={0}
              onClick={() => onChange(obj.id)}
              sx={{
                p: 2.5, borderRadius: 2, cursor: 'pointer', transition: 'all 0.15s',
                border: `2px solid ${selected ? planningTokens.primaryBlue : planningTokens.border}`,
                bgcolor: selected ? '#EEF4FF' : planningTokens.surface,
                '&:hover': {borderColor: planningTokens.primaryBlue, bgcolor: '#F5F9FF'},
              }}
            >
              <Stack direction="row" alignItems="flex-start" gap={1.5}>
                <Box sx={{color: selected ? planningTokens.primaryBlue : planningTokens.textSecondary, mt: 0.25, flexShrink: 0}}>
                  {obj.icon}
                </Box>
                <Box sx={{flex: 1}}>
                  <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
                    <Typography sx={{fontSize: 13, fontWeight: 700}}>{obj.label}</Typography>
                    {obj.badge && (
                      <Chip label={obj.badge} size="small" sx={{bgcolor: planningTokens.successBg, color: planningTokens.success, border: `1px solid ${planningTokens.successBorder}`, fontWeight: 700, fontSize: 10, height: 18}} />
                    )}
                  </Stack>
                  <Typography sx={{fontSize: 12, color: planningTokens.textSecondary, lineHeight: 1.5}}>{obj.description}</Typography>
                </Box>
              </Stack>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}

function Step_AI_Analysis({onComplete}: {onComplete: () => void}) {
  const [doneTo, setDoneTo] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let current = 0;
    function advance() {
      setDoneTo(current);
      current++;
      if (current < AI_ANALYSIS_STEPS.length) {
        timerRef.current = setTimeout(advance, AI_ANALYSIS_STEPS[current - 1]?.durationMs ?? 700);
      } else {
        timerRef.current = setTimeout(onComplete, 400);
      }
    }
    timerRef.current = setTimeout(advance, 400);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [onComplete]);

  const progress = doneTo < 0 ? 0 : Math.round(((doneTo + 1) / AI_ANALYSIS_STEPS.length) * 100);

  return (
    <Box>
      <Stack direction="row" alignItems="center" gap={1.5} mb={3}>
        <AutoAwesomeIcon sx={{color: planningTokens.aiAccent, fontSize: 22}} />
        <Box>
          <Typography sx={{fontSize: 15, fontWeight: 700}}>AI is analyzing your planning signals</Typography>
          <Typography sx={{fontSize: 12, color: planningTokens.textSecondary}}>This usually takes a few seconds…</Typography>
        </Box>
      </Stack>
      <LinearProgress variant="determinate" value={progress} sx={{height: 6, borderRadius: 3, mb: 3, bgcolor: planningTokens.border, '& .MuiLinearProgress-bar': {bgcolor: planningTokens.primaryBlue}}} />
      <Stack gap={1.25}>
        {AI_ANALYSIS_STEPS.map((s, i) => {
          const done = i <= doneTo;
          const active = i === doneTo + 1;
          return (
            <Stack key={s.id} direction="row" alignItems="center" gap={1.5}>
              {done
                ? <CheckCircleIcon sx={{fontSize: 18, color: planningTokens.success, flexShrink: 0}} />
                : <CircleIcon sx={{fontSize: 18, color: active ? planningTokens.primaryBlue : planningTokens.border, flexShrink: 0}} />
              }
              <Typography sx={{fontSize: 13, color: done ? planningTokens.textPrimary : active ? planningTokens.primaryBlue : planningTokens.textSecondary, fontWeight: done || active ? 600 : 400}}>
                {s.label}
              </Typography>
              {active && <LinearProgress sx={{flex: 1, height: 3, borderRadius: 2, ml: 1}} />}
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
}

function Step_AI_ReviewRecommendations({rows, onChange}: {rows: AiRecommendationRow[]; onChange: (rows: AiRecommendationRow[]) => void}) {
  const confidenceColor = (score: number) =>
    score >= 90 ? planningTokens.success : score >= 75 ? planningTokens.warning : planningTokens.danger;

  const active = rows.filter((r) => !r.removed);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography sx={{fontSize: 15, fontWeight: 700}}>AI Recommendations</Typography>
          <Typography sx={{fontSize: 12, color: planningTokens.textSecondary}}>{active.length} orders recommended · Review and adjust before creating</Typography>
        </Box>
        <Chip label={`${active.length} Orders`} size="small" sx={{bgcolor: planningTokens.primaryBlue + '15', color: planningTokens.primaryBlue, fontWeight: 700}} />
      </Stack>
      <Paper elevation={0} sx={{border: `1px solid ${planningTokens.border}`, borderRadius: 2, overflow: 'hidden'}}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{'& th': {bgcolor: 'var(--planning-surface-muted)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: planningTokens.textSecondary, py: 1.5}}}>
              <TableCell>Product</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Suggested Line</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Confidence</TableCell>
              <TableCell>Expected Benefit</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => row.removed ? null : (
              <TableRow key={row.id} sx={{'&:last-child td': {border: 0}}}>
                <TableCell><Typography sx={{fontSize: 13, fontWeight: 600}}>{row.product}</Typography></TableCell>
                <TableCell sx={{fontSize: 13}}>{row.quantity}</TableCell>
                <TableCell sx={{fontSize: 13}}>{row.suggestedLine}</TableCell>
                <TableCell sx={{fontSize: 13}}>{row.suggestedStartDate}</TableCell>
                <TableCell>
                  <Chip label={row.priority} size="small" sx={{
                    fontSize: 11, height: 20, fontWeight: 700,
                    bgcolor: row.priority === 'High' ? planningTokens.dangerBg : row.priority === 'Medium' ? planningTokens.warningBg : planningTokens.successBg,
                    color: row.priority === 'High' ? planningTokens.danger : row.priority === 'Medium' ? planningTokens.warning : planningTokens.success,
                  }} />
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" gap={0.75}>
                    <Typography sx={{fontSize: 13, fontWeight: 700, color: confidenceColor(row.confidenceScore)}}>{row.confidenceScore}%</Typography>
                  </Stack>
                </TableCell>
                <TableCell sx={{fontSize: 12, color: planningTokens.textSecondary}}>{row.expectedBenefit}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" justifyContent="flex-end" gap={0.5}>
                    <Tooltip title="Edit">
                      <IconButton size="small"><EditIcon sx={{fontSize: 15}} /></IconButton>
                    </Tooltip>
                    <Tooltip title="Remove">
                      <IconButton size="small" onClick={() => onChange(rows.map((r) => r.id === row.id ? {...r, removed: true} : r))}>
                        <DeleteIcon sx={{fontSize: 15, color: planningTokens.danger}} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

function Step_AI_CreateOrders() {
  return (
    <Box>
      <Typography sx={{fontSize: 15, fontWeight: 700, mb: 0.5}}>Ready to Create Orders</Typography>
      <Typography sx={{fontSize: 13, color: planningTokens.textSecondary, mb: 3}}>
        Review the summary below and choose how to proceed with the AI recommendations.
      </Typography>
      <Paper elevation={0} sx={{p: 3, borderRadius: 2, border: `1px solid ${planningTokens.successBorder}`, bgcolor: planningTokens.successBg, mb: 3}}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <CheckCircleIcon sx={{color: planningTokens.success, fontSize: 28}} />
          <Box>
            <Typography sx={{fontSize: 14, fontWeight: 700, color: planningTokens.success}}>6 Orders Ready to Create</Typography>
            <Typography sx={{fontSize: 12, color: planningTokens.textSecondary}}>All recommendations validated · No blocking issues detected</Typography>
          </Box>
        </Stack>
      </Paper>
      <Stack direction="row" gap={1.5} flexWrap="wrap">
        <Button variant="contained" startIcon={<AddIcon />} sx={{bgcolor: planningTokens.primaryBlue, '&:hover': {bgcolor: planningTokens.primaryBlueAlt}, textTransform: 'none', fontWeight: 700}}>
          Create Orders
        </Button>
        <Button variant="outlined" startIcon={<InventoryIcon />} sx={{textTransform: 'none'}}>Save Scenario</Button>
        <Button variant="outlined" startIcon={<AutoAwesomeIcon />} sx={{textTransform: 'none'}}>Recalculate</Button>
        <Button variant="outlined" startIcon={<ExportIcon />} sx={{textTransform: 'none'}}>Export Recommendation</Button>
      </Stack>
    </Box>
  );
}

// ── Mode 2: Planned Order steps ──────────────────────────────────────────────

const PLANNING_SOURCES: {id: PlanningSource; label: string; description: string}[] = [
  {id: 'approved-mps', label: 'Approved MPS',        description: 'Generate Planned Orders from approved Master Production Schedule entries.'},
  {id: 'approved-mrp', label: 'Approved MRP',        description: 'Generate Planned Orders from approved MRP recommendations.'},
  {id: 'combined',     label: 'Combined MPS + MRP',  description: 'Generate Planned Orders from both approved sources.'},
];

function Step_PO_SelectSource({value, onChange}: {value: PlanningSource | null; onChange: (v: PlanningSource) => void}) {
  return (
    <Box>
      <Typography sx={{fontSize: 15, fontWeight: 700, mb: 0.5}}>Select Planning Source</Typography>
      <Typography sx={{fontSize: 13, color: planningTokens.textSecondary, mb: 3}}>
        Choose which approved planning signals to use for generating Planned Orders.
      </Typography>
      <Stack gap={2}>
        {PLANNING_SOURCES.map((src) => {
          const selected = value === src.id;
          return (
            <Paper
              key={src.id}
              elevation={0}
              onClick={() => onChange(src.id)}
              sx={{
                p: 2.5, borderRadius: 2, cursor: 'pointer', transition: 'all 0.15s',
                border: `2px solid ${selected ? planningTokens.primaryBlue : planningTokens.border}`,
                bgcolor: selected ? '#EEF4FF' : planningTokens.surface,
                '&:hover': {borderColor: planningTokens.primaryBlue, bgcolor: '#F5F9FF'},
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography sx={{fontSize: 13, fontWeight: 700, mb: 0.5}}>{src.label}</Typography>
                  <Typography sx={{fontSize: 12, color: planningTokens.textSecondary}}>{src.description}</Typography>
                </Box>
                {selected && <CheckCircleIcon sx={{color: planningTokens.primaryBlue, ml: 2, flexShrink: 0}} />}
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
}

function Step_PO_CandidateSelection({selected, onChange}: {selected: Set<string>; onChange: (s: Set<string>) => void}) {
  const allSelected = selected.size === CANDIDATE_ROWS.length;

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    onChange(next);
  };

  const toggleAll = () => onChange(allSelected ? new Set() : new Set(CANDIDATE_ROWS.map((r) => r.id)));

  const statusColor = (s: CandidateRow['inventoryStatus']) =>
    s === 'OK' ? planningTokens.success : s === 'Low' ? planningTokens.warning : planningTokens.danger;

  const readinessColor = (r: CandidateRow['materialReadiness']) =>
    r === 'Ready' ? planningTokens.success : r === 'Partial' ? planningTokens.warning : planningTokens.danger;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography sx={{fontSize: 15, fontWeight: 700}}>Candidate Selection</Typography>
          <Typography sx={{fontSize: 12, color: planningTokens.textSecondary}}>{selected.size} of {CANDIDATE_ROWS.length} selected</Typography>
        </Box>
        <Button size="small" variant="outlined" sx={{textTransform: 'none'}} onClick={toggleAll}>
          {allSelected ? 'Deselect All' : 'Select All'}
        </Button>
      </Stack>
      <Paper elevation={0} sx={{border: `1px solid ${planningTokens.border}`, borderRadius: 2, overflow: 'auto'}}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{'& th': {bgcolor: 'var(--planning-surface-muted)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: planningTokens.textSecondary, py: 1.5}}}>
              <TableCell padding="checkbox"><Checkbox size="small" checked={allSelected} indeterminate={selected.size > 0 && !allSelected} onChange={toggleAll} /></TableCell>
              <TableCell>Source Ref</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Horizon</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Inventory</TableCell>
              <TableCell>Material Readiness</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {CANDIDATE_ROWS.map((row) => (
              <TableRow key={row.id} selected={selected.has(row.id)} sx={{'&:last-child td': {border: 0}, cursor: 'pointer'}} onClick={() => toggle(row.id)}>
                <TableCell padding="checkbox"><Checkbox size="small" checked={selected.has(row.id)} /></TableCell>
                <TableCell sx={{fontSize: 12, fontFamily: 'monospace'}}>{row.sourceRef}</TableCell>
                <TableCell><Typography sx={{fontSize: 13, fontWeight: 600}}>{row.product}</Typography></TableCell>
                <TableCell sx={{fontSize: 13}}>{row.quantity}</TableCell>
                <TableCell sx={{fontSize: 13}}>{row.dueDate}</TableCell>
                <TableCell sx={{fontSize: 12, color: planningTokens.textSecondary}}>{row.planningHorizon}</TableCell>
                <TableCell>
                  <Chip label={row.planningSource} size="small" sx={{fontSize: 10, height: 18, fontWeight: 700, bgcolor: row.planningSource === 'MPS' ? '#EEF4FF' : '#F5F0FF', color: row.planningSource === 'MPS' ? planningTokens.primaryBlue : '#7C3AED'}} />
                </TableCell>
                <TableCell>
                  <Chip label={row.inventoryStatus} size="small" sx={{fontSize: 10, height: 18, fontWeight: 700, bgcolor: statusColor(row.inventoryStatus) + '20', color: statusColor(row.inventoryStatus)}} />
                </TableCell>
                <TableCell>
                  <Chip label={row.materialReadiness} size="small" sx={{fontSize: 10, height: 18, fontWeight: 700, bgcolor: readinessColor(row.materialReadiness) + '20', color: readinessColor(row.materialReadiness)}} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

function Step_PO_ReviewOrders() {
  const confidenceColor = (score: number) =>
    score >= 90 ? planningTokens.success : score >= 75 ? planningTokens.warning : planningTokens.danger;

  const materialColor = (s: 'Ready' | 'Partial' | 'Missing') =>
    s === 'Ready' ? planningTokens.success : s === 'Partial' ? planningTokens.warning : planningTokens.danger;

  return (
    <Box>
      <Typography sx={{fontSize: 15, fontWeight: 700, mb: 0.5}}>Review Planned Orders</Typography>
      <Typography sx={{fontSize: 13, color: planningTokens.textSecondary, mb: 2}}>
        Review the generated Planned Orders before running validation.
      </Typography>
      <Paper elevation={0} sx={{border: `1px solid ${planningTokens.border}`, borderRadius: 2, overflow: 'hidden'}}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{'& th': {bgcolor: 'var(--planning-surface-muted)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: planningTokens.textSecondary, py: 1.5}}}>
              <TableCell>Product</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Suggested Date</TableCell>
              <TableCell>Suggested Line</TableCell>
              <TableCell>Material Status</TableCell>
              <TableCell>Confidence</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {PLANNED_ORDER_REVIEW_ROWS.map((row) => (
              <TableRow key={row.id} sx={{'&:last-child td': {border: 0}}}>
                <TableCell><Typography sx={{fontSize: 13, fontWeight: 600}}>{row.product}</Typography></TableCell>
                <TableCell sx={{fontSize: 13}}>{row.quantity}</TableCell>
                <TableCell sx={{fontSize: 13}}>{row.suggestedDate}</TableCell>
                <TableCell sx={{fontSize: 13}}>{row.suggestedLine}</TableCell>
                <TableCell>
                  <Chip label={row.materialStatus} size="small" sx={{fontSize: 10, height: 18, fontWeight: 700, bgcolor: materialColor(row.materialStatus) + '20', color: materialColor(row.materialStatus)}} />
                </TableCell>
                <TableCell>
                  <Typography sx={{fontSize: 13, fontWeight: 700, color: confidenceColor(row.planningConfidence)}}>{row.planningConfidence}%</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

function Step_PO_CreateOrders() {
  const errors = VALIDATION_ISSUES.filter((i) => i.severity === 'error').length;
  const warnings = VALIDATION_ISSUES.filter((i) => i.severity === 'warning').length;

  return (
    <Box>
      <Typography sx={{fontSize: 15, fontWeight: 700, mb: 0.5}}>Create Planned Orders</Typography>
      <Typography sx={{fontSize: 13, color: planningTokens.textSecondary, mb: 3}}>
        Finalize and release the Planned Orders from your selection.
      </Typography>
      {errors > 0 && (
        <Alert severity="error" sx={{mb: 2}}>
          {errors} blocking issue{errors > 1 ? 's' : ''} detected — resolve before creating orders.
        </Alert>
      )}
      {warnings > 0 && (
        <Alert severity="warning" sx={{mb: 2}}>
          {warnings} warning{warnings > 1 ? 's' : ''} — review before proceeding.
        </Alert>
      )}
      <Stack direction="row" gap={1.5} flexWrap="wrap">
        <Button variant="contained" startIcon={<AddIcon />} disabled={errors > 0} sx={{bgcolor: planningTokens.primaryBlue, '&:hover': {bgcolor: planningTokens.primaryBlueAlt}, textTransform: 'none', fontWeight: 700}}>
          Create Planned Orders
        </Button>
        <Button variant="outlined" startIcon={<InventoryIcon />} sx={{textTransform: 'none'}}>Save Draft</Button>
        <Button variant="outlined" startIcon={<ExportIcon />} sx={{textTransform: 'none'}}>Export List</Button>
      </Stack>
    </Box>
  );
}

// ── Mode 3: Manual steps ─────────────────────────────────────────────────────

const EMPTY_ROW = (): ManualOrderRow => ({
  id: `row-${Date.now()}-${Math.random()}`,
  orderType: 'WO',
  product: '',
  quantity: '',
  targetDate: '',
  priority: 'Medium',
  line: '',
});

function Step_Manual_Canvas({orderType, onOrderTypeChange, rows, onRowsChange, constraintsOpen, onConstraintsToggle}: {
  orderType: ManualOrderType;
  onOrderTypeChange: (v: ManualOrderType) => void;
  rows: ManualOrderRow[];
  onRowsChange: (r: ManualOrderRow[]) => void;
  constraintsOpen: boolean;
  onConstraintsToggle: () => void;
}) {
  const update = (id: string, field: keyof ManualOrderRow, value: string) =>
    onRowsChange(rows.map((r) => r.id === id ? {...r, [field]: value} : r));

  const remove = (id: string) => onRowsChange(rows.filter((r) => r.id !== id));

  return (
    <Box>
      <Typography sx={{fontSize: 15, fontWeight: 700, mb: 0.5}}>Order Type & Planning Canvas</Typography>
      <Typography sx={{fontSize: 13, color: planningTokens.textSecondary, mb: 2}}>
        Define the orders you want to create. Add rows for each order.
      </Typography>

      <Stack direction="row" alignItems="center" gap={2} mb={3}>
        <Typography sx={{fontSize: 13, fontWeight: 600, color: planningTokens.textSecondary}}>Order Type:</Typography>
        <ToggleButtonGroup value={orderType} exclusive onChange={(_, v) => v && onOrderTypeChange(v)} size="small">
          <ToggleButton value="WO"      sx={{textTransform: 'none', fontSize: 13, px: 2}}>Work Orders</ToggleButton>
          <ToggleButton value="Planned" sx={{textTransform: 'none', fontSize: 13, px: 2}}>Planned Orders</ToggleButton>
          <ToggleButton value="Both"    sx={{textTransform: 'none', fontSize: 13, px: 2}}>Both</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Paper elevation={0} sx={{border: `1px solid ${planningTokens.border}`, borderRadius: 2, overflow: 'hidden', mb: 2}}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{'& th': {bgcolor: 'var(--planning-surface-muted)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: planningTokens.textSecondary, py: 1.5}}}>
              {orderType === 'Both' && <TableCell>Type</TableCell>}
              <TableCell>Product</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Target Date</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Line</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} sx={{'&:last-child td': {border: 0}}}>
                {orderType === 'Both' && (
                  <TableCell>
                    <Select value={row.orderType} size="small" onChange={(e) => update(row.id, 'orderType', e.target.value)} sx={{fontSize: 12, minWidth: 100}}>
                      <MenuItem value="WO" sx={{fontSize: 12}}>WO</MenuItem>
                      <MenuItem value="Planned" sx={{fontSize: 12}}>Planned</MenuItem>
                    </Select>
                  </TableCell>
                )}
                <TableCell><TextField value={row.product}    size="small" placeholder="Product code" onChange={(e) => update(row.id, 'product', e.target.value)}    inputProps={{style: {fontSize: 13}}} /></TableCell>
                <TableCell><TextField value={row.quantity}   size="small" placeholder="Quantity"     onChange={(e) => update(row.id, 'quantity', e.target.value)}   inputProps={{style: {fontSize: 13}}} /></TableCell>
                <TableCell><TextField value={row.targetDate} size="small" placeholder="YYYY-MM-DD"   onChange={(e) => update(row.id, 'targetDate', e.target.value)} inputProps={{style: {fontSize: 13}}} /></TableCell>
                <TableCell>
                  <Select value={row.priority} size="small" onChange={(e) => update(row.id, 'priority', e.target.value)} sx={{fontSize: 12, minWidth: 90}}>
                    <MenuItem value="High"   sx={{fontSize: 12}}>High</MenuItem>
                    <MenuItem value="Medium" sx={{fontSize: 12}}>Medium</MenuItem>
                    <MenuItem value="Low"    sx={{fontSize: 12}}>Low</MenuItem>
                  </Select>
                </TableCell>
                <TableCell><TextField value={row.line} size="small" placeholder="Line" onChange={(e) => update(row.id, 'line', e.target.value)} inputProps={{style: {fontSize: 13}}} /></TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => remove(row.id)}>
                    <DeleteIcon sx={{fontSize: 15, color: planningTokens.danger}} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Stack direction="row" gap={1} mb={3}>
        <Button size="small" variant="outlined" startIcon={<AddIcon />} sx={{textTransform: 'none'}} onClick={() => onRowsChange([...rows, EMPTY_ROW()])}>
          Add Row
        </Button>
        <Button size="small" variant="outlined" sx={{textTransform: 'none'}}>Import Excel</Button>
        <Button size="small" variant="outlined" sx={{textTransform: 'none'}}>Paste from Clipboard</Button>
      </Stack>

      <Accordion expanded={constraintsOpen} onChange={onConstraintsToggle} elevation={0} sx={{border: `1px solid ${planningTokens.border}`, borderRadius: '8px !important', '&:before': {display: 'none'}}}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{fontSize: 13, fontWeight: 600}}>Constraints & Preferences</Typography>
          <Typography sx={{fontSize: 12, color: planningTokens.textSecondary, ml: 1}}>(Optional)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
            {['Material Available Only', 'Avoid Bottlenecks', 'Minimize Changeovers', 'Preferred Lines', 'Excluded Time Windows'].map((c) => (
              <Chip key={c} label={c} size="small" variant="outlined" clickable sx={{fontSize: 12}} />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

function Step_Manual_AiAssistance({accepted, onAccept, onOverride}: {accepted: boolean; onAccept: () => void; onOverride: () => void}) {
  const s = MANUAL_AI_SUGGESTION;

  const capacityColor = s.capacityStatus === 'Available' ? planningTokens.success : s.capacityStatus === 'Tight' ? planningTokens.warning : planningTokens.danger;
  const materialColor = s.materialStatus === 'Ready' ? planningTokens.success : s.materialStatus === 'Partial' ? planningTokens.warning : planningTokens.danger;

  return (
    <Box>
      <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
        <AutoAwesomeIcon sx={{color: planningTokens.aiAccent, fontSize: 20}} />
        <Typography sx={{fontSize: 15, fontWeight: 700}}>AI Assistance</Typography>
      </Stack>
      <Typography sx={{fontSize: 13, color: planningTokens.textSecondary, mb: 3}}>
        Even in Manual mode, AI can suggest optimal scheduling. You can accept or override.
      </Typography>

      <Paper elevation={0} sx={{p: 3, borderRadius: 2, border: `2px solid ${accepted ? planningTokens.successBorder : planningTokens.border}`, bgcolor: accepted ? planningTokens.successBg : planningTokens.surface, mb: 2}}>
        <Stack direction="row" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Stack gap={1.5}>
            <Stack direction="row" alignItems="center" gap={1.5}>
              <FactoryIcon sx={{fontSize: 16, color: planningTokens.primaryBlue}} />
              <Box>
                <Typography sx={{fontSize: 11, color: planningTokens.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4}}>Suggested Line</Typography>
                <Typography sx={{fontSize: 14, fontWeight: 700}}>{s.suggestedLine}</Typography>
              </Box>
            </Stack>
            <Stack direction="row" alignItems="center" gap={1.5}>
              <CalendarIcon sx={{fontSize: 16, color: planningTokens.primaryBlue}} />
              <Box>
                <Typography sx={{fontSize: 11, color: planningTokens.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4}}>Suggested Start Date</Typography>
                <Typography sx={{fontSize: 14, fontWeight: 700}}>{s.suggestedStartDate}</Typography>
              </Box>
            </Stack>
          </Stack>
          <Stack gap={1.5}>
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Box>
                <Typography sx={{fontSize: 11, color: planningTokens.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4}}>Capacity Status</Typography>
                <Chip label={s.capacityStatus} size="small" sx={{mt: 0.25, fontWeight: 700, bgcolor: capacityColor + '20', color: capacityColor}} />
              </Box>
            </Stack>
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Box>
                <Typography sx={{fontSize: 11, color: planningTokens.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4}}>Material Status</Typography>
                <Chip label={s.materialStatus} size="small" sx={{mt: 0.25, fontWeight: 700, bgcolor: materialColor + '20', color: materialColor}} />
              </Box>
            </Stack>
          </Stack>
          <Box>
            <Typography sx={{fontSize: 11, color: planningTokens.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4}}>Confidence Score</Typography>
            <Typography sx={{fontSize: 28, fontWeight: 900, color: planningTokens.primaryBlue, lineHeight: 1.1}}>{s.confidenceScore}%</Typography>
          </Box>
        </Stack>
      </Paper>

      <Stack direction="row" gap={1.5}>
        {accepted
          ? <Chip icon={<CheckCircleIcon />} label="AI Suggestion Accepted" sx={{bgcolor: planningTokens.successBg, color: planningTokens.success, fontWeight: 700, border: `1px solid ${planningTokens.successBorder}`}} />
          : <>
              <Button variant="contained" sx={{bgcolor: planningTokens.primaryBlue, '&:hover': {bgcolor: planningTokens.primaryBlueAlt}, textTransform: 'none', fontWeight: 700}} onClick={onAccept}>
                Accept Suggestion
              </Button>
              <Button variant="outlined" sx={{textTransform: 'none'}} onClick={onOverride}>Override</Button>
            </>
        }
      </Stack>
    </Box>
  );
}

function Step_Manual_CreateOrders() {
  return (
    <Box>
      <Typography sx={{fontSize: 15, fontWeight: 700, mb: 0.5}}>Create Orders</Typography>
      <Typography sx={{fontSize: 13, color: planningTokens.textSecondary, mb: 3}}>
        Finalize your manually defined orders.
      </Typography>
      <Stack direction="row" gap={1.5} flexWrap="wrap">
        <Button variant="outlined" startIcon={<ValidateIcon />} sx={{textTransform: 'none'}}>Validate</Button>
        <Button variant="outlined" startIcon={<SimulateIcon />} sx={{textTransform: 'none'}}>Simulate</Button>
        <Button variant="contained" startIcon={<AddIcon />} sx={{bgcolor: planningTokens.primaryBlue, '&:hover': {bgcolor: planningTokens.primaryBlueAlt}, textTransform: 'none', fontWeight: 700}}>
          Create Orders
        </Button>
      </Stack>
    </Box>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

interface CreateOrdersPageProps {
  onBack: () => void;
}

export default function CreateOrdersPage({onBack}: CreateOrdersPageProps) {
  const [mode, setMode] = useState<CreationMode | null>(null);
  const [step, setStep] = useState(0);

  // Mode 1 state
  const [aiObjective, setAiObjective] = useState<AiObjective | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [recommendations, setRecommendations] = useState<AiRecommendationRow[]>([...AI_RECOMMENDATIONS]);

  // Mode 2 state
  const [planningSource, setPlanningSource] = useState<PlanningSource | null>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());

  // Mode 3 state
  const [orderType, setOrderType] = useState<ManualOrderType>('WO');
  const [manualRows, setManualRows] = useState<ManualOrderRow[]>([EMPTY_ROW()]);
  const [constraintsOpen, setConstraintsOpen] = useState(false);
  const [aiSuggestionAccepted, setAiSuggestionAccepted] = useState(false);

  const handleAnalysisComplete = useCallback(() => setAnalysisComplete(true), []);

  const selectMode = (m: CreationMode) => {
    setMode(m);
    setStep(0);
    // Reset step-specific state when switching mode
    setAnalysisComplete(false);
  };

  const steps = mode ? MODE_STEPS[mode] : [];
  const isLastStep = mode ? step === steps.length - 1 : false;

  const canGoNext = () => {
    if (!mode) return false;
    if (mode === 'ai-assisted' && step === 0 && !aiObjective) return false;
    if (mode === 'ai-assisted' && step === 1 && !analysisComplete) return false;
    if (mode === 'planned-order' && step === 0 && !planningSource) return false;
    if (mode === 'planned-order' && step === 1 && selectedCandidates.size === 0) return false;
    return true;
  };

  const goNext = () => { if (!isLastStep) setStep((s) => s + 1); };
  const goBack = () => {
    if (step === 0) {
      setMode(null);
      setStep(0);
    } else {
      setStep((s) => s - 1);
    }
  };

  // Render step content
  const renderStepContent = () => {
    if (!mode) return null;

    if (mode === 'ai-assisted') {
      if (step === 0) return <Step_AI_ChooseObjective value={aiObjective} onChange={setAiObjective} />;
      if (step === 1) return <Step_AI_Analysis onComplete={handleAnalysisComplete} />;
      if (step === 2) return <Step_AI_ReviewRecommendations rows={recommendations} onChange={setRecommendations} />;
      if (step === 3) return <ImpactSimulationPanel panels={AI_IMPACT_PANELS} />;
      if (step === 4) return <Step_AI_CreateOrders />;
    }

    if (mode === 'planned-order') {
      if (step === 0) return <Step_PO_SelectSource value={planningSource} onChange={setPlanningSource} />;
      if (step === 1) return <Step_PO_CandidateSelection selected={selectedCandidates} onChange={setSelectedCandidates} />;
      if (step === 2) return <Step_PO_ReviewOrders />;
      if (step === 3) return <ValidationPanel issues={VALIDATION_ISSUES} />;
      if (step === 4) return <Step_PO_CreateOrders />;
    }

    if (mode === 'manual') {
      if (step === 0) return (
        <Step_Manual_Canvas
          orderType={orderType} onOrderTypeChange={setOrderType}
          rows={manualRows} onRowsChange={setManualRows}
          constraintsOpen={constraintsOpen} onConstraintsToggle={() => setConstraintsOpen((v) => !v)}
        />
      );
      if (step === 1) return <Step_Manual_AiAssistance accepted={aiSuggestionAccepted} onAccept={() => setAiSuggestionAccepted(true)} onOverride={() => setAiSuggestionAccepted(false)} />;
      if (step === 2) return <ValidationPanel issues={VALIDATION_ISSUES} />;
      if (step === 3) return <ImpactSimulationPanel panels={MANUAL_IMPACT_PANELS} />;
      if (step === 4) return <Step_Manual_CreateOrders />;
    }

    return null;
  };

  // ── Mode Selection Screen ──────────────────────────────────────────────────

  const MODE_CARDS: {id: CreationMode; label: string; icon: React.ReactNode; description: string; useCases: string[]; badge?: string}[] = [
    {
      id: 'ai-assisted',
      icon: <AutoAwesomeIcon sx={{fontSize: 28, color: planningTokens.aiAccent}} />,
      label: 'AI-Assisted Creation',
      description: 'Let AI analyze demand, inventory, capacity, constraints, and planning signals to recommend the best orders to create.',
      useCases: ['Capacity optimization', 'Service level protection', 'Bottleneck reduction', 'AI-driven planning decisions'],
      badge: 'Recommended',
    },
    {
      id: 'planned-order',
      icon: <CalendarIcon sx={{fontSize: 28, color: planningTokens.primaryBlue}} />,
      label: 'Planned Order Creation',
      description: 'Generate Planned Orders directly from approved MPS and MRP signals.',
      useCases: ['Formal planning process', 'MRP execution', 'Demand coverage', 'Planner review before release'],
    },
    {
      id: 'manual',
      icon: <EditIcon sx={{fontSize: 28, color: planningTokens.textSecondary}} />,
      label: 'Manual Creation',
      description: 'Create one or multiple Work Orders or Planned Orders manually with full control.',
      useCases: ['Urgent requests', 'Planner-driven creation', 'Ad-hoc production requirements'],
    },
  ];

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'var(--planning-background)'}}>
      {/* Header */}
      <Box sx={{background: 'linear-gradient(135deg, #044ED7 0%, #1D74FF 100%)', px: 3, py: 2.5, flexShrink: 0}}>
        <Stack direction="row" alignItems="center" gap={2}>
          <Tooltip title="Back to Work Orders">
            <IconButton size="small" onClick={onBack} sx={{color: 'white', p: 0.5, '&:hover': {bgcolor: 'rgba(255,255,255,0.15)'}}}>
              <BackIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Box>
            <Typography sx={{fontSize: 20, fontWeight: 900, color: 'white', lineHeight: 1.2}}>Create Orders</Typography>
            <Typography sx={{fontSize: 12, color: 'rgba(255,255,255,0.75)', mt: 0.25}}>
              {mode ? `${MODE_LABEL[mode]} · Step ${step + 1} of ${steps.length}` : 'Select creation mode'}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Stepper */}
      {mode && (
        <Paper elevation={0} square sx={{px: 4, py: 2, borderBottom: `1px solid ${planningTokens.border}`, flexShrink: 0}}>
          <Stepper activeStep={step} alternativeLabel>
            {steps.map((label, i) => (
              <Step key={label} completed={i < step}>
                <StepLabel sx={{'& .MuiStepLabel-label': {fontSize: 11}}}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
      )}

      {/* Content */}
      <Box sx={{flex: 1, overflow: 'auto', p: 3}}>
        {mode === null ? (
          // Mode Selection
          <Box>
            <Typography sx={{fontSize: 16, fontWeight: 800, mb: 0.5}}>How would you like to create orders?</Typography>
            <Typography sx={{fontSize: 13, color: planningTokens.textSecondary, mb: 3}}>
              Choose the creation method that best fits your planning scenario.
            </Typography>
            <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(3, 1fr)'}, gap: 2.5}}>
              {MODE_CARDS.map((card) => (
                <Paper
                  key={card.id}
                  elevation={0}
                  onClick={() => selectMode(card.id)}
                  sx={{
                    p: 3, borderRadius: 2, cursor: 'pointer', transition: 'all 0.15s',
                    border: `2px solid ${planningTokens.border}`,
                    bgcolor: 'var(--planning-surface)',
                    '&:hover': {borderColor: planningTokens.primaryBlue, boxShadow: '0 4px 20px rgba(4,78,215,0.12)', transform: 'translateY(-1px)'},
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                    {card.icon}
                    {card.badge && (
                      <Chip label={card.badge} size="small" sx={{bgcolor: planningTokens.successBg, color: planningTokens.success, border: `1px solid ${planningTokens.successBorder}`, fontWeight: 700, fontSize: 10, height: 20}} />
                    )}
                  </Stack>
                  <Typography sx={{fontSize: 15, fontWeight: 800, mb: 1}}>{card.label}</Typography>
                  <Typography sx={{fontSize: 12, color: planningTokens.textSecondary, mb: 2, lineHeight: 1.6}}>{card.description}</Typography>
                  <Divider sx={{mb: 1.5}} />
                  <Typography sx={{fontSize: 11, fontWeight: 700, color: planningTokens.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, mb: 1}}>Use cases</Typography>
                  <Stack gap={0.5}>
                    {card.useCases.map((uc) => (
                      <Stack key={uc} direction="row" alignItems="center" gap={0.75}>
                        <Box sx={{width: 4, height: 4, borderRadius: '50%', bgcolor: planningTokens.primaryBlue, flexShrink: 0}} />
                        <Typography sx={{fontSize: 12, color: planningTokens.textSecondary}}>{uc}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              ))}
            </Box>
          </Box>
        ) : (
          renderStepContent()
        )}
      </Box>

      {/* Footer */}
      {mode && (
        <Paper elevation={0} square sx={{px: 4, py: 2, borderTop: `1px solid ${planningTokens.border}`, flexShrink: 0}}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={goBack}
              sx={{textTransform: 'none'}}
            >
              {step === 0 ? 'Change Mode' : 'Back'}
            </Button>
            {!isLastStep && (
              <Button
                variant="contained"
                onClick={goNext}
                disabled={!canGoNext()}
                sx={{bgcolor: planningTokens.primaryBlue, '&:hover': {bgcolor: planningTokens.primaryBlueAlt}, textTransform: 'none', fontWeight: 700}}
              >
                {mode === 'ai-assisted' && step === 1 && !analysisComplete ? 'Analyzing…' : 'Next'}
              </Button>
            )}
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
