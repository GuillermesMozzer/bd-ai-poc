import { useState, useMemo, useCallback } from 'react';

export type ShiftSettingsTab = 'configuration' | 'patterns' | 'lineAssignments' | 'workingCalendar' | 'holidays' | 'requests';
export type ShiftRequestStatus = 'Requested' | 'Approved' | 'Rejected';

export type ShiftConfigItem = {
  id: string;
  name: string;
  abbreviation?: string;
  colorCode?: string;
  isNonWorking?: boolean;
  shiftType: string;
  start: string;
  end: string;
  duration: string;
  isActive: boolean;
  notes?: string;
};

export type CrewPatternItem = {
  id: string;
  name: string;
  shiftIds: string[];
  crewCount: number;
  crewNames: string[];
  crewTeams?: Array<{
    name: string;
    abbreviation: string;
    sequenceStartDate: string;
  }>;
  rotationSequence: string;
  offsetLogic: string;
  workingRestBlocks: string;
  weekendBehavior: string;
  isActive: boolean;
  notes?: string;
};

export type LinePatternAssignmentItem = {
  id: string;
  lineArea: string;
  crewPatternId: string;
  teamCrew?: string;
  crewPatternName?: string;
  assignmentType?: 'Primary' | 'Support' | 'Temporary';
  status?: 'Active' | 'Draft' | 'Inactive';
  startDate: string;
  endDate: string;
  isActive: boolean;
  notes?: string;
};

export type HolidayItem = {
  id: string;
  title: string;
  type: 'Holiday' | 'Maintenance' | 'Production Stop' | 'Plant Shutdown' | 'Training Event' | 'Other';
  scope: 'Entire Site' | 'Department' | 'Area' | 'Line';
  scopeDetail: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  description: string;
  reason: string;
  isActive: boolean;
};

export type ShiftRequestItem = {
  id: string;
  type: string;
  requestedBy: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: ShiftRequestStatus;
};

interface UseShiftSettingsActionsProps {
  initialShiftConfigItems: ShiftConfigItem[];
  initialCrewPatternItems: CrewPatternItem[];
  initialLinePatternAssignmentItems: LinePatternAssignmentItem[];
  initialHolidayItems: HolidayItem[];
  initialShiftRequestItems: ShiftRequestItem[];
}

const crewPatternMockShiftOverrides: Record<string, Partial<ShiftConfigItem>> = {
  morning: { abbreviation: 'MN', colorCode: '#2563EB', start: '06:00', end: '14:00', duration: '8h', isNonWorking: false },
  afternoon: { abbreviation: 'AF', colorCode: '#0F766E', start: '14:00', end: '22:00', duration: '8h', isNonWorking: false },
  night: { abbreviation: 'NI', colorCode: '#7C3AED', start: '22:00', end: '06:00', duration: '8h', isNonWorking: false },
  'day off': { abbreviation: 'OFF', colorCode: '#DC2626', start: '', end: '', duration: 'Non-working', isNonWorking: true },
};

const defaultTeamLineAssignmentItems: LinePatternAssignmentItem[] = [
  {
    id: 'team-line-1',
    lineArea: 'Line A',
    teamCrew: 'Crew A',
    crewPatternId: 'pattern-1',
    crewPatternName: '5-Crew Rotation',
    assignmentType: 'Primary',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'Active',
    isActive: true,
    notes: 'Primary crew assigned to Line A.',
  },
  {
    id: 'team-line-2',
    lineArea: 'Line A',
    teamCrew: 'Crew B',
    crewPatternId: 'pattern-1',
    crewPatternName: '5-Crew Rotation',
    assignmentType: 'Support',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'Active',
    isActive: true,
    notes: 'Support crew assigned to the Line A operating scope.',
  },
  {
    id: 'team-line-3',
    lineArea: 'Line B',
    teamCrew: 'Crew C',
    crewPatternId: 'pattern-2',
    crewPatternName: 'Weekend Coverage',
    assignmentType: 'Primary',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    status: 'Active',
    isActive: true,
    notes: 'Team assigned through the first-half operating period.',
  },
  {
    id: 'team-line-4',
    lineArea: 'Line C',
    teamCrew: 'Crew D',
    crewPatternId: 'night-support',
    crewPatternName: 'Night Support',
    assignmentType: 'Temporary',
    startDate: '2026-02-01',
    endDate: '2026-12-31',
    status: 'Draft',
    isActive: false,
    notes: 'Temporary night-support assignment under review.',
  },
];

