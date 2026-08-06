import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Button,
  ButtonBase,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Typography,
} from '@mui/material';
import {
  AssignmentOutlined as MyTaskIcon,
  BuildOutlined as MaintenanceIcon,
  ShieldOutlined as EsoIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';
import { useShiftManagementContext } from '../../shiftManagement/contexts/ShiftManagementContext';
import {
  tokenBrand,
  tokenCommon,
  tokenInfo,
  tokenNeutral,
  tokenSuccess,
  workstationSoftBadgeSx,
  workstationVisuals,
} from '../theme';
import WidgetShell from './WidgetShell';
import type { WorkstationWidgetProps } from '../types';

type QuickActionId = 'my-task' | 'maintenance-request' | 'eso';

type QuickActionDefinition = {
  id: QuickActionId;
  title: string;
  subtitle: string;
  icon: typeof MyTaskIcon;
  iconBg: string;
  iconColor: string;
};

const quickActionCatalog: QuickActionDefinition[] = [
  {
    id: 'my-task',
    title: 'My Task',
    subtitle: 'View assigned tasks',
    icon: MyTaskIcon,
    iconBg: tokenBrand.softBg,
    iconColor: tokenBrand.dark,
  },
  {
    id: 'maintenance-request',
    title: 'Maintenance Request',
    subtitle: 'Log issue or breakdown',
    icon: MaintenanceIcon,
    iconBg: tokenInfo.softBg,
    iconColor: tokenInfo.main,
  },
  {
    id: 'eso',
    title: 'ESO',
    subtitle: 'Open safety observation',
    icon: EsoIcon,
    iconBg: tokenSuccess.softBg,
    iconColor: tokenSuccess.main,
  },
];

const defaultQuickActionIds: QuickActionId[] = quickActionCatalog.map((action) => action.id);
const quickActionsStorageKey = 'workstation-quick-actions-v1';

const sectionHeadingSx = {
  fontSize: '0.82rem',
  fontWeight: 600,
  color: workstationVisuals.textPrimary,
  fontFamily: workstationVisuals.fontFamily,
  lineHeight: 1.2,
} as const;

const actionTileSx = {
  alignItems: 'center',
  justifyContent: 'flex-start',
  flexDirection: 'row',
  gap: 0.75,
  width: '100%',
  minHeight: 0,
  p: 'clamp(0.45rem, 1.8cqw, 0.75rem)',
  borderRadius: '8px',
  border: '1px solid rgba(15, 23, 42, 0.06)',
  bgcolor: tokenCommon.white,
  textAlign: 'left',
  transition: 'border-color 0.15s ease, background-color 0.15s ease, transform 0.15s ease',
  '&:hover': {
    borderColor: 'rgba(15, 23, 42, 0.14)',
    bgcolor: tokenNeutral.lightest,
  },
  '&:active': {
    transform: 'scale(0.99)',
  },
  '@container (max-height: 220px)': {
    p: '0.4rem 0.55rem',
    gap: 0.55,
  },
} as const;

type QuickActionsWidgetProps = WorkstationWidgetProps & {
  onOpenActionTracker?: () => void;
};

function readStoredQuickActionIds(): QuickActionId[] {
  if (typeof window === 'undefined') return defaultQuickActionIds;

  try {
    const raw = window.localStorage.getItem(quickActionsStorageKey);
    if (!raw) return defaultQuickActionIds;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultQuickActionIds;

    const validIds = parsed.filter((id): id is QuickActionId => (
      typeof id === 'string' && defaultQuickActionIds.includes(id as QuickActionId)
    ));

    return validIds.length > 0 ? validIds : defaultQuickActionIds;
  } catch {
    return defaultQuickActionIds;
  }
}

export default function QuickActionsWidget({
  className,
  style,
  onOpenActionTracker,
}: QuickActionsWidgetProps) {
  const { setIsShiftEntryOpen, setShiftEntryMode } = useShiftManagementContext().logbook;
  const [selectedActionIds, setSelectedActionIds] = useState<QuickActionId[]>(readStoredQuickActionIds);
  const [draftActionIds, setDraftActionIds] = useState<QuickActionId[]>(selectedActionIds);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  const visibleActions = useMemo(
    () => quickActionCatalog.filter((action) => selectedActionIds.includes(action.id)),
    [selectedActionIds],
  );

  const isCustomSet = selectedActionIds.length !== defaultQuickActionIds.length
    || !defaultQuickActionIds.every((id) => selectedActionIds.includes(id));

  const persistSelection = useCallback((nextIds: QuickActionId[]) => {
    setSelectedActionIds(nextIds);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(quickActionsStorageKey, JSON.stringify(nextIds));
    }
  }, []);

  const handleActionClick = (actionId: QuickActionId) => {
    switch (actionId) {
      case 'my-task':
        onOpenActionTracker?.();
        break;
      case 'maintenance-request':
        setShiftEntryMode('maintenance');
        setIsShiftEntryOpen(true);
        break;
      case 'eso':
        setShiftEntryMode('eso');
        setIsShiftEntryOpen(true);
        break;
      default:
        break;
    }
  };

  const openCustomize = () => {
    setDraftActionIds(selectedActionIds);
    setIsCustomizeOpen(true);
  };

  const toggleDraftAction = (actionId: QuickActionId) => {
    setDraftActionIds((current) => {
      if (current.includes(actionId)) {
        if (current.length === 1) return current;
        return current.filter((id) => id !== actionId);
      }
      return [...current, actionId];
    });
  };

  const saveCustomize = () => {
    persistSelection(draftActionIds);
    setIsCustomizeOpen(false);
  };

  const headerTitle = (
    <Typography sx={{ ...sectionHeadingSx, fontSize: 'clamp(0.92rem, 3.2cqw, 1.05rem)' }}>
      Quick Access
    </Typography>
  );

  const headerAction = (
    <IconButton
      size="small"
      aria-label="Customize quick actions"
      onClick={openCustomize}
      sx={{
        width: 28,
        height: 28,
        border: '1px solid rgba(15, 23, 42, 0.08)',
        color: tokenBrand.main,
        bgcolor: tokenCommon.white,
        '&:hover': {
          bgcolor: tokenNeutral.lightest,
          borderColor: 'rgba(15, 23, 42, 0.16)',
        },
      }}
    >
      <TuneIcon sx={{ fontSize: 16 }} />
    </IconButton>
  );

  return (
    <>
      <WidgetShell className={className} style={style} title={headerTitle} action={headerAction}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 0,
            gap: 0.75,
            containerType: 'size',
          }}
        >
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 'clamp(0.35rem, 1.2cqw, 0.6rem)',
              alignContent: 'start',
            }}
          >
            {visibleActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <ButtonBase
                  key={action.id}
                  onClick={() => handleActionClick(action.id)}
                  aria-label={`${action.title}: ${action.subtitle}`}
                  sx={actionTileSx}
                >
                  <Box
                    className="quick-action-icon"
                    sx={{
                      width: 'clamp(22px, 6cqw, 28px)',
                      height: 'clamp(22px, 6cqw, 28px)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: action.iconBg,
                      color: action.iconColor,
                      flexShrink: 0,
                      '@container (max-height: 220px)': {
                        width: 22,
                        height: 22,
                        borderRadius: '6px',
                      },
                    }}
                  >
                    <ActionIcon sx={{ fontSize: 'clamp(13px, 3.5cqw, 16px)' }} />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: 'clamp(0.68rem, 2.4cqw, 0.78rem)',
                        fontWeight: 600,
                        color: workstationVisuals.textPrimary,
                        fontFamily: workstationVisuals.fontFamily,
                        lineHeight: 1.2,
                      }}
                    >
                      {action.title}
                    </Typography>
                    <Typography
                      className="quick-action-subtitle"
                      sx={{
                        mt: 0.15,
                        fontSize: 'clamp(0.56rem, 2cqw, 0.62rem)',
                        color: workstationVisuals.textSecondary,
                        fontFamily: workstationVisuals.fontFamily,
                        lineHeight: 1.25,
                        '@container (max-height: 240px)': {
                          display: 'none',
                        },
                      }}
                    >
                      {action.subtitle}
                    </Typography>
                  </Box>
                </ButtonBase>
              );
            })}
          </Box>

          <Box
            sx={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 0.5,
              pt: 0,
              '@container (max-height: 220px)': {
                display: 'none',
              },
            }}
          >
            {isCustomSet ? (
              <Box sx={workstationSoftBadgeSx}>Custom set</Box>
            ) : (
              <Box />
            )}
            <Button
              variant="text"
              onClick={openCustomize}
              sx={{
                minWidth: 0,
                px: 0.5,
                py: 0.25,
                fontSize: '0.72rem',
                fontWeight: 600,
                color: tokenBrand.main,
                textTransform: 'none',
                fontFamily: workstationVisuals.fontFamily,
                '&:hover': {
                  bgcolor: 'transparent',
                  textDecoration: 'underline',
                },
              }}
            >
              Customize
            </Button>
          </Box>
        </Box>
      </WidgetShell>

      <Dialog
        open={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ fontSize: '0.92rem', fontWeight: 600, fontFamily: workstationVisuals.fontFamily }}>
          Customize shortcuts
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <Typography
            sx={{
              mb: 1.5,
              fontSize: '0.72rem',
              color: workstationVisuals.textSecondary,
              fontFamily: workstationVisuals.fontFamily,
            }}
          >
            Choose which shift entry shortcuts appear in this widget.
          </Typography>
          {quickActionCatalog.map((action) => (
            <FormControlLabel
              key={action.id}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                mx: 0,
                mb: 0.5,
                '& .MuiFormControlLabel-label': {
                  fontFamily: workstationVisuals.fontFamily,
                },
              }}
              control={(
                <Checkbox
                  checked={draftActionIds.includes(action.id)}
                  onChange={() => toggleDraftAction(action.id)}
                  size="small"
                  sx={{ py: 0.25 }}
                />
              )}
              label={(
                <Box>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: workstationVisuals.textPrimary }}>
                    {action.title}
                  </Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: workstationVisuals.textSecondary }}>
                    {action.subtitle}
                  </Typography>
                </Box>
              )}
            />
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button
            onClick={() => setIsCustomizeOpen(false)}
            sx={{ textTransform: 'none', fontSize: '0.78rem', color: workstationVisuals.textSecondary }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveCustomize}
            disabled={draftActionIds.length === 0}
            sx={{
              textTransform: 'none',
              fontSize: '0.78rem',
              bgcolor: tokenBrand.main,
              boxShadow: 'none',
              '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
