import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Box, Button, IconButton, LinearProgress, Menu, MenuItem, Typography } from '@mui/material';
import {
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  AssignmentOutlined as ShiftIcon,
  CalendarMonth as CalendarIcon,
  CheckCircleOutline as ClosedIcon,
  ErrorOutline as ConditionIcon,
  ExpandMore as ExpandMoreIcon,
  InfoOutlined as InfoOutlinedIcon,
  OpenInFull as OpenInFullIcon,
  PlayCircleOutline as InProgressIcon,
  RadioButtonChecked as NearMissIcon,
  StarBorder as StarBorderIcon,
  TodayOutlined as ActionCreatedIcon,
  AccessTimeOutlined as ReviewIcon,
  ShieldOutlined as BbsIcon,
} from '@mui/icons-material';
import {
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  myEsosNotificationConfig,
  useWidgetNotifications,
} from './WidgetNotifications';
import WidgetShell from './WidgetShell';
import {
  tokenBrand,
  tokenError,
  tokenWarning,
  tokenSuccess,
  tokenInfo,
  tokenNeutral,
  tokenCommon,
  workstationVisuals,
  workstationStatusPillSx,
  workstationTableSx,
  workstationTableHeaderCellSx,
  workstationTableCellSx,
} from '../theme';

type MyEsosWidgetProps = {
  className?: string;
  style?: CSSProperties;
  timeframe?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'shift';
  shift?: string;
  onViewModeChange?: (viewMode: 'graph' | 'table') => void;
  onExpand?: () => void;
  domain?: string;
  onCreateEso?: () => void;
};

const kpis = [
  { value: '4', label: 'My ESOs', note: 'Submitted this period', color: tokenBrand.main },
  { value: '1', label: 'Awaiting Review', note: 'Needs supervisor review', color: tokenWarning.main },
  { value: '1', label: 'Action Created', note: 'Open follow-up', color: tokenInfo.main },
  { value: '1', label: 'Action In Progress', note: 'Assigned action', color: tokenBrand.main },
  { value: '1', label: 'Closed', note: 'Completed ESO', color: tokenSuccess.main },
];

const categories = [
  { label: 'BBS', subtitle: 'Behavior Based Safety Observation', value: '1', color: tokenBrand.main, bg: tokenBrand.softBg, icon: <BbsIcon /> },
  { label: 'Condition Report', subtitle: 'Report workplace conditions', value: '2', color: tokenWarning.main, bg: tokenWarning.softBg, icon: <ConditionIcon /> },
  { label: 'Near Miss', subtitle: 'Incidents with potential harm', value: '1', color: tokenError.main, bg: tokenError.softBg, icon: <NearMissIcon /> },
];

const statusRows = [
  { label: 'Review', value: 1, color: tokenWarning.main },
  { label: 'Action Created', value: 1, color: tokenInfo.main },
  { label: 'Action In Progress', value: 1, color: tokenBrand.main },
  { label: 'Closed', value: 1, color: tokenSuccess.main },
];

const recentEsos = [
  { id: 'ESO-2024-102931', type: 'BBS', date: 'May 22, 2026', time: '09:15 AM', status: 'Review', icon: <BbsIcon sx={{ fontSize: 13 }} /> },
  { id: 'ESO-2024-102941', type: 'Condition Report', date: 'May 20, 2026', time: '02:45 PM', status: 'Closed', icon: <ConditionIcon sx={{ fontSize: 13 }} /> },
  { id: 'ESO-2024-102960', type: 'Near Miss', date: 'May 19, 2026', time: '10:30 AM', status: 'Action In Progress', icon: <NearMissIcon sx={{ fontSize: 13 }} /> },
  { id: 'ESO-2024-102965', type: 'Condition Report', date: 'May 18, 2026', time: '08:10 AM', status: 'Action Created', icon: <ConditionIcon sx={{ fontSize: 13 }} /> },
];

const dateFilterOptions = ['Current Week', 'Last Week', 'Current Month', 'Last Month'];
const shiftFilterOptions = ['Shift', 'Shift A', 'Shift B', 'Shift C'];

