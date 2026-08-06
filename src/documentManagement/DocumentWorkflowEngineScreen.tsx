import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Chip,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Divider,
  Tooltip,
  Snackbar,
  Alert,
  LinearProgress,
  Collapse,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Grid,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,

  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  PlayCircle as ActiveIcon,
  Warning as WarningIcon,
  AccountTree as WorkflowIcon,
  Schedule as ScheduleIcon,
  PersonAdd as PersonAddIcon,
  Rule as RuleIcon,
  ContentCopy as CopyIcon,
  Edit as EditIcon,
  SwapHoriz as SwapIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ArrowForward as ArrowForwardIcon,
  AccessTime as ClockIcon,
  Person as PersonIcon,
  CheckBox as CheckBoxIcon,
  Speed as SpeedIcon,
  DoneAll as DoneAllIcon,
  ErrorOutline as ErrorOutlineIcon,
  Timer as TimerIcon,
  VerifiedUser as VerifiedUserIcon,
  Route as RouteIcon,
  Hub as HubIcon,
  Timer as SlaIcon,
  CalendarMonth as CalendarMonthIcon,
  Visibility as VisibilityIcon,
  FilterAlt as FilterAltIcon,
  OpenInFull as OpenInFullIcon,
  CloseFullscreen as CloseFullscreenIcon,
  AutoAwesome as SparkleIcon,
} from '@mui/icons-material';

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Types
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type StepStatus = 'completed' | 'active' | 'overdue' | 'pending';
type RoutingType = 'sequential' | 'parallel' | 'conditional';

interface WorkflowStep {
  id: string;
  label: string;
  assignee: string;
  role: string;
  status: StepStatus;
  dueDate: string;
  elapsed: string;
  slaHours: number;
  usedHours: number;
}

interface ActiveWorkflow {
  id: string;
  docName: string;
  docType: string;
  owner: string;
  template: string;
  routing: RoutingType;
  currentStep: number;
  steps: WorkflowStep[];
  overallSlaHours: number;
  usedHours: number;
  startDate: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  routing: RoutingType;
  steps: { label: string; role: string; slaHours: number }[];
  avgCycleHours: number;
  usageCount: number;
}

interface ConditionalRule {
  id: string;
  name: string;
  enabled: boolean;
  triggerEvent: string;
  ifDocType: string;
  metaField: string;
  operator: string;
  metaValue: string;
  actionType: string;
  actionTarget: string;
  logic: 'AND' | 'OR';
}

interface Delegation {
  id: string;
  delegator: string;
  delegate: string;
  secondaryDelegates?: string[];
  fromDate: string;
  toDate: string;
  docTypes: string[];
}

