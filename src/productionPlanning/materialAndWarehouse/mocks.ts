import type {
  AuditTrailRecord,
  ExpediteAction,
  FoilBreakdownRecord,
  InventoryBucket,
  LocationRecord,
  MasterDataRecord,
  MaterialBreakdownRecord,
  MaterialRecord,
  PostSterileRecord,
  ProjectedInventoryRecord,
  PurchaseOrderRecord,
  SapMovementRecord,
  ScenarioRecord,
  SqaHoldRecord,
  StagingRecord,
  SterilizationLoadRecord,
  SterilizationRecord,
  WarehouseReceiptRecord,
} from './types';

export const mockMaterials: MaterialRecord[] = [
  {
    id: 'm1',
    materialNumber: '8004430',
    materialDescription: 'Heparin Sodium API',
    materialType: 'Raw Material',
    supplier: 'Supplier ABC',
    relatedPcn: 'NS364314',
    productFamily: 'ABG',
    currentStock: 42,
    availableStock: 18,
    blockedStock: 24,
    safetyStock: 80,
    safetyStockPercentage: 22.5,
    projectedFirstShortageDate: '2026-08-04',
    nextDeliveryDate: '2026-08-11',
    openPoQuantity: 200,
    consumptionNextFourWeeks: 95,
    readinessStatus: 'Critical',
    riskReason: 'Below 25% SS; 24 units on SQA hold; PO confirmation late',
    responsibleOwner: 'Maria Santos',
    lastUpdated: '2026-05-14T06:15:00Z',
  },
  {
    id: 'm2',
    materialNumber: '301656',
    materialDescription: 'Foil ABG Laminate 250mm',
    materialType: 'Foil',
    supplier: 'Foil Supplier Ltd',
    relatedPcn: 'NS364316',
    productFamily: 'ABG',
    currentStock: 3200,
    availableStock: 3200,
    blockedStock: 0,
    safetyStock: 5000,
    safetyStockPercentage: 64,
    projectedFirstShortageDate: '2026-08-18',
    nextDeliveryDate: '2026-08-01',
    openPoQuantity: 8000,
    consumptionNextFourWeeks: 2400,
    readinessStatus: 'Warning',
    riskReason: 'Below safety stock threshold; lead time risk',
    responsibleOwner: 'John Carvalho',
    lastUpdated: '2026-05-14T06:15:00Z',
  },
  {
    id: 'm3',
    materialNumber: '700221',
    materialDescription: 'Polycarbonate Resin Granules',
    materialType: 'Raw Material',
    supplier: 'Polymer Global',
    relatedPcn: 'NS364327',
    productFamily: 'Tubes',
    currentStock: 15000,
    availableStock: 15000,
    blockedStock: 0,
    safetyStock: 8000,
    safetyStockPercentage: 187.5,
    projectedFirstShortageDate: null,
    nextDeliveryDate: '2026-06-02',
    openPoQuantity: 20000,
    consumptionNextFourWeeks: 4200,
    readinessStatus: 'Ready',
    riskReason: '',
    responsibleOwner: 'Ana Lima',
    lastUpdated: '2026-05-14T06:15:00Z',
  },
  {
    id: 'm4',
    materialNumber: '600118',
    materialDescription: '21G x 1.5" Stainless Needle',
    materialType: 'Component',
    supplier: 'Precision Medical',
    relatedPcn: 'NS368860',
    productFamily: 'Eclipse',
    currentStock: 500,
    availableStock: 0,
    blockedStock: 500,
    safetyStock: 2000,
    safetyStockPercentage: 0,
    projectedFirstShortageDate: '2026-05-21',
    nextDeliveryDate: null,
    openPoQuantity: 0,
    consumptionNextFourWeeks: 1800,
    readinessStatus: 'Blocked',
    riskReason: 'Full quantity on SQA hold; supplier deviation open; no open POs',
    responsibleOwner: 'Carlos Ferreira',
    lastUpdated: '2026-05-14T06:15:00Z',
  },
  {
    id: 'm5',
    materialNumber: '900778',
    materialDescription: 'Label Case Pack — Hard Pack',
    materialType: 'Component',
    supplier: 'Print Vendor',
    relatedPcn: 'NS364314',
    productFamily: 'Hard Pack',
    currentStock: 6000,
    availableStock: 6000,
    blockedStock: 0,
    safetyStock: 4000,
    safetyStockPercentage: 150,
    projectedFirstShortageDate: null,
    nextDeliveryDate: '2026-06-10',
    openPoQuantity: 10000,
    consumptionNextFourWeeks: 3500,
    readinessStatus: 'On Hold',
    riskReason: 'Label artwork revision pending approval',
    responsibleOwner: 'Rita Oliveira',
    lastUpdated: '2026-05-14T06:15:00Z',
  },
  {
    id: 'm6',
    materialNumber: '501144',
    materialDescription: 'Silicone O-Ring Seal 12mm',
    materialType: 'Component',
    supplier: 'Seal Tech',
    relatedPcn: 'NS364327',
    productFamily: 'Tubes',
    currentStock: 1200,
    availableStock: 1000,
    blockedStock: 200,
    safetyStock: 1500,
    safetyStockPercentage: 80,
    projectedFirstShortageDate: '2026-09-01',
    nextDeliveryDate: '2026-07-15',
    openPoQuantity: 5000,
    consumptionNextFourWeeks: 800,
    readinessStatus: 'Warning',
    riskReason: 'Approaching safety stock; partial hold batch',
    responsibleOwner: 'Ana Lima',
    lastUpdated: '2026-05-14T06:15:00Z',
  },
];

