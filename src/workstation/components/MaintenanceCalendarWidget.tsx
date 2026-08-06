import {useMemo, useState} from 'react';
import type {CSSProperties} from 'react';
import {Box, Button, IconButton, Menu, MenuItem, Tooltip, Typography} from '@mui/material';
import {
  ArrowBackIosNew as ArrowBackIcon,
  ArrowForwardIos as ArrowForwardIcon,
  BuildOutlined as CorrectiveIcon,
  CalendarMonth as CalendarMonthIcon,
  ExpandMore as ExpandMoreIcon,
  HandymanOutlined as PreventiveIcon,
  NorthEast as NorthEastIcon,
  SwapHoriz as ChangeoverIcon,
} from '@mui/icons-material';
import {
  tokenBrand,
  tokenCommon,
  tokenNeutral,
  tokenSuccess,
  workstationVisuals,
} from '../theme';
import {
  MaintenanceMonthAggregateDetailsDialog,
  type MaintenanceMonthAggregateDialogState,
  type MaintenanceMonthPlanItem,
  type MaintenanceMonthWorkOrderItem,
} from '../../Maintenance/components/MaintenanceMonthAggregateDetailsDialog';
import type {WorkstationWidgetProps} from '../types';
import WidgetShell from './WidgetShell';
import {
  maintenanceCalendarNotificationConfig,
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  useWidgetNotifications,
} from './WidgetNotifications';

type CalendarViewMode = 'week' | 'month';
type CalendarScope = 'all' | 'mine';
type WorkloadType = 'Preventive' | 'Corrective' | 'Maintenance Plan';
type EventType = WorkloadType | 'Shutdown' | 'Changeover';

type CalendarEvent = {
  id: string;
  date: number;
  type: EventType;
  title: string;
  time?: string;
  workOrders?: MaintenanceMonthWorkOrderItem[];
  plans?: MaintenanceMonthPlanItem[];
  assignedTo?: string[];
};

