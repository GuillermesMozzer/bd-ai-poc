import { useState } from 'react';
import { Box, Button, IconButton, Typography, Avatar, LinearProgress, Divider } from '@mui/material';
import {
  PrecisionManufacturing as FactoryIcon,
  Groups as GroupsIcon,
  PersonRemove as PersonRemoveIcon,
  ErrorOutline as WarningIcon,
  CancelOutlined as CancelIcon,
  AccessTime as TimeIcon,
  SwapHoriz as SwapIcon,
  CheckCircleOutline as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  StarBorder as StarBorderIcon,
  AutoAwesome as SparkleIcon,
  OpenInFull as OpenInFullIcon,
  ChevronRight as ChevronRightIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import {
  tokenBrand,
  tokenNeutral,
  tokenCommon,
  tokenSuccess,
  tokenError,
  tokenWarning,
  tokenInfo,
  workstationVisuals,
} from '../theme';
import WidgetShell from './WidgetShell';
import type { WorkstationWidgetProps } from '../types';
import { useOptionalShiftManagementContext } from '../../shiftManagement/contexts/ShiftManagementContext';
import { useWorkstationContext } from '../contexts/WorkstationContext';
import {
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  shiftScheduleLeaderNotificationConfig,
  useWidgetNotifications,
} from './WidgetNotifications';

// Standardized custom styling for widget badges
const alertBannerSx = (type: 'critical' | 'warning') => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderRadius: '8px',
  p: 1.25,
  gap: 1.2,
  border: type === 'critical' ? '1px solid #FCA5A5' : '1px solid #E2E8F0',
  bgcolor: type === 'critical' ? '#FEF2F2' : '#F8FAFC',
  color: type === 'critical' ? '#991B1B' : '#334155',
  flexShrink: 0,
}) as const;

const metricIconWrapperSx = (color: string, bgColor: string) => ({
  width: 38,
  height: 38,
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  bgcolor: bgColor,
  color: color,
  flexShrink: 0,
}) as const;

