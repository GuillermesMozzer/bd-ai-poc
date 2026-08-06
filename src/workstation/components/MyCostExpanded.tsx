import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import type {ReactNode} from 'react';
import {Box, Button, IconButton, Paper, Typography} from '@mui/material';
import {
  Edit as EditIcon,
  OpenInFull as ExpandIcon,
  Search as SearchIcon,
  Send as SendIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart as ReLineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import {reorderCalendarYearToTierYear, tierChartMonths} from './tierChartMonths';

type MyCostExpandedProps = {
  onBack: () => void;
  onCustomize?: () => void;
  visibleKpis?: string[];
};

const costSeries = tierChartMonths.map((month, index) => ({
  month,
  scrap: reorderCalendarYearToTierYear([214, 222, 200, 250, 196, 239, 195, 217, 210, 195, 211, 218])[index],
  downtime: reorderCalendarYearToTierYear([216, 222, 201, 249, 196, 240, 195, 217, 210, 195, 211, 218])[index],
  target: reorderCalendarYearToTierYear([214, 224, 221, 214, 225, 225, 215, 225, 210, 206, 227, 214])[index],
  gemba: reorderCalendarYearToTierYear([196, 212, 210, 128, 214, 156, 213, 168, 133, 95, 164, 146])[index],
}));

const metricCards = [
  {accent: tokenSuccess.darker, label: 'Variance to Scrap Reduction Target', value: '$1,437.73', variance: '+0.5%'},
  {accent: tokenError.dark, label: 'Total Spendings', target: '135K', value: '$162.5', suffix: 'k'},
  {accent: tokenError.dark, label: 'Total Scrap Cost', target: '10K', value: '$14.5', suffix: 'k'},
  {accent: tokenError.dark, label: 'Total Downtime Cost', target: '9K', value: '$9.4', suffix: 'k'},
];

const periodOptions = ['HOUR', 'SHIFT', 'DAY', 'MONTH', 'YEAR'];

const actionItems = [
  {tone: tokenError.main, text: 'Unexpected temperature fluctuations observed in ...'},
  {tone: tokenError.main, text: 'Visual inspection reveals defects in painted surfaces'},
  {tone: tokenWarning.main, text: 'Component alignment out of specification noted in recent ...'},
];

const comments = [
  {author: 'John Smith', text: 'We had a weak quarter due to market reasons beyond our control.', time: 'Mar 18, 11:41', avatar: 'JS'},
  {author: 'Maria Pinna', text: 'We will manage our margins to minimize risks.', time: 'Mar 18, 09:20', avatar: 'MP'},
];

const insights = [
  {
    title: 'Critical Bottleneck',
    text: 'Zone 5A is operating at 78.3 PPM (35% below Target). This is triggering a ...',
  },
  {
    title: 'Downtime Risk',
    text: 'Based on current trend, Line 8 has a high probability of unplanned stop before end o...',
  },
];

const panelBorder = `1px solid ${tokenNeutral.dark}`;
const chartBg = tokenNeutral.lighter;
const blue = tokenInfo.light;
const red = tokenError.dark;

const shellSx = {
  width: 'min(1800px, calc(100vw - 120px))',
  height: 'min(950px, calc(100vh - 130px))',
  p: '20px 39px 38px',
  borderRadius: '8px',
  bgcolor: tokenNeutral.lightest,
  border: `1px solid ${workstationVisuals.textMuted}`,
  boxShadow: '0 24px 54px rgba(0, 0, 0, 0.42)',
  overflow: 'hidden',
} as const;

const cardSx = {
  border: panelBorder,
  borderRadius: '10px',
  bgcolor: tokenNeutral.lightest,
  boxShadow: 'none',
} as const;

function KpiCard({
  accent,
  label,
  suffix,
  target,
  value,
  variance,
}: {
  accent: string;
  label: string;
  suffix?: string;
  target?: string;
  value: string;
  variance?: string;
}) {
  const isAlert = accent === red;

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        height: 66,
        pl: 1.55,
        pr: 1,
        py: 0.8,
        borderRadius: '6px',
        bgcolor: tokenNeutral.lighter,
        border: `1px solid ${tokenNeutral.main}`,
        boxShadow: '0 3px 10px rgba(23, 84, 180, 0.14)',
        overflow: 'hidden',
      }}
    >
      <Box sx={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, bgcolor: accent}} />
      <Box sx={{display: 'flex', justifyContent: 'space-between', height: '100%'}}>
        <Box sx={{minWidth: 0}}>
          <Typography sx={{fontSize: 33, lineHeight: 0.95, color: isAlert ? red : workstationVisuals.tierTextHeading, fontWeight: 400}}>
            {value}
            {suffix ? <Box component="span" sx={{fontSize: 15, ml: 0.35, verticalAlign: 'super'}}>{suffix}</Box> : null}
          </Typography>
          <Typography sx={{fontSize: 12, lineHeight: 1, color: isAlert ? red : workstationVisuals.tierTextHeading, mt: 0.15}}>{label}</Typography>
        </Box>
        {target ? (
          <Box sx={{pt: 1.1, textAlign: 'right'}}>
            <Typography sx={{fontSize: 9, letterSpacing: 0, color: workstationVisuals.tierTextLabel, fontWeight: 700}}>TARGET</Typography>
            <Box sx={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 32, height: 18, px: 0.55, mt: 0.15, borderRadius: 999, bgcolor: tokenNeutral.dark, color: workstationVisuals.tierTextHeading, fontSize: 10, fontWeight: 800}}>
              {target}
            </Box>
          </Box>
        ) : null}
        {variance ? (
          <Box sx={{alignSelf: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 40, height: 18, px: 0.55, borderRadius: 999, bgcolor: tokenNeutral.lighter, color: tokenSuccess.darker, fontSize: 10, fontWeight: 800}}>
            {variance}
          </Box>
        ) : null}
      </Box>
    </Paper>
  );
}

