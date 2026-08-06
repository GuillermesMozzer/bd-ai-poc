import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../../theme';
import {useEffect, useMemo, useState} from 'react';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputBase,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  FilterAltOutlined as FilterIcon,
  DeleteOutline as DeleteIcon,
  EditOutlined as EditIcon,
  GroupsOutlined as UsersIcon,
  MailOutline as InviteIcon,
} from '@mui/icons-material';
import {accessSelectionTree} from '../data/workstation.mock';
import {AccessNode, UserDirectoryRow} from '../data/workstation.types';
import SummaryCard from './SummaryCard';
import {
  buildUserDirectoryRows,
  createHierarchyUser,
  deleteHierarchyUser,
  readHierarchyUsers,
  usersUpdatedEvent,
} from '../usersStore';
import {findAccessPath} from '../hooks/workstation.utils';

type UsersTableProps = {
  nodeId: string | null;
};

const roleOptions = ['Global Admin', 'Site Admin', 'Area Leader', 'Unit Leader', 'Line Leader', 'Operator', 'Plant Manager'] as const;

function collectNodeIds(node: AccessNode): string[] {
  return [node.id, ...(node.children?.flatMap(collectNodeIds) ?? [])];
}

function collectPathIds(tree: AccessNode[], nodeId: string | null): string[] {
  if (!nodeId) return [];
  return (findAccessPath(tree, nodeId) ?? []).map((node) => node.id);
}

function getRoleBasedSelection(args: {
  role: string;
  plantNode: AccessNode | null;
  areaNode: AccessNode | null;
  unitNode: AccessNode | null;
  lineNode: AccessNode | null;
}): string[] {
  const {role, plantNode, areaNode, unitNode, lineNode} = args;
  if (role === 'Global Admin') {
    return accessSelectionTree.flatMap(collectNodeIds);
  }
  if (role === 'Site Admin' || role === 'Plant Manager') {
    return plantNode ? collectNodeIds(plantNode) : [];
  }
  if (role === 'Area Leader') {
    return areaNode ? collectNodeIds(areaNode) : [];
  }
  if (role === 'Unit Leader') {
    return unitNode ? collectNodeIds(unitNode) : [];
  }
  if (role === 'Line Leader') {
    return lineNode ? collectNodeIds(lineNode) : [];
  }
  if (role === 'Operator') {
    return lineNode ? [lineNode.id, ...(lineNode.children?.map((node) => node.id) ?? [])] : [];
  }
  return lineNode ? [lineNode.id] : [];
}

