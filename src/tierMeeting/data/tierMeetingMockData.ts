import type { ActionTrackerCategory, ActionTrackerRow } from '../../actionTracker/types';
import type {
  TierMeetingActionDetail,
  TierMeetingActionSummary,
  TierMeetingDailyTrackerConfig,
  TierMeetingDailyTrackerDayDetail,
  TierMeetingLaneId,
  TierMeetingPillar,
} from '../types';

type BuildDailyTrackerDetailsInput = {
  totalDays: number;
  recordedThroughDay: number;
  activeDay: number;
  incidentDays: number[];
  clearTitle: string;
  clearSummary: string;
  activeTitle: string;
  activeSummary: string;
  futureTitle: string;
  futureSummary: string;
  incidentOverrides: Record<number, Omit<TierMeetingDailyTrackerDayDetail, 'day'>>;
};

function getCurrentTrackerDay(totalDays: number) {
  const today = new Date().getDate();

  return Math.max(1, Math.min(today, totalDays));
}

function buildDailyTrackerDetails({
  totalDays,
  recordedThroughDay,
  activeDay,
  incidentDays,
  clearTitle,
  clearSummary,
  activeTitle,
  activeSummary,
  futureTitle,
  futureSummary,
  incidentOverrides,
}: BuildDailyTrackerDetailsInput): TierMeetingDailyTrackerDayDetail[] {
  return Array.from({ length: totalDays }, (_, index) => {
    const day = index + 1;

    if (day > recordedThroughDay) {
      return {
        day,
        title: futureTitle,
        summary: futureSummary,
        notes: [
          'No meeting note has been attached to this day yet.',
          'The lane will stay in future or unrecorded state until the date is reviewed.',
        ],
      };
    }

    if (day === activeDay) {
      const override = incidentOverrides[day];
      return {
        day,
        title: override?.title ?? activeTitle,
        summary: override?.summary ?? activeSummary,
        notes: override?.notes ?? [
          'This day is currently highlighted for team review.',
          'Owners and next actions are expected to be confirmed during the meeting.',
        ],
      };
    }

    if (incidentDays.includes(day)) {
      const override = incidentOverrides[day];
      return {
        day,
        title: override?.title ?? 'Incident recorded',
        summary: override?.summary ?? 'An issue was logged on this day and requires follow-up review.',
        notes: override?.notes ?? [
          'The team logged an event against this date.',
          'Corrective action review is expected as part of the lane discussion.',
        ],
      };
    }

    return {
      day,
      title: clearTitle,
      summary: clearSummary,
      notes: [
        'Checks were completed and no red flag was raised for this date.',
        'The day remains part of the cleared run in the monthly tracker.',
      ],
    };
  });
}