const buildBuckets = (
  materialNumber: string,
  baseStock: number,
  ss: number,
  receipts: number[],
  consumption: number[],
): InventoryBucket[] => {
  const weeks = ['Wk 28', 'Wk 29', 'Wk 30', 'Wk 31', 'Wk 32', 'Wk 33', 'Wk 34', 'Wk 35'];
  let running = baseStock;
  return weeks.map((label, i) => {
    const opening = running;
    const cr = receipts[i] ?? 0;
    const fc = 0;
    const pc = consumption[i] ?? 0;
    const ac = i < 2 ? pc : 0;
    const adj = 0;
    const ending = opening + cr + fc - pc + adj;
    running = ending;
    const status =
      ending < 0
        ? 'Shortage'
        : ending < ss * 0.5
          ? 'Critical'
          : ending < ss
            ? 'Warning'
            : 'Ready';
    return {bucketLabel: label, openingStock: opening, confirmedReceipts: cr, forecastReceipts: fc, plannedConsumption: pc, actualConsumption: ac, adjustments: adj, endingStock: ending, status};
  });
};

export const mockProjectedInventory: ProjectedInventoryRecord[] = [
  {
    materialNumber: '8004430',
    materialDescription: 'Heparin Sodium API',
    supplier: 'Supplier ABC',
    currentStock: 42,
    safetyStock: 80,
    midpoint: 120,
    minimum: 40,
    maximum: 300,
    nextDelivery: '2026-08-11',
    projectedStockoutDate: '2026-08-04',
    owner: 'Maria Santos',
    buckets: buildBuckets('8004430', 42, 80, [0, 0, 0, 200, 0, 0, 0, 0], [25, 25, 25, 25, 25, 25, 25, 25]),
  },
  {
    materialNumber: '301656',
    materialDescription: 'Foil ABG Laminate 250mm',
    supplier: 'Foil Supplier Ltd',
    currentStock: 3200,
    safetyStock: 5000,
    midpoint: 7500,
    minimum: 2500,
    maximum: 15000,
    nextDelivery: '2026-08-01',
    projectedStockoutDate: '2026-08-18',
    owner: 'John Carvalho',
    buckets: buildBuckets('301656', 3200, 5000, [0, 0, 8000, 0, 0, 0, 0, 0], [600, 600, 600, 600, 600, 600, 600, 600]),
  },
  {
    materialNumber: '700221',
    materialDescription: 'Polycarbonate Resin Granules',
    supplier: 'Polymer Global',
    currentStock: 15000,
    safetyStock: 8000,
    midpoint: 12000,
    minimum: 4000,
    maximum: 30000,
    nextDelivery: '2026-06-02',
    projectedStockoutDate: null,
    owner: 'Ana Lima',
    buckets: buildBuckets('700221', 15000, 8000, [20000, 0, 0, 0, 20000, 0, 0, 0], [1050, 1050, 1050, 1050, 1050, 1050, 1050, 1050]),
  },
  {
    materialNumber: '600118',
    materialDescription: '21G x 1.5" Stainless Needle',
    supplier: 'Precision Medical',
    currentStock: 0,
    safetyStock: 2000,
    midpoint: 3000,
    minimum: 1000,
    maximum: 8000,
    nextDelivery: null,
    projectedStockoutDate: '2026-05-21',
    owner: 'Carlos Ferreira',
    buckets: buildBuckets('600118', 0, 2000, [0, 0, 0, 0, 0, 0, 0, 0], [450, 450, 450, 450, 450, 450, 450, 450]),
  },
  {
    materialNumber: '900778',
    materialDescription: 'Label Case Pack — Hard Pack',
    supplier: 'Print Vendor',
    currentStock: 6000,
    safetyStock: 4000,
    midpoint: 6000,
    minimum: 2000,
    maximum: 12000,
    nextDelivery: '2026-06-10',
    projectedStockoutDate: null,
    owner: 'Rita Oliveira',
    buckets: buildBuckets('900778', 6000, 4000, [0, 10000, 0, 0, 0, 10000, 0, 0], [875, 875, 875, 875, 875, 875, 875, 875]),
  },
];

