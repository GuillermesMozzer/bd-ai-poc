import {Box, IconButton, Typography} from '@mui/material';
import type {ReactNode} from 'react';
import {ChevronRight as ChevronRightIcon, NorthEast as NorthEastIcon} from '@mui/icons-material';
import {
  tokenBrand,
  tokenCommon,
  tokenError,
  tokenNeutral,
  tokenWarning,
  workstationStatusPillSx,
  workstationVisuals,
} from '../theme';
import type {WorkstationWidgetProps} from '../types';
import WidgetShell from './WidgetShell';
import {
  maintenanceHubNotificationConfig,
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  useWidgetNotifications,
} from './WidgetNotifications';

const maintenanceKpis = [
  {value: '14', label: 'Open Requests', note: 'Open MRs', color: workstationVisuals.textPrimary},
  {value: '8', label: 'Active WOs', note: 'In execution', color: tokenBrand.main},
  {value: '3', label: 'Overdue WOs', note: 'Past due', color: tokenError.main, criticality: 'error'},
  {value: '5', label: 'Breakdowns', note: 'Last 7 days', color: tokenWarning.main, criticality: 'warning'},
];

const recentBreakdowns = [
  {asset: 'Packaging Line PLC', type: 'Breakdown', time: '2h ago'},
  {asset: 'Conveyor CV-210', type: 'Breakdown', time: 'Yesterday'},
  {asset: 'Filling Valve FV-12', type: 'Breakdown', time: '2 days ago'},
  {asset: 'Autoclave A01', type: 'Breakdown', time: '4 days ago'},
];

const upcomingMaintenance = [
  {activity: 'Weekly PM Packaging Line 1', type: 'PM', time: 'Tomorrow'},
  {activity: 'Corrective WO Conveyor CV-210', type: 'Corrective', time: 'In 2 days'},
  {activity: 'Monthly PM Autoclave A01', type: 'PM', time: 'In 3 days'},
  {activity: 'Quarterly PM Filling Valve Bank', type: 'PM', time: 'Next Week'},
];

const needsAttention = [
  {
    count: '3',
    label: 'WOs overdue',
    severity: 'error',
    intent: {filters: {dates: ['Overdue']}},
  },
  {
    count: '2',
    label: 'WOs waiting assignment',
    severity: 'warning',
    intent: {filters: {assignedTo: ['Unassigned']}},
  },
  {
    count: '1',
    label: 'PM overdue',
    severity: 'error',
    intent: {filters: {types: ['Preventive'], dates: ['Overdue']}},
  },
  {
    count: '4',
    label: 'MRs older than 7 days',
    severity: 'warning',
    intent: {filters: {types: ['Maintenance Request'], dates: ['Overdue']}},
  },
] as const;

const insetCardSx = {
  border: '1px solid rgba(15, 23, 42, 0.06)',
  borderRadius: '8px',
  bgcolor: tokenCommon.white,
} as const;

const sectionTitleSx = {
  fontSize: '0.82rem',
  fontWeight: 600,
  color: workstationVisuals.textPrimary,
  fontFamily: workstationVisuals.fontFamily,
  lineHeight: 1.2,
} as const;

const metaTextSx = {
  fontSize: '0.68rem',
  color: workstationVisuals.textSecondary,
  fontWeight: 500,
  fontFamily: workstationVisuals.fontFamily,
  lineHeight: 1.25,
} as const;

function getCriticalKpiSx(criticality?: 'error' | 'warning') {
  if (criticality === 'error') {
    return {
      bgcolor: tokenError.softBg,
      border: `1px solid ${tokenError.lighter}`,
      borderRadius: '8px',
    } as const;
  }

  if (criticality === 'warning') {
    return {
      bgcolor: tokenWarning.softBg,
      border: `1px solid ${tokenWarning.lighter}`,
      borderRadius: '8px',
    } as const;
  }

  return {} as const;
}

