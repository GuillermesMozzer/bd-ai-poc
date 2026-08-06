import {Box, Typography} from '@mui/material';
import {deriveAchievementStatus} from '../utils';

const toneMap = {
  green: '#16A34A',
  orange: '#F97316',
  red: '#DC2626',
  gray: '#94A3B8',
  blue: '#1769FF',
} as const;

export default function AchievementProgressBar({value}: {value: number | null}) {
  const tone = deriveAchievementStatus(value);
  const width = value === null ? 0 : Math.max(0, Math.min(value, 120));

  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
      <Typography sx={{fontSize: 12.5, fontWeight: 800, color: toneMap[tone], minWidth: 46}}>
        {value === null ? '-' : `${value.toFixed(1)}%`}
      </Typography>
      <Box
        aria-label={value === null ? 'No achievement value' : `Achievement ${value.toFixed(1)} percent`}
        sx={{
          width: 62,
          height: 8,
          borderRadius: 999,
          bgcolor: '#E5E7EB',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: `${Math.min(width, 100)}%`,
            height: '100%',
            borderRadius: 999,
            bgcolor: toneMap[tone],
          }}
        />
      </Box>
    </Box>
  );
}
