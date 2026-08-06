export type ScenarioDetailTabId = 'demandCapacity' | 'siteCommitment' | 'inventoryProjection' | 'constraintAnalysis';

export type ScenarioDetailRow = {
  label: string;
  value: string;
};

export type ScenarioConstraintGroup = {
  id: string;
  label: string;
  rows: ScenarioDetailRow[];
};

export type ForecastScenario = {
  id: string;
  name: string;
  description: string;
  status: string;
  recommended?: boolean;
  feasibility: string;
  confidence: string;
  mainConstraint?: string;
  keyRisk?: string;
  expectedImpact?: string;
  recommendationSummary: string;
  details: Record<Exclude<ScenarioDetailTabId, 'constraintAnalysis'>, ScenarioDetailRow[]> & {
    constraintAnalysis: ScenarioConstraintGroup[];
  };
};

export type ScenarioKpiRow = {
  kpi: string;
  baseline: string;
  capacityRecovery: string;
  demandSmoothing: string;
  constrainedCommitment: string;
  qualityDelay: string;
};

export const defaultForecastScenarioId = 'capacityRecovery';

export const scenarioDetailTabs: Array<{id: ScenarioDetailTabId; label: string}> = [
  {id: 'demandCapacity', label: 'Demand vs Capacity'},
  {id: 'siteCommitment', label: 'Site Commitment'},
  {id: 'inventoryProjection', label: 'Inventory Projection'},
  {id: 'constraintAnalysis', label: 'Constraint Analysis'},
];

