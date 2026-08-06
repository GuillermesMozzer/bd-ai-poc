import type {SvgIconComponent} from '@mui/icons-material';
import {
  ApartmentOutlined as DepartmentIcon,
  BuildOutlined as MaintenanceIcon,
  ChevronRightRounded as ChevronRightIcon,
  HubOutlined as CellIcon,
  EditOutlined as AddNoteIcon,
  InfoOutlined as InfoIcon,
  KeyboardArrowDownRounded as ExpandMoreIcon,
  KeyboardArrowLeftRounded as BackIcon,
  KeyboardArrowUpRounded as UpArrowIcon,
  LocalShippingOutlined as DeliveryIcon,
  OpenInNew as OpenInNewIcon,
  PeopleAltOutlined as PeopleIcon,
  PrecisionManufacturingOutlined as LineIcon,
  PublicOutlined as SiteIcon,
  SearchOffOutlined as QualityIcon,
  ShieldOutlined as SafetyIcon,
  WarningAmberRounded as EscalateIcon,
} from '@mui/icons-material';
import {Box, Button, Chip, Paper, Typography} from '@mui/material';
import {useEffect, useState} from 'react';

type LiveContextRailProps = {
  onClearSiteContext?: () => void;
  onOpenSiteView?: () => void;
  onOpenQualityAlert?: () => void;
  onOpenTier1NcWorkflow?: () => void;
  onSelectSiteContext?: (context: {path: string[]; scopeLabel: string; siteName: string}) => void;
  onSendPrompt: (prompt: string) => void;
  themeMode?: 'dark' | 'light';
  isSidebarMode?: boolean;
};

type OperationalSignal = {
  accent: string;
  chartKind: 'bars' | 'line';
  chartLabels: [string, string, string];
  chartScaleLabel: string;
  icon: SvgIconComponent;
  id: 'quality' | 'delivery' | 'safety' | 'people' | 'maintenance';
  label: string;
  prompt: string;
  series: number[];
};

type SiteVisualizationMode = 'sites' | 'hierarchy';
type SiteHealthTone = 'healthy' | 'warning' | 'critical';
type SiteScopeType = 'site' | 'department' | 'cell' | 'line';

type LiveContextSite = {
  criticalAlerts: number;
  departments: number;
  health: number;
  left: string;
  linesBelowTarget: number;
  lineCount: number;
  location: string;
  name: string;
  cells: number;
  oee: number;
  top: string;
  tone: SiteHealthTone;
};

type SiteSelection = {
  path: string[];
  scopeLabel: string;
  siteName: string;
  type: SiteScopeType;
};

type SiteHierarchyNode = {
  children?: SiteHierarchyNode[];
  id: string;
  kind: 'root' | 'site' | 'department' | 'cell' | 'line';
  label: string;
  siteName?: string;
};

const liveContextSites: LiveContextSite[] = [
  {
    criticalAlerts: 3,
    departments: 4,
    health: 72,
    left: '20.5%',
    linesBelowTarget: 2,
    lineCount: 7,
    location: 'Ohio, USA',
    name: 'Columbus West',
    cells: 11,
    oee: 72,
    top: '38%',
    tone: 'critical',
  },
  {
    criticalAlerts: 0,
    departments: 3,
    health: 89,
    left: '12.6%',
    linesBelowTarget: 0,
    lineCount: 6,
    location: 'United States',
    name: 'Sandy',
    cells: 8,
    oee: 89,
    top: '36.4%',
    tone: 'healthy',
  },
  {
    criticalAlerts: 2,
    departments: 3,
    health: 74,
    left: '33.9%',
    linesBelowTarget: 3,
    lineCount: 6,
    location: 'Brazil',
    name: 'Juiz de Fora',
    cells: 9,
    oee: 74,
    top: '72.5%',
    tone: 'warning',
  },
  {
    criticalAlerts: 1,
    departments: 4,
    health: 75,
    left: '45.6%',
    linesBelowTarget: 1,
    lineCount: 8,
    location: 'Spain',
    name: 'Fraga',
    cells: 10,
    oee: 75,
    top: '38.9%',
    tone: 'warning',
  },
  {
    criticalAlerts: 0,
    departments: 4,
    health: 87,
    left: '76.8%',
    linesBelowTarget: 0,
    lineCount: 8,
    location: 'Singapore',
    name: 'Tuas',
    cells: 10,
    oee: 87,
    top: '65%',
    tone: 'healthy',
  },
  {
    criticalAlerts: 1,
    departments: 4,
    health: 78,
    left: '46.3%',
    linesBelowTarget: 1,
    lineCount: 7,
    location: 'United Kingdom',
    name: 'Plymouth',
    cells: 9,
    oee: 78,
    top: '28.6%',
    tone: 'warning',
  },
];


const globalViewNewsHighlights = [
  {
    siteName: 'Columbus West',
    headline: 'Packaging Line 3 is the clearest network recovery risk with OEE down to 72%.',
    summary: 'Two lots remain on hold, and this is the first site a director should pressure-check before the next handoff.',
    tone: '#FF5F76',
    timeLabel: '2m ago',
  },
  {
    siteName: 'Juiz de Fora',
    headline: 'Safety pressure rose in final assembly while rework is still absorbing capacity.',
    summary: 'This site is the second escalation watch because the next eight hours could turn a local issue into a service risk.',
    tone: '#FF8A5B',
    timeLabel: '4m ago',
  },
  {
    siteName: 'Sandy',
    headline: 'Best recovery cushion in the network with the cleanest operating rhythm today.',
    summary: 'If Columbus West needs temporary support, Sandy is the least disruptive place to absorb extra attention.',
    tone: '#67E86B',
    timeLabel: '9m ago',
  },
] as const;

const liveContextHierarchy: SiteHierarchyNode[] = [
  {
    id: 'global',
    kind: 'root',
    label: 'Global',
    children: [
      {
        id: 'site-columbus-west',
        kind: 'site',
        label: 'Columbus West',
        siteName: 'Columbus West',
        children: [
          {
            id: 'dept-ops',
            kind: 'department',
            label: 'Operations',
            siteName: 'Columbus West',
            children: [
              {
                id: 'cell-a',
                kind: 'cell',
                label: 'Cell A',
                siteName: 'Columbus West',
                children: [
                  {id: 'line-3', kind: 'line', label: 'Line 3', siteName: 'Columbus West'},
                  {id: 'line-4', kind: 'line', label: 'Line 4', siteName: 'Columbus West'},
                ],
              },
              {
                id: 'cell-b',
                kind: 'cell',
                label: 'Cell B',
                siteName: 'Columbus West',
                children: [
                  {id: 'line-6', kind: 'line', label: 'Line 6', siteName: 'Columbus West'},
                ],
              },
            ],
          },
          {
            id: 'dept-packaging',
            kind: 'department',
            label: 'Packaging',
            siteName: 'Columbus West',
            children: [
              {
                id: 'cell-p1',
                kind: 'cell',
                label: 'Cell P1',
                siteName: 'Columbus West',
                children: [
                  {id: 'line-8', kind: 'line', label: 'Line 8', siteName: 'Columbus West'},
                ],
              },
            ],
          },
        ],
      },
      {id: 'site-sandy', kind: 'site', label: 'Sandy', siteName: 'Sandy'},
      {id: 'site-juiz', kind: 'site', label: 'Juiz de Fora', siteName: 'Juiz de Fora'},
      {id: 'site-fraga', kind: 'site', label: 'Fraga', siteName: 'Fraga'},
      {id: 'site-tuas', kind: 'site', label: 'Tuas', siteName: 'Tuas'},
      {id: 'site-plymouth', kind: 'site', label: 'Plymouth', siteName: 'Plymouth'},
    ],
  },
];

const defaultExpandedHierarchyIds = ['global', 'site-columbus-west', 'dept-ops', 'cell-a'];

const siteToneStyles: Record<SiteHealthTone, {border: string; glow: string; label: string; soft: string; text: string}> = {
  healthy: {
    border: 'rgba(103,232,107,0.32)',
    glow: 'rgba(103,232,107,0.35)',
    label: 'Operational',
    soft: 'rgba(103,232,107,0.12)',
    text: '#67E86B',
  },
  warning: {
    border: 'rgba(255,171,64,0.32)',
    glow: 'rgba(255,171,64,0.35)',
    label: 'Watch',
    soft: 'rgba(255,171,64,0.12)',
    text: '#FFAB40',
  },
  critical: {
    border: 'rgba(255,95,118,0.34)',
    glow: 'rgba(255,95,118,0.38)',
    label: 'Critical',
    soft: 'rgba(255,95,118,0.12)',
    text: '#FF5F76',
  },
};

const operationalSignals: OperationalSignal[] = [
  {
    accent: '#A855F7',
    chartKind: 'bars',
    chartLabels: ['May 10', 'May 11', 'May 12'],
    chartScaleLabel: '10',
    icon: QualityIcon,
    id: 'quality',
    label: 'Quality',
    prompt: 'Break down the open NCs, what changed versus yesterday, and what should I do first?',
    series: [4.8, 7.1, 8.2],
  },
  {
    accent: '#38BDF8',
    chartKind: 'line',
    chartLabels: ['May 10', 'May 11', 'May 12'],
    chartScaleLabel: '100',
    icon: DeliveryIcon,
    id: 'delivery',
    label: 'Delivery',
    prompt: 'Summarize the delivery drift and tell me which line is dragging schedule adherence.',
    series: [68, 55, 66, 60, 54],
  },
  {
    accent: '#84CC16',
    chartKind: 'line',
    chartLabels: ['May 10', 'May 11', 'May 12'],
    chartScaleLabel: '%',
    icon: SafetyIcon,
    id: 'safety',
    label: 'Safety',
    prompt: 'Review the latest safety signal and tell me what operators need to know this shift.',
    series: [4, 5, 8, 22, 8, 12, 5],
  },
  {
    accent: '#F59E0B',
    chartKind: 'bars',
    chartLabels: ['May 10', 'May 11', 'May 12'],
    chartScaleLabel: '3',
    icon: PeopleIcon,
    id: 'people',
    label: 'People',
    prompt: 'Review today’s shift coverage risk and tell me how to rebalance the team before handoff.',
    series: [1.2, 2.4, 1.6],
  },
  {
    accent: '#F97316',
    chartKind: 'bars',
    chartLabels: ['May 10', 'May 11', 'May 12'],
    chartScaleLabel: '4',
    icon: MaintenanceIcon,
    id: 'maintenance',
    label: 'Maintenance',
    prompt: 'Which assets are critical right now and what work orders should I follow up before handoff?',
    series: [2.4, 3.25, 1.9],
  },
];

