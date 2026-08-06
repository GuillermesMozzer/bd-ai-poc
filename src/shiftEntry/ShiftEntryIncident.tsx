import {Box, Button, MenuItem, Paper, Select, TextField, Typography} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  MicNone as MicIcon,
  Search as SearchIcon,
  QrCodeScanner as ScanIcon,
  CloudUploadOutlined as UploadIcon,
  KeyboardArrowRight as ArrowRightIcon,
} from '@mui/icons-material';

type ShiftEntryIncidentProps = {
  onClose: () => void;
};

export default function ShiftEntryIncident({onClose}: ShiftEntryIncidentProps) {
  return (
    <Box>
      <Typography sx={{fontSize: 20, fontWeight: 900, color: '#246BFE', mb: 1.5}}>Incident Report</Typography>
      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.7, mb: 0.7}}>
        <InfoField label="ID Number" value="INC-928374" />
        <InfoField label="Date" value="14/01/2025, 09:15:00" />
      </Box>
      
      <Box sx={{border: '1px solid #D9DEE8', borderRadius: 1.1, mb: 1.15, mt: 1.2, position: 'relative', bgcolor: '#FFFFFF'}}>
        <Typography sx={{position: 'absolute', top: -10, left: 9, zIndex: 2, px: 0.55, bgcolor: '#FFFFFF', fontSize: 9.5, color: '#8A93A6'}}>Incident Type</Typography>
        <Select fullWidth size="small" value="Safety" sx={{height: 38, '& fieldset': {border: 'none'}, fontSize: 14}}>
          <MenuItem value="Safety">Safety</MenuItem>
          <MenuItem value="Quality">Quality</MenuItem>
          <MenuItem value="Environment">Environment</MenuItem>
        </Select>
      </Box>

      <Box sx={{border: '1px solid #D9DEE8', borderRadius: 1.1, mb: 1.15, mt: 1.2, position: 'relative', bgcolor: '#FFFFFF'}}>
        <Typography sx={{position: 'absolute', top: -10, left: 9, zIndex: 2, px: 0.55, bgcolor: '#FFFFFF', fontSize: 9.5, color: '#8A93A6'}}>Equipment (if applicable)</Typography>
        <Box sx={{height: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.9, color: '#A0A8B6', fontSize: 12.5}}>
          Equipment ID or Scan
          <Box sx={{display: 'flex', gap: 0.6, color: '#0B63E5'}}><SearchIcon sx={{fontSize: 18}} /><ScanIcon sx={{fontSize: 18}} /></Box>
        </Box>
      </Box>

      <TextField placeholder="Title" size="small" fullWidth sx={{mb: 0.7, '& .MuiOutlinedInput-root': {height: 32, borderRadius: 1.1, fontSize: 12.5}}} />
      <TextField label="Incident Description" multiline minRows={4} fullWidth sx={{mb: 1, '& .MuiInputLabel-root': {fontSize: 11}, '& .MuiOutlinedInput-root': {borderRadius: 1.1, fontSize: 12.5, alignItems: 'flex-start'}}} />
      
      <Box sx={{display: 'flex', justifyContent: 'flex-end', mb: 1.4}}>
        <Button variant="outlined" startIcon={<MicIcon sx={{fontSize: 15}} />} endIcon={<ArrowRightIcon sx={{fontSize: 15}} />} sx={{height: 28, borderColor: '#0B63E5', color: '#0B63E5', borderRadius: 999, fontSize: 10, fontWeight: 900}}>
          Audio Description
        </Button>
      </Box>

      <Typography sx={{fontSize: 12, fontWeight: 900, color: '#044ED7', mb: 0.6}}>Attachments</Typography>
      <Paper elevation={0} sx={{height: 82, borderRadius: 1, bgcolor: '#E5E7EB', display: 'grid', placeItems: 'center', textAlign: 'center', color: '#334155', mb: 1.4}}>
        <Box>
          <UploadIcon sx={{fontSize: 26, color: '#94A3B8'}} />
          <Typography sx={{fontSize: 11, fontWeight: 700}}>Upload evidence</Typography>
        </Box>
      </Paper>

      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.7}}>
        <Button variant="outlined" startIcon={<CloseIcon sx={{fontSize: 13}} />} onClick={onClose} sx={{height: 32, borderRadius: 999, borderColor: '#0B63E5', color: '#0B63E5', fontWeight: 900}}>Cancel</Button>
        <Button variant="contained" startIcon={<CheckIcon sx={{fontSize: 13}} />} onClick={onClose} sx={{height: 32, borderRadius: 999, bgcolor: '#0B63E5', fontWeight: 900, boxShadow: 'none'}}>Submit</Button>
      </Box>
    </Box>
  );
}

function InfoField({label, value}: {label: string; value: string}) {
  return (
    <Box sx={{height: 44, px: 1, py: 0.55, mb: 0.2, borderRadius: 1, bgcolor: '#E8E8E8', overflow: 'hidden'}}>
      <Typography sx={{fontSize: 9, color: '#8A93A6', lineHeight: 1.1}}>{label}</Typography>
      <Typography sx={{fontSize: 12, color: '#111827', mt: 0.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{value}</Typography>
    </Box>
  );
}