export const forecastProposalScenarios: ForecastScenario[] = [
  {
    id: 'baseline',
    name: 'Baseline',
    description: 'Current forecast and current capacity',
    status: 'Not feasible',
    feasibility: 'Not feasible',
    confidence: 'Medium',
    mainConstraint: 'Capacity overload from Mar to Apr',
    keyRisk: 'Stockout exposure in Apr',
    expectedImpact: '-4.2% coverage',
    recommendationSummary: 'Current assumptions leave overloaded spring months unresolved and miss the service target.',
    details: {
      demandCapacity: [
        {label: 'Monthly demand', value: 'Jan-Dec average 1.22M units; Mar-Apr peak at 1.41M units'},
        {label: 'Available capacity', value: '1.18M units average; no added shifts planned'},
        {label: 'Capacity utilization %', value: '104% peak utilization in Mar-Apr'},
        {label: 'Capacity gap/surplus', value: '148k-unit gap across Mar-Apr'},
        {label: 'Bottleneck line/machine', value: 'Line 4 blister packer / BX-220 cartoner'},
        {label: 'Planned downtime/shutdown impact', value: '48 hrs annual maintenance in Apr removes 62k units'},
        {label: 'Extra capacity needed, if any', value: '2 weekend campaigns or 180 overtime hrs needed'},
      ],
      siteCommitment: [
        {label: 'Forecast demand', value: '14.6M units'},
        {label: 'Proposed site commitment', value: '13.3M units'},
        {label: 'Commitment coverage %', value: '91%'},
        {label: 'Committed volume', value: '13.3M units'},
        {label: 'At-risk / uncommitted volume', value: '1.3M units at risk'},
        {label: 'Months not fully committed', value: 'Mar, Apr, May'},
        {label: 'Main reason for commitment gap', value: 'Finite packaging capacity during peak respiratory season'},
        {label: 'Required decision', value: 'Approve extra capacity or decommit low-priority demand'},
      ],
      inventoryProjection: [
        {label: 'Opening inventory', value: '4.2 weeks / 1.06M units'},
        {label: 'Projected closing inventory by month', value: 'Falls to 2.7 weeks in Apr before recovering to 3.4 weeks in Jun'},
        {label: 'Inventory weeks coverage', value: '3.1 weeks average'},
        {label: 'Minimum stock threshold', value: '3.0 weeks'},
        {label: 'Maximum stock threshold', value: '7.0 weeks'},
        {label: 'Months below minimum', value: 'Apr, May, Jun'},
        {label: 'Months above maximum', value: 'None'},
        {label: 'Stockout/backorder risk', value: 'High risk for top 2 respiratory SKUs in Apr'},
      ],
      constraintAnalysis: [
        {
          id: 'material',
          label: 'Material',
          rows: [
            {label: 'Critical shortages', value: 'Foil laminate FL-228 and leaflet kit LK-17 remain constrained'},
            {label: 'Expected availability date', value: 'FL-228 on Apr 12; LK-17 on Apr 18'},
            {label: 'Impacted SKUs/months', value: 'SKU A145 and A221 in Mar-Apr'},
          ],
        },
        {
          id: 'quality',
          label: 'Quality',
          rows: [
            {label: 'Release risk', value: 'Medium; microbiology queue adds 4-5 days'},
            {label: 'Holds/deviations', value: '2 open deviations on lot family RSP-4'},
            {label: 'Expected release date', value: 'Earliest Apr 09'},
            {label: 'Release confidence', value: '72% confidence'},
          ],
        },
        {
          id: 'warehouse',
          label: 'Warehouse/Logistics',
          rows: [
            {label: 'Capacity or staging blockers', value: 'FG staging lane 3 reaches 96% utilization during week 15'},
          ],
        },
        {
          id: 'sterilization',
          label: 'Sterilization',
          rows: [
            {label: 'Slot availability', value: '2 open slots remain in Apr'},
            {label: 'Backlog', value: '1.3-day backlog after week 14'},
            {label: 'Dwell-time risk when applicable', value: 'Low today, rises if any lot slips more than 48 hrs'},
          ],
        },
      ],
    },
  },
  {
    id: 'capacityRecovery',
    name: 'Capacity Recovery',
    description: 'Add overtime / extra shifts in constrained months',
    status: 'Recommended',
    recommended: true,
    feasibility: 'Feasible with risks',
    confidence: 'High',
    mainConstraint: 'Capacity overload in Mar and Apr',
    keyRisk: 'Material availability in Apr',
    expectedImpact: '+7.6% coverage',
    recommendationSummary: 'This is the preferred scenario because it closes the spring capacity gap while preserving commitment and staying inside inventory guardrails.',
    details: {
      demandCapacity: [
        {label: 'Monthly demand', value: 'Jan-Dec average 1.22M units; Mar-Apr peak at 1.41M units'},
        {label: 'Available capacity', value: '1.29M units average with overtime and 2 extra weekend shifts'},
        {label: 'Capacity utilization %', value: '97% peak utilization after recovery plan'},
        {label: 'Capacity gap/surplus', value: '22k-unit surplus by end of Apr'},
        {label: 'Bottleneck line/machine', value: 'Line 4 blister packer remains the pacing asset'},
        {label: 'Planned downtime/shutdown impact', value: 'Maintenance moved to late Apr; net impact reduced to 24 hrs'},
        {label: 'Extra capacity needed, if any', value: '180 overtime hrs and 2 contract crews approved'},
      ],
      siteCommitment: [
        {label: 'Forecast demand', value: '14.6M units'},
        {label: 'Proposed site commitment', value: '14.3M units'},
        {label: 'Commitment coverage %', value: '98%'},
        {label: 'Committed volume', value: '14.3M units'},
        {label: 'At-risk / uncommitted volume', value: '300k units at risk'},
        {label: 'Months not fully committed', value: 'Apr only'},
        {label: 'Main reason for commitment gap', value: 'One material lane stays supply-constrained in early Apr'},
        {label: 'Required decision', value: 'Approve overtime budget and supplier expedite'},
      ],
      inventoryProjection: [
        {label: 'Opening inventory', value: '4.2 weeks / 1.06M units'},
        {label: 'Projected closing inventory by month', value: 'Ends Mar at 5.1 weeks and Apr at 5.8 weeks'},
        {label: 'Inventory weeks coverage', value: '5.8 weeks average'},
        {label: 'Minimum stock threshold', value: '3.0 weeks'},
        {label: 'Maximum stock threshold', value: '7.0 weeks'},
        {label: 'Months below minimum', value: 'None'},
        {label: 'Months above maximum', value: 'None'},
        {label: 'Stockout/backorder risk', value: 'Low risk; isolated watchlist on SKU A221'},
      ],
      constraintAnalysis: [
        {
          id: 'material',
          label: 'Material',
          rows: [
            {label: 'Critical shortages', value: 'Foil laminate FL-228 remains the only critical watch item'},
            {label: 'Expected availability date', value: 'Apr 10 with approved expedite'},
            {label: 'Impacted SKUs/months', value: 'SKU A221 in early Apr only'},
          ],
        },
        {
          id: 'quality',
          label: 'Quality',
          rows: [
            {label: 'Release risk', value: 'Medium; extra lots compress QA release calendar'},
            {label: 'Holds/deviations', value: '1 deviation remains open on family RSP-4'},
            {label: 'Expected release date', value: 'Apr 07 for first recovered lots'},
            {label: 'Release confidence', value: '84% confidence'},
          ],
        },
        {
          id: 'warehouse',
          label: 'Warehouse/Logistics',
          rows: [
            {label: 'Capacity or staging blockers', value: 'Weekend inbound staffing needed for two recovered campaigns'},
          ],
        },
        {
          id: 'sterilization',
          label: 'Sterilization',
          rows: [
            {label: 'Slot availability', value: '4 reserved slots in Mar-Apr'},
            {label: 'Backlog', value: 'No structural backlog expected'},
            {label: 'Dwell-time risk when applicable', value: 'Minimal if weekend dispatch windows are maintained'},
          ],
        },
      ],
    },
  },
  {
    id: 'demandSmoothing',
    name: 'Demand Smoothing',
    description: 'Pull production earlier to protect inventory',
    status: 'Feasible with risks',
    feasibility: 'Feasible with risks',
    confidence: 'Medium',
    mainConstraint: 'Inventory build-up before peak months',
    keyRisk: 'Early material pull-in needed',
    expectedImpact: '+5.1% coverage',
    recommendationSummary: 'This scenario reduces the peak load by prebuilding inventory, but it trades in more storage pressure and earlier material exposure.',
    details: {
      demandCapacity: [
        {label: 'Monthly demand', value: 'Jan-Dec average 1.22M units; Mar-Apr peak partially prebuilt in Jan-Feb'},
        {label: 'Available capacity', value: '1.18M units base capacity; load shifted into earlier months'},
        {label: 'Capacity utilization %', value: '94% peak utilization; Jan-Feb rise to 92%'},
        {label: 'Capacity gap/surplus', value: '46k-unit surplus before peak; 18k-unit residual gap in Apr'},
        {label: 'Bottleneck line/machine', value: 'Warehouse palletizer becomes pacing point in Feb'},
        {label: 'Planned downtime/shutdown impact', value: 'No shutdown changes; prebuild absorbs Apr maintenance loss'},
        {label: 'Extra capacity needed, if any', value: 'No extra line hours; 2 temporary warehouse shifts needed'},
      ],
      siteCommitment: [
        {label: 'Forecast demand', value: '14.6M units'},
        {label: 'Proposed site commitment', value: '14.0M units'},
        {label: 'Commitment coverage %', value: '96%'},
        {label: 'Committed volume', value: '14.0M units'},
        {label: 'At-risk / uncommitted volume', value: '600k units at risk'},
        {label: 'Months not fully committed', value: 'Apr, May'},
        {label: 'Main reason for commitment gap', value: 'Storage and material timing limit the full prebuild'},
        {label: 'Required decision', value: 'Approve early build and temporary warehouse overflow'},
      ],
      inventoryProjection: [
        {label: 'Opening inventory', value: '4.2 weeks / 1.06M units'},
        {label: 'Projected closing inventory by month', value: 'Peaks at 7.4 weeks in Feb, then normalizes to 4.8 weeks by May'},
        {label: 'Inventory weeks coverage', value: '7.2 weeks peak / 4.9 weeks average'},
        {label: 'Minimum stock threshold', value: '3.0 weeks'},
        {label: 'Maximum stock threshold', value: '7.0 weeks'},
        {label: 'Months below minimum', value: 'None'},
        {label: 'Months above maximum', value: 'Feb'},
        {label: 'Stockout/backorder risk', value: 'Low stockout risk, moderate obsolescence risk if forecast softens'},
      ],
      constraintAnalysis: [
        {
          id: 'material',
          label: 'Material',
          rows: [
            {label: 'Critical shortages', value: 'Cartons CT-91 and insert paper IP-06 need early release'},
            {label: 'Expected availability date', value: 'Jan 22 for prebuild lot coverage'},
            {label: 'Impacted SKUs/months', value: 'SKU A145, A221 in Jan-Feb'},
          ],
        },
        {
          id: 'quality',
          label: 'Quality',
          rows: [
            {label: 'Release risk', value: 'High for early lots because QA calendar pulls forward'},
            {label: 'Holds/deviations', value: 'No active holds; schedule compression risk only'},
            {label: 'Expected release date', value: 'Jan 28 for first prebuilt lots'},
            {label: 'Release confidence', value: '68% confidence'},
          ],
        },
        {
          id: 'warehouse',
          label: 'Warehouse/Logistics',
          rows: [
            {label: 'Capacity or staging blockers', value: 'Overflow pallet staging required for four weeks in Feb'},
          ],
        },
        {
          id: 'sterilization',
          label: 'Sterilization',
          rows: [
            {label: 'Slot availability', value: 'Adequate in Jan-Feb with advance booking'},
            {label: 'Backlog', value: '0.5-day backlog risk during week 7'},
            {label: 'Dwell-time risk when applicable', value: 'Moderate if overflow staging is not climate-controlled'},
          ],
        },
      ],
    },
  },
  {
    id: 'constrainedCommitment',
    name: 'Constrained Commitment',
    description: 'Commit only feasible demand',
    status: 'Low operational risk',
    feasibility: 'Feasible',
    confidence: 'Medium',
    mainConstraint: 'Reduced service commitment',
    keyRisk: 'Customer escalation on deferred demand',
    expectedImpact: '+3.0% coverage',
    recommendationSummary: 'This is the most operationally stable path, but it leaves more commercial demand uncommitted and needs business alignment.',
    details: {
      demandCapacity: [
        {label: 'Monthly demand', value: '14.6M-unit unconstrained forecast trimmed to feasible site demand'},
        {label: 'Available capacity', value: '1.18M units average with current staffing'},
        {label: 'Capacity utilization %', value: '89% peak utilization'},
        {label: 'Capacity gap/surplus', value: '110k-unit surplus after decommitment'},
        {label: 'Bottleneck line/machine', value: 'No structural bottleneck after volume decommitment'},
        {label: 'Planned downtime/shutdown impact', value: 'Apr maintenance absorbed with no recovery action needed'},
        {label: 'Extra capacity needed, if any', value: 'None'},
      ],
      siteCommitment: [
        {label: 'Forecast demand', value: '14.6M units'},
        {label: 'Proposed site commitment', value: '13.7M units'},
        {label: 'Commitment coverage %', value: '94%'},
        {label: 'Committed volume', value: '13.7M units'},
        {label: 'At-risk / uncommitted volume', value: '900k units deferred'},
        {label: 'Months not fully committed', value: 'Mar, Apr'},
        {label: 'Main reason for commitment gap', value: 'Deliberate volume decommitment to remain inside finite capacity'},
        {label: 'Required decision', value: 'Commercial approval for demand decommitment by customer priority'},
      ],
      inventoryProjection: [
        {label: 'Opening inventory', value: '4.2 weeks / 1.06M units'},
        {label: 'Projected closing inventory by month', value: 'Remains between 3.8 and 4.9 weeks all year'},
        {label: 'Inventory weeks coverage', value: '4.4 weeks average'},
        {label: 'Minimum stock threshold', value: '3.0 weeks'},
        {label: 'Maximum stock threshold', value: '7.0 weeks'},
        {label: 'Months below minimum', value: 'May'},
        {label: 'Months above maximum', value: 'None'},
        {label: 'Stockout/backorder risk', value: 'Low internal stockout risk; customer backlog risk remains'},
      ],
      constraintAnalysis: [
        {
          id: 'material',
          label: 'Material',
          rows: [
            {label: 'Critical shortages', value: 'No critical shortages after commitment cutback'},
            {label: 'Expected availability date', value: 'All constrained items land before Apr 15'},
            {label: 'Impacted SKUs/months', value: 'Deferred demand concentrated on SKU A221 in Mar-Apr'},
          ],
        },
        {
          id: 'quality',
          label: 'Quality',
          rows: [
            {label: 'Release risk', value: 'Medium and manageable'},
            {label: 'Holds/deviations', value: '1 open deviation, no projected release block'},
            {label: 'Expected release date', value: 'Within standard lead time'},
            {label: 'Release confidence', value: '81% confidence'},
          ],
        },
        {
          id: 'warehouse',
          label: 'Warehouse/Logistics',
          rows: [
            {label: 'Capacity or staging blockers', value: 'No major blockers; outbound smoothing required for deferred orders'},
          ],
        },
        {
          id: 'sterilization',
          label: 'Sterilization',
          rows: [
            {label: 'Slot availability', value: 'Comfortable capacity across the horizon'},
            {label: 'Backlog', value: 'No backlog expected'},
            {label: 'Dwell-time risk when applicable', value: 'Low'},
          ],
        },
      ],
    },
  },
  {
    id: 'qualityDelay',
    name: 'Quality Delay',
    description: 'Stress test with delayed release assumptions',
    status: 'High risk',
    feasibility: 'High risk',
    confidence: 'Low',
    mainConstraint: 'Quality release slippage',
    keyRisk: 'Finished goods shortage in Apr and May',
    expectedImpact: '-8.9% coverage',
    recommendationSummary: 'This stress-test scenario exposes the downside if release timing slips and should be used for mitigation planning, not adoption.',
    details: {
      demandCapacity: [
        {label: 'Monthly demand', value: 'Jan-Dec average 1.22M units; unchanged forecast profile'},
        {label: 'Available capacity', value: 'Nominal line capacity available, but releasable output constrained'},
        {label: 'Capacity utilization %', value: '99% visible utilization with latent QA bottleneck'},
        {label: 'Capacity gap/surplus', value: '116k units trapped in unreleased inventory in Apr-May'},
        {label: 'Bottleneck line/machine', value: 'QA release queue, not manufacturing equipment, becomes the bottleneck'},
        {label: 'Planned downtime/shutdown impact', value: 'Apr maintenance compounds backlog because recovery lots release late'},
        {label: 'Extra capacity needed, if any', value: 'Additional QA weekend release coverage required'},
      ],
      siteCommitment: [
        {label: 'Forecast demand', value: '14.6M units'},
        {label: 'Proposed site commitment', value: '12.6M units'},
        {label: 'Commitment coverage %', value: '86%'},
        {label: 'Committed volume', value: '12.6M units'},
        {label: 'At-risk / uncommitted volume', value: '2.0M units at risk'},
        {label: 'Months not fully committed', value: 'Apr, May, Jun'},
        {label: 'Main reason for commitment gap', value: 'Finished goods release slips by one QA cycle'},
        {label: 'Required decision', value: 'Escalate QA recovery plan or reallocate demand to alternate sites'},
      ],
      inventoryProjection: [
        {label: 'Opening inventory', value: '4.2 weeks / 1.06M units'},
        {label: 'Projected closing inventory by month', value: 'Apparent inventory stays at 4.9 weeks, but releasable stock falls to 2.2 weeks in May'},
        {label: 'Inventory weeks coverage', value: '2.7 releasable weeks average'},
        {label: 'Minimum stock threshold', value: '3.0 weeks'},
        {label: 'Maximum stock threshold', value: '7.0 weeks'},
        {label: 'Months below minimum', value: 'Apr, May, Jun, Jul'},
        {label: 'Months above maximum', value: 'None'},
        {label: 'Stockout/backorder risk', value: 'High backlog risk across top respiratory portfolio'},
      ],
      constraintAnalysis: [
        {
          id: 'material',
          label: 'Material',
          rows: [
            {label: 'Critical shortages', value: 'No new shortages; existing material sits in unreleased WIP'},
            {label: 'Expected availability date', value: 'Material available on time'},
            {label: 'Impacted SKUs/months', value: 'SKU A145, A221, B030 in Apr-Jun'},
          ],
        },
        {
          id: 'quality',
          label: 'Quality',
          rows: [
            {label: 'Release risk', value: 'High; one full cycle delay assumed'},
            {label: 'Holds/deviations', value: '3 open holds and 1 microbial deviation under investigation'},
            {label: 'Expected release date', value: 'Apr 21 at earliest for delayed lots'},
            {label: 'Release confidence', value: '41% confidence'},
          ],
        },
        {
          id: 'warehouse',
          label: 'Warehouse/Logistics',
          rows: [
            {label: 'Capacity or staging blockers', value: 'Quarantine storage reaches 92% occupancy in May'},
          ],
        },
        {
          id: 'sterilization',
          label: 'Sterilization',
          rows: [
            {label: 'Slot availability', value: 'Nominally available but consumed by rework priority'},
            {label: 'Backlog', value: '2.4-day backlog projected by week 18'},
            {label: 'Dwell-time risk when applicable', value: 'High dwell-time exposure for delayed quarantine lots'},
          ],
        },
      ],
    },
  },
];

