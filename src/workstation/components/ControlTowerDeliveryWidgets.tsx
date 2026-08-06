import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import type {ReactNode} from 'react';
import {Box, IconButton, Paper, Typography} from '@mui/material';
import {
  AutoAwesome as SparkleIcon,
  ExpandMore as ExpandMoreIcon,
  OpenInFull as OpenInFullIcon,
} from '@mui/icons-material';
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

const frameSx = {
  width: '100%',
  height: '100%',
  minHeight: 0,
  p: 1.15,
  borderRadius: 1.8,
  bgcolor: workstationVisuals.tierTextHeading,
  border: '1px solid rgba(103,118,146,0.16)',
  boxShadow: 'none',
  containerType: 'inline-size',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: workstationVisuals.fontFamily,
} as const;

const headerActionSx = {
  width: 20,
  height: 20,
  color: workstationVisuals.tierTextMeta,
  p: 0.25,
  '&:hover': {bgcolor: 'rgba(255,255,255,0.04)', color: tokenNeutral.dark},
} as const;

const axisTickStyle = {
  fill: tokenNeutral.darker,
  fontFamily: workstationVisuals.fontFamily,
  fontSize: 8.5,
  fontWeight: 600,
};

const productionOutputData = [
  {label: 'Oct 24', actual: 65, forecast: null},
  {label: 'Nov 24', actual: 74, forecast: null},
  {label: 'Dec 24', actual: 76, forecast: null},
  {label: 'Jan 25', actual: 86, forecast: null},
  {label: 'Feb 25', actual: 90, forecast: null},
  {label: 'Mar 25', actual: 94, forecast: null},
  {label: 'Apr 25', actual: 99, forecast: null},
  {label: 'May 25', actual: 104, forecast: null},
  {label: 'Jun 25', actual: 116, forecast: null},
  {label: 'Jul 25', actual: 119, forecast: 112},
  {label: 'Aug 25', actual: 122, forecast: 120},
  {label: 'Sep 25', actual: 130, forecast: 130},
];

function ControlTowerWidgetFrame({
  actionLabel,
  children,
  title,
}: {
  actionLabel?: string;
  children: ReactNode;
  title: string;
}) {
  return (
    <Paper elevation={0} sx={frameSx}>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.95}}>
        <Typography sx={{fontSize: 13.5, lineHeight: 1.1, color: tokenCommon.white, fontWeight: 800}}>
          {title}
        </Typography>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.15}}>
          {actionLabel ? (
            <>
              <Typography sx={{fontSize: 10.4, lineHeight: 1, color: workstationVisuals.textMuted}}>
                {actionLabel}
              </Typography>
              <ExpandMoreIcon sx={{fontSize: 14, color: workstationVisuals.textMuted}} />
            </>
          ) : null}
          <IconButton size="small" sx={headerActionSx}>
            <SparkleIcon sx={{fontSize: 12}} />
          </IconButton>
          <IconButton size="small" sx={{...headerActionSx, color: tokenBrand.lighter}}>
            <OpenInFullIcon sx={{fontSize: 12.5}} />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
        {children}
      </Box>
    </Paper>
  );
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY - radius * Math.sin(angleInRadians),
  };
}

