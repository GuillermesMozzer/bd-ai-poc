export const tierChartMonths = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

export function reorderCalendarYearToTierYear<T>(values: T[]) {
  return [...values.slice(9), ...values.slice(0, 9)];
}

export function buildMonthDayLabels(count: number) {
  if (count <= 1) return ['01'];

  return Array.from({length: count}, (_, index) => {
    const day = Math.round(1 + (index / (count - 1)) * 30);
    return String(day).padStart(2, '0');
  });
}
