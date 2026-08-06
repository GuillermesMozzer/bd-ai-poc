import {Box, LinearProgress, Typography} from '@mui/material';
import {workstationVisuals} from '../theme';
import WidgetShell from './WidgetShell';

type RankedMetricItem = {
  detail?: string;
  label: string;
  progress: number;
  tone: string;
  value: string;
};

type WorkstationRankedMetricWidgetProps = {
  items: RankedMetricItem[];
  title?: string;
};

export default function WorkstationRankedMetricWidget({
  items,
  title,
}: WorkstationRankedMetricWidgetProps) {
  return (
    <WidgetShell title={title}>
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.2}}>
        {items.map((item) => (
          <Box key={item.label}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 0.45}}>
              <Box sx={{minWidth: 0}}>
                <Typography sx={{fontWeight: 800, color: workstationVisuals.tierTextHeading, fontFamily: workstationVisuals.fontFamily}}>
                  {item.label}
                </Typography>
                {item.detail ? (
                  <Typography variant="caption" sx={{color: workstationVisuals.tierTextMeta, fontFamily: workstationVisuals.fontFamily, textTransform: 'uppercase', letterSpacing: '0.04em'}}>
                    {item.detail}
                  </Typography>
                ) : null}
              </Box>
              <Typography variant="caption" sx={{color: workstationVisuals.tierTextLabel, fontWeight: 900, fontFamily: workstationVisuals.fontFamily}}>
                {item.value}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={item.progress}
              sx={{
                height: 8,
                borderRadius: 999,
                bgcolor: workstationVisuals.tierSurfaceMuted,
                '& .MuiLinearProgress-bar': {borderRadius: 999, bgcolor: item.tone},
              }}
            />
          </Box>
        ))}
      </Box>
    </WidgetShell>
  );
}
