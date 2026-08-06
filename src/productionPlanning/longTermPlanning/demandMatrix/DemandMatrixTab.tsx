import {useState} from 'react';
import {
  AutoAwesome as AutoAwesomeIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Inventory2Outlined as Inventory2OutlinedIcon,
} from '@mui/icons-material';
import {
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import {MetricCard} from '../../ui/PlanningComponents';
import {planningCardSx, planningSurfaceSx, planningTokens} from '../../ui/planningTheme';
import type {BomItem, BomItemType, DemandCell, DemandPeriod, SkuDemandRow} from './demandMatrixMock';
import {
  DEMAND_MATRIX_MONTHS,
  aiSimilarDemandSamples,
  demandAverageByPeriod,
  executionKpis,
  skuBomMap,
  skuDemandMatrix,
} from './demandMatrixMock';

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtCell(total: number): string {
  return (total / 1000).toFixed(3);
}

function fmtCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(Math.round(value));
}

// ── CellTooltipContent ────────────────────────────────────────────────────────

function CellTooltipContent({cell}: {cell: DemandCell}) {
  const forecastUnits = Math.round((cell.total * cell.forecastPct) / 100);
  const ppUnits = cell.total - forecastUnits;
  return (
    <Box sx={{minWidth: 220}}>
      <Typography sx={{fontSize: 12, fontWeight: 900, color: planningTokens.textPrimary, mb: 0.5}}>
        Demand Breakdown
      </Typography>
      <Typography sx={{fontSize: 20, fontWeight: 900, color: planningTokens.textPrimary, lineHeight: 1.2}}>
        {fmtCell(cell.total)}
      </Typography>
      <Box sx={{display: 'flex', height: 6, borderRadius: 999, overflow: 'hidden', my: 1.2}}>
        <Box sx={{width: `${cell.forecastPct}%`, bgcolor: planningTokens.primaryBlue, flexShrink: 0}} />
        <Box sx={{flex: 1, bgcolor: planningTokens.success}} />
      </Box>
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.4}}>
        <Typography sx={{fontSize: 11.5, color: planningTokens.textSecondary}}>
          <span style={{color: planningTokens.primaryBlue, fontSize: 14}}>●</span>{' '}
          Forecast: {cell.forecastPct}%{' '}
          <span style={{color: planningTokens.textMuted}}>({forecastUnits.toLocaleString()})</span>
        </Typography>
        <Typography sx={{fontSize: 11.5, color: planningTokens.textSecondary}}>
          <span style={{color: planningTokens.success, fontSize: 14}}>●</span>{' '}
          Production Plan: {cell.productionPlanPct}%{' '}
          <span style={{color: planningTokens.textMuted}}>({ppUnits.toLocaleString()})</span>
        </Typography>
      </Box>
    </Box>
  );
}

const tooltipSlotProps = {
  tooltip: {
    sx: {
      bgcolor: planningTokens.surface,
      color: planningTokens.textPrimary,
      boxShadow: planningTokens.shadow,
      borderRadius: '12px',
      p: 1.5,
      border: `1px solid ${planningTokens.border}`,
      maxWidth: 280,
    },
  },
};

// ── DemandMatrixTable ─────────────────────────────────────────────────────────