export const mockMaterialBreakdown: MaterialBreakdownRecord[] = [
  {pcn: 'NS364314', finishedGood: 'ABG Unit Standard', productFamily: 'ABG', materialNumber: '8004430', materialDescription: 'Heparin Sodium API', bomQuantity: 0.5, scrapFactor: 1.03, requiredQuantity: 0.515, uom: 'ML', conversionFactor: 1, requiredQuantityBaseUom: 0.515, source: 'SAP BOM v12'},
  {pcn: 'NS364314', finishedGood: 'ABG Unit Standard', productFamily: 'ABG', materialNumber: '301656', materialDescription: 'Foil ABG Laminate 250mm', bomQuantity: 1.2, scrapFactor: 1.05, requiredQuantity: 1.26, uom: 'M2', conversionFactor: 1, requiredQuantityBaseUom: 1.26, source: 'SAP BOM v12'},
  {pcn: 'NS364316', finishedGood: 'ABG Unit Pro', productFamily: 'ABG', materialNumber: '8004430', materialDescription: 'Heparin Sodium API', bomQuantity: 0.6, scrapFactor: 1.03, requiredQuantity: 0.618, uom: 'ML', conversionFactor: 1, requiredQuantityBaseUom: 0.618, source: 'SAP BOM v13'},
  {pcn: 'NS364327', finishedGood: 'Tube Set Standard', productFamily: 'Tubes', materialNumber: '700221', materialDescription: 'Polycarbonate Resin Granules', bomQuantity: 12.5, scrapFactor: 1.02, requiredQuantity: 12.75, uom: 'G', conversionFactor: 0.001, requiredQuantityBaseUom: 0.01275, source: 'SAP BOM v8'},
  {pcn: 'NS364327', finishedGood: 'Tube Set Standard', productFamily: 'Tubes', materialNumber: '501144', materialDescription: 'Silicone O-Ring Seal 12mm', bomQuantity: 2, scrapFactor: 1.01, requiredQuantity: 2.02, uom: 'EA', conversionFactor: 1, requiredQuantityBaseUom: 2.02, source: 'SAP BOM v8'},
  {pcn: 'NS368860', finishedGood: 'Eclipse Safety Needle', productFamily: 'Eclipse', materialNumber: '600118', materialDescription: '21G x 1.5" Stainless Needle', bomQuantity: 1, scrapFactor: 1.005, requiredQuantity: 1.005, uom: 'EA', conversionFactor: 1, requiredQuantityBaseUom: 1.005, source: 'SAP BOM v5'},
];

export const mockFoilBreakdown: FoilBreakdownRecord[] = [
  {pcn: 'NS364314', foilMaterial: '301656', foilDescription: 'Foil ABG Laminate 250mm', productionQuantity: 5000, scrapFactor: 1.05, requiredFoilQuantity: 6300, uom: 'M2', availableStock: 3200, projectedEndingStock: -3100, shortageDate: '2026-08-18', riskStatus: 'Critical'},
  {pcn: 'NS364316', foilMaterial: '301656', foilDescription: 'Foil ABG Laminate 250mm', productionQuantity: 3000, scrapFactor: 1.05, requiredFoilQuantity: 3780, uom: 'M2', availableStock: 3200, projectedEndingStock: -580, shortageDate: '2026-08-25', riskStatus: 'Warning'},
  {pcn: 'NS364327', foilMaterial: '302001', foilDescription: 'Tube Wrap Film 180mm', productionQuantity: 8000, scrapFactor: 1.03, requiredFoilQuantity: 9840, uom: 'M2', availableStock: 12000, projectedEndingStock: 2160, shortageDate: null, riskStatus: 'Ready'},
  {pcn: 'NS368860', foilMaterial: '302005', foilDescription: 'Eclipse Tray Seal Film', productionQuantity: 10000, scrapFactor: 1.04, requiredFoilQuantity: 10400, uom: 'M2', availableStock: 9500, projectedEndingStock: -900, shortageDate: '2026-09-10', riskStatus: 'Warning'},
];

