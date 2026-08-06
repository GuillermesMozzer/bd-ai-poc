import {useMemo, useState} from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AutoGraph as AutoGraphIcon,
  BarChart as BarChartIcon,
  BookmarkBorder as BookmarkBorderIcon,
  CalendarMonth as CalendarMonthIcon,
  Compare as CompareIcon,
  EditNote as EditNoteIcon,
  GppGood as GppGoodIcon,
  MoreHoriz as MoreHorizIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
  Speed as SpeedIcon,
  TableChart as TableChartIcon,
  ThumbUpAlt as ThumbUpAltIcon,
  Timeline as TimelineIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';
import {planningCardSx, planningTokens} from '../ui/planningTheme';
import {
  capacityByLine,
  capacityKpis,
  capacityLines,
  capacityScenarios,
  capacitySiteAreas,
  dailyCapacityProfile,
  lineDetails,
} from './mock';
import {
  CapacityKpiCards,
  SiteCapacityViewer,
  SiteCapacitySummaryPanel,
  DailyCapacityProfileChart,
  CapacityByLineMonthTable,
  ByLineTab,
  LineCapacityManagementTab,
} from './components';
import {lineShiftSchedules} from './mock';

const MONTHS = [
  'Jun-2026', 'Jul-2026', 'Aug-2026', 'Sep-2026', 'Oct-2026', 'Nov-2026',
  'Dec-2026', 'Jan-2027', 'Feb-2027', 'Mar-2027', 'Apr-2027', 'May-2027',
];

const TABS = [
  {label: 'Overview', icon: <AutoGraphIcon sx={{fontSize: 16}} />},
  {label: 'By Line', icon: <TableChartIcon sx={{fontSize: 16}} />},
  {label: 'Capacity Management', icon: <TuneIcon sx={{fontSize: 16}} />},
  {label: 'Scenarios', icon: <TimelineIcon sx={{fontSize: 16}} />},
  {label: 'Approval & Audit', icon: <ThumbUpAltIcon sx={{fontSize: 16}} />},
];

function ComingSoon({label}: {label: string}) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320}}>
      <Box sx={{textAlign: 'center'}}>
        <BarChartIcon sx={{fontSize: 48, color: planningTokens.border, mb: 1}} />
        <Typography sx={{fontSize: 16, fontWeight: 700, color: planningTokens.textSecondary}}>{label}</Typography>
        <Typography sx={{fontSize: 13, color: planningTokens.textMuted, mt: 0.5}}>Coming Soon</Typography>
      </Box>
    </Box>
  );
}

