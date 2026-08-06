import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {useState} from 'react';
import {Box, IconButton, Paper, Typography} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  BarChart as BarChartIcon,
  Close as CloseIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';

type MyDowntimeAnalysisModalProps = {
  mode?: 'line' | 'unit' | 'plant';
  onClose: () => void;
  title?: string;
};

const unitRows = [
  {id: 1, status: 'Stable', downtime: '22 min', tone: tokenSuccess.dark, issue: false},
  {id: 2, status: 'Issue found', downtime: '180 min', tone: tokenError.dark, issue: true},
  {id: 3, status: 'Stable', downtime: '34 min', tone: tokenSuccess.dark, issue: false},
  {id: 4, status: 'Stable', downtime: '28 min', tone: tokenSuccess.dark, issue: false},
  {id: 5, status: 'Stable', downtime: '31 min', tone: tokenSuccess.dark, issue: false},
  {id: 6, status: 'Stable', downtime: '25 min', tone: tokenSuccess.dark, issue: false},
];

export default function MyDowntimeAnalysisModal({mode = 'unit', onClose, title = 'Unit Downtime Analysis'}: MyDowntimeAnalysisModalProps) {
  const [showPlantUnitDetails, setShowPlantUnitDetails] = useState(false);
  const showUnitList = mode === 'plant' && !showPlantUnitDetails;

  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 2200, bgcolor: 'rgba(2, 6, 23, 0.52)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2}}>
      <Paper elevation={0} sx={{width: 'min(880px, 97vw)', maxHeight: '93vh', overflowY: 'auto', borderRadius: 3, border: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenNeutral.lightest}}>
        <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', p: 2.25, borderBottom: `1px solid ${tokenNeutral.main}`}}>
          <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1.25}}>
            <Box sx={{width: 34, height: 34, borderRadius: '50%', border: `1px solid ${tokenInfo.lightest}`, bgcolor: tokenNeutral.lighter, display: 'grid', placeItems: 'center'}}>
              <BarChartIcon sx={{fontSize: 18, color: tokenBrand.main}} />
            </Box>
            <Box>
              <Typography sx={{fontSize: 28, color: workstationVisuals.tierTextHeading, fontWeight: 800, lineHeight: 1.05}}>{title}</Typography>
              <Typography sx={{fontSize: 12, color: workstationVisuals.textSecondary, fontWeight: 700, letterSpacing: 0.8, mt: 0.2}}>
                {mode === 'plant' ? 'PLANT PERFORMANCE BREAKDOWN' : 'UNIT PERFORMANCE BREAKDOWN'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{color: workstationVisuals.textPrimary}}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{p: 2.25}}>
          {showUnitList ? (
            <Paper elevation={0} sx={{p: 1.5, borderRadius: 2.2, border: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenCommon.white}}>
              <Typography sx={{fontSize: 15, color: workstationVisuals.textSecondary, fontWeight: 800, mb: 1.2}}>UNITS</Typography>
              <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))'}, gap: 1}}>
                {unitRows.map((unit) => (
                  <Paper
                    key={unit.id}
                    elevation={0}
                    onClick={() => unit.issue && setShowPlantUnitDetails(true)}
                    sx={{
                      position: 'relative',
                      minHeight: 88,
                      p: 1.35,
                      pl: 1.65,
                      borderRadius: 1.8,
                      border: unit.issue ? `1px solid ${tokenError.lightest}` : `1px solid ${tokenNeutral.main}`,
                      bgcolor: unit.issue ? tokenNeutral.lightest : tokenNeutral.lightest,
                      cursor: unit.issue ? 'pointer' : 'default',
                      overflow: 'hidden',
                    }}
                  >
                    <Box sx={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, bgcolor: unit.tone}} />
                    <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1}}>
                      <Box>
                        <Typography sx={{fontSize: 28, color: workstationVisuals.textPrimary, fontWeight: 850, lineHeight: 1}}>UNIT {unit.id}</Typography>
                        <Typography sx={{fontSize: 13, color: unit.issue ? tokenError.main : workstationVisuals.tierTextHeading, fontWeight: 800, mt: 0.55}}>{unit.status}</Typography>
                      </Box>
                      {unit.issue ? (
                        <Box sx={{px: 0.8, py: 0.25, borderRadius: 1.25, bgcolor: tokenNeutral.lighter}}>
                          <Typography sx={{fontSize: 10.5, fontWeight: 850, color: tokenError.main}}>ISSUES FOUND</Typography>
                        </Box>
                      ) : null}
                    </Box>
                    <Typography sx={{fontSize: 12, color: workstationVisuals.textSecondary, fontWeight: 700, mt: 1}}>DOWNTIME</Typography>
                    <Typography sx={{fontSize: 16, color: unit.issue ? tokenError.main : workstationVisuals.tierTextHeading, fontWeight: 850}}>{unit.downtime}</Typography>
                  </Paper>
                ))}
              </Box>
            </Paper>
          ) : (
          <Paper elevation={0} sx={{p: 1.5, borderRadius: 2.2, border: `1px solid ${tokenError.lightest}`, bgcolor: tokenNeutral.lightest}}>
            <Box sx={{display: 'flex', alignItems: {xs: 'flex-start', md: 'center'}, flexDirection: {xs: 'column', md: 'row'}, justifyContent: 'space-between', gap: 1, mb: 1.2}}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <Typography sx={{fontSize: 32, fontWeight: 800, color: workstationVisuals.textPrimary, lineHeight: 1}}>LINE 2</Typography>
                <Box sx={{px: 1, py: 0.25, borderRadius: 1.25, bgcolor: tokenNeutral.lighter}}>
                  <Typography sx={{fontSize: 11, fontWeight: 800, color: tokenError.main}}>ISSUES FOUND</Typography>
                </Box>
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6}}>
                <WarningAmberIcon sx={{fontSize: 14, color: tokenError.main}} />
                <Typography sx={{fontSize: 12, fontWeight: 800, color: tokenError.main}}>CRITICAL ACTION REQUIRED</Typography>
              </Box>
            </Box>

            <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(4, minmax(0, 1fr))'}, gap: 1}}>
              <Paper elevation={0} sx={{p: 1.2, borderRadius: 1.6, border: `1px solid ${tokenError.lightest}`, bgcolor: tokenNeutral.lighter}}>
                <Typography sx={{fontSize: 11, color: workstationVisuals.textSecondary, fontWeight: 700}}>ISSUE TYPE</Typography>
                <Typography sx={{fontSize: 14, color: tokenError.main, fontWeight: 800, mt: 0.2}}>Machine Breakdown</Typography>
              </Paper>
              <Paper elevation={0} sx={{p: 1.2, borderRadius: 1.6, border: `1px solid ${tokenNeutral.main}`, bgcolor: tokenCommon.white}}>
                <Typography sx={{fontSize: 11, color: workstationVisuals.textSecondary, fontWeight: 700}}>EQUIPMENT / ZONE</Typography>
                <Typography sx={{fontSize: 14, color: workstationVisuals.tierTextHeading, fontWeight: 700, mt: 0.2}}>Feeder Assembly B045</Typography>
              </Paper>
              <Paper elevation={0} sx={{p: 1.2, borderRadius: 1.6, border: `1px solid ${tokenWarning.lightest}`, bgcolor: tokenNeutral.lightest}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45}}>
                  <AccessTimeIcon sx={{fontSize: 13, color: workstationVisuals.textSecondary}} />
                  <Typography sx={{fontSize: 11, color: workstationVisuals.textSecondary, fontWeight: 700}}>DURATION</Typography>
                </Box>
                <Typography sx={{fontSize: 16, color: tokenError.main, fontWeight: 800, mt: 0.2}}>180 minutes</Typography>
              </Paper>
              <Paper elevation={0} sx={{p: 1.2, borderRadius: 1.6, border: `1px solid ${tokenError.lightest}`, bgcolor: tokenNeutral.lighter}}>
                <Typography sx={{fontSize: 11, color: workstationVisuals.textSecondary, fontWeight: 700}}>PRODUCTION LOST</Typography>
                <Typography sx={{fontSize: 16, color: tokenError.main, fontWeight: 800, mt: 0.2}}>9800 units</Typography>
              </Paper>
            </Box>

            <Paper elevation={0} sx={{p: 1.3, mt: 1, borderRadius: 1.6, border: `1px solid ${tokenNeutral.main}`, bgcolor: tokenCommon.white}}>
              <Typography sx={{fontSize: 11, color: workstationVisuals.textSecondary, fontWeight: 700}}>ROOT CAUSE</Typography>
              <Typography sx={{fontSize: 15, color: workstationVisuals.tierTextHeading, mt: 0.2, fontWeight: 500}}>Component jam in the feeder causing machine breakdown</Typography>
            </Paper>

            <Paper elevation={0} sx={{p: 1.3, mt: 1, borderRadius: 1.6, border: `1px solid ${tokenWarning.lighter}`, bgcolor: tokenNeutral.lightest}}>
              <Typography sx={{fontSize: 11, color: tokenWarning.darker, fontWeight: 800}}>TIER 1 REMARKS</Typography>
              <Typography sx={{fontSize: 14, color: tokenWarning.darker, mt: 0.2}}>Able to fix the machine but not able to recover output target. Planner already has been contacted to review the line plan.</Typography>
            </Paper>

            <Paper elevation={0} sx={{p: 1.2, mt: 1, borderRadius: 1.6, border: `1px solid ${tokenInfo.lightest}`, bgcolor: tokenNeutral.lightest}}>
              <Typography sx={{fontSize: 12, color: tokenBrand.main, fontWeight: 800, textAlign: 'center', letterSpacing: 0.3}}>AI INSIGHTS & RECOMMENDATIONS</Typography>
            </Paper>
          </Paper>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
