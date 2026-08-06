import { useState } from 'react';
import { Box, Button, IconButton, Menu, MenuItem, Typography, Avatar, Tooltip } from '@mui/material';
import {
  ArrowOutward as ArrowOutwardIcon,
  StarBorder as StarBorderIcon,
  MoreHoriz as MoreIcon,
  AccessTime as TimeIcon,
  ChatBubbleOutline as ChatIcon,
  BuildCircle as MaintenanceIcon,
  Description as WorkOrderIcon,
  Speed as OeeIcon,
  Flag as NonConformanceIcon,
  Edit as ShiftNotesIcon,
  AssignmentTurnedIn as EsoIcon,
  Delete as ScrapIcon,
  TrendingUp as PerformanceIcon,
  AutoAwesome as SparkleIcon,
  Apps as AllIcon,
} from '@mui/icons-material';
import {
  tokenBrand,
  tokenNeutral,
  tokenCommon,
  tokenSuccess,
  tokenError,
  tokenWarning,
  tokenInfo,
  workstationVisuals,
  workstationWidgetTitleSx,
  workstationTableSx,
  workstationTableHeaderCellSx,
  workstationTableCellSx
} from '../theme';
import WidgetShell from './WidgetShell';
import type { WorkstationWidgetProps } from '../types';
import { shiftLogbookEntries } from '../../shiftManagement/data/logbookData';
import {
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  shiftLogbookNotificationConfig,
  useWidgetNotifications,
} from './WidgetNotifications';

const filterButtonSx = {
  height: 26,
  borderRadius: '8px',
  px: 1.25,
  border: '1px solid rgba(15, 23, 42, 0.08)',
  color: 'rgba(15, 23, 42, 0.7)',
  bgcolor: tokenCommon.white,
  textTransform: 'none',
  fontSize: '0.72rem',
  fontWeight: 500,
  fontFamily: workstationVisuals.fontFamily,
  transition: 'all 0.15s ease',
  flexShrink: 0,
  '&:hover': {
    bgcolor: tokenNeutral.lightest,
    borderColor: 'rgba(15, 23, 42, 0.16)',
  },
  '& .MuiButton-startIcon': { mr: 0.3, '& svg': { fontSize: 13 } },
} as const;

const activeFilterButtonSx = {
  ...filterButtonSx,
  bgcolor: tokenBrand.main,
  color: tokenCommon.white,
  borderColor: tokenBrand.main,
  '&:hover': {
    bgcolor: tokenBrand.dark,
    borderColor: tokenBrand.dark,
  },
} as const;

const categories = [
  { label: 'All', icon: <AllIcon /> },
  { label: 'Maintenance Request', icon: <MaintenanceIcon /> },
  { label: 'Maintenance Work Order', icon: <WorkOrderIcon /> },
  { label: 'OEE', icon: <OeeIcon /> },
  { label: 'Quality', icon: <NonConformanceIcon /> },
  { label: 'Shift Notes', icon: <ShiftNotesIcon /> },
  { label: 'ESO', icon: <EsoIcon /> },
  { label: 'Scrap', icon: <ScrapIcon /> },
  { label: 'Performance Output', icon: <PerformanceIcon /> },
];