function describeArc(centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(centerX, centerY, radius, startAngle);
  const end = polarToCartesian(centerX, centerY, radius, endAngle);
  const largeArcFlag = Math.abs(startAngle - endAngle) > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

export function ControlTowerProductionOutputWidget() {
  return (
    <ControlTowerWidgetFrame title="Production Output">
      <Box
        sx={{
          minHeight: 68,
          px: 1,
          py: 0.82,
          borderRadius: '4px',
          bgcolor: workstationVisuals.tierTextHeading,
          borderLeft: `4px solid ${tokenInfo.light}`,
          mb: 1,
        }}
      >
        <Typography sx={{fontSize: 18, lineHeight: 1, color: tokenCommon.white, fontWeight: 500}}>
          923M
        </Typography>
        <Typography sx={{fontSize: 10.2, lineHeight: 1.15, color: tokenNeutral.main, mt: 0.28}}>
          Total Product Output
        </Typography>
      </Box>

      <Box
        sx={{
          position: 'relative',
          flex: 1,
          minHeight: 154,
          borderRadius: '6px',
          bgcolor: workstationVisuals.textPrimary,
          overflow: 'hidden',
          px: 0.6,
          pt: 0.2,
          pb: 0.1,
        }}
      >
        <Typography
          sx={{
            position: 'absolute',
            left: -3,
            top: '51%',
            transform: 'rotate(-90deg) translateY(-50%)',
            transformOrigin: 'left top',
            fontSize: 8.5,
            color: tokenNeutral.darker,
          }}
        >
          Quantity
        </Typography>

        <Box sx={{position: 'absolute', left: 8, top: 6, zIndex: 2, px: 0.72, py: 0.35, borderRadius: '6px', border: '1px solid rgba(255,255,255,0.18)', bgcolor: workstationVisuals.tierTextHeading}}>
          <Typography sx={{fontSize: 8.2, color: tokenNeutral.lighter}}>Schedule Adherence: 95%</Typography>
        </Box>

        <Box sx={{height: '100%', minHeight: 0}}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={productionOutputData} margin={{top: 16, right: 8, left: -8, bottom: 0}}>
              <CartesianGrid stroke={workstationVisuals.tierTextHeading} strokeDasharray="3 3" vertical={false} />
              <XAxis axisLine={false} dataKey="label" height={24} interval={0} tick={axisTickStyle} tickLine={false} />
              <YAxis axisLine={false} domain={[0, 150]} tick={axisTickStyle} tickFormatter={(value: number) => `${value}M`} tickLine={false} ticks={[0, 30, 60, 90, 120, 150]} width={34} />
              <ReferenceLine stroke="rgba(255,255,255,0.66)" strokeDasharray="4 4" x="Aug 25" />
              <Line activeDot={false} dataKey="actual" dot={{fill: tokenInfo.dark, r: 2.8, stroke: tokenInfo.dark}} stroke={tokenInfo.dark} strokeWidth={2.1} type="monotone">
                <LabelList dataKey="actual" formatter={(value: number) => `${value}M`} offset={8} position="top" style={{fill: tokenNeutral.main, fontFamily: workstationVisuals.fontFamily, fontSize: 7.4}} />
              </Line>
              <Line activeDot={false} connectNulls dataKey="forecast" dot={false} stroke={tokenNeutral.main} strokeDasharray="4 4" strokeWidth={1.25} type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      <Box sx={{mt: 0.65, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1.1}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45}}>
          <Box sx={{width: 8, height: 8, borderRadius: '50%', bgcolor: tokenInfo.dark}} />
          <Typography sx={{fontSize: 8.8, color: tokenNeutral.darker}}>Production Output</Typography>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45}}>
          <Box sx={{width: 8, height: 8, borderTop: `1px dashed ${tokenNeutral.main}`}} />
          <Typography sx={{fontSize: 8.8, color: tokenNeutral.darker}}>Forecast</Typography>
        </Box>
      </Box>

      <Box sx={{mt: 0.45, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.55}}>
        <Box
          sx={{
            width: 14,
            height: 14,
            borderRadius: '999px',
            bgcolor: tokenBrand.light,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.2,
          }}
        >
          <Box sx={{width: 1.5, height: 5, borderRadius: '999px', bgcolor: tokenNeutral.lightest}} />
          <Box sx={{width: 1.5, height: 5, borderRadius: '999px', bgcolor: tokenNeutral.lightest}} />
        </Box>
        <Box sx={{width: 5, height: 5, borderRadius: '50%', bgcolor: 'rgba(170,181,201,0.45)'}} />
        <Box sx={{width: 5, height: 5, borderRadius: '50%', bgcolor: 'rgba(170,181,201,0.45)'}} />
      </Box>
    </ControlTowerWidgetFrame>
  );
}

