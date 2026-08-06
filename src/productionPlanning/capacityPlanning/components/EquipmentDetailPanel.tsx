import {Box, Chip, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography} from '@mui/material';
import {
  Build as BuildIcon,
  CalendarMonth as CalendarMonthIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {planningTokens} from '../../ui/planningTheme';
import type {EquipmentLedgerEntry, EquipmentOeePoint} from '../types';

type Props = {
  machineId: string;
  machineName: string;
  lineName: string;
  oeeData: EquipmentOeePoint[];
  ledger: EquipmentLedgerEntry[];
};

const LEDGER_TYPE_COLORS: Record<EquipmentLedgerEntry['type'], {bg: string; color: string}> = {
  'Planned Maintenance': {bg: '#EFF6FF', color: '#1D4ED8'},
  'Unplanned Downtime':  {bg: '#FEF2F2', color: '#DC2626'},
  'Changeover':          {bg: '#FFF7ED', color: '#C2410C'},
  'Inspection':          {bg: '#F0FDF4', color: '#15803D'},
  'Repair':              {bg: '#FDF4FF', color: '#7E22CE'},
  'Calibration':         {bg: '#F8FAFC', color: '#475569'},
};

const sectionHeaderSx = {fontSize: 12, fontWeight: 700, color: planningTokens.textPrimary};

function SectionCard({title, icon, children}: {title: string; icon: React.ReactNode; children: React.ReactNode}) {
  return (
    <Paper
      elevation={0}
      sx={{border: `1px solid ${planningTokens.border}`, borderRadius: 2, overflow: 'hidden'}}
    >
      <Box sx={{px: 2, py: 1.25, borderBottom: `1px solid ${planningTokens.border}`, display: 'flex', alignItems: 'center', gap: 1}}>
        {icon}
        <Typography sx={sectionHeaderSx}>{title}</Typography>
      </Box>
      <Box sx={{px: 2, py: 1.5}}>
        {children}
      </Box>
    </Paper>
  );
}

export default function EquipmentDetailPanel({machineId, machineName, lineName, oeeData, ledger}: Props) {
  const latestOee = oeeData[oeeData.length - 1];
  const avgOee = Math.round(oeeData.reduce((s, p) => s + p.oee, 0) / oeeData.length * 10) / 10;

  const chartData = oeeData.map((p) => {
    const [mon, yr] = p.month.split('-');
    return {...p, label: `${mon}'${yr.slice(2)}`};
  });

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
      {/* Equipment header */}
      <Paper elevation={0} sx={{border: `1px solid ${planningTokens.border}`, borderRadius: 2, px: 2, py: 1.5}}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <BuildIcon sx={{fontSize: 20, color: planningTokens.primaryBlue}} />
          <Box sx={{flex: 1}}>
            <Typography sx={{fontSize: 15, fontWeight: 800, color: planningTokens.textPrimary}}>{machineName}</Typography>
            <Typography sx={{fontSize: 11, color: planningTokens.textMuted}}>{lineName} · {machineId}</Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Box sx={{textAlign: 'right'}}>
              <Typography sx={{fontSize: 10, color: planningTokens.textMuted}}>Current OEE</Typography>
              <Typography sx={{fontSize: 18, fontWeight: 800, color: latestOee?.oee >= 80 ? '#15803D' : '#C2410C'}}>
                {latestOee?.oee ?? '--'}%
              </Typography>
            </Box>
            <Box sx={{textAlign: 'right'}}>
              <Typography sx={{fontSize: 10, color: planningTokens.textMuted}}>12-mo Avg OEE</Typography>
              <Typography sx={{fontSize: 18, fontWeight: 800, color: planningTokens.textPrimary}}>
                {avgOee}%
              </Typography>
            </Box>
            <Box sx={{textAlign: 'right'}}>
              <Typography sx={{fontSize: 10, color: planningTokens.textMuted}}>Design Rate</Typography>
              <Typography sx={{fontSize: 18, fontWeight: 800, color: planningTokens.textPrimary}}>
                {latestOee?.designRate ?? '--'} <span style={{fontSize: 11, fontWeight: 500}}>pcs/hr</span>
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Paper>

      {/* OEE Trend */}
      <SectionCard
        title="OEE Trend – Last 12 Months"
        icon={<SpeedIcon sx={{fontSize: 15, color: '#7C3AED'}} />}
      >
        <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2}}>
          {/* OEE overall */}
          <Box>
            <Typography sx={{fontSize: 11, fontWeight: 600, color: planningTokens.textSecondary, mb: 0.5}}>OEE (%)</Typography>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={chartData} margin={{top: 4, right: 4, bottom: 0, left: -20}}>
                <defs>
                  <linearGradient id="oeeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={planningTokens.border} vertical={false} />
                <XAxis dataKey="label" tick={{fontSize: 9}} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{fontSize: 9}} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  formatter={(v: number) => [`${v}%`]}
                  contentStyle={{fontSize: 11, borderRadius: 6, border: `1px solid ${planningTokens.border}`}}
                />
                <Area dataKey="oee" name="OEE" stroke="#7C3AED" strokeWidth={2} fill="url(#oeeGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Box>

          {/* A / P / Q breakdown */}
          <Box>
            <Typography sx={{fontSize: 11, fontWeight: 600, color: planningTokens.textSecondary, mb: 0.5}}>A / P / Q (%)</Typography>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={chartData} margin={{top: 4, right: 4, bottom: 0, left: -20}}>
                <CartesianGrid strokeDasharray="3 3" stroke={planningTokens.border} vertical={false} />
                <XAxis dataKey="label" tick={{fontSize: 9}} axisLine={false} tickLine={false} />
                <YAxis domain={[70, 100]} tick={{fontSize: 9}} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  formatter={(v: number, n: string) => [`${v}%`, n]}
                  contentStyle={{fontSize: 11, borderRadius: 6, border: `1px solid ${planningTokens.border}`}}
                />
                <Legend wrapperStyle={{fontSize: 10}} />
                <Line dataKey="availability" name="Availability" stroke="#22C55E" strokeWidth={1.5} dot={false} />
                <Line dataKey="performance" name="Performance" stroke="#3B82F6" strokeWidth={1.5} dot={false} />
                <Line dataKey="quality" name="Quality" stroke="#F59E0B" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </SectionCard>

      {/* Design Rate Trend */}
      <SectionCard
        title="Design Rate Trend – Last 12 Months"
        icon={<SpeedIcon sx={{fontSize: 15, color: planningTokens.primaryBlue}} />}
      >
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={chartData} margin={{top: 4, right: 4, bottom: 0, left: -20}}>
            <CartesianGrid strokeDasharray="3 3" stroke={planningTokens.border} vertical={false} />
            <XAxis dataKey="label" tick={{fontSize: 9}} axisLine={false} tickLine={false} />
            <YAxis tick={{fontSize: 9}} axisLine={false} tickLine={false} unit=" pcs" />
            <Tooltip
              formatter={(v: number, n: string) => [`${v} pcs/hr`, n]}
              contentStyle={{fontSize: 11, borderRadius: 6, border: `1px solid ${planningTokens.border}`}}
            />
            <Legend wrapperStyle={{fontSize: 10}} />
            <Line dataKey="designRate" name="Design Rate" stroke="#CBD5E1" strokeWidth={2} strokeDasharray="4 2" dot={false} />
            <Line dataKey="actualRate" name="Actual Rate" stroke={planningTokens.primaryBlue} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Equipment Ledger */}
      <SectionCard
        title="Equipment Ledger"
        icon={<CalendarMonthIcon sx={{fontSize: 15, color: planningTokens.textMuted}} />}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{'& th': {fontSize: 11, fontWeight: 700, color: planningTokens.textMuted, py: 0.5, borderBottom: `1px solid ${planningTokens.border}`}}}>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Duration (h)</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ledger.map((entry, i) => {
              const colors = LEDGER_TYPE_COLORS[entry.type];
              return (
                <TableRow key={i} sx={{'& td': {fontSize: 12, py: 0.75, borderBottom: `1px solid color-mix(in srgb, ${planningTokens.border} 20%, transparent)`}}}>
                  <TableCell sx={{color: planningTokens.textSecondary, whiteSpace: 'nowrap'}}>{entry.date}</TableCell>
                  <TableCell>
                    <Chip
                      label={entry.type}
                      size="small"
                      sx={{fontSize: 10, height: 18, bgcolor: colors.bg, color: colors.color, fontWeight: 600, border: `1px solid color-mix(in srgb, ${colors.color} 20%, transparent)`}}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{fontWeight: 600, color: planningTokens.textPrimary}}>{entry.duration}h</TableCell>
                  <TableCell sx={{color: planningTokens.textSecondary}}>{entry.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={entry.status}
                      size="small"
                      sx={{
                        fontSize: 10, height: 18, fontWeight: 600,
                        bgcolor: entry.status === 'Open' ? '#FEF2F2' : '#F0FDF4',
                        color: entry.status === 'Open' ? '#DC2626' : '#15803D',
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </SectionCard>
    </Box>
  );
}
