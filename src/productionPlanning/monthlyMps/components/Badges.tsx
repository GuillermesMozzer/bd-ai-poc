import {Chip} from '@mui/material';
import type {
  BucketStatus,
  DemandLineStatus,
  ExceptionSeverity,
  MpsAssistantFinalReadinessStatus,
  MpsAssistantRecommendationSeverity,
  MpsAssistantStepStatus,
  MpsPlanStatus,
} from '../types';

const planStatusTone: Record<MpsPlanStatus, {bg: string; color: string; border: string}> = {
  Draft:          {bg: '#F8FAFC', color: 'var(--planning-text-secondary)', border: '#E2E8F0'},
  Validated:      {bg: '#EEF2FF', color: '#3730A3', border: '#C7D2FE'},
  CapacityChecked:{bg: '#F0F9FF', color: '#0369A1', border: '#BAE6FD'},
  Adjusted:       {bg: '#FFF7E8', color: '#B54708', border: '#F9DBAF'},
  Released:             {bg: '#ECFDF3', color: '#027A48', border: '#ABEFC6'},
  ReleasedWithWarnings: {bg: '#FFF7E8', color: '#B54708', border: '#F9DBAF'},
  Superseded:           {bg: '#F4F4F5', color: '#71717A', border: '#D4D4D8'},
};

