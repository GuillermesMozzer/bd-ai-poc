import { ReactNode, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import StandardDialog from '../../common/components/StandardDialog';
import {
  AccountTree as AccountTreeIcon,
  BuildCircle as ComponentIcon,
  Business as PlantIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  History as HistoryIcon,
  PrecisionManufacturing as EquipmentIcon,
  QrCodeScanner as ScanIcon,
  Search as SearchIcon,
  Settings as SubsystemIcon,
} from '@mui/icons-material';
import { activeTheme } from '../../theme';

type EquipmentNodeType = 'plant' | 'unit' | 'line' | 'equipment' | 'subsystem' | 'component';

type EquipmentNode = {
  id: string;
  name: string;
  type: EquipmentNodeType;
  tags?: string[];
  barcode?: string;
  children?: EquipmentNode[];
};

export type EquipmentSelection = {
  id: string;
  name: string;
  type: EquipmentNodeType;
  path: string;
  tags: string[];
  barcode?: string;
};

type IndexedEquipmentNode = EquipmentSelection & {
  node: EquipmentNode;
  searchableText: string;
};

type EquipmentSelectorProps = {
  value: EquipmentSelection | null;
  onChange: (selection: EquipmentSelection) => void;
  label?: string;
  placeholder?: string;
  fallbackValue?: string;
  criticality?: string;
};

const selectableTypes = new Set<EquipmentNodeType>(['equipment', 'subsystem', 'component']);

const criticalityBadgeStyles: Record<string, { bg: string; color: string; border: string }> = {
  A: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  B: { bg: '#FFF7ED', color: '#D97706', border: '#FED7AA' },
  C: { bg: '#ECFDF3', color: '#15803D', border: '#BBF7D0' },
};

const neutralCriticalityBadgeStyle = { bg: 'background.default', color: 'text.secondary', border: 'var(--paper-border-color)' };

const equipmentHierarchy: EquipmentNode[] = [
  {
    id: 'plant-a',
    name: 'Plant A',
    type: 'plant',
    children: [
      {
        id: 'unit-b',
        name: 'Unit B',
        type: 'unit',
        children: [
          {
            id: 'line-10',
            name: 'Line 10',
            type: 'line',
            children: [
              {
                id: 'SA-204',
                name: 'Syringe Assembly Machine SA-204',
                type: 'equipment',
                barcode: 'BC-SA-204',
                tags: ['SA-204', 'syringe', 'assembly', 'critical'],
                children: [
                  {
                    id: 'SA-204-FILL',
                    name: 'Filling System',
                    type: 'subsystem',
                    barcode: 'BC-SA-204-FILL',
                    tags: ['filling', 'dosing', 'liquid path'],
                    children: [
                      {
                        id: 'SA-204-FHA',
                        name: 'Filling Head Assembly',
                        type: 'component',
                        barcode: 'BC-SA-204-FHA',
                        tags: ['head', 'subassembly', 'filling'],
                      },
                      {
                        id: 'SA-204-SERVO',
                        name: 'Servo Motor',
                        type: 'component',
                        barcode: 'BC-SA-204-SERVO',
                        tags: ['motor', 'drive', 'servo'],
                      },
                      {
                        id: 'SA-204-NOZZLE',
                        name: 'Nozzle Cluster',
                        type: 'component',
                        barcode: 'BC-SA-204-NOZZLE',
                        tags: ['nozzle', 'cluster', 'filling'],
                      },
                      {
                        id: 'SA-204-BEARING',
                        name: 'Drive Bearing',
                        type: 'component',
                        barcode: 'BC-SA-204-BEARING',
                        tags: ['bearing', 'drive', 'rotating'],
                      },
                    ],
                  },
                  {
                    id: 'SA-204-TRANSPORT',
                    name: 'Transport System',
                    type: 'subsystem',
                    barcode: 'BC-SA-204-TRANSPORT',
                    tags: ['transport', 'conveyor', 'indexing'],
                  },
                ],
              },
              {
                id: 'VI-210',
                name: 'Vision Inspection VI-210',
                type: 'equipment',
                barcode: 'BC-VI-210',
                tags: ['VI-210', 'camera', 'inspection', 'vision'],
                children: [
                  {
                    id: 'VI-210-CAMERA',
                    name: 'Camera Array',
                    type: 'subsystem',
                    barcode: 'BC-VI-210-CAMERA',
                    tags: ['camera', 'inspection'],
                  },
                  {
                    id: 'VI-210-LIGHT',
                    name: 'Lighting Module',
                    type: 'component',
                    barcode: 'BC-VI-210-LIGHT',
                    tags: ['lighting', 'illumination'],
                  },
                ],
              },
              {
                id: 'LM-88',
                name: 'Labeling Machine LM-88',
                type: 'equipment',
                barcode: 'BC-LM-88',
                tags: ['LM-88', 'labeler', 'labeling'],
                children: [
                  {
                    id: 'LM-88-APPLICATOR',
                    name: 'Label Applicator',
                    type: 'subsystem',
                    barcode: 'BC-LM-88-APPLICATOR',
                    tags: ['applicator', 'label'],
                  },
                ],
              },
            ],
          },
          {
            id: 'line-30',
            name: 'Line 30 - Molding',
            type: 'line',
            children: [
              {
                id: 'MM-301',
                name: 'Molding Machine MM-301',
                type: 'equipment',
                barcode: 'BC-MM-301',
                tags: ['MM-301', 'molding', 'injection', 'mold cavities'],
                children: [
                  {
                    id: 'MM-301-MOLD',
                    name: 'Mold Tooling',
                    type: 'subsystem',
                    barcode: 'BC-MM-301-MOLD',
                    tags: ['mold', 'tooling', 'cavities', 'molding'],
                    children: [
                      {
                        id: 'MM-301-CAVITY-BLOCK',
                        name: 'Cavity Block',
                        type: 'component',
                        barcode: 'BC-MM-301-CAVITY',
                        tags: ['cavity', 'mold', 'quality', 'molding'],
                      },
                    ],
                  },
                ],
              },
              {
                id: 'M-004',
                name: 'Mold M-004',
                type: 'equipment',
                barcode: 'BC-M-004',
                tags: ['M-004', 'mold', 'molding', 'tooling'],
              },
            ],
          },
          {
            id: 'line-20',
            name: 'Line 20',
            type: 'line',
            children: [
              {
                id: 'CT-32',
                name: 'Cartoner CT-32',
                type: 'equipment',
                barcode: 'BC-CT-32',
                tags: ['CT-32', 'cartoner', 'carton'],
                children: [
                  {
                    id: 'CT-32-FEED',
                    name: 'Carton Feed Magazine',
                    type: 'subsystem',
                    barcode: 'BC-CT-32-FEED',
                    tags: ['feed', 'magazine'],
                  },
                  {
                    id: 'CT-32-TUCKER',
                    name: 'Flap Tuck Assembly',
                    type: 'component',
                    barcode: 'BC-CT-32-TUCKER',
                    tags: ['flap', 'tuck', 'subassembly'],
                  },
                ],
              },
              {
                id: 'RJ-11',
                name: 'Reject Station RJ-11',
                type: 'equipment',
                barcode: 'BC-RJ-11',
                tags: ['RJ-11', 'reject', 'diverter'],
                children: [
                  {
                    id: 'RJ-11-DIVERTER',
                    name: 'Pneumatic Diverter',
                    type: 'component',
                    barcode: 'BC-RJ-11-DIVERTER',
                    tags: ['pneumatic', 'reject'],
                  },
                ],
              },
              {
                id: 'PC-09',
                name: 'Packaging Conveyor PC-09',
                type: 'equipment',
                barcode: 'BC-PC-09',
                tags: ['PC-09', 'packaging', 'conveyor'],
                children: [
                  {
                    id: 'PC-09-BELT',
                    name: 'Belt Drive',
                    type: 'subsystem',
                    barcode: 'BC-PC-09-BELT',
                    tags: ['belt', 'drive'],
                  },
                  {
                    id: 'PC-09-SENSOR',
                    name: 'Jam Detection Sensor',
                    type: 'component',
                    barcode: 'BC-PC-09-SENSOR',
                    tags: ['sensor', 'jam', 'photoeye'],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

const recentEquipmentIds = ['SA-204', 'MM-301', 'VI-210', 'LM-88'];

function buildEquipmentIndex(nodes: EquipmentNode[], parentPath: string[] = []): IndexedEquipmentNode[] {
  return nodes.flatMap((node) => {
    const pathParts = [...parentPath, node.name];
    const path = pathParts.join(' > ');
    const tags = node.tags ?? [];
    const indexedNode: IndexedEquipmentNode = {
      id: node.id,
      name: node.name,
      type: node.type,
      path,
      tags,
      barcode: node.barcode,
      node,
      searchableText: [node.name, node.id, node.barcode, ...tags, path].filter(Boolean).join(' ').toLowerCase(),
    };

    return [indexedNode, ...buildEquipmentIndex(node.children ?? [], pathParts)];
  });
}

export function findEquipmentSelectionByName(value?: string | null): EquipmentSelection | null {
  if (!value) return null;

  const normalizedValue = value.trim().toLowerCase();
  return buildEquipmentIndex(equipmentHierarchy)
    .filter((item) => selectableTypes.has(item.type))
    .find((item) => (
      item.name.toLowerCase() === normalizedValue ||
      item.id.toLowerCase() === normalizedValue ||
      item.searchableText.includes(normalizedValue)
    )) ?? null;
}

function getNodeIcon(type: EquipmentNodeType): ReactNode {
  const sx = { fontSize: 17 };

  if (type === 'plant') return <PlantIcon sx={{ ...sx, color: 'text.secondary' }} />;
  if (type === 'unit' || type === 'line') return <AccountTreeIcon sx={{ ...sx, color: 'text.secondary' }} />;
  if (type === 'equipment') return <EquipmentIcon sx={{ ...sx, color: '#2563EB' }} />;
  if (type === 'subsystem') return <SubsystemIcon sx={{ ...sx, color: '#0F766E' }} />;
  return <ComponentIcon sx={{ ...sx, color: '#7C3AED' }} />;
}

function getTypeLabel(type: EquipmentNodeType) {
  if (type === 'equipment') return 'Equipment';
  if (type === 'subsystem') return 'Subsystem';
  if (type === 'component') return 'Component';
  if (type === 'line') return 'Line';
  if (type === 'unit') return 'Unit';
  return 'Plant';
}

function ResultCard({ item, selected, onSelect }: { item: EquipmentSelection; selected: boolean; onSelect: () => void }) {
  return (
    <Button
      onClick={onSelect}
      fullWidth
      sx={{
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        gap: 1,
        p: 1,
        minHeight: 58,
        borderRadius: 1,
        border: selected ? '1px solid var(--token-brand-lightest)' : '1px solid var(--paper-border-color)',
        bgcolor: selected ? 'var(--token-brand-soft-bg)' : 'background.paper',
        color: 'text.primary',
        textAlign: 'left',
        textTransform: 'none',
        boxShadow: selected ? '0 0 0 1px rgba(37, 99, 235, 0.12)' : 'none',
        '&:hover': { bgcolor: 'background.default', borderColor: 'var(--token-brand-lightest)' },
      }}
    >
      <Box sx={{ pt: 0.25, flexShrink: 0 }}>{getNodeIcon(item.type)}</Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 800, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.name}
          </Typography>
          <Chip
            label={getTypeLabel(item.type)}
            size="small"
            sx={{ height: 18, borderRadius: 1, bgcolor: 'background.default', color: 'text.secondary', fontSize: 9.5, fontWeight: 800, '& .MuiChip-label': { px: 0.65 } }}
          />
        </Box>
        <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 11.5, lineHeight: 1.35 }}>
          {item.path}
        </Typography>
      </Box>
    </Button>
  );
}

function HierarchyRow({
  node,
  depth,
  index,
  expanded,
  selectedId,
  onToggle,
  onSelect,
}: {
  node: EquipmentNode;
  depth: number;
  index: IndexedEquipmentNode[];
  expanded: Set<string>;
  selectedId?: string;
  onToggle: (id: string) => void;
  onSelect: (selection: EquipmentSelection) => void;
}) {
  const hasChildren = Boolean(node.children?.length);
  const isExpanded = expanded.has(node.id);
  const isSelectable = selectableTypes.has(node.type);
  const item = index.find((entry) => entry.id === node.id);
  const isSelected = selectedId === node.id;

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          minHeight: 36,
          pl: 1 + depth * 2,
          pr: 0.75,
          borderRadius: 1,
          bgcolor: isSelected ? 'var(--token-brand-soft-bg)' : 'transparent',
          '&:hover': { bgcolor: isSelected ? 'var(--token-brand-soft-bg)' : 'background.default' },
        }}
      >
        <IconButton
          size="small"
          onClick={() => hasChildren && onToggle(node.id)}
          disabled={!hasChildren}
          sx={{ width: 26, height: 26, mr: 0.35, color: hasChildren ? 'text.secondary' : 'transparent' }}
          aria-label={isExpanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
        >
          {isExpanded ? <ExpandMoreIcon sx={{ fontSize: 17 }} /> : <ChevronRightIcon sx={{ fontSize: 17 }} />}
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, flex: 1 }}>
          {getNodeIcon(node.type)}
          <Typography sx={{ color: isSelectable ? 'text.primary' : 'text.secondary', fontSize: 12.5, fontWeight: isSelectable ? 800 : 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {node.name}
          </Typography>
        </Box>
        {isSelectable && item ? (
          <Button
            size="small"
            onClick={() => onSelect(item)}
            sx={{
              minWidth: 0,
              height: 26,
              px: 1,
              borderRadius: 1,
              color: '#2563EB',
              fontSize: 10.5,
              fontWeight: 900,
              textTransform: 'none',
            }}
          >
            Select
          </Button>
        ) : null}
      </Box>
      {hasChildren && isExpanded ? (
        <Box>
          {node.children!.map((child) => (
            <HierarchyRow
              key={child.id}
              node={child}
              depth={depth + 1}
              index={index}
              expanded={expanded}
              selectedId={selectedId}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  );
}

export default function EquipmentSelector({
  value,
  onChange,
  label = 'Equipment *',
  placeholder = 'Equipment ID or Scan barcode',
  fallbackValue = '',
  criticality,
}: EquipmentSelectorProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(['plant-a', 'unit-b', 'line-10', 'SA-204', 'SA-204-FILL'])
  );

  const index = useMemo(() => buildEquipmentIndex(equipmentHierarchy).filter((item) => selectableTypes.has(item.type)), []);
  const allNodesIndex = useMemo(() => buildEquipmentIndex(equipmentHierarchy), []);
  const recentEquipment = useMemo(
    () => recentEquipmentIds.flatMap((id) => index.find((item) => item.id === id) ?? []),
    [index]
  );

  const selectItem = (item: EquipmentSelection) => {
    onChange(item);
    setDrawerOpen(false);
    setQuery('');
  };

  const toggleExpanded = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <Box sx={{ mb: 1.35, mt: 1.2 }}>
      <Box sx={{ border: '1px solid var(--paper-border-color)', borderRadius: 1.5, position: 'relative', bgcolor: 'background.paper' }}>
        <Typography sx={{ position: 'absolute', top: -10, left: 12, zIndex: 2, px: 0.5, bgcolor: 'background.paper', fontSize: 10, color: 'text.secondary' }}>
          {label}
        </Typography>
        <Box
          onClick={() => setDrawerOpen(true)}
          sx={{
            minHeight: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            px: 1.2,
            cursor: 'pointer',
            '&:hover': { bgcolor: 'background.default' },
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: 13.5, color: value || fallbackValue ? 'text.primary' : 'text.secondary', fontWeight: value || fallbackValue ? 800 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {value?.name || fallbackValue || placeholder}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: '#2563EB', flexShrink: 0 }}>
            {criticality ? (
              <Chip
                label={criticality}
                size="small"
                sx={{
                  height: 20,
                  minWidth: 20,
                  borderRadius: 1,
                  bgcolor: (criticalityBadgeStyles[criticality] ?? neutralCriticalityBadgeStyle).bg,
                  color: (criticalityBadgeStyles[criticality] ?? neutralCriticalityBadgeStyle).color,
                  border: `1px solid ${(criticalityBadgeStyles[criticality] ?? neutralCriticalityBadgeStyle).border}`,
                  fontSize: 11,
                  fontWeight: 900,
                  '& .MuiChip-label': { px: 0.55 },
                }}
              />
            ) : null}
            <Tooltip title="Search equipment">
              <SearchIcon sx={{ fontSize: 20 }} />
            </Tooltip>
            <Tooltip title="Scan equipment barcode">
              <ScanIcon sx={{ fontSize: 20 }} />
            </Tooltip>
          </Box>
        </Box>
      </Box>
      {value ? (
        <Typography sx={{ mt: 0.45, ml: 0.2, fontSize: 11.5, color: 'text.secondary', lineHeight: 1.35 }}>
          {value.path}
        </Typography>
      ) : null}

      <StandardDialog
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Select Equipment"
        subtitle="Plant A / Unit B"
        maxWidth="sm"
        fullWidth
        variant="compact"
      >
        <TextField
          autoFocus
          size="small"
          placeholder={placeholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          fullWidth
          sx={{
            mb: 1.5,
            '& .MuiOutlinedInput-root': {
              height: 40,
              borderRadius: 1,
              bgcolor: 'background.paper',
              fontSize: 13,
              '& fieldset': { borderColor: 'var(--paper-border-color)' },
              '&:hover fieldset': { borderColor: '#93C5FD' },
              '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 1 },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 20, color: 'primary.main' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Scan equipment barcode">
                  <ScanIcon sx={{ fontSize: 19, color: 'primary.main', cursor: 'pointer' }} />
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ mb: 1.2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.65 }}>
            <HistoryIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
            <Typography sx={{ color: 'text.secondary', fontSize: 12.5, fontWeight: 900 }}>
              Recent Equipment
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gap: 0.55 }}>
            {recentEquipment.map((item) => (
              <ResultCard key={`recent-${item.id}`} item={item} selected={value?.id === item.id} onSelect={() => selectItem(item)} />
            ))}
          </Box>
        </Box>

        <Paper elevation={0} sx={{ p: 0.5, border: '1px solid var(--paper-border-color)', borderRadius: 1, bgcolor: 'background.paper' }}>
          {equipmentHierarchy.map((node) => (
            <HierarchyRow
              key={node.id}
              node={node}
              depth={0}
              index={allNodesIndex}
              expanded={expanded}
              selectedId={value?.id}
              onToggle={toggleExpanded}
              onSelect={selectItem}
            />
          ))}
        </Paper>
      </StandardDialog>
    </Box>
  );
}
