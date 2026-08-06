import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {Box, IconButton, Paper, Typography} from '@mui/material';
import {
  Apps as AppsIcon,
  OpenInFull as OpenInFullIcon,
  ViewColumn as ViewColumnIcon,
} from '@mui/icons-material';

const columns = ['Metric', 'Zone 1A', 'Zone 1B', 'Zone 2A', 'Zone 2B', 'Zone 3', 'Zone 4', 'Zone 5A', 'Zone 5B', 'Zone 6'];

const rows = [
  {
    metric: 'PPM',
    values: [
      {value: '0.0', tone: 'red'},
      {value: '92.4', tone: 'yellow'},
      {value: '139.9'},
      {value: '151'},
      {value: '154'},
      {value: 'Cell'},
      {value: '78.3', tone: 'redStrong'},
      {value: '124.5'},
      {value: '157'},
    ],
  },
  {
    metric: 'Scrap (%)',
    values: [
      {value: '2.48%'},
      {value: '2.16%'},
      {value: '7.78%', tone: 'red'},
      {value: '1.89%'},
      {value: '0.50%'},
      {value: '5.64%', tone: 'yellow'},
      {value: '3.39%', tone: 'yellow'},
      {value: '1.5%'},
      {value: '0.39%'},
    ],
  },
  {
    metric: 'Fault',
    values: [
      {value: '0'},
      {value: '2', tone: 'yellow'},
      {value: '0'},
      {value: '0'},
      {value: '1'},
      {value: '0'},
      {value: '2', tone: 'yellow'},
      {value: '1'},
      {value: '0'},
    ],
  },
  {
    metric: 'Bottleneck',
    values: [
      {value: '0'},
      {value: '0'},
      {value: '1', tone: 'yellow'},
      {value: '0'},
      {value: '0'},
      {value: '0'},
      {value: '4', tone: 'redStrong'},
      {value: '0'},
      {value: '0'},
    ],
  },
];

function getCellSx(tone?: string) {
  if (tone === 'redStrong') return {bgcolor: tokenError.lightest, border: `1px solid ${tokenError.light}`};
  if (tone === 'red') return {bgcolor: tokenError.lightest};
  if (tone === 'yellow') return {bgcolor: tokenWarning.lightest};
  return {bgcolor: tokenNeutral.main};
}

export default function MyZonePerformanceWidget() {
  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 260,
        p: 1.8,
        borderRadius: 1.5,
        bgcolor: tokenCommon.white,
        border: `1px solid ${tokenNeutral.main}`,
        boxShadow: '0 1px 2px rgba(17, 24, 39, 0.08), 0 0 0 1px rgba(31, 91, 255, 0.06)',
        overflow: 'hidden',
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2}}>
        <Typography sx={{fontSize: 15.5, color: workstationVisuals.tierTextHeading, fontWeight: 900}}>Zone Performance</Typography>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7}}>
          <Paper elevation={0} sx={{display: 'flex', alignItems: 'center', gap: 0.25, p: 0.35, borderRadius: 0.8, border: `1px solid ${tokenNeutral.main}`, bgcolor: tokenNeutral.lightest}}>
            <IconButton size="small" sx={{width: 24, height: 24, borderRadius: 0.6, color: workstationVisuals.textSecondary}}>
              <AppsIcon sx={{fontSize: 16}} />
            </IconButton>
            <IconButton size="small" sx={{width: 24, height: 24, borderRadius: 0.6, bgcolor: tokenNeutral.lighter, color: tokenBrand.main}}>
              <ViewColumnIcon sx={{fontSize: 16}} />
            </IconButton>
          </Paper>
          <OpenInFullIcon sx={{fontSize: 18, color: tokenBrand.main}} />
        </Box>
      </Box>

      <Box sx={{border: `1px solid ${tokenNeutral.main}`, borderRadius: 1.3, overflow: 'hidden'}}>
        <Box sx={{display: 'grid', gridTemplateColumns: '1fr repeat(9, 1fr)', minWidth: 760}}>
          {columns.map((column) => (
            <Box
              key={column}
              sx={{
                minHeight: 39,
                px: 1.1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: column === 'Metric' ? 'flex-start' : 'center',
                bgcolor: column === 'Zone 5A' ? tokenError.lightest : tokenNeutral.lightest,
                borderRight: `1px solid ${tokenNeutral.main}`,
                borderBottom: `1px solid ${tokenNeutral.main}`,
              }}
            >
              <Typography sx={{fontSize: 11, color: workstationVisuals.tierTextHeading, fontWeight: 900}}>
                {column}{column === 'Zone 5A' ? <Box component="span" sx={{color: tokenError.dark, ml: 0.45}}>↘</Box> : null}
              </Typography>
            </Box>
          ))}

          {rows.map((row) => [
            <Box
              key={`${row.metric}-metric`}
              sx={{
                minHeight: 41,
                px: 1.1,
                display: 'flex',
                alignItems: 'center',
                bgcolor: tokenNeutral.lightest,
                borderRight: `1px solid ${tokenNeutral.main}`,
                borderBottom: `1px solid ${tokenNeutral.main}`,
              }}
            >
              <Typography sx={{fontSize: 11, color: workstationVisuals.tierTextHeading, fontWeight: 500}}>{row.metric}</Typography>
            </Box>,
            ...row.values.map((cell, index) => (
              <Box
                key={`${row.metric}-${index}`}
                sx={{
                  minHeight: 41,
                  px: 1.1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRight: `1px solid ${tokenNeutral.main}`,
                  borderBottom: `1px solid ${tokenNeutral.main}`,
                  ...getCellSx(cell.tone),
                }}
              >
                <Typography sx={{fontSize: 11, color: workstationVisuals.tierTextHeading, fontWeight: 500}}>{cell.value}</Typography>
              </Box>
            )),
          ])}
        </Box>
      </Box>
    </Paper>
  );
}
