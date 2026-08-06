import {useMemo, useState} from 'react';
import {Box, IconButton, Typography} from '@mui/material';
import {
  NorthEast as NorthEastIcon,
} from '@mui/icons-material';
import {
  tokenBrand,
  tokenCommon,
  tokenError,
  tokenNeutral,
  tokenWarning,
  workstationVisuals,
} from '../theme';
import type {WorkstationWidgetProps} from '../types';
import WidgetShell from './WidgetShell';
import {
  maintenanceAnalyticsNotificationConfig,
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  useWidgetNotifications,
} from './WidgetNotifications';

type AnalyticsMetric = {
  label: string;
  value: string;
  delta: string;
  color: string;
  deltaColor: string;
  target: string;
  insight: string;
  owner: string;
  trend: number[];
  breakdown: Array<{label: string; value: number}>;
};

const analyticsMetrics = [
  {
    label: 'MTTR',
    value: '4.2h',
    delta: '+18%',
    color: tokenWarning.main,
    deltaColor: tokenWarning.main,
    target: '< 3.5h',
    insight: 'Conveyor repairs are taking longer because troubleshooting and parts confirmation are happening after breakdown start.',
    owner: 'Maintenance Supervisor',
    trend: [3.1, 3.2, 3.6, 3.8, 4.0, 4.2],
    breakdown: [
      {label: 'Conveyor', value: 42},
      {label: 'Robot', value: 28},
      {label: 'Utilities', value: 18},
      {label: 'Other', value: 12},
    ],
  },
  {
    label: 'MTBF',
    value: '186h',
    delta: '-6%',
    color: tokenWarning.main,
    deltaColor: tokenWarning.main,
    target: '> 210h',
    insight: 'Repeat stops are concentrated on Line 10 transfer and reject handling equipment.',
    owner: 'Reliability Engineer',
    trend: [212, 205, 201, 196, 190, 186],
    breakdown: [
      {label: 'Transfer', value: 35},
      {label: 'Reject', value: 30},
      {label: 'Pneumatic', value: 22},
      {label: 'Sensors', value: 13},
    ],
  },
  {
    label: 'PM Compliance',
    value: '78%',
    delta: '-9%',
    color: tokenError.main,
    deltaColor: tokenError.main,
    target: '90%',
    insight: 'Missed PMs are mainly driven by access windows and two overdue lubrication routes.',
    owner: 'Maintenance Planner',
    trend: [91, 89, 86, 84, 81, 78],
    breakdown: [
      {label: 'Access', value: 38},
      {label: 'Labor', value: 27},
      {label: 'Parts', value: 21},
      {label: 'Planning', value: 14},
    ],
  },
  {
    label: 'Emergency Work %',
    value: '14%',
    delta: '+12%',
    color: tokenWarning.main,
    deltaColor: tokenWarning.main,
    target: '< 8%',
    insight: 'Reactive work is increasing from unplanned conveyor stops and one recurring vision reject failure.',
    owner: 'Shift Maintenance Lead',
    trend: [8, 9, 10, 11, 13, 14],
    breakdown: [
      {label: 'Breakdown', value: 46},
      {label: 'Quality', value: 24},
      {label: 'Safety', value: 17},
      {label: 'Setup', value: 13},
    ],
  },
  {
    label: 'Equipment Availability',
    value: '87.4%',
    delta: '-2.1%',
    color: tokenWarning.main,
    deltaColor: tokenWarning.main,
    target: '92%',
    insight: 'Availability loss is highest during mid-shift when changeover recovery and corrective work overlap.',
    owner: 'Line Owner',
    trend: [91.2, 90.8, 90.1, 89.3, 88.2, 87.4],
    breakdown: [
      {label: 'Planned', value: 18},
      {label: 'Unplanned', value: 44},
      {label: 'Changeover', value: 25},
      {label: 'Idle', value: 13},
    ],
  },
] satisfies AnalyticsMetric[];

function buildSparkline(values: number[]) {
  const width = 180;
  const height = 62;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = values.length > 1 ? width / (values.length - 1) : width;
  const points = values.map((value, index) => {
    const normalized = max === min ? 0.5 : (value - min) / (max - min);
    const x = index * step;
    const y = height - 8 - normalized * (height - 16);
    return `${x},${y}`;
  });

  return {
    width,
    height,
    linePath: `M ${points.join(' L ')}`,
    areaPath: `M 0,${height - 6} L ${points.join(' L ')} L ${width},${height - 6} Z`,
  };
}

