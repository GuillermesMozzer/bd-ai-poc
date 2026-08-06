import React, { useState } from 'react';
import {
  Box, Typography, Button, Grid, Paper, IconButton, Chip,
  LinearProgress, Divider, Avatar, Tooltip, Snackbar, Alert, CircularProgress,
  Card, CardContent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Shield as ShieldIcon,
  CheckCircle as CheckIcon,
  Cancel as FailIcon,
  Warning as WarningIcon,
  ErrorOutline as ErrorIcon,
  VerifiedUser as VerifiedIcon,
  Assignment as AssignmentIcon,
  GppGood as GppGoodIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  AutoAwesome as SparkleIcon,
  TrendingUp as TrendIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface ComplianceItem {
  id: string;
  requirement: string;
  description: string;
  status: 'PASS' | 'FAIL' | 'PARTIAL' | 'NA';
  reference: string;
}

interface ExpiredDoc {
  name: string;
  id: string;
  expiredDaysAgo: number;
  owner: string;
  ownerInitials: string;
  ownerColor: string;
}

interface OverdueReview {
  name: string;
  id: string;
  overdueDays: number;
  reviewer: string;
  reviewerInitials: string;
  reviewerColor: string;
  frequency: string;
}

// â”€â”€â”€ Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const cfrChecklist: ComplianceItem[] = [
  { id: 'cfr-1', requirement: 'Unique User Identification', description: 'Each user has a unique ID that cannot be shared or reused.', status: 'PASS', reference: 'Â§11.300(a)' },
  { id: 'cfr-2', requirement: 'Password Controls', description: 'Passwords are encrypted, aged, and complexity-enforced.', status: 'PARTIAL', reference: 'Â§11.300(b)' },
  { id: 'cfr-3', requirement: 'Audit Trail (Immutable)', description: 'Time-stamped, computer-generated audit trail for all record changes.', status: 'PASS', reference: 'Â§11.10(e)' },
  { id: 'cfr-4', requirement: 'Electronic Signature Binding', description: 'Signatures are permanently linked to the electronic record.', status: 'FAIL', reference: 'Â§11.70' },
  { id: 'cfr-5', requirement: 'Authority Checks', description: 'Only authorized individuals can use the system and access records.', status: 'PASS', reference: 'Â§11.10(g)' },
];

const isoChecklist: ComplianceItem[] = [
  { id: 'iso-1', requirement: 'Document Control Procedure', description: 'Procedure established for creating, reviewing, approving documents.', status: 'PASS', reference: 'ISO 9001 Â§7.5.2' },
  { id: 'iso-2', requirement: 'Document Version Control', description: 'Current version clearly identified; obsolete versions removed from use.', status: 'PASS', reference: 'ISO 13485 Â§4.2.4' },
  { id: 'iso-3', requirement: 'Legibility & Retrievability', description: 'Records remain legible, identifiable, and retrievable at all times.', status: 'PASS', reference: 'ISO 9001 Â§7.5.3' },
  { id: 'iso-4', requirement: 'Record Retention Policy', description: 'Retention periods defined and enforced per product lifecycle.', status: 'PARTIAL', reference: 'ISO 13485 Â§4.2.5' },
];

const alcoaPrinciples = [
  { code: 'A', label: 'Attributable', desc: 'Data must identify who performed the action and when.', status: 'PASS', score: 100 },
  { code: 'L', label: 'Legible', desc: 'Data must be readable and permanent.', status: 'PASS', score: 100 },
  { code: 'C', label: 'Contemporaneous', desc: 'Data must be recorded at time of activity.', status: 'PASS', score: 97 },
  { code: 'O', label: 'Original', desc: 'Original record must be the source of truth.', status: 'PARTIAL', score: 84 },
  { code: 'A', label: 'Accurate', desc: 'Data must truthfully reflect what occurred.', status: 'PASS', score: 100 },
  { code: '+', label: 'Complete', desc: 'All relevant data recorded â€” no selective recording.', status: 'PASS', score: 98 },
];

const expiredDocuments: ExpiredDoc[] = [
  { name: 'Maintenance Manual.docx', id: 'DOC-005', expiredDaysAgo: 47, owner: 'George Whales', ownerInitials: 'GW', ownerColor: '#00AF95' },
  { name: 'Supplier Quality Agreement.pdf', id: 'DOC-021', expiredDaysAgo: 12, owner: 'Chris Klopp', ownerInitials: 'CK', ownerColor: '#FF6E00' },
  { name: 'EO Sterilization Report.docx', id: 'DOC-033', expiredDaysAgo: 3, owner: 'Marcus Chods', ownerInitials: 'MC', ownerColor: '#9c27b0' },
];

