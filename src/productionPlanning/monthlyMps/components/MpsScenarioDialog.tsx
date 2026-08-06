import {Close as CloseIcon} from '@mui/icons-material';
import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography} from '@mui/material';
import {useState} from 'react';
import type {MpsBucketLine, MpsScenario, ScenarioComparisonRow} from '../types';

type DialogMode = 'create' | 'compare';

type Props = {
  open: boolean;
  mode: DialogMode;
  scenarios: MpsScenario[];
  selectedScenarioId: string | null;
  comparisonRows: ScenarioComparisonRow[];
  currentUser: string;
  planId: string;
  onClose: () => void;
  onCreateScenario: (scenario: MpsScenario) => void;
  onSelectScenario: (id: string) => void;
  onApplyScenario: (scenarioId: string) => void;
  onDiscardScenario: (scenarioId: string) => void;
};

export default function MpsScenarioDialog({
  open,
  mode,
  scenarios,
  selectedScenarioId,
  comparisonRows,
  currentUser,
  planId,
  onClose,
  onCreateScenario,
  onSelectScenario,
  onApplyScenario,
  onDiscardScenario,
}: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [assumptions, setAssumptions] = useState('');

  function handleCreate() {
    if (!name.trim()) return;
    const scenario: MpsScenario = {
      id: `scenario-${Date.now()}`,
      planId,
      name: name.trim(),
      description: description.trim() || undefined,
      createdBy: currentUser,
      createdAt: new Date().toISOString(),
      assumptions: assumptions.trim() || undefined,
      status: 'Draft',
      changedBucketLines: [],
    };
    onCreateScenario(scenario);
    setName('');
    setDescription('');
    setAssumptions('');
    onClose();
  }

  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 1}}>
        <Box>
          <Typography sx={{fontSize: 11, color: '#6D28D9', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>Scenario Planning</Typography>
          <Typography sx={{fontSize: 20, fontWeight: 900, color: 'var(--planning-text-primary)', mt: 0.4}}>
            {mode === 'create' ? 'Create New Scenario' : 'Scenario Comparison'}
          </Typography>
        </Box>
        <Button onClick={onClose} sx={{minWidth: 0, p: 0.8}}><CloseIcon /></Button>
      </DialogTitle>

      <DialogContent dividers>
        {mode === 'create' && (
          <Stack spacing={2} sx={{maxWidth: 560}}>
            <TextField
              label="Scenario Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Upside demand +10%"
              fullWidth
              sx={{'& .MuiOutlinedInput-root': {borderRadius: 2}}}
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
              fullWidth
              sx={{'& .MuiOutlinedInput-root': {borderRadius: 2}}}
            />
            <TextField
              label="Assumptions / Notes"
              value={assumptions}
              onChange={(e) => setAssumptions(e.target.value)}
              multiline
              rows={3}
              fullWidth
              sx={{'& .MuiOutlinedInput-root': {borderRadius: 2}}}
            />
            <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>
              After creating the scenario, go to the Plan tab and edit bucket quantities or lines.
              Changes will be attributed to this scenario and can be compared to baseline before applying.
            </Typography>
          </Stack>
        )}

        {mode === 'compare' && (
          <Box>
            {/* Scenario list */}
            {scenarios.length > 0 && (
              <Box sx={{mb: 2}}>
                <Typography sx={{fontSize: 12, fontWeight: 700, color: 'var(--planning-text-secondary)', mb: 1}}>Scenarios</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={0.6}>
                  {scenarios.map((sc) => (
                    <Button
                      key={sc.id}
                      size="small"
                      variant={selectedScenarioId === sc.id ? 'contained' : 'outlined'}
                      onClick={() => onSelectScenario(sc.id)}
                      sx={{fontSize: 12, fontWeight: 700, borderRadius: 2, ...(selectedScenarioId === sc.id ? {bgcolor: '#6D28D9', '&:hover': {bgcolor: '#5B21B6'}} : {borderColor: '#D8B4FE', color: '#6D28D9'})}}
                    >
                      {sc.name}
                    </Button>
                  ))}
                </Stack>
              </Box>
            )}

            {selectedScenario && (
              <Box sx={{mb: 2, p: 1.2, bgcolor: 'var(--planning-ai-accent-bg)', border: '1px solid #DDD6FE', borderRadius: 2}}>
                <Typography sx={{fontSize: 12, fontWeight: 700, color: '#6D28D9'}}>{selectedScenario.name}</Typography>
                {selectedScenario.description && <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', mt: 0.4}}>{selectedScenario.description}</Typography>}
                {selectedScenario.assumptions && <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', mt: 0.4}}>Assumptions: {selectedScenario.assumptions}</Typography>}
              </Box>
            )}

            {/* Comparison table */}
            {comparisonRows.length === 0 ? (
              <Typography sx={{fontSize: 13, color: 'var(--planning-text-muted)', textAlign: 'center', py: 4}}>
                No changes between baseline and selected scenario.
              </Typography>
            ) : (
              <Box sx={{overflowX: 'auto'}}>
                <Box sx={{display: 'grid', gridTemplateColumns: '100px 1fr 80px 80px 80px 80px 80px 80px 80px 80px 100px 100px', minWidth: 960}}>
                  {['Product', 'Description', 'Bucket', 'Base Qty', 'Sc Qty', 'Base Line', 'Sc Line', 'Base Util', 'Sc Util', 'Base Stock', 'Sc Stock', 'Δ Hrs'].map((h) => (
                    <Typography key={h} sx={{fontSize: 10, fontWeight: 700, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', p: '6px 8px', bgcolor: 'var(--planning-surface-muted)', borderBottom: '1px solid var(--planning-border)'}}>{h}</Typography>
                  ))}
                  {comparisonRows.map((row, i) => {
                    const bg = i % 2 === 0 ? '#fff' : '#FAFAFA';
                    return (
                      <>
                        <TC key={`${i}-p`} bg={bg} bold>{row.productCode}</TC>
                        <TC key={`${i}-d`} bg={bg}>{row.productDescription}</TC>
                        <TC key={`${i}-b`} bg={bg}>{row.bucketLabel}</TC>
                        <TC key={`${i}-bq`} bg={bg}>{row.baselinePlannedQuantity.toLocaleString()}</TC>
                        <TC key={`${i}-sq`} bg={bg} color={row.scenarioPlannedQuantity !== row.baselinePlannedQuantity ? '#6D28D9' : undefined}>{row.scenarioPlannedQuantity.toLocaleString()}</TC>
                        <TC key={`${i}-bl`} bg={bg}>{row.baselineLineId ?? '—'}</TC>
                        <TC key={`${i}-sl`} bg={bg}>{row.scenarioLineId ?? '—'}</TC>
                        <TC key={`${i}-bu`} bg={bg}>{`${row.baselineUtilization}%`}</TC>
                        <TC key={`${i}-su`} bg={bg} color={row.scenarioUtilization > 100 ? '#B42318' : row.scenarioUtilization >= 90 ? '#B54708' : undefined}>{`${row.scenarioUtilization}%`}</TC>
                        <TC key={`${i}-bes`} bg={bg}>{row.baselineEndingStock.toLocaleString()}</TC>
                        <TC key={`${i}-ses`} bg={bg}>{row.scenarioEndingStock.toLocaleString()}</TC>
                        <TC key={`${i}-dh`} bg={bg} color={row.deltaRequiredHours > 0 ? '#B42318' : '#027A48'}>{row.deltaRequiredHours > 0 ? `+${row.deltaRequiredHours.toFixed(1)}` : row.deltaRequiredHours.toFixed(1)}</TC>
                      </>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{px: 3, py: 2, gap: 1}}>
        {mode === 'create' && (
          <>
            <Button onClick={onClose} sx={{color: 'var(--planning-text-secondary)'}}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={!name.trim()}
              variant="contained"
              sx={{bgcolor: '#6D28D9', '&:hover': {bgcolor: '#5B21B6'}, fontWeight: 700}}
            >
              Save Draft Scenario
            </Button>
          </>
        )}
        {mode === 'compare' && selectedScenarioId && (
          <>
            <Button
              onClick={() => onDiscardScenario(selectedScenarioId)}
              sx={{color: '#B42318'}}
            >
              Discard Scenario
            </Button>
            <Button onClick={onClose} sx={{color: 'var(--planning-text-secondary)'}}>Close</Button>
            <Button
              onClick={() => { onApplyScenario(selectedScenarioId); onClose(); }}
              variant="contained"
              sx={{bgcolor: '#6D28D9', '&:hover': {bgcolor: '#5B21B6'}, fontWeight: 700}}
            >
              Apply to Working MPS
            </Button>
          </>
        )}
        {mode === 'compare' && !selectedScenarioId && (
          <Button onClick={onClose} sx={{color: 'var(--planning-text-secondary)'}}>Close</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

function TC({children, bg, bold, color}: {children: React.ReactNode; bg: string; bold?: boolean; color?: string}) {
  return (
    <Box sx={{p: '6px 8px', borderBottom: '1px solid var(--planning-border)', bgcolor: bg}}>
      <Typography sx={{fontSize: 12, fontWeight: bold ? 700 : 400, color: color ?? '#475467'}}>{String(children)}</Typography>
    </Box>
  );
}