function UnitToggle() {
  return (
    <Box sx={{position: 'absolute', left: '50%', top: 19, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 0.45}}>
      <Box sx={{height: 18, px: 1.1, display: 'grid', placeItems: 'center', borderRadius: 999, bgcolor: tokenBrand.main, color: tokenCommon.white, fontSize: 9, fontWeight: 900, boxShadow: '0 2px 5px rgba(20, 93, 245, 0.28)'}}>
        UNITS
      </Box>
      <Box sx={{height: 18, minWidth: 28, px: 0.7, display: 'grid', placeItems: 'center', borderRadius: 999, bgcolor: tokenNeutral.dark, color: workstationVisuals.tierTextHeading, fontSize: 9, fontWeight: 900}}>
        %
      </Box>
    </Box>
  );
}

function CardTitle({showToggle = false, title}: {showToggle?: boolean; title: string}) {
  return (
    <Box sx={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 2}}>
      <Typography sx={{fontSize: 16, lineHeight: 1, fontWeight: 800, color: workstationVisuals.tierTextHeading}}>{title}</Typography>
      {showToggle ? <UnitToggle /> : null}
      <ExpandIcon sx={{fontSize: 16, color: tokenBrand.main}} />
    </Box>
  );
}

function ChartFrame({children}: {children: ReactNode}) {
  return (
    <Box sx={{height: 'calc(100% - 44px)', mx: 2, mt: 1.1, bgcolor: chartBg, borderRadius: '6px', overflow: 'hidden'}}>
      {children}
    </Box>
  );
}

function PeriodTabs() {
  return (
    <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 0.45}}>
      {periodOptions.map((option, index) => {
        const active = index === 4;
        return (
          <Box
            key={`${option}-${index}`}
            sx={{
              minWidth: option === 'MONTH' ? 55 : 43,
              height: 18,
              px: 1.1,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 999,
              bgcolor: active ? tokenBrand.main : tokenNeutral.dark,
              color: active ? tokenCommon.white : workstationVisuals.tierTextHeading,
              fontSize: 9,
              fontWeight: 900,
              boxShadow: active ? '0 2px 5px rgba(20, 93, 245, 0.28)' : 'none',
            }}
          >
            {option}
          </Box>
        );
      })}
    </Box>
  );
}

