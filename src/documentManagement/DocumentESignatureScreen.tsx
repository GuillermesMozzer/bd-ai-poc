import React, { useState } from 'react';
import {
  Box, Typography, Button, Grid, Paper, IconButton, Chip,
  Avatar, Divider, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Tooltip, Snackbar, Alert, Stepper, Step, StepLabel,
  StepContent, RadioGroup, FormControlLabel, Radio, LinearProgress,
  ToggleButton, ToggleButtonGroup, InputAdornment,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Draw as DrawIcon,
  VerifiedUser as VerifiedIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as PendingIcon,
  Shield as ShieldIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  AccountTree as SequentialIcon,
  DensitySmall as ParallelIcon,
  AutoAwesome as SparkleIcon,
  Fingerprint as FingerprintIcon,
  ContentCopy as CopyIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type SignatureMeaning = 'Author' | 'Reviewer' | 'Approver' | 'Quality Assurance' | 'Witness';
type SignatureStatus = 'SIGNED' | 'PENDING' | 'REJECTED' | 'AWAITING';
type WorkflowType = 'sequential' | 'parallel';

interface Signatory {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  role: string;
  meaning: SignatureMeaning;
  status: SignatureStatus;
  signedAt?: string;
  signedDate?: string;
  comment?: string;
  hash?: string;
  order: number;
}

// â”€â”€â”€ Mock Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const generateSigHash = (seed: string) => {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) + h) ^ seed.charCodeAt(i);
  return 'SHA256:' + Math.abs(h).toString(16).padStart(8, '0') + 'f3a1b2c4' + Math.abs(h * 13).toString(16).padStart(8, '0');
};

const initialSignatories: Signatory[] = [
  {
    id: 'sig-1', name: 'Dougie Wood', initials: 'DW', avatarColor: '#044ED7',
    role: 'Document Author', meaning: 'Author', status: 'SIGNED',
    signedAt: '09:14:33 UTC', signedDate: '2026-03-30',
    comment: 'Document authored per ECN-2026-041. All sections reviewed for accuracy.',
    hash: generateSigHash('sig-1-DW-20260330'),
    order: 1,
  },
  {
    id: 'sig-2', name: 'Marcus Chods', initials: 'MC', avatarColor: '#9c27b0',
    role: 'Technical Reviewer', meaning: 'Reviewer', status: 'SIGNED',
    signedAt: '11:42:07 UTC', signedDate: '2026-03-31',
    comment: 'Technical content reviewed. Temperature limits verified against ECN-2026-041.',
    hash: generateSigHash('sig-2-MC-20260331'),
    order: 2,
  },
  {
    id: 'sig-3', name: 'You (Danilo B.)', initials: 'DB', avatarColor: '#FF6E00',
    role: 'Quality Assurance', meaning: 'Quality Assurance', status: 'PENDING',
    order: 3,
  },
  {
    id: 'sig-4', name: 'George Whales', initials: 'GW', avatarColor: '#00AF95',
    role: 'Site Director', meaning: 'Approver', status: 'AWAITING',
    order: 4,
  },
];

const meaningConfig: Record<SignatureMeaning, { color: string; bg: string; description: string }> = {
  Author:            { color: '#044ED7', bg: '#EBEDF0', description: 'I confirm I authored this document.' },
  Reviewer:          { color: '#6a1b9a', bg: '#f3e5f5', description: 'I have reviewed and concur with the content.' },
  Approver:          { color: '#1b5e20', bg: '#e8f5e9', description: 'I approve this document for use.' },
  'Quality Assurance': { color: '#FF6E00', bg: '#fff3e0', description: 'I verify this document meets QMS requirements.' },
  Witness:           { color: '#37474f', bg: '#eceff1', description: 'I witnessed the actions described herein.' },
};

const statusConfig: Record<SignatureStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  SIGNED:   { label: 'Signed',   color: '#1b5e20', bg: '#e8f5e9', icon: <CheckIcon sx={{ fontSize: 16 }} /> },
  PENDING:  { label: 'Pending',  color: '#FF6E00', bg: '#fff3e0', icon: <PendingIcon sx={{ fontSize: 16 }} /> },
  AWAITING: { label: 'Awaiting', color: '#616161', bg: '#f5f5f5', icon: <PersonIcon sx={{ fontSize: 16 }} /> },
  REJECTED: { label: 'Rejected', color: '#b71c1c', bg: '#ffebee', icon: <CancelIcon sx={{ fontSize: 16 }} /> },
};