type MaintenanceCalendarWidgetProps = WorkstationWidgetProps & {
  className?: string;
  currentUserName?: string;
  style?: CSSProperties;
};

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const maintenanceCalendarEvents: CalendarEvent[] = [
  {id: 'pm-01', date: 1, type: 'Preventive', title: 'Hydraulic Press #2', assignedTo: ['Emily Watson'], workOrders: [{woCode: 'PM-WO-2026-301', category: 'Preventive', equipment: 'Hydraulic Press #2', location: 'Assembly / Line 1', scheduledDate: 'May 01, 2026', duration: '2h', assignedTechnician: 'Emily Watson', priority: 'Medium'}]},
  {id: 'cm-01', date: 1, type: 'Corrective', title: 'Cooling Tower CT-44', assignedTo: ['David Kim'], workOrders: [{woCode: 'CM-WO-2026-341', category: 'Corrective', equipment: 'Cooling Tower CT-44', location: 'Utilities', scheduledDate: 'May 01, 2026', duration: '1h 30min', assignedTechnician: 'David Kim', priority: 'High'}]},
  {id: 'pm-04', date: 4, type: 'Preventive', title: 'Conveyor and filler PMs', assignedTo: ['Carlos Rodriguez', 'Priya Patel'], workOrders: [{woCode: 'PM-WO-2026-302', category: 'Preventive', equipment: 'Conveyor CV-101', location: 'Packaging / Line 3', scheduledDate: 'May 04, 2026', duration: '1h', assignedTechnician: 'Carlos Rodriguez', priority: 'Low'}, {woCode: 'PM-WO-2026-303', category: 'Preventive', equipment: 'Filler F-230', location: 'Packaging / Line 3', scheduledDate: 'May 04, 2026', duration: '45min', assignedTechnician: 'Priya Patel', priority: 'Medium'}]},
  {id: 'cm-04', date: 4, type: 'Corrective', title: 'Operator inspection', assignedTo: ['Lucas Almeida'], workOrders: [{woCode: 'AM-WO-2026-351', category: 'Autonomous Maintenance', equipment: 'Assembly A-201', location: 'Assembly / Zone 1', scheduledDate: 'May 04, 2026', duration: '30min', assignedTechnician: 'Lucas Almeida', priority: 'Medium'}]},
  {id: 'cm-06', date: 6, type: 'Corrective', title: 'Extrusion Machine', assignedTo: ['Ana Martins'], workOrders: [{woCode: 'CM-WO-2026-342', category: 'Corrective', equipment: 'Extrusion Machine', location: 'Line 1 / Zone 2', scheduledDate: 'May 06, 2026', duration: '3h', assignedTechnician: 'Ana Martins', priority: 'High'}]},
  {id: 'pm-08', date: 8, type: 'Preventive', title: 'Boiler Feed Pump', assignedTo: ['Emily Watson'], workOrders: [{woCode: 'PM-WO-2026-304', category: 'Preventive', equipment: 'Boiler Feed Pump', location: 'Utilities', scheduledDate: 'May 08, 2026', duration: '2h', assignedTechnician: 'Emily Watson', priority: 'High'}]},
  {id: 'cm-08', date: 8, type: 'Corrective', title: 'Labeler LB-210', assignedTo: ['Carlos Rodriguez'], workOrders: [{woCode: 'CM-WO-2026-343', category: 'Corrective', equipment: 'Labeler LB-210', location: 'Packaging / Line 4', scheduledDate: 'May 08, 2026', duration: '1h', assignedTechnician: 'Carlos Rodriguez', priority: 'Medium'}]},
  {id: 'pm-12', date: 12, type: 'Preventive', title: 'Compressor and robot PMs', assignedTo: ['Ana Martins', 'David Kim'], workOrders: [{woCode: 'PM-WO-2026-305', category: 'Preventive', equipment: 'Compressor CP-07', location: 'Utilities', scheduledDate: 'May 12, 2026', duration: '1h 30min', assignedTechnician: 'Ana Martins', priority: 'Low'}, {woCode: 'PM-WO-2026-306', category: 'Preventive', equipment: 'Robot Arm RB-405', location: 'Assembly / Line 2', scheduledDate: 'May 12, 2026', duration: '2h', assignedTechnician: 'David Kim', priority: 'Medium'}]},
  {id: 'cm-12', date: 12, type: 'Corrective', title: 'Valve Bank V-220', assignedTo: ['Priya Patel'], workOrders: [{woCode: 'CM-WO-2026-344', category: 'Corrective', equipment: 'Valve Bank V-220', location: 'Assembly / Zone 1', scheduledDate: 'May 12, 2026', duration: '1h', assignedTechnician: 'Priya Patel', priority: 'High'}]},
  {id: 'cm-15', date: 15, type: 'Corrective', title: 'Operator inspection', assignedTo: ['Marina Costa'], workOrders: [{woCode: 'AM-WO-2026-352', category: 'Autonomous Maintenance', equipment: 'Molding M-301', location: 'Assembly / Line 2', scheduledDate: 'May 15, 2026', duration: '45min', assignedTechnician: 'Marina Costa', priority: 'Medium'}]},
  {id: 'pm-19', date: 19, type: 'Preventive', title: 'Dust Collector DC-16', assignedTo: ['Emily Watson'], workOrders: [{woCode: 'PM-WO-2026-307', category: 'Preventive', equipment: 'Dust Collector DC-16', location: 'Utilities', scheduledDate: 'May 19, 2026', duration: '1h', assignedTechnician: 'Emily Watson', priority: 'Medium'}]},
  {id: 'cm-19', date: 19, type: 'Corrective', title: 'Dryer and palletizer', assignedTo: ['David Kim', 'Carlos Rodriguez'], workOrders: [{woCode: 'CM-WO-2026-345', category: 'Corrective', equipment: 'Dryer DR-77', location: 'Line 2 / Zone 1', scheduledDate: 'May 19, 2026', duration: '2h', assignedTechnician: 'David Kim', priority: 'High'}, {woCode: 'CM-WO-2026-346', category: 'Corrective', equipment: 'Palletizer PL-09', location: 'Packaging', scheduledDate: 'May 19, 2026', duration: '1h 15min', assignedTechnician: 'Carlos Rodriguez', priority: 'Medium'}]},
  {id: 'pm-22', date: 22, type: 'Preventive', title: 'Chiller CH-08', assignedTo: ['Ana Martins'], workOrders: [{woCode: 'PM-WO-2026-308', category: 'Preventive', equipment: 'Chiller CH-08', location: 'Utilities', scheduledDate: 'May 22, 2026', duration: '2h', assignedTechnician: 'Ana Martins', priority: 'Low'}]},
  {id: 'plan-25', date: 25, type: 'Maintenance Plan', title: 'Quarterly inspection route', assignedTo: ['Sarah Chen', 'Carlos Rodriguez'], plans: [{planName: 'Quarterly Inspection - CV 101', equipment: 'Conveyor CV-101', frequency: 'Quarterly', nextScheduledDate: 'May 25, 2026', responsible: 'Sarah Chen'}, {planName: 'Lubrication Route - Line 1', equipment: 'Assembly A-201', frequency: 'Monthly', nextScheduledDate: 'May 25, 2026', responsible: 'Carlos Rodriguez'}]},
  {id: 'pm-26', date: 26, type: 'Preventive', title: 'Mixer MX-33', assignedTo: ['Bruno Arruda'], workOrders: [{woCode: 'PM-WO-2026-309', category: 'Preventive', equipment: 'Mixer MX-33', location: 'Line 2 / Zone 1', scheduledDate: 'May 26, 2026', duration: '1h', assignedTechnician: 'Bruno Arruda', priority: 'Medium'}]},
  {id: 'cm-26', date: 26, type: 'Corrective', title: 'Capper and washer', assignedTo: ['Carlos Rodriguez', 'Rafael Souza'], workOrders: [{woCode: 'CM-WO-2026-347', category: 'Corrective', equipment: 'Capper CP-30', location: 'Packaging / Line 4', scheduledDate: 'May 26, 2026', duration: '1h 45min', assignedTechnician: 'Carlos Rodriguez', priority: 'High'}, {woCode: 'AM-WO-2026-353', category: 'Autonomous Maintenance', equipment: 'Washer WS-11', location: 'Line 2', scheduledDate: 'May 26, 2026', duration: '30min', assignedTechnician: 'Rafael Souza', priority: 'Low'}]},
  {id: 'change-26', date: 26, type: 'Changeover', title: 'Compressor Room Overhaul', time: '19:00 - 23:00', assignedTo: ['Bruno Arruda']},
  {id: 'plan-27', date: 27, type: 'Maintenance Plan', title: 'Boiler Feed Pump Inspection', assignedTo: ['Emily Watson'], plans: [{planName: 'Boiler Feed Pump Inspection', equipment: 'Boiler Feed Pump', frequency: 'Annual', nextScheduledDate: 'May 27, 2026', responsible: 'Emily Watson'}]},
  {id: 'change-27', date: 27, type: 'Changeover', title: 'Molding Bay Tool Swap', time: '10:00 - 12:00'},
  {id: 'pm-28', date: 28, type: 'Preventive', title: 'Heat Exchanger HX-14', assignedTo: ['Emily Watson'], workOrders: [{woCode: 'PM-WO-2026-310', category: 'Preventive', equipment: 'Heat Exchanger HX-14', location: 'Utilities', scheduledDate: 'May 28, 2026', duration: '2h 30min', assignedTechnician: 'Emily Watson', priority: 'High'}]},
  {id: 'cm-28', date: 28, type: 'Corrective', title: 'Sensor Array S-101', assignedTo: ['David Kim'], workOrders: [{woCode: 'CM-WO-2026-348', category: 'Corrective', equipment: 'Sensor Array S-101', location: 'Assembly / Line 1', scheduledDate: 'May 28, 2026', duration: '1h', assignedTechnician: 'David Kim', priority: 'Medium'}]},
  {id: 'shutdown-29', date: 29, type: 'Shutdown', title: 'Labor Day shutdown'},
  {id: 'plan-29', date: 29, type: 'Maintenance Plan', title: 'Packaging calibration route', assignedTo: ['Ana Martins', 'David Kim'], plans: [{planName: 'Packaging Robot Calibration', equipment: 'Packaging Robot PK-404', frequency: 'Biweekly', nextScheduledDate: 'May 29, 2026', responsible: 'Ana Martins'}, {planName: 'Utilities Safety Review', equipment: 'Compressor CP-07', frequency: 'Monthly', nextScheduledDate: 'May 29, 2026', responsible: 'David Kim'}]},
];

