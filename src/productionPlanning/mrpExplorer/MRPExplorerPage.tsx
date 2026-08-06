import {useMemo, useState, type ReactElement, type ReactNode} from 'react';
import {
  AccountTreeOutlined as TreeIcon,
  AccessTimeOutlined as ClockIcon,
  CalendarMonthOutlined as CalendarIcon,
  Close as CloseIcon,
  DownloadOutlined as DownloadIcon,
  ExpandLess as CollapseIcon,
  ExpandMore as ExpandIcon,
  FilterAltOutlined as FilterIcon,
  HelpOutline as HelpIcon,
  HomeRepairServiceOutlined as MakeIcon,
  InboxOutlined as InventoryIcon,
  Inventory2Outlined as BoxIcon,
  KeyboardArrowDown as ChevronDownIcon,
  KeyboardArrowLeft as ArrowLeftIcon,
  KeyboardArrowRight as ArrowRightIcon,
  KeyboardArrowUp as ChevronUpIcon,
  LocalShippingOutlined as BuyIcon,
  PrecisionManufacturingOutlined as AssemblyIcon,
  SettingsOutlined as SettingsIcon,
  ShoppingCartOutlined as CartIcon,
  WarningAmberOutlined as WarningIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import type {MrpVersion} from '../mrp/types';
import {defaultSelectedDemand, mrpKpis, mrpPeriods, mrpRows} from './mock';
import type {MrpCellValue, MrpPeriodKey, MrpSelectedDemand, MrpStructureRow} from './types';

type Props = {
  version: MrpVersion;
};

const navy = '#071B5F';
const blue = '#0B5CFF';
const border = '#D7E2F0';
const softBorder = '#E8EEF7';
const panelShadow = '0 10px 26px rgba(15, 35, 86, 0.06)';
const selectedPeriod: MrpPeriodKey = 'w2';

const cardSx = {
  bgcolor: 'var(--planning-surface)',
  border: `1px solid ${border}`,
  borderRadius: 2,
  boxShadow: panelShadow,
} as const;

function sxInput(width: number) {
  return {
    width,
    '& .MuiInputBase-root': {
      height: 38,
      borderRadius: 1.4,
      bgcolor: 'var(--planning-surface)',
      fontSize: 12,
      fontWeight: 800,
      color: navy,
    },
    '& .MuiInputLabel-root': {
      fontSize: 11,
      fontWeight: 900,
      color: navy,
      transform: 'translate(0, -18px) scale(1)',
    },
    '& fieldset': {borderColor: '#BFD0EA'},
  } as const;
}

export default function MRPExplorerPage({version}: Props) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(true);
  const [selectedDemand, setSelectedDemand] = useState<MrpSelectedDemand>(defaultSelectedDemand);

  function handleSelect(row: MrpStructureRow, cell?: MrpCellValue) {
    if (!cell?.selectable) return;
    setDetailsVisible(true);
    setSelectedDemand({
      item: row.label.includes('MAT-100') ? 'MAT-100 - Surgical Kit Alpha' : row.label,
      period: 'W2 - 15/Aug/2026',
      plannedNet: row.id.includes('rm') ? '9,948 EA' : '4,500 un',
      adjustedGross: row.id.includes('rm') ? '9,948 EA' : '4,974 un (+10.53%)',
      projectedInventory: row.id.includes('rm') ? '900 EA (W2)' : '4,500 un (W2)',
    });
  }

  return (
    <Box sx={{bgcolor: '#F5F8FC', minHeight: '100%', p: {xs: 1.5, md: 2}, display: 'grid', gap: 1.6}}>
      <MRPTopFilters
        version={version}
        onOpenFilters={() => setFilterOpen(true)}
        onOpenConfigurations={() => setConfigOpen(true)}
        onExport={() => setToastOpen(true)}
        onHelp={() => setHelpOpen(true)}
      />
      <MRPConfigurationBar />
      <MRPKpiCards />

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'minmax(0, 1fr) 372px'}, gap: 1.6, alignItems: 'start'}}>
        <MRPStructureTable onSelectCell={handleSelect} />
        <Stack spacing={1.4} sx={{minWidth: 0}}>
          <ConfigurationPanel />
          {detailsVisible ? (
            <MRPSelectedDemandPanel selected={selectedDemand} onClose={() => setDetailsVisible(false)} />
          ) : null}
          <MRPRequirementPathPanel />
          <MRPComparisonPanel />
        </Stack>
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', lg: '1fr 1.05fr 0.95fr'}, gap: 1.6}}>
        <MRPLegend />
        <MRPUrgencyStatus />
        <MRPTips />
      </Box>

      <FiltersDrawer open={filterOpen} onClose={() => setFilterOpen(false)} />
      <ConfigurationsDialog open={configOpen} onClose={() => setConfigOpen(false)} />
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
      <Snackbar
        open={toastOpen}
        autoHideDuration={2600}
        onClose={() => setToastOpen(false)}
        message="Export prepared for current MRP view."
      />
    </Box>
  );
}

