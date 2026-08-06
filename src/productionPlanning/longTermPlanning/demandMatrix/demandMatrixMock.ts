export type DemandCell = {
  total: number;
  forecastPct: number;
  productionPlanPct: number;
};

export type SkuDemandRow = {
  skuCode: string;
  description: string;
  isAiFlagged: boolean;
  monthly: DemandCell[];
};

export type BomItemType = 'FG' | 'SFG' | 'KIT' | 'RM';

export type BomItem = {
  id: string;
  code: string;
  name: string;
  type: BomItemType;
  quantity: number;
  uom: string;
  onHand: number;
  safetyStock: number;
  daysOfSupply: number;
  children?: BomItem[];
};

export type DemandPeriod = '6M' | '12M' | '24M' | '36M';

export type SkuPeriodAverage = {
  skuCode: string;
  avg6M: number;
  avg12M: number;
  avg24M: number;
  avg36M: number;
};

export type AiSimilarDemandSample = {
  id: string;
  title: string;
  dateRange: string;
  similarityPct: number;
  description: string;
};

export type ExecutionKpi = {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone: 'default' | 'success' | 'warning' | 'danger' | 'blue';
};

export const DEMAND_MATRIX_MONTHS: string[] = [
  'Jun 26', 'Jul 26', 'Aug 26', 'Sep 26', 'Oct 26', 'Nov 26',
  'Dec 26', 'Jan 27', 'Feb 27', 'Mar 27', 'Apr 27', 'May 27', 'Jun 27',
];

function cell(total: number, forecastPct: number): DemandCell {
  return {total, forecastPct, productionPlanPct: 100 - forecastPct};
}

export const skuDemandMatrix: SkuDemandRow[] = [
  {
    skuCode: '330002-02',
    description: 'Syringe 1mL Luer Lock',
    isAiFlagged: true,
    monthly: [
      cell(7942, 65), cell(6053, 62), cell(6505, 68), cell(5785, 60),
      cell(8904, 71), cell(7049, 66), cell(7122, 64), cell(6028, 58),
      cell(5428, 55), cell(8262, 69), cell(8603, 72), cell(6808, 63), cell(5981, 57),
    ],
  },
  {
    skuCode: '334181-02',
    description: 'Catheter 16Fr Safety',
    isAiFlagged: false,
    monthly: [
      cell(6800, 58), cell(5934, 61), cell(5049, 55), cell(5092, 52),
      cell(8975, 70), cell(8662, 67), cell(8144, 65), cell(7283, 60),
      cell(8077, 63), cell(7494, 61), cell(6377, 56), cell(6502, 59), cell(6068, 54),
    ],
  },
  {
    skuCode: '332388-02',
    description: 'IV Set 20 drops/mL',
    isAiFlagged: true,
    monthly: [
      cell(8661, 72), cell(6865, 68), cell(6763, 65), cell(8686, 73),
      cell(6869, 60), cell(8909, 75), cell(6280, 58), cell(8177, 70),
      cell(8462, 69), cell(7971, 66), cell(7230, 62), cell(8307, 68), cell(7125, 61),
    ],
  },
  {
    skuCode: '338011-04',
    description: 'Infusion Pump Set',
    isAiFlagged: false,
    monthly: [
      cell(5500, 50), cell(6713, 57), cell(6170, 53), cell(6644, 56),
      cell(5974, 48), cell(6463, 55), cell(7841, 62), cell(8743, 67),
      cell(5071, 45), cell(6912, 58), cell(8287, 65), cell(7131, 60), cell(5504, 47),
    ],
  },
  {
    skuCode: '331200-01',
    description: 'Needle 21G × 1.5"',
    isAiFlagged: false,
    monthly: [
      cell(5785, 52), cell(7648, 63), cell(7057, 59), cell(8139, 66),
      cell(5508, 48), cell(6432, 55), cell(5889, 50), cell(6195, 53),
      cell(5672, 49), cell(8826, 70), cell(7903, 64), cell(7357, 61), cell(7070, 58),
    ],
  },
  {
    skuCode: '339204-02',
    description: 'Extension Set 10cm',
    isAiFlagged: false,
    monthly: [
      cell(6000, 56), cell(5866, 52), cell(6350, 55), cell(7982, 64),
      cell(6657, 58), cell(8830, 71), cell(7300, 61), cell(6807, 57),
      cell(7549, 63), cell(8749, 70), cell(6971, 59), cell(6840, 57), cell(5341, 46),
    ],
  },
  {
    skuCode: '330851-06',
    description: 'Stopcock 3-Way',
    isAiFlagged: false,
    monthly: [
      cell(5608, 51), cell(8208, 66), cell(5853, 50), cell(5197, 45),
      cell(6838, 58), cell(7953, 64), cell(8855, 71), cell(7142, 60),
      cell(5170, 44), cell(7584, 63), cell(6525, 55), cell(6994, 58), cell(6468, 53),
    ],
  },
  {
    skuCode: '337711-02',
    description: 'Pressure Bag 500mL',
    isAiFlagged: false,
    monthly: [
      cell(8536, 69), cell(8852, 72), cell(6806, 58), cell(6922, 59),
      cell(8547, 70), cell(5099, 44), cell(5147, 45), cell(6923, 57),
      cell(7192, 61), cell(6622, 56), cell(7178, 60), cell(7659, 63), cell(7334, 61),
    ],
  },
  {
    skuCode: '335500-04',
    description: 'Safety Lancet 26G',
    isAiFlagged: true,
    monthly: [
      cell(9140, 73), cell(7230, 61), cell(6890, 58), cell(10280, 76),
      cell(8760, 69), cell(7520, 62), cell(6340, 55), cell(8990, 71),
      cell(9450, 74), cell(8110, 66), cell(7680, 63), cell(9020, 72), cell(8350, 67),
    ],
  },
  {
    skuCode: '332901-01',
    description: 'Drainage Bag 2L',
    isAiFlagged: false,
    monthly: [
      cell(6120, 54), cell(5840, 51), cell(7260, 61), cell(6780, 57),
      cell(5930, 49), cell(7440, 62), cell(8100, 66), cell(6570, 55),
      cell(5680, 48), cell(7890, 64), cell(6930, 58), cell(5760, 49), cell(6420, 53),
    ],
  },
  {
    skuCode: '334802-03',
    description: 'Epidural Kit Standard',
    isAiFlagged: false,
    monthly: [
      cell(5310, 47), cell(6040, 53), cell(5720, 50), cell(6890, 58),
      cell(7450, 62), cell(6180, 53), cell(5890, 50), cell(7230, 61),
      cell(6540, 55), cell(5980, 51), cell(6710, 57), cell(5850, 50), cell(6120, 52),
    ],
  },
];

