import {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Radio,
  Snackbar,
  Typography,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  AutoAwesome as AutoAwesomeIcon,
  Close as CloseIcon,
  InfoOutlined as InfoOutlinedIcon,
} from '@mui/icons-material';
import type {LongTermAiAuditEvent, LongTermPlanningAiProposal} from '../aiProposalTypes';
import {acceptAiProposalLocally, createLongTermAiAuditEvent} from '../aiProposalUtils';
import {planningTokens} from '../../ui/planningTheme';
import {
  defaultForecastScenarioId,
  forecastProposalScenarios,
  scenarioComparisonRows,
  scenarioDetailTabs,
  type ForecastScenario,
  type ScenarioConstraintGroup,
  type ScenarioDetailRow,
  type ScenarioDetailTabId,
  type ScenarioKpiRow,
} from '../forecastProposalDrawerModel';
import {
  actionTrackerTableAltRowBg,
  actionTrackerTableBorderColor,
  actionTrackerTableCellBorderColor,
  actionTrackerTableHeaderBg,
  actionTrackerTableHoverBg,
} from '../../../workstation/components/MyActionTrackerWidget';

type Props = {
  open: boolean;
  proposal: LongTermPlanningAiProposal | null;
  status: 'loading' | 'ready' | 'empty' | 'error';
  staleData?: boolean;
  onClose: () => void;
  onProposalChange: (updated: LongTermPlanningAiProposal) => void;
  onAuditEvent: (event: LongTermAiAuditEvent) => void;
};

const CURRENT_USER = 'Maya Planner';

const chipToneMap: Record<string, {bg: string; color: string; border: string}> = {
  Medium: {bg: '#FFF7ED', color: '#B54708', border: '#FED7AA'},
  High: {bg: '#FEF2F2', color: '#B42318', border: '#FECDCA'},
  Low: {bg: '#ECFDF3', color: '#027A48', border: '#ABEFC6'},
  Yes: {bg: '#ECFDF3', color: '#027A48', border: '#ABEFC6'},
  No: {bg: '#FEF2F2', color: '#B42318', border: '#FECDCA'},
  Partial: {bg: '#FFF7ED', color: '#B54708', border: '#FED7AA'},
  Recommended: {bg: '#EEF4FF', color: '#044ED7', border: '#BFDBFE'},
  'Feasible with risks': {bg: '#FFF7ED', color: '#B54708', border: '#FED7AA'},
  Feasible: {bg: '#ECFDF3', color: '#027A48', border: '#ABEFC6'},
  'Not feasible': {bg: '#FEF2F2', color: '#B42318', border: '#FECDCA'},
  'Low operational risk': {bg: '#ECFDF3', color: '#027A48', border: '#ABEFC6'},
  'High risk': {bg: '#FEF2F2', color: '#B42318', border: '#FECDCA'},
  None: {bg: '#F8FAFC', color: 'var(--planning-text-secondary)', border: '#D0D5DD'},
};

