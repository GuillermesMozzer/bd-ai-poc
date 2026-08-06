import { workstationVisuals } from '../theme';
import {useState} from 'react';
import {Box, Button, Chip, Paper, Typography} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  BarChartOutlined as ChartIcon,
  CalendarTodayOutlined as CalendarIcon,
  Edit as EditIcon,
  OpenInFull as OpenInFullIcon,
  StarBorder as StarBorderIcon,
  TableChartOutlined as TableIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

const bars = [
  {label: '01AM', value: 2800, color: '#61BD6D'},
  {label: '02AM', value: 2700, color: '#61BD6D'},
  {label: '03AM', value: 1900, color: '#F04F4F'},
  {label: '04AM', value: 2150, color: '#F04F4F'},
  {label: '05AM', value: 1100, color: '#F04F4F'},
  {label: '06AM', value: 3200, color: '#61BD6D'},
  {label: '07AM', value: 3550, color: '#61BD6D'},
  {label: '08AM', value: 2750, color: '#61BD6D'},
];

const timelineRows = [
  ['01:00AM', '04%', 'In Spec', 'On Track', 'Safe', '24.3k / 22k Up', '83%', '-', ''],
  ['02:00AM', '04%', 'In Spec', 'On Track', 'Safe', '24.3k / 22k Up', '90%', 'Material staged late', ''],
  ['03:00AM', '04%', 'In Spec', 'On Track', 'Safe', 'Setup Mode', '-', 'Changeover in progress', ''],
  ['04:00AM', '01%', 'In Spec', 'At Risk', 'Safe', '24.3k / 22k Up', '83%', '-', ''],
  ['05:00AM', '02%', 'In Spec', 'On Track', 'Safe', '24.3k / 22k Up', '77%', '-', ''],
  ['06:00AM', '09%', 'Deviation', 'Delayed', 'Unsafe', '24.3k / 22k Up', '76%', 'Guarding check required', 'alert'],
  ['07:00AM', '00%', 'In Spec', 'On Track', 'Safe', '24.3k / 22k Up', '81%', 'Supervisor reviewed', ''],
  ['08:00AM', '04%', 'In Spec', 'Ahead', 'Safe', '24.3k / 22k Up', '82%', '-', ''],
  ['09:00AM', '01%', 'In Spec', 'Ahead', 'Safe', '24.3k / 22k Up', '86%', '-', ''],
  ['10:00AM', '02%', 'In Spec', 'At Risk', 'Safe', '24.3k / 22k Up', '95%', '-', ''],
  ['11:00AM', '00%', 'In Spec', 'Ahead', 'Safe', '24.3k / 22k Up', '86%', 'Preventive check complete', ''],
  ['12:00PM', '01%', 'In Spec', 'On Track', 'Safe', '24.3k / 22k Up', '77%', '-', ''],
];

import WidgetShell from './WidgetShell';

type MyShiftProductionWidgetProps = {
  onViewModeChange?: (viewMode: 'chart' | 'table') => void;
};

export default function MyShiftProductionWidget({onViewModeChange}: MyShiftProductionWidgetProps) {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const max = 4200;
  const toggleViewMode = () => {
    const nextMode = viewMode === 'chart' ? 'table' : 'chart';
    setViewMode(nextMode);
    onViewModeChange?.(nextMode);
  };

  return (
    <WidgetShell
      title="Shift Production"
      action={
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap'}}>
          <Box sx={{px: 1.25, py: 0.55, borderRadius: 4, bgcolor: '#0B63E5', color: '#FFFFFF', fontSize: 12, lineHeight: 1, fontWeight: 700}}>
            Hour
          </Box>
          <Box sx={{px: 1.25, py: 0.48, borderRadius: 4, border: '1px solid #0B63E5', color: '#0B63E5', fontSize: 12, lineHeight: 1, fontWeight: 700}}>
            Cumulative
          </Box>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45, px: 1, py: 0.45, borderRadius: 4, border: '1px solid #D7E1F0', color: '#4B5563', fontSize: 11, lineHeight: 1}}>
            <CalendarIcon sx={{fontSize: 13}} />
            Today
          </Box>
          <Button
            size="small"
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            startIcon={viewMode === 'table' ? <ChartIcon sx={{fontSize: 14}} /> : <TableIcon sx={{fontSize: 14}} />}
            onClick={toggleViewMode}
            sx={{height: 24, minHeight: 24, px: 1, borderRadius: 1.2, fontSize: 11, lineHeight: 1, textTransform: 'none', fontWeight: 700, boxShadow: 'none', '& .MuiButton-startIcon': {mr: 0.45}}}
          >
            {viewMode === 'table' ? 'Chart View' : 'Table View'}
          </Button>
          <AutoAwesomeIcon sx={{fontSize: 18, color: '#BBD4FF'}} />
          <StarBorderIcon sx={{fontSize: 19, color: '#0457FF'}} />
          <OpenInFullIcon sx={{fontSize: 18, color: '#0457FF'}} />
        </Box>
      }
    >
      <Box sx={{height: '100%', minHeight: viewMode === 'table' ? 280 : 0, containerType: 'inline-size', mt: 0.5}}>
        {viewMode === 'chart' ? <ShiftProductionChart max={max} /> : <ShiftProductionTable />}
      </Box>
    </WidgetShell>
  );
}

