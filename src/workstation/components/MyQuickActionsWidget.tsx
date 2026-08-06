import {useMemo, useState} from 'react';
import type {CSSProperties, ElementType} from 'react';
import {
  Box,
  ButtonBase,
  Snackbar,
  Typography,
} from '@mui/material';
import {
  AssignmentTurnedInOutlined as EsoIcon,
  BuildOutlined as MaintenanceIcon,
  PersonOutline as SupportIcon,
  SwapHoriz as ShiftSwapIcon,
} from '@mui/icons-material';
import {
  tokenBrand,
  tokenCommon,
  tokenDivider,
  tokenInfo,
  tokenNeutral,
  tokenSuccess,
  tokenText,
  workstationVisuals,
} from '../theme';
import { useShiftManagementContext } from '../../shiftManagement/contexts/ShiftManagementContext';
import WidgetShell from './WidgetShell';

type QuickActionId = 'maintenance' | 'support' | 'eso' | 'shift-swap';

type QuickActionTone = {
  icon: string;
  surface: string;
  border: string;
};

type QuickActionConfig = {
  id: QuickActionId;
  label: string;
  description: string;
  Icon: ElementType;
  tone: QuickActionTone;
};

type MyQuickActionsWidgetProps = {
  className?: string;
  style?: CSSProperties;
  onRequestShiftSwap?: () => void;
};

const actionTones: Record<QuickActionId, QuickActionTone> = {
  maintenance: {
    icon: tokenBrand.main,
    surface: tokenBrand.softBg,
    border: tokenBrand.selectedBg,
  },
  support: {
    icon: tokenInfo.darker,
    surface: tokenInfo.softBg,
    border: tokenInfo.selectedBg,
  },
  eso: {
    icon: tokenSuccess.darker,
    surface: tokenSuccess.softBg,
    border: tokenSuccess.selectedBg,
  },
  'shift-swap': {
    icon: tokenBrand.main,
    surface: tokenBrand.softBg,
    border: tokenBrand.selectedBg,
  },
};

const quickActions: QuickActionConfig[] = [
  {
    id: 'maintenance',
    label: 'Maintenance Request',
    description: 'Log a breakdown or request help from maintenance.',
    Icon: MaintenanceIcon,
    tone: actionTones.maintenance,
  },
  {
    id: 'support',
    label: 'Request Support from Leader',
    description: 'Ask your leader for a decision or escalation.',
    Icon: SupportIcon,
    tone: actionTones.support,
  },
  {
    id: 'eso',
    label: 'Create ESO',
    description: 'Open a safety observation for this shift.',
    Icon: EsoIcon,
    tone: actionTones.eso,
  },
  {
    id: 'shift-swap',
    label: 'Request Shift Swap',
    description: 'Prepare a coverage request for approval.',
    Icon: ShiftSwapIcon,
    tone: actionTones['shift-swap'],
  },
];

