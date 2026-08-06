import React, {useMemo, useState} from 'react';
import {
  ArrowBackRounded as ArrowBackRoundedIcon,
  AssignmentTurnedInRounded as AssignmentTurnedInRoundedIcon,
  BuildCircleRounded as BuildCircleRoundedIcon,
  DescriptionRounded as DescriptionRoundedIcon,
  EngineeringRounded as EngineeringRoundedIcon,
  Inventory2Rounded as Inventory2RoundedIcon,
  PlaylistAddCheckCircleRounded as PlaylistAddCheckCircleRoundedIcon,
  RuleFolderRounded as RuleFolderRoundedIcon,
  ScheduleRounded as ScheduleRoundedIcon,
  WarningAmberRounded as WarningAmberRoundedIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  acknowledgeException,
  acknowledgeWarnings,
  addCommentToSelectedWorkOrder,
  closeCommentDialog,
  closeReleaseDialog,
  createInitialWoReadinessState,
  holdSelectedWorkOrder,
  openCommentDialog,
  openReleaseDialog,
  resetFilters,
  resolveException,
  runAllReadinessChecks,
  runSelectedReadinessCheck,
  selectWorkOrder,
  setActiveDetailTab,
  setFilters,
  updateRecommendedActionStatus,
} from './state';
import type {
  DocumentationReadinessItem,
  LaborReadinessItem,
  MachineReadinessItem,
  MaterialReadinessItem,
  QualityReadinessItem,
  ReadinessCategory,
  RecommendedAction,
  ScheduleReadinessItem,
  ToolingReadinessItem,
  WarehouseStagingItem,
  WorkOrder,
  WorkOrderReadinessCheck,
  WorkOrderReadinessException,
} from './types';
import {
  calculateReadinessSummary,
  calculateReleaseRecommendation,
  filterWorkOrders,
  formatAgeMinutes,
  formatDate,
  formatDateTime,
  formatNumber,
  getMainIssueText,
  sortWorkOrdersByReadinessRisk,
} from './utils';
import {
  NeutralBadge,
  PriorityBadge,
  ReadinessStatusBadge,
  ReleaseRecommendationBadge,
  SeverityBadge,
  WorkOrderStatusBadge,
} from './components/Badges';

type WoReadinessPageProps = {
  onBack?: () => void;
};

const moduleCardSx = {
  borderRadius: 4,
  border: '1px solid var(--planning-border)',
  bgcolor: 'var(--planning-surface)',
  boxShadow: 'var(--planning-soft-shadow)',
} as const;

const detailTabs = ['Overview', 'Checklist', 'Materials', 'Machine & Labor', 'Quality & Docs', 'Exceptions', 'Actions', 'History'] as const;

const categoryMeta: Record<ReadinessCategory, {icon: React.ReactNode; helper: string}> = {
  Material: {icon: <Inventory2RoundedIcon sx={{fontSize: 18}} />, helper: 'Component and stock readiness'},
  Machine: {icon: <BuildCircleRoundedIcon sx={{fontSize: 18}} />, helper: 'Equipment availability and downtime'},
  Labor: {icon: <EngineeringRoundedIcon sx={{fontSize: 18}} />, helper: 'Crew and skill coverage'},
  Quality: {icon: <RuleFolderRoundedIcon sx={{fontSize: 18}} />, helper: 'Hold, deviations, inspection status'},
  Documentation: {icon: <DescriptionRoundedIcon sx={{fontSize: 18}} />, helper: 'SOPs, instructions, approvals'},
  Tooling: {icon: <BuildCircleRoundedIcon sx={{fontSize: 18}} />, helper: 'Calibration and tool availability'},
  WarehouseStaging: {icon: <Inventory2RoundedIcon sx={{fontSize: 18}} />, helper: 'Staging completeness'},
  Schedule: {icon: <ScheduleRoundedIcon sx={{fontSize: 18}} />, helper: 'Capacity and conflict checks'},
  BatchLot: {icon: <PlaylistAddCheckCircleRoundedIcon sx={{fontSize: 18}} />, helper: 'Batch and lot dependencies'},
};

function SummaryCards({
  workOrders,
  checks,
  exceptions,
}: {
  workOrders: WorkOrder[];
  checks: WorkOrderReadinessCheck[];
  exceptions: WorkOrderReadinessException[];
}) {
  const summary = useMemo(() => calculateReadinessSummary(workOrders, checks, exceptions), [checks, exceptions, workOrders]);

  return (
    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr))'}, gap: 1.2}}>
      {summary.cards.map((card) => {
        const tone =
          card.tone === 'good'
            ? {bg: '#ECFDF3', color: '#027A48'}
            : card.tone === 'warning'
              ? {bg: '#FFF7ED', color: '#C2410C'}
              : card.tone === 'danger'
                ? {bg: '#FEF2F2', color: '#B42318'}
                : card.tone === 'info'
                  ? {bg: '#EFF6FF', color: '#1D4ED8'}
                  : {bg: '#F8FAFC', color: 'var(--planning-text-secondary)'};

        return (
          <Paper key={card.key} elevation={0} sx={{...moduleCardSx, p: 1.8}}>
            <Stack direction="row" spacing={1.25} alignItems="flex-start">
              <Box sx={{width: 36, height: 36, borderRadius: 2, bgcolor: tone.bg, color: tone.color, display: 'grid', placeItems: 'center'}}>
                <AssignmentTurnedInRoundedIcon sx={{fontSize: 18}} />
              </Box>
              <Box sx={{minWidth: 0}}>
                <Typography sx={{fontSize: 12, fontWeight: 800, color: 'var(--planning-text-secondary)'}}>{card.label}</Typography>
                <Typography sx={{fontSize: 28, lineHeight: 1.05, fontWeight: 900, color: 'var(--planning-text-primary)', mt: 0.5}}>{card.count}</Typography>
                <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', mt: 0.5}}>{card.helperText}</Typography>
              </Box>
            </Stack>
          </Paper>
        );
      })}
    </Box>
  );
}