export const mockSapMovements: SapMovementRecord[] = [
  {id: 'sm1', plant: 'PL01', movementType: '101', movementGroup: 'PCN Receipt', material: '8004430', materialDescription: 'Heparin Sodium API', purchaseOrder: '4500012345', materialDocument: 'MAT-100001', postingDate: '2026-05-10', quantity: 200, uom: 'ML', batch: 'B2026-001', reference: 'DN-98765', conversionToEa: 1, totalQuantityBaseUom: 200, sourceSystem: 'SAP ECC', refreshTimestamp: '2026-05-14T06:15:00Z'},
  {id: 'sm2', plant: 'PL01', movementType: '261', movementGroup: 'Raw Material Usage', material: '8004430', materialDescription: 'Heparin Sodium API', purchaseOrder: '', materialDocument: 'MAT-100002', postingDate: '2026-05-12', quantity: -25, uom: 'ML', batch: 'B2026-001', reference: 'WO-8800001', conversionToEa: 1, totalQuantityBaseUom: -25, sourceSystem: 'SAP ECC', refreshTimestamp: '2026-05-14T06:15:00Z'},
  {id: 'sm3', plant: 'PL01', movementType: '101', movementGroup: 'Foil Receipt', material: '301656', materialDescription: 'Foil ABG Laminate 250mm', purchaseOrder: '4500012400', materialDocument: 'MAT-100003', postingDate: '2026-05-08', quantity: 1000, uom: 'M2', batch: 'F2026-010', reference: 'DN-98800', conversionToEa: 1, totalQuantityBaseUom: 1000, sourceSystem: 'SAP ECC', refreshTimestamp: '2026-05-14T06:15:00Z'},
  {id: 'sm4', plant: 'PL01', movementType: '261', movementGroup: 'Foil Usage', material: '301656', materialDescription: 'Foil ABG Laminate 250mm', purchaseOrder: '', materialDocument: 'MAT-100004', postingDate: '2026-05-13', quantity: -600, uom: 'M2', batch: 'F2026-010', reference: 'WO-8800002', conversionToEa: 1, totalQuantityBaseUom: -600, sourceSystem: 'SAP ECC', refreshTimestamp: '2026-05-14T06:15:00Z'},
  {id: 'sm5', plant: 'PL01', movementType: '107', movementGroup: 'PCN Receipt', material: '600118', materialDescription: '21G x 1.5" Stainless Needle', purchaseOrder: '4500012450', materialDocument: 'MAT-100005', postingDate: '2026-05-09', quantity: 500, uom: 'EA', batch: 'N2026-020', reference: 'DN-98810', conversionToEa: 1, totalQuantityBaseUom: 500, sourceSystem: 'SAP ECC', refreshTimestamp: '2026-05-14T06:15:00Z'},
  {id: 'sm6', plant: 'PL01', movementType: '701', movementGroup: 'Adjustment', material: '700221', materialDescription: 'Polycarbonate Resin Granules', purchaseOrder: '', materialDocument: 'MAT-100006', postingDate: '2026-05-11', quantity: -150, uom: 'KG', batch: 'R2026-005', reference: 'CYCLE-COUNT-01', conversionToEa: 1, totalQuantityBaseUom: -150, sourceSystem: 'SAP ECC', refreshTimestamp: '2026-05-14T06:15:00Z'},
  {id: 'sm7', plant: 'PL01', movementType: '101', movementGroup: 'Raw Material Receipt', material: '700221', materialDescription: 'Polycarbonate Resin Granules', purchaseOrder: '4500012500', materialDocument: 'MAT-100007', postingDate: '2026-05-13', quantity: 5000, uom: 'KG', batch: 'R2026-006', reference: 'DN-98850', conversionToEa: 1, totalQuantityBaseUom: 5000, sourceSystem: 'SAP ECC', refreshTimestamp: '2026-05-14T06:15:00Z'},
];

