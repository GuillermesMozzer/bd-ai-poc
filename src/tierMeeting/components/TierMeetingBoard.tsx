import {useMemo, useState} from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Search as SearchIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';
import type {ActionTrackerCategory, ActionTrackerRow} from '../../actionTracker/types';
import TierBoardImportExportDialog from './TierBoardImportExportDialog';

type TierMeetingBoardProps = {
  actionRows: ActionTrackerRow[];
  actionTrackerKpis: ReadonlyArray<{label: string; value: number; tone: string; urgent: boolean;}>;
  actionTrackerBoardCategoryFilter: ActionTrackerCategory | '';
  actionTrackerRows: ActionTrackerRow[];
  actionTrackerView: 'table' | 'kanban';
  lightHeaderIconButtonSx: object;
  onActionTrackerViewChange: (view: 'table' | 'kanban') => void;
  onClearActionTrackerBoardCategoryFilter: () => void;
  onOpenActionCreateDrawer: () => void;
  onOpenActionFilters: () => void;
  onOpenActionTracker: (category?: ActionTrackerCategory) => void;
  onOpenActionDetails: (row: ActionTrackerRow) => void;
  onOpenDocumentOperations: () => void;
  onStartMeeting: () => void;
};

const colors = {
  bg: '#EEF3F8',
  card: '#FFFFFF',
  border: '#D9DEE6',
  text: '#1A1F2E',
  muted: '#60697C',
  blue: '#044ED7',
  red: '#E43B46',
  green: '#16A34A',
};

const sqdcpCardTone: Record<string, {accent: string; soft: string; glow: string; chipBg: string}> = {
  S: {accent: colors.red, soft: '#FFF3F4', glow: 'rgba(228, 59, 70, 0.14)', chipBg: '#FFE5E8'},
  Q: {accent: colors.green, soft: '#F1FBF4', glow: 'rgba(22, 163, 74, 0.14)', chipBg: '#E2F7E8'},
  D: {accent: colors.red, soft: '#FFF3F4', glow: 'rgba(228, 59, 70, 0.14)', chipBg: '#FFE5E8'},
  C: {accent: colors.green, soft: '#F1FBF4', glow: 'rgba(22, 163, 74, 0.14)', chipBg: '#E2F7E8'},
  P: {accent: colors.red, soft: '#FFF3F4', glow: 'rgba(228, 59, 70, 0.14)', chipBg: '#FFE5E8'},
  L: {accent: '#1457D7', soft: '#F2F7FF', glow: 'rgba(20, 87, 215, 0.12)', chipBg: '#E5EEFF'},
};

const safetyMetrics = [
  {label: 'Fatality', value: '0', target: '0', tone: colors.green},
  {label: 'Serious Injury', value: '4', target: '1', tone: colors.red},
  {label: 'Minor Injury', value: '12', target: '4', tone: colors.red},
  {label: 'Near Misses', value: '2', target: '4', tone: colors.green},
  {label: 'Days Without Injuries', value: '4', target: 'Record 97', tone: colors.green},
];

const qualityMetrics = [
  {label: 'Field Actions', value: '2', target: '2', tone: colors.red},
  {label: 'Complaints', value: '1', target: '1', tone: colors.red},
  {label: 'NCNs', value: '1', target: '1', tone: colors.red},
  {label: 'CAPAs', value: '4', target: '4', tone: colors.green},
  {label: 'Days Without Issues', value: '13', target: 'Record 120', tone: colors.green},
];

const peopleMetrics = [
  {label: 'Absences', value: '2', target: '0', tone: colors.red},
  {label: 'Days Off', value: '5', target: 'Planned 5', tone: colors.green},
  {label: 'Medical Leaves', value: '1', target: '0', tone: colors.red},
  {label: 'Vacation', value: '2', target: 'Planned 2', tone: colors.green},
  {label: 'Available Team', value: '67%', target: '100%', tone: colors.red},
];