const filterButtonSx = {
  height: 26,
  borderRadius: '8px',
  px: 1.25,
  border: '1px solid rgba(15, 23, 42, 0.08)',
  color: 'rgba(15, 23, 42, 0.7)',
  bgcolor: tokenCommon.white,
  textTransform: 'none',
  fontSize: '0.72rem',
  fontWeight: 500,
  fontFamily: workstationVisuals.fontFamily,
  transition: 'all 0.15s ease',
  '&:hover': {
    bgcolor: tokenNeutral.lightest,
    borderColor: 'rgba(15, 23, 42, 0.16)',
  },
} as const;

const sectionTextSx = {
  fontSize: '0.72rem',
  color: workstationVisuals.textPrimary,
  fontWeight: 700,
  fontFamily: workstationVisuals.fontFamily,
  lineHeight: 1.15,
} as const;

const metaTextSx = {
  fontSize: '0.62rem',
  color: workstationVisuals.textSecondary,
  fontWeight: 500,
  fontFamily: workstationVisuals.fontFamily,
  lineHeight: 1.2,
} as const;

function getEventTone(type: EventType) {
  if (type === 'Preventive' || type === 'Maintenance Plan') {
    return {bg: tokenBrand.softBg, border: tokenBrand.lightest, color: tokenBrand.main, Icon: type === 'Preventive' ? PreventiveIcon : CalendarMonthIcon};
  }
  if (type === 'Corrective') {
    return {bg: tokenSuccess.softBg, border: tokenSuccess.lightest, color: tokenSuccess.darker, Icon: CorrectiveIcon};
  }
  if (type === 'Changeover') {
    return {bg: tokenNeutral.lighter, border: tokenNeutral.darker, color: workstationVisuals.textPrimary, Icon: ChangeoverIcon};
  }
  return {bg: tokenNeutral.lightest, border: tokenNeutral.dark, color: workstationVisuals.textSecondary, Icon: CalendarMonthIcon};
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function addDays(date: Date, amount: number) {
  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + amount);
  return nextDate;
}

