import {Box, Button, MenuItem, Paper, Select, TextField, Typography} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  MicNone as MicIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';

type ShiftEntryNonConformanceProps = {
  onClose: () => void;
};

export default function ShiftEntryNonConformance({onClose}: ShiftEntryNonConformanceProps) {
  return (
    <Box>
      <Typography sx={{fontSize: 20, fontWeight: 900, color: '#246BFE', mb: 1.5}}>Non-Conformance</Typography>
      
      <Box sx={{display: 'flex', alignItems: 'center', gap: 1, p: 1, mb: 1.5, bgcolor: '#FFFBE6', border: '1px solid #FFE58F', borderRadius: 1}}>
        <WarningIcon sx={{color: '#FAAD14'}} />
        <Typography sx={{fontSize: 12, color: '#202124'}}>Report a deviation from standards or quality requirements.</Typography>
      </Box>

      <Box sx={{border: '1px solid #D9DEE8', borderRadius: 1.1, mb: 1.15, mt: 1.2, position: 'relative', bgcolor: '#FFFFFF'}}>
        <Typography sx={{position: 'absolute', top: -10, left: 9, zIndex: 2, px: 0.55, bgcolor: '#FFFFFF', fontSize: 9.5, color: '#8A93A6'}}>NC Category</Typography>
        <Select fullWidth size="small" value="Quality" sx={{height: 38, '& fieldset': {border: 'none'}, fontSize: 14}}>
          <MenuItem value="Quality">Quality Deviation</MenuItem>
          <MenuItem value="Process">Process Non-Compliance</MenuItem>
          <MenuItem value="Material">Material Defect</MenuItem>
        </Select>
      </Box>

      <TextField label="Product / Batch ID" size="small" fullWidth sx={{mb: 1.5, '& .MuiOutlinedInput-root': {height: 32, borderRadius: 1.1, fontSize: 12.5}}} />
      <TextField label="Description of Non-Conformance" multiline minRows={5} fullWidth sx={{mb: 2, '& .MuiInputLabel-root': {fontSize: 11}, '& .MuiOutlinedInput-root': {borderRadius: 1.1, fontSize: 12.5, alignItems: 'flex-start'}}} />
      
      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.7}}>
        <Button variant="outlined" startIcon={<CloseIcon sx={{fontSize: 13}} />} onClick={onClose} sx={{height: 32, borderRadius: 999, borderColor: '#0B63E5', color: '#0B63E5', fontWeight: 900}}>Cancel</Button>
        <Button variant="contained" startIcon={<CheckIcon sx={{fontSize: 13}} />} onClick={onClose} sx={{height: 32, borderRadius: 999, bgcolor: '#0B63E5', fontWeight: 900, boxShadow: 'none'}}>Report NC</Button>
      </Box>
    </Box>
  );
}
