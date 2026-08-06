import {useState} from 'react';
import type {CSSProperties} from 'react';
import {Box, Button, Menu, MenuItem, Typography} from '@mui/material';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Build as BuildIcon,
  ExpandMore as ExpandMoreIcon,
  FactCheck as FactCheckIcon,
} from '@mui/icons-material';
import {
  tokenBrand,
  tokenCommon,
  tokenDivider,
  tokenError,
  tokenNeutral,
  tokenSuccess,
  tokenText,
  tokenWarning,
  workstationVisuals,
} from '../theme';
import WidgetShell from './WidgetShell';

type MyActivitiesKpisWidgetProps = {
  className?: string;
  style?: CSSProperties;
};

type ActivityKpi = {
  id: string;
  label: string;
  value: number;
  detail: string;
  note: string;
  tone: 'brand' | 'success' | 'warning' | 'error';
  icon: typeof AddCircleOutlineIcon;
};

const periodOptions = ['This Week', 'Last Week', 'This Month', 'Last Month'];

const activityKpis: ActivityKpi[] = [
  {
    id: 'esos',
    label: 'ESOs Created',
    value: 7,
    detail: 'This week',
    note: '+15% vs last week',
    tone: 'error',
    icon: AddCircleOutlineIcon,
  },
  {
    id: 'cil',
    label: 'CILs Performed',
    value: 5,
    detail: 'Completed',
    note: '+7% vs last week',
    tone: 'success',
    icon: AssignmentTurnedInIcon,
  },
  {
    id: 'centerline',
    label: 'Centerlines Performed',
    value: 4,
    detail: 'Current shift',
    note: '-20% vs last week',
    tone: 'warning',
    icon: FactCheckIcon,
  },
  {
    id: 'maintenance',
    label: 'Maintenance Requests',
    value: 9,
    detail: 'Open + created',
    note: '+5% vs last week',
    tone: 'brand',
    icon: BuildIcon,
  },
];

const kpiToneMap = {
  brand: {
    main: tokenBrand.main,
    border: tokenBrand.selectedBg,
    bg: tokenBrand.softBg,
  },
  success: {
    main: tokenSuccess.darker,
    border: tokenSuccess.selectedBg,
    bg: tokenSuccess.softBg,
  },
  warning: {
    main: tokenWarning.dark,
    border: tokenWarning.selectedBg,
    bg: tokenWarning.softBg,
  },
  error: {
    main: tokenError.main,
    border: tokenError.selectedBg,
    bg: tokenError.softBg,
  },
} as const;

const filterButtonSx = {
  height: 32,
  borderRadius: '8px',
  px: 1.2,
  color: tokenText.secondary,
  borderColor: tokenDivider,
  bgcolor: tokenCommon.white,
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.8125rem',
  fontFamily: workstationVisuals.fontFamily,
  boxShadow: 'none',
  '&:hover': {
    borderColor: tokenBrand.main,
    bgcolor: tokenNeutral.lightest,
    boxShadow: 'none',
  },
  '& .MuiButton-endIcon': {ml: 0.35, '& svg': {fontSize: 16}},
} as const;

export default function MyActivitiesKpisWidget({className, style}: MyActivitiesKpisWidgetProps) {
  const [period, setPeriod] = useState(periodOptions[0]);
  const [periodAnchor, setPeriodAnchor] = useState<null | HTMLElement>(null);

  const headerAction = (
    <Button
      variant="outlined"
      endIcon={<ExpandMoreIcon />}
      onClick={(event) => setPeriodAnchor(event.currentTarget)}
      sx={filterButtonSx}
    >
      {period}
    </Button>
  );

  return (
    <WidgetShell
      title={(
        <Box sx={{display: 'grid', gap: 0.2, minWidth: 0}}>
          <Typography sx={{fontSize: '0.95rem', lineHeight: 1.25, fontWeight: 800, color: tokenText.primary, fontFamily: workstationVisuals.fontFamily}}>
            My Activities KPIs
          </Typography>
          <Typography sx={{fontSize: '0.75rem', lineHeight: 1.25, fontWeight: 500, color: tokenText.secondary, fontFamily: workstationVisuals.fontFamily, whiteSpace: 'normal'}}>
            Summary of activities created and performed
          </Typography>
        </Box>
      )}
      action={headerAction}
      className={className}
      style={style}
    >
      <Box
        sx={{
          height: '100%',
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 'clamp(0.65rem, 1.4cqw, 0.85rem)',
          containerType: 'inline-size',
          overflow: 'hidden',
          alignContent: 'start',
          '@container (max-width: 760px)': {
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          },
          '@container (max-width: 360px)': {
            gridTemplateColumns: '1fr',
          },
        }}
      >
        {activityKpis.map((kpi) => (
          <ActivityKpiCard key={kpi.id} kpi={kpi} />
        ))}
      </Box>

      <Menu
        anchorEl={periodAnchor}
        open={Boolean(periodAnchor)}
        onClose={() => setPeriodAnchor(null)}
        PaperProps={{sx: {borderRadius: '8px', mt: 0.6, border: `1px solid ${tokenDivider}`, boxShadow: '0 10px 24px rgba(0, 31, 155, 0.14)'}}}
      >
        {periodOptions.map((option) => (
          <MenuItem
            key={option}
            selected={period === option}
            onClick={() => {
              setPeriod(option);
              setPeriodAnchor(null);
            }}
            sx={{fontSize: '0.8125rem', fontFamily: workstationVisuals.fontFamily}}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </WidgetShell>
  );
}

function ActivityKpiCard({kpi}: {kpi: ActivityKpi}) {
  const colors = kpiToneMap[kpi.tone];
  const Icon = kpi.icon;

  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: '8px',
        border: `1px solid ${colors.border}`,
        bgcolor: colors.bg,
        minHeight: 96,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, minWidth: 0}}>
        <Typography sx={{fontSize: 10.5, color: tokenText.secondary, fontWeight: 850, textTransform: 'uppercase', lineHeight: 1.1, fontFamily: workstationVisuals.fontFamily, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
          {kpi.label}
        </Typography>
        <Icon sx={{fontSize: 17, color: colors.main, flex: '0 0 auto'}} />
      </Box>

      <Box sx={{mt: 0.6, minWidth: 0}}>
        <Typography sx={{fontSize: 'clamp(1.65rem, 5.6cqw, 2.05rem)', fontWeight: 850, color: colors.main, lineHeight: 1, fontFamily: workstationVisuals.fontFamily}}>
          {kpi.value}
        </Typography>
        <Typography sx={{fontSize: 11.5, color: tokenText.secondary, mt: 0.35, lineHeight: 1.25, fontFamily: workstationVisuals.fontFamily, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
          {kpi.detail}
        </Typography>
      </Box>

      <Typography sx={{fontSize: 11.5, color: colors.main, fontWeight: 850, lineHeight: 1.25, fontFamily: workstationVisuals.fontFamily, mt: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
        {kpi.note}
      </Typography>
    </Box>
  );
}
