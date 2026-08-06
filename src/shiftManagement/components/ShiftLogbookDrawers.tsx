import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Paper,
  Button,
  Chip,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon,
  Add as AddIcon,
  InfoOutlined as InfoOutlinedIcon,
  Groups as GroupsIcon,
  AutoAwesome as SparkleIcon,
  Mic as MicIcon,
  Send as SendIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Check as CheckIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import AssistantBanner from '../../common/components/AssistantBanner';
import { useActionTrackerContext } from '../../actionTracker/contexts/ActionTrackerContext';
import {
  tokenBrand,
  tokenDivider,
  tokenText,
  workstationVisuals,
} from '../../workstation/theme';

import { useShiftManagementContext } from '../contexts/ShiftManagementContext';
import { SHIFT_LOGBOOK_SIDE_DRAWER_WIDTH } from './shiftLogbookLayout';

interface ShiftLogbookDrawersProps {
  activeTheme: any;
}

const ShiftLogbookDrawers: React.FC<ShiftLogbookDrawersProps> = ({
  activeTheme,
}) => {
  const {
    isShiftLogbookRcaDrawerOpen,
    closeShiftLogbookRcaFlow,
    shiftLogbookRcaNumber,
    shiftLogbookMaintenanceReviewDetails,
    shiftLogbookRcaMethod,
    openShiftLogbookFiveWhysDrawer,
    openShiftLogbookFishboneWorkspace,
    openShiftLogbookFaultTreeWorkspace,
    closeShiftLogbookFishboneWorkspace,
    closeShiftLogbookFaultTreeWorkspace,
    isShiftLogbookFiveWhysDrawerOpen,
    isShiftLogbookFishboneOpen,
    isShiftLogbookFaultTreeOpen,
    isShiftLogbookSourceDrawerOpen,
    returnToShiftLogbookRcaMethodDrawer,
    shiftLogbookFiveWhysProblem,
    shiftLogbookFiveWhysSteps,
    isShiftLogbookMaintenanceReviewOpen,
    closeShiftLogbookMaintenanceReview,
    isShiftLogbookCreateActionOpen,
    closeShiftLogbookCreateActionDrawer,
    openShiftLogbookCreateActionDrawer,
    isShiftLogbookActionRecording,
    setIsShiftLogbookActionRecording,
    openShiftLogbookRcaDrawer,
    shiftLogbookRcaSource,
    saveShiftLogbookRca,
  } = useShiftManagementContext().logbook;
  const { openIntegratedActionCreateDrawer } = useActionTrackerContext();

  const reviewDetails = shiftLogbookMaintenanceReviewDetails ?? {
    number: shiftLogbookRcaNumber ?? 'WO-2567952/53',
    workOrder: 'WO-2567952/53',
    oee: '91.6%',
    availability: '94.2%',
    performance: '93.1%',
    quality: '98.6%',
    location: 'Z2',
    equipment: 'Hydraulic Press #3',
    title: 'Extrusion machine',
    description: 'Something is causing excessive noise. Visual inspection indicates lack of lubrication.',
    reportedBy: "Ronie D'elano",
    date: '14/01/2025, 09:15',
  };
  const fiveWhysSteps = shiftLogbookFiveWhysSteps.length
    ? shiftLogbookFiveWhysSteps
    : [
      { label: '1. Why did the problem occur?', answer: 'Because the gasket is not sealing properly.' },
      { label: '2. Why? (2nd level)', answer: 'Because the gasket shows signs of uneven wear and deformation.' },
      { label: '3. Why? (3rd level)', answer: 'Because the gasket has been operating under inconsistent pressure conditions.' },
      { label: '4. Why? (4th level)', answer: 'Because the motor assembly is experiencing slight misalignment during operation.' },
      { label: '5. Why? (Root cause)', answer: 'Because alignment checks are not consistently performed during corrective maintenance.' },
    ];
  const stopAnalysisFieldInteraction = (event: React.SyntheticEvent<HTMLElement>) => {
    event.stopPropagation();
  };
  type FishboneCauseKey = 'People' | 'Machine' | 'Process' | 'Material' | 'Environment' | 'Measurement';
  const initialFishboneCauses: Record<FishboneCauseKey, string[]> = {
    People: [''],
    Machine: [''],
    Process: [''],
    Material: [''],
    Environment: [''],
    Measurement: [''],
  };
  const fishboneSuggestions: Record<FishboneCauseKey, string[]> = {
    People: ['Operator handoff did not confirm belt drift before restart.'],
    Machine: ['Transfer roller alignment is drifting under load.'],
    Process: ['Post-adjustment inspection was not repeated after speed increase.'],
    Material: ['Belt tension changed after recent format changeover.'],
    Environment: ['Guarding area was clear; no environmental contributor confirmed.'],
    Measurement: ['OEE and vibration trend show drift after speed increase.'],
  };
  type FaultTreeNodeType = 'top' | 'event' | 'cause';
  type FaultTreeNode = {
    id: string;
    label: string;
    detail?: string;
    x: number;
    y: number;
    parentId?: string;
    gate?: 'OR' | 'AND';
    aiGenerated?: boolean;
    type: FaultTreeNodeType;
  };
  const buildInitialFaultTreeNodes = React.useCallback((): FaultTreeNode[] => {
    const problem = reviewDetails.description || shiftLogbookFiveWhysProblem || 'Reported issue requires root cause analysis.';
    const equipment = reviewDetails.equipment || reviewDetails.title || 'Current equipment';
    const topLabel = problem.toLowerCase().includes('noise')
      ? `Excessive Noise in ${equipment}`
      : `${equipment} RCA event`;

    return [
      {
        id: 'top-event',
        label: topLabel,
        detail: reviewDetails.workOrder || shiftLogbookRcaNumber || reviewDetails.number,
        x: 940,
        y: 250,
        type: 'top',
        gate: 'OR',
        aiGenerated: true,
      },
      { id: 'lubrication-failure', label: 'Lubrication Failure', detail: 'Visual inspection indicates lack of lubrication.', x: 540, y: 135, parentId: 'top-event', type: 'event', gate: 'OR', aiGenerated: true },
      { id: 'mechanical-misalignment', label: 'Mechanical Misalignment', detail: 'Noise pattern can increase when the motor shaft or coupling drifts.', x: 540, y: 250, parentId: 'top-event', type: 'event', gate: 'OR', aiGenerated: true },
      { id: 'component-wear', label: 'Component Wear', detail: 'Wear history may explain increased noise under load.', x: 540, y: 365, parentId: 'top-event', type: 'event', gate: 'OR', aiGenerated: true },
      { id: 'low-oil-level', label: 'Low oil level', x: 65, y: 88, parentId: 'lubrication-failure', type: 'cause', aiGenerated: true },
      { id: 'incorrect-lubricant', label: 'Incorrect lubricant', x: 65, y: 135, parentId: 'lubrication-failure', type: 'cause', aiGenerated: true },
      { id: 'missed-pm', label: 'Missed preventive maintenance', x: 65, y: 182, parentId: 'lubrication-failure', type: 'cause', aiGenerated: true },
      { id: 'loose-coupling', label: 'Loose coupling', x: 65, y: 235, parentId: 'mechanical-misalignment', type: 'cause', aiGenerated: true },
      { id: 'shaft-offset', label: 'Motor-shaft offset', x: 65, y: 282, parentId: 'mechanical-misalignment', type: 'cause', aiGenerated: true },
      { id: 'improper-installation', label: 'Improper installation', x: 65, y: 329, parentId: 'mechanical-misalignment', type: 'cause', aiGenerated: true },
      { id: 'bearing-wear', label: 'Bearing wear', x: 65, y: 382, parentId: 'component-wear', type: 'cause', aiGenerated: true },
      { id: 'seal-degradation', label: 'Seal degradation', x: 65, y: 429, parentId: 'component-wear', type: 'cause', aiGenerated: true },
      { id: 'vibration-history', label: 'Excessive vibration history', x: 65, y: 476, parentId: 'component-wear', type: 'cause', aiGenerated: true },
    ];
  }, [reviewDetails.description, reviewDetails.equipment, reviewDetails.number, reviewDetails.title, reviewDetails.workOrder, shiftLogbookFiveWhysProblem, shiftLogbookRcaNumber]);
  const [fiveWhysSuggestionMode, setFiveWhysSuggestionMode] = React.useState<'offer' | 'typing' | 'accepted' | 'rejected'>('offer');
  const [fiveWhysDraftSteps, setFiveWhysDraftSteps] = React.useState(fiveWhysSteps);
  const [fishboneCauseRows, setFishboneCauseRows] = React.useState<Record<FishboneCauseKey, string[]>>(initialFishboneCauses);
  const [fishboneTypingCause, setFishboneTypingCause] = React.useState<{ cause: FishboneCauseKey; index: number } | null>(null);
  const [fishboneAnimatingCause, setFishboneAnimatingCause] = React.useState<{ cause: FishboneCauseKey; index: number } | null>(null);
  const [fishboneAiMode, setFishboneAiMode] = React.useState<'ready' | 'typing' | 'applied'>('ready');
  const [faultTreeNodes, setFaultTreeNodes] = React.useState<FaultTreeNode[]>(() => buildInitialFaultTreeNodes());
  const [selectedFaultTreeNodeId, setSelectedFaultTreeNodeId] = React.useState('lubrication-failure');
  const [faultTreeConnectTargetId, setFaultTreeConnectTargetId] = React.useState('lubrication-failure');
  const [newFaultTreeNodeLabel, setNewFaultTreeNodeLabel] = React.useState('');
  const [faultTreeAiMode, setFaultTreeAiMode] = React.useState<'applied' | 'typing'>('applied');
  const [dragFaultTreeNode, setDragFaultTreeNode] = React.useState<{
    nodeId: string;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
  } | null>(null);

  React.useEffect(() => {
    if (isShiftLogbookFiveWhysDrawerOpen) {
      setFiveWhysSuggestionMode(reviewDetails.rcaReviewMode ? 'accepted' : 'offer');
      setFiveWhysDraftSteps(fiveWhysSteps);
    }
  }, [isShiftLogbookFiveWhysDrawerOpen, reviewDetails.rcaReviewMode, shiftLogbookRcaNumber]);

  React.useEffect(() => {
    if (isShiftLogbookFishboneOpen) {
      setFishboneCauseRows(reviewDetails.rcaFishboneRows ?? initialFishboneCauses);
      setFishboneTypingCause(null);
      setFishboneAnimatingCause(null);
      setFishboneAiMode(reviewDetails.rcaReviewMode ? 'applied' : 'ready');
    }
  }, [isShiftLogbookFishboneOpen, reviewDetails.rcaFishboneRows, reviewDetails.rcaReviewMode, shiftLogbookRcaNumber]);

  React.useEffect(() => {
    if (isShiftLogbookFaultTreeOpen) {
      const nextNodes = buildInitialFaultTreeNodes();
      setFaultTreeNodes(nextNodes);
      setSelectedFaultTreeNodeId('lubrication-failure');
      setFaultTreeConnectTargetId('lubrication-failure');
      setNewFaultTreeNodeLabel('');
      setFaultTreeAiMode('typing');
      window.setTimeout(() => setFaultTreeAiMode('applied'), 1400);
    }
  }, [buildInitialFaultTreeNodes, isShiftLogbookFaultTreeOpen]);

  const acceptFiveWhysSuggestion = () => {
    setFiveWhysSuggestionMode('typing');
    window.setTimeout(() => {
      setFiveWhysDraftSteps(fiveWhysSteps);
      setFiveWhysSuggestionMode('accepted');
    }, 850);
  };

  const applyFishboneAiSuggestion = () => {
    setFishboneAiMode('typing');
    window.setTimeout(() => {
      setFishboneCauseRows(fishboneSuggestions);
      setFishboneAiMode('applied');
    }, 850);
  };

  const addFiveWhysStep = () => {
    setFiveWhysSuggestionMode('accepted');
    setFiveWhysDraftSteps((current) => [
      ...current,
      {
        label: `${current.length + 1}. Why?`,
        answer: '',
      },
    ]);
  };

  const updateFiveWhysAnswer = (index: number, answer: string) => {
    setFiveWhysDraftSteps((current) => current.map((step, stepIndex) => (
      stepIndex === index ? { ...step, answer } : step
    )));
  };

  const startManualFiveWhys = () => {
    setFiveWhysDraftSteps([
      { label: '1. Why did the problem occur?', answer: '' },
      { label: '2. Why?', answer: '' },
      { label: '3. Why?', answer: '' },
      { label: '4. Why?', answer: '' },
      { label: '5. Why? (Root cause)', answer: '' },
    ]);
    setFiveWhysSuggestionMode('accepted');
  };

  const addFishboneCause = (cause: FishboneCauseKey) => {
    const nextIndex = fishboneCauseRows[cause].length;
    setFishboneCauseRows((current) => ({
      ...current,
      [cause]: [
        ...current[cause],
        '',
      ],
    }));
    setFishboneAnimatingCause({ cause, index: nextIndex });
    window.setTimeout(() => setFishboneAnimatingCause(null), 520);
  };

  const updateFishboneCause = (cause: FishboneCauseKey, index: number, value: string) => {
    setFishboneCauseRows((current) => ({
      ...current,
      [cause]: current[cause].map((currentRow, rowIndex) => (rowIndex === index ? value : currentRow)),
    }));
  };

  const fillFishboneCause = (cause: FishboneCauseKey, index: number) => {
    if (fishboneCauseRows[cause][index]) return;
    setFishboneTypingCause({ cause, index });
    window.setTimeout(() => {
      const nextSuggestion = fishboneSuggestions[cause][0] ?? 'Additional contributing cause added from live context.';
      setFishboneCauseRows((current) => ({
        ...current,
        [cause]: current[cause].map((row, rowIndex) => (rowIndex === index ? nextSuggestion : row)),
      }));
      setFishboneTypingCause(null);
    }, 650);
  };

  const addFaultTreeNode = () => {
    const label = newFaultTreeNodeLabel.trim();
    const manualCount = faultTreeNodes.filter((node) => !node.aiGenerated).length;
    const newNode: FaultTreeNode = {
      id: `manual-${Date.now()}`,
      label,
      x: 82,
      y: Math.min(500, 60 + (manualCount * 48)),
      type: 'cause',
      aiGenerated: false,
    };

    setFaultTreeNodes((current) => [...current, newNode]);
    setSelectedFaultTreeNodeId(newNode.id);
    setNewFaultTreeNodeLabel('');
  };

  const connectSelectedFaultTreeNode = () => {
    const selectedNode = faultTreeNodes.find((node) => node.id === selectedFaultTreeNodeId);
    const parent = faultTreeNodes.find((node) => node.id === faultTreeConnectTargetId);
    if (!selectedNode || selectedNode.aiGenerated || selectedNode.parentId || !parent) return;

    const siblingCount = faultTreeNodes.filter((node) => node.parentId === parent.id && !node.aiGenerated).length;
    setFaultTreeNodes((current) => current.map((node) => (
      node.id === selectedNode.id
        ? {
          ...node,
          parentId: parent.id,
          x: Math.max(52, parent.x - 430),
          y: Math.min(500, Math.max(60, parent.y + 58 + siblingCount * 45)),
        }
        : node
    )));
  };

  const connectSelectedFaultTreeNodeTo = (parentId: string) => {
    const selectedNode = faultTreeNodes.find((node) => node.id === selectedFaultTreeNodeId);
    const parent = faultTreeNodes.find((node) => node.id === parentId);
    if (!selectedNode || selectedNode.aiGenerated || selectedNode.parentId || !parent) {
      setFaultTreeConnectTargetId(parentId);
      return;
    }

    const siblingCount = faultTreeNodes.filter((node) => node.parentId === parent.id && !node.aiGenerated).length;
    setFaultTreeConnectTargetId(parent.id);
    setFaultTreeNodes((current) => current.map((node) => (
      node.id === selectedNode.id
        ? {
          ...node,
          parentId: parent.id,
          x: Math.max(52, parent.x - 430),
          y: Math.min(500, Math.max(60, parent.y + 58 + siblingCount * 45)),
        }
        : node
    )));
  };

  const updateFaultTreeNodeLabel = (nodeId: string, label: string) => {
    setFaultTreeNodes((current) => current.map((node) => (
      node.id === nodeId ? { ...node, label } : node
    )));
  };

  const startFaultTreeNodeDrag = (event: React.PointerEvent, node: FaultTreeNode) => {
    const target = event.target as HTMLElement;
    if (target.closest('input, textarea, button, [role="button"], .MuiInputBase-root, .editable-analysis-field')) return;
    event.preventDefault();
    setSelectedFaultTreeNodeId(node.id);
    setDragFaultTreeNode({
      nodeId: node.id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: node.x,
      startY: node.y,
    });
  };

  React.useEffect(() => {
    if (!dragFaultTreeNode) return undefined;

    const handlePointerMove = (event: PointerEvent) => {
      const nextX = Math.max(40, Math.min(940, dragFaultTreeNode.startX + event.clientX - dragFaultTreeNode.startClientX));
      const nextY = Math.max(40, Math.min(510, dragFaultTreeNode.startY + event.clientY - dragFaultTreeNode.startClientY));
      setFaultTreeNodes((current) => current.map((node) => (
        node.id === dragFaultTreeNode.nodeId ? { ...node, x: nextX, y: nextY } : node
      )));
    };

    const handlePointerUp = () => setDragFaultTreeNode(null);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [dragFaultTreeNode]);

  const handleCreateIntegratedWoAction = () => {
    const workOrderReference = reviewDetails.workOrder || reviewDetails.number || 'WO record';
    const workOrderDescription = reviewDetails.description || reviewDetails.title || workOrderReference;

    openIntegratedActionCreateDrawer({
      source: 'Maintenance',
      category: 'MAINTENANCE',
      type: 'Corrective',
      title: workOrderDescription,
      problem: workOrderDescription,
      machine: reviewDetails.equipment || '',
      location: reviewDetails.location || '',
      assignedTo: reviewDetails.reportedBy || '',
      createdBy: reviewDetails.reportedBy || '',
      originRecordId: reviewDetails.number || reviewDetails.workOrder || '',
      originRecordLabel: workOrderReference,
      originScreen: 'shift_logbook',
    });
  };
  const drawerTopOffset = 48;
  const drawerHeight = `calc(100dvh - ${drawerTopOffset}px)`;
  const sourceDrawerWidth = SHIFT_LOGBOOK_SIDE_DRAWER_WIDTH;
  const rcaDrawerRightOffset = isShiftLogbookMaintenanceReviewOpen ? sourceDrawerWidth : isShiftLogbookSourceDrawerOpen ? sourceDrawerWidth : 0;
  const rcaDrawerWidth = sourceDrawerWidth;
  const isRcaPairedWithSourceDrawer = rcaDrawerRightOffset > 0;
  const rcaDrawerTopOffset = isRcaPairedWithSourceDrawer ? 0 : drawerTopOffset;
  const rcaDrawerHeight = isRcaPairedWithSourceDrawer ? '100dvh' : drawerHeight;
  const selectedFaultTreeNode = faultTreeNodes.find((node) => node.id === selectedFaultTreeNodeId) ?? faultTreeNodes[0];
  const canConnectSelectedFaultTreeNode = Boolean(
    selectedFaultTreeNode
    && !selectedFaultTreeNode.aiGenerated
    && !selectedFaultTreeNode.parentId
    && selectedFaultTreeNode.id !== faultTreeConnectTargetId,
  );
  const faultTreeRecommendedChecks = [
    'Inspect lubrication schedule and oil level',
    'Verify motor-shaft alignment and coupling condition',
    'Inspect bearing condition and wear pattern',
  ];
  const faultTreeContextItems = [
    { label: shiftLogbookRcaSource === 'ESO' ? 'ESO' : 'Work Order', value: shiftLogbookRcaNumber ?? reviewDetails.workOrder ?? reviewDetails.number },
    { label: 'Equipment', value: reviewDetails.equipment ?? reviewDetails.title },
    { label: 'Location', value: reviewDetails.location ?? `${reviewDetails.line ?? 'Line 10'} / ${reviewDetails.zone ?? 'Zone 01'}` },
    { label: 'Owner', value: reviewDetails.reportedBy ?? 'Maintenance Lead' },
    { label: 'Risk', value: reviewDetails.riskLevel ?? 'Medium' },
  ];
  return (
    <>
      {/* RCA Drawer */}
      {isShiftLogbookRcaDrawerOpen ? (
        <Box
          sx={{
            position: 'fixed',
            top: rcaDrawerTopOffset,
            right: { xs: 0, sm: rcaDrawerRightOffset },
            bottom: 'auto',
            height: rcaDrawerHeight,
            width: { xs: '100%', sm: rcaDrawerWidth },
            zIndex: 1407,
            bgcolor: 'background.paper',
            borderLeft: `1px solid ${tokenDivider}`,
            boxShadow: '-12px 0 28px rgba(0,31,155,0.12)',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: workstationVisuals.fontFamily,
          }}
        >
          <Box sx={{ px: 2, py: 1.35, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, minWidth: 0 }}>
                <Typography sx={{ color: tokenText.primary, fontSize: '1.08rem', fontWeight: 700 }} noWrap>
                  {shiftLogbookRcaNumber || reviewDetails.number || 'RCA'}
                </Typography>
                <Box sx={{ px: 0.8, py: 0.18, borderRadius: 999, bgcolor: tokenBrand.softBg, border: `1px solid ${tokenDivider}`, color: tokenBrand.main, fontSize: '0.62rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  RCA
                </Box>
              </Box>
              <Typography sx={{ color: tokenText.secondary, fontSize: '0.72rem', mt: 0.2 }} noWrap>
                {shiftLogbookRcaSource} &gt; Root Cause Analysis
              </Typography>
            </Box>
            <IconButton size="small" onClick={closeShiftLogbookRcaFlow} sx={{ color: tokenBrand.main, '&:hover': { bgcolor: tokenBrand.softBg } }}>
              <CloseIcon sx={{ fontSize: 19 }} />
            </IconButton>
          </Box>

          <Box sx={{ px: 1.75, py: 1.35, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.05, flexGrow: 1, bgcolor: 'background.default' }}>
            <Paper elevation={0} sx={{ p: 1.25, borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper', boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 0.9 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: '#64748B', fontSize: '0.62rem', fontWeight: 850, textTransform: 'uppercase', letterSpacing: 0.2 }}>
                    RCA context
                  </Typography>
                  <Typography sx={{ color: '#071C55', fontSize: '1.02rem', fontWeight: 900, lineHeight: 1.15 }} noWrap>
                    {reviewDetails.equipment || reviewDetails.title}
                  </Typography>
                </Box>
                <Box sx={{ px: 0.9, py: 0.35, borderRadius: 999, bgcolor: '#EAF2FF', border: '1px solid #BBD2FF', color: '#1251CC', fontSize: '0.64rem', fontWeight: 900, whiteSpace: 'nowrap' }}>
                  {shiftLogbookRcaSource}
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.65, mb: 0.85 }}>
                {[
                  ['Record', shiftLogbookRcaNumber],
                  ['Linked item', reviewDetails.workOrder || reviewDetails.number],
                  ['Location', reviewDetails.location || 'Line context'],
                  ['Reported by', reviewDetails.reportedBy || 'Operations'],
                  ['Created', reviewDetails.date || 'Current shift'],
                  ['Equipment', reviewDetails.equipment || reviewDetails.title],
                  ['Status', reviewDetails.status || 'In Progress'],
                ].map(([label, value]) => (
                  <Box key={label} sx={{ minWidth: 0, borderRadius: '9px', bgcolor: '#FFFFFF', border: '1px solid #E1E8F5', px: 0.9, py: 0.72 }}>
                    <Typography sx={{ color: '#7B8799', fontSize: '0.58rem', fontWeight: 850, textTransform: 'uppercase', lineHeight: 1 }}>
                      {label}
                    </Typography>
                    <Typography sx={{ color: '#0B225F', fontSize: '0.76rem', fontWeight: 850, lineHeight: 1.25, mt: 0.35 }} noWrap>
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ borderRadius: '10px', bgcolor: '#FFFFFF', border: '1px solid #DDE7F6', px: 0.95, py: 0.85 }}>
                <Typography sx={{ color: '#64748B', fontSize: '0.58rem', fontWeight: 850, textTransform: 'uppercase', mb: 0.35 }}>
                  Problem to analyze
                </Typography>
                <Typography sx={{ color: '#111827', fontSize: '0.78rem', fontWeight: 650, lineHeight: 1.35 }}>
                  {reviewDetails.description || reviewDetails.title}
                </Typography>
              </Box>
            </Paper>

            <AssistantBanner 
              message="The recommended RCA method for this case is 5 Whys, due it's low complexity."
            />

            <Box>
              <Typography sx={{ color: '#0F172A', fontSize: '0.85rem', fontWeight: 700, mb: 0.7 }}>Method</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                <Button
                  fullWidth
                  variant={shiftLogbookRcaMethod === '5 Whys' ? 'contained' : 'outlined'}
                  onClick={openShiftLogbookFiveWhysDrawer}
                  sx={{
                    minHeight: 36,
                    borderRadius: '8px',
                    bgcolor: shiftLogbookRcaMethod === '5 Whys' ? tokenBrand.main : 'transparent',
                    color: shiftLogbookRcaMethod === '5 Whys' ? tokenBrand.contrast : tokenBrand.main,
                    borderColor: tokenBrand.main,
                    justifyContent: 'space-between',
                    px: 1.7,
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    '&:hover': {
                      bgcolor: shiftLogbookRcaMethod === '5 Whys' ? tokenBrand.dark : tokenBrand.softBg,
                      borderColor: tokenBrand.dark,
                      boxShadow: 'none',
                    },
                  }}
                >
                  <Box component="span">5 WHYS</Box>
                  <AddIcon sx={{ fontSize: 18 }} />
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={openShiftLogbookFishboneWorkspace}
                  sx={{
                    minHeight: 36,
                    borderRadius: '8px',
                    bgcolor: 'transparent',
                    color: tokenBrand.main,
                    borderColor: tokenBrand.main,
                    justifyContent: 'space-between',
                    px: 1.7,
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    '&:hover': {
                      bgcolor: tokenBrand.softBg,
                      borderColor: tokenBrand.dark,
                    },
                  }}
                >
                  <Box component="span">FISHBONE DIAGRAM</Box>
                  <AddIcon sx={{ fontSize: 18 }} />
                </Button>
                <Button
                  fullWidth
                  variant={shiftLogbookRcaMethod === 'Fault Tree Analysis' ? 'contained' : 'outlined'}
                  onClick={openShiftLogbookFaultTreeWorkspace}
                  sx={{
                    minHeight: 36,
                    borderRadius: '8px',
                    bgcolor: shiftLogbookRcaMethod === 'Fault Tree Analysis' ? tokenBrand.main : 'transparent',
                    color: shiftLogbookRcaMethod === 'Fault Tree Analysis' ? tokenBrand.contrast : tokenBrand.main,
                    borderColor: tokenBrand.main,
                    justifyContent: 'space-between',
                    px: 1.7,
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    '&:hover': {
                      bgcolor: shiftLogbookRcaMethod === 'Fault Tree Analysis' ? tokenBrand.dark : tokenBrand.softBg,
                      borderColor: tokenBrand.dark,
                      boxShadow: 'none',
                    },
                  }}
                >
                  <Box component="span">FAULT TREE ANALYSIS</Box>
                  <AddIcon sx={{ fontSize: 18 }} />
                </Button>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.7, color: '#7A7A7A' }}>
              <InfoOutlinedIcon sx={{ fontSize: 15, mt: 0.15 }} />
              <Typography sx={{ fontSize: '0.67rem', lineHeight: 1.35 }}>
                5 Whys is for quick analysis, Fishbone presents multiple causes, and Fault Tree maps how failures combine into the top event.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 'auto', px: 1.75, py: 1.15, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
            <Button variant="text" onClick={closeShiftLogbookRcaFlow} sx={{ color: tokenText.secondary, fontSize: '0.8rem', fontWeight: 500, borderRadius: '8px' }}>
              BACK
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                if (shiftLogbookRcaMethod === 'Fault Tree Analysis') {
                  openShiftLogbookFaultTreeWorkspace();
                  return;
                }
                if (shiftLogbookRcaMethod === 'Fishbone Diagram') {
                  openShiftLogbookFishboneWorkspace();
                  return;
                }
                openShiftLogbookFiveWhysDrawer();
              }}
              sx={{
                minWidth: 110,
                height: 36,
                borderRadius: '8px',
                bgcolor: tokenBrand.main,
                color: tokenBrand.contrast,
                boxShadow: 'none',
                fontSize: '0.72rem',
                fontWeight: 900,
                '&:hover': {
                  bgcolor: tokenBrand.dark,
                },
                '&.Mui-disabled': {
                  bgcolor: '#E5E7EB',
                  color: '#7A8798',
                },
              }}
            >
              CONTINUE
            </Button>
          </Box>
        </Box>
      ) : null}

      {/* 5 Whys Drawer */}
      {isShiftLogbookFiveWhysDrawerOpen ? (
        <Box
          sx={{
            position: 'fixed',
            top: rcaDrawerTopOffset,
            right: { xs: 0, sm: rcaDrawerRightOffset },
            bottom: 'auto',
            height: rcaDrawerHeight,
            width: { xs: '100%', sm: rcaDrawerWidth },
            zIndex: 1408,
            bgcolor: '#FFFFFF',
            borderLeft: '1px solid #DCE4F2',
            boxShadow: '-12px 0 34px rgba(15,23,42,0.10)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ px: 1.35, py: 1.3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E1E8F5' }}>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, minWidth: 0 }}>
                <Typography sx={{ color: '#124FC8', fontSize: '1rem', fontWeight: 850 }} noWrap>
                  {shiftLogbookRcaNumber || reviewDetails.number || 'RCA'}
                </Typography>
                <Chip label="5 Whys" size="small" sx={{ height: 22, bgcolor: '#EEF4FF', color: '#1251CC', border: '1px solid #BFD3F2', fontWeight: 850, '& .MuiChip-label': { px: 0.8, fontSize: '0.62rem' } }} />
              </Box>
              <Typography sx={{ color: '#64748B', fontSize: '0.72rem', mt: 0.2 }} noWrap>
                RCA &gt; 5 Whys analysis
              </Typography>
            </Box>
            <IconButton size="small" onClick={closeShiftLogbookRcaFlow} sx={{ color: '#2F6BFF' }}>
              <CloseIcon sx={{ fontSize: 19 }} />
            </IconButton>
          </Box>

          <Box sx={{ px: 1.2, pb: 1.2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0.72, flexGrow: 1 }}>
            <TextField
              size="small"
              label="Number"
              value={shiftLogbookRcaNumber}
              fullWidth
              variant="filled"
              InputProps={{ disableUnderline: true, readOnly: true, sx: { borderRadius: 2, bgcolor: '#F2F4F7', fontSize: '0.92rem' } }}
              InputLabelProps={{ shrink: true, sx: { color: '#7B8799', fontSize: '0.66rem', fontWeight: 500 } }}
            />
            <TextField
              size="small"
              label="Problem"
              value={shiftLogbookFiveWhysProblem}
              fullWidth
              variant="filled"
              InputProps={{ disableUnderline: true, readOnly: true, sx: { borderRadius: 2, bgcolor: '#F2F4F7', fontSize: '0.92rem' } }}
              InputLabelProps={{ shrink: true, sx: { color: '#7B8799', fontSize: '0.66rem', fontWeight: 500 } }}
            />

            <Paper elevation={0} sx={{ p: 1.05, borderRadius: '10px', bgcolor: '#EAF2FF', border: '1px solid #D9E8FF', mb: 1.4 }}>
              <Typography sx={{ color: '#1E63DA', fontSize: '0.9rem', fontWeight: 800, mb: 0.45 }}>
                <SparkleIcon sx={{ fontSize: 14, mr: 0.45, color: '#FF8A3D', verticalAlign: '-2px' }} />
                BLU.AI Assistant
              </Typography>
              {fiveWhysSuggestionMode === 'offer' ? (
                <>
                  <Typography sx={{ color: '#0E4FB4', fontSize: '0.72rem', lineHeight: 1.3, mb: 0.9 }}>
                    I can draft the 5 Whys from this work order, linked OEE signals, and the latest logbook context.
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <IconButton size="small" onClick={() => setFiveWhysSuggestionMode('rejected')} sx={{ width: 26, height: 26, color: '#4384FF', border: 0, bgcolor: 'transparent' }}>
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton size="small" onClick={acceptFiveWhysSuggestion} sx={{ width: 26, height: 26, color: '#4384FF', border: 0, bgcolor: 'transparent' }}>
                      <CheckIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={startManualFiveWhys}
                      sx={{ borderRadius: 999, color: '#2F6BFF', borderColor: '#8DB3FF', fontWeight: 800, fontSize: '0.68rem', textTransform: 'none' }}
                    >
                      Start manual
                    </Button>
                  </Box>
                </>
              ) : null}
              {fiveWhysSuggestionMode === 'typing' ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.48 }}>
                  {[1, 2, 3, 4, 5].map((step) => (
                    <Paper key={step} elevation={0} sx={{ px: 0.95, py: 0.68, borderRadius: '9px', bgcolor: '#F7FAFF', border: '1px solid #BFCBE0' }}>
                      <Typography sx={{ color: '#6B7280', fontSize: '0.59rem', mb: 0.12 }}>{step}. Why?</Typography>
                      <Typography sx={{ color: '#2F6BFF', fontSize: '0.78rem', lineHeight: 1.28, fontWeight: 700 }}>BLU.AI is typing...</Typography>
                    </Paper>
                  ))}
                </Box>
              ) : null}
              {fiveWhysSuggestionMode === 'accepted' ? (
                <>
                  <Typography sx={{ color: '#0E4FB4', fontSize: '0.72rem', lineHeight: 1.3, mb: 0.85 }}>
                    Drafted from all data grouped in the Work Order and related files:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.48 }}>
                    {fiveWhysDraftSteps.map((step, index) => (
                      <Paper key={`${step.label}-${index}`} elevation={0} sx={{ px: 0.9, py: 0.62, borderRadius: '9px', bgcolor: '#F7FAFF', border: '1px solid #BFCBE0' }}>
                        <Typography sx={{ color: '#6B7280', fontSize: '0.59rem', mb: 0.24 }}>{step.label}</Typography>
                        <Box
                          component="textarea"
                          value={step.answer}
                          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => updateFiveWhysAnswer(index, event.target.value)}
                          placeholder="Type the answer..."
                          rows={2}
                          className="editable-analysis-field"
                          onPointerDown={stopAnalysisFieldInteraction}
                          onMouseDown={stopAnalysisFieldInteraction}
                          onClick={stopAnalysisFieldInteraction}
                          onFocus={stopAnalysisFieldInteraction}
                          onKeyDown={stopAnalysisFieldInteraction}
                          sx={{
                            width: '100%',
                            minHeight: 36,
                            border: 0,
                            outline: 'none',
                            resize: 'none',
                            pointerEvents: 'auto',
                            userSelect: 'text',
                            cursor: 'text',
                            bgcolor: 'transparent',
                            color: '#1F2937',
                            fontFamily: 'inherit',
                            fontSize: '0.76rem',
                            lineHeight: 1.28,
                            fontWeight: 500,
                            p: 0,
                            '&::placeholder': { color: '#94A3B8', opacity: 1 },
                          }}
                        />
                      </Paper>
                    ))}
                  </Box>
                  <Button
                    onClick={addFiveWhysStep}
                    startIcon={<AddIcon sx={{ fontSize: 15 }} />}
                    sx={{ mt: 0.85, minHeight: 30, borderRadius: 999, color: '#1251CC', border: '1px solid #9FB8E7', bgcolor: '#FFFFFF', textTransform: 'none', fontSize: '0.68rem', fontWeight: 850 }}
                  >
                    Add Why
                  </Button>

                  <Box sx={{ mt: 1.05, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Typography sx={{ color: '#0E4FB4', fontSize: '0.72rem', fontWeight: 700 }}>
                      Would you like to keep those suggestions?
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                      <IconButton size="small" onClick={() => setFiveWhysSuggestionMode('rejected')} sx={{ width: 24, height: 24, color: '#4384FF', border: 0, bgcolor: 'transparent' }}>
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => setFiveWhysSuggestionMode('accepted')} sx={{ width: 24, height: 24, color: '#4384FF', border: 0, bgcolor: 'transparent' }}>
                        <CheckIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    </Box>
                  </Box>
                </>
              ) : null}
              {fiveWhysSuggestionMode === 'rejected' ? (
                <>
                  <Typography sx={{ color: '#0E4FB4', fontSize: '0.72rem', lineHeight: 1.3, mb: 0.8 }}>
                    Suggestion dismissed. Start a manual 5 Whys draft and add as many Why rows as needed.
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon sx={{ fontSize: 15 }} />}
                    onClick={startManualFiveWhys}
                    sx={{ borderRadius: 999, color: '#1251CC', borderColor: '#8DB3FF', fontWeight: 850, fontSize: '0.68rem', textTransform: 'none' }}
                  >
                    Start manual 5 Whys
                  </Button>
                </>
              ) : null}
            </Paper>

            <Paper elevation={0} sx={{ display: 'none' }}>
              <Typography sx={{ color: '#1E63DA', fontSize: '0.92rem', fontWeight: 700, mb: 0.75 }}>
                <SparkleIcon sx={{ fontSize: 14, mr: 0.45, color: '#FF8A3D', verticalAlign: '-2px' }} />
                BLU.AI Suggestions
              </Typography>
              <Typography sx={{ color: '#5D6778', fontSize: '0.66rem', lineHeight: 1.3, mb: 0.85 }}>
                Detailed suggestions for possible actions you can take regarding work orders WO-2567952.
              </Typography>

              <Paper elevation={0} sx={{ p: 0.85, borderRadius: '10px', bgcolor: '#FFFFFF', border: '1px solid #D7E0F0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.45 }}>
                  <Typography sx={{ color: '#2A2A2A', fontSize: '0.73rem', lineHeight: 1.25 }}>
                    Perform Laser Alignment on Motor Assembl...
                  </Typography>
                  <Button
                    size="small"
                    sx={{
                      minWidth: 90,
                      borderRadius: 999,
                      border: '1px solid #7EA8FF',
                      color: '#2F6BFF',
                      fontWeight: 700,
                      fontSize: '0.63rem',
                      px: 1.1,
                    }}
                  >
                    CREATE ACTION
                  </Button>
                </Box>
                <Typography sx={{ color: '#7B8799', fontSize: '0.62rem' }}>
                  John Smith • Apr 03, 2026
                </Typography>
              </Paper>
            </Paper>

            <Paper elevation={0} sx={{ p: 0.95, borderRadius: '10px', bgcolor: '#FFFFFF', border: '1px solid #D7DCE4' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
                <Typography sx={{ color: '#6B7280', fontSize: '0.82rem', fontWeight: 700 }}>Attachments</Typography>
                <ChevronLeftIcon sx={{ color: '#CBD5E1', fontSize: 18, transform: 'rotate(180deg)' }} />
              </Box>
              <Box sx={{ height: 86, borderRadius: '7px', bgcolor: '#E5E7EB', display: 'grid', placeItems: 'center', color: '#667085', textAlign: 'center' }}>
                <Box>
                  <CloudUploadIcon sx={{ color: '#9AA7B8', fontSize: 25, mb: 0.4 }} />
                  <Typography sx={{ fontSize: '0.64rem', color: '#3E4C66', fontWeight: 600 }}>Click to upload or drag and drop</Typography>
                  <Typography sx={{ fontSize: '0.58rem', color: '#64748B', mt: 0.25 }}>PDF, DOC, JPG, PNG (max 10MB each)</Typography>
                </Box>
              </Box>
            </Paper>
          </Box>

          <Box sx={{ mt: 'auto', px: 1.7, py: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Button variant="text" onClick={returnToShiftLogbookRcaMethodDrawer} sx={{ color: '#6B6B6B', fontSize: '0.8rem', fontWeight: 500 }}>
              BACK
            </Button>
            <Button
              variant="contained"
              disabled={fiveWhysSuggestionMode !== 'accepted'}
              onClick={() => saveShiftLogbookRca?.({ method: '5 Whys', status: 'Submitted' })}
              startIcon={<CheckCircleIcon sx={{ fontSize: 15 }} />}
              sx={{
                minWidth: 96,
                height: 34,
                borderRadius: '8px',
                bgcolor: fiveWhysSuggestionMode === 'accepted' ? '#0B63E5' : '#D9D9D9',
                color: fiveWhysSuggestionMode === 'accepted' ? '#FFFFFF' : '#9A9A9A',
                boxShadow: 'none',
                fontSize: '0.72rem',
                fontWeight: 850,
                '& .MuiButton-startIcon': { color: 'inherit' },
                '&:hover': { bgcolor: fiveWhysSuggestionMode === 'accepted' ? '#064FC0' : '#D9D9D9' },
                '&.Mui-disabled': {
                  bgcolor: '#E5E7EB',
                  color: '#7A8798',
                },
              }}
            >
              SUBMIT
            </Button>
          </Box>
        </Box>
      ) : null}

      {/* Fishbone Workspace */}
      {isShiftLogbookFishboneOpen ? (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            height: '100dvh',
            zIndex: 3000,
            bgcolor: 'rgba(15, 23, 42, 0.46)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            overflowY: 'hidden',
            overflowX: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 1.5, md: 3 },
            '@keyframes fishboneCausePop': {
              '0%': { transform: 'translateY(8px) scale(0.94)', opacity: 0 },
              '55%': { transform: 'translateY(-3px) scale(1.02)', opacity: 1 },
              '100%': { transform: 'translateY(0) scale(1)', opacity: 1 },
            },
          }}
        >
          <Box sx={{ width: 'min(1560px, calc(100vw - 88px))', maxHeight: 'calc(100dvh - 92px)', bgcolor: '#F8FAFE', borderRadius: '10px', border: '1px solid #D7E2F2', boxShadow: '0 28px 80px rgba(15,23,42,0.32)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ px: { xs: 1.4, md: 2.2 }, py: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Typography sx={{ color: '#0645AD', fontSize: '1.05rem', fontWeight: 900 }}>Autoguard &gt; Fishbone</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1 }}>
                <Button
                  variant="outlined"
                  startIcon={<CloseIcon sx={{ fontSize: 15 }} />}
                  onClick={closeShiftLogbookFishboneWorkspace}
                  sx={{ height: 34, borderRadius: '8px', color: '#EF4444', borderColor: '#FCA5A5', bgcolor: '#FFFFFF', fontSize: '0.72rem', fontWeight: 850 }}
                >
                  CANCEL
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => saveShiftLogbookRca?.({ method: 'Fishbone Diagram', status: 'Draft' })}
                  sx={{ height: 34, borderRadius: '8px', color: '#2563EB', borderColor: '#8DB3FF', bgcolor: '#FFFFFF', fontSize: '0.72rem', fontWeight: 850 }}
                >
                  SAVE DRAFT
                </Button>
                <Button
                  variant="contained"
                  onClick={() => saveShiftLogbookRca?.({ method: 'Fishbone Diagram', status: 'Submitted' })}
                  startIcon={<CheckCircleIcon sx={{ fontSize: 15 }} />}
                  sx={{ height: 34, borderRadius: '8px', bgcolor: '#0B63E5', color: '#FFFFFF', boxShadow: 'none', fontSize: '0.72rem', fontWeight: 850, '&:hover': { bgcolor: '#064FC0' } }}
                >
                  SUBMIT
                </Button>
              </Box>
            </Box>

            <Box sx={{ px: { xs: 1.4, md: 2.2 }, pb: 2.2, overflowY: 'auto', overflowX: 'hidden', flex: 1 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(190px, 1fr) minmax(190px, 1fr) minmax(170px, 0.9fr) minmax(170px, 0.9fr) minmax(360px, 2fr)' }, gap: 1, alignItems: 'start' }}>
                <TextField
                  size="small"
                  label="Number"
                  value={shiftLogbookRcaNumber}
                  variant="filled"
                  InputProps={{ disableUnderline: true, readOnly: true, sx: { height: 36, borderRadius: '10px', bgcolor: '#EFEFEF', fontSize: '0.82rem' } }}
                  InputLabelProps={{ shrink: true, sx: { fontSize: '0.58rem', color: '#7B8799' } }}
                />
                <TextField
                  size="small"
                  label="Equipment"
                  value={reviewDetails.equipment}
                  variant="filled"
                  InputProps={{ disableUnderline: true, readOnly: true, sx: { height: 36, borderRadius: '10px', bgcolor: '#EFEFEF', fontSize: '0.82rem' } }}
                  InputLabelProps={{ shrink: true, sx: { fontSize: '0.58rem', color: '#7B8799' } }}
                />
                <FormControl size="small">
                  <InputLabel sx={{ fontSize: '0.7rem' }}>Assign to</InputLabel>
                  <Select value={reviewDetails.reportedBy || "Ronie D'elano"} label="Assign to" sx={{ height: 36, borderRadius: '10px', bgcolor: '#FFFFFF' }}>
                    <MenuItem value={reviewDetails.reportedBy || "Ronie D'elano"}>{reviewDetails.reportedBy || "Ronie D'elano"}</MenuItem>
                    <MenuItem value="Maintenance Lead">Maintenance Lead</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small">
                  <InputLabel sx={{ fontSize: '0.7rem' }}>Shift</InputLabel>
                  <Select value="Day Shift" label="Shift" sx={{ height: 36, borderRadius: '10px', bgcolor: '#FFFFFF' }}>
                    <MenuItem value="Day Shift">Day Shift</MenuItem>
                    <MenuItem value="Night Shift">Night Shift</MenuItem>
                  </Select>
                </FormControl>
                <Paper elevation={0} sx={{ minHeight: 70, p: 1, borderRadius: '10px', border: '1px solid #D8E6FF', bgcolor: '#EAF2FF', gridRow: { md: 'span 2' }, overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Typography sx={{ color: '#0C59D8', fontWeight: 900, fontSize: '0.76rem', whiteSpace: 'nowrap' }}>
                      <SparkleIcon sx={{ fontSize: 14, color: '#F97316', mr: 0.35, verticalAlign: '-2px' }} />
                      BLU.AI Assistant
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, flexShrink: 0 }}>
                      <Typography sx={{ color: '#0C59D8', fontSize: '0.62rem', fontWeight: 700 }}>Use suggestion?</Typography>
                      <IconButton size="small" onClick={() => setFishboneAiMode('ready')} sx={{ width: 20, height: 20, color: '#4384FF', border: 0, bgcolor: 'transparent', '&:hover': { bgcolor: '#DDEBFF' } }}><CloseIcon sx={{ fontSize: 14 }} /></IconButton>
                      <IconButton size="small" onClick={applyFishboneAiSuggestion} sx={{ width: 20, height: 20, color: '#4384FF', border: 0, bgcolor: 'transparent', '&:hover': { bgcolor: '#DDEBFF' } }}><CheckIcon sx={{ fontSize: 15 }} /></IconButton>
                    </Box>
                  </Box>
                  <Typography sx={{ color: '#0E4FB4', fontSize: '0.66rem', lineHeight: 1.25, mt: 0.35 }}>
                    {fishboneAiMode === 'typing'
                      ? 'BLU.AI is typing suggested contributors into the diagram...'
                      : fishboneAiMode === 'applied'
                        ? 'Suggested contributors were added into the first cause fields. Add more rows when you want to type your own causes.'
                        : 'Click the first cause field in each branch to let BLU.AI draft it, or use + to add your own manual cause rows.'}
                  </Typography>
                </Paper>
                <TextField
                  size="small"
                  label="Problem Description"
                  value={reviewDetails.description}
                  variant="filled"
                  sx={{ gridColumn: { xs: '1', md: '1 / span 2' } }}
                  InputProps={{ disableUnderline: true, readOnly: true, sx: { height: 36, borderRadius: '10px', bgcolor: '#EFEFEF', fontSize: '0.82rem' } }}
                  InputLabelProps={{ shrink: true, sx: { fontSize: '0.58rem', color: '#7B8799' } }}
                />
              </Box>

              <Paper elevation={0} sx={{ mt: 1.8, height: { xs: 620, md: 'min(64vh, 700px)' }, minHeight: { xs: 520, md: 580 }, borderRadius: '10px', bgcolor: '#F2F2F2', position: 'relative', overflow: 'hidden', border: '1px solid #E4E7EC' }}>
                <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                  <Box component="svg" viewBox="0 0 1200 520" preserveAspectRatio="xMidYMid meet" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                    <line x1="88" y1="260" x2="1015" y2="260" stroke="#2F6BFF" strokeWidth="2.2" />
                    <line x1="330" y1="260" x2="290" y2="142" stroke="#2F6BFF" strokeWidth="2.2" />
                    <line x1="330" y1="260" x2="290" y2="378" stroke="#2F6BFF" strokeWidth="2.2" />
                    <line x1="610" y1="260" x2="570" y2="142" stroke="#2F6BFF" strokeWidth="2.2" />
                    <line x1="610" y1="260" x2="570" y2="378" stroke="#2F6BFF" strokeWidth="2.2" />
                    <line x1="890" y1="260" x2="850" y2="142" stroke="#2F6BFF" strokeWidth="2.2" />
                    <line x1="890" y1="260" x2="850" y2="378" stroke="#2F6BFF" strokeWidth="2.2" />
                    <circle cx="290" cy="142" r="4.8" fill="#2F6BFF" />
                    <circle cx="330" cy="260" r="4.8" fill="#2F6BFF" />
                    <circle cx="290" cy="378" r="4.8" fill="#2F6BFF" />
                    <circle cx="570" cy="142" r="4.8" fill="#2F6BFF" />
                    <circle cx="610" cy="260" r="4.8" fill="#2F6BFF" />
                    <circle cx="570" cy="378" r="4.8" fill="#2F6BFF" />
                    <circle cx="850" cy="142" r="4.8" fill="#2F6BFF" />
                    <circle cx="890" cy="260" r="4.8" fill="#2F6BFF" />
                    <circle cx="850" cy="378" r="4.8" fill="#2F6BFF" />
                    <circle cx="1015" cy="260" r="4.8" fill="#2F6BFF" />
                  </Box>

                  {([
                    { label: 'People', top: 156, left: 92 },
                    { label: 'Machine', top: 156, left: 372 },
                    { label: 'Environment', top: 156, left: 652 },
                    { label: 'Process', top: 318, left: 92 },
                    { label: 'Material', top: 318, left: 372 },
                    { label: 'Measurement', top: 318, left: 652 },
                  ] as const).map((cause) => {
                    const rows = fishboneCauseRows[cause.label];
                    const isLowerCause = cause.label === 'Process' || cause.label === 'Material' || cause.label === 'Measurement';
                    return (
                      <Paper key={cause.label} elevation={0} sx={{ position: 'absolute', top: `calc(${cause.top / 520 * 100}% - ${isLowerCause ? 43 : 62}px)`, left: `${cause.left / 1200 * 100}%`, width: 'clamp(178px, 18.2%, 260px)', minHeight: 130, borderRadius: '10px', bgcolor: '#F0F0F0', overflow: 'hidden', boxShadow: '0 20px 34px rgba(15,23,42,0.07)' }}>
                        <Box sx={{ height: 32, mx: 0.9, mt: 0.9, px: 1.15, borderRadius: '9px', bgcolor: '#2563EB', color: '#FFFFFF', display: 'flex', alignItems: 'center', fontSize: '0.88rem', fontWeight: 650 }}>
                          {cause.label}
                        </Box>
                        <Box sx={{ mx: 0.9, mt: 0.9, display: 'flex', flexDirection: 'column', gap: 0.55, pb: 3.7 }}>
                          {rows.map((row, index) => (
                            <Box
                              component="textarea"
                              key={`${cause.label}-${index}`}
                              value={row}
                              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => updateFishboneCause(cause.label, index, event.target.value)}
                              placeholder={fishboneTypingCause?.cause === cause.label && fishboneTypingCause.index === index ? 'BLU.AI typing...' : 'Describe cause'}
                              rows={2}
                              className="editable-analysis-field"
                              onPointerDown={stopAnalysisFieldInteraction}
                              onMouseDown={stopAnalysisFieldInteraction}
                              onClick={stopAnalysisFieldInteraction}
                              onFocus={stopAnalysisFieldInteraction}
                              onKeyDown={stopAnalysisFieldInteraction}
                              sx={{
                                width: '100%',
                                minHeight: 42,
                                maxHeight: 54,
                                borderRadius: '8px',
                                bgcolor: '#FFFFFF',
                                border: '1px solid rgba(15,23,42,0.03)',
                                outline: 'none',
                                resize: 'none',
                                pointerEvents: 'auto',
                                userSelect: 'text',
                                cursor: 'text',
                                overflow: 'hidden',
                                px: 1.15,
                                py: 0.75,
                                color: fishboneTypingCause?.cause === cause.label && fishboneTypingCause.index === index ? '#2563EB' : '#4B5563',
                                fontFamily: 'inherit',
                                fontSize: '0.78rem',
                                fontWeight: fishboneTypingCause?.cause === cause.label && fishboneTypingCause.index === index ? 800 : 500,
                                lineHeight: 1.2,
                                '&::placeholder': { color: '#9CA3AF', opacity: 1 },
                                '&::-webkit-scrollbar': { display: 'none' },
                                animation: fishboneAnimatingCause?.cause === cause.label && fishboneAnimatingCause.index === index ? 'fishboneCausePop 0.46s ease-out' : 'none',
                                '&:focus': {
                                  borderColor: '#8DB3FF',
                                  boxShadow: '0 0 0 2px rgba(47,107,255,0.12)',
                                },
                              }}
                            />
                          ))}
                        </Box>
                        <Box sx={{ position: 'absolute', right: 12, bottom: 10, display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <DeleteIcon sx={{ fontSize: 13, color: '#D7D7D7' }} />
                          <Box
                            onClick={() => addFishboneCause(cause.label)}
                            sx={{ width: 15, height: 15, borderRadius: '50%', bgcolor: '#2563EB', color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 900, cursor: 'pointer' }}
                          >
                            +
                          </Box>
                        </Box>
                      </Paper>
                    );
                  })}

                  <Box sx={{ position: 'absolute', top: 'calc(50% - 18px)', left: '82%', width: 'clamp(150px, 15.5%, 215px)', height: 38, borderRadius: '9px', bgcolor: '#2563EB', color: '#FFFFFF', px: 1.35, display: 'flex', alignItems: 'center', fontSize: '0.92rem', fontWeight: 650, boxShadow: '0 12px 22px rgba(37,99,235,0.12)' }}>
                    Root Cause
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      ) : null}

      {/* Fault Tree Workspace */}
      {isShiftLogbookFaultTreeOpen ? (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            height: '100dvh',
            zIndex: 3000,
            bgcolor: 'rgba(15, 23, 42, 0.42)',
            backdropFilter: 'blur(4px)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 1.4, md: 3 },
            '@keyframes faultAiPulse': {
              '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(37,99,235,0.35)' },
              '70%': { transform: 'scale(1.12)', boxShadow: '0 0 0 8px rgba(37,99,235,0)' },
              '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(37,99,235,0)' },
            },
          }}
        >
          <Box sx={{ width: 'min(1540px, calc(100vw - 64px))', maxHeight: 'calc(100dvh - 104px)', bgcolor: '#F5F7FC', borderRadius: 1.5, border: '1px solid #D7E2F2', boxShadow: '0 24px 70px rgba(15,23,42,0.28)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ px: { xs: 1.4, md: 2.2 }, py: 1.15, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, bgcolor: '#FFFFFF', borderBottom: '1px solid #E1E8F5' }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ color: '#0645AD', fontSize: { xs: '0.95rem', md: '1.05rem' }, fontWeight: 900 }}>
                  Autoguard &gt; Fault Tree Analysis
                </Typography>
                <Typography sx={{ color: '#64748B', fontSize: '0.68rem', fontWeight: 700, mt: 0.25 }} noWrap>
                  {reviewDetails.description}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1, flexShrink: 0 }}>
                <Button
                  variant="outlined"
                  startIcon={<CloseIcon sx={{ fontSize: 15 }} />}
                  onClick={closeShiftLogbookFaultTreeWorkspace}
                  sx={{ height: 32, borderRadius: 1.5, color: '#EF4444', borderColor: '#FCA5A5', bgcolor: '#FFFFFF', fontSize: '0.72rem', fontWeight: 850 }}
                >
                  CANCEL
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => saveShiftLogbookRca?.({ method: 'Fault Tree Analysis', status: 'Draft' })}
                  sx={{ height: 32, borderRadius: 1.5, color: '#2563EB', borderColor: '#8DB3FF', bgcolor: '#FFFFFF', fontSize: '0.72rem', fontWeight: 850 }}
                >
                  SAVE DRAFT
                </Button>
                <Button
                  variant="contained"
                  onClick={() => saveShiftLogbookRca?.({ method: 'Fault Tree Analysis', status: 'Submitted' })}
                  startIcon={<CheckCircleIcon sx={{ fontSize: 15 }} />}
                  sx={{ height: 32, borderRadius: 1.5, bgcolor: '#0B63E5', color: '#FFFFFF', boxShadow: 'none', fontSize: '0.72rem', fontWeight: 850, '&:hover': { bgcolor: '#064FC0' } }}
                >
                  SUBMIT
                </Button>
              </Box>
            </Box>

          <Box sx={{ mx: { xs: 1.2, md: 2.2 }, mt: 1.4, mb: 1.2, p: { xs: 1.1, md: 1.25 }, borderRadius: 1.6, bgcolor: '#FFFFFF', border: '1px solid #E1E8F5', boxShadow: '0 14px 34px rgba(15,23,42,0.06)' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(5, minmax(120px, 1fr))' }, gap: 0.75 }}>
              {faultTreeContextItems.map((item) => (
                <Box key={item.label} sx={{ minWidth: 0, px: 1, py: 0.65, borderRadius: 1.2, bgcolor: '#F5F7FB', border: '1px solid #E1E8F5' }}>
                  <Typography sx={{ color: '#64748B', fontSize: '0.55rem', fontWeight: 850, textTransform: 'uppercase' }} noWrap>
                    {item.label}
                  </Typography>
                  <Typography sx={{ color: '#0F172A', fontSize: '0.74rem', fontWeight: 850, mt: 0.2 }} noWrap>
                    {item.value || '-'}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Paper elevation={0} sx={{ mt: 1.2, p: 1, borderRadius: 1.4, border: '1px solid #D8E6FF', bgcolor: '#EAF2FF', display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 1.5, flexDirection: { xs: 'column', md: 'row' } }}>
              <Box>
                <Typography sx={{ color: '#0C59D8', fontWeight: 900, fontSize: '0.76rem' }}>
                  <SparkleIcon sx={{ fontSize: 14, color: '#F97316', mr: 0.35, verticalAlign: '-2px' }} />
                  BLU.AI Assistant
                </Typography>
                <Typography sx={{ color: '#0E4FB4', fontSize: '0.68rem', lineHeight: 1.3, mt: 0.3 }}>
                  {faultTreeAiMode === 'typing'
                    ? 'BLU.AI is generating a fault tree from the work order/ESO description and related maintenance signals...'
                    : 'AI generated the initial branches. Select any node, type a new cause, and add it to connect your manual node to that branch.'}
                </Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '190px minmax(210px, 1fr) auto auto' }, gap: 0.8, width: { xs: '100%', md: 760 } }}>
                <FormControl size="small">
                  <InputLabel sx={{ fontSize: '0.68rem' }}>Connect to</InputLabel>
                  <Select
                    value={faultTreeConnectTargetId}
                    label="Connect to"
                    onChange={(event) => setFaultTreeConnectTargetId(String(event.target.value))}
                    sx={{ height: 34, borderRadius: 1, bgcolor: '#FFFFFF', fontSize: '0.74rem' }}
                  >
                    {faultTreeNodes.filter((node) => node.type === 'event' || node.type === 'top').map((node) => (
                      <MenuItem key={node.id} value={node.id}>{node.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  placeholder="Optional: type a cause, or click Add Node for a blank box"
                  value={newFaultTreeNodeLabel}
                  onChange={(event) => setNewFaultTreeNodeLabel(event.target.value)}
                  onKeyDown={(event) => {
                    event.stopPropagation();
                    if (event.key === 'Enter') addFaultTreeNode();
                  }}
                  onClick={(event) => event.stopPropagation()}
                  onPointerDown={(event) => event.stopPropagation()}
                  onMouseDown={(event) => event.stopPropagation()}
                  InputProps={{ sx: { height: 34, borderRadius: 1, bgcolor: '#FFFFFF', fontSize: '0.74rem' } }}
                />
                <Button
                  variant="outlined"
                  startIcon={<AddIcon sx={{ fontSize: 15 }} />}
                  onClick={addFaultTreeNode}
                  sx={{ height: 34, borderRadius: 1.2, color: '#1251CC', borderColor: '#8DB3FF', bgcolor: '#FFFFFF', fontSize: '0.7rem', fontWeight: 850, whiteSpace: 'nowrap' }}
                >
                  ADD NODE
                </Button>
                <Button
                  variant="contained"
                  onClick={connectSelectedFaultTreeNode}
                  disabled={!canConnectSelectedFaultTreeNode}
                  sx={{ height: 34, borderRadius: 1.2, bgcolor: canConnectSelectedFaultTreeNode ? '#0B63E5' : '#D9E2F0', color: canConnectSelectedFaultTreeNode ? '#FFFFFF' : '#7A8798', boxShadow: 'none', fontSize: '0.7rem', fontWeight: 850, whiteSpace: 'nowrap', '&:hover': { bgcolor: canConnectSelectedFaultTreeNode ? '#064FC0' : '#D9E2F0' } }}
                >
                  CONNECT
                </Button>
              </Box>
            </Paper>
          </Box>

          <Box sx={{ mx: { xs: 1.4, md: 3.2 }, mb: { xs: 1.4, md: 2.2 }, flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 270px' }, gap: 1.4 }}>
            <Paper elevation={0} sx={{ position: 'relative', overflow: 'hidden', borderRadius: 1.8, bgcolor: '#F7F7F7', border: '1px solid #E1E8F5', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)' }}>
              <Box sx={{ position: 'sticky', left: 18, top: 18, zIndex: 5, display: 'inline-flex', alignItems: 'center', gap: 0.4, p: 0.35, borderRadius: 1.2, bgcolor: '#FFFFFF', border: '1px solid #D7E0F0', boxShadow: '0 8px 20px rgba(15,23,42,0.05)' }}>
                <Button size="small" sx={{ minWidth: 32, height: 28, bgcolor: '#EAF2FF', color: '#1251CC' }}>+</Button>
                <Typography sx={{ px: 1.1, color: '#475569', fontSize: '0.72rem', fontWeight: 800 }}>100%</Typography>
                <Button size="small" sx={{ minWidth: 32, height: 28, color: '#64748B' }}>-</Button>
              </Box>
              <Box sx={{ position: 'relative', width: 'min(1180px, 100%)', height: 575, mx: 0, my: 2.5 }}>
                <Box component="svg" viewBox="0 0 1180 575" preserveAspectRatio="none" sx={{ position: 'absolute', inset: 0, width: '100%', height: 575, zIndex: 0, pointerEvents: 'none' }}>
                  <defs>
                    <marker id="fault-tree-arrow-ai" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto" markerUnits="strokeWidth">
                      <path d="M 0 0 L 9 4.5 L 0 9 z" fill="#2F6BFF" />
                    </marker>
                    <marker id="fault-tree-arrow-manual" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto" markerUnits="strokeWidth">
                      <path d="M 0 0 L 9 4.5 L 0 9 z" fill="#0EA5E9" />
                    </marker>
                  </defs>
                  {faultTreeNodes.map((node) => {
                    const parent = node.parentId ? faultTreeNodes.find((candidate) => candidate.id === node.parentId) : null;
                    if (!parent) return null;
                    const nodeWidth = node.type === 'event' ? 260 : 250;
                    const parentX = parent.x - 16;
                    const parentY = parent.y + (parent.type === 'top' ? 45 : 24);
                    return (
                      <path
                        key={`${node.id}-${parent.id}`}
                        d={`M ${node.x + nodeWidth} ${node.y + 19} C ${node.x + nodeWidth + 72} ${node.y + 19}, ${parentX - 72} ${parentY}, ${parentX} ${parentY}`}
                        fill="none"
                        stroke={node.aiGenerated ? '#2F6BFF' : '#0EA5E9'}
                        strokeWidth={node.aiGenerated ? 2 : 2.4}
                        markerEnd={node.aiGenerated ? 'url(#fault-tree-arrow-ai)' : 'url(#fault-tree-arrow-manual)'}
                      />
                    );
                  })}
                </Box>

                {faultTreeNodes
                  .filter((node) => node.gate)
                  .map((node) => (
                    <Box key={`${node.id}-gate`} sx={{ position: 'absolute', left: node.x - 112, top: node.y + (node.type === 'top' ? 32 : 9), width: 58, height: 36, borderRadius: '0 999px 999px 0', bgcolor: '#EAF2FF', border: '1px solid #B8CDF9', color: '#1E3A8A', display: 'grid', placeItems: 'center', fontSize: '0.66rem', fontWeight: 900, zIndex: 1, pointerEvents: 'none' }}>
                      {node.gate}
                    </Box>
                  ))}

                {faultTreeNodes.map((node) => {
                  const isSelected = selectedFaultTreeNodeId === node.id;
                  const isTop = node.type === 'top';
                  return (
                    <Paper
                      key={node.id}
                      elevation={0}
                      onClick={() => setSelectedFaultTreeNodeId(node.id)}
                      onPointerDown={(event) => startFaultTreeNodeDrag(event, node)}
                      sx={{
                        position: 'absolute',
                        left: node.x,
                        top: node.y,
                        zIndex: isTop ? 4 : isSelected ? 6 : 3,
                        width: isTop ? 190 : node.type === 'event' ? 260 : 250,
                        minHeight: isTop ? 90 : 38,
                        borderRadius: isTop ? 2 : 1.1,
                        border: isSelected ? '2px solid #0B63E5' : `1px solid ${isTop ? '#0B63E5' : '#B8CDF9'}`,
                        bgcolor: isTop ? '#1463F3' : '#FFFFFF',
                        color: isTop ? '#FFFFFF' : '#0F3F9E',
                        boxShadow: isTop ? '0 14px 24px rgba(37,99,235,0.28)' : isSelected ? '0 12px 22px rgba(37,99,235,0.16)' : '0 8px 18px rgba(15,23,42,0.05)',
                        p: isTop ? 1.35 : 0.8,
                        cursor: dragFaultTreeNode?.nodeId === node.id ? 'grabbing' : 'grab',
                        userSelect: dragFaultTreeNode?.nodeId === node.id ? 'none' : 'text',
                      }}
                    >
                      {node.aiGenerated ? (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: isTop ? 7 : -10,
                            right: isTop ? 8 : 7,
                            width: 21,
                            height: 21,
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: isTop ? 'rgba(255,255,255,0.18)' : '#EAF2FF',
                            color: isTop ? '#FFFFFF' : '#1251CC',
                            border: isTop ? '1px solid rgba(255,255,255,0.4)' : '1px solid #8DB3FF',
                            animation: 'faultAiPulse 1.8s ease-in-out infinite',
                          }}
                        >
                          <SparkleIcon sx={{ fontSize: 13 }} />
                        </Box>
                      ) : null}
                      {isTop ? (
                        <>
                          <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, opacity: 0.82, mb: 0.35 }}>Top Event</Typography>
                          <Box
                            component="textarea"
                            value={node.label}
                            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => updateFaultTreeNodeLabel(node.id, event.target.value)}
                            placeholder="Type top event..."
                            rows={2}
                            className="editable-analysis-field"
                            onPointerDown={stopAnalysisFieldInteraction}
                            onMouseDown={stopAnalysisFieldInteraction}
                            onClick={stopAnalysisFieldInteraction}
                            onFocus={stopAnalysisFieldInteraction}
                            onKeyDown={stopAnalysisFieldInteraction}
                            sx={{
                              position: 'relative',
                              zIndex: 3,
                              width: '100%',
                              minHeight: 40,
                              border: 0,
                              outline: 'none',
                              resize: 'none',
                              cursor: 'text',
                              pointerEvents: 'auto',
                              userSelect: 'text',
                              bgcolor: 'transparent',
                              color: '#FFFFFF',
                              fontFamily: 'inherit',
                              fontSize: '0.82rem',
                              lineHeight: 1.2,
                              fontWeight: 900,
                              p: 0,
                              '&::placeholder': { color: 'rgba(255,255,255,0.74)', opacity: 1 },
                            }}
                          />
                          {node.detail ? <Typography sx={{ mt: 0.45, fontSize: '0.56rem', fontWeight: 750, opacity: 0.78 }}>{node.detail}</Typography> : null}
                        </>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Box sx={{ width: 18, height: 18, borderRadius: '50%', border: '1px solid #8DB3FF', color: '#1251CC', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 900, flexShrink: 0 }}>
                            {node.type === 'event' ? 'E' : '+'}
                          </Box>
                          <Box
                            component="textarea"
                            value={node.label}
                            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => updateFaultTreeNodeLabel(node.id, event.target.value)}
                            placeholder={node.aiGenerated ? 'Describe cause' : 'Type the cause here...'}
                            rows={1}
                            className="editable-analysis-field"
                            onPointerDown={stopAnalysisFieldInteraction}
                            onMouseDown={stopAnalysisFieldInteraction}
                            onClick={stopAnalysisFieldInteraction}
                            onFocus={stopAnalysisFieldInteraction}
                            onKeyDown={stopAnalysisFieldInteraction}
                            sx={{
                              position: 'relative',
                              zIndex: 3,
                              width: '100%',
                              minHeight: 22,
                              border: 0,
                              outline: 'none',
                              resize: 'none',
                              cursor: 'text',
                              pointerEvents: 'auto',
                              userSelect: 'text',
                              bgcolor: 'transparent',
                              color: '#0F3F9E',
                              fontFamily: 'inherit',
                              fontSize: '0.76rem',
                              lineHeight: 1.18,
                              fontWeight: 800,
                              p: 0,
                              '&::placeholder': { color: '#7EA8FF', opacity: 1 },
                              '&:focus': { color: '#063FA8' },
                            }}
                          />
                        </Box>
                      )}
                      {(node.type === 'event' || node.type === 'top') ? (
                        <IconButton
                          size="small"
                          title="Connect selected manual node here"
                          onClick={(event) => {
                            event.stopPropagation();
                            connectSelectedFaultTreeNodeTo(node.id);
                          }}
                          onPointerDown={(event) => event.stopPropagation()}
                          onMouseDown={(event) => event.stopPropagation()}
                          sx={{
                            position: 'absolute',
                            right: isTop ? 7 : 8,
                            bottom: isTop ? 7 : -12,
                            width: 23,
                            height: 23,
                            bgcolor: canConnectSelectedFaultTreeNode ? '#0B63E5' : '#EAF2FF',
                            color: canConnectSelectedFaultTreeNode ? '#FFFFFF' : '#1251CC',
                            border: '1px solid #8DB3FF',
                            boxShadow: '0 5px 12px rgba(37,99,235,0.16)',
                            '&:hover': { bgcolor: canConnectSelectedFaultTreeNode ? '#064FC0' : '#DCEBFF' },
                          }}
                        >
                          <AddIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      ) : null}
                    </Paper>
                  );
                })}
              </Box>
            </Paper>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, minHeight: 0 }}>
              <Paper elevation={0} sx={{ p: 1.35, borderRadius: 1.6, border: '1px solid #E1E8F5', bgcolor: '#FFFFFF' }}>
                <Typography sx={{ color: '#0645AD', fontSize: '0.82rem', fontWeight: 900, mb: 0.8 }}>Selected node</Typography>
                <Typography sx={{ color: '#0F172A', fontSize: '0.86rem', lineHeight: 1.25, fontWeight: 850, mb: 0.55 }}>
                  {selectedFaultTreeNode?.label}
                </Typography>
                <Typography sx={{ color: '#64748B', fontSize: '0.68rem', lineHeight: 1.35 }}>
                  {selectedFaultTreeNode?.aiGenerated ? 'Generated by BLU.AI from WO/ESO context.' : 'Manual node added by the user.'}
                </Typography>
              </Paper>
              <Paper elevation={0} sx={{ p: 1.35, borderRadius: 1.6, border: '1px solid #D7E0F0', bgcolor: '#FFFFFF' }}>
                <Typography sx={{ color: '#0645AD', fontSize: '0.82rem', fontWeight: 900, mb: 0.45 }}>
                  <SparkleIcon sx={{ fontSize: 14, color: '#F97316', mr: 0.35, verticalAlign: '-2px' }} />
                  Recommended checks
                </Typography>
                {faultTreeAiMode === 'typing' ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.65 }}>
                    <Typography sx={{ color: '#2563EB', fontSize: '0.7rem', fontWeight: 800 }}>
                      BLU.AI is typing checks from the problem description...
                    </Typography>
                    {[1, 2, 3].map((item) => (
                      <Box key={item} sx={{ height: 24, borderRadius: 1, bgcolor: '#EAF2FF', border: '1px solid #D8E6FF', animation: 'faultAiPulse 1.8s ease-in-out infinite' }} />
                    ))}
                  </Box>
                ) : (
                  <>
                    <Typography sx={{ color: '#64748B', fontSize: '0.66rem', lineHeight: 1.3, mb: 0.85 }}>
                      Based on the belt tracking description, equipment history, and RCA branches, BLU.AI suggests checking these first.
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9 }}>
                      {faultTreeRecommendedChecks.map((check) => (
                        <Box key={check} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.7 }}>
                          <CheckCircleIcon sx={{ fontSize: 15, color: '#2563EB', mt: 0.1 }} />
                          <Typography sx={{ color: '#334155', fontSize: '0.72rem', lineHeight: 1.25 }}>{check}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </>
                )}
                <Button startIcon={<AddIcon sx={{ fontSize: 15 }} />} sx={{ mt: 1, color: '#1251CC', fontSize: '0.72rem', fontWeight: 850, textTransform: 'none' }}>
                  Add recommended check
                </Button>
              </Paper>
            </Box>
          </Box>
        </Box>
        </Box>
      ) : null}

      {/* Maintenance Review Drawer */}
      {isShiftLogbookMaintenanceReviewOpen ? (
        <Box
          sx={{
            position: 'fixed',
            top: drawerTopOffset,
            right: 0,
            bottom: 'auto',
            height: drawerHeight,
            width: { xs: '100%', sm: sourceDrawerWidth },
            zIndex: 1409,
            bgcolor: '#FFFFFF',
            borderLeft: '1px solid #DCE4F2',
            boxShadow: '-12px 0 34px rgba(15,23,42,0.10)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ px: 1.35, py: 1.3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#124FC8', fontSize: '1rem', fontWeight: 800 }}>
              {reviewDetails.title || 'Maintenance Work Order'}
            </Typography>
            <IconButton size="small" onClick={closeShiftLogbookMaintenanceReview} sx={{ color: '#2F6BFF' }}>
              <CloseIcon sx={{ fontSize: 19 }} />
            </IconButton>
          </Box>

          <Box sx={{ px: 1.2, pb: 1.2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0.72, flexGrow: 1 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 0.98fr', gap: 0.65 }}>
              <TextField
                size="small"
                label="Number"
                value={reviewDetails.number}
                fullWidth
                variant="filled"
                InputProps={{ disableUnderline: true, readOnly: true, sx: { borderRadius: 2, bgcolor: '#F2F4F7', fontSize: '0.92rem' } }}
                InputLabelProps={{ shrink: true, sx: { color: '#7B8799', fontSize: '0.66rem', fontWeight: 500 } }}
              />
              <TextField
                size="small"
                label="Maintenance Work Order"
                value={reviewDetails.workOrder}
                fullWidth
                variant="filled"
                InputProps={{ disableUnderline: true, readOnly: true, sx: { borderRadius: 2, bgcolor: '#F2F4F7', fontSize: '0.92rem' } }}
                InputLabelProps={{ shrink: true, sx: { color: '#7B8799', fontSize: '0.66rem', fontWeight: 500 } }}
              />
            </Box>
            <Paper elevation={0} sx={{ p: 0.9, borderRadius: '10px', border: '1px solid #DBE8FF', bgcolor: '#F4F8FF', mb: 1 }}>
              <Typography sx={{ color: '#124FC8', fontSize: '0.8rem', fontWeight: 800, mb: 0.6 }}>OEE</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.6 }}>
                <TextField
                  size="small"
                  label="OEE"
                  value={reviewDetails.oee}
                  fullWidth
                  variant="filled"
                  InputProps={{ disableUnderline: true, readOnly: true, sx: { borderRadius: 2, bgcolor: '#FFFFFF', fontSize: '0.9rem', fontWeight: 700 } }}
                  InputLabelProps={{ shrink: true, sx: { color: '#7B8799', fontSize: '0.66rem', fontWeight: 500 } }}
                />
                <TextField
                  size="small"
                  label="Availability"
                  value={reviewDetails.availability}
                  fullWidth
                  variant="filled"
                  InputProps={{ disableUnderline: true, readOnly: true, sx: { borderRadius: 2, bgcolor: '#FFFFFF', fontSize: '0.9rem', fontWeight: 700 } }}
                  InputLabelProps={{ shrink: true, sx: { color: '#7B8799', fontSize: '0.66rem', fontWeight: 500 } }}
                />
                <TextField
                  size="small"
                  label="Performance"
                  value={reviewDetails.performance}
                  fullWidth
                  variant="filled"
                  InputProps={{ disableUnderline: true, readOnly: true, sx: { borderRadius: 2, bgcolor: '#FFFFFF', fontSize: '0.9rem', fontWeight: 700 } }}
                  InputLabelProps={{ shrink: true, sx: { color: '#7B8799', fontSize: '0.66rem', fontWeight: 500 } }}
                />
                <TextField
                  size="small"
                  label="Quality"
                  value={reviewDetails.quality}
                  fullWidth
                  variant="filled"
                  InputProps={{ disableUnderline: true, readOnly: true, sx: { borderRadius: 2, bgcolor: '#FFFFFF', fontSize: '0.9rem', fontWeight: 700 } }}
                  InputLabelProps={{ shrink: true, sx: { color: '#7B8799', fontSize: '0.66rem', fontWeight: 500 } }}
                />
              </Box>
            </Paper>
            <TextField
              size="small"
              label="Location"
              value={reviewDetails.location}
              fullWidth
              variant="filled"
              InputProps={{ disableUnderline: true, readOnly: true, sx: { borderRadius: 2, bgcolor: '#F2F4F7', fontSize: '0.92rem' } }}
              InputLabelProps={{ shrink: true, sx: { color: '#7B8799', fontSize: '0.66rem', fontWeight: 500 } }}
            />

            <TextField
              size="small"
              label="Equipment"
              value={reviewDetails.equipment}
              fullWidth
              variant="filled"
              InputProps={{ disableUnderline: true, readOnly: true, sx: { borderRadius: 2, bgcolor: '#F2F4F7', fontSize: '0.92rem' } }}
              InputLabelProps={{ shrink: true, sx: { color: '#7B8799', fontSize: '0.66rem', fontWeight: 500 } }}
            />
            <TextField
              size="small"
              label="Title"
              value={reviewDetails.title}
              fullWidth
              variant="filled"
              InputProps={{ disableUnderline: true, readOnly: true, sx: { borderRadius: 2, bgcolor: '#F2F4F7', fontSize: '0.92rem' } }}
              InputLabelProps={{ shrink: true, sx: { color: '#7B8799', fontSize: '0.66rem', fontWeight: 500 } }}
            />
            <TextField
              size="small"
              label="Description"
              value={reviewDetails.description}
              fullWidth
              multiline
              variant="filled"
              InputProps={{ disableUnderline: true, readOnly: true, sx: { borderRadius: 2, bgcolor: '#F2F4F7', fontSize: '0.92rem' } }}
              InputLabelProps={{ shrink: true, sx: { color: '#7B8799', fontSize: '0.66rem', fontWeight: 500 } }}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.65 }}>
              <TextField
                size="small"
                label="Reported by"
                value={reviewDetails.reportedBy}
                fullWidth
                variant="filled"
                InputProps={{ disableUnderline: true, readOnly: true, sx: { borderRadius: 2, bgcolor: '#F2F4F7', fontSize: '0.92rem' } }}
                InputLabelProps={{ shrink: true, sx: { color: '#7B8799', fontSize: '0.66rem', fontWeight: 500 } }}
              />
              <TextField
                size="small"
                label="Date"
                value={reviewDetails.date}
                fullWidth
                variant="filled"
                InputProps={{ disableUnderline: true, readOnly: true, sx: { borderRadius: 2, bgcolor: '#F2F4F7', fontSize: '0.92rem' } }}
                InputLabelProps={{ shrink: true, sx: { color: '#7B8799', fontSize: '0.66rem', fontWeight: 500 } }}
              />
            </Box>

            <Box sx={{ pt: 0.3 }}>
              <Typography sx={{ color: '#124FC8', fontSize: '0.95rem', fontWeight: 800, mb: 0.45 }}>Risk Assessment</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.45 }}>
                {[
                  { label: 'Downtime', value: 'Medium', color: '#F97316', bg: '#FFF1ED' },
                  { label: 'Quality', value: 'High', color: '#EF4444', bg: '#FFF1F2' },
                  { label: 'Safety', value: 'Low', color: '#16A34A', bg: '#EEF9F1' },
                ].map((risk) => (
                  <Paper key={risk.label} elevation={0} sx={{ p: 0.62, borderRadius: '4px', bgcolor: risk.bg, borderLeft: `3px solid ${risk.color}` }}>
                    <Typography sx={{ color: '#7B8799', fontSize: '0.58rem', mb: 0.16 }}>{risk.label}</Typography>
                    <Typography sx={{ color: risk.color, fontSize: '0.84rem', fontWeight: 500 }}>{risk.value}</Typography>
                  </Paper>
                ))}
              </Box>
            </Box>

            <AssistantBanner 
              message="I can suggest role, team, and shift based on workload and planner demand."
            />

            <Box sx={{ pt: 0.25 }}>
              <Typography sx={{ color: '#124FC8', fontSize: '0.95rem', fontWeight: 800, mb: 0.55 }}>Line Leader Decision</Typography>
              <Paper elevation={0} sx={{ p: 0.78, borderRadius: '8px', bgcolor: '#FFF3ED', border: '1px solid #FF8A4C', display: 'flex', alignItems: 'center', gap: 0.65 }}>
                <Switch size="small" />
                <Typography sx={{ color: '#4B5563', fontSize: '0.78rem' }}>This is a Breakdown Event Maintenance Work Order</Typography>
              </Paper>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.65 }}>
              <TextField size="small" placeholder="Assign to" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              <TextField size="small" placeholder="When" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Box>
            <FormControl size="small" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select label="Type" value="Corrective" sx={{ borderRadius: 2 }}>
                <MenuItem value="Corrective">Corrective</MenuItem>
              </Select>
            </FormControl>
            <TextField size="small" label="Note" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <FormControlLabel control={<Switch size="small" />} label="I can provide an Early Evaluation" sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.8rem', color: '#4B5563' } }} />

            <Button
              variant="text"
              startIcon={<GroupsIcon sx={{ fontSize: 16 }} />}
              sx={{ color: '#124FC8', fontSize: '0.76rem', fontWeight: 800, alignSelf: 'center' }}
            >
              REVIEW TECHNICIANS AVAILABILITY
            </Button>
          </Box>

          <Box sx={{ mt: 'auto', px: 1.05, py: 1.1, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.5 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={handleCreateIntegratedWoAction}
              sx={{ height: 34, borderRadius: '8px', borderColor: '#8DB3FF', bgcolor: '#FFFFFF', color: '#2563EB', fontWeight: 850, fontSize: '0.68rem', boxShadow: 'none' }}
            >
              CREATE ACTION
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={openShiftLogbookRcaDrawer}
              sx={{ height: 34, borderRadius: '8px', bgcolor: '#0B63E5', color: '#FFFFFF', fontWeight: 850, fontSize: '0.68rem', boxShadow: 'none', '&:hover': { bgcolor: '#064FC0' } }}
            >
              START RCA
            </Button>
            <Button size="small" variant="outlined" sx={{ height: 34, borderRadius: '8px', borderColor: '#8DB3FF', bgcolor: '#FFFFFF', color: '#2563EB', fontWeight: 850, fontSize: '0.68rem', boxShadow: 'none' }}>
              VIEW WO
            </Button>
          </Box>
        </Box>
      ) : null}

      {/* Create Action Drawer */}
      {isShiftLogbookCreateActionOpen ? (
        <Box
          sx={{
            position: 'fixed',
            top: drawerTopOffset,
            right: { xs: 0, sm: sourceDrawerWidth },
            bottom: 'auto',
            height: drawerHeight,
            width: { xs: '100%', sm: 404 },
            zIndex: 1411,
            bgcolor: '#FFFFFF',
            borderLeft: '1px solid #DCE4F2',
            boxShadow: '-12px 0 34px rgba(15,23,42,0.10)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ px: 1.6, py: 1.3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#1F2937', fontSize: '1.05rem', fontWeight: 800 }}>New Action</Typography>
            <IconButton size="small" onClick={closeShiftLogbookCreateActionDrawer} sx={{ color: '#2F6BFF' }}>
              <CloseIcon sx={{ fontSize: 19 }} />
            </IconButton>
          </Box>
          <Box sx={{ px: 1.4, pb: 1.4, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <AssistantBanner message="The remaining sections of the form will be completed in alignment with this event description." />
            <TextField
              size="small"
              multiline
              minRows={4}
              label="Description"
              placeholder="Describe the problem"
              InputProps={{
                endAdornment: (
                  <IconButton
                    edge="end"
                    onClick={() => setIsShiftLogbookActionRecording(!isShiftLogbookActionRecording)}
                    sx={{ color: '#2F6BFF' }}
                  >
                    <MicIcon />
                  </IconButton>
                ),
                sx: { borderRadius: 2 },
              }}
            />
            {isShiftLogbookActionRecording ? (
              <Paper elevation={0} sx={{ p: 1, borderRadius: 1.8, border: '1px solid #D7E2F0', bgcolor: '#F8FBFF' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>00:00</Typography>
                  <Box sx={{ flex: 1, mx: 1.2, height: 8, borderRadius: 99, bgcolor: '#DBEAFE', position: 'relative', overflow: 'hidden' }}>
                    <Box sx={{ width: '75%', height: '100%', bgcolor: '#3B82F6' }} />
                  </Box>
                  <IconButton size="small" sx={{ color: '#2F6BFF' }}>
                    <SendIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Paper>
            ) : null}
          </Box>
          <Box sx={{ mt: 'auto', px: 1.6, py: 1.2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" onClick={closeShiftLogbookCreateActionDrawer} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
              Cancel
            </Button>
            <Button variant="contained" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
              Proceed
            </Button>
          </Box>
        </Box>
      ) : null}
    </>
  );
};

export default ShiftLogbookDrawers;
