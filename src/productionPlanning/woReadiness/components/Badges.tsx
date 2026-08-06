import React from 'react';
import {Chip} from '@mui/material';
import type {
  ReadinessSeverity,
  ReadinessStatus,
  ReleaseRecommendation,
  WorkOrderPriority,
  WorkOrderStatus,
} from '../types';

const tones = {
  green: {bg: '#ECFDF3', color: '#027A48', border: '#ABEFC6'},
  blue: {bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE'},
  orange: {bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA'},
  red: {bg: '#FEF2F2', color: '#B42318', border: '#FECDCA'},
  gray: {bg: '#F8FAFC', color: 'var(--planning-text-secondary)', border: '#D0D5DD'},
  purple: {bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE'},
} as const;

function badge(label: string, tone: keyof typeof tones, size: 'small' | 'medium' = 'small') {
  const value = tones[tone];
  return (
    <Chip
      label={label}
      size={size}
      sx={{
        height: size === 'small' ? 24 : 30,
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

export function ReadinessStatusBadge({status, size = 'small'}: {status: ReadinessStatus; size?: 'small' | 'medium'}) {
  const tone = status === 'Ready' ? 'green' : status === 'Warning' ? 'orange' : status === 'Blocked' ? 'red' : 'blue';
  return badge(status === 'NotChecked' ? 'Not Checked' : status, tone, size);
}

export function PriorityBadge({priority}: {priority: WorkOrderPriority}) {
  const tone = priority === 'Critical' ? 'red' : priority === 'High' ? 'orange' : priority === 'Medium' ? 'blue' : 'gray';
  return badge(priority, tone);
}

export function SeverityBadge({severity}: {severity: ReadinessSeverity}) {
  const tone = severity === 'Blocker' ? 'red' : severity === 'Warning' ? 'orange' : 'blue';
  return badge(severity, tone);
}

export function WorkOrderStatusBadge({status}: {status: WorkOrderStatus}) {
  const tone = status === 'Ready' || status === 'Running' || status === 'Released' ? 'blue' : status === 'Completed' ? 'green' : status === 'Blocked' ? 'red' : status === 'Paused' ? 'orange' : 'gray';
  return badge(status, tone);
}

export function ReleaseRecommendationBadge({recommendation}: {recommendation: ReleaseRecommendation}) {
  const tone =
    recommendation === 'Ready to Release'
      ? 'green'
      : recommendation === 'Ready with Warnings'
        ? 'orange'
        : recommendation === 'Do Not Release'
          ? 'red'
          : 'blue';
  return badge(recommendation, tone, 'medium');
}

export function NeutralBadge({label}: {label: string}) {
  return badge(label, 'purple');
}
