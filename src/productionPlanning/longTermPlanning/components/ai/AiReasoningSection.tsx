import {Box, Chip, Paper, Typography} from '@mui/material';
import type {LongTermAiReasoning} from '../../aiProposalTypes';
import {planningTokens} from '../../../ui/planningTheme';

const SEVERITY_TONE: Record<string, {bg: string; color: string; border: string}> = {
  Info: {bg: '#EEF2FF', color: '#3730A3', border: '#C7D2FE'},
  Warning: {bg: '#FFF7E8', color: '#B54708', border: '#F9DBAF'},
  Blocker: {bg: '#FEF3F2', color: '#B42318', border: '#FECDCA'},
};

const CATEGORY_LABEL: Record<string, string> = {
  ForecastQuality: 'Forecast Quality',
  Capacity: 'Capacity',
  Commitment: 'Commitment',
  ProductRules: 'Product Rules',
  Scenario: 'Scenario',
  Risk: 'Risk',
};

type Props = {
  reasoning: LongTermAiReasoning[];
};

export default function AiReasoningSection({reasoning}: Props) {
  if (reasoning.length === 0) {
    return (
      <Box sx={{p: 2, textAlign: 'center'}}>
        <Typography sx={{fontSize: 13, color: planningTokens.textMuted}}>No AI reasoning available.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{display: 'grid', gap: 1.5}}>
      {reasoning.map((entry) => {
        const tone = SEVERITY_TONE[entry.severity] ?? SEVERITY_TONE['Info'];
        return (
          <Paper
            key={entry.id}
            elevation={0}
            sx={{p: 1.5, borderRadius: 2, border: `1px solid ${planningTokens.border}`, borderLeft: `4px solid ${tone.color}`, bgcolor: 'var(--planning-surface-muted)'}}
          >
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 0.8}}>
              <Chip
                label={CATEGORY_LABEL[entry.category] ?? entry.category}
                size="small"
                sx={{fontWeight: 700, fontSize: 11, bgcolor: 'var(--planning-ai-accent-bg)', color: '#3730A3', borderRadius: 1.5}}
              />
              <Chip
                label={entry.severity}
                size="small"
                sx={{fontWeight: 700, fontSize: 11, bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`, borderRadius: 1.5}}
              />
            </Box>
            <Typography sx={{fontSize: 13, fontWeight: 700, color: planningTokens.textPrimary, mb: 0.5}}>{entry.title}</Typography>
            <Typography sx={{fontSize: 12.5, color: planningTokens.textSecondary, lineHeight: 1.6}}>{entry.explanation}</Typography>
            {entry.affectedProducts.length > 0 ? (
              <Box sx={{mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap'}}>
                {entry.affectedProducts.map((p) => (
                  <Chip key={p} label={p} size="small" sx={{fontSize: 11, fontWeight: 600, bgcolor: 'var(--planning-surface-muted)', color: planningTokens.textSecondary}} />
                ))}
                {entry.affectedMonths.map((m) => (
                  <Chip key={m} label={m} size="small" sx={{fontSize: 11, fontWeight: 600, bgcolor: 'var(--planning-surface-muted)', color: planningTokens.textMuted}} />
                ))}
              </Box>
            ) : null}
          </Paper>
        );
      })}
    </Box>
  );
}
