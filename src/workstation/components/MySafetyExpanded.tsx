import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {useState} from 'react';
import {Box, Button, Chip, IconButton, Paper, Typography} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Edit as EditIcon,
  OpenInFull as ExpandIcon,
  Search as SearchIcon,
  Send as SendIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import {BarChart} from '@mui/x-charts/BarChart';
import {LineChart} from '@mui/x-charts/LineChart';
import {reorderCalendarYearToTierYear, tierChartMonths} from './tierChartMonths';

type MySafetyExpandedProps = {
  onBack: () => void;
  onCustomize?: () => void;
  visibleKpis?: string[];
};

const esosBbs = reorderCalendarYearToTierYear([62, 74, 75, 74, 74, 74, 42, 75, 74, 74, 75, 74]);
const esosCondition = reorderCalendarYearToTierYear([66, 76, 78, 78, 78, 78, 46, 76, 78, 78, 77, 78]);
const esosNearMiss = reorderCalendarYearToTierYear([66, 75, 75, 78, 77, 76, 48, 75, 76, 77, 76, 75]);
const incidentsFatality = reorderCalendarYearToTierYear([30, 35, 29, 27, 26, 35, 29, 34, 35, 35, 35, 34]);
const incidentsSerious = reorderCalendarYearToTierYear([31, 37, 31, 25, 29, 38, 30, 38, 38, 37, 37, 38]);
const incidentsMinor = reorderCalendarYearToTierYear([32, 37, 31, 25, 30, 38, 29, 38, 38, 38, 38, 38]);
const incidentsNearMiss = reorderCalendarYearToTierYear([35, 39, 34, 28, 30, 38, 31, 38, 40, 40, 39, 40]);
const incidentsFirstAid = reorderCalendarYearToTierYear([34, 39, 33, 27, 31, 39, 32, 38, 40, 39, 39, 39]);
const incidentsMedical = reorderCalendarYearToTierYear([33, 40, 32, 27, 31, 38, 31, 37, 39, 39, 39, 38]);
const gemba = reorderCalendarYearToTierYear([200, 218, 214, 125, 220, 156, 218, 166, 88, 165, 200, 145]);
const actionItems = [
  'Unexpected temperature fluctuations observed in ...',
  'Visual inspection reveals defects in painted surfaces',
  'Component alignment out of specification noted in recent ...',
];

const unsafeReports = [
  {title: 'Exposed Wiring in Unit 4', owner: "Ronnie D'elano", status: 'OPEN', color: tokenInfo.lighter, avatar: tokenWarning.light},
  {title: 'Exposed Wiring in Unit 4', owner: "Ronnie D'elano", status: 'OPEN', color: tokenInfo.lighter, avatar: tokenWarning.light},
  {title: 'Oil Spill near Packaging Line', owner: 'Carlos Mendez', status: 'OPEN', color: tokenInfo.lighter, avatar: tokenError.lighter},
  {title: 'Oil Spill near Packaging Line', owner: 'Carlos Mendez', status: 'UNDER INVESTIGATION', color: workstationVisuals.textMuted, avatar: tokenError.lighter},
  {title: 'Loose Safety Gate on Machine 12', owner: 'Maria Pinna', status: 'UNDER INVESTIGATION', color: workstationVisuals.textMuted, avatar: workstationVisuals.textMuted},
  {title: 'Loose Safety Gate on Machine 12', owner: 'Maria Pinna', status: 'ACTION PLAN DEFINED', color: tokenError.lighter, avatar: workstationVisuals.textMuted},
  {title: 'Loose Safety Gate on Machine 12', owner: 'John Joshua', status: 'CLOSED', color: tokenSuccess.main, avatar: tokenWarning.darker},
];

const esoStatusItems = [
  {label: 'Open', value: 38, color: tokenInfo.lighter},
  {label: 'Action Plan Defined', value: 24, color: tokenError.lighter},
  {label: 'Under Investigation', value: 26, color: workstationVisuals.textMuted},
  {label: 'Closed', value: 12, color: tokenSuccess.main},
];

