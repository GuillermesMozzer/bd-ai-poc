import React from 'react';
import {
  AssignmentTurnedInOutlined as AssignmentTurnedInOutlinedIcon,
  FactoryOutlined as FactoryOutlinedIcon,
  Inventory2Outlined as Inventory2OutlinedIcon,
  LocalShippingOutlined as LocalShippingOutlinedIcon,
  ReportProblemOutlined as ReportProblemOutlinedIcon,
  SecurityOutlined as SecurityOutlinedIcon,
  ShowChartRounded as ShowChartRoundedIcon,
  TaskAltRounded as TaskAltRoundedIcon,
} from '@mui/icons-material';
import {Box, Paper, Typography} from '@mui/material';
import type {DailyProductionKpi, PerformanceStatusTone} from '../types';
import {
  deriveAchievementStatus,
  deriveOnTimeStatus,
  deriveQualityYieldStatus,
  formatDeltaUnits,
  formatPercent,
  formatUnits,
} from '../utils';

const moduleCardSx = {
  borderRadius: 4,
  border: '1px solid var(--planning-border)',
  bgcolor: 'var(--planning-surface)',
  boxShadow: 'var(--planning-soft-shadow)',
} as const;

const toneMap: Record<PerformanceStatusTone, {bg: string; color: string}> = {
  green: {bg: '#ECFDF3', color: '#027A48'},
  orange: {bg: '#FFF7ED', color: '#C2410C'},
  red: {bg: '#FEF2F2', color: '#B42318'},
  gray: {bg: '#F2F4F7', color: 'var(--planning-text-secondary)'},
  blue: {bg: '#EFF6FF', color: '#1D4ED8'},
};

export default function DailyProductionKpiCards({kpis}: {kpis: DailyProductionKpi}) {
  const cards = [
    {
      key: 'total-lines',
      label: 'Total Lines',
      value: String(kpis.totalLines),
      helper: `${kpis.activeLines} active lines`,
      tone: 'blue' as const,
      icon: <FactoryOutlinedIcon sx={{fontSize: 18}} />,
    },
    {
      key: 'plan-achievement',
      label: 'Plan Achievement',
      value: formatPercent(kpis.planAchievementPercent),
      helper: 'Target: >= 90%',
      tone: deriveAchievementStatus(kpis.planAchievementPercent),
      icon: <TaskAltRoundedIcon sx={{fontSize: 18}} />,
    },
    {
      key: 'total-plan',
      label: 'Total Plan',
      value: formatUnits(kpis.totalPlanUnits),
      helper: 'Units',
      tone: 'blue' as const,
      icon: <AssignmentTurnedInOutlinedIcon sx={{fontSize: 18}} />,
    },
    {
      key: 'total-actual',
      label: 'Total Actual',
      value: formatUnits(kpis.totalActualUnits),
      helper: 'Units',
      tone: 'green' as const,
      icon: <Inventory2OutlinedIcon sx={{fontSize: 18}} />,
    },
    {
      key: 'variance',
      label: 'Variance',
      value: formatDeltaUnits(kpis.totalVarianceUnits),
      helper: `${kpis.totalPlanUnits > 0 ? ((kpis.totalVarianceUnits / kpis.totalPlanUnits) * 100).toFixed(1) : '0.0'}%`,
      tone: kpis.totalVarianceUnits >= 0 ? 'green' : 'red',
      icon: <ReportProblemOutlinedIcon sx={{fontSize: 18}} />,
    },
    {
      key: 'on-time',
      label: 'On-Time Orders',
      value: formatPercent(kpis.onTimeOrdersPercent),
      helper: 'Target: >= 85%',
      tone: deriveOnTimeStatus(kpis.onTimeOrdersPercent),
      icon: <LocalShippingOutlinedIcon sx={{fontSize: 18}} />,
    },
    {
      key: 'quality',
      label: 'Quality Yield',
      value: formatPercent(kpis.qualityYieldPercent),
      helper: 'Target: >= 95%',
      tone: deriveQualityYieldStatus(kpis.qualityYieldPercent),
      icon: <ShowChartRoundedIcon sx={{fontSize: 18}} />,
    },
    {
      key: 'safety',
      label: 'Safety Incidents',
      value: String(kpis.safetyIncidents),
      helper: 'Target: 0',
      tone: kpis.safetyIncidents === 0 ? 'blue' : 'red',
      icon: <SecurityOutlinedIcon sx={{fontSize: 18}} />,
    },
  ];

  return (
    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(4, minmax(0, 1fr))', xl: 'repeat(8, minmax(0, 1fr))'}, gap: 1.2}}>
      {cards.map((card) => {
        const tone = toneMap[card.tone];
        return (
          <Paper key={card.key} elevation={0} sx={{...moduleCardSx, p: 1.8}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.2}}>
              <Box sx={{minWidth: 0}}>
                <Typography sx={{fontSize: 12, fontWeight: 800, color: 'var(--planning-text-secondary)'}}>{card.label}</Typography>
                <Typography sx={{fontSize: 28, lineHeight: 1.05, fontWeight: 900, color: tone.color, mt: 0.65}}>
                  {card.value}
                </Typography>
                <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', mt: 0.55}}>{card.helper}</Typography>
              </Box>
              <Box sx={{width: 34, height: 34, borderRadius: 2, bgcolor: tone.bg, color: tone.color, display: 'grid', placeItems: 'center'}}>
                {card.icon}
              </Box>
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}
