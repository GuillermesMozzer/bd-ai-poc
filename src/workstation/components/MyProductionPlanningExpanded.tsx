import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {Box, Button, Chip, Paper, Typography} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AutoAwesome as AutoAwesomeIcon,
  Edit as EditIcon,
  OpenInFull as OpenInFullIcon,
  StarBorder as StarBorderIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

const timelineRows = [
  ['01:00AM', '04%', 'In Spec', 'On Track', 'Safe', '24.3k / 22k ↑', '83%', '-', ''],
  ['02:00AM', '04%', 'In Spec', 'On Track', 'Safe', '24.3k / 22k ↑', '90%', 'Material staged late', ''],
  ['03:00AM', '04%', 'In Spec', 'On Track', 'Safe', 'Setup Mode', '-', 'Changeover in progress', ''],
  ['04:00AM', '01%', 'In Spec', 'At Risk', 'Safe', '24.3k / 22k ↑', '83%', '-', ''],
  ['05:00AM', '02%', 'In Spec', 'On Track', 'Safe', '24.3k / 22k ↑', '77%', '-', ''],
  ['06:00AM', '09%', 'Deviation', 'Delayed', 'Unsafe', '24.3k / 22k ↑', '76%', 'Guarding check required', 'alert'],
  ['07:00AM', '00%', 'In Spec', 'On Track', 'Safe', '24.3k / 22k ↑', '81%', 'Supervisor reviewed', ''],
  ['08:00AM', '04%', 'In Spec', 'Ahead', 'Safe', '24.3k / 22k ↑', '82%', '-', ''],
  ['09:00AM', '01%', 'In Spec', 'Ahead', 'Safe', '24.3k / 22k ↑', '86%', '-', ''],
  ['10:00AM', '02%', 'In Spec', 'At Risk', 'Safe', '24.3k / 22k ↑', '95%', '-', ''],
  ['11:00AM', '00%', 'In Spec', 'Ahead', 'Safe', '24.3k / 22k ↑', '86%', 'Preventive check complete', ''],
  ['12:00PM', '01%', 'In Spec', 'On Track', 'Safe', '24.3k / 22k ↑', '77%', '-', ''],
];

function SmallMetric({accent, label, target, value}: {accent: string; label: string; target?: string; value: string}) {
  return (
    <Paper elevation={0} sx={{position: 'relative', minHeight: 55, p: 1.2, pl: 1.7, bgcolor: tokenNeutral.lightest, borderRadius: 1, overflow: 'hidden'}}>
      <Box sx={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: accent}} />
      <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 0.25}}>
        <Typography sx={{fontSize: 30, lineHeight: 0.95, color: workstationVisuals.tierTextHeading}}>{value}</Typography>
        <Typography sx={{fontSize: 13, mt: 0.25, color: workstationVisuals.tierTextLabel}}>{label === 'Total Production' ? 'K' : '%'}</Typography>
      </Box>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6}}>
        <Typography sx={{fontSize: 10, color: workstationVisuals.tierTextHeading}}>{label}</Typography>
        {target ? <Chip label={target} sx={{height: 15, fontSize: 8, bgcolor: tokenSuccess.main, color: tokenCommon.white, fontWeight: 800}} /> : null}
      </Box>
    </Paper>
  );
}

