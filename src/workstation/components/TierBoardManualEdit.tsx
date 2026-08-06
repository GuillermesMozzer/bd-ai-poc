import {useEffect, useMemo, useState} from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  DeleteOutline as DeleteIcon,
  EditOutlined as EditIcon,
} from '@mui/icons-material';

export type TierBoardPermissionRole = 'viewer' | 'editor' | 'admin';

type ChartRow = {date: string; value: number; target: number; status: 'Good' | 'Watch' | 'Critical'};
type RankingRow = {label: string; value: number; trend: 'Up' | 'Down' | 'Flat'};

export type TierBoardManualData = {
  safety: {
    fatality: number;
    seriousInjury: number;
    minorInjury: number;
    nearMisses: number;
    daysWithoutInjuries: number;
    unitOverview: string;
  };
  quality: {
    fieldActions: number;
    complaints: number;
    ncs: number;
    capas: number;
    daysWithoutIssues: number;
    unitOverview: string;
  };
  delivery: {
    totalProduction: number;
    target: number;
    actualOee: number;
    poDeliveryStatus: string;
    unitOverview: string;
    chartData: ChartRow[];
  };
  cost: {
    scrap: number;
    downtime: number;
    totalScrapProduced: number;
    target: number;
    unitOverview: string;
    chartData: ChartRow[];
  };
  people: {
    absences: number;
    dayOffs: number;
    medicalLeaves: number;
    vacation: number;
    shiftAtRisk: string;
    unitOverview: string;
    absenteeismChartData: ChartRow[];
  };
  threePTracking: {
    presence: number;
    punctuality: number;
    participation: number;
  };
  lossFocusedKpis: {
    changeoverValue: number;
    topLosses: RankingRow[];
    chartData: ChartRow[];
  };
  gembaWalkDeviations: {
    process: string;
    location: string;
    date: string;
    numberOfDeviations: number;
    ranking: RankingRow[];
  };
  recognition: {
    personRecognized: string;
    recognitionText: string;
    date: string;
    author: string;
  };
  actionTracker: {
    actionTitle: string;
    owner: string;
    dueDate: string;
    priority: 'Low' | 'Medium' | 'High';
    category: string;
    status: 'Open' | 'In Progress' | 'Under Approval' | 'Completed' | 'Overdue' | 'Canceled';
    notes: string;
  };
};

export type TierBoardChangeEntry = {
  id: string;
  section: string;
  field: string;
  previousValue: string;
  newValue: string;
  changedBy: string;
  timestamp: string;
};

type FieldType = 'number' | 'percent' | 'date' | 'shortText' | 'longText' | 'select';

type FieldDefinition = {
  section: keyof TierBoardManualData;
  sectionLabel: string;
  field: string;
  label: string;
  path: string;
  type: FieldType;
  required?: boolean;
  min?: number;
  max?: number;
  options?: string[];
};

type CollectionDefinition = {
  section: keyof TierBoardManualData;
  sectionLabel: string;
  field: string;
  label: string;
  path: string;
};

const sectionLabels: Record<keyof TierBoardManualData, string> = {
  safety: 'Safety',
  quality: 'Quality',
  delivery: 'Delivery',
  cost: 'Cost',
  people: 'People',
  threePTracking: '3P Tracking',
  lossFocusedKpis: 'Loss Focused KPIs',
  gembaWalkDeviations: 'Gemba Walk Deviations',
  recognition: 'Recognition',
  actionTracker: 'Action Tracker',
};

const editableSections = Object.keys(sectionLabels) as Array<keyof TierBoardManualData>;

