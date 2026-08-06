import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../../theme';
import {useState} from 'react';
import {Box, Typography, InputBase, Paper, IconButton} from '@mui/material';
import {
  Search as SearchIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  FolderOpenOutlined as PlantIcon,
  ApartmentOutlined as AreaIcon,
  BusinessOutlined as UnitIcon,
  DevicesOutlined as WorkstationIcon,
} from '@mui/icons-material';
import {accessSelectionTree} from '../data/workstation.mock';
import {AccessNode} from '../data/workstation.types';
import {ALL_WORKSTATIONS_NODE_ID, useAllWorkstationsData} from '../hooks/useAllWorkstationsData';
import {getAccessPathIdsToExpand} from '../hooks/workstation.utils';

type HierarchyExplorerProps = {
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export default function HierarchyExplorer({selectedId, onSelect}: HierarchyExplorerProps) {
  const {allRows, totalByNodeId} = useAllWorkstationsData(selectedId);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['plant-columbus-west']));

  const getWorkstationCount = (nodeId: string) => totalByNodeId.get(nodeId) ?? 0;

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const handleSelect = (nodeId: string) => {
    const expansionPath = getAccessPathIdsToExpand(nodeId);
    if (expansionPath.length) {
      setExpanded((current) => new Set([...current, ...expansionPath]));
    }
    onSelect(nodeId);
  };

  const renderNode = (node: AccessNode, level: number = 0) => {
    const isExpanded = expanded.has(node.id);
    const isSelected = selectedId === node.id;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <Box key={node.id}>
        <Box
          onClick={() => handleSelect(node.id)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 0.75,
            px: 2,
            pl: 2 + level * 2,
            cursor: 'pointer',
            bgcolor: isSelected ? tokenNeutral.lightest : 'transparent',
            borderLeft: isSelected ? `3px solid ${tokenBrand.main}` : '3px solid transparent',
            '&:hover': {bgcolor: isSelected ? tokenNeutral.lightest : workstationVisuals.slateSurface},
          }}
        >
          {hasChildren ? (
            <IconButton
              size="small"
              onClick={(e) => toggleExpand(node.id, e)}
              sx={{p: 0.25, mr: 0.5, color: workstationVisuals.textMuted}}
            >
              {isExpanded ? <ExpandMoreIcon fontSize="inherit" /> : <ChevronRightIcon fontSize="inherit" />}
            </IconButton>
          ) : (
            <Box sx={{width: 24, mr: 0.5}} />
          )}
          
          {level === 0 && <PlantIcon sx={{fontSize: 18, mr: 1, color: isSelected ? tokenBrand.main : workstationVisuals.textSecondary}} />}
          {level === 1 && <AreaIcon sx={{fontSize: 18, mr: 1, color: isSelected ? tokenBrand.main : workstationVisuals.textSecondary}} />}
          {level === 2 && <UnitIcon sx={{fontSize: 18, mr: 1, color: isSelected ? tokenBrand.main : workstationVisuals.textSecondary}} />}
          {level >= 3 && <WorkstationIcon sx={{fontSize: 18, mr: 1, color: isSelected ? tokenBrand.main : workstationVisuals.textSecondary}} />}

          <Typography
            sx={{
              fontSize: 13,
              fontWeight: isSelected ? 700 : 500,
              color: isSelected ? tokenBrand.dark : workstationVisuals.tierTextLabel,
              flex: 1,
            }}
          >
            {node.label}
          </Typography>
          
          <Typography sx={{fontSize: 11, color: workstationVisuals.textMuted, ml: 1}}>
            {getWorkstationCount(node.id)} workstations
          </Typography>
        </Box>
        {hasChildren && isExpanded && (
          <Box>
            {node.children?.map((child) => renderNode(child, level + 1))}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
      <Box sx={{p: 2}}>
        <Typography sx={{fontSize: 12, fontWeight: 800, color: workstationVisuals.textPrimary, mb: 2, letterSpacing: '0.05em'}}>
          HIERARCHY EXPLORER
        </Typography>
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 1.5,
            py: 0.5,
            bgcolor: workstationVisuals.slateSurface,
            borderRadius: 2,
            border: `1px solid ${workstationVisuals.tierBorder}`,
          }}
        >
          <SearchIcon sx={{fontSize: 18, color: workstationVisuals.textMuted, mr: 1}} />
          <InputBase placeholder="Search hierarchy..." sx={{fontSize: 13, flex: 1}} />
        </Paper>
      </Box>

      <Box sx={{flex: 1, overflowY: 'auto', py: 1}}>
        <Box
          onClick={() => onSelect(ALL_WORKSTATIONS_NODE_ID)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 0.9,
            px: 2,
            cursor: 'pointer',
            bgcolor: selectedId === ALL_WORKSTATIONS_NODE_ID ? tokenNeutral.lightest : 'transparent',
            borderLeft: selectedId === ALL_WORKSTATIONS_NODE_ID ? `3px solid ${tokenBrand.main}` : '3px solid transparent',
            '&:hover': {bgcolor: selectedId === ALL_WORKSTATIONS_NODE_ID ? tokenNeutral.lightest : workstationVisuals.slateSurface},
          }}
        >
          <WorkstationIcon sx={{fontSize: 18, mr: 1, color: selectedId === ALL_WORKSTATIONS_NODE_ID ? tokenBrand.main : workstationVisuals.textSecondary}} />
          <Typography sx={{fontSize: 13, fontWeight: selectedId === ALL_WORKSTATIONS_NODE_ID ? 700 : 500, color: selectedId === ALL_WORKSTATIONS_NODE_ID ? tokenBrand.dark : workstationVisuals.tierTextLabel, flex: 1}}>
            All Workstations
          </Typography>
          <Typography sx={{fontSize: 11, color: workstationVisuals.textMuted, ml: 1}}>
            {allRows.length} workstations
          </Typography>
        </Box>
        {accessSelectionTree.map((node) => renderNode(node))}
      </Box>
      
      <Box sx={{p: 2, borderTop: `1px solid ${workstationVisuals.slateSurface}`}}>
        <Typography sx={{fontSize: 11, color: workstationVisuals.textMuted, fontStyle: 'italic'}}>
          Click a node to filter the workstation list below
        </Typography>
      </Box>
    </Box>
  );
}
