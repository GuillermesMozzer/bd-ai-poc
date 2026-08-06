import {Box, Divider, Link, Typography} from '@mui/material';
import {Clock, ChevronDown} from 'lucide-react';
import {workstationChartSemantic, workstationTierInsetCardSx, workstationVisuals} from '../theme';
import WidgetShell from './WidgetShell';

const summaryItems = [
  {label: 'To Do', value: 2, color: workstationVisuals.blue},
  {label: 'In Progress', value: 1, color: workstationChartSemantic.good},
  {label: 'Completed', value: 3, color: workstationVisuals.tierTextMeta},
  {label: 'Overdue', value: 1, color: workstationChartSemantic.bad},
];

const tasks = [
  {time: '9:00 AM', description: 'Perform quality check (Q-344)', action: 'Open'},
  {time: '10:15 AM', description: 'Verify labeler setup', action: 'In Progress'},
  {time: '11:30 AM', description: 'Change lube oil', action: 'Open'},
  {time: '2:00 PM', description: 'End-of-shift cleaning', action: 'Due'},
];

function getActionColor(action: string) {
  if (action === 'In Progress') return workstationChartSemantic.good;
  if (action === 'Due') return workstationVisuals.amber;
  return workstationVisuals.blue;
}

export default function WorkstationMyTasksWidget() {
  return (
    <WidgetShell
      title="My Tasks"
      action={
        <Link
          href="#"
          underline="none"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.4,
            fontSize: '0.72rem',
            fontWeight: 800,
            color: workstationVisuals.blue,
            fontFamily: workstationVisuals.fontFamily,
            '&:hover': {opacity: 0.75},
          }}
        >
          View all <ChevronDown size={12} />
        </Link>
      }
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.2,
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          pr: 0.5,
          '&::-webkit-scrollbar': {width: '3px'},
          '&::-webkit-scrollbar-thumb': {bgcolor: workstationVisuals.tierBorder, borderRadius: '4px'},
        }}
      >
        {/* Status summary grid */}
        <Box
          sx={{
            ...workstationTierInsetCardSx,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            p: 0.9,
          }}
        >
          {summaryItems.map((item, index) => (
            <Box
              key={item.label}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRight: index < 3 ? `1px solid ${workstationVisuals.tierBorder}` : 'none',
              }}
            >
              <Typography
                sx={{
                  fontSize: '1.15rem',
                  fontWeight: 900,
                  color: item.color,
                  lineHeight: 1.1,
                  fontFamily: workstationVisuals.fontFamily,
                }}
              >
                {item.value}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  color: workstationVisuals.tierTextLabel,
                  mt: 0.2,
                  fontSize: '0.68rem',
                  textAlign: 'center',
                  px: 0.2,
                  fontFamily: workstationVisuals.fontFamily,
                }}
              >
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Task list */}
        <Box sx={{display: 'flex', flexDirection: 'column'}}>
          {tasks.map((task, index) => (
            <Box key={index}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '20px 58px 1fr auto',
                  alignItems: 'center',
                  gap: 0.75,
                  py: 0.85,
                }}
              >
                <Box sx={{display: 'flex', justifyContent: 'center'}}>
                  <Clock size={13} color={workstationVisuals.blue} strokeWidth={2.5} />
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: workstationVisuals.tierTextMeta,
                    fontSize: '0.75rem',
                    fontFamily: workstationVisuals.fontFamily,
                  }}
                >
                  {task.time}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 800,
                    color: workstationVisuals.tierTextHeading,
                    fontSize: '0.85rem',
                    lineHeight: 1.2,
                    fontFamily: workstationVisuals.fontFamily,
                  }}
                >
                  {task.description}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color: getActionColor(task.action),
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontFamily: workstationVisuals.fontFamily,
                    '&:hover': {textDecoration: 'underline'},
                  }}
                >
                  {task.action}
                </Typography>
              </Box>

              {index < tasks.length - 1 && (
                <Divider sx={{borderColor: workstationVisuals.tierSurfaceMuted}} />
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </WidgetShell>
  );
}
