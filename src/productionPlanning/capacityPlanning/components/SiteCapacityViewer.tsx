import {useState} from 'react';
import {
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  FormGroup,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Fullscreen as FullscreenIcon,
  GridOn as GridOnIcon,
  InfoOutlined as InfoOutlinedIcon,
} from '@mui/icons-material';
import {planningTokens} from '../../ui/planningTheme';
import type {CapacityLine, CapacityScenario, LayersState, UtilizationStatus, ViewByOption} from '../types';
import {getUtilizationColor} from '../utils';

const VIEW_BY_OPTIONS: ViewByOption[] = ['Utilization %', 'Available Hours', 'Required Hours', 'Gap Hours'];

const LEGEND_ITEMS: {label: string; color: string; range: string}[] = [
  {label: '> 120%', color: '#DC2626', range: 'overloaded'},
  {label: '105% – 120%', color: '#F97316', range: 'atRisk'},
  {label: '90% – 105%', color: '#EAB308', range: 'moderate'},
  {label: '70% – 90%', color: '#22C55E', range: 'ok'},
  {label: '< 70%', color: '#3B82F6', range: 'under'},
  {label: 'No Data', color: 'var(--planning-text-muted)', range: 'none'},
];

const LAYER_LABELS: Record<keyof LayersState, string> = {
  productionLines: 'Production Lines',
  warehouses: 'Warehouses',
  utilities: 'Utilities',
  buildings: 'Buildings',
  logistics: 'Logistics',
};

type LineBadgeProps = {
  line: CapacityLine;
  viewBy: ViewByOption;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

function getDisplayValue(line: CapacityLine, viewBy: ViewByOption): string {
  switch (viewBy) {
    case 'Utilization %': return `${line.utilizationPct}%`;
    case 'Available Hours': return `${(line.availableHrs / 1000).toFixed(0)}K`;
    case 'Required Hours': return `${(line.requiredHrs / 1000).toFixed(0)}K`;
    case 'Gap Hours': {
      const gap = line.availableHrs - line.requiredHrs;
      return `${gap < 0 ? '-' : '+'}${(Math.abs(gap) / 1000).toFixed(0)}K`;
    }
  }
}

function LineBadge({line, viewBy, isSelected, onSelect}: LineBadgeProps) {
  const color = getUtilizationColor(line.status);
  const displayValue = getDisplayValue(line, viewBy);

  return (
    <Box
      onClick={() => onSelect(line.id)}
      sx={{
        position: 'absolute',
        left: line.position.x,
        top: line.position.y,
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
        zIndex: 2,
        transition: 'transform 0.15s',
        '&:hover': {transform: 'translate(-50%, -50%) scale(1.08)'},
      }}
    >
      <Box
        sx={{
          bgcolor: 'rgba(255,255,255,0.92)',
          border: `2px solid ${color}`,
          borderRadius: 1.5,
          px: 1,
          py: 0.5,
          minWidth: 72,
          textAlign: 'center',
          boxShadow: isSelected
            ? `0 0 0 3px color-mix(in srgb, ${color} 33%, transparent), 0 4px 12px rgba(0,0,0,0.2)`
            : '0 2px 8px rgba(0,0,0,0.18)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <Typography sx={{fontSize: 10, fontWeight: 700, color: planningTokens.textPrimary, lineHeight: 1.1}}>
          {line.name}
        </Typography>
        <Typography sx={{fontSize: 13, fontWeight: 900, color, lineHeight: 1.2}}>
          {displayValue}
        </Typography>
      </Box>
    </Box>
  );
}

function UtilizationLegend() {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 3,
        bgcolor: 'rgba(255,255,255,0.88)',
        borderRadius: 2,
        p: 1.2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(6px)',
        border: `1px solid ${planningTokens.border}`,
      }}
    >
      <Typography sx={{fontSize: 10, fontWeight: 700, color: planningTokens.textSecondary, mb: 0.6}}>Utilization %</Typography>
      {LEGEND_ITEMS.map((item) => (
        <Stack key={item.range} direction="row" alignItems="center" spacing={0.7} sx={{mb: 0.3}}>
          <Box sx={{width: 10, height: 10, borderRadius: '50%', bgcolor: item.color, flexShrink: 0}} />
          <Typography sx={{fontSize: 10, color: planningTokens.textPrimary}}>{item.label}</Typography>
        </Stack>
      ))}
    </Box>
  );
}

type LayersControlProps = {layers: LayersState; onChange: (key: keyof LayersState) => void};

function LayersControl({layers, onChange}: LayersControlProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 180,
        left: 12,
        zIndex: 3,
        bgcolor: 'rgba(255,255,255,0.88)',
        borderRadius: 2,
        p: 1.2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(6px)',
        border: `1px solid ${planningTokens.border}`,
      }}
    >
      <Typography sx={{fontSize: 10, fontWeight: 700, color: planningTokens.textSecondary, mb: 0.4}}>Layers</Typography>
      <FormGroup>
        {(Object.keys(LAYER_LABELS) as Array<keyof LayersState>).map((key) => (
          <FormControlLabel
            key={key}
            control={
              <Checkbox
                checked={layers[key]}
                onChange={() => onChange(key)}
                size="small"
                sx={{py: 0.2, '& .MuiSvgIcon-root': {fontSize: 14}}}
              />
            }
            label={<Typography sx={{fontSize: 10}}>{LAYER_LABELS[key]}</Typography>}
            sx={{m: 0}}
          />
        ))}
      </FormGroup>
    </Box>
  );
}

