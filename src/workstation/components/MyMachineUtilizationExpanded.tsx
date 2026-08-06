import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {Box, Button, Chip, IconButton, MenuItem, Paper, Select, Typography} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  CalendarTodayOutlined as CalendarIcon,
  Close as CloseIcon,
  KeyboardArrowDown as ArrowDownIcon,
  TableChartOutlined as TableIcon,
  WarningAmberOutlined as WarningIcon,
} from '@mui/icons-material';

type MyMachineUtilizationExpandedProps = {
  onBack: () => void;
};

const stationRows = [
  {station: 'Station 243', tag: '1', value: '40.0', delta: '+ 18%', color: tokenError.light, width: 100},
  {station: 'Station 23452', value: '27.0', delta: '+ 5%', color: tokenError.main, width: 68},
  {station: 'Station 35252', tag: '2', value: '24.2', delta: '+ 3%', color: tokenError.main, width: 61},
  {station: 'Station 4563', value: '23.7', delta: '+ 2%', color: tokenBrand.light, width: 59},
  {station: 'Station 235', value: '7.0', delta: '+ 11%', color: tokenSuccess.lighter, width: 18},
  {station: 'Station 5252', value: '6.9', delta: '+ 7%', color: tokenSuccess.lighter, width: 17},
];

const paretoRows = [
  {name: 'Operator Stop', detail: 'Stn 243', distribution: 100, min: '40.0', occ: '26x', color: tokenError.darker, active: true},
  {name: 'Track 2 Consecutive Covers Missing', detail: '', distribution: 63, min: '27.0', occ: '32x', color: tokenError.main},
  {name: 'Starved From Zone 5 C20', detail: '', distribution: 59, min: '24.2', occ: '60x', color: tokenWarning.main},
  {name: 'Blocked to Zone 3', detail: '', distribution: 58, min: '23.7', occ: '31x', color: tokenInfo.darkest},
  {name: 'Bulk Bin Full (Setup Screen Reset)', detail: '', distribution: 16, min: '7.0', occ: '12x', color: tokenBrand.main},
  {name: 'Track 1 Consecutive Covers Missing', detail: '', distribution: 15, min: '6.9', occ: '7x', color: tokenBrand.main},
];

const insightRows = [
  {tone: 'critical', label: 'CRITICAL · OPERATOR STOP', title: 'Station 243 stops up 18% vs prior shift', body: 'CILT routine not executed in 8+ hours — this is the most likely root cause of the increase.', footer: '↑ 18% shift-over-shift', cta: 'View CILT →'},
  {tone: 'warning', label: 'WARNING · SKU CORRELATION', title: '74% of Cover Missing events on SKU-IC30,100_04', body: 'Audit cover feed before next run of SKU-IC30,100_04 to prevent recurrence.', footer: '↑ 74% on this SKU', cta: 'SKU history →'},
  {tone: 'warning', label: 'WARNING · PARAMETER OUT OF RANGE', title: 'Z5.C30.S14 Bulk Bin sensor above threshold', body: 'Sensor has been above threshold for 2.1 hrs. Setup Screen reset pending — unacknowledged.', footer: '+2.1 hrs unacknowledged', cta: 'Acknowledge →'},
  {tone: 'info', label: 'INFO · PEAK WINDOW', title: 'Most DT occurs between 02:00–03:00', body: '28 min peak correlates with shift changeover. Pre-shift CILT checklist is recommended.', footer: '28 min peak hour', cta: ''},
  {tone: 'good', label: 'IMPROVING · STARVATION', title: 'Starvation reduced after feeder adjustment', body: 'Short stoppages are trending down in the last two windows.', footer: '', cta: ''},
];

