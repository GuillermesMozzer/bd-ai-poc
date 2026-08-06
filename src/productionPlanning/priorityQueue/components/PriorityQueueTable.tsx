import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {KeyboardArrowDownRounded as KeyboardArrowDownRoundedIcon, KeyboardArrowUpRounded as KeyboardArrowUpRoundedIcon} from '@mui/icons-material';
import type {WoQueueItem} from '../types';
import {AiLabel, ConfidenceBadge, FreshnessBadge, PriorityBadge, ReadinessBadge, StatusBadge} from './Badges';

const moduleCardSx = {
  borderRadius: 4,
  border: '1px solid var(--planning-border)',
  bgcolor: 'var(--planning-surface)',
  boxShadow: 'var(--planning-soft-shadow)',
};

const headCellSx = {
  fontSize: 11,
  fontWeight: 800,
  color: 'var(--planning-text-secondary)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  py: 1.2,
  px: 1.2,
  whiteSpace: 'nowrap' as const,
  bgcolor: 'var(--planning-surface-muted)',
};

const bodyCellSx = {
  fontSize: 12,
  py: 1.05,
  px: 1.2,
  verticalAlign: 'top' as const,
  color: 'var(--planning-text-primary)',
};

export default function PriorityQueueTable({
  items,
  selectedId,
  expandedId,
  onSelect,
  onToggleExpand,
  onRowAction,
  status,
}: {
  items: WoQueueItem[];
  selectedId: string | null;
  expandedId: string | null;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onRowAction: (action: string, itemId: string) => void;
  status: 'loading' | 'ready' | 'error';
}) {
  if (status === 'loading') {
    return (
      <Paper elevation={0} sx={{...moduleCardSx, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 6, flex: 1}}>
        <Box sx={{textAlign: 'center'}}>
          <CircularProgress size={32} sx={{mb: 1.5}} />
          <Typography sx={{fontSize: 14, color: 'var(--planning-text-secondary)'}}>Loading AI work order queue...</Typography>
        </Box>
      </Paper>
    );
  }

  if (status === 'error') {
    return (
      <Paper elevation={0} sx={{...moduleCardSx, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 6, flex: 1}}>
        <Typography sx={{fontSize: 14, color: '#B42318'}}>
          Work order priority data is currently unavailable. Please try again later.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{...moduleCardSx, overflow: 'hidden', flex: 1, minWidth: 0}}>
      <TableContainer sx={{maxHeight: 'calc(100vh - 350px)'}}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {['', 'Rank', 'Priority', 'WO ID', 'Product / Item', 'Line / Machine', 'Scheduled Start', 'Time to Start', 'Readiness', 'Main Blocker', 'Why Ranked', 'Demand at Risk', 'Operational Impact', 'Owner', 'Action Status', 'Action Due', 'AI Recommendation', 'AI Confidence', 'Next Action'].map((label) => (
                <TableCell key={label} sx={headCellSx}>{label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={19} sx={{textAlign: 'center', py: 5, color: 'var(--planning-text-muted)', fontSize: 14}}>
                  No work orders match the selected AI filters.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const selected = selectedId === item.id;
                const expanded = expandedId === item.id;
                return (
                  <React.Fragment key={item.id}>
                    <TableRow
                      hover
                      selected={selected}
                      onClick={() => onSelect(item.id)}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: selected ? '#EFF6FF' : undefined,
                        '&.Mui-selected': {bgcolor: 'var(--planning-neutral-bg)'},
                        '&.Mui-selected:hover': {bgcolor: '#DBEAFE'},
                      }}
                    >
                      <TableCell sx={bodyCellSx}>
                        <Button size="small" onClick={(event) => { event.stopPropagation(); onToggleExpand(item.id); }} sx={{minWidth: 0, p: 0.25}}>
                          {expanded ? <KeyboardArrowUpRoundedIcon sx={{fontSize: 18}} /> : <KeyboardArrowDownRoundedIcon sx={{fontSize: 18}} />}
                        </Button>
                      </TableCell>
                      <TableCell sx={{...bodyCellSx, fontWeight: 900, color: '#1D74FF'}}>{item.rank}</TableCell>
                      <TableCell sx={bodyCellSx}><PriorityBadge priority={item.priority} /></TableCell>
                      <TableCell sx={{...bodyCellSx, fontWeight: 800, whiteSpace: 'nowrap'}}>{item.woId}</TableCell>
                      <TableCell sx={{...bodyCellSx, minWidth: 150}}>{item.product}<Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', mt: 0.25}}>{item.batch}</Typography></TableCell>
                      <TableCell sx={{...bodyCellSx, whiteSpace: 'nowrap'}}>{item.lineMachine}</TableCell>
                      <TableCell sx={{...bodyCellSx, whiteSpace: 'nowrap'}}>{item.scheduledStart}</TableCell>
                      <TableCell sx={{...bodyCellSx, whiteSpace: 'nowrap', fontWeight: 800}}>{item.timeToStart}</TableCell>
                      <TableCell sx={bodyCellSx}><ReadinessBadge status={item.readiness} /></TableCell>
                      <TableCell sx={{...bodyCellSx, minWidth: 150}}>{item.mainBlocker}</TableCell>
                      <TableCell sx={{...bodyCellSx, minWidth: 220}}>{item.whyRanked}</TableCell>
                      <TableCell sx={{...bodyCellSx, whiteSpace: 'nowrap', fontWeight: 800}}>{item.demandAtRisk}</TableCell>
                      <TableCell sx={{...bodyCellSx, whiteSpace: 'nowrap'}}>{item.operationalImpact}</TableCell>
                      <TableCell sx={bodyCellSx}>{item.owner}<Box sx={{mt: 0.5}}><FreshnessBadge state={item.freshness} /></Box></TableCell>
                      <TableCell sx={bodyCellSx}><StatusBadge status={item.actionStatus} /></TableCell>
                      <TableCell sx={{...bodyCellSx, whiteSpace: 'nowrap'}}>{item.actionDue}</TableCell>
                      <TableCell sx={{...bodyCellSx, minWidth: 220}}>
                        <Stack direction="row" spacing={0.75} alignItems="flex-start">
                          <AiLabel />
                          <Typography sx={{fontSize: 12, color: 'var(--planning-text-primary)', lineHeight: 1.45}}>{item.aiRecommendation}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={bodyCellSx}>
                        <Tooltip title="Based on data freshness, blocker clarity, and available recovery options.">
                          <Box>
                            <ConfidenceBadge confidence={item.aiConfidence} />
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={bodyCellSx}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={(event) => { event.stopPropagation(); onRowAction(item.nextAction, item.id); }}
                          sx={{textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap'}}
                        >
                          {item.nextAction}
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={19} sx={{p: 0, borderBottom: expanded ? '1px solid rgba(148,163,184,0.15)' : 'none'}}>
                        <Collapse in={expanded} timeout="auto" unmountOnExit>
                          <Box sx={{px: 2, py: 1.5, bgcolor: 'var(--planning-surface-muted)'}}>
                            <Typography sx={{fontSize: 12.5, fontWeight: 800, color: 'var(--planning-text-primary)', mb: 0.75}}>
                              {item.woId} is ranked #{item.rank} because {item.whyRanked.toLowerCase()}
                            </Typography>
                            <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', lg: 'repeat(4, minmax(0, 1fr))'}, gap: 1}}>
                              <ExpandCard title="Readiness signal" body={`${item.readiness} - ${item.mainBlocker}`} />
                              <ExpandCard title="Demand impact" body={item.demandAtRisk} />
                              <ExpandCard title="Operational impact" body={item.operationalImpact} />
                              <ExpandCard title="Prepared next step" body={`${item.nextAction} by ${item.actionDue}`} />
                            </Box>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{px: 2, py: 1, borderTop: '1px solid rgba(148,163,184,0.15)'}}>
        <Typography sx={{fontSize: 11, color: 'var(--planning-text-muted)'}}>
          {items.length} work orders in AI priority queue
        </Typography>
      </Box>
    </Paper>
  );
}

function ExpandCard({title, body}: {title: string; body: string}) {
  return (
    <Box sx={{p: 1.1, borderRadius: 2, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface)'}}>
      <Typography sx={{fontSize: 10, fontWeight: 800, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.45}}>
        {title}
      </Typography>
      <Typography sx={{fontSize: 12, color: 'var(--planning-text-primary)', lineHeight: 1.5}}>{body}</Typography>
    </Box>
  );
}