const insetCardSx = {
  border: '1px solid rgba(15, 23, 42, 0.06)',
  borderRadius: '8px',
  bgcolor: tokenCommon.white,
} as const;

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
  '& .MuiButton-startIcon': { mr: 0.3, '& svg': { fontSize: 13 } },
  '& .MuiButton-endIcon': { ml: 0.2, '& svg': { fontSize: 13 } },
} as const;

function getStatusSeverity(status: string): 'warning' | 'neutral' | 'success' {
  if (status === 'Closed') return 'success';
  if (status === 'Review') return 'warning';
  return 'neutral';
}

export default function MyEsosWidget({ onCreateEso, onExpand, className, style }: MyEsosWidgetProps) {
  const [dateFilter, setDateFilter] = useState('Current Month');
  const [shiftFilter, setShiftFilter] = useState('Shift');
  const [dateAnchor, setDateAnchor] = useState<null | HTMLElement>(null);
  const [shiftAnchor, setShiftAnchor] = useState<null | HTMLElement>(null);
  const notifications = useWidgetNotifications(myEsosNotificationConfig);

  const headerAction = (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.75, flexWrap: 'wrap', rowGap: 0.6, maxWidth: '100%' }}>
      <Button
        variant="outlined"
        startIcon={<CalendarIcon />}
        endIcon={<ExpandMoreIcon />}
        onClick={(event) => setDateAnchor(event.currentTarget)}
        sx={{ ...filterButtonSx, minWidth: 0 }}
      >
        {dateFilter}
      </Button>
      <Button
        variant="outlined"
        startIcon={<ShiftIcon />}
        endIcon={<ExpandMoreIcon />}
        onClick={(event) => setShiftAnchor(event.currentTarget)}
        sx={{ ...filterButtonSx, minWidth: 0 }}
      >
        {shiftFilter}
      </Button>
      <Button
        size="small"
        startIcon={<AddIcon />}
        onClick={onCreateEso}
        sx={{ ...filterButtonSx, minWidth: 0 }}
      >
        Open ESO
      </Button>
      <StarBorderIcon sx={{ fontSize: 18, color: tokenBrand.main, cursor: 'pointer', ml: 0.5 }} />
      <InfoOutlinedIcon sx={{ fontSize: 18, color: tokenBrand.main, cursor: 'pointer' }} />
      <WidgetNotificationBell active={notifications.active} onClick={notifications.openDialog} size={24} />
      <IconButton size="small" onClick={onExpand} sx={{ width: 24, height: 24, p: 0, color: tokenBrand.main }}>
        <OpenInFullIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  );

  return (
    <WidgetShell title="My ESOs" action={headerAction} className={className} style={style}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.2,
          height: '100%',
          minHeight: 0,
          p: 0.5,
          containerType: 'inline-size',
        }}
      >
        <Box
          className="my-esos-kpis"
          sx={{
            ...insetCardSx,
            p: 1.5,
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
            gap: 1,
            '@container (max-width: 1100px)': {
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            },
            '@container (max-width: 720px)': {
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            },
            '@container (max-width: 460px)': {
              gridTemplateColumns: '1fr',
            },
          }}
        >
          {kpis.map((kpi, idx) => (
            <Box
              key={kpi.label}
              sx={{
                p: 0.5,
                pl: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderRight: idx < kpis.length - 1 ? '1px solid rgba(15, 23, 42, 0.06)' : 'none',
                minWidth: 0,
                '@container (max-width: 1100px)': {
                  borderRight: idx % 3 !== 2 && idx < 3 ? '1px solid rgba(15, 23, 42, 0.06)' : 'none',
                },
                '@container (max-width: 720px)': {
                  borderRight: 'none',
                },
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: '1.25rem', color: kpi.color, fontWeight: 600, lineHeight: 1, fontFamily: workstationVisuals.fontFamily, flexShrink: 0 }}>
                  {kpi.value}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: workstationVisuals.textPrimary, fontWeight: 500, lineHeight: 1.2, fontFamily: workstationVisuals.fontFamily, whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
                  {kpi.label}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.62rem', color: workstationVisuals.textSecondary, mt: 0.5, fontFamily: workstationVisuals.fontFamily, whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
                {kpi.note}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ ...insetCardSx, p: 1.5 }}>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: workstationVisuals.textPrimary, mb: 1, fontFamily: workstationVisuals.fontFamily }}>
            My ESOs by Category
          </Typography>
          <Box
            className="my-esos-categories"
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 1,
              '@container (max-width: 640px)': {
                gridTemplateColumns: '1fr',
              },
            }}
          >
            {categories.map((category) => (
              <Box key={category.label} sx={{ ...insetCardSx, display: 'grid', gridTemplateColumns: '28px minmax(0, 1fr) auto', alignItems: 'center', gap: 1, p: 1 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: category.bg, color: category.color, display: 'grid', placeItems: 'center', '& svg': { fontSize: 16 } }}>
                  {category.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: workstationVisuals.textPrimary, fontWeight: 600, lineHeight: 1.2, fontFamily: workstationVisuals.fontFamily }}>
                    {category.label}
                  </Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: workstationVisuals.textSecondary, lineHeight: 1.2, fontFamily: workstationVisuals.fontFamily, whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
                    {category.subtitle}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '1.25rem', color: category.color, fontWeight: 600, fontFamily: workstationVisuals.fontFamily }}>
                  {category.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ ...insetCardSx, p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1, minWidth: 0, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8, minWidth: 0 }}>
              <Typography sx={{ fontSize: '1.25rem', color: tokenError.main, lineHeight: 1, fontWeight: 600, fontFamily: workstationVisuals.fontFamily }}>
                80%
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 500, color: workstationVisuals.textPrimary, fontFamily: workstationVisuals.fontFamily }}>
                My Month Target
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.72rem', color: workstationVisuals.textSecondary, fontWeight: 600, fontFamily: workstationVisuals.fontFamily, whiteSpace: 'nowrap' }}>
              4 / 5 ESOs
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.64rem', color: workstationVisuals.textSecondary, fontFamily: workstationVisuals.fontFamily }}>
            1 more to reach target
          </Typography>
          <Box sx={{ position: 'relative' }}>
            <LinearProgress
              variant="determinate"
              value={80}
              sx={{
                height: 6,
                borderRadius: '8px',
                bgcolor: tokenNeutral.lightest,
                '& .MuiLinearProgress-bar': { borderRadius: '8px', bgcolor: tokenError.main },
              }}
            />
            <Box sx={{ position: 'absolute', top: -3, left: '80%', height: 12, borderLeft: '2px dashed rgba(15, 23, 42, 0.2)' }} />
            <Typography sx={{ fontSize: '0.62rem', color: workstationVisuals.textSecondary, textAlign: 'right', mt: 0.5, fontWeight: 600, fontFamily: workstationVisuals.fontFamily }}>
              5 Target
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '46% minmax(0, 1fr)', gap: 1.2, '@container (max-width: 760px)': { gridTemplateColumns: '1fr' } }}>
          <Box sx={{ ...insetCardSx, p: 1.5, display: 'flex', flexDirection: 'column', gap: 1, minHeight: 0 }}>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: workstationVisuals.textPrimary, fontFamily: workstationVisuals.fontFamily }}>
              My ESOs by Status
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '92px minmax(0, 1fr)',
                gap: 1.2,
                alignItems: 'center',
                justifyContent: 'start',
                minHeight: 0,
              }}
            >
              <Box sx={{ width: 84, height: 84, borderRadius: '50%', background: `conic-gradient(${tokenWarning.main} 0 25%, ${tokenInfo.main} 25% 50%, ${tokenBrand.main} 50% 75%, ${tokenSuccess.main} 75% 100%)`, position: 'relative', flexShrink: 0 }}>
                <Box sx={{ position: 'absolute', inset: 14, borderRadius: '50%', bgcolor: tokenCommon.white, display: 'grid', placeItems: 'center' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: workstationVisuals.textPrimary, lineHeight: 1, fontFamily: workstationVisuals.fontFamily }}>
                        4
                      </Typography>
                      <Typography sx={{ fontSize: '0.62rem', color: workstationVisuals.textSecondary, lineHeight: 1.2, fontFamily: workstationVisuals.fontFamily }}>
                        Total
                      </Typography>
                    </Box>
                </Box>
              </Box>
              <Box sx={{ display: 'grid', gap: 0.55, minWidth: 0 }}>
                {statusRows.map((row) => (
                  <LegendRow key={row.label} color={row.color} label={`${row.label} ${row.value}`} />
                ))}
              </Box>
            </Box>
          </Box>

          <Box sx={{ ...insetCardSx, p: 1.5, display: 'flex', flexDirection: 'column', gap: 1, minHeight: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: workstationVisuals.textPrimary, fontFamily: workstationVisuals.fontFamily }}>
                My ESOs Submission
              </Typography>
              <Button
                endIcon={<ArrowForwardIcon sx={{ fontSize: 11 }} />}
                sx={{
                  height: 22,
                  textTransform: 'none',
                  fontWeight: 600,
                  color: tokenBrand.main,
                  fontSize: '0.72rem',
                  fontFamily: workstationVisuals.fontFamily,
                  '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                }}
              >
                View all
              </Button>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              <Box component="table" sx={workstationTableSx}>
                <thead>
                  <tr>
                    <Box component="th" sx={workstationTableHeaderCellSx}>ESO ID</Box>
                    <Box component="th" sx={workstationTableHeaderCellSx}>Type</Box>
                    <Box component="th" sx={workstationTableHeaderCellSx}>Creation Date</Box>
                    <Box component="th" sx={{ ...workstationTableHeaderCellSx, textAlign: 'right' }}>Status</Box>
                  </tr>
                </thead>
                <tbody>
                  {recentEsos.map((eso) => (
                    <Box component="tr" key={eso.id}>
                      <Box component="td" sx={workstationTableCellSx}>
                        <Typography sx={{ fontSize: '0.72rem', color: workstationVisuals.textPrimary, fontWeight: 500, fontFamily: workstationVisuals.fontFamily }}>
                          {eso.id}
                        </Typography>
                      </Box>
                      <Box component="td" sx={workstationTableCellSx}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 18, height: 18, borderRadius: '7px', bgcolor: tokenNeutral.lightest, color: workstationVisuals.textSecondary, display: 'grid', placeItems: 'center' }}>
                            {eso.icon}
                          </Box>
                          <Typography sx={{ fontSize: '0.72rem', color: workstationVisuals.textPrimary, fontWeight: 500, fontFamily: workstationVisuals.fontFamily }}>
                            {eso.type}
                          </Typography>
                        </Box>
                      </Box>
                      <Box component="td" sx={workstationTableCellSx}>
                        <Typography sx={{ fontSize: '0.72rem', color: workstationVisuals.textPrimary, fontWeight: 500, fontFamily: workstationVisuals.fontFamily }}>
                          {eso.date}
                        </Typography>
                      </Box>
                      <Box component="td" sx={{ ...workstationTableCellSx, textAlign: 'right' }}>
                        <Box sx={workstationStatusPillSx(getStatusSeverity(eso.status))}>
                          {eso.status}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </tbody>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Menu anchorEl={dateAnchor} open={Boolean(dateAnchor)} onClose={() => setDateAnchor(null)}>
        {dateFilterOptions.map((option) => (
          <MenuItem key={option} selected={option === dateFilter} onClick={() => { setDateFilter(option); setDateAnchor(null); }}>
            {option}
          </MenuItem>
        ))}
      </Menu>
      <Menu anchorEl={shiftAnchor} open={Boolean(shiftAnchor)} onClose={() => setShiftAnchor(null)}>
        {shiftFilterOptions.map((option) => (
          <MenuItem key={option} selected={option === shiftFilter} onClick={() => { setShiftFilter(option); setShiftAnchor(null); }}>
            {option}
          </MenuItem>
        ))}
      </Menu>

      <WidgetNotificationsDialog
        active={notifications.active}
        config={myEsosNotificationConfig}
        draftState={notifications.draftState}
        onApplySuggestion={notifications.applySuggestion}
        onClose={notifications.closeDialog}
        onSave={notifications.saveDialog}
        onStateChange={notifications.setDraftState}
        open={notifications.open}
      />
    </WidgetShell>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
      <Typography sx={{ fontSize: '0.72rem', color: workstationVisuals.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: workstationVisuals.fontFamily }}>
        {label}
      </Typography>
    </Box>
  );
}
