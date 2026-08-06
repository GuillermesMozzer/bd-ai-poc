import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {useEffect, useState} from 'react';
import type {ReactNode} from 'react';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import {
  AccessTimeOutlined as HourlyIcon,
  AutoAwesomeOutlined as AiSuggestionIcon,
  BookmarkBorderOutlined as SavedRuleIcon,
  BoltOutlined as InstantIcon,
  CalendarMonthOutlined as DailyIcon,
  CheckCircleOutline as AcceptSuggestionIcon,
  CheckBoxOutlineBlankOutlined as EmptyCheckboxIcon,
  CheckBoxOutlined as CheckedCheckboxIcon,
  Close as CloseIcon,
  EmailOutlined as EmailIcon,
  GroupsOutlined as TeamsIcon,
  NotificationsOutlined as NotificationsIcon,
  TodayOutlined as DigestIcon,
} from '@mui/icons-material';

export type WidgetNotificationFilterId = 'site' | 'line' | 'priority' | 'category' | 'status';
export type WidgetNotificationDeliveryId = 'in-app' | 'email' | 'teams' | 'daily-digest';
export type WidgetNotificationFrequencyId = 'instant' | 'hourly' | 'daily';

export type WidgetNotificationEvent = {
  id: string;
  label: string;
  defaultSelected?: boolean;
};

type WidgetNotificationSuggestion = {
  deliveryIds: WidgetNotificationDeliveryId[];
  description: string;
  eventIds: string[];
  filters?: Partial<Record<WidgetNotificationFilterId, string>>;
  frequency: WidgetNotificationFrequencyId;
  savedRuleName?: string;
};

export type WidgetNotificationConfig = {
  events: WidgetNotificationEvent[];
  suggestion: WidgetNotificationSuggestion;
  widgetId: string;
  widgetLabel: string;
};

export type WidgetNotificationState = {
  deliveryIds: WidgetNotificationDeliveryId[];
  filters: Record<WidgetNotificationFilterId, string>;
  frequency: WidgetNotificationFrequencyId;
  savedRuleName: string;
  selectedEventIds: string[];
};

type WidgetNotificationsDialogProps = {
  active: boolean;
  config: WidgetNotificationConfig;
  draftState: WidgetNotificationState;
  onApplySuggestion: () => void;
  onClose: () => void;
  onSave: () => void;
  onStateChange: (nextState: WidgetNotificationState) => void;
  open: boolean;
  onWidgetChange?: (widgetId: string) => void;
  onRuleStatusChange?: (status: 'Active' | 'Paused') => void;
  ruleStatus?: 'Active' | 'Paused';
  widgetOptions?: WidgetNotificationConfig[];
};

const widgetNotificationStorageKey = 'workstation-widget-notifications-v1';

export const filterOptions: Record<WidgetNotificationFilterId, string[]> = {
  site: ['All Sites', 'Sandy', 'Line 10', 'Columbus West', 'Fraga'],
  line: ['All Lines', 'Line 1', 'Line 2', 'Line 3', 'Line 10'],
  priority: ['All Priorities', 'High', 'Medium', 'Low'],
  category: ['All Categories', 'Safety', 'Quality', 'Cost', 'People', 'Delivery'],
  status: ['All Statuses', 'Open', 'In Progress', 'Under Review', 'Completed'],
};

export const filterLabels: Record<WidgetNotificationFilterId, string> = {
  site: 'Site',
  line: 'Line',
  priority: 'Priority',
  category: 'Category',
  status: 'Status',
};

const deliveryOptions: Array<{
  description: string;
  icon: ReactNode;
  id: WidgetNotificationDeliveryId;
  label: string;
}> = [
  {id: 'in-app', label: 'In-app', description: 'Show in application', icon: <NotificationsIcon sx={{fontSize: 18}} />},
  {id: 'email', label: 'Email', description: 'Send by email', icon: <EmailIcon sx={{fontSize: 18}} />},
  {id: 'teams', label: 'Teams', description: 'Send to channel', icon: <TeamsIcon sx={{fontSize: 18}} />},
  {id: 'daily-digest', label: 'Daily Digest', description: 'One summary per day', icon: <DigestIcon sx={{fontSize: 18}} />},
];

export const frequencyOptions: Array<{
  description: string;
  icon: ReactNode;
  id: WidgetNotificationFrequencyId;
  label: string;
}> = [
  {id: 'instant', label: 'Instant', description: 'Notify me right away', icon: <InstantIcon sx={{fontSize: 18}} />},
  {id: 'hourly', label: 'Hourly digest', description: 'Send hourly summary', icon: <HourlyIcon sx={{fontSize: 18}} />},
  {id: 'daily', label: 'Daily digest', description: 'Send once per day', icon: <DailyIcon sx={{fontSize: 18}} />},
];

const deliveryToneMap: Record<WidgetNotificationDeliveryId, {accent: string; bg: string}> = {
  'in-app': {accent: tokenBrand.main, bg: tokenNeutral.lightest},
  email: {accent: tokenBrand.main, bg: tokenNeutral.lightest},
  teams: {accent: workstationVisuals.textSecondary, bg: tokenNeutral.lightest},
  'daily-digest': {accent: tokenBrand.main, bg: tokenNeutral.lightest},
};

export function readStoredWidgetNotificationState(config: WidgetNotificationConfig) {
  if (typeof window === 'undefined') return createDefaultWidgetNotificationState(config);

  try {
    const raw = window.localStorage.getItem(widgetNotificationStorageKey);
    if (!raw) return createDefaultWidgetNotificationState(config);
    const parsed = JSON.parse(raw) as Record<string, WidgetNotificationState | undefined>;
    return parsed[config.widgetId] ?? createDefaultWidgetNotificationState(config);
  } catch {
    return createDefaultWidgetNotificationState(config);
  }
}

export function writeStoredWidgetNotificationState(config: WidgetNotificationConfig, state: WidgetNotificationState) {
  if (typeof window === 'undefined') return;

  try {
    const raw = window.localStorage.getItem(widgetNotificationStorageKey);
    const parsed = raw ? JSON.parse(raw) as Record<string, WidgetNotificationState | undefined> : {};
    parsed[config.widgetId] = state;
    window.localStorage.setItem(widgetNotificationStorageKey, JSON.stringify(parsed));
  } catch {
    // Keep the interaction local if storage is unavailable.
  }
}

export function createDefaultWidgetNotificationState(config: WidgetNotificationConfig): WidgetNotificationState {
  return {
    selectedEventIds: config.events.filter((item) => item.defaultSelected).map((item) => item.id),
    filters: {
      site: 'All Sites',
      line: 'All Lines',
      priority: 'All Priorities',
      category: 'All Categories',
      status: 'All Statuses',
    },
    deliveryIds: ['in-app', 'email'],
    frequency: 'instant',
    savedRuleName: `${config.widgetLabel} notifications`,
  };
}

export function useWidgetNotifications(config: WidgetNotificationConfig) {
  const [open, setOpen] = useState(false);
  const [savedState, setSavedState] = useState<WidgetNotificationState>(() => readStoredWidgetNotificationState(config));
  const [draftState, setDraftState] = useState<WidgetNotificationState>(() => readStoredWidgetNotificationState(config));

  const openDialog = () => {
    const latest = readStoredWidgetNotificationState(config);
    setSavedState(latest);
    setDraftState(latest);
    setOpen(true);
  };

  const closeDialog = () => {
    setDraftState(savedState);
    setOpen(false);
  };

  const saveDialog = () => {
    setSavedState(draftState);
    writeStoredWidgetNotificationState(config, draftState);
    setOpen(false);
  };

  const applySuggestion = () => {
    setDraftState((current) => ({
      ...current,
      selectedEventIds: [...config.suggestion.eventIds],
      deliveryIds: [...config.suggestion.deliveryIds],
      frequency: config.suggestion.frequency,
      filters: {
        ...current.filters,
        ...config.suggestion.filters,
      },
      savedRuleName: config.suggestion.savedRuleName ?? current.savedRuleName,
    }));
  };

  return {
    active: savedState.selectedEventIds.length > 0 && savedState.deliveryIds.length > 0,
    applySuggestion,
    closeDialog,
    draftState,
    open,
    openDialog,
    saveDialog,
    setDraftState,
  };
}

