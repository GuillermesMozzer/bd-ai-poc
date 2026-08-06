import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, MenuItem, Select, TextField, Typography,
} from '@mui/material';
import {useState} from 'react';
import {planningTokens} from '../../ui/planningTheme';
import type {ScenarioChange, ScenarioChangeCategoryType, ScenarioSeverity, ScenarioValueType} from '../types';
import {LINES, LT_PERIODS, PRODUCTS, ST_PERIODS} from '../mock';

type Props = {
  open: boolean;
  scenarioId: string;
  periods: string[];
  onClose: () => void;
  onSave: (change: ScenarioChange) => void;
};

const CATEGORIES: {value: ScenarioChangeCategoryType; label: string}[] = [
  {value: 'DemandChange', label: 'Demand Change'},
  {value: 'CapacityChange', label: 'Capacity Change'},
  {value: 'LineAssignmentChange', label: 'Line Assignment Change'},
  {value: 'InventoryPolicyChange', label: 'Inventory Policy Change'},
  {value: 'CalendarEvent', label: 'Calendar Event (Downtime)'},
  {value: 'MaterialConstraint', label: 'Material Constraint'},
  {value: 'PriorityChange', label: 'Priority Change'},
];

const VALUE_TYPES: {value: ScenarioValueType; label: string}[] = [
  {value: 'Percentage', label: 'Percentage (%)'},
  {value: 'Quantity', label: 'Quantity (Units)'},
  {value: 'Hours', label: 'Hours'},
  {value: 'Days', label: 'Days'},
  {value: 'Text', label: 'Text'},
];

const SEVERITIES: {value: ScenarioSeverity; label: string}[] = [
  {value: 'Info', label: 'Info'},
  {value: 'Warning', label: 'Warning'},
  {value: 'Blocker', label: 'Blocker'},
];

export default function AddScenarioChangeDialog({open, scenarioId, periods, onClose, onSave}: Props) {
  const [category, setCategory] = useState<ScenarioChangeCategoryType>('DemandChange');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<ScenarioSeverity>('Warning');
  const [productCode, setProductCode] = useState('');
  const [lineId, setLineId] = useState('');
  const [startPeriod, setStartPeriod] = useState(periods[0] ?? '');
  const [endPeriod, setEndPeriod] = useState(periods[0] ?? '');
  const [valueType, setValueType] = useState<ScenarioValueType>('Percentage');
  const [scenarioValue, setScenarioValue] = useState('');
  const [reason, setReason] = useState('');

  const isValid = title.trim().length > 0 && startPeriod && endPeriod && scenarioValue.trim().length > 0;

  function handleSave() {
    if (!isValid) return;
    const scenVal = isNaN(Number(scenarioValue)) ? scenarioValue : Number(scenarioValue);
    const change: ScenarioChange = {
      id: `chg-${Date.now()}`,
      scenarioId,
      category,
      title: title.trim(),
      description: description.trim(),
      active: true,
      severity,
      productCode: productCode || undefined,
      lineId: lineId || undefined,
      startPeriod,
      endPeriod,
      valueType,
      baselineValue: 0,
      scenarioValue: scenVal,
      deltaValue: typeof scenVal === 'number' ? scenVal : 0,
      reason: reason.trim() || undefined,
    };
    onSave(change);
    resetForm();
  }

  function resetForm() {
    setTitle('');
    setDescription('');
    setCategory('DemandChange');
    setSeverity('Warning');
    setProductCode('');
    setLineId('');
    setStartPeriod(periods[0] ?? '');
    setEndPeriod(periods[0] ?? '');
    setValueType('Percentage');
    setScenarioValue('');
    setReason('');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{fontWeight: 900, color: planningTokens.textPrimary, pb: 1}}>
        Add Scenario Change
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, pt: 1}}>
          <FormControl size="small" fullWidth>
            <InputLabel>Category *</InputLabel>
            <Select value={category} label="Category *" onChange={(e) => setCategory(e.target.value as ScenarioChangeCategoryType)}>
              {CATEGORIES.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField size="small" label="Title *" value={title} onChange={(e) => setTitle(e.target.value)}
            error={!title.trim()} helperText={!title.trim() ? 'Title is required.' : ''} fullWidth />

          <TextField size="small" label="Description" value={description}
            onChange={(e) => setDescription(e.target.value)} multiline minRows={2} fullWidth />

          <FormControl size="small" fullWidth>
            <InputLabel>Severity</InputLabel>
            <Select value={severity} label="Severity" onChange={(e) => setSeverity(e.target.value as ScenarioSeverity)}>
              {SEVERITIES.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
            </Select>
          </FormControl>

          <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5}}>
            <FormControl size="small" fullWidth>
              <InputLabel>Affected Product</InputLabel>
              <Select value={productCode} label="Affected Product" onChange={(e) => setProductCode(e.target.value)}>
                <MenuItem value="">All Products</MenuItem>
                {PRODUCTS.map((p) => <MenuItem key={p.code} value={p.code}>{p.code} — {p.desc}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Affected Line</InputLabel>
              <Select value={lineId} label="Affected Line" onChange={(e) => setLineId(e.target.value)}>
                <MenuItem value="">All Lines</MenuItem>
                {LINES.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5}}>
            <FormControl size="small" fullWidth>
              <InputLabel>Start Period *</InputLabel>
              <Select value={startPeriod} label="Start Period *" onChange={(e) => setStartPeriod(e.target.value)}>
                {periods.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>End Period *</InputLabel>
              <Select value={endPeriod} label="End Period *" onChange={(e) => setEndPeriod(e.target.value)}>
                {periods.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5}}>
            <FormControl size="small" fullWidth>
              <InputLabel>Value Type</InputLabel>
              <Select value={valueType} label="Value Type" onChange={(e) => setValueType(e.target.value as ScenarioValueType)}>
                {VALUE_TYPES.map((v) => <MenuItem key={v.value} value={v.value}>{v.label}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField size="small" label="Scenario Value *" value={scenarioValue}
              onChange={(e) => setScenarioValue(e.target.value)}
              error={!scenarioValue.trim()}
              helperText={valueType === 'Percentage' ? 'e.g. 20 for +20%' : ''}
              fullWidth />
          </Box>

          <TextField size="small" label="Reason / Comment" value={reason}
            onChange={(e) => setReason(e.target.value)} multiline minRows={2} fullWidth
            placeholder="Explain the rationale for this change." />

          <Typography sx={{fontSize: 11.5, color: planningTokens.textMuted}}>
            * Required fields. Changes are stored in local state only and will be included in the next simulation run.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{p: 2, gap: 1}}>
        <Button onClick={handleClose} sx={{textTransform: 'none', fontWeight: 700}}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!isValid}
          onClick={handleSave}
          sx={{textTransform: 'none', fontWeight: 800, bgcolor: planningTokens.primaryBlue, '&:hover': {bgcolor: '#1558d6'}}}
        >
          Save Change
        </Button>
      </DialogActions>
    </Dialog>
  );
}