function ShiftProductionChart({max}: {max: number}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 'clamp(7px, 1.6cqw, 10px) clamp(8px, 2cqw, 12px)',
        height: 'calc(100% - clamp(31px, 8cqw, 42px))',
        minHeight: 0,
        borderRadius: 1.4,
        bgcolor: '#F6FAFD',
        border: '1px solid #E6EBF2',
        overflow: 'hidden',
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.1}}>
        <Typography sx={{fontSize: 11, color: '#202124'}}>Hourly Output</Typography>
        <Typography sx={{fontSize: 11, color: '#2F9E44'}}>Up +2% Above Target</Typography>
      </Box>
      <Box sx={{position: 'relative', height: 'clamp(76px, 22cqw, 124px)', pl: 3.2, pr: 0.3}}>
        {[4000, 2000, 0].map((tick) => (
          <Box
            key={tick}
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: `${(tick / max) * 104 + 16}px`,
              borderTop: tick === 0 ? 'none' : '1px dashed #D9DEE7',
            }}
          >
            <Typography sx={{position: 'absolute', left: -20, top: -7, fontSize: 10, color: '#9AA4B4'}}>
              {tick === 0 ? '0' : `${tick / 1000}k`}
            </Typography>
          </Box>
        ))}
        <Box sx={{position: 'absolute', left: 28, right: 0, bottom: 84, height: 2, bgcolor: '#FF850D'}} />
        <Box sx={{position: 'absolute', left: 28, right: 0, bottom: 16, display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', alignItems: 'end', gap: 1.2, height: 104}}>
          {bars.map((bar) => (
            <Box key={bar.label} sx={{height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 0.6}}>
              <Box sx={{width: '100%', maxWidth: 28, height: `${(bar.value / max) * 104}px`, bgcolor: bar.color, borderRadius: '4px 4px 0 0'}} />
              <Typography sx={{fontSize: 10, color: '#5F6673', lineHeight: 1}}>{bar.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
      <Box sx={{display: 'flex', justifyContent: 'center', gap: 1.7, mt: 0.4, flexWrap: 'wrap'}}>
        <Legend color="#FF850D" label="Target Prod." line />
        <Legend color="#61BD6D" label="Output Over Target" />
        <Legend color="#F04F4F" label="Output Under Target" />
      </Box>
    </Paper>
  );
}

function ShiftProductionTable() {
  return (
    <Paper elevation={0} sx={{height: 'calc(100% - clamp(31px, 8cqw, 42px))', minHeight: 0, p: 1, borderRadius: 1.4, border: '1px solid #E5EAF2', overflow: 'hidden'}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8, gap: 1}}>
        <Button variant="outlined" startIcon={<EditIcon />} sx={{fontWeight: 900, height: 28, fontSize: 11}}>
          EDIT COLUMN
        </Button>
        <Typography sx={{fontSize: 12, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
          Major Events/Problem <Chip label="" sx={{ml: 1, width: 28, height: 16, bgcolor: '#1D66F2'}} />
        </Typography>
      </Box>
      <Box sx={{height: 'calc(100% - 38px)', minHeight: 0, overflowX: 'auto', overflowY: 'auto'}}>
        <Box sx={{minWidth: 620}}>
          <Box sx={{display: 'grid', gridTemplateColumns: '0.95fr 0.65fr 0.9fr 0.9fr 0.9fr 1.15fr 0.65fr 1.2fr 0.7fr', px: 0.7, py: 0.6, color: '#667085', fontSize: 10.5}}>
            {['Hour', 'Scrap', 'Quality', 'Delivery', 'Safety', 'Produced', 'OEE', 'Problem', 'Action'].map((h) => <Box key={h}>{h}</Box>)}
          </Box>
          {timelineRows.map((row) => (
            <Box key={row[0]} sx={{display: 'grid', gridTemplateColumns: '0.95fr 0.65fr 0.9fr 0.9fr 0.9fr 1.15fr 0.65fr 1.2fr 0.7fr', alignItems: 'center', px: 0.7, py: 0.45, borderRadius: 1, bgcolor: '#F8FAFC', borderBottom: '1px solid #E6EBF2', fontSize: 10.5, color: row[8] ? '#F20B16' : '#667085'}}>
              {row.slice(0, 8).map((cell, index) => <Box key={`${row[0]}-${index}`} sx={{fontWeight: row[8] ? 800 : 500, color: index === 5 ? '#2E9F49' : undefined}}>{cell}</Box>)}
              <Box sx={{display: 'flex', gap: 0.6, color: '#0B63E5'}}>
                <VisibilityIcon sx={{fontSize: 14}} />
                <EditIcon sx={{fontSize: 14}} />
                +
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

function Legend({color, label, line = false}: {color: string; label: string; line?: boolean}) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45}}>
      <Box sx={{width: line ? 12 : 10, height: line ? 2 : 10, borderRadius: line ? 0 : '50%', bgcolor: color}} />
      <Typography sx={{fontSize: 10, color: '#4B5563'}}>{label}</Typography>
    </Box>
  );
}
