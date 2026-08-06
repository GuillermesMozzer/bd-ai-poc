export type MaterialStatus = 'Ready' | 'Warning' | 'Critical' | 'Blocked' | 'On Hold' | 'In Transit' | 'Shortage' | 'Unknown';

export type MaterialType = 'Raw Material' | 'Foil' | 'Component' | 'Finished Goods' | 'Sterilization Load';

export interface MaterialRecord {
  id: string;
  materialNumber: string;
  materialDescription: string;
  materialType: MaterialType;
  supplier: string;
  relatedPcn: string;
  productFamily: string;
  currentStock: number;
  availableStock: number;
  blockedStock: number;
  safetyStock: number;
  safetyStockPercentage: number;
  projectedFirstShortageDate: string | null;
  nextDeliveryDate: string | null;
  openPoQuantity: number;
  consumptionNextFourWeeks: number;
  readinessStatus: MaterialStatus;
  riskReason: string;
  responsibleOwner: string;
  lastUpdated: string;
}

export interface InventoryBucket {
  bucketLabel: string;
  openingStock: number;
  confirmedReceipts: number;
  forecastReceipts: number;
  plannedConsumption: number;
  actualConsumption: number;
  adjustments: number;
  endingStock: number;
  status: MaterialStatus;
}

export interface ProjectedInventoryRecord {
  materialNumber: string;
  materialDescription: string;
  supplier: string;
  currentStock: number;
  safetyStock: number;
  midpoint: number;
  minimum: number;
  maximum: number;
  nextDelivery: string | null;
  projectedStockoutDate: string | null;
  owner: string;
  buckets: InventoryBucket[];
}

export interface MaterialBreakdownRecord {
  pcn: string;
  finishedGood: string;
  productFamily: string;
  materialNumber: string;
  materialDescription: string;
  bomQuantity: number;
  scrapFactor: number;
  requiredQuantity: number;
  uom: string;
  conversionFactor: number;
  requiredQuantityBaseUom: number;
  source: string;
}

export interface FoilBreakdownRecord {
  pcn: string;
  foilMaterial: string;
  foilDescription: string;
  productionQuantity: number;
  scrapFactor: number;
  requiredFoilQuantity: number;
  uom: string;
  availableStock: number;
  projectedEndingStock: number;
  shortageDate: string | null;
  riskStatus: MaterialStatus;
}

export interface SapMovementRecord {
  id: string;
  plant: string;
  movementType: string;
  movementGroup: string;
  material: string;
  materialDescription: string;
  purchaseOrder: string;
  materialDocument: string;
  postingDate: string;
  quantity: number;
  uom: string;
  batch: string;
  reference: string;
  conversionToEa: number;
  totalQuantityBaseUom: number;
  sourceSystem: string;
  refreshTimestamp: string;
}

export interface PurchaseOrderRecord {
  poNumber: string;
  material: string;
  materialDescription: string;
  supplier: string;
  poQuantity: number;
  confirmedQuantity: number;
  requestedDeliveryDate: string;
  confirmedDeliveryDate: string;
  inTransitQuantity: number;
  receiptStatus: string;
  lastSupplierConfirmation: string;
  riskStatus: MaterialStatus;
}

export interface ExpediteAction {
  expediteId: string;
  material: string;
  supplier: string;
  reason: string;
  productionImpact: string;
  normalDeliveryDate: string;
  requestedPullInDate: string;
  confirmedPullInDate: string | null;
  transportMode: string;
  estimatedExtraCost: number;
  approvalStatus: string;
  owner: string;
  comments: string;
}

export interface WarehouseReceiptRecord {
  receiptId: string;
  deliveryNote: string;
  poNumber: string;
  supplier: string;
  material: string;
  batch: string;
  quantityReceived: number;
  quantityExpected: number;
  uom: string;
  integrityCheck: string;
  deliveryMatchStatus: string;
  sapReceiptStatus: string;
  labelStatus: string;
  sqaStatus: string;
  holdStatus: string;
  putAwayStatus: string;
  receivingUser: string;
  receivingTimestamp: string;
}

export interface LocationRecord {
  material: string;
  batch: string;
  quantity: number;
  uom: string;
  location: string;
  fifoRank: number;
  status: MaterialStatus;
  expiryDate: string | null;
  lastMovement: string;
  lastScanUser: string;
}

