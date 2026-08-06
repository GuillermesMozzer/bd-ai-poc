import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  actionTrackerKpiSectionDefinitions,
  buildActionTrackerKpiSections,
  toggleActionTrackerSummaryFilter,
  type ActionTrackerKpi,
} from './kpiSections.ts';

const sampleKpis: ActionTrackerKpi[] = [
  {id: 'all', label: 'All action items', value: 21, tone: '#60a5fa', urgent: false, active: false},
  {id: 'pendingMyAction', label: 'Pending My Action', value: 3, tone: '#60a5fa', urgent: false, active: true},
  {id: 'related', label: 'Related To Me', value: 4, tone: '#60a5fa', urgent: false, active: false},
  {id: 'inProgress', label: 'In Progress', value: 2, tone: '#0f766e', urgent: false, active: false},
  {id: 'pendingApprovals', label: 'Pending Approvals', value: 2, tone: '#fb923c', urgent: false, active: false},
  {id: 'completed', label: 'Completed', value: 5, tone: '#22c55e', urgent: false, active: false},
  {id: 'overdue', label: 'Overdue', value: 1, tone: '#ef4444', urgent: true, active: false},
  {id: 'reopened', label: 'Reopened', value: 6, tone: '#f59e0b', urgent: false, active: false},
  {id: 'canceled', label: 'Canceled', value: 1, tone: '#64748b', urgent: false, active: false},
];

function runTests() {
  const screenSource = readFileSync(new URL('./components/ActionTrackerScreen.tsx', import.meta.url), 'utf8');
  const sections = buildActionTrackerKpiSections(sampleKpis);
  const myActionsSection = sections.find((section) => section.id === 'myActions');
  const siteFactorySection = sections.find((section) => section.id === 'siteFactoryActions');

  assert.equal(actionTrackerKpiSectionDefinitions.length, 2, 'KPI layout should render exactly two grouped sections');
  assert.equal(sections.length, 2, 'Built KPI sections should include My Actions and Action Overview');
  assert.ok(myActionsSection, 'My Actions section should render separately');
  assert.ok(siteFactorySection, 'Action Overview section should render separately');

  assert.deepEqual(
    myActionsSection?.kpis.map((kpi) => kpi.label),
    ['Pending My Action', 'Related To Me'],
    'My Actions should contain only Pending My Action and Related To Me',
  );
  assert.deepEqual(
    siteFactorySection?.kpis.map((kpi) => kpi.label),
    ['All action items', 'In Progress', 'Pending Approvals', 'Completed', 'Overdue', 'Reopened', 'Canceled'],
    'Action Overview should contain the lifecycle and queue KPI cards',
  );

  assert.equal(
    sections.some((section) => section.kpis.some((kpi) => kpi.label === 'Created By Me')),
    false,
    'No Created By Me KPI card should be added',
  );

  assert.equal(
    myActionsSection?.kpis[0],
    sampleKpis[1],
    'Grouping should preserve the original KPI object so selected state and color treatment remain intact',
  );
  assert.equal(
    siteFactorySection?.kpis[2],
    sampleKpis[4],
    'Grouping should preserve urgent KPI styling references for site/factory cards',
  );

  assert.equal(
    toggleActionTrackerSummaryFilter(null, 'pendingMyAction'),
    'pendingMyAction',
    'Clicking Pending My Action should activate its filter',
  );
  assert.equal(
    toggleActionTrackerSummaryFilter('pendingMyAction', 'pendingMyAction'),
    null,
    'Clicking the active Pending My Action card should clear the filter',
  );
  assert.equal(
    toggleActionTrackerSummaryFilter('pendingMyAction', 'related'),
    'related',
    'Clicking Related To Me should switch the personal workload filter',
  );
  assert.equal(
    toggleActionTrackerSummaryFilter('overdue', 'all'),
    null,
    'Clicking All action items should reset the KPI filter back to all visible actions',
  );

  assert.equal(
    myActionsSection?.kpis.length,
    2,
    'My Actions should keep a compact card row for personal workload',
  );
  assert.equal(
    siteFactorySection?.kpis.length,
    7,
    'Action Overview should keep the full governance/site workload row',
  );

  assert.deepEqual(
    actionTrackerKpiSectionDefinitions.map((section) => section.title),
    ['My Actions', 'Action Overview'],
    'The grouped KPI definitions should expose the expected section titles',
  );
  assert.match(
    screenSource,
    /onClick=\{\(\) => applySummaryFilter\(kpi\.id\)\}/,
    'KPI cards should keep click-to-filter behavior',
  );
  assert.match(
    screenSource,
    /role="button"[\s\S]*tabIndex=\{0\}[\s\S]*aria-pressed=\{kpi\.active\}[\s\S]*onKeyDown=\{\(event\) =>/,
    'KPI cards should behave like functional controls for mouse and keyboard interaction',
  );
  assert.match(
    screenSource,
    /gridTemplateColumns:\s*\{\s*xs:\s*'minmax\(0, 1fr\)'[\s\S]*xl:\s*'minmax\(0, 2fr\) minmax\(0, 5fr\)'/m,
    'KPI layout should remain responsive across smaller and larger breakpoints',
  );

  console.log('Action Tracker KPI section tests passed: 18');
}

runTests();
