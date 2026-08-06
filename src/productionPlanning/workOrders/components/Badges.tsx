import React from 'react';
import {Chip} from '@mui/material';
import type {
  WorkOrderExceptionSeverity,
  WorkOrderMaterialStatus,
  WorkOrderPriority,
  WorkOrderQualityStatus,
  WorkOrderReadinessCheckStatus,
  WorkOrderReadinessStatus,
  WorkOrderScheduleStatus,
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

export function WorkOrderPriorityBadge({priority}: {priority: WorkOrderPriority}) {
  const tone = priority === 'Critical' ? 'red' : priority === 'High' ? 'orange' : priority === 'Medium' ? 'blue' : 'gray';
  return toneChip(priority, tone);
}

export function WorkOrderStatusBadge({status}: {status: WorkOrderStatus}) {
  const tone =
    status === 'Completed'
      ? 'green'
      : status === 'Blocked'
        ? 'red'
        : status === 'Released' || status === 'Running'
          ? 'blue'
          : status === 'Paused' || status === 'Interrupted'
            ? 'orange'
            : 'gray';
  return toneChip(status, tone);
}

export function WorkOrderReadinessBadge({status}: {status: WorkOrderReadinessStatus}) {
  const tone = status === 'Ready' ? 'green' : status === 'Warning' ? 'orange' : status === 'Blocked' ? 'red' : 'gray';
  return toneChip(status === 'NotChecked' ? 'Not Checked' : status, tone);
}

export function WorkOrderMaterialBadge({status}: {status: WorkOrderMaterialStatus}) {
  const tone = status === 'Available' ? 'green' : status === 'Partial' ? 'orange' : 'red';
  return toneChip(status, tone);
}

export function WorkOrderQualityBadge({status}: {status: WorkOrderQualityStatus}) {
  const tone = status === 'Clear' ? 'green' : status === 'InspectionRequired' ? 'orange' : 'red';
  return toneChip(status === 'InspectionRequired' ? 'Inspection Req.' : status, tone);
}

export function WorkOrderScheduleBadge({status}: {status: WorkOrderScheduleStatus}) {
  const tone = status === 'OnTime' ? 'green' : status === 'AtRisk' ? 'orange' : 'red';
  return toneChip(status === 'OnTime' ? 'On Time' : status === 'AtRisk' ? 'At Risk' : 'Late', tone);
}

export function WorkOrderCheckBadge({status}: {status: WorkOrderReadinessCheckStatus}) {
  const tone = status === 'Ready' ? 'green' : status === 'Warning' ? 'orange' : status === 'Blocked' ? 'red' : 'gray';
  const label = status === 'NotChecked' ? 'Not Checked' : status;
  return toneChip(label, tone);
}

export function ReleaseRecommendationBadge({recommendation}: {recommendation: string}) {
  const tone =
    recommendation === 'Release' ? 'green' :
    recommendation === 'ReleaseWithWarning' ? 'orange' :
    recommendation === 'DoNotRelease' ? 'red' : 'gray';
  const label =
    recommendation === 'ReleaseWithWarning' ? 'Release With Warning' :
    recommendation === 'DoNotRelease' ? 'Do Not Release' :
    recommendation === 'NotReady' ? 'Not Ready' : recommendation;
  return toneChip(label, tone);
}

export function WorkOrderExceptionSeverityBadge({severity}: {severity: WorkOrderExceptionSeverity}) {
  const tone = severity === 'Info' ? 'blue' : severity === 'Warning' ? 'orange' : 'red';
  return toneChip(severity, tone);
}

export function CountBadge({count}: {count: number}) {
  return toneChip(String(count), count > 0 ? 'red' : 'gray');
}

export function LineBadge({label}: {label: string}) {
  return toneChip(label, 'blue');
}

export function PurpleBadge({label}: {label: string}) {
  return toneChip(label, 'purple');
}
