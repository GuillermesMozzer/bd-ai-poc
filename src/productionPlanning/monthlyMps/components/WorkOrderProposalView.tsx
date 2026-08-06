import {
  Assignment as AssignmentIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon,
  HelpOutline as HelpOutlineIcon,
  PendingActions as PendingActionsIcon,
  ThumbDown as ThumbDownIcon,
  ThumbUp as ThumbUpIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {useMemo, useState} from 'react';
import type {
  WorkOrderProposal,
  WorkOrderProposalAuditEvent,
  WorkOrderProposalFiltersState,
} from '../types';
import {
  calculateProposalSelectionSummary,
  calculateWorkOrderProposalKpis,
  canApproveProposal,
  filterWorkOrderProposals,
} from '../workOrderProposalUtils';

const tones = {
  green: {bg: '#ECFDF3', color: '#027A48', border: '#ABEFC6'},
  blue: {bg: '#EFF6FF', color: '#1769FF', border: '#BFDBFE'},
  orange: {bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA'},
  red: {bg: '#FEF2F2', color: '#B42318', border: '#FECDCA'},
  gray: {bg: '#F8FAFC', color: 'var(--planning-text-secondary)', border: '#D0D5DD'},
  purple: {bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE'},
  yellow: {bg: '#FEFCE8', color: '#854D0E', border: '#FEF08A'},
};

const STATUS_TONE: Record<string, keyof typeof tones> = {
  PendingReview: 'blue',
  ApprovedForCreation: 'green',
  Rejected: 'red',
  NeedsReview: 'orange',
  Blocked: 'red',
};

const STATUS_LABEL: Record<string, string> = {
  PendingReview: 'Pending Review',
  ApprovedForCreation: 'Approved',
  Rejected: 'Rejected',
  NeedsReview: 'Needs Review',
  Blocked: 'Blocked',
};

const PRIORITY_TONE: Record<string, keyof typeof tones> = {
  Critical: 'red',
  High: 'orange',
  Medium: 'blue',
  Low: 'gray',
};

const READINESS_TONE: Record<string, keyof typeof tones> = {
  Ready: 'green',
  Warning: 'orange',
  Blocked: 'red',
  NotChecked: 'gray',
};

const CAPACITY_TONE: Record<string, keyof typeof tones> = {
  Feasible: 'green',
  AtRisk: 'orange',
  Overloaded: 'red',
  MissingData: 'gray',
};

const MATERIAL_TONE: Record<string, keyof typeof tones> = {
  None: 'green',
  Low: 'yellow',
  Medium: 'orange',
  High: 'red',
};

const CONFIDENCE_TONE: Record<string, keyof typeof tones> = {
  High: 'green',
  Medium: 'blue',
  Low: 'orange',
};

function ProposalStatusBadge({status}: {status: string}) {
  const tone = tones[STATUS_TONE[status] ?? 'gray'];
  return (
    <Chip
      label={STATUS_LABEL[status] ?? status}
      size="small"
      sx={{height: 22, fontSize: 11, fontWeight: 800, bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`}}
    />
  );
}

function PriorityBadge({priority}: {priority: string}) {
  const tone = tones[PRIORITY_TONE[priority] ?? 'gray'];
  return (
    <Chip label={priority} size="small" sx={{height: 22, fontSize: 11, fontWeight: 800, bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`}} />
  );
}

function ReadinessBadge({status}: {status: string}) {
  const tone = tones[READINESS_TONE[status] ?? 'gray'];
  return (
    <Chip label={status} size="small" sx={{height: 22, fontSize: 11, fontWeight: 700, bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`}} />
  );
}

function CapacityBadge({status}: {status: string}) {
  const tone = tones[CAPACITY_TONE[status] ?? 'gray'];
  return (
    <Chip label={status} size="small" sx={{height: 22, fontSize: 11, fontWeight: 700, bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`}} />
  );
}

function MaterialRiskBadge({risk}: {risk: string}) {
  if (risk === 'None') return <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)'}}>—</Typography>;
  const tone = tones[MATERIAL_TONE[risk] ?? 'gray'];
  return (
    <Chip label={risk} size="small" sx={{height: 22, fontSize: 11, fontWeight: 700, bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`}} />
  );
}

function AiConfidenceBadge({confidence}: {confidence: string}) {
  const tone = tones[CONFIDENCE_TONE[confidence] ?? 'gray'];
  return (
    <Chip label={confidence} size="small" sx={{height: 22, fontSize: 11, fontWeight: 700, bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`}} />
  );
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false});
}

