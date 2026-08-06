import {useState} from 'react';
import {Avatar, Box, Button, Paper, Typography} from '@mui/material';
import {LineChart} from '@mui/x-charts/LineChart';
import type {TierMeetingLaneSettings, TierMeetingPillar} from '../../types';
import CircularLaneCalendar from '../CircularLaneCalendar';
import TierMeetingAiInsightCard from '../TierMeetingAiInsightCard';
import TierMeetingLaneGraphicCards from '../TierMeetingLaneGraphicCards';
import TierMeetingKpiCard from '../TierMeetingKpiCard';

type CustomLaneContentProps = {
  pillar: TierMeetingPillar;
  settings: TierMeetingLaneSettings;
  onStartMeeting: () => void;
};

export default function CustomLaneContent({pillar, settings, onStartMeeting}: CustomLaneContentProps) {
  const [hourlyView, setHourlyView] = useState<'production' | 'oee'>('production');
  const visibleGraphicCards = (settings.graphicCardOrder ?? [])
    .map((cardId) => pillar.graphicCards?.find((card) => card.id === cardId))
    .filter((card): card is NonNullable<typeof card> => Boolean(card))
    .filter((card) => settings.visibleGraphicCardIds.includes(card.id));
  const visibleKpis = settings.kpiOrder
    .map((kpiId) => pillar.kpis.find((kpi) => kpi.id === kpiId))
    .filter((kpi): kpi is NonNullable<typeof kpi> => Boolean(kpi))
    .filter((kpi) => settings.visibleKpiIds.includes(kpi.id));
  const visibleComponents = new Set(settings.visibleComponentIds);
  const productionTarget = 60;
  const productionData = [
    40, 45, 38, 42, 50, 48, 60, 55, 85, 72, 98, 82,
    70, 75, 78, 82, 70, 45, 75, 78, 80, 75, 78, 82,
  ];
  const efficiencyData = [
    85, 88, 82, 84, 90, 89, 92, 91, 95, 93, 98, 96,
    92, 94, 95, 96, 94, 68, 94, 95, 96, 94, 95, 96,
  ];
  const axisLabels = [
    '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11',
    '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23',
  ];
  const breakdownTrend = [12.4, 12.1, 11.8, 11.9, 11.6, 11.7];
  const changeoverTrend = [6.8, 6.5, 6.3, 6.4, 6.1, 6.2];

  const sections = settings.componentOrder.map((componentId) => {
    if (!visibleComponents.has(componentId)) return null;

    if (componentId === 'laneGraphics' && visibleGraphicCards.length) {
      return <TierMeetingLaneGraphicCards key="laneGraphics" cards={visibleGraphicCards} />;
    }

    if (componentId === 'aiInsights') {
      return <TierMeetingAiInsightCard key="aiInsights" text={pillar.aiInsightText} />;
    }

    if (componentId === 'dailyTracker' && pillar.dailyTracker) {
      return (
        <Paper key="dailyTracker" elevation={0} sx={{p: 1.3, borderRadius: 3, border: '1px solid #DBDDDF', bgcolor: '#FFFFFF'}}>
          <CircularLaneCalendar tracker={pillar.dailyTracker} />
        </Paper>
      );
    }

    if (componentId === 'kpis') {
      const breakdownKpi = visibleKpis.find((kpi) => kpi.id === 'breakdown');
      const changeoverKpi = visibleKpis.find((kpi) => kpi.id === 'changeover');
      return (
        <Box key="kpis" sx={{display: 'flex', flexDirection: 'column', gap: 1.2}}>
          {[
            {
              title: '2. BREAKDOWN',
              subtitle: '% of time lost',
              kpi: breakdownKpi,
              trend: breakdownTrend,
              tone: '#E43B46',
            },
            {
              title: '3. CHANGEOVER',
              subtitle: '% of time on setups',
              kpi: changeoverKpi,
              trend: changeoverTrend,
              tone: '#E43B46',
            },
          ].map((section) => (
            <Paper key={section.title} elevation={0} sx={{p: 1.1, borderRadius: 2.5, border: '1px solid #DBDDDF'}}>
              <Typography sx={{fontWeight: 900, color: '#111827', fontSize: '1.05rem', lineHeight: 1.1}}>
                {section.title}
              </Typography>
              <Typography sx={{mt: 0.15, color: '#475467', fontSize: '0.82rem', fontWeight: 700}}>
                {section.subtitle}
              </Typography>

              <Box sx={{display: 'inline-flex', gap: 0.45, mt: 0.85, mb: 0.7}}>
                {['DAY', 'SHIFT', 'WEEK'].map((tab, index) => (
                  <Box
                    key={tab}
                    sx={{
                      border: '1px solid #D0D5DD',
                      bgcolor: index === 0 ? '#F2F4F7' : '#F8FAFC',
                      borderRadius: 1,
                      px: 0.9,
                      py: 0.2,
                      fontSize: '0.62rem',
                      fontWeight: 900,
                      color: '#344054',
                    }}
                  >
                    {tab}
                  </Box>
                ))}
              </Box>

              <Box sx={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1}}>
                <Box>
                  <Typography sx={{fontSize: '0.7rem', color: '#475467', fontWeight: 800, letterSpacing: '0.04em'}}>
                    DAY AVERAGE
                  </Typography>
                  <Typography sx={{fontSize: '2.55rem', color: section.tone, fontWeight: 900, lineHeight: 1}}>
                    {section.kpi?.value ?? '-'}
                  </Typography>
                  <Typography sx={{fontSize: '0.95rem', color: '#475467', fontWeight: 900}}>
                    TARGET: <Box component="span" sx={{color: '#175CD3'}}>{`≤ ${section.kpi?.target ?? '-'}`}</Box>
                  </Typography>
                </Box>
                <Sparkline points={section.trend} color={section.tone} />
              </Box>
            </Paper>
          ))}
        </Box>
      );
    }

    if (componentId === 'additionalCards') {
      return (
        <Box key="additionalCards" sx={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1}}>
          {[
            {value: '17', label: 'Days without incidents', tag: 'Safety'},
            {value: '24', label: 'Days without quality issues', tag: 'Quality'},
          ].map((item) => (
            <Paper
              key={item.label}
              elevation={0}
              sx={{
                position: 'relative',
                minHeight: 80,
                pt: 1.1,
                pr: 1.25,
                pb: 0.7,
                pl: 2.1,
                borderRadius: 2.8,
                overflow: 'hidden',
                bgcolor: '#FFFFFF',
                border: '1px solid #DBDDDF',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.45,
              }}
            >
              <Box sx={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, bgcolor: '#044ED7'}} />
              <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1}}>
                <Typography sx={{fontSize: '1.65rem', lineHeight: 1, fontWeight: 900, color: '#17356D'}}>{item.value}</Typography>
                <Typography sx={{fontSize: '0.72rem', fontWeight: 800, color: '#6F7787', letterSpacing: '0.05em'}}>
                  {item.tag.toUpperCase()}
                </Typography>
              </Box>
              <Typography sx={{fontSize: '0.95rem', fontWeight: 800, color: '#626465', letterSpacing: '0.03em', lineHeight: 1.15}}>
                {item.label.toUpperCase()}
              </Typography>
            </Paper>
          ))}
        </Box>
      );
    }

    if (componentId === 'oeeCard') {
      return (
        <Paper key="oeeCard" elevation={0} sx={{position: 'relative', p: 1.3, borderRadius: 2.5, border: '1px solid #DBDDDF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 84}}>
          <Box sx={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, bgcolor: '#044ED7'}} />
          <Box sx={{pl: 1.2}}>
            <Box sx={{display: 'flex', alignItems: 'baseline', gap: 0.3}}>
              <Typography sx={{fontSize: '1.85rem', lineHeight: 1, fontWeight: 900, color: '#17356D'}}>85</Typography>
              <Typography sx={{fontSize: '0.95rem', fontWeight: 800, color: '#6F7787'}}>%</Typography>
            </Box>
            <Typography sx={{fontSize: '0.82rem', fontWeight: 800, color: '#626465', letterSpacing: '0.03em'}}>OEE</Typography>
          </Box>
          <Typography sx={{fontSize: '0.72rem', fontWeight: 800, color: '#6F7787', letterSpacing: '0.05em', pr: 0.8}}>
            TARGET: 95%
          </Typography>
        </Paper>
      );
    }

    if (componentId === 'productInfo') {
      return (
        <Paper key="productInfo" elevation={0} sx={{p: 1.5, borderRadius: 2.5, border: '1px solid #DBDDDF'}}>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.4}}>
            <Box>
              <Typography sx={{fontSize: '0.72rem', color: '#6F7787', fontFamily: 'monospace'}}>110196321</Typography>
              <Typography sx={{fontSize: '0.96rem', fontWeight: 800, color: '#17356D', lineHeight: 1.2}}>
                Nexivia 18 GA x 1 1/4 IN SINGLE PORT
              </Typography>
            </Box>
            <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1}}>
              {[
                {label: 'Up-to-date', value: '359k'},
                {label: 'Expected', value: '402k'},
                {label: 'Scheduled', value: '662k'},
              ].map((item) => (
                <Box key={item.label} sx={{textAlign: 'center'}}>
                  <Typography sx={{fontSize: '0.62rem', color: '#6F7787', fontWeight: 800, textTransform: 'uppercase'}}>
                    {item.label}
                  </Typography>
                  <Typography sx={{fontSize: '1.1rem', color: '#17356D', fontWeight: 900}}>{item.value}</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{position: 'relative', height: 16, borderRadius: '999px', bgcolor: '#F4F7FC', overflow: 'hidden', border: '1px solid #DBDDDF'}}>
              <Box sx={{position: 'absolute', left: 0, top: 0, bottom: 0, width: '54%', bgcolor: '#044ED7'}} />
              <Box sx={{position: 'absolute', left: '54%', top: 0, bottom: 0, width: '8%', bgcolor: '#FF6E00'}} />
            </Box>
          </Box>
        </Paper>
      );
    }

    if (componentId === 'graphsCharts') {
      return (
        <Paper key="graphsCharts" elevation={0} sx={{p: 1.3, borderRadius: 2.5, border: '1px solid #DBDDDF'}}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
            <Typography variant="caption" sx={{display: 'block', fontWeight: 800, color: '#626465'}}>
              {hourlyView === 'production' ? 'CUSTOM PRODUCTION VIEW' : 'CUSTOM OEE VIEW'}
            </Typography>
            <Box sx={{display: 'flex', gap: 0.6}}>
              {(['production', 'oee'] as const).map((view) => (
                <Box
                  key={view}
                  onClick={() => setHourlyView(view)}
                  sx={{
                    width: view === hourlyView ? 18 : 8,
                    height: 8,
                    borderRadius: '999px',
                    bgcolor: view === hourlyView ? '#044ED7' : '#C5CAD3',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
            </Box>
          </Box>
          {hourlyView === 'production' ? (
            <Box sx={{position: 'relative', height: 190, pl: 3.5, pr: 1}}>
              <Box sx={{position: 'absolute', left: 0, top: 10, bottom: 24, width: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end'}}>
                {[100, 50, 0].map((tick) => (
                  <Typography key={tick} sx={{fontSize: '0.62rem', color: '#17356D', lineHeight: 1}}>{tick}</Typography>
                ))}
              </Box>
              <Box sx={{position: 'absolute', left: 28, right: 0, top: 10, bottom: 24, borderLeft: '1px solid #17356D', borderBottom: '1px solid #17356D'}}>
                <Box sx={{position: 'absolute', left: 0, right: 0, top: '0%', borderTop: '1px solid rgba(23,53,109,0.18)'}} />
                <Box sx={{position: 'absolute', left: 0, right: 0, top: '50%', borderTop: '1px solid rgba(23,53,109,0.18)'}} />
                <Box sx={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'flex-end', gap: 0.4, px: 0.8, pt: 1, height: '100%'}}>
                  {productionData.map((value, index) => (
                    <Box
                      key={`${axisLabels[index]}-${index}`}
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        height: `${value}%`,
                        bgcolor: value >= productionTarget ? '#22C55E' : '#E43B46',
                        borderRadius: '3px 3px 0 0',
                      }}
                    />
                  ))}
                </Box>
              </Box>
              <Box sx={{position: 'absolute', left: 28, right: 0, bottom: 0, display: 'flex', gap: 0.4, px: 0.8}}>
                {axisLabels.map((label, index) => (
                  <Box key={`tick-${label}-${index}`} sx={{flex: 1, minWidth: 0, textAlign: 'center'}}>
                    <Typography sx={{fontSize: '0.5rem', color: '#17356D', fontWeight: 700, letterSpacing: '-0.02em'}}>
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ) : (
            <LineChart
              height={190}
              xAxis={[{data: axisLabels, scaleType: 'point', tickLabelStyle: {fontSize: 8}}]}
              yAxis={[{min: 20, max: 100, tickLabelStyle: {fontSize: 8}}]}
              series={[{id: 'oee', data: efficiencyData, label: 'OEE', color: '#044ED7', curve: 'linear'}]}
              margin={{left: 32, right: 12, top: 12, bottom: 24}}
            />
          )}
        </Paper>
      );
    }

    if (componentId === 'recognition') {
      return (
        <Paper key="recognition" elevation={0} sx={{p: {xs: 0.95, xl: 1.2}, borderRadius: 2.5, border: '1px solid #DBDDDF'}}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
            <Typography variant="caption" sx={{display: 'block', fontWeight: 900, color: '#111827', fontSize: '1.05rem'}}>
              Recognition
            </Typography>
            <Typography sx={{fontSize: '1.4rem', color: '#175CD3', fontWeight: 700, lineHeight: 1}}>+</Typography>
          </Box>
          <Typography variant="caption" sx={{display: 'none', fontWeight: 800, color: '#626465', mb: 1, fontSize: {xs: '0.56rem', md: '0.58rem', xl: '0.72rem'}}}>
            RECOGNITION
          </Typography>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.9}}>
            {pillar.recognitions?.map((recognition) => (
              <Box key={recognition.id} sx={{display: 'flex', alignItems: 'flex-start', gap: 1}}>
                <Avatar sx={{width: {xs: 22, xl: 28}, height: {xs: 22, xl: 28}, bgcolor: '#d1fae5', color: '#047857', fontSize: {xs: '0.82rem', xl: '1.5rem'}}}>
                  {recognition.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{fontWeight: 700, fontSize: {xs: '0.68rem', md: '0.72rem', xl: '0.875rem'}}}>{recognition.name}</Typography>
                  <Typography variant="caption" sx={{display: 'block', color: '#047857', fontWeight: 700, fontSize: {xs: '0.6rem', md: '0.62rem', xl: '0.75rem'}}}>
                    {recognition.highlight}
                  </Typography>
                  <Typography variant="caption" sx={{color: '#626465', fontSize: {xs: '0.58rem', md: '0.6rem', xl: '0.75rem'}}}>{recognition.detail}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <Typography sx={{mt: 0.8, textAlign: 'right', color: '#175CD3', fontSize: '0.78rem', fontWeight: 900}}>
            SEE MORE
          </Typography>
        </Paper>
      );
    }

    if (componentId === 'communications') {
      return (
        <Paper key="communications" elevation={0} sx={{p: {xs: 0.95, xl: 1.2}, borderRadius: 2.5, border: '1px solid #DBDDDF'}}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
            <Typography variant="caption" sx={{display: 'block', fontWeight: 900, color: '#111827', fontSize: '1.05rem'}}>
              Communication
            </Typography>
            <Typography sx={{fontSize: '1.4rem', color: '#175CD3', fontWeight: 700, lineHeight: 1}}>+</Typography>
          </Box>
          <Typography variant="caption" sx={{display: 'none', fontWeight: 800, color: '#626465', mb: 1, fontSize: {xs: '0.56rem', md: '0.58rem', xl: '0.72rem'}}}>
            COMMUNICATIONS
          </Typography>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.9}}>
            {pillar.communications?.map((communication) => (
              <Box key={communication.id}>
                <Typography variant="body2" sx={{fontWeight: 700, fontSize: {xs: '0.68rem', md: '0.72rem', xl: '0.875rem'}}}>{communication.title}</Typography>
                <Typography variant="caption" sx={{color: '#626465', fontSize: {xs: '0.58rem', md: '0.6rem', xl: '0.75rem'}}}>{communication.detail}</Typography>
              </Box>
            ))}
          </Box>
          <Typography sx={{mt: 0.8, textAlign: 'right', color: '#175CD3', fontSize: '0.78rem', fontWeight: 900}}>
            SEE MORE
          </Typography>
        </Paper>
      );
    }

    if (componentId === 'focusAreas' && pillar.focusAreas?.length) {
      return (
        <Paper key="focusAreas" elevation={0} sx={{p: 1.2, borderRadius: 2.5, border: '1px solid #DBDDDF'}}>
          <Typography variant="caption" sx={{display: 'block', fontWeight: 800, color: '#626465', mb: 1}}>
            FOCUS AREAS
          </Typography>
          <Box component="ul" sx={{m: 0, pl: 2.2, display: 'flex', flexDirection: 'column', gap: 0.8}}>
            {pillar.focusAreas.map((item) => (
              <Typography key={item} component="li" variant="body2" sx={{color: '#17356D', fontWeight: 700}}>
                {item}
              </Typography>
            ))}
          </Box>
        </Paper>
      );
    }

    if (componentId === 'startMeeting') {
      return (
        <Button key="startMeeting" variant="contained" onClick={onStartMeeting} sx={{fontWeight: 800, bgcolor: pillar.color, '&:hover': {bgcolor: pillar.color}}}>
          Start Meeting
        </Button>
      );
    }

    return null;
  });

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.2}}>
      {sections}
    </Box>
  );
}

type SparklineProps = {
  points: number[];
  color: string;
};

function Sparkline({points, color}: SparklineProps) {
  if (!points.length) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = Math.max(0.0001, max - min);
  const width = 96;
  const height = 34;
  const path = points
    .map((point, index) => {
      const x = (index / Math.max(1, points.length - 1)) * width;
      const y = height - (((point - min) / span) * (height - 2)) - 1;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <Box sx={{width, height, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        <path d={path} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </Box>
  );
}
