import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {Box, IconButton, Paper, Typography} from '@mui/material';
import {Close as CloseIcon, WarningAmber as WarningAmberIcon} from '@mui/icons-material';

type MySeriousInjuryModalProps = {
  onClose: () => void;
};

export default function MySeriousInjuryModal({onClose}: MySeriousInjuryModalProps) {
  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 2200, bgcolor: 'rgba(2, 6, 23, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2}}>
      <Paper elevation={0} sx={{width: 'min(860px, 96vw)', maxHeight: '92vh', overflowY: 'auto', borderRadius: 2.5, border: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenNeutral.lightest}}>
        <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', p: 2.25, pb: 1.5}}>
          <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1.25}}>
            <Box sx={{width: 28, height: 28, borderRadius: '50%', border: `1px solid ${tokenError.lightest}`, bgcolor: tokenNeutral.lighter, display: 'grid', placeItems: 'center', color: tokenError.main, fontSize: 14, fontWeight: 800}}>
              !
            </Box>
            <Box>
              <Typography sx={{fontSize: 26, lineHeight: 1.05, fontWeight: 800, color: workstationVisuals.tierTextHeading}}>Serious Injury Analysis</Typography>
              <Typography sx={{fontSize: 12, color: workstationVisuals.textSecondary, fontWeight: 700, letterSpacing: 0.8, mt: 0.25}}>UNIT PERFORMANCE BREAKDOWN</Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{color: workstationVisuals.textPrimary}}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{px: 2.25, pb: 2.25}}>
          <Paper elevation={0} sx={{p: 1.5, borderRadius: 2, border: `1px solid ${tokenError.lightest}`, bgcolor: tokenNeutral.lightest}}>
            <Box sx={{display: 'flex', alignItems: {xs: 'flex-start', md: 'center'}, flexDirection: {xs: 'column', md: 'row'}, justifyContent: 'space-between', gap: 1, mb: 1.25}}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <Typography sx={{fontSize: 22, fontWeight: 800, color: workstationVisuals.textPrimary, lineHeight: 1}}>LINE 2</Typography>
                <Box sx={{px: 1, py: 0.25, borderRadius: 1.25, bgcolor: tokenNeutral.lighter}}>
                  <Typography sx={{fontSize: 11, fontWeight: 800, color: tokenError.main}}>ISSUES FOUND</Typography>
                </Box>
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6}}>
                <WarningAmberIcon sx={{fontSize: 14, color: tokenError.main}} />
                <Typography sx={{fontSize: 12, fontWeight: 800, color: tokenError.main}}>CRITICAL ACTION REQUIRED</Typography>
              </Box>
            </Box>
            <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '1fr 1fr'}, gap: 1}}>
              <Paper elevation={0} sx={{p: 1.25, borderRadius: 1.6, border: `1px solid ${tokenError.lightest}`, bgcolor: tokenNeutral.lighter}}>
                <Typography sx={{fontSize: 11, color: workstationVisuals.textSecondary, fontWeight: 700}}>ISSUE TYPE</Typography>
                <Typography sx={{fontSize: 20, color: tokenError.main, fontWeight: 800, mt: 0.15, lineHeight: 1.05}}>Serious Injury</Typography>
              </Paper>
              <Paper elevation={0} sx={{p: 1.25, borderRadius: 1.6, border: `1px solid ${tokenNeutral.main}`, bgcolor: tokenCommon.white}}>
                <Typography sx={{fontSize: 11, color: workstationVisuals.textSecondary, fontWeight: 700}}>EQUIPMENT / ZONE</Typography>
                <Typography sx={{fontSize: 14, color: workstationVisuals.tierTextHeading, fontWeight: 700, mt: 0.2}}>Conveyor Section A4</Typography>
              </Paper>
            </Box>
            <Paper elevation={0} sx={{p: 1.3, mt: 1, borderRadius: 1.6, border: `1px solid ${tokenNeutral.main}`, bgcolor: tokenCommon.white}}>
              <Typography sx={{fontSize: 11, color: workstationVisuals.textSecondary, fontWeight: 700}}>ROOT CAUSE</Typography>
              <Typography sx={{fontSize: 14, color: workstationVisuals.tierTextHeading, mt: 0.2, fontWeight: 500}}>Operator bypassed safety guard for quicker maintenance</Typography>
            </Paper>
            <Paper elevation={0} sx={{p: 1.3, mt: 1, borderRadius: 1.6, border: `1px solid ${tokenWarning.lighter}`, bgcolor: tokenNeutral.lightest}}>
              <Typography sx={{fontSize: 11, color: tokenWarning.darker, fontWeight: 800}}>TIER 1 REMARKS</Typography>
              <Typography sx={{fontSize: 14, color: tokenWarning.darker, mt: 0.2}}>Safety protocol reviewed with all shift leads. Additional sensors being installed.</Typography>
            </Paper>
            <Paper elevation={0} sx={{p: 1.2, mt: 1, borderRadius: 1.6, border: `1px solid ${tokenInfo.lightest}`, bgcolor: tokenNeutral.lightest}}>
              <Typography sx={{fontSize: 12, color: tokenBrand.main, fontWeight: 800, textAlign: 'center', letterSpacing: 0.3}}>AI INSIGHTS & RECOMMENDATIONS</Typography>
            </Paper>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}
