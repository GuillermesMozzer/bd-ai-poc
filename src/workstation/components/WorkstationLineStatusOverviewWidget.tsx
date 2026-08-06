import {Box, Button, Chip, LinearProgress, Tooltip, Typography} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  AutoAwesome as AutoAwesomeIcon,
  CalendarMonth as CalendarMonthIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ChevronRight as ChevronRightIcon,
  ErrorOutline as ErrorOutlineIcon,
  InfoOutlined as InfoIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
  SpeedOutlined as SpeedIcon,
  TimelineOutlined as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  VisibilityOutlined as VisibilityIcon,
  WarningAmber as WarningAmberIcon,
  BuildOutlined as BuildIcon,
} from '@mui/icons-material';
import type {ReactNode} from 'react';
import {
  tokenBrand,
  tokenCommon,
  tokenDivider,
  tokenError,
  tokenInfo,
  tokenNeutral,
  tokenSuccess,
  tokenText,
  tokenWarning,
  workstationVisuals,
} from '../theme';
import type {WorkstationDashboardData} from '../types';
import WidgetShell from './WidgetShell';

type WorkstationLineStatusOverviewWidgetProps = {
  data: WorkstationDashboardData;
  onEscalateScrapAlert?: () => void;
  onOpenLineLog?: () => void;
  onOpenNextCilActivity?: () => void;
  onStartNextCenterline?: () => void;
};

type StatusTone = 'success' | 'warning' | 'error' | 'brand' | 'info' | 'neutral';

const toneMap: Record<StatusTone, {main: string; bg: string; border: string}> = {
  success: {main: tokenSuccess.darker, bg: tokenSuccess.softBg, border: tokenSuccess.lightest},
  warning: {main: tokenWarning.dark, bg: tokenWarning.softBg, border: tokenWarning.lightest},
  error: {main: tokenError.main, bg: tokenError.softBg, border: tokenError.lightest},
  brand: {main: tokenBrand.main, bg: tokenBrand.softBg, border: tokenBrand.selectedBg},
  info: {main: tokenInfo.darker, bg: tokenInfo.softBg, border: tokenInfo.lightest},
  neutral: {main: tokenText.secondary, bg: tokenNeutral.lightest, border: tokenNeutral.dark},
};

function formatUnits(value: number) {
  return value.toLocaleString('en-US');
}

function getProgress(current: number, target: number) {
  return Math.min(Math.max((current / Math.max(target, 1)) * 100, 0), 100);
}

function StatusPill({icon, label, tone}: {icon?: ReactNode; label: string; tone: StatusTone}) {
  const colors = toneMap[tone];
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.45,
        px: 0.9,
        py: 0.4,
        borderRadius: '999px',
        bgcolor: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.main,
        fontSize: 12,
        lineHeight: 1,
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      {label}
    </Box>
  );
}

function LineContextCard({
  badge,
  subtitle,
  title,
}: {
  badge: string;
  subtitle: string;
  title: string;
}) {
  const isRunning = badge.toLowerCase() === 'running';

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        alignItems: 'center',
        gap: 1.4,
        minWidth: 0,
        minHeight: 58,
        px: {xs: 1.25, md: 1.55},
        py: 0.9,
        border: `1px solid ${tokenDivider}`,
        borderTop: `4px solid ${tokenSuccess.darker}`,
        borderRadius: '8px',
        bgcolor: tokenCommon.white,
      }}
    >
      <Box sx={{minWidth: 0}}>
        <Typography sx={{fontSize: 13, fontWeight: 900, color: tokenText.primary, lineHeight: 1.12, letterSpacing: 0}}>
          {title}
        </Typography>
        <Typography sx={{fontSize: 11.5, color: tokenText.secondary, mt: 0.35, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
          {subtitle}
        </Typography>
      </Box>
      <Chip
        label={badge}
        sx={{
          '@keyframes lineContextRunningPulse': {
            '0%': {boxShadow: '0 0 0 0 rgba(46, 125, 50, 0.34)', transform: 'scale(1)'},
            '70%': {boxShadow: '0 0 0 7px rgba(46, 125, 50, 0)', transform: 'scale(1.025)'},
            '100%': {boxShadow: '0 0 0 0 rgba(46, 125, 50, 0)', transform: 'scale(1)'},
          },
          height: 27,
          minWidth: 78,
          borderRadius: '999px',
          bgcolor: tokenSuccess.main,
          color: tokenCommon.black,
          fontSize: 13,
          fontWeight: 500,
          animation: isRunning ? 'lineContextRunningPulse 1.8s ease-out infinite' : 'none',
          '& .MuiChip-label': {px: 1.3},
        }}
      />
    </Box>
  );
}