export default function UsersTable({nodeId}: UsersTableProps) {
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [version, setVersion] = useState(0);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('Line Leader');
  const [status, setStatus] = useState<UserDirectoryRow['status']>('Active');
  const [sendInvite, setSendInvite] = useState(true);
  const [plantId, setPlantId] = useState(accessSelectionTree[0]?.id ?? '');
  const [areaId, setAreaId] = useState(accessSelectionTree[0]?.children?.[0]?.id ?? '');
  const [unitId, setUnitId] = useState(accessSelectionTree[0]?.children?.[0]?.children?.[0]?.id ?? '');
  const [lineId, setLineId] = useState(accessSelectionTree[0]?.children?.[0]?.children?.[0]?.children?.[0]?.id ?? '');
  const [selectedAccessNodeIds, setSelectedAccessNodeIds] = useState<string[]>([]);
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const refresh = () => setVersion((current) => current + 1);
    window.addEventListener(usersUpdatedEvent, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(usersUpdatedEvent, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const rows = useMemo(() => {
    void version;
    return buildUserDirectoryRows(nodeId);
  }, [nodeId, version]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => (
      row.name.toLowerCase().includes(search.toLowerCase())
      || row.email.toLowerCase().includes(search.toLowerCase())
      || row.role.toLowerCase().includes(search.toLowerCase())
    ));
  }, [rows, search]);

  const plantNode = accessSelectionTree.find((node) => node.id === plantId) ?? accessSelectionTree[0] ?? null;
  const areaNode = plantNode?.children?.find((node) => node.id === areaId) ?? plantNode?.children?.[0] ?? null;
  const unitNode = areaNode?.children?.find((node) => node.id === unitId) ?? areaNode?.children?.[0] ?? null;
  const lineNode = unitNode?.children?.find((node) => node.id === lineId) ?? unitNode?.children?.[0] ?? null;
  const zoneNodes = lineNode?.children ?? [];

  useEffect(() => {
    if (!dialogOpen) return;
    if (!plantNode) return;
    setAreaId((current) => plantNode.children?.some((node) => node.id === current) ? current : (plantNode.children?.[0]?.id ?? ''));
  }, [dialogOpen, plantNode]);

  useEffect(() => {
    if (!dialogOpen) return;
    if (!areaNode) return;
    setUnitId((current) => areaNode.children?.some((node) => node.id === current) ? current : (areaNode.children?.[0]?.id ?? ''));
  }, [dialogOpen, areaNode]);

  useEffect(() => {
    if (!dialogOpen) return;
    if (!unitNode) return;
    setLineId((current) => unitNode.children?.some((node) => node.id === current) ? current : (unitNode.children?.[0]?.id ?? ''));
  }, [dialogOpen, unitNode]);

  useEffect(() => {
    if (!dialogOpen) return;
    const roleSelection = getRoleBasedSelection({role, plantNode, areaNode, unitNode, lineNode});
    setSelectedAccessNodeIds(roleSelection);
    const focusNodeId = (
      role === 'Global Admin'
        ? plantNode?.id ?? null
        : role === 'Site Admin' || role === 'Plant Manager'
          ? plantNode?.id ?? null
          : role === 'Area Leader'
            ? areaNode?.id ?? null
            : role === 'Unit Leader'
              ? unitNode?.id ?? null
              : lineNode?.id ?? null
    );
    setExpandedNodeIds(new Set(collectPathIds(accessSelectionTree, focusNodeId)));
  }, [dialogOpen, role, plantNode, areaNode, unitNode, lineNode]);

  const stats = useMemo(() => ({
    total: rows.length,
    active: rows.filter((row) => row.status === 'Active').length,
    pending: rows.filter((row) => row.status === 'Pending Invite').length,
    inactive: rows.filter((row) => row.status === 'Inactive').length,
  }), [rows]);

  const selectedAccessSummary = useMemo(() => {
    if (role === 'Global Admin') return 'All plants and all hierarchy';
    if ((role === 'Site Admin' || role === 'Plant Manager') && plantNode) return `${plantNode.label} and all descendants`;
    if (role === 'Area Leader' && areaNode) return `${areaNode.label} and all descendants`;
    if (role === 'Unit Leader' && unitNode) return `${unitNode.label} and all descendants`;
    if (role === 'Line Leader' && lineNode) return `${lineNode.label} and all descendants`;
    const zoneCount = selectedAccessNodeIds.filter((selectedId) => zoneNodes.some((zone) => zone.id === selectedId)).length;
    if (zoneCount) return `${zoneCount} zones in ${lineNode?.label ?? 'line'}`;
    if (selectedAccessNodeIds.includes(lineNode?.id ?? '')) return lineNode?.label ?? 'Line';
    if (selectedAccessNodeIds.includes(unitNode?.id ?? '')) return unitNode?.label ?? 'Unit';
    if (selectedAccessNodeIds.includes(areaNode?.id ?? '')) return areaNode?.label ?? 'Area';
    return plantNode?.label ?? 'Plant';
  }, [areaNode, lineNode, plantNode, role, selectedAccessNodeIds, unitNode, zoneNodes]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedRows(new Set(filteredRows.map((row) => row.id)));
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

  const handleDeleteUser = (id: string) => {
    deleteHierarchyUser(id);
    setSelectedRows((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
    setFullName('');
    setEmail('');
    setRole('Line Leader');
    setStatus('Active');
    setSendInvite(true);
    setSelectedAccessNodeIds([]);
  };

  const handleAddUser = () => {
    if (!fullName.trim() || !plantNode || !areaNode || !unitNode || !lineNode) return;
    const generatedEmail = `${fullName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '.') || 'user'}@acme.com`;
    const primaryNodeId = selectedAccessNodeIds[0] ?? lineNode.id;

    createHierarchyUser({
      name: fullName.trim(),
      email: email.trim() || generatedEmail,
      role,
      status,
      primaryNodeId,
      accessNodeIds: selectedAccessNodeIds.length ? selectedAccessNodeIds : getRoleBasedSelection({role, plantNode, areaNode, unitNode, lineNode}),
    });

    setDialogOpen(false);
  };

  const getStatusStyle = (value: UserDirectoryRow['status']) => {
    if (value === 'Active') return {bg: tokenSuccess.lightest, color: tokenSuccess.main};
    if (value === 'Pending Invite') return {bg: tokenNeutral.lighter, color: tokenWarning.dark};
    return {bg: workstationVisuals.slateSurface, color: workstationVisuals.textSecondary};
  };

  return (
    <Box>
      <Stack direction="row" spacing={3} sx={{mb: 4}}>
        <SummaryCard label="Total Users" value={stats.total} icon={<UsersIcon />} color={tokenBrand.main} />
        <SummaryCard label="Active" value={stats.active} icon={<UsersIcon />} color={tokenSuccess.main} />
        <SummaryCard label="Pending Invite" value={stats.pending} icon={<InviteIcon />} color={tokenWarning.main} />
        <SummaryCard label="Inactive" value={stats.inactive} icon={<UsersIcon />} color={workstationVisuals.textSecondary} />
      </Stack>

      <Box sx={{display: 'flex', gap: 1.5, mb: 3, alignItems: 'center'}}>
        <Paper elevation={0} sx={{flex: 1, height: 44, display: 'flex', alignItems: 'center', px: 2, borderRadius: 2, border: `1px solid ${workstationVisuals.tierBorder}`, bgcolor: tokenCommon.white}}>
          <InputBase value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users..." sx={{flex: 1, fontSize: 14}} />
        </Paper>
        <Button variant="outlined" startIcon={<FilterIcon sx={{fontSize: 18}} />} sx={{textTransform: 'none', borderRadius: 2, height: 44, borderColor: workstationVisuals.tierBorder, color: workstationVisuals.tierTextLabel}}>
          Filters
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon sx={{fontSize: 18}} />}
          onClick={handleOpenDialog}
          sx={{textTransform: 'none', borderRadius: 2, height: 44, bgcolor: tokenBrand.main, boxShadow: 'none', '&:hover': {bgcolor: tokenBrand.dark, boxShadow: 'none'}}}
        >
          Add User
        </Button>
      </Box>

      <Paper elevation={0} sx={{borderRadius: 3, border: `1px solid ${workstationVisuals.tierBorder}`, overflow: 'hidden'}}>
        <Box sx={{display: 'grid', gridTemplateColumns: '48px 2fr 1fr 1fr 1fr 1fr 1.2fr 1fr 1.2fr 100px', px: 2, py: 1.5, bgcolor: workstationVisuals.slateSurface, borderBottom: `1px solid ${workstationVisuals.tierBorder}`, alignItems: 'center'}}>
          <Checkbox
            size="small"
            indeterminate={selectedRows.size > 0 && selectedRows.size < filteredRows.length}
            checked={filteredRows.length > 0 && selectedRows.size === filteredRows.length}
            onChange={handleSelectAll}
          />
          {['User', 'Plant', 'Area', 'Unit', 'Line', 'Role', 'Status', 'Last Activity', 'Actions'].map((label) => (
            <Typography key={label} sx={{fontSize: 12, color: workstationVisuals.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.025em'}}>
              {label}
            </Typography>
          ))}
        </Box>

        {filteredRows.map((row) => {
          const statusStyle = getStatusStyle(row.status);
          const isSelected = selectedRows.has(row.id);

          return (
            <Box key={row.id} sx={{display: 'grid', gridTemplateColumns: '48px 2fr 1fr 1fr 1fr 1fr 1.2fr 1fr 1.2fr 100px', px: 2, py: 2, alignItems: 'center', borderBottom: `1px solid ${workstationVisuals.slateSurface}`, bgcolor: isSelected ? tokenNeutral.lightest : 'transparent', '&:hover': {bgcolor: isSelected ? tokenNeutral.lightest : workstationVisuals.slateSurface}, '&:last-child': {borderBottom: 'none'}}}>
              <Checkbox size="small" checked={isSelected} onChange={() => handleSelectRow(row.id)} />
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                <Avatar sx={{width: 32, height: 32, fontSize: 13, fontWeight: 700, bgcolor: row.avatarTone, color: workstationVisuals.textPrimary}}>{row.initials}</Avatar>
                <Box>
                  <Typography sx={{fontSize: 14, fontWeight: 700, color: workstationVisuals.textPrimary}}>{row.name}</Typography>
                  <Typography sx={{fontSize: 11, color: workstationVisuals.textMuted}}>{row.email}</Typography>
                </Box>
              </Box>
              <Typography sx={{fontSize: 13, color: workstationVisuals.tierTextLabel}}>{row.plant}</Typography>
              <Typography sx={{fontSize: 13, color: workstationVisuals.tierTextLabel}}>{row.area}</Typography>
              <Typography sx={{fontSize: 13, color: workstationVisuals.tierTextLabel}}>{row.unit}</Typography>
              <Typography sx={{fontSize: 13, color: workstationVisuals.tierTextLabel}}>{row.line}</Typography>
              <Typography sx={{fontSize: 13, fontWeight: 600, color: workstationVisuals.textPrimary}}>{row.role}</Typography>
              <Box>
                <Chip label={row.status} size="small" sx={{height: 24, fontSize: 12, fontWeight: 700, bgcolor: statusStyle.bg, color: statusStyle.color, borderRadius: 1}} />
              </Box>
              <Typography sx={{fontSize: 13, color: workstationVisuals.textSecondary}}>{row.lastActivity}</Typography>
              <Box sx={{display: 'flex', gap: 0.5}}>
                <Tooltip title="Edit">
                  <IconButton size="small" sx={{color: workstationVisuals.textSecondary, '&:hover': {color: tokenBrand.main}}}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => handleDeleteUser(row.id)} sx={{color: workstationVisuals.textSecondary, '&:hover': {color: tokenError.main}}}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          );
        })}
      </Paper>

      <AddUserDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleAddUser}
        fullName={fullName}
        setFullName={setFullName}
        email={email}
        setEmail={setEmail}
        role={role}
        setRole={setRole}
        status={status}
        setStatus={setStatus}
        sendInvite={sendInvite}
        setSendInvite={setSendInvite}
        plantId={plantId}
        setPlantId={setPlantId}
        areaId={areaId}
        setAreaId={setAreaId}
        unitId={unitId}
        setUnitId={setUnitId}
        lineId={lineId}
        setLineId={setLineId}
        selectedAccessNodeIds={selectedAccessNodeIds}
        setSelectedAccessNodeIds={setSelectedAccessNodeIds}
        expandedNodeIds={expandedNodeIds}
        setExpandedNodeIds={setExpandedNodeIds}
        selectedAccessSummary={selectedAccessSummary}
      />
    </Box>
  );
}

function AddUserDialog(props: {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  fullName: string;
  setFullName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  role: string;
  setRole: (value: string) => void;
  status: UserDirectoryRow['status'];
  setStatus: (value: UserDirectoryRow['status']) => void;
  sendInvite: boolean;
  setSendInvite: (value: boolean) => void;
  plantId: string;
  setPlantId: (value: string) => void;
  areaId: string;
  setAreaId: (value: string) => void;
  unitId: string;
  setUnitId: (value: string) => void;
  lineId: string;
  setLineId: (value: string) => void;
  selectedAccessNodeIds: string[];
  setSelectedAccessNodeIds: (value: string[]) => void;
  expandedNodeIds: Set<string>;
  setExpandedNodeIds: (value: Set<string>) => void;
  selectedAccessSummary: string;
}) {
  const {
    open,
    onClose,
    onSubmit,
    fullName,
    setFullName,
    email,
    setEmail,
    role,
    setRole,
    status,
    setStatus,
    sendInvite,
    setSendInvite,
    plantId,
    setPlantId,
    areaId,
    setAreaId,
    unitId,
    setUnitId,
    lineId,
    setLineId,
    selectedAccessNodeIds,
    setSelectedAccessNodeIds,
    expandedNodeIds,
    setExpandedNodeIds,
    selectedAccessSummary,
  } = props;

  const plantNode = accessSelectionTree.find((node) => node.id === plantId) ?? accessSelectionTree[0] ?? null;
  const areaNode = plantNode?.children?.find((node) => node.id === areaId) ?? plantNode?.children?.[0] ?? null;
  const unitNode = areaNode?.children?.find((node) => node.id === unitId) ?? areaNode?.children?.[0] ?? null;
  const lineNode = unitNode?.children?.find((node) => node.id === lineId) ?? unitNode?.children?.[0] ?? null;

  const toggleExpand = (nodeId: string) => {
    const next = new Set(expandedNodeIds);
    if (next.has(nodeId)) next.delete(nodeId);
    else next.add(nodeId);
    setExpandedNodeIds(next);
  };

  const toggleAccess = (node: AccessNode) => {
    const branchIds = collectNodeIds(node);
    const shouldRemove = branchIds.every((id) => selectedAccessNodeIds.includes(id));
    const next = shouldRemove
      ? selectedAccessNodeIds.filter((id) => !branchIds.includes(id))
      : Array.from(new Set([...selectedAccessNodeIds, ...branchIds]));
    setSelectedAccessNodeIds(next);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{sx: {borderRadius: 4, maxHeight: '90vh'}}}>
      <DialogTitle sx={{pb: 1}}>
        <Typography sx={{fontSize: 22, fontWeight: 900, color: tokenBrand.darker}}>Add User</Typography>
        <Typography sx={{fontSize: 13, color: workstationVisuals.textSecondary, mt: 0.35}}>Create a user and assign location-based access.</Typography>
      </DialogTitle>
      <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
        <Paper elevation={0} sx={{p: 2, borderRadius: 3, border: `1px solid ${workstationVisuals.tierBorder}`}}>
          <Typography sx={{fontSize: 16, fontWeight: 900, color: tokenBrand.darker, mb: 2}}>1. Basic Information</Typography>
          <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2}}>
            <Box>
              <Typography sx={{fontSize: 12, fontWeight: 700, color: workstationVisuals.tierTextLabel, mb: 0.8}}>Full Name</Typography>
              <TextField
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Full Name"
                fullWidth
                size="small"
              />
            </Box>
            <FormControl fullWidth size="small">
              <Typography sx={{fontSize: 12, fontWeight: 700, color: workstationVisuals.tierTextLabel, mb: 0.8}}>Role</Typography>
              <Select value={role} onChange={(event) => setRole(event.target.value)}>
                {roleOptions.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
              </Select>
            </FormControl>
            <Box>
              <Typography sx={{fontSize: 12, fontWeight: 700, color: workstationVisuals.tierTextLabel, mb: 0.8}}>Email</Typography>
              <TextField
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                fullWidth
                size="small"
              />
              <Typography sx={{fontSize: 11, color: workstationVisuals.textSecondary, mt: 0.6}}>Optional. If omitted, the table will generate an `@acme.com` address.</Typography>
            </Box>
            <FormControl fullWidth size="small">
              <Typography sx={{fontSize: 12, fontWeight: 700, color: workstationVisuals.tierTextLabel, mb: 0.8}}>Status</Typography>
              <Select value={status} onChange={(event) => setStatus(event.target.value as UserDirectoryRow['status'])}>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Pending Invite">Pending Invite</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mt: 1.5}}>
            <Checkbox checked={sendInvite} onChange={(event) => setSendInvite(event.target.checked)} />
            <Typography sx={{fontWeight: 700, color: workstationVisuals.tierTextLabel}}>Send invite email</Typography>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{p: 2, borderRadius: 3, border: `1px solid ${workstationVisuals.tierBorder}`}}>
          <Typography sx={{fontSize: 16, fontWeight: 900, color: tokenBrand.darker, mb: 0.5}}>2. Access Assignment</Typography>
          <Typography sx={{fontSize: 13, color: workstationVisuals.textSecondary, mb: 2}}>Select location and specify the exact nodes this user can access. Roles now auto-apply the matching scope below the chosen hierarchy.</Typography>

          <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 2, mb: 1.5}}>
            <FormControl fullWidth size="small">
              <Typography sx={{fontSize: 12, fontWeight: 700, color: workstationVisuals.tierTextLabel, mb: 0.8}}>Plant</Typography>
              <Select value={plantId} onChange={(event) => setPlantId(event.target.value)}>
                {accessSelectionTree.map((node) => <MenuItem key={node.id} value={node.id}>{node.label}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <Typography sx={{fontSize: 12, fontWeight: 700, color: workstationVisuals.tierTextLabel, mb: 0.8}}>Area</Typography>
              <Select value={areaId} onChange={(event) => setAreaId(event.target.value)}>
                {plantNode?.children?.map((node) => <MenuItem key={node.id} value={node.id}>{node.label}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <Typography sx={{fontSize: 12, fontWeight: 700, color: workstationVisuals.tierTextLabel, mb: 0.8}}>Unit</Typography>
              <Select value={unitId} onChange={(event) => setUnitId(event.target.value)}>
                {areaNode?.children?.map((node) => <MenuItem key={node.id} value={node.id}>{node.label}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <Typography sx={{fontSize: 12, fontWeight: 700, color: workstationVisuals.tierTextLabel, mb: 0.8}}>Line</Typography>
              <Select value={lineId} onChange={(event) => setLineId(event.target.value)}>
                {unitNode?.children?.map((node) => <MenuItem key={node.id} value={node.id}>{node.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5}}>
            <Chip label={`Selected access: ${selectedAccessSummary}`} sx={{fontWeight: 800, bgcolor: tokenNeutral.lighter, color: tokenBrand.main}} />
            <Button
              onClick={() => setSelectedAccessNodeIds(getRoleBasedSelection({role, plantNode, areaNode, unitNode, lineNode}))}
              sx={{textTransform: 'none', fontWeight: 800}}
            >
              Reapply role scope
            </Button>
          </Box>

          <Paper elevation={0} sx={{border: `1px solid ${workstationVisuals.tierBorder}`, borderRadius: 2.5, maxHeight: 320, overflow: 'auto', p: 1.2}}>
            {plantNode ? (
              <AccessTreeNode
                node={plantNode}
                level={0}
                expandedNodeIds={expandedNodeIds}
                onToggleExpand={toggleExpand}
                selectedNodeIds={selectedAccessNodeIds}
                onToggleAccess={toggleAccess}
              />
            ) : null}
          </Paper>
        </Paper>
      </DialogContent>
      <DialogActions sx={{px: 3, pb: 3}}>
        <Button onClick={onClose} variant="outlined" sx={{fontWeight: 800, textTransform: 'none'}}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" sx={{fontWeight: 900, textTransform: 'none'}}>Add User</Button>
      </DialogActions>
    </Dialog>
  );
}

function AccessTreeNode(props: {
  node: AccessNode;
  level: number;
  expandedNodeIds: Set<string>;
  onToggleExpand: (nodeId: string) => void;
  selectedNodeIds: string[];
  onToggleAccess: (node: AccessNode) => void;
}) {
  const {node, level, expandedNodeIds, onToggleExpand, selectedNodeIds, onToggleAccess} = props;
  const hasChildren = Boolean(node.children?.length);
  const isExpanded = expandedNodeIds.has(node.id);
  const branchIds = collectNodeIds(node);
  const selectedCount = branchIds.filter((id) => selectedNodeIds.includes(id)).length;
  const isSelected = selectedCount === branchIds.length;
  const isIndeterminate = selectedCount > 0 && selectedCount < branchIds.length;

  return (
    <Box>
      <Box sx={{display: 'flex', alignItems: 'center', py: 0.75, pl: 1 + level * 2}}>
        <IconButton size="small" onClick={() => hasChildren && onToggleExpand(node.id)} sx={{mr: 0.5, visibility: hasChildren ? 'visible' : 'hidden'}}>
          {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
        </IconButton>
        <Checkbox checked={isSelected} indeterminate={isIndeterminate} onChange={() => onToggleAccess(node)} size="small" />
        <Typography sx={{fontSize: 13, fontWeight: isSelected ? 800 : 600, color: workstationVisuals.tierTextLabel}}>{node.label}</Typography>
      </Box>
      {hasChildren && isExpanded ? (
        <Box>
          {node.children?.map((child) => (
            <AccessTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expandedNodeIds={expandedNodeIds}
              onToggleExpand={onToggleExpand}
              selectedNodeIds={selectedNodeIds}
              onToggleAccess={onToggleAccess}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  );
}