function ToneChip({label}: {label: string}) {
  const tone = chipToneMap[label] ?? {bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE'};
  return (
    <Chip
      size="small"
      label={label}
      sx={{
        height: 24,
        maxWidth: '100%',
        fontSize: 11,
        fontWeight: 800,
        bgcolor: tone.bg,
        color: tone.color,
        border: `1px solid ${tone.border}`,
        '& .MuiChip-label': {
          display: 'block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
      }}
    />
  );
}

function ProposalStateView({
  title,
  description,
  tone = 'info',
}: {
  title: string;
  description: string;
  tone?: 'info' | 'warning' | 'error';
}) {
  const severityMap = {
    info: {bg: '#EFF6FF', border: '#BFDBFE', color: '#1D4ED8'},
    warning: {bg: '#FFF7ED', border: '#FED7AA', color: '#B54708'},
    error: {bg: '#FEF2F2', border: '#FECDCA', color: '#B42318'},
  } as const;
  const currentTone = severityMap[tone];
  return (
    <Paper elevation={0} sx={{p: 2.2, borderRadius: 3, border: `1px solid ${currentTone.border}`, bgcolor: currentTone.bg}}>
      <Typography sx={{fontSize: 16, fontWeight: 900, color: currentTone.color}}>{title}</Typography>
      <Typography sx={{fontSize: 13, color: planningTokens.textSecondary, mt: 0.7, lineHeight: 1.65}}>{description}</Typography>
    </Paper>
  );
}

function formatTimestamp(value?: string | null) {
  if (!value) return 'Not available';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getScenarioKpiValue(row: ScenarioKpiRow, scenarioId: string) {
  if (scenarioId === 'baseline') return row.baseline;
  if (scenarioId === 'demandSmoothing') return row.demandSmoothing;
  if (scenarioId === 'constrainedCommitment') return row.constrainedCommitment;
  if (scenarioId === 'qualityDelay') return row.qualityDelay;
  return row.capacityRecovery;
}

function ScenarioMetricsTable({rows}: {rows: ScenarioDetailRow[]}) {
  return (
    <Box sx={{overflowX: 'hidden', borderRadius: 1.6, border: `1px solid ${actionTrackerTableBorderColor}`}}>
      <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(180px, 0.9fr) minmax(0, 1.8fr)', minHeight: 42, bgcolor: actionTrackerTableHeaderBg, borderBottom: `1px solid ${actionTrackerTableCellBorderColor}`}}>
        {['Metric', 'Value'].map((label, index) => (
          <Typography
            key={label}
            sx={{
              px: 1.1,
              py: 1,
              borderRight: index === 1 ? 'none' : `1px solid ${actionTrackerTableCellBorderColor}`,
              color: '#202124',
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {label}
          </Typography>
        ))}
      </Box>
      {rows.map((row, index) => (
        <Box
          key={row.label}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'minmax(180px, 0.9fr) minmax(0, 1.8fr)',
            minHeight: 48,
            bgcolor: index % 2 === 0 ? '#FFFFFF' : actionTrackerTableAltRowBg,
            borderBottom: index === rows.length - 1 ? 'none' : `1px solid ${actionTrackerTableCellBorderColor}`,
          }}
        >
          <Box sx={{display: 'flex', alignItems: 'center', px: 1.1, py: 1, borderRight: `1px solid ${actionTrackerTableCellBorderColor}`}}>
            <Typography sx={{fontSize: 12, fontWeight: 800, color: planningTokens.textPrimary, lineHeight: 1.35}}>
              {row.label}
            </Typography>
          </Box>
          <Box sx={{display: 'flex', alignItems: 'center', px: 1.1, py: 1}}>
            <Typography sx={{fontSize: 12, color: planningTokens.textSecondary, lineHeight: 1.5}}>
              {row.value}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function ConstraintGroupTable({group}: {group: ScenarioConstraintGroup}) {
  return (
    <Paper elevation={0} sx={{borderRadius: 2.4, border: '1px solid rgba(227,232,242,0.92)', overflow: 'hidden', bgcolor: 'var(--planning-surface)'}}>
      <Box sx={{px: 1.3, py: 1.05, bgcolor: '#F8FAFF', borderBottom: `1px solid ${actionTrackerTableCellBorderColor}`}}>
        <Typography sx={{fontSize: 12, fontWeight: 900, color: '#044ED7', letterSpacing: '0.05em', textTransform: 'uppercase'}}>
          {group.label}
        </Typography>
      </Box>
      <ScenarioMetricsTable rows={group.rows} />
    </Paper>
  );
}

export default function AiForecastAssistantPanel({
  open,
  proposal,
  status,
  staleData = false,
  onClose,
  onProposalChange,
  onAuditEvent,
}: Props) {
  const [selectedScenarioId, setSelectedScenarioId] = useState(defaultForecastScenarioId);
  const [activeTab, setActiveTab] = useState<ScenarioDetailTabId>('demandCapacity');
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [selectionTouched, setSelectionTouched] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean; message: string; severity: 'success' | 'info' | 'warning'}>({open: false, message: '', severity: 'success'});

  useEffect(() => {
    if (!open) return;
    setSelectedScenarioId(defaultForecastScenarioId);
    setActiveTab('demandCapacity');
    setSelectionTouched(false);
  }, [open, proposal?.id, status]);

  const selectedScenario = useMemo(
    () => forecastProposalScenarios.find((scenario) => scenario.id === selectedScenarioId) ?? forecastProposalScenarios[1],
    [selectedScenarioId],
  );
  const recommendedScenario = useMemo(
    () => forecastProposalScenarios.find((scenario) => scenario.recommended) ?? forecastProposalScenarios[1],
    [],
  );

  const showToast = (message: string, severity: 'success' | 'info' | 'warning' = 'success') => {
    setSnackbar({open: true, message, severity});
  };

  const resetReviewState = () => {
    setSelectedScenarioId(defaultForecastScenarioId);
    setActiveTab('demandCapacity');
    setSelectionTouched(false);
  };

  const handleRequestClose = () => {
    if (selectionTouched) {
      setDiscardDialogOpen(true);
      return;
    }
    onClose();
  };

  const handleConfirmDiscard = () => {
    setDiscardDialogOpen(false);
    resetReviewState();
    onClose();
  };

  const handleAcceptProposal = () => {
    const timestamp = new Date().toISOString();
    const payload = {
      feature: 'AI Forecast Proposal',
      selectedScenario: selectedScenarioId,
      decision: 'accepted',
      timestamp,
      sourcePage: 'Production Planning > Forecasting',
    };

    if (proposal) {
      const {proposal: updated, auditEvent} = acceptAiProposalLocally(proposal, CURRENT_USER);
      onProposalChange(updated);
      onAuditEvent({
        ...auditEvent,
        comment: `${selectedScenario.name} accepted from AI Forecast Proposal drawer.`,
      });
    } else {
      onAuditEvent(createLongTermAiAuditEvent('ProposalAccepted', CURRENT_USER, `${selectedScenario.name} accepted.`));
    }

    console.info('AI Forecast Proposal payload', payload);
    setAcceptDialogOpen(false);
    resetReviewState();
    onClose();
    showToast('AI proposal accepted for local preview.');
  };

  const renderScenarioDetails = () => {
    if (activeTab === 'constraintAnalysis') {
      return (
        <Box sx={{display: 'grid', gap: 1.1}}>
          {selectedScenario.details.constraintAnalysis.map((group) => <ConstraintGroupTable key={group.id} group={group} />)}
        </Box>
      );
    }

    return <ScenarioMetricsTable rows={selectedScenario.details[activeTab]} />;
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={handleRequestClose}
        PaperProps={{
          sx: {
            width: {xs: '100vw', sm: 'clamp(620px, 44vw, 860px)'},
            maxWidth: '100vw',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: '#F6F9FF',
            backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(246,249,255,0.98))',
            boxShadow: '-12px 0 34px rgba(15,23,42,0.14)',
            boxSizing: 'border-box',
          },
        }}
      >
        <Box
          sx={{
            px: 3,
            pt: 2.5,
            pb: 2.25,
            borderBottom: '1px solid rgba(148,163,184,0.16)',
            background: 'linear-gradient(135deg, #044ED7 0%, #1D74FF 100%)',
            color: '#FFFFFF',
            flexShrink: 0,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at top right, rgba(255,255,255,0.14), transparent 42%)'}} />
          <Box sx={{position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5}}>
            <Box sx={{display: 'grid', gap: 1.05, minWidth: 0, flex: 1}}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap'}}>
                <Typography sx={{fontSize: 18, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.15}}>
                  AI Forecast Proposal
                </Typography>
                <Chip
                  label="Blue.AI"
                  size="small"
                  sx={{
                    height: 24,
                    bgcolor: 'rgba(255,255,255,0.14)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255,255,255,0.18)',
                    fontWeight: 800,
                  }}
                />
              </Box>
              <Typography sx={{fontSize: 12.5, color: 'rgba(255,255,255,0.82)'}}>
                12-month demand forecast analysis
              </Typography>
              <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.8, alignItems: 'center'}}>
                <Chip
                  icon={<AutoAwesomeIcon sx={{fontSize: 15, color: 'inherit !important'}} />}
                  label="Generated by Blue.AI"
                  size="small"
                  sx={{
                    height: 26,
                    maxWidth: '100%',
                    bgcolor: 'rgba(255,255,255,0.14)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255,255,255,0.18)',
                    fontWeight: 800,
                  }}
                />
                <Chip
                  icon={<AccessTimeIcon sx={{fontSize: 14, color: 'inherit !important'}} />}
                  label={`Last refresh: ${formatTimestamp(proposal?.generatedAt)}`}
                  size="small"
                  sx={{
                    height: 26,
                    maxWidth: '100%',
                    bgcolor: 'rgba(255,255,255,0.12)',
                    color: '#E6EEFF',
                    border: '1px solid rgba(255,255,255,0.14)',
                    fontWeight: 700,
                    '& .MuiChip-label': {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  }}
                />
              </Box>
            </Box>
            <IconButton
              onClick={handleRequestClose}
              size="small"
              aria-label="Close AI Forecast Proposal drawer"
              sx={{
                ml: 1,
                flexShrink: 0,
                color: '#FFFFFF',
                bgcolor: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.16)',
                '&:hover': {bgcolor: 'rgba(255,255,255,0.2)'},
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{flex: 1, overflowY: 'auto', overflowX: 'hidden', px: {xs: 1.25, sm: 2}, py: 1.8, bgcolor: '#F6F9FF'}}>
          {status === 'loading' ? (
            <ProposalStateView
              title="Generating AI forecast proposal..."
              description="Analyzing demand, capacity, inventory, quality, and risk signals."
            />
          ) : status === 'empty' ? (
            <ProposalStateView
              title="AI Forecast Proposal cannot be generated because forecast data is missing."
              description="Load or refresh the forecast dataset before requesting an AI proposal."
              tone="warning"
            />
          ) : status === 'error' ? (
            <ProposalStateView
              title="AI Forecast Proposal is currently unavailable."
              description="Please try again later or continue with manual forecast review."
              tone="error"
            />
          ) : (
            <Box sx={{display: 'grid', gap: 1.5, minWidth: 0}}>
              {staleData ? (
                <Alert severity="warning" icon={<InfoOutlinedIcon fontSize="inherit" />} sx={{borderRadius: 2.6, alignItems: 'center'}}>
                  Some source data is older than the configured freshness threshold. Review data freshness before accepting this proposal.
                </Alert>
              ) : null}

              <Paper elevation={0} sx={{p: 1.5, borderRadius: 3, border: '1px solid rgba(191,219,254,0.95)', bgcolor: 'var(--planning-neutral-bg)'}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', alignItems: 'flex-start'}}>
                  <Box>
                    <Typography sx={{fontSize: 12, fontWeight: 900, color: '#044ED7', textTransform: 'uppercase', letterSpacing: '0.08em'}}>
                      AI Recommended Scenario
                    </Typography>
                    <Typography sx={{fontSize: 18, fontWeight: 900, color: planningTokens.textPrimary, mt: 0.55}}>
                      {recommendedScenario.name}
                    </Typography>
                  </Box>
                  <ToneChip label="Recommended" />
                </Box>
                <Typography sx={{fontSize: 13, color: planningTokens.textSecondary, mt: 1, lineHeight: 1.7}}>
                  {recommendedScenario.recommendationSummary}
                </Typography>
                <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: '1fr 1fr'}, gap: 1, mt: 1.2}}>
                  {[
                    {label: 'Feasibility', value: recommendedScenario.feasibility},
                    {label: 'Confidence', value: recommendedScenario.confidence},
                    {label: 'Main constraint', value: recommendedScenario.mainConstraint ?? 'Not identified'},
                    {label: 'Key risk', value: recommendedScenario.keyRisk ?? 'Not identified'},
                    {label: 'Expected impact', value: recommendedScenario.expectedImpact ?? 'Not available'},
                  ].map((item) => (
                    <Box key={item.label} sx={{p: 1.05, borderRadius: 2.1, bgcolor: 'rgba(255,255,255,0.8)', border: '1px solid rgba(191,219,254,0.72)'}}>
                      <Typography sx={{fontSize: 10.5, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em'}}>
                        {item.label}
                      </Typography>
                      <Box sx={{mt: 0.45}}>
                        {chipToneMap[item.value] ? <ToneChip label={item.value} /> : <Typography sx={{fontSize: 12.5, color: planningTokens.textPrimary, fontWeight: 700}}>{item.value}</Typography>}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>

              <Paper elevation={0} sx={{p: 1.5, borderRadius: 3, border: '1px solid rgba(227,232,242,0.92)', bgcolor: 'var(--planning-surface)'}}>
                <Typography sx={{fontSize: 12, fontWeight: 900, color: '#044ED7', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.1}}>
                  Scenario Selection
                </Typography>
                <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))'}, gap: 1}}>
                  {forecastProposalScenarios.map((scenario: ForecastScenario) => {
                    const selected = scenario.id === selectedScenarioId;
                    return (
                      <Paper
                        key={scenario.id}
                        component={ButtonBase}
                        onClick={() => {
                          setSelectedScenarioId(scenario.id);
                          setSelectionTouched(scenario.id !== defaultForecastScenarioId);
                        }}
                        sx={{
                          width: '100%',
                          minWidth: 0,
                          p: 1.25,
                          textAlign: 'left',
                          borderRadius: 2.6,
                          border: selected ? '1px solid #93C5FD' : '1px solid rgba(227,232,242,0.92)',
                          bgcolor: selected ? '#EEF4FF' : '#FFFFFF',
                          boxShadow: selected ? '0 10px 20px rgba(23,105,255,0.12)' : 'none',
                          alignItems: 'stretch',
                        }}
                      >
                        <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', minWidth: 0}}>
                          <Radio
                            checked={selected}
                            value={scenario.id}
                            size="small"
                            inputProps={{'aria-label': `Select ${scenario.name}`}}
                            sx={{p: 0.1, mt: -0.2}}
                          />
                          {scenario.recommended ? <ToneChip label="Recommended" /> : <ToneChip label={scenario.status} />}
                        </Box>
                        <Typography sx={{fontSize: 13, fontWeight: 900, color: planningTokens.textPrimary, mt: 0.6}}>
                          {scenario.name}
                        </Typography>
                        <Typography sx={{fontSize: 12, color: planningTokens.textSecondary, mt: 0.45, lineHeight: 1.55}}>
                          {scenario.description}
                        </Typography>
                      </Paper>
                    );
                  })}
                </Box>
              </Paper>

              <Paper elevation={0} sx={{p: 1.5, borderRadius: 3, border: '1px solid rgba(227,232,242,0.92)', bgcolor: 'var(--planning-surface)'}}>
                <Typography sx={{fontSize: 12, fontWeight: 900, color: '#044ED7', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.1}}>
                  Scenario Comparison Table
                </Typography>
                <Box sx={{overflowX: 'hidden', borderRadius: 1.6, border: `1px solid ${actionTrackerTableBorderColor}`}}>
                  <Box sx={{width: '100%', minWidth: 0}}>
                    <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(132px, 1.25fr) repeat(5, minmax(0, 1fr))', minHeight: 44, alignItems: 'center', borderBottom: '1px solid #DDE3EC', bgcolor: actionTrackerTableHeaderBg}}>
                      {['KPI', 'Baseline', 'Capacity Recovery', 'Demand Smoothing', 'Constrained Commitment', 'Quality Delay'].map((label, index, items) => (
                        <Typography
                          key={label}
                          sx={{
                            px: 1,
                            py: 0.8,
                            borderRight: index === items.length - 1 ? 'none' : `1px solid ${actionTrackerTableCellBorderColor}`,
                            color: '#202124',
                            fontSize: {xs: 10, sm: 11},
                            fontWeight: 900,
                            lineHeight: 1.15,
                            whiteSpace: 'normal',
                            overflowWrap: 'anywhere',
                          }}
                        >
                          {label.toUpperCase()}
                        </Typography>
                      ))}
                    </Box>
                    {scenarioComparisonRows.map((row) => (
                      <Box
                        key={row.kpi}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(132px, 1.25fr) repeat(5, minmax(0, 1fr))',
                          minHeight: 50,
                          alignItems: 'stretch',
                          borderBottom: '1px solid #EFF2F6',
                        }}
                      >
                        <Box sx={{display: 'flex', alignItems: 'center', px: 1, py: 0.8, borderRight: `1px solid ${actionTrackerTableCellBorderColor}`}}>
                          <Typography sx={{fontSize: {xs: 11, sm: 12}, fontWeight: 700, color: '#202124', lineHeight: 1.25, overflowWrap: 'anywhere'}}>
                            {row.kpi}
                          </Typography>
                        </Box>
                        {[row.baseline, row.capacityRecovery, row.demandSmoothing, row.constrainedCommitment, row.qualityDelay].map((value, index, values) => {
                          const highlighted = value === getScenarioKpiValue(row, selectedScenarioId);
                          return (
                            <Box
                              key={`${row.kpi}-${index}`}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                px: 0.9,
                                py: 0.8,
                                borderRight: index === values.length - 1 ? 'none' : `1px solid ${actionTrackerTableCellBorderColor}`,
                                bgcolor: highlighted ? actionTrackerTableHoverBg : actionTrackerTableAltRowBg,
                                minWidth: 0,
                              }}
                            >
                              {chipToneMap[value] ? (
                                <ToneChip label={value} />
                              ) : (
                                <Typography sx={{fontSize: {xs: 11, sm: 12}, color: '#202124', fontWeight: highlighted ? 900 : 600, lineHeight: 1.25, overflowWrap: 'anywhere'}}>
                                  {value}
                                </Typography>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Paper>

              <Paper elevation={0} sx={{borderRadius: 3, border: '1px solid rgba(227,232,242,0.92)', bgcolor: 'var(--planning-surface)', overflow: 'hidden'}}>
                <Box sx={{px: 1.5, pt: 1.5}}>
                  <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', alignItems: 'baseline', mb: 1.1}}>
                    <Typography sx={{fontSize: 12, fontWeight: 900, color: '#044ED7', textTransform: 'uppercase', letterSpacing: '0.08em'}}>
                      Scenario Details
                    </Typography>
                    <Typography sx={{fontSize: 12, color: planningTokens.textSecondary}}>
                      Reviewing {selectedScenario.name}
                    </Typography>
                  </Box>
                  <Box
                    role="tablist"
                    aria-label="Scenario details tabs"
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 0.75,
                    }}
                  >
                    {scenarioDetailTabs.map((tab) => (
                      <ButtonBase
                        key={tab.id}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        sx={{
                          minHeight: 36,
                          px: 1.25,
                          py: 0.8,
                          borderRadius: 999,
                          border: activeTab === tab.id ? '1px solid rgba(29,116,255,0.32)' : '1px solid rgba(227,232,242,0.92)',
                          bgcolor: activeTab === tab.id ? '#EEF4FF' : '#FFFFFF',
                          color: activeTab === tab.id ? '#044ED7' : '#5B668A',
                          fontSize: 12,
                          fontWeight: 800,
                          lineHeight: 1.2,
                          textAlign: 'center',
                        }}
                      >
                        {tab.label}
                      </ButtonBase>
                    ))}
                  </Box>
                </Box>
                <Box sx={{p: 1.5, borderTop: '1px solid rgba(227,232,242,0.92)'}}>
                  {renderScenarioDetails()}
                </Box>
              </Paper>
            </Box>
          )}
        </Box>

        <Divider />
        <Box sx={{p: 2, borderTop: '1px solid rgba(148,163,184,0.16)', bgcolor: '#F8FCFD', flexShrink: 0}}>
          <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end'}}>
            <Button variant="text" onClick={handleRequestClose} sx={{fontSize: 12, textTransform: 'none', color: planningTokens.textSecondary, fontWeight: 700}}>
              Dismiss
            </Button>
            <Button
              variant="outlined"
              disabled={status !== 'ready'}
              onClick={() => showToast('Scenario editing can be connected to the next planning step.', 'info')}
              sx={{
                fontSize: 12,
                textTransform: 'none',
                fontWeight: 800,
                borderRadius: 3,
                color: '#044ED7',
                borderColor: 'rgba(29,116,255,0.26)',
                '&:hover': {borderColor: '#1D74FF', bgcolor: '#EEF6FF'},
              }}
            >
              Modify Scenario
            </Button>
            <Button
              variant="contained"
              disabled={status !== 'ready'}
              onClick={() => setAcceptDialogOpen(true)}
              sx={{
                fontSize: 12,
                textTransform: 'none',
                fontWeight: 800,
                borderRadius: 3,
                px: 1.8,
                bgcolor: '#044ED7',
                boxShadow: '0 16px 32px rgba(37,99,235,0.22)',
                '&:hover': {bgcolor: '#1D74FF'},
              }}
            >
              Accept Proposal
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Dialog open={acceptDialogOpen} onClose={() => setAcceptDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{fontWeight: 900}}>Confirm AI Forecast Proposal</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{fontSize: 13, color: planningTokens.textSecondary, lineHeight: 1.7}}>
            You are about to accept the {selectedScenario.name} scenario as the selected forecast proposal.
          </Typography>
          <Typography sx={{fontSize: 13, color: planningTokens.textSecondary, lineHeight: 1.7, mt: 1.2}}>
            Please confirm that you reviewed the scenario comparison and scenario details before applying this local preview decision.
          </Typography>
        </DialogContent>
        <DialogActions sx={{p: 2}}>
          <Button onClick={() => setAcceptDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAcceptProposal}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={discardDialogOpen} onClose={() => setDiscardDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{fontWeight: 900}}>Discard AI Forecast Proposal review?</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{fontSize: 13, color: planningTokens.textSecondary, lineHeight: 1.6}}>
            Your selected scenario has not been finalized. Closing now will discard that local review state.
          </Typography>
        </DialogContent>
        <DialogActions sx={{p: 2}}>
          <Button onClick={() => setDiscardDialogOpen(false)}>Keep reviewing</Button>
          <Button variant="contained" color="warning" onClick={handleConfirmDiscard}>Discard changes</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((current) => ({...current, open: false}))}
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((current) => ({...current, open: false}))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
