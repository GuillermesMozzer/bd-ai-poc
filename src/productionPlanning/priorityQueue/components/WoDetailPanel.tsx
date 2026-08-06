import React from 'react';
import {Alert, Box, Button, Divider, Paper, Stack, Typography} from '@mui/material';
import type {AiInsight, ConversationEntry, PriorityOverrideRecord, WoDetailData, WoQueueItem} from '../types';
import {FreshnessBadge, GovernedBadge, PriorityBadge, ReadinessCheckBadge, StatusBadge} from './Badges';
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

interface WoDetailPanelProps {
  item: WoQueueItem;
  detail: WoDetailData;
  insight: AiInsight;
  conversation: ConversationEntry[];
  override?: PriorityOverrideRecord;
  onAcceptRecommendation: (rec: string) => void;
  onOverridePriority: () => void;
  onAction: (action: string) => void;
}

export default function WoDetailPanel({
  item,
  detail,
  insight,
  conversation,
  override,
  onAcceptRecommendation,
  onOverridePriority,
  onAction,
}: WoDetailPanelProps) {
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
      <Box sx={{px: 2, py: 1.6, background: 'linear-gradient(135deg, #08184A 0%, #1D4ED8 100%)'}}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Box sx={{minWidth: 0}}>
            <Typography sx={{fontSize: 16, fontWeight: 900, color: '#FFFFFF'}}>{item.woId}</Typography>
            <Typography sx={{fontSize: 12, color: 'rgba(255,255,255,0.78)', mt: 0.35}}>{detail.product}</Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{mt: 1}}>
              <StatusBadge status={item.actionStatus} />
              <FreshnessBadge state={item.freshness} />
              {item.overrideActive ? <GovernedBadge /> : null}
            </Stack>
          </Box>
          <Stack spacing={0.75} alignItems="flex-end">
            <PriorityBadge priority={item.priority} />
            <Button size="small" variant="outlined" onClick={onOverridePriority} sx={{textTransform: 'none', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.35)'}}>
              Override
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2}}>
        {override ? (
          <Alert severity="info" sx={{fontSize: 12, py: 0.5}}>
            Priority manually overridden by {override.user} on {override.timestamp}. Reason: {override.reason}
          </Alert>
        ) : null}

        <Section label="WO Header">
          <InfoGrid rows={[
            ['Batch', detail.batch],
            ['Planned qty', detail.plannedQty],
            ['Line / machine', detail.lineMachine],
            ['Scheduled start', detail.scheduledStart],
            ['Time to start', detail.timeToStart],
            ['Action due', item.actionDue],
            ['Next action', item.nextAction],
          ]} />
        </Section>

        <Divider />

        <Section label="AI Copilot Summary">
          <NarrativeCard title="Why prioritized?" body={detail.priorityReason} />
          <NarrativeCard title="Why blocked?" body={detail.whyBlocked} />
          <NarrativeCard title="What demand is at risk?" body={detail.demandImpact} />
          <NarrativeCard title="What happens if unresolved?" body={detail.noActionImpact} />
          <NarrativeCard title="Suggested replacement WO" body={detail.suggestedReplacement} />
        </Section>

        <Divider />

        <Section label="Readiness Dimension Cards">
          <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75}}>
            {detail.readinessChecks.map((check) => (
              <Box key={check.label} sx={{px: 1, py: 0.75, borderRadius: 1.5, bgcolor: 'var(--planning-surface-muted)', border: '1px solid var(--planning-border)'}}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb: check.detail ? 0.5 : 0}}>
                  <Typography sx={{fontSize: 12, fontWeight: 700, color: 'var(--planning-text-primary)'}}>{check.label}</Typography>
                  <ReadinessCheckBadge status={check.status} />
                </Stack>
                {check.detail ? <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', lineHeight: 1.45}}>{check.detail}</Typography> : null}
              </Box>
            ))}
          </Box>
        </Section>

        <Divider />

        <Section label="Evidence">
          <InfoGrid rows={detail.evidence.map((entry) => [entry.label, entry.value])} />
          <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', mt: 1}}>Source data freshness: {detail.dataFreshness}</Typography>
        </Section>

        <Divider />

        <AiInsightBlock insight={insight} onAcceptRecommendation={onAcceptRecommendation} />

        <Divider />

        <Section label="Prepared Actions">
          <Stack spacing={1}>
            {detail.preparedActions.map((action) => (
              <Box key={action.id} sx={{p: 1.15, borderRadius: 2, bgcolor: 'var(--planning-surface-muted)', border: '1px solid var(--planning-border)'}}>
                <Stack direction="row" justifyContent="space-between" spacing={1}>
                  <Box>
                    <Typography sx={{fontSize: 12, fontWeight: 800, color: 'var(--planning-text-primary)'}}>{action.label}</Typography>
                    <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', mt: 0.45}}>{action.comment}</Typography>
                  </Box>
                  {action.governed ? <GovernedBadge /> : null}
                </Stack>
                <Stack direction="row" gap={0.75} flexWrap="wrap" sx={{mt: 1}}>
                  <Button variant="contained" size="small" onClick={() => onAction(action.label)} sx={{textTransform: 'none', fontWeight: 700}}>
                    {action.confirmationLabel}
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Section>

        <Divider />

        <Section label="AI Chat / History">
          {conversation.length === 0 ? (
            <Typography sx={{fontSize: 12, color: 'var(--planning-text-muted)'}}>No conversation yet. Try one of the suggested questions.</Typography>
          ) : (
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
          )}
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