export const mockPurchaseOrders: PurchaseOrderRecord[] = [
  {poNumber: '4500012345', material: '8004430', materialDescription: 'Heparin Sodium API', supplier: 'Supplier ABC', poQuantity: 200, confirmedQuantity: 200, requestedDeliveryDate: '2026-08-04', confirmedDeliveryDate: '2026-08-11', inTransitQuantity: 0, receiptStatus: 'Pending', lastSupplierConfirmation: '2026-05-02', riskStatus: 'Critical'},
  {poNumber: '4500012400', material: '301656', materialDescription: 'Foil ABG Laminate 250mm', supplier: 'Foil Supplier Ltd', poQuantity: 8000, confirmedQuantity: 8000, requestedDeliveryDate: '2026-07-28', confirmedDeliveryDate: '2026-08-01', inTransitQuantity: 0, receiptStatus: 'Pending', lastSupplierConfirmation: '2026-05-05', riskStatus: 'Warning'},
  {poNumber: '4500012500', material: '700221', materialDescription: 'Polycarbonate Resin Granules', supplier: 'Polymer Global', poQuantity: 20000, confirmedQuantity: 20000, requestedDeliveryDate: '2026-06-02', confirmedDeliveryDate: '2026-06-02', inTransitQuantity: 0, receiptStatus: 'Confirmed', lastSupplierConfirmation: '2026-05-10', riskStatus: 'Ready'},
  {poNumber: '4500012550', material: '900778', materialDescription: 'Label Case Pack — Hard Pack', supplier: 'Print Vendor', poQuantity: 10000, confirmedQuantity: 10000, requestedDeliveryDate: '2026-06-10', confirmedDeliveryDate: '2026-06-10', inTransitQuantity: 0, receiptStatus: 'Confirmed', lastSupplierConfirmation: '2026-05-08', riskStatus: 'On Hold'},
  {poNumber: '4500012600', material: '501144', materialDescription: 'Silicone O-Ring Seal 12mm', supplier: 'Seal Tech', poQuantity: 5000, confirmedQuantity: 5000, requestedDeliveryDate: '2026-07-15', confirmedDeliveryDate: '2026-07-15', inTransitQuantity: 0, receiptStatus: 'Confirmed', lastSupplierConfirmation: '2026-05-12', riskStatus: 'Warning'},
];

export const mockExpediteActions: ExpediteAction[] = [
  {expediteId: 'EXP-001', material: '8004430', supplier: 'Supplier ABC', reason: 'Below safety stock; SQA hold reducing available qty', productionImpact: 'ABG line shortage Wk 31-33', normalDeliveryDate: '2026-08-11', requestedPullInDate: '2026-08-04', confirmedPullInDate: null, transportMode: 'Air Freight', estimatedExtraCost: 4500, approvalStatus: 'Pending Approval', owner: 'Maria Santos', comments: 'Urgently required to protect NS364314 build'},
  {expediteId: 'EXP-002', material: '301656', supplier: 'Foil Supplier Ltd', reason: 'Foil stock below SS; demand spike from NS364316', productionImpact: 'Foil risk starting Wk 33', normalDeliveryDate: '2026-08-01', requestedPullInDate: '2026-07-21', confirmedPullInDate: '2026-07-24', transportMode: 'Road', estimatedExtraCost: 800, approvalStatus: 'Approved', owner: 'John Carvalho', comments: 'Supplier confirmed partial pull-in'},
];

export const mockWarehouseReceipts: WarehouseReceiptRecord[] = [
  {receiptId: 'RCT-0451', deliveryNote: 'DN-98765', poNumber: '4500012345', supplier: 'Supplier ABC', material: '8004430', batch: 'B2026-001', quantityReceived: 200, quantityExpected: 200, uom: 'ML', integrityCheck: 'Pass', deliveryMatchStatus: 'Matched', sapReceiptStatus: 'Posted', labelStatus: 'Labeled', sqaStatus: 'Under Review', holdStatus: 'Hold', putAwayStatus: 'Pending', receivingUser: 'P. Costa', receivingTimestamp: '2026-05-10T09:32:00Z'},
  {receiptId: 'RCT-0452', deliveryNote: 'DN-98800', poNumber: '4500012400', supplier: 'Foil Supplier Ltd', material: '301656', batch: 'F2026-010', quantityReceived: 1000, quantityExpected: 1000, uom: 'M2', integrityCheck: 'Pass', deliveryMatchStatus: 'Matched', sapReceiptStatus: 'Posted', labelStatus: 'Labeled', sqaStatus: 'Released', holdStatus: 'No Hold', putAwayStatus: 'Completed', receivingUser: 'T. Melo', receivingTimestamp: '2026-05-08T11:15:00Z'},
  {receiptId: 'RCT-0453', deliveryNote: 'DN-98810', poNumber: '4500012450', supplier: 'Precision Medical', material: '600118', batch: 'N2026-020', quantityReceived: 500, quantityExpected: 600, uom: 'EA', integrityCheck: 'Fail', deliveryMatchStatus: 'Short Delivery', sapReceiptStatus: 'Blocked', labelStatus: 'Pending', sqaStatus: 'Inspection Required', holdStatus: 'Hold', putAwayStatus: 'Blocked', receivingUser: 'P. Costa', receivingTimestamp: '2026-05-09T14:00:00Z'},
  {receiptId: 'RCT-0454', deliveryNote: 'DN-98850', poNumber: '4500012500', supplier: 'Polymer Global', material: '700221', batch: 'R2026-006', quantityReceived: 5000, quantityExpected: 5000, uom: 'KG', integrityCheck: 'Pass', deliveryMatchStatus: 'Matched', sapReceiptStatus: 'Posted', labelStatus: 'Labeled', sqaStatus: 'Released', holdStatus: 'No Hold', putAwayStatus: 'Completed', receivingUser: 'T. Melo', receivingTimestamp: '2026-05-13T08:45:00Z'},
];

