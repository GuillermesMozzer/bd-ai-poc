import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
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
  Typography,
} from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import PlaylistAddCheckOutlinedIcon from '@mui/icons-material/PlaylistAddCheckOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import LogisticsPageShell from '../components/LogisticsPageShell';
import KpiRow from '../components/KpiRow';
import PanelCard from '../components/PanelCard';
import { StatusPill } from '../components/StatusPill';
import { logisticsData } from '../data/logisticsMockData';
import { lx } from '../themeTokens';

const BD_BLUE = '#194890';
const BD_BLUE_SOFT = 'rgba(25, 72, 144, 0.08)';
const BD_ORANGE = '#F07822';

type PortalSection =
  | 'dashboard'
  | 'request'
  | 'identity'
  | 'assessment'
  | 'custody'
  | 'status'
  | 'evidence'
  | 'issue';

type SkuLine = {
  orderLine: string;
  palletNumber: string;
  sku: string;
  description: string;
  expectedQty: number;
  receivedQty: number;
  uom: string;
};

type QueueItem = {
  object: string;
  type: 'Load' | 'Pallet' | 'Return';
  orderType: 'PO' | 'STO';
  orderRef: string;
  skuLines: SkuLine[];
  context: string;
  nextAction: string;
  status: 'Requested' | 'Confirmed' | 'Assessment' | 'Return gate' | 'Approved' | 'In custody' | 'Issue';
  sla: string;
  target: PortalSection;
};

const sections: Array<{
  id: PortalSection;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    subtitle: 'Partner-facing queue for transfer requests and open follow-up work.',
    icon: <InsightsOutlinedIcon fontSize="small" />,
  },
  {
    id: 'request',
    label: 'Transfer request',
    subtitle: 'Acknowledge, accept, or reject the controlled request package.',
    icon: <AssignmentTurnedInIcon fontSize="small" />,
  },
  {
    id: 'identity',
    label: 'Vehicle / driver',
    subtitle: 'Confirm appointment, driver, vehicle, trailer, and capacity.',
    icon: <DirectionsCarFilledOutlinedIcon fontSize="small" />,
  },
  {
    id: 'assessment',
    label: 'Assessment',
    subtitle: 'Approve quantitative SKU quantities and qualitative PO/STO documents before ASN closure.',
    icon: <FactCheckOutlinedIcon fontSize="small" />,
  },
];

const receivingOnlySections = [
  {
    id: 'custody',
    label: 'Custody transfer',
    subtitle: 'Record shared proof that responsibility transferred at a known time and place.',
    icon: <HandshakeOutlinedIcon fontSize="small" />,
  },
  {
    id: 'status',
    label: 'Status / cycle',
    subtitle: 'Submit structured lifecycle events with sequence and retry control.',
    icon: <PlaylistAddCheckOutlinedIcon fontSize="small" />,
  },
  {
    id: 'evidence',
    label: 'Evidence / return',
    subtitle: 'Attach required partner evidence to the correct transfer object.',
    icon: <FileUploadOutlinedIcon fontSize="small" />,
  },
  {
    id: 'issue',
    label: 'Discrepancy',
    subtitle: 'Route custody, identity, timing, and evidence issues to the right owner.',
    icon: <ErrorOutlineIcon fontSize="small" />,
  },
];

const queue: QueueItem[] = [
  {
    object: 'TR-1048 / Load L-58241',
    type: 'Load',
    orderType: 'PO',
    orderRef: 'PO-4501182741',
    skuLines: [
      { orderLine: '10', palletNumber: 'P-77101 - P-77108', sku: 'SKU-100184', description: 'Catheter tray sterile pouch', expectedQty: 1200, receivedQty: 1200, uom: 'EA' },
      { orderLine: '20', palletNumber: 'P-77109 - P-77114', sku: 'SKU-100299', description: 'Introducer kit carton', expectedQty: 640, receivedQty: 640, uom: 'EA' },
      { orderLine: '30', palletNumber: 'P-77115 - P-77118', sku: 'SKU-100377', description: 'Procedure pack shipper', expectedQty: 180, receivedQty: 180, uom: 'CS' },
    ],
    context: 'BD El Paso supplier receipt, 18 pallets, pickup Jul 28 08:00',
    nextAction: 'Accept transfer request',
    status: 'Requested',
    sla: 'Due today',
    target: 'request',
  },
  {
    object: 'TR-1047 / Load L-58216',
    type: 'Load',
    orderType: 'STO',
    orderRef: 'STO-68100422',
    skuLines: [
      { orderLine: '10', palletNumber: 'P-77042 - P-77051', sku: 'SKU-220441', description: 'Needle hub component', expectedQty: 2400, receivedQty: 2400, uom: 'EA' },
      { orderLine: '20', palletNumber: 'P-77052 - P-77054', sku: 'SKU-220879', description: 'Finished good case', expectedQty: 96, receivedQty: 96, uom: 'CS' },
    ],
    context: 'BD Columbus West to BD El Paso, vehicle assigned, driver credential pending',
    nextAction: 'Confirm driver identity',
    status: 'Confirmed',
    sla: 'Due in 2h',
    target: 'identity',
  },
  {
    object: 'TR-1039 / Load L-58190',
    type: 'Load',
    orderType: 'PO',
    orderRef: 'PO-4501181988',
    skuLines: [
      { orderLine: '10', palletNumber: 'P-76980 - P-76983', sku: 'SKU-331021', description: 'Resin lot bag', expectedQty: 80, receivedQty: 78, uom: 'BAG' },
      { orderLine: '20', palletNumber: 'P-76984', sku: 'SKU-331077', description: 'Packaging insert bundle', expectedQty: 400, receivedQty: 400, uom: 'EA' },
    ],
    context: 'Supplier ASN has quantity variance on resin lot bag',
    nextAction: 'Review quantitative return gate',
    status: 'Return gate',
    sla: 'Due tomorrow',
    target: 'assessment',
  },
  {
    object: 'TR-1033 / Load L-58172',
    type: 'Load',
    orderType: 'STO',
    orderRef: 'STO-68100377',
    skuLines: [
      { orderLine: '10', palletNumber: 'P-76871 - P-76872', sku: 'SKU-440118', description: 'Line clearance kit', expectedQty: 32, receivedQty: 32, uom: 'KIT' },
      { orderLine: '20', palletNumber: 'P-76873', sku: 'SKU-440221', description: 'Label roll case', expectedQty: 12, receivedQty: 12, uom: 'CS' },
    ],
    context: 'BD site transfer ready for qualitative document review',
    nextAction: 'Approve assessment',
    status: 'Assessment',
    sla: 'Due in 4h',
    target: 'assessment',
  },
];

