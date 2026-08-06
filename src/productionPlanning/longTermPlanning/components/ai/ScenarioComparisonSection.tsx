import {Box, Chip, Radio, Table, TableBody, TableCell, TableHead, TableRow, Typography} from '@mui/material';
import type {LongTermAiScenario, LongTermPlanningAiProposal} from '../../aiProposalTypes';
import {selectLongTermScenario} from '../../aiProposalUtils';
import {planningTokens} from '../../../ui/planningTheme';

const RISK_TONE: Record<string, {bg: string; color: string}> = {
  Low: {bg: '#ECFDF3', color: '#16A34A'},
  Medium: {bg: '#FFF7E8', color: '#B54708'},
  High: {bg: '#FEF3F2', color: '#B42318'},
};

function RiskBadge({risk}: {risk: string}) {
  const tone = RISK_TONE[risk] ?? RISK_TONE['Medium'];
  return (
    <Chip label={risk} size="small" sx={{fontWeight: 700, fontSize: 11, bgcolor: tone.bg, color: tone.color, borderRadius: 1.5}} />
  );
}

type Props = {
  proposal: LongTermPlanningAiProposal;
  onProposalChange: (updated: LongTermPlanningAiProposal) => void;
};

export default function ScenarioComparisonSection({proposal, onProposalChange}: Props) {
  const scenarios = proposal.scenarios;
  const selectedScenario = scenarios.find((s) => s.selected);

  const handleSelect = (id: string) => {
    onProposalChange(selectLongTermScenario(proposal, id));
  };

  return (
    <Box>
      {selectedScenario ? (
        <Box sx={{mb: 1.5, p: 1.5, bgcolor: 'var(--planning-neutral-bg)', borderRadius: 2, border: '1px solid #BFDBFE'}}>
          <Typography sx={{fontSize: 11, fontWeight: 900, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.3}}>
            Selected Scenario
          </Typography>
          <Typography sx={{fontSize: 13, fontWeight: 700, color: planningTokens.textPrimary}}>{selectedScenario.name}</Typography>
          <Typography sx={{fontSize: 12, color: planningTokens.textSecondary, mt: 0.3}}>{selectedScenario.description}</Typography>
        </Box>
      ) : null}

      <Box sx={{overflow: 'auto'}}>
        <Table size="small" aria-label="Scenario Comparison">
          <TableHead>
            <TableRow sx={{'& th': {fontWeight: 800, fontSize: 11, color: planningTokens.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', borderBottom: `2px solid ${planningTokens.border}`}}}>
              <TableCell padding="checkbox" aria-label="Select scenario" />
              <TableCell>Scenario</TableCell>
              <TableCell align="right">Demand Coverage</TableCell>
              <TableCell align="right">OT Hours</TableCell>
              <TableCell align="right">Overloaded Months</TableCell>
              <TableCell align="right">Uncovered Demand</TableCell>
              <TableCell>Inventory Risk</TableCell>
              <TableCell>Material Risk</TableCell>
              <TableCell>AI Recommendation</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scenarios.map((scenario: LongTermAiScenario) => (
              <TableRow
                key={scenario.id}
                selected={scenario.selected}
                hover
                onClick={() => handleSelect(scenario.id)}
                sx={{cursor: 'pointer', '& td': {fontSize: 12, py: 1, borderBottom: `1px solid ${planningTokens.border}`}, ...(scenario.selected ? {bgcolor: '#EFF6FF !important'} : {})}}
              >
                <TableCell padding="checkbox">
                  <Radio
                    size="small"
                    checked={scenario.selected}
                    onChange={() => handleSelect(scenario.id)}
                    onClick={(e) => e.stopPropagation()}
                    inputProps={{'aria-label': `Select scenario ${scenario.name}`}}
                  />
                </TableCell>
                <TableCell>
                  <Typography sx={{fontSize: 12, fontWeight: 700, color: planningTokens.textPrimary}}>{scenario.name}</Typography>
                  <Typography sx={{fontSize: 11, color: planningTokens.textMuted, mt: 0.2}}>{scenario.description}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{fontSize: 12, fontWeight: 700, color: scenario.demandCoveragePercent >= 95 ? planningTokens.success : scenario.demandCoveragePercent >= 88 ? planningTokens.warning : planningTokens.danger}}>
                    {scenario.demandCoveragePercent}%
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{color: scenario.requiredOvertimeHours > 0 ? planningTokens.warning : planningTokens.textPrimary, fontWeight: 600}}>
                  {scenario.requiredOvertimeHours.toLocaleString()} hrs
                </TableCell>
                <TableCell align="right" sx={{color: scenario.overloadedMonths > 0 ? planningTokens.danger : planningTokens.success, fontWeight: 600}}>
                  {scenario.overloadedMonths}
                </TableCell>
                <TableCell align="right" sx={{color: scenario.uncoveredDemand > 0 ? planningTokens.danger : planningTokens.success, fontWeight: 600}}>
                  {scenario.uncoveredDemand.toLocaleString()}
                </TableCell>
                <TableCell><RiskBadge risk={scenario.inventoryRisk} /></TableCell>
                <TableCell><RiskBadge risk={scenario.materialRisk} /></TableCell>
                <TableCell sx={{maxWidth: 200}}>
                  <Typography sx={{fontSize: 11.5, color: planningTokens.textSecondary, lineHeight: 1.4}}>{scenario.aiRecommendation}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
