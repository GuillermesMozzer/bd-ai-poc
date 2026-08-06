import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { createPalletViewer } from './createPalletViewer';

type PalletViewerCanvasProps = {
  layers: number;
  boxesPerLayer: number;
  active: boolean;
  viewCommand?: string | null;
  onViewerReady?: (api: ReturnType<typeof createPalletViewer>) => void;
};

export default function PalletViewerCanvas({
  layers,
  boxesPerLayer,
  active,
  viewCommand,
  onViewerReady,
}: PalletViewerCanvasProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<ReturnType<typeof createPalletViewer> | null>(null);

  useEffect(() => {
    if (!hostRef.current) return undefined;
    const api = createPalletViewer(hostRef.current, { layers, boxesPerLayer });
    apiRef.current = api;
    onViewerReady?.(api);
    return () => {
      api.dispose();
      apiRef.current = null;
    };
  }, [layers, boxesPerLayer, onViewerReady]);

  useEffect(() => {
    if (active) {
      requestAnimationFrame(() => apiRef.current?.refresh());
    }
  }, [active]);

  useEffect(() => {
    if (!viewCommand || !apiRef.current) return;
    const api = apiRef.current;
    if (viewCommand === 'layer') api.cycleLayer();
    else if (viewCommand === 'explode') api.toggleExplode();
    else if (viewCommand === 'ties') api.toggleTies();
    else if (viewCommand === 'reset') api.reset();
    else api.setView(viewCommand);
  }, [viewCommand]);

  return (
    <Box
      ref={hostRef}
      sx={{
        width: '100%',
        height: { xs: 320, md: 420 },
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: '#0f2744',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      aria-label="3D pallet model"
    />
  );
}