function getWeekStart(date: Date) {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  return start;
}

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function getEventsForDate(date: Date, scope: CalendarScope, currentUserName?: string) {
  const events = maintenanceCalendarEvents.filter((event) => event.date === date.getDate());

  if (scope === 'all' || !currentUserName) {
    return events;
  }

  return events.filter((event) => event.assignedTo?.includes(currentUserName));
}

function buildMonthCells(referenceDate: Date, scope: CalendarScope, currentUserName?: string) {
  const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());

  return Array.from({length: 42}, (_, index) => {
    const date = addDays(gridStart, index);
    return {
      date,
      key: getDateKey(date),
      isCurrentMonth: date.getMonth() === referenceDate.getMonth(),
      events: getEventsForDate(date, scope, currentUserName),
    };
  });
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString('en-US', {month: 'long', year: 'numeric'});
}

function formatWeekLabel(weekStart: Date) {
  return `Week of ${weekStart.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}`;
}

function buildAggregateSelection(event: CalendarEvent): MaintenanceMonthAggregateDialogState | null {
  if (event.type === 'Preventive' || event.type === 'Corrective') {
    const workOrders = event.workOrders ?? [];
    return {
      dateKey: `2026-05-${`${event.date}`.padStart(2, '0')}`,
      dayLabel: `${event.date}`.padStart(2, '0'),
      aggregate: {category: event.type, count: workOrders.length, workOrders, plans: []},
    };
  }

  if (event.type === 'Maintenance Plan') {
    const plans = event.plans ?? [];
    return {
      dateKey: `2026-05-${`${event.date}`.padStart(2, '0')}`,
      dayLabel: `${event.date}`.padStart(2, '0'),
      aggregate: {category: 'Maintenance Plan', count: plans.length, workOrders: [], plans},
    };
  }

  return null;
}

