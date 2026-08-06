import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {useEffect, useMemo, useRef, useState} from 'react';
import {
  Avatar,
  Box,
  Button,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  ApartmentOutlined as CategoryIcon,
  AutoAwesome as AutoAwesomeIcon,
  CalendarMonthOutlined as DueDateIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  CloudUploadOutlined as CloudUploadIcon,
  Close as CloseIcon,
  DeleteOutline as DeleteOutlineIcon,
  FlagOutlined as PriorityIcon,
  InfoOutlined as InfoIcon,
  InsertDriveFileOutlined as FileIcon,
  ImageOutlined as ImageIcon,
  KeyboardArrowDown as ArrowDownIcon,
  MicNone as MicIcon,
  PersonOutlineOutlined as AssignedToIcon,
  PlaceOutlined as LocationIcon,
  PictureAsPdfOutlined as PdfIcon,
  PrecisionManufacturingOutlined as MachineIcon,
} from '@mui/icons-material';
import {
  actionTrackerPeople,
  type ActionTrackerAttachment,
  type ActionCategory,
  type ActionPriority,
  type ActionTrackerCreateContext,
  type ActionTrackerCreateDraft,
  type ActionType,
} from './actionTrackerStore';
import { useActionTrackerContext } from '../../actionTracker/contexts/ActionTrackerContext';
import {actionTrackerPlantOptions} from '../../actionTracker/config';
import {
  buildActionTrackerLocationFromScope,
  getActionTrackerAreaOptionsByPlant,
  getActionTrackerLineOptionsByUnit,
  getActionTrackerMachineOptionsByScope,
  getActionTrackerUnitOptionsByArea,
  getActionTrackerZoneOptionsByLine,
  isActionTrackerZoneVisible,
  resolveActionTrackerScope,
} from '../../actionTracker/utils';

type ActionTrackerCreateDrawerProps = {
  autoStartSuggestionMode?: Exclude<SuggestionMode, null>;
};

type SuggestionMode = 'voice' | 'typing' | null;
type VoiceDemoState = 'idle' | 'listening' | 'generating';
type FlashField = 'title' | 'problem' | 'type' | 'category' | 'plant' | 'area' | 'unit' | 'line' | 'zone' | 'machine' | 'priority' | 'assignedTo' | 'dueDate' | 'approver';
type ActionTrackerSuggestionSeed = {
  title: string;
  problem: string;
  source?: string;
  plant: string;
  category: ActionCategory;
  area: string;
  unit: string;
  line: string;
  zone: string;
  machine: string;
  priority: ActionPriority;
  assignedTo: string;
  dueDate: string;
  type: ActionType;
  approver: string;
  createdBy?: string;
  originRecordId?: string;
  originRecordLabel?: string;
  originScreen?: string;
};

const categoryOptions: ActionCategory[] = ['SAFETY', 'QUALITY', 'DELIVERY', 'COST', 'PEOPLE'];
const priorityOptions: ActionPriority[] = ['High', 'Medium', 'Low'];
const standardTypeOptions: ActionType[] = ['Corrective', 'Preventive'];
const safetyTypeOptions: ActionType[] = ['BBS', 'Near Miss', 'Condition Report'];

const aiSuggestionSeed = {
  title: 'Follow up repeat facilities issue',
  problem:
    'There is water leaking from the ceiling near Building A, 2nd Floor. The area needs containment, facilities support, and a quick inspection before the next handoff.',
  plant: 'TJ1',
  category: 'PEOPLE' as ActionCategory,
  area: 'Facilities',
  unit: 'Infrastructure',
  line: 'Line Support',
  zone: '',
  machine: 'Air Handler AH-03',
  priority: 'Medium' as ActionPriority,
  assignedTo: 'James Miller',
  dueDate: 'May 16, 2026',
  type: 'Corrective' as ActionType,
  approver: 'Madison Brooks',
} satisfies ActionTrackerSuggestionSeed;

const demoVoiceTranscript =
  'There is a liquid spill near the Line 3 walkway creating a slip hazard. The area needs to be cleaned and blocked off immediately.';

function buildDemoVoiceSuggestion(todayLabel: string): ActionTrackerSuggestionSeed {
  return {
    title: 'Clean liquid spill near Line 3 walkway',
    problem: 'A liquid spill was found near the Line 3 walkway, creating a slip hazard. The area needs to be cleaned and blocked off immediately.',
    plant: 'TJ1',
    category: 'SAFETY',
    area: 'Packaging',
    unit: 'Packaging Unit 1',
    line: 'Line 3',
    zone: '',
    machine: '',
    priority: 'High',
    assignedTo: 'John Smith',
    dueDate: todayLabel,
    type: 'Corrective',
    approver: 'Madison Brooks',
  };
}

function formatDateForStorage(value: string) {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

function formatDateForInput(value: string) {
  if (!value.trim()) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('en-CA');
}

function getTypeOptions(category: ActionCategory | '' | undefined) {
  return category === 'SAFETY' ? safetyTypeOptions : standardTypeOptions;
}

function buildSuggestedType(category: ActionCategory | '' | undefined): ActionType {
  if (category === 'SAFETY') return 'Condition Report';
  return 'Corrective';
}

function buildInitialDraft(createdBy = 'John Smith'): ActionTrackerCreateDraft {
  return {
    title: '',
    problem: '',
    type: '',
    category: '',
    plant: actionTrackerPlantOptions[0] ?? '',
    area: '',
    unit: '',
    line: '',
    zone: '',
    machine: '',
    priority: '',
    location: '',
    dueDate: '',
    createdBy,
    assignedTo: '',
    approver: '',
    supportNeeded: false,
    supportOwner: '',
    aiAssisted: false,
    attachments: [],
    source: 'Action Tracker',
    createdAtMs: Date.now(),
  };
}

function buildDraftFromContext(context: ActionTrackerCreateContext, currentUserName: string): ActionTrackerCreateDraft {
  const createdBy = context.createdBy?.trim() || currentUserName;
  const problem = context.problem?.trim() || context.title?.trim() || '';
  const title = context.title?.trim() || '';
  const scope = resolveActionTrackerScope(context);

  return {
    ...buildInitialDraft(createdBy),
    title,
    problem,
    type: context.type ?? '',
    category: context.category ?? '',
    plant: scope.plant,
    area: scope.area,
    unit: scope.unit,
    line: scope.line,
    zone: scope.zone,
    machine: context.machine ?? '',
    priority: context.priority ?? '',
    location: context.location ?? buildActionTrackerLocationFromScope(scope.line, scope.area, scope.unit, scope.plant, scope.zone),
    dueDate: context.dueDate ?? '',
    createdBy,
    assignedTo: context.assignedTo ?? '',
    approver: context.approver ?? '',
    aiAssisted: Boolean(context.aiAssisted),
    source: context.source,
    originRecordId: context.originRecordId,
    originRecordLabel: context.originRecordLabel,
    originScreen: context.originScreen,
    tierLevel: context.tierLevel,
    meetingDate: context.meetingDate,
    createdAtMs: Date.now(),
  };
}

function formatCreatedDateLabel(createdAtMs?: number) {
  return formatDateForStorage(new Date((createdAtMs ?? Date.now())).toLocaleDateString('en-CA'));
}

function formatCategoryLabel(category: string) {
  return category.charAt(0) + category.slice(1).toLowerCase();
}

function formatTypeLabel(type: string) {
  if (type === 'Corrective') return 'Corrective Action';
  if (type === 'Preventive') return 'Preventive Action';
  return type;
}

function getAttachmentVisualKind(attachment: Pick<ActionTrackerAttachment, 'mimeType' | 'name'>) {
  const mimeType = attachment.mimeType.toLowerCase();
  const fileName = attachment.name.toLowerCase();
  if (mimeType.startsWith('image/')) return 'image' as const;
  if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) return 'pdf' as const;
  return 'file' as const;
}

function formatAttachmentSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function readAttachmentFile(file: File): Promise<ActionTrackerAttachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Unable to read attachment.'));
        return;
      }
      resolve({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl: reader.result,
      });
    };
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read attachment.'));
    reader.readAsDataURL(file);
  });
}

