import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {useState} from 'react';
import {Box, Button, Chip, Paper, Typography} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AutoAwesome as AutoAwesomeIcon,
  OpenInFull as OpenInFullIcon,
  StarBorder as StarBorderIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';

const oeeLineGroups = [
  {
    title: 'Unit 1',
    sku: 'SKU: 1mL Chloraprep',
    lines: [
      {status: 'RUNNING', tone: tokenSuccess.dark, message: 'Production above target', messageTone: tokenNeutral.lighter, iconTone: workstationVisuals.textSecondary},
      {status: 'IDLE', tone: tokenWarning.dark, message: 'Waiting for Material', messageTone: tokenNeutral.lighter, iconTone: tokenWarning.dark},
      {status: 'RUNNING', tone: tokenSuccess.dark, message: 'Production above target', messageTone: tokenNeutral.lighter, iconTone: workstationVisuals.textSecondary},
      {status: 'DOWN', tone: tokenError.main, message: 'Material Jam', messageTone: tokenNeutral.lighter, iconTone: tokenError.main},
      {status: 'RUNNING', tone: tokenSuccess.dark, message: 'Production above target', messageTone: tokenNeutral.lighter, iconTone: workstationVisuals.textSecondary},
    ],
  },
  {
    title: '',
    sku: 'SKU: 1mL Chloraprep',
    lines: [
      {status: 'RUNNING', tone: tokenSuccess.dark, message: 'Production above target', messageTone: tokenNeutral.lighter, iconTone: workstationVisuals.textSecondary},
      {status: 'RUNNING', tone: tokenSuccess.dark, message: 'Production above target', messageTone: tokenNeutral.lighter, iconTone: workstationVisuals.textSecondary},
      {status: 'IDLE', tone: tokenWarning.dark, message: 'Waiting for Material', messageTone: tokenNeutral.lighter, iconTone: tokenWarning.dark},
    ],
  },
  {
    title: 'Unit 1',
    sku: 'SKU: 1mL Chloraprep',
    lines: [
      {status: 'RUNNING', tone: tokenSuccess.dark, message: 'Production above target', messageTone: tokenNeutral.lighter, iconTone: workstationVisuals.textSecondary},
      {status: 'RUNNING', tone: tokenSuccess.dark, message: 'Production above target', messageTone: tokenNeutral.lighter, iconTone: workstationVisuals.textSecondary},
      {status: 'RUNNING', tone: tokenSuccess.dark, message: 'Production above target', messageTone: tokenNeutral.lighter, iconTone: workstationVisuals.textSecondary},
    ],
  },
];

function LineMonitorFrame() {
  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        aspectRatio: '784 / 592',
        borderRadius: 1,
        overflow: 'hidden',
        border: `1px solid ${tokenInfo.lightest}`,
        boxShadow: '0 0 16px rgba(29, 102, 242, 0.16)',
        bgcolor: tokenCommon.white,
      }}
    >
      <Box
        component="img"
        src="/images/OEE%20Equipament.png"
        sx={{display: 'block', width: '100%', height: '100%', objectFit: 'cover'}}
      />
    </Paper>
  );
}

