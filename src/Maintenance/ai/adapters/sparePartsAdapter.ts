import {
  findInventoryPartByCode,
  getAvailableStock,
  getInventoryStockState,
  type StockState,
} from '../../components/InventoryPartDrawer';
import type { PlannerAiPartsReadiness, PlannerAiPartsStatus } from '../types';

type AssetPartRule = {
  test: RegExp;
  code: string;
};

const assetPartRules: AssetPartRule[] = [
  { test: /molding|press/i, code: 'SAP-SEAL-HYD-01' },
  { test: /assembly/i, code: 'SAP-ORING-VIT-02' },
  { test: /conveyor|packaging/i, code: 'SAP-BELT-CV-210' },
  { test: /pump|boiler/i, code: 'SAP-FILTER-HYD-03' },
  { test: /robot|servo/i, code: 'SAP-ENC-CBL-402' },
  { test: /labeler|gripper/i, code: 'SAP-GRIP-VAC-00' },
  { test: /extrusion|extruder/i, code: 'SAP-HYD-FLUID-01' },
];

function getAssetPartCode(asset: string) {
  return assetPartRules.find((rule) => rule.test.test(asset))?.code;
}

function buildTaggedReadiness(asset: string, tags: string[]): PlannerAiPartsReadiness | null {
  const normalizedTags = tags.map((tag) => tag.toLowerCase());

  if (normalizedTags.some((tag) => tag.includes('requested missing parts'))) {
    return {
      asset,
      status: 'blocked',
      summary: 'Missing parts are already blocking execution.',
      detail: 'Follow-Up data marks this work order as waiting on missing parts before it can be executed.',
      sourceLabel: 'Follow-Up status',
    };
  }

  if (normalizedTags.some((tag) => tag.includes('parts reserved') || tag.includes('parts ready'))) {
    return {
      asset,
      status: 'ready',
      summary: 'Parts kit is already reserved for execution.',
      detail: 'The current follow-up state indicates that the required kit is reserved and ready to stage.',
      sourceLabel: 'Follow-Up status',
    };
  }

  if (normalizedTags.some((tag) => tag.includes('no parts required'))) {
    return {
      asset,
      status: 'ready',
      summary: 'This work can proceed without spare-parts dependency.',
      detail: 'The follow-up state explicitly marks this item as requiring no additional parts.',
      sourceLabel: 'Follow-Up status',
    };
  }

  return null;
}

function buildInventoryReadiness(asset: string, code: string): PlannerAiPartsReadiness {
  const part = findInventoryPartByCode(code);
  if (!part) {
    return {
      asset,
      status: 'unknown',
      summary: 'No matching inventory kit was found.',
      detail: 'The planner could not map this asset to a known spare-parts kit in the local catalog.',
      sourceLabel: 'Inventory catalog',
    };
  }

  const availableStock = getAvailableStock(part);
  const stockState = getInventoryStockState(part) as StockState;
  const status: PlannerAiPartsStatus =
    stockState === 'in-stock' ? 'ready' : stockState === 'low-stock' ? 'risk' : 'blocked';

  const summary =
    status === 'ready'
      ? `${part.name} is available for this asset.`
      : status === 'risk'
        ? `${part.name} is available but below buffer.`
        : `${part.name} is not available to stage right now.`;

  const detail =
    status === 'ready'
      ? `${availableStock} units are available after reservations, which keeps this work executable this week.`
      : status === 'risk'
        ? `${availableStock} units are available after reservations, so scheduling this work tighter in the week reduces stock-out risk.`
        : 'Current stock is fully consumed by reservations or empty, so this work should stay deferred until replenishment lands.';

  return {
    asset,
    status,
    summary,
    detail,
    matchedPartCode: part.sapNumber,
    matchedPartName: part.name,
    availableStock,
    stockState,
    sourceLabel: 'Inventory catalog',
  };
}

export function getPartsReadinessForAsset(asset: string, tags: string[] = []): PlannerAiPartsReadiness {
  const taggedReadiness = buildTaggedReadiness(asset, tags);
  if (taggedReadiness) {
    const code = getAssetPartCode(asset);
    const part = code ? findInventoryPartByCode(code) : null;
    return part
      ? {
          ...taggedReadiness,
          matchedPartCode: part.sapNumber,
          matchedPartName: part.name,
          availableStock: getAvailableStock(part),
          stockState: getInventoryStockState(part),
        }
      : taggedReadiness;
  }

  const code = getAssetPartCode(asset);
  if (!code) {
    return {
      asset,
      status: 'unknown',
      summary: 'No mapped spare-parts kit for this asset.',
      detail: 'The local phase-1 adapter has no explicit parts rule for this asset yet.',
      sourceLabel: 'Inventory catalog',
    };
  }

  return buildInventoryReadiness(asset, code);
}
