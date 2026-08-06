import {Box, Chip, Divider, Typography} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  DragIndicator as DragIndicatorIcon,
  Error as ErrorIcon,
  PrecisionManufacturing as MachineIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import type {MachineWorkOrder, V2ColumnLine, V2TimeSlot} from '../types';

type Props = {
  visible: boolean;
  wo: MachineWorkOrder | null;
  targetMachineId: string | null;
  lines: V2ColumnLine[];
  workOrders: MachineWorkOrder[];
  slots: V2TimeSlot[];
};

const woStatusColors: Record<string, {bg: string; border: string; text: string}> = {
  Running: {bg: '#DCFCE7', border: '#16A34A', text: '#15803D'},
  Released: {bg: '#DBEAFE', border: '#2563EB', text: '#1D4ED8'},
  Ready: {bg: '#E0F2FE', border: '#0284C7', text: '#0369A1'},
  Planned: {bg: '#EEF2FF', border: '#6366F1', text: '#4338CA'},
  Blocked: {bg: '#FEE2E2', border: '#DC2626', text: '#B91C1C'},
  OnHold: {bg: '#FEF3C7', border: '#D97706', text: '#92400E'},
  Paused: {bg: '#F3F4F6', border: '#6B7280', text: '#374151'},
  Completed: {bg: '#F0FDF4', border: '#86EFAC', text: '#15803D'},
};

const riskColors: Record<string, string> = {
  None: '#16A34A',
  Low: '#16A34A',
  Medium: '#D97706',
  High: '#DC2626',
};

function formatDurationH(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

type MetricRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
};

function MetricRow({icon, label, value, valueColor = '#E2E8F0'}: MetricRowProps) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, py: 0.35}}>
      <Box sx={{color: 'var(--planning-text-secondary)', display: 'flex', flexShrink: 0}}>{icon}</Box>
      <Typography sx={{fontSize: 10, color: 'var(--planning-text-muted)', flex: 1, lineHeight: 1.3}}>{label}</Typography>
      <Typography sx={{fontSize: 10, fontWeight: 800, color: valueColor, lineHeight: 1.3}}>{value}</Typography>
    </Box>
  );
}

