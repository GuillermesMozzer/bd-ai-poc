import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Button, Paper, IconButton, Chip, Avatar,
  TextField, InputAdornment, Select, MenuItem, FormControl,
  InputLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tooltip, Divider, Badge,
  ToggleButton, ToggleButtonGroup, Snackbar, Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  CheckCircle as ApproveIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Lock as CheckOutIcon,
  LockOpen as CheckInIcon,
  CloudUpload as UploadIcon,
  AutoAwesome as SparkleIcon,
  Shield as ShieldIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Cancel as RejectIcon,
  History as HistoryIcon,
  LockOutlined as LockIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type ActionType =
  | 'VIEW' | 'EDIT' | 'APPROVE' | 'REJECT' | 'DELETE'
  | 'DOWNLOAD' | 'PRINT' | 'CHECK_OUT' | 'CHECK_IN'
  | 'UPLOAD' | 'VERSION_CREATE' | 'STATUS_CHANGE' | 'ROLLBACK';

interface AuditEntry {
  id: string;
  timestamp: string;
  date: string;
  time: string;
  user: string;
  userInitials: string;
  userColor: string;
  userId: string;
  action: ActionType;
  documentName: string;
  documentId: string;
  version: string;
  details: string;
  ipAddress: string;
  sessionId: string;
  hash: string;
  alcoa: { attributable: boolean; legible: boolean; contemporaneous: boolean; original: boolean; accurate: boolean };
  outcome: 'SUCCESS' | 'FAILURE' | 'WARNING';
}

// â”€â”€â”€ Mock Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const generateHash = (seed: string) => {
  let h = 0; for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return Math.abs(h).toString(16).padStart(8, '0') + 'a3f9' + Math.abs(h * 7).toString(16).padStart(8, '0');
};