export default function MaintenanceCalendarWidget({className, currentUserName, style, onExpand}: MaintenanceCalendarWidgetProps) {
  const notifications = useWidgetNotifications(maintenanceCalendarNotificationConfig);
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [scope, setScope] = useState<CalendarScope>('all');
  const [scopeAnchor, setScopeAnchor] = useState<null | HTMLElement>(null);
  const [referenceDate, setReferenceDate] = useState(() => new Date(2026, 4, 26));
  const [selectedAggregate, setSelectedAggregate] = useState<MaintenanceMonthAggregateDialogState | null>(null);

  const monthCells = useMemo(() => buildMonthCells(referenceDate, scope, currentUserName), [currentUserName, referenceDate, scope]);
  const weekStart = useMemo(() => getWeekStart(referenceDate), [referenceDate]);
  const weekDays = useMemo(() => Array.from({length: 7}, (_, index) => addDays(weekStart, index)), [weekStart]);

  const openCalendar = () => {
    onExpand?.();
  };

  const movePeriod = (direction: -1 | 1) => {
    setReferenceDate((currentDate) => (viewMode === 'month' ? addMonths(currentDate, direction) : addDays(currentDate, direction * 7)));
  };

  const headerAction = (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
      <Button
        size="small"
        endIcon={<ExpandMoreIcon />}
        onClick={(event) => {
          event.stopPropagation();
          setScopeAnchor(event.currentTarget);
        }}
        sx={{
          ...filterButtonSx,
          minWidth: 92,
          '& .MuiButton-endIcon': {ml: 0.15, '& svg': {fontSize: 14}},
        }}
      >
        {scope === 'mine' ? 'My Schedule' : 'All Schedule'}
      </Button>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.35}}>
        {(['week', 'month'] as const).map((mode) => (
          <Button
            key={mode}
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              setViewMode(mode);
            }}
            sx={{
              ...filterButtonSx,
              minWidth: 52,
              bgcolor: viewMode === mode ? tokenBrand.softBg : tokenCommon.white,
              borderColor: viewMode === mode ? tokenBrand.lightest : 'rgba(15, 23, 42, 0.08)',
              color: viewMode === mode ? tokenBrand.main : 'rgba(15, 23, 42, 0.7)',
            }}
          >
            {mode === 'week' ? 'Week' : 'Month'}
          </Button>
        ))}
      </Box>
      <WidgetNotificationBell active={notifications.active} onClick={notifications.openDialog} size={24} />
      <IconButton
        size="small"
        aria-label="Open Maintenance Calendar"
        onClick={(event) => {
          event.stopPropagation();
          openCalendar();
        }}
        sx={{width: 24, height: 24, p: 0, color: tokenBrand.main}}
      >
        <NorthEastIcon sx={{fontSize: 18}} />
      </IconButton>
    </Box>
  );

  return (
    <>
      <WidgetShell title="Maintenance Calendar" action={headerAction} className={className} style={style}>
        <Box sx={{display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: 1, containerType: 'inline-size'}}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '26px minmax(0, 1fr) 26px',
            alignItems: 'center',
            gap: 0.8,
            flexShrink: 0,
          }}
        >
          <IconButton size="small" aria-label="Previous period" onClick={() => movePeriod(-1)} sx={{width: 26, height: 26, borderRadius: '8px', color: workstationVisuals.textSecondary}}>
            <ArrowBackIcon sx={{fontSize: 14}} />
          </IconButton>
          <Typography sx={{...sectionTextSx, textAlign: 'center'}} noWrap>
            {viewMode === 'month' ? formatMonthLabel(referenceDate) : formatWeekLabel(weekStart)}
          </Typography>
          <IconButton size="small" aria-label="Next period" onClick={() => movePeriod(1)} sx={{width: 26, height: 26, borderRadius: '8px', color: workstationVisuals.textSecondary}}>
            <ArrowForwardIcon sx={{fontSize: 14}} />
          </IconButton>
        </Box>

        {viewMode === 'month' ? (
          <MonthView cells={monthCells} onSelectAggregate={setSelectedAggregate} />
        ) : (
          <WeekView currentUserName={currentUserName} days={weekDays} scope={scope} onOpenCalendar={openCalendar} />
        )}
        </Box>
        <Menu anchorEl={scopeAnchor} open={Boolean(scopeAnchor)} onClose={() => setScopeAnchor(null)}>
          <MenuItem onClick={() => { setScope('all'); setScopeAnchor(null); }}>All Schedule</MenuItem>
          <MenuItem onClick={() => { setScope('mine'); setScopeAnchor(null); }}>My Schedule</MenuItem>
        </Menu>
        <MaintenanceMonthAggregateDetailsDialog selection={selectedAggregate} onClose={() => setSelectedAggregate(null)} />
      </WidgetShell>
      <WidgetNotificationsDialog
        active={notifications.active}
        config={maintenanceCalendarNotificationConfig}
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

