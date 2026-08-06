import {useState} from 'react';
import {
  Box,
  Chip,
  IconButton,
  InputBase,
  Paper,
  Typography,
} from '@mui/material';
import {
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  PrecisionManufacturing as MachineIcon,
  Search as SearchIcon,
  TableChart as LineIcon,
  ViewList as AllLinesIcon,
} from '@mui/icons-material';
import type {CapacityByLineMachines} from '../types';
import {getUtilizationColor, getUtilizationBg, getUtilizationStatus} from '../utils';

const ALL_LINES_ID = '__all__';

type Props = {
  lines: CapacityByLineMachines[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

function worstLineUtil(line: CapacityByLineMachines): number {
  return Math.max(...line.months.map((m) => m.utilizationPct));
}

export default function CapacityHierarchyExplorer({lines, selectedId, onSelect}: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  const effectiveId = selectedId ?? ALL_LINES_ID;

  function toggleExpand(lineId: string, e: React.MouseEvent) {
    e.stopPropagation();
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(lineId)) next.delete(lineId);
      else next.add(lineId);
      return next;
    });
  }

  function handleSelectLine(lineId: string) {
    setExpanded((prev) => new Set([...prev, lineId]));
    onSelect(lineId);
  }

  function handleSelectMachine(machineId: string, lineId: string) {
    setExpanded((prev) => new Set([...prev, lineId]));
    onSelect(machineId);
  }

  const q = search.trim().toLowerCase();
  const filteredLines = q
    ? lines.filter(
        (l) =>
          l.lineName.toLowerCase().includes(q) ||
          l.machines.some((m) => m.machineName.toLowerCase().includes(q)),
      )
    : lines;

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0}}>
      {/* Header */}
      <Box sx={{p: 2, pb: 1}}>
        <Typography sx={{fontSize: 12, fontWeight: 800, color: 'var(--planning-text-primary)', mb: 1.5, letterSpacing: '0.05em'}}>
          HIERARCHY EXPLORER
        </Typography>
        <Paper
          elevation={0}
          sx={{display: 'flex', alignItems: 'center', px: 1.5, py: 0.5, bgcolor: 'var(--planning-surface-muted)', borderRadius: 2, border: '1px solid var(--planning-border)'}}
        >
          <SearchIcon sx={{fontSize: 18, color: 'var(--planning-text-muted)', mr: 1}} />
          <InputBase
            placeholder="Search lines or machines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{fontSize: 13, flex: 1}}
          />
        </Paper>
      </Box>

      {/* Tree */}
      <Box sx={{flex: 1, overflowY: 'auto', py: 0.5}}>
        {/* All Lines node */}
        <Box
          onClick={() => onSelect(null)}
          sx={{
            display: 'flex', alignItems: 'center',
            py: 0.9, px: 2,
            cursor: 'pointer',
            bgcolor: effectiveId === ALL_LINES_ID ? '#EFF6FF' : 'transparent',
            borderLeft: effectiveId === ALL_LINES_ID ? '3px solid #1663FF' : '3px solid transparent',
            '&:hover': {bgcolor: effectiveId === ALL_LINES_ID ? '#EFF6FF' : '#F8FAFC'},
          }}
        >
          <AllLinesIcon sx={{fontSize: 18, mr: 1, color: effectiveId === ALL_LINES_ID ? '#1663FF' : '#64748B'}} />
          <Typography sx={{fontSize: 13, fontWeight: effectiveId === ALL_LINES_ID ? 700 : 500, color: effectiveId === ALL_LINES_ID ? '#1E40AF' : '#475569', flex: 1}}>
            All Lines
          </Typography>
          <Typography sx={{fontSize: 11, color: 'var(--planning-text-muted)', ml: 1}}>{lines.length} lines</Typography>
        </Box>

        {/* Line nodes */}
        {filteredLines.map((line) => {
          const isLineSelected = effectiveId === line.lineId;
          const isExpanded = expanded.has(line.lineId);
          const maxUtil = worstLineUtil(line);
          const status = getUtilizationStatus(maxUtil);
          const hasMachines = line.machines.length > 0;

          return (
            <Box key={line.lineId}>
              {/* Line row */}
              <Box
                onClick={() => handleSelectLine(line.lineId)}
                sx={{
                  display: 'flex', alignItems: 'center',
                  py: 0.75, px: 2,
                  cursor: 'pointer',
                  bgcolor: isLineSelected ? '#EFF6FF' : 'transparent',
                  borderLeft: isLineSelected ? '3px solid #1663FF' : '3px solid transparent',
                  '&:hover': {bgcolor: isLineSelected ? '#EFF6FF' : '#F8FAFC'},
                }}
              >
                {hasMachines ? (
                  <IconButton
                    size="small"
                    onClick={(e) => toggleExpand(line.lineId, e)}
                    sx={{p: 0.25, mr: 0.5, color: 'var(--planning-text-muted)'}}
                  >
                    {isExpanded
                      ? <ExpandMoreIcon sx={{fontSize: 16}} />
                      : <ChevronRightIcon sx={{fontSize: 16}} />
                    }
                  </IconButton>
                ) : (
                  <Box sx={{width: 24, mr: 0.5}} />
                )}
                <LineIcon sx={{fontSize: 17, mr: 1, color: isLineSelected ? '#1663FF' : '#64748B'}} />
                <Typography sx={{fontSize: 13, fontWeight: isLineSelected ? 700 : 500, color: isLineSelected ? '#1E40AF' : '#475569', flex: 1}}>
                  {line.lineName}
                </Typography>
                <Chip
                  label={`${maxUtil}%`}
                  size="small"
                  sx={{
                    fontSize: 9, height: 17, ml: 0.5,
                    bgcolor: getUtilizationBg(status),
                    color: getUtilizationColor(status),
                    fontWeight: 700,
                    border: `1px solid color-mix(in srgb, ${getUtilizationColor(status)} 20%, transparent)`,
                  }}
                />
              </Box>

              {/* Machine nodes */}
              {isExpanded && line.machines.map((machine) => {
                const isMachineSelected = effectiveId === machine.machineId;
                const mMaxUtil = Math.max(...machine.months.map((mo) => mo.utilizationPct));
                const mStatus = getUtilizationStatus(mMaxUtil);
                const showMachine = !q || machine.machineName.toLowerCase().includes(q) || line.lineName.toLowerCase().includes(q);
                if (!showMachine) return null;
                return (
                  <Box
                    key={machine.machineId}
                    onClick={() => handleSelectMachine(machine.machineId, line.lineId)}
                    sx={{
                      display: 'flex', alignItems: 'center',
                      py: 0.6, px: 2, pl: 6,
                      cursor: 'pointer',
                      bgcolor: isMachineSelected ? '#EFF6FF' : 'transparent',
                      borderLeft: isMachineSelected ? '3px solid #1663FF' : '3px solid transparent',
                      '&:hover': {bgcolor: isMachineSelected ? '#EFF6FF' : '#F8FAFC'},
                    }}
                  >
                    <Box sx={{width: 24, mr: 0.5}} />
                    <MachineIcon sx={{fontSize: 15, mr: 1, color: isMachineSelected ? '#1663FF' : '#94A3B8'}} />
                    <Typography sx={{fontSize: 12, fontWeight: isMachineSelected ? 700 : 400, color: isMachineSelected ? '#1E40AF' : '#64748B', flex: 1}}>
                      {machine.machineName}
                    </Typography>
                    <Chip
                      label={`${mMaxUtil}%`}
                      size="small"
                      sx={{
                        fontSize: 9, height: 16, ml: 0.5,
                        bgcolor: getUtilizationBg(mStatus),
                        color: getUtilizationColor(mStatus),
                        fontWeight: 700,
                        border: `1px solid color-mix(in srgb, ${getUtilizationColor(mStatus)} 20%, transparent)`,
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          );
        })}
      </Box>

      {/* Footer hint */}
      <Box sx={{p: 1.5, borderTop: '1px solid #F1F5F9'}}>
        <Typography sx={{fontSize: 11, color: 'var(--planning-text-muted)', fontStyle: 'italic'}}>
          Select a line or equipment to view its configuration
        </Typography>
      </Box>
    </Box>
  );
}