const quickActions = [
  {
    icon: OpenInNewIcon,
    label: 'Open Tier 1 workflow',
    prompt: 'Open the Tier 1 workflow and summarize the blockers I should cover first.',
  },
  {
    icon: OpenInNewIcon,
    label: 'View Morning Handoff',
    prompt: 'Summarize the morning handoff and highlight anything critical for me.',
  },
  {
    icon: AddNoteIcon,
    label: 'Add Note',
    prompt: 'Draft a short handoff note for the most important issue right now.',
  },
  {
    icon: EscalateIcon,
    label: 'Escalate Issue',
    prompt: 'Help me escalate the current top issue with a concise summary and next owner.',
  },
] as const;

const railPanelShellSx = {
  position: 'relative',
  overflow: 'hidden',
  bgcolor: '#142540',
  border: '1px solid rgba(124,146,184,0.2)',
  boxShadow: '0 18px 44px rgba(2,6,23,0.2), inset 0 1px 0 rgba(255,255,255,0.02)',
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: '-30% auto auto -45%',
    width: '60%',
    height: '160%',
    background: 'linear-gradient(90deg, transparent 0%, rgba(125,211,252,0.07) 48%, transparent 100%)',
    transform: 'rotate(16deg)',
    animation: 'railPanelSweep 7s linear infinite',
    pointerEvents: 'none',
  },
  '@keyframes railPanelSweep': {
    '0%': {transform: 'translateX(-18%) rotate(16deg)', opacity: 0},
    '12%': {opacity: 1},
    '50%': {transform: 'translateX(132%) rotate(16deg)', opacity: 0.9},
    '100%': {transform: 'translateX(132%) rotate(16deg)', opacity: 0},
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 1,
    borderRadius: 'inherit',
    border: '1px solid rgba(255,255,255,0.04)',
    pointerEvents: 'none',
  },
} as const;

const railInnerCardSx = {
  position: 'relative',
  overflow: 'hidden',
  bgcolor: 'rgba(22,39,66,0.86)',
  border: '1px solid rgba(148,163,184,0.14)',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    border: '1px solid rgba(255,255,255,0.03)',
    pointerEvents: 'none',
  },
} as const;

function SectionTitle({label}: {label: string}) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1}}>
      <Typography sx={{fontSize: 12, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--rail-title, #E2E8F0)'}}>
        {label}
      </Typography>
      <InfoIcon sx={{fontSize: 15, color: 'var(--rail-muted, #94A3B8)'}} />
    </Box>
  );
}

function getHealthToneFromValue(value: number): SiteHealthTone {
  if (value >= 84) return 'healthy';
  if (value >= 76) return 'warning';
  return 'critical';
}

