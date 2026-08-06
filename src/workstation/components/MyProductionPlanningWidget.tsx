import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {Box, IconButton, Paper, Typography} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  OpenInFull as OpenInFullIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';

function TopMetricCard({
  accent,
  label,
  target,
  targetBg,
  targetColor,
  unit,
  value,
}: {
  accent: string;
  label: string;
  target: string;
  targetBg: string;
  targetColor: string;
  unit: string;
  value: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        alignItems: 'center',
        height: 58,
        minWidth: 0,
        px: 1,
        pl: 1.45,
        bgcolor: tokenNeutral.lightest,
        border: `1px solid ${tokenNeutral.main}`,
        borderRadius: 1.5,
        boxShadow: '0 2px 7px rgba(20, 36, 70, 0.13)',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 5,
          bgcolor: accent,
        },
      }}
    >
      <Box sx={{minWidth: 0}}>
        <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 0.45}}>
          <Typography sx={{fontSize: {xs: 26, sm: 30}, lineHeight: 1, fontWeight: 400, color: workstationVisuals.tierTextHeading, letterSpacing: 0}}>
            {value}
          </Typography>
          <Typography sx={{fontSize: 13, lineHeight: 1.2, fontWeight: 400, color: workstationVisuals.tierTextHeading, mt: 0.45}}>
            {unit}
          </Typography>
        </Box>
        <Typography sx={{fontSize: 10.5, lineHeight: 1.1, color: workstationVisuals.tierTextHeading, letterSpacing: 0}}>
          {label}
        </Typography>
      </Box>
      <Box
        sx={{
          minWidth: 62,
          borderLeft: `1px solid ${tokenNeutral.dark}`,
          pl: 0.9,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.35,
        }}
      >
        <Typography sx={{fontSize: 8, lineHeight: 1, fontWeight: 800, color: workstationVisuals.tierTextLabel, letterSpacing: 0.6}}>
          TARGET
        </Typography>
        <Box
          sx={{
            px: 0.75,
            py: 0.2,
            borderRadius: 3,
            bgcolor: targetBg,
            color: targetColor,
            fontSize: 10,
            lineHeight: 1.1,
            fontWeight: 800,
            whiteSpace: 'nowrap',
          }}
        >
          {target}
        </Box>
      </Box>
    </Paper>
  );
}

function GaugeCard({
  caption,
  leftArc,
  rightArc,
  target,
  value,
}: {
  caption: string;
  leftArc: string;
  rightArc: string;
  target: string;
  value: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        height: 172,
        p: 1.45,
        borderRadius: 1.5,
        bgcolor: tokenCommon.white,
        border: `1px solid ${tokenNeutral.main}`,
        overflow: 'hidden',
      }}
    >
      <Typography sx={{fontSize: 15.5, fontWeight: 800, color: workstationVisuals.tierTextHeading, lineHeight: 1}}>
        {caption}
      </Typography>
      <AutoAwesomeIcon
        sx={{
          position: 'absolute',
          top: 12,
          right: 13,
          color: tokenInfo.lightest,
          fontSize: 19,
        }}
      />
      <Box sx={{position: 'absolute', left: 18, right: 18, bottom: 22, height: 112}}>
        <svg viewBox="0 0 190 112" width="100%" height="100%" aria-hidden="true">
          <path
            d="M 20 92 A 75 75 0 0 1 170 92"
            fill="none"
            stroke={tokenNeutral.dark}
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M 20 92 A 75 75 0 0 1 96 18"
            fill="none"
            stroke={leftArc}
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M 20 92 A 75 75 0 0 1 170 92"
            fill="none"
            stroke={rightArc}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="168 238"
            strokeDashoffset="-66"
          />
          <path
            d="M 20 92 A 75 75 0 0 1 170 92"
            fill="none"
            stroke={tokenInfo.darkest}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray="112 238"
            strokeDashoffset="-6"
          />
          <path
            d="M 20 92 A 75 75 0 0 1 170 92"
            fill="none"
            stroke={tokenWarning.dark}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="120 238"
            strokeDashoffset="-12"
            opacity={leftArc === tokenWarning.dark ? 1 : 0}
          />
          <circle cx={caption === 'Running SKU/PO' ? 160 : 59} cy={caption === 'Running SKU/PO' ? 47 : 34} r="7" fill={tokenNeutral.lightest} stroke={caption === 'Running SKU/PO' ? tokenInfo.darkest : tokenWarning.dark} strokeWidth="5" />
        </svg>
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 58,
            textAlign: 'center',
          }}
        >
          <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 0.25}}>
            <Typography sx={{fontSize: 40, lineHeight: 0.9, fontWeight: 400, color: workstationVisuals.tierTextHeading, letterSpacing: 0}}>
              {value}
            </Typography>
            <Typography sx={{fontSize: 17, lineHeight: 1, fontWeight: 300, color: workstationVisuals.tierTextLabel, mt: 0.4}}>
              %
            </Typography>
          </Box>
          <Typography sx={{fontSize: 10, lineHeight: 1.2, color: caption === 'Running SKU/PO' ? tokenSuccess.darker : tokenWarning.darker, mt: 0.25}}>
            {target}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

type MyProductionPlanningWidgetProps = {
  onExpand?: () => void;
};

export default function MyProductionPlanningWidget({onExpand}: MyProductionPlanningWidgetProps) {
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
      }}
    >
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.3}}>
        <Typography sx={{fontSize: 15, lineHeight: 1, fontWeight: 800, color: tokenBrand.dark}}>
          Production Planning
        </Typography>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1.2}}>
          <AutoAwesomeIcon sx={{fontSize: 18, color: tokenInfo.lightest}} />
          <StarBorderIcon sx={{fontSize: 19, color: tokenBrand.main}} />
          <IconButton
            aria-label="Expand production planning"
            onClick={onExpand}
            size="small"
            sx={{width: 22, height: 22, p: 0, color: tokenBrand.main}}
          >
            <OpenInFullIcon sx={{fontSize: 18}} />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 1.3, mb: 1.3}}>
        <TopMetricCard
          accent={tokenSuccess.dark}
          label="Line Effectiveness"
          target="85%"
          targetBg={tokenSuccess.darker}
          targetColor={tokenCommon.white}
          unit="%"
          value="88.4"
        />
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 1.3}}>
        <GaugeCard
          caption="Running SKU/PO"
          leftArc={tokenError.light}
          rightArc={tokenSuccess.lighter}
          target="Remaining Qty: 21%"
          value="75"
        />
      </Box>
    </Paper>
  );
}
