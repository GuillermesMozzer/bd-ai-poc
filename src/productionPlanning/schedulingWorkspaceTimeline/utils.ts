import type {
  ScheduledWorkOrder,
  SchedulingTimelineLine,
  SelectedEventTypesState,
  TimelineBarPosition,
  TimelineCategoryConfig,
  TimelineConflictMap,
  TimelineDateRange,
  TimelineDayGroup,
  TimelineEvent,
  TimelineFiltersState,
  TimelineHourColumn,
  TimelineLineLoadSummaryItem,
  TimelineSelectionSummary,
  TimelineShortcut,
  TimelineStackLane,
} from './types';

export const TIMELINE_REFERENCE_DATE = '2026-05-14';
export const TIMELINE_HOUR_CELL_WIDTH = 52;

export const defaultTimelineFilters: TimelineFiltersState = {
  lineId: 'all',
  status: 'all',
  priority: 'all',
  impact: 'all',
  productSearch: '',
  showConflictsOnly: false,
  showExceptionsOnly: false,
};

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

export function endOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 0, 0, 0);
}

export function parseLocalDate(dateValue: string) {
  const [year, month, day] = dateValue.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

export function parseLocalDateTime(dateTimeValue: string) {
  const [datePart, timePart = '00:00'] = dateTimeValue.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute = 0] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

export function formatIsoDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatIsoDateTime(date: Date) {
  return `${formatIsoDate(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatTimelineDayLabel(dateValue: string | Date) {
  const date = typeof dateValue === 'string' ? parseLocalDate(dateValue) : dateValue;
  return date.toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'});
}

export function formatTimelineHourLabel(dateTimeValue: string | Date) {
  const date = typeof dateTimeValue === 'string' ? parseLocalDateTime(dateTimeValue) : dateTimeValue;
  return pad(date.getHours());
}

export function getDateRangeFromShortcut(shortcut: TimelineShortcut, baseDate = TIMELINE_REFERENCE_DATE): TimelineDateRange {
  const start = parseLocalDate(baseDate);
  const end = new Date(start);

  if (shortcut === 'ThreeDays') {
    end.setDate(end.getDate() + 2);
  } else if (shortcut === 'SevenDays') {
    end.setDate(end.getDate() + 6);
  } else if (shortcut === 'FifteenDays') {
    end.setDate(end.getDate() + 14);
  } else if (shortcut === 'OneMonth') {
    end.setMonth(end.getMonth() + 1);
  }

  return {
    startDate: formatIsoDate(start),
    endDate: formatIsoDate(end),
    shortcut,
  };
}

export function shiftTimelineRange(dateRange: TimelineDateRange, direction: -1 | 1): TimelineDateRange {
  const start = parseLocalDate(dateRange.startDate);
  const end = parseLocalDate(dateRange.endDate);
  const dayCount = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
  start.setDate(start.getDate() + dayCount * direction);
  end.setDate(end.getDate() + dayCount * direction);
  return {
    startDate: formatIsoDate(start),
    endDate: formatIsoDate(end),
    shortcut: 'Custom',
  };
}

export function generateTimelineHourColumns(startDate: string, endDate: string) {
  const start = startOfLocalDay(parseLocalDate(startDate));
  const end = endOfLocalDay(parseLocalDate(endDate));
  const columns: TimelineHourColumn[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const bucketStart = new Date(cursor);
    const bucketEnd = new Date(cursor);
    bucketEnd.setHours(bucketEnd.getHours() + 1);
    columns.push({
      id: `${formatIsoDate(cursor)}-${pad(cursor.getHours())}`,
      date: formatIsoDate(cursor),
      hour: cursor.getHours(),
      startDateTime: formatIsoDateTime(bucketStart),
      endDateTime: formatIsoDateTime(bucketEnd),
      dayLabel: formatTimelineDayLabel(cursor),
      hourLabel: formatTimelineHourLabel(cursor),
    });
    cursor.setHours(cursor.getHours() + 1);
  }

  return columns;
}

export function generateTimelineDayGroups(hourColumns: TimelineHourColumn[]) {
  const groups: TimelineDayGroup[] = [];

  hourColumns.forEach((column, index) => {
    const lastGroup = groups[groups.length - 1];
    if (!lastGroup || lastGroup.date !== column.date) {
      groups.push({
        id: `day-${column.date}`,
        date: column.date,
        dayLabel: column.dayLabel,
        startColumnIndex: index,
        columnSpan: 1,
      });
      return;
    }
    lastGroup.columnSpan += 1;
  });

  return groups;
}

function intersectsBucket(start: Date, end: Date, bucketStart: Date, bucketEnd: Date) {
  return start < bucketEnd && end > bucketStart;
}

function calculateBarPosition(startDateTime: string, endDateTime: string, hourColumns: TimelineHourColumn[], hourCellWidth = TIMELINE_HOUR_CELL_WIDTH): TimelineBarPosition {
  const start = parseLocalDateTime(startDateTime);
  const end = parseLocalDateTime(endDateTime);
  const visibleIndexes = hourColumns
    .map((column, index) => {
      const bucketStart = parseLocalDateTime(column.startDateTime);
      const bucketEnd = parseLocalDateTime(column.endDateTime);
      return intersectsBucket(start, end, bucketStart, bucketEnd) ? index : -1;
    })
    .filter((index) => index >= 0);

  if (visibleIndexes.length === 0) {
    return {
      startColumnIndex: -1,
      columnSpan: 0,
      left: 0,
      width: 0,
      isClippedStart: false,
      isClippedEnd: false,
      visible: false,
    };
  }

  const startColumnIndex = visibleIndexes[0];
  const endColumnIndex = visibleIndexes[visibleIndexes.length - 1];
  return {
    startColumnIndex,
    columnSpan: endColumnIndex - startColumnIndex + 1,
    left: startColumnIndex * hourCellWidth,
    width: (endColumnIndex - startColumnIndex + 1) * hourCellWidth,
    isClippedStart: parseLocalDateTime(hourColumns[0].startDateTime) > start,
    isClippedEnd: parseLocalDateTime(hourColumns[hourColumns.length - 1].endDateTime) < end,
    visible: true,
  };
}

export function calculateWorkOrderBarPosition(workOrder: ScheduledWorkOrder, hourColumns: TimelineHourColumn[], hourCellWidth = TIMELINE_HOUR_CELL_WIDTH) {
  return calculateBarPosition(workOrder.plannedStartDateTime, workOrder.plannedEndDateTime, hourColumns, hourCellWidth);
}

export function calculateEventBarPosition(event: TimelineEvent, hourColumns: TimelineHourColumn[], hourCellWidth = TIMELINE_HOUR_CELL_WIDTH) {
  return calculateBarPosition(event.startDateTime, event.endDateTime, hourColumns, hourCellWidth);
}

function overlapHours(startA: string, endA: string, startB: string, endB: string) {
  const start = Math.max(parseLocalDateTime(startA).getTime(), parseLocalDateTime(startB).getTime());
  const end = Math.min(parseLocalDateTime(endA).getTime(), parseLocalDateTime(endB).getTime());
  return Math.max(0, (end - start) / 3600000);
}

export function calculateLineUtilization(lineId: string, scheduledWorkOrders: ScheduledWorkOrder[], events: TimelineEvent[], dateRange: TimelineDateRange) {
  const rangeColumns = generateTimelineHourColumns(dateRange.startDate, dateRange.endDate);
  const totalHours = rangeColumns.length;
  const lineWorkOrders = scheduledWorkOrders.filter((item) => item.lineId === lineId);
  const plannedHours = lineWorkOrders.reduce((sum, item) => sum + calculateWorkOrderBarPosition(item, rangeColumns).columnSpan, 0);
  const unavailableHours = events
    .filter((item) => item.lineId === lineId && ['Downtime', 'Maintenance', 'Sterilization', 'Exception / Conflict'].includes(item.category))
    .reduce((sum, item) => sum + calculateEventBarPosition(item, rangeColumns).columnSpan, 0);
  const availableHours = Math.max(0, totalHours - unavailableHours);
  const utilizationPercent = availableHours > 0 ? Number(((plannedHours / availableHours) * 100).toFixed(1)) : 0;
  return {
    plannedHours,
    availableHours,
    utilizationPercent,
  };
}

export function summarizeSelectedEventTypes(categoryConfig: TimelineCategoryConfig[], selectedEventTypes: SelectedEventTypesState): TimelineSelectionSummary {
  const selectedCountByCategory: Record<string, number> = {};
  const totalCountByCategory: Record<string, number> = {};
  let totalSelectedCount = 0;
  let totalEventTypeCount = 0;

  categoryConfig.forEach((category) => {
    const selectedCount = category.eventTypes.reduce((count, eventType) => count + (selectedEventTypes[category.name]?.[eventType] ? 1 : 0), 0);
    selectedCountByCategory[category.name] = selectedCount;
    totalCountByCategory[category.name] = category.eventTypes.length;
    totalSelectedCount += selectedCount;
    totalEventTypeCount += category.eventTypes.length;
  });

  const allSelected = totalSelectedCount === totalEventTypeCount;
  const noneSelected = totalSelectedCount === 0;
  return {
    allSelected,
    noneSelected,
    someSelected: !allSelected && !noneSelected,
    selectedCountByCategory,
    totalCountByCategory,
    totalSelectedCount,
    totalEventTypeCount,
  };
}

export function getCategorySelectionState(categoryName: string, selectionSummary: TimelineSelectionSummary) {
  const selectedCount = selectionSummary.selectedCountByCategory[categoryName] ?? 0;
  const totalCount = selectionSummary.totalCountByCategory[categoryName] ?? 0;
  return {
    allSelected: totalCount > 0 && selectedCount === totalCount,
    noneSelected: selectedCount === 0,
    someSelected: selectedCount > 0 && selectedCount < totalCount,
  };
}

export function setAllEventTypesSelection(categoryConfig: TimelineCategoryConfig[], selected: boolean) {
  return categoryConfig.reduce<SelectedEventTypesState>((accumulator, category) => {
    accumulator[category.name] = category.eventTypes.reduce<Record<string, boolean>>((eventTypeAccumulator, eventType) => {
      eventTypeAccumulator[eventType] = selected;
      return eventTypeAccumulator;
    }, {});
    return accumulator;
  }, {});
}

export function setCategoryEventTypesSelection(currentState: SelectedEventTypesState, category: TimelineCategoryConfig, selected: boolean) {
  return {
    ...currentState,
    [category.name]: category.eventTypes.reduce<Record<string, boolean>>((accumulator, eventType) => {
      accumulator[eventType] = selected;
      return accumulator;
    }, {}),
  };
}

export function toggleSingleEventTypeSelection(currentState: SelectedEventTypesState, categoryName: string, eventType: string) {
  return {
    ...currentState,
    [categoryName]: {
      ...currentState[categoryName],
      [eventType]: !currentState[categoryName]?.[eventType],
    },
  };
}

export function filterTimelineItems(
  workOrders: ScheduledWorkOrder[],
  events: TimelineEvent[],
  filters: TimelineFiltersState,
  conflicts: TimelineConflictMap,
  selectedEventTypes: SelectedEventTypesState,
) {
  const search = filters.productSearch.trim().toLowerCase();
  const filteredWorkOrders = workOrders.filter((item) => {
    if (filters.lineId !== 'all' && item.lineId !== filters.lineId) {
      return false;
    }
    if (filters.status !== 'all' && item.status !== filters.status) {
      return false;
    }
    if (filters.priority !== 'all' && item.priority !== filters.priority) {
      return false;
    }
    if (
      search &&
      !`${item.woNumber} ${item.productCode} ${item.productDescription} ${item.batchNumber} ${item.machineName ?? ''} ${item.machineType ?? ''} ${item.operationName ?? ''}`.toLowerCase().includes(search)
    ) {
      return false;
    }
    if (filters.showConflictsOnly && !(conflicts.workOrderConflicts[item.id]?.length)) {
      return false;
    }
    if (filters.showExceptionsOnly && item.exceptionCount <= 0) {
      return false;
    }
    return true;
  });

  const filteredEvents = events.filter((item) => {
    if (!selectedEventTypes[item.category]?.[item.eventType]) {
      return false;
    }
    if (filters.lineId !== 'all' && item.lineId !== filters.lineId) {
      return false;
    }
    if (filters.status !== 'all' && item.status !== filters.status) {
      return false;
    }
    if (filters.impact !== 'all' && item.severity !== filters.impact) {
      return false;
    }
    if (filters.showConflictsOnly && !(conflicts.eventConflicts[item.id]?.length)) {
      return false;
    }
    if (
      search &&
      !`${item.eventType} ${item.category} ${item.description} ${item.workOrderId ?? ''} ${item.productCode ?? ''} ${item.machineName ?? ''}`.toLowerCase().includes(search)
    ) {
      return false;
    }
    return true;
  });

  return {
    workOrders: filteredWorkOrders,
    events: filteredEvents,
  };
}

export function getTimelineVisibleRange(hourColumns: TimelineHourColumn[]) {
  if (!hourColumns.length) {
    return {startDateTime: '', endDateTime: ''};
  }
  return {
    startDateTime: hourColumns[0].startDateTime,
    endDateTime: hourColumns[hourColumns.length - 1].endDateTime,
  };
}

export function detectTimelineConflicts(workOrders: ScheduledWorkOrder[], events: TimelineEvent[]) {
  const workOrderConflicts: Record<string, string[]> = {};
  const eventConflicts: Record<string, string[]> = {};
  const lineConflictCounts: Record<string, number> = {};
  const machineConflictCounts: Record<string, number> = {};

  for (let index = 0; index < workOrders.length; index += 1) {
    const current = workOrders[index];
    workOrderConflicts[current.id] = workOrderConflicts[current.id] ?? [];

    if (current.readinessStatus === 'Blocked') {
      workOrderConflicts[current.id].push('Blocked readiness is scheduled as executable.');
    }

    for (let otherIndex = index + 1; otherIndex < workOrders.length; otherIndex += 1) {
      const other = workOrders[otherIndex];
      const sameMachine = current.machineId && other.machineId && current.machineId === other.machineId;
      const sameLine = !current.machineId && !other.machineId && current.lineId === other.lineId;
      if (!sameMachine && !sameLine) {
        continue;
      }
      if (overlapHours(current.plannedStartDateTime, current.plannedEndDateTime, other.plannedStartDateTime, other.plannedEndDateTime) > 0) {
        workOrderConflicts[current.id].push(`Overlaps ${other.woNumber} on the same ${sameMachine ? 'machine' : 'line'}.`);
        workOrderConflicts[other.id] = workOrderConflicts[other.id] ?? [];
        workOrderConflicts[other.id].push(`Overlaps ${current.woNumber} on the same ${sameMachine ? 'machine' : 'line'}.`);
      }
    }

    for (const event of events) {
      const sameMachine = current.machineId && event.machineId && current.machineId === event.machineId;
      const sameLine = !current.machineId && !event.machineId && event.lineId === current.lineId;
      if (!sameMachine && !sameLine) {
        continue;
      }
      if (!['Downtime', 'Maintenance', 'Quality', 'Material', 'Sterilization', 'Exception / Conflict', 'AI Risk Alerts'].includes(event.category)) {
        continue;
      }
      if (overlapHours(current.plannedStartDateTime, current.plannedEndDateTime, event.startDateTime, event.endDateTime) > 0) {
        workOrderConflicts[current.id].push(`Overlaps ${event.eventType}.`);
        eventConflicts[event.id] = eventConflicts[event.id] ?? [];
        eventConflicts[event.id].push(`Impacts ${current.woNumber}.`);
      }
    }

    if (workOrderConflicts[current.id].length > 0) {
      lineConflictCounts[current.lineId] = (lineConflictCounts[current.lineId] ?? 0) + 1;
      if (current.machineId) {
        machineConflictCounts[current.machineId] = (machineConflictCounts[current.machineId] ?? 0) + 1;
      }
    }
  }

  return {
    workOrderConflicts,
    eventConflicts,
    lineConflictCounts,
    machineConflictCounts,
  };
}

type StackableItem = {
  id: string;
  startDateTime: string;
  endDateTime: string;
};

export function assignTimelineStackLanes<T extends StackableItem>(items: T[]) {
  const laneEndTimes: number[] = [];
  return items
    .slice()
    .sort((left, right) => parseLocalDateTime(left.startDateTime).getTime() - parseLocalDateTime(right.startDateTime).getTime())
    .reduce<Record<string, TimelineStackLane>>((accumulator, item) => {
      const start = parseLocalDateTime(item.startDateTime).getTime();
      const end = parseLocalDateTime(item.endDateTime).getTime();
      let laneIndex = laneEndTimes.findIndex((laneEnd) => laneEnd <= start);
      if (laneIndex === -1) {
        laneIndex = laneEndTimes.length;
        laneEndTimes.push(end);
      } else {
        laneEndTimes[laneIndex] = end;
      }
      accumulator[item.id] = {id: item.id, laneIndex};
      return accumulator;
    }, {});
}

export function buildLineLoadSummary(lines: SchedulingTimelineLine[], workOrders: ScheduledWorkOrder[], events: TimelineEvent[], dateRange: TimelineDateRange, conflicts: TimelineConflictMap) {
  return lines.map<TimelineLineLoadSummaryItem>((line) => {
    const lineOnlyWorkOrders = workOrders.filter((item) => item.lineId === line.id && !item.machineId);
    const lineOnlyEvents = events.filter((item) => item.lineId === line.id && !item.machineId);
    const utilization = calculateLineUtilization(line.id, lineOnlyWorkOrders, lineOnlyEvents, dateRange);
    const lineWorkOrders = lineOnlyWorkOrders;
    return {
      lineId: line.id,
      plannedHours: utilization.plannedHours,
      availableHours: utilization.availableHours,
      utilizationPercent: utilization.utilizationPercent,
      conflictCount: conflicts.lineConflictCounts[line.id] ?? 0,
      exceptionCount: lineWorkOrders.reduce((sum, item) => sum + item.exceptionCount, 0),
    };
  });
}