function CostBarChart({dataKey}: {dataKey: 'scrap' | 'downtime'}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={costSeries} margin={{top: 4, right: 18, left: -8, bottom: 8}}>
        <CartesianGrid vertical={false} stroke="transparent" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: workstationVisuals.tierTextHeading}} />
        <YAxis domain={[0, 300]} axisLine={false} tickLine={false} tick={{fontSize: 9, fill: workstationVisuals.tierTextHeading}} />
        <Bar dataKey={dataKey} fill={blue} radius={[5, 5, 0, 0]} barSize={30} />
        <Line dataKey="target" type="linear" stroke={tokenInfo.main} strokeWidth={2} strokeDasharray="6 5" dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function GembaChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReLineChart data={costSeries} margin={{top: 4, right: 22, left: -8, bottom: 9}}>
        <CartesianGrid vertical={false} stroke="transparent" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: workstationVisuals.tierTextHeading}} />
        <YAxis domain={[0, 300]} axisLine={false} tickLine={false} tick={{fontSize: 9, fill: workstationVisuals.tierTextHeading}} />
        <Line dataKey="gemba" type="linear" stroke={blue} strokeWidth={4} dot={false} />
      </ReLineChart>
    </ResponsiveContainer>
  );
}

function ActionsPanel() {
  return (
    <Paper elevation={0} sx={{...cardSx, height: 275, display: 'grid', gridTemplateRows: 'auto 1fr auto', overflow: 'hidden'}}>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.1, py: 1, borderBottom: `1px solid ${tokenNeutral.dark}`}}>
        <Typography sx={{fontSize: 16, fontWeight: 900}}>Actions</Typography>
        <SearchIcon sx={{fontSize: 19, color: tokenInfo.lighter}} />
      </Box>
      <Box sx={{px: 1, py: 0.8}}>
        {actionItems.map((item) => (
          <Paper key={item.text} elevation={0} sx={{height: 42, mb: 0.6, pl: 1.25, pr: 0.8, display: 'flex', alignItems: 'center', borderRadius: '6px', border: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenCommon.white, boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)', position: 'relative', overflow: 'hidden'}}>
            <Box sx={{position: 'absolute', left: 0, top: 6, bottom: 6, width: 4, borderRadius: 999, bgcolor: item.tone}} />
            <Typography sx={{fontSize: 14, lineHeight: 1.05, color: workstationVisuals.tierTextHeading}}>{item.text}</Typography>
          </Paper>
        ))}
        <Typography sx={{textAlign: 'right', fontSize: 16, color: workstationVisuals.tierTextHeading, mt: 0.1}}>+2</Typography>
      </Box>
      <Box sx={{height: 29, display: 'flex', alignItems: 'center', px: 1.5, borderTop: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenNeutral.lighter}}>
        <Typography sx={{fontSize: 15, fontWeight: 900, mr: 0.45}}>8</Typography>
        <Typography sx={{fontSize: 12}}>Completed</Typography>
      </Box>
    </Paper>
  );
}

function CommentsPanel() {
  return (
    <Paper elevation={0} sx={{...cardSx, height: 276, px: 1.8, py: 1.45}}>
      <Typography sx={{fontSize: 16, fontWeight: 900, mb: 1.25}}>Comments</Typography>
      {comments.map((comment, index) => (
        <Paper key={comment.author} elevation={0} sx={{minHeight: 78, mb: 1, px: 1.4, py: 1, borderRadius: '12px', border: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenNeutral.main}}>
          <Typography sx={{fontSize: 14, lineHeight: 1.35, color: workstationVisuals.tierTextHeading}}>{comment.text}</Typography>
          <Box sx={{display: 'flex', alignItems: 'center', mt: 0.5}}>
            <Box sx={{width: 16, height: 16, borderRadius: '50%', bgcolor: index === 0 ? tokenError.lighter : tokenError.lighter, display: 'grid', placeItems: 'center', color: tokenCommon.white, fontSize: 7, fontWeight: 900, mr: 0.6}}>
              {comment.avatar}
            </Box>
            <Typography sx={{fontSize: 11, color: workstationVisuals.tierTextMeta}}>{comment.author}</Typography>
            <Typography sx={{fontSize: 11, color: workstationVisuals.tierTextMeta, ml: 'auto'}}>{comment.time}</Typography>
          </Box>
        </Paper>
      ))}
      <Box sx={{height: 40, border: `1px solid ${tokenBrand.main}`, borderRadius: '10px', display: 'flex', alignItems: 'center', px: 1.3, color: tokenInfo.darkest, fontSize: 16}}>
        Leave a Comment
        <SendIcon sx={{ml: 'auto', fontSize: 30, color: tokenBrand.main}} />
      </Box>
    </Paper>
  );
}