interface PlannerSuggestion {
  id: string;
  title: string;
  reason: string;
  cadence: string;
  priority: 'High' | 'Medium' | 'Low';
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Mock data
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const mockActiveWorkflows: ActiveWorkflow[] = [
  {
    id: 'WF-001', docName: 'SOP-001 Changeover Procedure.pdf', docType: 'SOP',
    owner: 'Marcus Chods', template: 'SOP Quality Review', routing: 'sequential',
    currentStep: 2, overallSlaHours: 72, usedHours: 18, startDate: 'Apr 1, 2026',
    steps: [
      { id: 's1', label: 'Technical Review', assignee: 'Dougie Wood', role: 'Engineer', status: 'completed', dueDate: 'Apr 2', elapsed: '8h', slaHours: 24, usedHours: 8 },
      { id: 's2', label: 'Quality Sign-off', assignee: 'George Whales', role: 'Quality Lead', status: 'active', dueDate: 'Apr 3', elapsed: '10h', slaHours: 24, usedHours: 10 },
      { id: 's3', label: 'Final Approval', assignee: 'Chris Klopp', role: 'Manager', status: 'pending', dueDate: 'Apr 4', elapsed: '-', slaHours: 24, usedHours: 0 },
    ],
  },
  {
    id: 'WF-002', docName: 'NC-2024-0103 Temperature Excursion.pdf', docType: 'NC',
    owner: 'Dougie Wood', template: 'NC Investigation', routing: 'sequential',
    currentStep: 1, overallSlaHours: 48, usedHours: 51, startDate: 'Mar 29, 2026',
    steps: [
      { id: 's1', label: 'Root Cause Analysis', assignee: 'Dougie Wood', role: 'Engineer', status: 'overdue', dueDate: 'Mar 31', elapsed: '51h', slaHours: 24, usedHours: 51 },
      { id: 's2', label: 'Corrective Action', assignee: 'Marcus Chods', role: 'Supervisor', status: 'pending', dueDate: 'Apr 2', elapsed: '-', slaHours: 12, usedHours: 0 },
      { id: 's3', label: 'Management Review', assignee: 'Chris Klopp', role: 'Manager', status: 'pending', dueDate: 'Apr 3', elapsed: '-', slaHours: 12, usedHours: 0 },
    ],
  },
  {
    id: 'WF-003', docName: 'WI-042 Syringe Assembly.docx', docType: 'Work Instruction',
    owner: 'Marcus Chods', template: 'Standard Review', routing: 'parallel',
    currentStep: 1, overallSlaHours: 48, usedHours: 6, startDate: 'Apr 2, 2026',
    steps: [
      { id: 's1', label: 'Engineering Review', assignee: 'Dougie Wood', role: 'Engineer', status: 'active', dueDate: 'Apr 4', elapsed: '6h', slaHours: 48, usedHours: 6 },
      { id: 's2', label: 'Safety Review', assignee: 'George Whales', role: 'Safety Lead', status: 'active', dueDate: 'Apr 4', elapsed: '6h', slaHours: 48, usedHours: 6 },
      { id: 's3', label: 'Final Sign-off', assignee: 'Chris Klopp', role: 'Manager', status: 'pending', dueDate: 'Apr 5', elapsed: '-', slaHours: 12, usedHours: 0 },
    ],
  },
  {
    id: 'WF-004', docName: 'Quality Manual v8.docx', docType: 'Manual',
    owner: 'Chris Klopp', template: 'Emergency Change', routing: 'sequential',
    currentStep: 3, overallSlaHours: 24, usedHours: 22, startDate: 'Apr 2, 2026',
    steps: [
      { id: 's1', label: 'Author Submission', assignee: 'Chris Klopp', role: 'Author', status: 'completed', dueDate: 'Apr 2', elapsed: '2h', slaHours: 4, usedHours: 2 },
      { id: 's2', label: 'Peer Review', assignee: 'Marcus Chods', role: 'Reviewer', status: 'completed', dueDate: 'Apr 2', elapsed: '8h', slaHours: 10, usedHours: 8 },
      { id: 's3', label: 'Quality Approval', assignee: 'George Whales', role: 'Quality', status: 'active', dueDate: 'Apr 3', elapsed: '12h', slaHours: 10, usedHours: 12 },
    ],
  },
];

const mockTemplates: WorkflowTemplate[] = [
  {
    id: 'T-001', name: 'SOP Quality Review', routing: 'sequential',
    description: 'Standard approval pipeline for SOPs. Requires technical, quality, and management sign-off.',
    steps: [
      { label: 'Technical Review', role: 'Engineer', slaHours: 24 },
      { label: 'Quality Sign-off', role: 'Quality Lead', slaHours: 24 },
      { label: 'Final Approval', role: 'Manager', slaHours: 24 },
    ],
    avgCycleHours: 58, usageCount: 34,
  },
  {
    id: 'T-002', name: 'NC Investigation', routing: 'sequential',
    description: 'Non-conformance investigation pipeline with mandatory root cause analysis and corrective action.',
    steps: [
      { label: 'Root Cause Analysis', role: 'Engineer', slaHours: 24 },
      { label: 'Corrective Action', role: 'Supervisor', slaHours: 12 },
      { label: 'Management Review', role: 'Manager', slaHours: 12 },
    ],
    avgCycleHours: 42, usageCount: 18,
  },
  {
    id: 'T-003', name: 'Parallel Safety Review', routing: 'parallel',
    description: 'Engineering and safety teams review simultaneously to reduce cycle time.',
    steps: [
      { label: 'Engineering Review', role: 'Engineer', slaHours: 48 },
      { label: 'Safety Review', role: 'Safety Lead', slaHours: 48 },
      { label: 'Final Sign-off', role: 'Manager', slaHours: 12 },
    ],
    avgCycleHours: 36, usageCount: 12,
  },
  {
    id: 'T-004', name: 'Emergency Change', routing: 'sequential',
    description: 'Expedited review for urgent document changes. Compressed SLA timelines.',
    steps: [
      { label: 'Author Submission', role: 'Author', slaHours: 4 },
      { label: 'Peer Review', role: 'Reviewer', slaHours: 10 },
      { label: 'Quality Approval', role: 'Quality', slaHours: 10 },
    ],
    avgCycleHours: 21, usageCount: 7,
  },
];

const mockRules: ConditionalRule[] = [
  { id: 'R-001', name: 'Safety SOP Routing', enabled: true, triggerEvent: 'On Upload', ifDocType: 'SOP', metaField: 'Category', operator: 'Equals', metaValue: 'Safety', logic: 'AND', actionType: 'Trigger Workflow', actionTarget: 'SOP Quality Review' },
  { id: 'R-002', name: 'Critical NC Escalation', enabled: true, triggerEvent: 'On Upload', ifDocType: 'NC', metaField: 'Severity', operator: 'Equals', metaValue: 'Critical', logic: 'AND', actionType: 'Assign Task', actionTarget: 'Quality Director' },
  { id: 'R-003', name: 'External Manual Legal Review', enabled: false, triggerEvent: 'On Status Change', ifDocType: 'Manual', metaField: 'Owner', operator: 'Equals', metaValue: 'External', logic: 'OR', actionType: 'Trigger Workflow', actionTarget: 'Standard Review' },
  { id: 'R-004', name: 'Line 2 Work Instruction', enabled: true, triggerEvent: 'On Check-in', ifDocType: 'Work Instruction', metaField: 'Line', operator: 'Equals', metaValue: 'Line 2', logic: 'AND', actionType: 'Assign Task', actionTarget: 'Line 2 Supervisor' },
];

const mockDelegations: Delegation[] = [
  { id: 'D-001', delegator: 'George Whales', delegate: 'Marcus Chods', secondaryDelegates: ['Dougie Wood'], fromDate: 'Apr 3, 2026', toDate: 'Apr 10, 2026', docTypes: ['SOP', 'Manual'] },
  { id: 'D-002', delegator: 'Chris Klopp', delegate: 'Dougie Wood', secondaryDelegates: ['Jane Doette', 'Sarah Jenkins'], fromDate: 'Apr 5, 2026', toDate: 'Apr 8, 2026', docTypes: ['NC', 'Report'] },
];

const DOC_TYPES = ['SOP', 'Manual', 'Work Instruction', 'NC', 'Report', 'Any'];
const ROLES = ['Engineer', 'Quality Lead', 'Manager', 'Safety Lead', 'Supervisor', 'Author', 'Reviewer', 'Quality Director', 'Legal Counsel'];
const REVIEWERS = ['Marcus Chods', 'Dougie Wood', 'Jane Doette', 'Sarah Jenkins', 'Chris Klopp', 'George Whales'];

const plannerOccurrenceColumns = ['Mon 8', 'Tue 9', 'Wed 10', 'Thu 11', 'Fri 12'];

const plannerCards = [
  { id: 'OC-001', day: 'Mon 8', title: 'Weekly SOP Line 10', status: 'Under Revision', color: '#90caf9', files: ['SOP-101', 'WI-13'], cadence: 'Weekly' },
  { id: 'OC-002', day: 'Tue 9', title: 'Bi-Weekly E-signatures', status: 'Waiting for approval', color: '#ffcc80', files: ['MAN-21', 'QM-5'], cadence: 'Bi-weekly' },
  { id: 'OC-003', day: 'Wed 10', title: 'Monthly NC Review', status: 'Disapproved', color: '#f48fb1', files: ['NC-77', 'NC-81'], cadence: 'Monthly' },
  { id: 'OC-004', day: 'Thu 11', title: 'Template Refresh', status: 'Approved', color: '#a5d6a7', files: ['TPL-9'], cadence: 'Weekly' },
  { id: 'OC-005', day: 'Fri 12', title: 'Syringe Cell SOP', status: 'New', color: '#ce93d8', files: ['SOP-202'], cadence: 'Weekly' },
  { id: 'OC-006', day: 'Tue 9', title: 'Shift Work Instruction', status: 'Under Revision', color: '#90caf9', files: ['WI-201', 'WI-202'], cadence: 'Bi-weekly' },
];

const plannerRightRows = [
  { id: 'F-1001', fileName: 'Global BD Management - SOP', number: 'GL-CE-01-01-0', version: '10', status: 'Approved', author: 'John' },
  { id: 'F-1002', fileName: 'Global BD Management - WI', number: 'GL-CE-01-01-1', version: '10', status: 'Disapproved', author: 'John' },
  { id: 'F-1003', fileName: 'Global BD Management - NC', number: 'GL-CE-01-01-2', version: '10', status: 'New', author: 'John' },
  { id: 'F-1004', fileName: 'Global BD Management - Manual', number: 'GL-CE-01-01-3', version: '10', status: 'Under Revision', author: 'John' },
  { id: 'F-1005', fileName: 'Global BD Management - Audit', number: 'GL-CE-01-01-4', version: '10', status: 'Waiting for approval', author: 'John' },
  { id: 'F-1006', fileName: 'Global BD Management - Training', number: 'GL-CE-01-01-5', version: '10', status: 'Approved', author: 'John' },
];

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Color helpers
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const stepColors: Record<StepStatus, { color: string; bg: string; glassBg: string; icon: React.ReactNode }> = {
  completed: { color: '#00AF95', bg: '#ecfdf5', glassBg: 'rgba(16, 185, 129, 0.1)', icon: <CheckCircleIcon sx={{ fontSize: 18, color: '#00AF95' }} /> },
  active:    { color: '#1D74FF', bg: '#EBEDF0', glassBg: 'rgba(59, 130, 246, 0.1)', icon: <ActiveIcon sx={{ fontSize: 18, color: '#1D74FF' }} /> },
  overdue:   { color: '#E43B46', bg: '#fef2f2', glassBg: 'rgba(239, 68, 68, 0.1)', icon: <WarningIcon sx={{ fontSize: 18, color: '#E43B46' }} /> },
  pending:   { color: '#94a3bb', bg: '#EBEDF0', glassBg: 'rgba(148, 163, 184, 0.1)', icon: <PendingIcon sx={{ fontSize: 18, color: '#94a3bb' }} /> },
};

const routingColors: Record<RoutingType, { color: string; bg: string; glassBg: string; label: string }> = {
  sequential: { color: '#1D74FF', bg: '#EBEDF0', glassBg: 'rgba(59, 130, 246, 0.1)', label: 'Sequential' },
  parallel:   { color: '#9199D8', bg: '#f5f3ff', glassBg: 'rgba(139, 92, 246, 0.1)', label: 'Parallel' },
  conditional:{ color: '#FF6E00', bg: '#fffbeb', glassBg: 'rgba(245, 158, 11, 0.1)', label: 'Conditional' },
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Props
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface Props {
  onBack: () => void;
  embedded?: boolean;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Sub-components
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Visual horizontal pipeline for an active workflow */
function PipelineView({ wf }: { wf: ActiveWorkflow }) {
  return (
    <Box sx={{ 
      px: 4, 
      pb: 3, 
      pt: 2, 
      bgcolor: 'rgba(248, 250, 252, 0.5)', 
      backdropFilter: 'blur(8px)',
      borderTop: '1px solid rgba(226, 232, 240, 0.8)',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', pb: 1, py: 2 }}>
        {wf.steps.map((step, idx) => {
          const cfg = stepColors[step.status];
          const isLast = idx === wf.steps.length - 1;
          const isParallelActive = wf.routing === 'parallel' && step.status === 'active';
          
          return (
            <Box key={step.id} sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 150 }}>
                {/* Step node */}
                <Box
                  sx={{
                    width: 140,
                    border: step.status === 'active' || step.status === 'overdue' 
                      ? `2px solid ${cfg.color}` 
                      : `1px solid rgba(226, 232, 240, 0.8)`,
                    borderRadius: '12px',
                    p: 1.5,
                    bgcolor: cfg.glassBg,
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: step.status === 'active' || step.status === 'overdue'
                      ? `0 10px 25px -5px ${cfg.glassBg}`
                      : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 20px 25px -5px ${cfg.glassBg}`,
                    }
                  }}
                >
                  {/* Parallel indicator */}
                  {isParallelActive && (
                    <Box sx={{ 
                      position: 'absolute', 
                      top: -12, 
                      left: '50%', 
                      transform: 'translateX(-50%)',
                      bgcolor: '#9199D8',
                      color: 'white',
                      px: 1,
                      py: 0.25,
                      borderRadius: '10px',
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      boxShadow: '0 4px 10px rgba(139, 92, 246, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      zIndex: 2
                    }}>
                      <HubIcon sx={{ fontSize: 10 }} /> PARALLEL
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: 24,
                      height: 24,
                      borderRadius: '6px',
                      bgcolor: cfg.color,
                      color: 'white',
                      boxShadow: `0 4px 6px -1px ${cfg.glassBg}`
                    }}>
                      {cfg.icon}
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#1F2366', fontSize: '0.75rem', letterSpacing: '0.01em' }}>
                      {step.label}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ width: 20, height: 20, fontSize: 10, fontWeight: 700, bgcolor: cfg.color }}>{step.assignee.charAt(0)}</Avatar>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#626465', fontWeight: 600 }}>{step.assignee}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                    <ClockIcon sx={{ fontSize: 12, color: '#808285' }} />
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#808285' }}>
                      Due: {step.dueDate}
                    </Typography>
                  </Box>

                  {step.status !== 'pending' && (
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontSize: '0.6rem', color: cfg.color, fontWeight: 700 }}>
                          SLA Progress
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#626465', fontWeight: 600 }}>
                          {step.usedHours}h / {step.slaHours}h
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((step.usedHours / step.slaHours) * 100, 100)}
                        sx={{
                          height: 4, borderRadius: 2,
                          bgcolor: '#DBDDDF',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: cfg.color,
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
              
              {/* Connector line with custom arrow */}
              {!isLast && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  flexGrow: 0, 
                  width: 40,
                  height: 2, 
                  bgcolor: step.status === 'completed' ? '#00AF95' : '#DBDDDF',
                  position: 'relative',
                  mx: -0.5,
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    right: -2,
                    top: -4,
                    width: 0,
                    height: 0,
                    borderTop: '5px solid transparent',
                    borderBottom: '5px solid transparent',
                    borderLeft: `6px solid ${step.status === 'completed' ? '#00AF95' : '#DBDDDF'}`,
                  }
                }} />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Main Component
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function DocumentWorkflowEngineScreen({ onBack, embedded = false }: Props) {
  const [tab, setTab] = useState(0);
  const [expandedWf, setExpandedWf] = useState<string | null>('WF-001');
  const [workflows, setWorkflows] = useState(mockActiveWorkflows);
  const [templates, setTemplates] = useState(mockTemplates);
  const [rules, setRules] = useState(mockRules);
  const [delegations, setDelegations] = useState(mockDelegations);

  // Template builder state
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateRouting, setNewTemplateRouting] = useState<RoutingType>('sequential');
  const [newTemplateSteps, setNewTemplateSteps] = useState([
    { label: 'Review', role: 'Reviewer', slaHours: 24 },
    { label: 'Approval', role: 'Manager', slaHours: 24 },
  ]);

  // Rule builder
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [newRule, setNewRule] = useState<Partial<ConditionalRule>>({ name: '', triggerEvent: 'On Upload', ifDocType: 'SOP', metaField: 'Category', operator: 'Equals', metaValue: '', actionType: 'Trigger Workflow', actionTarget: '', logic: 'AND' });

  // Delegation form
  const [showDelegationForm, setShowDelegationForm] = useState(false);
  const [newDelegation, setNewDelegation] = useState<Partial<Delegation>>({ delegator: '', delegate: '', secondaryDelegates: [], fromDate: '', toDate: '', docTypes: [] });
  const [plannerStatusFilters, setPlannerStatusFilters] = useState<string[]>(['Under Revision', 'Approved', 'Waiting for approval', 'Disapproved', 'New']);
  const [plannerExpanded, setPlannerExpanded] = useState(false);
  const [plannerViewMode, setPlannerViewMode] = useState<'week' | 'month'>('week');

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'info' | 'error' });
  const showSnackbar = (message: string, severity: 'success' | 'info' | 'error' = 'success') =>
    setSnackbar({ open: true, message, severity });

  // KPI computations
  const overdueCount = workflows.reduce((acc, wf) => acc + wf.steps.filter(s => s.status === 'overdue').length, 0);
  const avgCycle = Math.round(workflows.reduce((acc, wf) => acc + wf.usedHours, 0) / workflows.length);
  const completedToday = 2; // mock

  const plannerKpis = [
    { label: 'Total Files', value: '24K', border: '#9199D8' },
    { label: 'Waiting for approval', value: '1220', border: '#ffcc80' },
    { label: 'Disapproved', value: '1693', border: '#f48fb1' },
    { label: 'Under Revision', value: '77', border: '#90caf9' },
    { label: 'New', value: '7', border: '#ce93d8' },
  ];

  const statusChipStyle = (status: string) => {
    if (status === 'Approved') return { color: '#1b5e20', bg: '#c8e6c9' };
    if (status === 'Disapproved') return { color: '#c62828', bg: '#ffcdd2' };
    if (status === 'Under Revision') return { color: '#1565c0', bg: '#bbdefb' };
    if (status === 'Waiting for approval') return { color: '#ef6c00', bg: '#ffe0b2' };
    return { color: '#7b1fa2', bg: '#e1bee7' };
  };

  const plannerAiSuggestions: PlannerSuggestion[] = [
    {
      id: 'SUG-1',
      title: 'Auto-schedule quality sign-off every Monday',
      reason: 'BLU.AI detected repeated waiting approvals on SOP cadence after weekend updates.',
      cadence: 'Weekly',
      priority: 'High',
    },
    {
      id: 'SUG-2',
      title: 'Create bi-weekly NC review checkpoint',
      reason: 'Two disapproved artifacts are linked to NC templates with delayed review loops.',
      cadence: 'Bi-weekly',
      priority: 'Medium',
    },
    {
      id: 'SUG-3',
      title: 'Pre-route e-signatures for Friday close',
      reason: 'Late-week workflow traffic tends to leave approvals open over the weekend.',
      cadence: 'Weekly',
      priority: 'Low',
    },
  ];

  // Planner overview dashboard
  const PlannerOverviewTab = () => {
    const weekColumns = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const monthColumns = Array.from({ length: 28 }, (_, index) => `Day ${index + 1}`);
    const plannerColumns = plannerViewMode === 'month' ? monthColumns : weekColumns;

    const visiblePlannerCards = plannerColumns.flatMap((column, index) =>
      plannerCards
        .filter((card) => plannerStatusFilters.includes(card.status))
        .filter((_, cardIndex) => cardIndex % plannerColumns.length === index)
        .slice(0, plannerViewMode === 'month' ? 1 : 2)
        .map((card, cardRepeatIndex) => ({
          ...card,
          id: `${card.id}-${column}-${cardRepeatIndex}`,
          day: column,
          source: 'manual' as const,
        }))
    );

    const reactiveSuggestions = plannerAiSuggestions.map((item) => ({
      ...item,
      reason:
        item.id === 'SUG-1'
          ? `${item.reason} Currently ${plannerKpis[1].value} items are waiting for approval.`
          : item.id === 'SUG-2'
            ? `${item.reason} ${plannerKpis[2].value} artifacts are in disapproved status.`
            : `${item.reason} ${overdueCount} active workflow steps are already overdue.`,
    }));

    const fullScreenAiCalendarCards = plannerColumns.map((day, index) => {
      const suggestion = reactiveSuggestions[index % reactiveSuggestions.length];
      return { ...suggestion, id: `${suggestion.id}-${day}`, day, source: 'ai' as const };
    });

    const fullScreenMixedCards = [
      ...fullScreenAiCalendarCards,
      ...visiblePlannerCards,
    ];

    if (plannerExpanded) {
      return (
        <Box sx={{ position: 'fixed', inset: 0, zIndex: 1400, bgcolor: 'rgba(9, 14, 36, 0.35)', p: 2 }}>
          <Paper elevation={0} sx={{ height: '100%', borderRadius: 2.5, border: '1px solid #DBDDDF', p: 1.5, bgcolor: '#f7f9fc', display: 'flex', flexDirection: 'column' }}>
            <Paper elevation={0} sx={{ border: '1px solid #DBDDDF', borderRadius: 2, overflow: 'auto', height: '100%' }}>
              <Box sx={{ px: 1.5, py: 1.1, borderBottom: '1px solid #DBDDDF', bgcolor: '#eef3ff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SparkleIcon sx={{ color: '#1D74FF', fontSize: 16 }} />
                  <Typography sx={{ fontWeight: 800, color: '#1F2366', fontSize: '0.86rem' }}>Workflow Planner</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    size="small"
                    variant={plannerViewMode === 'week' ? 'contained' : 'outlined'}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                    onClick={() => setPlannerViewMode('week')}
                  >
                    Week
                  </Button>
                  <Button
                    size="small"
                    variant={plannerViewMode === 'month' ? 'contained' : 'outlined'}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                    onClick={() => setPlannerViewMode('month')}
                  >
                    Month
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<CloseFullscreenIcon />}
                    sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#1D74FF', '&:hover': { bgcolor: '#044ED7' } }}
                    onClick={() => setPlannerExpanded(false)}
                  >
                    Collapse
                  </Button>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: `140px repeat(${plannerColumns.length}, minmax(180px, 1fr))`, borderBottom: '1px solid #DBDDDF', bgcolor: '#f8fafc', minWidth: plannerViewMode === 'month' ? 5200 : 2200 }}>
                <Box sx={{ p: 1.2, borderRight: '1px solid #DBDDDF' }}>
                  <Typography sx={{ fontWeight: 700, color: '#1F2366', fontSize: '0.78rem' }}>Workflow</Typography>
                </Box>
                {plannerColumns.map((day) => (
                  <Box key={`fs-head-${day}`} sx={{ p: 1.2, borderRight: '1px solid #DBDDDF' }}>
                    <Typography sx={{ fontWeight: 700, color: '#1F2366', fontSize: '0.78rem' }}>{day}</Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: `140px repeat(${plannerColumns.length}, minmax(180px, 1fr))`, minHeight: 560, minWidth: plannerViewMode === 'month' ? 5200 : 2200 }}>
                <Box sx={{ borderRight: '1px solid #DBDDDF', p: 1.2, bgcolor: '#fafbff' }}>
                  <Typography variant="caption" sx={{ color: '#626465', fontWeight: 700, display: 'block', mb: 0.8 }}>Mixed</Typography>
                  <Typography variant="caption" sx={{ color: '#1F2366', display: 'block', mb: 0.8 }}>AI + Operational</Typography>
                  <Typography variant="caption" sx={{ color: '#1F2366', display: 'block', mb: 0.8 }}>Recurring</Typography>
                </Box>

                {plannerColumns.map((day) => (
                  <Box key={`fs-cell-${day}`} sx={{ p: 1, borderRight: '1px solid #DBDDDF', bgcolor: '#fcfdff' }}>
                    {fullScreenMixedCards.filter((card) => card.day === day).map((card) => (
                      <Paper
                        key={card.id}
                        elevation={0}
                        sx={{
                          mb: 1,
                          borderRadius: 2,
                          border: card.source === 'ai' ? '1px solid rgba(29, 116, 255, 0.35)' : '1px solid #DBDDDF',
                          background: card.source === 'ai' ? 'linear-gradient(135deg, rgba(29,116,255,0.12), rgba(255,255,255,1))' : '#ffffff',
                          p: 1.1,
                          boxShadow: card.source === 'ai' ? '0 8px 18px rgba(29,116,255,0.12)' : '0 4px 10px rgba(15, 23, 42, 0.06)',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.6 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                            {card.source === 'ai' ? <SparkleIcon sx={{ fontSize: 14, color: '#1D74FF' }} /> : <WorkflowIcon sx={{ fontSize: 14, color: '#626465' }} />}
                            <Typography sx={{ fontWeight: 800, color: card.source === 'ai' ? '#044ED7' : '#1F2366', fontSize: '0.68rem' }}>{card.source === 'ai' ? 'BLU.AI' : 'Workflow'}</Typography>
                          </Box>
                          {card.source === 'ai' ? (
                            <Chip
                              size="small"
                              label={card.priority}
                              sx={{
                                height: 18,
                                fontSize: '0.62rem',
                                fontWeight: 700,
                                bgcolor: card.priority === 'High' ? '#ffcdd2' : card.priority === 'Medium' ? '#ffe0b2' : '#c8e6c9',
                                color: card.priority === 'High' ? '#c62828' : card.priority === 'Medium' ? '#ef6c00' : '#1b5e20',
                              }}
                            />
                          ) : (
                            <Chip size="small" label={card.status} sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: '#EBEDF0', color: '#626465' }} />
                          )}
                        </Box>
                        <Typography sx={{ fontWeight: 700, color: '#1F2366', fontSize: '0.75rem', lineHeight: 1.25 }}>{card.title}</Typography>
                        <Typography variant="caption" sx={{ color: '#626465', display: 'block', mt: 0.6, lineHeight: 1.35 }}>{card.source === 'ai' ? card.reason : `${card.files.length} files in cadence.`}</Typography>
                        <Box sx={{ mt: 0.9, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Chip size="small" label={card.cadence} sx={{ height: 18, fontWeight: 700, fontSize: '0.62rem', bgcolor: '#EBEDF0', color: '#1F2366' }} />
                          {card.source === 'ai' ? (
                            <Button size="small" variant="text" sx={{ textTransform: 'none', fontWeight: 800 }} onClick={() => showSnackbar(`BLU.AI suggestion "${card.title}" applied.`, 'success')}>
                              Apply
                            </Button>
                          ) : (
                            <Button size="small" variant="text" sx={{ textTransform: 'none', fontWeight: 800 }} onClick={() => showSnackbar(`Workflow "${card.title}" opened.`, 'info')}>
                              Open
                            </Button>
                          )}
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                ))}
              </Box>
            </Paper>
          </Paper>
        </Box>
      );
    }

    return (
      <Box sx={{ p: 2.5 }}>
        <Paper elevation={0} sx={{ borderRadius: '20px', border: '1px solid rgba(226, 232, 240, 0.8)', p: 2.5, bgcolor: 'rgba(255, 255, 255, 0.75)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="caption" sx={{ color: '#626465', fontWeight: 700, mr: 0.5 }}>SHOWING:</Typography>
              {['Under Revision', 'Approved', 'Waiting for approval', 'Disapproved', 'New'].map((status) => {
                const style = statusChipStyle(status);
                return (
                  <Chip
                    key={status}
                    label={status}
                    onClick={() => {
                      setPlannerStatusFilters((prev) => (
                        prev.includes(status) ? prev.filter((item) => item !== status) : [...prev, status]
                      ));
                    }}
                    variant={plannerStatusFilters.includes(status) ? 'filled' : 'outlined'}
                    size="small"
                    sx={{ bgcolor: plannerStatusFilters.includes(status) ? style.bg : 'transparent', color: style.color, borderColor: style.bg, fontWeight: 700 }}
                  />
                );
              })}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button size="small" variant="outlined" sx={{ textTransform: 'none', borderRadius: 2 }} onClick={() => setPlannerStatusFilters(['Under Revision', 'Approved', 'Waiting for approval', 'Disapproved', 'New'])}>Clear</Button>
              <Button size="small" variant="outlined" startIcon={<CalendarMonthIcon />} sx={{ textTransform: 'none', borderRadius: 2 }}>Report Date Range</Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, mb: 2, overflowX: 'auto' }}>
            {plannerKpis.map((kpi) => (
              <Paper key={kpi.label} elevation={0} sx={{ minWidth: 150, p: 1.5, borderRadius: 2, border: '1px solid #DBDDDF', borderLeft: `4px solid ${kpi.border}` }}>
                <Typography sx={{ fontWeight: 800, color: '#1F2366', lineHeight: 1 }}>{kpi.value}</Typography>
                <Typography variant="caption" sx={{ color: '#626465', fontWeight: 600 }}>{kpi.label}</Typography>
              </Paper>
            ))}
          </Box>

          <Paper elevation={0} sx={{ mb: 2, borderRadius: 2, border: '1px solid #DBDDDF', bgcolor: '#f8fbff', p: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <SparkleIcon sx={{ fontSize: 16, color: '#1D74FF' }} />
              <Typography sx={{ fontWeight: 800, color: '#1F2366', fontSize: '0.82rem' }}>BLU.AI Suggested Recurring Workflows</Typography>
            </Box>
            <Grid container spacing={1}>
              {reactiveSuggestions.map((suggestion) => (
                <Grid key={suggestion.id} size={{ xs: 12, md: 4 }}>
                  <Paper elevation={0} sx={{ borderRadius: 1.5, border: '1px solid #DBDDDF', p: 1.1, bgcolor: '#ffffff' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.6 }}>
                      <Typography sx={{ fontWeight: 700, color: '#1F2366', fontSize: '0.75rem' }}>{suggestion.title}</Typography>
                      <Chip
                        size="small"
                        label={suggestion.priority}
                        sx={{
                          height: 18,
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          bgcolor: suggestion.priority === 'High' ? '#ffcdd2' : suggestion.priority === 'Medium' ? '#ffe0b2' : '#c8e6c9',
                          color: suggestion.priority === 'High' ? '#c62828' : suggestion.priority === 'Medium' ? '#ef6c00' : '#1b5e20',
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#626465', display: 'block', lineHeight: 1.35 }}>{suggestion.reason}</Typography>
                    <Box sx={{ mt: 0.9, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Chip size="small" label={suggestion.cadence} sx={{ height: 18, fontWeight: 700, fontSize: '0.62rem', bgcolor: '#EBEDF0', color: '#1F2366' }} />
                      <Button size="small" variant="text" sx={{ textTransform: 'none', fontWeight: 700, minWidth: 0, px: 0.5 }} onClick={() => showSnackbar(`BLU.AI added "${suggestion.title}" to your planner suggestions.`, 'success')}>
                        Apply
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper elevation={0} sx={{ border: '1px solid #DBDDDF', borderRadius: 2, overflow: 'auto' }}>
                <Box sx={{ px: 1.5, py: 1.1, borderBottom: '1px solid #DBDDDF', bgcolor: '#eef3ff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 800, color: '#1F2366', fontSize: '0.82rem' }}>Workflow Planner</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      size="small"
                      variant={plannerViewMode === 'week' ? 'contained' : 'outlined'}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                      onClick={() => setPlannerViewMode('week')}
                    >
                      Week
                    </Button>
                    <Button
                      size="small"
                      variant={plannerViewMode === 'month' ? 'contained' : 'outlined'}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                      onClick={() => setPlannerViewMode('month')}
                    >
                      Month
                    </Button>
                    <Button size="small" variant="contained" startIcon={<OpenInFullIcon />} sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#1D74FF', '&:hover': { bgcolor: '#044ED7' } }} onClick={() => setPlannerExpanded(true)}>
                      Expand
                    </Button>
                  </Box>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: `140px repeat(${plannerColumns.length}, minmax(130px, 1fr))`, borderBottom: '1px solid #DBDDDF', bgcolor: '#f8fafc', minWidth: plannerViewMode === 'month' ? 4200 : 'auto' }}>
                  <Box sx={{ p: 1.2, borderRight: '1px solid #DBDDDF' }}>
                    <Typography sx={{ fontWeight: 700, color: '#1F2366', fontSize: '0.78rem' }}>Status</Typography>
                  </Box>
                  {plannerColumns.map((day) => (
                    <Box key={day} sx={{ p: 1.2, borderRight: '1px solid #DBDDDF' }}>
                      <Typography sx={{ fontWeight: 700, color: '#1F2366', fontSize: '0.78rem' }}>{day}</Typography>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: `140px repeat(${plannerColumns.length}, minmax(130px, 1fr))`, minHeight: 380, minWidth: plannerViewMode === 'month' ? 4200 : 'auto' }}>
                  <Box sx={{ borderRight: '1px solid #DBDDDF', p: 1.2, bgcolor: '#fafafa' }}>
                    <Typography variant="caption" sx={{ color: '#626465', fontWeight: 700, display: 'block', mb: 0.8 }}>Recurring</Typography>
                    <Typography variant="caption" sx={{ color: '#1F2366', display: 'block', mb: 0.8 }}>New</Typography>
                    <Typography variant="caption" sx={{ color: '#1F2366', display: 'block', mb: 0.8 }}>Waiting</Typography>
                    <Typography variant="caption" sx={{ color: '#1F2366', display: 'block', mb: 0.8 }}>Overdue</Typography>
                  </Box>

                  {plannerColumns.map((day) => (
                    <Box key={day} sx={{ p: 1, borderRight: '1px solid #DBDDDF', borderLeft: 0, borderTop: 0, borderBottom: 0, bgcolor: '#fcfdff' }}>
                      {visiblePlannerCards.filter((card) => card.day === day).map((card) => (
                        <Paper key={card.id} elevation={0} sx={{ mb: 1, borderRadius: 1.5, border: '1px solid #DBDDDF', borderLeft: `4px solid ${card.color}`, p: 1 }}>
                          <Typography sx={{ fontWeight: 700, color: '#1F2366', fontSize: '0.75rem', lineHeight: 1.2 }}>{card.title}</Typography>
                          <Typography variant="caption" sx={{ color: '#626465', display: 'block', mt: 0.4 }}>{card.cadence}</Typography>
                          {card.files.map((file) => (
                            <Box key={file} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.6, bgcolor: '#ffffff', border: '1px solid #EBEDF0', borderRadius: 1, px: 0.8, py: 0.5 }}>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: '#1F2366' }}>{file}</Typography>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton size="small" sx={{ p: 0.25 }}><EditIcon sx={{ fontSize: 14, color: '#1D74FF' }} /></IconButton>
                                <IconButton size="small" sx={{ p: 0.25 }}><DeleteIcon sx={{ fontSize: 14, color: '#E43B46' }} /></IconButton>
                              </Box>
                            </Box>
                          ))}
                        </Paper>
                      ))}
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Paper elevation={0} sx={{ border: '1px solid #DBDDDF', borderRadius: 2, p: 1.5, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <FilterAltIcon sx={{ fontSize: 17, color: '#1D74FF' }} />
                  <Typography sx={{ fontWeight: 700, color: '#1F2366', fontSize: '0.82rem' }}>Workflow Files</Typography>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ '& th': { fontWeight: 700, color: '#626465', fontSize: '0.65rem', py: 1, borderBottom: '1px solid #DBDDDF' } }}>
                        <TableCell>File Name</TableCell>
                        <TableCell>Number</TableCell>
                        <TableCell>Version</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Author</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {plannerRightRows.map((row) => {
                        const style = statusChipStyle(row.status);
                        return (
                          <TableRow key={row.id} sx={{ '& td': { py: 1, borderBottom: '1px solid #f3f4f6' } }}>
                            <TableCell sx={{ fontSize: '0.74rem', color: '#1F2366', maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.fileName}</TableCell>
                            <TableCell sx={{ fontSize: '0.74rem', color: '#626465' }}>{row.number}</TableCell>
                            <TableCell sx={{ fontSize: '0.74rem', color: '#626465' }}>{row.version}</TableCell>
                            <TableCell><Chip size="small" label={row.status} sx={{ bgcolor: style.bg, color: style.color, fontWeight: 700, height: 20 }} /></TableCell>
                            <TableCell sx={{ fontSize: '0.74rem', color: '#1F2366' }}>{row.author}</TableCell>
                            <TableCell><IconButton size="small"><VisibilityIcon sx={{ fontSize: 16, color: '#1D74FF' }} /></IconButton></TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  };

  // â”€â”€â”€ Tab 2: Active Workflows â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const ActiveWorkflowsTab = () => (
    <Box sx={{ p: 2.5 }}>
      <TableContainer component={Paper} elevation={0} sx={{ 
        borderRadius: '24px', 
        border: '1px solid rgba(226, 232, 240, 0.8)',
        overflow: 'hidden',
        bgcolor: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(10px)',
      }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ 
              '& th': { 
                bgcolor: 'rgba(248, 250, 252, 0.8)', 
                borderBottom: '1px solid rgba(226, 232, 240, 0.8)', 
                fontWeight: 700, 
                fontSize: '0.65rem', 
                color: '#626465', 
                py: 2, 
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                whiteSpace: 'nowrap' 
              } 
            }}>
              <TableCell sx={{ width: 48 }} />
              <TableCell>Document Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Workflow Pattern</TableCell>
              <TableCell>Current Phase</TableCell>
              <TableCell>SLA Health</TableCell>
              <TableCell>Cycle Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {workflows.map(wf => {
              const isExpanded = expandedWf === wf.id;
              const currentStepObj = wf.steps[wf.currentStep - 1];
              const hasOverdue = wf.steps.some(s => s.status === 'overdue');
              const slaPercent = Math.min((wf.usedHours / wf.overallSlaHours) * 100, 100);
              const rc = routingColors[wf.routing];
              return (
                <React.Fragment key={wf.id}>
                  <TableRow
                    hover
                    onClick={() => setExpandedWf(isExpanded ? null : wf.id)}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: isExpanded ? 'rgba(59, 130, 246, 0.02)' : 'transparent',
                      '& td': { 
                        borderBottom: isExpanded ? 'none' : '1px solid rgba(226, 232, 240, 0.5)', 
                        py: 2, 
                        fontSize: '0.85rem',
                        color: '#1F2366'
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(59, 130, 246, 0.05)',
                      }
                    }}
                  >
                    <TableCell>
                      <IconButton size="small" sx={{ 
                        color: isExpanded ? '#1D74FF' : '#808285',
                        bgcolor: isExpanded ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                        '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)' }
                      }}>
                        {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2366', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {wf.docName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <PersonIcon sx={{ fontSize: 12, color: '#808285' }} />
                          <Typography variant="caption" sx={{ color: '#626465', fontWeight: 600 }}>{wf.owner}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={wf.docType} 
                        size="small" 
                        sx={{ 
                          bgcolor: '#EBEDF0', 
                          color: '#626465', 
                          fontWeight: 800, 
                          fontSize: '0.6rem', 
                          height: 20,
                          borderRadius: '6px',
                          letterSpacing: '0.05em'
                        }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: rc.color }} />
                        <Typography variant="caption" sx={{ color: '#1F2366', fontWeight: 700 }}>{wf.template}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#626465', display: 'block', mt: 0.25 }}>{rc.label}</Typography>
                    </TableCell>
                    <TableCell>
                      {currentStepObj && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            width: 24,
                            height: 24,
                            borderRadius: '6px',
                            bgcolor: stepColors[currentStepObj.status].glassBg,
                            color: stepColors[currentStepObj.status].color
                          }}>
                            {stepColors[currentStepObj.status].icon}
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: stepColors[currentStepObj.status].color, display: 'block', lineHeight: 1 }}>
                              {currentStepObj.label}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#808285', fontSize: '0.65rem' }}>
                              Step {wf.currentStep} of {wf.steps.length}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell sx={{ minWidth: 140 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700, color: slaPercent >= 100 ? '#E43B46' : '#626465' }}>
                            {wf.usedHours}h / {wf.overallSlaHours}h
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 800, color: slaPercent >= 100 ? '#E43B46' : '#1D74FF' }}>
                            {Math.round(slaPercent)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={slaPercent}
                          sx={{
                            height: 4, borderRadius: 2, bgcolor: '#DBDDDF',
                            '& .MuiLinearProgress-bar': { 
                              bgcolor: slaPercent >= 100 ? '#E43B46' : slaPercent > 75 ? '#FF6E00' : '#1D74FF',
                              borderRadius: 2
                            },
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      {hasOverdue
                        ? <Chip 
                            label="CRITICAL OVERDUE" 
                            size="small" 
                            variant="outlined"
                            icon={<WarningIcon sx={{ fontSize: '12px !important' }} />} 
                            sx={{ 
                              borderColor: '#E43B46', 
                              color: '#E43B46', 
                              bgcolor: 'rgba(239, 68, 68, 0.05)',
                              fontWeight: 800, 
                              fontSize: '0.6rem', 
                              height: 22,
                              borderRadius: '8px'
                            }} 
                          />
                        : <Chip 
                            label="HEALTHY CYCLE" 
                            size="small" 
                            sx={{ 
                              bgcolor: 'rgba(16, 185, 129, 0.1)', 
                              color: '#00AF95', 
                              fontWeight: 800, 
                              fontSize: '0.6rem', 
                              height: 22,
                              borderRadius: '8px'
                            }} 
                          />
                      }
                    </TableCell>
                  </TableRow>

                  {/* Expanded pipeline row */}
                  <TableRow>
                    <TableCell colSpan={7} sx={{ p: 0, border: 'none' }}>
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <PipelineView wf={wf} />
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  // â”€â”€â”€ Tab 2: Templates â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const TemplatesTab = () => (
    <Box sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1F2366', letterSpacing: '-0.01em' }}>Workflow Blueprints</Typography>
          <Typography variant="caption" sx={{ color: '#626465', fontWeight: 500 }}>Standardized approval patterns for different document classes</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowTemplateBuilder(true)}
          sx={{ 
            bgcolor: '#1D74FF', 
            textTransform: 'none', 
            borderRadius: '12px',
            fontWeight: 700,
            px: 3,
            boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)',
            '&:hover': { bgcolor: '#044ED7', boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)' }
          }}
        >
          Create Blueprint
        </Button>
      </Box>

      {/* New template builder */}
      <Collapse in={showTemplateBuilder}>
        <Paper elevation={0} sx={{ 
          p: 4, 
          mb: 4, 
          border: '1px solid #1D74FF', 
          borderRadius: '24px',
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.1)',
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1F2366', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <RouteIcon sx={{ color: '#1D74FF' }} /> Configure New Blueprint
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                label="Blueprint Name"
                fullWidth
                size="small"
                placeholder="e.g. Quality Assurance Level 1"
                value={newTemplateName}
                onChange={e => setNewTemplateName(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                <InputLabel>Routing Strategy</InputLabel>
                <Select
                  label="Routing Strategy"
                  value={newTemplateRouting}
                  onChange={e => setNewTemplateRouting(e.target.value as RoutingType)}
                >
                  <MenuItem value="sequential">Sequential (One by one)</MenuItem>
                  <MenuItem value="parallel">Parallel (Simultaneous)</MenuItem>
                  <MenuItem value="conditional">Conditional (Logic-based)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Typography variant="caption" sx={{ fontWeight: 800, color: '#626465', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', mb: 2 }}>Pipeline Sequence</Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {newTemplateSteps.map((step, idx) => (
              <Box key={idx} sx={{ 
                display: 'flex', 
                gap: 2, 
                alignItems: 'center', 
                p: 2, 
                bgcolor: 'white', 
                borderRadius: '16px', 
                border: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                transition: 'all 0.2s',
                '&:hover': { borderColor: '#1D74FF', transform: 'translateX(4px)' }
              }}>
                <Box sx={{ 
                  width: 30, 
                  height: 30, 
                  borderRadius: '50%', 
                  bgcolor: '#1D74FF', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  flexShrink: 0
                }}>
                  {idx + 1}
                </Box>
                <TextField
                  size="small" label="Phase Name" value={step.label}
                  onChange={e => setNewTemplateSteps(prev => prev.map((s, i) => i === idx ? { ...s, label: e.target.value } : s))}
                  sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
                <FormControl size="small" sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
                  <InputLabel>Authority Role</InputLabel>
                  <Select label="Authority Role" value={step.role}
                    onChange={e => setNewTemplateSteps(prev => prev.map((s, i) => i === idx ? { ...s, role: e.target.value } : s))}>
                    {ROLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField
                  size="small" label="SLA (hours)" type="number" value={step.slaHours}
                  onChange={e => setNewTemplateSteps(prev => prev.map((s, i) => i === idx ? { ...s, slaHours: Number(e.target.value) } : s))}
                  sx={{ width: 100, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
                <IconButton size="small" color="error" onClick={() => setNewTemplateSteps(prev => prev.filter((_, i) => i !== idx))} sx={{ bgcolor: 'rgba(239, 68, 68, 0.05)' }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
            <Button 
              size="small" 
              startIcon={<AddIcon />} 
              onClick={() => setNewTemplateSteps(prev => [...prev, { label: 'Verification', role: 'Reviewer', slaHours: 24 }])}
              sx={{ textTransform: 'none', fontWeight: 700, color: '#1D74FF' }}
            >
              Add Definition Phase
            </Button>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                size="small"
                onClick={() => { setShowTemplateBuilder(false); setNewTemplateName(''); }} 
                sx={{ textTransform: 'none', fontWeight: 600, color: '#626465' }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                size="small"
                disabled={!newTemplateName.trim()} 
                onClick={() => {
                  const t: WorkflowTemplate = {
                    id: `T-${Date.now()}`, name: newTemplateName, routing: newTemplateRouting,
                    description: 'Optimized industrial workflow blueprint.', steps: newTemplateSteps,
                    avgCycleHours: newTemplateSteps.reduce((a, s) => a + s.slaHours, 0), usageCount: 0,
                  };
                  setTemplates(prev => [...prev, t]);
                  setShowTemplateBuilder(false);
                  setNewTemplateName('');
                  setNewTemplateSteps([{ label: 'Review', role: 'Reviewer', slaHours: 24 }, { label: 'Approval', role: 'Manager', slaHours: 24 }]);
                  showSnackbar(`Blueprint "${t.name}" successfully deployed.`, 'success');
                }} 
                sx={{ 
                  textTransform: 'none', 
                  bgcolor: '#1D74FF', 
                  borderRadius: '10px',
                  fontWeight: 700,
                  px: 4
                }}
              >
                Deploy Blueprint
              </Button>
            </Box>
          </Box>
        </Paper>
      </Collapse>

      {/* Template cards */}
      <Grid container spacing={2}>
        {templates.map(t => {
          const rc = routingColors[t.routing];
          return (
            <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 3 }} key={t.id}>
              <Card elevation={0} sx={{ 
                borderRadius: '16px', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                border: '1px solid rgba(226, 232, 240, 0.8)',
                bgcolor: 'white',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 20px -5px rgba(0, 0, 0, 0.05)',
                  borderColor: '#1D74FF'
                } 
              }}>
                <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#1F2366', lineHeight: 1.2 }}>{t.name}</Typography>
                      <Chip 
                        label={rc.label} 
                        size="small" 
                        sx={{ 
                          bgcolor: rc.glassBg, 
                          color: rc.color, 
                          fontWeight: 800, 
                          fontSize: '0.6rem', 
                          height: 18, 
                          mt: 1,
                          borderRadius: '4px',
                          letterSpacing: '0.05em'
                        }} 
                      />
                    </Box>
                    <Box sx={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '8px', 
                      bgcolor: '#EBEDF0', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#626465',
                      border: '1px solid #DBDDDF'
                    }}>
                      <WorkflowIcon sx={{ fontSize: 18 }} />
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" sx={{ color: '#626465', lineHeight: 1.5, mb: 1.5, fontSize: '0.8rem' }}>{t.description}</Typography>

                  <Box sx={{ bgcolor: '#EBEDF0', borderRadius: '12px', p: 1.5, mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#808285', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', mb: 1 }}>Flow Nodes</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                      {t.steps.map((s, i) => (
                        <React.Fragment key={i}>
                          <Box sx={{ 
                            px: 1.5, 
                            py: 0.5, 
                            borderRadius: '8px', 
                            bgcolor: 'white', 
                            border: '1px solid #DBDDDF',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#1F2366' }}>{s.label}</Typography>
                            <Box sx={{ px: 0.5, py: 0.1, bgcolor: '#EBEDF0', borderRadius: '4px' }}>
                              <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#626465', fontWeight: 800 }}>{s.slaHours}h</Typography>
                            </Box>
                          </Box>
                          {i < t.steps.length - 1 && <ArrowForwardIcon sx={{ fontSize: 14, color: '#cbd5e1' }} />}
                        </React.Fragment>
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <SlaIcon sx={{ fontSize: 14, color: '#808285' }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#626465' }}><b style={{ color: '#1F2366' }}>{t.avgCycleHours}h</b></Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <ActiveIcon sx={{ fontSize: 14, color: '#808285' }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#626465' }}><b style={{ color: '#1F2366' }}>{t.usageCount}</b></Typography>
                    </Box>
                  </Box>
                </CardContent>
                
                <CardActions sx={{ borderTop: '1px solid rgba(226, 232, 240, 0.8)', px: 2, py: 1, justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      size="small" 
                      startIcon={<CopyIcon sx={{ fontSize: 16 }} />} 
                      onClick={() => showSnackbar(`"${t.name}" cloned`, 'info')}
                      sx={{ textTransform: 'none', fontWeight: 700, color: '#626465', '&:hover': { color: '#1D74FF' } }}
                    >
                      Clone
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<EditIcon sx={{ fontSize: 16 }} />} 
                      onClick={() => showSnackbar('Blueprint editor active', 'info')}
                      sx={{ textTransform: 'none', fontWeight: 700, color: '#626465', '&:hover': { color: '#1D74FF' } }}
                    >
                      Configure
                    </Button>
                  </Box>
                  <IconButton 
                    size="small" 
                    onClick={() => { setTemplates(prev => prev.filter(x => x.id !== t.id)); showSnackbar(`Blueprint retired: ${t.name}`, 'info'); }}
                    sx={{ color: '#E43B46', bgcolor: 'rgba(239, 68, 68, 0.05)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );

  // â”€â”€â”€ Tab 3: Conditional Rules â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const ConditionalRulesTab = () => (
    <Box sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1F2366', letterSpacing: '-0.01em' }}>Routing Orchestration</Typography>
          <Typography variant="caption" sx={{ color: '#626465', fontWeight: 500 }}>Logic rules executed during document lifecycle events</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setShowRuleBuilder(true)} 
          sx={{ 
            bgcolor: '#1D74FF', 
            textTransform: 'none', 
            borderRadius: '12px',
            fontWeight: 700,
            px: 3,
            boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)',
            '&:hover': { bgcolor: '#044ED7', boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)' }
          }}
        >
          Add Logic Rule
        </Button>
      </Box>

      {/* Rule builder */}
      <Collapse in={showRuleBuilder}>
        <Paper elevation={0} sx={{ 
          p: 4, 
          mb: 4, 
          border: '1px solid #1D74FF', 
          borderRadius: '24px',
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.1)',
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1F2366', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <RuleIcon sx={{ color: '#1D74FF' }} /> Define Engine Logic
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <TextField 
              size="small" 
              label="Logic Rule Descriptor" 
              placeholder="e.g. Critical Safety Routing" 
              value={newRule.name || ''}
              onChange={e => setNewRule(prev => ({ ...prev, name: e.target.value }))} 
              fullWidth 
              sx={{ maxWidth: 500, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} 
            />
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flexWrap: 'wrap', 
            alignItems: 'center', 
            mb: 3,
            p: 3,
            bgcolor: 'white',
            borderRadius: '16px',
            border: '1px solid rgba(226, 232, 240, 0.8)'
          }}>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#808285', textTransform: 'uppercase' }}>Scope</Typography>
            <FormControl size="small" sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
              <InputLabel>Trigger Activity</InputLabel>
              <Select label="Trigger Activity" value={newRule.triggerEvent || 'On Upload'}
                onChange={e => setNewRule(prev => ({ ...prev, triggerEvent: e.target.value }))}>
                <MenuItem value="On Upload">Document Upload</MenuItem>
                <MenuItem value="On Status Change">State Transition</MenuItem>
                <MenuItem value="On Check-in">Version Check-in</MenuItem>
                <MenuItem value="On Schedule">Scheduled Task</MenuItem>
              </Select>
            </FormControl>
            
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#1D74FF' }}>IF</Typography>
            
            <FormControl size="small" sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
              <InputLabel>Target Class</InputLabel>
              <Select label="Target Class" value={newRule.ifDocType || 'SOP'}
                onChange={e => setNewRule(prev => ({ ...prev, ifDocType: e.target.value }))}>
                {DOC_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
              <InputLabel>Metadata Key</InputLabel>
              <Select label="Metadata Key" value={newRule.metaField || 'Category'}
                onChange={e => setNewRule(prev => ({ ...prev, metaField: e.target.value }))}>
                {['Category', 'Severity', 'Owner', 'Site', 'Department', 'Line'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
              <InputLabel>Operator</InputLabel>
              <Select label="Operator" value={newRule.operator || 'Equals'}
                onChange={e => setNewRule(prev => ({ ...prev, operator: e.target.value }))}>
                {['Equals', 'Contains', 'Not Equals'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            
            <TextField 
              size="small" 
              label="Attribute Value" 
              value={newRule.metaValue || ''}
              onChange={e => setNewRule(prev => ({ ...prev, metaValue: e.target.value }))} 
              sx={{ flex: 1, minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} 
            />
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flexWrap: 'wrap', 
            alignItems: 'center',
            p: 3,
            bgcolor: 'rgba(59, 130, 246, 0.03)',
            borderRadius: '16px',
            border: '1px dashed rgba(59, 130, 246, 0.3)'
          }}>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#1D74FF' }}>THEN</Typography>
            <FormControl size="small" sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
              <InputLabel>Execution Action</InputLabel>
              <Select label="Execution Action" value={newRule.actionType || 'Trigger Workflow'}
                onChange={e => setNewRule(prev => ({ ...prev, actionType: e.target.value, actionTarget: '' }))}>
                {['Trigger Workflow', 'Assign Task', 'Notify User', 'Change Lifecycle'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 250, flex: 1, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
              <InputLabel>Action Parameter</InputLabel>
              <Select label="Action Parameter" value={newRule.actionTarget || ''}
                onChange={e => setNewRule(prev => ({ ...prev, actionTarget: e.target.value }))}>
                {newRule.actionType === 'Trigger Workflow' && mockTemplates.map(t => <MenuItem key={t.id} value={t.name}>{t.name}</MenuItem>)}
                {newRule.actionType === 'Assign Task' && ROLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                {newRule.actionType === 'Notify User' && ROLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                {newRule.actionType === 'Change Lifecycle' && ['Draft', 'In Review', 'Approved', 'Published', 'Archived', 'Obsolete'].map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button size="small" onClick={() => setShowRuleBuilder(false)} sx={{ textTransform: 'none', fontWeight: 600, color: '#626465' }}>Cancel</Button>
            <Button size="small" variant="contained" disabled={!newRule.name || !newRule.metaValue || !newRule.actionTarget} onClick={() => {
              const r: ConditionalRule = {
                id: `R-${Date.now()}`, name: newRule.name || `Rule ${Date.now()}`, enabled: true,
                triggerEvent: newRule.triggerEvent || 'On Upload',
                ifDocType: newRule.ifDocType || 'SOP', metaField: newRule.metaField || 'Category',
                logic: newRule.logic || 'AND', operator: newRule.operator || 'Equals', metaValue: newRule.metaValue || '',
                actionType: newRule.actionType || 'Trigger Workflow', actionTarget: newRule.actionTarget || '',
              };
              setRules(prev => [...prev, r]);
              setShowRuleBuilder(false);
              setNewRule({ name: '', triggerEvent: 'On Upload', ifDocType: 'SOP', metaField: 'Category', logic: 'AND', operator: 'Equals', metaValue: '', actionType: 'Trigger Workflow', actionTarget: '' });
              showSnackbar('Engine logic updated and deployed successfully.', 'success');
            }} sx={{ bgcolor: '#1D74FF', textTransform: 'none', borderRadius: '10px', fontWeight: 700, px: 4, '&:hover': { bgcolor: '#044ED7' } }}>
              Activate Rule
            </Button>
          </Box>
        </Paper>
      </Collapse>

      {/* Rules table */}
      <TableContainer component={Paper} elevation={0} sx={{ 
        borderRadius: '24px', 
        border: '1px solid rgba(226, 232, 240, 0.8)',
        overflow: 'hidden',
        bgcolor: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(10px)',
      }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ 
              '& th': { 
                bgcolor: 'rgba(248, 250, 252, 0.8)', 
                borderBottom: '1px solid rgba(226, 232, 240, 0.8)', 
                fontWeight: 700, 
                fontSize: '0.65rem', 
                color: '#626465', 
                py: 2,
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              } 
            }}>
              <TableCell sx={{ width: 80 }}>Status</TableCell>
              <TableCell sx={{ width: 220 }}>Logic Rule</TableCell>
              <TableCell sx={{ width: 140 }}>Activity</TableCell>
              <TableCell>Conditional Logic</TableCell>
              <TableCell sx={{ width: 100 }}>Operator</TableCell>
              <TableCell>Engine Output</TableCell>
              <TableCell sx={{ width: 100 }}>Controls</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rules.map((rule, idx) => (
              <TableRow key={rule.id} sx={{ 
                '& td': { borderBottom: '1px solid rgba(226, 232, 240, 0.5)', py: 1.5, fontSize: '0.85rem' },
                transition: 'opacity 0.2s',
                opacity: rule.enabled ? 1 : 0.4 
              }}>
                <TableCell>
                  <Switch
                    size="small"
                    checked={rule.enabled}
                    onChange={() => setRules(prev => prev.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r))}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#1D74FF' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#1D74FF' }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#1F2366' }}>{rule.name}</Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={rule.triggerEvent} 
                    size="small" 
                    sx={{ 
                      bgcolor: '#EBEDF0', 
                      color: '#626465', 
                      fontWeight: 800, 
                      fontSize: '0.6rem', 
                      height: 20,
                      borderRadius: '4px'
                    }} 
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={rule.ifDocType} 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(59, 130, 246, 0.1)', 
                        color: '#1D74FF', 
                        fontWeight: 800, 
                        fontSize: '0.6rem', 
                        height: 20 
                      }} 
                    />
                    <Typography variant="caption" sx={{ color: '#808285', fontWeight: 800, fontSize: '0.6rem' }}>AND</Typography>
                    <Typography variant="caption" sx={{ color: '#1F2366', fontWeight: 600 }}>
                      {rule.metaField} <span style={{ color: '#1D74FF', fontWeight: 800 }}>"{rule.metaValue}"</span>
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={rule.operator}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      borderColor: '#DBDDDF', 
                      color: '#626465', 
                      fontWeight: 800, 
                      fontSize: '0.55rem', 
                      height: 18 
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ArrowForwardIcon sx={{ fontSize: 14, color: '#cbd5e1' }} />
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#1F2366', textTransform: 'uppercase', fontSize: '0.6rem' }}>{rule.actionType}:</Typography>
                    <Chip 
                      label={rule.actionTarget} 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(245, 158, 11, 0.1)', 
                        color: '#b45309', 
                        fontWeight: 800, 
                        fontSize: '0.6rem', 
                        height: 20 
                      }} 
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" disabled={idx === 0} onClick={() => {
                      setRules(prev => { const a = [...prev]; [a[idx - 1], a[idx]] = [a[idx], a[idx - 1]]; return a; });
                    }}>
                      <SwapIcon sx={{ fontSize: 16, transform: 'rotate(90deg)', color: '#808285' }} />
                    </IconButton>
                    <IconButton size="small" sx={{ color: '#E43B46', bgcolor: 'rgba(239, 68, 68, 0.05)' }} onClick={() => { setRules(prev => prev.filter(r => r.id !== rule.id)); showSnackbar('Engine logic rule deleted.', 'info'); }}>
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  // â”€â”€â”€ Tab 4: Delegations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const DelegationsTab = () => (
    <Box sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1F2366', letterSpacing: '-0.01em' }}>Authority Delegation</Typography>
          <Typography variant="caption" sx={{ color: '#626465', fontWeight: 500 }}>Global reviewer reassignment settings for approval continuity</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<PersonAddIcon />} 
          onClick={() => setShowDelegationForm(true)} 
          sx={{ 
            bgcolor: '#1D74FF', 
            textTransform: 'none', 
            borderRadius: '12px',
            fontWeight: 700,
            px: 3,
            boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)',
            '&:hover': { bgcolor: '#044ED7', boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)' }
          }}
        >
          New Reviewer
        </Button>
      </Box>

      {/* Delegation form */}
      <Collapse in={showDelegationForm}>
        <Paper elevation={0} sx={{ 
          p: 4, 
          mb: 4, 
          border: '1px solid #1D74FF', 
          borderRadius: '24px',
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.1)',
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1F2366', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <VerifiedUserIcon sx={{ color: '#1D74FF' }} /> Configure Reviewer Assignment
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                <InputLabel>Primary Authority</InputLabel>
                <Select
                  label="Primary Authority"
                  value={newDelegation.delegator || ''}
                  onChange={e => setNewDelegation(prev => ({ ...prev, delegator: e.target.value }))}
                >
                  {REVIEWERS.map(name => <MenuItem key={name} value={name}>{name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                <InputLabel>Primary Reviewer</InputLabel>
                <Select
                  label="Primary Reviewer"
                  value={newDelegation.delegate || ''}
                  onChange={e => setNewDelegation(prev => ({ ...prev, delegate: e.target.value }))}
                >
                  {REVIEWERS.map(name => <MenuItem key={name} value={name}>{name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                <InputLabel>Secondary Reviewers</InputLabel>
                <Select
                  label="Secondary Reviewers"
                  multiple
                  value={newDelegation.secondaryDelegates || []}
                  onChange={e => setNewDelegation(prev => ({ ...prev, secondaryDelegates: e.target.value as string[] }))}
                  renderValue={(selected) => (selected as string[]).join(', ') || 'None'}
                >
                  {REVIEWERS.map(name => (
                    <MenuItem key={name} value={name}>{name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField 
                size="small" 
                label="Activation Date" 
                placeholder="e.g. Apr 5, 2026" 
                fullWidth
                value={newDelegation.fromDate || ''}
                onChange={e => setNewDelegation(prev => ({ ...prev, fromDate: e.target.value }))} 
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField 
                size="small" 
                label="Expiry Date" 
                placeholder="e.g. Apr 12, 2026" 
                fullWidth
                value={newDelegation.toDate || ''}
                onChange={e => setNewDelegation(prev => ({ ...prev, toDate: e.target.value }))} 
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                <InputLabel>Authority Scope</InputLabel>
                <Select label="Authority Scope" multiple value={[]} renderValue={() => 'Multi-selection...'}>
                  <MenuItem disabled>Select Document Types...</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button size="small" onClick={() => setShowDelegationForm(false)} sx={{ textTransform: 'none', fontWeight: 600, color: '#626465' }}>Cancel</Button>
            <Button 
              size="small" 
              variant="contained" 
              disabled={!newDelegation.delegator || !newDelegation.delegate} 
              onClick={() => {
                const d: Delegation = {
                  id: `D-${Date.now()}`,
                  delegator: newDelegation.delegator || '',
                  delegate: newDelegation.delegate || '',
                  secondaryDelegates: newDelegation.secondaryDelegates || [],
                  fromDate: newDelegation.fromDate || '-',
                  toDate: newDelegation.toDate || '-',
                  docTypes: ['All Patterns'],
                };
                setDelegations(prev => [...prev, d]);
                setShowDelegationForm(false);
                setNewDelegation({ delegator: '', delegate: '', secondaryDelegates: [], fromDate: '', toDate: '', docTypes: [] });
                showSnackbar(`Reviewer assignment for ${d.delegator} finalized.`, 'success');
              }} 
              sx={{ bgcolor: '#1D74FF', textTransform: 'none', borderRadius: '10px', fontWeight: 700, px: 4, '&:hover': { bgcolor: '#044ED7' } }}
            >
              Verify & Activate Reviewer Set
            </Button>
          </Box>
        </Paper>
      </Collapse>

      {/* Delegations table */}
      <TableContainer component={Paper} elevation={0} sx={{ 
        borderRadius: '24px', 
        border: '1px solid rgba(226, 232, 240, 0.8)',
        overflow: 'hidden',
        bgcolor: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(10px)',
      }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ 
              '& th': { 
                bgcolor: 'rgba(248, 250, 252, 0.8)', 
                borderBottom: '1px solid rgba(226, 232, 240, 0.8)', 
                fontWeight: 700, 
                fontSize: '0.65rem', 
                color: '#626465', 
                py: 2,
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              } 
            }}>
              <TableCell>Primary Authority</TableCell>
              <TableCell>Primary Reviewer</TableCell>
              <TableCell>Secondary Reviewers</TableCell>
              <TableCell>Scope Profile</TableCell>
              <TableCell>Activation Window</TableCell>
              <TableCell sx={{ width: 100 }}>Controls</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {delegations.map(d => (
              <TableRow key={d.id} sx={{ '& td': { borderBottom: '1px solid rgba(226, 232, 240, 0.5)', py: 2, fontSize: '0.85rem' } }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: '#EBEDF0', color: '#626465', border: '1px solid #DBDDDF' }}>{d.delegator.charAt(0)}</Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2366' }}>{d.delegator}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ArrowForwardIcon sx={{ fontSize: 14, color: '#cbd5e1' }} />
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: '#EBEDF0', color: '#626465', border: '1px solid #DBDDDF' }}>{d.delegate.charAt(0)}</Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#1F2366' }}>{d.delegate}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {(d.secondaryDelegates || []).length > 0 ? (d.secondaryDelegates || []).map(name => (
                      <Chip key={name} label={name} size="small" sx={{ bgcolor: '#f1f5f9', color: '#334155', fontWeight: 700, fontSize: '0.62rem', height: 18 }} />
                    )) : <Typography variant="caption" sx={{ color: '#9ca3af' }}>None</Typography>}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {d.docTypes.map(dt => (
                      <Chip key={dt} label={dt} size="small" sx={{ bgcolor: '#EBEDF0', color: '#044ED7', fontWeight: 700, fontSize: '0.65rem', height: 18 }} />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton size="small" color="error" onClick={() => { setDelegations(prev => prev.filter(x => x.id !== d.id)); showSnackbar('Delegation removed', 'info'); }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {delegations.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: '#9e9e9e' }}>
                  <PersonAddIcon sx={{ fontSize: 40, display: 'block', mx: 'auto', mb: 1, opacity: 0.3 }} />
                  No active delegations
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  // â”€â”€â”€ Main render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <Box sx={{ 
      flexGrow: 1, 
      bgcolor: embedded ? 'transparent' : '#EBEDF0', 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      overflow: 'hidden',
      fontFamily: '"Fira Sans", sans-serif',
      backgroundImage: embedded ? 'none' : 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.03) 0%, rgba(248, 250, 252, 1) 100%)',
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

      {/* â•â•â•â•â• HEADER â•â•â•â•â• */}
      {!embedded ? (
        <Box sx={{ 
          px: 4, 
          py: 2.5, 
          bgcolor: 'rgba(255, 255, 255, 0.8)', 
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 3,
          zIndex: 10
        }}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: '12px', 
            bgcolor: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            cursor: 'pointer',
            '&:hover': { bgcolor: '#EBEDF0' }
          }} onClick={onBack}>
            <ArrowBackIcon sx={{ color: '#626465' }} />
          </Box>
          
          <Box>
            <Typography variant="h5" sx={{ 
              color: '#1F2366', 
              fontWeight: 800, 
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}>
              Workflow Engine
            </Typography>
            <Typography variant="body2" sx={{ color: '#626465', fontWeight: 500, mt: 0.5 }}>
              Enterprise Visual Pipeline & Service Level Monitoring
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
        </Box>
      ) : null}

      {/* â•â•â•â•â• KPI BENTO GRID â•â•â•â•â• */}
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
          { label: 'Active Flows', value: workflows.length, color: '#1D74FF', bg: 'rgba(59, 130, 246, 0.1)', icon: <WorkflowIcon sx={{ fontSize: 18 }} /> },
          { label: 'Overdue Steps', value: overdueCount, color: '#E43B46', bg: 'rgba(239, 68, 68, 0.1)', icon: <ErrorOutlineIcon sx={{ fontSize: 18 }} /> },
          { label: 'Avg Cycle Time', value: `${avgCycle}h`, color: '#FF6E00', bg: 'rgba(245, 158, 11, 0.1)', icon: <SpeedIcon sx={{ fontSize: 18 }} /> },
          { label: 'Success Today', value: completedToday, color: '#00AF95', bg: 'rgba(16, 185, 129, 0.1)', icon: <DoneAllIcon sx={{ fontSize: 18 }} /> },
          { label: 'Templates', value: templates.length, color: '#9199D8', bg: 'rgba(139, 92, 246, 0.1)', icon: <CheckBoxIcon sx={{ fontSize: 18 }} /> },
          { label: 'Routing Rules', value: rules.filter(r => r.enabled).length, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)', icon: <RuleIcon sx={{ fontSize: 18 }} /> },
        ].map((kpi, i) => (
          <Paper
            key={i}
            elevation={0}
            sx={{
              px: 3,
              py: 1.5,
              display: 'flex', 
              alignItems: 'center',
              gap: 2,
              bgcolor: 'white',
              borderRadius: 3,
              border: '1px solid rgba(226, 232, 240, 0.8)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              minWidth: 200,
              cursor: 'pointer',
              '&:hover': { 
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
                borderColor: kpi.color,
              },
            }}
          >
            <Box sx={{ 
              width: 36, 
              height: 36, 
              borderRadius: 2, 
              bgcolor: kpi.bg, 
              color: kpi.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {kpi.icon}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, color: '#1F2366', lineHeight: 1.2, fontSize: '1rem' }}>
                {kpi.value}
              </Typography>
              <Typography variant="caption" sx={{ color: '#626465', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.025em', display: 'block' }}>
                {kpi.label}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* â•â•â•â•â• TABS â•â•â•â•â• */}
      <Box sx={{ bgcolor: 'white', px: 4, pt: 1, borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            '& .MuiTab-root': { 
              textTransform: 'none', 
              fontWeight: 700, 
              fontSize: '0.85rem', 
              minHeight: 48,
              color: '#626465',
              transition: 'all 0.2s',
              '&:hover': { color: '#1D74FF', bgcolor: 'rgba(59, 130, 246, 0.02)' }
            },
            '& .Mui-selected': { color: '#1D74FF !important' },
            '& .MuiTabs-indicator': { bgcolor: '#1D74FF', height: 3, borderRadius: '3px 3px 0 0' },
          }}
        >
          <Tab icon={<CalendarMonthIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Planner Overview`} sx={{ minWidth: 180 }} />
          <Tab icon={<WorkflowIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Active Workflows`} sx={{ minWidth: 180 }} />
          <Tab icon={<CheckBoxIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Templates`} sx={{ minWidth: 140 }} />
          <Tab icon={<RuleIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Conditional Rules`} sx={{ minWidth: 180 }} />
          <Tab icon={<PersonAddIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Delegations`} sx={{ minWidth: 140 }} />
        </Tabs>
      </Box>

      {/* â•â•â•â•â• TAB CONTENT â•â•â•â•â• */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {tab === 0 && PlannerOverviewTab()}
        {tab === 1 && ActiveWorkflowsTab()}
        {tab === 2 && TemplatesTab()}
        {tab === 3 && ConditionalRulesTab()}
        {tab === 4 && DelegationsTab()}
      </Box>

      {/* â•â•â•â•â• SNACKBAR â•â•â•â•â• */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

