import {Box, Button, Divider, LinearProgress, Typography} from '@mui/material';
import {Coffee, LogOut, MapPin, Factory} from 'lucide-react';
import {workstationVisuals} from '../theme';
import WidgetShell from './WidgetShell';
import {
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  shiftScheduleNotificationConfig,
  useWidgetNotifications,
} from './WidgetNotifications';

const assignmentContext = [
  {label: 'Line', value: 'Line 10', icon: Factory},
  {label: 'Zone', value: 'Zone 2 / Z2-WC01', icon: MapPin},
] as const;

export default function WorkstationShiftScheduleWidget() {
  const notifications = useWidgetNotifications(shiftScheduleNotificationConfig);

  return (
    <>
      <WidgetShell
        title="Shift Schedule"
        action={<WidgetNotificationBell active={notifications.active} onClick={notifications.openDialog} size={24} />}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            '&::-webkit-scrollbar': {width: '3px'},
            '&::-webkit-scrollbar-thumb': {bgcolor: workstationVisuals.tierBorder, borderRadius: '4px'},
          }}
        >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 0.6,
          }}
        >
          {assignmentContext.map((item) => {
            const Icon = item.icon;
            return (
              <Box
                key={item.label}
                sx={{
                  minWidth: 0,
                  p: 0.75,
                  borderRadius: '8px',
                  bgcolor: workstationVisuals.blueSoft,
                  border: `1px solid ${workstationVisuals.tierBorder}`,
                  display: 'grid',
                  gridTemplateColumns: '18px minmax(0, 1fr)',
                  alignItems: 'center',
                  gap: 0.55,
                }}
              >
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: '6px',
                    bgcolor: workstationVisuals.blue,
                    color: workstationVisuals.tierSurface,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={11} />
                </Box>
                <Box sx={{minWidth: 0}}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: workstationVisuals.tierTextMeta,
                      fontWeight: 800,
                      fontSize: '0.48rem',
                      lineHeight: 1,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      fontFamily: workstationVisuals.fontFamily,
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.2,
                      color: workstationVisuals.blue,
                      fontWeight: 900,
                      fontSize: item.label === 'Zone' ? '0.62rem' : '0.68rem',
                      lineHeight: 1.15,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontFamily: workstationVisuals.fontFamily,
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Today's Shift */}
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Typography
              variant="caption"
              sx={{
                color: workstationVisuals.tierTextMeta,
                fontWeight: 800,
                fontSize: '0.55rem',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                fontFamily: workstationVisuals.fontFamily,
              }}
            >
              Shift
            </Typography>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
              <Box
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  bgcolor: workstationVisuals.blue,
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: workstationVisuals.blue,
                  fontWeight: 800,
                  fontSize: '0.55rem',
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  fontFamily: workstationVisuals.fontFamily,
                }}
              >
                Active
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              p: 0.75,
              borderRadius: 1.5,
              bgcolor: workstationVisuals.tierSurfaceMuted,
              border: `1px solid ${workstationVisuals.tierBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
            }}
          >
            <Typography
              sx={{
                fontSize: '1rem',
                fontWeight: 900,
                color: workstationVisuals.tierTextHeading,
                fontFamily: workstationVisuals.fontFamily,
              }}
            >
              06:00
            </Typography>
            <Typography
              sx={{
                fontSize: '0.7rem',
                fontWeight: 400,
                color: workstationVisuals.textMuted,
                fontFamily: workstationVisuals.fontFamily,
              }}
            >
              →
            </Typography>
            <Typography
              sx={{
                fontSize: '1rem',
                fontWeight: 900,
                color: workstationVisuals.tierTextHeading,
                fontFamily: workstationVisuals.fontFamily,
              }}
            >
              14:00
            </Typography>
          </Box>
        </Box>

        <Divider sx={{borderColor: workstationVisuals.tierBorder}} />

        {/* Hours Performance */}
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color: workstationVisuals.tierTextLabel,
                fontSize: '0.55rem',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                fontFamily: workstationVisuals.fontFamily,
              }}
            >
              Regular
            </Typography>
            <Typography
              sx={{
                fontSize: '0.9rem',
                fontWeight: 900,
                color: workstationVisuals.tierTextHeading,
                fontFamily: workstationVisuals.fontFamily,
              }}
            >
              34
              <Typography
                component="span"
                sx={{
                  fontSize: '0.55rem',
                  color: workstationVisuals.textMuted,
                  ml: 0.1,
                  fontFamily: workstationVisuals.fontFamily,
                }}
              >
                /40h
              </Typography>
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={85}
            sx={{
              height: 3,
              borderRadius: 2,
              bgcolor: workstationVisuals.tierSurfaceMuted,
              '& .MuiLinearProgress-bar': {bgcolor: workstationVisuals.blue},
            }}
          />

          <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5, mt: 0.25}}>
            <Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  color: workstationVisuals.tierTextLabel,
                  fontSize: '0.5rem',
                  display: 'block',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontFamily: workstationVisuals.fontFamily,
                }}
              >
                Extra
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  color: workstationVisuals.amber,
                  fontFamily: workstationVisuals.fontFamily,
                }}
              >
                2.5h
              </Typography>
            </Box>
            <Box sx={{textAlign: 'right'}}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  color: workstationVisuals.blue,
                  fontSize: '0.5rem',
                  display: 'block',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontFamily: workstationVisuals.fontFamily,
                }}
              >
                Next
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 900,
                  color: workstationVisuals.tierTextHeading,
                  fontFamily: workstationVisuals.fontFamily,
                }}
              >
                THU
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{borderColor: workstationVisuals.tierBorder}} />

        {/* Actions */}
        <Box sx={{display: 'flex', gap: 0.75}}>
          <Button
            variant="contained"
            fullWidth
            size="small"
            startIcon={<Coffee size={10} />}
            sx={{
              bgcolor: workstationVisuals.tierTextHeading,
              borderRadius: 1.2,
              py: 0.4,
              fontSize: '0.6rem',
              fontWeight: 800,
              textTransform: 'none',
              fontFamily: workstationVisuals.fontFamily,
              '&:hover': {bgcolor: workstationVisuals.darkSurfaceAlt},
            }}
          >
            Break
          </Button>
          <Button
            variant="outlined"
            fullWidth
            size="small"
            startIcon={<LogOut size={10} />}
            sx={{
              color: workstationVisuals.tierTextLabel,
              borderColor: workstationVisuals.tierBorder,
              borderRadius: 1.2,
              py: 0.4,
              fontSize: '0.6rem',
              fontWeight: 800,
              textTransform: 'none',
              fontFamily: workstationVisuals.fontFamily,
              '&:hover': {bgcolor: workstationVisuals.tierSurfaceMuted, borderColor: workstationVisuals.blue},
            }}
          >
            Punch
          </Button>
        </Box>
        </Box>
      </WidgetShell>
      <WidgetNotificationsDialog
        active={notifications.active}
        config={shiftScheduleNotificationConfig}
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