function AssistantCard({
  enabled,
  onAccept,
  onDismiss,
}: {
  enabled: boolean;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.2,
        borderRadius: 1.7,
        bgcolor: enabled ? tokenNeutral.lighter : tokenNeutral.lightest,
        border: `1px solid ${tokenNeutral.main}`,
        mb: 1.5,
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.2}}>
        <Box>
          <Typography sx={{fontSize: 13, fontWeight: 900, color: tokenBrand.dark, display: 'flex', alignItems: 'center', gap: 0.45}}>
            <AutoAwesomeIcon sx={{fontSize: 15, color: tokenWarning.dark}} />
            My Ia Assistent
          </Typography>
          <Typography sx={{fontSize: 12, color: tokenInfo.darkest, mt: 0.4}}>
            Would you like assistance here?
          </Typography>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0}}>
          <Button
            onClick={onDismiss}
            sx={{minWidth: 28, width: 28, height: 28, p: 0, borderRadius: '50%', color: tokenBrand.light}}
          >
            <CloseIcon sx={{fontSize: 18}} />
          </Button>
          <Button
            onClick={onAccept}
            sx={{minWidth: 28, width: 28, height: 28, p: 0, borderRadius: '50%', color: enabled ? tokenBrand.main : tokenBrand.lightest}}
          >
            <CheckCircleOutlineIcon sx={{fontSize: 20}} />
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

function SuggestionField({
  badgeLabel,
  badgeTone = 'ai',
  disabled = false,
  flash,
  icon,
  label,
  placeholder,
  renderControl,
  fullWidth = false,
}: {
  badgeLabel?: string;
  badgeTone?: 'ai' | 'system';
  disabled?: boolean;
  flash?: boolean;
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  renderControl: () => React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.05,
        borderRadius: 1.45,
        border: `1px solid ${disabled ? tokenNeutral.main : tokenNeutral.dark}`,
        bgcolor: disabled ? tokenNeutral.lightest : tokenCommon.white,
        minHeight: 72,
        gridColumn: fullWidth ? '1 / -1' : 'auto',
        animation: flash ? 'actionTrackerSuggestionFlash 780ms ease-in-out 2' : 'none',
        '@keyframes actionTrackerSuggestionFlash': {
          '0%': {boxShadow: '0 0 0 0 rgba(20, 87, 215, 0)', borderColor: tokenNeutral.dark},
          '35%': {boxShadow: '0 0 0 4px rgba(20, 87, 215, 0.14)', borderColor: tokenBrand.main},
          '100%': {boxShadow: '0 0 0 0 rgba(20, 87, 215, 0)', borderColor: tokenNeutral.dark},
        },
      }}
    >
      <Box sx={{display: 'grid', gridTemplateColumns: '36px minmax(0, 1fr)', gap: 0.95, alignItems: 'center'}}>
        <Box sx={{width: 36, height: 36, borderRadius: '50%', bgcolor: tokenNeutral.lighter, color: tokenBrand.main, display: 'grid', placeItems: 'center'}}>
          {icon}
        </Box>
        <Box sx={{minWidth: 0}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mb: 0.15}}>
            <Typography sx={{fontSize: 10.5, color: workstationVisuals.textSecondary, fontWeight: 700}}>
              {label}
            </Typography>
            {badgeLabel ? (
              <Box
                sx={{
                  px: 0.55,
                  py: 0.1,
                  borderRadius: 999,
                  border: `1px solid ${badgeTone === 'system' ? '#D6DCE5' : '#CFE0FF'}`,
                  bgcolor: badgeTone === 'system' ? '#F3F5F7' : '#EEF5FF',
                }}
              >
                <Typography sx={{fontSize: 9.5, fontWeight: 800, color: badgeTone === 'system' ? '#667085' : tokenBrand.main, lineHeight: 1.2}}>
                  {badgeLabel}
                </Typography>
              </Box>
            ) : null}
          </Box>
          {renderControl()}
          <Typography sx={{display: 'none'}}>
            {placeholder}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

function SelectSuggestionField({
  disabled = false,
  options,
  placeholder,
  value,
  onChange,
  formatOptionLabel,
}: {
  disabled?: boolean;
  options: string[];
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  formatOptionLabel?: (option: string) => string;
}) {
  const getOptionLabel = (option: string) => formatOptionLabel ? formatOptionLabel(option) : option;

  return (
    <FormControl size="small" fullWidth>
      <Select
        disabled={disabled}
        displayEmpty
        value={value}
        onChange={(event) => onChange(event.target.value)}
        IconComponent={ArrowDownIcon}
        renderValue={(selected) => (
          selected
            ? <Typography sx={{fontSize: 12.5, color: workstationVisuals.textPrimary, fontWeight: 800}}>{getOptionLabel(selected)}</Typography>
            : <Typography sx={{fontSize: 12.5, color: workstationVisuals.textMuted, fontWeight: 700}}>{placeholder}</Typography>
        )}
        sx={{
          mt: -0.1,
          '& .MuiOutlinedInput-notchedOutline': {border: 'none'},
          '& .MuiSelect-select': {px: 0, py: 0, minHeight: 'auto !important'},
          '& .MuiSelect-icon': {color: workstationVisuals.textSecondary},
          '&.Mui-disabled .MuiSelect-select': {
            WebkitTextFillColor: workstationVisuals.textSecondary,
          },
        }}
      >
        <MenuItem value="">
          <Typography sx={{fontSize: 12.5, color: workstationVisuals.textMuted}}>{placeholder}</Typography>
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option} value={option}>{getOptionLabel(option)}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function DateSuggestionField({
  disabled = false,
  value,
  onChange,
  placeholder,
}: {
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openPicker = () => {
    const input = inputRef.current as (HTMLInputElement & {showPicker?: () => void}) | null;
    if (!input) return;

    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }

    input.click();
  };

  return (
    <Box sx={{position: 'relative'}}>
      <Box
        role="button"
        tabIndex={0}
        onClick={() => {
          if (!disabled) openPicker();
        }}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openPicker();
          }
        }}
        sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.8, cursor: disabled ? 'default' : 'pointer'}}
      >
        <Typography sx={{fontSize: 12.5, color: value ? workstationVisuals.textPrimary : workstationVisuals.textMuted, fontWeight: value ? 800 : 700}}>
          {value || placeholder}
        </Typography>
        <ArrowDownIcon sx={{fontSize: 18, color: workstationVisuals.textSecondary}} />
      </Box>
      <input
        ref={inputRef}
        type="date"
        value={formatDateForInput(value)}
        onChange={(event) => onChange(formatDateForStorage(event.target.value))}
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
}

function PersonSuggestionField({
  disabled = false,
  value,
  onChange,
  placeholder = 'Select owner',
}: {
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <FormControl size="small" fullWidth>
      <Select
        disabled={disabled}
        displayEmpty
        value={value}
        onChange={(event) => onChange(event.target.value)}
        IconComponent={ArrowDownIcon}
        renderValue={(selected) => {
          if (!selected) {
            return <Typography sx={{fontSize: 12.5, color: workstationVisuals.textMuted, fontWeight: 700}}>{placeholder}</Typography>;
          }

          return (
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7}}>
              <Avatar sx={{width: 18, height: 18, bgcolor: tokenNeutral.dark, color: tokenSuccess.darkest, fontSize: 9, fontWeight: 900}}>
                {selected.split(' ').map((part) => part[0]).join('').slice(0, 2)}
              </Avatar>
              <Typography sx={{fontSize: 12.5, color: workstationVisuals.textPrimary, fontWeight: 800}}>{selected}</Typography>
            </Box>
          );
        }}
        sx={{
          mt: -0.1,
          '& .MuiOutlinedInput-notchedOutline': {border: 'none'},
          '& .MuiSelect-select': {px: 0, py: 0, minHeight: 'auto !important'},
          '& .MuiSelect-icon': {color: workstationVisuals.textSecondary},
          '&.Mui-disabled .MuiSelect-select': {
            WebkitTextFillColor: workstationVisuals.textSecondary,
          },
        }}
      >
        <MenuItem value="">
          <Typography sx={{fontSize: 12.5, color: workstationVisuals.textMuted}}>{placeholder}</Typography>
        </MenuItem>
        {actionTrackerPeople.map((person) => (
          <MenuItem key={person} value={person}>{person}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function ReadOnlyPersonField({value, placeholder}: {value: string; placeholder: string}) {
  if (!value) {
    return <Typography sx={{fontSize: 12.5, color: workstationVisuals.textMuted, fontWeight: 700}}>{placeholder}</Typography>;
  }

  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7}}>
      <Avatar sx={{width: 18, height: 18, bgcolor: tokenNeutral.dark, color: tokenSuccess.darkest, fontSize: 9, fontWeight: 900}}>
        {value.split(' ').map((part) => part[0]).join('').slice(0, 2)}
      </Avatar>
      <Typography sx={{fontSize: 12.5, color: workstationVisuals.textPrimary, fontWeight: 800}}>{value}</Typography>
    </Box>
  );
}

