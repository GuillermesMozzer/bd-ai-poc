import {Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Paper, Stack, TextField, Typography} from '@mui/material';
import type {LongTermPlanRowView, ProductionLine, ScenarioComparisonRow} from '../types';
import {StatusBadge} from './Badges';

type ScenarioDialogProps = {
  open: boolean;
  mode: 'create' | 'compare';
  name: string;
  description: string;
  assumptions: string;
  selectedRows: LongTermPlanRowView[];
  scenarioEdits: Record<string, {committedQuantity: string; assignedLineId: string; plannerComment: string}>;
  productionLines: ProductionLine[];
  comparisonRows: ScenarioComparisonRow[];
  onClose: () => void;
  onChangeField: (field: 'name' | 'description' | 'assumptions', value: string) => void;
  onChangeRow: (planLineId: string, field: 'committedQuantity' | 'assignedLineId' | 'plannerComment', value: string) => void;
  onSaveDraft: () => void;
  onCompare: () => void;
  onApply: () => void;
  onDiscard: () => void;
};

export default function ScenarioDialog(props: ScenarioDialogProps) {
  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{fontWeight: 900, color: 'var(--planning-text-primary)'}}>
        {props.mode === 'create' ? 'Create Scenario' : 'Compare Scenario'}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
            <TextField label="Scenario name" value={props.name} onChange={(event) => props.onChangeField('name', event.target.value)} fullWidth />
            <TextField label="Description" value={props.description} onChange={(event) => props.onChangeField('description', event.target.value)} fullWidth />
          </Stack>
          <TextField
            multiline
            minRows={3}
            label="Assumptions / comments"
            value={props.assumptions}
            onChange={(event) => props.onChangeField('assumptions', event.target.value)}
            fullWidth
          />
          <Paper elevation={0} sx={{p: 1.3, borderRadius: 3, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface-muted)'}}>
            <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 900, textTransform: 'uppercase'}}>
              Selected rows
            </Typography>
            {props.selectedRows.length ? (
              <Stack spacing={1.2} sx={{mt: 1.1}}>
                {props.selectedRows.map((row) => {
                  const edit = props.scenarioEdits[row.id] ?? {
                    committedQuantity: String(typeof row.committedQuantity === 'number' ? row.committedQuantity : row.requestedQuantity),
                    assignedLineId: row.assignedLineId ?? '',
                    plannerComment: row.plannerComment ?? '',
                  };
                  return (
                    <Paper key={row.id} elevation={0} sx={{p: 1.2, borderRadius: 2.5, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface)'}}>
                      <Stack direction={{xs: 'column', lg: 'row'}} spacing={1.2} alignItems={{lg: 'center'}}>
                        <div style={{minWidth: 220}}>
                          <Typography sx={{fontSize: 13, color: 'var(--planning-text-primary)', fontWeight: 900}}>
                            {row.productCode} · {row.month}
                          </Typography>
                          <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)'}}>
                            Baseline committed: {typeof row.committedQuantity === 'number' ? row.committedQuantity : row.requestedQuantity}
                          </Typography>
                        </div>
                        <TextField
                          label="Scenario committed quantity"
                          size="small"
                          type="number"
                          value={edit.committedQuantity}
                          onChange={(event) => props.onChangeRow(row.id, 'committedQuantity', event.target.value)}
                        />
                        <TextField
                          select
                          label="Scenario assigned line"
                          size="small"
                          value={edit.assignedLineId}
                          onChange={(event) => props.onChangeRow(row.id, 'assignedLineId', event.target.value)}
                          sx={{minWidth: 180}}
                        >
                          {props.productionLines.map((line) => <MenuItem key={line.id} value={line.id}>{line.name}</MenuItem>)}
                        </TextField>
                        <TextField
                          label="Scenario comment"
                          size="small"
                          value={edit.plannerComment}
                          onChange={(event) => props.onChangeRow(row.id, 'plannerComment', event.target.value)}
                          fullWidth
                        />
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            ) : (
              <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', mt: 1}}>
                Select planning rows in the grid before creating a scenario.
              </Typography>
            )}
          </Paper>
          {props.comparisonRows.length ? (
            <Paper elevation={0} sx={{p: 1.3, borderRadius: 3, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface-muted)'}}>
              <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 900, textTransform: 'uppercase'}}>
                Scenario comparison
              </Typography>
              <Stack spacing={1} sx={{mt: 1.1}}>
                {props.comparisonRows.map((row) => (
                  <Paper key={row.planLineId} elevation={0} sx={{p: 1.15, borderRadius: 2.5, border: '1px solid var(--planning-border)'}}>
                    <Stack direction={{xs: 'column', xl: 'row'}} spacing={1.2} justifyContent="space-between">
                      <div>
                        <Typography sx={{fontSize: 13, color: 'var(--planning-text-primary)', fontWeight: 900}}>
                          {row.productCode} · {row.month}
                        </Typography>
                        <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)', mt: 0.3}}>
                          Baseline qty {row.baselineCommittedQuantity} → Scenario qty {row.scenarioCommittedQuantity}
                        </Typography>
                      </div>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                        <StatusBadge status={row.baselineStatus} />
                        <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)'}}>→</Typography>
                        <StatusBadge status={row.scenarioStatus} />
                      </Stack>
                      <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)', fontWeight: 700}}>
                        Utilization {row.baselineUtilization}% → {row.scenarioUtilization}% · Required hours delta {row.requiredHoursDelta}
                      </Typography>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Paper>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{p: 2}}>
        <Button color="error" onClick={props.onDiscard} sx={{textTransform: 'none', fontWeight: 800}}>Discard</Button>
        <Button onClick={props.onSaveDraft} sx={{textTransform: 'none', fontWeight: 800}}>Save Draft</Button>
        <Button variant="outlined" onClick={props.onCompare} sx={{textTransform: 'none', fontWeight: 800}}>Compare</Button>
        <Button variant="contained" onClick={props.onApply} sx={{textTransform: 'none', fontWeight: 800, bgcolor: '#6D28D9', '&:hover': {bgcolor: '#5B21B6'}}}>
          Apply to Working Plan
        </Button>
      </DialogActions>
    </Dialog>
  );
}
