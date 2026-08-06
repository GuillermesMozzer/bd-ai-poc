import {useState, useEffect} from 'react';
import {Box, Button, Drawer, IconButton, Typography} from '@mui/material';
import {Close as CloseIcon} from '@mui/icons-material';

// Import sub-components
import ShiftEntryEso from './ShiftEntryEso';
import ShiftEntryGeneralNotes from './ShiftEntryGeneralNotes';
import ShiftEntryMaintenance, { type ShiftEntryMaintenancePrefill } from './ShiftEntryMaintenance';
import ShiftEntryProductionOutput from './ShiftEntryProductionOutput';
import ShiftEntryShiftLog from './ShiftEntryShiftLog';

export type ShiftEntryMode = 
  | 'eso' 
  | 'generalNotes' 
  | 'maintenance' 
  | 'productionOutput'
  | 'shiftLog';

type ShiftEntryProps = {
  currentUserName?: string;
  initialMode?: ShiftEntryMode;
  maintenancePrefill?: ShiftEntryMaintenancePrefill | null;
  onClose: () => void;
  onOpenDashboard?: () => void;
  open: boolean;
};

const shiftEntryOptions = [
  {label: 'ESO', mode: 'eso'},
  {label: 'GENERAL NOTES', mode: 'generalNotes'},
  {label: 'MAINTENANCE REQUEST & LOG', mode: 'maintenance'},
  {label: 'PRODUCTION OUTPUT', mode: 'productionOutput'},
  {label: 'MOLD LOG', mode: 'shiftLog'},
] as const;

export default function ShiftEntry({
  currentUserName = 'Jose Rodriguez',
  initialMode = 'maintenance', // Default to Maintenance as requested
  maintenancePrefill = null,
  onClose,
  onOpenDashboard,
  open
}: ShiftEntryProps) {
  const [mode, setMode] = useState<ShiftEntryMode>(initialMode);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setMode(initialMode || 'maintenance');
    }
  }, [open, initialMode]);

  const renderContent = () => {
    switch (mode) {
      case 'eso':
        return (
          <ShiftEntryEso 
            currentUserName={currentUserName} 
            onOpenDashboard={onOpenDashboard} 
            onClose={onClose}
            onAssistantToggle={setIsAssistantOpen}
          />
        );
      case 'generalNotes':
        return <ShiftEntryGeneralNotes onClose={onClose} />;
      case 'maintenance':
        return <ShiftEntryMaintenance prefill={maintenancePrefill} onClose={onClose} />;
      case 'productionOutput':
        return <ShiftEntryProductionOutput currentUserName={currentUserName} onCancel={onClose} onClose={onClose} />;
      case 'shiftLog':
        return <ShiftEntryShiftLog currentUserName={currentUserName} onCancel={onClose} onClose={onClose} />;
      default:
        return <ShiftEntryMaintenance prefill={maintenancePrefill} onClose={onClose} />;
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 200,
        '& .MuiDrawer-paper': {
          zIndex: (theme) => theme.zIndex.modal + 201,
        },
      }}
      PaperProps={{
        sx: {
          width: {xs: '100%', sm: isAssistantOpen ? 900 : 500},
          transition: 'width 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
          maxWidth: '100vw',
          borderLeft: '1px solid #DDE7F4',
          bgcolor: '#FFFFFF',
          boxShadow: '-18px 0 42px rgba(15, 23, 42, 0.18)',
        },
      }}
    >
      <Box sx={{height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
        {/* Header */}
        <Box sx={{px: 1.5, py: 1.7, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Typography sx={{fontSize: 16, fontWeight: 900, color: '#044ED7'}}>Operations Entry</Typography>
          <IconButton onClick={onClose} size="small" sx={{color: '#0B63E5'}}>
            <CloseIcon sx={{fontSize: 19}} />
          </IconButton>
        </Box>

        {/* Tab Selection */}
        <Box sx={{px: 1.4, pb: 2, flex: 1, overflowY: 'auto'}}>
          <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.55, mb: 2.5}}>
            {shiftEntryOptions.map((option) => {
              const active = mode === option.mode;
              return (
                <Button
                  key={option.mode}
                  variant={active ? 'contained' : 'outlined'}
                  onClick={() => setMode(option.mode)}
                  sx={{
                    height: 24,
                    minWidth: 0,
                    px: 1.2,
                    borderRadius: 999,
                    borderColor: '#0B63E5',
                    color: active ? '#FFFFFF' : '#0B63E5',
                    bgcolor: active ? '#0B63E5' : '#FFFFFF',
                    fontSize: 9,
                    fontWeight: 900,
                    lineHeight: 1,
                    boxShadow: 'none',
                    '&:hover': {bgcolor: active ? '#0758CE' : '#F1F6FF', borderColor: '#0B63E5', boxShadow: 'none'},
                  }}
                >
                  {option.label}
                </Button>
              );
            })}
          </Box>

          {/* Content Area */}
          <Box sx={{minHeight: 0}}>
            {renderContent()}
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
