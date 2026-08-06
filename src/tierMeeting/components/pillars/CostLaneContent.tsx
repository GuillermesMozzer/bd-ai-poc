import {Box, Paper, Typography} from '@mui/material';
import TierMeetingAiInsightCard from '../TierMeetingAiInsightCard';
import TierMeetingLaneGraphicCards from '../TierMeetingLaneGraphicCards';
import TierMeetingKpiCard from '../TierMeetingKpiCard';
import type {TierMeetingLaneSettings, TierMeetingPillar} from '../../types';

type CostLaneContentProps = {
  pillar: TierMeetingPillar;
  settings: TierMeetingLaneSettings;
};

export default function CostLaneContent({pillar, settings}: CostLaneContentProps) {
  const visibleGraphicCards = (settings.graphicCardOrder ?? [])
    .map((cardId) => pillar.graphicCards?.find((card) => card.id === cardId))
    .filter((card): card is NonNullable<typeof card> => Boolean(card))
    .filter((card) => settings.visibleGraphicCardIds.includes(card.id));
  const visibleKpis = settings.kpiOrder
    .map((kpiId) => pillar.kpis.find((kpi) => kpi.id === kpiId))
    .filter((kpi): kpi is NonNullable<typeof kpi> => Boolean(kpi))
    .filter((kpi) => settings.visibleKpiIds.includes(kpi.id));
  const visibleComponents = new Set(settings.visibleComponentIds);
  const scrapTarget = 15;
  const downtimeTarget = 40;
  const scrapData = [28, 18, 11, 10, 12, 14, 18, 28, 11, 7, 5, 6, 7, 17, 20, 18, 16, 15, 28, 11, 13, 12, 12, 18];
  const downtimeData = [30, 45, 48, 45, 46, 40, 25, 32, 42, 68, 65, 60, 58, 62, 60, 68, 70, 65, 70, 70, 68, 98, 65, 72];
  const scrapAxisLabels = [
    '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11',
    '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23',
  ];
  const downtimeAxisLabels = [
    '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11',
    '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23',
  ];

  const sections = settings.componentOrder.map((componentId) => {
    if (componentId === 'laneGraphics' && visibleComponents.has(componentId) && visibleGraphicCards.length) {
      return <TierMeetingLaneGraphicCards key="laneGraphics" cards={visibleGraphicCards} />;
    }

    if (componentId === 'aiInsights' && visibleComponents.has(componentId)) {
      return <TierMeetingAiInsightCard key="aiInsights" text={pillar.aiInsightText} />;
    }

    if (componentId === 'kpis' && visibleComponents.has(componentId)) {
      return (
        <Box key="kpis" sx={{display: 'grid', gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', gap: 1}}>
          {visibleKpis.map((kpi) => <TierMeetingKpiCard key={kpi.id} kpi={kpi} />)}
        </Box>
      );
    }

    if (componentId === 'graphsCharts' && visibleComponents.has(componentId)) {
      return (
        <Box key="graphsCharts" sx={{display: 'flex', flexDirection: 'column', gap: 1.2}}>
          <Paper elevation={0} sx={{p: {xs: 1, xl: 1.3}, borderRadius: 2.5, border: '1px solid #DBDDDF'}}>
            <Typography variant="caption" sx={{display: 'block', fontWeight: 800, color: '#626465', mb: 1, fontSize: {xs: '0.56rem', md: '0.58rem', xl: '0.72rem'}}}>
              HOURLY SCRAP PRODUCTION
            </Typography>
            <HourlyCostBars data={scrapData} axisLabels={scrapAxisLabels} target={scrapTarget} />
          </Paper>
          <Paper elevation={0} sx={{p: {xs: 1, xl: 1.3}, borderRadius: 2.5, border: '1px solid #DBDDDF'}}>
            <Typography variant="caption" sx={{display: 'block', fontWeight: 800, color: '#626465', mb: 1, fontSize: {xs: '0.56rem', md: '0.58rem', xl: '0.72rem'}}}>
              HOURLY DOWNTIME
            </Typography>
            <HourlyCostBars data={downtimeData} axisLabels={downtimeAxisLabels} target={downtimeTarget} />
          </Paper>
        </Box>
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

type HourlyCostBarsProps = {
  data: number[];
  axisLabels: string[];
  target: number;
};

function HourlyCostBars({data, axisLabels, target}: HourlyCostBarsProps) {
  return (
    <Box sx={{position: 'relative', height: {xs: 160, xl: 180}, pl: {xs: 2.6, xl: 3.5}, pr: 1}}>
      <Box sx={{position: 'absolute', left: 0, top: 10, bottom: 24, width: {xs: 20, xl: 28}, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end'}}>
        {[100, 50, 0].map((tick) => (
          <Typography key={tick} sx={{fontSize: {xs: '0.5rem', md: '0.52rem', xl: '0.62rem'}, color: '#17356D', lineHeight: 1}}>
            {tick}
          </Typography>
        ))}
      </Box>
      <Box sx={{position: 'absolute', left: {xs: 20, xl: 28}, right: 0, top: 10, bottom: 24, borderLeft: '1px solid #17356D', borderBottom: '1px solid #17356D'}}>
        <Box sx={{position: 'absolute', left: 0, right: 0, top: '0%', borderTop: '1px solid rgba(23,53,109,0.18)'}} />
        <Box sx={{position: 'absolute', left: 0, right: 0, top: '50%', borderTop: '1px solid rgba(23,53,109,0.18)'}} />
        <Box sx={{position: 'absolute', left: 0, right: 0, bottom: `${target}%`, borderTop: '1px dashed #C5CAD3'}} />
        <Box sx={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'flex-end', gap: 0.35, px: 0.8, pt: 1, height: '100%'}}>
          {data.map((value, index) => (
            <Box
              key={`${axisLabels[index]}-${index}`}
              sx={{
                flex: 1,
                minWidth: 0,
                height: `${value}%`,
                bgcolor: value < target ? '#E43B46' : '#22C55E',
                borderRadius: '3px 3px 0 0',
              }}
            />
          ))}
        </Box>
      </Box>
      <Box sx={{position: 'absolute', left: {xs: 20, xl: 28}, right: 0, bottom: 0, display: 'flex', gap: 0.35, px: 0.8}}>
        {axisLabels.map((label, index) => (
          <Box key={`tick-${label}-${index}`} sx={{flex: 1, minWidth: 0, textAlign: 'center'}}>
            <Typography sx={{fontSize: {xs: '0.4rem', md: '0.42rem', xl: '0.5rem'}, color: '#17356D', fontWeight: 700, letterSpacing: '-0.02em'}}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