function MonthView({cells, onSelectAggregate}: {cells: ReturnType<typeof buildMonthCells>; onSelectAggregate: (selection: MaintenanceMonthAggregateDialogState) => void}) {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1}}>
      <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', flexShrink: 0, borderBottom: `1px solid ${workstationVisuals.tierBorder}`}}>
        {weekdayLabels.map((day) => (
          <Typography key={day} sx={{...metaTextSx, py: 0.45, textAlign: 'center', fontWeight: 700}}>
            {day}
          </Typography>
        ))}
      </Box>
      <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gridTemplateRows: 'repeat(6, minmax(34px, 1fr))', minHeight: 0, flex: 1}}>
        {cells.map((cell) => (
          <Box
            key={cell.key}
            sx={{
              minWidth: 0,
              minHeight: 0,
              p: 0.45,
              borderRight: `1px solid ${workstationVisuals.tierBorder}`,
              borderBottom: `1px solid ${workstationVisuals.tierBorder}`,
              bgcolor: cell.isCurrentMonth ? tokenCommon.white : tokenNeutral.lightest,
              overflow: 'hidden',
            }}
          >
            <Typography sx={{fontSize: '0.68rem', color: cell.isCurrentMonth ? tokenBrand.main : workstationVisuals.textMuted, fontWeight: 800, lineHeight: 1}}>
              {`${cell.date.getDate()}`.padStart(2, '0')}
            </Typography>
            <Box sx={{display: 'grid', gap: 0.35, mt: 0.45}}>
              {cell.events.slice(0, 2).map((event) => (
                <CalendarChip key={event.id} event={event} compact onSelectAggregate={onSelectAggregate} />
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function WeekView({
  currentUserName,
  days,
  onOpenCalendar,
  scope,
}: {
  currentUserName?: string;
  days: Date[];
  onOpenCalendar: () => void;
  scope: CalendarScope;
}) {
  return (
    <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 0.75, minHeight: 0, flex: 1, '@container (max-width: 620px)': {gridTemplateColumns: '1fr', overflow: 'auto'}}}>
      {days.map((day) => {
        const events = getEventsForDate(day, scope, currentUserName);
        return (
          <Box key={getDateKey(day)} sx={{minWidth: 0, minHeight: 0, border: `1px solid ${workstationVisuals.tierBorder}`, borderRadius: '8px', p: 0.75, bgcolor: tokenCommon.white, overflow: 'hidden'}}>
            <Box sx={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 0.5, mb: 0.7}}>
              <Typography sx={sectionTextSx}>{weekdayLabels[day.getDay()]}</Typography>
              <Typography sx={{...metaTextSx, fontWeight: 800, color: tokenBrand.main}}>
                {`${day.getDate()}`.padStart(2, '0')}
              </Typography>
            </Box>
            <Box sx={{display: 'grid', gap: 0.5}}>
              {events.length ? (
                events.slice(0, 4).map((event) => <CalendarChip key={event.id} event={event} onOpenCalendar={onOpenCalendar} />)
              ) : (
                <Typography sx={{...metaTextSx, color: workstationVisuals.textMuted}}>No scheduled work</Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

function CalendarChip({
  compact = false,
  event,
  onOpenCalendar,
  onSelectAggregate,
}: {
  compact?: boolean;
  event: CalendarEvent;
  onOpenCalendar?: () => void;
  onSelectAggregate?: (selection: MaintenanceMonthAggregateDialogState) => void;
}) {
  const tone = getEventTone(event.type);
  const Icon = tone.Icon;
  const isWorkload = event.type === 'Preventive' || event.type === 'Corrective';
  const count = event.type === 'Maintenance Plan' ? event.plans?.length ?? 0 : event.workOrders?.length ?? 0;
  const label = isWorkload ? `${event.type} - ${count} WO` : event.type === 'Maintenance Plan' ? `${event.type} - ${count} Plans` : event.type;
  const canOpenDetails = isWorkload || event.type === 'Maintenance Plan';

  return (
    <Box
      component="button"
      type="button"
      onClick={(clickEvent) => {
        clickEvent.stopPropagation();
        if (onSelectAggregate && canOpenDetails) {
          const nextSelection = buildAggregateSelection(event);

          if (nextSelection) {
            onSelectAggregate(nextSelection);
          }
          return;
        }

        if (canOpenDetails) {
          onOpenCalendar?.();
        }
      }}
      sx={{
        minWidth: 0,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 0.35,
        border: `1px solid ${tone.border}`,
        borderRadius: '8px',
        bgcolor: tone.bg,
        color: tone.color,
        px: 0.55,
        py: compact ? 0.2 : 0.35,
        cursor: canOpenDetails ? 'pointer' : 'default',
        font: 'inherit',
        textAlign: 'left',
        overflow: 'hidden',
      }}
    >
      <Icon sx={{fontSize: compact ? 11 : 13, flexShrink: 0, color: tone.color}} />
      <Typography sx={{fontSize: compact ? '0.58rem' : '0.64rem', fontWeight: 800, lineHeight: 1, color: tone.color, fontFamily: workstationVisuals.fontFamily}} noWrap>
        {label}
      </Typography>
      {event.time ? (
        <Typography sx={{ml: 'auto', fontSize: '0.56rem', color: workstationVisuals.textSecondary, fontWeight: 700, lineHeight: 1}} noWrap>
          {event.time}
        </Typography>
      ) : null}
      {!compact && event.workOrders?.[0]?.woCode ? (
        <Typography sx={{ml: 'auto', fontSize: '0.56rem', color: workstationVisuals.textSecondary, fontWeight: 700, lineHeight: 1}} noWrap>
          {event.workOrders[0].woCode}
        </Typography>
      ) : null}
    </Box>
  );
}
