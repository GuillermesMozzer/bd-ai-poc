import {Box, Button, Chip, Paper, Typography} from '@mui/material';
import {
  AutoAwesome as SparkleIcon,
  OpenInFull as ExpandIcon,
} from '@mui/icons-material';
import type {WorkstationAlert} from '../types';
import {workstationChartSemantic, workstationVisuals} from '../theme';

type WorkstationAlertBannerProps = {
  alert: WorkstationAlert;
  onAskAi: () => void;
  onOpenActionTracker: () => void;
};

export default function WorkstationAlertBanner({
  alert,
  onAskAi,
  onOpenActionTracker,
}: WorkstationAlertBannerProps) {
  const bannerTone =
    alert.severity === 'critical'
      ? {bg: workstationChartSemantic.badSoft, border: workstationChartSemantic.badSoft, text: workstationChartSemantic.bad, chip: workstationChartSemantic.bad}
      : alert.severity === 'warning'
        ? {bg: workstationVisuals.amberSoft, border: workstationVisuals.amberSoft, text: workstationVisuals.amber, chip: workstationVisuals.amber}
        : {bg: workstationVisuals.blueSoft, border: workstationVisuals.blueSoft, text: workstationVisuals.blue, chip: workstationVisuals.blue};

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.25,
        borderRadius: 4,
        bgcolor: workstationVisuals.tierSurface,
        border: `1px solid ${workstationVisuals.tierBorder}`,
      }}
    >
      <Box
        sx={{
          p: 2,
          borderRadius: 3,
          bgcolor: bannerTone.bg,
          border: `1px solid ${bannerTone.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{minWidth: 0}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 0.7, flexWrap: 'wrap'}}>
            <Typography sx={{fontWeight: 800, color: bannerTone.text, fontFamily: workstationVisuals.fontFamily}}>
            {alert.title}
            </Typography>
          <Chip
            label={`${alert.activeCount} ACTIVE`}
            size="small"
            sx={{
                fontWeight: 800,
                bgcolor: 'rgba(255,255,255,0.8)',
                color: bannerTone.chip,
                border: `1px solid ${bannerTone.border}`,
                fontFamily: workstationVisuals.fontFamily,
                fontSize: '0.65rem',
            }}
          />
        </Box>
          <Typography variant="body2" sx={{color: bannerTone.text, fontFamily: workstationVisuals.fontFamily, fontWeight: 500}}>
            {alert.message}
          </Typography>
        </Box>

        <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
          <Button variant="outlined" startIcon={<ExpandIcon />} onClick={onOpenActionTracker} sx={{fontWeight: 800, borderRadius: 1.2, borderColor: bannerTone.border, color: bannerTone.text, textTransform: 'none', fontFamily: workstationVisuals.fontFamily}}>
            Open Actions
          </Button>
          <Button variant="contained" startIcon={<SparkleIcon />} onClick={onAskAi} sx={{fontWeight: 800, borderRadius: 1.2, textTransform: 'none', fontFamily: workstationVisuals.fontFamily, bgcolor: workstationVisuals.blue}}>
            Ask BD Atlas AI
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