function FullTextField({
  label,
  placeholder,
  value,
  onChange,
  multiline = false,
  minRows,
  mic = false,
  flash = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  minRows?: number;
  mic?: boolean;
  flash?: boolean;
}) {
  return (
    <Box>
      <Typography sx={{fontSize: 11, color: workstationVisuals.textSecondary, fontWeight: 700, mb: 0.45}}>
        {label}
      </Typography>
      <TextField
        size="small"
        fullWidth
        multiline={multiline}
        minRows={minRows}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        InputProps={{
          endAdornment: mic ? (
            <InputAdornment position="end" sx={multiline ? {alignSelf: 'flex-start', mt: 0.9} : undefined}>
              <MicIcon sx={{color: tokenBrand.main}} fontSize="small" />
            </InputAdornment>
          ) : undefined,
          sx: {
            borderRadius: 1.4,
            bgcolor: tokenCommon.white,
            animation: flash ? 'actionTrackerSuggestionFlash 780ms ease-in-out 2' : 'none',
            '& input::placeholder, & textarea::placeholder': {
              color: workstationVisuals.textMuted,
              opacity: 1,
            },
            '@keyframes actionTrackerSuggestionFlash': {
              '0%': {boxShadow: '0 0 0 0 rgba(20, 87, 215, 0)', borderColor: tokenNeutral.dark},
              '35%': {boxShadow: '0 0 0 4px rgba(20, 87, 215, 0.14)', borderColor: tokenBrand.main},
              '100%': {boxShadow: '0 0 0 0 rgba(20, 87, 215, 0)', borderColor: tokenNeutral.dark},
            },
          },
        }}
      />
    </Box>
  );
}

function ActionDetailsForm({
  aiSuggestedFields,
  autoSelectedFields,
  draft,
  flashFields,
  onDraftChange,
  plantOptions,
  areaOptions,
  unitOptions,
  lineOptions,
  zoneOptions,
  machineOptions,
  showZone,
  onPlantChange,
  onAreaChange,
  onUnitChange,
  onLineChange,
  onZoneChange,
  systemLockedFields,
}: {
  aiSuggestedFields: Partial<Record<FlashField | 'source', boolean>>;
  autoSelectedFields: Partial<Record<FlashField, boolean>>;
  draft: ActionTrackerCreateDraft;
  flashFields: Record<FlashField, boolean>;
  onDraftChange: (nextDraft: ActionTrackerCreateDraft) => void;
  plantOptions: string[];
  areaOptions: string[];
  unitOptions: string[];
  lineOptions: string[];
  zoneOptions: string[];
  machineOptions: string[];
  showZone: boolean;
  onPlantChange: (value: string) => void;
  onAreaChange: (value: string) => void;
  onUnitChange: (value: string) => void;
  onLineChange: (value: string) => void;
  onZoneChange: (value: string) => void;
  systemLockedFields: Partial<Record<FlashField | 'createdBy' | 'createdAt' | 'source', boolean>>;
}) {
  const getFieldBadge = (field: FlashField) => {
    if (systemLockedFields[field]) return {label: 'System', tone: 'system' as const, disabled: true};
    if (autoSelectedFields[field]) return {label: 'Auto-selected', tone: 'system' as const, disabled: true};
    if (aiSuggestedFields[field]) return {label: 'AI suggested', tone: 'ai' as const, disabled: false};
    return {label: undefined, tone: 'ai' as const, disabled: false};
  };

  const plantBadge = systemLockedFields.plant
    ? {label: 'System', tone: 'system' as const, disabled: true}
    : aiSuggestedFields.plant
      ? {label: 'AI suggested', tone: 'ai' as const, disabled: false}
      : {label: undefined, tone: 'ai' as const, disabled: false};
  const areaBadge = getFieldBadge('area');
  const unitBadge = getFieldBadge('unit');
  const lineBadge = getFieldBadge('line');
  const zoneBadge = getFieldBadge('zone');
  const machineBadge = getFieldBadge('machine');

  return (
    <Box sx={{display: 'grid', gap: 1.05, mt: 1.2}}>
      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.95}}>
        <SuggestionField
          badgeLabel="System"
          badgeTone="system"
          disabled
          icon={<AssignedToIcon sx={{fontSize: 18}} />}
          label="Created by"
          placeholder="Creator"
          renderControl={() => (
            <ReadOnlyPersonField
              value={draft.createdBy}
              placeholder="Creator"
            />
          )}
        />
        <SuggestionField
          badgeLabel="System"
          badgeTone="system"
          disabled
          icon={<DueDateIcon sx={{fontSize: 18}} />}
          label="Created date"
          placeholder="Created date"
          renderControl={() => (
            <Typography sx={{fontSize: 12.5, color: workstationVisuals.textSecondary, fontWeight: 800}}>
              {formatCreatedDateLabel(draft.createdAtMs)}
            </Typography>
          )}
        />
      </Box>
      <SuggestionField
        badgeLabel="System"
        badgeTone="system"
        disabled
        icon={<AutoAwesomeIcon sx={{fontSize: 18}} />}
        label="Source"
        placeholder="Source"
        renderControl={() => (
          <Typography sx={{fontSize: 12.5, color: workstationVisuals.textSecondary, fontWeight: 800}}>
            {draft.source || 'Action Tracker'}
          </Typography>
        )}
        fullWidth
      />
      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.95}}>
        <SuggestionField
          badgeLabel={aiSuggestedFields.category ? 'AI suggested' : undefined}
          flash={flashFields.category}
          icon={<CategoryIcon sx={{fontSize: 18}} />}
          label="Category"
          placeholder="Select category"
          renderControl={() => (
            <SelectSuggestionField
              options={categoryOptions}
              placeholder="Select category"
              value={draft.category}
              onChange={(value) => onDraftChange({...draft, category: value as ActionCategory | ''})}
              formatOptionLabel={formatCategoryLabel}
            />
          )}
        />

        <SuggestionField
          badgeLabel={plantBadge.label}
          badgeTone={plantBadge.tone}
          disabled={plantBadge.disabled}
          flash={flashFields.plant}
          icon={<LocationIcon sx={{fontSize: 18}} />}
          label="Plant"
          placeholder="Select plant"
          renderControl={() => (
            <SelectSuggestionField
              options={plantOptions}
              placeholder="Select plant"
              value={draft.plant}
              disabled={plantBadge.disabled}
              onChange={onPlantChange}
            />
          )}
        />

        <SuggestionField
          badgeLabel={areaBadge.label}
          badgeTone={areaBadge.tone}
          disabled={areaBadge.disabled}
          flash={flashFields.area}
          icon={<CategoryIcon sx={{fontSize: 18}} />}
          label="Area"
          placeholder="Select area"
          renderControl={() => (
            <SelectSuggestionField
              options={areaOptions}
              placeholder="Select area"
              value={draft.area}
              disabled={areaBadge.disabled}
              onChange={onAreaChange}
            />
          )}
        />

        <SuggestionField
          badgeLabel={unitBadge.label}
          badgeTone={unitBadge.tone}
          disabled={unitBadge.disabled}
          flash={flashFields.unit}
          icon={<CategoryIcon sx={{fontSize: 18}} />}
          label="Unit"
          placeholder="Select unit"
          renderControl={() => (
            <SelectSuggestionField
              options={unitOptions}
              placeholder="Select unit"
              value={draft.unit}
              disabled={unitBadge.disabled}
              onChange={onUnitChange}
            />
          )}
        />

        <SuggestionField
          badgeLabel={lineBadge.label}
          badgeTone={lineBadge.tone}
          disabled={lineBadge.disabled}
          flash={flashFields.line}
          icon={<LocationIcon sx={{fontSize: 18}} />}
          label="Line"
          placeholder="Select line"
          renderControl={() => (
            <SelectSuggestionField
              options={lineOptions}
              placeholder="Select line"
              value={draft.line}
              disabled={lineBadge.disabled}
              onChange={onLineChange}
            />
          )}
        />

        {showZone ? (
          <SuggestionField
            badgeLabel={zoneBadge.label}
            badgeTone={zoneBadge.tone}
            disabled={zoneBadge.disabled}
            flash={flashFields.zone}
            icon={<LocationIcon sx={{fontSize: 18}} />}
            label="Zone (optional)"
            placeholder="Select zone"
            renderControl={() => (
              <SelectSuggestionField
                options={zoneOptions}
                placeholder="Select zone"
                value={draft.zone}
                disabled={zoneBadge.disabled}
                onChange={onZoneChange}
              />
            )}
          />
        ) : null}

        <SuggestionField
          flash={flashFields.priority}
          icon={<PriorityIcon sx={{fontSize: 18}} />}
          label="Priority"
          placeholder="Select priority"
          renderControl={() => (
            <SelectSuggestionField
              options={priorityOptions}
              placeholder="Select priority"
              value={draft.priority}
              onChange={(value) => onDraftChange({...draft, priority: value as ActionPriority | ''})}
            />
          )}
        />

        <SuggestionField
          badgeLabel={aiSuggestedFields.type ? 'AI suggested' : undefined}
          flash={flashFields.type}
          icon={<AutoAwesomeIcon sx={{fontSize: 18}} />}
          label="Type (optional)"
          placeholder="Select type"
          renderControl={() => (
            <SelectSuggestionField
              options={getTypeOptions(draft.category)}
              placeholder="Select type"
              value={draft.type}
              onChange={(value) => onDraftChange({...draft, type: value as ActionType | ''})}
              formatOptionLabel={formatTypeLabel}
            />
          )}
        />

        <SuggestionField
          badgeLabel={machineBadge.label}
          badgeTone={machineBadge.tone}
          disabled={machineBadge.disabled}
          flash={flashFields.machine}
          icon={<MachineIcon sx={{fontSize: 18}} />}
          label="Machine (optional)"
          placeholder="Select machine"
          renderControl={() => (
            <SelectSuggestionField
              options={machineOptions}
              placeholder="Select machine"
              value={draft.machine}
              disabled={machineBadge.disabled}
              onChange={(value) => onDraftChange({...draft, machine: value})}
            />
          )}
        />

        <SuggestionField
          badgeLabel={aiSuggestedFields.dueDate ? 'AI suggested' : undefined}
          flash={flashFields.dueDate}
          icon={<DueDateIcon sx={{fontSize: 18}} />}
          label="Due date"
          placeholder="Select due date"
          renderControl={() => (
            <DateSuggestionField
              value={draft.dueDate}
              onChange={(value) => onDraftChange({...draft, dueDate: value})}
              placeholder="Select due date"
            />
          )}
        />

        <SuggestionField
          badgeLabel={aiSuggestedFields.assignedTo ? 'AI suggested' : undefined}
          flash={flashFields.assignedTo}
          icon={<AssignedToIcon sx={{fontSize: 18}} />}
          label="Owner"
          placeholder="Select owner"
          renderControl={() => (
            <PersonSuggestionField
              value={draft.assignedTo}
              onChange={(value) => onDraftChange({...draft, assignedTo: value})}
              placeholder="Select owner"
            />
          )}
        />

        <SuggestionField
          badgeLabel={aiSuggestedFields.approver ? 'AI suggested' : undefined}
          flash={flashFields.approver}
          icon={<AssignedToIcon sx={{fontSize: 18}} />}
          label="Approver"
          placeholder="Select approver"
          renderControl={() => (
            <PersonSuggestionField
              value={draft.approver}
              onChange={(value) => onDraftChange({...draft, approver: value})}
              placeholder="Select approver"
            />
          )}
        />
      </Box>
    </Box>
  );
}