export default function MyQuickActionsWidget({
  className,
  style,
  onRequestShiftSwap,
}: MyQuickActionsWidgetProps) {
  const [fallbackMessage, setFallbackMessage] = useState('');
  const {setIsShiftEntryOpen, setShiftEntryMode} = useShiftManagementContext().logbook;

  const actionHandlers = useMemo<Record<QuickActionId, (() => void) | undefined>>(() => ({
    maintenance: () => {
      setShiftEntryMode('maintenance');
      setIsShiftEntryOpen(true);
    },
    support: undefined,
    eso: () => {
      setShiftEntryMode('eso');
      setIsShiftEntryOpen(true);
    },
    'shift-swap': onRequestShiftSwap,
  }), [onRequestShiftSwap, setIsShiftEntryOpen, setShiftEntryMode]);

  const runAction = (action: QuickActionConfig) => {
    if (action.id === 'support') return;

    const handler = actionHandlers[action.id];
    if (handler) {
      handler();
      return;
    }

    setFallbackMessage(`${action.label} is ready to connect.`);
  };

  return (
    <WidgetShell
      title={(
        <Typography sx={{fontSize: '0.875rem', lineHeight: 1.25, fontWeight: 700, color: tokenText.primary, fontFamily: workstationVisuals.fontFamily}}>
          Quick Access
        </Typography>
      )}
      className={className}
      style={style}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gridAutoRows: 'minmax(0, 1fr)',
          gap: 'clamp(0.45rem, 1.4cqw, 0.85rem)',
          height: '100%',
          minHeight: 0,
          overflow: 'hidden',
          containerType: 'size',
          '@container (min-width: 520px)': {
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          },
          '@container (max-width: 300px)': {
            gridTemplateColumns: '1fr',
            gap: 0.45,
          },
          '@container (max-width: 220px)': {
            gap: 0.35,
          },
        }}
      >
        {quickActions.map((action) => {
          const {Icon, tone} = action;

          return (
            <ButtonBase
              key={action.id}
              onClick={() => runAction(action)}
              sx={{
                minHeight: 0,
                borderRadius: '10px',
                border: `1px solid ${tone.border}`,
                bgcolor: tone.surface,
                color: tokenText.primary,
                p: 'clamp(0.65rem, 1.8cqw, 1rem)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'clamp(0.45rem, 1.1cqw, 0.7rem)',
                textAlign: 'center',
                overflow: 'hidden',
                transition: 'border-color 160ms ease, background-color 160ms ease, transform 160ms ease',
                '&:hover': {
                  bgcolor: tokenNeutral.lightest,
                  borderColor: tone.icon,
                  transform: 'translateY(-1px)',
                },
                '&:focus-visible': {
                  outline: `2px solid ${tokenBrand.main}`,
                  outlineOffset: 2,
                },
                '@container (max-width: 300px)': {
                  gridColumn: '1 / -1',
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  px: 0.7,
                  py: 0.35,
                  gap: 0.55,
                },
                '@container (max-width: 220px)': {
                  borderRadius: '8px',
                  px: 0.45,
                  gap: 0.4,
                },
              }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '8px',
                  bgcolor: tokenCommon.white,
                  color: tone.icon,
                  border: `1px solid ${tokenDivider}`,
                  boxShadow: '0 2px 8px rgba(0, 31, 155, 0.10)',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                  '& svg': {
                    fontSize: 22,
                    strokeWidth: 1.8,
                  },
                  '@container (min-width: 520px) and (min-height: 260px)': {
                    width: 42,
                    height: 42,
                    borderRadius: '10px',
                    '& svg': {
                      fontSize: 25,
                    },
                  },
                  '@container (max-width: 520px)': {
                    width: 30,
                    height: 30,
                    '& svg': {
                      fontSize: 19,
                    },
                  },
                  '@container (max-width: 300px)': {
                    width: 24,
                    height: 24,
                    '& svg': {
                      fontSize: 16,
                    },
                  },
                  '@container (max-width: 220px)': {
                    width: 20,
                    height: 20,
                    '& svg': {
                      fontSize: 14,
                    },
                  },
                }}
              >
                <Icon />
              </Box>
              <Typography
                sx={{
                  maxWidth: 210,
                  color: tokenText.primary,
                  fontSize: 'clamp(0.72rem, 1.45cqw, 0.88rem)',
                  lineHeight: 1.15,
                  fontWeight: 700,
                  fontFamily: workstationVisuals.fontFamily,
                  overflowWrap: 'anywhere',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  '@container (max-width: 520px)': {
                    fontSize: '0.6875rem',
                  },
                  '@container (max-width: 300px)': {
                    display: 'block',
                    minWidth: 0,
                    maxWidth: 'none',
                    fontSize: '0.625rem',
                    lineHeight: 1.1,
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  },
                  '@container (max-width: 220px)': {
                    fontSize: '0.5625rem',
                  },
                }}
              >
                {action.label}
              </Typography>
              <Typography
                sx={{
                  maxWidth: 230,
                  color: tokenText.secondary,
                  fontSize: 'clamp(0.58rem, 1.15cqw, 0.68rem)',
                  lineHeight: 1.25,
                  fontWeight: 500,
                  fontFamily: workstationVisuals.fontFamily,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  '@container (max-height: 230px)': {
                    display: 'none',
                  },
                  '@container (max-width: 360px)': {
                    display: 'none',
                  },
                }}
              >
                {action.description}
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>

      <Snackbar
        autoHideDuration={2600}
        message={fallbackMessage}
        onClose={() => setFallbackMessage('')}
        open={Boolean(fallbackMessage)}
      />
    </WidgetShell>
  );
}
