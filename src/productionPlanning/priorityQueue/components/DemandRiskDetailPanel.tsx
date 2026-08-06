import React from 'react';
import {Box, Button, Divider, Paper, Stack, Typography} from '@mui/material';
import type {AiInsight, ConversationEntry, DemandRiskDetail, DemandRiskRow} from '../types';
import {ConfidenceBadge, GovernedBadge} from './Badges';
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

export default function DemandRiskDetailPanel({
  item,
  detail,
  insight,
  conversation,
  onAcceptRecommendation,
  onAction,
}: {
  item: DemandRiskRow;
  detail: DemandRiskDetail;
  insight: AiInsight;
  conversation: ConversationEntry[];
  onAcceptRecommendation: (rec: string) => void;
  onAction: (action: string) => void;
}) {
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
      <Box sx={{px: 2, py: 1.6, background: 'linear-gradient(135deg, #0F172A 0%, #0F766E 100%)'}}>
        <Typography sx={{fontSize: 16, fontWeight: 900, color: '#FFFFFF'}}>{detail.family}</Typography>
        <Typography sx={{fontSize: 12, color: 'rgba(255,255,255,0.78)', mt: 0.35}}>Demand Risk Drawer</Typography>
      </Box>

      <Box sx={{flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2}}>
        <Section label="Demand Summary">
          <InfoGrid rows={[
            ['Demand required', detail.demandRequired],
            ['Ready quantity', detail.readyQuantity],
            ['At-risk quantity', detail.atRiskQuantity],
            ['Recoverable quantity', detail.recoverableQuantity],
            ['Owner', item.owner],
          ]} />
        </Section>

        <Divider />

        <Section label="Constraints">
          <Stack spacing={0.6}>
            {detail.constraints.map((constraint) => (
              <Typography key={constraint} sx={{fontSize: 12, color: 'var(--planning-text-primary)', lineHeight: 1.5}}>
                {constraint}
              </Typography>
            ))}
          </Stack>
        </Section>

        <Divider />

        <Section label="Related WOs">
          <Stack direction="row" gap={0.75} flexWrap="wrap">
            {detail.relatedWos.map((wo) => (
              <Box key={wo} sx={{px: 1, py: 0.35, borderRadius: 1.5, bgcolor: 'var(--planning-neutral-bg)', border: '1px solid #BFDBFE'}}>
                <Typography sx={{fontSize: 11, fontWeight: 800, color: '#1D4ED8'}}>{wo}</Typography>
              </Box>
            ))}
          </Stack>
        </Section>

        <Divider />

        <Section label="AI Recovery Recommendation">
          <Typography sx={{fontSize: 12, color: 'var(--planning-text-primary)', lineHeight: 1.55}}>{detail.aiRecoveryRecommendation}</Typography>
          <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', mt: 0.8, lineHeight: 1.55}}>If unresolved: {detail.noActionImpact}</Typography>
          <Box sx={{mt: 1}}>
            <ConfidenceBadge confidence={item.confidence} />
          </Box>
        </Section>

        <Divider />

        <Section label="Demand Protection Actions">
          <Stack spacing={1}>
            {detail.demandProtectionActions.map((action) => (
              <Box key={action.id} sx={{p: 1.15, borderRadius: 2, bgcolor: 'var(--planning-surface-muted)', border: '1px solid var(--planning-border)'}}>
                <Stack direction="row" justifyContent="space-between" spacing={1}>
                  <Box>
                    <Typography sx={{fontSize: 12, fontWeight: 800, color: 'var(--planning-text-primary)'}}>{action.label}</Typography>
                    <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', mt: 0.45}}>{action.comment}</Typography>
                  </Box>
                  {action.governed ? <GovernedBadge /> : null}
                </Stack>
                <Button variant="contained" size="small" onClick={() => onAction(action.label)} sx={{mt: 1, textTransform: 'none', fontWeight: 700}}>
                  {action.confirmationLabel}
                </Button>
              </Box>
            ))}
          </Stack>
        </Section>

        <Divider />

        <AiInsightBlock insight={insight} onAcceptRecommendation={onAcceptRecommendation} />

        <Divider />

        <Section label="Conversation">
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
