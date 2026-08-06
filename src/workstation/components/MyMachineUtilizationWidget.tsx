import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {Box, IconButton, Paper, Typography} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  OpenInFull as OpenInFullIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';

type MyMachineUtilizationWidgetProps = {
  onExpand?: () => void;
};

const machineRows = [
  {label: 'Z1C10', segments: [[0, 38, tokenSuccess.lightest], [38, 2, tokenError.main], [40, 15, tokenWarning.dark], [55, 45, tokenSuccess.lightest]]},
  {label: 'Z1C20', segments: [[0, 41, tokenSuccess.lightest], [41, 23, tokenWarning.dark], [64, 2, workstationVisuals.tierTextLabel], [66, 34, tokenSuccess.lightest]]},
  {label: 'Z2C70', segments: [[0, 41, tokenSuccess.lightest], [41, 15, tokenError.main], [56, 4, tokenSuccess.lightest], [60, 2, tokenError.main], [62, 35, tokenSuccess.lightest], [97, 1, tokenWarning.dark], [98, 1, tokenError.main], [99, 1, tokenSuccess.lightest]]},
  {label: 'Z3C10', segments: [[0, 9, tokenSuccess.lightest], [9, 2, tokenWarning.dark], [11, 30, tokenSuccess.lightest], [41, 26, tokenError.main], [67, 33, tokenSuccess.lightest]]},
  {label: 'Z4C10', segments: [[0, 23, tokenSuccess.lightest], [23, 1, tokenError.main], [24, 6, tokenSuccess.lightest], [30, 1, tokenError.main], [31, 1, tokenWarning.dark], [32, 9, tokenSuccess.lightest], [41, 6, workstationVisuals.tierTextLabel], [47, 15, tokenError.main], [62, 8, tokenSuccess.lightest], [70, 2, tokenError.main], [72, 25, tokenSuccess.lightest], [97, 1, tokenWarning.dark], [98, 1, tokenError.main], [99, 1, tokenSuccess.lightest]]},
  {label: 'Z3C10', segments: [[0, 9, tokenSuccess.lightest], [9, 2, workstationVisuals.tierTextLabel], [11, 19, tokenSuccess.lightest], [30, 1, tokenWarning.dark], [31, 2, tokenError.main], [33, 4, tokenSuccess.lightest], [37, 15, tokenWarning.dark], [52, 8, tokenSuccess.lightest], [60, 1, tokenError.main], [61, 3, tokenWarning.dark], [64, 20, tokenSuccess.lightest], [84, 1, tokenError.main], [85, 12, tokenSuccess.lightest], [97, 1, tokenWarning.dark], [98, 1, tokenError.main], [99, 1, tokenSuccess.lightest]]},
  {label: 'Z5C10', segments: [[0, 14, tokenSuccess.lightest], [14, 7, tokenError.main], [21, 16, tokenSuccess.lightest], [37, 1, tokenError.main], [38, 1, tokenWarning.dark], [39, 1, tokenError.main], [40, 1, tokenSuccess.lightest], [41, 1, tokenError.main], [42, 2, tokenSuccess.lightest], [44, 20, tokenWarning.dark], [64, 33, tokenSuccess.lightest], [97, 1, tokenWarning.dark], [98, 1, tokenError.main], [99, 1, tokenSuccess.lightest]]},
  {label: 'Z5C30', segments: [[0, 23, tokenSuccess.lightest], [23, 1, tokenError.main], [24, 6, tokenSuccess.lightest], [30, 1, tokenError.main], [31, 1, tokenWarning.dark], [32, 6, tokenSuccess.lightest], [38, 15, tokenError.main], [53, 7, tokenSuccess.lightest], [60, 1, tokenError.main], [61, 9, tokenSuccess.lightest], [70, 2, tokenError.main], [72, 12, tokenSuccess.lightest], [84, 1, tokenError.main], [85, 12, tokenSuccess.lightest], [97, 1, tokenWarning.dark], [98, 1, tokenError.main], [99, 1, tokenSuccess.lightest]]},
  {label: 'Z6C10', segments: [[0, 4, tokenSuccess.lightest], [4, 15, tokenError.main], [19, 4, tokenSuccess.lightest], [23, 1, tokenError.main], [24, 6, tokenSuccess.lightest], [30, 1, tokenError.main], [31, 1, tokenWarning.dark], [32, 28, tokenSuccess.lightest], [60, 1, tokenError.main], [61, 9, tokenSuccess.lightest], [70, 2, tokenError.main], [72, 25, tokenSuccess.lightest], [97, 1, tokenWarning.dark], [98, 1, tokenError.main], [99, 1, tokenSuccess.lightest]]},
  {label: '', segments: [[0, 4, tokenSuccess.lightest], [4, 15, tokenError.main], [19, 4, tokenSuccess.lightest], [23, 1, tokenError.main], [24, 6, tokenSuccess.lightest], [30, 1, tokenError.main], [31, 1, tokenWarning.dark], [32, 28, tokenSuccess.lightest], [60, 1, tokenError.main], [61, 9, tokenSuccess.lightest], [70, 2, tokenError.main], [72, 25, tokenSuccess.lightest], [97, 1, tokenWarning.dark], [98, 1, tokenError.main], [99, 1, tokenSuccess.lightest]]},
];

