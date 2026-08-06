import {useState, useRef, useEffect} from 'react';
import {
  AutoAwesome as AutoAwesomeIcon,
  Build as BuildIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  Factory as FactoryIcon,
  GppMaybe as GppMaybeIcon,
  OpenInNew as OpenInNewIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
  RocketLaunch as RocketLaunchIcon,
  Send as SendIcon,
  ThumbDownAltOutlined as ThumbDownAltOutlinedIcon,
  ThumbUpAltOutlined as ThumbUpAltOutlinedIcon,
  TrackChanges as TrackChangesIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  TrendingUp as TrendingUpIcon,
  ExpandMore as ExpandMoreIcon,
  CalendarToday as CalendarTodayIcon,
  Engineering as EngineeringIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {planningTokens, planningCardSx, planningStatusTones} from './ui/planningTheme';
import {
  aiAgentActionsMock,
  initialAiAgentMessages,
  maintenancePlanMock,
  planningOverviewKpis,
  planningOverviewStatusCards,
  shiftScheduleMock,
  lineCapacityKpi,
  wipKpi,
  planVsActualTimeline,
  batchPlanActualMock,
  futureWoScheduleMock,
  unplannedMaintenanceDm1Mock,
  type AiAgentMessage,
  type ProductionPlanningPageId,
  type PlanningRecommendation,
  type PlanVsActualKpi,
  type LineCapacityKpi,
  type WipKpi,
  type DailyPlanActual,
  type BatchPlanActual,
  type WoScheduleItem,
} from './planningOverviewMock';

// ─── Palette helpers ──────────────────────────────────────────────────────────

const T = planningTokens;

// Maps tone keys to DS semantic status color tokens
const tonePalette = {
  good:     {bg: T.successBg,  color: T.success,      border: T.successBorder,  text: T.success},
  warning:  {bg: T.warningBg,  color: T.warning,      border: T.warningBorder,  text: T.warning},
  critical: {bg: T.dangerBg,   color: T.danger,        border: T.dangerBorder,   text: T.danger},
  neutral:  {bg: T.neutralBg,  color: T.primaryBlue,  border: T.neutralBorder,  text: T.primaryBlue},
} as const;


const severityStatus = {
  'On Track': planningStatusTones.Feasible,
  'Watch':    planningStatusTones.AtRisk,
  'High Risk': planningStatusTones.Constrained,
} as const;

const maintenanceStatusPalette = {
  Scheduled:    planningStatusTones.PendingData,
  Overdue:      planningStatusTones.Constrained,
  'In Progress': planningStatusTones.AtRisk,
} as const;

// ⚠ [mismatch] Predictive uses aiAccent (indigo) — no DS semantic token for purple/violet
const maintenanceTypePalette = {
  Preventive: {bg: T.neutralBg,  color: T.primaryBlue},
  Corrective: {bg: T.dangerBg,   color: T.danger},
  Predictive: {bg: T.aiAccentBg, color: T.aiAccent},
} as const;

// ⚠ [mismatch] Morning/Night shift use amber/indigo — no DS semantic tokens for these
const shiftColors = {
  Morning:   {bg: T.warningAmberBg, color: T.warningAmber},
  Afternoon: {bg: T.neutralBg,      color: T.primaryBlue},
  Night:     {bg: T.aiAccentBg,     color: T.aiAccent},
} as const;

// ─── Sparkline mock ───────────────────────────────────────────────────────────

function PpaSparkline() {
  const points = [88, 90, 87, 92, 91, 93, 94];
  const w = 80;
  const h = 28;
  const min = 85;
  const max = 96;
  const xs = points.map((_, i) => (i / (points.length - 1)) * w);
  const ys = points.map((v) => h - ((v - min) / (max - min)) * h);
  const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x} ${ys[i]}`).join(' ');
  return (
    <svg width={w} height={h} style={{overflow: 'visible'}}>
      <polyline points={xs.map((x, i) => `${x},${ys[i]}`).join(' ')} fill="none" stroke={T.primaryBlue} strokeWidth={1.5} strokeLinejoin="round" strokeOpacity={0.5} />
      <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill={T.primaryBlue} fillOpacity={0.07} />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r={3} fill={T.primaryBlue} />
    </svg>
  );
}

// ─── Command Header ───────────────────────────────────────────────────────────

function CommandHeader() {
  return (
    <Box
      sx={{
        bgcolor: T.surface,
        borderBottom: `1px solid ${T.border}`,
        px: {xs: 2, md: 3},
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        flexWrap: 'wrap',
        borderRadius: 0,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Factory sx={{color: T.primaryBlue, fontSize: 22}} />
        <Typography sx={{color: T.textPrimary, fontWeight: 900, fontSize: 15, letterSpacing: '-0.01em'}}>
          Planning Command Center
        </Typography>
        <Chip
          label="Week 22 · May 2026"
          size="small"
          sx={{bgcolor: T.backgroundAlt, color: T.textSecondary, fontWeight: 700, fontSize: 11, border: `1px solid ${T.border}`}}
        />
      </Stack>
      <Chip
        icon={<ScheduleIcon sx={{fontSize: 14, color: `${T.primaryBlue} !important`}} />}
        label="Morning Shift · 06:00–14:00 · Lines 1, 2, 3 Active"
        size="small"
        sx={{bgcolor: T.neutralBg, color: T.primaryBlue, fontWeight: 700, fontSize: 11.5, border: `1px solid ${T.neutralBorder}`}}
      />
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Box sx={{width: 8, height: 8, borderRadius: '50%', bgcolor: T.successActive, boxShadow: '0 0 0 3px rgba(34,197,94,0.25)', animation: 'pulse 2s infinite', '@keyframes pulse': {'0%,100%': {boxShadow: '0 0 0 3px rgba(34,197,94,0.25)'}, '50%': {boxShadow: '0 0 0 6px rgba(34,197,94,0.1)'}}}} />
          <Typography sx={{color: T.textSecondary, fontSize: 12, fontWeight: 700}}>AI Agent Active</Typography>
        </Stack>
        <IconButton size="small" sx={{color: T.textMuted, '&:hover': {color: T.textPrimary, bgcolor: T.backgroundAlt}}}>
          <RefreshIcon sx={{fontSize: 18}} />
        </IconButton>
      </Stack>
    </Box>
  );
}

// Workaround: use Factory as a local import alias
const Factory = FactoryIcon;

const aiCommandNotifications = [
  {
    id: 'mps-approved-mrp-run',
    bg: '#F0FDF4',
    iconBg: '#DCFCE7',
    tone: '#15803D',
    icon: <CheckCircleOutlineIcon sx={{fontSize: 18}} />,
    title: 'MRP RUN COMPLETE',
    message: 'Approved MPS triggered an automatic MRP run. Review the recommended Planned Orders.',
    actionLabel: 'Review Planned Orders',
    pageId: 'mrp' as const,
  },
  {
    id: 'mps-comments-returned',
    bg: '#EEF4FF',
    iconBg: '#DBEAFE',
    tone: '#2563EB',
    icon: <WarningIcon sx={{fontSize: 18}} />,
    title: 'MPS COMMENTS RETURNED',
    message: 'MPS-01 returned with comments. Review the feedback before the next approval step.',
    actionLabel: 'View Comments',
    pageId: 'monthly-mps' as const,
  },
];

function AiNotificationsStrip({onNavigate}: {onNavigate: (pageId: ProductionPlanningPageId, label: string) => void}) {
  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: 'var(--planning-surface)',
        borderBottom: `1px solid ${T.border}`,
        px: {xs: 1.8, md: 2.2},
        py: {xs: 1.2, md: 1.35},
        borderRadius: '12px 12px 0 0',
      }}
    >
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.9}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7}}>
          <AutoAwesomeIcon sx={{fontSize: 16, color: '#2563EB'}} />
          <Typography variant="subtitle2" sx={{color: '#044ED7', fontWeight: 900}}>BLU.AI insights</Typography>
        </Box>
        <Button size="small" endIcon={<ChevronRightIcon sx={{fontSize: 14}} />} sx={{color: '#8CA0BD', fontWeight: 800, borderRadius: 99, px: 0.6, minHeight: 28, textTransform: 'none'}}>
          View all insights
        </Button>
      </Box>

      <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.7}}>
        {aiCommandNotifications.map((notification) => (
          <Box
            key={notification.id}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1.2,
              flexWrap: 'wrap',
              px: {xs: 0.95, md: 1.1},
              py: 0.75,
              borderRadius: 2,
              bgcolor: notification.bg,
              border: '1px solid #EEF2F7',
            }}
          >
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: '1 1 520px'}}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  color: notification.tone,
                  bgcolor: notification.iconBg,
                  flexShrink: 0,
                }}
              >
                {notification.icon}
              </Box>
              <Box sx={{minWidth: 0}}>
                <Typography variant="body2" sx={{color: '#1F2937', fontWeight: 700, lineHeight: 1.2}}>
                  <Box component="span" sx={{color: notification.tone, fontWeight: 900, textTransform: 'uppercase', mr: 0.5}}>
                    {notification.title}
                    :
                  </Box>
                  {notification.message}
                </Typography>
              </Box>
            </Box>
            <Button
              size="small"
              endIcon={<ChevronRightIcon sx={{fontSize: 13}} />}
              onClick={() => onNavigate(notification.pageId, notification.actionLabel)}
              sx={{
                color: notification.tone,
                fontWeight: 900,
                borderRadius: 99,
                px: 0.35,
                minHeight: 26,
                fontSize: '0.74rem',
                textTransform: 'none',
              }}
            >
              {notification.actionLabel}
            </Button>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

// ─── Hero KPI Strip ───────────────────────────────────────────────────────────

function HeroKpiStrip() {
  const kpis = planningOverviewKpis.filter((k) => !k.label.includes('AI Confidence') && !k.label.includes('Stability') && !k.label.includes('Pending'));
  const kpiIcons = [
    <CheckCircleOutlineIcon sx={{fontSize: 20}} />,
    <GppMaybeIcon sx={{fontSize: 20}} />,
    <TrackChangesIcon sx={{fontSize: 20}} />,
    <RocketLaunchIcon sx={{fontSize: 20}} />,
    <FactoryIcon sx={{fontSize: 20}} />,
  ];

  return (
    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr 1fr', md: 'repeat(3, 1fr)', xl: '2.2fr 1fr 1fr 1fr 1fr'}, gap: 1.5}}>
      {/* PPA Hero — borderRadius/Medium 12px */}
      <Paper
        elevation={0}
        sx={{
          ...planningCardSx,
          background: `linear-gradient(135deg, ${T.neutralBg} 0%, ${T.neutralBgAlt} 100%)`,
          border: `1px solid ${T.neutralBorder}`,
          borderTop: `3px solid ${T.primaryBlue}`,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 120,
          gridColumn: {xs: '1 / -1', md: '1 / 2', xl: '1 / 2'},
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box>
          <Typography sx={{fontSize: 11.5, color: T.primaryBlue, fontWeight: 800, mt: 0.25, letterSpacing: '0.02em', textTransform: 'uppercase'}}>Production Plan Attainment</Typography>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mt: 1}}>
          <Box>
            <Typography sx={{fontSize: 52, lineHeight: 1, fontWeight: 900, color: T.textPrimary, letterSpacing: '-0.04em'}}>94%</Typography>
            <Typography sx={{fontSize: 11.5, color: T.success, fontWeight: 700, mt: 0.5}}>▲ +1.2% vs last week</Typography>
          </Box>
          <Box>
            <PpaSparkline />
          </Box>
        </Box>
      </Paper>

      {/* Supporting KPIs — borderLeft accent, borderRadius/Medium */}
      {kpis.slice(0, 5).map((kpi, i) => {
        const tone = tonePalette[kpi.tone === 'ai' ? 'neutral' : kpi.tone];
        return (
          <Paper
            key={kpi.label}
            elevation={0}
            sx={{
              ...planningCardSx,
              p: 2,
              borderLeft: `3px solid ${tone.color}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 100,
            }}
          >
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
              <Box sx={{color: tone.color, opacity: 0.8}}>{kpiIcons[i]}</Box>
              <Typography sx={{fontSize: 11, color: T.textSecondary, fontWeight: 800, lineHeight: 1.3}}>{kpi.label}</Typography>
            </Box>
            <Box>
              <Typography sx={{fontSize: 34, lineHeight: 1, fontWeight: 900, color: T.textPrimary, letterSpacing: '-0.03em'}}>{kpi.value}</Typography>
              <Typography sx={{fontSize: 11.5, color: tone.text, fontWeight: 700, mt: 0.5, lineHeight: 1.35}}>{kpi.helper}</Typography>
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}

