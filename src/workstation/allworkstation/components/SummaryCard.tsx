import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../../theme';
import {Box, Paper, Typography} from '@mui/material';
import {ReactNode} from 'react';

type SummaryCardProps = {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
};

export default function SummaryCard({label, value, icon, color}: SummaryCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        flex: 1,
        borderRadius: 3,
        border: `1px solid ${workstationVisuals.tierBorder}`,
        background: `linear-gradient(180deg, ${tokenCommon.white} 0%, ${workstationVisuals.slateSurface} 100%)`,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          bgcolor: `color-mix(in srgb, ${color} 8%, transparent)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography sx={{fontSize: 13, fontWeight: 700, color: workstationVisuals.textSecondary, mb: 0.5}}>
          {label}
        </Typography>
        <Typography sx={{fontSize: 24, fontWeight: 800, color: workstationVisuals.textPrimary, lineHeight: 1}}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}
