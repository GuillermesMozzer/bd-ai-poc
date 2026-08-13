import React from 'react';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Typography,
  type SelectChangeEvent,
} from '@mui/material';
import { CT_V2_FREQUENCIES, CT_V2_SITES, type CtV2Frequency, type CtV2SiteId } from './ctV2FilterModel';
import { useCtV2Filters } from './CtV2FiltersContext';
import { ctV2Type, tokenBrand, tokenText, workstationVisuals } from '../ctV2Theme';

const selectSx = {
  minWidth: { xs: '100%', sm: 180 },
  fontFamily: workstationVisuals.fontFamily,
  fontSize: 13,
  fontWeight: 700,
  bgcolor: 'background.paper',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: tokenBrand.light },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: tokenBrand.main },
};

/**
 * Site + frequency filters for Logistics CT V2 header.
 */
export function CtV2FilterBar() {
  const {
    sites,
    frequency,
    setSites,
    setFrequency,
    sitesLabel,
    periodLabel,
  } = useCtV2Filters();

  const handleSites = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const next = (typeof value === 'string' ? value.split(',') : value) as CtV2SiteId[];
    const filtered = next.filter((s) => CT_V2_SITES.includes(s));
    setSites(filtered.length ? filtered : [...CT_V2_SITES]);
  };

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.25}
      alignItems={{ xs: 'stretch', sm: 'flex-end' }}
      justifyContent="flex-end"
      useFlexGap
      flexWrap="wrap"
      sx={{ width: { xs: '100%', md: 'auto' } }}
    >
      <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 220 } }}>
        <InputLabel id="ct-v2-site-filter-label" sx={{ fontWeight: 700, fontSize: 12 }}>
          Plants / sites
        </InputLabel>
        <Select
          labelId="ct-v2-site-filter-label"
          multiple
          value={sites}
          onChange={handleSites}
          input={<OutlinedInput label="Plants / sites" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as CtV2SiteId[]).map((value) => (
                <Chip
                  key={value}
                  size="small"
                  label={value}
                  sx={{
                    height: 22,
                    fontWeight: 800,
                    fontSize: 11,
                    bgcolor: tokenBrand.softBg,
                    color: tokenBrand.main,
                  }}
                />
              ))}
            </Box>
          )}
          sx={selectSx}
        >
          {CT_V2_SITES.map((site) => (
            <MenuItem key={site} value={site} sx={{ fontWeight: 700, fontSize: 13 }}>
              {site}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 } }}>
        <InputLabel id="ct-v2-freq-filter-label" sx={{ fontWeight: 700, fontSize: 12 }}>
          Frequency
        </InputLabel>
        <Select
          labelId="ct-v2-freq-filter-label"
          value={frequency}
          label="Frequency"
          onChange={(e) => setFrequency(e.target.value as CtV2Frequency)}
          sx={selectSx}
        >
          {CT_V2_FREQUENCIES.map((item) => (
            <MenuItem key={item.value} value={item.value} sx={{ fontWeight: 700, fontSize: 13 }}>
              {item.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography
        sx={{
          ...ctV2Type.caption,
          color: tokenText.secondary,
          alignSelf: { xs: 'flex-start', sm: 'center' },
          maxWidth: 220,
        }}
      >
        Viewing {sitesLabel} · {periodLabel}
      </Typography>
    </Stack>
  );
}