export default function MyMachineUtilizationExpanded({onBack}: MyMachineUtilizationExpandedProps) {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.4, bgcolor: tokenCommon.white, minHeight: 'calc(100vh - 150px)', p: {xs: 1.5, md: 2}, borderRadius: 1.5, overflow: 'hidden'}}>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <Typography sx={{fontSize: 20, fontWeight: 900, color: workstationVisuals.tierTextHeading}}>
          DT Details
        </Typography>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
          <AutoAwesomeIcon sx={{fontSize: 19, color: tokenInfo.lightest}} />
          <IconButton size="small" onClick={onBack} sx={{color: tokenBrand.main}}>
            <CloseIcon sx={{fontSize: 20}} />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(6, minmax(128px, 1fr)) auto auto', gap: 1.2, alignItems: 'end', minWidth: 0}}>
        <Filter label="Lines" value="NEXIVA 20 GA X 1 IN..." />
        <Filter label="Zones" value="NEXIVA  ZONE #8" />
        <Filter label="Machine" value="Machine 4" />
        <DateFilter label="Start Date" />
        <DateFilter label="End Date" />
        <Filter label="Time Range" value="Value" />
        <Button variant="outlined" sx={{height: 36, px: 3.2, fontSize: 12, fontWeight: 800}}>CLEAR</Button>
        <Button variant="contained" sx={{height: 36, px: 3.2, fontSize: 12, fontWeight: 800, bgcolor: tokenBrand.main}}>APPLY</Button>
      </Box>

      <Typography sx={{fontSize: 16, color: tokenBrand.darker, mt: 1}}>
        Downtime Details | Line 12 : Z1C10
      </Typography>

      <Box sx={{display: 'grid', gridTemplateColumns: '2fr 2.45fr 2.15fr', gap: 1.4, borderTop: `1px solid ${tokenNeutral.main}`, pt: 1.3, minWidth: 0}}>
        <Box>
          <Box sx={{height: 44, display: 'flex', alignItems: 'center', gap: 1.6, pl: 1}}>
            <DatePill label="04/01/26" />
            <DatePill label="Last Hour" muted />
          </Box>
        </Box>
        <MetricsStrip />
        <TopLossBanner />
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: '1.04fr 1.32fr 1.12fr', gap: 1.4, minHeight: 0, minWidth: 0}}>
        <DowntimeByStation />
        <DowntimePareto />
        <AiInsights />
      </Box>
    </Box>
  );
}

function Filter({label, value}: {label: string; value: string}) {
  return (
    <Box>
      <Typography sx={{fontSize: 10, color: workstationVisuals.tierTextMeta, lineHeight: 1.2, mb: 0.25}}>{label}</Typography>
      <Select
        value={value}
        size="small"
        IconComponent={ArrowDownIcon}
        sx={{width: '100%', height: 36, borderRadius: 1.2, fontSize: 12, '& .MuiSelect-select': {py: 0.6, pr: '28px !important'}}}
      >
        <MenuItem value={value}>{value}</MenuItem>
      </Select>
    </Box>
  );
}

function DateFilter({label}: {label: string}) {
  return (
    <Box>
      <Typography sx={{fontSize: 10, color: workstationVisuals.tierTextMeta, lineHeight: 1.2, mb: 0.25}}>{label}</Typography>
      <Box sx={{height: 36, border: `1px solid ${tokenNeutral.dark}`, borderRadius: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, color: workstationVisuals.textMuted, fontSize: 12, whiteSpace: 'nowrap'}}>
        MM/DD/YYYY
        <CalendarIcon sx={{fontSize: 17, color: tokenBrand.main}} />
      </Box>
    </Box>
  );
}

function DatePill({label, muted = false}: {label: string; muted?: boolean}) {
  return (
    <Box>
      <Typography sx={{fontSize: 10, color: workstationVisuals.tierTextMeta, mb: 0.25}}> {muted ? 'Range' : 'Date'} </Typography>
      <Box sx={{height: 36, minWidth: 122, border: `1px solid ${tokenNeutral.dark}`, borderRadius: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, fontSize: 12}}>
        {label}
        {muted ? <ArrowDownIcon sx={{fontSize: 16, color: workstationVisuals.textSecondary}} /> : <CalendarIcon sx={{fontSize: 14, color: tokenBrand.main}} />}
      </Box>
    </Box>
  );
}

