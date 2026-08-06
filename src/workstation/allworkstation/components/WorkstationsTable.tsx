import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../../theme';
import {useEffect, useMemo, useState} from 'react';
import {
  Box,
  Paper,
  Typography,
  InputBase,
  Button,
  IconButton,
  Checkbox,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterAltOutlined as FilterIcon,
  ContentCopy as CopyIcon,
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
  InfoOutlined as DetailsIcon,
  OpenInNewOutlined as OpenIcon,
  DevicesOutlined as WorkstationIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  FolderOpenOutlined as FolderIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {useAllWorkstationsData} from '../hooks/useAllWorkstationsData';
import {accessSelectionTree} from '../data/workstation.mock';
import type {AccessNode, AdminWorkstationRow} from '../data/workstation.types';
import {findAccessPath} from '../hooks/workstation.utils';
import {useWorkstationContext} from '../../contexts/WorkstationContext';
import {
  createPublishedWorkstationHistoryEntry,
  getPresetSnapshotForWorkstationTitle,
  readPublishedWorkstations,
  type PublishedWorkstation,
  writePublishedWorkstations,
} from '../../publishedWorkstations';
import {workstationWidgetRegistry} from '../../data/widgetRegistry';

type WorkstationsTableProps = {
  nodeId: string | null;
};

export default function WorkstationsTable({nodeId}: WorkstationsTableProps) {
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [detailsRow, setDetailsRow] = useState<AdminWorkstationRow | null>(null);
  const [detailsTab, setDetailsTab] = useState(0);
  const [destinationSearch, setDestinationSearch] = useState('');
  const [selectedDestinationId, setSelectedDestinationId] = useState(accessSelectionTree[0]?.id ?? null);
  const [expandedDestinationIds, setExpandedDestinationIds] = useState<Set<string>>(new Set());
  const {
    openBlankWorkstationDraft,
    openPredefinedWorkstation,
    openPublishedWorkstation,
  } = useWorkstationContext();
  const {filteredRows: scopedRows} = useAllWorkstationsData(nodeId);

  const filteredRows = useMemo(() => (
    scopedRows.filter((row) => {
      const query = search.trim().toLowerCase();
      if (!query) return true;
      return row.title.toLowerCase().includes(query)
        || row.assignmentSummary.toLowerCase().includes(query);
    })
  ), [scopedRows, search]);

  const selectedWorkstations = useMemo(() => (
    filteredRows.filter((row) => selectedRows.has(row.id))
  ), [filteredRows, selectedRows]);

  const selectedDestinationPath = useMemo(() => (
    selectedDestinationId ? findAccessPath(accessSelectionTree, selectedDestinationId) ?? null : null
  ), [selectedDestinationId]);

  const filteredDestinationTree = useMemo(() => (
    filterAccessTree(accessSelectionTree, destinationSearch)
  ), [destinationSearch]);

  const detailsModel = useMemo(() => (
    detailsRow ? buildWorkstationDetailsModel(detailsRow) : null
  ), [detailsRow]);

  useEffect(() => {
    if (!bulkDialogOpen) return;
    const fallbackId = accessSelectionTree[0]?.id ?? null;
    const nextDestinationId = nodeId && nodeId !== 'all-workstations' ? nodeId : fallbackId;
    setSelectedDestinationId(nextDestinationId);
    setDestinationSearch('');
    setExpandedDestinationIds(new Set(getExpandablePathIds(nextDestinationId)));
  }, [bulkDialogOpen, nodeId]);

  useEffect(() => {
    if (!bulkDialogOpen) return;
    if (destinationSearch.trim()) {
      setExpandedDestinationIds(new Set(getAllExpandableIds(filteredDestinationTree)));
      return;
    }

    setExpandedDestinationIds(new Set(getExpandablePathIds(selectedDestinationId)));
  }, [bulkDialogOpen, destinationSearch, filteredDestinationTree, selectedDestinationId]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(new Set(filteredRows.map((r) => r.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleOpenWorkstation = (row: AdminWorkstationRow) => {
    if (row.action.kind === 'saved' && row.action.workstationId) {
      openPublishedWorkstation(row.action.workstationId);
      return;
    }

    openPredefinedWorkstation(row.title);
  };

  const handleDeleteWorkstation = (row: AdminWorkstationRow) => {
    if (row.action.kind !== 'saved' || !row.action.workstationId) return;
    const nextWorkstations = readPublishedWorkstations().filter((workstation) => workstation.id !== row.action.workstationId);
    writePublishedWorkstations(nextWorkstations);
    setDetailsRow((current) => (current?.id === row.id ? null : current));
    setSelectedRows((current) => {
      const next = new Set(current);
      next.delete(row.id);
      return next;
    });
  };

  const handleOpenDetails = (row: AdminWorkstationRow) => {
    setDetailsRow(row);
    setDetailsTab(0);
  };

  const handleBulkCopy = () => {
    if (!selectedDestinationId || !selectedDestinationPath?.length || !selectedWorkstations.length) return;

    const now = new Date().toISOString();
    const existing = readPublishedWorkstations();
    const sourceById = new Map(existing.map((workstation) => [workstation.id, workstation]));
    const destinationSummary = selectedDestinationPath.map((node) => node.label).join(' / ');

    const copies = selectedWorkstations.map((row, index): PublishedWorkstation => {
      const source = row.action.kind === 'saved' && row.action.workstationId
        ? sourceById.get(row.action.workstationId)
        : null;
      const presetSnapshot = getPresetSnapshotForWorkstationTitle(row.title);

      return {
        id: `ws-copy-${Date.now()}-${index + 1}`,
        title: row.title,
        author: source?.author ?? 'Bulk Copy',
        createdAt: now,
        updatedAt: now,
        history: [
          ...(source?.history ?? [
            createPublishedWorkstationHistoryEntry('Created', `${source?.author?.trim() || 'Workstations Library'} created this workstation.`, source?.createdAt ?? now),
            createPublishedWorkstationHistoryEntry('Published', `Assigned to ${source?.assignmentSummary ?? row.assignmentSummary}.`, source?.updatedAt ?? now),
          ]),
          createPublishedWorkstationHistoryEntry(
            'Copied',
            `Copied from ${source?.assignmentSummary ?? row.assignmentSummary} to ${destinationSummary}.`,
            now,
          ),
          createPublishedWorkstationHistoryEntry('Published', `Assigned to ${destinationSummary}.`, now),
        ],
        domains: source?.domains ?? ['shopfloor', 'actions'],
        apps: source?.apps ?? [],
        widgetCount: source?.widgetCount ?? (presetSnapshot ? 10 : 0),
        layoutStorageKey: `my-workstation-copy-${Date.now()}-${index + 1}`,
        snapshot: source?.snapshot ?? presetSnapshot ?? null,
        bookmarked: false,
        sharedWith: source?.sharedWith ?? ['Line 10 Leads'],
        nodeId: selectedDestinationId,
        assignmentSummary: destinationSummary,
        workstationType: source?.workstationType ?? row.workstationType,
      };
    });

    writePublishedWorkstations([...copies, ...existing]);
    setBulkDialogOpen(false);
    setSelectedRows(new Set());
  };

  const getStatusStyle = (status: AdminWorkstationRow['status']) => {
    switch (status) {
      case 'Active': return {bg: tokenSuccess.lightest, color: tokenSuccess.main};
      case 'Alert': return {bg: tokenNeutral.lighter, color: tokenWarning.dark};
      case 'Inactive': return {bg: workstationVisuals.slateSurface, color: workstationVisuals.textSecondary};
      default: return {bg: workstationVisuals.slateSurface, color: workstationVisuals.textSecondary};
    }
  };

  return (
    <Box>
      <Box sx={{display: 'flex', gap: 1.5, mb: 3, alignItems: 'center'}}>
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            px: 2,
            borderRadius: 2,
            border: `1px solid ${workstationVisuals.tierBorder}`,
            bgcolor: tokenCommon.white,
          }}
        >
          <SearchIcon sx={{fontSize: 20, color: workstationVisuals.textMuted, mr: 1}} />
          <InputBase
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workstations..."
            sx={{flex: 1, fontSize: 14}}
          />
        </Paper>

        <Button
          variant="outlined"
          startIcon={<FilterIcon sx={{fontSize: 18}} />}
          sx={{textTransform: 'none', borderRadius: 2, height: 44, borderColor: workstationVisuals.tierBorder, color: workstationVisuals.tierTextLabel}}
        >
          Filters
        </Button>

        <Button
          variant="outlined"
          startIcon={<CopyIcon sx={{fontSize: 18}} />}
          onClick={() => setBulkDialogOpen(true)}
          disabled={!selectedWorkstations.length}
          sx={{textTransform: 'none', borderRadius: 2, height: 44, borderColor: workstationVisuals.tierBorder, color: workstationVisuals.tierTextLabel}}
        >
          Bulk Actions
        </Button>

        <Button
          variant="contained"
          startIcon={<AddIcon sx={{fontSize: 18}} />}
          onClick={openBlankWorkstationDraft}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            height: 44,
            bgcolor: tokenBrand.main,
            boxShadow: 'none',
            '&:hover': {bgcolor: tokenBrand.dark, boxShadow: 'none'},
          }}
        >
          Add Workstation
        </Button>
      </Box>

      <Paper elevation={0} sx={{borderRadius: 3, border: `1px solid ${workstationVisuals.tierBorder}`, overflow: 'hidden'}}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '48px 1.5fr 1fr 1fr 2fr 1fr 1.5fr 120px',
            px: 2,
            py: 1.5,
            bgcolor: workstationVisuals.slateSurface,
            borderBottom: `1px solid ${workstationVisuals.tierBorder}`,
            alignItems: 'center',
          }}
        >
          <Checkbox
            size="small"
            indeterminate={selectedRows.size > 0 && selectedRows.size < filteredRows.length}
            checked={filteredRows.length > 0 && selectedRows.size === filteredRows.length}
            onChange={handleSelectAll}
          />
          {['Workstation', 'Type', 'Level', 'Assigned To', 'Status', 'Last Activity', 'Actions'].map((label) => (
            <Typography key={label} sx={{fontSize: 12, color: workstationVisuals.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.025em'}}>
              {label}
            </Typography>
          ))}
        </Box>

        {filteredRows.map((row) => {
          const statusStyle = getStatusStyle(row.status);
          const isSelected = selectedRows.has(row.id);

          return (
            <Box
              key={row.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: '48px 1.5fr 1fr 1fr 2fr 1fr 1.5fr 120px',
                px: 2,
                py: 2,
                alignItems: 'center',
                borderBottom: `1px solid ${workstationVisuals.slateSurface}`,
                transition: 'background-color 0.2s',
                bgcolor: isSelected ? tokenNeutral.lightest : 'transparent',
                '&:hover': {bgcolor: isSelected ? tokenNeutral.lightest : workstationVisuals.slateSurface},
                '&:last-child': {borderBottom: 'none'},
              }}
            >
              <Checkbox size="small" checked={isSelected} onChange={() => handleSelectRow(row.id)} />

              <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                <Box sx={{p: 0.75, bgcolor: workstationVisuals.slateSurface, borderRadius: 1.5, color: tokenBrand.main, display: 'flex'}}>
                  <WorkstationIcon sx={{fontSize: 20}} />
                </Box>
                <Typography sx={{fontSize: 14, fontWeight: 700, color: workstationVisuals.textPrimary}}>
                  {row.title}
                </Typography>
              </Box>

              <Typography sx={{fontSize: 13, color: workstationVisuals.tierTextLabel}}>{row.type}</Typography>
              <Typography sx={{fontSize: 13, color: workstationVisuals.tierTextLabel}}>{row.level}</Typography>

              <Box>
                <Typography sx={{fontSize: 13, fontWeight: 600, color: workstationVisuals.textPrimary}}>{row.assignmentSummary}</Typography>
                <Typography sx={{fontSize: 11, color: workstationVisuals.textMuted}}>Published at {row.level.toLowerCase()} level</Typography>
              </Box>

              <Box>
                <Chip
                  label={row.status}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: 12,
                    fontWeight: 700,
                    bgcolor: statusStyle.bg,
                    color: statusStyle.color,
                    borderRadius: 1,
                  }}
                />
              </Box>

              <Typography sx={{fontSize: 13, color: workstationVisuals.textSecondary}}>{row.lastActivity}</Typography>

              <Box sx={{display: 'flex', gap: 0.5}}>
                <Tooltip title="Open">
                  <IconButton size="small" onClick={() => handleOpenWorkstation(row)} sx={{color: workstationVisuals.textSecondary, '&:hover': {color: tokenBrand.main}}}>
                    <OpenIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Details">
                  <IconButton size="small" onClick={() => handleOpenDetails(row)} sx={{color: workstationVisuals.textSecondary, '&:hover': {color: tokenBrand.main}}}>
                    <DetailsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={row.action.kind === 'saved' ? 'Delete' : 'Only published workstations can be deleted here'}>
                  <span>
                    <IconButton
                      size="small"
                      disabled={row.action.kind !== 'saved'}
                      onClick={() => handleDeleteWorkstation(row)}
                      sx={{color: workstationVisuals.textSecondary, '&:hover': {color: tokenError.main}}}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>
          );
        })}
      </Paper>

      <Box sx={{mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Typography sx={{fontSize: 13, color: workstationVisuals.textSecondary}}>
          Showing 1 to {filteredRows.length} of {filteredRows.length} workstations
        </Typography>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
          <Typography sx={{fontSize: 13, color: workstationVisuals.textSecondary}}>
            {selectedWorkstations.length ? `${selectedWorkstations.length} selected` : '25 per page'}
          </Typography>
        </Box>
      </Box>

      <BulkCopyDialog
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
        selectedRows={selectedWorkstations}
        destinationSearch={destinationSearch}
        onDestinationSearchChange={setDestinationSearch}
        selectedDestinationId={selectedDestinationId}
        onSelectDestination={setSelectedDestinationId}
        expandedDestinationIds={expandedDestinationIds}
        onToggleExpanded={(nodeIdValue) => {
          setExpandedDestinationIds((current) => {
            const next = new Set(current);
            if (next.has(nodeIdValue)) next.delete(nodeIdValue);
            else next.add(nodeIdValue);
            return next;
          });
        }}
        filteredDestinationTree={filteredDestinationTree}
        selectedDestinationPath={selectedDestinationPath}
        onConfirm={handleBulkCopy}
      />

      <WorkstationDetailsDialog
        open={Boolean(detailsModel)}
        row={detailsRow}
        details={detailsModel}
        activeTab={detailsTab}
        onChangeTab={setDetailsTab}
        onClose={() => setDetailsRow(null)}
        onOpen={() => detailsRow && handleOpenWorkstation(detailsRow)}
        onDelete={() => detailsRow && handleDeleteWorkstation(detailsRow)}
      />
    </Box>
  );
}

