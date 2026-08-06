import {Box, IconButton, Typography} from '@mui/material';
import {NorthEast as NorthEastIcon} from '@mui/icons-material';
import {
  tokenBrand,
  tokenCommon,
  tokenError,
  tokenInfo,
  tokenNeutral,
  tokenSuccess,
  tokenWarning,
  workstationStatusPillSx,
  workstationVisuals,
} from '../theme';
import type {WorkstationWidgetProps} from '../types';
import WidgetShell from './WidgetShell';
import {
  maintenancePlannerNotificationConfig,
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  useWidgetNotifications,
} from './WidgetNotifications';

type PlannerTone = 'success' | 'warning' | 'error' | 'info' | 'neutral';

const plannerKpis = [
  {value: '11', label: 'Planning Queue', note: 'WOs still in planning', tone: 'neutral'},
  {value: '8', label: 'Ready to Schedule', note: 'Released for planner review', tone: 'success'},
  {value: 'Capacity Risk', label: '', note: 'Wed: 12 WOs queued', tone: 'warning', compactValue: true, criticality: 'warning'},
  {value: '82%', label: 'Parts Readiness', note: '2 PMs missing parts', tone: 'warning', criticality: 'warning'},
] as const;

const planningActions = [
  {type: 'Schedule', impact: '8 WOs', detail: 'Ready to schedule', period: 'This week', tone: 'success'},
  {type: 'Plan', impact: '3 PMs', detail: 'Due next week', period: 'Jun 15-21', tone: 'info'},
  {type: 'Capacity', impact: '12 WOs', detail: 'Labor overload on Wednesday', period: 'Jun 17', tone: 'warning'},
  {type: 'Parts', impact: '2 PMs', detail: 'Missing parts before release', period: 'Next 7 days', tone: 'warning'},
  {type: 'Assign', impact: '1 WO', detail: 'Corrective WO waiting technician', period: 'Today', tone: 'error'},
] as const;

const nextMaintenancePlans = [
  {date: 'Jun 12', type: 'Weekly PM', asset: 'Line 10 Packaging'},
  {date: 'Jun 16', type: 'Monthly PM', asset: 'Autoclave A01'},
  {date: 'Jun 19', type: 'Quarterly PM', asset: 'Filling Valve Bank'},
] as const;

const insetCardSx = {
  border: '1px solid rgba(15, 23, 42, 0.06)',
  borderRadius: '8px',
  bgcolor: tokenCommon.white,
} as const;

const sectionTitleSx = {
  fontSize: '0.82rem',
  fontWeight: 600,
  color: workstationVisuals.textPrimary,
  fontFamily: workstationVisuals.fontFamily,
  lineHeight: 1.2,
} as const;

const metaTextSx = {
  fontSize: '0.68rem',
  color: workstationVisuals.textSecondary,
  fontWeight: 500,
  fontFamily: workstationVisuals.fontFamily,
  lineHeight: 1.25,
} as const;

function getToneColor(tone: PlannerTone) {
  if (tone === 'success') return tokenSuccess.main;
  if (tone === 'warning') return tokenWarning.main;
  if (tone === 'error') return tokenError.main;
  if (tone === 'info') return tokenInfo.main;
  return workstationVisuals.textPrimary;
}

function getCriticalKpiSx(criticality?: 'warning') {
  if (criticality === 'warning') {
    return {
      bgcolor: tokenWarning.softBg,
      border: `1px solid ${tokenWarning.lighter}`,
      borderRadius: '8px',
    } as const;
  }

  return {} as const;
}

