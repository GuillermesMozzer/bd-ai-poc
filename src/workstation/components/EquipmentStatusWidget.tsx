import {useMemo, useState} from 'react';
import {Box, ButtonBase, IconButton, Tooltip, Typography} from '@mui/material';
import {
  NorthEast as NorthEastIcon,
} from '@mui/icons-material';
import {
  tokenBrand,
  tokenCommon,
  tokenError,
  tokenInfo,
  tokenWarning,
  workstationTableCellSx,
  workstationTableHeaderCellSx,
  workstationTableSx,
  workstationVisuals,
} from '../theme';
import type {WorkstationWidgetProps} from '../types';
import WidgetShell from './WidgetShell';
import {
  equipmentStatusNotificationConfig,
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  useWidgetNotifications,
} from './WidgetNotifications';

type EquipmentMetricId = 'maintenance' | 'blocked' | 'critical' | 'downtime' | 'availability' | 'oee' | 'changes';
type EquipmentTone = 'error' | 'warning' | 'info';

const equipmentMetrics: Array<{id: EquipmentMetricId; label: string; value: string; color: string}> = [
  {id: 'maintenance', label: 'In Maintenance', value: '6', color: tokenBrand.main},
  {id: 'blocked', label: 'Blocked', value: '3', color: tokenWarning.main},
  {id: 'critical', label: 'Critical Condition', value: '2', color: tokenError.main},
  {id: 'downtime', label: 'Current Downtime', value: '11h 24m', color: tokenError.main},
  {id: 'changes', label: 'Recent Status Changes', value: '9', color: tokenBrand.main},
];

const equipmentRows: Array<{
  equipment: string;
  status: string;
  downtime: string;
  tone: EquipmentTone;
  metrics: EquipmentMetricId[];
}> = [
  {equipment: 'Crusher CR-01', status: 'Down - Mechanical Failure', downtime: '5h 12m', tone: 'error', metrics: ['critical', 'downtime', 'changes', 'availability', 'oee']},
  {equipment: 'Mixer MX-07', status: 'Blocked - Safety Interlock', downtime: '6h 31m', tone: 'warning', metrics: ['blocked', 'downtime', 'changes', 'availability', 'oee']},
  {equipment: 'Labeler LB-03', status: 'Blocked - QA Hold', downtime: '9h 53m', tone: 'warning', metrics: ['blocked', 'downtime', 'changes', 'availability', 'oee']},
  {equipment: 'Compressor C-04', status: 'Blocked - Awaiting Parts', downtime: '1d 4h', tone: 'warning', metrics: ['blocked', 'downtime', 'changes', 'availability', 'oee']},
  {equipment: 'Pump P-101', status: 'Critical Condition - Vibration', downtime: 'Online', tone: 'error', metrics: ['critical', 'changes', 'availability', 'oee']},
  {equipment: 'Boiler B-01', status: 'In Maintenance - Scheduled', downtime: '2h 40m', tone: 'info', metrics: ['maintenance', 'downtime', 'changes']},
  {equipment: 'Filler FL-09', status: 'In Maintenance - Inspection', downtime: '1h 36m', tone: 'info', metrics: ['maintenance', 'downtime', 'changes']},
  {equipment: 'Palletizer PL-02', status: 'In Maintenance - Calibration', downtime: '58m', tone: 'info', metrics: ['maintenance', 'downtime', 'changes']},
  {equipment: 'Vision System VS-05', status: 'In Maintenance - Sensor Cleaning', downtime: '42m', tone: 'info', metrics: ['maintenance', 'downtime']},
  {equipment: 'Wrapper WP-11', status: 'In Maintenance - Guard Repair', downtime: '35m', tone: 'info', metrics: ['maintenance', 'downtime']},
  {equipment: 'Case Packer CP-06', status: 'In Maintenance - PM Window', downtime: '9m', tone: 'info', metrics: ['maintenance']},
  {equipment: 'Conveyor C-12', status: 'Reduced Output', downtime: 'Online', tone: 'warning', metrics: ['availability', 'changes', 'oee']},
] as const;

