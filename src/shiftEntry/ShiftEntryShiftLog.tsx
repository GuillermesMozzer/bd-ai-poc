import {useMemo, useState} from 'react';
import type {ReactElement} from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import {
  BlockOutlined as BlockIcon,
  Check as CheckIcon,
  CheckCircleOutline as CheckCircleIcon,
  Close as CloseIcon,
  GridOn as GridOnIcon,
  History as HistoryIcon,
  ReportProblemOutlined as AlertIcon,
  SaveOutlined as SaveIcon,
  VisibilityOutlined as WatchIcon,
} from '@mui/icons-material';

type ShiftEntryShiftLogProps = {
  currentUserName?: string;
  onCancel: () => void;
  onClose: () => void;
};

type CavityStatus = 'OK' | 'Watch' | 'NG' | 'Blocked';

type CavityUpdate = {
  actionTaken: string;
  comment: string;
  issue: string;
  sampleBag: 'No' | 'Yes';
  status: CavityStatus;
  toolRoom: string;
};

type CavityRecord = CavityUpdate & {
  cavity: string;
  updatedAt: string;
  updatedBy: string;
};

const lineOptions = [
  'TJ1 - Manual Line 1',
  'TJ1 - Manual Line 2',
  'TJ2 - Manual Line 1',
  'TJ2 - Manual Line 3',
];

const moldOptions = [
  'MOLD-FH-12',
  'MOLD-CV-09',
  'MOLD-PX-31',
];

const statusOptions: CavityStatus[] = ['OK', 'Watch', 'NG', 'Blocked'];
const cavityStations = Array.from({length: 16}, (_, index) => index + 1);
const cavityPositions = Array.from({length: 6}, (_, index) => index + 1);
const cavityOptions = Array.from({length: 96}, (_, index) => `C${index + 1}`);

const cavityPositionAreas: Record<number, string> = {
  1: 'top',
  2: 'upperRight',
  3: 'lowerRight',
  4: 'bottom',
  5: 'lowerLeft',
  6: 'upperLeft',
};

const statusTone: Record<CavityStatus, {bg: string; border: string; text: string; solid: string; icon: ReactElement}> = {
  OK: {
    bg: '#DCFCE7',
    border: '#86EFAC',
    text: '#15803D',
    solid: '#22C55E',
    icon: <CheckCircleIcon sx={{fontSize: 15}} />,
  },
  Watch: {
    bg: '#FEF9C3',
    border: '#FACC15',
    text: '#A16207',
    solid: '#EAB308',
    icon: <WatchIcon sx={{fontSize: 15}} />,
  },
  NG: {
    bg: '#FEE2E2',
    border: '#FCA5A5',
    text: '#DC2626',
    solid: '#EF4444',
    icon: <AlertIcon sx={{fontSize: 15}} />,
  },
  Blocked: {
    bg: '#F1F5F9',
    border: '#CBD5E1',
    text: '#64748B',
    solid: '#94A3B8',
    icon: <BlockIcon sx={{fontSize: 15}} />,
  },
};

const initialCavityRecords: Record<string, CavityRecord> = {
  C4: {
    cavity: 'C4',
    status: 'Watch',
    issue: 'Flash trend',
    actionTaken: 'First piece reviewed',
    toolRoom: 'Monitor next two cycles',
    sampleBag: 'Yes',
    comment: 'Dimension close to upper limit.',
    updatedBy: 'Maria Santos',
    updatedAt: '08:42',
  },
  C14: {
    cavity: 'C14',
    status: 'NG',
    issue: 'Dimensional drift',
    actionTaken: 'Output isolated',
    toolRoom: 'Tooling inspection requested',
    sampleBag: 'Yes',
    comment: 'QA hold opened for affected samples.',
    updatedBy: 'Jose Rodriguez',
    updatedAt: '09:05',
  },
  C51: {
    cavity: 'C51',
    status: 'Blocked',
    issue: 'Insert unavailable',
    actionTaken: 'Cavity plugged',
    toolRoom: 'Replace insert',
    sampleBag: 'No',
    comment: 'Approved to run blocked for the shift.',
    updatedBy: 'Ana Costa',
    updatedAt: '07:18',
  },
  C67: {
    cavity: 'C67',
    status: 'Watch',
    issue: 'Short shot signal',
    actionTaken: 'Process parameters adjusted',
    toolRoom: 'None',
    sampleBag: 'No',
    comment: 'Recheck after break.',
    updatedBy: 'Jose Rodriguez',
    updatedAt: '09:12',
  },
};

