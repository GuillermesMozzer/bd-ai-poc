import React from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ct, toneColor } from './cockpitTheme';
import type { CockpitKpi } from './macroflowModel';

type KpiDrilldownModalProps = {
  open: boolean;
  kpi: CockpitKpi | null;
  onClose: () => void;
};

export default function KpiDrilldownModal({ open, kpi, onClose }: KpiDrilldownModalProps) {
  const chartData =
    kpi?.sparkline.map((v, i) => ({
      t: `T-${kpi.sparkline.length - 1 - i}`,
      value: v,
    })) ?? [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: ct.bgElevated,
          color: ct.text,
          border: `1px solid ${ct.borderStrong}`,
          borderRadius: 2,
          backgroundImage: 'none',
          minHeight: '70vh',
        },
      }}
      slotProps={{
        backdrop: { sx: { bgcolor: 'rgba(0,0,0,0.45)' } },
      }}
    >
      {kpi ? (
        <DialogContent sx={{ p: 0 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${ct.border}` }}
          >
            <Box>
              <Typography sx={{ fontSize: 11, color: ct.textDim, letterSpacing: '0.08em' }}>
                LEVEL 3 · KPI DRILL-DOWN · {kpi.macroflow}
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 800, fontFamily: ct.font }}>
                {kpi.label}
                {kpi.unit ? ` · ${kpi.unit}` : ''}
              </Typography>
            </Box>
            <IconButton onClick={onClose} sx={{ color: ct.textMuted }} aria-label="Close KPI drill-down">
              <CloseIcon />
            </IconButton>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' },
              gap: 0,
              borderBottom: `1px solid ${ct.border}`,
            }}
          >
            <Box sx={{ p: 2.5, borderRight: { md: `1px solid ${ct.border}` }, minHeight: 280 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1 }}>
                <Typography sx={{ fontSize: 12, color: ct.textMuted }}>{kpi.target}</Typography>
                <Typography sx={{ fontSize: 28, fontWeight: 700, color: toneColor(kpi.tone), fontFamily: ct.mono }}>
                  {kpi.value}
                </Typography>
              </Stack>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid stroke={ct.border} strokeDasharray="3 3" />
                    <XAxis dataKey="t" stroke={ct.textDim} tick={{ fill: ct.textDim, fontSize: 11 }} />
                    <YAxis stroke={ct.textDim} tick={{ fill: ct.textDim, fontSize: 11 }} width={36} />
                    <Tooltip
                      contentStyle={{
                        background: ct.bgCard,
                        border: `1px solid ${ct.borderStrong}`,
                        borderRadius: 8,
                        color: ct.text,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={ct.accent}
                      strokeWidth={2}
                      dot={{ r: 3, fill: ct.accent }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>

            <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', maxHeight: 320 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 800, mb: 1 }}>Comments & notifications</Typography>
              <Box sx={{ flex: 1, overflow: 'auto', mb: 1.5 }}>
                <Stack spacing={1.2}>
                  <Box sx={{ p: 1.2, bgcolor: ct.bgCard, borderRadius: 1, border: `1px solid ${ct.border}` }}>
                    <Typography sx={{ fontSize: 11, color: ct.accent, fontWeight: 700 }}>AI insight</Typography>
                    <Typography sx={{ fontSize: 12, color: ct.text, mt: 0.4, lineHeight: 1.45 }}>
                      {kpi.insight}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.2, bgcolor: ct.bgCard, borderRadius: 1, border: `1px solid ${ct.border}` }}>
                    <Typography sx={{ fontSize: 11, color: ct.textMuted }}>SAP · system</Typography>
                    <Typography sx={{ fontSize: 12, mt: 0.4 }}>
                      Linked visibility record refreshed from CDF Gold. Delta: {kpi.delta}.
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              <TextField
                size="small"
                placeholder="Add comment…"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: ct.text,
                    fontSize: 13,
                    bgcolor: 'var(--input-bg)',
                    '& fieldset': { borderColor: ct.borderStrong },
                    '&:hover fieldset': { borderColor: 'var(--input-hover-border-color)' },
                    '&.Mui-focused fieldset': { borderColor: ct.accent },
                  },
                }}
              />
            </Box>
          </Box>

          <Box sx={{ p: 2.5 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 800, mb: 1 }}>Supporting data</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['ID', 'Detail', 'Age / status', 'Owner'].map((h) => (
                    <TableCell
                      key={h}
                      sx={{
                        color: ct.textMuted,
                        borderColor: ct.border,
                        fontSize: 11,
                        fontWeight: 700,
                        py: 0.8,
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {kpi.tableRows.length ? (
                  kpi.tableRows.map((row) => (
                    <TableRow key={row.key} hover>
                      <TableCell sx={{ color: ct.accent, borderColor: ct.border, fontSize: 12, fontFamily: ct.mono }}>
                        {row.key}
                      </TableCell>
                      <TableCell sx={{ color: ct.text, borderColor: ct.border, fontSize: 12 }}>{row.value}</TableCell>
                      <TableCell sx={{ color: ct.textMuted, borderColor: ct.border, fontSize: 12 }}>
                        {row.age ?? '—'}
                      </TableCell>
                      <TableCell sx={{ color: ct.textMuted, borderColor: ct.border, fontSize: 12 }}>
                        {row.owner ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ color: ct.textDim, borderColor: ct.border }}>
                      No detail rows in mock index for this KPI.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