function getDowntimeBadgeSx(tone: EquipmentTone) {
  const palette = {
    error: {bg: tokenError.softBg, color: tokenError.main, border: tokenError.lighter},
    warning: {bg: tokenWarning.softBg, color: tokenWarning.main, border: tokenWarning.lighter},
    info: {bg: tokenBrand.softBg, color: tokenBrand.main, border: tokenInfo.lightest},
  }[tone];

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 54,
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

export default function EquipmentStatusWidget({className, style, onExpand}: WorkstationWidgetProps) {
  const notifications = useWidgetNotifications(equipmentStatusNotificationConfig);
  const [selectedMetric, setSelectedMetric] = useState<EquipmentMetricId | null>(null);
  const visibleRows = useMemo(
    () => selectedMetric ? equipmentRows.filter((row) => row.metrics.includes(selectedMetric)) : equipmentRows,
    [selectedMetric],
  );
  const selectedMetricLabel = selectedMetric ? equipmentMetrics.find((metric) => metric.id === selectedMetric)?.label : null;

  const headerAction = (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
      <WidgetNotificationBell active={notifications.active} onClick={notifications.openDialog} size={24} />
      <IconButton size="small" aria-label="Open Equipment Ledger" onClick={onExpand} sx={{width: 24, height: 24, p: 0, color: tokenBrand.main}}>
        <NorthEastIcon sx={{fontSize: 18}} />
      </IconButton>
    </Box>
  );

  return (
    <>
      <WidgetShell
        title={
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7}}>
            <Typography sx={{fontSize: '0.92rem', fontWeight: 600, color: workstationVisuals.textPrimary, fontFamily: workstationVisuals.fontFamily, lineHeight: 1.2}}>
              Equipment Status
            </Typography>
            <Tooltip title="Metrics scoped to Line 10" arrow>
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: 22,
                  px: 0.85,
                  borderRadius: '8px',
                  bgcolor: tokenBrand.softBg,
                  border: `1px solid ${tokenBrand.selectedBg}`,
                  color: tokenBrand.main,
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  fontFamily: workstationVisuals.fontFamily,
                }}
              >
                Line 10
              </Box>
            </Tooltip>
          </Box>
        }
        action={headerAction}
        className={className}
        style={style}
      >
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 1, minHeight: 0, height: '100%', overflowY: 'auto', pr: 0.3}}>
        <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1, flexShrink: 0, '@container (max-width: 420px)': {gridTemplateColumns: '1fr'}}}>
          <Box
            sx={{
              border: `1px solid ${tokenBrand.lightest}`,
              borderRadius: '8px',
              bgcolor: tokenBrand.softBg,
              p: 1.2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Box sx={{minWidth: 0}}>
              <Typography sx={{fontSize: '0.66rem', color: workstationVisuals.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, fontFamily: workstationVisuals.fontFamily}}>
                Line Equipment OEE
              </Typography>
              <Typography sx={{fontSize: '1.42rem', color: tokenBrand.main, fontWeight: 800, lineHeight: 1.05, mt: 0.55, fontFamily: workstationVisuals.fontFamily}}>
                81.2%
              </Typography>
            </Box>
            <Typography sx={{fontSize: '0.68rem', color: tokenBrand.main, fontWeight: 700, whiteSpace: 'nowrap', fontFamily: workstationVisuals.fontFamily}}>
              -1.4% vs target
            </Typography>
          </Box>
          <Box
            sx={{
              border: `1px solid ${tokenWarning.lighter}`,
              borderRadius: '8px',
              bgcolor: tokenWarning.softBg,
              p: 1.2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Box sx={{minWidth: 0}}>
              <Typography sx={{fontSize: '0.66rem', color: workstationVisuals.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, fontFamily: workstationVisuals.fontFamily}}>
                Line Equipment Availability
              </Typography>
              <Typography sx={{fontSize: '1.42rem', color: tokenWarning.main, fontWeight: 800, lineHeight: 1.05, mt: 0.55, fontFamily: workstationVisuals.fontFamily}}>
                87.4%
              </Typography>
            </Box>
            <Typography sx={{fontSize: '0.68rem', color: tokenWarning.main, fontWeight: 700, whiteSpace: 'nowrap', fontFamily: workstationVisuals.fontFamily}}>
              -2.1% vs last week
            </Typography>
          </Box>
        </Box>

        <Box sx={{flexShrink: 0}}>
          <Typography sx={{fontSize: '0.82rem', fontWeight: 600, color: workstationVisuals.textPrimary, mb: 0.8, fontFamily: workstationVisuals.fontFamily}}>
            Critical Metrics
          </Typography>
          <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(5, minmax(116px, 1fr))', gap: 0.8, overflowX: 'auto'}}>
            {equipmentMetrics.map((metric) => (
              <ButtonBase
                key={metric.label}
                onClick={() => setSelectedMetric((current) => current === metric.id ? null : metric.id)}
                sx={{
                  display: 'block',
                  textAlign: 'left',
                  border: `1px solid ${selectedMetric === metric.id ? metric.color : workstationVisuals.tierBorder}`,
                  borderRadius: '8px',
                  bgcolor: selectedMetric === metric.id ? `color-mix(in srgb, ${metric.color} 5%, transparent)` : 'background.paper',
                  px: 1,
                  py: 0.85,
                  minWidth: 0,
                  width: '100%',
                  transition: 'border-color 140ms ease, background-color 140ms ease, box-shadow 140ms ease',
                  '&:hover': {
                    borderColor: metric.color,
                    bgcolor: `color-mix(in srgb, ${metric.color} 5%, transparent)`,
                  },
                  '&:focus-visible': {
                    outline: `2px solid ${metric.color}`,
                    outlineOffset: 2,
                  },
                }}
              >
                <Typography sx={{fontSize: '0.62rem', color: workstationVisuals.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: workstationVisuals.fontFamily}}>
                  {metric.label}
                </Typography>
                <Typography sx={{fontSize: '0.98rem', color: metric.color, fontWeight: 800, lineHeight: 1.1, mt: 0.45, fontFamily: workstationVisuals.fontFamily}}>
                  {metric.value}
                </Typography>
              </ButtonBase>
            ))}
          </Box>
        </Box>

        <Box sx={{flex: '1 0 230px', minHeight: 230}}>
          <Typography sx={{fontSize: '0.82rem', fontWeight: 600, color: workstationVisuals.textPrimary, mb: 0.8, fontFamily: workstationVisuals.fontFamily}}>
            {selectedMetricLabel ? `${selectedMetricLabel} Equipment` : 'Equipment Requiring Attention'}
          </Typography>
          <Box sx={{border: `1px solid ${workstationVisuals.tierBorder}`, borderRadius: '8px', overflow: 'hidden', bgcolor: 'background.paper'}}>
            <Box sx={{height: 220, overflowY: 'auto'}}>
            <Box component="table" sx={{...workstationTableSx, tableLayout: 'fixed'}}>
              <thead>
                <tr>
                  <Box component="th" sx={{...workstationTableHeaderCellSx, px: 1.2, width: '32%'}}>Equipment</Box>
                  <Box component="th" sx={workstationTableHeaderCellSx}>Status</Box>
                  <Box component="th" sx={{...workstationTableHeaderCellSx, px: 1.2, textAlign: 'right', width: 92}}>Downtime</Box>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr key={row.equipment}>
                    <Box component="td" sx={{...workstationTableCellSx, px: 1.2, fontSize: '0.76rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                      {row.equipment}
                    </Box>
                    <Box component="td" sx={{...workstationTableCellSx, color: workstationVisuals.textSecondary, fontSize: '0.74rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                      {row.status}
                    </Box>
                    <Box component="td" sx={{...workstationTableCellSx, px: 1.2, textAlign: 'right'}}>
                      <Box component="span" sx={getDowntimeBadgeSx(row.tone)}>{row.downtime}</Box>
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
        config={equipmentStatusNotificationConfig}
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
