import {useEffect, useMemo, useState} from 'react';
import type {Dispatch, ReactNode, SetStateAction} from 'react';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  DeleteOutline as DeleteIcon,
  Search as SearchIcon,
  KeyboardArrowRight as ArrowRightIcon,
  KeyboardArrowLeft as ArrowLeftIcon,
  KeyboardArrowDown as ArrowDownIcon,
  AccessTime as AccessTimeIcon,
  CalendarMonth as CalendarIcon,
  GroupsOutlined as GroupsIcon,
  QrCodeScanner as ScanIcon,
  Download as DownloadIcon,
  SettingsOutlined as ProductionIcon,
  VisibilityOutlined as VisibilityOutlinedIcon,
  EditOutlined as EditOutlinedIcon,
} from '@mui/icons-material';
import {readHierarchyUsers} from '../workstation/allworkstation/usersStore';

type ShiftEntryProductionOutputProps = {
  currentUserName?: string;
  onCancel: () => void;
  onClose: () => void;
};

type ProductOption = {
  id: string;
  label: string;
};

type ScrapEntry = {
  id: string;
  quantity: string;
  uom: 'pcs' | 'kg';
  category: string;
  subCategory: string;
  cause: string;
};

type HourlyEntryDraft = {
  productId: string;
  orderNumber: string;
  downtimeCategory: string;
  producedQty: string;
  downtimeMin: string;
  totalPeople: string;
  notes: string;
  scrapEntries: ScrapEntry[];
};

type PersonnelMovement = {
  id: string;
  line: string;
  employees: string;
  hours: string;
};

const hourlySlots = [
  '06:00 - 07:00',
  '07:00 - 08:00',
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 01:00',
] as const;

const productOptions: ProductOption[] = [
  {id: 'part-1001', label: 'PX-1001 / Trim Carrier'},
  {id: 'part-1002', label: 'PX-1002 / Valve Housing'},
  {id: 'part-1003', label: 'PX-1003 / Console Bracket'},
];

const scrapCategoryOptions = {
  Material: ['Damaged material', 'Contamination', 'Wrong material'],
  Process: ['Setup loss', 'Trim error', 'Torque issue'],
  Quality: ['Visual defect', 'Dimension out', 'Leak test fail'],
  Handling: ['Dropped part', 'Packaging damage', 'Labeling error'],
} as const;

const downtimeCategoryOptions = [
  'QA / Quality',
  'Rework',
  'Equipment failure',
  'Material shortage',
  'Break / Stretching',
  'Other',
];

const lineOptions = [
  'TJ1 - Manual Line 1',
  'TJ1 - Manual Line 2',
  'TJ2 - Manual Line 1',
  'TJ2 - Manual Line 3',
];

const lineProductPiecesPerHour: Record<string, Record<string, number>> = {
  'TJ1 - Manual Line 1': {
    'part-1001': 120,
    'part-1002': 96,
    'part-1003': 84,
  },
  'TJ1 - Manual Line 2': {
    'part-1001': 120,
    'part-1002': 96,
    'part-1003': 84,
  },
  'TJ2 - Manual Line 1': {
    'part-1001': 120,
    'part-1002': 96,
    'part-1003': 84,
  },
  'TJ2 - Manual Line 3': {
    'part-1001': 120,
    'part-1002': 96,
    'part-1003': 84,
  },
};

const selectMenuProps = {
  slotProps: {
    root: {
      sx: {
        zIndex: 1800,
      },
    },
  },
  PaperProps: {
    sx: {
      mt: 0.5,
      maxHeight: 280,
    },
  },
};

const productionOverviewRows = [
  {hour: '06:00 AM', production: '120 / 118', productionTone: '#16A34A', scrap: '8', downtime: '4', oee: '96%', notes: '-', critical: false},
  {hour: '07:00 AM', production: '112 / 118', productionTone: '#246BFE', scrap: '12', downtime: '8', oee: '91%', notes: 'Material staged late', critical: false},
  {hour: '08:00 AM', production: '105 / 118', productionTone: '#F59E0B', scrap: '21', downtime: '14', oee: '84%', notes: 'Minor stop at feeder', critical: false},
  {hour: '09:00 AM', production: '98 / 118', productionTone: '#EF4444', scrap: '33', downtime: '22', oee: '72%', notes: 'Operator support requested', critical: true},
] as const;

function buildEmptyScrapEntry(): ScrapEntry {
  return {
    id: `scrap-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    quantity: '',
    uom: 'pcs',
    category: '',
    subCategory: '',
    cause: '',
  };
}

function buildEmptyHourlyEntry(productId = ''): HourlyEntryDraft {
  return {
    productId,
    orderNumber: '',
    downtimeCategory: '',
    producedQty: '',
    downtimeMin: '',
    totalPeople: '',
    notes: '',
    scrapEntries: [],
  };
}

function buildPersonnelMovement(): PersonnelMovement {
  return {
    id: `movement-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    line: '',
    employees: '',
    hours: '',
  };
}