function buildEmptyUpdate(status: CavityStatus): CavityUpdate {
  return {
    status,
    issue: '',
    actionTaken: '',
    toolRoom: '',
    sampleBag: 'No',
    comment: '',
  };
}

function getCurrentTimeLabel() {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ShiftEntryShiftLog({
  currentUserName = 'Jose Rodriguez',
  onCancel,
  onClose,
}: ShiftEntryShiftLogProps) {
  const [selectedLine, setSelectedLine] = useState(lineOptions[0]);
  const [selectedMold, setSelectedMold] = useState(moldOptions[0]);
  const [selectedCavity, setSelectedCavity] = useState('C14');
  const [records, setRecords] = useState<Record<string, CavityRecord>>(initialCavityRecords);
  const [draft, setDraft] = useState<CavityUpdate>(() => {
    const selectedRecord = initialCavityRecords.C14;
    return {
      status: selectedRecord.status,
      issue: selectedRecord.issue,
      actionTaken: selectedRecord.actionTaken,
      toolRoom: selectedRecord.toolRoom,
      sampleBag: selectedRecord.sampleBag,
      comment: selectedRecord.comment,
    };
  });
  const [savedMessage, setSavedMessage] = useState('');

  const selectedRecord = records[selectedCavity];
  const selectedStatus = selectedRecord?.status ?? 'OK';
  const statusCounts = useMemo(() => {
    return cavityOptions.reduce(
      (acc, cavity) => {
        const status = records[cavity]?.status ?? 'OK';
        acc[status] += 1;
        return acc;
      },
      {OK: 0, Watch: 0, NG: 0, Blocked: 0} as Record<CavityStatus, number>,
    );
  }, [records]);
  const recentRecords = useMemo(
    () => Object.values(records).sort((left, right) => Number(right.cavity.slice(1)) - Number(left.cavity.slice(1))).slice(0, 4),
    [records],
  );

  const selectCavity = (cavity: string) => {
    const record = records[cavity];
    setSelectedCavity(cavity);
    setDraft(record ? {
      status: record.status,
      issue: record.issue,
      actionTaken: record.actionTaken,
      toolRoom: record.toolRoom,
      sampleBag: record.sampleBag,
      comment: record.comment,
    } : buildEmptyUpdate('OK'));
    setSavedMessage('');
  };

  const saveCavityStatus = () => {
    setRecords((current) => ({
      ...current,
      [selectedCavity]: {
        ...draft,
        cavity: selectedCavity,
        updatedBy: currentUserName,
        updatedAt: getCurrentTimeLabel(),
      },
    }));
    setSavedMessage(`${selectedCavity} updated to ${draft.status}.`);
  };

  return (
    <Box sx={{minHeight: '100%', display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto', bgcolor: '#FFFFFF'}}>
      <Box sx={{px: 0.7, minHeight: 0, overflowY: 'auto', pb: 0.6}}>
        <Typography sx={{fontSize: 20, fontWeight: 900, color: '#246BFE', mb: 1.15}}>Mold Log</Typography>

        <Paper elevation={0} sx={{p: 1.15, borderRadius: 1.2, bgcolor: '#F0F5FF', border: '1px solid #DDE7F4', mb: 1.1}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.85, mb: 0.55}}>
            <Box sx={{width: 25, height: 25, borderRadius: '50%', bgcolor: '#0B63E5', display: 'grid', placeItems: 'center', color: '#FFFFFF'}}>
              <GridOnIcon sx={{fontSize: 16}} />
            </Box>
            <Typography sx={{fontSize: 13, fontWeight: 900, color: '#0B63E5'}}>UPDATE CAVITY STATUS</Typography>
          </Box>
          <Typography sx={{fontSize: 11.5, color: '#4B5563', lineHeight: 1.45}}>
            {selectedMold} on {selectedLine}
          </Typography>
        </Paper>

        <Box sx={{display: 'grid', gridTemplateColumns: '1fr', gap: 0.8, mb: 0.9}}>
          <ShiftLogSelectField label="Line / Work Center" value={selectedLine} onChange={setSelectedLine} options={lineOptions} />
          <ShiftLogSelectField label="Mold" value={selectedMold} onChange={setSelectedMold} options={moldOptions} />
        </Box>

        <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 0.55, mb: 1}}>
          {statusOptions.map((status) => (
            <StatusCounter key={status} status={status} count={statusCounts[status]} />
          ))}
        </Box>

        <Paper elevation={0} sx={{borderRadius: 1.25, border: '1px solid #E5EAF3', overflow: 'hidden', mb: 1}}>
          <Box sx={{px: 1.05, py: 0.85, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, borderBottom: '1px solid #E5EAF3'}}>
            <Box>
              <Typography sx={{fontSize: 12.8, color: '#202124', fontWeight: 900}}>Cavity Map</Typography>
              <Typography sx={{fontSize: 10.8, color: '#667085', fontWeight: 700}}>96 cavities - {selectedCavity} selected</Typography>
            </Box>
            <CavityStatusChip status={selectedStatus} label={selectedStatus} />
          </Box>

          <Box sx={{bgcolor: '#F8FAFC', p: 0.8, maxHeight: 420, overflowY: 'auto'}}>
            <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.75}}>
              {cavityStations.map((station) => {
                const cavities = cavityPositions.map((position) => `C${(station - 1) * cavityPositions.length + position}`);
                return (
                  <Box key={station} sx={{border: '1px solid #E5EAF3', borderRadius: 1.2, minHeight: 128, p: 0.45, display: 'grid', placeItems: 'center', bgcolor: '#FFFFFF'}}>
                    <Box sx={{display: 'grid', gridTemplateColumns: '36px 44px 36px', gridTemplateRows: '32px 36px 32px', gridTemplateAreas: `". top ." "upperLeft center upperRight" "lowerLeft bottom lowerRight"`, gap: 0.5, alignItems: 'center', justifyItems: 'center'}}>
                      {cavities.map((cavity, index) => (
                        <CavityMapDot
                          key={cavity}
                          cavity={cavity}
                          position={index + 1}
                          selected={selectedCavity === cavity}
                          status={records[cavity]?.status ?? 'OK'}
                          onSelect={selectCavity}
                        />
                      ))}
                      <Box sx={{gridArea: 'center', width: 42, height: 42, display: 'grid', placeItems: 'center', border: '1px solid #CBD5E1', borderRadius: 1, bgcolor: '#F8FAFC', color: '#202124', fontWeight: 950, fontSize: 15}}>
                        {station}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{p: 1.05, borderRadius: 1.25, border: '1px solid #E5EAF3', mb: 0.9}}>
          <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.9}}>
            <Box>
              <Typography sx={{fontSize: 13.2, color: '#202124', fontWeight: 900}}>Cavity {selectedCavity}</Typography>
              <Typography sx={{fontSize: 10.8, color: '#667085', fontWeight: 700}}>
                Updated by {selectedRecord?.updatedBy ?? currentUserName} at {selectedRecord?.updatedAt ?? getCurrentTimeLabel()}
              </Typography>
            </Box>
            <CavityStatusChip status={draft.status} label={draft.status} />
          </Box>

          <Box sx={{display: 'grid', gap: 0.8}}>
            <ShiftLogSelectField
              label="Cavity Status"
              value={draft.status}
              onChange={(status) => setDraft((current) => ({...current, status: status as CavityStatus}))}
              options={statusOptions}
            />
            <MiniTextField label="Issue / Defect" value={draft.issue} onChange={(issue) => setDraft((current) => ({...current, issue}))} placeholder="Optional issue" />
            <MiniTextField label="Action Taken" value={draft.actionTaken} onChange={(actionTaken) => setDraft((current) => ({...current, actionTaken}))} placeholder="Action completed or planned" />
            <MiniTextField label="Tool Room Follow-up" value={draft.toolRoom} onChange={(toolRoom) => setDraft((current) => ({...current, toolRoom}))} placeholder="Tooling note" />
            <ShiftLogSelectField
              label="Toolroom sample in bag"
              value={draft.sampleBag}
              onChange={(sampleBag) => setDraft((current) => ({...current, sampleBag: sampleBag as 'No' | 'Yes'}))}
              options={['No', 'Yes']}
            />
            <MiniTextField label="Comments" value={draft.comment} onChange={(comment) => setDraft((current) => ({...current, comment}))} placeholder="Shift handover note" multiline />
          </Box>

          {savedMessage ? (
            <Typography sx={{fontSize: 11.5, color: '#16A34A', fontWeight: 800, mt: 0.9}}>
              {savedMessage}
            </Typography>
          ) : null}
        </Paper>

        <Paper elevation={0} sx={{p: 1.05, borderRadius: 1.25, border: '1px solid #E5EAF3'}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.85}}>
            <HistoryIcon sx={{fontSize: 17, color: '#246BFE'}} />
            <Typography sx={{fontSize: 12.8, color: '#202124', fontWeight: 900}}>Recent cavity updates</Typography>
          </Box>
          <Box sx={{display: 'grid', gap: 0.65}}>
            {recentRecords.map((record) => (
              <Box key={record.cavity} sx={{display: 'grid', gridTemplateColumns: '42px 1fr auto', gap: 0.7, alignItems: 'center', p: 0.7, borderRadius: 1.1, bgcolor: '#F8FAFC', border: '1px solid #EDF2F7'}}>
                <Typography sx={{fontSize: 12, color: '#202124', fontWeight: 900}}>{record.cavity}</Typography>
                <Box sx={{minWidth: 0}}>
                  <Typography sx={{fontSize: 11.4, color: '#344054', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                    {record.issue || 'No issue recorded'}
                  </Typography>
                  <Typography sx={{fontSize: 10.5, color: '#667085', fontWeight: 700}}>
                    {record.updatedAt} - {record.updatedBy}
                  </Typography>
                </Box>
                <CavityStatusChip status={record.status} label={record.status} />
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.7, px: 0.7, py: 0.9, bgcolor: '#FFFFFF', borderTop: '1px solid #E5EAF3'}}>
        <Button variant="outlined" startIcon={<CloseIcon sx={{fontSize: 16}} />} onClick={onCancel} sx={{height: 40, minWidth: 0, borderRadius: 999, borderColor: '#7EA7FF', color: '#0B63E5', fontWeight: 800, fontSize: 11.2, whiteSpace: 'nowrap'}}>
          Cancel
        </Button>
        <Button variant="outlined" startIcon={<SaveIcon sx={{fontSize: 16}} />} onClick={saveCavityStatus} sx={{height: 40, minWidth: 0, borderRadius: 999, borderColor: '#7EA7FF', color: '#0B63E5', fontWeight: 800, fontSize: 10.8, whiteSpace: 'nowrap'}}>
          Save status
        </Button>
        <Button variant="contained" startIcon={<CheckIcon sx={{fontSize: 16}} />} onClick={onClose} sx={{height: 40, minWidth: 0, borderRadius: 999, bgcolor: '#0B63E5', fontWeight: 800, fontSize: 11.2, boxShadow: 'none', whiteSpace: 'nowrap'}}>
          Submit
        </Button>
      </Box>
    </Box>
  );
}

function ShiftLogSelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: readonly string[];
  value: string;
}) {
  return (
    <Box sx={{border: '1px solid #D9DEE8', borderRadius: 1.1, position: 'relative', bgcolor: '#FFFFFF'}}>
      <Typography sx={{position: 'absolute', top: -10, left: 9, zIndex: 2, px: 0.55, bgcolor: '#FFFFFF', fontSize: 9.5, color: '#8A93A6'}}>{label}</Typography>
      <TextField
        select
        fullWidth
        value={value}
        onChange={(event) => onChange(event.target.value)}
        size="small"
        InputProps={{
          sx: {
            height: 38,
            fontSize: 12.5,
            fontWeight: 800,
            color: '#202124',
            '& fieldset': {border: 'none'},
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
        ))}
      </TextField>
    </Box>
  );
}

