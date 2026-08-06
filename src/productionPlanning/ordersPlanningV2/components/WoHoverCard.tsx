import {Box, Button, Chip, Divider, Paper, Popper, Typography} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Inventory2 as Inventory2Icon,
  OpenInNew as OpenInNewIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

export type WoTimelineEvent = {
  id: string;
  type: 'production' | 'changeover' | 'downtime';
  subtype?: 'machine_breakdown' | 'planned_downtime' | 'maintenance';
  label: string;
  start: string;
  end: string;
  duration: string;
  reason?: string;
  impact?: string;
};

export type WoHoverData = {
  woId: string;
  status: string;
  product: string;
  item: string;
  batch: string;
  quantity: string;
  lineMachine: string;
  scheduledStart: string;
  scheduledEnd: string;
  requiredRunTime: string;
  events: WoTimelineEvent[];
};

export const mockWoHoverData: WoHoverData = {
  woId: 'WO-350021',
  status: 'Planned',
  product: 'Family A',
  item: '301656',
  batch: 'B-78451',
  quantity: '500,000 units',
  lineMachine: 'Line 10',
  scheduledStart: 'Tue 13 May, 12:00',
  scheduledEnd: 'Tue 13 May, 20:30',
  requiredRunTime: '6h 15m',
  events: [
    {
      id: 'evt-001',
      type: 'changeover',
      label: 'Changeover',
      start: '06:30',
      end: '07:15',
      duration: '45m',
      reason: 'Format change',
    },
    {
      id: 'evt-002',
      type: 'downtime',
      subtype: 'machine_breakdown',
      label: 'Machine Breakdown',
      start: '08:00',
      end: '10:30',
      duration: '2h 30m',
      reason: 'Unexpected machine stoppage',
      impact: 'WO start delayed',
    },
    {
      id: 'evt-003',
      type: 'production',
      label: 'WO-350021',
      start: '12:00',
      end: '20:30',
      duration: '8h 30m',
      reason: 'Production window',
    },
    {
      id: 'evt-004',
      type: 'changeover',
      label: 'Changeover',
      start: '20:30',
      end: '21:15',
      duration: '45m',
      reason: 'Product family change',
    },
  ],
};

const woStatusColors: Record<string, {bg: string; border: string; text: string}> = {
  Running: {bg: '#DCFCE7', border: '#16A34A', text: '#15803D'},
  Released: {bg: '#DBEAFE', border: '#2563EB', text: '#1D4ED8'},
  Ready: {bg: '#E0F2FE', border: '#0284C7', text: '#0369A1'},
  Planned: {bg: '#EEF2FF', border: '#6366F1', text: '#4338CA'},
  Blocked: {bg: '#FEE2E2', border: '#DC2626', text: '#B91C1C'},
  OnHold: {bg: '#FEF3C7', border: '#D97706', text: '#92400E'},
  Paused: {bg: '#F3F4F6', border: '#6B7280', text: '#374151'},
  Completed: {bg: '#F0FDF4', border: '#86EFAC', text: '#15803D'},
};

const GANTT_START_HOUR = 6;
const GANTT_END_HOUR = 22;
const GANTT_TOTAL_HOURS = GANTT_END_HOUR - GANTT_START_HOUR;
const GANTT_TIME_MARKERS = [6, 10, 14, 18, 22];

const eventColors: Record<WoTimelineEvent['type'], {bg: string; border: string; text: string}> = {
  production: {bg: '#EEF2FF', border: '#6366F1', text: '#4338CA'},
  changeover: {bg: '#FEF3C7', border: '#F59E0B', text: '#78350F'},
  downtime: {bg: '#FEE2E2', border: '#DC2626', text: '#B91C1C'},
};

function timeToFraction(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return ((h + m / 60) - GANTT_START_HOUR) / GANTT_TOTAL_HOURS;
}