export function WidgetNotificationBell({
  active,
  onClick,
  size = 28,
}: {
  active: boolean;
  onClick: () => void;
  size?: number;
}) {
  return (
    <IconButton
      aria-label="Open notifications"
      onClick={onClick}
      size="small"
      sx={{
        width: size,
        height: size,
        position: 'relative',
        color: active ? tokenCommon.white : tokenBrand.main,
        bgcolor: active ? tokenBrand.main : tokenCommon.white,
        border: `1px solid ${tokenInfo.lightest}`,
        boxShadow: active ? '0 6px 16px rgba(37, 99, 235, 0.18)' : 'none',
        '&:hover': {
          bgcolor: active ? tokenBrand.main : tokenNeutral.lightest,
        },
      }}
    >
      <NotificationsIcon sx={{fontSize: Math.max(15, size - 12)}} />
      {active ? (
        <Box
          sx={{
            position: 'absolute',
            right: 5,
            top: 5,
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: tokenSuccess.main,
            border: `1.5px solid ${tokenCommon.white}`,
          }}
        />
      ) : null}
    </IconButton>
  );
}

export function WidgetNotificationsDialog({
  active,
  config,
  draftState,
  onApplySuggestion,
  onClose,
  onSave,
  onStateChange,
  open,
  onWidgetChange,
  onRuleStatusChange,
  ruleStatus,
  widgetOptions,
}: WidgetNotificationsDialogProps) {
  const [isSuggestionDismissed, setIsSuggestionDismissed] = useState(false);

  useEffect(() => {
    if (open) {
      setIsSuggestionDismissed(false);
    }
  }, [open]);

  const updateEvent = (eventId: string) => {
    const selectedEventIds = draftState.selectedEventIds.includes(eventId)
      ? draftState.selectedEventIds.filter((item) => item !== eventId)
      : [...draftState.selectedEventIds, eventId];
    onStateChange({...draftState, selectedEventIds});
  };

  const updateDelivery = (deliveryId: WidgetNotificationDeliveryId) => {
    const deliveryIds = draftState.deliveryIds.includes(deliveryId)
      ? draftState.deliveryIds.filter((item) => item !== deliveryId)
      : [...draftState.deliveryIds, deliveryId];
    onStateChange({...draftState, deliveryIds});
  };

  const acceptSuggestion = () => {
    onApplySuggestion();
    setIsSuggestionDismissed(true);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle sx={{px: 3, py: 2.2, borderBottom: `1px solid ${tokenNeutral.main}`}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'flex-start'}}>
          <Box sx={{display: 'flex', gap: 1.2, minWidth: 0}}>
            <Box sx={{width: 38, height: 38, borderRadius: '50%', bgcolor: tokenNeutral.lightest, color: tokenBrand.main, display: 'grid', placeItems: 'center', flexShrink: 0}}>
              <NotificationsIcon sx={{fontSize: 21}} />
            </Box>
            <Box sx={{minWidth: 0}}>
              <Typography sx={{fontSize: 21, fontWeight: 900, color: workstationVisuals.textPrimary, lineHeight: 1.1}}>
                Notifications
              </Typography>
              <Typography sx={{fontSize: 13, color: workstationVisuals.textSecondary, mt: 0.45}}>
                Configure alerts for this widget
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{color: workstationVisuals.textSecondary}}>
            <CloseIcon sx={{fontSize: 19}} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{px: 3, py: 2.2, bgcolor: tokenNeutral.lightest}}>
        <Box sx={{display: 'grid', gap: 1.5}}>
          <Paper elevation={0} sx={{p: 1.5, borderRadius: 1.5, border: `1px solid ${tokenNeutral.main}`, bgcolor: tokenCommon.white}}>
            <Typography sx={{fontSize: 12, color: workstationVisuals.tierTextHeading, fontWeight: 800, mb: 0.85}}>
              Widget
            </Typography>
            {widgetOptions && onWidgetChange ? (
              <Select
                value={config.widgetId}
                onChange={(event) => onWidgetChange(event.target.value)}
                size="small"
                fullWidth
                sx={{
                  height: 40,
                  borderRadius: 1.1,
                  bgcolor: tokenCommon.white,
                  '& .MuiSelect-select': {fontSize: 12.5, fontWeight: 800},
                }}
              >
                {widgetOptions.map((option) => (
                  <MenuItem key={option.widgetId} value={option.widgetId}>
                    {option.widgetLabel}
                  </MenuItem>
                ))}
              </Select>
            ) : (
              <Box sx={{height: 40, borderRadius: 1.2, border: `1px solid ${tokenNeutral.dark}`, px: 1.2, display: 'flex', alignItems: 'center', color: workstationVisuals.textPrimary, fontWeight: 800}}>
                {config.widgetLabel}
              </Box>
            )}
          </Paper>

          {!isSuggestionDismissed ? (
            <Paper
              elevation={0}
              sx={{
                px: 1,
                py: 0.85,
                borderRadius: 0.75,
                border: `1px solid ${tokenInfo.lightest}`,
                bgcolor: 'rgba(29, 116, 255, 0.08)',
              }}
            >
              <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'center'}}>
                <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 0.25, minWidth: 0}}>
                  <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45, minWidth: 0}}>
                    <AiSuggestionIcon sx={{fontSize: 14, color: tokenWarning.main, flexShrink: 0}} />
                    <Typography sx={{fontSize: 12, color: tokenBrand.main, fontWeight: 900, lineHeight: 1.15}}>
                      BLU.AI Suggestion
                    </Typography>
                  </Box>
                  <Box sx={{minWidth: 0}}>
                    <Typography sx={{fontSize: 12, color: tokenBrand.main, lineHeight: 1.25}}>
                      {config.suggestion.description}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45, flexShrink: 0}}>
                  <IconButton
                    aria-label="Dismiss BLU.AI suggestion"
                    onClick={() => setIsSuggestionDismissed(true)}
                    size="small"
                    sx={{width: 26, height: 26, borderRadius: 0.75, color: tokenBrand.main, '&:hover': {bgcolor: 'rgba(29, 116, 255, 0.12)'}}}
                  >
                    <CloseIcon sx={{fontSize: 16}} />
                  </IconButton>
                  <IconButton
                    aria-label="Apply BLU.AI suggestion"
                    onClick={acceptSuggestion}
                    size="small"
                    sx={{width: 26, height: 26, borderRadius: 0.75, color: tokenBrand.main, '&:hover': {bgcolor: 'rgba(29, 116, 255, 0.12)'}}}
                  >
                    <AcceptSuggestionIcon sx={{fontSize: 17}} />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          ) : null}

          <Paper elevation={0} sx={{p: 1.5, borderRadius: 1.5, border: `1px solid ${tokenNeutral.main}`, bgcolor: tokenCommon.white}}>
            <Typography sx={{fontSize: 13, color: workstationVisuals.textPrimary, fontWeight: 900, mb: 1.1}}>
              Notify me when
            </Typography>
            <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '1fr 1fr'}, gap: 0.5}}>
              {config.events.map((event, index) => (
                <Box
                  key={event.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: 40,
                    borderBottom: index < config.events.length - 2 ? `1px solid ${tokenNeutral.lighter}` : 'none',
                  }}
                >
                  <Checkbox
                    checked={draftState.selectedEventIds.includes(event.id)}
                    onChange={() => updateEvent(event.id)}
                    icon={<EmptyCheckboxIcon sx={{fontSize: 18}} />}
                    checkedIcon={<CheckedCheckboxIcon sx={{fontSize: 18}} />}
                    sx={{color: workstationVisuals.textMuted, '&.Mui-checked': {color: tokenBrand.main}}}
                  />
                  <Typography sx={{fontSize: 13, color: workstationVisuals.tierTextHeading}}>
                    {event.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          <Paper elevation={0} sx={{p: 1.5, borderRadius: 1.5, border: `1px solid ${tokenNeutral.main}`, bgcolor: tokenCommon.white}}>
            <Typography sx={{fontSize: 13, color: workstationVisuals.textPrimary, fontWeight: 900, mb: 1.1}}>
              Filters
            </Typography>
            <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr 1fr', lg: 'repeat(5, minmax(0, 1fr))'}, gap: 0.9}}>
              {(Object.keys(filterLabels) as WidgetNotificationFilterId[]).map((filterId) => (
                <Box key={filterId}>
                  <Typography sx={{fontSize: 11, color: workstationVisuals.tierTextLabel, fontWeight: 700, mb: 0.45}}>
                    {filterLabels[filterId]}
                  </Typography>
                  <Select
                    value={draftState.filters[filterId]}
                    onChange={(event) => onStateChange({
                      ...draftState,
                      filters: {...draftState.filters, [filterId]: event.target.value},
                    })}
                    size="small"
                    fullWidth
                    sx={{
                      height: 38,
                      borderRadius: 1.1,
                      bgcolor: tokenCommon.white,
                      '& .MuiSelect-select': {fontSize: 12.5},
                    }}
                  >
                    {filterOptions[filterId].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              ))}
            </Box>
          </Paper>

          <Paper elevation={0} sx={{p: 1.5, borderRadius: 1.5, border: `1px solid ${tokenNeutral.main}`, bgcolor: tokenCommon.white}}>
            <Typography sx={{fontSize: 13, color: workstationVisuals.textPrimary, fontWeight: 900, mb: 1.1}}>
              Delivery
            </Typography>
            <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '1fr 1fr', xl: 'repeat(4, minmax(0, 1fr))'}, gap: 0.9}}>
              {deliveryOptions.map((option) => {
                const selected = draftState.deliveryIds.includes(option.id);
                return (
                  <Box
                    key={option.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => updateDelivery(option.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        updateDelivery(option.id);
                      }
                    }}
                    sx={{
                      minWidth: 0,
                      height: 72,
                      px: 1.2,
                      borderRadius: 1.2,
                      border: `1px solid ${selected ? deliveryToneMap[option.id].accent : tokenNeutral.dark}`,
                      bgcolor: selected ? deliveryToneMap[option.id].bg : tokenCommon.white,
                      color: workstationVisuals.textPrimary,
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1, width: '100%'}}>
                      <Box sx={{mt: 0.1, color: selected ? deliveryToneMap[option.id].accent : workstationVisuals.textMuted, display: 'grid', placeItems: 'center'}}>
                        {selected ? <CheckedCheckboxIcon sx={{fontSize: 18}} /> : <EmptyCheckboxIcon sx={{fontSize: 18}} />}
                      </Box>
                      <Box sx={{display: 'grid', gridTemplateColumns: '18px minmax(0, 1fr)', gap: 0.7, alignItems: 'start', width: '100%', textAlign: 'left'}}>
                        <Box sx={{mt: 0.15, color: deliveryToneMap[option.id].accent}}>
                          {option.icon}
                        </Box>
                        <Box>
                          <Typography sx={{fontSize: 12.5, fontWeight: 900, color: workstationVisuals.textPrimary, lineHeight: 1.1}}>
                            {option.label}
                          </Typography>
                          <Typography sx={{fontSize: 11, color: workstationVisuals.textSecondary, mt: 0.35, lineHeight: 1.2}}>
                            {option.description}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>

          <Paper elevation={0} sx={{p: 1.5, borderRadius: 1.5, border: `1px solid ${tokenNeutral.main}`, bgcolor: tokenCommon.white}}>
            <Typography sx={{fontSize: 13, color: workstationVisuals.textPrimary, fontWeight: 900, mb: 1.1}}>
              Frequency
            </Typography>
            <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(3, minmax(0, 1fr))'}, gap: 0.9}}>
              {frequencyOptions.map((option) => {
                const selected = draftState.frequency === option.id;
                return (
                  <Button
                    key={option.id}
                    onClick={() => onStateChange({...draftState, frequency: option.id})}
                    sx={{
                      minWidth: 0,
                      height: 68,
                      px: 1.2,
                      borderRadius: 1.2,
                      border: `1px solid ${selected ? tokenBrand.main : tokenNeutral.dark}`,
                      bgcolor: selected ? tokenNeutral.lightest : tokenCommon.white,
                      color: workstationVisuals.textPrimary,
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                    }}
                  >
                    <Box sx={{display: 'grid', gridTemplateColumns: '18px 18px minmax(0, 1fr)', gap: 0.8, alignItems: 'center', width: '100%', textAlign: 'left'}}>
                      <Box sx={{width: 16, height: 16, borderRadius: '50%', border: `1.8px solid ${selected ? tokenBrand.main : workstationVisuals.textMuted}`, display: 'grid', placeItems: 'center'}}>
                        {selected ? <Box sx={{width: 8, height: 8, borderRadius: '50%', bgcolor: tokenBrand.main}} /> : null}
                      </Box>
                      <Box sx={{color: selected ? tokenBrand.main : workstationVisuals.textSecondary}}>
                        {option.icon}
                      </Box>
                      <Box>
                        <Typography sx={{fontSize: 12.5, fontWeight: 900, color: workstationVisuals.textPrimary, lineHeight: 1.1}}>
                          {option.label}
                        </Typography>
                        <Typography sx={{fontSize: 11, color: workstationVisuals.textSecondary, mt: 0.35, lineHeight: 1.2}}>
                          {option.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Button>
                );
              })}
            </Box>
          </Paper>

          <Paper elevation={0} sx={{p: 1.5, borderRadius: 1.5, border: `1px solid ${tokenNeutral.main}`, bgcolor: tokenCommon.white}}>
            <Typography sx={{fontSize: 12, color: workstationVisuals.tierTextLabel, fontWeight: 700, mb: 0.55}}>
              Saved rule
            </Typography>
            <Box sx={{display: 'grid', gridTemplateColumns: '24px minmax(0, 1fr)', gap: 0.8, alignItems: 'center'}}>
              <SavedRuleIcon sx={{fontSize: 18, color: tokenBrand.main}} />
              <TextField
                value={draftState.savedRuleName}
                onChange={(event) => onStateChange({...draftState, savedRuleName: event.target.value})}
                size="small"
                fullWidth
                placeholder="High priority actions"
              />
            </Box>
          </Paper>

          {ruleStatus && onRuleStatusChange ? (
            <Paper elevation={0} sx={{p: 1.5, borderRadius: 1.5, border: `1px solid ${tokenNeutral.main}`, bgcolor: tokenCommon.white}}>
              <Typography sx={{fontSize: 13, color: workstationVisuals.textPrimary, fontWeight: 900, mb: 1.1}}>
                Rule status
              </Typography>
              <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '1fr 1fr'}, gap: 0.9}}>
                {(['Active', 'Paused'] as const).map((statusOption) => {
                  const selected = ruleStatus === statusOption;
                  const accent = statusOption === 'Active' ? tokenSuccess.main : tokenWarning.main;
                  return (
                    <Button
                      key={statusOption}
                      onClick={() => onRuleStatusChange(statusOption)}
                      sx={{
                        minWidth: 0,
                        height: 48,
                        px: 1.2,
                        borderRadius: 1.2,
                        border: `1px solid ${selected ? accent : tokenNeutral.dark}`,
                        bgcolor: selected ? tokenNeutral.lightest : tokenCommon.white,
                        color: workstationVisuals.textPrimary,
                        justifyContent: 'flex-start',
                        textTransform: 'none',
                        fontWeight: 800,
                      }}
                    >
                      {statusOption}
                    </Button>
                  );
                })}
              </Box>
            </Paper>
          ) : null}

          {active ? (
            <Typography sx={{fontSize: 11.5, color: tokenBrand.main, fontWeight: 700}}>
              Existing notification rule is active for this widget.
            </Typography>
          ) : null}
        </Box>
      </DialogContent>

      <DialogActions sx={{px: 3, py: 2, borderTop: `1px solid ${tokenNeutral.main}`, justifyContent: 'space-between'}}>
        <Button onClick={onClose} variant="outlined" sx={{fontWeight: 800}}>
          Cancel
        </Button>
        <Button onClick={onSave} variant="contained" sx={{fontWeight: 900}}>
          Save notifications
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export const actionTrackerNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'action-tracker',
  widgetLabel: 'Action Tracker',
  events: [
    {id: 'item-created', label: 'A new item is created', defaultSelected: true},
    {id: 'item-assigned', label: 'An item is assigned to me or my team', defaultSelected: true},
    {id: 'due-approaching', label: 'Due date is approaching', defaultSelected: true},
    {id: 'item-overdue', label: 'An item becomes overdue', defaultSelected: true},
    {id: 'priority-high', label: 'Priority changes to High', defaultSelected: true},
    {id: 'status-change', label: 'Status changes'},
    {id: 'item-escalated', label: 'Item is escalated'},
    {id: 'threshold-crossed', label: 'KPI crosses a threshold'},
  ],
  suggestion: {
    description: 'Suggested: notify for overdue items, escalations, and high-priority actions.',
    eventIds: ['item-overdue', 'priority-high', 'item-escalated'],
    deliveryIds: ['in-app', 'email'],
    frequency: 'instant',
    filters: {priority: 'High'},
    savedRuleName: 'High priority actions',
  },
};

export const myEsoNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'my-team-esos',
  widgetLabel: 'My Team ESOs',
  events: [
    {id: 'eso-created', label: 'A new ESO is created', defaultSelected: true},
    {id: 'eso-assigned', label: 'An ESO is assigned to my team', defaultSelected: true},
    {id: 'review-due', label: 'Review due date is approaching'},
    {id: 'eso-escalated', label: 'An ESO is escalated', defaultSelected: true},
    {id: 'unsafe-condition', label: 'Unsafe condition is reported'},
    {id: 'near-miss', label: 'Near miss is logged'},
    {id: 'accident-opened', label: 'Accident report is opened'},
    {id: 'threshold-crossed', label: 'Report KPI crosses a threshold'},
  ],
  suggestion: {
    description: 'Suggested: notify for new unsafe conditions, escalations, and accident reports.',
    eventIds: ['eso-created', 'eso-escalated', 'unsafe-condition', 'accident-opened'],
    deliveryIds: ['in-app', 'email'],
    frequency: 'instant',
    filters: {category: 'Safety'},
    savedRuleName: 'Critical ESO coverage',
  },
};