function DemandMatrixTable({
  rows,
  onSkuClick,
}: {
  rows: SkuDemandRow[];
  onSkuClick: (skuCode: string) => void;
}) {
  return (
    <Box sx={{overflowX: 'auto', borderRadius: 3, border: `1px solid ${planningTokens.border}`}}>
      <Table size="small" sx={{minWidth: 1200, borderCollapse: 'separate', borderSpacing: 0}}>
        <TableHead>
          <TableRow sx={{bgcolor: planningTokens.surfaceMuted}}>
            {/* Sticky SKU header cell */}
            <TableCell
              sx={{
                position: 'sticky',
                left: 0,
                zIndex: 3,
                bgcolor: planningTokens.surfaceMuted,
                minWidth: 180,
                fontWeight: 800,
                fontSize: 12,
                color: planningTokens.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                borderBottom: `1px solid ${planningTokens.border}`,
                borderRight: `1px solid ${planningTokens.border}`,
              }}
            >
              SKU
            </TableCell>
            {DEMAND_MATRIX_MONTHS.map((month, idx) => (
              <TableCell
                key={month}
                align="right"
                sx={{
                  minWidth: 88,
                  fontWeight: 700,
                  fontSize: 12,
                  color: idx === 0 ? planningTokens.primaryBlue : planningTokens.textSecondary,
                  bgcolor: idx === 0 ? planningTokens.neutralBg : planningTokens.surfaceMuted,
                  borderBottom: `1px solid ${planningTokens.border}`,
                  pb: idx === 0 ? 0.5 : 1,
                  verticalAlign: 'bottom',
                }}
              >
                <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.4}}>
                  {idx === 0 && (
                    <Chip
                      label="Frozen"
                      size="small"
                      sx={{
                        height: 17,
                        fontSize: 9.5,
                        fontWeight: 800,
                        bgcolor: planningTokens.neutralBgAlt,
                        color: '#1D4ED8',
                        border: `1px solid ${planningTokens.neutralBorder}`,
                        borderRadius: '6px',
                        '& .MuiChip-label': {px: 0.8},
                      }}
                    />
                  )}
                  {month}
                </Box>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.skuCode}
              sx={{'&:hover': {bgcolor: planningTokens.surfaceMuted}, '&:last-child td': {borderBottom: 0}}}
            >
              {/* Sticky SKU column */}
              <TableCell
                sx={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 2,
                  bgcolor: planningTokens.surface,
                  borderBottom: `1px solid ${planningTokens.border}`,
                  borderRight: `1px solid ${planningTokens.border}`,
                  py: 1,
                  '&:hover': {bgcolor: planningTokens.surfaceMuted},
                }}
              >
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6}}>
                  {row.isAiFlagged && (
                    <AutoAwesomeIcon sx={{fontSize: 14, color: planningTokens.aiAccent, flexShrink: 0}} />
                  )}
                  <Box>
                    <Typography
                      component="span"
                      onClick={() => onSkuClick(row.skuCode)}
                      sx={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: planningTokens.primaryBlue,
                        cursor: 'pointer',
                        display: 'block',
                        lineHeight: 1.3,
                        '&:hover': {textDecoration: 'underline'},
                      }}
                    >
                      {row.skuCode}
                    </Typography>
                    <Typography
                      sx={{fontSize: 11, color: planningTokens.textMuted, lineHeight: 1.2, display: 'block'}}
                    >
                      {row.description}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              {row.monthly.map((cell, idx) => (
                <Tooltip
                  key={idx}
                  title={<CellTooltipContent cell={cell} />}
                  placement="top"
                  slotProps={tooltipSlotProps}
                >
                  <TableCell
                    align="right"
                    sx={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: planningTokens.textPrimary,
                      bgcolor: idx === 0 ? planningTokens.neutralBg : 'transparent',
                      borderBottom: `1px solid ${planningTokens.border}`,
                      cursor: 'default',
                      py: 0.9,
                    }}
                  >
                    {fmtCell(cell.total)}
                  </TableCell>
                </Tooltip>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

// ── BomTreeNode ───────────────────────────────────────────────────────────────

const bomTypeBadge: Record<BomItemType, {bg: string; color: string; border: string}> = {
  FG:  {bg: planningTokens.neutralBg,      color: planningTokens.primaryBlue,  border: planningTokens.neutralBorder},
  SFG: {bg: planningTokens.warningBg,      color: planningTokens.warning,      border: planningTokens.warningBorder},
  KIT: {bg: planningTokens.warningAmberBg, color: planningTokens.warningAmber, border: '#FDE68A'},
  RM:  {bg: planningTokens.draftBg,        color: planningTokens.textSecondary, border: planningTokens.draftBorder},
};

function BomTreeNode({item, depth = 0}: {item: BomItem; depth?: number}) {
  const [expanded, setExpanded] = useState(depth === 0);
  const badge = bomTypeBadge[item.type];
  const dosRed = item.daysOfSupply <= 5;
  const hasChildren = (item.children?.length ?? 0) > 0;

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 0.8,
          py: 0.8,
          pl: depth * 2.5,
        }}
      >
        {hasChildren ? (
          <IconButton
            size="small"
            onClick={() => setExpanded((v) => !v)}
            sx={{p: 0.2, mt: 0.2, flexShrink: 0, color: planningTokens.textSecondary}}
          >
            {expanded ? (
              <ExpandMoreIcon sx={{fontSize: 16}} />
            ) : (
              <ChevronRightIcon sx={{fontSize: 16}} />
            )}
          </IconButton>
        ) : (
          <Box sx={{width: 24, flexShrink: 0}} />
        )}

        <Box sx={{display: 'flex', flexDirection: 'column', minWidth: 20, flexShrink: 0, mt: 0.3}}>
          <Inventory2OutlinedIcon sx={{fontSize: 16, color: badge.color}} />
        </Box>

        <Chip
          label={item.type}
          size="small"
          sx={{
            height: 18,
            fontSize: 9.5,
            fontWeight: 900,
            bgcolor: badge.bg,
            color: badge.color,
            border: `1px solid ${badge.border}`,
            borderRadius: '6px',
            flexShrink: 0,
            mt: 0.2,
            '& .MuiChip-label': {px: 0.8},
          }}
        />

        <Box sx={{flex: 1, minWidth: 0}}>
          <Box sx={{display: 'flex', alignItems: 'baseline', gap: 0.8, flexWrap: 'wrap'}}>
            <Typography sx={{fontSize: 13, fontWeight: 800, color: planningTokens.primaryBlue, flexShrink: 0}}>
              {item.code}
            </Typography>
            <Typography sx={{fontSize: 12.5, color: planningTokens.textPrimary}} noWrap>
              {item.name}
            </Typography>
            <Typography sx={{fontSize: 12, color: planningTokens.textMuted, ml: 'auto', flexShrink: 0}}>
              {item.quantity} {item.uom}
            </Typography>
          </Box>
          <Typography sx={{fontSize: 11.5, color: planningTokens.textSecondary, mt: 0.2}}>
            OH: {fmtCompact(item.onHand)}&nbsp;&nbsp;SS: {fmtCompact(item.safetyStock)}&nbsp;&nbsp;
            <span style={{color: dosRed ? planningTokens.danger : planningTokens.textSecondary, fontWeight: dosRed ? 700 : 400}}>
              DoS: {item.daysOfSupply}d
            </span>
          </Typography>
        </Box>
      </Box>

      {expanded && hasChildren && (
        <Box sx={{borderLeft: `2px solid ${planningTokens.border}`, ml: depth * 2.5 + 1.5}}>
          {item.children!.map((child) => (
            <BomTreeNode key={child.id} item={child} depth={depth + 1} />
          ))}
        </Box>
      )}
    </Box>
  );
}

