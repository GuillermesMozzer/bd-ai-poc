import React from 'react';
import {Chip} from '@mui/material';
import type {MaterialStatus} from '../types';

const tones = {
  green: {bg: '#ECFDF3', color: '#027A48', border: '#ABEFC6'},
  amber: {bg: '#FFFBEB', color: '#B45309', border: '#FDE68A'},
  orange: {bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA'},
  red: {bg: '#FEF2F2', color: '#B42318', border: '#FECDCA'},
  blue: {bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE'},
  purple: {bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE'},
  gray: {bg: '#F8FAFC', color: 'var(--planning-text-secondary)', border: '#D0D5DD'},
} as const;

export function toneChip(label: string, tone: keyof typeof tones, size: 'small' | 'medium' = 'small') {
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

export function MaterialStatusBadge({status}: {status: MaterialStatus}) {
  const tone: keyof typeof tones =
    status === 'Ready' ? 'green' :
    status === 'Warning' ? 'amber' :
    status === 'Critical' ? 'orange' :
    status === 'Blocked' ? 'red' :
    status === 'On Hold' ? 'purple' :
    status === 'In Transit' ? 'blue' :
    status === 'Shortage' ? 'red' :
    'gray';
  return toneChip(status, tone);
}

export function GenericStatusBadge({label, tone}: {label: string; tone: keyof typeof tones}) {
  return toneChip(label, tone);
}

export function ApprovalStatusBadge({status}: {status: string}) {
  const tone: keyof typeof tones =
    status === 'Approved' ? 'green' :
    status === 'Pending Approval' ? 'amber' :
    status === 'Rejected' ? 'red' :
    'gray';
  return toneChip(status, tone);
}

export function ReceiptStatusBadge({status}: {status: string}) {
  const tone: keyof typeof tones =
    status === 'Released' ? 'green' :
    status === 'Confirmed' ? 'blue' :
    status === 'Pending' ? 'amber' :
    status === 'Blocked' ? 'red' :
    status === 'Under Review' ? 'purple' :
    status === 'Inspection Required' ? 'orange' :
    'gray';
  return toneChip(status, tone);
}

export function StagingStatusBadge({status}: {status: string}) {
  const tone: keyof typeof tones =
    status === 'Staged' ? 'green' :
    status === 'Partial' ? 'amber' :
    status === 'Blocked' ? 'red' :
    status === 'Picking' ? 'blue' :
    'gray';
  return toneChip(status, tone);
}