function OeeLineCard({
  index,
  line,
  onOpen,
}: {
  index: number;
  line: {status: string; tone: string; message: string; messageTone: string; iconTone: string};
  onOpen: () => void;
}) {
  const isAlert = line.status !== 'RUNNING';

  return (
    <Paper
      elevation={0}
      onClick={index === 0 ? onOpen : undefined}
      sx={{
        width: '100%',
        height: 150,
        p: 1.2,
        border: `1px solid ${tokenNeutral.main}`,
        borderRadius: 1.2,
        bgcolor: tokenCommon.white,
        cursor: index === 0 ? 'pointer' : 'default',
        transition: 'box-shadow 140ms ease, border-color 140ms ease',
        '&:hover': index === 0 ? {borderColor: tokenBrand.lighter, boxShadow: '0 8px 22px rgba(37, 99, 235, 0.12)'} : undefined,
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6, pb: 1, borderBottom: `1px solid ${tokenNeutral.main}`}}>
        <Typography sx={{fontSize: 16, color: workstationVisuals.tierTextHeading, fontWeight: 900}}>Line 1</Typography>
        <Chip
          label={line.status}
          sx={{
            height: 16,
            border: `1px solid ${line.tone}`,
            bgcolor: tokenCommon.white,
            color: line.tone,
            fontSize: 8,
            fontWeight: 900,
          }}
        />
      </Box>
      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2, my: 1.6}}>
        {[
          {value: '1,250', label: 'Good Units'},
          {value: '2.3', suffix: '%', label: 'Scrap Rate'},
        ].map((metric) => (
          <Paper key={metric.label} elevation={0} sx={{height: 52, display: 'grid', placeItems: 'center', border: `1px solid ${tokenNeutral.main}`, borderRadius: 1, bgcolor: tokenNeutral.lightest}}>
            <Box sx={{textAlign: 'center'}}>
              <Typography sx={{fontSize: 25, lineHeight: 0.95, color: workstationVisuals.tierTextHeading}}>
                {metric.value}<Box component="span" sx={{fontSize: 11, ml: 0.2}}>{metric.suffix}</Box>
              </Typography>
              <Typography sx={{fontSize: 10, color: workstationVisuals.tierTextHeading, lineHeight: 1}}>{metric.label}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>
      <Box sx={{height: 31, px: 1, borderRadius: 0.8, display: 'flex', alignItems: 'center', gap: 0.8, bgcolor: line.messageTone, color: isAlert ? line.iconTone : workstationVisuals.textSecondary}}>
        <WarningIcon sx={{fontSize: 16, color: line.iconTone}} />
        <Typography sx={{fontSize: 11}}>{line.message}</Typography>
      </Box>
    </Paper>
  );
}

function OeeLineSelection({onBack, onOpenLine}: {onBack: () => void; onOpenLine: () => void}) {
  return (
    <Box sx={{width: '100%', minHeight: '100%', bgcolor: tokenCommon.white, p: {xs: 1, md: 1.5}, color: workstationVisuals.tierTextHeading}}>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 2.5, width: '100%'}}>
        <Button onClick={onBack} sx={{minWidth: 28, width: 28, height: 28, p: 0, color: tokenBrand.main}}>
          <ArrowBackIcon />
        </Button>
        <Typography sx={{fontSize: 18, fontWeight: 900}}>Overall Equipment Efficiency</Typography>
      </Box>
      <Box sx={{height: 40, display: 'flex', alignItems: 'end', gap: 2.5, mb: 2.2, width: '100%'}}>
        {['LINE MONITORING', 'DASHBOARD', 'SHIFT TRENDS', 'RECONTEXTUALIZATION'].map((tab, index) => (
          <Typography key={tab} sx={{fontSize: 11, color: index === 0 ? tokenBrand.main : tokenNeutral.darkest, fontWeight: 900, pb: 0.8, borderBottom: index === 0 ? `2px solid ${tokenBrand.main}` : '2px solid transparent'}}>
            {tab}
          </Typography>
        ))}
      </Box>

      {oeeLineGroups.map((group, groupIndex) => (
        <Box key={`${group.title}-${groupIndex}`} sx={{mb: 3.4, width: '100%'}}>
          {group.title ? <Typography sx={{fontSize: 16, fontWeight: 900, mb: 1.7}}>{group.title}</Typography> : null}
          <Chip label={group.sku} sx={{height: 24, mb: 1.1, borderRadius: 4, bgcolor: tokenNeutral.main, color: workstationVisuals.textSecondary, fontSize: 11}} />
          <Box sx={{display: 'grid', gridTemplateColumns: {xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr))'}, gap: 1.7, width: '100%'}}>
            {group.lines.map((line, index) => (
              <OeeLineCard key={`${groupIndex}-${index}`} index={groupIndex === 0 && index === 0 ? 0 : 1} line={line} onOpen={onOpenLine} />
            ))}
          </Box>
        </Box>
      ))}

      <Button onClick={onBack} sx={{position: 'fixed', right: 28, bottom: 24, minWidth: 54, width: 54, height: 54, borderRadius: '50%', bgcolor: tokenBrand.main, color: tokenCommon.white, boxShadow: '0 14px 26px rgba(11, 99, 229, 0.25)', '&:hover': {bgcolor: tokenBrand.dark}}}>
        <AutoAwesomeIcon />
      </Button>
    </Box>
  );
}

