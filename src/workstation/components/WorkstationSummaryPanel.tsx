import {Box, Button, Chip, Divider, Grid, Paper, Typography} from '@mui/material';
import {
  AssignmentTurnedIn as ActionTrackerIcon,
  BuildCircle as MaintenanceIcon,
  Edit as LogbookIcon,
  Groups as TierMeetingIcon,
} from '@mui/icons-material';
import type {WorkstationDashboardData} from '../types';
import {workstationChartSemantic, workstationTierCardSx, workstationTierInsetCardSx, workstationVisuals} from '../theme';
import WidgetShell from './WidgetShell';

type WorkstationSummaryPanelProps = {
  data: WorkstationDashboardData;
  onOpenActionTracker: () => void;
  onOpenLineLog: () => void;
  onOpenMaintenance: () => void;
  onOpenTierMeeting: () => void;
};

const criticalWidgetLabels = [
  'OEE & Performance',
  'Output vs Plan',
  'Downtime',
  'FPY',
  'Output Trend',
  'Scrap Trend',
  'Operator Tasks',
  'Andon / Escalation',
  'Material Risk',
  'Traceability History',
  'Machine Performance Summary',
] as const;

// Shared section card — uses standardized tier tokens
const sectionCardSx = {
  ...workstationTierCardSx,
  p: 2,
  height: '100%',
} as const;

function getProcessStatusColors(status: string) {
  if (status === 'Running') {
    return {bgcolor: workstationChartSemantic.goodSoft, color: workstationChartSemantic.good};
  }
  if (status === 'Idle') {
    return {bgcolor: workstationVisuals.amberSoft, color: workstationVisuals.amber};
  }
  return {bgcolor: workstationChartSemantic.badSoft, color: workstationChartSemantic.bad};
}