function toNumber(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMetric(value: number, digits = 0) {
  if (!Number.isFinite(value)) return '0';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function getPiecesPerHour(line: string, productId: string) {
  return lineProductPiecesPerHour[line]?.[productId] ?? 0;
}

function calculatePersonnelImpactHours(rows: PersonnelMovement[]) {
  return rows.reduce((sum, movement) => {
    const employees = Math.max(0, toNumber(movement.employees));
    const hours = Math.max(0, toNumber(movement.hours));
    return sum + employees * hours;
  }, 0);
}

function calculateHourlyMetrics(entry: HourlyEntryDraft, piecesPerHour: number) {
  const producedQty = toNumber(entry.producedQty);
  const downtimeMin = Math.min(60, Math.max(0, toNumber(entry.downtimeMin)));
  const totalPeople = Math.max(0, toNumber(entry.totalPeople));
  const expectedQty = piecesPerHour * ((60 - downtimeMin) / 60);
  const efficiency = expectedQty > 0 ? (producedQty / expectedQty) * 100 : 0;
  const paidHours = ((60 - downtimeMin) / 60) * totalPeople;
  const standardHoursPer1000 = piecesPerHour > 0 ? 1000 / piecesPerHour : 0;
  const earnedHours = (standardHoursPer1000 / 1000) * producedQty;
  const productivity = paidHours > 0 ? (earnedHours / paidHours) * 100 : 0;
  const totalScrap = entry.scrapEntries.reduce((sum, scrap) => sum + toNumber(scrap.quantity), 0);
  return {producedQty, downtimeMin, totalPeople, expectedQty, efficiency, paidHours, earnedHours, productivity, totalScrap};
}

export default function ShiftEntryProductionOutput({
  currentUserName = 'Jose Rodriguez',
  onCancel,
  onClose,
}: ShiftEntryProductionOutputProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'overview'>('manual');
  const [entryMode, setEntryMode] = useState<'hourly' | 'shiftEnd'>('hourly');
  const [showMajorEvents, setShowMajorEvents] = useState(true);
  const [hourIndex, setHourIndex] = useState(4);
  const [selectedLine, setSelectedLine] = useState(lineOptions[0]);
  const [hourlyEntries, setHourlyEntries] = useState<Record<string, HourlyEntryDraft>>(() => ({
    [hourlySlots[4]]: {
      ...buildEmptyHourlyEntry(productOptions[0].id),
      producedQty: '0',
      downtimeMin: '0',
      totalPeople: '8',
      notes: '',
    },
  }));
  const [lentPersonnel, setLentPersonnel] = useState<PersonnelMovement[]>(() => [buildPersonnelMovement()]);
  const [borrowedPersonnel, setBorrowedPersonnel] = useState<PersonnelMovement[]>([]);
  const [shiftNotes, setShiftNotes] = useState('');
  const [shiftClosed, setShiftClosed] = useState(false);

  const userRole = useMemo(() => {
    const matchedUser = readHierarchyUsers().find((user) => user.name.toLowerCase() === currentUserName.toLowerCase());
    return matchedUser?.role ?? 'Line Leader';
  }, [currentUserName]);
  const canEditShiftEnd = userRole.toLowerCase().includes('line leader');

  const currentHourLabel = hourlySlots[hourIndex];
  const currentEntry = hourlyEntries[currentHourLabel] ?? buildEmptyHourlyEntry(productOptions[0].id);
  const currentProduct = productOptions.find((product) => product.id === currentEntry.productId) ?? productOptions[0];
  const currentPiecesPerHour = getPiecesPerHour(selectedLine, currentProduct.id);
  const currentMetrics = calculateHourlyMetrics(currentEntry, currentPiecesPerHour);
  const personnelLineOptions = useMemo(() => lineOptions.filter((line) => line !== selectedLine), [selectedLine]);

  const allEntries = useMemo(
    () => hourlySlots.map((hour) => ({hour, entry: hourlyEntries[hour] ?? buildEmptyHourlyEntry(productOptions[0].id)})),
    [hourlyEntries],
  );
  const shiftSummary = useMemo(() => {
    const totals = allEntries.reduce(
      (acc, row) => {
        const product = productOptions.find((option) => option.id === row.entry.productId) ?? productOptions[0];
        const metrics = calculateHourlyMetrics(row.entry, getPiecesPerHour(selectedLine, product.id));
        acc.produced += metrics.producedQty;
        acc.downtime += metrics.downtimeMin;
        acc.scrap += metrics.totalScrap;
        acc.expected += metrics.expectedQty;
        acc.paidHours += metrics.paidHours;
        acc.earnedHours += metrics.earnedHours;
        return acc;
      },
      {produced: 0, downtime: 0, scrap: 0, expected: 0, paidHours: 0, earnedHours: 0},
    );
    const efficiency = totals.expected > 0 ? (totals.produced / totals.expected) * 100 : 0;
    const lentImpactHours = calculatePersonnelImpactHours(lentPersonnel);
    const borrowedImpactHours = calculatePersonnelImpactHours(borrowedPersonnel);
    const adjustedPaidHours = Math.max(0, totals.paidHours - lentImpactHours + borrowedImpactHours);
    const productivity = adjustedPaidHours > 0 ? (totals.earnedHours / adjustedPaidHours) * 100 : 0;
    return {...totals, efficiency, productivity, lentImpactHours, borrowedImpactHours, adjustedPaidHours};
  }, [allEntries, borrowedPersonnel, lentPersonnel, selectedLine]);

  useEffect(() => {
    setLentPersonnel((current) => current.map((movement) => (movement.line === selectedLine ? {...movement, line: ''} : movement)));
    setBorrowedPersonnel((current) => current.map((movement) => (movement.line === selectedLine ? {...movement, line: ''} : movement)));
  }, [selectedLine]);

  const updateCurrentEntry = (updater: (entry: HourlyEntryDraft) => HourlyEntryDraft) => {
    setHourlyEntries((current) => ({
      ...current,
      [currentHourLabel]: updater(current[currentHourLabel] ?? buildEmptyHourlyEntry(productOptions[0].id)),
    }));
  };

  const updateScrapEntry = (entryId: string, updates: Partial<ScrapEntry>) => {
    updateCurrentEntry((entry) => ({
      ...entry,
      scrapEntries: entry.scrapEntries.map((scrapEntry) => {
        if (scrapEntry.id !== entryId) return scrapEntry;
        const nextEntry = {...scrapEntry, ...updates};
        if (Object.prototype.hasOwnProperty.call(updates, 'category')) {
          nextEntry.subCategory = '';
        }
        return nextEntry;
      }),
    }));
  };

  const addScrapEntry = () => {
    updateCurrentEntry((entry) => ({
      ...entry,
      scrapEntries: [...entry.scrapEntries, buildEmptyScrapEntry()],
    }));
  };

  const removeScrapEntry = (entryId: string) => {
    updateCurrentEntry((entry) => ({
      ...entry,
      scrapEntries: entry.scrapEntries.filter((scrapEntry) => scrapEntry.id !== entryId),
    }));
  };

  const updatePersonnelMovement = (
    setState: Dispatch<SetStateAction<PersonnelMovement[]>>,
    movementId: string,
    updates: Partial<PersonnelMovement>,
  ) => {
    setState((current) => current.map((movement) => (movement.id === movementId ? {...movement, ...updates} : movement)));
  };

  return (
    <Box sx={{minHeight: '100%', display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto', bgcolor: '#FFFFFF'}}>
      <Box sx={{px: 0.7, minHeight: 0, overflowY: 'auto', pb: 0.6}}>
        <Typography sx={{fontSize: 20, fontWeight: 900, color: '#246BFE', mb: 1.15}}>Production Manual Entry</Typography>

        <AssistantCard subtitle="Would you like assistance here?" onAccept={() => undefined} />

        <Box sx={{display: 'flex', gap: 2.15, borderBottom: '1px solid #E5EAF3', mb: 1.15}}>
          <HeaderTab active={activeTab === 'manual'} label="Manual Entry" onClick={() => setActiveTab('manual')} />
          <HeaderTab active={activeTab === 'overview'} label="Production Overview" onClick={() => setActiveTab('overview')} />
        </Box>

        {activeTab === 'manual' ? (
          <>
            <Box sx={{display: 'flex', gap: 0.7, mb: 0.9}}>
              {([
                {id: 'hourly', label: 'Hourly Entry'},
                {id: 'shiftEnd', label: 'End of Shift'},
              ] as const).map((option) => {
                const active = entryMode === option.id;
                return (
                  <Button
                    key={option.id}
                    variant={active ? 'contained' : 'outlined'}
                    onClick={() => setEntryMode(option.id)}
                    sx={{
                      height: 30,
                      borderRadius: 999,
                      px: 1.6,
                      minWidth: 0,
                      textTransform: 'none',
                      fontSize: 11.2,
                      fontWeight: 800,
                      borderColor: '#BFD4FF',
                      color: active ? '#FFFFFF' : '#246BFE',
                      bgcolor: active ? '#246BFE' : '#FFFFFF',
                      boxShadow: 'none',
                      '&:hover': {bgcolor: active ? '#0B63E5' : '#F6F9FF', borderColor: '#7EA7FF', boxShadow: 'none'},
                    }}
                  >
                    {option.label}
                  </Button>
                );
              })}
            </Box>

            <Box sx={{display: 'grid', gridTemplateColumns: '1fr', gap: 0.8, mb: 0.8}}>
              <ProductionEntryInfoField label="Date" value="14/01/2025, 09:15:00" />
            </Box>

            <Paper elevation={0} sx={{display: 'grid', gridTemplateColumns: '1.6fr 0.7fr', borderRadius: 1.25, border: '1px solid #E5EAF3', overflow: 'hidden', mb: 0.8}}>
              <Box sx={{p: 1.05, borderRight: '1px solid #E5EAF3'}}>
                <Typography sx={{fontSize: 11.2, color: '#667085', display: 'flex', alignItems: 'center', gap: 0.55, mb: 0.85}}>
                  <AccessTimeIcon sx={{fontSize: 16}} />
                  {entryMode === 'hourly' ? 'Select Time (Hour)' : 'Shift Close Entry'}
                </Typography>
                {entryMode === 'hourly' ? (
                  <Box sx={{display: 'grid', gridTemplateColumns: '26px 1fr 26px', alignItems: 'center', gap: 0.7}}>
                    <ArrowLeftIcon
                      sx={{fontSize: 22, color: hourIndex === 0 ? '#CBD5E1' : '#246BFE', cursor: hourIndex === 0 ? 'default' : 'pointer'}}
                      onClick={() => hourIndex > 0 && setHourIndex((current) => current - 1)}
                    />
                    <Typography sx={{fontSize: 16.2, fontWeight: 800, color: '#202124', textAlign: 'center'}}>{currentHourLabel}</Typography>
                    <ArrowRightIcon
                      sx={{fontSize: 22, color: hourIndex === hourlySlots.length - 1 ? '#CBD5E1' : '#246BFE', cursor: hourIndex === hourlySlots.length - 1 ? 'default' : 'pointer'}}
                      onClick={() => hourIndex < hourlySlots.length - 1 && setHourIndex((current) => current + 1)}
                    />
                  </Box>
                ) : (
                  <Typography sx={{fontSize: 16.2, fontWeight: 800, color: '#202124', textAlign: 'center'}}>
                    Final shift totals
                  </Typography>
                )}
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.55, color: '#246BFE', fontWeight: 900}}>
                <CalendarIcon sx={{fontSize: 18}} />
                <Typography sx={{fontSize: 13.1, fontWeight: 800}}>Today</Typography>
              </Box>
            </Paper>

            <ProductionEntrySelectField
              label="Line / Work Center"
              value={selectedLine}
              onChange={(value) => setSelectedLine(value)}
              options={lineOptions}
              readOnly={false}
            />

            {entryMode === 'hourly' ? (
              <>
                <ProductionEntrySelectField
                  label="Product / Part"
                  value={currentProduct.id}
                  onChange={(value) => updateCurrentEntry((entry) => ({...entry, productId: value}))}
                  options={productOptions.map((product) => product.id)}
                  optionLabelMap={Object.fromEntries(productOptions.map((product) => [product.id, product.label]))}
                  placeholder="Select product or part number"
                  endIcons={
                    <Box sx={{display: 'flex', gap: 0.7, color: '#246BFE'}}>
                      <SearchIcon sx={{fontSize: 22}} />
                      <ScanIcon sx={{fontSize: 22}} />
                    </Box>
                  }
                />

                <ProductionEntryTextField
                  label="Order Number"
                  value={currentEntry.orderNumber}
                  onChange={(value) => updateCurrentEntry((entry) => ({...entry, orderNumber: value}))}
                  placeholder="SAP order number"
                />

                <ProductionValueCard
                  icon={<ProductionIcon sx={{fontSize: 22}} />}
                  title="Production"
                  unitLabel="(pcs)"
                  helper="Enter good pieces produced in this hour."
                  value={currentEntry.producedQty}
                  suffix="pcs"
                  tone="#246BFE"
                  fieldBorder="#7EA7FF"
                  onChange={(value) => updateCurrentEntry((entry) => ({...entry, producedQty: value}))}
                />

                <Paper elevation={0} sx={{p: 1.05, borderRadius: 1.25, border: '1px solid #E5EAF3', mb: 0.8}}>
                  <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, color: '#8A46D8', mb: 0.55}}>
                    <AccessTimeIcon sx={{fontSize: 22}} />
                    <Typography sx={{fontSize: 14.2, color: '#202124', fontWeight: 900}}>Downtime</Typography>
                  </Box>
                  <Typography sx={{fontSize: 11.2, color: '#667085', mb: 0.85}}>Enter downtime category and total downtime in this hour.</Typography>
                  <Box sx={{display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 0.75}}>
                    <MiniSelectField
                      label="Downtime Category"
                      value={currentEntry.downtimeCategory}
                      onChange={(value) => updateCurrentEntry((entry) => ({...entry, downtimeCategory: value}))}
                      options={downtimeCategoryOptions}
                      placeholder="Select category"
                    />
                    <MiniNumberField
                      label="Downtime (min)"
                      value={currentEntry.downtimeMin}
                      onChange={(value) => updateCurrentEntry((entry) => ({...entry, downtimeMin: value}))}
                    />
                  </Box>
                </Paper>

                <ProductionValueCard
                  icon={<GroupsIcon sx={{fontSize: 22}} />}
                  title="Total people on shift"
                  unitLabel=""
                  helper="Enter how many people were staffed in this hour."
                  value={currentEntry.totalPeople}
                  suffix="people"
                  tone="#0F766E"
                  fieldBorder="#99F6E4"
                  onChange={(value) => updateCurrentEntry((entry) => ({...entry, totalPeople: value}))}
                />

                <Paper elevation={0} sx={{p: 1.05, borderRadius: 1.25, border: '1px solid #E5EAF3', mb: 0.8}}>
                  <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: currentEntry.scrapEntries.length ? 1 : 0.4}}>
                    <Box>
                      <Typography sx={{fontSize: 12.8, color: '#202124', fontWeight: 900}}>Scrap entries</Typography>
                      <Typography sx={{fontSize: 10.9, color: '#667085', mt: 0.2}}>
                        Track each scrap event inline for this hour.
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon sx={{fontSize: 16}} />}
                      onClick={addScrapEntry}
                      sx={{height: 30, borderRadius: 999, borderColor: '#7EA7FF', color: '#0B63E5', fontWeight: 800, fontSize: 11.1, textTransform: 'none', boxShadow: 'none'}}
                    >
                      Add scrap entry
                    </Button>
                  </Box>

                  {currentEntry.scrapEntries.length ? (
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.85}}>
                      {currentEntry.scrapEntries.map((scrapEntry) => {
                        const subCategoryOptions = scrapEntry.category
                          ? scrapCategoryOptions[scrapEntry.category as keyof typeof scrapCategoryOptions] ?? []
                          : [];
                        return (
                          <Paper key={scrapEntry.id} elevation={0} sx={{p: 0.9, borderRadius: 1.15, border: '1px solid #E5EAF3', bgcolor: '#FBFDFF'}}>
                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.65}}>
                              <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 84px 34px', gap: 0.65, alignItems: 'end'}}>
                                <Box sx={{minWidth: 0}}>
                                  <MiniNumberField
                                    label="Quantity"
                                    value={scrapEntry.quantity}
                                    onChange={(value) => updateScrapEntry(scrapEntry.id, {quantity: value})}
                                  />
                                </Box>
                                <Box sx={{minWidth: 0}}>
                                  <MiniToggleField
                                    label="UoM"
                                    value={scrapEntry.uom}
                                    onChange={(value) => updateScrapEntry(scrapEntry.id, {uom: value as 'pcs' | 'kg'})}
                                    options={['pcs', 'kg']}
                                  />
                                </Box>
                                <Box sx={{display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>
                                  <IconButton onClick={() => removeScrapEntry(scrapEntry.id)} sx={{mb: 0.25, color: '#EF4444'}}>
                                    <DeleteIcon sx={{fontSize: 18}} />
                                  </IconButton>
                                </Box>
                              </Box>
                              <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 0.65, alignItems: 'end'}}>
                                <Box sx={{minWidth: 0}}>
                                  <MiniSelectField
                                    label="Category"
                                    value={scrapEntry.category}
                                    onChange={(value) => updateScrapEntry(scrapEntry.id, {category: value})}
                                    options={Object.keys(scrapCategoryOptions)}
                                    placeholder="Select category"
                                  />
                                </Box>
                                <Box sx={{minWidth: 0}}>
                                  <MiniSelectField
                                    label="Sub Category"
                                    value={scrapEntry.subCategory}
                                    onChange={(value) => updateScrapEntry(scrapEntry.id, {subCategory: value})}
                                    options={subCategoryOptions}
                                    placeholder="Select sub category"
                                  />
                                </Box>
                              </Box>
                              <Box sx={{minWidth: 0}}>
                                <MiniTextField
                                  label="Cause"
                                  value={scrapEntry.cause}
                                  onChange={(value) => updateScrapEntry(scrapEntry.id, {cause: value})}
                                  placeholder="Optional cause"
                                />
                              </Box>
                            </Box>
                          </Paper>
                        );
                      })}
                    </Box>
                  ) : (
                    <Typography sx={{fontSize: 11.2, color: '#98A2B3'}}>No scrap entries added for this hour yet.</Typography>
                  )}
                </Paper>

                <PersonnelMovementSection
                  title="Lent Personnel"
                  helper="Track people temporarily lent to another line."
                  lineOptions={personnelLineOptions}
                  rows={lentPersonnel}
                  onAdd={() => setLentPersonnel((current) => [...current, buildPersonnelMovement()])}
                  onRemove={(movementId) => setLentPersonnel((current) => current.filter((movement) => movement.id !== movementId))}
                  onUpdate={(movementId, updates) => updatePersonnelMovement(setLentPersonnel, movementId, updates)}
                  disabled={false}
                />

                <PersonnelMovementSection
                  title="Borrowed Personnel"
                  helper="Track people borrowed from another line."
                  lineOptions={personnelLineOptions}
                  rows={borrowedPersonnel}
                  onAdd={() => setBorrowedPersonnel((current) => [...current, buildPersonnelMovement()])}
                  onRemove={(movementId) => setBorrowedPersonnel((current) => current.filter((movement) => movement.id !== movementId))}
                  onUpdate={(movementId, updates) => updatePersonnelMovement(setBorrowedPersonnel, movementId, updates)}
                  disabled={false}
                />

                <ProductionSummaryCard
                  piecesPerHour={currentPiecesPerHour}
                  expectedQty={currentMetrics.expectedQty}
                  efficiency={currentMetrics.efficiency}
                  paidHours={currentMetrics.paidHours}
                  productivity={currentMetrics.productivity}
                />

                <Paper elevation={0} sx={{p: 1.05, borderRadius: 1.25, border: '1px solid #E5EAF3'}}>
                  <Typography sx={{fontSize: 11.2, color: '#667085', mb: 0.45}}>Shift Notes (optional)</Typography>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    placeholder="Add any notes about this hour..."
                    value={currentEntry.notes}
                    onChange={(event) => updateCurrentEntry((entry) => ({...entry, notes: event.target.value}))}
                    InputProps={{
                      sx: {
                        p: 0,
                        fontSize: 13.1,
                        '& fieldset': {border: 'none'},
                      },
                    }}
                  />
                  <Typography sx={{fontSize: 11.1, color: '#667085', textAlign: 'right'}}>
                    {currentEntry.notes.length} / 500
                  </Typography>
                </Paper>
              </>
            ) : (
              <>
                <EndOfShiftSummaryCard summary={shiftSummary} />

                <ReadOnlyRoleNotice canEdit={canEditShiftEnd} userRole={userRole} />

                <Paper elevation={0} sx={{p: 1.05, borderRadius: 1.25, border: '1px solid #E5EAF3', mb: 0.8}}>
                  <Box sx={{pb: 0.85, mb: 0.85, borderBottom: '1px solid #E5EAF3'}}>
                    <Typography sx={{fontSize: 12.8, color: '#202124', fontWeight: 900}}>Shift Info</Typography>
                  </Box>
                  <Box sx={{display: 'grid', gridTemplateColumns: '1fr', gap: 0.85}}>
                    <MiniTextField
                      label="General shift notes"
                      value={shiftNotes}
                      onChange={setShiftNotes}
                      placeholder="Add closing notes for the shift"
                      multiline
                      disabled={false}
                    />
                  </Box>
                  {shiftClosed ? (
                    <Typography sx={{fontSize: 11.5, color: '#16A34A', fontWeight: 800, mt: 0.9}}>
                      Shift record marked as closed.
                    </Typography>
                  ) : null}
                </Paper>
              </>
            )}
          </>
        ) : (
          <ProductionOverviewContent showMajorEvents={showMajorEvents} onToggleMajorEvents={() => setShowMajorEvents((value) => !value)} />
        )}
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.7, px: 0.7, py: 0.9, bgcolor: '#FFFFFF', borderTop: '1px solid #E5EAF3'}}>
        {activeTab === 'manual' ? (
          <>
            <Button variant="outlined" startIcon={<CloseIcon sx={{fontSize: 16}} />} onClick={onCancel} sx={{height: 40, minWidth: 0, borderRadius: 999, borderColor: '#7EA7FF', color: '#0B63E5', fontWeight: 800, fontSize: 11.2, whiteSpace: 'nowrap'}}>
              Cancel
            </Button>
            <Button variant="outlined" startIcon={<CheckIcon sx={{fontSize: 16}} />} sx={{height: 40, minWidth: 0, borderRadius: 999, borderColor: '#D5DBE6', color: '#98A2B3', fontWeight: 800, fontSize: 10.7, whiteSpace: 'nowrap'}}>
              {entryMode === 'hourly' ? 'Save entry' : 'Save draft'}
            </Button>
            <Button
              variant="contained"
              startIcon={<CheckIcon sx={{fontSize: 16}} />}
              onClick={() => {
                if (entryMode === 'shiftEnd') {
                  setShiftClosed(true);
                } else {
                  onClose();
                }
              }}
              disabled={entryMode === 'shiftEnd' && !canEditShiftEnd}
              sx={{height: 40, minWidth: 0, borderRadius: 999, bgcolor: '#0B63E5', fontWeight: 800, fontSize: 11.2, boxShadow: 'none', whiteSpace: 'nowrap'}}
            >
              {entryMode === 'hourly' ? 'Submit' : 'Close Shift'}
            </Button>
          </>
        ) : (
          <>
            <Button variant="outlined" startIcon={<CloseIcon sx={{fontSize: 16}} />} onClick={onCancel} sx={{height: 40, minWidth: 0, borderRadius: 999, borderColor: '#7EA7FF', color: '#0B63E5', fontWeight: 800, fontSize: 11.2, whiteSpace: 'nowrap'}}>
              Cancel
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon sx={{fontSize: 16}} />} sx={{height: 40, minWidth: 0, borderRadius: 999, borderColor: '#7EA7FF', color: '#0B63E5', fontWeight: 800, fontSize: 11.2, whiteSpace: 'nowrap'}}>
              Export
            </Button>
            <Button variant="contained" startIcon={<AddIcon sx={{fontSize: 16}} />} onClick={() => setActiveTab('manual')} sx={{height: 40, minWidth: 0, borderRadius: 999, bgcolor: '#0B63E5', fontWeight: 800, fontSize: 11.2, boxShadow: 'none', whiteSpace: 'nowrap'}}>
              Add Entry
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}