function MetricsStrip() {
  const metrics = [
    ['179.2', 'Total DT Min', tokenError.darker],
    ['235', 'Occurrences', tokenBrand.dark],
    ['0.19%', 'Cell DT %', tokenError.darker],
    ['94.3%', 'Running %', tokenSuccess.darker],
    ['2.99 h', 'Down Hours', tokenError.main],
    ['3.1%', 'Scrap Rate', tokenError.darker],
  ];
  return (
    <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', alignItems: 'center', height: 41}}>
      {metrics.map(([value, label, color]) => (
        <Box key={label} sx={{textAlign: 'center', borderLeft: `1px solid ${tokenNeutral.lighter}`}}>
          <Typography sx={{fontSize: 13, fontWeight: 900, color}}>{value}</Typography>
          <Typography sx={{fontSize: 8, color: workstationVisuals.textSecondary}}>{label}</Typography>
        </Box>
      ))}
    </Box>
  );
}

function TopLossBanner() {
  return (
    <Box sx={{minHeight: 40, bgcolor: tokenNeutral.lightest, display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.6, color: tokenError.darkest, fontSize: 11, fontWeight: 900, overflow: 'hidden'}}>
      <WarningIcon sx={{fontSize: 17}} />
      <Box sx={{minWidth: 0}}>
        <Box>▲ TOP LOSS - LINE 12 ZONE 5B</Box>
        <Typography component="span" sx={{fontSize: 11, color: workstationVisuals.textPrimary, fontWeight: 500, lineHeight: 1.25}}>Station 243 — Operator Stop — 40.0 min DT · 26 occurrences</Typography>
      </Box>
    </Box>
  );
}

function DowntimeByStation() {
  return (
    <Paper elevation={0} sx={{border: `1px solid ${tokenNeutral.main}`, borderRadius: 0, overflow: 'hidden'}}>
      <SectionHeader title="DOWNTIME BY STATION" />
      <Box sx={{p: 2.1, display: 'flex', flexDirection: 'column', gap: 2.4}}>
        {stationRows.map((row) => (
          <Box key={row.station}>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8}}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                <Typography sx={{fontSize: 12, color: workstationVisuals.textPrimary}}>{row.station}</Typography>
                {row.tag ? <Chip label={row.tag} sx={{height: 14, fontSize: 9, bgcolor: tokenNeutral.lighter, color: tokenWarning.dark, border: `1px solid ${tokenWarning.lighter}`}} /> : null}
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1.2}}>
                <Chip label={row.delta} sx={{height: 20, fontSize: 10, bgcolor: row.delta.includes('11') || row.delta.includes('7') || row.delta.includes('3') ? tokenNeutral.lighter : tokenNeutral.lighter, color: row.delta.includes('11') || row.delta.includes('7') || row.delta.includes('3') ? tokenSuccess.darker : tokenError.darker, fontWeight: 800}} />
                <Typography sx={{fontSize: 15, color: workstationVisuals.tierTextHeading, fontWeight: 900}}>{row.value}</Typography>
                <Typography sx={{fontSize: 11, color: workstationVisuals.tierTextHeading, fontWeight: 900}}>min</Typography>
              </Box>
            </Box>
            <Box sx={{height: 5, bgcolor: tokenNeutral.lighter, borderRadius: 2, overflow: 'hidden'}}>
              <Box sx={{height: '100%', width: `${row.width}%`, bgcolor: row.color, borderRadius: 2}} />
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

function DowntimePareto() {
  return (
    <Paper elevation={0} sx={{border: `1px solid ${tokenNeutral.main}`, borderRadius: 0, overflow: 'hidden'}}>
      <SectionHeader title="DOWNTIME BY CODE · AVAILABILITY PARETO" />
      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 90px 54px 44px', px: 1.1, py: 0.8, fontSize: 9, color: workstationVisuals.textSecondary}}>
        <Box>↓ Click row to expand station breakdown</Box>
        <Box>Distribution</Box>
        <Box>Min DT</Box>
        <Box>Occ</Box>
      </Box>
      {paretoRows.map((row) => (
        <Box key={row.name} sx={{display: 'grid', gridTemplateColumns: '1fr 90px 54px 44px', alignItems: 'center', px: 1.1, py: row.active ? 1.2 : 1, bgcolor: row.active ? tokenNeutral.lighter : tokenCommon.white, borderTop: `1px solid ${tokenNeutral.lighter}`}}>
          <Box>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8}}>
              <Box sx={{width: 7, height: 7, borderRadius: '50%', bgcolor: row.color}} />
              <Typography sx={{fontSize: 12, color: workstationVisuals.textPrimary}}>{row.name}</Typography>
            </Box>
            {row.detail ? <Typography sx={{fontSize: 9, color: workstationVisuals.textSecondary, mt: 1.5, ml: 3.2}}>{row.detail}</Typography> : null}
          </Box>
          <Box sx={{height: 5, bgcolor: tokenNeutral.main, borderRadius: 2, overflow: 'hidden'}}>
            <Box sx={{height: '100%', width: `${row.distribution}%`, bgcolor: row.color, borderRadius: 2}} />
          </Box>
          <Typography sx={{fontSize: 12, fontWeight: 900, textAlign: 'right', pr: 1}}>{row.min}<br /><Box component="span" sx={{fontSize: 10, fontWeight: 500}}>min</Box></Typography>
          <Typography sx={{fontSize: 10, color: workstationVisuals.textSecondary}}>{row.occ}</Typography>
        </Box>
      ))}
    </Paper>
  );
}

