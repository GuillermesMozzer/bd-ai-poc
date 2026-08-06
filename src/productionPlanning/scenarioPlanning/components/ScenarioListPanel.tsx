import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AutoAwesome as AIStarIcon,
  CheckCircleOutline as SimulatedIcon,
  EditNote as DraftIcon,
  ExpandMore as ExpandMoreIcon,
  FolderOpenOutlined as ScenarioIcon,
} from '@mui/icons-material';
import {planningTokens} from '../../ui/planningTheme';
import type {ScenarioListItem, ScenarioSeverity, ScenarioStatus} from '../types';

type Props = {
  scenarios: ScenarioListItem[];
  activeScenarioId: string;
  onSelectScenario: (id: string) => void;
};

function severityColor(severity: ScenarioSeverity) {
  if (severity === 'Blocker') return {color: planningTokens.danger, bg: '#FEF2F2', border: '#FECACA'};
  if (severity === 'Warning') return {color: planningTokens.warning, bg: '#FFF7ED', border: '#FED7AA'};
  return {color: planningTokens.primaryBlue, bg: '#EFF6FF', border: '#BFDBFE'};
}

function statusLabel(status: ScenarioStatus) {
  if (status === 'Simulated') return {label: 'Simulated', color: planningTokens.success, bg: '#ECFDF3', border: '#BBF7D0'};
  if (status === 'Applied') return {label: 'Applied', color: '#7C3AED', bg: '#EDE9FE', border: '#DDD6FE'};
  if (status === 'Compared') return {label: 'Compared', color: planningTokens.primaryBlue, bg: '#EFF6FF', border: '#BFDBFE'};
  if (status === 'Discarded') return {label: 'Discarded', color: planningTokens.textMuted, bg: '#F8FAFC', border: '#E2E8F0'};
  return {label: 'Draft', color: planningTokens.textSecondary, bg: '#F8FAFC', border: '#CBD5E1'};
}

export default function ScenarioListPanel({scenarios, activeScenarioId, onSelectScenario}: Props) {
  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        border: `1px solid ${planningTokens.border}`,
        borderRadius: '12px !important',
        bgcolor: planningTokens.surface,
        mb: 0,
        '&:before': {display: 'none'},
        '& .MuiAccordionSummary-root': {borderRadius: 3, minHeight: 48},
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{color: planningTokens.textMuted, fontSize: 20}} />}
        sx={{px: 2.5, py: 0}}
      >
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
          <ScenarioIcon sx={{fontSize: 17, color: planningTokens.primaryBlue}} />
          <Typography sx={{fontSize: 13, fontWeight: 800, color: planningTokens.textPrimary}}>
            Available Scenarios
          </Typography>
          <Box sx={{
            bgcolor: `color-mix(in srgb, ${planningTokens.primaryBlue} 8%, transparent)`,
            color: planningTokens.primaryBlue,
            borderRadius: '10px',
            fontSize: 11,
            fontWeight: 800,
            px: 0.9,
            py: 0.1,
            lineHeight: 1.7,
          }}>
            {scenarios.length}
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{px: 2, pb: 2, pt: 0}}>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
          {scenarios.map((s) => {
            const isActive = s.id === activeScenarioId;
            const sev = severityColor(s.overallSeverity);
            const stat = statusLabel(s.status);
            const StatusIcon = s.status === 'Simulated' || s.status === 'Applied' || s.status === 'Compared'
              ? SimulatedIcon
              : DraftIcon;

            return (
              <Box
                key={s.id}
                onClick={() => onSelectScenario(s.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2.5,
                  cursor: 'pointer',
                  border: isActive
                    ? `1.5px solid ${planningTokens.primaryBlue}`
                    : `1px solid ${planningTokens.border}`,
                  bgcolor: isActive ? `color-mix(in srgb, ${planningTokens.primaryBlue} 3%, transparent)` : planningTokens.surface,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: isActive ? `color-mix(in srgb, ${planningTokens.primaryBlue} 6%, transparent)` : planningTokens.background,
                    borderColor: isActive ? planningTokens.primaryBlue : planningTokens.primaryBlue + '60',
                  },
                }}
              >
                {/* Severity indicator strip */}
                <Box sx={{
                  width: 3,
                  borderRadius: 2,
                  bgcolor: sev.color,
                  alignSelf: 'stretch',
                  flexShrink: 0,
                  minHeight: 40,
                }} />

                <Box sx={{flex: 1, minWidth: 0}}>
                  <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.4}}>
                    <Typography sx={{
                      fontSize: 13,
                      fontWeight: isActive ? 900 : 700,
                      color: planningTokens.textPrimary,
                      lineHeight: 1.3,
                    }}>
                      {s.name}
                    </Typography>

                    {s.isBluAIRecommended && (
                      <Tooltip title="Blu.AI recommended this as the best scenario" placement="top">
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.4,
                          px: 0.8,
                          py: 0.15,
                          borderRadius: 10,
                          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                          color: '#fff',
                          fontSize: 10,
                          fontWeight: 800,
                          lineHeight: 1.6,
                          flexShrink: 0,
                        }}>
                          <AIStarIcon sx={{fontSize: 11}} />
                          Blu.AI Pick
                        </Box>
                      </Tooltip>
                    )}
                  </Box>

                  <Typography sx={{
                    fontSize: 11.5,
                    color: planningTokens.textMuted,
                    lineHeight: 1.4,
                    mb: 0.8,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {s.description}
                  </Typography>

                  <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap'}}>
                    <Chip
                      icon={<StatusIcon sx={{fontSize: '12px !important', color: `${stat.color} !important`}} />}
                      label={stat.label}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: 10,
                        fontWeight: 800,
                        bgcolor: stat.bg,
                        color: stat.color,
                        border: `1px solid ${stat.border}`,
                        '& .MuiChip-label': {px: 0.7},
                      }}
                    />
                    <Typography sx={{fontSize: 10.5, color: planningTokens.textMuted}}>
                      {s.type === 'LongTerm' ? 'Long-Term' : 'Short-Term'}
                    </Typography>
                    <Typography sx={{fontSize: 10.5, color: planningTokens.textMuted}}>
                      · {s.createdBy} · {s.updatedAt}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