const safetyMetricCards = [
  {label: 'Fatality', value: '0', target: '0'},
  {label: 'Serious Injury', value: '3', target: '1', tone: 'bad' as const},
  {label: 'Minor Injury', value: '12', target: '4', tone: 'warning' as const},
  {label: 'Near Misses', value: '2', target: '2'},
  {label: 'Unsafe Act', value: '6', target: '7'},
  {label: 'Submitted ESO', value: '4', target: '2'},
];

const overlaySx = {
  position: 'fixed',
  inset: 0,
  zIndex: 1500,
  overflowY: 'auto',
  bgcolor: 'rgba(2,6,23,0.55)',
  p: {xs: 1, md: 0},
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
} as const;

const shellSx = {
  width: 'min(1800px, calc(100vw - 12px))',
  maxHeight: 'calc(100vh - 12px)',
  overflowY: 'auto',
  p: 4,
  borderRadius: 2.5,
  bgcolor: tokenNeutral.lightest,
  border: `2px solid ${tokenBrand.darker}`,
  boxShadow: '0 24px 70px rgba(15,23,42,0.28)',
} as const;

const chartCardSx = {
  p: 2,
  border: `1px solid ${tokenNeutral.dark}`,
  borderRadius: 2,
  bgcolor: tokenNeutral.lighter,
} as const;

function KpiCard({
  label,
  target,
  value,
  tone = 'neutral',
}: {
  label: string;
  target: string;
  value: string;
  tone?: 'neutral' | 'good' | 'bad' | 'warning';
}) {
  const toneSx = {
    good: {bar: tokenSuccess.dark, bg: tokenNeutral.lighter, color: workstationVisuals.textPrimary},
    bad: {bar: tokenError.dark, bg: tokenNeutral.lightest, color: tokenError.dark},
    warning: {bar: tokenError.dark, bg: tokenError.lightest, color: workstationVisuals.textPrimary},
    neutral: {bar: tokenSuccess.dark, bg: tokenNeutral.lighter, color: workstationVisuals.textPrimary},
  }[tone];

  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: 66,
        p: 1.15,
        pl: 1.6,
        borderRadius: 1,
        bgcolor: toneSx.bg,
        border: `1px solid ${tokenNeutral.main}`,
        borderLeft: `5px solid ${toneSx.bar}`,
        boxShadow: '0 2px 8px rgba(15,23,42,0.12)',
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1}}>
        <Box>
          <Typography sx={{fontSize: 34, lineHeight: 1, fontWeight: 400, color: toneSx.color}}>{value}</Typography>
          <Typography sx={{fontSize: 12, color: tone === 'bad' ? tokenError.dark : workstationVisuals.textPrimary, mt: 0.35}}>{label}</Typography>
        </Box>
        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', pt: 0.5}}>
          <Typography sx={{fontSize: 9, fontWeight: 800, color: workstationVisuals.tierTextLabel}}>TARGET</Typography>
          <Chip label={target} size="small" sx={{height: 18, minWidth: 18, fontSize: 10, fontWeight: 800, bgcolor: tokenNeutral.dark}} />
        </Box>
      </Box>
    </Paper>
  );
}

function ActionsPanel() {
  return (
    <Paper elevation={0} sx={{border: `1px solid ${tokenNeutral.dark}`, borderRadius: 2, overflow: 'hidden', bgcolor: tokenNeutral.lighter}}>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.7, py: 1.2}}>
        <Typography sx={{fontSize: 18, fontWeight: 900}}>Actions</Typography>
        <SearchIcon sx={{fontSize: 20, color: tokenInfo.lighter}} />
      </Box>
      <Box sx={{px: 1.7, pb: 1.4}}>
        {actionItems.map((item, index) => (
          <Paper key={item} elevation={0} sx={{display: 'flex', alignItems: 'center', gap: 1, p: 0.8, mb: 0.55, borderRadius: 1, border: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenCommon.white, boxShadow: '0 1px 2px rgba(15,23,42,0.12)'}}>
            <Box sx={{width: 4, alignSelf: 'stretch', borderRadius: 1, bgcolor: index === 2 ? tokenWarning.main : tokenError.main}} />
            <Typography sx={{fontSize: 13.5, color: workstationVisuals.textPrimary, lineHeight: 1.15}}>{item}</Typography>
          </Paper>
        ))}
        <Typography sx={{fontSize: 18, textAlign: 'right', color: workstationVisuals.textPrimary, mt: 0.2}}>+2</Typography>
      </Box>
      <Box sx={{px: 1.7, py: 1, borderTop: `1px solid ${tokenNeutral.dark}`}}>
        <Typography sx={{fontSize: 14, fontWeight: 500}}><b>8</b> Completed</Typography>
      </Box>
    </Paper>
  );
}

