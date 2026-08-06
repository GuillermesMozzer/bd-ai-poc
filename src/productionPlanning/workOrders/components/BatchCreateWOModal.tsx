import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stepper, Step, StepLabel,
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Alert, LinearProgress, TextField, CircularProgress,
} from '@mui/material';
import { AutoAwesome as SparkleIcon, CheckCircle as CheckIcon, Error as ErrorIcon, Warning as WarnIcon } from '@mui/icons-material';
import type { BatchCreateRow } from '../types';
import { BATCH_SAMPLE_ROWS } from '../mockData';

interface BatchCreateWOModalProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = ['Input Data', 'Validate', 'Create'];

const STATUS_COLOR: Record<string, string> = { Valid: '#059669', Error: '#DC2626', Warning: '#D97706' };
const STATUS_BG: Record<string, string> = { Valid: '#ECFDF5', Error: '#FEF2F2', Warning: '#FFFBEB' };

export default function BatchCreateWOModal({ open, onClose }: BatchCreateWOModalProps) {
  const [step, setStep] = useState(0);
  const [rows, setRows] = useState<BatchCreateRow[]>([]);
  const [validating, setValidating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [pasted, setPasted] = useState('');

  const loadSample = () => {
    setPasted('SAMPLE DATA LOADED');
    setRows(BATCH_SAMPLE_ROWS);
  };

  const handleValidate = () => {
    setValidating(true);
    setTimeout(() => {
      setValidating(false);
      setStep(1);
    }, 1600);
  };

  const handleCreate = () => {
    setCreating(true);
    setTimeout(() => {
      setCreating(false);
      setCreated(true);
    }, 1800);
  };

  const handleClose = () => {
    setStep(0);
    setRows([]);
    setPasted('');
    setCreated(false);
    onClose();
  };

  const validRows = rows.filter(r => r.status === 'Valid');
  const errorRows = rows.filter(r => r.status === 'Error');
  const warnRows = rows.filter(r => r.status === 'Warning');

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid var(--planning-border)', pb: 2 }}>
        Batch Create Work Orders
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stepper activeStep={step} sx={{ mb: 3 }}>
          {STEPS.map(label => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>

        {/* Step 0: Input */}
        {step === 0 && (
          <Box>
            <Typography variant="body2" sx={{ color: '#475569', mb: 2 }}>
              Paste your WO data below (tab-separated or CSV), or load the sample template to see the expected format.
            </Typography>
            <TextField
              multiline
              rows={6}
              fullWidth
              placeholder="Paste CSV/tab-separated data here…"
              value={pasted}
              onChange={e => setPasted(e.target.value)}
              sx={{ mb: 2, fontFamily: 'monospace' }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" onClick={loadSample}>Load Sample Data</Button>
              {rows.length > 0 && (
                <Typography variant="body2" sx={{ color: '#059669', alignSelf: 'center', fontWeight: 600 }}>
                  {rows.length} rows loaded
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {/* Step 0 → validating transition */}
        {step === 0 && validating && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="caption" sx={{ color: 'var(--planning-text-secondary)', mt: 1, display: 'block' }}>Running AI validation…</Typography>
          </Box>
        )}

        {/* Step 1: Validate */}
        {step === 1 && (
          <Box>
            <Alert
              severity="info"
              icon={<SparkleIcon />}
              sx={{ mb: 2, borderRadius: 2 }}
            >
              <strong>AI Summary:</strong> {validRows.length} rows valid, {errorRows.length} errors, {warnRows.length} warnings.
              {errorRows.length > 0 && ` Errors must be fixed before creation. Most common: ${errorRows.flatMap(r => r.errors).slice(0, 2).join('; ')}.`}
              {warnRows.length > 0 && ` Warnings are non-blocking but review recommended.`}
            </Alert>

            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['#', 'WO ID', 'Material', 'Batch', 'Line', 'Machine', 'Qty', 'Start', 'Status', 'Issues'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.68rem', color: '#475569', py: 0.75 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map(row => (
                    <TableRow key={row.rowIndex} sx={{ bgcolor: STATUS_BG[row.status] }}>
                      <TableCell sx={{ fontSize: '0.72rem', py: 0.75 }}>{row.rowIndex}</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem', py: 0.75, fontWeight: 700 }}>{row.woId}</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem', py: 0.75 }}>{row.materialCode}</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem', py: 0.75 }}>{row.batch}</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem', py: 0.75 }}>{row.line}</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem', py: 0.75 }}>{row.machine}</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem', py: 0.75 }}>{row.plannedQty} {row.uom}</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem', py: 0.75 }}>{new Date(row.scheduledStart).toLocaleDateString()}</TableCell>
                      <TableCell sx={{ py: 0.75 }}>
                        <Chip
                          label={row.status}
                          size="small"
                          icon={row.status === 'Valid' ? <CheckIcon sx={{ fontSize: '14px !important' }} /> : row.status === 'Error' ? <ErrorIcon sx={{ fontSize: '14px !important' }} /> : <WarnIcon sx={{ fontSize: '14px !important' }} />}
                          sx={{ bgcolor: STATUS_BG[row.status], color: STATUS_COLOR[row.status], fontWeight: 700, fontSize: '0.65rem', border: `1px solid color-mix(in srgb, ${STATUS_COLOR[row.status]} 27%, transparent)` }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.68rem', py: 0.75, color: row.status === 'Error' ? '#DC2626' : '#D97706', maxWidth: 200 }}>
                        {[...row.errors, ...row.warnings].join(' | ') || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Box>
        )}

        {/* Step 2: Create */}
        {step === 2 && !created && (
          <Box>
            <Alert severity="warning" icon={<SparkleIcon />} sx={{ mb: 2, borderRadius: 2 }}>
              <strong>AI Recommendation:</strong> {errorRows.length > 0
                ? `Fix ${errorRows.length} errors before proceeding. ${validRows.length} valid rows can be created now.`
                : `All ${validRows.length} rows validated. AI recommends proceeding — no scheduling conflicts detected.`}
            </Alert>
            {creating ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, gap: 2 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ color: 'var(--planning-text-secondary)' }}>Creating {validRows.length} work orders…</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, gap: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>Ready to create {validRows.length} valid work orders</Typography>
                {errorRows.length > 0 && (
                  <Typography variant="body2" sx={{ color: '#DC2626' }}>{errorRows.length} rows with errors will be skipped</Typography>
                )}
              </Box>
            )}
          </Box>
        )}

        {step === 2 && created && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, gap: 2 }}>
            <CheckIcon sx={{ fontSize: 56, color: '#059669' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#059669' }}>{validRows.length} Work Orders Created</Typography>
            <Typography variant="body2" sx={{ color: 'var(--planning-text-secondary)' }}>All valid rows have been submitted. They will appear in your Work Order list momentarily.</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid var(--planning-border)', gap: 1 }}>
        <Button onClick={handleClose} variant="outlined">
          {created ? 'Close' : 'Cancel'}
        </Button>
        {!created && (
          <>
            {step > 0 && !creating && (
              <Button onClick={() => setStep(s => s - 1)}>Back</Button>
            )}
            {step === 0 && (
              <Button
                variant="contained"
                disabled={rows.length === 0 || validating}
                onClick={handleValidate}
                startIcon={validating ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <SparkleIcon />}
                sx={{ bgcolor: 'var(--planning-text-primary)' }}
              >
                {validating ? 'Validating…' : 'Validate with AI'}
              </Button>
            )}
            {step === 1 && (
              <Button
                variant="contained"
                onClick={() => setStep(2)}
                sx={{ bgcolor: 'var(--planning-text-primary)' }}
              >
                Review & Create
              </Button>
            )}
            {step === 2 && !creating && !created && (
              <Button
                variant="contained"
                onClick={handleCreate}
                disabled={validRows.length === 0}
                sx={{ bgcolor: '#059669' }}
              >
                Create {validRows.length} WOs
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