function GaugeCard({title, type}: {title: string; type: 'sku' | 'oee'}) {
  const isSku = type === 'sku';

  return (
    <Paper elevation={0} sx={{position: 'relative', height: 120, p: 1.15, border: `1px solid ${tokenNeutral.main}`, borderRadius: 1.5, bgcolor: tokenCommon.white, overflow: 'hidden'}}>
      <Typography sx={{fontSize: 14, fontWeight: 900, color: workstationVisuals.tierTextHeading}}>{title}</Typography>
      <AutoAwesomeIcon sx={{position: 'absolute', top: 11, right: 11, fontSize: 16, color: tokenInfo.lightest}} />
      <Box sx={{position: 'absolute', left: 12, right: 12, bottom: 9, height: 92}}>
        <svg viewBox="0 0 190 112" width="100%" height="100%" aria-hidden="true">
          <path d="M 20 92 A 75 75 0 0 1 170 92" fill="none" stroke={tokenNeutral.dark} strokeLinecap="round" strokeWidth="9" />
          <path
            d={isSku ? 'M 20 92 A 75 75 0 0 1 160 48' : 'M 20 92 A 75 75 0 0 1 96 18'}
            fill="none"
            stroke={isSku ? tokenInfo.darkest : tokenWarning.dark}
            strokeLinecap="round"
            strokeWidth="9"
          />
          <path d="M 20 92 A 75 75 0 0 1 170 92" fill="none" stroke={tokenSuccess.lighter} strokeDasharray="168 238" strokeDashoffset="-66" strokeLinecap="round" strokeWidth="5" />
          {!isSku ? <path d="M 20 92 A 75 75 0 0 1 170 92" fill="none" stroke={tokenWarning.dark} strokeDasharray="120 238" strokeDashoffset="-12" strokeLinecap="round" strokeWidth="6" /> : null}
          <circle cx={isSku ? 160 : 59} cy={isSku ? 48 : 34} r="7" fill={tokenCommon.white} stroke={isSku ? tokenInfo.darkest : tokenWarning.dark} strokeWidth="5" />
        </svg>
        <Box sx={{position: 'absolute', left: 0, right: 0, top: 48, textAlign: 'center'}}>
          <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 0.25}}>
            <Typography sx={{fontSize: 36, lineHeight: 0.9, color: workstationVisuals.tierTextHeading}}>{isSku ? '75' : '35'}</Typography>
            <Typography sx={{fontSize: 16, color: workstationVisuals.tierTextLabel, mt: 0.5}}>%</Typography>
          </Box>
          <Typography sx={{fontSize: 9, color: isSku ? tokenSuccess.darker : tokenWarning.darker, mt: 0.2}}>
            {isSku ? 'Remaining Qty: 21%' : 'Target: 56%'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

function SmallMetric({accent, label, suffix, target, value}: {accent: string; label: string; suffix: string; target: string; value: string}) {
  const isCost = suffix === '%';

  return (
    <Paper elevation={0} sx={{position: 'relative', height: 48, display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', px: 1.1, pl: 1.5, bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenNeutral.main}`, borderRadius: 1, overflow: 'hidden'}}>
      <Box sx={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: accent}} />
      <Box>
        <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 0.25}}>
          <Typography sx={{fontSize: 25, lineHeight: 1, color: workstationVisuals.tierTextHeading}}>{value}</Typography>
          <Typography sx={{fontSize: 11, mt: 0.2, color: workstationVisuals.tierTextLabel}}>{suffix}</Typography>
        </Box>
        <Typography sx={{fontSize: 9, color: workstationVisuals.tierTextHeading}}>{label}</Typography>
      </Box>
      <Box sx={{pl: 1, borderLeft: `1px solid ${tokenNeutral.dark}`, textAlign: 'center'}}>
        <Typography sx={{fontSize: 7, color: workstationVisuals.tierTextLabel, fontWeight: 900}}>{isCost ? 'COST' : 'TARGET'}</Typography>
        <Chip label={target} sx={{height: 15, fontSize: 7, bgcolor: tokenCommon.white, color: isCost ? tokenError.dark : tokenSuccess.darker, fontWeight: 900}} />
      </Box>
    </Paper>
  );
}