export const skuBomMap: Record<string, BomItem[]> = {
  '330002-02': [
    {
      id: 'bom-330-fg',
      code: '330002-02',
      name: 'Syringe 1mL Luer Lock',
      type: 'FG',
      quantity: 1,
      uom: 'EA',
      onHand: 28000,
      safetyStock: 12000,
      daysOfSupply: 22,
      children: [
        {
          id: 'bom-330-body',
          code: 'SA-9085',
          name: 'Primary Component Assembly',
          type: 'SFG',
          quantity: 1,
          uom: 'EA',
          onHand: 20000,
          safetyStock: 6000,
          daysOfSupply: 15,
          children: [
            {
              id: 'bom-330-sub',
              code: 'SA-9085A',
              name: 'Sub-Assembly',
              type: 'SFG',
              quantity: 1,
              uom: 'EA',
              onHand: 14000,
              safetyStock: 5000,
              daysOfSupply: 12,
              children: [
                {
                  id: 'bom-330-base',
                  code: 'RM-10085',
                  name: 'Base Material',
                  type: 'RM',
                  quantity: 3.5,
                  uom: 'g',
                  onHand: 3200,
                  safetyStock: 2000,
                  daysOfSupply: 4,
                },
                {
                  id: 'bom-330-sec',
                  code: 'RM-10185',
                  name: 'Secondary Material',
                  type: 'RM',
                  quantity: 1.2,
                  uom: 'g',
                  onHand: 1800,
                  safetyStock: 600,
                  daysOfSupply: 9,
                },
                {
                  id: 'bom-330-coat',
                  code: 'RM-10235',
                  name: 'Coating Agent',
                  type: 'RM',
                  quantity: 0.5,
                  uom: 'mL',
                  onHand: 500,
                  safetyStock: 300,
                  daysOfSupply: 5,
                },
              ],
            },
          ],
        },
        {
          id: 'bom-330-closure',
          code: 'SA-9185',
          name: 'Closure / Cap',
          type: 'SFG',
          quantity: 1,
          uom: 'EA',
          onHand: 30000,
          safetyStock: 8000,
          daysOfSupply: 20,
        },
        {
          id: 'bom-330-kit',
          code: 'SA-9235',
          name: 'Reagent Kit',
          type: 'KIT',
          quantity: 1,
          uom: 'EA',
          onHand: 18000,
          safetyStock: 5000,
          daysOfSupply: 16,
          children: [
            {
              id: 'bom-330-active',
              code: 'RM-10285',
              name: 'Active Compound',
              type: 'RM',
              quantity: 5,
              uom: 'mg',
              onHand: 280,
              safetyStock: 150,
              daysOfSupply: 3,
            },
            {
              id: 'bom-330-stab',
              code: 'RM-10335',
              name: 'Stabilizer',
              type: 'RM',
              quantity: 0.3,
              uom: 'mL',
              onHand: 1200,
              safetyStock: 400,
              daysOfSupply: 14,
            },
          ],
        },
        {
          id: 'bom-330-label',
          code: 'SA-9285',
          name: 'Label',
          type: 'RM',
          quantity: 1,
          uom: 'EA',
          onHand: 80000,
          safetyStock: 20000,
          daysOfSupply: 28,
        },
      ],
    },
  ],
  '334181-02': [
    {
      id: 'bom-334-fg',
      code: '334181-02',
      name: 'Catheter 16Fr Safety',
      type: 'FG',
      quantity: 1,
      uom: 'EA',
      onHand: 15000,
      safetyStock: 7000,
      daysOfSupply: 18,
      children: [
        {
          id: 'bom-334-tube',
          code: 'SA-7410',
          name: 'Catheter Tube Assembly',
          type: 'SFG',
          quantity: 1,
          uom: 'EA',
          onHand: 9000,
          safetyStock: 4000,
          daysOfSupply: 11,
          children: [
            {
              id: 'bom-334-pvc',
              code: 'RM-20410',
              name: 'Medical PVC Compound',
              type: 'RM',
              quantity: 4.2,
              uom: 'g',
              onHand: 2100,
              safetyStock: 1200,
              daysOfSupply: 5,
            },
            {
              id: 'bom-334-coat',
              code: 'RM-20510',
              name: 'Hydrophilic Coating',
              type: 'RM',
              quantity: 0.8,
              uom: 'mL',
              onHand: 440,
              safetyStock: 250,
              daysOfSupply: 4,
            },
          ],
        },
        {
          id: 'bom-334-tip',
          code: 'SA-7510',
          name: 'Safety Tip & Connector',
          type: 'KIT',
          quantity: 1,
          uom: 'EA',
          onHand: 12000,
          safetyStock: 5500,
          daysOfSupply: 14,
          children: [
            {
              id: 'bom-334-luer',
              code: 'RM-20610',
              name: 'Luer Lock Connector',
              type: 'RM',
              quantity: 1,
              uom: 'EA',
              onHand: 11500,
              safetyStock: 5000,
              daysOfSupply: 13,
            },
            {
              id: 'bom-334-seal',
              code: 'RM-20710',
              name: 'Silicone Seal Ring',
              type: 'RM',
              quantity: 2,
              uom: 'EA',
              onHand: 8800,
              safetyStock: 4000,
              daysOfSupply: 10,
            },
          ],
        },
        {
          id: 'bom-334-pkg',
          code: 'RM-20810',
          name: 'Sterile Packaging',
          type: 'RM',
          quantity: 1,
          uom: 'EA',
          onHand: 22000,
          safetyStock: 8000,
          daysOfSupply: 25,
        },
      ],
    },
  ],
  '332388-02': [
    {
      id: 'bom-332-fg',
      code: '332388-02',
      name: 'IV Set 20 drops/mL',
      type: 'FG',
      quantity: 1,
      uom: 'EA',
      onHand: 18500,
      safetyStock: 9000,
      daysOfSupply: 16,
      children: [
        {
          id: 'bom-332-drip',
          code: 'SA-8120',
          name: 'Drip Chamber Assembly',
          type: 'SFG',
          quantity: 1,
          uom: 'EA',
          onHand: 11000,
          safetyStock: 5500,
          daysOfSupply: 9,
          children: [
            {
              id: 'bom-332-filter',
              code: 'RM-30120',
              name: '15µm Particulate Filter',
              type: 'RM',
              quantity: 1,
              uom: 'EA',
              onHand: 620,
              safetyStock: 400,
              daysOfSupply: 3,
            },
            {
              id: 'bom-332-membrane',
              code: 'RM-30220',
              name: 'Air-Vent Membrane',
              type: 'RM',
              quantity: 1,
              uom: 'EA',
              onHand: 5500,
              safetyStock: 2500,
              daysOfSupply: 8,
            },
          ],
        },
        {
          id: 'bom-332-tube',
          code: 'SA-8220',
          name: 'Tubing & Clamp Set',
          type: 'SFG',
          quantity: 1,
          uom: 'EA',
          onHand: 16000,
          safetyStock: 7000,
          daysOfSupply: 14,
          children: [
            {
              id: 'bom-332-pvc',
              code: 'RM-30320',
              name: 'Medical Grade PVC Tubing',
              type: 'RM',
              quantity: 150,
              uom: 'cm',
              onHand: 7800,
              safetyStock: 3500,
              daysOfSupply: 7,
            },
            {
              id: 'bom-332-clamp',
              code: 'RM-30420',
              name: 'Roller Clamp',
              type: 'RM',
              quantity: 1,
              uom: 'EA',
              onHand: 14200,
              safetyStock: 6000,
              daysOfSupply: 12,
            },
          ],
        },
        {
          id: 'bom-332-spike',
          code: 'RM-30520',
          name: 'Vented Spike',
          type: 'RM',
          quantity: 1,
          uom: 'EA',
          onHand: 390,
          safetyStock: 300,
          daysOfSupply: 2,
        },
      ],
    },
  ],
};

