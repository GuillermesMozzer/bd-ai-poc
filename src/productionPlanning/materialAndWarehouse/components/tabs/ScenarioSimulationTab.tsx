import React from 'react';
import {
  Box,
  Button,
  Divider,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {mockScenarios} from '../../mocks';
import type {MaterialWarehouseState} from '../../types';
import {ApprovalStatusBadge} from '../Badges';

interface Props {
  state: MaterialWarehouseState;
  onSetScenarioForm: (form: Partial<MaterialWarehouseState['scenarioForm']>) => void;
  onRunScenario: () => void;
  onClearScenario: () => void;
  onAction: (message: string) => void;
}

const SCENARIO_TYPES = [
  'Supplier Delay',
  'PO Pull-In',
  'Production Plan Increase',
  'Production Plan Reduction',
  'Material Hold',
  'SQA Release Delay',
  'Scrap Factor Change',
  'Safety Stock Change',
  'Alternative Production Sequence',
];

const thSx = {fontSize: 11, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', py: 1, px: 1.2, bgcolor: 'var(--planning-surface-muted)'};
const tdSx = {fontSize: 12, color: '#374151', py: 1, px: 1.2, whiteSpace: 'nowrap'};

export default function ScenarioSimulationTab({state, onSetScenarioForm, onRunScenario, onClearScenario, onAction}: Props) {
  const {scenarioForm, scenarioResult, scenarioHasRun} = state;

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '1fr 1fr'}, gap: 3}}>
        {/* Scenario Builder Form */}
        <Box>
          <Typography sx={{fontSize: 12, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5}}>
            Scenario Builder
          </Typography>
          <Paper elevation={0} sx={{p: 2.5, border: '1px solid var(--planning-border)', borderRadius: 2.5}}>
            <Stack spacing={2}>
              <TextField
                label="Scenario Name"
                size="small"
                value={scenarioForm.scenarioName}
                onChange={(e) => onSetScenarioForm({scenarioName: e.target.value})}
                fullWidth
              />
              <TextField
                select
                label="Scenario Type"
                size="small"
                value={scenarioForm.scenarioType}
                onChange={(e) => onSetScenarioForm({scenarioType: e.target.value})}
                fullWidth
              >
                <MenuItem value="">Select type...</MenuItem>
                {SCENARIO_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
              <TextField
                select
                label="Affected Material"
                size="small"
                value={scenarioForm.affectedMaterial}
                onChange={(e) => onSetScenarioForm({affectedMaterial: e.target.value})}
                fullWidth
              >
                <MenuItem value="">Select material...</MenuItem>
                {['8004430 — Heparin Sodium API', '301656 — Foil ABG Laminate', '700221 — Polycarbonate Resin', '600118 — Stainless Needle', '900778 — Label Case Pack'].map((m) => (
                  <MenuItem key={m} value={m.split(' — ')[0]}>{m}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Assumption Change"
                size="small"
                value={scenarioForm.assumptionChange}
                onChange={(e) => onSetScenarioForm({assumptionChange: e.target.value})}
                placeholder="e.g. Delivery delayed by 2 weeks"
                fullWidth
              />
              <TextField
                label="Date Impact"
                size="small"
                type="date"
                value={scenarioForm.dateImpact}
                onChange={(e) => onSetScenarioForm({dateImpact: e.target.value})}
                InputLabelProps={{shrink: true}}
                fullWidth
              />
              <TextField
                label="Quantity Impact"
                size="small"
                value={scenarioForm.quantityImpact}
                onChange={(e) => onSetScenarioForm({quantityImpact: e.target.value})}
                placeholder="e.g. -200 units"
                fullWidth
              />
              <TextField
                label="Reason"
                size="small"
                value={scenarioForm.reason}
                onChange={(e) => onSetScenarioForm({reason: e.target.value})}
                multiline
                minRows={2}
                fullWidth
              />
              <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
                <Button variant="contained" onClick={onRunScenario}
                  sx={{textTransform: 'none', fontWeight: 800, bgcolor: '#7C3AED', '&:hover': {bgcolor: '#5B21B6'}}}>
                  Run Scenario
                </Button>
                <Button variant="outlined" onClick={() => onAction('Mock scenario saved.')}
                  sx={{textTransform: 'none', fontWeight: 800}}>
                  Save Scenario
                </Button>
                <Button variant="outlined" onClick={() => onAction('Mock baseline comparison started.')}
                  sx={{textTransform: 'none', fontWeight: 800}}>
                  Compare to Baseline
                </Button>
                <Button variant="text" onClick={onClearScenario}
                  sx={{textTransform: 'none', fontWeight: 800, color: 'var(--planning-text-muted)'}}>
                  Clear
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Box>

        {/* Scenario Results */}
        <Box>
          <Typography sx={{fontSize: 12, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5}}>
            Scenario Results
          </Typography>
          {!scenarioHasRun ? (
            <Paper elevation={0} sx={{p: 4, border: '1px solid var(--planning-border)', borderRadius: 2.5, textAlign: 'center', color: 'var(--planning-text-muted)'}}>
              <Typography sx={{fontSize: 13}}>Fill out the form and click "Run Scenario" to see mock impact results.</Typography>
            </Paper>
          ) : scenarioResult ? (
            <Stack spacing={1.5}>
              {[
                {label: 'First Impacted PCN', value: scenarioResult.firstImpactedPcn, tone: '#7C3AED'},
                {label: 'First Shortage Week', value: scenarioResult.firstShortageWeek, tone: '#B42318'},
                {label: 'Maximum Shortage (units)', value: String(scenarioResult.maximumShortage), tone: '#C2410C'},
                {label: 'Affected Work Orders', value: String(scenarioResult.affectedWos), tone: '#374151'},
              ].map(({label, value, tone}) => (
                <Paper key={label} elevation={0} sx={{px: 2, py: 1.5, border: '1px solid var(--planning-border)', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{label}</Typography>
                  <Typography sx={{fontSize: 18, fontWeight: 900, color: tone}}>{value}</Typography>
                </Paper>
              ))}
              <Paper elevation={0} sx={{px: 2, py: 1.5, border: '1px solid #FDE68A', borderRadius: 2, bgcolor: '#FFFBEB'}}>
                <Typography sx={{fontSize: 11, fontWeight: 900, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 0.5}}>
                  Recommended Action
                </Typography>
                <Typography sx={{fontSize: 13, color: '#78350F', lineHeight: 1.6}}>
                  {scenarioResult.recommendedAction}
                </Typography>
              </Paper>
            </Stack>
          ) : null}
        </Box>
      </Box>

      <Divider />

      {/* Saved Scenarios Table */}
      <Box>
        <Typography sx={{fontSize: 12, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5}}>
          Saved Scenarios — {mockScenarios.length} Records
        </Typography>
        <Paper elevation={0} sx={{border: '1px solid var(--planning-border)', borderRadius: 2.5, overflow: 'hidden'}}>
          <TableContainer sx={{overflow: 'auto'}}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Scenario ID', 'Name', 'Owner', 'Reason', 'Baseline Date', 'Affected Materials', 'Assumption Changes', 'Shortage Date', 'vs. Baseline', 'Recommended Action', 'Status'].map((h) => (
                    <TableCell key={h} sx={thSx}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {mockScenarios.map((s) => (
                  <TableRow key={s.scenarioId} hover>
                    <TableCell sx={{...tdSx, fontWeight: 800, color: '#7C3AED'}}>{s.scenarioId}</TableCell>
                    <TableCell sx={{...tdSx, fontWeight: 800}}>{s.scenarioName}</TableCell>
                    <TableCell sx={tdSx}>{s.owner}</TableCell>
                    <TableCell sx={{...tdSx, maxWidth: 150, whiteSpace: 'normal', lineHeight: 1.4}}>{s.reason}</TableCell>
                    <TableCell sx={tdSx}>{s.baselineDate}</TableCell>
                    <TableCell sx={tdSx}>{s.affectedMaterials.join(', ')}</TableCell>
                    <TableCell sx={{...tdSx, maxWidth: 180, whiteSpace: 'normal', lineHeight: 1.4}}>{s.assumptionChanges}</TableCell>
                    <TableCell sx={{...tdSx, color: s.resultingShortageDate ? '#B42318' : '#027A48', fontWeight: 700}}>
                      {s.resultingShortageDate ?? 'None'}
                    </TableCell>
                    <TableCell sx={tdSx}>{s.differenceVsBaseline}</TableCell>
                    <TableCell sx={{...tdSx, maxWidth: 180, whiteSpace: 'normal', lineHeight: 1.4}}>{s.recommendedAction}</TableCell>
                    <TableCell sx={tdSx}><ApprovalStatusBadge status={s.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
}
