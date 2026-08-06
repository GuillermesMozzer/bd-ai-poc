import React from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  CalendarMonthOutlined as CalendarIcon,
  CheckCircleOutline as SuccessIcon,
  Close as CloseIcon,
  DeleteOutline as DeleteIcon,
  EditOutlined as EditIcon,
  ErrorOutline as CriticalIcon,
  HourglassEmpty as PendingIcon,
  InfoOutlined as InfoIcon,
  OpenInNew as OpenInNewIcon,
  PersonOutline as PersonIcon,
  PauseCircleOutline as PauseIcon,
  PlayCircleOutline as ResumeIcon,
  Search as SearchIcon,
  WarningAmber as WarningIcon,
  WidgetsOutlined as WidgetIcon,
} from '@mui/icons-material';
import { useNotificationContext } from '../contexts/NotificationContext';
import type { CustomNotificationRule, NotificationAlert } from '../types';
import {
  WidgetNotificationsDialog,
  widgetNotificationConfigs,
} from '../../workstation/components/WidgetNotifications';
import {
  tokenBrand,
  tokenCommon,
  tokenDivider,
  tokenError,
  tokenInfo,
  tokenNeutral,
  tokenSuccess,
  tokenText,
  tokenWarning,
} from '../../workstation/theme';

const severityConfig = {
  success: {
    bg: tokenSuccess.softBg,
    border: tokenSuccess.lightest,
    color: tokenSuccess.dark,
    icon: <SuccessIcon sx={{ color: tokenSuccess.dark, fontSize: 16 }} />,
  },
  warning: {
    bg: tokenWarning.softBg,
    border: tokenWarning.lightest,
    color: tokenWarning.dark,
    icon: <WarningIcon sx={{ color: tokenWarning.dark, fontSize: 16 }} />,
  },
  critical: {
    bg: tokenError.softBg,
    border: tokenError.lightest,
    color: tokenError.dark,
    icon: <CriticalIcon sx={{ color: tokenError.dark, fontSize: 16 }} />,
  },
  info: {
    bg: tokenInfo.softBg,
    border: tokenInfo.lightest,
    color: tokenInfo.dark,
    icon: <InfoIcon sx={{ color: tokenInfo.dark, fontSize: 16 }} />,
  },
} as const;

const priorityToneByLevel = {
  High: { bg: tokenError.softBg, text: tokenError.dark, border: tokenError.lightest },
  Medium: { bg: tokenWarning.softBg, text: tokenWarning.dark, border: tokenWarning.lightest },
  Low: { bg: tokenInfo.softBg, text: tokenInfo.dark, border: tokenInfo.lightest },
} as const;

const statusToneByLevel = {
  New: { bg: tokenBrand.softBg, text: tokenBrand.dark, border: tokenBrand.lightest },
  Pending: { bg: tokenWarning.softBg, text: tokenWarning.dark, border: tokenWarning.lightest },
  Approved: { bg: tokenSuccess.softBg, text: tokenSuccess.dark, border: tokenSuccess.lightest },
  Rejected: { bg: tokenError.softBg, text: tokenError.dark, border: tokenError.lightest },
  Overdue: { bg: tokenError.softBg, text: tokenError.dark, border: tokenError.lightest },
  Scheduled: { bg: tokenInfo.softBg, text: tokenInfo.dark, border: tokenInfo.lightest },
  'In Progress': { bg: tokenInfo.softBg, text: tokenInfo.dark, border: tokenInfo.lightest },
  Acknowledged: { bg: tokenNeutral.lightest, text: tokenText.secondary, border: tokenDivider },
} as const;

const pageSectionBorder = `1px solid ${tokenDivider}`;

const compactFieldSx = {
  minWidth: 0,
  '& .MuiOutlinedInput-root': {
    height: 28,
    minHeight: 28,
    borderRadius: '6px',
    bgcolor: tokenCommon.white,
    fontSize: '0.7rem',
    fontWeight: 500,
    color: tokenText.primary,
    boxShadow: 'none',
    '& fieldset': {
      borderColor: tokenDivider,
    },
    '&:hover fieldset': {
      borderColor: tokenNeutral.dark,
    },
    '&.Mui-focused fieldset': {
      borderColor: tokenBrand.main,
      borderWidth: '1px',
    },
    '& .MuiSelect-select': {
      minHeight: 'unset',
      display: 'flex',
      alignItems: 'center',
      py: 0,
      px: 0.8,
    },
    '& input': {
      paddingTop: '0',
      paddingBottom: '0',
      paddingLeft: '0',
      fontSize: '0.7rem',
      lineHeight: '28px',
    },
  },
  '& .MuiInputBase-input::placeholder': {
    fontSize: '0.7rem',
    opacity: 1,
    color: tokenText.disabled,
  },
  '& .MuiSvgIcon-root': {
    fontSize: 14,
    color: tokenText.secondary,
  },
} as const;