const mockAuditLog: AuditEntry[] = [
  { id: 'AL001', timestamp: '2026-04-02T14:22:01Z', date: '2026-04-02', time: '14:22:01', user: 'Dougie Wood', userInitials: 'DW', userColor: '#044ED7', userId: 'USR-001', action: 'DOWNLOAD', documentName: 'Health & Safety Manual.docx', documentId: 'DOC-001', version: 'v10', details: 'Document downloaded (PDF export)', ipAddress: '10.0.1.45', sessionId: 'SES-4821', hash: generateHash('AL001'), alcoa: { attributable: true, legible: true, contemporaneous: true, original: true, accurate: true }, outcome: 'SUCCESS' },
  { id: 'AL002', timestamp: '2026-04-02T13:58:44Z', date: '2026-04-02', time: '13:58:44', user: 'Marcus Chods', userInitials: 'MC', userColor: '#9c27b0', userId: 'USR-002', action: 'APPROVE', documentName: 'Quality Manual.docx', documentId: 'DOC-004', version: 'v8', details: 'Document approved. Comment: "Reviewed all sections, compliant with ISO 13485."', ipAddress: '10.0.1.22', sessionId: 'SES-4820', hash: generateHash('AL002'), alcoa: { attributable: true, legible: true, contemporaneous: true, original: true, accurate: true }, outcome: 'SUCCESS' },
  { id: 'AL003', timestamp: '2026-04-02T13:45:12Z', date: '2026-04-02', time: '13:45:12', user: 'Chris Klopp', userInitials: 'CK', userColor: '#FF6E00', userId: 'USR-003', action: 'EDIT', documentName: 'Production Manual.docx', documentId: 'DOC-003', version: 'v2', details: 'Reason for change: "Updated pressure limits per ECN-2026-038 â€” approved by Engineering on 2026-03-28."', ipAddress: '10.0.1.18', sessionId: 'SES-4819', hash: generateHash('AL003'), alcoa: { attributable: true, legible: true, contemporaneous: true, original: false, accurate: true }, outcome: 'WARNING' },
  { id: 'AL004', timestamp: '2026-04-02T12:30:05Z', date: '2026-04-02', time: '12:30:05', user: 'George Whales', userInitials: 'GW', userColor: '#00AF95', userId: 'USR-004', action: 'STATUS_CHANGE', documentName: 'Employee Handbook.docx', documentId: 'DOC-002', version: 'v5', details: 'Status changed: Approved â†’ In Review. Reason: "Mandatory HR policy update required â€” Q2 2026 cycle."', ipAddress: '10.0.1.11', sessionId: 'SES-4818', hash: generateHash('AL004'), alcoa: { attributable: true, legible: true, contemporaneous: true, original: true, accurate: true }, outcome: 'SUCCESS' },
  { id: 'AL005', timestamp: '2026-04-02T11:15:33Z', date: '2026-04-02', time: '11:15:33', user: 'Dougie Wood', userInitials: 'DW', userColor: '#044ED7', userId: 'USR-001', action: 'CHECK_OUT', documentName: 'Employee Handbook.docx', documentId: 'DOC-002', version: 'v5', details: 'Document checked out for exclusive editing.', ipAddress: '10.0.1.45', sessionId: 'SES-4817', hash: generateHash('AL005'), alcoa: { attributable: true, legible: true, contemporaneous: true, original: true, accurate: true }, outcome: 'SUCCESS' },
  { id: 'AL006', timestamp: '2026-04-02T10:55:19Z', date: '2026-04-02', time: '10:55:19', user: 'Marcus Chods', userInitials: 'MC', userColor: '#9c27b0', userId: 'USR-002', action: 'VIEW', documentName: 'Health & Safety Manual.docx', documentId: 'DOC-001', version: 'v10', details: 'Document viewed (read-only access).', ipAddress: '10.0.1.22', sessionId: 'SES-4816', hash: generateHash('AL006'), alcoa: { attributable: true, legible: true, contemporaneous: true, original: true, accurate: true }, outcome: 'SUCCESS' },
  { id: 'AL007', timestamp: '2026-04-02T10:02:47Z', date: '2026-04-02', time: '10:02:47', user: 'Chris Klopp', userInitials: 'CK', userColor: '#FF6E00', userId: 'USR-003', action: 'PRINT', documentName: 'Production Manual.docx', documentId: 'DOC-003', version: 'v2', details: 'Controlled print (1 copy). Watermark applied: CONTROLLED COPY - CK - 2026-04-02.', ipAddress: '10.0.1.18', sessionId: 'SES-4815', hash: generateHash('AL007'), alcoa: { attributable: true, legible: true, contemporaneous: true, original: true, accurate: true }, outcome: 'SUCCESS' },
  { id: 'AL008', timestamp: '2026-04-02T09:30:00Z', date: '2026-04-02', time: '09:30:00', user: 'System', userInitials: 'SYS', userColor: '#607d8b', userId: 'SYS-001', action: 'VERSION_CREATE', documentName: 'Health & Safety Manual.docx', documentId: 'DOC-001', version: 'v10', details: 'New version created from approved draft. v9 â†’ v10. Effective date: 2026-04-01.', ipAddress: 'SYSTEM', sessionId: 'SYS-AUTO', hash: generateHash('AL008'), alcoa: { attributable: true, legible: true, contemporaneous: true, original: true, accurate: true }, outcome: 'SUCCESS' },
  { id: 'AL009', timestamp: '2026-04-01T16:44:22Z', date: '2026-04-01', time: '16:44:22', user: 'George Whales', userInitials: 'GW', userColor: '#00AF95', userId: 'USR-004', action: 'REJECT', documentName: 'Maintenance Manual.docx', documentId: 'DOC-005', version: 'v12', details: 'Rejected at approval step. Reason: "Section 5.3 references obsolete equipment model EQ-220A. Must be updated."', ipAddress: '10.0.1.11', sessionId: 'SES-4810', hash: generateHash('AL009'), alcoa: { attributable: true, legible: true, contemporaneous: true, original: true, accurate: true }, outcome: 'SUCCESS' },
  { id: 'AL010', timestamp: '2026-04-01T15:20:08Z', date: '2026-04-01', time: '15:20:08', user: 'Dougie Wood', userInitials: 'DW', userColor: '#044ED7', userId: 'USR-001', action: 'UPLOAD', documentName: 'Maintenance Manual.docx', documentId: 'DOC-005', version: 'v12', details: 'File uploaded: MaintManual_v12_draft.docx (2.4 MB). SHA-256 hash verified at upload.', ipAddress: '10.0.1.45', sessionId: 'SES-4809', hash: generateHash('AL010'), alcoa: { attributable: true, legible: true, contemporaneous: true, original: true, accurate: true }, outcome: 'SUCCESS' },
  { id: 'AL011', timestamp: '2026-04-01T11:05:55Z', date: '2026-04-01', time: '11:05:55', user: 'Marcus Chods', userInitials: 'MC', userColor: '#9c27b0', userId: 'USR-002', action: 'DELETE', documentName: 'Temp_draft_v1.docx', documentId: 'DOC-TMP-01', version: 'v1', details: 'Soft delete â€” document moved to recycle bin. Reason: "Superseded by official template."', ipAddress: '10.0.1.22', sessionId: 'SES-4805', hash: generateHash('AL011'), alcoa: { attributable: true, legible: true, contemporaneous: true, original: true, accurate: true }, outcome: 'SUCCESS' },
  { id: 'AL012', timestamp: '2026-04-01T08:15:30Z', date: '2026-04-01', time: '08:15:30', user: 'Chris Klopp', userInitials: 'CK', userColor: '#FF6E00', userId: 'USR-003', action: 'ROLLBACK', documentName: 'Quality Manual.docx', documentId: 'DOC-004', version: 'v7', details: 'Rollback to v7. New version v8 created. Reason: "v7â†’v8 change introduced non-compliant procedure â€” reverting per NCR-2026-012."', ipAddress: '10.0.1.18', sessionId: 'SES-4801', hash: generateHash('AL012'), alcoa: { attributable: true, legible: true, contemporaneous: true, original: true, accurate: true }, outcome: 'SUCCESS' },
  { id: 'AL013', timestamp: '2026-03-31T17:00:00Z', date: '2026-03-31', time: '17:00:00', user: 'System', userInitials: 'SYS', userColor: '#607d8b', userId: 'SYS-001', action: 'CHECK_IN', documentName: 'Employee Handbook.docx', documentId: 'DOC-002', version: 'v5', details: 'Automatic check-in after 8-hour timeout. Document lock released.', ipAddress: 'SYSTEM', sessionId: 'SYS-AUTO', hash: generateHash('AL013'), alcoa: { attributable: true, legible: true, contemporaneous: true, original: true, accurate: true }, outcome: 'WARNING' },
  { id: 'AL014', timestamp: '2026-03-31T14:22:10Z', date: '2026-03-31', time: '14:22:10', user: 'George Whales', userInitials: 'GW', userColor: '#00AF95', userId: 'USR-004', action: 'VIEW', documentName: 'Quality Manual.docx', documentId: 'DOC-004', version: 'v8', details: 'Document viewed. Access granted per role: Quality Manager.', ipAddress: '10.0.1.11', sessionId: 'SES-4790', hash: generateHash('AL014'), alcoa: { attributable: true, legible: true, contemporaneous: true, original: true, accurate: true }, outcome: 'SUCCESS' },
];