export default function MaintenancePlannerWidget({className, style, onExpand}: WorkstationWidgetProps) {
  const notifications = useWidgetNotifications(maintenancePlannerNotificationConfig);

  const openPlanner = () => {
    onExpand?.();
  };

  const headerAction = (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
      <WidgetNotificationBell active={notifications.active} onClick={notifications.openDialog} size={24} />
      <IconButton
        size="small"
        aria-label="Open Maintenance Planner Calendar"
        onClick={(event) => {
          event.stopPropagation();
          openPlanner();
        }}
        sx={{width: 24, height: 24, p: 0, color: tokenBrand.main}}
      >
        <NorthEastIcon sx={{fontSize: 18}} />
      </IconButton>
    </Box>
  );

  return (
    <>
      <WidgetShell title="Maintenance Planner" action={headerAction} className={className} style={style}>
        <Box
          onClick={openPlanner}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openPlanner();
            }
          }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.2,
            height: '100%',
            minHeight: 0,
            p: 0.5,
            containerType: 'inline-size',
            cursor: 'pointer',
            '&:focus-visible': {
              outline: `2px solid ${tokenBrand.main}`,
              outlineOffset: 2,
              borderRadius: '8px',
            },
          }}
        >
        <Box
          sx={{
            ...insetCardSx,
            p: 1.35,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 1,
            flexShrink: 0,
            '@container (max-width: 560px)': {
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            },
            '@container (max-width: 340px)': {
              gridTemplateColumns: '1fr',
            },
          }}
        >
          {plannerKpis.map((kpi, index) => (
            <MetricSummary
              key={kpi.label}
              value={kpi.value}
              label={kpi.label}
              note={kpi.note}
              tone={kpi.tone}
              last={index === plannerKpis.length - 1}
              compactValue={'compactValue' in kpi && kpi.compactValue}
              criticality={'criticality' in kpi ? kpi.criticality : undefined}
            />
          ))}
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.45fr) minmax(220px, 0.75fr)',
            gap: 1.2,
            minHeight: 0,
            flex: 1,
            '@container (max-width: 720px)': {
              gridTemplateColumns: '1fr',
              overflow: 'auto',
            },
          }}
        >
          <Box sx={{...insetCardSx, p: 1.25, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 0.85}}>
            <Typography sx={sectionTitleSx}>Planning Actions and Risks</Typography>
            <Box sx={{display: 'grid', minHeight: 0, overflow: 'auto'}}>
              {planningActions.map((item, index) => (
                <ActionRow key={`${item.type}-${item.detail}`} item={item} last={index === planningActions.length - 1} />
              ))}
            </Box>
          </Box>

          <Box sx={{...insetCardSx, p: 1.25, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 0.85}}>
            <Typography sx={sectionTitleSx}>Next Maintenance Plans</Typography>
            <Box sx={{display: 'grid', gap: 0.75, minHeight: 0, overflow: 'hidden'}}>
              {nextMaintenancePlans.map((plan) => (
                <Box
                  key={`${plan.date}-${plan.type}-${plan.asset}`}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '52px minmax(0, 1fr)',
                    gap: 0.85,
                    alignItems: 'start',
                    minWidth: 0,
                    py: 0.2,
                  }}
                >
                  <Box
                    sx={{
                      ...workstationStatusPillSx('neutral'),
                      justifyContent: 'center',
                      height: 20,
                      px: 0.55,
                      borderRadius: '8px',
                      fontSize: '0.62rem',
                      bgcolor: tokenNeutral.lightest,
                    }}
                  >
                    {plan.date}
                  </Box>
                  <Box sx={{minWidth: 0}}>
                    <Typography
                      sx={{
                        fontSize: '0.78rem',
                        color: workstationVisuals.textPrimary,
                        fontWeight: 700,
                        lineHeight: 1.15,
                        fontFamily: workstationVisuals.fontFamily,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {plan.type}
                    </Typography>
                    <Typography sx={{...metaTextSx, mt: 0.25}} noWrap>
                      {plan.asset}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
        </Box>
      </WidgetShell>
      <WidgetNotificationsDialog
        active={notifications.active}
        config={maintenancePlannerNotificationConfig}
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
  compactValue = false,
  criticality,
}: {
  compactValue?: boolean;
  criticality?: 'warning';
  label: string;
  last: boolean;
  note: string;
  tone: PlannerTone;
  value: string;
}) {
  return (
    <Box
      sx={{
        minWidth: 0,
        p: 0.35,
        pl: 0.8,
        borderRight: last ? 'none' : '1px solid rgba(15, 23, 42, 0.06)',
        ...getCriticalKpiSx(criticality),
        '@container (max-width: 860px)': {
          borderRight: 'none',
        },
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'baseline', gap: 0.8, minWidth: 0}}>
        <Typography
          sx={{
            fontSize: compactValue ? '0.92rem' : '1.22rem',
            color: getToneColor(tone),
            fontWeight: compactValue ? 700 : 600,
            lineHeight: 1,
            fontFamily: workstationVisuals.fontFamily,
            flexShrink: 0,
          }}
        >
          {value}
        </Typography>
        {label ? (
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
        ) : null}
      </Box>
      <Typography sx={{...metaTextSx, mt: 0.45}} noWrap>
        {note}
      </Typography>
    </Box>
  );
}

function ActionRow({item, last}: {item: typeof planningActions[number]; last: boolean}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '76px minmax(0, 1fr) auto',
        gap: 1,
        alignItems: 'center',
        minWidth: 0,
        py: 0.72,
        borderBottom: last ? 'none' : '1px solid rgba(15, 23, 42, 0.045)',
        transition: 'background-color 0.15s ease',
        '&:hover': {
          bgcolor: tokenNeutral.lightest,
        },
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 21,
          px: 0.7,
          border: '1px solid rgba(15, 23, 42, 0.08)',
          borderRadius: '8px',
          bgcolor: tokenNeutral.lightest,
          color: workstationVisuals.textSecondary,
          fontSize: '0.61rem',
          fontWeight: 600,
          fontFamily: workstationVisuals.fontFamily,
          lineHeight: 1,
        }}
      >
        {item.type}
      </Box>
      <Box sx={{minWidth: 0}}>
        <Box sx={{display: 'flex', alignItems: 'baseline', gap: 0.55, minWidth: 0}}>
          <Typography sx={{fontSize: '0.8rem', color: workstationVisuals.textPrimary, fontWeight: 800, lineHeight: 1.2, fontFamily: workstationVisuals.fontFamily, flexShrink: 0}}>
            {item.impact}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.78rem',
              color: workstationVisuals.textPrimary,
              fontWeight: 700,
              lineHeight: 1.2,
              fontFamily: workstationVisuals.fontFamily,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {item.detail}
          </Typography>
        </Box>
      </Box>
      <Typography sx={{...metaTextSx, justifySelf: 'end', whiteSpace: 'nowrap'}}>
        {item.period}
      </Typography>
    </Box>
  );
}
