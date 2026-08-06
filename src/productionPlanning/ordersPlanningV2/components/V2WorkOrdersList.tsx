import {useState} from 'react';
import {ExpandMore as ExpandMoreIcon, ChevronRight as ChevronRightIcon} from '@mui/icons-material';
import {Box, Chip, Divider, IconButton, LinearProgress, Stack, Tooltip, Typography} from '@mui/material';
import type {MachineWorkOrder, V2UnplannedWorkOrder} from '../types';
import {serializeDragPayload, V2_DRAG_MIME} from '../scheduleUtils';

const priorityColors: Record<string, {bg: string; color: string}> = {
  Critical: {bg: '#FEF2F2', color: '#DC2626'},
  High: {bg: '#FFF7ED', color: '#C2410C'},
  Medium: {bg: '#FFFBEB', color: '#B45309'},
  Low: {bg: '#F0FDF4', color: '#15803D'},
};

const riskColors: Record<string, string> = {
  None: '#94A3B8',
  Low: '#F59E0B',
  Medium: '#F97316',
  High: '#DC2626',
};

type Props = {
  unplanned: V2UnplannedWorkOrder[];
  planned: MachineWorkOrder[];
  isEditMode: boolean;
};

function PriorityChip({priority}: {priority: string}) {
  const c = priorityColors[priority] ?? priorityColors.Medium;
  return (
    <Chip
      label={priority}
      size="small"
      sx={{fontSize: 10, fontWeight: 700, height: 18, px: 0.5, bgcolor: c.bg, color: c.color, border: 'none'}}
    />
  );
}

