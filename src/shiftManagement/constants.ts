export const shiftLogbookCategories = [
  'Dashboard',
  'All',
  'Maintenance Request',
  'Maintenance Work Order',
  'OEE',
  'Quality',
  'Shift Notes',
  'ESO',
  'RCA',
  'CIL / Centerline',
  'Scrap',
  'Performance Output'
] as const;

export type ShiftLogbookCategory = typeof shiftLogbookCategories[number];

export const shiftLogbookCategoryToneMap: Record<string, string> = {
  'Dashboard': '#2F6BFF',
  'All': '#2F6BFF',
  'Maintenance Request': '#2F6BFF',
  'Maintenance Work Order': '#2F6BFF',
  'OEE': '#2F6BFF',
  'Quality': '#2F6BFF',
  'Shift Notes': '#2F6BFF',
  'ESO': '#2F6BFF',
  'RCA': '#2F6BFF',
  'CIL / Centerline': '#2F6BFF',
  'Scrap': '#2F6BFF',
  'Performance Output': '#2F6BFF',
};
