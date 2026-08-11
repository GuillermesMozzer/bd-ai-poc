import {useMemo, useState} from 'react';
import {Box, Button, Checkbox, Divider, MenuItem, Paper, Step, StepLabel, Stepper, TextField, Typography} from '@mui/material';
import {ArrowBack as BackIcon, CheckCircle as CheckCircleIcon, Add as AddIcon, DeleteOutline as DeleteIcon} from '@mui/icons-material';
import type {AppScreen} from '../navigation/navigationConfig';

type WizardMode = 'empty' | 'based';
type FieldKind = 'text' | 'number' | 'boolean' | 'date' | 'enum';

type AssetTypeField = {
  id: string;
  name: string;
  kind: FieldKind;
  required: boolean;
  description: string;
  example: string;
};

type BaseTemplate = {
  id: string;
  name: string;
  fields: AssetTypeField[];
};

const steps = ['Strategy', 'Fields', 'Review'];

const templates: BaseTemplate[] = [
  {
    id: 'plc',
    name: 'PLC',
    fields: [
      {id: 'cpu-model', name: 'CPU Model', kind: 'text', required: true, description: 'Main CPU model of the PLC.', example: 'ControlLogix 5580'},
      {id: 'io-count', name: 'I/O Count', kind: 'number', required: false, description: 'Total configured IO points.', example: '256'},
      {id: 'scan-time-ms', name: 'Scan Time (ms)', kind: 'number', required: true, description: 'Nominal scan cycle time.', example: '12'},
    ],
  },
  {
    id: 'hmi',
    name: 'HMI',
    fields: [
      {id: 'screen-size', name: 'Screen Size', kind: 'text', required: true, description: 'Physical display size.', example: '12in'},
      {id: 'runtime-version', name: 'Runtime Version', kind: 'text', required: true, description: 'Runtime package version.', example: 'WinCC Runtime 8.1'},
    ],
  },
  {
    id: 'inverter',
    name: 'Inverter',
    fields: [
      {id: 'power-kw', name: 'Power (kW)', kind: 'number', required: true, description: 'Rated output power.', example: '22'},
      {id: 'control-mode', name: 'Control Mode', kind: 'enum', required: true, description: 'Primary control mode.', example: 'Vector'},
    ],
  },
];

