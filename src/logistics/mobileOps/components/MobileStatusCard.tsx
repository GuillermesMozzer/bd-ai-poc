import React from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

type MobileStatusCardProps = {
  title: string;
  count: number;
  description: string;
  icon: React.ReactNode;
  tone?: 'primary' | 'success' | 'attention';
  onClick: () => void;
};

const toneStyles = {
  primary: {
    border: '#A7C8E5', iconBg: '#EAF3FB', icon: '#0B5CAB', count: '#0B5CAB', shadow: '0 8px 22px rgba(11, 92, 171, 0.10)',
  },
  success: {
    border: '#9ACFBE', iconBg: '#E8F6F1', icon: '#087A5B', count: '#087A5B', shadow: '0 8px 22px rgba(8, 122, 91, 0.09)',
  },
  attention: {
    border: '#E7C89B', iconBg: '#FFF5E4', icon: '#A45B00', count: '#A45B00', shadow: '0 8px 22px rgba(164, 91, 0, 0.08)',
  },
} as const;

export default function MobileStatusCard({ title, count, description, icon, tone = 'primary', onClick }: MobileStatusCardProps) {
  const colors = toneStyles[tone];

  return (
    <ButtonBase
      onClick={onClick}
      aria-label={`Open ${title}`}
      sx={{
        width: '100%', minHeight: 90, p: 1.75, display: 'flex', alignItems: 'center', gap: 1.5,
        borderRadius: 3, border: `1px solid ${colors.border}`, bgcolor: '#FFFFFF', color: '#102A43', textAlign: 'left', boxShadow: colors.shadow,
        transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
        '&:hover': { borderColor: colors.icon, boxShadow: `0 12px 28px color-mix(in srgb, ${colors.icon} 15%, transparent)`, transform: 'translateY(-1px)' },
        '&:focus-visible': { outline: '3px solid rgba(29, 116, 255, 0.28)', outlineOffset: 2 },
      }}
    >
      <Box aria-hidden="true" sx={{ width: 46, height: 46, flex: '0 0 46px', borderRadius: 2.5, display: 'grid', placeItems: 'center', bgcolor: colors.iconBg, color: colors.icon, '& svg': { fontSize: 25 } }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography component="span" sx={{ display: 'block', color: '#102A43', fontSize: 16, fontWeight: 850, lineHeight: 1.25 }}>
          {title}
        </Typography>
        <Typography component="span" sx={{ display: 'block', color: '#557086', fontSize: 12.5, fontWeight: 600, lineHeight: 1.35, mt: 0.45 }}>
          {description}
        </Typography>
      </Box>
      <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
        <Typography component="span" sx={{ display: 'block', color: colors.count, fontSize: 26, fontWeight: 900, lineHeight: 1 }}>
          {count}
        </Typography>
        <ChevronRightIcon aria-hidden="true" sx={{ color: colors.icon, fontSize: 21, mt: 0.2 }} />
      </Box>
    </ButtonBase>
  );
}