const flowSteps = [
  { label: 'Request', helper: 'PO/STO-linked ASN package', state: 'done' },
  { label: 'SKU quantities', helper: 'Expected quantity per SKU', state: 'done' },
  { label: 'Identity', helper: 'Driver and capacity', state: 'active' },
  { label: 'Assessment', helper: 'Quantitative + document gates', state: 'default' },
  { label: 'Return gate', helper: 'Only when variance or document gap exists', state: 'blocked' },
] as const;

const evidenceItems = [
  'Provider cycle report',
  'Delivery or return photo',
  'Seal verification',
  'Exception-free statement',
] as const;

const qualitativeDocumentItems = [
  'Certificate of Conformance (CoC)',
  'Certificate of Analysis (CoA)',
  'Bill of Lading (BOL)',
  'Packing list',
] as const;

function statusTone(status: QueueItem['status']) {
  if (status === 'Issue') return 'danger' as const;
  if (status === 'Requested') return 'warn' as const;
  if (status === 'Assessment') return 'default' as const;
  if (status === 'Return gate') return 'danger' as const;
  if (status === 'In custody') return 'default' as const;
  return 'ok' as const;
}

function flowTone(state: (typeof flowSteps)[number]['state']) {
  if (state === 'done') return { color: lx.ok, bg: lx.okSoft, border: 'rgba(16,185,129,0.35)' };
  if (state === 'active') return { color: BD_BLUE, bg: BD_BLUE_SOFT, border: 'rgba(25,72,144,0.35)' };
  if (state === 'blocked') return { color: lx.danger, bg: lx.dangerSoft, border: 'rgba(239,68,68,0.35)' };
  return { color: lx.textMuted, bg: lx.soft, border: lx.border };
}

function MetricPair({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box
      sx={{
        border: `1px solid ${lx.border}`,
        bgcolor: lx.soft,
        borderRadius: 2,
        p: 1.2,
        minHeight: 70,
      }}
    >
      <Typography variant="caption" sx={{ color: lx.textMuted, fontWeight: 800, textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: lx.text, fontWeight: 800, mt: 0.6 }}>
        {value}
      </Typography>
    </Box>
  );
}

function ReviewCard({
  title,
  children,
  fullHeight = false,
}: {
  title: string;
  children: React.ReactNode;
  fullHeight?: boolean;
}) {
  return (
    <Box sx={{ border: `1px solid ${lx.border}`, borderRadius: 2, bgcolor: lx.soft, p: 1.5, height: fullHeight ? '100%' : 'auto' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>
        {title}
      </Typography>
      <Stack spacing={1} sx={{ height: fullHeight ? 'calc(100% - 28px)' : 'auto' }}>
        {children}
      </Stack>
    </Box>
  );
}

function SkuLineReview({
  lines,
  showReceived = false,
}: {
  lines: SkuLine[];
  showReceived?: boolean;
}) {
  return (
    <TableContainer
      sx={{
        border: `1px solid ${lx.border}`,
        borderRadius: 2,
        bgcolor: '#fff',
      }}
    >
      <Table
        size="small"
        aria-label="SKU quantities by pallet"
        sx={{
          '& .MuiTableCell-head': { py: 1.15 },
          '& .MuiTableCell-body': { py: 1.45 },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 900 }}>SKU</TableCell>
            <TableCell sx={{ fontWeight: 900 }}>Material</TableCell>
            <TableCell sx={{ fontWeight: 900 }}>Pallet</TableCell>
            <TableCell align="right" sx={{ fontWeight: 900, whiteSpace: 'nowrap' }}>Expected qty</TableCell>
            {showReceived ? (
              <>
                <TableCell align="right" sx={{ fontWeight: 900, whiteSpace: 'nowrap' }}>Received qty</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Result</TableCell>
              </>
            ) : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {lines.map((line) => {
            const variance = line.expectedQty !== line.receivedQty;
            const varianceQty = line.receivedQty - line.expectedQty;
            return (
              <TableRow key={`${line.orderLine}-${line.sku}`} hover sx={{ bgcolor: variance ? lx.warnSoft : 'inherit' }}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 900, color: lx.text }}>
                    {line.sku}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: lx.textMuted, lineHeight: 1.45 }}>
                    {line.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {line.palletNumber}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 900 }}>
                    {line.expectedQty.toLocaleString()} {line.uom}
                  </Typography>
                </TableCell>
                {showReceived ? (
                  <>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 900 }}>
                        {line.receivedQty.toLocaleString()} {line.uom}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusPill
                        label={variance ? `${varianceQty > 0 ? '+' : ''}${varianceQty.toLocaleString()} ${line.uom}` : 'Match'}
                        tone={variance ? 'warn' : 'ok'}
                      />
                    </TableCell>
                  </>
                ) : null}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function SectionNav({
  active,
  onChange,
}: {
  active: PortalSection;
  onChange: (section: PortalSection) => void;
}) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: `repeat(${sections.length}, minmax(0, 1fr))` }, gap: 1 }}>
      {sections.map((section) => {
        const selected = active === section.id;
        return (
          <Box
            component="button"
            key={section.id}
            onClick={() => onChange(section.id)}
            sx={{
              appearance: 'none',
              border: `1px solid ${selected ? BD_BLUE : lx.border}`,
              borderRadius: 2,
              bgcolor: selected ? BD_BLUE_SOFT : '#fff',
              cursor: 'pointer',
              p: 1.2,
              textAlign: 'left',
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 1,
              alignItems: 'start',
              '&:hover': {
                bgcolor: BD_BLUE_SOFT,
                borderColor: BD_BLUE,
              },
            }}
          >
            <Box>
              <Stack direction="row" spacing={0.7} alignItems="center">
                <Box sx={{ display: 'flex', color: selected ? BD_BLUE : lx.textMuted }}>
                  {section.icon}
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 900, color: lx.text }}>
                  {section.label}
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: lx.textMuted, display: 'block', mt: 0.4 }}>
                {section.subtitle}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

