import React from 'react';
import { Box, ButtonBase, Chip, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

type AreaSelectionCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
};

export default function AreaSelectionCard({
  title,
  description,
  icon,
  disabled = false,
  onClick,
}: AreaSelectionCardProps) {
  return (
    <ButtonBase
      disabled={disabled}
      onClick={onClick}
      aria-disabled={disabled || undefined}
      sx={{
        width: '100%',
        minHeight: 92,
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        borderRadius: 3,
        border: disabled ? '1px solid #D8DEE8' : '1px solid #7AA7D3',
        bgcolor: disabled ? '#F2F4F7' : '#FFFFFF',
        color: disabled ? '#7B8494' : '#12324B',
        textAlign: 'left',
        boxShadow: disabled ? 'none' : '0 8px 24px rgba(11, 92, 171, 0.10)',
        transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
        '&:hover': disabled ? undefined : {
          borderColor: '#0B5CAB',
          boxShadow: '0 12px 28px rgba(11, 92, 171, 0.16)',
          transform: 'translateY(-1px)',
        },
        '&:focus-visible': {
          outline: '3px solid rgba(29, 116, 255, 0.28)',
          outlineOffset: 2,
        },
        '&.Mui-disabled': {
          color: '#7B8494',
          opacity: 1,
          cursor: 'not-allowed',
        },
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          width: 46,
          height: 46,
          flex: '0 0 46px',
          borderRadius: 2.5,
          display: 'grid',
          placeItems: 'center',
          bgcolor: disabled ? '#E3E7ED' : '#EAF3FB',
          color: disabled ? '#929AA8' : '#0B5CAB',
          '& svg': { fontSize: 25 },
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          component="span"
          sx={{
            display: 'block',
            color: disabled ? '#626C7C' : '#102A43',
            fontSize: 16,
            fontWeight: 800,
            lineHeight: 1.25,
          }}
        >
          {title}
        </Typography>
        <Typography
          component="span"
          sx={{
            display: 'block',
            color: disabled ? '#89919E' : '#557086',
            fontSize: 13,
            fontWeight: 600,
            lineHeight: 1.35,
            mt: 0.45,
          }}
        >
          {description}
        </Typography>
      </Box>

      {disabled ? (
        <Chip
          label="Coming soon"
          size="small"
          sx={{
            flexShrink: 0,
            height: 25,
            bgcolor: '#E3E7ED',
            color: '#657080',
            fontWeight: 800,
            fontSize: 11,
            '& .MuiChip-label': { px: 1 },
          }}
        />
      ) : (
        <ChevronRightIcon aria-hidden="true" sx={{ color: '#0B5CAB', flexShrink: 0 }} />
      )}
    </ButtonBase>
  );
}