export default function WorkstationSummaryPanel({
  data,
  onOpenActionTracker,
  onOpenLineLog,
  onOpenMaintenance,
  onOpenTierMeeting,
}: WorkstationSummaryPanelProps) {
  const {summary, processes, operatorTasks, materialRisks} = data;

  return (
    <Grid container spacing={2}>

      {/* Foundation description */}
      <Grid size={{xs: 12, lg: 7}}>
        <Paper elevation={0} sx={sectionCardSx}>
          <Typography
            sx={{
              color: workstationVisuals.blue,
              fontWeight: 800,
              fontSize: '0.72rem',
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              fontFamily: workstationVisuals.fontFamily,
              mb: 0.8,
            }}
          >
            Target Screen Foundation
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: workstationVisuals.tierTextHeading,
              fontWeight: 800,
              mb: 0.75,
              fontFamily: workstationVisuals.fontFamily,
              fontSize: '1rem',
            }}
          >
            Dedicated workstation screen is now feature-owned
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: workstationVisuals.tierTextLabel,
              lineHeight: 1.7,
              mb: 1.5,
              fontFamily: workstationVisuals.fontFamily,
            }}
          >
            This screen now serves as the dedicated target entry point for workstation navigation.
            It reads from the centralized workstation slice and is ready for the dashboard shell
            and widget system that follow in later steps.
          </Typography>

          <Grid container spacing={1}>
            {[
              {label: 'Current output', value: summary.currentOutput.toLocaleString()},
              {label: 'OEE', value: `${summary.oee}%`},
              {label: 'Downtime', value: `${summary.downtimeMinutes} min`},
              {label: 'FPY', value: `${summary.fpy}%`},
            ].map((item) => (
              <Grid key={item.label} size={{xs: 6, md: 3}}>
                <Box sx={{...workstationTierInsetCardSx, p: 1.1, backgroundImage: workstationVisuals.tierPanelBackground}}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: workstationVisuals.tierTextLabel,
                      fontWeight: 700,
                      fontFamily: workstationVisuals.fontFamily,
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      color: workstationVisuals.tierTextHeading,
                      fontWeight: 900,
                      mt: 0.4,
                      fontFamily: workstationVisuals.fontFamily,
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>

      {/* Quick actions */}
      <Grid size={{xs: 12, lg: 5}}>
        <Paper elevation={0} sx={sectionCardSx}>
          <Typography
            sx={{
              color: workstationVisuals.blue,
              fontWeight: 800,
              fontSize: '0.72rem',
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              fontFamily: workstationVisuals.fontFamily,
              mb: 0.8,
            }}
          >
            Shell Quick Actions
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: workstationVisuals.tierTextLabel,
              lineHeight: 1.7,
              mb: 1.5,
              fontFamily: workstationVisuals.fontFamily,
            }}
          >
            These actions reuse the existing main-app workflows so the workstation shell feels
            native before we introduce the full dashboard grid.
          </Typography>
          <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1}}>
            <Button
              variant="outlined"
              startIcon={<LogbookIcon />}
              onClick={onOpenLineLog}
              sx={{justifyContent: 'flex-start', fontWeight: 800, fontFamily: workstationVisuals.fontFamily}}
            >
              Shift Logbook
            </Button>
            <Button
              variant="outlined"
              startIcon={<MaintenanceIcon />}
              onClick={onOpenMaintenance}
              sx={{justifyContent: 'flex-start', fontWeight: 800, fontFamily: workstationVisuals.fontFamily}}
            >
              Maintenance
            </Button>
            <Button
              variant="outlined"
              startIcon={<ActionTrackerIcon />}
              onClick={onOpenActionTracker}
              sx={{justifyContent: 'flex-start', fontWeight: 800, fontFamily: workstationVisuals.fontFamily}}
            >
              Action Tracker
            </Button>
            <Button
              variant="outlined"
              startIcon={<TierMeetingIcon />}
              onClick={onOpenTierMeeting}
              sx={{justifyContent: 'flex-start', fontWeight: 800, fontFamily: workstationVisuals.fontFamily}}
            >
              Tier Meeting
            </Button>
          </Box>
          <Divider sx={{my: 1.5, borderColor: workstationVisuals.tierBorder}} />
          <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.75}}>
            {criticalWidgetLabels.slice(0, 6).map((label) => (
              <Chip
                key={label}
                label={label}
                sx={{
                  fontWeight: 700,
                  bgcolor: workstationVisuals.blueSoft,
                  color: workstationVisuals.blue,
                  border: `1px solid rgba(4,78,215,0.15)`,
                  fontFamily: workstationVisuals.fontFamily,
                  fontSize: '0.72rem',
                }}
              />
            ))}
          </Box>
        </Paper>
      </Grid>

      {/* Process snapshot */}
      <Grid size={{xs: 12, md: 6}}>
        <Paper elevation={0} sx={sectionCardSx}>
          <Typography
            sx={{
              color: workstationVisuals.blue,
              fontWeight: 800,
              fontSize: '0.72rem',
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              fontFamily: workstationVisuals.fontFamily,
              mb: 1,
            }}
          >
            Process Snapshot
          </Typography>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
            {processes.slice(0, 5).map((process) => {
              const statusColors = getProcessStatusColors(process.status);
              return (
                <Box
                  key={process.machine}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 0.75,
                    borderBottom: `1px solid ${workstationVisuals.tierBorder}`,
                    '&:last-child': {borderBottom: 'none'},
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: workstationVisuals.tierTextHeading,
                        fontFamily: workstationVisuals.fontFamily,
                        fontSize: '0.85rem',
                      }}
                    >
                      {process.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: workstationVisuals.tierTextMeta,
                        fontFamily: workstationVisuals.fontFamily,
                      }}
                    >
                      {process.machine} • {process.lastStopReason}
                    </Typography>
                  </Box>
                  <Chip
                    label={process.status}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      fontFamily: workstationVisuals.fontFamily,
                      border: `1px solid ${workstationVisuals.tierBorder}`,
                      ...statusColors,
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        </Paper>
      </Grid>

      {/* Operator tasks */}
      <Grid size={{xs: 12, md: 3}}>
        <Paper elevation={0} sx={sectionCardSx}>
          <Typography
            sx={{
              color: workstationVisuals.blue,
              fontWeight: 800,
              fontSize: '0.72rem',
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              fontFamily: workstationVisuals.fontFamily,
              mb: 1,
            }}
          >
            Operator Tasks
          </Typography>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.75}}>
            {operatorTasks.map((task) => (
              <Box
                key={task.title}
                sx={{...workstationTierInsetCardSx, p: 1, backgroundImage: workstationVisuals.tierPanelBackground}}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: workstationVisuals.tierTextHeading,
                    fontFamily: workstationVisuals.fontFamily,
                    fontSize: '0.82rem',
                  }}
                >
                  {task.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: workstationVisuals.tierTextMeta,
                    fontFamily: workstationVisuals.fontFamily,
                  }}
                >
                  {task.priority} • {task.dueLabel}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Grid>

      {/* Material risks */}
      <Grid size={{xs: 12, md: 3}}>
        <Paper elevation={0} sx={sectionCardSx}>
          <Typography
            sx={{
              color: workstationVisuals.blue,
              fontWeight: 800,
              fontSize: '0.72rem',
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              fontFamily: workstationVisuals.fontFamily,
              mb: 1,
            }}
          >
            Material Risks
          </Typography>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.75}}>
            {materialRisks.slice(0, 3).map((risk) => (
              <Box key={risk.label}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: workstationVisuals.tierTextHeading,
                    fontFamily: workstationVisuals.fontFamily,
                    fontSize: '0.82rem',
                  }}
                >
                  {risk.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{color: risk.tone, fontFamily: workstationVisuals.fontFamily}}
                >
                  {risk.timeLabel} • {risk.detail}
                </Typography>
                <Divider sx={{mt: 0.75, borderColor: workstationVisuals.tierBorder}} />
              </Box>
            ))}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}