const timelineTicks = ['03/30', '03/31', '04/01'];
const hourTicks = ['01AM', '02AM', '03AM', '04AM', '05AM', '06PM', '07AM', '08AM'];

export default function MyMachineUtilizationWidget({onExpand}: MyMachineUtilizationWidgetProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        p: 1.5,
        borderRadius: 1.5,
        bgcolor: tokenCommon.white,
        border: `1px solid ${tokenNeutral.main}`,
        boxShadow: '0 1px 2px rgba(17, 24, 39, 0.08), 0 0 0 1px rgba(31, 91, 255, 0.06)',
        overflow: 'hidden',
        containerType: 'inline-size',
      }}
    >
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.4}}>
        <Typography sx={{fontSize: 15, lineHeight: 1, fontWeight: 800, color: workstationVisuals.tierTextHeading}}>
          Machine Utilization
        </Typography>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1.2}}>
          <AutoAwesomeIcon sx={{fontSize: 18, color: tokenInfo.lightest}} />
          <StarBorderIcon sx={{fontSize: 19, color: tokenBrand.main}} />
          <IconButton aria-label="Expand machine utilization" onClick={onExpand} size="small" sx={{width: 22, height: 22, p: 0, color: tokenBrand.main}}>
            <OpenInFullIcon sx={{fontSize: 18}} />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{height: 'calc(100% - 31px)', minHeight: 0, display: 'grid', gridTemplateRows: '20px minmax(0, 1fr) 22px 22px', gap: 0.6}}>
        <Box sx={{display: 'grid', gridTemplateColumns: '42px 1fr', alignItems: 'center'}}>
          <Box />
          <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', color: workstationVisuals.tierTextMeta, fontSize: 10, textAlign: 'center'}}>
            {timelineTicks.map((tick) => <Box key={tick}>{tick}</Box>)}
          </Box>
        </Box>

        <Box sx={{display: 'grid', gridTemplateColumns: '42px 1fr', gap: 1, minHeight: 0}}>
          <Box sx={{display: 'grid', gridTemplateRows: `repeat(${machineRows.length}, 1fr)`, gap: 1.05, color: workstationVisuals.textSecondary, fontSize: 11, alignItems: 'center'}}>
            {machineRows.map((row, index) => <Box key={`${row.label}-${index}`} sx={{whiteSpace: 'nowrap'}}>{row.label}</Box>)}
          </Box>
          <Box sx={{position: 'relative', display: 'grid', gridTemplateRows: `repeat(${machineRows.length}, 1fr)`, gap: 1.05, minWidth: 0}}>
            {[16.6, 33.2, 49.8, 66.4, 83].map((left) => (
              <Box key={left} sx={{position: 'absolute', top: 0, bottom: 0, left: `${left}%`, borderLeft: '1px solid rgba(69, 92, 115, 0.14)'}} />
            ))}
            {machineRows.map((row, rowIndex) => (
              <Box key={`${row.label}-${rowIndex}-bar`} sx={{position: 'relative', minHeight: 18, bgcolor: tokenSuccess.lightest, overflow: 'hidden'}}>
                {row.segments.map(([left, width, color], index) => (
                  <Box key={`${row.label}-${rowIndex}-${index}`} sx={{position: 'absolute', top: 0, bottom: 0, left: `${left}%`, width: `${width}%`, bgcolor: color}} />
                ))}
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{display: 'grid', gridTemplateColumns: '42px 1fr', alignItems: 'start'}}>
          <Box />
          <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', color: workstationVisuals.tierTextMeta, fontSize: 10}}>
            {hourTicks.map((tick) => <Box key={tick}>{tick}</Box>)}
          </Box>
        </Box>

        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap'}}>
          <Legend color={tokenError.main} label="Blocked" />
          <Legend color={tokenWarning.dark} label="Starved" />
          <Legend color={tokenSuccess.dark} label="Running" />
          <Legend color={workstationVisuals.tierTextLabel} label="Down" />
        </Box>
      </Box>
    </Paper>
  );
}

function Legend({color, label}: {color: string; label: string}) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45}}>
      <Box sx={{width: 9, height: 9, borderRadius: '50%', bgcolor: color}} />
      <Typography sx={{fontSize: 10, color: workstationVisuals.tierTextLabel}}>{label}</Typography>
    </Box>
  );
}