const fieldDefinitions: FieldDefinition[] = [
  field('safety', 'fatality', 'Fatality', 'number', {min: 0}),
  field('safety', 'seriousInjury', 'Serious Injury', 'number', {min: 0}),
  field('safety', 'minorInjury', 'Minor Injury', 'number', {min: 0}),
  field('safety', 'nearMisses', 'Near Misses', 'number', {min: 0}),
  field('safety', 'daysWithoutInjuries', 'Days Without Injuries', 'number', {min: 0}),
  field('safety', 'unitOverview', 'Unit Overview', 'longText'),
  field('quality', 'fieldActions', 'Field Actions', 'number', {min: 0}),
  field('quality', 'complaints', 'Complaints', 'number', {min: 0}),
  field('quality', 'ncs', 'NCs', 'number', {min: 0}),
  field('quality', 'capas', 'CAPAs', 'number', {min: 0}),
  field('quality', 'daysWithoutIssues', 'Days Without Issues', 'number', {min: 0}),
  field('quality', 'unitOverview', 'Unit Overview', 'longText'),
  field('delivery', 'totalProduction', 'Total Production', 'number', {min: 0}),
  field('delivery', 'target', 'Target', 'number', {min: 0}),
  field('delivery', 'actualOee', 'Actual OEE', 'percent'),
  field('delivery', 'poDeliveryStatus', 'PO delivery status', 'shortText'),
  field('delivery', 'unitOverview', 'Unit Overview', 'longText'),
  field('cost', 'scrap', 'Scrap', 'number', {min: 0}),
  field('cost', 'downtime', 'Downtime', 'number', {min: 0}),
  field('cost', 'totalScrapProduced', 'Total Scrap Produced', 'percent'),
  field('cost', 'target', 'Target', 'percent'),
  field('cost', 'unitOverview', 'Unit Overview', 'longText'),
  field('people', 'absences', 'Absences', 'number', {min: 0}),
  field('people', 'dayOffs', 'Day Offs', 'number', {min: 0}),
  field('people', 'medicalLeaves', 'Medical Leaves', 'number', {min: 0}),
  field('people', 'vacation', 'Vacation', 'number', {min: 0}),
  field('people', 'shiftAtRisk', 'Shift at Risk', 'shortText'),
  field('people', 'unitOverview', 'Unit Overview', 'longText'),
  field('threePTracking', 'presence', 'Presence', 'percent'),
  field('threePTracking', 'punctuality', 'Punctuality', 'percent'),
  field('threePTracking', 'participation', 'Participation', 'percent'),
  field('lossFocusedKpis', 'changeoverValue', 'Changeover value', 'number', {min: 0}),
  field('gembaWalkDeviations', 'process', 'Process', 'select', {options: ['Tier 1 Board', 'TMS 1 Short-term Interval Control', '5S', 'Quality Scale', 'Quality GMP', 'People']}),
  field('gembaWalkDeviations', 'location', 'Location', 'shortText'),
  field('gembaWalkDeviations', 'date', 'Date', 'date'),
  field('gembaWalkDeviations', 'numberOfDeviations', 'Number of deviations', 'number', {min: 0}),
  field('recognition', 'personRecognized', 'Person recognized', 'shortText'),
  field('recognition', 'recognitionText', 'Recognition text', 'longText'),
  field('recognition', 'date', 'Date', 'date'),
  field('recognition', 'author', 'Author', 'shortText'),
  field('actionTracker', 'actionTitle', 'Action title', 'shortText'),
  field('actionTracker', 'owner', 'Owner', 'shortText'),
  field('actionTracker', 'dueDate', 'Due date', 'date'),
  field('actionTracker', 'priority', 'Priority', 'select', {options: ['Low', 'Medium', 'High']}),
  field('actionTracker', 'category', 'Category', 'select', {options: ['Safety', 'Quality', 'Delivery', 'Cost', 'People']}),
  field('actionTracker', 'status', 'Status', 'select', {options: ['Open', 'In Progress', 'Under Approval', 'Completed', 'Overdue', 'Canceled']}),
  field('actionTracker', 'notes', 'Notes', 'longText'),
];

const collectionDefinitions: CollectionDefinition[] = [
  collection('delivery', 'chartData', 'Delivery chart data'),
  collection('cost', 'chartData', 'Cost chart data'),
  collection('people', 'absenteeismChartData', 'Absenteeism chart data'),
  collection('lossFocusedKpis', 'chartData', 'Loss Focused KPI chart data'),
  collection('lossFocusedKpis', 'topLosses', 'Top losses'),
  collection('gembaWalkDeviations', 'ranking', 'Ranking of top processes'),
];

