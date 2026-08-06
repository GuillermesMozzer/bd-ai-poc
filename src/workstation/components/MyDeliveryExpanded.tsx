import {useState, type ReactNode} from 'react';
import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
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
  Line,
  LineChart as ReLineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  BarChart as ReBarChart,
} from 'recharts';
import {reorderCalendarYearToTierYear, tierChartMonths} from './tierChartMonths';

type MyDeliveryExpandedProps = {
  onBack: () => void;
  onCustomize?: () => void;
  visibleKpis?: string[];
};

const deliverySeries = tierChartMonths.map((month, index) => ({
  month,
  production: reorderCalendarYearToTierYear([145, 154, 111, 205, 106, 188, 104, 144, 136, 103, 136, 146])[index],
  oee: reorderCalendarYearToTierYear([232, 265, 260, 110, 268, 160, 267, 178, 45, 178, 235, 142])[index],
  gemba: reorderCalendarYearToTierYear([235, 268, 262, 108, 270, 161, 266, 180, 45, 178, 235, 141])[index],
}));

const metricCards = [
  {accent: tokenNeutral.darkest, label: 'Monthly Target', value: '2,223,000'},
  {accent: tokenSuccess.darker, label: 'MTD Actual', target: '2,548,084', value: '2,788,004'},
  {accent: tokenSuccess.darker, label: 'Daily Actual', target: '78,000', value: '96,052'},
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

const planningRows = [
  {changeover: '08:00 - 10:00', day: 'Monday', maintenance: 'Piston Lubrication (L1)', maintenanceColor: '#00865A', orders: ['ORD-9382'], status: 'Completed', statusTone: '#10B981'},
  {changeover: '10:30 - 12:00', day: 'Tuesday', maintenance: 'Calibration (L4)', maintenanceColor: '#FF3B00', orders: ['ORD-9385', 'ORD-9386'], status: 'In Progress', statusTone: '#4D83FF'},
  {changeover: '-', day: 'Wednesday', maintenance: 'Filter Swap (Z3)', maintenanceColor: '#7A28FF', orders: ['ORD-9310'], status: 'Scheduled', statusTone: '#9AA2AD'},
  {changeover: '07:00 - 08:30', day: 'Thursday', maintenance: 'Bearing Replacement (L2)', maintenanceColor: '#FF001E', orders: ['ORD-9312'], status: 'Scheduled', statusTone: '#9AA2AD'},
  {changeover: '-', day: 'Friday', maintenance: 'Thermal Sensor Check (Area 3)', maintenanceColor: '#174BFF', orders: ['ORD-9315'], status: 'Scheduled', statusTone: '#9AA2AD'},
];

const planningCalendarDays = [
  {day: 'Sunday', date: 'May 24', production: '0 UN.', availability: '0%', blackout: true},
  {day: 'Monday', date: 'May 25', production: '12,500 UN.', availability: '95%', cards: [
    {title: 'Extrusion Machine PM-4', type: 'Preventive', meta: 'Area 3  |  45min', owner: 'Gabriel Silva'},
    {title: 'CHANGEOVER: BLOCK LINE 2 SETUP', type: 'Changeover', meta: '13:00 - 14:30', owner: ''},
  ]},
  {day: 'Tuesday', date: 'May 26', production: '10,000 UN.', availability: '88%', today: true, cards: [
    {title: 'Syringe Assembly Machine 6A', type: 'Corrective', meta: 'Z2  |  2h', owner: 'Bruno Aquino', critical: true},
  ]},
  {day: 'Wednesday', date: 'May 27', production: '14,000 UN.', availability: '98%', cards: [
    {title: 'Labeling Station Unit B', type: 'Preventive', meta: 'Z5  |  30min', owner: 'Julia Costa'},
  ]},
  {day: 'Thursday', date: 'May 28', production: '11,500 UN.', availability: '91%', safety: true, cards: [
    {title: 'Rotary Press Sensor Calibration', type: 'Preventive', meta: 'Zone 1  |  1h', owner: 'Lucas Lima'},
  ]},
  {day: 'Friday', date: 'May 29', production: '13,000 UN.', availability: '94%', cards: [
    {title: 'Laser Cutter Cutter-Y', type: 'Preventive', meta: 'Zone 2  |  55min', owner: 'Carlos Lima'},
  ]},
  {day: 'Saturday', date: 'May 30', production: '4,000 UN.', availability: '100%', cards: [
    {title: 'Pneumatic Filter Valve Flush', type: 'Preventive', meta: 'Z4  |  20min', owner: 'Diego Souza'},
  ]},
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

function KpiCard({accent, label, target, value}: {accent: string; label: string; target?: string; value: string}) {
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
        <Box>
          <Typography sx={{fontSize: 33, lineHeight: 0.95, color: workstationVisuals.tierTextHeading, fontWeight: 400}}>{value}</Typography>
          <Typography sx={{fontSize: 12, lineHeight: 1, color: workstationVisuals.tierTextHeading, mt: 0.15}}>{label}</Typography>
        </Box>
        {target ? (
          <Box sx={{pt: 1.1, textAlign: 'right'}}>
            <Typography sx={{fontSize: 9, letterSpacing: 0, color: workstationVisuals.tierTextLabel, fontWeight: 700}}>TARGET</Typography>
            <Box sx={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 57, height: 18, px: 0.55, mt: 0.15, borderRadius: 999, bgcolor: tokenNeutral.dark, color: workstationVisuals.tierTextHeading, fontSize: 10, fontWeight: 800}}>
              {target}
            </Box>
          </Box>
        ) : null}
      </Box>
    </Paper>
  );
}