export const mockLocations: LocationRecord[] = [
  {material: '8004430', batch: 'B2026-001', quantity: 42, uom: 'ML', location: 'WH-A-01-02', fifoRank: 1, status: 'On Hold', expiryDate: '2027-05-10', lastMovement: '2026-05-10T09:32:00Z', lastScanUser: 'P. Costa'},
  {material: '301656', batch: 'F2026-010', quantity: 3200, uom: 'M2', location: 'WH-B-03-01', fifoRank: 1, status: 'Ready', expiryDate: null, lastMovement: '2026-05-08T11:15:00Z', lastScanUser: 'T. Melo'},
  {material: '700221', batch: 'R2026-005', quantity: 10000, uom: 'KG', location: 'WH-C-02-04', fifoRank: 1, status: 'Ready', expiryDate: null, lastMovement: '2026-05-11T10:00:00Z', lastScanUser: 'P. Costa'},
  {material: '700221', batch: 'R2026-006', quantity: 5000, uom: 'KG', location: 'WH-C-02-05', fifoRank: 2, status: 'Ready', expiryDate: null, lastMovement: '2026-05-13T08:45:00Z', lastScanUser: 'T. Melo'},
  {material: '600118', batch: 'N2026-020', quantity: 500, uom: 'EA', location: 'WH-D-01-01', fifoRank: 1, status: 'Blocked', expiryDate: '2028-01-01', lastMovement: '2026-05-09T14:00:00Z', lastScanUser: 'P. Costa'},
  {material: '900778', batch: 'L2026-005', quantity: 6000, uom: 'EA', location: 'WH-B-05-02', fifoRank: 1, status: 'On Hold', expiryDate: null, lastMovement: '2026-05-01T07:30:00Z', lastScanUser: 'T. Melo'},
];

export const mockStagingBoard: StagingRecord[] = [
  {workOrder: 'WO-8800001', productionLine: 'Line 1 - ABG', requiredMaterial: '8004430', requiredQuantity: 50, pickedQuantity: 0, stagedQuantity: 0, missingQuantity: 50, stagingStatus: 'Blocked', requiredBy: '2026-05-19T06:00:00Z', warehouseOwner: 'P. Costa'},
  {workOrder: 'WO-8800001', productionLine: 'Line 1 - ABG', requiredMaterial: '301656', requiredQuantity: 1200, pickedQuantity: 1200, stagedQuantity: 1200, missingQuantity: 0, stagingStatus: 'Staged', requiredBy: '2026-05-19T06:00:00Z', warehouseOwner: 'T. Melo'},
  {workOrder: 'WO-8800002', productionLine: 'Line 2 - Tubes', requiredMaterial: '700221', requiredQuantity: 2500, pickedQuantity: 2500, stagedQuantity: 2000, missingQuantity: 0, stagingStatus: 'Partial', requiredBy: '2026-05-20T06:00:00Z', warehouseOwner: 'P. Costa'},
  {workOrder: 'WO-8800003', productionLine: 'Line 3 - Eclipse', requiredMaterial: '600118', requiredQuantity: 450, pickedQuantity: 0, stagedQuantity: 0, missingQuantity: 450, stagingStatus: 'Blocked', requiredBy: '2026-05-21T06:00:00Z', warehouseOwner: 'T. Melo'},
];

