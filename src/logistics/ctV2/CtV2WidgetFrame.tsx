import React from 'react';
import { Box, Typography } from '@mui/material';
import { GripVertical } from 'lucide-react';
import { tokenBrand, tokenNeutral, tokenText } from '../ctV2Theme';

export const CT_V2_DRAG_HANDLE_CLASS = 'ct-v2-drag-handle';

type CtV2WidgetFrameProps = {
  title: string;
  children: React.ReactNode;
};

export function CtV2WidgetFrame({ title, children }: CtV2WidgetFrameProps) {
  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        position: 'relative',
      }}
    >
      <Box
        className={CT_V2_DRAG_HANDLE_CLASS}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 3,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          px: 0.75,
          py: 0.35,
          borderRadius: 999,
          bgcolor: 'background.paper',
          border: `1px solid ${tokenNeutral.main}`,
          color: tokenText.secondary,
          cursor: 'grab',
          boxShadow: '0 1px 2px rgba(15,23,42,0.06)',
          '&:active': { cursor: 'grabbing' },
          '&:hover': { color: tokenBrand.main, borderColor: tokenBrand.light },
        }}
        aria-label={`Drag ${title}`}
        title="Drag to reposition"
      >
        <GripVertical size={12} aria-hidden />
        <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Move
        </Typography>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, width: '100%', height: '100%' }}>{children}</Box>
    </Box>
  );
}