const overdueReviews: OverdueReview[] = [
  { name: 'Z2 Extrusion SOP.docx', id: 'DOC-018', overdueDays: 28, reviewer: 'George Whales', reviewerInitials: 'GW', reviewerColor: '#00AF95', frequency: 'Annual' },
  { name: 'Assembly Station WI-06.docx', id: 'DOC-024', overdueDays: 14, reviewer: 'Dougie Wood', reviewerInitials: 'DW', reviewerColor: '#044ED7', frequency: 'Semi-Annual' },
];

// â”€â”€â”€ Constants & Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const GLASS_STYLE = {
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(15, 23, 42, 0.08)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
  borderRadius: '24px',
};

function scoreColor(score: number) {
  if (score >= 90) return '#00AF95';
  if (score >= 70) return '#FF6E00';
  return '#E43B46';
}

function StatusChip({ status }: { status: string }) {
  const cfg = status === 'PASS'
    ? { label: 'PASS', bg: '#ecfdf5', color: '#00AF95' }
    : status === 'FAIL'
    ? { label: 'FAIL', bg: '#fef2f2', color: '#E43B46' }
    : status === 'PARTIAL'
    ? { label: 'PARTIAL', bg: '#fffbeb', color: '#FF6E00' }
    : { label: 'N/A', bg: '#EBEDF0', color: '#808285' };
  return <Chip label={cfg.label} size="small" sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 800, fontSize: '0.6rem', height: 18, borderRadius: '6px' }} />;
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface DocumentComplianceDashboardProps {
  onBack: () => void;
  onAuditTrailClick?: () => void;
}

