import {Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography} from '@mui/material';
import {useState} from 'react';
import {planningTokens, planningSurfaceSx} from '../../ui/planningTheme';
import type {ScenarioAssumption} from '../types';

type Props = {
  assumptions: ScenarioAssumption[];
  onUpdate: (id: string, value: string) => void;
};

const hdrSx = {
  fontSize: 10.5, fontWeight: 800, color: planningTokens.textMuted,
  textTransform: 'uppercase' as const, letterSpacing: '0.06em',
  borderBottom: `2px solid ${planningTokens.border}`, py: 1,
  bgcolor: planningTokens.surfaceMuted,
};

const cellSx = {fontSize: 13, py: 0.8, borderBottom: `1px solid ${planningTokens.border}`};

function AssumptionRow({assumption, onUpdate}: {assumption: ScenarioAssumption; onUpdate: (v: string) => void}) {
  const [editMode, setEditMode] = useState(false);
  const [localValue, setLocalValue] = useState(assumption.value);

  if (editMode && assumption.editable) {
    return (
      <TableRow>
        <TableCell sx={{...cellSx, color: planningTokens.textMuted, fontSize: 11}}>{assumption.category}</TableCell>
        <TableCell sx={{...cellSx, fontWeight: 700}}>{assumption.label}</TableCell>
        <TableCell sx={cellSx} colSpan={2}>
          <Box sx={{display: 'flex', gap: 1, alignItems: 'center'}}>
            <TextField
              size="small" fullWidth value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              sx={{'& .MuiInputBase-input': {fontSize: 13}}}
            />
            <Box
              component="button"
              onClick={() => { onUpdate(localValue); setEditMode(false); }}
              sx={{px: 1.5, py: 0.5, bgcolor: planningTokens.primaryBlue, color: '#fff', border: 'none', borderRadius: 1, cursor: 'pointer', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap'}}
            >
              Save
            </Box>
            <Box
              component="button"
              onClick={() => { setLocalValue(assumption.value); setEditMode(false); }}
              sx={{px: 1.5, py: 0.5, bgcolor: 'transparent', color: planningTokens.textSecondary, border: `1px solid ${planningTokens.border}`, borderRadius: 1, cursor: 'pointer', fontWeight: 700, fontSize: 12}}
            >
              Cancel
            </Box>
          </Box>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow hover onClick={assumption.editable ? () => setEditMode(true) : undefined}
      sx={assumption.editable ? {cursor: 'pointer', '&:hover': {bgcolor: `color-mix(in srgb, ${planningTokens.primaryBlue} 2%, transparent)`}} : {}}>
      <TableCell sx={{...cellSx, color: planningTokens.textMuted, fontSize: 11}}>{assumption.category}</TableCell>
      <TableCell sx={{...cellSx, fontWeight: 700}}>{assumption.label}</TableCell>
      <TableCell sx={cellSx}>{assumption.value}</TableCell>
      <TableCell sx={{...cellSx, color: assumption.editable ? planningTokens.primaryBlue : planningTokens.textMuted, fontSize: 12}}>
        {assumption.editable ? 'Click to edit' : 'Read-only'}
      </TableCell>
    </TableRow>
  );
}

export default function ScenarioAssumptionsPanel({assumptions, onUpdate}: Props) {
  return (
    <Box>
      <Typography sx={{fontSize: 13, color: planningTokens.textMuted, mb: 2}}>
        Editable assumptions are highlighted in blue. Click a row to edit.
      </Typography>
      <Paper elevation={0} sx={{...planningSurfaceSx, overflow: 'hidden'}}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={hdrSx}>Category</TableCell>
                <TableCell sx={hdrSx}>Assumption</TableCell>
                <TableCell sx={hdrSx}>Value</TableCell>
                <TableCell sx={hdrSx}>Edit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assumptions.map((a) => (
                <AssumptionRow key={a.id} assumption={a} onUpdate={(v) => onUpdate(a.id, v)} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