const chipSx = {
  height: 18,
  borderRadius: '999px',
  fontWeight: 700,
  fontSize: '0.64rem',
  '& .MuiChip-label': {
    px: 0.75,
  },
} as const;

const actionButtonSx = {
  minHeight: 26,
  borderRadius: '6px',
  textTransform: 'none',
  fontSize: '0.72rem',
  fontWeight: 600,
  px: 0.9,
  boxShadow: 'none',
} as const;

const renderEmptyState = (copy: string) => (
  <Box
    sx={{
      py: 5,
      px: 2,
      border: pageSectionBorder,
      borderRadius: '12px',
      textAlign: 'center',
      bgcolor: 'background.paper',
    }}
  >
    <Typography sx={{ color: tokenText.secondary, fontSize: '0.82rem', fontWeight: 500 }}>
      {copy}
    </Typography>
  </Box>
);

const normalize = (value: string) => value.toLowerCase();
const getAlertSourceDisplay = (alert: NotificationAlert) => alert.sourceLabel ?? alert.source;

const getWorkflowActionLabel = (alert: NotificationAlert) => {
  const source = normalize(alert.source);
  const category = normalize(alert.category);
  const title = normalize(alert.title);
  const message = normalize(alert.message);

  if (source.includes('shift')) {
    return 'Open Shift Schedule';
  }

  if (source.includes('maintenance')) {
    if (category.includes('preventive')) return 'Open Maintenance';
    if (category.includes('work order')) return 'Open Work Order';
    return 'Open Maintenance';
  }

  if (source.includes('eso')) return 'Open ESO';
  if (source.includes('training')) return 'Open Training';
  if (source.includes('action')) return 'Open Action Tracker';
  if (source.includes('custom')) return 'Open Workstation';
  if (source.includes('quality')) return 'Open Team Management';

  return alert.workflowLabel;
};

