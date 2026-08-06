import { useState, useRef } from 'react';
import { AiMessage } from '../types';
import { isMaintenanceSummaryPrompt } from '../components/maintenanceSummaryData';
import {
  actionTrackerRows,
  customNotificationRules,
  notificationAlerts,
  shiftLogItems,
} from '../../data/mockData';
import { teamManagementMembers } from '../../shiftManagement/data/teamData';

interface UseAiChatProps {
  setCurrentScreen: (screen: any) => void;
  setIsAiDrawerOpen: (open: boolean) => void;
  setSelectedArtifact: (artifact: any) => void;
  currentUserName: string;
  aiMessages: AiMessage[];
  setAiMessages: React.Dispatch<React.SetStateAction<AiMessage[]>>;
  homeChatInput: string;
  setHomeChatInput: (input: string) => void;
}

type RouteAction = {
  label: string;
  action: () => void;
  accent?: string;
  text?: string;
};

type OperationalReply = {
  answer: string;
  action?: RouteAction;
  variant?: AiMessage['variant'];
};

type OperationalLineSnapshot = {
  id: 'line-a' | 'line-b' | 'line-10';
  label: string;
  aliases: string[];
  site: string;
  area: string;
  cell: string;
  oeeToday: number;
  oeeYesterday: number;
  oeeWeek: number;
  throughput: string;
  downtimeMinutes: number;
  downtimeReason: string;
  downtimeAsset: string;
  qualityIssue: string;
  missingRole?: string;
  notesSummary: string;
  workOrderIds: string[];
};

type AssetRecord = {
  id: string;
  name: string;
  line: string;
  condition: 'Critical' | 'Warning' | 'Stable';
  status: string;
  overdueWorkOrders: string[];
  history: string[];
  missingParts: string[];
};

type WorkOrderRecord = {
  id: string;
  title: string;
  line: string;
  asset: string;
  status: string;
  due: string;
  priority: string;
  partsNeeded: string[];
  missingParts: string[];
};

type SparePartRecord = {
  id: string;
  name: string;
  assetAliases: string[];
  onHand: number;
  reserved: number;
  status: 'Available' | 'Low' | 'Missing';
};

type DocumentRecord = {
  id: string;
  name: string;
  type: string;
  description: string;
  tags: string[];
  site: string;
  line: string;
  asset?: string;
  modified: string;
  owner: string;
};

type PlannedStopRecord = {
  id: string;
  title: string;
  window: string;
  scope: string;
  owner: string;
};

type TrainingRecord = {
  person: string;
  course: string;
  due: string;
  status: 'Due Soon' | 'Overdue' | 'Current';
};

const artifactCatalogSeed = [
  {
    id: 'ART-LINE10-SOP',
    name: 'Line 10 Setup SOP',
    type: 'DOCX',
    status: 'Approved',
    version: 'v9',
    owner: 'Operations Excellence',
    approver: 'Madison Brooks',
    modified: '2 hours ago',
    modifiedBy: 'Harper Lewis',
    reviewDate: '08/18/2026',
    site: 'Columbus West',
    line: 'Line 10',
    asset: 'Filling Machine FM-200',
  },
  {
    id: 'ART-FILLER-MANUAL',
    name: 'Filling Machine Equipment Manual',
    type: 'PDF',
    status: 'Approved',
    version: 'v12',
    owner: 'Maintenance',
    approver: 'Chris Klopp',
    modified: '1 day ago',
    modifiedBy: 'Chris Klopp',
    reviewDate: '09/12/2026',
    site: 'Columbus West',
    line: 'Line A',
    asset: 'Filling Machine FM-200',
  },
  {
    id: 'ART-SHUTDOWN-PROC',
    name: 'Shutdown and Restart Procedure',
    type: 'PDF',
    status: 'Approved',
    version: 'v7',
    owner: 'Operations',
    approver: 'Elena Rodriguez',
    modified: '5 days ago',
    modifiedBy: 'Avery Carter',
    reviewDate: '10/01/2026',
    site: 'Columbus West',
    line: 'Line A',
    asset: 'Conveyor CV-101',
  },
  {
    id: 'ART-SITE-OVERVIEW',
    name: 'Columbus West Site Profile & Operating Story',
    type: 'PDF',
    status: 'Approved',
    version: 'v4',
    owner: 'Site Leadership',
    approver: 'Robert Chen',
    modified: '3 days ago',
    modifiedBy: 'Maddison Brooks',
    reviewDate: '11/04/2026',
    site: 'Columbus West',
    line: 'Site',
    asset: 'Site Overview',
  },
];

const lineSnapshots: OperationalLineSnapshot[] = [
  {
    id: 'line-a',
    label: 'Line A',
    aliases: ['line a', 'linea', 'line 1', 'line 10', 'packaging line 10'],
    site: 'Columbus West',
    area: 'Area A',
    cell: 'Cell 10',
    oeeToday: 72,
    oeeYesterday: 78,
    oeeWeek: 74,
    throughput: '81% of target',
    downtimeMinutes: 42,
    downtimeReason: 'Conveyor CV-101 motor trip and restart recovery',
    downtimeAsset: 'Conveyor CV-101',
    qualityIssue: 'QA Inspector gap during the afternoon shift',
    missingRole: 'QA Inspector',
    notesSummary: 'Centerlining verification stayed open after the last adapter changeover.',
    workOrderIds: ['WO-2481', 'WO-2604'],
  },
  {
    id: 'line-b',
    label: 'Line B',
    aliases: ['line b', 'lineb', 'line 2', 'packaging line 2'],
    site: 'Columbus West',
    area: 'Area B',
    cell: 'Cell 20',
    oeeToday: 81,
    oeeYesterday: 84,
    oeeWeek: 82,
    throughput: '92% of target',
    downtimeMinutes: 18,
    downtimeReason: 'Short labeler micro-stops during SKU transition',
    downtimeAsset: 'Labeler LB-02',
    qualityIssue: 'Minor scrap increase during changeover',
    notesSummary: 'Line remained stable after the first hour with one minor label verification stop.',
    workOrderIds: ['WO-2610'],
  },
  {
    id: 'line-10',
    label: 'Line 10',
    aliases: ['line 10', 'packaging line 10', 'autoguard line 10'],
    site: 'Columbus West',
    area: 'Area A',
    cell: 'Cell 10',
    oeeToday: 72,
    oeeYesterday: 78,
    oeeWeek: 74,
    throughput: '81% of target',
    downtimeMinutes: 42,
    downtimeReason: 'Conveyor CV-101 motor trip and restart recovery',
    downtimeAsset: 'Conveyor CV-101',
    qualityIssue: 'QA Inspector gap during the afternoon shift',
    missingRole: 'QA Inspector',
    notesSummary: 'Bearing watch remained active in shift notes after the morning restart.',
    workOrderIds: ['WO-2481', 'WO-2604'],
  },
];

