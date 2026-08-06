import {useMemo, useState} from 'react';
import {Box, ButtonBase, IconButton, Typography} from '@mui/material';
import {
  NorthEast as NorthEastIcon,
} from '@mui/icons-material';
import {
  tokenBrand,
  tokenCommon,
  tokenError,
  tokenWarning,
  workstationTableCellSx,
  workstationTableHeaderCellSx,
  workstationTableSx,
  workstationVisuals,
} from '../theme';
import type {WorkstationWidgetProps} from '../types';
import WidgetShell from './WidgetShell';
import {
  maintenanceCbmPdmNotificationConfig,
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  useWidgetNotifications,
} from './WidgetNotifications';

type HighRiskAsset = {
  asset: string;
  risk: string;
  ettf: string;
  tone: 'error' | 'warning' | 'brand';
  metrics: string[];
};

const cbmPdmMetrics = [
  {label: 'Assets Being Monitored', value: '148', color: tokenBrand.main},
  {label: 'Active Failures', value: '4', color: tokenError.main},
  {label: 'Critical Sensor Deviations', value: '12', color: tokenWarning.main},
  {label: 'High Failure Probability', value: '6', color: tokenError.main},
  {label: 'Urgent MRs/WOs', value: '9', color: tokenWarning.main},
  {label: 'Alerts Without WO', value: '5', color: tokenWarning.main},
];

const highRiskAssets = [
  {asset: 'Motor M-08', risk: 'Failure Risk 82% - Bearing Wear', ettf: '<48h', tone: 'error', metrics: ['Assets Being Monitored', 'Active Failures', 'Critical Sensor Deviations', 'High Failure Probability', 'Urgent MRs/WOs']},
  {asset: 'Pump P-101', risk: 'High Vibration - Trend Up', ettf: '<72h', tone: 'error', metrics: ['Assets Being Monitored', 'Active Failures', 'Critical Sensor Deviations', 'High Failure Probability', 'Urgent MRs/WOs']},
  {asset: 'Gearbox G-14', risk: 'Oil Particle Count Above Limit', ettf: '~5d', tone: 'warning', metrics: ['Assets Being Monitored', 'Critical Sensor Deviations', 'High Failure Probability', 'Alerts Without WO']},
  {asset: 'Fan F-22', risk: 'Temperature Drift', ettf: '~7d', tone: 'warning', metrics: ['Assets Being Monitored', 'Critical Sensor Deviations', 'Alerts Without WO']},
  {asset: 'Compressor C-04', risk: 'Pressure Variance', ettf: '~10d', tone: 'brand', metrics: ['Assets Being Monitored', 'Alerts Without WO']},
  {asset: 'Bearing BR-22', risk: 'Thermal Spike - Inspect Lubrication', ettf: '~4d', tone: 'warning', metrics: ['Assets Being Monitored', 'Critical Sensor Deviations', 'Urgent MRs/WOs']},
  {asset: 'Conveyor CV-210', risk: 'Sensor Alert Without WO', ettf: '~6d', tone: 'warning', metrics: ['Assets Being Monitored', 'Alerts Without WO']},
  {asset: 'Robot RB-402', risk: 'Servo Load Above Baseline', ettf: '~8d', tone: 'brand', metrics: ['Assets Being Monitored', 'High Failure Probability']},
] satisfies HighRiskAsset[];

function getEttfBadgeSx(tone: typeof highRiskAssets[number]['tone']) {
  const palette = {
    error: {bg: tokenError.softBg, color: tokenError.main, border: tokenError.lighter},
    warning: {bg: tokenWarning.softBg, color: tokenWarning.main, border: tokenWarning.lighter},
    brand: {bg: tokenBrand.softBg, color: tokenBrand.main, border: tokenBrand.lightest},
  }[tone];

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    borderRadius: '8px',
    px: 0.8,
    py: 0.28,
    bgcolor: palette.bg,
    color: palette.color,
    border: `1px solid ${palette.border}`,
    fontSize: '0.68rem',
    fontWeight: 700,
    lineHeight: 1,
    fontFamily: workstationVisuals.fontFamily,
  } as const;
}