export default function ShiftLogBookWidget({
  className,
  style,
  onExpand,
}: WorkstationWidgetProps) {
  const notifications = useWidgetNotifications(shiftLogbookNotificationConfig);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [limit, setLimit] = useState<number>(5);
  const [limitAnchor, setLimitAnchor] = useState<null | HTMLElement>(null);
  const [activeNotes, setActiveNotes] = useState<Record<string, boolean>>({});

  const toggleNote = (id: string) => {
    setActiveNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredEntries = shiftLogbookEntries.filter((entry) => {
    if (selectedCategory === 'All') return true;
    return entry.category === selectedCategory;
  });

  const displayedEntries = filteredEntries.slice(0, limit);

  const handleLimitSelect = (value: number) => {
    setLimit(value);
    setLimitAnchor(null);
  };

  const headerAction = (
    <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
      <WidgetNotificationBell active={notifications.active} onClick={notifications.openDialog} size={24} />
      <StarBorderIcon sx={{ fontSize: 18, color: tokenBrand.main, cursor: 'pointer' }} />
      <IconButton size="small" sx={{ color: tokenBrand.main }}>
        <MoreIcon sx={{ fontSize: 18 }} />
      </IconButton>
      <IconButton size="small" onClick={onExpand} sx={{ width: 24, height: 24, p: 0, color: tokenBrand.main }}>
        <ArrowOutwardIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );

  return (
    <>
      <WidgetShell
        title="Shift Logbook"
        subtitle="Top recent events and issues across categories"
        action={headerAction}
        className={className}
        style={style}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        {/* Category Filters Row */}
        <Box sx={{
          display: 'flex',
          gap: 0.75,
          overflowX: 'auto',
          pb: 1,
          mb: 1.2,
          flexShrink: 0,
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(15,23,42,0.1)', borderRadius: 2 }
        }}>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.label;
            return (
              <Button
                key={cat.label}
                variant="outlined"
                startIcon={cat.icon}
                onClick={() => setSelectedCategory(cat.label)}
                sx={isActive ? activeFilterButtonSx : filterButtonSx}
              >
                {cat.label}
              </Button>
            );
          })}
        </Box>

        {/* Scrollable Event Table Container */}
        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <Box component="table" sx={workstationTableSx}>
            <thead>
              <tr>
                <Box component="th" sx={{ ...workstationTableHeaderCellSx, width: '35%' }}>ID & TITLE</Box>
                <Box component="th" sx={{ ...workstationTableHeaderCellSx, width: '22%' }}>TYPE</Box>
                <Box component="th" sx={{ ...workstationTableHeaderCellSx, width: '15%' }}>REPORTER</Box>
                <Box component="th" sx={{ ...workstationTableHeaderCellSx, width: '12%' }}>CREATED</Box>
                <Box component="th" sx={{ ...workstationTableHeaderCellSx, width: '16%', textAlign: 'right', pr: 2 }}>STATUS</Box>
              </tr>
            </thead>
            <tbody>
              {displayedEntries.map((entry) => {
                const isNoteOpen = !!activeNotes[entry.id];
                const statusTone = entry.status === 'Open'
                  ? tokenError.main
                  : entry.status === 'In Progress'
                    ? tokenBrand.main
                    : tokenSuccess.main;

                const avatarBg = entry.reporterType === 'AI'
                  ? '#245FDB'
                  : entry.reporterType === 'Equipment'
                    ? '#0EA5A5'
                    : '#E6C45D';

                const avatarColor = entry.reporterType === 'AI' || entry.reporterType === 'Equipment'
                  ? '#FFFFFF'
                  : '#4B3B10';

                return (
                  <tr key={entry.id}>
                    {/* ID & Title */}
                    <Box component="td" sx={workstationTableCellSx}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography sx={{ fontSize: '0.68rem', color: workstationVisuals.textSecondary, fontFamily: workstationVisuals.fontFamily }}>
                          {entry.id}
                        </Typography>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: workstationVisuals.textPrimary, fontFamily: workstationVisuals.fontFamily, mt: 0.2 }}>
                          {entry.title}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Type with color alignment */}
                    <Box component="td" sx={workstationTableCellSx}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: entry.tone || tokenBrand.main }}>
                        {categories.find((c) => c.label === entry.category)?.icon || <AllIcon sx={{ fontSize: 13 }} />}
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, fontFamily: workstationVisuals.fontFamily }}>
                          {entry.category}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Reporter Name & Avatar */}
                    <Box component="td" sx={workstationTableCellSx}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Avatar sx={{
                          width: 20,
                          height: 20,
                          bgcolor: avatarBg,
                          color: avatarColor,
                          fontSize: '0.62rem',
                          fontWeight: 700,
                        }}>
                          {entry.reporterType === 'AI' ? (
                            <SparkleIcon sx={{ fontSize: 11 }} />
                          ) : entry.reporterType === 'Equipment' ? (
                            <MaintenanceIcon sx={{ fontSize: 11 }} />
                          ) : (
                            entry.reporter.split(' ').map((n) => n[0]).join('')
                          )}
                        </Avatar>
                        <Typography sx={{ fontSize: '0.78rem', color: workstationVisuals.textPrimary, fontFamily: workstationVisuals.fontFamily }}>
                          {entry.reporter}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Created */}
                    <Box component="td" sx={workstationTableCellSx}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: workstationVisuals.textSecondary }}>
                        <TimeIcon sx={{ fontSize: 13 }} />
                        <Typography sx={{ fontSize: '0.78rem', fontFamily: workstationVisuals.fontFamily }}>
                          {entry.createdAt}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Status Pill & Row Actions */}
                    <Box component="td" sx={workstationTableCellSx}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, pr: 1.5 }}>
                        <Box sx={{
                          px: 1,
                          py: 0.25,
                          borderRadius: '9999px',
                          bgcolor: `color-mix(in srgb, ${statusTone} 7%, transparent)`,
                          color: statusTone,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          border: `1px solid color-mix(in srgb, ${statusTone} 19%, transparent)`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: 72,
                          whiteSpace: 'nowrap',
                        }}>
                          {entry.status}
                        </Box>
                        {/* Note toggle */}
                        <Tooltip title={isNoteOpen ? 'Hide note' : 'Show note'}>
                          <IconButton size="small" onClick={() => toggleNote(entry.id)} sx={{ p: 0.25, color: isNoteOpen ? tokenBrand.main : workstationVisuals.textMuted }}>
                            <ChatIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                        {/* More row menu */}
                        <IconButton size="small" sx={{ p: 0.25, color: workstationVisuals.textMuted }}>
                          <MoreIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </tr>
                );
              })}
            </tbody>
          </Box>
        </Box>

        {/* Footer controls */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pt: 1,
          borderTop: '1px solid rgba(15, 23, 42, 0.04)',
          mt: 1,
          flexShrink: 0
        }}>
          <Typography sx={{ fontSize: '0.68rem', color: workstationVisuals.textSecondary, fontFamily: workstationVisuals.fontFamily }}>
            Showing top {Math.min(limit, filteredEntries.length)} most recent items. You can view Top 5, Top 10, or Top 20.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="text"
              onClick={onExpand}
              sx={{
                textTransform: 'none',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: tokenBrand.main,
                fontFamily: workstationVisuals.fontFamily,
                p: 0,
                minWidth: 0,
                '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
              }}
            >
              View all &gt;
            </Button>
            <Button
              variant="outlined"
              endIcon={<ArrowOutwardIcon sx={{ transform: 'rotate(90deg)' }} />}
              onClick={(e) => setLimitAnchor(e.currentTarget)}
              sx={{
                height: 24,
                borderRadius: '6px',
                px: 1,
                fontSize: '0.68rem',
                fontWeight: 500,
                borderColor: 'rgba(15, 23, 42, 0.08)',
                color: 'rgba(15, 23, 42, 0.7)',
                bgcolor: tokenCommon.white,
                textTransform: 'none',
                fontFamily: workstationVisuals.fontFamily,
                '&:hover': { bgcolor: tokenNeutral.lightest, borderColor: 'rgba(15, 23, 42, 0.16)' }
              }}
            >
              Show: Top {limit}
            </Button>
            <Menu anchorEl={limitAnchor} open={Boolean(limitAnchor)} onClose={() => setLimitAnchor(null)}>
              <MenuItem onClick={() => handleLimitSelect(5)}>Top 5</MenuItem>
              <MenuItem onClick={() => handleLimitSelect(10)}>Top 10</MenuItem>
              <MenuItem onClick={() => handleLimitSelect(20)}>Top 20</MenuItem>
            </Menu>
          </Box>
        </Box>
        </Box>
      </WidgetShell>
      <WidgetNotificationsDialog
        active={notifications.active}
        config={shiftLogbookNotificationConfig}
        draftState={notifications.draftState}
        onApplySuggestion={notifications.applySuggestion}
        onClose={notifications.closeDialog}
        onSave={notifications.saveDialog}
        onStateChange={notifications.setDraftState}
        open={notifications.open}
      />
    </>
  );
}