function BulkCopyDialog({
  open,
  onClose,
  selectedRows,
  destinationSearch,
  onDestinationSearchChange,
  selectedDestinationId,
  onSelectDestination,
  expandedDestinationIds,
  onToggleExpanded,
  filteredDestinationTree,
  selectedDestinationPath,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  selectedRows: AdminWorkstationRow[];
  destinationSearch: string;
  onDestinationSearchChange: (value: string) => void;
  selectedDestinationId: string | null;
  onSelectDestination: (value: string) => void;
  expandedDestinationIds: Set<string>;
  onToggleExpanded: (value: string) => void;
  filteredDestinationTree: AccessNode[];
  selectedDestinationPath: AccessNode[] | null;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{sx: {borderRadius: 4}}}>
      <DialogTitle sx={{pb: 1}}>
        <Typography sx={{fontSize: 22, fontWeight: 900, color: tokenBrand.darker}}>Bulk Actions</Typography>
        <Typography sx={{fontSize: 13, color: workstationVisuals.textSecondary, mt: 0.35}}>
          Copy the selected workstations to another plant, area, unit, line, or zone.
        </Typography>
      </DialogTitle>
      <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 2.5}}>
        <Paper elevation={0} sx={{p: 2, borderRadius: 3, border: `1px solid ${workstationVisuals.tierBorder}`}}>
          <Typography sx={{fontSize: 14, fontWeight: 900, color: tokenBrand.darker, mb: 1}}>Selected workstations</Typography>
          <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
            {selectedRows.map((row) => (
              <Chip key={row.id} label={row.title} sx={{fontWeight: 800, bgcolor: tokenNeutral.lighter, color: tokenBrand.main}} />
            ))}
            {!selectedRows.length ? <Typography sx={{fontSize: 12, color: workstationVisuals.textMuted}}>Select one or more workstations first.</Typography> : null}
          </Box>
        </Paper>

        <Paper elevation={0} sx={{p: 2, borderRadius: 3, border: `1px solid ${workstationVisuals.tierBorder}`}}>
          <Typography sx={{fontSize: 14, fontWeight: 900, color: tokenBrand.darker, mb: 1}}>Destination hierarchy</Typography>
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 1.5,
              py: 0.75,
              bgcolor: workstationVisuals.slateSurface,
              borderRadius: 2,
              border: `1px solid ${workstationVisuals.tierBorder}`,
              mb: 1.5,
            }}
          >
            <SearchIcon sx={{fontSize: 18, color: workstationVisuals.textMuted, mr: 1}} />
            <InputBase
              value={destinationSearch}
              onChange={(event) => onDestinationSearchChange(event.target.value)}
              placeholder="Search destination..."
              sx={{fontSize: 13, flex: 1}}
            />
          </Paper>

          <Box sx={{maxHeight: 320, overflowY: 'auto', border: `1px solid ${workstationVisuals.slateSurface}`, borderRadius: 2}}>
            {filteredDestinationTree.map((node) => (
              <DestinationTreeNode
                key={node.id}
                node={node}
                level={0}
                selectedId={selectedDestinationId}
                onSelect={onSelectDestination}
                expandedNodeIds={expandedDestinationIds}
                onToggleExpanded={onToggleExpanded}
              />
            ))}
            {!filteredDestinationTree.length ? (
              <Typography sx={{fontSize: 12, color: workstationVisuals.textMuted, p: 2}}>No destination matched your search.</Typography>
            ) : null}
          </Box>
        </Paper>

        {selectedDestinationPath?.length ? (
          <Paper elevation={0} sx={{p: 2, borderRadius: 3, bgcolor: workstationVisuals.slateSurface, border: `1px solid ${workstationVisuals.tierBorder}`}}>
            <Typography sx={{fontSize: 13, fontWeight: 800, color: tokenBrand.darker, mb: 0.75}}>Copy destination</Typography>
            <Typography sx={{fontSize: 12, color: workstationVisuals.tierTextLabel, lineHeight: 1.6}}>
              {selectedDestinationPath.map((node, index) => (
                <span key={node.id}>
                  {node.label}
                  {index < selectedDestinationPath.length - 1 ? ' / ' : ''}
                </span>
              ))}
            </Typography>
          </Paper>
        ) : null}
      </DialogContent>
      <DialogActions sx={{px: 3, pb: 3}}>
        <Button onClick={onClose} variant="outlined" sx={{fontWeight: 800, textTransform: 'none'}}>Cancel</Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={!selectedRows.length || !selectedDestinationPath?.length}
          sx={{fontWeight: 900, textTransform: 'none'}}
        >
          Copy Selected
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DestinationTreeNode({
  node,
  level,
  selectedId,
  onSelect,
  expandedNodeIds,
  onToggleExpanded,
}: {
  node: AccessNode;
  level: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  expandedNodeIds: Set<string>;
  onToggleExpanded: (id: string) => void;
}) {
  const hasChildren = Boolean(node.children?.length);
  const isSelected = selectedId === node.id;
  const isExpanded = expandedNodeIds.has(node.id);

  return (
    <Box>
      <Box
        onClick={() => onSelect(node.id)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          py: 0.8,
          px: 1.5,
          pl: 1.5 + level * 2,
          cursor: 'pointer',
          bgcolor: isSelected ? tokenNeutral.lightest : 'transparent',
          '&:hover': {bgcolor: isSelected ? tokenNeutral.lightest : workstationVisuals.slateSurface},
        }}
      >
        <Box
          sx={{display: 'flex', alignItems: 'center', mr: 1, visibility: hasChildren ? 'visible' : 'hidden'}}
          onClick={(event) => {
            event.stopPropagation();
            onToggleExpanded(node.id);
          }}
        >
          {isExpanded ? <ExpandMoreIcon sx={{fontSize: 16, color: workstationVisuals.textMuted}} /> : <ChevronRightIcon sx={{fontSize: 16, color: workstationVisuals.textMuted}} />}
        </Box>

        <Checkbox checked={isSelected} size="small" sx={{p: 0.5, mr: 1, color: tokenNeutral.dark, '&.Mui-checked': {color: tokenBrand.main}}} />
        <FolderIcon sx={{fontSize: 18, mr: 1, color: isSelected ? tokenBrand.main : workstationVisuals.textMuted}} />
        <Typography sx={{fontSize: 13, fontWeight: isSelected ? 800 : 500, color: isSelected ? tokenBrand.darker : workstationVisuals.tierTextLabel}}>
          {node.label}
        </Typography>
      </Box>
      {hasChildren && isExpanded ? (
        <Box>
          {node.children?.map((child) => (
            <DestinationTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedNodeIds={expandedNodeIds}
              onToggleExpanded={onToggleExpanded}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  );
}

function filterAccessTree(nodes: AccessNode[], query: string): AccessNode[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return nodes;

  return nodes.reduce<AccessNode[]>((items, node) => {
    const filteredChildren = node.children ? filterAccessTree(node.children, query) : [];
    if (node.label.toLowerCase().includes(normalizedQuery) || filteredChildren.length) {
      items.push({
        ...node,
        children: filteredChildren,
      });
    }
    return items;
  }, []);
}

function getExpandablePathIds(nodeId: string | null) {
  if (!nodeId) return [];
  return (findAccessPath(accessSelectionTree, nodeId) ?? [])
    .filter((node) => node.children?.length)
    .map((node) => node.id);
}

function getAllExpandableIds(nodes: AccessNode[]) {
  return nodes.flatMap((node) => {
    const childIds = node.children?.length ? getAllExpandableIds(node.children) : [];
    return node.children?.length ? [node.id, ...childIds] : childIds;
  });
}

type WorkstationDetailsModel = {
  assignmentSummary: string;
  chips: string[];
  code: string;
  detailsSummary: string;
  focusSummary: string;
  history: Array<{date: string; detail: string; label: string}>;
  line: string;
  plant: string;
  publishScope: string;
  status: string;
  summary: string;
  tags: string[];
  title: string;
  typeLabel: string;
  unit: string;
  area: string;
  widgets: Array<{description: string; label: string}>;
};

function WorkstationDetailsDialog({
  open,
  row,
  details,
  activeTab,
  onChangeTab,
  onClose,
  onOpen,
  onDelete,
}: {
  open: boolean;
  row: AdminWorkstationRow | null;
  details: WorkstationDetailsModel | null;
  activeTab: number;
  onChangeTab: (value: number) => void;
  onClose: () => void;
  onOpen: () => void;
  onDelete: () => void;
}) {
  if (!details || !row) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{sx: {borderRadius: 4, minHeight: 720}}}>
      <DialogTitle sx={{p: 0}}>
        <Box sx={{px: 4, py: 3.5, borderBottom: `1px solid ${workstationVisuals.tierBorder}`}}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2}}>
            <Box>
              <Typography sx={{fontSize: 12, fontWeight: 900, color: workstationVisuals.textMuted, mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.06em'}}>
                Selected Workstation
              </Typography>
              <Typography sx={{fontSize: 22, fontWeight: 900, color: tokenBrand.darker, mb: 1}}>
                {details.title}
              </Typography>
              <Typography sx={{fontSize: 14, color: workstationVisuals.textMuted, fontWeight: 700}}>
                {details.assignmentSummary}
              </Typography>
              <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2}}>
                {details.chips.map((chip, index) => (
                  <Chip
                    key={`${chip}-${index}`}
                    label={chip}
                    size="small"
                    sx={getDetailsChipSx(index)}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
              <IconButton onClick={onOpen} sx={{color: tokenBrand.main}}>
                <OpenIcon />
              </IconButton>
              <IconButton onClick={onDelete} disabled={row.action.kind !== 'saved'} sx={{color: row.action.kind === 'saved' ? tokenNeutral.dark : workstationVisuals.tierBorder}}>
                <DeleteIcon />
              </IconButton>
              <IconButton onClick={onClose} sx={{border: `1px solid ${workstationVisuals.tierBorder}`, borderRadius: 2, color: workstationVisuals.textSecondary}}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(_, value) => onChangeTab(value)}
          sx={{
            px: 3,
            borderBottom: `1px solid ${workstationVisuals.tierBorder}`,
            '& .MuiTabs-indicator': {height: 3, bgcolor: tokenBrand.main},
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 800,
              fontSize: 14,
              color: workstationVisuals.textSecondary,
              minHeight: 54,
              '&.Mui-selected': {color: tokenBrand.main},
            },
          }}
        >
          <Tab label="Properties" />
          <Tab label="Details" />
          <Tab label="History" />
        </Tabs>
      </DialogTitle>

      <DialogContent sx={{p: 3, bgcolor: tokenCommon.white}}>
        {activeTab === 0 ? <PropertiesTab details={details} /> : null}
        {activeTab === 1 ? <DetailsTab details={details} /> : null}
        {activeTab === 2 ? <HistoryTab details={details} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function PropertiesTab({details}: {details: WorkstationDetailsModel}) {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2.5}}>
      <DetailsSection title="Basic Information">
        <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, p: 2.5}}>
          <DetailsValue label="Name" value={details.title} />
          <DetailsValue label="Code" value={details.code} />
          <DetailsValue label="Type" value={details.typeLabel} />
          <DetailsValue label="Summary" value={details.summary} />
        </Box>
      </DetailsSection>

      <DetailsSection title="Classification">
        <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, p: 2.5}}>
          <DetailsValue label="Site" value={details.plant} />
          <DetailsValue label="Area" value={details.area} />
          <DetailsValue label="Unit" value={details.unit} />
          <DetailsValue label="Line" value={details.line} />
          <DetailsValue label="Publish Scope" value={details.publishScope} />
          <DetailsValue label="Status" value={details.status} />
        </Box>
      </DetailsSection>
    </Box>
  );
}