function HeaderTab({active, label, onClick}: {active: boolean; label: string; onClick: () => void}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        pb: 0.85,
        color: active ? '#0B63E5' : '#667085',
        fontSize: 12.6,
        fontWeight: active ? 900 : 800,
        borderBottom: active ? '3px solid #246BFE' : '3px solid transparent',
        cursor: 'pointer',
      }}
    >
      {label}
    </Box>
  );
}

function AssistantCard({subtitle, onAccept}: {subtitle: string; onAccept: () => void}) {
  return (
    <Paper elevation={0} sx={{p: 1.25, borderRadius: 1.2, bgcolor: '#F0F5FF', border: '1px solid #DDE7F4', mb: 1.4}}>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.85, mb: 0.6}}>
        <Box sx={{width: 25, height: 25, borderRadius: '50%', bgcolor: '#0B63E5', display: 'grid', placeItems: 'center', color: '#FFFFFF'}}>
          <CheckIcon sx={{fontSize: 16}} />
        </Box>
        <Typography sx={{fontSize: 13, fontWeight: 900, color: '#0B63E5'}}>AI ASSISTANT</Typography>
      </Box>
      <Typography sx={{fontSize: 11.5, color: '#4B5563', lineHeight: 1.45, mb: 1.15}}>{subtitle}</Typography>
      <Button variant="contained" onClick={onAccept} sx={{height: 28, borderRadius: 999, bgcolor: '#0B63E5', color: '#FFFFFF', fontSize: 10, fontWeight: 900, boxShadow: 'none'}}>
        AI ASSISTANT
      </Button>
    </Paper>
  );
}