function MRPTopFilters({
  version,
  onOpenFilters,
  onOpenConfigurations,
  onExport,
  onHelp,
}: {
  version: MrpVersion;
  onOpenFilters: () => void;
  onOpenConfigurations: () => void;
  onExport: () => void;
  onHelp: () => void;
}) {
  return (
    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'auto 1fr auto'}, gap: 1.5, alignItems: 'end'}}>
      <Box sx={{minWidth: 280}}>
        <Typography sx={{fontSize: 24, fontWeight: 950, color: navy, lineHeight: 1.1}}>
          MRP Explorer
        </Typography>
        <Typography sx={{fontSize: 13, color: '#24406F', fontWeight: 650, mt: 0.45}}>
          From MPS to Shop Floor & Purchases
        </Typography>
        <Typography sx={{fontSize: 11, color: '#6B7A99', mt: 0.55}}>
          {version.id} - {version.planningCycle}
        </Typography>
      </Box>

      <Stack direction="row" flexWrap="wrap" gap={1.2} alignItems="flex-end">
        <Box>
          <Typography sx={fieldLabelSx}>Planning Start Date</Typography>
          <TextField
            size="small"
            value="01/Aug/2026"
            sx={sxInput(156)}
            InputProps={{endAdornment: <CalendarIcon sx={{fontSize: 17, color: navy}} />}}
          />
        </Box>
        <Box>
          <Typography sx={fieldLabelSx}>Horizon</Typography>
          <Select size="small" value="12 Weeks" sx={sxInput(138) as object}>
            <MenuItem value="12 Weeks">12 Weeks</MenuItem>
          </Select>
        </Box>
        <Box>
          <Typography sx={fieldLabelSx}>Level</Typography>
          <Select size="small" value="All Levels" sx={sxInput(142) as object}>
            <MenuItem value="All Levels">All Levels</MenuItem>
          </Select>
        </Box>
        <Button
          variant="outlined"
          startIcon={<FilterIcon sx={{fontSize: 17}} />}
          onClick={onOpenFilters}
          sx={outlineBlueButtonSx}
        >
          Filters (2)
        </Button>
      </Stack>

      <Stack direction="row" gap={1} justifyContent={{xs: 'flex-start', xl: 'flex-end'}} alignItems="center">
        <Button startIcon={<SettingsIcon sx={{fontSize: 17}} />} onClick={onOpenConfigurations} sx={headerButtonSx}>
          Configurations
        </Button>
        <Button startIcon={<DownloadIcon sx={{fontSize: 17}} />} onClick={onExport} sx={headerButtonSx}>
          Export
        </Button>
        <Button startIcon={<HelpIcon sx={{fontSize: 17}} />} onClick={onHelp} sx={headerButtonSx}>
          Help
        </Button>
      </Stack>
    </Box>
  );
}

