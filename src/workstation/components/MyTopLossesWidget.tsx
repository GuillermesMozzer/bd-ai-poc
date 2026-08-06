import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {Box, Paper, Typography} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  OpenInFull as OpenInFullIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';

const lossLegend = [
  {label: 'OEE', value: '82.5%', color: tokenBrand.main, dash: 82.5},
  {label: 'Breakdown Loss', value: '8.9%', color: tokenError.light, dash: 8.9},
  {label: 'Performance Loss', value: '6%', color: tokenError.lighter, dash: 6},
  {label: 'Planned DT', value: '5.4%', color: tokenInfo.lighter, dash: 5.4},
  {label: 'Short Stoppage', value: '3%', color: tokenWarning.light, dash: 3},
  {label: 'Scrap 0', value: '2%', color: tokenSuccess.main, dash: 2},
];

function DonutChart() {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg width="100%" height="100%" viewBox="0 0 136 136" aria-hidden="true" style={{maxHeight: 136}}>
      <circle cx="68" cy="68" r={radius} fill="none" stroke={tokenNeutral.lighter} strokeWidth="15" />
      {lossLegend.map((item) => {
        const dashLength = item.dash / 100 * circumference;
        const gap = circumference - dashLength;
        const strokeDashoffset = -offset;
        offset += dashLength;

        return (
          <circle
            key={item.label}
            cx="68"
            cy="68"
            r={radius}
            fill="none"
            stroke={item.color}
            strokeDasharray={`${dashLength} ${gap}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="butt"
            strokeWidth="15"
            transform="rotate(-96 68 68)"
          />
        );
      })}
    </svg>
  );
}

export default function MyTopLossesWidget() {
  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        p: 'clamp(8px, 1.5cqw, 12px)',
        borderRadius: 1.5,
        bgcolor: tokenCommon.white,
        border: `1px solid ${tokenNeutral.main}`,
        boxShadow: '0 1px 2px rgba(17, 24, 39, 0.08), 0 0 0 1px rgba(31, 91, 255, 0.06)',
        overflow: 'hidden',
        containerType: 'inline-size',
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 'clamp(5px, 1.5cqw, 11px)'}}>
        <Typography sx={{fontSize: 'clamp(12px, 4cqw, 15.5px)', lineHeight: 1, color: workstationVisuals.tierTextHeading, fontWeight: 900}}>
          OEE Top Losses
        </Typography>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8}}>
          <AutoAwesomeIcon sx={{fontSize: 18, color: tokenInfo.lightest}} />
          <StarBorderIcon sx={{fontSize: 19, color: tokenBrand.main}} />
          <OpenInFullIcon sx={{fontSize: 18, color: tokenBrand.main}} />
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 'clamp(8px, 1.5cqw, 11px)',
          height: 'calc(100% - clamp(20px, 5cqw, 28px))',
          minHeight: 0,
          borderRadius: 1.5,
          border: `1px solid ${tokenNeutral.main}`,
          bgcolor: tokenCommon.white,
          boxShadow: '0 1px 3px rgba(15,23,42,0.05)',
        }}
      >
        <Typography sx={{fontSize: 'clamp(11px, 3.3cqw, 14px)', color: workstationVisuals.tierTextHeading, fontWeight: 900, mb: 'clamp(5px, 1.2cqw, 10px)'}}>
          Summary
        </Typography>
        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'center',
            height: 'clamp(40px, 10cqw, 57px)',
            mb: 'clamp(6px, 1.8cqw, 14px)',
            px: 1.25,
            pl: 1.55,
            bgcolor: tokenNeutral.lightest,
            border: `1px solid ${tokenNeutral.main}`,
            borderRadius: 1.2,
            boxShadow: '0 2px 7px rgba(20, 36, 70, 0.13)',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 5,
              bgcolor: tokenWarning.dark,
            },
          }}
        >
          <Box>
            <Typography sx={{fontSize: 'clamp(17px, 5cqw, 24px)', lineHeight: 0.95, color: workstationVisuals.tierTextHeading, fontWeight: 400}}>
              15h 08 <Box component="span" sx={{fontSize: 15}}>min</Box>
            </Typography>
            <Typography sx={{fontSize: 10.5, color: workstationVisuals.tierTextHeading, mt: 0.25}}>
              Total Lost Time
            </Typography>
          </Box>
          <Box sx={{pl: 1.2, borderLeft: `1px solid ${tokenNeutral.dark}`, textAlign: 'center'}}>
            <Typography sx={{fontSize: 8, lineHeight: 1, fontWeight: 800, color: workstationVisuals.tierTextLabel, letterSpacing: 0.6}}>
              TARGET
            </Typography>
            <Box sx={{mt: 0.35, px: 0.7, py: 0.25, borderRadius: 3, bgcolor: tokenCommon.white, color: tokenWarning.dark, fontSize: 9, fontWeight: 900, boxShadow: `0 0 0 1px ${tokenWarning.lightest}`}}>
              10H 40 MIN
            </Box>
          </Box>
        </Paper>

        <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(72px, 130px) 1fr', gap: 1, alignItems: 'center', minHeight: 0}}>
          <DonutChart />
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.55}}>
            {lossLegend.map((item) => (
              <Box key={item.label} sx={{display: 'grid', gridTemplateColumns: '12px 1fr auto', alignItems: 'center', gap: 0.7}}>
                <Box sx={{width: 10, height: 10, borderRadius: '50%', bgcolor: item.color}} />
                <Typography sx={{fontSize: 12.5, lineHeight: 1.1, color: workstationVisuals.tierTextHeading, fontWeight: 500}}>
                  {item.label}
                </Typography>
                <Typography sx={{fontSize: 12.5, lineHeight: 1.1, color: workstationVisuals.tierTextHeading, fontWeight: 900}}>
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>
    </Paper>
  );
}
