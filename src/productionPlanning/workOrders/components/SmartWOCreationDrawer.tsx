import React, { useState } from 'react';
import {
  Drawer, Box, Typography, IconButton, Chip, Paper, Stack, Divider,
  Table, TableHead, TableBody, TableRow, TableCell,
  Accordion, AccordionSummary, AccordionDetails,
  Select, MenuItem, TextField, FormControl, InputLabel, Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  AutoAwesome as AutoAwesomeIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  LibraryAdd as BatchIcon,
  Edit as ManualIcon,
} from '@mui/icons-material';
import { planningTokens } from '../../ui/planningTheme';

type CreationPath = 'ai-mps-mrp' | 'single-wo' | 'multiple-planned' | 'manual';

interface SmartWOCreationDrawerProps {
  open: boolean;
  onClose: () => void;
}

const CREATION_PATHS: {
  id: CreationPath;
  icon: React.ReactNode;
  label: string;
  description: string;
  badge?: { label: string; color: string; bg: string; border: string };
}[] = [
  {
    id: 'ai-mps-mrp',
    icon: <AutoAwesomeIcon sx={{ color: planningTokens.aiAccent, fontSize: 20 }} />,
    label: 'AI-assisted from Approved MPS/MRP',
    description: 'AI analyzes approved MPS/MRP lines, detects material risks, capacity constraints, and sequencing decisions to propose optimal planned orders.',
    badge: { label: 'Recommended', color: planningTokens.success, bg: planningTokens.successBg, border: planningTokens.successBorder },
  },
  {
    id: 'single-wo',
    icon: <AddIcon sx={{ color: planningTokens.primaryBlue, fontSize: 20 }} />,
    label: 'Create Single WO',
    description: 'For one planned order or one MPS/MRP line selected. Direct creation with minimal configuration.',
  },
  {
    id: 'multiple-planned',
    icon: <BatchIcon sx={{ color: planningTokens.primaryBlue, fontSize: 20 }} />,
    label: 'Create Multiple Planned Orders',
    description: 'For multiple approved MPS/MRP lines selected. Batch creation with shared parameters.',
  },
  {
    id: 'manual',
    icon: <ManualIcon sx={{ color: planningTokens.textSecondary, fontSize: 20 }} />,
    label: 'Manual WO Creation',
    description: 'For ad-hoc WOs or when no valid MPS/MRP source exists. Full manual entry.',
  },
];

type ReadinessTone = 'Ready' | 'Warning' | 'Blocked';
type RiskTone = 'Material Warning' | 'Capacity At Risk' | 'Missing Data';

const READINESS_TONE: Record<ReadinessTone, { bg: string; color: string; border: string }> = {
  Ready:   { bg: planningTokens.successBg, color: planningTokens.success, border: planningTokens.successBorder },
  Warning: { bg: planningTokens.warningBg, color: planningTokens.warning, border: planningTokens.warningBorder },
  Blocked: { bg: planningTokens.dangerBg,  color: planningTokens.danger,  border: planningTokens.dangerBorder },
};

const RISK_TONE: Record<RiskTone, { bg: string; color: string; border: string }> = {
  'Material Warning': { bg: planningTokens.warningAmberBg, color: planningTokens.warningAmber, border: '#FDE68A' },
  'Capacity At Risk': { bg: planningTokens.warningBg,      color: planningTokens.warning,       border: planningTokens.warningBorder },
  'Missing Data':     { bg: planningTokens.dangerBg,       color: planningTokens.danger,        border: planningTokens.dangerBorder },
};

const CANDIDATES: {
  ref: string; product: string; qty: string; line: string;
  plannedStart: string; readiness: ReadinessTone; risk: RiskTone; output: string;
}[] = [
  { ref: 'MPS-000123-10',    product: 'FG-1001', qty: '40,000 PCS', line: 'Line 10', plannedStart: 'Jun 03, 04:00', readiness: 'Ready',   risk: 'Material Warning', output: 'Planned Order'   },
  { ref: 'MRP-PL02-0156-20', product: 'FG-2001', qty: '10,000 PCS', line: 'Line 20', plannedStart: 'Jun 20, 04:00', readiness: 'Warning', risk: 'Capacity At Risk', output: 'Planned Order'   },
  { ref: 'MRP-PL03-0045-10', product: 'FG-4001', qty: '8,000 PCS',  line: 'Line 30', plannedStart: 'Jun 14, 04:00', readiness: 'Blocked', risk: 'Missing Data',    output: 'Review Required' },
];

const CELL_SX = { fontSize: '0.7rem', py: 0.75, px: 1, borderBottom: `1px solid ${planningTokens.border}` } as const;
const HEAD_CELL_SX = { ...CELL_SX, fontWeight: 800, color: planningTokens.textSecondary, bgcolor: planningTokens.surfaceMuted, whiteSpace: 'nowrap' } as const;