export default function ActionTrackerCreateDrawer({
  autoStartSuggestionMode,
}: ActionTrackerCreateDrawerProps) {
  const {
    currentUserName,
    isActionCreateDrawerOpen: open,
    closeActionCreateDrawer,
    saveActionFromDrawer: onCreate,
    actionCreateSuggestionSeed: suggestionSeed,
    setActionCreateSuggestionSeed,
    actionCreateContext,
    setActionCreateContext,
  } = useActionTrackerContext();
  const onClose = () => {
    closeActionCreateDrawer();
    setActionCreateSuggestionSeed(null);
    setActionCreateContext(null);
  };
  const [draft, setDraft] = useState<ActionTrackerCreateDraft>(buildInitialDraft(currentUserName));
  const [assistantEnabled, setAssistantEnabled] = useState(true);
  const [isTypingSuggestion, setIsTypingSuggestion] = useState(false);
  const [hasAiSuggestion, setHasAiSuggestion] = useState(false);
  const [suggestionAccepted, setSuggestionAccepted] = useState(false);
  const [hasSubmittedProblem, setHasSubmittedProblem] = useState(false);
  const [suggestionMode, setSuggestionMode] = useState<SuggestionMode>(null);
  const [isReadingAttachments, setIsReadingAttachments] = useState(false);
  const [voiceDemoState, setVoiceDemoState] = useState<VoiceDemoState>('idle');
  const [flashFields, setFlashFields] = useState<Record<FlashField, boolean>>({
    title: false,
    problem: false,
    type: false,
    category: false,
    plant: false,
    area: false,
    unit: false,
    line: false,
    zone: false,
    machine: false,
    priority: false,
    assignedTo: false,
    dueDate: false,
    approver: false,
  });
  const typingStartedRef = useRef(false);
  const autoStartTriggeredRef = useRef(false);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const voiceDemoTimeoutsRef = useRef<number[]>([]);
  const voiceDemoIntervalRef = useRef<number | null>(null);
  const suggestionTimeoutsRef = useRef<number[]>([]);
  const resolvedSuggestionSeed = useMemo<ActionTrackerSuggestionSeed>(() => ({
    ...aiSuggestionSeed,
    ...suggestionSeed,
  }), [suggestionSeed]);
  const demoVoiceSuggestion = useMemo(
    () => buildDemoVoiceSuggestion(formatDateForStorage(new Date().toLocaleDateString('en-CA'))),
    [],
  );
  const areaOptions = useMemo(() => getActionTrackerAreaOptionsByPlant(draft.plant), [draft.plant]);
  const unitOptions = useMemo(() => getActionTrackerUnitOptionsByArea(draft.plant, draft.area), [draft.area, draft.plant]);
  const lineOptions = useMemo(() => getActionTrackerLineOptionsByUnit(draft.plant, draft.area, draft.unit), [draft.area, draft.plant, draft.unit]);
  const zoneOptions = useMemo(() => getActionTrackerZoneOptionsByLine(draft.plant, draft.area, draft.unit, draft.line), [draft.area, draft.line, draft.plant, draft.unit]);
  const showZone = useMemo(() => isActionTrackerZoneVisible(draft.plant), [draft.plant]);
  const machineOptions = useMemo(() => getActionTrackerMachineOptionsByScope(draft.plant, draft.area, draft.unit, draft.line, draft.zone), [draft.area, draft.line, draft.plant, draft.unit, draft.zone]);
  const lineIsRequired = lineOptions.length > 0;
  const systemLockedFields = useMemo(() => ({
    createdBy: true,
    createdAt: true,
    source: true,
    plant: Boolean(actionCreateContext?.plant?.trim()) || actionTrackerPlantOptions.length === 1,
    area: Boolean(actionCreateContext?.area?.trim()),
    unit: Boolean(actionCreateContext?.unit?.trim()),
    line: Boolean(actionCreateContext?.line?.trim()),
    zone: Boolean(actionCreateContext?.zone?.trim()),
    machine: Boolean(actionCreateContext?.machine?.trim()),
  }), [actionCreateContext]);
  const autoSelectedFields = useMemo(() => ({
    area: !systemLockedFields.area && Boolean(draft.area) && areaOptions.length === 1,
    unit: !systemLockedFields.unit && Boolean(draft.unit) && unitOptions.length === 1,
    line: !systemLockedFields.line && Boolean(draft.line) && lineOptions.length === 1,
    zone: !systemLockedFields.zone && showZone && Boolean(draft.zone) && zoneOptions.length === 1,
    machine: !systemLockedFields.machine && Boolean(draft.machine) && machineOptions.length === 1,
  }), [areaOptions.length, draft.area, draft.line, draft.machine, draft.unit, draft.zone, lineOptions.length, machineOptions.length, showZone, systemLockedFields, unitOptions.length, zoneOptions.length]);
  const aiSuggestedFields = useMemo<Partial<Record<FlashField | 'source', boolean>>>(() => ({
    category: hasAiSuggestion || suggestionAccepted,
    plant: (hasAiSuggestion || suggestionAccepted) && !systemLockedFields.plant,
    area: (hasAiSuggestion || suggestionAccepted) && !systemLockedFields.area,
    unit: (hasAiSuggestion || suggestionAccepted) && !systemLockedFields.unit,
    line: (hasAiSuggestion || suggestionAccepted) && !systemLockedFields.line,
    zone: (hasAiSuggestion || suggestionAccepted) && !systemLockedFields.zone,
    machine: (hasAiSuggestion || suggestionAccepted) && !systemLockedFields.machine,
    priority: hasAiSuggestion || suggestionAccepted,
    type: hasAiSuggestion || suggestionAccepted,
    dueDate: hasAiSuggestion || suggestionAccepted,
    assignedTo: hasAiSuggestion || suggestionAccepted,
    approver: hasAiSuggestion || suggestionAccepted,
  }), [hasAiSuggestion, suggestionAccepted, systemLockedFields]);

  const handlePlantChange = (value: string) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      plant: value,
      area: '',
      unit: '',
      line: '',
      zone: '',
      machine: '',
    }));
  };

  const handleAreaChange = (value: string) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      area: value,
      unit: '',
      line: '',
      zone: '',
      machine: '',
    }));
  };

  const handleUnitChange = (value: string) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      unit: value,
      line: '',
      zone: '',
      machine: '',
    }));
  };

  const handleLineChange = (value: string) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      line: value,
      zone: '',
      machine: '',
    }));
  };

  const handleZoneChange = (value: string) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      zone: value,
      machine: '',
    }));
  };

  useEffect(() => {
    if (!draft.plant && actionTrackerPlantOptions.length === 1) {
      handlePlantChange(actionTrackerPlantOptions[0]);
      return;
    }
    if (!draft.area && areaOptions.length === 1) {
      handleAreaChange(areaOptions[0]);
      return;
    }
    if (!draft.unit && unitOptions.length === 1) {
      handleUnitChange(unitOptions[0]);
      return;
    }
    if (!draft.line && lineOptions.length === 1) {
      handleLineChange(lineOptions[0]);
      return;
    }
    if (showZone && !draft.zone && zoneOptions.length === 1) {
      handleZoneChange(zoneOptions[0]);
      return;
    }
    if (!draft.machine && machineOptions.length === 1) {
      setDraft((currentDraft) => ({...currentDraft, machine: machineOptions[0]}));
    }
  }, [areaOptions, draft.area, draft.line, draft.machine, draft.plant, draft.unit, draft.zone, lineOptions, machineOptions, showZone, unitOptions, zoneOptions]);

  useEffect(() => {
    if (!open) {
      setDraft(buildInitialDraft(currentUserName));
      setAssistantEnabled(true);
      setIsTypingSuggestion(false);
      setHasAiSuggestion(false);
      setSuggestionAccepted(false);
      setSuggestionMode(null);
      setIsReadingAttachments(false);
      setVoiceDemoState('idle');
      setFlashFields({
        title: false,
        problem: false,
        type: false,
        category: false,
        plant: false,
        area: false,
        unit: false,
        line: false,
        zone: false,
        machine: false,
        priority: false,
        assignedTo: false,
        dueDate: false,
        approver: false,
      });
      setHasSubmittedProblem(false);
      typingStartedRef.current = false;
      autoStartTriggeredRef.current = false;
      voiceDemoTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      voiceDemoTimeoutsRef.current = [];
      suggestionTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      suggestionTimeoutsRef.current = [];
      if (voiceDemoIntervalRef.current !== null) {
        window.clearInterval(voiceDemoIntervalRef.current);
        voiceDemoIntervalRef.current = null;
      }
      return;
    }
    if (actionCreateContext) {
      setDraft(buildDraftFromContext(actionCreateContext, currentUserName));
      setAssistantEnabled(false);
      setIsTypingSuggestion(false);
      setHasAiSuggestion(false);
      setSuggestionAccepted(true);
      setHasSubmittedProblem(true);
      setSuggestionMode(null);
      setIsReadingAttachments(false);
      setVoiceDemoState('idle');
      typingStartedRef.current = false;
      autoStartTriggeredRef.current = false;
      voiceDemoTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      voiceDemoTimeoutsRef.current = [];
      suggestionTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      suggestionTimeoutsRef.current = [];
      if (voiceDemoIntervalRef.current !== null) {
        window.clearInterval(voiceDemoIntervalRef.current);
        voiceDemoIntervalRef.current = null;
      }
    }
  }, [actionCreateContext, currentUserName, open]);

  const canCreate = useMemo(() => (
    draft.title.trim().length > 0
    && draft.problem.trim().length > 0
    && Boolean(draft.category)
    && Boolean(draft.plant)
    && Boolean(draft.area)
    && Boolean(draft.unit)
    && (!lineIsRequired || Boolean(draft.line))
    && Boolean(draft.priority)
    && draft.assignedTo.trim().length > 0
    && draft.dueDate.trim().length > 0
    && (!draft.supportNeeded || draft.supportOwner.trim().length > 0)
    && !isReadingAttachments
  ), [draft, isReadingAttachments, lineIsRequired]);
  const canSubmitProblem = !isTypingSuggestion && voiceDemoState === 'idle';
  const shouldShowActionDetails = suggestionAccepted || (!!actionCreateContext) || (!assistantEnabled && hasSubmittedProblem);
  const shouldShowActionTitle = hasSubmittedProblem || hasAiSuggestion || suggestionAccepted;
  const showTitleError = hasSubmittedProblem && draft.title.trim().length === 0;
  const showProblemError = hasSubmittedProblem && draft.problem.trim().length === 0;
  const isVoiceDemoRunning = voiceDemoState !== 'idle';
  const problemPlaceholder = voiceDemoState === 'listening'
    ? 'BLU.AI is listening...'
    : voiceDemoState === 'generating'
      ? 'BLU.AI is generating action fields...'
      : 'Describe the issue or incident';

  const triggerFieldFlash = (field: FlashField, delay: number) => {
    const timeoutId = window.setTimeout(() => {
      setFlashFields((current) => ({...current, [field]: true}));
      const resetTimeoutId = window.setTimeout(() => {
        setFlashFields((current) => ({...current, [field]: false}));
      }, 1700);
      suggestionTimeoutsRef.current.push(resetTimeoutId);
    }, delay);
    suggestionTimeoutsRef.current.push(timeoutId);
  };

  const applySuggestionToDraft = (
    problemOverride?: string,
    suggestionSeedOverride?: ActionTrackerSuggestionSeed,
    options: {acceptSuggestion?: boolean; progressive?: boolean} = {},
  ) => {
    const suggestion = suggestionSeedOverride ?? resolvedSuggestionSeed;
    const normalizedProblem = problemOverride?.trim() || draft.problem.trim() || suggestion.problem;
    const acceptSuggestion = options.acceptSuggestion ?? false;
    const progressive = options.progressive ?? false;

    suggestionTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    suggestionTimeoutsRef.current = [];
    setHasAiSuggestion(!acceptSuggestion);
    setSuggestionAccepted(acceptSuggestion);
    setDraft((currentDraft) => ({
      ...currentDraft,
      problem: normalizedProblem,
      title: progressive ? currentDraft.title : suggestion.title,
      category: progressive ? currentDraft.category : suggestion.category,
      plant: progressive ? currentDraft.plant : suggestion.plant,
      area: progressive ? currentDraft.area : suggestion.area,
      unit: progressive ? currentDraft.unit : suggestion.unit,
      line: progressive ? currentDraft.line : suggestion.line,
      zone: progressive ? currentDraft.zone : suggestion.zone,
      machine: progressive ? currentDraft.machine : suggestion.machine,
      priority: progressive ? currentDraft.priority : suggestion.priority,
      assignedTo: progressive ? currentDraft.assignedTo : suggestion.assignedTo,
      dueDate: progressive ? currentDraft.dueDate : suggestion.dueDate,
      location: progressive
        ? currentDraft.location
        : buildActionTrackerLocationFromScope(
          suggestion.line,
          suggestion.area,
          suggestion.unit,
          suggestion.plant,
          suggestion.zone,
        ),
      type: progressive ? currentDraft.type : (suggestion.type || buildSuggestedType(suggestion.category)),
      approver: progressive ? currentDraft.approver : suggestion.approver,
      createdBy: suggestion.createdBy?.trim() || currentDraft.createdBy,
      aiAssisted: true,
      source: suggestion.source || currentDraft.source || 'Action Tracker',
      originRecordId: suggestion.originRecordId ?? currentDraft.originRecordId,
      originRecordLabel: suggestion.originRecordLabel ?? currentDraft.originRecordLabel,
      originScreen: suggestion.originScreen ?? currentDraft.originScreen,
    }));

    const fieldUpdates: Array<{field: FlashField; delay: number; patch: Partial<ActionTrackerCreateDraft>}> = [
      {field: 'title', delay: 0, patch: {title: suggestion.title}},
      {field: 'type', delay: 120, patch: {type: suggestion.type || buildSuggestedType(suggestion.category)}},
      {field: 'category', delay: 240, patch: {category: suggestion.category}},
      {field: 'plant', delay: 360, patch: {plant: suggestion.plant}},
      {field: 'area', delay: 480, patch: {area: suggestion.area}},
      {field: 'unit', delay: 600, patch: {unit: suggestion.unit}},
      {
        field: 'line',
        delay: 720,
        patch: {
          line: suggestion.line,
          location: buildActionTrackerLocationFromScope(
            suggestion.line,
            suggestion.area,
            suggestion.unit,
            suggestion.plant,
            suggestion.zone,
          ),
        },
      },
      {field: 'zone', delay: 840, patch: {zone: suggestion.zone}},
      {field: 'machine', delay: 960, patch: {machine: suggestion.machine}},
      {field: 'priority', delay: 1080, patch: {priority: suggestion.priority}},
      {field: 'assignedTo', delay: 1200, patch: {assignedTo: suggestion.assignedTo}},
      {field: 'dueDate', delay: 1320, patch: {dueDate: suggestion.dueDate}},
      {field: 'approver', delay: 1440, patch: {approver: suggestion.approver}},
    ];

    triggerFieldFlash('problem', 0);

    if (!progressive) {
      fieldUpdates.forEach(({field, delay}) => triggerFieldFlash(field, delay));
      return;
    }

    fieldUpdates.forEach(({field, delay, patch}) => {
      const timeoutId = window.setTimeout(() => {
        setDraft((currentDraft) => ({...currentDraft, ...patch}));
        triggerFieldFlash(field, 0);
      }, delay);
      suggestionTimeoutsRef.current.push(timeoutId);
    });
  };

  const revealSuggestedDetails = (problemOverride?: string, suggestionSeedOverride?: ActionTrackerSuggestionSeed) => {
    setHasAiSuggestion(false);
    setSuggestionAccepted(true);
    setSuggestionMode('typing');
    setIsTypingSuggestion(true);

    const timeoutId = window.setTimeout(() => {
      applySuggestionToDraft(problemOverride, suggestionSeedOverride, {
        acceptSuggestion: true,
        progressive: true,
      });
      setIsTypingSuggestion(false);
    }, 360);
    suggestionTimeoutsRef.current.push(timeoutId);
  };

  const handleProblemSubmit = () => {
    const normalizedProblem = draft.problem.trim();
    setHasSubmittedProblem(true);
    if (!normalizedProblem || isTypingSuggestion) return;

    if (!assistantEnabled) {
      setHasAiSuggestion(false);
      setSuggestionAccepted(true);
      setDraft((currentDraft) => ({
        ...currentDraft,
        aiAssisted: false,
      }));
      return;
    }

    revealSuggestedDetails(normalizedProblem);
  };

  const handleAssistantAccept = () => {
    setAssistantEnabled(true);
    const normalizedProblem = draft.problem.trim();
    if (!normalizedProblem || isTypingSuggestion || isVoiceDemoRunning) return;
    setHasSubmittedProblem(true);
    revealSuggestedDetails(normalizedProblem);
  };

  const startAiSuggestion = (mode: SuggestionMode = 'typing') => {
    if (!assistantEnabled || isTypingSuggestion || isVoiceDemoRunning) return;
    if (typingStartedRef.current) return;

    typingStartedRef.current = true;
    setSuggestionMode(mode);
    setIsTypingSuggestion(true);
    setHasAiSuggestion(false);
    setSuggestionAccepted(false);
    setDraft((currentDraft) => ({
      ...currentDraft,
      problem: '',
      title: '',
      category: '',
      plant: actionTrackerPlantOptions[0] ?? '',
      area: '',
      unit: '',
      line: '',
      zone: '',
      machine: '',
      priority: '',
      assignedTo: '',
      dueDate: '',
      location: '',
      type: '',
      approver: '',
      supportOwner: '',
      aiAssisted: true,
      attachments: [],
    }));

    let cursor = 0;
    const intervalId = window.setInterval(() => {
      cursor += 5;
      const nextProblem = resolvedSuggestionSeed.problem.slice(0, cursor);
      setDraft((currentDraft) => ({
        ...currentDraft,
        problem: nextProblem,
        aiAssisted: true,
      }));

      if (cursor >= resolvedSuggestionSeed.problem.length) {
        window.clearInterval(intervalId);
        setIsTypingSuggestion(false);
      }
    }, 32);
  };

  const handleVoiceInputToggle = () => {
    if (isTypingSuggestion || isVoiceDemoRunning) return;

    voiceDemoTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    voiceDemoTimeoutsRef.current = [];
    if (voiceDemoIntervalRef.current !== null) {
      window.clearInterval(voiceDemoIntervalRef.current);
      voiceDemoIntervalRef.current = null;
    }
    typingStartedRef.current = false;
    autoStartTriggeredRef.current = false;
    setHasSubmittedProblem(true);
    setHasAiSuggestion(false);
    setSuggestionAccepted(false);
    setSuggestionMode('voice');
    setVoiceDemoState('listening');
    setDraft({
      ...buildInitialDraft(currentUserName),
      createdBy: draft.createdBy || currentUserName,
      attachments: draft.attachments,
    });

    voiceDemoTimeoutsRef.current.push(window.setTimeout(() => {
      setVoiceDemoState('generating');
      let cursor = 0;
      voiceDemoIntervalRef.current = window.setInterval(() => {
        cursor += 4;
        const nextProblem = demoVoiceTranscript.slice(0, cursor);
        setDraft((currentDraft) => ({
          ...currentDraft,
          problem: nextProblem,
          aiAssisted: true,
        }));

        if (cursor >= demoVoiceTranscript.length && voiceDemoIntervalRef.current !== null) {
          window.clearInterval(voiceDemoIntervalRef.current);
          voiceDemoIntervalRef.current = null;
        }
      }, 28);
    }, 900));

    voiceDemoTimeoutsRef.current.push(window.setTimeout(() => {
      if (voiceDemoIntervalRef.current !== null) {
        window.clearInterval(voiceDemoIntervalRef.current);
        voiceDemoIntervalRef.current = null;
      }
      applySuggestionToDraft(demoVoiceSuggestion.problem, demoVoiceSuggestion, {
        acceptSuggestion: true,
        progressive: true,
      });
      setVoiceDemoState('idle');
    }, 2800));
  };

  useEffect(() => () => {
    voiceDemoTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    voiceDemoTimeoutsRef.current = [];
    if (voiceDemoIntervalRef.current !== null) {
      window.clearInterval(voiceDemoIntervalRef.current);
      voiceDemoIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const effectiveAutoStartSuggestionMode = autoStartSuggestionMode ?? (suggestionSeed ? 'typing' : null);
    if (!open || !effectiveAutoStartSuggestionMode || autoStartTriggeredRef.current) return undefined;

    autoStartTriggeredRef.current = true;
    const timeoutId = window.setTimeout(() => {
      startAiSuggestion(effectiveAutoStartSuggestionMode);
    }, 260);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [autoStartSuggestionMode, open, resolvedSuggestionSeed, suggestionSeed]);

  const handleCreate = () => {
    if (!canCreate) return;
    onCreate({
      ...draft,
      location: buildActionTrackerLocationFromScope(draft.line, draft.area, draft.unit, draft.plant, draft.zone),
      type: draft.type || buildSuggestedType(draft.category),
    });
    setActionCreateContext(null);
  };

  const handleAttachmentSelect = async (files: FileList | null) => {
    if (!files?.length) return;
    setIsReadingAttachments(true);
    try {
      const nextAttachments = await Promise.all(Array.from(files).map((file) => readAttachmentFile(file)));
      setDraft((currentDraft) => ({
        ...currentDraft,
        attachments: [...currentDraft.attachments, ...nextAttachments],
      }));
    } finally {
      setIsReadingAttachments(false);
      if (attachmentInputRef.current) {
        attachmentInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      attachments: currentDraft.attachments.filter((attachment) => attachment.id !== attachmentId),
    }));
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: {xs: '100%', sm: 500},
          maxWidth: '100vw',
          borderLeft: `1px solid ${tokenNeutral.main}`,
          bgcolor: tokenCommon.white,
          boxShadow: '-18px 0 42px rgba(15, 23, 42, 0.18)',
        },
      }}
    >
      <Box sx={{height: '100%', display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr) auto'}}>
        <Box sx={{px: 1.7, py: 1.9, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Typography sx={{fontSize: 23, fontWeight: 900, color: tokenBrand.main}}>
            New Action
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{color: tokenBrand.main}}>
            <CloseIcon sx={{fontSize: 22}} />
          </IconButton>
        </Box>

        <Box sx={{px: 1.7, pb: 2, minHeight: 0, overflowY: 'auto'}}>
          <AssistantCard
            enabled={assistantEnabled}
            onAccept={handleAssistantAccept}
            onDismiss={() => setAssistantEnabled(false)}
          />

          <>
            <Typography sx={{fontSize: 13, color: workstationVisuals.textPrimary, fontWeight: 800, mb: 0.7}}>
              What happened? <Box component="span" sx={{color: tokenError.main}}>*</Box>
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={5}
              placeholder={problemPlaceholder}
              value={draft.problem}
              onChange={(event) => {
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  problem: event.target.value,
                  aiAssisted: false,
                }));
                setHasSubmittedProblem(false);
                setHasAiSuggestion(false);
                setSuggestionAccepted(false);
                setVoiceDemoState('idle');
                typingStartedRef.current = false;
                autoStartTriggeredRef.current = false;
              }}
              InputProps={{
                sx: {
                  borderRadius: 1.6,
                  alignItems: 'flex-end',
                  bgcolor: tokenCommon.white,
                  '& textarea': {fontSize: 13.5, lineHeight: 1.5},
                  ...(isVoiceDemoRunning ? {
                    boxShadow: '0 0 0 3px rgba(37,99,235,0.08)',
                  } : {}),
                  animation: flashFields.problem ? 'actionTrackerSuggestionFlash 780ms ease-in-out 2' : 'none',
                },
                readOnly: isTypingSuggestion || isVoiceDemoRunning,
                endAdornment: (
                  <InputAdornment position="end" sx={{alignSelf: 'flex-end', mr: 0.2, mb: 0.1}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.85}}>
                      <IconButton
                        size="small"
                        onClick={handleVoiceInputToggle}
                        disabled={isTypingSuggestion || isVoiceDemoRunning}
                        sx={{p: 0.2, color: isVoiceDemoRunning ? tokenError.main : tokenBrand.main}}
                      >
                        <MicIcon sx={{fontSize: 21}} />
                      </IconButton>
                      <Typography sx={{fontSize: 11.5, color: workstationVisuals.textMuted}}>
                        {`${Math.min(draft.problem.length, 1000)}/1000`}
                      </Typography>
                    </Box>
                  </InputAdornment>
                ),
              }}
              error={showProblemError}
            />

            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mt: 1}}>
              <Button
                variant="contained"
                disabled={!canSubmitProblem}
                onClick={handleProblemSubmit}
                sx={{minWidth: 132, height: 34, borderRadius: 999, textTransform: 'none', fontWeight: 900, boxShadow: 'none', ml: 'auto'}}
              >
                Submit info
              </Button>
            </Box>

            {shouldShowActionTitle ? (
              <Box sx={{mt: 1.3}}>
                <Typography sx={{fontSize: 13, color: workstationVisuals.textPrimary, fontWeight: 800, mb: 0.45}}>
                  Action title <Box component="span" sx={{color: tokenError.main}}>*</Box>
                </Typography>
                <Typography sx={{fontSize: 11.5, color: workstationVisuals.textSecondary, mb: 0.7}}>
                  Enter a short title that summarizes the action.
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Example: Replace damaged safety guard on Line 3"
                  value={draft.title}
                  onChange={(event) => {
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      title: event.target.value,
                    }));
                  }}
                  error={showTitleError}
                  helperText={showTitleError ? 'Action title is required.' : ' '}
                  InputProps={{
                    sx: {
                      borderRadius: 1.6,
                      bgcolor: tokenCommon.white,
                      animation: flashFields.title ? 'actionTrackerSuggestionFlash 780ms ease-in-out 2' : 'none',
                      '& input': {fontSize: 13.5},
                    },
                  }}
                  FormHelperTextProps={{
                    sx: {
                      minHeight: 20,
                      mt: 0.45,
                      mx: 0.2,
                      fontSize: 11.5,
                    },
                  }}
                />
              </Box>
            ) : null}
          </>

          {isTypingSuggestion ? (
            <Paper elevation={0} sx={{mt: 1.45, p: 1.2, borderRadius: 1.6, border: `1px solid ${tokenNeutral.main}`, bgcolor: tokenNeutral.lighter}}>
              <Typography sx={{fontSize: 12.5, fontWeight: 900, color: tokenBrand.main, display: 'flex', alignItems: 'center', gap: 0.45}}>
                <AutoAwesomeIcon sx={{fontSize: 15, color: tokenBrand.main}} />
                BLU.AI is drafting
              </Typography>
              <Typography sx={{fontSize: 11.5, color: workstationVisuals.tierTextLabel, mt: 0.45}}>
                {suggestionMode === 'voice'
                  ? 'The voice note is being converted into the action summary now. Action details will keep filling in as soon as the draft is ready.'
                  : 'The action summary is being simulated now. Action details will keep filling in as soon as the draft is ready.'}
              </Typography>
            </Paper>
          ) : null}

          {hasAiSuggestion && !suggestionAccepted ? (
            <Box sx={{mt: 1.6}}>
              <Typography sx={{fontSize: 12.5, fontWeight: 900, color: tokenBrand.main, display: 'flex', alignItems: 'center', gap: 0.45}}>
                <AutoAwesomeIcon sx={{fontSize: 15, color: tokenBrand.main}} />
                AI suggestions
              </Typography>
              <Typography sx={{fontSize: 12, color: workstationVisuals.tierTextLabel, mt: 0.45, mb: 1.15}}>
                Review the suggested details below and accept to continue.
              </Typography>

              <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.95}}>
                <SuggestionField
                  flash={flashFields.category}
                  icon={<CategoryIcon sx={{fontSize: 18}} />}
                  label="Category"
                  placeholder="Select category"
                  renderControl={() => (
                    <SelectSuggestionField
                      options={categoryOptions}
                      placeholder="Select category"
                      value={draft.category}
                      onChange={(value) => setDraft((currentDraft) => ({...currentDraft, category: value as ActionCategory | ''}))}
                      formatOptionLabel={formatCategoryLabel}
                    />
                  )}
                />

                <SuggestionField
                  flash={flashFields.plant}
                  icon={<LocationIcon sx={{fontSize: 18}} />}
                  label="Plant"
                  placeholder="Select plant"
                  renderControl={() => (
                    <SelectSuggestionField
                      options={actionTrackerPlantOptions}
                      placeholder="Select plant"
                      value={draft.plant}
                      onChange={handlePlantChange}
                    />
                  )}
                />

                <SuggestionField
                  flash={flashFields.area}
                  icon={<CategoryIcon sx={{fontSize: 18}} />}
                  label="Area"
                  placeholder="Select area"
                  renderControl={() => (
                    <SelectSuggestionField
                      options={areaOptions}
                      placeholder="Select area"
                      value={draft.area}
                      onChange={handleAreaChange}
                    />
                  )}
                />

                <SuggestionField
                  flash={flashFields.unit}
                  icon={<CategoryIcon sx={{fontSize: 18}} />}
                  label="Unit"
                  placeholder="Select unit"
                  renderControl={() => (
                    <SelectSuggestionField
                      options={unitOptions}
                      placeholder="Select unit"
                      value={draft.unit}
                      onChange={handleUnitChange}
                    />
                  )}
                />

                <SuggestionField
                  flash={flashFields.line}
                  icon={<LocationIcon sx={{fontSize: 18}} />}
                  label="Line"
                  placeholder="Select line"
                  renderControl={() => (
                    <SelectSuggestionField
                      options={lineOptions}
                      placeholder="Select line"
                      value={draft.line}
                      onChange={handleLineChange}
                    />
                  )}
                />

                {showZone ? (
                  <SuggestionField
                    flash={flashFields.zone}
                    icon={<LocationIcon sx={{fontSize: 18}} />}
                    label="Zone (optional)"
                    placeholder="Select zone"
                    renderControl={() => (
                      <SelectSuggestionField
                        options={zoneOptions}
                        placeholder="Select zone"
                        value={draft.zone}
                        onChange={handleZoneChange}
                      />
                    )}
                  />
                ) : null}

                <SuggestionField
                  flash={flashFields.priority}
                  icon={<PriorityIcon sx={{fontSize: 18}} />}
                  label="Priority"
                  placeholder="Select priority"
                  renderControl={() => (
                    <SelectSuggestionField
                      options={priorityOptions}
                      placeholder="Select priority"
                      value={draft.priority}
                      onChange={(value) => setDraft((currentDraft) => ({...currentDraft, priority: value as ActionPriority | ''}))}
                    />
                  )}
                />

                <SuggestionField
                  flash={flashFields.type}
                  icon={<AutoAwesomeIcon sx={{fontSize: 18}} />}
                  label="Type (optional)"
                  placeholder="Select type"
                  renderControl={() => (
                    <SelectSuggestionField
                      options={getTypeOptions(draft.category)}
                      placeholder="Select type"
                      value={draft.type}
                      onChange={(value) => setDraft((currentDraft) => ({...currentDraft, type: value as ActionType | ''}))}
                      formatOptionLabel={formatTypeLabel}
                    />
                  )}
                />

                <SuggestionField
                  flash={flashFields.machine}
                  icon={<MachineIcon sx={{fontSize: 18}} />}
                  label="Machine (optional)"
                  placeholder="Select machine"
                  renderControl={() => (
                    <SelectSuggestionField
                      options={machineOptions}
                      placeholder="Select machine"
                      value={draft.machine}
                      onChange={(value) => setDraft((currentDraft) => ({...currentDraft, machine: value}))}
                    />
                  )}
                />

                <SuggestionField
                  flash={flashFields.dueDate}
                  icon={<DueDateIcon sx={{fontSize: 18}} />}
                  label="Due date"
                  placeholder="Select due date"
                  renderControl={() => (
                    <TextField
                      variant="standard"
                      fullWidth
                      value={draft.dueDate}
                      onChange={(event) => setDraft((currentDraft) => ({...currentDraft, dueDate: event.target.value}))}
                      InputProps={{
                        disableUnderline: true,
                        endAdornment: <ArrowDownIcon sx={{fontSize: 18, color: workstationVisuals.textSecondary}} />,
                        sx: {
                          mt: -0.15,
                          '& input': {
                            p: 0,
                            fontSize: 12.5,
                            fontWeight: 800,
                            color: draft.dueDate ? workstationVisuals.textPrimary : workstationVisuals.textMuted,
                          },
                        },
                      }}
                    />
                  )}
                />

                <SuggestionField
                  flash={flashFields.assignedTo}
                  icon={<AssignedToIcon sx={{fontSize: 18}} />}
                  label="Owner"
                  placeholder="Select owner"
                  renderControl={() => (
                    <PersonSuggestionField
                      value={draft.assignedTo}
                      onChange={(value) => setDraft((currentDraft) => ({...currentDraft, assignedTo: value}))}
                      placeholder="Select owner"
                    />
                  )}
                />

                <SuggestionField
                  flash={flashFields.approver}
                  icon={<AssignedToIcon sx={{fontSize: 18}} />}
                  label="Approver"
                  placeholder="Select approver"
                  renderControl={() => (
                    <PersonSuggestionField
                      value={draft.approver}
                      onChange={(value) => setDraft((currentDraft) => ({...currentDraft, approver: value}))}
                      placeholder="Select approver"
                    />
                  )}
                />
              </Box>

              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.2, mt: 1.1}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7, minWidth: 0}}>
                  <InfoIcon sx={{fontSize: 17, color: workstationVisuals.textSecondary}} />
                  <Typography sx={{fontSize: 11.5, color: workstationVisuals.textSecondary}}>
                    These details are suggestions based on your description.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => {
                    setSuggestionAccepted(true);
                  }}
                  sx={{height: 32, borderRadius: 999, textTransform: 'none', fontWeight: 900, boxShadow: 'none', flexShrink: 0}}
                >
                  Accept suggestion
                </Button>
              </Box>
            </Box>
          ) : null}

          {shouldShowActionDetails ? (
            <>
              <Box sx={{mt: 1.55, pt: 1.45, borderTop: `1px solid ${tokenNeutral.main}`}}>
                <Typography sx={{fontSize: 13, fontWeight: 900, color: tokenBrand.main}}>
                  Action details
                </Typography>
                <Typography sx={{fontSize: 11.5, color: workstationVisuals.textSecondary, mt: 0.3}}>
                  Complete the action in a single form.
                </Typography>
                <Box sx={{display: 'flex', gap: 0.65, flexWrap: 'wrap', mt: 0.85}}>
                  <Box sx={{px: 0.75, py: 0.35, borderRadius: 999, bgcolor: '#F3F5F7', border: '1px solid #D6DCE5'}}>
                    <Typography sx={{fontSize: 10.5, fontWeight: 800, color: '#667085'}}>System captured</Typography>
                  </Box>
                  <Box sx={{px: 0.75, py: 0.35, borderRadius: 999, bgcolor: '#EEF5FF', border: '1px solid #CFE0FF'}}>
                    <Typography sx={{fontSize: 10.5, fontWeight: 800, color: tokenBrand.main}}>AI suggested</Typography>
                  </Box>
                </Box>
                <ActionDetailsForm
                  aiSuggestedFields={aiSuggestedFields}
                  autoSelectedFields={autoSelectedFields}
                  draft={draft}
                  flashFields={flashFields}
                  onDraftChange={setDraft}
                  plantOptions={actionTrackerPlantOptions}
                  areaOptions={areaOptions}
                  unitOptions={unitOptions}
                  lineOptions={lineOptions}
                  zoneOptions={zoneOptions}
                  machineOptions={machineOptions}
                  showZone={showZone}
                  onPlantChange={handlePlantChange}
                  onAreaChange={handleAreaChange}
                  onUnitChange={handleUnitChange}
                  onLineChange={handleLineChange}
                  onZoneChange={handleZoneChange}
                  systemLockedFields={systemLockedFields}
                />
              </Box>

              <Box sx={{mt: 1.7, pt: 1.4, borderTop: `1px solid ${tokenNeutral.main}`}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8}}>
                  <Switch
                    checked={draft.supportNeeded}
                    onChange={(event) => setDraft((currentDraft) => ({
                      ...currentDraft,
                      supportNeeded: event.target.checked,
                      supportOwner: event.target.checked ? currentDraft.supportOwner : '',
                    }))}
                  />
                  <Typography sx={{fontSize: 13, color: workstationVisuals.tierTextHeading, fontWeight: 700}}>
                    Support needed
                  </Typography>
                  <InfoIcon sx={{fontSize: 18, color: workstationVisuals.textSecondary}} />
                </Box>

                {draft.supportNeeded ? (
                  <Box sx={{mt: 1}}>
                    <SuggestionField
                      icon={<AssignedToIcon sx={{fontSize: 18}} />}
                      label="Support owner"
                      placeholder="Select support owner"
                      renderControl={() => (
                        <PersonSuggestionField
                          value={draft.supportOwner}
                          onChange={(value) => setDraft((currentDraft) => ({...currentDraft, supportOwner: value}))}
                          placeholder="Select support owner"
                        />
                      )}
                      fullWidth
                    />
                  </Box>
                ) : null}
              </Box>

              <Box sx={{mt: 1.25}}>
                <Typography sx={{fontSize: 13, fontWeight: 900, color: tokenBrand.main, mb: 0.8}}>
                  Attachment optional
                </Typography>
                <Paper
                  elevation={0}
                  onClick={() => attachmentInputRef.current?.click()}
                  sx={{
                    p: 2.2,
                    borderRadius: 1.6,
                    border: `1px dashed ${tokenNeutral.dark}`,
                    bgcolor: tokenNeutral.lightest,
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <CloudUploadIcon sx={{fontSize: 31, color: workstationVisuals.textMuted, mb: 0.65}} />
                  <Typography sx={{fontSize: 13, color: workstationVisuals.tierTextHeading, fontWeight: 800}}>
                    {isReadingAttachments ? 'Uploading attachments...' : 'Click to upload attachments'}
                  </Typography>
                  <Typography sx={{fontSize: 11.5, color: workstationVisuals.textSecondary, mt: 0.2}}>
                    Optional for now. PDF, DOC, JPG, PNG (max 10MB each)
                  </Typography>
                </Paper>
                <input
                  ref={attachmentInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.txt,.csv"
                  onChange={(event) => {
                    void handleAttachmentSelect(event.target.files);
                  }}
                  style={{display: 'none'}}
                />
                {draft.attachments.length ? (
                  <Box sx={{display: 'grid', gap: 0.75, mt: 0.9}}>
                    {draft.attachments.map((attachment) => {
                      const kind = getAttachmentVisualKind(attachment);
                      const icon = kind === 'image'
                        ? <ImageIcon sx={{fontSize: 18}} />
                        : kind === 'pdf'
                          ? <PdfIcon sx={{fontSize: 18}} />
                          : <FileIcon sx={{fontSize: 18}} />;
                      return (
                        <Paper
                          key={attachment.id}
                          elevation={0}
                          sx={{
                            p: 0.95,
                            borderRadius: 1.35,
                            border: `1px solid ${tokenNeutral.main}`,
                            bgcolor: tokenCommon.white,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                          }}
                        >
                          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.85, minWidth: 0}}>
                            <Box sx={{width: 30, height: 30, borderRadius: 1.1, bgcolor: tokenNeutral.lighter, color: tokenBrand.main, display: 'grid', placeItems: 'center', flexShrink: 0}}>
                              {icon}
                            </Box>
                            <Box sx={{minWidth: 0}}>
                              <Typography sx={{fontSize: 12.5, color: workstationVisuals.textPrimary, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                {attachment.name}
                              </Typography>
                              <Typography sx={{fontSize: 11, color: workstationVisuals.textSecondary}}>
                                {formatAttachmentSize(attachment.size)}
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleRemoveAttachment(attachment.id);
                            }}
                            sx={{color: tokenError.main, flexShrink: 0}}
                          >
                            <DeleteOutlineIcon sx={{fontSize: 17}} />
                          </IconButton>
                        </Paper>
                      );
                    })}
                  </Box>
                ) : null}
              </Box>
            </>
          ) : null}
        </Box>

        <Box sx={{px: 1.7, py: 1.45, borderTop: `1px solid ${tokenNeutral.main}`, display: 'flex', justifyContent: 'flex-end', gap: 1.1}}>
          <Button onClick={onClose} sx={{fontWeight: 900, color: tokenBrand.main, textTransform: 'none'}}>
            Cancel
          </Button>
          {shouldShowActionDetails ? (
            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={!canCreate}
              sx={{
                minWidth: 126,
                height: 40,
                borderRadius: 1.4,
                fontWeight: 900,
                textTransform: 'none',
                boxShadow: 'none',
              }}
            >
              Send
            </Button>
          ) : null}
        </Box>
      </Box>
    </Drawer>
  );
}
