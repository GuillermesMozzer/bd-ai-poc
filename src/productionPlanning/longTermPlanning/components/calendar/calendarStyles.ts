import type {CalendarPlanningEventType, ExceptionSeverity} from '../../types';

export const planningPageStyles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    p: {xs: 1.5, md: 2},
    borderRadius: 6,
    background: 'linear-gradient(180deg, #F7F9FF 0%, #FDFEFF 100%)',
  },
  panel: {
    borderRadius: 4,
    border: '1px solid #E4EAF5',
    bgcolor: '#FFFFFF',
    boxShadow: '0 20px 44px rgba(15, 23, 42, 0.06)',
  },
  sectionEyebrow: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: 900,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 24,
    color: '#0F172A',
    fontWeight: 900,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 1.6,
  },
};

export const severityTone: Record<ExceptionSeverity, {bg: string; color: string; border: string}> = {
  Info: {bg: '#EEF4FF', color: '#1D4ED8', border: '#C7D2FE'},
  Warning: {bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA'},
  Blocker: {bg: '#FEF2F2', color: '#DC2626', border: '#FECACA'},
};

export const eventTypeLabels: Record<CalendarPlanningEventType, string> = {
  Holiday: 'Holiday',
  AnnualShutdown: 'Annual shutdown',
  Blackout: 'Blackout',
  ReducedCapacity: 'Reduced capacity',
  Maintenance: 'Maintenance',
  Project: 'Project',
  SupplierTest: 'Supplier test',
  MaterialTest: 'Material test',
  Validation: 'Validation',
  EngineeringEvent: 'Engineering event',
  CapacityOverload: 'Capacity overload',
  AtRisk: 'At risk',
  ConstrainedDemand: 'Constrained demand',
  UncoveredDemand: 'Uncovered demand',
};

export const eventTypeTone: Record<CalendarPlanningEventType, {bg: string; color: string; border: string}> = {
  Holiday: {bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE'},
  AnnualShutdown: {bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA'},
  Blackout: {bg: '#E2E8F0', color: '#334155', border: '#CBD5E1'},
  ReducedCapacity: {bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA'},
  Maintenance: {bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE'},
  Project: {bg: '#ECFEFF', color: '#0F766E', border: '#A5F3FC'},
  SupplierTest: {bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0'},
  MaterialTest: {bg: '#ECFCCB', color: '#4D7C0F', border: '#D9F99D'},
  Validation: {bg: '#EEF2FF', color: '#4338CA', border: '#C7D2FE'},
  EngineeringEvent: {bg: '#F0FDFA', color: '#0F766E', border: '#99F6E4'},
  CapacityOverload: {bg: '#FEF2F2', color: '#DC2626', border: '#FECACA'},
  AtRisk: {bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA'},
  ConstrainedDemand: {bg: '#FEF2F2', color: '#DC2626', border: '#FECACA'},
  UncoveredDemand: {bg: '#FEF2F2', color: '#DC2626', border: '#FECACA'},
};