const statusChipTone: Record<ActionTrackerRow['status'], {fg: string; bg: string; border: string}> = {
  Open: {fg: '#C05621', bg: '#FFF7ED', border: '#FDBA74'},
  'In Progress': {fg: '#175CD3', bg: '#EFF6FF', border: '#93C5FD'},
  Reopened: {fg: '#B45309', bg: '#FFFBEB', border: '#FCD34D'},
  'Under Approval': {fg: '#7C3AED', bg: '#F5F3FF', border: '#C4B5FD'},
  Completed: {fg: '#15803D', bg: '#F0FDF4', border: '#86EFAC'},
  Canceled: {fg: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB'},
  Overdue: {fg: '#B91C1C', bg: '#FEF2F2', border: '#FCA5A5'},
};

function SqdcpCard({letter, title, letterColor, children}: {letter: string; title: string; letterColor: string; children: React.ReactNode}) {
  const tone = sqdcpCardTone[letter] ?? sqdcpCardTone.L;
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        border: `1px solid ${colors.border}`,
        borderRadius: 2.4,
        overflow: 'hidden',
        bgcolor: colors.card,
        minHeight: 432,
        boxShadow: `0 18px 32px ${tone.glow}, 0 2px 8px rgba(15, 23, 42, 0.05)`,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${tone.soft} 0%, rgba(255,255,255,0) 28%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Box sx={{position: 'relative', p: 1.1, borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.85}}>
          <Box sx={{width: 36, height: 36, borderRadius: 1.3, bgcolor: tone.chipBg, border: `1px solid ${tone.accent}33`, color: letterColor, fontWeight: 900, fontSize: '1.15rem', display: 'grid', placeItems: 'center', lineHeight: 1, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.7), 0 8px 18px ${tone.glow}`}}>
            {letter}
          </Box>
          <Box>
            <Typography sx={{fontWeight: 900, color: colors.text, fontSize: '1.02rem', letterSpacing: '-0.01em', lineHeight: 1}}>
              {title}
            </Typography>
            <Typography sx={{fontSize: '0.62rem', color: colors.muted, fontWeight: 700, mt: 0.18, textTransform: 'uppercase', letterSpacing: '0.06em'}}>
              Live shift review
            </Typography>
          </Box>
        </Box>
        <Box sx={{px: 0.7, py: 0.26, borderRadius: 999, bgcolor: tone.soft, color: tone.accent, fontSize: '0.56rem', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', border: `1px solid ${tone.accent}22`}}>
          Focus
        </Box>
      </Box>
      <Box sx={{position: 'relative', p: 1}}>{children}</Box>
    </Paper>
  );
}

function SafetySerpentineGraph() {
  const points = [
    {day: 1, x: 30, y: 40, r: -28},
    {day: 2, x: 42, y: 33, r: -24},
    {day: 3, x: 56, y: 30, r: -20},
    {day: 4, x: 71, y: 29, r: -14},
    {day: 5, x: 86, y: 30, r: -8},
    {day: 6, x: 101, y: 32, r: -3},
    {day: 7, x: 114, y: 38, r: 6},
    {day: 8, x: 122, y: 49, r: 15},
    {day: 9, x: 120, y: 61, r: 21},
    {day: 10, x: 110, y: 70, r: 26},
    {day: 11, x: 96, y: 75, r: 30},
    {day: 12, x: 82, y: 79, r: 30},
    {day: 13, x: 68, y: 83, r: 28},
    {day: 14, x: 57, y: 89, r: 24},
    {day: 15, x: 51, y: 99, r: 18},
    {day: 16, x: 55, y: 110, r: 10},
    {day: 17, x: 65, y: 118, r: 0},
    {day: 18, x: 80, y: 122, r: -8},
    {day: 19, x: 95, y: 125, r: -12},
    {day: 20, x: 109, y: 130, r: -16},
    {day: 21, x: 118, y: 139, r: -22},
    {day: 22, x: 119, y: 151, r: -28},
    {day: 23, x: 111, y: 160, r: -24},
    {day: 24, x: 97, y: 165, r: -18},
    {day: 25, x: 82, y: 166, r: -12},
    {day: 26, x: 67, y: 165, r: -8},
    {day: 27, x: 53, y: 162, r: -5},
    {day: 28, x: 40, y: 158, r: -2},
    {day: 29, x: 27, y: 154, r: 0},
    {day: 30, x: 17, y: 150, r: 0},
    {day: 31, x: 9, y: 146, r: 0},
  ];
  const safeDays = new Set([1, 2, 4, 5, 7, 8, 9, 11, 12, 14, 16, 18, 19, 20, 21, 23, 24, 25]);
  const mutedDays = new Set([29, 30, 31]);

  return (
    <Box sx={{border: `1px solid ${colors.border}`, borderRadius: 1.35, p: 0.72, bgcolor: '#FCFDFE', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)'}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.35}}>
        <Typography sx={{fontSize: '0.5rem', color: '#667085', fontWeight: 700}}>S&amp;E</Typography>
        <Box sx={{textAlign: 'right'}}>
          <Typography sx={{fontSize: '0.48rem', color: '#667085', fontWeight: 700}}>Month</Typography>
          <Typography sx={{fontSize: '0.54rem', color: '#111827', fontWeight: 800}}>May 2025</Typography>
        </Box>
      </Box>
      <Box sx={{position: 'relative', height: 168}}>
        {points.map((point) => (
          <Box
            key={point.day}
            sx={{
              position: 'absolute',
              left: `${point.x}px`,
              top: `${point.y}px`,
              width: 17,
              height: 17,
              borderRadius: 0.55,
              display: 'grid',
              placeItems: 'center',
              fontSize: '0.4rem',
              fontWeight: 800,
              color: '#111827',
              bgcolor: mutedDays.has(point.day)
                ? '#D1D5DB'
                : (safeDays.has(point.day) ? '#31B44B' : '#EF4444'),
              border: '1px solid rgba(0,0,0,0.12)',
              transform: `translate(-50%, -50%) rotate(${point.r}deg)`,
            }}
          >
            {point.day}
          </Box>
        ))}
      </Box>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 0.45}}>
        <Typography sx={{fontSize: '0.46rem', color: '#667085', fontWeight: 700}}>DAYS WITHOUT INCIDENT</Typography>
        <Box sx={{textAlign: 'right'}}>
          <Typography sx={{fontSize: '1.1rem', lineHeight: 1, fontWeight: 800, color: '#16A34A'}}>4</Typography>
          <Typography sx={{fontSize: '0.45rem', color: '#667085', fontWeight: 700}}>Current Streak</Typography>
        </Box>
      </Box>
    </Box>
  );
}

function QualityRingGraph() {
  const safeDays = new Set([1, 2, 4, 6, 7, 8, 9, 10, 11, 12, 14, 17, 18, 19, 20, 23, 24, 25, 30, 31]);
  const days = Array.from({length: 31}, (_, i) => i + 1);
  const tail = [
    {x: 124, y: 122, day: 32},
    {x: 133, y: 132, day: 33},
    {x: 142, y: 142, day: 34},
  ];
  return (
    <Box sx={{border: `1px solid ${colors.border}`, borderRadius: 1.35, p: 0.72, bgcolor: '#FCFDFE', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)'}}>
      <Box sx={{display: 'flex', justifyContent: 'center', py: 0.25}}>
        <Box sx={{width: 176, height: 176, borderRadius: '50%', border: '1px solid #D1D5DB', display: 'grid', placeItems: 'center', position: 'relative'}}>
          <Box sx={{width: 108, height: 108, borderRadius: '50%', bgcolor: '#fff', border: '1px solid #E5E7EB'}} />
          {days.map((day, idx) => {
            const angle = ((idx / days.length) * 360) - 90;
            const radius = 74;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;
            return (
              <Box
                key={day}
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  width: 16,
                  height: 16,
                  borderRadius: 0.6,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '0.4rem',
                  fontWeight: 800,
                  color: '#111827',
                  bgcolor: safeDays.has(day) ? '#31B44B' : '#EF4444',
                  border: '1px solid rgba(0,0,0,0.12)',
                }}
              >
                {day}
              </Box>
            );
          })}
          {tail.map((item, idx) => (
            <Box
              key={item.day}
              sx={{
                position: 'absolute',
                left: item.x,
                top: item.y,
                width: 16,
                height: 16,
                borderRadius: 0.6,
                display: 'grid',
                placeItems: 'center',
                fontSize: '0.4rem',
                fontWeight: 800,
                color: '#111827',
                bgcolor: idx === 1 ? '#31B44B' : '#EF4444',
                border: '1px solid rgba(0,0,0,0.12)',
                transform: 'rotate(35deg)',
              }}
            >
              {item.day}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function MetricGrid({items}: {items: Array<{label: string; value: string; target: string; tone: string}>}) {
  const firstFour = items.slice(0, 4);
  const finalItem = items[4];
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.6}}>
      <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 0.6}}>
        {firstFour.map((item) => (
          <Paper key={item.label} elevation={0} sx={{p: 0.78, border: `1px solid ${colors.border}`, borderLeft: `3px solid ${item.tone}`, borderRadius: 1.15, bgcolor: '#FCFDFE', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.75)'}}>
            <Typography sx={{fontSize: '1.35rem', fontWeight: 800, color: item.tone, lineHeight: 1}}>{item.value}</Typography>
            <Typography sx={{fontSize: '0.63rem', color: colors.text, fontWeight: 700, mt: 0.28}}>{item.label}</Typography>
            <Typography sx={{fontSize: '0.56rem', color: colors.muted, fontWeight: 700}}>Target {item.target}</Typography>
          </Paper>
        ))}
      </Box>
      {finalItem ? (
        <Paper elevation={0} sx={{p: 0.78, border: `1px solid ${colors.border}`, borderLeft: `3px solid ${finalItem.tone}`, borderRadius: 1.15, bgcolor: '#FCFDFE', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.75)'}}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
            <Box>
              <Typography sx={{fontSize: '1.35rem', fontWeight: 800, color: finalItem.tone, lineHeight: 1}}>{finalItem.value}</Typography>
              <Typography sx={{fontSize: '0.63rem', color: colors.text, fontWeight: 700, mt: 0.28}}>{finalItem.label}</Typography>
            </Box>
            <Typography sx={{fontSize: '0.56rem', color: colors.muted, fontWeight: 700}}>{finalItem.target}</Typography>
          </Box>
        </Paper>
      ) : null}
    </Box>
  );
}

function MiniBars({values, threshold}: {values: number[]; threshold: number}) {
  return (
    <Box sx={{height: 78, border: `1px solid ${colors.border}`, borderRadius: 1.25, p: 0.55, display: 'flex', alignItems: 'flex-end', gap: 0.28, bgcolor: '#FCFDFE', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)'}}>
      {values.map((value, index) => (
        <Box key={`${value}-${index}`} sx={{flex: 1, minWidth: 0, height: `${Math.max(8, value)}%`, background: value >= threshold ? 'linear-gradient(180deg, #42C96A 0%, #16A34A 100%)' : 'linear-gradient(180deg, #F36A74 0%, #E43B46 100%)', borderRadius: '4px 4px 0 0', boxShadow: '0 4px 10px rgba(15,23,42,0.08)'}} />
      ))}
    </Box>
  );
}

function Sparkline({points, color}: {points: number[]; color: string}) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = Math.max(0.0001, max - min);
  const width = 86;
  const height = 26;
  const path = points
    .map((point, idx) => {
      const x = (idx / Math.max(1, points.length - 1)) * width;
      const y = height - (((point - min) / span) * (height - 2)) - 1;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={path} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function normalizeActionRows(rows: ActionTrackerRow[]) {
  return rows.slice(0, 6).map((row, index) => ({
    ...row,
    shift: index % 2 === 0 ? 'Day Shift' : 'Night Shift',
    supportNeeded:
      row.category === 'SAFETY' ? 'Maintenance to inspect chiller unit'
        : row.category === 'QUALITY' ? 'Quality to review inspection standards'
          : row.category === 'DELIVERY' ? 'Metrology to perform calibration'
            : row.category === 'COST' ? 'Maintenance parts & technician'
              : 'Procurement to confirm shipment',
  }));
}

export default function TierMeetingBoard({
  actionTrackerRows,
  onOpenActionCreateDrawer,
  onOpenActionDetails,
}: TierMeetingBoardProps) {
  const rows = useMemo(() => normalizeActionRows(actionTrackerRows), [actionTrackerRows]);
  const [isBoardImportOpen, setIsBoardImportOpen] = useState(false);

  return (
    <Box sx={{bgcolor: colors.bg, p: {xs: 1, md: 1.2}, height: '100%', overflowY: 'auto'}}>
      <Paper elevation={0} sx={{border: `1px solid ${colors.border}`, borderRadius: 2, p: 0.8, mb: 0.9}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1.1, flexWrap: 'wrap'}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.35}}>
            <Typography sx={{fontSize: '1.22rem', fontWeight: 800, color: '#111827'}}>Tier 1</Typography>
            <ArrowDownIcon sx={{color: colors.blue, fontSize: 18}} />
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.35}}>
            <Typography sx={{fontSize: '1.22rem', fontWeight: 800, color: '#111827'}}>BD Excellence</Typography>
            <ArrowDownIcon sx={{color: colors.blue, fontSize: 18}} />
          </Box>
          <Box sx={{ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap'}}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon sx={{fontSize: 16}} />}
              onClick={() => setIsBoardImportOpen(true)}
              sx={{height: 32, borderRadius: 1.4, fontWeight: 800, textTransform: 'none', color: colors.blue, borderColor: '#AFCBFF'}}
            >
              Import / Export Data
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon sx={{fontSize: 16}} />}
              onClick={onOpenActionCreateDrawer}
              sx={{height: 32, borderRadius: 1.4, fontWeight: 800, textTransform: 'none', bgcolor: colors.blue, boxShadow: 'none'}}
            >
              Create action
            </Button>
          </Box>
        </Box>
      </Paper>

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'repeat(6,minmax(0,1fr))'}, gap: 0.8}}>
        <SqdcpCard letter="S" title="Safety" letterColor="#FF4D3B">
          <SafetySerpentineGraph />
          <MetricGrid items={safetyMetrics} />
        </SqdcpCard>

        <SqdcpCard letter="Q" title="Quality" letterColor="#7AD36B">
          <QualityRingGraph />
          <MetricGrid items={qualityMetrics} />
        </SqdcpCard>

        <SqdcpCard letter="D" title="Delivery" letterColor="#FF4D3B">
          <Paper elevation={0} sx={{p: 0.75, border: `1px solid ${colors.border}`, borderRadius: 1, mb: 0.7}}>
            <Typography sx={{fontSize: '0.66rem', color: colors.muted, fontWeight: 700}}>WO110196321</Typography>
            <Typography sx={{fontSize: '0.84rem', color: colors.text, fontWeight: 800}}>Nexivia 18 GA x 1 1/4 IN</Typography>
            <Box sx={{height: 6, borderRadius: 99, bgcolor: '#EEF2FF', border: `1px solid ${colors.border}`, mt: 0.5, overflow: 'hidden'}}>
              <Box sx={{height: '100%', width: '61%', bgcolor: colors.blue}} />
            </Box>
            <Typography sx={{fontSize: '0.68rem', color: colors.text, fontWeight: 700, mt: 0.5}}>401k of 662k Delivered <Box component="span" sx={{color: colors.red}}>-44k</Box></Typography>
          </Paper>
          <Paper elevation={0} sx={{p: 0.75, border: `1px solid ${colors.border}`, borderLeft: `3px solid ${colors.green}`, borderRadius: 1, mb: 0.7}}>
            <Typography sx={{fontSize: '1.45rem', fontWeight: 800, color: colors.green, lineHeight: 1}}>85%</Typography>
            <Typography sx={{fontSize: '0.66rem', fontWeight: 700, color: colors.text}}>OEE <Box component="span" sx={{color: colors.muted}}>Target 95%</Box></Typography>
          </Paper>
          <Typography sx={{fontSize: '0.62rem', fontWeight: 800, color: colors.text, mb: 0.28}}>Hourly OEE</Typography>
          <MiniBars values={[34, 30, 28, 32, 40, 54, 68, 75, 82, 87, 91, 86, 84, 82, 79, 74, 68, 60, 52, 42, 36, 30, 25, 20]} threshold={60} />
        </SqdcpCard>

        <SqdcpCard letter="C" title="Cost" letterColor="#7AD36B">
          <Paper elevation={0} sx={{p: 0.75, border: `1px solid ${colors.border}`, borderLeft: `3px solid ${colors.red}`, borderRadius: 1, mb: 0.7}}>
            <Typography sx={{fontSize: '1.45rem', fontWeight: 800, color: colors.text, lineHeight: 1}}>9%</Typography>
            <Typography sx={{fontSize: '0.66rem', fontWeight: 700, color: colors.text}}>Total Scrap Produced <Box component="span" sx={{color: colors.red}}>Target 10%</Box></Typography>
          </Paper>
          <Typography sx={{fontSize: '0.62rem', fontWeight: 800, color: colors.text, mb: 0.28}}>Hourly Scrap Production</Typography>
          <MiniBars values={[20, 25, 22, 28, 31, 26, 19, 18, 17, 20, 14, 12, 10, 8, 9, 12, 15, 17, 19, 24, 26, 30, 33, 27]} threshold={20} />
          <Typography sx={{fontSize: '0.62rem', fontWeight: 800, color: colors.text, mt: 0.7, mb: 0.28}}>Hourly Downtime</Typography>
          <MiniBars values={[16, 14, 12, 10, 9, 8, 7, 8, 11, 13, 15, 18, 22, 24, 26, 29, 30, 28, 23, 19, 13, 9, 7, 6]} threshold={22} />
        </SqdcpCard>

        <SqdcpCard letter="P" title="People" letterColor="#FF4D3B">
          <Paper elevation={0} sx={{p: 0.7, borderRadius: 1, border: '1px solid #F3C7CC', bgcolor: '#FFF4F5', display: 'flex', alignItems: 'center', gap: 0.55, mb: 0.7}}>
            <WarningIcon sx={{color: colors.red, fontSize: 14}} />
            <Box>
              <Typography sx={{fontSize: '0.76rem', fontWeight: 800, color: '#D92D20', lineHeight: 1.1}}>Shift at Risk</Typography>
              <Typography sx={{fontSize: '0.66rem', fontWeight: 700, color: colors.red, lineHeight: 1.1}}>33% of the Team is absent</Typography>
            </Box>
          </Paper>
          <MetricGrid items={peopleMetrics} />
        </SqdcpCard>

        <SqdcpCard letter="L" title="Loss Focused KPIs" letterColor="#D1E3FF">
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.8}}>
            {[
              {title: '2. BREAKDOWN', subtitle: '% of time lost', value: '11.7%', target: '10%', points: [12.4, 12.1, 11.8, 11.9, 11.6, 11.7]},
              {title: '3. CHANGEOVER', subtitle: '% of time on setups', value: '6.2%', target: '5%', points: [6.8, 6.5, 6.3, 6.4, 6.1, 6.2]},
            ].map((section) => (
              <Box key={section.title}>
                <Typography sx={{fontWeight: 800, color: '#111827', fontSize: '0.8rem', lineHeight: 1.1}}>{section.title}</Typography>
                <Typography sx={{mt: 0.1, color: '#475467', fontSize: '0.66rem', fontWeight: 600}}>{section.subtitle}</Typography>
                <Box sx={{display: 'inline-flex', gap: 0.3, mt: 0.38, mb: 0.4}}>
                  {['DAY', 'SHIFT', 'WEEK'].map((tab, index) => (
                    <Box key={tab} sx={{border: '1px solid #D0D5DD', bgcolor: index === 0 ? '#F2F4F7' : '#F8FAFC', borderRadius: 1, px: 0.6, py: 0.08, fontSize: '0.52rem', fontWeight: 800}}>
                      {tab}
                    </Box>
                  ))}
                </Box>
                <Box sx={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 0.8}}>
                  <Box>
                    <Typography sx={{fontSize: '0.58rem', color: '#475467', fontWeight: 700, letterSpacing: '0.03em'}}>DAY AVERAGE</Typography>
                    <Typography sx={{fontSize: '1.6rem', color: colors.red, fontWeight: 800, lineHeight: 1}}>{section.value}</Typography>
                    <Typography sx={{fontSize: '0.66rem', color: '#475467', fontWeight: 700}}>TARGET: <Box component="span" sx={{color: '#175CD3'}}>{`<= ${section.target}`}</Box></Typography>
                  </Box>
                  <Sparkline points={section.points} color={colors.red} />
                </Box>
              </Box>
            ))}

            <Divider />

            <Typography sx={{fontWeight: 800, color: '#111827', fontSize: '0.82rem'}}>Recognition</Typography>
            {[
              {name: 'Carlos Mendez', text: 'Helped train 3 new operators'},
              {name: 'John Joshua', text: '30-day streak with zero defects'},
            ].map((item) => (
              <Paper key={item.name} elevation={0} sx={{p: 0.5, border: `1px solid ${colors.border}`, borderRadius: 1, display: 'flex', alignItems: 'center', gap: 0.5}}>
                <Avatar sx={{width: 20, height: 20, bgcolor: '#E5E7EB', color: '#111827', fontSize: '0.55rem'}}>{item.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</Avatar>
                <Box>
                  <Typography sx={{fontSize: '0.62rem', color: '#344054', fontWeight: 700}}>{item.name}</Typography>
                  <Typography sx={{fontSize: '0.6rem', color: colors.text, fontWeight: 600}}>{item.text}</Typography>
                </Box>
              </Paper>
            ))}
            <Typography sx={{textAlign: 'right', color: '#175CD3', fontSize: '0.62rem', fontWeight: 700}}>SEE MORE</Typography>

            <Typography sx={{fontWeight: 800, color: '#111827', fontSize: '0.82rem'}}>Communication</Typography>
            {[
              "Today's focus: reduce micro-stops on Line 3.",
              'Planned changeover at 11:00. Ensure tools are ready.',
            ].map((message) => (
              <Paper key={message} elevation={0} sx={{p: 0.5, border: `1px solid ${colors.border}`, borderRadius: 1}}>
                <Typography sx={{fontSize: '0.62rem', color: '#344054', fontWeight: 600}}>{message}</Typography>
              </Paper>
            ))}
            <Typography sx={{textAlign: 'right', color: '#175CD3', fontSize: '0.62rem', fontWeight: 700}}>SEE MORE</Typography>
          </Box>
        </SqdcpCard>
      </Box>

      <Paper elevation={0} sx={{mt: 0.9, border: `1px solid ${colors.border}`, borderRadius: 2, overflow: 'hidden'}}>
        <Box sx={{px: 1, py: 0.65, borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap'}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
            <Typography sx={{fontWeight: 800, fontSize: '1rem', color: colors.text}}>Action Tracker</Typography>
            <Chip label="Board" size="small" variant="outlined" sx={{fontWeight: 700, height: 22, fontSize: '0.67rem'}} />
            <Chip label="Table" size="small" sx={{fontWeight: 700, bgcolor: colors.blue, color: '#FFFFFF', height: 22, fontSize: '0.67rem'}} />
          </Box>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7}}>
            {['S', 'Q', 'D', 'C', 'P'].map((token, index) => (
              <Avatar key={token} sx={{width: 22, height: 22, fontSize: '0.62rem', bgcolor: '#E8EEF9', color: [colors.green, colors.red, colors.green, colors.red, colors.red][index], fontWeight: 800}}>{token}</Avatar>
            ))}
            <IconButton size="small"><FilterIcon sx={{fontSize: 16}} /></IconButton>
            <IconButton size="small"><SearchIcon sx={{fontSize: 16}} /></IconButton>
            <Button size="small" startIcon={<AddIcon />} variant="outlined" onClick={onOpenActionCreateDrawer} sx={{fontWeight: 700, fontSize: '0.72rem'}}>
              Add Action
            </Button>
          </Box>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{bgcolor: '#F8FAFC'}}>
                <TableCell sx={{fontWeight: 800, color: colors.text, width: 52, fontSize: '0.7rem', py: 0.7}}>#</TableCell>
                <TableCell sx={{fontWeight: 800, color: colors.text, fontSize: '0.7rem', py: 0.7}}>Date / Shift</TableCell>
                <TableCell sx={{fontWeight: 800, color: colors.text, fontSize: '0.7rem', py: 0.7}}>Problem</TableCell>
                <TableCell sx={{fontWeight: 800, color: colors.text, fontSize: '0.7rem', py: 0.7}}>Suggested Actions</TableCell>
                <TableCell sx={{fontWeight: 800, color: colors.text, fontSize: '0.7rem', py: 0.7}}>Due Date</TableCell>
                <TableCell sx={{fontWeight: 800, color: colors.text, fontSize: '0.7rem', py: 0.7}}>Owner</TableCell>
                <TableCell sx={{fontWeight: 800, color: colors.text, fontSize: '0.7rem', py: 0.7}}>Support Needed</TableCell>
                <TableCell sx={{fontWeight: 800, color: colors.text, fontSize: '0.7rem', py: 0.7}}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={row.id} hover onClick={() => onOpenActionDetails(row)} sx={{cursor: 'pointer'}}>
                  <TableCell sx={{fontWeight: 700, fontSize: '0.72rem', py: 0.65}}>{index + 1}</TableCell>
                  <TableCell>
                    <Typography sx={{fontSize: '0.72rem', fontWeight: 700, color: colors.text, lineHeight: 1.2}}>{row.creationDate}</Typography>
                    <Typography sx={{fontSize: '0.64rem', color: colors.muted, fontWeight: 600, lineHeight: 1.2}}>{row.shift}</Typography>
                  </TableCell>
                  <TableCell sx={{fontSize: '0.69rem', color: '#1f2937', fontWeight: 600, maxWidth: 240}}>
                    {row.title}
                  </TableCell>
                  <TableCell sx={{fontSize: '0.69rem', color: '#1f2937', fontWeight: 600, maxWidth: 310}}>
                    {row.type === 'Corrective'
                      ? 'Inspect tooling & lighting; validate criteria; retrain operators.'
                      : 'Check cooling system and sensors; monitor first-off parts.'}
                  </TableCell>
                  <TableCell sx={{fontSize: '0.7rem', color: '#1f2937', fontWeight: 600}}>{row.dueDate}</TableCell>
                  <TableCell sx={{fontSize: '0.7rem', color: '#1f2937', fontWeight: 600}}>{row.assignedTo}</TableCell>
                  <TableCell sx={{fontSize: '0.68rem', color: '#334155', fontWeight: 600, maxWidth: 220}}>
                    {(row as ActionTrackerRow & {supportNeeded: string}).supportNeeded}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.status}
                      sx={{
                        fontWeight: 700,
                        color: statusChipTone[row.status].fg,
                        bgcolor: statusChipTone[row.status].bg,
                        border: `1px solid ${statusChipTone[row.status].border}`,
                        height: 22,
                        fontSize: '0.66rem',
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{px: 1, py: 0.58, borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <Typography sx={{fontSize: '0.66rem', color: colors.muted, fontWeight: 600}}>
            Showing 1 - {rows.length} of {rows.length} entries
          </Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
            <Chip label="1" size="small" color="primary" sx={{height: 21, fontSize: '0.64rem'}} />
            <Chip label="10 / page" size="small" variant="outlined" sx={{height: 21, fontSize: '0.64rem'}} />
          </Box>
        </Box>
      </Paper>
      <TierBoardImportExportDialog
        open={isBoardImportOpen}
        tierLevel="Tier 1"
        onClose={() => setIsBoardImportOpen(false)}
      />
    </Box>
  );
}