function RiskDot({level, label}: {level: string; label: string}) {
  const color = riskColors[level] ?? '#94A3B8';
  return (
    <Tooltip title={`${label}: ${level}`} placement="top">
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.4}}>
        <Box sx={{width: 7, height: 7, borderRadius: '50%', bgcolor: color}} />
        <Typography sx={{fontSize: 10, color: '#8B95B5', fontWeight: 600}}>{label[0]}</Typography>
      </Box>
    </Tooltip>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function formatDateTime(isoStr: string) {
  const d = new Date(isoStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function UnplannedCard({wo, isEditMode}: {wo: V2UnplannedWorkOrder; isEditMode: boolean}) {
  return (
    <Box
      draggable={isEditMode}
      onDragStart={(event) => {
        if (!isEditMode) return;
        const payload = serializeDragPayload({source: 'unplanned', workOrderId: wo.id});
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData(V2_DRAG_MIME, payload);
        event.dataTransfer.setData('text/plain', payload);
      }}
      sx={{
        p: 1.25,
        borderRadius: 1.5,
        border: isEditMode ? '1px dashed #93C5FD' : '1px solid #E3E8F2',
        bgcolor: isEditMode ? '#F8FBFF' : '#FAFBFF',
        '&:hover': {borderColor: '#C7D2FE', bgcolor: '#F5F7FF'},
        cursor: isEditMode ? 'grab' : 'default',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
        <Typography sx={{fontSize: 11, fontWeight: 800, color: '#1769FF'}}>{wo.woNumber}</Typography>
        <PriorityChip priority={wo.priority} />
      </Stack>
      <Typography sx={{fontSize: 11, fontWeight: 600, color: '#08184A', lineHeight: 1.3}} noWrap>
        {wo.productDescription}
      </Typography>
      <Typography sx={{fontSize: 10, color: '#5B668A', mt: 0.25}}>
        {wo.quantity.toLocaleString()} {wo.uom} · {wo.durationHours}h
      </Typography>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mt={0.75}>
        <Stack direction="row" spacing={0.75}>
          <RiskDot level={wo.materialRisk} label="Material" />
          <RiskDot level={wo.qualityRisk} label="Quality" />
          <RiskDot level={wo.laborRisk} label="Labor" />
        </Stack>
        <Typography sx={{fontSize: 10, color: '#8B95B5', fontWeight: 600}}>
          Due {formatDate(wo.dueDate)}
        </Typography>
      </Stack>
    </Box>
  );
}

function PlannedCard({wo}: {wo: MachineWorkOrder}) {
  const utilPercent = Math.min(100, Math.round(wo.progressPercent ?? wo.durationHours * 10));
  const utilColor =
    utilPercent >= 90 ? '#DC2626' : utilPercent >= 75 ? '#F97316' : '#16A34A';

  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 1.5,
        border: '1px solid var(--planning-border)',
        bgcolor: 'var(--planning-surface)',
        '&:hover': {borderColor: '#C7D2FE', bgcolor: '#F5F7FF'},
        cursor: 'default',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
        <Typography sx={{fontSize: 11, fontWeight: 800, color: '#1769FF'}}>{wo.woNumber}</Typography>
        <PriorityChip priority={wo.priority} />
      </Stack>
      <Typography sx={{fontSize: 11, fontWeight: 600, color: '#08184A', lineHeight: 1.3}} noWrap>
        {wo.productDescription}
      </Typography>
      <Typography sx={{fontSize: 10, color: '#5B668A', mt: 0.25}} noWrap>
        {wo.machineName}
      </Typography>
      <Typography sx={{fontSize: 10, color: '#8B95B5', mt: 0.25}}>
        {formatDateTime(wo.plannedStartDateTime)} → {formatDateTime(wo.plannedEndDateTime)}
      </Typography>

      <Box mt={1}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.25}>
          <Typography sx={{fontSize: 10, fontWeight: 700, color: '#5B668A'}}>Capacity impact</Typography>
          <Typography sx={{fontSize: 10, fontWeight: 800, color: utilColor}}>{utilPercent}%</Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={utilPercent}
          sx={{
            height: 4,
            borderRadius: 2,
            bgcolor: '#E3E8F2',
            '& .MuiLinearProgress-bar': {bgcolor: utilColor, borderRadius: 2},
          }}
        />
      </Box>

      <Stack direction="row" spacing={0.75} mt={0.75}>
        <RiskDot level={wo.materialRisk} label="Material" />
        <RiskDot level={wo.qualityRisk} label="Quality" />
        <RiskDot level={wo.laborRisk} label="Labor" />
      </Stack>
    </Box>
  );
}

export default function V2WorkOrdersList({unplanned, planned, isEditMode}: Props) {
  const [toPlanCollapsed, setToPlanCollapsed] = useState(false);
  const [plannedCollapsed, setPlannedCollapsed] = useState(false);

  return (
    <Stack spacing={0} sx={{flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
      <Box
        sx={{px: 1.5, py: 0.75, borderBottom: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface-muted)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', '&:hover': {bgcolor: 'var(--planning-neutral-bg)'}}}
        onClick={() => setToPlanCollapsed((v) => !v)}
      >
        <Typography sx={{fontSize: 11, fontWeight: 900, color: '#5B668A', letterSpacing: '0.08em', textTransform: 'uppercase'}}>
          To Plan
          <Box component="span" sx={{ml: 1, fontWeight: 700, fontSize: 11, color: '#1769FF'}}>
            {unplanned.length}
          </Box>
        </Typography>
        <IconButton size="small" sx={{p: 0.25}} tabIndex={-1}>
          {toPlanCollapsed ? <ChevronRightIcon sx={{fontSize: 16, color: '#8B95B5'}} /> : <ExpandMoreIcon sx={{fontSize: 16, color: '#8B95B5'}} />}
        </IconButton>
      </Box>

      {!toPlanCollapsed && (
        <Box sx={{overflowY: 'auto', px: 1.25, py: 1, display: 'flex', flexDirection: 'column', gap: 0.75, flex: '0 0 auto', maxHeight: 280}}>
          {unplanned.map((wo) => (
            <UnplannedCard key={wo.id} wo={wo} isEditMode={isEditMode} />
          ))}
        </Box>
      )}

      <Divider />

      <Box
        sx={{px: 1.5, py: 0.75, borderBottom: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface-muted)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', '&:hover': {bgcolor: 'var(--planning-neutral-bg)'}}}
        onClick={() => setPlannedCollapsed((v) => !v)}
      >
        <Typography sx={{fontSize: 11, fontWeight: 900, color: '#5B668A', letterSpacing: '0.08em', textTransform: 'uppercase'}}>
          Planned
          <Box component="span" sx={{ml: 1, fontWeight: 700, fontSize: 11, color: '#16A34A'}}>
            {planned.length}
          </Box>
        </Typography>
        <IconButton size="small" sx={{p: 0.25}} tabIndex={-1}>
          {plannedCollapsed ? <ChevronRightIcon sx={{fontSize: 16, color: '#8B95B5'}} /> : <ExpandMoreIcon sx={{fontSize: 16, color: '#8B95B5'}} />}
        </IconButton>
      </Box>

      {!plannedCollapsed && (
        <Box sx={{overflowY: 'auto', px: 1.25, py: 1, display: 'flex', flexDirection: 'column', gap: 0.75, flex: 1}}>
          {planned.map((wo) => (
            <PlannedCard key={wo.id} wo={wo} />
          ))}
        </Box>
      )}
    </Stack>
  );
}
