import React from 'react';
import {Alert, Box, Button, Divider, Paper, Stack, Typography} from '@mui/material';
import type {AiInsight, ConversationEntry, PriorityOverrideRecord, RiskClusterItem, RiskDetailData} from '../types';
import {ConfidenceBadge, FreshnessBadge, GovernedBadge, SeverityBadge, StatusBadge} from './Badges';
import AiInsightBlock from './AiInsightBlock';

const moduleCardSx = {
  borderRadius: 4,
  border: '1px solid var(--planning-border)',
  bgcolor: 'var(--planning-surface)',
  boxShadow: 'var(--planning-soft-shadow)',
};

const sectionLabelSx = {
  fontSize: 11,
  fontWeight: 800,
  color: 'var(--planning-text-secondary)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  mb: 1,
};

interface RiskDetailPanelProps {
  item: RiskClusterItem;
  detail: RiskDetailData;
  insight: AiInsight;
  conversation: ConversationEntry[];
  override?: PriorityOverrideRecord;
  onAcceptRecommendation: (rec: string) => void;
  onOverrideSeverity: () => void;
  onAction: (action: string) => void;
}

export default function RiskDetailPanel({
  item,
  detail,
  insight,
  conversation,
  override,
  onAcceptRecommendation,
  onOverrideSeverity,
  onAction,
}: RiskDetailPanelProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        ...moduleCardSx,
        width: 430,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        maxHeight: 'calc(100vh - 320px)',
        position: 'sticky',
        top: 16,
      }}
    >
      <Box sx={{px: 2, py: 1.6, background: 'linear-gradient(135deg, #08184A 0%, #DC2626 100%)'}}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Box sx={{minWidth: 0}}>
            <Typography sx={{fontSize: 16, fontWeight: 900, color: '#FFFFFF'}}>{detail.clusterName}</Typography>
            <Typography sx={{fontSize: 12, color: 'rgba(255,255,255,0.78)', mt: 0.35}}>{detail.rootCauseSummary}</Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{mt: 1}}>
              <StatusBadge status={item.actionStatus} />
              <FreshnessBadge state={item.freshness} />
            </Stack>
          </Box>
          <Stack spacing={0.75} alignItems="flex-end">
            <SeverityBadge severity={item.severity} />
            <Button size="small" variant="outlined" onClick={onOverrideSeverity} sx={{textTransform: 'none', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.35)'}}>
              Override
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2}}>
        {override ? (
          <Alert severity="info" sx={{fontSize: 12, py: 0.5}}>
            Severity manually overridden by {override.user} on {override.timestamp}. Reason: {override.reason}
          </Alert>
        ) : null}

        <Section label="Cluster Summary">
          <InfoGrid rows={[
            ['Demand at risk', detail.demandAtRisk],
            ['Recoverable qty', detail.recoverableQty],
            ['Lines impacted', detail.linesImpacted],
            ['Earliest risk', detail.earliestRisk],
            ['Owner', detail.owner],
          ]} />
        </Section>

        <Divider />

        <Section label="AI Recovery Plan">
          <NarrativeCard title="Root cause" body={detail.rootCauseSummary} />
          <NarrativeCard title="Recommended recovery plan" body={detail.aiRecoveryPlan} />
          <NarrativeCard title="If unresolved" body={detail.noActionImpact} />
          <NarrativeCard title="Why this owner" body={detail.suggestedOwnerReason} />
        </Section>

        <Divider />

        <Section label="Affected WOs">
          <Stack direction="row" flexWrap="wrap" gap={0.75}>
            {detail.affectedWos.map((wo) => (
              <Box key={wo} sx={{px: 1, py: 0.35, borderRadius: 1.5, bgcolor: 'var(--planning-neutral-bg)', border: '1px solid #BFDBFE'}}>
                <Typography sx={{fontSize: 11, fontWeight: 800, color: '#1D4ED8'}}>{wo}</Typography>
              </Box>
            ))}
          </Stack>
        </Section>

        <Divider />

        <Section label="Prepared Actions">
          <Stack spacing={1}>
            {detail.preparedActions.map((action) => (
              <Box key={action.id} sx={{p: 1.15, borderRadius: 2, bgcolor: 'var(--planning-surface-muted)', border: '1px solid var(--planning-border)'}}>
                <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="flex-start">
                  <Box>
                    <Typography sx={{fontSize: 12, fontWeight: 800, color: 'var(--planning-text-primary)'}}>{action.label}</Typography>
                    <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', mt: 0.45}}>{action.comment}</Typography>
                  </Box>
                  <Stack spacing={0.5} alignItems="flex-end">
                    <ConfidenceBadge confidence={item.confidence} />
                    {action.governed ? <GovernedBadge /> : null}
                  </Stack>
                </Stack>
                <Button variant="contained" size="small" onClick={() => onAction(action.label)} sx={{mt: 1, textTransform: 'none', fontWeight: 700}}>
                  {action.confirmationLabel}
                </Button>
              </Box>
            ))}
          </Stack>
        </Section>

        <Divider />

        {detail.relatedRisks.length > 0 ? (
          <>
            <Section label="Related Risks">
              <Stack spacing={0.8}>
                {detail.relatedRisks.map((risk) => (
                  <Stack key={risk.id} direction="row" justifyContent="space-between" sx={{px: 1.1, py: 0.8, borderRadius: 2, bgcolor: 'var(--planning-surface-muted)', border: '1px solid var(--planning-border)'}}>
                    <Typography sx={{fontSize: 12, fontWeight: 700, color: 'var(--planning-text-primary)'}}>{risk.title}</Typography>
                    <SeverityBadge severity={risk.severity} />
                  </Stack>
                ))}
              </Stack>
            </Section>
            <Divider />
          </>
        ) : null}

        <AiInsightBlock insight={insight} onAcceptRecommendation={onAcceptRecommendation} />

        <Divider />

        <Section label="AI Chat / History">
          <Stack spacing={1}>
            {conversation.map((entry) => (
              <Box key={entry.id} sx={{p: 1.2, borderRadius: 2, bgcolor: entry.type === 'ai' ? '#EEF4FF' : '#FFFFFF', border: '1px solid var(--planning-border)'}}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{fontSize: 11, fontWeight: 800, color: 'var(--planning-text-primary)'}}>{entry.user}</Typography>
                  <Typography sx={{fontSize: 10, color: 'var(--planning-text-muted)'}}>{entry.timestamp}</Typography>
                </Stack>
                <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', mt: 0.35, lineHeight: 1.5}}>{entry.text}</Typography>
              </Box>
            ))}
          </Stack>
          <Stack direction="row" gap={0.6} flexWrap="wrap" sx={{mt: 1}}>
            {detail.suggestedQuestions.map((question) => (
              <Button key={question} size="small" variant="outlined" sx={{textTransform: 'none', fontWeight: 700}}>
                {question}
              </Button>
            ))}
          </Stack>
        </Section>

        <Divider />

        <Section label="Event Timeline">
          <Stack spacing={0.75}>
            {detail.eventTimeline.map((event) => (
              <Typography key={event} sx={{fontSize: 12, color: 'var(--planning-text-secondary)', lineHeight: 1.5}}>
                {event}
              </Typography>
            ))}
          </Stack>
        </Section>
      </Box>
    </Paper>
  );
}

function Section({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <Box>
      <Typography sx={sectionLabelSx}>{label}</Typography>
      {children}
    </Box>
  );
}

function InfoGrid({rows}: {rows: [string, string][]}) {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.75}}>
      {rows.map(([label, value]) => (
        <Stack key={label} direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Typography sx={{fontSize: 12, fontWeight: 600, color: 'var(--planning-text-secondary)', flexShrink: 0, minWidth: 120}}>{label}</Typography>
          <Typography sx={{fontSize: 12, color: 'var(--planning-text-primary)', textAlign: 'right', lineHeight: 1.45}}>{value}</Typography>
        </Stack>
      ))}
    </Box>
  );
}

function NarrativeCard({title, body}: {title: string; body: string}) {
  return (
    <Box sx={{p: 1.1, borderRadius: 2, bgcolor: 'var(--planning-surface-muted)', border: '1px solid var(--planning-border)', mb: 0.8}}>
      <Typography sx={{fontSize: 11, fontWeight: 800, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5}}>
        {title}
      </Typography>
      <Typography sx={{fontSize: 12, color: 'var(--planning-text-primary)', lineHeight: 1.55}}>{body}</Typography>
    </Box>
  );
}