export const myEsosNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'my-esos',
  widgetLabel: 'My ESOs',
  events: [
    {id: 'eso-opened', label: 'An ESO is opened by me', defaultSelected: true},
    {id: 'eso-in-review', label: 'My ESO moves to In Review'},
    {id: 'eso-closed', label: 'My ESO is closed'},
    {id: 'target-risk', label: 'Monthly target is at risk', defaultSelected: true},
    {id: 'category-near-miss', label: 'Near miss category receives a new item'},
    {id: 'category-unsafe', label: 'Unsafe condition category receives a new item'},
    {id: 'category-accident', label: 'Accident category receives a new item'},
    {id: 'threshold-crossed', label: 'Completion KPI crosses a threshold'},
  ],
  suggestion: {
    description: 'Suggested: notify when your ESO target is at risk or when new unsafe conditions are opened.',
    eventIds: ['target-risk', 'category-unsafe', 'category-accident'],
    deliveryIds: ['in-app', 'daily-digest'],
    frequency: 'hourly',
    filters: {category: 'Safety'},
    savedRuleName: 'My ESO focus',
  },
};

export const lossFocusedKpisNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'loss-focused-kpis',
  widgetLabel: 'Loss Focused KPIs',
  events: [
    {id: 'loss-threshold', label: 'Loss KPI crosses threshold', defaultSelected: true},
    {id: 'trend-worsens', label: 'Trend worsens for a selected KPI', defaultSelected: true},
    {id: 'line-spike', label: 'Line loss spikes inside the selected window'},
    {id: 'shift-missed-target', label: 'Shift misses target'},
    {id: 'weekly-missed-target', label: 'Weekly target is missed'},
    {id: 'new-recovery-action', label: 'A recovery action is created'},
    {id: 'action-overdue', label: 'A loss action becomes overdue'},
    {id: 'line-threshold', label: 'Line chart crosses a critical threshold'},
  ],
  suggestion: {
    description: 'Suggested: notify instantly for threshold breaches and send a digest for worsening KPI trends.',
    eventIds: ['loss-threshold', 'trend-worsens', 'action-overdue'],
    deliveryIds: ['in-app', 'email'],
    frequency: 'instant',
    filters: {priority: 'High'},
    savedRuleName: 'Loss recovery watch',
  },
};

