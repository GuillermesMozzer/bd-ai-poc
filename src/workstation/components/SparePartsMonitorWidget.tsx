import {useMemo, useState} from 'react';
import {Box, Button, IconButton, Tooltip, Typography} from '@mui/material';
import {
  BuildOutlined as BuildIcon,
  CalendarTodayOutlined as CalendarIcon,
  LocationOnOutlined as LocationIcon,
  NorthEast as NorthEastIcon,
  SellOutlined as TagIcon,
} from '@mui/icons-material';
import {
  tokenBrand,
  tokenCommon,
  tokenError,
  tokenInfo,
  tokenNeutral,
  tokenSuccess,
  tokenWarning,
  workstationVisuals,
} from '../theme';
import type {WorkstationWidgetProps} from '../types';
import WidgetShell from './WidgetShell';
import {
  sparePartsMonitorNotificationConfig,
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  useWidgetNotifications,
} from './WidgetNotifications';

type MonitorTab = 'Work at Risk' | 'Inventory at Risk';
type StatusTone = 'error' | 'warning' | 'info' | 'neutral';
type CriticalityLevel = 'A' | 'B' | 'C';

const monitorTabs: MonitorTab[] = ['Work at Risk', 'Inventory at Risk'];

const kpis = [
  {value: '7', label: 'Missing Parts Requests', note: 'Unavailable for maintenance', tone: 'error', criticality: 'error'},
  {value: '4', label: 'PMs at Risk', note: 'Due in the next 7 days', tone: 'warning', criticality: 'warning'},
  {value: '9', label: 'Safety Stock Alerts', note: 'Below minimum stock', tone: 'warning', criticality: 'warning'},
  {value: '5', label: 'Reservations Pending', note: 'Not ready for pick-up', tone: 'info'},
] as const;

const workAtRisk = [
  {
    id: 'WO-606034604',
    title: 'Pump seal inspection',
    type: 'PM',
    equipment: 'Packaging Line 1',
    location: 'Autoguard Line 10',
    criticality: 'A',
    date: 'Jun 15',
    dueBadge: 'Due Jun 15',
    missing: 'Bearing BK-204, Seal Kit SK-110',
    status: 'Missing Parts',
    tone: 'error',
  },
  {
    id: 'WO-606034607',
    title: 'Autoclave belt PM',
    type: 'PM',
    equipment: 'Autoclave A01',
    location: 'Sterile Processing',
    criticality: 'B',
    date: 'Jun 17',
    dueBadge: 'Due Jun 17',
    missing: 'Servo Belt SB-100',
    status: 'PO Pending',
    tone: 'warning',
  },
  {
    id: 'WO-606034612',
    title: 'Conveyor drive check',
    type: 'Corrective',
    equipment: 'Conveyor CV-210',
    location: 'Autoguard Line 10',
    criticality: 'B',
    date: 'Jun 14',
    dueBadge: 'Due Jun 14',
    missing: 'V-Belt SPA, Proximity Sensor M12',
    status: 'Partial Available',
    tone: 'info',
  },
  {
    id: 'WO-606034618',
    title: 'Sensor on Z2.C20',
    type: 'PM',
    equipment: 'Filler FL-03',
    location: 'Autoguard Line 10',
    criticality: 'C',
    date: 'Jun 18',
    dueBadge: 'Due Jun 18',
    missing: 'Photo Sensor PS-12',
    status: 'Transfer Requested',
    tone: 'info',
  },
  {
    id: 'WO-606034621',
    title: 'Labeler coupling repair',
    type: 'Corrective',
    equipment: 'Labeler LB-02',
    location: 'Packaging Line 2',
    criticality: 'A',
    date: 'Jun 16',
    dueBadge: 'Due Jun 16',
    missing: 'Drive Coupling DC-40',
    status: 'Reservation Pending',
    tone: 'warning',
  },
] as const;

const impactedWorkOrders = [
  {id: 'WO-606034603', equipment: 'Conveyor CV-210', type: 'Corrective'},
  {id: 'WO-606034604', equipment: 'Packaging Line 1', type: 'PM'},
  {id: 'WO-606034605', equipment: 'Autoclave A01', type: 'PM'},
] as const;