function LossLine({label, value, width, color}: {label: string; value: string; width: string; color: string}) {
  return (
    <Box sx={{mb: 0.95}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 0.25}}>
        <Typography sx={{fontSize: 10, color: workstationVisuals.tierTextLabel}}>{label}</Typography>
        <Typography sx={{fontSize: 10, color: workstationVisuals.textSecondary}}>{value}</Typography>
      </Box>
      <Box sx={{height: 4, borderRadius: 4, bgcolor: tokenNeutral.main}}>
        <Box sx={{height: 4, width, borderRadius: 4, bgcolor: color}} />
      </Box>
    </Box>
  );
}

function LineOverviewPanel() {
  return (
    <Paper elevation={0} sx={{height: '100%', p: 1.35, border: `1px solid ${tokenNeutral.main}`, borderRadius: 1.2, overflow: 'hidden', bgcolor: tokenCommon.white}}>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.1}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
          <Typography sx={{fontSize: 15, fontWeight: 900}}>Line Overview</Typography>
          <Typography sx={{fontSize: 9, color: workstationVisuals.textSecondary}}>1010-PRD-AUT-AFA10</Typography>
          <Chip label="Zone 5 Bottleneck" sx={{height: 18, bgcolor: tokenWarning.dark, color: tokenCommon.white, fontSize: 8, fontWeight: 900}} />
        </Box>
        <AutoAwesomeIcon sx={{fontSize: 17, color: tokenBrand.main}} />
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.1, mb: 1.1}}>
        <GaugeCard title="Running SKU/PO" type="sku" />
        <GaugeCard title="Shift OEE" type="oee" />
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.1, mb: 1.1}}>
        <SmallMetric accent={tokenError.dark} value="14" suffix="%" label="Scrap Rate" target="32.3K" />
        <SmallMetric accent={tokenSuccess.dark} value="125" suffix="ppm" label="Production Projected" target="143PPM" />
      </Box>

      <Paper elevation={0} sx={{p: 1.2, border: `1px solid ${tokenNeutral.main}`, borderRadius: 1.2, mb: 1.1}}>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7}}>
            <Typography sx={{fontSize: 14, fontWeight: 900}}>Top Losses</Typography>
            <Chip label="Total: 40,6k" sx={{height: 18, bgcolor: tokenError.main, color: tokenCommon.white, fontSize: 8, fontWeight: 900}} />
          </Box>
          <Box sx={{display: 'flex', gap: 0.7, color: tokenBrand.main}}>
            <AutoAwesomeIcon sx={{fontSize: 16, color: tokenInfo.lightest}} />
            <StarBorderIcon sx={{fontSize: 16}} />
            <OpenInFullIcon sx={{fontSize: 16}} />
          </Box>
        </Box>
        <LossLine label="Component Jamming [Z5B]" value="16,4k" width="76%" color={tokenError.light} />
        <LossLine label="Product Changeover [Z1A]" value="8,8k" width="43%" color={tokenWarning.light} />
        <LossLine label="Minor Stoppages [Z4]" value="6,8k" width="35%" color={tokenWarning.light} />
      </Paper>

      <Paper elevation={0} sx={{position: 'relative', p: 1.2, border: `1px solid ${tokenNeutral.main}`, borderRadius: 1.2, bgcolor: tokenCommon.white, minHeight: 159}}>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1}}>
          <Typography sx={{fontSize: 15, fontWeight: 900, color: tokenBrand.main}}>BLU.AI INSIGHTS</Typography>
          <Box sx={{display: 'flex', gap: 0.7, color: tokenBrand.main}}>
            <AutoAwesomeIcon sx={{fontSize: 16, color: tokenInfo.lightest}} />
            <StarBorderIcon sx={{fontSize: 16}} />
            <OpenInFullIcon sx={{fontSize: 16}} />
          </Box>
        </Box>
        <Paper elevation={0} sx={{p: 1.2, bgcolor: tokenNeutral.lightest, borderRadius: 1}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.8}}>
            <WarningIcon sx={{fontSize: 17, color: tokenError.main}} />
            <Typography sx={{fontSize: 14, fontWeight: 900, color: workstationVisuals.tierTextHeading}}>Critical Bottleneck</Typography>
          </Box>
          <Typography sx={{fontSize: 11, lineHeight: 1.45, color: workstationVisuals.tierTextHeading}}>
            <b>Zone 5A</b> is operating at <b>78.3 PPM</b> (35% below Target). This is triggering a synchronized failure pattern across the line.
          </Typography>
        </Paper>
        <Typography sx={{position: 'absolute', right: 14, bottom: 11, fontSize: 9, color: tokenBrand.main, fontWeight: 900}}>
          GO TO DASHBOARD
        </Typography>
      </Paper>
    </Paper>
  );
}

