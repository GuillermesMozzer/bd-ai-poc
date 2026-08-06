import { TeamManagementMember } from './types/teamTypes';

export const resolveInitials = (name: string) => {
  const parts = name.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

export const shiftPeopleByRole = (members: TeamManagementMember[]) => ({
  operators: members.filter((m) => m.role === 'Operator').length,
  technicians: members.filter((m) => m.role === 'Technician').length,
  qaInspectors: members.filter((m) => m.role === 'QA Inspector').length,
});

export const shiftEfficiency = (shiftName: string, teamManagementMembersByShift: Record<string, TeamManagementMember[]>) => {
  const members = teamManagementMembersByShift[shiftName];
  if (!members || !members.length) return 0;
  const utilizationAvg = members.reduce((sum, member) => sum + member.utilization, 0) / members.length;
  const attendanceAvg = members.reduce((sum, member) => sum + member.attendance, 0) / members.length;
  return Math.round((utilizationAvg * 0.6) + (attendanceAvg * 0.4));
};

export const getInitials = (value: string) => {
  const parts = value.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return value.slice(0, 2).toUpperCase();
};

export const createInlineAvatarSrc = (name: string, accent = '#DBEAFE') => {
  const initials = getInitials(name);
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="${encodeURIComponent(accent)}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" font-weight="bold" fill="rgba(0,0,0,0.4)">${initials}</text></svg>`;
};

export const getShiftMemberAvatar = (name: string, teamManagementMembers: TeamManagementMember[]) => {
  const member = teamManagementMembers.find(m => m.name === name);
  if (member) {
    return {
      src: member.photo || createInlineAvatarSrc(member.name, member.avatarTone),
      accent: member.avatarTone,
    };
  }
  return {
    src: createInlineAvatarSrc(name),
    accent: '#DBEAFE',
  };
};