function FiltersBar({
  state,
  onChange,
  onReset,
}: {
  state: ReturnType<typeof createInitialWoReadinessState>;
  onChange: (filters: Partial<ReturnType<typeof createInitialWoReadinessState>['filters']>) => void;
  onReset: () => void;
}) {
  return (
    <Paper elevation={0} sx={{...moduleCardSx, p: 1.5}}>
      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(4, minmax(0, 1fr))', xl: 'repeat(8, minmax(0, 1fr))'}, gap: 1}}>
        <TextField select label="Line" size="small" value={state.filters.line} onChange={(event) => onChange({line: event.target.value})}>
          <MenuItem value="All">All Lines</MenuItem>
          {['Line 10', 'Line 20', 'Line 30'].map((line) => <MenuItem key={line} value={line}>{line}</MenuItem>)}
        </TextField>
        <TextField select label="Readiness" size="small" value={state.filters.readinessStatus} onChange={(event) => onChange({readinessStatus: event.target.value as ReturnType<typeof createInitialWoReadinessState>['filters']['readinessStatus']})}>
          {['All', 'Ready', 'Warning', 'Blocked', 'NotChecked'].map((status) => <MenuItem key={status} value={status}>{status === 'NotChecked' ? 'Not Checked' : status}</MenuItem>)}
        </TextField>
        <TextField select label="Priority" size="small" value={state.filters.priority} onChange={(event) => onChange({priority: event.target.value as ReturnType<typeof createInitialWoReadinessState>['filters']['priority']})}>
          {['All', 'Critical', 'High', 'Medium', 'Low'].map((priority) => <MenuItem key={priority} value={priority}>{priority}</MenuItem>)}
        </TextField>
        <TextField label="Product Search" size="small" value={state.filters.search} onChange={(event) => onChange({search: event.target.value})} placeholder="WO, batch, product" />
        <TextField label="Due From" type="date" size="small" value={state.filters.dueDateFrom} onChange={(event) => onChange({dueDateFrom: event.target.value})} InputLabelProps={{shrink: true}} />
        <TextField label="Due To" type="date" size="small" value={state.filters.dueDateTo} onChange={(event) => onChange({dueDateTo: event.target.value})} InputLabelProps={{shrink: true}} />
        <TextField select label="Issue Category" size="small" value={state.filters.issueCategory} onChange={(event) => onChange({issueCategory: event.target.value as ReturnType<typeof createInitialWoReadinessState>['filters']['issueCategory']})}>
          <MenuItem value="All">All Categories</MenuItem>
          {Object.keys(categoryMeta).map((category) => <MenuItem key={category} value={category}>{category}</MenuItem>)}
        </TextField>
        <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
          <Button variant={state.filters.showOnlyBlockers ? 'contained' : 'outlined'} color="error" onClick={() => onChange({showOnlyBlockers: !state.filters.showOnlyBlockers, showOnlyWarnings: state.filters.showOnlyBlockers ? state.filters.showOnlyWarnings : false})} sx={{textTransform: 'none', fontWeight: 800}}>
            Only Blockers
          </Button>
          <Button variant={state.filters.showOnlyWarnings ? 'contained' : 'outlined'} color="warning" onClick={() => onChange({showOnlyWarnings: !state.filters.showOnlyWarnings, showOnlyBlockers: state.filters.showOnlyWarnings ? state.filters.showOnlyBlockers : false})} sx={{textTransform: 'none', fontWeight: 800}}>
            Only Warnings
          </Button>
          <Button variant="outlined" onClick={onReset} sx={{textTransform: 'none', fontWeight: 800}}>
            Reset
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}

function WorkOrderList({
  workOrders,
  selectedWorkOrderId,
  exceptions,
  onSelect,
}: {
  workOrders: WorkOrder[];
  selectedWorkOrderId: string;
  exceptions: WorkOrderReadinessException[];
  onSelect: (workOrderId: string) => void;
}) {
  return (
    <Paper elevation={0} sx={{...moduleCardSx, overflow: 'hidden'}}>
      <TableContainer sx={{maxHeight: 760}}>
        <Table stickyHeader size="small" aria-label="WO readiness list">
          <TableHead>
            <TableRow>
              <TableCell>WO Number</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Line</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Readiness</TableCell>
              <TableCell>Main Blocker / Warning</TableCell>
              <TableCell>Exceptions</TableCell>
              <TableCell>Last Checked</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {workOrders.map((workOrder) => {
              const selected = workOrder.id === selectedWorkOrderId;
              return (
                <TableRow
                  key={workOrder.id}
                  hover
                  selected={selected}
                  tabIndex={0}
                  role="button"
                  aria-label={`Select ${workOrder.woNumber}`}
                  onClick={() => onSelect(workOrder.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelect(workOrder.id);
                    }
                  }}
                  sx={{
                    cursor: 'pointer',
                    '&.Mui-selected': {bgcolor: 'var(--planning-neutral-bg)'},
                    '& .MuiTableCell-root': {py: 1.1, verticalAlign: 'top'},
                  }}
                >
                  <TableCell>
                    <Typography sx={{fontSize: 13, color: '#1D4ED8', fontWeight: 900}}>{workOrder.woNumber}</Typography>
                    <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', mt: 0.45}}>Batch: {workOrder.batchNumber}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{fontSize: 12.5, color: '#1F2937', fontWeight: 800}}>{workOrder.productCode}</Typography>
                    <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', mt: 0.45}}>{workOrder.productDescription}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{fontSize: 12.5, color: '#1F2937', fontWeight: 800}}>{formatNumber(workOrder.quantityRequired)}</Typography>
                    <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)'}}>{workOrder.uom}</Typography>
                  </TableCell>
                  <TableCell>{formatDate(workOrder.dueDate)}</TableCell>
                  <TableCell>{workOrder.assignedLineName}</TableCell>
                  <TableCell><PriorityBadge priority={workOrder.priority} /></TableCell>
                  <TableCell><ReadinessStatusBadge status={workOrder.readinessStatus} /></TableCell>
                  <TableCell>
                    <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', maxWidth: 260}}>
                      {getMainIssueText(workOrder, exceptions)}
                    </Typography>
                  </TableCell>
                  <TableCell>{workOrder.exceptionCount}</TableCell>
                  <TableCell>{formatDateTime(workOrder.lastCheckedAt)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{px: 1.5, py: 1.25, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>Work orders stay visible while reviewing details on desktop.</Typography>
        <NeutralBadge label="Front-end only demo data" />
      </Box>
    </Paper>
  );
}

function SelectedHeader({
  selectedWorkOrder,
  releaseRecommendation,
}: {
  selectedWorkOrder: WorkOrder;
  releaseRecommendation: ReturnType<typeof calculateReleaseRecommendation>;
}) {
  return (
    <Paper elevation={0} sx={{borderRadius: 3, border: '1px solid #E4E7EC', p: 1.6}}>
      <Stack spacing={1.25}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap'}}>
          <Box>
            <Typography sx={{fontSize: 24, fontWeight: 900, color: 'var(--planning-text-primary)'}}>{selectedWorkOrder.woNumber}</Typography>
            <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', mt: 0.45}}>{selectedWorkOrder.productCode} - {selectedWorkOrder.productDescription}</Typography>
            <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', mt: 0.45}}>Batch: {selectedWorkOrder.batchNumber}</Typography>
          </Box>
          <ReleaseRecommendationBadge recommendation={releaseRecommendation} />
        </Box>
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))'}, gap: 1}}>
          {[
            {label: 'Quantity Required', value: `${formatNumber(selectedWorkOrder.quantityRequired)} ${selectedWorkOrder.uom}`},
            {label: 'Due Date', value: formatDate(selectedWorkOrder.dueDate)},
            {label: 'Assigned Line', value: selectedWorkOrder.assignedLineName},
            {label: 'WO Status', value: selectedWorkOrder.status},
          ].map((item) => (
            <Paper key={item.label} elevation={0} sx={{borderRadius: 2.5, border: '1px solid #E4E7EC', p: 1.2, bgcolor: 'var(--planning-surface-muted)'}}>
              <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', fontWeight: 800}}>{item.label}</Typography>
              <Typography sx={{fontSize: 14, color: '#1F2937', fontWeight: 900, mt: 0.5}}>{item.value}</Typography>
            </Paper>
          ))}
        </Box>
        <Stack direction="row" spacing={1} sx={{flexWrap: 'wrap', rowGap: 1}}>
          <PriorityBadge priority={selectedWorkOrder.priority} />
          <ReadinessStatusBadge status={selectedWorkOrder.readinessStatus} />
          <WorkOrderStatusBadge status={selectedWorkOrder.status} />
        </Stack>
      </Stack>
    </Paper>
  );
}

function ReadinessChecklist({
  checks,
  onCategoryClick,
}: {
  checks: WorkOrderReadinessCheck[];
  onCategoryClick: (category: ReadinessCategory) => void;
}) {
  return (
    <Stack spacing={1}>
      {checks.map((check) => (
        <Paper key={check.id} elevation={0} onClick={() => onCategoryClick(check.category)} sx={{borderRadius: 2.5, border: '1px solid #E4E7EC', p: 1.3, cursor: 'pointer', '&:hover': {bgcolor: 'var(--planning-surface-muted)'}}}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap'}}>
            <Box sx={{display: 'flex', gap: 1.1}}>
              <Box sx={{width: 34, height: 34, borderRadius: 2, bgcolor: 'var(--planning-neutral-bg)', color: '#1D4ED8', display: 'grid', placeItems: 'center'}}>
                {categoryMeta[check.category].icon}
              </Box>
              <Box>
                <Typography sx={{fontSize: 13, fontWeight: 900, color: '#1F2937'}}>{check.category}</Typography>
                <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', mt: 0.35}}>{check.description}</Typography>
                <Typography sx={{fontSize: 11, color: '#98A2B3', mt: 0.35}}>Owner: {check.owner} · Last checked: {formatDateTime(check.lastCheckedAt)}</Typography>
              </Box>
            </Box>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.75, alignItems: 'flex-end'}}>
              <ReadinessStatusBadge status={check.status} />
              <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', textAlign: 'right', maxWidth: 250}}>{check.requiredAction}</Typography>
            </Box>
          </Box>
        </Paper>
      ))}
    </Stack>
  );
}

function GenericTableSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Paper elevation={0} sx={{...moduleCardSx, p: 1.5}}>
      <Typography sx={{fontSize: 16, fontWeight: 900, color: 'var(--planning-text-primary)', mb: 1.2}}>{title}</Typography>
      {children}
    </Paper>
  );
}