export const mockSqaHolds: SqaHoldRecord[] = [
  {material: '8004430', batch: 'B2026-001', supplier: 'Supplier ABC', quantityOnHold: 24, holdReason: 'Certificate of Analysis deviation — pH out of specification', sqaReviewRequired: true, inspectionStatus: 'In Progress', expectedReleaseDate: '2026-05-22', impactedWorkOrders: ['WO-8800001', 'WO-8800005'], impactedPcns: ['NS364314', 'NS364316'], shortageRisk: 'Critical', owner: 'SQA Team', lastUpdate: '2026-05-13T14:30:00Z'},
  {material: '600118', batch: 'N2026-020', supplier: 'Precision Medical', quantityOnHold: 500, holdReason: 'Supplier deviation report pending; dimensional non-conformance', sqaReviewRequired: true, inspectionStatus: 'Pending', expectedReleaseDate: null, impactedWorkOrders: ['WO-8800003'], impactedPcns: ['NS368860'], shortageRisk: 'Blocked', owner: 'SQA Team', lastUpdate: '2026-05-12T09:00:00Z'},
  {material: '501144', batch: 'S2026-003', supplier: 'Seal Tech', quantityOnHold: 200, holdReason: 'Incoming inspection sample failure — further testing required', sqaReviewRequired: false, inspectionStatus: 'In Progress', expectedReleaseDate: '2026-05-20', impactedWorkOrders: [], impactedPcns: ['NS364327'], shortageRisk: 'Warning', owner: 'SQA Team', lastUpdate: '2026-05-14T08:00:00Z'},
];

export const mockSterilizationBacklog: SterilizationRecord[] = [
  {batch: 'STER-2026-001', pcn: 'NS364314', quantity: 2400, dateOfManufacture: '2026-04-20', dwellLimitDays: 30, daysRemaining: 6, sterilizer: 'Sterilizer A', status: 'Awaiting Load', risk: 'Critical'},
  {batch: 'STER-2026-002', pcn: 'NS364316', quantity: 1800, dateOfManufacture: '2026-04-28', dwellLimitDays: 30, daysRemaining: 14, sterilizer: 'Sterilizer B', status: 'Awaiting Load', risk: 'Warning'},
  {batch: 'STER-2026-003', pcn: 'NS364327', quantity: 3200, dateOfManufacture: '2026-05-05', dwellLimitDays: 30, daysRemaining: 21, sterilizer: 'Sterilizer A', status: 'Scheduled', risk: 'Ready'},
];

export const mockSterilizationLoads: SterilizationLoadRecord[] = [
  {loadId: 'LOAD-2026-015', sterilizer: 'Sterilizer A', batch: 'STER-2026-003', pcn: 'NS364327', quantity: 3200, densityCategory: 'Medium', cycleTime: 8, compatibilityStatus: 'Compatible', palletCount: 4, loadStatus: 'Ready to Load'},
  {loadId: 'LOAD-2026-016', sterilizer: 'Sterilizer B', batch: 'STER-2026-002', pcn: 'NS364316', quantity: 1800, densityCategory: 'Low', cycleTime: 6, compatibilityStatus: 'Compatible', palletCount: 3, loadStatus: 'Pending Readiness Check'},
];

export const mockPostSterile: PostSterileRecord[] = [
  {batch: 'STER-2026-010', quantitySterilized: 2200, sapConfirmationStatus: 'Confirmed', shippingStatus: 'Ready to Ship', lotsTransferStatus: 'Transferred', releaseStatus: 'Released', exception: ''},
  {batch: 'STER-2026-011', quantitySterilized: 1600, sapConfirmationStatus: 'Pending', shippingStatus: 'Awaiting SAP', lotsTransferStatus: 'Pending', releaseStatus: 'Pending', exception: 'SAP confirmation delayed'},
];

export const mockScenarios: ScenarioRecord[] = [
  {scenarioId: 'SCN-001', scenarioName: 'Heparin 7-day Pull-In', owner: 'Maria Santos', reason: 'Avoid shortage in Wk 31', baselineDate: '2026-05-14', affectedMaterials: ['8004430'], assumptionChanges: 'Delivery moved from 2026-08-11 to 2026-08-04', resultingShortageDate: null, differenceVsBaseline: 'Shortage avoided in Wk 31-33', recommendedAction: 'Approve air freight cost and confirm with supplier', status: 'Saved'},
  {scenarioId: 'SCN-002', scenarioName: 'NS364316 Move to Wk 34', owner: 'John Carvalho', reason: 'Protect foil stock', baselineDate: '2026-05-14', affectedMaterials: ['301656'], assumptionChanges: 'PCN NS364316 production moved from Wk 32 to Wk 34', resultingShortageDate: '2026-09-05', differenceVsBaseline: 'Shortage delayed by 2 weeks vs. baseline', recommendedAction: 'Coordinate with planning team; evaluate customer impact', status: 'Draft'},
];

