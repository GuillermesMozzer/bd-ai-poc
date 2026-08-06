import {Box, IconButton, Paper, Typography} from '@mui/material';
import {
  AutoAwesome as SparkleIcon,
  OpenInFull as OpenInFullIcon,
} from '@mui/icons-material';
import {
  tokenBrand,
  tokenDivider,
  tokenNeutral,
  tokenText,
  workstationVisuals,
} from '../theme';
import {
  qualityNotificationConfig,
  safetyNotificationConfig,
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  useWidgetNotifications,
} from './WidgetNotifications';
import WidgetLetterBadge from './WidgetLetterBadge';

type SqdcOperatorKind = 'safety' | 'quality';

type WorkstationSqdcOperatorWidgetProps = {
  kind: SqdcOperatorKind;
  onExpand?: () => void;
};

const operatorConfig = {
  safety: {
    title: 'Safety',
    letter: 'S',
    badgeTone: 'green',
    image: '/images/S%20Safety.png',
    imageAlt: 'Safety calendar',
    notificationConfig: safetyNotificationConfig,
  },
  quality: {
    title: 'Quality',
    letter: 'Q',
    badgeTone: 'red',
    image: '/images/Q%20Quality.png',
    imageAlt: 'Quality calendar',
    notificationConfig: qualityNotificationConfig,
  },
} as const;

export default function WorkstationSqdcOperatorWidget({kind, onExpand}: WorkstationSqdcOperatorWidgetProps) {
  const config = operatorConfig[kind];
  const notifications = useWidgetNotifications(config.notificationConfig);

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          height: '100%',
          minHeight: 0,
          p: 'clamp(8px, 1.7cqw, 12px)',
          borderRadius: '12px',
          bgcolor: 'background.paper',
          border: `1px solid ${tokenDivider}`,
          boxShadow: workstationVisuals.tierShadow,
          display: 'grid',
          gridTemplateRows: 'auto minmax(0, 1fr)',
          gap: 'clamp(3px, 1.1cqw, 8px)',
          overflow: 'hidden',
          containerType: 'inline-size',
          '@container (max-width: 260px)': {
            p: 1,
            '& .sqdc-header-actions': {gap: 0.2},
            '& .sqdc-header-actions .MuiIconButton-root': {width: 24, height: 24},
            '& .sqdc-header-actions svg': {fontSize: 15},
            '& .sqdc-title': {fontSize: 14},
            '& .sqdc-letter-badge .MuiIconButton-root': {width: 32, height: 32, fontSize: 18},
          },
          '@container (max-width: 210px)': {
            p: 0.75,
            '& .sqdc-title': {fontSize: 12},
            '& .sqdc-header-actions .MuiIconButton-root': {width: 22, height: 22},
            '& .sqdc-letter-badge .MuiIconButton-root': {width: 28, height: 28, fontSize: 16},
          },
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 'clamp(40px, 9cqw, 52px)', px: 'clamp(3px, 1.2cqw, 8px)', gap: 1}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 'clamp(7px, 2.7cqw, 17px)', minWidth: 0, flex: '1 1 auto'}}>
            <Box className="sqdc-letter-badge" sx={{display: 'contents'}}>
              <WidgetLetterBadge letter={config.letter} defaultTone={config.badgeTone} />
            </Box>
            <Typography
              className="sqdc-title"
              noWrap
              sx={{
                fontSize: 'clamp(16px, 3.4cqw, 20px)',
                lineHeight: 1,
                color: tokenText.primary,
                fontWeight: 800,
                fontFamily: workstationVisuals.fontFamily,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {config.title}
            </Typography>
          </Box>
          <Box className="sqdc-header-actions" sx={{display: 'flex', alignItems: 'center', gap: 0.55, flexShrink: 0}}>
            <IconButton
              size="small"
              aria-label={`${config.title} AI insight`}
              sx={{
                width: 28,
                height: 28,
                color: tokenBrand.main,
                bgcolor: tokenNeutral.lighter,
                '&:hover': {bgcolor: tokenNeutral.main},
              }}
            >
              <SparkleIcon sx={{fontSize: 'clamp(17px, 4cqw, 21px)'}} />
            </IconButton>
            <WidgetNotificationBell active={notifications.active} onClick={notifications.openDialog} size={28} />
            <IconButton
              size="small"
              aria-label={`Expand ${config.title}`}
              onClick={onExpand}
              sx={{
                width: 28,
                height: 28,
                color: tokenBrand.main,
                '&:hover': {bgcolor: tokenNeutral.lighter},
              }}
            >
              <OpenInFullIcon sx={{fontSize: 18}} />
            </IconButton>
          </Box>
        </Box>

        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            minHeight: 0,
            borderRadius: '8px',
            bgcolor: 'background.paper',
            border: `1px solid ${tokenDivider}`,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 'clamp(2px, 0.7cqw, 5px) clamp(10px, 2.2cqw, 15px) clamp(2px, 0.7cqw, 5px) clamp(10px, 2.2cqw, 15px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              component="img"
              src={config.image}
              alt={config.imageAlt}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </Box>
        </Paper>
      </Paper>
      <WidgetNotificationsDialog
        active={notifications.active}
        config={config.notificationConfig}
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