export const myTasksNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'my-tasks',
  widgetLabel: 'My Tasks',
  events: [
    {id: 'task-assigned', label: 'A task is assigned to me', defaultSelected: true},
    {id: 'task-due-soon', label: 'A task is due soon', defaultSelected: true},
    {id: 'task-overdue', label: 'A task becomes overdue', defaultSelected: true},
    {id: 'task-status-change', label: 'Task status changes'},
    {id: 'task-completed', label: 'A task is completed'},
    {id: 'task-escalated', label: 'A task is escalated'},
    {id: 'shift-task-added', label: 'A new shift task is added'},
    {id: 'task-threshold', label: 'Open task count crosses a threshold'},
  ],
  suggestion: {
    description: 'Suggested: notify for overdue tasks, new assignments, and task escalations.',
    eventIds: ['task-assigned', 'task-overdue', 'task-escalated'],
    deliveryIds: ['in-app', 'email'],
    frequency: 'instant',
    savedRuleName: 'My tasks today',
  },
};

export const cilCenterlineNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'operator-cil-centerline',
  widgetLabel: 'CIL & Centerline',
  events: [
    {id: 'cil-due-soon', label: 'A CIL task is due soon', defaultSelected: true},
    {id: 'centerline-due-soon', label: 'A centerline check is due soon', defaultSelected: true},
    {id: 'task-overdue', label: 'A routine becomes overdue', defaultSelected: true},
    {id: 'abnormality-reported', label: 'An abnormality is reported', defaultSelected: true},
    {id: 'centerline-out-of-range', label: 'A centerline value is out of range'},
    {id: 'proof-missing', label: 'Required photo or comment proof is missing'},
    {id: 'review-waiting', label: 'A completed routine is waiting for review'},
    {id: 'rescheduled', label: 'A routine is rescheduled'},
  ],
  suggestion: {
    description: 'Suggested: notify for overdue routines, abnormalities, and out-of-range centerline checks.',
    eventIds: ['task-overdue', 'abnormality-reported', 'centerline-out-of-range', 'review-waiting'],
    deliveryIds: ['in-app', 'email'],
    frequency: 'instant',
    filters: {priority: 'High', status: 'Open'},
    savedRuleName: 'CIL and centerline exceptions',
  },
};

