import {Avatar, Box, Button, Paper, Typography} from '@mui/material';
import {WarningAmber as WarningIcon} from '@mui/icons-material';
import TierMeetingAiInsightCard from '../TierMeetingAiInsightCard';
import TierMeetingLaneGraphicCards from '../TierMeetingLaneGraphicCards';
import TierMeetingKpiCard from '../TierMeetingKpiCard';
import type {TierMeetingLaneSettings, TierMeetingPillar} from '../../types';

type PeopleLaneContentProps = {
  pillar: TierMeetingPillar;
  settings: TierMeetingLaneSettings;
  onStartMeeting: () => void;
};

export default function PeopleLaneContent({pillar, settings, onStartMeeting}: PeopleLaneContentProps) {
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

    if (componentId === 'graphsCharts' && visibleComponents.has(componentId)) {
      return (
        <Box key="graphsCharts" sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
          <Paper
            elevation={0}
            sx={{
              p: 1.05,
              borderRadius: 2.1,
              border: '1px solid #F3C7CC',
              bgcolor: '#FFF4F5',
              display: 'flex',
              alignItems: 'center',
              gap: 0.8,
            }}
          >
            <WarningIcon sx={{color: '#E43B46', fontSize: 18}} />
            <Box>
              <Typography sx={{fontSize: '0.9rem', fontWeight: 900, color: '#D92D20', lineHeight: 1.1}}>
                Shift at Risk
              </Typography>
              <Typography sx={{fontSize: '0.84rem', fontWeight: 800, color: '#E43B46', lineHeight: 1.1}}>
                33% of the Team is absent
              </Typography>
            </Box>
          </Paper>

          <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1}}>
            {[
              {label: 'Absences', value: '2', tone: '#E43B46'},
              {label: 'Days Off', value: '5', tone: '#16A34A'},
              {label: 'Medical Leaves', value: '1', tone: '#E43B46'},
              {label: 'Vacation', value: '2', tone: '#16A34A'},
            ].map((item) => (
              <Paper
                key={item.label}
                elevation={0}
                sx={{
                  p: 1.15,
                  borderRadius: 2.5,
                  border: '1px solid #DBDDDF',
                  borderLeft: `4px solid ${item.tone}`,
                }}
              >
                <Typography sx={{fontSize: {xs: '0.86rem', md: '0.9rem', xl: '1.45rem'}, lineHeight: 1, fontWeight: 900, color: item.tone}}>
                  {item.value}
                </Typography>
                <Typography sx={{mt: 0.55, fontSize: {xs: '0.5rem', md: '0.52rem', xl: '0.78rem'}, fontWeight: 800, color: '#626465', letterSpacing: '0.03em', textTransform: 'uppercase'}}>
                  {item.label}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      );
    }

    if (componentId === 'kpis' && visibleComponents.has(componentId)) {
      return (
        <Box key="kpis" sx={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1}}>
          {visibleKpis.map((kpi) => <TierMeetingKpiCard key={kpi.id} kpi={kpi} />)}
        </Box>
      );
    }

    if (componentId === 'recognition' && visibleComponents.has(componentId)) {
      return (
        <Paper key="recognition" elevation={0} sx={{p: {xs: 0.95, xl: 1.2}, borderRadius: 2.5, border: '1px solid #DBDDDF'}}>
          <Typography variant="caption" sx={{display: 'block', fontWeight: 800, color: '#626465', mb: 1, fontSize: {xs: '0.56rem', md: '0.58rem', xl: '0.72rem'}}}>
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
        </Paper>
      );
    }

    if (componentId === 'communications' && visibleComponents.has(componentId)) {
      return (
        <Paper key="communications" elevation={0} sx={{p: {xs: 0.95, xl: 1.2}, borderRadius: 2.5, border: '1px solid #DBDDDF'}}>
          <Typography variant="caption" sx={{display: 'block', fontWeight: 800, color: '#626465', mb: 1, fontSize: {xs: '0.56rem', md: '0.58rem', xl: '0.72rem'}}}>
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
        </Paper>
      );
    }

    if (componentId === 'startMeeting' && visibleComponents.has(componentId)) {
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
