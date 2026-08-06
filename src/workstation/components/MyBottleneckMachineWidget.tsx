import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {Box, Paper, Typography} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  OpenInFull as OpenInFullIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';

const weeklyBars = [
  {week: 'WK1', actual: 25, required: 23, outperforming: 25, availability: 82},
  {week: 'WK2', actual: 27, required: 36, outperforming: 39, availability: 87},
  {week: 'WK3', actual: 29, required: 43, outperforming: 47, availability: 85},
  {week: 'WK4', actual: 25, required: 50, outperforming: 42, availability: 82},
  {week: 'WK5', actual: 44, required: 56, outperforming: 64, availability: 84},
  {week: 'WK6', actual: 50, required: 68, outperforming: 58, availability: 89},
  {week: 'WK7', actual: 29, required: 40, outperforming: 45, availability: 82},
  {week: 'WK8', actual: 33, required: 47, outperforming: 50, availability: 83},
  {week: 'WK9', actual: 33, required: 44, outperforming: 48, availability: 85},
  {week: 'WK10', actual: 47, required: 64, outperforming: 58, availability: 88},
];

function MetricCard({accent, label, unit, value}: {accent: string; label: string; unit?: string; value: string}) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        height: 50,
        border: `1px solid ${tokenNeutral.main}`,
        borderRadius: 1,
        bgcolor: tokenCommon.white,
        boxShadow: '0 1px 4px rgba(15, 23, 42, 0.08)',
        display: 'flex',
        alignItems: 'center',
        px: 1.4,
        pl: 1.7,
        overflow: 'hidden',
      }}
    >
      <Box sx={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: accent}} />
      <Box>
        <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 0.25}}>
          <Typography sx={{fontSize: 29, lineHeight: 0.95, color: workstationVisuals.tierTextHeading, fontWeight: 400}}>{value}</Typography>
          {unit ? <Typography sx={{fontSize: 13, color: workstationVisuals.tierTextHeading, mt: 0.1}}>{unit}</Typography> : null}
        </Box>
        <Typography sx={{fontSize: 9.5, color: workstationVisuals.tierTextHeading, lineHeight: 1}}>{label}</Typography>
      </Box>
    </Paper>
  );
}

function FulfillmentMetric() {
  return (
    <Box sx={{height: 54, display: 'flex', alignItems: 'center', gap: 1.1}}>
      <Box sx={{width: 47, height: 47, position: 'relative'}}>
        <svg viewBox="0 0 54 54" width="100%" height="100%" aria-hidden="true">
          <circle cx="27" cy="27" r="21" fill="none" stroke={tokenNeutral.lighter} strokeWidth="7" />
          <circle
            cx="27"
            cy="27"
            r="21"
            fill="none"
            stroke={tokenBrand.main}
            strokeDasharray="94 132"
            strokeLinecap="round"
            strokeWidth="7"
            transform="rotate(-88 27 27)"
          />
        </svg>
      </Box>
      <Box>
        <Typography sx={{fontSize: 27, lineHeight: 0.95, color: workstationVisuals.tierTextHeading}}>
          71<Box component="span" sx={{fontSize: 15}}>%</Box>
        </Typography>
        <Typography sx={{fontSize: 9.5, color: workstationVisuals.tierTextHeading}}>Fulfillment</Typography>
      </Box>
    </Box>
  );
}

