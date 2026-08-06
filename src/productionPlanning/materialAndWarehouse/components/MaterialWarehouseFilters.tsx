import React from 'react';
import {Box, Button, Collapse, MenuItem, TextField, Typography} from '@mui/material';
import {FilterList as FilterListIcon, Clear as ClearIcon} from '@mui/icons-material';
import type {MaterialWarehouseFilters} from '../types';

interface Props {
  filters: MaterialWarehouseFilters;
  expanded: boolean;
  onToggle: () => void;
  onChange: (filters: Partial<MaterialWarehouseFilters>) => void;
  onClear: () => void;
}

const selectSx = {minWidth: 130, '& .MuiInputBase-root': {fontSize: 13}, '& .MuiInputLabel-root': {fontSize: 13}};

export default function MaterialWarehouseFilters({filters, expanded, onToggle, onChange, onClear}: Props) {
  const hasActiveFilters = Object.entries(filters).some(([k, v]) => k !== 'dateHorizon' && v !== '');

  return (
    <Box sx={{bgcolor: '#FAFAFA', borderRadius: 2.5, border: '1px solid var(--planning-border)', overflow: 'hidden'}}>
      <Box
        sx={{display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1, cursor: 'pointer', userSelect: 'none'}}
        onClick={onToggle}
      >
        <FilterListIcon sx={{fontSize: 16, color: 'var(--planning-text-secondary)'}} />
        <Typography sx={{fontSize: 12, fontWeight: 800, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', flex: 1}}>
          Filters
        </Typography>
        {hasActiveFilters && (
          <Button
            size="small"
            startIcon={<ClearIcon sx={{fontSize: 13}} />}
            onClick={(e) => {e.stopPropagation(); onClear();}}
            sx={{fontSize: 11, textTransform: 'none', color: '#B42318', fontWeight: 700, minWidth: 0, px: 1}}
          >
            Clear
          </Button>
        )}
        <Typography sx={{fontSize: 11, color: 'var(--planning-text-muted)'}}>{expanded ? '▲' : '▼'}</Typography>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{px: 2, pb: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'flex-end'}}>
          <TextField select label="Site" value={filters.site} onChange={(e) => onChange({site: e.target.value})} size="small" sx={selectSx}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Plymouth">Plymouth</MenuItem>
          </TextField>

          <TextField select label="Building" value={filters.building} onChange={(e) => onChange({building: e.target.value})} size="small" sx={selectSx}>
            <MenuItem value="">All</MenuItem>
            {['Building 1', 'Building 2', 'Sterilization', 'Warehouse'].map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
          </TextField>

          <TextField select label="Material Type" value={filters.materialType} onChange={(e) => onChange({materialType: e.target.value})} size="small" sx={selectSx}>
            <MenuItem value="">All</MenuItem>
            {['Raw Material', 'Foil', 'Component', 'Finished Goods', 'Sterilization Load'].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>

          <TextField
            label="Material Number"
            value={filters.materialNumber}
            onChange={(e) => onChange({materialNumber: e.target.value})}
            size="small"
            placeholder="e.g. 8004430"
            sx={{...selectSx, minWidth: 150}}
          />

          <TextField select label="PCN" value={filters.pcn} onChange={(e) => onChange({pcn: e.target.value})} size="small" sx={selectSx}>
            <MenuItem value="">All</MenuItem>
            {['NS364314', 'NS364316', 'NS364327', 'NS368860'].map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </TextField>

          <TextField select label="Supplier" value={filters.supplier} onChange={(e) => onChange({supplier: e.target.value})} size="small" sx={selectSx}>
            <MenuItem value="">All</MenuItem>
            {['Supplier ABC', 'Foil Supplier Ltd', 'Polymer Global', 'Precision Medical', 'Print Vendor', 'Seal Tech'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>

          <TextField select label="Status" value={filters.status} onChange={(e) => onChange({status: e.target.value})} size="small" sx={selectSx}>
            <MenuItem value="">All</MenuItem>
            {['Ready', 'Warning', 'Critical', 'Blocked', 'On Hold', 'In Transit', 'Shortage', 'Unknown'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>

          <TextField select label="Date Horizon" value={filters.dateHorizon} onChange={(e) => onChange({dateHorizon: e.target.value})} size="small" sx={selectSx}>
            {['4 Weeks', '13 Weeks', 'Fiscal Year', 'Custom'].map((h) => <MenuItem key={h} value={h}>{h}</MenuItem>)}
          </TextField>

          <TextField select label="Data Source" value={filters.dataSource} onChange={(e) => onChange({dataSource: e.target.value})} size="small" sx={selectSx}>
            <MenuItem value="">All</MenuItem>
            {['SAP ECC', 'Manual', 'LOTS', 'External'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
        </Box>
      </Collapse>
    </Box>
  );
}
