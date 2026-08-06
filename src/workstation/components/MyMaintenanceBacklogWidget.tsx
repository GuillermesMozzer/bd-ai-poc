import {useMemo, useState} from 'react';
import {Avatar, Box, Button, IconButton, Snackbar, Alert, Typography} from '@mui/material';
import {
  Build as BuildIcon,
  CalendarMonth as CalendarIcon,
  Label as LabelIcon,
  LocationOn as LocationIcon,
  NorthEast as NorthEastIcon,
  PrecisionManufacturingOutlined as AiReporterIcon,
} from '@mui/icons-material';
import {maintenanceLaneData} from '../../Maintenance/data';
import type {MaintenanceCard, MaintenancePriority} from '../../Maintenance/types';
import {
  buildWorkOrderDraftFromBoardCard,
  buildWorkOrderDraftFromRequest,
  CreateWorkOrderDrawer,
  MaintenanceRequestDrawer,
  type WorkOrderDraft,
  type WorkOrderTab,
} from '../../Maintenance/pages/MaintenanceFollowUpBoardPage';
import {
  tokenBrand,
  tokenCommon,
  tokenError,
  tokenInfo,
  tokenNeutral,
  tokenSuccess,
  tokenWarning,
  workstationPriorityTone,
  workstationSoftBadgeSx,
  workstationStatusPillSx,
  workstationSqdcpTone,
  workstationVisuals,
} from '../theme';
import WidgetShell from './WidgetShell';
import type {MaintenanceOpenTarget, WorkstationContextualizationTarget, WorkstationWidgetProps} from '../types';
import {
  maintenanceBacklogNotificationConfig,
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  useWidgetNotifications,
} from './WidgetNotifications';

type BacklogMode = 'requests' | 'workOrders';

type MaintenanceRequestItem = MaintenanceCard & {
  requestId: string;
  reporter: string;
  reporterType: 'person' | 'ai';
  ageDays: number;
  activityType: 'Breakdown' | 'Inspection' | 'Mechanical' | 'Corrective';
  location: string;
  equipment: string;
  equipmentCriticality: 'A' | 'B' | 'C';
  condition?: 'Stopped / Internal' | 'Running / External';
  tags: Array<'D' | 'Q' | 'E'>;
};

type WorkOrderBacklogItem = MaintenanceCard & {
  workOrderId: string;
  type: 'Breakdown' | 'Corrective' | 'Preventive';
  status: 'Planning';
  location: string;
  equipment: string;
  equipmentCriticality: 'A' | 'B' | 'C';
  overdue: boolean;
  planningQueue: boolean;
  missingParts: boolean;
  condition?: 'Stopped / Internal' | 'Running / External';
  tags: Array<'D' | 'Q' | 'S'>;
};

type BacklogKpiFilter = 'all' | 'highPriority' | 'aging' | 'criticalAssets' | 'overdue' | 'planning' | 'missingParts';

type BacklogKpi = {
  value: number;
  label: string;
  note: string;
  color: string;
  filter: BacklogKpiFilter;
  criticality?: 'error' | 'warning';
};

type MaintenanceBacklogWidgetProps = WorkstationWidgetProps & {
  onOpenMaintenance?: (target?: MaintenanceOpenTarget) => void;
  onOpenContextualization?: (target: WorkstationContextualizationTarget) => void;
};

const intentStorageKey = 'workstation:maintenance-backlog-intent';

const requestIdByCardId: Record<string, string> = {
  'mr-1': 'MR 606034603',
  'mr-2': 'MR 606034604',
  'mr-8': 'MR 606034608',
  'mr-3': 'MR 606034605',
  'mr-4': 'MR 606034606',
  'mr-5': 'MR 606034607',
  'mr-6': 'MR 606034609',
  'mr-7': 'MR 606034610',
};

const reporterTypeByName = (name: string): 'person' | 'ai' => (name === 'BLU.AI' ? 'ai' : 'person');

