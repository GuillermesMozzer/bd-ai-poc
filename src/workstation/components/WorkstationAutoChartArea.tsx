import {useEffect, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import {Box} from '@mui/material';

type WorkstationAutoChartAreaProps = {
  children: (height: number, width: number) => ReactNode;
  maxHeight?: number;
  minHeight?: number;
};

export default function WorkstationAutoChartArea({
  children,
  maxHeight = 320,
  minHeight = 96,
}: WorkstationAutoChartAreaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: Math.max(minHeight, Math.min(maxHeight, 220)),
  });

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateDimensions = (nextWidth: number, nextHeight: number) => {
      const boundedHeight = Math.max(minHeight, Math.min(maxHeight, Math.floor(nextHeight)));
      setDimensions((prev) => {
        if (prev.width === nextWidth && prev.height === boundedHeight) return prev;
        return {width: Math.floor(nextWidth), height: boundedHeight};
      });
    };

    const rect = node.getBoundingClientRect();
    updateDimensions(rect.width, rect.height);

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      const {width, height} = entries[0].contentRect;
      updateDimensions(width, height);
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, [maxHeight, minHeight]);

  return (
    <Box
      ref={containerRef}
      sx={{
        flexGrow: 1,
        minHeight,
        height: '100%',
        width: '100%',
        minWidth: 0,
      }}
    >
      {dimensions.width > 0 ? children(dimensions.height, dimensions.width) : null}
    </Box>
  );
}
