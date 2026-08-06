import {useEffect, useMemo, useState} from 'react';
import {Box, Divider, IconButton, InputBase, Paper, Tab, Tabs, Typography} from '@mui/material';
import {
  ApartmentOutlined as PlantIcon,
  Adjust as AssetIcon,
  BusinessOutlined as UnitIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  FactoryOutlined as LineIcon,
  FolderOpenOutlined as AreaIcon,
  PrecisionManufacturingOutlined as SystemIcon,
  Public as GlobalIcon,
  Search as SearchIcon,
  Star as StarFilledIcon,
  StarBorder as StarOutlineIcon,
  WidgetsOutlined as ZoneIcon,
} from '@mui/icons-material';
import {
  findHeaderHierarchyNode,
  findHeaderHierarchyPath,
  flattenHeaderHierarchy,
  getHeaderHierarchyExpandablePathIds,
  headerHierarchyTree,
  type HeaderHierarchyNode,
  type HeaderHierarchyNodeKind,
} from './headerHierarchy';

type HeaderHierarchyPickerProps = {
  favoriteIds: string[];
  onSelect: (nodeId: string) => void;
  onToggleFavorite: (nodeId: string) => void;
  selectedId: string;
};

type PickerTab = 'hierarchy' | 'favorites';

const iconByKind: Record<HeaderHierarchyNodeKind, typeof GlobalIcon> = {
  global: GlobalIcon,
  region: GlobalIcon,
  plant: PlantIcon,
  area: AreaIcon,
  unit: UnitIcon,
  line: LineIcon,
  zone: ZoneIcon,
  system: SystemIcon,
  asset: AssetIcon,
};

