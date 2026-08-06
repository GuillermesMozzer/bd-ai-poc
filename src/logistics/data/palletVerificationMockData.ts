/** Sample data for 3D Pallet Verification — ported from logistics-mock/3d-pallet-verification */

export const palletOperator = {
  name: 'Maria Santos',
  role: 'Warehouse Operator',
  area: 'Warehouse Zone B',
  shift: 'Shift A · Day',
};

export const palletStats = {
  verifiedToday: 18,
  needsReview: 3,
  blocked: 1,
};

export const verificationPallet = {
  palletId: 'PLT-EP-000483',
  handlingUnit: 'HU-78392014',
  sku: 'BD-45021',
  productFamily: 'Finished Goods',
  batch: 'B240719-A',
  lot: 'L-98231',
  quantity: 96,
  unit: 'boxes',
  palletType: 'Standard 48×40',
  expectedLayers: 6,
  boxesPerLayer: 16,
  totalBoxes: 96,
  expectedGrossWeight: '1,248 lb',
  destination: 'Shipping Staging',
  currentLocation: 'Warehouse Zone B · Lane 4',
  qualityStatus: 'Released',
  systemStatus: 'Pending Verification',
  dataStatus: 'Data complete',
  dimensions: {
    pallet: '48 × 40 × 6 in',
    box: '12 × 10 × 8 in',
  },
  wrapping: 'Full stretch wrap · 4 sides + top',
  lashing: '2 horizontal ties · mid + upper third',
  labelRequirements: 'HU label front · SKU label visible on 2 sides',
};

export const checklistItems = [
  { id: 'id_match', label: 'Pallet ID matches system record', critical: true },
  { id: 'pallet_type', label: 'Correct pallet type', critical: true },
  { id: 'box_count', label: 'Correct box count', critical: true },
  { id: 'stack_pattern', label: 'Correct stacking pattern', critical: true },
  { id: 'alignment', label: 'Boxes aligned within pallet footprint', critical: false },
  { id: 'damage', label: 'No visible damaged boxes', critical: true },
  { id: 'labels', label: 'Labels are visible and readable', critical: true },
  { id: 'wrap', label: 'Stretch wrap is complete', critical: false },
  { id: 'lashing', label: 'Lashing / tie points are correct', critical: false },
  { id: 'safe_move', label: 'Pallet is safe to move', critical: true },
] as const;

export const captureSteps = [
  { id: 'front', label: 'Front side', guidance: 'Capture front side' },
  { id: 'left', label: 'Left side', guidance: 'Move around the pallet — capture left side' },
  { id: 'right', label: 'Right side', guidance: 'Capture right side' },
  { id: 'label', label: 'Label area', guidance: 'Capture label area' },
  { id: 'top', label: 'Top / angle', guidance: 'Capture top / angle view' },
] as const;

export type DetectedIssue = {
  id: string;
  type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  confidence: number;
  location: string;
  requiredAction: string;
  status: 'pending' | 'confirmed' | 'dismissed';
  aiLabel: string;
  comment: string;
};

export const seedDetectedIssues: DetectedIssue[] = [
  {
    id: 'iss-001',
    type: 'Damaged Box',
    severity: 'Medium',
    confidence: 84,
    location: 'Front-right corner, layer 3',
    requiredAction: 'Supervisor review before movement',
    status: 'pending',
    aiLabel: 'Damaged Box Suspected',
    comment: '',
  },
  {
    id: 'iss-002',
    type: 'Alignment Issue',
    severity: 'Low',
    confidence: 62,
    location: 'Right edge, layers 4–5',
    requiredAction: 'Confirm overhang within tolerance',
    status: 'pending',
    aiLabel: 'Alignment Issue',
    comment: '',
  },
  {
    id: 'iss-003',
    type: 'Label Not Detected',
    severity: 'Medium',
    confidence: 71,
    location: 'Front face',
    requiredAction: 'Verify HU label is present and readable',
    status: 'pending',
    aiLabel: 'Label Not Detected',
    comment: '',
  },
];

export const issueCategories = [
  'Damaged box',
  'Missing label',
  'Misalignment',
  'Wrong stack pattern',
  'Overhang',
  'Incorrect wrapping',
  'Incorrect lashing',
  'Quantity mismatch',
  'Other',
];

