import {useState} from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import {Close as CloseIcon, Settings as SettingsIcon} from '@mui/icons-material';
import type {ActionTrackerCategory, ActionTrackerRow} from '../../actionTracker/types';
import type {TierMeetingLaneSettings, TierMeetingPillar} from '../types';
import TierMeetingLaneSettingsDialog from './TierMeetingLaneSettingsDialog';
import SafetyLaneContent from './pillars/SafetyLaneContent';
import QualityLaneContent from './pillars/QualityLaneContent';
import DeliveryLaneContent from './pillars/DeliveryLaneContent';
import CostLaneContent from './pillars/CostLaneContent';
import PeopleLaneContent from './pillars/PeopleLaneContent';
import CustomLaneContent from './pillars/CustomLaneContent';

type TierMeetingExpandedViewProps = {
  open: boolean;
  pillar: TierMeetingPillar | null;
  settings: TierMeetingLaneSettings | null;
  isLayoutEditMode: boolean;
  linkedRows: ActionTrackerRow[];
  onClose: () => void;
  onSettingsChange: (settings: TierMeetingLaneSettings) => void;
  onOpenActionTracker: (category?: ActionTrackerCategory) => void;
  onOpenActionDetails: (row: ActionTrackerRow) => void;
  onStartMeeting: () => void;
};

function renderPillarContent(
  pillar: TierMeetingPillar,
  settings: TierMeetingLaneSettings,
  onStartMeeting: () => void,
) {
  if (pillar.id === 'safety') return <SafetyLaneContent pillar={pillar} settings={settings} />;
  if (pillar.id === 'quality') return <QualityLaneContent pillar={pillar} settings={settings} />;
  if (pillar.id === 'delivery') return <DeliveryLaneContent pillar={pillar} settings={settings} />;
  if (pillar.id === 'cost') return <CostLaneContent pillar={pillar} settings={settings} />;
  if (pillar.id === 'custom') return <CustomLaneContent pillar={pillar} settings={settings} onStartMeeting={onStartMeeting} />;
  return <PeopleLaneContent pillar={pillar} settings={settings} onStartMeeting={onStartMeeting} />;
}

