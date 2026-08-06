import type { MaintenanceCard, MaintenancePriority } from '../../types';
import type { AgentReasoningItem } from './types';

export type BulkAnalysisAction = 'group' | 'group-line' | 'link' | 'absorb-pm' | 'create';

export type BulkRequestItem = {
  cardId: string;
  requestId: string;
  title: string;
  detail: string;
  priority: MaintenancePriority;
  criticality?: 'A' | 'B' | 'C';
  lineId?: string;
  hierarchy?: string[];
};

export type BulkExistingWork = {
  cardId: string;
  title: string;
  status: string;
  lane: 'planning' | 'scheduled';
  type?: 'Preventive' | 'Corrective' | 'Work Order';
  scheduledFor?: string;
};

export type BulkPmCandidate = {
  id: string;
  title: string;
  description: string;
  scheduledFor: string;
  assignee: string;
  status: string;
  type: 'Preventive';
};

export type BulkRecommendation = {
  id: string;
  action: BulkAnalysisAction;
  headline: string;
  requests: BulkRequestItem[];
  linkedTarget?: BulkExistingWork | BulkPmCandidate;
  reasons: AgentReasoningItem[];
  benefit: string;
  confidence: number;
  impactScore: number;
  sharedParts?: string[];
};

export type BulkAnalysisResult = {
  totalRequests: number;
  optimizationCount: number;
  fewerInterventions: number;
  downtimeHoursSaved: number;
  technicianTripsSaved: number;
  estimatedCostSaved: number;
  workOrdersBefore: number;
  workOrdersAfter: number;
  sharedPartsOrders: number;
  recommendations: BulkRecommendation[];
  summary: string;
};

export type BulkAnalysisInput = {
  requests: BulkRequestItem[];
  existingWork: BulkExistingWork[];
  pmCandidates: BulkPmCandidate[];
};

const equipmentKeywords = [
  'molding',
  'extrusion',
  'mixer',
  'conveyor',
  'pump',
  'packaging',
  'welding',
  'cooling',
  'vision',
  'press',
  'robot',
  'oven',
  'injection',
];

const keywordToSparePart: Record<string, string> = {
  pump: 'Hydraulic Cylinder Seal Kit',
  mixer: 'Hydraulic Cylinder Seal Kit',
  extrusion: 'Hydraulic Cylinder Seal Kit',
  molding: '10-Ring Set (Viton)',
  conveyor: 'Robot Gripper Vacuum Cup Set',
  packaging: 'Hydraulic Return Filter',
  press: 'Hydraulic Cylinder Seal Kit',
  welding: 'Hydraulic Return Filter',
};

const lineLabels: Record<string, string> = {
  'line-10': 'Line 10',
  'line-20': 'Line 20',
};

const priorityLabelById: Record<MaintenancePriority, string> = {
  Emergency: 'Emergency',
  Immediate: 'Immediate',
  High: 'High',
  Medium: 'Medium',
  Low: 'Low',
  'Very Low': 'Very Low',
};

function getKeywords(title: string): string[] {
  const normalized = title.toLowerCase();
  return equipmentKeywords.filter((keyword) => normalized.includes(keyword));
}

function getPrimaryKeyword(title: string): string | undefined {
  return getKeywords(title)[0];
}

function isUrgent(priority: MaintenancePriority) {
  return priority === 'Emergency' || priority === 'Immediate';
}

function clampConfidence(value: number) {
  return Math.max(50, Math.min(96, Math.round(value)));
}

function getLineLabel(lineId?: string) {
  if (!lineId) return 'the same production line';
  return lineLabels[lineId] ?? lineId.replace('line-', 'Line ');
}

function matchesPmCandidate(request: BulkRequestItem, pm: BulkPmCandidate): boolean {
  const pmText = `${pm.title} ${pm.description}`.toLowerCase();
  const requestKeywords = getKeywords(request.title);
  const assetCodes = request.hierarchy?.slice(3) ?? [];

  if (requestKeywords.some((keyword) => pmText.includes(keyword))) return true;
  if (assetCodes.some((code) => pmText.includes(code.toLowerCase()))) return true;
  if (request.lineId && pmText.includes(request.lineId.replace('line-', 'line '))) return true;
  if (request.lineId === 'line-10' && (pmText.includes('line a') || pmText.includes('syringe'))) return true;

  return false;
}

