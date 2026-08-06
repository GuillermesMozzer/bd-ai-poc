import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  AccountTree as AccountTreeIcon,
  AutoAwesome as AutoAwesomeIcon,
  Business as BusinessIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Factory as FactoryIcon,
  Lan as LineIcon,
  Person as PersonIcon,
  PersonOff as PersonOffIcon,
  Search as SearchIcon,
  Sync as SyncIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { activeTheme } from '../../theme';
import { teamManagementMembers, teamManagementStatusStyles } from '../data/teamData';
import { useShiftManagementContext } from '../contexts/ShiftManagementContext';
import { resolveInitials } from '../utils/teamUtils';

type CrewPosition = {
  id: string;
  title: string;
  employeeName: string | null;
};

type ManagedCrew = {
  id: string;
  name: string;
  pattern: string;
  line: string;
  positions: CrewPosition[];
};

type CrewEditorForm = ManagedCrew;
type CrewSetupView = 'assignment' | 'organization';
type OrgNodeType = 'Plant' | 'Department' | 'Sub-department' | 'Line / Area' | 'Job Position' | 'Employee' | 'Vacant Position';
type OrganizationScopeTab = 'scopeInfo' | 'employees' | 'teamAssignment' | 'staffingKpis' | 'history';

type OrganizationNode = {
  id: string;
  name: string;
  type: OrgNodeType;
  count?: number;
  status?: 'Active' | 'On Leave' | 'On Training' | 'Inactive' | 'Terminated' | 'Vacant';
  role?: string;
  crewPattern?: string;
  jobProfile?: string;
  costCenter?: string;
  supervisor?: string;
  directReports?: number;
  linkedAsset?: string;
  teamAssignment?: string;
  children?: OrganizationNode[];
};

type OrganizationEmployeeRow = {
  id: string;
  employeePosition: string;
  role: string;
  status: 'Active' | 'On Leave' | 'On Training' | 'Inactive' | 'Terminated' | 'Vacant';
  team: string;
  crewPattern: string;
  fte: string;
  availability: string;
  scopeIds: string[];
};

type TeamAssignmentEmployee = {
  id: string;
  name: string;
  employeeId: string;
  role: string;
  status: 'Active' | 'On Leave' | 'On Training' | 'Inactive' | 'Terminated' | 'Vacant';
  availability: string;
  fte: string;
};

type TeamAssignmentCrew = {
  id: string;
  name: string;
  pattern: string;
  target: number;
  employees: TeamAssignmentEmployee[];
  vacantPositions?: number;
};

type AssignmentAiMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

type AssignmentRecommendationStatus = 'pending' | 'accepted' | 'rejected' | 'skipped';

type AssignmentAiRecommendation = {
  id: string;
  title: string;
  actionType: string;
  employees: string[];
  sourceLabel: string;
  targetCrewId: string;
  targetLabel: string;
  assignmentType: string;
  matchScore: string;
  reasonItems: string[];
  before: { assigned: string; vacancy: string; coverage: string };
  after: { assigned: string; vacancy: string; coverage: string };
  variables: string[];
};

type OrganizationHistoryRow = {
  dateTime: string;
  source: string;
  change: string;
  scope: string;
  status: string;
};

const crewPatternOptions = ['5-Crew Rotation', '4-Crew Rotation', 'Monday-Friday Morning Pattern', 'Weekend 12h Pattern'];
const coverageStatusOptions = ['Fully Covered', 'Has Gaps', 'Empty Crew'];
const organizationRoleFilterOptions = ['All roles', 'Production Supervisor', 'Team Leader', 'Operator', 'Machine Operator', 'Technical Operator', 'Equipment Specialist', 'Skill Trainer'];
const organizationAvailabilityFilterOptions = ['All', 'Available', 'Assigned', 'Active', 'On Leave', 'On Training', 'Inactive', 'Terminated', 'Vacant'];
const organizationCrewPatternFilterOptions = ['All patterns', '5-Crew Rotation', 'Weekend Coverage', 'Night Support'];
const organizationScopeTabs: Array<{ value: OrganizationScopeTab; label: string }> = [
  { value: 'scopeInfo', label: 'Scope Info' },
  { value: 'employees', label: 'Employees' },
  { value: 'teamAssignment', label: 'Team Assignment' },
  { value: 'staffingKpis', label: 'Staffing & KPIs' },
  { value: 'history', label: 'History' },
];
const assignmentAiSuggestedPrompts = [
  'Find employees for open Operator positions',
  'Who can fill this vacancy?',
  'Suggest a temporary assignment',
  'Show candidates with no conflicts',
  'Balance teams for this scope',
  'Assign best team for Line 1 next week',
  'Who can replace Alex Brown?',
  'Find coverage for Crew C',
];
const assignmentAiSupportedPromptMatchers = [
  'find employees for open operator positions',
  'who can fill this vacancy',
  'suggest a temporary assignment',
  'show candidates with no conflicts',
  'balance teams for this scope',
  'assign best team for line 1 next week',
  'who can replace alex brown',
  'find coverage for crew c',
];
const assignmentAiVariablesConsidered = [
  'Role match',
  'Availability',
  'Current team assignment',
  'Crew pattern compatibility',
  'Skills / certifications',
  'Training status',
  'Leave status',
  'Existing workload',
  'Shift conflicts',
  'Temporary assignment window',
  'Fairness / workload balance',
];
const assignmentAiCandidateRanking = [
  { name: 'Maria Garcia', match: '94%', status: 'Active', assignment: 'Unassigned', reason: 'Role match, available, no detected conflict', eligible: true },
  { name: 'David Lee', match: '86%', status: 'Active', assignment: 'Unassigned', reason: 'Eligible for temporary move; verify Crew A coverage', eligible: true },
  { name: 'Chris Davis', match: '72%', status: 'On Training', assignment: 'Unassigned', reason: 'Backup option; may require supervisor approval', eligible: true },
  { name: 'Alex Brown', match: 'Not eligible', status: 'On Leave', assignment: 'Crew A', reason: 'Not available and not counted in FTE', eligible: false },
];
const assignmentAiRecommendations: AssignmentAiRecommendation[] = [
  {
    id: 'assign-maria-crew-c',
    title: 'Assign Maria Garcia to Crew C',
    actionType: 'Assign unassigned employee to team',
    employees: ['maria-garcia'],
    sourceLabel: 'Unassigned',
    targetCrewId: 'crew-c',
    targetLabel: 'Crew C',
    assignmentType: 'Primary assignment',
    matchScore: '94%',
    reasonItems: [
      'Role matches Operator requirement.',
      'Active and available.',
      'Currently unassigned.',
      'No detected schedule conflict.',
      'Compatible with Crew C pattern.',
    ],
    before: { assigned: '2.0 / 5', vacancy: '3.0', coverage: '40%' },
    after: { assigned: '3.0 / 5', vacancy: '2.0', coverage: '60%' },
    variables: ['Role match', 'Availability', 'Current team assignment', 'Crew pattern compatibility', 'Shift conflicts'],
  },
  {
    id: 'temporary-david-crew-c',
    title: 'Temporarily support Crew C with David Lee',
    actionType: 'Temporary assignment with start/end date',
    employees: ['david-lee'],
    sourceLabel: 'Unassigned',
    targetCrewId: 'crew-c',
    targetLabel: 'Crew C',
    assignmentType: 'Temporary support',
    matchScore: '86%',
    reasonItems: [
      'Active Operator with available local mock capacity.',
      'Temporary window can cover the selected gap.',
      'Review downstream Crew A coverage before confirming.',
    ],
    before: { assigned: '2.0 / 5', vacancy: '3.0', coverage: '40%' },
    after: { assigned: '3.0 / 5', vacancy: '2.0', coverage: '60%' },
    variables: ['Availability', 'Existing workload', 'Temporary assignment window', 'Fairness / workload balance'],
  },
  {
    id: 'trainee-backup-chris',
    title: 'Use Chris Davis as backup option',
    actionType: 'Suggest trainee as backup',
    employees: ['chris-davis'],
    sourceLabel: 'Unassigned',
    targetCrewId: 'crew-c',
    targetLabel: 'Crew C',
    assignmentType: 'Support',
    matchScore: '72%',
    reasonItems: [
      'Role aligns with Operator gap.',
      'Training status means supervisor review is recommended.',
      'Use as backup if active associates are unavailable.',
    ],
    before: { assigned: '2.0 / 5', vacancy: '3.0', coverage: '40%' },
    after: { assigned: '2.5 / 5', vacancy: '2.5', coverage: '50%' },
    variables: ['Training status', 'Supervisor review', 'Skills / certifications', 'Role match'],
  },
];
const assignmentAiNotSelectedReasons = [
  'Alex Brown - On Leave, not counted in FTE.',
  'James Wilson - Already unavailable in selected period.',
  'Chris Davis - On Training; requires supervisor review before primary assignment.',
];
const availabilityOptions = [
  { value: 'available', label: 'Available' },
  { value: 'break', label: 'On Break' },
  { value: 'lunch', label: 'On Lunch' },
  { value: 'out', label: 'Temporarily Out' },
];

const lineProductNames: Record<string, string> = {
  A: 'Nexiva',
  B: 'Alaris',
  C: 'BD Vacutainer',
  D: 'BD Insyte',
};

const defaultPositions = ['Operator', 'Technical Operator', 'Quality Inspector', 'Filling Operator', 'Line Lead', 'Material Handler'];
const crewSetupViewOptions: Array<{ value: CrewSetupView; label: string }> = [
  { value: 'assignment', label: 'Crew Assignment' },
  { value: 'organization', label: 'Organization & Workforce Assignment' },
];

