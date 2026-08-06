import {Chip} from '@mui/material';
import type {CapacityStatus, ReadinessStatus, ScenarioSeverity, ScenarioStatus, StockStatus} from '../types';
import {planningStatusTones} from '../../ui/planningTheme';

export function ScenarioStatusBadge({status}: {status: ScenarioStatus}) {
  const toneMap: Record<ScenarioStatus, {bg: string; color: string; border: string}> = {
    Draft:     planningStatusTones.Draft,
    Simulated: planningStatusTones.CapacityReviewed,
    Compared:  planningStatusTones.Adjusted,
    Applied:   planningStatusTones.Released,
    Discarded: planningStatusTones.Superseded,
  };
  const t = toneMap[status];
  return (
    <Chip size="small" label={status}
      sx={{bgcolor: t.bg, color: t.color, border: `1px solid ${t.border}`, fontWeight: 800}} />
  );
}

export function SeverityBadge({severity}: {severity: ScenarioSeverity}) {
  const t = planningStatusTones[severity];
  return (
    <Chip size="small" label={severity}
      sx={{bgcolor: t.bg, color: t.color, border: `1px solid ${t.border}`, fontWeight: 800}} />
  );
}

export function CapacityStatusBadge({status}: {status: CapacityStatus}) {
  const toneMap: Record<CapacityStatus, {bg: string; color: string; border: string}> = {
    Feasible:    planningStatusTones.Feasible,
    AtRisk:      planningStatusTones.AtRisk,
    Overloaded:  planningStatusTones.Constrained,
    MissingData: planningStatusTones.PendingData,
  };
  const t = toneMap[status];
  const label = status === 'AtRisk' ? 'At Risk' : status === 'MissingData' ? 'Missing Data' : status;
  return (
    <Chip size="small" label={label}
      sx={{bgcolor: t.bg, color: t.color, border: `1px solid ${t.border}`, fontWeight: 700}} />
  );
}

export function StockStatusBadge({status}: {status: StockStatus}) {
  const toneMap: Record<StockStatus, {bg: string; color: string; border: string}> = {
    OK:       planningStatusTones.Feasible,
    BelowMin: planningStatusTones.Constrained,
    AboveMax: planningStatusTones.AtRisk,
  };
  const t = toneMap[status];
  const label = status === 'BelowMin' ? 'Below Min' : status === 'AboveMax' ? 'Above Max' : status;
  return (
    <Chip size="small" label={label}
      sx={{bgcolor: t.bg, color: t.color, border: `1px solid ${t.border}`, fontWeight: 700}} />
  );
}

export function ReadinessBadge({status}: {status: ReadinessStatus}) {
  const t = status === 'Ready' ? planningStatusTones.Feasible : planningStatusTones.Constrained;
  const label = status === 'NotReady' ? 'Not Ready' : status;
  return (
    <Chip size="small" label={label}
      sx={{bgcolor: t.bg, color: t.color, border: `1px solid ${t.border}`, fontWeight: 700}} />
  );
}