function formatDateOnly(s: string) {
  return new Date(s).toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
}

const DEFAULT_FILTERS: WorkOrderProposalFiltersState = {
  status: '',
  product: '',
  line: '',
  priority: '',
  readinessPreview: '',
  capacityStatus: '',
  materialRisk: '',
  aiConfidence: '',
  showNeedsReview: false,
  showBlocked: false,
};

type Props = {
  open: boolean;
  proposals: WorkOrderProposal[];
  auditEvents: WorkOrderProposalAuditEvent[];
  planId: string;
  onApproveProposal: (id: string) => void;
  onRejectProposal: (id: string, reason: string) => void;
  onApproveSelected: (ids: string[]) => void;
  onRejectSelected: (ids: string[], reason: string) => void;
  onConfirmApproved: () => void;
  onClose: () => void;
};

export default function WorkOrderProposalView({
  open,
  proposals,
  auditEvents: _auditEvents,
  planId: _planId,
  onApproveProposal,
  onRejectProposal,
  onApproveSelected,
  onRejectSelected,
  onConfirmApproved,
  onClose,
}: Props) {
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<WorkOrderProposalFiltersState>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [rejectDialogState, setRejectDialogState] = useState<{open: boolean; proposalId: string | null; reason: string}>({open: false, proposalId: null, reason: ''});
  const [batchRejectState, setBatchRejectState] = useState<{open: boolean; reason: string}>({open: false, reason: ''});
  const [confirmApprovedOpen, setConfirmApprovedOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const kpis = useMemo(() => calculateWorkOrderProposalKpis(proposals), [proposals]);
  const filtered = useMemo(() => filterWorkOrderProposals(proposals, filters), [proposals, filters]);
  const selectionSummary = useMemo(() => {
    const proposalsWithSelection = proposals.map((p) => ({...p, selected: selectedIds.has(p.id)}));
    return calculateProposalSelectionSummary(proposalsWithSelection);
  }, [proposals, selectedIds]);

  const selectedProposal = proposals.find((p) => p.id === selectedProposalId) ?? null;

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllPending() {
    const eligible = filtered.filter((p) => p.status === 'PendingReview' || p.status === 'NeedsReview');
    setSelectedIds(new Set(eligible.map((p) => p.id)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function handleRowClick(id: string) {
    setSelectedProposalId(id === selectedProposalId ? null : id);
  }

  function handleApproveSelected() {
    onApproveSelected(Array.from(selectedIds));
    setSelectedIds(new Set());
    setSuccessMessage(`Approved ${selectionSummary.approveEligible} proposal(s)`);
  }

  function handleBatchRejectConfirm() {
    if (!batchRejectState.reason.trim()) return;
    onRejectSelected(Array.from(selectedIds), batchRejectState.reason.trim());
    setSelectedIds(new Set());
    setBatchRejectState({open: false, reason: ''});
    setSuccessMessage(`Rejected ${selectionSummary.rejectEligible} proposal(s)`);
  }

  function handleIndividualApprove(id: string) {
    onApproveProposal(id);
    setSuccessMessage('Proposal approved');
  }

  function handleRejectDialogConfirm() {
    if (!rejectDialogState.proposalId || !rejectDialogState.reason.trim()) return;
    onRejectProposal(rejectDialogState.proposalId, rejectDialogState.reason.trim());
    setRejectDialogState({open: false, proposalId: null, reason: ''});
    setSuccessMessage('Proposal rejected');
  }

  function handleConfirmApproved() {
    onConfirmApproved();
    setConfirmApprovedOpen(false);
    setSuccessMessage('Approved proposals confirmed locally. No real Work Orders were created.');
  }

  const totalQtyFormatted = kpis.totalQty >= 1000000
    ? `${(kpis.totalQty / 1000000).toFixed(1)}M`
    : kpis.totalQty >= 1000
      ? `${(kpis.totalQty / 1000).toFixed(0)}K`
      : String(kpis.totalQty);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl" PaperProps={{sx: {height: '95vh', display: 'flex', flexDirection: 'column', borderRadius: 3}}}>
      {/* Header */}
      <DialogTitle sx={{pb: 0, flexShrink: 0}}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography sx={{fontSize: 11, color: '#6D28D9', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>
              Released MPS
            </Typography>
            <Typography sx={{fontSize: 22, fontWeight: 900, color: 'var(--planning-text-primary)', mt: 0.3}}>
              Recommended Planned Orders
            </Typography>
            <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', mt: 0.4}}>
              AI-generated Work Order candidates from the released Monthly MPS. Review and approve before creation.
            </Typography>
            <Box sx={{mt: 0.8, px: 1.2, py: 0.5, bgcolor: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 1.5, display: 'inline-block'}}>
              <Typography sx={{fontSize: 11.5, color: '#C2410C', fontWeight: 700}}>
                No real Work Orders will be created in this front-end demo.
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{mt: -0.5}}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', px: 3, pt: 1.5, pb: 0}}>
        {/* KPI Cards */}
        <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 1, mb: 2, flexShrink: 0}}>
          <KpiCard label="Total" value={kpis.total} icon={<AssignmentIcon sx={{fontSize: 18, color: '#6D28D9'}} />} tone="purple" />
          <KpiCard label="Pending" value={kpis.pendingReview} icon={<PendingActionsIcon sx={{fontSize: 18, color: '#1769FF'}} />} tone="blue" />
          <KpiCard label="Approved" value={kpis.approvedForCreation} icon={<CheckCircleIcon sx={{fontSize: 18, color: '#027A48'}} />} tone="green" />
          <KpiCard label="Rejected" value={kpis.rejected} icon={<ThumbDownIcon sx={{fontSize: 18, color: '#B42318'}} />} tone="red" />
          <KpiCard label="Needs Review" value={kpis.needsReview} icon={<WarningAmberIcon sx={{fontSize: 18, color: '#C2410C'}} />} tone="orange" />
          <KpiCard label="Blocked" value={kpis.blocked} icon={<BlockIcon sx={{fontSize: 18, color: '#B42318'}} />} tone="red" />
          <KpiCard label="Total Qty" value={totalQtyFormatted} icon={<AssignmentIcon sx={{fontSize: 18, color: 'var(--planning-text-secondary)'}} />} tone="gray" />
          <KpiCard label="High/Critical" value={kpis.highCriticalCount} icon={<WarningAmberIcon sx={{fontSize: 18, color: '#B54708'}} />} tone="orange" />
        </Box>

        {/* Filters row */}
        <Box sx={{flexShrink: 0, mb: 1.5}}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" rowGap={0.8}>
            <TextField
              size="small"
              placeholder="Search product..."
              value={filters.product}
              onChange={(e) => setFilters((f) => ({...f, product: e.target.value}))}
              sx={{width: 170, '& .MuiOutlinedInput-root': {borderRadius: 2, fontSize: 12}}}
            />
            <FilterSelect label="Status" value={filters.status} options={['PendingReview', 'ApprovedForCreation', 'Rejected', 'NeedsReview', 'Blocked']} onChange={(v) => setFilters((f) => ({...f, status: v}))} />
            <FilterSelect label="Line" value={filters.line} options={['Line 10', 'Line 20', 'Line 30']} onChange={(v) => setFilters((f) => ({...f, line: v}))} />
            <FilterSelect label="Priority" value={filters.priority} options={['Critical', 'High', 'Medium', 'Low']} onChange={(v) => setFilters((f) => ({...f, priority: v}))} />
            <FilterSelect label="Readiness" value={filters.readinessPreview} options={['Ready', 'Warning', 'Blocked', 'NotChecked']} onChange={(v) => setFilters((f) => ({...f, readinessPreview: v}))} />
            <FilterSelect label="AI Confidence" value={filters.aiConfidence} options={['High', 'Medium', 'Low']} onChange={(v) => setFilters((f) => ({...f, aiConfidence: v}))} />
            {(filters.product || filters.status || filters.line || filters.priority || filters.readinessPreview || filters.aiConfidence) ? (
              <Button size="small" onClick={() => setFilters(DEFAULT_FILTERS)} sx={{fontSize: 11, fontWeight: 700, textTransform: 'none', color: 'var(--planning-text-secondary)'}}>
                Clear filters
              </Button>
            ) : null}
          </Stack>
        </Box>

        {/* Batch actions */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{mb: 1, flexShrink: 0}} flexWrap="wrap">
          <Button
            size="small"
            variant="contained"
            startIcon={<ThumbUpIcon sx={{fontSize: 13}} />}
            disabled={selectionSummary.approveEligible === 0}
            onClick={handleApproveSelected}
            sx={{fontSize: 12, fontWeight: 800, textTransform: 'none', bgcolor: '#1769FF', '&:hover': {bgcolor: '#1769FF'}}}
          >
            Approve Selected
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<ThumbDownIcon sx={{fontSize: 13}} />}
            disabled={selectionSummary.rejectEligible === 0}
            onClick={() => setBatchRejectState({open: true, reason: ''})}
            sx={{fontSize: 12, fontWeight: 800, textTransform: 'none'}}
          >
            Reject Selected
          </Button>
          <Button size="small" variant="outlined" onClick={selectAllPending} sx={{fontSize: 12, fontWeight: 700, textTransform: 'none'}}>
            Select All Pending
          </Button>
          <Button size="small" variant="text" onClick={clearSelection} disabled={selectedIds.size === 0} sx={{fontSize: 12, fontWeight: 700, textTransform: 'none', color: 'var(--planning-text-secondary)'}}>
            Clear Selection
          </Button>
          {selectedIds.size > 0 ? (
            <Chip label={`${selectedIds.size} selected`} size="small" sx={{fontWeight: 800, bgcolor: 'var(--planning-neutral-bg)', color: '#1769FF', border: '1px solid #BFDBFE'}} />
          ) : null}
        </Stack>

        {/* Main content: table + detail panel */}
        <Box sx={{flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: selectedProposal ? '1fr 380px' : '1fr', gap: 2}}>
          {/* Table */}
          <TableContainer component={Paper} elevation={0} sx={{border: '1px solid var(--planning-border)', borderRadius: 2, overflow: 'auto'}}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{'& .MuiTableCell-head': {bgcolor: 'var(--planning-surface-muted)', fontWeight: 800, fontSize: 11, color: 'var(--planning-text-secondary)', py: 1}}}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      indeterminate={selectedIds.size > 0 && selectedIds.size < filtered.filter((p) => p.status !== 'Blocked').length}
                      checked={filtered.filter((p) => p.status !== 'Blocked').length > 0 && filtered.filter((p) => p.status !== 'Blocked').every((p) => selectedIds.has(p.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(new Set(filtered.filter((p) => p.status !== 'Blocked').map((p) => p.id)));
                        } else {
                          setSelectedIds(new Set());
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Proposal #</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Line</TableCell>
                  <TableCell>Planned Start</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Readiness</TableCell>
                  <TableCell>Capacity</TableCell>
                  <TableCell>Material Risk</TableCell>
                  <TableCell>AI Confidence</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((proposal) => {
                  const isSelected = selectedProposalId === proposal.id;
                  const isChecked = selectedIds.has(proposal.id);
                  return (
                    <TableRow
                      key={proposal.id}
                      hover
                      selected={isSelected}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: isSelected ? '#EFF6FF' : undefined,
                        '&.Mui-selected': {bgcolor: 'var(--planning-neutral-bg)'},
                        '&:hover': {bgcolor: isSelected ? '#EFF6FF' : '#F8FAFC'},
                      }}
                      onClick={() => handleRowClick(proposal.id)}
                    >
                      <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          size="small"
                          checked={isChecked}
                          disabled={proposal.status === 'Blocked'}
                          onChange={() => toggleSelect(proposal.id)}
                        />
                      </TableCell>
                      <TableCell sx={{fontSize: 12, fontWeight: 800, color: '#1769FF', whiteSpace: 'nowrap'}}>{proposal.proposalNumber}</TableCell>
                      <TableCell sx={{fontSize: 12}}>
                        <Box>
                          <Typography sx={{fontSize: 12, fontWeight: 700, color: 'var(--planning-text-primary)'}}>{proposal.productCode}</Typography>
                          <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)'}}>{proposal.productDescription}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{fontSize: 12, whiteSpace: 'nowrap'}}>{proposal.proposedQuantity.toLocaleString()} {proposal.uom}</TableCell>
                      <TableCell sx={{fontSize: 12}}>{proposal.proposedLineName}</TableCell>
                      <TableCell sx={{fontSize: 11, whiteSpace: 'nowrap'}}>{formatDateShort(proposal.plannedStartDateTime)}</TableCell>
                      <TableCell sx={{fontSize: 12}}>{proposal.durationHours}h</TableCell>
                      <TableCell sx={{fontSize: 11}}>{formatDateOnly(proposal.dueDate)}</TableCell>
                      <TableCell><PriorityBadge priority={proposal.priority} /></TableCell>
                      <TableCell><ReadinessBadge status={proposal.readinessPreview} /></TableCell>
                      <TableCell><CapacityBadge status={proposal.capacityStatus} /></TableCell>
                      <TableCell><MaterialRiskBadge risk={proposal.materialRisk} /></TableCell>
                      <TableCell><AiConfidenceBadge confidence={proposal.aiConfidence} /></TableCell>
                      <TableCell><ProposalStatusBadge status={proposal.status} /></TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title={proposal.status === 'Blocked' ? 'Blocked proposals require issue resolution before approval' : canApproveProposal(proposal) ? 'Approve' : 'Already approved/rejected'}>
                            <span>
                              <IconButton
                                size="small"
                                disabled={!canApproveProposal(proposal)}
                                onClick={() => handleIndividualApprove(proposal.id)}
                                sx={{color: '#027A48', '&.Mui-disabled': {color: '#D1FAE5'}}}
                              >
                                <ThumbUpIcon sx={{fontSize: 14}} />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title={proposal.status === 'Rejected' ? 'Already rejected' : 'Reject'}>
                            <span>
                              <IconButton
                                size="small"
                                disabled={proposal.status === 'Rejected'}
                                onClick={() => setRejectDialogState({open: true, proposalId: proposal.id, reason: ''})}
                                sx={{color: '#B42318', '&.Mui-disabled': {color: '#FCA5A5'}}}
                              >
                                <ThumbDownIcon sx={{fontSize: 14}} />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={15} sx={{textAlign: 'center', py: 4, color: 'var(--planning-text-muted)', fontSize: 13}}>
                      No proposals match the current filters.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Detail panel */}
          {selectedProposal ? (
            <Paper elevation={0} sx={{border: '1px solid var(--planning-border)', borderRadius: 2, overflow: 'auto', p: 2}}>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography sx={{fontSize: 16, fontWeight: 900, color: 'var(--planning-text-primary)'}}>{selectedProposal.proposalNumber}</Typography>
                    <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', mt: 0.3}}>{selectedProposal.productCode} — {selectedProposal.productDescription}</Typography>
                  </Box>
                  <ProposalStatusBadge status={selectedProposal.status} />
                </Stack>

                <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1}}>
                  <DetailField label="Quantity" value={`${selectedProposal.proposedQuantity.toLocaleString()} ${selectedProposal.uom}`} />
                  <DetailField label="Line" value={selectedProposal.proposedLineName} />
                  <DetailField label="Start" value={formatDateShort(selectedProposal.plannedStartDateTime)} />
                  <DetailField label="End" value={formatDateShort(selectedProposal.plannedEndDateTime)} />
                  <DetailField label="Duration" value={`${selectedProposal.durationHours}h`} />
                  <DetailField label="Due Date" value={formatDateOnly(selectedProposal.dueDate)} />
                </Box>

                <Stack direction="row" flexWrap="wrap" gap={0.8}>
                  <PriorityBadge priority={selectedProposal.priority} />
                  <ReadinessBadge status={selectedProposal.readinessPreview} />
                  <CapacityBadge status={selectedProposal.capacityStatus} />
                  <AiConfidenceBadge confidence={selectedProposal.aiConfidence} />
                  {selectedProposal.materialRisk !== 'None' ? <MaterialRiskBadge risk={selectedProposal.materialRisk} /> : null}
                </Stack>

                <Divider />

                {/* AI Reasoning */}
                <Box sx={{bgcolor: 'var(--planning-surface-muted)', border: '1px solid #BFDBFE', borderRadius: 2, p: 1.4}}>
                  <Stack direction="row" alignItems="center" spacing={0.8} sx={{mb: 0.8}}>
                    <HelpOutlineIcon sx={{fontSize: 15, color: '#1769FF'}} />
                    <Typography sx={{fontSize: 11, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em'}}>
                      AI Reasoning
                    </Typography>
                  </Stack>
                  <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-primary)', lineHeight: 1.7}}>
                    {selectedProposal.aiReasoning}
                  </Typography>
                </Box>

                <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1}}>
                  <DetailField label="Inventory Impact" value={selectedProposal.inventoryImpact} />
                  <DetailField label="Source MPS Bucket" value={selectedProposal.sourceMpsBucketId} />
                </Box>

                {selectedProposal.constraintNotes ? (
                  <Box sx={{bgcolor: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 2, p: 1.2}}>
                    <Typography sx={{fontSize: 11, fontWeight: 800, color: '#B54708', mb: 0.4}}>Constraint Notes</Typography>
                    <Typography sx={{fontSize: 12, color: '#92400E', lineHeight: 1.6}}>{selectedProposal.constraintNotes}</Typography>
                  </Box>
                ) : null}

                <Box>
                  <Typography sx={{fontSize: 11, fontWeight: 800, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5}}>Expected Impact</Typography>
                  <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-primary)', lineHeight: 1.6}}>{selectedProposal.expectedImpact}</Typography>
                </Box>

                {selectedProposal.rejectionReason ? (
                  <Box sx={{bgcolor: '#FEF2F2', border: '1px solid #FECDCA', borderRadius: 2, p: 1.2}}>
                    <Typography sx={{fontSize: 11, fontWeight: 800, color: '#B42318', mb: 0.3}}>Rejection Reason</Typography>
                    <Typography sx={{fontSize: 12, color: '#B42318', lineHeight: 1.6}}>{selectedProposal.rejectionReason}</Typography>
                  </Box>
                ) : null}

                {selectedProposal.approvedBy ? (
                  <Typography sx={{fontSize: 11, color: '#027A48'}}>
                    Approved by {selectedProposal.approvedBy} on {new Date(selectedProposal.approvedAt!).toLocaleString()}
                  </Typography>
                ) : null}

                <Divider />

                <Stack direction="row" spacing={1}>
                  <Tooltip title={selectedProposal.status === 'Blocked' ? 'Blocked proposals require issue resolution before approval' : !canApproveProposal(selectedProposal) ? 'Already approved or rejected' : ''}>
                    <span>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<ThumbUpIcon sx={{fontSize: 13}} />}
                        disabled={!canApproveProposal(selectedProposal)}
                        onClick={() => handleIndividualApprove(selectedProposal.id)}
                        sx={{fontSize: 12, fontWeight: 800, textTransform: 'none', bgcolor: '#1769FF', '&:hover': {bgcolor: '#1769FF'}}}
                      >
                        Approve
                      </Button>
                    </span>
                  </Tooltip>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<ThumbDownIcon sx={{fontSize: 13}} />}
                    disabled={selectedProposal.status === 'Rejected'}
                    onClick={() => setRejectDialogState({open: true, proposalId: selectedProposal.id, reason: ''})}
                    sx={{fontSize: 12, fontWeight: 800, textTransform: 'none'}}
                  >
                    Reject
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ) : null}
        </Box>
      </DialogContent>

      {/* Footer */}
      <Box sx={{flexShrink: 0, px: 3, py: 2, borderTop: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface-muted)'}}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <FooterStat label="Approved" value={kpis.approvedForCreation} color="#027A48" />
            <FooterStat label="Rejected" value={kpis.rejected} color="#B42318" />
            <FooterStat label="Pending" value={kpis.pendingReview} color="#1D4ED8" />
            <FooterStat label="Needs Review" value={kpis.needsReview} color="#C2410C" />
            <FooterStat label="Blocked" value={kpis.blocked} color="#B42318" />
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              disabled={kpis.approvedForCreation === 0}
              onClick={() => setConfirmApprovedOpen(true)}
              sx={{fontSize: 13, fontWeight: 800, textTransform: 'none', bgcolor: '#6D28D9', '&:hover': {bgcolor: '#5B21B6'}}}
            >
              Confirm Approved Proposals
            </Button>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{fontSize: 13, fontWeight: 800, textTransform: 'none', color: 'var(--planning-text-secondary)', borderColor: '#D0D5DD'}}
            >
              Back to MPS
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Reject individual dialog */}
      <Dialog open={rejectDialogState.open} onClose={() => setRejectDialogState({open: false, proposalId: null, reason: ''})} fullWidth maxWidth="sm">
        <DialogTitle sx={{fontWeight: 900}}>Reject Work Order Proposal</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', lineHeight: 1.6, mb: 1.5}}>
            Provide a reason for rejecting this Work Order proposal.
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Rejection reason *"
            value={rejectDialogState.reason}
            onChange={(e) => setRejectDialogState((s) => ({...s, reason: e.target.value}))}
            placeholder="e.g. Material risk not resolved — defer to next planning cycle"
            sx={{'& .MuiOutlinedInput-root': {borderRadius: 2}}}
          />
        </DialogContent>
        <DialogActions sx={{p: 2}}>
          <Button onClick={() => setRejectDialogState({open: false, proposalId: null, reason: ''})} sx={{textTransform: 'none', fontWeight: 800}}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={!rejectDialogState.reason.trim()}
            onClick={handleRejectDialogConfirm}
            sx={{textTransform: 'none', fontWeight: 800}}
          >
            Reject proposal
          </Button>
        </DialogActions>
      </Dialog>

      {/* Batch reject dialog */}
      <Dialog open={batchRejectState.open} onClose={() => setBatchRejectState({open: false, reason: ''})} fullWidth maxWidth="sm">
        <DialogTitle sx={{fontWeight: 900}}>Reject Selected Proposals</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', lineHeight: 1.6, mb: 1.5}}>
            Reject {selectionSummary.rejectEligible} selected Work Order proposals. A reason is required.
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Rejection reason *"
            value={batchRejectState.reason}
            onChange={(e) => setBatchRejectState((s) => ({...s, reason: e.target.value}))}
            placeholder="e.g. Capacity constraints require replanning in next cycle"
            sx={{'& .MuiOutlinedInput-root': {borderRadius: 2}}}
          />
        </DialogContent>
        <DialogActions sx={{p: 2}}>
          <Button onClick={() => setBatchRejectState({open: false, reason: ''})} sx={{textTransform: 'none', fontWeight: 800}}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={!batchRejectState.reason.trim()}
            onClick={handleBatchRejectConfirm}
            sx={{textTransform: 'none', fontWeight: 800}}
          >
            Reject selected
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Approved dialog */}
      <Dialog open={confirmApprovedOpen} onClose={() => setConfirmApprovedOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{fontWeight: 900}}>Confirm Approved Proposals</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', lineHeight: 1.6}}>
            This will mark {kpis.approvedForCreation} approved proposal(s) as ready for Work Order creation.
          </Typography>
          <Box sx={{mt: 1.5, p: 1.2, bgcolor: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 2}}>
            <Typography sx={{fontSize: 12.5, color: '#C2410C', fontWeight: 700}}>
              No real Work Orders will be created. This is a front-end local confirmation only.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{p: 2}}>
          <Button onClick={() => setConfirmApprovedOpen(false)} sx={{textTransform: 'none', fontWeight: 800}}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleConfirmApproved}
            sx={{textTransform: 'none', fontWeight: 800, bgcolor: '#6D28D9', '&:hover': {bgcolor: '#5B21B6'}}}
          >
            Confirm approved proposals
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
      >
        <Alert severity="success" onClose={() => setSuccessMessage(null)} sx={{fontWeight: 700}}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}