function MaterialSection({items}: {items: MaterialReadinessItem[]}) {
  return (
    <GenericTableSection title="Material Readiness">
      <TableContainer>
        <Table size="small" aria-label="Material readiness table">
          <TableHead>
            <TableRow>
              <TableCell>Component</TableCell>
              <TableCell>Required</TableCell>
              <TableCell>System Available</TableCell>
              <TableCell>Physically Confirmed</TableCell>
              <TableCell>Staged</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Lot</TableCell>
              <TableCell>Quality Status</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Issue</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Typography sx={{fontSize: 12.5, fontWeight: 800, color: '#1F2937'}}>{item.componentCode}</Typography>
                  <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)'}}>{item.componentDescription}</Typography>
                </TableCell>
                <TableCell>{formatNumber(item.requiredQuantity)} {item.uom}</TableCell>
                <TableCell>{formatNumber(item.systemAvailableQuantity)}</TableCell>
                <TableCell>{formatNumber(item.physicallyConfirmedQuantity)}</TableCell>
                <TableCell>{formatNumber(item.stagedQuantity)}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>{item.lotNumber}</TableCell>
                <TableCell>{item.qualityStatus}</TableCell>
                <TableCell><ReadinessStatusBadge status={item.status} /></TableCell>
                <TableCell>{item.issue}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </GenericTableSection>
  );
}

