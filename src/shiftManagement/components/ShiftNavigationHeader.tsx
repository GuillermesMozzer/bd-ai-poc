import React from 'react';
import { Box, Button } from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Groups as GroupsIcon,
  Apps as AppsIcon,
  ViewWeek as OverviewIcon,
  PersonOutline as PersonOutlineIcon,
} from '@mui/icons-material';

interface ShiftNavigationHeaderProps {
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
}

const shiftNavigationItems = [
  {
    label: 'Command Center',
    screen: 'shift_schedule_overview',
    activeScreens: ['shift_schedule_overview', 'shift_schedule'],
    icon: <OverviewIcon sx={{ fontSize: 16 }} />,
  },
  {
    label: 'Summary',
    screen: 'shift_schedule_summary',
    activeScreens: ['shift_schedule_summary'],
    icon: <CalendarIcon sx={{ fontSize: 16 }} />,
  },
  {
    label: 'Organization & Workforce',
    screen: 'team_management',
    activeScreens: ['team_management', 'site_organogram'],
    icon: <GroupsIcon sx={{ fontSize: 16 }} />,
  },
  {
    label: 'Planner',
    screen: 'shift_schedule_settings',
    activeScreens: ['shift_schedule_settings'],
    icon: <AppsIcon sx={{ fontSize: 16 }} />,
  },
  {
    label: 'Operator Board',
    screen: 'shift_schedule_operator',
    activeScreens: ['shift_schedule_operator'],
    icon: <PersonOutlineIcon sx={{ fontSize: 16 }} />,
  },
];

const ShiftNavigationHeader: React.FC<ShiftNavigationHeaderProps> = ({
  currentScreen,
  setCurrentScreen,
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
      {shiftNavigationItems.map((item) => (
        <Button
          key={item.screen}
          variant={item.activeScreens.includes(currentScreen) ? 'contained' : 'outlined'}
          size="small"
          startIcon={item.icon}
          onClick={() => setCurrentScreen(item.screen)}
          sx={{
            minHeight: 34,
            borderRadius: 2,
            fontWeight: 800,
            textTransform: 'none',
            boxShadow: 'none',
            transition: 'background-color 180ms ease, border-color 180ms ease, color 180ms ease',
            '&:hover': { boxShadow: 'none' },
          }}
        >
          {item.label}
        </Button>
      ))}
    </Box>
  );
};

export default ShiftNavigationHeader;