export default function MyBottleneckMachineWidget() {
  const points = weeklyBars.map((item, index) => {
    const x = 24 + index * 34;
    const y = 126 - ((item.availability - 60) / 40) * 112;
    return `${x},${y}`;
  }).join(' ');

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 360,
        p: 1.6,
        borderRadius: 1.5,
        bgcolor: tokenCommon.white,
        border: `1px solid ${tokenNeutral.main}`,
        overflow: 'hidden',
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5}}>
        <Typography sx={{fontSize: 14.5, fontWeight: 900, color: workstationVisuals.tierTextHeading}}>Bottleneck Machine</Typography>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.9}}>
          <AutoAwesomeIcon sx={{fontSize: 17, color: tokenInfo.lightest}} />
          <StarBorderIcon sx={{fontSize: 18, color: tokenBrand.main}} />
          <OpenInFullIcon sx={{fontSize: 17, color: tokenBrand.main}} />
        </Box>
      </Box>

      <Paper elevation={0} sx={{p: 1.2, borderRadius: 1, border: `1px solid ${tokenNeutral.main}`, bgcolor: tokenCommon.white}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 0.6}}>
          <Typography sx={{fontSize: 10.5, color: workstationVisuals.tierTextHeading}}>Good Qty</Typography>
          <Typography sx={{fontSize: 10.5, color: workstationVisuals.tierTextHeading}}>OEE</Typography>
        </Box>
        <Box sx={{position: 'relative', height: 160, pl: 3.1, pr: 2.4}}>
          {[80, 60, 40, 20, 0].map((tick) => (
            <Box key={tick} sx={{position: 'absolute', left: 0, right: 22, bottom: `${(tick / 80) * 132 + 18}px`, borderTop: tick === 0 ? `1px solid ${tokenNeutral.dark}` : `1px dashed ${tokenNeutral.dark}`}}>
              <Typography sx={{position: 'absolute', left: -25, top: -7, fontSize: 9.5, color: tokenNeutral.darkest}}>{tick}k</Typography>
            </Box>
          ))}
          {[100, 90, 80, 70, 60].map((tick) => (
            <Typography key={tick} sx={{position: 'absolute', right: -3, bottom: `${((tick - 60) / 40) * 132 + 11}px`, fontSize: 9.5, color: tokenNeutral.darkest}}>
              {tick}%
            </Typography>
          ))}
          <Box sx={{position: 'absolute', left: 28, right: 24, bottom: 18, height: 132, display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 0.45, alignItems: 'end'}}>
            {weeklyBars.map((bar) => (
              <Box key={bar.week} sx={{height: '100%', display: 'flex', alignItems: 'end', justifyContent: 'center', gap: 0.12}}>
                <Box sx={{width: 10, height: `${bar.actual / 80 * 132}px`, bgcolor: tokenBrand.dark}} />
                <Box sx={{width: 10, height: `${bar.required / 80 * 132}px`, bgcolor: tokenWarning.light}} />
                <Box sx={{width: 10, height: `${bar.outperforming / 80 * 132}px`, bgcolor: tokenSuccess.main}} />
              </Box>
            ))}
          </Box>
          <svg viewBox="0 0 330 150" preserveAspectRatio="none" style={{position: 'absolute', left: 28, right: 24, bottom: 18, width: 'calc(100% - 52px)', height: 132, overflow: 'visible'}}>
            <polyline points={points} fill="none" stroke={tokenBrand.main} strokeWidth="3" />
            {weeklyBars.map((item, index) => {
              const x = 24 + index * 34;
              const y = 126 - ((item.availability - 60) / 40) * 112;
              return <circle key={item.week} cx={x} cy={y} r="3" fill={tokenBrand.main} />;
            })}
          </svg>
        </Box>
        <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', pl: 3.2, pr: 2.6, mt: -0.4}}>
          {weeklyBars.map((bar) => (
            <Typography key={bar.week} sx={{fontSize: 9, color: workstationVisuals.textSecondary, textAlign: 'center'}}>{bar.week}</Typography>
          ))}
        </Box>
        <Box sx={{display: 'flex', justifyContent: 'center', gap: 1.4, mt: 1.2, flexWrap: 'wrap'}}>
          <Legend color={tokenBrand.dark} label="Actual Throughput" />
          <Legend color={tokenWarning.light} label="Required Throughput" />
          <Legend color={tokenSuccess.main} label="Outperforming" />
          <Legend color={tokenBrand.main} label="Availability" line />
        </Box>
      </Paper>

      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr', gap: 1.4, mt: 2}}>
        <FulfillmentMetric />
        <MetricCard accent={tokenWarning.dark} value="124,5" unit="k" label="Backlog" />
        <MetricCard accent={tokenSuccess.dark} value="87" unit="%" label="Good Qty" />
      </Box>
    </Paper>
  );
}

function Legend({color, label, line = false}: {color: string; label: string; line?: boolean}) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.4}}>
      <Box sx={{width: line ? 13 : 9, height: line ? 2 : 9, borderRadius: line ? 0 : '50%', bgcolor: color}} />
      <Typography sx={{fontSize: 8.5, color: workstationVisuals.tierTextLabel, whiteSpace: 'nowrap'}}>{label}</Typography>
    </Box>
  );
}