function MachineSection({items}: {items: MachineReadinessItem[]}) {
  return (
    <GenericTableSection title="Machine Readiness">
      <TableContainer>
        <Table size="small" aria-label="Machine readiness table">
          <TableHead>
            <TableRow>
              <TableCell>Assigned Line</TableCell>
              <TableCell>Machine</TableCell>
              <TableCell>Machine Status</TableCell>
              <TableCell>Required Window</TableCell>
              <TableCell>Downtime Window</TableCell>
              <TableCell>Capacity Impact</TableCell>
              <TableCell>Alternative Line</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Issue</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.lineId}</TableCell>
                <TableCell>{item.machineName}</TableCell>
                <TableCell>{item.machineStatus}</TableCell>
                <TableCell>{formatDateTime(item.requiredWindowStart)} - {formatDateTime(item.requiredWindowEnd)}</TableCell>
                <TableCell>{item.plannedDowntimeStart ? `${formatDateTime(item.plannedDowntimeStart)} - ${formatDateTime(item.plannedDowntimeEnd)}` : 'No downtime planned'}</TableCell>
                <TableCell>{item.capacityImpactHours} h</TableCell>
                <TableCell>{item.alternativeLineName ?? 'None'}</TableCell>
                <TableCell><ReadinessStatusBadge status={item.status} /></TableCell>
                <TableCell>{item.issue}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </GenericTableSection>
  );
}

function LaborSection({items}: {items: LaborReadinessItem[]}) {
  return (
    <GenericTableSection title="Labor Readiness">
      <TableContainer>
        <Table size="small" aria-label="Labor readiness table">
          <TableHead>
            <TableRow>
              <TableCell>Required Crew</TableCell>
              <TableCell>Available Crew</TableCell>
              <TableCell>Required Qualified Operators</TableCell>
              <TableCell>Available Qualified Operators</TableCell>
              <TableCell>Required Skill</TableCell>
              <TableCell>Shift</TableCell>
              <TableCell>Capacity Supported %</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Issue</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.requiredCrew}</TableCell>
                <TableCell>{item.availableCrew}</TableCell>
                <TableCell>{item.requiredQualifiedOperators}</TableCell>
                <TableCell>{item.availableQualifiedOperators}</TableCell>
                <TableCell>{item.requiredSkill}</TableCell>
                <TableCell>{item.shift}</TableCell>
                <TableCell>{item.capacitySupportedPercent}%</TableCell>
                <TableCell><ReadinessStatusBadge status={item.status} /></TableCell>
                <TableCell>{item.issue}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </GenericTableSection>
  );
}