export const mockMasterData: MasterDataRecord[] = [
  {category: 'Safety Stock', key: '8004430-SS', description: 'Safety Stock — Heparin Sodium API', currentValue: '80 ML', previousValue: '60 ML', effectiveFrom: '2026-01-01', effectiveTo: null, owner: 'Maria Santos', approvalStatus: 'Approved', lastChanged: '2026-01-15'},
  {category: 'Safety Stock', key: '301656-SS', description: 'Safety Stock — Foil ABG Laminate', currentValue: '5000 M2', previousValue: '4000 M2', effectiveFrom: '2026-03-01', effectiveTo: null, owner: 'John Carvalho', approvalStatus: 'Approved', lastChanged: '2026-03-05'},
  {category: 'Scrap Factor', key: '8004430-SF', description: 'Scrap Factor — Heparin Sodium API', currentValue: '3%', previousValue: '2%', effectiveFrom: '2026-02-01', effectiveTo: null, owner: 'Process Eng.', approvalStatus: 'Approved', lastChanged: '2026-02-12'},
  {category: 'Scrap Factor', key: '301656-SF', description: 'Scrap Factor — Foil ABG Laminate', currentValue: '5%', previousValue: '4%', effectiveFrom: '2026-02-01', effectiveTo: null, owner: 'Process Eng.', approvalStatus: 'Approved', lastChanged: '2026-02-12'},
  {category: 'Material-to-PCN Mapping', key: '8004430-NS364314', description: 'Heparin → ABG Standard PCN', currentValue: 'Active', previousValue: 'Active', effectiveFrom: '2020-01-01', effectiveTo: null, owner: 'Planning', approvalStatus: 'Approved', lastChanged: '2020-01-01'},
  {category: 'Supplier Data', key: '8004430-LT', description: 'Lead Time — Supplier ABC', currentValue: '12 weeks', previousValue: '10 weeks', effectiveFrom: '2026-04-01', effectiveTo: null, owner: 'Procurement', approvalStatus: 'Approved', lastChanged: '2026-04-01'},
  {category: 'Conversion Rules', key: '700221-CONV', description: 'Resin KG to EA conversion', currentValue: '1 EA = 0.0125 KG', previousValue: '1 EA = 0.0120 KG', effectiveFrom: '2026-01-01', effectiveTo: null, owner: 'Process Eng.', approvalStatus: 'Pending', lastChanged: '2025-12-20'},
];

export const mockAuditTrail: AuditTrailRecord[] = [
  {eventId: 'AUD-0001', timestamp: '2026-05-14T06:15:00Z', user: 'Maria Santos', role: 'Material Controller', objectType: 'Material', objectId: '8004430', previousValue: 'Status: Warning', newValue: 'Status: Critical', reasonCode: 'RC-004', comment: 'SQA hold confirmed — qty below 25% SS', sourceScreen: 'Material Overview'},
  {eventId: 'AUD-0002', timestamp: '2026-05-13T14:30:00Z', user: 'SQA Team', role: 'Quality', objectType: 'SQA Hold', objectId: 'N2026-020', previousValue: 'Status: Pending', newValue: 'Status: In Progress', reasonCode: 'RC-010', comment: 'Dimensional check initiated on Batch N2026-020', sourceScreen: 'Quality / SQA Holds'},
  {eventId: 'AUD-0003', timestamp: '2026-05-12T10:00:00Z', user: 'John Carvalho', role: 'Material Controller', objectType: 'Expedite Action', objectId: 'EXP-002', previousValue: 'Status: Pending', newValue: 'Status: Approved', reasonCode: 'RC-007', comment: 'Foil expedite approved — supplier confirmed partial pull-in', sourceScreen: 'Purchase & Expedite'},
  {eventId: 'AUD-0004', timestamp: '2026-05-10T09:45:00Z', user: 'P. Costa', role: 'Warehouse', objectType: 'Receipt', objectId: 'RCT-0451', previousValue: 'SAP Status: Pending', newValue: 'SAP Status: Posted', reasonCode: 'RC-001', comment: 'Receipt posted for Batch B2026-001', sourceScreen: 'Warehouse Receiving'},
  {eventId: 'AUD-0005', timestamp: '2026-05-08T08:00:00Z', user: 'Procurement', role: 'Procurement', objectType: 'Safety Stock', objectId: '301656-SS', previousValue: '4000 M2', newValue: '5000 M2', reasonCode: 'RC-015', comment: 'SS increased following foil lead time extension', sourceScreen: 'Master Data & Assumptions'},
  {eventId: 'AUD-0006', timestamp: '2026-05-07T15:20:00Z', user: 'Carlos Ferreira', role: 'Material Controller', objectType: 'Material', objectId: '600118', previousValue: 'Status: Ready', newValue: 'Status: Blocked', reasonCode: 'RC-004', comment: 'Entire stock on SQA hold — no available qty', sourceScreen: 'Material Overview'},
];