const laneDefinitions: Array<{
  id: TierMeetingLaneId;
  category: ActionTrackerCategory;
  title: string;
  subtitle: string;
  color: string;
  aiInsightText: string;
  heroValue: string;
  heroLabel: string;
  kpis: TierMeetingPillar['kpis'];
  insights: TierMeetingPillar['insights'];
  chartTitle?: string;
  chartData?: TierMeetingPillar['chartData'];
  graphicCards?: TierMeetingPillar['graphicCards'];
  dailyTracker?: TierMeetingDailyTrackerConfig;
  recognitions?: TierMeetingPillar['recognitions'];
  communications?: TierMeetingPillar['communications'];
  focusAreas?: string[];
}> = [
    {
      id: 'safety',
      category: 'SAFETY',
      title: 'Safety',
      subtitle: 'Observations, risks, and closure readiness before handoff.',
      color: '#E43B46',
      aiInsightText: 'Escalate ESO ownership now so the shift does not carry an unassigned safety risk into handoff.',
      heroValue: '2',
      heroLabel: 'Open escalations',
      kpis: [
        { id: 'fatality', label: 'Fatality', value: '0', target: '0', tone: '#044ED7' },
        { id: 'serious-inj', label: 'Serious Inj', value: '3', target: '0', tone: '#E43B46' },
        { id: 'minor-injury', label: 'Minor Injury', value: '12', target: '0', tone: '#E43B46' },
        { id: 'near-miss', label: 'Near Misses', value: '2', target: '0', tone: '#044ED7' },
        { id: 'unsafe-act', label: 'Unsafe Act', value: '6', target: '0', tone: '#044ED7' },
        { id: 'submitted-eso', label: 'Submitted ESO', value: '4', target: '0', tone: '#044ED7' },
      ],
      insights: [
        {
          id: 'safety-1',
          title: 'ESO closure is lagging behind shift pace',
          description: 'Two observations are still open and one has not been assigned a final verification owner.',
          severity: 'warning',
          recommendation: 'Use the next tier review to assign closure owners and confirm due dates.',
        },
        {
          id: 'safety-2',
          title: 'Work order closeout affects safety confidence',
          description: 'WO-2481 still needs verification before the shift can confidently close the related risk.',
          severity: 'critical',
          recommendation: 'Verify the conveyor fix and log a closeout note before handoff.',
        },
      ],
      chartTitle: 'ESO trend',
      chartData: [
        { label: 'Mon', value: 1 },
        { label: 'Tue', value: 3 },
        { label: 'Wed', value: 2 },
        { label: 'Thu', value: 4 },
        { label: 'Fri', value: 2, tone: '#E43B46' },
      ],
      graphicCards: [
        {
          id: 'safety-field-actions',
          scopeLabel: 'Line 1',
          label: 'Field Actions',
          value: '2',
          target: '0',
          comparisonLabel: '-2 vs target',
          accent: '#FF5A52',
          trendValues: [10, 18, 24, 31, 27, 41, 36, 33, 49],
        },
        {
          id: 'safety-near-misses',
          scopeLabel: 'Line 1',
          label: 'Near Misses',
          value: '1',
          target: '0',
          comparisonLabel: '-1 vs target',
          accent: '#FF5A52',
          trendValues: [6, 9, 14, 18, 16, 22, 19, 25, 28],
        },
      ],
      dailyTracker: (() => {
        const totalDays = 31;
        const currentDay = getCurrentTrackerDay(totalDays);

        return {
          centerLabel: 'S',
          totalDays,
          recordedThroughDay: currentDay,
          activeDay: currentDay,
          incidentDays: [3, 15],
          details: buildDailyTrackerDetails({
            totalDays,
            recordedThroughDay: currentDay,
            activeDay: currentDay,
            incidentDays: [3, 15],
            clearTitle: 'Routine safety checks completed',
            clearSummary: 'Line walk, PPE verification, and operator confirmation closed without incident on this day.',
            activeTitle: 'Current safety review in progress',
            activeSummary: 'This is the active safety day under discussion, with follow-up ownership still being confirmed.',
            futureTitle: 'Safety entry not recorded yet',
            futureSummary: 'This date is still unrecorded in the current monthly safety tracker.',
            incidentOverrides: {
              3: {
                title: 'Near miss logged during startup',
                summary: 'A startup clearance issue triggered a near-miss report and same-shift coaching follow-up.',
                notes: [
                  'Operator stopped the sequence before full exposure.',
                  'Supervisor logged the observation and assigned immediate coaching.',
                  'Guard verification was added to the next startup checklist.',
                ],
              },
              15: {
                title: 'Hand protection observation escalated',
                summary: 'A PPE compliance gap was found on the line and recorded as a safety incident for corrective action.',
                notes: [
                  'Issue was identified during a layered process audit.',
                  'Replacement gloves were issued before restart.',
                  'Area lead ownership was assigned for retraining completion.',
                ],
              },
            },
          }),
        };
      })(),
      focusAreas: [
        'Confirm the overdue verification tied to conveyor guarding.',
        'Call out one observation without a final owner.',
        'Use Action Tracker as the source of truth for safety closure status.',
      ],
    },
    {
      id: 'quality',
      category: 'QUALITY',
      title: 'Quality',
      subtitle: 'Deviation signals, review ownership, and quality blockers.',
      color: '#FF6E00',
      aiInsightText: 'Prioritize the NC approval bottleneck because it is the clearest blocker to same-day closure.',
      heroValue: '1',
      heroLabel: 'Escalation pending',
      kpis: [
        { id: 'field-actions', label: 'Field Actions', value: '2', target: '0', tone: '#044ED7' },
        { id: 'complaints', label: 'Complaints', value: '1', target: '0', tone: '#FF6E00', note: '' },
        { id: 'ncs', label: 'NCs', value: '3', target: '0', tone: '#E43B46', note: '' },
        { id: 'capas', label: 'CAPAs', value: '4', target: '0', tone: '#044ED7', note: '' },
      ],
      insights: [
        {
          id: 'quality-1',
          title: 'Approval latency is blocking closure',
          description: 'One quality action is waiting on approval and is likely to be called out in the next tier meeting.',
          severity: 'warning',
          recommendation: 'Review owners and approvers together before the next handoff.',
        },
        {
          id: 'quality-2',
          title: 'Document flow still impacts action closure',
          description: 'The overdue e-signature continues to create downstream ambiguity for a linked quality workflow.',
          severity: 'critical',
          recommendation: 'Escalate document closure status in the meeting and tie it to the quality blocker list.',
        },
      ],
      chartTitle: 'NC weekly trend',
      chartData: [
        { label: 'W1', value: 2 },
        { label: 'W2', value: 3 },
        { label: 'W3', value: 4 },
        { label: 'W4', value: 3 },
      ],
      graphicCards: [
        {
          id: 'quality-field-actions',
          scopeLabel: 'Line 1',
          label: 'Field Actions',
          value: '2',
          target: '0',
          comparisonLabel: '-2 vs target',
          accent: '#FF5A52',
          trendValues: [8, 11, 16, 22, 19, 26, 23, 31, 38],
        },
        {
          id: 'quality-rft',
          scopeLabel: 'Line 1',
          label: 'RFT Compliance',
          value: '98.4%',
          target: '97%',
          comparisonLabel: '+1.4% vs target',
          accent: '#66C26F',
          trendValues: [52, 58, 63, 69, 65, 76, 72, 80, 87],
        },
      ],
      dailyTracker: (() => {
        const totalDays = 31;
        const currentDay = getCurrentTrackerDay(totalDays);

        return {
          centerLabel: 'Q',
          totalDays,
          recordedThroughDay: currentDay,
          activeDay: currentDay,
          incidentDays: [7],
          details: buildDailyTrackerDetails({
            totalDays,
            recordedThroughDay: currentDay,
            activeDay: currentDay,
            incidentDays: [7],
            clearTitle: 'Quality checks closed cleanly',
            clearSummary: 'Daily quality review, line confirmation, and release checks were completed with no new issue raised.',
            activeTitle: 'Current quality review in progress',
            activeSummary: 'This is the active quality day under review, with open discussion around current deviations and approvals.',
            futureTitle: 'Quality entry not recorded yet',
            futureSummary: 'This date is still future or has not yet been recorded in the monthly quality tracker.',
            incidentOverrides: {
              7: {
                title: 'Nonconformance opened on final check',
                summary: 'A defect found during final verification opened a quality issue and triggered containment on the line.',
                notes: [
                  'Suspect material was isolated immediately.',
                  'Quality engineer opened the NC and started disposition review.',
                  'Containment remained active until approval signoff.',
                ],
              },
            },
          }),
        };
      })(),
      focusAreas: [
        'Review approval timing for the highest-risk quality item.',
        'Link document and quality blockers explicitly during the meeting.',
        'Decide whether one open NC needs escalation beyond Tier 1.',
      ],
    },
    {
      id: 'delivery',
      category: 'DELIVERY',
      title: 'Delivery',
      subtitle: 'Schedule stability, changeover timing, and next-shift readiness.',
      color: '#9199D8',
      aiInsightText: 'Protect the next handoff by reviewing changeover performance before discussing the current order plan.',
      heroValue: '42 min',
      heroLabel: 'Last changeover',
      kpis: [
        { id: 'last-changeover', label: 'Last Changeover', value: '42', target: '35', tone: '#E43B46', note: 'min' },
        { id: 'last-startup', label: 'Last Start-up', value: '18', target: '20', tone: '#00AF95', note: 'min' },
      ],
      insights: [
        {
          id: 'delivery-1',
          title: 'The next handoff needs a tighter blocker story',
          description: 'Three blockers remain open across the tier view and one directly affects changeover readiness.',
          severity: 'warning',
          recommendation: 'Use the board to align delivery and action ownership before shift close.',
        },
      ],
      chartTitle: 'Output by shift block',
      chartData: [
        { label: '06:00', value: 76 },
        { label: '08:00', value: 81 },
        { label: '10:00', value: 74, tone: '#E43B46' },
        { label: '12:00', value: 84 },
        { label: '14:00', value: 87 },
      ],
      graphicCards: [
        {
          id: 'delivery-output',
          scopeLabel: 'Line 1',
          label: 'Production Output',
          value: '7.6%',
          target: '6.0%',
          comparisonLabel: '-1.6% vs target',
          accent: '#FF5A52',
          trendValues: [12, 18, 30, 22, 40, 27, 46],
        },
        {
          id: 'delivery-scrap',
          scopeLabel: 'Line 1',
          label: 'Scrap',
          value: '41',
          target: '45',
          comparisonLabel: '+4 vs target',
          accent: '#66C26F',
          trendValues: [9, 14, 26, 18, 33, 24, 41],
        },
      ],
      focusAreas: [
        'Confirm whether changeover loss should be escalated.',
        'Review the two orders currently at risk before next shift start.',
      ],
    },
    {
      id: 'cost',
      category: 'COST',
      title: 'Cost',
      subtitle: 'Scrap, downtime, and cost pressures that need discussion today.',
      color: '#1F2366',
      aiInsightText: 'Downtime remains the largest cost signal, so start with the red hourly losses before reviewing scrap.',
      heroValue: '9%',
      heroLabel: 'Scrap produced',
      kpis: [
        { id: 'total-scrap-produced', label: 'Total Scrap Produced', value: '9', target: '10', tone: '#044ED7', note: '%' },
      ],
      insights: [
        {
          id: 'cost-1',
          title: 'Downtime is still the most expensive signal in the board',
          description: 'Line-side delays are driving both cost pressure and action volume.',
          severity: 'critical',
          recommendation: 'Review the top downtime-linked actions first during the meeting.',
        },
      ],
      chartTitle: 'Downtime vs scrap',
      chartData: [
        { label: 'Mon', value: 45 },
        { label: 'Tue', value: 52 },
        { label: 'Wed', value: 41 },
        { label: 'Thu', value: 68, tone: '#E43B46' },
        { label: 'Fri', value: 49 },
      ],
      graphicCards: [
        {
          id: 'cost-output',
          scopeLabel: 'Line 1',
          label: 'Production Output',
          value: '5.2%',
          target: '4.0%',
          comparisonLabel: '-1.2% vs target',
          accent: '#FF5A52',
          trendValues: [7, 13, 27, 18, 36, 24, 42],
        },
        {
          id: 'cost-downtime',
          scopeLabel: 'Line 1',
          label: 'Downtime',
          value: '23',
          target: '25',
          comparisonLabel: '+2 vs target',
          accent: '#66C26F',
          trendValues: [10, 16, 29, 19, 36, 24, 43],
        },
      ],
      focusAreas: [
        'Align downtime actions with the highest cost exposure.',
        'Call out the startup timing issue if it will repeat next shift.',
      ],
    },
    {
      id: 'people',
      category: 'PEOPLE',
      title: 'People',
      subtitle: 'Recognition, communication, and launch readiness for the team.',
      color: '#00AF95',
      aiInsightText: 'Use the people section to confirm coverage gaps first, then launch recognition so the meeting starts with clarity.',
      heroValue: '5',
      heroLabel: 'Coverage notes',
      kpis: [
        { id: 'absenteeism', label: 'Absenteeism', value: '2.1%', target: '3%', tone: '#00AF95', note: 'Within target' },
        { id: 'swaps', label: 'Open swaps', value: '2', target: '0', tone: '#044ED7', note: 'Needs confirmation' },
        { id: 'overtime', label: 'OT hours', value: '14 h', target: '10 h', tone: '#FF6E00', note: 'Watch fatigue risk' },
      ],
      insights: [
        {
          id: 'people-1',
          title: 'Coverage is manageable but still needs an owner callout',
          description: 'Two swaps are open and should be included in the meeting launch script.',
          severity: 'info',
          recommendation: 'Open the shift schedule after kickoff if backup confirmation is still pending.',
        },
      ],
      recognitions: [
        { id: 'rec-1', name: 'John Joshua', highlight: 'Zero-defect streak', detail: '30 days without a quality defect on Line 10.' },
        { id: 'rec-2', name: 'Carlos Mendez', highlight: 'Training support', detail: 'Helped onboard 3 new operators this month.' },
      ],
      graphicCards: [
        {
          id: 'people-leading',
          scopeLabel: 'Line 1',
          label: 'Leading Recognition & Suggestions',
          value: '23',
          target: '20',
          comparisonLabel: '+3 vs target',
          accent: '#66C26F',
          trendValues: [11, 17, 31, 20, 39, 26, 45],
        },
        {
          id: 'people-lagging',
          scopeLabel: 'Line 1',
          label: 'Lagging or Absence',
          value: '3',
          target: '1',
          comparisonLabel: '-2 vs target',
          accent: '#FF5A52',
          trendValues: [8, 12, 24, 15, 33, 21, 40],
        },
      ],
      communications: [
        { id: 'comm-1', title: 'Shift launch', detail: 'Open the meeting by confirming coverage swaps and WO-2481 verification.' },
        { id: 'comm-2', title: 'Recognition callout', detail: 'Celebrate the zero-defect streak before moving into blockers.' },
      ],
      focusAreas: [
        'Confirm coverage ownership for two open swaps.',
        'Use the start meeting CTA as the launch point for the people section.',
      ],
    },
    {
      id: 'custom',
      category: 'PEOPLE',
      title: 'Loss Focused KPIs',
      subtitle: 'Breakdown and changeover trends with team recognition and communication.',
      color: '#044ED7',
      aiInsightText: 'Track breakdown and changeover in one focused view so teams can intervene before the next shift.',
      heroValue: '11.7%',
      heroLabel: 'Breakdown day average',
      kpis: [
        { id: 'breakdown', label: 'Breakdown', value: '11.7%', target: '10%', tone: '#E43B46', note: 'Day avg' },
        { id: 'changeover', label: 'Changeover', value: '6.2%', target: '5%', tone: '#E43B46', note: 'Day avg' },
      ],
      insights: [
        {
          id: 'custom-1',
          title: 'The lane is ready for mixed-mode reviews',
          description: 'This custom pillar can carry safety, quality, delivery, cost, and people sections in a single configurable lane.',
          severity: 'opportunity',
          recommendation: 'Turn on only the sections that support this team’s daily cadence.',
        },
      ],
      chartTitle: 'Custom trend',
      chartData: [
        { label: 'Mon', value: 62 },
        { label: 'Tue', value: 74 },
        { label: 'Wed', value: 58, tone: '#E43B46' },
        { label: 'Thu', value: 80 },
        { label: 'Fri', value: 77 },
      ],
      graphicCards: [
        {
          id: 'custom-readiness',
          scopeLabel: 'Line 1',
          label: 'Cross-Functional Readiness',
          value: '88%',
          target: '85%',
          comparisonLabel: '+3% vs target',
          accent: '#66C26F',
          trendValues: [34, 40, 48, 44, 57, 52, 64],
        },
        {
          id: 'custom-issues',
          scopeLabel: 'Line 1',
          label: 'Open Mixed Issues',
          value: '6',
          target: '3',
          comparisonLabel: '-3 vs target',
          accent: '#FF5A52',
          trendValues: [14, 19, 28, 24, 37, 30, 46],
        },
      ],
      dailyTracker: {
        centerLabel: 'C',
        totalDays: 31,
        recordedThroughDay: 22,
        activeDay: 22,
        incidentDays: [8, 17],
        details: buildDailyTrackerDetails({
          totalDays: 31,
          recordedThroughDay: 22,
          activeDay: 22,
          incidentDays: [8, 17],
          clearTitle: 'Custom lane checks cleared',
          clearSummary: 'No team-specific exception was raised on this day for the custom lane.',
          activeTitle: 'Current custom review in progress',
          activeSummary: 'The lane is being used today to review a mixed set of team priorities.',
          futureTitle: 'Custom lane entry not recorded yet',
          futureSummary: 'This date has not been reviewed yet in the custom lane.',
          incidentOverrides: {
            8: {
              title: 'Combined team review opened',
              summary: 'A cross-functional issue triggered a combined review using the custom lane format.',
              notes: [
                'Quality and delivery owners joined the same discussion.',
                'The lane was used to consolidate actions in one place.',
              ],
            },
            17: {
              title: 'Custom blocker follow-up logged',
              summary: 'A team-specific concern was tracked in the custom lane for follow-up.',
              notes: [
                'The team added a short-term review thread to this lane.',
                'Follow-up ownership was assigned in the meeting.',
              ],
            },
            22: {
              title: 'Active custom review for today',
              summary: 'The team is using the custom lane to run a blended review across multiple meeting themes.',
              notes: [
                'Only the sections needed for today’s meeting should stay visible.',
                'The lane can be renamed to match the team’s local language.',
              ],
            },
          },
        }),
      },
      recognitions: [
        { id: 'custom-rec-1', name: 'Carlos Mendez', highlight: 'Training support', detail: 'Helped train 3 new operators this month.' },
        { id: 'custom-rec-2', name: 'John Joshua', highlight: 'Zero-defect streak', detail: '30-day streak with zero defects.' },
      ],
      communications: [
        { id: 'custom-comm-1', title: 'Today focus', detail: 'Reduce micro-stops on Line 3.' },
        { id: 'custom-comm-2', title: 'Planned changeover', detail: 'Planned changeover at 11:00. Ensure tools are ready.' },
      ],
      focusAreas: [
        'Pick the modules that match this team’s meeting style.',
        'Rename the lane so the purpose is obvious at a glance.',
        'Use the lane as a blended workspace when one pillar is not enough.',
      ],
    },
  ];