// â”€â”€â”€ Action configs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const actionConfig: Record<ActionType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  VIEW:           { label: 'VIEW',           color: '#044ED7', bg: '#EBEDF0', icon: <ViewIcon sx={{ fontSize: 13 }} /> },
  EDIT:           { label: 'EDIT',           color: '#FF6E00', bg: '#fff3e0', icon: <EditIcon sx={{ fontSize: 13 }} /> },
  APPROVE:        { label: 'APPROVE',        color: '#1b5e20', bg: '#e8f5e9', icon: <ApproveIcon sx={{ fontSize: 13 }} /> },
  REJECT:         { label: 'REJECT',         color: '#b71c1c', bg: '#ffebee', icon: <RejectIcon sx={{ fontSize: 13 }} /> },
  DELETE:         { label: 'DELETE',         color: '#b71c1c', bg: '#ffebee', icon: <DeleteIcon sx={{ fontSize: 13 }} /> },
  DOWNLOAD:       { label: 'DOWNLOAD',       color: '#4527a0', bg: '#ede7f6', icon: <DownloadIcon sx={{ fontSize: 13 }} /> },
  PRINT:          { label: 'PRINT',          color: '#37474f', bg: '#eceff1', icon: <PrintIcon sx={{ fontSize: 13 }} /> },
  CHECK_OUT:      { label: 'CHECK OUT',      color: '#FF6E00', bg: '#fff3e0', icon: <CheckOutIcon sx={{ fontSize: 13 }} /> },
  CHECK_IN:       { label: 'CHECK IN',       color: '#00AF95', bg: '#e8f5e9', icon: <CheckInIcon sx={{ fontSize: 13 }} /> },
  UPLOAD:         { label: 'UPLOAD',         color: '#006064', bg: '#e0f7fa', icon: <UploadIcon sx={{ fontSize: 13 }} /> },
  VERSION_CREATE: { label: 'NEW VERSION',    color: '#044ED7', bg: '#EBEDF0', icon: <HistoryIcon sx={{ fontSize: 13 }} /> },
  STATUS_CHANGE:  { label: 'STATUS CHANGE',  color: '#6a1b9a', bg: '#f3e5f5', icon: <SparkleIcon sx={{ fontSize: 13 }} /> },
  ROLLBACK:       { label: 'ROLLBACK',       color: '#bf360c', bg: '#fbe9e7', icon: <RefreshIcon sx={{ fontSize: 13 }} /> },
};

