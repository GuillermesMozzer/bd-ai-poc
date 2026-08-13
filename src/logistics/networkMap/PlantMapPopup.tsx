import React from 'react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { ExternalLink } from 'lucide-react';
import { tokenBrand, tokenText, workstationVisuals } from '../ctV2Theme';
import type { BdPlantSite } from './bdPlantSites';

type PlantMapPopupProps = {
  plant: BdPlantSite;
  onSeeMore: () => void;
};

/** Compact Leaflet popup content with a “see more” affordance into the plant widget. */
export function PlantMapPopup({ plant, onSeeMore }: PlantMapPopupProps) {
  return (
    <Box
      sx={{
        minWidth: 220,
        maxWidth: 280,
        fontFamily: workstationVisuals.fontFamily,
        pr: 0.5,
      }}
    >
      <Stack direction="row" spacing={0.75} alignItems="flex-start" justifyContent="space-between">
        <Box sx={{ minWidth: 0, pr: 0.5 }}>
          <Typography
            sx={{
              fontWeight: 850,
              fontSize: 13,
              lineHeight: 1.3,
              color: tokenText.primary,
            }}
          >
            {plant.name}
          </Typography>
          <Typography
            sx={{
              mt: 0.45,
              fontSize: 11.5,
              lineHeight: 1.35,
              color: tokenText.secondary,
            }}
          >
            {plant.address}
          </Typography>
          <Typography
            sx={{
              mt: 0.55,
              fontSize: 11.5,
              fontStyle: 'italic',
              color: tokenText.secondary,
              lineHeight: 1.35,
            }}
          >
            {plant.focus}
          </Typography>
        </Box>
        <IconButton
          size="small"
          aria-label="Open plant details"
          title="See more details"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSeeMore();
          }}
          sx={{
            mt: -0.35,
            flexShrink: 0,
            color: tokenBrand.main,
            bgcolor: tokenBrand.softBg,
            border: `1px solid ${tokenBrand.light}`,
            '&:hover': { bgcolor: tokenBrand.softBg, opacity: 0.9 },
          }}
        >
          <ExternalLink size={14} />
        </IconButton>
      </Stack>
    </Box>
  );
}

export default PlantMapPopup;