// ─── WO Pipeline ─────────────────────────────────────────────────────────────

type WoPipelineProps = {
  onNavigate: (pageId: ProductionPlanningPageId, label: string) => void;
  dismissed: boolean;
  onDismiss: () => void;
};

// ─── Planning Health Grid ─────────────────────────────────────────────────────

type PlanningHealthProps = {
  onNavigate: (pageId: ProductionPlanningPageId, label: string) => void;
};

const healthCards = [
  {id: 'twelve-month-status', label: 'Demand Forecast (12M)', metricLabel: 'Constrained months', metricValue: '2'},
  {id: 'mps-status', label: 'Monthly MPS', metricLabel: 'Frozen horizon adherence', metricValue: '93%'},
  {id: 'scheduling-status', label: 'Line Planning', metricLabel: 'Open schedule conflicts', metricValue: '3'},
  {id: 'wo-readiness-status', label: 'WO Readiness', metricLabel: 'Ready rate', metricValue: '81%'},
];

function PlanningHealthGrid({onNavigate}: PlanningHealthProps) {
  return (
    <Paper elevation={0} sx={{...planningCardSx, p: 2}}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Box>
          <Typography sx={{fontSize: 13, color: T.textPrimary, fontWeight: 900}}>Planning Health</Typography>
          <Typography sx={{fontSize: 11.5, color: T.textSecondary, mt: 0.25}}>Demand Forecast → MPS → Line Planning → Readiness</Typography>
        </Box>
        {/* ⚠ [mismatch] AI chip uses aiAccent (indigo) — no DS purple token */}
        <Chip icon={<AutoAwesomeIcon sx={{fontSize: 14}} />} label="AI-interpreted" size="small" sx={{bgcolor: T.aiAccentBg, color: T.aiAccent, border: `1px solid ${T.aiAccentBorder}`, fontWeight: 800, fontSize: 11}} />
      </Stack>
      <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1}}>
        {planningOverviewStatusCards.slice(0, 4).map((card) => {
          const hCard = healthCards.find((h) => h.id === card.id);
          const tone = severityStatus[card.severity];
          return (
            /* borderRadius/Medium 12px for inner cards */
            <Paper key={card.id} elevation={0} sx={{p: 1.5, borderRadius: 3, bgcolor: T.surfaceMuted, border: `1px solid ${T.border}`}}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography sx={{fontSize: 11.5, color: T.textPrimary, fontWeight: 900}}>{hCard?.label ?? card.title}</Typography>
                <Chip size="small" label={card.severity} sx={{bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`, fontWeight: 900, fontSize: 10, height: 20}} />
              </Stack>
              <Box sx={{display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 0.5}}>
                <Typography sx={{fontSize: 22, fontWeight: 900, color: T.textPrimary, lineHeight: 1}}>{hCard?.metricValue}</Typography>
                <Typography sx={{fontSize: 11, color: T.textSecondary, fontWeight: 700}}>{hCard?.metricLabel}</Typography>
              </Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography sx={{fontSize: 11, color: T.textSecondary, lineHeight: 1.4, maxWidth: 140}}>{card.status}</Typography>
                <Button size="small" endIcon={<OpenInNewIcon sx={{fontSize: 12}} />} onClick={() => onNavigate(card.relatedPageId, card.title)} sx={{fontSize: 11, textTransform: 'none', fontWeight: 800, color: T.primaryBlue, py: 0.25, px: 0.75, minWidth: 0}}>Open</Button>
              </Stack>
            </Paper>
          );
        })}
      </Box>
    </Paper>
  );
}

// ─── Plan Deviation ───────────────────────────────────────────────────────────

function kpiTone(deltaPct: number, higherIsBetter = true) {
  const isGood = higherIsBetter ? deltaPct >= 0 : deltaPct <= 0;
  return isGood
    ? {bg: T.successBg, color: T.success, border: T.successBorder}
    : {bg: T.dangerBg,  color: T.danger,  border: T.dangerBorder};
}

function capacityTone(delta: number) {
  return delta >= 0
    ? {bg: T.successBg, color: T.success, border: T.successBorder}
    : {bg: T.dangerBg, color: T.danger, border: T.dangerBorder};
}

function SimpleKpiRow({kpi}: {kpi: PlanVsActualKpi}) {
  const deltaPct = ((kpi.actual - kpi.planned) / kpi.planned) * 100;
  const tone = kpiTone(deltaPct, kpi.higherIsBetter);
  const maxVal = Math.max(kpi.planned, kpi.actual);
  const deltaLabel = `${deltaPct >= 0 ? '+' : ''}${deltaPct.toFixed(1)}%`;
  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.75, borderRadius: 1.5, bgcolor: T.surfaceMuted, border: `1px solid ${T.border}`}}>
      <Typography sx={{fontSize: 12, fontWeight: 800, color: T.textPrimary, minWidth: 110}}>{kpi.label}</Typography>
      <Box sx={{flex: 1}}>
        <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
          <Typography sx={{fontSize: 10.5, color: T.textMuted, fontWeight: 700, minWidth: 40}}>Plan</Typography>
          <Typography sx={{fontSize: 12, fontWeight: 700, color: T.textSecondary}}>{kpi.plannedDisplay}</Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography sx={{fontSize: 10.5, color: T.textMuted, fontWeight: 700, minWidth: 40}}>Actual</Typography>
          <Typography sx={{fontSize: 12, fontWeight: 900, color: T.textPrimary}}>{kpi.actualDisplay}</Typography>
        </Stack>
      </Box>
      <Box sx={{width: 80}}>
        <Box sx={{width: '100%', height: 5, bgcolor: T.border, borderRadius: 999, mb: 0.5}}>
          <Box sx={{height: '100%', width: `${(kpi.planned / maxVal) * 100}%`, bgcolor: T.textMuted, borderRadius: 999, opacity: 0.5}} />
        </Box>
        <Box sx={{width: '100%', height: 5, bgcolor: T.border, borderRadius: 999}}>
          <Box sx={{height: '100%', width: `${(kpi.actual / maxVal) * 100}%`, bgcolor: tone.color, borderRadius: 999}} />
        </Box>
      </Box>
      <Chip size="small" label={deltaLabel} sx={{bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`, fontWeight: 900, fontSize: 10, height: 20, minWidth: 52}} />
    </Box>
  );
}

function LineCapacitySection({kpi}: {kpi: LineCapacityKpi}) {
  const [expandedLines, setExpandedLines] = useState<Set<string>>(new Set());
  function toggleLine(lineId: string) {
    setExpandedLines((prev) => {
      const next = new Set(prev);
      if (next.has(lineId)) next.delete(lineId);
      else next.add(lineId);
      return next;
    });
  }
  const siteDelta = kpi.siteActualPct - kpi.sitePlannedPct;
  const siteTone = capacityTone(siteDelta);
  return (
    <Box>
      {/* Site summary row */}
      <Box sx={{display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.75, borderRadius: 1.5, bgcolor: T.surfaceMuted, border: `1px solid ${T.border}`, mb: 0.5}}>
        <Typography sx={{fontSize: 12, fontWeight: 800, color: T.textPrimary, minWidth: 110}}>{kpi.label}</Typography>
        <Box sx={{flex: 1}}>
          <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
            <Typography sx={{fontSize: 10.5, color: T.textMuted, fontWeight: 700, minWidth: 40}}>Plan</Typography>
            <Typography sx={{fontSize: 12, fontWeight: 700, color: T.textSecondary}}>{kpi.sitePlannedPct}%</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{fontSize: 10.5, color: T.textMuted, fontWeight: 700, minWidth: 40}}>Actual</Typography>
            <Typography sx={{fontSize: 12, fontWeight: 900, color: T.textPrimary}}>{kpi.siteActualPct}%</Typography>
          </Stack>
        </Box>
        <Box sx={{width: 80}}>
          <Box sx={{width: '100%', height: 5, bgcolor: T.border, borderRadius: 999, mb: 0.5}}>
            <Box sx={{height: '100%', width: `${kpi.sitePlannedPct}%`, bgcolor: T.textMuted, borderRadius: 999, opacity: 0.5}} />
          </Box>
          <Box sx={{width: '100%', height: 5, bgcolor: T.border, borderRadius: 999}}>
            <Box sx={{height: '100%', width: `${kpi.siteActualPct}%`, bgcolor: siteTone.color, borderRadius: 999}} />
          </Box>
        </Box>
        <Chip size="small" label={`${siteDelta >= 0 ? '+' : ''}${siteDelta}%`} sx={{bgcolor: siteTone.bg, color: siteTone.color, border: `1px solid ${siteTone.border}`, fontWeight: 900, fontSize: 10, height: 20, minWidth: 52}} />
      </Box>

      {/* Line rows */}
      <Box sx={{display: 'grid', gap: 0.5, pl: 1.5}}>
        {kpi.lines.map((line) => {
          const isExpanded = expandedLines.has(line.lineId);
          const lineDelta = line.actualPct - line.plannedPct;
          const lineTone = capacityTone(lineDelta);
          return (
            <Box key={line.lineId}>
              <Box
                onClick={() => toggleLine(line.lineId)}
                sx={{display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.625, borderRadius: 1.5, bgcolor: T.surfaceMuted, border: `1px solid ${T.border}`, cursor: 'pointer', '&:hover': {bgcolor: T.border}}}
              >
                {isExpanded
                  ? <ExpandMoreIcon sx={{fontSize: 14, color: T.textMuted, flexShrink: 0}} />
                  : <ChevronRightIcon sx={{fontSize: 14, color: T.textMuted, flexShrink: 0}} />}
                <Typography sx={{fontSize: 11.5, fontWeight: 800, color: T.textPrimary, minWidth: 88}}>{line.lineName}</Typography>
                <Box sx={{flex: 1, height: 4, bgcolor: T.border, borderRadius: 999, position: 'relative'}}>
                  <Box sx={{position: 'absolute', left: 0, top: 0, height: '100%', width: `${line.plannedPct}%`, bgcolor: T.textMuted, borderRadius: 999, opacity: 0.35}} />
                  <Box sx={{position: 'absolute', left: 0, top: 0, height: '100%', width: `${line.actualPct}%`, bgcolor: lineTone.color, borderRadius: 999}} />
                </Box>
                <Typography sx={{fontSize: 11, fontWeight: 900, color: lineTone.color, minWidth: 32, textAlign: 'right'}}>{line.actualPct}%</Typography>
                <Chip size="small" label={`${lineDelta >= 0 ? '+' : ''}${lineDelta}%`} sx={{bgcolor: lineTone.bg, color: lineTone.color, border: `1px solid ${lineTone.border}`, fontWeight: 900, fontSize: 10, height: 18, minWidth: 44}} />
              </Box>

              {/* Machine rows */}
              {isExpanded && (
                <Box sx={{display: 'grid', gap: 0.375, pl: 2, mt: 0.375}}>
                  {line.machines.map((machine) => {
                    const mDelta = machine.actualPct - machine.plannedPct;
                    const mTone = capacityTone(mDelta);
                    return (
                      <Box key={machine.machineId} sx={{display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5, borderRadius: 1.5, bgcolor: T.background, border: `1px solid ${T.border}`}}>
                        <Box sx={{width: 14, flexShrink: 0}} />
                        <Typography sx={{fontSize: 11, fontWeight: 700, color: T.textSecondary, minWidth: 100}}>{machine.machineName}</Typography>
                        <Box sx={{flex: 1, height: 4, bgcolor: T.border, borderRadius: 999, position: 'relative'}}>
                          <Box sx={{position: 'absolute', left: 0, top: 0, height: '100%', width: `${machine.plannedPct}%`, bgcolor: T.textMuted, borderRadius: 999, opacity: 0.35}} />
                          <Box sx={{position: 'absolute', left: 0, top: 0, height: '100%', width: `${machine.actualPct}%`, bgcolor: mTone.color, borderRadius: 999}} />
                        </Box>
                        <Typography sx={{fontSize: 10.5, fontWeight: 900, color: mTone.color, minWidth: 32, textAlign: 'right'}}>{machine.actualPct}%</Typography>
                        <Chip size="small" label={`${mDelta >= 0 ? '+' : ''}${mDelta}%`} sx={{bgcolor: mTone.bg, color: mTone.color, border: `1px solid ${mTone.border}`, fontWeight: 900, fontSize: 10, height: 16, minWidth: 44}} />
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function WipSection({kpi}: {kpi: WipKpi}) {
  const deltaPct = ((kpi.actualStock - kpi.targetStock) / kpi.targetStock) * 100;
  const tone = deltaPct >= 0
    ? {bg: T.successBg, color: T.success, border: T.successBorder}
    : {bg: T.dangerBg, color: T.danger, border: T.dangerBorder};
  const gaugeActualPct = (kpi.actualStock / kpi.warehouseMaxCapacity) * 100;
  const gaugeTargetPct = (kpi.targetStock / kpi.warehouseMaxCapacity) * 100;
  return (
    <Box sx={{px: 1, py: 0.75, borderRadius: 1.5, bgcolor: T.surfaceMuted, border: `1px solid ${T.border}`}}>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
        <Typography sx={{fontSize: 12, fontWeight: 800, color: T.textPrimary, minWidth: 110}}>{kpi.label}</Typography>
        <Box sx={{flex: 1}}>
          <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
            <Typography sx={{fontSize: 10.5, color: T.textMuted, fontWeight: 700, minWidth: 40}}>Target</Typography>
            <Typography sx={{fontSize: 12, fontWeight: 700, color: T.textSecondary}}>{kpi.plannedDisplay}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{fontSize: 10.5, color: T.textMuted, fontWeight: 700, minWidth: 40}}>Actual</Typography>
            <Typography sx={{fontSize: 12, fontWeight: 900, color: T.textPrimary}}>{kpi.actualDisplay}</Typography>
          </Stack>
        </Box>
        <Chip size="small" label={`${deltaPct >= 0 ? '+' : ''}${deltaPct.toFixed(1)}%`} sx={{bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`, fontWeight: 900, fontSize: 10, height: 20, minWidth: 52}} />
      </Box>

      {/* Capacity gauge bar */}
      <Box sx={{position: 'relative', width: '100%', height: 10, bgcolor: T.border, borderRadius: 999}}>
        <Box sx={{position: 'absolute', left: 0, top: 0, height: '100%', width: `${gaugeActualPct}%`, bgcolor: tone.color, borderRadius: 999}} />
        {/* Target marker */}
        <Box sx={{position: 'absolute', left: `${gaugeTargetPct}%`, top: -3, width: 2, height: 16, bgcolor: T.primaryBlue, borderRadius: 1, transform: 'translateX(-50%)'}} />
      </Box>

      {/* Legend */}
      <Stack direction="row" justifyContent="space-between" mt={0.5}>
        <Typography sx={{fontSize: 10, color: T.textMuted, fontWeight: 700}}>0</Typography>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Box sx={{width: 6, height: 6, bgcolor: T.primaryBlue, borderRadius: 0.5}} />
          <Typography sx={{fontSize: 10, color: T.primaryBlue, fontWeight: 800}}>Target {kpi.plannedDisplay}</Typography>
        </Stack>
        <Typography sx={{fontSize: 10, color: T.textMuted, fontWeight: 700}}>{kpi.capacityDisplay}</Typography>
      </Stack>
    </Box>
  );
}

// ─── Day KPI helpers ──────────────────────────────────────────────────────────

function dayKpiTone(planned: number, actual: number | undefined, higherIsBetter: boolean) {
  if (actual === undefined) return {bg: T.neutralBg, color: T.primaryBlue, border: T.neutralBorder};
  const deltaPct = ((actual - planned) / planned) * 100;
  return kpiTone(deltaPct, higherIsBetter);
}

function DayKpiRow({label, unit, planned, actual, higherIsBetter}: {label: string; unit: string; planned: number; actual?: number; higherIsBetter: boolean}) {
  const tone = dayKpiTone(planned, actual, higherIsBetter);
  const maxVal = Math.max(planned, actual ?? planned);
  const deltaPct = actual !== undefined ? ((actual - planned) / planned) * 100 : null;
  const deltaLabel = deltaPct !== null ? `${deltaPct >= 0 ? '+' : ''}${deltaPct.toFixed(1)}%` : '—';
  const fmtVal = (v: number) => unit === '%' ? `${v}%` : unit === 'days' ? `${v} days` : v.toLocaleString();
  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.75, borderRadius: 1.5, bgcolor: T.surfaceMuted, border: `1px solid ${T.border}`}}>
      <Typography sx={{fontSize: 12, fontWeight: 800, color: T.textPrimary, minWidth: 110}}>{label}</Typography>
      <Box sx={{flex: 1}}>
        <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
          <Typography sx={{fontSize: 10.5, color: T.textMuted, fontWeight: 700, minWidth: 40}}>Plan</Typography>
          <Typography sx={{fontSize: 12, fontWeight: 700, color: T.textSecondary}}>{fmtVal(planned)}</Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography sx={{fontSize: 10.5, color: T.textMuted, fontWeight: 700, minWidth: 40}}>Actual</Typography>
          <Typography sx={{fontSize: 12, fontWeight: 900, color: T.textPrimary}}>{actual !== undefined ? fmtVal(actual) : '—'}</Typography>
        </Stack>
      </Box>
      {actual !== undefined && (
        <Box sx={{width: 80}}>
          <Box sx={{width: '100%', height: 5, bgcolor: T.border, borderRadius: 999, mb: 0.5}}>
            <Box sx={{height: '100%', width: `${(planned / maxVal) * 100}%`, bgcolor: T.textMuted, borderRadius: 999, opacity: 0.5}} />
          </Box>
          <Box sx={{width: '100%', height: 5, bgcolor: T.border, borderRadius: 999}}>
            <Box sx={{height: '100%', width: `${(actual / maxVal) * 100}%`, bgcolor: tone.color, borderRadius: 999}} />
          </Box>
        </Box>
      )}
      <Chip size="small" label={deltaLabel} sx={{bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`, fontWeight: 900, fontSize: 10, height: 20, minWidth: 52}} />
    </Box>
  );
}

// ─── Batch KPI Row ────────────────────────────────────────────────────────────

const batchStatusColors: Record<BatchPlanActual['status'], {bg: string; color: string; border: string}> = {
  Completed:    {bg: T.successBg,  color: T.success,     border: T.successBorder},
  'In Progress':{bg: T.warningBg,  color: T.warning,     border: T.warningBorder},
  Planned:      {bg: T.neutralBg,  color: T.primaryBlue, border: T.neutralBorder},
};

function BatchKpiRow({batch}: {batch: BatchPlanActual}) {
  const statusTone = batchStatusColors[batch.status];
  const scrapTone = dayKpiTone(batch.scrapRatePct.planned, batch.scrapRatePct.actual, false);
  const oeeTone = dayKpiTone(batch.oee.planned, batch.oee.actual, true);
  const fgTone = dayKpiTone(batch.finishedGoods.planned, batch.finishedGoods.actual, true);
  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1, borderRadius: 1.5, bgcolor: T.surfaceMuted, border: `1px solid ${T.border}`, flexWrap: 'wrap'}}>
      {/* ID + meta */}
      <Box sx={{minWidth: 100}}>
        <Typography sx={{fontSize: 12, fontWeight: 900, color: T.textPrimary}}>{batch.batchId}</Typography>
        <Typography sx={{fontSize: 10.5, color: T.textSecondary, fontWeight: 700}}>{batch.product} · {batch.line}</Typography>
      </Box>
      <Chip size="small" label={batch.status} sx={{bgcolor: statusTone.bg, color: statusTone.color, border: `1px solid ${statusTone.border}`, fontWeight: 900, fontSize: 10, height: 20, flexShrink: 0}} />
      {/* KPI chips */}
      <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end'}}>
        {/* Finished Goods */}
        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 72}}>
          <Typography sx={{fontSize: 9.5, color: T.textMuted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.25}}>Fin. Goods</Typography>
          <Chip size="small" label={batch.finishedGoods.actual !== undefined ? `${batch.finishedGoods.actual.toLocaleString()} / ${batch.finishedGoods.planned.toLocaleString()}` : `Plan ${batch.finishedGoods.planned.toLocaleString()}`} sx={{bgcolor: fgTone.bg, color: fgTone.color, border: `1px solid ${fgTone.border}`, fontWeight: 900, fontSize: 10, height: 20}} />
        </Box>
        {/* Scrap Rate */}
        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 72}}>
          <Typography sx={{fontSize: 9.5, color: T.textMuted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.25}}>Scrap Rate</Typography>
          <Chip size="small" label={batch.scrapRatePct.actual !== undefined ? `${batch.scrapRatePct.actual}% / ${batch.scrapRatePct.planned}%` : `Plan ${batch.scrapRatePct.planned}%`} sx={{bgcolor: scrapTone.bg, color: scrapTone.color, border: `1px solid ${scrapTone.border}`, fontWeight: 900, fontSize: 10, height: 20}} />
        </Box>
        {/* OEE */}
        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 72}}>
          <Typography sx={{fontSize: 9.5, color: T.textMuted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.25}}>OEE</Typography>
          <Chip size="small" label={batch.oee.actual !== undefined ? `${batch.oee.actual}% / ${batch.oee.planned}%` : `Plan ${batch.oee.planned}%`} sx={{bgcolor: oeeTone.bg, color: oeeTone.color, border: `1px solid ${oeeTone.border}`, fontWeight: 900, fontSize: 10, height: 20}} />
        </Box>
      </Box>
    </Box>
  );
}

// ─── Future Day WO Schedule (D+1 / D+2) ─────────────────────────────────────

function woStatusTone(status: WoScheduleItem['status']) {
  if (status === 'On Schedule') return {bg: T.successBg, color: T.success, border: T.successBorder};
  if (status === 'Delayed')     return {bg: T.dangerBg,  color: T.danger,  border: T.dangerBorder};
  return {bg: T.neutralBg, color: T.primaryBlue, border: T.neutralBorder};
}

function FutureDayPlanningView({dayOffset}: {dayOffset: 1 | 2}) {
  const schedule = futureWoScheduleMock.find((s) => s.dayOffset === dayOffset);
  if (!schedule) return null;

  return (
    <Box sx={{display: 'grid', gap: 0.75}}>
      {/* Summary chips */}
      <Box sx={{display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 0.5}}>
        <Chip
          size="small"
          icon={<CheckCircleOutlineIcon sx={{fontSize: 12}} />}
          label={`${schedule.summary.onSchedule} On Schedule`}
          sx={{bgcolor: T.successBg, color: T.success, border: `1px solid ${T.successBorder}`, fontWeight: 800, fontSize: 11, height: 22}}
        />
        <Chip
          size="small"
          icon={<WarningIcon sx={{fontSize: 12}} />}
          label={`${schedule.summary.delayed} Delayed`}
          sx={{bgcolor: T.dangerBg, color: T.danger, border: `1px solid ${T.dangerBorder}`, fontWeight: 800, fontSize: 11, height: 22}}
        />
        <Chip
          size="small"
          icon={<TrendingUpIcon sx={{fontSize: 12}} />}
          label={`${schedule.summary.ahead} Ahead`}
          sx={{bgcolor: T.neutralBg, color: T.primaryBlue, border: `1px solid ${T.neutralBorder}`, fontWeight: 800, fontSize: 11, height: 22}}
        />
      </Box>

      {/* WO rows */}
      {schedule.wos.map((wo) => {
        const tone = woStatusTone(wo.status);
        const deltaLabel = wo.status === 'Delayed' ? `+${wo.deltaHours}h` : wo.status === 'Ahead' ? `-${wo.deltaHours}h` : 'On time';
        return (
          <Box
            key={wo.woId}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.75,
              borderRadius: 1.5, bgcolor: T.surfaceMuted,
              border: `1px solid ${wo.status === 'Delayed' ? T.dangerBorder : T.border}`,
            }}
          >
            <Box sx={{minWidth: 68, flexShrink: 0}}>
              <Typography sx={{fontSize: 11.5, fontWeight: 900, color: T.textPrimary}}>{wo.woId}</Typography>
              <Typography sx={{fontSize: 10, color: T.textMuted, fontWeight: 700}}>{wo.plannedStart}</Typography>
            </Box>
            <Box sx={{flex: 1, minWidth: 0}}>
              <Typography sx={{fontSize: 11.5, fontWeight: 800, color: T.textPrimary}}>{wo.product} · {wo.line}</Typography>
              {wo.reason && (
                <Typography sx={{fontSize: 10.5, fontWeight: 700, mt: 0.125, color: wo.status === 'Delayed' ? T.danger : T.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{wo.reason}</Typography>
              )}
            </Box>
            {!wo.materialReady && (
              <Chip
                size="small"
                icon={<WarningIcon sx={{fontSize: 11}} />}
                label="Mat. Risk"
                sx={{bgcolor: T.warningBg, color: T.warning, border: `1px solid ${T.warningBorder}`, fontWeight: 800, fontSize: 9.5, height: 20, flexShrink: 0}}
              />
            )}
            <Chip
              size="small"
              label={deltaLabel}
              sx={{bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`, fontWeight: 900, fontSize: 10, height: 20, minWidth: 50, flexShrink: 0}}
            />
          </Box>
        );
      })}
    </Box>
  );
}

// ─── Unplanned Maintenance Section (D-1) ─────────────────────────────────────

function UnplannedMaintenanceSection() {
  return (
    <Box>
      <Stack direction="row" alignItems="center" gap={0.75} mb={0.75}>
        <WarningIcon sx={{fontSize: 13, color: T.danger}} />
        <Typography sx={{fontSize: 10.5, fontWeight: 900, color: T.danger, textTransform: 'uppercase', letterSpacing: '0.06em'}}>Unplanned Maintenance</Typography>
      </Stack>
      {unplannedMaintenanceDm1Mock.map((event) => (
        <Box
          key={event.id}
          sx={{display: 'flex', alignItems: 'flex-start', gap: 1.5, px: 1.5, py: 1, borderRadius: 1.5, bgcolor: T.dangerBg, border: `1px solid ${T.dangerBorder}`}}
        >
          <Box sx={{flex: 1, minWidth: 0}}>
            <Typography sx={{fontSize: 12, fontWeight: 900, color: T.textPrimary}}>{event.equipment}</Typography>
            <Typography sx={{fontSize: 11, color: T.textSecondary, mt: 0.25, lineHeight: 1.4}}>{event.issue}</Typography>
            <Stack direction="row" spacing={0.75} mt={0.5} flexWrap="wrap" gap={0.5} alignItems="center">
              <Chip size="small" label={event.line} sx={{bgcolor: T.border, color: T.textSecondary, fontWeight: 700, fontSize: 9.5, height: 18}} />
              <Chip size="small" label={`Est. ${event.estimatedDuration}`} sx={{bgcolor: T.border, color: T.textSecondary, fontWeight: 700, fontSize: 9.5, height: 18}} />
              <Typography sx={{fontSize: 10.5, color: T.danger, fontWeight: 700}}>{event.impact}</Typography>
            </Stack>
          </Box>
          <Box sx={{flexShrink: 0, textAlign: 'right'}}>
            <Chip
              size="small"
              label={event.status}
              sx={{bgcolor: T.dangerBg, color: T.danger, border: `1px solid ${T.dangerBorder}`, fontWeight: 900, fontSize: 10, height: 20}}
            />
            <Typography sx={{fontSize: 10, color: T.textMuted, mt: 0.5, fontWeight: 700}}>Detected {event.detectedAt}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// ─── Plan Deviation ───────────────────────────────────────────────────────────

function PlanDeviation() {
  const [viewMode, setViewMode] = useState<'overview' | 'batch'>('overview');
  const [selectedDayOffset, setSelectedDayOffset] = useState<DailyPlanActual['dayOffset']>(0);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('all');

  const selectedDay = planVsActualTimeline.find((d) => d.dayOffset === selectedDayOffset) ?? planVsActualTimeline[2];

  const batchesForDay = viewMode === 'batch'
    ? batchPlanActualMock.filter((b) => selectedBatchId === 'all' || b.batchId === selectedBatchId)
    : [];

  const batchIdsForDay = ['all', ...batchPlanActualMock.map((b) => b.batchId)];

  return (
    <Paper elevation={0} sx={{...planningCardSx, p: 2}}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5} flexWrap="wrap" gap={1}>
        <Box>
          <Typography sx={{fontSize: 13, color: T.textPrimary, fontWeight: 900}}>Plan vs. Actual Deviations</Typography>
          <Typography sx={{fontSize: 11.5, color: T.textSecondary, mt: 0.25}}>
            {selectedDay.isFuture
              ? 'WO schedule forecast · chronogram & material readiness'
              : viewMode === 'overview'
                ? '6 KPIs tracked — plan vs. actual comparison'
                : 'Per-batch breakdown'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          {/* View toggle */}
          <Stack direction="row" spacing={0.5} sx={{bgcolor: T.backgroundAlt, border: `1px solid ${T.border}`, borderRadius: 2, p: 0.375}}>
            {(['overview', 'batch'] as const).map((mode) => (
              <Box
                key={mode}
                onClick={() => setViewMode(mode)}
                sx={{
                  px: 1.25, py: 0.375, borderRadius: 1.5, cursor: 'pointer', fontSize: 11.5, fontWeight: 800,
                  bgcolor: viewMode === mode ? T.primaryBlue : 'transparent',
                  color: viewMode === mode ? 'white' : T.textSecondary,
                  transition: 'background 0.15s',
                  userSelect: 'none',
                }}
              >
                {mode === 'overview' ? 'Overview' : 'By Batch'}
              </Box>
            ))}
          </Stack>
          <Chip icon={<AutoAwesomeIcon sx={{fontSize: 14}} />} label="AI-generated" size="small" sx={{bgcolor: T.aiAccentBg, color: T.aiAccent, border: `1px solid ${T.aiAccentBorder}`, fontWeight: 800, fontSize: 11}} />
        </Stack>
      </Stack>

      {/* Timeline bar */}
      <Box sx={{display: 'flex', gap: 0.75, mb: 1.5, overflowX: 'auto', pb: 0.25}}>
        {planVsActualTimeline.map((day) => {
          const isSelected = day.dayOffset === selectedDayOffset;
          const isToday = day.dayOffset === 0;
          return (
            <Box
              key={day.dayOffset}
              onClick={() => setSelectedDayOffset(day.dayOffset)}
              sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                px: 1.5, py: 0.75, borderRadius: 2, cursor: 'pointer', flexShrink: 0,
                border: `1.5px solid ${isSelected ? T.primaryBlue : isToday ? T.primaryBlue + '55' : T.border}`,
                bgcolor: isSelected ? T.neutralBg : T.surfaceMuted,
                transition: 'all 0.15s',
                '&:hover': {bgcolor: T.border},
              }}
            >
              <Typography sx={{fontSize: 10, fontWeight: 900, color: isSelected ? T.primaryBlue : T.textMuted, letterSpacing: '0.04em', textTransform: 'uppercase'}}>
                {day.dayLabel}
              </Typography>
              <Typography sx={{fontSize: 11.5, fontWeight: 800, color: isSelected ? T.primaryBlue : T.textPrimary}}>
                {day.date}
              </Typography>
              {isToday && (
                <Box sx={{width: 4, height: 4, borderRadius: '50%', bgcolor: T.primaryBlue, mt: 0.25}} />
              )}
            </Box>
          );
        })}
      </Box>

      {/* Batch filter (only in batch mode) */}
      {viewMode === 'batch' && (
        <Box sx={{mb: 1.5}}>
          <TextField
            select
            size="small"
            label="Batch ID"
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            sx={{minWidth: 200, '& .MuiOutlinedInput-root': {fontSize: 12.5, borderRadius: 2}, '& .MuiOutlinedInput-notchedOutline': {borderColor: T.border}}}
          >
            <MenuItem value="all" sx={{fontSize: 12.5, fontWeight: 700}}>All Batches</MenuItem>
            {batchIdsForDay.slice(1).map((id) => (
              <MenuItem key={id} value={id} sx={{fontSize: 12.5}}>{id}</MenuItem>
            ))}
          </TextField>
        </Box>
      )}

      {/* Content */}
      {viewMode === 'overview' && selectedDay.isFuture ? (
        <FutureDayPlanningView dayOffset={selectedDay.dayOffset as 1 | 2} />
      ) : viewMode === 'overview' ? (
        <Box sx={{display: 'grid', gap: 0.75}}>
          <DayKpiRow label="Finished Goods" unit="units" planned={selectedDay.finishedGoods.planned} actual={selectedDay.finishedGoods.actual} higherIsBetter={true} />
          <Divider sx={{borderColor: T.border}} />
          <LineCapacitySection kpi={lineCapacityKpi} />
          <Divider sx={{borderColor: T.border}} />
          <DayKpiRow label="Scrap Rate" unit="%" planned={selectedDay.scrapRatePct.planned} actual={selectedDay.scrapRatePct.actual} higherIsBetter={false} />
          <Divider sx={{borderColor: T.border}} />
          <DayKpiRow label="OEE" unit="%" planned={selectedDay.oee.planned} actual={selectedDay.oee.actual} higherIsBetter={true} />
          <Divider sx={{borderColor: T.border}} />
          <WipSection kpi={wipKpi} />
          <Divider sx={{borderColor: T.border}} />
          <DayKpiRow label="Average Aging" unit="days" planned={selectedDay.avgAging.planned} actual={selectedDay.avgAging.actual} higherIsBetter={false} />
          {selectedDay.dayOffset === -1 && (
            <>
              <Divider sx={{borderColor: T.border}} />
              <UnplannedMaintenanceSection />
            </>
          )}
        </Box>
      ) : (
        <Box sx={{display: 'grid', gap: 0.75}}>
          {batchesForDay.length === 0 ? (
            <Typography sx={{fontSize: 12, color: T.textMuted, textAlign: 'center', py: 2}}>No batches for selected filter.</Typography>
          ) : (
            batchesForDay.map((batch) => <BatchKpiRow key={batch.batchId} batch={batch} />)
          )}
        </Box>
      )}
    </Paper>
  );
}

// ─── Operations Grid ──────────────────────────────────────────────────────────

function OperationsGrid() {
  const today = shiftScheduleMock.filter((s) => s.date.startsWith('Today'));
  const tomorrow = shiftScheduleMock.filter((s) => s.date.startsWith('Tomorrow'));

  return (
    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '1fr 1fr'}, gap: 1.5}}>
      {/* Maintenance Plan */}
      <Paper elevation={0} sx={{...planningCardSx, p: 2}}>
        <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
          {/* borderRadius/xSmall 6px for small icon wrapper */}
          <Box sx={{width: 30, height: 30, borderRadius: 1.5, bgcolor: T.aiAccentBg, color: T.aiAccent, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <BuildIcon sx={{fontSize: 16}} />
          </Box>
          <Box>
            <Typography sx={{fontSize: 13, fontWeight: 900, color: T.textPrimary}}>Maintenance Plan</Typography>
            <Typography sx={{fontSize: 11, color: T.textSecondary}}>Next 7 days</Typography>
          </Box>
        </Stack>
        <Box sx={{display: 'grid', gap: 1}}>
          {maintenancePlanMock.map((item) => {
            const status = maintenanceStatusPalette[item.status];
            const type = maintenanceTypePalette[item.type];
            return (
              /* borderRadius/xSmall 6px for compact list row */
              <Box key={item.id} sx={{display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: 1.5, bgcolor: T.surfaceMuted, border: `1px solid ${T.border}`}}>
                <Box sx={{flexShrink: 0}}>
                  <EngineeringIcon sx={{fontSize: 18, color: T.textSecondary}} />
                </Box>
                <Box sx={{minWidth: 0, flex: 1}}>
                  <Typography sx={{fontSize: 11.5, fontWeight: 800, color: T.textPrimary, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{item.equipment}</Typography>
                  <Stack direction="row" spacing={0.5} mt={0.5} flexWrap="wrap" gap={0.5}>
                    <Chip size="small" label={item.type} sx={{bgcolor: type.bg, color: type.color, fontWeight: 800, fontSize: 9.5, height: 18}} />
                    <Chip size="small" label={item.line} sx={{bgcolor: T.border, color: T.textSecondary, fontWeight: 700, fontSize: 9.5, height: 18}} />
                    <Typography sx={{fontSize: 10.5, color: T.textMuted, alignSelf: 'center'}}>{item.scheduledDate} · {item.duration}</Typography>
                  </Stack>
                </Box>
                <Chip size="small" label={item.status} sx={{bgcolor: status.bg, color: status.color, border: `1px solid ${status.border}`, fontWeight: 900, fontSize: 9.5, height: 20, flexShrink: 0}} />
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* Shift Schedule */}
      <Paper elevation={0} sx={{...planningCardSx, p: 2}}>
        <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
          {/* ⚠ [mismatch] warningAmber (amber/yellow) — no DS amber semantic token */}
          <Box sx={{width: 30, height: 30, borderRadius: 1.5, bgcolor: T.warningAmberBg, color: T.warningAmber, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <CalendarTodayIcon sx={{fontSize: 16}} />
          </Box>
          <Box>
            <Typography sx={{fontSize: 13, fontWeight: 900, color: T.textPrimary}}>Shift Schedule</Typography>
            <Typography sx={{fontSize: 11, color: T.textSecondary}}>Today & Tomorrow</Typography>
          </Box>
        </Stack>
        {[{label: 'Today', entries: today}, {label: 'Tomorrow', entries: tomorrow}].map(({label, entries}) => (
          <Box key={label} sx={{mb: 1}}>
            <Typography sx={{fontSize: 10, fontWeight: 900, color: T.textMuted, letterSpacing: '0.07em', textTransform: 'uppercase', mb: 0.5}}>{label}</Typography>
            <Box sx={{display: 'grid', gap: 0.5}}>
              {entries.map((s) => {
                const sc = shiftColors[s.shift];
                return (
                  /* borderRadius/xSmall 6px for compact shift row */
                  <Box key={s.shift + label} sx={{display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5, borderRadius: 1.5, bgcolor: sc.bg, border: `1px solid color-mix(in srgb, ${sc.color} 13%, transparent)`}}>
                    <Chip size="small" label={s.shift} sx={{bgcolor: 'transparent', color: sc.color, fontWeight: 900, fontSize: 10, height: 18, border: `1px solid color-mix(in srgb, ${sc.color} 33%, transparent)`, minWidth: 68}} />
                    <Typography sx={{fontSize: 11, color: T.textSecondary, flex: 1}}>{s.lines.join(', ')}</Typography>
                    <Typography sx={{fontSize: 11, fontWeight: 800, color: T.textPrimary, whiteSpace: 'nowrap'}}>{s.plannedUnits.toLocaleString()} u</Typography>
                    <Typography sx={{fontSize: 10, color: T.textMuted, whiteSpace: 'nowrap'}}>{s.headcount} ppl</Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}

// ─── AI Agent Panel ───────────────────────────────────────────────────────────

type AiAgentPanelProps = {
  recommendations: PlanningRecommendation[];
  onAccept: (id: string) => void;
  onRejectOpen: (id: string) => void;
  onNavigate: (pageId: ProductionPlanningPageId, label: string) => void;
  recommendationSummary: {pending: number; accepted: number; rejected: number};
};

const agentResponses = [
  "I've analyzed the request. Based on current WO readiness scores and material status, the safest action is to proceed with the re-sequence on Line 2 first, then address the shortage escalation.",
  "Looking at the scheduling data, I see 3 available dispatch windows today that could absorb the re-sequenced WOs without impacting shift changeovers.",
  "Material lot M-447 has a partial substitution available. I can model the impact on your CTB count — would you like me to run that simulation?",
  "Current PPA trajectory suggests we'll close the week at 93–95% depending on Line 3 recovery. Re-sequencing now improves the upper bound.",
];

function AiAgentPanel({recommendations, onAccept, onRejectOpen, onNavigate, recommendationSummary}: AiAgentPanelProps) {
  const [messages, setMessages] = useState<AiAgentMessage[]>(initialAiAgentMessages);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [executedActions, setExecutedActions] = useState<Set<string>>(new Set());
  const feedRef = useRef<HTMLDivElement>(null);
  const responseIndex = useRef(0);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: AiAgentMessage = {id: `MSG-U-${Date.now()}`, role: 'user', text: input.trim(), timestamp: new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false})};
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      const reply: AiAgentMessage = {
        id: `MSG-A-${Date.now()}`,
        role: 'agent',
        text: agentResponses[responseIndex.current % agentResponses.length],
        timestamp: new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false}),
        actionType: 'info',
      };
      responseIndex.current += 1;
      setMessages((prev) => [...prev, reply]);
      setThinking(false);
    }, 1600);
  };

  const pendingRecs = recommendations.filter((r) => r.status === 'pending').slice(0, 2);

  return (
    <Paper
      elevation={0}
      sx={{
        ...planningCardSx,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Panel Header */}
      <Box sx={{px: 2, pt: 2, pb: 1.5, borderBottom: `1px solid ${T.border}`}}>
        <Stack direction="row" spacing={1} alignItems="center">
          {/* borderRadius/xSmall 6px for small icon wrapper */}
          <Box sx={{width: 32, height: 32, borderRadius: 1.5, background: `linear-gradient(135deg, ${T.primaryNavy} 0%, ${T.primaryBlue} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <AutoAwesomeIcon sx={{fontSize: 17, color: 'white'}} />
          </Box>
          <Box sx={{flex: 1}}>
            <Typography sx={{fontSize: 13, fontWeight: 900, color: T.textPrimary}}>AI Planning Agent</Typography>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Box sx={{width: 6, height: 6, borderRadius: '50%', bgcolor: T.successActive}} />
              <Typography sx={{fontSize: 10.5, color: T.textSecondary, fontWeight: 700}}>Active · 94% avg. confidence</Typography>
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* Chat Feed */}
      <Box ref={feedRef} sx={{flex: 1, overflowY: 'auto', px: 1.5, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1, minHeight: 0}}>
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <Box
              sx={{
                maxWidth: '88%',
                px: 1.5,
                py: 1,
                borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '2px 12px 12px 12px',
                bgcolor: msg.role === 'user' ? T.primaryNavy : T.surfaceMuted,
                border: `1px solid ${msg.role === 'user' ? T.primaryNavy : T.border}`,
              }}
            >
              <Typography sx={{fontSize: 12, color: msg.role === 'user' ? 'white' : T.textPrimary, lineHeight: 1.55, fontWeight: msg.role === 'agent' ? 700 : 500}}>
                {msg.text}
              </Typography>
            </Box>
            <Typography sx={{fontSize: 10, color: T.textMuted, mt: 0.25, px: 0.5}}>{msg.timestamp}</Typography>
          </Box>
        ))}
        {thinking && (
          <Box sx={{display: 'flex', alignItems: 'flex-start'}}>
            <Box sx={{px: 1.5, py: 1, borderRadius: '2px 12px 12px 12px', bgcolor: T.surfaceMuted, border: `1px solid ${T.border}`}}>
              <Typography sx={{fontSize: 12, color: T.textSecondary, fontWeight: 700}}>AI is analyzing…</Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Chat Input */}
      <Box sx={{px: 1.5, py: 1.5, borderTop: `1px solid ${T.border}`}}>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            fullWidth
            placeholder="Ask the AI agent…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {if (e.key === 'Enter' && !e.shiftKey) {e.preventDefault(); handleSend();}}}
            sx={{
              '& .MuiOutlinedInput-root': {fontSize: 12.5, borderRadius: 3},
              '& .MuiOutlinedInput-notchedOutline': {borderColor: T.border},
            }}
          />
          {/* borderRadius/xSmall 6px for small icon button */}
          <IconButton
            onClick={handleSend}
            disabled={!input.trim() || thinking}
            sx={{bgcolor: T.primaryBlue, color: 'white', borderRadius: 1.5, width: 38, height: 38, '&:hover': {bgcolor: T.primaryBlueAlt}, '&:disabled': {bgcolor: T.border}}}
          >
            <SendIcon sx={{fontSize: 17}} />
          </IconButton>
        </Stack>
        <Typography sx={{fontSize: 10, color: T.textMuted, mt: 0.5, textAlign: 'center'}}>Agent acts with your approval</Typography>
      </Box>

      <Divider sx={{borderColor: T.border}} />

      {/* Suggested Agent Actions */}
      <Box sx={{px: 1.5, py: 1.5}}>
        <Typography sx={{fontSize: 10.5, color: T.textMuted, fontWeight: 900, letterSpacing: '0.07em', textTransform: 'uppercase', mb: 1}}>Suggested Actions</Typography>
        <Box sx={{display: 'grid', gap: 0.75}}>
          {aiAgentActionsMock.map((action) => {
            const done = executedActions.has(action.id);
            return (
              /* borderRadius/Medium 12px for mini action cards */
              <Box key={action.id} sx={{p: 1, borderRadius: 3, bgcolor: done ? T.successBg : T.surfaceMuted, border: `1px solid ${done ? T.successBorder : T.border}`}}>
                <Typography sx={{fontSize: 12, fontWeight: 800, color: T.textPrimary, lineHeight: 1.25}}>{action.label}</Typography>
                <Typography sx={{fontSize: 11, color: T.textSecondary, mt: 0.25, mb: 0.75}}>{action.impact}</Typography>
                <Stack direction="row" spacing={0.75}>
                  {/* borderRadius/xSmall 6px for small buttons */}
                  <Button size="small" variant="outlined" sx={{fontSize: 11, textTransform: 'none', fontWeight: 800, borderRadius: 1.5, py: 0.25, px: 1, borderColor: T.border, color: T.textSecondary, minWidth: 0}}>Review</Button>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={done}
                    startIcon={done ? <CheckCircleOutlineIcon sx={{fontSize: 13}} /> : <PlayArrowIcon sx={{fontSize: 13}} />}
                    onClick={() => setExecutedActions((prev) => new Set([...prev, action.id]))}
                    sx={{fontSize: 11, textTransform: 'none', fontWeight: 800, borderRadius: 1.5, py: 0.25, px: 1, bgcolor: done ? T.success : T.primaryBlue, '&:hover': {bgcolor: done ? T.success : T.primaryBlueAlt}, minWidth: 0}}
                  >
                    {done ? 'Executed' : 'Execute'}
                  </Button>
                </Stack>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Divider sx={{borderColor: T.border}} />

      {/* Decision Queue Mini */}
      <Box sx={{px: 1.5, py: 1.5}}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography sx={{fontSize: 10.5, color: T.textMuted, fontWeight: 900, letterSpacing: '0.07em', textTransform: 'uppercase'}}>Decision Queue</Typography>
          {/* ⚠ [mismatch] uses aiAccentBg — violet-50 (#F5F3FF) approximated by aiAccentBg (#EEF2FF) */}
          <Chip size="small" label={`${recommendationSummary.pending} pending`} sx={{bgcolor: T.aiAccentBg, color: T.aiAccent, border: `1px solid ${T.aiAccentBorder}`, fontWeight: 900, fontSize: 10, height: 18}} />
        </Stack>
        <Box sx={{display: 'grid', gap: 0.75}}>
          {pendingRecs.map((rec) => (
            /* borderRadius/Medium 12px for mini decision cards */
            <Box key={rec.id} sx={{p: 1, borderRadius: 3, bgcolor: T.surfaceMuted, border: `1px solid ${T.border}`}}>
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
                <Box sx={{flex: 1, minWidth: 0}}>
                  <Typography sx={{fontSize: 11.5, fontWeight: 800, color: T.textPrimary, lineHeight: 1.25, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{rec.title}</Typography>
                  <Typography sx={{fontSize: 10.5, color: T.primaryBlue, fontWeight: 700, mt: 0.25}}>{rec.confidence}% confidence</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={0.5} mt={0.75}>
                {/* brand/main for primary actions; borderRadius/xSmall 6px for small buttons */}
                <Button size="small" variant="contained" startIcon={<ThumbUpAltOutlinedIcon sx={{fontSize: 12}} />} onClick={() => onAccept(rec.id)} sx={{fontSize: 10.5, textTransform: 'none', fontWeight: 800, borderRadius: 1.5, py: 0.25, px: 1, bgcolor: T.primaryBlue, '&:hover': {bgcolor: T.primaryBlueAlt}, minWidth: 0}}>Accept</Button>
                <Button size="small" variant="outlined" color="error" startIcon={<ThumbDownAltOutlinedIcon sx={{fontSize: 12}} />} onClick={() => onRejectOpen(rec.id)} sx={{fontSize: 10.5, textTransform: 'none', fontWeight: 800, borderRadius: 1.5, py: 0.25, px: 1, minWidth: 0}}>Reject</Button>
              </Stack>
            </Box>
          ))}
        </Box>
        <Button
          size="small"
          endIcon={<OpenInNewIcon sx={{fontSize: 12}} />}
          onClick={() => onNavigate('work-orders', 'Decision Queue')}
          sx={{mt: 0.75, fontSize: 11, textTransform: 'none', fontWeight: 800, color: T.primaryBlue, py: 0.25, px: 0.5}}
        >
          View all recommendations
        </Button>
      </Box>
    </Paper>
  );
}

// ─── Root Export ──────────────────────────────────────────────────────────────

type PlanningOverviewV2Props = {
  recommendations: PlanningRecommendation[];
  onAccept: (id: string) => void;
  onRejectOpen: (id: string) => void;
  onNavigate: (pageId: ProductionPlanningPageId, label: string) => void;
  recommendationSummary: {pending: number; accepted: number; rejected: number};
};

export default function PlanningOverviewV2({recommendations, onAccept, onRejectOpen, onNavigate, recommendationSummary}: PlanningOverviewV2Props) {
  const [dismissedAlert, setDismissedAlert] = useState(false);

  return (
    // elevation/5 outer shadow, borderRadius/Medium 12px
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 0, bgcolor: T.background, borderRadius: 3, overflow: 'hidden', boxShadow: T.outerShadow}}>
      <AiNotificationsStrip onNavigate={onNavigate} />
      <CommandHeader />

      <Box sx={{p: {xs: 1.5, md: 2}, display: 'flex', flexDirection: 'column', gap: 2}}>
        {/* Hero KPIs */}
        <HeroKpiStrip />

        {/* Main 2-col body */}
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', lg: 'minmax(0, 1.85fr) minmax(280px, 0.8fr)'}, gap: 2, alignItems: 'start'}}>
          {/* Left column */}
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <PlanDeviation />
            <PlanningHealthGrid onNavigate={onNavigate} />
            <OperationsGrid />
          </Box>

          {/* Right: AI Agent Panel */}
          <Box sx={{position: {lg: 'sticky'}, top: {lg: 16}}}>
            <AiAgentPanel
              recommendations={recommendations}
              onAccept={onAccept}
              onRejectOpen={onRejectOpen}
              onNavigate={onNavigate}
              recommendationSummary={recommendationSummary}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
