import { Box, Button, Checkbox, FormControlLabel, IconButton, Paper, Radio, RadioGroup, TextField, Typography, Modal, Backdrop, Tooltip } from '@mui/material';
import {
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  DeleteOutline as DeleteIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  MicNone as MicIcon,
  CloudUploadOutlined as UploadIcon,
  AutoAwesome as AutoAwesomeIcon,
  HighlightOff as HighlightOffIcon,
  CheckCircle as CheckCircleIcon,
  ZoomIn as ZoomInIcon,
  InfoOutlined as InfoIcon,
  GridOn as GridOnIcon,
  VisibilityOutlined as VisibilityIcon,
  BlockOutlined as BlockIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';
import { ReactNode, useEffect, useState } from 'react';
import EquipmentSelector, { EquipmentSelection } from '../Maintenance/components/EquipmentSelector';
import { InventoryPartDrawer, findInventoryPartByCode, type InventoryPart } from '../Maintenance/components/InventoryPartDrawer';

type ShiftEntryMaintenanceProps = {
  prefill?: ShiftEntryMaintenancePrefill | null;
  onClose: () => void;
};

type MaintenanceType = 'issue' | 'breakdown';
type YesNo = 'yes' | 'no';
type ResolvedDetailsSection = 'attachments' | 'spareParts';

export type ShiftEntryMaintenancePrefill = {
  aiSuggestionText?: string;
  activityType?: string;
  equipment?: string;
  equipmentId?: string;
  equipmentPath?: string;
  equipmentTags?: string[];
  liveFill?: boolean;
  maintenanceType?: MaintenanceType;
  priority?: string;
  riskAssessment?: Partial<Record<'downtime' | 'quality' | 'ehs', string>>;
  suggestedActivityType?: string;
  suggestedPriority?: string;
  suggestedRiskAssessment?: Partial<Record<'downtime' | 'quality' | 'ehs', string>>;
  whatHappened?: string;
};

const activityTypeOptions = [
  'Mechanical',
  'Electrical',
  'Automation / Controls',
  'Utilities',
  'Facilities',
  'Safety / EHS',
  'Other',
];

const priorityOptions = [
  '0 - Emergency Breakdown',
  '1 - Immediate (24 hours)',
  '2 - High (3 days)',
  '3 - Medium (7 days)',
  '4 - Low (30 days)',
  '5 - Very Low (90 days)',
];

const riskAssessmentOptions = ['High', 'Medium', 'Low'];
const defaultAiSuggestionText = "We identified suggestions based on the equipment's history and your description of the problem. Would you like to apply them?";
const moldingIssueTypeOptions = [
  'Short shot',
  'Flash',
  'Sink mark',
  'Burn mark',
  'Warping',
  'Contamination',
  'Dimensional issue',
  'Other',
];
const moldingRejectionReasonOptions = [
  'Visual defect',
  'Dimensional nonconformance',
  'Functional failure',
  'Cosmetic damage',
  'Material contamination',
  'Cavity-specific defect',
  'Other',
];

const cavityStations = Array.from({ length: 16 }, (_, index) => index + 1);
const cavityPositions = Array.from({ length: 6 }, (_, index) => index + 1);
const totalCavityCount = cavityStations.length * cavityPositions.length;
type CavityStatus = 'OK' | 'NG' | 'Blocked' | 'Watch';
type CavityDetail = {
  status: CavityStatus;
  measurement: string;
  comment: string;
  issueDefectObserved: string;
  toolRoom: string;
  toolroomSampleInBag: boolean;
  dateTime: string;
};

const cavityStatusHelp: Partial<Record<CavityStatus, string>> = {
  Blocked: 'Intentionally deactivated (plugged cavity)',
  Watch: 'Running but flagged for close monitoring',
};

const cavityStatusColors: Record<CavityStatus, { bg: string; border: string; text: string; solid: string }> = {
  OK: { bg: '#DCFCE7', border: '#86EFAC', text: '#15803D', solid: '#22C55E' },
  NG: { bg: '#FEE2E2', border: '#FCA5A5', text: '#DC2626', solid: '#EF4444' },
  Blocked: { bg: '#F1F5F9', border: '#CBD5E1', text: '#64748B', solid: '#94A3B8' },
  Watch: { bg: '#FEF9C3', border: '#FACC15', text: '#A16207', solid: '#EAB308' },
};

function getCurrentDateTimeLocalValue() {
  const now = new Date();
  const timezoneOffsetMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
}

function getDefaultCavityDetail(existing?: Partial<CavityDetail>): CavityDetail {
  return {
    status: 'OK',
    measurement: '',
    comment: '',
    issueDefectObserved: '',
    toolRoom: '',
    toolroomSampleInBag: false,
    dateTime: getCurrentDateTimeLocalValue(),
    ...existing,
  };
}

const issueRcaOptions = [
  'Unsafe Conditions',
  'Minor Flaws',
  'Lack of Base',
  'Hard to Reach Areas Conditions',
  'Sources of Contamination',
  'Quality Defects',
  'Unnecessary Equipment',
  'Other',
];

function getTodayDateValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isMoldEquipmentSelection(selection: EquipmentSelection | null) {
  if (!selection || selection.type !== 'equipment') return false;

  const normalizedId = selection.id.trim().toLowerCase();
  const normalizedName = selection.name.trim().toLowerCase();
  const normalizedText = [selection.id, selection.name, selection.path, ...selection.tags].join(' ').toLowerCase();

  return /^m-\d+$/.test(normalizedId) ||
    normalizedName.startsWith('mold ') ||
    normalizedText.includes('molding') ||
    normalizedText.includes('mold') ||
    normalizedText.includes('cavity');
}

export default function ShiftEntryMaintenance({ prefill, onClose }: ShiftEntryMaintenanceProps) {
  const [maintenanceType, setMaintenanceType] = useState<MaintenanceType>('issue');
  const [resolved, setResolved] = useState<YesNo>('no');
  const [canFixItYourself, setCanFixItYourself] = useState<YesNo>('no');
  const [equipment, setEquipment] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentSelection | null>(null);
  const [whatHappened, setWhatHappened] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [resolvedDate, setResolvedDate] = useState(getTodayDateValue());
  const [recordingField, setRecordingField] = useState<'whatHappened' | 'actionTaken' | null>(null);
  const [rca, setRca] = useState('');
  const [failureMode, setFailureMode] = useState('');
  const [affectedCavityNumber, setAffectedCavityNumber] = useState('');

  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  const [aiSuggestionText, setAiSuggestionText] = useState(defaultAiSuggestionText);
  const [isAiSuggestionTyping, setIsAiSuggestionTyping] = useState(false);
  const [activityType, setActivityType] = useState('');
  const [riskAssessment, setRiskAssessment] = useState({ downtime: '', quality: '', ehs: '' });
  const [priority, setPriority] = useState('');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [resolvedSectionsExpanded, setResolvedSectionsExpanded] = useState<Record<ResolvedDetailsSection, boolean>>({
    attachments: true,
    spareParts: false,
  });
  const [sparePartsSearch, setSparePartsSearch] = useState('');
  const [selectedInventoryPart, setSelectedInventoryPart] = useState<InventoryPart | null>(null);
  const [requestedInventoryPurchasePartIds, setRequestedInventoryPurchasePartIds] = useState<string[]>([]);
  const [isZoomed, setIsZoomed] = useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const todayDateValue = getTodayDateValue();

  useEffect(() => {
    if (!prefill) return;

    setMaintenanceType(prefill.maintenanceType ?? 'issue');
    setResolved('no');
    setActivityType(prefill.activityType ?? '');
    setRiskAssessment(prefill.riskAssessment ? (current) => ({
      ...current,
      ...prefill.riskAssessment,
    }) : { downtime: '', quality: '', ehs: '' });
    setPriority(prefill.priority ?? '');
    setShowAiSuggestion(Boolean(prefill.whatHappened || prefill.aiSuggestionText));

    const nextEquipmentSelection: EquipmentSelection | null = prefill.equipment ? {
      id: prefill.equipmentId ?? prefill.equipment,
      name: prefill.equipment,
      type: 'equipment',
      path: prefill.equipmentPath ?? `Columbus West > Area A > Unit A > Line 10 > Zone 01 > ${prefill.equipment}`,
      tags: prefill.equipmentTags ?? ['Columbus West', 'Line 10', 'Zone 01'],
    } : null;

    if (!prefill.liveFill) {
      setEquipment(prefill.equipment ?? '');
      setSelectedEquipment(nextEquipmentSelection);
      setWhatHappened(prefill.whatHappened ?? '');
      return;
    }

    const timers: number[] = [];
    let descriptionInterval: number | null = null;
    setEquipment('');
    setSelectedEquipment(null);
    setWhatHappened('');

    timers.push(window.setTimeout(() => {
      setEquipment(prefill.equipment ?? '');
      setSelectedEquipment(nextEquipmentSelection);
    }, 280));

    if (prefill.whatHappened) {
      timers.push(window.setTimeout(() => {
        let nextText = '';
        let index = 0;
        descriptionInterval = window.setInterval(() => {
          if (index < prefill.whatHappened!.length) {
            nextText += prefill.whatHappened![index];
            setWhatHappened(nextText);
            index += 1;
            return;
          }

          if (descriptionInterval !== null) {
            window.clearInterval(descriptionInterval);
            descriptionInterval = null;
          }
        }, 34);
      }, 620));
    }

    return () => {
      timers.forEach((timerId) => window.clearTimeout(timerId));
      if (descriptionInterval !== null) window.clearInterval(descriptionInterval);
    };
  }, [prefill]);

  useEffect(() => {
    if (!prefill?.aiSuggestionText) {
      setAiSuggestionText(defaultAiSuggestionText);
      setIsAiSuggestionTyping(false);
      return;
    }

    let visibleText = '';
    let index = 0;
    let typingInterval: number | null = null;
    setAiSuggestionText('');
    setIsAiSuggestionTyping(true);

    const startTypingTimeout = window.setTimeout(() => {
      typingInterval = window.setInterval(() => {
      if (index < prefill.aiSuggestionText!.length) {
        visibleText += prefill.aiSuggestionText![index];
        setAiSuggestionText(visibleText);
        index += 1;
        return;
      }

      window.clearInterval(typingInterval);
      setIsAiSuggestionTyping(false);
      }, 48);
    }, 320);

    return () => {
      window.clearTimeout(startTypingTimeout);
      if (typingInterval !== null) window.clearInterval(typingInterval);
    };
  }, [prefill?.aiSuggestionText]);

  const handleEquipmentChange = (selection: EquipmentSelection) => {
    setSelectedEquipment(selection);
    setEquipment(selection.name);
    setShowAiSuggestion(false);
    if (isMoldEquipmentSelection(selection)) {
      setMaintenanceType('breakdown');
    }
  };

  const simulateAudioRecording = (field: 'whatHappened' | 'actionTaken') => {
    if (recordingField) return;
    setRecordingField(field);

    setTimeout(() => {
      setRecordingField(null);
      const text = field === 'whatHappened'
        ? 'A screw fell out, I need to replace it.'
        : 'Reinstalled the screw, tightened the guard, and verified the machine is running normally.';
      let current = '';
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          current += text[i];
          if (field === 'whatHappened') {
            setWhatHappened(current);
          } else {
            setActionTaken(current);
          }
          i++;
        } else {
          clearInterval(typingInterval);
          if (field === 'whatHappened' && resolved === 'no' && maintenanceType === 'issue') {
            setShowAiSuggestion(true);
          }
        }
      }, 40);
    }, 2000);
  };

  const applyAiSuggestions = () => {
    setActivityType((current) => current || prefill?.suggestedActivityType || prefill?.activityType || 'Mechanical');
    setRiskAssessment((current) => ({
      downtime: current.downtime || prefill?.suggestedRiskAssessment?.downtime || prefill?.riskAssessment?.downtime || 'High',
      quality: current.quality || prefill?.suggestedRiskAssessment?.quality || prefill?.riskAssessment?.quality || 'Low',
      ehs: current.ehs || prefill?.suggestedRiskAssessment?.ehs || prefill?.riskAssessment?.ehs || 'Low',
    }));
    setPriority((current) => current || prefill?.suggestedPriority || prefill?.priority || '3 - Medium (7 days)');
    setShowAiSuggestion(false);
  };

  const isMoldEquipment = isMoldEquipmentSelection(selectedEquipment);
  const showStandardMaintenanceFields = !isMoldEquipment;

  useEffect(() => {
    if (isMoldEquipment && maintenanceType !== 'breakdown') {
      setMaintenanceType('breakdown');
      setShowAiSuggestion(false);
    }
  }, [isMoldEquipment, maintenanceType]);

  const isIssueFormValid = resolved === 'yes'
    ? whatHappened !== '' && actionTaken !== '' && resolvedDate !== '' && rca !== ''
    : (whatHappened !== '' &&
      activityType !== '' &&
      priority !== '' &&
      riskAssessment.downtime !== '' &&
      riskAssessment.quality !== '' &&
      riskAssessment.ehs !== '');

  const isBreakdownFormValid = resolved === 'yes'
    ? actionTaken !== '' && resolvedDate !== '' && failureMode !== '' && rca !== ''
    : canFixItYourself === 'yes' || whatHappened !== '';

  const isFormValid = equipment !== '' && (isMoldEquipment || (maintenanceType === 'breakdown' ? isBreakdownFormValid : isIssueFormValid));
  const isStartExecution = maintenanceType === 'breakdown' && resolved === 'no' && canFixItYourself === 'yes';

  const spareParts = [
    { partNumber: 'SAP-SEAL-HYD-01', description: 'Hydraulic Cylinder Seal Kit', location: 'TC1-M3-G2', quantity: '3/10', status: 'ok' },
    { partNumber: 'SAP-ORING-VIT-02', description: '10-Ring Set (Viton)', location: 'TC1-M3-G2', quantity: '3/10', status: 'ok' },
    { partNumber: 'SAP-HYD-FLUID-01', description: '2Hydraulic Fluid (1L)', location: 'TC1-M3-G2', quantity: '0/10', status: 'warning' },
  ];

  const breakdownRcaOptions: Record<string, string[]> = {
    Deterioration: [
      'Inadequate Compliance with Basic Requirements',
      'Neglected Deterioration'
    ],
    'Uncontrolled Stress': [
      'Non-compliance with usage requirements',
      'Lack of skill'
    ],
    'Insufficient Strength': [
      'Inherent design weaknesses'
    ]
  };

  const [selectedSpareParts, setSelectedSpareParts] = useState<Array<{ partNumber: string; description: string; quantity: number }>>([
    { partNumber: 'SAP-SEAL-HYD-01', description: 'Hydraulic Cylinder Seal Kit', quantity: 1 }
  ]);

  const filteredSpareParts = sparePartsSearch.trim()
    ? spareParts.filter((part) => `${part.partNumber} ${part.description}`.toLowerCase().includes(sparePartsSearch.toLowerCase()))
    : [];

  const addSparePart = (part: { partNumber: string; description: string }) => {
    setSelectedSpareParts((current) => {
      const existing = current.find((item) => item.partNumber === part.partNumber);
      if (existing) {
        return current.map((item) =>
          item.partNumber === part.partNumber
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...part, quantity: 1 }];
    });
  };

  const updateSparePartQuantity = (partNumber: string, delta: number) => {
    setSelectedSpareParts((current) =>
      current.flatMap((item) => {
        if (item.partNumber !== partNumber) return [item];
        const nextQuantity = item.quantity + delta;
        return nextQuantity > 0 ? [{ ...item, quantity: nextQuantity }] : [];
      })
    );
  };

  const removeSparePart = (partNumber: string) => {
    setSelectedSpareParts((current) => current.filter((item) => item.partNumber !== partNumber));
  };

  const openInventoryPartDrawer = (partNumber: string) => {
    const inventoryPart = findInventoryPartByCode(partNumber);
    if (inventoryPart) setSelectedInventoryPart(inventoryPart);
  };

  const requestInventoryPurchase = (partId: string) => {
    setRequestedInventoryPurchasePartIds((current) => (current.includes(partId) ? current : [...current, partId]));
  };

  const toggleResolvedSection = (section: ResolvedDetailsSection) => {
    setResolvedSectionsExpanded((current) => ({
      ...current,
      [section]: !current[section],
    }));
  };

  const renderAudioButton = (field: 'whatHappened' | 'actionTaken') => {
    const isFieldRecording = recordingField === field;

    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
        <Button
          variant="outlined"
          onClick={() => simulateAudioRecording(field)}
          startIcon={<MicIcon sx={{ fontSize: 18, color: isFieldRecording ? '#EF4444' : 'inherit' }} />}
          sx={{
            height: 32,
            borderRadius: 999,
            borderColor: isFieldRecording ? '#EF4444' : '#BFDBFE',
            color: isFieldRecording ? '#EF4444' : '#2563EB',
            fontSize: 10.5,
            fontWeight: 700,
            textTransform: 'uppercase',
            px: 2,
            bgcolor: isFieldRecording ? '#FEF2F2' : '#EFF6FF',
            '&:hover': { bgcolor: isFieldRecording ? '#FEE2E2' : '#DBEAFE' },
            transition: 'all 0.2s'
          }}
        >
          {isFieldRecording ? 'Recording...' : 'Audio Description'}
        </Button>
      </Box>
    );
  };

  const renderAttachmentUpload = (height = 350) => (
    <Paper
      elevation={0}
      onClick={() => uploadedFile ? setIsZoomed(true) : setUploadedFile('/images/equi_screw.png')}
      sx={{
        height,
        borderRadius: 2,
        bgcolor: '#F3F4F6',
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        border: '1px dashed #D1D5DB',
        mb: 3,
        cursor: 'pointer',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: uploadedFile ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' : 'none',
        '&:hover': { bgcolor: '#E5E7EB' }
      }}
    >
      {uploadedFile ? (
        <Box sx={{ width: '100%', height: '100%', position: 'relative', bgcolor: '#111827', '&:hover .zoom-overlay': { opacity: 1 } }}>
          <Box
            component="img"
            src={uploadedFile}
            alt="Attachment"
            sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          />

          <Box className="zoom-overlay" sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.2s',
            pointerEvents: 'none'
          }}>
            <ZoomInIcon sx={{ fontSize: 48, color: 'white' }} />
          </Box>

          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              bgcolor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(4px)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,0,0,0.6)' }
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      ) : (
        <Box>
          <UploadIcon sx={{ fontSize: 32, color: '#9CA3AF', mb: 0.5 }} />
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#2563EB' }}>Click to upload or drag and drop</Typography>
          <Typography sx={{ fontSize: 9.5, color: '#6B7280', mt: 0.5 }}>PDF, DOC, JPG, PNG (max 10MB each)</Typography>
        </Box>
      )}
    </Paper>
  );

  if (isSubmitted) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, px: 2, textAlign: 'center' }}>
        <Box sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: '#DCFCE7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3
        }}>
          <CheckCircleIcon sx={{ fontSize: 48, color: '#16A34A' }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', mb: 1 }}>Request Submitted</Typography>
        <Typography sx={{ color: '#4B5563', fontSize: 14, mb: 4, lineHeight: 1.5 }}>
          Your maintenance request for <strong>{equipment}</strong> has been successfully submitted and recorded in the logbook.
        </Typography>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            height: 44,
            borderRadius: 999,
            bgcolor: '#374151',
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: 700,
            px: 6,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#1F2937' }
          }}
        >
          CLOSE
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <InventoryPartDrawer
        part={selectedInventoryPart}
        open={Boolean(selectedInventoryPart)}
        onClose={() => setSelectedInventoryPart(null)}
        purchaseRequested={selectedInventoryPart ? requestedInventoryPurchasePartIds.includes(selectedInventoryPart.id) : false}
        onRequestPurchase={requestInventoryPurchase}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>What is happening? *</Typography>
        <Tooltip
          placement="right"
          arrow
          title={
            <Box sx={{ maxWidth: 320 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#FFFFFF', mb: 0.4 }}>
                Issue / Defect
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: '#E5E7EB', lineHeight: 1.45, mb: 1.1 }}>
                An abnormal condition, defect, or malfunction identified on equipment that does not stop the machine operation but may require repair, replacement, restoration, software update/modification, or calibration by the operator or maintenance crew to restore the normal condition/function.
              </Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#FFFFFF', mb: 0.4 }}>
                Breakdown
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: '#E5E7EB', lineHeight: 1.45 }}>
                A machine stoppage due to break or malfunction of a component that must be replaced, restored, updated/modified software, or calibrated by the operator or maintenance crew to restore the normal condition/function, regardless of the length of time.
              </Typography>
            </Box>
          }
          slotProps={{
            tooltip: {
              sx: {
                bgcolor: '#111827',
                borderRadius: 1.5,
                p: 1.4,
                boxShadow: '0 18px 40px rgba(17, 24, 39, 0.22)',
              },
            },
            arrow: { sx: { color: '#111827' } },
          }}
        >
          <InfoIcon sx={{ fontSize: 15, color: '#6B7280', cursor: 'help' }} />
        </Tooltip>
      </Box>
      <RadioGroup
        row
        value={maintenanceType}
        onChange={(e) => {
          const nextMaintenanceType = e.target.value as MaintenanceType;
          setMaintenanceType(isMoldEquipment ? 'breakdown' : nextMaintenanceType);
          setShowAiSuggestion(false);
        }}
        sx={{ mb: 1.5 }}
      >
        <FormControlLabel
          value="issue"
          disabled={isMoldEquipment}
          control={<Radio size="small" sx={{ color: '#9CA3AF', '&.Mui-checked': { color: '#2563EB' } }} />}
          label={<Typography sx={{ fontSize: 13.5, color: '#374151' }}>Issue/ Defect</Typography>}
        />
        <FormControlLabel
          value="breakdown"
          control={<Radio size="small" sx={{ color: '#9CA3AF', '&.Mui-checked': { color: '#2563EB' } }} />}
          label={<Typography sx={{ fontSize: 13.5, color: '#374151' }}>Breakdown</Typography>}
        />
      </RadioGroup>

      <EquipmentSelector value={selectedEquipment} onChange={handleEquipmentChange} />

      {isMoldEquipment && (
        <MoldingMaintenanceFields
          equipmentName={equipment}
          equipmentId={selectedEquipment?.id ?? equipment}
          affectedCavityNumber={affectedCavityNumber}
          onAffectedCavityNumberChange={setAffectedCavityNumber}
          renderAttachmentUpload={renderAttachmentUpload}
        />
      )}

      {showStandardMaintenanceFields && (
        <>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151', mb: 0.5, mt: 1.5 }}>Resolved? *</Typography>
          <RadioGroup
            row
            value={resolved}
            onChange={(e) => {
              setResolved(e.target.value as YesNo);
              setShowAiSuggestion(false);
            }}
            sx={{ mb: 2.5 }}
          >
            <FormControlLabel
              value="no"
              control={<Radio size="small" sx={{ color: '#9CA3AF', '&.Mui-checked': { color: '#2563EB' } }} />}
              label={<Typography sx={{ fontSize: 13.5, color: '#374151' }}>No</Typography>}
            />
            <FormControlLabel
              value="yes"
              control={<Radio size="small" sx={{ color: '#9CA3AF', '&.Mui-checked': { color: '#2563EB' } }} />}
              label={<Typography sx={{ fontSize: 13.5, color: '#374151' }}>Yes</Typography>}
            />
          </RadioGroup>
        </>
      )}

      {showStandardMaintenanceFields && maintenanceType === 'issue' && resolved === 'no' && (
        <Box sx={{ mt: 1 }}>
          <FieldShell label="What happened? *">
            <Box sx={{ p: 0.5 }}>
              <TextField
                multiline
                rows={3}
                fullWidth
                variant="standard"
                value={whatHappened}
                onChange={(e) => setWhatHappened(e.target.value)}
                InputProps={{ disableUnderline: true }}
                sx={{ px: 1, '& .MuiInputBase-root': { fontSize: 13 } }}
              />
            </Box>
          </FieldShell>

          {renderAudioButton('whatHappened')}

          {showAiSuggestion && (
            <BluAiSuggestionCard
              message={aiSuggestionText}
              typing={isAiSuggestionTyping}
              onAccept={applyAiSuggestions}
              onDismiss={() => {
                setIsAiSuggestionTyping(false);
                setShowAiSuggestion(false);
              }}
            />
          )}

          <FieldShell label="Activity Type *">
            <NativeDropdown
              value={activityType}
              placeholder="Select..."
              options={activityTypeOptions}
              onChange={setActivityType}
            />
          </FieldShell>

          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151', mb: 0.8, mt: 1.8 }}>Risk Assessment *</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 1.5 }}>
            <RiskAssessmentDropdown
              label="Downtime"
              value={riskAssessment.downtime}
              onChange={(value) => setRiskAssessment({ ...riskAssessment, downtime: value })}
            />
            <RiskAssessmentDropdown
              label="Quality"
              value={riskAssessment.quality}
              onChange={(value) => setRiskAssessment({ ...riskAssessment, quality: value })}
            />
            <RiskAssessmentDropdown
              label="EHS"
              value={riskAssessment.ehs}
              onChange={(value) => setRiskAssessment({ ...riskAssessment, ehs: value })}
            />
          </Box>

          <FieldShell label="Priority *">
            <NativeDropdown
              value={priority}
              placeholder="Select..."
              options={priorityOptions}
              onChange={setPriority}
            />
          </FieldShell>

          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151', mb: 0.8, mt: 1.8 }}>Attachments</Typography>
          <Paper
            elevation={0}
            onClick={() => uploadedFile ? setIsZoomed(true) : setUploadedFile('/images/equi_screw.png')}
            sx={{
              height: 350,
              borderRadius: 2,
              bgcolor: '#F3F4F6',
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center',
              border: '1px dashed #D1D5DB',
              mb: 3,
              cursor: 'pointer',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: uploadedFile ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' : 'none',
              '&:hover': { bgcolor: '#E5E7EB' }
            }}
          >
            {uploadedFile ? (
              <Box sx={{ width: '100%', height: '100%', position: 'relative', bgcolor: '#111827', '&:hover .zoom-overlay': { opacity: 1 } }}>
                <Box
                  component="img"
                  src={uploadedFile}
                  alt="Attachment"
                  sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />

                {/* Zoom Overlay */}
                <Box className="zoom-overlay" sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: 'rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  pointerEvents: 'none'
                }}>
                  <ZoomInIcon sx={{ fontSize: 48, color: 'white' }} />
                </Box>

                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(4px)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255,0,0,0.6)' }
                  }}
                >
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            ) : (
              <Box>
                <UploadIcon sx={{ fontSize: 32, color: '#9CA3AF', mb: 0.5 }} />
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#2563EB' }}>Click to upload or drag and drop</Typography>
                <Typography sx={{ fontSize: 9.5, color: '#6B7280', mt: 0.5 }}>PDF, DOC, JPG, PNG (max 10MB each)</Typography>
              </Box>
            )}
          </Paper>

          {/* Full Screen Zoom Modal */}
          <Modal
            open={isZoomed}
            onClose={() => setIsZoomed(false)}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500,
              sx: { bgcolor: 'rgba(0, 0, 0, 0.9)' }
            }}
          >
            <Box onClick={() => setIsZoomed(false)} sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'zoom-out',
              p: 2
            }}>
              <Box
                component="img"
                src={uploadedFile || ''}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: 2,
                  boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)'
                }}
              />
              <IconButton
                onClick={(e) => { e.stopPropagation(); setIsZoomed(false); }}
                sx={{ position: 'absolute', top: 20, right: 20, color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Modal>
        </Box>
      )}

      {showStandardMaintenanceFields && maintenanceType === 'issue' && resolved === 'yes' && (
        <Box sx={{ mt: 1 }}>
          <FieldShell label="What happened? *">
            <Box sx={{ p: 0.5 }}>
              <TextField
                multiline
                rows={3}
                fullWidth
                variant="standard"
                value={whatHappened}
                onChange={(e) => setWhatHappened(e.target.value)}
                InputProps={{ disableUnderline: true }}
                sx={{ px: 1, '& .MuiInputBase-root': { fontSize: 13 } }}
              />
            </Box>
          </FieldShell>

          {renderAudioButton('whatHappened')}

          <FieldShell label="Action Taken *">
            <Box sx={{ p: 0.5 }}>
              <TextField
                multiline
                rows={3}
                fullWidth
                variant="standard"
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                InputProps={{ disableUnderline: true }}
                sx={{ px: 1, '& .MuiInputBase-root': { fontSize: 13 } }}
              />
            </Box>
          </FieldShell>

          {renderAudioButton('actionTaken')}

          <FieldShell label="RCA *">
            <NativeDropdown
              value={rca}
              placeholder="Select..."
              options={issueRcaOptions}
              onChange={setRca}
            />
          </FieldShell>

          <FieldShell label="Resolved Date *">
            <Box sx={{ p: 0.5 }}>
              <TextField
                type="date"
                fullWidth
                variant="standard"
                value={resolvedDate}
                onChange={(e) => setResolvedDate(e.target.value)}
                inputProps={{ max: todayDateValue }}
                InputProps={{ disableUnderline: true }}
                sx={{
                  px: 1,
                  '& .MuiInputBase-root': { fontSize: 13 },
                  '& .MuiInputBase-input': { py: 0.9 },
                }}
              />
            </Box>
          </FieldShell>

          <Box sx={{ mt: 2, pt: 1.2, borderTop: '1px solid #E5E7EB' }}>
            <ResolvedDetailsCollapsibleSection
              title="Spare Parts"
              open={resolvedSectionsExpanded.spareParts}
              onToggle={() => toggleResolvedSection('spareParts')}
            >
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: 13, color: '#5F6368', mb: 0.6 }}>Search to add the item</Typography>
                <FieldShell label="Spare Parts">
                  <Box sx={{ position: 'relative' }}>
                    <TextField
                      fullWidth
                      variant="standard"
                      placeholder="Part Number or Description"
                      value={sparePartsSearch}
                      onChange={(e) => setSparePartsSearch(e.target.value)}
                      InputProps={{ disableUnderline: true }}
                      sx={{
                        px: 1.2,
                        height: 38,
                        display: 'flex',
                        justifyContent: 'center',
                        '& .MuiInputBase-root': { height: 38, pr: 4, fontSize: 16, color: '#111827' },
                        '& .MuiInputBase-input::placeholder': { color: '#8A8F98', opacity: 1 }
                      }}
                    />
                    <SearchIcon sx={{ position: 'absolute', right: 12, top: 8, fontSize: 22, color: '#0B63E5' }} />
                  </Box>
                </FieldShell>

                {sparePartsSearch.trim() && (
                  <Box sx={{ mt: 1.3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                      <Typography sx={{ fontSize: 12, color: '#6B7280' }}>{filteredSpareParts.length} Items</Typography>
                    </Box>

                    <Box sx={{ display: 'grid', gap: 0.7 }}>
                      {filteredSpareParts.map((part) => {
                        const selectedPart = selectedSpareParts.find((item) => item.partNumber === part.partNumber);
                        const displayQuantity = selectedPart?.quantity ?? 0;

                        return (
                          <Box
                            key={part.partNumber}
                            onClick={() => openInventoryPartDrawer(part.partNumber)}
                            sx={{
                              minHeight: 34,
                              borderRadius: 999,
                              bgcolor: '#EEF2F6',
                              border: '1px solid #D7DEE8',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.7,
                              px: 1,
                              color: '#111827'
                            }}
                          >
                            <Typography sx={{ fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap', flexShrink: 0 }}>
                              {part.partNumber}
                            </Typography>
                            <Typography sx={{ fontSize: 13, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                              {part.description}
                            </Typography>
                            {selectedPart ? (
                              <>
                                <IconButton
                                  size="small"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    removeSparePart(part.partNumber);
                                  }}
                                  sx={{ color: '#EF4444', p: 0.25, ml: 0.25 }}
                                >
                                  <DeleteIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    updateSparePartQuantity(part.partNumber, -1);
                                  }}
                                  sx={{ color: '#2563EB', p: 0.25 }}
                                >
                                  <RemoveIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                                <Typography sx={{ minWidth: 10, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#2563EB' }}>
                                  {displayQuantity}
                                </Typography>
                              </>
                            ) : null}
                            <IconButton
                                size="small"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  addSparePart(part);
                                }}
                                sx={{ color: '#2563EB', p: 0.25 }}
                              >
                              <AddIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </Box>
            </ResolvedDetailsCollapsibleSection>

            <ResolvedDetailsCollapsibleSection
              title="Attachments"
              open={resolvedSectionsExpanded.attachments}
              onToggle={() => toggleResolvedSection('attachments')}
            >
              {renderAttachmentUpload(112)}
            </ResolvedDetailsCollapsibleSection>
          </Box>

          <Modal
            open={isZoomed}
            onClose={() => setIsZoomed(false)}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500,
              sx: { bgcolor: 'rgba(0, 0, 0, 0.9)' }
            }}
          >
            <Box onClick={() => setIsZoomed(false)} sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'zoom-out',
              p: 2
            }}>
              <Box
                component="img"
                src={uploadedFile || ''}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: 2,
                  boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)'
                }}
              />
              <IconButton
                onClick={(e) => { e.stopPropagation(); setIsZoomed(false); }}
                sx={{ position: 'absolute', top: 20, right: 20, color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Modal>
        </Box>
      )}

      {showStandardMaintenanceFields && maintenanceType === 'breakdown' && (
        <Box sx={{ mt: 1 }}>
          {resolved === 'no' && (
            <>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151', mb: 0.5 }}>Can you fix it yourself? *</Typography>
              <RadioGroup
                row
                value={canFixItYourself}
                onChange={(e) => setCanFixItYourself(e.target.value as YesNo)}
                sx={{ mb: canFixItYourself === 'no' ? 2.5 : 0 }}
              >
                <FormControlLabel
                  value="no"
                  control={<Radio size="small" sx={{ color: '#9CA3AF', '&.Mui-checked': { color: '#2563EB' } }} />}
                  label={<Typography sx={{ fontSize: 13.5, color: '#374151' }}>No</Typography>}
                />
                <FormControlLabel
                  value="yes"
                  control={<Radio size="small" sx={{ color: '#9CA3AF', '&.Mui-checked': { color: '#2563EB' } }} />}
                  label={<Typography sx={{ fontSize: 13.5, color: '#374151' }}>Yes</Typography>}
                />
              </RadioGroup>

              {canFixItYourself === 'no' && (
                <>
                  <FieldShell label="What happened?">
                    <Box sx={{ p: 0.5 }}>
                      <TextField
                        multiline
                        rows={2}
                        fullWidth
                        variant="standard"
                        value={whatHappened}
                        onChange={(e) => setWhatHappened(e.target.value)}
                        InputProps={{ disableUnderline: true }}
                        sx={{ px: 1, '& .MuiInputBase-root': { fontSize: 13 } }}
                      />
                    </Box>
                  </FieldShell>

                  {renderAudioButton('whatHappened')}

                  <Box sx={{ borderTop: '1px solid #E5E7EB', mt: 1.5, pt: 1.5 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151', mb: 0.8 }}>Attachments</Typography>
                    {renderAttachmentUpload(88)}
                  </Box>

                  <Modal
                    open={isZoomed}
                    onClose={() => setIsZoomed(false)}
                    closeAfterTransition
                    BackdropComponent={Backdrop}
                    BackdropProps={{
                      timeout: 500,
                      sx: { bgcolor: 'rgba(0, 0, 0, 0.9)' }
                    }}
                  >
                    <Box onClick={() => setIsZoomed(false)} sx={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      width: '100vw',
                      height: '100vh',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'zoom-out',
                      p: 2
                    }}>
                      <Box
                        component="img"
                        src={uploadedFile || ''}
                        sx={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          borderRadius: 2,
                          boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)'
                        }}
                      />
                      <IconButton
                        onClick={(e) => { e.stopPropagation(); setIsZoomed(false); }}
                        sx={{ position: 'absolute', top: 20, right: 20, color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Modal>
            </>
          )}
            </>
          )}

          {resolved === 'yes' && (
            <>
              <FieldShell label="Action Taken *">
                <Box sx={{ p: 0.5 }}>
                  <TextField
                    multiline
                    rows={2}
                    fullWidth
                    variant="standard"
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value)}
                    InputProps={{ disableUnderline: true }}
                    sx={{ px: 1, '& .MuiInputBase-root': { fontSize: 13 } }}
                  />
                </Box>
              </FieldShell>

                  {renderAudioButton('actionTaken')}

                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151', mb: 0.6, mt: 1.4 }}>Failure Mode *</Typography>
                  <RadioGroup
                    value={failureMode}
                    onChange={(e) => {
                      setFailureMode(e.target.value);
                      setRca('');
                    }}
                    sx={{ mb: 2 }}
                  >
                    {['Deterioration', 'Uncontrolled Stress', 'Insufficient Strength'].map((mode) => (
                      <FormControlLabel
                        key={mode}
                        value={mode}
                        control={<Radio size="small" sx={{ color: '#9CA3AF', '&.Mui-checked': { color: '#2563EB' } }} />}
                        label={<Typography sx={{ fontSize: 13.5, color: '#374151' }}>{mode}</Typography>}
                        sx={{ height: 32, my: 0.2 }}
                      />
                    ))}
                  </RadioGroup>

                  {failureMode && (
                    <>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151', mb: 0.6, mt: 1.4 }}>RCA *</Typography>
                      <RadioGroup
                        value={rca}
                        onChange={(e) => setRca(e.target.value)}
                        sx={{ mb: 2 }}
                      >
                        {breakdownRcaOptions[failureMode].map((option) => (
                          <FormControlLabel
                            key={option}
                            value={option}
                            control={<Radio size="small" sx={{ color: '#9CA3AF', '&.Mui-checked': { color: '#2563EB' } }} />}
                            label={<Typography sx={{ fontSize: 13.5, color: '#374151' }}>{option}</Typography>}
                            sx={{ minHeight: 32, my: 0.2 }}
                          />
                        ))}
                      </RadioGroup>
                    </>
                  )}

                  <FieldShell label="Resolved Date *">
                    <Box sx={{ p: 0.5 }}>
                      <TextField
                        type="date"
                        fullWidth
                        variant="standard"
                        value={resolvedDate}
                        onChange={(e) => setResolvedDate(e.target.value)}
                        inputProps={{ max: todayDateValue }}
                        InputProps={{ disableUnderline: true }}
                        sx={{
                          px: 1,
                          '& .MuiInputBase-root': { fontSize: 13 },
                          '& .MuiInputBase-input': { py: 0.9 },
                        }}
                      />
                    </Box>
                  </FieldShell>

                  <Box sx={{ mt: 2, pt: 1.2, borderTop: '1px solid #E5E7EB' }}>
                    <ResolvedDetailsCollapsibleSection
                      title="Spare Parts"
                      open={resolvedSectionsExpanded.spareParts}
                      onToggle={() => toggleResolvedSection('spareParts')}
                    >
                      <Box sx={{ mb: 3 }}>
                        <Typography sx={{ fontSize: 13, color: '#374151', mb: 1.2 }}>Consumed any Spare Parts?</Typography>
                        <Typography sx={{ fontSize: 11.5, color: '#6B7280', mb: 0.3 }}>Search to add the item</Typography>
                        <FieldShell label="Spare Parts">
                          <Box sx={{ position: 'relative' }}>
                            <TextField
                              fullWidth
                              variant="standard"
                              placeholder="Part Number or Description"
                              value={sparePartsSearch}
                              onChange={(e) => setSparePartsSearch(e.target.value)}
                              InputProps={{ disableUnderline: true }}
                              sx={{
                                px: 1.2,
                                height: 38,
                                display: 'flex',
                                justifyContent: 'center',
                                '& .MuiInputBase-root': { height: 38, pr: 4, fontSize: 13.5, color: '#111827' },
                                '& .MuiInputBase-input::placeholder': { color: '#8A8F98', opacity: 1 }
                              }}
                            />
                            <SearchIcon sx={{ position: 'absolute', right: 12, top: 8, fontSize: 22, color: '#0B63E5' }} />
                          </Box>
                        </FieldShell>

                        <Box sx={{ display: 'grid', gap: 0.7 }}>
                          {(sparePartsSearch.trim() ? filteredSpareParts : selectedSpareParts).map((part) => {
                            const selectedPart = selectedSpareParts.find((item) => item.partNumber === part.partNumber);
                            const displayQuantity = selectedPart?.quantity ?? 0;

                            return (
                              <Box
                                key={part.partNumber}
                                onClick={() => openInventoryPartDrawer(part.partNumber)}
                                sx={{
                                  minHeight: 34,
                                  borderRadius: 1.2,
                                  bgcolor: '#EEF2F6',
                                  border: '1px solid #D7DEE8',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.6,
                                  px: 0.8,
                                  color: '#111827'
                                }}
                              >
                                <Typography sx={{ fontSize: 10, color: '#6B7280', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                  {part.partNumber}
                                </Typography>
                                <Typography sx={{ fontSize: 13, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                                  {part.description}
                                </Typography>
                                {selectedPart ? (
                                  <>
                                    <IconButton
                                      size="small"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        removeSparePart(part.partNumber);
                                      }}
                                      sx={{ color: '#EF4444', p: 0.25 }}
                                    >
                                      <DeleteIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                    <Typography sx={{ minWidth: 10, textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#2563EB' }}>
                                      {displayQuantity}
                                    </Typography>
                                  </>
                                ) : null}
                                <IconButton
                                  size="small"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    addSparePart(part);
                                  }}
                                  sx={{ color: '#2563EB', p: 0.25 }}
                                >
                                  <AddIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    </ResolvedDetailsCollapsibleSection>

                    <ResolvedDetailsCollapsibleSection
                      title="Attachments"
                      open={resolvedSectionsExpanded.attachments}
                      onToggle={() => toggleResolvedSection('attachments')}
                    >
                      {renderAttachmentUpload(112)}
                    </ResolvedDetailsCollapsibleSection>
                  </Box>

                  <Modal
                    open={isZoomed}
                    onClose={() => setIsZoomed(false)}
                    closeAfterTransition
                    BackdropComponent={Backdrop}
                    BackdropProps={{
                      timeout: 500,
                      sx: { bgcolor: 'rgba(0, 0, 0, 0.9)' }
                    }}
                  >
                    <Box onClick={() => setIsZoomed(false)} sx={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      width: '100vw',
                      height: '100vh',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'zoom-out',
                      p: 2
                    }}>
                      <Box
                        component="img"
                        src={uploadedFile || ''}
                        sx={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          borderRadius: 2,
                          boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)'
                        }}
                      />
                      <IconButton
                        onClick={(e) => { e.stopPropagation(); setIsZoomed(false); }}
                        sx={{ position: 'absolute', top: 20, right: 20, color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  </Modal>
                </>
              )}
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 2, pt: 1.5, borderTop: '1px solid #E5E7EB' }}>
        <Button onClick={onClose} sx={{ color: '#2563EB', fontSize: 13, fontWeight: 700, textTransform: 'uppercase' }}>CANCEL</Button>
        <Button
          variant="contained"
          disabled={!isFormValid}
          onClick={() => setIsSubmitted(true)}
          sx={{
            height: 40,
            borderRadius: 999,
            bgcolor: isFormValid ? (maintenanceType === 'breakdown' ? '#2563EB' : '#374151') : '#D1D5DB',
            color: isFormValid ? '#FFFFFF' : '#6B7280',
            fontSize: 13,
            fontWeight: 700,
            textTransform: 'uppercase',
            px: 4,
            boxShadow: 'none',
            '&.Mui-disabled': {
              bgcolor: '#D1D5DB',
              color: '#6B7280'
            },
            '&:hover': { bgcolor: isFormValid ? (maintenanceType === 'breakdown' ? '#1D4ED8' : '#1F2937') : '#D1D5DB' }
          }}
        >
          {isStartExecution ? 'START EXECUTION' : 'SUBMIT'}
        </Button>
      </Box>
    </Box>
  );
}

function MoldingMaintenanceFields({
  equipmentName,
  equipmentId,
  affectedCavityNumber,
  onAffectedCavityNumberChange,
  renderAttachmentUpload,
}: {
  equipmentName: string;
  equipmentId: string;
  affectedCavityNumber: string;
  onAffectedCavityNumberChange: (value: string) => void;
  renderAttachmentUpload: (height?: number) => ReactNode;
}) {
  const [isCavityCheckOpen, setIsCavityCheckOpen] = useState(false);
  const [activeCavityNumber, setActiveCavityNumber] = useState<number | null>(null);
  const [cavityDetails, setCavityDetails] = useState<Record<number, CavityDetail>>({});

  const inputSx = {
    px: 1.2,
    height: 38,
    display: 'flex',
    justifyContent: 'center',
    '& .MuiInputBase-root': { height: 38, fontSize: 13.5, color: '#111827' },
    '& .MuiInputBase-input::placeholder': { color: '#8A8F98', opacity: 1 },
  };

  const selectedCavities = affectedCavityNumber
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value >= 1 && value <= totalCavityCount);

  const handleToggleCavity = (cavityNumber: number) => {
    const nextSelection = selectedCavities.includes(cavityNumber)
      ? selectedCavities
      : [...selectedCavities, cavityNumber].sort((a, b) => a - b);

    onAffectedCavityNumberChange(nextSelection.join(', '));
    setActiveCavityNumber(cavityNumber);
    setCavityDetails((current) => ({
      ...current,
      [cavityNumber]: getDefaultCavityDetail(current[cavityNumber]),
    }));
  };

  const handleClearCavities = () => {
    onAffectedCavityNumberChange('');
    setActiveCavityNumber(null);
  };

  const handleUpdateCavityDetail = (cavityNumber: number, updates: Partial<CavityDetail>) => {
    setCavityDetails((current) => ({
      ...current,
      [cavityNumber]: getDefaultCavityDetail({
        ...current[cavityNumber],
        ...(updates.status && updates.status !== 'OK' && !current[cavityNumber]?.dateTime
          ? { dateTime: getCurrentDateTimeLocalValue() }
          : {}),
        ...updates,
      }),
    }));
  };

  return (
    <Box sx={{ mt: 1.4, mb: 2, p: 1.2, border: '1px solid #DBEAFE', borderRadius: 1.5, bgcolor: '#F8FAFC' }}>
      <Typography sx={{ fontSize: 13, fontWeight: 900, color: '#1D4ED8', mb: 1 }}>
        Mold Details
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '0.7fr 1.3fr' }, gap: 1 }}>
        <FieldShell label="Mold ID">
          <TextField
            fullWidth
            variant="standard"
            value={equipmentId}
            InputProps={{ disableUnderline: true, readOnly: true }}
            sx={inputSx}
          />
        </FieldShell>

        <FieldShell label="Affected Cavity number">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) auto' }, alignItems: 'center', gap: 0.7, p: 0.3 }}>
            <TextField
              fullWidth
              variant="standard"
              placeholder="e.g. 2, 4, 8"
              value={affectedCavityNumber}
              onChange={(event) => onAffectedCavityNumberChange(event.target.value)}
              InputProps={{ disableUnderline: true }}
              sx={{ ...inputSx, px: 0.9 }}
            />
            <Button
              variant="outlined"
              onClick={() => setIsCavityCheckOpen(true)}
              startIcon={<GridOnIcon sx={{ fontSize: 15 }} />}
              sx={{
                height: 30,
                minWidth: 116,
                borderRadius: 1,
                borderColor: '#86EFAC',
                bgcolor: '#F0FDF4',
                color: '#15803D',
                fontSize: 11,
                fontWeight: 800,
                textTransform: 'none',
                px: 1.2,
                '&:hover': { borderColor: '#4ADE80', bgcolor: '#DCFCE7' },
              }}
            >
              Cavity Check
            </Button>
          </Box>
        </FieldShell>
      </Box>

      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151', mb: 0.8, mt: 1.5 }}>Attachments</Typography>
      {renderAttachmentUpload(104)}

      <CavityCheckModal
        open={isCavityCheckOpen}
        selectedCavities={selectedCavities}
        activeCavityNumber={activeCavityNumber}
        cavityDetails={cavityDetails}
        equipmentId={equipmentId}
        equipmentName={equipmentName}
        onClose={() => setIsCavityCheckOpen(false)}
        onClear={handleClearCavities}
        onToggleCavity={handleToggleCavity}
        onUpdateCavityDetail={handleUpdateCavityDetail}
      />
    </Box>
  );
}

