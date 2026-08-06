import {Box, Button, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography} from '@mui/material';
import type {LongTermPlanningAiProposal} from '../../aiProposalTypes';
import {acknowledgeLongTermRisk, resolveLongTermRisk} from '../../aiProposalUtils';
import {planningTokens} from '../../../ui/planningTheme';

const SEVERITY_TONE: Record<string, {bg: string; color: string; border: string}> = {
  Info: {bg: '#EEF2FF', color: '#3730A3', border: '#C7D2FE'},
  Warning: {bg: '#FFF7E8', color: '#B54708', border: '#F9DBAF'},
  Blocker: {bg: '#FEF3F2', color: '#B42318', border: '#FECDCA'},
};

const STATUS_TONE: Record<string, {bg: string; color: string}> = {
  Open: {bg: '#FEF3F2', color: '#B42318'},
  Acknowledged: {bg: '#F5F3FF', color: '#6D28D9'},
  Resolved: {bg: '#ECFDF3', color: '#16A34A'},
  Deferred: {bg: '#F8FAFC', color: 'var(--planning-text-secondary)'},
};

const RISK_TYPE_LABEL: Record<string, string> = {
  CapacityOverload: 'Capacity Overload',
  MissingProductionRate: 'Missing Production Rate',
  MaterialShortageRisk: 'Material Shortage',
  DemandSpike: 'Demand Spike',
  DuplicateForecastRow: 'Duplicate Forecast Row',
  MinimumLotSizeIssue: 'Min Lot Size Issue',
  SupplierTestCapacityLoss: 'Supplier Test Capacity Loss',
  MaintenanceCapacityLoss: 'Maintenance Capacity Loss',
  LaborConstraint: 'Labor Constraint',
};

function SeverityBadge({severity}: {severity: string}) {
  const tone = SEVERITY_TONE[severity] ?? SEVERITY_TONE['Info'];
  return (
    <Chip label={severity} size="small" sx={{fontWeight: 700, fontSize: 11, bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`, borderRadius: 1.5}} />
  );
}

function StatusBadge({status}: {status: string}) {
  const tone = STATUS_TONE[status] ?? STATUS_TONE['Open'];
  return (
    <Chip label={status} size="small" sx={{fontWeight: 700, fontSize: 11, bgcolor: tone.bg, color: tone.color, borderRadius: 1.5}} />
  );
}

type Props = {
  proposal: LongTermPlanningAiProposal;
  onProposalChange: (updated: LongTermPlanningAiProposal) => void;
};

export default function RisksExceptionsSection({proposal, onProposalChange}: Props) {
  const risks = proposal.risks;

  const handleAcknowledge = (id: string) => {
    onProposalChange(acknowledgeLongTermRisk(proposal, id));
  };

  const handleResolve = (id: string) => {
    onProposalChange(resolveLongTermRisk(proposal, id));
  };

  if (risks.length === 0) {
    return (
      <Box sx={{p: 2, textAlign: 'center'}}>
        <Typography sx={{fontSize: 13, color: planningTokens.textMuted}}>No risks identified.</Typography>
      </Box>
    );
  }

  const openCount = risks.filter((r) => r.status === 'Open').length;
  const blockerCount = risks.filter((r) => r.severity === 'Blocker').length;

  return (
    <Box>
      <Box sx={{display: 'flex', gap: 1.5, mb: 1.5, flexWrap: 'wrap'}}>
        <Box sx={{px: 1.5, py: 0.8, bgcolor: '#FEF3F2', borderRadius: 2, border: '1px solid #FECDCA'}}>
          <Typography sx={{fontSize: 11, fontWeight: 900, color: '#B42318'}}>{blockerCount} Blockers</Typography>
        </Box>
        <Box sx={{px: 1.5, py: 0.8, bgcolor: '#FFF7E8', borderRadius: 2, border: '1px solid #F9DBAF'}}>
          <Typography sx={{fontSize: 11, fontWeight: 900, color: '#B54708'}}>{openCount} Open Risks</Typography>
        </Box>
      </Box>

      <Box sx={{overflow: 'auto'}}>
        <Table size="small" aria-label="Risks and Exceptions">
          <TableHead>
            <TableRow sx={{'& th': {fontWeight: 800, fontSize: 11, color: planningTokens.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', borderBottom: `2px solid ${planningTokens.border}`}}}>
              <TableCell>Severity</TableCell>
              <TableCell>Risk Type</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Month</TableCell>
              <TableCell>Impact</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Recommended Action</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {risks.map((risk) => (
              <TableRow key={risk.id} sx={{'&:hover': {bgcolor: '#F8FAFF'}, '& td': {fontSize: 12, py: 1, borderBottom: `1px solid ${planningTokens.border}`}}}>
                <TableCell><SeverityBadge severity={risk.severity} /></TableCell>
                <TableCell sx={{whiteSpace: 'nowrap'}}>{RISK_TYPE_LABEL[risk.riskType] ?? risk.riskType}</TableCell>
                <TableCell>
                  <Typography sx={{fontSize: 12, fontWeight: 700, color: planningTokens.textPrimary}}>{risk.productCode}</Typography>
                  <Typography sx={{fontSize: 11, color: planningTokens.textMuted}}>{risk.productDescription}</Typography>
                </TableCell>
                <TableCell sx={{whiteSpace: 'nowrap'}}>{risk.month}</TableCell>
                <TableCell sx={{maxWidth: 160}}>
                  <Typography sx={{fontSize: 11.5, color: planningTokens.textSecondary, lineHeight: 1.4}}>{risk.impact}</Typography>
                </TableCell>
                <TableCell sx={{whiteSpace: 'nowrap'}}>{risk.owner}</TableCell>
                <TableCell sx={{maxWidth: 180}}>
                  <Typography sx={{fontSize: 11.5, color: planningTokens.textSecondary, lineHeight: 1.4}}>{risk.recommendedAction}</Typography>
                </TableCell>
                <TableCell><StatusBadge status={risk.status} /></TableCell>
                <TableCell sx={{whiteSpace: 'nowrap'}}>
                  <Box sx={{display: 'flex', gap: 0.5}}>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={risk.status !== 'Open'}
                      onClick={() => handleAcknowledge(risk.id)}
                      sx={{fontSize: 11, py: 0.3, px: 1, textTransform: 'none', minWidth: 'unset'}}
                      aria-label={`Acknowledge risk: ${risk.riskType} for ${risk.productCode}`}
                    >
                      Acknowledge
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      disabled={risk.status === 'Resolved'}
                      onClick={() => handleResolve(risk.id)}
                      sx={{fontSize: 11, py: 0.3, px: 1, textTransform: 'none', minWidth: 'unset'}}
                      aria-label={`Mark resolved: ${risk.riskType} for ${risk.productCode}`}
                    >
                      Resolve
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