// â”€â”€â”€ Props â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface DocumentESignatureScreenProps {
  onBack: () => void;
  documentName?: string;
  documentId?: string;
  documentVersion?: string;
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function DocumentESignatureScreen({
  onBack,
  documentName = 'Health & Safety Manual.docx',
  documentId = 'DOC-HS-001',
  documentVersion = 'v10',
}: DocumentESignatureScreenProps) {
  const [signatories, setSignatories] = useState<Signatory[]>(initialSignatories);
  const [workflowType, setWorkflowType] = useState<WorkflowType>('sequential');

  // Re-auth dialog
  const [reAuthOpen, setReAuthOpen] = useState(false);
  const [reAuthStep, setReAuthStep] = useState<'credentials' | 'verifying' | 'sign'>('credentials');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Sign step
  const [selectedMeaning, setSelectedMeaning] = useState<SignatureMeaning>('Quality Assurance');
  const [signComment, setSignComment] = useState('');
  const [agreedToStatement, setAgreedToStatement] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'info' | 'warning' | 'error' });
  const showSnackbar = (msg: string, sev: typeof snackbar.severity = 'success') => setSnackbar({ open: true, message: msg, severity: sev });

  const signedCount = signatories.filter(s => s.status === 'SIGNED').length;
  const totalRequired = signatories.length;
  const progressPct = Math.round((signedCount / totalRequired) * 100);
  const pendingSig = signatories.find(s => s.status === 'PENDING');
  const isComplete = signedCount === totalRequired;

  // â”€â”€ Re-auth Flow â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleOpenSign = () => {
    setReAuthStep('credentials');
    setPassword('');
    setPasswordError('');
    setAgreedToStatement(false);
    setReAuthOpen(true);
  };

  const handleVerifyPassword = () => {
    if (!password.trim()) { setPasswordError('Password is required.'); return; }
    if (password.length < 4) { setPasswordError('Incorrect password. Please try again.'); return; }
    setPasswordError('');
    setReAuthStep('verifying');
    setTimeout(() => setReAuthStep('sign'), 1800);
  };

  const handleConfirmSignature = () => {
    if (!agreedToStatement) return;
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 8) + ' UTC';
    const dateStr = now.toISOString().slice(0, 10);
    setSignatories(prev => prev.map(s =>
      s.status === 'PENDING'
        ? { ...s, status: 'SIGNED', signedAt: timeStr, signedDate: dateStr, comment: signComment, meaning: selectedMeaning, hash: generateSigHash(`${s.id}-${s.initials}-${dateStr}`) }
        : s.status === 'AWAITING' && workflowType === 'sequential'
        ? { ...s, status: 'PENDING' } // next in sequence becomes pending
        : s
    ));
    setReAuthOpen(false);
    showSnackbar(`Document signed successfully as "${selectedMeaning}". Signature recorded in audit trail.`, 'success');
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f4f7fc', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* â•â•â• TOP BAR â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Box sx={{ px: 3, py: 1.5, bgcolor: 'white', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <IconButton onClick={onBack} size="small"><ArrowBackIcon /></IconButton>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#060A3D', lineHeight: 1.2 }}>Electronic Signatures</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
            <Typography variant="caption" color="text.secondary">{documentName}</Typography>
            <Typography variant="caption" color="text.secondary">Â·</Typography>
            <Typography variant="caption" sx={{ bgcolor: '#f0f0f0', px: 0.75, py: 0.1, borderRadius: 0.5, fontWeight: 600, color: '#555' }}>{documentVersion}</Typography>
            <Typography variant="caption" color="text.secondary">Â·</Typography>
            <Typography variant="caption" color="text.secondary">{documentId}</Typography>
          </Box>
        </Box>

        {/* FDA badge */}
        <Chip
          icon={<ShieldIcon sx={{ fontSize: 14, color: '#b71c1c' }} />}
          label="21 CFR Part 11 â€” Â§11.50 + Â§11.70"
          sx={{ bgcolor: '#ffebee', color: '#b71c1c', fontWeight: 700, fontSize: '0.72rem', border: '1.5px solid #ef9a9a' }}
        />

        {/* Workflow type toggle */}
        <Divider orientation="vertical" flexItem />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">Workflow:</Typography>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={workflowType}
            onChange={(_, v) => v && setWorkflowType(v)}
            sx={{ height: 32, '& .MuiToggleButton-root': { textTransform: 'none', fontSize: '0.78rem', px: 1.5 } }}
          >
            <ToggleButton value="sequential">Sequential</ToggleButton>
            <ToggleButton value="parallel">Parallel</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* Sign button */}
        {pendingSig && !isComplete ? (
          <Button
            variant="contained"
            startIcon={<DrawIcon />}
            onClick={handleOpenSign}
            sx={{
              bgcolor: '#1b5e20', '&:hover': { bgcolor: '#00AF95' },
              fontWeight: 700, px: 2.5, height: 36,
              boxShadow: '0 2px 12px rgba(27,94,32,0.35)',
            }}
          >
            Sign Document
          </Button>
        ) : isComplete ? (
          <Chip icon={<CheckIcon />} label="All Signatures Complete" sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 700, border: '1.5px solid #a5d6a7' }} />
        ) : (
          <Chip label="Awaiting Previous Signer" sx={{ bgcolor: '#f5f5f5', color: '#616161', fontWeight: 600 }} />
        )}
      </Box>

      {/* â•â•â• PROGRESS BAR â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Box sx={{ px: 3, py: 1.5, bgcolor: '#fafbfc', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', gap: 3 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#555' }}>
              Signature Progress â€” {signedCount} of {totalRequired} signed ({workflowType})
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: isComplete ? '#1b5e20' : '#044ED7' }}>{progressPct}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPct}
            sx={{ height: 8, borderRadius: 4, bgcolor: '#e0e0e0', '& .MuiLinearProgress-bar': { bgcolor: isComplete ? '#00AF95' : '#044ED7', borderRadius: 4 } }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon sx={{ fontSize: 14, color: '#9e9e9e' }} />
          <Typography variant="caption" color="text.secondary">
            Each signature is cryptographically bound and tamper-evident.
          </Typography>
        </Box>
      </Box>

      {/* â•â•â• MAIN CONTENT â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>

        {/* LEFT â€” Workflow Panel */}
        <Box sx={{ width: 400, minWidth: 400, bgcolor: 'white', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 1 }}>
            {workflowType === 'sequential' ? <SequentialIcon sx={{ color: '#044ED7', fontSize: 18 }} /> : <ParallelIcon sx={{ color: '#044ED7', fontSize: 18 }} />}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#060A3D' }}>
              {workflowType === 'sequential' ? 'Sequential Workflow' : 'Parallel Workflow'}
            </Typography>
            <Chip
              label={workflowType === 'sequential' ? 'In Order' : 'Any Order'}
              size="small"
              sx={{ height: 18, fontSize: '0.62rem', ml: 'auto', bgcolor: '#EBEDF0', color: '#044ED7', fontWeight: 600 }}
            />
          </Box>
          <Box sx={{ overflowY: 'auto', flexGrow: 1, p: 1.5 }}>
            {workflowType === 'sequential' ? (
              <Stepper orientation="vertical" nonLinear sx={{ '& .MuiStepConnector-line': { borderColor: '#e0e0e0' } }}>
                {signatories.map((sig, idx) => {
                  const scfg = statusConfig[sig.status];
                  const mcfg = meaningConfig[sig.meaning];
                  const isCurrentStep = sig.status === 'PENDING';
                  return (
                    <Step key={sig.id} active={isCurrentStep} completed={sig.status === 'SIGNED'} expanded>
                      <StepLabel
                        icon={
                          <Box sx={{
                            width: 32, height: 32, borderRadius: '50%',
                            bgcolor: sig.status === 'SIGNED' ? '#1b5e20' : isCurrentStep ? '#FF6E00' : '#e0e0e0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: isCurrentStep ? '0 0 0 4px rgba(230,81,0,0.2)' : 'none',
                            transition: 'all 0.3s',
                          }}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: 10, bgcolor: 'transparent', color: sig.status === 'AWAITING' ? '#9e9e9e' : 'white', fontWeight: 700 }}>
                              {sig.status === 'SIGNED' ? 'âœ“' : sig.initials}
                            </Avatar>
                          </Box>
                        }
                        sx={{ '& .MuiStepLabel-label': { fontWeight: isCurrentStep ? 700 : 500 } }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#060A3D' }}>{sig.name}</Typography>
                          <Chip label={scfg.label} size="small" icon={<Box sx={{ display: 'flex', pl: 0.5, color: scfg.color }}>{scfg.icon}</Box>}
                            sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, color: scfg.color, bgcolor: scfg.bg }} />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{sig.role}</Typography>
                        <Chip label={sig.meaning} size="small" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 600, color: mcfg.color, bgcolor: mcfg.bg, mt: 0.5 }} />
                      </StepLabel>
                      <StepContent>
                        {sig.status === 'SIGNED' && (
                          <Box sx={{ mt: 1, p: 1.5, bgcolor: '#f8fdf8', border: '1px solid #e8f5e9', borderRadius: 1.5, borderLeft: '3px solid #00AF95' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <CheckIcon sx={{ fontSize: 13, color: '#00AF95' }} />
                              <Typography variant="caption" sx={{ color: '#00AF95', fontWeight: 600 }}>
                                Signed {sig.signedDate} at {sig.signedAt}
                              </Typography>
                            </Box>
                            {sig.comment && (
                              <Typography variant="caption" sx={{ color: '#555', fontStyle: 'italic', display: 'block', mb: 0.5 }}>"{sig.comment}"</Typography>
                            )}
                          </Box>
                        )}
                        {isCurrentStep && (
                          <Box sx={{ mt: 1, p: 1.5, bgcolor: '#fff8f0', border: '1px solid #ffe0b2', borderRadius: 1.5, borderLeft: '3px solid #FF6E00' }}>
                            <Typography variant="caption" sx={{ color: '#FF6E00', fontWeight: 600, display: 'block' }}>
                              âŸ¶ Your signature is required
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Re-authentication required per 21 CFR Part 11 Â§11.200</Typography>
                          </Box>
                        )}
                        {sig.status === 'AWAITING' && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            Waiting for step {sig.order - 1} to complete
                          </Typography>
                        )}
                      </StepContent>
                    </Step>
                  );
                })}
              </Stepper>
            ) : (
              // Parallel layout
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {signatories.map(sig => {
                  const scfg = statusConfig[sig.status];
                  const mcfg = meaningConfig[sig.meaning];
                  return (
                    <Paper key={sig.id} variant="outlined" sx={{
                      p: 2, borderRadius: 2,
                      borderColor: sig.status === 'PENDING' ? '#FF6E00' : sig.status === 'SIGNED' ? '#a5d6a7' : '#e0e0e0',
                      borderWidth: sig.status === 'PENDING' ? 2 : 1,
                      bgcolor: sig.status === 'PENDING' ? '#fff8f0' : 'white',
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: sig.avatarColor, fontSize: 13, fontWeight: 700 }}>{sig.initials}</Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{sig.name}</Typography>
                            <Chip label={scfg.label} size="small" icon={<Box sx={{ display: 'flex', pl: 0.5, color: scfg.color }}>{scfg.icon}</Box>}
                              sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, color: scfg.color, bgcolor: scfg.bg }} />
                          </Box>
                          <Typography variant="caption" color="text.secondary">{sig.role}</Typography>
                        </Box>
                        <Chip label={sig.meaning} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 600, color: mcfg.color, bgcolor: mcfg.bg }} />
                      </Box>
                      {sig.status === 'SIGNED' && sig.signedAt && (
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CheckIcon sx={{ fontSize: 13, color: '#00AF95' }} />
                          <Typography variant="caption" sx={{ color: '#00AF95', fontWeight: 600 }}>{sig.signedDate} Â· {sig.signedAt}</Typography>
                        </Box>
                      )}
                    </Paper>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>

        {/* RIGHT â€” Signature Verification Display */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* Status summary card */}
          <Paper sx={{
            p: 2.5, borderRadius: 3,
            border: `1.5px solid ${isComplete ? '#a5d6a7' : '#bbdefb'}`,
            bgcolor: isComplete ? '#f1f8e9' : '#FFFFFF',
            display: 'flex', alignItems: 'center', gap: 2,
          }} elevation={0}>
            {isComplete
              ? <VerifiedIcon sx={{ fontSize: 36, color: '#1b5e20' }} />
              : <DrawIcon sx={{ fontSize: 36, color: '#044ED7' }} />}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: isComplete ? '#1b5e20' : '#060A3D' }}>
                {isComplete ? 'Document Fully Signed & Verified' : `${totalRequired - signedCount} Signature${totalRequired - signedCount > 1 ? 's' : ''} Remaining`}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isComplete
                  ? 'All required signatures have been captured and cryptographically verified.'
                  : `${signedCount} of ${totalRequired} required signatures collected Â· ${workflowType} workflow`}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShieldIcon sx={{ fontSize: 18, color: '#044ED7' }} />
              <Typography variant="caption" sx={{ color: '#044ED7', fontWeight: 600 }}>21 CFR Â§11.50 Compliant</Typography>
            </Box>
          </Paper>

          {/* Completed Signatures â€” Verification Panel */}
          <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e0e0e0' }} elevation={0}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
              <FingerprintIcon sx={{ color: '#044ED7', fontSize: 20 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#060A3D' }}>Signature Verification Record</Typography>
              <Chip label="IMMUTABLE" size="small" sx={{ ml: 'auto', height: 18, fontSize: '0.62rem', bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 700, border: '1px solid #a5d6a7' }} />
            </Box>

            {signatories.filter(s => s.status === 'SIGNED').length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, color: '#9e9e9e' }}>
                <DrawIcon sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
                <Typography variant="body2">No signatures yet</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {signatories.filter(s => s.status === 'SIGNED').map((sig, idx) => {
                  const mcfg = meaningConfig[sig.meaning];
                  return (
                    <Box key={sig.id}>
                      <Paper sx={{
                        p: 2.5, borderRadius: 2.5, bgcolor: '#fafffe',
                        border: '1px solid #e8f5e9', borderLeft: '4px solid #00AF95',
                      }} elevation={0}>
                        {/* Header row */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 40, height: 40, bgcolor: sig.avatarColor, fontSize: 14, fontWeight: 700 }}>{sig.initials}</Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#060A3D' }}>{sig.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{sig.role}</Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <VerifiedIcon sx={{ color: '#00AF95', fontSize: 18 }} />
                            <Chip label="VERIFIED" size="small" sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 700, fontSize: '0.65rem', height: 20, border: '1px solid #a5d6a7' }} />
                          </Box>
                        </Box>

                        {/* Signature details grid */}
                        <Grid container spacing={1.5} sx={{ mb: 2 }}>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Box sx={{ p: 1.25, bgcolor: '#f8fdf8', borderRadius: 1.5, border: '1px solid #e8f5e9' }}>
                              <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 0.25 }}>Meaning</Typography>
                              <Chip label={sig.meaning} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, color: mcfg.color, bgcolor: mcfg.bg }} />
                            </Box>
                          </Grid>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Box sx={{ p: 1.25, bgcolor: '#f8fdf8', borderRadius: 1.5, border: '1px solid #e8f5e9' }}>
                              <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 0.25 }}>Date</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: '#333', fontFamily: 'monospace' }}>{sig.signedDate}</Typography>
                            </Box>
                          </Grid>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Box sx={{ p: 1.25, bgcolor: '#f8fdf8', borderRadius: 1.5, border: '1px solid #e8f5e9' }}>
                              <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 0.25 }}>Time</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: '#333', fontFamily: 'monospace' }}>{sig.signedAt}</Typography>
                            </Box>
                          </Grid>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Box sx={{ p: 1.25, bgcolor: '#f8fdf8', borderRadius: 1.5, border: '1px solid #e8f5e9' }}>
                              <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 0.25 }}>Step</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: '#333' }}>Step {sig.order} of {signatories.length}</Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        {/* Comment */}
                        {sig.comment && (
                          <Box sx={{ mb: 2, p: 1.25, bgcolor: '#f0f7f0', borderRadius: 1.5, borderLeft: '3px solid #81c784' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>Signer's Statement</Typography>
                            <Typography variant="body2" sx={{ color: '#333', fontStyle: 'italic' }}>"{sig.comment}"</Typography>
                          </Box>
                        )}

                        {/* Hash */}
                        <Box sx={{ p: 1.25, bgcolor: '#f5f5f5', borderRadius: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LockIcon sx={{ fontSize: 13, color: '#044ED7', flexShrink: 0 }} />
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#555', fontSize: '0.7rem', flexGrow: 1, wordBreak: 'break-all' }}>
                            {sig.hash}
                          </Typography>
                          <Tooltip title="Copy hash">
                            <IconButton size="small" sx={{ p: 0.25 }} onClick={() => showSnackbar('Hash copied to clipboard', 'info')}>
                              <CopyIcon sx={{ fontSize: 13 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Paper>
                      {idx < signatories.filter(s => s.status === 'SIGNED').length - 1 && <Divider sx={{ my: 1 }} />}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>

          {/* Pending / Awaiting signatures */}
          {signatories.filter(s => s.status !== 'SIGNED').length > 0 && (
            <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e0e0e0' }} elevation={0}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#060A3D', mb: 2 }}>Pending Signatures</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {signatories.filter(s => s.status !== 'SIGNED').map(sig => {
                  const scfg = statusConfig[sig.status];
                  const mcfg = meaningConfig[sig.meaning];
                  return (
                    <Box key={sig.id} sx={{
                      p: 2, borderRadius: 2, border: '1px dashed',
                      borderColor: sig.status === 'PENDING' ? '#FF6E00' : '#e0e0e0',
                      bgcolor: sig.status === 'PENDING' ? '#fff8f0' : '#fafafa',
                      display: 'flex', alignItems: 'center', gap: 1.5,
                    }}>
                      <Avatar sx={{ width: 34, height: 34, bgcolor: sig.status === 'AWAITING' ? '#e0e0e0' : sig.avatarColor, fontSize: 12, fontWeight: 700, color: sig.status === 'AWAITING' ? '#9e9e9e' : 'white' }}>
                        {sig.initials}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>{sig.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{sig.role}</Typography>
                      </Box>
                      <Chip label={sig.meaning} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 600, color: mcfg.color, bgcolor: mcfg.bg }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', color: scfg.color }}>
                        {scfg.icon}
                        <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 600, color: scfg.color }}>{scfg.label}</Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          )}
        </Box>
      </Box>

      {/* â•â•â• RE-AUTHENTICATION + SIGN DIALOG â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Dialog open={reAuthOpen} onClose={() => reAuthStep !== 'verifying' && setReAuthOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {/* Step 1: Credentials */}
        {reAuthStep === 'credentials' && (
          <>
            <DialogTitle sx={{ fontWeight: 700, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LockIcon sx={{ color: '#044ED7' }} />
              Identity Verification Required
            </DialogTitle>
            <DialogContent>
              <Paper sx={{ p: 2, bgcolor: '#fff8e1', border: '1px solid #ffe082', borderRadius: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <ShieldIcon sx={{ color: '#FF6E00', fontSize: 18, mt: 0.25 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FF6E00', mb: 0.25 }}>FDA 21 CFR Part 11 â€” Â§11.200</Typography>
                    <Typography variant="body2" sx={{ color: '#5d4037' }}>
                      Electronic signatures require re-authentication of your identity before each signing event. Your credentials will not grant access to any other system.
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#555', display: 'block', mb: 0.5, fontWeight: 600 }}>Signing as</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Avatar sx={{ bgcolor: '#FF6E00', fontSize: 12, width: 32, height: 32, fontWeight: 700 }}>DB</Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Danilo B.</Typography>
                    <Typography variant="caption" color="text.secondary">Quality Assurance Â· USR-001</Typography>
                  </Box>
                </Box>
              </Box>

              <TextField
                label="Enter your password *"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                value={password}
                onChange={e => { setPassword(e.target.value); setPasswordError(''); }}
                error={!!passwordError}
                helperText={passwordError || 'Your password is never transmitted in plaintext.'}
                onKeyDown={e => e.key === 'Enter' && handleVerifyPassword()}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword(p => !p)}>
                        {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                autoFocus
              />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setReAuthOpen(false)} color="inherit">Cancel</Button>
              <Button variant="contained" onClick={handleVerifyPassword} disabled={!password} startIcon={<LockIcon />}>
                Verify Identity
              </Button>
            </DialogActions>
          </>
        )}

        {/* Step 2: Verifying */}
        {reAuthStep === 'verifying' && (
          <DialogContent sx={{ py: 6, textAlign: 'center' }}>
            <FingerprintIcon sx={{ fontSize: 64, color: '#044ED7', mb: 2, animation: 'pulse 1s infinite alternate', '@keyframes pulse': { from: { opacity: 0.6 }, to: { opacity: 1 } } }} />
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Verifying Identityâ€¦</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Authenticating credentials against secure identity store.</Typography>
            <LinearProgress sx={{ borderRadius: 2, height: 6 }} />
          </DialogContent>
        )}

        {/* Step 3: Sign */}
        {reAuthStep === 'sign' && (
          <>
            <DialogTitle sx={{ fontWeight: 700, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckIcon sx={{ color: '#00AF95' }} />
              Identity Verified â€” Sign Document
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              {/* Verified banner */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: '#e8f5e9', borderRadius: 1.5, border: '1px solid #a5d6a7' }}>
                <VerifiedIcon sx={{ color: '#00AF95', fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: '#1b5e20', fontWeight: 600 }}>
                  Identity verified for <strong>Danilo B.</strong> â€” 2026-04-02 at {new Date().toTimeString().slice(0, 8)} UTC
                </Typography>
              </Box>

              {/* Document details */}
              <Box sx={{ p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1.5, border: '1px solid #e0e0e0' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Signing</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#060A3D' }}>{documentName}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <Chip label={documentVersion} size="small" sx={{ height: 17, fontSize: '0.65rem', bgcolor: '#f0f0f0', color: '#555', fontWeight: 600 }} />
                  <Chip label={documentId} size="small" sx={{ height: 17, fontSize: '0.65rem', bgcolor: '#f0f0f0', color: '#555' }} />
                </Box>
              </Box>

              {/* Meaning of signature */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Meaning of Signature *</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  Per 21 CFR Â§11.50(a)(3), the signature must include its meaning. Select the meaning that applies.
                </Typography>
                <RadioGroup value={selectedMeaning} onChange={e => setSelectedMeaning(e.target.value as SignatureMeaning)}>
                  {(Object.entries(meaningConfig) as [SignatureMeaning, typeof meaningConfig[SignatureMeaning]][]).map(([key, cfg]) => (
                    <FormControlLabel
                      key={key}
                      value={key}
                      control={<Radio size="small" />}
                      label={
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label={key} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, color: cfg.color, bgcolor: cfg.bg }} />
                          </Box>
                          <Typography variant="caption" color="text.secondary">{cfg.description}</Typography>
                        </Box>
                      }
                      sx={{ mb: 0.75, alignItems: 'flex-start', '& .MuiRadio-root': { mt: 0.25 } }}
                    />
                  ))}
                </RadioGroup>
              </Box>

              {/* Comment */}
              <TextField
                label="Signer's Statement (optional)"
                placeholder="Add a statement to accompany your signature..."
                fullWidth
                multiline
                rows={2}
                value={signComment}
                onChange={e => setSignComment(e.target.value)}
                inputProps={{ maxLength: 500 }}
                helperText={`${signComment.length}/500`}
              />

              {/* Legal agreement checkbox */}
              <Paper sx={{ p: 2, bgcolor: '#f0f7ff', border: '1.5px solid #bbdefb', borderRadius: 2 }}>
                <FormControlLabel
                  control={<Radio checked={agreedToStatement} onChange={() => setAgreedToStatement(p => !p)} size="small" />}
                  label={
                    <Typography variant="body2" sx={{ color: '#044ED7' }}>
                      I understand that this electronic signature is the legally binding equivalent of my handwritten signature on this document. I confirm the information above is accurate and complete.
                    </Typography>
                  }
                  sx={{ alignItems: 'flex-start', '& .MuiRadio-root': { mt: 0.25 } }}
                />
              </Paper>
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
              <Button onClick={() => setReAuthOpen(false)} color="inherit">Cancel</Button>
              <Button
                variant="contained"
                disabled={!agreedToStatement}
                onClick={handleConfirmSignature}
                startIcon={<DrawIcon />}
                sx={{ bgcolor: '#1b5e20', '&:hover': { bgcolor: '#00AF95' }, '&:disabled': { bgcolor: '#e0e0e0' } }}
              >
                Apply Signature
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