function MRPConfigurationBar() {
  const blocks = [
    {label: 'Scrap Adjustment', value: 'ON', toggle: true},
    {label: 'OEE Correction', value: 'ON', toggle: true},
    {label: 'Capacity Constraints', value: 'ON', toggle: true},
    {label: 'Hours/Calendar Day', value: '24 h/day'},
    {label: 'Purchase Lead Time', value: '60 days'},
    {label: 'Plan Start Date', value: '01/Aug/2026'},
  ];

  return (
    <Paper elevation={0} sx={{...cardSx, px: 1.8, py: 1.2}}>
      <Box sx={{display: 'grid', gridTemplateColumns: {xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(6, minmax(120px, 1fr)) auto'}, gap: 1.2, alignItems: 'center'}}>
        {blocks.map((block, index) => (
          <Box key={block.label} sx={{borderRight: {lg: index < blocks.length - 1 ? `1px solid ${border}` : 'none'}, pr: 1}}>
            <Typography sx={{fontSize: 11, color: navy, fontWeight: 850}}>
              {block.label}
            </Typography>
            <Stack direction="row" spacing={0.7} alignItems="center" sx={{mt: 0.7}}>
              {block.toggle ? <MiniToggle /> : null}
              <Typography sx={{fontSize: 16, fontWeight: 950, color: '#061446'}}>
                {block.value}
              </Typography>
            </Stack>
          </Box>
        ))}
        <Button endIcon={<ArrowRightIcon sx={{fontSize: 16}} />} sx={{justifySelf: {lg: 'end'}, textTransform: 'none', fontSize: 12, fontWeight: 900, color: blue}}>
          View All Configurations
        </Button>
      </Box>
    </Paper>
  );
}

function MRPKpiCards() {
  return (
    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(6, minmax(0, 1fr))'}, gap: 1.1}}>
      {mrpKpis.map((kpi) => (
        <Paper key={kpi.label} elevation={0} sx={{...cardSx, minHeight: 104, p: 1.6, display: 'flex', justifyContent: 'space-between', gap: 1}}>
          <Box>
            <Typography sx={{fontSize: 11, fontWeight: 900, color: navy}}>
              {kpi.label}
            </Typography>
            <Typography sx={{fontSize: 22, fontWeight: 950, color: navy, mt: 2, lineHeight: 1}}>
              {kpi.value}
            </Typography>
            <Typography sx={{fontSize: 11, color: navy, mt: 0.7, fontWeight: 750}}>
              {kpi.helper}
            </Typography>
          </Box>
          {kpi.tone === 'warning' ? <WarningIcon sx={{fontSize: 26, color: '#FF2A2A', alignSelf: 'center'}} /> : null}
          {kpi.tone === 'info' ? <ClockIcon sx={{fontSize: 26, color: blue, alignSelf: 'center'}} /> : null}
        </Paper>
      ))}
    </Box>
  );
}

function MRPStructureTable({onSelectCell}: {onSelectCell: (row: MrpStructureRow, cell?: MrpCellValue) => void}) {
  const expandableIds = useMemo(() => new Set(mrpRows.filter((row) => mrpRows.some((child) => child.parentId === row.id)).map((row) => row.id)), []);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['mat-100', 'sf-100', 'asm-100-a', 'rm-100-a']));
  const visibleRows = mrpRows.filter((row) => !row.parentId || expanded.has(row.parentId));
  const gridTemplate = `320px 58px ${mrpPeriods.map(() => '82px').join(' ')} 106px`;

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <Paper elevation={0} sx={{...cardSx, overflow: 'hidden', minWidth: 0}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'center', px: 1.6, py: 1.25}}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="baseline">
            <Typography sx={{fontSize: 16, fontWeight: 950, color: navy}}>MRP Structure</Typography>
            <Typography sx={{fontSize: 11, color: '#24406F', fontWeight: 700}}>(Click on an MPS demand to explore)</Typography>
          </Stack>
        </Box>
        <Stack direction="row" spacing={0.9} alignItems="center">
          <Button size="small" startIcon={<ExpandIcon sx={{fontSize: 16}} />} onClick={() => setExpanded(new Set(expandableIds))} sx={miniButtonSx}>
            Expand All
          </Button>
          <Button size="small" startIcon={<CollapseIcon sx={{fontSize: 16}} />} onClick={() => setExpanded(new Set())} sx={miniButtonSx}>
            Collapse All
          </Button>
        </Stack>
      </Box>
      <Box sx={{display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 1.4, px: 1.6, pb: 1.1}}>
        <IconButton size="small" sx={navIconButtonSx}><ArrowLeftIcon sx={{fontSize: 18}} /></IconButton>
        <Box sx={{position: 'relative', height: 20}}>
          <Typography sx={{position: 'absolute', left: 0, top: -2, fontSize: 10.5, color: '#4D6088', fontWeight: 700}}>
            Scroll horizontally to view earlier periods
          </Typography>
          <Box sx={{position: 'absolute', left: 0, right: 0, bottom: 3, height: 7, borderRadius: 999, bgcolor: '#DDE5F0'}}>
            <Box sx={{position: 'absolute', left: '56%', width: '14%', height: '100%', borderRadius: 999, bgcolor: '#AEBBD0'}} />
            <Box sx={{position: 'absolute', left: '62.5%', top: -5, width: 16, height: 16, borderRadius: '50%', bgcolor: blue}} />
          </Box>
          <Typography sx={{position: 'absolute', left: '61%', top: -18, fontSize: 11, color: blue, fontWeight: 900}}>
            Need Period (W2)
          </Typography>
        </Box>
        <IconButton size="small" sx={navIconButtonSx}><ArrowRightIcon sx={{fontSize: 18}} /></IconButton>
      </Box>
      <Box sx={{overflowX: 'auto', borderTop: `1px solid ${softBorder}`}}>
        <Box sx={{display: 'grid', gridTemplateColumns: gridTemplate, minWidth: 1470}}>
          <HeaderCell sticky left={0} label="Item / Description" />
          <HeaderCell sticky left={320} label="UoM" center />
          {mrpPeriods.map((period) => (
            <HeaderCell key={period.key} label={period.label} helper={period.date} center selected={period.selected} />
          ))}
          <HeaderCell label="Total Horizon" center />

          {visibleRows.map((row) => (
            <StructureRow
              key={row.id}
              row={row}
              expanded={expanded.has(row.id)}
              expandable={expandableIds.has(row.id)}
              onToggle={() => toggle(row.id)}
              onSelectCell={onSelectCell}
            />
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

function StructureRow({
  row,
  expanded,
  expandable,
  onToggle,
  onSelectCell,
}: {
  row: MrpStructureRow;
  expanded: boolean;
  expandable: boolean;
  onToggle: () => void;
  onSelectCell: (row: MrpStructureRow, cell?: MrpCellValue) => void;
}) {
  const isItem = row.rowType === 'item';
  const bg = isItem ? '#FBFDFF' : '#FFFFFF';
  const labelColor = isItem ? navy : '#1D315E';
  const icon = row.itemType === 'fg'
    ? <BoxIcon sx={{fontSize: 16}} />
    : row.itemType === 'sf'
      ? <TreeIcon sx={{fontSize: 16}} />
      : row.itemType === 'asm'
        ? <AssemblyIcon sx={{fontSize: 16}} />
        : row.itemType === 'raw'
          ? <InventoryIcon sx={{fontSize: 16}} />
          : null;

  return (
    <>
      <Box sx={{...tableCellSx(bg), position: 'sticky', left: 0, zIndex: 3, borderLeft: isItem ? `3px solid ${blue}` : '3px solid transparent'}}>
        <Stack direction="row" spacing={0.7} alignItems="center" sx={{pl: `${row.level * 18}px`, minWidth: 0}}>
          {expandable ? (
            <IconButton size="small" onClick={onToggle} aria-label={expanded ? `Collapse ${row.label}` : `Expand ${row.label}`} sx={{width: 20, height: 20, color: navy}}>
              {expanded ? <ChevronDownIcon sx={{fontSize: 18}} /> : <ChevronUpIcon sx={{fontSize: 18, transform: 'rotate(90deg)'}} />}
            </IconButton>
          ) : (
            <Box sx={{width: 20}} />
          )}
          {icon ? <Box sx={{color: blue, display: 'flex'}}>{icon}</Box> : null}
          <Typography sx={{fontSize: isItem ? 12.5 : 12, fontWeight: isItem ? 950 : 750, color: labelColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
            {row.label}
          </Typography>
        </Stack>
      </Box>
      <Box sx={{...tableCellSx(bg), position: 'sticky', left: 320, zIndex: 3, textAlign: 'center'}}>
        <Typography sx={{fontSize: 11.5, fontWeight: 800, color: '#334B7F'}}>{row.uom}</Typography>
      </Box>
      {mrpPeriods.map((period) => {
        const cell = row.cells[period.key];
        return (
          <Box
            key={`${row.id}-${period.key}`}
            onClick={() => onSelectCell(row, cell)}
            role={cell?.selectable ? 'button' : undefined}
            sx={{
              ...tableCellSx(bg),
              justifyContent: 'center',
              cursor: cell?.selectable ? 'pointer' : 'default',
              bgcolor: period.key === selectedPeriod ? '#EFF6FF' : bg,
              borderLeft: period.key === selectedPeriod ? '1px solid #BFD5FF' : `1px solid ${softBorder}`,
              borderRight: period.key === selectedPeriod ? '1px solid #BFD5FF' : `1px solid ${softBorder}`,
              '&:hover': cell?.selectable ? {bgcolor: '#E4EFFF'} : undefined,
            }}
          >
            <CellText cell={cell} itemRow={isItem} />
          </Box>
        );
      })}
      <Box sx={{...tableCellSx(bg), justifyContent: 'center'}}>
        <Typography sx={{fontSize: 12, color: navy, fontWeight: 950}}>{row.total || ''}</Typography>
      </Box>
    </>
  );
}

function CellText({cell, itemRow}: {cell?: MrpCellValue; itemRow: boolean}) {
  if (!cell) return <Typography sx={{fontSize: 12, color: 'var(--planning-text-muted)'}} />;
  const color = cell.tone === 'inventory'
    ? '#008A3D'
    : cell.tone === 'purchase'
      ? '#E52525'
      : cell.tone === 'muted'
        ? '#6F7E9A'
        : navy;

  return (
    <Stack direction="row" spacing={0.35} alignItems="center" justifyContent="center">
      {cell.tone === 'purchase' ? <CalendarIcon sx={{fontSize: 13, color}} /> : null}
      <Typography sx={{fontSize: itemRow ? 12.5 : 12, color, fontWeight: cell.tone === 'muted' ? 700 : 850}}>
        {cell.display}
      </Typography>
    </Stack>
  );
}

function ConfigurationPanel() {
  const fields = [
    ['Production hours / calendar day', '24 h/day'],
    ['Apply scrap adjustment', 'TRUE'],
    ['Apply OEE correction', 'TRUE'],
    ['Purchase lead time', '60 days'],
    ['Plan start date', '01/Aug/2026'],
  ];
  return (
    <Panel title="Configuration" suffix="(Active)">
      <Stack spacing={0.65}>
        {fields.map(([label, value]) => (
          <Stack key={label} direction="row" justifyContent="space-between" spacing={1}>
            <Typography sx={sideLabelSx}>{label}</Typography>
            <Typography sx={sideValueSx}>{value}</Typography>
          </Stack>
        ))}
      </Stack>
      <Button fullWidth sx={{mt: 1.2, height: 32, border: `1px solid ${border}`, borderRadius: 1.5, textTransform: 'none', fontSize: 12, fontWeight: 900, color: blue}}>
        View All Configurations
      </Button>
    </Panel>
  );
}

function MRPSelectedDemandPanel({selected, onClose}: {selected: MrpSelectedDemand; onClose: () => void}) {
  return (
    <Panel title="Selected Demand Details" action={<IconButton size="small" onClick={onClose}><CloseIcon sx={{fontSize: 18, color: navy}} /></IconButton>}>
      <Stack spacing={1}>
        <DetailLine label="Item" value={selected.item} />
        <DetailLine label="Period (Need Period)" value={selected.period} />
        <DetailLine label="MPS Planned (Net)" value={selected.plannedNet} />
        <DetailLine label="MPS After Adjustments (Gross)" value={selected.adjustedGross} positive />
        <DetailLine label="Projected FG Inventory After" value={selected.projectedInventory} />
      </Stack>
      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1.4}}>
        <Button variant="contained" sx={{...primaryButtonSx, bgcolor: blue}}>View Production Start</Button>
        <Button variant="contained" sx={{...primaryButtonSx, bgcolor: '#008A53'}}>View Purchase Orders</Button>
      </Box>
    </Panel>
  );
}

function MRPRequirementPathPanel() {
  const path = [
    {name: 'MAT-100 - Surgical Kit Alpha (FG)', need: '15/Aug/2026', qty: '4,974 un'},
    {name: 'SF-100 - Subassembly Frame (SF)', need: '08/Aug/2026', qty: '4,974 un'},
    {name: 'ASM-100-A - Assembly A (ASM)', need: '03/Aug/2026', qty: '4,974 un'},
    {name: 'RM-100-A - Raw Material EA (EA)', need: '03/Aug/2026', qty: '9,948 EA', po: '04/Jun/2026'},
    {name: 'ASM-100-B - Assembly B (ASM)', need: '03/Aug/2026', qty: '4,974 un'},
    {name: 'RM-100-B - Raw Material B (KG)', need: '03/Aug/2026', qty: '7,461 KG', po: '04/Jun/2026'},
  ];
  return (
    <Panel title="Requirement Path (Exploded)">
      <Stack spacing={0.9}>
        {path.map((item, index) => (
          <Box key={item.name} sx={{display: 'grid', gridTemplateColumns: '22px 1fr', gap: 1}}>
            <Box sx={{position: 'relative', display: 'flex', justifyContent: 'center'}}>
              <Box sx={{width: 20, height: 20, borderRadius: 1, border: '1px solid #9FD9BA', bgcolor: '#F0FDF4', color: '#057A43', display: 'grid', placeItems: 'center', zIndex: 1}}>
                {index === 0 ? <BoxIcon sx={{fontSize: 14}} /> : item.name.includes('Raw') ? <BuyIcon sx={{fontSize: 14}} /> : <MakeIcon sx={{fontSize: 14}} />}
              </Box>
              {index < path.length - 1 ? <Box sx={{position: 'absolute', top: 20, bottom: -12, width: 1, bgcolor: '#A9BCE0'}} /> : null}
            </Box>
            <Box>
              <Typography sx={{fontSize: 11.5, fontWeight: 950, color: blue}}>{item.name}</Typography>
              <Typography sx={{fontSize: 10.8, color: '#405783', mt: 0.3}}>
                Need Date: {item.need} &nbsp;&nbsp; Qty: {item.qty}
              </Typography>
              {item.po ? (
                <Typography sx={{fontSize: 10.8, color: '#E52525', fontWeight: 900, mt: 0.25}}>
                  Purchase Order Suggested: {item.po}
                </Typography>
              ) : null}
            </Box>
          </Box>
        ))}
      </Stack>
    </Panel>
  );
}

function MRPComparisonPanel() {
  const rows = [
    ['Planned Qty', '4,500 un', '4,974 un', '+10.53%', 'good'],
    ['Adjusted Qty (Scrap)', '-', '5,526 un', '+22.79%', 'good'],
    ['Effective Rate (OEE)', '1,000 un/h', '850 un/h', '-15.00%', 'bad'],
    ['Production Lead Time', '12 days', '14 days', '+2 days', 'bad'],
  ];
  return (
    <Panel title="Comparison Before / After Adjustments">
      <Box sx={{display: 'grid', gridTemplateColumns: '1.2fr 0.85fr 0.85fr 0.75fr', gap: 0.8, pb: 0.7, borderBottom: `1px solid ${softBorder}`}}>
        {['Metric', 'Before (Net)', 'After (Gross)', 'Variation'].map((head) => (
          <Typography key={head} sx={{fontSize: 10, color: navy, fontWeight: 950}}>{head}</Typography>
        ))}
      </Box>
      {rows.map((row) => (
        <Box key={row[0]} sx={{display: 'grid', gridTemplateColumns: '1.2fr 0.85fr 0.85fr 0.75fr', gap: 0.8, py: 0.75, borderBottom: `1px solid ${softBorder}`}}>
          <Typography sx={comparisonTextSx}>{row[0]}</Typography>
          <Typography sx={comparisonTextSx}>{row[1]}</Typography>
          <Typography sx={comparisonTextSx}>{row[2]}</Typography>
          <Typography sx={{...comparisonTextSx, color: row[4] === 'good' ? '#008A3D' : '#E52525', fontWeight: 950}}>{row[3]}</Typography>
        </Box>
      ))}
    </Panel>
  );
}

function MRPLegend() {
  return (
    <BottomCard title="Legend">
      <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.2}}>
        <LegendItem icon={<CalendarIcon />} color="#16A34A" label="In Production (after plan start)" />
        <LegendItem icon={<CalendarIcon />} color={blue} label="Available / On Hand" />
        <LegendItem icon={<CalendarIcon />} color="#8B2BE2" label="Required / Due Date" />
        <LegendItem icon={<CartIcon />} color="#475467" label="Buy (Purchase)" />
        <LegendItem icon={<CalendarIcon />} color="#E52525" label="Purchase Order Suggested" />
        <LegendItem icon={<MakeIcon />} color="#475467" label="Make (Production)" />
      </Box>
    </BottomCard>
  );
}

function MRPUrgencyStatus() {
  return (
    <BottomCard title="Urgency Status (based on plan start date: 01/Aug/2026)">
      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(3, 1fr)'}, gap: 2}}>
        <StatusDot color="#E52525" label="Past Due" detail="Date < 01/Aug/2026" />
        <StatusDot color="#F4AA00" label="At Risk" detail="01/Aug/2026 <= Date <= 07/Aug/2026" />
        <StatusDot color="#008A18" label="On Track" detail="Date > 07/Aug/2026" />
      </Box>
    </BottomCard>
  );
}

function MRPTips() {
  return (
    <BottomCard title="Tips">
      <Stack spacing={1.1}>
        <Typography sx={tipTextSx}>1. Click on any MPS demand row (MPS Demand) to see the full requirement path and timing details.</Typography>
        <Typography sx={tipTextSx}>2. Use filters to focus on a specific product, family or planning level.</Typography>
      </Stack>
    </BottomCard>
  );
}

function FiltersDrawer({open, onClose}: {open: boolean; onClose: () => void}) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{width: 360, p: 2.2}}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{fontSize: 18, fontWeight: 950, color: navy}}>MRP Filters</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Stack>
        <Stack spacing={1.7} sx={{mt: 2}}>
          {['Product family', 'Item', 'Risk status', 'Planner', 'Make/Buy'].map((label) => (
            <TextField key={label} select label={label} size="small" defaultValue="">
              <MenuItem value="">All</MenuItem>
              <MenuItem value="demo">Demo option</MenuItem>
            </TextField>
          ))}
        </Stack>
        <Button variant="contained" onClick={onClose} sx={{...primaryButtonSx, width: '100%', mt: 2.5, bgcolor: blue}}>Apply Filters</Button>
      </Box>
    </Drawer>
  );
}

