import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {Box, Paper, Typography} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  CalendarTodayOutlined as CalendarIcon,
  OpenInFull as OpenInFullIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';

const scrapBars = [
  {label: '01AM', value: 3.4, color: tokenSuccess.main},
  {label: '02AM', value: 1.2, color: tokenSuccess.main},
  {label: '03AM', value: 5.6, color: tokenError.light},
  {label: '04AM', value: 2.4, color: tokenSuccess.main},
  {label: '05AM', value: 0.3, color: tokenSuccess.main},
  {label: '06AM', value: 8.9, color: tokenError.light},
  {label: '07AM', value: 7.2, color: tokenError.light},
  {label: '08AM', value: 2.4, color: tokenSuccess.main},
];

function Legend({color, label, line = false}: {color: string; label: string; line?: boolean}) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45}}>
      <Box sx={{width: line ? 12 : 10, height: line ? 2 : 10, borderRadius: line ? 0 : '50%', bgcolor: color}} />
      <Typography sx={{fontSize: 10, color: workstationVisuals.tierTextLabel, whiteSpace: 'nowrap'}}>{label}</Typography>
    </Box>
  );
}

export default function MyHourlyScrapWidget() {
  const max = 10;

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        p: 'clamp(8px, 1.6cqw, 14px)',
        borderRadius: 1.5,
        bgcolor: tokenCommon.white,
        border: `1px solid ${tokenNeutral.main}`,
        boxShadow: '0 1px 2px rgba(17, 24, 39, 0.05)',
        overflow: 'hidden',
        containerType: 'inline-size',
        display: 'grid',
        gridTemplateRows: 'auto minmax(0, 1fr)',
        gap: 'clamp(7px, 1.8cqw, 12px)',
        '@container (max-width: 340px)': {
          '& .hourly-scrap-controls': {
            gap: 0.45,
          },
          '& .hourly-scrap-chip': {
            px: 0.7,
            fontSize: 10,
          },
        },
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap'}}>
        <Box className="hourly-scrap-controls" sx={{display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap'}}>
          <Typography sx={{fontSize: 15, lineHeight: 1, color: workstationVisuals.tierTextHeading, fontWeight: 900}}>
            Hourly Scrap
          </Typography>
          <Box className="hourly-scrap-chip" sx={{px: 1.25, py: 0.55, borderRadius: 4, bgcolor: tokenBrand.main, color: tokenCommon.white, fontSize: 12, lineHeight: 1, fontWeight: 700}}>
            Hour
          </Box>
          <Box className="hourly-scrap-chip" sx={{px: 1.25, py: 0.48, borderRadius: 4, border: `1px solid ${tokenBrand.main}`, color: tokenBrand.main, fontSize: 12, lineHeight: 1, fontWeight: 700}}>
            Cumulative
          </Box>
          <Box className="hourly-scrap-chip" sx={{display: 'flex', alignItems: 'center', gap: 0.45, px: 1, py: 0.45, borderRadius: 4, border: `1px solid ${tokenNeutral.dark}`, color: workstationVisuals.tierTextLabel, fontSize: 11, lineHeight: 1}}>
            <CalendarIcon sx={{fontSize: 13}} />
            Today
          </Box>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1.1}}>
          <AutoAwesomeIcon sx={{fontSize: 18, color: tokenInfo.lightest}} />
          <StarBorderIcon sx={{fontSize: 19, color: tokenBrand.main}} />
          <OpenInFullIcon sx={{fontSize: 18, color: tokenBrand.main}} />
        </Box>
      </Box>

      <Paper elevation={0} sx={{p: 'clamp(7px, 1.6cqw, 10px) clamp(8px, 2cqw, 12px)', minHeight: 0, borderRadius: 1.4, bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenNeutral.main}`, overflow: 'hidden', display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr) auto'}}>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.1}}>
          <Typography sx={{fontSize: 11, color: workstationVisuals.tierTextHeading}}>Hourly Scrap</Typography>
          <Typography sx={{fontSize: 11, color: tokenError.dark}}>↑ +4% Above Target</Typography>
        </Box>
        <Box sx={{position: 'relative', minHeight: 0, height: '100%', pl: 3.2, pr: 0.3}}>
          {[10, 5, 0].map((tick) => (
            <Box
              key={tick}
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: `${(tick / max) * 78 + 16}%`,
                borderTop: tick === 0 ? 'none' : `1px dashed ${tokenNeutral.dark}`,
              }}
            >
              <Typography sx={{position: 'absolute', left: -24, top: -7, fontSize: 10, color: workstationVisuals.textMuted}}>
                {tick === 0 ? '0%' : `${tick}%`}
              </Typography>
            </Box>
          ))}
          <Box sx={{position: 'absolute', left: 28, right: 0, bottom: `${(5 / max) * 78 + 16}%`, height: 2, bgcolor: tokenWarning.dark}} />
          <Box sx={{position: 'absolute', left: 28, right: 0, top: 8, bottom: 18, display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', alignItems: 'end', gap: 1.2}}>
            {scrapBars.map((bar) => (
              <Box key={bar.label} sx={{height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 0.6}}>
                <Box sx={{width: '100%', maxWidth: 30, height: `${Math.max(3, (bar.value / max) * 100)}%`, bgcolor: bar.color, borderRadius: '4px 4px 0 0'}} />
                <Typography sx={{fontSize: 10, color: workstationVisuals.tierTextLabel, lineHeight: 1}}>{bar.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <Box sx={{display: 'flex', justifyContent: 'center', gap: 1.7, mt: 0.4, flexWrap: 'wrap'}}>
          <Legend color={tokenWarning.dark} label="Target Prod." line />
          <Legend color={tokenSuccess.main} label="Scrap Under Target" />
          <Legend color={tokenError.light} label="Scrap Over Target" />
        </Box>
      </Paper>
    </Paper>
  );
}