export const recentVerifications = [
  { palletId: 'PLT-EP-000481', sku: 'BD-45021', status: 'Ready', time: '14:12', operator: 'M. Santos' },
  { palletId: 'PLT-EP-000479', sku: 'BD-33108', status: 'Needs Review', time: '13:48', operator: 'J. Ortiz' },
  { palletId: 'PLT-EP-000476', sku: 'BD-45021', status: 'Ready', time: '13:05', operator: 'M. Santos' },
  { palletId: 'PLT-EP-000472', sku: 'BD-22890', status: 'Blocked', time: '12:22', operator: 'A. Chen' },
  { palletId: 'PLT-EP-000470', sku: 'BD-45021', status: 'Ready', time: '11:55', operator: 'M. Santos' },
];

export const palletExceptions = [
  {
    id: 'EXC-2026-00419',
    palletId: 'PLT-EP-000483',
    issueType: 'Damaged Box',
    severity: 'Medium',
    owner: 'Warehouse Lead',
    area: 'Warehouse Zone B',
    timestamp: '2026-07-10T14:36:00',
    status: 'Needs Review',
    photos: 3,
    comment: 'Front-right box appears crushed; pallet requires review before shipping.',
    recommendedAction: 'Replace damaged box and re-wrap before movement',
  },
];

export const supervisorQueue = [
  { palletId: 'PLT-EP-000483', sku: 'BD-45021', status: 'Needs Review', severity: 'Medium', area: 'Zone B', operator: 'M. Santos', age: '12 min' },
  { palletId: 'PLT-EP-000479', sku: 'BD-33108', status: 'Needs Review', severity: 'High', area: 'Shipping', operator: 'J. Ortiz', age: '48 min' },
  { palletId: 'PLT-EP-000472', sku: 'BD-22890', status: 'Blocked', severity: 'Critical', area: 'Zone A', operator: 'A. Chen', age: '2.1 h' },
  { palletId: 'PLT-EP-000481', sku: 'BD-45021', status: 'Ready', severity: '—', area: 'Zone B', operator: 'M. Santos', age: '—' },
  { palletId: 'PLT-EP-000476', sku: 'BD-45021', status: 'Ready', severity: '—', area: 'Zone B', operator: 'M. Santos', age: '—' },
  { palletId: 'PLT-EP-000468', sku: 'BD-11902', status: 'Needs Review', severity: 'Low', area: 'Zone C', operator: 'K. Lee', age: '1.4 h' },
];

export const palletAnalytics = {
  totalVerified: 142,
  exceptionsToday: 7,
  topIssueType: 'Damaged Box',
  avgReviewTime: '18 min',
  byIssueType: [
    { label: 'Damaged Box', value: 28 },
    { label: 'Missing Label', value: 19 },
    { label: 'Misalignment', value: 15 },
    { label: 'Incorrect Wrapping', value: 12 },
    { label: 'Wrong Stack', value: 8 },
    { label: 'Overhang', value: 6 },
  ],
  bySku: [
    { label: 'BD-45021', value: 22 },
    { label: 'BD-33108', value: 14 },
    { label: 'BD-22890', value: 11 },
    { label: 'BD-11902', value: 9 },
  ],
  byArea: [
    { label: 'Zone B', value: 31 },
    { label: 'Shipping', value: 18 },
    { label: 'Zone A', value: 16 },
    { label: 'Zone C', value: 12 },
  ],
  byShift: [
    { label: 'Shift A', value: 42 },
    { label: 'Shift B', value: 28 },
    { label: 'Shift C', value: 17 },
  ],
};

export type PalletScreen =
  | 'home'
  | 'identified'
  | 'viewer'
  | 'checklist'
  | 'camera'
  | 'issues'
  | 'result'
  | 'exception'
  | 'supervisor'
  | 'analytics';

export const FLOW_STEPS = ['Identify', '3D View', 'Checklist', 'Capture', 'Issues', 'Result'] as const;

export const SCREEN_FLOW_STEP: Partial<Record<PalletScreen, number>> = {
  identified: 0,
  viewer: 1,
  checklist: 2,
  camera: 3,
  issues: 4,
  result: 5,
};