function buildActionSummary(category: ActionTrackerCategory, rows: ActionTrackerRow[]): TierMeetingActionSummary {
  const scopedRows = rows.filter((row) => row.category === category);
  const referenceDate = new Date('2026-04-14T00:00:00').getTime();

  return scopedRows.reduce<TierMeetingActionSummary>(
    (summary, row) => {
      if (row.status === 'Open') summary.open += 1;
      if (row.status === 'Under Review') summary.underReview += 1;
      if (row.status === 'Under Approval') summary.underApproval += 1;
      if (row.status === 'Completed') summary.completed += 1;

      const dueDate = new Date(row.dueDate);
      if (
        row.status !== 'Completed'
        && row.status !== 'Canceled'
        && !Number.isNaN(dueDate.getTime())
        && dueDate.getTime() < referenceDate
      ) {
        summary.overdue += 1;
      }

      return summary;
    },
    { open: 0, underReview: 0, underApproval: 0, completed: 0, overdue: 0 },
  );
}

function buildLinkedActions(category: ActionTrackerCategory, rows: ActionTrackerRow[]): TierMeetingActionDetail[] {
  return rows
    .filter((row) => row.category === category)
    .slice(0, 4)
    .map((row) => ({
      id: row.id,
      title: row.title,
      owner: row.assignedTo,
      dueDate: row.dueDate,
      priority: row.priority,
      status: row.status,
    }));
}

export function buildTierMeetingPillars(rows: ActionTrackerRow[]): TierMeetingPillar[] {
  const customGraphicCards = laneDefinitions
    .filter((lane) => lane.id !== 'custom')
    .flatMap((lane) => (
      lane.graphicCards?.map((card) => ({
        ...card,
        scopeLabel: lane.title,
      })) ?? []
    ));

  return laneDefinitions.map((lane) => ({
    ...lane,
    graphicCards: lane.id === 'custom' ? customGraphicCards : lane.graphicCards,
    status: lane.id === 'delivery' || lane.id === 'people' || lane.id === 'safety' ? 'Critical' : 'On Track',
    actionSummary: lane.id === 'custom'
      ? { open: 0, underReview: 0, underApproval: 0, completed: 0, overdue: 0 }
      : buildActionSummary(lane.category, rows),
    linkedActions: lane.id === 'custom' ? [] : buildLinkedActions(lane.category, rows),
  }));
}