export default function MaintenanceHubWidget({className, style, onExpand}: WorkstationWidgetProps) {
  const notifications = useWidgetNotifications(maintenanceHubNotificationConfig);

  const openFollowUpBoard = () => {
    onExpand?.();
  };

  const openFollowUpBoardWithIntent = (intent: typeof needsAttention[number]['intent']) => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('workstation:maintenance-backlog-intent', JSON.stringify(intent));
    }
    openFollowUpBoard();
  };

  const headerAction = (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
      <WidgetNotificationBell active={notifications.active} onClick={notifications.openDialog} size={24} />
      <IconButton
        size="small"
        aria-label="Open Maintenance Follow Up Board"
        onClick={(event) => {
          event.stopPropagation();
          openFollowUpBoard();
        }}
        sx={{width: 24, height: 24, p: 0, color: tokenBrand.main}}
      >
        <NorthEastIcon sx={{fontSize: 18}} />
      </IconButton>
    </Box>
  );

  return (
    <>
      <WidgetShell title="Maintenance Hub" action={headerAction} className={className} style={style}>
        <Box
          onClick={openFollowUpBoard}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openFollowUpBoard();
            }
          }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.2,
            height: '100%',
            minHeight: 0,
            p: 0.5,
            containerType: 'inline-size',
            cursor: 'pointer',
            '&:focus-visible': {
              outline: `2px solid ${tokenBrand.main}`,
              outlineOffset: 2,
              borderRadius: '8px',
            },
          }}
      >
        <Box
          sx={{
            ...insetCardSx,
            p: 1.35,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 1,
            flexShrink: 0,
            '@container (max-width: 640px)': {
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            },
            '@container (max-width: 340px)': {
              gridTemplateColumns: '1fr',
            },
          }}
        >
          {maintenanceKpis.map((kpi, index) => (
            <MetricSummary
              key={kpi.label}
              value={kpi.value}
              label={kpi.label}
              note={kpi.note}
              color={kpi.color}
              criticality={'criticality' in kpi ? kpi.criticality : undefined}
              last={index === maintenanceKpis.length - 1}
            />
          ))}
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 1.2,
            minHeight: 0,
            flex: 1,
            '@container (max-width: 760px)': {
              gridTemplateColumns: '1fr',
              overflow: 'auto',
            },
          }}
        >
          <Section title="Needs Attention">
            {needsAttention.map((item) => (
              <AttentionRow
                key={`${item.count}-${item.label}`}
                count={item.count}
                label={item.label}
                severity={item.severity}
                onActivate={() => openFollowUpBoardWithIntent(item.intent)}
              />
            ))}
          </Section>

          <Section title="Recent Breakdowns">
            {recentBreakdowns.map((item) => (
              <CompactRow
                key={`${item.asset}-${item.time}`}
                primary={item.asset}
                badge={item.type}
                secondary={item.time}
                badgeTone="warning"
              />
            ))}
          </Section>

          <Section title="Upcoming Maintenance">
            {upcomingMaintenance.map((item) => (
              <CompactRow
                key={`${item.activity}-${item.time}`}
                primary={item.activity}
                secondary={item.time}
                badge={item.type}
                badgeTone={item.type === 'Corrective' ? 'warning' : 'neutral'}
              />
            ))}
          </Section>
        </Box>

        </Box>
      </WidgetShell>
      <WidgetNotificationsDialog
        active={notifications.active}
        config={maintenanceHubNotificationConfig}
        draftState={notifications.draftState}
        onApplySuggestion={notifications.applySuggestion}
        onClose={notifications.closeDialog}
        onSave={notifications.save}
        onStateChange={notifications.setDraftState}
        open={notifications.open}
      />
    </>
  );
}

