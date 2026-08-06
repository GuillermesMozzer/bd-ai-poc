import { workstationVisuals } from '../theme';
import {useEffect, useState} from 'react';
import {Box, IconButton, Paper, Typography} from '@mui/material';
import {
  AutoAwesome as SparkleIcon,
  OpenInFull as OpenInFullIcon,
} from '@mui/icons-material';
import {
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  qualityNotificationConfig,
  useWidgetNotifications,
} from './WidgetNotifications';
import WidgetLetterBadge from './WidgetLetterBadge';

const qualityMetrics = [
  {label: 'Field actions', value: '2', color: '#9AA1A8'},
  {label: 'Complaints', value: '2', target: '4', color: '#39B766'},
  {label: 'NCs', value: '1', target: '5', color: '#39B766'},
  {label: 'CAPAs', value: '4', color: '#9AA1A8'},
  {label: 'Days Without Issues', value: '13', target: '103', targetLabel: 'Record', color: '#9AA1A8'},
] as const;

const tier1QualityMetrics = [
  {label: 'Field Actions', value: '2', target: '2', color: '#39B766'},
  {label: 'Complaints', value: '2', target: '4', color: '#39B766'},
  {label: 'NCS', value: '1', target: '5', color: '#39B766'},
  {label: 'CAPAs', value: '4', target: '4', color: '#39B766'},
  {label: 'Days Without Issues', value: '13', target: '127', targetLabel: 'Record', color: '#9AA1A8'},
] as const;

const qualityLineOverview = [
  {name: 'Line 01', value: '0 NCs', delta: '-1', tone: '#10B64B', trend: [2, 1, 1, 0, 0, 0, 0, 0]},
  {name: 'Line 02', value: '1 NC', delta: '0', tone: '#FFB33B', trend: [1, 1, 0, 1, 0, 1, 1, 1]},
  {name: 'Line 03', value: '3 NCs', delta: '+2', tone: '#FF2424', trend: [1, 2, 2, 3, 2, 3, 3, 3]},
  {name: 'Line 04', value: '1 CAPA', delta: '-1', tone: '#10B64B', trend: [3, 2, 2, 1, 2, 1, 1, 1]},
];

function QualityRing({enlarged = false}: {enlarged?: boolean}) {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: enlarged ? 'clamp(2px, 0.7cqw, 5px) clamp(10px, 2.2cqw, 15px) clamp(2px, 0.7cqw, 5px) clamp(10px, 2.2cqw, 15px)' : 'clamp(8px, 1.8cqw, 14px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        component="img"
        src="/images/Q%20Quality.png"
        alt="Quality calendar"
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </Box>
  );
}

function MetricCard({
  label,
  target,
  targetLabel = 'Target',
  color,
  value,
  tierOneStyle = false,
}: {
  label: string;
  target?: string;
  targetLabel?: string;
  color: string;
  value: string;
  tierOneStyle?: boolean;
}) {
  const targetValueColor = color === '#FF2424' ? '#4C83FF' : color;

  if (tierOneStyle) {
    return (
      <Paper elevation={0} className="sqdc-metric-card" sx={{
        position: 'relative',
        height: 66,
        minHeight: 66,
        pl: 1.55,
        pr: 1,
        py: 0.8,
        borderRadius: '6px',
        bgcolor: '#EEF3F6',
        border: '1px solid #E6EBEF',
        boxShadow: '0 3px 10px rgba(23, 84, 180, 0.14)',
        overflow: 'hidden',
        cursor: 'default',
      }}>
        <Box sx={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, bgcolor: color}} />
        <Box sx={{display: 'flex', justifyContent: 'space-between', height: '100%', gap: 1}}>
          <Box sx={{minWidth: 0}}>
            <Typography className="sqdc-metric-value" sx={{fontSize: 29, lineHeight: 0.95, color: '#202326', fontWeight: 400}}>{value}</Typography>
            <Typography className="sqdc-metric-label" sx={{fontSize: 11, lineHeight: 1, color: '#202326', mt: 0.15}}>{label}</Typography>
          </Box>
          {target ? (
            <Box sx={{pt: 1.1, textAlign: 'right', flexShrink: 0}}>
              <Typography className="sqdc-metric-target" sx={{fontSize: 8.5, letterSpacing: 0, color: '#4E565C', fontWeight: 700, textTransform: 'uppercase'}}>{targetLabel}</Typography>
              <Box sx={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 20, height: 18, px: 0.55, mt: 0.15, borderRadius: 999, bgcolor: '#DDE4E8', color: '#2E3338', fontSize: 10, fontWeight: 800}}>
                {target}
              </Box>
            </Box>
          ) : null}
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} className="sqdc-metric-card" sx={{
      position: 'relative',
      minHeight: 'clamp(66px, 16cqw, 78px)',
      px: 'clamp(10px, 2.3cqw, 14px)',
      py: 'clamp(9px, 2cqw, 12px)',
      border: '1px solid #E4E8EF',
      borderRadius: 1.15,
      overflow: 'hidden',
      bgcolor: '#F8FAFC',
      boxShadow: 'none',
      cursor: 'default',
    }}>
      <Box sx={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: color}} />
      <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1, height: '100%'}}>
        <Box sx={{minWidth: 0}}>
          <Typography className="sqdc-metric-value" sx={{fontSize: 'clamp(24px, 6.5cqw, 33px)', lineHeight: 0.9, color, fontWeight: 500}}>{value}</Typography>
          <Typography className="sqdc-metric-label" sx={{fontSize: 'clamp(10px, 2.3cqw, 12px)', color, lineHeight: 1.15, mt: 0.7}}>{label}</Typography>
        </Box>
        {target ? (
          <Typography className="sqdc-metric-target" sx={{fontSize: 'clamp(10px, 2cqw, 12px)', color: '#4C83FF', fontWeight: 500, whiteSpace: 'nowrap', mt: 0.1}}>
            {targetLabel}&nbsp;<Box component="span" sx={{color: targetValueColor}}>{target}</Box>
          </Typography>
        ) : null}
      </Box>
    </Paper>
  );
}

