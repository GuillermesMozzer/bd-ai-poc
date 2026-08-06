import {Box, LinearProgress, Typography} from '@mui/material';
import type {WorkstationMetricPoint} from '../types';
import {workstationChartSemantic, workstationVisuals} from '../theme';
import WidgetShell from './WidgetShell';

type WorkstationTopDowntimeCausesWidgetProps = {
  topDowntimeCauses: WorkstationMetricPoint[];
};

export default function WorkstationTopDowntimeCausesWidget({
  topDowntimeCauses,
}: WorkstationTopDowntimeCausesWidgetProps) {
  return (
    <WidgetShell title="Top Downtime Causes">
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.2}}>
        {topDowntimeCauses.map((cause) => (
          <Box key={String(cause.label)}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.45, gap: 1}}>
              <Box sx={{minWidth: 0}}>
                <Typography sx={{fontWeight: 800, color: workstationVisuals.tierTextHeading, fontFamily: workstationVisuals.fontFamily}}>
                  {String(cause.label)}
                </Typography>
                <Typography variant="caption" sx={{color: workstationVisuals.tierTextMeta, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: workstationVisuals.fontFamily}}>
                  {cause.total} min total line loss pool
                </Typography>
              </Box>
              <Typography variant="caption" sx={{color: workstationVisuals.tierTextLabel, fontWeight: 900, fontFamily: workstationVisuals.fontFamily}}>
                {cause.minutes} min
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Number(cause.percentage)}
              sx={{
                height: 8,
                borderRadius: 999,
                bgcolor: workstationChartSemantic.badSoft,
                '& .MuiLinearProgress-bar': {borderRadius: 999, bgcolor: workstationChartSemantic.bad},
              }}
            />
          </Box>
        ))}
      </Box>
    </WidgetShell>
  );
}