function ProductionEntryInfoField({label, value}: {label: string; value: string}) {
  return (
    <Paper elevation={0} sx={{p: 1, borderRadius: 1.15, bgcolor: '#F8FAFC', border: '1px solid #EDF2F7'}}>
      <Typography sx={{fontSize: 11, color: '#667085', mb: 0.42}}>{label}</Typography>
      <Typography sx={{fontSize: 14.2, color: '#202124'}}>{value}</Typography>
    </Paper>
  );
}

function ProductionEntrySelectField({
  endIcons,
  label,
  onChange,
  optionLabelMap,
  options,
  placeholder,
  readOnly = false,
  value,
}: {
  endIcons?: ReactNode;
  label: string;
  onChange: (value: string) => void;
  optionLabelMap?: Record<string, string>;
  options?: string[];
  placeholder?: string;
  readOnly?: boolean;
  value: string;
}) {
  const displayValue = value ? optionLabelMap?.[value] ?? value : placeholder ?? '';
  return (
    <Paper elevation={0} sx={{p: 1.05, borderRadius: 1.25, border: '1px solid #E5EAF3', mb: 0.8}}>
      <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'center', gap: 0.7}}>
        <Box sx={{minWidth: 0}}>
          <Typography sx={{fontSize: 11.2, color: '#667085', mb: 0.42}}>{label}</Typography>
          {readOnly || !options ? (
            <Typography sx={{fontSize: 14.1, color: value ? '#202124' : '#98A2B3'}}>{displayValue}</Typography>
          ) : (
            <Select
              value={value}
              onChange={(event) => onChange(event.target.value)}
              variant="standard"
              displayEmpty
              disableUnderline
              IconComponent={ArrowDownIcon}
              MenuProps={selectMenuProps}
              renderValue={(selected) => (
                <Typography sx={{fontSize: 14.1, color: selected ? '#202124' : '#98A2B3'}}>
                  {selected ? optionLabelMap?.[selected] ?? selected : placeholder}
                </Typography>
              )}
              sx={{width: '100%', '& .MuiSelect-select': {p: 0}}}
            >
              <MenuItem value="">
                <Typography sx={{fontSize: 13.2, color: '#98A2B3'}}>{placeholder}</Typography>
              </MenuItem>
              {options.map((option) => (
                <MenuItem key={option} value={option}>{optionLabelMap?.[option] ?? option}</MenuItem>
              ))}
            </Select>
          )}
        </Box>
        {options ? endIcons ?? null : endIcons ?? (!readOnly ? <ArrowDownIcon sx={{fontSize: 20, color: '#98A2B3'}} /> : null)}
      </Box>
    </Paper>
  );
}