function matchesExistingWork(request: BulkRequestItem, work: BulkExistingWork): boolean {
  const workKeywords = getKeywords(work.title);
  const requestKeywords = getKeywords(request.title);
  if (workKeywords.length && requestKeywords.some((keyword) => workKeywords.includes(keyword))) return true;

  const requestAssets = request.hierarchy?.slice(3) ?? [];
  const workAssets = work.title.split(/\s+/).filter((part) => part.length > 2);
  return requestAssets.some((asset) => work.title.toLowerCase().includes(asset.toLowerCase()));
}

function getSharedPartsForRequests(requests: BulkRequestItem[]): string[] {
  const partCounts = new Map<string, number>();

  requests.forEach((request) => {
    const keyword = getPrimaryKeyword(request.title);
    if (!keyword) return;
    const part = keywordToSparePart[keyword];
    if (!part) return;
    partCounts.set(part, (partCounts.get(part) ?? 0) + 1);
  });

  return [...partCounts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([part]) => part);
}

function buildSharedPartsReason(sharedParts: string[]): AgentReasoningItem | undefined {
  if (!sharedParts.length) return undefined;
  return {
    label: `Batch ${sharedParts.length} shared spare part order${sharedParts.length > 1 ? 's' : ''}: ${sharedParts.join(', ')}.`,
    tone: 'positive',
  };
}

function computeImpactMetrics(recommendations: BulkRecommendation[], totalRequests: number) {
  const optimizationActions = new Set<BulkAnalysisAction>(['group', 'group-line', 'link', 'absorb-pm']);
  const optimizationRecs = recommendations.filter((rec) => optimizationActions.has(rec.action));

  const fewerInterventions = optimizationRecs.reduce((total, rec) => {
    if (rec.action === 'group' || rec.action === 'group-line') {
      return total + rec.requests.length - 1;
    }
    if (rec.action === 'link' || rec.action === 'absorb-pm') {
      return total + rec.requests.length;
    }
    return total;
  }, 0);

  const sharedPartsOrders = recommendations.reduce((total, rec) => total + (rec.sharedParts?.length ?? 0), 0);

  return {
    optimizationCount: optimizationRecs.length,
    fewerInterventions,
    downtimeHoursSaved: Number((fewerInterventions * 2.5).toFixed(1)),
    technicianTripsSaved: fewerInterventions,
    estimatedCostSaved: fewerInterventions * 850 + sharedPartsOrders * 120,
    workOrdersBefore: totalRequests,
    workOrdersAfter: recommendations.length,
    sharedPartsOrders,
  };
}

function sortRecommendations(recommendations: BulkRecommendation[]) {
  const actionRank: Record<BulkAnalysisAction, number> = {
    'absorb-pm': 0,
    link: 1,
    'group-line': 2,
    group: 3,
    create: 4,
  };

  return [...recommendations].sort((left, right) => {
    if (right.impactScore !== left.impactScore) return right.impactScore - left.impactScore;
    if (actionRank[left.action] !== actionRank[right.action]) return actionRank[left.action] - actionRank[right.action];
    return left.headline.localeCompare(right.headline);
  });
}

