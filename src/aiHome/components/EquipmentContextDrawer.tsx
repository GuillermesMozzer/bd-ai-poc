import * as React from 'react';
import {
  ArrowBackRounded as ArrowBackIcon,
  AutoAwesome as AutoAwesomeIcon,
  BuildRounded as BuildIcon,
  ChevronRightRounded as ChevronRightIcon,
  CloseRounded as CloseIcon,
  DescriptionOutlined as DescriptionIcon,
  ExpandLessRounded as CollapseIcon,
  ExpandMoreRounded as ExpandIcon,
  HandymanRounded as HandymanIcon,
  InsertChartOutlinedRounded as ChartIcon,
  LinkRounded as LinkIcon,
  NotificationsNoneRounded as NotificationIcon,
  PictureAsPdfOutlined as PdfIcon,
  ImageOutlined as ImageIcon,
  GridOnOutlined as SpreadsheetIcon,
  SlideshowOutlined as PresentationIcon,
  InsertDriveFileOutlined as GenericFileIcon,
  SchoolOutlined as TrainingIcon,
  WarningAmberRounded as WarningIcon,
} from '@mui/icons-material';
import {Box, Button, Chip, Drawer, IconButton, LinearProgress, Tab, Tabs, Typography} from '@mui/material';
import {
  BarChart3,
  Bell,
  Box as CubeIcon,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Info,
  TrendingUp,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import {
  tokenBrand,
  tokenCommon,
  tokenDivider,
  tokenError,
  tokenNeutral,
  tokenSuccess,
  tokenText,
  tokenWarning,
} from '../../workstation/theme';
import type {MaintenanceContextKop, MaintenanceContextRecord} from './maintenanceSummaryData';

type EquipmentContextDrawerProps = {
  context: MaintenanceContextRecord | null;
  onClose: () => void;
  onOpenEso: () => void;
  onOpenEsoDetails: (record: ContextRecord) => void;
  onOpenMaintenanceRequest: () => void;
  onOpenMaintenanceRequestDetails: (record: ContextRecord) => void;
  onOpenSmartSearch: () => void;
  onOpenWorkOrder: () => void;
  onOpenWorkOrderDetails: (record: ContextRecord) => void;
  open: boolean;
  surface?: 'dark' | 'light';
};

type DetailView =
  | 'overview'
  | 'Properties'
  | 'Timeseries'
  | '3D View'
  | 'Documents'
  | 'Spare parts'
  | 'Related work'
  | 'ESOs'
  | 'Training'
  | 'Notifications'
  | 'Main KPIs'
  | 'Event log'
  | 'Record detail';

type RecordKind = 'Work order' | 'ESO' | 'Maintenance request';
type RecordTone = 'brand' | 'warning' | 'success';
export type ContextRecord = {
  id: string;
  title: string;
  meta: string;
  status: string;
  tone: RecordTone;
  kind: RecordKind;
  owner: string;
  priority: string;
  description: string;
};

type OverviewDetailView = Exclude<DetailView, 'overview' | 'Record detail'>;

const sectionIcons: Record<OverviewDetailView, LucideIcon> = {
  Documents: FileText,
  '3D View': CubeIcon,
  ESOs: ClipboardCheck,
  'Event log': FileText,
  'Main KPIs': BarChart3,
  Notifications: Bell,
  Properties: Info,
  'Related work': Wrench,
  'Spare parts': CubeIcon,
  Timeseries: TrendingUp,
  Training: GraduationCap,
};

const equipmentViews = [
  {label: 'Original view', path: '/images/shift-logbook-equipment-views/00_original_reference_with_hotspots.png'},
  {label: 'Front', path: '/images/shift-logbook-equipment-views/01_front_view.png'},
  {label: 'Right side', path: '/images/shift-logbook-equipment-views/02_right_side_view.png'},
  {label: 'Top', path: '/images/shift-logbook-equipment-views/04_top_view.png'},
  {label: 'Isometric', path: '/images/shift-logbook-equipment-views/05_isometric_view.png'},
  {label: 'Conveyor exit', path: '/images/shift-logbook-equipment-views/10_conveyor_exit_closeup.png'},
];

const relatedParts = [
  {name: 'Polyurethane conveyor belt', code: 'PRT-00942', stock: '2 in stock', location: 'Crib A · Bin 14', supplier: 'Habasit', reorder: '1 unit', description: 'Food-grade replacement belt sized for the C4 lane transfer, with sealed edges and high-grip surface.', image: '/images/spear_parts/Polyurethane Conveyor.jpg'},
  {name: 'Flange bearing', code: 'PRT-00186', stock: '6 in stock', location: 'Crib B · Bin 08', supplier: 'SKF', reorder: '4 units', description: 'Two-bolt flange bearing used on the transfer and return rollers. Pre-lubricated and ready to install.', image: '/images/spear_parts/Flange Bearing.jpg'},
  {name: 'Vibration sensor', code: 'PRT-01411', stock: '4 in stock', location: 'Crib A · Bin 22', supplier: 'IFM', reorder: '2 units', description: 'Industrial vibration sensor for drive-side bearing monitoring, including M12 connector and mounting stud.', image: '/images/spear_parts/Vibration Sensor.jpg'},
  {name: 'Timing belt', code: 'PRT-01028', stock: '8 in stock', location: 'Crib A · Bin 18', supplier: 'Gates', reorder: '3 units', description: 'Synchronous drive belt for the C4 transfer assembly, matched to the installed pulley profile and operating load.', image: '/images/spear_parts/Timing Belt.jpg'},
  {name: 'Retroreflective photoelectric sensor', code: 'PRT-01862', stock: '3 in stock', location: 'Crib C · Bin 05', supplier: 'SICK', reorder: '2 units', description: 'M12 photoelectric sensor used for product presence and transfer confirmation at the conveyor discharge.', image: '/images/spear_parts/Photoelectric Sensor Retroreflective.jpg'},
  {name: 'C4 gearmotor assembly', code: 'PRT-00374', stock: '1 in stock', location: 'Heavy Parts · Rack 03', supplier: 'SEW-Eurodrive', reorder: '1 unit', description: 'Complete replacement gearmotor with the approved ratio, mounting flange and terminal configuration for Conveyor C4.', image: '/images/spear_parts/Gearmotor.jpg'},
  {name: 'Safety interlock switch', code: 'PRT-02107', stock: '5 in stock', location: 'Crib C · Bin 11', supplier: 'Pilz', reorder: '2 units', description: 'RFID-coded guard interlock for the conveyor access door, including actuator and sealed connector.', image: '/images/spear_parts/Safety Interlock Switch RFID.jpg'},
  {name: 'Drive roller chain', code: 'PRT-00631', stock: '4 in stock', location: 'Crib B · Bin 16', supplier: 'Tsubaki', reorder: '2 units', description: 'Pre-cut industrial roller chain with connecting link for the transfer drive and tensioner assembly.', image: '/images/spear_parts/Roller Chain.jpg'},
];

const notifications = [
  {title: 'Belt drift threshold exceeded', meta: '8 minutes ago · Critical alert', detail: 'Lateral deviation reached 2.4 mm at the lane transfer.', tone: 'critical'},
  {title: 'MR-952532567 assigned to Line Maintenance', meta: '18 minutes ago · Assignment', detail: 'Emily Watson is now the primary owner.', tone: 'brand'},
  {title: 'Transfer accuracy below 95% target', meta: '42 minutes ago · KPI alert', detail: 'Transfer accuracy measured 93.6% over the last hour.', tone: 'warning'},
  {title: 'Spare belt stock reached reorder level', meta: '2 hours ago · Inventory', detail: 'Two polyurethane conveyor belts remain in Crib A.', tone: 'warning'},
  {title: 'WO-10482 moved to In progress', meta: 'Today at 08:38 · Work order', detail: 'The inspection and alignment task has started.', tone: 'brand'},
  {title: 'Vibration reading attached', meta: 'Yesterday at 16:12 · Document update', detail: 'A new drive-side bearing reading was added to the equipment record.', tone: 'brand'},
  {title: 'Quarterly conveyor inspection completed', meta: 'Jun 24 · Completion', detail: 'WO-10176 closed with no guard or emergency-stop findings.', tone: 'success'},
];

const records: Record<RecordKind, ContextRecord[]> = {
  'Work order': [
    {id: 'WO-10482', title: 'Inspect belt alignment and tension', meta: 'Due today · Line Maintenance', status: 'In progress', tone: 'brand', kind: 'Work order', owner: 'Emily Watson', priority: 'High', description: 'Inspect the transfer rollers, realign the belt and validate tension against the approved centerline.'},
    {id: 'WO-10391', title: 'Replace transfer roller bearing', meta: 'Due Jul 3 · Mechanical', status: 'Planned', tone: 'warning', kind: 'Work order', owner: 'David Kim', priority: 'Medium', description: 'Replace the drive-side bearing and record post-maintenance vibration readings.'},
    {id: 'WO-10176', title: 'Quarterly conveyor inspection', meta: 'Completed Jun 24 · Reliability', status: 'Completed', tone: 'success', kind: 'Work order', owner: 'Priya Patel', priority: 'Routine', description: 'Quarterly inspection covering belt condition, guards, rollers and emergency stops.'},
  ],
  ESO: [
    {id: 'ESO-00218', title: 'Transfer guard geometry review', meta: 'Engineering · Updated 36m ago', status: 'Under review', tone: 'brand', kind: 'ESO', owner: 'Manufacturing Engineering', priority: 'High', description: 'Review transfer guard geometry to improve access while maintaining the required safety envelope.'},
    {id: 'ESO-00194', title: 'Roller material specification change', meta: 'Manufacturing Eng. · Updated yesterday', status: 'Approved', tone: 'success', kind: 'ESO', owner: 'Reliability Engineering', priority: 'Medium', description: 'Change the roller coating specification to reduce drag and premature wear at the lane transfer.'},
  ],
  'Maintenance request': [
    {id: 'MR-952532567', title: 'Tracking deviation at lane transfer', meta: 'Reported today at 08:30 · BLU.AI', status: 'High priority', tone: 'warning', kind: 'Maintenance request', owner: 'Line Maintenance', priority: 'High', description: 'Tracking deviation and roller drag are increasing the likelihood of a belt jam at the lane transfer.'},
    {id: 'MR-952511204', title: 'Intermittent roller drag', meta: 'Reported Jun 28 · J. Harper', status: 'Accepted', tone: 'brand', kind: 'Maintenance request', owner: 'Mechanical Team', priority: 'Medium', description: 'Operator reported intermittent drag and audible vibration during product transfer.'},
  ],
};

const timeSeriesRecords = [
  {id: 'ts-availability', label: 'Availability', value: '96.8%', delta: '+0.6%', accent: tokenSuccess.darker, source: 'PLC state', sampling: '5 minute sampling', values: [20, 18, 19, 15, 17, 12, 10, 8]},
  {id: 'ts-jam-frequency', label: 'Jam frequency', value: '1.2 / hr', delta: '+8.3%', accent: tokenError.main, source: 'Event counter', sampling: '5 minute sampling', values: [13, 12, 15, 14, 18, 19, 22, 23]},
  {id: 'ts-motor-current', label: 'Motor current', value: '8.4 A', delta: '+2.1%', accent: tokenWarning.dark, source: 'Drive telemetry', sampling: '1 minute sampling', values: [19, 18, 17, 19, 18, 15, 13, 11]},
  {id: 'ts-health-score', label: 'Health score', value: '82 / 100', delta: '-3 pts', accent: tokenBrand.main, source: 'BLU.AI model', sampling: '15 minute sampling', values: [12, 13, 14, 14, 16, 18, 20, 22]},
  {id: 'ts-vibration', label: 'Drive bearing vibration', value: '6.8 mm/s', delta: '+12.4%', accent: tokenError.main, source: 'Vibration sensor', sampling: '1 minute sampling', values: [22, 20, 19, 17, 15, 13, 10, 7]},
  {id: 'ts-belt-deviation', label: 'Belt lateral deviation', value: '2.4 mm', delta: '+0.7 mm', accent: tokenWarning.dark, source: 'Vision inspection', sampling: '30 second sampling', values: [21, 20, 18, 19, 15, 12, 9, 6]},
] as const;

const documentFiles: Record<string, Array<{name: string; format: string; size: string; updated: string}>> = {
  Manuals: [
    {name: 'Conveyor C4 operation and maintenance manual', format: 'PDF', size: '8.4 MB', updated: 'Updated Jun 12'},
    {name: 'Belt tensioning procedure', format: 'DOCX', size: '1.2 MB', updated: 'Updated May 28'},
    {name: 'OEM recommended spare parts', format: 'XLSX', size: '684 KB', updated: 'Updated Apr 19'},
    {name: 'Operator quick reference', format: 'PPTX', size: '3.1 MB', updated: 'Updated Mar 08'},
  ],
  Electrical: [
    {name: 'C4 main control cabinet schematic', format: 'PDF', size: '4.8 MB', updated: 'Updated Jun 20'},
    {name: 'Drive motor wiring schedule', format: 'XLSX', size: '920 KB', updated: 'Updated Jun 02'},
    {name: 'VFD parameter backup', format: 'CSV', size: '112 KB', updated: 'Updated May 16'},
    {name: 'Control cabinet terminal map', format: 'DWG', size: '6.7 MB', updated: 'Updated Apr 22'},
  ],
  Structural: [
    {name: 'Transfer frame assembly drawing', format: 'PDF', size: '12.1 MB', updated: 'Updated Mar 30'},
    {name: 'Guarding inspection checklist', format: 'DOCX', size: '744 KB', updated: 'Updated Feb 18'},
    {name: 'Transfer assembly reference photo', format: 'JPG', size: '2.8 MB', updated: 'Updated Feb 04'},
    {name: 'Frame calculation package', format: 'ZIP', size: '18.2 MB', updated: 'Updated Jan 17'},
  ],
  Mechanical: [
    {name: 'Drive roller assembly drawing', format: 'PDF', size: '7.6 MB', updated: 'Updated Jun 14'},
    {name: 'Bearing and shaft tolerances', format: 'XLSX', size: '486 KB', updated: 'Updated May 09'},
    {name: 'Gearmotor coupling model', format: 'DWG', size: '9.2 MB', updated: 'Updated Apr 11'},
  ],
  Procedures: [
    {name: 'Belt replacement work instruction', format: 'PDF', size: '3.8 MB', updated: 'Updated Jun 18'},
    {name: 'Alignment verification checklist', format: 'DOCX', size: '628 KB', updated: 'Updated Jun 03'},
    {name: 'Post-maintenance startup sequence', format: 'PPTX', size: '2.4 MB', updated: 'Updated May 21'},
  ],
  Quality: [
    {name: 'Transfer accuracy inspection standard', format: 'PDF', size: '2.1 MB', updated: 'Updated Jun 22'},
    {name: 'C4 deviation history', format: 'XLSX', size: '1.8 MB', updated: 'Updated Jun 20'},
    {name: 'Roller surface defect reference', format: 'JPG', size: '4.3 MB', updated: 'Updated May 02'},
  ],
  Safety: [
    {name: 'Conveyor lockout tagout procedure', format: 'PDF', size: '1.9 MB', updated: 'Updated Jun 11'},
    {name: 'Machine guarding risk assessment', format: 'DOCX', size: '964 KB', updated: 'Updated Apr 27'},
  ],
  Photos: [
    {name: 'Lane transfer inspection — June', format: 'JPG', size: '5.6 MB', updated: 'Updated Jun 26'},
    {name: 'Drive-side bearing reference', format: 'PNG', size: '3.2 MB', updated: 'Updated Jun 12'},
    {name: 'Pre-maintenance condition archive', format: 'ZIP', size: '24.8 MB', updated: 'Updated May 30'},
  ],
};

const trainingLinks = [
  {title: 'Conveyor belt tracking fundamentals', type: 'Learning path', duration: '24 min', level: 'Intermediate', status: 'Recommended', description: 'Understand the main causes of lateral drift and learn the standard tracking correction sequence.'},
  {title: 'Lockout/tagout for conveyor maintenance', type: 'Required training', duration: '18 min', level: 'All levels', status: 'Required', description: 'Review isolation points, stored-energy checks and verification steps before intervention.'},
  {title: 'Transfer roller inspection standard', type: 'Work instruction', duration: '12 min', level: 'Technician', status: 'Current', description: 'Inspect roller condition, bearing drag, alignment and acceptance limits for lane transfers.'},
  {title: 'Belt tension measurement guide', type: 'Knowledge article', duration: '8 min', level: 'Beginner', status: 'Recommended', description: 'Use the approved gauge and centerline values to measure and document belt tension.'},
];

const eventRecords = [
  {time: '08:42', title: 'Tracking deviation detected', detail: 'Vision inspection measured 2.4 mm lateral drift.', severity: 'Critical'},
  {time: '08:36', title: 'Roller drag increased', detail: 'Motor current exceeded its 7-day baseline by 8%.', severity: 'Warning'},
  {time: '08:30', title: 'Maintenance request opened', detail: 'MR-952532567 created automatically by BLU.AI.', severity: 'Information'},
  {time: 'Yesterday', title: 'Operator inspection completed', detail: 'No visible belt damage recorded during shift handoff.', severity: 'Completed'},
];

const toneColor = {brand: tokenBrand.main, warning: tokenWarning.dark, success: tokenSuccess.darker};

function Sparkline({color, values}: {color: string; values: number[]}) {
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${32 - value}`).join(' ');
  return <Box component="svg" viewBox="0 0 100 36" preserveAspectRatio="none" sx={{display: 'block', width: '100%', height: 42}}><Box component="line" x1="0" x2="100" y1="28" y2="28" sx={{stroke: tokenDivider, strokeWidth: 1}} /><Box component="polyline" points={points} sx={{fill: 'none', stroke: color, strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round'}} /></Box>;
}

function FileTypeIcon({format}: {format: string}) {
  if (format === 'PDF') return <PdfIcon sx={{fontSize: 24, color: tokenError.main}} />;
  if (format === 'XLSX' || format === 'CSV') return <SpreadsheetIcon sx={{fontSize: 24, color: tokenSuccess.darker}} />;
  if (format === 'PPTX') return <PresentationIcon sx={{fontSize: 24, color: tokenWarning.dark}} />;
  if (format === 'JPG' || format === 'PNG') return <ImageIcon sx={{fontSize: 24, color: tokenBrand.main}} />;
  return <GenericFileIcon sx={{fontSize: 24, color: tokenBrand.main}} />;
}

export default function EquipmentContextDrawer({context, onClose, onOpenEso, onOpenEsoDetails, onOpenMaintenanceRequest, onOpenMaintenanceRequestDetails, onOpenSmartSearch, onOpenWorkOrder, onOpenWorkOrderDetails, open}: EquipmentContextDrawerProps) {
  const [detailView, setDetailView] = React.useState<DetailView>('overview');
  const [selectedEquipmentView, setSelectedEquipmentView] = React.useState(0);
  const [selectedDocumentCategory, setSelectedDocumentCategory] = React.useState<string | null>(null);
  const [activeRecord] = React.useState<ContextRecord | null>(null);
  const [relatedTab, setRelatedTab] = React.useState<'Work orders' | 'Maintenance requests'>('Work orders');
  const [expandedPart, setExpandedPart] = React.useState<string | null>(null);
  const [expandedTimeSeries, setExpandedTimeSeries] = React.useState<Set<string>>(() => new Set(timeSeriesRecords.slice(0, 2).map((series) => series.id)));
  const [insightExpanded, setInsightExpanded] = React.useState(true);
  const [typedInsightBody, setTypedInsightBody] = React.useState('');
  const [isInsightTyping, setIsInsightTyping] = React.useState(false);
  const typedInsightKeysRef = React.useRef(new Set<string>());

  React.useEffect(() => {
    setDetailView('overview');
    setSelectedEquipmentView(0);
    setSelectedDocumentCategory(null);
    setRelatedTab('Work orders');
    setExpandedPart(null);
    setExpandedTimeSeries(new Set(timeSeriesRecords.slice(0, 2).map((series) => series.id)));
    setInsightExpanded(true);
  }, [open, context?.requestId]);

  const sectionCount = (label: string) => context?.sections.find((section) => section.label === label)?.count ?? 0;
  const documentCategories = context?.filesCategories ?? [];
  const documentTotal = documentCategories.reduce((total, item) => total + item.count, 0);
  const kpis: MaintenanceContextKop[] = [
    ...(context?.kops ?? []),
    {label: 'Availability', value: '96.8%', delta: '+0.6%', accent: tokenSuccess.darker},
    {label: 'Jam Frequency', value: '1.2 / hr', delta: '+8.3%', accent: tokenError.main},
    {label: 'Motor Current', value: '8.4 A', delta: '+2.1%', accent: tokenWarning.dark},
    {label: 'Health Score', value: '82 / 100', delta: '-3 pts', accent: tokenBrand.main},
  ];
  const insightBody = context?.insightBody ?? '';
  const insightTypingKey = context ? `${context.requestId}-${context.insightTitle}` : '';
  const overviewSections = React.useMemo(
    () =>
      [
        {label: 'Documents', count: documentTotal, view: 'Documents' as const},
        {label: '3D View', count: sectionCount('3D View'), view: '3D View' as const},
        {label: 'ESOs', count: records.ESO.length, view: 'ESOs' as const},
        {label: 'Event log', count: context?.eventLogCount ?? 0, view: 'Event log' as const},
        {label: 'Main KPIs', count: kpis.length, view: 'Main KPIs' as const},
        {label: 'Notifications', count: notifications.length, view: 'Notifications' as const},
        {label: 'Properties', count: sectionCount('Properties'), view: 'Properties' as const},
        {label: 'Related work', count: records['Work order'].length + records['Maintenance request'].length, view: 'Related work' as const},
        {label: 'Spare parts', count: relatedParts.length, view: 'Spare parts' as const},
        {label: 'Timeseries', count: timeSeriesRecords.length, view: 'Timeseries' as const},
        {label: 'Training', count: trainingLinks.length, view: 'Training' as const},
      ],
    [context?.eventLogCount, documentTotal, kpis.length],
  );

  React.useEffect(() => {
    const hasTypedInsight = typedInsightKeysRef.current.has(insightTypingKey);

    if (!open || detailView !== 'overview' || !insightExpanded) {
      setTypedInsightBody(insightBody);
      setIsInsightTyping(false);
      return;
    }

    if (!insightTypingKey || hasTypedInsight) {
      setTypedInsightBody(insightBody);
      setIsInsightTyping(false);
      return;
    }

    typedInsightKeysRef.current.add(insightTypingKey);
    setTypedInsightBody('');
    setIsInsightTyping(true);
    let nextLength = 0;
    const intervalId = window.setInterval(() => {
      nextLength = Math.min(insightBody.length, nextLength + (nextLength < 36 ? 2 : 1));
      setTypedInsightBody(insightBody.slice(0, nextLength));
      if (nextLength >= insightBody.length) {
        window.clearInterval(intervalId);
        setIsInsightTyping(false);
      }
    }, 28);

    return () => window.clearInterval(intervalId);
  }, [detailView, insightBody, insightExpanded, insightTypingKey, open]);

  if (!context) return <Drawer anchor="right" open={false} />;

  const goBack = () => {
    if (detailView === 'Documents' && selectedDocumentCategory) {
      setSelectedDocumentCategory(null);
      return;
    }
    setDetailView('overview');
  };

  const currentTitle = detailView === 'Documents' && selectedDocumentCategory ? selectedDocumentCategory : detailView;
  const detailCounts: Partial<Record<DetailView, number>> = {Properties: sectionCount('Properties'), Timeseries: timeSeriesRecords.length, '3D View': sectionCount('3D View'), Documents: documentTotal, 'Spare parts': relatedParts.length, 'Related work': records['Work order'].length + records['Maintenance request'].length, ESOs: records.ESO.length, Training: trainingLinks.length, Notifications: notifications.length, 'Main KPIs': kpis.length, 'Event log': context.eventLogCount};

  const Header = () => (
    <Box sx={{px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1, borderBottom: `1px solid ${tokenDivider}`, bgcolor: tokenCommon.white}}>
      <IconButton aria-label={detailView === 'overview' ? 'Close context' : 'Back'} size="small" onClick={detailView === 'overview' ? onClose : goBack} sx={{color: tokenBrand.main}}><ArrowBackIcon fontSize="small" /></IconButton>
      <Box sx={{minWidth: 0, flex: 1}}>
        <Typography sx={{fontSize: 14, lineHeight: 1.35, fontWeight: 700, color: tokenText.primary}} noWrap>{detailView === 'overview' ? context.equipmentName : currentTitle}{detailView !== 'overview' && !selectedDocumentCategory && typeof detailCounts[detailView] === 'number' && <Box component="span" sx={{ml: 0.75, color: tokenText.secondary, fontWeight: 400}}>{detailCounts[detailView]}</Box>}</Typography>
        <Typography sx={{fontSize: 12, lineHeight: 1.3, color: tokenText.secondary}} noWrap>{detailView === 'overview' ? `${context.requestId} · ${context.location} · ${context.createdAt}` : `${context.equipmentName} · ${context.location}`}</Typography>
      </Box>
      <IconButton aria-label="Close context" size="small" onClick={onClose} sx={{color: tokenBrand.main}}><CloseIcon fontSize="small" /></IconButton>
    </Box>
  );

  const SectionRow = ({label, count, view}: {label: OverviewDetailView; count: number; view: OverviewDetailView}) => {
    const Icon = sectionIcons[view];

    return (
      <Box component="button" onClick={() => setDetailView(view)} sx={{width: '100%', minHeight: 48, px: 1, py: 1, display: 'flex', alignItems: 'center', gap: 1.25, textAlign: 'left', border: 0, borderBottom: `1px solid ${tokenDivider}`, bgcolor: 'transparent', cursor: 'pointer', color: tokenText.primary, '&:hover': {bgcolor: tokenBrand.softBg}}}>
        <Box sx={{width: 24, minWidth: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokenText.secondary}}>
          <Icon size={20} strokeWidth={2} absoluteStrokeWidth />
        </Box>
        <Box sx={{minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: 1}}>
          <Typography sx={{fontSize: 14, lineHeight: 1.25, fontWeight: 500, color: tokenText.primary}}>{label}</Typography>
          <Box component="span" sx={{minWidth: 24, height: 22, px: 0.75, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '999px', bgcolor: tokenNeutral.main, color: tokenText.secondary, fontSize: 12, lineHeight: 1, fontWeight: 500}}>{count}</Box>
        </Box>
        <ChevronRightIcon sx={{fontSize: 20, color: tokenText.secondary}} />
      </Box>
    );
  };
  const StatusChip = ({label, tone}: {label: string; tone: RecordTone}) => <Chip label={label} size="small" sx={{height: 24, borderRadius: '999px', bgcolor: `${toneColor[tone]}14`, color: toneColor[tone], fontSize: 11, fontWeight: 500, '& .MuiChip-label': {px: 1}}} />;
  const relatedActionButtonSx = {minHeight: 34, px: 1.75, borderRadius: '8px', bgcolor: tokenBrand.main, boxShadow: 'none', fontSize: 11, textTransform: 'none', '&:hover': {bgcolor: tokenBrand.dark, boxShadow: 'none'}} as const;

  const openRecord = (record: ContextRecord) => {
    onClose();
    if (record.kind === 'Work order') onOpenWorkOrderDetails(record);
    else if (record.kind === 'Maintenance request') onOpenMaintenanceRequestDetails(record);
    else onOpenEsoDetails(record);
  };
  const RecordList = ({kind}: {kind: RecordKind}) => <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.75}}>{records[kind].map((record) => <Box component="button" key={record.id} onClick={() => openRecord(record)} sx={{position: 'relative', py: 1.25, pl: 1.5, pr: 1.25, width: '100%', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', columnGap: 1, rowGap: 0.5, textAlign: 'left', cursor: 'pointer', border: `1px solid ${tokenDivider}`, borderRadius: '8px', bgcolor: tokenCommon.white, overflow: 'hidden', '&::before': {content: '""', position: 'absolute', inset: '0 auto 0 0', width: 3, bgcolor: toneColor[record.tone]}, '&:hover': {borderColor: tokenBrand.main, bgcolor: tokenBrand.softBg}, '&:focus-visible': {outline: `2px solid ${tokenBrand.main}`, outlineOffset: 1}}}><Box sx={{minWidth: 0}}><Typography sx={{fontSize: 10, lineHeight: 1.3, fontWeight: 500, color: tokenText.secondary}}>{record.id}</Typography><Typography sx={{mt: 0.25, fontSize: 14, lineHeight: 1.35, fontWeight: 700, color: tokenText.primary}}>{record.title}</Typography></Box><Box sx={{display: 'flex', alignItems: 'flex-start', gap: 0.5}}><StatusChip label={record.status} tone={record.tone} /><ChevronRightIcon sx={{mt: 0.25, fontSize: 18, color: tokenText.secondary}} /></Box><Box sx={{gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap'}}><Typography sx={{fontSize: 11, lineHeight: 1.35, color: tokenText.secondary}}>{record.meta}</Typography><Box sx={{width: 3, height: 3, borderRadius: '50%', bgcolor: tokenText.disabled}} /><Typography sx={{fontSize: 11, lineHeight: 1.35, color: tokenText.secondary}}>{record.owner}</Typography><Chip label={record.priority} size="small" sx={{height: 20, borderRadius: '6px', bgcolor: tokenNeutral.main, color: tokenText.primary, fontSize: 10, '& .MuiChip-label': {px: 0.75}}} /></Box></Box>)}</Box>;

  const TimeSeriesList = () => {
    const allExpanded = expandedTimeSeries.size === timeSeriesRecords.length;

    return <Box><Box sx={{mb: 1, minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}><Typography sx={{fontSize: 12, color: tokenText.secondary}}>{expandedTimeSeries.size} of {timeSeriesRecords.length} expanded</Typography><Button size="small" startIcon={allExpanded ? <CollapseIcon /> : <ExpandIcon />} onClick={() => setExpandedTimeSeries(allExpanded ? new Set() : new Set(timeSeriesRecords.map((series) => series.id)))} sx={{minHeight: 32, px: 1, borderRadius: '8px', color: tokenBrand.main, fontSize: 11, fontWeight: 700, textTransform: 'none'}}>{allExpanded ? 'Collapse all' : 'Expand all'}</Button></Box><Box sx={{display: 'flex', flexDirection: 'column', gap: 0.75}}>{timeSeriesRecords.map((series) => { const expanded = expandedTimeSeries.has(series.id); return <Box key={series.id} sx={{border: `1px solid ${tokenDivider}`, borderRadius: '8px', bgcolor: tokenCommon.white, overflow: 'hidden'}}><Box component="button" aria-expanded={expanded} onClick={() => setExpandedTimeSeries((current) => { const next = new Set(current); if (next.has(series.id)) next.delete(series.id); else next.add(series.id); return next; })} sx={{p: 1.25, width: '100%', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto auto', alignItems: 'center', gap: 1, border: 0, bgcolor: 'transparent', textAlign: 'left', cursor: 'pointer', '&:hover': {bgcolor: tokenBrand.softBg}, '&:focus-visible': {outline: `2px solid ${tokenBrand.main}`, outlineOffset: -2}}}><Box sx={{minWidth: 0}}><Typography sx={{fontSize: 13, lineHeight: 1.35, fontWeight: 700, color: tokenText.primary}}>{series.label}</Typography><Typography sx={{mt: 0.25, fontSize: 10, lineHeight: 1.3, color: tokenText.secondary}}>{series.source}</Typography></Box><Box sx={{textAlign: 'right'}}><Typography sx={{fontSize: 16, lineHeight: 1.25, fontWeight: 500, color: tokenText.primary}}>{series.value}</Typography><Typography sx={{fontSize: 10, lineHeight: 1.3, fontWeight: 700, color: series.accent}}>{series.delta}</Typography></Box>{expanded ? <CollapseIcon sx={{fontSize: 20, color: tokenBrand.main}} /> : <ExpandIcon sx={{fontSize: 20, color: tokenBrand.main}} />}</Box>{expanded && <Box sx={{px: 1.25, pb: 1.25, borderTop: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest}}><Sparkline color={series.accent} values={[...series.values]} /><Typography sx={{fontSize: 11, color: tokenText.disabled}}>Last 8 hours · {series.sampling}</Typography></Box>}</Box>; })}</Box></Box>;
  };

  const renderDetail = () => {
    if (detailView === 'Properties') return <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.75}}>{context.properties?.map((item) => <Box key={item.label} sx={{px: 1.5, py: 1, borderRadius: '8px', bgcolor: tokenNeutral.main}}><Typography sx={{fontSize: 10, lineHeight: 1.2, color: tokenText.secondary}}>{item.label}</Typography><Typography sx={{mt: 0.25, fontSize: 13, lineHeight: 1.3, fontWeight: 500, color: tokenText.primary}}>{item.value}</Typography></Box>)}</Box>;
    if (detailView === 'Timeseries') return <TimeSeriesList />;
    if (detailView === '3D View') {
      const selected = equipmentViews[selectedEquipmentView];
      return <><Box sx={{mb: 1.5, p: 1.5, borderRadius: '12px', bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenDivider}`}}><Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}><Typography sx={{fontSize: 14, fontWeight: 700, color: tokenText.primary}}>{selected.label}</Typography><Typography sx={{fontSize: 11, color: tokenText.secondary}}>View {selectedEquipmentView + 1} of {equipmentViews.length}</Typography></Box><Typography sx={{mt: 0.5, fontSize: 12, lineHeight: 1.45, color: tokenText.secondary}}>Select another angle below to inspect the equipment from a different perspective.</Typography></Box><Box component="img" src={selected.path} alt={`${context.equipmentName} ${selected.label}`} sx={{width: '100%', height: 230, objectFit: 'contain', borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: tokenCommon.white}} /><Box sx={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mt: 1.5}}>{equipmentViews.map((view, index) => <Box component="button" key={view.label} onClick={() => setSelectedEquipmentView(index)} sx={{p: 0.5, borderRadius: '8px', border: `2px solid ${index === selectedEquipmentView ? tokenBrand.main : 'transparent'}`, bgcolor: index === selectedEquipmentView ? tokenBrand.softBg : tokenCommon.white, cursor: 'pointer', transition: 'border-color 0.2s ease, background-color 0.2s ease'}}><Box component="img" src={view.path} alt="" sx={{display: 'block', width: '100%', height: 70, objectFit: 'cover', borderRadius: '6px'}} /><Typography sx={{p: 0.5, fontSize: 11, fontWeight: index === selectedEquipmentView ? 700 : 500, color: tokenText.primary}}>{view.label}</Typography></Box>)}</Box></>;
    }
    if (detailView === 'Documents') {
      if (selectedDocumentCategory) return <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>{(documentFiles[selectedDocumentCategory] ?? documentFiles.Manuals).map((file) => <Box component="button" key={file.name} sx={{p: 1.5, width: '100%', display: 'flex', alignItems: 'center', gap: 1.5, textAlign: 'left', border: `1px solid ${tokenDivider}`, borderRadius: '12px', bgcolor: tokenCommon.white, cursor: 'pointer', '&:hover': {borderColor: tokenBrand.main}}}><FileTypeIcon format={file.format} /><Box sx={{minWidth: 0, flex: 1}}><Typography sx={{fontSize: 14, fontWeight: 500, color: tokenText.primary}}>{file.name}</Typography><Typography sx={{mt: 0.5, fontSize: 12, color: tokenText.secondary}}>{file.size} · {file.updated}</Typography></Box><Chip label={file.format} size="small" sx={{height: 24, borderRadius: '6px', bgcolor: tokenBrand.softBg, color: tokenBrand.main, fontSize: 10, fontWeight: 700}} /><ChevronRightIcon sx={{fontSize: 18, color: tokenBrand.main}} /></Box>)}</Box>;
      return <Box>{documentCategories.map((item) => <Box component="button" key={item.label} onClick={() => setSelectedDocumentCategory(item.label)} sx={{py: 1.5, px: 0, width: '100%', border: 0, borderBottom: `1px solid ${tokenDivider}`, bgcolor: 'transparent', display: 'flex', alignItems: 'center', gap: 1, textAlign: 'left', cursor: 'pointer', '&:hover': {bgcolor: tokenBrand.softBg}}}><DescriptionIcon sx={{fontSize: 20, color: tokenBrand.main}} /><Typography sx={{fontSize: 14, color: tokenText.primary, flex: 1}}>{item.label}</Typography><Typography sx={{fontSize: 12, color: tokenText.secondary}}>{item.count}</Typography><ChevronRightIcon sx={{fontSize: 18, color: tokenBrand.main}} /></Box>)}</Box>;
    }
    if (detailView === 'Spare parts') return <Box sx={{borderTop: `1px solid ${tokenDivider}`}}>{relatedParts.map((part) => { const expanded = expandedPart === part.code; return <Box key={part.code} sx={{borderBottom: `1px solid ${tokenDivider}`}}><Box component="button" onClick={() => setExpandedPart(expanded ? null : part.code)} sx={{py: 1.5, px: 0, width: '100%', display: 'flex', alignItems: 'center', gap: 1, border: 0, bgcolor: 'transparent', textAlign: 'left', cursor: 'pointer'}}><Box sx={{minWidth: 0, flex: 1}}><Typography sx={{fontSize: 14, fontWeight: 500, color: tokenText.primary}}>{part.name}</Typography><Typography sx={{mt: 0.25, fontSize: 11, color: tokenText.secondary}}>{part.code} · {part.location}</Typography></Box><Typography sx={{fontSize: 12, fontWeight: 500, color: tokenSuccess.darker}}>{part.stock}</Typography>{expanded ? <CollapseIcon sx={{fontSize: 19, color: tokenBrand.main}} /> : <ExpandIcon sx={{fontSize: 19, color: tokenBrand.main}} />}</Box>{expanded && <Box sx={{pb: 1.5, display: 'grid', gridTemplateColumns: '112px minmax(0, 1fr)', gap: 1.5}}><Box component="img" src={part.image} alt={part.name} sx={{width: 112, height: 96, objectFit: 'contain', borderRadius: '8px', bgcolor: tokenCommon.white, border: `1px solid ${tokenDivider}`}} /><Box><Typography sx={{fontSize: 12, lineHeight: 1.5, color: tokenText.secondary}}>{part.description}</Typography><Box sx={{mt: 1, display: 'flex', gap: 0.75, flexWrap: 'wrap'}}><Chip label={`Supplier: ${part.supplier}`} size="small" sx={{height: 24, borderRadius: '6px', bgcolor: tokenBrand.softBg, color: tokenBrand.main, fontSize: 10}} /><Chip label={`Reorder at ${part.reorder}`} size="small" sx={{height: 24, borderRadius: '6px', bgcolor: tokenNeutral.main, color: tokenText.primary, fontSize: 10}} /></Box></Box></Box>}</Box>; })}</Box>;
    if (detailView === 'Related work') {
      const recordKind: RecordKind = relatedTab === 'Work orders' ? 'Work order' : 'Maintenance request';
      return <><Tabs value={relatedTab} onChange={(_, value: 'Work orders' | 'Maintenance requests') => setRelatedTab(value)} sx={{mx: -2, px: 2, mb: 2, borderBottom: `1px solid ${tokenDivider}`, minHeight: 42, '& .MuiTab-root': {minHeight: 42, px: 1.5, fontSize: 12, fontWeight: 500, textTransform: 'none'}, '& .Mui-selected': {fontWeight: 700, color: `${tokenText.primary} !important`}, '& .MuiTabs-indicator': {height: 2, bgcolor: tokenBrand.main}}}><Tab label={`Work orders ${records['Work order'].length}`} value="Work orders" /><Tab label={`Maintenance requests ${records['Maintenance request'].length}`} value="Maintenance requests" /></Tabs><RecordList kind={recordKind} /><Box sx={{mt: 2, display: 'flex', justifyContent: 'flex-end'}}>{relatedTab === 'Work orders' ? <Button variant="contained" startIcon={<HandymanIcon />} onClick={onOpenWorkOrder} sx={relatedActionButtonSx}>Create work order</Button> : <Button variant="contained" startIcon={<BuildIcon />} onClick={onOpenMaintenanceRequest} sx={relatedActionButtonSx}>Create maintenance request</Button>}</Box></>;
    }
    if (detailView === 'ESOs') return <><RecordList kind="ESO" /><Button fullWidth variant="contained" onClick={onOpenEso} sx={{mt: 2, minHeight: 40, borderRadius: '8px', bgcolor: tokenBrand.main, boxShadow: 'none', textTransform: 'none'}}>Create ESO</Button></>;
    if (detailView === 'Record detail' && activeRecord) return <Box><Box sx={{p: 2, border: `1px solid ${tokenDivider}`, borderRadius: '12px', bgcolor: tokenCommon.white}}><Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1}}><Typography sx={{fontSize: 20, fontWeight: 700, color: tokenText.primary}}>{activeRecord.title}</Typography><StatusChip label={activeRecord.status} tone={activeRecord.tone} /></Box><Typography sx={{mt: 1.5, fontSize: 14, lineHeight: 1.6, color: tokenText.secondary}}>{activeRecord.description}</Typography><Box sx={{mt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1}}>{[{label: 'Owner', value: activeRecord.owner}, {label: 'Priority', value: activeRecord.priority}, {label: 'Asset', value: context.equipmentName}, {label: 'Location', value: context.location}].map((item) => <Box key={item.label} sx={{p: 1.5, borderRadius: '8px', bgcolor: tokenNeutral.lightest}}><Typography sx={{fontSize: 11, color: tokenText.secondary}}>{item.label}</Typography><Typography sx={{mt: 0.5, fontSize: 13, fontWeight: 500, color: tokenText.primary}}>{item.value}</Typography></Box>)}</Box></Box><Typography sx={{mt: 2, mb: 1, fontSize: 12, fontWeight: 700, color: tokenText.secondary}}>ACTIVITY</Typography>{['Record created and triaged', 'Owner assigned', activeRecord.status === 'Completed' || activeRecord.status === 'Approved' ? 'Review completed' : 'Next action pending'].map((item, index) => <Box key={item} sx={{display: 'flex', gap: 1.5, pb: 2}}><Box sx={{mt: 0.5, width: 10, height: 10, borderRadius: '50%', bgcolor: index < 2 ? tokenSuccess.darker : tokenBrand.main}} /><Box><Typography sx={{fontSize: 13, fontWeight: 500, color: tokenText.primary}}>{item}</Typography><Typography sx={{fontSize: 11, color: tokenText.secondary}}>{index === 0 ? 'Today at 08:30' : index === 1 ? 'Today at 08:38' : 'Current status'}</Typography></Box></Box>)}</Box>;
    if (detailView === 'Training') return <Box>{trainingLinks.map((item) => <Box component="button" key={item.title} onClick={onOpenSmartSearch} sx={{mb: 1, p: 1.5, width: '100%', display: 'grid', gridTemplateColumns: '32px minmax(0, 1fr) 20px', gap: 1.25, alignItems: 'start', textAlign: 'left', border: `1px solid ${tokenDivider}`, borderRadius: '12px', bgcolor: tokenCommon.white, cursor: 'pointer', '&:hover': {borderColor: tokenBrand.main, bgcolor: tokenBrand.softBg}}}><TrainingIcon sx={{mt: 0.1, fontSize: 26, color: tokenBrand.main}} /><Box><Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1}}><Typography sx={{fontSize: 14, fontWeight: 700, color: tokenText.primary}}>{item.title}</Typography><Chip label={item.status} size="small" sx={{height: 22, borderRadius: '6px', bgcolor: item.status === 'Required' ? tokenWarning.selectedBg : tokenBrand.softBg, color: item.status === 'Required' ? tokenWarning.dark : tokenBrand.main, fontSize: 9, fontWeight: 700}} /></Box><Typography sx={{mt: 0.75, fontSize: 12, lineHeight: 1.5, color: tokenText.secondary}}>{item.description}</Typography><Typography sx={{mt: 1, fontSize: 11, fontWeight: 500, color: tokenText.disabled}}>{item.type} · {item.duration} · {item.level}</Typography></Box><LinkIcon sx={{mt: 0.25, fontSize: 18, color: tokenBrand.main}} /></Box>)}</Box>;
    if (detailView === 'Notifications') return <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>{notifications.map((item) => <Box key={item.title} sx={{p: 1.5, display: 'flex', gap: 1.5, border: `1px solid ${tokenDivider}`, borderRadius: '12px', bgcolor: tokenCommon.white}}><NotificationIcon sx={{color: item.tone === 'critical' ? tokenError.main : item.tone === 'warning' ? tokenWarning.dark : item.tone === 'success' ? tokenSuccess.darker : tokenBrand.main}} /><Box><Typography sx={{fontSize: 14, fontWeight: 500, color: tokenText.primary}}>{item.title}</Typography><Typography sx={{mt: 0.5, fontSize: 12, color: tokenText.secondary}}>{item.meta}</Typography><Typography sx={{mt: 0.65, fontSize: 12, lineHeight: 1.45, color: tokenText.disabled}}>{item.detail}</Typography></Box></Box>)}</Box>;
    if (detailView === 'Main KPIs') return <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5}}>{kpis.map((kpi, index) => <Box key={`${kpi.label}-${index}`} sx={{p: 1.5, minHeight: 132, border: `1px solid ${tokenDivider}`, borderRadius: '12px', bgcolor: tokenCommon.white}}><Box sx={{display: 'flex', justifyContent: 'space-between'}}><ChartIcon sx={{fontSize: 20, color: kpi.accent}} /><Typography sx={{fontSize: 12, fontWeight: 700, color: kpi.accent}}>{kpi.delta}</Typography></Box><Typography sx={{mt: 1.5, fontSize: 24, color: tokenText.primary}}>{kpi.value}</Typography><Typography sx={{mt: 0.75, fontSize: 12, color: tokenText.secondary}}>{kpi.label}</Typography><LinearProgress variant="determinate" value={Math.max(28, 88 - index * 8)} sx={{mt: 1.5, height: 4, borderRadius: 999, bgcolor: tokenNeutral.main, '& .MuiLinearProgress-bar': {bgcolor: kpi.accent}}} /></Box>)}</Box>;
    if (detailView === 'Event log') return <Box>{eventRecords.map((event, index) => <Box key={`${event.time}-${event.title}`} sx={{display: 'grid', gridTemplateColumns: '64px 16px 1fr', gap: 1, pb: index === eventRecords.length - 1 ? 0 : 2.5}}><Typography sx={{fontSize: 12, color: tokenText.secondary}}>{event.time}</Typography><Box sx={{display: 'flex', justifyContent: 'center'}}><Box sx={{mt: 0.25, width: 10, height: 10, borderRadius: '50%', bgcolor: event.severity === 'Critical' ? tokenError.main : event.severity === 'Warning' ? tokenWarning.main : event.severity === 'Completed' ? tokenSuccess.darker : tokenBrand.main}} /></Box><Box><Typography sx={{fontSize: 14, fontWeight: 500, color: tokenText.primary}}>{event.title}</Typography><Typography sx={{mt: 0.5, fontSize: 12, lineHeight: 1.5, color: tokenText.secondary}}>{event.detail}</Typography><Typography sx={{mt: 0.75, fontSize: 11, fontWeight: 700, color: tokenText.disabled}}>{event.severity.toUpperCase()}</Typography></Box></Box>)}</Box>;
    return null;
  };

  return <Drawer anchor="right" open={open} onClose={onClose} ModalProps={{keepMounted: true}} PaperProps={{sx: {width: {xs: '100%', sm: 480}, maxWidth: '100%', top: 48, height: 'calc(100% - 48px)', bgcolor: tokenNeutral.lightest, color: tokenText.primary, borderLeft: `1px solid ${tokenDivider}`, boxShadow: '-8px 0 24px rgba(0,31,155,0.12)', overflow: 'hidden'}}}>
    {detailView === 'overview' ? <Box sx={{height: '100%', display: 'flex', flexDirection: 'column'}}><Header /><Box sx={{px: 2, py: 1.5, overflowY: 'auto', flex: 1}}>
      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75}}><Box sx={{px: 1.25, py: 0.9, borderRadius: '8px', bgcolor: tokenNeutral.main}}><Typography sx={{fontSize: 10, color: tokenText.secondary}}>Context ID</Typography><Typography sx={{mt: 0.2, fontSize: 12, fontWeight: 500, color: tokenText.primary}}>{context.requestId}</Typography></Box><Box sx={{px: 1.25, py: 0.9, borderRadius: '8px', bgcolor: tokenNeutral.main}}><Typography sx={{fontSize: 10, color: tokenText.secondary}}>Location</Typography><Typography sx={{mt: 0.2, fontSize: 12, fontWeight: 500, color: tokenText.primary}}>{context.location}</Typography></Box><Box sx={{gridColumn: '1 / -1', px: 1.25, py: 0.9, borderRadius: '8px', bgcolor: tokenNeutral.main}}><Typography sx={{fontSize: 10, color: tokenText.secondary}}>Equipment</Typography><Typography sx={{mt: 0.2, fontSize: 13, fontWeight: 500, color: tokenText.primary}}>{context.equipmentName}</Typography></Box></Box>
      <Box sx={{mt: 1, p: 1, display: 'flex', gap: 1, borderRadius: '8px', borderLeft: `4px solid ${tokenError.main}`, bgcolor: tokenError.softBg}}><WarningIcon sx={{mt: 0.1, fontSize: 17, color: tokenError.main}} /><Typography noWrap sx={{fontSize: 11, lineHeight: 1.5, color: tokenText.primary}}>{context.alertText}</Typography></Box>
      <Box sx={{mt: 1, p: 1.5, borderRadius: '12px', bgcolor: 'rgba(31,99,234,0.045)', '@keyframes contextualizationAiPulse': {'0%': {opacity: 0.45}, '50%': {opacity: 1}, '100%': {opacity: 0.45}}}}><Box sx={{display: 'flex', alignItems: 'center', gap: 1}}><AutoAwesomeIcon sx={{fontSize: 16, color: tokenWarning.main}} /><Typography sx={{fontSize: 14, fontWeight: 700, color: tokenBrand.main, flex: 1}}>BLU.AI analysis</Typography><Button size="small" endIcon={insightExpanded ? <CollapseIcon /> : <ExpandIcon />} onClick={() => setInsightExpanded((value) => !value)} sx={{minWidth: 0, color: tokenText.secondary, fontSize: 10, fontWeight: 700, textTransform: 'uppercase'}}>{insightExpanded ? 'Collapse' : 'Expand'}</Button></Box>{insightExpanded && <><Typography sx={{mt: 1, fontSize: 13, fontWeight: 700, color: tokenText.primary}}>{context.insightTitle}</Typography><Typography sx={{mt: 0.35, minHeight: 48, fontSize: 11, lineHeight: 1.45, color: tokenText.secondary}}>{typedInsightBody}{isInsightTyping ? <Box component="span" sx={{display: 'inline-block', width: 2, height: 12, ml: 0.25, bgcolor: tokenBrand.main, verticalAlign: 'text-bottom', animation: 'contextualizationAiPulse 0.8s ease-in-out infinite'}} /> : null}</Typography><Box component="img" src={context.heroImagePath} alt={context.equipmentName} sx={{mt: 1, width: '100%', height: 164, objectFit: 'cover', objectPosition: 'center', borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: tokenCommon.white}} /><Box sx={{mt: 1, display: 'flex', justifyContent: 'flex-end'}}><Button variant="contained" startIcon={<HandymanIcon />} onClick={onOpenWorkOrder} sx={relatedActionButtonSx}>Create work order</Button></Box></>}</Box>
      <Box sx={{mt: 1}}>{overviewSections.map((section) => <SectionRow key={section.label} label={section.label} count={section.count} view={section.view} />)}</Box>
    </Box></Box> : <Box sx={{height: '100%', display: 'flex', flexDirection: 'column'}}><Header /><Box sx={{px: 2, py: 2, overflowY: 'auto', flex: 1}}>{renderDetail()}</Box></Box>}
  </Drawer>;
}