const employeeStatusLegend = [
  { label: 'Active', description: 'available and counted in FTE', bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
  { label: 'On Leave', description: 'not available, not counted in FTE', bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
  { label: 'On Training', description: 'trainee or training status', bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  { label: 'Inactive', description: 'not available, not counted', bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' },
  { label: 'Terminated', description: 'excluded from planning/scheduling', bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA' },
  { label: 'Vacant', description: 'open position', bg: '#FFFBEB', color: '#92400E', border: '#FCD34D' },
] as const;

const organizationEmployeeRows: OrganizationEmployeeRow[] = [
  {
    id: 'jane-smith',
    employeePosition: 'Jane Smith',
    role: 'Operator',
    status: 'Active',
    team: 'Crew A',
    crewPattern: '5-Crew Rotation',
    fte: '1.00',
    availability: 'Available',
    scopeIds: ['plant-smartfactory', 'manufacturing', 'production', 'line-1-assembly', 'line-1-operator', 'jane-smith'],
  },
  {
    id: 'mark-johnson',
    employeePosition: 'Mark Johnson',
    role: 'Operator',
    status: 'Active',
    team: 'Crew B',
    crewPattern: '5-Crew Rotation',
    fte: '1.00',
    availability: 'Available',
    scopeIds: ['plant-smartfactory', 'manufacturing', 'production', 'line-1-assembly', 'line-1-operator', 'mark-johnson'],
  },
  {
    id: 'alex-brown',
    employeePosition: 'Alex Brown',
    role: 'Operator',
    status: 'On Leave',
    team: 'Crew A',
    crewPattern: '5-Crew Rotation',
    fte: '0.00',
    availability: 'Not available',
    scopeIds: ['plant-smartfactory', 'manufacturing', 'production', 'line-1-assembly', 'line-1-operator', 'alex-brown'],
  },
  {
    id: 'chris-davis',
    employeePosition: 'Chris Davis',
    role: 'Operator',
    status: 'On Training',
    team: 'Unassigned',
    crewPattern: '-',
    fte: '0.50',
    availability: 'Limited',
    scopeIds: ['plant-smartfactory', 'manufacturing', 'production', 'line-1-assembly', 'line-1-operator'],
  },
  {
    id: 'maria-garcia',
    employeePosition: 'Maria Garcia',
    role: 'Operator',
    status: 'Active',
    team: 'Unassigned',
    crewPattern: '-',
    fte: '1.00',
    availability: 'Available',
    scopeIds: ['plant-smartfactory', 'manufacturing', 'production', 'line-1-assembly', 'line-1-operator'],
  },
  {
    id: 'vacant-operator',
    employeePosition: 'Vacant Position',
    role: 'Operator',
    status: 'Vacant',
    team: '-',
    crewPattern: '-',
    fte: '1.00',
    availability: 'Open position',
    scopeIds: ['plant-smartfactory', 'manufacturing', 'production', 'line-1-assembly', 'line-1-operator', 'line-1-vacant-operator'],
  },
  {
    id: 'former-operator',
    employeePosition: 'Former Operator',
    role: 'Operator',
    status: 'Terminated',
    team: '-',
    crewPattern: '-',
    fte: '0.00',
    availability: 'Excluded',
    scopeIds: ['plant-smartfactory', 'manufacturing', 'production'],
  },
];

const initialTeamAssignmentUnassignedEmployees: TeamAssignmentEmployee[] = [
  { id: 'chris-davis', name: 'Chris Davis', employeeId: 'EMP-1042', role: 'Operator', status: 'On Training', availability: 'Limited', fte: '0.50' },
  { id: 'maria-garcia', name: 'Maria Garcia', employeeId: 'EMP-1188', role: 'Operator', status: 'Active', availability: 'Available', fte: '1.00' },
  { id: 'david-lee', name: 'David Lee', employeeId: 'EMP-1216', role: 'Operator', status: 'Active', availability: 'Available', fte: '1.00' },
  { id: 'james-wilson', name: 'James Wilson', employeeId: 'EMP-1235', role: 'Operator', status: 'On Leave', availability: 'Not available', fte: '0.00' },
];

const initialTeamAssignmentCrews: TeamAssignmentCrew[] = [
  {
    id: 'crew-a',
    name: 'Crew A',
    pattern: '5-Crew Rotation',
    target: 5,
    employees: [
      { id: 'jane-smith', name: 'Jane Smith', employeeId: 'EMP-1001', role: 'Operator', status: 'Active', availability: 'Available', fte: '1.00' },
      { id: 'alex-brown', name: 'Alex Brown', employeeId: 'EMP-1003', role: 'Operator', status: 'On Leave', availability: 'Not available', fte: '0.00' },
      { id: 'sara-lee', name: 'Sara Lee', employeeId: 'EMP-1097', role: 'Operator', status: 'Active', availability: 'Available', fte: '1.00' },
    ],
  },
  {
    id: 'crew-b',
    name: 'Crew B',
    pattern: 'Weekend Coverage',
    target: 5,
    employees: [
      { id: 'mark-johnson', name: 'Mark Johnson', employeeId: 'EMP-1002', role: 'Operator', status: 'Active', availability: 'Available', fte: '1.00' },
    ],
  },
  {
    id: 'crew-c',
    name: 'Crew C',
    pattern: 'Night Support',
    target: 5,
    vacantPositions: 1,
    employees: [],
  },
];

const staffingKpiCards = [
  { label: 'Target per Shift', value: '24 FTE', helper: 'required staffing for selected job position/scope', tone: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
  { label: 'Assigned FTE', value: '22.5 FTE', helper: 'active counted FTE', tone: '#0F766E', bg: '#ECFDF5', border: '#A7F3D0' },
  { label: 'Coverage %', value: '93.8%', helper: 'assigned vs target', tone: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  { label: 'Vacancy', value: '1.5 FTE', helper: 'open staffing requirement', tone: '#C2410C', bg: '#FFF7ED', border: '#FED7AA' },
  { label: 'Direct Reports', value: '24', helper: 'within selected scope', tone: '#475569', bg: '#F8FAFC', border: '#CBD5E1' },
  { label: 'Org Coverage %', value: '89.4%', helper: 'coverage across selected hierarchy', tone: '#0F766E', bg: '#ECFEFF', border: '#99F6E4' },
];

const positionLevelKpiRows = [
  { jobPosition: 'Line Leader', requiredFte: '1', assignedFte: '1', coverage: '100%', vacancy: '0', status: 'Covered', notes: 'Fully staffed for selected scope.' },
  { jobPosition: 'Shift Leader', requiredFte: '3', assignedFte: '3', coverage: '100%', vacancy: '0', status: 'Covered', notes: 'All active leaders counted in FTE.' },
  { jobPosition: 'Operator', requiredFte: '24', assignedFte: '22.5', coverage: '93.8%', vacancy: '1.5', status: 'Under target', notes: 'On Leave associates visible but not counted.' },
  { jobPosition: 'Equipment Specialist', requiredFte: '6', assignedFte: '5', coverage: '83.3%', vacancy: '1', status: 'Gap', notes: 'One open staffing requirement remains.' },
];

const organizationHistoryRows: OrganizationHistoryRow[] = [
  {
    dateTime: '2026-01-02 09:15',
    source: 'Jane Admin',
    change: 'Assigned Maria Garcia to Crew B',
    scope: 'Line 1 - Assembly > Operator',
    status: 'Completed',
  },
  {
    dateTime: '2026-01-03 10:30',
    source: 'Jane Admin',
    change: 'Moved Chris Davis from Unassigned to Crew A',
    scope: 'Line 1 - Assembly > Operator',
    status: 'Completed',
  },
  {
    dateTime: '2026-01-04 02:15',
    source: 'Workday Sync',
    change: 'Employee status updated: Alex Brown set to On Leave',
    scope: 'Operator',
    status: 'Synced',
  },
  {
    dateTime: '2026-01-05 11:00',
    source: 'Jane Admin',
    change: 'Vacant Position added to Crew C',
    scope: 'Line 1 - Assembly > Operator',
    status: 'Completed',
  },
];

const organizationTreeData: OrganizationNode = {
  id: 'plant-smartfactory',
  name: 'SmartFactory Plant',
  type: 'Plant',
  count: 187,
  jobProfile: 'Factory workforce structure',
  costCenter: 'PLANT-187',
  supervisor: 'Plant Director',
  directReports: 2,
  linkedAsset: 'BD Columbus West',
  children: [
    {
      id: 'manufacturing',
      name: 'Manufacturing',
      type: 'Department',
      count: 142,
      costCenter: 'MFG-100',
      supervisor: 'Alicia Gomez',
      directReports: 5,
      children: [
        {
          id: 'production',
          name: 'Production',
          type: 'Sub-department',
          count: 98,
          costCenter: 'PROD-200',
          supervisor: 'Marcus Lee',
          directReports: 2,
          children: [
            {
              id: 'line-1-assembly',
              name: 'Line 1 - Assembly',
              type: 'Line / Area',
              count: 28,
              costCenter: 'L1-ASM',
              supervisor: 'Nina Patel',
              directReports: 4,
              linkedAsset: 'Packaging Line 1',
              crewPattern: '5-Crew Rotation',
              teamAssignment: 'Crew A / Crew B',
              children: [
                { id: 'line-1-supervisor', name: 'Production Supervisor', type: 'Job Position', count: 1, role: 'Production Supervisor', jobProfile: 'Production Supervisor', supervisor: 'Marcus Lee', crewPattern: '5-Crew Rotation', teamAssignment: 'Crew A' },
                { id: 'line-1-team-leader', name: 'Team Leader', type: 'Job Position', count: 2, role: 'Team Leader', jobProfile: 'Team Leader', supervisor: 'Nina Patel', crewPattern: '5-Crew Rotation', teamAssignment: 'Crew A / Crew B' },
                {
                  id: 'line-1-operator',
                  name: 'Operator',
                  type: 'Job Position',
                  count: 24,
                  role: 'Operator',
                  jobProfile: 'Line Operator',
                  supervisor: 'Nina Patel',
                  crewPattern: '5-Crew Rotation',
                  teamAssignment: 'Crew A',
                  children: [
                    { id: 'jane-smith', name: 'Jane Smith', type: 'Employee', status: 'Active', role: 'Operator', jobProfile: 'Line Operator', costCenter: 'L1-ASM', supervisor: 'Nina Patel', crewPattern: '5-Crew Rotation', teamAssignment: 'Crew A' },
                    { id: 'mark-johnson', name: 'Mark Johnson', type: 'Employee', status: 'Active', role: 'Operator', jobProfile: 'Line Operator', costCenter: 'L1-ASM', supervisor: 'Nina Patel', crewPattern: '5-Crew Rotation', teamAssignment: 'Crew A' },
                    { id: 'alex-brown', name: 'Alex Brown', type: 'Employee', status: 'On Leave', role: 'Operator', jobProfile: 'Line Operator', costCenter: 'L1-ASM', supervisor: 'Nina Patel', crewPattern: '5-Crew Rotation', teamAssignment: 'Crew B' },
                    { id: 'line-1-vacant-operator', name: 'Vacant Position', type: 'Vacant Position', count: 1, status: 'Vacant', role: 'Operator', jobProfile: 'Line Operator', costCenter: 'L1-ASM', supervisor: 'Nina Patel', crewPattern: '5-Crew Rotation', teamAssignment: 'Crew A' },
                  ],
                },
              ],
            },
            { id: 'line-2-assembly', name: 'Line 2 - Assembly', type: 'Line / Area', count: 30, supervisor: 'Oliver Chen', linkedAsset: 'Packaging Line 2', crewPattern: 'Weekend Coverage', teamAssignment: 'Crew C' },
          ],
        },
        { id: 'maintenance', name: 'Maintenance', type: 'Department', count: 22, role: 'Equipment Specialist', supervisor: 'Diego Marin', linkedAsset: 'Maintenance Area' },
        { id: 'quality', name: 'Quality', type: 'Department', count: 22, role: 'Technical Operator', supervisor: 'Sarah Connor', linkedAsset: 'Quality Lab' },
        { id: 'support', name: 'Support', type: 'Department', count: 27, supervisor: 'Priya Rao' },
        { id: 'warehouse', name: 'Warehouse', type: 'Line / Area', count: 18, role: 'Machine Operator', supervisor: 'Noah Perez', crewPattern: 'Night Support' },
      ],
    },
    {
      id: 'hr',
      name: 'HR',
      type: 'Department',
      count: 8,
      supervisor: 'Maya Singh',
      children: [
        { id: 'hrbp', name: 'HRBP', type: 'Job Position', role: 'HRBP', supervisor: 'Maya Singh' },
        { id: 'skill-trainer', name: 'Skill Trainer', type: 'Job Position', role: 'Skill Trainer', status: 'On Training', supervisor: 'Maya Singh' },
      ],
    },
  ],
};

const crewSetupPanelSx = {
  borderRadius: 2.5,
  border: '1px solid #D8E1EF',
  bgcolor: '#FFFFFF',
};

const crewSetupMetaLabelSx = {
  color: '#94A3B8',
  fontWeight: 900,
  textTransform: 'uppercase',
  fontSize: '0.58rem',
  lineHeight: 1,
};

const createPositions = (assignments: Array<string | null>): CrewPosition[] =>
  defaultPositions.map((title, index) => ({
    id: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index}`,
    title,
    employeeName: assignments[index] ?? null,
  }));

const findOrganizationNodePath = (
  node: OrganizationNode,
  targetId: string,
  path: OrganizationNode[] = [],
): OrganizationNode[] | null => {
  const nextPath = [...path, node];
  if (node.id === targetId) return nextPath;
  for (const child of node.children ?? []) {
    const childPath = findOrganizationNodePath(child, targetId, nextPath);
    if (childPath) return childPath;
  }
  return null;
};

const organizationNodeMatches = (
  node: OrganizationNode,
  search: string,
  roleFilter: string,
  availabilityFilter: string,
  crewPatternFilter: string,
) => {
  const normalizedSearch = search.trim().toLowerCase();
  const searchHaystack = [
    node.name,
    node.type,
    node.status,
    node.role,
    node.crewPattern,
    node.jobProfile,
    node.costCenter,
    node.supervisor,
    node.linkedAsset,
    node.teamAssignment,
  ].filter(Boolean).join(' ').toLowerCase();
  const matchesSearch = !normalizedSearch || searchHaystack.includes(normalizedSearch);
  const matchesRole = roleFilter === 'All roles' || node.role === roleFilter || node.name === roleFilter;
  const matchesPattern = crewPatternFilter === 'All patterns' || node.crewPattern === crewPatternFilter;
  const matchesAvailability = availabilityFilter === 'All'
    || node.status === availabilityFilter
    || (availabilityFilter === 'Available' && node.status === 'Active')
    || (availabilityFilter === 'Assigned' && Boolean(node.teamAssignment || node.type === 'Employee'));
  return matchesSearch && matchesRole && matchesPattern && matchesAvailability;
};

const filterOrganizationTree = (
  node: OrganizationNode,
  search: string,
  roleFilter: string,
  availabilityFilter: string,
  crewPatternFilter: string,
): OrganizationNode | null => {
  const filteredChildren = (node.children ?? [])
    .map((child) => filterOrganizationTree(child, search, roleFilter, availabilityFilter, crewPatternFilter))
    .filter(Boolean) as OrganizationNode[];
  if (organizationNodeMatches(node, search, roleFilter, availabilityFilter, crewPatternFilter) || filteredChildren.length > 0) {
    return { ...node, children: filteredChildren };
  }
  return null;
};

const getMockAssignmentAiResponse = (prompt: string) => {
  const normalizedPrompt = prompt.toLowerCase();
  const isSupportedPrompt = assignmentAiSupportedPromptMatchers.some((matcher) => normalizedPrompt.includes(matcher));
  if (!isSupportedPrompt && !normalizedPrompt.includes('assign maria')) {
    return 'I can help with open positions, candidate ranking, temporary moves, replacement search, and team balancing for this selected scope.';
  }
  if (normalizedPrompt.includes('who') || normalizedPrompt.includes('vacancy')) {
    return 'I found 3 candidates for the Operator vacancy in Line 1 - Assembly. Maria Garcia is the strongest match because she is active, unassigned, and has no detected conflict. Review the recommendations below.';
  }
  if (normalizedPrompt.includes('temporary')) {
    return 'I prepared a temporary assignment recommendation for review. The strongest local option is using David Lee as support for Crew C during the selected period.';
  }
  if (normalizedPrompt.includes('conflict')) {
    return 'Maria Garcia and David Lee have no local mock conflicts in this scope. I prepared recommendations so you can preview impact before applying anything.';
  }
  if (normalizedPrompt.includes('balance')) {
    return 'Crew C has the clearest staffing pressure. I prepared reviewable recommendations that prioritize active unassigned Operators before moving people from covered crews.';
  }
  if (normalizedPrompt.includes('alex brown') || normalizedPrompt.includes('replace')) {
    return 'Alex Brown is on leave and not counted in FTE coverage. I prepared replacement recommendations using active or training-status Operators for review.';
  }
  if (normalizedPrompt.includes('crew c') || normalizedPrompt.includes('line 1 next week')) {
    return 'I prepared Crew C coverage recommendations for Line 1 using the selected scope, vacancy count, role fit, and current team availability.';
  }
  if (normalizedPrompt.includes('assign maria')) {
    return 'I prepared this assignment for review. It will not be applied until you explicitly accept or apply the recommendation.';
  }
  return 'I found 3 potential assignment options for the Operator gap. Maria Garcia is the strongest match because she is active, unassigned, and has no detected schedule conflict. Review the recommendations below.';
};

const initialManagedCrews: ManagedCrew[] = [
  { id: 'crew-a', name: 'Crew A', pattern: '5-Crew Rotation', line: 'A', positions: createPositions(["Ronie D'elano", 'Daniel Brooks', 'Maria Pinna', null, 'William Parker', 'Nina Patel']) },
  { id: 'crew-b', name: 'Crew B', pattern: '5-Crew Rotation', line: 'B', positions: createPositions(['James Walker', 'Michael Thompson', 'Sarah Connor', null, 'Carlos Mendez', null]) },
  { id: 'crew-c', name: 'Crew C', pattern: '5-Crew Rotation', line: 'C', positions: createPositions(['Olivia Bennett', 'Diego Marin', null, 'Omar Khan', null, null]) },
  { id: 'crew-d', name: 'Crew D', pattern: '4-Crew Rotation', line: 'D', positions: createPositions([null, null, null, null, null, null]) },
  { id: 'crew-e', name: 'Crew E', pattern: 'Weekend 12h Pattern', line: 'A', positions: createPositions(['Sophia Mitchell', 'Emily Carter', null, 'Carlos Mendez', null, null]) },
];

const emptyCrewEditorForm: CrewEditorForm = {
  id: '',
  name: '',
  pattern: '5-Crew Rotation',
  line: 'A',
  positions: createPositions([null, null, null, null, null, null]),
};

const ShiftTeamManagementScreen: React.FC = () => {
  const {
    teamManagement: {
      teamManagementSearch,
      setTeamManagementSearch,
      teamManagementFilters,
      setTeamManagementFilters,
      setSelectedTeamManagementMemberName,
    },
    renderShiftSchedulePersistentActions,
  } = useShiftManagementContext();

  const [managedCrews, setManagedCrews] = React.useState<ManagedCrew[]>(initialManagedCrews);
  const [crewSetupView, setCrewSetupView] = React.useState<CrewSetupView>('organization');
  const [isCrewEditorOpen, setIsCrewEditorOpen] = React.useState(false);
  const [crewEditorForm, setCrewEditorForm] = React.useState<CrewEditorForm>(emptyCrewEditorForm);
  const [organizationSearch, setOrganizationSearch] = React.useState('');
  const [selectedOrganizationNodeId, setSelectedOrganizationNodeId] = React.useState('line-1-operator');
  const [expandedOrganizationNodeIds, setExpandedOrganizationNodeIds] = React.useState<Set<string>>(() => new Set(['plant-smartfactory', 'manufacturing', 'production', 'line-1-assembly', 'line-1-operator']));
  const [organizationRoleFilter, setOrganizationRoleFilter] = React.useState('All roles');
  const [organizationAvailabilityFilter, setOrganizationAvailabilityFilter] = React.useState('All');
  const [organizationCrewPatternFilter, setOrganizationCrewPatternFilter] = React.useState('All patterns');
  const [selectedOrganizationScopeTab, setSelectedOrganizationScopeTab] = React.useState<OrganizationScopeTab>('scopeInfo');
  const [teamAssignmentUnassignedEmployees, setTeamAssignmentUnassignedEmployees] = React.useState<TeamAssignmentEmployee[]>(initialTeamAssignmentUnassignedEmployees);
  const [teamAssignmentCrews, setTeamAssignmentCrews] = React.useState<TeamAssignmentCrew[]>(initialTeamAssignmentCrews);
  const [teamAssignmentSearch, setTeamAssignmentSearch] = React.useState('');
  const [teamAssignmentRoleFilter, setTeamAssignmentRoleFilter] = React.useState('All roles');
  const [teamAssignmentAvailabilityFilter, setTeamAssignmentAvailabilityFilter] = React.useState('All');
  const [selectedTeamAssignmentEmployeeIds, setSelectedTeamAssignmentEmployeeIds] = React.useState<string[]>([]);
  const [draggedTeamAssignmentEmployeeIds, setDraggedTeamAssignmentEmployeeIds] = React.useState<string[]>([]);
  const [dragOverTeamAssignmentCrewId, setDragOverTeamAssignmentCrewId] = React.useState<string | null>(null);
  const [teamAssignmentInlineMessage, setTeamAssignmentInlineMessage] = React.useState('');
  const [organizationTreeWidth, setOrganizationTreeWidth] = React.useState(340);
  const [isOrganizationTreeCollapsed, setIsOrganizationTreeCollapsed] = React.useState(false);
  const [restoreTreeAfterAiClose, setRestoreTreeAfterAiClose] = React.useState(false);
  const [isAssignmentAiOpen, setIsAssignmentAiOpen] = React.useState(false);
  const [assignmentAiInput, setAssignmentAiInput] = React.useState('');
  const [selectedAssignmentRecommendationIndex, setSelectedAssignmentRecommendationIndex] = React.useState(0);
  const [previewedAssignmentRecommendationId, setPreviewedAssignmentRecommendationId] = React.useState<string | null>(null);
  const [assignmentAiReviewMessage, setAssignmentAiReviewMessage] = React.useState('');
  const [isAssignmentRecommendationFlowVisible, setIsAssignmentRecommendationFlowVisible] = React.useState(false);
  const [assignmentAiConversationStep, setAssignmentAiConversationStep] = React.useState(0);
  const [pendingAssignmentApplyIds, setPendingAssignmentApplyIds] = React.useState<string[]>([]);
  const [selectedAssignmentRecommendationIds, setSelectedAssignmentRecommendationIds] = React.useState<string[]>([]);
  const [assignmentRecommendationStatuses, setAssignmentRecommendationStatuses] = React.useState<Record<string, AssignmentRecommendationStatus>>({});
  const [successHighlightedCrewId, setSuccessHighlightedCrewId] = React.useState<string | null>(null);
  const [appliedAssignmentCount, setAppliedAssignmentCount] = React.useState(0);
  const [localOrganizationHistoryRows, setLocalOrganizationHistoryRows] = React.useState<OrganizationHistoryRow[]>(organizationHistoryRows);
  const [assignmentAiMessages, setAssignmentAiMessages] = React.useState<AssignmentAiMessage[]>([
    {
      id: 'assistant-initial',
      role: 'assistant',
      text: "I can help find employees for the open Operator positions in Line 1 - Assembly. I'll consider role fit, availability, current team assignment, training status, leave status, and scheduling conflicts.",
    },
  ]);
  const [organizationSyncTimestamp, setOrganizationSyncTimestamp] = React.useState('May 21, 2025 02:15 AM');
  const [organizationSyncMessage, setOrganizationSyncMessage] = React.useState('');
  const crewSetupFilters = teamManagementFilters as Record<string, string | undefined>;
  const filterValue = React.useCallback((key: string) => crewSetupFilters[key] ?? 'All', [crewSetupFilters]);

  const memberLookup = React.useMemo(
    () => new Map(teamManagementMembers.map((member) => [member.name, member])),
    [],
  );

  const filteredMembers = React.useMemo(
    () => teamManagementMembers.filter((member) => {
      const search = teamManagementSearch.trim().toLowerCase();
      const matchesSearch = !search
        || member.name.toLowerCase().includes(search)
        || member.role.toLowerCase().includes(search)
        || member.certification.toLowerCase().includes(search);
      const matchesAvailability = filterValue('availability') === 'All' || member.status === filterValue('availability');
      return matchesSearch && matchesAvailability;
    }),
    [filterValue, teamManagementSearch],
  );

  const visibleCrews = React.useMemo(
    () => managedCrews.map((crew) => {
      const filledPositions = crew.positions.filter((position) => position.employeeName);
      const assignedMembers = filledPositions
        .map((position) => position.employeeName ? memberLookup.get(position.employeeName) : null)
        .filter(Boolean) as typeof teamManagementMembers;
      return {
        ...crew,
        positions: crew.positions,
        assignedMembers,
        emptyCount: crew.positions.filter((position) => !position.employeeName).length,
        availableCount: assignedMembers.filter((member) => member.status === 'available').length,
      };
    }).filter((crew) => {
      const coverageStatus = crew.emptyCount === 0 ? 'Fully Covered' : crew.assignedMembers.length === 0 ? 'Empty Crew' : 'Has Gaps';
      const matchesPattern = filterValue('crewPattern') === 'All' || crew.pattern === filterValue('crewPattern');
      const matchesAreaLine = filterValue('areaLine') === 'All' || crew.line === filterValue('areaLine');
      const matchesCoverage = filterValue('coverageStatus') === 'All' || coverageStatus === filterValue('coverageStatus');
      const matchesPosition = filterValue('positionType') === 'All' || crew.positions.some((position) => position.title === filterValue('positionType'));
      const matchesAvailability = filterValue('availability') === 'All' || crew.assignedMembers.some((member) => member.status === filterValue('availability'));
      return matchesPattern && matchesAreaLine && matchesCoverage && matchesPosition && matchesAvailability;
    }),
    [filterValue, managedCrews, memberLookup],
  );

  const totalCrews = visibleCrews.length;
  const totalPositions = visibleCrews.reduce((sum, crew) => sum + crew.positions.length, 0);
  const emptyPositions = visibleCrews.reduce((sum, crew) => sum + crew.emptyCount, 0);
  const availableEmployees = filteredMembers.filter((member) => member.status === 'available').length;

  const openCreateCrewDrawer = React.useCallback(() => {
    setCrewEditorForm({
      ...emptyCrewEditorForm,
      id: '',
      name: `Crew ${String.fromCharCode(65 + managedCrews.length)}`,
      positions: createPositions([null, null, null, null, null, null]),
    });
    setIsCrewEditorOpen(true);
  }, [managedCrews.length]);

  const openEditCrewDrawer = React.useCallback((crew: ManagedCrew) => {
    setCrewEditorForm(structuredClone(crew));
    setIsCrewEditorOpen(true);
  }, []);

  const updatePosition = React.useCallback((positionId: string, employeeName: string) => {
    setCrewEditorForm((prev) => ({
      ...prev,
      positions: prev.positions.map((position) => (
        position.id === positionId
          ? { ...position, employeeName: employeeName === '__empty__' ? null : employeeName }
          : position
      )),
    }));
  }, []);

  const saveCrew = React.useCallback(() => {
    const nextCrew: ManagedCrew = {
      ...crewEditorForm,
      id: crewEditorForm.id || `crew-${Date.now()}`,
      name: crewEditorForm.name.trim() || `Crew ${crewEditorForm.line}`,
    };
    setManagedCrews((prev) => (
      crewEditorForm.id
        ? prev.map((crew) => (crew.id === crewEditorForm.id ? nextCrew : crew))
        : [...prev, nextCrew]
    ));
    setIsCrewEditorOpen(false);
  }, [crewEditorForm]);

  const organizationFiltersActive = Boolean(organizationSearch.trim())
    || organizationRoleFilter !== 'All roles'
    || organizationAvailabilityFilter !== 'All'
    || organizationCrewPatternFilter !== 'All patterns';
  const filteredOrganizationTree = React.useMemo(
    () => filterOrganizationTree(organizationTreeData, organizationSearch, organizationRoleFilter, organizationAvailabilityFilter, organizationCrewPatternFilter) ?? organizationTreeData,
    [organizationAvailabilityFilter, organizationCrewPatternFilter, organizationRoleFilter, organizationSearch],
  );
  const selectedOrganizationPath = React.useMemo(
    () => findOrganizationNodePath(organizationTreeData, selectedOrganizationNodeId) ?? [organizationTreeData],
    [selectedOrganizationNodeId],
  );
  const selectedOrganizationNode = selectedOrganizationPath[selectedOrganizationPath.length - 1] ?? organizationTreeData;
  const selectedOrganizationPathLabel = selectedOrganizationPath.map((node) => node.name).join(' > ');
  const selectedScopeEmployeeRows = React.useMemo(() => (
    organizationEmployeeRows.filter((row) => {
      const scopeMatch = selectedOrganizationNode.id === 'plant-smartfactory' || row.scopeIds.includes(selectedOrganizationNode.id);
      const roleMatch = organizationRoleFilter === 'All roles' || row.role === organizationRoleFilter || row.employeePosition === organizationRoleFilter;
      const availabilityMatch = organizationAvailabilityFilter === 'All'
        || row.status === organizationAvailabilityFilter
        || row.availability === organizationAvailabilityFilter
        || (organizationAvailabilityFilter === 'Available' && row.availability === 'Available')
        || (organizationAvailabilityFilter === 'Assigned' && row.team !== 'Unassigned' && row.team !== '-');
      const patternMatch = organizationCrewPatternFilter === 'All patterns' || row.crewPattern === organizationCrewPatternFilter;
      const search = organizationSearch.trim().toLowerCase();
      const searchMatch = !search || [row.employeePosition, row.role, row.status, row.team, row.crewPattern, row.availability].join(' ').toLowerCase().includes(search);
      return scopeMatch && roleMatch && availabilityMatch && patternMatch && searchMatch;
    })
  ), [organizationAvailabilityFilter, organizationCrewPatternFilter, organizationRoleFilter, organizationSearch, selectedOrganizationNode.id]);
  const employeeFteCount = selectedScopeEmployeeRows.reduce((sum, row) => sum + Number(row.fte), 0);
  const filterTeamAssignmentEmployees = React.useCallback((employees: TeamAssignmentEmployee[]) => {
    const search = teamAssignmentSearch.trim().toLowerCase();
    return employees.filter((employee) => {
      const searchMatch = !search || [employee.name, employee.employeeId, employee.role, employee.status, employee.availability].join(' ').toLowerCase().includes(search);
      const roleMatch = teamAssignmentRoleFilter === 'All roles' || employee.role === teamAssignmentRoleFilter;
      const availabilityMatch = teamAssignmentAvailabilityFilter === 'All'
        || employee.status === teamAssignmentAvailabilityFilter
        || employee.availability === teamAssignmentAvailabilityFilter
        || (teamAssignmentAvailabilityFilter === 'Available' && employee.availability === 'Available');
      return searchMatch && roleMatch && availabilityMatch;
    });
  }, [teamAssignmentAvailabilityFilter, teamAssignmentRoleFilter, teamAssignmentSearch]);
  const visibleTeamAssignmentUnassignedEmployees = React.useMemo(
    () => filterTeamAssignmentEmployees(teamAssignmentUnassignedEmployees),
    [filterTeamAssignmentEmployees, teamAssignmentUnassignedEmployees],
  );
  const toggleTeamAssignmentEmployeeSelection = React.useCallback((employeeId: string) => {
    setSelectedTeamAssignmentEmployeeIds((prev) => (
      prev.includes(employeeId) ? prev.filter((id) => id !== employeeId) : [...prev, employeeId]
    ));
  }, []);
  const unassignEmployeeFromCrew = React.useCallback((employee: TeamAssignmentEmployee) => {
    if (employee.status === 'Terminated') return;
    setTeamAssignmentCrews((prev) => prev.map((crew) => ({ ...crew, employees: crew.employees.filter((item) => item.id !== employee.id) })));
    setTeamAssignmentUnassignedEmployees((prev) => prev.some((item) => item.id === employee.id) ? prev : [...prev, employee]);
  }, []);
  const moveTeamAssignmentEmployeesToCrew = React.useCallback((employeeIds: string[], targetCrewId: string) => {
    const requestedIds = new Set(employeeIds);
    const employeesToMove = [
      ...teamAssignmentUnassignedEmployees.filter((employee) => requestedIds.has(employee.id)),
      ...teamAssignmentCrews.flatMap((crew) => crew.employees.filter((employee) => requestedIds.has(employee.id))),
    ];
    const eligibleEmployees = employeesToMove.filter((employee) => employee.status !== 'Terminated');
    if (!eligibleEmployees.length) {
      setTeamAssignmentInlineMessage('No eligible employees were moved.');
      return;
    }

    const eligibleIds = new Set(eligibleEmployees.map((employee) => employee.id));
    setTeamAssignmentUnassignedEmployees((prev) => prev.filter((employee) => !eligibleIds.has(employee.id)));
    setTeamAssignmentCrews((prev) => prev.map((crew) => ({
      ...crew,
      employees: crew.id === targetCrewId
        ? [
          ...crew.employees.filter((employee) => !eligibleIds.has(employee.id)),
          ...eligibleEmployees,
        ]
        : crew.employees.filter((employee) => !eligibleIds.has(employee.id)),
    })));
    setSelectedTeamAssignmentEmployeeIds((prev) => prev.filter((id) => !eligibleIds.has(id)));
    setTeamAssignmentInlineMessage(
      eligibleEmployees.length === employeesToMove.length
        ? `${eligibleEmployees.length} employee${eligibleEmployees.length === 1 ? '' : 's'} moved locally.`
        : `${eligibleEmployees.length} eligible employee${eligibleEmployees.length === 1 ? '' : 's'} moved; ineligible cards stayed in place.`,
    );
  }, [teamAssignmentCrews, teamAssignmentUnassignedEmployees]);
  const handleTeamAssignmentDragStart = React.useCallback((
    event: React.DragEvent<HTMLElement>,
    employee: TeamAssignmentEmployee,
    sourceCrewId?: string,
  ) => {
    if (employee.status === 'Terminated') {
      event.preventDefault();
      return;
    }
    const draggedIds = !sourceCrewId && selectedTeamAssignmentEmployeeIds.includes(employee.id) && selectedTeamAssignmentEmployeeIds.length > 1
      ? selectedTeamAssignmentEmployeeIds
      : [employee.id];
    setDraggedTeamAssignmentEmployeeIds(draggedIds);
    setTeamAssignmentInlineMessage(draggedIds.length > 1 ? `${draggedIds.length} selected employees ready to move.` : '');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', draggedIds.join(','));
  }, [selectedTeamAssignmentEmployeeIds]);
  const handleTeamAssignmentDrop = React.useCallback((event: React.DragEvent<HTMLElement>, targetCrewId: string) => {
    event.preventDefault();
    const dataTransferIds = event.dataTransfer.getData('text/plain').split(',').filter(Boolean);
    const employeeIds = draggedTeamAssignmentEmployeeIds.length ? draggedTeamAssignmentEmployeeIds : dataTransferIds;
    if (employeeIds.length) {
      moveTeamAssignmentEmployeesToCrew(employeeIds, targetCrewId);
    }
    setDraggedTeamAssignmentEmployeeIds([]);
    setDragOverTeamAssignmentCrewId(null);
  }, [draggedTeamAssignmentEmployeeIds, moveTeamAssignmentEmployeesToCrew]);
  const clearTeamAssignmentDragState = React.useCallback(() => {
    setDraggedTeamAssignmentEmployeeIds([]);
    setDragOverTeamAssignmentCrewId(null);
  }, []);
  const startOrganizationSplitterResize = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = organizationTreeWidth;
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const nextWidth = Math.min(520, Math.max(240, startWidth + moveEvent.clientX - startX));
      setOrganizationTreeWidth(nextWidth);
    };
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [organizationTreeWidth]);
  const openAssignmentAiAssistant = React.useCallback(() => {
    setIsAssignmentAiOpen(true);
    if (!isOrganizationTreeCollapsed) {
      setRestoreTreeAfterAiClose(true);
      setIsOrganizationTreeCollapsed(true);
    }
  }, [isOrganizationTreeCollapsed]);
  const closeAssignmentAiAssistant = React.useCallback(() => {
    setIsAssignmentAiOpen(false);
    if (restoreTreeAfterAiClose) {
      setIsOrganizationTreeCollapsed(false);
      setRestoreTreeAfterAiClose(false);
    }
  }, [restoreTreeAfterAiClose]);
  const toggleOrganizationTreeCollapsed = React.useCallback(() => {
    setRestoreTreeAfterAiClose(false);
    setIsOrganizationTreeCollapsed((prev) => !prev);
  }, []);
  const sendAssignmentAiMessage = React.useCallback((message: string) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;
    const timestamp = Date.now();
    const normalizedMessage = trimmedMessage.toLowerCase();
    const isSupportedPrompt = assignmentAiSupportedPromptMatchers.some((matcher) => normalizedMessage.includes(matcher)) || normalizedMessage.includes('assign maria');
    const hasUsefulScope = selectedOrganizationNode.type === 'Job Position'
      || selectedOrganizationNode.type === 'Vacant Position'
      || selectedOrganizationNode.name.includes('Line 1')
      || selectedOrganizationNode.name === 'Operator';
    const hasOpenPositionContext = selectedOrganizationNode.name === 'Operator'
      || selectedOrganizationNode.type === 'Vacant Position'
      || selectedScopeEmployeeRows.some((row) => row.status === 'Vacant' || row.status === 'On Leave');
    const assistantText = !hasUsefulScope
      ? 'Select an organization scope or job position to generate assignment recommendations.'
      : !hasOpenPositionContext
        ? 'This scope does not have open positions in the current mock data. Try selecting a job position or team assignment scope.'
        : getMockAssignmentAiResponse(trimmedMessage);
    setAssignmentAiMessages((prev) => [
      ...prev,
      { id: `user-${timestamp}`, role: 'user', text: trimmedMessage },
      { id: `assistant-${timestamp}`, role: 'assistant', text: assistantText },
    ]);
    if (isSupportedPrompt && hasUsefulScope && hasOpenPositionContext) {
      setIsAssignmentRecommendationFlowVisible(true);
      setAssignmentAiConversationStep(4);
      setSelectedAssignmentRecommendationIndex(normalizedMessage.includes('temporary') ? 1 : normalizedMessage.includes('training') ? 2 : 0);
      setAssignmentAiReviewMessage('Chat generated reviewable recommendations. Preview or accept them explicitly before changing assignments.');
    } else if (!isSupportedPrompt) {
      setAssignmentAiReviewMessage('');
    }
    setAssignmentAiInput('');
  }, [selectedOrganizationNode.name, selectedOrganizationNode.type, selectedScopeEmployeeRows]);
  const selectedAssignmentRecommendation = assignmentAiRecommendations[selectedAssignmentRecommendationIndex] ?? assignmentAiRecommendations[0];
  const previewedAssignmentRecommendation = assignmentAiRecommendations.find((recommendation) => recommendation.id === previewedAssignmentRecommendationId) ?? null;
  const previewedAssignmentEmployeeIds = previewedAssignmentRecommendation?.employees ?? [];
  const previewedAssignmentTargetCrewId = previewedAssignmentRecommendation?.targetCrewId ?? null;
  const previewAssignmentRecommendation = React.useCallback((recommendation: AssignmentAiRecommendation) => {
    setPreviewedAssignmentRecommendationId(recommendation.id);
    setAssignmentAiReviewMessage('Preview highlights source employee and target team only. No assignment has been applied.');
  }, []);
  const clearAssignmentRecommendationPreview = React.useCallback((message = '') => {
    setPreviewedAssignmentRecommendationId(null);
    setAssignmentAiReviewMessage(message);
  }, []);
  const goToAssignmentRecommendation = React.useCallback((direction: -1 | 1) => {
    setSelectedAssignmentRecommendationIndex((prev) => Math.min(assignmentAiRecommendations.length - 1, Math.max(0, prev + direction)));
    setPreviewedAssignmentRecommendationId(null);
    setAssignmentAiReviewMessage('');
  }, []);
  const advanceToNextPendingRecommendation = React.useCallback((updatedStatuses: Record<string, AssignmentRecommendationStatus>) => {
    const nextPendingIndex = assignmentAiRecommendations.findIndex((recommendation, index) => (
      index > selectedAssignmentRecommendationIndex && (updatedStatuses[recommendation.id] ?? 'pending') === 'pending'
    ));
    if (nextPendingIndex >= 0) {
      setSelectedAssignmentRecommendationIndex(nextPendingIndex);
    }
  }, [selectedAssignmentRecommendationIndex]);
  const applyAssignmentRecommendations = React.useCallback((recommendationsToApply: AssignmentAiRecommendation[], modeLabel: string) => {
    const appliedEmployeeIds = new Set<string>();
    const appliedRecords: Array<{ recommendation: AssignmentAiRecommendation; employees: TeamAssignmentEmployee[] }> = [];
    const skippedRecommendationIds: string[] = [];
    const allEmployees = [
      ...teamAssignmentUnassignedEmployees,
      ...teamAssignmentCrews.flatMap((crew) => crew.employees),
    ];
    const employeeLookup = new Map(allEmployees.map((employee) => [employee.id, employee]));

    recommendationsToApply.forEach((recommendation) => {
      const recommendationEmployees = recommendation.employees
        .map((employeeId) => employeeLookup.get(employeeId))
        .filter(Boolean) as TeamAssignmentEmployee[];
      const hasConflict = recommendation.employees.some((employeeId) => appliedEmployeeIds.has(employeeId));
      const eligibleEmployees = recommendationEmployees.filter((employee) => employee.status !== 'On Leave' && employee.status !== 'Terminated');
      if (hasConflict || !eligibleEmployees.length) {
        skippedRecommendationIds.push(recommendation.id);
        return;
      }
      eligibleEmployees.forEach((employee) => appliedEmployeeIds.add(employee.id));
      appliedRecords.push({ recommendation, employees: eligibleEmployees });
    });

    if (!appliedRecords.length) {
      setAssignmentAiReviewMessage(`${modeLabel}: no eligible recommendations were applied.`);
      if (skippedRecommendationIds.length) {
        setAssignmentRecommendationStatuses((prev) => ({
          ...prev,
          ...Object.fromEntries(skippedRecommendationIds.map((id) => [id, 'skipped' as AssignmentRecommendationStatus])),
        }));
      }
      return;
    }

    setTeamAssignmentUnassignedEmployees((prev) => prev.filter((employee) => !appliedEmployeeIds.has(employee.id)));
    setTeamAssignmentCrews((prev) => prev.map((crew) => {
      const employeesWithoutApplied = crew.employees.filter((employee) => !appliedEmployeeIds.has(employee.id));
      const employeesForCrew = appliedRecords
        .filter((record) => record.recommendation.targetCrewId === crew.id)
        .flatMap((record) => record.employees);
      return {
        ...crew,
        employees: employeesForCrew.length ? [...employeesWithoutApplied, ...employeesForCrew] : employeesWithoutApplied,
      };
    }));
    setSelectedTeamAssignmentEmployeeIds((prev) => prev.filter((id) => !appliedEmployeeIds.has(id)));
    setPreviewedAssignmentRecommendationId(null);
    setAppliedAssignmentCount((prev) => prev + appliedRecords.reduce((sum, record) => sum + record.employees.length, 0));

    const appliedStatusEntries = appliedRecords.map((record) => [record.recommendation.id, 'accepted' as AssignmentRecommendationStatus]);
    const skippedStatusEntries = skippedRecommendationIds.map((id) => [id, 'skipped' as AssignmentRecommendationStatus]);
    const nextStatuses = {
      ...assignmentRecommendationStatuses,
      ...Object.fromEntries([...appliedStatusEntries, ...skippedStatusEntries]),
    };
    setAssignmentRecommendationStatuses(nextStatuses);
    setSelectedAssignmentRecommendationIds((prev) => prev.filter((id) => !nextStatuses[id] || nextStatuses[id] === 'pending'));
    setSuccessHighlightedCrewId(appliedRecords[0]?.recommendation.targetCrewId ?? null);
    window.setTimeout(() => setSuccessHighlightedCrewId(null), 900);
    setLocalOrganizationHistoryRows((prev) => [
      ...appliedRecords.map((record) => ({
        dateTime: '2026-07-07 14:30',
        source: 'AI-assisted recommendation',
        change: `Assigned ${record.employees.map((employee) => employee.name).join(', ')} to ${record.recommendation.targetLabel}`,
        scope: selectedOrganizationPathLabel,
        status: 'Accepted',
      })),
      ...prev,
    ]);
    setAssignmentAiReviewMessage(`${modeLabel}: applied ${appliedRecords.length} recommendation${appliedRecords.length === 1 ? '' : 's'} locally${skippedRecommendationIds.length ? `; skipped ${skippedRecommendationIds.length} conflict/review item${skippedRecommendationIds.length === 1 ? '' : 's'}.` : '.'}`);
    advanceToNextPendingRecommendation(nextStatuses);
  }, [advanceToNextPendingRecommendation, assignmentRecommendationStatuses, selectedOrganizationPathLabel, teamAssignmentCrews, teamAssignmentUnassignedEmployees]);
  const rejectAssignmentRecommendation = React.useCallback((recommendation: AssignmentAiRecommendation) => {
    const nextStatuses = { ...assignmentRecommendationStatuses, [recommendation.id]: 'rejected' as AssignmentRecommendationStatus };
    setAssignmentRecommendationStatuses(nextStatuses);
    setPreviewedAssignmentRecommendationId(null);
    setSelectedAssignmentRecommendationIds((prev) => prev.filter((id) => id !== recommendation.id));
    setAssignmentAiReviewMessage('Recommendation rejected. No assignment state changed.');
    advanceToNextPendingRecommendation(nextStatuses);
  }, [advanceToNextPendingRecommendation, assignmentRecommendationStatuses]);
  const toggleSelectedAssignmentRecommendation = React.useCallback((recommendationId: string) => {
    setSelectedAssignmentRecommendationIds((prev) => (
      prev.includes(recommendationId) ? prev.filter((id) => id !== recommendationId) : [...prev, recommendationId]
    ));
  }, []);
  const selectedOrganizationParent = selectedOrganizationPath.length > 1 ? selectedOrganizationPath[selectedOrganizationPath.length - 2] : null;
  const selectedOrganizationChildCount = selectedOrganizationNode.children?.length ?? 0;
  const selectedOrganizationEmployeeRow = organizationEmployeeRows.find((row) => row.scopeIds.includes(selectedOrganizationNode.id) || row.employeePosition === selectedOrganizationNode.name);
  const assignmentAiContextChips = [
    ['Scope', selectedOrganizationNode.name === 'Operator' ? 'Line 1 - Assembly > Operator' : selectedOrganizationPathLabel],
    ['Role', selectedOrganizationNode.role ?? selectedOrganizationNode.jobProfile ?? (selectedOrganizationNode.type === 'Job Position' ? selectedOrganizationNode.name : undefined)],
    ['Vacancy', selectedOrganizationNode.name === 'Operator' ? '1.5 FTE' : selectedScopeEmployeeRows.some((row) => row.status === 'Vacant') ? 'Open position' : undefined],
    ['Target', selectedOrganizationNode.name === 'Operator' ? '24 FTE' : selectedOrganizationNode.count !== undefined ? `${selectedOrganizationNode.count} FTE` : undefined],
    ['Assigned', selectedOrganizationNode.name === 'Operator' ? '22.5 FTE' : selectedScopeEmployeeRows.length ? `${employeeFteCount.toFixed(1)} FTE` : undefined],
    ['Crew Pattern', selectedOrganizationNode.crewPattern ?? selectedOrganizationEmployeeRow?.crewPattern],
    ['Period', 'Jan 2027'],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));
  const visibleStaffingKpiCards = staffingKpiCards.map((card) => {
    if (!appliedAssignmentCount) return card;
    if (card.label === 'Assigned FTE') {
      return { ...card, value: `${(22.5 + appliedAssignmentCount).toFixed(1)} FTE`, helper: `${card.helper} - local AI-applied preview` };
    }
    if (card.label === 'Coverage %') {
      return { ...card, value: `${Math.min(100, 93.8 + appliedAssignmentCount * 2.1).toFixed(1)}%`, helper: `${card.helper} - local AI-applied preview` };
    }
    if (card.label === 'Vacancy') {
      return { ...card, value: `${Math.max(0, 1.5 - appliedAssignmentCount).toFixed(1)} FTE`, helper: `${card.helper} - local AI-applied preview` };
    }
    return card;
  });
  const organizationWorkspaceTabs = React.useMemo(
    () => organizationScopeTabs.filter((tab) => tab.value !== 'employees' || selectedOrganizationNode.type === 'Job Position'),
    [selectedOrganizationNode.type],
  );

  React.useEffect(() => {
    if (selectedOrganizationScopeTab === 'employees' && selectedOrganizationNode.type !== 'Job Position') {
      setSelectedOrganizationScopeTab('scopeInfo');
    }
  }, [selectedOrganizationNode.type, selectedOrganizationScopeTab]);

  React.useEffect(() => {
    if (!isAssignmentAiOpen) return undefined;
    setAssignmentAiConversationStep(0);
    const timers = [1, 2, 3, 4].map((step) => (
      window.setTimeout(() => setAssignmentAiConversationStep(step), step * 850)
    ));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [isAssignmentAiOpen, selectedOrganizationNode.id]);

  const toggleOrganizationNode = React.useCallback((nodeId: string) => {
    setExpandedOrganizationNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const getOrganizationNodeIcon = (node: OrganizationNode) => {
    if (node.type === 'Plant') return <FactoryIcon sx={{ fontSize: 16 }} />;
    if (node.type === 'Department' || node.type === 'Sub-department') return <BusinessIcon sx={{ fontSize: 16 }} />;
    if (node.type === 'Line / Area') return <LineIcon sx={{ fontSize: 16 }} />;
    if (node.type === 'Job Position') return <WorkIcon sx={{ fontSize: 16 }} />;
    if (node.type === 'Vacant Position') return <PersonOffIcon sx={{ fontSize: 16 }} />;
    return <PersonIcon sx={{ fontSize: 16 }} />;
  };

  const renderOrganizationTreeNode = (node: OrganizationNode, depth = 0): React.ReactNode => {
    const hasChildren = Boolean(node.children?.length);
    const isExpanded = organizationFiltersActive || expandedOrganizationNodeIds.has(node.id);
    const isSelected = selectedOrganizationNodeId === node.id;
    const isSearchMatch = Boolean(organizationSearch.trim()) && organizationNodeMatches(node, organizationSearch, 'All roles', 'All', 'All patterns');
    const statusLegend = node.status ? employeeStatusLegend.find((item) => item.label === node.status) : null;

    return (
      <Box key={node.id}>
        <Box
          onClick={() => {
            setSelectedOrganizationNodeId(node.id);
            if (node.type !== 'Job Position' && selectedOrganizationScopeTab === 'employees') {
              setSelectedOrganizationScopeTab('scopeInfo');
            }
          }}
          sx={{
            display: 'grid',
            gridTemplateColumns: '24px minmax(0, 1fr)',
            alignItems: 'center',
            gap: 0.45,
            ml: depth * 1.15,
            px: 0.55,
            py: 0.35,
            borderRadius: 1.4,
            cursor: 'pointer',
            border: `1px solid ${isSelected ? '#93C5FD' : isSearchMatch ? '#FCD34D' : 'transparent'}`,
            bgcolor: isSelected ? '#EFF6FF' : isSearchMatch ? '#FFFBEB' : 'transparent',
            '&:hover': { bgcolor: isSelected ? '#EFF6FF' : '#F8FAFC' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {hasChildren ? (
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleOrganizationNode(node.id);
                }}
                sx={{ width: 22, height: 22, color: '#64748B' }}
              >
                {isExpanded ? <ExpandMoreIcon sx={{ fontSize: 16 }} /> : <ChevronRightIcon sx={{ fontSize: 16 }} />}
              </IconButton>
            ) : (
              <Box sx={{ width: 22 }} />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, minWidth: 0 }}>
            <Box sx={{ width: 24, height: 24, borderRadius: 1.2, display: 'grid', placeItems: 'center', bgcolor: node.type === 'Vacant Position' ? '#FFFBEB' : '#EEF4FF', color: node.type === 'Vacant Position' ? '#92400E' : activeTheme.primary, flexShrink: 0 }}>
              {getOrganizationNodeIcon(node)}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="caption" sx={{ color: '#1F2937', fontWeight: 900, display: 'block', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {node.name}{node.count !== undefined ? ` (${node.count})` : ''}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.58rem', display: 'block', lineHeight: 1.1 }}>
                {node.type}{node.status ? ` - ${node.status}` : ''}
              </Typography>
            </Box>
            {statusLegend ? (
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: statusLegend.color, flexShrink: 0 }} />
            ) : null}
          </Box>
        </Box>
        {hasChildren && isExpanded ? (
          <Box sx={{ mt: 0.15 }}>
            {node.children?.map((child) => renderOrganizationTreeNode(child, depth + 1))}
          </Box>
        ) : null}
      </Box>
    );
  };

  const renderAssignmentAiPanel = () => {
    const selectedPendingRecommendations = assignmentAiRecommendations.filter((recommendation) => (
      selectedAssignmentRecommendationIds.includes(recommendation.id)
      && (assignmentRecommendationStatuses[recommendation.id] ?? 'pending') === 'pending'
    ));
    const previewSelectedRecommendations = () => {
      const recommendationToPreview = selectedPendingRecommendations[0] ?? selectedAssignmentRecommendation;
      setIsAssignmentRecommendationFlowVisible(true);
      window.setTimeout(() => {
        previewAssignmentRecommendation(recommendationToPreview);
        setAssignmentAiMessages((prev) => [
          ...prev,
          {
            id: `assistant-preview-${Date.now()}`,
            role: 'assistant',
            text: "Previewing selected changes. I'll highlight the affected employee cards and target teams.",
          },
        ]);
      }, 650);
    };
    const requestApplySelected = () => {
      const recommendationIds = selectedPendingRecommendations.map((recommendation) => recommendation.id);
      if (!recommendationIds.length) {
        setAssignmentAiReviewMessage('Select at least one pending recommendation first.');
        return;
      }
      setPendingAssignmentApplyIds(recommendationIds);
      window.setTimeout(() => {
        setAssignmentAiMessages((prev) => [
          ...prev,
          {
            id: `assistant-ready-${Date.now()}`,
            role: 'assistant',
            text: "I'm ready to apply the selected assignment changes.",
          },
        ]);
      }, 650);
    };
    const confirmApplySelected = () => {
      const recommendationsToApply = assignmentAiRecommendations.filter((recommendation) => pendingAssignmentApplyIds.includes(recommendation.id));
      applyAssignmentRecommendations(recommendationsToApply, 'Apply selected');
      setAssignmentAiMessages((prev) => [
        ...prev,
        {
          id: `assistant-done-${Date.now()}`,
          role: 'assistant',
          text: 'Done. I moved the accepted employee cards to the target team and updated the local staffing view.',
        },
      ]);
      setPendingAssignmentApplyIds([]);
    };

    return (
      <Paper
        elevation={0}
        sx={{
          ...crewSetupPanelSx,
          p: 1.05,
          height: '100%',
          minHeight: 560,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
          bgcolor: '#FBFDFF',
          borderColor: '#BFDBFE',
          minWidth: 0,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55 }}>
              <AutoAwesomeIcon sx={{ color: activeTheme.primary, fontSize: 18 }} />
              <Typography variant="subtitle2" sx={{ color: '#0F172A', fontWeight: 950 }}>
                AI Assignment Assistant
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 750, display: 'block', mt: 0.25, lineHeight: 1.25 }}>
              Guided assignment support for the selected workforce scope.
            </Typography>
          </Box>
          <IconButton size="small" onClick={closeAssignmentAiAssistant} aria-label="Close AI Assignment Assistant" sx={{ color: '#64748B' }}>
            <CloseIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Box>

        <Paper elevation={0} sx={{ px: 0.75, py: 0.6, borderRadius: 1.6, border: '1px solid #DBEAFE', bgcolor: '#EFF6FF' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.35 }}>
            {assignmentAiContextChips.slice(0, 4).map(([label, value]) => (
              <Chip
                key={label}
                size="small"
                label={`${label}: ${value}`}
                sx={{ height: 22, bgcolor: '#FFFFFF', color: activeTheme.primary, border: '1px solid #BFDBFE', fontWeight: 850, '& .MuiChip-label': { px: 0.55, fontSize: '0.56rem' } }}
              />
            ))}
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 0.75, borderRadius: 1.8, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', flex: 1, minHeight: 0, overflow: 'auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {assignmentAiMessages.map((message) => {
              const isAssistant = message.role === 'assistant';
              return (
                <Box key={message.id} sx={{ display: 'flex', justifyContent: isAssistant ? 'flex-start' : 'flex-end' }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 0.75,
                      borderRadius: 1.7,
                      maxWidth: '92%',
                      border: `1px solid ${isAssistant ? '#BFDBFE' : '#CBD5E1'}`,
                      bgcolor: isAssistant ? '#EFF6FF' : '#F8FAFC',
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 0.45, alignItems: 'flex-start' }}>
                      {isAssistant ? <AutoAwesomeIcon sx={{ color: activeTheme.primary, fontSize: 14, mt: 0.15 }} /> : null}
                      <Typography variant="caption" sx={{ color: isAssistant ? '#1D4ED8' : '#334155', fontWeight: 800, lineHeight: 1.35 }}>
                        {message.text}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              );
            })}

            {assignmentAiConversationStep >= 1 ? (
              <Paper elevation={0} sx={{ p: 0.75, borderRadius: 1.7, border: '1px solid #BFDBFE', bgcolor: '#EFF6FF', maxWidth: '92%' }}>
                <Box sx={{ display: 'flex', gap: 0.45 }}>
                  <AutoAwesomeIcon sx={{ color: activeTheme.primary, fontSize: 14, mt: 0.15 }} />
                  <Typography variant="caption" sx={{ color: '#1D4ED8', fontWeight: 850, lineHeight: 1.35 }}>
                    I can help fill the Operator gap for Line 1 - Assembly.
                  </Typography>
                </Box>
              </Paper>
            ) : null}
            {assignmentAiConversationStep >= 2 ? (
              <Paper elevation={0} sx={{ p: 0.75, borderRadius: 1.7, border: '1px solid #BFDBFE', bgcolor: '#EFF6FF', maxWidth: '92%' }}>
                <Box sx={{ display: 'flex', gap: 0.45 }}>
                  <AutoAwesomeIcon sx={{ color: activeTheme.primary, fontSize: 14, mt: 0.15 }} />
                  <Typography variant="caption" sx={{ color: '#1D4ED8', fontWeight: 850, lineHeight: 1.35 }}>
                    I'll look for available employees who match the role, availability, team context, training status, leave status, and scheduling constraints.
                  </Typography>
                </Box>
              </Paper>
            ) : null}
            {assignmentAiConversationStep >= 3 ? (
              <Paper elevation={0} sx={{ p: 0.75, borderRadius: 1.7, border: '1px solid #BFDBFE', bgcolor: '#EFF6FF', maxWidth: '96%' }}>
                <Box sx={{ display: 'flex', gap: 0.45 }}>
                  <AutoAwesomeIcon sx={{ color: activeTheme.primary, fontSize: 14, mt: 0.15 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#1D4ED8', fontWeight: 850, lineHeight: 1.35, display: 'block' }}>
                      Best candidates:
                    </Typography>
                    {[
                      '1. Maria Garcia - strongest fit, active and unassigned.',
                      '2. David Lee - good fit, but requires a temporary move.',
                      '3. Chris Davis - backup option, currently in training.',
                      'Alex Brown is not eligible because she is on leave.',
                    ].map((copy) => (
                      <Typography key={copy} variant="caption" sx={{ color: '#1D4ED8', fontWeight: 750, lineHeight: 1.35, display: 'block' }}>
                        {copy}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              </Paper>
            ) : null}
            {assignmentAiConversationStep >= 4 || isAssignmentRecommendationFlowVisible ? (
              <Paper elevation={0} sx={{ p: 0.75, borderRadius: 1.7, border: '1px solid #BFDBFE', bgcolor: '#EFF6FF', maxWidth: '100%' }}>
                <Box sx={{ display: 'flex', gap: 0.45, alignItems: 'flex-start' }}>
                  <AutoAwesomeIcon sx={{ color: activeTheme.primary, fontSize: 14, mt: 0.15 }} />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.6, alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#1D4ED8', fontWeight: 900, lineHeight: 1.35 }}>
                        I found 3 possible assignment actions.
                      </Typography>
                      <Chip size="small" label="Rationale" title={assignmentAiVariablesConsidered.join(', ')} sx={{ height: 20, bgcolor: '#FFFFFF', color: activeTheme.primary, border: '1px solid #BFDBFE', fontWeight: 850, '& .MuiChip-label': { px: 0.55, fontSize: '0.55rem' } }} />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.45, mt: 0.65 }}>
                      {assignmentAiRecommendations.map((recommendation, index) => {
                        const status = assignmentRecommendationStatuses[recommendation.id] ?? 'pending';
                        return (
                          <Paper key={recommendation.id} elevation={0} sx={{ p: 0.55, borderRadius: 1.4, border: '1px solid #DBEAFE', bgcolor: '#FFFFFF' }}>
                            <Box sx={{ display: 'flex', gap: 0.45, alignItems: 'flex-start' }}>
                              <Checkbox
                                size="small"
                                checked={selectedAssignmentRecommendationIds.includes(recommendation.id)}
                                disabled={status !== 'pending'}
                                onChange={() => toggleSelectedAssignmentRecommendation(recommendation.id)}
                                sx={{ p: 0.1 }}
                              />
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography variant="caption" sx={{ color: '#1F2937', fontWeight: 900, lineHeight: 1.2, display: 'block' }}>
                                  {index === 0 ? 'Assign Maria Garcia to Crew C' : index === 1 ? 'Move David Lee temporarily to Crew C' : 'Keep vacancy open and flag supervisor review'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 750, lineHeight: 1.2, display: 'block' }}>
                                  {index === 0 ? 'Strong fit - Active - Unassigned' : index === 1 ? 'Good fit - Requires Crew A impact review' : 'No fully eligible backup available'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 750, lineHeight: 1.2, display: 'block' }}>
                                  {status}
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        );
                      })}
                    </Box>
                    {assignmentAiReviewMessage ? (
                      <Typography variant="caption" sx={{ color: '#7C3AED', fontWeight: 850, display: 'block', mt: 0.55, lineHeight: 1.25 }}>
                        {assignmentAiReviewMessage}
                      </Typography>
                    ) : null}
                    {pendingAssignmentApplyIds.length ? (
                      <Paper elevation={0} sx={{ mt: 0.55, p: 0.55, borderRadius: 1.4, border: '1px solid #A7F3D0', bgcolor: '#ECFDF5' }}>
                        <Typography variant="caption" sx={{ color: '#047857', fontWeight: 850, display: 'block', lineHeight: 1.25 }}>
                          Confirm applying {pendingAssignmentApplyIds.length} selected local assignment change{pendingAssignmentApplyIds.length === 1 ? '' : 's'}.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.35, flexWrap: 'wrap', mt: 0.45 }}>
                          <Button size="small" variant="contained" onClick={confirmApplySelected} sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 900, fontSize: '0.58rem', bgcolor: activeTheme.primary }}>
                            Confirm apply
                          </Button>
                          <Button size="small" variant="text" onClick={() => setPendingAssignmentApplyIds([])} sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 900, fontSize: '0.58rem' }}>
                            Cancel
                          </Button>
                        </Box>
                      </Paper>
                    ) : null}
                    <Box sx={{ display: 'flex', gap: 0.35, flexWrap: 'wrap', mt: 0.65 }}>
                      <Button size="small" variant="outlined" onClick={previewSelectedRecommendations} sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 900, fontSize: '0.58rem' }}>
                        Preview selected
                      </Button>
                      <Button size="small" variant="outlined" disabled={!selectedAssignmentRecommendationIds.length} onClick={requestApplySelected} sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 900, fontSize: '0.58rem' }}>
                        Apply selected
                      </Button>
                      <Button size="small" variant="text" onClick={() => setAssignmentAiReviewMessage(`Why this recommendation? ${selectedAssignmentRecommendation.variables.join(', ')}.`)} sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 900, fontSize: '0.58rem' }}>
                        Explain rationale
                      </Button>
                      <Button size="small" variant="text" onClick={() => setAssignmentAiReviewMessage('No problem. I will keep that option out of the plan.')} sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 900, fontSize: '0.58rem' }}>
                        Reject
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            ) : null}
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4 }}>
          {['Find best assignments', 'Show eligible candidates', 'Suggest temporary move', 'Who can fill this vacancy?', 'Balance teams'].map((prompt) => (
            <Button
              key={prompt}
              size="small"
              variant="outlined"
              onClick={() => sendAssignmentAiMessage(prompt)}
              sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 850, fontSize: '0.6rem', px: 0.75, py: 0.22, bgcolor: '#FFFFFF' }}
            >
              {prompt}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 0.45 }}>
          <TextField
            size="small"
            placeholder="Ask AI to find assignments..."
            value={assignmentAiInput}
            onChange={(event) => setAssignmentAiInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                sendAssignmentAiMessage(assignmentAiInput);
              }
            }}
            fullWidth
            InputProps={{ startAdornment: <AutoAwesomeIcon sx={{ color: activeTheme.primary, fontSize: 16, mr: 0.7 }} /> }}
          />
          <Button
            size="small"
            variant="contained"
            onClick={() => sendAssignmentAiMessage(assignmentAiInput)}
            disabled={!assignmentAiInput.trim()}
            sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 900, bgcolor: activeTheme.primary, px: 1 }}
          >
            Send
          </Button>
        </Box>
      </Paper>
    );
  };

  const renderSelectedScopeTabContent = () => {
    if (selectedOrganizationScopeTab === 'scopeInfo') {
      const isJobPosition = selectedOrganizationNode.type === 'Job Position' || selectedOrganizationNode.type === 'Vacant Position';
      const isEmployee = selectedOrganizationNode.type === 'Employee';
      const hasLocalStaffingIssue = selectedOrganizationNode.type === 'Vacant Position'
        || selectedOrganizationNode.status === 'Vacant'
        || selectedOrganizationNode.name === 'Operator'
        || selectedScopeEmployeeRows.some((row) => row.status === 'Vacant' || row.status === 'On Leave');
      const selectedEmployeeName = isEmployee ? selectedOrganizationNode.name : selectedOrganizationEmployeeRow?.employeePosition;
      const scopeInfoRows = (isEmployee ? [
        ['Name', selectedOrganizationNode.name],
        ['Employee ID', selectedOrganizationEmployeeRow?.id ?? `EMP-${selectedOrganizationNode.id.slice(-4).toUpperCase()}`],
        ['Status', selectedOrganizationNode.status],
        ['Role / job position', selectedOrganizationNode.role ?? selectedOrganizationNode.jobProfile],
        ['Team', selectedOrganizationNode.teamAssignment ?? selectedOrganizationEmployeeRow?.team],
        ['Crew pattern', selectedOrganizationNode.crewPattern ?? selectedOrganizationEmployeeRow?.crewPattern],
        ['FTE', selectedOrganizationEmployeeRow?.fte ?? '1.00'],
        ['Availability', selectedOrganizationEmployeeRow?.availability ?? (selectedOrganizationNode.status === 'On Leave' ? 'Not available' : 'Available')],
        ['Manager / supervisor', selectedOrganizationNode.supervisor],
        ['Last sync update', organizationSyncTimestamp],
      ] : isJobPosition ? [
        ['Name', selectedOrganizationNode.name],
        ['Job profile', selectedOrganizationNode.jobProfile ?? selectedOrganizationNode.role],
        ['Cost center', selectedOrganizationNode.costCenter ?? 'CC-1042'],
        ['Supervisor', selectedOrganizationNode.supervisor ?? selectedOrganizationParent?.name],
        ['Target per shift', selectedOrganizationNode.count !== undefined ? `${selectedOrganizationNode.count} FTE` : '24 FTE'],
        ['Assigned FTE', selectedOrganizationNode.name === 'Operator' ? '22.5 FTE' : `${employeeFteCount.toFixed(1)} FTE`],
        ['Direct reports', selectedOrganizationNode.directReports !== undefined ? String(selectedOrganizationNode.directReports) : String(selectedOrganizationNode.count ?? selectedScopeEmployeeRows.length)],
        ['Crew pattern', selectedOrganizationNode.crewPattern ?? 'Inherited from parent scope'],
        ['Override indicator', selectedOrganizationNode.crewPattern ? 'Assigned at this scope' : 'No local override'],
      ] : [
        ['Name', selectedOrganizationNode.name],
        ['Type', selectedOrganizationNode.type],
        ['Path', selectedOrganizationPathLabel],
        ['Linked asset', selectedOrganizationNode.linkedAsset ?? 'BD Columbus West'],
        ['Parent scope', selectedOrganizationParent?.name ?? 'None'],
        ['Crew pattern', selectedOrganizationNode.crewPattern ?? 'Inherited from child positions'],
        ['Effective dates', '2026-01-01 to 2026-12-31'],
        ['Direct reports / child count', selectedOrganizationNode.directReports !== undefined ? String(selectedOrganizationNode.directReports) : String(selectedOrganizationChildCount)],
        ['Notes', 'Local mock scope for workforce assignment and schedule planning context.'],
      ]).filter((entry): entry is [string, string] => Boolean(entry[1]));

      return (
        <Paper elevation={0} sx={{ p: 1, borderRadius: 2, border: '1px solid #D8DEE8', bgcolor: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap', mb: 0.9 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#1F2937', fontWeight: 950 }}>
                Scope Info
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 750 }}>
                {isEmployee
                  ? `Workforce record details for ${selectedEmployeeName}.`
                  : isJobPosition
                    ? 'Position-level staffing context for the selected scope.'
                    : 'Organization scope context used for workforce planning.'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.55, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {hasLocalStaffingIssue ? (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AutoAwesomeIcon sx={{ fontSize: 15 }} />}
                  onClick={openAssignmentAiAssistant}
                  sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 900 }}
                >
                  Find best assignments with AI
                </Button>
              ) : null}
              <Chip
                size="small"
                label={selectedOrganizationNode.type}
                sx={{ bgcolor: '#F8FAFC', color: '#475569', border: '1px solid #CBD5E1', fontWeight: 900 }}
              />
            </Box>
          </Box>

          <Grid container spacing={0.75}>
            {scopeInfoRows.map(([label, value]) => (
              <Grid size={{ xs: 12, sm: 6, xl: 4 }} key={label}>
                <Paper elevation={0} sx={{ p: 0.85, borderRadius: 1.7, border: '1px solid #E2E8F0', bgcolor: '#FBFDFF', height: '100%' }}>
                  <Typography variant="caption" sx={crewSetupMetaLabelSx}>{label}</Typography>
                  <Typography variant="body2" sx={{ color: '#1F2937', fontWeight: 900, mt: 0.3, lineHeight: 1.25 }}>
                    {value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      );
    }

    if (selectedOrganizationScopeTab === 'teamAssignment') {
      const renderAssignmentEmployeeCard = (employee: TeamAssignmentEmployee, sourceCrewId?: string) => {
        const statusStyle = employeeStatusLegend.find((item) => item.label === employee.status) ?? employeeStatusLegend[0];
        const isSelected = selectedTeamAssignmentEmployeeIds.includes(employee.id);
        const isUnavailable = employee.status === 'On Leave' || employee.status === 'Inactive' || employee.status === 'Terminated';
        const isDraggable = employee.status !== 'Terminated';
        const isPreviewedEmployee = previewedAssignmentEmployeeIds.includes(employee.id);
        const avatarTone = isUnavailable ? '#E2E8F0' : sourceCrewId ? '#DBEAFE' : '#F5F3FF';
        const avatarColor = isUnavailable ? '#64748B' : sourceCrewId ? activeTheme.primary : '#7C3AED';
        return (
          <Paper
            key={`${sourceCrewId ?? 'unassigned'}-${employee.id}`}
            elevation={0}
            draggable={isDraggable}
            onDragStart={(event) => handleTeamAssignmentDragStart(event, employee, sourceCrewId)}
            onDragEnd={clearTeamAssignmentDragState}
            sx={{
              p: 0.75,
              borderRadius: 1.6,
              border: `1px solid ${isPreviewedEmployee ? '#A78BFA' : isSelected ? '#93C5FD' : isUnavailable ? '#CBD5E1' : '#D8E1EF'}`,
              bgcolor: isPreviewedEmployee ? '#F5F3FF' : isSelected ? '#EFF6FF' : isUnavailable ? '#F8FAFC' : '#FFFFFF',
              opacity: employee.status === 'Terminated' ? 0.62 : 1,
              cursor: employee.status === 'Terminated' ? 'not-allowed' : 'grab',
              boxShadow: isPreviewedEmployee ? '0 0 0 2px rgba(124,58,237,0.12)' : 'none',
              '&:active': { cursor: isDraggable ? 'grabbing' : 'not-allowed' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.7 }}>
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {!sourceCrewId ? (
                    <Checkbox
                      size="small"
                      checked={isSelected}
                      disabled={employee.status === 'Terminated'}
                      onChange={() => toggleTeamAssignmentEmployeeSelection(employee.id)}
                      sx={{ p: 0.1 }}
                    />
                  ) : (
                    <Checkbox
                      size="small"
                      checked={false}
                      disabled
                      sx={{ p: 0.1 }}
                    />
                  )}
                  <Avatar sx={{ width: 28, height: 28, bgcolor: avatarTone, color: avatarColor, fontWeight: 950, fontSize: '0.68rem', flexShrink: 0 }}>
                    {resolveInitials(employee.name)}
                  </Avatar>
                  <Typography variant="body2" sx={{ color: '#1F2937', fontWeight: 950, lineHeight: 1.1 }}>
                    {employee.name}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 750, display: 'block', mt: 0.15 }}>
                  {employee.employeeId} - {employee.role} - {employee.fte} FTE
                </Typography>
              </Box>
              <Chip
                size="small"
                label={isPreviewedEmployee ? 'Preview' : employee.status}
                sx={{
                  height: 22,
                  bgcolor: isPreviewedEmployee ? '#F5F3FF' : statusStyle.bg,
                  color: isPreviewedEmployee ? '#7C3AED' : statusStyle.color,
                  border: `1px solid ${isPreviewedEmployee ? '#C4B5FD' : statusStyle.border}`,
                  fontWeight: 900,
                  '& .MuiChip-label': { px: 0.7, fontSize: '0.6rem' },
                }}
              />
            </Box>
            <Box sx={{ mt: 0.55, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.6, flexWrap: 'wrap' }}>
              <Typography variant="caption" sx={{ color: isUnavailable ? '#C2410C' : '#0F766E', fontWeight: 850 }}>
                {employee.availability}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.35, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {sourceCrewId ? (
                  <Button
                    size="small"
                    variant="text"
                    disabled={employee.status === 'Terminated'}
                    onClick={() => unassignEmployeeFromCrew(employee)}
                    sx={{ minHeight: 24, px: 0.65, borderRadius: 999, textTransform: 'none', fontSize: '0.58rem', fontWeight: 900, color: '#64748B' }}
                  >
                    Unassign
                  </Button>
                ) : null}
              </Box>
            </Box>
          </Paper>
        );
      };

      return (
        <Paper elevation={0} sx={{ p: 1, borderRadius: 2, border: '1px solid #D8DEE8', bgcolor: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap', mb: 0.9 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#1F2937', fontWeight: 950 }}>
                Team Assignment Board
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 750 }}>
                Drag unassigned employees into teams, or drag cards between teams. Changes are local to this prototype.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.55, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="contained"
                startIcon={<AutoAwesomeIcon sx={{ fontSize: 15 }} />}
                onClick={openAssignmentAiAssistant}
                sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 900, bgcolor: activeTheme.primary }}
              >
                Find best assignments with AI
              </Button>
              <Button size="small" variant="outlined" startIcon={<AddIcon sx={{ fontSize: 15 }} />} sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 900 }}>
                Add Team
              </Button>
            </Box>
          </Box>

          <Grid container spacing={0.8} sx={{ mb: 0.9 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                size="small"
                label="Search employees"
                placeholder="Name, ID, role..."
                value={teamAssignmentSearch}
                onChange={(event) => setTeamAssignmentSearch(event.target.value)}
                fullWidth
                InputProps={{ endAdornment: <SearchIcon sx={{ color: activeTheme.primary }} /> }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 2.4 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Role</InputLabel>
                <Select label="Role" value={teamAssignmentRoleFilter} onChange={(event) => setTeamAssignmentRoleFilter(event.target.value)}>
                  {organizationRoleFilterOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 2.4 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Availability</InputLabel>
                <Select label="Availability" value={teamAssignmentAvailabilityFilter} onChange={(event) => setTeamAssignmentAvailabilityFilter(event.target.value)}>
                  {organizationAvailabilityFilterOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 3.2 }}>
              <Paper elevation={0} sx={{ px: 0.85, py: 0.65, borderRadius: 1.6, border: '1px dashed #CBD5E1', bgcolor: '#F8FAFC', minHeight: 34, display: 'flex', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 850, lineHeight: 1.25 }}>
                  {selectedTeamAssignmentEmployeeIds.length ? `${selectedTeamAssignmentEmployeeIds.length} selected for multi-card drag` : 'Select multiple unassigned cards, then drag one selected card'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          {teamAssignmentInlineMessage ? (
            <Paper elevation={0} sx={{ px: 0.85, py: 0.55, borderRadius: 1.5, border: '1px solid #BFDBFE', bgcolor: '#EFF6FF', mb: 0.9 }}>
              <Typography variant="caption" sx={{ color: activeTheme.primary, fontWeight: 850 }}>
                {teamAssignmentInlineMessage}
              </Typography>
            </Paper>
          ) : null}

          <Paper elevation={0} sx={{ p: 0.9, borderRadius: 1.8, border: '1px solid #E2E8F0', bgcolor: '#F8FAFC', mb: 1 }}>
            <Typography variant="caption" sx={crewSetupMetaLabelSx}>Unassigned Employees</Typography>
            <Box sx={{ mt: 0.75, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }, gap: 0.65 }}>
              {visibleTeamAssignmentUnassignedEmployees.length ? visibleTeamAssignmentUnassignedEmployees.map((employee) => renderAssignmentEmployeeCard(employee)) : (
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 850 }}>No unassigned employees match the current filters.</Typography>
              )}
            </Box>
          </Paper>

          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 950, textTransform: 'uppercase', fontSize: '0.58rem', display: 'block', mb: 0.65 }}>
            Teams & Crew Patterns
          </Typography>
          <Grid container spacing={0.8}>
            {teamAssignmentCrews.map((crew) => {
              const visibleEmployees = filterTeamAssignmentEmployees(crew.employees);
              const activeFte = crew.employees.reduce((sum, employee) => sum + (employee.status === 'On Leave' || employee.status === 'Terminated' ? 0 : Number(employee.fte)), 0);
              const isDragOver = dragOverTeamAssignmentCrewId === crew.id;
              const isPreviewTarget = previewedAssignmentTargetCrewId === crew.id;
              const isSuccessTarget = successHighlightedCrewId === crew.id;
              return (
                <Grid size={{ xs: 12, lg: 4 }} key={crew.id}>
                  <Paper
                    elevation={0}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragOverTeamAssignmentCrewId(crew.id);
                    }}
                    onDragLeave={() => setDragOverTeamAssignmentCrewId((prev) => (prev === crew.id ? null : prev))}
                    onDrop={(event) => handleTeamAssignmentDrop(event, crew.id)}
                    sx={{
                      p: 0.9,
                      borderRadius: 2,
                      border: `1px solid ${isDragOver ? '#2563EB' : isSuccessTarget ? '#22C55E' : isPreviewTarget ? '#A78BFA' : '#D8E1EF'}`,
                      bgcolor: isDragOver ? '#EFF6FF' : isSuccessTarget ? '#ECFDF5' : isPreviewTarget ? '#F5F3FF' : '#FFFFFF',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.65,
                      boxShadow: isDragOver ? '0 12px 26px rgba(37,99,235,0.12)' : isSuccessTarget ? '0 0 0 2px rgba(34,197,94,0.12)' : isPreviewTarget ? '0 0 0 2px rgba(124,58,237,0.10)' : 'none',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 0.75 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: activeTheme.primary, fontWeight: 950, lineHeight: 1.1 }}>
                          {crew.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, display: 'block' }}>
                          Pattern: {crew.pattern}
                        </Typography>
                      </Box>
                      <Chip size="small" label={`Target ${crew.target}`} sx={{ bgcolor: '#F8FAFC', color: '#475569', border: '1px solid #CBD5E1', fontWeight: 900 }} />
                    </Box>
                    {isSuccessTarget ? (
                      <Chip
                        size="small"
                        label="Applied locally"
                        sx={{ alignSelf: 'flex-start', bgcolor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', fontWeight: 900 }}
                      />
                    ) : isPreviewTarget ? (
                      <Chip
                        size="small"
                        label="Preview target"
                        sx={{ alignSelf: 'flex-start', bgcolor: '#F5F3FF', color: '#7C3AED', border: '1px solid #C4B5FD', fontWeight: 900 }}
                      />
                    ) : null}
                    <Typography variant="caption" sx={{ color: '#0F766E', fontWeight: 900 }}>
                      Assigned: {crew.employees.length}/{crew.target} - {activeFte.toFixed(2)} active FTE
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.55, flex: 1 }}>
                      {visibleEmployees.map((employee) => renderAssignmentEmployeeCard(employee, crew.id))}
                      {crew.vacantPositions ? (
                        <Paper elevation={0} sx={{ p: 0.75, borderRadius: 1.6, border: '1px dashed #FDBA74', bgcolor: '#FFFBEB' }}>
                          <Typography variant="body2" sx={{ color: '#9A3412', fontWeight: 950 }}>Vacant Position</Typography>
                          <Typography variant="caption" sx={{ color: '#C2410C', fontWeight: 850 }}>Operator - 1.00 FTE - open staffing requirement</Typography>
                        </Paper>
                      ) : null}
                    </Box>
                    <Box
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragOverTeamAssignmentCrewId(crew.id);
                      }}
                      onDrop={(event) => handleTeamAssignmentDrop(event, crew.id)}
                      sx={{
                        mt: 'auto',
                        p: 0.75,
                        borderRadius: 1.6,
                        border: `1px dashed ${isDragOver ? '#2563EB' : isPreviewTarget ? '#7C3AED' : '#93C5FD'}`,
                        bgcolor: isDragOver ? '#DBEAFE' : isPreviewTarget ? '#EDE9FE' : '#EFF6FF',
                        textAlign: 'center',
                        transition: 'all 0.16s ease',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: activeTheme.primary, fontWeight: 900 }}>
                        Drop employees here
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      );
    }

    if (selectedOrganizationScopeTab === 'staffingKpis') {
      return (
        <Paper elevation={0} sx={{ p: 1, borderRadius: 2, border: '1px solid #D8DEE8', bgcolor: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap', mb: 0.9 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#1F2937', fontWeight: 950 }}>
                Staffing & KPIs
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 750 }}>
                Position-level workforce coverage for {selectedOrganizationNode.name}.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.55, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AutoAwesomeIcon sx={{ fontSize: 15 }} />}
                onClick={openAssignmentAiAssistant}
                sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 900 }}
              >
                Find best assignments with AI
              </Button>
              <Chip
                size="small"
                label="Local mock metrics"
                sx={{ bgcolor: '#F8FAFC', color: '#475569', border: '1px solid #CBD5E1', fontWeight: 900 }}
              />
            </Box>
          </Box>

          <Grid container spacing={0.65} sx={{ mb: 1 }}>
            {visibleStaffingKpiCards.map((card) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, xl: 2 }} key={card.label}>
                <Paper elevation={0} sx={{ p: 0.8, borderRadius: 1.7, border: `1px solid ${card.border}`, bgcolor: card.bg, height: '100%' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 950, textTransform: 'uppercase', fontSize: '0.56rem', lineHeight: 1.1 }}>
                    {card.label}
                  </Typography>
                  <Typography sx={{ color: card.tone, fontWeight: 950, fontSize: '1rem', lineHeight: 1.05, mt: 0.35 }}>
                    {card.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 750, fontSize: '0.6rem', display: 'block', lineHeight: 1.25, mt: 0.3 }}>
                    {card.helper}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Paper elevation={0} sx={{ borderRadius: 1.8, border: '1px solid #D8DEE8', overflow: 'hidden', mb: 1 }}>
            <Box
              sx={{
                display: { xs: 'none', md: 'grid' },
                gridTemplateColumns: 'minmax(130px, 1.2fr) 90px 90px 90px 90px 100px minmax(160px, 1.3fr)',
                gap: 0.55,
                px: 0.8,
                py: 0.65,
                bgcolor: '#F8FAFC',
                borderBottom: '1px solid #E2E8F0',
              }}
            >
              {['Job Position', 'Required FTE', 'Assigned FTE', 'Coverage %', 'Vacancy Count', 'Status', 'Notes'].map((label) => (
                <Typography key={label} variant="caption" sx={{ color: '#64748B', fontWeight: 950, textTransform: 'uppercase', fontSize: '0.56rem', lineHeight: 1.1 }}>
                  {label}
                </Typography>
              ))}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {positionLevelKpiRows.map((row) => {
                const isGap = row.status === 'Gap';
                const isUnderTarget = row.status === 'Under target';
                const statusBg = isGap ? '#FEF2F2' : isUnderTarget ? '#FFF7ED' : '#ECFDF5';
                const statusColor = isGap ? '#B91C1C' : isUnderTarget ? '#C2410C' : '#047857';
                const statusBorder = isGap ? '#FECACA' : isUnderTarget ? '#FED7AA' : '#A7F3D0';
                return (
                  <Box
                    key={row.jobPosition}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: 'minmax(130px, 1.2fr) 90px 90px 90px 90px 100px minmax(160px, 1.3fr)' },
                      gap: 0.55,
                      alignItems: 'center',
                      px: 0.8,
                      py: 0.7,
                      borderBottom: '1px solid #E2E8F0',
                      bgcolor: isGap ? '#FFF7F7' : isUnderTarget ? '#FFFBEB' : '#FFFFFF',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#1F2937', fontWeight: 950 }}>{row.jobPosition}</Typography>
                    <Typography variant="caption" sx={{ color: '#334155', fontWeight: 850 }}>{row.requiredFte}</Typography>
                    <Typography variant="caption" sx={{ color: '#334155', fontWeight: 850 }}>{row.assignedFte}</Typography>
                    <Typography variant="caption" sx={{ color: statusColor, fontWeight: 950 }}>{row.coverage}</Typography>
                    <Typography variant="caption" sx={{ color: row.vacancy === '0' ? '#047857' : '#C2410C', fontWeight: 950 }}>{row.vacancy}</Typography>
                    <Chip
                      size="small"
                      label={row.status}
                      sx={{ height: 22, bgcolor: statusBg, color: statusColor, border: `1px solid ${statusBorder}`, fontWeight: 900, '& .MuiChip-label': { px: 0.7, fontSize: '0.6rem' } }}
                    />
                    <Typography variant="caption" sx={{ color: '#475569', fontWeight: 750, lineHeight: 1.25 }}>{row.notes}</Typography>
                  </Box>
                );
              })}
            </Box>
          </Paper>

          <Grid container spacing={0.65}>
            {[
              'On Leave associates remain visible but are not counted in FTE coverage.',
              'Terminated associates are excluded from workforce planning and scheduling views.',
              'Vacant positions represent open staffing requirements.',
            ].map((copy) => (
              <Grid size={{ xs: 12, md: 4 }} key={copy}>
                <Paper elevation={0} sx={{ p: 0.8, borderRadius: 1.7, border: '1px solid #E2E8F0', bgcolor: '#F8FAFC', height: '100%' }}>
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 850, lineHeight: 1.35 }}>
                    {copy}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      );
    }

    if (selectedOrganizationScopeTab === 'history') {
      return (
        <Paper elevation={0} sx={{ p: 1, borderRadius: 2, border: '1px solid #D8DEE8', bgcolor: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap', mb: 0.9 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#1F2937', fontWeight: 950 }}>
                History
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 750 }}>
                Local audit trail for workforce assignments, status updates, and mock sync changes.
              </Typography>
            </Box>
            <Chip
              size="small"
              label="Local mock audit"
              sx={{ bgcolor: '#F8FAFC', color: '#475569', border: '1px solid #CBD5E1', fontWeight: 900 }}
            />
          </Box>

          <Paper elevation={0} sx={{ borderRadius: 1.8, border: '1px solid #D8DEE8', overflow: 'hidden', mb: 1 }}>
            <Box
              sx={{
                display: { xs: 'none', md: 'grid' },
                gridTemplateColumns: '132px minmax(100px, 0.8fr) minmax(220px, 1.4fr) minmax(170px, 1fr) 96px',
                gap: 0.55,
                px: 0.8,
                py: 0.65,
                bgcolor: '#F8FAFC',
                borderBottom: '1px solid #E2E8F0',
              }}
            >
              {['Date/time', 'User/source', 'Change', 'Scope', 'Status'].map((label) => (
                <Typography key={label} variant="caption" sx={{ color: '#64748B', fontWeight: 950, textTransform: 'uppercase', fontSize: '0.56rem', lineHeight: 1.1 }}>
                  {label}
                </Typography>
              ))}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {localOrganizationHistoryRows.map((row) => {
                const isSynced = row.status === 'Synced';
                return (
                  <Box
                    key={`${row.dateTime}-${row.change}`}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '132px minmax(100px, 0.8fr) minmax(220px, 1.4fr) minmax(170px, 1fr) 96px' },
                      gap: 0.55,
                      alignItems: 'center',
                      px: 0.8,
                      py: 0.75,
                      borderBottom: '1px solid #E2E8F0',
                      bgcolor: isSynced ? '#F8FBFF' : '#FFFFFF',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#334155', fontWeight: 850 }}>{row.dateTime}</Typography>
                    <Typography variant="caption" sx={{ color: isSynced ? activeTheme.primary : '#334155', fontWeight: 900 }}>{row.source}</Typography>
                    <Typography variant="caption" sx={{ color: '#1F2937', fontWeight: 850, lineHeight: 1.25 }}>{row.change}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, lineHeight: 1.25 }}>{row.scope}</Typography>
                    <Chip
                      size="small"
                      label={row.status}
                      sx={{
                        height: 22,
                        bgcolor: isSynced ? '#EFF6FF' : '#ECFDF5',
                        color: isSynced ? activeTheme.primary : '#047857',
                        border: `1px solid ${isSynced ? '#BFDBFE' : '#A7F3D0'}`,
                        fontWeight: 900,
                        '& .MuiChip-label': { px: 0.7, fontSize: '0.6rem' },
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p: 0.85, borderRadius: 1.7, border: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 850, lineHeight: 1.35 }}>
              Workforce identity and status data is shown as synchronized mock data. Local team assignments are prototype-only.
            </Typography>
          </Paper>
        </Paper>
      );
    }

    if (selectedOrganizationScopeTab !== 'employees') {
      const tabLabel = organizationScopeTabs.find((tab) => tab.value === selectedOrganizationScopeTab)?.label ?? 'Selected scope';
      return (
        <Paper elevation={0} sx={{ p: 1.2, borderRadius: 2, border: '1px dashed #CBD5E1', bgcolor: '#F8FAFC' }}>
          <Typography variant="subtitle2" sx={{ color: '#1F2937', fontWeight: 950 }}>
            {tabLabel}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 750, display: 'block', mt: 0.35, lineHeight: 1.35 }}>
            Select a workspace tab to inspect organization and workforce context.
          </Typography>
        </Paper>
      );
    }

    return (
      <Paper elevation={0} sx={{ p: 1, borderRadius: 2, border: '1px solid #D8DEE8', bgcolor: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap', mb: 0.8 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#1F2937', fontWeight: 950, lineHeight: 1.1 }}>
              Employees and Positions
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 750 }}>
              {selectedScopeEmployeeRows.length} rows in selected scope - {employeeFteCount.toFixed(2)} FTE visible
            </Typography>
          </Box>
          <Chip
            size="small"
            label="Inspection only"
            sx={{ bgcolor: '#F8FAFC', color: '#475569', border: '1px solid #CBD5E1', fontWeight: 900 }}
          />
        </Box>

        <Box
          sx={{
            display: { xs: 'none', md: 'grid' },
            gridTemplateColumns: 'minmax(150px, 1.3fr) minmax(90px, 0.8fr) 96px minmax(92px, 0.75fr) minmax(116px, 1fr) 54px minmax(92px, 0.85fr) 132px',
            gap: 0.55,
            px: 0.75,
            py: 0.55,
            borderRadius: 1.4,
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            mb: 0.45,
          }}
        >
          {['Employee / Position', 'Role', 'Status', 'Team', 'Crew Pattern', 'FTE', 'Availability', 'Actions'].map((label) => (
            <Typography key={label} variant="caption" sx={{ color: '#64748B', fontWeight: 950, textTransform: 'uppercase', fontSize: '0.56rem', lineHeight: 1.1 }}>
              {label}
            </Typography>
          ))}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: 300, overflow: 'auto', pr: 0.25 }}>
          {selectedScopeEmployeeRows.length ? selectedScopeEmployeeRows.map((row) => {
            const statusStyle = employeeStatusLegend.find((item) => item.label === row.status) ?? employeeStatusLegend[0];
            const isUnavailable = row.status === 'On Leave' || row.status === 'Inactive' || row.status === 'Terminated';
            const isVacant = row.status === 'Vacant';
            return (
              <Paper
                key={row.id}
                elevation={0}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'minmax(150px, 1.3fr) minmax(90px, 0.8fr) 96px minmax(92px, 0.75fr) minmax(116px, 1fr) 54px minmax(92px, 0.85fr) 132px' },
                  gap: { xs: 0.55, md: 0.55 },
                  alignItems: 'center',
                  p: 0.75,
                  borderRadius: 1.6,
                  border: `1px solid ${isVacant ? '#FED7AA' : isUnavailable ? '#CBD5E1' : '#D8E1EF'}`,
                  bgcolor: isVacant ? '#FFFBEB' : isUnavailable ? '#F8FAFC' : '#FFFFFF',
                  opacity: row.status === 'Terminated' ? 0.7 : 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, minWidth: 0 }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: isVacant ? '#FFF7ED' : '#EEF4FF', color: isVacant ? '#C2410C' : activeTheme.primary, fontWeight: 900, fontSize: '0.7rem' }}>
                    {isVacant ? <PersonOffIcon sx={{ fontSize: 16 }} /> : resolveInitials(row.employeePosition)}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ color: '#1F2937', fontWeight: 950, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.employeePosition}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 750, fontSize: '0.6rem', display: { xs: 'block', md: 'none' } }}>
                      {row.role} - {row.team} - {row.crewPattern}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ color: '#334155', fontWeight: 850 }}>{row.role}</Typography>
                <Chip
                  size="small"
                  label={row.status}
                  sx={{ height: 22, bgcolor: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, fontWeight: 900, '& .MuiChip-label': { px: 0.7, fontSize: '0.6rem' } }}
                />
                <Typography variant="caption" sx={{ color: '#334155', fontWeight: 850 }}>{row.team}</Typography>
                <Typography variant="caption" sx={{ color: '#334155', fontWeight: 850 }}>{row.crewPattern}</Typography>
                <Typography variant="caption" sx={{ color: row.fte === '0.00' ? '#C2410C' : '#0F766E', fontWeight: 950 }}>{row.fte}</Typography>
                <Typography variant="caption" sx={{ color: isUnavailable || isVacant ? '#C2410C' : '#0F766E', fontWeight: 850 }}>{row.availability}</Typography>
                <Box sx={{ display: 'flex', gap: 0.45, flexWrap: 'wrap' }}>
                  <Button size="small" variant="outlined" sx={{ minHeight: 26, borderRadius: 999, textTransform: 'none', fontWeight: 850, fontSize: '0.62rem', px: 0.8 }}>
                    View details
                  </Button>
                  <Button size="small" variant="text" sx={{ minHeight: 26, borderRadius: 999, textTransform: 'none', fontWeight: 850, fontSize: '0.62rem', px: 0.8 }}>
                    Edit assignment
                  </Button>
                </Box>
              </Paper>
            );
          }) : (
            <Paper elevation={0} sx={{ p: 1.1, borderRadius: 1.8, border: '1px dashed #CBD5E1', bgcolor: '#F8FAFC' }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 850 }}>
                No employees or vacant positions match the selected scope and filters.
              </Typography>
            </Paper>
          )}
        </Box>
      </Paper>
    );
  };

  return (
    <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Paper
          elevation={0}
          sx={{
            mb: 1.6,
            px: { xs: 1.8, md: 2.2 },
            py: { xs: 1.5, md: 1.8 },
            borderRadius: 2.5,
            border: '1px solid #D8DEE8',
            bgcolor: '#FFFFFF',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) auto' },
            alignItems: 'flex-start',
            gap: 1.5,
          }}
        >
          <Box sx={{ minWidth: 0, maxWidth: 760 }}>
            <Typography variant="caption" sx={{ color: activeTheme.primary, letterSpacing: '0.08em', fontWeight: 800, lineHeight: 1, textTransform: 'uppercase' }}>
              ORGANIZATION & WORKFORCE
            </Typography>
            <Typography variant="h5" sx={{ color: activeTheme.textPrimary, fontWeight: 800, fontSize: { xs: '1.35rem', md: '1.6rem' }, lineHeight: 1.05, letterSpacing: '-0.03em', mt: 0.15 }}>
              Organization & Workforce
            </Typography>
            <Typography variant="caption" sx={{ color: activeTheme.textSecondary, mt: 0.35, display: 'block', maxWidth: 800, lineHeight: 1.3, fontSize: '0.78rem' }}>
              Manage factory hierarchy, job positions, teams, employee assignments, and workforce coverage.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', lg: 'flex-end' }, alignItems: 'flex-start', minWidth: 0 }}>
            {renderShiftSchedulePersistentActions()}
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ ...crewSetupPanelSx, p: 0.55, mb: 1.4, display: 'inline-flex', gap: 0.35, flexWrap: 'wrap' }}>
          {crewSetupViewOptions.map((option) => {
            const isActive = crewSetupView === option.value;
            return (
              <Button
                key={option.value}
                size="small"
                variant={isActive ? 'contained' : 'text'}
                onClick={() => setCrewSetupView(option.value)}
                sx={{
                  borderRadius: 2,
                  px: 1.4,
                  fontWeight: 900,
                  fontSize: '0.72rem',
                  color: isActive ? '#FFFFFF' : '#475569',
                  bgcolor: isActive ? activeTheme.primary : 'transparent',
                  '&:hover': {
                    bgcolor: isActive ? activeTheme.primary : '#F1F5F9',
                  },
                }}
              >
                {option.label}
              </Button>
            );
          })}
        </Paper>

        {crewSetupView === 'assignment' ? (
          <>
        <Paper elevation={0} sx={{ ...crewSetupPanelSx, p: 1.45, mb: 1.5, boxShadow: '0 10px 26px rgba(15,23,42,0.04)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1.1 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ color: '#1f2937', fontWeight: 800 }}>Crew Coverage Snapshot</Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                Crew-based KPIs for the current workforce setup
              </Typography>
            </Box>
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openCreateCrewDrawer} sx={{ borderRadius: 3, fontWeight: 800 }}>
              Add Crew
            </Button>
          </Box>
          <Grid container spacing={0.85}>
            {[
              { label: 'Crews Active', value: String(totalCrews), note: 'crews linked to patterns', tone: '#2563EB', bg: '#EFF6FF' },
              { label: 'Crew Members', value: `${availableEmployees}/${filteredMembers.length}`, note: 'available vs visible employees', tone: '#0F766E', bg: '#ECFDF5' },
              { label: 'Job Positions', value: String(totalPositions), note: 'positions across visible crews', tone: '#7C3AED', bg: '#F5F3FF' },
              { label: 'Empty Positions', value: String(emptyPositions), note: 'staffing gaps to resolve', tone: '#C2410C', bg: '#FFF7ED' },
            ].map((card) => (
              <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={card.label}>
                <Paper elevation={0} sx={{ p: 1.05, borderRadius: 2, border: '1px solid #E2E8F0', height: '100%', bgcolor: '#FFFFFF', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 0.85, alignItems: 'start' }}>
                  <Box sx={{ width: 8, height: 44, borderRadius: 999, bgcolor: card.tone }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" sx={crewSetupMetaLabelSx}>{card.label}</Typography>
                    <Typography sx={{ color: card.tone, fontWeight: 900, mt: 0.25, lineHeight: 1.02, fontSize: { xs: '1.08rem', md: '1.16rem' } }}>{card.value}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.64rem', lineHeight: 1.2, display: 'block', mt: 0.2 }}>{card.note}</Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ ...crewSetupPanelSx, p: 1.25, mb: 1.4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1, flexWrap: 'wrap', mb: 0.9 }}>
            <Typography variant="subtitle2" sx={{ color: '#1F2937', fontWeight: 900 }}>Filters</Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>{`${visibleCrews.length} crews shown`}</Typography>
          </Box>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, md: 2.8 }}>
              <TextField
                size="small"
                label="Search"
                placeholder="Name, role, certification..."
                value={teamManagementSearch}
                onChange={(event) => setTeamManagementSearch(event.target.value)}
                fullWidth
                InputProps={{ endAdornment: <SearchIcon sx={{ color: activeTheme.primary }} /> }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 1.8 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Crew Pattern</InputLabel>
                <Select label="Crew Pattern" value={filterValue('crewPattern')} onChange={(event) => setTeamManagementFilters((prev: any) => ({ ...prev, crewPattern: event.target.value }))}>
                  <MenuItem value="All">All</MenuItem>
                  {crewPatternOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 1.8 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Area / Line</InputLabel>
                <Select label="Area / Line" value={filterValue('areaLine')} onChange={(event) => setTeamManagementFilters((prev: any) => ({ ...prev, areaLine: event.target.value }))}>
                  <MenuItem value="All">All</MenuItem>
                  {Object.entries(lineProductNames).map(([line, product]) => <MenuItem key={line} value={line}>{`Line ${line} - ${product}`}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 1.8 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Coverage Status</InputLabel>
                <Select label="Coverage Status" value={filterValue('coverageStatus')} onChange={(event) => setTeamManagementFilters((prev: any) => ({ ...prev, coverageStatus: event.target.value }))}>
                  <MenuItem value="All">All</MenuItem>
                  {coverageStatusOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 1.8 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Position Type</InputLabel>
                <Select label="Position Type" value={filterValue('positionType')} onChange={(event) => setTeamManagementFilters((prev: any) => ({ ...prev, positionType: event.target.value }))}>
                  <MenuItem value="All">All</MenuItem>
                  {defaultPositions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 1.8 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Availability</InputLabel>
                <Select label="Availability" value={filterValue('availability')} onChange={(event) => setTeamManagementFilters((prev: any) => ({ ...prev, availability: event.target.value }))}>
                  <MenuItem value="All">All</MenuItem>
                  {availabilityOptions.map((item) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={1}>
          {visibleCrews.map((crew) => (
            <Grid size={{ xs: 12, md: 6, xl: 4 }} key={crew.id}>
              <Paper elevation={0} sx={{ borderRadius: 2.2, border: crew.emptyCount > 0 ? '1px solid #FED7AA' : '1px solid #BBF7D0', overflow: 'hidden', height: '100%', bgcolor: '#FFFFFF', boxShadow: '0 12px 30px rgba(15,23,42,0.045)' }}>
                <Box sx={{ px: 1.15, py: 1, borderBottom: '1px solid #DBE3F1', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, bgcolor: '#F8FBFF' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#2563EB', fontWeight: 900, lineHeight: 1.05 }}>{crew.name}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800 }}>{`Pattern: ${crew.pattern}`}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block' }}>{`Line ${crew.line} - ${lineProductNames[crew.line]}`}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <Chip
                      size="small"
                      label={crew.emptyCount > 0 ? `${crew.emptyCount} empty` : 'Fully covered'}
                      sx={{
                        height: 22,
                        bgcolor: crew.emptyCount > 0 ? '#FFF7ED' : '#ECFDF5',
                        color: crew.emptyCount > 0 ? '#C2410C' : '#047857',
                        border: `1px solid ${crew.emptyCount > 0 ? '#FDBA74' : '#A7F3D0'}`,
                        fontWeight: 900,
                        fontSize: '0.62rem',
                        '& .MuiChip-label': { px: 0.75 },
                      }}
                    />
                    <Button size="small" variant="outlined" startIcon={<EditIcon sx={{ fontSize: 14 }} />} onClick={() => openEditCrewDrawer(crew)} sx={{ minWidth: 0, px: 1, borderRadius: 999, fontWeight: 800, fontSize: '0.68rem' }}>
                      Edit
                    </Button>
                  </Box>
                </Box>

                <Box sx={{ px: 1, py: 0.78, borderBottom: '1px solid #E5EDF8', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 0.7, bgcolor: '#FFFFFF' }}>
                  <Box>
                    <Typography variant="caption" sx={crewSetupMetaLabelSx}>Positions</Typography>
                    <Typography variant="body2" sx={{ color: '#1F2937', fontWeight: 800 }}>{crew.positions.length}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={crewSetupMetaLabelSx}>Available</Typography>
                    <Typography variant="body2" sx={{ color: '#0F766E', fontWeight: 800 }}>{crew.availableCount}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={crewSetupMetaLabelSx}>Empty</Typography>
                    <Typography variant="body2" sx={{ color: crew.emptyCount > 0 ? '#C2410C' : '#047857', fontWeight: 900 }}>{crew.emptyCount}</Typography>
                  </Box>
                </Box>

                <Box sx={{ px: 0.9, py: 0.9, display: 'flex', flexDirection: 'column', gap: 0.7, bgcolor: '#FBFDFF' }}>
                  {crew.positions.map((position) => {
                    const member = position.employeeName ? memberLookup.get(position.employeeName) : null;
                    const statusStyle = member ? (teamManagementStatusStyles as any)[member.status] : null;
                    return (
                      <Paper
                        key={`${crew.id}-${position.id}`}
                        elevation={0}
                        onClick={() => member ? setSelectedTeamManagementMemberName(member.name) : undefined}
                        sx={{
                          px: 0.85,
                          py: 0.75,
                          borderRadius: 1.8,
                          border: member ? '1px solid #D9E3F2' : '1px dashed #F97316',
                          borderLeft: member ? '1px solid #D9E3F2' : '4px solid #F97316',
                          bgcolor: member ? '#FFFFFF' : '#FFF7ED',
                          cursor: member ? 'pointer' : 'default',
                          transition: 'all 0.2s ease',
                          minHeight: 74,
                          '&:hover': member ? { boxShadow: '0 8px 18px rgba(15,23,42,0.07)', transform: 'translateY(-1px)' } : undefined,
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.75, alignItems: 'flex-start' }}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ color: '#1F2937', fontWeight: 900, lineHeight: 1.05 }}>{position.title}</Typography>
                            {member ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mt: 0.55 }}>
                                <Avatar src={member.photo} alt={member.name} sx={{ width: 28, height: 28, bgcolor: member.avatarTone, color: '#1F2937', fontWeight: 800, fontSize: 12 }}>
                                  {resolveInitials(member.name)}
                                </Avatar>
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography variant="caption" sx={{ color: '#1F2937', fontWeight: 800, display: 'block', lineHeight: 1.1 }}>{member.name}</Typography>
                                  <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 700, display: 'block', lineHeight: 1.1 }}>
                                    {member.certifications?.map((certification) => `${certification.name} ${certification.expires}`).join(' / ') || member.certification}
                                  </Typography>
                                </Box>
                              </Box>
                            ) : (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, mt: 0.55, flexWrap: 'wrap' }}>
                                <Chip
                                  size="small"
                                  label="Empty"
                                  sx={{
                                    height: 20,
                                    bgcolor: '#FFEDD5',
                                    color: '#9A3412',
                                    border: '1px solid #FDBA74',
                                    fontWeight: 900,
                                    fontSize: '0.62rem',
                                    '& .MuiChip-label': { px: 0.75 },
                                  }}
                                />
                                <Typography variant="caption" sx={{ color: '#C2410C', fontWeight: 900 }}>
                                  Assigned: Empty
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          {member ? (
                            <Chip
                              size="small"
                              label={member.statusDetail}
                              sx={{
                                maxWidth: 132,
                                height: 22,
                                bgcolor: statusStyle.bg,
                                color: statusStyle.fg,
                                border: `1px solid ${statusStyle.border}`,
                                borderRadius: 999,
                                fontWeight: 900,
                                fontSize: '0.63rem',
                                boxShadow: '0 1px 0 rgba(15,23,42,0.04)',
                                '& .MuiChip-label': { px: 0.75 },
                              }}
                            />
                          ) : null}
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
          </>
        ) : (
          <>
          <Paper elevation={0} sx={{ ...crewSetupPanelSx, p: { xs: 1.15, md: 1.35 }, mb: 1.2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1fr) auto' }, gap: 1.2, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', alignItems: 'center', minWidth: 0 }}>
                <Chip label="Plant: BD Columbus West" size="small" sx={{ bgcolor: '#EFF6FF', color: activeTheme.primary, border: '1px solid #BFDBFE', fontWeight: 900 }} />
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 800, lineHeight: 1.25 }}>
                  {selectedOrganizationPathLabel}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', justifyContent: { xs: 'flex-start', xl: 'flex-end' }, flexWrap: 'wrap' }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800 }}>
                  Last synchronization: {organizationSyncTimestamp}
                </Typography>
                {organizationSyncMessage ? (
                  <Chip
                    size="small"
                    label={organizationSyncMessage}
                    sx={{ bgcolor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', fontWeight: 900 }}
                  />
                ) : null}
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<SyncIcon sx={{ fontSize: 16 }} />}
                  onClick={() => {
                    setOrganizationSyncTimestamp('Jul 07, 2026 02:15 PM');
                    setOrganizationSyncMessage('Mock sync completed');
                  }}
                  sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 900 }}
                >
                  Sync Now
                </Button>
              </Box>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ ...crewSetupPanelSx, p: 1.1, mb: 1.2 }}>
            <Grid container spacing={0.9} alignItems="center">
              <Grid size={{ xs: 12, md: 4.2 }}>
                <TextField
                  size="small"
                  label="Search organization"
                  placeholder="Search organization..."
                  value={organizationSearch}
                  onChange={(event) => setOrganizationSearch(event.target.value)}
                  fullWidth
                  InputProps={{ endAdornment: <SearchIcon sx={{ color: activeTheme.primary }} /> }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4, md: 2.4 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select label="Role" value={organizationRoleFilter} onChange={(event) => setOrganizationRoleFilter(event.target.value)}>
                    {organizationRoleFilterOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4, md: 2.4 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Availability</InputLabel>
                  <Select label="Availability" value={organizationAvailabilityFilter} onChange={(event) => setOrganizationAvailabilityFilter(event.target.value)}>
                    {organizationAvailabilityFilterOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4, md: 2.4 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Crew Pattern</InputLabel>
                  <Select label="Crew Pattern" value={organizationCrewPatternFilter} onChange={(event) => setOrganizationCrewPatternFilter(event.target.value)}>
                    {organizationCrewPatternFilterOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 0.6 }}>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => {
                    setOrganizationSearch('');
                    setOrganizationRoleFilter('All roles');
                    setOrganizationAvailabilityFilter('All');
                    setOrganizationCrewPatternFilter('All patterns');
                  }}
                  sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 900 }}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: isAssignmentAiOpen
                  ? '72px minmax(0, 1fr) minmax(360px, 400px)'
                  : isOrganizationTreeCollapsed
                    ? '72px minmax(0, 1fr)'
                    : `${organizationTreeWidth}px 10px minmax(0, 1fr)`,
              },
              gap: { xs: 1.1, lg: isAssignmentAiOpen || isOrganizationTreeCollapsed ? 1 : 0 },
              alignItems: 'stretch',
              mb: 1.2,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              {isOrganizationTreeCollapsed ? (
                <Paper elevation={0} sx={{ ...crewSetupPanelSx, p: 0.75, height: '100%', minHeight: 560, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.8 }}>
                  <IconButton
                    size="small"
                    onClick={toggleOrganizationTreeCollapsed}
                    aria-label="Expand organization tree"
                    sx={{ color: activeTheme.primary, border: '1px solid #BFDBFE', bgcolor: '#EFF6FF' }}
                  >
                    <ChevronRightIcon sx={{ fontSize: 17 }} />
                  </IconButton>
                  <Box sx={{ width: 34, height: 34, borderRadius: 1.8, display: 'grid', placeItems: 'center', bgcolor: '#EEF4FF', color: activeTheme.primary }}>
                    <AccountTreeIcon sx={{ fontSize: 19 }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 950, writingMode: 'vertical-rl', textOrientation: 'mixed', letterSpacing: 0, lineHeight: 1.1 }}>
                    ORG
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 850, textAlign: 'center', lineHeight: 1.1, mt: 'auto' }}>
                    {selectedOrganizationNode.name.split(' ')[0]}
                  </Typography>
                </Paper>
              ) : (
                <Paper elevation={0} sx={{ ...crewSetupPanelSx, p: 1.1, height: '100%', minHeight: 560 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.85, gap: 1 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#1F2937', fontWeight: 950, lineHeight: 1.1 }}>
                        Organization Tree
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 750 }}>
                        Select a scope to inspect workforce context.
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
                      <IconButton
                        size="small"
                        onClick={toggleOrganizationTreeCollapsed}
                        aria-label="Collapse organization tree"
                        sx={{ color: '#64748B' }}
                      >
                        <ChevronRightIcon sx={{ fontSize: 17, transform: 'rotate(180deg)' }} />
                      </IconButton>
                      <AccountTreeIcon sx={{ color: activeTheme.primary, fontSize: 20 }} />
                    </Box>
                  </Box>
                  <Box sx={{ maxHeight: 500, overflow: 'auto', pr: 0.35 }}>
                    {renderOrganizationTreeNode(filteredOrganizationTree)}
                  </Box>
                </Paper>
              )}
            </Box>

            {!isOrganizationTreeCollapsed && !isAssignmentAiOpen ? (
              <Box
                onMouseDown={startOrganizationSplitterResize}
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize organization workspace"
                sx={{
                  display: { xs: 'none', lg: 'flex' },
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'col-resize',
                  mx: 0.5,
                  borderRadius: 999,
                  '&::before': {
                    content: '""',
                    width: 4,
                    height: 44,
                    borderRadius: 999,
                    bgcolor: '#CBD5E1',
                    boxShadow: '0 0 0 1px rgba(148,163,184,0.18)',
                  },
                  '&:hover::before': {
                    bgcolor: activeTheme.primary,
                  },
                }}
              />
            ) : null}

            <Box sx={{ minWidth: 0 }}>
              <Paper elevation={0} sx={{ ...crewSetupPanelSx, p: 1.25, height: '100%', minHeight: 560 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap', mb: 0.8 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" sx={crewSetupMetaLabelSx}>Workspace</Typography>
                    <Typography variant="h6" sx={{ color: '#0F172A', fontWeight: 950, lineHeight: 1.1, mt: 0.2 }}>
                      {selectedOrganizationNode.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, display: 'block', mt: 0.25, lineHeight: 1.25 }}>
                      {selectedOrganizationPathLabel}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={selectedOrganizationNode.type}
                    sx={{ bgcolor: '#F8FAFC', color: '#475569', border: '1px solid #CBD5E1', fontWeight: 900 }}
                  />
                </Box>

                <Paper elevation={0} sx={{ mb: 0.8, p: 0.45, borderRadius: 1.8, border: '1px solid #E2E8F0', bgcolor: '#F8FAFC', display: 'flex', gap: 0.35, flexWrap: 'wrap' }}>
                  {organizationWorkspaceTabs.map((tab) => {
                    const isActive = selectedOrganizationScopeTab === tab.value;
                    return (
                      <Button
                        key={tab.value}
                        size="small"
                        variant={isActive ? 'contained' : 'text'}
                        onClick={() => setSelectedOrganizationScopeTab(tab.value)}
                        sx={{
                          borderRadius: 1.5,
                          textTransform: 'none',
                          fontWeight: 900,
                          minHeight: 30,
                          color: isActive ? '#FFFFFF' : '#475569',
                          bgcolor: isActive ? activeTheme.primary : 'transparent',
                          '&:hover': { bgcolor: isActive ? activeTheme.primary : '#EEF2F7' },
                        }}
                      >
                        {tab.label}
                      </Button>
                    );
                  })}
                </Paper>

                {renderSelectedScopeTabContent()}
              </Paper>
            </Box>

            {isAssignmentAiOpen ? (
              <Box sx={{ minWidth: 0 }}>
                {renderAssignmentAiPanel()}
              </Box>
            ) : null}
          </Box>

          <Paper elevation={0} sx={{ ...crewSetupPanelSx, p: 1, mb: 1.4 }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.58rem', display: 'block', mb: 0.7 }}>
              Employee status legend
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.55, flexWrap: 'wrap' }}>
              {employeeStatusLegend.map((item) => (
                <Chip
                  key={item.label}
                  size="small"
                  label={`${item.label}: ${item.description}`}
                  sx={{ bgcolor: item.bg, color: item.color, border: `1px solid ${item.border}`, fontWeight: 850, '& .MuiChip-label': { px: 0.8, fontSize: '0.62rem' } }}
                />
              ))}
            </Box>
          </Paper>
          </>
        )}

        <Drawer
          anchor="right"
          open={isCrewEditorOpen}
          onClose={() => setIsCrewEditorOpen(false)}
          PaperProps={{
            sx: {
              width: { xs: '100%', sm: 460 },
              p: 0,
              bgcolor: '#FFFFFF',
              borderLeft: '1px solid rgba(148,163,184,0.16)',
              boxShadow: '-12px 0 34px rgba(15,23,42,0.10)',
            },
          }}
        >
          <Box sx={{ px: 2.2, py: 1.8, borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FBFF 100%)' }}>
            <Box>
              <Typography variant="h6" sx={{ color: activeTheme.primary, fontWeight: 800 }}>
                {crewEditorForm.id ? 'Edit Crew' : 'Add Crew'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#667085', fontWeight: 600 }}>
                Link a crew to a pattern and assign employees by position
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setIsCrewEditorOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ p: 1.6, display: 'flex', flexDirection: 'column', gap: 1.2, overflowY: 'auto' }}>
            <TextField size="small" label="Crew Name" value={crewEditorForm.name} onChange={(event) => setCrewEditorForm((prev) => ({ ...prev, name: event.target.value }))} fullWidth />

            <FormControl size="small" fullWidth>
              <InputLabel>Crew Pattern</InputLabel>
              <Select label="Crew Pattern" value={crewEditorForm.pattern} onChange={(event) => setCrewEditorForm((prev) => ({ ...prev, pattern: event.target.value }))}>
                {crewPatternOptions.map((pattern) => <MenuItem key={pattern} value={pattern}>{pattern}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Production Line</InputLabel>
              <Select label="Production Line" value={crewEditorForm.line} onChange={(event) => setCrewEditorForm((prev) => ({ ...prev, line: event.target.value }))}>
                {Object.entries(lineProductNames).map(([line, product]) => <MenuItem key={line} value={line}>{`Line ${line} - ${product}`}</MenuItem>)}
              </Select>
            </FormControl>

            <Paper elevation={0} sx={{ p: 1.05, borderRadius: 2.2, border: '1px solid #E5E7EB', bgcolor: '#FFFFFF' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 900, textTransform: 'uppercase' }}>Job Positions</Typography>
              <Box sx={{ mt: 0.8, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                {crewEditorForm.positions.map((position) => (
                  <FormControl key={position.id} size="small" fullWidth>
                    <InputLabel>{position.title}</InputLabel>
                    <Select label={position.title} value={position.employeeName ?? '__empty__'} onChange={(event) => updatePosition(position.id, event.target.value)}>
                      <MenuItem value="__empty__">
                        <ListItemText primary="Empty" secondary="Keep this job position visible as a staffing gap" />
                      </MenuItem>
                      {teamManagementMembers.map((member) => (
                        <MenuItem key={`${position.id}-${member.name}`} value={member.name}>
                          <Checkbox checked={position.employeeName === member.name} />
                          <ListItemText primary={member.name} secondary={`${member.role} - ${member.certification}`} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ))}
              </Box>
            </Paper>

            <Paper elevation={0} sx={{ p: 1.05, borderRadius: 2.2, border: '1px solid #DBEAFE', bgcolor: '#F8FBFF' }}>
              <Typography variant="caption" sx={{ color: '#1D4ED8', fontWeight: 900, textTransform: 'uppercase' }}>Structure Preview</Typography>
              <Typography variant="body2" sx={{ color: '#1F2937', fontWeight: 800, mt: 0.45 }}>
                {crewEditorForm.pattern} {'->'} {crewEditorForm.name || 'New Crew'} {'->'} Job Positions {'->'} Employees
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.35 }}>
                {crewEditorForm.positions.filter((position) => position.employeeName).length}/{crewEditorForm.positions.length} positions assigned
              </Typography>
            </Paper>
          </Box>

          <Box sx={{ mt: 'auto', p: 1.5, borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', gap: 1 }}>
            <Button variant="text" onClick={() => setIsCrewEditorOpen(false)} sx={{ fontWeight: 800 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={saveCrew} sx={{ borderRadius: 999, fontWeight: 800 }}>
              Save Crew
            </Button>
          </Box>
        </Drawer>
      </Paper>
    </Box>
  );
};

export default ShiftTeamManagementScreen;