function HealthArc({isLightMode = false, oee, value}: {isLightMode?: boolean; oee?: number; value: number}) {
  const normalizedValue = Math.max(0, Math.min(100, value));
  const totalArc = 252;
  const activeArc = (normalizedValue / 100) * totalArc;
  const tone = siteToneStyles[getHealthToneFromValue(value)];

  return (
        <Box
          sx={{
            width: 128,
            height: 128,
        borderRadius: '50%',
        background: `conic-gradient(from 214deg, rgba(74,222,128,0) 0deg, rgba(74,222,128,0) 54deg, ${tone.text} 118deg, ${tone.text} ${Math.max(activeArc, 120)}deg, rgba(41,61,99,0.3) ${Math.max(activeArc + 6, 126)}deg ${totalArc}deg, transparent ${totalArc}deg 360deg)`,
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
        filter: `drop-shadow(0 10px 22px ${tone.glow})`,
      }}
    >
        <Box
          sx={{
            position: 'absolute',
            inset: 17,
            borderRadius: '50%',
            bgcolor: isLightMode ? '#FFFFFF' : '#0A1427',
            border: isLightMode ? '1px solid #D7E3F4' : '1px solid rgba(88,115,168,0.22)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.02)',
          }}
        />
      <Box sx={{position: 'relative', zIndex: 1, textAlign: 'center'}}>
        <Typography sx={{fontSize: 23, fontWeight: 800, color: isLightMode ? '#0F172A' : '#F8FAFC', lineHeight: 1}}>
          {value}
          <Box component="span" sx={{fontSize: 10, color: '#94A3B8', ml: 0.35}}>
            %
          </Box>
        </Typography>
        <Typography sx={{fontSize: 11, color: tone.text, mt: 0.45, fontWeight: 800}}>Health</Typography>
        {typeof oee === 'number' ? (
          <Typography sx={{fontSize: 10.5, color: isLightMode ? '#64748B' : '#9BB0D3', mt: 0.35}}>
            OEE {oee}%
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

function FocusQualityVisual({isLightMode = false}: {isLightMode?: boolean}) {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 138,
        borderRadius: 2.5,
        overflow: 'hidden',
        backgroundImage: isLightMode
          ? `linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 100%), url("/images/Quality alert white mode.png")`
          : `linear-gradient(180deg, rgba(6,12,27,0.12) 0%, rgba(6,12,27,0.28) 100%), url("/images/Quality Alert.png")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border: '1px solid rgba(248,113,113,0.22)',
        animation: 'qualityAlertShellPulse 2.4s ease-in-out infinite',
        '@keyframes qualityAlertShellPulse': {
          '0%, 100%': {boxShadow: '0 0 0 0 rgba(248,113,113,0.12), inset 0 0 0 1px rgba(248,113,113,0.08)'},
          '50%': {boxShadow: '0 0 0 2px rgba(248,113,113,0.22), 0 0 18px rgba(248,113,113,0.18), inset 0 0 0 1px rgba(248,113,113,0.18)'},
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(110deg, transparent 18%, rgba(255,255,255,0.08) 42%, transparent 64%)',
          transform: 'translateX(-110%)',
          animation: 'qualityAlertSweep 3.8s ease-in-out infinite',
          '@keyframes qualityAlertSweep': {
            '0%, 15%': {transform: 'translateX(-110%)', opacity: 0},
            '30%': {opacity: 0.9},
            '55%': {transform: 'translateX(110%)', opacity: 0.55},
            '100%': {transform: 'translateX(110%)', opacity: 0},
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          right: '25.6%',
          top: '44.5%',
          width: 11,
          height: 11,
          borderRadius: '50%',
          bgcolor: '#FF5D5D',
          boxShadow: '0 0 0 0 rgba(255,93,93,0.55)',
          animation: 'qualityIssuePulse 1.8s ease-in-out infinite',
          '@keyframes qualityIssuePulse': {
            '0%, 100%': {
              transform: 'translate(0, 0) scale(0.94)',
              boxShadow: '0 0 0 0 rgba(255,93,93,0.5)',
              opacity: 0.9,
            },
            '50%': {
              transform: 'translate(0, 0) scale(1.08)',
              boxShadow: '0 0 0 12px rgba(255,93,93,0)',
              opacity: 1,
            },
          },
        }}
      />
    </Box>
  );
}

function MiniTrendChart({isLightMode = false, signal}: {isLightMode?: boolean; signal: OperationalSignal}) {
  const plotWidth = 118;
  const plotHeight = 42;
  const plotPaddingX = signal.chartKind === 'bars' ? 18 : 10;
  const plotPaddingY = 6;
  const innerWidth = plotWidth - plotPaddingX * 2;
  const innerHeight = plotHeight - plotPaddingY * 2;

  if (signal.chartKind === 'bars') {
    const maxValue = Math.max(...signal.series, 1);
    const barWidth = 16;
    const gap = signal.series.length > 1 ? (innerWidth - barWidth * signal.series.length) / (signal.series.length - 1) : 0;

    return (
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.4}}>
        <Box sx={{display: 'flex', justifyContent: 'flex-end', pr: 0.15}}>
          <Typography sx={{fontSize: 9.5, color: isLightMode ? '#94A3B8' : '#7F93B5'}}>{signal.chartScaleLabel}</Typography>
        </Box>
        <Box component="svg" viewBox={`0 0 ${plotWidth} ${plotHeight}`} sx={{width: 118, height: 46, overflow: 'visible'}}>
          <rect x="0.5" y="0.5" width={plotWidth - 1} height={plotHeight - 1} rx="6" fill={isLightMode ? '#F8FAFC' : 'rgba(9,18,37,0.72)'} stroke={isLightMode ? '#D7E3F4' : 'rgba(148,163,184,0.12)'} />
          {[0.2, 0.5, 0.8].map((ratio) => {
            const y = plotHeight - plotPaddingY - innerHeight * ratio;
            return <path key={`${signal.id}-grid-${ratio}`} d={`M ${plotPaddingX} ${y} H ${plotWidth - plotPaddingX}`} stroke="rgba(148,163,184,0.12)" strokeDasharray="2 4" />;
          })}
          <path d={`M ${plotPaddingX} ${plotHeight - plotPaddingY} H ${plotWidth - plotPaddingX}`} stroke="rgba(148,163,184,0.18)" />
          {signal.series.map((value, index) => {
            const height = Math.max(8, (value / maxValue) * innerHeight);
            const x = plotPaddingX + index * (barWidth + gap);
            const y = plotHeight - plotPaddingY - height;

            return (
              <rect
                key={`${signal.id}-bar-${index}`}
                x={x}
                y={y}
                width={barWidth}
                height={height}
                rx="1.8"
                fill={signal.accent}
              />
            );
          })}
        </Box>
        <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.35, pl: 1.25}}>
          {signal.chartLabels.map((label) => (
            <Typography key={`${signal.id}-${label}`} sx={{fontSize: 10, color: '#94A3B8', textAlign: 'center'}}>
              {label}
            </Typography>
          ))}
        </Box>
      </Box>
    );
  }

  const maxValue = Math.max(...signal.series, 1);
  const points = signal.series
    .map((value, index) => {
      const x = plotPaddingX + (index / Math.max(signal.series.length - 1, 1)) * innerWidth;
      const y = plotHeight - plotPaddingY - (value / maxValue) * innerHeight;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.4}}>
      <Box sx={{display: 'flex', justifyContent: 'flex-end', pr: 0.15}}>
        <Typography sx={{fontSize: 9.5, color: isLightMode ? '#94A3B8' : '#7F93B5'}}>{signal.chartScaleLabel}</Typography>
      </Box>
      <Box component="svg" viewBox={`0 0 ${plotWidth} ${plotHeight}`} sx={{width: 118, height: 46, overflow: 'visible'}}>
        <rect x="0.5" y="0.5" width={plotWidth - 1} height={plotHeight - 1} rx="6" fill={isLightMode ? '#F8FAFC' : 'rgba(9,18,37,0.72)'} stroke={isLightMode ? '#D7E3F4' : 'rgba(148,163,184,0.12)'} />
        {[0.2, 0.5, 0.8].map((ratio) => {
          const y = plotHeight - plotPaddingY - innerHeight * ratio;
          return <path key={`${signal.id}-grid-${ratio}`} d={`M ${plotPaddingX} ${y} H ${plotWidth - plotPaddingX}`} stroke="rgba(148,163,184,0.12)" strokeDasharray="2 4" />;
        })}
        {signal.id === 'delivery' ? <path d={`M ${plotPaddingX} ${plotPaddingY + 2} H ${plotWidth - plotPaddingX}`} stroke="rgba(245,158,11,0.8)" strokeDasharray="3 4" /> : null}
        <path d={`M ${plotPaddingX} ${plotHeight - plotPaddingY} H ${plotWidth - plotPaddingX}`} stroke="rgba(148,163,184,0.18)" />
        <polyline fill="none" stroke={signal.accent} strokeWidth="2.5" points={points} />
        {signal.series.map((value, index) => {
          const x = plotPaddingX + (index / Math.max(signal.series.length - 1, 1)) * innerWidth;
          const y = plotHeight - plotPaddingY - (value / maxValue) * innerHeight;
          return <circle key={`${signal.id}-dot-${index}`} cx={x} cy={y} r={index === signal.series.length - 1 ? 3.3 : 2.8} fill={signal.accent} />;
        })}
      </Box>
      <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.3}}>
        {signal.chartLabels.map((label) => (
            <Typography key={`${signal.id}-${label}`} sx={{fontSize: 10, color: '#94A3B8', textAlign: 'center'}}>
              {label}
            </Typography>
        ))}
      </Box>
    </Box>
  );
}

function SignalContent({signal}: {signal: OperationalSignal}) {
  if (signal.id === 'quality') {
    return (
      <>
        <Typography sx={{fontSize: 13.4, fontWeight: 800, color: '#F8FAFC'}}>{signal.label}</Typography>
        <Typography sx={{fontSize: 12, color: '#E2E8F0', mt: 0.2}}>
          <Box component="span" sx={{color: '#F4A7FF', fontWeight: 800, mr: 0.4}}>
            2
          </Box>
          NCs Open
        </Typography>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.2, mt: 0.35, flexWrap: 'wrap'}}>
          <UpArrowIcon sx={{fontSize: 20, color: '#F87171'}} />
          <Typography sx={{fontSize: 15, fontWeight: 800, color: '#F87171'}}>18%</Typography>
          <Typography sx={{fontSize: 11, color: '#A5B4CC', fontWeight: 700, ml: 1}}>vs yesterday</Typography>
        </Box>
      </>
    );
  }

  if (signal.id === 'delivery') {
    return (
      <>
        <Typography sx={{fontSize: 13.4, fontWeight: 800, color: '#F8FAFC'}}>{signal.label}</Typography>
        <Typography sx={{fontSize: 11.6, color: '#CBD5E1', mt: 0.15}}>Schedule Adherence</Typography>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5, flexWrap: 'wrap'}}>
          <Typography sx={{fontSize: 17, fontWeight: 800, color: '#F8FAFC'}}>88%</Typography>
          <Chip
            label="Below target"
            size="small"
            sx={{
              height: 22,
              bgcolor: 'rgba(245,158,11,0.12)',
              color: '#FBBF24',
              border: '1px solid rgba(245,158,11,0.28)',
              fontWeight: 800,
            }}
          />
        </Box>
      </>
    );
  }

  if (signal.id === 'safety') {
    return (
      <>
        <Typography sx={{fontSize: 13.4, fontWeight: 800, color: '#F8FAFC'}}>{signal.label}</Typography>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.45, flexWrap: 'wrap'}}>
          <Typography sx={{fontSize: 12, color: '#84CC16', fontWeight: 800}}>1 Near Miss</Typography>
          <Typography sx={{fontSize: 11, color: '#CBD5E1', fontWeight: 700}}>Today</Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Typography sx={{fontSize: 13.4, fontWeight: 800, color: '#F8FAFC'}}>{signal.label}</Typography>
      <Typography sx={{fontSize: 12, color: '#E2E8F0', fontWeight: 700, mt: 0.35}}>
        <Box component="span" sx={{color: '#F97316', fontWeight: 800, mr: 0.4}}>
          3
        </Box>
        Critical Assets
      </Typography>
      <Typography sx={{fontSize: 11.4, color: '#CBD5E1', mt: 0.35}}>Require attention</Typography>
    </>
  );
}

function SummaryMiniMap({
  activeNewsSiteName,
  highlightedSiteNames,
  isLightMode = false,
  selectedSiteName,
}: {
  activeNewsSiteName?: string | null;
  highlightedSiteNames?: string[];
  isLightMode?: boolean;
  selectedSiteName: string | null;
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 160,
        borderRadius: 2.6,
        overflow: 'hidden',
        bgcolor: isLightMode ? '#FFFFFF' : 'rgba(9,18,37,0.88)',
        border: isLightMode ? '1px solid #E2E8F0' : '1px solid rgba(119,151,190,0.2)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("/images/world-map.png")',
          backgroundSize: '110%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: isLightMode ? 'opacity(0.12)' : 'opacity(0.4)',
        }}
      />
      {liveContextSites.map((site) => {
        const tone = siteToneStyles[site.tone];
        const isSelected = selectedSiteName === site.name;
        const isActiveNewsSite = activeNewsSiteName === site.name;
        const isHighlightedNewsSite = highlightedSiteNames?.includes(site.name) ?? false;
        return (
          <Box
            key={site.name}
            sx={{
              position: 'absolute',
              left: site.left,
              top: site.top,
              transform: 'translate(-50%, -50%)',
              width: isSelected || isActiveNewsSite ? 20 : 16,
              height: isSelected || isActiveNewsSite ? 20 : 16,
              borderRadius: '50%',
              bgcolor: tone.text,
              border: isLightMode ? '3px solid #FFFFFF' : '2px solid #000000',
              boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
              transition: 'all 0.35s ease',
              animation: isActiveNewsSite
                ? 'railNewsSitePulse 2.8s ease-in-out infinite'
                : isHighlightedNewsSite
                  ? 'railNewsSiteSoftPulse 3.8s ease-in-out infinite'
                  : 'none',
              '@keyframes railNewsSitePulse': {
                '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)' },
                '50%': { transform: 'translate(-50%, -50%) scale(1.35)' },
              },
              '@keyframes railNewsSiteSoftPulse': {
                '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)' },
                '50%': { transform: 'translate(-50%, -50%) scale(1.15)' },
              },
            }}
          />
        );
      })}
    </Box>
  );
}

function SiteBrowserOverview({
  briefIndex,
  lightMode,
  mode,
  onOpenGlobalView,
  onSelectMode,
  onSelectSite,
  selectedSiteName,
  isSidebarMode = false,
}: {
  briefIndex: number;
  lightMode: boolean;
  mode: SiteVisualizationMode;
  onOpenGlobalView?: () => void;
  onSelectMode: (mode: SiteVisualizationMode) => void;
  onSelectSite: (selection: SiteSelection) => void;
  selectedSiteName: string | null;
  isSidebarMode?: boolean;
}) {
  const activeBrief = globalViewNewsHighlights[briefIndex % globalViewNewsHighlights.length];
  const activeBriefSiteName = liveContextSites.some((site) => site.name === activeBrief.siteName)
    ? activeBrief.siteName
    : null;
  const highlightedNewsSiteNames = globalViewNewsHighlights.map((item) => item.siteName);
  const visibleOverviewSites = liveContextSites.slice(0, 5);

  const innerContent = (
    <Box sx={{display: 'grid', gap: 1, minHeight: 0, overflowY: 'auto', pr: 0.2}}>
      <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.8}}>
        {/* Avg. Site Health Card */}
        <Box
          sx={{
            p: 1.1,
            pl: 1.5,
            borderRadius: 2.2,
            bgcolor: lightMode ? '#FFFFFF' : 'rgba(17,28,50,0.92)',
            border: lightMode ? '1px solid #E2E8F0' : '1px solid rgba(119,151,190,0.18)',
            borderLeft: '4px solid #22C55E',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography sx={{fontSize: 10.5, color: lightMode ? '#64748B' : '#A9BAD1', fontWeight: 700, lineHeight: 1.1}}>Avg. Site Health</Typography>
            <Typography sx={{fontSize: 22, color: lightMode ? '#0F172A' : '#F8FAFC', fontWeight: 900, mt: 0.3, lineHeight: 1}}>
              86<Box component="span" sx={{fontSize: 14, fontWeight: 700, verticalAlign: 'super', ml: 0.1}}>%</Box>
            </Typography>
          </Box>
          <Box sx={{px: 0.6, py: 0.2, borderRadius: 1, bgcolor: lightMode ? '#DCFCE7' : 'rgba(34,197,94,0.15)', color: '#22C55E', fontSize: 9.5, fontWeight: 900, textAlign: 'center'}}>
            +5%
          </Box>
        </Box>

        {/* Critical Alerts Card */}
        <Box
          sx={{
            p: 1.1,
            pl: 1.5,
            borderRadius: 2.2,
            bgcolor: lightMode ? '#FFFFFF' : 'rgba(17,28,50,0.92)',
            border: lightMode ? '1px solid #E2E8F0' : '1px solid rgba(119,151,190,0.18)',
            borderLeft: '4px solid #EF4444',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography sx={{fontSize: 10.5, color: '#EF4444', fontWeight: 700, lineHeight: 1.1}}>Critical Alerts</Typography>
            <Typography sx={{fontSize: 22, color: '#EF4444', fontWeight: 900, mt: 0.3, lineHeight: 1}}>
              7
            </Typography>
          </Box>
          <Box sx={{px: 0.6, py: 0.2, borderRadius: 1, bgcolor: lightMode ? '#FEE2E2' : 'rgba(239,68,68,0.15)', color: '#EF4444', fontSize: 9.5, fontWeight: 900, textAlign: 'center'}}>
            +2
          </Box>
        </Box>
      </Box>

      <SummaryMiniMap
        activeNewsSiteName={activeBriefSiteName}
        highlightedSiteNames={highlightedNewsSiteNames}
        isLightMode={lightMode}
        selectedSiteName={selectedSiteName ?? activeBriefSiteName}
      />

      <Box sx={{ display: 'grid', gap: 0.85 }}>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.75}}>
          <Typography variant="caption" sx={{ color: lightMode ? '#626465' : '#94A3B8', fontWeight: 800 }}>
            Site News
          </Typography>
          <Box sx={{display: 'inline-flex', alignItems: 'center', gap: 0.45}}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: '#4ADE80',
                boxShadow: '0 0 0 0 rgba(74,222,128,0.4)',
                animation: 'railSiteNewsPulse 1.8s ease-in-out infinite',
                '@keyframes railSiteNewsPulse': {
                  '0%': { boxShadow: '0 0 0 0 rgba(74,222,128,0.4)' },
                  '70%': { boxShadow: '0 0 0 7px rgba(74,222,128,0)' },
                  '100%': { boxShadow: '0 0 0 0 rgba(74,222,128,0)' },
                },
              }}
            />
            <Typography sx={{fontSize: 10.4, color: '#94A3B8', fontWeight: 700}}>Live network feed</Typography>
          </Box>
        </Box>
        <Box
          key={activeBrief.siteName}
          sx={{
            p: 0.78,
            borderRadius: 1.8,
            bgcolor: lightMode ? '#FFFFFF' : 'rgba(10,19,35,0.78)',
            border: lightMode ? '1px solid #E5EDF7' : '1px solid rgba(119,151,190,0.14)',
            minHeight: 124,
            display: 'grid',
            alignContent: 'start',
            animation: 'railBriefSwap 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
            '@keyframes railBriefSwap': {
              '0%': {
                opacity: 0,
                transform: 'translateY(8px)',
                filter: 'blur(2px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)',
                filter: 'blur(0)',
              },
            },
          }}
        >
          <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.35}}>
            <Typography sx={{fontSize: 11.6, color: activeBrief.tone, fontWeight: 900}}>{activeBrief.siteName}</Typography>
            <Typography sx={{fontSize: 10.2, color: '#94A3B8', fontWeight: 700}}>{activeBrief.timeLabel}</Typography>
          </Box>
          <Typography sx={{fontSize: 11.05, color: lightMode ? '#0F172A' : '#F8FAFC', fontWeight: 800, lineHeight: 1.32}}>
            {activeBrief.headline}
          </Typography>
          <Typography sx={{fontSize: 10.45, color: lightMode ? '#64748B' : '#BFD0E4', lineHeight: 1.38, mt: 0.25}}>
            {activeBrief.summary}
          </Typography>
          <Box sx={{display: 'flex', gap: 0.45, mt: 0.8}}>
            {globalViewNewsHighlights.map((item, index) => (
              <Box
                key={item.siteName}
                sx={{
                  width: index === briefIndex % globalViewNewsHighlights.length ? 18 : 6,
                  height: 6,
                  borderRadius: 999,
                  bgcolor: index === briefIndex % globalViewNewsHighlights.length ? item.tone : (lightMode ? '#CBD5E1' : '#47627F'),
                  transition: 'all 0.25s ease',
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      <Box sx={{display: 'flex', gap: 0.65}}>
      {([
        {id: 'sites', label: 'Sites'},
        {id: 'hierarchy', label: 'Navigation Hierarchy'},
      ] as const).map((option) => (
        <Button
          key={option.id}
          onClick={() => onSelectMode(option.id)}
          variant="outlined"
          sx={{
            flex: option.id === 'hierarchy' ? 1.35 : 1,
            height: 34,
            borderRadius: 999,
            textTransform: 'none',
            fontWeight: 800,
            borderColor: mode === option.id ? (lightMode ? '#93C5FD' : 'rgba(88,163,255,0.64)') : (lightMode ? '#D7E3F4' : 'rgba(119,151,190,0.22)'),
            bgcolor: mode === option.id ? (lightMode ? '#EAF1FF' : 'rgba(37,99,235,0.16)') : (lightMode ? '#FFFFFF' : 'rgba(17,28,50,0.82)'),
            color: mode === option.id ? (lightMode ? '#1D4ED8' : '#E8F1FF') : (lightMode ? '#64748B' : '#AFC0D7'),
          }}
        >
          {option.label}
        </Button>
      ))}
      </Box>

      {mode === 'sites' ? (
        <Box sx={{display: 'grid', gap: 0.55}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0.15}}>
          <Typography variant="caption" sx={{ color: lightMode ? '#626465' : '#94A3B8', fontWeight: 800 }}>Sites ({visibleOverviewSites.length})</Typography>
          <Typography sx={{fontSize: 10.5, color: '#8FA6C2', fontWeight: 700}}>Health</Typography>
        </Box>
        {visibleOverviewSites.map((site) => {
          const tone = siteToneStyles[site.tone];
          return (
            <Button
              key={site.name}
              onClick={() => onSelectSite({
                path: ['Global', site.name],
                scopeLabel: 'Site',
                siteName: site.name,
                type: 'site',
              })}
              variant="outlined"
              sx={{
                justifyContent: 'space-between',
                px: 1.1,
                py: 0.9,
                borderRadius: 2.2,
                textTransform: 'none',
                borderColor: selectedSiteName === site.name ? tone.border : (lightMode ? '#E2E8F0' : 'rgba(119,151,190,0.18)'),
                bgcolor: selectedSiteName === site.name ? (lightMode ? '#EAF1FF' : 'rgba(29,116,255,0.18)') : (lightMode ? '#FFFFFF' : 'rgba(17,28,50,0.82)'),
                boxShadow: selectedSiteName === site.name ? `0 0 0 1px ${tone.border}, 0 0 18px ${tone.glow}` : 'none',
                color: lightMode ? '#334155' : '#E2E8F0',
                '&:hover': {
                  borderColor: tone.border,
                  bgcolor: lightMode ? '#F8FBFF' : 'rgba(30,41,59,0.96)',
                },
              }}
            >
              <Box component="span" sx={{display: 'grid', gridTemplateColumns: '16px minmax(0, 1fr)', gap: 0.8, alignItems: 'center', minWidth: 0, textAlign: 'left'}}>
                <Box component="span" sx={{width: 14, height: 14, borderRadius: '50%', bgcolor: tone.text, boxShadow: `0 0 12px ${tone.glow}`}} />
                <Box component="span" sx={{minWidth: 0}}>
                  <Typography component="span" sx={{display: 'block', fontSize: 13.2, color: lightMode ? '#0F172A' : '#F8FAFC', fontWeight: 800, lineHeight: 1.15}}>
                    {site.name}
                  </Typography>
                  <Typography component="span" sx={{display: 'block', fontSize: 10.8, color: '#8FA6C2', mt: 0.25}}>
                    {site.location}
                  </Typography>
                  <Box component="span" sx={{display: 'flex', alignItems: 'center', gap: 0.45, mt: 0.45, flexWrap: 'wrap'}}>
                    <Box component="span" sx={{px: 0.7, py: 0.18, borderRadius: 999, bgcolor: tone.soft, color: tone.text, fontSize: 10, fontWeight: 900}}>
                      {tone.label}
                    </Box>
                    <Typography component="span" sx={{fontSize: 10.4, color: lightMode ? '#64748B' : '#BFD0E4', fontWeight: 700}}>
                      OEE {site.oee}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box component="span" sx={{display: 'grid', justifyItems: 'end', gap: 0.25}}>
                <Typography component="span" sx={{fontSize: 15, color: tone.text, fontWeight: 900}}>
                  {site.health}%
                </Typography>
                <Typography component="span" sx={{fontSize: 10.4, color: '#8FA6C2', fontWeight: 700}}>
                  Health
                </Typography>
              </Box>
            </Button>
          );
        })}
        <Typography sx={{fontSize: 11, color: '#58A3FF', fontWeight: 800, mt: 0.35}}>View all sites</Typography>
        </Box>
      ) : null}
    </Box>
  );

  if (isSidebarMode) {
    return innerContent;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        ...railPanelShellSx,
        p: 1.2,
        borderRadius: 3,
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        ...(lightMode ? {
          bgcolor: '#F8FBFF',
          border: '1px solid #D7E3F4',
          boxShadow: '0 18px 38px rgba(15,23,42,0.07)',
          '&::before': {border: '1px solid rgba(255,255,255,0.78)'},
          '&::after': {opacity: 0.35},
        } : {}),
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1}}>
        <Box>
          <Typography sx={{fontSize: 12, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', color: lightMode ? '#1E3A8A' : '#E2E8F0'}}>
            Global View
          </Typography>
          <Typography sx={{fontSize: 11, color: lightMode ? '#64748B' : '#8FA6C2', mt: 0.3}}>Company Landscape</Typography>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
          <Typography sx={{fontSize: 10.5, color: '#94A3B8'}}>Live context</Typography>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#4ADE80',
              boxShadow: '0 0 0 0 rgba(74,222,128,0.45)',
              animation: 'railRefreshPulse 1.8s ease-in-out infinite',
              '@keyframes railRefreshPulse': {
                '0%': {boxShadow: '0 0 0 0 rgba(74,222,128,0.45)'},
                '70%': {boxShadow: '0 0 0 10px rgba(74,222,128,0)'},
                '100%': {boxShadow: '0 0 0 0 rgba(74,222,128,0)'},
              },
            }}
          />
          {onOpenGlobalView ? (
            <Button
              variant="outlined"
              size="small"
              onClick={onOpenGlobalView}
              sx={{
                minWidth: 0,
                px: 1.15,
                py: 0.5,
                ml: 0.35,
                borderColor: lightMode ? '#BFDBFE' : 'rgba(96,165,250,0.38)',
                color: lightMode ? '#1D4ED8' : '#E8F1FF',
                fontWeight: 800,
                borderRadius: 999,
                textTransform: 'none',
                bgcolor: lightMode ? '#FFFFFF' : 'rgba(17,28,50,0.82)',
              }}
            >
              Open Global View
            </Button>
          ) : null}
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          ...railInnerCardSx,
          p: 1.05,
          borderRadius: 2.5,
          ...(lightMode ? {bgcolor: '#FFFFFF', border: '1px solid #D7E3F4'} : {}),
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {innerContent}
      </Paper>
    </Paper>
  );
}

function HierarchyBrowser({
  expandedIds,
  lightMode,
  onSelectSite,
  onToggleNode,
  isSidebarMode = false,
}: {
  expandedIds: string[];
  lightMode: boolean;
  onSelectSite: (selection: SiteSelection) => void;
  onToggleNode: (nodeId: string) => void;
  isSidebarMode?: boolean;
}) {
  const renderNodes = (nodes: SiteHierarchyNode[], depth = 0, lineage: string[] = []) => nodes.map((node) => {
    const hasChildren = Boolean(node.children?.length);
    const isExpanded = expandedIds.includes(node.id);
    const Icon =
      node.kind === 'root'
        ? SiteIcon
        : node.kind === 'site'
          ? SiteIcon
          : node.kind === 'department'
            ? DepartmentIcon
            : node.kind === 'cell'
              ? CellIcon
              : LineIcon;

    const nextLineage = [...lineage, node.label];

    const handleClick = () => {
      if (hasChildren) {
        onToggleNode(node.id);
        return;
      }

      if (node.siteName) {
        onSelectSite({
          path: nextLineage,
          scopeLabel:
            node.kind === 'site'
              ? 'Site'
              : node.kind === 'department'
                ? 'Department'
                : node.kind === 'cell'
                  ? 'Cell'
                  : 'Line',
          siteName: node.siteName,
          type:
            node.kind === 'site'
              ? 'site'
              : node.kind === 'department'
                ? 'department'
                : node.kind === 'cell'
                  ? 'cell'
                  : 'line',
        });
      }
    };

    return (
      <Box key={node.id}>
        <Button
          variant="text"
          onClick={handleClick}
          sx={{
            width: '100%',
            justifyContent: 'space-between',
            textTransform: 'none',
            color: lightMode ? '#334155' : '#E2E8F0',
            borderRadius: 2,
            px: 0.7,
            py: 0.55,
            pl: `${0.7 + depth * 1.05}rem`,
            bgcolor: node.kind === 'line' ? (lightMode ? '#F8FAFC' : 'rgba(17,28,50,0.68)') : 'transparent',
            '&:hover': {
              bgcolor: lightMode ? '#EFF6FF' : 'rgba(30,41,59,0.84)',
            },
          }}
        >
          <Box component="span" sx={{display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0}}>
            <Box component="span" sx={{width: 18, height: 18, borderRadius: '50%', border: lightMode ? '1px solid #CBD5E1' : '1px solid rgba(119,151,190,0.3)', color: lightMode ? '#64748B' : '#BFD0E4', display: 'grid', placeItems: 'center', bgcolor: lightMode ? '#FFFFFF' : 'rgba(17,28,50,0.78)'}}>
              <Icon sx={{fontSize: 12}} />
            </Box>
            <Typography component="span" sx={{fontSize: 12.4, fontWeight: node.kind === 'line' ? 800 : 700, color: lightMode ? '#334155' : '#E2E8F0'}}>
              {node.label}
            </Typography>
          </Box>
          {hasChildren ? (
            isExpanded ? <ExpandMoreIcon sx={{fontSize: 18, color: '#8FA6C2'}} /> : <ChevronRightIcon sx={{fontSize: 18, color: '#8FA6C2'}} />
          ) : (
            <ChevronRightIcon sx={{fontSize: 18, color: lightMode ? '#94A3B8' : '#47627F'}} />
          )}
        </Button>
        {hasChildren && isExpanded ? <Box sx={{display: 'grid', gap: 0.2}}>{renderNodes(node.children ?? [], depth + 1, nextLineage)}</Box> : null}
      </Box>
    );
  });

  const innerContent = (
    <>
      <Typography variant="caption" sx={{ color: lightMode ? '#626465' : '#94A3B8', fontWeight: 800, mb: 0.75, display: 'block' }}>Navigation Hierarchy</Typography>
      <Box sx={{display: 'grid', gap: 0.25}}>
        {renderNodes(liveContextHierarchy)}
      </Box>
    </>
  );

  if (isSidebarMode) {
    return (
      <Box sx={{mt: 1.05, px: 0.2}}>
        {innerContent}
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        ...railInnerCardSx,
        p: 1.05,
        borderRadius: 2.5,
        mt: 1.05,
        ...(lightMode ? {bgcolor: '#FFFFFF', border: '1px solid #D7E3F4'} : {}),
      }}
    >
      {innerContent}
    </Paper>
  );
}

export default function LiveContextRail({
  onClearSiteContext,
  onOpenSiteView,
  onOpenQualityAlert,
  onOpenTier1NcWorkflow,
  onSelectSiteContext,
  onSendPrompt,
  themeMode = 'dark',
  isSidebarMode = false,
}: LiveContextRailProps) {
  const [briefTick, setBriefTick] = useState(0);
  const [expandedHierarchyIds, setExpandedHierarchyIds] = useState<string[]>(defaultExpandedHierarchyIds);
  const [liveTick, setLiveTick] = useState(0);
  const [selectedSiteSelection, setSelectedSiteSelection] = useState<SiteSelection | null>(null);
  const [visualizationMode, setVisualizationMode] = useState<SiteVisualizationMode>('sites');
  const isLightMode = themeMode === 'light';

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setLiveTick((prev) => (prev + 1) % 4);
    }, 2600);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setBriefTick((prev) => (prev + 1) % globalViewNewsHighlights.length);
    }, 11000);

    return () => window.clearInterval(intervalId);
  }, []);

  const selectedSite = liveContextSites.find((site) => site.name === selectedSiteSelection?.siteName) ?? liveContextSites[0];
  const selectedSiteTone = siteToneStyles[selectedSite.tone];
  const activeSiteContext = {
    criticalAlerts: selectedSite.criticalAlerts,
    linesBelowTarget: selectedSite.linesBelowTarget,
    oee: selectedSite.oee,
    prompt: `Give me a site snapshot for ${selectedSite.name} and tell me the biggest operational risks right now.`,
    site: selectedSite.name,
    siteHealth: selectedSite.health,
  };

  const liveSignalValues = {
    quality: {
      chartSeries: [
        [4.8, 7.1, 8.2],
        [5.2, 6.8, 8.7],
        [4.5, 7.4, 8.0],
        [5.0, 7.0, 8.5],
      ][liveTick],
      delta: [18, 22, 16, 19][liveTick],
      openCount: [2, 3, 2, 2][liveTick],
    },
    delivery: {
      chartSeries: [
        [68, 55, 66, 60, 54],
        [70, 58, 63, 61, 57],
        [66, 53, 65, 59, 55],
        [69, 56, 67, 62, 56],
      ][liveTick],
      value: [88, 90, 87, 89][liveTick],
      driftLabel: [
        'Line 4 still dragging recovery',
        'Packaging is closing the gap',
        'Cartoner pace slipped again',
        'Recovery lane is stabilizing',
      ][liveTick],
      deltaPoints: [2.4, 1.1, 2.8, 1.7][liveTick],
    },
    safety: {
      chartSeries: [
        [4, 5, 8, 22, 8, 12, 5],
        [4, 6, 8, 19, 9, 11, 6],
        [5, 5, 9, 21, 8, 10, 5],
        [4, 6, 8, 20, 9, 12, 6],
      ][liveTick],
      nearMisses: [1, 1, 2, 1][liveTick],
      coachingChecks: [2, 3, 2, 4][liveTick],
      watchLabel: [
        'Forklift zone watch is live',
        'Barrier checks are underway',
        'Operator coaching was reopened',
        'Safety walk closed one concern',
      ][liveTick],
    },
    people: {
      chartSeries: [
        [1.2, 2.4, 1.6],
        [1.5, 2.7, 1.9],
        [1.1, 2.3, 1.5],
        [1.4, 2.5, 1.8],
      ][liveTick],
      coverageGap: [1, 1, 2, 1][liveTick],
      openSwaps: [2, 1, 2, 1][liveTick],
      watchLabel: [
        'Packaging backup should be confirmed by 15:00',
        'One shift swap is ready to approve',
        'Press cell overlap still needs backfill',
        'Flex coverage can absorb the absence',
      ][liveTick],
    },
    maintenance: {
      chartSeries: [
        [2.4, 3.25, 1.9],
        [2.9, 3.5, 2.2],
        [2.2, 3.1, 1.8],
        [2.7, 3.35, 2.0],
      ][liveTick],
      criticalAssets: [3, 4, 3, 2][liveTick],
      dueToday: [1, 2, 1, 1][liveTick],
      watchLabel: [
        '1 work order due this shift',
        '2 assets waiting verification',
        'Tier 2 support requested',
        'Lubrication follow-up queued',
      ][liveTick],
    },
  } as const;

  const visibleOperationalSignals = operationalSignals.filter((signal) => (
    signal.id === 'quality'
    || signal.id === 'delivery'
    || signal.id === 'maintenance'
    || (liveTick % 2 === 0 ? signal.id === 'people' : signal.id === 'safety')
  ));

  const openSelection = (selection: SiteSelection) => {
    setSelectedSiteSelection(selection);
    onSelectSiteContext?.({
      path: selection.path,
      scopeLabel: selection.scopeLabel,
      siteName: selection.siteName,
    });
  };

  const toggleHierarchyNode = (nodeId: string) => {
    setExpandedHierarchyIds((currentIds) => (
      currentIds.includes(nodeId)
        ? currentIds.filter((id) => id !== nodeId)
        : [...currentIds, nodeId]
    ));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.85,
        minWidth: 0,
        ...(!isSidebarMode ? {
          gridColumn: {xs: '1 / -1', lg: '3 / 4'},
          order: {xs: 3, lg: 3},
          mt: {xs: 0, md: 8.25},
          height: {xs: 'auto', md: 'calc(100% - 66px)'},
          minHeight: 0,
        } : {
          width: '100%',
        }),
        ...(isLightMode ? {
          '--rail-title': '#1E3A8A',
          '--rail-muted': '#64748B',
          '--rail-card-bg': '#FFFFFF',
          '--rail-card-border': '#D7E3F4',
          '--rail-shell-bg': '#F8FBFF',
        } : {}),
      }}
    >
      {selectedSiteSelection ? (
        <>
          {isSidebarMode ? (
            <Box sx={{display: 'grid', gap: 1.05}}>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5}}>
              <Box sx={{display: 'grid', gap: 0.35}}>
                <Typography sx={{fontSize: 12, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', color: isLightMode ? '#1E3A8A' : '#E2E8F0'}}>
                  Live Site Context
                </Typography>
                <Typography sx={{fontSize: 10.8, color: isLightMode ? '#64748B' : '#8FA6C2'}}>
                  {selectedSiteSelection.path.join(' / ')}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<BackIcon sx={{fontSize: 16}} />}
                onClick={() => {
                  setSelectedSiteSelection(null);
                  onClearSiteContext?.();
                }}
                sx={{
                  minWidth: 0,
                  px: 1.15,
                  py: 0.55,
                  borderColor: isLightMode ? '#BFDBFE' : 'rgba(96,165,250,0.38)',
                  color: isLightMode ? '#1D4ED8' : '#F8FBFF',
                  fontWeight: 800,
                  borderRadius: 999,
                  textTransform: 'none',
                  background: isLightMode ? '#FFFFFF' : 'linear-gradient(180deg, rgba(19,41,78,0.96) 0%, rgba(11,24,45,0.96) 100%)',
                  boxShadow: isLightMode ? '0 8px 18px rgba(15,23,42,0.06)' : '0 10px 22px rgba(2,6,23,0.18), inset 0 1px 0 rgba(255,255,255,0.08)',
                  '&:hover': {
                    borderColor: 'rgba(125,211,252,0.58)',
                    bgcolor: isLightMode ? '#F8FBFF' : 'rgba(20,44,85,0.98)',
                  },
                }}
              >
                Back
              </Button>
            </Box>

            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.9}}>
                <Box sx={{width: 34, height: 34, borderRadius: 2, bgcolor: selectedSiteTone.soft, display: 'grid', placeItems: 'center', color: selectedSiteTone.text}}>
                  <SiteIcon sx={{fontSize: 18}} />
                </Box>
                <Box>
                  <Typography sx={{fontSize: 14, fontWeight: 800, color: isLightMode ? '#0F172A' : '#F8FAFC'}}>{activeSiteContext.site}</Typography>
                  <Typography sx={{fontSize: 11, color: '#94A3B8'}}>
                    {selectedSiteSelection.scopeLabel} - {selectedSite.location}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{display: 'grid', gridTemplateColumns: '132px minmax(0, 1fr)', gap: 1.15, mt: 0.5, alignItems: 'center'}}>
              <HealthArc isLightMode={isLightMode} oee={activeSiteContext.oee} value={activeSiteContext.siteHealth} />
              <Box sx={{display: 'grid', gap: 0.7}}>
                <Paper
                  elevation={0}
                  onClick={() => onSendPrompt(`Show me the critical alerts behind ${activeSiteContext.site} and who owns them.`)}
                  sx={{
                    p: 1,
                    borderRadius: 2.1,
                    bgcolor: isLightMode ? '#FFFFFF' : 'rgba(13,21,38,0.94)',
                    border: '1px solid rgba(239,68,68,0.24)',
                    cursor: 'pointer',
                    boxShadow: isLightMode ? '0 8px 18px rgba(15,23,42,0.05)' : 'inset 0 1px 0 rgba(255,255,255,0.03)',
                  }}
                >
                  <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8}}>
                      <Box sx={{width: 28, height: 28, borderRadius: 1.5, display: 'grid', placeItems: 'center', bgcolor: 'rgba(239,68,68,0.12)', color: '#F87171'}}>
                        <EscalateIcon sx={{fontSize: 17}} />
                      </Box>
                      <Typography sx={{fontSize: 13, color: isLightMode ? '#334155' : '#E5E7EB', fontWeight: 700}}>
                        <Box component="span" sx={{fontSize: 26, color: '#EF4444', fontWeight: 900, mr: 0.7}}>
                          {activeSiteContext.criticalAlerts}
                        </Box>
                        Critical Alerts
                      </Typography>
                    </Box>
                    <Typography sx={{fontSize: 11, color: '#2563EB', fontWeight: 700, textDecoration: 'underline'}}>
                      View all
                    </Typography>
                  </Box>
                </Paper>

                <Paper
                  elevation={0}
                  onClick={() => onSendPrompt(`Which lines are below target in ${activeSiteContext.site} and what is pushing them off plan today?`)}
                  sx={{
                    p: 1,
                    borderRadius: 2.1,
                    bgcolor: isLightMode ? '#FFFFFF' : 'rgba(13,21,38,0.94)',
                    border: '1px solid rgba(245,158,11,0.24)',
                    cursor: 'pointer',
                    boxShadow: isLightMode ? '0 8px 18px rgba(15,23,42,0.05)' : 'inset 0 1px 0 rgba(255,255,255,0.03)',
                  }}
                >
                  <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8}}>
                      <Box sx={{width: 28, height: 28, borderRadius: 1.5, display: 'grid', placeItems: 'center', bgcolor: 'rgba(245,158,11,0.12)', color: '#F59E0B'}}>
                        <DeliveryIcon sx={{fontSize: 17}} />
                      </Box>
                      <Typography sx={{fontSize: 13, color: isLightMode ? '#334155' : '#E5E7EB', fontWeight: 700}}>
                        <Box component="span" sx={{fontSize: 26, color: '#F59E0B', fontWeight: 900, mr: 0.7}}>
                          {activeSiteContext.linesBelowTarget}
                        </Box>
                        Lines Below Target
                      </Typography>
                    </Box>
                    <Typography sx={{fontSize: 11, color: '#2563EB', fontWeight: 700, textDecoration: 'underline'}}>
                      View details
                    </Typography>
                  </Box>
                </Paper>

                <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 0.6}}>
                  {[
                    {label: 'OEE', value: `${selectedSite.oee}%`, color: selectedSiteTone.text},
                    {label: 'Departments', value: selectedSite.departments},
                    {label: 'Cells', value: selectedSite.cells},
                    {label: 'Lines', value: selectedSite.lineCount},
                  ].map((item) => (
                    <Box key={item.label} sx={{p: 0.75, borderRadius: 1.9, bgcolor: isLightMode ? '#F8FAFC' : 'rgba(17,28,50,0.78)', border: isLightMode ? '1px solid #E2E8F0' : '1px solid rgba(119,151,190,0.16)'}}>
                      <Typography sx={{fontSize: 10.4, color: '#8FA6C2', fontWeight: 700}}>{item.label}</Typography>
                      <Typography sx={{fontSize: 16, color: 'color' in item && item.color ? item.color : (isLightMode ? '#0F172A' : '#F8FAFC'), fontWeight: 900, mt: 0.25}}>{item.value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        ) : (
          <Paper
            elevation={0}
            sx={{
              ...railPanelShellSx,
              p: 1.2,
              borderRadius: 3,
              ...(isLightMode ? {
                bgcolor: '#F8FBFF',
                border: '1px solid #D7E3F4',
                boxShadow: '0 18px 38px rgba(15,23,42,0.07)',
                '&::before': {border: '1px solid rgba(255,255,255,0.78)'},
              } : {}),
            }}
          >
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1}}>
              <Box sx={{display: 'grid', gap: 0.35}}>
                <Typography sx={{fontSize: 12, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', color: isLightMode ? '#1E3A8A' : '#E2E8F0'}}>
                  Live Site Context
                </Typography>
                <Typography sx={{fontSize: 10.8, color: isLightMode ? '#64748B' : '#8FA6C2'}}>
                  {selectedSiteSelection.path.join(' / ')}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<BackIcon sx={{fontSize: 16}} />}
                onClick={() => {
                  setSelectedSiteSelection(null);
                  onClearSiteContext?.();
                }}
                sx={{
                  minWidth: 0,
                  px: 1.15,
                  py: 0.55,
                  borderColor: isLightMode ? '#BFDBFE' : 'rgba(96,165,250,0.38)',
                  color: isLightMode ? '#1D4ED8' : '#F8FBFF',
                  fontWeight: 800,
                  borderRadius: 999,
                  textTransform: 'none',
                  background: isLightMode ? '#FFFFFF' : 'linear-gradient(180deg, rgba(19,41,78,0.96) 0%, rgba(11,24,45,0.96) 100%)',
                  boxShadow: isLightMode ? '0 8px 18px rgba(15,23,42,0.06)' : '0 10px 22px rgba(2,6,23,0.18), inset 0 1px 0 rgba(255,255,255,0.08)',
                  '&:hover': {
                    borderColor: 'rgba(125,211,252,0.58)',
                    bgcolor: isLightMode ? '#F8FBFF' : 'rgba(20,44,85,0.98)',
                  },
                }}
              >
                Back
              </Button>
            </Box>
            <Paper elevation={0} sx={{...railInnerCardSx, p: 1.05, borderRadius: 2.4, ...(isLightMode ? {bgcolor: '#FFFFFF', border: '1px solid #D7E3F4'} : {})}}>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.9}}>
                  <Box sx={{width: 34, height: 34, borderRadius: 2, bgcolor: selectedSiteTone.soft, display: 'grid', placeItems: 'center', color: selectedSiteTone.text}}>
                    <SiteIcon sx={{fontSize: 18}} />
                  </Box>
                  <Box>
                    <Typography sx={{fontSize: 14, fontWeight: 800, color: isLightMode ? '#0F172A' : '#F8FAFC'}}>{activeSiteContext.site}</Typography>
                    <Typography sx={{fontSize: 11, color: '#94A3B8'}}>
                      {selectedSiteSelection.scopeLabel} - {selectedSite.location}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{display: 'grid', gridTemplateColumns: '132px minmax(0, 1fr)', gap: 1.15, mt: 1.1, alignItems: 'center'}}>
                <HealthArc isLightMode={isLightMode} oee={activeSiteContext.oee} value={activeSiteContext.siteHealth} />
                <Box sx={{display: 'grid', gap: 0.7}}>
                  <Paper
                    elevation={0}
                    onClick={() => onSendPrompt(`Show me the critical alerts behind ${activeSiteContext.site} and who owns them.`)}
                    sx={{
                      p: 1,
                      borderRadius: 2.1,
                      bgcolor: isLightMode ? '#FFFFFF' : 'rgba(13,21,38,0.94)',
                      border: '1px solid rgba(239,68,68,0.24)',
                      cursor: 'pointer',
                      boxShadow: isLightMode ? '0 8px 18px rgba(15,23,42,0.05)' : 'inset 0 1px 0 rgba(255,255,255,0.03)',
                    }}
                  >
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8}}>
                        <Box sx={{width: 28, height: 28, borderRadius: 1.5, display: 'grid', placeItems: 'center', bgcolor: 'rgba(239,68,68,0.12)', color: '#F87171'}}>
                          <EscalateIcon sx={{fontSize: 17}} />
                        </Box>
                        <Typography sx={{fontSize: 13, color: isLightMode ? '#334155' : '#E5E7EB', fontWeight: 700}}>
                          <Box component="span" sx={{fontSize: 26, color: '#EF4444', fontWeight: 900, mr: 0.7}}>
                            {activeSiteContext.criticalAlerts}
                          </Box>
                          Critical Alerts
                        </Typography>
                      </Box>
                      <Typography sx={{fontSize: 11, color: '#2563EB', fontWeight: 700, textDecoration: 'underline'}}>
                        View all
                      </Typography>
                    </Box>
                  </Paper>

                  <Paper
                    elevation={0}
                    onClick={() => onSendPrompt(`Which lines are below target in ${activeSiteContext.site} and what is pushing them off plan today?`)}
                    sx={{
                      p: 1,
                      borderRadius: 2.1,
                      bgcolor: isLightMode ? '#FFFFFF' : 'rgba(13,21,38,0.94)',
                      border: '1px solid rgba(245,158,11,0.24)',
                      cursor: 'pointer',
                      boxShadow: isLightMode ? '0 8px 18px rgba(15,23,42,0.05)' : 'inset 0 1px 0 rgba(255,255,255,0.03)',
                    }}
                  >
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8}}>
                        <Box sx={{width: 28, height: 28, borderRadius: 1.5, display: 'grid', placeItems: 'center', bgcolor: 'rgba(245,158,11,0.12)', color: '#F59E0B'}}>
                          <DeliveryIcon sx={{fontSize: 17}} />
                        </Box>
                        <Typography sx={{fontSize: 13, color: isLightMode ? '#334155' : '#E5E7EB', fontWeight: 700}}>
                          <Box component="span" sx={{fontSize: 26, color: '#F59E0B', fontWeight: 900, mr: 0.7}}>
                            {activeSiteContext.linesBelowTarget}
                          </Box>
                          Lines Below Target
                        </Typography>
                      </Box>
                      <Typography sx={{fontSize: 11, color: '#2563EB', fontWeight: 700, textDecoration: 'underline'}}>
                        View details
                      </Typography>
                    </Box>
                  </Paper>

                  <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 0.6}}>
                    {[
                      {label: 'OEE', value: `${selectedSite.oee}%`, color: selectedSiteTone.text},
                      {label: 'Departments', value: selectedSite.departments},
                      {label: 'Cells', value: selectedSite.cells},
                      {label: 'Lines', value: selectedSite.lineCount},
                    ].map((item) => (
                      <Box key={item.label} sx={{p: 0.75, borderRadius: 1.9, bgcolor: isLightMode ? '#F8FAFC' : 'rgba(17,28,50,0.78)', border: isLightMode ? '1px solid #E2E8F0' : '1px solid rgba(119,151,190,0.16)'}}>
                        <Typography sx={{fontSize: 10.4, color: '#8FA6C2', fontWeight: 700}}>{item.label}</Typography>
                        <Typography sx={{fontSize: 16, color: 'color' in item && item.color ? item.color : (isLightMode ? '#0F172A' : '#F8FAFC'), fontWeight: 900, mt: 0.25}}>{item.value}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Paper>
        )}

          <Paper
            elevation={0}
            onClick={() => {
              if (onOpenQualityAlert) {
                onOpenQualityAlert();
                return;
              }
              onSendPrompt(`Break down the top quality issue in ${activeSiteContext.site} and tell me what I should bring into Tier 1.`);
            }}
            sx={{
              ...railPanelShellSx,
              p: 1.15,
              borderRadius: 3,
              cursor: 'pointer',
              ...(isLightMode ? {
                bgcolor: '#F8FBFF',
                border: '1px solid #D7E3F4',
                boxShadow: '0 18px 38px rgba(15,23,42,0.07)',
                '&::before': {border: '1px solid rgba(255,255,255,0.78)'},
              } : {}),
            }}
          >
            <SectionTitle label="AI Focus (Dynamic)" />
            <Paper elevation={0} sx={{...railInnerCardSx, p: 0.95, borderRadius: 2.5, border: isLightMode ? '1px solid #FECACA' : '1px solid rgba(248,113,113,0.16)', ...(isLightMode ? {bgcolor: '#FFFFFF'} : {})}}>
              <Box sx={{position: 'relative'}}>
                <FocusQualityVisual isLightMode={isLightMode} />
              </Box>
            </Paper>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              ...railPanelShellSx,
              p: 1.15,
              borderRadius: 3,
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              ...(isLightMode ? {
                bgcolor: '#F8FBFF',
                border: '1px solid #D7E3F4',
                boxShadow: '0 18px 38px rgba(15,23,42,0.07)',
                '&::before': {border: '1px solid rgba(255,255,255,0.78)'},
              } : {}),
            }}
          >
            <SectionTitle label="Key Operational Signals" />
            <Typography sx={{fontSize: 10.5, color: isLightMode ? '#64748B' : '#8FA6C2', mb: 0.7}}>
              Quality, delivery, and maintenance stay pinned while people and safety rotate.
            </Typography>
            <Box sx={{display: 'grid', gap: 0.7, flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.15}}>
              {visibleOperationalSignals.map((signal) => {
                const Icon = signal.icon;
                const animatedSignal =
                  signal.id === 'quality'
                    ? {...signal, series: liveSignalValues.quality.chartSeries}
                    : signal.id === 'delivery'
                      ? {...signal, series: liveSignalValues.delivery.chartSeries}
                      : signal.id === 'safety'
                        ? {...signal, series: liveSignalValues.safety.chartSeries}
                        : signal.id === 'people'
                          ? {...signal, series: liveSignalValues.people.chartSeries}
                          : {...signal, series: liveSignalValues.maintenance.chartSeries};

                return (
                  <Paper
                    key={signal.id}
                    elevation={0}
                    onClick={() => {
                      if (signal.id === 'people') {
                        onSendPrompt("Can you review today's shift coverage and show me how to rebalance the team if someone is out?");
                        return;
                      }

                      onSendPrompt(`${signal.prompt} Focus on ${activeSiteContext.site}.`);
                    }}
                    sx={{
                      ...railInnerCardSx,
                      p: 1.05,
                      borderRadius: 2.4,
                      minHeight: 96,
                      ...(isLightMode ? {bgcolor: '#FFFFFF', border: '1px solid #D7E3F4'} : {}),
                      cursor: 'pointer',
                      transition: 'border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease',
                      animation: signal.id === 'quality'
                        ? 'liveSignalPulse 2.6s ease-in-out infinite'
                        : signal.id === 'delivery'
                          ? 'deliverySignalPulse 3.1s ease-in-out infinite'
                          : signal.id === 'safety'
                            ? 'safetySignalPulse 3.8s ease-in-out infinite'
                            : signal.id === 'people'
                              ? 'peopleSignalPulse 3.2s ease-in-out infinite'
                              : 'maintenanceSignalPulse 3.4s ease-in-out infinite',
                      '@keyframes liveSignalPulse': {
                        '0%, 100%': {boxShadow: 'inset 0 0 0 0 rgba(168,85,247,0.00)'},
                        '50%': {boxShadow: 'inset 0 0 0 1px rgba(168,85,247,0.16), 0 0 18px rgba(168,85,247,0.10)'},
                      },
                      '@keyframes deliverySignalPulse': {
                        '0%, 100%': {boxShadow: 'inset 0 0 0 0 rgba(56,189,248,0.00)'},
                        '50%': {boxShadow: 'inset 0 0 0 1px rgba(56,189,248,0.16), 0 0 16px rgba(56,189,248,0.08)'},
                      },
                      '@keyframes safetySignalPulse': {
                        '0%, 100%': {boxShadow: 'inset 0 0 0 0 rgba(132,204,22,0.00)'},
                        '50%': {boxShadow: 'inset 0 0 0 1px rgba(132,204,22,0.14), 0 0 14px rgba(132,204,22,0.08)'},
                      },
                      '@keyframes peopleSignalPulse': {
                        '0%, 100%': {boxShadow: 'inset 0 0 0 0 rgba(245,158,11,0.00)'},
                        '50%': {boxShadow: 'inset 0 0 0 1px rgba(245,158,11,0.16), 0 0 16px rgba(245,158,11,0.10)'},
                      },
                      '@keyframes maintenanceSignalPulse': {
                        '0%, 100%': {boxShadow: 'inset 0 0 0 0 rgba(249,115,22,0.00)'},
                        '50%': {boxShadow: 'inset 0 0 0 1px rgba(249,115,22,0.14), 0 0 16px rgba(249,115,22,0.08)'},
                      },
                      '&:hover': {borderColor: `${signal.accent}44`},
                    }}
                  >
                    <Box sx={{display: 'grid', gridTemplateColumns: '52px minmax(0, 1fr) 132px', gap: 0.9, alignItems: 'start'}}>
                      <Box
                        sx={{
                          width: 46,
                          height: 46,
                          borderRadius: 2.2,
                          bgcolor: `${signal.accent}14`,
                          color: signal.accent,
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        <Icon sx={{fontSize: signal.id === 'maintenance' ? 24 : 25}} />
                      </Box>

                      <Box sx={{minWidth: 0}}>
                        {signal.id === 'quality' ? (
                          <>
                            <Typography sx={{fontSize: 13.4, fontWeight: 800, color: isLightMode ? '#0F172A' : '#F8FAFC'}}>{signal.label}</Typography>
                            <Typography sx={{fontSize: 12, color: isLightMode ? '#475569' : '#E2E8F0', mt: 0.2}}>
                              <Box component="span" sx={{color: '#F4A7FF', fontWeight: 800, mr: 0.4}}>
                                {liveSignalValues.quality.openCount}
                              </Box>
                              NCs Open
                            </Typography>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.2, mt: 0.35, flexWrap: 'wrap'}}>
                              <UpArrowIcon sx={{fontSize: 20, color: '#F87171'}} />
                              <Typography sx={{fontSize: 15, fontWeight: 800, color: '#F87171', animation: 'qualityDeltaPulse 1.8s ease-in-out infinite', '@keyframes qualityDeltaPulse': {'0%, 100%': {opacity: 0.72}, '50%': {opacity: 1}}}}>
                                {liveSignalValues.quality.delta}%
                              </Typography>
                              <Typography sx={{fontSize: 11, color: '#94A3B8', fontWeight: 700, ml: 1}}>vs yesterday</Typography>
                            </Box>
                          </>
                        ) : signal.id === 'delivery' ? (
                          <>
                            <Typography sx={{fontSize: 13.4, fontWeight: 800, color: isLightMode ? '#0F172A' : '#F8FAFC'}}>{signal.label}</Typography>
                            <Typography sx={{fontSize: 11.6, color: isLightMode ? '#475569' : '#CBD5E1', mt: 0.15}}>Schedule Adherence</Typography>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5, flexWrap: 'wrap'}}>
                              <Typography sx={{fontSize: 17, fontWeight: 800, color: isLightMode ? '#0F172A' : '#F8FAFC'}}>{liveSignalValues.delivery.value}%</Typography>
                              <Chip
                                label="Below target"
                                size="small"
                                sx={{
                                  height: 22,
                                  bgcolor: 'rgba(245,158,11,0.12)',
                                  color: '#FBBF24',
                                  border: '1px solid rgba(245,158,11,0.28)',
                                  fontWeight: 800,
                                }}
                              />
                            </Box>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55, mt: 0.45, flexWrap: 'wrap'}}>
                              <Box sx={{width: 7, height: 7, borderRadius: '50%', bgcolor: '#38BDF8', animation: 'deliveryDotPulse 1.9s ease-in-out infinite', '@keyframes deliveryDotPulse': {'0%, 100%': {opacity: 0.45, transform: 'scale(1)'}, '50%': {opacity: 1, transform: 'scale(1.22)'}}}} />
                              <Typography sx={{fontSize: 11, color: isLightMode ? '#475569' : '#D7E8F9', fontWeight: 700}}>{liveSignalValues.delivery.driftLabel}</Typography>
                              <Typography sx={{fontSize: 10.6, color: '#7DD3FC', fontWeight: 800}}>-{liveSignalValues.delivery.deltaPoints} pts</Typography>
                            </Box>
                          </>
                        ) : signal.id === 'safety' ? (
                          <>
                            <Typography sx={{fontSize: 13.4, fontWeight: 800, color: isLightMode ? '#0F172A' : '#F8FAFC'}}>{signal.label}</Typography>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.45, flexWrap: 'wrap'}}>
                              <Typography sx={{fontSize: 12, color: '#84CC16', fontWeight: 800}}>{liveSignalValues.safety.nearMisses} Near Miss</Typography>
                              <Typography sx={{fontSize: 11, color: isLightMode ? '#475569' : '#CBD5E1', fontWeight: 700}}>Today</Typography>
                            </Box>
                            <Typography sx={{fontSize: 11, color: '#CFE7A1', mt: 0.38, fontWeight: 700}}>
                              {liveSignalValues.safety.coachingChecks} coaching checks live
                            </Typography>
                            <Typography sx={{fontSize: 10.6, color: '#94A3B8', mt: 0.2}}>
                              {liveSignalValues.safety.watchLabel}
                            </Typography>
                          </>
                        ) : signal.id === 'people' ? (
                          <>
                            <Typography sx={{fontSize: 13.4, fontWeight: 800, color: isLightMode ? '#0F172A' : '#F8FAFC'}}>{signal.label}</Typography>
                            <Typography sx={{fontSize: 12, color: isLightMode ? '#475569' : '#E2E8F0', fontWeight: 700, mt: 0.35}}>
                              <Box component="span" sx={{color: '#F59E0B', fontWeight: 800, mr: 0.4}}>
                                {liveSignalValues.people.coverageGap}
                              </Box>
                              Coverage Gap
                            </Typography>
                            <Typography sx={{fontSize: 11.2, color: '#FCD34D', mt: 0.32, fontWeight: 700}}>
                              {liveSignalValues.people.openSwaps} shift swap{liveSignalValues.people.openSwaps > 1 ? 's' : ''} open
                            </Typography>
                            <Typography sx={{fontSize: 10.6, color: isLightMode ? '#94A3B8' : '#CBD5E1', mt: 0.2}}>
                              {liveSignalValues.people.watchLabel}
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Typography sx={{fontSize: 13.4, fontWeight: 800, color: isLightMode ? '#0F172A' : '#F8FAFC'}}>{signal.label}</Typography>
                            <Typography sx={{fontSize: 12, color: isLightMode ? '#475569' : '#E2E8F0', fontWeight: 700, mt: 0.35}}>
                              <Box component="span" sx={{color: '#F97316', fontWeight: 800, mr: 0.4}}>
                                {liveSignalValues.maintenance.criticalAssets}
                              </Box>
                              Critical Assets
                            </Typography>
                            <Typography sx={{fontSize: 11.2, color: '#FDBA74', mt: 0.32, fontWeight: 700}}>
                              {liveSignalValues.maintenance.dueToday} WO due today
                            </Typography>
                            <Typography sx={{fontSize: 10.6, color: isLightMode ? '#94A3B8' : '#CBD5E1', mt: 0.2}}>{liveSignalValues.maintenance.watchLabel}</Typography>
                          </>
                        )}
                      </Box>

                      <MiniTrendChart isLightMode={isLightMode} signal={animatedSignal} />
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          </Paper>
        </>
      ) : (
        <>
          <SiteBrowserOverview
            briefIndex={briefTick}
            lightMode={isLightMode}
            mode={visualizationMode}
            onOpenGlobalView={onOpenSiteView}
            onSelectMode={setVisualizationMode}
            onSelectSite={openSelection}
            selectedSiteName={selectedSiteSelection?.siteName ?? null}
            isSidebarMode={isSidebarMode}
          />
          {visualizationMode === 'hierarchy' ? (
            <HierarchyBrowser
              expandedIds={expandedHierarchyIds}
              lightMode={isLightMode}
              onSelectSite={openSelection}
              onToggleNode={toggleHierarchyNode}
              isSidebarMode={isSidebarMode}
            />
          ) : null}
        </>
      )}

      {!isSidebarMode && (
        <Paper
          elevation={0}
          sx={{
            ...railPanelShellSx,
            p: 1.15,
            borderRadius: 3,
            ...(isLightMode ? {
              bgcolor: '#F8FBFF',
              border: '1px solid #D7E3F4',
              boxShadow: '0 18px 38px rgba(15,23,42,0.07)',
              '&::before': {border: '1px solid rgba(255,255,255,0.78)'},
            } : {}),
          }}
        >
          <Typography sx={{fontSize: 12, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', color: isLightMode ? '#1E3A8A' : '#E2E8F0', mb: 1}}>
            Quick Actions
          </Typography>
          <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.75}}>
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Button
                  key={action.label}
                  variant="outlined"
                  onClick={() => {
                    if (action.label === 'Open Tier 1 workflow' && onOpenTier1NcWorkflow) {
                      onOpenTier1NcWorkflow();
                      return;
                    }
                    onSendPrompt(action.prompt);
                  }}
                  sx={{
                    justifyContent: 'space-between',
                    px: 1.1,
                    py: 0.95,
                    borderRadius: 2,
                    borderColor: isLightMode ? '#D7E3F4' : 'rgba(148,163,184,0.18)',
                    bgcolor: isLightMode ? '#FFFFFF' : 'rgba(17,28,50,0.82)',
                    color: isLightMode ? '#334155' : '#E2E8F0',
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: 'rgba(96,165,250,0.45)',
                      bgcolor: isLightMode ? '#EFF6FF' : 'rgba(30,41,59,0.92)',
                    },
                  }}
                >
                  <Box component="span" sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1}}>
                    <Box component="span">{action.label}</Box>
                    <Icon sx={{fontSize: 18, color: action.label === 'Escalate Issue' ? (isLightMode ? '#64748B' : '#CBD5E1') : '#A5B4CC'}} />
                  </Box>
                </Button>
              );
            })}
          </Box>
        </Paper>
      )}
    </Box>
  );
}