function ProductionEntryTextField({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <Paper elevation={0} sx={{p: 1.05, borderRadius: 1.25, border: '1px solid #E5EAF3', mb: 0.8}}>
      <Typography sx={{fontSize: 11.2, color: '#667085', mb: 0.42}}>{label}</Typography>
      <TextField
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        variant="standard"
        fullWidth
        InputProps={{
          disableUnderline: true,
          sx: {
            minHeight: 24,
            p: 0,
            '& input': {
              p: 0,
              fontSize: 14.1,
              color: '#202124',
            },
            '& input::placeholder': {
              color: '#98A2B3',
              opacity: 1,
            },
          },
        }}
      />
    </Paper>
  );
}

function ProductionValueCard({
  fieldBorder,
  helper,
  icon,
  onChange,
  suffix,
  title,
  tone,
  unitLabel,
  value,
}: {
  fieldBorder: string;
  helper: string;
  icon: ReactNode;
  onChange: (value: string) => void;
  suffix: string;
  title: string;
  tone: string;
  unitLabel: string;
  value: string;
}) {
  return (
    <Paper elevation={0} sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 122px 42px', alignItems: 'center', gap: 0.85, p: 1.05, borderRadius: 1.25, border: '1px solid #E5EAF3', mb: 0.8}}>
      <Box sx={{display: 'grid', gridTemplateColumns: '30px minmax(0, 1fr)', gap: 0.8, alignItems: 'start'}}>
        <Box sx={{color: tone, mt: 0.15}}>{icon}</Box>
        <Box>
          <Typography sx={{fontSize: 12.3, color: tone, fontWeight: 900}}>
            {title} {unitLabel ? <Box component="span" sx={{fontSize: 10.8, color: '#202124', fontWeight: 700}}>{unitLabel}</Box> : null}
          </Typography>
          <Typography sx={{fontSize: 10.9, color: '#667085', lineHeight: 1.42, mt: 0.35}}>{helper}</Typography>
        </Box>
      </Box>
      <TextField
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        InputProps={{
          sx: {
            height: 64,
            borderRadius: 1.15,
            border: `1.5px solid ${fieldBorder}`,
            '& input': {
              textAlign: 'center',
              fontSize: 21,
              p: 0,
              color: '#202124',
            },
            '& fieldset': {border: 'none'},
          },
        }}
      />
      <Typography sx={{fontSize: 12, color: '#202124'}}>{suffix}</Typography>
    </Paper>
  );
}