export default function HeaderHierarchyPicker({
  favoriteIds,
  onSelect,
  onToggleFavorite,
  selectedId,
}: HeaderHierarchyPickerProps) {
  const [activeTab, setActiveTab] = useState<PickerTab>('hierarchy');
  const [query, setQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(getHeaderHierarchyExpandablePathIds(selectedId)),
  );

  useEffect(() => {
    setExpandedIds((current) => new Set([...current, ...getHeaderHierarchyExpandablePathIds(selectedId)]));
  }, [selectedId]);

  const flattenedNodes = useMemo(() => flattenHeaderHierarchy(), []);
  const normalizedQuery = query.trim().toLowerCase();

  const searchState = useMemo(() => {
    if (!normalizedQuery) {
      return {
        forcedExpandedIds: new Set<string>(),
        visibleIds: null as Set<string> | null,
      };
    }

    const matchingEntries = flattenedNodes.filter(({node, path}) => {
      const searchableText = [node.label, ...path.map((pathNode) => pathNode.label)].join(' ').toLowerCase();
      return searchableText.includes(normalizedQuery);
    });

    const visibleIds = new Set<string>();
    const forcedExpandedIds = new Set<string>();

    matchingEntries.forEach(({path}) => {
      path.forEach((pathNode, index) => {
        visibleIds.add(pathNode.id);
        if (index < path.length - 1 && (pathNode.children?.length ?? 0) > 0) {
          forcedExpandedIds.add(pathNode.id);
        }
      });
    });

    return {forcedExpandedIds, visibleIds};
  }, [flattenedNodes, normalizedQuery]);

  const favoriteNodes = useMemo(() => (
    favoriteIds
      .map((favoriteId) => {
        const node = findHeaderHierarchyNode(favoriteId);
        const path = findHeaderHierarchyPath(favoriteId) ?? [];
        if (!node || path.length === 0) return null;
        return {node, path};
      })
      .filter((entry): entry is {node: HeaderHierarchyNode; path: HeaderHierarchyNode[]} => Boolean(entry))
      .filter(({node, path}) => {
        if (!normalizedQuery) return true;
        return [node.label, ...path.map((pathNode) => pathNode.label)]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);
      })
  ), [favoriteIds, normalizedQuery]);

  const toggleExpanded = (nodeId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const renderNode = (node: HeaderHierarchyNode, depth = 0): JSX.Element | null => {
    if (searchState.visibleIds && !searchState.visibleIds.has(node.id)) {
      return null;
    }

    const hasChildren = (node.children?.length ?? 0) > 0;
    const isExpanded = hasChildren && (expandedIds.has(node.id) || searchState.forcedExpandedIds.has(node.id));
    const isSelected = selectedId === node.id;
    const isFavorite = favoriteIds.includes(node.id);
    const NodeIcon = iconByKind[node.kind];

    return (
      <Box key={node.id}>
        <Box
          onClick={() => onSelect(node.id)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            py: 0.85,
            px: 1.2,
            pl: 1.2 + depth * 1.65,
            borderRadius: '8px',
            cursor: 'pointer',
            bgcolor: isSelected ? 'var(--token-brand-soft-bg)' : 'transparent',
            color: isSelected ? 'var(--active-theme-primary)' : 'var(--active-theme-text-primary)',
            '&:hover': {
              bgcolor: isSelected ? 'var(--token-brand-soft-bg)' : 'var(--menu-hover-bg)',
            },
          }}
        >
          {hasChildren ? (
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                toggleExpanded(node.id);
              }}
              sx={{p: 0.2, color: 'var(--active-theme-text-secondary)'}}
            >
              {isExpanded ? <ExpandMoreIcon fontSize="inherit" /> : <ChevronRightIcon fontSize="inherit" />}
            </IconButton>
          ) : (
            <Box sx={{width: 22}} />
          )}

          <NodeIcon sx={{fontSize: 18, color: isSelected ? 'var(--active-theme-primary)' : 'var(--active-theme-text-secondary)'}} />

          <Typography
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: 13,
              fontWeight: isSelected ? 800 : 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {node.label}
          </Typography>

          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite(node.id);
            }}
            sx={{p: 0.35, color: isFavorite ? 'var(--favorite-star-color)' : 'var(--active-theme-text-secondary)'}}
          >
            {isFavorite ? <StarFilledIcon fontSize="inherit" /> : <StarOutlineIcon fontSize="inherit" />}
          </IconButton>
        </Box>

        {hasChildren && isExpanded ? (
          <Box>
            {node.children?.map((child) => renderNode(child, depth + 1))}
          </Box>
        ) : null}
      </Box>
    );
  };

  return (
    <Box sx={{width: 380, maxWidth: 'calc(100vw - 24px)'}}>
      <Tabs
        value={activeTab}
        onChange={(_, value: PickerTab) => setActiveTab(value)}
        variant="fullWidth"
        sx={{
          px: 1,
          pt: 1,
          '& .MuiTab-root': {
            minHeight: 48,
            textTransform: 'none',
            fontWeight: 800,
            color: 'var(--active-theme-text-secondary)',
          },
          '& .Mui-selected': {
            color: 'var(--active-theme-primary)',
          },
          '& .MuiTabs-indicator': {
            height: 2,
            borderRadius: 0,
            backgroundColor: 'var(--active-theme-primary)',
          },
        }}
      >
        <Tab value="hierarchy" label="Hierarchy" />
        <Tab value="favorites" label={`Favorites${favoriteIds.length ? ` (${favoriteIds.length})` : ''}`} />
      </Tabs>

      <Divider />

      <Box sx={{p: 1.5}}>
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.4,
            py: 0.7,
            borderRadius: '12px',
            border: '1px solid var(--input-border-color)',
            bgcolor: 'var(--active-theme-background-paper)',
          }}
        >
          <InputBase
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search hierarchy..."
            sx={{flex: 1, fontSize: 13, color: 'var(--active-theme-text-primary)'}}
          />
          <SearchIcon sx={{fontSize: 18, color: 'var(--active-theme-text-secondary)'}} />
        </Paper>
      </Box>

      {activeTab === 'hierarchy' ? (
        <Box sx={{px: 1.1, pb: 1.2, maxHeight: 520, overflowY: 'auto'}}>
          {renderNode(headerHierarchyTree)}
          {searchState.visibleIds && searchState.visibleIds.size === 0 ? (
            <Box sx={{px: 2, py: 5, textAlign: 'center'}}>
              <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--active-theme-text-primary)'}}>No hierarchy matches</Typography>
              <Typography sx={{mt: 0.6, fontSize: 12, color: 'var(--active-theme-text-secondary)'}}>
                Try searching by region, plant, area, unit, line, zone, system, or asset.
              </Typography>
            </Box>
          ) : null}
        </Box>
      ) : (
        <Box sx={{px: 1.4, pb: 1.4, maxHeight: 520, overflowY: 'auto'}}>
          {favoriteNodes.length ? favoriteNodes.map(({node, path}) => (
            <Paper
              key={node.id}
              elevation={0}
              onClick={() => onSelect(node.id)}
              sx={{
                p: 1.35,
                mb: 1,
                borderRadius: '12px',
                border: selectedId === node.id ? '1px solid var(--active-theme-primary-light)' : '1px solid var(--paper-border-color)',
                bgcolor: selectedId === node.id ? 'var(--token-brand-soft-bg)' : 'var(--active-theme-background-paper)',
                cursor: 'pointer',
                '&:hover': {borderColor: 'var(--active-theme-primary-light)', bgcolor: 'var(--menu-hover-bg)'},
              }}
            >
              <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1}}>
                <Box sx={{flex: 1, minWidth: 0}}>
                  <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--active-theme-text-primary)'}}>
                    {node.label}
                  </Typography>
                  <Typography sx={{mt: 0.45, fontSize: 11.5, color: 'var(--active-theme-text-secondary)'}}>
                    {path.map((pathNode) => pathNode.label).join(' / ')}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleFavorite(node.id);
                  }}
                  sx={{p: 0.25, color: 'var(--favorite-star-color)'}}
                >
                  <StarFilledIcon fontSize="inherit" />
                </IconButton>
              </Box>
            </Paper>
          )) : (
            <Box sx={{px: 2, py: 5, textAlign: 'center'}}>
              <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--active-theme-text-primary)'}}>No favorites yet</Typography>
              <Typography sx={{mt: 0.6, fontSize: 12, color: 'var(--active-theme-text-secondary)'}}>
                Star your most-used hierarchy nodes to access them faster from the header.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