function MiniGantt({events}: {events: WoTimelineEvent[]}) {
  const barH = 18;
  const svgH = barH + 20;

  return (
    <Box>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75}}>
        <TimelineIcon sx={{fontSize: 12, color: '#6366F1'}} />
        <Typography sx={{fontSize: 10, fontWeight: 800, color: '#08184A', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
          WO Event Timeline
        </Typography>
      </Box>

      <Box sx={{position: 'relative', width: '100%'}}>
        <svg
          width="100%"
          viewBox={`0 0 340 ${svgH}`}
          preserveAspectRatio="none"
          style={{display: 'block', overflow: 'visible'}}
        >
          {/* Background track */}
          <rect x={0} y={0} width={340} height={barH} rx={3} fill="#F1F5F9" />

          {/* Event bars */}
          {events.map((evt) => {
            const x1 = timeToFraction(evt.start) * 340;
            const x2 = timeToFraction(evt.end) * 340;
            const w = Math.max(x2 - x1, 4);
            const cfg = eventColors[evt.type];
            return (
              <g key={evt.id}>
                <rect x={x1} y={0} width={w} height={barH} rx={2} fill={cfg.bg} stroke={cfg.border} strokeWidth={1} />
                {w > 32 && (
                  <text x={x1 + 4} y={barH / 2 + 4} fontSize={8} fontWeight={700} fill={cfg.text} clipPath={`inset(0 ${340 - x1 - w}px 0 0)`}>
                    {evt.duration}
                  </text>
                )}
              </g>
            );
          })}

          {/* Time markers */}
          {GANTT_TIME_MARKERS.map((hour) => {
            const x = ((hour - GANTT_START_HOUR) / GANTT_TOTAL_HOURS) * 340;
            return (
              <g key={hour}>
                <line x1={x} y1={0} x2={x} y2={barH} stroke="#CBD5E1" strokeWidth={0.5} strokeDasharray="2,2" />
                <text x={x} y={svgH} fontSize={8} textAnchor="middle" fill="#94A3B8" fontWeight={600}>
                  {`${hour}:00`}
                </text>
              </g>
            );
          })}
        </svg>
      </Box>

      {/* Legend */}
      <Box sx={{display: 'flex', gap: 1.5, mt: 1}}>
        {(['production', 'changeover', 'downtime'] as const).map((type) => {
          const cfg = eventColors[type];
          const labels: Record<string, string> = {production: 'Production', changeover: 'Changeover', downtime: 'Machine Breakdown'};
          return (
            <Box key={type} sx={{display: 'flex', alignItems: 'center', gap: 0.4}}>
              <Box sx={{width: 8, height: 8, borderRadius: 0.5, bgcolor: cfg.bg, border: `1.5px solid ${cfg.border}`, flexShrink: 0}} />
              <Typography sx={{fontSize: 9, color: 'var(--planning-text-secondary)', fontWeight: 600}}>{labels[type]}</Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

type InfoRowProps = {label: string; value: string; icon?: React.ReactNode};
function InfoRow({label, value, icon}: InfoRowProps) {
  return (
    <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 0.5, minWidth: 0}}>
      {icon && <Box sx={{mt: 0.1, color: 'var(--planning-text-muted)', display: 'flex', flexShrink: 0}}>{icon}</Box>}
      <Box sx={{minWidth: 0}}>
        <Typography sx={{fontSize: 9, color: 'var(--planning-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.2}}>
          {label}
        </Typography>
        <Typography sx={{fontSize: 10, color: '#08184A', fontWeight: 700, lineHeight: 1.3}}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

type Props = {
  anchorEl: HTMLElement | null;
  data: WoHoverData;
  onOpenWo?: () => void;
  onViewTimeline?: () => void;
};

export default function WoHoverCard({anchorEl, data, onOpenWo, onViewTimeline}: Props) {
  const open = Boolean(anchorEl);
  const statusColors = woStatusColors[data.status] ?? woStatusColors.Planned;
  const downtimeEvents = data.events.filter((e) => e.type === 'downtime');

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="right-start"
      modifiers={[
        {name: 'offset', options: {offset: [0, 8]}},
        {name: 'flip', options: {fallbackPlacements: ['left-start', 'right-end', 'left-end']}},
        {name: 'preventOverflow', options: {padding: 12}},
      ]}
      style={{zIndex: 1500}}
    >
      <Paper
        elevation={8}
        sx={{
          width: 360,
          bgcolor: 'var(--planning-surface)',
          border: '1px solid var(--planning-border)',
          borderRadius: 2,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {/* Header */}
        <Box sx={{px: 1.5, pt: 1.25, pb: 1, borderBottom: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface-muted)'}}>
          <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
            <Typography sx={{fontSize: 13, fontWeight: 900, color: '#08184A', letterSpacing: '-0.01em'}}>
              {data.woId}
            </Typography>
            <Chip
              label={data.status}
              size="small"
              sx={{
                fontSize: 9,
                height: 18,
                fontWeight: 800,
                bgcolor: statusColors.bg,
                color: statusColors.text,
                border: `1px solid ${statusColors.border}`,
              }}
            />
          </Box>
        </Box>

        {/* Basic WO data */}
        <Box sx={{px: 1.5, py: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75}}>
          <InfoRow
            label="Product / Item"
            value={`${data.product} / ${data.item}`}
            icon={<Inventory2Icon sx={{fontSize: 11}} />}
          />
          <InfoRow label="Batch" value={data.batch} />
          <InfoRow label="Quantity" value={data.quantity} />
          <InfoRow label="Line / Machine" value={data.lineMachine} />
          <Box sx={{gridColumn: '1 / -1'}}>
            <InfoRow
              label="Scheduled"
              value={`${data.scheduledStart} – ${data.scheduledEnd}`}
              icon={<AccessTimeIcon sx={{fontSize: 11}} />}
            />
          </Box>
          <InfoRow label="Required Run Time" value={data.requiredRunTime} />
        </Box>

        <Divider sx={{borderColor: '#F1F5F9'}} />

        {/* Mini Gantt */}
        <Box sx={{px: 1.5, py: 1}}>
          <MiniGantt events={data.events} />
        </Box>

        {/* Downtime summary */}
        {downtimeEvents.length > 0 && (
          <>
            <Divider sx={{borderColor: '#F1F5F9'}} />
            <Box sx={{px: 1.5, py: 1, bgcolor: '#FFF5F5'}}>
              {downtimeEvents.map((evt) => (
                <Box key={evt.id} sx={{display: 'flex', gap: 0.75, alignItems: 'flex-start'}}>
                  <WarningIcon sx={{fontSize: 13, color: '#DC2626', mt: 0.2, flexShrink: 0}} />
                  <Box>
                    <Typography sx={{fontSize: 10, fontWeight: 800, color: '#B91C1C', lineHeight: 1.3}}>
                      {evt.label}
                    </Typography>
                    <Typography sx={{fontSize: 9, color: '#6B7280', lineHeight: 1.4}}>
                      {evt.start}–{evt.end} · {evt.duration}
                    </Typography>
                    {evt.impact && (
                      <Typography sx={{fontSize: 9, color: '#DC2626', fontWeight: 600, lineHeight: 1.4}}>
                        Impact: {evt.impact}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </>
        )}

        <Divider sx={{borderColor: '#F1F5F9'}} />

        {/* Footer actions */}
        <Box
          sx={{
            px: 1.5,
            py: 0.75,
            display: 'flex',
            gap: 1,
            bgcolor: 'var(--planning-surface-muted)',
            pointerEvents: 'auto',
          }}
        >
          <Button
            size="small"
            variant="outlined"
            startIcon={<OpenInNewIcon sx={{fontSize: 12}} />}
            onClick={onOpenWo}
            sx={{fontSize: 10, height: 26, px: 1, py: 0, textTransform: 'none', fontWeight: 700, borderColor: '#CBD5E1', color: '#374151', '&:hover': {borderColor: '#6366F1', color: '#4338CA', bgcolor: 'var(--planning-ai-accent-bg)'}}}
          >
            Open WO
          </Button>
          <Button
            size="small"
            variant="text"
            startIcon={<TimelineIcon sx={{fontSize: 12}} />}
            onClick={onViewTimeline}
            sx={{fontSize: 10, height: 26, px: 1, py: 0, textTransform: 'none', fontWeight: 700, color: 'var(--planning-text-secondary)', '&:hover': {color: '#4338CA', bgcolor: 'var(--planning-ai-accent-bg)'}}}
          >
            View full timeline
          </Button>
        </Box>
      </Paper>
    </Popper>
  );
}
