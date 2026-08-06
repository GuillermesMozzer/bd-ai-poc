import {Close as CloseIcon} from '@mui/icons-material';
import {Box, Chip, Divider, IconButton, Paper, Stack, Typography} from '@mui/material';
import type {ApprovalHistoryEvent, ApprovalEventType, ForecastVersion} from '../types';
import {ApprovalStatusBadge, VersionTypeBadge} from './ForecastBadges';

const sectionLabelSx = {
  fontSize: 11,
  fontWeight: 800,
  color: 'var(--planning-text-secondary)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  mb: 1,
};

const metaLabelSx = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--planning-text-muted)',
  mb: 0.2,
};

const metaValueSx = {
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--planning-text-primary)',
};

function formatTs(ts: string | null) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-GB', {dateStyle: 'short', timeStyle: 'short'});
}

const timelineEventColors: Record<ApprovalEventType, string> = {
  Approved:  '#027A48',
  Submitted: '#B54708',
  Imported:  '#B54708',
  Rejected:  '#B42318',
  Revised:   '#475467',
};

function TimelineEvent({event}: {event: ApprovalHistoryEvent}) {
  const color = timelineEventColors[event.eventType];
  return (
    <Box sx={{display: 'flex', gap: 1.5, pb: 1.5, position: 'relative'}}>
      <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0}}>
        <Box sx={{width: 10, height: 10, borderRadius: '50%', bgcolor: color, mt: 0.3, zIndex: 1}} />
        <Box sx={{width: 2, bgcolor: '#E2E8F0', flex: 1, mt: 0.5}} />
      </Box>
      <Box sx={{pb: 1, minWidth: 0}}>
        <Typography sx={{fontSize: 12, fontWeight: 700, color: 'var(--planning-text-secondary)'}}>{event.eventType}</Typography>
        <Typography sx={{fontSize: 11, color: 'var(--planning-text-muted)'}}>{event.actor} · {formatTs(event.timestamp)}</Typography>
        {event.comment && (
          <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', mt: 0.5, fontStyle: 'italic'}}>{event.comment}</Typography>
        )}
      </Box>
    </Box>
  );
}

interface ForecastVersionDetailPanelProps {
  version: ForecastVersion;
  approvalHistory: ApprovalHistoryEvent[];
  onClose: () => void;
}