function MiniTextField({
  label,
  multiline = false,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  multiline?: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <TextField
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      multiline={multiline}
      minRows={multiline ? 3 : undefined}
      size="small"
      fullWidth
      InputLabelProps={{shrink: true}}
      sx={{
        '& .MuiInputLabel-root': {fontSize: 11, color: '#667085', fontWeight: 800},
        '& .MuiOutlinedInput-root': {
          borderRadius: 1.1,
          fontSize: 12.5,
          alignItems: multiline ? 'flex-start' : 'center',
        },
      }}
    />
  );
}

function StatusCounter({count, status}: {count: number; status: CavityStatus}) {
  const tone = statusTone[status];
  return (
    <Paper elevation={0} sx={{p: 0.75, borderRadius: 1.15, border: `1px solid ${tone.border}`, bgcolor: tone.bg, minWidth: 0}}>
      <Typography sx={{fontSize: 10, color: tone.text, fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{status}</Typography>
      <Typography sx={{fontSize: 16, color: tone.text, fontWeight: 950, lineHeight: 1.1}}>{count}</Typography>
    </Paper>
  );
}

function CavityStatusChip({label, status}: {label: string; status: CavityStatus}) {
  const tone = statusTone[status];
  return (
    <Chip
      icon={tone.icon}
      label={label}
      size="small"
      sx={{
        height: 24,
        bgcolor: tone.bg,
        border: `1px solid ${tone.border}`,
        color: tone.text,
        fontWeight: 900,
        '& .MuiChip-icon': {color: tone.text, ml: 0.6},
      }}
    />
  );
}

function CavityMapDot({
  cavity,
  onSelect,
  position,
  selected,
  status,
}: {
  cavity: string;
  onSelect: (cavity: string) => void;
  position: number;
  selected: boolean;
  status: CavityStatus;
}) {
  const tone = statusTone[status];
  return (
    <IconButton
      onClick={() => onSelect(cavity)}
      size="small"
      sx={{
        gridArea: cavityPositionAreas[position],
        width: 34,
        height: 32,
        borderRadius: '50%',
        bgcolor: selected ? tone.solid : tone.bg,
        border: `2px solid ${selected ? '#0B63E5' : tone.border}`,
        color: selected ? '#FFFFFF' : tone.text,
        display: 'grid',
        placeItems: 'center',
        boxShadow: selected ? '0 0 0 3px rgba(37, 99, 235, 0.18)' : 'none',
        '&:hover': {bgcolor: selected ? tone.solid : tone.bg, borderColor: '#0B63E5'},
      }}
    >
      <Box sx={{fontSize: 8.5, fontWeight: 900, lineHeight: 1, textAlign: 'center'}}>
        <Box>{`P${cavity.slice(1)}`}</Box>
        <Box>{`[${cavity.slice(1)}]`}</Box>
      </Box>
    </IconButton>
  );
}
