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
        border: `1px solid ${disabled || (!onClick && !readOnly) ? 'var(--paper-border-color)' : 'var(--paper-border-color)'}`, bgcolor: disabled ? 'var(--active-theme-background-default)' : 'var(--active-theme-background-paper)',
        color: 'var(--active-theme-text-primary)', textAlign: 'left', boxShadow: disabled || (!onClick && !readOnly) ? 'none' : '0 6px 18px rgba(11, 92, 171, 0.07)',
        '&:hover': onClick && !disabled ? { borderColor: 'var(--token-brand-main)', transform: 'translateY(-1px)', boxShadow: '0 10px 24px rgba(11, 92, 171, 0.12)' } : undefined,
        '&.Mui-disabled': { opacity: 1 }, '&:focus-visible': { outline: '3px solid rgba(29, 116, 255, 0.28)', outlineOffset: 2 },
      }}
    >
      <Box aria-hidden="true" sx={{ width: 42, height: 42, flex: '0 0 42px', display: 'grid', placeItems: 'center', borderRadius: 2.25, bgcolor: disabled || (!onClick && !readOnly) ? 'var(--surface-subtle-bg)' : 'var(--token-brand-soft-bg)', color: disabled || (!onClick && !readOnly) ? 'var(--active-theme-text-secondary)' : 'var(--token-brand-main)', '& svg': { fontSize: 23 } }}>
        {disabled ? <LockOutlinedIcon /> : icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography component="span" sx={{ display: 'block', color: disabled || !onClick ? 'var(--active-theme-text-secondary)' : 'var(--active-theme-text-primary)', fontSize: 15, fontWeight: 850, lineHeight: 1.25 }}>{title}</Typography>
        <Typography component="span" sx={{ display: 'block', color: 'var(--active-theme-text-secondary)', fontSize: 12.25, fontWeight: 600, lineHeight: 1.35, mt: 0.35 }}>{description}</Typography>
        {detail ? <Typography component="span" sx={{ display: 'block', color: 'var(--token-brand-main)', fontSize: 11.5, fontWeight: 800, lineHeight: 1.3, mt: 0.5 }}>{detail}</Typography> : null}
      </Box>
      {onClick && !disabled ? <ChevronRightIcon aria-hidden="true" sx={{ color: 'var(--token-brand-main)', flexShrink: 0 }} /> : null}
    </ButtonBase>
  );
}