type MyQualityWidgetProps = {
  onExpand?: () => void;
  useTierCarousel?: boolean;
  overviewLabel?: string;
  overviewItemPrefix?: string;
};

export default function MyQualityWidget({onExpand, useTierCarousel = false, overviewLabel = 'Line overview', overviewItemPrefix = 'Line'}: MyQualityWidgetProps) {
  const notifications = useWidgetNotifications(qualityNotificationConfig);

  return (
    <Paper elevation={0} sx={{
      width: '100%',
      height: '100%',
      minHeight: 0,
      p: 'clamp(8px, 1.7cqw, 12px)',
      borderRadius: 1.8,
      bgcolor: '#FFFFFF',
      border: '1px solid #DDE4EF',
      boxShadow: '0 1px 2px rgba(17, 24, 39, 0.08), 0 0 0 1px rgba(31, 91, 255, 0.04)',
      overflow: 'hidden',
      containerType: 'inline-size',
      display: 'grid',
      gridTemplateRows: useTierCarousel ? 'auto minmax(142px, 1.15fr) 78px minmax(118px, 0.85fr)' : 'auto minmax(90px, 1fr) auto auto',
      gap: 'clamp(3px, 1.1cqw, 8px)',
      '@container (max-width: 260px)': {
        p: 1,
        gridTemplateRows: useTierCarousel ? 'auto minmax(126px, 1.05fr) 76px minmax(112px, 0.85fr)' : 'auto minmax(76px, 0.8fr) auto auto',
        '& .sqdc-header-actions': {gap: 0.2},
        '& .sqdc-title': {fontSize: 20},
        '& .sqdc-metric-card': {p: '7px', pl: '10px'},
        '& .sqdc-metric-value': {fontSize: 22},
        '& .sqdc-metric-label': {fontSize: 10.5},
        '& .sqdc-metric-target': {fontSize: 9},
      },
    }}>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 'clamp(40px, 9cqw, 52px)', px: 'clamp(3px, 1.2cqw, 8px)'}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 'clamp(10px, 2.7cqw, 17px)', minWidth: 0}}>
          <WidgetLetterBadge letter="Q" defaultTone="red" />
          <Typography className="sqdc-title" sx={{fontSize: 'clamp(16px, 3.4cqw, 20px)', color: workstationVisuals.textPrimary, fontWeight: 800, fontFamily: workstationVisuals.fontFamily, lineHeight: 1}}>
            Quality
          </Typography>
        </Box>
        <Box className="sqdc-header-actions" sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
          <SparkleIcon sx={{fontSize: 'clamp(17px, 4cqw, 21px)', color: '#E5EBF3'}} />
          <WidgetNotificationBell active={notifications.active} onClick={notifications.openDialog} size={28} />
          <IconButton size="small" onClick={onExpand} sx={{width: 28, height: 28, color: '#0457FF'}}>
            <OpenInFullIcon sx={{fontSize: 18}} />
          </IconButton>
        </Box>
      </Box>

      <Paper elevation={0} sx={{position: 'relative', minHeight: useTierCarousel ? 142 : 90, borderRadius: 1.5, border: '1px solid #E6EAF0', overflow: 'hidden', bgcolor: '#FFFFFF'}}>
        <QualityRing enlarged={useTierCarousel} />
      </Paper>

      {useTierCarousel ? (
        <>
          <MetricCarousel metrics={qualityMetrics} />
          <LineOverview rows={qualityLineOverview} title={overviewLabel} itemPrefix={overviewItemPrefix} />
        </>
      ) : (
        <>
          <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gridAutoRows: '66px', gap: 0.85}}>
            {tier1QualityMetrics.slice(0, 4).map((metric) => (
              <MetricCard
                key={metric.label}
                {...metric}
                tierOneStyle
              />
            ))}
          </Box>

          <MetricCard {...tier1QualityMetrics[4]} tierOneStyle />
        </>
      )}
      <WidgetNotificationsDialog
        active={notifications.active}
        config={qualityNotificationConfig}
        draftState={notifications.draftState}
        onApplySuggestion={notifications.applySuggestion}
        onClose={notifications.closeDialog}
        onSave={notifications.saveDialog}
        onStateChange={notifications.setDraftState}
        open={notifications.open}
      />
    </Paper>
  );
}