function AiInsights() {
  return (
    <Paper elevation={0} sx={{border: `1px solid ${tokenNeutral.main}`, borderRadius: 0, overflow: 'hidden'}}>
      <Box sx={{height: 34, px: 1.2, bgcolor: tokenBrand.dark, color: tokenCommon.white, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Typography sx={{fontSize: 13, fontWeight: 900}}>AI INSIGHTS</Typography>
        <Chip label="Last 24h" sx={{height: 18, fontSize: 9, bgcolor: 'rgba(255,255,255,0.22)', color: tokenCommon.white}} />
      </Box>
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.8, p: 0.8}}>
        {insightRows.map((item) => {
          const tone = item.tone === 'critical'
            ? {bg: tokenNeutral.lightest, border: tokenError.light, color: tokenError.darkest}
            : item.tone === 'warning'
              ? {bg: tokenNeutral.lightest, border: tokenWarning.dark, color: tokenError.main}
              : item.tone === 'info'
                ? {bg: tokenNeutral.lightest, border: tokenBrand.light, color: tokenBrand.main}
                : {bg: tokenNeutral.lighter, border: tokenSuccess.dark, color: tokenSuccess.darkest};

          return (
            <Box key={item.label} sx={{borderLeft: `4px solid ${tone.border}`, bgcolor: tone.bg, p: 1.2}}>
              <Typography sx={{fontSize: 9, color: tone.color, fontWeight: 900}}>{item.label}</Typography>
              <Typography sx={{fontSize: 11, color: workstationVisuals.textPrimary, fontWeight: 900, mt: 0.6}}>{item.title}</Typography>
              <Typography sx={{fontSize: 10, color: workstationVisuals.tierTextHeading, mt: 0.4, lineHeight: 1.35}}>{item.body}</Typography>
              <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 0.8}}>
                <Typography sx={{fontSize: 9, color: tone.color, fontWeight: 800}}>{item.footer}</Typography>
                <Typography sx={{fontSize: 9, color: tokenInfo.darkest, fontWeight: 800}}>{item.cta}</Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}

function SectionHeader({title}: {title: string}) {
  return (
    <Box sx={{height: 34, px: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${tokenNeutral.lighter}`}}>
      <Typography sx={{fontSize: 11, color: workstationVisuals.tierTextHeading, fontWeight: 700}}>{title}</Typography>
      <Box sx={{display: 'flex', gap: 0.6}}>
        <Box sx={{width: 24, height: 22, border: `1px solid ${tokenNeutral.main}`, borderRadius: 0.7, display: 'grid', placeItems: 'center', color: tokenBrand.main}}>
          <AutoAwesomeIcon sx={{fontSize: 13}} />
        </Box>
        <Box sx={{width: 24, height: 22, border: `1px solid ${tokenNeutral.main}`, borderRadius: 0.7, display: 'grid', placeItems: 'center', color: workstationVisuals.textSecondary}}>
          <TableIcon sx={{fontSize: 13}} />
        </Box>
      </Box>
    </Box>
  );
}