export default function MaintenanceCbmPdmWidget({className, style, onExpand}: WorkstationWidgetProps) {
  const notifications = useWidgetNotifications(maintenanceCbmPdmNotificationConfig);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const visibleAssets = useMemo(
    () => selectedMetric ? highRiskAssets.filter((asset) => asset.metrics.includes(selectedMetric)) : highRiskAssets,
    [selectedMetric],
  );

  const headerAction = (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
      <WidgetNotificationBell active={notifications.active} onClick={notifications.openDialog} size={24} />
        <IconButton size="small" aria-label="Open CBM & PdM" onClick={onExpand} sx={{width: 24, height: 24, p: 0, color: tokenBrand.main}}>
          <NorthEastIcon sx={{fontSize: 18}} />
        </IconButton>
    </Box>
  );

  return (
    <>
      <WidgetShell
        title="CBM & PdM"
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
              Critical Condition Alerts
            </Typography>
            <Typography sx={{fontSize: '1.32rem', color: tokenError.main, fontWeight: 800, lineHeight: 1.05, mt: 0.45, fontFamily: workstationVisuals.fontFamily}}>
              7
            </Typography>
          </Box>
          <Typography sx={{fontSize: '0.7rem', color: tokenError.main, fontWeight: 700, whiteSpace: 'nowrap', fontFamily: workstationVisuals.fontFamily}}>
            +3 in last 24h
          </Typography>
        </Box>

        <Box>
          <Typography sx={{fontSize: '0.82rem', fontWeight: 600, color: workstationVisuals.textPrimary, mb: 0.8, fontFamily: workstationVisuals.fontFamily}}>
            Critical Metrics
          </Typography>
          <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1}}>
            {cbmPdmMetrics.map((metric) => {
              const isSelected = selectedMetric === metric.label;

              return (
                <ButtonBase
                  key={metric.label}
                  onClick={() => setSelectedMetric((current) => current === metric.label ? null : metric.label)}
                  aria-pressed={isSelected}
                  sx={{
                    display: 'block',
                    border: isSelected ? `1px solid ${metric.color}` : `1px solid ${workstationVisuals.tierBorder}`,
                    borderRadius: '8px',
                    bgcolor: isSelected ? `color-mix(in srgb, ${metric.color} 5%, transparent)` : 'background.paper',
                    p: 0.9,
                    minWidth: 0,
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer',
                    boxShadow: isSelected ? `inset 0 0 0 1px ${metric.color}` : 'none',
                    transition: 'border-color 140ms ease, box-shadow 140ms ease, background-color 140ms ease',
                    '&:hover': {borderColor: metric.color, bgcolor: `color-mix(in srgb, ${metric.color} 5%, transparent)`},
                    '&:focus-visible': {outline: `2px solid ${tokenBrand.main}`, outlineOffset: 2},
                  }}
                >
                  <Typography sx={{fontSize: '0.62rem', color: workstationVisuals.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: workstationVisuals.fontFamily}}>
                    {metric.label}
                  </Typography>
                  <Typography sx={{fontSize: '1.02rem', color: metric.color, fontWeight: 800, lineHeight: 1.1, mt: 0.55, fontFamily: workstationVisuals.fontFamily}}>
                    {metric.value}
                  </Typography>
                </ButtonBase>
              );
            })}
          </Box>
        </Box>

        <Box sx={{flex: '1 0 190px', minHeight: 190}}>
          <Typography sx={{fontSize: '0.82rem', fontWeight: 600, color: workstationVisuals.textPrimary, mb: 0.8, fontFamily: workstationVisuals.fontFamily}}>
            {selectedMetric ? `${selectedMetric} Assets` : 'High-Risk Assets'}
          </Typography>
          <Box sx={{border: `1px solid ${workstationVisuals.tierBorder}`, borderRadius: '8px', overflow: 'hidden', bgcolor: 'background.paper'}}>
            <Box sx={{height: 164, overflowY: 'auto'}}>
              <Box component="table" sx={{...workstationTableSx, tableLayout: 'fixed'}}>
                <thead>
                  <tr>
                    <Box component="th" sx={{...workstationTableHeaderCellSx, px: 1.2, width: '32%'}}>Asset</Box>
                    <Box component="th" sx={workstationTableHeaderCellSx}>Risk</Box>
                    <Box component="th" sx={{...workstationTableHeaderCellSx, px: 1.2, textAlign: 'right', width: 92}}>ETTF</Box>
                  </tr>
                </thead>
                <tbody>
                  {visibleAssets.map((row) => (
                    <tr key={row.asset}>
                      <Box component="td" sx={{...workstationTableCellSx, px: 1.2, fontSize: '0.76rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {row.asset}
                      </Box>
                      <Box component="td" sx={{...workstationTableCellSx, color: workstationVisuals.textSecondary, fontSize: '0.74rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {row.risk}
                      </Box>
                      <Box component="td" sx={{...workstationTableCellSx, px: 1.2, textAlign: 'right'}}>
                        <Box component="span" sx={getEttfBadgeSx(row.tone)}>{row.ettf}</Box>
                      </Box>
                    </tr>
                  ))}
                </tbody>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      </WidgetShell>
      <WidgetNotificationsDialog
        active={notifications.active}
        config={maintenanceCbmPdmNotificationConfig}
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