const workOrders: WorkOrderRecord[] = [
  {
    id: 'WO-2481',
    title: 'Conveyor CV-101 verification',
    line: 'Line 10',
    asset: 'Conveyor CV-101',
    status: 'Open',
    due: 'Today 14:30',
    priority: 'High',
    partsNeeded: ['Bearing kit BRG-220', 'Photoeye PE-14'],
    missingParts: ['Bearing kit BRG-220'],
  },
  {
    id: 'WO-2604',
    title: 'Filling machine seal inspection',
    line: 'Line A',
    asset: 'Filling Machine FM-200',
    status: 'Overdue',
    due: 'Yesterday 18:00',
    priority: 'High',
    partsNeeded: ['Seal set SS-19'],
    missingParts: [],
  },
  {
    id: 'WO-2610',
    title: 'Labeler LB-02 sensor calibration',
    line: 'Line B',
    asset: 'Labeler LB-02',
    status: 'Scheduled',
    due: 'Tomorrow 09:00',
    priority: 'Medium',
    partsNeeded: ['Calibration kit CK-12'],
    missingParts: [],
  },
];

const assetRecords: AssetRecord[] = [
  {
    id: 'CV-101',
    name: 'Conveyor CV-101',
    line: 'Line 10',
    condition: 'Critical',
    status: 'Elevated vibration and repeat downtime',
    overdueWorkOrders: ['WO-2481'],
    history: [
      'Jun 29: motor trip during second shift restart',
      'Jun 30: bearing noise logged in shift notes',
      'Jul 01: work order WO-2481 opened for verification',
    ],
    missingParts: ['Bearing kit BRG-220'],
  },
  {
    id: 'FM-200',
    name: 'Filling Machine FM-200',
    line: 'Line A',
    condition: 'Warning',
    status: 'Seal inspection still open',
    overdueWorkOrders: ['WO-2604'],
    history: [
      'Jun 24: routine seal inspection requested',
      'Jun 28: minor pressure instability observed',
      'Jul 01: QA requested repeat verification before next weekend run',
    ],
    missingParts: [],
  },
  {
    id: 'LB-02',
    name: 'Labeler LB-02',
    line: 'Line B',
    condition: 'Stable',
    status: 'Sensor calibration scheduled',
    overdueWorkOrders: [],
    history: [
      'Jun 27: micro-stop trend observed during SKU transition',
      'Jun 30: calibration task created for preventive follow-up',
    ],
    missingParts: [],
  },
];

const sparePartsInventory: SparePartRecord[] = [
  {
    id: 'BRG-220',
    name: 'Bearing kit BRG-220',
    assetAliases: ['conveyor cv-101', 'cv-101', 'conveyor'],
    onHand: 0,
    reserved: 1,
    status: 'Missing',
  },
  {
    id: 'SS-19',
    name: 'Seal set SS-19',
    assetAliases: ['filling machine fm-200', 'fm-200', 'filling machine'],
    onHand: 4,
    reserved: 1,
    status: 'Available',
  },
  {
    id: 'PE-14',
    name: 'Photoeye PE-14',
    assetAliases: ['conveyor cv-101', 'cv-101'],
    onHand: 2,
    reserved: 1,
    status: 'Low',
  },
];

const documentRecords: DocumentRecord[] = [
  {
    id: 'DOC-1001',
    name: 'Line 10 Setup SOP',
    type: 'DOCX',
    description: 'Step-by-step startup, setup, and handoff for Columbus West Line 10.',
    tags: ['sop', 'line 10', 'setup', 'startup'],
    site: 'Columbus West',
    line: 'Line 10',
    asset: 'Filling Machine FM-200',
    modified: '2 hours ago',
    owner: 'Operations Excellence',
  },
  {
    id: 'DOC-1002',
    name: 'Filling Machine Equipment Manual',
    type: 'PDF',
    description: 'Maintenance and troubleshooting manual for the filling machine.',
    tags: ['manual', 'filling machine', 'equipment', 'maintenance'],
    site: 'Columbus West',
    line: 'Line A',
    asset: 'Filling Machine FM-200',
    modified: '1 day ago',
    owner: 'Maintenance',
  },
  {
    id: 'DOC-1003',
    name: 'Shutdown and Restart Procedure',
    type: 'PDF',
    description: 'Safe shutdown, lockout, and restart checklist for line operations.',
    tags: ['shutdown', 'restart', 'procedure', 'planned stop'],
    site: 'Columbus West',
    line: 'Line A',
    asset: 'Conveyor CV-101',
    modified: '5 days ago',
    owner: 'Operations',
  },
];