const maintenanceRequests: MaintenanceRequestItem[] = maintenanceLaneData.requests.map((card, index) => ({
  ...card,
  requestId: requestIdByCardId[card.id] ?? `MR ${606034603 + index}`,
  reporter: card.assignee,
  reporterType: reporterTypeByName(card.assignee),
  ageDays: index > 4 ? 8 : index > 1 ? 3 : 1,
  activityType: card.priority === 'Emergency' ? 'Breakdown' : card.priority === 'High' ? 'Corrective' : 'Inspection',
  location: index % 2 === 0 ? 'Autoguard Line 10' : 'Zone 2 - Line A',
  equipment: card.title,
  equipmentCriticality: card.priority === 'Emergency' || card.priority === 'High' ? 'A' : card.priority === 'Medium' ? 'B' : 'C',
  condition: card.priority === 'Emergency' ? 'Stopped / Internal' : undefined,
  tags: ['D', 'Q', 'E'],
}));

const planningWorkOrderEquipmentById: Record<string, {equipment: string; criticality: 'A' | 'B' | 'C'; condition: 'Running / External'}> = {
  'sch-1': {equipment: 'Conveyor CV-210', criticality: 'A', condition: 'Running / External'},
  'sch-2': {equipment: 'Packaging Robot RB-402', criticality: 'B', condition: 'Running / External'},
  'sch-3': {equipment: 'Transfer Pump P-118', criticality: 'A', condition: 'Running / External'},
  'sch-4': {equipment: 'Vision System VS-05', criticality: 'C', condition: 'Running / External'},
  'sch-5': {equipment: 'Case Packer CP-06', criticality: 'B', condition: 'Running / External'},
};

const workOrders: WorkOrderBacklogItem[] = maintenanceLaneData.team.scheduling.map((card, index) => ({
  ...card,
  workOrderId: `WO ${606034603 + index}`,
  type: 'Corrective',
  status: 'Planning',
  location: 'Autoguard Line 10',
  equipment: planningWorkOrderEquipmentById[card.id]?.equipment ?? card.title,
  equipmentCriticality: planningWorkOrderEquipmentById[card.id]?.criticality ?? card.equipmentCriticality ?? 'B',
  overdue: index === 0,
  planningQueue: true,
  missingParts: card.tags?.includes('Requested Missing Parts') ?? false,
  condition: planningWorkOrderEquipmentById[card.id]?.condition ?? 'Running / External',
  tags: ['D', 'Q', 'S'],
}));

const insetCardSx = {
  border: `1px solid ${workstationVisuals.tierBorder}`,
  borderRadius: '8px',
  bgcolor: 'background.paper',
} as const;

const chipSelectorSx = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.4,
  p: 0.35,
  borderRadius: '8px',
  border: `1px solid ${workstationVisuals.tierBorder}`,
  bgcolor: 'background.paper',
} as const;

const chipButtonSx = {
  minHeight: 24,
  height: 24,
  borderRadius: '8px',
  px: 1,
  py: 0,
  textTransform: 'none',
  fontFamily: workstationVisuals.fontFamily,
  fontSize: '0.7rem',
  fontWeight: 600,
  lineHeight: 1,
  border: 'none',
} as const;

const criticalityColorByLevel = {
  A: tokenError.dark,
  B: tokenWarning.main,
  C: tokenSuccess.darker,
} as const;

function getCriticalKpiSx(criticality?: 'error' | 'warning') {
  if (criticality === 'error') {
    return {
      bgcolor: tokenError.softBg,
      border: `1px solid ${tokenError.lighter}`,
    } as const;
  }

  if (criticality === 'warning') {
    return {
      bgcolor: tokenWarning.softBg,
      border: `1px solid ${tokenWarning.lighter}`,
    } as const;
  }

  return {} as const;
}

function clearBacklogIntent() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(intentStorageKey);
}

