import {useMemo, useState} from 'react';
import {
  Box,
  Chip,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {DataTable} from '../../ui/PlanningComponents';
import {planningCardSx, planningTokens} from '../../ui/planningTheme';
import {skuDemandMatrix} from '../demandMatrix/demandMatrixMock';
import {
  capacityAtOee,
  productionLines,
  skuLineAssignments,
  type ProductionLine,
  type SkuLineAssignment,
} from './resourceDistributionMock';

function fmtUnits(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(Math.round(value));
}

function fmtK(value: number) {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

function getLoadTone(utilization: number) {
  if (utilization > 90) {
    return {bg: '#FEF2F2', border: '#FECACA', color: planningTokens.danger, label: 'Constrained'};
  }
  if (utilization > 75) {
    return {bg: '#FFF7ED', border: '#FED7AA', color: planningTokens.warning, label: 'At Risk'};
  }
  return {bg: '#ECFDF3', border: '#BBF7D0', color: planningTokens.success, label: 'Balanced'};
}

function getCoverageTone(coveragePct: number) {
  if (coveragePct >= 95) {
    return {bg: '#ECFDF3', border: '#BBF7D0', color: planningTokens.success, label: 'Covered'};
  }
  if (coveragePct >= 88) {
    return {bg: '#FFF7ED', border: '#FED7AA', color: planningTokens.warning, label: 'Watch'};
  }
  return {bg: '#FEF2F2', border: '#FECACA', color: planningTokens.danger, label: 'Gap'};
}

function LineCapacityCards({
  lines,
  assignments,
}: {
  lines: ProductionLine[];
  assignments: SkuLineAssignment[];
}) {
  return (
    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(3, minmax(0, 1fr))'}, gap: 1.5}}>
      {lines.map((line) => {
        const lineAssignments = assignments.filter((a) => a.lineId === line.id);
        const totalDemand = lineAssignments.reduce((sum, a) => sum + a.demandUnitsMonthlyAvg, 0);
        const totalPlan = lineAssignments.reduce((sum, a) => sum + a.productionPlanUnits, 0);
        const atOee = capacityAtOee(line);
        const utilization = atOee > 0 ? Math.round((totalDemand / atOee) * 100) : 0;
        const loadTone = getLoadTone(utilization);
        return (
          <Paper key={line.id} elevation={0} sx={{...planningCardSx, p: 1.5}}>
            <Typography sx={{fontSize: 16, fontWeight: 900, color: planningTokens.textPrimary, mb: 1.25}}>
              {line.name}
            </Typography>
            <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1}}>
              <Box>
                <Typography sx={{fontSize: 11, fontWeight: 800, color: planningTokens.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em'}}>Nominal Cap.</Typography>
                <Typography sx={{fontSize: 15, fontWeight: 900, color: planningTokens.textPrimary, mt: 0.3}}>{fmtK(line.nominalCapacityUnitsPerHour)} u/h</Typography>
              </Box>
              <Box>
                <Typography sx={{fontSize: 11, fontWeight: 800, color: planningTokens.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em'}}>Avg OEE</Typography>
                <Typography sx={{fontSize: 15, fontWeight: 900, color: planningTokens.primaryBlue, mt: 0.3}}>{line.avgOeePct}%</Typography>
              </Box>
              <Box>
                <Typography sx={{fontSize: 11, fontWeight: 800, color: planningTokens.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em'}}>Cap. at OEE / mo</Typography>
                <Typography sx={{fontSize: 15, fontWeight: 900, color: planningTokens.textPrimary, mt: 0.3}}>{fmtUnits(atOee)}</Typography>
              </Box>
              <Box>
                <Typography sx={{fontSize: 11, fontWeight: 800, color: planningTokens.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em'}}>People Avail.</Typography>
                <Typography sx={{fontSize: 15, fontWeight: 900, color: planningTokens.textPrimary, mt: 0.3}}>{line.peopleCount} operators</Typography>
              </Box>
              <Box>
                <Typography sx={{fontSize: 11, fontWeight: 800, color: planningTokens.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em'}}>SKUs Assigned</Typography>
                <Typography sx={{fontSize: 15, fontWeight: 900, color: planningTokens.textPrimary, mt: 0.3}}>{lineAssignments.length}</Typography>
              </Box>
              <Box>
                <Typography sx={{fontSize: 11, fontWeight: 800, color: planningTokens.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em'}}>Demand Load</Typography>
                <Typography sx={{fontSize: 15, fontWeight: 900, mt: 0.3, color: loadTone.color}}>
                  {utilization}%
                </Typography>
              </Box>
            </Box>
            <Box sx={{mt: 1.25, pt: 1.25, borderTop: `1px solid ${planningTokens.border}`, display: 'flex', gap: 2}}>
              <Box>
                <Typography sx={{fontSize: 11, color: planningTokens.textSecondary}}>Total Demand</Typography>
                <Typography sx={{fontSize: 13, fontWeight: 800, color: planningTokens.textPrimary}}>{fmtUnits(totalDemand)}/mo</Typography>
              </Box>
              <Box>
                <Typography sx={{fontSize: 11, color: planningTokens.textSecondary}}>Production Plan</Typography>
                <Typography sx={{fontSize: 13, fontWeight: 800, color: planningTokens.success}}>{fmtUnits(totalPlan)}/mo</Typography>
              </Box>
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}

const tableCellSx = {
  borderBottom: `1px solid ${planningTokens.border}`,
  fontSize: 12.5,
  color: planningTokens.textPrimary,
  py: 1.05,
};

function SkuAssignmentTable({
  assignments,
  lines,
  onLineChange,
}: {
  assignments: SkuLineAssignment[];
  lines: ProductionLine[];
  onLineChange: (skuCode: string, lineId: string) => void;
}) {
  return (
    <DataTable
      title="SKU Resource Assignment"
      description="Assign each SKU to a production line. Changes update the capacity load and flow graph below in real time."
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            {['SKU', 'Description', 'Resource', 'Nom. Cap. (u/h)', 'Avg OEE %', 'Cap. at OEE /mo', 'People', 'Demand /mo', 'Prod. Plan /mo'].map((h) => (
              <TableCell key={h} sx={{...tableCellSx, fontWeight: 900, color: planningTokens.textSecondary}}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {assignments.map((row) => {
            const sku = skuDemandMatrix.find((s) => s.skuCode === row.skuCode);
            const line = lines.find((l) => l.id === row.lineId);
            const atOee = line ? capacityAtOee(line) : 0;
            const coveragePct = row.demandUnitsMonthlyAvg > 0
              ? Math.round((row.productionPlanUnits / row.demandUnitsMonthlyAvg) * 100)
              : 0;
            const coverageTone = getCoverageTone(coveragePct);
            return (
              <TableRow key={row.skuCode} hover sx={{'&:last-child td': {borderBottom: 0}}}>
                <TableCell sx={{...tableCellSx, fontWeight: 800, color: planningTokens.primaryBlue}}>{row.skuCode}</TableCell>
                <TableCell sx={{...tableCellSx, color: planningTokens.textSecondary, maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                  {sku?.description ?? '—'}
                </TableCell>
                <TableCell sx={{...tableCellSx, py: 0.4}}>
                  <TextField
                    select
                    size="small"
                    value={row.lineId}
                    onChange={(e) => onLineChange(row.skuCode, e.target.value)}
                    sx={{
                      minWidth: 110,
                      '& .MuiOutlinedInput-root': {height: 32, borderRadius: 2, bgcolor: 'var(--planning-surface)', fontSize: 12.5},
                    }}
                  >
                    {lines.map((l) => (
                      <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>
                    ))}
                  </TextField>
                </TableCell>
                <TableCell sx={tableCellSx}>{line ? fmtK(line.nominalCapacityUnitsPerHour) : '—'}</TableCell>
                <TableCell sx={tableCellSx}>{line ? `${line.avgOeePct}%` : '—'}</TableCell>
                <TableCell sx={tableCellSx}>{line ? fmtUnits(atOee) : '—'}</TableCell>
                <TableCell sx={tableCellSx}>{line ? line.peopleCount : '—'}</TableCell>
                <TableCell sx={{...tableCellSx, fontWeight: 700}}>{fmtK(row.demandUnitsMonthlyAvg)}</TableCell>
                <TableCell sx={tableCellSx}>
                  <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8}}>
                    <Typography sx={{fontSize: 12.5, fontWeight: 700, color: planningTokens.textPrimary}}>{fmtK(row.productionPlanUnits)}</Typography>
                    <Chip
                      size="small"
                      label={`${coveragePct}%`}
                      sx={{
                        height: 20,
                        fontSize: 10.5,
                        fontWeight: 800,
                        bgcolor: coverageTone.bg,
                        color: coverageTone.color,
                        border: `1px solid ${coverageTone.border}`,
                      }}
                    />
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </DataTable>
  );
}

const NODE_HEIGHT = 36;
const NODE_GAP = 6;
const LEFT_X = 28;
const RIGHT_X = 512;
const SKU_NODE_WIDTH = 236;
const LINE_NODE_WIDTH = 208;
const GRAPH_PADDING_Y = 72;
const LANE_HEIGHT = 96;
const LINE_STEP = 128;

function SkuLineFlowGraph({
  assignments,
  lines,
}: {
  assignments: SkuLineAssignment[];
  lines: ProductionLine[];
}) {
  const skuCount = assignments.length;
  const svgHeight = Math.max(
    skuCount * (NODE_HEIGHT + NODE_GAP) + GRAPH_PADDING_Y * 2,
    lines.length * LINE_STEP + GRAPH_PADDING_Y * 2 + 20,
  );
  const svgWidth = RIGHT_X + LINE_NODE_WIDTH + 36;

  const maxDemand = useMemo(
    () => Math.max(...assignments.map((a) => a.demandUnitsMonthlyAvg), 1),
    [assignments],
  );

  const skuNodes = assignments.map((a, i) => ({
    ...a,
    cy: GRAPH_PADDING_Y + i * (NODE_HEIGHT + NODE_GAP) + NODE_HEIGHT / 2,
    sku: skuDemandMatrix.find((s) => s.skuCode === a.skuCode),
  }));

  const lineNodes = useMemo(() => {
    return lines.map((line, index) => {
      const lineAssigned = assignments.filter((a) => a.lineId === line.id);
      if (lineAssigned.length === 0) return null;
      const totalDemand = lineAssigned.reduce((sum, a) => sum + a.demandUnitsMonthlyAvg, 0);
      const totalPlan = lineAssigned.reduce((sum, a) => sum + a.productionPlanUnits, 0);
      const atOee = capacityAtOee(line);
      const utilPct = atOee > 0 ? Math.round((totalDemand / atOee) * 100) : 0;
      const cy = GRAPH_PADDING_Y + index * LINE_STEP + LANE_HEIGHT / 2;
      return {line, cy, count: lineAssigned.length, totalDemand, totalPlan, utilPct};
    }).filter(Boolean) as Array<{
      line: ProductionLine;
      cy: number;
      count: number;
      totalDemand: number;
      totalPlan: number;
      utilPct: number;
    }>;
  }, [assignments, lines]);

  const totalDemand = assignments.reduce((sum, assignment) => sum + assignment.demandUnitsMonthlyAvg, 0);
  const totalPlan = assignments.reduce((sum, assignment) => sum + assignment.productionPlanUnits, 0);
  const avgCoverage = totalDemand > 0 ? Math.round((totalPlan / totalDemand) * 100) : 0;
  const constrainedCount = lineNodes.filter((node) => node.utilPct > 90).length;

  return (
    <Paper elevation={0} sx={{...planningCardSx, p: 1.5}}>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1.5}}>
        <Box>
          <Typography sx={{fontSize: 16, fontWeight: 900, color: '#0F172A', lineHeight: 1}}>
            SKU → Line Flow
          </Typography>
          <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', mt: 0.2}}>
            Selected forecast traceability from SKU demand to assigned resource, using the same lineage-style reading flow.
          </Typography>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap'}}>
          <Chip size="small" label="Flow View" sx={{height: 24, fontSize: 11, fontWeight: 700, bgcolor: '#1D4ED8', color: '#FFFFFF', border: '1px solid #1D4ED8'}} />
          <Chip size="small" label={`${assignments.length} SKUs`} sx={{height: 24, fontSize: 11, fontWeight: 700, bgcolor: 'var(--planning-neutral-bg)', color: '#1D4ED8', border: '1px solid #BFDBFE'}} />
          <Chip size="small" label={`${lines.length} Resources`} sx={{height: 24, fontSize: 11, fontWeight: 700, bgcolor: 'var(--planning-surface-muted)', color: '#475569', border: '1px solid var(--planning-border)'}} />
        </Box>
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(4, minmax(0, 1fr))'}, gap: 1, mb: 1.5}}>
        {[
          {label: 'Forecast Demand', value: `${fmtUnits(totalDemand)}/mo`, helper: 'Read-only selected forecast'},
          {label: 'Production Plan', value: `${fmtUnits(totalPlan)}/mo`, helper: 'Current line allocation output'},
          {label: 'Average Coverage', value: `${avgCoverage}%`, helper: 'Demand-to-plan adherence'},
          {label: 'Constrained Resources', value: String(constrainedCount), helper: 'Lines above 90% load'},
        ].map((item) => (
          <Box
            key={item.label}
            sx={{
              p: 1.15,
              borderRadius: 2,
              border: '1px solid var(--planning-border)',
              bgcolor: 'var(--planning-surface-muted)',
            }}
          >
            <Typography sx={{fontSize: 10, color: 'var(--planning-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em'}}>
              {item.label}
            </Typography>
            <Typography sx={{fontSize: 15, color: '#0F172A', fontWeight: 900, mt: 0.35}}>
              {item.value}
            </Typography>
            <Typography sx={{fontSize: 10.5, color: 'var(--planning-text-secondary)', mt: 0.15}}>
              {item.helper}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{overflowX: 'auto'}}>
        <Box
          sx={{
            position: 'relative',
            minWidth: svgWidth,
            height: svgHeight,
            borderRadius: 3,
            border: '1px solid var(--planning-border)',
            bgcolor: 'var(--planning-surface)',
            overflow: 'hidden',
          }}
        >
          <Box sx={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 14%, #FFFFFF 100%)'}} />

          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: LEFT_X,
              width: SKU_NODE_WIDTH,
              px: 1.2,
              py: 0.7,
              borderRadius: 2,
              bgcolor: 'var(--planning-ai-accent-bg)',
              border: '1px solid #C7D2FE',
            }}
          >
            <Typography sx={{fontSize: 10, color: '#4338CA', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em'}}>
              Selected Forecast
            </Typography>
            <Typography sx={{fontSize: 12, color: '#0F172A', fontWeight: 800, mt: 0.1}}>
              SKU demand nodes
            </Typography>
          </Box>

          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: RIGHT_X,
              width: LINE_NODE_WIDTH,
              px: 1.2,
              py: 0.7,
              borderRadius: 2,
              bgcolor: '#ECFDF3',
              border: '1px solid #BBF7D0',
            }}
          >
            <Typography sx={{fontSize: 10, color: '#15803D', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em'}}>
              Resource Distribution
            </Typography>
            <Typography sx={{fontSize: 12, color: '#0F172A', fontWeight: 800, mt: 0.1}}>
              Line capacity nodes
            </Typography>
          </Box>

          <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{position: 'absolute', inset: 0, display: 'block'}}>
            <line x1={LEFT_X + SKU_NODE_WIDTH + 92} y1={54} x2={LEFT_X + SKU_NODE_WIDTH + 92} y2={svgHeight - 18} stroke="#E2E8F0" strokeDasharray="4 6" />
            {lineNodes.map((lineNode) => (
              <rect
                key={lineNode.line.id}
                x={RIGHT_X - 10}
                y={lineNode.cy - LANE_HEIGHT / 2}
                width={LINE_NODE_WIDTH + 20}
                height={LANE_HEIGHT}
                rx={16}
                fill="#F8FAFC"
                stroke="#E2E8F0"
              />
            ))}
            {skuNodes.map((skuNode) => {
              const lineNode = lineNodes.find((ln) => ln.line.id === skuNode.lineId);
              if (!lineNode) return null;
              const strokeW = Math.max(2, (skuNode.demandUnitsMonthlyAvg / maxDemand) * 12);
              const coverageRatio = skuNode.demandUnitsMonthlyAvg > 0 ? skuNode.productionPlanUnits / skuNode.demandUnitsMonthlyAvg : 0;
              const planW = Math.max(1.5, strokeW * coverageRatio);
              const x1 = LEFT_X + SKU_NODE_WIDTH;
              const x2 = RIGHT_X;
              const y1 = skuNode.cy;
              const y2 = lineNode.cy;
              const cx1 = x1 + (x2 - x1) * 0.38;
              const cx2 = x1 + (x2 - x1) * 0.62;
              const d = `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`;
              return (
                <g key={skuNode.skuCode}>
                  <path d={d} fill="none" stroke="#BFDBFE" strokeWidth={strokeW} strokeOpacity={0.75} />
                  <path d={d} fill="none" stroke="#16A34A" strokeWidth={planW} strokeOpacity={0.78} />
                  <circle cx={x1} cy={y1} r={4} fill="#2563EB" />
                  <circle cx={x2} cy={y2} r={4} fill="#16A34A" />
                </g>
              );
            })}
          </svg>

          {skuNodes.map((node) => {
            const coveragePct = node.demandUnitsMonthlyAvg > 0
              ? Math.round((node.productionPlanUnits / node.demandUnitsMonthlyAvg) * 100)
              : 0;
            const coverageTone = getCoverageTone(coveragePct);
            return (
              <Box
                key={node.skuCode}
                sx={{
                  position: 'absolute',
                  left: LEFT_X,
                  top: node.cy - 30,
                  width: SKU_NODE_WIDTH,
                  border: '1px solid #BFDBFE',
                  bgcolor: 'var(--planning-neutral-bg)',
                  borderRadius: 2,
                  p: 1,
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)',
                }}
              >
                <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.8}}>
                  <Box sx={{minWidth: 0}}>
                    <Typography sx={{fontSize: 11, fontWeight: 800, color: '#1D4ED8', fontFamily: 'monospace', lineHeight: 1.2}}>
                      {node.skuCode}
                    </Typography>
                    <Typography sx={{fontSize: 10, color: 'var(--planning-text-secondary)', mt: 0.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                      {node.sku?.description ?? 'No description'}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={coverageTone.label}
                    sx={{
                      height: 16,
                      fontSize: 9,
                      fontWeight: 800,
                      bgcolor: coverageTone.bg,
                      color: coverageTone.color,
                      border: `1px solid ${coverageTone.border}`,
                    }}
                  />
                </Box>
                <Typography sx={{fontSize: 11, color: '#0F172A', fontWeight: 700, mt: 0.55}}>
                  {fmtUnits(node.demandUnitsMonthlyAvg)}/mo demand
                </Typography>
                <Typography sx={{fontSize: 10, color: 'var(--planning-text-secondary)', mt: 0.15}}>
                  Plan {fmtUnits(node.productionPlanUnits)}/mo • Coverage {coveragePct}%
                </Typography>
              </Box>
            );
          })}

          {lineNodes.map((node) => {
            const loadTone = getLoadTone(node.utilPct);
            return (
              <Box
                key={node.line.id}
                sx={{
                  position: 'absolute',
                  left: RIGHT_X,
                  top: node.cy - 38,
                  width: LINE_NODE_WIDTH,
                  border: `1px solid ${loadTone.border}`,
                  bgcolor: loadTone.bg,
                  borderRadius: 2,
                  p: 1,
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)',
                }}
              >
                <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.8}}>
                  <Box sx={{minWidth: 0}}>
                    <Typography sx={{fontSize: 11, fontWeight: 800, color: '#0F172A', lineHeight: 1.2}}>
                      {node.line.name}
                    </Typography>
                    <Typography sx={{fontSize: 10, color: 'var(--planning-text-secondary)', mt: 0.15}}>
                      {node.count} assigned SKU{node.count > 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={loadTone.label}
                    sx={{
                      height: 16,
                      fontSize: 9,
                      fontWeight: 800,
                      bgcolor: 'var(--planning-surface)',
                      color: loadTone.color,
                      border: `1px solid ${loadTone.border}`,
                    }}
                  />
                </Box>
                <Typography sx={{fontSize: 11, color: '#0F172A', fontWeight: 700, mt: 0.55}}>
                  {fmtUnits(node.totalDemand)}/mo load • {node.utilPct}% utilization
                </Typography>
                <Typography sx={{fontSize: 10, color: 'var(--planning-text-secondary)', mt: 0.15}}>
                  Cap. at OEE {fmtUnits(capacityAtOee(node.line))}/mo • Plan {fmtUnits(node.totalPlan)}/mo
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box sx={{display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mt: 1.25}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6}}>
          <Box sx={{width: 28, height: 4, borderRadius: 999, bgcolor: '#BFDBFE'}} />
          <Typography sx={{fontSize: 12, color: planningTokens.textSecondary}}>Forecast demand path</Typography>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6}}>
          <Box sx={{width: 28, height: 4, borderRadius: 999, bgcolor: '#16A34A'}} />
          <Typography sx={{fontSize: 12, color: planningTokens.textSecondary}}>Planned production path</Typography>
        </Box>
        <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>
          Change assignments in the table above to reroute the lineage between selected forecast SKUs and line resources.
        </Typography>
      </Box>
    </Paper>
  );
}

export default function ResourceDistributionTab() {
  const [assignments, setAssignments] = useState<SkuLineAssignment[]>(skuLineAssignments);

  function handleLineChange(skuCode: string, lineId: string) {
    setAssignments((current) =>
      current.map((a) => a.skuCode === skuCode ? {...a, lineId} : a),
    );
  }

  return (
    <Stack spacing={2}>
      <LineCapacityCards lines={productionLines} assignments={assignments} />
      <SkuAssignmentTable
        assignments={assignments}
        lines={productionLines}
        onLineChange={handleLineChange}
      />
      <SkuLineFlowGraph assignments={assignments} lines={productionLines} />
    </Stack>
  );
}