export const shiftScheduleNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'shift-schedule',
  widgetLabel: 'Shift Schedule',
  events: [
    {id: 'shift-starting', label: 'My shift is starting soon', defaultSelected: true},
    {id: 'break-due', label: 'Break window is due', defaultSelected: true},
    {id: 'punch-missed', label: 'Punch in or out is missed', defaultSelected: true},
    {id: 'schedule-changed', label: 'My schedule changes'},
    {id: 'overtime-added', label: 'Overtime is added or removed'},
    {id: 'weekly-hours-risk', label: 'Weekly hours approach the limit'},
    {id: 'location-changed', label: 'Work area or line assignment changes'},
    {id: 'handoff-needed', label: 'A handoff reminder is needed'},
  ],
  suggestion: {
    description: 'Suggested: notify for shift starts, missed punches, break timing, and schedule changes.',
    eventIds: ['shift-starting', 'break-due', 'punch-missed', 'schedule-changed'],
    deliveryIds: ['in-app', 'daily-digest'],
    frequency: 'hourly',
    filters: {status: 'Open'},
    savedRuleName: 'My shift schedule watch',
  },
};

export const shiftScheduleLeaderNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'shift-schedule-leader',
  widgetLabel: 'Shift Schedule Leader',
  events: [
    {id: 'coverage-gap', label: 'Coverage drops below required staffing', defaultSelected: true},
    {id: 'absence-reported', label: 'An absence is reported near shift start', defaultSelected: true},
    {id: 'swap-awaiting-approval', label: 'A shift swap awaits approval', defaultSelected: true},
    {id: 'overtime-risk', label: 'Overtime risk increases', defaultSelected: true},
    {id: 'backup-needed', label: 'A backup operator is recommended'},
    {id: 'skill-gap', label: 'A required skill is missing from coverage'},
    {id: 'availability-changed', label: 'Crew availability changes'},
    {id: 'risk-resolved', label: 'A coverage risk is resolved'},
  ],
  suggestion: {
    description: 'Suggested: notify leaders instantly for coverage gaps, absences, pending swaps, and overtime risk.',
    eventIds: ['coverage-gap', 'absence-reported', 'swap-awaiting-approval', 'overtime-risk', 'backup-needed'],
    deliveryIds: ['in-app', 'email', 'teams'],
    frequency: 'instant',
    filters: {category: 'People', priority: 'High', status: 'Open'},
    savedRuleName: 'Leader coverage risks',
  },
};

export const equipmentChangeoverNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'operator-equipment-changeover',
  widgetLabel: 'Equipment Setup Changeover',
  events: [
    {id: 'changeover-due-soon', label: 'A changeover is due soon', defaultSelected: true},
    {id: 'changeover-start-delayed', label: 'Changeover start is delayed', defaultSelected: true},
    {id: 'line-clearance-pending', label: 'Line clearance is pending', defaultSelected: true},
    {id: 'tooling-missing', label: 'Required tools or equipment are missing'},
    {id: 'centerline-out-of-range', label: 'Post-changeover centerline is out of range'},
    {id: 'execution-over-target', label: 'Execution time exceeds target', defaultSelected: true},
    {id: 'issue-reported', label: 'An issue is reported during changeover'},
    {id: 'changeover-completed', label: 'Changeover is completed'},
  ],
  suggestion: {
    description: 'Suggested: notify for delayed starts, line-clearance blockers, missing tooling, and over-target execution.',
    eventIds: ['changeover-start-delayed', 'line-clearance-pending', 'tooling-missing', 'execution-over-target', 'issue-reported'],
    deliveryIds: ['in-app', 'email'],
    frequency: 'instant',
    filters: {priority: 'High', status: 'Open'},
    savedRuleName: 'Changeover execution risks',
  },
};

export const tierManagementNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'tier-management',
  widgetLabel: 'Tier Management',
  events: [
    {id: 'sqdcp-attention', label: 'An SQDCP topic moves to attention', defaultSelected: true},
    {id: 'high-severity-topic', label: 'A high-severity tier topic is created', defaultSelected: true},
    {id: 'delivery-risk', label: 'Delivery moves below target', defaultSelected: true},
    {id: 'downtime-over-target', label: 'Downtime exceeds target'},
    {id: 'people-coverage-risk', label: 'People coverage risk is detected'},
    {id: 'action-created', label: 'A tier action is created'},
    {id: 'action-overdue', label: 'A tier action becomes overdue', defaultSelected: true},
    {id: 'topic-resolved', label: 'A top tier topic is resolved'},
  ],
  suggestion: {
    description: 'Suggested: notify for high-severity tier topics, delivery risk, coverage risk, and overdue tier actions.',
    eventIds: ['high-severity-topic', 'delivery-risk', 'people-coverage-risk', 'action-overdue'],
    deliveryIds: ['in-app', 'email', 'teams'],
    frequency: 'instant',
    filters: {priority: 'High', status: 'Open'},
    savedRuleName: 'Tier escalation watch',
  },
};

export const shiftLogbookNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'shift-logbook',
  widgetLabel: 'Shift Logbook',
  events: [
    {id: 'entry-created', label: 'A new logbook entry is created', defaultSelected: true},
    {id: 'handoff-note-added', label: 'A handoff note is added', defaultSelected: true},
    {id: 'open-critical-entry', label: 'A critical entry remains open', defaultSelected: true},
    {id: 'maintenance-request', label: 'A maintenance request is logged'},
    {id: 'quality-entry', label: 'A quality entry is logged'},
    {id: 'ai-entry-created', label: 'BLU.AI creates a logbook event'},
    {id: 'status-changed', label: 'Entry status changes'},
    {id: 'comment-added', label: 'A note or comment is added'},
  ],
  suggestion: {
    description: 'Suggested: notify for new handoff notes, critical open entries, and AI-generated events.',
    eventIds: ['entry-created', 'handoff-note-added', 'open-critical-entry', 'ai-entry-created'],
    deliveryIds: ['in-app', 'daily-digest'],
    frequency: 'hourly',
    filters: {status: 'Open'},
    savedRuleName: 'Shift handoff watch',
  },
};

export const myWorkOrdersNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'work-orders',
  widgetLabel: 'My Work Orders',
  events: [
    {id: 'work-order-assigned', label: 'A work order is assigned to me', defaultSelected: true},
    {id: 'work-order-due-soon', label: 'A work order is due soon', defaultSelected: true},
    {id: 'work-order-overdue', label: 'A work order becomes overdue', defaultSelected: true},
    {id: 'priority-escalated', label: 'Priority changes to High or Emergency', defaultSelected: true},
    {id: 'status-changed', label: 'Work order status changes'},
    {id: 'parts-blocker', label: 'Required parts are not available'},
    {id: 'linked-work-created', label: 'A linked work order is created'},
    {id: 'completion-rejected', label: 'Completion is rejected or needs rework'},
  ],
  suggestion: {
    description: 'Suggested: notify for assigned work, overdue WOs, priority escalations, and parts blockers.',
    eventIds: ['work-order-assigned', 'work-order-overdue', 'priority-escalated', 'parts-blocker'],
    deliveryIds: ['in-app', 'email'],
    frequency: 'instant',
    filters: {category: 'Maintenance', priority: 'High', status: 'Open'},
    savedRuleName: 'My maintenance work orders',
  },
};

export const maintenanceBacklogNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'my-maintenance-backlog',
  widgetLabel: 'Maintenance Backlog',
  events: [
    {id: 'new-request', label: 'A new maintenance request is submitted', defaultSelected: true},
    {id: 'request-aging', label: 'A request ages beyond 7 days', defaultSelected: true},
    {id: 'planning-overdue', label: 'A planning work order becomes overdue', defaultSelected: true},
    {id: 'critical-asset-request', label: 'A critical asset receives a request', defaultSelected: true},
    {id: 'missing-parts', label: 'A backlog work order is missing parts'},
    {id: 'priority-escalated', label: 'Priority escalates to High or Emergency'},
    {id: 'request-accepted', label: 'A request is accepted to planning'},
    {id: 'request-rejected', label: 'A request is rejected'},
  ],
  suggestion: {
    description: 'Suggested: notify planners for aging requests, critical assets, overdue planning, and missing parts.',
    eventIds: ['request-aging', 'planning-overdue', 'critical-asset-request', 'missing-parts', 'priority-escalated'],
    deliveryIds: ['in-app', 'email', 'teams'],
    frequency: 'instant',
    filters: {category: 'Maintenance', priority: 'High', status: 'Open'},
    savedRuleName: 'Maintenance backlog risks',
  },
};

