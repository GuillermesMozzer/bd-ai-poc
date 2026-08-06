import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  IconButton,
  Chip,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Snackbar,
  Alert,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  CompareArrows as CompareIcon,
  RestoreFromTrash as RestoreIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Archive as ArchiveIcon,
  Block as ObsoleteIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  AutoAwesome as SparkleIcon,
  MoreVert as MoreVertIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Publish as PublishIcon,
  Draw as DrawIcon,
} from '@mui/icons-material';

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type LifecycleState =
  | 'Draft'
  | 'In Review'
  | 'Approved'
  | 'Published'
  | 'Archived'
  | 'Obsolete';

interface VersionEntry {
  id: string;
  version: string;
  versionNum: number;
  lifecycle: LifecycleState;
  author: string;
  authorInitials: string;
  authorColor: string;
  date: string;
  effectiveDate: string;
  changeReason: string;
  changeSummary: string[];
  linesAdded: number;
  linesRemoved: number;
  isCurrent: boolean;
}

interface CheckoutInfo {
  isCheckedOut: boolean;
  lockedBy: string;
  lockedByInitials: string;
  lockedSince: string;
}

// â”€â”€â”€ Mock Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const mockVersions: VersionEntry[] = [
  {
    id: 'v5', version: 'v5', versionNum: 5, lifecycle: 'Published',
    author: 'Chris Klopp', authorInitials: 'CK', authorColor: '#FF6E00',
    date: '2026-04-05 09:15', effectiveDate: '2026-04-01',
    changeReason: 'Final approval from Director and Quality Compliance.',
    changeSummary: ['Updated max temperature threshold (Section 2.4)', 'Added sensor calibration notice', 'Updated emergency shutdown procedure'],
    linesAdded: 12, linesRemoved: 5, isCurrent: true,
  },
  {
    id: 'v4', version: 'v4', versionNum: 4, lifecycle: 'Archived',
    author: 'Marcus Chen', authorInitials: 'MC', authorColor: '#9c27b0',
    date: '2026-03-28 14:20', effectiveDate: '2026-01-15',
    changeReason: 'Updated Section 4.5 regarding machinery safety protocols.',
    changeSummary: ['Updated protocols for Line 2', 'Corrected typos in appendix'],
    linesAdded: 3, linesRemoved: 3, isCurrent: false,
  },
  {
    id: 'v3', version: 'v3', versionNum: 3, lifecycle: 'Archived',
    author: 'Sarah Jenkins', authorInitials: 'SJ', authorColor: '#044ED7',
    date: '2026-01-10 11:05', effectiveDate: '2025-10-01',
    changeReason: 'Initial handbook draft after ISO audit recommendations.',
    changeSummary: ['Drafted core policies', 'Added risk assessment'],
    linesAdded: 48, linesRemoved: 21, isCurrent: false,
  },
  {
    id: 'v2', version: 'v2', versionNum: 2, lifecycle: 'Archived',
    author: 'Marcus Chen', authorInitials: 'MC', authorColor: '#9c27b0',
    date: '2025-09-15 16:30', effectiveDate: '2025-07-01',
    changeReason: 'Quarterly policy updates on remote work.',
    changeSummary: ['Revised remote work policy'],
    linesAdded: 8, linesRemoved: 4, isCurrent: false,
  },
  {
    id: 'v1', version: 'v1', versionNum: 1, lifecycle: 'Archived',
    author: 'Chris Klopp', authorInitials: 'CK', authorColor: '#FF6E00',
    date: '2025-06-20 09:00', effectiveDate: '2025-06-25',
    changeReason: 'Baseline legacy document migration.',
    changeSummary: ['Initial document upload'],
    linesAdded: 6, linesRemoved: 2, isCurrent: false,
  },
];

const lifecycleConfig: Record<LifecycleState, { color: string; bg: string; icon: React.ReactNode; description: string; label?: string }> = {
  Draft:      { color: '#044ED7', bg: '#EBEDF0', icon: <EditIcon sx={{ fontSize: 14 }} />, description: 'Document is being authored.' },
  'In Review': { color: '#FF6E00', bg: '#fff3e0', icon: <PendingIcon sx={{ fontSize: 14 }} />, description: 'Pending review & approval.', label: 'Review' },
  Approved:   { color: '#1b5e20', bg: '#e8f5e9', icon: <CheckCircleIcon sx={{ fontSize: 14 }} />, description: 'Approved, not yet published.', label: 'Approval' },
  Published:  { color: '#006064', bg: '#e0f7fa', icon: <PublishIcon sx={{ fontSize: 14 }} />, description: 'Active â€” accessible to all.' },
  Archived:   { color: '#616161', bg: '#f5f5f5', icon: <ArchiveIcon sx={{ fontSize: 14 }} />, description: 'No longer active, kept for records.' },
  Obsolete:   { color: '#b71c1c', bg: '#ffebee', icon: <ObsoleteIcon sx={{ fontSize: 14 }} />, description: 'Superseded â€” must not be used.' },
};