function ProductionSummaryCard({
  efficiency,
  expectedQty,
  paidHours,
  piecesPerHour,
  productivity,
}: {
  efficiency: number;
  expectedQty: number;
  paidHours: number;
  piecesPerHour: number;
  productivity: number;
}) {
  const hasEfficiencyWarning = efficiency > 110;
  const productivityTone = productivity >= 90 ? '#16A34A' : productivity >= 75 ? '#F59E0B' : '#EF4444';
  return (
    <Paper elevation={0} sx={{p: 1.05, borderRadius: 1.25, border: '1px solid #D9E7FF', bgcolor: '#F8FBFF', mb: 0.8}}>
      <Typography sx={{fontSize: 12.8, color: '#0B63E5', fontWeight: 900, mb: 0.8}}>Live summary</Typography>
      <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 0.75}}>
        <SummaryMetric label="Pieces / Hour" value={formatMetric(piecesPerHour)} suffix="pcs" />
        <SummaryMetric label="Expected Qty" value={formatMetric(expectedQty, 1)} suffix="pcs" />
        <SummaryMetric
          label="Efficiency"
          value={formatMetric(efficiency, 1)}
          suffix="%"
          tone={hasEfficiencyWarning ? '#B45309' : efficiency >= 90 ? '#16A34A' : efficiency >= 75 ? '#F59E0B' : '#EF4444'}
          highlight={hasEfficiencyWarning}
        />
        <SummaryMetric label="Paid Hours" value={formatMetric(paidHours, 2)} suffix="hrs" />
        <SummaryMetric label="Productivity" value={formatMetric(productivity, 1)} suffix="%" tone={productivityTone} />
      </Box>
      {hasEfficiencyWarning ? (
        <Typography sx={{mt: 0.8, fontSize: 11.2, color: '#B45309', fontWeight: 700}}>
          Efficiency is above expected range. Please verify production entry or product/line rate.
        </Typography>
      ) : null}
    </Paper>
  );
}

function EndOfShiftSummaryCard({
  summary,
}: {
  summary: {produced: number; downtime: number; scrap: number; expected: number; efficiency: number; productivity: number};
}) {
  return (
    <Paper elevation={0} sx={{p: 1.05, borderRadius: 1.25, border: '1px solid #D9E7FF', bgcolor: '#F8FBFF', mb: 0.8}}>
      <Typography sx={{fontSize: 12.8, color: '#0B63E5', fontWeight: 900, mb: 0.8}}>End of shift summary</Typography>
      <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 0.75}}>
        <SummaryMetric label="Total Produced" value={formatMetric(summary.produced)} suffix="pcs" />
        <SummaryMetric label="Total Downtime" value={formatMetric(summary.downtime)} suffix="min" />
        <SummaryMetric label="Total Scrap" value={formatMetric(summary.scrap)} suffix="pcs / kg" />
        <SummaryMetric label="Overall Efficiency" value={formatMetric(summary.efficiency, 1)} suffix="%" tone={summary.efficiency >= 90 ? '#16A34A' : summary.efficiency >= 75 ? '#F59E0B' : '#EF4444'} />
        <SummaryMetric label="Productivity" value={formatMetric(summary.productivity, 1)} suffix="%" tone={summary.productivity >= 90 ? '#16A34A' : summary.productivity >= 75 ? '#F59E0B' : '#EF4444'} />
      </Box>
    </Paper>
  );
}