export const maintenanceHubNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'maintenance-hub',
  widgetLabel: 'Maintenance Hub',
  events: [
    {id: 'open-requests-spike', label: 'Open maintenance requests increase', defaultSelected: true},
    {id: 'overdue-work-orders', label: 'Overdue work orders are detected', defaultSelected: true},
    {id: 'breakdown-reported', label: 'A breakdown is reported', defaultSelected: true},
    {id: 'pm-overdue', label: 'A preventive maintenance item becomes overdue'},
    {id: 'waiting-assignment', label: 'Work orders wait for assignment'},
    {id: 'old-request', label: 'A request remains open beyond 7 days'},
    {id: 'followup-risk', label: 'Follow-up board risk increases'},
    {id: 'risk-resolved', label: 'A maintenance risk is resolved'},
  ],
  suggestion: {
    description: 'Suggested: notify for overdue WOs, new breakdowns, PM overdue items, and aging requests.',
    eventIds: ['overdue-work-orders', 'breakdown-reported', 'pm-overdue', 'old-request'],
    deliveryIds: ['in-app', 'email'],
    frequency: 'instant',
    filters: {category: 'Maintenance', priority: 'High', status: 'Open'},
    savedRuleName: 'Maintenance hub exceptions',
  },
};

export const maintenancePlannerNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'maintenance-planner',
  widgetLabel: 'Maintenance Planner',
  events: [
    {id: 'planning-queue-grows', label: 'Planning queue grows above target', defaultSelected: true},
    {id: 'ready-to-schedule', label: 'Work orders are ready to schedule', defaultSelected: true},
    {id: 'capacity-risk', label: 'Labor capacity risk appears', defaultSelected: true},
    {id: 'parts-readiness-risk', label: 'Parts readiness drops below target', defaultSelected: true},
    {id: 'pm-due-next-week', label: 'Preventive maintenance is due next week'},
    {id: 'technician-unassigned', label: 'A work order is waiting for technician assignment'},
    {id: 'schedule-conflict', label: 'A schedule conflict is detected'},
    {id: 'plan-released', label: 'A maintenance plan is released'},
  ],
  suggestion: {
    description: 'Suggested: notify for capacity risk, missing parts, ready-to-schedule WOs, and unassigned work.',
    eventIds: ['capacity-risk', 'parts-readiness-risk', 'ready-to-schedule', 'technician-unassigned'],
    deliveryIds: ['in-app', 'email', 'teams'],
    frequency: 'instant',
    filters: {category: 'Maintenance', priority: 'High', status: 'Open'},
    savedRuleName: 'Planner execution risks',
  },
};

export const maintenanceCalendarNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'maintenance-calendarwidget',
  widgetLabel: 'Maintenance Calendar',
  events: [
    {id: 'work-due-today', label: 'Maintenance work is due today', defaultSelected: true},
    {id: 'schedule-changed', label: 'A maintenance schedule changes', defaultSelected: true},
    {id: 'assigned-to-me', label: 'A scheduled work order is assigned to me', defaultSelected: true},
    {id: 'pm-window-risk', label: 'A PM window is at risk', defaultSelected: true},
    {id: 'shutdown-added', label: 'A shutdown or changeover is added'},
    {id: 'calendar-overload', label: 'A day becomes overloaded'},
    {id: 'work-missed', label: 'Scheduled work is missed'},
    {id: 'scope-filter-match', label: 'A calendar item matches my schedule'},
  ],
  suggestion: {
    description: 'Suggested: notify for work due today, schedule changes, assigned WOs, and PM window risk.',
    eventIds: ['work-due-today', 'schedule-changed', 'assigned-to-me', 'pm-window-risk'],
    deliveryIds: ['in-app', 'daily-digest'],
    frequency: 'hourly',
    filters: {category: 'Maintenance', status: 'Open'},
    savedRuleName: 'Maintenance calendar watch',
  },
};

export const threeDViewNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'three-d-view',
  widgetLabel: '3D View Component',
  events: [
    {id: 'critical-part-focus', label: 'A critical equipment part becomes the 3D focus', defaultSelected: true},
    {id: 'equipment-status-risk', label: 'Equipment status changes in the 3D view', defaultSelected: true},
    {id: 'work-order-linked', label: 'A work order is linked to the selected 3D part', defaultSelected: true},
    {id: 'restart-check-open', label: 'A restart or HMI check is open', defaultSelected: true},
    {id: 'spare-part-risk', label: 'A spare part risk is tied to the selected part'},
    {id: 'camera-gate-watch', label: 'Vision or QA gate enters watch status'},
    {id: 'component-recovers', label: 'A selected equipment part returns to nominal status'},
  ],
  suggestion: {
    description: 'Suggested: notify for critical part focus, equipment status changes, linked work orders, and restart checks.',
    eventIds: ['critical-part-focus', 'equipment-status-risk', 'work-order-linked', 'restart-check-open'],
    deliveryIds: ['in-app', 'email'],
    frequency: 'instant',
    filters: {priority: 'High', category: 'Maintenance', status: 'Open'},
    savedRuleName: 'Logbook 3D equipment focus',
  },
};

export const equipmentStatusNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'equipment-status',
  widgetLabel: 'Equipment Status',
  events: [
    {id: 'equipment-down', label: 'Equipment goes down', defaultSelected: true},
    {id: 'critical-condition', label: 'Equipment enters critical condition', defaultSelected: true},
    {id: 'blocked-status', label: 'Equipment becomes blocked', defaultSelected: true},
    {id: 'downtime-threshold', label: 'Downtime exceeds the threshold', defaultSelected: true},
    {id: 'availability-drop', label: 'Availability drops below target'},
    {id: 'oee-drop', label: 'Equipment OEE drops below target'},
    {id: 'status-change', label: 'Equipment status changes'},
    {id: 'maintenance-started', label: 'Equipment enters maintenance'},
  ],
  suggestion: {
    description: 'Suggested: notify for equipment down, blocked assets, critical condition, and downtime threshold.',
    eventIds: ['equipment-down', 'critical-condition', 'blocked-status', 'downtime-threshold'],
    deliveryIds: ['in-app', 'email', 'teams'],
    frequency: 'instant',
    filters: {category: 'Maintenance', priority: 'High', status: 'Open'},
    savedRuleName: 'Equipment status exceptions',
  },
};

export const maintenanceAnalyticsNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'maintenance-analytics',
  widgetLabel: 'Maintenance Analytics',
  events: [
    {id: 'mttr-worsens', label: 'MTTR worsens beyond target', defaultSelected: true},
    {id: 'mtbf-drops', label: 'MTBF drops below target', defaultSelected: true},
    {id: 'pm-compliance-low', label: 'PM compliance drops below target', defaultSelected: true},
    {id: 'emergency-work-spike', label: 'Emergency work percentage spikes', defaultSelected: true},
    {id: 'availability-low', label: 'Equipment availability drops'},
    {id: 'metric-owner-needed', label: 'A KPI needs owner action'},
    {id: 'trend-worsens', label: 'A reliability trend worsens'},
    {id: 'target-recovered', label: 'A maintenance KPI recovers to target'},
  ],
  suggestion: {
    description: 'Suggested: notify for PM compliance drops, MTTR/MTBF exceptions, and emergency work spikes.',
    eventIds: ['pm-compliance-low', 'mttr-worsens', 'mtbf-drops', 'emergency-work-spike'],
    deliveryIds: ['in-app', 'email'],
    frequency: 'hourly',
    filters: {category: 'Maintenance', priority: 'High'},
    savedRuleName: 'Maintenance KPI exceptions',
  },
};