// ── BomDrawer ─────────────────────────────────────────────────────────────────

function BomDrawer({skuCode, onClose}: {skuCode: string | null; onClose: () => void}) {
  const bomItems = skuCode ? (skuBomMap[skuCode] ?? null) : null;
  const totalComponents = bomItems
    ? countComponents(bomItems)
    : 0;

  return (
    <Drawer
      anchor="right"
      open={skuCode !== null}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 480,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxShadow: planningTokens.outerShadow,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${planningTokens.border}`,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          bgcolor: planningTokens.surface,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 3,
            bgcolor: planningTokens.neutralBg,
            border: `1px solid ${planningTokens.neutralBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Inventory2OutlinedIcon sx={{fontSize: 20, color: planningTokens.primaryBlue}} />
        </Box>
        <Box sx={{flex: 1, minWidth: 0}}>
          <Typography sx={{fontSize: 16, fontWeight: 900, color: planningTokens.textPrimary}}>
            {skuCode}
          </Typography>
          <Typography sx={{fontSize: 13, color: planningTokens.textSecondary}}>
            Product {skuCode}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{color: planningTokens.textMuted, '&:hover': {color: planningTokens.textPrimary}}}
        >
          <CloseIcon sx={{fontSize: 18}} />
        </IconButton>
      </Box>

      {/* Scrollable body */}
      <Box sx={{flex: 1, overflowY: 'auto', px: 2, py: 1.5}}>
        {bomItems ? (
          <>
            {/* BOM section header */}
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: planningTokens.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Bill of Materials
              </Typography>
              <Chip
                label={`${totalComponents} components`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  bgcolor: planningTokens.draftBg,
                  color: planningTokens.textSecondary,
                  border: `1px solid ${planningTokens.draftBorder}`,
                }}
              />
            </Box>

            {/* Type legend */}
            <Box sx={{display: 'flex', gap: 0.6, flexWrap: 'wrap', mb: 0.5}}>
              {(['FG', 'SFG', 'KIT', 'RM'] as BomItemType[]).map((t) => {
                const b = bomTypeBadge[t];
                const labels: Record<BomItemType, string> = {
                  FG: 'Finished Good',
                  SFG: 'Semi-Finished Good',
                  KIT: 'Kit',
                  RM: 'Raw Material',
                };
                return (
                  <Box key={t} sx={{display: 'flex', alignItems: 'center', gap: 0.4}}>
                    <Chip
                      label={t}
                      size="small"
                      sx={{height: 18, fontSize: 9.5, fontWeight: 900, bgcolor: b.bg, color: b.color, border: `1px solid ${b.border}`, borderRadius: '6px', '& .MuiChip-label': {px: 0.8}}}
                    />
                    <Typography sx={{fontSize: 11, color: planningTokens.textSecondary}}>{labels[t]}</Typography>
                  </Box>
                );
              })}
            </Box>
            <Typography sx={{fontSize: 11, color: planningTokens.textMuted, mb: 1.5}}>
              OH: On-Hand · SS: Safety Stock · DoS: Days of Supply
            </Typography>

            <Divider sx={{mb: 1}} />

            {/* BOM tree */}
            {bomItems.map((item) => (
              <BomTreeNode key={item.id} item={item} depth={0} />
            ))}
          </>
        ) : (
          <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200}}>
            <Typography sx={{fontSize: 13, color: planningTokens.textMuted}}>
              No BOM data available for this SKU.
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}