function QualitySection({items}: {items: QualityReadinessItem[]}) {
  return (
    <GenericTableSection title="Quality Readiness">
      <TableContainer>
        <Table size="small" aria-label="Quality readiness table">
          <TableHead>
            <TableRow>
              <TableCell>Quality Status</TableCell>
              <TableCell>Open QNs</TableCell>
              <TableCell>Open Deviations</TableCell>
              <TableCell>Inspection Required</TableCell>
              <TableCell>Batch Release Dependency</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Issue</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.qualityStatus}</TableCell>
                <TableCell>{item.openQnCount}</TableCell>
                <TableCell>{item.openDeviationCount}</TableCell>
                <TableCell>{item.requiredInspection}</TableCell>
                <TableCell>{item.batchReleaseDependency}</TableCell>
                <TableCell><ReadinessStatusBadge status={item.status} /></TableCell>
                <TableCell>{item.issue}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </GenericTableSection>
  );
}

function DocumentationSection({items}: {items: DocumentationReadinessItem[]}) {
  return (
    <GenericTableSection title="Documentation Readiness">
      <TableContainer>
        <Table size="small" aria-label="Documentation readiness table">
          <TableHead>
            <TableRow>
              <TableCell>Document Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Required Version</TableCell>
              <TableCell>Available Version</TableCell>
              <TableCell>Lifecycle Status</TableCell>
              <TableCell>E-signature Required</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Issue</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.documentName}</TableCell>
                <TableCell>{item.documentType}</TableCell>
                <TableCell>{item.requiredVersion}</TableCell>
                <TableCell>{item.availableVersion}</TableCell>
                <TableCell>{item.lifecycleStatus}</TableCell>
                <TableCell>{item.eSignatureRequired ? 'Yes' : 'No'}</TableCell>
                <TableCell><ReadinessStatusBadge status={item.status} /></TableCell>
                <TableCell>{item.issue}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </GenericTableSection>
  );
}

function ToolingSection({items}: {items: ToolingReadinessItem[]}) {
  return (
    <GenericTableSection title="Tooling Readiness">
      <TableContainer>
        <Table size="small" aria-label="Tooling readiness table">
          <TableHead>
            <TableRow>
              <TableCell>Tool Code</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Required Quantity</TableCell>
              <TableCell>Available Quantity</TableCell>
              <TableCell>Calibration Status</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Issue</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.toolCode}</TableCell>
                <TableCell>{item.toolDescription}</TableCell>
                <TableCell>{item.requiredQuantity}</TableCell>
                <TableCell>{item.availableQuantity}</TableCell>
                <TableCell>{item.calibrationStatus}</TableCell>
                <TableCell><ReadinessStatusBadge status={item.status} /></TableCell>
                <TableCell>{item.issue}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </GenericTableSection>
  );
}

function WarehouseSection({items}: {items: WarehouseStagingItem[]}) {
  return (
    <GenericTableSection title="Warehouse Staging">
      <TableContainer>
        <Table size="small" aria-label="Warehouse staging table">
          <TableHead>
            <TableRow>
              <TableCell>Staging Area</TableCell>
              <TableCell>Required Materials Count</TableCell>
              <TableCell>Staged Materials Count</TableCell>
              <TableCell>Missing Materials Count</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Issue</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.stagingArea}</TableCell>
                <TableCell>{item.requiredMaterialsCount}</TableCell>
                <TableCell>{item.stagedMaterialsCount}</TableCell>
                <TableCell>{item.missingMaterialsCount}</TableCell>
                <TableCell><ReadinessStatusBadge status={item.status} /></TableCell>
                <TableCell>{item.issue}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </GenericTableSection>
  );
}

function ScheduleSection({items}: {items: ScheduleReadinessItem[]}) {
  return (
    <GenericTableSection title="Schedule Readiness">
      <TableContainer>
        <Table size="small" aria-label="Schedule readiness table">
          <TableHead>
            <TableRow>
              <TableCell>Planned Start</TableCell>
              <TableCell>Planned End</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Capacity Utilization After Release</TableCell>
              <TableCell>Conflicts</TableCell>
              <TableCell>Frozen Period Impact</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Issue</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{formatDateTime(item.plannedStartDate)}</TableCell>
                <TableCell>{formatDateTime(item.plannedEndDate)}</TableCell>
                <TableCell>{formatDate(item.dueDate)}</TableCell>
                <TableCell>{item.capacityUtilizationAfterRelease}%</TableCell>
                <TableCell>{item.conflictsCount}</TableCell>
                <TableCell>{item.frozenPeriodImpact}</TableCell>
                <TableCell><ReadinessStatusBadge status={item.status} /></TableCell>
                <TableCell>{item.issue}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </GenericTableSection>
  );
}