export function ControlTowerOeeWidget() {
  const currentValue = 85;
  const currentAngle = 180 - currentValue * 1.8;
  const knob = polarToCartesian(90, 92, 66, currentAngle);
  const segments = [
    {color: tokenError.light, from: 180, to: 132},
    {color: tokenWarning.dark, from: 132, to: 96},
    {color: tokenInfo.darker, from: 96, to: 36},
    {color: tokenSuccess.main, from: 36, to: 0},
  ];

  return (
    <ControlTowerWidgetFrame title="OEE">
      <Box sx={{flex: 1, minHeight: 0, display: 'grid', placeItems: 'center'}}>
        <Box sx={{width: '100%', maxWidth: 220, aspectRatio: '1.36 / 1', position: 'relative'}}>
          <svg viewBox="0 0 180 110" width="100%" height="100%" aria-hidden="true">
            <path d={describeArc(90, 92, 66, 180, 0)} fill="none" stroke={workstationVisuals.tierTextLabel} strokeLinecap="round" strokeWidth="7" />
            {segments.map((segment) => {
              if (currentAngle >= segment.from) return null;
              const visibleEnd = Math.max(currentAngle, segment.to);
              return (
                <path
                  key={`${segment.from}-${segment.to}`}
                  d={describeArc(90, 92, 66, segment.from, visibleEnd)}
                  fill="none"
                  stroke={segment.color}
                  strokeLinecap="round"
                  strokeWidth="7"
                />
              );
            })}
            {currentAngle > 0 ? (
              <path d={describeArc(90, 92, 66, currentAngle, 0)} fill="none" stroke={workstationVisuals.tierTextLabel} strokeLinecap="round" strokeWidth="5" />
            ) : null}
            <circle cx={knob.x} cy={knob.y} r="7" fill={workstationVisuals.tierTextHeading} stroke={tokenInfo.darker} strokeWidth="4" />
            <circle cx={knob.x} cy={knob.y} r="1.8" fill={workstationVisuals.tierTextHeading} stroke={tokenInfo.darker} strokeWidth="1.2" />
          </svg>

          <Box sx={{position: 'absolute', left: 0, right: 0, bottom: 8, textAlign: 'center'}}>
            <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 0.18}}>
              <Typography sx={{fontSize: 38, lineHeight: 0.95, fontWeight: 400, color: tokenCommon.white}}>
                85
              </Typography>
              <Typography sx={{fontSize: 17, lineHeight: 1, fontWeight: 300, color: tokenCommon.white, mt: 0.25}}>
                %
              </Typography>
            </Box>
            <Typography sx={{fontSize: 10.8, lineHeight: 1.2, color: tokenSuccess.lighter, mt: 0.28}}>
              Target: 80%
            </Typography>
          </Box>
        </Box>
      </Box>
    </ControlTowerWidgetFrame>
  );
}

export function ControlTowerProductionOverviewWidget() {
  return (
    <ControlTowerWidgetFrame actionLabel="Line" title="Production Overview">
      <Box sx={{display: 'grid', gap: 0.55, flex: 1}}>
        {[
          {color: tokenSuccess.main, label: 'Line 01', value: '92%'},
          {color: tokenSuccess.main, label: 'Line 02', value: '88%'},
          {color: tokenWarning.light, label: 'Line 03', value: '72%'},
          {color: tokenError.light, label: 'Line 04', value: '48%'},
          {color: tokenWarning.light, label: 'Line 05', value: '68%'},
        ].map((row) => (
          <Box key={row.label} sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, px: 1, py: 0.75, borderRadius: '4px', bgcolor: workstationVisuals.tierTextHeading}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
              <Box sx={{width: 7, height: 7, borderRadius: '50%', bgcolor: row.color}} />
              <Typography sx={{fontSize: 12.3, color: tokenNeutral.lighter}}>{row.label}</Typography>
            </Box>
            <Typography sx={{fontSize: 12.3, color: tokenCommon.white, fontWeight: 800}}>{row.value}</Typography>
          </Box>
        ))}
      </Box>
    </ControlTowerWidgetFrame>
  );
}
