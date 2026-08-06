import {BarChart} from '@mui/x-charts/BarChart';
import {Box, Chip, Stack, Typography} from '@mui/material';
import type {MpsBucketLine, ProductionLine} from '../types';

type Props = {
  bucketLines: MpsBucketLine[];
  productionLines: ProductionLine[];
};

type LineWeekSummary = {
  lineId: string;
  lineName: string;
  bucketLabel: string;
  totalRequiredHours: number;
  totalAvailableHours: number;
  utilizationPercent: number;
  isOverloaded: boolean;
};

function buildCapacitySummary(bucketLines: MpsBucketLine[], lines: ProductionLine[]): LineWeekSummary[] {
  const lineMap = new Map(lines.map((l) => [l.id, l.name]));
  const groups = new Map<string, {req: number; avail: number}>();

  for (const b of bucketLines) {
    if (!b.assignedLineId) continue;
    const key = `${b.assignedLineId}||${b.bucketLabel}`;
    const existing = groups.get(key) ?? {req: 0, avail: 0};
    groups.set(key, {
      req: existing.req + b.requiredHours,
      avail: Math.max(existing.avail, b.availableHours),
    });
  }

  const result: LineWeekSummary[] = [];
  for (const [key, data] of groups) {
    const [lineId, bucketLabel] = key.split('||');
    const utilPct = data.avail > 0 ? Number(((data.req / data.avail) * 100).toFixed(1)) : 0;
    result.push({
      lineId,
      lineName: lineMap.get(lineId) ?? lineId,
      bucketLabel,
      totalRequiredHours: Number(data.req.toFixed(2)),
      totalAvailableHours: data.avail,
      utilizationPercent: utilPct,
      isOverloaded: utilPct > 100,
    });
  }

  return result.sort((a, b) => a.lineName.localeCompare(b.lineName) || a.bucketLabel.localeCompare(b.bucketLabel));
}

const BUCKETS = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

export default function MpsCapacitySummaryPanel({bucketLines, productionLines}: Props) {
  const summaries = buildCapacitySummary(bucketLines, productionLines);

  const chartXLabels = productionLines.flatMap((l) => BUCKETS.map((b) => `${l.name}\n${b}`));
  const chartData = productionLines.flatMap((l) =>
    BUCKETS.map((b) => summaries.find((s) => s.lineId === l.id && s.bucketLabel === b)?.utilizationPercent ?? 0),
  );

  const overloadedRows = summaries.filter((s) => s.isOverloaded);

  return (
    <Box>
      <Typography sx={{fontSize: 15, fontWeight: 800, color: 'var(--planning-text-primary)', mb: 2}}>Capacity Summary</Typography>

      {overloadedRows.length > 0 && (
        <Box sx={{mb: 2, p: 1.4, bgcolor: '#FEF3F2', border: '1px solid #FECDCA', borderRadius: 2.5}}>
          <Typography sx={{fontSize: 12, fontWeight: 700, color: '#B42318', mb: 0.8}}>Overloaded combinations:</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={0.6}>
            {overloadedRows.map((r) => (
              <Chip key={`${r.lineId}-${r.bucketLabel}`} label={`${r.lineName} / ${r.bucketLabel} — ${r.utilizationPercent}%`} size="small" sx={{bgcolor: '#FEF3F2', color: '#B42318', border: '1px solid #FECDCA', fontWeight: 700, fontSize: 11}} />
            ))}
          </Stack>
        </Box>
      )}

      {/* Chart */}
      <Box sx={{mb: 3}}>
        <Typography sx={{fontSize: 12, fontWeight: 700, color: 'var(--planning-text-secondary)', mb: 1}}>Utilization % by Line / Week</Typography>
        <BarChart
          height={240}
          xAxis={[{scaleType: 'band', data: chartXLabels, tickLabelStyle: {fontSize: 10}}]}
          yAxis={[{max: 120, label: 'Utilization %'}]}
          series={[{
            data: chartData,
            label: 'Utilization %',
            color: '#7C3AED',
            valueFormatter: (v) => `${v}%`,
          }]}
          margin={{left: 56, right: 16, top: 8, bottom: 48}}
        />
      </Box>

      {/* Table */}
      <Box sx={{overflowX: 'auto'}}>
        <Box sx={{display: 'grid', gridTemplateColumns: '100px 80px 110px 110px 100px 80px', minWidth: 620}}>
          {['Line', 'Week', 'Req Hours', 'Avail Hours', 'Remaining', 'Util %'].map((h) => (
            <Typography key={h} sx={{fontSize: 10, fontWeight: 700, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', p: '6px 8px', bgcolor: 'var(--planning-surface-muted)', borderBottom: '1px solid var(--planning-border)'}}>{h}</Typography>
          ))}
          {summaries.map((s, i) => {
            const bg = s.isOverloaded ? '#FEF3F2' : i % 2 === 0 ? '#FAFAFA' : '#fff';
            const utilColor = s.isOverloaded ? '#B42318' : s.utilizationPercent >= 90 ? '#B54708' : '#027A48';
            return (
              <>
                <CellBox key={`${s.lineId}-${s.bucketLabel}-name`} bg={bg}>{s.lineName}</CellBox>
                <CellBox key={`${s.lineId}-${s.bucketLabel}-week`} bg={bg}>{s.bucketLabel}</CellBox>
                <CellBox key={`${s.lineId}-${s.bucketLabel}-req`} bg={bg}>{s.totalRequiredHours}</CellBox>
                <CellBox key={`${s.lineId}-${s.bucketLabel}-avail`} bg={bg}>{s.totalAvailableHours}</CellBox>
                <CellBox key={`${s.lineId}-${s.bucketLabel}-rem`} bg={bg}>{Number((s.totalAvailableHours - s.totalRequiredHours).toFixed(2))}</CellBox>
                <Box key={`${s.lineId}-${s.bucketLabel}-util`} sx={{p: '6px 8px', borderBottom: '1px solid var(--planning-border)', bgcolor: bg}}>
                  <Typography sx={{fontSize: 12, fontWeight: 700, color: utilColor}}>{s.utilizationPercent}%</Typography>
                </Box>
              </>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

function CellBox({children, bg}: {children: React.ReactNode; bg: string}) {
  return (
    <Box sx={{p: '6px 8px', borderBottom: '1px solid var(--planning-border)', bgcolor: bg}}>
      <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{String(children)}</Typography>
    </Box>
  );
}
