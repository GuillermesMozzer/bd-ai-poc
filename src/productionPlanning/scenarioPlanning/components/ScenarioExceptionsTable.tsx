import {Box, FormControl, InputLabel, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from '@mui/material';
import {useState} from 'react';
import {planningTokens, planningSurfaceSx} from '../../ui/planningTheme';
import {SeverityBadge} from './Badges';
import type {ScenarioException, ScenarioExceptionCategory, ScenarioSeverity} from '../types';

type Props = {
  exceptions: ScenarioException[];
};

const hdrSx = {
  fontSize: 10.5, fontWeight: 800, color: planningTokens.textMuted,
  textTransform: 'uppercase' as const, letterSpacing: '0.06em',
  borderBottom: `2px solid ${planningTokens.border}`, py: 1,
  bgcolor: planningTokens.surfaceMuted,
};

const cellSx = {fontSize: 12.5, py: 1, borderBottom: `1px solid ${planningTokens.border}`};

const SEVERITIES: Array<ScenarioSeverity | ''> = ['', 'Blocker', 'Warning', 'Info'];
const CATEGORIES: Array<ScenarioExceptionCategory | ''> = ['', 'Capacity', 'Inventory', 'Demand', 'MRPReadiness', 'Material', 'FrozenPeriod', 'Planning'];

export default function ScenarioExceptionsTable({exceptions}: Props) {
  const [filterSeverity, setFilterSeverity] = useState<ScenarioSeverity | ''>('');
  const [filterCategory, setFilterCategory] = useState<ScenarioExceptionCategory | ''>('');

  const filtered = exceptions.filter((e) => {
    if (filterSeverity && e.severity !== filterSeverity) return false;
    if (filterCategory && e.category !== filterCategory) return false;
    return true;
  });

  const blockerCount = exceptions.filter((e) => e.severity === 'Blocker').length;
  const warningCount = exceptions.filter((e) => e.severity === 'Warning').length;

  return (
    <Box>
      <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2, alignItems: 'center'}}>
        <FormControl size="small" sx={{minWidth: 140}}>
          <InputLabel sx={{fontSize: 12}}>Severity</InputLabel>
          <Select value={filterSeverity} label="Severity" onChange={(e) => setFilterSeverity(e.target.value as ScenarioSeverity | '')} sx={{fontSize: 13}}>
            {SEVERITIES.map((s) => <MenuItem key={s} value={s} sx={{fontSize: 13}}>{s || 'All'}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{minWidth: 160}}>
          <InputLabel sx={{fontSize: 12}}>Category</InputLabel>
          <Select value={filterCategory} label="Category" onChange={(e) => setFilterCategory(e.target.value as ScenarioExceptionCategory | '')} sx={{fontSize: 13}}>
            {CATEGORIES.map((c) => <MenuItem key={c} value={c} sx={{fontSize: 13}}>{c || 'All'}</MenuItem>)}
          </Select>
        </FormControl>
        <Box sx={{ml: 'auto', display: 'flex', gap: 1.5}}>
          <Typography sx={{fontSize: 12, color: planningTokens.danger, fontWeight: 800}}>
            {blockerCount} Blocker{blockerCount !== 1 ? 's' : ''}
          </Typography>
          <Typography sx={{fontSize: 12, color: planningTokens.warning, fontWeight: 800}}>
            {warningCount} Warning{warningCount !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </Box>

      <Paper elevation={0} sx={{...planningSurfaceSx, overflow: 'hidden'}}>
        <TableContainer sx={{maxHeight: 480}}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={hdrSx}>Severity</TableCell>
                <TableCell sx={hdrSx}>Category</TableCell>
                <TableCell sx={hdrSx}>Product</TableCell>
                <TableCell sx={hdrSx}>Period</TableCell>
                <TableCell sx={hdrSx}>Line</TableCell>
                <TableCell sx={hdrSx}>Reason</TableCell>
                <TableCell sx={hdrSx}>Suggested Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((exc) => (
                <TableRow key={exc.id} hover
                  sx={{bgcolor: exc.severity === 'Blocker' ? '#FEF2F208' : exc.severity === 'Warning' ? '#FFF7ED08' : 'transparent'}}>
                  <TableCell sx={cellSx}><SeverityBadge severity={exc.severity} /></TableCell>
                  <TableCell sx={cellSx}>{exc.category}</TableCell>
                  <TableCell sx={{...cellSx, fontWeight: 700}}>{exc.productCode ?? '—'}</TableCell>
                  <TableCell sx={cellSx}>{exc.period}</TableCell>
                  <TableCell sx={cellSx}>{exc.lineId ?? '—'}</TableCell>
                  <TableCell sx={{...cellSx, maxWidth: 280}}>
                    <Typography sx={{fontSize: 12.5, lineHeight: 1.4}}>{exc.reason}</Typography>
                  </TableCell>
                  <TableCell sx={{...cellSx, maxWidth: 280}}>
                    <Typography sx={{fontSize: 12.5, color: planningTokens.primaryBlue, lineHeight: 1.4}}>{exc.suggestedAction}</Typography>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{textAlign: 'center', py: 3, color: planningTokens.textMuted, fontSize: 13}}>
                    No exceptions match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
