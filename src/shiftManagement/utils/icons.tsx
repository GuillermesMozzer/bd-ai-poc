import React from 'react';
import {
  BuildCircle as BuildCircleIcon,
  Description as SheetIcon,
  Speed as SpeedIcon,
  Flag as FlagIcon,
  Edit as EditIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Delete as DeleteIcon,
  OpenInFull as ExpandIcon,
  Apps as AppsIcon,
  ChatBubbleOutline as ChatIcon,
  Checklist as ChecklistIcon,
} from '@mui/icons-material';
import { type ShiftLogbookCategory } from '../constants';

export const getShiftLogbookCategoryIcon = (category: ShiftLogbookCategory, size = 18) => {
  switch (category) {
    case 'Maintenance Request':
      return <BuildCircleIcon sx={{ fontSize: size }} />;
    case 'Maintenance Work Order':
      return <SheetIcon sx={{ fontSize: size }} />;
    case 'OEE':
      return <SpeedIcon sx={{ fontSize: size }} />;
    case 'Quality':
      return <FlagIcon sx={{ fontSize: size }} />;
    case 'Shift Notes':
      return <EditIcon sx={{ fontSize: size }} />;
    case 'ESO':
      return <AssignmentTurnedInIcon sx={{ fontSize: size }} />;
    case 'CIL / Centerline':
      return <ChecklistIcon sx={{ fontSize: size }} />;
    case 'Scrap':
      return <DeleteIcon sx={{ fontSize: size }} />;
    case 'Performance Output':
      return <ExpandIcon sx={{ fontSize: size }} />;
    default:
      return <AppsIcon sx={{ fontSize: size }} />;
  }
};

export const getShiftLogbookTicketTypeIcon = (ticketType: string, size = 15) => {
  switch (ticketType) {
    case 'Maintenance Request':
      return <BuildCircleIcon sx={{ fontSize: size }} />;
    case 'Maintenance Work Order':
      return <SheetIcon sx={{ fontSize: size }} />;
    case 'Incident':
      return <FlagIcon sx={{ fontSize: size }} />;
    default:
      return <ChatIcon sx={{ fontSize: size }} />;
  }
};