export const scenarioComparisonRows: ScenarioKpiRow[] = [
  {kpi: 'Demand coverage %', baseline: '91%', capacityRecovery: '98%', demandSmoothing: '96%', constrainedCommitment: '94%', qualityDelay: '86%'},
  {kpi: 'Capacity utilization %', baseline: '104%', capacityRecovery: '97%', demandSmoothing: '94%', constrainedCommitment: '89%', qualityDelay: '99%'},
  {kpi: 'Site commitment achieved', baseline: 'No', capacityRecovery: 'Yes', demandSmoothing: 'Partial', constrainedCommitment: 'Yes', qualityDelay: 'No'},
  {kpi: 'Inventory weeks coverage', baseline: '3.1', capacityRecovery: '5.8', demandSmoothing: '7.2', constrainedCommitment: '4.4', qualityDelay: '2.7'},
  {kpi: 'Months below min stock', baseline: '3', capacityRecovery: '0', demandSmoothing: '0', constrainedCommitment: '1', qualityDelay: '4'},
  {kpi: 'Material shortage risk', baseline: 'High', capacityRecovery: 'Medium', demandSmoothing: 'Medium', constrainedCommitment: 'Low', qualityDelay: 'High'},
  {kpi: 'Quality release risk', baseline: 'Medium', capacityRecovery: 'Medium', demandSmoothing: 'High', constrainedCommitment: 'Medium', qualityDelay: 'High'},
  {kpi: 'Sterilization / logistics risk', baseline: 'Low', capacityRecovery: 'Medium', demandSmoothing: 'Medium', constrainedCommitment: 'Low', qualityDelay: 'High'},
  {kpi: 'Extra capacity required', baseline: 'None', capacityRecovery: 'High', demandSmoothing: 'Low', constrainedCommitment: 'None', qualityDelay: 'Medium'},
  {kpi: 'AI confidence', baseline: 'Medium', capacityRecovery: 'High', demandSmoothing: 'Medium', constrainedCommitment: 'Medium', qualityDelay: 'Low'},
];