function CommentsPanel() {
  return (
    <Paper elevation={0} sx={{p: 2, border: `1px solid ${tokenNeutral.dark}`, borderRadius: 2, bgcolor: tokenNeutral.lighter}}>
      <Typography sx={{fontSize: 18, fontWeight: 900, mb: 1.2}}>Comments</Typography>
      {[
        ['We had a weak quarter due to market reasons beyond our control.', 'John Smith', 'Mar 18, 11:41'],
        ['We will manage our margins to minimize risks.', 'Maria Pinna', 'Mar 18, 09:20'],
      ].map(([text, author, time]) => (
        <Paper key={text} elevation={0} sx={{p: 1.2, mb: 1, borderRadius: 2, border: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenNeutral.main}}>
          <Typography sx={{fontSize: 13.5, lineHeight: 1.4, color: workstationVisuals.textPrimary}}>{text}</Typography>
          <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 0.6}}>
            <Typography sx={{fontSize: 11.5, color: workstationVisuals.tierTextMeta}}>{author}</Typography>
            <Typography sx={{fontSize: 11.5, color: workstationVisuals.tierTextMeta}}>{time}</Typography>
          </Box>
        </Paper>
      ))}
      <Button
        fullWidth
        variant="outlined"
        endIcon={<SendIcon />}
        sx={{height: 40, borderRadius: 2, justifyContent: 'space-between', color: tokenInfo.darkest, borderColor: tokenInfo.darkest, textTransform: 'none', fontSize: 16}}
      >
        Leave a Comment
      </Button>
    </Paper>
  );
}

function InsightsPanel() {
  return (
    <Paper elevation={0} sx={{p: 2, minHeight: 276, border: `1px solid ${tokenNeutral.dark}`, borderRadius: 2, bgcolor: tokenNeutral.lighter}}>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2}}>
        <Typography sx={{display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 16, fontWeight: 900, color: tokenBrand.main}}>
          <AutoAwesomeIcon sx={{fontSize: 19, color: tokenWarning.dark}} /> BLU.AI INSIGHTS
        </Typography>
        <ExpandIcon sx={{fontSize: 18, color: tokenBrand.main}} />
      </Box>
      {[
        ['Critical Bottleneck', 'Zone 5A is operating at 78.3 PPM (35% below Target). This is triggering a ...'],
        ['Downtime Risk', 'Based on current trend, Line 8 has a high probability of unplanned stop before end o...'],
      ].map(([title, body]) => (
        <Paper key={title} elevation={0} sx={{p: 1.2, mb: 1.2, borderRadius: 2, border: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenNeutral.main}}>
          <Typography sx={{display: 'flex', alignItems: 'center', gap: 0.7, fontSize: 15.5, fontWeight: 900, color: workstationVisuals.tierTextHeading}}>
            <WarningAmberIcon sx={{fontSize: 17, color: tokenError.main}} /> {title}
          </Typography>
          <Typography sx={{fontSize: 12.3, color: workstationVisuals.textPrimary, lineHeight: 1.2, mt: 0.2}}>{body}</Typography>
        </Paper>
      ))}
    </Paper>
  );
}

function EsoStatCard({
  accent,
  label,
  suffix,
  value,
}: {
  accent: string;
  label: string;
  suffix?: string;
  value: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        height: 68,
        boxSizing: 'border-box',
        pt: '8px',
        pr: '12px',
        pb: '8px',
        pl: '12px',
        borderRadius: 1,
        bgcolor: tokenNeutral.lighter,
        border: `1px solid ${tokenNeutral.dark}`,
        borderLeft: `5px solid ${accent}`,
        boxShadow: '0 1px 5px rgba(15,23,42,0.12)',
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 0.5}}>
        <Typography sx={{fontSize: 34, lineHeight: 0.9, fontWeight: 400, color: workstationVisuals.tierTextHeading}}>{value}</Typography>
        {suffix ? <Typography sx={{fontSize: 13, color: workstationVisuals.tierTextHeading, mt: 0.4}}>{suffix}</Typography> : null}
      </Box>
      <Typography sx={{fontSize: 11.5, lineHeight: 1.05, color: workstationVisuals.tierTextHeading, mt: 0.35}}>{label}</Typography>
    </Paper>
  );
}