const plannedStops: PlannedStopRecord[] = [
  {
    id: 'STOP-2026-XMAS',
    title: 'Christmas Shutdown',
    window: 'December 24, 2026 18:00 to December 27, 2026 06:00',
    scope: 'Columbus West / Line A / Utilities and packaging assets',
    owner: 'Maintenance Planning',
  },
  {
    id: 'STOP-2026-Q4',
    title: 'Q4 Preventive Maintenance Window',
    window: 'October 11, 2026 07:00 to October 11, 2026 16:00',
    scope: 'Line 10 and upstream conveyors',
    owner: 'Maintenance Planning',
  },
];

const trainingRecords: TrainingRecord[] = [
  { person: 'Maria Pinna', course: 'Workflow Optimization Recertification', due: 'This week', status: 'Due Soon' },
  { person: 'Lucas Hayes', course: 'First Aid Renewal', due: 'Before weekend shift', status: 'Due Soon' },
  { person: 'James Walker', course: 'GMP Refresher', due: 'Overdue by 3 days', status: 'Overdue' },
];

const crewAssignments = [
  { crew: 'Crew A', day: 'weekday', shift: 'Morning', lines: ['Line A', 'Line B'] },
  { crew: 'Crew B', day: 'weekend', shift: 'Night', lines: ['Line A', 'Line B'] },
  { crew: 'Crew B', day: 'weekday', shift: 'Afternoon', lines: ['Line B'] },
];

const siteOverview = {
  name: 'Columbus West',
  banner: 'Columbus West remains the primary focus site this week because Line 10 is below OEE target.',
  kpis: ['OEE 72%', 'Delivery 81%', 'Open Actions 4', 'Open Work Orders 3'],
  leadership: ['Robert Chen', 'Elena Rodriguez', 'Maddison Brooks'],
  today: 'Top operational risks are conveyor downtime, afternoon QA coverage, and one overdue seal inspection.',
};

const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, ' ').trim();
const includesAny = (value: string, terms: string[]) => terms.some((term) => value.includes(term));
const unique = <T,>(items: T[]) => Array.from(new Set(items));

const formatList = (items: string[]) => {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
};

const getLineLabel = (member: { line: string }) => {
  if (member.line === 'A') return 'Line A';
  if (member.line === 'B') return 'Line B';
  return member.line;
};

const findLineSnapshot = (prompt: string) => {
  const normalized = normalize(prompt);
  return lineSnapshots.find((line) => line.aliases.some((alias) => normalized.includes(alias))) ?? lineSnapshots[0];
};

const findTeamMember = (prompt: string) => {
  const normalized = normalize(prompt);
  return teamManagementMembers.find((member) => normalized.includes(normalize(member.name)));
};

const findAsset = (prompt: string) => {
  const normalized = normalize(prompt);
  return assetRecords.find((asset) => (
    normalized.includes(normalize(asset.id))
    || normalized.includes(normalize(asset.name))
  ));
};

const findWorkOrdersForLine = (lineLabel: string) => workOrders.filter((order) => normalize(order.line).includes(normalize(lineLabel)));

const findDocument = (prompt: string) => {
  const normalized = normalize(prompt);
  return documentRecords.find((document) => (
    normalized.includes(normalize(document.name))
    || document.tags.some((tag) => normalized.includes(tag))
    || (document.asset && normalized.includes(normalize(document.asset)))
  )) ?? documentRecords[0];
};

const matchesRole = (member: { role: string }, role?: string) => !role || normalize(member.role).includes(role);
const matchesShift = (member: { shift: string }, shift?: string) => !shift || normalize(member.shift).includes(shift);
const matchesLine = (member: { line: string }, line?: string) => !line || normalize(getLineLabel(member)).includes(line);

const extractShift = (prompt: string) => {
  const normalized = normalize(prompt);
  if (normalized.includes('night')) return 'night';
  if (normalized.includes('afternoon')) return 'afternoon';
  if (normalized.includes('morning')) return 'morning';
  if (normalized.includes('weekend')) return 'weekend';
  return undefined;
};

const extractRole = (prompt: string) => {
  const normalized = normalize(prompt);
  if (normalized.includes('qa inspector')) return 'qa inspector';
  if (normalized.includes('technician')) return 'technician';
  if (normalized.includes('operator')) return 'operator';
  return undefined;
};

const buildDateLabel = (offsetDays = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(date);
};