export interface StagingRecord {
  workOrder: string;
  productionLine: string;
  requiredMaterial: string;
  requiredQuantity: number;
  pickedQuantity: number;
  stagedQuantity: number;
  missingQuantity: number;
  stagingStatus: string;
  requiredBy: string;
  warehouseOwner: string;
}

export interface SqaHoldRecord {
  material: string;
  batch: string;
  supplier: string;
  quantityOnHold: number;
  holdReason: string;
  sqaReviewRequired: boolean;
  inspectionStatus: string;
  expectedReleaseDate: string | null;
  impactedWorkOrders: string[];
  impactedPcns: string[];
  shortageRisk: MaterialStatus;
  owner: string;
  lastUpdate: string;
}

export interface SterilizationRecord {
  batch: string;
  pcn: string;
  quantity: number;
  dateOfManufacture: string;
  dwellLimitDays: number;
  daysRemaining: number;
  sterilizer: string;
  status: string;
  risk: MaterialStatus;
}

export interface SterilizationLoadRecord {
  loadId: string;
  sterilizer: string;
  batch: string;
  pcn: string;
  quantity: number;
  densityCategory: string;
  cycleTime: number;
  compatibilityStatus: string;
  palletCount: number;
  loadStatus: string;
}

export interface PostSterileRecord {
  batch: string;
  quantitySterilized: number;
  sapConfirmationStatus: string;
  shippingStatus: string;
  lotsTransferStatus: string;
  releaseStatus: string;
  exception: string;
}

export interface ScenarioRecord {
  scenarioId: string;
  scenarioName: string;
  owner: string;
  reason: string;
  baselineDate: string;
  affectedMaterials: string[];
  assumptionChanges: string;
  resultingShortageDate: string | null;
  differenceVsBaseline: string;
  recommendedAction: string;
  status: string;
}

export interface MasterDataRecord {
  category: string;
  key: string;
  description: string;
  currentValue: string;
  previousValue: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  owner: string;
  approvalStatus: string;
  lastChanged: string;
}

export interface AuditTrailRecord {
  eventId: string;
  timestamp: string;
  user: string;
  role: string;
  objectType: string;
  objectId: string;
  previousValue: string;
  newValue: string;
  reasonCode: string;
  comment: string;
  sourceScreen: string;
}

export interface AiRecommendation {
  recommendationId: string;
  objectType: string;
  objectId: string;
  recommendationType: string;
  summary: string;
  explanation: string;
  confidence: number;
  sourceDataTimestamp: string;
  userDecision: string | null;
}

export interface MaterialWarehouseFilters {
  site: string;
  building: string;
  materialType: string;
  materialNumber: string;
  pcn: string;
  supplier: string;
  productionArea: string;
  dateHorizon: string;
  status: string;
  dataSource: string;
}

export type MaterialWarehouseTab =
  | 'material-overview'
  | 'projected-inventory'
  | 'material-breakdown'
  | 'foil-breakdown'
  | 'sap-movements'
  | 'purchase-expedite'
  | 'warehouse-receiving'
  | 'location-staging'
  | 'quality-sqa-holds'
  | 'sterilization-shipping'
  | 'scenario-simulation'
  | 'audit-trail';

export interface ScenarioFormState {
  scenarioName: string;
  scenarioType: string;
  affectedMaterial: string;
  assumptionChange: string;
  dateImpact: string;
  quantityImpact: string;
  reason: string;
}

export interface ScenarioResult {
  firstImpactedPcn: string;
  firstShortageWeek: string;
  maximumShortage: number;
  affectedWos: number;
  recommendedAction: string;
}

export interface MaterialWarehouseState {
  activeTab: MaterialWarehouseTab;
  filters: MaterialWarehouseFilters;
  selectedMaterialId: string | null;
  drawerOpen: boolean;
  aiPanelOpen: boolean;
  aiMaterialId: string | null;
  toastMessage: string | null;
  filtersExpanded: boolean;
  scenarioForm: ScenarioFormState;
  scenarioResult: ScenarioResult | null;
  scenarioHasRun: boolean;
}