export default function MyShiftOeeExpanded({onBack}: {onBack: () => void}) {
  const [showLineDetail, setShowLineDetail] = useState(false);

  if (!showLineDetail) {
    return <OeeLineSelection onBack={onBack} onOpenLine={() => setShowLineDetail(true)} />;
  }

  return (
    <Box sx={{minHeight: '100%', bgcolor: tokenCommon.white, p: 1.4, color: workstationVisuals.tierTextHeading}}>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 0.9}}>
        <Button onClick={() => setShowLineDetail(false)} sx={{minWidth: 28, width: 28, height: 28, p: 0, color: tokenBrand.main}}>
          <ArrowBackIcon />
        </Button>
        <Typography sx={{fontSize: 18, fontWeight: 900}}>Overall Equipment Efficiency</Typography>
        <Typography sx={{fontSize: 12, color: workstationVisuals.textSecondary}}>Local</Typography>
      </Box>

      <Paper elevation={0} sx={{p: 1.1, borderRadius: 1, border: `1px solid ${tokenNeutral.main}`, bgcolor: tokenCommon.white}}>
        <Box sx={{height: 40, display: 'flex', alignItems: 'end', gap: 2.5, px: 0.7, pb: 0.6}}>
          {['LINE MONITORING', 'DASHBOARD', 'SHIFT TRENDS', 'RECONTEXTUALIZATION'].map((tab, index) => (
            <Typography key={tab} sx={{fontSize: 11, color: index === 0 ? tokenBrand.main : workstationVisuals.textSecondary, fontWeight: 900, pb: 0.8, borderBottom: index === 0 ? `2px solid ${tokenBrand.main}` : '2px solid transparent'}}>
              {tab}
            </Typography>
          ))}
        </Box>

        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'minmax(720px, 1.78fr) minmax(420px, 1fr)'}, gap: 1.5, alignItems: 'stretch'}}>
          <LineMonitorFrame />
          <LineOverviewPanel />
        </Box>
      </Paper>
    </Box>
  );
}