const ensureCrewPatternMockShifts = (items: ShiftConfigItem[]): ShiftConfigItem[] => {
  const byName = new Map(items.map((item) => [item.name.toLowerCase(), item]));
  const normalized = items.map((item) => {
    const override = crewPatternMockShiftOverrides[item.name.toLowerCase()];
    return override ? { ...item, ...override } : item;
  });

  if (!byName.has('day off')) {
    normalized.push({
      id: 'shift-day-off',
      name: 'Day Off',
      shiftType: 'Non-working',
      start: '',
      end: '',
      duration: 'Non-working',
      isActive: true,
      notes: 'Non-working shift used in crew pattern rotations.',
      ...crewPatternMockShiftOverrides['day off'],
    });
  }

  return normalized;
};

const findMockShiftId = (items: ShiftConfigItem[], name: string) => (
  items.find((item) => item.name.toLowerCase() === name.toLowerCase())?.id ?? name.toLowerCase().replace(/\s+/g, '-')
);

const buildMockRotation = (ids: Record<string, string>, sequence: string[]) => sequence.map((key) => ids[key]).join(' -> ');

const ensureCrewPatternMockPatterns = (items: CrewPatternItem[], shifts: ShiftConfigItem[]): CrewPatternItem[] => {
  const ids = {
    MN: findMockShiftId(shifts, 'Morning'),
    AF: findMockShiftId(shifts, 'Afternoon'),
    NI: findMockShiftId(shifts, 'Night'),
    OFF: findMockShiftId(shifts, 'Day Off'),
  };
  const requiredPatterns: CrewPatternItem[] = [
    {
      id: 'pattern-1',
      name: '5-Crew Rotation',
      shiftIds: [ids.MN, ids.AF, ids.NI, ids.OFF],
      crewCount: 5,
      crewNames: ['Crew A', 'Crew B', 'Crew C', 'Crew D', 'Crew E'],
      rotationSequence: buildMockRotation(ids, ['MN', 'MN', 'AF', 'AF', 'NI', 'NI', 'OFF', 'OFF', 'OFF', 'OFF']),
      offsetLogic: 'Each crew starts one sequence position apart.',
      workingRestBlocks: 'MN, AF, NI, and OFF cards repeat from each team start date.',
      weekendBehavior: 'Standard weekend coverage follows the same sequence.',
      isActive: true,
      notes: 'Default high-volume rotation.',
    },
    {
      id: 'pattern-2',
      name: 'Weekend Coverage',
      shiftIds: [ids.MN, ids.AF, ids.OFF],
      crewCount: 3,
      crewNames: ['Crew A', 'Crew B', 'Crew C'],
      rotationSequence: buildMockRotation(ids, ['MN', 'MN', 'OFF', 'AF', 'AF', 'OFF']),
      offsetLogic: 'Crews rotate through weekend support coverage.',
      workingRestBlocks: 'Morning and afternoon support with off days between blocks.',
      weekendBehavior: 'Used for weekend and reduced-demand coverage.',
      isActive: true,
      notes: 'Weekend support pattern.',
    },
    {
      id: 'pattern-3',
      name: 'Night Support',
      shiftIds: [ids.NI, ids.OFF],
      crewCount: 2,
      crewNames: ['Crew A', 'Crew B'],
      rotationSequence: buildMockRotation(ids, ['NI', 'NI', 'NI', 'OFF', 'OFF']),
      offsetLogic: 'Two teams alternate night support blocks.',
      workingRestBlocks: 'Three night shifts followed by two off slots.',
      weekendBehavior: 'Night support rotates through weekend needs.',
      isActive: true,
      notes: 'Focused night coverage pattern.',
    },
    {
      id: 'pattern-4',
      name: 'Maintenance Support',
      shiftIds: [ids.MN, ids.AF, ids.OFF],
      crewCount: 2,
      crewNames: ['Crew A', 'Crew B'],
      rotationSequence: buildMockRotation(ids, ['MN', 'OFF', 'MN', 'AF', 'OFF']),
      offsetLogic: 'Maintenance crews follow alternating working and off slots.',
      workingRestBlocks: 'Morning support, off slot, morning support, afternoon support, off slot.',
      weekendBehavior: 'Used for maintenance support windows.',
      isActive: false,
      notes: 'Draft maintenance pattern.',
    },
  ];

  const remaining = items.filter((item) => !requiredPatterns.some((pattern) => pattern.id === item.id || pattern.name === item.name));
  return [...requiredPatterns, ...remaining];
};

