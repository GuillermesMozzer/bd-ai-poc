import React from 'react';
import { Chip, type SxProps } from '@mui/material';
import type { WOLifecycleStatus, WOReadinessStatus, WORiskLevel } from '../types';

export const LIFECYCLE_COLORS: Record<WOLifecycleStatus, { bg: string; color: string; label: string }> = {
  Draft:           { bg: '#F1F5F9', color: 'var(--planning-text-secondary)', label: 'Draft' },
  Planned:         { bg: '#EFF6FF', color: '#2563EB', label: 'Planned' },
  Scheduled:       { bg: '#F0F9FF', color: '#0369A1', label: 'Scheduled' },
  ReadyForRelease: { bg: '#ECFDF5', color: '#059669', label: 'Ready for Release' },
  Released:        { bg: '#D1FAE5', color: '#047857', label: 'Released' },
  InExecution:     { bg: '#FEF9C3', color: '#92400E', label: 'In Execution' },
  OnHold:          { bg: '#FEF3C7', color: '#B45309', label: 'On Hold' },
  Completed:       { bg: '#F0FDF4', color: '#15803D', label: 'Completed' },
  Closed:          { bg: '#F8FAFC', color: 'var(--planning-text-muted)', label: 'Closed' },
  Cancelled:       { bg: '#FEF2F2', color: '#991B1B', label: 'Cancelled' },
};

export const READINESS_COLORS: Record<WOReadinessStatus, { bg: string; color: string; label: string }> = {
  Ready:         { bg: '#ECFDF5', color: '#059669', label: 'Ready' },
  Warning:       { bg: '#FFFBEB', color: '#D97706', label: 'Warning' },
  Blocked:       { bg: '#FEF2F2', color: '#DC2626', label: 'Blocked' },
  NotApplicable: { bg: '#F8FAFC', color: 'var(--planning-text-muted)', label: 'N/A' },
};

export const RISK_COLORS: Record<WORiskLevel, { bg: string; color: string; label: string }> = {
  Low:      { bg: '#F0FDF4', color: '#15803D', label: 'Low' },
  Medium:   { bg: '#FFFBEB', color: '#D97706', label: 'Medium' },
  High:     { bg: '#FFF7ED', color: '#EA580C', label: 'High' },
  Critical: { bg: '#FEF2F2', color: '#DC2626', label: 'Critical' },
};

export const LifecycleChip = ({ status, size = 'small', sx }: { status: WOLifecycleStatus; size?: 'small' | 'medium'; sx?: SxProps }) => {
  const c = LIFECYCLE_COLORS[status];
  return <Chip label={c.label} size={size} sx={{ bgcolor: c.bg, color: c.color, fontWeight: 700, fontSize: '0.7rem', border: `1px solid color-mix(in srgb, ${c.color} 13%, transparent)`, ...sx }} />;
};

export const ReadinessChip = ({ status, size = 'small', sx }: { status: WOReadinessStatus; size?: 'small' | 'medium'; sx?: SxProps }) => {
  const c = READINESS_COLORS[status];
  return <Chip label={c.label} size={size} sx={{ bgcolor: c.bg, color: c.color, fontWeight: 700, fontSize: '0.7rem', border: `1px solid color-mix(in srgb, ${c.color} 13%, transparent)`, ...sx }} />;
};

export const RiskChip = ({ level, size = 'small', sx }: { level: WORiskLevel; size?: 'small' | 'medium'; sx?: SxProps }) => {
  const c = RISK_COLORS[level];
  return <Chip label={c.label} size={size} sx={{ bgcolor: c.bg, color: c.color, fontWeight: 700, fontSize: '0.7rem', border: `1px solid color-mix(in srgb, ${c.color} 20%, transparent)`, ...sx }} />;
};

export const DataFreshnessChip = ({ freshness, hours, sx }: { freshness: string; hours: number; sx?: SxProps }) => {
  const color = freshness === 'Fresh' ? '#059669' : freshness === 'Stale' ? '#D97706' : '#DC2626';
  const bg = freshness === 'Fresh' ? '#ECFDF5' : freshness === 'Stale' ? '#FFFBEB' : '#FEF2F2';
  const label = freshness === 'Fresh'
    ? `${hours < 1 ? Math.round(hours * 60) + 'm' : hours + 'h'} ago`
    : freshness === 'Stale' ? `${hours}h – Stale` : `${hours}h – Very Stale`;
  return <Chip label={label} size="small" sx={{ bgcolor: bg, color, fontWeight: 600, fontSize: '0.68rem', border: `1px solid color-mix(in srgb, ${color} 20%, transparent)`, ...sx }} />;
};