function countComponents(items: BomItem[]): number {
  return items.reduce((acc, item) => {
    return acc + 1 + (item.children ? countComponents(item.children) : 0);
  }, 0);
}

// ── AnalyticsPanel ────────────────────────────────────────────────────────────

function AnalyticsPanel({activePeriod, onPeriodChange}: {activePeriod: DemandPeriod; onPeriodChange: (p: DemandPeriod) => void}) {
  const periodKey: Record<DemandPeriod, keyof typeof demandAverageByPeriod[0]> = {
    '6M': 'avg6M',
    '12M': 'avg12M',
    '24M': 'avg24M',
    '36M': 'avg36M',
  };
  const key = periodKey[activePeriod];

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
      {/* AI similar demand patterns */}
      <Paper elevation={0} sx={{...planningCardSx, p: 2}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1.5}}>
          <AutoAwesomeIcon sx={{fontSize: 18, color: planningTokens.aiAccent}} />
          <Typography sx={{fontSize: 16, fontWeight: 900, color: planningTokens.textPrimary}}>
            Similar Demand Patterns
          </Typography>
          <Chip
            label="AI"
            size="small"
            sx={{
              height: 18,
              fontSize: 10,
              fontWeight: 900,
              bgcolor: planningTokens.aiAccentBg,
              color: planningTokens.aiAccent,
              border: `1px solid ${planningTokens.aiAccentBorder}`,
              borderRadius: '6px',
              '& .MuiChip-label': {px: 0.8},
            }}
          />
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {xs: '1fr', md: 'repeat(3, minmax(0, 1fr))'},
            gap: 1.5,
          }}
        >
          {aiSimilarDemandSamples.map((sample) => (
            <Paper key={sample.id} elevation={0} sx={{...planningSurfaceSx, p: 1.5}}>
              <Typography sx={{fontSize: 14, fontWeight: 900, color: planningTokens.textPrimary}}>
                {sample.title}
              </Typography>
              <Typography sx={{fontSize: 12, color: planningTokens.textSecondary, mt: 0.3}}>
                {sample.dateRange}
              </Typography>
              <Chip
                label={`${sample.similarityPct}% match`}
                size="small"
                sx={{
                  mt: 0.8,
                  height: 22,
                  fontSize: 11,
                  fontWeight: 700,
                  bgcolor: planningTokens.aiAccentBg,
                  color: planningTokens.aiAccent,
                  border: `1px solid ${planningTokens.aiAccentBorder}`,
                }}
              />
              <Typography
                sx={{
                  fontSize: 12,
                  color: planningTokens.textSecondary,
                  mt: 0.8,
                  lineHeight: 1.55,
                }}
              >
                {sample.description}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}

// ── DemandMatrixTab ───────────────────────────────────────────────────────────

export default function DemandMatrixTab() {
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState<DemandPeriod>('12M');

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
      <DemandMatrixTable rows={skuDemandMatrix} onSkuClick={setSelectedSku} />
      <AnalyticsPanel activePeriod={activePeriod} onPeriodChange={setActivePeriod} />
      <BomDrawer skuCode={selectedSku} onClose={() => setSelectedSku(null)} />
    </Box>
  );
}