export const maintenanceCbmPdmNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'maintenance-cbm-pdm',
  widgetLabel: 'CBM & PdM',
  events: [
    {id: 'critical-sensor-deviation', label: 'A critical sensor deviation is detected', defaultSelected: true},
    {id: 'failure-probability-high', label: 'Failure probability becomes high', defaultSelected: true},
    {id: 'active-failure', label: 'An active failure is detected', defaultSelected: true},
    {id: 'urgent-mr-wo', label: 'An urgent MR or WO is created', defaultSelected: true},
    {id: 'alert-without-wo', label: 'A sensor alert has no work order'},
    {id: 'ettf-short', label: 'Estimated time to failure is under 72h'},
    {id: 'asset-risk-increases', label: 'Asset risk increases'},
    {id: 'condition-normalized', label: 'Condition returns to normal'},
  ],
  suggestion: {
    description: 'Suggested: notify instantly for critical deviations, high failure probability, active failures, and urgent MRs/WOs.',
    eventIds: ['critical-sensor-deviation', 'failure-probability-high', 'active-failure', 'urgent-mr-wo', 'ettf-short'],
    deliveryIds: ['in-app', 'email', 'teams'],
    frequency: 'instant',
    filters: {category: 'Maintenance', priority: 'High', status: 'Open'},
    savedRuleName: 'CBM PdM critical alerts',
  },
};

export const sparePartsMonitorNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'spare-parts-monitor',
  widgetLabel: 'Spare Parts Monitor',
  events: [
    {id: 'missing-parts-request', label: 'A maintenance request is missing parts', defaultSelected: true},
    {id: 'pm-at-risk', label: 'A PM becomes at risk due to parts', defaultSelected: true},
    {id: 'safety-stock-alert', label: 'Safety stock drops below minimum', defaultSelected: true},
    {id: 'reservation-pending', label: 'A reservation is pending before execution'},
    {id: 'po-pending', label: 'A purchase order is pending for critical work'},
    {id: 'part-out-of-stock', label: 'A required part goes out of stock', defaultSelected: true},
    {id: 'transfer-requested', label: 'A transfer is requested for required parts'},
    {id: 'parts-ready', label: 'Parts become ready for pickup'},
  ],
  suggestion: {
    description: 'Suggested: notify for missing parts, PMs at risk, out-of-stock items, and safety stock alerts.',
    eventIds: ['missing-parts-request', 'pm-at-risk', 'part-out-of-stock', 'safety-stock-alert'],
    deliveryIds: ['in-app', 'email'],
    frequency: 'instant',
    filters: {category: 'Maintenance', priority: 'High', status: 'Open'},
    savedRuleName: 'Spare parts execution risks',
  },
};

export const costNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'cost',
  widgetLabel: 'Cost',
  events: [
    {id: 'scrap-threshold', label: 'Scrap crosses the threshold', defaultSelected: true},
    {id: 'downtime-threshold', label: 'Downtime crosses the threshold', defaultSelected: true},
    {id: 'hourly-miss', label: 'Hourly cost misses target'},
    {id: 'daily-miss', label: 'Daily cost misses target'},
    {id: 'monthly-miss', label: 'Monthly cost misses target'},
    {id: 'scrap-spike', label: 'Scrap spikes versus prior period'},
    {id: 'downtime-spike', label: 'Downtime spikes versus prior period'},
    {id: 'cost-recovered', label: 'Cost recovers back into target'},
  ],
  suggestion: {
    description: 'Suggested: notify when scrap or downtime cost moves outside the target band.',
    eventIds: ['scrap-threshold', 'downtime-threshold', 'scrap-spike'],
    deliveryIds: ['in-app', 'email'],
    frequency: 'instant',
    filters: {category: 'Cost'},
    savedRuleName: 'Cost exceptions',
  },
};

export const peopleNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'people',
  widgetLabel: 'People',
  events: [
    {id: 'absence-threshold', label: 'Absences cross threshold', defaultSelected: true},
    {id: 'shift-risk', label: 'A shift becomes at risk', defaultSelected: true},
    {id: 'medical-leave', label: 'A medical leave is opened'},
    {id: 'overtime-spike', label: 'Overtime demand spikes'},
    {id: 'vacation-conflict', label: 'Vacation coverage becomes tight'},
    {id: 'days-off-overlap', label: 'Too many days off overlap'},
    {id: 'team-recovered', label: 'Staffing returns to target'},
    {id: 'people-threshold', label: 'People KPI crosses a threshold'},
  ],
  suggestion: {
    description: 'Suggested: notify for shift risk, absence spikes, and new medical leaves.',
    eventIds: ['absence-threshold', 'shift-risk', 'medical-leave'],
    deliveryIds: ['in-app', 'daily-digest'],
    frequency: 'hourly',
    filters: {category: 'People'},
    savedRuleName: 'Staffing watch',
  },
};

export const deliveryNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'delivery',
  widgetLabel: 'Delivery',
  events: [
    {id: 'oee-threshold', label: 'OEE crosses the threshold', defaultSelected: true},
    {id: 'target-missed', label: 'Delivery misses target', defaultSelected: true},
    {id: 'order-risk', label: 'Production order is at risk', defaultSelected: true},
    {id: 'line-underperforming', label: 'A line underperforms versus target'},
    {id: 'throughput-drop', label: 'Throughput drops versus prior period'},
    {id: 'recovery-achieved', label: 'Delivery recovers back into target'},
    {id: 'shipment-delay', label: 'Shipment is delayed'},
    {id: 'plan-updated', label: 'Delivery plan is updated'},
  ],
  suggestion: {
    description: 'Suggested: notify for at-risk orders, target misses, and persistent low OEE by line.',
    eventIds: ['oee-threshold', 'target-missed', 'order-risk', 'line-underperforming'],
    deliveryIds: ['in-app', 'email'],
    frequency: 'instant',
    filters: {category: 'Delivery'},
    savedRuleName: 'Delivery watch',
  },
};

export const safetyNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'safety',
  widgetLabel: 'Safety',
  events: [
    {id: 'serious-injury', label: 'Serious injury is logged', defaultSelected: true},
    {id: 'minor-injury-spike', label: 'Minor injury count crosses target'},
    {id: 'near-miss-logged', label: 'Near miss is logged', defaultSelected: true},
    {id: 'fatality-alert', label: 'Fatality alert is created', defaultSelected: true},
    {id: 'incident-streak-reset', label: 'Days without incident are reset'},
    {id: 'safety-threshold', label: 'Safety KPI crosses a threshold'},
    {id: 'safety-recovered', label: 'Safety KPI returns to target'},
    {id: 'record-streak-hit', label: 'Record streak is reached'},
  ],
  suggestion: {
    description: 'Suggested: notify instantly for serious injuries, fatality alerts, and near misses.',
    eventIds: ['serious-injury', 'fatality-alert', 'near-miss-logged', 'incident-streak-reset'],
    deliveryIds: ['in-app', 'email', 'teams'],
    frequency: 'instant',
    filters: {category: 'Safety', priority: 'High'},
    savedRuleName: 'Safety criticals',
  },
};