function field(section: keyof TierBoardManualData, key: string, label: string, type: FieldType, options: Partial<FieldDefinition> = {}): FieldDefinition {
  return {
    section,
    sectionLabel: sectionLabels[section],
    field: key,
    label,
    path: `${section}.${key}`,
    type,
    required: true,
    ...options,
  };
}

function collection(section: keyof TierBoardManualData, key: string, label: string): CollectionDefinition {
  return {
    section,
    sectionLabel: sectionLabels[section],
    field: key,
    label,
    path: `${section}.${key}`,
  };
}

export function createDefaultTierBoardData(tierLevel: string): TierBoardManualData {
  return {
    safety: {fatality: 0, seriousInjury: 4, minorInjury: 12, nearMisses: 2, daysWithoutInjuries: 4, unitOverview: `${tierLevel} safety status across active units.`},
    quality: {fieldActions: 2, complaints: 2, ncs: 1, capas: 4, daysWithoutIssues: 13, unitOverview: `${tierLevel} quality overview for current operations.`},
    delivery: {
      totalProduction: 12650,
      target: 12000,
      actualOee: 85,
      poDeliveryStatus: '401k of 662k delivered',
      unitOverview: 'Production is tracking near target with changeover risk.',
      chartData: defaultChartRows(),
    },
    cost: {scrap: 9, downtime: 88, totalScrapProduced: 9, target: 10, unitOverview: 'Scrap and downtime remain inside current escalation thresholds.', chartData: defaultChartRows()},
    people: {absences: 2, dayOffs: 5, medicalLeaves: 1, vacation: 2, shiftAtRisk: '33% of the team is absent', unitOverview: 'Coverage requires monitoring for the next shift.', absenteeismChartData: defaultChartRows()},
    threePTracking: {presence: 96, punctuality: 94, participation: 92},
    lossFocusedKpis: {changeoverValue: 244, topLosses: [{label: 'Tooling not staged', value: 10, trend: 'Up'}, {label: 'Line clearance exceeded', value: 7, trend: 'Down'}], chartData: defaultChartRows()},
    gembaWalkDeviations: {process: 'TMS 1 Short-term Interval Control', location: 'Pack Line 1', date: '2026-03-16', numberOfDeviations: 3, ranking: [{label: 'TMS 1 Short-term Interval Control', value: 23, trend: 'Down'}, {label: 'Tier 1 Board', value: 12, trend: 'Up'}, {label: '5S', value: 9, trend: 'Down'}]},
    recognition: {personRecognized: 'Carlos Mendez', recognitionText: 'Helped train 3 new operators', date: '2026-03-16', author: 'Maria Pinna'},
    actionTracker: {actionTitle: 'Conduct staff training on compliance and SOP adherence', owner: 'Carlos Mendez', dueDate: '2026-03-18', priority: 'Medium', category: 'Safety', status: 'Open', notes: 'Follow up during next tier meeting.'},
  };
}

function defaultChartRows(): ChartRow[] {
  return [
    {date: '2026-03-14', value: 82, target: 90, status: 'Watch'},
    {date: '2026-03-15', value: 88, target: 90, status: 'Good'},
    {date: '2026-03-16', value: 85, target: 90, status: 'Watch'},
  ];
}

