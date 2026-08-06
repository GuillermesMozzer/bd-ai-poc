import {
  CalendarMonth as CalendarIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Inventory2 as PartsIcon,
} from '@mui/icons-material';
import { Box, Button, Checkbox, Collapse, IconButton, Paper, Typography } from '@mui/material';
import { useState } from 'react';
import { tokenBrand, tokenDivider, tokenError, tokenSuccess, tokenText, tokenWarning } from '../../../workstation/theme';
import type { PlannerAiPlanAction } from '../../ai/types';

function getReadinessMeta(status: PlannerAiPlanAction['executionReadiness']) {
  if (status === 'pass') {
    return { color: tokenSuccess.dark, bg: '#ECFDF3', border: '#BBF7D0', label: 'Ready' };
  }
  if (status === 'blocker') {
    return { color: tokenError.dark, bg: '#FEF2F2', border: '#FECACA', label: 'Blocked' };
  }
  return { color: tokenWarning.dark, bg: '#FFF7ED', border: '#FED7AA', label: 'Review' };
}

function getPartsEtaMeta(risk: PlannerAiPlanAction['partsEtaRisk']) {
  if (risk === 'late') {
    return { color: tokenError.dark, label: 'Parts late' };
  }
  if (risk === 'tight') {
    return { color: tokenWarning.dark, label: 'Parts tight' };
  }
  if (risk === 'ready') {
    return { color: tokenSuccess.dark, label: 'Parts ready' };
  }
  return { color: tokenText.secondary, label: 'Check parts' };
}

function getActionKindLabel(kind: PlannerAiPlanAction['kind']) {
  if (kind === 'reschedule-card') {
    return 'Reschedule';
  }
  if (kind === 'schedule-planning-item') {
    return 'Schedule';
  }
  return 'Promote';
}

type ScheduleChangeCardProps = {
  action: PlannerAiPlanAction;
  selected: boolean;
  onToggle: () => void;
};

function ScheduleChangeCard({ action, selected, onToggle }: ScheduleChangeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const readiness = getReadinessMeta(action.executionReadiness);
  const partsEta = getPartsEtaMeta(action.partsEtaRisk);
  const slotLabel =
    action.kind === 'promote-follow-up-request'
      ? `Queue · ${action.line}`
      : `Day ${action.recommendedDay + 1} · ${action.recommendedShift === 'day' ? 'AM' : 'PM'}`;

  return (
    <Paper
      elevation={0}
      onClick={onToggle}
      sx={{
        borderRadius: '14px',
        border: `2px solid ${selected ? tokenBrand.main : tokenDivider}`,
        bgcolor: selected ? 'rgba(4,78,215,0.03)' : 'background.paper',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.15s ease, background-color 0.15s ease',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
        <Box
          sx={{
            width: 4,
            flexShrink: 0,
            bgcolor: selected ? tokenBrand.main : readiness.color,
          }}
        />
        <Box sx={{ flex: 1, p: 1.35, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Checkbox
              checked={selected}
              onChange={(event) => {
                event.stopPropagation();
                onToggle();
              }}
              onClick={(event) => event.stopPropagation()}
              sx={{ p: 0, mt: 0.1 }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: tokenText.primary, fontSize: '0.82rem', fontWeight: 800, lineHeight: 1.3 }}>
                    {action.asset}
                  </Typography>
                  <Typography sx={{ mt: 0.15, color: tokenText.secondary, fontSize: '0.72rem' }}>
                    {action.workOrderLabel} · {getActionKindLabel(action.kind)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    px: 1,
                    py: 0.35,
                    borderRadius: '8px',
                    bgcolor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.4,
                  }}
                >
                  <CalendarIcon sx={{ fontSize: 13, color: tokenBrand.main }} />
                  <Typography sx={{ color: tokenBrand.main, fontSize: '0.72rem', fontWeight: 800 }}>
                    {slotLabel}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 0.85, display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: readiness.color,
                    }}
                  />
                  <Typography sx={{ color: readiness.color, fontSize: '0.7rem', fontWeight: 700 }}>
                    {readiness.label}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45 }}>
                  <PartsIcon sx={{ fontSize: 13, color: partsEta.color }} />
                  <Typography sx={{ color: partsEta.color, fontSize: '0.7rem', fontWeight: 700 }}>
                    {action.partsEtaLabel ?? partsEta.label}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, ml: 'auto' }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 6,
                      borderRadius: 99,
                      bgcolor: '#E2E8F0',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        width: `${action.confidence}%`,
                        height: '100%',
                        borderRadius: 99,
                        bgcolor: action.confidence >= 85 ? tokenSuccess.main : action.confidence >= 75 ? tokenBrand.main : tokenWarning.main,
                      }}
                    />
                  </Box>
                  <Typography sx={{ color: tokenText.primary, fontSize: '0.72rem', fontWeight: 800 }}>
                    {action.confidence}%
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 0.65, display: 'flex', alignItems: 'center', gap: 0.35 }}>
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    setExpanded((current) => !current);
                  }}
                  sx={{ p: 0.25 }}
                  aria-label={expanded ? 'Hide details' : 'Show details'}
                >
                  {expanded ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
                </IconButton>
                <Typography sx={{ color: tokenText.secondary, fontSize: '0.71rem', lineHeight: 1.4, flex: 1 }}>
                  {expanded ? action.reason : action.title}
                </Typography>
              </Box>

              <Collapse in={expanded} unmountOnExit>
                <Typography
                  sx={{ mt: 0.5, pl: 3.2, color: tokenText.secondary, fontSize: '0.71rem', lineHeight: 1.5 }}
                  onClick={(event) => event.stopPropagation()}
                >
                  {action.reason}
                </Typography>
                {action.agentContributors.length ? (
                  <Typography sx={{ mt: 0.4, pl: 3.2, color: tokenText.secondary, fontSize: '0.68rem' }}>
                    Agents: {action.agentContributors.join(' · ')}
                  </Typography>
                ) : null}
              </Collapse>
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

type AIScheduleChangesTableProps = {
  actions: PlannerAiPlanAction[];
  selectedActionIds: string[];
  onToggleAction: (actionId: string) => void;
  onSelectAllActions: () => void;
  onClearActionSelection: () => void;
};

export function AIScheduleChangesTable({
  actions,
  selectedActionIds,
  onToggleAction,
  onSelectAllActions,
  onClearActionSelection,
}: AIScheduleChangesTableProps) {
  const allSelected = actions.length > 0 && selectedActionIds.length === actions.length;

  return (
    <Box sx={{ display: 'grid', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
        <Box>
          <Typography sx={{ color: tokenText.primary, fontSize: '0.88rem', fontWeight: 800 }}>
            What will change
          </Typography>
          <Typography sx={{ mt: 0.2, color: tokenText.secondary, fontSize: '0.73rem' }}>
            {selectedActionIds.length} of {actions.length} selected — tap a card to include or exclude
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
          <Button
            size="small"
            onClick={allSelected ? onClearActionSelection : onSelectAllActions}
            sx={{ minHeight: 30, textTransform: 'none', fontWeight: 700, color: tokenBrand.main }}
          >
            {allSelected ? 'Clear all' : 'Select all'}
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gap: 0.85 }}>
        {actions.map((action) => (
          <ScheduleChangeCard
            key={action.id}
            action={action}
            selected={selectedActionIds.includes(action.id)}
            onToggle={() => onToggleAction(action.id)}
          />
        ))}
      </Box>
    </Box>
  );
}
