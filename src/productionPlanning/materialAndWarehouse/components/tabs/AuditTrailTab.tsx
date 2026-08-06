import React, {useState} from 'react';
import {Box, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography} from '@mui/material';
import {mockAuditTrail} from '../../mocks';

interface Props {
  onAction: (message: string) => void;
}

const thSx = {fontSize: 11, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', py: 1, px: 1.2, bgcolor: 'var(--planning-surface-muted)'};
const tdSx = {fontSize: 12, color: '#374151', py: 1, px: 1.2, whiteSpace: 'nowrap'};

const EVENT_TYPES = ['', 'Status Change', 'Expedite Action', 'Receipt', 'Safety Stock Change'];
const OBJECT_TYPES = ['', 'Material', 'SQA Hold', 'Expedite Action', 'Receipt', 'Safety Stock'];
const USERS = ['', 'Maria Santos', 'SQA Team', 'John Carvalho', 'P. Costa', 'Carlos Ferreira', 'Procurement'];

export default function AuditTrailTab({onAction: _onAction}: Props) {
  const [filterEventType, setFilterEventType] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterObjectType, setFilterObjectType] = useState('');

  const rows = mockAuditTrail.filter((r) => {
    if (filterUser && r.user !== filterUser) return false;
    if (filterObjectType && r.objectType !== filterObjectType) return false;
    return true;
  });

  return (
    <Box>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1}}>
        <Typography sx={{fontSize: 12, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em'}}>
          Audit Trail — {rows.length} Events
        </Typography>
      </Box>

      {/* Filters */}
      <Box sx={{display: 'flex', gap: 1.5, mb: 1.5, flexWrap: 'wrap'}}>
        <TextField select label="Event Type" value={filterEventType} onChange={(e) => setFilterEventType(e.target.value)} size="small"
          sx={{minWidth: 160, '& .MuiInputBase-root': {fontSize: 13}}}>
          {EVENT_TYPES.map((t) => <MenuItem key={t} value={t}>{t || 'All'}</MenuItem>)}
        </TextField>
        <TextField select label="User" value={filterUser} onChange={(e) => setFilterUser(e.target.value)} size="small"
          sx={{minWidth: 160, '& .MuiInputBase-root': {fontSize: 13}}}>
          {USERS.map((u) => <MenuItem key={u} value={u}>{u || 'All'}</MenuItem>)}
        </TextField>
        <TextField select label="Object Type" value={filterObjectType} onChange={(e) => setFilterObjectType(e.target.value)} size="small"
          sx={{minWidth: 160, '& .MuiInputBase-root': {fontSize: 13}}}>
          {OBJECT_TYPES.map((o) => <MenuItem key={o} value={o}>{o || 'All'}</MenuItem>)}
        </TextField>
      </Box>

      <Paper elevation={0} sx={{border: '1px solid var(--planning-border)', borderRadius: 2.5, overflow: 'hidden'}}>
        <TableContainer sx={{overflow: 'auto'}}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Event ID', 'Timestamp', 'User', 'Role', 'Object Type', 'Object ID', 'Previous Value', 'New Value', 'Reason Code', 'Comment', 'Source Screen'].map((h) => (
                  <TableCell key={h} sx={thSx}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} sx={{textAlign: 'center', py: 4, color: 'var(--planning-text-muted)', fontSize: 13}}>
                    No audit events match the current filters.
                  </TableCell>
                </TableRow>
              ) : rows.map((r) => (
                <TableRow key={r.eventId} hover>
                  <TableCell sx={{...tdSx, fontWeight: 800, color: '#1D4ED8'}}>{r.eventId}</TableCell>
                  <TableCell sx={tdSx}>{new Date(r.timestamp).toLocaleString()}</TableCell>
                  <TableCell sx={{...tdSx, fontWeight: 700}}>{r.user}</TableCell>
                  <TableCell sx={tdSx}>{r.role}</TableCell>
                  <TableCell sx={tdSx}>{r.objectType}</TableCell>
                  <TableCell sx={{...tdSx, fontWeight: 800, color: '#7C3AED'}}>{r.objectId}</TableCell>
                  <TableCell sx={{...tdSx, color: 'var(--planning-text-muted)', maxWidth: 140, whiteSpace: 'normal', lineHeight: 1.4}}>{r.previousValue}</TableCell>
                  <TableCell sx={{...tdSx, fontWeight: 700, color: 'var(--planning-text-primary)', maxWidth: 140, whiteSpace: 'normal', lineHeight: 1.4}}>{r.newValue}</TableCell>
                  <TableCell sx={tdSx}>{r.reasonCode}</TableCell>
                  <TableCell sx={{...tdSx, maxWidth: 200, whiteSpace: 'normal', lineHeight: 1.4}}>{r.comment}</TableCell>
                  <TableCell sx={tdSx}>{r.sourceScreen}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