function MetricCarousel({metrics}: {metrics: typeof qualityMetrics}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const metricPages = [
    metrics.slice(0, 2),
    metrics.slice(2, 4),
    metrics.slice(4, 5),
  ];
  const activeMetrics = metricPages[activeIndex] ?? metricPages[0];

  useEffect(() => {
    const rotateId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % metricPages.length);
    }, 3200);

    return () => window.clearInterval(rotateId);
  }, [metricPages.length]);

  return (
    <Box sx={{minWidth: 0, display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto', gap: 0.45}}>
      <Box sx={{display: 'grid', gridTemplateColumns: activeMetrics.length === 1 ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: 0.85, minWidth: 0}}>
        {activeMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} tierOneStyle />
        ))}
      </Box>
      <Box sx={{display: 'flex', justifyContent: 'center', gap: 0.45}}>
        {metricPages.map((page, index) => (
          <Box
            key={page.map((metric) => metric.label).join('-')}
            onClick={() => setActiveIndex(index)}
            sx={{
              width: index === activeIndex ? 14 : 5,
              height: 5,
              borderRadius: 999,
              bgcolor: index === activeIndex ? '#4C83FF' : '#CBD5E1',
              cursor: 'pointer',
              transition: 'all 160ms ease',
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

function LineOverview({rows, title, itemPrefix}: {rows: typeof qualityLineOverview; title: string; itemPrefix: string}) {
  return (
    <Box sx={{minHeight: 0, overflow: 'hidden', borderTop: '1px solid #E6ECF4', pt: 0.65}}>
      <Typography sx={{fontSize: 11, color: '#18315F', fontWeight: 950, mb: 0.45, textTransform: 'uppercase'}}>{title}</Typography>
      {rows.map((row, index) => <LineOverviewRow key={row.name} {...row} name={`${itemPrefix} ${index + 1}`} />)}
    </Box>
  );
}

function LineOverviewRow({delta, name, tone, trend, value}: typeof qualityLineOverview[number]) {
  return (
    <Box sx={{display: 'grid', gridTemplateColumns: '74px 62px 30px minmax(0, 1fr)', alignItems: 'center', minHeight: 27, gap: 0.55, borderTop: '1px solid #E6ECF4'}}>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55, minWidth: 0}}>
        <Box sx={{width: 8, height: 8, borderRadius: '50%', bgcolor: tone}} />
        <Typography sx={{fontSize: 10.8, color: '#18315F', fontWeight: 800}} noWrap>{name}</Typography>
      </Box>
      <Typography sx={{fontSize: 10.8, color: '#18315F', fontWeight: 950}} noWrap>{value}</Typography>
      <Typography sx={{fontSize: 10, color: delta.startsWith('+') ? '#FF2424' : '#10B64B', fontWeight: 850}}>{delta}</Typography>
      <LineSparkline values={trend} color={tone} />
    </Box>
  );
}

function LineSparkline({color, values}: {color: string; values: number[]}) {
  const width = 74;
  const height = 20;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * width},${3 + (1 - (value - min) / range) * (height - 6)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="20" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