export default function MaintenanceAnalyticsWidget({className, style, onExpand}: WorkstationWidgetProps) {
  const notifications = useWidgetNotifications(maintenanceAnalyticsNotificationConfig);
  const [selectedLabel, setSelectedLabel] = useState(analyticsMetrics[0].label);
  const selectedMetric = useMemo(
    () => analyticsMetrics.find((metric) => metric.label === selectedLabel) ?? analyticsMetrics[0],
    [selectedLabel],
  );
  const sparkline = useMemo(() => buildSparkline(selectedMetric.trend), [selectedMetric]);
  const maxBreakdown = Math.max(...selectedMetric.breakdown.map((item) => item.value));

  const headerAction = (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
      <WidgetNotificationBell active={notifications.active} onClick={notifications.openDialog} size={24} />
        <IconButton size="small" aria-label="Open Maintenance Performance" onClick={onExpand} sx={{width: 24, height: 24, p: 0, color: tokenBrand.main}}>
          <NorthEastIcon sx={{fontSize: 18}} />
        </IconButton>
    </Box>
  );

  return (
    <>
      <WidgetShell
        title="Maintenance Analytics"
        action={headerAction}
        className={className}
        style={style}
      >
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.1, minHeight: 0, overflow: 'auto', pr: 0.2}}>
        <Box
          sx={{
            border: `1px solid ${tokenError.lighter}`,
            borderRadius: '8px',
            bgcolor: tokenError.softBg,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.4,
          }}
        >
          <Box sx={{minWidth: 0}}>
            <Typography sx={{fontSize: '0.68rem', color: workstationVisuals.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, fontFamily: workstationVisuals.fontFamily}}>
              KPI Requiring Attention
            </Typography>
            <Typography sx={{fontSize: '1.32rem', color: tokenError.main, fontWeight: 800, lineHeight: 1.05, mt: 0.45, fontFamily: workstationVisuals.fontFamily}}>
              PM Compliance ↓
            </Typography>
          </Box>
          <Typography sx={{fontSize: '0.7rem', color: tokenError.main, fontWeight: 700, whiteSpace: 'nowrap', fontFamily: workstationVisuals.fontFamily}}>
            -9% MoM
          </Typography>
        </Box>

        <Box>
          <Typography sx={{fontSize: '0.82rem', fontWeight: 600, color: workstationVisuals.textPrimary, mb: 0.8, fontFamily: workstationVisuals.fontFamily}}>
            Critical Metrics
          </Typography>
          <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1}}>
            {analyticsMetrics.map((metric) => {
              const isSelected = metric.label === selectedMetric.label;

              return (
                <Box
                  key={metric.label}
                  component="button"
                  type="button"
                  onClick={() => setSelectedLabel(metric.label)}
                  aria-pressed={isSelected}
                  sx={{
                    border: isSelected ? `1px solid ${metric.color}` : '1px solid rgba(15, 23, 42, 0.06)',
                    borderRadius: '8px',
                    bgcolor: isSelected ? tokenNeutral.lightest : tokenCommon.white,
                    p: 0.9,
                    minWidth: 0,
                    textAlign: 'left',
                    cursor: 'pointer',
                    boxShadow: isSelected ? `inset 0 0 0 1px ${metric.color}` : 'none',
                    transition: 'border-color 140ms ease, box-shadow 140ms ease, background-color 140ms ease',
                    '&:hover': {
                      borderColor: metric.color,
                      bgcolor: tokenNeutral.lightest,
                    },
                    '&:focus-visible': {
                      outline: `2px solid ${tokenBrand.main}`,
                      outlineOffset: 2,
                    },
                  }}
                >
                  <Typography sx={{fontSize: '0.62rem', color: workstationVisuals.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: workstationVisuals.fontFamily}}>
                    {metric.label}
                  </Typography>
                  <Box sx={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 0.8, mt: 0.55}}>
                    <Typography sx={{fontSize: '1.02rem', color: metric.color, fontWeight: 800, lineHeight: 1.1, fontFamily: workstationVisuals.fontFamily}}>
                      {metric.value}
                    </Typography>
                    <Typography sx={{fontSize: '0.64rem', color: metric.deltaColor, fontWeight: 700, lineHeight: 1, whiteSpace: 'nowrap', fontFamily: workstationVisuals.fontFamily}}>
                      {metric.delta}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        <Box sx={{border: '1px solid rgba(15, 23, 42, 0.06)', borderRadius: '8px', bgcolor: tokenCommon.white, p: 0.95, minHeight: 0}}>
          <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2, mb: 0.75}}>
            <Box sx={{minWidth: 0}}>
              <Typography sx={{fontSize: '0.82rem', fontWeight: 700, color: workstationVisuals.textPrimary, lineHeight: 1.2, fontFamily: workstationVisuals.fontFamily}}>
                {selectedMetric.label} Details
              </Typography>
              <Typography sx={{fontSize: '0.68rem', color: workstationVisuals.textSecondary, mt: 0.3, lineHeight: 1.25, fontFamily: workstationVisuals.fontFamily}}>
                Target {selectedMetric.target} - Owner: {selectedMetric.owner}
              </Typography>
              <Typography sx={{fontSize: '0.67rem', color: workstationVisuals.textSecondary, mt: 0.35, lineHeight: 1.28, fontFamily: workstationVisuals.fontFamily}}>
                {selectedMetric.insight}
              </Typography>
            </Box>
            <Box sx={{px: 0.8, py: 0.45, borderRadius: '8px', bgcolor: selectedMetric.color === tokenError.main ? tokenError.softBg : tokenWarning.softBg, color: selectedMetric.color, fontSize: '0.68rem', fontWeight: 800, lineHeight: 1, fontFamily: workstationVisuals.fontFamily, whiteSpace: 'nowrap'}}>
              {selectedMetric.delta}
            </Box>
          </Box>

          <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 0.95fr)', gap: 1.2, '@container (max-width: 520px)': {gridTemplateColumns: '1fr'}}}>
            <Box sx={{minWidth: 0}}>
              <Typography sx={{fontSize: '0.68rem', color: workstationVisuals.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3, mb: 0.5, fontFamily: workstationVisuals.fontFamily}}>
                6-week trend
              </Typography>
              <Box sx={{height: 54, borderRadius: '8px', bgcolor: tokenNeutral.lightest, border: '1px solid rgba(15, 23, 42, 0.05)', p: 0.75}}>
                <svg viewBox={`0 0 ${sparkline.width} ${sparkline.height}`} width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">
                  <line x1="0" y1="10" x2={sparkline.width} y2="10" stroke="rgba(100,116,139,0.18)" strokeWidth="1" />
                  <line x1="0" y1={sparkline.height / 2} x2={sparkline.width} y2={sparkline.height / 2} stroke="rgba(100,116,139,0.18)" strokeWidth="1" />
                  <line x1="0" y1={sparkline.height - 6} x2={sparkline.width} y2={sparkline.height - 6} stroke="rgba(100,116,139,0.18)" strokeWidth="1" />
                  <path d={sparkline.areaPath} fill={selectedMetric.color === tokenError.main ? tokenError.softBg : tokenWarning.softBg} />
                  <path d={sparkline.linePath} fill="none" stroke={selectedMetric.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Box>
            </Box>

            <Box sx={{minWidth: 0}}>
              <Typography sx={{fontSize: '0.68rem', color: workstationVisuals.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3, mb: 0.65, fontFamily: workstationVisuals.fontFamily}}>
                Driver mix
              </Typography>
              <Box sx={{display: 'grid', gap: 0.45}}>
                {selectedMetric.breakdown.map((item) => (
                  <Box key={item.label}>
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.18}}>
                      <Typography sx={{fontSize: '0.65rem', color: workstationVisuals.textPrimary, fontWeight: 700, lineHeight: 1.1, fontFamily: workstationVisuals.fontFamily}}>
                        {item.label}
                      </Typography>
                      <Typography sx={{fontSize: '0.63rem', color: workstationVisuals.textSecondary, fontWeight: 700, lineHeight: 1, fontFamily: workstationVisuals.fontFamily}}>
                        {item.value}%
                      </Typography>
                    </Box>
                    <Box sx={{height: 5, borderRadius: 999, bgcolor: 'rgba(15, 23, 42, 0.06)', overflow: 'hidden'}}>
                      <Box sx={{height: '100%', width: `${(item.value / maxBreakdown) * 100}%`, borderRadius: 999, bgcolor: selectedMetric.color}} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      </WidgetShell>
      <WidgetNotificationsDialog
        active={notifications.active}
        config={maintenanceAnalyticsNotificationConfig}
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