export default function SmartWOCreationDrawer({ open, onClose }: SmartWOCreationDrawerProps) {
  const [selectedPath, setSelectedPath] = useState<CreationPath>('ai-mps-mrp');
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const [qtySplitRule, setQtySplitRule] = useState('');
  const [batchSize, setBatchSize] = useState('');
  const [priority, setPriority] = useState('');
  const [schedulingAssumption, setSchedulingAssumption] = useState('');
  const [aiParameters, setAiParameters] = useState('');

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 680 },
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          bgcolor: planningTokens.background,
          backgroundImage: 'none',
          boxShadow: '-12px 0 34px rgba(15,23,42,0.10)',
          borderLeft: `1px solid ${planningTokens.border}`,
        },
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          p: 2.5,
          background: 'linear-gradient(135deg, #044ED7 0%, #1D74FF 100%)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 900, color: 'white', lineHeight: 1.2 }}>
            Smart Work Order Creation
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', mt: 0.5 }}>
            AI-guided · Minimize manual decisions
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' }, ml: 1 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* ── Scrollable Content ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
        <Stack spacing={2.5}>

          {/* Section: AI Banner */}
          <Box
            sx={{
              bgcolor: planningTokens.aiAccentBg,
              border: `1px solid ${planningTokens.aiAccentBorder}`,
              borderRadius: 2,
              p: 1.75,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
            }}
          >
            <AutoAwesomeIcon sx={{ color: planningTokens.aiAccent, fontSize: 20, mt: 0.1, flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 13, color: planningTokens.textPrimary, lineHeight: 1.65 }}>
                We found <strong>7 approved MPS/MRP lines</strong> eligible for WO creation.
                Recommended path: <strong>AI-assisted planned order generation.</strong>
              </Typography>
            </Box>
            <Chip
              label="High Confidence"
              size="small"
              sx={{
                bgcolor: planningTokens.successBg,
                color: planningTokens.success,
                border: `1px solid ${planningTokens.successBorder}`,
                fontWeight: 700,
                fontSize: '0.68rem',
                flexShrink: 0,
                mt: 0.1,
              }}
            />
          </Box>

          {/* Section: Creation Path Cards */}
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: planningTokens.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.25 }}>
              Select Creation Path
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              {CREATION_PATHS.map((path) => {
                const isSelected = selectedPath === path.id;
                return (
                  <Paper
                    key={path.id}
                    elevation={0}
                    onClick={() => setSelectedPath(path.id)}
                    sx={{
                      border: isSelected
                        ? `2px solid ${planningTokens.primaryBlue}`
                        : `1px solid ${planningTokens.border}`,
                      bgcolor: isSelected ? planningTokens.neutralBg : planningTokens.surface,
                      borderRadius: 2,
                      p: 1.75,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        borderColor: planningTokens.primaryBlue,
                        bgcolor: planningTokens.neutralBg,
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                      <Box sx={{ mt: 0.1, flexShrink: 0 }}>{path.icon}</Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.75, mb: 0.5 }}>
                          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: planningTokens.textPrimary, lineHeight: 1.3 }}>
                            {path.label}
                          </Typography>
                          {path.badge && (
                            <Chip
                              label={path.badge.label}
                              size="small"
                              sx={{
                                bgcolor: path.badge.bg,
                                color: path.badge.color,
                                border: `1px solid ${path.badge.border}`,
                                fontSize: '0.62rem',
                                fontWeight: 800,
                                height: 18,
                              }}
                            />
                          )}
                        </Box>
                        <Typography sx={{ fontSize: 11, color: planningTokens.textSecondary, lineHeight: 1.55 }}>
                          {path.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          </Box>

          {/* Section: Recommended Candidates Preview */}
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: planningTokens.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.25 }}>
              Recommended Candidates Preview
            </Typography>
            <Paper elevation={0} sx={{ border: `1px solid ${planningTokens.border}`, borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ overflowX: 'auto', maxHeight: 220 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {['Source Ref', 'Product', 'Qty', 'Line', 'Planned Start', 'Readiness', 'Risk', 'Proposed Output'].map((col) => (
                        <TableCell key={col} sx={HEAD_CELL_SX}>{col}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {CANDIDATES.map((row, idx) => {
                      const readinessTone = READINESS_TONE[row.readiness];
                      const riskTone = RISK_TONE[row.risk];
                      return (
                        <TableRow key={row.ref} sx={{ bgcolor: idx % 2 === 0 ? planningTokens.surface : planningTokens.background }}>
                          <TableCell sx={{ ...CELL_SX, fontWeight: 700, color: planningTokens.primaryBlue, whiteSpace: 'nowrap' }}>{row.ref}</TableCell>
                          <TableCell sx={{ ...CELL_SX, fontWeight: 600, whiteSpace: 'nowrap' }}>{row.product}</TableCell>
                          <TableCell sx={{ ...CELL_SX, whiteSpace: 'nowrap' }}>{row.qty}</TableCell>
                          <TableCell sx={{ ...CELL_SX, whiteSpace: 'nowrap' }}>{row.line}</TableCell>
                          <TableCell sx={{ ...CELL_SX, whiteSpace: 'nowrap' }}>{row.plannedStart}</TableCell>
                          <TableCell sx={CELL_SX}>
                            <Chip
                              label={row.readiness}
                              size="small"
                              sx={{
                                bgcolor: readinessTone.bg,
                                color: readinessTone.color,
                                border: `1px solid ${readinessTone.border}`,
                                fontSize: '0.62rem',
                                fontWeight: 800,
                                height: 18,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={CELL_SX}>
                            <Chip
                              label={row.risk}
                              size="small"
                              sx={{
                                bgcolor: riskTone.bg,
                                color: riskTone.color,
                                border: `1px solid ${riskTone.border}`,
                                fontSize: '0.62rem',
                                fontWeight: 800,
                                height: 18,
                                whiteSpace: 'nowrap',
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ ...CELL_SX, whiteSpace: 'nowrap', color: planningTokens.textSecondary }}>{row.output}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            </Paper>
          </Box>

          {/* Section: Advanced Options */}
          <Accordion
            expanded={advancedExpanded}
            onChange={() => setAdvancedExpanded(!advancedExpanded)}
            elevation={0}
            sx={{
              border: `1px solid ${planningTokens.border}`,
              borderRadius: '8px !important',
              bgcolor: planningTokens.surface,
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ fontSize: 18, color: planningTokens.textSecondary }} />}
              sx={{ minHeight: 44, px: 1.75, '& .MuiAccordionSummary-content': { my: 0 } }}
            >
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: planningTokens.textSecondary }}>
                Advanced Options
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, pb: 1.75, px: 1.75 }}>
              <Divider sx={{ mb: 1.75, borderColor: planningTokens.border }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ fontSize: 12 }}>Qty Split Rules</InputLabel>
                  <Select
                    value={qtySplitRule}
                    label="Qty Split Rules"
                    onChange={(e) => setQtySplitRule(e.target.value)}
                    sx={{ fontSize: 12 }}
                  >
                    {['No Split', 'Split by Shift', 'Split by Batch Size', 'Custom'].map((o) => (
                      <MenuItem key={o} value={o} sx={{ fontSize: 12 }}>{o}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  label="Batch Size"
                  value={batchSize}
                  onChange={(e) => setBatchSize(e.target.value)}
                  InputProps={{ sx: { fontSize: 12 } }}
                  InputLabelProps={{ sx: { fontSize: 12 } }}
                />
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ fontSize: 12 }}>Priority</InputLabel>
                  <Select
                    value={priority}
                    label="Priority"
                    onChange={(e) => setPriority(e.target.value)}
                    sx={{ fontSize: 12 }}
                  >
                    {['Critical', 'High', 'Medium', 'Low'].map((o) => (
                      <MenuItem key={o} value={o} sx={{ fontSize: 12 }}>{o}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ fontSize: 12 }}>Scheduling Assumptions</InputLabel>
                  <Select
                    value={schedulingAssumption}
                    label="Scheduling Assumptions"
                    onChange={(e) => setSchedulingAssumption(e.target.value)}
                    sx={{ fontSize: 12 }}
                  >
                    {['Standard Lead Time', 'Compressed', 'Buffer +20%', 'Custom'].map((o) => (
                      <MenuItem key={o} value={o} sx={{ fontSize: 12 }}>{o}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ mt: 1.5 }}>
                <TextField
                  size="small"
                  label="AI Parameters"
                  value={aiParameters}
                  onChange={(e) => setAiParameters(e.target.value)}
                  multiline
                  rows={2}
                  fullWidth
                  placeholder="Optional: custom constraints or notes for the AI engine"
                  InputProps={{ sx: { fontSize: 12 } }}
                  InputLabelProps={{ sx: { fontSize: 12 } }}
                />
              </Box>
            </AccordionDetails>
          </Accordion>

        </Stack>
      </Box>

      {/* ── Footer ── */}
      <Box
        sx={{
          flexShrink: 0,
          borderTop: `1px solid ${planningTokens.border}`,
          p: 2,
          bgcolor: planningTokens.surface,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              onClick={onClose}
              sx={{
                fontWeight: 700,
                textTransform: 'none',
                borderColor: planningTokens.border,
                color: planningTokens.textSecondary,
                '&:hover': { borderColor: planningTokens.primaryBlue, color: planningTokens.primaryBlue },
              }}
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="outlined"
              sx={{
                fontWeight: 700,
                textTransform: 'none',
                borderColor: planningTokens.border,
                color: planningTokens.textSecondary,
                '&:hover': { borderColor: planningTokens.primaryBlue, color: planningTokens.primaryBlue },
              }}
            >
              Review Details
            </Button>
          </Stack>
          <Button
            size="small"
            variant="contained"
            sx={{
              bgcolor: planningTokens.primaryBlue,
              '&:hover': { bgcolor: planningTokens.primaryBlueAlt },
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            Continue with Recommended Option
          </Button>
        </Box>
        <Typography sx={{ fontSize: 11, fontStyle: 'italic', color: planningTokens.textMuted, textAlign: 'center' }}>
          AI recommends. Planner confirms before any Work Order or Planned Order is created.
        </Typography>
      </Box>
    </Drawer>
  );
}
