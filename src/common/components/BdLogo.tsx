import React from 'react';
import { Box, type BoxProps } from '@mui/material';

/** Official BD navy for the wordmark on light surfaces. */
export const BD_WORDMARK_BLUE = '#032B75';
/** Wordmark on dark surfaces only — the only allowed color swap. */
export const BD_WORDMARK_ON_DARK = '#FFFFFF';

export type BdLogoSurface = 'onLight' | 'onDark';

type BdLogoProps = {
  /** Total logo height in px (symbol scales with wordmark). */
  height?: number;
  /**
   * `onLight` → navy BD wordmark.
   * `onDark` → white BD wordmark.
   * Symbol (orange / white) colors never change.
   */
  surface?: BdLogoSurface;
  /** When false, renders only the orange symbol. */
  showWordmark?: boolean;
  alt?: string;
  sx?: BoxProps['sx'];
};

/**
 * BD brand lockup: orange symbol (unchanged) + BD wordmark
 * (blue on light, white on dark).
 */
export default function BdLogo({
  height = 28,
  surface = 'onLight',
  showWordmark = true,
  alt = 'BD',
  sx,
}: BdLogoProps) {
  const wordmarkFill = surface === 'onDark' ? BD_WORDMARK_ON_DARK : BD_WORDMARK_BLUE;
  const symbolHeight = height;
  const wordmarkFontSize = Math.round(height * 0.92);

  return (
    <Box
      component="span"
      role="img"
      aria-label={alt}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${Math.max(6, Math.round(height * 0.28))}px`,
        lineHeight: 0,
        flexShrink: 0,
        ...((sx as object) ?? {}),
      }}
    >
      <Box
        component="img"
        src="/images/bd-symbol-rgb.png"
        alt=""
        aria-hidden
        sx={{
          height: symbolHeight,
          width: 'auto',
          display: 'block',
          // Never invert / recolor the symbol — preserve brand orange.
          filter: 'none',
        }}
      />
      {showWordmark ? (
        <Box
          component="span"
          aria-hidden
          sx={{
            fontFamily: '"Arial Rounded MT Bold", "Arial Black", Arial, Helvetica, sans-serif',
            fontWeight: 900,
            fontSize: wordmarkFontSize,
            letterSpacing: '-0.04em',
            color: wordmarkFill,
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          BD
        </Box>
      ) : null}
    </Box>
  );
}