function ConfigurationsDialog({open, onClose}: {open: boolean; onClose: () => void}) {
  const rows = [
    ['Scrap adjustment', 'Enabled'],
    ['OEE correction', 'Enabled'],
    ['Capacity constraints', 'Enabled'],
    ['Calendar hours', '24 h/day'],
    ['Purchase lead time', '60 days'],
    ['Plan start date', '01/Aug/2026'],
  ];
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{fontWeight: 950, color: navy}}>Active MRP Assumptions</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.2}>
          {rows.map(([label, value]) => (
            <Stack key={label} direction="row" justifyContent="space-between">
              <Typography sx={{fontSize: 13, color: '#405783', fontWeight: 750}}>{label}</Typography>
              <Typography sx={{fontSize: 13, color: navy, fontWeight: 950}}>{value}</Typography>
            </Stack>
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function HelpDialog({open, onClose}: {open: boolean; onClose: () => void}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{fontWeight: 950, color: navy}}>MRP Explorer Help</DialogTitle>
      <DialogContent dividers>
        <Typography sx={{fontSize: 14, color: '#405783', lineHeight: 1.65}}>
          This screen traces MPS demand through the exploded BOM, showing make and buy requirements, lead-time offsets,
          inventory coverage, purchase order suggestions, and the selected demand requirement path.
        </Typography>
      </DialogContent>
    </Dialog>
  );
}

function Panel({title, suffix, action, children}: {title: string; suffix?: string; action?: ReactNode; children: ReactNode}) {
  return (
    <Paper elevation={0} sx={{...cardSx, p: 1.4}}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb: 1.1}}>
        <Typography sx={{fontSize: 14, fontWeight: 950, color: navy}}>
          {title} {suffix ? <Box component="span" sx={{fontSize: 11, color: 'var(--planning-text-secondary)'}}>{suffix}</Box> : null}
        </Typography>
        {action}
      </Stack>
      {children}
    </Paper>
  );
}