export default function WoDragInfoPanel({visible, wo, targetMachineId, lines, workOrders, slots}: Props) {
  if (!visible || !wo) return null;

  const statusColors = woStatusColors[wo.status] ?? woStatusColors.Planned;
  const totalSlotHours = slots.length;

  const targetMachine = targetMachineId
    ? lines.flatMap((l) => l.machines).find((m) => m.id === targetMachineId) ?? null
    : null;

  const targetMachineWos = targetMachineId
    ? workOrders.filter((w) => w.machineId === targetMachineId)
    : [];

  const allocatedHours = targetMachineWos.reduce((sum, w) => {
    const ms = new Date(w.plannedEndDateTime).getTime() - new Date(w.plannedStartDateTime).getTime();
    return sum + ms / 3600000;
  }, 0);

  const remainingHours = Math.max(0, totalSlotHours - allocatedHours - wo.durationHours);
  const utilAfterDrop = targetMachine
    ? Math.min(100, Math.round(((allocatedHours + wo.durationHours) / totalSlotHours) * 100))
    : null;

  const capacityStatus =
    utilAfterDrop == null
      ? null
      : utilAfterDrop >= 95
        ? 'overloaded'
        : utilAfterDrop >= 80
          ? 'tight'
          : 'ok';

  const idleEstimateMin = targetMachine
    ? Math.max(0, Math.round(remainingHours * 60 * 0.12))
    : null;

  const riskLevel =
    wo.materialRisk === 'High' || wo.qualityRisk === 'High' || wo.laborRisk === 'High'
      ? 'High'
      : wo.materialRisk === 'Medium' || wo.qualityRisk === 'Medium' || wo.laborRisk === 'Medium'
        ? 'Medium'
        : 'None';

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 72,
        right: 16,
        zIndex: 1600,
        width: 256,
        bgcolor: 'rgba(15, 23, 42, 0.94)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(99, 102, 241, 0.35)',
        borderRadius: 2,
        overflow: 'hidden',
        pointerEvents: 'none',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        animation: 'woDragFadeIn 0.15s ease-out',
        '@keyframes woDragFadeIn': {
          from: {opacity: 0, transform: 'translateY(-6px) scale(0.97)'},
          to: {opacity: 1, transform: 'translateY(0) scale(1)'},
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 1.5,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          bgcolor: 'rgba(99, 102, 241, 0.12)',
          borderBottom: '1px solid rgba(99,102,241,0.2)',
        }}
      >
        <DragIndicatorIcon sx={{fontSize: 14, color: '#818CF8'}} />
        <Typography sx={{fontSize: 10, fontWeight: 800, color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.07em', flex: 1}}>
          Placing Work Order
        </Typography>
        <Chip
          label={wo.status}
          size="small"
          sx={{
            fontSize: 8,
            height: 16,
            fontWeight: 800,
            bgcolor: statusColors.bg,
            color: statusColors.text,
            border: `1px solid ${statusColors.border}`,
          }}
        />
      </Box>

      {/* WO Info */}
      <Box sx={{px: 1.5, pt: 1, pb: 0.75}}>
        <Typography sx={{fontSize: 13, fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.01em', lineHeight: 1.2}}>
          {wo.woNumber}
        </Typography>
        <Typography sx={{fontSize: 10, color: 'var(--planning-text-muted)', mt: 0.25, lineHeight: 1.3}}>
          {wo.productCode}
          {wo.productDescription ? ` · ${wo.productDescription}` : ''}
        </Typography>

        <Box sx={{mt: 1, display: 'flex', flexDirection: 'column', gap: 0}}>
          <MetricRow
            icon={<AccessTimeIcon sx={{fontSize: 11}} />}
            label="Duration"
            value={formatDurationH(wo.durationHours)}
          />
          <MetricRow
            icon={<ScheduleIcon sx={{fontSize: 11}} />}
            label="Changeover / Setup"
            value={wo.setupRequired ? formatMinutes(wo.setupMinutes) : '—'}
            valueColor={wo.setupRequired ? '#FCD34D' : '#64748B'}
          />
          {riskLevel !== 'None' && (
            <MetricRow
              icon={<WarningIcon sx={{fontSize: 11}} />}
              label="Risk level"
              value={riskLevel}
              valueColor={riskColors[riskLevel]}
            />
          )}
        </Box>
      </Box>

      <Divider sx={{borderColor: 'rgba(255,255,255,0.07)'}} />

      {/* Target Machine Section */}
      <Box sx={{px: 1.5, pt: 0.75, pb: 1}}>
        {targetMachine ? (
          <>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75}}>
              <MachineIcon sx={{fontSize: 11, color: '#60A5FA'}} />
              <Typography sx={{fontSize: 10, fontWeight: 800, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.06em', flex: 1}}>
                Target Machine
              </Typography>
            </Box>

            <Typography sx={{fontSize: 11, fontWeight: 800, color: '#E2E8F0', lineHeight: 1.2, mb: 0.75}}>
              {targetMachine.label}
            </Typography>

            <Box sx={{display: 'flex', flexDirection: 'column', gap: 0}}>
              <MetricRow
                icon={<ScheduleIcon sx={{fontSize: 11}} />}
                label="Current utilization"
                value={`${targetMachine.utilizationPercent}%`}
                valueColor={
                  targetMachine.utilizationPercent >= 90
                    ? '#F87171'
                    : targetMachine.utilizationPercent >= 75
                      ? '#FCD34D'
                      : '#4ADE80'
                }
              />
              <MetricRow
                icon={<AccessTimeIcon sx={{fontSize: 11}} />}
                label="Remaining capacity"
                value={formatDurationH(Math.max(0, totalSlotHours - allocatedHours))}
                valueColor={
                  totalSlotHours - allocatedHours < wo.durationHours
                    ? '#F87171'
                    : '#4ADE80'
                }
              />
              {idleEstimateMin !== null && (
                <MetricRow
                  icon={<AccessTimeIcon sx={{fontSize: 11}} />}
                  label="Est. idle after placement"
                  value={idleEstimateMin > 0 ? formatMinutes(idleEstimateMin) : '< 5m'}
                  valueColor={idleEstimateMin < 15 ? '#FCD34D' : '#94A3B8'}
                />
              )}
            </Box>

            {/* Capacity fit indicator */}
            {capacityStatus && utilAfterDrop !== null && (
              <Box
                sx={{
                  mt: 1,
                  px: 1,
                  py: 0.6,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  bgcolor:
                    capacityStatus === 'overloaded'
                      ? 'rgba(239,68,68,0.15)'
                      : capacityStatus === 'tight'
                        ? 'rgba(245,158,11,0.15)'
                        : 'rgba(34,197,94,0.12)',
                  border: `1px solid ${
                    capacityStatus === 'overloaded'
                      ? 'rgba(239,68,68,0.3)'
                      : capacityStatus === 'tight'
                        ? 'rgba(245,158,11,0.3)'
                        : 'rgba(34,197,94,0.25)'
                  }`,
                }}
              >
                {capacityStatus === 'overloaded' ? (
                  <ErrorIcon sx={{fontSize: 13, color: '#F87171', flexShrink: 0}} />
                ) : capacityStatus === 'tight' ? (
                  <WarningIcon sx={{fontSize: 13, color: '#FCD34D', flexShrink: 0}} />
                ) : (
                  <CheckCircleIcon sx={{fontSize: 13, color: '#4ADE80', flexShrink: 0}} />
                )}
                <Box sx={{flex: 1, minWidth: 0}}>
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 800,
                      lineHeight: 1.3,
                      color:
                        capacityStatus === 'overloaded'
                          ? '#F87171'
                          : capacityStatus === 'tight'
                            ? '#FCD34D'
                            : '#4ADE80',
                    }}
                  >
                    {capacityStatus === 'overloaded'
                      ? 'Capacity exceeded'
                      : capacityStatus === 'tight'
                        ? 'Tight — review schedule'
                        : 'Fits within capacity'}
                  </Typography>
                  <Typography sx={{fontSize: 9, color: 'var(--planning-text-secondary)', lineHeight: 1.3}}>
                    Utilization after drop: {utilAfterDrop}%
                  </Typography>
                </Box>
              </Box>
            )}
          </>
        ) : (
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, py: 0.5}}>
            <MachineIcon sx={{fontSize: 13, color: '#475569'}} />
            <Typography sx={{fontSize: 10, color: '#475569', fontStyle: 'italic'}}>
              Drag over a machine to see capacity
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
