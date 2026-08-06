import {Box, Button, Chip, Paper, Stack, Typography} from '@mui/material';
import {planningTokens} from '../../ui/planningTheme';
import type {CapacityLineDetail, CapacitySiteArea} from '../types';
import {formatHours, getUtilizationColor} from '../utils';

type StatusDotProps = {pct: number | null};
function StatusDot({pct}: StatusDotProps) {
  if (pct === null) return <Typography sx={{fontSize: 12, color: planningTokens.textMuted}}>—</Typography>;
  const color = pct > 120 ? '#DC2626' : pct > 105 ? '#F97316' : pct > 90 ? '#EAB308' : '#22C55E';
  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <Box sx={{width: 8, height: 8, borderRadius: '50%', bgcolor: color}} />
      <Typography sx={{fontSize: 12, fontWeight: 700, color}}>{pct}%</Typography>
    </Stack>
  );
}

type SiteSummaryProps = {areas: CapacitySiteArea[]; selectedMonth: string};

function SiteCapacitySummaryTable({areas, selectedMonth}: SiteSummaryProps) {
  const cols = ['Area', 'Available (hrs)', 'Required (hrs)', 'Utilization', 'Status'];

  return (
    <Paper elevation={0} sx={{borderRadius: 3, border: `1px solid ${planningTokens.border}`, overflow: 'hidden'}}>
      <Box sx={{px: 2, py: 1.2, borderBottom: `1px solid ${planningTokens.border}`}}>
        <Typography sx={{fontSize: 13, fontWeight: 700, color: planningTokens.textPrimary}}>
          Site Capacity Summary – {selectedMonth}
        </Typography>
      </Box>
      <Box sx={{overflowX: 'auto'}}>
        <Box component="table" sx={{width: '100%', borderCollapse: 'collapse', fontSize: 12}}>
          <Box component="thead">
            <Box component="tr" sx={{bgcolor: planningTokens.surfaceMuted}}>
              {cols.map((c) => (
                <Box component="th" key={c} sx={{px: 1.5, py: 0.8, textAlign: 'left', fontSize: 11, fontWeight: 700, color: planningTokens.textSecondary, whiteSpace: 'nowrap'}}>
                  {c}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {areas.map((area, i) => {
              const isTotal = area.area === 'Total';
              return (
                <Box
                  component="tr"
                  key={area.area}
                  sx={{
                    borderTop: isTotal ? `2px solid ${planningTokens.border}` : `1px solid ${planningTokens.border}`,
                    bgcolor: isTotal ? planningTokens.surfaceMuted : 'transparent',
                    fontWeight: isTotal ? 700 : 400,
                  }}
                >
                  <Box component="td" sx={{px: 1.5, py: 0.9, fontWeight: isTotal ? 700 : 500, color: planningTokens.textPrimary}}>{area.area}</Box>
                  <Box component="td" sx={{px: 1.5, py: 0.9, color: planningTokens.textPrimary}}>
                    {area.availableHrs !== null ? formatHours(area.availableHrs) : '—'}
                  </Box>
                  <Box component="td" sx={{px: 1.5, py: 0.9, color: planningTokens.textPrimary}}>
                    {area.requiredHrs !== null ? formatHours(area.requiredHrs) : '—'}
                  </Box>
                  <Box component="td" sx={{px: 1.5, py: 0.9}}>
                    <StatusDot pct={area.utilizationPct} />
                  </Box>
                  <Box component="td" sx={{px: 1.5, py: 0.9}}>
                    {area.status === 'NA' ? (
                      <Typography sx={{fontSize: 11, color: planningTokens.textMuted}}>—</Typography>
                    ) : (
                      <Typography sx={{fontSize: 11, fontWeight: 600, color: getUtilizationColor(area.status)}}>
                        {area.status}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Color distribution bar */}
      <Box sx={{px: 2, py: 1.2, borderTop: `1px solid ${planningTokens.border}`}}>
        <Stack direction="row" spacing={0} sx={{borderRadius: 1, overflow: 'hidden', height: 22}}>
          {[
            {pct: 28, color: '#22C55E', label: '4 (28%)'},
            {pct: 38, color: '#EAB308', label: '5 (38%)'},
            {pct: 21, color: '#F97316', label: '3 (21%)'},
            {pct: 14, color: '#DC2626', label: '2 (14%)'},
          ].map((seg) => (
            <Box key={seg.color} sx={{flex: seg.pct, bgcolor: seg.color, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Typography sx={{fontSize: 10, fontWeight: 700, color: '#fff'}}>{seg.label}</Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Paper>
  );
}

type LineDetailProps = {
  detail: CapacityLineDetail;
  selectedMonth: string;
  lineName: string;
};

function LineCapacityDetail({detail, selectedMonth, lineName}: LineDetailProps) {
  const rows: {label: string; value: React.ReactNode}[] = [
    {label: 'Available Capacity', value: `${formatHours(detail.availableHrs)} hrs`},
    {label: 'Required Capacity', value: `${formatHours(detail.requiredHrs)} hrs`},
    {
      label: 'Utilization',
      value: (
        <Typography sx={{fontSize: 13, fontWeight: 700, color: getUtilizationColor(detail.utilizationPct > 120 ? 'Overloaded' : detail.utilizationPct > 105 ? 'AtRisk' : 'OK')}}>
          {detail.utilizationPct}%
        </Typography>
      ),
    },
    {
      label: 'Capacity Gap',
      value: (
        <Typography sx={{fontSize: 13, fontWeight: 700, color: detail.capacityGap < 0 ? planningTokens.danger : planningTokens.success}}>
          {detail.capacityGap < 0 ? '-' : '+'}{formatHours(Math.abs(detail.capacityGap))} hrs
        </Typography>
      ),
    },
    {label: 'Bottleneck Reason', value: detail.bottleneckReason},
    {label: 'Main Products', value: detail.mainProducts.join(', ')},
  ];

  return (
    <Paper elevation={0} sx={{borderRadius: 3, border: `1px solid ${planningTokens.border}`, overflow: 'hidden'}}>
      <Box sx={{px: 2, py: 1.2, borderBottom: `1px solid ${planningTokens.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <Typography sx={{fontSize: 13, fontWeight: 700, color: planningTokens.textPrimary}}>
          {lineName} – Capacity Details – {selectedMonth}
        </Typography>
        <Button variant="text" size="small" sx={{fontSize: 11, fontWeight: 700, textTransform: 'none', color: planningTokens.primaryBlue}}>
          View Line
        </Button>
      </Box>
      <Box sx={{px: 2, py: 1}}>
        {rows.map((row) => (
          <Stack key={row.label} direction="row" justifyContent="space-between" alignItems="center" sx={{py: 0.6, borderBottom: `1px solid ${planningTokens.border}`}}>
            <Typography sx={{fontSize: 12, color: planningTokens.textSecondary}}>{row.label}</Typography>
            {typeof row.value === 'string' ? (
              <Typography sx={{fontSize: 12, fontWeight: 600, color: planningTokens.textPrimary, textAlign: 'right', maxWidth: '55%'}}>{row.value}</Typography>
            ) : row.value}
          </Stack>
        ))}
        {detail.topConstraints.length > 0 && (
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{py: 0.8}}>
            <Typography sx={{fontSize: 12, color: planningTokens.textSecondary}}>Top Constraints</Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" justifyContent="flex-end">
              {detail.topConstraints.map((c) => (
                <Chip key={c} label={c} size="small" sx={{fontSize: 10, fontWeight: 600, height: 20, bgcolor: '#FEF2F2', color: planningTokens.danger, border: `1px solid #FCA5A5`}} />
              ))}
            </Stack>
          </Stack>
        )}
      </Box>
    </Paper>
  );
}

type Props = {
  areas: CapacitySiteArea[];
  selectedMonth: string;
  selectedLineDetail: CapacityLineDetail | null;
  selectedLineName: string | null;
};

export default function SiteCapacitySummaryPanel({areas, selectedMonth, selectedLineDetail, selectedLineName}: Props) {
  return (
    <Stack spacing={1.5}>
      <SiteCapacitySummaryTable areas={areas} selectedMonth={selectedMonth} />
      {selectedLineDetail && selectedLineName && (
        <LineCapacityDetail detail={selectedLineDetail} selectedMonth={selectedMonth} lineName={selectedLineName} />
      )}
    </Stack>
  );
}