export default function ShiftScheduleLeaderWidget({
  className,
  style,
  onExpand,
}: WorkstationWidgetProps) {
  const shiftContext = useOptionalShiftManagementContext();
  const notifications = useWidgetNotifications(shiftScheduleLeaderNotificationConfig);
  let workstationContext: any = null;
  try {
    workstationContext = useWorkstationContext();
  } catch (e) {
    // Ignore error if used outside WorkstationProvider
  }

  const handleExpand = () => {
    if (workstationContext) {
      workstationContext.setCurrentScreen('shift_schedule');
    } else if (onExpand) {
      onExpand();
    }
  };

  // Handle local fallback state if Context is not active
  const [localOverrides, setLocalOverrides] = useState<Record<string, string>>({});
  const [localResolved, setLocalResolved] = useState<Record<string, boolean>>({});

  const replacementOverrides = shiftContext?.schedule.shiftReplacementOverrides ?? localOverrides;
  const resolvedInsights = shiftContext?.schedule.resolvedShiftInsights ?? localResolved;

  const setReplacementOverrides = (val: any) => {
    if (shiftContext?.schedule.setShiftReplacementOverrides) {
      shiftContext.schedule.setShiftReplacementOverrides(val);
    } else {
      setLocalOverrides(val);
    }
  };

  const setResolvedInsights = (val: any) => {
    if (shiftContext?.schedule.setResolvedShiftInsights) {
      shiftContext.schedule.setResolvedShiftInsights(val);
    } else {
      setLocalResolved(val);
    }
  };

  const setIsSwapOpen = (val: boolean) => {
    if (shiftContext?.schedule.setIsShiftSwapApprovalOpen) {
      shiftContext.schedule.setIsShiftSwapApprovalOpen(val);
    }
  };

  // Determine dynamic stats based on alert state
  const isCriticalAbsenceResolved = resolvedInsights['critical-absence'] || resolvedInsights['afternoon-tue'] || !!replacementOverrides['afternoon-tue-3'];
  const isOvertimeResolved = resolvedInsights['overtime-risk'];

  const assigned = isCriticalAbsenceResolved ? 12 : 11;
  const required = 13;
  const gap = required - assigned;
  const coveragePercent = Math.round((assigned / required) * 100);

  const availableNow = isCriticalAbsenceResolved ? 9 : 8;
  const unavailable = isCriticalAbsenceResolved ? 2 : 3;
  const overtimeRisk = 2;
  const pendingSwaps = 1;

  // Actions for alerts
  const handleAssignBackup = () => {
    setReplacementOverrides((prev: any) => ({
      ...prev,
      'afternoon-tue-3': 'Carlos Mendez',
    }));
    setResolvedInsights((prev: any) => ({
      ...prev,
      'critical-absence': true,
      'afternoon-tue': true,
    }));
  };

  const handleResolveOvertime = () => {
    setResolvedInsights((prev: any) => ({
      ...prev,
      'overtime-risk': true,
    }));
  };

  const headerAction = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <WidgetNotificationBell active={notifications.active} onClick={notifications.openDialog} size={24} />
      <IconButton size="small" sx={{ color: tokenBrand.main, width: 24, height: 24 }}>
        <SparkleIcon sx={{ fontSize: 18 }} />
      </IconButton>
      <IconButton size="small" sx={{ color: tokenBrand.main, width: 24, height: 24 }}>
        <StarBorderIcon sx={{ fontSize: 18 }} />
      </IconButton>
      <IconButton size="small" onClick={handleExpand} sx={{ color: tokenBrand.main, width: 24, height: 24, p: 0 }}>
        <OpenInFullIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  );

  return (
    <>
      <WidgetShell
        title="Shift Schedule"
        action={headerAction}
        className={className}
        style={style}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, height: '100%', minHeight: 0 }}>
        
        {/* Subheader Filter Status Row */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(15, 23, 42, 0.04)',
          pb: 1,
          flexShrink: 0
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <FactoryIcon sx={{ color: tokenBrand.main, fontSize: 16 }} />
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: workstationVisuals.textPrimary, fontFamily: workstationVisuals.fontFamily }}>
              Today • Morning Shift • Line B
            </Typography>
          </Box>
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            px: 1,
            py: 0.25,
            borderRadius: '8px',
            border: '1px solid #FECACA',
            bgcolor: '#FEF2F2',
            color: '#EF4444',
            fontSize: '0.68rem',
            fontWeight: 700,
            fontFamily: workstationVisuals.fontFamily,
          }}>
            <WarningIcon sx={{ fontSize: 12, mr: 0.4 }} />
            Coverage Risk
          </Box>
        </Box>

        {/* Primary KPIs Panel */}
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
          {/* Column 1: Assigned */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, pl: 0.5, borderRight: '1px solid rgba(15, 23, 42, 0.06)' }}>
            <Box sx={metricIconWrapperSx('#2563EB', '#EEF2FF')}>
              <GroupsIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <Typography sx={{ fontSize: '1.4rem', color: tokenBrand.main, fontWeight: 700, lineHeight: 1, fontFamily: workstationVisuals.fontFamily }}>
                  {assigned}
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color: workstationVisuals.textSecondary, fontWeight: 500, fontFamily: workstationVisuals.fontFamily }}>
                  / {required}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.68rem', color: workstationVisuals.textSecondary, mt: 0.4, fontFamily: workstationVisuals.fontFamily }}>
                Assigned
              </Typography>
            </Box>
          </Box>

          {/* Column 2: Shift Coverage */}
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', px: 1.5, borderRight: '1px solid rgba(15, 23, 42, 0.06)' }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8 }}>
              <Typography sx={{ fontSize: '1.4rem', color: '#F97316', fontWeight: 700, lineHeight: 1, fontFamily: workstationVisuals.fontFamily }}>
                {coveragePercent}%
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', color: '#F97316', fontWeight: 600, fontFamily: workstationVisuals.fontFamily }}>
                Shift Coverage
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={coveragePercent}
              sx={{
                height: 6,
                borderRadius: '8px',
                mt: 0.8,
                bgcolor: tokenNeutral.main,
                '& .MuiLinearProgress-bar': {
                  borderRadius: '8px',
                  bgcolor: '#F97316',
                },
              }}
            />
          </Box>

          {/* Column 3: Gap */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, pl: 1.5 }}>
            <Box sx={metricIconWrapperSx('#DC2626', '#FEF2F2')}>
              <PersonRemoveIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '1.4rem', color: '#DC2626', fontWeight: 700, lineHeight: 1, fontFamily: workstationVisuals.fontFamily }}>
                {gap}
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', color: workstationVisuals.textSecondary, mt: 0.4, fontFamily: workstationVisuals.fontFamily }}>
                Gap: operators
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Banners Area */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, flexShrink: 0 }}>
          
          {/* Critical Red Banner */}
          {!isCriticalAbsenceResolved && (
            <Box sx={alertBannerSx('critical')}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                <CancelIcon sx={{ color: '#EF4444', fontSize: 20, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.72rem', color: '#1F2937', fontFamily: workstationVisuals.fontFamily, lineHeight: 1.3 }}>
                  <Box component="span" sx={{ color: '#DC2626', fontWeight: 800, mr: 0.5 }}>
                    CRITICAL NOW
                  </Box>
                  1 absence was reported 5 minutes before shift start. BLU.AI recommends assigning James Walker as backup coverage.
                </Typography>
              </Box>
              <Button
                variant="text"
                onClick={handleAssignBackup}
                sx={{
                  color: '#DC2626',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  p: 0,
                  minWidth: 0,
                  fontFamily: workstationVisuals.fontFamily,
                  '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                }}
              >
                Assign backup &gt;
              </Button>
            </Box>
          )}

          {/* Overtime Risk Banner */}
          {!isOvertimeResolved && (
            <Box sx={alertBannerSx('warning')}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                <WarningIcon sx={{ color: '#475569', fontSize: 20, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.72rem', color: '#1F2937', fontFamily: workstationVisuals.fontFamily, lineHeight: 1.3 }}>
                  <Box component="span" sx={{ color: '#334155', fontWeight: 800, mr: 0.5 }}>
                    OVERTIME RISK
                  </Box>
                  Coverage pressure is climbing on Line B. Reallocate 1 operator from Line D to reduce overtime exposure and stabilize output.
                </Typography>
              </Box>
              <Button
                variant="text"
                onClick={handleResolveOvertime}
                sx={{
                  color: '#334155',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  p: 0,
                  minWidth: 0,
                  fontFamily: workstationVisuals.fontFamily,
                  '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                }}
              >
                Reallocate now &gt;
              </Button>
            </Box>
          )}
        </Box>

        {/* Live Availability Grid */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 1.2,
          flexShrink: 0,
        }}>
          {/* Box 1: Available Now */}
          <Box sx={{
            border: '1px solid rgba(15, 23, 42, 0.06)',
            borderRadius: '8px',
            p: 1.25,
            bgcolor: tokenCommon.white,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}>
            <Box sx={metricIconWrapperSx('#16A34A', '#EAF8EF')}>
              <CheckCircleIcon sx={{ fontSize: 16 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.62rem', color: workstationVisuals.textSecondary, fontFamily: workstationVisuals.fontFamily, whiteSpace: 'nowrap' }}>
                Available Now
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.4 }}>
                <Typography sx={{ fontSize: '1.2rem', color: '#16A34A', fontWeight: 700, fontFamily: workstationVisuals.fontFamily }}>
                  {availableNow}
                </Typography>
                <Typography sx={{ fontSize: '0.62rem', color: workstationVisuals.textSecondary, fontFamily: workstationVisuals.fontFamily, whiteSpace: 'nowrap' }}>
                  People available
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Box 2: Unavailable */}
          <Box sx={{
            border: '1px solid rgba(15, 23, 42, 0.06)',
            borderRadius: '8px',
            p: 1.25,
            bgcolor: tokenCommon.white,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}>
            <Box sx={metricIconWrapperSx('#DC2626', '#FEF2F2')}>
              <CancelIcon sx={{ fontSize: 16 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.62rem', color: workstationVisuals.textSecondary, fontFamily: workstationVisuals.fontFamily, whiteSpace: 'nowrap' }}>
                Unavailable
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.4 }}>
                <Typography sx={{ fontSize: '1.2rem', color: '#DC2626', fontWeight: 700, fontFamily: workstationVisuals.fontFamily }}>
                  {unavailable}
                </Typography>
                <Typography sx={{ fontSize: '0.62rem', color: workstationVisuals.textSecondary, fontFamily: workstationVisuals.fontFamily, whiteSpace: 'nowrap' }}>
                  People unavailable
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Box 3: Overtime Risk */}
          <Box sx={{
            border: '1px solid rgba(15, 23, 42, 0.06)',
            borderRadius: '8px',
            p: 1.25,
            bgcolor: tokenCommon.white,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}>
            <Box sx={metricIconWrapperSx('#F97316', '#FFF7ED')}>
              <TimeIcon sx={{ fontSize: 16 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.62rem', color: workstationVisuals.textSecondary, fontFamily: workstationVisuals.fontFamily, whiteSpace: 'nowrap' }}>
                Overtime Risk
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.4 }}>
                <Typography sx={{ fontSize: '1.2rem', color: '#F97316', fontWeight: 700, fontFamily: workstationVisuals.fontFamily }}>
                  {overtimeRisk}
                </Typography>
                <Typography sx={{ fontSize: '0.62rem', color: workstationVisuals.textSecondary, fontFamily: workstationVisuals.fontFamily, whiteSpace: 'nowrap' }}>
                  Operators at risk
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Box 4: Pending Swaps */}
          <Box sx={{
            border: '1px solid rgba(15, 23, 42, 0.06)',
            borderRadius: '8px',
            p: 1.25,
            bgcolor: tokenCommon.white,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}>
            <Box sx={metricIconWrapperSx('#7C3AED', '#F5F3FF')}>
              <SwapIcon sx={{ fontSize: 16 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.62rem', color: workstationVisuals.textSecondary, fontFamily: workstationVisuals.fontFamily, whiteSpace: 'nowrap' }}>
                Pending Swaps
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.4 }}>
                <Typography sx={{ fontSize: '1.2rem', color: '#7C3AED', fontWeight: 700, fontFamily: workstationVisuals.fontFamily }}>
                  {pendingSwaps}
                </Typography>
                <Typography sx={{ fontSize: '0.62rem', color: workstationVisuals.textSecondary, fontFamily: workstationVisuals.fontFamily, whiteSpace: 'nowrap' }}>
                  Awaiting approval
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Crew Exceptions Section */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
        }}>
          {/* Section Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8, flexShrink: 0 }}>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: workstationVisuals.textPrimary, fontFamily: workstationVisuals.fontFamily }}>
              Crew Exceptions (4)
            </Typography>
            <Button
              variant="text"
              onClick={handleExpand}
              sx={{
                textTransform: 'none',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: tokenBrand.main,
                fontFamily: workstationVisuals.fontFamily,
                p: 0,
                minWidth: 0,
                '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
              }}
            >
              View all &gt;
            </Button>
          </Box>

          {/* Exceptions Scrollable list */}
          <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {[
              { name: 'Maria Pinna', location: 'Z6', dateRange: 'Mar 10 - Mar 26', status: 'Vacation', badgeColor: '#2E7D32', badgeBg: '#E8F5E9' },
              { name: 'Emily Carter', location: 'Z6', dateRange: 'Mar 18', status: 'Day Off', badgeColor: '#7B1FA2', badgeBg: '#F3E5F5' },
              { name: 'Lucas Hayes', location: 'Z6', dateRange: 'Mar 18', status: 'Overtime Work', badgeColor: '#E65100', badgeBg: '#FFF3E0' },
              { name: 'Olivia Bennett', location: 'Z6', dateRange: 'Mar 16', status: 'Overtime Work', badgeColor: '#E65100', badgeBg: '#FFF3E0' },
            ].map((crew) => {
              const avatarMeta = shiftContext?.schedule.getShiftMemberAvatar(crew.name);
              return (
                <Box
                  key={crew.name}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 0.75,
                    borderRadius: '6px',
                    border: '1px solid rgba(15, 23, 42, 0.04)',
                    bgcolor: '#FFFFFF',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Avatar
                      src={avatarMeta?.src}
                      alt={crew.name}
                      sx={{
                        width: 24,
                        height: 24,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        bgcolor: avatarMeta?.accent || '#DBEAFE',
                        color: '#1E3A8A',
                        border: '1px solid rgba(148,163,184,0.35)',
                      }}
                    >
                      {crew.name.split(' ').map((n) => n[0]).join('')}
                    </Avatar>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: workstationVisuals.textPrimary, fontFamily: workstationVisuals.fontFamily }}>
                    {crew.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: workstationVisuals.textSecondary }}>
                    <Typography sx={{ fontSize: '0.68rem', fontFamily: workstationVisuals.fontFamily }}>
                      📍 {crew.location}  •  {crew.dateRange}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: '4px',
                  bgcolor: crew.badgeBg,
                  color: crew.badgeColor,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  fontFamily: workstationVisuals.fontFamily,
                }}>
                  {crew.status}
                </Box>
              </Box>
            );
          })}
          </Box>
        </Box>

        {/* Bottom Next Action Action */}
        <Box
          onClick={() => setIsSwapOpen(true)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1.2,
            border: '1px solid #DBEAFE',
            borderRadius: '8px',
            bgcolor: '#F8FAFC',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.15s ease',
            '&:hover': {
              bgcolor: '#F0F5FF',
              borderColor: '#BFDBFE',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={metricIconWrapperSx('#2563EB', '#EEF2FF')}>
              <SwapIcon sx={{ fontSize: 16 }} />
            </Box>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#1E3A8A', fontFamily: workstationVisuals.fontFamily }}>
              Next Action
            </Typography>
            <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: 'rgba(15, 23, 42, 0.08)' }} />
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#1F2937', fontFamily: workstationVisuals.fontFamily }}>
              Approve swap: Daniel Brooks ⇆ Michael Thompson
            </Typography>
          </Box>
          <ArrowForwardIcon sx={{ color: '#2563EB', fontSize: 16 }} />
        </Box>

        </Box>
      </WidgetShell>
      <WidgetNotificationsDialog
        active={notifications.active}
        config={shiftScheduleLeaderNotificationConfig}
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