export function analyzeBulkRequests({ requests, existingWork, pmCandidates }: BulkAnalysisInput): BulkAnalysisResult {
  const recommendations: BulkRecommendation[] = [];
  const consumed = new Set<string>();
  const remaining = () => requests.filter((request) => !consumed.has(request.cardId));

  pmCandidates.forEach((pm) => {
    const matches = remaining().filter((request) => !isUrgent(request.priority) && matchesPmCandidate(request, pm));
    if (!matches.length) return;

    matches.forEach((request) => consumed.add(request.cardId));
    const sharedParts = getSharedPartsForRequests(matches);
    const sharedPartsReason = buildSharedPartsReason(sharedParts);

    recommendations.push({
      id: `bulk-absorb-${pm.id}`,
      action: 'absorb-pm',
      headline: `Absorb ${matches.length} request${matches.length > 1 ? 's' : ''} into ${pm.title}`,
      requests: matches,
      linkedTarget: pm,
      reasons: [
        { label: `There is a PM already scheduled on ${pm.scheduledFor} for this equipment.`, tone: 'positive' },
        { label: 'This request can likely be combined with the existing PM to avoid additional downtime.', tone: 'positive' },
        ...(sharedPartsReason ? [sharedPartsReason] : []),
      ],
      benefit: `Avoids ${matches.length} separate intervention${matches.length > 1 ? 's' : ''}`,
      confidence: clampConfidence(92 + Math.min(matches.length, 3)),
      impactScore: matches.length * 12 + 20,
      sharedParts: sharedParts.length ? sharedParts : undefined,
    });
  });

  const byKeyword = new Map<string, BulkRequestItem[]>();
  remaining().forEach((request) => {
    if (isUrgent(request.priority)) return;
    const keyword = getPrimaryKeyword(request.title);
    if (!keyword) return;
    const bucket = byKeyword.get(keyword) ?? [];
    bucket.push(request);
    byKeyword.set(keyword, bucket);
  });

  byKeyword.forEach((groupRequests, keyword) => {
    const available = groupRequests.filter((request) => !consumed.has(request.cardId));
    if (!available.length) return;

    const existingMatch = existingWork.find((work) => available.some((request) => matchesExistingWork(request, work)));
    if (existingMatch) {
      available.forEach((request) => consumed.add(request.cardId));
      const sharedParts = getSharedPartsForRequests(available);
      const sharedPartsReason = buildSharedPartsReason(sharedParts);

      recommendations.push({
        id: `bulk-link-${keyword}-${existingMatch.cardId}`,
        action: 'link',
        headline: `Link ${available.length} request${available.length > 1 ? 's' : ''} to ${existingMatch.title}`,
        requests: available,
        linkedTarget: existingMatch,
        reasons: [
          { label: `${existingMatch.title} is already in ${existingMatch.status.toLowerCase()} for the same equipment family.`, tone: 'positive' },
          { label: 'Linking avoids duplicate Work Orders and reuses the same technician visit.', tone: 'positive' },
          ...(sharedPartsReason ? [sharedPartsReason] : []),
        ],
        benefit: `Avoids ${available.length} duplicate Work Order${available.length > 1 ? 's' : ''}`,
        confidence: clampConfidence(88 + Math.min(available.length, 2)),
        impactScore: available.length * 10 + 15,
        sharedParts: sharedParts.length ? sharedParts : undefined,
      });
    }
  });

  const byLine = new Map<string, BulkRequestItem[]>();
  remaining().forEach((request) => {
    if (isUrgent(request.priority) || !request.lineId) return;
    const bucket = byLine.get(request.lineId) ?? [];
    bucket.push(request);
    byLine.set(request.lineId, bucket);
  });

  byLine.forEach((lineRequests, lineId) => {
    if (lineRequests.length < 2) return;

    lineRequests.forEach((request) => consumed.add(request.cardId));
    const sharedParts = getSharedPartsForRequests(lineRequests);
    const sharedPartsReason = buildSharedPartsReason(sharedParts);

    recommendations.push({
      id: `bulk-line-${lineId}`,
      action: 'group-line',
      headline: `Batch ${lineRequests.length} requests on ${getLineLabel(lineId)} into one shutdown window`,
      requests: lineRequests,
      reasons: [
        { label: `${lineRequests.length} requests share ${getLineLabel(lineId)} and can use one production shutdown window.`, tone: 'positive' },
        { label: 'Production has a planned changeover window that can absorb these interventions together.', tone: 'info' },
        ...(sharedPartsReason ? [sharedPartsReason] : []),
      ],
      benefit: `Saves ${lineRequests.length - 1} shutdown window${lineRequests.length - 1 > 1 ? 's' : ''}`,
      confidence: clampConfidence(80 + Math.min(lineRequests.length, 3)),
      impactScore: lineRequests.length * 9 + 10,
      sharedParts: sharedParts.length ? sharedParts : undefined,
    });
  });

  const byFamily = new Map<string, BulkRequestItem[]>();
  remaining().forEach((request) => {
    if (isUrgent(request.priority)) return;
    const keyword = getPrimaryKeyword(request.title);
    if (!keyword) return;
    const bucket = byFamily.get(keyword) ?? [];
    bucket.push(request);
    byFamily.set(keyword, bucket);
  });

  byFamily.forEach((groupRequests, keyword) => {
    if (groupRequests.length < 2) return;

    groupRequests.forEach((request) => consumed.add(request.cardId));
    const sharedParts = getSharedPartsForRequests(groupRequests);
    const sharedPartsReason = buildSharedPartsReason(sharedParts);

    recommendations.push({
      id: `bulk-group-${keyword}`,
      action: 'group',
      headline: `Group ${groupRequests.length} ${keyword} requests into one Work Order`,
      requests: groupRequests,
      reasons: [
        { label: `${groupRequests.length} requests target the same ${keyword} equipment family.`, tone: 'info' },
        { label: 'Combining them into a single Work Order reduces separate interventions and downtime windows.', tone: 'positive' },
        ...(sharedPartsReason ? [sharedPartsReason] : []),
      ],
      benefit: `Saves ${groupRequests.length - 1} intervention${groupRequests.length - 1 > 1 ? 's' : ''}`,
      confidence: clampConfidence(75 + Math.min(groupRequests.length, 2)),
      impactScore: groupRequests.length * 8 + 8,
      sharedParts: sharedParts.length ? sharedParts : undefined,
    });
  });

  remaining()
    .sort((left, right) => (isUrgent(right.priority) ? 1 : 0) - (isUrgent(left.priority) ? 1 : 0))
    .forEach((request) => {
      consumed.add(request.cardId);
      recommendations.push({
        id: `bulk-create-${request.cardId}`,
        action: 'create',
        headline: `Create a new Work Order for ${request.title}`,
        requests: [request],
        reasons: isUrgent(request.priority)
          ? [
              { label: `${priorityLabelById[request.priority]} priority — needs its own expedited Work Order.`, tone: 'critical' },
              { label: 'No overlapping planned or preventive work was found for this equipment.', tone: 'info' },
            ]
          : [
              { label: 'No existing Work Order or PM overlaps with this request.', tone: 'info' },
              { label: 'A dedicated Work Order keeps this intervention clearly tracked.', tone: 'info' },
            ],
        benefit: isUrgent(request.priority) ? 'Expedited handling' : 'Standalone Work Order',
        confidence: clampConfidence(isUrgent(request.priority) ? 70 : 60),
        impactScore: isUrgent(request.priority) ? 6 : 3,
      });
    });

  const sortedRecommendations = sortRecommendations(recommendations);
  const impact = computeImpactMetrics(sortedRecommendations, requests.length);

  const summary =
    impact.optimizationCount > 0
      ? `I analyzed ${requests.length} maintenance requests and found ${impact.optimizationCount} optimization opportunit${impact.optimizationCount > 1 ? 'ies' : 'y'} that can remove ${impact.fewerInterventions} separate intervention${impact.fewerInterventions > 1 ? 's' : ''}, saving about ${impact.downtimeHoursSaved}h downtime and $${impact.estimatedCostSaved.toLocaleString()}.`
      : `I analyzed ${requests.length} maintenance requests. Each one needs its own Work Order — no grouping or linking opportunities were found.`;

  return {
    totalRequests: requests.length,
    ...impact,
    recommendations: sortedRecommendations,
    summary,
  };
}

export function buildBulkRequestItems(
  cards: MaintenanceCard[],
  getRequestId: (card: MaintenanceCard) => string,
  getCriticality: (card: MaintenanceCard) => 'A' | 'B' | 'C' | undefined,
  getHierarchy?: (card: MaintenanceCard) => string[] | undefined,
): BulkRequestItem[] {
  return cards.map((card) => {
    const hierarchy = getHierarchy?.(card);
    return {
      cardId: card.id,
      requestId: getRequestId(card),
      title: card.title,
      detail: card.detail,
      priority: card.priority,
      criticality: card.equipmentCriticality ?? getCriticality(card),
      hierarchy,
      lineId: hierarchy?.[2],
    };
  });
}