function BottomCard({title, children}: {title: string; children: ReactNode}) {
  return (
    <Paper elevation={0} sx={{...cardSx, p: 1.9, minHeight: 128}}>
      <Typography sx={{fontSize: 14, fontWeight: 950, color: navy, mb: 1.6}}>{title}</Typography>
      {children}
    </Paper>
  );
}

function DetailLine({label, value, positive}: {label: string; value: string; positive?: boolean}) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={1.2}>
      <Typography sx={sideLabelSx}>{label}</Typography>
      <Typography sx={{...sideValueSx, color: positive ? '#008A3D' : navy, textAlign: 'right'}}>{value}</Typography>
    </Stack>
  );
}

function LegendItem({icon, color, label}: {icon: ReactElement; color: string; label: string}) {
  return (
    <Stack direction="row" spacing={0.9} alignItems="center">
      <Box sx={{color, display: 'grid', placeItems: 'center'}}>{icon}</Box>
      <Typography sx={{fontSize: 12, color: '#24406F', fontWeight: 700}}>{label}</Typography>
    </Stack>
  );
}

function StatusDot({color, label, detail}: {color: string; label: string; detail: string}) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{width: 14, height: 14, borderRadius: '50%', bgcolor: color}} />
      <Box>
        <Typography sx={{fontSize: 12, color: navy, fontWeight: 950}}>{label}</Typography>
        <Typography sx={{fontSize: 11, color: '#405783'}}>{detail}</Typography>
      </Box>
    </Stack>
  );
}

