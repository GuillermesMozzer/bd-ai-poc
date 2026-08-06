import { Box, Chip, Paper, Typography } from '@mui/material';
import { tokenDivider, tokenText } from '../../../workstation/theme';
import type { PlannerAiMaintenanceBundle } from '../../ai/types';

type AIBundleCardProps = {
  bundle: PlannerAiMaintenanceBundle;
};

function getRiskStyles(riskLevel: PlannerAiMaintenanceBundle['riskLevel']) {
  if (riskLevel === 'high') {
    return { bg: '#FEF2F2', border: '#FECACA', color: '#B91C1C' };
  }

  if (riskLevel === 'medium') {
    return { bg: '#FFF7ED', border: '#FED7AA', color: '#C2410C' };
  }

  return { bg: '#ECFDF3', border: '#BBF7D0', color: '#166534' };
}

export function AIBundleCard({ bundle }: AIBundleCardProps) {
  const riskStyles = getRiskStyles(bundle.riskLevel);

  return (
    <Paper elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${tokenDivider}`, p: 1.2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: tokenText.primary, fontSize: '0.75rem', fontWeight: 800 }}>
            {bundle.name}
          </Typography>
          <Typography sx={{ mt: 0.24, color: tokenText.secondary, fontSize: '0.71rem', lineHeight: 1.45 }}>
            {bundle.summary}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={`${bundle.riskLevel} bundle risk`}
          sx={{
            height: 22,
            borderRadius: 99,
            bgcolor: riskStyles.bg,
            border: `1px solid ${riskStyles.border}`,
            color: riskStyles.color,
            fontWeight: 700,
            textTransform: 'capitalize',
          }}
        />
      </Box>

      <Typography sx={{ mt: 0.55, color: tokenText.secondary, fontSize: '0.69rem', lineHeight: 1.4 }}>
        Constraint: {bundle.constraint}
        {bundle.constraintType ? ` (${bundle.constraintType.replace(/-/g, ' ')})` : ''}
      </Typography>
      <Typography sx={{ mt: 0.2, color: tokenText.secondary, fontSize: '0.69rem', lineHeight: 1.4 }}>
        WOs: {bundle.workOrderLabels.join(', ')}
      </Typography>

      <Box sx={{ mt: 0.85, display: 'flex', gap: 0.55, flexWrap: 'wrap' }}>
        <Chip
          size="small"
          label={bundle.timeSaved}
          sx={{
            height: 20,
            borderRadius: 99,
            bgcolor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            color: '#1D4ED8',
            fontWeight: 700,
          }}
        />
        <Chip
          size="small"
          label={bundle.productionImpact}
          sx={{
            height: 20,
            borderRadius: 99,
            bgcolor: '#F8FAFC',
            border: `1px solid ${tokenDivider}`,
            color: tokenText.secondary,
            fontWeight: 700,
          }}
        />
      </Box>
    </Paper>
  );
}