export default function ExternalTransferPortalPage() {
  const [active, setActive] = useState<PortalSection>('dashboard');
  const [statusFilter, setStatusFilter] = useState('all');
  const [objectFilter, setObjectFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [requestDecision, setRequestDecision] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [driverCredential, setDriverCredential] = useState('DL-885204');
  const [vehicleId, setVehicleId] = useState('TRACTOR-302');
  const [handoffCode, setHandoffCode] = useState('DOCK-A3-58241');
  const [sealId, setSealId] = useState('SEAL-91028');
  const [statusCode, setStatusCode] = useState('CYCLE_STARTED');
  const [sequence, setSequence] = useState('3');
  const [evidenceChecked, setEvidenceChecked] = useState<Record<string, boolean>>({
    'Provider cycle report': false,
    'Delivery or return photo': false,
    'Seal verification': true,
    'Exception-free statement': false,
  });
  const [evidenceRef, setEvidenceRef] = useState('L-58241');
  const [fileName, setFileName] = useState('');
  const [issueCode, setIssueCode] = useState('MISSING_EVIDENCE');
  const [issueSeverity, setIssueSeverity] = useState('Medium');
  const [issueSummary, setIssueSummary] = useState('');
  const [quantityApproved, setQuantityApproved] = useState(false);
  const [documentApproved, setDocumentApproved] = useState(false);
  const [quantityReturnGate, setQuantityReturnGate] = useState<'none' | 'review' | 'return'>('none');
  const [documentReturnGate, setDocumentReturnGate] = useState<'none' | 'review' | 'return'>('none');
  const [documentChecked, setDocumentChecked] = useState<Record<string, boolean>>({
    'Certificate of Conformance (CoC)': true,
    'Certificate of Analysis (CoA)': true,
    'Bill of Lading (BOL)': false,
    'Packing list': true,
  });

  const selectedSection = sections.find((section) => section.id === active) ?? sections[0];
  const activeTransfer = queue[0];
  const quantityVarianceCount = activeTransfer.skuLines.filter((line) => line.expectedQty !== line.receivedQty).length;
  const documentReadyCount = qualitativeDocumentItems.filter((item) => documentChecked[item]).length;
  const documentProgress = Math.round((documentReadyCount / qualitativeDocumentItems.length) * 100);
  const documentsComplete = documentReadyCount === qualitativeDocumentItems.length;
  const assessmentComplete = quantityApproved && documentApproved && quantityReturnGate !== 'return' && documentReturnGate !== 'return';

  const filteredQueue = useMemo(() => {
    const q = search.trim().toLowerCase();
    return queue.filter((item) => {
      const statusMatch = statusFilter === 'all' || item.status === statusFilter;
      const objectMatch = objectFilter === 'all' || item.type === objectFilter;
      const skuText = item.skuLines.map((line) => `${line.sku} ${line.description}`).join(' ');
      const textMatch = !q || `${item.object} ${item.orderRef} ${skuText} ${item.context} ${item.nextAction}`.toLowerCase().includes(q);
      return statusMatch && objectMatch && textMatch;
    });
  }, [objectFilter, search, statusFilter]);

  const evidenceReadyCount = evidenceItems.filter((item) => evidenceChecked[item]).length;
  const evidenceProgress = Math.round((evidenceReadyCount / evidenceItems.length) * 100);
  const evidenceComplete = evidenceReadyCount === evidenceItems.length;

  const issueOwner = useMemo(() => {
    const map: Record<string, { owner: string; sla: string }> = {
      CRITICAL_DAMAGE: { owner: 'Quality and shipment readiness leads', sla: '1 business hour' },
      LOST_CUSTODY: { owner: 'Security, Quality, and logistics owner', sla: 'Immediate' },
      REJECTED_LOAD: { owner: 'Shipment readiness lead', sla: '2 business hours' },
      MISSING_EVIDENCE: { owner: 'External tracker coordinator', sla: '4 business hours' },
      IDENTITY_MISMATCH: { owner: 'Dock coordinator and carrier admin', sla: '1 business hour' },
      DELAYED_RETURN: { owner: 'Sterilization tracker coordinator', sla: '4 business hours' },
    };
    const next = map[issueCode] ?? map.MISSING_EVIDENCE;
    return issueSeverity === 'Critical' ? { ...next, sla: 'Immediate' } : next;
  }, [issueCode, issueSeverity]);

  const statusPayload = useMemo(
    () => ({
      transferRequestId: 'TR-1048',
      objectReference: 'L-58241',
      statusCode,
      milestoneTimestamp: '2026-07-28T12:05',
      expectedCompletion: '2026-07-29T17:00',
      sequence: Number(sequence || 0),
      idempotencyKey: `TR-1048-L-58241-SEQ-${sequence || '0'}`,
      note: 'Partner-visible lifecycle update only',
    }),
    [sequence, statusCode],
  );

  const notify = (message: string) => setToast(message);

  const submitRequest = () => {
    if (!requestDecision) {
      notify('Select a request response before submitting.');
      return;
    }
    if (requestDecision === 'Reject request' && !rejectReason.trim()) {
      notify('Rejecting a request requires a partner-visible reason.');
      return;
    }
    notify('Request response submitted with partner-visible payload and audit event.');
    setActive('identity');
  };

  const confirmIdentity = () => {
    if (!driverCredential.trim() || !vehicleId.trim()) {
      notify('Driver credential and vehicle ID are required before confirmation.');
      return;
    }
    notify('Driver, vehicle, authentication method, and capacity confirmation recorded.');
    setActive('assessment');
  };

  const approveAssessment = () => {
    if (!quantityApproved) {
      notify('Quantitative assessment must be approved before ASN closure.');
      return;
    }
    if (!documentApproved) {
      notify('Qualitative document assessment must be approved before ASN closure.');
      return;
    }
    if (quantityReturnGate === 'return' || documentReturnGate === 'return') {
      notify('Return gate is active. ASN cannot be closed until the return decision is resolved.');
      return;
    }
    notify('Assessment approved. PO/STO quantities and required documents are ready for receiving handoff.');
    setActive('dashboard');
  };

  const submitEvidence = () => {
    if (!evidenceRef.trim() || !fileName.trim()) {
      notify('Object reference and file name are required before evidence submit.');
      return;
    }
    if (evidenceRef !== 'L-58241') {
      notify('Wrong object state: evidence cannot submit until the reference matches L-58241.');
      return;
    }
    notify(evidenceComplete ? 'Evidence package complete and linked to L-58241.' : 'Evidence uploaded, but the checklist remains incomplete.');
    setActive('issue');
  };

  const acceptCustody = () => {
    notify('Custody accepted. Handoff proof and reconciliation event recorded.');
    setActive('status');
  };

  const sendStatus = () => {
    notify('Structured status event accepted for downstream consumption.');
    setActive('evidence');
  };

  const submitIssue = () => {
    if (!issueCode || !issueSummary.trim()) {
      notify('Issue code and concise summary are required before routing.');
      return;
    }
    notify('Issue submitted to owner queue with SLA, context, and audit payload.');
    setActive('dashboard');
  };

  const closeWithoutDiscrepancy = () => {
    setIssueSummary('');
    notify('Transfer closed with no discrepancy. Final review recorded.');
    setActive('dashboard');
  };

  const dashboard = (
    <Stack spacing={2}>
      <KpiRow
        items={[
          { label: 'Open transfer requests', value: 4, helper: '2 need acknowledgement today' },
          { label: 'Identity confirmations', value: 3, helper: '1 driver credential expires soon' },
          { label: 'Assessment pending', value: 2, tone: 'warn', helper: 'Quantity and document gates' },
          { label: 'Return gates', value: 1, tone: 'danger', helper: 'Quantity variance or document gap' },
          { label: 'Loads at provider', value: logisticsData.executive_kpis.loads_at_provider, helper: 'Receiving owns custody/status later' },
          { label: 'Provider tenant', value: 'A', helper: 'Sandbox external view' },
        ]}
      />

      <PanelCard
        title="Transfer work queue"
        action={
          <Button variant="contained" size="small" onClick={() => setActive('request')} sx={{ bgcolor: BD_ORANGE, '&:hover': { bgcolor: BD_BLUE } }}>
            New request
          </Button>
        }
      >
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <MenuItem value="all">All statuses</MenuItem>
              <MenuItem value="Requested">Requested</MenuItem>
              <MenuItem value="Confirmed">Confirmed</MenuItem>
              <MenuItem value="Assessment">Assessment</MenuItem>
              <MenuItem value="Return gate">Return gate</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Object type</InputLabel>
            <Select label="Object type" value={objectFilter} onChange={(event) => setObjectFilter(event.target.value)}>
              <MenuItem value="all">All objects</MenuItem>
              <MenuItem value="Load">Load</MenuItem>
              <MenuItem value="Pallet">Pallet</MenuItem>
              <MenuItem value="Return">Return</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size="small"
            label="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ID, PO/STO, SKU, lane, driver, vehicle"
            sx={{ minWidth: { xs: 1, md: 280 } }}
          />
          <Button
            variant="outlined"
            onClick={() => {
              setStatusFilter('all');
              setObjectFilter('all');
              setSearch('');
            }}
          >
            Reset
          </Button>
        </Stack>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Object</TableCell>
                <TableCell>PO/STO</TableCell>
                <TableCell>SKU quantities</TableCell>
                <TableCell>Partner-visible context</TableCell>
                <TableCell>Next action</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>SLA</TableCell>
                <TableCell align="right">Open</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredQueue.map((item) => (
                <TableRow key={item.object} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {item.object}
                    </Typography>
                    <Chip size="small" label={item.type} sx={{ mt: 0.6, height: 22, fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 900 }}>
                      {item.orderRef}
                    </Typography>
                    <Chip size="small" label={item.orderType} sx={{ mt: 0.6, height: 22, fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>
                    {item.skuLines.map((line) => (
                      <Typography key={line.sku} variant="caption" sx={{ display: 'block', color: lx.textMuted }}>
                        {line.sku}: {line.expectedQty.toLocaleString()} {line.uom}
                      </Typography>
                    ))}
                  </TableCell>
                  <TableCell>{item.context}</TableCell>
                  <TableCell>{item.nextAction}</TableCell>
                  <TableCell>
                    <StatusPill label={item.status} tone={statusTone(item.status)} />
                  </TableCell>
                  <TableCell>{item.sla}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => setActive(item.target)}>
                      Open
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredQueue.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ color: lx.textMuted, py: 3 }}>
                    No transfer objects match the current filters.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      </PanelCard>

      <PanelCard title="End-to-end partner flow">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(5, 1fr)' },
            gap: 1.2,
          }}
        >
          {flowSteps.map((step, index) => {
            const tone = flowTone(step.state);
            return (
              <Box key={step.label} sx={{ border: `1px solid ${tone.border}`, bgcolor: tone.bg, borderRadius: 2, p: 1.4 }}>
                <Typography variant="caption" sx={{ color: tone.color, fontWeight: 900 }}>
                  {index + 1}. {step.label}
                </Typography>
                <Typography variant="body2" sx={{ color: lx.textMuted, mt: 0.5 }}>
                  {step.helper}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </PanelCard>
    </Stack>
  );

  const request = (
    <PanelCard
      title="Transfer request"
      action={<StatusPill label="Action needed" tone="warn" />}
    >
      <Stack spacing={2}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Transfer Request must be linked to either a purchase order (PO) or a stock transfer order (STO), and each PO/STO line carries the expected quantity by SKU.
        </Alert>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 1.2 }}>
          <MetricPair label="Order reference" value={`${activeTransfer.orderType} ${activeTransfer.orderRef}`} />
          <MetricPair label="Pickup window" value="Jul 28, 08:00 to 10:00" />
          <MetricPair label="Route" value="BD El Paso to SteriTech El Paso" />
          <MetricPair label="Load" value="18 pallets, sealed load" />
        </Box>
        <Box
          sx={{
            border: `1px solid ${lx.border}`,
            borderRadius: 2,
            bgcolor: '#fff',
          }}
        >
          <Box
            sx={{
              px: 1.5,
              py: 1.2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1,
              flexWrap: 'wrap',
              bgcolor: BD_BLUE_SOFT,
              borderBottom: `1px solid ${lx.border}`,
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: BD_BLUE }}>
                Order lines to expect
              </Typography>
              <Typography variant="caption" sx={{ color: lx.textMuted }}>
                Confirm the SKU and quantity package before accepting the transfer.
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
              <Chip size="small" label={`${activeTransfer.skuLines.length} SKU lines`} sx={{ fontWeight: 800 }} />
              <Chip size="small" label={`${activeTransfer.orderType} ${activeTransfer.orderRef}`} sx={{ fontWeight: 800, bgcolor: '#fff' }} />
            </Stack>
          </Box>
          <Box sx={{ p: 1.2 }}>
            <SkuLineReview lines={activeTransfer.skuLines} />
          </Box>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
          <Stack spacing={1.5}>
            <FormControl size="small" fullWidth>
              <InputLabel>Response</InputLabel>
              <Select label="Response" value={requestDecision} onChange={(event) => setRequestDecision(event.target.value)}>
                <MenuItem value="">Select response</MenuItem>
                <MenuItem value="Accept request">Accept request</MenuItem>
                <MenuItem value="Acknowledge only">Acknowledge only</MenuItem>
                <MenuItem value="Reject request">Reject request</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Partner-visible reason"
              size="small"
              multiline
              minRows={3}
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Required only when rejecting."
            />
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button variant="outlined" onClick={() => notify('Draft saved for partner review.')}>
                Save draft
              </Button>
              <Button variant="contained" onClick={submitRequest} sx={{ bgcolor: BD_BLUE, '&:hover': { bgcolor: BD_ORANGE } }}>
                Submit response
              </Button>
            </Stack>
          </Stack>
          <ReviewCard title="Operator review">
            <MetricPair label="Transfer" value="TR-1048 / Load L-58241" />
            <MetricPair label="Linked order" value={`${activeTransfer.orderType} ${activeTransfer.orderRef}`} />
            <MetricPair label="Response to send" value={requestDecision || 'Select a response'} />
            <MetricPair label="Visible note" value={rejectReason || 'No partner-visible reason added'} />
            <Typography variant="caption" sx={{ color: lx.textMuted }}>
              Only the transfer reference, response, and partner-visible reason are shared. Internal quality notes stay hidden.
            </Typography>
          </ReviewCard>
        </Box>
      </Stack>
    </PanelCard>
  );

  const identity = (
    <PanelCard title="Vehicle and driver confirmation" action={<StatusPill label="Confirmed request" tone="ok" />}>
      <Stack spacing={2}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 1.2 }}>
          <MetricPair label="Appointment" value="Jul 28, 08:00 - Dock A" />
          <MetricPair label="Carrier" value={logisticsData.carriers['CAR-220'].name} />
          <MetricPair label="Capacity" value="48 ft trailer / 18 pallet slots" />
          <MetricPair label="Auth method" value="Portal credential + dock code" />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 1.5 }}>
          <TextField size="small" label="Driver name" defaultValue="Marisol Reyes" />
          <TextField size="small" label="Driver credential" value={driverCredential} onChange={(event) => setDriverCredential(event.target.value)} />
          <TextField size="small" label="Vehicle ID" value={vehicleId} onChange={(event) => setVehicleId(event.target.value)} />
          <TextField size="small" label="Trailer ID" defaultValue="TRL-7718" />
        </Box>
        <Stack direction="row" justifyContent="flex-end" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            variant="outlined"
            color="warning"
            onClick={() => {
              setDriverCredential('');
              notify('Mismatch state: missing credential blocks confirmation and opens a discrepancy path.');
            }}
          >
            Simulate mismatch
          </Button>
          <Button variant="contained" startIcon={<FactCheckOutlinedIcon />} onClick={confirmIdentity} sx={{ bgcolor: BD_BLUE, '&:hover': { bgcolor: BD_ORANGE } }}>
            Confirm identity
          </Button>
        </Stack>
      </Stack>
    </PanelCard>
  );

  const assessment = (
    <PanelCard
      title="Quantitative and document assessment"
      action={<StatusPill label={assessmentComplete ? 'Approved' : 'Approval needed'} tone={assessmentComplete ? 'ok' : 'warn'} />}
    >
      <Stack spacing={2}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          This ASN step validates the upstream order package before receiving. Custody handoff, receiving status, evidence upload, and discrepancies move to the Receiving flow.
        </Alert>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2, alignItems: 'stretch' }}>
          <Stack spacing={1.5} sx={{ height: '100%' }}>
            <ReviewCard title="Quantitative assessment" fullHeight>
              <MetricPair label="Order" value={`${activeTransfer.orderType} ${activeTransfer.orderRef}`} />
              <MetricPair label="Variance lines" value={quantityVarianceCount} />
              <SkuLineReview lines={activeTransfer.skuLines} showReceived />
              <FormControl size="small" fullWidth>
                <InputLabel>Quantity return gate</InputLabel>
                <Select label="Quantity return gate" value={quantityReturnGate} onChange={(event) => setQuantityReturnGate(event.target.value as typeof quantityReturnGate)}>
                  <MenuItem value="none">No return gate</MenuItem>
                  <MenuItem value="review">Needs receiving review</MenuItem>
                  <MenuItem value="return">Return required</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ mt: 'auto', pt: 1 }}>
                <Button
                  fullWidth
                  variant={quantityApproved ? 'contained' : 'outlined'}
                  onClick={() => setQuantityApproved((current) => !current)}
                  sx={quantityApproved ? { bgcolor: BD_BLUE, '&:hover': { bgcolor: BD_ORANGE } } : undefined}
                >
                  {quantityApproved ? 'Quantitative assessment approved' : 'Approve quantitative assessment'}
                </Button>
              </Box>
            </ReviewCard>
          </Stack>
          <Stack spacing={1.5} sx={{ height: '100%' }}>
            <ReviewCard title="Qualitative document assessment" fullHeight>
              <MetricPair label="Required documents" value="CoC, CoA, BOL, packing list" />
              <MetricPair label="Document readiness" value={`${documentReadyCount} of ${qualitativeDocumentItems.length} ready`} />
              <LinearProgress
                variant="determinate"
                value={documentProgress}
                sx={{
                  height: 8,
                  borderRadius: 99,
                  bgcolor: BD_BLUE_SOFT,
                  '& .MuiLinearProgress-bar': { bgcolor: BD_BLUE },
                }}
              />
              {qualitativeDocumentItems.map((item) => (
                <Box
                  key={item}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto',
                    gap: 1,
                    alignItems: 'center',
                    border: `1px solid ${lx.border}`,
                    borderRadius: 2,
                    p: 1,
                  }}
                >
                  <Checkbox
                    checked={Boolean(documentChecked[item])}
                    onChange={(event) => setDocumentChecked((current) => ({ ...current, [item]: event.target.checked }))}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {item}
                  </Typography>
                  <StatusPill label={documentChecked[item] ? 'Ready' : 'Missing'} tone={documentChecked[item] ? 'ok' : 'warn'} />
                </Box>
              ))}
              <FormControl size="small" fullWidth>
                <InputLabel>Document return gate</InputLabel>
                <Select label="Document return gate" value={documentReturnGate} onChange={(event) => setDocumentReturnGate(event.target.value as typeof documentReturnGate)}>
                  <MenuItem value="none">No return gate</MenuItem>
                  <MenuItem value="review">Needs receiving review</MenuItem>
                  <MenuItem value="return">Return required</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ mt: 'auto', pt: 1 }}>
                <Button
                  fullWidth
                  variant={documentApproved ? 'contained' : 'outlined'}
                  disabled={!documentsComplete}
                  onClick={() => setDocumentApproved((current) => !current)}
                  sx={documentApproved ? { bgcolor: BD_BLUE, '&:hover': { bgcolor: BD_ORANGE } } : undefined}
                >
                  {documentApproved ? 'Document assessment approved' : 'Approve document assessment'}
                </Button>
              </Box>
            </ReviewCard>
          </Stack>
        </Box>
        <Stack direction="row" justifyContent="flex-end" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            variant="outlined"
            color="warning"
            onClick={() => {
              setQuantityReturnGate('return');
              notify('Quantity return gate opened from assessment variance.');
            }}
          >
            Open quantity return gate
          </Button>
          <Button
            variant="outlined"
            color="warning"
            onClick={() => {
              setDocumentReturnGate('return');
              notify('Document return gate opened from qualitative assessment.');
            }}
          >
            Open document return gate
          </Button>
          <Button variant="contained" onClick={approveAssessment} sx={{ bgcolor: BD_BLUE, '&:hover': { bgcolor: BD_ORANGE } }}>
            Approve assessment
          </Button>
        </Stack>
      </Stack>
    </PanelCard>
  );

  const custody = (
    <PanelCard title="Custody handoff" action={<StatusPill label="Dock checkpoint" tone="warn" />}>
      <Stack spacing={2}>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          Custody acceptance creates an auditable handoff event. It does not replace QA release, disposition, or receiving validation.
        </Alert>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(220px, 1fr))' }, gap: 1.5 }}>
          <TextField fullWidth size="small" label="Handoff code" value={handoffCode} onChange={(event) => setHandoffCode(event.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField fullWidth size="small" label="Seal ID" value={sealId} onChange={(event) => setSealId(event.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField fullWidth size="small" label="Handoff location" defaultValue="Dock A3" InputLabelProps={{ shrink: true }} />
          <TextField fullWidth size="small" label="Timestamp" defaultValue="2026-07-28 10:12" InputLabelProps={{ shrink: true }} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 1.2 }}>
          <MetricPair label="From" value="BD El Paso logistics" />
          <MetricPair label="To" value="SteriTech El Paso provider tenant" />
          <MetricPair label="Reconciliation" value="SFP exception queue if rejected" />
        </Box>
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              setActive('issue');
              setIssueCode('LOST_CUSTODY');
              setIssueSeverity('Critical');
              setIssueSummary('Custody handoff rejected due to unresolved discrepancy at dock.');
              notify('Discrepancy drafted from custody rejection with object context preserved.');
            }}
          >
            Reject custody
          </Button>
          <Button variant="contained" onClick={acceptCustody} sx={{ bgcolor: BD_BLUE, '&:hover': { bgcolor: BD_ORANGE } }}>
            Accept custody
          </Button>
        </Stack>
      </Stack>
    </PanelCard>
  );

  const status = (
    <PanelCard title="Status and cycle update" action={<StatusPill label="API-ready event" tone="default" />}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
        <Stack spacing={1.5}>
          <FormControl size="small" fullWidth>
            <InputLabel>Status code</InputLabel>
            <Select label="Status code" value={statusCode} onChange={(event) => setStatusCode(event.target.value)}>
              <MenuItem value="CYCLE_STARTED">CYCLE_STARTED</MenuItem>
              <MenuItem value="CYCLE_COMPLETE">CYCLE_COMPLETE</MenuItem>
              <MenuItem value="RETURN_READY">RETURN_READY</MenuItem>
              <MenuItem value="RETURN_IN_TRANSIT">RETURN_IN_TRANSIT</MenuItem>
            </Select>
          </FormControl>
          <TextField size="small" label="Sequence" value={sequence} onChange={(event) => setSequence(event.target.value)} />
          <TextField size="small" label="Expected completion" defaultValue="2026-07-29 17:00" />
          <TextField size="small" label="Status note" multiline minRows={3} defaultValue="Cycle started at provider. No exception reported." />
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button
              variant="outlined"
              color="warning"
              onClick={() => {
                setSequence('2');
                notify('Duplicate or out-of-sequence event state: update is rejected and retry guidance is shown.');
              }}
            >
              Simulate duplicate
            </Button>
            <Button variant="contained" startIcon={<SendOutlinedIcon />} onClick={sendStatus} sx={{ bgcolor: BD_BLUE, '&:hover': { bgcolor: BD_ORANGE } }}>
              Send status
            </Button>
          </Stack>
        </Stack>
        <ReviewCard title="Status review">
          <MetricPair label="Transfer" value={statusPayload.objectReference} />
          <MetricPair label="Next status" value={statusCode.replaceAll('_', ' ')} />
          <MetricPair label="Expected completion" value="Jul 29, 2026 at 17:00" />
          <Typography variant="caption" sx={{ color: lx.textMuted }}>
            This update tells BD and the provider where the transfer is in the cycle. The system keeps the sequence number in the audit trail.
          </Typography>
        </ReviewCard>
      </Box>
    </PanelCard>
  );

  const evidence = (
    <PanelCard title="Evidence and return package" action={<StatusPill label={evidenceComplete ? 'Complete' : 'Incomplete'} tone={evidenceComplete ? 'ok' : 'warn'} />}>
      <Stack spacing={2}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Stack spacing={1}>
            {evidenceItems.map((item) => (
              <Box
                key={item}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  gap: 1,
                  alignItems: 'center',
                  border: `1px solid ${lx.border}`,
                  borderRadius: 2,
                  p: 1,
                }}
              >
                <Checkbox
                  checked={Boolean(evidenceChecked[item])}
                  onChange={(event) => setEvidenceChecked((current) => ({ ...current, [item]: event.target.checked }))}
                />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {item}
                  </Typography>
                  <Typography variant="caption" sx={{ color: lx.textMuted }}>
                    Required before return package can be closed.
                  </Typography>
                </Box>
                <StatusPill label={evidenceChecked[item] ? 'Ready' : 'Missing'} tone={evidenceChecked[item] ? 'ok' : 'warn'} />
              </Box>
            ))}
          </Stack>
          <Stack spacing={1.5}>
            <FormControl size="small" fullWidth>
              <InputLabel>Evidence type</InputLabel>
              <Select label="Evidence type" defaultValue="Cycle report">
                <MenuItem value="Cycle report">Cycle report</MenuItem>
                <MenuItem value="Delivery photo">Delivery photo</MenuItem>
                <MenuItem value="Seal verification">Seal verification</MenuItem>
              </Select>
            </FormControl>
            <TextField size="small" label="Object reference" value={evidenceRef} onChange={(event) => setEvidenceRef(event.target.value)} />
            <TextField size="small" label="File name" value={fileName} onChange={(event) => setFileName(event.target.value)} placeholder="L-58241-cycle-report.pdf" />
            <TextField size="small" label="Evidence note" multiline minRows={3} placeholder="Optional note." />
            <LinearProgress
              variant="determinate"
              value={evidenceProgress}
              sx={{
                height: 8,
                borderRadius: 99,
                bgcolor: BD_BLUE_SOFT,
                '& .MuiLinearProgress-bar': {
                  bgcolor: BD_BLUE,
                },
              }}
            />
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button variant="outlined" onClick={() => setEvidenceRef('L-99999')}>
                Simulate wrong object
              </Button>
              <Button variant="contained" onClick={submitEvidence} sx={{ bgcolor: BD_BLUE, '&:hover': { bgcolor: BD_ORANGE } }}>
                Submit evidence
              </Button>
            </Stack>
          </Stack>
        </Box>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          Production validation still needs file security, format rules, retention, malware scanning, and audit trail review.
        </Alert>
      </Stack>
    </PanelCard>
  );

  const issue = (
    <PanelCard title="Discrepancy notification" action={<StatusPill label="Shared exception" tone="danger" />}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
        <Stack spacing={1.5}>
          <FormControl size="small" fullWidth>
            <InputLabel>Issue code</InputLabel>
            <Select label="Issue code" value={issueCode} onChange={(event) => setIssueCode(event.target.value)}>
              <MenuItem value="CRITICAL_DAMAGE">CRITICAL_DAMAGE</MenuItem>
              <MenuItem value="LOST_CUSTODY">LOST_CUSTODY</MenuItem>
              <MenuItem value="REJECTED_LOAD">REJECTED_LOAD</MenuItem>
              <MenuItem value="MISSING_EVIDENCE">MISSING_EVIDENCE</MenuItem>
              <MenuItem value="IDENTITY_MISMATCH">IDENTITY_MISMATCH</MenuItem>
              <MenuItem value="DELAYED_RETURN">DELAYED_RETURN</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Severity</InputLabel>
            <Select label="Severity" value={issueSeverity} onChange={(event) => setIssueSeverity(event.target.value)}>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Critical">Critical</MenuItem>
            </Select>
          </FormControl>
          <TextField size="small" label="Affected reference" defaultValue="L-58241" />
          <TextField size="small" label="Issue summary" multiline minRows={4} value={issueSummary} onChange={(event) => setIssueSummary(event.target.value)} />
          <Stack direction="row" justifyContent="flex-end" spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="outlined" onClick={() => notify('Issue draft saved with object reference and routing preview.')}>
              Save draft
            </Button>
            <Button variant="outlined" color="success" onClick={closeWithoutDiscrepancy}>
              No discrepancy
            </Button>
            <Button variant="contained" onClick={submitIssue} sx={{ bgcolor: BD_BLUE, '&:hover': { bgcolor: BD_ORANGE } }}>
              Submit issue
            </Button>
          </Stack>
        </Stack>
        <Stack spacing={1.5}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.2 }}>
            <MetricPair label="Owner" value={issueOwner.owner} />
            <MetricPair label="SLA" value={issueOwner.sla} />
            <MetricPair label="Notification" value="SFP exception queue" />
            <MetricPair label="Audit" value="Event + payload retained" />
          </Box>
          <ReviewCard title="Routing review">
            <MetricPair label="Affected transfer" value="L-58241" />
            <MetricPair label="Issue type" value={issueCode.replaceAll('_', ' ')} />
            <MetricPair label="Severity" value={issueSeverity} />
            <MetricPair label="What will happen" value={`Send to ${issueOwner.owner}`} />
            <Typography variant="caption" sx={{ color: lx.textMuted }}>
              Operators see the owner, SLA, and summary before sending. The technical record is saved in the background.
            </Typography>
          </ReviewCard>
        </Stack>
      </Box>
    </PanelCard>
  );

  const activeContent: Record<PortalSection, React.ReactNode> = {
    dashboard,
    request,
    identity,
    assessment,
    custody,
    status,
    evidence,
    issue,
  };

  return (
    <LogisticsPageShell
      title="ASN Portal"
      subtitle={`${selectedSection.subtitle} PO/STO linkage, SKU quantities, and pre-receiving assessment visibility.`}
      asOf={logisticsData.as_of}
      toolbar={<Chip label="Sandbox tenant: Provider A" sx={{ fontWeight: 800 }} />}
      banner={
        <Stack spacing={0.5}>
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            Partner-visible transfer workspace.
          </Typography>
          <Typography variant="body2">
            This view is visibility and orchestration only. Receiving owns custody, cycle/status, evidence, and discrepancy handling after ASN assessment. Quality release remains a human approval gate.
          </Typography>
        </Stack>
      }
    >
      <Stack spacing={2}>
        <PanelCard title="ASN Portal views" action={<StatusPill label="External partner" tone="default" />}>
          <SectionNav active={active} onChange={setActive} />
        </PanelCard>
        {activeContent[active]}
      </Stack>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3200}
        onClose={() => setToast('')}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </LogisticsPageShell>
  );
}