function MetricSummary({
  color,
  criticality,
  label,
  last,
  note,
  value,
}: {
  color: string;
  criticality?: 'error' | 'warning';
  label: string;
  last: boolean;
  note: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        minWidth: 0,
        p: 0.35,
        pl: 0.8,
        borderRight: last ? 'none' : '1px solid rgba(15, 23, 42, 0.06)',
        ...getCriticalKpiSx(criticality),
        '@container (max-width: 640px)': {
          borderRight: 'none',
        },
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'baseline', gap: 0.8, minWidth: 0}}>
        <Typography
          sx={{
            fontSize: '1.25rem',
            color,
            fontWeight: 600,
            lineHeight: 1,
            fontFamily: workstationVisuals.fontFamily,
            flexShrink: 0,
          }}
        >
          {value}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.72rem',
            color: workstationVisuals.textPrimary,
            fontWeight: 500,
            lineHeight: 1.2,
            fontFamily: workstationVisuals.fontFamily,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {label}
        </Typography>
      </Box>
      <Typography sx={{...metaTextSx, mt: 0.45}} noWrap>
        {note}
      </Typography>
    </Box>
  );
}

function Section({children, title}: {children: ReactNode; title: string}) {
  return (
    <Box
      sx={{
        ...insetCardSx,
        p: 1.25,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.85,
        minHeight: 0,
      }}
    >
      <Typography sx={sectionTitleSx}>{title}</Typography>
      <Box sx={{display: 'grid', gap: 0.75, minHeight: 0, overflow: 'hidden'}}>
        {children}
      </Box>
    </Box>
  );
}

function AttentionRow({
  count,
  label,
  onActivate,
  severity,
}: {
  count: string;
  label: string;
  onActivate: () => void;
  severity: 'error' | 'warning';
}) {
  return (
    <Box
      onClick={(event) => {
        event.stopPropagation();
        onActivate();
      }}
      role="link"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        event.stopPropagation();
        onActivate();
      }}
      sx={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 0.5,
        minWidth: 0,
        px: 0.25,
        py: 0.25,
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
        '&:hover': {
          bgcolor: tokenNeutral.lightest,
        },
        '&:focus-visible': {
          outline: `2px solid ${tokenBrand.main}`,
          outlineOffset: 2,
        },
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          bgcolor: severity === 'error' ? tokenError.main : tokenWarning.main,
          flexShrink: 0,
          transform: 'translateY(-1px)',
        }}
      />
      <Typography
        sx={{
          fontSize: '0.78rem',
          color: workstationVisuals.textPrimary,
          fontWeight: 700,
          lineHeight: 1.2,
          fontFamily: workstationVisuals.fontFamily,
          flexShrink: 0,
        }}
      >
        {count}
      </Typography>
      <Typography
        sx={{
          fontSize: '0.76rem',
          color: workstationVisuals.textPrimary,
          fontWeight: 600,
          lineHeight: 1.2,
          fontFamily: workstationVisuals.fontFamily,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flex: 1,
        }}
      >
        {label}
      </Typography>
      <ChevronRightIcon sx={{fontSize: 16, color: workstationVisuals.textSecondary, flexShrink: 0}} />
    </Box>
  );
}

function CompactRow({
  badge,
  badgeTone,
  primary,
  secondary,
}: {
  badge: string;
  badgeTone: 'neutral' | 'warning';
  primary: string;
  secondary: string;
}) {
  return (
    <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 0.9, alignItems: 'center', minWidth: 0}}>
      <Box sx={{minWidth: 0}}>
        <Typography
          sx={{
            fontSize: '0.76rem',
            color: workstationVisuals.textPrimary,
            fontWeight: 600,
            lineHeight: 1.2,
            fontFamily: workstationVisuals.fontFamily,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {primary}
        </Typography>
        <Typography sx={{...metaTextSx, mt: 0.25}} noWrap>
          {secondary}
        </Typography>
      </Box>
      <Box
        sx={{
          ...workstationStatusPillSx(badgeTone),
          justifySelf: 'end',
          justifyContent: 'center',
          minWidth: badge === 'Corrective' ? 66 : 34,
          borderRadius: '8px',
          height: 20,
          px: 0.7,
          fontSize: '0.62rem',
          whiteSpace: 'nowrap',
          bgcolor: badgeTone === 'warning' ? tokenWarning.softBg : tokenNeutral.lightest,
        }}
      >
        {badge}
      </Box>
    </Box>
  );
}