function EsoReportList() {
  return (
    <Paper elevation={0} sx={{height: 537, boxSizing: 'border-box', p: '18px 19px', border: `1px solid ${tokenNeutral.dark}`, borderRadius: 1.2, bgcolor: tokenNeutral.lightest}}>
      <Typography sx={{fontSize: 16, fontWeight: 900, mb: '10px', color: workstationVisuals.tierTextHeading}}>Recent Unsafe Condition Reports</Typography>
      <Box sx={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
        {unsafeReports.map((report, index) => (
          <Paper
            key={`${report.title}-${index}`}
            elevation={0}
            sx={{
              height: 58,
              boxSizing: 'border-box',
              px: '14px',
              py: '9px',
              borderRadius: 0.8,
              border: `1px solid ${tokenNeutral.dark}`,
              bgcolor: tokenCommon.white,
              boxShadow: '0 1px 2px rgba(15,23,42,0.14)',
            }}
          >
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1}}>
              <Box sx={{minWidth: 0}}>
                <Typography sx={{fontSize: 13.5, fontWeight: 900, color: workstationVisuals.tierTextHeading, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                  {report.title}
                </Typography>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.45}}>
                  <Box sx={{width: 14, height: 14, borderRadius: '50%', bgcolor: report.avatar, border: '1px solid rgba(0,0,0,0.15)', boxShadow: 'inset 0 -5px 0 rgba(120,60,30,0.18)'}} />
                  <Typography sx={{fontSize: 12, color: workstationVisuals.tierTextMeta}}>{report.owner}</Typography>
                </Box>
              </Box>
              <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0}}>
                <Chip
                  label={report.status}
                  size="small"
                  sx={{
                    height: 18,
                    borderRadius: 10,
                    bgcolor: report.color,
                    color: workstationVisuals.textPrimary,
                    fontSize: 9,
                    fontWeight: 900,
                    letterSpacing: '0.05em',
                    px: 0.4,
                    '& .MuiChip-label': {px: 1},
                  }}
                />
                <Typography sx={{fontSize: 12, color: workstationVisuals.tierTextMeta, mt: 0.45}}>08:20 AM</Typography>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    </Paper>
  );
}