function CardTitle({onExpand, title}: {onExpand?: () => void; title: string}) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 2}}>
      <Typography sx={{fontSize: 16, lineHeight: 1, fontWeight: 800, color: workstationVisuals.tierTextHeading}}>{title}</Typography>
      <IconButton onClick={onExpand} disabled={!onExpand} sx={{width: 22, height: 22, color: tokenBrand.main, opacity: onExpand ? 1 : 0.72}}>
        <ExpandIcon sx={{fontSize: 16}} />
      </IconButton>
    </Box>
  );
}

function ChartFrame({children}: {children: ReactNode}) {
  return (
    <Box sx={{height: 'calc(100% - 54px)', mx: 2, mt: 1.1, mb: 1.4, bgcolor: chartBg, borderRadius: '6px', overflow: 'hidden', minHeight: 0}}>
      {children}
    </Box>
  );
}

function PlaceholderFrame() {
  return (
    <ChartFrame>
      <Box sx={{width: '100%', height: '100%', display: 'grid', placeItems: 'center'}}>
        <Typography sx={{fontSize: 26, color: tokenNeutral.darker, fontWeight: 900}}>To be Defined</Typography>
      </Box>
    </ChartFrame>
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

function PlanningBadge({label}: {label: string}) {
  return (
    <Box sx={{display: 'inline-grid', placeItems: 'center', height: 18, px: 0.8, borderRadius: '5px', bgcolor: '#E6EDF7', color: '#32445F', fontSize: 8.5, fontWeight: 900}}>
      {label}
    </Box>
  );
}

function ProductionMaintenancePlanningCard({onExpand}: {onExpand: () => void}) {
  return (
    <Paper elevation={0} sx={{...cardSx, minHeight: 0, overflow: 'hidden'}}>
      <CardTitle onExpand={onExpand} title="Production and Maintenance Planning" />
      <Typography sx={{px: 2, pt: 0.5, pb: 1.3, fontSize: 11, color: '#667085'}}>
        Structured Timeline, Orders Allocations & Corrective Interventions
      </Typography>
      <Box sx={{mx: 2, borderTop: '1px solid #DDE4EA'}}>
        <Box sx={{display: 'grid', gridTemplateColumns: '150px 180px 150px minmax(190px, 1fr) 116px', alignItems: 'center', height: 25, color: '#51627A', fontSize: 10, fontWeight: 900, textTransform: 'uppercase'}}>
          <Box>Day</Box>
          <Box>Order</Box>
          <Box>Changeover</Box>
          <Box>Maintenance</Box>
          <Box sx={{textAlign: 'right'}}>Status</Box>
        </Box>
        {planningRows.map((row) => (
          <Box key={row.day} sx={{display: 'grid', gridTemplateColumns: '150px 180px 150px minmax(190px, 1fr) 116px', alignItems: 'center', minHeight: 26, borderTop: '1px solid #E7EDF2'}}>
            <Typography sx={{fontSize: 10.5, fontWeight: 800, color: '#0F172A'}}>{row.day}</Typography>
            <Box sx={{display: 'flex', gap: 0.45, flexWrap: 'wrap'}}>
              {row.orders.map((order) => <PlanningBadge key={order} label={order} />)}
            </Box>
            <Typography sx={{fontSize: 10.5, color: '#18315F'}}>{row.changeover}</Typography>
            <Typography sx={{fontSize: 10.5, color: row.maintenanceColor, fontWeight: 700}}>{row.maintenance}</Typography>
            <Box sx={{justifySelf: 'end', height: 18, px: 0.9, borderRadius: 999, display: 'grid', placeItems: 'center', border: `1px solid ${row.statusTone}`, color: row.statusTone, bgcolor: row.status === 'Completed' ? '#E9FFF4' : '#F8FAFC', fontSize: 8, fontWeight: 900, textTransform: 'uppercase'}}>
              {row.status}
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

function RecentChangeoversCard() {
  const items = [
    {actual: '55 min actual vs 48 min target', color: '#FF001E', owner: 'Carlos Lima', planned: 'May 26 14:00', started: 'May 26 14:15', target: '48m', title: 'Laser Cutter Cutter-Y', zone: 'Zone 2'},
    {actual: '33 min actual vs 35 min target', color: '#008A4B', owner: 'Bruno Santos', planned: 'May 26 09:15', started: 'May 26 09:17', target: '35m', title: 'Product Extruder 4', zone: 'Physical Area 3'},
  ];

  return (
    <Paper elevation={0} sx={{...cardSx, minHeight: 0, overflow: 'hidden'}}>
      <CardTitle title="Upcoming / Recent Changeovers" />
      <Box sx={{mx: 2, mt: 0.8, display: 'grid', gap: 0.65}}>
        {items.map((item) => (
          <Paper key={item.title} elevation={0} sx={{border: '1px solid #D8E0E8', borderRadius: '8px', bgcolor: '#FFFFFF', px: 1.2, py: 0.85}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
              <Typography sx={{fontSize: 12, fontWeight: 900, color: '#142033'}}>{item.title}</Typography>
              <Box sx={{ml: 'auto', height: 18, px: 0.9, borderRadius: 999, bgcolor: '#DFFAEA', color: '#00924F', display: 'grid', placeItems: 'center', fontSize: 8, fontWeight: 900}}>COMPLETED</Box>
            </Box>
            <Typography sx={{fontSize: 9.5, color: '#6B7A90', mt: 0.35}}>{item.zone}  •  Shift C (Afternoon)  •  {item.owner}</Typography>
            <Box sx={{display: 'flex', gap: 1.2, mt: 0.55, flexWrap: 'wrap'}}>
              <Typography sx={{fontSize: 9.5, color: '#566173'}}>PLANNED: <PlanningBadge label={item.planned} /></Typography>
              <Typography sx={{fontSize: 9.5, color: '#566173'}}>STARTED: <PlanningBadge label={item.started} /></Typography>
            </Box>
            <Box sx={{display: 'flex', alignItems: 'center', mt: 0.55}}>
              <Typography sx={{fontSize: 10, color: item.color, fontWeight: 900, textTransform: 'uppercase'}}>{item.actual}</Typography>
              <Typography sx={{fontSize: 10, color: '#8A94A3', ml: 'auto'}}>Target: {item.target}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Paper>
  );
}

function PlanningCalendarModal({onClose}: {onClose: () => void}) {
  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 1800, bgcolor: 'rgba(7, 11, 27, 0.58)', display: 'grid', placeItems: 'center'}}>
      <Paper elevation={0} sx={{width: 'min(1720px, calc(100vw - 48px))', height: 'min(560px, calc(100vh - 64px))', borderRadius: '8px', bgcolor: '#F8FAFC', border: '1px solid #D7DEE8', boxShadow: '0 24px 54px rgba(0,0,0,0.36)', overflow: 'hidden', p: 2}}>
        <Box sx={{display: 'grid', gridTemplateRows: '58px minmax(0, 1fr)', height: '100%'}}>
          <Box sx={{display: 'flex', alignItems: 'flex-start', borderBottom: '1px solid #E2E7EE'}}>
            <Box>
              <Typography sx={{fontSize: 18, fontWeight: 900, color: '#2A3340', letterSpacing: '0.02em'}}>Production and Maintenance Planning - Calendar View</Typography>
              <Typography sx={{fontSize: 12, color: '#8390A2', mt: 0.6}}>Weekly Allocation, Productive Target & Tool Work Orders</Typography>
            </Box>
            <Box sx={{ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.5}}>
              <Box sx={{height: 28, px: 1.4, borderRadius: 999, bgcolor: '#EEF3F8', color: '#536274', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 900}}>
                ACTIVE WEEK: MAY 24 - MAY 30
              </Box>
              <IconButton onClick={onClose} sx={{width: 28, height: 28, color: '#9AA4B2'}}>
                <Typography sx={{fontSize: 22, lineHeight: 1}}>x</Typography>
              </IconButton>
            </Box>
          </Box>

          <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 1, pt: 1.5, minHeight: 0}}>
            {planningCalendarDays.map((day) => (
              <Paper key={day.day} elevation={0} sx={{border: day.today ? '2px solid #9BD0FF' : '1px solid #E2E7EE', borderRadius: '8px', bgcolor: '#FFFFFF', p: 1.2, minHeight: 0, overflow: 'hidden'}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <Box>
                    <Typography sx={{fontSize: 13, fontWeight: 900, color: day.today ? '#4387FF' : '#4B5563'}}>{day.day}</Typography>
                    <Typography sx={{fontSize: 11, fontWeight: 800, color: '#9AA4B2'}}>{day.date}</Typography>
                  </Box>
                  {day.today ? <Box sx={{height: 18, px: 0.8, borderRadius: '5px', bgcolor: '#2265FF', color: '#FFFFFF', fontSize: 9, fontWeight: 900}}>TODAY</Box> : null}
                </Box>
                <Box sx={{borderTop: '1px dashed #E2E7EE', mt: 1.2, pt: 1, display: 'grid', gridTemplateColumns: '1fr auto', gap: 0.4}}>
                  <Typography sx={{fontSize: 10, color: '#8C97A6', fontWeight: 900}}>PROD:</Typography>
                  <Typography sx={{fontSize: 10, color: '#4B5563', fontWeight: 900}}>{day.production}</Typography>
                  <Typography sx={{fontSize: 10, color: '#8C97A6', fontWeight: 900}}>AVAIL:</Typography>
                  <Typography sx={{fontSize: 10, color: '#4B5563', fontWeight: 900}}>{day.availability}</Typography>
                </Box>
                {day.blackout ? (
                  <Box sx={{height: 284, mt: 1.4, border: '2px solid #FFC9C9', borderRadius: '6px', background: 'repeating-linear-gradient(45deg, #FFF2F2, #FFF2F2 10px, #FFFFFF 10px, #FFFFFF 20px)', display: 'grid', placeItems: 'center', textAlign: 'center', color: '#D94141'}}>
                    <Box>
                      <WarningIcon sx={{fontSize: 24}} />
                      <Typography sx={{fontSize: 11, fontWeight: 900}}>BLACKOUT PERIOD</Typography>
                      <Typography sx={{fontSize: 10, color: '#9B5960', mt: 0.5}}>Weekly Plant Decarbonization & Grid Maintenance Work</Typography>
                    </Box>
                  </Box>
                ) : null}
                {day.safety ? (
                  <Box sx={{height: 50, mt: 1.4, border: '1px solid #FFD37B', borderRadius: '6px', bgcolor: '#FFF8E6', display: 'grid', placeItems: 'center', color: '#BA7A00', fontSize: 11, fontWeight: 900}}>
                    CALORIFIC SAFETY BLACKOUT 09:00 - 11:00
                  </Box>
                ) : null}
                <Box sx={{display: 'grid', gap: 1, mt: 1.4}}>
                  {day.cards?.map((card) => (
                    <Box key={card.title} sx={{minHeight: 70, borderRadius: '6px', border: card.critical ? '2px solid #FF7B7B' : '1px solid #E2E7EE', bgcolor: card.type === 'Changeover' ? '#EAF3FF' : '#FFFFFF', p: 1}}>
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7}}>
                        <Typography sx={{fontSize: 11, fontWeight: 900, color: card.critical ? '#FF3348' : '#334155'}}>{card.title}</Typography>
                        <Box sx={{ml: 'auto', fontSize: 9, fontWeight: 900, color: card.critical ? '#FF3348' : '#FF7A00', textTransform: 'uppercase'}}>{card.type}</Box>
                      </Box>
                      <Typography sx={{fontSize: 10, color: '#9AA4B2', mt: 0.5}}>{card.meta}</Typography>
                      {card.owner ? <Typography sx={{fontSize: 10, color: '#3B4A5F', mt: 0.9}}>{card.owner}</Typography> : null}
                    </Box>
                  ))}
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

function ProductionChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReBarChart data={deliverySeries} margin={{top: 8, right: 18, left: -4, bottom: 14}}>
        <CartesianGrid vertical={false} stroke="transparent" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: workstationVisuals.tierTextHeading}} />
        <YAxis domain={[0, 300]} axisLine={false} tickLine={false} tick={{fontSize: 9, fill: workstationVisuals.tierTextHeading}} />
        <Bar dataKey="production" fill={blue} radius={[5, 5, 0, 0]} barSize={30} />
      </ReBarChart>
    </ResponsiveContainer>
  );
}

function LineTrendChart({dataKey}: {dataKey: 'oee' | 'gemba'}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReLineChart data={deliverySeries} margin={{top: 8, right: 22, left: -4, bottom: 15}}>
        <CartesianGrid vertical={false} stroke="transparent" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: workstationVisuals.tierTextHeading}} />
        <YAxis domain={[0, 300]} axisLine={false} tickLine={false} tick={{fontSize: 9, fill: workstationVisuals.tierTextHeading}} />
        <Line dataKey={dataKey} type="linear" stroke={blue} strokeWidth={4} dot={false} />
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

export default function MyDeliveryExpanded({onBack, onCustomize, visibleKpis}: MyDeliveryExpandedProps) {
  const [isPlanningCalendarOpen, setIsPlanningCalendarOpen] = useState(false);
  const isKpiVisible = (label: string) => !visibleKpis || visibleKpis.includes(label);
  const isPlanningVisible = isKpiVisible('Production and Maintenance Planning') || isKpiVisible('Weekly Production Planning');
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
            <Typography sx={{fontSize: 18, fontWeight: 900, color: workstationVisuals.tierTextHeading}}>Delivery</Typography>
            <IconButton onClick={onBack} sx={{width: 28, height: 28, color: tokenBrand.main}}>
              <ExpandIcon sx={{fontSize: 20}} />
            </IconButton>
          </Box>

          <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 1.2, minHeight: 0}}>
            <Box sx={{position: 'relative', display: 'grid', gridTemplateRows: '66px 18px repeat(3, minmax(0, 241px))', gap: 1.1, minHeight: 0, height: '100%', pb: 5.2}}>
              <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1}}>
                {visibleMetricCards.map((metric) => <KpiCard key={metric.label} {...metric} />)}
              </Box>

              <PeriodTabs />

              <Box sx={{display: 'grid', gridTemplateColumns: '1fr', gap: 1, minHeight: 0}}>
                {isPlanningVisible ? <ProductionMaintenancePlanningCard onExpand={() => setIsPlanningCalendarOpen(true)} /> : null}
              </Box>

              <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, minHeight: 0}}>
                {isKpiVisible('Production Output') ? (
                  <Paper elevation={0} sx={{...cardSx, minHeight: 0}}>
                    <CardTitle title="Production Output" />
                    <ChartFrame>
                      <ProductionChart />
                    </ChartFrame>
                  </Paper>
                ) : null}
                {isKpiVisible('OEE') ? (
                  <Paper elevation={0} sx={{...cardSx, minHeight: 0}}>
                    <CardTitle title="OEE" />
                    <ChartFrame>
                      <LineTrendChart dataKey="oee" />
                    </ChartFrame>
                  </Paper>
                ) : null}
              </Box>

              <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, minHeight: 0}}>
                {isKpiVisible('Gemba Walks Deviations') ? (
                  <Paper elevation={0} sx={{...cardSx, minHeight: 0}}>
                    <CardTitle title="Gemba Walks Deviations" />
                    <ChartFrame>
                      <LineTrendChart dataKey="gemba" />
                    </ChartFrame>
                  </Paper>
                ) : null}
                {isKpiVisible('Changeover Tracking') ? <RecentChangeoversCard /> : null}
              </Box>

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
      {isPlanningCalendarOpen ? <PlanningCalendarModal onClose={() => setIsPlanningCalendarOpen(false)} /> : null}
    </Box>
  );
}