export default function TierMeetingExpandedView({
  open,
  pillar,
  settings,
  isLayoutEditMode,
  linkedRows,
  onClose,
  onSettingsChange,
  onOpenActionTracker,
  onOpenActionDetails,
  onStartMeeting,
}: TierMeetingExpandedViewProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (!pillar || !settings) return null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
        <DialogContent sx={{p: 0, position: 'relative'}}>
          <IconButton
            aria-label="Close dialog"
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 2,
              border: '1px solid #DBDDDF',
              bgcolor: '#FFFFFF',
              color: '#475569',
              boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
              '&:hover': {
                bgcolor: '#F8FAFC',
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', lg: '1.65fr 0.95fr'}, minHeight: '78vh'}}>
            <Box sx={{p: 3, bgcolor: '#f8fbff'}}>
              <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 2}}>
                <Box sx={{minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                  <Box sx={{minWidth: 0, display: 'flex', alignItems: 'center', gap: 1.1}}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2.4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#7AD36B',
                        color: '#0F172A',
                        fontWeight: 900,
                        fontSize: '1.35rem',
                        flexShrink: 0,
                        boxShadow: 'inset 0 0 0 1px #5BB74C',
                      }}
                    >
                      {pillar.title.charAt(0)}
                    </Box>
                    <Typography sx={{fontWeight: 900, color: '#1F2366', fontSize: '1.48rem', lineHeight: 1}}>
                      {pillar.title}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1}}>
                  {isLayoutEditMode ? (
                    <IconButton size="small" onClick={() => setIsSettingsOpen(true)} sx={{border: '1px solid #DBDDDF', bgcolor: '#fff'}}>
                      <SettingsIcon fontSize="small" />
                    </IconButton>
                  ) : null}
                </Box>
              </Box>
              {renderPillarContent(pillar, settings, onStartMeeting)}
            </Box>
            <Box sx={{p: 2.4, borderLeft: '1px solid #DBDDDF', display: 'flex', flexDirection: 'column', gap: 1.6}}>
              <Paper elevation={0} sx={{p: 1.5, borderRadius: 2.5, border: '1px solid #DBDDDF'}}>
                <Typography variant="subtitle1" sx={{fontWeight: 800, color: pillar.color, mb: 1}}>
                  BLU.AI recommendations
                </Typography>
                <List disablePadding>
                  {pillar.insights.map((insight) => (
                    <ListItem key={insight.id} disablePadding sx={{py: 0.65}}>
                      <ListItemText
                        primary={insight.title}
                        secondary={insight.recommendation ?? insight.description}
                        primaryTypographyProps={{fontWeight: 700}}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
              <Paper elevation={0} sx={{p: 1.5, borderRadius: 2.5, border: '1px solid #DBDDDF', flex: 1}}>
                <Typography variant="subtitle1" sx={{fontWeight: 800, mb: 1}}>Linked actions</Typography>
                {linkedRows.length ? (
                  <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                    {linkedRows.map((row) => (
                      <Paper
                        key={row.id}
                        elevation={0}
                        sx={{
                          position: 'relative',
                          p: 1.35,
                          borderRadius: 2.2,
                          border: '1px solid #E2E8F0',
                          bgcolor: '#FFFFFF',
                          boxShadow: '0 8px 18px rgba(15,23,42,0.04)',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 5,
                            bgcolor: getPriorityTone(row.priority),
                          }}
                        />
                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, pl: 0.2}}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 800,
                              color: '#1E293B',
                              lineHeight: 1.25,
                              maxWidth: '78%',
                            }}
                          >
                            {row.title}
                          </Typography>
                          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6, flexShrink: 0}}>
                            <Box
                              sx={{
                                width: 30,
                                height: 24,
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '0.76rem',
                                letterSpacing: '0.02em',
                                color: '#475569',
                                bgcolor: '#F8FAFC',
                                border: '1px solid #D7DFEE',
                                boxShadow: 'inset 0 0 0 1px rgba(59,130,246,0.06)',
                              }}
                            >
                              T2
                            </Box>
                          </Box>
                        </Box>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.1, pl: 0.2, gap: 1}}>
                          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 0}}>
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '999px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: '#1D4ED8',
                                color: '#FFFFFF',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                flexShrink: 0,
                              }}
                            >
                              {getInitials(row.assignedTo)}
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#475569',
                                fontWeight: 700,
                                fontSize: '0.74rem',
                                minWidth: 0,
                              }}
                            >
                              {row.assignedTo}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{color: '#64748B', fontSize: '0.72rem', flexShrink: 0}}>
                            {formatDateLabel(row.dueDate)}
                          </Typography>
                        </Box>
                        <Button variant="text" size="small" onClick={() => onOpenActionDetails(row)} sx={{mt: 0.65, px: 0.2, fontWeight: 800}}>
                          Open details
                        </Button>
                      </Paper>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{color: '#626465'}}>No linked actions for this pillar yet.</Typography>
                )}
                <Divider sx={{my: 1.5}} />
                <Button fullWidth variant="contained" onClick={() => onOpenActionTracker(pillar.category)} sx={{fontWeight: 800}}>
                  Open {pillar.title} actions
                </Button>
              </Paper>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      <TierMeetingLaneSettingsDialog
        open={isSettingsOpen}
        pillar={pillar}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onChange={onSettingsChange}
      />
    </>
  );
}

function getPriorityTone(priority: string) {
  const normalized = priority.trim().toLowerCase();
  if (normalized === 'high') return '#DC2626';
  if (normalized === 'medium') return '#CA8A04';
  return '#16A34A';
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatDateLabel(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toISOString().slice(0, 10);
}
