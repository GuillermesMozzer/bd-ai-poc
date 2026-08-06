import {Box, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography} from '@mui/material';
import type {ForecastQualityIssue} from '../../aiProposalTypes';
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
};

const ISSUE_TYPE_LABEL: Record<string, string> = {
  MissingProductMasterData: 'Missing master data',
  MissingProductLineCapability: 'Missing line capability',
  DemandSpike: 'Demand spike',
  DemandDrop: 'Demand drop',
  DuplicateForecastRow: 'Duplicate row',
  BlankMonthlyDemand: 'Blank demand',
  ForecastAgeWarning: 'Forecast age',
  DemandBelowMinimumLotSize: 'Below min lot size',
};

function SeverityBadge({severity}: {severity: string}) {
  const tone = SEVERITY_TONE[severity] ?? SEVERITY_TONE['Info'];
  return (
    <Chip
      label={severity}
      size="small"
      sx={{fontWeight: 700, fontSize: 11, bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`, borderRadius: 1.5}}
    />
  );
}

function StatusBadge({status}: {status: string}) {
  const tone = STATUS_TONE[status] ?? STATUS_TONE['Open'];
  return (
    <Chip
      label={status}
      size="small"
      sx={{fontWeight: 700, fontSize: 11, bgcolor: tone.bg, color: tone.color, borderRadius: 1.5}}
    />
  );
}

type Props = {
  issues: ForecastQualityIssue[];
};

export default function ForecastQualitySection({issues}: Props) {
  if (issues.length === 0) {
    return (
      <Box sx={{p: 2, textAlign: 'center'}}>
        <Typography sx={{fontSize: 13, color: planningTokens.textMuted}}>No forecast quality issues detected.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{overflow: 'auto'}}>
      <Table size="small" aria-label="Forecast Quality Issues">
        <TableHead>
          <TableRow sx={{'& th': {fontWeight: 800, fontSize: 11, color: planningTokens.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', borderBottom: `2px solid ${planningTokens.border}`}}}>
            <TableCell>Product</TableCell>
            <TableCell>Month</TableCell>
            <TableCell>Issue Type</TableCell>
            <TableCell align="right">Current Fcst</TableCell>
            <TableCell align="right">Prior Fcst</TableCell>
            <TableCell align="right">Variance %</TableCell>
            <TableCell>Severity</TableCell>
            <TableCell>AI Recommendation</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {issues.map((issue) => (
            <TableRow key={issue.id} sx={{'&:hover': {bgcolor: '#F8FAFF'}, '& td': {fontSize: 12, py: 1, borderBottom: `1px solid ${planningTokens.border}`}}}>
              <TableCell>
                <Typography sx={{fontSize: 12, fontWeight: 700, color: planningTokens.textPrimary}}>{issue.productCode}</Typography>
                <Typography sx={{fontSize: 11, color: planningTokens.textMuted}}>{issue.productDescription}</Typography>
              </TableCell>
              <TableCell sx={{whiteSpace: 'nowrap'}}>{issue.month}</TableCell>
              <TableCell sx={{whiteSpace: 'nowrap'}}>{ISSUE_TYPE_LABEL[issue.issueType] ?? issue.issueType}</TableCell>
              <TableCell align="right" sx={{fontWeight: 600}}>{issue.currentForecast != null ? issue.currentForecast.toLocaleString() : '—'}</TableCell>
              <TableCell align="right">{issue.priorForecast != null ? issue.priorForecast.toLocaleString() : '—'}</TableCell>
              <TableCell align="right" sx={{fontWeight: 700, color: issue.variancePercent != null && issue.variancePercent > 0 ? planningTokens.warning : issue.variancePercent != null && issue.variancePercent < 0 ? planningTokens.danger : undefined}}>
                {issue.variancePercent != null ? `${issue.variancePercent > 0 ? '+' : ''}${issue.variancePercent}%` : '—'}
              </TableCell>
              <TableCell><SeverityBadge severity={issue.severity} /></TableCell>
              <TableCell sx={{maxWidth: 200}}>
                <Typography sx={{fontSize: 11.5, color: planningTokens.textSecondary, lineHeight: 1.4}}>{issue.aiRecommendation}</Typography>
              </TableCell>
              <TableCell><StatusBadge status={issue.status} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
