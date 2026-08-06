import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  IconButton,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  ListItem,
  TextField,
  Breadcrumbs,
  Link,
  InputAdornment,
  Checkbox,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  CircularProgress,
  Switch,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  ManageSearch as ManageSearchIcon,
  FilterList as FilterListIcon,
  CreateNewFolder as CreateNewFolderIcon,
  CloudUpload as CloudUploadIcon,
  Edit as EditIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Folder as FolderIcon,
  Description as DescriptionIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Close as CloseIcon,
  InfoOutlined as InfoOutlinedIcon,
  Dashboard as DashboardIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Share as ShareIcon,
  History as HistoryIcon,
  Shield as ShieldIcon,
  GppGood as GppGoodIcon,
  Tune as TuneIcon,
  AutoAwesome as SparkleIcon,
  AccountTree as WorkflowIcon,
  PlayArrow as PlayArrowIcon,
  AddCircle as AddCircleIcon,
  CloudUploadOutlined as CloudUploadOutlinedIcon,
  HistoryOutlined as HistoryOutlinedIcon,
  LockOutlined as LockOutlinedIcon,
  AccessTime as AccessTimeIcon,
  MailOutline as MailOutlineIcon,
  Lightbulb as LightbulbIcon,
  PersonAddAlt1 as PersonAddIcon,
  Link as LinkIcon,
  MoveToInbox as InboxIcon,
  Add as AddIcon,
  Draw as DrawIcon,
  CalendarToday as CalendarTodayIcon,
  Business as BusinessIcon,
  PersonOutline as PersonOutlineIcon,
  TextFields as TextFieldsIcon,
  CheckBox as CheckBoxIcon,
  Print as PrintIcon,
  GetApp as DownloadIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FolderShared as FolderSharedIcon,
  WarningAmber as WarningIcon,
  ErrorOutline as ErrorOutlineIcon,
  FactCheck as FactCheckIcon,
  AltRoute as AltRouteIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  FilePresent as FilePresentIcon,
  ShareRounded as ShareRoundedIcon,
  Email as EmailIcon,
  Cancel as CancelIcon,
  GridView as GridViewIcon,
  ViewAgenda as ViewAgendaIcon,
  Place as PlaceIcon,
  Public as PublicIcon,
} from '@mui/icons-material';
import DocumentHierarchyPicker from './DocumentHierarchyPicker';
import {
  findDocumentHierarchyPath,
} from './documentHierarchy';
import {
  tokenBrand,
  tokenCommon,
  tokenDivider,
  tokenNeutral,
  tokenText,
  tokenWarning,
  tokenSuccess,
  workstationVisuals,
} from '../workstation/theme';
import { PlannerAiCopilotDrawer } from '../Maintenance/components/ai/PlannerAiCopilotDrawer';
import DocumentWorkflowEngineScreen from './DocumentWorkflowEngineScreen';

const SF_COLORS = {
  blue: '#044ED7',
  brightBlue: '#1D74FF',
  lightBlue: '#00C2EC',
  deepBlue: '#1F2366',
  darkBlue: '#060A3D',
  orange: '#FF6E00',
  yellow: '#FFB500',
  gray10: '#EBEDF0',
  gray30: '#BCBEC0',
  gray60: '#808285',
  gray90: '#3D3F41',
} as const;


// --- Types ---
type LifecycleState = 'Draft' | 'In Review' | 'Approved' | 'Published' | 'Archived' | 'Obsolete';

const lifecycleChipStyle: Record<LifecycleState, { color: string; bg: string }> = {
  Draft:       { color: '#044ED7', bg: '#EBEDF0' },
  'In Review': { color: '#FF6E00', bg: '#fff3e0' },
  Approved:    { color: '#1b5e20', bg: '#e8f5e9' },
  Published:   { color: '#006064', bg: '#e0f7fa' },
  Archived:    { color: '#616161', bg: '#f5f5f5' },
  Obsolete:    { color: '#b71c1c', bg: '#ffebee' },
};

interface UnifiedItem {
  id: number;
  isFolder: boolean;
  parentFolderId?: number;
  site?: string;
  line?: string;
  asset?: string;
  businessLine?: string;
  productPlatform?: string;
  qualityCategory?: string;
  sharedWithTeam?: boolean;
  name: string;
  type: string;
  modified: string;
  modifiedBy: string;
  owner: string;
  approver: string;
  reviewDate: string;
  frequency: string;
  starred: boolean;
  items?: number;
  status?: string;
  lifecycle?: LifecycleState;
  isCheckedOut?: boolean;
  checkedOutBy?: string;
  version?: string;
  activeWorkflow?: string;
  workflowStep?: string;
  stepResponsible?: string;
  isInInbox?: boolean;
  inboxUpdatedAt?: string;
  signers?: any[];
}

type DmsWorkspace = 'Inbox' | 'Documents' | 'WorkflowPlanner';
type InboxSection = 'All' | 'New' | 'WaitingApproval' | 'WaitingESignature' | 'UnderRevision' | 'InReview' | 'Completed' | 'Archived';
type RepositorySection = 'AllDocuments' | 'Favorites' | 'Recent' | 'Shared';
type RepositoryViewMode = 'list' | 'card';
const workspaceLabels: Record<DmsWorkspace, string> = {
  Inbox: 'Inbox',
  Documents: 'Documents',
  WorkflowPlanner: 'Workflow Planner',
};
const inboxSectionLabels: Record<InboxSection, string> = {
  All: 'All',
  New: 'New',
  WaitingApproval: 'Waiting for Approval',
  WaitingESignature: 'Waiting for E-Signature',
  UnderRevision: 'Under Revision',
  InReview: 'In Review',
  Completed: 'Completed',
  Archived: 'Archived',
};
const repositorySectionLabels: Record<RepositorySection, string> = {
  AllDocuments: 'All Documents',
  Favorites: 'Favorites',
  Recent: 'Recent',
  Shared: 'Shared',
};

// --- Data ---
const hierarchyData = [
  { id: 'assets', title: 'Assets', items: ['Sandy - Line 10 Autoguard', 'Sandy - Line 12 Syringe Cell', 'Sandy - Line 4 Sterile Press'] },
  { id: 'businessLine', title: 'Business Line', items: ['Medication Delivery Solutions', 'Formulation'] },
  { id: 'productPlatform', title: 'Product Platform', items: ['Syringes', 'Nexiva'] },
  { id: 'quality', title: 'Quality', items: ['SOP', 'Work Instructions', 'NC'] },
  { id: 'folders', title: 'Folders', items: ['Changeover', 'Maintenance'] },
];

const initialData: UnifiedItem[] = [
  { id: 101, isFolder: true, site: 'Sandy', line: 'Line 10', asset: 'Autoguard Conveyor', businessLine: 'Medication Delivery Solutions', productPlatform: 'Syringes', qualityCategory: 'SOP', name: 'Line 10 - Autoguard Docs', items: 12, starred: true, modified: '2 hours ago', modifiedBy: 'Chris Klopp', owner: 'Chris Klopp', approver: 'George Whales', reviewDate: '-', frequency: '-', type: 'Hierarchy Node' },
  { id: 102, isFolder: true, site: 'Sandy', line: 'Line 12', asset: 'Syringe Forming Cell', businessLine: 'Formulation', productPlatform: 'Syringes', qualityCategory: 'Work Instructions', name: 'Line 12 - Syringe Cell Docs', items: 8, starred: false, modified: '1 day ago', modifiedBy: 'Marcus Chods', owner: 'Marcus Chods', approver: 'George Whales', reviewDate: '-', frequency: '-', type: 'Hierarchy Node' },
  { id: 103, isFolder: true, site: 'Sandy', line: 'Line 4', asset: 'Sterile Packaging Press', businessLine: 'Medication Delivery Solutions', productPlatform: 'Nexiva', qualityCategory: 'NC', name: 'Line 4 - Sterile Packaging Docs', items: 24, starred: true, modified: '3 days ago', modifiedBy: 'System', owner: 'System', approver: 'System', reviewDate: '-', frequency: '-', type: 'Hierarchy Node' },
  { id: 1, isFolder: false, parentFolderId: 101, site: 'Sandy', line: 'Line 10', asset: 'Autoguard Conveyor', businessLine: 'Medication Delivery Solutions', productPlatform: 'Syringes', qualityCategory: 'SOP', sharedWithTeam: true, name: 'Autoguard Safety SOP.docx', type: 'Manual', modified: '5 minutes ago', modifiedBy: 'Dougie Wood', owner: 'Chris Klopp', approver: 'George Whales', reviewDate: '10/3/2026', frequency: '12', starred: true, status: 'Waiting for approval', lifecycle: 'In Review', version: 'v10', isCheckedOut: false, activeWorkflow: 'SOP Quality Review', workflowStep: 'Step 3/4', stepResponsible: 'QA Lead', isInInbox: true, inboxUpdatedAt: '2026-04-28T13:40:00Z' },
  { id: 2, isFolder: false, parentFolderId: 101, site: 'Sandy', line: 'Line 10', asset: 'Autoguard Conveyor', businessLine: 'Medication Delivery Solutions', productPlatform: 'Syringes', qualityCategory: 'SOP', sharedWithTeam: true, name: 'Line 10 Employee Handbook.docx', type: 'Manual', modified: '5 minutes ago', modifiedBy: 'Dougie Wood', owner: 'George Whales', approver: 'George Whales', reviewDate: '10/3/2026', frequency: '12', starred: false, status: 'Waiting for e-Signature', lifecycle: 'In Review', version: 'v5', isCheckedOut: true, checkedOutBy: 'Dougie Wood', activeWorkflow: 'SOP Quality Review', workflowStep: 'Step 2/4', stepResponsible: 'Quality Reviewer', isInInbox: true, inboxUpdatedAt: '2026-04-28T13:35:00Z', signers: [{ name: 'Sarah Jenkins', email: 'sarah.jenkins@company.com', initial: 'S', color: '#EBEDF0', textColor: '#044ED7' }] },
  { id: 3, isFolder: false, parentFolderId: 102, site: 'Sandy', line: 'Line 12', asset: 'Syringe Forming Cell', businessLine: 'Formulation', productPlatform: 'Syringes', qualityCategory: 'Work Instructions', sharedWithTeam: false, name: 'Syringe Cell Work Instruction.docx', type: 'Manual', modified: '6 minutes ago', modifiedBy: 'Dougie Wood', owner: 'Marcus Chods', approver: 'George Whales', reviewDate: '10/3/2026', frequency: '12', starred: false, status: 'Under Revision', lifecycle: 'In Review', version: 'v2', isCheckedOut: false, activeWorkflow: 'Instruction Review', workflowStep: 'Step 1/3', stepResponsible: 'Line Supervisor', isInInbox: true, inboxUpdatedAt: '2026-04-28T13:30:00Z' },
  { id: 4, isFolder: false, parentFolderId: 103, site: 'Sandy', line: 'Line 4', asset: 'Sterile Packaging Press', businessLine: 'Medication Delivery Solutions', productPlatform: 'Nexiva', qualityCategory: 'NC', sharedWithTeam: true, name: 'Sterile Packaging Quality Manual.docx', type: 'Manual', modified: '6 minutes ago', modifiedBy: 'Dougie Wood', owner: 'Chris Klopp', approver: 'George Whales', reviewDate: '10/3/2026', frequency: '12', starred: false, status: 'Waiting for e-Signature', lifecycle: 'In Review', version: 'v8', isCheckedOut: false, activeWorkflow: 'Quality Manual Approval', workflowStep: 'Step 2/3', stepResponsible: 'Compliance Manager', isInInbox: true, inboxUpdatedAt: '2026-04-28T13:20:00Z' },
  { id: 5, isFolder: false, parentFolderId: 103, site: 'Sandy', line: 'Line 4', asset: 'Sterile Packaging Press', businessLine: 'Medication Delivery Solutions', productPlatform: 'Nexiva', qualityCategory: 'NC', sharedWithTeam: false, name: 'Sterile Line Maintenance Protocol.docx', type: 'Manual', modified: '5 minutes ago', modifiedBy: 'Dougie Wood', owner: 'George Whales', approver: 'George Whales', reviewDate: '10/3/2026', frequency: '12', starred: false, status: 'Waiting for approval', lifecycle: 'In Review', version: 'v12', isCheckedOut: false, activeWorkflow: 'Maintenance Protocol Review', workflowStep: 'Step 2/4', stepResponsible: 'Maintenance Lead', isInInbox: true, inboxUpdatedAt: '2026-04-28T13:15:00Z' },
  { id: 6, isFolder: false, parentFolderId: 101, site: 'Sandy', line: 'Line 10', asset: 'Autoguard Conveyor', businessLine: 'Medication Delivery Solutions', productPlatform: 'Syringes', qualityCategory: 'SOP', sharedWithTeam: true, name: 'Autoguard Startup Checklist.docx', type: 'Checklist', modified: '2 days ago', modifiedBy: 'Sarah Jenkins', owner: 'Chris Klopp', approver: 'George Whales', reviewDate: '09/3/2026', frequency: '6', starred: false, status: 'Approved', lifecycle: 'Approved', version: 'v7', isCheckedOut: false, isInInbox: true, inboxUpdatedAt: '2026-04-26T15:00:00Z' },
  { id: 7, isFolder: false, parentFolderId: 103, site: 'Sandy', line: 'Line 4', asset: 'Sterile Packaging Press', businessLine: 'Medication Delivery Solutions', productPlatform: 'Nexiva', qualityCategory: 'NC', sharedWithTeam: false, name: 'Sterile Press Deviation Note.docx', type: 'Deviation', modified: '4 days ago', modifiedBy: 'Olivia Martin', owner: 'George Whales', approver: 'Claire Mendes', reviewDate: '08/3/2026', frequency: '-', starred: false, status: 'Canceled', lifecycle: 'Archived', version: 'v3', isCheckedOut: false, isInInbox: true, inboxUpdatedAt: '2026-04-24T18:10:00Z' },
  { id: 8, isFolder: false, parentFolderId: 102, site: 'Sandy', line: 'Line 12', asset: 'Syringe Forming Cell', businessLine: 'Formulation', productPlatform: 'Syringes', qualityCategory: 'Work Instructions', sharedWithTeam: true, name: 'Line 12 Cleaning Procedure.docx', type: 'Procedure', modified: '1 week ago', modifiedBy: 'Marcus Chods', owner: 'Marcus Chods', approver: 'George Whales', reviewDate: '04/3/2026', frequency: '12', starred: false, status: 'Approved', lifecycle: 'Published', version: 'v14', isCheckedOut: false, isInInbox: true, inboxUpdatedAt: '2026-04-21T10:30:00Z' },
];

const buildFolderChain = (items: UnifiedItem[], folderId: number | null) => {
  if (folderId == null) return [] as UnifiedItem[];
  const byId = new Map(items.map((item) => [item.id, item]));
  const chain: UnifiedItem[] = [];
  let current = byId.get(folderId);

  while (current && current.isFolder) {
    chain.unshift(current);
    current = current.parentFolderId ? byId.get(current.parentFolderId) : undefined;
  }

  return chain;
};

type SiteOption = {
  id: string;
  name: string;
  subtitle: string;
  country: string;
  region: 'USA' | 'Europe' | 'Asia';
  mapX: number;
  mapY: number;
  code: string;
};

const siteOptions: SiteOption[] = [
  { id: 'global', name: 'Global View', subtitle: 'All Sites', country: 'Global', region: 'USA', mapX: 50, mapY: 44, code: 'GLB' },
  { id: 'sandy-us', name: 'Sandy', subtitle: 'San Diego Site', country: 'USA', region: 'USA', mapX: 13, mapY: 51, code: 'SDG' },
  { id: 'austin-us', name: 'Austin', subtitle: 'Texas Site', country: 'USA', region: 'USA', mapX: 19, mapY: 55, code: 'AUS' },
  { id: 'chicago-us', name: 'Chicago', subtitle: 'Illinois Site', country: 'USA', region: 'USA', mapX: 23, mapY: 45, code: 'CHI' },
  { id: 'barcelona-es', name: 'Barcelona', subtitle: 'Spain Site', country: 'Spain', region: 'Europe', mapX: 46, mapY: 49, code: 'BCN' },
  { id: 'paris-fr', name: 'Paris', subtitle: 'France Site', country: 'France', region: 'Europe', mapX: 45, mapY: 43, code: 'PAR' },
  { id: 'manchester-uk', name: 'Manchester', subtitle: 'UK Site', country: 'United Kingdom', region: 'Europe', mapX: 42, mapY: 38, code: 'MAN' },
  { id: 'jakarta-id', name: 'Jakarta', subtitle: 'Indonesia Site', country: 'Indonesia', region: 'Asia', mapX: 76, mapY: 71, code: 'JKT' },
  { id: 'shanghai-cn', name: 'Shanghai', subtitle: 'China Site', country: 'China', region: 'Asia', mapX: 82, mapY: 47, code: 'SHA' },
  { id: 'shenzhen-cn', name: 'Shenzhen', subtitle: 'China South Site', country: 'China', region: 'Asia', mapX: 80, mapY: 53, code: 'SZN' },
  { id: 'tokyo-jp', name: 'Tokyo', subtitle: 'Japan Site', country: 'Japan', region: 'Asia', mapX: 88, mapY: 45, code: 'TYO' },
];

const buildSiteData = (site: SiteOption): UnifiedItem[] => {
  if (site.id === 'global') {
    const oldToNew = new Map<number, number>();
    initialData.forEach((item) => {
      oldToNew.set(item.id, item.id + 9000);
    });
    return initialData.map((item) => ({
      ...item,
      id: oldToNew.get(item.id) ?? item.id + 9000,
      parentFolderId: item.parentFolderId ? oldToNew.get(item.parentFolderId) : undefined,
      site: item.site ?? 'Global',
    }));
  }

  const oldToNew = new Map<number, number>();
  initialData.forEach((item, index) => {
    oldToNew.set(item.id, item.id + (index + 1) * 100 + site.code.charCodeAt(0));
  });

  return initialData.map((item) => {
    const sitePrefix = `[${site.code}] `;
    const ownerByRegion = site.region === 'USA' ? 'Danilo Brooks' : site.region === 'Europe' ? 'Elena Martin' : 'Kenji Sato';
    const approverByRegion = site.region === 'USA' ? 'Chris Klopp' : site.region === 'Europe' ? 'Claire Dubois' : 'Li Wei';
    return {
      ...item,
      id: oldToNew.get(item.id) ?? item.id,
      parentFolderId: item.parentFolderId ? oldToNew.get(item.parentFolderId) : undefined,
      site: site.name,
      name: item.isFolder ? `${site.name} ${item.line ?? ''} ${item.asset ?? ''}`.trim() : `${sitePrefix}${item.name}`,
      modifiedBy: ownerByRegion,
      owner: ownerByRegion,
      approver: approverByRegion,
      isInInbox: item.isInInbox,
    };
  });
};

const mockExplorerFiles = [
  { name: 'Annual_Financial_Report_2024.pdf', size: '2.4 MB', modified: 'Oct 12, 2024', type: 'PDF', docType: 'Report' },
  { name: 'Global_Security_Protocols_v3.docx', size: '850 KB', modified: 'Nov 05, 2024', type: 'Manual', docType: 'Manual' },
  { name: 'Site_Safety_SOP_v2.pdf', size: '1.2 MB', modified: 'Yesterday', type: 'SOP', docType: 'SOP' },
  { name: 'Employee_Onboarding_Handbook.pdf', size: '3.1 MB', modified: 'Today', type: 'Manual', docType: 'Manual' },
];

const fakeApi = <T,>(payload: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(payload), 500));

const aiResponse = {
  summary: 'Key process updated in this hierarchy context.',
  risks: ['Missing validation signature on one SOP', 'One work instruction is pending owner confirmation'],
  changes: ['Section 2 revised for line startup checks', 'Approval routing updated for quality escalation'],
};

// --- Props ---
// --- Custom Icons ---
const DetailsPaneIcon = ({ ...props }) => (
  <svg 
    width="22" 
    height="16" 
    viewBox="0 0 22 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
    {...props}
  >
    {/* Left Frame (Gray/White) */}
    <path 
      d="M2 2C2 0.895431 2.89543 0 4 0H11V16H4C2.89543 16 2 15.1046 2 14V2Z" 
      fill="#f5f5f5" 
      stroke="#bdbdbd" 
      strokeWidth="1.5"
    />
    {/* Right Frame (Blue) */}
    <path 
      d="M11 0H18C19.1046 0 20 0.895431 20 2V14C20 15.1046 19.1046 16 18 16H11V0Z" 
      fill="#0288d1" 
      stroke="#0288d1" 
      strokeWidth="1.5"
    />
    {/* Details Lines (White) */}
    <rect x="13.5" y="4" width="3.5" height="1.5" rx="0.5" fill="white" />
    <rect x="13.5" y="7" width="3.5" height="1.5" rx="0.5" fill="white" />
    <rect x="13.5" y="10" width="3.5" height="1.5" rx="0.5" fill="white" />
    {/* Outer boundary stroke for premium feel */}
    <rect x="1.25" y="0.75" width="19.5" height="14.5" rx="2.25" stroke="#9e9e9e" strokeWidth="0.5" opacity="0.5"/>
  </svg>
);