function avgOf(rows: SkuDemandRow, months: number): number {
  const slice = rows.monthly.slice(0, Math.min(months, rows.monthly.length));
  const sum = slice.reduce((acc, c) => acc + c.total, 0);
  return Math.round(sum / slice.length);
}

export const demandAverageByPeriod: SkuPeriodAverage[] = skuDemandMatrix.map((row) => ({
  skuCode: row.skuCode,
  avg6M: avgOf(row, 6),
  avg12M: avgOf(row, 12),
  avg24M: avgOf(row, 13),
  avg36M: avgOf(row, 13),
}));

export const aiSimilarDemandSamples: AiSimilarDemandSample[] = [
  {
    id: 'sim-1',
    title: 'Q2 2024 Post-Launch Ramp',
    dateRange: 'Apr – Jun 2024',
    similarityPct: 91,
    description: 'Similar ramp-up pattern after new SKU introduction. Demand leveled off in week 8 across all flagged products.',
  },
  {
    id: 'sim-2',
    title: 'Q3 2023 Seasonal Peak',
    dateRange: 'Jul – Sep 2023',
    similarityPct: 84,
    description: 'Sustained high-demand period driven by influenza season procurement burst from government clients.',
  },
  {
    id: 'sim-3',
    title: 'Q1 2025 Recovery Period',
    dateRange: 'Jan – Mar 2025',
    similarityPct: 78,
    description: 'Demand recovery after supply disruption. Fill-rate constraints visible in mid-period with 3 SKUs at risk.',
  },
];

export const executionKpis: ExecutionKpi[] = [
  {
    id: 'fill-rate',
    label: 'Avg Fill Rate',
    value: '96.4%',
    helper: 'vs 95% target',
    tone: 'success',
  },
  {
    id: 'fc-accuracy',
    label: 'Forecast Accuracy',
    value: '88.1%',
    helper: 'MAPE last 6M',
    tone: 'blue',
  },
  {
    id: 'total-planned',
    label: 'Total Planned Units',
    value: '1.24M',
    helper: 'Jun 26 – Jun 27',
    tone: 'default',
  },
  {
    id: 'at-risk-skus',
    label: 'At-Risk SKUs',
    value: '3',
    helper: 'DoS ≤ 5d on 1+ component',
    tone: 'warning',
  },
];
