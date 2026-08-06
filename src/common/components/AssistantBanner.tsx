import React from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { AutoAwesome as SparkleIcon, CheckCircleOutline as CheckCircleIcon, CancelOutlined as CancelIcon } from '@mui/icons-material';

interface AssistantBannerProps {
  title?: string;
  message: string;
  onAccept?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
}

const AssistantBanner: React.FC<AssistantBannerProps> = ({
  title = "BD ATLAS AI",
  message,
  onAccept,
  onCancel,
  showActions = false
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '12px',
        bgcolor: 'var(--token-neutral-lightest)',
        border: 'none',
        p: 1.5,
        position: 'relative',
        overflow: 'hidden',
        mb: 2
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Box>
          <Typography sx={{ color: 'var(--active-theme-primary)', fontSize: '0.875rem', fontWeight: 700, mb: 0.35 }}>
            <SparkleIcon sx={{ fontSize: 14, mr: 0.45, color: 'var(--ai-accent-icon)', verticalAlign: '-2px' }} />
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--active-theme-text-secondary)', fontSize: '0.75rem', lineHeight: 1.3 }}>
            {message}
          </Typography>
        </Box>
        {showActions && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'var(--active-theme-primary-light)', whiteSpace: 'nowrap' }}>
            {onCancel && (
              <IconButton size="small" onClick={onCancel} sx={{ p: 0.2, color: 'var(--active-theme-primary-light)' }}>
                <CancelIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
            {onAccept && (
              <IconButton size="small" onClick={onAccept} sx={{ p: 0.2, color: 'var(--active-theme-primary-light)' }}>
                <CheckCircleIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default AssistantBanner;