export default function ForecastVersionDetailPanel({version, approvalHistory, onClose}: ForecastVersionDetailPanelProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        width: 430,
        flexShrink: 0,
        borderRadius: 4,
        border: '1px solid var(--planning-border)',
        boxShadow: 'var(--planning-soft-shadow)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 200px)',
        position: 'sticky',
        top: 16,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #07143D 0%, #1D4ED8 100%)',
          px: 2,
          py: 2,
          flexShrink: 0,
        }}
      >
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1}}>
          <Box>
            <Typography sx={{fontSize: 16, fontWeight: 900, color: '#FFFFFF', fontFamily: 'monospace'}}>
              {version.id}
            </Typography>
            <Typography sx={{fontSize: 12, color: 'rgba(255,255,255,0.78)', mt: 0.3}}>
              {version.cycleLabel}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{color: 'rgba(255,255,255,0.7)', '&:hover': {color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.1)'}}}>
            <CloseIcon sx={{fontSize: 18}} />
          </IconButton>
        </Box>
        <Stack direction="row" gap={0.8}>
          <VersionTypeBadge type={version.versionType} />
          <ApprovalStatusBadge status={version.approvalStatus} />
        </Stack>
      </Box>

      {/* Scrollable body */}
      <Box sx={{overflow: 'auto', flex: 1, p: 2, display: 'flex', flexDirection: 'column', gap: 2}}>

        {/* Version Metadata */}
        <Box>
          <Typography sx={sectionLabelSx}>Version Metadata</Typography>
          <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5}}>
            <Box>
              <Typography sx={metaLabelSx}>Import Date/Time</Typography>
              <Typography sx={metaValueSx}>{formatTs(version.importedAt)}</Typography>
            </Box>
            <Box>
              <Typography sx={metaLabelSx}>Source System</Typography>
              <Typography sx={{...metaValueSx, wordBreak: 'break-word'}}>{version.sourceSystem}</Typography>
            </Box>
            <Box>
              <Typography sx={metaLabelSx}>Imported By</Typography>
              <Typography sx={metaValueSx}>{version.importedBy}</Typography>
            </Box>
            <Box>
              <Typography sx={metaLabelSx}>Approved By</Typography>
              <Typography sx={metaValueSx}>{version.approvedBy ?? '—'}</Typography>
            </Box>
            <Box>
              <Typography sx={metaLabelSx}>Approval Date</Typography>
              <Typography sx={metaValueSx}>{formatTs(version.approvalDate)}</Typography>
            </Box>
            <Box>
              <Typography sx={metaLabelSx}>Version Type</Typography>
              <Typography sx={metaValueSx}>{version.versionType}</Typography>
            </Box>
            <Box sx={{gridColumn: '1 / -1'}}>
              <Typography sx={metaLabelSx}>Change Reason</Typography>
              <Typography sx={metaValueSx}>{version.changeReason}</Typography>
            </Box>
            {version.notes && (
              <Box sx={{gridColumn: '1 / -1'}}>
                <Typography sx={metaLabelSx}>Notes</Typography>
                <Typography sx={{...metaValueSx, fontStyle: 'italic', color: 'var(--planning-text-secondary)'}}>{version.notes}</Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Divider />

        {/* Impacted Materials */}
        <Box>
          <Typography sx={sectionLabelSx}>Impacted Materials</Typography>
          {version.impactedMaterials.length > 0 ? (
            <Stack direction="row" flexWrap="wrap" gap={0.6}>
              {version.impactedMaterials.map((m) => (
                <Chip key={m} label={m} size="small" sx={{fontSize: 11, height: 22, bgcolor: 'var(--planning-neutral-bg)', color: '#1D4ED8', fontWeight: 600, border: '1px solid #BFDBFE'}} />
              ))}
            </Stack>
          ) : (
            <Typography sx={{fontSize: 12, color: 'var(--planning-text-muted)'}}>None</Typography>
          )}
        </Box>

        <Divider />

        {/* Impacted Work Orders */}
        <Box>
          <Typography sx={sectionLabelSx}>Impacted Work Orders</Typography>
          {version.impactedWOs.length > 0 ? (
            <Stack direction="row" flexWrap="wrap" gap={0.6}>
              {version.impactedWOs.map((wo) => (
                <Chip key={wo} label={wo} size="small" sx={{fontSize: 11, height: 22, bgcolor: 'var(--planning-ai-accent-bg)', color: '#6D28D9', fontWeight: 600, border: '1px solid #DDD6FE'}} />
              ))}
            </Stack>
          ) : (
            <Typography sx={{fontSize: 12, color: 'var(--planning-text-muted)'}}>None</Typography>
          )}
        </Box>

        <Divider />

        {/* Impacted Production Lines */}
        <Box>
          <Typography sx={sectionLabelSx}>Impacted Production Lines</Typography>
          {version.impactedLines.length > 0 ? (
            <Stack direction="row" flexWrap="wrap" gap={0.6}>
              {version.impactedLines.map((l) => (
                <Chip key={l} label={l} size="small" sx={{fontSize: 11, height: 22, bgcolor: '#ECFDF3', color: '#027A48', fontWeight: 600, border: '1px solid #ABEFC6'}} />
              ))}
            </Stack>
          ) : (
            <Typography sx={{fontSize: 12, color: 'var(--planning-text-muted)'}}>None</Typography>
          )}
        </Box>

        <Divider />

        {/* Approval History */}
        <Box>
          <Typography sx={sectionLabelSx}>Approval History</Typography>
          {approvalHistory.length > 0 ? (
            <Box>
              {approvalHistory.map((event) => (
                <TimelineEvent key={event.id} event={event} />
              ))}
            </Box>
          ) : (
            <Typography sx={{fontSize: 12, color: 'var(--planning-text-muted)'}}>No history recorded.</Typography>
          )}
        </Box>

      </Box>
    </Paper>
  );
}
