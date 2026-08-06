import {
  Chip,
  Divider,
  Drawer,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import type {CalendarDaySummary} from '../../types';
import CalendarEventList from './CalendarEventList';
import CalendarPlanningSummaryCard from './CalendarPlanningSummaryCard';
import {severityTone} from './calendarStyles';

type LongTermPlanningDayDetailsPanelProps = {
  open: boolean;
  summary: CalendarDaySummary | null;
  site: string;
  onClose: () => void;
};

function DetailsContent({summary, site}: {summary: CalendarDaySummary; site: string}) {
  return (
    <Stack spacing={1.4}>
      <div>
        <Typography id="ltp-calendar-day-details-title" sx={{fontSize: 22, color: '#0F172A', fontWeight: 900}}>
          {summary.date}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{mt: 0.8}}>
          <Chip label={site} size="small" sx={{fontWeight: 800}} />
          <Chip
            label={summary.highestSeverity}
            size="small"
            sx={{
              bgcolor: severityTone[summary.highestSeverity].bg,
              color: severityTone[summary.highestSeverity].color,
              border: `1px solid ${severityTone[summary.highestSeverity].border}`,
              fontWeight: 800,
            }}
          />
        </Stack>
      </div>

      <Stack
        direction={{xs: 'column', sm: 'row'}}
        spacing={1}
        useFlexGap
        flexWrap="wrap"
      >
        <CalendarPlanningSummaryCard label="Requested" value={summary.requestedQuantity.toLocaleString()} />
        <CalendarPlanningSummaryCard label="Committed" value={summary.committedQuantity.toLocaleString()} />
        <CalendarPlanningSummaryCard label="Uncovered" value={summary.uncoveredQuantity.toLocaleString()} accent={summary.uncoveredQuantity > 0 ? '#DC2626' : undefined} />
        <CalendarPlanningSummaryCard label="Required hrs" value={summary.requiredHours} />
        <CalendarPlanningSummaryCard label="Available hrs" value={summary.availableHours} />
        <CalendarPlanningSummaryCard label="Utilization" value={`${summary.utilizationPercent}%`} accent={summary.utilizationPercent >= 90 ? '#C2410C' : undefined} />
      </Stack>

      {summary.fallbackMessage ? (
        <Paper elevation={0} sx={{p: 1.2, borderRadius: 3, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface-muted)'}}>
          <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', lineHeight: 1.55}}>
            {summary.fallbackMessage}
          </Typography>
        </Paper>
      ) : null}

      <Divider />
      <div>
        <Typography sx={{fontSize: 13, color: '#4F46E5', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>
          Events
        </Typography>
        <Stack sx={{mt: 1}}>
          <CalendarEventList events={summary.events} />
        </Stack>
      </div>

      <Divider />
      <Stack direction={{xs: 'column', md: 'row'}} spacing={1.2}>
        <Paper elevation={0} sx={{p: 1.2, borderRadius: 3, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface)', flex: 1}}>
          <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 800, textTransform: 'uppercase'}}>Affected products</Typography>
          <Typography sx={{fontSize: 13, color: '#0F172A', mt: 0.7, lineHeight: 1.6}}>
            {summary.affectedProducts.join(', ') || 'No affected products'}
          </Typography>
        </Paper>
        <Paper elevation={0} sx={{p: 1.2, borderRadius: 3, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface)', flex: 1}}>
          <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 800, textTransform: 'uppercase'}}>Affected lines</Typography>
          <Typography sx={{fontSize: 13, color: '#0F172A', mt: 0.7, lineHeight: 1.6}}>
            {summary.affectedLines.join(', ') || 'No affected lines'}
          </Typography>
        </Paper>
      </Stack>

      <Paper elevation={0} sx={{p: 1.2, borderRadius: 3, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface)'}}>
        <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 800, textTransform: 'uppercase'}}>Constraints</Typography>
        <Stack spacing={0.7} sx={{mt: 0.8}}>
          {(summary.constraints.length ? summary.constraints : ['No active constraints for the selected day.']).map((item) => (
            <Typography key={item} sx={{fontSize: 13, color: '#0F172A', lineHeight: 1.5}}>
              {item}
            </Typography>
          ))}
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{p: 1.2, borderRadius: 3, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface)'}}>
        <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 800, textTransform: 'uppercase'}}>Suggested actions</Typography>
        <Stack spacing={0.7} sx={{mt: 0.8}}>
          {(summary.suggestedActions.length ? summary.suggestedActions : ['No suggested action for the selected period.']).map((item) => (
            <Typography key={item} sx={{fontSize: 13, color: '#0F172A', lineHeight: 1.5}}>
              {item}
            </Typography>
          ))}
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{p: 1.2, borderRadius: 3, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface)'}}>
        <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 800, textTransform: 'uppercase'}}>Planning rows for month</Typography>
        <Stack spacing={1} sx={{mt: 1}}>
          {summary.planningRows.map((row) => (
            <Paper key={row.id} elevation={0} sx={{p: 1.1, borderRadius: 3, bgcolor: 'var(--planning-surface-muted)', border: '1px solid var(--planning-border)'}}>
              <Typography sx={{fontSize: 13.5, color: '#0F172A', fontWeight: 900}}>
                {row.productCode} · {row.productDescription}
              </Typography>
              <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)', mt: 0.45, lineHeight: 1.55}}>
                {row.productFamily} · Requested {row.requestedQuantity.toLocaleString()} · Committed {(typeof row.committedQuantity === 'number' ? row.committedQuantity : row.requestedQuantity).toLocaleString()} · {row.assignedLineName} · Utilization {row.utilizationPercent}% · Uncovered {row.uncoveredQuantity.toLocaleString()}
              </Typography>
              <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)', mt: 0.45, lineHeight: 1.55}}>
                Status {row.status} · {row.constraintReason || row.validationMessages[0]?.message || 'No additional constraint reason'} · {row.plannerComment || 'No planner comment'}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}

export default function LongTermPlanningDayDetailsPanel({
  open,
  summary,
  site,
  onClose,
}: LongTermPlanningDayDetailsPanelProps) {
  const desktop = useMediaQuery('(min-width:1200px)');

  if (!summary) {
    return null;
  }

  if (desktop) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          borderRadius: 4,
          border: '1px solid var(--planning-border)',
          bgcolor: 'var(--planning-surface)',
          minWidth: 360,
          maxWidth: 420,
          alignSelf: 'flex-start',
        }}
        aria-labelledby="ltp-calendar-day-details-title"
      >
        <DetailsContent summary={summary} site={site} />
      </Paper>
    );
  }

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{sx: {p: 1.5, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80vh'}}}
      aria-labelledby="ltp-calendar-day-details-title"
    >
      <DetailsContent summary={summary} site={site} />
    </Drawer>
  );
}