function KpiCard({label, value, icon, tone}: {label: string; value: number | string; icon: React.ReactNode; tone: keyof typeof tones}) {
  const t = tones[tone];
  return (
    <Paper elevation={0} sx={{p: 1.2, border: `1px solid ${t.border}`, borderRadius: 2, bgcolor: t.bg}}>
      <Stack direction="row" alignItems="center" spacing={0.8} sx={{mb: 0.5}}>
        {icon}
        <Typography sx={{fontSize: 11, fontWeight: 700, color: t.color}}>{label}</Typography>
      </Stack>
      <Typography sx={{fontSize: 22, fontWeight: 900, color: t.color}}>{value}</Typography>
    </Paper>
  );
}

function DetailField({label, value}: {label: string; value: string}) {
  return (
    <Box>
      <Typography sx={{fontSize: 10.5, fontWeight: 800, color: 'var(--planning-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em'}}>{label}</Typography>
      <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-primary)', mt: 0.2}}>{value}</Typography>
    </Box>
  );
}

function FooterStat({label, value, color}: {label: string; value: number; color: string}) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6}}>
      <Typography sx={{fontSize: 16, fontWeight: 900, color}}>{value}</Typography>
      <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{label}</Typography>
    </Box>
  );
}

function FilterSelect({label, value, options, onChange}: {label: string; value: string; options: string[]; onChange: (v: string) => void}) {
  return (
    <FormControl size="small" sx={{minWidth: 130}}>
      <InputLabel sx={{fontSize: 12}}>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value)}
        sx={{fontSize: 12, borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': {borderRadius: 2}}}
      >
        <MenuItem value="" sx={{fontSize: 12}}>All</MenuItem>
        {options.map((o) => <MenuItem key={o} value={o} sx={{fontSize: 12}}>{o}</MenuItem>)}
      </Select>
    </FormControl>
  );
}
