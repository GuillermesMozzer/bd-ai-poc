import {Box, Typography} from '@mui/material';
import {Check, Waves, Star, Wrench, ClipboardList} from 'lucide-react';
import {workstationChartSemantic, workstationVisuals} from '../theme';
import WidgetShell from './WidgetShell';

const steps = [
  {id: 'hardware', label: 'Hardware', time: '6:00 AM', status: 'Done', icon: Check},
  {id: 'startup', label: 'Startup', time: '6:15 AM', status: 'Done', icon: Check},
  {
    id: 'run-production',
    label: 'Run Production',
    time: '6:30 AM – 2:00 PM',
    status: 'In Progress',
    icon: Waves,
    isCurrent: true,
  },
  {id: 'quality-checks', label: 'Quality Checks', time: '2:00 PM', status: 'Pending', icon: Star},
  {id: 'changeover', label: 'Changeover', time: '2:30 PM', status: 'Pending', icon: Wrench},
  {id: 'wrap-up', label: 'Wrap up', time: '4:00 PM', status: 'Pending', icon: ClipboardList},
];

export default function WorkstationLineRoutinesWidget() {
  return (
    <WidgetShell title="Line Routines">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          position: 'relative',
          px: 0.5,
          pt: 1,
          flex: 1,
        }}
      >
        {/* Connector dashed line */}
        <Box
          sx={{
            position: 'absolute',
            top: 34,
            left: 36,
            right: 36,
            height: 0,
            borderTop: `2px dashed ${workstationVisuals.tierDash}`,
            zIndex: 0,
          }}
        />

        {steps.map((step) => {
          const Icon = step.icon;
          const isDone = step.status === 'Done';
          const isInProgress = step.status === 'In Progress';

          return (
            <Box
              key={step.id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                zIndex: 1,
                width: '100%',
              }}
            >
              {/* "Now" tooltip badge */}
              {isInProgress && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -26,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: workstationVisuals.blue,
                    color: workstationVisuals.tierSurface,
                    px: 1.2,
                    py: 0.4,
                    borderRadius: 1.5,
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    fontFamily: workstationVisuals.fontFamily,
                    whiteSpace: 'nowrap',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -4,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '4px solid transparent',
                      borderRight: '4px solid transparent',
                      borderTop: `4px solid ${workstationVisuals.blue}`,
                    },
                  }}
                >
                  Now
                </Box>
              )}

              {/* Circle Icon */}
              <Box sx={{mb: 1.5, position: 'relative'}}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isDone
                      ? workstationChartSemantic.good
                      : workstationVisuals.tierSurface,
                    border: isDone
                      ? 'none'
                      : isInProgress
                        ? `2px solid ${workstationVisuals.blue}`
                        : `2px solid ${workstationVisuals.tierBorder}`,
                    color: isDone
                      ? workstationVisuals.tierSurface
                      : isInProgress
                        ? workstationVisuals.blue
                        : workstationVisuals.textMuted,
                    boxShadow: isInProgress
                      ? `0 0 0 4px ${workstationVisuals.blueSoft}`
                      : 'none',
                  }}
                >
                  <Icon size={20} strokeWidth={isDone ? 3 : 2} />
                </Box>
              </Box>

              {/* Time label */}
              <Typography
                variant="caption"
                sx={{
                  color: workstationVisuals.tierTextMeta,
                  fontWeight: 600,
                  fontSize: '0.65rem',
                  mb: 0.4,
                  fontFamily: workstationVisuals.fontFamily,
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
              >
                {step.time}
              </Typography>

              {/* Step label */}
              <Typography
                variant="body2"
                sx={{
                  color: workstationVisuals.tierTextHeading,
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  mb: 0.3,
                  textAlign: 'center',
                  fontFamily: workstationVisuals.fontFamily,
                  lineHeight: 1.2,
                }}
              >
                {step.label}
              </Typography>

              {/* Status label */}
              <Typography
                variant="caption"
                sx={{
                  color: isDone
                    ? workstationVisuals.tierTextMeta
                    : isInProgress
                      ? workstationVisuals.blue
                      : workstationVisuals.textMuted,
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  fontFamily: workstationVisuals.fontFamily,
                }}
              >
                {step.status}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </WidgetShell>
  );
}