function MiniGauge() {
  return (
    <Paper elevation={0} sx={{height: 116, p: 1.2, bgcolor: tokenNeutral.lightest, borderRadius: 1}}>
      <Typography sx={{fontSize: 13, fontWeight: 900, color: workstationVisuals.tierTextHeading}}>Shift OEE</Typography>
      <Box sx={{position: 'relative', height: 84}}>
        <svg viewBox="0 0 180 90" width="100%" height="100%" aria-hidden="true">
          <path d="M 28 76 A 62 62 0 0 1 152 76" fill="none" stroke={tokenNeutral.dark} strokeWidth="8" strokeLinecap="round" />
          <path d="M 28 76 A 62 62 0 0 1 75 18" fill="none" stroke={tokenWarning.dark} strokeWidth="8" strokeLinecap="round" />
          <path d="M 28 76 A 62 62 0 0 1 152 76" fill="none" stroke={tokenSuccess.lighter} strokeWidth="4" strokeLinecap="round" strokeDasharray="126 195" strokeDashoffset="-55" />
          <circle cx="75" cy="18" r="6" fill={tokenNeutral.lightest} stroke={tokenWarning.dark} strokeWidth="5" />
        </svg>
        <Typography sx={{position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center', fontSize: 28, color: workstationVisuals.tierTextHeading}}>35%</Typography>
        <Typography sx={{position: 'absolute', left: 0, right: 0, top: 72, textAlign: 'center', fontSize: 9, color: tokenWarning.darker}}>20% Under Target</Typography>
      </Box>
    </Paper>
  );
}

function BottleneckChart() {
  const bars = [25, 39, 47, 52, 64, 68, 45, 51, 49, 63];
  return (
    <Paper elevation={0} sx={{p: 1.4, borderRadius: 1.5, border: `1px solid ${tokenNeutral.main}`, bgcolor: tokenCommon.white}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
        <Typography sx={{fontSize: 14, fontWeight: 900}}>Bottleneck Machine</Typography>
        <Box sx={{display: 'flex', gap: 1, color: tokenBrand.main}}><AutoAwesomeIcon sx={{fontSize: 16, color: tokenInfo.lightest}} /><StarBorderIcon sx={{fontSize: 16}} /><OpenInFullIcon sx={{fontSize: 16}} /></Box>
      </Box>
      <Box sx={{border: `1px solid ${tokenNeutral.main}`, borderRadius: 1, p: 1.2}}>
        <Typography sx={{fontSize: 11, color: workstationVisuals.tierTextHeading, mb: 0.8}}>Good Qty <Box component="span" sx={{float: 'right'}}>OEE</Box></Typography>
        <Box sx={{height: 150, display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', alignItems: 'end', gap: 0.7, borderLeft: `1px solid ${tokenNeutral.dark}`, borderBottom: `1px solid ${tokenNeutral.dark}`, px: 1}}>
          {bars.map((value, index) => (
            <Box key={index} sx={{display: 'flex', alignItems: 'end', height: '100%', gap: 0.15}}>
              <Box sx={{height: `${value}%`, flex: 1, bgcolor: tokenBrand.dark}} />
              <Box sx={{height: `${Math.max(30, value - 7)}%`, flex: 1, bgcolor: index % 3 === 0 ? tokenWarning.dark : tokenSuccess.main}} />
            </Box>
          ))}
        </Box>
        <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', pl: 1, mt: 0.4}}>
          {bars.map((_, index) => <Typography key={index} sx={{fontSize: 9, color: workstationVisuals.textSecondary, textAlign: 'center'}}>WK {index + 1}</Typography>)}
        </Box>
      </Box>
      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.1, mt: 1.5}}>
        <MetricPill accent={tokenBrand.main} value="71%" label="Fulfillment" />
        <MetricPill accent={tokenWarning.dark} value="124,5k" label="Backlog" />
        <MetricPill accent={tokenSuccess.dark} value="87%" label="Good Qty" />
      </Box>
    </Paper>
  );
}

function MetricPill({accent, label, value}: {accent: string; label: string; value: string}) {
  return (
    <Paper elevation={0} sx={{position: 'relative', p: 1, pl: 1.5, minHeight: 48, border: `1px solid ${tokenNeutral.main}`, borderRadius: 1, overflow: 'hidden'}}>
      <Box sx={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: accent}} />
      <Typography sx={{fontSize: 26, lineHeight: 0.95, color: workstationVisuals.tierTextHeading}}>{value}</Typography>
      <Typography sx={{fontSize: 9, color: workstationVisuals.tierTextHeading}}>{label}</Typography>
    </Paper>
  );
}

export default function MyProductionPlanningExpanded({onBack}: {onBack: () => void}) {
  return (
    <Box sx={{minHeight: '100%', bgcolor: tokenCommon.white, p: 1.5, color: workstationVisuals.tierTextHeading}}>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1.4}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
          <Button onClick={onBack} sx={{minWidth: 28, width: 28, height: 28, p: 0, color: tokenBrand.main}}><ArrowBackIcon /></Button>
          <Typography sx={{fontSize: 18, fontWeight: 900}}>Line Monitor&nbsp; &gt;&nbsp; Hourly Production Analysis Board</Typography>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 3}}>
          <HeaderStatus title="NEXIVA 20 GA X 1 IN SINGLE PORT" subtitle="SKU: 80-APX-50000 | Lot: L2073-0245 | Batch: 1847" badge="PRODUCTION" />
          <HeaderStatus title="NEXIVA  ZONE #8" subtitle="Code: 110339780" badge="RUNNING" />
        </Box>
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: '1.85fr 1fr', gap: 2}}>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.8}}>
          <Paper elevation={0} sx={{p: 1.4, borderRadius: 1.5, border: `1px solid ${tokenNeutral.main}`}}>
            <Typography sx={{fontSize: 14, fontWeight: 900, mb: 1.4}}>Production Timeline</Typography>
            <Paper elevation={0} sx={{p: 1.4, borderRadius: 1, border: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenNeutral.lightest}}>
              <Typography sx={{fontSize: 14, fontWeight: 900, color: tokenBrand.main, mb: 1}}>BLU.AI INSIGHTS</Typography>
              <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 1}}>
                <InsightCard title="Efficiency Gain" body="Production is trending 8.4% above target, finishing 25m early. This window is ideal for a technical cleaning or sensor inspection." action="SCHEDULE CLEANING" />
                <InsightCard title="Material Delivery" body="No material delivery planned for SKU-102 at Zone 1. Current pace will cause line starvation by 01:50 PM. Request delivery now?" action="CREATE WORK ORDER" />
              </Box>
            </Paper>
          </Paper>

          <Paper elevation={0} sx={{p: 1.2, borderRadius: 1.5, border: `1px solid ${tokenNeutral.main}`}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1.2}}>
              <Button variant="outlined" startIcon={<EditIcon />} sx={{fontWeight: 900, height: 28}}>EDIT COLUMN</Button>
              <Typography sx={{fontSize: 12}}>Major Events/Problem <Chip label="" sx={{ml: 1, width: 28, height: 16, bgcolor: tokenBrand.main}} /></Typography>
            </Box>
            <Box sx={{display: 'grid', gridTemplateColumns: '1.1fr 0.8fr 1.1fr 1.1fr 1.1fr 1.4fr 0.8fr 1.5fr 0.8fr', px: 1, py: 0.7, color: workstationVisuals.textSecondary, fontSize: 11}}>
              {['Hour ↓', 'Scrap ↓', 'Quality ↓', 'Delivery ↓', 'Safety ↓', 'Produced ↓', 'OEE ↓', 'Problem ↓', 'Action'].map((h) => <Box key={h}>{h}</Box>)}
            </Box>
            {timelineRows.map((row) => (
              <Box key={row[0]} sx={{display: 'grid', gridTemplateColumns: '1.1fr 0.8fr 1.1fr 1.1fr 1.1fr 1.4fr 0.8fr 1.5fr 0.8fr', alignItems: 'center', px: 1, py: 0.55, borderRadius: 1, bgcolor: tokenNeutral.lightest, borderBottom: `1px solid ${tokenNeutral.main}`, fontSize: 11, color: row[8] ? tokenError.darker : workstationVisuals.textSecondary}}>
                {row.slice(0, 8).map((cell, index) => <Box key={`${row[0]}-${index}`} sx={{fontWeight: row[8] ? 800 : 500, color: index === 5 ? tokenSuccess.darker : undefined}}>{cell}</Box>)}
                <Box sx={{display: 'flex', gap: 0.8, color: tokenBrand.main}}><VisibilityIcon sx={{fontSize: 14}} /><EditIcon sx={{fontSize: 14}} />+</Box>
              </Box>
            ))}
          </Paper>
        </Box>

        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.8}}>
          <Paper elevation={0} sx={{p: 1.4, borderRadius: 1.5, border: `1px solid ${tokenNeutral.main}`}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
              <Typography sx={{fontSize: 14, fontWeight: 900}}>Productivity</Typography>
              <Box sx={{display: 'flex', gap: 1, color: tokenBrand.main}}><AutoAwesomeIcon sx={{fontSize: 16, color: tokenInfo.lightest}} /><StarBorderIcon sx={{fontSize: 16}} /><OpenInFullIcon sx={{fontSize: 16}} /></Box>
            </Box>
            <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2}}>
              <Box sx={{display: 'grid', gap: 1}}>
                <SmallMetric accent={tokenSuccess.dark} value="218,4" label="Total Production" target="195K" />
                <SmallMetric accent={tokenSuccess.dark} value="88.4" label="Average OEE" target="85%" />
              </Box>
              <MiniGauge />
            </Box>
          </Paper>
          <BottleneckChart />
        </Box>
      </Box>
      <Box sx={{position: 'fixed', right: 24, bottom: 24, width: 46, height: 46, borderRadius: '50%', bgcolor: tokenBrand.main, display: 'grid', placeItems: 'center', color: tokenCommon.white}}>
        <AutoAwesomeIcon />
      </Box>
    </Box>
  );
}