export default function CapacityPlanningPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedLineId, setSelectedLineId] = useState<string | null>('line-10');
  const [selectedMonth, setSelectedMonth] = useState('Mar-2027');
  const [selectedScenario, setSelectedScenario] = useState('capacity-recovery');

  const selectedLine = useMemo(
    () => capacityLines.find((l) => l.id === selectedLineId) ?? null,
    [selectedLineId],
  );
  const selectedLineDetail = useMemo(
    () => (selectedLineId ? lineDetails[selectedLineId] ?? null : null),
    [selectedLineId],
  );

  function renderOverviewTab() {
    return (
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
        {/* Top section: Viewer + Summary */}
        <Box sx={{display: 'grid', gridTemplateColumns: '1fr 380px', gap: 1.5, alignItems: 'start'}}>
          <SiteCapacityViewer
            lines={capacityLines}
            scenarios={capacityScenarios}
            months={MONTHS}
            selectedLineId={selectedLineId}
            onSelectLine={setSelectedLineId}
            selectedMonth={selectedMonth}
            onChangeMonth={setSelectedMonth}
            selectedScenario={selectedScenario}
            onChangeScenario={setSelectedScenario}
            factoryImage="/images/factory-floor.png"
          />
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
            <SiteCapacitySummaryPanel
              areas={capacitySiteAreas}
              selectedMonth={selectedMonth}
              selectedLineDetail={selectedLineDetail}
              selectedLineName={selectedLine?.name ?? null}
            />
            {selectedLineId && (
              <DailyCapacityProfileChart
                data={dailyCapacityProfile}
                lineName={selectedLine?.name ?? 'Line'}
                month={selectedMonth}
              />
            )}
          </Box>
        </Box>

        {/* Bottom: Table */}
        <CapacityByLineMonthTable data={capacityByLine} shiftSchedules={lineShiftSchedules} />
      </Box>
    );
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
      {/* Header */}
      <Paper elevation={0} sx={{...planningCardSx, px: 2.5, py: 1.5}}>
        {/* Breadcrumb */}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{mb: 0.8}}>
          <Typography sx={{fontSize: 11, color: planningTokens.textMuted}}>Production Planning</Typography>
          <Typography sx={{fontSize: 11, color: planningTokens.textMuted}}>›</Typography>
          <Typography sx={{fontSize: 11, color: planningTokens.textMuted}}>Capacity Planning</Typography>
          <Typography sx={{fontSize: 11, color: planningTokens.textMuted}}>›</Typography>
          <Typography sx={{fontSize: 11, color: planningTokens.primaryBlue, fontWeight: 600}}>May-2026 Reforecast</Typography>
        </Stack>

        {/* Title row */}
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.8}}>
          <Typography sx={{fontSize: 22, fontWeight: 900, color: planningTokens.textPrimary}}>
            Capacity Planning – May-2026
          </Typography>
          <Chip label="Draft" size="small" sx={{fontWeight: 700, fontSize: 11, bgcolor: 'var(--planning-surface-muted)', color: planningTokens.textSecondary, border: `1px solid ${planningTokens.border}`}} />
          <Tooltip title="Bookmark">
            <IconButton size="small" sx={{p: 0.4}}><BookmarkBorderIcon sx={{fontSize: 16}} /></IconButton>
          </Tooltip>
          <Box sx={{ml: 'auto', display: 'flex', gap: 1}}>            
            <Button variant="outlined" size="small" startIcon={<EditNoteIcon sx={{fontSize: 15}} />} sx={{fontSize: 11, fontWeight: 700, textTransform: 'none', height: 32, borderColor: planningTokens.border, color: planningTokens.textSecondary}}>
              Edit Capacity Assumptions
            </Button>            
          </Box>
        </Box>

        {/* Metadata bar */}
        <Stack direction="row" spacing={2} alignItems="center" divider={<Typography sx={{color: planningTokens.border}}>|</Typography>}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <CalendarMonthIcon sx={{fontSize: 13, color: planningTokens.textMuted}} />
            <Typography sx={{fontSize: 12, color: planningTokens.textSecondary}}>Horizon: <strong>12 months</strong></Typography>
          </Stack>
          <Typography sx={{fontSize: 12, color: planningTokens.textSecondary}}>Period: <strong>Jun-2026 – May-2027</strong></Typography>
          <Typography sx={{fontSize: 12, color: planningTokens.textSecondary}}>Site: <strong>All Sites</strong></Typography>
          <Typography sx={{fontSize: 12, color: planningTokens.textSecondary}}>Product Scope: <strong style={{color: planningTokens.primaryBlue}}>All Families</strong></Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <RefreshIcon sx={{fontSize: 13, color: planningTokens.textMuted}} />
            <Typography sx={{fontSize: 12, color: planningTokens.textSecondary}}>Last refresh: <strong>24-May-2026 10:42</strong></Typography>
          </Stack>
        </Stack>
      </Paper>

      {/* KPI Cards */}
      <CapacityKpiCards kpis={capacityKpis} />

      {/* Tabs */}
      <Paper elevation={0} sx={{...planningCardSx, px: 1.5}}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{minHeight: 40, '& .MuiTab-root': {fontSize: 12, fontWeight: 600, textTransform: 'none', minHeight: 40, py: 0.5}}}
        >
          {TABS.map((tab) => (
            <Tab key={tab.label} label={tab.label} icon={tab.icon} iconPosition="start" />
          ))}
        </Tabs>
      </Paper>

      {/* Tab content */}
      {activeTab === 0 && renderOverviewTab()}
      {activeTab === 1 && <ByLineTab />}
      {activeTab === 2 && <LineCapacityManagementTab />}
      {activeTab === 3 && <ComingSoon label="Scenarios" />}
      {activeTab === 4 && <ComingSoon label="Approval & Audit" />}
    </Box>
  );
}
