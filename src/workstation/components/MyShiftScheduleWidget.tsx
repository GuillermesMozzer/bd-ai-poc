import type { CSSProperties, ReactNode } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import {
  CheckCircleOutline as CheckCircleIcon,
  CoffeeOutlined as BreakIcon,
  FactoryOutlined as FactoryIcon,
  LunchDiningOutlined as MealIcon,
  OpenInFull as OpenInFullIcon,
  Place as LocationPinIcon,
} from '@mui/icons-material';
import {
  tokenBrand,
  tokenCommon,
  tokenSuccess,
  workstationStatusPillSx,
  workstationVisuals,
} from '../theme';
import WidgetShell from './WidgetShell';
import { useWorkstationContext } from '../contexts/WorkstationContext';
import {
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  shiftScheduleNotificationConfig,
  useWidgetNotifications,
} from './WidgetNotifications';

type MyShiftScheduleWidgetProps = {
  className?: string;
  style?: CSSProperties;
  timeframe?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'shift';
  shift?: string;
  onViewModeChange?: (viewMode: 'graph' | 'table') => void;
  onExpand?: () => void;
  domain?: string;
};

const summaryMetrics = [
  { value: '6:00 AM - 2:00 PM', label: "Today's Shift", note: 'Line 10 - Zone 2 / Z2-WC01', color: workstationVisuals.textPrimary },
  { value: '34 / 40 h', label: 'Weekly Hours', note: '85% scheduled', color: tokenBrand.main },
  { value: '2.5 h', label: 'Overtime', note: 'This week', color: workstationVisuals.textPrimary },
] as const;

const assignmentContext = [
  { label: 'Assigned Line', value: 'Line 10', icon: <FactoryIcon sx={{ fontSize: 17 }} /> },
  { label: 'Assigned Zone', value: 'Zone 2 / Z2-WC01', icon: <LocationPinIcon sx={{ fontSize: 18 }} /> },
] as const;

const sectionHeadingSx = {
  fontSize: '0.82rem',
  color: workstationVisuals.textPrimary,
  fontWeight: 600,
  fontFamily: workstationVisuals.fontFamily,
} as const;

const labelSx = {
  fontSize: '0.72rem',
  color: workstationVisuals.textPrimary,
  fontWeight: 500,
  lineHeight: 1.2,
  fontFamily: workstationVisuals.fontFamily,
} as const;

const metaSx = {
  fontSize: '0.62rem',
  color: workstationVisuals.textSecondary,
  fontFamily: workstationVisuals.fontFamily,
} as const;