function SummaryMetric({
  highlight = false,
  label,
  suffix,
  tone = '#111827',
  value,
}: {
  highlight?: boolean;
  label: string;
  suffix: string;
  tone?: string;
  value: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 0.85,
        borderRadius: 1.05,
        border: highlight ? '1px solid #FCD34D' : '1px solid #E5EAF3',
        bgcolor: highlight ? '#FFFBEA' : '#FFFFFF',
      }}
    >
      <Typography sx={{fontSize: 10.5, color: '#667085', mb: 0.45}}>{label}</Typography>
      <Typography sx={{fontSize: 15, color: tone, fontWeight: 900}}>
        {value} <Box component="span" sx={{fontSize: 10.5, color: '#667085', fontWeight: 700}}>{suffix}</Box>
      </Typography>
    </Paper>
  );
}

function ReadOnlyRoleNotice({canEdit, userRole}: {canEdit: boolean; userRole: string}) {
  if (canEdit) return null;
  return (
    <Paper elevation={0} sx={{p: 0.95, borderRadius: 1.15, border: '1px solid #FCD34D', bgcolor: '#FFFBEA', mb: 0.8}}>
      <Typography sx={{fontSize: 11.4, color: '#92400E', fontWeight: 700}}>
        End of Shift editing is limited to the Line Leader role. Current role: {userRole}.
      </Typography>
    </Paper>
  );
}

function PersonnelMovementSection({
  disabled,
  helper,
  lineOptions,
  onAdd,
  onRemove,
  onUpdate,
  rows,
  title,
}: {
  disabled: boolean;
  helper: string;
  lineOptions: readonly string[] | string[];
  onAdd: () => void;
  onRemove: (movementId: string) => void;
  onUpdate: (movementId: string, updates: Partial<PersonnelMovement>) => void;
  rows: PersonnelMovement[];
  title: string;
}) {
  return (
    <Paper elevation={0} sx={{p: 1.05, borderRadius: 1.25, border: '1px solid #E5EAF3', mb: 0.8}}>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: rows.length ? 0.9 : 0.4}}>
        <Box>
          <Typography sx={{fontSize: 12.8, color: '#202124', fontWeight: 900}}>{title}</Typography>
          <Typography sx={{fontSize: 10.9, color: '#667085', mt: 0.2}}>{helper}</Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<AddIcon sx={{fontSize: 16}} />}
          onClick={onAdd}
          disabled={disabled}
          sx={{height: 30, borderRadius: 999, borderColor: '#7EA7FF', color: '#0B63E5', fontWeight: 800, fontSize: 11.1, textTransform: 'none'}}
        >
          Add row
        </Button>
      </Box>
      {rows.length ? (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.7}}>
          {rows.map((movement) => (
            <Paper key={movement.id} elevation={0} sx={{p: 0.85, borderRadius: 1.05, border: '1px solid #E5EAF3', bgcolor: '#FBFDFF'}}>
              <Box sx={{display: 'grid', gridTemplateColumns: '1fr 110px 110px 34px', gap: 0.65, alignItems: 'end'}}>
                <MiniSelectField
                  label="Line"
                  value={movement.line}
                  onChange={(value) => onUpdate(movement.id, {line: value})}
                  options={lineOptions}
                  placeholder="Select line"
                  disabled={disabled}
                />
                <MiniNumberField
                  label="Employees"
                  value={movement.employees}
                  onChange={(value) => onUpdate(movement.id, {employees: value})}
                  disabled={disabled}
                />
                <MiniNumberField
                  label="Hours"
                  value={movement.hours}
                  onChange={(value) => onUpdate(movement.id, {hours: value})}
                  disabled={disabled}
                />
                <IconButton onClick={() => onRemove(movement.id)} disabled={disabled} sx={{mb: 0.25, color: '#EF4444'}}>
                  <DeleteIcon sx={{fontSize: 18}} />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>
      ) : (
        <Typography sx={{fontSize: 11.2, color: '#98A2B3'}}>No rows added yet.</Typography>
      )}
    </Paper>
  );
}

