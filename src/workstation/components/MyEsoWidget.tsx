import {
  tokenBrand,
  tokenError,
  tokenWarning,
  tokenSuccess,
  tokenInfo,
  tokenNeutral,
  tokenCommon,
  workstationVisuals
} from '../theme';
import { useState } from 'react';
import { Box, Button, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import {
  Add as AddIcon,
  ArrowOutward as ArrowOutwardIcon,
  CalendarMonth as CalendarIcon,
  ExpandMore as ExpandMoreIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import {
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  myEsoNotificationConfig,
  useWidgetNotifications,
} from './WidgetNotifications';
import WidgetShell from './WidgetShell';

type MyEsoWidgetProps = {
  onCreateEso?: () => void;
  onExpand?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

const esoKpis = [
  { value: '32', label: 'Total ESOs', note: 'Submitted this period', color: tokenBrand.main },
  { value: '80%', label: 'Target', note: '32 / 40 ESOs', color: tokenSuccess.main },
  { value: '20', label: 'Open ESOs', note: '', color: workstationVisuals.textPrimary },
  { value: '5', label: 'Awaiting Review', note: '', color: tokenWarning.main },
  { value: '6', label: 'Action In Progress', note: '', color: tokenBrand.main },
  { value: '3', label: 'SPO Near Misses', note: '', color: tokenError.main },
];

const dateFilterOptions = ['Current Week', 'Last Week', 'Current Month', 'Last Month'];
const shiftFilterOptions = ['Shift', 'Shift A', 'Shift B', 'Shift C'];

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

const teamByType = [
  { label: 'BBS', value: 14, color: tokenBrand.main },
  { label: 'Condition', value: 12, color: tokenWarning.main },
  { label: 'Near Miss', value: 6, color: tokenError.main },
];

const teamByStatus = [
  { label: 'Review', value: 5, color: tokenWarning.main },
  { label: 'Action Created', value: 4, color: tokenInfo.main },
  { label: 'Action In Progress', value: 6, color: tokenBrand.main },
  { label: 'Closed', value: 17, color: tokenSuccess.main },
];

const topUnsafeBehaviors = [
  ['Personal Protective Equipment (PPE)', 7],
  ['Body Use (Ergonomics)', 5],
  ['Body Position', 4],
  ['Tools / Equipment', 3],
  ['Mobile Equipment', 2],
] as const;

const topUnsafeConditions = [
  ['Walking / Slip, Trip, Fall', 5],
  ['Electrical Safety', 3],
  ['Work Environment (Light, Noise, etc.)', 2],
  ['Security', 1],
  ['Machine Guarding', 1],
] as const;

const topNearMissCategories = [
  ['Walking / Slip, Trip, Fall', 3],
  ['Electrical Safety', 2],
  ['Security', 1],
  ['Contractors / Visitors', 1],
  ['Work Environment (Light, Noise, etc.)', 1],
] as const;

export default function MyEsoWidget({ onCreateEso, onExpand, className, style }: MyEsoWidgetProps) {
  const [dateFilter, setDateFilter] = useState('Current Month');
  const [shiftFilter, setShiftFilter] = useState('Shift');
  const [dateAnchor, setDateAnchor] = useState<null | HTMLElement>(null);
  const [shiftAnchor, setShiftAnchor] = useState<null | HTMLElement>(null);
  const notifications = useWidgetNotifications(myEsoNotificationConfig);

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
        Create
      </Button>
      <StarBorderIcon sx={{ fontSize: 18, color: tokenBrand.main, cursor: 'pointer', ml: 0.5 }} />
      <WidgetNotificationBell active={notifications.active} onClick={notifications.openDialog} size={24} />
      <IconButton size="small" onClick={onExpand} sx={{ width: 24, height: 24, p: 0, color: tokenBrand.main }}>
        <ArrowOutwardIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );

  return (
    <WidgetShell
      title="My Team ESOs"
      action={headerAction}
      className={className}
      style={style}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, p: 0.5, mt: 1, containerType: 'inline-size' }}>
        {/* KPI Stats Block: Enclosed in a card wrapper with subtle borders */}
        <Box sx={{
          border: '1px solid rgba(15, 23, 42, 0.06)',
          borderRadius: '8px',
          p: 1.5,
          bgcolor: tokenCommon.white,
          display: 'grid',
          gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
          gap: 1,
          '@container (max-width: 1180px)': {
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          },
          '@container (max-width: 760px)': {
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          },
          '@container (max-width: 460px)': {
            gridTemplateColumns: '1fr',
          },
        }}>
          {esoKpis.map((kpi, idx) => (
            <Box
              key={kpi.label}
              sx={{
                p: 0.5,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                pl: 1,
                borderRight: idx < esoKpis.length - 1 ? '1px solid rgba(15, 23, 42, 0.06)' : 'none',
                minWidth: 0,
                '@container (max-width: 1180px)': {
                  borderRight: idx % 3 !== 2 && idx < 3 ? '1px solid rgba(15, 23, 42, 0.06)' : 'none',
                },
                '@container (max-width: 760px)': {
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
              {kpi.note ? (
                <Typography sx={{ fontSize: '0.62rem', color: workstationVisuals.textSecondary, mt: 0.5, fontFamily: workstationVisuals.fontFamily, whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
                  {kpi.note}
                </Typography>
              ) : null}
            </Box>
          ))}
        </Box>

        {/* Charts & Rates Row: Cards with subtle borders */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1.2, '@container (max-width: 980px)': { gridTemplateColumns: '1fr' } }}>
          {/* Donut Chart: ESOs by Type */}
          <Box sx={{
            border: '1px solid rgba(15, 23, 42, 0.06)',
            borderRadius: '8px',
            p: 2,
            bgcolor: tokenCommon.white,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5
          }}>
            <Typography sx={{ fontSize: '0.82rem', color: workstationVisuals.textPrimary, fontWeight: 600, fontFamily: workstationVisuals.fontFamily }}>
              My Team ESOs by Type
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ width: 84, height: 84, borderRadius: '50%', background: `conic-gradient(${tokenBrand.main} 0 44%, ${tokenWarning.main} 44% 82%, ${tokenError.main} 82% 100%)`, position: 'relative', flexShrink: 0 }}>
                <Box sx={{ position: 'absolute', inset: 14, borderRadius: '50%', bgcolor: tokenCommon.white, display: 'grid', placeItems: 'center' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: workstationVisuals.textPrimary, lineHeight: 1, fontFamily: workstationVisuals.fontFamily }}>32</Typography>
                    <Typography sx={{ fontSize: '0.62rem', color: workstationVisuals.textSecondary, lineHeight: 1.2, fontFamily: workstationVisuals.fontFamily }}>Total</Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: 'grid', gap: 0.5, flex: 1, minWidth: 0 }}>
                {teamByType.map((item) => (
                  <LegendRow key={item.label} color={item.color} label={`${item.label} ${item.value}`} />
                ))}
              </Box>
            </Box>
          </Box>

          {/* Donut Chart: ESOs by Status */}
          <Box sx={{
            border: '1px solid rgba(15, 23, 42, 0.06)',
            borderRadius: '8px',
            p: 2,
            bgcolor: tokenCommon.white,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5
          }}>
            <Typography sx={{ fontSize: '0.82rem', color: workstationVisuals.textPrimary, fontWeight: 600, fontFamily: workstationVisuals.fontFamily }}>
              My Team ESOs by Status
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ width: 84, height: 84, borderRadius: '50%', background: `conic-gradient(${tokenWarning.main} 0 16%, ${tokenInfo.main} 16% 29%, ${tokenBrand.main} 29% 47%, ${tokenSuccess.main} 47% 100%)`, position: 'relative', flexShrink: 0 }}>
                <Box sx={{ position: 'absolute', inset: 14, borderRadius: '50%', bgcolor: tokenCommon.white, display: 'grid', placeItems: 'center' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: workstationVisuals.textPrimary, lineHeight: 1, fontFamily: workstationVisuals.fontFamily }}>32</Typography>
                    <Typography sx={{ fontSize: '0.62rem', color: workstationVisuals.textSecondary, lineHeight: 1.2, fontFamily: workstationVisuals.fontFamily }}>Total</Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: 'grid', gap: 0.5, flex: 1, minWidth: 0 }}>
                {teamByStatus.map((item) => (
                  <LegendRow key={item.label} color={item.color} label={`${item.label} ${item.value}`} />
                ))}
              </Box>
            </Box>
          </Box>

          {/* Rate Cards Column */}
          <Box sx={{
            border: '1px solid rgba(15, 23, 42, 0.06)',
            borderRadius: '8px',
            p: 2,
            bgcolor: tokenCommon.white,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5
          }}>
            <Typography sx={{ fontSize: '0.82rem', color: workstationVisuals.textPrimary, fontWeight: 600, fontFamily: workstationVisuals.fontFamily }}>
              Team Engagement
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, justifyContent: 'center', flex: 1 }}>
              <TeamRateCard title="Team Contact Rate" value="1.4" target="Target: 2.3" tone={tokenError.main} />
              <TeamRateCard title="Team Participation Rate" value="78%" detail="(21 / 27)" tone={tokenBrand.main} />
            </Box>
          </Box>
        </Box>

        {/* Categories Bar Charts Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1.2, '@container (max-width: 980px)': { gridTemplateColumns: '1fr' } }}>
          <TopCategoryBars title="Top Unsafe BBS Behaviors" color={tokenBrand.main} rows={topUnsafeBehaviors} />
          <TopCategoryBars title="Top Unsafe Condition Categories" color={tokenWarning.main} rows={topUnsafeConditions} />
          <TopCategoryBars title="Top Near Miss Categories" color={tokenError.main} rows={topNearMissCategories} />
        </Box>

      </Box>

      {/* Dropdown Menus */}
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
        config={myEsoNotificationConfig}
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