function LineContextStrip() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1fr)'},
        gap: {xs: 0.8, md: 1},
        minWidth: 0,
      }}
    >
      <LineContextCard
        title="NEXIVA 20 GA X 1 IN SINGLE PORT"
        subtitle="SKU: 80-APX-50000 | Lot: L2075-0245 | Batch: 1847"
        badge="Production"
      />
      <LineContextCard
        title="NEXIVA ZONE #8"
        subtitle="Causal Code: Z4.C10.S2 Part Not Detected"
        badge="Running"
      />
    </Box>
  );
}

function Panel({children, sx, tourTarget}: {children: ReactNode; sx?: object; tourTarget?: string}) {
  return (
    <Box
      data-workstation-tour-target={tourTarget}
      sx={{
        p: 1.6,
        minWidth: 0,
        bgcolor: 'background.paper',
        border: `1px solid ${tokenDivider}`,
        borderRadius: '12px',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

function SectionTitle({action, badge, icon, title}: {action?: ReactNode; badge?: ReactNode; icon?: ReactNode; title: string}) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.2, mb: 1.25}}>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 0}}>
        {icon}
        <Typography sx={{fontSize: 15, fontWeight: 800, color: tokenText.primary, lineHeight: 1.2}}>
          {title}
        </Typography>
        {badge}
      </Box>
      {action}
    </Box>
  );
}

function PendingTaskRow({
  detail,
  icon,
  actionLabel,
  actionTone,
  cta,
  onClick,
  stateLabel,
  timeLabel,
  title,
  tone,
}: {
  detail: ReactNode;
  icon: ReactNode;
  actionLabel: string;
  actionTone: StatusTone;
  cta?: string;
  onClick?: () => void;
  stateLabel: string;
  timeLabel: string;
  title: string;
  tone: StatusTone;
}) {
  const colors = toneMap[tone];
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '30px minmax(0, 1fr) 96px 16px',
          md: '34px minmax(0, 1fr) 88px 78px 104px 18px',
        },
        alignItems: 'center',
        gap: 0.85,
        px: 1.1,
        py: 0.85,
        borderRadius: '8px',
        border: `1px solid ${tokenDivider}`,
        bgcolor: 'background.paper',
        width: '100%',
        minWidth: 0,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.15s ease, background-color 0.15s ease',
        '&:hover': onClick ? {
          borderColor: toneMap[actionTone].border,
          bgcolor: tokenNeutral.lightest,
        } : undefined,
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <Box sx={{color: colors.main, display: 'grid', placeItems: 'center'}}>{icon}</Box>
      <Box sx={{minWidth: 0}}>
        <Typography sx={{fontSize: 13, fontWeight: 800, color: tokenText.primary, lineHeight: 1.2}}>
          {title}
        </Typography>
        <Typography sx={{fontSize: 12, color: tokenText.secondary, mt: 0.25, lineHeight: 1.35}}>
          {detail}
        </Typography>
        {cta ? (
          <Typography sx={{fontSize: 12, color: toneMap[actionTone].main, mt: 0.35, fontWeight: 850}}>
            {cta}
          </Typography>
        ) : null}
      </Box>
      <Box sx={{display: {xs: 'none', md: 'grid'}, gap: 0.25, minWidth: 0}}>
        <Typography sx={{fontSize: 10.5, fontWeight: 800, color: tokenText.secondary, lineHeight: 1, textTransform: 'uppercase'}}>
          Status
        </Typography>
        <Typography sx={{fontSize: 12.2, fontWeight: 800, color: tokenText.primary, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
          {stateLabel}
        </Typography>
      </Box>
      <Box sx={{display: {xs: 'none', md: 'grid'}, gap: 0.25, minWidth: 0}}>
        <Typography sx={{fontSize: 10.5, fontWeight: 800, color: tokenText.secondary, lineHeight: 1, textTransform: 'uppercase'}}>
          Time
        </Typography>
        <Typography sx={{fontSize: 12.2, fontWeight: 800, color: tokenText.primary, lineHeight: 1.15, whiteSpace: 'nowrap'}}>
          {timeLabel}
        </Typography>
      </Box>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minWidth: 0, '& > span': {minWidth: 82, justifyContent: 'center'}}}>
        <StatusPill label={actionLabel} tone={actionTone} />
      </Box>
      <ChevronRightIcon sx={{fontSize: 19, color: tokenText.secondary}} />
    </Box>
  );
}