// â”€â”€â”€ Props â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface DocumentAuditTrailScreenProps {
  onBack: () => void;
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function DocumentAuditTrailScreen({ onBack }: DocumentAuditTrailScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [userFilter, setUserFilter] = useState<string>('ALL');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const filtered = useMemo(() => {
    return mockAuditLog.filter(e => {
      const matchSearch = !searchQuery ||
        e.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.documentId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchAction = actionFilter === 'ALL' || e.action === actionFilter;
      const matchUser = userFilter === 'ALL' || e.userId === userFilter;
      const matchOutcome = outcomeFilter === 'ALL' || e.outcome === outcomeFilter;
      
      const entryDate = new Date(e.date);
      const matchStartDate = !startDate || entryDate >= new Date(startDate);
      const matchEndDate = !endDate || entryDate <= new Date(endDate);

      return matchSearch && matchAction && matchUser && matchOutcome && matchStartDate && matchEndDate;
    });
  }, [searchQuery, actionFilter, userFilter, outcomeFilter, startDate, endDate]);

  const uniqueUsers = Array.from(new Set(mockAuditLog.map(e => e.userId))).map(uid => {
    const e = mockAuditLog.find(x => x.userId === uid)!;
    return { id: uid, name: e.user };
  });

  const stats = {
    total: mockAuditLog.length,
    filtered: filtered.length,
    warnings: mockAuditLog.filter(e => e.outcome === 'WARNING').length,
    today: mockAuditLog.filter(e => e.date === '2026-04-02').length,
  };

  return (
    <Box sx={{ 
      flexGrow: 1, 
      bgcolor: '#EBEDF0', 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      overflow: 'hidden',
      fontFamily: '"Fira Sans", sans-serif',
      backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.03) 0%, rgba(248, 250, 252, 1) 100%)',
    }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&family=Fira+Sans:wght@300;400;500;600;700;800&display=swap');
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); borderRadius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
        `}
      </style>

      {/* â•â•â• TOP BAR â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Box sx={{ 
        px: 4, 
        py: 2.5, 
        bgcolor: 'rgba(255, 255, 255, 0.8)', 
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 3,
        zIndex: 10,
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
      }}>
        <IconButton onClick={onBack} size="small" sx={{ bgcolor: '#EBEDF0', border: '1px solid #EBEDF0' }}>
          <ArrowBackIcon sx={{ fontSize: 18 }} />
        </IconButton>

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1F2366', lineHeight: 1.2 }}>
              Audit Trail
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#626465', fontWeight: 500, mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LockIcon sx={{ fontSize: 14, color: '#808285' }} />
            IMMUTABLE, CRYPTOGRAPHICALLY SECURED ACTIVITY LOG
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => setSnackbar({ open: true, message: 'Audit log exported as CSV (14 records)' })}
            sx={{ px: 2 }}
          >
            EXPORT CSV
          </Button>
          <Button
            variant="contained"
            disableElevation
            startIcon={<DownloadIcon />}
            onClick={() => setSnackbar({ open: true, message: 'Audit log exported as PDF with digital signature' })}
            sx={{ bgcolor: '#1D74FF', '&:hover': { bgcolor: '#044ED7' }, px: 2 }}
          >
            EXPORT SIGNED PDF
          </Button>
        </Box>
      </Box>

      {/* â•â•â• STATS ROW â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Box sx={{ 
        px: 4, 
        py: 1.5, 
        display: 'flex', 
        gap: 2,
        bgcolor: 'rgba(255, 255, 255, 0.4)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
        overflowX: 'auto',
        '&::-webkit-scrollbar': { display: 'none' },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}>
        {[
          { label: 'TOTAL EVENTS', value: stats.total, color: '#1F2366', bg: '#EBEDF0', icon: <HistoryIcon sx={{ fontSize: 18 }} /> },
          { label: 'TODAY\'S ACTIVITY', value: stats.today, color: '#1D74FF', bg: '#EBEDF0', icon: <TimeIcon sx={{ fontSize: 18 }} /> },
          { label: 'FILTERED MATCHES', value: stats.filtered, color: '#0ea5e9', bg: '#f0f9ff', icon: <FilterListIcon sx={{ fontSize: 18 }} /> },
          { label: 'CRITICAL WARNINGS', value: stats.warnings, color: '#FF6E00', bg: '#fffbeb', icon: <WarningIcon sx={{ fontSize: 18 }} /> },
        ].map((s, i) => (
          <Paper 
            key={i} 
            elevation={0}
            sx={{ 
              px: 3, 
              py: 1.5, 
              bgcolor: 'white',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              borderRadius: 3,
              display: 'flex', 
              alignItems: 'center',
              gap: 2,
              minWidth: 200,
              flexGrow: 0,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              '&:hover': { 
                transform: 'translateY(-2px)', 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                borderColor: s.color,
              },
            }}
          >
            <Box sx={{ 
              width: 36, 
              height: 36, 
              borderRadius: 2, 
              bgcolor: s.bg, 
              color: s.color, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {s.icon}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, color: '#1F2366', fontSize: '1rem', lineHeight: 1.2 }}>{s.value}</Typography>
              <Typography variant="caption" sx={{ color: '#626465', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.025em', display: 'block' }}>{s.label}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* â•â•â• FILTERS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Box sx={{ 
        px: 2, py: 1.25, 
        bgcolor: 'white', 
        borderTop: '1px solid #EBEDF0',
        borderBottom: '1px solid #EBEDF0',
        display: 'flex', gap: 1, alignItems: 'center', 
        flexWrap: 'nowrap',
        overflow: 'hidden'
      }}>
        {/* Compact Search Bar */}
        <TextField
          size="small"
          placeholder="Search logs..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          sx={{ 
            width: 530,
            '& .MuiOutlinedInput-root': {
              bgcolor: '#EBEDF0',
              height: 36,
              fontSize: 12,
              '& fieldset': { borderColor: '#EBEDF0' },
              '&:hover fieldset': { borderColor: '#DBDDDF' },
              '&.Mui-focused fieldset': { borderColor: '#1D74FF' }
            }
          }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#808285' }} /></InputAdornment> }}
        />

        <Divider orientation="vertical" flexItem sx={{ height: 20, mx: 0.5, alignSelf: 'center', borderColor: '#EBEDF0' }} />

        <Box sx={{ 
          display: 'flex', alignItems: 'center', gap: 1, 
          bgcolor: '#EBEDF0', px: 2, py: 0, borderRadius: 1.5, 
          border: '1px solid #EBEDF0',
          height: 36,
          flexShrink: 0
        }}>
          <Typography variant="caption" sx={{ color: '#626465', fontWeight: 800, fontSize: '0.6rem' }}>PERIOD:</Typography>
          <TextField
            type="date"
            size="small"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            variant="standard"
            sx={{ '& input': { fontSize: '0.7rem', fontWeight: 700, color: '#1F2366', width: 110 } }}
            InputProps={{ disableUnderline: true }}
          />
          <Typography sx={{ color: '#cbd5e1', fontSize: 10 }}>â€”</Typography>
          <TextField
            type="date"
            size="small"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            variant="standard"
            sx={{ '& input': { fontSize: '0.7rem', fontWeight: 700, color: '#1F2366', width: 110 } }}
            InputProps={{ disableUnderline: true }}
          />
        </Box>

        {/* Action Category Filter */}
        <FormControl size="small" sx={{ minWidth: 160, flexShrink: 0 }}>
          <Select 
            displayEmpty
            value={actionFilter} 
            onChange={e => setActionFilter(e.target.value)}
            sx={{ borderRadius: 1.5, bgcolor: '#EBEDF0', height: 36, fontSize: 11, fontWeight: 700, '& fieldset': { border: '1px solid #EBEDF0' } }}
          >
            <MenuItem value="ALL" sx={{ fontSize: 11, fontWeight: 600 }}>All Actions</MenuItem>
            {Object.entries(actionConfig).map(([key, cfg]) => (
              <MenuItem key={key} value={key} sx={{ fontSize: 11, fontWeight: 600 }}>{cfg.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* User Filter */}
        <FormControl size="small" sx={{ minWidth: 160, flexShrink: 0 }}>
          <Select 
            displayEmpty
            value={userFilter} 
            onChange={e => setUserFilter(e.target.value)}
            sx={{ borderRadius: 1.5, bgcolor: '#EBEDF0', height: 36, fontSize: 11, fontWeight: 700, '& fieldset': { border: '1px solid #EBEDF0' } }}
          >
            <MenuItem value="ALL" sx={{ fontSize: 11, fontWeight: 600 }}>All Users</MenuItem>
            {uniqueUsers.map(u => <MenuItem key={u.id} value={u.id} sx={{ fontSize: 11, fontWeight: 600 }}>{u.name}</MenuItem>)}
          </Select>
        </FormControl>

        {/* Outcome Toggle */}
        <ToggleButtonGroup
          size="small"
          exclusive
          value={outcomeFilter}
          onChange={(_, v) => v && setOutcomeFilter(v)}
          sx={{ 
            height: 36, 
            bgcolor: '#EBEDF0',
            p: 0.4,
            borderRadius: 1.5,
            border: '1px solid #EBEDF0',
            '& .MuiToggleButton-root': { 
              border: 'none',
              borderRadius: '4px !important',
              textTransform: 'none', 
              fontSize: '0.6rem', 
              fontWeight: 800,
              px: 1,
              color: '#626465',
              '&.Mui-selected': { 
                bgcolor: 'white', 
                color: '#1F2366', 
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                '&:hover': { bgcolor: 'white' }
              }
            } 
          }}
        >
          <ToggleButton value="ALL">ALL</ToggleButton>
          <ToggleButton value="SUCCESS">SUCCESS</ToggleButton>
          <ToggleButton value="WARNING">WARNINGS</ToggleButton>
        </ToggleButtonGroup>

        {(searchQuery || actionFilter !== 'ALL' || userFilter !== 'ALL' || outcomeFilter !== 'ALL' || startDate || endDate) && (
          <Tooltip title="Clear all filters">
            <IconButton 
              size="small" 
              onClick={() => { 
                setSearchQuery(''); 
                setActionFilter('ALL'); 
                setUserFilter('ALL'); 
                setOutcomeFilter('ALL'); 
                setStartDate(''); 
                setEndDate('');
              }}
              sx={{ color: '#E43B46', bgcolor: '#fef2f2', border: '1px solid #fee2e2', height: 32, width: 32, borderRadius: 1.5 }}
            >
              <RejectIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* â•â•â• AUDIT LOG TABLE â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, bgcolor: '#EBEDF0' }}>
        <TableContainer sx={{ 
          bgcolor: 'white', 
          borderRadius: 4, 
          border: '1px solid #EBEDF0',
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
        }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: 'white', fontWeight: 700, fontSize: '0.7rem', color: '#808285', borderBottom: '1px solid #EBEDF0', py: 2, textTransform: 'uppercase', letterSpacing: '0.05em' } }}>
                <TableCell sx={{ pl: 3 }}>TIMESTAMP</TableCell>
                <TableCell>USER IDENTITY</TableCell>
                <TableCell>ACTION</TableCell>
                <TableCell>DOCUMENT RESOURCE</TableCell>
                <TableCell>VER.</TableCell>
                <TableCell>EVENT DETAILS</TableCell>
                <TableCell>TERMINAL</TableCell>
                <TableCell>ALCOA+</TableCell>
                <TableCell>INTEGRITY HASH</TableCell>
                <TableCell sx={{ pr: 3 }}>STATUS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((entry) => {
                const acfg = actionConfig[entry.action];
                const isExpanded = expandedRow === entry.id;
                const alcoa = entry.alcoa;
                const alcoaScore = Object.values(alcoa).filter(Boolean).length;

                return (
                  <TableRow
                    key={entry.id}
                    onClick={() => setExpandedRow(isExpanded ? null : entry.id)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: isExpanded ? '#EBEDF0' : 'white',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: '#EBEDF0' },
                      '& td': { borderBottom: '1px solid #EBEDF0', py: 2, fontSize: '0.85rem' },
                    }}
                  >
                    {/* Timestamp */}
                    <TableCell sx={{ pl: 3 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2366', fontSize: '0.75rem' }}>{entry.date}</Typography>
                      <Typography variant="caption" sx={{ color: '#808285', fontSize: '0.7rem', fontWeight: 600 }}>{entry.time} UTC</Typography>
                    </TableCell>

                    {/* User */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: 11, bgcolor: entry.userColor, fontWeight: 700 }}>{entry.userInitials}</Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2366', fontSize: '0.8rem' }}>{entry.user}</Typography>
                          <Typography variant="caption" sx={{ color: '#808285', fontSize: '0.7rem', fontWeight: 600 }}>{entry.userId}</Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Action */}
                    <TableCell>
                      <Chip
                        icon={<Box sx={{ display: 'flex', pl: 0.5 }}>{acfg.icon}</Box>}
                        label={acfg.label}
                        size="small"
                        sx={{ 
                          bgcolor: acfg.bg, 
                          color: acfg.color, 
                          fontWeight: 800, 
                          fontSize: '0.65rem', 
                          height: 22, 
                          borderRadius: 1.5,
                          '& .MuiChip-icon': { color: 'inherit' }
                        }}
                      />
                    </TableCell>

                    {/* Document */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1D74FF', fontSize: '0.8rem' }}>{entry.documentName}</Typography>
                      <Typography variant="caption" sx={{ color: '#808285', fontSize: '0.7rem', fontWeight: 600 }}>{entry.documentId}</Typography>
                    </TableCell>

                    {/* Version */}
                    <TableCell>
                      <Box sx={{ px: 1, py: 0.25, borderRadius: 1, bgcolor: '#EBEDF0', display: 'inline-block' }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#626465', fontSize: '0.7rem' }}>{entry.version}</Typography>
                      </Box>
                    </TableCell>

                    {/* Details */}
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography variant="body2" sx={{ color: '#626465', fontSize: '0.8rem', lineHeight: 1.5, fontWeight: 500 }}>
                        {entry.details}
                      </Typography>
                    </TableCell>

                    {/* IP */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#626465', fontWeight: 600, fontSize: '0.7rem' }}>{entry.ipAddress}</Typography>
                      </Box>
                    </TableCell>

                    {/* ALCOA+ */}
                    <TableCell>
                      <Tooltip title={
                        <Box sx={{ p: 1 }}>
                          {[['A', 'Attributable', alcoa.attributable], ['L', 'Legible', alcoa.legible], ['C', 'Contemporaneous', alcoa.contemporaneous], ['O', 'Original', alcoa.original], ['A', 'Accurate', alcoa.accurate]].map(([code, label, pass]) => (
                            <Box key={String(label)} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: pass ? '#00AF95' : '#E43B46' }} />
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>{label as string}: {pass ? 'VERIFIED' : 'FAILED'}</Typography>
                            </Box>
                          ))}
                        </Box>
                      } sx={{ bgcolor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(8px)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ display: 'flex', gap: '3px' }}>
                            {['A', 'L', 'C', 'O', 'A'].map((letter, i) => {
                              const pass = Object.values(alcoa)[i];
                              return (
                                <Box key={i} sx={{ 
                                  width: 16, height: 16, 
                                  borderRadius: '3px', 
                                  bgcolor: pass ? '#ecfdf5' : '#fef2f2', 
                                  border: `1px solid ${pass ? '#00AF95' : '#f87171'}`, 
                                  display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                }}>
                                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 900, color: pass ? '#00AF95' : '#b91c1c' }}>{letter}</Typography>
                                </Box>
                              );
                            })}
                          </Box>
                          <Typography variant="caption" sx={{ color: alcoaScore === 5 ? '#00AF95' : '#d97706', fontWeight: 800, fontSize: '0.7rem' }}>{alcoaScore}/5</Typography>
                        </Box>
                      </Tooltip>
                    </TableCell>

                    {/* Hash */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.7 }}>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#626465', fontSize: '0.7rem' }}>{entry.hash.slice(0, 8)}â€¦</Typography>
                        <IconButton size="small" sx={{ p: 0.5, '&:hover': { color: '#1D74FF' } }}
                          onClick={(e) => { e.stopPropagation(); setSnackbar({ open: true, message: `Integrity hash copied: ${entry.hash}` }); }}>
                          <CopyIcon sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Box>
                    </TableCell>

                    {/* Outcome */}
                    <TableCell sx={{ pr: 3 }}>
                      {entry.outcome === 'SUCCESS' ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#00AF95' }}>
                          <ApproveIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption" sx={{ fontWeight: 800 }}>SUCCESS</Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#FF6E00' }}>
                          <WarningIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption" sx={{ fontWeight: 800 }}>WARNING</Typography>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} sx={{ textAlign: 'center', py: 12 }}>
                    <Box sx={{ opacity: 0.3, mb: 2 }}>
                      <SearchIcon sx={{ fontSize: 48 }} />
                    </Box>
                    <Typography variant="h6" sx={{ color: '#808285', fontWeight: 600 }}>No audit records found</Typography>
                    <Typography variant="body2" sx={{ color: '#cbd5e1' }}>Try adjusting your filters or search terms</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Footer */}
      <Box sx={{ 
        px: 4, py: 2, 
        borderTop: '1px solid #EBEDF0', 
        bgcolor: 'white', 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' 
      }}>
        <Typography variant="caption" sx={{ color: '#808285', fontWeight: 600 }}>
          TOTAL: {filtered.length} RECORDS MATCHED â€” <Box component="span" sx={{ color: '#0ea5e9' }}>{stats.total}</Box> LOG ENTRIES IN SECURE LEDGER
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#ecfdf5', border: '1px solid #d1fae5' }}>
            <ShieldIcon sx={{ fontSize: 13, color: '#00AF95' }} />
            <Typography variant="caption" sx={{ color: '#00AF95', fontWeight: 800 }}>ALCOA+ VERIFIED JOURNAL</Typography>
          </Box>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackbar(s => ({ ...s, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