function InsightsPanel() {
  return (
    <Paper elevation={0} sx={{...cardSx, height: 276, px: 1.8, py: 1.5}}>
      <Box sx={{display: 'flex', alignItems: 'center', mb: 1.2}}>
        <Typography sx={{fontSize: 17, mr: 0.4, color: tokenWarning.dark, fontWeight: 900}}>✦</Typography>
        <Typography sx={{fontSize: 16, color: tokenBrand.main, fontWeight: 900}}>BLU.AI INSIGHTS</Typography>
        <ExpandIcon sx={{fontSize: 19, color: tokenBrand.main, ml: 'auto'}} />
      </Box>
      {insights.map((insight) => (
        <Paper key={insight.title} elevation={0} sx={{height: 66, mb: 1, px: 1.25, py: 1, borderRadius: '10px', border: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenNeutral.lighter}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
            <WarningIcon sx={{fontSize: 16, color: red}} />
            <Typography sx={{fontSize: 16, fontWeight: 900, color: workstationVisuals.tierTextHeading, lineHeight: 1}}>{insight.title}</Typography>
          </Box>
          <Typography sx={{fontSize: 11.5, lineHeight: 1.08, color: workstationVisuals.tierTextHeading, mt: 0.35}}>{insight.text}</Typography>
        </Paper>
      ))}
    </Paper>
  );
}

export default function MyCostExpanded({onBack, onCustomize, visibleKpis}: MyCostExpandedProps) {
  const isKpiVisible = (label: string) => !visibleKpis || visibleKpis.includes(label);
  const visibleMetricCards = metricCards.filter((metric) => !visibleKpis || visibleKpis.includes(metric.label));

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(7, 11, 27, 0.78)',
      }}
    >
      <Paper elevation={0} sx={shellSx}>
        <Box sx={{height: '100%', display: 'grid', gridTemplateRows: '28px minmax(0, 1fr)', rowGap: 0.8}}>
          <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <Typography sx={{fontSize: 18, fontWeight: 900, color: workstationVisuals.tierTextHeading}}>Cost</Typography>
            <IconButton onClick={onBack} sx={{width: 28, height: 28, color: tokenBrand.main}}>
              <ExpandIcon sx={{fontSize: 20}} />
            </IconButton>
          </Box>

          <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 1.2, minHeight: 0}}>
            <Box sx={{position: 'relative', display: 'grid', gridTemplateRows: '66px 18px minmax(0, 366px) minmax(0, 366px)', gap: 1.1, minHeight: 0, height: '100%', pb: 5.2}}>
              <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 1}}>
                {visibleMetricCards.map((metric) => <KpiCard key={metric.label} {...metric} />)}
              </Box>

              <PeriodTabs />

              <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, minHeight: 0}}>
                {isKpiVisible('Scrap') ? (
                  <Paper elevation={0} sx={{...cardSx, minHeight: 0}}>
                    <CardTitle showToggle title="Scrap" />
                    <ChartFrame>
                      <CostBarChart dataKey="scrap" />
                    </ChartFrame>
                  </Paper>
                ) : null}
                {isKpiVisible('Downtime') ? (
                  <Paper elevation={0} sx={{...cardSx, minHeight: 0}}>
                    <CardTitle title="Downtime" />
                    <ChartFrame>
                      <CostBarChart dataKey="downtime" />
                    </ChartFrame>
                  </Paper>
                ) : null}
              </Box>

              {isKpiVisible('Gemba Walks Deviations') ? (
                <Paper elevation={0} sx={{...cardSx, minHeight: 0}}>
                  <CardTitle title="Gemba Walks Deviations" />
                  <ChartFrame>
                    <GembaChart />
                  </ChartFrame>
                </Paper>
              ) : null}

              <Box sx={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center'}}>
                <Button startIcon={<EditIcon />} onClick={onCustomize} sx={{fontWeight: 900, letterSpacing: '0.12em', color: tokenBrand.main}}>
                  CUSTOMIZE
                </Button>
              </Box>
            </Box>

            <Box sx={{display: 'flex', flexDirection: 'column', gap: 1, minHeight: 0}}>
              <ActionsPanel />
              <CommentsPanel />
              <InsightsPanel />
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