export function getTierBoardChanges(previous: TierBoardManualData, next: TierBoardManualData, changedBy: string): TierBoardChangeEntry[] {
  const timestamp = new Date().toLocaleString('en-US', {month: 'short', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit'});
  return [...fieldDefinitions, ...collectionDefinitions]
    .map((definition) => {
      const previousValue = stringifyValue(getValueAtPath(previous, definition.path));
      const newValue = stringifyValue(getValueAtPath(next, definition.path));
      if (previousValue === newValue) return null;
      return {
        id: `${definition.path}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        section: definition.sectionLabel,
        field: definition.label,
        previousValue,
        newValue,
        changedBy,
        timestamp,
      };
    })
    .filter((entry): entry is TierBoardChangeEntry => Boolean(entry));
}

export function hasTierBoardChanges(previous: TierBoardManualData, next: TierBoardManualData) {
  return JSON.stringify(previous) !== JSON.stringify(next);
}

export function validateTierBoardData(data: TierBoardManualData) {
  const errors: Record<string, string> = {};
  fieldDefinitions.forEach((definition) => {
    const value = getValueAtPath(data, definition.path);
    if (definition.required && (value === '' || value === null || typeof value === 'undefined')) {
      errors[definition.path] = 'Required field';
      return;
    }
    if (definition.type === 'number' || definition.type === 'percent') {
      const numericValue = Number(value);
      if (Number.isNaN(numericValue)) {
        errors[definition.path] = 'Use a numeric value';
        return;
      }
      if (typeof definition.min === 'number' && numericValue < definition.min) errors[definition.path] = `Must be at least ${definition.min}`;
      if (definition.type === 'percent' && (numericValue < 0 || numericValue > 100)) errors[definition.path] = 'Percent must be between 0 and 100';
      if (typeof definition.max === 'number' && numericValue > definition.max) errors[definition.path] = `Must be ${definition.max} or less`;
    }
    if (definition.type === 'date' && Number.isNaN(new Date(`${value}T00:00:00`).getTime())) {
      errors[definition.path] = 'Use a valid date';
    }
  });
  collectionDefinitions.forEach((definition) => {
    const rows = getValueAtPath(data, definition.path);
    if (!Array.isArray(rows) || rows.length === 0) {
      errors[definition.path] = 'Add at least one row';
      return;
    }
    rows.forEach((row, rowIndex) => {
      if (!row || typeof row !== 'object') {
        errors[`${definition.path}.${rowIndex}`] = 'Invalid row';
        return;
      }
      if ('date' in row && Number.isNaN(new Date(`${String((row as ChartRow).date)}T00:00:00`).getTime())) {
        errors[`${definition.path}.${rowIndex}.date`] = 'Use a valid date';
      }
      if ('value' in row && (String((row as ChartRow | RankingRow).value) === '' || Number.isNaN(Number((row as ChartRow | RankingRow).value)))) {
        errors[`${definition.path}.${rowIndex}.value`] = 'Use a numeric value';
      }
      if ('target' in row && (String((row as ChartRow).target) === '' || Number.isNaN(Number((row as ChartRow).target)))) {
        errors[`${definition.path}.${rowIndex}.target`] = 'Use a numeric target';
      }
      if ('label' in row && !String((row as RankingRow).label ?? '').trim()) {
        errors[`${definition.path}.${rowIndex}.label`] = 'Label is required';
      }
    });
  });
  return errors;
}

export function TierBoardEditWidgetModal({
  data,
  draft,
  initialSection,
  onClose,
  onDraftChange,
  onReviewChanges,
  open,
  role,
}: {
  data: TierBoardManualData;
  draft: TierBoardManualData;
  initialSection?: keyof TierBoardManualData;
  onClose: () => void;
  onDraftChange: (draft: TierBoardManualData) => void;
  onReviewChanges?: () => void;
  open: boolean;
  role: TierBoardPermissionRole;
}) {
  const [activeSection, setActiveSection] = useState<keyof TierBoardManualData>('safety');
  const errors = validateTierBoardData(draft);
  const isReadOnly = role === 'viewer';
  const hasErrors = Object.keys(errors).length > 0;
  const hasChanges = hasTierBoardChanges(data, draft);
  const changedSections = new Set(getTierBoardChanges(data, draft, '').map((change) => change.section));

  useEffect(() => {
    if (open && initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection, open]);

  const updatePath = (path: string, value: unknown) => {
    onDraftChange(setValueAtPath(draft, path, value));
  };

  const activeFields = fieldDefinitions.filter((definition) => definition.section === activeSection);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{px: 3, pt: 2.6, pb: 1}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 2}}>
          <Box>
            <Typography sx={{fontSize: 22, fontWeight: 900, color: '#111827'}}>Edit Tier Board</Typography>
            <Typography sx={{fontSize: 13, color: '#667085', mt: 0.5}}>Manual edits are saved to a draft until you confirm them.</Typography>
          </Box>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{px: 3, pb: 3, display: 'grid', gridTemplateColumns: '250px minmax(0, 1fr)', gap: 2}}>
        <Paper elevation={0} sx={{border: '1px solid #E2E8F0', borderRadius: 2, p: 1, alignSelf: 'start'}}>
          {editableSections.map((section) => {
            const active = section === activeSection;
            const changed = changedSections.has(sectionLabels[section]);
            return (
              <Button
                key={section}
                fullWidth
                onClick={() => setActiveSection(section)}
                sx={{
                  justifyContent: 'space-between',
                  minHeight: 38,
                  mb: 0.4,
                  px: 1.2,
                  borderRadius: 1.2,
                  textTransform: 'none',
                  fontWeight: 900,
                  bgcolor: active ? '#EEF4FF' : 'transparent',
                  color: active ? '#0B63FF' : '#344054',
                }}
              >
                <span>{sectionLabels[section]}</span>
                {changed ? <Chip label="Edited" size="small" sx={{height: 20, fontSize: 10, bgcolor: '#DBEAFE', color: '#0B63FF', fontWeight: 900}} /> : <EditIcon sx={{fontSize: 15, color: '#98A2B3'}} />}
              </Button>
            );
          })}
        </Paper>
        <Paper elevation={0} sx={{border: '1px solid #E2E8F0', borderRadius: 2, p: 2, minHeight: 520}}>
          <Typography sx={{fontSize: 18, fontWeight: 900, color: '#111827', mb: 0.5}}>{sectionLabels[activeSection]}</Typography>
          <Typography sx={{fontSize: 12.5, color: '#667085', mb: 2}}>Editable fields for this widget/section.</Typography>
          <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))'}, gap: 1.5}}>
            {activeFields.map((definition) => (
              <EditableField
                key={definition.path}
                definition={definition}
                disabled={isReadOnly}
                error={errors[definition.path]}
                value={getValueAtPath(draft, definition.path)}
                onChange={(value) => updatePath(definition.path, value)}
              />
            ))}
          </Box>
          {activeSection === 'delivery' ? <EditableChartTable title="Delivery chart data" rows={draft.delivery.chartData} disabled={isReadOnly} errors={errors} errorPrefix="delivery.chartData" onChange={(rows) => onDraftChange({...draft, delivery: {...draft.delivery, chartData: rows}})} /> : null}
          {activeSection === 'cost' ? <EditableChartTable title="Cost chart data" rows={draft.cost.chartData} disabled={isReadOnly} errors={errors} errorPrefix="cost.chartData" onChange={(rows) => onDraftChange({...draft, cost: {...draft.cost, chartData: rows}})} /> : null}
          {activeSection === 'people' ? <EditableChartTable title="Absenteeism chart data" rows={draft.people.absenteeismChartData} disabled={isReadOnly} errors={errors} errorPrefix="people.absenteeismChartData" onChange={(rows) => onDraftChange({...draft, people: {...draft.people, absenteeismChartData: rows}})} /> : null}
          {activeSection === 'lossFocusedKpis' ? (
            <>
              <EditableChartTable title="Loss Focused KPI chart data" rows={draft.lossFocusedKpis.chartData} disabled={isReadOnly} errors={errors} errorPrefix="lossFocusedKpis.chartData" onChange={(rows) => onDraftChange({...draft, lossFocusedKpis: {...draft.lossFocusedKpis, chartData: rows}})} />
              <EditableRankingTable title="Top losses" rows={draft.lossFocusedKpis.topLosses} disabled={isReadOnly} errors={errors} errorPrefix="lossFocusedKpis.topLosses" onChange={(rows) => onDraftChange({...draft, lossFocusedKpis: {...draft.lossFocusedKpis, topLosses: sortRankingRows(rows)}})} />
            </>
          ) : null}
          {activeSection === 'gembaWalkDeviations' ? <EditableRankingTable title="Ranking of top processes" rows={draft.gembaWalkDeviations.ranking} disabled={isReadOnly} errors={errors} errorPrefix="gembaWalkDeviations.ranking" onChange={(rows) => onDraftChange({...draft, gembaWalkDeviations: {...draft.gembaWalkDeviations, ranking: sortRankingRows(rows)}})} /> : null}
        </Paper>
      </DialogContent>
      <DialogActions sx={{px: 3, pb: 2.5}}>
        <Button onClick={onClose} variant="outlined" sx={{fontWeight: 800, textTransform: 'none'}}>Cancel</Button>
        <Button
          disabled={isReadOnly || hasErrors || !hasChanges}
          onClick={onReviewChanges}
          variant="contained"
          sx={{fontWeight: 900, textTransform: 'none'}}
        >
          Review changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function EditableField({
  definition,
  disabled,
  error,
  onChange,
  value,
}: {
  definition: FieldDefinition;
  disabled?: boolean;
  error?: string;
  onChange: (value: unknown) => void;
  value: unknown;
}) {
  const commonSx = {'& .MuiInputLabel-root': {bgcolor: '#FFFFFF', px: 0.5}, '& .MuiOutlinedInput-root': {borderRadius: 1.4}};
  if (definition.type === 'select') {
    return (
      <TextField label={definition.label} select SelectProps={{native: true}} value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} disabled={disabled} error={Boolean(error)} helperText={error} size="small" fullWidth sx={commonSx}>
        {(definition.options ?? []).map((option) => <option key={option} value={option}>{option}</option>)}
      </TextField>
    );
  }
  return (
    <TextField
      label={definition.label}
      type={definition.type === 'date' ? 'date' : definition.type === 'number' || definition.type === 'percent' ? 'number' : 'text'}
      value={String(value ?? '')}
      onChange={(event) => onChange(definition.type === 'number' || definition.type === 'percent' ? Number(event.target.value) : event.target.value)}
      disabled={disabled}
      error={Boolean(error)}
      helperText={error}
      multiline={definition.type === 'longText'}
      minRows={definition.type === 'longText' ? 3 : undefined}
      InputLabelProps={{shrink: true}}
      size="small"
      fullWidth
      sx={commonSx}
    />
  );
}

function EditableChartTable({
  disabled,
  errorPrefix,
  errors,
  onChange,
  rows,
  title,
}: {
  disabled?: boolean;
  errorPrefix: string;
  errors: Record<string, string>;
  onChange: (rows: ChartRow[]) => void;
  rows: ChartRow[];
  title: string;
}) {
  const updateRow = (index: number, key: keyof ChartRow, value: string | number) => {
    onChange(rows.map((row, rowIndex) => rowIndex === index ? {...row, [key]: key === 'value' || key === 'target' ? Number(value) : value} as ChartRow : row));
  };
  return (
    <Box sx={{mt: 2.2}}>
      <Typography sx={{fontSize: 14, fontWeight: 900, color: '#111827', mb: 1}}>{title}</Typography>
      {errors[errorPrefix] ? <Typography sx={{fontSize: 12, color: '#D92D20', mb: 1}}>{errors[errorPrefix]}</Typography> : null}
      <TableContainer component={Paper} elevation={0} sx={{border: '1px solid #E2E8F0', borderRadius: 1.4}}>
        <Table size="small">
          <TableHead><TableRow>{['Date', 'Value', 'Target', 'Status'].map((head) => <TableCell key={head} sx={{fontWeight: 900}}>{head}</TableCell>)}</TableRow></TableHead>
          <TableBody>{rows.map((row, index) => (
            <TableRow key={`${row.date}-${index}`}>
              <TableCell><TextField type="date" size="small" value={row.date} disabled={disabled} error={Boolean(errors[`${errorPrefix}.${index}.date`])} helperText={errors[`${errorPrefix}.${index}.date`]} onChange={(event) => updateRow(index, 'date', event.target.value)} /></TableCell>
              <TableCell><TextField type="number" size="small" value={row.value} disabled={disabled} error={Boolean(errors[`${errorPrefix}.${index}.value`])} helperText={errors[`${errorPrefix}.${index}.value`]} onChange={(event) => updateRow(index, 'value', event.target.value)} /></TableCell>
              <TableCell><TextField type="number" size="small" value={row.target} disabled={disabled} error={Boolean(errors[`${errorPrefix}.${index}.target`])} helperText={errors[`${errorPrefix}.${index}.target`]} onChange={(event) => updateRow(index, 'target', event.target.value)} /></TableCell>
              <TableCell><TextField select SelectProps={{native: true}} size="small" value={row.status} disabled={disabled} onChange={(event) => updateRow(index, 'status', event.target.value)}>{['Good', 'Watch', 'Critical'].map((item) => <option key={item}>{item}</option>)}</TextField></TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function EditableRankingTable({
  disabled,
  errorPrefix,
  errors,
  onChange,
  rows,
  title,
}: {
  disabled?: boolean;
  errorPrefix: string;
  errors: Record<string, string>;
  onChange: (rows: RankingRow[]) => void;
  rows: RankingRow[];
  title: string;
}) {
  const updateRow = (index: number, key: keyof RankingRow, value: string | number) => {
    onChange(rows.map((row, rowIndex) => rowIndex === index ? {...row, [key]: key === 'value' ? Number(value) : value} as RankingRow : row));
  };
  const addRow = () => onChange(sortRankingRows([...rows, {label: 'New item', value: 0, trend: 'Flat'}]));
  return (
    <Box sx={{mt: 2.2}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
        <Typography sx={{fontSize: 14, fontWeight: 900, color: '#111827'}}>{title}</Typography>
        <Button disabled={disabled} size="small" startIcon={<AddIcon />} onClick={addRow} sx={{fontWeight: 900, textTransform: 'none'}}>Add row</Button>
      </Box>
      {errors[errorPrefix] ? <Typography sx={{fontSize: 12, color: '#D92D20', mb: 1}}>{errors[errorPrefix]}</Typography> : null}
      <TableContainer component={Paper} elevation={0} sx={{border: '1px solid #E2E8F0', borderRadius: 1.4}}>
        <Table size="small">
          <TableHead><TableRow>{['Rank', 'Label', 'Value', 'Trend', ''].map((head) => <TableCell key={head} sx={{fontWeight: 900}}>{head}</TableCell>)}</TableRow></TableHead>
          <TableBody>{rows.map((row, index) => (
            <TableRow key={`${row.label}-${index}`}>
              <TableCell>{index + 1}</TableCell>
              <TableCell><TextField size="small" value={row.label} disabled={disabled} error={Boolean(errors[`${errorPrefix}.${index}.label`])} helperText={errors[`${errorPrefix}.${index}.label`]} onChange={(event) => updateRow(index, 'label', event.target.value)} /></TableCell>
              <TableCell><TextField type="number" size="small" value={row.value} disabled={disabled} error={Boolean(errors[`${errorPrefix}.${index}.value`])} helperText={errors[`${errorPrefix}.${index}.value`]} onChange={(event) => updateRow(index, 'value', event.target.value)} /></TableCell>
              <TableCell><TextField select SelectProps={{native: true}} size="small" value={row.trend} disabled={disabled} onChange={(event) => updateRow(index, 'trend', event.target.value)}>{['Up', 'Down', 'Flat'].map((item) => <option key={item}>{item}</option>)}</TextField></TableCell>
              <TableCell><IconButton disabled={disabled || rows.length <= 1} size="small" onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))}><DeleteIcon fontSize="small" /></IconButton></TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export function ReviewChangesModal({changes, onBack, onCancel, onConfirm, open}: {changes: TierBoardChangeEntry[]; onBack: () => void; onCancel: () => void; onConfirm: () => void; open: boolean}) {
  return (
    <Dialog open={open} onClose={onBack} maxWidth="lg" fullWidth>
      <DialogTitle sx={{fontWeight: 900}}>Review changes</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper} elevation={0} sx={{border: '1px solid #E2E8F0', borderRadius: 1.4}}>
          <Table size="small">
            <TableHead><TableRow>{['Section', 'Field', 'Previous value', 'New value', 'Changed by', 'Timestamp'].map((head) => <TableCell key={head} sx={{fontWeight: 900}}>{head}</TableCell>)}</TableRow></TableHead>
            <TableBody>{changes.map((change) => (
              <TableRow key={change.id}>
                <TableCell>{change.section}</TableCell>
                <TableCell>{change.field}</TableCell>
                <TableCell>{change.previousValue}</TableCell>
                <TableCell>{change.newValue}</TableCell>
                <TableCell>{change.changedBy}</TableCell>
                <TableCell>{change.timestamp}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions sx={{px: 3, pb: 2.5}}>
        <Button onClick={onCancel} variant="outlined" sx={{fontWeight: 800, textTransform: 'none'}}>Cancel</Button>
        <Button onClick={onBack} variant="outlined" sx={{fontWeight: 800, textTransform: 'none'}}>Back to edit</Button>
        <Button onClick={onConfirm} variant="contained" sx={{fontWeight: 900, textTransform: 'none'}}>Confirm save</Button>
      </DialogActions>
    </Dialog>
  );
}

export function ChangeHistoryModal({history, onClose, open}: {history: TierBoardChangeEntry[]; onClose: () => void; open: boolean}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{fontWeight: 900}}>Change history</DialogTitle>
      <DialogContent>
        {history.length ? (
          <TableContainer component={Paper} elevation={0} sx={{border: '1px solid #E2E8F0', borderRadius: 1.4}}>
            <Table size="small">
              <TableHead><TableRow>{['Date & Time', 'User', 'Section', 'Field', 'Previous value', 'New value'].map((head) => <TableCell key={head} sx={{fontWeight: 900}}>{head}</TableCell>)}</TableRow></TableHead>
              <TableBody>{history.map((change) => (
                <TableRow key={change.id}>
                  <TableCell>{change.timestamp}</TableCell>
                  <TableCell>{change.changedBy}</TableCell>
                  <TableCell>{change.section}</TableCell>
                  <TableCell>{change.field}</TableCell>
                  <TableCell>{change.previousValue}</TableCell>
                  <TableCell>{change.newValue}</TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Paper elevation={0} sx={{p: 3, border: '1px dashed #CBD5E1', borderRadius: 2, textAlign: 'center'}}>
            <Typography sx={{fontWeight: 900, color: '#111827'}}>No manual changes yet</Typography>
            <Typography sx={{fontSize: 13, color: '#667085', mt: 0.7}}>Saved edits will appear here with user and timestamp.</Typography>
          </Paper>
        )}
      </DialogContent>
      <DialogActions sx={{px: 3, pb: 2.5}}><Button onClick={onClose} variant="outlined" sx={{fontWeight: 800, textTransform: 'none'}}>Close</Button></DialogActions>
    </Dialog>
  );
}

function sortRankingRows(rows: RankingRow[]) {
  return [...rows].sort((a, b) => b.value - a.value);
}

function stringifyValue(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => typeof item === 'object' ? JSON.stringify(item) : String(item)).join('; ');
  if (typeof value === 'object' && value !== null) return JSON.stringify(value);
  return String(value ?? '');
}

function getValueAtPath(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in current) return (current as Record<string, unknown>)[key];
    return undefined;
  }, source);
}

function setValueAtPath<T>(source: T, path: string, value: unknown): T {
  const keys = path.split('.');
  const clone = structuredClone(source) as Record<string, unknown>;
  let cursor: Record<string, unknown> = clone;
  keys.slice(0, -1).forEach((key) => {
    cursor = cursor[key] as Record<string, unknown>;
  });
  cursor[keys[keys.length - 1]] = value;
  return clone as T;
}