const partsInventoryRisk: ReadonlyArray<{
  readonly part: string;
  readonly description: string;
  readonly impact?: string;
  readonly missing?: string;
  readonly currentStock?: number;
  readonly safetyStock?: number;
  readonly statuses: ReadonlyArray<{readonly label: string; readonly tone: StatusTone}>;
  readonly workOrders?: ReadonlyArray<(typeof impactedWorkOrders)[number]>;
}> = [
  {
    part: 'Bearing BK-204',
    description: 'High-speed flange bearing',
    impact: '3 WOs impacted',
    missing: '5 units missing',
    currentStock: 0,
    safetyStock: 6,
    statuses: [
      {label: 'Out of Stock', tone: 'error'},
      {label: 'PO Pending', tone: 'info'},
    ],
    workOrders: impactedWorkOrders,
  },
  {
    part: 'Servo Belt SB-100',
    description: 'Servo drive timing belt',
    currentStock: 2,
    safetyStock: 5,
    statuses: [{label: 'Below Safety Stock', tone: 'warning'}],
  },
  {
    part: 'Seal Kit SK-110',
    description: 'Pneumatic actuator seal kit',
    impact: '2 WOs waiting',
    missing: '3 units missing',
    currentStock: 1,
    safetyStock: 4,
    statuses: [
      {label: 'PO Pending', tone: 'info'},
      {label: 'Below Safety Stock', tone: 'warning'},
    ],
    workOrders: impactedWorkOrders.slice(1),
  },
  {
    part: 'Proximity Sensor M12',
    description: 'Stainless proximity sensor',
    impact: '1 WO impacted',
    missing: '1 unit missing',
    currentStock: 3,
    safetyStock: 8,
    statuses: [
      {label: 'PO Pending', tone: 'info'},
      {label: 'Below Safety Stock', tone: 'warning'},
    ],
    workOrders: impactedWorkOrders.slice(0, 1),
  },
  {
    part: 'Photo Sensor PS-12',
    description: 'Retroreflective photoelectric sensor',
    impact: '2 WOs impacted',
    missing: '2 units missing',
    statuses: [{label: 'Transfer Requested', tone: 'info'}],
    workOrders: impactedWorkOrders.slice(0, 2),
  },
  {
    part: 'Drive Coupling DC-40',
    description: 'Flexible motor coupling',
    currentStock: 1,
    safetyStock: 3,
    statuses: [{label: 'Reservation Pending', tone: 'warning'}],
  },
];

const criticalityColorByLevel: Record<CriticalityLevel, string> = {
  A: tokenError.dark,
  B: tokenWarning.main,
  C: tokenSuccess.darker,
};

const insetCardSx = {
  border: `1px solid ${workstationVisuals.tierBorder}`,
  borderRadius: '8px',
  bgcolor: 'background.paper',
} as const;

const metaTextSx = {
  fontSize: '0.68rem',
  color: workstationVisuals.textSecondary,
  fontWeight: 500,
  fontFamily: workstationVisuals.fontFamily,
  lineHeight: 1.25,
} as const;

function getToneColor(tone: StatusTone) {
  if (tone === 'error') return tokenError.main;
  if (tone === 'warning') return tokenWarning.main;
  if (tone === 'info') return tokenInfo.main;
  return workstationVisuals.textPrimary;
}

function getToneBg(tone: StatusTone) {
  if (tone === 'error') return tokenError.softBg;
  if (tone === 'warning') return tokenWarning.softBg;
  if (tone === 'info') return tokenInfo.softBg;
  return tokenNeutral.lightest;
}

function getCriticalKpiSx(criticality?: 'error' | 'warning') {
  if (criticality === 'error') {
    return {
      bgcolor: tokenError.softBg,
      border: `1px solid ${tokenError.lighter}`,
      borderRadius: '8px',
    } as const;
  }

  if (criticality === 'warning') {
    return {
      bgcolor: tokenWarning.softBg,
      border: `1px solid ${tokenWarning.lighter}`,
      borderRadius: '8px',
    } as const;
  }

  return {} as const;
}