function HeaderCell({label, helper, center, selected, sticky, left}: {label: string; helper?: string; center?: boolean; selected?: boolean; sticky?: boolean; left?: number}) {
  return (
    <Box sx={{
      px: 0.8,
      py: 0.85,
      minHeight: 49,
      borderRight: `1px solid ${softBorder}`,
      borderBottom: `1px solid ${border}`,
      bgcolor: selected ? '#EAF2FF' : '#F8FBFF',
      textAlign: center ? 'center' : 'left',
      position: sticky ? 'sticky' : 'relative',
      left,
      zIndex: sticky ? 5 : 1,
    }}>
      <Typography sx={{fontSize: 11, color: navy, fontWeight: 950}}>{label}</Typography>
      {helper ? <Typography sx={{fontSize: 10, color: selected ? blue : '#64748B', fontWeight: 800, mt: 0.2}}>{helper}</Typography> : null}
    </Box>
  );
}

function MiniToggle() {
  return (
    <Box sx={{width: 28, height: 14, borderRadius: 999, bgcolor: '#089451', position: 'relative'}}>
      <Box sx={{width: 10, height: 10, borderRadius: '50%', bgcolor: 'var(--planning-surface)', position: 'absolute', right: 2, top: 2}} />
    </Box>
  );
}

function tableCellSx(bg: string) {
  return {
    minHeight: 27,
    px: 0.8,
    py: 0.35,
    display: 'flex',
    alignItems: 'center',
    borderRight: `1px solid ${softBorder}`,
    borderBottom: `1px solid ${softBorder}`,
    bgcolor: bg,
  } as const;
}

