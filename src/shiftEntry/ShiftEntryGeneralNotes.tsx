import {Box, Button, MenuItem, Paper, Select, TextField, Typography} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  MicNone as MicIcon,
} from '@mui/icons-material';

type ShiftEntryGeneralNotesProps = {
  onClose: () => void;
};

export default function ShiftEntryGeneralNotes({onClose}: ShiftEntryGeneralNotesProps) {
  return (
    <Box>
      <Typography sx={{fontSize: 20, fontWeight: 900, color: '#246BFE', mb: 1.5}}>General Notes</Typography>
      
      <Box sx={{border: '1px solid #D9DEE8', borderRadius: 1.1, mb: 1.15, mt: 1.2, position: 'relative', bgcolor: '#FFFFFF'}}>
        <Typography sx={{position: 'absolute', top: -10, left: 9, zIndex: 2, px: 0.55, bgcolor: '#FFFFFF', fontSize: 9.5, color: '#8A93A6'}}>Note Category</Typography>
        <Select fullWidth size="small" value="General" sx={{height: 38, '& fieldset': {border: 'none'}, fontSize: 14}}>
          <MenuItem value="General">General</MenuItem>
          <MenuItem value="Safety">Safety</MenuItem>
          <MenuItem value="Process">Process</MenuItem>
          <MenuItem value="Handover">Handover</MenuItem>
        </Select>
      </Box>

      <TextField label="Title" size="small" fullWidth sx={{mb: 1.5, '& .MuiOutlinedInput-root': {height: 32, borderRadius: 1.1, fontSize: 12.5}}} />
      <TextField label="Note Content" multiline minRows={8} fullWidth sx={{mb: 2, '& .MuiInputLabel-root': {fontSize: 11}, '& .MuiOutlinedInput-root': {borderRadius: 1.1, fontSize: 12.5, alignItems: 'flex-start'}}} />
      
      <Box sx={{display: 'flex', justifyContent: 'flex-end', mb: 2.5}}>
        <Button variant="outlined" startIcon={<MicIcon sx={{fontSize: 15}} />} sx={{height: 28, borderColor: '#0B63E5', color: '#0B63E5', borderRadius: 999, fontSize: 10, fontWeight: 900}}>
          Audio Note
        </Button>
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.7}}>
        <Button variant="outlined" startIcon={<CloseIcon sx={{fontSize: 13}} />} onClick={onClose} sx={{height: 32, borderRadius: 999, borderColor: '#0B63E5', color: '#0B63E5', fontWeight: 900}}>Cancel</Button>
        <Button variant="contained" startIcon={<CheckIcon sx={{fontSize: 13}} />} onClick={onClose} sx={{height: 32, borderRadius: 999, bgcolor: '#0B63E5', fontWeight: 900, boxShadow: 'none'}}>Save Note</Button>
      </Box>
    </Box>
  );
}