export default function MyMaintenanceBacklogWidget({
  className,
  style,
  onExpand,
  onOpenMaintenance,
  onOpenContextualization,
}: MaintenanceBacklogWidgetProps) {
  const notifications = useWidgetNotifications(maintenanceBacklogNotificationConfig);
  const [mode, setMode] = useState<BacklogMode>('workOrders');
  const [selectedRequestCard, setSelectedRequestCard] = useState<MaintenanceCard | null>(null);
  const [workOrderDraft, setWorkOrderDraft] = useState<WorkOrderDraft | null>(null);
  const [workOrderTab, setWorkOrderTab] = useState<WorkOrderTab>('attachments');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeKpiFilter, setActiveKpiFilter] = useState<BacklogKpiFilter>('planning');

  const requestKpis = useMemo(() => {
    const openRequests = maintenanceRequests.length;
    return [
      {value: openRequests, label: 'Open Requests', note: 'Awaiting review', color: tokenBrand.main, filter: 'all' as const},
      {value: maintenanceRequests.filter((item) => item.priority === 'High' || item.priority === 'Emergency').length, label: 'High Priority', note: 'High or emergency', color: tokenError.main, filter: 'highPriority' as const, criticality: 'error' as const},
      {value: maintenanceRequests.filter((item) => item.ageDays > 7).length, label: 'Aging > 7 Days', note: 'Needs attention', color: tokenWarning.main, filter: 'aging' as const, criticality: 'warning' as const},
      {value: maintenanceRequests.filter((item) => item.equipmentCriticality === 'A').length, label: 'Critical Assets', note: 'Asset criticality A', color: tokenError.main, filter: 'criticalAssets' as const, criticality: 'error' as const},
    ];
  }, []);

  const workOrderKpis: BacklogKpi[] = useMemo(() => [
    {value: workOrders.filter((item) => item.status === 'Planning').length, label: 'Planning', note: 'Awaiting planner', color: tokenInfo.main, filter: 'planning'},
    {value: workOrders.filter((item) => item.priority === 'High' || item.priority === 'Emergency').length, label: 'High Priority', note: 'High or emergency', color: tokenError.main, filter: 'highPriority', criticality: 'error'},
    {value: workOrders.filter((item) => item.overdue).length, label: 'Overdue', note: 'Past due date', color: tokenWarning.main, filter: 'overdue', criticality: 'warning'},
    {value: workOrders.filter((item) => item.missingParts).length, label: 'Missing Parts', note: 'Awaiting parts', color: tokenError.main, filter: 'missingParts', criticality: 'error'},
  ], []);

  const filteredWorkOrders = useMemo(() => {
    if (activeKpiFilter === 'highPriority') return workOrders.filter((item) => item.priority === 'High' || item.priority === 'Emergency');
    if (activeKpiFilter === 'overdue') return workOrders.filter((item) => item.overdue);
    if (activeKpiFilter === 'missingParts') return workOrders.filter((item) => item.missingParts);
    return workOrders.filter((item) => item.status === 'Planning');
  }, [activeKpiFilter]);

  const filteredMaintenanceRequests = useMemo(() => {
    if (activeKpiFilter === 'highPriority') return maintenanceRequests.filter((item) => item.priority === 'High' || item.priority === 'Emergency');
    if (activeKpiFilter === 'aging') return maintenanceRequests.filter((item) => item.ageDays > 7);
    if (activeKpiFilter === 'criticalAssets') return maintenanceRequests.filter((item) => item.equipmentCriticality === 'A');
    return maintenanceRequests;
  }, [activeKpiFilter]);

  const openFollowUpBoard = () => {
    clearBacklogIntent();
    if (onOpenMaintenance) {
      onOpenMaintenance('followup');
      return;
    }
    onExpand?.();
  };

  const openRequestDrawer = (request: MaintenanceRequestItem) => {
    setWorkOrderDraft(null);
    setSelectedRequestCard(request);
  };

  const openWorkOrderDrawer = (item: WorkOrderBacklogItem) => {
    setSelectedRequestCard(null);
    setWorkOrderDraft(buildWorkOrderDraftFromBoardCard(item, 'Planning'));
    setWorkOrderTab('attachments');
  };

  const closeWorkOrderDrawer = () => {
    setWorkOrderDraft(null);
    setWorkOrderTab('attachments');
  };

  const headerAction = (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
      <WidgetNotificationBell active={notifications.active} onClick={notifications.openDialog} size={24} />
      <IconButton size="small" aria-label="Open Maintenance Follow Up Board" onClick={openFollowUpBoard} sx={{width: 24, height: 24, p: 0, color: tokenBrand.main}}>
        <NorthEastIcon sx={{fontSize: 18}} />
      </IconButton>
    </Box>
  );

  const kpis = mode === 'requests' ? requestKpis : workOrderKpis;
  const shownCount = mode === 'requests' ? filteredMaintenanceRequests.length : filteredWorkOrders.length;

  return (
    <>
      <WidgetShell title="Maintenance Backlog" action={headerAction} className={className} style={style}>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.2, height: '100%', minHeight: 0, p: 0.5, containerType: 'inline-size'}}>
        <Box sx={{...chipSelectorSx, alignSelf: 'flex-start', flexShrink: 0}}>
          <Button onClick={() => { setMode('workOrders'); setActiveKpiFilter('planning'); }} sx={getChipSx(mode === 'workOrders')}>
            Work Orders
          </Button>
          <Button onClick={() => { setMode('requests'); setActiveKpiFilter('all'); }} sx={getChipSx(mode === 'requests')}>
            Maintenance Requests
          </Button>
        </Box>

        <Box sx={{...insetCardSx, p: 1.5, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 1, flexShrink: 0, '@container (max-width: 640px)': {gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'}, '@container (max-width: 360px)': {gridTemplateColumns: '1fr'}}}>
          {kpis.map((metric, index) => (
            <MetricSummary key={metric.label} {...metric} active={metric.filter === activeKpiFilter} last={index === kpis.length - 1} onClick={() => setActiveKpiFilter(metric.filter)} />
          ))}
        </Box>

        <Box sx={{...insetCardSx, p: 1.5, minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 1}}>
          <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexShrink: 0}}>
            <Typography sx={{color: workstationVisuals.textPrimary, fontFamily: workstationVisuals.fontFamily, fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.2}}>
              {mode === 'requests' ? 'Maintenance Requests' : 'Backlog Work Orders'}
            </Typography>
            <Typography sx={{color: workstationVisuals.textSecondary, fontFamily: workstationVisuals.fontFamily, fontSize: '0.68rem', fontWeight: 500, lineHeight: 1.2, whiteSpace: 'nowrap'}}>
              {shownCount} shown
            </Typography>
          </Box>

          <Box sx={{flex: 1, minHeight: 0, overflow: 'auto', display: 'grid', alignContent: 'start', gap: 1}}>
            {mode === 'requests'
              ? filteredMaintenanceRequests.map((request) => (
                <RequestRow key={request.id} request={request} onOpen={() => openRequestDrawer(request)} />
              ))
              : filteredWorkOrders.map((item) => (
                <WorkOrderRow key={item.id} item={item} onOpen={() => openWorkOrderDrawer(item)} onOpenContextualization={onOpenContextualization} />
              ))}
          </Box>
        </Box>
        </Box>

        <Snackbar open={Boolean(toastMessage)} autoHideDuration={3000} onClose={() => setToastMessage(null)} anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}>
          <Alert onClose={() => setToastMessage(null)} severity="success" variant="filled" sx={{fontFamily: workstationVisuals.fontFamily, fontSize: '0.82rem', borderRadius: '8px'}}>
            {toastMessage}
          </Alert>
        </Snackbar>

        <MaintenanceRequestDrawer
          open={Boolean(selectedRequestCard)}
          card={selectedRequestCard}
          onClose={() => setSelectedRequestCard(null)}
          onAcceptToPlanning={(card) => {
            setToastMessage(`${requestIdByCardId[card.id] ?? card.id} accepted to planning.`);
            setSelectedRequestCard(null);
          }}
          onPlanNow={(card) => {
            setSelectedRequestCard(null);
            setWorkOrderDraft(buildWorkOrderDraftFromRequest(card));
            setWorkOrderTab('attachments');
          }}
          onLinkToExistingWork={(card) => {
            setToastMessage(`${requestIdByCardId[card.id] ?? card.id} linked to existing work.`);
            setSelectedRequestCard(null);
          }}
          onReject={(card) => {
            setToastMessage(`${requestIdByCardId[card.id] ?? card.id} rejected.`);
            setSelectedRequestCard(null);
          }}
        />
        <CreateWorkOrderDrawer
          open={Boolean(workOrderDraft)}
          activeTab={workOrderTab}
          initialDraft={workOrderDraft}
          onTabChange={setWorkOrderTab}
          onClose={closeWorkOrderDrawer}
          onSubmit={(draft) => {
            setToastMessage(`${draft.drawerTitle ?? draft.sourceRequestId ?? draft.sourceCardId ?? 'Work Order'} updated.`);
            closeWorkOrderDrawer();
          }}
        />
      </WidgetShell>
      <WidgetNotificationsDialog
        active={notifications.active}
        config={maintenanceBacklogNotificationConfig}
        draftState={notifications.draftState}
        onApplySuggestion={notifications.applySuggestion}
        onClose={notifications.closeDialog}
        onSave={notifications.save}
        onStateChange={notifications.setDraftState}
        open={notifications.open}
      />
    </>
  );
}