export const qualityNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'quality',
  widgetLabel: 'Quality',
  events: [
    {id: 'field-action', label: 'Field action is created', defaultSelected: true},
    {id: 'complaint-opened', label: 'Complaint is opened', defaultSelected: true},
    {id: 'nc-created', label: 'NC is created'},
    {id: 'capa-overdue', label: 'CAPA becomes overdue', defaultSelected: true},
    {id: 'days-without-issues-reset', label: 'Days without issues are reset'},
    {id: 'quality-threshold', label: 'Quality KPI crosses a threshold'},
    {id: 'quality-recovered', label: 'Quality KPI returns to target'},
    {id: 'record-streak-hit', label: 'Record quality streak is reached'},
  ],
  suggestion: {
    description: 'Suggested: notify for complaints, overdue CAPAs, and resets in the issue-free streak.',
    eventIds: ['complaint-opened', 'capa-overdue', 'days-without-issues-reset'],
    deliveryIds: ['in-app', 'email'],
    frequency: 'instant',
    filters: {category: 'Quality'},
    savedRuleName: 'Quality escalations',
  },
};

export const linePerformanceNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'line-performance',
  widgetLabel: 'Line Performance',
  events: [
    {id: 'oee-below-target', label: 'OEE drops below target', defaultSelected: true},
    {id: 'throughput-missed', label: 'Throughput misses target', defaultSelected: true},
    {id: 'downtime-spike', label: 'Downtime spikes above threshold', defaultSelected: true},
    {id: 'scrap-spike', label: 'Scrap rises above baseline'},
    {id: 'trend-worsens', label: 'Performance trend worsens'},
    {id: 'line-recovered', label: 'Line recovers to target'},
    {id: 'constraint-detected', label: 'Constraint is detected'},
    {id: 'threshold-crossed', label: 'A KPI crosses a threshold'},
  ],
  suggestion: {
    description: 'Suggested: notify for OEE drops, downtime spikes, and missed throughput targets.',
    eventIds: ['oee-below-target', 'downtime-spike', 'throughput-missed'],
    deliveryIds: ['in-app', 'email'],
    frequency: 'instant',
    filters: {category: 'Delivery', priority: 'High'},
    savedRuleName: 'Line performance watch',
  },
};

export const topDowntimeCausesNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'top-downtime-causes',
  widgetLabel: 'Top Downtime Causes',
  events: [
    {id: 'downtime-threshold', label: 'Downtime exceeds the threshold', defaultSelected: true},
    {id: 'downtime-cause-recurs', label: 'A downtime cause recurs repeatedly', defaultSelected: true},
    {id: 'critical-line-loss', label: 'Critical line loss is detected', defaultSelected: true},
    {id: 'unplanned-stop', label: 'An unplanned stop is logged'},
    {id: 'downtime-trend-worsens', label: 'Downtime trend worsens'},
    {id: 'cause-owner-needed', label: 'A cause requires owner action'},
    {id: 'target-recovered', label: 'Downtime returns to target'},
    {id: 'threshold-crossed', label: 'A downtime KPI crosses a threshold'},
  ],
  suggestion: {
    description: 'Suggested: notify for critical downtime spikes, recurring causes, and unplanned stops.',
    eventIds: ['downtime-threshold', 'downtime-cause-recurs', 'critical-line-loss'],
    deliveryIds: ['in-app', 'email'],
    frequency: 'instant',
    filters: {category: 'Cost', priority: 'High'},
    savedRuleName: 'Downtime critical watch',
  },
};

export const assetHealthNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'asset-health',
  widgetLabel: 'Asset Health',
  events: [
    {id: 'health-score-low', label: 'Health score drops below threshold', defaultSelected: true},
    {id: 'critical-condition', label: 'Asset enters critical condition', defaultSelected: true},
    {id: 'failure-risk-high', label: 'Failure risk becomes high', defaultSelected: true},
    {id: 'sensor-alert', label: 'A sensor alert is triggered'},
    {id: 'asset-blocked', label: 'Asset becomes blocked'},
    {id: 'trend-worsens', label: 'Asset trend worsens'},
    {id: 'maintenance-recommended', label: 'Maintenance is recommended'},
    {id: 'condition-normalized', label: 'Condition returns to normal'},
  ],
  suggestion: {
    description: 'Suggested: notify for low health scores, critical conditions, and rising failure risk.',
    eventIds: ['health-score-low', 'critical-condition', 'failure-risk-high'],
    deliveryIds: ['in-app', 'email', 'teams'],
    frequency: 'instant',
    filters: {category: 'Maintenance', priority: 'High'},
    savedRuleName: 'Asset health watch',
  },
};

export const shiftQualitySnapshotNotificationConfig: WidgetNotificationConfig = {
  widgetId: 'shift-quality-snapshot',
  widgetLabel: 'Shift Quality Snapshot',
  events: [
    {id: 'scrap-threshold', label: 'Scrap exceeds the threshold', defaultSelected: true},
    {id: 'defect-spike', label: 'Defects spike above baseline', defaultSelected: true},
    {id: 'quality-alert', label: 'A quality alert is generated', defaultSelected: true},
    {id: 'nc-created', label: 'A non-conformance is created'},
    {id: 'hold-opened', label: 'A material hold is opened'},
    {id: 'trend-worsens', label: 'Quality trend worsens'},
    {id: 'target-recovered', label: 'Quality returns to target'},
    {id: 'threshold-crossed', label: 'A quality KPI crosses a threshold'},
  ],
  suggestion: {
    description: 'Suggested: notify for scrap spikes, quality alerts, and new non-conformances.',
    eventIds: ['scrap-threshold', 'defect-spike', 'quality-alert'],
    deliveryIds: ['in-app', 'email'],
    frequency: 'hourly',
    filters: {category: 'Quality', priority: 'High'},
    savedRuleName: 'Shift quality watch',
  },
};

export const widgetNotificationConfigs: WidgetNotificationConfig[] = [
  actionTrackerNotificationConfig,
  myEsoNotificationConfig,
  myEsosNotificationConfig,
  lossFocusedKpisNotificationConfig,
  myTasksNotificationConfig,
  cilCenterlineNotificationConfig,
  shiftScheduleNotificationConfig,
  shiftScheduleLeaderNotificationConfig,
  equipmentChangeoverNotificationConfig,
  tierManagementNotificationConfig,
  shiftLogbookNotificationConfig,
  myWorkOrdersNotificationConfig,
  maintenanceBacklogNotificationConfig,
  maintenanceHubNotificationConfig,
  maintenancePlannerNotificationConfig,
  maintenanceCalendarNotificationConfig,
  threeDViewNotificationConfig,
  equipmentStatusNotificationConfig,
  maintenanceAnalyticsNotificationConfig,
  maintenanceCbmPdmNotificationConfig,
  sparePartsMonitorNotificationConfig,
  costNotificationConfig,
  peopleNotificationConfig,
  deliveryNotificationConfig,
  safetyNotificationConfig,
  qualityNotificationConfig,
  linePerformanceNotificationConfig,
  topDowntimeCausesNotificationConfig,
  assetHealthNotificationConfig,
  shiftQualitySnapshotNotificationConfig,
];

export function getWidgetNotificationConfigById(widgetId: string) {
  return widgetNotificationConfigs.find((config) => config.widgetId === widgetId);
}

export function getWidgetNotificationConfigByLabel(widgetLabel: string) {
  return widgetNotificationConfigs.find((config) => config.widgetLabel === widgetLabel);
}

export function formatWidgetNotificationFrequency(frequency: WidgetNotificationFrequencyId) {
  return frequencyOptions.find((option) => option.id === frequency)?.label ?? frequency;
}

export function summarizeWidgetNotificationTrigger(config: WidgetNotificationConfig, state: WidgetNotificationState) {
  const labels = config.events
    .filter((event) => state.selectedEventIds.includes(event.id))
    .map((event) => event.label);
  return labels.length > 0 ? labels.slice(0, 2).join(', ') : 'No trigger selected';
}

export function summarizeWidgetNotificationScope(filters: WidgetNotificationState['filters']) {
  const activeFilters = Object.entries(filters).filter(([, value]) => !value.startsWith('All '));
  return activeFilters.length > 0
    ? activeFilters.map(([, value]) => value).join(' / ')
    : 'All contexts';
}
