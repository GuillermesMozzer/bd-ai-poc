import {useState} from 'react';
import type {ReactNode} from 'react';
import {Box, Button, Checkbox, Menu, MenuItem, Typography} from '@mui/material';
import {
  Apps as AppsIcon,
  CalendarMonth as CalendarIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  Factory as FactoryIcon,
  FolderOutlined as FolderIcon,
  Search as SearchIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import {
  tokenBrand,
  tokenCommon,
  tokenError,
  tokenNeutral,
  tokenSuccess,
  tokenWarning,
  workstationPriorityTone,
  workstationSoftBadgeSx,
  workstationTableCellSx,
  workstationTableHeaderCellSx,
  workstationTableSx,
  workstationVisuals,
} from '../theme';
import type {WorkstationWidgetProps} from '../types';
import WidgetShell from './WidgetShell';
import {
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  tierManagementNotificationConfig,
  useWidgetNotifications,
} from './WidgetNotifications';

type TierManagementWidgetProps = WorkstationWidgetProps & {
  onOpenTierBoard?: (tierLevel: TierBoardLevel) => void;
};

type Severity = 'High' | 'Medium' | 'Low';
type Status = 'Good' | 'At Risk' | 'Attention';
type TierBoardLevel = 'Tier 1' | 'Tier 2' | 'Tier 3';

const filterButtonSx = {
  height: 26,
  borderRadius: '8px',
  px: 1.25,
  border: '1px solid rgba(15, 23, 42, 0.08)',
  color: 'rgba(15, 23, 42, 0.7)',
  bgcolor: tokenCommon.white,
  textTransform: 'none',
  fontSize: '0.72rem',
  fontWeight: 500,
  fontFamily: workstationVisuals.fontFamily,
  transition: 'all 0.15s ease',
  '&:hover': {
    bgcolor: tokenNeutral.lightest,
    borderColor: 'rgba(15, 23, 42, 0.16)',
  },
  '& .MuiButton-startIcon': {mr: 0.3, '& svg': {fontSize: 13}},
  '& .MuiButton-endIcon': {ml: 0.2, '& svg': {fontSize: 13}},
} as const;

const sectionTitleSx = {
  fontSize: '0.82rem',
  fontWeight: 600,
  color: workstationVisuals.textPrimary,
  fontFamily: workstationVisuals.fontFamily,
} as const;

const sqdcpCards: Array<{
  code: string;
  title: string;
  status: Status;
  color: string;
  rows: Array<{value: string; label: string; target?: string; color?: string}>;
}> = [
  {code: 'S', title: 'Safety', status: 'Good', color: tokenSuccess.main, rows: [{value: '0', label: 'Incidents', target: '0/0'}, {value: '0', label: 'Unsafe Conditions', target: '0/0'}, {value: '0', label: 'Unsafe Behavior', target: '0/0'}]},
  {code: 'Q', title: 'Quality', status: 'Good', color: tokenSuccess.main, rows: [{value: '1', label: 'NCs', target: '1/0', color: tokenError.main}, {value: '2', label: 'Field Actions', target: '2/0', color: tokenError.main}, {value: '1', label: 'Complaint', target: '1/0', color: tokenError.main}]},
  {code: 'D', title: 'Delivery', status: 'At Risk', color: tokenError.main, rows: [{value: '29,850', label: 'Output', target: '29,850/50,000'}, {value: 'Below Target', label: ''}]},
  {code: 'C', title: 'Cost / Downtime', status: 'Attention', color: tokenWarning.main, rows: [{value: '148', label: 'min Downtime', target: '148/120', color: tokenError.main}, {value: '3.2%', label: 'Scrap', target: '3.2/2.0%', color: tokenError.main}, {value: 'Over target', label: '', color: tokenError.main}]},
  {code: 'P', title: 'People', status: 'Attention', color: tokenWarning.main, rows: [{value: '1', label: 'Absentee', target: '1/0', color: tokenError.main}, {value: 'Coverage Risk', label: ''}]},
];

const tierTopics: Array<{
  code: string;
  topic: string;
  issue: string;
  line: string;
  metric: string;
  severity: Severity;
  color: string;
}> = [
  {code: 'D', topic: 'Delivery', issue: 'Output below target', line: 'Line 10', metric: '29,850 vs 50,000', severity: 'High', color: tokenError.main},
  {code: 'C', topic: 'Cost / Downtime', issue: 'Zone 5A downtime', line: 'Line 12', metric: '148 min vs 120 min target', severity: 'High', color: tokenError.main},
  {code: 'P', topic: 'People', issue: 'Shift coverage risk', line: 'Line 08', metric: '1 absentee impacting coverage', severity: 'Medium', color: tokenWarning.main},
];

const lineOptions = ['Line 10', 'Nexiva', 'Autoguard', 'Line 40', 'Line 50', 'Line 70'];
const shiftOptions = ['Shift A', 'Shift B', 'Shift C'];
const dateOptions = ['Today', 'Yesterday', 'Last 7 days'];
const tierBoardOptions: TierBoardLevel[] = ['Tier 1', 'Tier 2', 'Tier 3'];
const defaultExpandedLocationNodes = ['area-a', 'area-a-unit-a', 'area-a-unit-b', 'area-a-unit-c', 'area-b', 'area-b-unit-a', 'area-c', 'area-c-unit-a'];

export default function MyTierManagementWidget({
  className,
  onOpenTierBoard,
  shift = 'Shift B',
  style,
}: TierManagementWidgetProps) {
  const [selectedLines, setSelectedLines] = useState<string[]>(['Line 10']);
  const [shiftFilter, setShiftFilter] = useState(shift);
  const [dateFilter, setDateFilter] = useState(dateOptions[0]);
  const [lineAnchor, setLineAnchor] = useState<null | HTMLElement>(null);
  const [shiftAnchor, setShiftAnchor] = useState<null | HTMLElement>(null);
  const [dateAnchor, setDateAnchor] = useState<null | HTMLElement>(null);
  const [boardAnchor, setBoardAnchor] = useState<null | HTMLElement>(null);
  const [expandedLocationNodes, setExpandedLocationNodes] = useState<string[]>(defaultExpandedLocationNodes);
  const notifications = useWidgetNotifications(tierManagementNotificationConfig);

  const selectedLineLabel = selectedLines.length === 1
    ? selectedLines[0]
    : `${selectedLines.length} lines`;

  const handleLineToggle = (line: string) => {
    setSelectedLines((currentLines) => {
      if (currentLines.includes(line)) {
        return currentLines.length === 1 ? currentLines : currentLines.filter((currentLine) => currentLine !== line);
      }

      return [...currentLines, line];
    });
  };

  const handleOpenTierBoard = (tierLevel: TierBoardLevel) => {
    setBoardAnchor(null);
    onOpenTierBoard?.(tierLevel);
  };

  const isLocationNodeExpanded = (nodeId: string) => expandedLocationNodes.includes(nodeId);

  const toggleLocationNode = (nodeId: string) => {
    setExpandedLocationNodes((currentNodes) => currentNodes.includes(nodeId)
      ? currentNodes.filter((currentNode) => currentNode !== nodeId)
      : [...currentNodes, nodeId]);
  };

  const headerAction = (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
      <WidgetNotificationBell active={notifications.active} onClick={notifications.openDialog} size={30} />
      <Button
        variant="outlined"
        endIcon={<ExpandMoreIcon />}
        onClick={(event) => setLineAnchor(event.currentTarget)}
        sx={filterButtonSx}
      >
        {selectedLineLabel}
      </Button>
      <Button
        variant="outlined"
        endIcon={<ExpandMoreIcon />}
        onClick={(event) => setShiftAnchor(event.currentTarget)}
        sx={filterButtonSx}
      >
        {shiftFilter}
      </Button>
      <Button
        variant="outlined"
        startIcon={<CalendarIcon />}
        endIcon={<ExpandMoreIcon />}
        onClick={(event) => setDateAnchor(event.currentTarget)}
        sx={filterButtonSx}
      >
        {dateFilter}
      </Button>
      <Button
        size="small"
        startIcon={<AppsIcon />}
        endIcon={<ExpandMoreIcon />}
        onClick={(event) => setBoardAnchor(event.currentTarget)}
        sx={filterButtonSx}
      >
        Board
      </Button>
    </Box>
  );

  return (
    <>
      <WidgetShell title="Tier Management" action={headerAction} className={className} style={style}>
        <Box sx={{height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1.2, p: 0.5}}>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexShrink: 0}}>
          <Box sx={workstationSoftBadgeSx}>3 Attention</Box>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 0}}>
            <Box component="span" sx={{width: 7, height: 7, borderRadius: '50%', bgcolor: tokenBrand.main, flexShrink: 0}} />
            <Typography sx={{fontSize: '0.72rem', color: workstationVisuals.textSecondary, fontFamily: workstationVisuals.fontFamily, whiteSpace: 'nowrap'}}>
              {shiftFilter}
            </Typography>
            <Box component="span" sx={{width: 7, height: 7, borderRadius: '50%', bgcolor: tokenBrand.main, flexShrink: 0}} />
            <Typography sx={{fontSize: '0.72rem', color: workstationVisuals.textSecondary, fontFamily: workstationVisuals.fontFamily, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
              Auto-generated from current workstation KPIs
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            border: '1px solid rgba(15, 23, 42, 0.06)',
            borderRadius: '8px',
            p: 2,
            bgcolor: tokenCommon.white,
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
            gap: 1.2,
            minHeight: 170,
            flexShrink: 0,
            '@container (max-width: 720px)': {
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            },
          }}
        >
          {sqdcpCards.map((card, index) => (
            <Box
              key={card.code}
              sx={{
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 1.1,
                pl: 1.2,
                pr: 1.2,
                borderRight: index < sqdcpCards.length - 1 ? '1px solid rgba(15, 23, 42, 0.06)' : 'none',
                '@container (max-width: 720px)': {
                  borderRight: 'none',
                  borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
                  pb: 1,
                },
              }}
            >
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 0}}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '8px',
                    bgcolor: card.color,
                    color: tokenCommon.white,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    fontFamily: workstationVisuals.fontFamily,
                    flexShrink: 0,
                  }}
                >
                  {card.code}
                </Box>
                <Box sx={{minWidth: 0}}>
                  <Typography sx={{fontSize: '0.78rem', color: workstationVisuals.textPrimary, fontWeight: 600, fontFamily: workstationVisuals.fontFamily, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                    {card.title}
                  </Typography>
                  <StatusLabel status={card.status} color={card.color} />
                </Box>
              </Box>

              <Box sx={{display: 'grid', gap: 0.9}}>
                {card.rows.map((row) => (
                  <Box key={`${card.code}-${row.value}-${row.label}`} sx={{minWidth: 0}}>
                    <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: 0.8, minWidth: 0}}>
                      <Typography sx={{fontSize: row.label ? '1.18rem' : '0.78rem', color: row.color ?? card.color, fontWeight: 600, lineHeight: 1, fontFamily: workstationVisuals.fontFamily, whiteSpace: 'nowrap'}}>
                        {row.value}
                      </Typography>
                      {row.target ? (
                        <Typography sx={{fontSize: '0.78rem', color: workstationVisuals.textPrimary, fontWeight: 600, lineHeight: 1.2, fontFamily: workstationVisuals.fontFamily, whiteSpace: 'nowrap', ml: -0.55}}>
                          /{row.target.split('/')[1]}
                        </Typography>
                      ) : null}
                      {row.label ? (
                        <Typography sx={{fontSize: '0.72rem', color: workstationVisuals.textPrimary, fontWeight: 500, lineHeight: 1.2, fontFamily: workstationVisuals.fontFamily, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                          {row.label}
                        </Typography>
                      ) : null}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            border: '1px solid rgba(15, 23, 42, 0.06)',
            borderRadius: '8px',
            p: 1.5,
            bgcolor: tokenCommon.white,
            minHeight: 0,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexShrink: 0}}>
            <Typography sx={sectionTitleSx}>Top Tier Topics</Typography>
          </Box>

          <Box sx={{minHeight: 0, overflow: 'auto'}}>
            <Box component="table" sx={workstationTableSx}>
              <thead>
                <tr>
                  {['Topic', 'Issue / Description', 'Line', 'Metric / Comparison', 'Severity'].map((header) => (
                    <Box component="th" key={header} sx={workstationTableHeaderCellSx}>
                      {header}
                    </Box>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tierTopics.map((topic) => (
                  <tr key={topic.topic}>
                    <Box component="td" sx={workstationTableCellSx}>
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 0}}>
                        <Box sx={{width: 22, height: 22, borderRadius: '8px', bgcolor: topic.color, color: tokenCommon.white, display: 'grid', placeItems: 'center', fontSize: '0.72rem', fontWeight: 700, fontFamily: workstationVisuals.fontFamily, flexShrink: 0}}>
                          {topic.code}
                        </Box>
                        <Typography sx={{fontSize: '0.78rem', color: workstationVisuals.textPrimary, fontWeight: 600, fontFamily: workstationVisuals.fontFamily, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                          {topic.topic}
                        </Typography>
                      </Box>
                    </Box>
                    <Box component="td" sx={{...workstationTableCellSx, color: workstationVisuals.textSecondary, fontSize: '0.78rem'}}>
                      {topic.issue}
                    </Box>
                    <Box component="td" sx={workstationTableCellSx}>
                      <Box sx={{...workstationSoftBadgeSx, borderRadius: '8px', fontSize: '0.68rem'}}>
                        {topic.line}
                      </Box>
                    </Box>
                    <Box component="td" sx={{...workstationTableCellSx, color: workstationVisuals.textSecondary, fontSize: '0.78rem'}}>
                      {topic.metric}
                    </Box>
                    <Box component="td" sx={workstationTableCellSx}>
                      <SeverityBadge severity={topic.severity} />
                    </Box>
                  </tr>
                ))}
              </tbody>
            </Box>
          </Box>
        </Box>
      </Box>

      <Menu
        anchorEl={lineAnchor}
        open={Boolean(lineAnchor)}
        onClose={() => setLineAnchor(null)}
        PaperProps={{
          sx: {
            width: 360,
            maxWidth: 'calc(100vw - 32px)',
            borderRadius: '12px',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            boxShadow: '0 18px 40px rgba(15, 23, 42, 0.18)',
            mt: 0.8,
          },
        }}
      >
        <Box sx={{px: 1, pt: 1, pb: 0.8}}>
          <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid rgba(15, 23, 42, 0.08)', mb: 1}}>
            <Typography sx={{pb: 1, textAlign: 'center', color: tokenBrand.main, borderBottom: `2px solid ${tokenBrand.main}`, fontSize: '0.78rem', fontWeight: 700, fontFamily: workstationVisuals.fontFamily}}>
              Hierarchy
            </Typography>
            <Typography sx={{pb: 1, textAlign: 'center', color: workstationVisuals.textSecondary, fontSize: '0.78rem', fontWeight: 700, fontFamily: workstationVisuals.fontFamily}}>
              Favorites
            </Typography>
          </Box>
          <Box sx={{height: 36, border: '1px solid rgba(15, 23, 42, 0.12)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 1, px: 1.2, color: workstationVisuals.textMuted, mb: 1}}>
            <Typography sx={{fontSize: '0.76rem', flex: 1, fontFamily: workstationVisuals.fontFamily}}>Search hierarchy...</Typography>
            <SearchIcon sx={{fontSize: 18, color: workstationVisuals.textSecondary}} />
          </Box>
          <HierarchyRow depth={0} expanded={isLocationNodeExpanded('area-a')} icon={<FolderIcon sx={{fontSize: 15}} />} label="Area A" onToggle={() => toggleLocationNode('area-a')} />
          {isLocationNodeExpanded('area-a') ? (
            <>
              <HierarchyRow depth={1} expanded={isLocationNodeExpanded('area-a-unit-a')} icon={<FactoryIcon sx={{fontSize: 15}} />} label="Unit A" selected onToggle={() => toggleLocationNode('area-a-unit-a')} />
              {isLocationNodeExpanded('area-a-unit-a') ? (
                <>
                  <HierarchyLineRow checked={selectedLines.includes('Line 10')} label="Line 10" depth={2} onToggle={() => handleLineToggle('Line 10')} />
                  <HierarchyLineRow checked={selectedLines.includes('Nexiva')} label="Nexiva" depth={2} onToggle={() => handleLineToggle('Nexiva')} />
                </>
              ) : null}
              <HierarchyRow depth={1} expanded={isLocationNodeExpanded('area-a-unit-b')} icon={<FactoryIcon sx={{fontSize: 15}} />} label="Unit B" onToggle={() => toggleLocationNode('area-a-unit-b')} />
              {isLocationNodeExpanded('area-a-unit-b') ? (
                <HierarchyLineRow checked={selectedLines.includes('Autoguard')} label="Autoguard" depth={2} onToggle={() => handleLineToggle('Autoguard')} />
              ) : null}
              <HierarchyRow depth={1} expanded={isLocationNodeExpanded('area-a-unit-c')} icon={<FactoryIcon sx={{fontSize: 15}} />} label="Unit C" onToggle={() => toggleLocationNode('area-a-unit-c')} />
              {isLocationNodeExpanded('area-a-unit-c') ? (
                <HierarchyLineRow checked={selectedLines.includes('Line 40')} label="Line 40" depth={2} onToggle={() => handleLineToggle('Line 40')} />
              ) : null}
            </>
          ) : null}
          <HierarchyRow depth={0} expanded={isLocationNodeExpanded('area-b')} icon={<FolderIcon sx={{fontSize: 15}} />} label="Area B" onToggle={() => toggleLocationNode('area-b')} />
          {isLocationNodeExpanded('area-b') ? (
            <>
              <HierarchyRow depth={1} expanded={isLocationNodeExpanded('area-b-unit-a')} icon={<FactoryIcon sx={{fontSize: 15}} />} label="Unit A" onToggle={() => toggleLocationNode('area-b-unit-a')} />
              {isLocationNodeExpanded('area-b-unit-a') ? (
                <HierarchyLineRow checked={selectedLines.includes('Line 50')} label="Line 50" depth={2} onToggle={() => handleLineToggle('Line 50')} />
              ) : null}
            </>
          ) : null}
          <HierarchyRow depth={0} expanded={isLocationNodeExpanded('area-c')} icon={<FolderIcon sx={{fontSize: 15}} />} label="Area C" onToggle={() => toggleLocationNode('area-c')} />
          {isLocationNodeExpanded('area-c') ? (
            <>
              <HierarchyRow depth={1} expanded={isLocationNodeExpanded('area-c-unit-a')} icon={<FactoryIcon sx={{fontSize: 15}} />} label="Unit A" onToggle={() => toggleLocationNode('area-c-unit-a')} />
              {isLocationNodeExpanded('area-c-unit-a') ? (
                <HierarchyLineRow checked={selectedLines.includes('Line 70')} label="Line 70" depth={2} onToggle={() => handleLineToggle('Line 70')} />
              ) : null}
            </>
          ) : null}
        </Box>
      </Menu>
      <Menu anchorEl={shiftAnchor} open={Boolean(shiftAnchor)} onClose={() => setShiftAnchor(null)}>
        {shiftOptions.map((option) => (
          <MenuItem key={option} selected={option === shiftFilter} onClick={() => { setShiftFilter(option); setShiftAnchor(null); }}>
            {option}
          </MenuItem>
        ))}
      </Menu>
      <Menu anchorEl={dateAnchor} open={Boolean(dateAnchor)} onClose={() => setDateAnchor(null)}>
        {dateOptions.map((option) => (
          <MenuItem key={option} selected={option === dateFilter} onClick={() => { setDateFilter(option); setDateAnchor(null); }}>
            {option}
          </MenuItem>
        ))}
      </Menu>
      <Menu anchorEl={boardAnchor} open={Boolean(boardAnchor)} onClose={() => setBoardAnchor(null)}>
        {tierBoardOptions.map((option) => (
          <MenuItem key={option} onClick={() => handleOpenTierBoard(option)}>
            {option}
          </MenuItem>
        ))}
      </Menu>
      </WidgetShell>
      <WidgetNotificationsDialog
        active={notifications.active}
        config={tierManagementNotificationConfig}
        draftState={notifications.draftState}
        onApplySuggestion={notifications.applySuggestion}
        onClose={notifications.closeDialog}
        onSave={notifications.saveDialog}
        onStateChange={notifications.setDraftState}
        open={notifications.open}
      />
    </>
  );
}

function HierarchyRow({
  depth,
  expanded,
  icon,
  label,
  onToggle,
  selected = false,
}: {
  depth: number;
  expanded: boolean;
  icon: ReactNode;
  label: string;
  onToggle: () => void;
  selected?: boolean;
}) {
  return (
    <Box
      onClick={onToggle}
      sx={{
        height: 34,
        display: 'flex',
        alignItems: 'center',
        gap: 0.8,
        pl: 0.5 + depth * 1.6,
        pr: 0.5,
        color: selected ? tokenBrand.main : workstationVisuals.textSecondary,
        bgcolor: selected ? tokenBrand.softBg : 'transparent',
        borderRadius: selected ? '8px' : 0,
        cursor: 'pointer',
        '&:hover': {
          bgcolor: selected ? tokenBrand.selectedBg : tokenNeutral.lightest,
          borderRadius: '8px',
        },
      }}
    >
      <ChevronRightIcon
        sx={{
          fontSize: 16,
          color: workstationVisuals.textSecondary,
          transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 120ms ease',
        }}
      />
      {icon}
      <Typography sx={{flex: 1, color: selected ? tokenBrand.main : workstationVisuals.textPrimary, fontSize: '0.78rem', fontWeight: selected ? 700 : 600, fontFamily: workstationVisuals.fontFamily}}>
        {label}
      </Typography>
      <StarBorderIcon sx={{fontSize: 17, color: workstationVisuals.textMuted}} />
    </Box>
  );
}

function HierarchyLineRow({checked, depth, label, onToggle}: {checked: boolean; depth: number; label: string; onToggle: () => void}) {
  return (
    <MenuItem
      disableRipple
      onClick={onToggle}
      sx={{
        height: 34,
        borderRadius: '8px',
        pl: 0.5 + depth * 1.6,
        pr: 0.5,
        gap: 0.8,
        bgcolor: checked ? tokenBrand.softBg : 'transparent',
        '&:hover': {bgcolor: checked ? tokenBrand.selectedBg : tokenNeutral.lightest},
      }}
    >
      <ChevronRightIcon sx={{fontSize: 16, color: workstationVisuals.textSecondary}} />
      <FactoryIcon sx={{fontSize: 15, color: checked ? tokenBrand.main : workstationVisuals.textSecondary}} />
      <Typography sx={{flex: 1, color: checked ? tokenBrand.main : workstationVisuals.textPrimary, fontSize: '0.78rem', fontWeight: 700, fontFamily: workstationVisuals.fontFamily}}>
        {label}
      </Typography>
      <Checkbox
        checked={checked}
        size="small"
        sx={{p: 0.2, color: workstationVisuals.textMuted, '&.Mui-checked': {color: tokenBrand.main}}}
      />
    </MenuItem>
  );
}

function StatusLabel({color, status}: {color: string; status: Status}) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.35}}>
      <Box sx={{width: 6, height: 6, borderRadius: '50%', bgcolor: color, flexShrink: 0}} />
      <Typography sx={{fontSize: '0.68rem', color: workstationVisuals.textSecondary, fontWeight: 500, fontFamily: workstationVisuals.fontFamily}}>
        {status}
      </Typography>
    </Box>
  );
}

function SeverityBadge({severity}: {severity: Severity}) {
  const tone = workstationPriorityTone[severity];

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 58,
        px: 1,
        py: 0.25,
        borderRadius: '8px',
        bgcolor: tone.bg,
        color: tone.color,
        border: `1px solid ${tone.border}`,
        fontSize: '0.72rem',
        fontWeight: 600,
        fontFamily: workstationVisuals.fontFamily,
      }}
    >
      {severity}
    </Box>
  );
}
