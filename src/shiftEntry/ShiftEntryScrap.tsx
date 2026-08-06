import {Box, Button, MenuItem, Paper, Select, TextField, Typography} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  DeleteOutlineOutlined as ScrapIcon,
} from '@mui/icons-material';

type ShiftEntryScrapProps = {
  onClose: () => void;
};

export default function ShiftEntryScrap({onClose}: ShiftEntryScrapProps) {
  return (
    <Box>
      <Typography sx={{fontSize: 20, fontWeight: 900, color: '#246BFE', mb: 1.5}}>Scrap Entry</Typography>
      
      <Box sx={{display: 'flex', alignItems: 'center', gap: 1, p: 1.5, mb: 2, bgcolor: '#FFF1F0', border: '1px solid #FFA39E', borderRadius: 1}}>
        <ScrapIcon sx={{color: '#F5222D'}} />
        <Typography sx={{fontSize: 12, color: '#202124'}}>Log material waste and scrap reasons for tracking.</Typography>
      </Box>

      <Box sx={{border: '1px solid #D9DEE8', borderRadius: 1.1, mb: 1.15, mt: 1.2, position: 'relative', bgcolor: '#FFFFFF'}}>
        <Typography sx={{position: 'absolute', top: -10, left: 9, zIndex: 2, px: 0.55, bgcolor: '#FFFFFF', fontSize: 9.5, color: '#8A93A6'}}>Scrap Reason</Typography>
        <Select fullWidth size="small" value="Process" sx={{height: 38, '& fieldset': {border: 'none'}, fontSize: 14}}>
          <MenuItem value="Process">Process Waste</MenuItem>
          <MenuItem value="Setup">Setup Scrap</MenuItem>
          <MenuItem value="Quality">Quality Rejection</MenuItem>
          <MenuItem value="Damage">Handling Damage</MenuItem>
        </Select>
      </Box>

      <TextField label="Weight / Quantity" type="number" size="small" fullWidth sx={{mb: 1.5, '& .MuiOutlinedInput-root': {height: 32, borderRadius: 1.1, fontSize: 12.5}}} />
      <TextField label="Material / Part Number" size="small" fullWidth sx={{mb: 1.5, '& .MuiOutlinedInput-root': {height: 32, borderRadius: 1.1, fontSize: 12.5}}} />
      
      <TextField label="Additional Details" multiline minRows={3} fullWidth sx={{mb: 2, '& .MuiInputLabel-root': {fontSize: 11}, '& .MuiOutlinedInput-root': {borderRadius: 1.1, fontSize: 12.5, alignItems: 'flex-start'}}} />
      
      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.7}}>
        <Button variant="outlined" startIcon={<CloseIcon sx={{fontSize: 13}} />} onClick={onClose} sx={{height: 32, borderRadius: 999, borderColor: '#0B63E5', color: '#0B63E5', fontWeight: 900}}>Cancel</Button>
        <Button variant="contained" startIcon={<CheckIcon sx={{fontSize: 13}} />} onClick={onClose} sx={{height: 32, borderRadius: 999, bgcolor: '#0B63E5', fontWeight: 900, boxShadow: 'none'}}>Log Scrap</Button>
      </Box>
    </Box>
  );
}
