import { useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import TierMeetingAiInsightCard from '../TierMeetingAiInsightCard';
import TierMeetingLaneGraphicCards from '../TierMeetingLaneGraphicCards';
import TierMeetingKpiCard from '../TierMeetingKpiCard';
import type { TierMeetingLaneSettings, TierMeetingPillar } from '../../types';

type DeliveryLaneContentProps = {
  pillar: TierMeetingPillar;
  settings: TierMeetingLaneSettings;
};

export default function DeliveryLaneContent({ pillar, settings }: DeliveryLaneContentProps) {
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

  const sections = settings.componentOrder.map((componentId) => {
    if (componentId === 'laneGraphics' && visibleComponents.has(componentId) && visibleGraphicCards.length) {
      return <TierMeetingLaneGraphicCards key="laneGraphics" cards={visibleGraphicCards} />;
    }

    if (componentId === 'aiInsights' && visibleComponents.has(componentId)) {
      return <TierMeetingAiInsightCard key="aiInsights" text={pillar.aiInsightText} />;
    }

    if (componentId === 'kpis' && visibleComponents.has(componentId)) {
      return (
        <Box key="kpis" sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>
          {visibleKpis.map((kpi) => <TierMeetingKpiCard key={kpi.id} kpi={kpi} />)}
        </Box>
      );
    }

    if (componentId === 'oeeCard' && visibleComponents.has(componentId)) {
      return (
        <Paper key="oeeCard" elevation={0} sx={{ position: 'relative', p: 1.3, borderRadius: 2.5, border: '1px solid #DBDDDF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 84 }}>
          <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, bgcolor: '#044ED7' }} />
          <Box sx={{ pl: 1.2 }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.3 }}>
              <Typography sx={{ fontSize: {xs: '1rem', md: '1.02rem', xl: '1.85rem'}, lineHeight: 1, fontWeight: 900, color: '#17356D' }}>85</Typography>
              <Typography sx={{ fontSize: {xs: '0.56rem', md: '0.58rem', xl: '0.95rem'}, fontWeight: 800, color: '#6F7787' }}>%</Typography>
            </Box>
            <Typography sx={{ fontSize: {xs: '0.54rem', md: '0.56rem', xl: '0.82rem'}, fontWeight: 800, color: '#626465', letterSpacing: '0.03em' }}>
              OEE
            </Typography>
          </Box>
          <Typography sx={{ fontSize: {xs: '0.46rem', md: '0.48rem', xl: '0.72rem'}, fontWeight: 800, color: '#6F7787', letterSpacing: '0.05em', pr: 0.8 }}>
            TARGET: 95%
          </Typography>
        </Paper>
      );
    }

    if (componentId === 'productInfo' && visibleComponents.has(componentId)) {
      return (
        <Paper key="productInfo" elevation={0} sx={{ p: 1.5, borderRadius: 2.5, border: '1px solid #DBDDDF' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.4 }}>
            <Box>
              <Typography sx={{ fontSize: '0.72rem', color: '#6F7787', fontFamily: 'monospace' }}>
                110196321
              </Typography>
              <Typography sx={{ fontSize: {xs: '0.62rem', md: '0.64rem', xl: '0.96rem'}, fontWeight: 800, color: '#17356D', lineHeight: 1.2 }}>
                Nexivia 18 GA x 1 1/4 IN SINGLE PORT
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1 }}>
              {[
                { label: 'Up-to-date', value: '359k' },
                { label: 'Expected', value: '402k' },
                { label: 'Scheduled', value: '662k' },
              ].map((item) => (
                <Box key={item.label} sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.62rem', color: '#6F7787', fontWeight: 800, textTransform: 'uppercase' }}>
                    {item.label}
                  </Typography>
                  <Typography sx={{ fontSize: {xs: '0.72rem', md: '0.74rem', xl: '1.1rem'}, color: '#17356D', fontWeight: 900 }}>
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ position: 'relative', height: 16, borderRadius: '999px', bgcolor: '#F4F7FC', overflow: 'hidden', border: '1px solid #DBDDDF' }}>
              <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '54%', bgcolor: '#044ED7' }} />
              <Box sx={{ position: 'absolute', left: '54%', top: 0, bottom: 0, width: '8%', bgcolor: '#FF6E00' }} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: {xs: '0.72rem', md: '0.74rem', xl: '1.1rem'}, color: '#17356D', fontWeight: 900 }}>43k</Typography>
                <Typography sx={{ fontSize: '0.62rem', color: '#6F7787', fontWeight: 800, textTransform: 'uppercase' }}>
                  Difference
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      );
    }

    if (componentId === 'graphsCharts' && visibleComponents.has(componentId)) {
      return (
        <Paper key="graphsCharts" elevation={0} sx={{ p: {xs: 1, xl: 1.3}, borderRadius: 2.5, border: '1px solid #DBDDDF' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: '#626465', fontSize: {xs: '0.56rem', md: '0.58rem', xl: '0.72rem'} }}>
              {hourlyView === 'production' ? 'HOURLY PRODUCTION' : 'OEE'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.6 }}>
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
              <Box sx={{ position: 'relative', height: {xs: 168, xl: 190}, pl: {xs: 2.6, xl: 3.5}, pr: 1 }}>
                <Box sx={{ position: 'absolute', left: 0, top: 10, bottom: 24, width: {xs: 20, xl: 28}, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  {[100, 50, 0].map((tick) => (
                    <Typography key={tick} sx={{ fontSize: {xs: '0.5rem', md: '0.52rem', xl: '0.62rem'}, color: '#17356D', lineHeight: 1 }}>
                      {tick}
                    </Typography>
                  ))}
                </Box>
                <Box sx={{ position: 'absolute', left: {xs: 20, xl: 28}, right: 0, top: 10, bottom: 24, borderLeft: '1px solid #17356D', borderBottom: '1px solid #17356D' }}>
                  <Box sx={{ position: 'absolute', left: 0, right: 0, top: '0%', borderTop: '1px solid rgba(23,53,109,0.18)' }} />
                  <Box sx={{ position: 'absolute', left: 0, right: 0, top: '50%', borderTop: '1px solid rgba(23,53,109,0.18)' }} />
                  <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'flex-end', gap: 0.4, px: 0.8, pt: 1, height: '100%' }}>
                    {productionData.map((value, index) => {
                      const isNightShift = index < 12;
                      const meetsTarget = value >= productionTarget;
                      const barColor = meetsTarget
                        ? (isNightShift ? '#15803D' : '#22C55E')
                        : (isNightShift ? '#B4232D' : '#E43B46');

                      return (
                        <Box
                          key={`${axisLabels[index]}-${index}`}
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            height: `${value}%`,
                            bgcolor: barColor,
                            borderRadius: '3px 3px 0 0',
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>
                <Box
                  sx={{
                    pointerEvents: 'none',
                    position: 'absolute',
                    top: 10,
                    bottom: 24,
                    left: {xs: 'calc(50% + 10px)', xl: 'calc(50% + 14px)'},
                    borderLeft: '1px dashed #C5CAD3',
                    transform: 'translateX(-50%)',
                  }}
                />
                <Box sx={{ position: 'absolute', left: {xs: 20, xl: 28}, right: 0, bottom: 0, display: 'flex', gap: 0.4, px: 0.8 }}>
                  {axisLabels.map((label, index) => (
                    <Box key={`tick-${label}-${index}`} sx={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: {xs: '0.4rem', md: '0.42rem', xl: '0.5rem'}, color: '#17356D', fontWeight: 700, letterSpacing: '-0.02em' }}>
                        {label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.8 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: 0.6, bgcolor: '#15803D' }} />
                  <Typography sx={{ fontSize: {xs: '0.56rem', md: '0.58rem', xl: '0.68rem'}, color: '#6F7787', fontWeight: 800 }}>
                    Night Shift
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.8 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: 0.6, bgcolor: '#22C55E' }} />
                  <Typography sx={{ fontSize: {xs: '0.56rem', md: '0.58rem', xl: '0.68rem'}, color: '#6F7787', fontWeight: 800 }}>
                    Day Shift
                  </Typography>
                </Box>
              </Box>

            </Box>
          ) : (
            <LineChart
              height={190}
              xAxis={[{ data: axisLabels, scaleType: 'point', tickLabelStyle: { fontSize: 6 } }]}
              yAxis={[{ min: 20, max: 100, tickLabelStyle: { fontSize: 6 } }]}
              series={[{
                id: 'oee',
                data: efficiencyData,
                label: 'OEE',
                color: '#044ED7',
                curve: 'linear',
              }]}
              margin={{ left: 32, right: 12, top: 12, bottom: 24 }}
            />
          )}
        </Paper>
      );
    }

    return null;
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
      {sections}
    </Box>
  );
}