export default function SparePartsMonitorWidget({className, style, onExpand}: WorkstationWidgetProps) {
  const notifications = useWidgetNotifications(sparePartsMonitorNotificationConfig);
  const [activeTab, setActiveTab] = useState<MonitorTab>('Work at Risk');

  const headerAction = (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
      <WidgetNotificationBell active={notifications.active} onClick={notifications.openDialog} size={24} />
      <IconButton
        size="small"
        aria-label="Open Spare Parts Management"
        onClick={(event) => {
          event.stopPropagation();
          onExpand?.();
        }}
        sx={{width: 24, height: 24, p: 0, color: tokenBrand.main}}
      >
        <NorthEastIcon sx={{fontSize: 18}} />
      </IconButton>
    </Box>
  );

  const content = useMemo(() => (activeTab === 'Inventory at Risk' ? <PartsInventoryRiskList /> : <WorkAtRiskList />), [activeTab]);

  return (
    <>
      <WidgetShell title="Spare Parts Monitor" action={headerAction} className={className} style={style}>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.2, height: '100%', minHeight: 0, p: 0.5, containerType: 'inline-size'}}>
        <Box
          sx={{
            ...insetCardSx,
            p: 1.35,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 1,
            flexShrink: 0,
            '@container (max-width: 700px)': {gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'},
            '@container (max-width: 360px)': {gridTemplateColumns: '1fr'},
          }}
        >
          {kpis.map((kpi, index) => (
            <MetricSummary key={kpi.label} {...kpi} last={index === kpis.length - 1} />
          ))}
        </Box>

        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1, flexShrink: 0}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45, minWidth: 0, overflowX: 'auto'}}>
            {monitorTabs.map((tab) => {
              const selected = tab === activeTab;
              return (
                <Button
                  key={tab}
                  size="small"
                  variant="outlined"
                  onClick={() => setActiveTab(tab)}
                  sx={{
                    height: 26,
                    borderRadius: '8px',
                    px: 1,
                    whiteSpace: 'nowrap',
                    border: `1px solid ${selected ? tokenBrand.lighter : workstationVisuals.tierBorder}`,
                    bgcolor: selected ? tokenBrand.softBg : 'background.paper',
                    color: selected ? tokenBrand.main : workstationVisuals.textSecondary,
                    textTransform: 'none',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    fontFamily: workstationVisuals.fontFamily,
                    '&:hover': {
                      bgcolor: selected ? tokenBrand.softBg : tokenNeutral.lightest,
                      borderColor: selected ? tokenBrand.lighter : tokenNeutral.dark,
                    },
                  }}
                >
                  {tab}
                </Button>
              );
            })}
          </Box>
        </Box>

        <Box sx={{...insetCardSx, p: 1.25, minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column'}}>
          {content}
        </Box>
        </Box>
      </WidgetShell>
      <WidgetNotificationsDialog
        active={notifications.active}
        config={sparePartsMonitorNotificationConfig}
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

function MetricSummary({
  label,
  last,
  note,
  tone,
  value,
  criticality,
}: {
  criticality?: 'error' | 'warning';
  label: string;
  last: boolean;
  note: string;
  tone: StatusTone;
  value: string;
}) {
  return (
    <Box
      sx={{
        minWidth: 0,
        p: 0.35,
        pl: 0.8,
        borderRight: last ? 'none' : `1px solid ${workstationVisuals.tierBorder}`,
        ...getCriticalKpiSx(criticality),
        '@container (max-width: 860px)': {borderRight: 'none'},
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'baseline', gap: 0.8, minWidth: 0}}>
        <Typography sx={{fontSize: '1.22rem', color: getToneColor(tone), fontWeight: 600, lineHeight: 1, fontFamily: workstationVisuals.fontFamily, flexShrink: 0}}>
          {value}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.72rem',
            color: workstationVisuals.textPrimary,
            fontWeight: 500,
            lineHeight: 1.2,
            fontFamily: workstationVisuals.fontFamily,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {label}
        </Typography>
      </Box>
      <Typography sx={{...metaTextSx, mt: 0.45}} noWrap>
        {note}
      </Typography>
    </Box>
  );
}

function StatusBadge({label, tone}: {label: string; tone: StatusTone}) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 21,
        px: 0.75,
        borderRadius: '8px',
        bgcolor: getToneBg(tone),
        color: getToneColor(tone),
        border: `1px solid color-mix(in srgb, ${getToneColor(tone)} 20%, transparent)`,
        fontSize: '0.62rem',
        fontWeight: 700,
        fontFamily: workstationVisuals.fontFamily,
        lineHeight: 1.15,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Box>
  );
}

