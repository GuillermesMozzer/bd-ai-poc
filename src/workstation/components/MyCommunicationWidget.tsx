import { workstationVisuals } from '../theme';
import {useState} from 'react';
import {Box, IconButton, Paper, Typography} from '@mui/material';
import {
  Add as AddIcon,
  CampaignOutlined as CampaignIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';

const communicationItems = [
  {
    id: 'focus',
    message: "Today's focus: reduce micro-stops on Line 3.",
  },
  {
    id: 'changeover',
    message: 'Planned changeover at 11:00. Ensure tools are ready.',
  },
  {
    id: 'handoff',
    message: 'Maintenance handoff notes updated for filler inspection.',
  },
];

export default function MyCommunicationWidget() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = communicationItems[activeIndex];
  const hasMultipleItems = communicationItems.length > 1;
  const showPrevious = () => setActiveIndex((current) => (current - 1 + communicationItems.length) % communicationItems.length);
  const showNext = () => setActiveIndex((current) => (current + 1) % communicationItems.length);

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        p: 'clamp(7px, 1.2cqw, 9px)',
        borderRadius: 1.5,
        bgcolor: '#FFFFFF',
        border: '1px solid #DDE4EF',
        boxShadow: '0 1px 2px rgba(17, 24, 39, 0.08), 0 0 0 1px rgba(31, 91, 255, 0.04)',
        overflow: 'hidden',
        containerType: 'inline-size',
        display: 'grid',
        gridTemplateRows: 'auto minmax(0, 1fr)',
        gap: 0.45,
        '@container (max-width: 240px)': {
          p: 1,
          gap: 0.65,
          '& .communication-row': {
            gridTemplateColumns: '18px minmax(0, 1fr)',
            minHeight: 50,
            px: 1,
          },
          '& .communication-icon': {
            fontSize: 18,
          },
        },
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
        <Typography sx={{fontSize: 'clamp(16px, 3.4cqw, 20px)', lineHeight: 1, color: workstationVisuals.textPrimary, fontWeight: 800, fontFamily: workstationVisuals.fontFamily}}>
          Communication
        </Typography>
        <IconButton
          aria-label="Add communication"
          size="small"
        sx={{width: 26, height: 26, color: '#246BFE', bgcolor: '#FFFFFF'}}
        >
          <AddIcon sx={{fontSize: 23}} />
        </IconButton>
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: hasMultipleItems ? 'minmax(0, 1fr) 20px' : '1fr', gap: 0.45, alignItems: 'center', minHeight: 0}}>
        {activeItem ? (
          <Paper
            key={activeItem.id}
            className="communication-row"
            elevation={0}
            sx={{
              minHeight: 48,
              px: 'clamp(9px, 2cqw, 12px)',
              py: 'clamp(6px, 1.4cqw, 8px)',
              borderRadius: 1.6,
              border: '1px solid #D5DAE2',
              bgcolor: '#F8FAFC',
              display: 'grid',
              gridTemplateColumns: '22px minmax(0, 1fr)',
              alignItems: 'center',
              gap: 0.8,
            }}
          >
            <CampaignIcon className="communication-icon" sx={{fontSize: 21, color: '#B9C0CA'}} />
            <Typography sx={{fontSize: 'clamp(13px, 3.7cqw, 16px)', color: '#202124', lineHeight: 1.15, fontWeight: 500}}>
              {activeItem.message}
            </Typography>
          </Paper>
        ) : null}
        {hasMultipleItems ? (
          <Box sx={{display: 'grid', gap: 0.2, justifyItems: 'center'}}>
            <IconButton aria-label="Previous communication" size="small" onClick={showPrevious} sx={{width: 20, height: 20, color: '#8A929D'}}>
              <KeyboardArrowUpIcon sx={{fontSize: 20}} />
            </IconButton>
            <Box sx={{width: 6, height: 24, borderRadius: 999, bgcolor: '#8A8F98'}} />
            <IconButton aria-label="Next communication" size="small" onClick={showNext} sx={{width: 20, height: 20, color: '#8A929D'}}>
              <KeyboardArrowDownIcon sx={{fontSize: 20}} />
            </IconButton>
          </Box>
        ) : null}
      </Box>
    </Paper>
  );
}