function HeaderStatus({badge, subtitle, title}: {badge: string; subtitle: string; title: string}) {
  return (
    <Box sx={{display: 'grid', gridTemplateColumns: 'auto auto', gap: 1.2, alignItems: 'center'}}>
      <Box>
        <Typography sx={{fontSize: 12, fontWeight: 900}}>{title}</Typography>
        <Typography sx={{fontSize: 10, color: workstationVisuals.textSecondary}}>{subtitle}</Typography>
      </Box>
      <Chip label={badge} sx={{height: 22, bgcolor: tokenSuccess.dark, color: tokenCommon.white, fontSize: 10, fontWeight: 900, minWidth: 96}} />
    </Box>
  );
}

function InsightCard({action, body, title}: {action: string; body: string; title: string}) {
  return (
    <Paper elevation={0} sx={{p: 1.3, borderRadius: 1, border: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenCommon.white}}>
      <Typography sx={{fontSize: 13, fontWeight: 900, mb: 0.9}}>{title}</Typography>
      <Typography sx={{fontSize: 11, color: workstationVisuals.textSecondary, lineHeight: 1.45, minHeight: 48}}>{body}</Typography>
      <Typography sx={{fontSize: 10, color: tokenBrand.main, fontWeight: 900, textAlign: 'right', mt: 0.8}}>{action}</Typography>
    </Paper>
  );
}
