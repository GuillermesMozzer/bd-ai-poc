export const DEFAULT_USER_NAME = 'Guest User';

export type AppUserRole = 'director' | 'leader' | 'operator' | 'technician' | 'planner';
export type AppSignedInViewMode = 'line' | 'operator';

export const resolveDisplayNameFromLogin = (rawValue: string) => {
  const trimmed = rawValue.trim();
  const loginHandle = trimmed.includes('@') ? trimmed.split('@')[0] : trimmed;
  const normalized = loginHandle.replace(/[._-]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!normalized) return DEFAULT_USER_NAME;
  return normalized
    .split(' ')
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(' ');
};

export const resolveUserRoleFromLogin = (rawValue: string): AppUserRole => {
  const normalizedEmail = rawValue.trim().toLowerCase();

  if (normalizedEmail === 'leader@bd.com') {
    return 'leader';
  }

  if (normalizedEmail === 'operator@bd.com') {
    return 'operator';
  }

  if (normalizedEmail === 'technician@bd.com') {
    return 'technician';
  }

  if (normalizedEmail === 'planner@bd.com') {
    return 'planner';
  }

  return 'director';
};

export const resolveSignedInViewModeForRole = (role: AppUserRole): AppSignedInViewMode => (
  role === 'operator' ? 'operator' : 'line'
);

export const resolveWorkstationCreateStreamsForRole = (role: AppUserRole) => (
  role === 'operator'
    ? ['Shift Logbook', 'Doc Manager', 'Action Tracker']
    : role === 'technician'
      ? ['Maintenance Calendar', 'Maintenance Analytics', 'CBM & PdM', 'Maintenance']
      : role === 'planner'
        ? ['Demand Forecast', 'Capacity Planning', 'MPS', 'Schedule & Order Planning', 'Production Lineage']
      : ['CIL', 'Centerline', 'Equipment Setup Changeover', 'Manage Activities']
);

export const resolveInitials = (name: string) => {
  const parts = name.split(' ').filter(Boolean);
  return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || 'OP';
};
