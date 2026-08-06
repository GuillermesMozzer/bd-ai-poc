import React from 'react';
import {Chip} from '@mui/material';
import type {AiConfidence, ActionStatus, FreshnessState, RiskSeverity, WoPriority, WoReadiness} from '../types';

const tones = {
  green: {bg: '#ECFDF3', color: '#027A48', border: '#ABEFC6'},
  blue: {bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE'},
  orange: {bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA'},
  red: {bg: '#FEF2F2', color: '#B42318', border: '#FECDCA'},
  gray: {bg: '#F8FAFC', color: 'var(--planning-text-secondary)', border: '#D0D5DD'},
  purple: {bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE'},
  teal: {bg: '#ECFDFA', color: '#0F766E', border: '#99F6E4'},
} as const;

function toneChip(label: string, tone: keyof typeof tones, size: 'small' | 'medium' = 'small') {
  const value = tones[tone];
  return (
    <Chip
      label={label}
      size={size}
      sx={{
        height: size === 'small' ? 22 : 28,
        fontSize: size === 'small' ? 11 : 12,
        fontWeight: 800,
        bgcolor: value.bg,
        color: value.color,
        border: `1px solid ${value.border}`,
        borderRadius: 1.5,
      }}
    />
  );
}

export function PriorityBadge({priority}: {priority: WoPriority}) {
  const tone = priority === 'Critical' ? 'red' : priority === 'High' ? 'orange' : priority === 'Medium' ? 'blue' : 'gray';
  return toneChip(priority, tone);
}

export function SeverityBadge({severity}: {severity: RiskSeverity}) {
  const tone = severity === 'Critical' ? 'red' : severity === 'High' ? 'orange' : severity === 'Medium' ? 'blue' : 'gray';
  return toneChip(severity, tone);
}

export function ReadinessBadge({status}: {status: WoReadiness}) {
  const tone = status === 'Blocked' ? 'red' : status === 'Warning' ? 'orange' : 'green';
  return toneChip(status, tone);
}

export function ConfidenceBadge({confidence}: {confidence: AiConfidence}) {
  const tone = confidence === 'High' ? 'green' : confidence === 'Medium' ? 'orange' : 'red';
  return toneChip(confidence, tone);
}

export function StatusBadge({status}: {status: ActionStatus}) {
  const toneByStatus: Record<ActionStatus, keyof typeof tones> = {
    New: 'gray',
    Assigned: 'blue',
    'In Review': 'purple',
    'Waiting Response': 'orange',
    Escalated: 'red',
    Completed: 'green',
    'Resolved Pending Recheck': 'teal',
    Rejected: 'red',
  };
  return toneChip(status, toneByStatus[status]);
}

export function ReadinessCheckBadge({status}: {status: 'Ready' | 'Warning' | 'Blocked' | 'N/A'}) {
  const tone = status === 'Ready' ? 'green' : status === 'Warning' ? 'orange' : status === 'Blocked' ? 'red' : 'gray';
  return toneChip(status, tone);
}

export function FreshnessBadge({state}: {state: FreshnessState}) {
  const tone = state === 'Fresh' ? 'green' : state === 'Watch' ? 'orange' : 'red';
  return toneChip(state, tone);
}

export function GovernedBadge() {
  return toneChip('Confirmation required', 'purple');
}

export function AiLabel() {
  return (
    <Chip
      label="AI"
      size="small"
      sx={{
        height: 18,
        fontSize: 10,
        fontWeight: 900,
        bgcolor: 'var(--planning-neutral-bg)',
        color: '#1D4ED8',
        border: '1px solid #BFDBFE',
        borderRadius: 1,
        letterSpacing: '0.04em',
      }}
    />
  );
}