function TimelineEvent({
  completed = false,
  detail,
  eventStatus = 'upcoming',
  icon,
  label,
  status,
  time,
}: {
  completed?: boolean;
  detail: string;
  eventStatus?: 'completed' | 'error' | 'upcoming';
  icon: ReactNode;
  label: string;
  status: string;
  time: string;
}) {
  const tone: StatusTone = eventStatus === 'error' ? 'error' : completed ? 'success' : 'info';
  const colors = eventStatus === 'upcoming'
    ? {main: tokenText.secondary, bg: tokenNeutral.lightest, border: tokenNeutral.dark}
    : toneMap[tone];

  return (
    <Box sx={{display: 'grid', justifyItems: 'center', gap: 0.6, minWidth: 112, position: 'relative', zIndex: 1}}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '999px',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'background.paper',
          color: colors.main,
          border: `1px solid ${colors.border}`,
          boxShadow: eventStatus === 'upcoming' ? 'none' : workstationVisuals.tierShadow,
        }}
      >
        {icon}
      </Box>
      <Typography sx={{fontSize: 13, fontWeight: 800, color: colors.main, lineHeight: 1}}>
        {time}
      </Typography>
      <Typography sx={{fontSize: 12, fontWeight: 800, color: tokenText.primary, lineHeight: 1.25, textAlign: 'center'}}>
        {label}
      </Typography>
      <Typography sx={{fontSize: 11.5, color: tokenText.secondary, lineHeight: 1.25, textAlign: 'center'}}>
        {detail}
      </Typography>
      <StatusPill label={status} tone={eventStatus === 'error' ? 'error' : completed ? 'success' : 'neutral'} />
    </Box>
  );
}

function MetricCard({
  detail,
  icon,
  label,
  note,
  tone,
  value,
}: {
  detail: string;
  icon: ReactNode;
  label: string;
  note: string;
  tone: StatusTone;
  value: string;
}) {
  const colors = toneMap[tone];
  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: '8px',
        border: `1px solid ${colors.border}`,
        bgcolor: colors.bg,
        minHeight: 108,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minWidth: 0,
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
        <Typography sx={{fontSize: 11, color: tokenText.secondary, fontWeight: 800, textTransform: 'uppercase'}}>
          {label}
        </Typography>
        <Box sx={{color: colors.main, lineHeight: 0}}>{icon}</Box>
      </Box>
      <Box>
        <Typography sx={{fontSize: 28, fontWeight: 800, color: colors.main, lineHeight: 1}}>
          {value}
        </Typography>
        <Typography sx={{fontSize: 12, color: tokenText.secondary, mt: 0.45, lineHeight: 1.25}}>
          {detail}
        </Typography>
      </Box>
      <Typography sx={{fontSize: 12, color: colors.main, fontWeight: 800, lineHeight: 1.25}}>
        {note}
      </Typography>
    </Box>
  );
}