const buildPrimaryMetadata = (alert: NotificationAlert) => {
  const metadata = [
    { label: 'Status', value: alert.status },
    { label: 'Priority', value: alert.priority },
    { label: 'Source module', value: alert.sourceLabel ?? alert.source },
    { label: 'Date', value: new Date(alert.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
  ];

  if (alert.owner) {
    metadata.push({ label: 'Assigned by', value: alert.owner });
  }

  if (alert.assignee) {
    metadata.push({ label: 'Assigned to', value: alert.assignee });
  }

  if (alert.line && alert.source !== 'Training') {
    metadata.push({ label: 'Line / area', value: `${alert.line} • ${alert.location}` });
  } else if (alert.location) {
    metadata.push({ label: 'Location', value: alert.location });
  }

  return metadata.slice(0, 6);
};

const getRelevantDetails = (alert: NotificationAlert) => {
  const category = normalize(alert.category);
  const source = normalize(alert.source);

  if (source.includes('shift')) {
    return alert.details.filter((detail) => ['shift date', 'shift', 'crew', 'line / area'].includes(normalize(detail.label))).slice(0, 3);
  }

  if (source.includes('maintenance')) {
    return alert.details.filter((detail) => ['work order', 'asset', 'location'].includes(normalize(detail.label))).slice(0, 3);
  }

  if (source.includes('training')) {
    return alert.details.filter((detail) => ['location', 'related workflow'].includes(normalize(detail.label))).slice(0, 2);
  }

  if (source.includes('custom')) {
    return alert.details.filter((detail) => ['triggered condition', 'related widget', 'scope'].includes(normalize(detail.label))).slice(0, 3);
  }

  if (source.includes('quality') || category.includes('coverage')) {
    return alert.details.filter((detail) => ['location', 'related workflow'].includes(normalize(detail.label))).slice(0, 2);
  }

  return alert.details.slice(0, 2);
};

function KpiCard({
  label,
  note,
  tone,
  value,
}: {
  label: string;
  note: string;
  tone: { accent: string; bg: string };
  value: number;
}) {
  return (
    <Box
      sx={{
        minWidth: 0,
        px: 1.2,
        py: 1,
        border: pageSectionBorder,
        borderRadius: '12px',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ width: 18, height: 3, borderRadius: '999px', bgcolor: tone.accent, mb: 0.75 }} />
      <Typography sx={{ color: tokenText.secondary, fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </Typography>
      <Typography sx={{ mt: 0.25, color: tokenText.primary, fontSize: '1.35rem', lineHeight: 1, fontWeight: 700 }}>
        {value}
      </Typography>
      <Typography sx={{ mt: 0.55, color: tokenText.secondary, fontSize: '0.72rem', fontWeight: 500, lineHeight: 1.35 }}>
        {note}
      </Typography>
    </Box>
  );
}

function ConfigurationRuleRow({
  rule,
  onDelete,
  onEdit,
  onToggleStatus,
}: {
  rule: CustomNotificationRule;
  onDelete: (ruleId: string) => void;
  onEdit: (ruleId: string) => void;
  onToggleStatus: (ruleId: string) => void;
}) {
  const statusTone = rule.status === 'Active'
    ? { bg: tokenSuccess.softBg, text: tokenSuccess.dark, border: tokenSuccess.lightest }
    : { bg: tokenNeutral.lightest, text: tokenText.secondary, border: tokenDivider };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', xl: '1.4fr 1fr 1fr 0.85fr 0.85fr 0.7fr 0.9fr 0.9fr 1fr' },
        gap: 1,
        px: 1.25,
        py: 1,
        borderBottom: pageSectionBorder,
        alignItems: 'center',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ color: tokenText.primary, fontSize: '0.78rem', fontWeight: 600 }} noWrap>
          {rule.name}
        </Typography>
        <Stack direction="row" spacing={0.45} alignItems="center" sx={{ mt: 0.25 }}>
          <WidgetIcon sx={{ fontSize: 13, color: tokenText.secondary }} />
          <Typography sx={{ color: tokenText.secondary, fontSize: '0.68rem', fontWeight: 500 }} noWrap>
            {rule.sourceWidget}
          </Typography>
        </Stack>
      </Box>
      <Typography sx={{ color: tokenText.primary, fontSize: '0.72rem', fontWeight: 500 }} noWrap>{rule.sourceWidget}</Typography>
      <Typography sx={{ color: tokenText.primary, fontSize: '0.72rem', fontWeight: 500 }} noWrap>{rule.triggerCondition}</Typography>
      <Typography sx={{ color: tokenText.primary, fontSize: '0.72rem', fontWeight: 500 }} noWrap>{rule.scope}</Typography>
      <Typography sx={{ color: tokenText.primary, fontSize: '0.72rem', fontWeight: 500 }} noWrap>{rule.frequency}</Typography>
      <Chip size="small" label={rule.status} sx={{ ...chipSx, bgcolor: statusTone.bg, color: statusTone.text, border: `1px solid ${statusTone.border}`, width: 'fit-content' }} />
      <Typography sx={{ color: tokenText.secondary, fontSize: '0.7rem', fontWeight: 500 }} noWrap>{rule.createdDate}</Typography>
      <Typography sx={{ color: tokenText.secondary, fontSize: '0.7rem', fontWeight: 500 }} noWrap>{rule.lastTriggered}</Typography>
      <Stack direction="row" spacing={0.45} justifyContent={{ xs: 'flex-start', xl: 'flex-end' }} flexWrap="wrap" useFlexGap>
        <Button
          variant="text"
          startIcon={<EditIcon sx={{ fontSize: 14 }} />}
          onClick={() => onEdit(rule.id)}
          sx={{ ...actionButtonSx, color: tokenBrand.main }}
        >
          Edit
        </Button>
        <Button
          variant="text"
          startIcon={rule.status === 'Active' ? <PauseIcon sx={{ fontSize: 14 }} /> : <ResumeIcon sx={{ fontSize: 14 }} />}
          onClick={() => onToggleStatus(rule.id)}
          sx={{ ...actionButtonSx, color: tokenText.secondary }}
        >
          {rule.status === 'Active' ? 'Pause' : 'Resume'}
        </Button>
        <Button
          variant="text"
          startIcon={<DeleteIcon sx={{ fontSize: 14 }} />}
          onClick={() => onDelete(rule.id)}
          sx={{ ...actionButtonSx, color: tokenError.dark }}
        >
          Delete
        </Button>
      </Stack>
    </Box>
  );
}

function NotificationRow({
  alert,
  formatAlertTime,
  isSelected,
  onClick,
}: {
  alert: NotificationAlert;
  formatAlertTime: (createdAt: string) => string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const severity = severityConfig[alert.severity];
  const priorityTone = priorityToneByLevel[alert.priority];
  const statusTone = statusToneByLevel[alert.status];

  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      sx={{
        borderBottom: pageSectionBorder,
        px: 1.25,
        py: 0.95,
        cursor: 'pointer',
        bgcolor: isSelected ? tokenBrand.softBg : 'background.paper',
        transition: 'background-color 0.18s ease',
        '&:hover': {
          bgcolor: isSelected ? tokenBrand.softBg : tokenNeutral.lightest,
        },
      }}
    >
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '8px',
            bgcolor: severity.bg,
            border: `1px solid ${severity.border}`,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          {severity.icon}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={0.75}
            justifyContent="space-between"
            alignItems={{ lg: 'flex-start' }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ color: tokenText.primary, fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.35 }} noWrap>
                {alert.title}
              </Typography>
              <Typography sx={{ mt: 0.2, color: tokenText.secondary, fontSize: '0.74rem', fontWeight: 400, lineHeight: 1.35 }} noWrap>
                {alert.message}
              </Typography>
            </Box>
            <Typography sx={{ color: tokenText.secondary, fontSize: '0.7rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
              {formatAlertTime(alert.createdAt)}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 0.65 }}>
            <Typography sx={{ color: tokenText.secondary, fontSize: '0.7rem', fontWeight: 600 }}>
              {getAlertSourceDisplay(alert)}
            </Typography>
            <Typography sx={{ color: tokenText.disabled, fontSize: '0.7rem' }}>
              {alert.reference}
            </Typography>
            <Typography sx={{ color: tokenText.disabled, fontSize: '0.7rem' }}>
              {alert.line}
            </Typography>
            <Chip size="small" label={alert.priority} sx={{ ...chipSx, bgcolor: priorityTone.bg, color: priorityTone.text, border: `1px solid ${priorityTone.border}` }} />
            <Chip size="small" label={alert.status} sx={{ ...chipSx, bgcolor: statusTone.bg, color: statusTone.text, border: `1px solid ${statusTone.border}` }} />
            {alert.assignee ? (
              <Stack direction="row" spacing={0.35} alignItems="center">
                <PersonIcon sx={{ fontSize: 13, color: tokenText.secondary }} />
                <Typography sx={{ color: tokenText.secondary, fontSize: '0.7rem', fontWeight: 500 }}>
                  {alert.assignee}
                </Typography>
              </Stack>
            ) : null}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

function NotificationDetailsPanel({
  alert,
  dismissAlert,
  onClose,
  onOpenWorkflow,
}: {
  alert: NotificationAlert;
  dismissAlert: (alertId: string) => void;
  onClose: () => void;
  onOpenWorkflow: (alert: NotificationAlert) => void;
}) {
  const severity = severityConfig[alert.severity];
  const priorityTone = priorityToneByLevel[alert.priority];
  const statusTone = statusToneByLevel[alert.status];
  const primaryMetadata = buildPrimaryMetadata(alert);
  const relevantDetails = getRelevantDetails(alert);
  const workflowActionLabel = getWorkflowActionLabel(alert);

  return (
    <Box
      sx={{
        position: { lg: 'sticky' },
        top: { lg: 16 },
        alignSelf: 'flex-start',
        borderLeft: { lg: pageSectionBorder },
        bgcolor: 'background.paper',
        width: '100%',
      }}
    >
      <Box sx={{ px: { xs: 1.25, lg: 1.5 }, py: 1.2, borderBottom: pageSectionBorder }}>
        <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="flex-start">
          <Stack direction="row" spacing={0.85} sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: '8px',
                bgcolor: severity.bg,
                border: `1px solid ${severity.border}`,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              {severity.icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: tokenText.primary, fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.35 }}>
                {alert.title}
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.6 }}>
                <Chip size="small" label={getAlertSourceDisplay(alert)} sx={{ ...chipSx, bgcolor: tokenBrand.softBg, color: tokenBrand.dark, border: `1px solid ${tokenBrand.lightest}` }} />
                <Chip size="small" label={alert.priority} sx={{ ...chipSx, bgcolor: priorityTone.bg, color: priorityTone.text, border: `1px solid ${priorityTone.border}` }} />
                <Chip size="small" label={alert.status} sx={{ ...chipSx, bgcolor: statusTone.bg, color: statusTone.text, border: `1px solid ${statusTone.border}` }} />
              </Stack>
            </Box>
          </Stack>
          <Button
            variant="text"
            onClick={onClose}
            sx={{
              minWidth: 28,
              width: 28,
              height: 28,
              p: 0,
              borderRadius: '8px',
              color: tokenText.secondary,
              '&:hover': { bgcolor: tokenNeutral.lightest },
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </Button>
        </Stack>
      </Box>

      <Stack spacing={1} sx={{ px: { xs: 1.25, lg: 1.35 }, py: 1.1, maxHeight: { lg: 'calc(100vh - 180px)' }, overflowY: 'auto' }}>
        <Box>
          <Typography sx={{ color: tokenText.primary, fontSize: '0.78rem', fontWeight: 400, lineHeight: 1.55 }}>
            {alert.message}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 0.9,
          }}
        >
          {primaryMetadata.map((item) => (
            <Box key={`${alert.id}-${item.label}`}>
              <Typography sx={{ color: tokenText.secondary, fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {item.label}
              </Typography>
              <Typography sx={{ mt: 0.18, color: tokenText.primary, fontSize: '0.74rem', fontWeight: 500, lineHeight: 1.4 }}>
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>

        {relevantDetails.length > 0 ? (
          <>
            <Divider sx={{ borderColor: tokenDivider }} />
            <Box>
              <Typography sx={{ color: tokenText.secondary, fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.7 }}>
                Key context
              </Typography>
              <Stack spacing={0.7}>
                {relevantDetails.map((detail) => (
                  <Box key={`${alert.id}-${detail.label}`}>
                    <Typography sx={{ color: tokenText.secondary, fontSize: '0.68rem', fontWeight: 600 }}>
                      {detail.label}
                    </Typography>
                    <Typography sx={{ mt: 0.18, color: tokenText.primary, fontSize: '0.74rem', fontWeight: 500, lineHeight: 1.4 }}>
                      {detail.value}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </>
        ) : null}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.8}>
          <Button
            variant="contained"
            endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
            onClick={() => onOpenWorkflow(alert)}
            sx={{
              ...actionButtonSx,
              bgcolor: tokenBrand.main,
              color: tokenCommon.white,
              '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' },
            }}
          >
            {workflowActionLabel}
          </Button>
          <Button
            variant="outlined"
            onClick={() => dismissAlert(alert.id)}
            sx={{
              ...actionButtonSx,
              color: tokenText.secondary,
              borderColor: tokenDivider,
              '&:hover': { borderColor: tokenBrand.light, bgcolor: tokenBrand.softBg },
            }}
          >
            Dismiss notification
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function NotificationDashboard() {
  const {
    alertFilters,
    alertOrder,
    currentAlertsTab,
    currentTabFilteredAlerts,
    customNotificationRules,
    editingCustomRuleConfig,
    editingCustomRuleDraft,
    editingCustomRuleStatus,
    currentTabKpis,
    deleteCustomNotificationRule,
    dismissAlert,
    filterOptions,
    filteredConfigurationRules,
    formatAlertTime,
    hasMyTeamAccess,
    highlightedTeamAlerts,
    inboxAlerts,
    myTeamAlerts,
    openAlertWorkflow,
    openCustomNotificationRuleEditor,
    closeCustomNotificationRuleEditor,
    applyEditingCustomRuleSuggestion,
    resetCurrentTabFilters,
    saveEditingCustomRule,
    selectedNotificationAlert,
    setAlertOrder,
    setCurrentAlertsTab,
    setEditingCustomRuleDraft,
    setEditingCustomRuleStatus,
    setSelectedNotificationAlertId,
    toggleCustomNotificationRuleStatus,
    updateCurrentTabFilter,
    updateEditingCustomRuleWidget,
  } = useNotificationContext();

  const activeTabCount = currentAlertsTab === 'inbox'
    ? inboxAlerts.length
    : currentAlertsTab === 'team'
      ? myTeamAlerts.length
      : customNotificationRules.length;
  const isTeamView = currentAlertsTab === 'team';
  const isConfigurationsView = currentAlertsTab === 'configurations';

  const kpiCards = isConfigurationsView
    ? [
        { label: 'Custom Rules', value: customNotificationRules.length, note: 'Widget-driven notification configurations', tone: { accent: tokenBrand.main, bg: tokenBrand.softBg } },
        { label: 'Active Rules', value: customNotificationRules.filter((rule) => rule.status === 'Active').length, note: 'Currently evaluating conditions', tone: { accent: tokenSuccess.dark, bg: tokenSuccess.softBg } },
        { label: 'Paused Rules', value: customNotificationRules.filter((rule) => rule.status === 'Paused').length, note: 'Temporarily disabled', tone: { accent: tokenWarning.dark, bg: tokenWarning.softBg } },
        { label: 'Triggered Today', value: customNotificationRules.filter((rule) => rule.lastTriggered.startsWith('Today')).length, note: 'Rules that generated fresh alerts', tone: { accent: tokenInfo.dark, bg: tokenInfo.softBg } },
      ]
    : isTeamView
    ? [
        { label: 'Total Active Alerts', value: currentTabKpis.totalActive, note: 'Filtered team issues', tone: { accent: tokenBrand.main, bg: tokenBrand.softBg } },
        { label: 'Critical Alerts', value: currentTabKpis.criticalAlerts, note: 'Require attention first', tone: { accent: tokenError.main, bg: tokenError.softBg } },
        { label: 'Pending Approvals', value: currentTabKpis.pendingApprovals, note: 'Leader approval queue', tone: { accent: tokenWarning.main, bg: tokenWarning.softBg } },
        { label: 'Shift Swap Requests', value: currentTabKpis.shiftSwapRequests, note: 'Coverage changes in workflow', tone: { accent: tokenInfo.main, bg: tokenInfo.softBg } },
        { label: 'Training Due', value: currentTabKpis.trainingDue, note: 'Upcoming employee readiness', tone: { accent: tokenInfo.dark, bg: tokenInfo.softBg } },
        { label: 'Overdue Maintenance', value: currentTabKpis.overdueMaintenance, note: 'Maintenance blockers', tone: { accent: tokenWarning.dark, bg: tokenWarning.softBg } },
        { label: 'Coverage Gaps', value: currentTabKpis.coverageGaps, note: 'Open staffing risks', tone: { accent: tokenError.dark, bg: tokenError.softBg } },
        { label: 'Time Off Pending', value: currentTabKpis.timeOffPending, note: 'Absence decisions pending', tone: { accent: tokenSuccess.dark, bg: tokenSuccess.softBg } },
      ]
    : [
        { label: 'My Active Alerts', value: currentTabKpis.totalActive, note: 'Assigned to the logged-in employee', tone: { accent: tokenBrand.main, bg: tokenBrand.softBg } },
        { label: 'Critical Alerts', value: currentTabKpis.criticalAlerts, note: 'Escalations and urgent work', tone: { accent: tokenError.main, bg: tokenError.softBg } },
        { label: 'Pending Responses', value: currentTabKpis.pendingApprovals, note: 'Approvals or actions needed', tone: { accent: tokenWarning.main, bg: tokenWarning.softBg } },
        { label: 'Training Due', value: currentTabKpis.trainingDue, note: 'Upcoming learning tasks', tone: { accent: tokenInfo.dark, bg: tokenInfo.softBg } },
      ];

  return (
    <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: tokenNeutral.lighter, p: { xs: 1.5, md: 2 } }}>
      <Stack spacing={1.35}>
        <Box>
          <Typography sx={{ color: tokenText.primary, fontSize: { xs: '1.35rem', md: '1.5rem' }, fontWeight: 700, lineHeight: 1.2 }}>
            Alerts & Notifications
          </Typography>
          <Typography sx={{ mt: 0.3, color: tokenText.secondary, fontSize: '0.78rem', fontWeight: 400, lineHeight: 1.45 }}>
            {isConfigurationsView
              ? 'Manage widget-driven notification rules and monitor the conditions that trigger custom alerts.'
              : isTeamView
                ? 'Leader workspace for approvals, coverage gaps, overdue maintenance, and employee readiness.'
                : 'Personal alert workspace for approvals, assignments, and workflow updates.'}
          </Typography>
        </Box>

        <Box sx={{ borderBottom: pageSectionBorder, pb: 0.85 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ md: 'center' }}>
            <Tabs
              value={currentAlertsTab}
              onChange={(_, value) => setCurrentAlertsTab(value)}
              sx={{
                minHeight: 0,
                '& .MuiTabs-indicator': {
                  backgroundColor: tokenBrand.main,
                  height: 2,
                },
                '& .MuiTab-root': {
                  minHeight: 30,
                  px: 0,
                  mr: 2,
                  textTransform: 'none',
                  color: tokenText.secondary,
                  fontSize: '0.82rem',
                  fontWeight: 600,
                },
                '& .Mui-selected': {
                  color: tokenText.primary,
                  fontWeight: 700,
                },
              }}
            >
              <Tab value="inbox" label="Inbox" />
              <Tab value="team" label="My Team" />
              <Tab value="configurations" label="Configurations" />
            </Tabs>

            <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
              <Chip
                label={`${activeTabCount} active`}
                sx={{
                  ...chipSx,
                  bgcolor: tokenBrand.softBg,
                  color: tokenBrand.dark,
                  border: `1px solid ${tokenBrand.lightest}`,
                }}
              />
              <Chip
                label={isConfigurationsView ? 'Custom Rules' : isTeamView ? 'Leader Dashboard' : 'Assigned To Me'}
                sx={{
                  ...chipSx,
                  bgcolor: 'background.paper',
                  color: tokenText.secondary,
                  border: pageSectionBorder,
                }}
              />
            </Stack>
          </Stack>
        </Box>

        {isTeamView && !hasMyTeamAccess ? (
          renderEmptyState('My Team alerts are available for leaders and supervisors.')
        ) : (
          <Stack spacing={1.1}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' },
                gap: 0.85,
              }}
            >
              {kpiCards.map((card) => (
                <KpiCard key={card.label} {...card} />
              ))}
            </Box>

            {isTeamView && highlightedTeamAlerts.length > 0 ? (
              <Box sx={{ border: pageSectionBorder, borderRadius: '12px', bgcolor: 'background.paper', p: 1 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ md: 'center' }}>
                  <Box>
                    <Typography sx={{ color: tokenText.primary, fontSize: '0.8rem', fontWeight: 600 }}>
                      Team Focus
                    </Typography>
                    <Typography sx={{ mt: 0.15, color: tokenText.secondary, fontSize: '0.72rem', fontWeight: 400 }}>
                      Critical items are surfaced first so leaders can clear blocked work fast.
                    </Typography>
                  </Box>
                  <Stack direction={{ xs: 'column', lg: 'row' }} spacing={0.75} sx={{ flex: 1 }}>
                    {highlightedTeamAlerts.map((alert) => {
                      const severity = severityConfig[alert.severity];
                      return (
                        <Box
                          key={`focus-${alert.id}`}
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            border: pageSectionBorder,
                            borderRadius: '8px',
                            px: 0.9,
                            py: 0.75,
                            bgcolor: tokenCommon.white,
                          }}
                        >
                          <Stack direction="row" spacing={0.7} alignItems="center">
                            <Box sx={{ width: 26, height: 26, borderRadius: '8px', bgcolor: severity.bg, border: `1px solid ${severity.border}`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                              {severity.icon}
                            </Box>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography sx={{ color: tokenText.primary, fontSize: '0.75rem', fontWeight: 600 }} noWrap>
                                {alert.employee}
                              </Typography>
                              <Typography sx={{ color: tokenText.secondary, fontSize: '0.68rem', fontWeight: 400 }} noWrap>
                                {alert.message}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                </Stack>
              </Box>
            ) : null}

            <Box sx={{ border: pageSectionBorder, borderRadius: '12px', bgcolor: 'background.paper', p: 1 }}>
              <Box
                sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(3, minmax(0, 1fr))',
                  xl: isConfigurationsView ? '2fr repeat(2, minmax(0, 1fr))' : isTeamView ? '2fr repeat(6, minmax(0, 1fr))' : '2fr repeat(5, minmax(0, 1fr))',
                },
                  gap: 0.4,
                }}
              >
                <TextField
                  value={alertFilters.search}
                  onChange={(event) => updateCurrentTabFilter('search', event.target.value)}
                  placeholder="Search alerts, employee, site, line, workflow"
                  size="small"
                  sx={compactFieldSx}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: tokenText.secondary, mr: 0.45, fontSize: 14 }} />,
                  }}
                />
                {isConfigurationsView ? (
                  <>
                    <Select size="small" value={alertFilters.status} onChange={(event) => updateCurrentTabFilter('status', event.target.value)} sx={compactFieldSx}>
                      {filterOptions.status.map((option: string) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                    </Select>
                    <Select size="small" value={alertFilters.module} onChange={(event) => updateCurrentTabFilter('module', event.target.value)} sx={compactFieldSx}>
                      {filterOptions.module.map((option: string) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                    </Select>
                  </>
                ) : (
                  <>
                    <Select size="small" value={alertFilters.period} onChange={(event) => updateCurrentTabFilter('period', event.target.value as typeof alertFilters.period)} sx={compactFieldSx}>
                      <MenuItem value="24h">Last 24h</MenuItem>
                      <MenuItem value="7d">Last 7d</MenuItem>
                      <MenuItem value="30d">Last 30d</MenuItem>
                      <MenuItem value="all">All time</MenuItem>
                    </Select>
                    <Select size="small" value={alertFilters.status} onChange={(event) => updateCurrentTabFilter('status', event.target.value)} sx={compactFieldSx}>
                      {filterOptions.status.map((option: string) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                    </Select>
                    <Select size="small" value={alertFilters.module} onChange={(event) => updateCurrentTabFilter('module', event.target.value)} sx={compactFieldSx}>
                      {filterOptions.module.map((option: string) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                    </Select>
                    <Select size="small" value={alertFilters.priority} onChange={(event) => updateCurrentTabFilter('priority', event.target.value)} sx={compactFieldSx}>
                      {filterOptions.priority.map((option: string) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                    </Select>
                    <Select size="small" value={alertFilters.site} onChange={(event) => updateCurrentTabFilter('site', event.target.value)} sx={compactFieldSx}>
                      {filterOptions.site.map((option: string) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                    </Select>
                    {isTeamView ? (
                      <>
                        <Select size="small" value={alertFilters.team} onChange={(event) => updateCurrentTabFilter('team', event.target.value)} sx={compactFieldSx}>
                          {filterOptions.team.map((option: string) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                        </Select>
                        <Select size="small" value={alertFilters.assignee} onChange={(event) => updateCurrentTabFilter('assignee', event.target.value)} sx={compactFieldSx}>
                          {filterOptions.assignee.map((option: string) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                        </Select>
                      </>
                    ) : null}
                  </>
                )}
              </Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.65} alignItems={{ sm: 'center' }} justifyContent="space-between" sx={{ mt: 0.7 }}>
                <Typography sx={{ color: tokenText.secondary, fontSize: '0.72rem', fontWeight: 500 }}>
                  {isConfigurationsView
                    ? `${filteredConfigurationRules.length} custom notification rules match the current filters.`
                    : `${currentTabFilteredAlerts.length} alerts match the current filters.`}
                </Typography>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  {!isConfigurationsView ? (
                    <Select size="small" value={alertOrder} onChange={(event) => setAlertOrder(event.target.value as typeof alertOrder)} sx={{ ...compactFieldSx, minWidth: 110, maxWidth: 110 }}>
                      <MenuItem value="recent">Recent</MenuItem>
                      <MenuItem value="oldest">Oldest</MenuItem>
                      <MenuItem value="severity">Severity</MenuItem>
                    </Select>
                  ) : null}
                  <Button
                    variant="text"
                    onClick={resetCurrentTabFilters}
                    sx={{
                      ...actionButtonSx,
                      color: tokenBrand.main,
                      '&:hover': { bgcolor: tokenBrand.softBg },
                    }}
                  >
                    Reset Filters
                  </Button>
                </Stack>
              </Stack>
            </Box>

            {isConfigurationsView ? (
              filteredConfigurationRules.length === 0 ? (
                renderEmptyState('No custom notification rules matched the current filters.')
              ) : (
                <Box sx={{ border: pageSectionBorder, borderRadius: '12px', bgcolor: 'background.paper', overflow: 'hidden' }}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', xl: '1.4fr 1fr 1fr 0.85fr 0.85fr 0.7fr 0.9fr 0.9fr 1fr' },
                      gap: 1,
                      px: 1.25,
                      py: 0.8,
                      borderBottom: pageSectionBorder,
                      bgcolor: tokenNeutral.lightest,
                    }}
                  >
                    {['Notification name', 'Source widget', 'Trigger condition', 'Scope', 'Frequency', 'Status', 'Created', 'Last triggered', 'Actions'].map((label) => (
                      <Typography key={label} sx={{ color: tokenText.secondary, fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {label}
                      </Typography>
                    ))}
                  </Box>
                  {filteredConfigurationRules.map((rule) => (
                    <ConfigurationRuleRow
                      key={rule.id}
                      rule={rule}
                      onDelete={deleteCustomNotificationRule}
                      onEdit={openCustomNotificationRuleEditor}
                      onToggleStatus={toggleCustomNotificationRuleStatus}
                    />
                  ))}
                </Box>
              )
            ) : currentTabFilteredAlerts.length === 0 ? (
              renderEmptyState('No active alerts matched the current filters.')
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.82fr) minmax(280px, 0.82fr)' },
                  gap: { xs: 1, lg: 0 },
                  border: pageSectionBorder,
                  borderRadius: '12px',
                  bgcolor: 'background.paper',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ px: 1.25, py: 0.85, borderBottom: pageSectionBorder, bgcolor: tokenCommon.white }}>
                    <Typography sx={{ color: tokenText.secondary, fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Notification queue
                    </Typography>
                  </Box>
                  <Box>
                    {currentTabFilteredAlerts.map((alert) => (
                      <NotificationRow
                        key={alert.id}
                        alert={alert}
                        formatAlertTime={formatAlertTime}
                        isSelected={selectedNotificationAlert?.id === alert.id}
                        onClick={() => setSelectedNotificationAlertId(alert.id)}
                      />
                    ))}
                  </Box>
                </Box>

                {selectedNotificationAlert ? (
                  <NotificationDetailsPanel
                    alert={selectedNotificationAlert}
                    dismissAlert={dismissAlert}
                    onClose={() => setSelectedNotificationAlertId('')}
                    onOpenWorkflow={openAlertWorkflow}
                  />
                ) : (
                  <Box
                    sx={{
                      borderLeft: { lg: pageSectionBorder },
                      px: 1.5,
                      py: 3,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Typography sx={{ color: tokenText.secondary, fontSize: '0.78rem', fontWeight: 500, textAlign: 'center' }}>
                      Select a notification to review details and open its workflow.
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Stack>
        )}
      </Stack>
      {editingCustomRuleConfig && editingCustomRuleDraft ? (
        <WidgetNotificationsDialog
          active={editingCustomRuleDraft.selectedEventIds.length > 0 && editingCustomRuleDraft.deliveryIds.length > 0}
          config={editingCustomRuleConfig}
          draftState={editingCustomRuleDraft}
          onApplySuggestion={applyEditingCustomRuleSuggestion}
          onClose={closeCustomNotificationRuleEditor}
          onSave={saveEditingCustomRule}
          onStateChange={setEditingCustomRuleDraft}
          onWidgetChange={updateEditingCustomRuleWidget}
          onRuleStatusChange={setEditingCustomRuleStatus}
          open
          ruleStatus={editingCustomRuleStatus}
          widgetOptions={widgetNotificationConfigs}
        />
      ) : null}
    </Box>
  );
}

export default NotificationDashboard;