const bucketStatusTone: Record<BucketStatus, {bg: string; color: string; border: string}> = {
  Feasible:         {bg: '#ECFDF3', color: '#027A48', border: '#ABEFC6'},
  AtRisk:           {bg: '#FFF7E8', color: '#B54708', border: '#F9DBAF'},
  Overloaded:       {bg: '#FEF3F2', color: '#B42318', border: '#FECDCA'},
  BelowLotSize:     {bg: '#FFF7E8', color: '#B54708', border: '#F9DBAF'},
  AboveLotSize:     {bg: '#FFF1F3', color: '#9E2A5A', border: '#FECDD3'},
  StockRisk:        {bg: '#FFF7E8', color: '#B54708', border: '#F9DBAF'},
  MissingData:      {bg: '#F4F4F5', color: '#71717A', border: '#D4D4D8'},
  RequiresDecision: {bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE'},
  Released:         {bg: '#ECFDF3', color: '#027A48', border: '#ABEFC6'},
};

const demandStatusTone: Record<DemandLineStatus, {bg: string; color: string; border: string}> = {
  NotStarted:       {bg: '#F8FAFC', color: 'var(--planning-text-secondary)', border: '#E2E8F0'},
  PartiallyPlanned: {bg: '#F0F9FF', color: '#0369A1', border: '#BAE6FD'},
  FullyPlanned:     {bg: '#ECFDF3', color: '#027A48', border: '#ABEFC6'},
  OverPlanned:      {bg: '#FEF3F2', color: '#B42318', border: '#FECDCA'},
  RequiresDecision: {bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE'},
};

const severityTone: Record<ExceptionSeverity, {bg: string; color: string; border: string}> = {
  Info:    {bg: '#EEF2FF', color: '#3730A3', border: '#C7D2FE'},
  Warning: {bg: '#FFF7E8', color: '#B54708', border: '#F9DBAF'},
  Blocker: {bg: '#FEF3F2', color: '#B42318', border: '#FECDCA'},
};

const assistantStepTone: Record<MpsAssistantStepStatus, {bg: string; color: string; border: string}> = {
  Pending: {bg: '#F8FAFC', color: 'var(--planning-text-secondary)', border: '#E2E8F0'},
  InProgress: {bg: '#EEF2FF', color: '#3730A3', border: '#C7D2FE'},
  Complete: {bg: '#ECFDF3', color: '#027A48', border: '#ABEFC6'},
  Warning: {bg: '#FFF7E8', color: '#B54708', border: '#F9DBAF'},
  Blocked: {bg: '#FEF3F2', color: '#B42318', border: '#FECDCA'},
  Skipped: {bg: '#F4F4F5', color: '#71717A', border: '#D4D4D8'},
};

const recommendationSeverityTone: Record<MpsAssistantRecommendationSeverity, {bg: string; color: string; border: string}> = {
  Info: {bg: '#EEF2FF', color: '#3730A3', border: '#C7D2FE'},
  Warning: {bg: '#FFF7E8', color: '#B54708', border: '#F9DBAF'},
  Blocker: {bg: '#FEF3F2', color: '#B42318', border: '#FECDCA'},
};

const readinessTone: Record<MpsAssistantFinalReadinessStatus, {bg: string; color: string; border: string; label: string}> = {
  NotReady: {bg: '#F8FAFC', color: 'var(--planning-text-secondary)', border: '#E2E8F0', label: 'Not Ready'},
  ReadyWithWarnings: {bg: '#FFF7E8', color: '#B54708', border: '#F9DBAF', label: 'Ready with Warnings'},
  ReadyForRelease: {bg: '#ECFDF3', color: '#027A48', border: '#ABEFC6', label: 'Ready for Release'},
  Blocked: {bg: '#FEF3F2', color: '#B42318', border: '#FECDCA', label: 'Blocked'},
};

type ChipSize = 'small' | 'medium';

export function MpsPlanStatusBadge({status, size = 'small'}: {status: MpsPlanStatus; size?: ChipSize}) {
  const tone = planStatusTone[status];
  return (
    <Chip
      label={status}
      size={size}
      sx={{fontWeight: 700, fontSize: 11, bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`, borderRadius: 1.5}}
    />
  );
}

export function MpsBucketStatusBadge({status, size = 'small'}: {status: BucketStatus; size?: ChipSize}) {
  const tone = bucketStatusTone[status];
  const label = status === 'BelowLotSize' ? 'Below Lot' : status === 'AboveLotSize' ? 'Above Lot' : status === 'StockRisk' ? 'Stock Risk' : status === 'MissingData' ? 'Missing Data' : status === 'RequiresDecision' ? 'Decision' : status;
  return (
    <Chip
      label={label}
      size={size}
      sx={{fontWeight: 700, fontSize: 11, bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`, borderRadius: 1.5}}
    />
  );
}

export function MpsDemandStatusBadge({status, size = 'small'}: {status: DemandLineStatus; size?: ChipSize}) {
  const tone = demandStatusTone[status];
  const label = status === 'NotStarted' ? 'Not Started' : status === 'PartiallyPlanned' ? 'Partial' : status === 'FullyPlanned' ? 'Full' : status === 'OverPlanned' ? 'Over' : 'Decision';
  return (
    <Chip
      label={label}
      size={size}
      sx={{fontWeight: 700, fontSize: 11, bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`, borderRadius: 1.5}}
    />
  );
}

export function SeverityBadge({severity, size = 'small'}: {severity: ExceptionSeverity; size?: ChipSize}) {
  const tone = severityTone[severity];
  return (
    <Chip
      label={severity}
      size={size}
      sx={{fontWeight: 700, fontSize: 11, bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`, borderRadius: 1.5}}
    />
  );
}

export function StepStatusBadge({status, size = 'small'}: {status: MpsAssistantStepStatus; size?: ChipSize}) {
  const tone = assistantStepTone[status];
  return (
    <Chip
      label={status === 'InProgress' ? 'In Progress' : status}
      size={size}
      sx={{fontWeight: 700, fontSize: 11, bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`, borderRadius: 1.5}}
    />
  );
}

export function RecommendationSeverityBadge({severity, size = 'small'}: {severity: MpsAssistantRecommendationSeverity; size?: ChipSize}) {
  const tone = recommendationSeverityTone[severity];
  return (
    <Chip
      label={severity}
      size={size}
      sx={{fontWeight: 700, fontSize: 11, bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`, borderRadius: 1.5}}
    />
  );
}

export function MpsReadinessBadge({status, size = 'small'}: {status: MpsAssistantFinalReadinessStatus; size?: ChipSize}) {
  const tone = readinessTone[status];
  return (
    <Chip
      label={tone.label}
      size={size}
      sx={{fontWeight: 700, fontSize: 11, bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`, borderRadius: 1.5}}
    />
  );
}