function AlertRow({
  detail,
  icon,
  onEscalate,
  pulsing = false,
  title,
  tone,
}: {
  detail: string;
  icon: ReactNode;
  onEscalate?: () => void;
  pulsing?: boolean;
  title: string;
  tone: 'error' | 'warning';
}) {
  const colors = tone === 'error' ? toneMap.error : toneMap.warning;
  const showEscalate = tone === 'error';
  return (
    <Box
      sx={{
        '@keyframes lineStatusAlertPulse': {
          '0%': {boxShadow: '0 0 0 0 rgba(244,67,54,0.24)'},
          '70%': {boxShadow: '0 0 0 8px rgba(244,67,54,0)'},
          '100%': {boxShadow: '0 0 0 0 rgba(244,67,54,0)'},
        },
        display: 'grid',
        gridTemplateColumns: {xs: showEscalate ? '40px minmax(0, 1fr) 96px' : '40px minmax(0, 1fr)', sm: showEscalate ? '44px minmax(0, 1fr) 104px' : '44px minmax(0, 1fr)'},
        alignItems: 'center',
        gap: 1,
        px: 1.15,
        py: 1.15,
        minHeight: 66,
        borderRadius: '8px',
        border: `1px solid ${colors.border}`,
        bgcolor: colors.bg,
        animation: pulsing ? 'lineStatusAlertPulse 2.4s ease-out infinite' : 'none',
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: '8px',
          display: 'grid',
          placeItems: 'center',
          bgcolor: colors.bg,
          color: colors.main,
          border: `1px solid ${colors.border}`,
        }}
      >
        {icon}
      </Box>
      <Box sx={{minWidth: 0}}>
        <Typography sx={{fontSize: 13, fontWeight: 850, color: tokenText.primary, lineHeight: 1.2}}>
          {title}
        </Typography>
        <Typography sx={{fontSize: 12, color: tokenText.secondary, mt: 0.25, lineHeight: 1.25}}>
          {detail}
        </Typography>
      </Box>
      {showEscalate ? (
        <Button
          size="small"
          variant="outlined"
          onClick={onEscalate}
          sx={{
            borderRadius: '8px',
            borderColor: colors.main,
            color: colors.main,
            fontWeight: 850,
            textTransform: 'none',
            bgcolor: 'background.paper',
            whiteSpace: 'nowrap',
            minWidth: 0,
            px: 1,
            '&:hover': {
              borderColor: colors.main,
              bgcolor: colors.bg,
            },
          }}
        >
          Escalate
        </Button>
      ) : null}
    </Box>
  );
}

function AlertPanel({onEscalate, sx, tourTarget}: {onEscalate?: () => void; sx?: object; tourTarget?: string}) {
  return (
    <Panel tourTarget={tourTarget} sx={{position: 'relative', overflow: 'hidden', height: '100%', ...sx}}>
      <SectionTitle
        title="Alerts"
        badge={<Chip size="small" label={3} sx={{height: 22, bgcolor: tokenError.main, color: tokenCommon.white, fontWeight: 800}} />}
        action={<Button size="small" sx={{textTransform: 'none', fontWeight: 800}}>View all</Button>}
      />
      <Box sx={{display: 'grid', gap: 0.8}}>
        <AlertRow
          pulsing
          tone="error"
          onEscalate={onEscalate}
          icon={<TrendingUpIcon sx={{fontSize: 21}} />}
          title="Scrap out of target"
          detail="Scrap at 3.0%, above 2.0% target · 10:03 AM"
        />
        <AlertRow
          tone="warning"
          icon={<SpeedIcon sx={{fontSize: 21}} />}
          title="OEE below target"
          detail="OEE at 82.4%, 2.6pp below target · 10:05 AM"
        />
        <AlertRow
          tone="warning"
          icon={<WarningAmberIcon sx={{fontSize: 21}} />}
          title="Minor stop detected"
          detail="Micro-stop spike affecting runtime · 10:12 AM"
        />
      </Box>
    </Panel>
  );
}

