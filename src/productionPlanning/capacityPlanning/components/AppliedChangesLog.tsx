import {Box, Chip, Collapse, Divider, IconButton, Paper, Stack, Tooltip, Typography} from '@mui/material';
import {
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  History as HistoryIcon,
  Undo as UndoIcon,
} from '@mui/icons-material';
import {planningTokens} from '../../ui/planningTheme';
import type {ScenarioChange} from '../../scenarioPlanning/types';
import type {ScenarioAuditEvent} from '../../scenarioPlanning/types';
import {formatKHours} from '../utils';

type Props = {
  changes: ScenarioChange[];
  auditEvents: ScenarioAuditEvent[];
  expanded: boolean;
  onToggle: () => void;
  onUndo: (changeId: string) => void;
};

export default function AppliedChangesLog({changes, auditEvents, expanded, onToggle, onUndo}: Props) {
  return (
    <Paper elevation={0} sx={{border: `1px solid ${planningTokens.border}`, borderRadius: 3, overflow: 'hidden'}}>
      {/* Toggle header */}
      <Box
        onClick={onToggle}
        sx={{
          px: 2, py: 1,
          display: 'flex', alignItems: 'center', gap: 1,
          cursor: 'pointer',
          bgcolor: planningTokens.surfaceMuted,
          borderBottom: expanded ? `1px solid ${planningTokens.border}` : 'none',
          '&:hover': {bgcolor: '#EEF3FF'},
        }}
      >
        <HistoryIcon sx={{fontSize: 15, color: planningTokens.textSecondary}} />
        <Typography sx={{fontSize: 12, fontWeight: 700, color: planningTokens.textPrimary, flex: 1}}>
          Session Changes
        </Typography>
        {changes.length > 0 && (
          <Chip
            label={changes.length}
            size="small"
            sx={{fontSize: 10, height: 18, bgcolor: planningTokens.primaryBlue, color: 'white', fontWeight: 700}}
          />
        )}
        {expanded ? <ExpandLessIcon sx={{fontSize: 16}} /> : <ExpandMoreIcon sx={{fontSize: 16}} />}
      </Box>

      <Collapse in={expanded}>
        {changes.length === 0 ? (
          <Box sx={{px: 3, py: 2, textAlign: 'center'}}>
            <Typography sx={{fontSize: 12, color: planningTokens.textMuted}}>
              No changes applied yet in this session.
            </Typography>
          </Box>
        ) : (
          <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0}}>
            {/* Left: changes list */}
            <Box sx={{borderRight: `1px solid ${planningTokens.border}`}}>
              <Box sx={{px: 2, py: 0.75, bgcolor: '#F9FAFF', borderBottom: `1px solid ${planningTokens.border}`}}>
                <Typography sx={{fontSize: 10, fontWeight: 700, color: planningTokens.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                  Applied Changes
                </Typography>
              </Box>
              {changes.map((chg) => {
                const delta = typeof chg.deltaValue === 'number' ? chg.deltaValue : 0;
                const baseline = typeof chg.baselineValue === 'number' ? chg.baselineValue : 0;
                const scenario = typeof chg.scenarioValue === 'number' ? chg.scenarioValue : 0;
                return (
                  <Box
                    key={chg.id}
                    sx={{
                      px: 2, py: 1,
                      borderBottom: `1px solid ${planningTokens.border}`,
                      display: 'flex', gap: 1, alignItems: 'flex-start',
                      '&:hover': {bgcolor: '#F8FAFF'},
                    }}
                  >
                    <Box sx={{flex: 1}}>
                      <Typography sx={{fontSize: 11, fontWeight: 600, color: planningTokens.textPrimary}}>
                        {chg.title}
                      </Typography>
                      <Stack direction="row" spacing={0.75} alignItems="center" sx={{mt: 0.25}}>
                        <Typography sx={{fontSize: 10, color: planningTokens.textMuted}}>
                          {chg.startPeriod}
                        </Typography>
                        <Typography sx={{fontSize: 10, color: planningTokens.textMuted}}>·</Typography>
                        <Typography sx={{fontSize: 10, color: delta >= 0 ? '#16A34A' : '#DC2626', fontWeight: 600}}>
                          {delta >= 0 ? '+' : ''}{formatKHours(delta)} hrs
                        </Typography>
                        <Typography sx={{fontSize: 10, color: planningTokens.textMuted}}>
                          ({formatKHours(baseline)} → {formatKHours(scenario)})
                        </Typography>
                      </Stack>
                      {chg.reason && (
                        <Typography sx={{fontSize: 10, color: planningTokens.textSecondary, mt: 0.25, fontStyle: 'italic'}}>
                          "{chg.reason}"
                        </Typography>
                      )}
                    </Box>
                    <Tooltip title="Undo this change">
                      <IconButton
                        size="small"
                        onClick={() => onUndo(chg.id)}
                        sx={{p: 0.3, color: planningTokens.textMuted, '&:hover': {color: '#DC2626', bgcolor: '#FEF2F2'}}}
                      >
                        <UndoIcon sx={{fontSize: 14}} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                );
              })}
            </Box>

            {/* Right: audit events */}
            <Box>
              <Box sx={{px: 2, py: 0.75, bgcolor: '#F9FAFF', borderBottom: `1px solid ${planningTokens.border}`}}>
                <Typography sx={{fontSize: 10, fontWeight: 700, color: planningTokens.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                  Audit Log
                </Typography>
              </Box>
              {[...auditEvents].reverse().map((ev) => (
                <Box
                  key={ev.id}
                  sx={{px: 2, py: 1, borderBottom: `1px solid ${planningTokens.border}`, '&:hover': {bgcolor: '#F8FAFF'}}}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography sx={{fontSize: 11, fontWeight: 600, color: planningTokens.textPrimary}}>
                      {ev.eventType === 'ChangeAdded' ? 'Changes Applied' : ev.eventType === 'ChangeRemoved' ? 'Change Undone' : ev.eventType}
                    </Typography>
                    <Typography sx={{fontSize: 10, color: planningTokens.textMuted, ml: 1, whiteSpace: 'nowrap'}}>
                      {ev.user}
                    </Typography>
                  </Stack>
                  {ev.newValue && (
                    <Typography sx={{fontSize: 10, color: planningTokens.textSecondary, mt: 0.25}}>
                      {ev.newValue}
                    </Typography>
                  )}
                  {ev.comment && (
                    <Typography sx={{fontSize: 10, color: planningTokens.textMuted, mt: 0.25, fontStyle: 'italic'}}>
                      {ev.comment}
                    </Typography>
                  )}
                  <Typography sx={{fontSize: 9, color: planningTokens.textMuted, mt: 0.25}}>
                    {ev.timestamp}
                  </Typography>
                </Box>
              ))}
              {auditEvents.length === 0 && (
                <Box sx={{px: 2, py: 2}}>
                  <Typography sx={{fontSize: 11, color: planningTokens.textMuted}}>No events yet.</Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
        <Divider />
        <Box sx={{px: 2, py: 0.75, bgcolor: planningTokens.surfaceMuted}}>
          <Typography sx={{fontSize: 10, color: planningTokens.textMuted}}>
            Changes are applied to the active scenario. Undo removes the capacity override and logs a reversal event.
          </Typography>
        </Box>
      </Collapse>
    </Paper>
  );
}
