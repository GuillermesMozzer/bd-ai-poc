import {Box, Paper, Typography} from '@mui/material';
import type {TierMeetingLaneSettings, TierMeetingPillar} from '../../types';
import CircularLaneCalendar from '../CircularLaneCalendar';
import TierMeetingAiInsightCard from '../TierMeetingAiInsightCard';
import TierMeetingLaneGraphicCards from '../TierMeetingLaneGraphicCards';
import TierMeetingKpiCard from '../TierMeetingKpiCard';

type SafetyLaneContentProps = {
  pillar: TierMeetingPillar;
  settings: TierMeetingLaneSettings;
};

export default function SafetyLaneContent({pillar, settings}: SafetyLaneContentProps) {
  const visibleGraphicCards = (settings.graphicCardOrder ?? [])
    .map((cardId) => pillar.graphicCards?.find((card) => card.id === cardId))
    .filter((card): card is NonNullable<typeof card> => Boolean(card))
    .filter((card) => settings.visibleGraphicCardIds.includes(card.id));
  const visibleKpis = settings.kpiOrder
    .map((kpiId) => pillar.kpis.find((kpi) => kpi.id === kpiId))
    .filter((kpi): kpi is NonNullable<typeof kpi> => Boolean(kpi))
    .filter((kpi) => settings.visibleKpiIds.includes(kpi.id));
  const visibleComponents = new Set(settings.visibleComponentIds);
  const sections = settings.componentOrder.map((componentId) => {
    if (componentId === 'laneGraphics' && visibleComponents.has(componentId) && visibleGraphicCards.length) {
      return <TierMeetingLaneGraphicCards key="laneGraphics" cards={visibleGraphicCards} />;
    }

    if (componentId === 'aiInsights' && visibleComponents.has(componentId)) {
      return <TierMeetingAiInsightCard key="aiInsights" text={pillar.aiInsightText} />;
    }

    if (componentId === 'dailyTracker' && visibleComponents.has(componentId) && pillar.dailyTracker) {
      return (
        <Paper
          key="dailyTracker"
          elevation={0}
          sx={{
            p: 1.3,
            borderRadius: 3,
            border: '1px solid #DBDDDF',
            bgcolor: '#FFFFFF',
          }}
        >
          <CircularLaneCalendar tracker={pillar.dailyTracker} />
        </Paper>
      );
    }

    if (componentId === 'kpis' && visibleComponents.has(componentId)) {
      return (
        <Box key="kpis" sx={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1}}>
          {visibleKpis.map((kpi) => (
            <TierMeetingKpiCard key={kpi.id} kpi={kpi} />
          ))}
        </Box>
      );
    }

    if (componentId === 'additionalCards' && visibleComponents.has(componentId)) {
      return (
        <Box key="additionalCards" sx={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1}}>
          {[
            {value: '17', label: 'Days without incidents', tag: 'Current'},
            {value: '142', label: 'Longest period', tag: 'Record'},
          ].map((item) => (
            <Paper
              key={item.label}
              elevation={0}
              sx={{
                position: 'relative',
                minHeight: {xs: 66, xl: 80},
                pt: {xs: 0.8, xl: 1.1},
                pr: {xs: 0.9, xl: 1.25},
                pb: {xs: 0.55, xl: 0.7},
                pl: {xs: 1.45, xl: 2.1},
                borderRadius: 2.8,
                overflow: 'hidden',
                bgcolor: '#FFFFFF',
                border: '1px solid #DBDDDF',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.45,
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: {xs: 4, xl: 6},
                  bgcolor: '#044ED7',
                }}
              />
              <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1}}>
                <Typography sx={{fontSize: {xs: '0.9rem', md: '0.92rem', xl: '1.65rem'}, lineHeight: 1, fontWeight: 900, color: '#17356D'}}>
                  {item.value}
                </Typography>
                <Typography sx={{fontSize: {xs: '0.46rem', md: '0.48rem', xl: '0.72rem'}, fontWeight: 800, color: '#6F7787', letterSpacing: '0.05em'}}>
                  {item.tag.toUpperCase()}
                </Typography>
              </Box>
              <Typography sx={{fontSize: {xs: '0.58rem', md: '0.6rem', xl: '0.95rem'}, fontWeight: 800, color: '#626465', letterSpacing: '0.03em', lineHeight: 1.15}}>
                {item.label.toUpperCase()}
              </Typography>
            </Paper>
          ))}
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
