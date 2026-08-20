import React from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { BD_CONTINENTS, continentLabel, type BdContinent } from '../networkMap/bdPlantSites';
import {
  CT_V2_FREQUENCIES,
  CT_V2_SITES,
  plantForSiteId,
  siteShortName,
  sitesByContinent,
  type CtV2Frequency,
  type CtV2SiteId,
} from './ctV2FilterModel';
import { useCtV2Filters } from './CtV2FiltersContext';
import { ctV2Type, tokenBrand, tokenText, workstationVisuals } from '../ctV2Theme';

const fieldSx = {
  fontFamily: workstationVisuals.fontFamily,
  fontSize: 13,
  fontWeight: 700,
  bgcolor: 'background.paper',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: tokenBrand.light },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: tokenBrand.main },
};

const continentBtnSx = {
  textTransform: 'none' as const,
  fontWeight: 800,
  minWidth: 0,
  px: 0.9,
  py: 0.2,
  fontSize: 11,
  lineHeight: 1.4,
  color: tokenBrand.main,
  '&:hover': { bgcolor: tokenBrand.softBg },
};

/**
 * Site + frequency filters for Logistics CT V2 header.
 * Layout: one control row (plants + frequency), then shortcuts + status.
 */
export function CtV2FilterBar() {
  const {
    sites,
    frequency,
    setSites,
    setFrequency,
    selectAllSites,
    sitesLabel,
    periodLabel,
    allSitesSelected,
  } = useCtV2Filters();

  const selectedCount = sites.length;

  const applyContinent = (continent: BdContinent) => {
    setSites(sitesByContinent(continent));
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 168px' },
        gridTemplateRows: 'auto auto',
        columnGap: 1.5,
        rowGap: 0.75,
        alignItems: 'start',
      }}
    >
      <Autocomplete
        multiple
        disableCloseOnSelect
        options={CT_V2_SITES}
        groupBy={(id) => {
          const plant = plantForSiteId(id);
          return plant ? continentLabel(plant.continent) : 'Other';
        }}
        getOptionLabel={(id) => {
          const plant = plantForSiteId(id);
          return plant ? `${plant.shortName} · ${plant.city}` : id;
        }}
        value={sites}
        onChange={(_, next) => {
          const filtered = (next as CtV2SiteId[]).filter((s) => CT_V2_SITES.includes(s));
          setSites(filtered.length ? filtered : [...CT_V2_SITES]);
        }}
        renderTags={(selected) => {
          if (selected.length === CT_V2_SITES.length) {
            return (
              <Chip
                size="small"
                label={`All plants (${CT_V2_SITES.length})`}
                sx={{ height: 22, fontWeight: 800, fontSize: 11, bgcolor: tokenBrand.softBg, color: tokenBrand.main }}
              />
            );
          }
          const shown = selected.slice(0, 2);
          return (
            <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
              {shown.map((id) => (
                <Chip
                  key={id}
                  size="small"
                  label={siteShortName(id)}
                  sx={{ height: 22, fontWeight: 800, fontSize: 11, bgcolor: tokenBrand.softBg, color: tokenBrand.main }}
                />
              ))}
              {selected.length > 2 ? (
                <Chip size="small" label={`+${selected.length - 2}`} sx={{ height: 22, fontWeight: 800, fontSize: 11 }} />
              ) : null}
            </Stack>
          );
        }}
        renderOption={(props, option, { selected }) => {
          const plant = plantForSiteId(option);
          const { key, ...rest } = props as typeof props & { key?: string };
          return (
            <li key={key ?? option} {...rest}>
              <Checkbox size="small" checked={selected} sx={{ mr: 0.5 }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 750 }}>{plant?.shortName ?? option}</Typography>
                <Typography sx={{ fontSize: 11, color: tokenText.secondary }}>
                  {plant?.city} · {plant?.kind}
                </Typography>
              </Box>
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            label="Plants / sites"
            placeholder={allSitesSelected ? 'Search plants…' : 'Add plant…'}
          />
        )}
        slotProps={{
          paper: { sx: { maxHeight: 420 } },
          listbox: { sx: { maxHeight: 320 } },
        }}
        sx={{
          minWidth: 0,
          gridColumn: { xs: '1', md: '1' },
          gridRow: { xs: 'auto', md: '1' },
          '& .MuiOutlinedInput-root': fieldSx,
        }}
      />

      <FormControl
        size="small"
        sx={{
          width: { xs: '100%', md: 168 },
          gridColumn: { xs: '1', md: '2' },
          gridRow: { xs: 'auto', md: '1' },
          alignSelf: 'stretch',
        }}
      >
        <InputLabel id="ct-v2-freq-filter-label" sx={{ fontWeight: 700, fontSize: 12 }}>
          Frequency
        </InputLabel>
        <Select
          labelId="ct-v2-freq-filter-label"
          value={frequency}
          label="Frequency"
          onChange={(e) => setFrequency(e.target.value as CtV2Frequency)}
          sx={{ ...fieldSx, minWidth: 0, height: 40 }}
        >
          {CT_V2_FREQUENCIES.map((item) => (
            <MenuItem key={item.value} value={item.value} sx={{ fontWeight: 700, fontSize: 13 }}>
              {item.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Stack
        direction="row"
        spacing={0.25}
        useFlexGap
        flexWrap="wrap"
        alignItems="center"
        sx={{
          gridColumn: { xs: '1', md: '1' },
          gridRow: { xs: 'auto', md: '2' },
          minWidth: 0,
          pt: 0.15,
        }}
      >
        <Button size="small" onClick={selectAllSites} sx={continentBtnSx}>
          All
        </Button>
        {BD_CONTINENTS.map((c) => (
          <Button key={c} size="small" onClick={() => applyContinent(c)} sx={continentBtnSx}>
            {continentLabel(c)}
          </Button>
        ))}
      </Stack>

      <Typography
        sx={{
          ...ctV2Type.caption,
          color: tokenText.secondary,
          gridColumn: { xs: '1', md: '2' },
          gridRow: { xs: 'auto', md: '2' },
          textAlign: { xs: 'left', md: 'right' },
          alignSelf: { xs: 'flex-start', md: 'center' },
          whiteSpace: { md: 'nowrap' },
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          pt: 0.15,
        }}
        title={`Viewing ${sitesLabel} · ${periodLabel}${!allSitesSelected ? ` · ${selectedCount} selected` : ''}`}
      >
        {allSitesSelected
          ? `${periodLabel} · all plants`
          : `${periodLabel} · ${selectedCount} selected`}
      </Typography>
    </Box>
  );
}