type Props = {
  lines: CapacityLine[];
  scenarios: CapacityScenario[];
  months: string[];
  selectedLineId: string | null;
  onSelectLine: (id: string | null) => void;
  selectedMonth: string;
  onChangeMonth: (month: string) => void;
  selectedScenario: string;
  onChangeScenario: (id: string) => void;
  factoryImage: string;
};

export default function SiteCapacityViewer({
  lines,
  scenarios,
  months,
  selectedLineId,
  onSelectLine,
  selectedMonth,
  onChangeMonth,
  selectedScenario,
  onChangeScenario,
  factoryImage,
}: Props) {
  const [viewBy, setViewBy] = useState<ViewByOption>('Utilization %');
  const [layers, setLayers] = useState<LayersState>({
    productionLines: true,
    warehouses: true,
    utilities: true,
    buildings: true,
    logistics: false,
  });

  function toggleLayer(key: keyof LayersState) {
    setLayers((prev) => ({...prev, [key]: !prev[key]}));
  }

  function handleLineClick(id: string) {
    onSelectLine(selectedLineId === id ? null : id);
  }

  return (
    <Paper elevation={0} sx={{borderRadius: 3, border: `1px solid ${planningTokens.border}`, overflow: 'hidden'}}>
      {/* Controls bar */}
      <Box sx={{px: 2, py: 1.2, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: `1px solid ${planningTokens.border}`, flexWrap: 'wrap'}}>
        <Typography sx={{fontSize: 13, fontWeight: 700, color: planningTokens.textPrimary, mr: 'auto'}}>
          Site Capacity Viewer
          <Tooltip title="Hover over a line to see details. Click to pin selection.">
            <InfoOutlinedIcon sx={{fontSize: 14, ml: 0.5, color: planningTokens.textMuted, verticalAlign: 'middle'}} />
          </Tooltip>
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography sx={{fontSize: 11, color: planningTokens.textSecondary}}>View by</Typography>
          <Select
            value={viewBy}
            onChange={(e) => setViewBy(e.target.value as ViewByOption)}
            size="small"
            sx={{fontSize: 11, height: 28, '.MuiSelect-select': {py: '4px', pr: '28px !important'}}}
          >
            {VIEW_BY_OPTIONS.map((o) => <MenuItem key={o} value={o} sx={{fontSize: 11}}>{o}</MenuItem>)}
          </Select>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography sx={{fontSize: 11, color: planningTokens.textSecondary}}>Scenario</Typography>
          <Select
            value={selectedScenario}
            onChange={(e) => onChangeScenario(e.target.value)}
            size="small"
            sx={{fontSize: 11, height: 28, '.MuiSelect-select': {py: '4px', pr: '28px !important'}}}
          >
            {scenarios.map((s) => <MenuItem key={s.id} value={s.id} sx={{fontSize: 11}}>{s.label}</MenuItem>)}
          </Select>
        </Stack>
        <Select
          value={selectedMonth}
          onChange={(e) => onChangeMonth(e.target.value)}
          size="small"
          sx={{fontSize: 11, height: 28, '.MuiSelect-select': {py: '4px', pr: '28px !important'}}}
        >
          {months.map((m) => <MenuItem key={m} value={m} sx={{fontSize: 11}}>{m}</MenuItem>)}
        </Select>
        <IconButton size="small" sx={{p: 0.5}}>
          <GridOnIcon sx={{fontSize: 16}} />
        </IconButton>
        <IconButton size="small" sx={{p: 0.5}}>
          <FullscreenIcon sx={{fontSize: 16}} />
        </IconButton>
      </Box>

      {/* Image + overlays */}
      <Box sx={{position: 'relative', width: '100%', bgcolor: '#E8EDF5', overflow: 'hidden'}}>
        <Box
          component="img"
          src={factoryImage}
          alt="Factory floor"
          sx={{width: '100%', height: 'auto', display: 'block'}}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.style.opacity = '0';
            (e.currentTarget.parentElement as HTMLElement).style.minHeight = '220px';
          }}
        />

        {/* Fallback label — always rendered behind image */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography sx={{fontSize: 13, color: planningTokens.textMuted, textAlign: 'center', px: 2}}>
            Adicione a imagem em <code>public/factory-floor.jpg</code>
          </Typography>
        </Box>

        <UtilizationLegend />
        <LayersControl layers={layers} onChange={toggleLayer} />

        {layers.productionLines && lines.map((line) => (
          <LineBadge
            key={line.id}
            line={line}
            viewBy={viewBy}
            isSelected={selectedLineId === line.id}
            onSelect={handleLineClick}
          />
        ))}
      </Box>
    </Paper>
  );
}