export const useShiftSettingsActions = ({
  initialShiftConfigItems,
  initialCrewPatternItems,
  initialLinePatternAssignmentItems,
  initialHolidayItems,
  initialShiftRequestItems,
}: UseShiftSettingsActionsProps) => {
  const [isShiftSettingsOpen, setIsShiftSettingsOpen] = useState(false);
  const [shiftSettingsTab, setShiftSettingsTab] = useState<ShiftSettingsTab>('configuration');
  const [shiftConfigSearch, setShiftConfigSearch] = useState('');
  const [holidaySearch, setHolidaySearch] = useState('');
  const [requestSearch, setRequestSearch] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState<'All' | ShiftRequestStatus>('All');
  const [shiftConfigItems, setShiftConfigItems] = useState<ShiftConfigItem[]>(() => ensureCrewPatternMockShifts(initialShiftConfigItems));
  const [crewPatternSearch, setCrewPatternSearch] = useState('');
  const [crewPatternItems, setCrewPatternItems] = useState<CrewPatternItem[]>(() => ensureCrewPatternMockPatterns(initialCrewPatternItems, ensureCrewPatternMockShifts(initialShiftConfigItems)));
  const [linePatternAssignmentSearch, setLinePatternAssignmentSearch] = useState('');
  const [linePatternAssignmentItems, setLinePatternAssignmentItems] = useState<LinePatternAssignmentItem[]>(
    initialLinePatternAssignmentItems.length ? defaultTeamLineAssignmentItems : [],
  );
  const [holidayItems, setHolidayItems] = useState<HolidayItem[]>(initialHolidayItems);
  const [shiftRequestItems, setShiftRequestItems] = useState<ShiftRequestItem[]>(initialShiftRequestItems);
  const [isShiftConfigDrawerOpen, setIsShiftConfigDrawerOpen] = useState(false);
  const [isCrewPatternDrawerOpen, setIsCrewPatternDrawerOpen] = useState(false);
  const [isLinePatternAssignmentDrawerOpen, setIsLinePatternAssignmentDrawerOpen] = useState(false);
  const [isHolidayDrawerOpen, setIsHolidayDrawerOpen] = useState(false);
  const [editingShiftConfigId, setEditingShiftConfigId] = useState<string | null>(null);
  const [editingCrewPatternId, setEditingCrewPatternId] = useState<string | null>(null);
  const [editingLinePatternAssignmentId, setEditingLinePatternAssignmentId] = useState<string | null>(null);
  const [editingHolidayId, setEditingHolidayId] = useState<string | null>(null);

  const normalizeShiftConfigItem = useCallback((item: ShiftConfigItem): ShiftConfigItem => ({
    ...item,
    abbreviation: item.abbreviation ?? item.name.replace(/[^a-z0-9]/gi, '').slice(0, 3).toUpperCase(),
    colorCode: item.colorCode ?? '#2563EB',
    isNonWorking: item.isNonWorking ?? false,
  }), []);

  const buildCrewPatternTeams = useCallback((crewNames: string[], existingTeams: CrewPatternItem['crewTeams'] = []) => (
    crewNames.map((name, index) => {
      const existingTeam = existingTeams[index];
      return {
        name,
        abbreviation: existingTeam?.abbreviation ?? (name.replace(/[^a-z0-9]/gi, '').slice(-1).toUpperCase() || String.fromCharCode(65 + index)),
        sequenceStartDate: existingTeam?.sequenceStartDate ?? '2026-01-01',
      };
    })
  ), []);

  const normalizeCrewPatternItem = useCallback((item: CrewPatternItem): CrewPatternItem => {
    const crewNames = item.crewNames.length ? item.crewNames : Array.from({ length: item.crewCount }, (_, index) => `Crew ${String.fromCharCode(65 + index)}`);
    return {
      ...item,
      crewCount: crewNames.length,
      crewNames,
      crewTeams: buildCrewPatternTeams(crewNames, item.crewTeams),
    };
  }, [buildCrewPatternTeams]);
  
  const [shiftConfigDraft, setShiftConfigDraft] = useState<ShiftConfigItem>({
    id: 'shift-new',
    name: '',
    abbreviation: '',
    colorCode: '#2563EB',
    isNonWorking: false,
    shiftType: '8-hour',
    start: '06:00',
    end: '14:00',
    duration: '8h',
    isActive: true,
    notes: '',
  });

  const [crewPatternDraft, setCrewPatternDraft] = useState<CrewPatternItem>({
    id: 'crew-pattern-new',
    name: '',
    shiftIds: [],
    crewCount: 5,
    crewNames: ['Crew A', 'Crew B', 'Crew C', 'Crew D', 'Crew E'],
    crewTeams: [
      { name: 'Crew A', abbreviation: 'A', sequenceStartDate: '2026-01-01' },
      { name: 'Crew B', abbreviation: 'B', sequenceStartDate: '2026-01-02' },
      { name: 'Crew C', abbreviation: 'C', sequenceStartDate: '2026-01-03' },
      { name: 'Crew D', abbreviation: 'D', sequenceStartDate: '2026-01-04' },
      { name: 'Crew E', abbreviation: 'E', sequenceStartDate: '2026-01-05' },
    ],
    rotationSequence: '',
    offsetLogic: '',
    workingRestBlocks: '',
    weekendBehavior: '',
    isActive: true,
    notes: '',
  });

  const [linePatternAssignmentDraft, setLinePatternAssignmentDraft] = useState<LinePatternAssignmentItem>({
    id: 'line-pattern-new',
    lineArea: 'Line A',
    teamCrew: 'Crew A',
    crewPatternId: 'pattern-1',
    crewPatternName: '5-Crew Rotation',
    assignmentType: 'Primary',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'Active',
    isActive: true,
    notes: '',
  });
  
  const [holidayDraft, setHolidayDraft] = useState<HolidayItem>({
    id: 'planned-stop-new',
    title: '',
    type: 'Holiday',
    scope: 'Entire Site',
    scopeDetail: 'Entire Plant',
    startDate: '2026-12-23',
    startTime: '06:00',
    endDate: '2027-01-02',
    endTime: '22:00',
    description: '',
    reason: '',
    isActive: true,
  });

  const filteredShiftConfigItems = useMemo(() => 
    shiftConfigItems.filter((item) => item.name.toLowerCase().includes(shiftConfigSearch.toLowerCase())),
    [shiftConfigItems, shiftConfigSearch]
  );

  const filteredCrewPatternItems = useMemo(() =>
    crewPatternItems.filter((item) => {
      const search = crewPatternSearch.toLowerCase();
      return (
        item.name.toLowerCase().includes(search)
        || item.rotationSequence.toLowerCase().includes(search)
        || item.workingRestBlocks.toLowerCase().includes(search)
      );
    }),
    [crewPatternItems, crewPatternSearch]
  );

  const filteredLinePatternAssignmentItems = useMemo(() =>
    linePatternAssignmentItems.filter((item) => {
      const search = linePatternAssignmentSearch.toLowerCase();
      return (
        item.lineArea.toLowerCase().includes(search)
        || (item.teamCrew ?? '').toLowerCase().includes(search)
        || (item.crewPatternName ?? '').toLowerCase().includes(search)
        || (item.assignmentType ?? '').toLowerCase().includes(search)
        || (item.status ?? '').toLowerCase().includes(search)
        || item.startDate.toLowerCase().includes(search)
        || item.endDate.toLowerCase().includes(search)
      );
    }),
    [linePatternAssignmentItems, linePatternAssignmentSearch]
  );

  const filteredHolidayItems = useMemo(() => 
    holidayItems.filter((item) => {
      const search = holidaySearch.toLowerCase();
      return (
        item.title.toLowerCase().includes(search)
        || item.type.toLowerCase().includes(search)
        || item.scope.toLowerCase().includes(search)
        || item.scopeDetail.toLowerCase().includes(search)
        || item.reason.toLowerCase().includes(search)
      );
    }),
    [holidayItems, holidaySearch]
  );

  const filteredShiftRequestItems = useMemo(() => 
    shiftRequestItems.filter((item) => {
      const matchesSearch = [item.type, item.requestedBy, item.reason].some((value) => value.toLowerCase().includes(requestSearch.toLowerCase()));
      const matchesStatus = requestStatusFilter === 'All' || item.status === requestStatusFilter;
      return matchesSearch && matchesStatus;
    }),
    [shiftRequestItems, requestSearch, requestStatusFilter]
  );

  const openNewShiftConfigDrawer = useCallback(() => {
    setEditingShiftConfigId(null);
    setShiftConfigDraft({
      id: `shift-${Date.now()}`,
      name: '',
      abbreviation: '',
      colorCode: '#2563EB',
      isNonWorking: false,
      shiftType: '8-hour',
      start: '06:00',
      end: '14:00',
      duration: '8h',
      isActive: true,
      notes: '',
    });
    setIsShiftConfigDrawerOpen(true);
  }, []);

  const openEditShiftConfigDrawer = useCallback((item: ShiftConfigItem) => {
    setEditingShiftConfigId(item.id);
    setShiftConfigDraft(normalizeShiftConfigItem(item));
    setIsShiftConfigDrawerOpen(true);
  }, [normalizeShiftConfigItem]);

  const saveShiftConfigDraft = useCallback(() => {
    setShiftConfigItems((prev) => {
      const exists = prev.some((item) => item.id === shiftConfigDraft.id);
      const nextDraft = normalizeShiftConfigItem(shiftConfigDraft);
      return exists ? prev.map((item) => (item.id === shiftConfigDraft.id ? nextDraft : item)) : [...prev, nextDraft];
    });
    setIsShiftConfigDrawerOpen(false);
  }, [normalizeShiftConfigItem, shiftConfigDraft]);

  const deleteShiftConfig = useCallback((id: string) => 
    setShiftConfigItems((prev) => prev.filter((item) => item.id !== id)),
    []
  );

  const openNewCrewPatternDrawer = useCallback(() => {
    setEditingCrewPatternId(null);
    setCrewPatternDraft({
      id: `crew-pattern-${Date.now()}`,
      name: '',
      shiftIds: [],
      crewCount: 5,
      crewNames: ['Crew A', 'Crew B', 'Crew C', 'Crew D', 'Crew E'],
      crewTeams: [
        { name: 'Crew A', abbreviation: 'A', sequenceStartDate: '2026-01-01' },
        { name: 'Crew B', abbreviation: 'B', sequenceStartDate: '2026-01-02' },
        { name: 'Crew C', abbreviation: 'C', sequenceStartDate: '2026-01-03' },
        { name: 'Crew D', abbreviation: 'D', sequenceStartDate: '2026-01-04' },
        { name: 'Crew E', abbreviation: 'E', sequenceStartDate: '2026-01-05' },
      ],
      rotationSequence: '',
      offsetLogic: '',
      workingRestBlocks: '',
      weekendBehavior: '',
      isActive: true,
      notes: '',
    });
    setIsCrewPatternDrawerOpen(true);
  }, []);

  const openEditCrewPatternDrawer = useCallback((item: CrewPatternItem) => {
    setEditingCrewPatternId(item.id);
    setCrewPatternDraft(normalizeCrewPatternItem(item));
    setIsCrewPatternDrawerOpen(true);
  }, [normalizeCrewPatternItem]);

  const saveCrewPatternDraft = useCallback(() => {
    setCrewPatternItems((prev) => {
      const exists = prev.some((item) => item.id === crewPatternDraft.id);
      const nextDraft = normalizeCrewPatternItem(crewPatternDraft);
      return exists ? prev.map((item) => (item.id === crewPatternDraft.id ? nextDraft : item)) : [...prev, nextDraft];
    });
    setIsCrewPatternDrawerOpen(false);
  }, [crewPatternDraft, normalizeCrewPatternItem]);

  const deleteCrewPattern = useCallback((id: string) =>
    setCrewPatternItems((prev) => prev.filter((item) => item.id !== id)),
    []
  );

  const openNewLinePatternAssignmentDrawer = useCallback(() => {
    setEditingLinePatternAssignmentId(null);
    setLinePatternAssignmentDraft({
      id: `line-pattern-${Date.now()}`,
      lineArea: 'Line A',
      teamCrew: 'Crew A',
      crewPatternId: 'pattern-1',
      crewPatternName: '5-Crew Rotation',
      assignmentType: 'Primary',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      status: 'Active',
      isActive: true,
      notes: '',
    });
    setIsLinePatternAssignmentDrawerOpen(true);
  }, []);

  const openEditLinePatternAssignmentDrawer = useCallback((item: LinePatternAssignmentItem) => {
    setEditingLinePatternAssignmentId(item.id);
    setLinePatternAssignmentDraft(item);
    setIsLinePatternAssignmentDrawerOpen(true);
  }, []);

  const saveLinePatternAssignmentDraft = useCallback(() => {
    setLinePatternAssignmentItems((prev) => {
      const exists = prev.some((item) => item.id === linePatternAssignmentDraft.id);
      return exists ? prev.map((item) => (item.id === linePatternAssignmentDraft.id ? linePatternAssignmentDraft : item)) : [...prev, linePatternAssignmentDraft];
    });
    setIsLinePatternAssignmentDrawerOpen(false);
  }, [linePatternAssignmentDraft]);

  const deleteLinePatternAssignment = useCallback((id: string) =>
    setLinePatternAssignmentItems((prev) => prev.filter((item) => item.id !== id)),
    []
  );

  const openNewHolidayDrawer = useCallback(() => {
    setEditingHolidayId(null);
    setHolidayDraft({
      id: `planned-stop-${Date.now()}`,
      title: '',
      type: 'Holiday',
      scope: 'Entire Site',
      scopeDetail: 'Entire Plant',
      startDate: '2026-12-23',
      startTime: '06:00',
      endDate: '2027-01-02',
      endTime: '22:00',
      description: '',
      reason: '',
      isActive: true,
    });
    setIsHolidayDrawerOpen(true);
  }, []);

  const openEditHolidayDrawer = useCallback((item: HolidayItem) => {
    setEditingHolidayId(item.id);
    setHolidayDraft(item);
    setIsHolidayDrawerOpen(true);
  }, []);

  const saveHolidayDraft = useCallback(() => {
    setHolidayItems((prev) => {
      const exists = prev.some((item) => item.id === holidayDraft.id);
      return exists ? prev.map((item) => (item.id === holidayDraft.id ? holidayDraft : item)) : [...prev, holidayDraft];
    });
    setIsHolidayDrawerOpen(false);
  }, [holidayDraft]);

  const deleteHoliday = useCallback((id: string) => 
    setHolidayItems((prev) => prev.filter((item) => item.id !== id)),
    []
  );

  const createHolidayItem = useCallback((item: HolidayItem) => {
    setHolidayItems((prev) => {
      const exists = prev.some((current) => current.id === item.id);
      return exists ? prev.map((current) => (current.id === item.id ? item : current)) : [item, ...prev];
    });
  }, []);

  const updateShiftRequestStatus = useCallback((id: string, status: ShiftRequestStatus) =>
    setShiftRequestItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item))),
    []
  );

  const createShiftRequest = useCallback((request: Omit<ShiftRequestItem, 'id' | 'status'> & { status?: ShiftRequestStatus }) => {
    setShiftRequestItems((prev) => [
      {
        id: `request-${Date.now()}`,
        status: request.status ?? 'Requested',
        ...request,
      },
      ...prev,
    ]);
  }, []);

  return {
    isShiftSettingsOpen,
    setIsShiftSettingsOpen,
    shiftSettingsTab,
    setShiftSettingsTab,
    shiftConfigSearch,
    setShiftConfigSearch,
    crewPatternSearch,
    setCrewPatternSearch,
    linePatternAssignmentSearch,
    setLinePatternAssignmentSearch,
    holidaySearch,
    setHolidaySearch,
    requestSearch,
    setRequestSearch,
    requestStatusFilter,
    setRequestStatusFilter,
    shiftConfigItems,
    crewPatternItems,
    linePatternAssignmentItems,
    holidayItems,
    shiftRequestItems,
    isShiftConfigDrawerOpen,
    isCrewPatternDrawerOpen,
    isLinePatternAssignmentDrawerOpen,
    isHolidayDrawerOpen,
    setIsShiftConfigDrawerOpen,
    setIsCrewPatternDrawerOpen,
    setIsLinePatternAssignmentDrawerOpen,
    setIsHolidayDrawerOpen,
    editingShiftConfigId,
    editingCrewPatternId,
    editingLinePatternAssignmentId,
    editingHolidayId,
    shiftConfigDraft,
    setShiftConfigDraft,
    crewPatternDraft,
    setCrewPatternDraft,
    linePatternAssignmentDraft,
    setLinePatternAssignmentDraft,
    holidayDraft,
    setHolidayDraft,
    filteredShiftConfigItems,
    filteredCrewPatternItems,
    filteredLinePatternAssignmentItems,
    filteredHolidayItems,
    filteredShiftRequestItems,
    openNewShiftConfigDrawer,
    openEditShiftConfigDrawer,
    saveShiftConfigDraft,
    deleteShiftConfig,
    openNewCrewPatternDrawer,
    openEditCrewPatternDrawer,
    saveCrewPatternDraft,
    deleteCrewPattern,
    openNewLinePatternAssignmentDrawer,
    openEditLinePatternAssignmentDrawer,
    saveLinePatternAssignmentDraft,
    deleteLinePatternAssignment,
    openNewHolidayDrawer,
    openEditHolidayDrawer,
    saveHolidayDraft,
    createHolidayItem,
    deleteHoliday,
    updateShiftRequestStatus,
    createShiftRequest,
  };
};