function DetailsTab({details}: {details: WorkstationDetailsModel}) {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2.5}}>
      <DetailsSection title="Workstation Focus">
        <Box sx={{p: 2.5}}>
          <Typography sx={{fontSize: 15, color: workstationVisuals.textSecondary, lineHeight: 1.7, mb: 2}}>
            {details.focusSummary}
          </Typography>
          <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
            {details.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{height: 30, borderRadius: 10, bgcolor: workstationVisuals.slateSurface, color: workstationVisuals.textSecondary, fontWeight: 800, border: `1px solid ${workstationVisuals.tierBorder}`}}
              />
            ))}
          </Box>
        </Box>
      </DetailsSection>

      <DetailsSection title="Enabled Widgets">
        <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, p: 2.5}}>
          {details.widgets.map((widget) => (
            <Box key={widget.label} sx={{border: `1px solid ${tokenNeutral.main}`, borderRadius: 2, p: 1.6, bgcolor: tokenNeutral.lightest}}>
              <Typography sx={{fontSize: 15, fontWeight: 900, color: tokenBrand.darker, mb: 0.35}}>
                {widget.label}
              </Typography>
              <Typography sx={{fontSize: 13, color: workstationVisuals.textMuted, lineHeight: 1.5}}>
                {widget.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </DetailsSection>
    </Box>
  );
}

function HistoryTab({details}: {details: WorkstationDetailsModel}) {
  return (
    <DetailsSection title="">
      <Box sx={{p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5, minHeight: 420}}>
        {details.history.map((entry) => (
          <Box key={`${entry.label}-${entry.date}`} sx={{display: 'flex', justifyContent: 'space-between', gap: 2}}>
            <Box sx={{display: 'flex', gap: 1.5}}>
              <Box sx={{width: 14, pt: 0.8, display: 'flex', justifyContent: 'center'}}>
                <Box sx={{width: 12, height: 12, borderRadius: '50%', bgcolor: tokenBrand.main}} />
              </Box>
              <Box>
                <Typography sx={{fontSize: 15, fontWeight: 900, color: tokenBrand.darker, mb: 0.35}}>
                  {entry.label}
                </Typography>
                <Typography sx={{fontSize: 14, color: workstationVisuals.textMuted}}>
                  {entry.detail}
                </Typography>
              </Box>
            </Box>
            <Typography sx={{fontSize: 14, fontWeight: 700, color: workstationVisuals.textMuted, whiteSpace: 'nowrap'}}>
              {entry.date}
            </Typography>
          </Box>
        ))}
      </Box>
    </DetailsSection>
  );
}

function DetailsSection({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <Paper elevation={0} sx={{borderRadius: 3, border: `1px solid ${workstationVisuals.tierBorder}`, overflow: 'hidden'}}>
      {title ? (
        <Box sx={{px: 2.5, py: 1.8, borderBottom: `1px solid ${workstationVisuals.tierBorder}`}}>
          <Typography sx={{fontSize: 14, fontWeight: 900, color: tokenBrand.darker, textTransform: 'uppercase'}}>
            {title}
          </Typography>
        </Box>
      ) : null}
      {children}
    </Paper>
  );
}

function DetailsValue({label, value}: {label: string; value: string}) {
  return (
    <Box>
      <Typography sx={{fontSize: 12, fontWeight: 900, color: workstationVisuals.textMuted, mb: 0.65, textTransform: 'uppercase'}}>
        {label}
      </Typography>
      <Typography sx={{fontSize: 15, fontWeight: 800, color: tokenBrand.darker, lineHeight: 1.5}}>
        {value}
      </Typography>
    </Box>
  );
}

function buildWorkstationDetailsModel(row: AdminWorkstationRow): WorkstationDetailsModel {
  const published = row.action.kind === 'saved' && row.action.workstationId
    ? readPublishedWorkstations().find((workstation) => workstation.id === row.action.workstationId) ?? null
    : null;
  const path = row.nodeId ? findAccessPath(accessSelectionTree, row.nodeId) ?? [] : [];
  const [plant, area, unit, line] = path;
  const preset = published?.snapshot ?? getPresetSnapshotForWorkstationTitle(row.title);
  const widgetIds = resolveWidgetIds(preset, row.title);
  const widgets = widgetIds
    .map((widgetId) => workstationWidgetRegistry.find((widget) => widget.id === widgetId))
    .filter((widget): widget is (typeof workstationWidgetRegistry)[number] => Boolean(widget))
    .slice(0, 6)
    .map((widget) => ({label: widget.label, description: widget.description}));
  const focus = getWorkstationFocus(row.title, row.level, row.status);
  const typeLabel = row.action.kind === 'saved' ? 'Custom' : row.type;
  const history = buildWorkstationHistory(row, published);

  return {
    title: row.title,
    assignmentSummary: row.assignmentSummary,
    chips: [row.level, row.status, typeLabel],
    code: buildWorkstationCode(row.title, line?.label ?? row.level, plant?.label ?? 'Site'),
    summary: focus.summary,
    detailsSummary: focus.summary,
    focusSummary: focus.summary,
    typeLabel,
    plant: plant?.label ?? 'All Sites',
    area: area?.label ?? '-',
    unit: unit?.label ?? '-',
    line: line?.label ?? (path[path.length - 1]?.label ?? '-'),
    publishScope: `Published at ${row.level.toLowerCase()} level`,
    status: row.status,
    tags: [row.level, typeLabel, row.status, ...focus.tags].slice(0, 7),
    widgets,
    history,
  };
}

function getWorkstationFocus(title: string, level: string, status: string) {
  const normalized = title.trim().toLowerCase();
  if (normalized === 'operator view') {
    return {
      summary: 'Frontline execution workspace for shift routines, response actions, and immediate production support.',
      tags: ['Shift execution', 'Operator tasks', 'Andon response', 'Material readiness'],
    };
  }
  if (normalized === 'tier 1') {
    return {
      summary: 'Daily tier board for line-level ownership, action follow-up, and fast issue containment.',
      tags: ['Safety review', 'Quality review', 'Action tracking', 'Daily escalation'],
    };
  }
  if (normalized === 'tier 2') {
    return {
      summary: 'Area-level coordination workspace to recover performance losses and unblock shared issues.',
      tags: ['Downtime review', 'Cross-functional support', 'Escalation routing', 'Loss recovery'],
    };
  }
  if (normalized === 'tier 3') {
    return {
      summary: 'Leadership escalation board for department priorities, systemic blockers, and site-level action closure.',
      tags: ['Department review', 'Systemic issues', 'Resource alignment', 'Executive follow-up'],
    };
  }
  if (normalized === 'leader view') {
    return {
      summary: 'Performance overview for leadership with operational health, throughput, and site-level exception monitoring.',
      tags: ['Performance health', 'Machine health', 'Operational metrics', 'Traceability'],
    };
  }

  return {
    summary: `${title} is a ${status.toLowerCase()} workstation scoped for ${level.toLowerCase()} workflows and local operational follow-up.`,
    tags: ['Local workflow', 'Published view', 'Operational support', 'Custom workspace'],
  };
}

function resolveWidgetIds(snapshot: unknown, title: string) {
  const layoutState = typeof snapshot === 'object' && snapshot && 'layoutState' in snapshot
    ? (snapshot as {layoutState?: {layouts?: {lg?: Array<{i?: unknown}>}}}).layoutState
    : null;
  const layoutIds = layoutState?.layouts?.lg
    ?.map((item) => (typeof item?.i === 'string' ? item.i : null))
    .filter((item): item is string => Boolean(item));

  if (layoutIds?.length) {
    return Array.from(new Set(layoutIds));
  }

  const normalized = title.trim().toLowerCase();
  if (normalized === 'operator view') return ['shift-schedule', 'operator-tasks', 'andon-actions', 'output-vs-plan', 'material-risks', 'quick-actions'];
  if (normalized === 'leader view') return ['oee-performance', 'downtime-overview', 'output-vs-plan', 'machine-health', 'traceability-preview', 'operational-metrics'];
  return ['action-tracker', 'escalation-tags', 'quality', 'safety', 'delivery', 'cost'];
}

function buildWorkstationHistory(row: AdminWorkstationRow, published: PublishedWorkstation | null) {
  if (published?.history?.length) {
    return published.history.map((entry) => ({
      label: entry.label,
      detail: entry.detail,
      date: formatDetailsDate(entry.date),
    }));
  }

  const createdDate = formatDetailsDate(published?.createdAt);
  const updatedDate = formatDetailsDate(published?.updatedAt);
  const createdBy = published?.author?.trim() || 'Workstations Library';
  const history = [
    {
      label: 'Created',
      detail: `${createdBy} created this workstation.`,
      date: createdDate,
    },
    {
      label: 'Published',
      detail: `Assigned to ${row.assignmentSummary}.`,
      date: updatedDate,
    },
  ];

  if (published?.updatedAt && published.updatedAt !== published.createdAt) {
    history.push({
      label: 'Updated',
      detail: `${published.widgetCount} widgets are currently enabled in this workstation.`,
      date: updatedDate,
    });
  }

  return history;
}

function buildWorkstationCode(title: string, lineLabel: string, plantLabel: string) {
  const titleCode = title.split(/\s+/).map((part) => part[0]).join('').slice(0, 3).toUpperCase();
  const plantCode = plantLabel.split(/\s+/).map((part) => part[0]).join('').slice(0, 3).toUpperCase();
  const lineCode = lineLabel.toUpperCase().replace(/[^A-Z0-9]+/g, '');
  return `${titleCode}-${plantCode}-${lineCode || 'WS'}`;
}

function formatDetailsDate(value?: string) {
  if (!value) return 'May 12, 2026, 10:15 AM';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getDetailsChipSx(index: number) {
  if (index === 0) {
    return {height: 32, borderRadius: 10, bgcolor: tokenNeutral.lighter, color: tokenBrand.main, fontWeight: 900};
  }
  if (index === 1) {
    return {height: 32, borderRadius: 10, bgcolor: tokenSuccess.lightest, color: tokenSuccess.main, fontWeight: 900};
  }
  return {height: 32, borderRadius: 10, bgcolor: tokenCommon.white, color: workstationVisuals.textSecondary, fontWeight: 900, border: `1px solid ${workstationVisuals.tierBorder}`};
}