function TeamRateCard({
  detail,
  target,
  title,
  tone,
  value,
}: {
  detail?: string;
  target?: string;
  title: string;
  tone: string;
  value: string;
}) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8 }}>
        <Typography sx={{ fontSize: '1.25rem', lineHeight: 1, color: tone, fontWeight: 600, fontFamily: workstationVisuals.fontFamily }}>{value}</Typography>
        <Typography sx={{ fontSize: '0.72rem', color: workstationVisuals.textSecondary, fontFamily: workstationVisuals.fontFamily, fontWeight: 600 }}>{title}</Typography>
      </Box>
      {target ? <Typography sx={{ fontSize: '0.68rem', color: tokenSuccess.main, fontWeight: 600, fontFamily: workstationVisuals.fontFamily, mt: 0.4 }}>{target}</Typography> : null}
      {detail ? <Typography sx={{ fontSize: '0.68rem', color: workstationVisuals.textSecondary, fontFamily: workstationVisuals.fontFamily, mt: 0.4 }}>{detail}</Typography> : null}
    </Box>
  );
}

function TopCategoryBars({
  color,
  rows,
  title,
}: {
  color: string;
  rows: ReadonlyArray<readonly [string, number]>;
  title: string;
}) {
  const maxValue = Math.max(...rows.map((row) => row[1]));
  return (
    <Box sx={{
      border: '1px solid rgba(15, 23, 42, 0.06)',
      borderRadius: '8px',
      p: 2,
      bgcolor: tokenCommon.white,
      display: 'grid',
      alignContent: 'start',
      gap: 1.5
    }}>
      <Typography sx={{ fontSize: '0.82rem', color: workstationVisuals.textPrimary, fontWeight: 600, fontFamily: workstationVisuals.fontFamily }}>{title}</Typography>
      <Box sx={{ display: 'grid', gap: 1, alignContent: 'start' }}>
        {rows.map(([label, value]) => (
          <Box key={label} sx={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 20px', alignItems: 'center', gap: 1.5 }}>
            <Typography sx={{ fontSize: '0.72rem', color: workstationVisuals.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: workstationVisuals.fontFamily }}>{label}</Typography>
            <Box sx={{ height: 6, bgcolor: 'rgba(15, 23, 42, 0.04)', borderRadius: 999 }}>
              <Box sx={{ height: '100%', width: `${(value / maxValue) * 100}%`, bgcolor: color, borderRadius: 999 }} />
            </Box>
            <Typography sx={{ fontSize: '0.72rem', color: workstationVisuals.textPrimary, textAlign: 'right', fontWeight: 600, fontFamily: workstationVisuals.fontFamily }}>{value}</Typography>
          </Box>
        ))}
      </Box>
      <Button
        endIcon={<ArrowOutwardIcon sx={{ fontSize: 10 }} />}
        sx={{
          justifySelf: 'end',
          minWidth: 0,
          p: 0,
          mt: 0.5,
          color: tokenBrand.main,
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '0.72rem',
          fontFamily: workstationVisuals.fontFamily,
          '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
        }}
      >
        View all
      </Button>
    </Box>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
      <Typography sx={{ fontSize: '0.72rem', color: workstationVisuals.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: workstationVisuals.fontFamily }}>
        {label}
      </Typography>
    </Box>
  );
}