function ExceptionsPanel({
  exceptions,
  onAcknowledge,
  onResolve,
}: {
  exceptions: WorkOrderReadinessException[];
  onAcknowledge: (exceptionId: string) => void;
  onResolve: (exceptionId: string) => void;
}) {
  return (
    <GenericTableSection title="Exceptions / Blockers">
      <TableContainer>
        <Table size="small" aria-label="Readiness exceptions table">
          <TableHead>
            <TableRow>
              <TableCell>Severity</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Suggested Action</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exceptions.map((item) => (
              <TableRow key={item.id}>
                <TableCell><SeverityBadge severity={item.severity} /></TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.reason}</TableCell>
                <TableCell>{item.suggestedAction}</TableCell>
                <TableCell>{item.owner}</TableCell>
                <TableCell>{formatAgeMinutes(item.ageMinutes)}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" variant="outlined" onClick={() => onAcknowledge(item.id)} sx={{textTransform: 'none'}}>Acknowledge</Button>
                    <Button size="small" variant="outlined" color="success" onClick={() => onResolve(item.id)} sx={{textTransform: 'none'}}>Resolve</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </GenericTableSection>
  );
}

function RecommendedActionsPanel({
  actions,
  onUpdate,
}: {
  actions: RecommendedAction[];
  onUpdate: (actionId: string, status: RecommendedAction['status']) => void;
}) {
  return (
    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))'}, gap: 1.2}}>
      {actions.map((action) => (
        <Paper key={action.id} elevation={0} sx={{...moduleCardSx, p: 1.5}}>
          <Stack spacing={1}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap'}}>
              <Typography sx={{fontSize: 14, fontWeight: 900, color: 'var(--planning-text-primary)'}}>{action.title}</Typography>
              <Stack direction="row" spacing={0.75}>
                <PriorityBadge priority={action.priority} />
                <NeutralBadge label={action.effort} />
              </Stack>
            </Box>
            <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)'}}>{action.description}</Typography>
            <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)'}}>Expected impact: {action.expectedImpact}</Typography>
            <Stack direction="row" spacing={1} sx={{flexWrap: 'wrap', rowGap: 1}}>
              <Button size="small" variant="outlined" onClick={() => onUpdate(action.id, 'InProgress')} sx={{textTransform: 'none'}}>Start</Button>
              <Button size="small" variant="contained" onClick={() => onUpdate(action.id, 'Done')} sx={{textTransform: 'none', fontWeight: 800}}>Mark Done</Button>
              <NeutralBadge label={action.status} />
            </Stack>
          </Stack>
        </Paper>
      ))}
    </Box>
  );
}

function AuditTrail({
  items,
}: {
  items: ReturnType<typeof createInitialWoReadinessState>['auditEvents'];
}) {
  return (
    <GenericTableSection title="Audit / History">
      <TableContainer>
        <Table size="small" aria-label="Readiness audit trail">
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Event</TableCell>
              <TableCell>Previous Value</TableCell>
              <TableCell>New Value</TableCell>
              <TableCell>Comment</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{formatDateTime(item.timestamp)}</TableCell>
                <TableCell>{item.user}</TableCell>
                <TableCell>{item.eventType}</TableCell>
                <TableCell>{item.previousValue}</TableCell>
                <TableCell>{item.newValue}</TableCell>
                <TableCell>{item.comment}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </GenericTableSection>
  );
}