export const useAiChat = ({
  setCurrentScreen,
  setIsAiDrawerOpen,
  setSelectedArtifact,
  currentUserName,
  aiMessages,
  setAiMessages,
  homeChatInput,
  setHomeChatInput,
}: UseAiChatProps) => {
  const [aiInput, setAiInput] = useState('');
  const [chatShareNotice, setChatShareNotice] = useState('');
  const proactiveSuggestionIndexRef = useRef(0);

  const recentChatCommands = aiMessages
    .filter((message) => message.role === 'user')
    .map((message) => message.text)
    .slice(-8)
    .reverse();

  const openArtifactRecord = (artifactName: string) => {
    const key = normalize(artifactName);
    const artifact = artifactCatalogSeed.find((item) => (
      key.includes(normalize(item.name))
      || normalize(item.name).includes(key)
      || normalize(item.asset).includes(key)
    )) ?? artifactCatalogSeed[0];
    setSelectedArtifact(artifact);
    setCurrentScreen('artifact_detail');
    return artifact;
  };

  const directOpenArtifactFromPrompt = (prompt: string) => {
    const document = findDocument(prompt);
    const artifact = openArtifactRecord(document.name);
    return artifact;
  };

  const resolveAiCommand = (message: string) => {
    const normalized = normalize(message);
    const isNavigationIntent = /(open|go to|show|take me|navigate|launch|access|i want|i need|please open)/.test(normalized);
    const directRouteRequest = /^(document management|doc manager|documents|workflow|smart search|maintenance|shift schedule|team management|shift logbook|action tracker|notification|notifications|alert|alerts|tier meeting|control tower|work order|eso|line performance|cilt|artifact|file)\b/.test(normalized);
    if (!isNavigationIntent && !directRouteRequest) return null;

    const openScreen = (screen: any) => {
      setCurrentScreen(screen);
    };

    if (normalized.includes('artifact') || normalized.includes('file')) {
      const artifact = directOpenArtifactFromPrompt(normalized);
      return `Opened artifact: ${artifact.name}.`;
    }
    if (normalized.includes('document management') || normalized.includes('doc manager') || normalized.includes('documents')) {
      openScreen('document_management');
      return 'Opened Document Management.';
    }
    if (normalized.includes('workflow')) {
      openScreen('workflow_engine');
      return 'Opened Document Workflow Planner.';
    }
    if (normalized.includes('smart search') || normalized === 'search') {
      openScreen('smart_search');
      return 'Opened Smart Search.';
    }
    if (normalized.includes('maintenance')) {
      openScreen('maintenance_hub');
      return 'Opened Maintenance Hub.';
    }
    if (normalized.includes('team management') || normalized.includes('crew summary')) {
      openScreen('team_management');
      return 'Opened Team Management.';
    }
    if (normalized.includes('shift schedule') || normalized === 'schedule') {
      openScreen('shift_schedule_overview');
      return 'Opened Shift Schedule.';
    }
    if (normalized.includes('shift logbook') || normalized.includes('shift notes') || normalized.includes('logbook')) {
      openScreen('shift_logbook');
      return 'Opened Shift Logbook.';
    }
    if (normalized.includes('action tracker') || normalized === 'actions') {
      openScreen('action_tracker');
      return 'Opened Action Tracker.';
    }
    if (normalized.includes('notification') || normalized.includes('alert')) {
      openScreen('notification_dashboard');
      return 'Opened Notification Dashboard.';
    }
    if (normalized.includes('tier') || normalized.includes('meeting')) {
      openScreen('tier_meeting');
      return 'Opened Tier Meeting.';
    }
    if (normalized.includes('control tower')) {
      openScreen('control_tower');
      return 'Opened Control Tower.';
    }
    if (normalized.includes('global view') || normalized === 'global') {
      openScreen('global_view');
      return 'Opened Global View.';
    }
    if (normalized.includes('work order')) {
      openScreen('work_order_hub');
      return 'Opened Work Order Hub.';
    }
    if (normalized.includes('eso')) {
      openScreen('eso_hub');
      return 'Opened ESO.';
    }
    if (normalized.includes('line performance')) {
      openScreen('line_performance');
      return 'Opened Line Performance.';
    }
    if (normalized.includes('cilt')) {
      openScreen('cil_kpis');
      return 'Opened CIL.';
    }
    if (normalized.includes('centerline')) {
      openScreen('centerline_kpis');
      return 'Opened Centerline.';
    }
    if (normalized.includes('changeover')) {
      openScreen('equipment_changeover');
      return 'Opened Equipment Changeover.';
    }
    return null;
  };

  const buildWorkforceReply = (prompt: string): OperationalReply => {
    const normalized = normalize(prompt);
    const shift = extractShift(prompt);
    const role = extractRole(prompt);
    const line = findLineSnapshot(prompt);
    const filteredMembers = teamManagementMembers.filter((member) => (
      matchesLine(member, normalize(line.label))
      && matchesShift(member, shift && shift !== 'weekend' ? shift : undefined)
      && matchesRole(member, role)
    ));

    if (normalized.includes('who can replace') || normalized.includes('replace ')) {
      const person = findTeamMember(prompt);
      if (person) {
        const replacements = teamManagementMembers.filter((member) => (
          member.name !== person.name
          && member.role === person.role
          && member.shift === person.shift
          && member.status === 'available'
        )).slice(0, 3);
        return {
          answer: `Best replacement options for ${person.name} are ${formatList(replacements.map((member) => member.name)) || 'no same-shift backup in the current mock roster'}.\n\nSupporting evidence: they match the ${person.shift.toLowerCase()} ${person.role.toLowerCase()} profile and already work similar equipment or adjacent line coverage.\n\nRecommended next action: review the shift board and submit the coverage change before Friday handoff.`,
          action: {
            label: 'Open Shift Schedule',
            action: () => setCurrentScreen('shift_schedule_overview'),
            accent: '#044ED7',
            text: 'Open the shift workflow and complete the replacement request.',
          },
        };
      }
    }

    if (normalized.includes('gap') || normalized.includes('coverage')) {
      const missingRole = line.missingRole ?? 'no critical role';
      const nextShiftLabel = normalized.includes('tomorrow') ? `${buildDateLabel(1)} next shift` : 'current shift';
      return {
        answer: `${line.label} has a coverage gap for ${missingRole} in the ${nextShiftLabel} roster.\n\nSupporting evidence: operators are covered, but the quality gate is not fully staffed and that creates release risk if OEE recovery work continues.\n\nRecommended next action: rebalance a QA-capable team member or open a shift swap request.`,
        action: {
          label: 'Open Shift Schedule',
          action: () => setCurrentScreen('shift_schedule_overview'),
          accent: '#044ED7',
          text: 'Open the shift schedule and resolve the coverage gap.',
        },
      };
    }

    if (normalized.includes('crew b') && normalized.includes('weekend')) {
      const assignment = crewAssignments.find((item) => item.crew === 'Crew B' && item.day === 'weekend');
      return {
        answer: `Yes. ${assignment?.crew ?? 'Crew B'} is assigned for the weekend ${assignment?.shift.toLowerCase() ?? 'night'} coverage on ${assignment?.lines.join(' and ') ?? 'the production lines'}.\n\nSupporting evidence: the mock crew plan keeps weekend recovery coverage on the night pattern so maintenance and startup gaps can be absorbed without pulling weekday leaders.\n\nRecommended next action: verify whether any QA or technician backfill is also needed.`,
        action: {
          label: 'Open Crew Summary',
          action: () => setCurrentScreen('team_management'),
          accent: '#0F766E',
          text: 'Review the crew allocation and backup depth.',
        },
      };
    }

    if (filteredMembers.length > 0) {
      const names = filteredMembers.map((member) => `${member.name} (${member.role})`);
      const timeframe = normalized.includes('tomorrow') ? `the mock roster for ${buildDateLabel(1)}` : 'today';
      return {
        answer: `${line.label} ${shift ? `${shift} shift` : 'coverage'} for ${timeframe} includes ${formatList(names)}.\n\nSupporting evidence: ${filteredMembers.map((member) => `${member.name} is ${member.statusDetail.toLowerCase()} on ${member.equipment}`).join('; ')}.\n\nRecommended next action: open the shift schedule if you want to rebalance coverage or start a swap.`,
        action: {
          label: 'Open Shift Schedule',
          action: () => setCurrentScreen('shift_schedule_overview'),
          accent: '#044ED7',
          text: 'Open the shift schedule and manage coverage.',
        },
      };
    }

    return {
      answer: `I did not find a direct staffing match for that exact combination, but the strongest current workforce signal is on ${line.label} where ${line.missingRole ?? 'one critical role'} remains the main coverage risk.\n\nSupporting evidence: current roster data shows operator coverage is mostly stable while quality and specialist backup need attention.\n\nRecommended next action: open Team Management to inspect role-based availability.`,
      action: {
        label: 'Open Team Management',
        action: () => setCurrentScreen('team_management'),
        accent: '#0F766E',
        text: 'Open Team Management and review role availability.',
      },
    };
  };

  const buildOeeReply = (prompt: string): OperationalReply => {
    const normalized = normalize(prompt);
    const line = findLineSnapshot(prompt);

    if (normalized.includes('compare')) {
      const otherLine = lineSnapshots.find((item) => item.id !== line.id && includesAny(normalized, item.aliases)) ?? lineSnapshots[1];
      return {
        answer: `${line.label} is running at ${line.oeeToday}% OEE today versus ${otherLine.label} at ${otherLine.oeeToday}%.\n\nSupporting evidence: ${line.label} lost ${line.downtimeMinutes} minutes to ${line.downtimeReason}, while ${otherLine.label} only lost ${otherLine.downtimeMinutes} minutes and stayed closer to target throughput.\n\nRecommended next action: review the downtime context on ${line.label} first because it is the weaker performer.`,
        action: {
          label: 'Open Line Performance',
          action: () => setCurrentScreen('line_performance'),
          accent: '#044ED7',
          text: 'Open the line performance view for a side-by-side drilldown.',
        },
      };
    }

    if (normalized.includes('why') || normalized.includes('drop') || normalized.includes('downtime')) {
      return {
        answer: `${line.label} OEE dropped mainly because of ${line.downtimeMinutes} minutes of downtime on ${line.downtimeAsset}, one open maintenance work order (${line.workOrderIds[0]}), and ${line.qualityIssue.toLowerCase()}.\n\nSupporting evidence: shift notes show "${line.notesSummary}", and the downtime pattern repeated after restart recovery.\n\nRecommended next action: review the work order and shift notes together before the next shift starts.`,
        action: {
          label: 'Open Work Order',
          action: () => setCurrentScreen('work_order_hub'),
          accent: '#E43B46',
          text: `Open ${line.workOrderIds[0]} and inspect the downtime follow-up.`,
        },
      };
    }

    if (normalized.includes('worst') || normalized.includes('lowest')) {
      const worst = [...lineSnapshots].sort((a, b) => a.oeeWeek - b.oeeWeek)[0];
      return {
        answer: `${worst.label} has the worst performance this week at ${worst.oeeWeek}% OEE.\n\nSupporting evidence: it also carries the highest downtime burden at ${worst.downtimeMinutes} minutes and still has open corrective work on ${formatList(worst.workOrderIds)}.\n\nRecommended next action: prioritize the downtime and maintenance review on that line.`,
        action: {
          label: 'Open Line Performance',
          action: () => setCurrentScreen('line_performance'),
          accent: '#044ED7',
          text: 'Open the worst-performing line and review the loss breakdown.',
        },
      };
    }

    return {
      answer: `${line.label} OEE is ${line.oeeToday}% today.\n\nSupporting evidence: yesterday it was ${line.oeeYesterday}%, weekly performance is ${line.oeeWeek}%, and the main loss is ${line.downtimeReason}.\n\nRecommended next action: inspect the line performance trend or open the related work order.`,
      action: {
        label: 'Open Line Performance',
        action: () => setCurrentScreen('line_performance'),
        accent: '#044ED7',
        text: 'Open the line performance view.',
      },
    };
  };

  const buildMaintenanceReply = (prompt: string): OperationalReply => {
    const normalized = normalize(prompt);
    const line = findLineSnapshot(prompt);
    const asset = findAsset(prompt) ?? assetRecords.find((item) => normalize(item.line).includes(normalize(line.label)));

    if (normalized.includes('critical condition')) {
      const criticalAssets = assetRecords.filter((item) => item.condition === 'Critical');
      return {
        answer: `Critical assets right now are ${formatList(criticalAssets.map((item) => `${item.name} (${item.line})`))}.\n\nSupporting evidence: the critical signal is driven by repeat downtime, overdue maintenance, and missing parts risk.\n\nRecommended next action: open the maintenance hub and prioritize the overdue work.`,
        action: {
          label: 'Open Asset',
          action: () => setCurrentScreen('maintenance_hub'),
          accent: '#0F766E',
          text: 'Open the maintenance hub and review critical assets.',
        },
      };
    }

    if (normalized.includes('maintenance history')) {
      return {
        answer: `${asset?.name ?? 'This asset'} maintenance history shows ${asset?.history.join('; ') ?? 'no recent events in the mock dataset'}.\n\nSupporting evidence: ${asset?.overdueWorkOrders.length ? `open overdue work orders are ${asset.overdueWorkOrders.join(', ')}` : 'no overdue maintenance is currently open'}.\n\nRecommended next action: open the asset record for full work history.`,
        action: {
          label: 'Open Asset',
          action: () => setCurrentScreen('maintenance_hub'),
          accent: '#0F766E',
          text: 'Open the asset and review maintenance history.',
        },
      };
    }

    if (normalized.includes('open') && normalized.includes('work order')) {
      const orders = findWorkOrdersForLine(line.label);
      return {
        answer: `${orders.length} work orders are open or scheduled for ${line.label}: ${formatList(orders.map((order) => `${order.id} ${order.title}`))}.\n\nSupporting evidence: ${orders.map((order) => `${order.id} is ${order.status.toLowerCase()} and due ${order.due}`).join('; ')}.\n\nRecommended next action: open the work order hub and review the top overdue item first.`,
        action: {
          label: 'Open Work Order',
          action: () => setCurrentScreen('work_order_hub'),
          accent: '#E43B46',
          text: 'Open the work order hub and inspect the active orders.',
        },
      };
    }

    if (normalized.includes('overdue maintenance')) {
      return {
        answer: `${asset?.name ?? 'The asset'} ${asset?.overdueWorkOrders.length ? `has overdue maintenance on ${asset.overdueWorkOrders.join(', ')}` : 'does not have overdue maintenance in the current mock dataset'}.\n\nSupporting evidence: current condition is ${asset?.condition ?? 'Stable'} and status is ${asset?.status ?? 'not available'}.\n\nRecommended next action: open the asset or work order workflow to close the overdue task.`,
        action: {
          label: asset?.overdueWorkOrders.length ? 'Open Work Order' : 'Open Asset',
          action: () => setCurrentScreen(asset?.overdueWorkOrders.length ? 'work_order_hub' : 'maintenance_hub'),
          accent: asset?.overdueWorkOrders.length ? '#E43B46' : '#0F766E',
          text: 'Open the maintenance workflow for follow-up.',
        },
      };
    }

    return {
      answer: `Maintenance risk is concentrated on ${asset?.name ?? line.downtimeAsset} for ${line.label}.\n\nSupporting evidence: ${line.workOrderIds[0]} is still active, downtime reached ${line.downtimeMinutes} minutes, and ${asset?.missingParts.length ? `missing parts include ${asset.missingParts.join(', ')}` : 'no missing parts are currently blocking the next task'}.\n\nRecommended next action: review the work order and part status together.`,
      action: {
        label: 'Open Work Order',
        action: () => setCurrentScreen('work_order_hub'),
        accent: '#E43B46',
        text: 'Open the maintenance workflow.',
      },
    };
  };

  const buildSparePartsReply = (prompt: string): OperationalReply => {
    const normalized = normalize(prompt);
    const matchingPart = sparePartsInventory.find((part) => part.assetAliases.some((alias) => normalized.includes(alias))) ?? sparePartsInventory[0];
    const blockedOrders = workOrders.filter((order) => order.missingParts.length > 0);

    if (normalized.includes('blocked by missing parts')) {
      return {
        answer: `${blockedOrders.length} work orders are blocked by missing parts: ${formatList(blockedOrders.map((order) => `${order.id} (${order.missingParts.join(', ')})`))}.\n\nSupporting evidence: the highest risk blocker is ${blockedOrders[0]?.id ?? 'none'} because the missing part prevents closing the active downtime issue.\n\nRecommended next action: open the work order hub and escalate the missing part.`,
        action: {
          label: 'Open Work Order',
          action: () => setCurrentScreen('work_order_hub'),
          accent: '#E43B46',
          text: 'Open the blocked work orders.',
        },
      };
    }

    if (normalized.includes('what parts are needed') || normalized.includes('next maintenance task')) {
      const nextOrder = workOrders[0];
      return {
        answer: `The next maintenance task ${nextOrder.id} needs ${formatList(nextOrder.partsNeeded)}.\n\nSupporting evidence: ${nextOrder.missingParts.length ? `${nextOrder.missingParts.join(', ')} is still missing, so the order is not fully executable yet` : 'all listed parts are currently available or reserved'}.\n\nRecommended next action: confirm part availability before dispatching the crew.`,
        action: {
          label: 'Open Work Order',
          action: () => setCurrentScreen('work_order_hub'),
          accent: '#E43B46',
          text: 'Open the next maintenance order.',
        },
      };
    }

    return {
      answer: `${matchingPart.name} for ${formatList(matchingPart.assetAliases)} is ${matchingPart.status.toLowerCase()} with ${matchingPart.onHand} on hand and ${matchingPart.reserved} reserved.\n\nSupporting evidence: this part directly affects the active maintenance path for conveyor recovery.\n\nRecommended next action: open the maintenance workflow and confirm whether an expedited order is needed.`,
      action: {
        label: 'Open Maintenance',
        action: () => setCurrentScreen('maintenance_hub'),
        accent: '#0F766E',
        text: 'Open the maintenance and part status workflow.',
      },
    };
  };

  const buildDocumentReply = (prompt: string): OperationalReply => {
    const normalized = normalize(prompt);
    const document = findDocument(prompt);

    if (normalized.includes('summarize') && normalized.includes('shift notes')) {
      return {
        answer: `Latest shift notes for Line A: ${shiftLogItems.map((item) => `${item.time} ${item.title} - ${item.detail}`).join('; ')}.\n\nSupporting evidence: the strongest signal is the conveyor centerlining verification and the maintenance follow-up on hydraulic press belt wear.\n\nRecommended next action: open the shift logbook if you want the full handoff context.`,
        action: {
          label: 'Open Shift Notes',
          action: () => setCurrentScreen('shift_logbook'),
          accent: '#044ED7',
          text: 'Open the shift logbook and review the note history.',
        },
      };
    }

    return {
      answer: `Best match: ${document.name} (${document.type}).\n\nSupporting evidence: ${document.description} It belongs to ${document.site} ${document.line} and was last updated ${document.modified} by ${document.owner}.\n\nRecommended next action: open the document and review the source detail.`,
      action: {
        label: 'Open Document',
        action: () => {
          openArtifactRecord(document.name);
        },
        accent: '#044ED7',
        text: 'Open the related document.',
      },
    };
  };

  const buildActionReply = (prompt: string): OperationalReply => {
    const normalized = normalize(prompt);

    if (normalized.includes('shift swap')) {
      return {
        answer: `I can start a shift swap request from the current roster context.\n\nSupporting evidence: the main coverage pressure is on Line A where QA coverage is already thin, so the request should be validated against role backup before approval.\n\nRecommended next action: open Shift Schedule and create the swap request.`,
        action: {
          label: 'Open Shift Schedule',
          action: () => setCurrentScreen('shift_schedule_overview'),
          accent: '#044ED7',
          text: 'Open Shift Schedule and create the swap request.',
        },
      };
    }

    if (normalized.includes('create an action') || normalized.includes('create action')) {
      return {
        answer: `I can route a new action for the missing QA Inspector coverage issue.\n\nSupporting evidence: the gap is already affecting Line A / Line 10 operational risk and should be owned before the next shift handoff.\n\nRecommended next action: open Action Tracker and create the follow-up action.`,
        action: {
          label: 'Create Action',
          action: () => setCurrentScreen('action_tracker'),
          accent: '#E43B46',
          text: 'Open Action Tracker and create the action.',
        },
      };
    }

    if (normalized.includes('notify me') || normalized.includes('notification rule')) {
      const rule = customNotificationRules.find((item) => item.triggerCondition.includes('OEE < 80%')) ?? customNotificationRules[0];
      return {
        answer: `A matching notification rule already exists: ${rule.name} for ${rule.scope} with ${rule.frequency.toLowerCase()} evaluation.\n\nSupporting evidence: it triggers on ${rule.triggerCondition} and last fired ${rule.lastTriggered}.\n\nRecommended next action: open Notifications and manage the rule.`,
        action: {
          label: 'Create Notification Rule',
          action: () => setCurrentScreen('notification_dashboard'),
          accent: '#7C3AED',
          text: 'Open Notifications and adjust the custom rule.',
        },
      };
    }

    if (normalized.includes('planned stop')) {
      const stop = plannedStops.find((item) => normalized.includes('christmas') ? item.title.toLowerCase().includes('christmas') : true) ?? plannedStops[0];
      return {
        answer: `${stop.title} is scheduled for ${stop.window}.\n\nSupporting evidence: scope is ${stop.scope} and the owner is ${stop.owner}.\n\nRecommended next action: open the planned stop workflow and review dependencies.`,
        action: {
          label: 'Open Planned Stop',
          action: () => setCurrentScreen('shift_schedule_overview'),
          accent: '#044ED7',
          text: 'Open the planned stop workflow.',
        },
      };
    }

    if (normalized.includes('open related work order')) {
      return {
        answer: `The most relevant work order is ${workOrders[0].id} for ${workOrders[0].asset}.\n\nSupporting evidence: it is directly linked to the active downtime pattern and still has a missing bearing kit.\n\nRecommended next action: open the work order workflow.`,
        action: {
          label: 'Open Work Order',
          action: () => setCurrentScreen('work_order_hub'),
          accent: '#E43B46',
          text: 'Open the related work order.',
        },
      };
    }

    return {
      answer: `I can guide or initiate operational workflows from natural language.\n\nSupporting evidence: the connected mock modules include Shift Schedule, Smart Search, Maintenance, Action Tracker, Notifications, ESO, documents, and shift notes.\n\nRecommended next action: ask for the workflow you want to open or create.`,
    };
  };

  const buildNotificationReply = (): OperationalReply => {
    const alerts = notificationAlerts.slice(0, 3);
    return {
      answer: `Top alerts needing attention are ${formatList(alerts.map((alert) => `${alert.title} (${alert.source})`))}.\n\nSupporting evidence: the queue includes both staffing and maintenance signals, and at least one is already tied to an active workflow.\n\nRecommended next action: review the inbox and open the highest-priority item.`,
      action: {
        label: 'Open Notifications',
        action: () => setCurrentScreen('notification_dashboard'),
        accent: '#7C3AED',
        text: 'Open the notification inbox.',
      },
    };
  };

  const buildTrainingReply = (): OperationalReply => {
    const dueItems = trainingRecords.filter((item) => item.status !== 'Current');
    return {
      answer: `Training attention points: ${formatList(dueItems.map((item) => `${item.person} - ${item.course} (${item.due})`))}.\n\nSupporting evidence: overdue or due-soon certifications could reduce weekend and specialist coverage flexibility.\n\nRecommended next action: open Training and confirm the recertification plan.`,
      action: {
        label: 'Open Training',
        action: () => setCurrentScreen('notification_dashboard'),
        accent: '#044ED7',
        text: 'Open the training-related workflow view.',
      },
    };
  };

  const buildSiteOverviewReply = (): OperationalReply => ({
    answer: `${siteOverview.name} overview: ${siteOverview.banner}\n\nSupporting evidence: key KPIs are ${siteOverview.kpis.join(', ')}, leadership contacts are ${siteOverview.leadership.join(', ')}, and today’s operational focus is ${siteOverview.today.toLowerCase()}.\n\nRecommended next action: open Smart Search or Global View if you want the full site workspace.`,
    action: {
      label: 'Open Smart Search',
      action: () => setCurrentScreen('smart_search'),
      accent: '#044ED7',
      text: 'Open the site workspace in Smart Search.',
    },
  });

  const buildOperationsOverviewReply = (): OperationalReply => {
    const worstLine = [...lineSnapshots].sort((a, b) => a.oeeWeek - b.oeeWeek)[0];
    const criticalAsset = assetRecords.find((asset) => asset.condition === 'Critical');
    return {
      answer: `Operations overview: ${worstLine.label} is the main risk at ${worstLine.oeeToday}% OEE, ${criticalAsset?.name ?? 'the top asset'} is in critical condition, and there are ${actionTrackerRows.filter((row) => row.status === 'Open' || row.status === 'Under Approval').length} active action-tracking items.\n\nSupporting evidence: the largest production loss comes from ${worstLine.downtimeReason}, and missing QA coverage is still a cross-module blocker.\n\nRecommended next action: review either the line performance trend or the work order queue first.`,
      action: {
        label: 'Open Global View',
        action: () => setCurrentScreen('global_view'),
        accent: '#044ED7',
        text: 'Open Global View for the site-level summary.',
      },
    };
  };

  const createOperationalResponse = (prompt: string): OperationalReply => {
    const normalized = normalize(prompt);

    if (includesAny(normalized, ['create', 'notify me', 'open planned stop', 'shift swap', 'create action', 'open related work order'])) {
      return buildActionReply(prompt);
    }

    if (includesAny(normalized, ['who is working', 'who is missing', 'crew', 'shift coverage', 'qa inspector', 'replace ', 'working the night shift'])) {
      return buildWorkforceReply(prompt);
    }

    if (includesAny(normalized, ['oee', 'performance', 'downtime', 'production status', 'worst line', 'compare line'])) {
      return buildOeeReply(prompt);
    }

    if (includesAny(normalized, ['maintenance', 'work order', 'asset', 'equipment history', 'critical condition'])) {
      return buildMaintenanceReply(prompt);
    }

    if (includesAny(normalized, ['spare part', 'parts', 'blocked by missing parts'])) {
      return buildSparePartsReply(prompt);
    }

    if (includesAny(normalized, ['sop', 'manual', 'document', 'shift notes', 'shutdown procedure', 'summarize'])) {
      return buildDocumentReply(prompt);
    }

    if (includesAny(normalized, ['notification', 'alert'])) {
      return buildNotificationReply();
    }

    if (includesAny(normalized, ['training', 'certification'])) {
      return buildTrainingReply();
    }

    if (includesAny(normalized, ['site overview', 'site', 'leadership team'])) {
      return buildSiteOverviewReply();
    }

    return buildOperationsOverviewReply();
  };

  const handleAiSend = (message: string, options?: { openDrawer?: boolean }) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    const commandResponse = resolveAiCommand(trimmedMessage);
    const operationalReply = commandResponse
      ? { answer: commandResponse }
      : createOperationalResponse(trimmedMessage);
    const isMaintenance = isMaintenanceSummaryPrompt(trimmedMessage);

    setAiMessages((prev) => [
      ...prev,
      { role: 'user', text: trimmedMessage },
      {
        role: 'assistant',
        text: operationalReply.answer,
        variant: operationalReply.variant ?? (isMaintenance ? 'maintenance_summary' : undefined),
      },
      ...(operationalReply.action ? [{
        role: 'assistant' as const,
        text: operationalReply.action.text ?? 'Recommended next action.',
        variant: 'action' as const,
        actionLabel: operationalReply.action.label,
        action: operationalReply.action.action,
        accent: operationalReply.action.accent ?? '#044ED7',
      }] : []),
    ]);

    setAiInput('');
    setHomeChatInput('');
    if (options?.openDrawer ?? true) {
      setIsAiDrawerOpen(true);
    }
  };

  const handleStartNewChat = () => {
    setAiMessages([]);
    setAiInput('');
    setHomeChatInput('');
    setChatShareNotice('');
    proactiveSuggestionIndexRef.current = 0;
  };

  const handleShareChat = (mode: 'copy' | 'team' | 'export') => {
    const modeLabel = mode === 'copy' ? 'Link copied' : mode === 'team' ? 'Shared with team' : 'Export created';
    setChatShareNotice(modeLabel);
  };

  const openMainAiForDocument = (fileName: string) => {
    setAiMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: `I am connected to ${fileName}. Ask for a summary, linked work orders, staffing impact, maintenance references, or the next operational action and I will route the right context.`,
      },
    ]);
    setIsAiDrawerOpen(true);
  };

  const openMainAiForWorkflow = (context: string) => {
    setAiMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: `${context}. I can now connect this workflow to staffing, maintenance, notifications, documents, and shift notes so you can act from one place.`,
      },
    ]);
    setIsAiDrawerOpen(true);
  };

  return {
    aiInput,
    setAiInput,
    homeChatInput,
    setHomeChatInput,
    chatShareNotice,
    setChatShareNotice,
    aiMessages,
    setAiMessages,
    recentChatCommands,
    handleAiSend,
    handleStartNewChat,
    handleShareChat,
    openMainAiForDocument,
    openMainAiForWorkflow,
  };
};
