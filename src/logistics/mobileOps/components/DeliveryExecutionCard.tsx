import React from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

type DeliveryExecutionCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  readOnly?: boolean;
  detail?: string;
};

export default function DeliveryExecutionCard({ title, description, icon, onClick, disabled = false, readOnly = false, detail }: DeliveryExecutionCardProps) {
  return (
    <ButtonBase
      disabled={disabled || (!onClick && !readOnly)}
      onClick={onClick}
      aria-label={onClick ? `Open ${title}` : title}
      sx={{
        width: '100%', minHeight: 82, p: 1.5, display: 'flex', alignItems: 'center', gap: 1.25, borderRadius: 2.75,
        border: `1px solid ${disabled || (!onClick && !readOnly) ? '#DDE4EB' : '#C7DBEE'}`, bgcolor: disabled ? '#F7F9FB' : '#FFFFFF',
        color: '#102A43', textAlign: 'left', boxShadow: disabled || (!onClick && !readOnly) ? 'none' : '0 6px 18px rgba(11, 92, 171, 0.07)',
        '&:hover': onClick && !disabled ? { borderColor: '#0B5CAB', transform: 'translateY(-1px)', boxShadow: '0 10px 24px rgba(11, 92, 171, 0.12)' } : undefined,
        '&.Mui-disabled': { opacity: 1 }, '&:focus-visible': { outline: '3px solid rgba(29, 116, 255, 0.28)', outlineOffset: 2 },
      }}
    >
      <Box aria-hidden="true" sx={{ width: 42, height: 42, flex: '0 0 42px', display: 'grid', placeItems: 'center', borderRadius: 2.25, bgcolor: disabled || (!onClick && !readOnly) ? '#EBEFF3' : '#EAF3FB', color: disabled || (!onClick && !readOnly) ? '#718397' : '#0B5CAB', '& svg': { fontSize: 23 } }}>
        {disabled ? <LockOutlinedIcon /> : icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography component="span" sx={{ display: 'block', color: disabled || !onClick ? '#536579' : '#102A43', fontSize: 15, fontWeight: 850, lineHeight: 1.25 }}>{title}</Typography>
        <Typography component="span" sx={{ display: 'block', color: '#718397', fontSize: 12.25, fontWeight: 600, lineHeight: 1.35, mt: 0.35 }}>{description}</Typography>
        {detail ? <Typography component="span" sx={{ display: 'block', color: '#0B5CAB', fontSize: 11.5, fontWeight: 800, lineHeight: 1.3, mt: 0.5 }}>{detail}</Typography> : null}
      </Box>
      {onClick && !disabled ? <ChevronRightIcon aria-hidden="true" sx={{ color: '#0B5CAB', flexShrink: 0 }} /> : null}
    </ButtonBase>
  );
}