export default function WorkstationLineStatusOverviewWidget({
  data,
  onEscalateScrapAlert,
  onOpenLineLog,
  onOpenNextCilActivity,
  onStartNextCenterline,
}: WorkstationLineStatusOverviewWidgetProps) {
  const {summary} = data;
  const producedPercent = getProgress(summary.currentOutput, summary.shiftTarget);
  const shiftPacePercent = getProgress(summary.shiftElapsedMinutes, summary.shiftDurationMinutes);
  const estimatedRemainingMinutes = Math.max(summary.shiftDurationMinutes - summary.shiftElapsedMinutes, 0);
  const remainingHours = Math.floor(estimatedRemainingMinutes / 60);
  const remainingMinutes = estimatedRemainingMinutes % 60;
  const projectedThroughput = Math.round(summary.targetThroughputPerHour * (summary.performance / 100));

  return (
    <WidgetShell noPadding>
      <Box
        sx={{
          height: '100%',
          minHeight: 0,
          overflow: 'auto',
          bgcolor: 'background.paper',
          fontFamily: workstationVisuals.fontFamily,
        }}
      >
        <Box
          sx={{
            px: {xs: 1.5, md: 2},
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6, minWidth: 0}}>
            <Typography sx={{fontSize: '0.92rem', fontWeight: 700, color: tokenText.primary, fontFamily: workstationVisuals.fontFamily}}>
              Operator Overview
            </Typography>
            <Tooltip title="Operator-focused line status, production progress, alerts, and recent activity.">
              <InfoIcon sx={{fontSize: 15, color: tokenText.secondary}} />
            </Tooltip>
          </Box>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap'}}>
            <Button
              variant="outlined"
              size="small"
              aria-label="Refresh operator overview"
              sx={{minWidth: 36, width: 36, px: 0, borderRadius: '8px'}}
            >
              <RefreshIcon sx={{fontSize: 17}} />
            </Button>
            <Typography sx={{fontSize: 12.5, color: tokenText.secondary, fontWeight: 600}}>
              Updated 2 min ago
            </Typography>
            <Box sx={{width: 8, height: 8, borderRadius: '999px', bgcolor: tokenSuccess.darker}} />
          </Box>
        </Box>

        <Box sx={{p: {xs: 1.5, md: 2}, display: 'flex', flexDirection: 'column', gap: 1.6}}>
          <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: '1.42fr 1fr'}, gap: 1.4, alignItems: 'stretch'}}>
            <Panel tourTarget="operator-line-status" sx={{gridColumn: {xs: '1', xl: '1'}, gridRow: {xs: 'auto', xl: '1'}, display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%'}}>
              <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2, flexWrap: 'wrap'}}>
                <Box sx={{display: 'flex', alignItems: 'baseline', gap: 1.1, flexWrap: 'wrap'}}>
                  <Typography sx={{fontSize: {xs: 32, md: 40}, fontWeight: 850, color: tokenBrand.main, lineHeight: 1}}>
                    {summary.line}
                  </Typography>
                  <Typography sx={{fontSize: 17, fontWeight: 800, color: tokenBrand.main}}>
                    Zone 2 / Z2-WC01
                  </Typography>
                </Box>
              </Box>

              <LineContextStrip />

              <Box sx={{border: `1px solid ${tokenDivider}`, borderRadius: '8px', p: 1.25, bgcolor: tokenNeutral.lightest}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1.2, alignItems: 'flex-start', flexWrap: 'wrap'}}>
                  <Box>
                    <Typography sx={{fontSize: 11, fontWeight: 800, color: tokenText.secondary, textTransform: 'uppercase'}}>
                      Current Production
                    </Typography>
                    <Typography sx={{fontSize: {xs: 19, md: 24}, fontWeight: 850, color: tokenText.primary, mt: 0.45, lineHeight: 1.15}}>
                      {summary.product}
                    </Typography>
                    <Typography sx={{fontSize: 13, color: tokenText.secondary, mt: 0.45}}>
                      {summary.workOrder}
                    </Typography>
                  </Box>
                  <Box sx={{textAlign: 'right'}}>
                    <Typography sx={{fontSize: 12, color: tokenText.secondary}}>Order Progress</Typography>
                    <Typography sx={{fontSize: 22, fontWeight: 850, color: tokenSuccess.darker, lineHeight: 1.05}}>
                      {Math.round(producedPercent)}%
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{position: 'relative', mt: 2.35, mb: 1.25}}>
                  <LinearProgress
                    variant="determinate"
                    value={producedPercent}
                    sx={{
                      height: 12,
                      borderRadius: '999px',
                      bgcolor: tokenNeutral.main,
                      '& .MuiLinearProgress-bar': {borderRadius: '999px', bgcolor: tokenSuccess.darker},
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -5,
                      bottom: -5,
                      left: `${Math.min(shiftPacePercent, 96)}%`,
                      width: 2,
                      borderRadius: '999px',
                      bgcolor: tokenText.secondary,
                    }}
                  />
                </Box>

                <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: 'minmax(0, 1fr) auto auto'}, alignItems: 'end', gap: 1.15}}>
                  <Box>
                    <Typography sx={{fontSize: 28, fontWeight: 850, color: tokenSuccess.darker, lineHeight: 1}}>
                      {formatUnits(summary.currentOutput)}
                      <Box component="span" sx={{fontSize: 18, color: tokenText.primary, fontWeight: 500}}> / {formatUnits(summary.shiftTarget)}</Box>
                    </Typography>
                    <Typography sx={{fontSize: 12.5, color: tokenText.secondary, mt: 0.35}}>Units produced</Typography>
                  </Box>
                  <Box sx={{textAlign: {xs: 'left', sm: 'right'}}}>
                    <Typography sx={{fontSize: 11, color: tokenText.secondary, fontWeight: 800, textTransform: 'uppercase'}}>Target</Typography>
                    <Typography sx={{fontSize: 13, color: tokenText.primary, fontWeight: 800}}>{formatUnits(summary.shiftTarget)}</Typography>
                  </Box>
                  <Box sx={{textAlign: {xs: 'left', sm: 'right'}, minWidth: 118}}>
                    <Typography sx={{fontSize: 12, color: tokenText.secondary}}>Est. Time Remaining</Typography>
                    <Typography sx={{fontSize: 20, color: tokenBrand.main, fontWeight: 850}}>
                      {remainingHours}h {remainingMinutes}m
                    </Typography>
                    <Typography sx={{fontSize: 12, color: tokenText.secondary}}>ETA 2:00 PM</Typography>
                  </Box>
                </Box>
              </Box>
            </Panel>

            <Panel tourTarget="operator-pending-tasks" sx={{gridColumn: {xs: '1', xl: '1'}, gridRow: {xs: 'auto', xl: '2'}, height: '100%'}}>
              <SectionTitle
                title="Pending Tasks"
                badge={<Chip size="small" label={4} sx={{height: 22, bgcolor: tokenError.main, color: tokenCommon.white, fontWeight: 800}} />}
                action={<Button size="small" sx={{textTransform: 'none', fontWeight: 800}}>View all</Button>}
              />
              <Box sx={{display: 'grid', gap: 1}}>
                <PendingTaskRow
                  icon={<CalendarMonthIcon sx={{fontSize: 25}} />}
                  title="Next CIL activity"
                  detail={`CIL on ${summary.line} · Zone 2 / Z2 Tipper Unit · 11:00 AM`}
                  actionLabel="Up next"
                  actionTone="success"
                  stateLabel="Planned"
                  timeLabel="11:00 AM"
                  tone="brand"
                  onClick={onOpenNextCilActivity}
                />
                <PendingTaskRow
                  icon={<BuildIcon sx={{fontSize: 25}} />}
                  title="Upcoming changeover"
                  detail="Prepare Line 10 for next SKU · Scheduled for 1:30 PM"
                  actionLabel="Scheduled"
                  actionTone="brand"
                  stateLabel="Scheduled"
                  timeLabel="1:30 PM"
                  tone="brand"
                />
                <PendingTaskRow
                  icon={<WarningAmberIcon sx={{fontSize: 25}} />}
                  title="Open ESO"
                  detail="Create ESO for minor material spill near feeder"
                  actionLabel="Needs action"
                  actionTone="error"
                  stateLabel="Open"
                  timeLabel="Now"
                  tone="warning"
                />
                <PendingTaskRow
                  icon={<SpeedIcon sx={{fontSize: 25}} />}
                  title="Review OEE stop reason"
                  detail="Validate top stop code before shift huddle"
                  actionLabel="Review"
                  actionTone="brand"
                  stateLabel="Planned"
                  timeLabel="Before huddle"
                  tone="info"
                />
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6, mt: 1.1}}>
                <CheckCircleOutlineIcon sx={{fontSize: 16, color: tokenSuccess.darker}} />
                <Typography sx={{fontSize: 12, color: tokenText.secondary, fontWeight: 700}}>2 completed / 4 pending</Typography>
              </Box>
            </Panel>

            <AlertPanel
              onEscalate={onEscalateScrapAlert}
              tourTarget="operator-alerts"
              sx={{gridColumn: {xs: '1', xl: '2'}, gridRow: {xs: 'auto', xl: '1'}}}
            />
            <Panel tourTarget="operator-ai-insights" sx={{gridColumn: {xs: '1', xl: '2'}, gridRow: {xs: 'auto', xl: '2'}, height: '100%', bgcolor: tokenNeutral.lightest, borderColor: 'transparent', display: 'flex', flexDirection: 'column'}}>
              <SectionTitle
                title="AI Insights"
                icon={<AutoAwesomeIcon sx={{fontSize: 22, color: tokenBrand.main}} />}
                badge={<Chip size="small" label="BETA" sx={{height: 22, color: tokenBrand.main, bgcolor: tokenBrand.softBg, border: `1px solid ${tokenBrand.selectedBg}`, fontWeight: 800}} />}
              />
              <Box sx={{border: `1px solid ${tokenDivider}`, borderRadius: '8px', overflow: 'hidden', bgcolor: 'rgba(0,0,0,0.03)'}}>
                <Box sx={{display: 'grid', gridTemplateColumns: '34px minmax(0, 1fr)', gap: 1, p: 1.35}}>
                  <TimelineIcon sx={{fontSize: 25, color: tokenBrand.main}} />
                  <Box>
                    <Typography sx={{fontSize: 13, color: tokenText.primary, lineHeight: 1.35}}>
                      Line running below target due to <Box component="span" sx={{fontWeight: 850}}>micro-stops</Box>.
                    </Typography>
                    <Typography sx={{fontSize: 12.5, color: tokenText.secondary, mt: 1}}>
                      Runtime impact: -18 min
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{display: 'grid', gridTemplateColumns: '34px minmax(0, 1fr)', gap: 1, p: 1.35, borderTop: `1px solid ${tokenDivider}`, bgcolor: 'transparent'}}>
                  <BuildIcon sx={{fontSize: 25, color: tokenBrand.main}} />
                  <Box>
                    <Typography sx={{fontSize: 13, color: tokenText.primary, lineHeight: 1.35}}>
                      Next recommended action:
                    </Typography>
                    <Typography sx={{fontSize: 13, color: tokenText.primary, lineHeight: 1.35, fontWeight: 850}}>
                      Verify material feed in Zone 2.
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{display: 'grid', gridTemplateColumns: '34px minmax(0, 1fr)', gap: 1, p: 1.35, borderTop: `1px solid ${tokenDivider}`, bgcolor: 'transparent'}}>
                  <WarningAmberIcon sx={{fontSize: 25, color: tokenError.main}} />
                  <Box>
                    <Typography sx={{fontSize: 13, color: tokenText.primary, lineHeight: 1.35}}>
                      Escalate scrap drift if the next sample stays above 2.0%.
                    </Typography>
                    <Typography sx={{fontSize: 12.5, color: tokenText.secondary, mt: 1}}>
                      Expected impact: protects order progress from reject losses.
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Button size="small" sx={{mt: 1.1, textTransform: 'none', fontWeight: 800}}>
                View all insights
              </Button>
            </Panel>
          </Box>

          <Panel tourTarget="operator-shift-timeline">
            <SectionTitle
              title="Timeline / Recent Events"
              icon={<AccessTimeIcon sx={{fontSize: 22, color: tokenText.secondary}} />}
            />
            <Box sx={{position: 'relative', overflowX: 'auto', px: 1, pb: 0.5}}>
              <Box sx={{position: 'absolute', top: 21, left: 32, right: 32, height: 2, bgcolor: tokenDivider}} />
              <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(5, minmax(108px, 1fr))', gap: 1.45, minWidth: 620}}>
                <TimelineEvent completed eventStatus="completed" icon={<PlayArrowIcon />} time="06:00 AM" label="Shift started" detail={summary.line} status="On time" />
                <TimelineEvent completed eventStatus="completed" icon={<BuildIcon />} time="08:00 AM" label="Changeover completed" detail={summary.workOrder} status="On time" />
                <TimelineEvent completed eventStatus="completed" icon={<CheckCircleOutlineIcon />} time="09:15 AM" label="Quality inspection completed" detail="Zone 2" status="On time" />
                <TimelineEvent eventStatus="error" icon={<ErrorOutlineIcon />} time="10:05 AM" label="Minor stop detected" detail="Micro-stop spike" status="18 min" />
                <TimelineEvent completed eventStatus="completed" icon={<PlayArrowIcon />} time="10:12 AM" label="Line resumed" detail="All systems normal" status="On time" />
              </Box>
            </Box>
          </Panel>

          <Box data-workstation-tour-target="operator-primary-kpis" sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr)) 2.2fr'}, gap: 1.4}}>
            <MetricCard icon={<TrendingUpIcon sx={{fontSize: 19}} />} label="OEE" value={`${summary.oee}%`} detail="Below target" note="-2.6pp vs target" tone={summary.oee >= 85 ? 'success' : 'error'} />
            <MetricCard icon={<VisibilityIcon sx={{fontSize: 19}} />} label="Scrap" value={`${summary.scrapRate}%`} detail="Current shift" note="+1.0pp vs target" tone={summary.scrapRate <= 2 ? 'success' : 'error'} />
            <MetricCard icon={<AccessTimeIcon sx={{fontSize: 19}} />} label="Downtime" value={`${summary.downtimeMinutes} min`} detail="Today" note="+12 min vs plan" tone="warning" />
            <MetricCard icon={<SpeedIcon sx={{fontSize: 19}} />} label="Throughput" value={`${formatUnits(projectedThroughput)} u/h`} detail={`${Math.round(summary.performance)}% of goal`} note={`Target: ${formatUnits(summary.targetThroughputPerHour)} u/h`} tone="success" />
            <Box
              sx={{
                gridColumn: {xs: '1', md: 'span 2', xl: 'span 2'},
                p: 1.35,
                borderRadius: '8px',
                border: `1px solid ${tokenBrand.selectedBg}`,
                bgcolor: tokenBrand.softBg,
                display: 'grid',
                gridTemplateColumns: {xs: '1fr', sm: 'minmax(0, 1fr) auto'},
                gap: 1.2,
                alignItems: 'center',
                minWidth: 0,
              }}
            >
              <Box sx={{minWidth: 0}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.85}}>
                  <CalendarMonthIcon sx={{fontSize: 19, color: tokenBrand.main}} />
                  <Typography sx={{fontSize: 13, color: tokenBrand.dark, fontWeight: 850}}>Next Activity</Typography>
                  <StatusPill label="In 48 min" tone="brand" />
                </Box>
                <Typography sx={{fontSize: 16, fontWeight: 850, color: tokenText.primary, lineHeight: 1.2}}>
                  Centerline on {summary.line}
                </Typography>
                <Typography sx={{fontSize: 13, color: tokenText.secondary, mt: 0.35}}>
                  Zone 2 / Z2 Tipper Unit
                </Typography>
                <Typography sx={{fontSize: 13, color: tokenText.secondary, mt: 0.55}}>
                  11:00 AM - 11:30 AM
                </Typography>
              </Box>
              <Button
                variant="outlined"
                onClick={onStartNextCenterline}
                startIcon={<PlayArrowIcon sx={{fontSize: 16}} />}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 850,
                  bgcolor: tokenCommon.white,
                  whiteSpace: 'nowrap',
                  '&:hover': {bgcolor: tokenBrand.softBg},
                }}
              >
                View Details
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </WidgetShell>
  );
}