function createBlankField(): AssetTypeField {
  return {
    id: `field-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: '',
    kind: 'text',
    required: false,
    description: '',
    example: '',
  };
}

interface Props {
  setCurrentScreen: (screen: AppScreen) => void;
}

export default function OtAssetTypeWizardScreen({setCurrentScreen}: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [mode, setMode] = useState<WizardMode | ''>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [newTypeName, setNewTypeName] = useState('');
  const [fields, setFields] = useState<AssetTypeField[]>([]);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedTemplate = useMemo(() => templates.find((item) => item.id === selectedTemplateId) ?? null, [selectedTemplateId]);

  const canGoStep2 = mode === 'empty' || (mode === 'based' && Boolean(selectedTemplateId));
  const canGoStep3 = Boolean(newTypeName.trim()) && fields.every((field) => field.name.trim().length > 0);

  const handleNext = () => {
    if (stepIndex === 0) {
      if (mode === 'empty') {
        setFields([]);
      } else if (selectedTemplate) {
        setFields(selectedTemplate.fields.map((field) => ({...field, id: `${field.id}-${Date.now()}`})));
      }
      setStepIndex(1);
      return;
    }

    if (stepIndex === 1) {
      setStepIndex(2);
      return;
    }
  };

  return (
    <Box sx={{flexGrow: 1, minHeight: 'calc(100vh - 112px)', bgcolor: '#F6F7F9', p: {xs: 1.5, md: 2}}}>
      <Paper elevation={0} sx={{border: '1px solid #E1E5EB', borderRadius: 2.2, bgcolor: '#FFFFFF', overflow: 'hidden'}}>
        <Box sx={{px: {xs: 2, md: 2.5}, py: 1.8, borderBottom: '1px solid #E6E9EF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap'}}>
          <Box>
            <Typography variant="h5" sx={{fontWeight: 900, color: '#0F172A'}}>OT Asset Type Wizard</Typography>
            <Typography sx={{fontSize: '0.82rem', color: '#475569'}}>Create and prepare a new OT asset type for approval workflow</Typography>
          </Box>
          <Button startIcon={<BackIcon />} variant="outlined" onClick={() => setCurrentScreen('asset_explorer')} sx={{textTransform: 'none', fontWeight: 800}}>
            Back to Asset Explorer
          </Button>
        </Box>

        <Box sx={{p: {xs: 1.5, md: 2}}}>
          <Stepper activeStep={stepIndex} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>

          <Divider sx={{my: 1.5}} />

          {stepIndex === 0 ? (
            <Box sx={{display: 'grid', gap: 1.1}}>
              <Typography sx={{fontSize: '0.9rem', fontWeight: 800, color: '#0F172A'}}>Choose the creation strategy</Typography>
              <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))'}, gap: 1}}>
                <Paper
                  elevation={0}
                  role="button"
                  tabIndex={0}
                  onClick={() => setMode('empty')}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setMode('empty');
                    }
                  }}
                  sx={{p: 1.3, border: mode === 'empty' ? '2px solid #2563EB' : '1px solid #DCE3EC', borderRadius: 1.4, cursor: 'pointer'}}
                >
                  <Typography sx={{fontSize: '0.85rem', fontWeight: 800}}>Create new OT asset type from scratch</Typography>
                  <Typography sx={{fontSize: '0.76rem', color: '#64748B', mt: 0.4}}>Start with an empty field list and define all fields manually.</Typography>
                </Paper>
                <Paper
                  elevation={0}
                  role="button"
                  tabIndex={0}
                  onClick={() => setMode('based')}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setMode('based');
                    }
                  }}
                  sx={{p: 1.3, border: mode === 'based' ? '2px solid #2563EB' : '1px solid #DCE3EC', borderRadius: 1.4, cursor: 'pointer'}}
                >
                  <Typography sx={{fontSize: '0.85rem', fontWeight: 800}}>Create OT asset type based on an existing one</Typography>
                  <Typography sx={{fontSize: '0.76rem', color: '#64748B', mt: 0.4}}>Clone an existing template and adjust fields in the next step.</Typography>
                </Paper>
              </Box>

              {mode === 'based' ? (
                <TextField select size="small" label="Base Asset Type" value={selectedTemplateId} onChange={(event) => setSelectedTemplateId(event.target.value)}>
                  {templates.map((template) => <MenuItem key={template.id} value={template.id}>{template.name}</MenuItem>)}
                </TextField>
              ) : null}

              <TextField
                size="small"
                label="New Asset Type Name"
                value={newTypeName}
                onChange={(event) => setNewTypeName(event.target.value)}
                placeholder="Ex.: OT Remote I/O Rack"
              />
            </Box>
          ) : null}

          {stepIndex === 1 ? (
            <Box sx={{display: 'grid', gap: 1}}>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap'}}>
                <Typography sx={{fontSize: '0.9rem', fontWeight: 800}}>Configure fields for {newTypeName || 'new type'}</Typography>
                <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => setFields((current) => [...current, createBlankField()])} sx={{textTransform: 'none', fontWeight: 800}}>
                  Add field
                </Button>
              </Box>

              {fields.length ? fields.map((field, index) => (
                <Paper key={field.id} elevation={0} sx={{p: 1, border: '1px solid #DCE3EC', borderRadius: 1.2}}>
                  <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))'}, gap: 0.9}}>
                    <TextField size="small" label="Field Name" value={field.name} onChange={(event) => setFields((current) => current.map((item, i) => i === index ? {...item, name: event.target.value} : item))} />
                    <TextField select size="small" label="Type" value={field.kind} onChange={(event) => setFields((current) => current.map((item, i) => i === index ? {...item, kind: event.target.value as FieldKind} : item))}>
                      <MenuItem value="text">Text</MenuItem>
                      <MenuItem value="number">Number</MenuItem>
                      <MenuItem value="boolean">Boolean</MenuItem>
                      <MenuItem value="date">Date</MenuItem>
                      <MenuItem value="enum">Enum</MenuItem>
                    </TextField>
                    <TextField size="small" label="Description" value={field.description} onChange={(event) => setFields((current) => current.map((item, i) => i === index ? {...item, description: event.target.value} : item))} />
                    <TextField size="small" label="Example" value={field.example} onChange={(event) => setFields((current) => current.map((item, i) => i === index ? {...item, example: event.target.value} : item))} />
                  </Box>
                  <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.7}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                      <Checkbox
                        size="small"
                        checked={field.required}
                        onChange={(event) => setFields((current) => current.map((item, i) => i === index ? {...item, required: event.target.checked} : item))}
                      />
                      <Typography sx={{fontSize: '0.78rem'}}>Required</Typography>
                    </Box>
                    <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setFields((current) => current.filter((item) => item.id !== field.id))} sx={{textTransform: 'none', fontWeight: 800}}>
                      Delete
                    </Button>
                  </Box>
                </Paper>
              )) : (
                <Typography sx={{fontSize: '0.82rem', color: '#64748B'}}>No fields yet. Add at least one field or continue if your process allows empty template.</Typography>
              )}
            </Box>
          ) : null}

          {stepIndex === 2 ? (
            <Box sx={{display: 'grid', gap: 1}}>
              <Typography sx={{fontSize: '0.9rem', fontWeight: 800}}>Review and submit</Typography>
              <Paper elevation={0} sx={{p: 1.1, border: '1px solid #DCE3EC', borderRadius: 1.2}}>
                <Typography sx={{fontSize: '0.82rem'}}><strong>Name:</strong> {newTypeName || '-'}</Typography>
                <Typography sx={{fontSize: '0.82rem'}}><strong>Creation mode:</strong> {mode === 'based' ? `Based on ${selectedTemplate?.name || '-'}` : 'From scratch'}</Typography>
                <Typography sx={{fontSize: '0.82rem', mt: 0.5}}><strong>Fields:</strong> {fields.length}</Typography>
                <Box sx={{mt: 0.8, display: 'grid', gap: 0.5}}>
                  {fields.map((field) => (
                    <Typography key={field.id} sx={{fontSize: '0.76rem', color: '#475569'}}>
                      - {field.name || '(unnamed)'} | {field.kind} | {field.required ? 'required' : 'optional'}
                    </Typography>
                  ))}
                </Box>
              </Paper>

              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                <Checkbox size="small" checked={reviewConfirmed} onChange={(event) => setReviewConfirmed(event.target.checked)} />
                <Typography sx={{fontSize: '0.8rem'}}>I confirm that the data has been reviewed and is correct.</Typography>
              </Box>

              {submitted ? (
                <Paper elevation={0} sx={{p: 1.1, border: '1px solid #BBF7D0', borderRadius: 1.2, bgcolor: '#F0FDF4', display: 'flex', alignItems: 'center', gap: 0.8}}>
                  <CheckCircleIcon sx={{color: '#15803D', fontSize: 18}} />
                  <Typography sx={{fontSize: '0.82rem', color: '#166534', fontWeight: 700}}>
                    Data submitted for approval. Approver: Julia Costa.
                  </Typography>
                </Paper>
              ) : null}
            </Box>
          ) : null}

          <Divider sx={{my: 1.5}} />

          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1}}>
            <Button
              variant="outlined"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
              sx={{textTransform: 'none', fontWeight: 800}}
            >
              Back
            </Button>

            {stepIndex < 2 ? (
              <Button
                variant="contained"
                disabled={(stepIndex === 0 && !canGoStep2) || (stepIndex === 1 && !canGoStep3)}
                onClick={handleNext}
                sx={{textTransform: 'none', fontWeight: 800}}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                disabled={!reviewConfirmed || submitted}
                onClick={() => setSubmitted(true)}
                sx={{textTransform: 'none', fontWeight: 800}}
              >
                Send for Approval
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