export default function DocumentComplianceDashboard({ onBack, onAuditTrailClick }: DocumentComplianceDashboardProps) {
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const cfrScore = Math.round((cfrChecklist.filter(c => c.status === 'PASS').length / cfrChecklist.length) * 100);
  const isoScore = Math.round((isoChecklist.filter(c => c.status === 'PASS').length / isoChecklist.length) * 100);
  const alcoaScore = Math.round(alcoaPrinciples.reduce((s, p) => s + p.score, 0) / alcoaPrinciples.length);
  const overallScore = Math.round((cfrScore + isoScore + alcoaScore) / 3);

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#EBEDF0', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      {/* â•â•â• Header â•â•â• */}
      <Box sx={{ px: 4, py: 2.5, bgcolor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #DBDDDF', display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={onBack} size="small" sx={{ mr: 2, bgcolor: '#EBEDF0', border: '1px solid #DBDDDF' }}><ArrowBackIcon /></IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1F2366', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            Compliance Central
          </Typography>
          <Typography variant="body2" sx={{ color: '#626465', fontWeight: 500 }}>FDA 21 CFR Part 11 â€¢ ISO 9001/13485 â€¢ ALCOA+</Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {onAuditTrailClick && (
            <Button variant="outlined" startIcon={<ShieldIcon />} onClick={onAuditTrailClick} sx={{ borderRadius: '10px' }}>Audit Trail</Button>
          )}
          <Button variant="contained" disableElevation startIcon={<DownloadIcon />} onClick={() => setSnackbar({ open: true, message: 'Exporting report...' })} sx={{ borderRadius: '10px', bgcolor: '#1F2366' }}>Export</Button>
        </Box>
      </Box>

      {/* â•â•â• Content (Bento Grid) â•â•â• */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 4 }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, 
          gap: 3,
          maxWidth: 1600,
          mx: 'auto'
        }}>
          
          {/* Main Score Bento (Large) */}
          <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
            <Paper sx={{ ...GLASS_STYLE, p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} elevation={0}>
              <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 800, alignSelf: 'flex-start', color: '#1F2366' }}>HEALTH INDEX</Typography>
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 4 }}>
                <CircularProgress variant="determinate" value={100} size={160} thickness={4} sx={{ color: '#EBEDF0', position: 'absolute' }} />
                <CircularProgress variant="determinate" value={overallScore} size={160} thickness={4} sx={{ color: scoreColor(overallScore), strokeLinecap: 'round' }} />
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: '#1F2366', lineHeight: 1 }}>{overallScore}%</Typography>
                  <Typography variant="caption" sx={{ color: '#808285', fontWeight: 800, letterSpacing: '0.1em', mt: 0.5 }}>COMPLIANT</Typography>
                </Box>
              </Box>
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { label: '21 CFR Part 11', val: cfrScore, color: '#1D74FF' },
                  { label: 'ISO 13485 (QMS)', val: isoScore, color: '#00AF95' },
                  { label: 'ALCOA+ Integrity', val: alcoaScore, color: '#9199D8' },
                ].map(item => (
                  <Box key={item.label}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#626465' }}>{item.label}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: item.color }}>{item.val}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={item.val} sx={{ height: 6, borderRadius: 3, bgcolor: '#EBEDF0', '& .MuiLinearProgress-bar': { bgcolor: item.color, borderRadius: 3 } }} />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>

          {/* Secondary Stats Group */}
          <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 8' }, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            {/* Expired Docs Bento */}
            <Box sx={{ gridColumn: 'span 1' }}>
              <Paper sx={{ ...GLASS_STYLE, p: 3, borderLeft: '4px solid #E43B46' }} elevation={0}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#E43B46' }}>EXPIRED DOCUMENTS</Typography>
                  <Chip label={expiredDocuments.length} size="small" sx={{ bgcolor: '#fef2f2', color: '#E43B46', fontWeight: 900, height: 20 }} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {expiredDocuments.map(doc => (
                    <Box key={doc.id} sx={{ p: 1.5, bgcolor: 'rgba(241, 245, 249, 0.5)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2366', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#808285' }}>{doc.id} â€¢ {doc.owner}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#E43B46', fontWeight: 800 }}>{doc.expiredDaysAgo}d</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Box>

            {/* Overdue Reviews Bento */}
            <Box sx={{ gridColumn: 'span 1' }}>
              <Paper sx={{ ...GLASS_STYLE, p: 3, borderLeft: '4px solid #FF6E00' }} elevation={0}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FF6E00' }}>OVERDUE REVIEWS</Typography>
                  <Chip label={overdueReviews.length} size="small" sx={{ bgcolor: '#fffbeb', color: '#FF6E00', fontWeight: 900, height: 20 }} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {overdueReviews.map(doc => (
                    <Box key={doc.id} sx={{ p: 1.5, bgcolor: 'rgba(241, 245, 249, 0.5)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2366', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#808285' }}>{doc.frequency} â€¢ {doc.reviewer}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#FF6E00', fontWeight: 800 }}>{doc.overdueDays}d</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Box>

            {/* Training Insights Bento */}
            <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}>
              <Paper sx={{ ...GLASS_STYLE, p: 3 }} elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                  <TrendIcon sx={{ color: '#9199D8' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1F2366' }}>LATEST FINDINGS (ISO 13485)</Typography>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                  {[
                    { label: 'Outdated Staff Training', val: 7, risk: 'HIGH', color: '#E43B46' },
                    { label: 'Missing Training Links', val: 12, risk: 'MEDIUM', color: '#FF6E00' },
                    { label: 'Pending Competencies', val: 4, risk: 'LOW', color: '#1D74FF' },
                  ].map(f => (
                    <Box key={f.label} sx={{ p: 2, bgcolor: '#EBEDF0', borderRadius: '16px', border: '1px solid #DBDDDF', textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: f.color, mb: 0.5 }}>{f.val}</Typography>
                      <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: '#626465' }}>{f.label}</Typography>
                      <Chip label={f.risk} size="small" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 900, mt: 1, bgcolor: 'white' }} />
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* Detailed Checklists (Split half/half) */}
          <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 6' } }}>
            <Paper sx={{ ...GLASS_STYLE, p: 3 }} elevation={0}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <VerifiedIcon sx={{ color: '#1D74FF' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>21 CFR Part 11</Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: scoreColor(cfrScore) }}>{cfrScore}%</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {cfrChecklist.map((item, idx) => (
                  <Box key={item.id} sx={{ py: 2, borderBottom: idx < cfrChecklist.length - 1 ? '1px solid rgba(15, 23, 42, 0.05)' : 'none' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2366' }}>{item.requirement}</Typography>
                      <StatusChip status={item.status} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ color: '#808285', lineHeight: 1.3 }}>{item.description}</Typography>
                      <Chip label={item.reference} variant="outlined" size="small" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 600, color: '#808285', borderColor: '#DBDDDF' }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>

          {/* ALCOA+ Principles Grid */}
          <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 6' } }}>
            <Paper sx={{ ...GLASS_STYLE, p: 3, height: '100%' }} elevation={0}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AssignmentIcon sx={{ color: '#9199D8' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>ALCOA+ Data Principles</Typography>
                </Box>
                <SparkleIcon sx={{ color: '#9199D8', fontSize: 20 }} />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                {alcoaPrinciples.map(p => (
                  <Tooltip key={p.label} title={p.desc} arrow placement="top">
                    <Box sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(255, 255, 255, 0.5)', border: '1px solid #DBDDDF', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', borderColor: scoreColor(p.score) } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: scoreColor(p.score) }}>{p.code}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: scoreColor(p.score) }}>{p.score}%</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#1F2366', display: 'block' }}>{p.label}</Typography>
                    </Box>
                  </Tooltip>
                ))}
                <Box sx={{ gridColumn: 'span 2' }}>
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#fdf2f2', borderRadius: '16px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <ErrorIcon sx={{ color: '#E43B46', fontSize: 18 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#b91c1c' }}>
                      3 critical process gaps detected. Immediate validation required for Part 11 compliance.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="info" variant="filled" sx={{ borderRadius: '12px' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

