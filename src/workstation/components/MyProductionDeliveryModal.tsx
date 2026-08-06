import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {Box, IconButton, Paper, Typography} from '@mui/material';
import {Close as CloseIcon, SendOutlined as SendOutlinedIcon} from '@mui/icons-material';

type MyProductionDeliveryModalProps = {
  onClose: () => void;
};

const rows = [
  {hour: '07:00', safety: 'OK', quality: 'OK', planned: '1200', actual: '1200', cumulative: '1200'},
  {hour: '08:00', safety: 'OK', quality: 'NOK', planned: '1200', actual: '1200', cumulative: '2400'},
  {hour: '09:00', safety: 'OK', quality: 'OK', planned: '1200', actual: '1200', cumulative: '3600'},
  {hour: '10:00', safety: 'OK', quality: 'OK', planned: '1200', actual: '989', cumulative: '4589', problem: 'High false reflection at vision system', actionTaken: 'Reset vision system', owner: 'Gracie Walker'},
  {hour: '11:00', safety: 'OK', quality: 'OK', planned: '1200', actual: '1200', cumulative: '5789'},
  {hour: '12:00', safety: 'OK', quality: 'OK', planned: '1200', actual: '1200', cumulative: '6989'},
];

export default function MyProductionDeliveryModal({onClose}: MyProductionDeliveryModalProps) {
  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 2200, bgcolor: 'rgba(2, 6, 23, 0.52)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2}}>
      <Paper elevation={0} sx={{width: 'min(1380px, 99vw)', maxHeight: '95vh', overflowY: 'auto', borderRadius: 3, border: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenNeutral.lightest}}>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.25, borderBottom: `1px solid ${tokenNeutral.main}`}}>
          <Typography sx={{fontSize: 30, color: workstationVisuals.textPrimary, fontWeight: 800}}>Production Delivery</Typography>
          <IconButton onClick={onClose} sx={{color: workstationVisuals.textPrimary}}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{p: 2.25, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 1.5}}>
          <Box sx={{minWidth: 0}}>
            <Box sx={{display: 'grid', gridTemplateColumns: '82px 80px 84px 98px 90px 118px 142px 98px 112px', px: 1, py: 0.5}}>
              {['HOUR', 'SAFETY', 'QUALITY', 'PLANNED QTD', 'ACTUAL QTD', 'CUMULATIVE QTD', 'PROBLEM', 'ACTION TAKEN', 'OWNER'].map((col) => (
                <Typography key={col} sx={{fontSize: 10, color: workstationVisuals.tierTextLabel, fontWeight: 800, letterSpacing: 0.2}}>{col}</Typography>
              ))}
            </Box>

            {rows.map((row) => (
              <Box key={row.hour} sx={{display: 'grid', gridTemplateColumns: '82px 80px 84px 98px 90px 118px 142px 98px 112px', px: 1, py: 0.6, alignItems: 'start'}}>
                <Typography sx={{fontSize: 13, color: workstationVisuals.tierTextLabel, fontWeight: 500}}>{row.hour}</Typography>
                <Typography sx={{fontSize: 18, color: tokenSuccess.darker, fontWeight: 800, lineHeight: 1}}>OK</Typography>
                <Typography sx={{fontSize: 18, color: row.quality === 'NOK' ? tokenError.main : tokenSuccess.darker, fontWeight: 800, lineHeight: 1}}>{row.quality}</Typography>
                <Typography sx={{fontSize: 18, color: workstationVisuals.tierTextLabel, fontWeight: 700, lineHeight: 1.05}}>{row.planned}</Typography>
                <Typography sx={{fontSize: 18, color: row.actual === '989' ? tokenError.main : workstationVisuals.tierTextLabel, fontWeight: 700, lineHeight: 1.05}}>{row.actual}</Typography>
                <Typography sx={{fontSize: 18, color: workstationVisuals.tierTextLabel, fontWeight: 700, lineHeight: 1.05}}>{row.cumulative}</Typography>
                <Typography sx={{fontSize: 10, color: workstationVisuals.textMuted, fontWeight: 700, lineHeight: 1.25}}>{row.problem ?? ''}</Typography>
                <Typography sx={{fontSize: 10, color: workstationVisuals.textMuted, fontWeight: 700, lineHeight: 1.25}}>{row.actionTaken ?? ''}</Typography>
                <Typography sx={{fontSize: 17, color: workstationVisuals.tierTextHeading, fontWeight: 700, lineHeight: 1.1}}>{row.owner ?? ''}</Typography>
              </Box>
            ))}
          </Box>

          <Paper elevation={0} sx={{borderRadius: 2, border: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenNeutral.lightest, p: 1.25}}>
            <Typography sx={{fontSize: 24, color: workstationVisuals.textPrimary, fontWeight: 700, mb: 0.8}}>Comments</Typography>
            <Paper elevation={0} sx={{p: 1.1, mb: 1, borderRadius: 1.5, border: `1px solid ${tokenNeutral.main}`, bgcolor: tokenCommon.white}}>
              <Typography sx={{fontSize: 12, color: workstationVisuals.tierTextHeading}}>I checked the tolerance with a caliper and didn't find the gap. I'll try again with the laser sensor.</Typography>
              <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 0.8}}>
                <Typography sx={{fontSize: 11, color: workstationVisuals.textSecondary, fontWeight: 700}}>John Smith</Typography>
                <Typography sx={{fontSize: 11, color: workstationVisuals.textSecondary}}>Mar 18, 11:41</Typography>
              </Box>
            </Paper>
            <Paper elevation={0} sx={{p: 1.1, mb: 1, borderRadius: 1.5, border: `1px solid ${tokenNeutral.main}`, bgcolor: tokenCommon.white}}>
              <Typography sx={{fontSize: 12, color: workstationVisuals.tierTextHeading}}>Assigned to @John Smith. Let me know if you have any questions.</Typography>
              <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 0.8}}>
                <Typography sx={{fontSize: 11, color: workstationVisuals.textSecondary, fontWeight: 700}}>Maria Pinna</Typography>
                <Typography sx={{fontSize: 11, color: workstationVisuals.textSecondary}}>Mar 18, 09:20</Typography>
              </Box>
            </Paper>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2}}>
              <Typography sx={{fontSize: 12, color: workstationVisuals.tierTextMeta}}>Leave a Comment</Typography>
              <SendOutlinedIcon sx={{fontSize: 18, color: tokenBrand.main}} />
            </Box>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}