function MiniSelectField({
  disabled = false,
  label,
  onChange,
  options,
  placeholder,
  value,
}: {
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  options: readonly string[] | string[];
  placeholder: string;
  value: string;
}) {
  return (
    <Box>
      <Typography sx={{fontSize: 10.6, color: '#667085', mb: 0.38}}>{label}</Typography>
      <Select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        displayEmpty
        fullWidth
        size="small"
        IconComponent={ArrowDownIcon}
        MenuProps={selectMenuProps}
        renderValue={(selected) => (
          <Typography sx={{fontSize: 12.3, color: selected ? '#111827' : '#98A2B3'}}>{selected || placeholder}</Typography>
        )}
        sx={{height: 40, borderRadius: 1.1, bgcolor: '#FFFFFF'}}
      >
        <MenuItem value="">
          <Typography sx={{fontSize: 12.3, color: '#98A2B3'}}>{placeholder}</Typography>
        </MenuItem>
        {options.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
      </Select>
    </Box>
  );
}

function MiniNumberField({
  disabled = false,
  label,
  onChange,
  value,
}: {
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <Box>
      <Typography sx={{fontSize: 10.6, color: '#667085', mb: 0.38}}>{label}</Typography>
      <TextField
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        size="small"
        fullWidth
        InputProps={{sx: {height: 40, borderRadius: 1.1, bgcolor: '#FFFFFF'}}}
      />
    </Box>
  );
}

function MiniTextField({
  disabled = false,
  label,
  multiline = false,
  onChange,
  placeholder,
  value,
}: {
  disabled?: boolean;
  label: string;
  multiline?: boolean;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <Box>
      <Typography sx={{fontSize: 10.6, color: '#667085', mb: 0.38}}>{label}</Typography>
      <TextField
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        size="small"
        fullWidth
        multiline={multiline}
        minRows={multiline ? 3 : undefined}
        InputProps={{sx: {borderRadius: 1.1, bgcolor: '#FFFFFF'}}}
      />
    </Box>
  );
}

function MiniToggleField({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <Box>
      <Typography sx={{fontSize: 10.6, color: '#667085', mb: 0.38}}>{label}</Typography>
      <Box sx={{display: 'flex', border: '1px solid #D6E3F8', borderRadius: 999, overflow: 'hidden', height: 40}}>
        {options.map((option) => {
          const active = value === option;
          return (
            <Box
              key={option}
              onClick={() => onChange(option)}
              sx={{
                flex: 1,
                display: 'grid',
                placeItems: 'center',
                bgcolor: active ? '#246BFE' : '#FFFFFF',
                color: active ? '#FFFFFF' : '#246BFE',
                fontSize: 11.3,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {option}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function ProductionOverviewContent({onToggleMajorEvents, showMajorEvents}: {onToggleMajorEvents: () => void; showMajorEvents: boolean}) {
  return (
    <Box>
      <Box sx={{display: 'grid', gridTemplateColumns: '1fr', gap: 0.8, mb: 0.8}}>
        <Paper elevation={0} sx={{p: 1, borderRadius: 1.15, bgcolor: '#F8FAFC', border: '1px solid #EDF2F7'}}>
          <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.8}}>
            <Box><Typography sx={{fontSize: 11, color: '#667085', mb: 0.42}}>Date</Typography><Typography sx={{fontSize: 14.2, color: '#202124'}}>14/01/2025</Typography></Box>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45, color: '#246BFE', mt: 0.15}}><CalendarIcon sx={{fontSize: 18}} /><Typography sx={{fontSize: 12.8, fontWeight: 800}}>Today</Typography></Box>
          </Box>
        </Paper>
      </Box>

      <ProductionEntrySelectField label="Line / Work Center" value="TJ1 - Manual Line 1" onChange={() => undefined} readOnly />

      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1}}>
        <Button variant="outlined" startIcon={<EditOutlinedIcon sx={{fontSize: 16}} />} sx={{height: 34, borderRadius: 999, borderColor: '#D7E2F3', color: '#0B63E5', fontWeight: 800, fontSize: 11.2, boxShadow: 'none'}}>Edit Column</Button>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
          <Typography sx={{fontSize: 11.6, color: '#344054'}}>Major Events/Problem</Typography>
          <Box onClick={onToggleMajorEvents} sx={{width: 36, height: 22, borderRadius: 999, bgcolor: showMajorEvents ? '#246BFE' : '#CBD5E1', position: 'relative', cursor: 'pointer'}}>
            <Box sx={{position: 'absolute', top: 2, left: showMajorEvents ? 16 : 2, width: 18, height: 18, borderRadius: '50%', bgcolor: '#FFFFFF', transition: 'left 0.2s ease'}} />
          </Box>
        </Box>
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.7, mb: 1}}>
        <ProductionOverviewMetricCard icon={<ProductionIcon sx={{fontSize: 20}} />} tone="#246BFE" title="Total Production" value="218.7k" unit="pcs" sublabel="Goal: 242k pcs" />
        <ProductionOverviewMetricCard icon={<DeleteIcon sx={{fontSize: 20}} />} tone="#FF7A00" title="Total Scrap" value="1,278" unit="pcs" sublabel="Scrap %: 0.58%" />
        <ProductionOverviewMetricCard icon={<AccessTimeIcon sx={{fontSize: 20}} />} tone="#8A46D8" title="Total Downtime" value="312" unit="min" sublabel="Downtime %: 5.4%" />
        <ProductionOverviewMetricCard icon={<CheckIcon sx={{fontSize: 20}} />} tone="#246BFE" title="OEE (Avg)" value="82%" sublabel="Goal: 85%" />
      </Box>

      <Paper elevation={0} sx={{borderRadius: 1.35, border: '1px solid #E5EAF3', overflow: 'hidden', mb: 0.9}}>
        <Box sx={{display: 'grid', gridTemplateColumns: '60px 100px 70px 80px 50px minmax(0,1fr) 60px', px: 0.8, py: 0.9, bgcolor: '#FFFFFF', borderBottom: '1px solid #E5EAF3', columnGap: 0.8}}>
          {['Hour', 'Prod', 'Scrap', 'Down', 'OEE', 'Notes', 'Act'].map((label) => <Typography key={label} sx={{fontSize: 10, fontWeight: 800, color: '#667085'}}>{label}</Typography>)}
        </Box>
        {productionOverviewRows.map((row) => (
          <Box key={row.hour} sx={{display: 'grid', gridTemplateColumns: '60px 100px 70px 80px 50px minmax(0,1fr) 60px', px: 0.8, py: 0.85, alignItems: 'center', columnGap: 0.8, borderBottom: '1px solid #EEF2F6'}}>
            <Typography sx={{fontSize: 10, fontWeight: row.critical ? 900 : 700, color: row.critical ? '#FF2E2E' : '#344054'}}>{row.hour}</Typography>
            <Typography sx={{fontSize: 10, fontWeight: 800, color: row.productionTone}}>{row.production}</Typography>
            <Typography sx={{fontSize: 10}}>{row.scrap}</Typography>
            <Typography sx={{fontSize: 10}}>{row.downtime}</Typography>
            <Typography sx={{fontSize: 10}}>{row.oee}</Typography>
            <Typography sx={{fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{showMajorEvents ? row.notes : '-'}</Typography>
            <Box sx={{display: 'flex', gap: 0.5, color: '#246BFE'}}><VisibilityOutlinedIcon sx={{fontSize: 14}} /><EditOutlinedIcon sx={{fontSize: 14}} /></Box>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}

function ProductionOverviewMetricCard({icon, sublabel, title, tone, unit, value}: {icon: ReactNode; sublabel: string; title: string; tone: string; unit?: string; value: string}) {
  return (
    <Paper elevation={0} sx={{p: 1, borderRadius: 1.2, border: '1px solid #E5EAF3', bgcolor: '#FFFFFF'}}>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6, color: tone, mb: 0.75}}>{icon}<Typography sx={{fontSize: 10, color: '#475467', fontWeight: 700}}>{title}</Typography></Box>
      <Typography sx={{fontSize: 14, fontWeight: 900, color: '#111827', lineHeight: 1.1}}>{value}{unit && <Box component="span" sx={{fontSize: 10, ml: 0.3}}>{unit}</Box>}</Typography>
      <Typography sx={{fontSize: 10, color: '#667085', mt: 0.55}}>{sublabel}</Typography>
    </Paper>
  );
}