function getChipSx(active: boolean) {
  return {
    ...chipButtonSx,
    color: active ? tokenBrand.main : workstationVisuals.textSecondary,
    bgcolor: active ? tokenBrand.softBg : 'transparent',
    '&:hover': {
      bgcolor: active ? tokenBrand.softBg : tokenNeutral.lightest,
    },
  } as const;
}

function MetricSummary({active = false, color, criticality, label, last = false, note, onClick, value}: {active?: boolean; color: string; criticality?: 'error' | 'warning'; label: string; last?: boolean; note: string; onClick?: () => void; value: number}) {
  return (
    <Box
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick || (event.key !== 'Enter' && event.key !== ' ')) return;
        event.preventDefault();
        onClick();
      }}
      sx={{p: 0.5, pl: 1, minWidth: 0, borderRight: last ? 'none' : `1px solid ${workstationVisuals.tierBorder}`, borderRadius: '8px', bgcolor: active ? tokenBrand.softBg : 'transparent', cursor: onClick ? 'pointer' : 'default', transition: 'background-color 0.15s ease', ...getCriticalKpiSx(criticality), '&:hover': onClick ? {bgcolor: active ? tokenBrand.softBg : criticality === 'error' ? tokenError.softBg : criticality === 'warning' ? tokenWarning.softBg : tokenNeutral.lightest} : undefined, '@container (max-width: 640px)': {borderRight: 'none'}}}
    >
      <Box sx={{display: 'flex', alignItems: 'baseline', gap: 0.8, minWidth: 0}}>
        <Typography sx={{fontSize: '1.25rem', color, fontWeight: 600, lineHeight: 1, fontFamily: workstationVisuals.fontFamily, flexShrink: 0}}>
          {value}
        </Typography>
        <Typography sx={{fontSize: '0.72rem', color: workstationVisuals.textPrimary, fontWeight: 500, lineHeight: 1.2, fontFamily: workstationVisuals.fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
          {label}
        </Typography>
      </Box>
      <Typography sx={{fontSize: '0.62rem', color: workstationVisuals.textSecondary, mt: 0.5, fontFamily: workstationVisuals.fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
        {note}
      </Typography>
    </Box>
  );
}

function ReporterAvatar({request}: {request: MaintenanceRequestItem}) {
  if (request.reporterType === 'ai') {
    return (
      <Box sx={{width: 24, height: 24, borderRadius: '8px', bgcolor: tokenBrand.softBg, color: tokenBrand.main, display: 'grid', placeItems: 'center', flexShrink: 0}}>
        <AiReporterIcon sx={{fontSize: 15}} />
      </Box>
    );
  }

  const initials = request.reporter.split(' ').map((part) => part[0]).join('').slice(0, 2);
  return (
    <Avatar sx={{width: 24, height: 24, bgcolor: tokenNeutral.lightest, color: workstationVisuals.textSecondary, fontSize: '0.62rem', fontWeight: 600, fontFamily: workstationVisuals.fontFamily, border: `1px solid ${workstationVisuals.tierBorder}`}}>
      {initials}
    </Avatar>
  );
}

function PriorityBadge({priority}: {priority: MaintenancePriority}) {
  const normalized = priority === 'Emergency' || priority === 'Immediate' ? 'High' : priority === 'Very Low' ? 'Low' : priority;
  const tone = workstationPriorityTone[normalized as keyof typeof workstationPriorityTone];
  return (
    <Box sx={{display: 'inline-flex', alignItems: 'center', px: 1, py: 0.35, borderRadius: '8px', border: `1px solid ${tone.border}`, bgcolor: tone.bg, color: tone.color, fontSize: '0.68rem', fontWeight: 600, fontFamily: workstationVisuals.fontFamily, whiteSpace: 'nowrap'}}>
      {priority}
    </Box>
  );
}

function RequestRow({request, onOpen}: {request: MaintenanceRequestItem; onOpen: () => void}) {
  return (
    <Box onClick={onOpen} sx={{position: 'relative', minHeight: 74, bgcolor: 'background.paper', overflow: 'hidden', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(170px, 220px) 104px', alignItems: 'start', gap: 1.25, px: 1.1, py: 1, border: `1px solid ${workstationVisuals.tierBorder}`, borderRadius: '8px', cursor: 'pointer', transition: 'border-color 0.15s ease, background-color 0.15s ease', '&:hover': {borderColor: tokenNeutral.dark, bgcolor: tokenNeutral.lightest}, '@container (max-width: 620px)': {gridTemplateColumns: 'minmax(0, 1fr) auto', '& .request-meta': {gridColumn: '1 / -1', gridRow: 2}}, '@container (max-width: 360px)': {gridTemplateColumns: 'minmax(0, 1fr)', '& .request-status': {justifySelf: 'start'}}}}>
      <Box sx={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: request.priority === 'Emergency' || request.priority === 'High' ? tokenError.main : request.priority === 'Medium' ? tokenWarning.main : tokenSuccess.main}} />
      <Box sx={{minWidth: 0, pl: 0.35}}>
        <Box sx={{display: 'flex', alignItems: 'baseline', gap: 0.55, minWidth: 0}}>
          <Typography sx={{fontSize: '0.78rem', color: workstationVisuals.textPrimary, lineHeight: 1.18, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: workstationVisuals.fontFamily}}>
            {request.title}
          </Typography>
          <Box sx={{display: 'flex', gap: 0.35, flex: '0 0 auto'}}>
            {request.tags.map((tag) => (
              <Typography key={tag} component="span" sx={{fontSize: '0.66rem', color: workstationSqdcpTone[tag]?.color ?? workstationVisuals.textSecondary, lineHeight: 1, fontWeight: 600, fontFamily: workstationVisuals.fontFamily}}>
                {tag}
              </Typography>
            ))}
          </Box>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.65, mt: 0.65, minWidth: 0}}>
          <LabelIcon sx={{fontSize: 14, color: workstationVisuals.textSecondary}} />
          <Box sx={{...workstationSoftBadgeSx, borderRadius: '8px', fontSize: '0.64rem', fontWeight: 600}}>{request.requestId}</Box>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.65, minWidth: 0}}>
          <BuildIcon sx={{fontSize: 14, color: workstationVisuals.textSecondary}} />
          <Typography sx={{fontSize: '0.68rem', color: workstationVisuals.textSecondary, fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap', fontFamily: workstationVisuals.fontFamily}}>
            Request: {request.activityType}
          </Typography>
        </Box>
      </Box>
      <Box className="request-meta" sx={{display: 'grid', gap: 0.55, justifySelf: 'start', justifyItems: 'start', width: '100%', minWidth: 0, pt: 0.25}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.35, minWidth: 0}}>
          <CalendarIcon sx={{fontSize: 14, color: workstationVisuals.textSecondary, flex: '0 0 auto'}} />
          <Typography sx={{fontSize: '0.68rem', color: workstationVisuals.textSecondary, fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap', fontFamily: workstationVisuals.fontFamily}}>
            {request.due}
          </Typography>
          <PriorityBadge priority={request.priority} />
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.35, minWidth: 0}}>
          <LocationIcon sx={{fontSize: 14, color: workstationVisuals.textSecondary, flex: '0 0 auto'}} />
          <Typography sx={{fontSize: '0.68rem', color: workstationVisuals.textSecondary, fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: workstationVisuals.fontFamily}}>
            {request.location}
          </Typography>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.35, minWidth: 0, flexWrap: 'wrap'}}>
          <Typography component="span" sx={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '8px', border: `1px solid ${criticalityColorByLevel[request.equipmentCriticality]}`, bgcolor: tokenCommon.white, color: criticalityColorByLevel[request.equipmentCriticality], fontSize: '0.66rem', fontWeight: 600, lineHeight: 1, flex: '0 0 auto', fontFamily: workstationVisuals.fontFamily}}>
            {request.equipmentCriticality}
          </Typography>
          <Typography sx={{fontSize: '0.68rem', color: workstationVisuals.textSecondary, fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: workstationVisuals.fontFamily}}>
            {request.equipment}
          </Typography>
        </Box>
      </Box>
      <Box className="request-status" sx={{display: 'grid', justifyItems: 'end', gap: 0.55, width: '100%', minWidth: 0}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45, maxWidth: '100%', minWidth: 0}}>
          <ReporterAvatar request={request} />
          <Typography sx={{fontSize: '0.66rem', color: workstationVisuals.textSecondary, fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: workstationVisuals.fontFamily}}>
            {request.reporter}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function WorkOrderRow({
  item,
  onOpen,
  onOpenContextualization,
}: {
  item: WorkOrderBacklogItem;
  onOpen: () => void;
  onOpenContextualization?: (target: WorkstationContextualizationTarget) => void;
}) {
  const isContextualizedEquipment = item.equipment === 'Conveyor CV-210' && Boolean(onOpenContextualization);

  return (
    <Box onClick={onOpen} sx={{position: 'relative', minHeight: 74, bgcolor: 'background.paper', overflow: 'hidden', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(170px, 220px) 104px', alignItems: 'start', gap: 1.25, px: 1.1, py: 1, border: `1px solid ${workstationVisuals.tierBorder}`, borderRadius: '8px', cursor: 'pointer', transition: 'border-color 0.15s ease, background-color 0.15s ease', '&:hover': {borderColor: tokenNeutral.dark, bgcolor: tokenNeutral.lightest}, '@container (max-width: 620px)': {gridTemplateColumns: 'minmax(0, 1fr) auto', '& .work-order-meta': {gridColumn: '1 / -1', gridRow: 2}}, '@container (max-width: 360px)': {gridTemplateColumns: 'minmax(0, 1fr)', '& .work-order-status': {justifySelf: 'start'}}}}>
      <Box sx={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: item.priority === 'High' || item.priority === 'Emergency' ? tokenError.main : tokenWarning.main}} />
      <Box sx={{minWidth: 0, pl: 0.35}}>
        <Box sx={{display: 'flex', alignItems: 'baseline', gap: 0.55, minWidth: 0}}>
          <Typography sx={{fontSize: '0.78rem', color: workstationVisuals.textPrimary, lineHeight: 1.18, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: workstationVisuals.fontFamily}}>
            {item.title}
          </Typography>
          <Box sx={{display: 'flex', gap: 0.35, flex: '0 0 auto'}}>
            {item.tags.map((tag) => (
              <Typography key={tag} component="span" sx={{fontSize: '0.66rem', color: workstationSqdcpTone[tag]?.color ?? tokenNeutral.darkest, lineHeight: 1, fontWeight: 600, fontFamily: workstationVisuals.fontFamily}}>
                {tag}
              </Typography>
            ))}
          </Box>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.65, mt: 0.65, minWidth: 0}}>
          <LabelIcon sx={{fontSize: 14, color: workstationVisuals.textSecondary}} />
          <Box sx={{...workstationSoftBadgeSx, borderRadius: '8px', fontSize: '0.64rem', fontWeight: 600}}>{item.workOrderId}</Box>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.65, minWidth: 0}}>
          <BuildIcon sx={{fontSize: 14, color: workstationVisuals.textSecondary}} />
          <Typography sx={{fontSize: '0.68rem', color: workstationVisuals.textSecondary, fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap', fontFamily: workstationVisuals.fontFamily}}>
            Work Order: {item.type}
          </Typography>
        </Box>
      </Box>
      <Box className="work-order-meta" sx={{display: 'grid', gap: 0.55, justifySelf: 'start', justifyItems: 'start', width: '100%', minWidth: 0, pt: 0.25}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.35, minWidth: 0}}>
          <CalendarIcon sx={{fontSize: 14, color: workstationVisuals.textSecondary, flex: '0 0 auto'}} />
          <Typography sx={{fontSize: '0.68rem', color: workstationVisuals.textSecondary, fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap', fontFamily: workstationVisuals.fontFamily}}>
            {item.due}
          </Typography>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.35, minWidth: 0}}>
          <LocationIcon sx={{fontSize: 14, color: workstationVisuals.textSecondary, flex: '0 0 auto'}} />
          <Typography sx={{fontSize: '0.68rem', color: workstationVisuals.textSecondary, fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: workstationVisuals.fontFamily}}>
            {item.location}
          </Typography>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.35, minWidth: 0, flexWrap: 'wrap'}}>
          <Typography component="span" sx={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '8px', border: `1px solid ${criticalityColorByLevel[item.equipmentCriticality]}`, bgcolor: tokenCommon.white, color: criticalityColorByLevel[item.equipmentCriticality], fontSize: '0.66rem', fontWeight: 600, lineHeight: 1, flex: '0 0 auto', fontFamily: workstationVisuals.fontFamily}}>
            {item.equipmentCriticality}
          </Typography>
          {isContextualizedEquipment ? (
            <Box
              component="button"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpenContextualization?.('conveyor-belt-c4');
              }}
              sx={{
                p: 0,
                border: 0,
                bgcolor: 'transparent',
                color: tokenBrand.main,
                fontFamily: workstationVisuals.fontFamily,
                fontSize: '0.68rem',
                fontWeight: 700,
                lineHeight: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textDecoration: 'underline',
                textDecorationThickness: '1px',
                textUnderlineOffset: '2px',
                cursor: 'pointer',
                '&:hover': {color: tokenBrand.dark},
              }}
            >
              {item.equipment}
            </Box>
          ) : (
            <Typography sx={{fontSize: '0.68rem', color: workstationVisuals.textSecondary, fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: workstationVisuals.fontFamily}}>
              {item.equipment}
            </Typography>
          )}
        </Box>
      </Box>
      <Box className="work-order-status" sx={{display: 'grid', justifyItems: 'end', gap: 0.55, width: '100%'}}>
        <Box sx={{...workstationStatusPillSx('neutral'), justifySelf: 'end', borderRadius: '8px'}}>
          {item.status}
        </Box>
      </Box>
    </Box>
  );
}