// --- AI Analysis Result Component ---
const AIAnalysisResultDialog = ({ open, onClose, fileName }: { open: boolean, onClose: () => void, fileName: string }) => {
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const [expandedCheck, setExpandedCheck] = useState<string | false>('regulatory');
  const [stepStatuses, setStepStatuses] = useState<Record<number, 'accepted' | 'rejected' | 'neutral'>>({
    1: 'neutral',
    2: 'neutral',
    3: 'neutral',
    4: 'neutral',
  });

  const handleCheckChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedCheck(isExpanded ? panel : false);
  };

  const steps = [
    { 
      id: 1, 
      title: 'Step 1: Redact Personally Identifiable Information (PII)', 
      desc: 'Automatically mask 2 Employee IDs detected in Section 4 to comply with privacy standards.',
      icon: <ShieldIcon sx={{ color: '#1D74FF' }} />,
      bgcolor: '#EBEDF0'
    },
    { 
      id: 2, 
      title: 'Step 2: Resolve Handbook Conflicts', 
      desc: 'Rewrite Section 2.1 to align with the "Employee Handbook 2024" and update outdated machinery protocols.',
      icon: <DescriptionIcon sx={{ color: '#1D74FF' }} />,
      bgcolor: '#EBEDF0'
    },
    { 
      id: 3, 
      title: 'Step 3: Patch Regulatory Gaps (FDA 21 CFR)', 
      desc: 'Insert standard electronic signature framework (Â§11.50) and immutable audit trail clauses.',
      icon: <AssignmentTurnedInIcon sx={{ color: '#1D74FF' }} />,
      bgcolor: '#EBEDF0'
    },
    { 
      id: 4, 
      title: 'Step 4: Route for Legal Approval & Signatures', 
      desc: 'Initiate auto-suggested workflow to Legal department, followed by Shift Managers for sign-off.',
      icon: <WorkflowIcon sx={{ color: '#1D74FF' }} />,
      bgcolor: '#EBEDF0'
    }
  ];

  const validationChecks = [
    { id: 'impact', label: 'Impact Analysis', status: 'Warning', message: '3 Conflicts detected with existing documents.', icon: <WarningIcon sx={{ color: '#FF6E00' }} /> },
    { id: 'completeness', label: 'Completeness Check', status: 'Pass', message: 'All required sections are present.', icon: <CheckCircleIcon sx={{ color: '#00AF95' }} /> },
    { id: 'duplicate', label: 'Duplicate Detection', status: 'Warning', message: 'High similarity to existing document.', icon: <WarningIcon sx={{ color: '#FF6E00' }} /> },
    { id: 'signature', label: 'Signature Verification', status: 'Fail', message: 'Missing authorizing signatures.', icon: <ErrorOutlineIcon sx={{ color: '#E43B46' }} /> },
    { id: 'regulatory', label: 'Regulatory Compliance', status: 'Fail', message: 'Fails FDA 21 CFR standards.', icon: <ErrorOutlineIcon sx={{ color: '#E43B46' }} /> },
    { id: 'retention', label: 'Retention Policy', status: 'Pass', message: 'Correct lifecycle policy assigned.', icon: <CheckCircleIcon sx={{ color: '#00AF95' }} /> },
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth 
      PaperProps={{ 
        sx: { 
          borderRadius: 4, 
          height: '96vh', 
          bgcolor: '#ffffff', 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        } 
      }}
    >
      {/* Header */}
      <Box sx={{ 
        px: 3, 
        py: 2, 
        borderBottom: '1px solid #EBEDF0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SparkleIcon sx={{ color: '#1D74FF', fontSize: 28 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1F2366', lineHeight: 1.2 }}>Analysis Complete</Typography>
            <Typography variant="caption" sx={{ color: '#626465', fontWeight: 600 }}>{fileName || 'Project_Alpha_Specs.pdf'}</Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Main Content */}
      <DialogContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 4, minHeight: 0, bgcolor: '#EBEDF0' }}>
        
        {/* Section 1: AI Diagnostics Overview */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <SparkleIcon sx={{ color: '#1D74FF', fontSize: 18 }} />
            <Typography sx={{ fontWeight: 800, color: '#1F2366', fontSize: '0.95rem' }}>AI Diagnostics Overview</Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid size={{ xs: 6 }}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #DBDDDF', height: '100%', bgcolor: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <DescriptionIcon sx={{ color: '#1D74FF', fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 800, color: '#626465', fontSize: '0.85rem' }}>Document Summary</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#626465', lineHeight: 1.6, fontSize: '0.88rem' }}>
                  This document outlines the updated safety protocols for the Q4 manufacturing cycle. It introduces new compliance checks for heavy machinery operation and mandates a revised incident reporting structure.
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #DBDDDF', height: '100%', bgcolor: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <InfoOutlinedIcon sx={{ color: '#1D74FF', fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 800, color: '#626465', fontSize: '0.85rem' }}>Extracted Metadata</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#808285', fontSize: '0.65rem' }}>DOC TYPE</Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip label="Policy Draft" size="small" sx={{ bgcolor: '#EBEDF0', color: '#1D74FF', fontWeight: 800, borderRadius: 1, height: 24, fontSize: '0.7rem' }} />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#808285', fontSize: '0.65rem' }}>SENSITIVITY</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <LockIcon sx={{ fontSize: 14, color: '#a855f7' }} />
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#a855f7' }}>Internal Use</Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#808285', fontSize: '0.65rem' }}>DEPARTMENT</Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#1F2366', mt: 0.5 }}>Health & Safety</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#808285', fontSize: '0.65rem' }}>EFFECTIVE</Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#1F2366', mt: 0.5 }}>Nov 1, 2025</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Section 2: Validation & Compliance */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FactCheckIcon sx={{ color: '#1D74FF', fontSize: 18 }} />
              <Typography sx={{ fontWeight: 800, color: '#1F2366', fontSize: '0.95rem' }}>Validation & Compliance</Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#626465', fontWeight: 700 }}>6 Checks Run</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {validationChecks.map((check) => (
              <Accordion 
                key={check.id}
                expanded={expandedCheck === check.id}
                onChange={handleCheckChange(check.id)}
                elevation={0}
                sx={{ 
                  border: '1px solid #DBDDDF', 
                  borderRadius: '12px !important',
                  overflow: 'hidden',
                  '&:before': { display: 'none' }
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 20 }} />} sx={{ minHeight: 56 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    {check.icon}
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: '#1F2366', fontSize: '0.88rem' }}>{check.label}</Typography>
                      <Typography variant="caption" sx={{ color: '#626465', fontWeight: 600 }}>{check.message}</Typography>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ borderTop: '1px solid #EBEDF0', bgcolor: '#EBEDF0', p: 3 }}>
                  {check.id === 'impact' ? (
                    <Box sx={{ border: '1px solid #DBDDDF', borderRadius: '12px', overflow: 'hidden', bgcolor: 'white' }}>
                      <Box sx={{ bgcolor: '#fffbeb', px: 2, py: 1.5, borderBottom: '1px solid #fef3c7' }}>
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400e' }}>
                          The AI detected conflicts with these existing documents. Review required to maintain overall compliance.
                        </Typography>
                      </Box>
                      <List sx={{ p: 0 }}>
                        {[
                          { name: 'Employee Handbook.docx', problem: 'SEC 2.1 CONFLICT', color: '#FF6E00', bg: '#fff3e0' },
                          { name: 'Operation Guide.docx', problem: 'OUTDATED PROTOCOLS', color: '#616161', bg: '#f5f5f5' },
                          { name: 'Incident Report Template.pdf', problem: 'MISSING FIELDS', color: '#044ED7', bg: '#EBEDF0' },
                        ].map((doc, i) => (
                          <ListItem 
                            key={i} 
                            divider={i !== 2} 
                            sx={{ 
                              px: 2.5, 
                              py: 1.25, 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              '&:hover': { bgcolor: '#EBEDF0' },
                              transition: 'background-color 0.15s'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <DescriptionIcon sx={{ color: '#044ED7', fontSize: 18 }} />
                              <Typography sx={{ fontWeight: 500, fontSize: '0.85rem', color: '#1F2366' }}>{doc.name}</Typography>
                            </Box>
                            <Chip 
                              label={doc.problem} 
                              size="small" 
                              sx={{ 
                                bgcolor: doc.bg, 
                                color: doc.color, 
                                fontWeight: 700, 
                                fontSize: '0.68rem', 
                                height: 20, 
                                borderRadius: 1 
                              }} 
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  ) : check.id === 'regulatory' ? (
                    <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CircularProgress variant="determinate" value={78} size={80} thickness={6} sx={{ color: '#00AF95' }} />
                        <Box sx={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: '#1F2366' }}>78%</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{ fontWeight: 800, color: '#1F2366', fontSize: '0.85rem', mb: 1.5 }}>Violation Details:</Typography>
                        <Grid container spacing={2}>
                          {[
                            { severity: 'Critical', issue: 'Missing Audit Trail Clause', code: 'Â§11.10(b)' },
                            { severity: 'Major', issue: 'Signature Verification Logic', code: 'Â§11.50' },
                            { severity: 'Minor', issue: 'Date Format Inconsistency', code: 'Internal SOP' },
                          ].map((v, i) => (
                            <Grid size={{ xs: 4 }} key={i}>
                              <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 2, border: '1px solid #DBDDDF' }}>
                                <Typography variant="caption" sx={{ 
                                  fontWeight: 900, 
                                  color: v.severity === 'Critical' ? '#E43B46' : v.severity === 'Major' ? '#FF6E00' : '#1D74FF',
                                  textTransform: 'uppercase',
                                  fontSize: '0.6rem',
                                  display: 'block',
                                  mb: 0.5
                                }}>{v.severity}</Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#1F2366' }}>{v.issue}</Typography>
                                <Typography variant="caption" sx={{ color: '#626465', fontSize: '0.65rem' }}>Ref: {v.code}</Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    </Box>
                  ) : check.id === 'duplicate' ? (
                    <Box sx={{ bgcolor: '#fffbeb', p: 2, borderRadius: 2, border: '1px solid #fef3c7', display: 'flex', alignItems: 'center' }}>
                      <WarningIcon sx={{ color: '#FF6E00', fontSize: 20, mr: 1.5 }} />
                      <Typography variant="body2" sx={{ color: '#92400e', fontWeight: 600 }}>
                        This document is <span style={{ fontWeight: 800 }}>94% identical</span> to <span style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 800 }}>Project_Alpha_Specs_v1.pdf</span>. Please verify if this is intended to be a new version or a separate document.
                      </Typography>
                    </Box>
                  ) : check.id === 'retention' ? (
                    <Box sx={{ bgcolor: '#EBEDF0', p: 2, borderRadius: 2, border: '1px solid #DBDDDF' }}>
                      <Typography variant="body2" sx={{ color: '#1e3a8a', fontWeight: 800 }}>Standard 5-year policy applied.</Typography>
                      <Typography sx={{ color: '#1D74FF', fontWeight: 600, fontSize: '0.85rem', mt: 0.5 }}>
                        Based on the document type (Policy Draft), the standard 5-year retention policy has been automatically assigned.
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#626465' }}>Detailed findings for {check.label} would be listed here...</Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>

        {/* Section 3: AI Execution Plan */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TuneIcon sx={{ color: '#1D74FF', fontSize: 18 }} />
              <Typography sx={{ fontWeight: 800, color: '#1F2366', fontSize: '0.95rem' }}>AI Execution Plan</Typography>
            </Box>
            <Chip label="4 Pending Actions" size="small" sx={{ bgcolor: '#EBEDF0', color: '#1D74FF', fontWeight: 800, borderRadius: 1, fontSize: '0.7rem' }} />
          </Box>

          {/* Master Remediation Banner */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              bgcolor: '#f0f7ff', 
              border: '1px solid #bfdbfe',
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Box sx={{ p: 1, bgcolor: '#DBDDDF', borderRadius: 1.5 }}>
              <SparkleIcon sx={{ color: '#044ED7' }} />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography sx={{ fontWeight: 800, color: '#1e3a8a', fontSize: '0.9rem' }}>Automated Remediation Plan</Typography>
              <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 600 }}>The AI has formulated a step-by-step plan to resolve the identified conflicts, patch regulatory gaps, and finalize the document. Review the proposed steps below.</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ display: 'block', fontWeight: 900, fontSize: '0.65rem', color: '#044ED7', mb: 0.5, letterSpacing: 0.5 }}>AI CONSOLIDATION</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: isAiEnabled ? '#044ED7' : '#808285' }}>{isAiEnabled ? 'ENABLED' : 'DISABLED'}</Typography>
                <Switch 
                  checked={isAiEnabled} 
                  onChange={(e) => setIsAiEnabled(e.target.checked)}
                  sx={{ 
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#044ED7' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#044ED7' }
                  }}
                />
              </Box>
            </Box>
          </Paper>

          {/* Proposed Steps */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, opacity: isAiEnabled ? 1 : 0.5, pointerEvents: isAiEnabled ? 'auto' : 'none' }}>
            {steps.map((step) => (
              <Paper 
                key={step.id} 
                elevation={0} 
                sx={{ 
                  p: 2.5, 
                  borderRadius: 3, 
                  border: '1px solid #DBDDDF', 
                  bgcolor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2.5
                }}
              >
                <Box sx={{ p: 1, bgcolor: step.bgcolor, borderRadius: 2 }}>
                  {step.icon}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography sx={{ fontWeight: 850, color: '#1F2366', fontSize: '0.88rem' }}>{step.title}</Typography>
                  <Typography variant="caption" sx={{ color: '#626465', fontWeight: 600 }}>{step.desc}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Tooltip title="Accept step">
                    <IconButton 
                      size="small" 
                      onClick={() => setStepStatuses(prev => ({ ...prev, [step.id]: 'accepted' }))}
                      sx={{ 
                        color: stepStatuses[step.id] === 'accepted' ? '#00AF95' : '#808285', 
                        transition: 'all 0.3s ease',
                        '&:hover': { bgcolor: stepStatuses[step.id] === 'accepted' ? '#f0fdf4' : '#EBEDF0' } 
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Cancel step">
                    <IconButton 
                      size="small" 
                      onClick={() => setStepStatuses(prev => ({ ...prev, [step.id]: 'rejected' }))}
                      sx={{ 
                        color: stepStatuses[step.id] === 'rejected' ? '#E43B46' : '#808285', 
                        transition: 'all 0.3s ease',
                        '&:hover': { bgcolor: stepStatuses[step.id] === 'rejected' ? '#fef2f2' : '#EBEDF0' } 
                      }}
                    >
                      <CancelIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Edit step / custom instructions">
                    <IconButton size="small" sx={{ color: '#808285', '&:hover': { bgcolor: '#EBEDF0' } }}>
                      <EditIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>

      </DialogContent>

      {/* Footer */}
      <Box sx={{ 
        p: 2.5, 
        borderTop: '1px solid #EBEDF0', 
        bgcolor: 'white', 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: 2,
        alignItems: 'center'
      }}>
        <Button 
          onClick={onClose} 
          variant="text" 
          sx={{ 
            borderRadius: 2, 
            textTransform: 'none', 
            fontWeight: 700, 
            color: '#626465',
            px: 3
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={onClose} 
          variant="contained" 
          startIcon={<CheckCircleIcon />}
          sx={{ 
            borderRadius: 2.5, 
            textTransform: 'none', 
            fontWeight: 800, 
            bgcolor: '#044ED7', 
            px: 4,
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
            '&:hover': { bgcolor: '#1D74FF' }
          }}
        >
          Commit Actions & Save Document
        </Button>
      </Box>
    </Dialog>
  );
};


interface DocumentManagementScreenProps {
  onBack: () => void;
  initialWorkspace?: DmsWorkspace;
  chatOpenDocumentRequest?: { name: string; nonce: number } | null;
  onCreateNewFileClick?: () => void;
  onApprovePriorityClick?: () => void;
  onOpenMainAiForDocument?: (fileName: string) => void;
  onStartWorkflowWithAi?: (context: string) => void;
  onVersionHistoryClick?: (doc: UnifiedItem) => void;
  onAuditTrailClick?: () => void;
  onComplianceClick?: () => void;
  onWorkflowClick?: () => void;
  onOperationsClick?: () => void;
  onAIHubClick?: () => void;
  onOpenArtifactClick?: (artifact: {
    id: number;
    name: string;
    type: string;
    status?: string;
    version?: string;
    owner?: string;
    approver?: string;
    modified?: string;
    modifiedBy?: string;
    reviewDate?: string;
    site?: string;
    line?: string;
    asset?: string;
  }) => void;
}

export default function DocumentManagementScreen({
  onBack,
  initialWorkspace = 'Inbox',
  chatOpenDocumentRequest,
  onCreateNewFileClick,
  onApprovePriorityClick,
  onOpenMainAiForDocument,
  onStartWorkflowWithAi,
  onVersionHistoryClick,
  onAuditTrailClick,
  onComplianceClick,
  onOperationsClick,
  onAIHubClick,
  onOpenArtifactClick,
}: DocumentManagementScreenProps) {
  const [selectedWorkspace, setSelectedWorkspace] = useState<DmsWorkspace>(initialWorkspace);
  const [selectedInboxSection, setSelectedInboxSection] = useState<InboxSection>('All');
  const [selectedRepositorySection, setSelectedRepositorySection] = useState<RepositorySection>('AllDocuments');
  const [activeFolderId, setActiveFolderId] = useState<number | null>(null);
  const [selectedLine, setSelectedLine] = useState<string>('All Lines');
  const [selectedAsset, setSelectedAsset] = useState<string>('All Assets');
  const [selectedDocumentHierarchyId, setSelectedDocumentHierarchyId] = useState<string>('plant-sandy-area-assembly-unit-b-line-autoguard');
  const [favoriteDocumentHierarchyIds, setFavoriteDocumentHierarchyIds] = useState<string[]>([]);
  const [selectedHierarchy, setSelectedHierarchy] = useState<{ groupId: string; item: string }>({
    groupId: 'assets',
    item: 'Sandy - Line 10 Autoguard',
  });
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState('sandy-us');
  const [isSiteMapOpen, setIsSiteMapOpen] = useState(false);
  const [data, setData] = useState<UnifiedItem[]>(buildSiteData(siteOptions.find((site) => site.id === 'sandy-us') ?? siteOptions[1]));
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'info' | 'error' });
  const [isEditMode, setIsEditMode] = useState(false);
  const [isWorkflowSidePanelOpen, setIsWorkflowSidePanelOpen] = useState(false);
  const [isShareSidePanelOpen, setIsShareSidePanelOpen] = useState(false);
  const [shareInput, setShareInput] = useState('');
  const [selectedPeople, setSelectedPeople] = useState<any[]>([]);
  const [workflowTab, setWorkflowTab] = useState<'template' | 'custom'>('template');
  const [selectedWorkflowTemplate, setSelectedWorkflowTemplate] = useState('');
  const [customWorkflowName, setCustomWorkflowName] = useState('');
  const [customSteps, setCustomSteps] = useState([{ id: 1, name: 'Manager Review', role: 'Manager', sla: '24', email: 'user@company.com' }]);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [detailsWidth, setDetailsWidth] = useState(480);
  const [isDocuSignSidePanelOpen, setIsDocuSignSidePanelOpen] = useState(false);
  const [selectedESignatureTool, setSelectedESignatureTool] = useState('DocuSign');
  const [selectedSigners, setSelectedSigners] = useState<any[]>([]);
  const [signerInput, setSignerInput] = useState('');
  const [isSigningSimulationOpen, setIsSigningSimulationOpen] = useState(false);
  const [itemBeingSigned, setItemBeingSigned] = useState<UnifiedItem | null>(null);
  const [hasUserSigned, setHasUserSigned] = useState(false);
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedMockFile, setSelectedMockFile] = useState<any>(null);
  const [isAnalysisResultOpen, setIsAnalysisResultOpen] = useState(false);
  const [documentDrafts, setDocumentDrafts] = useState<Record<number, string>>({});
  const [createMenuAnchor, setCreateMenuAnchor] = useState<null | HTMLElement>(null);
  const [isNewContentFolderDialogOpen, setIsNewContentFolderDialogOpen] = useState(false);
  const [newContentFolderName, setNewContentFolderName] = useState('');
  const [isAiSummaryOpen, setIsAiSummaryOpen] = useState(false);
  const [isAiSummaryLoading, setIsAiSummaryLoading] = useState(false);
  const [aiSummaryData, setAiSummaryData] = useState<{ summary: string; risks: string[]; changes: string[] } | null>(null);
  const [searchViewMode, setSearchViewMode] = useState<RepositoryViewMode>('list');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('All Departments');
  const [selectedDocTypeFilter, setSelectedDocTypeFilter] = useState('All Types');
  const [selectedOriginFilter, setSelectedOriginFilter] = useState('All Origins');
  const [selectedLifecycleFilter, setSelectedLifecycleFilter] = useState('All Lifecycles');
  const [selectedOwnerFilter, setSelectedOwnerFilter] = useState('All Owners');
  const [selectedModifiedDateFilter, setSelectedModifiedDateFilter] = useState('Any Time');
  const [selectedApproverFilter, setSelectedApproverFilter] = useState('All Approvers');
  const [selectedReviewDateFilter, setSelectedReviewDateFilter] = useState('All Review Dates');
  const [selectedTagFilter, setSelectedTagFilter] = useState('All Tags');
  const [selectedFileFormatFilter, setSelectedFileFormatFilter] = useState('All Formats');
  const [isAiInsightsPanelOpen, setIsAiInsightsPanelOpen] = useState(true);
  const isCreateMenuOpen = Boolean(createMenuAnchor);
  const isResizing = useRef(false);
  const selectedSite = siteOptions.find((site) => site.id === selectedSiteId) ?? siteOptions[1];
  const selectedHierarchyPath = React.useMemo(
    () => findDocumentHierarchyPath(selectedDocumentHierarchyId) ?? [],
    [selectedDocumentHierarchyId],
  );

  useEffect(() => {
    setSelectedWorkspace(initialWorkspace);
    if (initialWorkspace === 'Inbox') {
      setSelectedInboxSection('All');
    }
    setSelectedIds([]);
    setActiveFolderId(null);
    setIsDetailsOpen(false);
  }, [initialWorkspace]);

  useEffect(() => {
    setData(buildSiteData(selectedSite));
    setSelectedIds([]);
    setSelectedWorkspace(initialWorkspace);
    setSelectedInboxSection('All');
    setSelectedRepositorySection('AllDocuments');
    setActiveFolderId(null);
    setSelectedLine('All Lines');
    setSelectedAsset('All Assets');
    setSelectedDocumentHierarchyId('plant-sandy-area-assembly-unit-b-line-autoguard');
    setFavoriteDocumentHierarchyIds([]);
    setSelectedHierarchy({ groupId: 'assets', item: 'Sandy - Line 10 Autoguard' });
    setSearchQuery('');
    setSearchViewMode('list');
    setSelectedDepartmentFilter('All Departments');
    setSelectedDocTypeFilter('All Types');
    setSelectedOriginFilter('All Origins');
    setSelectedLifecycleFilter('All Lifecycles');
    setSelectedOwnerFilter('All Owners');
    setSelectedModifiedDateFilter('Any Time');
    setSelectedApproverFilter('All Approvers');
    setSelectedReviewDateFilter('All Review Dates');
    setSelectedTagFilter('All Tags');
    setSelectedFileFormatFilter('All Formats');
  }, [initialWorkspace, selectedSiteId]);

  useEffect(() => {
    if (!chatOpenDocumentRequest?.name) return;

    setSelectedWorkspace('Inbox');
    setSelectedInboxSection('All');
    setSelectedRepositorySection('AllDocuments');
    setActiveFolderId(null);
    setSearchQuery('');
    setSelectedIds([]);
    setIsDetailsOpen(false);
  }, [chatOpenDocumentRequest, data]);

  const handleCreateButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setCreateMenuAnchor(event.currentTarget);
  };

  const handleSiteSelect = (siteId: string) => {
    setSelectedSiteId(siteId);
    setIsSiteMapOpen(false);
  };

  const handleCreateMenuClose = () => {
    setCreateMenuAnchor(null);
  };

  const handleAddFolderToTable = () => {
    if (newContentFolderName.trim()) {
      const newFolder: UnifiedItem = {
        id: Date.now(),
        isFolder: true,
        parentFolderId: activeFolderId ?? undefined,
        site: selectedSite.name,
        line: selectedLine === 'All Lines' ? undefined : selectedLine,
        asset: selectedAsset === 'All Assets' ? undefined : selectedAsset,
        name: newContentFolderName.trim(),
        type: 'Hierarchy Node',
        modified: 'Just now',
        modifiedBy: 'You',
        owner: 'You',
        approver: '-',
        reviewDate: '-',
        frequency: '-',
        starred: false,
        items: 0,
      };
      setData(prev => [newFolder, ...prev]);
      setNewContentFolderName('');
      setIsNewContentFolderDialogOpen(false);
      showSnackbar(`Hierarchy node "${newFolder.name}" created`, 'success');
    } else {
      setIsNewContentFolderDialogOpen(false);
    }
  };

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth > 300 && newWidth < 800) {
      setDetailsWidth(newWidth);
    }
  }, []);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
  }, [handleMouseMove, stopResizing]);

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResizing);
    };
  }, [handleMouseMove, stopResizing]);

  // --- Handlers ---
  const handleSelectWorkspace = (workspace: DmsWorkspace) => {
    setSelectedWorkspace(workspace);
    if (workspace === 'Inbox') {
      setSelectedInboxSection('All');
    }
    if (workspace === 'Documents') {
      setSelectedRepositorySection('AllDocuments');
    }
    setSelectedIds([]);
    setActiveFolderId(null);
    setIsDetailsOpen(false);
  };

  const handleSelectInboxSection = (section: InboxSection) => {
    setSelectedWorkspace('Inbox');
    setSelectedInboxSection(section);
    setSelectedIds([]);
    setActiveFolderId(null);
    setIsDetailsOpen(false);
  };

  const handleSelectRepositorySection = (section: RepositorySection) => {
    setSelectedWorkspace('Documents');
    setSelectedRepositorySection(section);
    setSelectedIds([]);
    setActiveFolderId(null);
    setIsDetailsOpen(false);
  };

  const handleHierarchySelection = (groupId: string, item: string) => {
    setSelectedHierarchy({ groupId, item });
    if (groupId === 'assets') {
      if (item.includes('Line 10')) {
        setSelectedLine('Line 10');
        setSelectedAsset('Autoguard Conveyor');
      } else if (item.includes('Line 12')) {
        setSelectedLine('Line 12');
        setSelectedAsset('Syringe Forming Cell');
      } else if (item.includes('Line 4')) {
        setSelectedLine('Line 4');
        setSelectedAsset('Sterile Packaging Press');
      }
      return;
    }
    setSelectedLine('All Lines');
    setSelectedAsset('All Assets');
  };

  const handleDocumentHierarchySelection = (nodeId: string) => {
    setSelectedDocumentHierarchyId(nodeId);

    const path = findDocumentHierarchyPath(nodeId) ?? [];
    const plantLabel = path.find((node) => node.kind === 'plant')?.label ?? '';
    const lineLabel = path.find((node) => node.kind === 'line')?.label ?? '';
    const zoneLabel = path.find((node) => node.kind === 'zone')?.label ?? '';
    const detailLabel = zoneLabel || lineLabel || path[path.length - 1]?.label || 'Hierarchy';

    if (plantLabel === 'Sandy' && lineLabel === 'Autoguard') {
      setSelectedLine('Line 10');
      setSelectedAsset('Autoguard Conveyor');
      setSelectedHierarchy({ groupId: 'assets', item: 'Sandy - Line 10 Autoguard' });
      return;
    }

    if (plantLabel === 'Sandy' && lineLabel === 'Line 30') {
      setSelectedLine('Line 12');
      setSelectedAsset('Syringe Forming Cell');
      setSelectedHierarchy({ groupId: 'assets', item: 'Sandy - Line 12 Syringe Cell' });
      return;
    }

    if (plantLabel === 'Sandy' && lineLabel === 'Line 40') {
      setSelectedLine('Line 4');
      setSelectedAsset('Sterile Packaging Press');
      setSelectedHierarchy({ groupId: 'assets', item: 'Sandy - Line 4 Sterile Press' });
      return;
    }

    setSelectedLine('All Lines');
    setSelectedAsset('All Assets');
    setSelectedHierarchy({ groupId: 'assets', item: detailLabel });
  };

  const toggleFavoriteDocumentHierarchy = (nodeId: string) => {
    setFavoriteDocumentHierarchyIds((current) => (
      current.includes(nodeId)
        ? current.filter((favoriteId) => favoriteId !== nodeId)
        : [...current, nodeId]
    ));
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const handleRepositoryItemSelect = (item: UnifiedItem) => {
    setSelectedIds([item.id]);
    setIsDetailsOpen(true);
    if (item.isFolder) {
      setActiveFolderId(item.id);
    }
  };

  const toggleStar = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setData(prev => prev.map(d => d.id === id ? { ...d, starred: !d.starred } : d));
  };
  const showSnackbar = (message: string, severity: 'success' | 'info' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleBulkAction = (action: string) => {
    showSnackbar(`${selectedIds.length} items ${action} successfully.`, 'success');
    if (action === 'deleted') {
      setData(prev => prev.filter(d => !selectedIds.includes(d.id)));
      setSelectedIds([]);
    }
  };

  const handleFinishSigning = () => {
    if (!itemBeingSigned) return;
    
    setData(prev => prev.map(doc => 
      doc.id === itemBeingSigned.id 
        ? { ...doc, status: 'e-Signed', isInInbox: false, lifecycle: 'Approved' } 
        : doc
    ));
    setIsSigningSimulationOpen(false);
    setItemBeingSigned(null);
    setHasUserSigned(false);
    showSnackbar(`Document "${itemBeingSigned.name}" signed and approved.`, 'success');
  };

  const handleMockUpload = () => {
    if (!selectedMockFile) return;
    setIsUploading(true);
    setUploadProgress(0);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 25) + 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setTimeout(() => {
          const newDoc: UnifiedItem = {
            id: Date.now(),
            isFolder: false,
            name: selectedMockFile.name,
            type: selectedMockFile.docType,
            modified: 'Just now',
            modifiedBy: 'You',
            owner: 'You',
            approver: 'Pending',
            reviewDate: 'TBD',
            frequency: '12',
            starred: false,
            status: 'Validated',
            lifecycle: 'Draft',
            version: 'v1',
            isCheckedOut: false,
          };
          
          setData(prev => [newDoc, ...prev]);
          setIsUploading(false);
          setIsExplorerOpen(false);
          setUploadProgress(0);
          // setSelectedMockFile(null); // Keep it to show name in result
          setIsAnalysisResultOpen(true);
          showSnackbar(`Analysis of "${selectedMockFile.name}" completed!`, 'success');
        }, 800);
      }
      setUploadProgress(progress);
    }, 450);
  };

  const inboxCount = data.filter(d => d.isInInbox).length;
  const inboxNewCount = data.filter((d) => {
    if (!d.isInInbox || d.isFolder || !d.inboxUpdatedAt) return false;
    const updatedAt = Date.parse(d.inboxUpdatedAt);
    if (!Number.isFinite(updatedAt)) return false;
    const isRecent = Date.now() - updatedAt <= 1000 * 60 * 60 * 48;
    const normalized = (d.status || '').toLowerCase();
    const isOpenFlow = normalized.includes('waiting') || normalized.includes('revision');
    return isRecent && isOpenFlow;
  }).length;
  const favoritesCount = data.filter((d) => d.starred).length;
  const recentCount = data.filter((d) => !d.isFolder).length;
  const sharedCount = data.filter((d) => d.sharedWithTeam).length;
  const waitingApprovalCount = data.filter((d) => (d.status || '').toLowerCase().includes('waiting for approval')).length;
  const waitingEsignCount = data.filter((d) => (d.status || '').toLowerCase().includes('waiting for e-signature')).length;
  const underRevisionCount = data.filter((d) => (d.status || '').toLowerCase().includes('under revision')).length;
  const inReviewLifecycleCount = data.filter((d) => d.lifecycle === 'In Review').length;
  const inboxFocusCards = [
    { label: 'Approvals', value: waitingApprovalCount || 35, tone: tokenWarning.main, bg: '#fff7ed' },
    { label: 'E-Signatures', value: waitingEsignCount, tone: '#b91c1c', bg: '#fef2f2' },
    { label: 'Under Revision', value: underRevisionCount, tone: tokenBrand.main, bg: '#eff6ff' },
    { label: 'In Review', value: inReviewLifecycleCount, tone: tokenSuccess.darker, bg: '#ecfdf5' },
  ] as const;
  const aiInsightHeadline = `${waitingApprovalCount || 35} waiting approval, ${waitingEsignCount} waiting e-signature, and ${underRevisionCount} under revision.`;
  const aiInsightAction = waitingApprovalCount > 0
    ? 'Focus first on approvals with the oldest review date and route e-signature blockers in parallel.'
    : 'Approval flow is stable; prioritize revision cleanup and metadata quality checks.';
  const isInboxView = selectedWorkspace === 'Inbox';
  const isRepositoryView = selectedWorkspace === 'Documents';
  const isWorkflowPlannerView = selectedWorkspace === 'WorkflowPlanner';
  const hasSelection = selectedIds.length > 0;
  const activeFolder = activeFolderId ? data.find((d) => d.id === activeFolderId && d.isFolder) : null;
  const activeFolderChain = React.useMemo(() => buildFolderChain(data, activeFolderId), [data, activeFolderId]);
  const selectedRecord = data.find((d) => d.id === selectedIds[selectedIds.length - 1]) ?? null;
  const selectedFile = selectedRecord && !selectedRecord.isFolder ? selectedRecord : null;
  const currentWorkspaceLabel = workspaceLabels[selectedWorkspace];
  const attentionDocuments = data
    .filter((item) => !item.isFolder && ['waiting for approval', 'waiting for e-signature', 'under revision'].some((status) => (item.status || '').toLowerCase().includes(status)))
    .slice(0, 4);
  const workflowRecommendations = [
    'Route aging approvals to QA and line owners in parallel to cut queue time.',
    'Clear pending e-signatures before launching new revision rounds.',
    'Use Workflow Planner to template recurring SOP and maintenance reviews.',
  ];
  const suggestedNextActions = [
    `${waitingApprovalCount || 35} approvals need queue review today.`,
    `${waitingEsignCount} documents are blocked on e-signature.`,
    `${underRevisionCount} documents should be pushed back into active review.`,
  ];
  const inboxSectionCounts: Record<InboxSection, number> = {
    All: data.filter((item) => item.isInInbox && !item.isFolder).length,
    New: inboxNewCount,
    WaitingApproval: waitingApprovalCount,
    WaitingESignature: waitingEsignCount,
    UnderRevision: underRevisionCount,
    InReview: inReviewLifecycleCount,
    Completed: data.filter((item) => !item.isFolder && ['approved', 'e-signed'].some((status) => (item.status || '').toLowerCase().includes(status))).length,
    Archived: data.filter((item) => !item.isFolder && ((item.lifecycle || '').toLowerCase().includes('archived') || (item.status || '').toLowerCase().includes('canceled'))).length,
  };
  const inboxSections: Array<{ key: InboxSection; icon: React.ReactNode; tone?: string }> = [
    { key: 'All', icon: <InboxIcon sx={{ fontSize: 18 }} /> },
    { key: 'New', icon: <MailOutlineIcon sx={{ fontSize: 18 }} />, tone: tokenBrand.main },
    { key: 'WaitingApproval', icon: <FactCheckIcon sx={{ fontSize: 18 }} />, tone: tokenWarning.dark },
    { key: 'WaitingESignature', icon: <DrawIcon sx={{ fontSize: 18 }} />, tone: '#b91c1c' },
    { key: 'UnderRevision', icon: <EditIcon sx={{ fontSize: 18 }} />, tone: tokenBrand.main },
    { key: 'InReview', icon: <AssignmentTurnedInIcon sx={{ fontSize: 18 }} />, tone: tokenSuccess.darker },
    { key: 'Completed', icon: <CheckCircleIcon sx={{ fontSize: 18 }} />, tone: tokenSuccess.darker },
    { key: 'Archived', icon: <HistoryOutlinedIcon sx={{ fontSize: 18 }} />, tone: tokenText.secondary },
  ];
  const getDepartmentLabel = useCallback((item: UnifiedItem) => {
    if ((item.name || '').toLowerCase().includes('maintenance')) return 'Maintenance';
    if (item.qualityCategory === 'NC' || (item.name || '').toLowerCase().includes('quality')) return 'Quality';
    if (item.qualityCategory === 'Work Instructions') return 'Production';
    if ((item.name || '').toLowerCase().includes('validation')) return 'Engineering';
    if ((item.name || '').toLowerCase().includes('training')) return 'HR';
    return item.businessLine === 'Formulation' ? 'Engineering' : 'Production';
  }, []);
  const getDocumentTypeLabel = useCallback((item: UnifiedItem) => item.qualityCategory || item.type, []);
  const getOriginLabel = useCallback((item: UnifiedItem) => {
    if (item.sharedWithTeam) return 'Shared';
    if (item.isInInbox) return 'Document Management';
    if ((item.name || '').toLowerCase().includes('uploaded')) return 'Uploaded';
    if (item.businessLine === 'Formulation') return 'MES';
    return 'Smart Search';
  }, []);
  const getFileFormatLabel = useCallback((item: UnifiedItem) => {
    const extension = item.name.split('.').pop()?.toUpperCase();
    return extension && extension !== item.name.toUpperCase() ? extension : item.type.toUpperCase();
  }, []);
  const getTagList = useCallback((item: UnifiedItem) => {
    return Array.from(new Set([
      item.lifecycle,
      item.status,
      item.qualityCategory,
      item.line,
      item.asset,
      item.activeWorkflow,
    ].filter(Boolean) as string[]));
  }, []);
  const matchesModifiedDateFilter = useCallback((item: UnifiedItem) => {
    if (selectedModifiedDateFilter === 'Any Time') return true;
    const modified = item.modified.toLowerCase();
    if (selectedModifiedDateFilter === 'Last 24h') return modified.includes('minute') || modified.includes('hour') || modified.includes('today');
    if (selectedModifiedDateFilter === 'Last 7 Days') return modified.includes('day') || modified.includes('hour') || modified.includes('minute') || modified.includes('today');
    if (selectedModifiedDateFilter === 'Last 30 Days') return !modified.includes('week') || modified.includes('1 week') || modified.includes('2 week') || modified.includes('day');
    return true;
  }, [selectedModifiedDateFilter]);
  const matchesReviewDateFilter = useCallback((item: UnifiedItem) => {
    if (selectedReviewDateFilter === 'All Review Dates' || item.isFolder || !item.reviewDate || item.reviewDate === '-') return true;
    const reviewDate = new Date(item.reviewDate);
    if (Number.isNaN(reviewDate.getTime())) return selectedReviewDateFilter === 'Unscheduled';
    const now = new Date();
    const diffDays = (reviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (selectedReviewDateFilter === 'Overdue') return diffDays < 0;
    if (selectedReviewDateFilter === 'Next 30 Days') return diffDays >= 0 && diffDays <= 30;
    if (selectedReviewDateFilter === 'This Quarter') return diffDays >= 0 && diffDays <= 90;
    if (selectedReviewDateFilter === 'Unscheduled') return item.reviewDate === '-';
    return true;
  }, [selectedReviewDateFilter]);
  const getContainedItemCount = useCallback((folderId: number) => data.filter((child) => child.parentFolderId === folderId).length, [data]);
  const getRepositoryPathLabel = useCallback((item: UnifiedItem) => {
    const chain = buildFolderChain(data, item.isFolder ? item.id : item.parentFolderId ?? null);
    return chain.length ? chain.map((folder) => folder.name).join(' / ') : 'Repository root';
  }, [data]);
  const getRepositoryContextLabel = useCallback((item: UnifiedItem) => {
    return [item.site, item.line, item.asset].filter(Boolean).join(' / ') || selectedSite.name;
  }, [selectedSite.name]);
  const docTypeOptions = React.useMemo(
    () => ['All Types', ...Array.from(new Set(data.filter((item) => !item.isFolder).map((item) => getDocumentTypeLabel(item)))).sort()],
    [data, getDocumentTypeLabel],
  );
  const departmentOptions = React.useMemo(
    () => ['All Departments', ...Array.from(new Set(data.filter((item) => !item.isFolder).map((item) => getDepartmentLabel(item)))).sort()],
    [data, getDepartmentLabel],
  );
  const originOptions = React.useMemo(
    () => ['All Origins', ...Array.from(new Set(data.filter((item) => !item.isFolder).map((item) => getOriginLabel(item)))).sort()],
    [data, getOriginLabel],
  );
  const ownerOptions = React.useMemo(
    () => ['All Owners', ...Array.from(new Set(data.map((item) => item.owner).filter(Boolean))).sort()],
    [data],
  );
  const approverOptions = React.useMemo(
    () => ['All Approvers', ...Array.from(new Set(data.map((item) => item.approver).filter(Boolean))).sort()],
    [data],
  );
  const lineOptions = React.useMemo(
    () => ['All Lines', ...Array.from(new Set(data.map((item) => item.line).filter(Boolean))).sort()],
    [data],
  );
  const tagOptions = React.useMemo(
    () => ['All Tags', ...Array.from(new Set(data.flatMap((item) => getTagList(item)))).sort()],
    [data, getTagList],
  );
  const fileFormatOptions = React.useMemo(
    () => ['All Formats', ...Array.from(new Set(data.filter((item) => !item.isFolder).map((item) => getFileFormatLabel(item)))).sort()],
    [data, getFileFormatLabel],
  );
  const modifiedDateOptions = ['Any Time', 'Last 24h', 'Last 7 Days', 'Last 30 Days'];
  const reviewDateOptions = ['All Review Dates', 'Overdue', 'Next 30 Days', 'This Quarter', 'Unscheduled'];
  const lifecycleOptions: Array<'All Lifecycles' | LifecycleState> = ['All Lifecycles', 'Draft', 'In Review', 'Approved', 'Published', 'Archived', 'Obsolete'];
  const matchesHierarchyContext = (item: UnifiedItem) => {
    if (selectedHierarchy.groupId === 'assets') {
      const lineOk = selectedLine === 'All Lines' || item.line === selectedLine;
      const assetOk = selectedAsset === 'All Assets' || item.asset === selectedAsset;
      return lineOk && assetOk;
    }
    if (selectedHierarchy.groupId === 'businessLine') return item.businessLine === selectedHierarchy.item;
    if (selectedHierarchy.groupId === 'productPlatform') return item.productPlatform === selectedHierarchy.item;
    if (selectedHierarchy.groupId === 'quality') return item.qualityCategory === selectedHierarchy.item;
    if (selectedHierarchy.groupId === 'folders') return item.name.toLowerCase().includes(selectedHierarchy.item.toLowerCase());
    return true;
  };
  const filesCount = data.filter((d) => matchesHierarchyContext(d)).length;
  const matchesRepositoryFilters = (item: UnifiedItem) => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const searchable = [
      item.name,
      item.type,
      item.status,
      item.lifecycle,
      item.owner,
      item.approver,
      item.site,
      item.line,
      item.asset,
      item.qualityCategory,
    ].filter(Boolean).join(' ').toLowerCase();
    const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
    const matchesDepartment = selectedDepartmentFilter === 'All Departments' || item.isFolder || getDepartmentLabel(item) === selectedDepartmentFilter;
    const matchesLine = selectedLine === 'All Lines' || item.line === selectedLine;
    const matchesAsset = selectedAsset === 'All Assets' || item.asset === selectedAsset;
    const matchesDocType = selectedDocTypeFilter === 'All Types' || item.isFolder || getDocumentTypeLabel(item) === selectedDocTypeFilter;
    const matchesOrigin = selectedOriginFilter === 'All Origins' || item.isFolder || getOriginLabel(item) === selectedOriginFilter;
    const matchesLifecycle = selectedLifecycleFilter === 'All Lifecycles' || item.isFolder || item.lifecycle === selectedLifecycleFilter;
    const matchesOwner = selectedOwnerFilter === 'All Owners' || item.owner === selectedOwnerFilter;
    const matchesApprover = selectedApproverFilter === 'All Approvers' || item.approver === selectedApproverFilter;
    const matchesTag = selectedTagFilter === 'All Tags' || item.isFolder || getTagList(item).includes(selectedTagFilter);
    const matchesFormat = selectedFileFormatFilter === 'All Formats' || item.isFolder || getFileFormatLabel(item) === selectedFileFormatFilter;

    return matchesSearch
      && matchesDepartment
      && matchesLine
      && matchesAsset
      && matchesDocType
      && matchesOrigin
      && matchesLifecycle
      && matchesOwner
      && matchesApprover
      && matchesTag
      && matchesFormat
      && matchesModifiedDateFilter(item)
      && matchesReviewDateFilter(item);
  };
  const filteredData = data.filter((d) => {
    if (!matchesHierarchyContext(d)) return false;
    if (isInboxView) {
      if (!d.isInInbox || d.isFolder || !matchesRepositoryFilters(d)) return false;
      const normalizedStatus = (d.status || '').toLowerCase();
      const normalizedLifecycle = (d.lifecycle || '').toLowerCase();
      if (selectedInboxSection === 'All') return true;
      if (selectedInboxSection === 'New') {
        return !!d.inboxUpdatedAt
          && Number.isFinite(Date.parse(d.inboxUpdatedAt))
          && Date.now() - Date.parse(d.inboxUpdatedAt) <= 1000 * 60 * 60 * 48;
      }
      if (selectedInboxSection === 'WaitingApproval') return normalizedStatus.includes('waiting for approval');
      if (selectedInboxSection === 'WaitingESignature') return normalizedStatus.includes('waiting for e-signature');
      if (selectedInboxSection === 'UnderRevision') return normalizedStatus.includes('under revision');
      if (selectedInboxSection === 'InReview') return normalizedLifecycle.includes('in review');
      if (selectedInboxSection === 'Completed') return normalizedStatus.includes('approved') || normalizedStatus.includes('e-signed');
      if (selectedInboxSection === 'Archived') return normalizedLifecycle.includes('archived') || normalizedStatus.includes('canceled');
      return true;
    }
    if (!matchesRepositoryFilters(d)) return false;
    if (activeFolderId !== null) return d.parentFolderId === activeFolderId;
    if (selectedRepositorySection === 'AllDocuments') return d.isFolder ? !d.parentFolderId : true;
    if (selectedRepositorySection === 'Favorites') return d.starred;
    if (selectedRepositorySection === 'Recent') return !d.isFolder;
    if (selectedRepositorySection === 'Shared') return !d.isFolder && d.sharedWithTeam;
    return d.isFolder && !d.parentFolderId;
  });
  const getInboxStatusRank = (status?: string) => {
    const normalized = (status || '').toLowerCase();
    if (normalized.includes('waiting')) return 0;
    if (normalized.includes('revision')) return 1;
    if (normalized.includes('approved') || normalized.includes('e-signed')) return 2;
    if (normalized.includes('canceled') || normalized.includes('cancelled')) return 3;
    return 4;
  };
  const sortedData = [...filteredData].sort((a, b) => {
    if (isInboxView) {
      const statusDelta = getInboxStatusRank(a.status) - getInboxStatusRank(b.status);
      if (statusDelta !== 0) return statusDelta;
      const aTime = a.inboxUpdatedAt ? Date.parse(a.inboxUpdatedAt) : 0;
      const bTime = b.inboxUpdatedAt ? Date.parse(b.inboxUpdatedAt) : 0;
      return bTime - aTime;
    }
    if (a.isFolder !== b.isFolder) {
      return a.isFolder ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
  const repositoryFolders = sortedData.filter((item) => item.isFolder);
  const repositoryDocuments = sortedData.filter((item) => !item.isFolder);

  const buildInitialDraft = (file: UnifiedItem) => `# ${file.name}

Document Type: ${file.type}
Owner: ${file.owner}
Approver: ${file.approver}

1. Purpose
Define scope and objective for this document.

2. Current Notes
- Add operational updates here.
- Add compliance considerations here.

3. Action Items
- [ ] Confirm reviewer assignment
- [ ] Validate approval workflow
- [ ] Publish updated revision
`;

  const openFileWithAssistant = (file: UnifiedItem) => {
    setSelectedIds([file.id]);
    setIsDetailsOpen(false);
    setDocumentDrafts((prev) => (prev[file.id] ? prev : { ...prev, [file.id]: buildInitialDraft(file) }));
    onOpenMainAiForDocument?.(file.name);
  };
  const openArtifact = (file: UnifiedItem) => {
    if (file.isFolder) return;
    onOpenArtifactClick?.({
      id: file.id,
      name: file.name,
      type: file.type,
      status: file.status,
      version: file.version,
      owner: file.owner,
      approver: file.approver,
      modified: file.modified,
      modifiedBy: file.modifiedBy,
      reviewDate: file.reviewDate,
      site: file.site,
      line: file.line,
      asset: file.asset,
    });
  };

  const openFolder = (folder: UnifiedItem) => {
    if (!folder.isFolder) return;
    setActiveFolderId(folder.id);
    setSelectedIds([folder.id]);
  };

  const startWorkflowInMainAi = () => {
    const selectedDocs = data.filter((d) => selectedIds.includes(d.id) && !d.isFolder);
    const context = selectedDocs.length === 1
      ? `Start approval workflow for ${selectedDocs[0].name}`
      : `Start approval workflow for ${selectedDocs.length} selected documents`;
    onStartWorkflowWithAi?.(context);
  };

  const openAiSummaryDialog = async () => {
    setIsAiSummaryOpen(true);
    setIsAiSummaryLoading(true);
    const selectedDocs = data.filter((d) => selectedIds.includes(d.id) && !d.isFolder);
    const summaryPayload = selectedDocs.length
      ? {
          summary: `${selectedDocs.length} selected document(s) analyzed for ${selectedSite.name} ${selectedLine !== 'All Lines' ? `- ${selectedLine}` : ''}.`,
          risks: aiResponse.risks,
          changes: aiResponse.changes,
        }
      : aiResponse;
    const response = await fakeApi(summaryPayload);
    setAiSummaryData(response);
    setIsAiSummaryLoading(false);
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: workstationVisuals.pageBackground, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ===== TOP AREA ===== */}
      <Box sx={{ px: 3, py: 1.5, bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={onBack} size="small" sx={{ bgcolor: 'rgba(0,0,0,0.03)', '&:hover': { bgcolor: 'rgba(0,0,0,0.07)' } }}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h5" sx={{ color: SF_COLORS.deepBlue, fontWeight: 800, lineHeight: 1.2 }}>
                Document Management
              </Typography>
              <Typography variant="body2" sx={{ color: SF_COLORS.gray90, fontWeight: 500, mt: 0.5 }}>
                Enterprise Knowledge Repository & Lifecycle Hub
              </Typography>
            </Box>
          </Box>
        </Box>

        <Paper
          elevation={0}
          sx={{
            mt: 1.5,
            p: 1.5,
            borderRadius: 3,
            bgcolor: tokenNeutral.lightest,
            border: `1px solid ${tokenDivider}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
              <SparkleIcon sx={{ fontSize: 16, color: tokenWarning.dark }} />
              <Typography sx={{ color: tokenBrand.main, fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.1 }}>
                BLU.AI analysis
              </Typography>
              <Typography variant="body2" sx={{ color: tokenText.secondary }}>
                {aiInsightHeadline}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip size="small" label={`Approvals ${waitingApprovalCount || 35}`} sx={{ bgcolor: tokenCommon.white, color: tokenWarning.dark, fontWeight: 800, border: `1px solid ${tokenDivider}` }} />
              <Chip size="small" label={`E-Signature ${waitingEsignCount}`} sx={{ bgcolor: tokenCommon.white, color: '#b91c1c', fontWeight: 800, border: `1px solid ${tokenDivider}` }} />
              <Chip size="small" label={`In Review ${inReviewLifecycleCount}`} sx={{ bgcolor: tokenCommon.white, color: tokenBrand.main, fontWeight: 800, border: `1px solid ${tokenDivider}` }} />
              <Button
                size="small"
                variant="text"
                startIcon={<SparkleIcon />}
                onClick={() => setIsAiInsightsPanelOpen((current) => !current)}
                sx={{ textTransform: 'none', fontWeight: 800 }}
              >
                {isAiInsightsPanelOpen ? 'Hide AI Insights' : 'Open AI Insights'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      <PlannerAiCopilotDrawer
        open={isAiInsightsPanelOpen}
        onClose={() => setIsAiInsightsPanelOpen(false)}
        title="BLU.AI insights"
        subtitle={`Live DMS guidance for ${currentWorkspaceLabel.toLowerCase()} in ${selectedSite.name}.`}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, border: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest }}>
            <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 800, letterSpacing: '0.05em' }}>
              APPROVAL SUMMARY
            </Typography>
            <Box sx={{ mt: 1, display: 'grid', gap: 1 }}>
              {inboxFocusCards.map((card) => (
                <Box key={card.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, p: 1, borderRadius: 2, bgcolor: tokenCommon.white, border: `1px solid ${tokenDivider}` }}>
                  <Typography variant="body2" sx={{ color: tokenText.primary, fontWeight: 700 }}>{card.label}</Typography>
                  <Typography sx={{ color: card.tone, fontWeight: 800 }}>{card.value}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, border: `1px solid ${tokenDivider}`, bgcolor: tokenCommon.white }}>
            <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 800, letterSpacing: '0.05em' }}>
              E-SIGNATURE BLOCKERS
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: tokenText.secondary }}>
              {waitingEsignCount > 0 ? `${waitingEsignCount} documents are waiting on signature completion before they can advance.` : 'No active e-signature blockers right now.'}
            </Typography>
          </Paper>

          <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, border: `1px solid ${tokenDivider}`, bgcolor: tokenCommon.white }}>
            <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 800, letterSpacing: '0.05em' }}>
              DOCUMENTS REQUIRING ATTENTION
            </Typography>
            <Box sx={{ mt: 1, display: 'grid', gap: 1 }}>
              {attentionDocuments.map((item) => (
                <Box key={`attention-${item.id}`} sx={{ p: 1, borderRadius: 2, bgcolor: tokenNeutral.lightest }}>
                  <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.85rem' }}>{item.name}</Typography>
                  <Typography variant="caption" sx={{ color: tokenText.secondary }}>
                    {item.status} • {item.owner} • {item.workflowStep ?? 'No active step'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, border: `1px solid ${tokenDivider}`, bgcolor: tokenCommon.white }}>
            <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 800, letterSpacing: '0.05em' }}>
              SUGGESTED NEXT ACTIONS
            </Typography>
            <Box sx={{ mt: 1, display: 'grid', gap: 0.9 }}>
              {suggestedNextActions.map((item) => (
                <Box key={item} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <LightbulbIcon sx={{ fontSize: 16, color: tokenBrand.main, mt: 0.1 }} />
                  <Typography variant="body2" sx={{ color: tokenText.secondary }}>{item}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, border: `1px solid ${tokenDivider}`, bgcolor: tokenCommon.white }}>
            <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 800, letterSpacing: '0.05em' }}>
              WORKFLOW RECOMMENDATIONS
            </Typography>
            <Box sx={{ mt: 1, display: 'grid', gap: 0.9 }}>
              {workflowRecommendations.map((item) => (
                <Box key={item} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <AltRouteIcon sx={{ fontSize: 16, color: tokenWarning.dark, mt: 0.1 }} />
                  <Typography variant="body2" sx={{ color: tokenText.secondary }}>{item}</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button size="small" variant="text" startIcon={<SparkleIcon />} onClick={() => onAIHubClick ? onAIHubClick() : showSnackbar('AI hub opened', 'info')} sx={{ textTransform: 'none', fontWeight: 800 }}>
                Open AI Hub
              </Button>
            </Box>
          </Paper>
        </Box>
      </PlannerAiCopilotDrawer>

      <Dialog
        open={isSiteMapOpen}
        onClose={() => setIsSiteMapOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: '#ffffff',
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #DBDDDF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ color: SF_COLORS.blue, fontWeight: 800, letterSpacing: '0.08em' }}>
              SITE MAP
            </Typography>
            <Typography variant="h6" sx={{ color: SF_COLORS.deepBlue, fontWeight: 800 }}>
              Select document context by location
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant={selectedSite.id === 'global' ? 'contained' : 'outlined'}
              startIcon={<PublicIcon />}
              onClick={() => handleSiteSelect('global')}
              sx={{
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 800,
                bgcolor: selectedSite.id === 'global' ? SF_COLORS.blue : '#ffffff',
                color: selectedSite.id === 'global' ? 'white' : SF_COLORS.blue,
                borderColor: `${SF_COLORS.lightBlue}66`,
                '&:hover': { bgcolor: selectedSite.id === 'global' ? SF_COLORS.brightBlue : '#EBEDF0' },
              }}
            >
              Global View
            </Button>
            <IconButton size="small" onClick={() => setIsSiteMapOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ p: 2.5 }}>
          <Box sx={{ position: 'relative', height: 420, borderRadius: 3, border: `1px solid ${SF_COLORS.gray30}`, overflow: 'hidden', bgcolor: SF_COLORS.darkBlue }}>
            <Box
              component="img"
              src="/images/world-map.png"
              alt="Global map"
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'saturate(1.05) contrast(1.02)',
              }}
            />
            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.05) 0%, rgba(15,23,42,0.2) 100%)' }} />

            {siteOptions.filter((site) => site.id !== 'global').map((site) => {
              const isActive = selectedSiteId === site.id;
              return (
                <Box
                  key={site.id}
                  sx={{
                    position: 'absolute',
                    left: `${site.mapX}%`,
                    top: `${site.mapY}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <IconButton
                    onClick={() => handleSiteSelect(site.id)}
                    sx={{
                      width: 34,
                      height: 34,
                      bgcolor: isActive ? SF_COLORS.blue : '#ffffff',
                      color: isActive ? 'white' : SF_COLORS.blue,
                      border: `1px solid ${isActive ? SF_COLORS.blue : `${SF_COLORS.lightBlue}66`}`,
                      boxShadow: '0 10px 24px rgba(15,23,42,0.25)',
                      '&:hover': { bgcolor: isActive ? SF_COLORS.brightBlue : '#EBEDF0' },
                    }}
                  >
                    <PlaceIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                  <Paper
                    elevation={0}
                    sx={{
                      mt: 0.55,
                      px: 0.8,
                      py: 0.35,
                      borderRadius: 99,
                      bgcolor: isActive ? SF_COLORS.brightBlue : 'rgba(255,255,255,0.95)',
                      border: `1px solid ${isActive ? SF_COLORS.blue : `${SF_COLORS.lightBlue}66`}`,
                    }}
                  >
                    <Typography sx={{ fontSize: '0.66rem', fontWeight: 800, color: isActive ? 'white' : SF_COLORS.blue, lineHeight: 1.1 }}>
                      {site.name}
                    </Typography>
                  </Paper>
                </Box>
              );
            })}
          </Box>

          <Grid container spacing={1.5} sx={{ mt: 2 }}>
            {siteOptions.map((site) => (
              <Grid key={`site-option-${site.id}`} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper
                  elevation={0}
                  onClick={() => handleSiteSelect(site.id)}
                  sx={{
                    p: 1.25,
                    borderRadius: 2.5,
                    cursor: 'pointer',
                    border: `1px solid ${selectedSiteId === site.id ? SF_COLORS.lightBlue : '#DBDDDF'}`,
                    bgcolor: selectedSiteId === site.id ? '#EBEDF0' : '#ffffff',
                    '&:hover': { borderColor: `${SF_COLORS.lightBlue}99`, bgcolor: '#FFFFFF' },
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: SF_COLORS.deepBlue, fontWeight: 800 }}>
                    {site.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: SF_COLORS.gray90 }}>
                    {site.subtitle} â€¢ {site.country}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Dialog>

      {/* ===== MAIN CONTENT ===== */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden', pr: { lg: isAiInsightsPanelOpen ? '420px' : 0 }, transition: 'padding-right 180ms ease' }}>
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ px: 3, py: 1, bgcolor: tokenCommon.white, borderBottom: `1px solid ${tokenDivider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
              {[
                { key: 'Inbox', label: 'Inbox', icon: <InboxIcon sx={{ fontSize: 18 }} />, count: inboxNewCount || inboxCount },
                { key: 'Documents', label: 'Documents', icon: <ManageSearchIcon sx={{ fontSize: 18 }} />, count: filesCount },
                { key: 'WorkflowPlanner', label: 'Workflow Planner', icon: <WorkflowIcon sx={{ fontSize: 18 }} />, count: waitingApprovalCount + waitingEsignCount },
              ].map((tab) => {
                const isActive = selectedWorkspace === tab.key;
                return (
                  <Button
                    key={tab.key}
                    size="small"
                    startIcon={tab.icon}
                    onClick={() => handleSelectWorkspace(tab.key as DmsWorkspace)}
                    sx={{
                      minHeight: 34,
                      px: 1.35,
                      borderRadius: 999,
                      textTransform: 'none',
                      fontWeight: 800,
                      color: isActive ? tokenBrand.main : tokenText.secondary,
                      bgcolor: isActive ? tokenBrand.softBg : 'transparent',
                      border: `1px solid ${isActive ? tokenBrand.selectedBg : 'transparent'}`,
                      '&:hover': { bgcolor: isActive ? tokenBrand.softBg : workstationVisuals.slateSurface },
                    }}
                  >
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.85 }}>
                      <span>{tab.label}</span>
                      <Box sx={{ minWidth: 18, height: 18, px: 0.65, borderRadius: 999, bgcolor: isActive ? tokenCommon.white : workstationVisuals.slateSurface, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800 }}>
                        {tab.count}
                      </Box>
                    </Box>
                  </Button>
                );
              })}
            </Box>
          </Box>
          
          {/* ===== ACTION BAR ===== */}
          <Box sx={{ px: 3, py: 1.25, bgcolor: tokenCommon.white, borderBottom: `1px solid ${tokenDivider}` }}>
            {isInboxView ? (
              <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center', flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ color: tokenText.primary, fontWeight: 800 }}>
                    Inbox Work Queue
                  </Typography>
                  <Typography variant="caption" sx={{ color: tokenText.secondary }}>
                    Review pending approvals, e-signatures, revision items, and completed workflow records.
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <TextField
                  placeholder="Search workflow queue..."
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ width: 260, '& .MuiInputBase-root': { bgcolor: workstationVisuals.slateSurface, borderRadius: 2 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button size="small" variant="text" startIcon={<SparkleIcon />} onClick={() => setIsAiInsightsPanelOpen((current) => !current)} sx={{ fontWeight: 800, textTransform: 'none' }}>
                  {isAiInsightsPanelOpen ? 'Hide AI Insights' : 'Show AI Insights'}
                </Button>
              </Box>
            ) : isRepositoryView ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: tokenText.primary, fontWeight: 800 }}>
                      Document Repository Workspace
                    </Typography>
                    <Typography variant="caption" sx={{ color: tokenText.secondary }}>
                      Search, browse, upload, create, and organize documents without leaving the repository workspace.
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, p: 0.4, borderRadius: 999, border: `1px solid ${tokenDivider}`, bgcolor: workstationVisuals.slateSurface }}>
                    <Button
                      size="small"
                      startIcon={<ViewAgendaIcon />}
                      onClick={() => setSearchViewMode('list')}
                      sx={{
                        minWidth: 0,
                        textTransform: 'none',
                        borderRadius: 999,
                        px: 1.1,
                        color: searchViewMode === 'list' ? tokenBrand.main : tokenText.secondary,
                        bgcolor: searchViewMode === 'list' ? tokenCommon.white : 'transparent',
                      }}
                    >
                      List
                    </Button>
                    <Button
                      size="small"
                      startIcon={<GridViewIcon />}
                      onClick={() => setSearchViewMode('card')}
                      sx={{
                        minWidth: 0,
                        textTransform: 'none',
                        borderRadius: 999,
                        px: 1.1,
                        color: searchViewMode === 'card' ? tokenBrand.main : tokenText.secondary,
                        bgcolor: searchViewMode === 'card' ? tokenCommon.white : 'transparent',
                      }}
                    >
                      Card
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                  {[
                    { key: 'AllDocuments', label: 'All Documents', icon: <ManageSearchIcon sx={{ fontSize: 16 }} />, count: filesCount },
                    { key: 'Favorites', label: 'Favorites', icon: <StarIcon sx={{ fontSize: 16 }} />, count: favoritesCount },
                    { key: 'Recent', label: 'Recent', icon: <HistoryIcon sx={{ fontSize: 16 }} />, count: recentCount },
                    { key: 'Shared', label: 'Shared', icon: <ShareIcon sx={{ fontSize: 16 }} />, count: sharedCount },
                  ].map((tab) => {
                    const isActive = selectedRepositorySection === tab.key;
                    return (
                      <Button
                        key={tab.key}
                        size="small"
                        startIcon={tab.icon}
                        onClick={() => handleSelectRepositorySection(tab.key as RepositorySection)}
                        sx={{
                          minHeight: 34,
                          px: 1.35,
                          borderRadius: 999,
                          textTransform: 'none',
                          fontWeight: 800,
                          color: isActive ? tokenBrand.main : tokenText.secondary,
                          bgcolor: isActive ? tokenBrand.softBg : 'transparent',
                          border: `1px solid ${isActive ? tokenBrand.selectedBg : 'transparent'}`,
                        }}
                      >
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.85 }}>
                          <span>{tab.label}</span>
                          <Box sx={{ minWidth: 18, height: 18, px: 0.65, borderRadius: 999, bgcolor: isActive ? tokenCommon.white : workstationVisuals.slateSurface, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800 }}>
                            {tab.count}
                          </Box>
                        </Box>
                      </Button>
                    );
                  })}
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateButtonClick}
                    sx={{ bgcolor: tokenBrand.main, fontWeight: 700, textTransform: 'none', borderRadius: 2, px: 2, boxShadow: 'none', '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' } }}
                  >
                    Create New
                  </Button>
                  <Menu
                    anchorEl={createMenuAnchor}
                    open={isCreateMenuOpen}
                    onClose={handleCreateMenuClose}
                    PaperProps={{
                      sx: {
                        mt: 1,
                        minWidth: 180,
                        borderRadius: 2,
                        boxShadow: 'none',
                        border: `1px solid ${tokenDivider}`,
                      }
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        handleCreateMenuClose();
                        setIsNewContentFolderDialogOpen(true);
                      }}
                      sx={{ py: 1.2, gap: 1.5 }}
                    >
                      <CreateNewFolderIcon sx={{ color: tokenWarning.main, fontSize: 20 }} />
                      <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Create Hierarchy Node</Typography>
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleCreateMenuClose();
                        if (onCreateNewFileClick) onCreateNewFileClick();
                      }}
                      sx={{ py: 1.2, gap: 1.5 }}
                    >
                      <DescriptionIcon sx={{ color: tokenBrand.main, fontSize: 20 }} />
                      <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Create Document</Typography>
                    </MenuItem>
                  </Menu>
                  <Button size="small" variant="contained" startIcon={<CloudUploadIcon />} onClick={() => setIsExplorerOpen(true)} sx={{ bgcolor: tokenBrand.main, boxShadow: 'none', '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' } }}>
                    Upload
                  </Button>
                  <Button
                    size="small"
                    variant={isEditMode ? 'contained' : 'text'}
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setIsEditMode(!isEditMode);
                      if (isEditMode) setSelectedIds([]);
                    }}
                    color={isEditMode ? 'primary' : 'inherit'}
                  >
                    {isEditMode ? 'Done' : 'Edit'}
                  </Button>
                  <Button size="small" variant="text" startIcon={<ArrowUpwardIcon />} disabled={!isEditMode || !hasSelection} onClick={() => handleBulkAction('moved')}>Move</Button>
                  <Button size="small" variant="text" startIcon={<DeleteIcon />} disabled={!isEditMode || !hasSelection} color="error" onClick={() => handleBulkAction('deleted')}>Delete</Button>
                  <TextField
                    placeholder="Search files, folders, owners, lines, workflows"
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ minWidth: 280, flexGrow: 1, '& .MuiInputBase-root': { bgcolor: workstationVisuals.slateSurface, borderRadius: 2 } }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormControl size="small" sx={{ minWidth: 170 }}>
                    <InputLabel>Department</InputLabel>
                    <Select value={selectedDepartmentFilter} label="Department" onChange={(e) => setSelectedDepartmentFilter(e.target.value)}>
                      {departmentOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Document Type</InputLabel>
                    <Select value={selectedDocTypeFilter} label="Document Type" onChange={(e) => setSelectedDocTypeFilter(e.target.value)}>
                      {docTypeOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>Origin</InputLabel>
                    <Select value={selectedOriginFilter} label="Origin" onChange={(e) => setSelectedOriginFilter(e.target.value)}>
                      {originOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Owner</InputLabel>
                    <Select value={selectedOwnerFilter} label="Owner" onChange={(e) => setSelectedOwnerFilter(e.target.value)}>
                      {ownerOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Lifecycle</InputLabel>
                    <Select value={selectedLifecycleFilter} label="Lifecycle" onChange={(e) => setSelectedLifecycleFilter(e.target.value)}>
                      {lifecycleOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Modified Date</InputLabel>
                    <Select value={selectedModifiedDateFilter} label="Modified Date" onChange={(e) => setSelectedModifiedDateFilter(e.target.value)}>
                      {modifiedDateOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Approver</InputLabel>
                    <Select value={selectedApproverFilter} label="Approver" onChange={(e) => setSelectedApproverFilter(e.target.value)}>
                      {approverOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Review Date</InputLabel>
                    <Select value={selectedReviewDateFilter} label="Review Date" onChange={(e) => setSelectedReviewDateFilter(e.target.value)}>
                      {reviewDateOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Line / Area</InputLabel>
                    <Select value={selectedLine} label="Line / Area" onChange={(e) => setSelectedLine(e.target.value)}>
                      {lineOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Tags</InputLabel>
                    <Select value={selectedTagFilter} label="Tags" onChange={(e) => setSelectedTagFilter(e.target.value)}>
                      {tagOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>File Format</InputLabel>
                    <Select value={selectedFileFormatFilter} label="File Format" onChange={(e) => setSelectedFileFormatFilter(e.target.value)}>
                      {fileFormatOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button size="small" variant="text" startIcon={<SparkleIcon />} onClick={() => setIsAiInsightsPanelOpen((current) => !current)} sx={{ fontWeight: 800, textTransform: 'none' }}>
                    {isAiInsightsPanelOpen ? 'Hide AI Insights' : 'Show AI Insights'}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ color: tokenText.primary, fontWeight: 800 }}>
                    Workflow Planner Workspace
                  </Typography>
                  <Typography variant="caption" sx={{ color: tokenText.secondary }}>
                    Planning, routing, and workflow optimization stay inside the DMS shell.
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Button size="small" variant="text" startIcon={<SparkleIcon />} onClick={() => setIsAiInsightsPanelOpen((current) => !current)} sx={{ fontWeight: 800, textTransform: 'none' }}>
                  {isAiInsightsPanelOpen ? 'Hide AI Insights' : 'Show AI Insights'}
                </Button>
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
            {!isWorkflowPlannerView ? (
              <Box sx={{ width: 272, minWidth: 272, borderRight: `1px solid ${tokenDivider}`, bgcolor: tokenCommon.white, overflowY: 'auto' }}>
                {isInboxView ? (
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 800, letterSpacing: '0.05em', px: 1 }}>
                      WORK QUEUE
                    </Typography>
                    <List sx={{ pt: 1 }}>
                      {inboxSections.map((section) => {
                        const isActive = selectedInboxSection === section.key;
                        return (
                          <ListItemButton
                            key={section.key}
                            selected={isActive}
                            onClick={() => handleSelectInboxSection(section.key)}
                            sx={{
                              mb: 0.35,
                              borderRadius: 2,
                              alignItems: 'center',
                              '&.Mui-selected': { bgcolor: tokenBrand.softBg },
                              '&.Mui-selected:hover': { bgcolor: tokenBrand.softBg },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 34, color: isActive ? tokenBrand.main : (section.tone ?? tokenText.secondary) }}>
                              {section.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={inboxSectionLabels[section.key]}
                              secondary={section.key === 'All' ? 'Entire work queue' : undefined}
                              primaryTypographyProps={{ fontWeight: isActive ? 800 : 700, color: isActive ? tokenBrand.main : tokenText.primary, fontSize: '0.88rem' }}
                              secondaryTypographyProps={{ color: tokenText.secondary, fontSize: '0.72rem' }}
                            />
                            <Chip
                              size="small"
                              label={inboxSectionCounts[section.key]}
                              sx={{ height: 20, bgcolor: isActive ? tokenCommon.white : workstationVisuals.slateSurface, fontWeight: 800 }}
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Box>
                ) : (
                  <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 800, letterSpacing: '0.05em', px: 1 }}>
                        REPOSITORY
                      </Typography>
                      <List sx={{ pt: 1 }}>
                        {[
                          { key: 'AllDocuments', label: 'All Documents', icon: <ManageSearchIcon sx={{ fontSize: 18 }} />, count: filesCount },
                          { key: 'Favorites', label: 'Favorites', icon: <StarIcon sx={{ fontSize: 18 }} />, count: favoritesCount },
                          { key: 'Recent', label: 'Recent', icon: <HistoryIcon sx={{ fontSize: 18 }} />, count: recentCount },
                          { key: 'Shared', label: 'Shared', icon: <ShareIcon sx={{ fontSize: 18 }} />, count: sharedCount },
                        ].map((section) => {
                          const isActive = selectedRepositorySection === section.key;
                          return (
                            <ListItemButton
                              key={section.key}
                              selected={isActive}
                              onClick={() => handleSelectRepositorySection(section.key as RepositorySection)}
                              sx={{ mb: 0.35, borderRadius: 2, '&.Mui-selected': { bgcolor: tokenBrand.softBg }, '&.Mui-selected:hover': { bgcolor: tokenBrand.softBg } }}
                            >
                              <ListItemIcon sx={{ minWidth: 34, color: isActive ? tokenBrand.main : tokenText.secondary }}>
                                {section.icon}
                              </ListItemIcon>
                              <ListItemText primary={section.label} primaryTypographyProps={{ fontWeight: isActive ? 800 : 700, color: isActive ? tokenBrand.main : tokenText.primary, fontSize: '0.88rem' }} />
                              <Chip size="small" label={section.count} sx={{ height: 20, bgcolor: isActive ? tokenCommon.white : workstationVisuals.slateSurface, fontWeight: 800 }} />
                            </ListItemButton>
                          );
                        })}
                      </List>
                    </Box>

                    <Paper elevation={0} sx={{ borderRadius: 2.5, border: `1px solid ${tokenDivider}`, bgcolor: tokenCommon.white, overflow: 'hidden' }}>
                      <Box sx={{ px: 1.5, py: 1.1, borderBottom: `1px solid ${tokenDivider}` }}>
                        <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 800, letterSpacing: '0.05em' }}>
                          HIERARCHY
                        </Typography>
                        <Typography variant="body2" sx={{ color: tokenText.secondary, mt: 0.25 }}>
                          Browse folders and document context like a repository explorer.
                        </Typography>
                      </Box>
                      <Box sx={{ height: 'calc(100vh - 420px)', minHeight: 340 }}>
                        <DocumentHierarchyPicker
                          selectedId={selectedDocumentHierarchyId}
                          favoriteIds={favoriteDocumentHierarchyIds}
                          onToggleFavorite={toggleFavoriteDocumentHierarchy}
                          onSelect={handleDocumentHierarchySelection}
                        />
                      </Box>
                    </Paper>
                  </Box>
                )}
              </Box>
            ) : null}

            {/* --- CENTER: Document Table --- */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              {!selectedWorkspace ? (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#9e9e9e' }}>
              <FolderIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6">Select a hierarchy</Typography>
              <Typography variant="body2">Choose Site, Line, and Asset to view operational documents.</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              {/* Breadcrumbs + Details toggle */}
              {isRepositoryView ? (
                <Box sx={{ px: 3, pt: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: '0.85rem' }}>
                    {selectedHierarchyPath.length ? (
                      selectedHierarchyPath
                        .filter((node) => node.kind !== 'global')
                        .map((node, index, nodes) => (
                          index === nodes.length - 1 ? (
                            <Typography key={node.id} sx={{ fontWeight: 700, fontSize: '0.85rem' }} color="text.primary">
                              {node.label}
                            </Typography>
                          ) : (
                            <Typography key={node.id} sx={{ fontSize: '0.85rem' }} color="text.secondary">
                              {node.label}
                            </Typography>
                          )
                        ))
                    ) : (
                      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }} color="text.primary">{selectedSite.name}</Typography>
                    )}
                    {activeFolderChain.length ? (
                      <Link
                        underline="hover"
                        color="inherit"
                        href="#"
                        sx={{ fontSize: '0.85rem' }}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveFolderId(null);
                          setSelectedIds([]);
                        }}
                      >
                        {repositorySectionLabels[selectedRepositorySection]}
                      </Link>
                    ) : (
                      <Typography sx={{ fontWeight: 'bold', fontSize: '0.85rem' }} color="text.primary">
                        {repositorySectionLabels[selectedRepositorySection]}
                      </Typography>
                    )}
                    {activeFolderChain.map((folder, index) => {
                      const isLastFolder = index === activeFolderChain.length - 1;
                      return isLastFolder ? (
                        <Typography key={folder.id} sx={{ fontWeight: 'bold', fontSize: '0.85rem' }} color="text.primary">
                          {folder.name}
                        </Typography>
                      ) : (
                        <Link
                          key={folder.id}
                          underline="hover"
                          color="inherit"
                          href="#"
                          sx={{ fontSize: '0.85rem' }}
                          onClick={(e) => {
                            e.preventDefault();
                            setActiveFolderId(folder.id);
                            setSelectedIds([folder.id]);
                          }}
                        >
                          {folder.name}
                        </Link>
                      );
                    })}
                  </Breadcrumbs>
                </Box>
              ) : null}

              {isWorkflowPlannerView ? (
                <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'auto' }}>
                  <DocumentWorkflowEngineScreen embedded onBack={() => handleSelectWorkspace('Inbox')} />
                </Box>
              ) : isRepositoryView ? (
                <Box sx={{ flexGrow: 1, px: 2.5, pb: 2.5, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: tokenText.primary, fontWeight: 800 }}>
                        {activeFolder ? activeFolder.name : selectedRepositorySection === 'AllDocuments' ? 'Repository root' : repositorySectionLabels[selectedRepositorySection]}
                      </Typography>
                      <Typography variant="caption" sx={{ color: tokenText.secondary }}>
                        {repositoryFolders.length} folders and {repositoryDocuments.length} documents in the current context.
                      </Typography>
                    </Box>
                    {activeFolder ? (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          const parentFolderId = activeFolder.parentFolderId ?? null;
                          setActiveFolderId(parentFolderId);
                          setSelectedIds(parentFolderId ? [parentFolderId] : []);
                        }}
                        sx={{ textTransform: 'none', fontWeight: 700 }}
                      >
                        Up One Level
                      </Button>
                    ) : null}
                  </Box>

                  {searchViewMode === 'card' ? (
                    <>
                      <Box>
                        <Typography variant="overline" sx={{ color: tokenText.secondary, fontWeight: 800, letterSpacing: 0.4 }}>
                          Folders
                        </Typography>
                        {repositoryFolders.length ? (
                          <Grid container spacing={1.5} sx={{ mt: 0.2 }}>
                            {repositoryFolders.map((item) => (
                              <Grid key={`folder-card-${item.id}`} size={{ xs: 12, md: 6, xl: 4 }}>
                                <Paper
                                  elevation={0}
                                  onClick={() => handleRepositoryItemSelect(item)}
                                  sx={{
                                    p: 1.75,
                                    borderRadius: 2.5,
                                    border: `1px solid ${selectedIds.includes(item.id) ? tokenBrand.selectedBg : tokenDivider}`,
                                    bgcolor: selectedIds.includes(item.id) ? tokenBrand.softBg : tokenCommon.white,
                                    cursor: 'pointer',
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1, mb: 1 }}>
                                    <FolderSharedIcon sx={{ color: tokenWarning.main, fontSize: 24 }} />
                                    <Box sx={{ minWidth: 0 }}>
                                      <Typography sx={{ color: tokenText.primary, fontWeight: 800 }} noWrap>
                                        {item.name}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: tokenText.secondary }} noWrap>
                                        {getRepositoryPathLabel(item)}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Typography variant="caption" sx={{ color: tokenText.secondary, display: 'block', mb: 0.35 }}>
                                    {getRepositoryContextLabel(item)}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: tokenText.secondary, display: 'block' }}>
                                    {getContainedItemCount(item.id)} contained items
                                  </Typography>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        ) : (
                          <Paper elevation={0} sx={{ mt: 0.8, p: 2, borderRadius: 2.5, border: `1px dashed ${tokenDivider}`, bgcolor: tokenCommon.white }}>
                            <Typography variant="body2" sx={{ color: tokenText.secondary }}>No folders match the current filters.</Typography>
                          </Paper>
                        )}
                      </Box>

                      <Box>
                        <Typography variant="overline" sx={{ color: tokenText.secondary, fontWeight: 800, letterSpacing: 0.4 }}>
                          Documents
                        </Typography>
                        {repositoryDocuments.length ? (
                          <Grid container spacing={1.5} sx={{ mt: 0.2 }}>
                            {repositoryDocuments.map((item) => (
                              <Grid key={`document-card-${item.id}`} size={{ xs: 12, md: 6, xl: 4 }}>
                                <Paper
                                  elevation={0}
                                  onClick={() => handleRepositoryItemSelect(item)}
                                  sx={{
                                    p: 1.75,
                                    borderRadius: 2.5,
                                    border: `1px solid ${selectedIds.includes(item.id) ? tokenBrand.selectedBg : tokenDivider}`,
                                    bgcolor: selectedIds.includes(item.id) ? tokenBrand.softBg : tokenCommon.white,
                                    cursor: 'pointer',
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.1 }}>
                                    <DescriptionIcon sx={{ color: tokenBrand.main, fontSize: 22, mt: 0.2 }} />
                                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                      <Typography
                                        sx={{ color: tokenText.primary, fontWeight: 800, textDecoration: 'underline', textDecorationColor: tokenBrand.selectedBg, cursor: 'pointer' }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openArtifact(item);
                                        }}
                                      >
                                        {item.name}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: tokenText.secondary, display: 'block', mt: 0.35 }}>
                                        {item.type} • {item.owner} • {item.modified}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: tokenText.secondary, display: 'block', mt: 0.2 }} noWrap>
                                        {getRepositoryPathLabel(item)}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: tokenText.secondary, display: 'block', mt: 0.25 }}>
                                        {item.status ?? item.lifecycle ?? 'No workflow status'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        ) : (
                          <Paper elevation={0} sx={{ mt: 0.8, p: 2, borderRadius: 2.5, border: `1px dashed ${tokenDivider}`, bgcolor: tokenCommon.white }}>
                            <Typography variant="body2" sx={{ color: tokenText.secondary }}>No documents match the current filters.</Typography>
                          </Paper>
                        )}
                      </Box>
                    </>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                        <Typography variant="overline" sx={{ color: tokenText.secondary, fontWeight: 800, letterSpacing: 0.4 }}>
                          Folders
                        </Typography>
                        {repositoryFolders.length ? repositoryFolders.map((item) => (
                          <Paper
                            key={`folder-row-${item.id}`}
                            elevation={0}
                            onClick={() => handleRepositoryItemSelect(item)}
                            sx={{
                              p: 1.5,
                              borderRadius: 2.5,
                              border: `1px solid ${selectedIds.includes(item.id) ? tokenBrand.selectedBg : tokenDivider}`,
                              bgcolor: selectedIds.includes(item.id) ? tokenBrand.softBg : tokenCommon.white,
                              cursor: 'pointer',
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1, minWidth: 0 }}>
                                <FolderSharedIcon sx={{ color: tokenWarning.main, fontSize: 22 }} />
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography sx={{ color: tokenText.primary, fontWeight: 800 }} noWrap>{item.name}</Typography>
                                  <Typography variant="caption" sx={{ color: tokenText.secondary }} noWrap>
                                    {getRepositoryPathLabel(item)}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: tokenText.secondary, display: 'block' }}>
                                    {getRepositoryContextLabel(item)} / {getContainedItemCount(item.id)} items
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Paper>
                        )) : (
                          <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: `1px dashed ${tokenDivider}`, bgcolor: tokenCommon.white }}>
                            <Typography variant="body2" sx={{ color: tokenText.secondary }}>No folders match the current filters.</Typography>
                          </Paper>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                        <Typography variant="overline" sx={{ color: tokenText.secondary, fontWeight: 800, letterSpacing: 0.4 }}>
                          Documents
                        </Typography>
                        {repositoryDocuments.length ? repositoryDocuments.map((item) => (
                          <Paper
                            key={`document-row-${item.id}`}
                            elevation={0}
                            onClick={() => handleRepositoryItemSelect(item)}
                            sx={{
                              p: 1.5,
                              borderRadius: 2.5,
                              border: `1px solid ${selectedIds.includes(item.id) ? tokenBrand.selectedBg : tokenDivider}`,
                              bgcolor: selectedIds.includes(item.id) ? tokenBrand.softBg : tokenCommon.white,
                              cursor: 'pointer',
                            }}
                          >
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) repeat(4, minmax(0, 1fr))', gap: 1.2, alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1, minWidth: 0 }}>
                                <DescriptionIcon sx={{ color: tokenBrand.main, fontSize: 20 }} />
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography
                                    sx={{ color: tokenText.primary, fontWeight: 800, textDecoration: 'underline', textDecorationColor: tokenBrand.selectedBg, cursor: 'pointer' }}
                                    noWrap
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openArtifact(item);
                                    }}
                                  >
                                    {item.name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: tokenText.secondary }} noWrap>
                                    {item.type}
                                  </Typography>
                                </Box>
                              </Box>
                              <Typography variant="caption" sx={{ color: tokenText.secondary }} noWrap>{getRepositoryPathLabel(item)}</Typography>
                              <Typography variant="caption" sx={{ color: tokenText.secondary }}>{item.owner}</Typography>
                              <Typography variant="caption" sx={{ color: tokenText.secondary }}>{item.modified}</Typography>
                              <Typography variant="caption" sx={{ color: tokenText.secondary }}>{item.status ?? 'No workflow status'}</Typography>
                            </Box>
                          </Paper>
                        )) : (
                          <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: `1px dashed ${tokenDivider}`, bgcolor: tokenCommon.white }}>
                            <Typography variant="body2" sx={{ color: tokenText.secondary }}>No documents match the current filters.</Typography>
                          </Paper>
                        )}
                      </Box>
                    </>
                  )}
                </Box>
              ) : selectedFile ? (
                <Box sx={{ flexGrow: 1, px: 2, pb: 2, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #DBDDDF', bgcolor: '#ffffff', boxShadow: '0 12px 28px rgba(15,23,42,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#044ED7', fontWeight: 800, letterSpacing: '0.08em' }}>
                        DOCUMENT EDITOR
                      </Typography>
                      <Typography variant="subtitle1" sx={{ color: '#1F2366', fontWeight: 800 }}>
                        {selectedFile.name}
                      </Typography>
                    </Box>
                    <Button size="small" variant="outlined" onClick={() => setSelectedIds([])} sx={{ textTransform: 'none', fontWeight: 700 }}>
                      Back to hierarchy
                    </Button>
                  </Paper>
                  <Paper elevation={0} sx={{ flexGrow: 1, minHeight: 0, p: 2, borderRadius: 3, border: '1px solid #DBDDDF', bgcolor: '#ffffff' }}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={22}
                      value={documentDrafts[selectedFile.id] ?? buildInitialDraft(selectedFile)}
                      onChange={(e) =>
                        setDocumentDrafts((prev) => ({
                          ...prev,
                          [selectedFile.id]: e.target.value,
                        }))
                      }
                      placeholder="Start writing your document..."
                      sx={{
                        height: '100%',
                        '& .MuiInputBase-root': {
                          height: '100%',
                          alignItems: 'flex-start',
                          bgcolor: '#fcfdff',
                          borderRadius: 2,
                          fontFamily: '"Arial", "Helvetica", sans-serif',
                          fontSize: '0.95rem',
                          lineHeight: 1.7,
                        },
                        '& textarea': {
                          height: '100% !important',
                          overflowY: 'auto !important',
                        },
                      }}
                    />
                  </Paper>
                </Box>
              ) : (
              /* Table */
              selectedWorkspace ? (
                <TableContainer sx={{ flexGrow: 1, px: 1 }}>
                  <Table size="small" stickyHeader sx={{ minWidth: 750 }}>
                    <TableHead>
                      <TableRow sx={{ '& th': { bgcolor: '#EBEDF0', borderBottom: '1px solid #DBDDDF', color: '#626465', fontWeight: 800, fontSize: '0.65rem', py: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' } }}>
                        {isEditMode && <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>}
                        <TableCell sx={{ width: 44, p: 0 }} align="center"></TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Lifecycle</TableCell>
                        <TableCell>Action</TableCell>
                        <TableCell>Version</TableCell>
                        <TableCell>Modified</TableCell>
                        <TableCell>Modified By</TableCell>
                        <TableCell>Owner</TableCell>
                        <TableCell>Approver</TableCell>
                        <TableCell>Review Date</TableCell>
                        <TableCell>Frequency</TableCell>
                        <TableCell>Document Type</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedData.map((item) => {
                        const isSelected = selectedIds.includes(item.id);
                        const isNewInboxItem = isInboxView
                          && !!item.isInInbox
                          && !item.isFolder
                          && !!item.inboxUpdatedAt
                          && Number.isFinite(Date.parse(item.inboxUpdatedAt))
                          && Date.now() - Date.parse(item.inboxUpdatedAt) <= 1000 * 60 * 60 * 48
                          && (((item.status || '').toLowerCase().includes('waiting')) || ((item.status || '').toLowerCase().includes('revision')));
                        return (
                          <TableRow
                            key={item.id}
                            hover
                            selected={isSelected}
                            onClick={() => {
                              if (isEditMode) {
                                handleToggleSelect(item.id);
                              } else {
                                if (item.isFolder) {
                                  openFolder(item);
                                } else {
                                  openArtifact(item);
                                }
                              }
                            }}
                            sx={{
                              opacity: item.lifecycle === 'Obsolete' ? 0.5 : 1,
                              cursor: 'pointer',
                              '&.Mui-selected': { bgcolor: isNewInboxItem ? '#dbeafe' : '#EBEDF0' },
                              '&:hover': { bgcolor: isSelected ? (isNewInboxItem ? '#dbeafe' : '#EBEDF0') : (isNewInboxItem ? '#eff6ff' : '#EBEDF0') },
                              '& td': { borderBottom: '1px solid #EBEDF0', py: 1.25, fontSize: '0.85rem', color: '#1F2366' },
                              bgcolor: isNewInboxItem ? '#f8fbff' : undefined,
                              transition: 'background-color 0.15s ease'
                            }}
                          >
                            {isEditMode && (
                              <TableCell padding="checkbox">
                                <Checkbox size="small" checked={isSelected} onClick={(e) => e.stopPropagation()} onChange={() => handleToggleSelect(item.id)} />
                              </TableCell>
                            )}
                            <TableCell sx={{ width: 44, px: 0 }} align="center">
                              <Tooltip title={item.starred ? "Remove from favorites" : "Add to favorites"}>
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => toggleStar(item.id, e)}
                                  sx={{ 
                                    color: item.starred ? '#f5bc00' : '#d1d5db', 
                                    '&:hover': { color: '#f5bc00', bgcolor: 'transparent' },
                                    p: 0.5
                                  }}
                                >
                                  {item.starred ? <StarIcon sx={{ fontSize: 18 }} /> : <StarBorderIcon sx={{ fontSize: 18 }} />}
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                            <TableCell sx={{ minWidth: 220 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {item.isFolder
                                  ? <FolderIcon sx={{ color: '#ffca28', fontSize: 20 }} />
                                  : <DescriptionIcon sx={{ color: '#044ED7', fontSize: 18 }} />
                                }
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexGrow: 1 }}>
                                  {isNewInboxItem && (
                                    <Box
                                      sx={{
                                        width: 8,
                                        alignSelf: 'stretch',
                                        borderRadius: 999,
                                        background: 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)',
                                        boxShadow: 'inset 0 0 0 1px rgba(147,197,253,0.85)',
                                      }}
                                    />
                                  )}
                                  <Typography
                                    variant="body2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isEditMode) return;
                                      if (item.isFolder) {
                                        openFolder(item);
                                        return;
                                      }
                                      openArtifact(item);
                                    }}
                                    sx={{
                                      fontWeight: item.isFolder ? 600 : 500,
                                      cursor: isEditMode ? 'default' : 'pointer',
                                      textDecoration: isEditMode || item.isFolder ? 'none' : 'underline',
                                      textDecorationColor: 'rgba(37,99,235,0.35)',
                                      '&:hover': isEditMode ? undefined : { color: '#1D74FF' },
                                    }}
                                  >
                                    {item.name}
                                  </Typography>
                                  {item.isCheckedOut && (
                                    <Tooltip title={`Checked out by ${item.checkedOutBy}`}>
                                      <LockIcon sx={{ fontSize: 13, color: '#FF6E00' }} />
                                    </Tooltip>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {!item.isFolder && item.lifecycle && (() => {
                                const lcfg = lifecycleChipStyle[item.lifecycle];
                                return (
                                  <Chip
                                    label={item.lifecycle}
                                    size="small"
                                    sx={{ bgcolor: lcfg.bg, color: lcfg.color, fontWeight: 700, fontSize: '0.68rem', height: 20, borderRadius: 1 }}
                                  />
                                );
                              })()}
                            </TableCell>
                            <TableCell>
                              {item.status && (
                                <Chip 
                                  label={item.status} 
                                  size="small" 
                                  onClick={(e) => {
                                    if (item.status === 'Waiting for e-Signature') {
                                      e.stopPropagation();
                                      setItemBeingSigned(item);
                                      setIsSigningSimulationOpen(true);
                                    }
                                  }}
                                  sx={{ 
                                    bgcolor: '#EBEDF0', 
                                    color: '#044ED7', 
                                    fontWeight: 800, 
                                    fontSize: '0.65rem', 
                                    height: 20, 
                                    borderRadius: 1,
                                    textTransform: 'uppercase',
                                    cursor: item.status === 'Waiting for e-Signature' ? 'pointer' : 'default',
                                    '&:hover': item.status === 'Waiting for e-Signature' ? { bgcolor: '#044ED7', color: 'white' } : {}
                                  }} 
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              {!item.isFolder && item.version && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#555', bgcolor: '#f0f0f0', px: 1, py: 0.25, borderRadius: 1 }}>
                                    {item.version}
                                  </Typography>
                                  {onVersionHistoryClick && (
                                    <Tooltip title="View version history">
                                      <IconButton size="small" sx={{ p: 0.25, opacity: 0.6, '&:hover': { opacity: 1 } }}
                                        onClick={(e) => { e.stopPropagation(); onVersionHistoryClick(item); }}>
                                        <HistoryIcon sx={{ fontSize: 15, color: '#044ED7' }} />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
                              )}
                            </TableCell>
                            <TableCell><Typography variant="body2" color="text.secondary">{item.modified}</Typography></TableCell>
                            <TableCell><Typography variant="body2" color="text.secondary">{item.modifiedBy}</Typography></TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <Avatar sx={{ width: 22, height: 22, fontSize: 11, bgcolor: '#ffb74d' }}>{item.owner?.charAt(0)}</Avatar>
                                <Typography variant="body2">{item.owner}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <Avatar sx={{ width: 22, height: 22, fontSize: 11, bgcolor: '#ba68c8' }}>{item.approver?.charAt(0)}</Avatar>
                                <Typography variant="body2">{item.approver}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell><Typography variant="body2" color="text.secondary">{item.reviewDate}</Typography></TableCell>
                            <TableCell>
                              {!item.isFolder && (
                                <Chip label={item.frequency} size="small" sx={{ bgcolor: '#EBEDF0', color: '#044ED7', fontWeight: 'bold', fontSize: '0.75rem', height: 22 }} />
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={item.type}
                                size="small"
                                sx={{
                                  bgcolor: item.isFolder ? '#f5f5f5' : '#3f51b5',
                                  color: item.isFolder ? '#555' : 'white',
                                  fontWeight: 'bold',
                                  fontSize: '0.72rem',
                                  height: 22,
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ p: 6, textAlign: 'center' }}>
                  <DescriptionIcon sx={{ fontSize: 48, color: '#e0e0e0', mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">No documents in this hierarchy</Typography>
                  <Typography variant="caption" color="text.secondary">Adjust Site, Line, or Asset filters, or upload a new document.</Typography>
                </Box>
              )
              )}
            </Box>
          )}
        </Box>

        {/* --- RIGHT: Details Panel --- */}
        {isDetailsOpen && (
          <>
            <Box
              onMouseDown={startResizing}
              sx={{
                width: '4px',
                cursor: 'col-resize',
                bgcolor: 'transparent',
                transition: 'background-color 0.2s',
                '&:hover': { bgcolor: '#044ED7' },
                zIndex: 10,
                flexShrink: 0,
              }}
            />
            <Box
              sx={{
                width: isRepositoryView ? 380 : detailsWidth,
                minWidth: isRepositoryView ? 340 : 300,
                bgcolor: tokenCommon.white,
                color: tokenText.primary,
                borderLeft: `1px solid ${tokenDivider}`,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden'
              }}
            >

            {isRepositoryView && selectedRecord ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
                <Box sx={{ px: 2.25, py: 1.6, borderBottom: `1px solid ${tokenDivider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 800, letterSpacing: '0.08em' }}>
                      {selectedRecord.isFolder ? 'FOLDER DETAILS' : 'DOCUMENT DETAILS'}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: tokenText.primary, fontWeight: 800 }}>
                      Repository metadata
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => setIsDetailsOpen(false)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', px: 2.25, py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: selectedRecord.isFolder ? '#fff7ed' : tokenBrand.softBg,
                        color: selectedRecord.isFolder ? tokenWarning.main : tokenBrand.main,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${selectedRecord.isFolder ? '#fed7aa' : tokenBrand.selectedBg}`,
                        flexShrink: 0,
                      }}
                    >
                      {selectedRecord.isFolder ? <FolderSharedIcon sx={{ fontSize: 22 }} /> : <DescriptionIcon sx={{ fontSize: 20 }} />}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" sx={{ color: tokenText.primary, fontWeight: 800, lineHeight: 1.25 }}>
                        {selectedRecord.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: tokenText.secondary, display: 'block', mt: 0.45 }}>
                        {selectedRecord.isFolder ? 'Folder' : selectedRecord.type}
                      </Typography>
                      <Typography variant="caption" sx={{ color: tokenText.secondary, display: 'block', mt: 0.35 }}>
                        {getRepositoryContextLabel(selectedRecord)}
                      </Typography>
                    </Box>
                  </Box>

                  <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, border: `1px solid ${tokenDivider}`, bgcolor: workstationVisuals.slateSurface }}>
                    <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 800, letterSpacing: '0.05em' }}>
                      PATH
                    </Typography>
                    <Typography variant="body2" sx={{ color: tokenText.primary, mt: 0.75, lineHeight: 1.5 }}>
                      {getRepositoryPathLabel(selectedRecord)}
                    </Typography>
                  </Paper>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[
                      ['Department', selectedRecord.isFolder ? 'Folder Scope' : getDepartmentLabel(selectedRecord)],
                      ['Document Type', selectedRecord.isFolder ? 'Folder' : getDocumentTypeLabel(selectedRecord)],
                      ['Origin', selectedRecord.isFolder ? 'Repository' : getOriginLabel(selectedRecord)],
                      ['File Format', selectedRecord.isFolder ? 'Folder' : getFileFormatLabel(selectedRecord)],
                      ['Site', selectedRecord.site ?? selectedSite.name],
                      ['Line', selectedRecord.line ?? 'Not assigned'],
                      ['Asset', selectedRecord.asset ?? 'Not assigned'],
                      ['Owner', selectedRecord.owner],
                      ['Approver', selectedRecord.approver],
                      ['Modified', selectedRecord.modified],
                      ['Modified By', selectedRecord.modifiedBy],
                      ['Lifecycle', selectedRecord.lifecycle ?? 'Folder'],
                      ['Status', selectedRecord.status ?? (selectedRecord.isFolder ? 'Available' : 'No active workflow')],
                      ['Version', selectedRecord.version ?? (selectedRecord.isFolder ? `${getContainedItemCount(selectedRecord.id)} items` : 'Current revision')],
                      ['Review Date', selectedRecord.reviewDate ?? '-'],
                      ['Tags', selectedRecord.isFolder ? 'Repository context' : getTagList(selectedRecord).join(', ') || 'No tags'],
                    ].map(([label, value]) => (
                      <Box key={label} sx={{ display: 'grid', gridTemplateColumns: '112px minmax(0, 1fr)', gap: 1.25, alignItems: 'start', py: 0.55, borderBottom: `1px solid ${tokenDivider}` }}>
                        <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 700 }}>
                          {label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: tokenText.primary, fontWeight: 600, lineHeight: 1.45 }}>
                          {value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9, pt: 0.5 }}>
                    {selectedRecord.isFolder ? (
                      <>
                        <Button
                          variant="contained"
                          onClick={() => openFolder(selectedRecord)}
                          sx={{ textTransform: 'none', fontWeight: 800, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
                        >
                          Open Folder
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={async () => {
                            const copiedPath = `${getRepositoryContextLabel(selectedRecord)} / ${getRepositoryPathLabel(selectedRecord)}`;
                            if (navigator?.clipboard?.writeText) {
                              await navigator.clipboard.writeText(copiedPath);
                              showSnackbar('Folder path copied', 'success');
                            } else {
                              showSnackbar('Clipboard is not available', 'info');
                            }
                          }}
                          sx={{ textTransform: 'none', fontWeight: 700 }}
                        >
                          Copy Path
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="contained"
                          onClick={() => openArtifact(selectedRecord)}
                          sx={{ textTransform: 'none', fontWeight: 800, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
                        >
                          Open Document
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={startWorkflowInMainAi}
                          sx={{ textTransform: 'none', fontWeight: 700 }}
                        >
                          Start Workflow
                        </Button>
                        <Button
                          variant="text"
                          onClick={() => openFileWithAssistant(selectedRecord)}
                          sx={{ textTransform: 'none', fontWeight: 700, justifyContent: 'flex-start' }}
                        >
                          Open in AI Assistant
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>
              </Box>
            ) : selectedFile ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                flexGrow: 1, 
                overflowY: 'auto', 
                minHeight: 0,
                /* Modern slim scrollbar */
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                '&::-webkit-scrollbar-thumb': { bgcolor: '#e0e0e0', borderRadius: '10px', '&:hover': { bgcolor: '#bdbdbd' } },
              }}>
                {/* 1. PDF-style Navigation Bar */}
                <Box sx={{ 
                  bgcolor: '#ffffff', 
                  color: '#37474f', 
                  px: 2, 
                  py: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  fontSize: '0.75rem',
                  borderBottom: '1px solid #e0e0e0',
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                }}>
                  <Box sx={{ bgcolor: '#f5f5f5', color: '#37474f', px: 1, py: 0.25, borderRadius: 0.5, border: '1px solid #e0e0e0', minWidth: 50, textAlign: 'center', fontWeight: 'bold' }}>
                    3 of 27
                  </Box>
                  <IconButton size="small" sx={{ color: '#37474f', p: 0.25, '&:hover': { bgcolor: '#f0f0f0' } }}><ExpandLessIcon sx={{ fontSize: 18 }} /></IconButton>
                  <IconButton size="small" sx={{ color: '#37474f', p: 0.25, '&:hover': { bgcolor: '#f0f0f0' } }}><ExpandMoreIcon sx={{ fontSize: 18 }} /></IconButton>
                  <Box sx={{ flexGrow: 1 }} />
                  <IconButton 
                    size="small" 
                    sx={{ color: '#37474f', p: 0.25, '&:hover': { bgcolor: '#f0f0f0' } }}
                    onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
                  >
                    {isPreviewExpanded ? <FullscreenExitIcon sx={{ fontSize: 18 }} /> : <FullscreenIcon sx={{ fontSize: 18 }} />}
                  </IconButton>
                </Box>

                {/* 2. Document Preview - Scaled for high visibility (60% or 100% focus) */}
                <Box sx={{ height: isPreviewExpanded ? '100%' : '60%', bgcolor: '#f4f7fc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0f0f0', p: 2, overflow: 'hidden', flexShrink: 0 }}>
                  <Paper elevation={12} sx={{ width: '90%', height: '98%', bgcolor: 'white', p: 2.5, display: 'flex', flexDirection: 'column', transform: 'scale(0.98)', transformOrigin: 'top center', overflow: 'hidden' }}>
                    <Typography variant="caption" sx={{ color: '#000', fontWeight: 'bold', mb: 2, fontSize: 11, borderLeft: '3px solid #044ED7', pl: 1 }}>{selectedFile.name}</Typography>
                    {[100, 95, 98, 100, 85, 90, 75, 95, 88, 92, 100, 65, 45, 82, 78, 92, 85, 95, 100, 85, 90, 100, 95, 88, 92, 75, 95, 80, 85, 90, 92, 100, 65, 45, 82, 78, 92, 85, 95].map((w, i) => (
                      <Box key={i} sx={{ width: `${w}%`, height: 4, bgcolor: '#f0f0f0', mb: 1.2, borderRadius: 1, flexShrink: 0 }} />
                    ))}
                    <Box sx={{ flexGrow: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid #f5f5f5' }}>
                      <DescriptionIcon sx={{ fontSize: 16, color: '#044ED7' }} />
                      <Typography variant="caption" sx={{ fontSize: 9, color: '#999', fontWeight: 600 }}>Page 3 of 27 â€¢ Confidential Data</Typography>
                    </Box>
                  </Paper>
                </Box>

                {!isPreviewExpanded && (
                  <Box sx={{ p: 2, borderBottom: '1px solid #DBDDDF', bgcolor: '#FFFFFF' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" sx={{ color: '#044ED7', fontWeight: 800, letterSpacing: '0.08em' }}>
                        LIVE DOCUMENT EDITOR
                      </Typography>
                      <Chip label="Connected to AI" size="small" sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 800, height: 20, fontSize: '0.65rem' }} />
                    </Box>
                    <TextField
                      multiline
                      fullWidth
                      minRows={8}
                      value={documentDrafts[selectedFile.id] ?? buildInitialDraft(selectedFile)}
                      onChange={(e) =>
                        setDocumentDrafts((prev) => ({
                          ...prev,
                          [selectedFile.id]: e.target.value,
                        }))
                      }
                      placeholder="Edit this file while BLU.AI assists on the right..."
                      sx={{
                        '& .MuiInputBase-root': {
                          bgcolor: '#ffffff',
                          borderRadius: 2,
                          fontSize: '0.84rem',
                          lineHeight: 1.6,
                          fontFamily: '"Consolas", "SFMono-Regular", Menlo, monospace',
                        },
                      }}
                    />
                  </Box>
                )}

                {/* 3. AI Intelligence Summary - Hidden in expanded view */}
                {!isPreviewExpanded && (
                  <Box sx={{ p: 2.5, bgcolor: '#f0f4ff', borderBottom: '1px solid #dde3f0' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, color: '#044ED7', mb: 1.5, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <SparkleIcon sx={{ fontSize: 20 }} /> AI Analysis Insights
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.88rem', color: '#2c3e50', lineHeight: 1.6, fontStyle: 'italic', bgcolor: 'white', p: 2, borderRadius: 1.5, border: '1px solid rgba(25, 118, 210, 0.15)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                    "Our AI model suggests this manual defines critical health and safety benchmarks for sterile environments. **Section 4.2** contains updated emergency protocols that require acknowledgment by all personnel before Q3. No compliance conflicts detected within the current regulatory framework."
                  </Typography>
                  </Box>
                )}

                {/* 4. Metadata details - Hidden in expanded view */}
                {/* 4. Metadata and Actions - Layout as per User Design */}
                {!isPreviewExpanded && (
                  <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    
                    {/* File Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Box sx={{ 
                        width: 52, 
                        height: 52, 
                        bgcolor: '#f0f7ff', 
                        borderRadius: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #e1f0ff'
                      }}>
                        <DescriptionIcon sx={{ color: '#044ED7', fontSize: 32 }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#060A3D', lineHeight: 1.2 }}>
                          {selectedFile.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#757575', fontWeight: 500, fontSize: '0.85rem' }}>
                          Global Quality System Archive
                        </Typography>
                      </Box>
                    </Box>

                    {/* Primary Button */}
                    <Button 
                      variant="contained" 
                      fullWidth 
                      startIcon={<CheckCircleIcon />}
                      onClick={startWorkflowInMainAi}
                      sx={{ 
                        bgcolor: '#044ED7', 
                        textTransform: 'none', 
                        fontWeight: 'bold', 
                        py: 1.4, 
                        borderRadius: 2,
                        fontSize: '0.92rem',
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#044ED7', boxShadow: 'none' }
                      }}
                    >
                      Start approval workflow
                    </Button>

                    {/* Secondary Actions */}
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <Button 
                        variant="outlined" 
                        fullWidth 
                        startIcon={<ShareIcon sx={{ fontSize: 20 }} />}
                        onClick={() => setIsShareSidePanelOpen(true)}
                        sx={{ 
                          borderColor: '#e0e0e0', 
                          color: '#424242', 
                          textTransform: 'none', 
                          fontWeight: 700, 
                          py: 1.2, 
                          borderRadius: 2,
                          fontSize: '0.88rem',
                          '&:hover': { borderColor: '#bdbdbd', bgcolor: '#f5f5f5' }
                        }}
                      >
                        Share
                      </Button>
                      <Button 
                        variant="outlined" 
                        fullWidth 
                        startIcon={<EditIcon sx={{ fontSize: 20 }} />}
                        sx={{ 
                          borderColor: '#e0e0e0', 
                          color: '#424242', 
                          textTransform: 'none', 
                          fontWeight: 700, 
                          py: 1.2, 
                          borderRadius: 2,
                          fontSize: '0.88rem',
                          '&:hover': { borderColor: '#bdbdbd', bgcolor: '#f5f5f5' }
                        }}
                      >
                        Revise
                      </Button>
                    </Box>

                    {/* Action List Section */}
                    <Paper variant="outlined" sx={{ bgcolor: '#f8f9fa', borderColor: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                      <List disablePadding>
                        <ListItemButton sx={{ py: 2, borderBottom: '1px solid #f0f0f0' }}>
                          <CloudUploadOutlinedIcon sx={{ color: '#757575', mr: 2.5, fontSize: 22 }} />
                          <ListItemText 
                            primary="Upload new version" 
                            primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600, color: '#455a64' }} 
                          />
                        </ListItemButton>
                        
                        <ListItemButton 
                          sx={{ py: 2, borderBottom: '1px solid #f0f0f0' }}
                          onClick={() => {
                            if (onVersionHistoryClick && selectedFile) {
                              onVersionHistoryClick(selectedFile);
                            }
                          }}
                        >
                          <HistoryOutlinedIcon sx={{ color: '#757575', mr: 2.5, fontSize: 22 }} />
                          <ListItemText 
                            primary="Version history" 
                            primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600, color: '#455a64' }} 
                          />
                        </ListItemButton>
                        
                        <ListItemButton sx={{ py: 2 }}>
                          <LockOutlinedIcon sx={{ color: '#757575', mr: 2.5, fontSize: 22 }} />
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#455a64' }}>Lock file</Typography>
                            <Chip 
                              label="Unlocked" 
                              size="small" 
                              variant="outlined" 
                              sx={{ color: '#9e9e9e', borderColor: '#e0e0e0', height: 22, fontSize: '0.65rem', fontWeight: 'bold' }} 
                            />
                          </Box>
                        </ListItemButton>
                      </List>
                    </Paper>

                    {/* Electronic Signing Section */}
                    <Box sx={{ mt: 1.5 }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontWeight: 800, 
                          color: '#78909c', 
                          mb: 1.5, 
                          display: 'block', 
                          fontSize: '0.75rem', 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.06em' 
                        }}
                      >
                        ELECTRONIC SIGNING
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                        <Button 
                          variant="outlined" 
                          fullWidth 
                          startIcon={<EditIcon sx={{ color: '#044ED7', fontSize: 18 }} />}
                          sx={{ 
                            borderColor: '#e0e0e0', 
                            color: '#424242', 
                            textTransform: 'none', 
                            fontWeight: 700, 
                            py: 1.2, 
                            borderRadius: 2, 
                            fontSize: '0.88rem',
                            justifyContent: 'flex-start', 
                            px: 2.5, 
                            '&:hover': { borderColor: '#bdbdbd', bgcolor: '#f5f5f5' } 
                          }}
                          onClick={() => setIsDocuSignSidePanelOpen(true)}
                        >
                          Start DocuSign workflow
                        </Button>

                        {selectedFile.status === 'Waiting for e-Signature' && (
                          <>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontWeight: 800, 
                                color: '#78909c', 
                                mt: 2, 
                                mb: 1.5, 
                                display: 'block', 
                                fontSize: '0.75rem', 
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em'
                              }}
                            >
                              Waiting for Signing
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {(selectedFile.signers || []).map((signer, idx) => (
                                <Box key={idx} sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 1.2, 
                                  p: 1, 
                                  bgcolor: '#f8f9fa', 
                                  borderRadius: 2,
                                  border: '1px solid #edf0f2'
                                }}>
                                  <Avatar sx={{ bgcolor: signer.color, color: signer.textColor, fontWeight: 800, width: 28, height: 28, fontSize: '0.75rem' }}>{signer.initial}</Avatar>
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography sx={{ fontWeight: 600, color: '#060A3D', fontSize: '0.8rem' }}>{signer.name}</Typography>
                                    <Typography sx={{ color: '#78909c', fontSize: '0.68rem' }}>{signer.email}</Typography>
                                  </Box>
                                  <Chip 
                                    label="Pending" 
                                    size="small" 
                                    sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: '#fff3e0', color: '#FF6E00', borderRadius: 1 }} 
                                  />
                                </Box>
                              ))}
                            </Box>
                          </>
                        )}
                      </Box>
                    </Box>

                    {/* Metadata Portfolio - Kept at bottom for utility */}
                    <Divider sx={{ borderColor: '#f0f0f0', my: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#060A3D', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Metadata Portfolio</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {[
                        ['Format', `${selectedFile.type} Documentation`],
                        ['Filesize', '215 KB'],
                        ['Last Revised', selectedFile.modified],
                        ['Revised By', selectedFile.modifiedBy],
                        ['Custodian', selectedFile.owner],
                        ['Review Date', selectedFile.reviewDate],
                      ].map((row, idx) => (
                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ color: '#666', fontWeight: 500 }}>{row[0]}</Typography>
                          <Typography variant="caption" sx={{ textAlign: 'right', color: '#1a1a1a', fontWeight: 700 }}>{row[1]}</Typography>
                        </Box>
                      ))}
                    </Box>

                    <Button 
                      variant="contained" 
                      disableElevation 
                      size="small" 
                      startIcon={<SettingsIcon />} 
                      sx={{ 
                        mt: 1, 
                        bgcolor: '#f5f7f9', 
                        color: '#455a64', 
                        '&:hover': { bgcolor: '#eceff1' }, 
                        textTransform: 'none', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        py: 1
                      }}
                    >
                      Intelligent Properties
                    </Button>
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', bgcolor: '#fafafa' }}>
                <Box sx={{ bgcolor: 'white', p: 3, borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', mb: 3 }}>
                  <InfoOutlinedIcon sx={{ fontSize: 48, color: '#044ED7', opacity: 0.5 }} />
                </Box>
                <Typography variant="h6" sx={{ color: '#333', fontWeight: 700, mb: 1 }}>No Selection</Typography>
                <Typography variant="body2" sx={{ color: '#666', maxWidth: 200 }}>Choose a document from the explorer to view deep intelligence and metadata.</Typography>
              </Box>
            )}
          </Box>
          </>
        )}
          </Box>
        </Box>
      </Box>

      {/* ===== WORKFLOW SIDE PANEL ===== */}
      <Dialog 
        open={isWorkflowSidePanelOpen} 
        onClose={() => setIsWorkflowSidePanelOpen(false)} 
        fullScreen
        PaperProps={{
          sx: {
            width: detailsWidth,
            height: '100%',
            ml: 'auto',
            position: 'absolute',
            right: 0,
            boxShadow: '-4px 0 16px rgba(0,0,0,0.1)',
            bgcolor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
          }
        }}
        slotProps={{
          backdrop: { sx: { bgcolor: 'transparent' } }
        }}
        sx={{ 
          '& .MuiDialog-container': { justifyContent: 'flex-end', alignItems: 'flex-end' },
          zIndex: 1300
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid #e0e0e0' }}>
          <IconButton size="small" onClick={() => setIsWorkflowSidePanelOpen(false)}>
            <ArrowBackIcon sx={{ color: '#546e7a' }} />
          </IconButton>
          <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#060A3D' }}>Start Automation Workflow</Typography>
        </Box>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 3, pt: 3, pb: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="body2" sx={{ color: '#546e7a', lineHeight: 1.5 }}>
            Select a workflow template or create a custom process to route the selected document for review and approval.
          </Typography>

          {/* Toggle Buttons */}
          <Box sx={{ display: 'flex', bgcolor: '#f5f7f9', p: 0.5, borderRadius: 2 }}>
            <Button
              fullWidth
              variant={workflowTab === 'template' ? 'contained' : 'text'}
              onClick={() => setWorkflowTab('template')}
              sx={{
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 700,
                bgcolor: workflowTab === 'template' ? 'white' : 'transparent',
                color: workflowTab === 'template' ? '#060A3D' : '#607d8b',
                boxShadow: workflowTab === 'template' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                border: workflowTab === 'template' ? '1px solid #e0e0e0' : '1px solid transparent',
                '&:hover': { bgcolor: workflowTab === 'template' ? 'white' : 'rgba(0,0,0,0.02)' }
              }}
            >
              Use Template
            </Button>
            <Button
              fullWidth
              variant={workflowTab === 'custom' ? 'contained' : 'text'}
              onClick={() => setWorkflowTab('custom')}
              sx={{
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 700,
                bgcolor: workflowTab === 'custom' ? 'white' : 'transparent',
                color: workflowTab === 'custom' ? '#060A3D' : '#607d8b',
                boxShadow: workflowTab === 'custom' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                border: workflowTab === 'custom' ? '1px solid #e0e0e0' : '1px solid transparent',
                '&:hover': { bgcolor: workflowTab === 'custom' ? 'white' : 'rgba(0,0,0,0.02)' }
              }}
            >
              Create Custom
            </Button>
          </Box>

          {workflowTab === 'template' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* AI Insight Header - Standardized */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, color: '#044ED7', mb: 1.5, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <SparkleIcon sx={{ fontSize: 20 }} /> AI Analysis Insights
                </Typography>
                
                {/* AI Insight Card - Recommending Custom */}
                <Box
                  onClick={() => setWorkflowTab('custom')}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 2,
                    bgcolor: '#fff9f0',
                    border: '1px solid #ffecc2',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: '#fff3e0',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }
                  }}
                >
                  <LightbulbIcon sx={{ color: '#ef6c00', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#FF6E00', fontWeight: 600, fontSize: '0.85rem' }}>
                    AI Insight: I couldn't find a perfect template match for this document. Creating a custom workflow is recommended. Click here to switch.
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#546e7a', mb: 1, display: 'block', textTransform: 'uppercase' }}>Workflow Template</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    displayEmpty
                    value={selectedWorkflowTemplate}
                    onChange={(e) => setSelectedWorkflowTemplate(e.target.value)}
                    renderValue={(selected) => {
                      if (selected.length === 0) {
                        return <span style={{ color: '#999' }}>Choose from libraries...</span>;
                      }
                      return selected + (selected.includes('SOP') ? ' (4 Steps)' : ' (2 Steps)');
                    }}
                    sx={{ borderRadius: 2, bgcolor: 'white' }}
                  >
                    <MenuItem value="SOP Quality Review">SOP Quality Review (4 Steps)</MenuItem>
                    <MenuItem value="Emergency Change">Emergency Change (2 Steps)</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {selectedWorkflowTemplate ? (
                <Box sx={{ p: 2, border: '1px solid #eef2f6', borderRadius: 2 }}>
                  <Typography sx={{ fontWeight: 700, mb: 2, color: '#060A3D' }}>Workflow Details</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {(selectedWorkflowTemplate === 'SOP Quality Review' ? [
                      'Pre-approval by Manager',
                      'Quality Review',
                      'Final Director Approval',
                      'System Publishing'
                    ] : [
                      'Rapid Management Approval',
                      'Safety Review'
                    ]).map((step, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ 
                          width: 24, 
                          height: 24, 
                          borderRadius: '50%', 
                          bgcolor: '#EBEDF0', 
                          color: '#044ED7', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 800
                        }}>
                          {i + 1}
                        </Box>
                        <Typography sx={{ fontSize: '0.88rem', color: '#455a64', fontWeight: 500 }}>{step}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Box sx={{ p: 6, textAlign: 'center', bgcolor: '#fbfcfd', border: '1px dashed #e0e4e8', borderRadius: 2 }}>
                   <WorkflowIcon sx={{ fontSize: 32, color: '#cfd8dc', mb: 1 }} />
                   <Typography variant="body2" sx={{ color: '#90a4ae' }}>Please select a template to view the workflow lifecycle steps.</Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* AI Insight Header - Standardized */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, color: '#044ED7', mb: 1.5, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <SparkleIcon sx={{ fontSize: 20 }} /> AI Analysis Insights
                </Typography>
                
                {/* AI Insight Card */}
                <Box
                  onClick={() => {
                    setCustomWorkflowName('AI Suggested: Quality & Safety Review');
                    setCustomSteps([
                      { id: Date.now() + 1, name: 'SOP Technical Review', role: 'Reviewer', sla: '24', email: 'tech.review@company.com' },
                      { id: Date.now() + 2, name: 'Quality Department Approval', role: 'Manager', sla: '48', email: 'quality@company.com' },
                      { id: Date.now() + 3, name: 'Director Final Signing', role: 'Director', sla: '12', email: 'director@company.com' }
                    ]);
                    setSnackbar({ open: true, message: 'AI Suggestion applied: 3 steps configured automatically.', severity: 'info' });
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 2,
                    bgcolor: '#f0f7ff',
                    border: '1px solid #c2e0ff',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: '#e1f0ff',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }
                  }}
                >
                  <LightbulbIcon sx={{ color: '#0288d1', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#0277bd', fontWeight: 600, fontSize: '0.85rem' }}>
                    AI Insight: Based on this document, I suggest a 3-step Quality & Safety Review. Click here to auto-populate.
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#546e7a', mb: 1, display: 'block', textTransform: 'uppercase' }}>Custom Workflow Name</Typography>
                <TextField 
                  fullWidth 
                  size="small" 
                  placeholder="e.g., Ad-hoc Marketing Review"
                  value={customWorkflowName}
                  onChange={(e) => setCustomWorkflowName(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#546e7a', mb: 1.5, display: 'block', textTransform: 'uppercase' }}>Workflow Steps</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {customSteps.map((step, idx) => (
                    <Paper key={step.id} variant="outlined" sx={{ p: 2, borderRadius: 2, border: '1px solid #eef2f6' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Box sx={{ 
                          width: 24, 
                          height: 24, 
                          borderRadius: '50%', 
                          bgcolor: '#f5f7f9', 
                          color: '#455a64', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 800
                        }}>
                          {idx + 1}
                        </Box>
                        <TextField
                          variant="standard"
                          value={step.name}
                          onChange={(e) => {
                            const newSteps = [...customSteps];
                            newSteps[idx].name = e.target.value;
                            setCustomSteps(newSteps);
                          }}
                          placeholder="Step Name"
                          InputProps={{
                            disableUnderline: true,
                            endAdornment: (
                              <InputAdornment position="end">
                                <EditIcon sx={{ fontSize: 16, color: '#90a4ae', opacity: 0.5 }} />
                              </InputAdornment>
                            ),
                            sx: { 
                              fontWeight: 700, 
                              color: '#060A3D', 
                              fontSize: '1rem',
                              px: 0.5,
                              borderRadius: 1,
                              transition: 'background-color 0.2s',
                              '&:hover': { bgcolor: '#f0f4f8' },
                              '&.Mui-focused': { bgcolor: '#eef2f6' }
                            }
                          }}
                          fullWidth
                        />
                      </Box>
                      <Divider sx={{ mb: 2, borderColor: '#f0f4f8' }} />
                      
                      <Grid container spacing={2}>
                        <Grid size={9}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#90a4ae', mb: 0.5, display: 'block', fontSize: '0.65rem' }}>ROLE</Typography>
                          <FormControl fullWidth size="small">
                            <Select 
                              value={step.role} 
                              onChange={(e) => {
                                const newSteps = [...customSteps];
                                newSteps[idx].role = e.target.value as string;
                                setCustomSteps(newSteps);
                              }}
                              sx={{ borderRadius: 1.5, fontSize: '0.85rem' }}
                            >
                              <MenuItem value="Manager">Manager</MenuItem>
                              <MenuItem value="Reviewer">Reviewer</MenuItem>
                              <MenuItem value="Director">Director</MenuItem>
                              <MenuItem value="Administrator">Administrator</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={3}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#90a4ae', mb: 0.5, display: 'block', fontSize: '0.65rem' }}>SLA (HOURS)</Typography>
                          <TextField 
                            fullWidth 
                            size="small" 
                            value={step.sla}
                            onChange={(e) => {
                              const newSteps = [...customSteps];
                              newSteps[idx].sla = e.target.value;
                              setCustomSteps(newSteps);
                            }}
                            InputProps={{
                              startAdornment: <InputAdornment position="start"><AccessTimeIcon sx={{ fontSize: 16, color: '#bdbdbd' }} /></InputAdornment>,
                              sx: { borderRadius: 1.5, fontSize: '0.85rem' }
                            }}
                          />
                        </Grid>
                        <Grid size={12}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#90a4ae', mb: 0.5, display: 'block', fontSize: '0.65rem' }}>RESPONSIBLE EMAIL</Typography>
                          <TextField 
                            fullWidth 
                            size="small" 
                            value={step.email}
                            onChange={(e) => {
                              const newSteps = [...customSteps];
                              newSteps[idx].email = e.target.value;
                              setCustomSteps(newSteps);
                            }}
                            placeholder="user@company.com"
                            InputProps={{
                              startAdornment: <InputAdornment position="start"><MailOutlineIcon sx={{ fontSize: 16, color: '#bdbdbd' }} /></InputAdornment>,
                              sx: { borderRadius: 1.5, fontSize: '0.85rem' }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AddCircleIcon />}
                    onClick={() => setCustomSteps([...customSteps, { id: Date.now(), name: 'New Step', role: 'Reviewer', sla: '48', email: '' }])}
                    sx={{
                      borderStyle: 'dashed',
                      borderColor: '#e0e0e0',
                      color: '#455a64',
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      '&:hover': { borderStyle: 'dashed', bgcolor: '#f9fbfd' }
                    }}
                  >
                    Add Step
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ p: 2, display: 'flex', gap: 2, borderTop: '1px solid #e0e0e0', bgcolor: 'white' }}>
          <Button 
            fullWidth 
            onClick={() => setIsWorkflowSidePanelOpen(false)}
            sx={{ color: '#455a64', fontWeight: 700, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            fullWidth 
            variant="contained" 
            startIcon={<PlayArrowIcon />}
            onClick={() => {
              setIsWorkflowSidePanelOpen(false);
              const workflowName = workflowTab === 'template' ? selectedWorkflowTemplate : (customWorkflowName || 'Custom Workflow');
              setData(prev => prev.map(doc => selectedIds.includes(doc.id) ? { 
                ...doc, 
                lifecycle: 'In Review', 
                activeWorkflow: workflowName,
                workflowStep: workflowTab === 'template' ? 'Step 1/4' : 'Step 1',
                stepResponsible: workflowTab === 'template' ? 'Manager' : customSteps[0].role
              } : doc));
              setSnackbar({ open: true, message: `Workflow "${workflowName}" initiated for ${selectedIds.length} document(s).`, severity: 'success' });
            }}
            sx={{ 
              bgcolor: '#044ED7', 
              fontWeight: 800, 
              textTransform: 'none', 
              py: 1.2, 
              borderRadius: 2,
              '&:hover': { bgcolor: '#044ED7' }
            }}
          >
            Start Workflow
          </Button>
        </Box>
      </Dialog>
      
      {/* ===== SHARE SIDE PANEL ===== */}
      <Dialog 
        open={isShareSidePanelOpen} 
        onClose={() => setIsShareSidePanelOpen(false)} 
        fullScreen
        PaperProps={{
          sx: {
            width: detailsWidth,
            height: '100%',
            ml: 'auto',
            position: 'absolute',
            right: 0,
            boxShadow: '-4px 0 16px rgba(0,0,0,0.1)',
            bgcolor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
          }
        }}
        slotProps={{
          backdrop: { sx: { bgcolor: 'transparent' } }
        }}
        sx={{ 
          '& .MuiDialog-container': { justifyContent: 'flex-end', alignItems: 'flex-end' },
          zIndex: 1300
        }}
      >
        {/* Header */}
        <Box sx={{ p: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <IconButton onClick={() => setIsShareSidePanelOpen(false)} size="small" sx={{ color: '#2c3e50', bgcolor: 'rgba(0,0,0,0.05)', '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' } }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 3, pb: 4, pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* AI Sharing Suggestions Block */}
          <Box sx={{ 
            bgcolor: '#f5f8ff', 
            borderRadius: 3, 
            p: 2.5, 
            border: '1px solid #e0eaff',
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <SparkleIcon sx={{ color: '#6200ee', fontSize: 22 }} />
              <Typography variant="overline" sx={{ fontWeight: 900, color: '#6200ee', letterSpacing: '0.1em', fontSize: '0.85rem' }}>AI SHARING SUGGESTIONS</Typography>
            </Box>
            
            <Typography variant="body2" sx={{ color: '#546e7a', fontWeight: 500, lineHeight: 1.5 }}>
              Based on this document's content and past access history, these team members might need access:
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { name: 'Sarah Jenkins', reason: 'Frequently reviews Maintenance Manuals', initial: 'S', color: '#EBEDF0', textColor: '#044ED7' },
                { name: 'Marcus Chen', reason: 'Matches document compliance scope', initial: 'M', color: '#ede7f6', textColor: '#673ab7' }
              ].map((person, idx) => (
                <Paper key={idx} variant="outlined" sx={{ 
                  p: 1.5, 
                  borderRadius: 2.5, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  borderColor: '#ffffff',
                  bgcolor: '#ffffff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                    transform: 'translateY(-1px)'
                  }
                }}>
                  <Avatar sx={{ bgcolor: person.color, color: person.textColor, fontWeight: 800, width: 40, height: 40 }}>{person.initial}</Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ fontWeight: 700, color: '#060A3D', fontSize: '0.95rem' }}>{person.name}</Typography>
                    <Typography sx={{ color: '#78909c', fontSize: '0.78rem', fontWeight: 500 }}>{person.reason}</Typography>
                  </Box>
                  <IconButton 
                    size="small" 
                    sx={{ color: '#6200ee', bgcolor: '#f5f0ff', '&:hover': { bgcolor: '#ede4ff' } }}
                    onClick={() => {
                      const newPerson = { 
                        name: person.name, 
                        email: person.name.toLowerCase().replace(' ', '.') + '@company.com', 
                        initial: person.initial,
                        color: person.color,
                        textColor: person.textColor
                      };
                      if (!selectedPeople.find(p => p.email === newPerson.email)) {
                        setSelectedPeople([...selectedPeople, newPerson]);
                      }
                    }}
                  >
                    <PersonAddIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Paper>
              ))}
            </Box>
          </Box>

          {/* Add people or groups */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#455a64', mb: 1.5 }}>Add people or groups</Typography>
            <TextField 
              fullWidth
              size="small"
              placeholder="Name, email, or group"
              value={shareInput}
              onChange={(e) => setShareInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && shareInput.trim()) {
                  const email = shareInput.trim();
                  const name = email.split('@')[0];
                  const initial = name.charAt(0).toUpperCase();
                  const newPerson = { 
                    name: name, 
                    email: email, 
                    initial: initial,
                    color: '#f5f5f5',
                    textColor: '#616161'
                  };
                  if (!selectedPeople.find(p => p.email === newPerson.email)) {
                    setSelectedPeople([...selectedPeople, newPerson]);
                  }
                  setShareInput('');
                }
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: '#90a4ae', mr: 1, fontSize: 20 }} />,
                sx: { 
                  borderRadius: 2.5, 
                  bgcolor: 'white',
                  '& fieldset': { borderColor: '#e0e4e8' },
                  '&:hover fieldset': { borderColor: '#cfd8dc' },
                  '&.Mui-focused fieldset': { borderColor: '#044ED7' }
                }
              }}
            />

            {/* Selected People List */}
            {selectedPeople.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {selectedPeople.map((person, idx) => (
                  <Box key={idx} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5, 
                    p: 1, 
                    bgcolor: '#f8f9fa', 
                    borderRadius: 2,
                    border: '1px solid #edf0f2'
                  }}>
                    <Avatar sx={{ bgcolor: person.color, color: person.textColor, fontWeight: 800, width: 32, height: 32, fontSize: '0.8rem' }}>{person.initial}</Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={{ fontWeight: 600, color: '#060A3D', fontSize: '0.85rem' }}>{person.name}</Typography>
                      <Typography sx={{ color: '#78909c', fontSize: '0.72rem' }}>{person.email}</Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setSelectedPeople(selectedPeople.filter((_, i) => i !== idx))}>
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* People with access list */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#455a64', mb: 2 }}>People with access</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#eceff1', color: '#455a64', fontWeight: 800, width: 42, height: 42, fontSize: '0.9rem' }}>DW</Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontWeight: 700, color: '#060A3D', fontSize: '1rem' }}>Dougie Wood (You)</Typography>
                </Box>
                <Typography sx={{ color: '#78909c', fontSize: '0.85rem' }}>d.wood@company.com</Typography>
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#90a4ae' }}>Owner</Typography>
            </Box>
          </Box>

        </Box>

        {/* Footer */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderTop: '1px solid #f0f0f0', bgcolor: 'white' }}>
          <Button 
            startIcon={<LinkIcon />}
            sx={{ color: '#455a64', fontWeight: 700, textTransform: 'none', px: 2 }}
            onClick={() => showSnackbar('Link copied to clipboard', 'info')}
          >
            Copy Link
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button 
            onClick={() => setIsShareSidePanelOpen(false)}
            sx={{ color: '#455a64', fontWeight: 700, textTransform: 'none', mx: 1 }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            startIcon={<CheckCircleIcon />}
            onClick={() => {
              setIsShareSidePanelOpen(false);
              setSelectedPeople([]);
              showSnackbar('Invite sent successfully', 'success');
            }}
            sx={{ 
              bgcolor: '#044ED7', 
              color: 'white',
              boxShadow: 'none',
              fontWeight: 800, 
              textTransform: 'none', 
              px: 3,
              py: 1.2,
              borderRadius: 2,
              '&:hover': { bgcolor: '#044ED7', boxShadow: 'none' }
            }}
          >
            Send Invite
          </Button>
        </Box>

      </Dialog>
      
      {/* ===== DOCUSIGN SIDE PANEL ===== */}
      <Dialog 
        open={isDocuSignSidePanelOpen} 
        onClose={() => setIsDocuSignSidePanelOpen(false)} 
        fullScreen
        PaperProps={{
          sx: {
            width: detailsWidth,
            height: '100%',
            ml: 'auto',
            position: 'absolute',
            right: 0,
            boxShadow: '-4px 0 16px rgba(0,0,0,0.1)',
            bgcolor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
          }
        }}
        slotProps={{
          backdrop: { sx: { bgcolor: 'transparent' } }
        }}
        sx={{ 
          '& .MuiDialog-container': { justifyContent: 'flex-end', alignItems: 'flex-end' },
          zIndex: 1300
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid #e0e0e0' }}>
          <IconButton size="small" onClick={() => setIsDocuSignSidePanelOpen(false)}>
            <ArrowBackIcon sx={{ color: '#546e7a' }} />
          </IconButton>
          <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#060A3D' }}>Start e-Signature Workflow</Typography>
        </Box>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 3, pt: 3, pb: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
          
          {/* Tool Selection Section */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#455a64', mb: 1.5, fontSize: '0.85rem' }}>
              Select e-Signature Provider
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={selectedESignatureTool}
                onChange={(e) => setSelectedESignatureTool(e.target.value)}
                sx={{ 
                  borderRadius: 2.5, 
                  bgcolor: 'white',
                  fontWeight: 600,
                  color: '#060A3D',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e4e8' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cfd8dc' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#044ED7' }
                }}
              >
                <MenuItem value="DocuSign">DocuSign</MenuItem>
                <MenuItem value="Acrobat Sign">Acrobat Sign</MenuItem>
                <MenuItem value="signNow">signNow</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* AI Signature Suggestions */}
          <Box sx={{ 
            bgcolor: '#f0f7ff', 
            borderRadius: 4, 
            p: 3, 
            border: '1px solid #c2e0ff',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <SparkleIcon sx={{ color: '#044ED7', fontSize: 20 }} />
              <Typography variant="overline" sx={{ fontWeight: 900, color: '#044ED7', letterSpacing: '0.1em', fontSize: '0.75rem' }}>
                AI SIGNATURE SUGGESTIONS
              </Typography>
            </Box>
            
            <Typography variant="body2" sx={{ color: '#0277bd', fontWeight: 500, lineHeight: 1.5, mb: 2.5, fontSize: '0.82rem', opacity: 0.8 }}>
              Based on the compliance requirements of this manual, the following signatures are highly recommended:
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { name: 'Sarah Jenkins', reason: 'Required for Section 4.2 compliance', initial: 'S', color: '#EBEDF0', textColor: '#044ED7' },
                { name: 'Marcus Chen', reason: 'Final approver for Maintenance Manuals', initial: 'M', color: '#EBEDF0', textColor: '#044ED7' }
              ].map((person, idx) => (
                <Paper key={idx} variant="outlined" sx={{ 
                  p: 1.5, 
                  borderRadius: 3, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5, 
                  borderColor: '#f0f0f0',
                  bgcolor: '#ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                    borderColor: '#044ED7'
                  }
                }}>
                  <Avatar sx={{ bgcolor: person.color, color: person.textColor, fontWeight: 800, width: 36, height: 36, fontSize: '0.85rem' }}>{person.initial}</Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ fontWeight: 700, color: '#060A3D', fontSize: '0.88rem' }}>{person.name}</Typography>
                    <Typography sx={{ color: '#78909c', fontSize: '0.72rem', fontWeight: 500 }}>{person.reason}</Typography>
                  </Box>
                  <IconButton 
                    size="small" 
                    sx={{ color: '#044ED7', bgcolor: 'rgba(21, 101, 192, 0.05)' }}
                    onClick={() => {
                      const signer = { 
                        name: person.name, 
                        email: person.name.toLowerCase().replace(' ', '.') + '@company.com', 
                        initial: person.initial,
                        color: person.color,
                        textColor: person.textColor
                      };
                      if (!selectedSigners.find(s => s.email === signer.email)) {
                        setSelectedSigners([...selectedSigners, signer]);
                      }
                    }}
                  >
                    <AddIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Paper>
              ))}
            </Box>
          </Box>

          {/* Add signers */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#455a64', mb: 1.5 }}>Add signers</Typography>
            <TextField 
              fullWidth
              size="small"
              placeholder="Name or email address"
              value={signerInput}
              onChange={(e) => setSignerInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && signerInput.trim()) {
                  const email = signerInput.trim();
                  const name = email.split('@')[0];
                  const initial = name.charAt(0).toUpperCase();
                  const newSigner = { 
                    name: name, 
                    email: email, 
                    initial: initial,
                    color: '#f5f5f5',
                    textColor: '#616161'
                  };
                  if (!selectedSigners.find(s => s.email === newSigner.email)) {
                    setSelectedSigners([...selectedSigners, newSigner]);
                  }
                  setSignerInput('');
                }
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: '#90a4ae', mr: 1, fontSize: 20 }} />,
                sx: { 
                  borderRadius: 2.5, 
                  bgcolor: 'white',
                  '& fieldset': { borderColor: '#e0e4e8' },
                  '&:hover fieldset': { borderColor: '#cfd8dc' },
                  '&.Mui-focused fieldset': { borderColor: '#044ED7' }
                }
              }}
            />

            {/* Invited Signers List */}
            {selectedSigners.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {selectedSigners.map((signer, idx) => (
                  <Box key={idx} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5, 
                    p: 1.2, 
                    bgcolor: '#f8f9fa', 
                    borderRadius: 2.5,
                    border: '1px solid #edf0f2',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: '#f1f4f8' }
                  }}>
                    <Avatar sx={{ bgcolor: signer.color, color: signer.textColor, fontWeight: 800, width: 34, height: 34, fontSize: '0.82rem' }}>{signer.initial}</Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={{ fontWeight: 600, color: '#060A3D', fontSize: '0.88rem' }}>{signer.name}</Typography>
                      <Typography sx={{ color: '#78909c', fontSize: '0.75rem' }}>{signer.email}</Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setSelectedSigners(selectedSigners.filter((_, i) => i !== idx))}>
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

        </Box>

        {/* Footer */}
        <Box sx={{ p: 2.5, display: 'flex', gap: 2, borderTop: '1px solid #f0f0f0', bgcolor: 'white' }}>
          <Button 
            fullWidth 
            onClick={() => {
              setIsDocuSignSidePanelOpen(false);
              setSelectedSigners([]);
              setSignerInput('');
            }}
            sx={{ color: '#455a64', fontWeight: 700, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            fullWidth 
            variant="contained" 
            onClick={() => {
              setIsDocuSignSidePanelOpen(false);
              
              setData(prev => prev.map(doc => {
                if (selectedIds.includes(doc.id)) {
                  return { 
                    ...doc, 
                    isInInbox: true, 
                    status: 'Waiting for e-Signature',
                    lifecycle: 'In Review',
                    signers: [...selectedSigners],
                    activeWorkflow: 'e-Signature Workflow',
                    workflowStep: 'Step 1/' + selectedSigners.length,
                    stepResponsible: selectedSigners[0]?.name || 'Pending'
                  };
                }
                return doc;
              }));

              showSnackbar('Document was sent for signing', 'success');
              setSelectedSigners([]);
              setSignerInput('');
              // Keep selectedIds so details panel stays open
            }}
            sx={{ 
              bgcolor: '#044ED7', 
              fontWeight: 800, 
              textTransform: 'none', 
              py: 1.2, 
              borderRadius: 2,
              '&:hover': { bgcolor: '#044ED7' }
            }}
          >
            Send for Signature
          </Button>
        </Box>
      </Dialog>


      {/* ===== SNACKBAR ===== */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
      {/* DocuSign Simulation Dialog */}
      <Dialog
        fullScreen
        open={isSigningSimulationOpen}
        onClose={() => setIsSigningSimulationOpen(false)}
      >
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f4f4f4' }}>
          {/* Top Bar */}
          <Box sx={{ height: 50, bgcolor: '#005cb9', display: 'flex', alignItems: 'center', px: 2, justifyContent: 'space-between', color: 'white' }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>Drag and drop fields from the left panel onto the document</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="contained" size="small" sx={{ bgcolor: '#007bff', '&:hover': { bgcolor: '#0069d9' } }} onClick={handleFinishSigning}>FINISH</Button>
              <Button sx={{ color: 'white' }} size="small">MORE OPTIONS â–¾</Button>
            </Box>
          </Box>

          {/* Sub Toolbar */}
          <Box sx={{ height: 40, bgcolor: '#fff', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', px: 2, gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, opacity: 0.7 }}>
              <Tooltip title="Zoom Out"><IconButton size="small"><ZoomOutIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Zoom In"><IconButton size="small"><ZoomInIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Download"><IconButton size="small"><DownloadIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Print"><IconButton size="small"><PrintIcon fontSize="small" /></IconButton></Tooltip>
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Left Sidebar */}
            <Box sx={{ width: 220, bgcolor: '#fff', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', p: 2 }}>
              <Typography variant="overline" sx={{ fontWeight: 700, color: '#666', mb: 2 }}>FIELDS</Typography>
              <List sx={{ '& .MuiListItemButton-root': { py: 0.5 } }}>
                {[
                  { icon: <DrawIcon fontSize="small" />, text: 'Signature' },
                  { icon: <TextFieldsIcon fontSize="small" />, text: 'Initial' },
                  { icon: <HistoryIcon fontSize="small" />, text: 'Stamp' },
                  { icon: <CalendarTodayIcon fontSize="small" />, text: 'Date Signed' },
                  { icon: <PersonOutlineIcon fontSize="small" />, text: 'My Name' },
                  { icon: <PersonOutlineIcon fontSize="small" />, text: 'My First Name' },
                  { icon: <PersonOutlineIcon fontSize="small" />, text: 'My Last Name' },
                  { icon: <MailOutlineIcon fontSize="small" />, text: 'E-mail Address' },
                  { icon: <BusinessIcon fontSize="small" />, text: 'Company' },
                  { icon: <TextFieldsIcon fontSize="small" />, text: 'Title' },
                  { icon: <TextFieldsIcon fontSize="small" />, text: 'Text' },
                  { icon: <CheckBoxIcon fontSize="small" />, text: 'Checkbox' },
                ].map((item, idx) => (
                  <ListItemButton key={idx} sx={{ borderBottom: idx === 3 || idx === 9 ? '1px solid #eee' : 'none', mb: (idx === 3 || idx === 9) ? 1 : 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} primaryTypographyProps={{ variant: 'caption', fontWeight: 500 }} />
                  </ListItemButton>
                ))}
              </List>
            </Box>

            {/* Document Preview */}
            <Box sx={{ flexGrow: 1, p: 4, display: 'flex', justifyContent: 'center', overflowY: 'auto', bgcolor: '#f4f4f4' }}>
              <Paper sx={{ width: 800, p: 8, minHeight: 1100, position: 'relative', bgcolor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                {/* Header */}
                <Typography variant="h5" sx={{ textAlign: 'center', mb: 6, fontWeight: 700, textTransform: 'uppercase' }}>{itemBeingSigned?.name.split('.')[0] || 'Agreement'}</Typography>
                
                {/* Realistic Content Blocks */}
                <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.6, textAlign: 'justify' }}>
                  This Document (the "Agreement") is entered into as of the effective date by and between the parties hereto. 
                  The parties agree that this electronic execution of the Agreement shall be binding and legally enforceable.
                </Typography>
                
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>1. Confidentiality</Typography>
                <Typography variant="body2" sx={{ mb: 4, color: '#444', lineHeight: 1.6 }}>
                  The parties shall maintain strict confidentiality with respect to all proprietary information disclosed during the term of this Agreement. 
                  Neither party shall disclose such information to any third party without prior written consent.
                </Typography>

                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>2. Term and Termination</Typography>
                <Typography variant="body2" sx={{ mb: 8, color: '#444', lineHeight: 1.6 }}>
                  This Agreement shall remain in effect until terminated by either party upon thirty (30) days' written notice. 
                  In the event of termination, all outstanding obligations shall be fulfilled in accordance with the terms herein.
                </Typography>

                {/* Signature Section */}
                <Box sx={{ mt: 10, display: 'flex', justifyContent: 'space-between' }}>
                  <Box sx={{ width: '45%' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>John Smith</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ height: 40, width: '100%', border: '1px dashed #bbb', borderRadius: 1, display: 'flex', alignItems: 'center', px: 1, position: 'relative' }}>
                      {/* Sign Action */}
                      {!hasUserSigned ? (
                        <Box 
                          onClick={() => setHasUserSigned(true)}
                          sx={{ 
                            position: 'absolute', 
                            top: -45, 
                            left: 0, 
                            bgcolor: '#ffcc33', 
                            p: 1, 
                            borderRadius: '4px 4px 0 4px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                            zIndex: 10,
                            '&:hover': { transform: 'scale(1.05)' },
                            transition: 'all 0.2s',
                            '&:after': {
                              content: '""',
                              position: 'absolute',
                              bottom: -8,
                              left: 0,
                              borderLeft: '8px solid #ffcc33',
                              borderBottom: '8px solid transparent'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                            <Typography sx={{ fontSize: 10, fontWeight: 800, color: '#333' }}>SIGN</Typography>
                            <ArrowDownwardIcon sx={{ fontSize: 16, color: '#333', mt: -0.5 }} />
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="h5" sx={{ fontFamily: 'Dancing Script, cursive', color: '#044ED7', width: '100%', textAlign: 'center' }}>
                          John Smith
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">Signature</Typography>
                  </Box>

                  <Box sx={{ width: '45%' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Jane Doe</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ height: 40, width: '100%', display: 'flex', alignItems: 'center' }}>
                      <Typography variant="h5" sx={{ fontFamily: 'Dancing Script, cursive', color: '#005cb9' }}>Jane Doe</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">Signature</Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="caption" color="text.secondary">Date: {new Date().toLocaleDateString()}</Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Dialog>


      {/* ===== MOCK WINDOWS EXPLORER DIALOG ===== */}
      <Dialog 
        open={isExplorerOpen} 
        onClose={() => !isUploading && setIsExplorerOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            height: 600, 
            borderRadius: 2, 
            overflow: 'hidden', 
            bgcolor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)'
          }
        }}
      >
        {/* Title Bar (Simulating Win 11) */}
        <Box sx={{ bgcolor: '#f3f3f3', px: 2, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e5e5' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CloudUploadIcon sx={{ color: '#0078d4', fontSize: 18 }} />
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: '#333' }}>Open File</Typography>
          </Box>
          <Box sx={{ display: 'flex' }}>
            <IconButton size="small" sx={{ borderRadius: 0, px: 1.5, '&:hover': { bgcolor: '#e5e5e5' } }}><Box sx={{ width: 10, height: 1, bgcolor: '#333' }} /></IconButton>
            <IconButton size="small" sx={{ borderRadius: 0, px: 1.5, '&:hover': { bgcolor: '#e5e5e5' } }}><Box sx={{ width: 10, height: 10, border: '1px solid #333' }} /></IconButton>
            <IconButton 
              size="small" 
              onClick={() => setIsExplorerOpen(false)}
              sx={{ borderRadius: 0, px: 1.5, '&:hover': { bgcolor: '#e81123', color: 'white' } }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Navigation Bar */}
        <Box sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#ffffff' }}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton size="small" disabled><ArrowBackIcon sx={{ fontSize: 16 }} /></IconButton>
            <IconButton size="small" disabled><ArrowUpwardIcon sx={{ fontSize: 16 }} /></IconButton>
          </Box>
          <Box sx={{ flexGrow: 1, bgcolor: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: 1, px: 1.5, py: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FolderIcon sx={{ color: '#0078d4', fontSize: 16 }} />
            <Typography sx={{ fontSize: '0.75rem', color: '#666' }}>This PC &gt; Documents &gt; Corporate Cloud</Typography>
          </Box>
          <Box sx={{ width: 220, bgcolor: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: 1, px: 1, py: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SearchIcon sx={{ color: '#666', fontSize: 16 }} />
            <Typography variant="caption" sx={{ color: '#aaa' }}>Search Corp Documents</Typography>
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Sidebar */}
          <Box sx={{ width: 200, bgcolor: '#f3f3f3', borderRight: '1px solid #e5e5e5', pt: 1 }}>
            <List dense disablePadding>
              {['Quick Access', 'Desktop', 'Downloads', 'Documents', 'Pictures'].map((folder) => (
                <ListItemButton key={folder} sx={{ py: 0.5, px: 2 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}><FolderIcon sx={{ color: '#0078d4', fontSize: 18 }} /></ListItemIcon>
                  <ListItemText primary={folder} primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: folder === 'Documents' ? 700 : 500 }} />
                </ListItemButton>
              ))}
            </List>
          </Box>

          {/* File Grid */}
          <Box sx={{ flexGrow: 1, p: 2, bgcolor: '#ffffff', overflowY: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { borderBottom: '1px solid #f0f0f0', fontWeight: 600, fontSize: '0.75rem', color: '#666', py: 0.5 } }}>
                  <TableCell>Name</TableCell>
                  <TableCell>Date Modified</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Size</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockExplorerFiles.map((file) => (
                  <TableRow 
                    key={file.name} 
                    hover 
                    selected={selectedMockFile?.name === file.name}
                    onClick={() => setSelectedMockFile(file)}
                    sx={{ 
                      cursor: 'pointer',
                      '&.Mui-selected': { bgcolor: '#e5f3ff', '&:hover': { bgcolor: '#cce8ff' } }
                    }}
                  >
                    <TableCell sx={{ py: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DescriptionIcon sx={{ fontSize: 18, color: '#044ED7' }} />
                        <Typography sx={{ fontSize: '0.75rem' }}>{file.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', color: '#666' }}>{file.modified}</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', color: '#666' }}>{file.type} File</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', color: '#666' }}>{file.size}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Box>

        {/* Explorer Footer */}
        <Box sx={{ p: 2, borderTop: '1px solid #e5e5e5', bgcolor: '#f3f3f3', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ fontSize: '0.75rem', width: 80 }}>File name:</Typography>
            <TextField 
              fullWidth 
              size="small" 
              value={selectedMockFile?.name || ''} 
              sx={{ bgcolor: '#ffffff' }}
              InputProps={{ sx: { fontSize: '0.75rem', height: 28 } }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
              <Typography sx={{ fontSize: '0.75rem', width: 80 }}>File type:</Typography>
              <FormControl size="small" sx={{ width: 220, bgcolor: '#ffffff' }}>
                <Select value="All files" disabled sx={{ height: 28, fontSize: '0.75rem' }}>
                  <MenuItem value="All files">All Enterprise Files (*.*)</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button 
                variant="contained" 
                size="small" 
                onClick={handleMockUpload}
                disabled={!selectedMockFile || isUploading}
                sx={{ 
                  bgcolor: '#0078d4', 
                  borderRadius: 0.5, 
                  px: 4, 
                  textTransform: 'none', 
                  fontSize: '0.75rem',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#005a9e', boxShadow: 'none' } 
                }}
              >
                Open
              </Button>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => setIsExplorerOpen(false)}
                disabled={isUploading}
                sx={{ 
                  border: '1px solid #bdbdbd', 
                  color: '#333', 
                  borderRadius: 0.5, 
                  px: 4, 
                  textTransform: 'none', 
                  fontSize: '0.75rem',
                  '&:hover': { bgcolor: '#e5e5e5', borderColor: '#bdbdbd' } 
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Upload Simulation Overlay */}
        {isUploading && (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, left: 0, right: 0, bottom: 0, 
            bgcolor: 'rgba(255,255,255,0.85)', 
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            textAlign: 'center'
          }}>
            <Box sx={{ position: 'relative', mb: 4 }}>
              <SparkleIcon sx={{ fontSize: 72, color: '#044ED7' }} />
              <CircularProgress 
                size={90} 
                thickness={2} 
                sx={{ 
                  position: 'absolute', 
                  top: -9, 
                  left: -9, 
                  color: '#044ED7',
                  opacity: 0.3
                }} 
              />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: '#060A3D', letterSpacing: '-0.02em' }}>AI is analyzing the document</Typography>
            <Typography variant="body1" sx={{ color: '#626465', mb: 4, maxWidth: 450 }}>
              Searching for similarities, extracting deep metadata, and performing multi-vector compliance checks across the enterprise cloud...
            </Typography>
            <Box sx={{ width: '100%', maxWidth: 480, bgcolor: 'white', p: 3, borderRadius: 4, boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #EBEDF0' }}>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress} 
                sx={{ 
                  height: 10, 
                  borderRadius: 5, 
                  bgcolor: '#EBEDF0', 
                  '& .MuiLinearProgress-bar': { 
                    bgcolor: '#044ED7', 
                    borderRadius: 5,
                    backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)',
                    backgroundSize: '1rem 1rem'
                  } 
                }} 
              />
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#044ED7', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 14 }} /> {uploadProgress < 100 ? 'Analyzing...' : 'Complete'}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#060A3D', fontSize: '1.2rem' }}>{uploadProgress}%</Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Dialog>
      {/* Hierarchy Node Creation Dialog */}
      <Dialog 
        open={isNewContentFolderDialogOpen} 
        onClose={() => setIsNewContentFolderDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 1,
            minWidth: 400,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,1))',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1F2366', pb: 1, fontSize: '1.25rem' }}>Create New Hierarchy Node</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ color: '#626465', mb: 2.5, fontWeight: 500, lineHeight: 1.6 }}>
            Enter a name for the new hierarchy node. It will be added to the current Site/Line/Asset view in the document repository.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            placeholder="e.g. Technical Specifications 2024"
            variant="outlined"
            value={newContentFolderName}
            onChange={(e) => setNewContentFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddFolderToTable();
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                bgcolor: '#EBEDF0',
                '& fieldset': { borderColor: '#DBDDDF' },
                '&:hover fieldset': { borderColor: '#1D74FF' },
                '&.Mui-focused fieldset': { borderColor: '#1D74FF', borderWidth: 2 },
              },
              '& .MuiInputBase-input': { fontWeight: 600, color: '#1F2366' }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button 
            onClick={() => setIsNewContentFolderDialogOpen(false)}
            sx={{ borderRadius: 2, fontWeight: 700, px: 3, color: '#626465', textTransform: 'none', '&:hover': { bgcolor: '#EBEDF0' } }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddFolderToTable}
            variant="contained"
            disabled={!newContentFolderName.trim()}
            sx={{ 
              borderRadius: 2.5, 
              fontWeight: 800, 
              px: 4, 
              textTransform: 'none',
              bgcolor: '#044ED7',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              '&:hover': { bgcolor: '#1D74FF', boxShadow: '0 6px 16px rgba(37, 99, 235, 0.4)' }
            }}
          >
            Create Hierarchy Node
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isAiSummaryOpen}
        onClose={() => setIsAiSummaryOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1F2366' }}>AI Summary</DialogTitle>
        <DialogContent>
          {isAiSummaryLoading ? (
            <Box sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <CircularProgress size={18} />
              <Typography variant="body2" sx={{ color: '#626465' }}>Analyzing selected files...</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 0.5 }}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                {aiSummaryData?.summary ?? aiResponse.summary}
              </Alert>
              <Accordion disableGutters elevation={0} sx={{ border: '1px solid #DBDDDF', borderRadius: 2, '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 700, color: '#1F2366' }}>Risks</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {(aiSummaryData?.risks ?? aiResponse.risks).map((risk) => (
                    <Typography key={risk} variant="body2" sx={{ color: '#626465', mb: 0.6 }}>• {risk}</Typography>
                  ))}
                </AccordionDetails>
              </Accordion>
              <Accordion disableGutters elevation={0} sx={{ border: '1px solid #DBDDDF', borderRadius: 2, '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 700, color: '#1F2366' }}>Changes</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {(aiSummaryData?.changes ?? aiResponse.changes).map((change) => (
                    <Typography key={change} variant="body2" sx={{ color: '#626465', mb: 0.6 }}>• {change}</Typography>
                  ))}
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsAiSummaryOpen(false)} variant="contained" sx={{ textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>

      <AIAnalysisResultDialog 
        open={isAnalysisResultOpen} 
        onClose={() => {
          setIsAnalysisResultOpen(false);
          setSelectedMockFile(null);
        }} 
        fileName={selectedMockFile?.name || ''} 
      />
    </Box>
  );
}