export default function WoReadinessPage({onBack}: WoReadinessPageProps) {
  const [state, setState] = useState(() => createInitialWoReadinessState());
  const [commentValue, setCommentValue] = useState('');

  const visibleWorkOrders = useMemo(
    () => sortWorkOrdersByReadinessRisk(filterWorkOrders(state.workOrders, state.filters, state.exceptions)),
    [state.exceptions, state.filters, state.workOrders],
  );

  const selectedWorkOrder = state.workOrders.find((item) => item.id === state.selectedWorkOrderId) ?? null;
  const selectedChecks = state.readinessChecks.filter((item) => item.workOrderId === state.selectedWorkOrderId);
  const selectedMaterialItems = state.materialItems.filter((item) => item.workOrderId === state.selectedWorkOrderId);
  const selectedMachineItems = state.machineItems.filter((item) => item.workOrderId === state.selectedWorkOrderId);
  const selectedLaborItems = state.laborItems.filter((item) => item.workOrderId === state.selectedWorkOrderId);
  const selectedQualityItems = state.qualityItems.filter((item) => item.workOrderId === state.selectedWorkOrderId);
  const selectedDocumentationItems = state.documentationItems.filter((item) => item.workOrderId === state.selectedWorkOrderId);
  const selectedToolingItems = state.toolingItems.filter((item) => item.workOrderId === state.selectedWorkOrderId);
  const selectedWarehouseItems = state.warehouseItems.filter((item) => item.workOrderId === state.selectedWorkOrderId);
  const selectedScheduleItems = state.scheduleItems.filter((item) => item.workOrderId === state.selectedWorkOrderId);
  const selectedExceptions = state.exceptions.filter((item) => item.workOrderId === state.selectedWorkOrderId && item.status !== 'Resolved');
  const selectedAuditEvents = state.auditEvents.filter((item) => item.workOrderId === state.selectedWorkOrderId);
  const selectedActions = state.recommendedActions.filter((item) => item.workOrderId === state.selectedWorkOrderId);
  const releaseRecommendation = selectedWorkOrder ? calculateReleaseRecommendation(selectedWorkOrder.readinessStatus) : 'Readiness Not Checked';

  const handleCategoryClick = (category: ReadinessCategory) => {
    if (category === 'Material') {
      setState((current) => setActiveDetailTab(current, 'Materials'));
      return;
    }
    if (category === 'Machine' || category === 'Labor') {
      setState((current) => setActiveDetailTab(current, 'Machine & Labor'));
      return;
    }
    if (category === 'Quality' || category === 'Documentation' || category === 'Tooling') {
      setState((current) => setActiveDetailTab(current, 'Quality & Docs'));
      return;
    }
    if (category === 'WarehouseStaging' || category === 'Schedule' || category === 'BatchLot') {
      setState((current) => setActiveDetailTab(current, 'Checklist'));
    }
  };

  const renderDetailContent = () => {
    if (!selectedWorkOrder) {
      return (
        <Paper elevation={0} sx={{...moduleCardSx, p: 3}}>
          <Typography sx={{fontSize: 18, fontWeight: 900, color: 'var(--planning-text-primary)'}}>Select a work order</Typography>
          <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', mt: 0.75}}>Choose a work order from the list to review readiness details, blockers, warnings, and actions.</Typography>
        </Paper>
      );
    }

    if (state.activeDetailTab === 'Checklist') {
      return (
        <Stack spacing={1.2}>
          <ReadinessChecklist checks={selectedChecks} onCategoryClick={handleCategoryClick} />
          <ScheduleSection items={selectedScheduleItems} />
          <WarehouseSection items={selectedWarehouseItems} />
        </Stack>
      );
    }

    if (state.activeDetailTab === 'Materials') {
      return <MaterialSection items={selectedMaterialItems} />;
    }

    if (state.activeDetailTab === 'Machine & Labor') {
      return (
        <Stack spacing={1.2}>
          <MachineSection items={selectedMachineItems} />
          <LaborSection items={selectedLaborItems} />
        </Stack>
      );
    }

    if (state.activeDetailTab === 'Quality & Docs') {
      return (
        <Stack spacing={1.2}>
          <QualitySection items={selectedQualityItems} />
          <DocumentationSection items={selectedDocumentationItems} />
          <ToolingSection items={selectedToolingItems} />
        </Stack>
      );
    }

    if (state.activeDetailTab === 'Exceptions') {
      return (
        <ExceptionsPanel
          exceptions={selectedExceptions}
          onAcknowledge={(exceptionId) => setState((current) => acknowledgeException(current, exceptionId))}
          onResolve={(exceptionId) => setState((current) => resolveException(current, exceptionId))}
        />
      );
    }

    if (state.activeDetailTab === 'Actions') {
      return (
        <RecommendedActionsPanel
          actions={selectedActions}
          onUpdate={(actionId, status) => setState((current) => updateRecommendedActionStatus(current, actionId, status))}
        />
      );
    }

    if (state.activeDetailTab === 'History') {
      return <AuditTrail items={selectedAuditEvents} />;
    }

    return (
      <Stack spacing={1.2}>
        <SelectedHeader selectedWorkOrder={selectedWorkOrder} releaseRecommendation={releaseRecommendation} />
        <Paper elevation={0} sx={{...moduleCardSx, p: 1.5}}>
          <Typography sx={{fontSize: 16, fontWeight: 900, color: 'var(--planning-text-primary)', mb: 1.2}}>Readiness Checklist</Typography>
          <ReadinessChecklist checks={selectedChecks} onCategoryClick={handleCategoryClick} />
        </Paper>
        {selectedExceptions.length > 0 ? (
          <ExceptionsPanel
            exceptions={selectedExceptions}
            onAcknowledge={(exceptionId) => setState((current) => acknowledgeException(current, exceptionId))}
            onResolve={(exceptionId) => setState((current) => resolveException(current, exceptionId))}
          />
        ) : (
          <Alert severity="success">No active blockers or warnings for the selected work order.</Alert>
        )}
        <RecommendedActionsPanel
          actions={selectedActions}
          onUpdate={(actionId, status) => setState((current) => updateRecommendedActionStatus(current, actionId, status))}
        />
      </Stack>
    );
  };

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}} data-testid="wo-readiness-page">
      <Paper elevation={0} sx={{...moduleCardSx, p: 2}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start'}}>
          <Box sx={{display: 'flex', gap: 1.2, alignItems: 'flex-start'}}>
            <IconButton aria-label="Back to planning overview" onClick={onBack} sx={{border: '1px solid var(--planning-border)', borderRadius: 2, mt: 0.35}}>
              <ArrowBackRoundedIcon />
            </IconButton>
            <Box>
              <Typography sx={{fontSize: 30, fontWeight: 900, color: 'var(--planning-text-primary)'}}>WO Readiness</Typography>
              <Typography sx={{fontSize: 13.5, color: 'var(--planning-text-secondary)', mt: 0.6, maxWidth: 960}}>
                Check materials, machine, labor, quality, documentation, and schedule readiness before release.
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={1} sx={{flexWrap: 'wrap', rowGap: 1}}>
            <Button variant="outlined" sx={{textTransform: 'none', fontWeight: 800}}>
              {state.siteName} ({state.siteLabel})
            </Button>
            <Button variant="outlined" onClick={() => setState((current) => runAllReadinessChecks(current))} sx={{textTransform: 'none', fontWeight: 800}}>
              Run All Checks
            </Button>
            <Button
              variant="contained"
              disabled={!selectedWorkOrder || selectedWorkOrder.readinessStatus === 'Blocked'}
              onClick={() => setState((current) => openReleaseDialog(current))}
              sx={{textTransform: 'none', fontWeight: 800}}
            >
              Proceed to Release
            </Button>
          </Stack>
        </Box>
      </Paper>

      <SummaryCards workOrders={state.workOrders} checks={state.readinessChecks} exceptions={state.exceptions} />

      <FiltersBar
        state={state}
        onChange={(filters) => setState((current) => setFilters(current, filters))}
        onReset={() => setState((current) => resetFilters(current))}
      />

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'minmax(0, 1.15fr) minmax(420px, 0.95fr)'}, gap: 1.2, alignItems: 'start'}}>
        <WorkOrderList
          workOrders={visibleWorkOrders}
          selectedWorkOrderId={state.selectedWorkOrderId}
          exceptions={state.exceptions}
          onSelect={(workOrderId) => setState((current) => selectWorkOrder(current, workOrderId))}
        />

        <Stack spacing={1.2}>
          {selectedWorkOrder ? (
            <Paper elevation={0} sx={{...moduleCardSx, px: 1.25, pt: 1}}>
              <Tabs
                value={state.activeDetailTab}
                onChange={(_event, value) => setState((current) => setActiveDetailTab(current, value))}
                variant="scrollable"
                scrollButtons="auto"
                sx={{'& .MuiTab-root': {textTransform: 'none', minHeight: 42, fontWeight: 800}}}
              >
                {detailTabs.map((tab) => <Tab key={tab} label={tab} value={tab} />)}
              </Tabs>
            </Paper>
          ) : null}

          <Paper elevation={0} sx={{...moduleCardSx, p: 1.4}}>
            {renderDetailContent()}
          </Paper>

          {selectedWorkOrder ? (
            <Paper elevation={0} sx={{...moduleCardSx, p: 1.5}}>
              <Stack direction="row" spacing={1} sx={{flexWrap: 'wrap', rowGap: 1}}>
                <Button variant="contained" onClick={() => setState((current) => runSelectedReadinessCheck(current))} sx={{textTransform: 'none', fontWeight: 800}}>
                  Run Readiness Check
                </Button>
                <Button variant="outlined" onClick={() => setState((current) => openCommentDialog(current))} sx={{textTransform: 'none', fontWeight: 800}}>
                  Add Comment
                </Button>
                <Button variant="outlined" onClick={() => setState((current) => acknowledgeWarnings(current))} sx={{textTransform: 'none', fontWeight: 800}}>
                  Acknowledge Warnings
                </Button>
                <Button variant="outlined" color="warning" onClick={() => setState((current) => holdSelectedWorkOrder(current))} sx={{textTransform: 'none', fontWeight: 800}}>
                  Hold WO
                </Button>
                <Button
                  variant="outlined"
                  disabled={selectedWorkOrder.readinessStatus === 'Blocked'}
                  onClick={() => setState((current) => openReleaseDialog(current))}
                  sx={{textTransform: 'none', fontWeight: 800}}
                >
                  Proceed to Release
                </Button>
              </Stack>
            </Paper>
          ) : null}
        </Stack>
      </Box>

      <Dialog open={state.releaseDialogOpen} onClose={() => setState((current) => closeReleaseDialog(current))} fullWidth maxWidth="sm">
        <DialogTitle>Proceed to Release</DialogTitle>
        <DialogContent dividers>
          {selectedWorkOrder ? (
            <>
              <Typography sx={{fontSize: 14, color: 'var(--planning-text-secondary)', lineHeight: 1.65}}>
                This is a front-end-only placeholder. No real work order release transaction, SAP integration, MES execution, or warehouse transaction will be triggered.
              </Typography>
              <Alert severity={selectedWorkOrder.readinessStatus === 'Blocked' ? 'error' : 'info'} sx={{mt: 2}}>
                Recommendation: {releaseRecommendation}
              </Alert>
            </>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setState((current) => closeReleaseDialog(current))}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={state.commentDialogOpen} onClose={() => setState((current) => closeCommentDialog(current))} fullWidth maxWidth="sm">
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent dividers>
          <TextField
            multiline
            minRows={4}
            fullWidth
            autoFocus
            label="Planner comment"
            value={commentValue}
            onChange={(event) => setCommentValue(event.target.value)}
            placeholder="Add a local readiness note."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setState((current) => closeCommentDialog(current))}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!commentValue.trim()}
            onClick={() => {
              setState((current) => closeCommentDialog(addCommentToSelectedWorkOrder(current, commentValue.trim())));
              setCommentValue('');
            }}
          >
            Save Comment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
