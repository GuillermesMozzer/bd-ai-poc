import {useEffect, useMemo, useState, type ReactElement} from 'react';
import {Box, Divider, IconButton, InputBase, Paper, Tab, Tabs, Typography} from '@mui/material';
import {
  ApartmentOutlined as PlantIcon,
  BusinessOutlined as UnitIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  FactoryOutlined as LineIcon,
  FolderOpenOutlined as AreaIcon,
  Public as GlobalIcon,
  Search as SearchIcon,
  Star as StarFilledIcon,
  StarBorder as StarOutlineIcon,
  WidgetsOutlined as ZoneIcon,
} from '@mui/icons-material';
import {
  documentHierarchyTree,
  findDocumentHierarchyNode,
  findDocumentHierarchyPath,
  flattenDocumentHierarchy,
  getDocumentHierarchyExpandablePathIds,
  type DocumentHierarchyNode,
  type DocumentHierarchyNodeKind,
} from './documentHierarchy';

type DocumentHierarchyPickerProps = {
  favoriteIds: string[];
  onSelect: (nodeId: string) => void;
  onToggleFavorite: (nodeId: string) => void;
  selectedId: string;
};

type PickerTab = 'hierarchy' | 'favorites';

const iconByKind: Record<DocumentHierarchyNodeKind, typeof GlobalIcon> = {
  global: GlobalIcon,
  region: GlobalIcon,
  plant: PlantIcon,
  area: AreaIcon,
  unit: UnitIcon,
  line: LineIcon,
  zone: ZoneIcon,
};

export default function DocumentHierarchyPicker({
  favoriteIds,
  onSelect,
  onToggleFavorite,
  selectedId,
}: DocumentHierarchyPickerProps) {
  const [activeTab, setActiveTab] = useState<PickerTab>('hierarchy');
  const [query, setQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(getDocumentHierarchyExpandablePathIds(selectedId)),
  );

  useEffect(() => {
    setExpandedIds((current) => new Set([...current, ...getDocumentHierarchyExpandablePathIds(selectedId)]));
  }, [selectedId]);

  const flattenedNodes = useMemo(() => flattenDocumentHierarchy(), []);
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
        const node = findDocumentHierarchyNode(favoriteId);
        const path = findDocumentHierarchyPath(favoriteId) ?? [];
        if (!node || path.length === 0) return null;
        return {node, path};
      })
      .filter((entry): entry is {node: DocumentHierarchyNode; path: DocumentHierarchyNode[]} => Boolean(entry))
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

  const renderNode = (node: DocumentHierarchyNode, depth = 0): ReactElement | null => {
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
            borderRadius: 2,
            cursor: 'pointer',
            bgcolor: isSelected ? '#EFF5FF' : 'transparent',
            color: isSelected ? '#044ED7' : '#31446B',
            '&:hover': {
              bgcolor: isSelected ? '#EFF5FF' : '#F8FBFF',
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
              sx={{p: 0.2, color: '#6D7A96'}}
            >
              {isExpanded ? <ExpandMoreIcon fontSize="inherit" /> : <ChevronRightIcon fontSize="inherit" />}
            </IconButton>
          ) : (
            <Box sx={{width: 22}} />
          )}

          <NodeIcon sx={{fontSize: 18, color: isSelected ? '#1663FF' : '#5A6A89'}} />

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
            sx={{p: 0.35, color: isFavorite ? '#F4B400' : '#A8B3C7'}}
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
    <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
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
            color: '#51617F',
          },
          '& .Mui-selected': {
            color: '#1663FF',
          },
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: 999,
            backgroundColor: '#1663FF',
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
            borderRadius: 2.5,
            border: '1px solid #D8E0EF',
            bgcolor: '#FFFFFF',
          }}
        >
          <InputBase
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search hierarchy..."
            sx={{flex: 1, fontSize: 13, color: '#23314D'}}
          />
          <SearchIcon sx={{fontSize: 18, color: '#73829D'}} />
        </Paper>
      </Box>

      {activeTab === 'hierarchy' ? (
        <Box sx={{px: 1.1, pb: 1.2, flex: 1, overflowY: 'auto'}}>
          {renderNode(documentHierarchyTree)}
          {searchState.visibleIds && searchState.visibleIds.size === 0 ? (
            <Box sx={{px: 2, py: 5, textAlign: 'center'}}>
              <Typography sx={{fontSize: 13, fontWeight: 800, color: '#31446B'}}>No hierarchy matches</Typography>
              <Typography sx={{mt: 0.6, fontSize: 12, color: '#7A879D'}}>
                Try searching by region, plant, area, unit, line, or zone.
              </Typography>
            </Box>
          ) : null}
        </Box>
      ) : (
        <Box sx={{px: 1.4, pb: 1.4, flex: 1, overflowY: 'auto'}}>
          {favoriteNodes.length ? favoriteNodes.map(({node, path}) => (
            <Paper
              key={node.id}
              elevation={0}
              onClick={() => onSelect(node.id)}
              sx={{
                p: 1.35,
                mb: 1,
                borderRadius: 2.5,
                border: selectedId === node.id ? '1px solid #94C0FF' : '1px solid #E1E8F4',
                bgcolor: selectedId === node.id ? '#F5F9FF' : '#FFFFFF',
                cursor: 'pointer',
                '&:hover': {borderColor: '#94C0FF', bgcolor: '#F8FBFF'},
              }}
            >
              <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1}}>
                <Box sx={{flex: 1, minWidth: 0}}>
                  <Typography sx={{fontSize: 13, fontWeight: 800, color: '#20304C'}}>
                    {node.label}
                  </Typography>
                  <Typography sx={{mt: 0.45, fontSize: 11.5, color: '#6B7A93'}}>
                    {path.map((pathNode) => pathNode.label).join(' / ')}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleFavorite(node.id);
                  }}
                  sx={{p: 0.25, color: '#F4B400'}}
                >
                  <StarFilledIcon fontSize="inherit" />
                </IconButton>
              </Box>
            </Paper>
          )) : (
            <Box sx={{px: 2, py: 5, textAlign: 'center'}}>
              <Typography sx={{fontSize: 13, fontWeight: 800, color: '#31446B'}}>No favorites yet</Typography>
              <Typography sx={{mt: 0.6, fontSize: 12, color: '#7A879D'}}>
                Star your most-used hierarchy nodes to access them faster.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