function EsoStatusPanel() {
  const donutGradient = `conic-gradient(${esoStatusItems[0].color} 0 38%, ${esoStatusItems[1].color} 38% 62%, ${esoStatusItems[2].color} 62% 88%, ${esoStatusItems[3].color} 88% 100%)`;

  return (
    <Paper elevation={0} sx={{height: 537, boxSizing: 'border-box', p: '18px 20px', border: `1px solid ${tokenNeutral.dark}`, borderRadius: 1.2, bgcolor: tokenNeutral.lightest}}>
      <Typography sx={{fontSize: 16, fontWeight: 900, color: workstationVisuals.tierTextHeading}}>Status</Typography>
      <Box sx={{height: 285, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Box
          sx={{
            width: 220,
            height: 220,
            borderRadius: '50%',
            bgcolor: tokenInfo.lighter,
            background: donutGradient,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 22,
              borderRadius: '50%',
              bgcolor: tokenNeutral.lightest,
            },
          }}
        >
          <Box sx={{position: 'absolute', inset: 0, zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <Typography sx={{fontSize: 36, lineHeight: 1, fontWeight: 400, color: workstationVisuals.tierTextHeading}}>213</Typography>
            <Typography sx={{fontSize: 14, color: workstationVisuals.tierTextLabel}}>Total ESOs</Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', rowGap: '19px', columnGap: '50px', width: 320, mx: 'auto'}}>
        {esoStatusItems.map((item) => (
          <Box key={item.label} sx={{display: 'flex', alignItems: 'center', gap: 1}}>
            <Box sx={{width: 22, height: 22, borderRadius: '50%', bgcolor: item.color, flexShrink: 0}} />
            <Box>
              <Typography sx={{fontSize: 16, lineHeight: 1, fontWeight: 900, color: workstationVisuals.tierTextHeading}}>{item.value}%</Typography>
              <Typography sx={{fontSize: 14, lineHeight: 1.1, color: workstationVisuals.tierTextLabel}}>{item.label}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

function EsoActionsPanel() {
  return (
    <Paper elevation={0} sx={{height: 197, boxSizing: 'border-box', border: `1px solid ${tokenNeutral.dark}`, borderRadius: 1.2, overflow: 'hidden', bgcolor: tokenNeutral.lightest}}>
      <Box sx={{height: 51, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '10px', py: 0, borderBottom: `1px solid ${tokenNeutral.dark}`}}>
        <Typography sx={{fontSize: 16, fontWeight: 900}}>Actions</Typography>
        <SearchIcon sx={{fontSize: 20, color: tokenInfo.lighter}} />
      </Box>
      <Box sx={{height: 103, boxSizing: 'border-box', px: '10px', pt: '10px'}}>
        <Paper elevation={0} sx={{display: 'flex', alignItems: 'center', gap: 0.9, height: 39, px: 0.8, borderRadius: 0.6, border: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenCommon.white, boxShadow: '0 1px 2px rgba(15,23,42,0.12)'}}>
          <Box sx={{width: 4, height: 29, borderRadius: 1, bgcolor: tokenError.dark}} />
          <Typography sx={{fontSize: 14, color: workstationVisuals.tierTextHeading, lineHeight: 1.05}}>Unexpected temperature fluctuations observed in ...</Typography>
        </Paper>
        <Typography sx={{fontSize: 16, textAlign: 'right', color: workstationVisuals.tierTextHeading, mt: 0.5, lineHeight: 1}}>+2</Typography>
      </Box>
      <Box sx={{height: 41, boxSizing: 'border-box', px: '14px', py: '9px', borderTop: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenNeutral.main}}>
        <Typography sx={{fontSize: 14, color: workstationVisuals.tierTextHeading}}><b>8</b> Completed</Typography>
      </Box>
    </Paper>
  );
}

function EsoCommentsPanel() {
  return (
    <Paper elevation={0} sx={{height: 196, p: 2, border: `1px solid ${tokenNeutral.dark}`, borderRadius: 1.2, bgcolor: tokenNeutral.lightest, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
      <Typography sx={{fontSize: 16, fontWeight: 900}}>Comments</Typography>
      <Button
        fullWidth
        variant="outlined"
        endIcon={<SendIcon sx={{fontSize: 28}} />}
        sx={{height: 41, borderRadius: 1.2, justifyContent: 'space-between', color: tokenInfo.darkest, borderColor: tokenInfo.darkest, textTransform: 'none', fontSize: 16, px: 1.4}}
      >
        Leave a Comment
      </Button>
    </Paper>
  );
}

function EsoInsightsPanel() {
  return (
    <Paper elevation={0} sx={{height: 197, boxSizing: 'border-box', p: '16px 19px', border: `1px solid ${tokenNeutral.dark}`, borderRadius: 1.2, bgcolor: tokenNeutral.lightest}}>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2}}>
        <Typography sx={{display: 'flex', alignItems: 'center', gap: 0.45, fontSize: 16, fontWeight: 900, color: tokenBrand.main}}>
          <AutoAwesomeIcon sx={{fontSize: 19, color: tokenWarning.dark}} /> BLU.AI INSIGHTS
        </Typography>
        <ExpandIcon sx={{fontSize: 18, color: tokenBrand.main}} />
      </Box>
      <Paper elevation={0} sx={{p: 1.2, borderRadius: 1, border: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenNeutral.lighter}}>
        <Typography sx={{display: 'flex', alignItems: 'center', gap: 0.6, fontSize: 15.5, fontWeight: 900, color: workstationVisuals.tierTextHeading}}>
          <WarningAmberIcon sx={{fontSize: 17, color: tokenError.main}} /> Critical Bottleneck
        </Typography>
        <Typography sx={{fontSize: 12.3, color: workstationVisuals.tierTextHeading, lineHeight: 1.15, mt: 0.2}}>
          Zone 5A is operating at 78.3 PPM (35% below Target). This is triggering a ...
        </Typography>
      </Paper>
    </Paper>
  );
}

function EsoDrilldown({onClose}: {onClose: () => void}) {
  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 1600, bgcolor: 'rgba(2,6,23,0.56)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
      <Paper
        elevation={0}
        sx={{
          width: 'min(1408px, calc(100vw - 14px))',
          height: 'min(714px, calc(100vh - 12px))',
          boxSizing: 'border-box',
          p: '18px 38px 39px',
          borderRadius: 1.2,
          bgcolor: tokenNeutral.lightest,
          border: `1px solid ${tokenInfo.lightest}`,
          boxShadow: '0 24px 70px rgba(15,23,42,0.35)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{height: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '17px'}}>
          <Typography sx={{fontSize: 16, color: tokenNeutral.darkest, fontWeight: 900}}>
            Safety <Box component="span" sx={{fontWeight: 500}}>&gt;</Box> <Box component="span" sx={{color: workstationVisuals.tierTextHeading}}>ESOs</Box>
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{color: tokenBrand.main}}>
            <ExpandIcon sx={{fontSize: 20}} />
          </IconButton>
        </Box>

        <Box sx={{display: 'grid', gridTemplateColumns: '494px 494px 320px', gridTemplateRows: '68px 537px', columnGap: '10px', rowGap: '10px'}}>
          <Box sx={{gridColumn: '1 / span 2', gridRow: 1, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px'}}>
            <EsoStatCard accent={tokenSuccess.dark} value="+24.5" suffix="%" label="Vs Previous Period" />
            <EsoStatCard accent={tokenSuccess.dark} value="89" suffix="%" label="Resolved Rate" />
            <EsoStatCard accent={tokenNeutral.darkest} value="12" suffix="h" label="Avg Closure Time" />
          </Box>
          <Box sx={{gridColumn: 1, gridRow: 2}}>
            <EsoReportList />
          </Box>
          <Box sx={{gridColumn: 2, gridRow: 2}}>
            <EsoStatusPanel />
          </Box>
          <Box sx={{gridColumn: 3, gridRow: '1 / span 2', display: 'flex', flexDirection: 'column', gap: '10px'}}>
            <EsoActionsPanel />
            <EsoCommentsPanel />
            <EsoInsightsPanel />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

function TimeToggle() {
  return (
    <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 0.45, mt: 1, mb: 1.4}}>
      {['HOUR', 'SHIFT', 'DAY', 'MONTH', 'YEAR'].map((label, index) => (
        <Chip
          key={`${label}-${index}`}
          label={label}
          size="small"
          sx={{
            height: 18,
            minWidth: 44,
            borderRadius: 10,
            bgcolor: index === 4 ? tokenBrand.main : tokenNeutral.main,
            color: index === 4 ? tokenCommon.white : workstationVisuals.textPrimary,
            fontSize: 9,
            fontWeight: 900,
          }}
        />
      ))}
    </Box>
  );
}

export default function MySafetyExpanded({onBack, onCustomize, visibleKpis}: MySafetyExpandedProps) {
  const [isEsoDrilldownOpen, setIsEsoDrilldownOpen] = useState(false);
  const isKpiVisible = (label: string) => !visibleKpis || visibleKpis.includes(label);
  const visibleMetricCards = safetyMetricCards.filter((metric) => !visibleKpis || visibleKpis.includes(metric.label));

  return (
    <Box sx={overlaySx}>
      <Paper elevation={0} sx={shellSx}>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.4}}>
          <Typography sx={{fontSize: 18, fontWeight: 900, color: workstationVisuals.tierTextHeading}}>Safety</Typography>
          <IconButton onClick={onBack} size="small" sx={{color: tokenBrand.main}}>
            <ExpandIcon sx={{fontSize: 20}} />
          </IconButton>
        </Box>

        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'minmax(0,1fr) 320px'}, gap: 1.2}}>
          <Box sx={{position: 'relative', minWidth: 0, pb: 5.2}}>
            <Box sx={{display: 'grid', gridTemplateColumns: {xs: 'repeat(2, minmax(0,1fr))', md: 'repeat(3, minmax(0,1fr))', xl: 'repeat(6, minmax(0,1fr))'}, gap: 1.2}}>
              {visibleMetricCards.map((metric) => <KpiCard key={metric.label} {...metric} />)}
            </Box>
            <TimeToggle />

            <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'repeat(2, minmax(0,1fr))'}, gap: 1.2}}>
              {isKpiVisible('ESOs') ? (
                <Paper elevation={0} sx={chartCardSx}>
                  <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 0.8}}>
                    <Typography sx={{fontSize: 16, fontWeight: 900}}>ESOs</Typography>
                    <IconButton
                      onClick={() => setIsEsoDrilldownOpen(true)}
                      size="small"
                      sx={{color: tokenBrand.main, p: 0.2}}
                      aria-label="Open ESOs drill-down"
                    >
                      <ExpandIcon sx={{fontSize: 17}} />
                    </IconButton>
                  </Box>
                  <BarChart
                    height={285}
                    margin={{top: 8, right: 10, bottom: 42, left: 36}}
                    xAxis={[{scaleType: 'band', data: tierChartMonths}]}
                    series={[
                      {data: esosBbs, stack: 'eso', color: tokenInfo.light, label: 'Behavior-Based Observation'},
                      {data: esosCondition, stack: 'eso', color: tokenError.lighter, label: 'Condition Report'},
                      {data: esosNearMiss, stack: 'eso', color: tokenSuccess.main, label: 'Near Miss'},
                    ]}
                    slotProps={{legend: {position: {vertical: 'bottom', horizontal: 'center'}}}}
                  />
                </Paper>
              ) : null}
              {isKpiVisible('Incidents') ? (
                <Paper elevation={0} sx={chartCardSx}>
                  <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 0.8}}>
                    <Typography sx={{fontSize: 16, fontWeight: 900}}>Incidents</Typography>
                    <ExpandIcon sx={{fontSize: 17, color: tokenBrand.main}} />
                  </Box>
                  <BarChart
                    height={285}
                    margin={{top: 8, right: 10, bottom: 42, left: 36}}
                    xAxis={[{scaleType: 'band', data: tierChartMonths}]}
                    series={[
                      {data: incidentsFatality, stack: 'incident', color: tokenInfo.light, label: 'Fatality'},
                      {data: incidentsSerious, stack: 'incident', color: tokenError.lighter, label: 'Serious Injury'},
                      {data: incidentsMinor, stack: 'incident', color: tokenSuccess.main, label: 'Minor Injury'},
                      {data: incidentsNearMiss, stack: 'incident', color: tokenWarning.light, label: 'Near Miss'},
                      {data: incidentsFirstAid, stack: 'incident', color: workstationVisuals.textMuted, label: 'First Aid Case'},
                      {data: incidentsMedical, stack: 'incident', color: tokenWarning.lighter, label: 'Medical Treatment'},
                    ]}
                    slotProps={{legend: {position: {vertical: 'bottom', horizontal: 'center'}}}}
                  />
                </Paper>
              ) : null}
              {isKpiVisible('Gemba Walks Deviations') ? (
                <Paper elevation={0} sx={{...chartCardSx, gridColumn: {xl: '1 / span 2'}}}>
                  <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 0.8}}>
                    <Typography sx={{fontSize: 16, fontWeight: 900}}>Gemba Walks Deviations</Typography>
                    <ExpandIcon sx={{fontSize: 17, color: tokenBrand.main}} />
                  </Box>
                  <LineChart
                    height={300}
                    margin={{top: 10, right: 18, bottom: 34, left: 36}}
                    xAxis={[{scaleType: 'point', data: tierChartMonths}]}
                    yAxis={[{min: 0, max: 300}]}
                    series={[{data: gemba, color: tokenInfo.light, showMark: false}]}
                  />
                </Paper>
              ) : null}
            </Box>

            <Box sx={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center'}}>
              <Button startIcon={<EditIcon />} onClick={onCustomize} sx={{fontWeight: 900, letterSpacing: '0.12em', color: tokenBrand.main}}>
                CUSTOMIZE
              </Button>
            </Box>
          </Box>

          <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.2}}>
            <ActionsPanel />
            <CommentsPanel />
            <InsightsPanel />
          </Box>
        </Box>
      </Paper>
      {isEsoDrilldownOpen ? <EsoDrilldown onClose={() => setIsEsoDrilldownOpen(false)} /> : null}
    </Box>
  );
}