const fieldLabelSx = {
  fontSize: 11,
  color: navy,
  fontWeight: 900,
  mb: 0.35,
} as const;

const headerButtonSx = {
  height: 38,
  px: 1.35,
  borderRadius: 1.4,
  border: `1px solid #BFD0EA`,
  bgcolor: 'var(--planning-surface)',
  color: navy,
  textTransform: 'none',
  fontSize: 12,
  fontWeight: 850,
  '&:hover': {bgcolor: '#F7FAFF', borderColor: '#96B6EC'},
} as const;

const outlineBlueButtonSx = {
  height: 38,
  px: 1.6,
  borderRadius: 1.4,
  borderColor: blue,
  color: blue,
  bgcolor: 'var(--planning-surface)',
  textTransform: 'none',
  fontSize: 12,
  fontWeight: 950,
  '&:hover': {borderColor: blue, bgcolor: '#EEF5FF'},
} as const;

const miniButtonSx = {
  height: 32,
  borderRadius: 1.4,
  border: `1px solid ${border}`,
  color: navy,
  bgcolor: 'var(--planning-surface)',
  textTransform: 'none',
  fontSize: 11.5,
  fontWeight: 850,
} as const;

const navIconButtonSx = {
  width: 34,
  height: 34,
  borderRadius: 1.4,
  border: `1px solid ${border}`,
  color: navy,
  bgcolor: 'var(--planning-surface)',
} as const;

const primaryButtonSx = {
  minHeight: 34,
  borderRadius: 1.3,
  textTransform: 'none',
  fontSize: 12,
  fontWeight: 950,
  boxShadow: 'none',
  '&:hover': {boxShadow: 'none', filter: 'brightness(0.95)'},
} as const;

const sideLabelSx = {
  fontSize: 11,
  color: '#24406F',
  fontWeight: 750,
} as const;

const sideValueSx = {
  fontSize: 11,
  color: navy,
  fontWeight: 950,
} as const;

const comparisonTextSx = {
  fontSize: 10.7,
  color: '#24406F',
  fontWeight: 750,
} as const;

const tipTextSx = {
  fontSize: 12,
  color: '#24406F',
  lineHeight: 1.55,
  fontWeight: 650,
} as const;