function CavityCheckModal({
  open,
  selectedCavities,
  activeCavityNumber,
  cavityDetails,
  equipmentId,
  equipmentName,
  onClose,
  onClear,
  onToggleCavity,
  onUpdateCavityDetail,
}: {
  open: boolean;
  selectedCavities: number[];
  activeCavityNumber: number | null;
  cavityDetails: Record<number, CavityDetail>;
  equipmentId: string;
  equipmentName: string;
  onClose: () => void;
  onClear: () => void;
  onToggleCavity: (cavityNumber: number) => void;
  onUpdateCavityDetail: (cavityNumber: number, updates: Partial<CavityDetail>) => void;
}) {
  const statusCounts = cavityStations.reduce<Record<CavityStatus, number>>(
    (counts, station) => {
      cavityPositions.forEach((position) => {
        const cavityNumber = (station - 1) * cavityPositions.length + position;
        const status = cavityDetails[cavityNumber]?.status ?? 'OK';
        counts[status] += 1;
      });
      return counts;
    },
    { OK: 0, NG: 0, Blocked: 0, Watch: 0 }
  );

  return (
    <Modal open={open} onClose={onClose} sx={{ zIndex: (theme) => theme.zIndex.modal + 210 }}>
      <Box
        sx={{
          position: 'fixed',
          inset: { xs: 8, sm: 18 },
          bgcolor: '#FFFFFF',
          borderRadius: 2,
          boxShadow: '0 28px 80px rgba(15, 23, 42, 0.24)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          outline: 'none',
        }}
      >
        <Box sx={{ height: 44, px: 2, display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#F0FDF4', borderBottom: '1px solid #DCFCE7' }}>
          <GridOnIcon sx={{ fontSize: 17, color: '#16A34A' }} />
          <Typography sx={{ fontSize: 13, fontWeight: 900, color: '#111827', flex: 1 }}>Cavity Check</Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: '#64748B' }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Box sx={{ px: { xs: 1.4, sm: 2.4 }, py: 1.5, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr 1fr 1fr' }, gap: 1.2, bgcolor: '#FBFCFE' }}>
          <CavityMeta label="Equipment" value={equipmentName || '-'} />
          <CavityMeta label="Machine #" value={equipmentId || '-'} required />
          <CavityMeta label="Reference #" value="-" />
          <CavityMeta label="Updated By" value="Delila Bran" />
        </Box>

        <Box sx={{ px: { xs: 1.4, sm: 2.4 }, py: 1.2, display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) auto' }, alignItems: 'center', gap: 1, borderBottom: '1px solid #E5E7EB' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: 11, color: '#475569', fontWeight: 700 }}>
              Legend:
            </Typography>
            <Typography sx={{ fontSize: 11, color: '#475569' }}>
              Pxx = Position Number
            </Typography>
            <Typography sx={{ fontSize: 11, color: '#475569' }}>
              [ ] = Current Cavity Number
            </Typography>
            <CavityStatusSummary counts={statusCounts} compact />
          </Box>
          <Button
            size="small"
            variant="outlined"
            disabled={selectedCavities.length === 0}
            onClick={onClear}
            sx={{
              height: 28,
              borderRadius: 1,
              borderColor: '#CBD5E1',
              color: '#334155',
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'none',
              '&.Mui-disabled': { color: '#94A3B8', borderColor: '#E2E8F0' },
            }}
          >
            Clear Selection
          </Button>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: { xs: 1.4, sm: 2 }, display: 'grid', gap: 1.4 }}>
          <Box
            sx={{
              border: '1px solid #E5E7EB',
              borderRadius: 1.2,
              bgcolor: '#F8FAFC',
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(216px, 1fr))', lg: 'repeat(4, minmax(216px, 1fr))' },
              gap: { xs: 1, md: 1.2 },
              p: { xs: 1, sm: 1.2 },
              alignItems: 'stretch',
              overflow: 'hidden',
            }}
          >
            {cavityStations.map((station) => (
              <CavityCluster
                key={station}
                station={station}
                selectedCavities={selectedCavities}
                activeCavityNumber={activeCavityNumber}
                cavityDetails={cavityDetails}
                onToggleCavity={onToggleCavity}
              />
            ))}
          </Box>
          {activeCavityNumber ? (
            <CavityDetailPanel
              cavityNumber={activeCavityNumber}
              detail={getDefaultCavityDetail(cavityDetails[activeCavityNumber])}
              onUpdate={(updates) => onUpdateCavityDetail(activeCavityNumber, updates)}
            />
          ) : null}
        </Box>

        <Box sx={{ px: 2.4, py: 1.4, display: 'flex', justifyContent: 'flex-end', gap: 1, borderTop: '1px solid #E5E7EB', bgcolor: '#FFFFFF' }}>
          <Button onClick={onClose} sx={{ color: '#2563EB', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>
            Done
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

function CavityMeta({ label, value, required = false }: { label: string; value: string; required?: boolean }) {
  return (
    <Box sx={{ minHeight: 44, borderRadius: 1, bgcolor: '#F8FAFC', px: 1.2, py: 0.8 }}>
      <Typography sx={{ fontSize: 10, fontWeight: 800, color: '#334155', mb: 0.4 }}>
        {label} {required && <Box component="span" sx={{ color: '#DC2626' }}>*</Box>}
      </Typography>
      <Typography sx={{ fontSize: 12, color: value === '-' ? '#94A3B8' : '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {value}
      </Typography>
    </Box>
  );
}

function CavityCluster({
  station,
  selectedCavities,
  activeCavityNumber,
  cavityDetails,
  onToggleCavity,
}: {
  station: number;
  selectedCavities: number[];
  activeCavityNumber: number | null;
  cavityDetails: Record<number, CavityDetail>;
  onToggleCavity: (cavityNumber: number) => void;
}) {
  const positionAreas: Record<number, string> = {
    1: 'top',
    2: 'upperRight',
    3: 'lowerRight',
    4: 'bottom',
    5: 'lowerLeft',
    6: 'upperLeft',
  };

  return (
    <Box
      sx={{
        border: '1px solid #DDE5EF',
        borderRadius: 1.2,
        bgcolor: '#FFFFFF',
        p: 0.55,
        display: 'grid',
        placeItems: 'center',
        minHeight: 142,
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '44px 52px 44px',
          gridTemplateRows: '40px 42px 40px',
          gridTemplateAreas: `
            ". top ."
            "upperLeft center upperRight"
            "lowerLeft bottom lowerRight"
          `,
          gap: 0.7,
          alignItems: 'center',
          justifyItems: 'center',
        }}
      >
        {cavityPositions.map((position) => {
          const cavityNumber = (station - 1) * cavityPositions.length + position;
          const isSelected = selectedCavities.includes(cavityNumber);
          const isActive = activeCavityNumber === cavityNumber;
          const status = cavityDetails[cavityNumber]?.status ?? 'OK';
          const statusColor = cavityStatusColors[status];
          const tooltipTitle = cavityStatusHelp[status] ?? `${status} cavity`;

          return (
            <Tooltip key={`${station}-${position}`} title={tooltipTitle} arrow>
              <Button
                onClick={() => onToggleCavity(cavityNumber)}
                aria-label={`Position P${cavityNumber}, current cavity ${cavityNumber}, status ${status}`}
                aria-pressed={isSelected}
                sx={{
                  minWidth: 0,
                  width: 44,
                  height: 40,
                  gridArea: positionAreas[position],
                  borderRadius: '50%',
                  bgcolor: isActive ? statusColor.solid : statusColor.bg,
                  border: `2px solid ${isActive ? '#1D4ED8' : isSelected ? statusColor.solid : statusColor.border}`,
                  color: statusColor.text,
                  display: 'grid',
                  placeItems: 'center',
                  textAlign: 'center',
                  lineHeight: 1,
                  fontSize: 9.5,
                  fontWeight: 900,
                  p: 0,
                  boxShadow: isActive ? '0 0 0 3px rgba(37, 99, 235, 0.2)' : 'none',
                  textTransform: 'none',
                  outline: 'none',
                  '&:hover': { bgcolor: isActive ? statusColor.solid : statusColor.bg, borderColor: '#1D4ED8' },
                  '&:focus-visible': { boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.28)', borderColor: '#1D4ED8' },
                  '& .MuiTouchRipple-root': { borderRadius: '50%' },
                }}
              >
                <Box sx={{ color: isActive ? '#FFFFFF' : statusColor.text }}>
                  <Box>P{cavityNumber}</Box>
                  <Box>[{cavityNumber}]</Box>
                </Box>
              </Button>
            </Tooltip>
          );
        })}
        <Box
          sx={{
            gridArea: 'center',
            width: 50,
            height: 50,
            borderRadius: 1.1,
            bgcolor: '#F1F5F9',
            border: '1px solid #CBD5E1',
            color: '#0F172A',
            fontSize: 18,
            fontWeight: 950,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {station}
        </Box>
      </Box>
    </Box>
  );
}

function CavityDetailPanel({
  cavityNumber,
  detail,
  onUpdate,
}: {
  cavityNumber: number;
  detail: CavityDetail;
  onUpdate: (updates: Partial<CavityDetail>) => void;
}) {
  const statusOptions: Array<{ status: CavityStatus; icon: ReactNode }> = [
    { status: 'OK', icon: <CheckIcon sx={{ fontSize: 15 }} /> },
    { status: 'NG', icon: <CloseIcon sx={{ fontSize: 15 }} /> },
    { status: 'Blocked', icon: <BlockIcon sx={{ fontSize: 15 }} /> },
    { status: 'Watch', icon: <VisibilityIcon sx={{ fontSize: 15 }} /> },
  ];
  const requiresIssueDetails = detail.status !== 'OK';

  return (
    <Box sx={{ border: '1px solid #B7C8FF', borderRadius: 1.4, bgcolor: '#F8FAFF', p: { xs: 1.2, sm: 1.5 }, display: 'grid', gap: 1.25 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 950, color: '#111827', lineHeight: 1.15 }}>
            Cavity {cavityNumber} Detail
          </Typography>
          <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#64748B', mt: 0.25 }}>
            Position P{cavityNumber}
          </Typography>
        </Box>
        {requiresIssueDetails ? (
          <Typography sx={{ fontSize: 11.5, fontWeight: 850, color: '#B45309', bgcolor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 1, px: 1, py: 0.45 }}>
            Issue details recommended
          </Typography>
        ) : null}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(118px, 1fr))' }, gap: 0.8 }}>
        {statusOptions.map((option) => {
          const active = detail.status === option.status;
          const statusColor = cavityStatusColors[option.status];
          const tooltipTitle = cavityStatusHelp[option.status] ?? `${option.status} cavity`;
          return (
            <Tooltip key={option.status} title={tooltipTitle} arrow>
              <Button
                variant="outlined"
                onClick={() => onUpdate({
                  status: option.status,
                  ...(option.status !== 'OK' && !detail.dateTime ? { dateTime: getCurrentDateTimeLocalValue() } : {}),
                })}
                startIcon={option.icon}
                sx={{
                  height: 44,
                  borderRadius: 1.2,
                  borderWidth: active ? 2 : 1,
                  borderColor: active ? statusColor.solid : '#DDE3EC',
                  bgcolor: active ? statusColor.bg : '#FFFFFF',
                  color: statusColor.text,
                  fontSize: 13,
                  fontWeight: 900,
                  textTransform: 'none',
                  px: 1,
                  boxShadow: active ? `inset 0 0 0 1px ${statusColor.solid}` : 'none',
                  '& .MuiButton-startIcon': { mr: 0.5 },
                  '&:hover': { borderColor: statusColor.solid, bgcolor: statusColor.bg },
                  '&:focus-visible': { boxShadow: `0 0 0 4px rgba(37, 99, 235, 0.18), inset 0 0 0 1px ${statusColor.solid}` },
                }}
              >
                {option.status}
              </Button>
            </Tooltip>
          );
        })}
      </Box>
      <Box sx={{ display: 'grid', gap: 1, alignItems: 'start' }}>
        <Box>
          <Typography sx={{ fontSize: 11.5, fontWeight: 850, color: '#475569', mb: 0.45 }}>Issue/Defect Observed</Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Describe the issue or defect observed..."
            value={detail.issueDefectObserved}
            onChange={(event) => onUpdate({ issueDefectObserved: event.target.value })}
            error={requiresIssueDetails && !detail.issueDefectObserved.trim()}
            helperText={requiresIssueDetails && !detail.issueDefectObserved.trim() ? 'Recommended for NG, Blocked, or Watch.' : ' '}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 92,
                alignItems: 'flex-start',
                borderRadius: 1.2,
                bgcolor: '#FFFFFF',
                fontSize: 13,
              },
              '& .MuiOutlinedInput-input': { height: '100% !important', boxSizing: 'border-box' },
              '& .MuiFormHelperText-root': { mx: 0, fontSize: 10.5, fontWeight: 700 },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

function CavityStatusSummary({ counts, compact = false }: { counts: Record<CavityStatus, number>; compact?: boolean }) {
  const summaryItems: Array<{ label: CavityStatus; color: string; bg: string }> = [
    { label: 'OK', color: cavityStatusColors.OK.solid, bg: cavityStatusColors.OK.bg },
    { label: 'NG', color: cavityStatusColors.NG.solid, bg: cavityStatusColors.NG.bg },
    { label: 'Blocked', color: cavityStatusColors.Blocked.solid, bg: cavityStatusColors.Blocked.bg },
    { label: 'Watch', color: cavityStatusColors.Watch.solid, bg: cavityStatusColors.Watch.bg },
  ];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: compact ? 0.7 : 1.1, flexWrap: 'wrap', pt: 0.1 }}>
      {summaryItems.map((item) => (
        <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: compact ? 0.75 : 0, py: compact ? 0.35 : 0, borderRadius: 1, bgcolor: compact ? item.bg : 'transparent', border: compact ? `1px solid ${item.color}` : 'none' }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', border: `1px solid ${item.color}`, bgcolor: item.bg }} />
          <Typography sx={{ fontSize: 11.5, fontWeight: 850, color: compact ? '#334155' : '#6B7280' }}>
            {item.label}: {counts[item.label]}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function BluAiSuggestionCard({
  message,
  typing = false,
  onAccept,
  onDismiss,
}: {
  message: string;
  typing?: boolean;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  return (
    <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F3F4F6', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 2, mb: 2, animation: 'fadeIn 0.3s ease-in' }}>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <AutoAwesomeIcon sx={{ fontSize: 16, color: '#F97316' }} />
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#2563EB' }}>BLU.AI <Box component="span" sx={{ fontWeight: 400 }}>Assistant</Box></Typography>
        </Box>
        <Typography sx={{ fontSize: 12.5, color: '#374151', lineHeight: 1.4 }}>
          {message}
          {typing ? (
            <Box component="span" sx={{ display: 'inline-block', width: 5, height: 13, ml: 0.35, bgcolor: '#2563EB', verticalAlign: '-2px', animation: 'fadeIn 0.7s ease-in-out infinite alternate' }} />
          ) : null}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <IconButton onClick={onDismiss} sx={{ color: '#60A5FA', p: 0.5 }}>
          <HighlightOffIcon sx={{ fontSize: 32 }} />
        </IconButton>
        <IconButton onClick={onAccept} disabled={typing} sx={{ color: '#2563EB', p: 0.5, '&.Mui-disabled': { color: '#93C5FD' } }}>
          <CheckCircleIcon sx={{ fontSize: 32 }} />
        </IconButton>
      </Box>
    </Paper>
  );
}

function FieldShell({ children, label }: { children: ReactNode; label: string }) {
  return (
    <Box
      sx={{
        border: '1px solid #CBD5E1',
        borderRadius: 1.5,
        mb: 1.15,
        mt: 1.2,
        position: 'relative',
        bgcolor: '#FFFFFF',
        transition: 'border-color 0.16s ease, box-shadow 0.16s ease',
        '&:hover': { borderColor: '#94A3B8' },
        '&:focus-within': {
          borderColor: '#2563EB',
          boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.12)',
        },
      }}
    >
      <Typography sx={{ position: 'absolute', top: -10, left: 12, zIndex: 2, px: 0.5, bgcolor: '#FFFFFF', fontSize: 10, color: '#64748B', lineHeight: 1.2 }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

function RiskAssessmentDropdown({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  if (value) {
    return (
      <Box
        sx={{
          position: 'relative',
          border: '1px solid #CBD5E1',
          borderRadius: 1.5,
          bgcolor: '#FFFFFF',
          transition: 'border-color 0.16s ease, box-shadow 0.16s ease',
          '&:hover': { borderColor: '#94A3B8' },
          '&:focus-within': {
            borderColor: '#2563EB',
            boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.12)',
          },
        }}
      >
        <Typography sx={{ position: 'absolute', top: -7, left: 10, zIndex: 2, px: 0.45, bgcolor: '#FFFFFF', fontSize: 9, color: '#64748B', lineHeight: 1 }}>
          {label}
        </Typography>
        <NativeDropdown
          compact
          borderless
          value={value}
          placeholder={label}
          options={riskAssessmentOptions}
          onChange={onChange}
        />
      </Box>
    );
  }

  return (
    <NativeDropdown
      compact
      value={value}
      placeholder={label}
      options={riskAssessmentOptions}
      onChange={onChange}
    />
  );
}

function ResolvedDetailsCollapsibleSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <Box sx={{ mb: 1.25 }}>
      <Paper
        elevation={0}
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onToggle();
          }
        }}
        sx={{
          p: 1.15,
          borderRadius: 1.5,
          border: '1px solid #D8E4F2',
          bgcolor: '#FFFFFF',
          cursor: 'pointer',
          outline: 'none',
          '&:focus-visible': { boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.18)' },
        }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 0.8, alignItems: 'center' }}>
          <Typography sx={{ color: '#334155', fontSize: 12.8, fontWeight: 950, lineHeight: 1.15 }}>
            {title}
          </Typography>
          <IconButton
            size="small"
            aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
            sx={{ color: '#2563EB', p: 0.4 }}
          >
            {open ? <KeyboardArrowUpIcon sx={{ fontSize: 20 }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 20 }} />}
          </IconButton>
        </Box>
      </Paper>
      {open ? (
        <Box
          sx={{
            mt: 0.75,
            p: 0.85,
            borderRadius: 1.5,
            border: '1px solid #DDE7F4',
            bgcolor: '#EEF4FB',
            display: 'grid',
            gap: 0.85,
          }}
        >
          {children}
        </Box>
      ) : null}
    </Box>
  );
}

function NativeDropdown({
  value,
  placeholder = 'Select...',
  options,
  onChange,
  compact = false,
  borderless = false,
}: {
  value: string;
  placeholder?: string;
  options: string[];
  onChange: (value: string) => void;
  compact?: boolean;
  borderless?: boolean;
}) {
  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Box
        component="select"
        value={value}
        onChange={(event) => onChange((event.target as HTMLSelectElement).value)}
        sx={{
          width: '100%',
          height: compact ? 34 : 40,
          display: 'block',
          border: borderless ? 0 : compact ? '1px solid #CBD5E1' : 0,
          borderRadius: compact ? 1.5 : 1.35,
          bgcolor: '#FFFFFF',
          color: value ? '#1F2A5A' : '#94A3B8',
          fontSize: compact ? 12 : 13.5,
          lineHeight: 1.25,
          pl: compact ? 1.1 : 1.25,
          pr: 4,
          py: 0,
          outline: 'none',
          cursor: 'pointer',
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          '&:focus': {
            borderColor: '#2563EB',
            boxShadow: compact && !borderless ? '0 0 0 2px rgba(37, 99, 235, 0.12)' : 'none',
          },
        }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </Box>
      <KeyboardArrowDownIcon
        sx={{
          position: 'absolute',
          right: compact ? 9 : 10,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: compact ? 18 : 20,
          color: '#94A3B8',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
}
