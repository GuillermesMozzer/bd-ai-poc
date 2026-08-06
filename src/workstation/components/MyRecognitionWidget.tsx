import { workstationVisuals } from '../theme';
import {useState} from 'react';
import {Box, IconButton, Paper, Typography} from '@mui/material';
import {
  Add as AddIcon,
  EmojiEventsOutlined as TrophyIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  StarBorder as StarIcon,
} from '@mui/icons-material';

const recognitionItems = [
  {
    id: 'carlos',
    icon: 'star',
    name: 'Carlos Mendez',
    initials: 'CM',
    avatarBg: '#B7794E',
    message: 'Helped train 3 new operators',
  },
  {
    id: 'john',
    icon: 'trophy',
    name: 'John Joshua',
    initials: 'JJ',
    avatarBg: '#8A4E2B',
    message: '30-day streak with zero defects',
  },
  {
    id: 'maya',
    icon: 'star',
    name: 'Maya Singh',
    initials: 'MS',
    avatarBg: '#475569',
    message: 'Closed two safety actions before shift end',
  },
];

export default function MyRecognitionWidget() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = recognitionItems[activeIndex];
  const hasMultipleItems = recognitionItems.length > 1;
  const showPrevious = () => setActiveIndex((current) => (current - 1 + recognitionItems.length) % recognitionItems.length);
  const showNext = () => setActiveIndex((current) => (current + 1) % recognitionItems.length);
  const Icon = activeItem?.icon === 'trophy' ? TrophyIcon : StarIcon;

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
          '& .recognition-row': {
            gridTemplateColumns: '18px minmax(0, 1fr)',
            minHeight: 56,
            px: 1,
          },
          '& .recognition-icon': {
            fontSize: 18,
          },
          '& .recognition-avatar': {
            width: 17,
            height: 17,
            fontSize: 7,
          },
        },
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
        <Typography sx={{fontSize: 'clamp(16px, 3.4cqw, 20px)', lineHeight: 1, color: workstationVisuals.textPrimary, fontWeight: 800, fontFamily: workstationVisuals.fontFamily}}>
          Recognition
        </Typography>
        <IconButton
          aria-label="Add recognition"
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
              className="recognition-row"
              elevation={0}
              sx={{
                minHeight: 52,
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
              <Icon className="recognition-icon" sx={{fontSize: 20, color: '#FFB020'}} />
              <Box sx={{minWidth: 0}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55, minWidth: 0}}>
                  <Box
                    className="recognition-avatar"
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: activeItem.avatarBg,
                      color: '#FFFFFF',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 8,
                      fontWeight: 900,
                      flexShrink: 0,
                      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.35)',
                    }}
                  >
                    {activeItem.initials}
                  </Box>
                  <Typography sx={{fontSize: 'clamp(11px, 3cqw, 13px)', color: '#69727E', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {activeItem.name}
                  </Typography>
                </Box>
                <Typography sx={{fontSize: 'clamp(12.5px, 3.3cqw, 15px)', color: '#202124', lineHeight: 1.12, fontWeight: 500, mt: 0.2}}>
                  {activeItem.message}
                </Typography>
              </Box>
            </Paper>
        ) : null}
        {hasMultipleItems ? (
          <Box sx={{display: 'grid', gap: 0.2, justifyItems: 'center'}}>
            <IconButton aria-label="Previous recognition" size="small" onClick={showPrevious} sx={{width: 20, height: 20, color: '#8A929D'}}>
              <KeyboardArrowUpIcon sx={{fontSize: 20}} />
            </IconButton>
            <Box sx={{width: 6, height: 24, borderRadius: 999, bgcolor: '#8A8F98'}} />
            <IconButton aria-label="Next recognition" size="small" onClick={showNext} sx={{width: 20, height: 20, color: '#8A929D'}}>
              <KeyboardArrowDownIcon sx={{fontSize: 20}} />
            </IconButton>
          </Box>
        ) : null}
      </Box>
    </Paper>
  );
}