// Lifecycle transition rules: what actions are available per state
const transitions: Record<LifecycleState, { label: string; nextState: LifecycleState; color: 'primary' | 'success' | 'warning' | 'error' | 'inherit' }[]> = {
  Draft:       [{ label: 'Submit for Review', nextState: 'In Review', color: 'primary' }],
  'In Review': [{ label: 'Approve', nextState: 'Approved', color: 'success' }, { label: 'Reject', nextState: 'Draft', color: 'error' }],
  Approved:    [{ label: 'Publish', nextState: 'Published', color: 'success' }],
  Published:   [{ label: 'Archive', nextState: 'Archived', color: 'warning' }],
  Archived:    [{ label: 'Mark Obsolete', nextState: 'Obsolete', color: 'error' }],
  Obsolete:    [],
};

// Diff content for comparison (mock)
const mockDiffLines = [
  { type: 'context', text: '1. Purpose' },
  { type: 'context', text: 'This document outlines the standard operation for the Autoguard system on Line 2.' },
  { type: 'context', text: '' },
  { type: 'context', text: '2. Limits and Thresholds' },
  { type: 'removed', text: 'Max Temperature: 70Â°C' },
  { type: 'added',   text: 'Max Temperature: 65Â°C' },
  { type: 'removed', text: 'Min Pressure: 2.0 bar' },
  { type: 'added',   text: 'Min Pressure: 2.2 bar' },
  { type: 'context', text: '' },
  { type: 'context', text: '3. PPE Requirements' },
  { type: 'context', text: 'Operators must wear safety glasses and gloves at all times.' },
  { type: 'added',   text: 'Glove specification: EN ISO 374-1:2016 Type B or higher.' },
  { type: 'context', text: '' },
  { type: 'context', text: '4. Emergency Shutdown' },
  { type: 'removed', text: 'Press red E-Stop button and notify supervisor.' },
  { type: 'added',   text: 'Press red E-Stop button, notify supervisor, and log incident in IMS within 1 hour.' },
  { type: 'context', text: '' },
  { type: 'added',   text: '5. Sensor Calibration Notice' },
  { type: 'added',   text: 'Primary sensor units must be calibrated per CAL-SOP-012 every 90 days.' },
];