function CriticalityChip({level}: {level: CriticalityLevel}) {
  return (
    <Typography
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 18,
        height: 18,
        borderRadius: '8px',
        border: `1px solid ${criticalityColorByLevel[level]}`,
        bgcolor: tokenCommon.white,
        color: criticalityColorByLevel[level],
        fontSize: '0.66rem',
        fontWeight: 600,
        lineHeight: 1,
        flex: '0 0 auto',
        fontFamily: workstationVisuals.fontFamily,
      }}
    >
      {level}
    </Typography>
  );
}

function WorkAtRiskList() {
  return (
    <Box sx={{display: 'grid', gap: 0.75, minHeight: 0, overflow: 'auto', pr: 0.3}}>
      {workAtRisk.map((item) => (
        <Box
          key={item.id}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'minmax(230px, 1.1fr) minmax(190px, 0.9fr) auto',
            gap: 1.2,
            alignItems: 'stretch',
            minWidth: 680,
            minHeight: 72,
            px: 1.15,
            py: 0.75,
            position: 'relative',
            border: `1px solid ${workstationVisuals.tierBorder}`,
            borderRadius: '8px',
            bgcolor: 'background.paper',
            overflow: 'hidden',
            '&:before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 3,
              bgcolor: getToneColor(item.tone as StatusTone),
            },
            '@container (max-width: 760px)': {
              gridTemplateColumns: 'minmax(0, 1fr)',
              minWidth: 0,
            },
          }}
        >
          <Box sx={{display: 'grid', alignContent: 'space-between', gap: 0.55, minWidth: 0}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45, minWidth: 0}}>
              <Typography sx={{fontSize: '0.78rem', color: workstationVisuals.textPrimary, fontWeight: 800, lineHeight: 1.15, fontFamily: workstationVisuals.fontFamily}} noWrap>
                {item.title}
              </Typography>
              <Typography sx={{fontSize: '0.58rem', color: tokenWarning.main, fontWeight: 800, lineHeight: 1, fontFamily: workstationVisuals.fontFamily}}>
                D
              </Typography>
              <Typography sx={{fontSize: '0.58rem', color: tokenInfo.main, fontWeight: 800, lineHeight: 1, fontFamily: workstationVisuals.fontFamily}}>
                Q
              </Typography>
              <Typography sx={{fontSize: '0.58rem', color: tokenSuccess.darker, fontWeight: 800, lineHeight: 1, fontFamily: workstationVisuals.fontFamily}}>
                S
              </Typography>
            </Box>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55, minWidth: 0}}>
              <TagIcon sx={{fontSize: 14, color: workstationVisuals.textSecondary, flex: '0 0 auto'}} />
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: 22,
                  px: 0.85,
                  borderRadius: '8px',
                  border: `1px solid ${tokenBrand.lighter}`,
                  bgcolor: tokenBrand.softBg,
                  color: tokenBrand.main,
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  fontFamily: workstationVisuals.fontFamily,
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {item.id}
              </Box>
            </Box>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45, minWidth: 0}}>
              <BuildIcon sx={{fontSize: 14, color: workstationVisuals.textSecondary, flex: '0 0 auto'}} />
              <Typography sx={metaTextSx} noWrap>
                {item.type}
              </Typography>
            </Box>
          </Box>

          <Box sx={{display: 'grid', alignContent: 'center', gap: 0.45, minWidth: 0}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45, minWidth: 0}}>
              <CalendarIcon sx={{fontSize: 14, color: workstationVisuals.textSecondary, flex: '0 0 auto'}} />
              <Typography sx={{...metaTextSx, color: workstationVisuals.textPrimary}} noWrap>
                {item.date}
              </Typography>
              <StatusBadge label={item.dueBadge} tone={item.tone as StatusTone} />
            </Box>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45, minWidth: 0}}>
              <LocationIcon sx={{fontSize: 14, color: workstationVisuals.textSecondary, flex: '0 0 auto'}} />
              <Typography sx={metaTextSx} noWrap>
                {item.location}
              </Typography>
            </Box>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45, minWidth: 0}}>
              <BuildIcon sx={{fontSize: 14, color: workstationVisuals.textSecondary, flex: '0 0 auto'}} />
              <CriticalityChip level={item.criticality} />
              <Typography sx={metaTextSx} noWrap>
                {item.equipment}
              </Typography>
            </Box>
          </Box>

          <Box sx={{display: 'grid', alignContent: 'center', justifyItems: 'end', gap: 0.55, minWidth: 116}}>
            <StatusBadge label={item.status} tone={item.tone as StatusTone} />
            <StatusBadge label="Scheduled" tone="neutral" />
            <Typography sx={{...metaTextSx, maxWidth: 140, textAlign: 'right'}} noWrap>
              {item.missing}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function PartsInventoryRiskList() {
  return (
    <Box sx={{display: 'grid', minHeight: 0, overflow: 'auto'}}>
      {partsInventoryRisk.map((item, index) => (
        <Box
          key={item.part}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'minmax(150px, 1fr) 120px 104px 96px 96px 172px',
            gap: 1,
            alignItems: 'center',
            minWidth: 780,
            py: 0.78,
            borderBottom: index === partsInventoryRisk.length - 1 ? 'none' : `1px solid ${workstationVisuals.tierBorder}`,
            '@container (max-width: 650px)': {
              gridTemplateColumns: 'minmax(0, 1fr) auto',
              minWidth: 0,
            },
          }}
        >
          <RowIdentity title={item.part} detail={item.description} />
          <ImpactValue item={item} />
          <Typography sx={metaTextSx} noWrap>
            {item.missing ?? ''}
          </Typography>
          {typeof item.currentStock === 'number' && typeof item.safetyStock === 'number' ? (
            <>
              <StockValue label="Current Stock" value={item.currentStock} alert={item.currentStock < item.safetyStock} />
              <StockValue label="Safety Stock" value={item.safetyStock} />
            </>
          ) : (
            <>
              <Box />
              <Box />
            </>
          )}
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45, minWidth: 0, flexWrap: 'wrap'}}>
            {item.statuses.map((status) => (
              <StatusBadge key={status.label} label={status.label} tone={status.tone} />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function ImpactValue({item}: {item: (typeof partsInventoryRisk)[number]}) {
  if (!item.impact || !item.workOrders?.length) return <Box />;

  return (
    <Tooltip
      arrow
      title={
        <Box sx={{display: 'grid', gap: 0.45}}>
          {item.workOrders.map((wo) => (
            <Typography key={wo.id} sx={{fontSize: '0.68rem', fontWeight: 600, fontFamily: workstationVisuals.fontFamily}}>
              {wo.id} | {wo.equipment} | {wo.type}
            </Typography>
          ))}
        </Box>
      }
    >
      <Typography
        sx={{
          fontSize: '0.76rem',
          color: workstationVisuals.textPrimary,
          fontWeight: 800,
          fontFamily: workstationVisuals.fontFamily,
          textDecoration: 'underline',
          textDecorationStyle: 'dotted',
          textUnderlineOffset: '3px',
          cursor: 'help',
          whiteSpace: 'nowrap',
        }}
      >
        {item.impact}
      </Typography>
    </Tooltip>
  );
}

function RowIdentity({detail, title}: {detail: string; title: string}) {
  return (
    <Box sx={{minWidth: 0}}>
      <Typography sx={{fontSize: '0.8rem', color: workstationVisuals.textPrimary, fontWeight: 800, lineHeight: 1.18, fontFamily: workstationVisuals.fontFamily}} noWrap>
        {title}
      </Typography>
      <Typography sx={{...metaTextSx, mt: 0.25}} noWrap>
        {detail}
      </Typography>
    </Box>
  );
}

function StockValue({alert = false, label, value}: {alert?: boolean; label: string; value: number}) {
  return (
    <Box sx={{minWidth: 0}}>
      <Typography sx={{fontSize: '0.68rem', color: workstationVisuals.textSecondary, fontWeight: 600, fontFamily: workstationVisuals.fontFamily}} noWrap>
        {label}
      </Typography>
      <Typography sx={{fontSize: '0.82rem', color: alert ? tokenWarning.main : workstationVisuals.textPrimary, fontWeight: 800, fontFamily: workstationVisuals.fontFamily, lineHeight: 1.15}}>
        {value}
      </Typography>
    </Box>
  );
}