export default function MyShiftScheduleWidget({
  className,
  onExpand,
  style,
}: MyShiftScheduleWidgetProps) {
  const notifications = useWidgetNotifications(shiftScheduleNotificationConfig);
  let workstationContext: ReturnType<typeof useWorkstationContext> | null = null;

  try {
    workstationContext = useWorkstationContext();
  } catch {
    workstationContext = null;
  }

  const handleExpand = () => {
    if (workstationContext) {
      workstationContext.setCurrentScreen('shift_schedule_operator');
      return;
    }
    onExpand?.();
  };

  const headerAction = (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
      <WidgetNotificationBell active={notifications.active} onClick={notifications.openDialog} size={24} />
      <IconButton size="small" onClick={handleExpand} sx={{width: 24, height: 24, p: 0, color: tokenBrand.main}}>
        <OpenInFullIcon sx={{fontSize: 16}} />
      </IconButton>
    </Box>
  );

  return (
    <>
      <WidgetShell
        title="My Shift Schedule"
        action={headerAction}
        className={className}
        style={style}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, height: '100%', minHeight: 0, p: 0.5 }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 1,
          flexShrink: 0,
        }}>
          {assignmentContext.map((item) => (
            <Box
              key={item.label}
              sx={{
                minWidth: 0,
                border: `1px solid ${tokenBrand.selectedBg}`,
                borderRadius: '8px',
                p: 1,
                bgcolor: tokenBrand.softBg,
                display: 'grid',
                gridTemplateColumns: '30px minmax(0, 1fr)',
                alignItems: 'center',
                gap: 0.9,
              }}
            >
              <Box sx={{
                width: 30,
                height: 30,
                borderRadius: '8px',
                display: 'grid',
                placeItems: 'center',
                bgcolor: tokenBrand.main,
                color: tokenCommon.white,
              }}>
                {item.icon}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ ...metaSx, color: workstationVisuals.textSecondary, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </Typography>
                <Typography sx={{ fontSize: '0.92rem', color: tokenBrand.main, fontWeight: 700, lineHeight: 1.2, fontFamily: workstationVisuals.fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.value}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{
          border: '1px solid rgba(15, 23, 42, 0.06)',
          borderRadius: '8px',
          p: 1.5,
          bgcolor: tokenCommon.white,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 1,
          flexShrink: 0,
        }}>
          {summaryMetrics.map((metric, index) => (
            <Box
              key={metric.label}
              sx={{
                p: 0.5,
                pl: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderRight: index < summaryMetrics.length - 1 ? '1px solid rgba(15, 23, 42, 0.06)' : 'none',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8 }}>
                <Typography sx={{ fontSize: '1.25rem', color: metric.color, fontWeight: 600, lineHeight: 1, fontFamily: workstationVisuals.fontFamily, flexShrink: 0 }}>
                  {metric.value}
                </Typography>
                <Typography sx={labelSx}>
                  {metric.label}
                </Typography>
              </Box>
              <Typography sx={{ ...metaSx, mt: 0.5 }}>
                {metric.note}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 1.2, flexShrink: 0 }}>
          <InsetSection title="Status">
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 1 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8 }}>
                  <Typography sx={{ fontSize: '1.25rem', color: tokenSuccess.main, fontWeight: 600, lineHeight: 1, fontFamily: workstationVisuals.fontFamily }}>
                    Clocked In
                  </Typography>
                  <Typography sx={labelSx}>
                    Current state
                  </Typography>
                </Box>
                <Typography sx={{ ...metaSx, mt: 0.5 }}>
                  Active in Zone 2 / Z2-WC01
                </Typography>
              </Box>
              <Box sx={{ ...workstationStatusPillSx('success'), borderRadius: '8px' }}>
                <CheckCircleIcon sx={{ fontSize: 14, mr: 0.4 }} />
                Clocked In
              </Box>
            </Box>
          </InsetSection>

          <InsetSection title="Breaks">
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>
              <BreakSummary icon={<BreakIcon sx={{ fontSize: 18 }} />} label="Break" time="9:30 - 9:45 AM" />
              <BreakSummary icon={<MealIcon sx={{ fontSize: 18 }} />} label="Meal" time="12:00 - 12:30 PM" />
            </Box>
          </InsetSection>
        </Box>

        </Box>
      </WidgetShell>
      <WidgetNotificationsDialog
        active={notifications.active}
        config={shiftScheduleNotificationConfig}
        draftState={notifications.draftState}
        onApplySuggestion={notifications.applySuggestion}
        onClose={notifications.closeDialog}
        onSave={notifications.saveDialog}
        onStateChange={notifications.setDraftState}
        open={notifications.open}
      />
    </>
  );
}

function InsetSection({
  children,
  sx,
  title,
}: {
  children: ReactNode;
  sx?: Record<string, unknown>;
  title: string;
}) {
  return (
    <Box sx={{
      border: '1px solid rgba(15, 23, 42, 0.06)',
      borderRadius: '8px',
      p: 1.5,
      bgcolor: tokenCommon.white,
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      ...sx,
    }}>
      <Typography sx={sectionHeadingSx}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function BreakSummary({ icon, label, time }: { icon: ReactNode; label: string; time: string }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '28px minmax(0, 1fr)', alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: 26, height: 26, borderRadius: '8px', display: 'grid', placeItems: 'center', bgcolor: tokenSuccess.softBg, color: tokenSuccess.main }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={labelSx}>
          {label}
        </Typography>
        <Typography sx={{ ...metaSx, mt: 0.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {time}
        </Typography>
      </Box>
    </Box>
  );
}