// â”€â”€â”€ Props â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface DocumentVersionHistoryScreenProps {
  onBack: () => void;
  documentName?: string;
  documentId?: string;
  onSignClick?: () => void;
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function DocumentVersionHistoryScreen({
  onBack,
  documentName = 'Employee Handbook.docx',
  documentId = 'DOC-2',
  onSignClick,
}: DocumentVersionHistoryScreenProps) {
  const [versions, setVersions] = useState<VersionEntry[]>(mockVersions);
  const [currentState, setCurrentState] = useState<LifecycleState>('Published');
  const [checkout, setCheckout] = useState<CheckoutInfo>({
    isCheckedOut: false, lockedBy: 'Chris Klopp', lockedByInitials: 'CK', lockedSince: '10:30 AM',
  });
  const [selectedVersion, setSelectedVersion] = useState<string>('v5');

  // Modals
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareLeft, setCompareLeft] = useState('v9');
  const [compareRight, setCompareRight] = useState('v10');
  const [rollbackOpen, setRollbackOpen] = useState(false);
  const [rollbackTarget, setRollbackTarget] = useState<VersionEntry | null>(null);
  const [rollbackReason, setRollbackReason] = useState('');
  const [transitionOpen, setTransitionOpen] = useState(false);
  const [pendingTransition, setPendingTransition] = useState<{ label: string; nextState: LifecycleState } | null>(null);
  const [transitionComment, setTransitionComment] = useState('');

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'info' | 'warning' | 'error' });
  const showSnackbar = (message: string, severity: 'success' | 'info' | 'warning' | 'error' = 'success') =>
    setSnackbar({ open: true, message, severity });

  // Days until next review
  const daysUntilReview = 42;
  const reviewFrequencyDays = 365;
  const reviewProgress = Math.round(((reviewFrequencyDays - daysUntilReview) / reviewFrequencyDays) * 100);

  // Handle checkout toggle
  const handleCheckout = () => {
    if (checkout.isCheckedOut) {
      setCheckout(prev => ({ ...prev, isCheckedOut: false }));
      showSnackbar('Document checked in successfully. Others can now edit.', 'success');
    } else {
      setCheckout(prev => ({ ...prev, isCheckedOut: true, lockedSince: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }));
      showSnackbar('Document checked out â€” exclusively locked for editing.', 'info');
    }
  };

  // Handle rollback
  const handleRollbackConfirm = () => {
    if (!rollbackTarget || !rollbackReason.trim()) return;
    const newVersion: VersionEntry = {
      id: 'v6', version: 'v6', versionNum: 6, lifecycle: 'Draft',
      author: 'You', authorInitials: 'YO', authorColor: '#044ED7',
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      effectiveDate: '',
      changeReason: `Rollback to ${rollbackTarget.version}: ${rollbackReason}`,
      changeSummary: [`Content restored from ${rollbackTarget.version}`],
      linesAdded: 0, linesRemoved: 0, isCurrent: true,
    };
    setVersions(prev => [newVersion, ...prev.map(v => ({ ...v, isCurrent: false }))]);
    setCurrentState('Draft');
    setRollbackOpen(false);
    setRollbackReason('');
    showSnackbar(`Rolled back to ${rollbackTarget.version}. New draft v11 created.`, 'success');
  };

  // Handle lifecycle transition
  const handleTransitionConfirm = () => {
    if (!pendingTransition) return;
    setVersions(prev => prev.map((v, i) => i === 0 ? { ...v, lifecycle: pendingTransition.nextState } : v));
    setCurrentState(pendingTransition.nextState);
    setTransitionOpen(false);
    setTransitionComment('');
    showSnackbar(`Document state changed to "${pendingTransition.nextState}".`, 'success');
  };

  const cfg = lifecycleConfig[currentState];
  const availableTransitions = transitions[currentState];
  const currentVersionEntry = versions[0];

  return (
    <Box sx={{ 
      flexGrow: 1, 
      bgcolor: '#EBEDF0', // Muted slate background
      backgroundImage: 'radial-gradient(at 0% 0%, rgba(0, 122, 255, 0.05) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(0, 122, 255, 0.03) 0px, transparent 50%)',
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      overflow: 'hidden',
      fontFamily: '"Inter", sans-serif'
    }}>

      {/* â•â•â• TOP BAR (Liquid Glass) â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Box sx={{ 
        m: 2,
        px: 3, 
        py: 1.5, 
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: 4,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        flexWrap: 'wrap',
        zIndex: 10
      }}>
        <IconButton onClick={onBack} size="small" sx={{ bgcolor: 'rgba(0,0,0,0.03)', '&:hover': { bgcolor: 'rgba(0,0,0,0.07)' }, mr: 1 }}>
          <ArrowBackIcon sx={{ fontSize: 20 }} />
        </IconButton>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1F2366', lineHeight: 1.2, letterSpacing: '-0.02em' }}>{documentName}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Typography variant="body2" sx={{ color: '#626465', fontWeight: 600 }}>{documentId}</Typography>
            <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
            <Typography variant="body2" sx={{ color: '#626465', fontWeight: 600 }}>{versions.length} versions tracked</Typography>
          </Box>
        </Box>

        {/* Lifecycle state badge + transitions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            icon={<Box sx={{ display: 'flex', pl: 0.5 }}>{cfg.icon}</Box>}
            label={currentState}
            sx={{ 
              bgcolor: cfg.bg, 
              color: cfg.color, 
              fontWeight: 700, 
              fontSize: '0.75rem', 
              height: 32, 
              borderRadius: 2, 
              border: `1px solid ${cfg.color}30`,
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 4px 8px ${cfg.color}20` }
            }}
          />
          {availableTransitions.map(t => (
            <Button
              key={t.label}
              size="small"
              variant="outlined"
              color={t.color}
              onClick={() => { setPendingTransition(t); setTransitionOpen(true); }}
              sx={{ 
                whiteSpace: 'nowrap', 
                height: 32, 
                borderRadius: 2, 
                textTransform: 'none', 
                fontWeight: 600,
                borderWidth: 1.5,
                '&:hover': { borderWidth: 1.5, bgcolor: `${t.color === 'primary' ? '#1D74FF10' : t.color + '10'}` }
              }}
            >
              {t.label}
            </Button>
          ))}
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 24, alignSelf: 'center' }} />

        {/* Check-out button */}
        <Tooltip title={checkout.isCheckedOut ? `Checked out by ${checkout.lockedBy} since ${checkout.lockedSince}` : 'Check out to lock for editing'}>
          <Button
            size="small"
            variant={checkout.isCheckedOut ? 'contained' : 'outlined'}
            color={checkout.isCheckedOut ? 'warning' : 'inherit'}
            startIcon={checkout.isCheckedOut ? <LockIcon sx={{ fontSize: 18 }} /> : <LockOpenIcon sx={{ fontSize: 18 }} />}
            onClick={handleCheckout}
            sx={{ 
              whiteSpace: 'nowrap', 
              height: 32, 
              borderRadius: 2, 
              textTransform: 'none', 
              fontWeight: 600,
              px: 2,
              boxShadow: checkout.isCheckedOut ? '0 4px 12px rgba(237, 108, 2, 0.2)' : 'none'
            }}
          >
            {checkout.isCheckedOut ? 'Check In' : 'Check Out'}
          </Button>
        </Tooltip>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            size="small" 
            variant="outlined" 
            startIcon={<CompareIcon />} 
            onClick={() => setCompareOpen(true)} 
            sx={{ height: 32, borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: '#DBDDDF', color: '#626465' }}
          >
            Compare
          </Button>
          <Button 
            size="small" 
            variant="outlined" 
            startIcon={<DownloadIcon />} 
            onClick={() => showSnackbar('Download started', 'info')} 
            sx={{ height: 32, borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: '#DBDDDF', color: '#626465' }}
          >
            Download
          </Button>
          {onSignClick && (
            <Button
              size="small"
              variant="contained"
              startIcon={<DrawIcon />}
              onClick={onSignClick}
              sx={{ 
                height: 32, 
                borderRadius: 2,
                textTransform: 'none',
                bgcolor: '#1D74FF', 
                '&:hover': { bgcolor: '#0062CC' }, 
                fontWeight: 700, 
                boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)' 
              }}
            >
              Signatures
            </Button>
          )}
        </Box>
      </Box>

      {/* â•â•â• MAIN CONTENT â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden', px: 2, pb: 2, gap: 2 }}>

        {/* LEFT â€” Spatial Version History Timeline */}
        <Box sx={{ 
          width: 380, 
          minWidth: 380, 
          bgcolor: 'rgba(255, 255, 255, 0.6)', 
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.3)', 
          borderRadius: 4,
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
        }}>
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: 'rgba(0, 122, 255, 0.1)', display: 'flex' }}>
              <HistoryIcon sx={{ fontSize: 18, color: '#1D74FF' }} />
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1F2366', letterSpacing: '-0.01em' }}>Version History</Typography>
          </Box>

          <Box sx={{ overflowY: 'auto', flexGrow: 1, p: 1.5, scrollbarWidth: 'thin' }}>
            {versions.map((v, idx) => {
              const vcfg = lifecycleConfig[v.lifecycle];
              const isSelected = selectedVersion === v.id;
              
              return (
                <Box
                  key={v.id}
                  onClick={() => setSelectedVersion(v.id)}
                  sx={{
                    display: 'flex', 
                    mb: 1,
                    borderRadius: 3,
                    cursor: 'pointer',
                    bgcolor: isSelected ? 'white' : 'transparent',
                    border: '1px solid',
                    borderColor: isSelected ? 'rgba(0, 122, 255, 0.15)' : 'transparent',
                    boxShadow: isSelected ? '0 10px 25px rgba(0, 122, 255, 0.08)' : 'none',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    '&:hover': { 
                      bgcolor: isSelected ? 'white' : 'rgba(255,255,255,0.4)',
                      transform: isSelected ? 'none' : 'translateX(4px)'
                    },
                    overflow: 'hidden'
                  }}
                >
                  {/* Selected Indicator Pill */}
                  {isSelected && (
                    <Box sx={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 4, bgcolor: '#1D74FF', borderRadius: '0 4px 4px 0' }} />
                  )}

                  {/* Timeline Graphic */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 2, pt: 2.5 }}>
                    <Box sx={{
                      width: 32, 
                      height: 32, 
                      borderRadius: '50%',
                      bgcolor: isSelected ? '#1D74FF' : v.isCurrent ? '#e0f2fe' : 'white',
                      border: '2px solid',
                      borderColor: isSelected ? '#1D74FF' : v.isCurrent ? '#1D74FF' : '#DBDDDF',
                      color: isSelected ? 'white' : v.isCurrent ? '#1D74FF' : '#808285',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: 800, 
                      fontSize: '0.75rem', 
                      zIndex: 1,
                      boxShadow: isSelected ? '0 0 15px rgba(0, 122, 255, 0.3)' : 'none'
                    }}>
                      {v.version.replace('v', '')}
                    </Box>
                    {idx < versions.length - 1 && (
                      <Box sx={{ width: 2, flexGrow: 1, minHeight: 40, bgcolor: '#DBDDDF', my: 0.5, borderRadius: 1 }} />
                    )}
                  </Box>

                  {/* Version info */}
                  <Box sx={{ flexGrow: 1, py: 2.5, pr: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isSelected ? '#1F2366' : '#1F2366' }}>Version {v.version.replace('v', '')}</Typography>
                        {v.isCurrent && (
                          <Chip label="LATEST" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 900, bgcolor: '#1D74FF15', color: '#1D74FF', borderRadius: 1, border: '1px solid #1D74FF30' }} />
                        )}
                      </Box>
                      <Chip
                        icon={<Box sx={{ display: 'flex', ml: 0.5 }}>{vcfg.icon}</Box>}
                        label={v.lifecycle}
                        size="small"
                        sx={{ height: 22, fontSize: '0.65rem', fontWeight: 700, color: vcfg.color, bgcolor: vcfg.bg, borderRadius: 1, border: `1px solid ${vcfg.color}20` }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Avatar sx={{ width: 20, height: 20, fontSize: 9, fontWeight: 700, bgcolor: v.authorColor, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{v.authorInitials}</Avatar>
                      <Typography variant="caption" sx={{ color: '#626465', fontWeight: 600 }}>{v.author}</Typography>
                      <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                      <Typography variant="caption" sx={{ color: '#808285' }}>{v.date.split(' ')[0]}</Typography>
                    </Box>

                    <Typography variant="caption" sx={{ 
                      color: '#626465', 
                      display: '-webkit-box', 
                      WebkitLineClamp: 2, 
                      WebkitBoxOrient: 'vertical', 
                      overflow: 'hidden', 
                      lineHeight: 1.5,
                      fontWeight: 500,
                      mb: 1
                    }}>
                      {v.changeReason}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: '#00AF95', fontWeight: 800 }}>+{v.linesAdded}</Typography>
                        <Typography variant="caption" sx={{ color: '#E43B46', fontWeight: 800 }}>âˆ’{v.linesRemoved}</Typography>
                      </Box>
                      {!v.isCurrent && isSelected && (
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<RestoreIcon sx={{ fontSize: 14 }} />}
                          onClick={(e) => { e.stopPropagation(); setRollbackTarget(v); setRollbackOpen(true); }}
                          sx={{ 
                            p: 0, 
                            fontSize: '0.7rem', 
                            color: '#1D74FF', 
                            minWidth: 0, 
                            height: 20, 
                            textTransform: 'none', 
                            fontWeight: 700,
                            '&:hover': { bgcolor: 'transparent', color: '#0056b3', textDecoration: 'underline' }
                          }}
                        >
                          Restore version
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* RIGHT â€” Version Detail Content */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', gap: 2 }}>
          {(() => {
            const v = versions.find(ver => ver.id === selectedVersion) || versions[0];
            const vcfg = lifecycleConfig[v.lifecycle];
            
            return (
              <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, pr: 0.5, scrollbarWidth: 'thin' }}>

                {/* Checkout Banner */}
                {checkout.isCheckedOut && (
                  <Paper sx={{ 
                    p: 2, 
                    bgcolor: 'rgba(255, 248, 225, 0.7)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid #ffe082', 
                    borderRadius: 4, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    boxShadow: '0 4px 15px rgba(245, 127, 23, 0.05)'
                  }} elevation={0}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#fff3e0', display: 'flex' }}>
                      <LockIcon sx={{ color: '#f57f17' }} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400e' }}>Document Currently Locked</Typography>
                      <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 500 }}>
                        Locked by <strong>You</strong> since {checkout.lockedSince}. You have exclusive editing rights.
                      </Typography>
                    </Box>
                    <Button 
                      size="small" 
                      variant="contained" 
                      color="warning" 
                      onClick={handleCheckout}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, boxShadow: '0 4px 10px rgba(245, 127, 23, 0.2)' }}
                    >
                      Check In Now
                    </Button>
                  </Paper>
                )}

                {/* Main Version Identity Card */}
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 5, 
                  bgcolor: 'white',
                  border: '1px solid rgba(0,0,0,0.05)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2.5
                }} elevation={0}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ 
                        width: 56, 
                        height: 56, 
                        borderRadius: 3, 
                        bgcolor: 'rgba(0, 122, 255, 0.05)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: '#1D74FF',
                        border: '1.5px solid rgba(0, 122, 255, 0.1)'
                      }}>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>{v.version.replace('v', '')}</Typography>
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                          <Typography variant="h5" sx={{ fontWeight: 900, color: '#1F2366', letterSpacing: '-0.02em' }}>Version {v.version.replace('v', '')}</Typography>
                          <Chip
                            icon={<Box sx={{ display: 'flex', pl: 0.5 }}>{vcfg.icon}</Box>}
                            label={v.lifecycle}
                            sx={{ 
                              bgcolor: vcfg.bg, 
                              color: vcfg.color, 
                              fontWeight: 800, 
                              fontSize: '0.7rem', 
                              height: 24, 
                              borderRadius: 1.5,
                              border: `1px solid ${vcfg.color}30`
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 22, height: 22, fontSize: 10, fontWeight: 700, bgcolor: v.authorColor }}>{v.authorInitials}</Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{v.author}</Typography>
                          <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                          <Typography variant="caption" sx={{ color: '#626465', fontWeight: 500 }}>Published on {v.date}</Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <Tooltip title="Download this version">
                        <IconButton sx={{ border: '1px solid #DBDDDF', borderRadius: 2 }}><DownloadIcon sx={{ fontSize: 20 }} /></IconButton>
                      </Tooltip>
                      <Tooltip title="View full history log">
                        <IconButton sx={{ border: '1px solid #DBDDDF', borderRadius: 2 }}><MoreVertIcon sx={{ fontSize: 20 }} /></IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box sx={{ 
                    p: 2.5, 
                    borderRadius: 3, 
                    bgcolor: '#EBEDF0', 
                    border: '1px solid #EBEDF0',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: '#1D74FF' }} />
                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: '#1D74FF', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Change Intent
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1F2366', lineHeight: 1.6, fontStyle: 'italic', position: 'relative' }}>
                      â€œ{v.changeReason}â€
                    </Typography>
                  </Box>
                </Paper>

                {/* Bento Grid Stats */}
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ 
                      p: 2.5, 
                      borderRadius: 4, 
                      border: '1px solid rgba(0,0,0,0.05)', 
                      height: '100%',
                      bgcolor: 'white',
                      transition: 'all 0.3s',
                      '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }
                    }} elevation={0}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(0, 122, 255, 0.05)', color: '#1D74FF', display: 'flex' }}>
                          <CalendarIcon sx={{ fontSize: 18 }} />
                        </Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#626465' }}>Compliance Date</Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: v.effectiveDate ? '#1F2366' : '#808285', letterSpacing: '-0.01em' }}>
                        {v.effectiveDate || 'TBD'}
                      </Typography>
                      {v.isCurrent && (
                        <Button size="small" variant="text" sx={{ mt: 1.5, p: 0, fontSize: '0.75rem', textTransform: 'none', fontWeight: 700, color: '#1D74FF' }}>
                          Update Effective Date
                        </Button>
                      )}
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ 
                      p: 2.5, 
                      borderRadius: 4, 
                      border: '1px solid rgba(0,0,0,0.05)', 
                      height: '100%',
                      bgcolor: 'white',
                      transition: 'all 0.3s',
                      '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }
                    }} elevation={0}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: daysUntilReview < 30 ? 'rgba(239, 68, 68, 0.05)' : 'rgba(0, 122, 255, 0.05)', color: daysUntilReview < 30 ? '#E43B46' : '#1D74FF', display: 'flex' }}>
                          <ScheduleIcon sx={{ fontSize: 18 }} />
                        </Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#626465' }}>Lifecycle Outlook</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: daysUntilReview < 30 ? '#E43B46' : '#1F2366' }}>
                          {daysUntilReview} days
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#808285', fontWeight: 600 }}>remaining</Typography>
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#626465' }}>SOP Validity</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: daysUntilReview < 30 ? '#E43B46' : '#1D74FF' }}>{reviewProgress}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={reviewProgress}
                          sx={{
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: '#EBEDF0',
                            '& .MuiLinearProgress-bar': { 
                              bgcolor: daysUntilReview < 30 ? '#E43B46' : '#1D74FF', 
                              borderRadius: 4,
                              backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, transparent 100%)'
                            }
                          }}
                        />
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ 
                      p: 2.5, 
                      borderRadius: 4, 
                      border: '1px solid rgba(0,0,0,0.05)', 
                      height: '100%',
                      bgcolor: 'white',
                      transition: 'all 0.3s',
                      '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }
                    }} elevation={0}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.05)', color: '#00AF95', display: 'flex' }}>
                          <SparkleIcon sx={{ fontSize: 18 }} />
                        </Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#626465' }}>Structural Impact</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 900, color: '#00AF95' }}>+{v.linesAdded}</Typography>
                          <Typography variant="caption" sx={{ color: '#808285', fontWeight: 700, textTransform: 'uppercase' }}>Additions</Typography>
                        </Box>
                        <Box sx={{ width: 1, bgcolor: '#EBEDF0' }} />
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 900, color: '#E43B46' }}>âˆ’{v.linesRemoved}</Typography>
                          <Typography variant="caption" sx={{ color: '#808285', fontWeight: 700, textTransform: 'uppercase' }}>Removals</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Detailed Changes & Flow */}
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, lg: 7 }}>
                    <Paper sx={{ 
                      p: 3, 
                      borderRadius: 5, 
                      border: '1px solid rgba(0,0,0,0.05)',
                      height: '100%',
                      bgcolor: 'white'
                    }} elevation={0}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1F2366', mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        Detailed Change Points
                        <Chip label={`${v.changeSummary.length} points`} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#EBEDF0' }} />
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {v.changeSummary.map((line, i) => (
                          <Box key={i} sx={{ 
                            display: 'flex', 
                            alignItems: 'flex-start', 
                            gap: 1.5,
                            p: 1.5,
                            borderRadius: 2.5,
                            bgcolor: '#EBEDF0',
                            border: '1px solid transparent',
                            '&:hover': { bgcolor: 'white', borderColor: '#DBDDDF', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }
                          }}>
                            <Box sx={{ 
                              width: 20, 
                              height: 20, 
                              borderRadius: '50%', 
                              bgcolor: 'white', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                              flexShrink: 0,
                              mt: 0.25
                            }}>
                              <CheckIcon sx={{ fontSize: 12, color: '#00AF95' }} />
                            </Box>
                            <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6, fontWeight: 500 }}>{line}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, lg: 5 }}>
                    <Paper sx={{ 
                      p: 3, 
                      borderRadius: 5, 
                      border: '1px solid rgba(0,0,0,0.05)',
                      height: '100%',
                      bgcolor: 'white'
                    }} elevation={0}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1F2366', mb: 3 }}>Workflow Journey</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
                        {(['Draft', 'In Review', 'Approved', 'Published', 'Archived', 'Obsolete'] as LifecycleState[]).map((state, i, arr) => {
                          const sCfg = lifecycleConfig[state];
                          const selectedLifecycle = v.lifecycle;
                          const isActive = state === selectedLifecycle;
                          const isPast = (['Draft', 'In Review', 'Approved', 'Published', 'Archived', 'Obsolete'] as LifecycleState[]).indexOf(selectedLifecycle) > i;
                          
                          return (
                            <Box key={state} sx={{ display: 'flex', gap: 2.5 }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Box sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  borderRadius: '50%', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  bgcolor: isActive ? sCfg.color : isPast ? '#1D74FF10' : '#EBEDF0',
                                  border: '2px solid',
                                  borderColor: isActive ? sCfg.color : isPast ? '#1D74FF40' : '#DBDDDF',
                                  transition: 'all 0.3s',
                                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                                  boxShadow: isActive ? `0 0 15px ${sCfg.color}40` : 'none',
                                  zIndex: 2
                                }}>
                                  <Box sx={{ color: isActive ? 'white' : isPast ? '#1D74FF' : '#808285', display: 'flex', fontSize: 16 }}>
                                    {isPast ? <CheckCircleIcon sx={{ fontSize: 18 }} /> : sCfg.icon}
                                  </Box>
                                </Box>
                                {i < arr.length - 1 && (
                                  <Box sx={{ 
                                    width: 2, 
                                    flexGrow: 1, 
                                    minHeight: 30,
                                    bgcolor: isPast ? '#1D74FF' : '#EBEDF0', 
                                    borderStyle: isPast ? 'solid' : 'dashed',
                                    borderWidth: isPast ? 0 : 2,
                                    borderColor: isPast ? 'transparent' : '#DBDDDF'
                                  }} />
                                )}
                              </Box>
                              <Box sx={{ pb: i === arr.length - 1 ? 0 : 3 }}>
                                <Typography sx={{ 
                                  fontSize: '0.85rem', 
                                  fontWeight: isActive ? 800 : 700, 
                                  color: isActive ? sCfg.color : isPast ? '#1F2366' : '#808285',
                                  mb: 0.5
                                }}>
                                  {sCfg.label || state}
                                </Typography>
                                {isActive && (
                                  <Typography variant="caption" sx={{ color: '#626465', fontWeight: 500 }}>
                                    {sCfg.description}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>

              </Box>
            );
          })()}
        </Box>
      </Box>


      {/* â•â•â• COMPARE MODAL â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Dialog 
        open={compareOpen} 
        onClose={() => setCompareOpen(false)} 
        maxWidth="lg" 
        fullWidth 
        PaperProps={{ 
          sx: { 
            borderRadius: 5, 
            height: '85vh',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          } 
        }}
      >
        <DialogTitle sx={{ p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(0, 122, 255, 0.1)', color: '#1D74FF', display: 'flex' }}>
              <CompareIcon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1F2366', letterSpacing: '-0.02em' }}>Version Comparison Analysis</Typography>
          </Box>
          <IconButton size="small" onClick={() => setCompareOpen(false)} sx={{ bgcolor: '#EBEDF0' }}><CloseIcon sx={{ fontSize: 20 }} /></IconButton>
        </DialogTitle>

        <Box sx={{ px: 3, pb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Base Version</InputLabel>
            <Select label="Base Version" value={compareLeft} onChange={e => setCompareLeft(e.target.value)}>
              {versions.map(v => <MenuItem key={v.id} value={v.id}>{v.version} â€” {v.date.slice(0, 10)}</MenuItem>)}
            </Select>
          </FormControl>
          <CompareIcon sx={{ color: '#9e9e9e' }} />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Compare With</InputLabel>
            <Select label="Compare With" value={compareRight} onChange={e => setCompareRight(e.target.value)}>
              {versions.map(v => <MenuItem key={v.id} value={v.id}>{v.version} â€” {v.date.slice(0, 10)}</MenuItem>)}
            </Select>
          </FormControl>

          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, bgcolor: '#c8e6c9', borderRadius: 0.5 }} />
              <Typography variant="caption">Added</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, bgcolor: '#ffcdd2', borderRadius: 0.5 }} />
              <Typography variant="caption">Removed</Typography>
            </Box>
          </Box>
        </Box>

        <DialogContent sx={{ p: 0, display: 'flex', overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
            {/* Left panel */}
            <Box sx={{ flex: 1, borderRight: '1px solid #e0e0e0', overflow: 'auto' }}>
              <Box sx={{ px: 2, py: 1, bgcolor: '#fafafa', borderBottom: '1px solid #e0e0e0', position: 'sticky', top: 0 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#E43B46' }}>
                  {versions.find(v => v.id === compareLeft)?.version} (older)
                </Typography>
              </Box>
              <Box sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {mockDiffLines.map((line, i) => (
                  <Box key={i} sx={{
                    px: 2, py: 0.25,
                    bgcolor: line.type === 'removed' ? '#ffebee' : 'transparent',
                    color: line.type === 'removed' ? '#E43B46' : '#333',
                    textDecoration: line.type === 'removed' ? 'line-through' : 'none',
                    display: line.type === 'added' ? 'none' : 'block',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {line.type === 'removed' && <Typography component="span" variant="caption" sx={{ mr: 1, opacity: 0.5 }}>âˆ’</Typography>}
                    {line.text || ' '}
                  </Box>
                ))}
              </Box>
            </Box>
            {/* Right panel */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <Box sx={{ px: 2, py: 1, bgcolor: '#fafafa', borderBottom: '1px solid #e0e0e0', position: 'sticky', top: 0 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#00AF95' }}>
                  {versions.find(v => v.id === compareRight)?.version} (newer)
                </Typography>
              </Box>
              <Box sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {mockDiffLines.map((line, i) => (
                  <Box key={i} sx={{
                    px: 2, py: 0.25,
                    bgcolor: line.type === 'added' ? '#e8f5e9' : 'transparent',
                    color: line.type === 'added' ? '#00AF95' : '#333',
                    display: line.type === 'removed' ? 'none' : 'block',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {line.type === 'added' && <Typography component="span" variant="caption" sx={{ mr: 1, opacity: 0.5 }}>+</Typography>}
                    {line.text || ' '}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, px: 3, borderTop: '1px solid rgba(0,0,0,0.05)', bgcolor: 'rgba(248, 250, 252, 0.5)' }}>
          <Button 
            onClick={() => setCompareOpen(false)} 
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, color: '#626465' }}
          >
            Close Comparison
          </Button>
        </DialogActions>
      </Dialog>

      {/* â•â•â• ROLLBACK MODAL â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Dialog 
        open={rollbackOpen} 
        onClose={() => setRollbackOpen(false)} 
        maxWidth="sm" 
        fullWidth 
        PaperProps={{ 
          sx: { 
            borderRadius: 5,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
          } 
        }}
      >
        <DialogTitle sx={{ p: 3, pb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(237, 108, 2, 0.1)', color: '#ed6c02', display: 'flex' }}>
            <WarningIcon />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1F2366', letterSpacing: '-0.02em' }}>Restore Version {rollbackTarget?.version}</Typography>
        </DialogTitle>
        <DialogContent>
          <Paper sx={{ p: 2, bgcolor: '#fff8e1', border: '1px solid #ffe082', borderRadius: 2, mb: 3 }}>
            <Typography variant="body2" sx={{ color: '#5d4037' }}>
              This will create a new version <strong>v{(versions[0]?.versionNum || 10) + 1}</strong> with the content of <strong>{rollbackTarget?.version}</strong>. 
              The current version <strong>{versions[0]?.version}</strong> will not be deleted â€” it remains in the history.
            </Typography>
          </Paper>
          <TextField
            label="Reason for Rollback *"
            placeholder="Explain why you are restoring this version..."
            fullWidth
            multiline
            rows={3}
            value={rollbackReason}
            onChange={e => setRollbackReason(e.target.value)}
            error={rollbackReason.length === 0}
            helperText={rollbackReason.length === 0 ? 'A reason is required for the audit trail.' : ''}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, px: 3, borderTop: '1px solid rgba(0,0,0,0.05)', bgcolor: 'rgba(248, 250, 252, 0.5)' }}>
          <Button onClick={() => { setRollbackOpen(false); setRollbackReason(''); }} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, color: '#626465' }}>Cancel</Button>
          <Button 
            variant="contained" 
            color="warning" 
            disabled={!rollbackReason.trim()} 
            onClick={handleRollbackConfirm}
            startIcon={<RestoreIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800, boxShadow: '0 4px 12px rgba(237, 108, 2, 0.2)' }}
          >
            Confirm Restoration
          </Button>
        </DialogActions>
      </Dialog>

      {/* â•â•â• LIFECYCLE TRANSITION MODAL â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Dialog 
        open={transitionOpen} 
        onClose={() => setTransitionOpen(false)} 
        maxWidth="sm" 
        fullWidth 
        PaperProps={{ 
          sx: { 
            borderRadius: 5,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
          } 
        }}
      >
        <DialogTitle sx={{ p: 3, pb: 2, fontWeight: 800, color: '#1F2366', letterSpacing: '-0.02em' }}>
          {pendingTransition?.label} Sequence
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 1 }}>
          {pendingTransition && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, mt: 1 }}>
                <Chip
                  label={currentState}
                  sx={{ bgcolor: lifecycleConfig[currentState].bg, color: lifecycleConfig[currentState].color, fontWeight: 800, borderRadius: 1.5 }}
                />
                <Box sx={{ display: 'flex', color: '#808285' }}>â†’</Box>
                <Chip
                  label={pendingTransition.nextState}
                  sx={{ bgcolor: lifecycleConfig[pendingTransition.nextState].bg, color: lifecycleConfig[pendingTransition.nextState].color, fontWeight: 800, borderRadius: 1.5 }}
                />
              </Box>
              <TextField
                label="Audit Note (optional)"
                placeholder="Briefly describe the reason for this state change..."
                fullWidth
                multiline
                rows={3}
                value={transitionComment}
                onChange={e => setTransitionComment(e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'rgba(0,0,0,0.02)' }
                }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, px: 3, borderTop: '1px solid rgba(0,0,0,0.05)', bgcolor: 'rgba(248, 250, 252, 0.5)' }}>
          <Button onClick={() => setTransitionOpen(false)} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, color: '#626465' }}>Cancel Operation</Button>
          <Button 
            variant="contained" 
            onClick={handleTransitionConfirm}
            color={pendingTransition?.label === 'Reject' ? 'error' : 'primary'}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none', 
              fontWeight: 800, 
              bgcolor: pendingTransition?.label === 'Reject' ? '#E43B46' : '#1D74FF',
              '&:hover': { bgcolor: pendingTransition?.label === 'Reject' ? '#E43B46' : '#0062CC' },
              boxShadow: pendingTransition?.label === 'Reject' ? '0 4px 12px rgba(239, 68, 68, 0.2)' : '0 4px 12px rgba(0, 122, 255, 0.2)'
            }}
          >
            Confirm Transition
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

