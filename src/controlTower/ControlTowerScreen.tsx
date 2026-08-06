import {useMemo, useState} from 'react';
import {ControlTowerMaintenancePlannerWidget} from './ControlTowerMaintenancePlannerWidget';
import {
  Avatar,
  Box,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import {
  Apps as AppsIcon,
  ArrowDropDown as ArrowDropDownIcon,
  AutoAwesome as SparkleIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon,
  ModeCommentOutlined as ModeCommentOutlinedIcon,
  HelpOutline as HelpOutlineIcon,
  Home as HomeIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  LocationOn as LocationOnIcon,
  NotificationsNone as NotificationsIcon,
  OpenInFull as OpenInFullIcon,
  ReportProblem as ReportProblemIcon,
  Search as SearchIcon,
  Send as SendIcon,
  Settings as SettingsIcon,
  Tune as TuneIcon,
  WbSunny as SunnyIcon,
} from '@mui/icons-material';

type ControlTowerScreenProps = {
  onOpenAiAssistant?: () => void;
  onOpenAppLibrary?: () => void;
  onOpenSmartSearch?: () => void;
};

type GenericDrilldownKind = 'Safety' | 'Quality' | 'Blu.AI' | 'Sustainability';
type DrilldownKind = GenericDrilldownKind | 'Delivery' | 'Cost' | 'People' | 'Plant Overview';
type DrilldownCopyKind = Exclude<DrilldownKind, 'Plant Overview'>;

const monthLabels = ['Oct 24', 'Nov 24', 'Dec 24', 'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25'];

const pageShellSx = {
  bgcolor: '#0C1220',
  border: '1px solid rgba(103, 118, 146, 0.16)',
  borderRadius: '18px',
  boxShadow: 'none',
} as const;

const sectionHeaderActionSx = {
  color: '#7D899C',
  p: 0.25,
  '&:hover': {bgcolor: 'rgba(255,255,255,0.04)', color: '#C7D2E5'},
} as const;

const emptyAction = () => {};

function LegacyTowerHeader({
  onOpenAiAssistant = emptyAction,
  onOpenAppLibrary = emptyAction,
  onOpenSmartSearch = emptyAction,
}: ControlTowerScreenProps) {
  return (
    <Box
      sx={{
        minHeight: 40,
        px: 0,
        display: 'flex',
        alignItems: 'stretch',
        bgcolor: '#1731B4',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <IconButton
        onClick={onOpenAppLibrary}
        sx={{
          width: 38,
          minWidth: 38,
          borderRadius: 0,
          color: '#FFFFFF',
          bgcolor: '#FF7548',
          '&:hover': {bgcolor: '#FF835B'},
        }}
      >
        <AppsIcon sx={{fontSize: 18}} />
      </IconButton>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 1.6,
          gap: 0.9,
          bgcolor: '#0B0D62',
          borderTopRightRadius: 22,
          borderBottomRightRadius: 22,
          minWidth: 84,
          flexShrink: 0,
        }}
      >
        <Box
          component="img"
          src="/images/bd-symbol-rgb.png"
          alt="BD"
          sx={{height: 22, width: 'auto', display: 'block'}}
        />
      </Box>

      <Box
        sx={{
          display: {xs: 'none', md: 'flex'},
          alignItems: 'center',
          px: 3.4,
          ml: 0.6,
          bgcolor: '#1A1686',
          borderTopRightRadius: 28,
          borderBottomRightRadius: 28,
          color: '#FFFFFF',
          fontSize: 14,
          fontWeight: 800,
          letterSpacing: '-0.01em',
          flexShrink: 0,
        }}
      >
        Smart Factory My Workstation
      </Box>

      <Box sx={{flexGrow: 1, display: 'flex', justifyContent: 'center', px: 1.6, minWidth: 0}}>
        <Box
          onClick={onOpenSmartSearch}
          sx={{
            height: 30,
            width: '100%',
            maxWidth: 250,
            mt: '5px',
            px: 0.7,
            display: 'flex',
            alignItems: 'center',
            gap: 0.65,
            borderRadius: 999,
            bgcolor: '#0E2045',
            border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
          }}
        >
          <Box
            sx={{
              px: 0.8,
              py: 0.15,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.35,
              borderRadius: 999,
              bgcolor: 'rgba(255,255,255,0.08)',
              color: '#E6EEFF',
              fontSize: 11,
              lineHeight: 1,
            }}
          >
            <SparkleIcon sx={{fontSize: 10, color: '#FF7B54'}} />
            Smart
          </Box>
          <SearchIcon sx={{fontSize: 14, color: 'rgba(226,232,240,0.65)'}} />
          <Typography sx={{fontSize: 11.8, color: 'rgba(226,232,240,0.74)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
            Search for assets, orders, problems...
          </Typography>
        </Box>
      </Box>

      <Box sx={{display: 'flex', alignItems: 'center', gap: 1.1, pr: 1.2, flexShrink: 0}}>
        <Box sx={{display: {xs: 'none', lg: 'flex'}, alignItems: 'center', gap: 0.65, color: '#FFFFFF'}}>
          <SunnyIcon sx={{fontSize: 17, color: '#FFFFFF'}} />
          <Box sx={{lineHeight: 1}}>
            <Typography sx={{fontSize: 11.5, fontWeight: 700}}>73°F</Typography>
            <Typography sx={{fontSize: 9.5, color: 'rgba(255,255,255,0.78)'}}>Sunny</Typography>
          </Box>
        </Box>
        <Box sx={{display: {xs: 'none', lg: 'flex'}, alignItems: 'center', gap: 0.45, color: '#EAF0FF'}}>
          <SparkleIcon sx={{fontSize: 12}} />
          <Typography sx={{fontSize: 11.5, fontWeight: 700}}>BLU.AI</Typography>
        </Box>
        {[SparkleIcon, HelpOutlineIcon, SettingsIcon, NotificationsIcon].map((Icon, index) => (
          <IconButton
            key={index}
            onClick={Icon === SparkleIcon ? onOpenAiAssistant : emptyAction}
            sx={{
              width: 26,
              height: 26,
              color: '#1731B4',
              bgcolor: '#FFFFFF',
              '&:hover': {bgcolor: '#F2F5FF'},
            }}
          >
            <Icon sx={{fontSize: 15}} />
          </IconButton>
        ))}
        <Avatar
          src="/images/Ibrahim.png"
          alt="Ibrahim"
          sx={{width: 28, height: 28, border: '1px solid rgba(255,255,255,0.32)'}}
        />
      </Box>
    </Box>
  );
}

function TowerHeader({
  onOpenAiAssistant = emptyAction,
  onOpenAppLibrary = emptyAction,
  onOpenSmartSearch = emptyAction,
}: ControlTowerScreenProps) {
  return (
    <Box
      sx={{
        height: 64,
        px: 0,
        display: 'flex',
        alignItems: 'stretch',
        bgcolor: '#07005B',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <IconButton
        onClick={onOpenAppLibrary}
        sx={{
          width: 64,
          minWidth: 64,
          borderRadius: 0,
          color: '#FFFFFF',
          bgcolor: '#2A255F',
          '&:hover': {bgcolor: '#342D70'},
        }}
      >
        <AppsIcon sx={{fontSize: 19}} />
      </IconButton>

      <Box sx={{display: 'flex', alignItems: 'center', px: 1.6, gap: 0.85, minWidth: 310, flexShrink: 0}}>
        <Box component="img" src="/images/bd-symbol-rgb.png" alt="BD" sx={{height: 32, width: 'auto', display: 'block', filter: 'brightness(0) invert(1)'}} />
        <Typography sx={{fontSize: 31, lineHeight: 1, color: '#FFFFFF', fontWeight: 700}}>BD</Typography>
        <Typography sx={{fontSize: 21, lineHeight: 1, color: '#FFFFFF', fontWeight: 800, ml: 0.35}}>Smart Factory</Typography>
      </Box>

      <Box sx={{flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', px: 1.6, minWidth: 0}}>
        <Box
          onClick={onOpenSmartSearch}
          sx={{
            height: 40,
            width: '100%',
            maxWidth: 250,
            px: 1.05,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            borderRadius: '10px',
            bgcolor: '#FFFFFF',
            cursor: 'pointer',
          }}
        >
          <Typography sx={{fontSize: 15, color: '#8E96A6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>Search ...</Typography>
          <Box sx={{width: 30, height: 30, borderRadius: '50%', bgcolor: '#1D6BEE', display: 'grid', placeItems: 'center', color: '#FFFFFF'}}>
            <SearchIcon sx={{fontSize: 19}} />
          </Box>
        </Box>
      </Box>

      <Box sx={{display: 'flex', alignItems: 'center', gap: 1.05, pr: 1.8, flexShrink: 0}}>
        <Box sx={{display: {xs: 'none', lg: 'flex'}, alignItems: 'center', gap: 0.35, color: '#FFFFFF'}}>
          <LocationOnIcon sx={{fontSize: 13, color: '#8984C7'}} />
          <Typography sx={{fontSize: 12, fontWeight: 800}}>Tijuana / Assembly Room / Unit A /</Typography>
        </Box>
        <Box sx={{display: {xs: 'none', md: 'flex'}, alignItems: 'center', gap: 0.45, px: 1, height: 24, borderRadius: '999px', bgcolor: 'rgba(255,255,255,0.09)', color: '#FFFFFF'}}>
          <Typography sx={{fontSize: 11, fontWeight: 700}}>Line 1</Typography>
          <Typography sx={{fontSize: 10.5, color: '#A6A0D5'}}>+ 2</Typography>
        </Box>
        <Box sx={{height: 22, width: 1, bgcolor: 'rgba(255,255,255,0.14)'}} />
        {[SparkleIcon, HomeIcon, DescriptionIcon, NotificationsIcon].map((Icon, index) => (
          <IconButton
            key={index}
            onClick={Icon === SparkleIcon ? onOpenAiAssistant : emptyAction}
            sx={{width: 24, height: 24, color: '#FFFFFF', bgcolor: 'transparent', '&:hover': {bgcolor: 'rgba(255,255,255,0.08)'}}}
          >
            <Icon sx={{fontSize: 17}} />
          </IconButton>
        ))}
        <Box sx={{height: 36, px: 1.7, borderRadius: '11px', bgcolor: '#2074F4', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 0.65, fontSize: 12.3, fontWeight: 900}}>
          SHIFT ENTRY
          <KeyboardArrowDownIcon sx={{fontSize: 16}} />
        </Box>
        <Avatar src="/images/Ibrahim.png" alt="Ibrahim" sx={{width: 40, height: 40, border: '2px solid rgba(255,255,255,0.22)'}} />
      </Box>
    </Box>
  );
}

function SectionShell({
  actionLabel = 'Yearly',
  actionMode = 'tune',
  bodySx,
  children,
  onExpand,
  sectionSx,
  showDropdown = true,
  title,
}: {
  actionLabel?: string;
  actionMode?: 'sparkle' | 'tune';
  bodySx?: Record<string, unknown>;
  children: React.ReactNode;
  onExpand?: () => void;
  sectionSx?: Record<string, unknown>;
  showDropdown?: boolean;
  title: string;
}) {
  const ActionIcon = actionMode === 'sparkle' ? SparkleIcon : TuneIcon;

  return (
    <Paper elevation={0} sx={{...pageShellSx, p: 1.6, display: 'flex', flexDirection: 'column', gap: 1.05, height: '100%', minHeight: 0, overflow: 'hidden', ...sectionSx}}>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
        <Typography sx={{fontSize: 20, lineHeight: 1.1, fontWeight: 800, color: '#FFFFFF'}}>{title}</Typography>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.15, color: '#9AA7BD'}}>
          {actionLabel ? <Typography sx={{fontSize: 15, color: '#FFFFFF'}}>{actionLabel}</Typography> : null}
          {actionLabel && showDropdown ? <ArrowDropDownIcon sx={{fontSize: 18}} /> : null}
          <IconButton size="small" sx={sectionHeaderActionSx}>
            <ActionIcon sx={{fontSize: actionMode === 'sparkle' ? 20 : 17}} />
          </IconButton>
          <IconButton onClick={onExpand} size="small" sx={{...sectionHeaderActionSx, color: '#5AA7FF'}}>
            <OpenInFullIcon sx={{fontSize: 17}} />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 1.05, ...bodySx}}>
        {children}
      </Box>
    </Paper>
  );
}

function InnerCard({
  actionMode = 'tune',
  cardSx,
  children,
  title,
  actionLabel,
  onExpand,
  showDropdown = false,
}: {
  actionLabel?: string;
  actionMode?: 'sparkle' | 'tune';
  cardSx?: Record<string, unknown>;
  children: React.ReactNode;
  onExpand?: () => void;
  showDropdown?: boolean;
  title: string;
}) {
  const ActionIcon = actionMode === 'sparkle' ? SparkleIcon : TuneIcon;

  return (
    <Paper elevation={0} sx={{bgcolor: '#1F2938', borderRadius: '10px', p: 1.15, border: '1px solid rgba(111, 127, 151, 0.32)', boxShadow: 'none', height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', ...cardSx}}>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.85}}>
        <Typography sx={{fontSize: 18, lineHeight: 1.1, fontWeight: 800, color: '#FFFFFF'}}>{title}</Typography>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.15}}>
          {actionLabel ? <Typography sx={{fontSize: 15, color: '#C7CFDA'}}>{actionLabel}</Typography> : null}
          {actionLabel && showDropdown ? <ArrowDropDownIcon sx={{fontSize: 18, color: '#9AA7BD'}} /> : null}
          <IconButton size="small" sx={sectionHeaderActionSx}>
            <ActionIcon sx={{fontSize: actionMode === 'sparkle' ? 20 : 17}} />
          </IconButton>
          <IconButton onClick={onExpand} size="small" sx={{...sectionHeaderActionSx, color: '#5AA7FF'}}>
            <OpenInFullIcon sx={{fontSize: 17}} />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{flex: 1, minHeight: 0, overflow: 'hidden'}}>
        {children}
      </Box>
    </Paper>
  );
}

function SummaryTile({
  accent = '#22AFFF',
  caption,
  minHeight = 74,
  value,
  valueFontSize = 22,
  valueSuffix,
}: {
  accent?: string;
  caption: string;
  minHeight?: number;
  value: string;
  valueFontSize?: number;
  valueSuffix?: string;
}) {
  return (
    <Box
      sx={{
        minHeight,
        px: 0.9,
        py: 0.65,
        borderRadius: '6px',
        bgcolor: '#364150',
        borderLeft: `4px solid ${accent}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'baseline', gap: 0.35, color: '#FFFFFF'}}>
        <Typography sx={{fontSize: valueFontSize, fontWeight: 500, lineHeight: 1}}>{value}</Typography>
        {valueSuffix ? <Typography sx={{fontSize: 10.5, color: '#B8C4D6'}}>{valueSuffix}</Typography> : null}
      </Box>
      <Typography sx={{mt: 0.28, fontSize: 10.5, color: '#D5DDEC'}}>{caption}</Typography>
    </Box>
  );
}

function CostHeadlineTile({
  budgetLabel,
  budgetValue,
  caption,
  value,
}: {
  budgetLabel: string;
  budgetValue: string;
  caption: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        minHeight: 74,
        px: 1.15,
        py: 0.9,
        borderRadius: '6px',
        bgcolor: '#364150',
        borderLeft: '4px solid #22AFFF',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 1,
      }}
    >
      <Box>
        <Typography sx={{fontSize: 20, fontWeight: 500, lineHeight: 1, color: '#FFFFFF'}}>{value}</Typography>
        <Typography sx={{mt: 0.35, fontSize: 11, color: '#D5DDEC'}}>{caption}</Typography>
      </Box>
      <Box sx={{textAlign: 'right', pt: 0.05}}>
        <Typography sx={{fontSize: 8.2, letterSpacing: '0.04em', color: '#D5DDEC'}}>{budgetLabel}</Typography>
        <Box
          sx={{
            mt: 0.35,
            px: 0.55,
            py: 0.18,
            borderRadius: '999px',
            bgcolor: 'rgba(255,255,255,0.14)',
            color: '#FFFFFF',
            fontSize: 9,
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          {budgetValue}
        </Box>
      </Box>
    </Box>
  );
}

function BigMetricCard({
  accent = '#FF4B3E',
  detail,
  footerLabel,
  footerValue,
  tone = 'default',
  value,
  valueSuffix,
}: {
  accent?: string;
  detail: string;
  footerLabel?: string;
  footerValue?: string;
  tone?: 'default' | 'danger';
  value: string;
  valueSuffix?: string;
}) {
  return (
    <Box
      sx={{
        minHeight: 78,
        px: 1.1,
        py: 0.95,
        borderRadius: '6px',
        bgcolor: tone === 'danger' ? '#5A2027' : '#364150',
        borderLeft: `4px solid ${accent}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
      }}
    >
      <Box>
        <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 0.25}}>
          <Typography sx={{fontSize: 52, fontWeight: 500, lineHeight: 0.95, color: '#FFFFFF'}}>{value}</Typography>
          {valueSuffix ? <Typography sx={{fontSize: 13, color: '#D5DDEC', mt: 0.25}}>{valueSuffix}</Typography> : null}
        </Box>
        <Typography sx={{fontSize: 10.8, color: '#D5DDEC', mt: 0.3}}>{detail}</Typography>
      </Box>
      {footerLabel && footerValue ? (
        <Box sx={{textAlign: 'right'}}>
          <Typography sx={{fontSize: 8.5, color: '#D5DDEC'}}>{footerLabel}</Typography>
          <Box sx={{minWidth: 28, px: 0.7, py: 0.2, borderRadius: '4px', bgcolor: 'rgba(255,255,255,0.12)', color: '#FFFFFF', fontSize: 10.2, fontWeight: 700}}>
            {footerValue}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}

function GridBackdrop() {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        backgroundImage: [
          'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px)',
          'linear-gradient(to top, rgba(255,255,255,0.08) 1px, transparent 1px)',
        ].join(','),
        backgroundSize: '32px 100%, 100% 28px',
        opacity: 0.55,
        pointerEvents: 'none',
      }}
    />
  );
}

function BaseChart({
  bottomLabels,
  chartHeight = 110,
  children,
  leftLabel = 'Quantity',
  leftTicks,
  rightLabel,
  rightTicks,
  topPadding = 16,
}: {
  bottomLabels: string[];
  chartHeight?: number;
  children: React.ReactNode;
  leftLabel?: string;
  leftTicks?: string[];
  rightLabel?: string;
  rightTicks?: string[];
  topPadding?: number;
}) {
  return (
    <Box sx={{position: 'relative', borderRadius: '6px', overflow: 'hidden', bgcolor: '#141B2A', px: 2.2, pt: `${topPadding}px`, pb: 2.9}}>
      <GridBackdrop />
      {leftLabel ? (
        <Typography sx={{position: 'absolute', left: -6, top: '42%', transform: 'rotate(-90deg)', transformOrigin: 'left top', fontSize: 9, color: '#AAB5C9'}}>
          {leftLabel}
        </Typography>
      ) : null}
      {rightLabel ? (
        <Typography sx={{position: 'absolute', right: -12, top: '44%', transform: 'rotate(90deg)', transformOrigin: 'right top', fontSize: 9, color: '#AAB5C9'}}>
          {rightLabel}
        </Typography>
      ) : null}
      {leftTicks ? (
        <Box sx={{position: 'absolute', left: 4, top: topPadding - 2, bottom: 29, width: 26, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none'}}>
          {leftTicks.map((tick) => (
            <Typography key={tick} sx={{fontSize: 8.2, color: '#AAB5C9', lineHeight: 1, textAlign: 'right'}}>
              {tick}
            </Typography>
          ))}
        </Box>
      ) : null}
      {rightTicks ? (
        <Box sx={{position: 'absolute', right: 4, top: topPadding - 2, bottom: 29, width: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none'}}>
          {rightTicks.map((tick) => (
            <Typography key={tick} sx={{fontSize: 8.2, color: '#AAB5C9', lineHeight: 1}}>
              {tick}
            </Typography>
          ))}
        </Box>
      ) : null}
      <Box sx={{position: 'relative', height: chartHeight}}>{children}</Box>
      <Box sx={{mt: 0.55, display: 'grid', gridTemplateColumns: `repeat(${bottomLabels.length}, minmax(0, 1fr))`, gap: 0.2}}>
        {bottomLabels.map((label) => (
          <Typography key={label} sx={{fontSize: 8.4, color: '#AAB5C9', textAlign: 'center', whiteSpace: 'nowrap'}}>
            {label}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

function PolylineChart({
  color,
  dashed = false,
  fill,
  points,
  strokeWidth = 2,
}: {
  color: string;
  dashed?: boolean;
  fill?: string;
  points: number[];
  strokeWidth?: number;
}) {
  const {linePoints, polygonPoints} = useMemo(() => {
    const step = points.length > 1 ? 100 / (points.length - 1) : 100;
    const mapped = points.map((value, index) => `${index * step},${100 - value}`);
    const polygon = [`0,100`, ...mapped, `100,100`].join(' ');
    return {linePoints: mapped.join(' '), polygonPoints: polygon};
  }, [points]);

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
      {fill ? <polygon points={polygonPoints} fill={fill} opacity={0.18} /> : null}
      <polyline
        points={linePoints}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={dashed ? '3 2' : undefined}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BarChart({
  bars,
  color,
}: {
  bars: number[];
  color: string;
}) {
  return (
    <Box sx={{position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: `repeat(${bars.length}, minmax(0, 1fr))`, alignItems: 'end', gap: 1.15, px: 0.55}}>
      {bars.map((value, index) => (
        <Box key={index} sx={{display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: '100%'}}>
          <Box sx={{width: '68%', height: `${value}%`, borderRadius: '2px 2px 0 0', bgcolor: color}} />
        </Box>
      ))}
    </Box>
  );
}

function LinePointOverlay({
  dotColor,
  fontSize = 8.2,
  labelColor = '#D7E4F7',
  labelOffset = -14,
  labels,
  points,
}: {
  dotColor: string;
  fontSize?: number;
  labelColor?: string;
  labelOffset?: number;
  labels: string[];
  points: number[];
}) {
  const step = points.length > 1 ? 100 / (points.length - 1) : 100;

  return (
    <Box sx={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {points.map((point, index) => (
        <Box
          key={`${labels[index]}-${point}-${index}`}
          sx={{
            position: 'absolute',
            left: `${index * step}%`,
            bottom: `${point}%`,
            transform: 'translate(-50%, 50%)',
          }}
        >
          <Box sx={{width: 5, height: 5, borderRadius: '50%', bgcolor: dotColor}} />
          <Typography
            sx={{
              position: 'absolute',
              left: '50%',
              bottom: `${labelOffset}px`,
              transform: 'translateX(-50%)',
              fontSize,
              color: labelColor,
              whiteSpace: 'nowrap',
              lineHeight: 1,
            }}
          >
            {labels[index]}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function MultiBarChart({
  series,
}: {
  series: Array<{color: string; values: number[]}>;
}) {
  const groups = series[0]?.values.length ?? 0;

  return (
    <Box sx={{position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: `repeat(${groups}, minmax(0, 1fr))`, alignItems: 'end', gap: 1.05, px: 0.4}}>
      {Array.from({length: groups}).map((_, groupIndex) => (
        <Box key={groupIndex} sx={{display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 0.3, height: '100%'}}>
          {series.map((item) => (
            <Box
              key={`${item.color}-${groupIndex}`}
              sx={{
                width: '18%',
                minWidth: 4,
                height: `${item.values[groupIndex]}%`,
                borderRadius: '2px 2px 0 0',
                bgcolor: item.color,
              }}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
}

function StackedBarChart({
  series,
}: {
  series: Array<{color: string; values: number[]}>;
}) {
  const groups = series[0]?.values.length ?? 0;
  const totals = Array.from({length: groups}, (_, groupIndex) => series.reduce((sum, item) => sum + item.values[groupIndex], 0));
  const maxTotal = Math.max(...totals, 1);

  return (
    <Box sx={{position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: `repeat(${groups}, minmax(0, 1fr))`, alignItems: 'end', gap: 1.2, px: 0.55}}>
      {Array.from({length: groups}).map((_, groupIndex) => {
        let currentHeight = 0;

        return (
          <Box key={groupIndex} sx={{display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: '100%'}}>
            <Box sx={{position: 'relative', width: '34%', minWidth: 12, height: `${(totals[groupIndex] / maxTotal) * 100}%`}}>
              {series.map((item, itemIndex) => {
                const segmentHeight = totals[groupIndex] === 0 ? 0 : (item.values[groupIndex] / totals[groupIndex]) * 100;
                const segment = (
                  <Box
                    key={`${item.color}-${groupIndex}`}
                    sx={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: `${currentHeight}%`,
                      height: `${segmentHeight}%`,
                      bgcolor: item.color,
                      borderRadius: itemIndex === series.length - 1 ? '2px 2px 0 0' : 0,
                    }}
                  />
                );
                currentHeight += segmentHeight;
                return segment;
              })}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

function LegendRow({
  items,
}: {
  items: Array<{color: string; dashed?: boolean; label: string}>;
}) {
  return (
    <Box sx={{mt: 0.65, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1.1}}>
      {items.map((item) => (
        <Box key={item.label} sx={{display: 'flex', alignItems: 'center', gap: 0.45}}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: item.dashed ? 0 : '50%',
              bgcolor: item.dashed ? 'transparent' : item.color,
              borderTop: item.dashed ? `1px dashed ${item.color}` : 'none',
            }}
          />
          <Typography sx={{fontSize: 8.8, color: '#AAB5C9'}}>{item.label}</Typography>
        </Box>
      ))}
    </Box>
  );
}

function ChartPager({
  activeIndex = 0,
  count = 4,
}: {
  activeIndex?: number;
  count?: number;
}) {
  return (
    <Box sx={{mt: 0.45, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.55}}>
      {Array.from({length: count}).map((_, index) =>
        index === activeIndex ? (
          <Box
            key={index}
            sx={{
              width: 14,
              height: 14,
              borderRadius: '999px',
              bgcolor: '#2A7EF6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.2,
            }}
          >
            <Box sx={{width: 1.5, height: 5, borderRadius: '999px', bgcolor: '#F3F7FF'}} />
            <Box sx={{width: 1.5, height: 5, borderRadius: '999px', bgcolor: '#F3F7FF'}} />
          </Box>
        ) : (
          <Box key={index} sx={{width: 5, height: 5, borderRadius: '50%', bgcolor: 'rgba(170,181,201,0.45)'}} />
        ),
      )}
    </Box>
  );
}

function ProgressRows({
  rows,
}: {
  rows: Array<{label: string; value: string; width: number; color?: string}>;
}) {
  return (
    <Box sx={{display: 'grid', gap: 0.55}}>
      {rows.map((row) => (
        <Box key={row.label} sx={{display: 'grid', gridTemplateColumns: '1fr 158px', gap: 1, alignItems: 'center'}}>
          <Typography sx={{fontSize: 12.2, color: '#F0F5FF'}}>{row.label}</Typography>
          <Box sx={{position: 'relative', height: 18, borderRadius: '4px', bgcolor: '#4A5566', overflow: 'hidden'}}>
            <Box sx={{position: 'absolute', insetY: 0, left: 0, width: `${row.width}%`, bgcolor: row.color ?? '#FF4B3E'}} />
            <Typography sx={{position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 10.8, fontWeight: 700, color: '#FFFFFF'}}>
              {row.value}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function RingStat({
  accentA,
  accentB,
  label,
  value,
}: {
  accentA: string;
  accentB: string;
  label: string;
  value: string;
}) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 1.2}}>
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          bgcolor: `conic-gradient(${accentA} 0deg 200deg, ${accentB} 200deg 320deg, #223047 320deg 360deg)`,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Box sx={{width: 48, height: 48, borderRadius: '50%', bgcolor: '#1D2535', display: 'grid', placeItems: 'center'}}>
          <Typography sx={{fontSize: 18, fontWeight: 700, color: '#FFFFFF'}}>{value}</Typography>
        </Box>
      </Box>
      <Typography sx={{fontSize: 11.5, color: '#E7EEFC', whiteSpace: 'pre-line'}}>{label}</Typography>
    </Box>
  );
}

function QualityStatusInvestigation() {
  const statusRows = [
    {color: '#1494E8', label: 'Open', value: '38%'},
    {color: '#5A35D2', label: 'Under Investigation', value: '26%'},
    {color: '#95D33F', label: 'Action Plan Defined', value: '24%'},
    {color: '#31B19C', label: 'Closed', value: '12%'},
  ];

  return (
    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '210px minmax(0, 1fr)'}, gap: {xs: 1.2, md: 1.15}, alignItems: 'start'}}>
      <Box sx={{minWidth: 0}}>
        <Typography sx={{fontSize: 11.6, color: '#FFFFFF', textAlign: 'center', mb: 0.7}}>Status</Typography>
        <Box sx={{display: 'grid', gridTemplateColumns: '72px 1fr', gap: 0.95, alignItems: 'center'}}>
          <ControlTowerDonut
            gradient="conic-gradient(#1494E8 0deg 136.8deg, #5A35D2 136.8deg 230.4deg, #95D33F 230.4deg 316.8deg, #31B19C 316.8deg 360deg)"
            value="18"
          />
          <ControlTowerStatusLegend rows={statusRows} />
        </Box>
      </Box>

      <Box sx={{minWidth: 0}}>
        <Typography sx={{fontSize: 11.6, color: '#FFFFFF', textAlign: 'center', mb: 0.7}}>Open Status Breakdown by Category</Typography>
        <ControlTowerStatusRows rows={[{label: 'NCs', value: '52%'}, {label: 'Field Actions', value: '31%'}, {label: 'Complaints', value: '17%'}]} />
      </Box>
    </Box>
  );
}

function GaugeCard() {
  return (
    <Box sx={{position: 'relative', height: 124, display: 'grid', placeItems: 'center'}}>
      <Box
        sx={{
          width: 152,
          height: 82,
          borderTopLeftRadius: 152,
          borderTopRightRadius: 152,
          border: '4px solid transparent',
          borderBottom: 0,
          background: 'linear-gradient(#1D2535, #1D2535) padding-box, conic-gradient(from 180deg, #E44B44 0deg, #FF8C00 60deg, #9BC53D 120deg, #2BC08B 180deg) border-box',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: '10px 10px -2px 10px',
            borderTopLeftRadius: 120,
            borderTopRightRadius: 120,
            border: '4px solid #415066',
            borderBottom: 0,
          },
        }}
      />
      <Box sx={{position: 'absolute', top: 16, right: 28, width: 18, height: 18, borderRadius: '50%', bgcolor: '#1D2535', border: '4px solid #1188DD'}} />
      <Box sx={{position: 'absolute', bottom: 20, textAlign: 'center'}}>
        <Typography sx={{fontSize: 42, fontWeight: 500, color: '#FFFFFF', lineHeight: 1}}>
          85<span style={{fontSize: '0.55em'}}>%</span>
        </Typography>
        <Typography sx={{fontSize: 12, color: '#7CD56B'}}>Target: 80%</Typography>
      </Box>
    </Box>
  );
}

function MetricList({
  rows,
}: {
  rows: Array<{color: string; label: string; value: string}>;
}) {
  return (
    <Box sx={{display: 'grid', gap: 0.55}}>
      {rows.map((row) => (
        <Box key={row.label} sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, px: 1, py: 0.75, borderRadius: '4px', bgcolor: '#364150'}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
            <Box sx={{width: 7, height: 7, borderRadius: '50%', bgcolor: row.color}} />
            <Typography sx={{fontSize: 12.3, color: '#EAF0FF'}}>{row.label}</Typography>
          </Box>
          <Typography sx={{fontSize: 12.3, color: '#FFFFFF', fontWeight: 800}}>{row.value}</Typography>
        </Box>
      ))}
    </Box>
  );
}

function MiniRankingCard({
  items,
  size = 'default',
  title,
}: {
  items: Array<{change: string; label: string; tone: 'good' | 'bad'}>;
  size?: 'default' | 'large';
  title: string;
}) {
  const isLarge = size === 'large';

  return (
    <Box sx={{flex: 1, minWidth: 0}}>
      <Typography sx={{fontSize: isLarge ? 9.8 : 8.3, color: '#D0D7E6', fontWeight: 800, mb: isLarge ? 0.75 : 0.5}}>{title}</Typography>
      <Box sx={{display: 'grid', gap: isLarge ? 0.55 : 0.4}}>
        {items.map((item) => (
          <Box key={item.label} sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.65, px: isLarge ? 0.75 : 0.55, py: isLarge ? 0.48 : 0.35, bgcolor: '#364150', borderRadius: '4px'}}>
            <Typography sx={{fontSize: isLarge ? 10 : 8.7, color: '#F0F5FF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 700}}>{item.label}</Typography>
            <Box sx={{px: isLarge ? 0.55 : 0.4, py: isLarge ? 0.16 : 0.08, borderRadius: '3px', bgcolor: item.tone === 'good' ? '#46B86B' : '#EF4A4A', color: '#FFFFFF', fontSize: isLarge ? 9 : 8, fontWeight: 800}}>
              {item.change}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function DeliveryTrendChart() {
  const values = [65, 74, 76, 85, 90, 94, 99, 104, 115, 119, 122, 130];
  const labels = ['Oct 24', 'Nov 24', 'Dec 24', 'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25'];
  const yTicks = ['150M', '120M', '90M', '60M', '30M', '0'];
  const markerIndex = 10;
  const trendHeights = [43, 49, 47, 50, 49, 54, 57, 54, 66, 63, 69, 76];

  return (
    <Box>
      <BaseChart
        bottomLabels={labels}
        chartHeight={134}
        leftLabel=""
        leftTicks={yTicks}
        topPadding={12}
      >
        <Box sx={{position: 'absolute', left: 10, top: 4, px: 0.72, py: 0.35, borderRadius: '6px', border: '1px solid rgba(255,255,255,0.18)', bgcolor: '#171F30'}}>
          <Typography sx={{fontSize: 8.5, color: '#EAF0FF'}}>PPA: 95%/96%</Typography>
        </Box>

        <PolylineChart color="#1194F6" points={trendHeights} strokeWidth={2.3} />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
          <polyline
            points="81.8,37 90.9,31 100,24"
            fill="none"
            stroke="#DFE7F6"
            strokeWidth="1.25"
            strokeDasharray="3 2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
        </svg>
        <Box sx={{position: 'absolute', top: 0, bottom: 0, left: `calc(${(markerIndex / (labels.length - 1)) * 100}% - 1px)`, borderLeft: '1px dashed rgba(255,255,255,0.66)'}} />

        <Box sx={{position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))`, alignItems: 'stretch', px: 0.55}}>
          {values.map((value, index) => (
            <Box key={`${labels[index]}-${value}`} sx={{position: 'relative', height: '100%'}}>
              <Box
                sx={{
                  position: 'absolute',
                  left: '50%',
                  bottom: `${trendHeights[index]}%`,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: '#1194F6',
                  transform: 'translate(-50%, 50%)',
                  boxShadow: '0 0 0 2px rgba(17,148,246,0.12)',
                }}
              />
              <Typography
                sx={{
                  position: 'absolute',
                  left: '50%',
                  bottom: `calc(${trendHeights[index]}% + 8px)`,
                  transform: 'translateX(-50%)',
                  fontSize: 7.5,
                  color: '#D7E4F7',
                  whiteSpace: 'nowrap',
                }}
              >
                {value}M
              </Typography>
            </Box>
          ))}
        </Box>
      </BaseChart>

      <LegendRow items={[{color: '#1194F6', label: 'Production Output'}, {color: '#DFE7F6', dashed: true, label: 'Forecast'}]} />
      <ChartPager activeIndex={0} count={3} />
    </Box>
  );
}

function DeliveryGaugeCard() {
  return (
    <Box sx={{position: 'relative', height: 118, display: 'grid', placeItems: 'center'}}>
      <Box
        sx={{
          width: 152,
          height: 82,
          borderTopLeftRadius: 152,
          borderTopRightRadius: 152,
          border: '4px solid transparent',
          borderBottom: 0,
          background: 'linear-gradient(#1D2535, #1D2535) padding-box, conic-gradient(from 180deg, #E44B44 0deg, #D98611 58deg, #0F8FEA 124deg, #67B85D 180deg) border-box',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: '11px 11px -2px 11px',
            borderTopLeftRadius: 124,
            borderTopRightRadius: 124,
            border: '4px solid #415066',
            borderBottom: 0,
          },
        }}
      />
      <Box sx={{position: 'absolute', top: 18, right: 22, width: 17, height: 17, borderRadius: '50%', bgcolor: '#1D2535', border: '4px solid #1188DD'}} />
      <Box sx={{position: 'absolute', bottom: 2, textAlign: 'center'}}>
        <Typography sx={{fontSize: 36, fontWeight: 500, color: '#FFFFFF', lineHeight: 1}}>
          85<span style={{fontSize: '0.5em'}}> %</span>
        </Typography>
        <Typography sx={{fontSize: 13, color: '#7CD56B'}}>Target: 80%</Typography>
      </Box>
    </Box>
  );
}

function StatusTable({
  rows,
}: {
  rows: Array<{label: string; value: string}>;
}) {
  return (
    <Box sx={{display: 'grid', gap: 0.55}}>
      {rows.map((row) => (
        <Box key={row.label} sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, py: 0.7, bgcolor: '#364150', borderRadius: '4px'}}>
          <Typography sx={{fontSize: 11.7, color: '#EAF0FF'}}>{row.label}</Typography>
          <Typography sx={{fontSize: 12, color: '#FFFFFF', fontWeight: 800}}>{row.value}</Typography>
        </Box>
      ))}
    </Box>
  );
}

function SustainabilityMetric({
  label,
  trend,
  unit,
  value,
}: {
  label: string;
  trend: string;
  unit: string;
  value: string;
}) {
  return (
    <Box sx={{px: 1, py: 0.8, borderRadius: '6px', bgcolor: '#364150', borderLeft: '4px solid #24A7FF'}}>
      <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1}}>
        <Box>
          <Box sx={{display: 'flex', alignItems: 'baseline', gap: 0.25}}>
            <Typography sx={{fontSize: 19, color: '#FFFFFF', fontWeight: 500}}>{value}</Typography>
            <Typography sx={{fontSize: 10.2, color: '#C6D0E0'}}>{unit}</Typography>
          </Box>
          <Typography sx={{fontSize: 10.5, color: '#D8E0EF'}}>{label}</Typography>
        </Box>
        <Box sx={{textAlign: 'right'}}>
          <Typography sx={{fontSize: 7.8, color: '#AAB5C9'}}>TREND</Typography>
          <Box sx={{mt: 0.2, px: 0.45, py: 0.1, borderRadius: '999px', bgcolor: '#0E2F27', color: '#8DE0B2', fontSize: 8.5, fontWeight: 700}}>
            {trend}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function AiAlertCard({
  accent,
  body,
  title,
}: {
  accent: string;
  body: string;
  title: string;
}) {
  return (
    <Box sx={{px: 1.15, py: 0.95, borderRadius: '12px', bgcolor: '#202C3E', borderLeft: `3px solid ${accent}`}}>
      <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2}}>
        <Box sx={{minWidth: 0}}>
          <Typography sx={{fontSize: 11.8, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.3}}>{title}</Typography>
          <Typography sx={{mt: 0.3, fontSize: 10.5, color: '#DAE3F3', lineHeight: 1.35}}>{body}</Typography>
        </Box>
        <Typography sx={{fontSize: 10.5, color: '#5AA7FF', fontWeight: 800, whiteSpace: 'nowrap'}}>SHOW MORE</Typography>
      </Box>
    </Box>
  );
}

function SafetyIncidentOverview() {
  return (
    <Box sx={{height: '100%', display: 'grid', gridTemplateColumns: {xs: '1fr', sm: '154px minmax(0, 1fr)'}, gap: {xs: 1, sm: 5.25}, alignItems: 'center'}}>
      <Box
        sx={{
          height: 104,
          px: 1.25,
          py: 1.15,
          borderRadius: '4px',
          bgcolor: '#6A2530',
          borderLeft: '4px solid #FF4E42',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{pb: 0.1}}>
          <Typography sx={{fontSize: 60, lineHeight: 0.86, fontWeight: 500, color: '#FFFFFF'}}>3</Typography>
          <Typography sx={{fontSize: 12, color: '#F4F7FD', mt: 0.65, lineHeight: 1}}>Incident</Typography>
        </Box>
        <Box sx={{textAlign: 'right', pb: 0.18}}>
          <Typography sx={{fontSize: 10, color: '#E6DBE0', lineHeight: 1, fontWeight: 700}}>TARGET</Typography>
          <Box sx={{mt: 0.35, ml: 'auto', width: 18, height: 18, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.16)', display: 'grid', placeItems: 'center'}}>
            <Typography sx={{fontSize: 9, color: '#FFFFFF', lineHeight: 1, fontWeight: 700}}>2</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{display: 'grid', alignContent: 'center', gap: 0.85, pt: 0.15}}>
        {[
          {label: 'Fatality', value: '0', width: 72, color: '#505B6C'},
          {label: 'Serious Injury', value: '1', width: 139, color: '#FF4038'},
          {label: 'Minor Injury', value: '1', width: 185, color: '#F05054'},
          {label: 'Near Miss', value: '1', width: 232, color: '#E76E72'},
        ].map((row) => (
          <Box key={row.label} sx={{display: 'grid', gridTemplateColumns: '112px minmax(0, 1fr)', gap: 1.1, alignItems: 'center'}}>
            <Typography sx={{fontSize: 14, color: '#EEF2FA', lineHeight: 1, fontWeight: 500}}>{row.label}</Typography>
            <Box sx={{height: 23, width: '100%', maxWidth: 232, borderRadius: '4px', justifySelf: 'end', bgcolor: '#445062', overflow: 'hidden', position: 'relative'}}>
              <Box sx={{position: 'absolute', insetY: 0, left: 0, width: row.width, maxWidth: '100%', bgcolor: row.color}} />
              <Typography sx={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', fontSize: 14, color: '#FFFFFF', fontWeight: 700, lineHeight: 1}}>
                {row.value}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function SafetyTrackingGrid() {
  const tileSx = {
    height: '100%',
    minHeight: 56,
    px: 1.15,
    py: 0.9,
    borderRadius: '4px',
    bgcolor: '#364150',
    borderLeft: '4px solid #22AFFF',
  } as const;

  return (
    <Box sx={{height: '100%', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gridTemplateRows: 'repeat(2, minmax(0, 1fr))', gap: 1.25}}>
      <Box sx={tileSx}>
        <Typography sx={{fontSize: 24, color: '#FFFFFF', lineHeight: 0.95}}>2</Typography>
        <Typography sx={{fontSize: 12, color: '#DFE6F2', mt: 0.3}}>Days without incidents</Typography>
      </Box>
      <Box sx={{...tileSx, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <Box>
          <Typography sx={{fontSize: 24, color: '#FFFFFF', lineHeight: 0.95}}>0.02</Typography>
          <Typography sx={{fontSize: 12, color: '#DFE6F2', mt: 0.3}}>TRIR Actual</Typography>
        </Box>
        <Box sx={{textAlign: 'right'}}>
          <Typography sx={{fontSize: 8.5, color: '#D6DEE9', lineHeight: 1, fontWeight: 800}}>TARGET</Typography>
          <Box sx={{mt: 0.35, px: 0.65, py: 0.22, borderRadius: '999px', bgcolor: 'rgba(255,255,255,0.18)', color: '#FFFFFF', fontSize: 10, fontWeight: 800}}>0.00</Box>
        </Box>
      </Box>
      <Box sx={tileSx}>
        <Typography sx={{fontSize: 24, color: '#FFFFFF', lineHeight: 0.95}}>100</Typography>
        <Typography sx={{fontSize: 12, color: '#DFE6F2', mt: 0.3}}>Longest period without incident</Typography>
      </Box>
      <Box sx={tileSx}>
        <Typography sx={{fontSize: 24, color: '#FFFFFF', lineHeight: 0.95}}>75%</Typography>
        <Typography sx={{fontSize: 12, color: '#DFE6F2', mt: 0.3}}>EHS Maturity</Typography>
      </Box>
    </Box>
  );
}

function SafetyEsoGrid() {
  return (
    <Box sx={{height: '100%', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gridTemplateRows: 'repeat(2, minmax(0, 1fr))', gap: 1.25}}>
      {[
        {value: '1.150', label: 'BBS'},
        {value: '420', label: 'Near Miss'},
        {value: '200', label: 'Unsafe Condition'},
        {value: '640', label: 'Safe Condition'},
      ].map((item) => (
        <Box key={item.label} sx={{height: '100%', minHeight: 56, px: 1.15, py: 0.9, borderRadius: '4px', bgcolor: '#364150', borderLeft: '4px solid #22AFFF'}}>
          <Typography sx={{fontSize: 23, color: '#FFFFFF', lineHeight: 0.95}}>{item.value}</Typography>
          <Typography sx={{fontSize: 12, color: '#DFE6F2', mt: 0.3, lineHeight: 1}}>{item.label}</Typography>
        </Box>
      ))}
    </Box>
  );
}

function ControlTowerWidgetShell({
  children,
  contentSx,
  onExpand,
  title,
}: {
  children: React.ReactNode;
  contentSx?: Record<string, unknown>;
  onExpand?: () => void;
  title: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: '#1F2938',
        borderRadius: '10px',
        p: 1.35,
        border: '1px solid rgba(111, 127, 151, 0.32)',
        boxShadow: 'none',
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.05}}>
        <Typography sx={{fontSize: 18, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1}}>{title}</Typography>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.2}}>
          <IconButton size="small" sx={sectionHeaderActionSx}>
            <SparkleIcon sx={{fontSize: 16}} />
          </IconButton>
          <IconButton onClick={onExpand} size="small" sx={{...sectionHeaderActionSx, color: '#5AA7FF'}}>
            <OpenInFullIcon sx={{fontSize: 16}} />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{flex: 1, minHeight: 0, ...contentSx}}>{children}</Box>
    </Paper>
  );
}

function ControlTowerTrirWidget() {
  return (
    <Box
      sx={{
        minHeight: 90,
        px: 1.05,
        py: 1,
        borderRadius: '4px',
        bgcolor: '#364150',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 1,
      }}
    >
      <Box>
        <Typography sx={{fontSize: 58, fontWeight: 600, lineHeight: 0.92, color: '#FFFFFF'}}>0.02</Typography>
        <Typography sx={{fontSize: 10.2, color: '#DFE6F2', mt: 0.45, lineHeight: 1}}>TRIR Actual</Typography>
      </Box>
      <Box sx={{textAlign: 'right', pb: 0.2}}>
        <Typography sx={{fontSize: 8, color: '#CFD8E6', lineHeight: 1, fontWeight: 700}}>TARGET</Typography>
        <Typography sx={{fontSize: 10.2, color: '#FFFFFF', lineHeight: 1.15, fontWeight: 700, mt: 0.16}}>0.00</Typography>
      </Box>
    </Box>
  );
}

function ControlTowerDonut({
  gradient,
  innerSize = 46,
  size = 72,
  value,
}: {
  gradient: string;
  innerSize?: number;
  size?: number;
  value: string;
}) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: gradient,
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      <Box sx={{width: innerSize, height: innerSize, borderRadius: '50%', bgcolor: '#1D2535', display: 'grid', placeItems: 'center'}}>
          <Typography sx={{fontSize: Math.max(18, Math.round(size * 0.24)), color: '#FFFFFF', fontWeight: 700}}>{value}</Typography>
      </Box>
    </Box>
  );
}

function ControlTowerStatusLegend({
  rows,
}: {
  rows: Array<{color: string; label: string; value: string}>;
}) {
  return (
    <Box sx={{display: 'grid', gap: 0.3}}>
      {rows.map((row) => (
        <Box key={row.label} sx={{display: 'grid', gridTemplateColumns: '3px minmax(0, 1fr)', columnGap: 0.45, alignItems: 'stretch'}}>
          <Box sx={{borderRadius: '999px', bgcolor: row.color}} />
          <Box sx={{minWidth: 0}}>
            <Typography sx={{fontSize: 12, color: '#E7EEFC', lineHeight: 1.02}}>{row.label}</Typography>
            <Typography sx={{fontSize: 12, color: '#E7EEFC', lineHeight: 1.02}}>{row.value}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function ControlTowerStatusRows({
  rows,
}: {
  rows: Array<{label: string; value: string}>;
}) {
  return (
    <Box sx={{display: 'grid', gap: 0.9}}>
      {rows.map((row) => (
        <Box
          key={row.label}
          sx={{
            minHeight: 32,
            px: 1,
            py: 0.65,
            borderRadius: 0,
            bgcolor: '#364150',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Typography sx={{fontSize: 14, color: '#EFF3FA', lineHeight: 1.1}}>{row.label}</Typography>
          <Typography sx={{fontSize: 20, color: '#FFFFFF', fontWeight: 500, lineHeight: 1}}>{row.value}</Typography>
        </Box>
      ))}
    </Box>
  );
}

function SafetyStatusInvestigation() {
  const legendRows = [
    {color: '#1494E8', label: 'Open', value: '38%'},
    {color: '#5A35D2', label: 'Under Investigation', value: '26%'},
    {color: '#95D33F', label: 'Action Plan Defined', value: '24%'},
    {color: '#31B19C', label: 'Closed', value: '12%'},
  ];

  return (
    <Box sx={{height: '100%', display: 'grid', gridTemplateColumns: {xs: '1fr', sm: '254px minmax(0, 1fr)'}, gap: {xs: 1.15, sm: 2.6}, alignItems: 'center'}}>
      <Box sx={{minWidth: 0, alignSelf: 'stretch', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <Typography sx={{fontSize: 14, color: '#FFFFFF', textAlign: 'center', mb: 1.55}}>Status</Typography>
        <Box sx={{display: 'grid', gridTemplateColumns: '100px minmax(0, 1fr)', gap: 1.7, alignItems: 'center'}}>
          <ControlTowerDonut
            gradient="conic-gradient(#1494E8 0deg 137deg, #5A35D2 137deg 231deg, #95D33F 231deg 317deg, #31B19C 317deg 360deg)"
            innerSize={62}
            size={100}
            value="18"
          />
          <ControlTowerStatusLegend rows={legendRows} />
        </Box>
      </Box>

      <Box sx={{minWidth: 0, alignSelf: 'stretch', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <Typography sx={{fontSize: 14, color: '#FFFFFF', textAlign: 'center', mb: 1.25}}>Condition Report High Risk</Typography>
        <ControlTowerStatusRows
          rows={[
            {label: 'Open', value: '40%'},
            {label: 'Under Investigation', value: '25%'},
            {label: 'Action Plan Defined', value: '20%'},
            {label: 'Closed', value: '15%'},
          ]}
        />
      </Box>
    </Box>
  );
}

const drilldownCopy: Record<DrilldownCopyKind, {
  ai: Array<{accent: string; body: string; title: string}>;
  auditTitle: string;
  comments: Array<{author: string; body: string; date: string; image: string}>;
  gauges: Array<{target: string; title: string; value: string}>;
  highRiskTitle: string;
  regions: Array<{label: string; value: string}>;
}> = {
  Safety: {
    auditTitle: 'Audit Findings',
    gauges: [
      {title: 'Incidents Closure Rate', value: '94', target: 'Target: 90%'},
      {title: 'ESOs Closure', value: '81', target: 'Target: 80%'},
    ],
    highRiskTitle: 'High Risk Regions',
    regions: [
      {label: '1° Cell 1', value: '6 Unsafe'},
      {label: '4° Cell 5', value: '3 Unsafe'},
      {label: '2° Cell 4', value: '5 Unsafe'},
      {label: '5° Molding', value: '2 Unsafe'},
      {label: '3° Cell 2', value: '4 Unsafe'},
      {label: '6° Cell 3', value: '1 Unsafe'},
    ],
    ai: [
      {
        accent: '#67D783',
        title: 'LOTO audits on line 3 are due soon',
        body: 'Recommended checks on padlocks and worker safety badges.\nRecommendation: standardize LOTO double-check protocol with supervisors on shift end.',
      },
      {
        accent: '#FF4D48',
        title: 'Slip and fall risk spotted',
        body: 'High condensation levels reported in packing Area.\nRecommendation: perform immediate mop down of safety zone X-12 and deploy visual hazard signs.',
      },
    ],
    comments: [
      {author: 'Maria Pinna', body: 'LOTO audits on Line 3 have achieved 100% compliance during this afternoon shift inspection', date: 'Mar 18, 09:20', image: '/images/Maria.png'},
      {author: 'John Joshua', body: 'Incident closure rate is at 94% YTD. We are safely above our corporate performance goal of 90%.', date: 'Mar 18, 07:32', image: '/images/John.png'},
    ],
  },
  Quality: {
    auditTitle: 'Quality Findings',
    gauges: [
      {title: 'NC Closure Rate', value: '88', target: 'Target: 85%'},
      {title: 'Complaints Closure', value: '79', target: 'Target: 80%'},
    ],
    highRiskTitle: 'Top Quality Risks',
    regions: [
      {label: '1° Cell 2', value: '8 NCs'},
      {label: '4° Line 1', value: '3 NCs'},
      {label: '2° Molding', value: '6 NCs'},
      {label: '5° Cell 4', value: '2 NCs'},
      {label: '3° Cell 5', value: '4 NCs'},
      {label: '6° Cell 3', value: '1 NC'},
    ],
    ai: [
      {accent: '#67D783', title: 'NC rate improving in Cell 4', body: 'First-pass yield recovered after the updated inspection sequence.\nRecommendation: keep layered audits active through the next two shifts.'},
      {accent: '#FF4D48', title: 'Complaint trend requires review', body: 'Customer complaints are concentrated in one packaging lane.\nRecommendation: run a focused containment check before next release.'},
    ],
    comments: [
      {author: 'Olivia Martin', body: 'The quality review queue is clear for the morning lot release.', date: 'Mar 18, 10:15', image: '/images/Olivia.png'},
      {author: 'James Miller', body: 'Containment actions are active for the open customer complaint.', date: 'Mar 18, 08:10', image: '/images/James.png'},
    ],
  },
  Delivery: {
    auditTitle: 'Delivery Actions',
    gauges: [
      {title: 'Output Attainment', value: '85', target: 'Target: 80%'},
      {title: 'Schedule Adherence', value: '91', target: 'Target: 90%'},
    ],
    highRiskTitle: 'Delivery Risks',
    regions: [
      {label: '1° Line 4', value: '6 Late'},
      {label: '4° Cell 1', value: '3 Late'},
      {label: '2° Cell 5', value: '5 Late'},
      {label: '5° Molding', value: '2 Late'},
      {label: '3° Line 2', value: '4 Late'},
      {label: '6° Cell 3', value: '1 Late'},
    ],
    ai: [
      {accent: '#67D783', title: 'OEE up +4.2% this week in Cell 3', body: 'OEE increased due to reduced setup times.\nRecommendation: replicate the production sequence in Cell 5.'},
      {accent: '#FF4D48', title: 'Rejection rate up +5.8% in Cell 2', body: 'Machine X wear may affect delivery commitments.\nRecommendation: schedule immediate maintenance to avoid batch risk.'},
    ],
    comments: [
      {author: 'John Smith', body: 'Production output is tracking above the weekly target after the sequence change.', date: 'Mar 18, 09:55', image: '/images/John.png'},
      {author: 'Madison Lee', body: 'Cell 5 needs dispatch confirmation before shift handoff.', date: 'Mar 18, 07:48', image: '/images/Madison.png'},
    ],
  },
  Cost: {
    auditTitle: 'Cost Findings',
    gauges: [
      {title: 'Waste Recovery Rate', value: '76', target: 'Target: 75%'},
      {title: 'Downtime Closure', value: '83', target: 'Target: 80%'},
    ],
    highRiskTitle: 'Highest Cost Areas',
    regions: [
      {label: '1° Unit 06', value: '$10.5K'},
      {label: '4° Unit 01', value: '$3.2K'},
      {label: '2° Unit 02', value: '$7.8K'},
      {label: '5° Unit 03', value: '$3.1K'},
      {label: '3° Unit 04', value: '$3.8K'},
      {label: '6° Unit 05', value: '$3.1K'},
    ],
    ai: [
      {accent: '#67D783', title: 'Waste reduction is ahead of plan', body: 'Scrap controls improved in the last two production runs.\nRecommendation: keep the current setup checks through week end.'},
      {accent: '#FF4D48', title: 'Downtime cost concentrated in Unit 06', body: 'Repeated micro-stops are increasing labor variance.\nRecommendation: review feeder maintenance windows today.'},
    ],
    comments: [
      {author: 'Maria Pinna', body: 'Waste actions for Unit 06 were updated after the morning review.', date: 'Mar 18, 09:30', image: '/images/Maria.png'},
      {author: 'John Smith', body: 'Downtime cost is expected to normalize after maintenance closes.', date: 'Mar 18, 07:20', image: '/images/John.png'},
    ],
  },
  People: {
    auditTitle: 'People Actions',
    gauges: [
      {title: 'Attendance Closure', value: '86', target: 'Target: 85%'},
      {title: 'Overtime Control', value: '78', target: 'Target: 80%'},
    ],
    highRiskTitle: 'People Risk Areas',
    regions: [
      {label: '1° Line 3', value: '6 Open'},
      {label: '4° Cell 4', value: '3 Open'},
      {label: '2° Cell 2', value: '5 Open'},
      {label: '5° Molding', value: '2 Open'},
      {label: '3° Cell 5', value: '4 Open'},
      {label: '6° Line 1', value: '1 Open'},
    ],
    ai: [
      {accent: '#67D783', title: 'Recognition is trending above target', body: 'Quarterly recognition counts are improving across line leadership.\nRecommendation: replicate the Line 3 routine in adjacent teams.'},
      {accent: '#FF4D48', title: 'Overtime exposure rising', body: 'Two teams are close to weekly overtime limits.\nRecommendation: rebalance staffing before the evening shift starts.'},
    ],
    comments: [
      {author: 'Gracie Walker', body: 'Line leader staffing has been adjusted for the second shift.', date: 'Mar 18, 11:05', image: '/images/Gracie.png'},
      {author: 'James Miller', body: 'Open positions review is scheduled with supervisors today.', date: 'Mar 18, 08:35', image: '/images/James.png'},
    ],
  },
  'Blu.AI': {
    auditTitle: 'Blu.AI Recommendations',
    gauges: [
      {title: 'Actions Accepted', value: '92', target: 'Target: 90%'},
      {title: 'Risk Prediction Accuracy', value: '87', target: 'Target: 85%'},
    ],
    highRiskTitle: 'Active Signals',
    regions: [
      {label: '1° Delivery', value: '6 Signals'},
      {label: '4° Cost', value: '3 Signals'},
      {label: '2° Quality', value: '5 Signals'},
      {label: '5° People', value: '2 Signals'},
      {label: '3° Safety', value: '4 Signals'},
      {label: '6° Energy', value: '1 Signal'},
    ],
    ai: [
      {accent: '#67D783', title: 'Best recommendation adoption this week', body: 'Supervisors accepted most delivery and safety recommendations.\nRecommendation: prioritize the remaining open actions by risk.'},
      {accent: '#FF4D48', title: 'Two signals need confirmation', body: 'Quality and downtime alerts are pending owner validation.\nRecommendation: confirm status before the next shift entry.'},
    ],
    comments: [
      {author: 'Olivia Martin', body: 'Blu.AI recommendations were reviewed in the tier meeting.', date: 'Mar 18, 09:42', image: '/images/Olivia.png'},
      {author: 'John Joshua', body: 'The delivery signal has been accepted and assigned.', date: 'Mar 18, 07:18', image: '/images/John.png'},
    ],
  },
  Sustainability: {
    auditTitle: 'Sustainability Actions',
    gauges: [
      {title: 'Water Reduction', value: '82', target: 'Target: 80%'},
      {title: 'GHG Reduction', value: '79', target: 'Target: 80%'},
    ],
    highRiskTitle: 'Resource Hotspots',
    regions: [
      {label: '1° Unit 02', value: '6 Trends'},
      {label: '4° Unit 01', value: '3 Trends'},
      {label: '2° Unit 05', value: '5 Trends'},
      {label: '5° Unit 03', value: '2 Trends'},
      {label: '3° Unit 04', value: '4 Trends'},
      {label: '6° Unit 06', value: '1 Trend'},
    ],
    ai: [
      {accent: '#67D783', title: 'Water usage stabilized', body: 'Water consumption is within the expected operating window.\nRecommendation: continue shift-level checks on high-volume lines.'},
      {accent: '#FF4D48', title: 'Waste trend needs attention', body: 'Waste per 1k units increased in one unit this week.\nRecommendation: review scrap separation and disposal frequency.'},
    ],
    comments: [
      {author: 'Maria Pinna', body: 'Energy consumption actions are ready for the weekly review.', date: 'Mar 18, 09:12', image: '/images/Maria.png'},
      {author: 'Madison Lee', body: 'Waste trend checks were added to the afternoon shift notes.', date: 'Mar 18, 07:40', image: '/images/Madison.png'},
    ],
  },
};

function DrillCard({
  actionLabel,
  children,
  cardSx,
  showExpand = false,
  title,
}: {
  actionLabel?: string;
  children: React.ReactNode;
  cardSx?: Record<string, unknown>;
  showExpand?: boolean;
  title: string;
}) {
  return (
    <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '12px', p: 2, boxShadow: 'none', minHeight: 0, overflow: 'hidden', position: 'relative', ...cardSx}}>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.7}}>
        <Typography sx={{fontSize: 20, fontWeight: 800, color: '#F7FAFF', lineHeight: 1.1}}>{title}</Typography>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.35, color: '#AAB4C5'}}>
          {actionLabel ? <Typography sx={{fontSize: 16, color: '#C4CAD5'}}>{actionLabel}</Typography> : null}
          {actionLabel ? <ArrowDropDownIcon sx={{fontSize: 18}} /> : null}
          <IconButton size="small" sx={sectionHeaderActionSx}>
            <SparkleIcon sx={{fontSize: 22, color: '#365A8E'}} />
          </IconButton>
          {showExpand ? (
            <IconButton size="small" sx={{...sectionHeaderActionSx, color: '#3988FF'}}>
              <OpenInFullIcon sx={{fontSize: 17}} />
            </IconButton>
          ) : null}
        </Box>
      </Box>
      {children}
    </Paper>
  );
}

function DrillGaugeCard({target, title, value}: {target: string; title: string; value: string}) {
  return (
    <DrillCard actionLabel="Yearly" title={title}>
      <Box sx={{height: 122, display: 'grid', placeItems: 'center', mt: -0.4}}>
        <Box sx={{position: 'relative', width: 232, height: 124}}>
          <Box sx={{position: 'absolute', inset: '0 0 auto 0', height: 116, borderRadius: '116px 116px 0 0', background: 'conic-gradient(from 270deg at 50% 100%, #B53B46 0deg, #B07A1E 36deg, #49C05B 44deg, #49C05B 149deg, #2C3546 151deg, #2C3546 180deg, transparent 180deg)', clipPath: 'inset(0 0 0 0 round 116px 116px 0 0)'}} />
          <Box sx={{position: 'absolute', left: 12, right: 12, bottom: 0, height: 104, borderRadius: '104px 104px 0 0', bgcolor: '#222C3B'}} />
          <Typography sx={{position: 'absolute', left: 0, right: 0, top: 48, textAlign: 'center', fontSize: 38, color: '#FFFFFF', fontWeight: 400, lineHeight: 1}}>
            {value}<Typography component="span" sx={{fontSize: 17, color: '#CFD5E1', ml: 0.6}}>%</Typography>
          </Typography>
          <Typography sx={{position: 'absolute', left: 0, right: 0, top: 92, textAlign: 'center', fontSize: 14, color: '#54D76D'}}>{target}</Typography>
        </Box>
      </Box>
    </DrillCard>
  );
}

function HighRiskRegionsCard({title, rows}: {rows: Array<{label: string; value: string}>; title: string}) {
  return (
    <DrillCard actionLabel="Yearly" title={title}>
      <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.8}}>
        {rows.map((row) => (
          <Box key={`${row.label}-${row.value}`} sx={{height: 38, px: 1, borderRadius: '4px', bgcolor: '#34404F', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
            <Typography sx={{fontSize: 15, color: '#F1F5FB', whiteSpace: 'nowrap'}}>{row.label}</Typography>
            <Box sx={{px: 0.7, py: 0.35, borderRadius: '3px', bgcolor: '#FF4D48', color: '#FFFFFF', fontSize: 12, fontWeight: 900, whiteSpace: 'nowrap'}}>{row.value}</Box>
          </Box>
        ))}
      </Box>
    </DrillCard>
  );
}

const auditRows = [
  ['A8932001', 'Mar 17, 2026', 'Implement corrective actions a...', 'Line 1', 'Madison...', 'John Smith', 'Mar 18, 2026', 'High', 'OPEN'],
  ['A8932002', 'Mar 16, 2026', 'Conduct staff training on com...', 'Line 3', 'Madison...', 'James Miller', 'Mar 17, 2026', 'Medium', 'UNDER REVIEW'],
  ['A8932003', 'Mar 17, 2026', 'Review and update quality con...', 'Line 2', 'John Smith', 'Olivia Martin', 'Mar 17, 2026', 'Low', 'COMPLETED'],
  ['A8932005', 'Mar 14, 2026', 'Schedule maintenance for equi...', 'Line 3', 'John Smith', 'Gracie Walk...', 'Mar 16, 2026', 'Low', 'CANCELED'],
];

function StatusPill({status}: {status: string}) {
  const color = status === 'OPEN' ? '#3B82FF' : status === 'UNDER REVIEW' ? '#FFB23C' : status === 'COMPLETED' ? '#82D889' : '#687384';

  return (
    <Box sx={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 48, height: 18, px: 1, borderRadius: '999px', bgcolor: color, color: status === 'UNDER REVIEW' ? '#111827' : '#FFFFFF', fontSize: 9, fontWeight: 900}}>
      {status}
    </Box>
  );
}

function AuditFindingsCard({title}: {title: string}) {
  return (
    <DrillCard actionLabel="Yearly" cardSx={{display: 'flex', flexDirection: 'column'}} title={title}>
      <Box sx={{display: 'flex', gap: 1, mb: 2}}>
        <Box sx={{height: 40, flex: '0 1 512px', border: '1px solid #566275', borderRadius: '12px', display: 'flex', alignItems: 'center', px: 1.2, color: '#AAB4C5'}}>
          <Typography sx={{fontSize: 16, flex: 1}}>Search...</Typography>
          <SearchIcon sx={{fontSize: 23, color: '#3485FF'}} />
        </Box>
        <Box sx={{height: 40, px: 1.5, border: '1px solid #397FEB', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 0.8, color: '#3F8CFF', fontSize: 14, fontWeight: 800}}>
          <FilterListIcon sx={{fontSize: 18}} />
          FILTERS
        </Box>
      </Box>
      <Box sx={{display: 'grid', gridTemplateColumns: '88px 142px 1fr 90px 126px 142px 108px 92px 122px', alignItems: 'center', color: '#FFFFFF', fontSize: 13, fontWeight: 900, px: 1, pb: 1.2, columnGap: 0}}>
        {['ID', 'CREATION DA...', 'DESCRIPTION', 'LOCATION', 'CREATED BY', 'ASSIGNED TO', 'DUE DATE', 'PRIORITY', 'STATUS'].map((head, index) => (
          <Box key={head} sx={{height: 25, display: 'flex', alignItems: 'center', gap: 0.7, borderRight: index < 8 ? '1px solid rgba(214,224,242,0.34)' : 'none', pr: 1}}>
            {head}
            {index > 0 ? <Typography sx={{fontSize: 13, color: '#748095'}}>↕</Typography> : null}
          </Box>
        ))}
      </Box>
      <Box sx={{display: 'grid', gridAutoRows: '52px', minHeight: 0}}>
        {auditRows.map((row, rowIndex) => (
          <Box key={row[0]} sx={{display: 'grid', gridTemplateColumns: '88px 142px 1fr 90px 126px 142px 108px 92px 122px', alignItems: 'center', px: 1, bgcolor: rowIndex === 0 ? '#4A2D39' : rowIndex === 2 ? '#303B4A' : 'transparent', color: '#F4F7FC', fontSize: 14}}>
            {row.map((cell, index) => (
              <Box key={`${row[0]}-${index}`} sx={{minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 0.75}}>
                {index === 4 || index === 5 ? <Avatar src={index === 4 ? '/images/Madison.png' : '/images/John.png'} sx={{width: 24, height: 24}} /> : null}
                {index === 7 ? <Typography sx={{fontSize: 14, fontWeight: 800, color: cell === 'High' ? '#FFFFFF' : cell === 'Medium' ? '#FFB23C' : '#82D889'}}>{cell}</Typography> : index === 8 ? <StatusPill status={cell} /> : cell}
              </Box>
            ))}
          </Box>
        ))}
      </Box>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 1.2, color: '#FFFFFF'}}>
        <KeyboardArrowLeftIcon sx={{fontSize: 20, color: '#8E99AA'}} />
        <Box sx={{width: 26, height: 26, borderRadius: '50%', bgcolor: '#657080', display: 'grid', placeItems: 'center', fontSize: 13}}>1</Box>
        <Typography sx={{fontSize: 14}}>2</Typography>
        <KeyboardArrowRightIcon sx={{fontSize: 20}} />
      </Box>
    </DrillCard>
  );
}

function DrillAiCard({items}: {items: Array<{accent: string; body: string; title: string}>}) {
  return (
    <DrillCard cardSx={{display: 'flex', flexDirection: 'column'}} title="Blu.AI">
      <Box sx={{display: 'grid', gap: 1.2}}>
        {items.map((item) => (
          <Box key={item.title} sx={{minHeight: 84, borderRadius: '4px', bgcolor: '#34404F', borderLeft: `6px solid ${item.accent}`, px: 1.4, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2}}>
            <Box sx={{minWidth: 0}}>
              <Typography sx={{fontSize: 16, color: '#FFFFFF', mb: 0.8}}>{item.title}</Typography>
              {item.body.split('\n').map((line) => (
                <Typography key={line} sx={{fontSize: 14, color: '#BEC7D5', lineHeight: 1.45}}>{line}</Typography>
              ))}
            </Box>
            <Typography sx={{fontSize: 12, color: '#3D8BFF', fontWeight: 900, whiteSpace: 'nowrap'}}>SHOW MORE</Typography>
          </Box>
        ))}
      </Box>
    </DrillCard>
  );
}

function PlantOverviewDrillCard() {
  return (
    <DrillCard cardSx={{display: 'flex', flexDirection: 'column'}} showExpand title="Plant Overview">
      <Box sx={{flex: 1, minHeight: 0, borderRadius: '4px', overflow: 'hidden', bgcolor: '#E7ECF2'}}>
        <Box component="img" src="/images/3Dview.png" alt="Plant overview" sx={{width: '100%', height: '100%', display: 'block', objectFit: 'cover', filter: 'brightness(1.04) saturate(0.78)'}} />
      </Box>
    </DrillCard>
  );
}

const plantOverviewCells = [
  {label: 'Cell 07', left: '23.6%', top: '5.1%', pinLeft: '25.8%', pinTop: '23.3%', width: 214, status: 'ok', angle: 102, length: 96},
  {label: 'Cell 10', left: '51.8%', top: '1.8%', pinLeft: '53.6%', pinTop: '14%', width: 214, status: 'ok', angle: 112, length: 70},
  {label: 'Cell 09', left: '64.1%', top: '10.4%', pinLeft: '59.8%', pinTop: '20%', width: 214, status: 'ok', angle: -30, length: 64},
  {label: 'Cell 06', left: '33.9%', top: '17.8%', pinLeft: '36.1%', pinTop: '36.2%', width: 214, status: 'ok', angle: 102, length: 98},
  {label: 'Cell 08', left: '79.3%', top: '20.1%', pinLeft: '82%', pinTop: '31.3%', width: 214, status: 'ok', angle: 104, length: 64},
  {label: 'Cell 03', left: '3.2%', top: '35.5%', pinLeft: '27%', pinTop: '50.7%', width: 214, status: 'ok', angle: 38, length: 94},
  {label: 'Cell 05', left: '58.7%', top: '31%', pinLeft: '59.6%', pinTop: '43.7%', width: 214, status: 'alert', angle: 122, length: 69},
  {label: 'Cell 02', left: '7%', top: '55.5%', pinLeft: '30.6%', pinTop: '70.9%', width: 214, status: 'ok', angle: 38, length: 94},
  {label: 'Cell 04', left: '65.9%', top: '57.9%', pinLeft: '66.1%', pinTop: '69.9%', width: 214, status: 'ok', angle: 94, length: 66},
  {label: 'Cell 01', left: '26.5%', top: '75.7%', pinLeft: '50.2%', pinTop: '90.8%', width: 214, status: 'ok', angle: 38, length: 94},
] as const;

const plantOverviewEvents = [
  {type: 'Breakdown', time: '12 minutes ago', title: 'Cell 05, Line 10, Zone 01 - Bearing failure detected', alert: true},
  {type: 'Gemba Walk Deviation', time: '18 minutes ago', title: 'Cell 08, Line 01, Zone 09 - Missing 5S floor marking near buffer lane', alert: true},
  {type: 'Scrap', time: '25 minutes ago', title: 'Cell 09, Line 02, Zone 11 - Scrap rate reduced after material adjustment', alert: false},
  {type: 'Gemba Walk Deviation', time: '34 minutes ago', title: 'Cell 04, Line 12, Zone 05 - Guardrail access blocked by material staging', alert: true},
  {type: 'Production Output', time: '40 minutes ago', title: 'Cell 02, Line 06, Zone 01 - Daily production target achieved ahead of schedule', alert: false},
  {type: 'Gemba Walk Deviation', time: '45 minutes ago', title: 'Cell 10, Line 04, Zone 03 - PPE station not replenished after shift start', alert: true},
] as const;

const plantOverviewGembaDeviationTotal = plantOverviewEvents.filter((event) => event.type === 'Gemba Walk Deviation').length;

function PlantMapCallout({cell}: {cell: (typeof plantOverviewCells)[number]}) {
  const isAlert = cell.status === 'alert';

  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          left: cell.pinLeft,
          top: cell.pinTop,
          width: 9,
          height: 9,
          borderRadius: '50%',
          bgcolor: isAlert ? '#FF5A55' : '#76D887',
          transform: 'translate(-50%, -50%)',
          boxShadow: isAlert ? '0 0 0 5px rgba(255,90,85,0.16)' : '0 0 0 5px rgba(118,216,135,0.16)',
          zIndex: 4,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: cell.pinLeft,
          top: cell.pinTop,
          width: cell.length,
          height: 2,
          bgcolor: isAlert ? '#FF5A55' : '#76D887',
          transformOrigin: '0 50%',
          transform: `rotate(${cell.angle}deg)`,
          opacity: 0.86,
          zIndex: 3,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: cell.left,
          top: cell.top,
          width: cell.width,
          height: 50,
          borderRadius: '8px',
          bgcolor: '#111827',
          border: `1px solid ${isAlert ? '#FF5A55' : '#5BCB72'}`,
          boxShadow: '0 14px 28px rgba(0,0,0,0.28)',
          display: 'flex',
          alignItems: 'center',
          px: 1.6,
          gap: 1,
          zIndex: 5,
        }}
      >
        {isAlert ? (
          <ReportProblemIcon sx={{fontSize: 18, color: '#FF6761'}} />
        ) : (
          <CheckCircleOutlineIcon sx={{fontSize: 18, color: '#76D887'}} />
        )}
        <Typography sx={{fontSize: 14, fontWeight: 900, color: '#FFFFFF'}}>{cell.label}</Typography>
      </Box>
    </>
  );
}

function PlantOverviewDrilldownScreen({
  onBack,
  ...headerProps
}: ControlTowerScreenProps & {
  onBack: () => void;
}) {
  return (
    <Box sx={{height: '100dvh', minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#07101E', overflow: 'hidden'}}>
      <TowerHeader {...headerProps} />
      <Box sx={{flex: 1, minHeight: 0, px: 3.8, pt: 1.8, pb: 1.9, bgcolor: '#07101E', overflow: 'hidden'}}>
        <Box sx={{height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'}}>
          <Box sx={{height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, mb: 1.2}}>
            <Box onClick={onBack} sx={{display: 'flex', alignItems: 'center', gap: 0.45, cursor: 'pointer'}}>
              <Typography sx={{fontSize: 16, fontWeight: 800, color: '#8A92A1'}}>Control Tower /</Typography>
              <Typography sx={{fontSize: 16, fontWeight: 900, color: '#FFFFFF'}}>Plant Overview</Typography>
            </Box>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 2.4, color: '#FFFFFF'}}>
              {['All', 'Yearly'].map((label) => (
                <Box key={label} sx={{display: 'flex', alignItems: 'center', gap: 0.25}}>
                  <Typography sx={{fontSize: 14, color: '#F4F7FB'}}>{label}</Typography>
                  <ArrowDropDownIcon sx={{fontSize: 18, color: '#8D98AB'}} />
                </Box>
              ))}
            </Box>
          </Box>

          <Paper elevation={0} sx={{...pageShellSx, flex: 1, minHeight: 0, borderRadius: '8px', p: 1.6, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 374px', gap: 2.4}}>
            <Box sx={{position: 'relative', minHeight: 0, overflow: 'hidden', bgcolor: '#DCE5EF'}}>
              <Box component="img" src="/images/site-view.png" alt="Plant overview" sx={{display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center'}} />
              <Box sx={{position: 'absolute', left: '36.5%', top: '37.2%', width: '30%', height: '24%', bgcolor: 'rgba(255,82,82,0.34)', border: '1px solid rgba(255,93,93,0.55)', transform: 'skewY(-24deg) rotate(-1deg)', transformOrigin: '50% 50%', zIndex: 2}} />
              <Box sx={{position: 'absolute', left: 29, top: 25, height: 54, px: 1.8, borderRadius: '8px', bgcolor: '#070F22', color: '#FFFFFF', display: 'flex', alignItems: 'center', fontSize: 16, fontWeight: 900, boxShadow: '0 10px 20px rgba(0,0,0,0.34)', zIndex: 6}}>Plant</Box>
              <Box sx={{position: 'absolute', right: 32, top: 28, height: 48, px: 1.5, borderRadius: '8px', bgcolor: '#070F22', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 0.5, boxShadow: '0 10px 20px rgba(0,0,0,0.34)', zIndex: 6}}>
                <Typography sx={{fontSize: 13, fontWeight: 900}}>Filter:</Typography>
                <Typography sx={{fontSize: 13, fontWeight: 800, color: '#C9D2DF'}}>All</Typography>
                <ArrowDropDownIcon sx={{fontSize: 17, color: '#8D98AB'}} />
              </Box>
              {plantOverviewCells.map((cell) => <PlantMapCallout key={cell.label} cell={cell} />)}
              <IconButton sx={{position: 'absolute', right: 34, bottom: 29, width: 32, height: 32, borderRadius: '9px', bgcolor: '#111827', color: '#FFFFFF', zIndex: 6, '&:hover': {bgcolor: '#172033'}}}>
                <SettingsIcon sx={{fontSize: 17}} />
              </IconButton>
            </Box>

            <Box sx={{minHeight: 0, display: 'grid', gridTemplateRows: 'minmax(0, 1fr) 109px 181px', gap: 1.4}}>
              <Box sx={{bgcolor: '#202B3A', borderRadius: '8px', p: 1.1, minHeight: 0, overflow: 'hidden'}}>
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.15}}>
                  <Box sx={{display: 'flex', alignItems: 'baseline', gap: 1.2}}>
                    <Typography sx={{fontSize: 16, fontWeight: 900, color: '#FFFFFF'}}>Plant Overview</Typography>
                    <Typography sx={{fontSize: 10, color: '#AEB7C5'}}>1010-PRD-AUT-AFA10</Typography>
                  </Box>
                  <SparkleIcon sx={{fontSize: 18, color: '#2478FF'}} />
                </Box>
                <Box sx={{bgcolor: '#2A3443', borderRadius: '8px', p: 1, height: 'calc(100% - 32px)', minHeight: 0, overflow: 'hidden'}}>
                  <Typography sx={{fontSize: 13, fontWeight: 900, color: '#EAF0F9', mb: 1}}>Event Log</Typography>
                  <Box sx={{position: 'relative', display: 'grid', gap: 0.75, pr: 1.4, maxHeight: 'calc(100% - 24px)', overflow: 'hidden'}}>
                    {plantOverviewEvents.map((event) => (
                      <Box key={`${event.type}-${event.time}`} sx={{minHeight: 52, borderRadius: '3px', border: `1px solid ${event.alert ? '#9E3B43' : '#3C7655'}`, bgcolor: event.alert ? '#383F4B' : '#303B47', display: 'grid', gridTemplateColumns: '24px minmax(0, 1fr)', alignItems: 'center', gap: 0.6, px: 1}}>
                        {event.alert ? <ReportProblemIcon sx={{fontSize: 17, color: '#FF504C'}} /> : <CheckCircleOutlineIcon sx={{fontSize: 17, color: '#69D37A'}} />}
                        <Box sx={{minWidth: 0}}>
                          <Typography sx={{fontSize: 10, color: '#AEB7C5', mb: 0.35}}>{event.type} - {event.time}</Typography>
                          <Typography sx={{fontSize: 11.6, lineHeight: 1.32, color: '#F4F7FC', fontWeight: 800}}>{event.title}</Typography>
                        </Box>
                      </Box>
                    ))}
                    <Box sx={{position: 'absolute', right: 0, top: 3, width: 5, height: 39, borderRadius: '999px', bgcolor: '#2C7DFF'}} />
                  </Box>
                </Box>
              </Box>

              <Box sx={{bgcolor: '#202B3A', borderRadius: '8px', p: 1.1}}>
                <Typography sx={{fontSize: 13, color: '#EAF0F9', fontWeight: 900, mb: 1.2}}>Top Impacts</Typography>
                <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1.02fr 1fr', gap: 0.75}}>
                  {[
                    {value: '-18%', label: 'Production Impact', tone: '#8D2634'},
                    {value: String(plantOverviewGembaDeviationTotal), label: 'Gemba Deviations', tone: '#9C2230'},
                    {value: '2', label: 'Orders at Risk', tone: '#303B49'},
                  ].map((item) => (
                    <Box key={item.label} sx={{height: 55, borderRadius: '4px', bgcolor: item.tone, px: 0.9, py: 0.75, borderLeft: item.label === 'Production Impact' ? '4px solid #FF4F4B' : 'none'}}>
                      <Typography sx={{fontSize: 29, lineHeight: 0.92, color: '#FFFFFF', fontWeight: 300}}>{item.value}</Typography>
                      <Typography sx={{fontSize: 9.4, color: '#F2F5FA'}}>{item.label}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box sx={{bgcolor: '#202B3A', borderRadius: '8px', p: 1.1}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.65, mb: 1.1}}>
                  <SparkleIcon sx={{fontSize: 18, color: '#F59E0B'}} />
                  <Typography sx={{fontSize: 16, fontWeight: 900, color: '#1F74FF', letterSpacing: 0.4}}>BLU.AI INSIGHTS</Typography>
                </Box>
                <Box sx={{borderRadius: '8px', bgcolor: '#303B49', px: 1.3, py: 1.15}}>
                  <Typography sx={{fontSize: 11.7, lineHeight: 1.45, color: '#F5F7FB', mb: 1.25}}>
                    The Z1 feeder is the main risk, with an active breakdown on Line 10 (Zone 5) and early degradation across other lines.
                  </Typography>
                  <Typography sx={{fontSize: 11.5, lineHeight: 1.4, color: '#F5F7FB'}}>
                    <Box component="span" sx={{fontWeight: 900}}>Recommended action:</Box> Prioritize recovery of the Z1 feeder (Line 10, Zone 5) and monitor adjacent lines.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

function CommentsDrillCard({comments}: {comments: Array<{author: string; body: string; date: string; image: string}>}) {
  return (
    <DrillCard cardSx={{display: 'flex', flexDirection: 'column'}} title="Comments">
      <Box sx={{position: 'absolute', right: 28, mt: -43, color: '#AAB4C5'}}>
        <ExpandMoreIcon />
      </Box>
      <Box sx={{display: 'grid', gap: 1.1}}>
        {comments.map((comment) => (
          <Box key={comment.body} sx={{borderRadius: '10px', bgcolor: '#34404F', px: 1.4, py: 1.2}}>
            <Typography sx={{fontSize: 14.5, color: '#FFFFFF', lineHeight: 1.35, mb: 1.2}}>{comment.body}</Typography>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#AAB4C5'}}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
                <Avatar src={comment.image} sx={{width: 18, height: 18}} />
                <Typography sx={{fontSize: 12}}>{comment.author}</Typography>
              </Box>
              <Typography sx={{fontSize: 12}}>{comment.date}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
      <Box sx={{mt: 'auto', height: 40, border: '1px solid #3A86FF', borderRadius: '12px', display: 'flex', alignItems: 'center', px: 1.3, color: '#BBC5D3'}}>
        <Typography sx={{fontSize: 15, flex: 1}}>Leave a comment</Typography>
        <SendIcon sx={{fontSize: 28, color: '#3B82FF'}} />
      </Box>
    </DrillCard>
  );
}

function ControlTowerDrilldownScreen({
  kind,
  onBack,
  ...headerProps
}: ControlTowerScreenProps & {
  kind: GenericDrilldownKind;
  onBack: () => void;
}) {
  const copy = drilldownCopy[kind];

  return (
    <Box sx={{height: '100dvh', minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#09111F', overflow: 'hidden'}}>
      <TowerHeader {...headerProps} />
      <Box sx={{flex: 1, minHeight: 0, px: 5, pt: 2.2, pb: 2, bgcolor: '#09111F', overflow: 'hidden'}}>
        <Box sx={{height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'}}>
          <Box sx={{height: 46, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0}}>
            <Box onClick={onBack} sx={{display: 'flex', alignItems: 'center', gap: 0.45, cursor: 'pointer'}}>
              <Typography sx={{fontSize: 20, fontWeight: 800, color: '#8A92A1'}}>Control Tower /</Typography>
              <Typography sx={{fontSize: 20, fontWeight: 800, color: '#FFFFFF'}}>{kind} Drilldown</Typography>
            </Box>
            <Box component="button" sx={{border: 0, height: 36, px: 2, borderRadius: '11px', bgcolor: '#3B82FF', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 0.8, fontSize: 12, fontWeight: 900, letterSpacing: 0.3, cursor: 'pointer'}}>
              <EditIcon sx={{fontSize: 18}} />
              EDIT WIGETS
            </Box>
          </Box>

          <Paper elevation={0} sx={{...pageShellSx, flex: 1, minHeight: 0, p: 1.5, display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(360px, 1.05fr)', gap: 1.2}}>
            <Box sx={{minHeight: 0, display: 'grid', gridTemplateRows: 'minmax(0, 0.72fr) minmax(0, 1.55fr) minmax(0, 1fr)', gap: 1.1}}>
              <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.1, minHeight: 0}}>
                <DrillGaugeCard {...copy.gauges[0]} />
                <DrillGaugeCard {...copy.gauges[1]} />
                <HighRiskRegionsCard rows={copy.regions} title={copy.highRiskTitle} />
              </Box>
              <AuditFindingsCard title={copy.auditTitle} />
              <DrillAiCard items={copy.ai} />
            </Box>

            <Box sx={{minHeight: 0, display: 'grid', gridTemplateRows: 'minmax(0, 1fr) minmax(0, 1.08fr)', gap: 1.1}}>
              <PlantOverviewDrillCard />
              <CommentsDrillCard comments={copy.comments} />
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

function PeopleDrilldownScreen({
  onBack,
  ...headerProps
}: ControlTowerScreenProps & {
  onBack: () => void;
}) {
  const staffingRows = [
    ['Unit 1', '2 Lines', '22', '20', '-2', 'Setup Operator', 'Output Risk', 'WARNING'],
    ['Unit 2', '2 Lines', '12', '10', '-2', 'Setup Operator', 'Output Risk', 'WARNING'],
    ['Unit 3', '2 Lines', '10', '10', '0', '-', 'No Impact', 'ON TRACK'],
  ];

  const peopleComments = [
    {
      author: 'Maria Pinna',
      body: 'Allocated 2 backup operator floaters to Shift C (Molding) to cover the critical technician gap during key production hours.',
      date: 'Mar 18, 09:20',
      image: '/images/Maria.png',
    },
    {
      author: 'John Joshua',
      body: 'Shift coverage rate bumped to 92.5% this week. Training compliance is also holding strong near our 90% team milestone.',
      date: 'Mar 18, 07:32',
      image: '/images/John.png',
    },
  ];

  return (
    <Box sx={{height: '100dvh', minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#09111F', overflow: 'hidden'}}>
      <TowerHeader {...headerProps} />
      <Box sx={{flex: 1, minHeight: 0, px: 5, pt: 2.2, pb: 2, bgcolor: '#09111F', overflow: 'hidden'}}>
        <Box sx={{height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'}}>
          <Box sx={{height: 46, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0}}>
            <Box onClick={onBack} sx={{display: 'flex', alignItems: 'center', gap: 0.45, cursor: 'pointer'}}>
              <Typography sx={{fontSize: 20, fontWeight: 800, color: '#8A92A1'}}>Control Tower /</Typography>
              <Typography sx={{fontSize: 20, fontWeight: 800, color: '#FFFFFF'}}>People Drilldown</Typography>
            </Box>
            <Box component="button" sx={{border: 0, height: 36, px: 2, borderRadius: '11px', bgcolor: '#3B82FF', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 0.8, fontSize: 12, fontWeight: 900, letterSpacing: 0.3, cursor: 'pointer'}}>
              <EditIcon sx={{fontSize: 18}} />
              EDIT WIGETS
            </Box>
          </Box>

          <Paper elevation={0} sx={{...pageShellSx, flex: 1, minHeight: 0, p: 1.5, display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(360px, 1.05fr)', gap: 1.2}}>
            <Box sx={{minHeight: 0, display: 'grid', gridTemplateRows: '208px minmax(0, 1.45fr) 256px', gap: 1.1}}>
              <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.1, minHeight: 0}}>
                <DrillGaugeCard target="Target: 95%" title="Shift Coverage Rate" value="92.5" />
                <DrillGaugeCard target="Target: 90%" title="Training Compliance Rate" value="88" />
                <DrillCard cardSx={{border: '1px solid rgba(103,118,146,0.42)'}} title="Average Lead Time">
                  <Box sx={{display: 'grid', gap: 0.9}}>
                    <Box sx={{height: 60, borderRadius: '4px', bgcolor: '#34404F', borderLeft: '5px solid #67D783', px: 1.1, py: 0.8}}>
                      <Typography sx={{fontSize: 25, color: '#FFFFFF', lineHeight: 1}}>2.350</Typography>
                      <Typography sx={{fontSize: 14, color: '#FFFFFF'}}>Active Headcount</Typography>
                    </Box>
                    <Box sx={{height: 60, borderRadius: '4px', bgcolor: '#34404F', borderLeft: '5px solid #FF4D48', px: 1.1, py: 0.8}}>
                      <Typography sx={{fontSize: 25, color: '#FF4D48', lineHeight: 1}}>10</Typography>
                      <Typography sx={{fontSize: 14, color: '#FF4D48'}}>Open Vacancies</Typography>
                    </Box>
                  </Box>
                </DrillCard>
              </Box>

              <DrillCard actionLabel="Yearly" cardSx={{display: 'flex', flexDirection: 'column'}} title="Staffing Gaps By Unit & Line/Cell">
                <Box sx={{display: 'flex', gap: 1, mb: 1.6}}>
                  <Box sx={{height: 40, flex: '0 1 512px', border: '1px solid #566275', borderRadius: '12px', display: 'flex', alignItems: 'center', px: 1.2, color: '#AAB4C5'}}>
                    <Typography sx={{fontSize: 16, flex: 1}}>Search...</Typography>
                    <SearchIcon sx={{fontSize: 23, color: '#3485FF'}} />
                  </Box>
                  <Box sx={{height: 40, px: 1.5, border: '1px solid #397FEB', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 0.8, color: '#3F8CFF', fontSize: 14, fontWeight: 800}}>
                    <FilterListIcon sx={{fontSize: 18}} />
                    FILTERS
                  </Box>
                </Box>

                <Box sx={{display: 'flex', alignItems: 'center', gap: 3.2, mb: 2}}>
                  {['ALL', 'SHIFT A', 'SHIFT B', 'SHIFT C'].map((tab, index) => (
                    <Typography key={tab} sx={{pb: 1.1, borderBottom: index === 0 ? '2px solid #2F83FF' : '2px solid transparent', color: index === 0 ? '#2F83FF' : '#C6CEDA', fontSize: 13, fontWeight: 800, letterSpacing: 0.4}}>{tab}</Typography>
                  ))}
                </Box>

                <Box sx={{display: 'grid', gridTemplateColumns: '146px 118px 132px 150px 104px 212px 148px 110px', color: '#FFFFFF', fontSize: 14, fontWeight: 900, px: 1, pb: 1.2, borderBottom: '1px solid rgba(255,255,255,0.08)'}}>
                  {['UNIT/LINE', 'SHIFT', 'REQUIRED HC', 'AVAILABLE HC', 'GAP', 'CRITICAL ROLE MISSING', 'IMPACT', 'OEE STATUS'].map((head) => (
                    <Box key={head} sx={{borderRight: '1px solid rgba(214,224,242,0.34)', pr: 1}}>{head}</Box>
                  ))}
                </Box>

                <Box sx={{display: 'grid', gridAutoRows: '52px'}}>
                  {staffingRows.map((row, rowIndex) => (
                    <Box key={row[0]} sx={{display: 'grid', gridTemplateColumns: '146px 118px 132px 150px 104px 212px 148px 110px', alignItems: 'center', px: 1, bgcolor: rowIndex === 1 ? '#364250' : 'transparent', color: '#FFFFFF', fontSize: 14}}>
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 1.2}}>
                        <KeyboardArrowRightIcon sx={{fontSize: 20, color: '#AAB4C5'}} />
                        <Typography sx={{fontSize: 16}}>{row[0]}</Typography>
                      </Box>
                      <Typography sx={{fontSize: 14}}>{row[1]}</Typography>
                      <Typography sx={{fontSize: 14}}>{row[2]}</Typography>
                      <Typography sx={{fontSize: 14}}>{row[3]}</Typography>
                      <Typography sx={{fontSize: 14, color: row[4] === '0' ? '#48D16A' : '#FF3333'}}>{row[4]}</Typography>
                      <Typography sx={{fontSize: 14}}>{row[5]}</Typography>
                      <Typography sx={{fontSize: 14}}>{row[6]}</Typography>
                      <DeliverySmallStatus tone={row[7] === 'ON TRACK' ? 'green' : 'orange'}>{row[7]}</DeliverySmallStatus>
                    </Box>
                  ))}
                </Box>

                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 1.2, color: '#FFFFFF'}}>
                  <KeyboardArrowLeftIcon sx={{fontSize: 20, color: '#8E99AA'}} />
                  <Box sx={{width: 26, height: 26, borderRadius: '50%', bgcolor: '#657080', display: 'grid', placeItems: 'center', fontSize: 13}}>1</Box>
                  <Typography sx={{fontSize: 14}}>2</Typography>
                  <KeyboardArrowRightIcon sx={{fontSize: 20}} />
                </Box>
              </DrillCard>

              <DrillAiCard
                items={[
                  {
                    accent: '#22AFFF',
                    title: 'Planned setup training cycle due tomorrow',
                    body: 'Shift A has scheduled machine calibration safety training for 4 line trainees.\nRecommendation: coordinate with operations lead to ensure training compliance rises to target of 90.0% without breaking minimum line run counts.',
                  },
                  {
                    accent: '#FF4D48',
                    title: 'Critical technician shortage detected in shift C',
                    body: 'Current headcount availability in Molding is at -3 gaps, triggering a potential downtime risk\nRecommendation: cross-assign temporary floaters from Packaging to Molding or allocate setup operators to handle high frequency adjustments.',
                  },
                ]}
              />
            </Box>

            <Box sx={{minHeight: 0, display: 'grid', gridTemplateRows: 'minmax(0, 1fr) minmax(0, 1.08fr)', gap: 1.1}}>
              <PlantOverviewDrillCard />
              <CommentsDrillCard comments={peopleComments} />
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

function DeliverySmallStatus({children, tone = 'blue'}: {children: React.ReactNode; tone?: 'blue' | 'green' | 'orange'}) {
  const colors = {
    blue: {bg: '#3B82FF', color: '#FFFFFF'},
    green: {bg: '#82D889', color: '#0F2718'},
    orange: {bg: '#FFAE33', color: '#111827'},
  }[tone];

  return (
    <Box sx={{height: 18, px: 1, borderRadius: '999px', bgcolor: colors.bg, color: colors.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, whiteSpace: 'nowrap'}}>
      {children}
    </Box>
  );
}

function DeliveryAddWidget({wide = false}: {wide?: boolean}) {
  return (
    <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '12px', minHeight: 0, display: 'grid', placeItems: 'center'}}>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, color: '#3B82FF', fontSize: 16, letterSpacing: 0.8}}>
        <Typography sx={{fontSize: wide ? 28 : 24, lineHeight: 1}}>+</Typography>
        <Typography sx={{fontSize: 14, letterSpacing: 1}}>ADD WIDGET</Typography>
      </Box>
    </Paper>
  );
}

function DeliveryDrilldownScreen({
  onBack,
  ...headerProps
}: ControlTowerScreenProps & {
  onBack: () => void;
}) {
  const planningRows = [
    ['PO-2026-901', 'Production: Assemble Automotive S...', 'Line 1', 'Assy Robot R1', 'PRODUCTION', 'Active - Ends today', '96.4%', 'RUNNING'],
    ['PO-2026-902', 'Production: Medical Syringe SKU-M12', 'Line 2', 'Molding Cell M3', 'PRODUCTION', 'Active - 65% completed', '91.2%', 'RUNNING'],
    ['PO-2026-903', 'Production: Aerospace Tube SKU-A02', 'Line 4', 'Bending Cell B2', 'PRODUCTION', 'Starts May 23, 08h00', 'Planned', 'PENDING'],
  ];

  return (
    <Box sx={{height: '100dvh', minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#09111F', overflow: 'hidden'}}>
      <TowerHeader {...headerProps} />
      <Box sx={{flex: 1, minHeight: 0, px: 5, pt: 2.2, pb: 2, bgcolor: '#09111F', overflow: 'hidden'}}>
        <Box sx={{height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'}}>
          <Box sx={{height: 46, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0}}>
            <Box onClick={onBack} sx={{display: 'flex', alignItems: 'center', gap: 0.45, cursor: 'pointer'}}>
              <Typography sx={{fontSize: 20, fontWeight: 800, color: '#8A92A1'}}>Control Tower /</Typography>
              <Typography sx={{fontSize: 20, fontWeight: 800, color: '#FFFFFF'}}>Delivery Drilldown</Typography>
            </Box>
            <Box component="button" sx={{border: 0, height: 36, px: 2, borderRadius: '11px', bgcolor: '#3B82FF', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 0.8, fontSize: 12, fontWeight: 900, letterSpacing: 0.3, cursor: 'pointer'}}>
              <EditIcon sx={{fontSize: 18}} />
              EDIT WIGETS
            </Box>
          </Box>

          <Paper elevation={0} sx={{...pageShellSx, flex: 1, minHeight: 0, p: 1.5, display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(360px, 1.05fr)', gap: 1.2}}>
            <Box sx={{minHeight: 0, display: 'grid', gridTemplateRows: '208px minmax(0, 1.6fr) 256px', gap: 1.1}}>
              <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.1, minHeight: 0}}>
                <DrillCard cardSx={{display: 'flex', flexDirection: 'column'}} title="Delivery Backlog">
                  <Box sx={{display: 'grid', gap: 0.55}}>
                    {[
                      ['1° PO-2026-905', '(Line 1)', 'In Queue', 'blue'],
                      ['2° PO-2026-908', '(Cell 3)', 'In Queue', 'blue'],
                      ['3° PO-2026-912', '(L4 setup)', 'Awaiting Material', 'orange'],
                      ['4° PO-2026-915', '(Molding)', 'In Queue', 'blue'],
                    ].map(([order, meta, status, tone]) => (
                      <Box key={order} sx={{height: 28, px: 0.85, borderRadius: '3px', bgcolor: '#34404F', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.65, minWidth: 0}}>
                          <Typography sx={{fontSize: 14, color: '#AEB8C7'}}>{order}</Typography>
                          <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 800}}>{meta}</Typography>
                        </Box>
                        <DeliverySmallStatus tone={tone === 'orange' ? 'orange' : 'blue'}>{status}</DeliverySmallStatus>
                      </Box>
                    ))}
                  </Box>
                </DrillCard>

                <DrillCard actionLabel="Yearly" title="Scheduled Changeovers">
                  <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.6}}>
                    {[
                      ['Line 1', 'SKU-C10', '1.2h'],
                      ['Cell 3', 'SKU-E44', '1.1h'],
                      ['Molding', 'SKU-M12', '0.8h'],
                      ['Line 2', 'SKU-H01', '0.7h'],
                      ['Cell 5', 'SKU-A02', '1.5h'],
                      ['Line 3', 'SKU-B11', '0.9h'],
                    ].map(([area, sku, time]) => (
                      <Box key={`${area}-${sku}`} sx={{height: 42, px: 0.75, py: 0.45, borderRadius: '3px', bgcolor: '#34404F', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Box>
                          <Typography sx={{fontSize: 11, color: '#BBC4D2'}}>{area}</Typography>
                          <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 800}}>{sku}</Typography>
                        </Box>
                        <Box sx={{px: 0.55, py: 0.22, borderRadius: '2px', bgcolor: '#162031', color: '#FFFFFF', fontSize: 11, fontWeight: 900}}>{time}</Box>
                      </Box>
                    ))}
                  </Box>
                </DrillCard>

                <DrillCard actionLabel="Yearly" title="Sched. Adher.">
                  <Box sx={{height: 132, display: 'grid', placeItems: 'center', mt: -0.8}}>
                    <Box sx={{position: 'relative', width: 232, height: 124}}>
                      <Box sx={{position: 'absolute', inset: '0 0 auto 0', height: 116, borderRadius: '116px 116px 0 0', background: 'conic-gradient(from 270deg at 50% 100%, #B53B46 0deg, #B07A1E 34deg, #49C05B 42deg, #49C05B 160deg, #2C3546 162deg, #2C3546 180deg, transparent 180deg)'}} />
                      <Box sx={{position: 'absolute', left: 12, right: 12, bottom: 0, height: 104, borderRadius: '104px 104px 0 0', bgcolor: '#222C3B'}} />
                      <Typography sx={{position: 'absolute', left: 0, right: 0, top: 48, textAlign: 'center', fontSize: 38, color: '#FFFFFF', fontWeight: 400, lineHeight: 1}}>
                        98.2<Typography component="span" sx={{fontSize: 17, color: '#CFD5E1', ml: 0.6}}>%</Typography>
                      </Typography>
                      <Typography sx={{position: 'absolute', left: 0, right: 0, top: 92, textAlign: 'center', fontSize: 14, color: '#54D76D'}}>Target: 96%</Typography>
                    </Box>
                  </Box>
                </DrillCard>
              </Box>

              <DrillCard actionLabel="Yearly" cardSx={{display: 'flex', flexDirection: 'column'}} title="Weekly Planning">
                <Box sx={{display: 'flex', gap: 1, mb: 1.6}}>
                  <Box sx={{height: 40, flex: '0 1 512px', border: '1px solid #566275', borderRadius: '12px', display: 'flex', alignItems: 'center', px: 1.2, color: '#AAB4C5'}}>
                    <Typography sx={{fontSize: 16, flex: 1}}>Search...</Typography>
                    <SearchIcon sx={{fontSize: 23, color: '#3485FF'}} />
                  </Box>
                  <Box sx={{height: 40, px: 1.5, border: '1px solid #397FEB', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 0.8, color: '#3F8CFF', fontSize: 14, fontWeight: 800}}>
                    <FilterListIcon sx={{fontSize: 18}} />
                    FILTERS
                  </Box>
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 3.2, mb: 2}}>
                  {['ALL', 'PRODUCTION', 'CHANGEOVER', 'MAINTENANCE'].map((tab, index) => (
                    <Typography key={tab} sx={{pb: 1.1, borderBottom: index === 0 ? '2px solid #2F83FF' : '2px solid transparent', color: index === 0 ? '#2F83FF' : '#C6CEDA', fontSize: 13, fontWeight: 800, letterSpacing: 0.4}}>{tab}</Typography>
                  ))}
                </Box>
                <Box sx={{display: 'grid', gridTemplateColumns: '108px minmax(0, 1.7fr) 116px 178px 136px 180px 156px', color: '#FFFFFF', fontSize: 14, fontWeight: 900, px: 1, pb: 1.2, borderBottom: '1px solid rgba(255,255,255,0.08)'}}>
                  {['ID', 'PLANNING ITEM', 'LOCATION', 'RESOURCE', 'TYPE', 'SCHEDULED DETAILS', 'OEE STATUS'].map((head) => (
                    <Box key={head} sx={{borderRight: '1px solid rgba(214,224,242,0.34)', pr: 1}}>{head}</Box>
                  ))}
                </Box>
                <Box sx={{display: 'grid', gridAutoRows: '52px'}}>
                  {planningRows.map((row, rowIndex) => (
                    <Box key={row[0]} sx={{display: 'grid', gridTemplateColumns: '108px minmax(0, 1.7fr) 116px 178px 136px 180px 156px', alignItems: 'center', px: 1, bgcolor: rowIndex === 1 ? '#364250' : 'transparent', color: '#FFFFFF', fontSize: 14}}>
                      {row.map((cell, index) => (
                        <Box key={`${row[0]}-${index}`} sx={{minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 0.55}}>
                          {index === 4 ? <DeliverySmallStatus>{cell}</DeliverySmallStatus> : index === 6 ? <><Typography sx={{fontSize: 14}}>{cell}</Typography><DeliverySmallStatus tone={row[7] === 'PENDING' ? 'blue' : 'green'}>{row[7]}</DeliverySmallStatus></> : index === 7 ? null : cell}
                        </Box>
                      ))}
                    </Box>
                  ))}
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 1.2, color: '#FFFFFF'}}>
                  <KeyboardArrowLeftIcon sx={{fontSize: 20, color: '#8E99AA'}} />
                  <Box sx={{width: 26, height: 26, borderRadius: '50%', bgcolor: '#657080', display: 'grid', placeItems: 'center', fontSize: 13}}>1</Box>
                  <Typography sx={{fontSize: 14}}>2</Typography>
                  <KeyboardArrowRightIcon sx={{fontSize: 20}} />
                </Box>
              </DrillCard>

              <DrillAiCard
                items={[
                  {accent: '#67D783', title: 'Otd improved by +1.8% after streamlining shift handovers', body: 'Re-staging mold-change kits and components adjacent to Line 1 reduced shift transition friction by 18 minutes.\nRecommendation: deploy the shift pre-staging layout templates to Cell 3 and Molding.'},
                  {accent: '#FF4D48', title: 'Predictive maintenance scheduled on line 3 to avoid motor wear', body: 'Joint 3 bearing wear indicators detected. Predictive timing schedules maintenance during Saturday non-work hours to protect backlog.\nRecommendation: verify spare bearing inventory availability in Area B ahead of schedule.'},
                ]}
              />
            </Box>

            <Box sx={{minHeight: 0, display: 'grid', gridTemplateRows: '436px minmax(0, 1fr) 188px 56px', gap: 1.1}}>
              <PlantOverviewDrillCard />
              <DeliveryAddWidget wide />
              <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.1}}>
                <DeliveryAddWidget />
                <DeliveryAddWidget />
              </Box>
              <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '12px', px: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <Typography sx={{fontSize: 20, color: '#FFFFFF', fontWeight: 800}}>Comments</Typography>
                <ExpandMoreIcon sx={{color: '#AAB4C5'}} />
              </Paper>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

function CostDrilldownScreen({
  onBack,
  ...headerProps
}: ControlTowerScreenProps & {
  onBack: () => void;
}) {
  const reasons = [
    'Syringe barrels\nunavailable at line',
    'Scrap rate exceeded\ncontrol limits',
    'Product failed\ndimensional\nverification',
    'Technical support\nunavailable',
    'Cleanroom\nenvironmental\nconditions outside\nlimits',
    'Manufacturing\nexecution system\nunavailable',
    'Micro-stop\nfrequency\non Line 6',
    'Needle insertion\ntooling wear is\nincreasing stop\nfrequency',
    'Wrong component\ndelivered to line',
    'Others',
  ];

  return (
    <Box sx={{height: '100dvh', minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#09111F', overflow: 'hidden'}}>
      <TowerHeader {...headerProps} />
      <Box sx={{flex: 1, minHeight: 0, px: 5, pt: 2.2, pb: 2, bgcolor: '#09111F', overflow: 'hidden'}}>
        <Box sx={{height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'}}>
          <Box sx={{height: 46, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0}}>
            <Box onClick={onBack} sx={{display: 'flex', alignItems: 'center', gap: 0.45, cursor: 'pointer'}}>
              <Typography sx={{fontSize: 20, fontWeight: 800, color: '#8A92A1'}}>Control Tower /</Typography>
              <Typography sx={{fontSize: 20, fontWeight: 800, color: '#FFFFFF'}}>Cost Drilldown</Typography>
            </Box>
            <Box component="button" sx={{border: 0, height: 36, px: 2, borderRadius: '11px', bgcolor: '#3B82FF', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 0.8, fontSize: 12, fontWeight: 900, letterSpacing: 0.3, cursor: 'pointer'}}>
              <EditIcon sx={{fontSize: 18}} />
              EDIT WIGETS
            </Box>
          </Box>

          <Paper elevation={0} sx={{...pageShellSx, flex: 1, minHeight: 0, p: 1.5, display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(360px, 1.05fr)', gap: 1.2}}>
            <Box sx={{minHeight: 0, display: 'grid', gridTemplateRows: '208px minmax(0, 1.6fr) 256px', gap: 1.1}}>
              <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.1, minHeight: 0}}>
                <DeliveryAddWidget />
                <DeliveryAddWidget />
                <DeliveryAddWidget />
              </Box>

              <DrillCard cardSx={{display: 'flex', flexDirection: 'column'}} showExpand title="Downtime">
                <BaseChart bottomLabels={reasons} chartHeight={278} leftLabel="Hours" leftTicks={['200h', '150h', '100h', '50h', '0h']} topPadding={8}>
                  <BarChart bars={[82, 76, 70, 62, 50, 42, 38, 32, 29, 22]} color="#1298D7" />
                  <PolylineChart color="#FFFFFF" dashed points={[28, 38, 45, 66, 74, 74, 74, 74, 80, 80]} strokeWidth={1.25} />
                </BaseChart>
                <LegendRow items={[{color: '#1298D7', label: 'Actual'}, {color: '#FFFFFF', dashed: true, label: 'Target'}]} />
              </DrillCard>

              <DrillAiCard
                items={[
                  {accent: '#67D783', title: 'Inventory capital optimization opportunity', body: 'Class A items (Raw Materials A and Active Formulation B) constitute 73.1% of inventory costs with 35 combined days outstanding.\nRecommendation: recalibrate safety stocks in ERP from 35 to 28 days of supply to unlock around $42k from tied capital.'},
                  {accent: '#FF4D48', title: 'Labor cost anomaly detected in line 3', body: 'Wage overhead increased shift costs by 8.4% due to a technical idle state waiting for sensor cleaning.\nRecommendation: adjust maintenance priority lists to expedite Line 3 issues, synchronizing rotation limits.'},
                ]}
              />
            </Box>

            <Box sx={{minHeight: 0, display: 'grid', gridTemplateRows: '436px minmax(0, 1fr)', gap: 1.1}}>
              <PlantOverviewDrillCard />
              <CommentsDrillCard
                comments={[
                  {author: 'Maria Pinna', body: 'Negotiated a 4.5% volume discount on Class A Active Formulation B starting next quarter. This will directly improve our Inventory Cost margin.', date: 'Mar 18, 09:20', image: '/images/Maria.png'},
                  {author: 'John Joshua', body: 'Labor cost spike in Line 3 was caused by the calibration failure, which forced 3 hours of technical idle waiting time. Resolved now.', date: 'Mar 18, 07:32', image: '/images/John.png'},
                ]}
              />
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

function IncidentOverviewLastCard({
  date,
  location,
  status,
  title,
}: {
  date: string;
  location: string;
  status: string;
  title: string;
}) {
  return (
    <Box sx={{borderRadius: '7px', bgcolor: '#111A2A', p: 1.15, borderLeft: '3px solid #16A7F4'}}>
      <Typography sx={{fontSize: 12, color: '#BAC5D4', mb: 0.45}}>Title</Typography>
      <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 800, mb: 1.85}}>{title}</Typography>
      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.4}}>
        {[
          ['Date', date],
          ['Location', location],
          ['Status', status],
        ].map(([label, value]) => (
          <Box key={label} sx={{borderLeft: '3px solid #16A7F4', pl: 0.75}}>
            <Typography sx={{fontSize: 12, color: '#BAC5D4', mb: 0.3}}>{label}</Typography>
            <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 600}}>{value}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function IncidentsOverviewDrilldown({onClose}: {onClose: () => void}) {
  const modalMonths = ['Oct 24', 'Nov 24', 'Dez 24', 'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25'];
  const matrixRows = [
    ['Cell 1', '1', '2', '3'],
    ['Cell 2', '2', '3', '5'],
    ['Cell 3', '1', '10', '1'],
    ['Cell 4', '0', '0', '2'],
    ['Cell 5', '0', '0', '0'],
    ['Molding', '1', '9', '1'],
  ];

  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 20, bgcolor: 'rgba(0,0,0,0.66)', display: 'grid', placeItems: 'center'}}>
      <Paper
        elevation={0}
        sx={{
          width: '86.4vw',
          height: '83.6vh',
          maxWidth: 1660,
          maxHeight: 903,
          minWidth: 1120,
          minHeight: 680,
          bgcolor: '#323D4A',
          borderRadius: 0,
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
          p: 2.5,
          display: 'grid',
          gridTemplateRows: '44px 38px minmax(0, 1fr)',
          gap: 1,
          overflow: 'hidden',
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Typography sx={{fontSize: 22, color: '#FFFFFF', fontWeight: 800}}>Incidents Overview</Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.1, color: '#FFFFFF'}}>
            <Typography sx={{fontSize: 16}}>Yearly</Typography>
            <ArrowDropDownIcon sx={{fontSize: 18, color: '#B7C0CE'}} />
            <SparkleIcon sx={{fontSize: 21, color: '#66758D'}} />
            <IconButton onClick={onClose} sx={{width: 28, height: 28, color: '#2F83FF', '&:hover': {bgcolor: 'rgba(47,131,255,0.12)'}}}>
              <CloseIcon sx={{fontSize: 20}} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{display: 'flex', alignItems: 'end', gap: 3.2}}>
          {['TOTAL', 'CELL', 'LINE', 'SHIFT'].map((tab, index) => (
            <Box key={tab} sx={{height: 30, px: 1.55, borderBottom: index === 0 ? '2px solid #2F83FF' : '2px solid transparent', color: index === 0 ? '#2F83FF' : '#C6CEDA', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center'}}>
              {tab}
            </Box>
          ))}
        </Box>

        <Box sx={{minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) 310px', gridTemplateRows: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 1.55}}>
          <Paper elevation={0} sx={{gridColumn: '1 / span 2', bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0, overflow: 'hidden'}}>
            <Typography sx={{fontSize: 16, color: '#FFFFFF', mb: 1.25}}>Incicidents Overview</Typography>
            <BaseChart bottomLabels={modalMonths} chartHeight={276} leftTicks={['250', '200', '150', '100', '50', '0']} topPadding={10}>
              <StackedBarChart
                series={[
                  {color: '#1497D5', values: [36, 30, 36, 30, 36, 30, 36, 30, 36, 30, 30, 36]},
                  {color: '#D9236B', values: [36, 30, 36, 34, 36, 34, 36, 34, 36, 34, 34, 36]},
                  {color: '#8CC63E', values: [36, 34, 36, 36, 36, 36, 36, 32, 36, 36, 36, 36]},
                  {color: '#F05A22', values: [36, 34, 36, 34, 36, 34, 36, 34, 36, 34, 34, 36]},
                  {color: '#5A35B9', values: [38, 32, 38, 34, 38, 34, 38, 34, 38, 34, 34, 38]},
                  {color: '#D39A05', values: [34, 34, 34, 32, 34, 32, 34, 32, 34, 32, 32, 34]},
                ]}
              />
              <PolylineChart color="#FFFFFF" dashed points={[62, 68, 66, 64, 68, 65, 68, 63, 60, 72, 70, 64]} strokeWidth={1.25} />
            </BaseChart>
            <LegendRow
              items={[
                {color: '#1497D5', label: 'Fatality'},
                {color: '#D9236B', label: 'Serious Injury'},
                {color: '#8CC63E', label: 'Minor Injury'},
                {color: '#F05A22', label: 'Near Miss'},
                {color: '#5A35B9', label: 'Medical Treatment'},
                {color: '#D39A05', label: 'First Aid Case'},
                {color: '#FFFFFF', dashed: true, label: 'Target'},
              ]}
            />
          </Paper>

          <Paper elevation={0} sx={{gridColumn: 3, gridRow: '1 / span 2', bgcolor: '#222C3B', borderRadius: '8px', p: 2, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
            <Typography sx={{fontSize: 16, color: '#FFFFFF', fontWeight: 800, mb: 1.25}}>Comments</Typography>
            <Box sx={{display: 'grid', gap: 1}}>
              {[
                {
                  author: 'John Joshua',
                  body: 'No major incidents reported on Line 1. The minor laceration from yesterday is already closed and the action item completed..',
                  date: 'Sep 18, 07:32',
                  image: '/images/John.png',
                },
                {
                  author: 'Maria Pinna',
                  body: 'Please review the near-miss logs on Cell 3. Forklift safety lines are fading; safety kits should be inspected.',
                  date: 'Sep 05, 09:20',
                  image: '/images/Maria.png',
                },
              ].map((comment) => (
                <Box key={comment.body} sx={{borderRadius: '10px', bgcolor: '#374352', px: 1.4, py: 1.05}}>
                  <Typography sx={{fontSize: 14, color: '#FFFFFF', lineHeight: 1.42, mb: 1}}>{comment.body}</Typography>
                  <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#AAB4C5'}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
                      <Avatar src={comment.image} sx={{width: 18, height: 18}} />
                      <Typography sx={{fontSize: 12}}>{comment.author}</Typography>
                    </Box>
                    <Typography sx={{fontSize: 12}}>{comment.date}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            <Box sx={{mt: 'auto', height: 40, border: '1px solid #3A86FF', borderRadius: '10px', display: 'flex', alignItems: 'center', px: 1.3, color: '#BBC5D3'}}>
              <Typography sx={{fontSize: 15, flex: 1}}>Leave a comment</Typography>
              <SendIcon sx={{fontSize: 28, color: '#3B82FF'}} />
            </Box>
          </Paper>

          <Paper elevation={0} sx={{gridColumn: 1, gridRow: 2, bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0, overflow: 'hidden'}}>
            <Typography sx={{fontSize: 16, color: '#FFFFFF', mb: 1.6}}>Incidents YTD Matrix</Typography>
            <Box sx={{display: 'grid', gridTemplateColumns: '1fr 72px 72px 72px', color: '#C7D0DD', fontSize: 14, px: 0.8, mb: 0.65}}>
              <Typography sx={{fontSize: 14}}>Location / Unit</Typography>
              <Typography sx={{fontSize: 14, textAlign: 'center'}}>Y - 2</Typography>
              <Typography sx={{fontSize: 14, textAlign: 'center'}}>Y - 1</Typography>
              <Typography sx={{fontSize: 14, textAlign: 'center'}}>YTD</Typography>
            </Box>
            <Box sx={{display: 'grid', gridAutoRows: '41px'}}>
              {matrixRows.map((row, index) => (
                <Box key={row[0]} sx={{display: 'grid', gridTemplateColumns: '1fr 72px 72px 72px', alignItems: 'center', px: 0.8, bgcolor: index % 2 === 0 ? '#364250' : 'transparent'}}>
                  <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 800}}>{row[0]}</Typography>
                  <Typography sx={{fontSize: 20, color: '#FFFFFF', textAlign: 'center'}}>{row[1]}</Typography>
                  <Typography sx={{fontSize: 20, color: '#FFFFFF', textAlign: 'center'}}>{row[2]}</Typography>
                  <Typography sx={{fontSize: 20, color: '#FFFFFF', textAlign: 'center'}}>{row[3]}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          <Paper elevation={0} sx={{gridColumn: 2, gridRow: 2, bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
            <Typography sx={{fontSize: 16, color: '#FFFFFF', mb: 1.45}}>Last Incidents</Typography>
            <Box sx={{display: 'grid', gap: 1.05}}>
              <IncidentOverviewLastCard date="05/12/26" location="Line 2" status="Under Investigation" title="Slip and fall on wet surface near packing station" />
              <IncidentOverviewLastCard date="05/12/26" location="Cell 1" status="Closed" title="Hand Laceration During Material Handling" />
            </Box>
            <ChartPager count={3} />
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}

function SafetyTrackingMetricCard({
  accent = '#22AFFF',
  danger = false,
  primary,
  title,
  values,
}: {
  accent?: string;
  danger?: boolean;
  primary: string;
  title: string;
  values: Array<{label: string; value: string}>;
}) {
  return (
    <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0, overflow: 'hidden'}}>
      <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 800, mb: 1.15}}>{title}</Typography>
      <Box sx={{height: 88, borderRadius: '5px', bgcolor: '#364250', borderLeft: `5px solid ${danger ? '#FF4D48' : accent}`, px: 1.25, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1}}>
        <Box>
          <Typography sx={{fontSize: 48, color: danger ? '#FF4D48' : '#FFFFFF', lineHeight: 0.95, fontWeight: 800}}>{primary}</Typography>
          <Typography sx={{fontSize: 12, color: danger ? '#FF4D48' : '#FFFFFF', mt: 0.55}}>YTD Rate</Typography>
        </Box>
        <Box sx={{textAlign: 'right'}}>
          <Typography sx={{fontSize: 9, color: '#B8C2D1', fontWeight: 800}}>TREND</Typography>
          <Box sx={{mt: 0.3, px: 0.65, py: 0.25, borderRadius: '999px', bgcolor: '#0F1728', color: '#67D783', fontSize: 10, fontWeight: 900}}>+0.5%</Box>
        </Box>
      </Box>
      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1}}>
        {values.map((item) => (
          <Box key={item.label} sx={{height: 66, borderRadius: '5px', bgcolor: '#364250', borderLeft: '5px solid #22AFFF', px: 1.15, py: 0.75}}>
            <Typography sx={{fontSize: 34, color: '#FFFFFF', lineHeight: 0.95}}>{item.value}</Typography>
            <Typography sx={{fontSize: 12, color: '#DCE5F3', mt: 0.35}}>{item.label}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

function SafetyTrackingDrilldown({onClose}: {onClose: () => void}) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trirPoints = [43, 46, 45, 43, 46, 46, 46, 46, 41, 47, 46, 44];
  const targetPoints = [56, 58, 56, 55, 58, 58, 56, 58, 55, 58, 58, 56];
  const trirLabels = ['0.91', '0.90', '0.89', '0.91', '0.91', '0.91', '0.91', '0.91', '0.87', '0.92', '0.91', '0.89'];

  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 20, bgcolor: 'rgba(0,0,0,0.66)', display: 'grid', placeItems: 'center'}}>
      <Paper
        elevation={0}
        sx={{
          width: '86.4vw',
          height: '83.6vh',
          maxWidth: 1660,
          maxHeight: 903,
          minWidth: 1120,
          minHeight: 680,
          bgcolor: '#323D4A',
          borderRadius: 0,
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
          p: 2.5,
          display: 'grid',
          gridTemplateRows: '44px 38px minmax(0, 1fr)',
          gap: 1,
          overflow: 'hidden',
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Typography sx={{fontSize: 22, color: '#FFFFFF', fontWeight: 800}}>Safety Tracking</Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.1, color: '#FFFFFF'}}>
            <Typography sx={{fontSize: 16}}>Yearly</Typography>
            <ArrowDropDownIcon sx={{fontSize: 18, color: '#B7C0CE'}} />
            <SparkleIcon sx={{fontSize: 21, color: '#66758D'}} />
            <IconButton onClick={onClose} sx={{width: 28, height: 28, color: '#2F83FF', '&:hover': {bgcolor: 'rgba(47,131,255,0.12)'}}}>
              <CloseIcon sx={{fontSize: 20}} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{display: 'flex', alignItems: 'end', gap: 3.2}}>
          {['TOTAL', 'CELL', 'LINE', 'SHIFT'].map((tab, index) => (
            <Box key={tab} sx={{height: 30, px: 1.55, borderBottom: index === 0 ? '2px solid #2F83FF' : '2px solid transparent', color: index === 0 ? '#2F83FF' : '#C6CEDA', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center'}}>
              {tab}
            </Box>
          ))}
        </Box>

        <Box sx={{minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 310px', gridTemplateRows: 'minmax(0, 1fr) 228px', gap: 1.55}}>
          <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0, overflow: 'hidden'}}>
            <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 800, mb: 1.2}}>TRIR</Typography>
            <BaseChart bottomLabels={months} chartHeight={395} leftTicks={['2', '1.5', '1', '0.5', '0']} topPadding={6}>
              <PolylineChart color="#149BEA" points={trirPoints} strokeWidth={1.7} />
              <PolylineChart color="#FFFFFF" dashed points={targetPoints} strokeWidth={1.25} />
              <LinePointOverlay dotColor="#149BEA" fontSize={12} labelColor="#FFFFFF" labelOffset={-15} labels={trirLabels} points={trirPoints} />
            </BaseChart>
            <LegendRow items={[{color: '#149BEA', label: 'TRIR Trend'}, {color: '#FFFFFF', dashed: true, label: 'Target'}]} />
          </Paper>

          <Paper elevation={0} sx={{gridColumn: 2, gridRow: '1 / span 2', bgcolor: '#222C3B', borderRadius: '8px', p: 2, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
            <Typography sx={{fontSize: 16, color: '#FFFFFF', fontWeight: 800, mb: 1.25}}>Comments</Typography>
            <Box sx={{display: 'grid', gap: 1}}>
              {[
                {
                  author: 'John Joshua',
                  body: 'The EHS Maturity roadmap is on track for the Dec 2026 performance target. Line 1 audits are 100% compliant this week',
                  date: 'Sep 18, 07:32',
                  image: '/images/John.png',
                },
                {
                  author: 'Maria Pinna',
                  body: 'Our TRIR is currently 0.98. If we keep the safe man-hours streak, we will hit our lowest record in 5 years.',
                  date: 'Sep 05, 09:20',
                  image: '/images/Maria.png',
                },
              ].map((comment) => (
                <Box key={comment.body} sx={{borderRadius: '10px', bgcolor: '#374352', px: 1.4, py: 1.05}}>
                  <Typography sx={{fontSize: 14, color: '#FFFFFF', lineHeight: 1.42, mb: 1}}>{comment.body}</Typography>
                  <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#AAB4C5'}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
                      <Avatar src={comment.image} sx={{width: 18, height: 18}} />
                      <Typography sx={{fontSize: 12}}>{comment.author}</Typography>
                    </Box>
                    <Typography sx={{fontSize: 12}}>{comment.date}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            <Box sx={{mt: 'auto', height: 40, border: '1px solid #3A86FF', borderRadius: '10px', display: 'flex', alignItems: 'center', px: 1.3, color: '#BBC5D3'}}>
              <Typography sx={{fontSize: 15, flex: 1}}>Leave a comment</Typography>
              <SendIcon sx={{fontSize: 28, color: '#3B82FF'}} />
            </Box>
          </Paper>

          <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.55, minHeight: 0}}>
            <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0}}>
              <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 800, mb: 2.9}}>EHS Maturity Stage</Typography>
              <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', alignItems: 'start', mb: 2.2}}>
                {[
                  ['✓', 'Awareness', 'Oct 24', '#667180', '#FFFFFF'],
                  ['2', 'Adoption', 'Active', '#3B82FF', '#FFFFFF'],
                  ['3', 'Perform', 'Dec 26', '#838C98', '#FFFFFF'],
                  ['4', 'Improve', '-', '#687382', '#9AA4B2'],
                  ['5', 'Innovate', '-', '#687382', '#9AA4B2'],
                ].map(([number, label, date, bg, color]) => (
                  <Box key={label} sx={{textAlign: 'center', color}}>
                    <Box sx={{mx: 'auto', width: 24, height: 24, borderRadius: '50%', bgcolor: bg, display: 'grid', placeItems: 'center', color: '#FFFFFF', fontSize: 13, fontWeight: 800, outline: label === 'Perform' ? '1px dotted #FFFFFF' : 'none'}}>
                      {number}
                    </Box>
                    <Typography sx={{fontSize: 13, color, mt: 1.1, fontWeight: 800}}>{label}</Typography>
                    <Typography sx={{fontSize: 12, color: label === 'Adoption' ? '#3B82FF' : '#9EA8B6', mt: 0.2}}>{date}</Typography>
                  </Box>
                ))}
              </Box>
              <Box sx={{height: '1px', bgcolor: 'rgba(255,255,255,0.12)', mb: 1.8}} />
              <Typography sx={{fontSize: 14, color: '#FFFFFF', mb: 0.7}}>Reached Awareness: Oct 24</Typography>
              <Typography sx={{fontSize: 14, color: '#FFFFFF'}}>Next Target: Dec 26</Typography>
            </Paper>

            <SafetyTrackingMetricCard primary="0.98" title="TRIR Annual" values={[{label: '2025', value: '1.18'}, {label: '2024', value: '1.34'}]} />
            <SafetyTrackingMetricCard danger primary="0.98" title="Serious Injury Rate" values={[{label: '2025', value: '0.19'}, {label: '2024', value: '0.25'}]} />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

function EsoStatusPill({status}: {status: string}) {
  const bg = status === 'Completed' ? '#82D889' : status === 'Under Investigation' ? '#FFAE33' : '#FF5B63';
  const color = status === 'Under Investigation' ? '#111827' : status === 'Completed' ? '#0F2718' : '#FFFFFF';

  return (
    <Box sx={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 27, px: 1.35, borderRadius: '999px', bgcolor: bg, color, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap'}}>
      {status}
    </Box>
  );
}

function EsosOverviewDrilldown({onClose}: {onClose: () => void}) {
  const modalMonths = ['Oct 24', 'Nov 24', 'Dez 24', 'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25'];
  const rows = [
    ['ES523183', 'May 28, 2025', 'Operator observed using standard double-check valv...', 'BBS', 'Line 3', 'John Smith', 'Jane Cooper', 'Completed'],
    ['ES523182', 'May 27, 2025', 'Near-miss: Forklift bypasses pedestrian safety lines...', 'Near Miss', 'Line 4', 'James Miller', 'Dianne Russell', 'Under Investigation'],
    ['ES523185', 'May 25, 2025', 'Condition Report (Unsafe): High pressure pipe showi...', 'CR Unsafe', 'Line 2', 'Olivia Martin', 'Arlene McCoy', 'Open'],
    ['ES523184', 'May 24, 2025', 'Condition Report (Safe): Proper toxic waste drum sto...', 'CR Safe', 'Line 3', 'Gracie Walker', 'Albert Flores', 'Completed'],
  ];

  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 20, bgcolor: 'rgba(0,0,0,0.66)', display: 'grid', placeItems: 'center'}}>
      <Paper
        elevation={0}
        sx={{
          width: '86.4vw',
          height: '83.6vh',
          maxWidth: 1660,
          maxHeight: 903,
          minWidth: 1120,
          minHeight: 680,
          bgcolor: '#323D4A',
          borderRadius: 0,
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
          p: 2.5,
          display: 'grid',
          gridTemplateRows: '44px 38px minmax(0, 1fr)',
          gap: 1,
          overflow: 'hidden',
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Typography sx={{fontSize: 22, color: '#FFFFFF', fontWeight: 800}}>ESOs</Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.1, color: '#FFFFFF'}}>
            <Typography sx={{fontSize: 16}}>All Categories</Typography>
            <ArrowDropDownIcon sx={{fontSize: 18, color: '#B7C0CE'}} />
            <Typography sx={{fontSize: 16}}>Yearly</Typography>
            <ArrowDropDownIcon sx={{fontSize: 18, color: '#B7C0CE'}} />
            <SparkleIcon sx={{fontSize: 21, color: '#66758D'}} />
            <IconButton onClick={onClose} sx={{width: 28, height: 28, color: '#2F83FF', '&:hover': {bgcolor: 'rgba(47,131,255,0.12)'}}}>
              <CloseIcon sx={{fontSize: 20}} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{display: 'flex', alignItems: 'end', gap: 3.2}}>
          {['TOTAL', 'CELL', 'LINE', 'SHIFT'].map((tab, index) => (
            <Box key={tab} sx={{height: 30, px: 1.55, borderBottom: index === 0 ? '2px solid #2F83FF' : '2px solid transparent', color: index === 0 ? '#2F83FF' : '#C6CEDA', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center'}}>
              {tab}
            </Box>
          ))}
        </Box>

        <Box sx={{minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 310px', gap: 1.55}}>
          <Box sx={{minHeight: 0, display: 'grid', gridTemplateRows: '370px 52px minmax(0, 1fr)', gap: 1.5}}>
            <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0, overflow: 'hidden'}}>
              <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 1, mb: 2}}>
                {[
                  ['1.150', 'ESOs'],
                  ['420', 'Near Miss'],
                  ['200', 'Unsafe Condition'],
                  ['640', 'Safe Condition'],
                ].map(([value, label]) => (
                  <Box key={label} sx={{height: 66, borderRadius: '5px', bgcolor: '#364250', borderLeft: '5px solid #22AFFF', px: 1.2, py: 0.75}}>
                    <Typography sx={{fontSize: 34, color: '#FFFFFF', lineHeight: 0.95}}>{value}</Typography>
                    <Typography sx={{fontSize: 12, color: '#FFFFFF', mt: 0.45}}>{label}</Typography>
                  </Box>
                ))}
              </Box>
              <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 800, mb: 1.1}}>Root Cause Investigation Categories</Typography>
              <BaseChart bottomLabels={modalMonths} chartHeight={176} leftTicks={['250', '200', '150', '100', '50', '0']} topPadding={8}>
                <StackedBarChart
                  series={[
                    {color: '#1497D5', values: [44, 30, 44, 30, 44, 30, 44, 26, 44, 30, 30, 44]},
                    {color: '#D9236B', values: [42, 31, 42, 31, 42, 31, 42, 28, 42, 31, 31, 42]},
                    {color: '#8CC63E', values: [42, 32, 42, 32, 42, 32, 42, 28, 42, 32, 32, 42]},
                    {color: '#F05A22', values: [44, 32, 44, 32, 44, 32, 44, 28, 44, 32, 32, 44]},
                  ]}
                />
                <PolylineChart color="#FFFFFF" dashed points={[70, 78, 74, 70, 78, 78, 72, 78, 70, 80, 78, 72]} strokeWidth={1.25} />
              </BaseChart>
              <LegendRow
                items={[
                  {color: '#1497D5', label: 'Behaviour-Based Condition'},
                  {color: '#D9236B', label: 'Condition Report (Safe)'},
                  {color: '#8CC63E', label: 'Condition Report (Unsafe)'},
                  {color: '#F05A22', label: 'Near Miss'},
                  {color: '#FFFFFF', dashed: true, label: 'Total'},
                ]}
              />
            </Paper>

            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
              <Box sx={{height: 40, width: 512, border: '1px solid #E0E7F4', borderRadius: '11px', px: 1.2, display: 'flex', alignItems: 'center', color: '#CDD6E4'}}>
                <Typography sx={{fontSize: 16, flex: 1}}>Search</Typography>
                <SearchIcon sx={{fontSize: 22, color: '#3B82FF'}} />
              </Box>
              <Box sx={{height: 38, px: 1.5, border: '1px solid #3B82FF', borderRadius: '11px', display: 'flex', alignItems: 'center', gap: 0.8, color: '#3B82FF', fontSize: 14, fontWeight: 800}}>
                <FilterListIcon sx={{fontSize: 18}} />
                FILTERS
              </Box>
            </Box>

            <Box sx={{minHeight: 0, overflow: 'hidden'}}>
              <Box sx={{display: 'grid', gridTemplateColumns: '90px 122px minmax(0, 1.9fr) 114px 112px 160px 160px 166px', alignItems: 'center', color: '#FFFFFF', fontSize: 14, fontWeight: 900, px: 1, pb: 1.2}}>
                {['ID', 'DATE', 'DESCRIPTION', 'CATEGORY', 'LOCATION', 'CREATOR', 'ASSIGNED TO', 'STATUS'].map((head, index) => (
                  <Box key={head} sx={{height: 25, display: 'flex', alignItems: 'center', gap: 0.7, borderRight: index < 7 ? '1px solid rgba(214,224,242,0.34)' : '1px solid rgba(214,224,242,0.34)', pr: 1}}>
                    {head}
                    {(index === 1 || index === 2) ? <Typography sx={{fontSize: 13, color: '#748095', ml: 'auto'}}>↕</Typography> : null}
                  </Box>
                ))}
              </Box>
              <Box sx={{display: 'grid', gridAutoRows: '52px'}}>
                {rows.map((row, rowIndex) => (
                  <Box key={row[0]} sx={{display: 'grid', gridTemplateColumns: '90px 122px minmax(0, 1.9fr) 114px 112px 160px 160px 166px', alignItems: 'center', px: 1, bgcolor: rowIndex % 2 === 0 ? '#222C3B' : '#364250', color: '#FFFFFF', fontSize: 14}}>
                    {row.map((cell, index) => (
                      <Box key={`${row[0]}-${index}`} sx={{minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                        {index === 7 ? <EsoStatusPill status={cell} /> : cell}
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 1.15, color: '#FFFFFF'}}>
                <KeyboardArrowLeftIcon sx={{fontSize: 20, color: '#8E99AA'}} />
                <Box sx={{width: 26, height: 26, borderRadius: '50%', bgcolor: '#657080', display: 'grid', placeItems: 'center', fontSize: 13}}>1</Box>
                <Typography sx={{fontSize: 14}}>2</Typography>
                <Typography sx={{fontSize: 14}}>3</Typography>
                <KeyboardArrowRightIcon sx={{fontSize: 20}} />
              </Box>
            </Box>
          </Box>

          <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 2, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
            <Typography sx={{fontSize: 16, color: '#FFFFFF', fontWeight: 800, mb: 1.25}}>Comments</Typography>
            <Box sx={{borderRadius: '10px', bgcolor: '#374352', px: 1.4, py: 1.05}}>
              <Typography sx={{fontSize: 14, color: '#FFFFFF', lineHeight: 1.42, mb: 1}}>
                We conducted Behavioral-Based Safety (BBS) training on Line 3. Employee engagement increased significantly this month.
              </Typography>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#AAB4C5'}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
                  <Avatar src="/images/Maria.png" sx={{width: 18, height: 18}} />
                  <Typography sx={{fontSize: 12}}>Maria Pinna</Typography>
                </Box>
                <Typography sx={{fontSize: 12}}>Sep 05, 09:20</Typography>
              </Box>
            </Box>
            <Box sx={{mt: 'auto', height: 40, border: '1px solid #3A86FF', borderRadius: '10px', display: 'flex', alignItems: 'center', px: 1.3, color: '#BBC5D3'}}>
              <Typography sx={{fontSize: 15, flex: 1}}>Leave a comment</Typography>
              <SendIcon sx={{fontSize: 28, color: '#3B82FF'}} />
            </Box>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}

function SafetyStatusInvestigationDrilldown({onClose}: {onClose: () => void}) {
  const modalMonths = ['Oct 24', 'Nov 24', 'Dez 24', 'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25'];
  const rows = [
    ['S8932001', 'May 28, 2025', 'LOTO procedure verification on packing machine', 'LOTO', 'Line 1', 'John Smith', 'High', 'Open'],
    ['S8932002', 'May 27, 2025', 'Resolve slippery floor hazard near water cooling line', 'STF', 'Line 4', 'James Miller', 'Medium', 'Under Review'],
    ['S8932003', 'May 25, 2025', 'Implement ergonomic manual handling guide for Line...', 'ERG', 'Line 2', 'Olivia Martin', 'Low', 'Completed'],
    ['S8932005', 'May 24, 2025', 'Inspect chemical exposure safety eye wash station s...', 'CHEM', 'Line 3', 'Gracie Walker', 'Low', 'Canceled'],
  ];

  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 20, bgcolor: 'rgba(0,0,0,0.66)', display: 'grid', placeItems: 'center'}}>
      <Paper
        elevation={0}
        sx={{
          width: '86.4vw',
          height: '83.6vh',
          maxWidth: 1660,
          maxHeight: 903,
          minWidth: 1120,
          minHeight: 680,
          bgcolor: '#323D4A',
          borderRadius: 0,
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
          p: 2.5,
          display: 'grid',
          gridTemplateRows: '44px 38px minmax(0, 1fr)',
          gap: 1,
          overflow: 'hidden',
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Typography sx={{fontSize: 22, color: '#FFFFFF', fontWeight: 800}}>Status &amp; Investigation</Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.1, color: '#FFFFFF'}}>
            <Typography sx={{fontSize: 16}}>Yearly</Typography>
            <ArrowDropDownIcon sx={{fontSize: 18, color: '#B7C0CE'}} />
            <SparkleIcon sx={{fontSize: 21, color: '#66758D'}} />
            <IconButton onClick={onClose} sx={{width: 28, height: 28, color: '#2F83FF', '&:hover': {bgcolor: 'rgba(47,131,255,0.12)'}}}>
              <CloseIcon sx={{fontSize: 20}} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{display: 'flex', alignItems: 'end', gap: 3.2}}>
          {['TOTAL', 'CELL', 'LINE', 'SHIFT'].map((tab, index) => (
            <Box key={tab} sx={{height: 30, px: 1.55, borderBottom: index === 0 ? '2px solid #2F83FF' : '2px solid transparent', color: index === 0 ? '#2F83FF' : '#C6CEDA', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center'}}>
              {tab}
            </Box>
          ))}
        </Box>

        <Box sx={{minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 310px', gap: 1.55}}>
          <Box sx={{minHeight: 0, display: 'grid', gridTemplateRows: '370px 52px minmax(0, 1fr)', gap: 1.5}}>
            <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0, overflow: 'hidden'}}>
              <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 1, mb: 2}}>
                {[
                  ['1.353', 'Total Safety Items'],
                  ['7', 'Open Safety Issues'],
                  ['5', 'Under Investigation'],
                  ['4', 'Action Plan Defined'],
                ].map(([value, label]) => (
                  <Box key={label} sx={{height: 66, borderRadius: '5px', bgcolor: '#364250', borderLeft: '5px solid #22AFFF', px: 1.2, py: 0.75}}>
                    <Typography sx={{fontSize: 34, color: '#FFFFFF', lineHeight: 0.95}}>{value}</Typography>
                    <Typography sx={{fontSize: 12, color: '#FFFFFF', mt: 0.45}}>{label}</Typography>
                  </Box>
                ))}
              </Box>
              <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 800, mb: 1.1}}>Root Cause Investigation Categories</Typography>
              <BaseChart bottomLabels={modalMonths} chartHeight={176} leftTicks={['250', '200', '150', '100', '50', '0']} topPadding={8}>
                <StackedBarChart
                  series={[
                    {color: '#1497D5', values: [30, 22, 30, 22, 30, 22, 30, 18, 30, 22, 22, 30]},
                    {color: '#D9236B', values: [28, 18, 28, 18, 28, 18, 28, 18, 28, 18, 18, 28]},
                    {color: '#8CC63E', values: [28, 22, 28, 22, 28, 22, 28, 18, 28, 22, 22, 28]},
                    {color: '#F05A22', values: [28, 18, 28, 18, 28, 18, 28, 18, 28, 18, 18, 28]},
                    {color: '#5A35B9', values: [28, 26, 28, 22, 28, 22, 28, 22, 28, 22, 22, 28]},
                    {color: '#D39A05', values: [26, 22, 26, 20, 26, 20, 26, 18, 26, 20, 20, 26]},
                  ]}
                />
                <PolylineChart color="#FFFFFF" dashed points={[82, 88, 84, 80, 88, 88, 82, 88, 80, 90, 88, 82]} strokeWidth={1.25} />
              </BaseChart>
              <LegendRow
                items={[
                  {color: '#1497D5', label: 'Slip, Trip & Fall'},
                  {color: '#D9236B', label: 'Ergonomic / Manual Handling'},
                  {color: '#8CC63E', label: 'PPE Non-Compliance'},
                  {color: '#F05A22', label: 'Equipment Contact'},
                  {color: '#5A35B9', label: 'LOTO / Energy Control'},
                  {color: '#D39A05', label: 'Chemical Exposure'},
                  {color: '#FFFFFF', dashed: true, label: 'Target'},
                ]}
              />
            </Paper>

            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
              <Box sx={{height: 40, width: 512, border: '1px solid #E0E7F4', borderRadius: '11px', px: 1.2, display: 'flex', alignItems: 'center', color: '#CDD6E4'}}>
                <Typography sx={{fontSize: 16, flex: 1}}>Search</Typography>
                <SearchIcon sx={{fontSize: 22, color: '#3B82FF'}} />
              </Box>
              <Box sx={{height: 38, px: 1.5, border: '1px solid #3B82FF', borderRadius: '11px', display: 'flex', alignItems: 'center', gap: 0.8, color: '#3B82FF', fontSize: 14, fontWeight: 800}}>
                <FilterListIcon sx={{fontSize: 18}} />
                FILTERS
              </Box>
            </Box>

            <Box sx={{minHeight: 0, overflow: 'hidden'}}>
              <Box sx={{display: 'grid', gridTemplateColumns: '90px 156px minmax(0, 2fr) 104px 112px 204px 104px 154px', alignItems: 'center', color: '#FFFFFF', fontSize: 14, fontWeight: 900, px: 1, pb: 1.2}}>
                {['ID', 'CREATION DATE', 'TITLE', 'TYPE', 'LOCATION', 'ASSIGNED TO', 'PRIORITY', 'STATUS'].map((head, index) => (
                  <Box key={head} sx={{height: 25, display: 'flex', alignItems: 'center', gap: 0.7, borderRight: index < 7 ? '1px solid rgba(214,224,242,0.34)' : '1px solid rgba(214,224,242,0.34)', pr: 1}}>
                    {head}
                    {(index === 1 || index === 2) ? <Typography sx={{fontSize: 13, color: '#748095', ml: 'auto'}}>↕</Typography> : null}
                  </Box>
                ))}
              </Box>
              <Box sx={{display: 'grid', gridAutoRows: '52px'}}>
                {rows.map((row, rowIndex) => (
                  <Box key={row[0]} sx={{display: 'grid', gridTemplateColumns: '90px 156px minmax(0, 2fr) 104px 112px 204px 104px 154px', alignItems: 'center', px: 1, bgcolor: rowIndex % 2 === 0 ? '#222C3B' : '#364250', color: '#FFFFFF', fontSize: 14}}>
                    {row.map((cell, index) => (
                      <Box key={`${row[0]}-${index}`} sx={{minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: index === 6 ? (cell === 'High' ? '#FF4D48' : cell === 'Medium' ? '#FFAE33' : '#82D889') : '#FFFFFF'}}>
                        {index === 7 ? <EsoStatusPill status={cell} /> : cell}
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 1.15, color: '#FFFFFF'}}>
                <KeyboardArrowLeftIcon sx={{fontSize: 20, color: '#8E99AA'}} />
                <Box sx={{width: 26, height: 26, borderRadius: '50%', bgcolor: '#657080', display: 'grid', placeItems: 'center', fontSize: 13}}>1</Box>
                <Typography sx={{fontSize: 14}}>2</Typography>
                <Typography sx={{fontSize: 14}}>3</Typography>
                <KeyboardArrowRightIcon sx={{fontSize: 20}} />
              </Box>
            </Box>
          </Box>

          <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 2, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
            <Typography sx={{fontSize: 16, color: '#FFFFFF', fontWeight: 800, mb: 1.25}}>Comments</Typography>
            <Box sx={{borderRadius: '10px', bgcolor: '#374352', px: 1.4, py: 1.05}}>
              <Typography sx={{fontSize: 14, color: '#FFFFFF', lineHeight: 1.42, mb: 1}}>
                I noticed a significant spike in "Slip, Trip and Fall" during September. I've started an audit on Line 1 to verify if the new floor cleaning protocols are being strictly followed.
              </Typography>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#AAB4C5'}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
                  <Avatar src="/images/Maria.png" sx={{width: 18, height: 18}} />
                  <Typography sx={{fontSize: 12}}>Maria Pinna</Typography>
                </Box>
                <Typography sx={{fontSize: 12}}>Sep 05, 09:20</Typography>
              </Box>
            </Box>
            <Box sx={{mt: 'auto', height: 40, border: '1px solid #3A86FF', borderRadius: '10px', display: 'flex', alignItems: 'center', px: 1.3, color: '#BBC5D3'}}>
              <Typography sx={{fontSize: 15, flex: 1}}>Leave a comment</Typography>
              <SendIcon sx={{fontSize: 28, color: '#3B82FF'}} />
            </Box>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}

function QualityIssuesDrilldown({onClose}: {onClose: () => void}) {
  const months = ['Oct 24', 'Nov 24', 'Dez 24', 'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25'];

  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 20, bgcolor: 'rgba(0,0,0,0.66)', display: 'grid', placeItems: 'center'}}>
      <Paper
        elevation={0}
        sx={{
          width: '86.4vw',
          height: '83.6vh',
          maxWidth: 1660,
          maxHeight: 903,
          minWidth: 1120,
          minHeight: 680,
          bgcolor: '#323D4A',
          borderRadius: 0,
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
          p: 2.5,
          display: 'grid',
          gridTemplateRows: '44px 38px minmax(0, 1fr)',
          gap: 1,
          overflow: 'hidden',
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Typography sx={{fontSize: 22, color: '#FFFFFF', fontWeight: 800}}>Quality Issues</Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.1, color: '#FFFFFF'}}>
            <Typography sx={{fontSize: 16}}>Yearly</Typography>
            <ArrowDropDownIcon sx={{fontSize: 18, color: '#B7C0CE'}} />
            <SparkleIcon sx={{fontSize: 21, color: '#66758D'}} />
            <IconButton onClick={onClose} sx={{width: 28, height: 28, color: '#2F83FF', '&:hover': {bgcolor: 'rgba(47,131,255,0.12)'}}}>
              <CloseIcon sx={{fontSize: 20}} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{display: 'flex', alignItems: 'end', gap: 3.2}}>
          {['TOTAL', 'CELL', 'LINE', 'SHIFT'].map((tab, index) => (
            <Box key={tab} sx={{height: 30, px: 1.55, borderBottom: index === 0 ? '2px solid #2F83FF' : '2px solid transparent', color: index === 0 ? '#2F83FF' : '#C6CEDA', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center'}}>
              {tab}
            </Box>
          ))}
        </Box>

        <Box sx={{minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 310px', gap: 1.55}}>
          <Box sx={{minHeight: 0, display: 'grid', gridTemplateRows: 'minmax(0, 1fr) 370px', gap: 1.55}}>
            <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0, overflow: 'hidden'}}>
              <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 800, mb: 1.2}}>Total Non Conformances (NCs)</Typography>
              <BaseChart bottomLabels={months} chartHeight={258} leftTicks={['20K', '15K', '10K', '5K', '0']} topPadding={8}>
                <BarChart bars={[78, 65, 78, 66, 78, 66, 78, 61, 78, 66, 65, 78]} color="#1497D5" />
                <PolylineChart color="#FFFFFF" dashed points={[68, 72, 70, 68, 72, 72, 68, 72, 67, 73, 72, 68]} strokeWidth={1.25} />
              </BaseChart>
              <LegendRow items={[{color: '#1497D5', label: 'NCs'}, {color: '#FFFFFF', dashed: true, label: 'Target'}]} />
            </Paper>

            <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.55, minHeight: 0}}>
              <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0, overflow: 'hidden'}}>
                <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 800, mb: 1.1}}>Total Field Actions</Typography>
                <BaseChart bottomLabels={months} chartHeight={258} leftTicks={['16K', '12K', '8K', '4K', '0']} topPadding={8}>
                  <BarChart bars={[78, 65, 78, 66, 78, 66, 78, 61, 78, 66, 65, 78]} color="#5B35B9" />
                  <PolylineChart color="#FFFFFF" dashed points={[72, 67, 72, 68, 72, 67, 72, 62, 72, 66, 66, 72]} strokeWidth={1.25} />
                </BaseChart>
                <LegendRow items={[{color: '#5B35B9', label: 'Field Actions'}, {color: '#FFFFFF', dashed: true, label: 'Target'}]} />
              </Paper>

              <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0, overflow: 'hidden'}}>
                <BaseChart bottomLabels={months} chartHeight={292} leftTicks={['16K', '12K', '8K', '4K', '0']} topPadding={8}>
                  <BarChart bars={[82, 70, 82, 72, 82, 72, 82, 68, 82, 72, 72, 82]} color="#B5B822" />
                  <PolylineChart color="#FFFFFF" dashed points={[72, 69, 72, 69, 72, 69, 72, 68, 72, 69, 70, 69]} strokeWidth={1.25} />
                </BaseChart>
                <LegendRow items={[{color: '#B5B822', label: 'Complaints'}, {color: '#FFFFFF', dashed: true, label: 'Target'}]} />
              </Paper>
            </Box>
          </Box>

          <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 2, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
            <Typography sx={{fontSize: 16, color: '#FFFFFF', fontWeight: 800, mb: 1.25}}>Comments</Typography>
            <Box sx={{borderRadius: '10px', bgcolor: '#374352', px: 1.4, py: 1.05}}>
              <Typography sx={{fontSize: 14, color: '#FFFFFF', lineHeight: 1.42, mb: 1}}>
                Non-conformances in Cell 5 have been successfully corrected and re-training of the operators is complete.
              </Typography>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#AAB4C5'}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
                  <Avatar src="/images/Maria.png" sx={{width: 18, height: 18}} />
                  <Typography sx={{fontSize: 12}}>Maria Pinna</Typography>
                </Box>
                <Typography sx={{fontSize: 12}}>Sep 05, 09:20</Typography>
              </Box>
            </Box>
            <Box sx={{mt: 'auto', height: 40, border: '1px solid #3A86FF', borderRadius: '10px', display: 'flex', alignItems: 'center', px: 1.3, color: '#BBC5D3'}}>
              <Typography sx={{fontSize: 15, flex: 1}}>Leave a comment</Typography>
              <SendIcon sx={{fontSize: 28, color: '#3B82FF'}} />
            </Box>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}

function BatchStatusPill({status}: {status: string}) {
  const bg = status === 'Released' ? '#82D889' : status === 'Under Review' ? '#FFAE33' : '#FF5B63';
  const color = status === 'Under Review' ? '#111827' : status === 'Released' ? '#0F2718' : '#FFFFFF';

  return (
    <Box sx={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 27, px: 1.35, borderRadius: '999px', bgcolor: bg, color, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap'}}>
      {status}
    </Box>
  );
}

function BatchesOnHoldDrilldown({onClose}: {onClose: () => void}) {
  const months = ['Oct 24', 'Nov 24', 'Dez 24', 'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25'];
  const rows = [
    ['BZ29391', 'May 28, 2025', 'Nexiva', 'NX-9981', 'NX-9981', 'Documentation Error', 'Line 1', 'John Smith', 'High', 'On Hold'],
    ['BZ29392', 'May 27, 2025', 'Autoguard', 'AG-4829', 'AG-4829', 'Out of Specification', 'Line 3', 'James Miller', 'High', 'Under Review'],
    ['BZ29393', 'May 25, 2025', 'Eclypse', 'EC-5201', 'EC-5201', 'Material Defect', 'Line 2', 'Olivia Martin', 'Medium', 'Released'],
    ['BZ29394', 'May 24, 2025', 'Syringe', 'SY-3811', 'SY-3811', 'Process Non-Conformity', 'Line 4', 'Gracie Walker', 'Low', 'On Hold'],
  ];

  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 20, bgcolor: 'rgba(0,0,0,0.66)', display: 'grid', placeItems: 'center'}}>
      <Paper
        elevation={0}
        sx={{
          width: '86.4vw',
          height: '83.6vh',
          maxWidth: 1660,
          maxHeight: 903,
          minWidth: 1120,
          minHeight: 680,
          bgcolor: '#323D4A',
          borderRadius: 0,
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
          p: 2.5,
          display: 'grid',
          gridTemplateRows: '44px 38px minmax(0, 1fr)',
          gap: 1,
          overflow: 'hidden',
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Typography sx={{fontSize: 22, color: '#FFFFFF', fontWeight: 800}}>Batches On Hold</Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.1, color: '#FFFFFF'}}>
            <Typography sx={{fontSize: 16}}>All Products</Typography>
            <ArrowDropDownIcon sx={{fontSize: 18, color: '#B7C0CE'}} />
            <Typography sx={{fontSize: 16}}>Yearly</Typography>
            <ArrowDropDownIcon sx={{fontSize: 18, color: '#B7C0CE'}} />
            <SparkleIcon sx={{fontSize: 21, color: '#66758D'}} />
            <IconButton onClick={onClose} sx={{width: 28, height: 28, color: '#2F83FF', '&:hover': {bgcolor: 'rgba(47,131,255,0.12)'}}}>
              <CloseIcon sx={{fontSize: 20}} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{display: 'flex', alignItems: 'end', gap: 3.2}}>
          {['TOTAL', 'CELL', 'LINE', 'SHIFT'].map((tab, index) => (
            <Box key={tab} sx={{height: 30, px: 1.55, borderBottom: index === 0 ? '2px solid #2F83FF' : '2px solid transparent', color: index === 0 ? '#2F83FF' : '#C6CEDA', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center'}}>
              {tab}
            </Box>
          ))}
        </Box>

        <Box sx={{minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 310px', gap: 1.55}}>
          <Box sx={{minHeight: 0, display: 'grid', gridTemplateRows: '370px 52px minmax(0, 1fr)', gap: 1.5}}>
            <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0, overflow: 'hidden'}}>
              <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, mb: 2}}>
                <Box sx={{height: 66, borderRadius: '5px', bgcolor: '#364250', borderLeft: '5px solid #22AFFF', px: 1.2, py: 0.75}}>
                  <Typography sx={{fontSize: 34, color: '#FFFFFF', lineHeight: 0.95}}>10</Typography>
                  <Typography sx={{fontSize: 12, color: '#FFFFFF', mt: 0.45}}>Batches On Hold</Typography>
                </Box>
                <Box sx={{height: 66, borderRadius: '5px', bgcolor: '#364250', borderLeft: '5px solid #22AFFF', px: 1.2, py: 0.75}}>
                  <Typography sx={{fontSize: 34, color: '#FFFFFF', lineHeight: 0.95}}>15.000</Typography>
                  <Typography sx={{fontSize: 12, color: '#FFFFFF', mt: 0.45}}>Product Quantity</Typography>
                </Box>
                <Box sx={{height: 66, borderRadius: '5px', bgcolor: '#364250', borderLeft: '5px solid #22AFFF', px: 1.2, py: 0.75}}>
                  <Box sx={{display: 'flex', alignItems: 'baseline', gap: 0.6}}>
                    <Typography sx={{fontSize: 34, color: '#FFFFFF', lineHeight: 0.95}}>2.4</Typography>
                    <Typography sx={{fontSize: 22, color: '#D7DFEC'}}>days</Typography>
                  </Box>
                  <Typography sx={{fontSize: 12, color: '#FFFFFF', mt: 0.45}}>Release (AVG)</Typography>
                </Box>
              </Box>

              <BaseChart bottomLabels={months} chartHeight={205} leftTicks={['16', '12', '8', '4', '0']} topPadding={8}>
                <StackedBarChart
                  series={[
                    {color: '#1497D5', values: [18, 12, 18, 12, 18, 12, 18, 12, 18, 12, 12, 18]},
                    {color: '#D9236B', values: [16, 12, 16, 12, 16, 12, 16, 12, 16, 12, 12, 16]},
                    {color: '#8CC63E', values: [17, 12, 17, 12, 17, 12, 17, 12, 17, 12, 12, 17]},
                    {color: '#F05A22', values: [17, 13, 17, 13, 17, 13, 17, 12, 17, 13, 13, 17]},
                    {color: '#06786B', values: [17, 13, 17, 13, 17, 13, 17, 12, 17, 13, 13, 17]},
                    {color: '#5A35B9', values: [17, 13, 17, 13, 17, 13, 17, 12, 17, 13, 13, 17]},
                    {color: '#D39A05', values: [17, 13, 17, 13, 17, 13, 17, 12, 17, 13, 13, 17]},
                  ]}
                />
                <PolylineChart color="#FFFFFF" dashed points={[72, 78, 76, 73, 78, 78, 72, 78, 72, 80, 78, 72]} strokeWidth={1.25} />
              </BaseChart>
              <LegendRow
                items={[
                  {color: '#1497D5', label: 'Nexiva'},
                  {color: '#D9236B', label: 'Autoguard'},
                  {color: '#8CC63E', label: 'Eclypse'},
                  {color: '#F05A22', label: 'Syringe'},
                  {color: '#06786B', label: 'Needle'},
                  {color: '#5A35B9', label: 'Molding'},
                  {color: '#D39A05', label: 'Cannula'},
                  {color: '#FFFFFF', dashed: true, label: 'Target'},
                ]}
              />
            </Paper>

            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
              <Box sx={{height: 40, width: 512, border: '1px solid #E0E7F4', borderRadius: '11px', px: 1.2, display: 'flex', alignItems: 'center', color: '#CDD6E4'}}>
                <Typography sx={{fontSize: 16, flex: 1}}>Search</Typography>
                <SearchIcon sx={{fontSize: 22, color: '#3B82FF'}} />
              </Box>
              <Box sx={{height: 38, px: 1.5, border: '1px solid #3B82FF', borderRadius: '11px', display: 'flex', alignItems: 'center', gap: 0.8, color: '#3B82FF', fontSize: 14, fontWeight: 800}}>
                <FilterListIcon sx={{fontSize: 18}} />
                FILTERS
              </Box>
            </Box>

            <Box sx={{minHeight: 0, overflow: 'hidden'}}>
              <Box sx={{display: 'grid', gridTemplateColumns: '90px 116px 126px 104px 112px minmax(0, 1.7fr) 126px 160px 104px 144px', alignItems: 'center', color: '#FFFFFF', fontSize: 14, fontWeight: 900, px: 1, pb: 1.2}}>
                {['ID', 'DATE', 'PRODUCT', 'BATCH NO', 'QTY (UNITS)', 'HOLD REASON', 'LOCATION', 'ASSIGNED TO', 'PRIORITY', 'STATUS'].map((head, index) => (
                  <Box key={head} sx={{height: 25, display: 'flex', alignItems: 'center', gap: 0.7, borderRight: '1px solid rgba(214,224,242,0.34)', pr: 1}}>
                    {head}
                    {(index === 1 || index === 2) ? <Typography sx={{fontSize: 13, color: '#748095', ml: 'auto'}}>↕</Typography> : null}
                  </Box>
                ))}
              </Box>
              <Box sx={{display: 'grid', gridAutoRows: '52px'}}>
                {rows.map((row, rowIndex) => (
                  <Box key={row[0]} sx={{display: 'grid', gridTemplateColumns: '90px 116px 126px 104px 112px minmax(0, 1.7fr) 126px 160px 104px 144px', alignItems: 'center', px: 1, bgcolor: rowIndex % 2 === 0 ? '#222C3B' : '#364250', color: '#FFFFFF', fontSize: 14}}>
                    {row.map((cell, index) => (
                      <Box key={`${row[0]}-${index}`} sx={{minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: index === 8 ? (cell === 'High' ? '#FF4D48' : cell === 'Medium' ? '#FFAE33' : '#82D889') : '#FFFFFF'}}>
                        {index === 9 ? <BatchStatusPill status={cell} /> : cell}
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 1.15, color: '#FFFFFF'}}>
                <KeyboardArrowLeftIcon sx={{fontSize: 20, color: '#8E99AA'}} />
                <Box sx={{width: 26, height: 26, borderRadius: '50%', bgcolor: '#657080', display: 'grid', placeItems: 'center', fontSize: 13}}>1</Box>
                <Typography sx={{fontSize: 14}}>2</Typography>
                <Typography sx={{fontSize: 14}}>3</Typography>
                <KeyboardArrowRightIcon sx={{fontSize: 20}} />
              </Box>
            </Box>
          </Box>

          <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 2, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
            <Typography sx={{fontSize: 16, color: '#FFFFFF', fontWeight: 800, mb: 1.25}}>Comments</Typography>
            <Box sx={{borderRadius: '10px', bgcolor: '#374352', px: 1.4, py: 1.05}}>
              <Typography sx={{fontSize: 14, color: '#FFFFFF', lineHeight: 1.42, mb: 1}}>
                Nexiva Batch NX-9801 is held on Line 1. The documentation integrity error is being resolved with the compliance team.
              </Typography>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#AAB4C5'}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
                  <Avatar src="/images/Maria.png" sx={{width: 18, height: 18}} />
                  <Typography sx={{fontSize: 12}}>Maria Pinna</Typography>
                </Box>
                <Typography sx={{fontSize: 12}}>Sep 05, 09:20</Typography>
              </Box>
            </Box>
            <Box sx={{mt: 'auto', height: 40, border: '1px solid #3A86FF', borderRadius: '10px', display: 'flex', alignItems: 'center', px: 1.3, color: '#BBC5D3'}}>
              <Typography sx={{fontSize: 15, flex: 1}}>Leave a comment</Typography>
              <SendIcon sx={{fontSize: 28, color: '#3B82FF'}} />
            </Box>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}

function QualityStatusInvestigationDrilldown({onClose}: {onClose: () => void}) {
  const modalMonths = ['Oct 24', 'Nov 24', 'Dez 24', 'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25'];
  const rows = [
    ['AS932801', 'May 28, 2025', 'OOS found in Batch 501 during inspection', 'NC', 'Line 1', 'John Smith', 'High', 'Open'],
    ['AS932802', 'May 27, 2025', 'Conduct staff training on compliance checks', 'FA', 'Line 4', 'James Miller', 'Medium', 'Under Review'],
    ['AS932803', 'May 25, 2025', 'Supplier component defect investigation #25', 'CP', 'Line 2', 'Olivia Martin', 'Low', 'Completed'],
    ['AS932804', 'May 24, 2025', 'Schedule raw material line clearance audit', 'NC', 'Line 3', 'Gracie Walker', 'Low', 'Canceled'],
  ];

  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 20, bgcolor: 'rgba(0,0,0,0.66)', display: 'grid', placeItems: 'center'}}>
      <Paper
        elevation={0}
        sx={{
          width: '86.4vw',
          height: '83.6vh',
          maxWidth: 1660,
          maxHeight: 903,
          minWidth: 1120,
          minHeight: 680,
          bgcolor: '#323D4A',
          borderRadius: 0,
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
          p: 2.5,
          display: 'grid',
          gridTemplateRows: '44px 38px minmax(0, 1fr)',
          gap: 1,
          overflow: 'hidden',
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Typography sx={{fontSize: 22, color: '#FFFFFF', fontWeight: 800}}>Status &amp; Investigation</Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.1, color: '#FFFFFF'}}>
            <Typography sx={{fontSize: 16}}>Yearly</Typography>
            <ArrowDropDownIcon sx={{fontSize: 18, color: '#B7C0CE'}} />
            <SparkleIcon sx={{fontSize: 21, color: '#66758D'}} />
            <IconButton onClick={onClose} sx={{width: 28, height: 28, color: '#2F83FF', '&:hover': {bgcolor: 'rgba(47,131,255,0.12)'}}}>
              <CloseIcon sx={{fontSize: 20}} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{display: 'flex', alignItems: 'end', gap: 3.2}}>
          {['TOTAL', 'CELL', 'LINE', 'SHIFT'].map((tab, index) => (
            <Box key={tab} sx={{height: 30, px: 1.55, borderBottom: index === 0 ? '2px solid #2F83FF' : '2px solid transparent', color: index === 0 ? '#2F83FF' : '#C6CEDA', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center'}}>
              {tab}
            </Box>
          ))}
        </Box>

        <Box sx={{minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 310px', gap: 1.55}}>
          <Box sx={{minHeight: 0, display: 'grid', gridTemplateRows: '370px 52px minmax(0, 1fr)', gap: 1.5}}>
            <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0, overflow: 'hidden'}}>
              <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 1, mb: 2}}>
                {[
                  ['18', 'Total Status Items'],
                  ['7', 'Open Incidents'],
                  ['5', 'Under Investigation'],
                  ['4', 'Action Plan Defined'],
                ].map(([value, label]) => (
                  <Box key={label} sx={{height: 66, borderRadius: '5px', bgcolor: '#364250', borderLeft: '5px solid #22AFFF', px: 1.2, py: 0.75}}>
                    <Typography sx={{fontSize: 34, color: '#FFFFFF', lineHeight: 0.95}}>{value}</Typography>
                    <Typography sx={{fontSize: 12, color: '#FFFFFF', mt: 0.45}}>{label}</Typography>
                  </Box>
                ))}
              </Box>
              <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 800, mb: 1.1}}>Root Cause Investigation Categories</Typography>
              <BaseChart bottomLabels={modalMonths} chartHeight={176} leftTicks={['5', '4', '3', '2', '1', '0']} topPadding={8}>
                <StackedBarChart
                  series={[
                    {color: '#1497D5', values: [14, 9, 14, 9, 14, 9, 14, 8, 14, 9, 9, 14]},
                    {color: '#D9236B', values: [12, 8, 12, 8, 12, 8, 12, 7, 12, 8, 8, 12]},
                    {color: '#8CC63E', values: [12, 9, 12, 9, 12, 9, 12, 8, 12, 9, 9, 12]},
                    {color: '#F05A22', values: [12, 8, 12, 8, 12, 8, 12, 7, 12, 8, 8, 12]},
                  ]}
                />
                <PolylineChart color="#FFFFFF" dashed points={[72, 78, 76, 72, 78, 78, 72, 78, 70, 80, 78, 72]} strokeWidth={1.25} />
              </BaseChart>
              <LegendRow
                items={[
                  {color: '#1497D5', label: 'Out of Specification (OOS)'},
                  {color: '#D9236B', label: 'Process Non-Conformity'},
                  {color: '#8CC63E', label: 'Material/Supplier Defect'},
                  {color: '#F05A22', label: 'Doc Integrity Error'},
                  {color: '#FFFFFF', dashed: true, label: 'Target'},
                ]}
              />
            </Paper>

            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
              <Box sx={{height: 40, width: 512, border: '1px solid #E0E7F4', borderRadius: '11px', px: 1.2, display: 'flex', alignItems: 'center', color: '#CDD6E4'}}>
                <Typography sx={{fontSize: 16, flex: 1}}>Search</Typography>
                <SearchIcon sx={{fontSize: 22, color: '#3B82FF'}} />
              </Box>
              <Box sx={{height: 38, px: 1.5, border: '1px solid #3B82FF', borderRadius: '11px', display: 'flex', alignItems: 'center', gap: 0.8, color: '#3B82FF', fontSize: 14, fontWeight: 800}}>
                <FilterListIcon sx={{fontSize: 18}} />
                FILTERS
              </Box>
            </Box>

            <Box sx={{minHeight: 0, overflow: 'hidden'}}>
              <Box sx={{display: 'grid', gridTemplateColumns: '90px 156px minmax(0, 2fr) 104px 112px 204px 104px 154px', alignItems: 'center', color: '#FFFFFF', fontSize: 14, fontWeight: 900, px: 1, pb: 1.2}}>
                {['ID', 'CREATION DATE', 'TITLE', 'TYPE', 'LOCATION', 'ASSIGNED TO', 'PRIORITY', 'STATUS'].map((head, index) => (
                  <Box key={head} sx={{height: 25, display: 'flex', alignItems: 'center', gap: 0.7, borderRight: '1px solid rgba(214,224,242,0.34)', pr: 1}}>
                    {head}
                    {(index === 1 || index === 2) ? <Typography sx={{fontSize: 13, color: '#748095', ml: 'auto'}}>↕</Typography> : null}
                  </Box>
                ))}
              </Box>
              <Box sx={{display: 'grid', gridAutoRows: '52px'}}>
                {rows.map((row, rowIndex) => (
                  <Box key={row[0]} sx={{display: 'grid', gridTemplateColumns: '90px 156px minmax(0, 2fr) 104px 112px 204px 104px 154px', alignItems: 'center', px: 1, bgcolor: rowIndex % 2 === 0 ? '#222C3B' : '#364250', color: '#FFFFFF', fontSize: 14}}>
                    {row.map((cell, index) => (
                      <Box key={`${row[0]}-${index}`} sx={{minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: index === 6 ? (cell === 'High' ? '#FF4D48' : cell === 'Medium' ? '#FFAE33' : '#82D889') : '#FFFFFF'}}>
                        {index === 7 ? <EsoStatusPill status={cell} /> : cell}
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 1.15, color: '#FFFFFF'}}>
                <KeyboardArrowLeftIcon sx={{fontSize: 20, color: '#8E99AA'}} />
                <Box sx={{width: 26, height: 26, borderRadius: '50%', bgcolor: '#657080', display: 'grid', placeItems: 'center', fontSize: 13}}>1</Box>
                <Typography sx={{fontSize: 14}}>2</Typography>
                <Typography sx={{fontSize: 14}}>3</Typography>
                <KeyboardArrowRightIcon sx={{fontSize: 20}} />
              </Box>
            </Box>
          </Box>

          <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 2, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
            <Typography sx={{fontSize: 16, color: '#FFFFFF', fontWeight: 800, mb: 1.25}}>Comments</Typography>
            <Box sx={{flex: 1, display: 'grid', placeItems: 'center', color: '#AEB8C7', textAlign: 'center'}}>
              <Box>
                <ModeCommentOutlinedIcon sx={{fontSize: 34, mb: 1.2, color: '#AEB8C7'}} />
                <Typography sx={{fontSize: 16, color: '#FFFFFF', fontWeight: 800, mb: 0.45}}>No comments yet</Typography>
                <Typography sx={{fontSize: 14, color: '#AEB8C7'}}>Be the first to share an insight!</Typography>
              </Box>
            </Box>
            <Box sx={{mt: 'auto', height: 40, border: '1px solid #3A86FF', borderRadius: '10px', display: 'flex', alignItems: 'center', px: 1.3, color: '#BBC5D3'}}>
              <Typography sx={{fontSize: 15, flex: 1}}>Leave a comment</Typography>
              <SendIcon sx={{fontSize: 28, color: '#3B82FF'}} />
            </Box>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}

function ProductionOutputDrilldown({onClose}: {onClose: () => void}) {
  const hours = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];
  const lossRows = [
    ['Zone 5', 'Z5C20', 'Machine Failures', '4,691'],
    ['', 'Z5C10', 'Speed Losses', '1,860'],
    ['', 'Z5C12', 'Quality Losses', '1,737'],
    ['Zone 1', 'Z1C01', 'Machine Failures', '900'],
    ['', 'Z1C23', 'Speed Losses', '762'],
  ];

  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 20, bgcolor: 'rgba(0,0,0,0.66)', display: 'grid', placeItems: 'center'}}>
      <Paper
        elevation={0}
        sx={{
          width: '86.4vw',
          height: '83.6vh',
          maxWidth: 1660,
          maxHeight: 903,
          minWidth: 1120,
          minHeight: 680,
          bgcolor: '#323D4A',
          borderRadius: 0,
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
          p: 2.5,
          display: 'grid',
          gridTemplateRows: '44px 38px minmax(0, 1fr)',
          gap: 1,
          overflow: 'hidden',
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Typography sx={{fontSize: 22, color: '#FFFFFF', fontWeight: 800}}>Product Output And Waste</Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.1, color: '#FFFFFF'}}>
            <Typography sx={{fontSize: 16}}>Yearly</Typography>
            <ArrowDropDownIcon sx={{fontSize: 18, color: '#B7C0CE'}} />
            <SparkleIcon sx={{fontSize: 21, color: '#66758D'}} />
            <IconButton onClick={onClose} sx={{width: 28, height: 28, color: '#2F83FF', '&:hover': {bgcolor: 'rgba(47,131,255,0.12)'}}}>
              <CloseIcon sx={{fontSize: 20}} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{display: 'flex', alignItems: 'end', gap: 3.2}}>
          {['TOTAL', 'CELL', 'LINE', 'SHIFT'].map((tab, index) => (
            <Box key={tab} sx={{height: 30, px: 1.55, borderBottom: index === 0 ? '2px solid #2F83FF' : '2px solid transparent', color: index === 0 ? '#2F83FF' : '#C6CEDA', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center'}}>
              {tab}
            </Box>
          ))}
        </Box>

        <Box sx={{minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 310px', gap: 1.55}}>
          <Box sx={{minHeight: 0, display: 'grid', gridTemplateRows: 'minmax(0, 1fr) 286px', gap: 1.55}}>
            <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0, overflow: 'hidden'}}>
              <BaseChart bottomLabels={hours} chartHeight={374} leftTicks={['150k', '125k', '100k', '75k', '50k', '25k', '0']} topPadding={8}>
                <MultiBarChart
                  series={[
                    {color: '#1497D5', values: [75, 67, 73, 73, 62, 70, 75, 73, 67]},
                    {color: '#D4252A', values: [56, 32, 51, 52, 37, 40, 48, 43, 28]},
                  ]}
                />
                <PolylineChart color="#FFFFFF" dashed points={[66, 68, 66, 68, 68, 65, 68, 68, 65]} strokeWidth={1.25} />
              </BaseChart>
              <LegendRow items={[{color: '#1497D5', label: 'Production Output'}, {color: '#D4252A', label: 'Waste'}, {color: '#FFFFFF', dashed: true, label: 'Target'}]} />
            </Paper>

            <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0, overflow: 'hidden'}}>
              <Typography sx={{fontSize: 20, color: '#FFFFFF', fontWeight: 800, mb: 2}}>Top Losses</Typography>
              <Box sx={{borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)'}}>
                <Box sx={{height: 34, bgcolor: '#111A2A', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', alignItems: 'center', px: 1.6, color: '#FFFFFF', fontSize: 14, fontWeight: 800}}>
                  <Typography sx={{fontSize: 14, fontWeight: 800}}>Zone</Typography>
                  <Typography sx={{fontSize: 14, fontWeight: 800}}>Cell</Typography>
                  <Typography sx={{fontSize: 14, fontWeight: 800}}>Reason</Typography>
                  <Typography sx={{fontSize: 14, fontWeight: 800}}>Parts</Typography>
                </Box>
                {lossRows.map((row, index) => (
                  <Box
                    key={`${row[1]}-${row[2]}`}
                    sx={{
                      height: 32,
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr 1fr',
                      alignItems: 'center',
                      px: 1.6,
                      bgcolor: index < 3 ? '#64262D' : '#111A2A',
                      borderTop: '1px solid rgba(255,255,255,0.08)',
                      color: '#FFFFFF',
                      fontSize: 14,
                    }}
                  >
                    <Typography sx={{fontSize: 14}}>{row[0]}</Typography>
                    <Typography sx={{fontSize: 14}}>{row[1]}</Typography>
                    <Typography sx={{fontSize: 14}}>{row[2]}</Typography>
                    <Typography sx={{fontSize: 14}}>{row[3]}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>

          <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 2, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
            <Typography sx={{fontSize: 16, color: '#FFFFFF', fontWeight: 800, mb: 1.25}}>Comments</Typography>
            <Box sx={{borderRadius: '10px', bgcolor: '#374352', px: 1.4, py: 1.05}}>
              <Typography sx={{fontSize: 14, color: '#FFFFFF', lineHeight: 1.42, mb: 1}}>
                Production losses on Line 1 have been minimized after adjusting nozzle parameters. Quality looks stable.
              </Typography>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#AAB4C5'}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
                  <Avatar src="/images/Maria.png" sx={{width: 18, height: 18}} />
                  <Typography sx={{fontSize: 12}}>Maria Pinna</Typography>
                </Box>
                <Typography sx={{fontSize: 12}}>Sep 05, 09:20</Typography>
              </Box>
            </Box>
            <Box sx={{mt: 'auto', height: 40, border: '1px solid #3A86FF', borderRadius: '10px', display: 'flex', alignItems: 'center', px: 1.3, color: '#BBC5D3'}}>
              <Typography sx={{fontSize: 15, flex: 1}}>Leave a comment</Typography>
              <SendIcon sx={{fontSize: 28, color: '#3B82FF'}} />
            </Box>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}

function OeeMetricDrillCard({
  delta,
  target,
  tiles,
  title,
  value,
}: {
  delta: string;
  target: string;
  tiles: Array<{label: string; value: string}>;
  title: string;
  value: string;
}) {
  return (
    <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0, overflow: 'hidden'}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.7}}>
        <Typography sx={{fontSize: 16, color: '#FFFFFF'}}>{title}</Typography>
        <Box sx={{px: 1, py: 0.45, borderRadius: '999px', bgcolor: '#4A5566', color: '#FFFFFF', fontSize: 12}}>{delta} vs Last Month</Box>
      </Box>
      <Box sx={{height: 138, display: 'grid', placeItems: 'center'}}>
        <Box sx={{position: 'relative', width: 240, height: 128}}>
          <Box sx={{position: 'absolute', inset: '0 0 auto 0', height: 120, borderRadius: '120px 120px 0 0', background: 'conic-gradient(from 270deg at 50% 100%, #B53B46 0deg, #B07A1E 34deg, #49C05B 42deg, #49C05B 150deg, #2C3546 152deg, #2C3546 180deg, transparent 180deg)'}} />
          <Box sx={{position: 'absolute', left: 12, right: 12, bottom: 0, height: 108, borderRadius: '108px 108px 0 0', bgcolor: '#222C3B'}} />
          <Typography sx={{position: 'absolute', left: 0, right: 0, top: 54, textAlign: 'center', fontSize: 40, color: '#FFFFFF', fontWeight: 400, lineHeight: 1}}>
            {value}<Typography component="span" sx={{fontSize: 17, color: '#CFD5E1', ml: 0.6}}>%</Typography>
          </Typography>
          <Typography sx={{position: 'absolute', left: 0, right: 0, top: 98, textAlign: 'center', fontSize: 14, color: '#54D76D'}}>Target: {target}</Typography>
        </Box>
      </Box>
      <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1}}>
        {tiles.map((tile) => (
          <Box key={tile.label} sx={{height: 66, borderRadius: '5px', bgcolor: '#364250', borderLeft: '5px solid #22AFFF', px: 1.15, py: 0.75}}>
            <Typography sx={{fontSize: 32, color: '#FFFFFF', lineHeight: 0.95}}>
              {tile.value}<Typography component="span" sx={{fontSize: 14, color: '#CFD5E1', ml: 0.35}}>%</Typography>
            </Typography>
            <Typography sx={{fontSize: 12, color: '#FFFFFF', mt: 0.4}}>{tile.label}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

function OeeDrilldown({onClose}: {onClose: () => void}) {
  const months = ['Oct 24', 'Nov 24', 'Dec 24', 'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25'];
  const oeePoints = [46, 48, 47, 45, 48, 48, 48, 48, 43, 49, 48, 46];
  const labels = ['80%', '80%', '80%', '80%', '80%', '80%', '80%', '80%', '80%', '80%', '80%', '80%'];

  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 20, bgcolor: 'rgba(0,0,0,0.66)', display: 'grid', placeItems: 'center'}}>
      <Paper
        elevation={0}
        sx={{
          width: '86.4vw',
          height: '83.6vh',
          maxWidth: 1660,
          maxHeight: 903,
          minWidth: 1120,
          minHeight: 680,
          bgcolor: '#323D4A',
          borderRadius: 0,
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
          p: 2.5,
          display: 'grid',
          gridTemplateRows: '44px 38px minmax(0, 1fr)',
          gap: 1,
          overflow: 'hidden',
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Typography sx={{fontSize: 22, color: '#FFFFFF', fontWeight: 800}}>OEE</Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.1, color: '#FFFFFF'}}>
            <Typography sx={{fontSize: 16}}>Yearly</Typography>
            <ArrowDropDownIcon sx={{fontSize: 18, color: '#B7C0CE'}} />
            <SparkleIcon sx={{fontSize: 21, color: '#66758D'}} />
            <IconButton onClick={onClose} sx={{width: 28, height: 28, color: '#2F83FF', '&:hover': {bgcolor: 'rgba(47,131,255,0.12)'}}}>
              <CloseIcon sx={{fontSize: 20}} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{display: 'flex', alignItems: 'end', gap: 3.2}}>
          {['TOTAL', 'CELL', 'LINE', 'SHIFT'].map((tab, index) => (
            <Box key={tab} sx={{height: 30, px: 1.55, borderBottom: index === 0 ? '2px solid #2F83FF' : '2px solid transparent', color: index === 0 ? '#2F83FF' : '#C6CEDA', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center'}}>
              {tab}
            </Box>
          ))}
        </Box>

        <Box sx={{minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 310px', gap: 1.55}}>
          <Box sx={{minHeight: 0, display: 'grid', gridTemplateRows: 'minmax(0, 1fr) 274px', gap: 1.55}}>
            <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0, overflow: 'hidden'}}>
              <BaseChart bottomLabels={months} chartHeight={386} leftTicks={['100%', '90%', '80%', '70%', '60%']} topPadding={8}>
                <PolylineChart color="#149BEA" points={oeePoints} strokeWidth={1.7} />
                <PolylineChart color="#FFFFFF" dashed points={[55, 58, 56, 55, 58, 58, 56, 58, 54, 59, 58, 55]} strokeWidth={1.25} />
                <LinePointOverlay dotColor="#149BEA" fontSize={12} labelColor="#FFFFFF" labelOffset={-15} labels={labels} points={oeePoints} />
              </BaseChart>
              <LegendRow items={[{color: '#149BEA', label: 'Performance'}, {color: '#FFFFFF', dashed: true, label: 'Target'}]} />
            </Paper>

            <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1.1, minHeight: 0}}>
              <OeeMetricDrillCard delta="+1.2%" target="85%" title="Availability" value="92" tiles={[{label: '2024', value: '91.2'}, {label: '2025', value: '91.8'}, {label: 'YTD', value: '92.0'}]} />
              <OeeMetricDrillCard delta="+2.1%" target="90%" title="Quality" value="94" tiles={[{label: '2024', value: '92.5'}, {label: '2025', value: '93.2'}, {label: 'YTD', value: '94.0'}]} />
              <OeeMetricDrillCard delta="+0.4%" target="95%" title="Performance" value="98.2" tiles={[{label: '2024', value: '97.8'}, {label: '2025', value: '98.0'}, {label: 'YTD', value: '98.2'}]} />
            </Box>
          </Box>

          <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 2, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
            <Typography sx={{fontSize: 16, color: '#FFFFFF', fontWeight: 800, mb: 1.25}}>Comments</Typography>
            <Box sx={{borderRadius: '10px', bgcolor: '#374352', px: 1.4, py: 1.05}}>
              <Typography sx={{fontSize: 14, color: '#FFFFFF', lineHeight: 1.42, mb: 1}}>
                We had a minor conveyor sensor alignment issue on Line 2 around 10:00, which dropped availability temporarily but is now fully resolved and back on track.
              </Typography>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#AAB4C5'}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
                  <Avatar src="/images/Maria.png" sx={{width: 18, height: 18}} />
                  <Typography sx={{fontSize: 12}}>Maria Pinna</Typography>
                </Box>
                <Typography sx={{fontSize: 12}}>Sep 05, 09:20</Typography>
              </Box>
            </Box>
            <Box sx={{mt: 'auto', height: 40, border: '1px solid #3A86FF', borderRadius: '10px', display: 'flex', alignItems: 'center', px: 1.3, color: '#BBC5D3'}}>
              <Typography sx={{fontSize: 15, flex: 1}}>Leave a comment</Typography>
              <SendIcon sx={{fontSize: 28, color: '#3B82FF'}} />
            </Box>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}

function ProductionRankingDrilldown({onClose}: {onClose: () => void}) {
  const rows = [
    {color: '#FF3333', name: 'Z1C20 (Line 1)', production: '840k units', waste: '43k units', lost: '120k units', tone: 'bad'},
    {color: '#FF9F1A', name: 'Z1C10 (Line 1)', production: '670k units', waste: '25k units', lost: '64k units', tone: 'warn'},
    {color: '#35BDF7', name: 'Z4C10 (Line 3)', production: '430k units', waste: '18k units', lost: '32k units', tone: 'default'},
    {color: '#35BDF7', name: 'Z2C30 (Line 2)', production: '550k units', waste: '12k units', lost: '15k units', tone: 'default'},
  ];

  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 20, bgcolor: 'rgba(0,0,0,0.66)', display: 'grid', placeItems: 'center'}}>
      <Paper
        elevation={0}
        sx={{
          width: '86.4vw',
          height: '83.6vh',
          maxWidth: 1660,
          maxHeight: 903,
          minWidth: 1120,
          minHeight: 680,
          bgcolor: '#323D4A',
          borderRadius: 0,
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
          p: 2.5,
          display: 'grid',
          gridTemplateRows: '44px 38px minmax(0, 1fr)',
          gap: 1,
          overflow: 'hidden',
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Typography sx={{fontSize: 22, color: '#FFFFFF', fontWeight: 800}}>OEE</Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.1, color: '#FFFFFF'}}>
            <Typography sx={{fontSize: 16}}>Yearly</Typography>
            <ArrowDropDownIcon sx={{fontSize: 18, color: '#B7C0CE'}} />
            <SparkleIcon sx={{fontSize: 21, color: '#66758D'}} />
            <IconButton onClick={onClose} sx={{width: 28, height: 28, color: '#2F83FF', '&:hover': {bgcolor: 'rgba(47,131,255,0.12)'}}}>
              <CloseIcon sx={{fontSize: 20}} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{display: 'flex', alignItems: 'end', gap: 3.2}}>
          {['TOTAL', 'CELL', 'LINE', 'SHIFT'].map((tab, index) => (
            <Box key={tab} sx={{height: 30, px: 1.55, borderBottom: index === 0 ? '2px solid #2F83FF' : '2px solid transparent', color: index === 0 ? '#2F83FF' : '#C6CEDA', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center'}}>
              {tab}
            </Box>
          ))}
        </Box>

        <Box sx={{minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 310px', gap: 1.55}}>
          <Box sx={{minHeight: 0, display: 'grid', gridTemplateRows: '315px minmax(0, 1fr)', gap: 1.5}}>
            <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, minHeight: 0}}>
              <DeliveryAddWidget wide />
              <DeliveryAddWidget wide />
            </Box>

            <Box sx={{minHeight: 0, display: 'flex', flexDirection: 'column'}}>
              <Typography sx={{fontSize: 20, color: '#FFFFFF', fontWeight: 800, mb: 2}}>Most Critical Units</Typography>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 2}}>
                <Box sx={{height: 40, width: 512, border: '1px solid #E0E7F4', borderRadius: '11px', px: 1.2, display: 'flex', alignItems: 'center', color: '#CDD6E4'}}>
                  <Typography sx={{fontSize: 16, flex: 1}}>Search</Typography>
                  <SearchIcon sx={{fontSize: 22, color: '#3B82FF'}} />
                </Box>
                <Box sx={{height: 38, px: 1.5, border: '1px solid #3B82FF', borderRadius: '11px', display: 'flex', alignItems: 'center', gap: 0.8, color: '#3B82FF', fontSize: 14, fontWeight: 800}}>
                  <FilterListIcon sx={{fontSize: 18}} />
                  FILTERS
                </Box>
              </Box>

              <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', color: '#FFFFFF', fontSize: 14, fontWeight: 900, px: 1, pb: 1.2}}>
                {['UNIT / CELL', 'PRODUCTION (ACTUAL)', 'WASTE / SCRAP', 'LOST PRODUCTION'].map((head) => (
                  <Box key={head} sx={{height: 25, display: 'flex', alignItems: 'center', borderRight: head !== 'LOST PRODUCTION' ? '1px solid rgba(214,224,242,0.34)' : 'none', pr: 1}}>
                    {head}
                  </Box>
                ))}
              </Box>

              <Box sx={{display: 'grid', gridAutoRows: '52px'}}>
                {rows.map((row, index) => (
                  <Box key={row.name} sx={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', alignItems: 'center', px: 1, bgcolor: index % 2 === 0 ? '#222C3B' : '#364250', color: '#FFFFFF', fontSize: 14}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, color: row.tone === 'bad' ? '#FF3333' : row.tone === 'warn' ? '#FF9F1A' : '#FFFFFF', fontWeight: row.tone === 'default' ? 400 : 800}}>
                      <Box sx={{width: 8, height: 8, borderRadius: '50%', bgcolor: row.color}} />
                      {row.name}
                    </Box>
                    <Typography sx={{fontSize: 14}}>{row.production}</Typography>
                    <Typography sx={{fontSize: 14}}>{row.waste}</Typography>
                    <Typography sx={{fontSize: 14, color: row.tone === 'bad' ? '#FF3333' : row.tone === 'warn' ? '#FF9F1A' : '#FFFFFF', fontWeight: row.tone === 'default' ? 400 : 800}}>{row.lost}</Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 1.8, color: '#FFFFFF'}}>
                <KeyboardArrowLeftIcon sx={{fontSize: 20, color: '#8E99AA'}} />
                <Box sx={{width: 26, height: 26, borderRadius: '50%', bgcolor: '#657080', display: 'grid', placeItems: 'center', fontSize: 13}}>1</Box>
                <Typography sx={{fontSize: 14}}>2</Typography>
                <KeyboardArrowRightIcon sx={{fontSize: 20}} />
              </Box>
            </Box>
          </Box>

          <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 2, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
            <Typography sx={{fontSize: 16, color: '#FFFFFF', fontWeight: 800, mb: 1.25}}>Comments</Typography>
            <Box sx={{borderRadius: '10px', bgcolor: '#374352', px: 1.4, py: 1.05}}>
              <Typography sx={{fontSize: 14, color: '#FFFFFF', lineHeight: 1.42, mb: 1}}>
                Production losses on Line 1 have been minimized after adjusting nozzle parameters. Quality looks stable.
              </Typography>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#AAB4C5'}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
                  <Avatar src="/images/Maria.png" sx={{width: 18, height: 18}} />
                  <Typography sx={{fontSize: 12}}>Maria Pinna</Typography>
                </Box>
                <Typography sx={{fontSize: 12}}>Sep 05, 09:20</Typography>
              </Box>
            </Box>
            <Box sx={{mt: 'auto', height: 40, border: '1px solid #3A86FF', borderRadius: '10px', display: 'flex', alignItems: 'center', px: 1.3, color: '#BBC5D3'}}>
              <Typography sx={{fontSize: 15, flex: 1}}>Leave a comment</Typography>
              <SendIcon sx={{fontSize: 28, color: '#3B82FF'}} />
            </Box>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}

function ProductionOverviewBeacon({
  alarm,
  downtime,
  line,
  stoppages,
  output,
}: {
  alarm?: boolean;
  downtime: string;
  line: string;
  output: string;
  stoppages: string;
}) {
  return (
    <Box sx={{height: 116, borderRadius: '6px', bgcolor: '#111A2A', border: alarm ? '1px solid #FF3D45' : '1px solid transparent', borderLeft: `6px solid ${alarm ? '#FF3D45' : '#67D783'}`, px: 1.3, py: 1.1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
      <Box>
        <Box sx={{display: 'inline-flex', px: 0.8, py: 0.3, borderRadius: '999px', bgcolor: '#536070', color: '#FFFFFF', fontSize: 10, fontWeight: 900}}>{output} OUTPUT</Box>
        <Typography sx={{fontSize: 16, color: '#FFFFFF', mt: 1.1}}>{line}</Typography>
        <Typography sx={{fontSize: 14, color: '#B8C2D1', mt: 0.55}}>Total Downtime</Typography>
      </Box>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <Typography sx={{fontSize: 13, color: alarm ? '#FF3D45' : '#67D783'}}>⊘ {downtime}</Typography>
        <Typography sx={{fontSize: 13, color: '#B8C2D1'}}>Minor Stoppages: <Typography component="span" sx={{fontSize: 13, color: '#FFB020'}}>⊘ {stoppages}</Typography></Typography>
      </Box>
    </Box>
  );
}

function UtilizationRow({label, segments}: {label: string; segments: Array<{color: string; width: number}>}) {
  return (
    <Box sx={{display: 'grid', gridTemplateColumns: '58px minmax(0, 1fr)', alignItems: 'center', gap: 1.3}}>
      <Typography sx={{fontSize: 14, color: '#B8C2D1', textAlign: 'right'}}>{label}</Typography>
      <Box sx={{height: 48, display: 'flex', overflow: 'hidden'}}>
        {segments.map((segment, index) => (
          <Box key={`${label}-${index}`} sx={{width: `${segment.width}%`, bgcolor: segment.color}} />
        ))}
      </Box>
    </Box>
  );
}

function ProductionOverviewDrilldown({onClose}: {onClose: () => void}) {
  const green = '#4CAF50';
  const orange = '#FB8C00';
  const red = '#E93635';
  const gray = '#6B7684';

  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 20, bgcolor: 'rgba(0,0,0,0.66)', display: 'grid', placeItems: 'center'}}>
      <Paper
        elevation={0}
        sx={{
          width: '86.4vw',
          height: '83.6vh',
          maxWidth: 1660,
          maxHeight: 903,
          minWidth: 1120,
          minHeight: 680,
          bgcolor: '#323D4A',
          borderRadius: 0,
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
          p: 2.5,
          display: 'grid',
          gridTemplateRows: '44px 38px minmax(0, 1fr)',
          gap: 1,
          overflow: 'hidden',
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Typography sx={{fontSize: 22, color: '#FFFFFF', fontWeight: 800}}>OEE</Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.1, color: '#FFFFFF'}}>
            <Typography sx={{fontSize: 16}}>Yearly</Typography>
            <ArrowDropDownIcon sx={{fontSize: 18, color: '#B7C0CE'}} />
            <SparkleIcon sx={{fontSize: 21, color: '#66758D'}} />
            <IconButton onClick={onClose} sx={{width: 28, height: 28, color: '#2F83FF', '&:hover': {bgcolor: 'rgba(47,131,255,0.12)'}}}>
              <CloseIcon sx={{fontSize: 20}} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{display: 'flex', alignItems: 'end', gap: 3.2}}>
          {['TOTAL', 'CELL', 'LINE', 'SHIFT'].map((tab, index) => (
            <Box key={tab} sx={{height: 30, px: 1.55, borderBottom: index === 0 ? '2px solid #2F83FF' : '2px solid transparent', color: index === 0 ? '#2F83FF' : '#C6CEDA', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center'}}>
              {tab}
            </Box>
          ))}
        </Box>

        <Box sx={{minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 310px', gap: 1.55}}>
          <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 1, minHeight: 0}}>
            <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0, overflow: 'hidden'}}>
              <Typography sx={{fontSize: 20, color: '#FFFFFF', fontWeight: 800, mb: 2}}>Live Status Beacons (Total Mode)</Typography>
              <Box sx={{display: 'grid', gap: 1.15}}>
                <ProductionOverviewBeacon downtime="0 min (Active)" line="Line 01" output="92%" stoppages="15 mins" />
                <ProductionOverviewBeacon downtime="0 min (Active)" line="Line 02" output="88%" stoppages="8 mins" />
                <ProductionOverviewBeacon downtime="0 min (Active)" line="Line 03" output="72%" stoppages="32 mins" />
                <ProductionOverviewBeacon alarm downtime="84 mins (Alarm: feed jam packaging station)" line="Line 04" output="48%" stoppages="43 mins" />
                <ProductionOverviewBeacon downtime="0 min (Active)" line="Line 05" output="68%" stoppages="19 mins" />
              </Box>
            </Paper>

            <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0, overflow: 'hidden'}}>
              <Typography sx={{fontSize: 20, color: '#FFFFFF', fontWeight: 800, mb: 2}}>Machine Utilization (0:00 -12:00)</Typography>
              <Box sx={{display: 'grid', gridTemplateColumns: '58px 1fr', mb: 1.3}}>
                <Box />
                <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', color: '#B8C2D1', fontSize: 12, px: 7}}>
                  <Typography sx={{fontSize: 12}}>03/30</Typography>
                  <Typography sx={{fontSize: 12}}>03/31</Typography>
                  <Typography sx={{fontSize: 12}}>04/01</Typography>
                </Box>
              </Box>
              <Box sx={{display: 'grid', gap: 1.75}}>
                <UtilizationRow label="Z5C30" segments={[{color: green, width: 39}, {color: red, width: 2}, {color: orange, width: 15}, {color: green, width: 44}]} />
                <UtilizationRow label="Z1C20" segments={[{color: green, width: 41}, {color: orange, width: 23}, {color: gray, width: 2}, {color: green, width: 34}]} />
                <UtilizationRow label="Z2C70" segments={[{color: green, width: 41}, {color: red, width: 15}, {color: green, width: 4}, {color: red, width: 2}, {color: green, width: 38}]} />
                <UtilizationRow label="Z3C10" segments={[{color: green, width: 9}, {color: orange, width: 2}, {color: green, width: 30}, {color: red, width: 26}, {color: green, width: 33}]} />
                <UtilizationRow label="Z4C10" segments={[{color: green, width: 24}, {color: red, width: 1.5}, {color: green, width: 7}, {color: red, width: 1}, {color: green, width: 9}, {color: gray, width: 5}, {color: red, width: 15}, {color: green, width: 37.5}]} />
                <UtilizationRow label="Z3C10" segments={[{color: green, width: 9}, {color: gray, width: 2}, {color: green, width: 22}, {color: red, width: 1}, {color: green, width: 5}, {color: orange, width: 16}, {color: green, width: 45}]} />
                <UtilizationRow label="Z5C10" segments={[{color: green, width: 14}, {color: red, width: 7}, {color: green, width: 16}, {color: red, width: 1.2}, {color: orange, width: 16}, {color: green, width: 45.8}]} />
                <UtilizationRow label="Z5C30" segments={[{color: green, width: 24}, {color: red, width: 1.5}, {color: green, width: 6}, {color: red, width: 1}, {color: green, width: 6}, {color: red, width: 15}, {color: green, width: 46.5}]} />
                <UtilizationRow label="Z6C10" segments={[{color: green, width: 4}, {color: red, width: 15}, {color: green, width: 11}, {color: red, width: 1.5}, {color: green, width: 37}, {color: red, width: 2}, {color: green, width: 29.5}]} />
              </Box>
              <Box sx={{display: 'grid', gridTemplateColumns: '58px 1fr', mt: 0.9}}>
                <Box />
                <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', color: '#B8C2D1', fontSize: 12}}>
                  {['01AM', '02AM', '03AM', '04AM', '05AM', '06PM', '07AM', '08AM'].map((label) => <Typography key={label} sx={{fontSize: 12}}>{label}</Typography>)}
                </Box>
              </Box>
              <Box sx={{ml: '58px', mt: 1.2, width: 44, height: 6, borderRadius: '999px', bgcolor: '#3B82FF'}} />
            </Paper>
          </Box>

          <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 2, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
            <Typography sx={{fontSize: 16, color: '#FFFFFF', fontWeight: 800, mb: 1.25}}>Comments</Typography>
            <Box sx={{borderRadius: '10px', bgcolor: '#374352', px: 1.4, py: 1.05}}>
              <Typography sx={{fontSize: 14, color: '#FFFFFF', lineHeight: 1.42, mb: 1}}>
                Conveyor belt speed has been slightly lowered on Line 04. This is an attempt to mitigate minor stops before we do a physical check.
              </Typography>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#AAB4C5'}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
                  <Avatar src="/images/Maria.png" sx={{width: 18, height: 18}} />
                  <Typography sx={{fontSize: 12}}>Maria Pinna</Typography>
                </Box>
                <Typography sx={{fontSize: 12}}>Sep 05, 09:20</Typography>
              </Box>
            </Box>
            <Box sx={{mt: 'auto', height: 40, border: '1px solid #3A86FF', borderRadius: '10px', display: 'flex', alignItems: 'center', px: 1.3, color: '#BBC5D3'}}>
              <Typography sx={{fontSize: 15, flex: 1}}>Leave a comment</Typography>
              <SendIcon sx={{fontSize: 28, color: '#3B82FF'}} />
            </Box>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}

function PageOne({
  onOpenBatchesOnHold,
  onOpenDrilldown,
  onOpenEsosOverview,
  onOpenIncidentOverview,
  onOpenQualityIssues,
  onOpenQualityStatusInvestigation,
  onOpenProductionOutput,
  onOpenOee,
  onOpenSafetyTracking,
  onOpenSafetyStatusInvestigation,
  onOpenProductionRanking,
  onOpenProductionOverview,
}: {
  onOpenBatchesOnHold: () => void;
  onOpenDrilldown: (kind: DrilldownKind) => void;
  onOpenEsosOverview: () => void;
  onOpenIncidentOverview: () => void;
  onOpenQualityIssues: () => void;
  onOpenQualityStatusInvestigation: () => void;
  onOpenProductionOutput: () => void;
  onOpenOee: () => void;
  onOpenSafetyTracking: () => void;
  onOpenSafetyStatusInvestigation: () => void;
  onOpenProductionRanking: () => void;
  onOpenProductionOverview: () => void;
}) {
  return (
    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', lg: 'repeat(3, minmax(0, 1fr))'}, gridAutoRows: 'minmax(0, 1fr)', gap: 1.6, alignItems: 'stretch', height: '100%', minHeight: 0, overflow: 'hidden'}}>
      <SectionShell
        bodySx={{display: 'grid', gridTemplateRows: 'minmax(0, 0.94fr) minmax(0, 0.94fr) minmax(0, 0.94fr) minmax(0, 1.48fr)', gap: 1.0}}
        onExpand={() => onOpenDrilldown('Safety')}
        sectionSx={{width: '100%', height: '100%', minHeight: 0, alignSelf: 'stretch', p: 1.6, pb: 1.6, borderRadius: '14px'}}
        title="Safety"
      >
        <ControlTowerWidgetShell onExpand={onOpenIncidentOverview} title="Incidents Overview">
          <SafetyIncidentOverview />
        </ControlTowerWidgetShell>

        <ControlTowerWidgetShell onExpand={onOpenSafetyTracking} title="Safety Tracking">
          <SafetyTrackingGrid />
        </ControlTowerWidgetShell>

        <ControlTowerWidgetShell onExpand={onOpenEsosOverview} title="ESOs">
          <SafetyEsoGrid />
        </ControlTowerWidgetShell>

        <ControlTowerWidgetShell onExpand={onOpenSafetyStatusInvestigation} title="Status & Investigation">
          <SafetyStatusInvestigation />
        </ControlTowerWidgetShell>
      </SectionShell>

      <SectionShell
        actionMode="sparkle"
        bodySx={{display: 'grid', gridTemplateRows: 'minmax(0, 1.82fr) minmax(0, 0.58fr) minmax(0, 1.02fr)', gap: 0.95}}
        onExpand={() => onOpenDrilldown('Quality')}
        sectionSx={{borderRadius: '14px'}}
        title="Quality"
      >
        <InnerCard actionMode="sparkle" onExpand={onOpenQualityIssues} title="Quality Issues">
          <Box sx={{height: '100%', display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr)', gap: 0.72, alignContent: 'stretch'}}>
          <Typography sx={{fontSize: 14, color: '#FFFFFF'}}>Non Conformances &amp; Rates</Typography>
          <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.65, minHeight: 0}}>
            <SummaryTile caption="Total Non Conformances" minHeight={0} value="140K" valueFontSize={30} />
            <SummaryTile caption="NC Rate" minHeight={0} value="3.21%" valueFontSize={30} />
            <SummaryTile caption="TNC Rate" minHeight={0} value="0.54%" valueFontSize={30} />
          </Box>
          <Typography sx={{fontSize: 14, color: '#FFFFFF'}}>Field Actions</Typography>
          <SummaryTile accent="#6D3DD2" caption="Total Field Actions" minHeight={0} value="100K" valueFontSize={30} />
          <Typography sx={{fontSize: 14, color: '#FFFFFF'}}>Customer Complaints &amp; Impact</Typography>
          <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.65, minHeight: 0}}>
            <SummaryTile accent="#B5C326" caption="Total Complaints" minHeight={0} value="80K" valueFontSize={30} />
            <SummaryTile accent="#B5C326" caption="CPM" minHeight={0} value="1.39" valueFontSize={30} />
          </Box>
          </Box>
        </InnerCard>

        <InnerCard actionLabel="All Products" actionMode="sparkle" onExpand={onOpenBatchesOnHold} showDropdown title="Batches on hold">
          <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))'}, gap: 0.7}}>
            <SummaryTile accent="#22AFFF" caption="# Batches on Hold" minHeight={54} value="10" valueFontSize={28} />
            <SummaryTile accent="#22AFFF" caption="Product Qty on Hold" minHeight={54} value="15.000" valueFontSize={28} />
            <SummaryTile accent="#22AFFF" caption="Batch Release LT (avg)" minHeight={54} value="2" valueFontSize={28} valueSuffix="days" />
          </Box>
        </InnerCard>

        <InnerCard actionMode="sparkle" onExpand={onOpenQualityStatusInvestigation} title="Status & Investigation">
          <QualityStatusInvestigation />
        </InnerCard>
      </SectionShell>

      <SectionShell
        actionMode="sparkle"
        bodySx={{display: 'grid', gridTemplateRows: 'minmax(0, 1.52fr) minmax(0, 0.82fr) minmax(0, 0.98fr)', gap: 0.95}}
        onExpand={() => onOpenDrilldown('Delivery')}
        sectionSx={{borderRadius: '14px'}}
        title="Delivery"
      >
        <InnerCard actionMode="sparkle" onExpand={onOpenProductionOutput} title="Production Output">
          <SummaryTile accent="#22AFFF" caption="Total Product Output" minHeight={58} value="923M" valueFontSize={22} />
          <DeliveryTrendChart />
        </InnerCard>

        <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 1.05, minHeight: 0}}>
          <InnerCard actionMode="sparkle" onExpand={onOpenOee} title="OEE">
            <DeliveryGaugeCard />
          </InnerCard>
          <InnerCard actionMode="sparkle" onExpand={onOpenProductionRanking} title="Production Output">
            <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.65}}>
              <MiniRankingCard
                size="large"
                title="Best Performance"
                items={[
                  {label: 'Q-Syte L3', change: '+16.6%', tone: 'good'},
                  {label: 'Autoguard...', change: '+14.2%', tone: 'good'},
                  {label: 'Autoguar...', change: '+12.8%', tone: 'good'},
                ]}
              />
              <MiniRankingCard
                size="large"
                title="Worst Performance"
                items={[
                  {label: 'Insyte-W L4', change: '-20.7%', tone: 'bad'},
                  {label: 'Eclypse L2', change: '-18.5%', tone: 'bad'},
                  {label: 'Molding L9', change: '-16.3%', tone: 'bad'},
                ]}
              />
            </Box>
            <ChartPager count={3} />
          </InnerCard>
        </Box>

        <InnerCard actionMode="sparkle" onExpand={onOpenProductionOverview} title="Production Overview">
          <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 0.6, mb: 0.7}}>
            <Box sx={{px: 0.8, py: 0.25, borderRadius: '999px', bgcolor: '#2F7BFF', color: '#FFFFFF', fontSize: 10.5, fontWeight: 700}}>Unit</Box>
            <Box sx={{px: 0.8, py: 0.25, borderRadius: '999px', bgcolor: '#4A5362', color: '#FFFFFF', fontSize: 10.5, fontWeight: 700}}>Line</Box>
          </Box>
          <MetricList
            rows={[
              {color: '#62D26F', label: 'Unit 01', value: '94%'},
              {color: '#62D26F', label: 'Unit 02', value: '69%'},
              {color: '#62D26F', label: 'Unit 03', value: '91%'},
              {color: '#62D26F', label: 'Unit 04', value: '68%'},
              {color: '#FF5050', label: 'Unit 05', value: '89%'},
            ]}
          />
        </InnerCard>
      </SectionShell>
    </Box>
  );
}

function LegacyPageTwo() {
  const costActualPoints = [38, 42, 35, 44, 43, 42, 42, 33, 45, 43, 38, 34];
  const costActualLabels = ['70K', '55K', '62K', '66K', '70K', '38K', '64K', '40K', '62K', '63K', '67K', '39K'];
  const costBudgetPoints = [62, 66, 63, 68, 68, 62, 67, 62, 59, 70, 68, 62];
  const costReasonBars = [58, 74, 66, 46, 71, 58, 34, 84, 43, 81, 55, 86];
  const costReasonTarget = [80, 85, 82, 79, 86, 86, 79, 84, 80, 86, 84, 80];

  return (
    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: '1fr 1fr 1fr'}, gap: 1.2, alignItems: 'start'}}>
      <SectionShell sectionSx={{height: 'auto', alignSelf: 'start'}} title="Cost">
        <InnerCard cardSx={{pb: 1.15}} title="Cost Breakdown">
          <CostHeadlineTile budgetLabel="BUDGET" budgetValue="$ 1.18M" caption="Total Cost" value="$ 696K" />
          <BaseChart bottomLabels={monthLabels} chartHeight={132} leftTicks={['100K', '80K', '60K', '40K', '20K', '0']} topPadding={10}>
            <PolylineChart color="#0EA5FF" fill="#0EA5FF" points={costActualPoints} strokeWidth={2.2} />
            <PolylineChart color="#F1F5FF" dashed points={costBudgetPoints} strokeWidth={1.3} />
            <LinePointOverlay dotColor="#0EA5FF" labelColor="#DCE6F7" labelOffset={-16} labels={costActualLabels} points={costActualPoints} />
          </BaseChart>
          <LegendRow items={[{color: '#0EA5FF', label: 'Actual'}, {color: '#F1F5FF', dashed: true, label: 'Budget'}]} />
        </InnerCard>

        <InnerCard cardSx={{pb: 1.15}} title="Top Cost Reasons">
          <Box sx={{display: 'grid', gridTemplateColumns: '1.12fr 1fr 0.78fr', gap: 0.7}}>
            <SummaryTile accent="#22AFFF" caption="Leading Reason" minHeight={64} value="Quality Issues" valueFontSize={17} />
            <SummaryTile accent="#22AFFF" caption="Total Period Cost" minHeight={64} value="$ 452,150" valueFontSize={17} />
            <SummaryTile accent="#22AFFF" caption="Critical Cell" minHeight={64} value="Cell 6" valueFontSize={17} />
          </Box>
          <BaseChart bottomLabels={monthLabels} chartHeight={118} leftTicks={['300', '250', '200', '150', '100', '50', '0']} topPadding={10}>
            <BarChart bars={costReasonBars} color="#179BF0" />
            <PolylineChart color="#F1F5FF" dashed points={costReasonTarget} strokeWidth={1.25} />
          </BaseChart>
          <LegendRow items={[{color: '#179BF0', label: 'Actual'}, {color: '#F1F5FF', dashed: true, label: 'Target'}]} />
        </InnerCard>
      </SectionShell>

      <SectionShell title="People">
        <InnerCard title="Absences & Leaves">
          <Box sx={{display: 'grid', gridTemplateColumns: '92px 1fr', gap: 1}}>
            <BigMetricCard accent="#22AFFF" detail="Absences" value="15%" />
            <Box>
              <BaseChart bottomLabels={monthLabels}>
                <MultiBarChart
                  series={[
                    {color: '#14A0EB', values: [60, 44, 40, 46, 30, 58, 37, 41, 49, 52, 55, 60]},
                    {color: '#A87921', values: [54, 52, 38, 44, 29, 50, 32, 35, 47, 39, 44, 48]},
                    {color: '#CEBA2C', values: [42, 38, 31, 35, 23, 39, 28, 29, 36, 33, 38, 42]},
                    {color: '#2DB76E', values: [70, 58, 52, 55, 40, 62, 45, 49, 56, 58, 63, 66]},
                  ]}
                />
                <PolylineChart color="#F1F5FF" dashed points={[80, 88, 82, 78, 90, 90, 80, 92, 80, 74, 95, 88]} />
              </BaseChart>
              <LegendRow
                items={[
                  {color: '#14A0EB', label: 'Unplanned Absence'},
                  {color: '#A87921', label: 'Medical Leave'},
                  {color: '#CEBA2C', label: 'Vacation'},
                  {color: '#2DB76E', label: 'Day Off'},
                  {color: '#F1F5FF', dashed: true, label: 'Target'},
                ]}
              />
            </Box>
          </Box>
        </InnerCard>

        <InnerCard title="Overtime">
          <BaseChart bottomLabels={monthLabels} rightLabel="4K">
            <MultiBarChart
              series={[
                {color: '#1399EB', values: [28, 45, 41, 38, 57, 35, 34, 25, 56, 28, 33, 46]},
                {color: '#0D7FC2', values: [52, 61, 58, 51, 69, 53, 47, 34, 67, 45, 53, 62]},
                {color: '#1CA87E', values: [67, 70, 74, 63, 61, 57, 54, 44, 53, 78, 63, 72]},
              ]}
            />
            <PolylineChart color="#F1F5FF" dashed points={[86, 92, 88, 84, 93, 89, 83, 89, 80, 95, 93, 92]} />
          </BaseChart>
          <LegendRow items={[{color: '#1399EB', label: 'Target'}, {color: '#0D7FC2', label: 'Actual'}, {color: '#1CA87E', label: 'Spendings'}, {color: '#F1F5FF', dashed: true, label: ' '}]} />
        </InnerCard>

        <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 1.05}}>
          <InnerCard title="Turnover">
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
              <RingStat accentA="#5B39D1" accentB="#138FE8" label={'Voluntary\n50%\n\nInvoluntary\n50%'} value="10%" />
            </Box>
          </InnerCard>
          <InnerCard title="Open Positions">
            <Box sx={{display: 'grid', gap: 0.55}}>
              <StatusTable rows={[{label: 'Total', value: '10'}]} />
              <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.55}}>
                <StatusTable rows={[{label: 'Operator', value: '3'}]} />
                <StatusTable rows={[{label: 'Line Leader', value: '4'}]} />
              </Box>
              <StatusTable rows={[{label: 'Operations Manager', value: '3'}]} />
            </Box>
          </InnerCard>
        </Box>

        <InnerCard title="Recognition">
          <BaseChart bottomLabels={monthLabels}>
            <BarChart bars={[58, 0, 33, 0, 20, 40, 52, 44, 0, 48, 18, 65]} color="#179BF0" />
            <PolylineChart color="#F1F5FF" dashed points={[62, 58, 54, 50, 48, 55, 60, 54, 49, 66, 71, 65]} />
          </BaseChart>
          <LegendRow items={[{color: '#179BF0', label: 'Recognitions'}, {color: '#F1F5FF', dashed: true, label: 'Target'}]} />
        </InnerCard>
      </SectionShell>

      <Box sx={{display: 'grid', gap: 1.2}}>
        <SectionShell actionLabel="" title="Blu.AI">
          <Box sx={{display: 'grid', gap: 0.9}}>
            <ControlTowerMaintenancePlannerWidget />
            <AiAlertCard
              accent="#5AC85A"
              body="OEE increased by +4.2% in cell 3 this week due to reduced setup times. Recommendation: replicate the production sequence in cell 5."
              title="OEE UP +4.2 % THIS WEEK IN CELL 3"
            />
            <AiAlertCard
              accent="#E54C4C"
              body="Rejection rate +5.8% in cell 2 due to machine x wear. Recommendation: schedule immediate maintenance to avoid delivery risks for batch #402."
              title="REJECTION RATE UP +5.8 % IN CELL 2"
            />
          </Box>
        </SectionShell>

        <SectionShell actionLabel="" title="Site Overview">
          <InnerCard title="Site Overview">
            <Box sx={{position: 'relative', borderRadius: '6px', overflow: 'hidden', bgcolor: '#E5E9F0'}}>
              <Box component="img" src="/images/3Dview.png" alt="Site overview" sx={{display: 'block', width: '100%', height: 232, objectFit: 'cover'}} />
              <Box sx={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(17,24,39,0.04) 0%, rgba(17,24,39,0.0) 100%)'}} />
              <Box sx={{position: 'absolute', left: 34, top: 72, px: 1, py: 0.8, borderRadius: '6px', bgcolor: '#1B2232', border: '1px solid rgba(255,255,255,0.1)', minWidth: 108}}>
                <Typography sx={{fontSize: 10.5, color: '#F3F7FF', mb: 0.55}}>Unit 5</Typography>
                <Typography sx={{fontSize: 10.5, color: '#F3F7FF'}}>Breakdown</Typography>
              </Box>
            </Box>
          </InnerCard>
        </SectionShell>

        <SectionShell title="Sustainability">
          <InnerCard title="Sustainability Overview">
            <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.7}}>
              <SustainabilityMetric label="Water Consumption" trend="+0.5%" unit="m3/1k units" value="142" />
              <SustainabilityMetric label="Energy Consumption" trend="+0.5%" unit="kwh/1k units" value="1.250" />
              <SustainabilityMetric label="Gas Consumption" trend="+0.5%" unit="m3/1k units" value="85" />
              <SustainabilityMetric label="Air Consumption" trend="+0.5%" unit="m3/1k units" value="88" />
            </Box>
          </InnerCard>
        </SectionShell>
      </Box>
    </Box>
  );
}

function CompactValueTile({
  caption,
  target,
  value,
}: {
  caption: string;
  target?: string;
  value: string;
}) {
  return (
    <Box sx={{minHeight: 48, px: 0.9, py: 0.65, borderRadius: '4px', bgcolor: '#364150', borderLeft: '4px solid #67D783', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
      <Box>
        <Typography sx={{fontSize: 18, color: '#FFFFFF', lineHeight: 1}}>{value}</Typography>
        <Typography sx={{fontSize: 10, color: '#DFE6F2', mt: 0.25}}>{caption}</Typography>
      </Box>
      {target ? (
        <Box sx={{textAlign: 'right'}}>
          <Typography sx={{fontSize: 7.5, color: '#AEB8C9', lineHeight: 1, fontWeight: 800}}>TARGET</Typography>
          <Box sx={{mt: 0.25, px: 0.55, py: 0.16, borderRadius: '999px', bgcolor: 'rgba(255,255,255,0.16)', color: '#FFFFFF', fontSize: 8, fontWeight: 800}}>{target}</Box>
        </Box>
      ) : null}
    </Box>
  );
}

function CostOverviewList() {
  return (
    <MetricList
      rows={[
        {color: '#FF5050', label: 'Unit 06', value: '$ 10.560'},
        {color: '#FF5050', label: 'Unit 02', value: '$ 7.800'},
        {color: '#62D26F', label: 'Unit 04', value: '$ 3.854'},
        {color: '#62D26F', label: 'Unit 01', value: '$ 3.235'},
        {color: '#62D26F', label: 'Unit 03', value: '$ 3.126'},
        {color: '#62D26F', label: 'Unit 05', value: '$ 3.126'},
      ]}
    />
  );
}

function CostOverviewEventCard({
  category,
  cell,
  date,
  status,
  title,
}: {
  category: string;
  cell: string;
  date: string;
  status: string;
  title: string;
}) {
  return (
    <Box sx={{borderRadius: '7px', bgcolor: '#111A2A', p: 1.15, borderLeft: '3px solid #16A7F4'}}>
      <Typography sx={{fontSize: 12, color: '#BAC5D4', mb: 0.45}}>Title</Typography>
      <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 800, mb: 1.75}}>{title}</Typography>
      <Box sx={{display: 'grid', gridTemplateColumns: '0.9fr 0.9fr 0.9fr 1fr', gap: 1.25}}>
        {[
          ['Date', date],
          ['Cell', cell],
          ['Category', category],
          ['Status', status],
        ].map(([label, value]) => (
          <Box key={label} sx={{borderLeft: '3px solid #16A7F4', pl: 0.75}}>
            <Typography sx={{fontSize: 12, color: '#BAC5D4', mb: 0.3}}>{label}</Typography>
            <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 600}}>{value}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function AbsencesLeavesDrilldown({onClose}: {onClose: () => void}) {
  const months = ['Oct 24', 'Nov 24', 'Dez 24', 'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25'];
  const tableRows = [
    ['September 2025', '45', '48', '50', '46', '189', '170'],
    ['August 2025', '38', '37', '36', '40', '151', '175'],
    ['July 2025', '38', '37', '37', '40', '152', '170'],
    ['June 2025', '45', '48', '49', '47', '189', '160'],
  ];

  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 20, bgcolor: 'rgba(0,0,0,0.66)', display: 'grid', placeItems: 'center'}}>
      <Paper
        elevation={0}
        sx={{
          width: '86.4vw',
          height: '83.6vh',
          maxWidth: 1660,
          maxHeight: 903,
          minWidth: 1120,
          minHeight: 680,
          bgcolor: '#323D4A',
          borderRadius: 0,
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
          p: 2.5,
          display: 'grid',
          gridTemplateRows: '44px 38px minmax(0, 1fr)',
          gap: 1,
          overflow: 'hidden',
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Typography sx={{fontSize: 22, color: '#FFFFFF', fontWeight: 800}}>Absences &amp; Leaves</Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.1, color: '#FFFFFF'}}>
            <Typography sx={{fontSize: 16}}>All Job Groups</Typography>
            <ArrowDropDownIcon sx={{fontSize: 18, color: '#B7C0CE'}} />
            <Typography sx={{fontSize: 16}}>Yearly</Typography>
            <ArrowDropDownIcon sx={{fontSize: 18, color: '#B7C0CE'}} />
            <SparkleIcon sx={{fontSize: 21, color: '#66758D'}} />
            <IconButton onClick={onClose} sx={{width: 28, height: 28, color: '#2F83FF', '&:hover': {bgcolor: 'rgba(47,131,255,0.12)'}}}>
              <CloseIcon sx={{fontSize: 20}} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{display: 'flex', alignItems: 'end', gap: 3.2}}>
          {['TOTAL', 'CELL', 'LINE', 'SHIFT'].map((tab, index) => (
            <Box key={tab} sx={{height: 30, px: 1.55, borderBottom: index === 0 ? '2px solid #2F83FF' : '2px solid transparent', color: index === 0 ? '#2F83FF' : '#C6CEDA', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center'}}>
              {tab}
            </Box>
          ))}
        </Box>

        <Box sx={{minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 310px', gap: 1.55}}>
          <Box sx={{minHeight: 0, display: 'grid', gridTemplateRows: '370px 52px minmax(0, 1fr)', gap: 1.5}}>
            <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0, overflow: 'hidden'}}>
              <Box sx={{height: 56, borderRadius: '5px', bgcolor: '#364250', borderLeft: '5px solid #22AFFF', px: 1.15, py: 0.65, mb: 1.25}}>
                <Box sx={{display: 'flex', alignItems: 'baseline', gap: 0.35}}>
                  <Typography sx={{fontSize: 25, color: '#FFFFFF', lineHeight: 1}}>15</Typography>
                  <Typography sx={{fontSize: 13, color: '#D7DFEC'}}>%</Typography>
                </Box>
                <Typography sx={{fontSize: 12, color: '#FFFFFF', mt: 0.2}}>Absences</Typography>
              </Box>

              <BaseChart bottomLabels={months} chartHeight={226} leftLabel="Quantity" leftTicks={['250', '200', '150', '100', '50', '0']} topPadding={8}>
                <StackedBarChart
                  series={[
                    {color: '#1497D5', values: [46, 38, 46, 38, 46, 38, 46, 34, 46, 38, 38, 46]},
                    {color: '#9E7300', values: [48, 39, 48, 39, 48, 39, 48, 35, 48, 39, 39, 48]},
                    {color: '#B5B822', values: [47, 37, 47, 37, 47, 37, 47, 34, 47, 37, 37, 47]},
                    {color: '#0A7A67', values: [48, 36, 48, 36, 48, 36, 48, 35, 48, 36, 36, 48]},
                  ]}
                />
                <PolylineChart color="#FFFFFF" dashed points={[68, 72, 70, 67, 72, 72, 68, 72, 66, 74, 73, 66]} strokeWidth={1.25} />
              </BaseChart>
              <LegendRow
                items={[
                  {color: '#1497D5', label: 'Unplanned Absence'},
                  {color: '#9E7300', label: 'Medical Leave'},
                  {color: '#B5B822', label: 'Vacation'},
                  {color: '#0A7A67', label: 'Day Off'},
                  {color: '#FFFFFF', dashed: true, label: 'Target'},
                ]}
              />
            </Paper>

            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
              <Box sx={{height: 40, width: 512, border: '1px solid #E0E7F4', borderRadius: '11px', px: 1.2, display: 'flex', alignItems: 'center', color: '#CDD6E4'}}>
                <Typography sx={{fontSize: 16, flex: 1}}>Search</Typography>
                <SearchIcon sx={{fontSize: 22, color: '#3B82FF'}} />
              </Box>
              <Box sx={{height: 38, px: 1.5, border: '1px solid #3B82FF', borderRadius: '11px', display: 'flex', alignItems: 'center', gap: 0.8, color: '#3B82FF', fontSize: 14, fontWeight: 800}}>
                <FilterListIcon sx={{fontSize: 18}} />
                FILTERS
              </Box>
            </Box>

            <Box sx={{minHeight: 0, overflow: 'hidden'}}>
              <Box sx={{display: 'grid', gridTemplateColumns: '176px 186px 184px 174px 184px 176px 184px', alignItems: 'center', color: '#FFFFFF', fontSize: 14, fontWeight: 900, px: 1, pb: 1.2}}>
                {['MONTH', 'UNPLANNED ABSEN...', 'MEDICAL LEAVE', 'VACATION', 'DAY OFF', 'TOTAL', 'TARGET'].map((head, index) => (
                  <Box key={head} sx={{height: 25, display: 'flex', alignItems: 'center', gap: 0.7, borderRight: '1px solid rgba(214,224,242,0.34)', pr: 1}}>
                    {head}
                    {index === 1 || index === 2 ? <Typography sx={{fontSize: 13, color: '#748095', ml: 'auto'}}>â†•</Typography> : null}
                  </Box>
                ))}
              </Box>
              <Box sx={{display: 'grid', gridAutoRows: '52px'}}>
                {tableRows.map((row, rowIndex) => (
                  <Box key={row[0]} sx={{display: 'grid', gridTemplateColumns: '176px 186px 184px 174px 184px 176px 184px', alignItems: 'center', px: 1, bgcolor: rowIndex % 2 === 0 ? '#222C3B' : '#364250', color: '#FFFFFF', fontSize: 14}}>
                    {row.map((cell) => (
                      <Typography key={`${row[0]}-${cell}`} sx={{fontSize: 14, color: '#FFFFFF'}}>{cell}</Typography>
                    ))}
                  </Box>
                ))}
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 1.15, color: '#FFFFFF'}}>
                <KeyboardArrowLeftIcon sx={{fontSize: 20, color: '#8E99AA'}} />
                <Box sx={{width: 26, height: 26, borderRadius: '50%', bgcolor: '#657080', display: 'grid', placeItems: 'center', fontSize: 13}}>1</Box>
                <Typography sx={{fontSize: 14}}>2</Typography>
                <Typography sx={{fontSize: 14}}>3</Typography>
                <KeyboardArrowRightIcon sx={{fontSize: 20}} />
              </Box>
            </Box>
          </Box>

          <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 2, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
            <Typography sx={{fontSize: 16, color: '#FFFFFF', fontWeight: 800, mb: 1.25}}>Comments</Typography>
            <Box sx={{flex: 1, minHeight: 0, display: 'grid', placeItems: 'center', color: '#C6CEDA', textAlign: 'center'}}>
              <Box>
                <ModeCommentOutlinedIcon sx={{fontSize: 36, color: '#A7B0C0', mb: 1.2}} />
                <Typography sx={{fontSize: 15, color: '#FFFFFF', fontWeight: 800}}>No comments yet</Typography>
                <Typography sx={{fontSize: 14, color: '#B8C1D0', mt: 0.5}}>Be the first to share an insight!</Typography>
              </Box>
            </Box>
            <Box sx={{mt: 'auto', height: 40, border: '1px solid #3A86FF', borderRadius: '10px', display: 'flex', alignItems: 'center', px: 1.3, color: '#BBC5D3'}}>
              <Typography sx={{fontSize: 15, flex: 1}}>Leave a comment</Typography>
              <SendIcon sx={{fontSize: 28, color: '#3B82FF'}} />
            </Box>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}

function OvertimeDrilldown({onClose}: {onClose: () => void}) {
  const months = ['Oct 24', 'Nov 24', 'Dec 24', 'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25'];
  const tableRows = [
    ['September 2025', '190', '220', '175', '25'],
    ['August 2025', '205', '235', '195', '80'],
    ['July 25', '205', '235', '210', '100'],
    ['June 25', '185', '215', '190', '70'],
  ];
  const overtimeBars = [72, 70, 71, 72, 60, 68, 69, 53, 65, 72, 68, 59];
  const absenteeismBars = [22, 38, 38, 46, 13, 40, 41, 20, 24, 36, 29, 8];

  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 20, bgcolor: 'rgba(0,0,0,0.66)', display: 'grid', placeItems: 'center'}}>
      <Paper
        elevation={0}
        sx={{
          width: '86.4vw',
          height: '83.6vh',
          maxWidth: 1660,
          maxHeight: 903,
          minWidth: 1120,
          minHeight: 680,
          bgcolor: '#323D4A',
          borderRadius: 0,
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
          p: 2.5,
          display: 'grid',
          gridTemplateRows: '44px 38px minmax(0, 1fr)',
          gap: 1,
          overflow: 'hidden',
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Typography sx={{fontSize: 22, color: '#FFFFFF', fontWeight: 800}}>Overtime</Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.1, color: '#FFFFFF'}}>
            <Typography sx={{fontSize: 16}}>Yearly</Typography>
            <ArrowDropDownIcon sx={{fontSize: 18, color: '#B7C0CE'}} />
            <SparkleIcon sx={{fontSize: 21, color: '#66758D'}} />
            <IconButton onClick={onClose} sx={{width: 28, height: 28, color: '#2F83FF', '&:hover': {bgcolor: 'rgba(47,131,255,0.12)'}}}>
              <CloseIcon sx={{fontSize: 20}} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{display: 'flex', alignItems: 'end', gap: 3.2}}>
          {['TOTAL', 'CELL', 'LINE', 'SHIFT'].map((tab, index) => (
            <Box key={tab} sx={{height: 30, px: 1.55, borderBottom: index === 0 ? '2px solid #2F83FF' : '2px solid transparent', color: index === 0 ? '#2F83FF' : '#C6CEDA', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center'}}>
              {tab}
            </Box>
          ))}
        </Box>

        <Box sx={{minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 310px', gap: 1.55}}>
          <Box sx={{minHeight: 0, display: 'grid', gridTemplateRows: '370px 52px minmax(0, 1fr)', gap: 1.5}}>
            <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0, overflow: 'hidden'}}>
              <BaseChart bottomLabels={months} chartHeight={292} leftLabel="Quantity" leftTicks={['300', '250', '200', '150', '100', '50', '0']} rightLabel="Quantity" rightTicks={['300', '250', '200', '150', '100', '50', '0']} topPadding={8}>
                <Box sx={{position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))`, alignItems: 'end', gap: 0.65, px: 1}}>
                  {months.map((month, index) => (
                    <Box key={month} sx={{height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 0.35}}>
                      <Box sx={{width: 20, height: `${overtimeBars[index]}%`, bgcolor: '#1497D5', borderRadius: '2px 2px 0 0'}} />
                      <Box sx={{width: 20, height: `${absenteeismBars[index]}%`, bgcolor: '#5A35B9', borderRadius: '2px 2px 0 0'}} />
                    </Box>
                  ))}
                </Box>
                <PolylineChart color="#B5B822" dashed points={[64, 68, 66, 64, 68, 68, 64, 68, 62, 69, 68, 64]} strokeWidth={1.25} />
                <PolylineChart color="#FFFFFF" dashed points={[74, 78, 75, 74, 78, 78, 74, 78, 73, 79, 78, 74]} strokeWidth={1.25} />
              </BaseChart>
              <LegendRow
                items={[
                  {color: '#1497D5', label: 'Overtime'},
                  {color: '#5A35B9', label: 'Absenteeism'},
                  {color: '#B5B822', dashed: true, label: 'Production Demand'},
                  {color: '#FFFFFF', dashed: true, label: 'Production Output'},
                ]}
              />
            </Paper>

            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
              <Box sx={{height: 40, width: 512, border: '1px solid #E0E7F4', borderRadius: '11px', px: 1.2, display: 'flex', alignItems: 'center', color: '#CDD6E4'}}>
                <Typography sx={{fontSize: 16, flex: 1}}>Search</Typography>
                <SearchIcon sx={{fontSize: 22, color: '#3B82FF'}} />
              </Box>
              <Box sx={{height: 38, px: 1.5, border: '1px solid #3B82FF', borderRadius: '11px', display: 'flex', alignItems: 'center', gap: 0.8, color: '#3B82FF', fontSize: 14, fontWeight: 800}}>
                <FilterListIcon sx={{fontSize: 18}} />
                FILTERS
              </Box>
            </Box>

            <Box sx={{minHeight: 0, overflow: 'hidden'}}>
              <Box sx={{display: 'grid', gridTemplateColumns: '250px 250px 250px 250px 250px', alignItems: 'center', color: '#FFFFFF', fontSize: 14, fontWeight: 900, px: 1, pb: 1.2}}>
                {['MONTH', 'DEMAND', 'OUTPUT', 'OVERTIME', 'ABSENTEEISM'].map((head, index) => (
                  <Box key={head} sx={{height: 25, display: 'flex', alignItems: 'center', gap: 0.7, borderRight: '1px solid rgba(214,224,242,0.34)', pr: 1}}>
                    {head}
                    {index > 0 ? <Typography sx={{fontSize: 13, color: '#748095', ml: 'auto'}}>â†•</Typography> : null}
                  </Box>
                ))}
              </Box>
              <Box sx={{display: 'grid', gridAutoRows: '52px'}}>
                {tableRows.map((row, rowIndex) => (
                  <Box key={row[0]} sx={{display: 'grid', gridTemplateColumns: '250px 250px 250px 250px 250px', alignItems: 'center', px: 1, bgcolor: rowIndex % 2 === 0 ? '#222C3B' : '#364250', color: '#FFFFFF', fontSize: 14}}>
                    {row.map((cell) => (
                      <Typography key={`${row[0]}-${cell}`} sx={{fontSize: 14, color: '#FFFFFF'}}>{cell}</Typography>
                    ))}
                  </Box>
                ))}
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 1.15, color: '#FFFFFF'}}>
                <KeyboardArrowLeftIcon sx={{fontSize: 20, color: '#8E99AA'}} />
                <Box sx={{width: 26, height: 26, borderRadius: '50%', bgcolor: '#657080', display: 'grid', placeItems: 'center', fontSize: 13}}>1</Box>
                <Typography sx={{fontSize: 14}}>2</Typography>
                <Typography sx={{fontSize: 14}}>3</Typography>
                <KeyboardArrowRightIcon sx={{fontSize: 20}} />
              </Box>
            </Box>
          </Box>

          <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 2, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
            <Typography sx={{fontSize: 16, color: '#FFFFFF', fontWeight: 800, mb: 1.25}}>Comments</Typography>
            <Box sx={{display: 'grid', gap: 1.1}}>
              {[
                {
                  author: 'John Smith',
                  body: 'I noticed a consistent gap between output and demand in March, even with increased overtime. I’ve started reviewing staffing capacity and planning assumptions to understand why overtime is not closing the gap.',
                  date: 'Mar 18, 11:41',
                  image: '/images/John.png',
                },
                {
                  author: 'John Joshua',
                  body: 'I observed higher absenteeism levels in January, but performance remained stable as demand was lower. I’m assessing whether there’s an opportunity to optimize staffing during similar periods without impacting results.',
                  date: 'Mar 18, 07:32',
                  image: '/images/John.png',
                },
              ].map((comment) => (
                <Box key={comment.body} sx={{borderRadius: '10px', bgcolor: '#374352', px: 1.4, py: 1.05}}>
                  <Typography sx={{fontSize: 14, color: '#FFFFFF', lineHeight: 1.42, mb: 1}}>{comment.body}</Typography>
                  <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#AAB4C5'}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
                      <Avatar src={comment.image} sx={{width: 18, height: 18}} />
                      <Typography sx={{fontSize: 12}}>{comment.author}</Typography>
                    </Box>
                    <Typography sx={{fontSize: 12}}>{comment.date}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            <Box sx={{mt: 'auto', height: 40, border: '1px solid #3A86FF', borderRadius: '10px', display: 'flex', alignItems: 'center', px: 1.3, color: '#BBC5D3'}}>
              <Typography sx={{fontSize: 15, flex: 1}}>Leave a comment</Typography>
              <SendIcon sx={{fontSize: 28, color: '#3B82FF'}} />
            </Box>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}

function TurnoverDrilldown({onClose}: {onClose: () => void}) {
  const months = ['Oct 24', 'Nov 24', 'Dez 24', 'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25'];
  const tableRows = [
    ['September 2025', '70', '37', '33', '8.1%', 'Attendance'],
    ['August 2025', '55', '31', '24', '6.4%', 'Career Change'],
    ['July 2025', '64', '35', '29', '7.2%', 'Shift Change'],
    ['June 2025', '78', '41', '37', '8.9%', 'Absenteeism'],
  ];

  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 20, bgcolor: 'rgba(0,0,0,0.66)', display: 'grid', placeItems: 'center'}}>
      <Paper
        elevation={0}
        sx={{
          width: '86.4vw',
          height: '83.6vh',
          maxWidth: 1660,
          maxHeight: 903,
          minWidth: 1120,
          minHeight: 680,
          bgcolor: '#323D4A',
          borderRadius: 0,
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
          p: 2.5,
          display: 'grid',
          gridTemplateRows: '44px 38px minmax(0, 1fr)',
          gap: 1,
          overflow: 'hidden',
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Typography sx={{fontSize: 22, color: '#FFFFFF', fontWeight: 800}}>Turnover</Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.1, color: '#FFFFFF'}}>
            <Typography sx={{fontSize: 16}}>JG1</Typography>
            <ArrowDropDownIcon sx={{fontSize: 18, color: '#B7C0CE'}} />
            <Typography sx={{fontSize: 16}}>Yearly</Typography>
            <ArrowDropDownIcon sx={{fontSize: 18, color: '#B7C0CE'}} />
            <SparkleIcon sx={{fontSize: 21, color: '#66758D'}} />
            <IconButton onClick={onClose} sx={{width: 28, height: 28, color: '#2F83FF', '&:hover': {bgcolor: 'rgba(47,131,255,0.12)'}}}>
              <CloseIcon sx={{fontSize: 20}} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{display: 'flex', alignItems: 'end', gap: 3.2}}>
          {['TOTAL', 'CELL', 'LINE', 'SHIFT'].map((tab, index) => (
            <Box key={tab} sx={{height: 30, px: 1.55, borderBottom: index === 0 ? '2px solid #2F83FF' : '2px solid transparent', color: index === 0 ? '#2F83FF' : '#C6CEDA', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center'}}>
              {tab}
            </Box>
          ))}
        </Box>

        <Box sx={{minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 310px', gap: 1.55}}>
          <Box sx={{minHeight: 0, display: 'grid', gridTemplateRows: '370px 52px minmax(0, 1fr)', gap: 1.5}}>
            <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0, overflow: 'hidden'}}>
              <BaseChart bottomLabels={months} chartHeight={292} leftLabel="Quantity" leftTicks={['250', '200', '150', '100', '50', '0']} topPadding={8}>
                <StackedBarChart
                  series={[
                    {color: '#1497D5', values: [55, 48, 68, 38, 56, 48, 30, 44, 70, 50, 34, 48]},
                    {color: '#5A35B9', values: [56, 52, 68, 40, 58, 52, 30, 44, 70, 54, 36, 52]},
                  ]}
                />
              </BaseChart>
              <LegendRow
                items={[
                  {color: '#1497D5', label: 'Voluntary'},
                  {color: '#5A35B9', label: 'Involuntary'},
                  {color: '#FFFFFF', dashed: true, label: 'Legend'},
                ]}
              />
            </Paper>

            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
              <Box sx={{height: 40, width: 512, border: '1px solid #E0E7F4', borderRadius: '11px', px: 1.2, display: 'flex', alignItems: 'center', color: '#CDD6E4'}}>
                <Typography sx={{fontSize: 16, flex: 1}}>Search</Typography>
                <SearchIcon sx={{fontSize: 22, color: '#3B82FF'}} />
              </Box>
              <Box sx={{height: 38, px: 1.5, border: '1px solid #3B82FF', borderRadius: '11px', display: 'flex', alignItems: 'center', gap: 0.8, color: '#3B82FF', fontSize: 14, fontWeight: 800}}>
                <FilterListIcon sx={{fontSize: 18}} />
                FILTERS
              </Box>
            </Box>

            <Box sx={{minHeight: 0, overflow: 'hidden'}}>
              <Box sx={{display: 'grid', gridTemplateColumns: '210px 210px 210px 210px 210px 210px', alignItems: 'center', color: '#FFFFFF', fontSize: 14, fontWeight: 900, px: 1, pb: 1.2}}>
                {['MONTH', 'TOTAL EXITS', 'VOLUNTARY', 'INVOLUNTARY', 'TURNOVER RATE', 'MAIN DRIVER'].map((head) => (
                  <Box key={head} sx={{height: 25, display: 'flex', alignItems: 'center', borderRight: '1px solid rgba(214,224,242,0.34)', pr: 1}}>{head}</Box>
                ))}
              </Box>
              <Box sx={{display: 'grid', gridAutoRows: '52px'}}>
                {tableRows.map((row, rowIndex) => (
                  <Box key={row[0]} sx={{display: 'grid', gridTemplateColumns: '210px 210px 210px 210px 210px 210px', alignItems: 'center', px: 1, bgcolor: rowIndex % 2 === 0 ? '#222C3B' : '#364250', color: '#FFFFFF', fontSize: 14}}>
                    {row.map((cell) => (
                      <Typography key={`${row[0]}-${cell}`} sx={{fontSize: 14, color: '#FFFFFF'}}>{cell}</Typography>
                    ))}
                  </Box>
                ))}
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 1.15, color: '#FFFFFF'}}>
                <KeyboardArrowLeftIcon sx={{fontSize: 20, color: '#8E99AA'}} />
                <Box sx={{width: 26, height: 26, borderRadius: '50%', bgcolor: '#657080', display: 'grid', placeItems: 'center', fontSize: 13}}>1</Box>
                <Typography sx={{fontSize: 14}}>2</Typography>
                <Typography sx={{fontSize: 14}}>3</Typography>
                <KeyboardArrowRightIcon sx={{fontSize: 20}} />
              </Box>
            </Box>
          </Box>

          <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 2, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
            <Typography sx={{fontSize: 16, color: '#FFFFFF', fontWeight: 800, mb: 1.25}}>Comments</Typography>
            <Box sx={{borderRadius: '10px', bgcolor: '#374352', px: 1.4, py: 1.05}}>
              <Typography sx={{fontSize: 14, color: '#FFFFFF', lineHeight: 1.42, mb: 1}}>
                We should investigate the root causes behind the September spike in involuntary exits in JG1.
              </Typography>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#AAB4C5'}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
                  <Avatar src="/images/John.png" sx={{width: 18, height: 18}} />
                  <Typography sx={{fontSize: 12}}>John Smith</Typography>
                </Box>
                <Typography sx={{fontSize: 12}}>Mar 18, 11:41</Typography>
              </Box>
            </Box>
            <Box sx={{mt: 'auto', height: 40, border: '1px solid #3A86FF', borderRadius: '10px', display: 'flex', alignItems: 'center', px: 1.3, color: '#BBC5D3'}}>
              <Typography sx={{fontSize: 15, flex: 1}}>Leave a comment</Typography>
              <SendIcon sx={{fontSize: 28, color: '#3B82FF'}} />
            </Box>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}

function OpenPositionsDrilldown({onClose}: {onClose: () => void}) {
  const months = ['Oct 24', 'Nov 24', 'Dec 24', 'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25'];
  const tableRows = [
    ['September 2025', '3', '↓ -40%', 'Operator (3)'],
    ['August 2025', '6', '↓ -58%', 'Mixed'],
    ['July 25', '12', '↑ +71%', 'Mixed'],
    ['June 25', '5', '↑ +40%', 'Operator (4)'],
  ];

  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 20, bgcolor: 'rgba(0,0,0,0.66)', display: 'grid', placeItems: 'center'}}>
      <Paper
        elevation={0}
        sx={{
          width: '86.4vw',
          height: '83.6vh',
          maxWidth: 1660,
          maxHeight: 903,
          minWidth: 1120,
          minHeight: 680,
          bgcolor: '#323D4A',
          borderRadius: 0,
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
          p: 2.5,
          display: 'grid',
          gridTemplateRows: '44px 38px minmax(0, 1fr)',
          gap: 1,
          overflow: 'hidden',
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Typography sx={{fontSize: 22, color: '#FFFFFF', fontWeight: 800}}>Open Positions</Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.1, color: '#FFFFFF'}}>
            <Typography sx={{fontSize: 16}}>Yearly</Typography>
            <ArrowDropDownIcon sx={{fontSize: 18, color: '#B7C0CE'}} />
            <SparkleIcon sx={{fontSize: 21, color: '#66758D'}} />
            <IconButton onClick={onClose} sx={{width: 28, height: 28, color: '#2F83FF', '&:hover': {bgcolor: 'rgba(47,131,255,0.12)'}}}>
              <CloseIcon sx={{fontSize: 20}} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{display: 'flex', alignItems: 'end', gap: 3.2}}>
          {['TOTAL', 'CELL', 'LINE', 'SHIFT'].map((tab, index) => (
            <Box key={tab} sx={{height: 30, px: 1.55, borderBottom: index === 0 ? '2px solid #2F83FF' : '2px solid transparent', color: index === 0 ? '#2F83FF' : '#C6CEDA', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center'}}>
              {tab}
            </Box>
          ))}
        </Box>

        <Box sx={{minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 310px', gap: 1.55}}>
          <Box sx={{minHeight: 0, display: 'grid', gridTemplateRows: '370px 52px minmax(0, 1fr)', gap: 1.5}}>
            <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0, overflow: 'hidden'}}>
              <BaseChart bottomLabels={months} chartHeight={292} leftLabel="Quantity" leftTicks={['18', '15', '12', '9', '6', '3', '0']} topPadding={8}>
                <StackedBarChart
                  series={[
                    {color: '#5A35B9', values: [23, 18, 18, 9, 0, 0, 25, 0, 50, 43, 16, 17]},
                    {color: '#C01868', values: [0, 16, 24, 0, 0, 31, 26, 43, 0, 38, 20, 0]},
                    {color: '#9EA122', values: [0, 18, 0, 0, 16, 16, 25, 0, 25, 44, 18, 0]},
                  ]}
                />
              </BaseChart>
              <LegendRow
                items={[
                  {color: '#5A35B9', label: 'Operator'},
                  {color: '#C01868', label: 'Line Leader'},
                  {color: '#9EA122', label: 'Operations Manager'},
                ]}
              />
            </Paper>

            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
              <Box sx={{height: 40, width: 512, border: '1px solid #E0E7F4', borderRadius: '11px', px: 1.2, display: 'flex', alignItems: 'center', color: '#CDD6E4'}}>
                <Typography sx={{fontSize: 16, flex: 1}}>Search</Typography>
                <SearchIcon sx={{fontSize: 22, color: '#3B82FF'}} />
              </Box>
              <Box sx={{height: 38, px: 1.5, border: '1px solid #3B82FF', borderRadius: '11px', display: 'flex', alignItems: 'center', gap: 0.8, color: '#3B82FF', fontSize: 14, fontWeight: 800}}>
                <FilterListIcon sx={{fontSize: 18}} />
                FILTERS
              </Box>
            </Box>

            <Box sx={{minHeight: 0, overflow: 'hidden'}}>
              <Box sx={{display: 'grid', gridTemplateColumns: '315px 315px 315px 315px', alignItems: 'center', color: '#FFFFFF', fontSize: 14, fontWeight: 900, px: 1, pb: 1.2}}>
                {['MONTH', 'TOTAL OPEN POSITIONS', 'TREND', 'TOP ROLE'].map((head, index) => (
                  <Box key={head} sx={{height: 25, display: 'flex', alignItems: 'center', gap: 0.7, borderRight: '1px solid rgba(214,224,242,0.34)', pr: 1}}>
                    {head}
                    {index === 1 ? <Typography sx={{fontSize: 13, color: '#748095', ml: 'auto'}}>â†•</Typography> : null}
                  </Box>
                ))}
              </Box>
              <Box sx={{display: 'grid', gridAutoRows: '52px'}}>
                {tableRows.map((row, rowIndex) => (
                  <Box key={row[0]} sx={{display: 'grid', gridTemplateColumns: '315px 315px 315px 315px', alignItems: 'center', px: 1, bgcolor: rowIndex % 2 === 0 ? '#222C3B' : '#364250', color: '#FFFFFF', fontSize: 14}}>
                    {row.map((cell, index) => (
                      <Typography key={`${row[0]}-${cell}`} sx={{fontSize: 14, color: index === 2 ? '#C8D0DE' : '#FFFFFF'}}>{cell}</Typography>
                    ))}
                  </Box>
                ))}
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 1.15, color: '#FFFFFF'}}>
                <KeyboardArrowLeftIcon sx={{fontSize: 20, color: '#8E99AA'}} />
                <Box sx={{width: 26, height: 26, borderRadius: '50%', bgcolor: '#657080', display: 'grid', placeItems: 'center', fontSize: 13}}>1</Box>
                <Typography sx={{fontSize: 14}}>2</Typography>
                <Typography sx={{fontSize: 14}}>3</Typography>
                <KeyboardArrowRightIcon sx={{fontSize: 20}} />
              </Box>
            </Box>
          </Box>

          <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 2, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
            <Typography sx={{fontSize: 16, color: '#FFFFFF', fontWeight: 800, mb: 1.25}}>Comments</Typography>
            <Box sx={{display: 'grid', gap: 1.1}}>
              {[
                {
                  author: 'John Smith',
                  body: 'The July peak is driven by a balanced increase across all roles, rather than a single position. To better handle this demand, it may be beneficial to scale hiring capacity ahead of Q3 and reduce time-to-fill during peak periods.',
                  date: 'Aug 18, 11:41',
                  image: '/images/John.png',
                },
                {
                  author: 'Maria Pinna',
                  body: '@John Smith The increase in time-to-fill during peak months is concerning...we should look into process bottlenecks as well',
                  date: 'Aug 21, 09:20',
                  image: '/images/Maria.png',
                },
              ].map((comment) => (
                <Box key={comment.body} sx={{borderRadius: '10px', bgcolor: '#374352', px: 1.4, py: 1.05}}>
                  <Typography sx={{fontSize: 14, color: '#FFFFFF', lineHeight: 1.42, mb: 1}}>{comment.body}</Typography>
                  <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#AAB4C5'}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
                      <Avatar src={comment.image} sx={{width: 18, height: 18}} />
                      <Typography sx={{fontSize: 12}}>{comment.author}</Typography>
                    </Box>
                    <Typography sx={{fontSize: 12}}>{comment.date}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            <Box sx={{mt: 'auto', height: 40, border: '1px solid #3A86FF', borderRadius: '10px', display: 'flex', alignItems: 'center', px: 1.3, color: '#BBC5D3'}}>
              <Typography sx={{fontSize: 15, flex: 1}}>Leave a comment</Typography>
              <SendIcon sx={{fontSize: 28, color: '#3B82FF'}} />
            </Box>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}

function HeadcountDrilldown({onClose}: {onClose: () => void}) {
  const months = ['Oct 24', 'Nov 24', 'Dez 24', 'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25'];
  const tableRows = [
    ['Operator', '1,650', '1,645', '-5', '99.6%', 'Fully Staffed'],
    ['Team Lead', '180', '178', '-2', '98.8%', 'Fully Staffed'],
    ['Shift Leader', '40', '40', '0', '100.0%', 'Fully Staffed'],
    ['Line Leader', '220', '211', '-5', '97.7%', 'Understaffed'],
  ];

  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 20, bgcolor: 'rgba(0,0,0,0.66)', display: 'grid', placeItems: 'center'}}>
      <Paper
        elevation={0}
        sx={{
          width: '86.4vw',
          height: '83.6vh',
          maxWidth: 1660,
          maxHeight: 903,
          minWidth: 1120,
          minHeight: 680,
          bgcolor: '#323D4A',
          borderRadius: 0,
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
          p: 2.5,
          display: 'grid',
          gridTemplateRows: '44px 38px minmax(0, 1fr)',
          gap: 1,
          overflow: 'hidden',
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Typography sx={{fontSize: 22, color: '#FFFFFF', fontWeight: 800}}>Headcount</Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.1, color: '#FFFFFF'}}>
            <Typography sx={{fontSize: 16}}>Yearly</Typography>
            <ArrowDropDownIcon sx={{fontSize: 18, color: '#B7C0CE'}} />
            <SparkleIcon sx={{fontSize: 21, color: '#66758D'}} />
            <IconButton onClick={onClose} sx={{width: 28, height: 28, color: '#2F83FF', '&:hover': {bgcolor: 'rgba(47,131,255,0.12)'}}}>
              <CloseIcon sx={{fontSize: 20}} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{display: 'flex', alignItems: 'end', gap: 3.2}}>
          {['TOTAL', 'CELL', 'LINE', 'SHIFT'].map((tab, index) => (
            <Box key={tab} sx={{height: 30, px: 1.55, borderBottom: index === 0 ? '2px solid #2F83FF' : '2px solid transparent', color: index === 0 ? '#2F83FF' : '#C6CEDA', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center'}}>
              {tab}
            </Box>
          ))}
        </Box>

        <Box sx={{minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 310px', gap: 1.55}}>
          <Box sx={{minHeight: 0, display: 'grid', gridTemplateRows: '370px 52px minmax(0, 1fr)', gap: 1.5}}>
            <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0, overflow: 'hidden'}}>
              <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1, mb: 1.25}}>
                {[
                  ['1,968', '', 'Total Plant Headcount'],
                  ['2,000', '', 'Active Baseline Target'],
                  ['98.4', '%', 'Direct Labor Coverage'],
                ].map(([value, unit, label]) => (
                  <Box key={label} sx={{height: 66, borderRadius: '5px', bgcolor: '#364250', borderLeft: '5px solid #67D783', px: 1.2, py: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <Box>
                      <Box sx={{display: 'flex', alignItems: 'baseline', gap: 0.35}}>
                        <Typography sx={{fontSize: 34, color: '#FFFFFF', lineHeight: 0.95}}>{value}</Typography>
                        {unit ? <Typography sx={{fontSize: 16, color: '#D7DFEC'}}>{unit}</Typography> : null}
                      </Box>
                      <Typography sx={{fontSize: 12, color: '#FFFFFF', mt: 0.45}}>{label}</Typography>
                    </Box>
                    <Box sx={{textAlign: 'right'}}>
                      <Typography sx={{fontSize: 8, color: '#AAB4C5', fontWeight: 800}}>TREND</Typography>
                      <Box sx={{mt: 0.3, px: 0.65, py: 0.18, borderRadius: '999px', bgcolor: '#0E2A28', color: '#74E2A4', fontSize: 8.5, fontWeight: 900}}>+0.5%</Box>
                    </Box>
                  </Box>
                ))}
              </Box>

              <BaseChart bottomLabels={months} chartHeight={205} leftLabel="Employees" leftTicks={['2.100', '1.950', '1.800', '1.650', '1.500']} topPadding={8}>
                <BarChart bars={[72, 55, 72, 57, 72, 56, 72, 50, 72, 56, 55, 72]} color="#1497D5" />
                <PolylineChart color="#FFFFFF" dashed points={[72, 78, 75, 72, 78, 78, 72, 78, 72, 80, 78, 72]} strokeWidth={1.25} />
              </BaseChart>
              <LegendRow items={[{color: '#1497D5', label: 'Plant Headcount'}, {color: '#FFFFFF', dashed: true, label: 'Target'}]} />
            </Paper>

            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
              <Box sx={{height: 40, width: 512, border: '1px solid #E0E7F4', borderRadius: '11px', px: 1.2, display: 'flex', alignItems: 'center', color: '#CDD6E4'}}>
                <Typography sx={{fontSize: 16, flex: 1}}>Search</Typography>
                <SearchIcon sx={{fontSize: 22, color: '#3B82FF'}} />
              </Box>
              <Box sx={{height: 38, px: 1.5, border: '1px solid #3B82FF', borderRadius: '11px', display: 'flex', alignItems: 'center', gap: 0.8, color: '#3B82FF', fontSize: 14, fontWeight: 800}}>
                <FilterListIcon sx={{fontSize: 18}} />
                FILTERS
              </Box>
            </Box>

            <Box sx={{minHeight: 0, overflow: 'hidden'}}>
              <Box sx={{display: 'grid', gridTemplateColumns: '360px 200px 230px 120px 190px 160px', alignItems: 'center', color: '#FFFFFF', fontSize: 14, fontWeight: 900, px: 1, pb: 1.2}}>
                {['FUNCTION ROLE', 'TARGET STAFFING', 'ACTUAL STAFFING', 'VARIANCE', 'COVERAGE', 'STATUS'].map((head) => (
                  <Box key={head} sx={{height: 25, display: 'flex', alignItems: 'center', borderRight: '1px solid rgba(214,224,242,0.34)', pr: 1}}>{head}</Box>
                ))}
              </Box>
              <Box sx={{display: 'grid', gridAutoRows: '52px'}}>
                {tableRows.map((row, rowIndex) => (
                  <Box key={row[0]} sx={{display: 'grid', gridTemplateColumns: '360px 200px 230px 120px 190px 160px', alignItems: 'center', px: 1, bgcolor: rowIndex % 2 === 0 ? '#222C3B' : '#364250', color: '#FFFFFF', fontSize: 14}}>
                    <Typography sx={{fontSize: 14}}>{row[0]}</Typography>
                    <Typography sx={{fontSize: 14}}>{row[1]}</Typography>
                    <Typography sx={{fontSize: 14}}>{row[2]}</Typography>
                    <Typography sx={{fontSize: 14, color: row[3] === '0' ? '#7BD88F' : '#FFAE20'}}>{row[3]}</Typography>
                    <Typography sx={{fontSize: 14}}>{row[4]}</Typography>
                    <DeliverySmallStatus tone={row[5] === 'Understaffed' ? 'orange' : 'green'}>{row[5]}</DeliverySmallStatus>
                  </Box>
                ))}
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 1.15, color: '#FFFFFF'}}>
                <KeyboardArrowLeftIcon sx={{fontSize: 20, color: '#8E99AA'}} />
                <Box sx={{width: 26, height: 26, borderRadius: '50%', bgcolor: '#657080', display: 'grid', placeItems: 'center', fontSize: 13}}>1</Box>
                <Typography sx={{fontSize: 14}}>2</Typography>
                <Typography sx={{fontSize: 14}}>3</Typography>
                <KeyboardArrowRightIcon sx={{fontSize: 20}} />
              </Box>
            </Box>
          </Box>

          <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 2, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
            <Typography sx={{fontSize: 16, color: '#FFFFFF', fontWeight: 800, mb: 1.25}}>Comments</Typography>
            <Box sx={{borderRadius: '10px', bgcolor: '#374352', px: 1.4, py: 1.05}}>
              <Typography sx={{fontSize: 14, color: '#FFFFFF', lineHeight: 1.42, mb: 1}}>
                Headcount has stabilized in Q3 with a 98.5% coverage across all primary shift patterns. Technical Leader onboarding is completed, and we are working on the remaining line operator gaps in line 4.
              </Typography>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#AAB4C5'}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
                  <Avatar src="/images/Maria.png" sx={{width: 18, height: 18}} />
                  <Typography sx={{fontSize: 12}}>Maria Pinna</Typography>
                </Box>
                <Typography sx={{fontSize: 12}}>Sep 05, 09:20</Typography>
              </Box>
            </Box>
            <Box sx={{mt: 'auto', height: 40, border: '1px solid #3A86FF', borderRadius: '10px', display: 'flex', alignItems: 'center', px: 1.3, color: '#BBC5D3'}}>
              <Typography sx={{fontSize: 15, flex: 1}}>Leave a comment</Typography>
              <SendIcon sx={{fontSize: 28, color: '#3B82FF'}} />
            </Box>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}

function RecognitionDrilldown({onClose}: {onClose: () => void}) {
  const months = ['Oct 24', 'Nov 24', 'Dez 24', 'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25'];
  const rows = [
    ['09/21/2025', 'J. Martinez', 'Line 4 Crew', 'Cell 1', 'Safety', 'High', 'Identified a gas leak before failure in Line 4 – prevented 4h of downtime'],
    ['09/16/2025', 'Ops Team', 'K. Tanaka', 'Cell 2', 'Delivery', 'High', 'Optimized shift changeover reducing idle time by 22 minutes per cycle'],
    ['09/08/2025', 'QA Lead', 'Cell C Team', 'Cell 3', 'Quality', 'Medium', 'First-pass yield improvement from 91.4% to 96.8% over 3-week period'],
    ['09/02/2025', 'Maint. Dept', 'R. Okafor', 'Cell 4', 'Safety', 'High', 'Proactive conveyor belt inspection flagged 3 worn components before failure'],
  ];

  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 20, bgcolor: 'rgba(0,0,0,0.66)', display: 'grid', placeItems: 'center'}}>
      <Paper
        elevation={0}
        sx={{
          width: '86.4vw',
          height: '83.6vh',
          maxWidth: 1660,
          maxHeight: 903,
          minWidth: 1120,
          minHeight: 680,
          bgcolor: '#323D4A',
          borderRadius: 0,
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
          p: 2.5,
          display: 'grid',
          gridTemplateRows: '44px 38px minmax(0, 1fr)',
          gap: 1,
          overflow: 'hidden',
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Typography sx={{fontSize: 22, color: '#FFFFFF', fontWeight: 800}}>Recognition</Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.1, color: '#FFFFFF'}}>
            <Typography sx={{fontSize: 16}}>Yearly</Typography>
            <ArrowDropDownIcon sx={{fontSize: 18, color: '#B7C0CE'}} />
            <SparkleIcon sx={{fontSize: 21, color: '#66758D'}} />
            <IconButton onClick={onClose} sx={{width: 28, height: 28, color: '#2F83FF', '&:hover': {bgcolor: 'rgba(47,131,255,0.12)'}}}>
              <CloseIcon sx={{fontSize: 20}} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{display: 'flex', alignItems: 'end', gap: 3.2}}>
          {['TOTAL', 'CELL', 'LINE', 'SHIFT'].map((tab, index) => (
            <Box key={tab} sx={{height: 30, px: 1.55, borderBottom: index === 0 ? '2px solid #2F83FF' : '2px solid transparent', color: index === 0 ? '#2F83FF' : '#C6CEDA', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center'}}>
              {tab}
            </Box>
          ))}
        </Box>

        <Box sx={{minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 310px', gap: 1.55}}>
          <Box sx={{minHeight: 0, display: 'grid', gridTemplateRows: '370px 52px minmax(0, 1fr)', gap: 1.5}}>
            <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0, overflow: 'hidden'}}>
              <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1, mb: 1.25}}>
                {[
                  ['18,4', 'Average Recognitions Per Month'],
                  ['150', 'Made A Recognition'],
                  ['35', 'Consistently Recognized'],
                ].map(([value, label]) => (
                  <Box key={label} sx={{height: 66, borderRadius: '5px', bgcolor: '#364250', borderLeft: '5px solid #22AFFF', px: 1.2, py: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <Box>
                      <Typography sx={{fontSize: 34, color: '#FFFFFF', lineHeight: 0.95}}>{value}</Typography>
                      <Typography sx={{fontSize: 12, color: '#FFFFFF', mt: 0.45}}>{label}</Typography>
                    </Box>
                    <Box sx={{textAlign: 'right'}}>
                      <Typography sx={{fontSize: 8, color: '#AAB4C5', fontWeight: 800}}>TREND</Typography>
                      <Box sx={{mt: 0.3, px: 0.65, py: 0.18, borderRadius: '999px', bgcolor: '#0E2A28', color: '#74E2A4', fontSize: 8.5, fontWeight: 900}}>+0.5%</Box>
                    </Box>
                  </Box>
                ))}
              </Box>

              <BaseChart bottomLabels={months} chartHeight={205} leftLabel="Quantity" leftTicks={['250', '200', '150', '100', '50', '0']} topPadding={8}>
                <BarChart bars={[60, 78, 58, 52, 53, 75, 79, 53, 68, 78, 64, 48]} color="#0F84C5" />
                <PolylineChart color="#FFFFFF" dashed points={[72, 78, 74, 72, 78, 78, 72, 78, 72, 80, 77, 72]} strokeWidth={1.25} />
              </BaseChart>
              <LegendRow items={[{color: '#0F84C5', label: 'Recognitions'}, {color: '#FFFFFF', dashed: true, label: 'Target'}]} />
            </Paper>

            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
              <Box sx={{height: 40, width: 512, border: '1px solid #E0E7F4', borderRadius: '11px', px: 1.2, display: 'flex', alignItems: 'center', color: '#CDD6E4'}}>
                <Typography sx={{fontSize: 16, flex: 1}}>Search</Typography>
                <SearchIcon sx={{fontSize: 22, color: '#3B82FF'}} />
              </Box>
              <Box sx={{height: 38, px: 1.5, border: '1px solid #3B82FF', borderRadius: '11px', display: 'flex', alignItems: 'center', gap: 0.8, color: '#3B82FF', fontSize: 14, fontWeight: 800}}>
                <FilterListIcon sx={{fontSize: 18}} />
                FILTERS
              </Box>
            </Box>

            <Box sx={{minHeight: 0, overflow: 'hidden'}}>
              <Box sx={{display: 'grid', gridTemplateColumns: '122px 144px 142px 96px 126px 112px minmax(0, 1fr)', alignItems: 'center', color: '#FFFFFF', fontSize: 14, fontWeight: 900, px: 1, pb: 1.2}}>
                {['DATE', 'FROM', 'TO', 'CELL', 'CATEGORY', 'IMPACT', 'DESCRIPTION'].map((head, index) => (
                  <Box key={head} sx={{height: 25, display: 'flex', alignItems: 'center', gap: 0.7, borderRight: '1px solid rgba(214,224,242,0.34)', pr: 1}}>
                    {head}
                    {(index === 1 || index === 2) ? <Typography sx={{fontSize: 13, color: '#748095', ml: 'auto'}}>â†•</Typography> : null}
                  </Box>
                ))}
              </Box>
              <Box sx={{display: 'grid', gridAutoRows: '52px'}}>
                {rows.map((row, rowIndex) => (
                  <Box key={`${row[0]}-${row[1]}`} sx={{display: 'grid', gridTemplateColumns: '122px 144px 142px 96px 126px 112px minmax(0, 1fr)', alignItems: 'center', px: 1, bgcolor: rowIndex % 2 === 0 ? '#222C3B' : '#364250', color: '#FFFFFF', fontSize: 14}}>
                    {row.map((cell, index) => (
                      <Box key={`${row[0]}-${index}`} sx={{minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                        {index === 4 ? (
                          <Box sx={{display: 'inline-flex', alignItems: 'center', height: 28, px: 1, borderRadius: '999px', bgcolor: '#5A6473', color: '#FFFFFF', fontSize: 12}}>{cell}</Box>
                        ) : index === 5 ? (
                          <Typography sx={{fontSize: 14, color: cell === 'Medium' ? '#FFAE20' : '#82D889'}}>{cell}</Typography>
                        ) : (
                          <Typography sx={{fontSize: 14, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis'}}>{cell}</Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 1.15, color: '#FFFFFF'}}>
                <KeyboardArrowLeftIcon sx={{fontSize: 20, color: '#8E99AA'}} />
                <Box sx={{width: 26, height: 26, borderRadius: '50%', bgcolor: '#657080', display: 'grid', placeItems: 'center', fontSize: 13}}>1</Box>
                <Typography sx={{fontSize: 14}}>2</Typography>
                <Typography sx={{fontSize: 14}}>3</Typography>
                <KeyboardArrowRightIcon sx={{fontSize: 20}} />
              </Box>
            </Box>
          </Box>

          <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 2, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
            <Typography sx={{fontSize: 16, color: '#FFFFFF', fontWeight: 800, mb: 1.25}}>Comments</Typography>
            <Box sx={{borderRadius: '10px', bgcolor: '#374352', px: 1.4, py: 1.05}}>
              <Typography sx={{fontSize: 14, color: '#FFFFFF', lineHeight: 1.42, mb: 1}}>
                September hit the Target despite a slight dip. Excellent work by Cell A on Safety (preventing 4h of downtime) and Cell B on Delivery efficiency. Let's push for higher impact on Quality in Cell C next month!
              </Typography>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#AAB4C5'}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
                  <Avatar src="/images/Maria.png" sx={{width: 18, height: 18}} />
                  <Typography sx={{fontSize: 12}}>Maria Pinna</Typography>
                </Box>
                <Typography sx={{fontSize: 12}}>Sep 05, 09:20</Typography>
              </Box>
            </Box>
            <Box sx={{mt: 'auto', height: 40, border: '1px solid #3A86FF', borderRadius: '10px', display: 'flex', alignItems: 'center', px: 1.3, color: '#BBC5D3'}}>
              <Typography sx={{fontSize: 15, flex: 1}}>Leave a comment</Typography>
              <SendIcon sx={{fontSize: 28, color: '#3B82FF'}} />
            </Box>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}

function CostOverviewDrilldown({onClose}: {onClose: () => void}) {
  const months = ['Oct 24', 'Nov 24', 'Dez 24', 'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25'];
  const summaryCards = [
    {accent: '#67D783', danger: false, label: 'Waste Cost', unit: 'Units', value: '182.500'},
    {accent: '#22AFFF', danger: false, label: 'Downtime Cost', unit: 'Hours', value: '200'},
    {accent: '#FF4D48', danger: true, label: 'Breakdown Cost', unit: 'Hours', value: '621'},
    {accent: '#FFAE20', danger: false, label: 'Maintenance Cost', unit: '', value: '$ 34.800'},
  ];
  const matrixRows = [
    ['Unit 06', '$ 42.120', '$ 38.560', '$ 10.560', 'bad'],
    ['Unit 02', '$ 31.400', '$ 29.800', '$ 7.800', 'bad'],
    ['Unit 04', '$ 18.500', '$ 16.320', '$ 3.854', 'good'],
    ['Unit 01', '$ 15.200', '$ 14.900', '$ 3.235', 'good'],
    ['Unit 03', '$ 14.100', '$ 13.900', '$ 3.126', 'good'],
    ['Unit 05', '$ 14.800', '$ 12.450', '$ 3.126', 'good'],
  ];

  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 20, bgcolor: 'rgba(0,0,0,0.66)', display: 'grid', placeItems: 'center'}}>
      <Paper
        elevation={0}
        sx={{
          width: '86.4vw',
          height: '83.6vh',
          maxWidth: 1660,
          maxHeight: 903,
          minWidth: 1120,
          minHeight: 680,
          bgcolor: '#323D4A',
          borderRadius: 0,
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
          p: 2.5,
          display: 'grid',
          gridTemplateRows: '44px 38px minmax(0, 1fr)',
          gap: 1,
          overflow: 'hidden',
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Typography sx={{fontSize: 22, color: '#FFFFFF', fontWeight: 800}}>Cost Overview</Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.1, color: '#FFFFFF'}}>
            <Typography sx={{fontSize: 16}}>Yearly</Typography>
            <ArrowDropDownIcon sx={{fontSize: 18, color: '#B7C0CE'}} />
            <SparkleIcon sx={{fontSize: 21, color: '#66758D'}} />
            <IconButton onClick={onClose} sx={{width: 28, height: 28, color: '#2F83FF', '&:hover': {bgcolor: 'rgba(47,131,255,0.12)'}}}>
              <CloseIcon sx={{fontSize: 20}} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{display: 'flex', alignItems: 'end', gap: 3.2}}>
          {['TOTAL', 'CELL', 'LINE', 'SHIFT'].map((tab, index) => (
            <Box key={tab} sx={{height: 30, px: 1.55, borderBottom: index === 0 ? '2px solid #2F83FF' : '2px solid transparent', color: index === 0 ? '#2F83FF' : '#C6CEDA', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center'}}>
              {tab}
            </Box>
          ))}
        </Box>

        <Box sx={{minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 310px', gap: 1.55}}>
          <Box sx={{minHeight: 0, display: 'grid', gridTemplateRows: '370px minmax(0, 1fr)', gap: 1.55}}>
            <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0, overflow: 'hidden'}}>
              <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 1, mb: 2}}>
                {summaryCards.map(({accent, danger, label, unit, value}) => (
                  <Box key={label} sx={{height: 66, borderRadius: '5px', bgcolor: '#364250', borderLeft: `5px solid ${accent}`, px: 1.2, py: 0.75}}>
                    <Box sx={{display: 'flex', alignItems: 'baseline', gap: 0.5}}>
                      <Typography sx={{fontSize: 34, color: danger ? '#FF4D48' : '#FFFFFF', lineHeight: 0.95}}>{value}</Typography>
                      {unit ? <Typography sx={{fontSize: 16, color: danger ? '#FF4D48' : '#D7DFEC'}}>{unit}</Typography> : null}
                    </Box>
                    <Typography sx={{fontSize: 12, color: danger ? '#FF4D48' : '#FFFFFF', mt: 0.45}}>{label}</Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{display: 'flex', alignItems: 'center', gap: 3.2, mb: 1.7}}>
                {['MAINTENANCE', 'WASTE', 'DOWNTIME', 'BREAKDOWN'].map((tab, index) => (
                  <Typography key={tab} sx={{pb: 1, borderBottom: index === 0 ? '2px solid #2F83FF' : '2px solid transparent', color: index === 0 ? '#2F83FF' : '#C6CEDA', fontSize: 14, fontWeight: 700, letterSpacing: 0.4}}>{tab}</Typography>
                ))}
              </Box>

              <BaseChart bottomLabels={months} chartHeight={174} leftTicks={['$4k', '$3k', '$2k', '$1k', '$0']} rightTicks={['$40k', '$30k', '$20k', '$10k', '$0']} topPadding={8}>
                <StackedBarChart
                  series={[
                    {color: '#1497D5', values: [38, 24, 38, 24, 38, 24, 38, 22, 38, 24, 24, 38]},
                    {color: '#D9236B', values: [33, 22, 33, 22, 33, 22, 33, 20, 33, 22, 22, 33]},
                    {color: '#B5B822', values: [35, 24, 35, 24, 35, 24, 35, 22, 35, 24, 24, 35]},
                    {color: '#F05A22', values: [35, 24, 35, 24, 35, 24, 35, 22, 35, 24, 24, 35]},
                    {color: '#5A35B9', values: [34, 24, 34, 24, 34, 24, 34, 22, 34, 24, 24, 34]},
                  ]}
                />
                <PolylineChart color="#FFFFFF" dashed points={[62, 68, 66, 62, 68, 68, 62, 68, 62, 70, 69, 62]} strokeWidth={1.25} />
              </BaseChart>
              <LegendRow
                items={[
                  {color: '#1497D5', label: 'Corrective Maintenance'},
                  {color: '#D9236B', label: 'Spare Parts Replacement'},
                  {color: '#B5B822', label: 'External Contractor Support'},
                  {color: '#F05A22', label: 'Planned Maintenance'},
                  {color: '#5A35B9', label: 'Calibration'},
                  {color: '#FFFFFF', dashed: true, label: 'Total'},
                ]}
              />
            </Paper>

            <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.55, minHeight: 0}}>
              <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0, overflow: 'hidden'}}>
                <Typography sx={{fontSize: 16, color: '#FFFFFF', mb: 1.45}}>Units YTD Matrix</Typography>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 3.2, mb: 1.4}}>
                  {['MAINTENANCE', 'WASTE', 'DOWNTIME', 'BREAKDOWN'].map((tab, index) => (
                    <Typography key={tab} sx={{pb: 0.8, borderBottom: index === 0 ? '2px solid #2F83FF' : '2px solid transparent', color: index === 0 ? '#2F83FF' : '#C6CEDA', fontSize: 14, fontWeight: 700, letterSpacing: 0.4}}>{tab}</Typography>
                  ))}
                </Box>
                <Box sx={{display: 'grid', gridTemplateColumns: '1fr 112px 112px 112px', color: '#C7D0DD', fontSize: 14, px: 0.8, mb: 0.65}}>
                  <Typography sx={{fontSize: 14}}>Location</Typography>
                  <Typography sx={{fontSize: 14, textAlign: 'right'}}>Y - 2</Typography>
                  <Typography sx={{fontSize: 14, textAlign: 'right'}}>Y - 1</Typography>
                  <Typography sx={{fontSize: 14, textAlign: 'right'}}>YTD</Typography>
                </Box>
                <Box sx={{display: 'grid', gridAutoRows: '35px'}}>
                  {matrixRows.map((row, index) => (
                    <Box key={row[0]} sx={{display: 'grid', gridTemplateColumns: '1fr 112px 112px 112px', alignItems: 'center', px: 0.8, bgcolor: index % 2 === 0 ? '#364250' : 'transparent'}}>
                      <Typography sx={{fontSize: 14, color: '#FFFFFF', fontWeight: 800}}>{row[0]}</Typography>
                      <Typography sx={{fontSize: 20, color: '#FFFFFF', textAlign: 'right'}}>{row[1]}</Typography>
                      <Typography sx={{fontSize: 20, color: '#FFFFFF', textAlign: 'right'}}>{row[2]}</Typography>
                      <Typography sx={{fontSize: 20, color: row[4] === 'bad' ? '#FF3333' : '#38C45C', textAlign: 'right'}}>{row[3]}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>

              <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 1.6, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
                <Typography sx={{fontSize: 16, color: '#FFFFFF', mb: 1.45}}>Last Events</Typography>
                <Box sx={{display: 'grid', gap: 1.05}}>
                  <CostOverviewEventCard category="Breakdown" cell="Unit 03" date="04/15/26" status="Action Defined" title="Hydraulic Seal Blowout Check & Calibration Repair" />
                  <CostOverviewEventCard category="Downtime" cell="Unit 08" date="06/03/26" status="In Progress" title="Cooling System Pressure Loss & Valve Replacement" />
                </Box>
                <ChartPager count={3} />
              </Paper>
            </Box>
          </Box>

          <Paper elevation={0} sx={{bgcolor: '#222C3B', borderRadius: '8px', p: 2, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
            <Typography sx={{fontSize: 16, color: '#FFFFFF', fontWeight: 800, mb: 1.25}}>Comments</Typography>
            <Box sx={{borderRadius: '10px', bgcolor: '#374352', px: 1.4, py: 1.05}}>
              <Typography sx={{fontSize: 14, color: '#FFFFFF', lineHeight: 1.42, mb: 1}}>
                Unit 06 waste cost ($10.56) is heavily tied to thermal deviations during startup. Inspecting heating elements tonight.
              </Typography>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#AAB4C5'}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
                  <Avatar src="/images/Maria.png" sx={{width: 18, height: 18}} />
                  <Typography sx={{fontSize: 12}}>Maria Pinna</Typography>
                </Box>
                <Typography sx={{fontSize: 12}}>Sep 05, 09:20</Typography>
              </Box>
            </Box>
            <Box sx={{mt: 'auto', height: 40, border: '1px solid #3A86FF', borderRadius: '10px', display: 'flex', alignItems: 'center', px: 1.3, color: '#BBC5D3'}}>
              <Typography sx={{fontSize: 15, flex: 1}}>Leave a comment</Typography>
              <SendIcon sx={{fontSize: 28, color: '#3B82FF'}} />
            </Box>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}

function PageTwo({
  onOpenAbsencesLeaves,
  onOpenCostOverview,
  onOpenDrilldown,
  onOpenHeadcount,
  onOpenOpenPositions,
  onOpenOvertime,
  onOpenRecognition,
  onOpenTurnover,
}: {
  onOpenAbsencesLeaves: () => void;
  onOpenCostOverview: () => void;
  onOpenDrilldown: (kind: DrilldownKind) => void;
  onOpenHeadcount: () => void;
  onOpenOpenPositions: () => void;
  onOpenOvertime: () => void;
  onOpenRecognition: () => void;
  onOpenTurnover: () => void;
}) {
  const quarterLabels = ['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4'];

  return (
    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', lg: 'repeat(3, minmax(0, 1fr))'}, gap: 2, alignItems: 'stretch', height: '100%', minHeight: 0}}>
      <SectionShell
        bodySx={{display: 'grid', gridTemplateRows: 'minmax(0, 1.18fr) minmax(0, 1.18fr) minmax(0, 1fr)', gap: 1.1}}
        onExpand={() => onOpenDrilldown('Cost')}
        sectionSx={{minHeight: 0}}
        title="Cost"
      >
        <InnerCard cardSx={{pb: 1.15}} onExpand={() => onOpenDrilldown('Cost')} title="Waste">
          <BaseChart bottomLabels={monthLabels} chartHeight={138} leftTicks={['300', '250', '200', '150', '100', '50', '0']} rightLabel="Quantity" rightTicks={['300', '250', '200', '150', '100', '50', '0']} topPadding={10}>
            <BarChart bars={[67, 36, 55, 84, 58, 78, 61, 35, 58, 40, 68, 31]} color="#118ED4" />
            <PolylineChart color="#F1F5FF" dashed points={[64, 67, 63, 70, 78, 65, 68, 60, 58, 70, 68, 61]} strokeWidth={1.25} />
          </BaseChart>
          <LegendRow items={[{color: '#118ED4', label: 'Units'}, {color: '#F1F5FF', dashed: true, label: 'Waste'}]} />
        </InnerCard>

        <InnerCard cardSx={{pb: 1.15}} onExpand={() => onOpenDrilldown('Cost')} title="Downtime">
          <BaseChart bottomLabels={monthLabels} chartHeight={138} leftLabel="Hours" leftTicks={['200h', '150h', '100h', '50h', '0h']} topPadding={10}>
            <BarChart bars={[49, 64, 37, 40, 53, 74, 64, 48, 56, 70, 42, 65]} color="#5B35B9" />
            <PolylineChart color="#F1F5FF" dashed points={[60, 66, 62, 61, 67, 67, 60, 66, 60, 68, 66, 60]} strokeWidth={1.25} />
          </BaseChart>
          <LegendRow items={[{color: '#5B35B9', label: 'Actual'}, {color: '#F1F5FF', dashed: true, label: 'Target'}]} />
        </InnerCard>

        <InnerCard onExpand={onOpenCostOverview} title="Cost Overview">
          <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 0.6, mb: 0.7}}>
            <Box sx={{px: 0.8, py: 0.25, borderRadius: '999px', bgcolor: '#2F7BFF', color: '#FFFFFF', fontSize: 10.5, fontWeight: 700}}>Unit</Box>
            <Box sx={{px: 0.8, py: 0.25, borderRadius: '999px', bgcolor: '#4A5362', color: '#FFFFFF', fontSize: 10.5, fontWeight: 700}}>Line</Box>
          </Box>
          <CostOverviewList />
        </InnerCard>
      </SectionShell>

      <SectionShell
        bodySx={{display: 'grid', gridTemplateRows: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 0.78fr) minmax(0, 0.78fr)', gap: 1.1}}
        onExpand={() => onOpenDrilldown('People')}
        title="People"
      >
        <InnerCard onExpand={onOpenAbsencesLeaves} title="Absences & Leaves">
          <Box sx={{display: 'grid', gridTemplateColumns: '136px 1fr', gap: 1}}>
            <BigMetricCard accent="#67D783" detail="Absences" value="15" valueSuffix="%" />
            <Box>
              <BaseChart bottomLabels={quarterLabels} chartHeight={58} leftTicks={['150', '100', '50', '0']} topPadding={8}>
                <StackedBarChart
                  series={[
                    {color: '#14A0EB', values: [12, 25, 40, 28]},
                    {color: '#A87921', values: [14, 18, 26, 24]},
                    {color: '#CEBA2C', values: [10, 16, 22, 18]},
                    {color: '#2DB76E', values: [20, 28, 32, 30]},
                  ]}
                />
                <PolylineChart color="#F1F5FF" dashed points={[78, 66, 62, 70]} />
              </BaseChart>
              <LegendRow items={[{color: '#14A0EB', label: 'Unplanned Absence'}, {color: '#A87921', label: 'Medical Leave'}, {color: '#CEBA2C', label: 'Vacation'}, {color: '#2DB76E', label: 'Day Off'}, {color: '#F1F5FF', dashed: true, label: 'Target'}]} />
            </Box>
          </Box>
        </InnerCard>

        <InnerCard onExpand={onOpenOvertime} title="Overtime">
          <Box sx={{display: 'grid', gridTemplateColumns: '136px 1fr', gap: 1}}>
            <BigMetricCard accent="#67D783" detail="Overtime" value="200" valueSuffix="hrs" />
            <Box>
              <BaseChart bottomLabels={quarterLabels} chartHeight={58} leftTicks={['150', '100', '50', '0']} rightLabel="Quantity" rightTicks={['6K', '4K', '2K', '0']} topPadding={8}>
                <MultiBarChart series={[{color: '#1399EB', values: [36, 50, 78, 42]}, {color: '#1CA87E', values: [82, 70, 63, 72]}]} />
                <PolylineChart color="#F1F5FF" dashed points={[82, 72, 65, 85]} />
              </BaseChart>
              <LegendRow items={[{color: '#1399EB', label: 'Target'}, {color: '#1CA87E', label: 'Actual'}, {color: '#F1F5FF', dashed: true, label: 'Spendings'}]} />
            </Box>
          </Box>
        </InnerCard>

        <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.05, minHeight: 0}}>
          <InnerCard onExpand={onOpenTurnover} title="Turnover">
            <RingStat accentA="#5B39D1" accentB="#138FE8" label={'Voluntary\n50%\n\nInvoluntary\n50%'} value="10%" />
          </InnerCard>
          <InnerCard onExpand={onOpenOpenPositions} title="Open Positions">
            <Box sx={{display: 'grid', gap: 0.55}}>
              <StatusTable rows={[{label: 'Total', value: '10'}]} />
              <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.55}}>
                <StatusTable rows={[{label: 'Operator', value: '3'}]} />
                <StatusTable rows={[{label: 'Line Leader', value: '4'}]} />
              </Box>
              <StatusTable rows={[{label: 'Operations Manager', value: '3'}]} />
            </Box>
          </InnerCard>
        </Box>

        <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.05, minHeight: 0}}>
          <InnerCard onExpand={onOpenHeadcount} title="Headcount">
            <Box sx={{display: 'grid', gap: 0.65}}>
              <CompactValueTile caption="Total" target="1.000" value="2.000" />
              <CompactValueTile caption="BD Excellence" target="500" value="1.000" />
            </Box>
          </InnerCard>
          <InnerCard onExpand={onOpenRecognition} title="Recognition">
            <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.65}}>
              <CompactValueTile caption="Quarter 1" target="100" value="120" />
              <CompactValueTile caption="Quarter 2" target="100" value="150" />
              <CompactValueTile caption="Quarter 3" target="100" value="130" />
              <CompactValueTile caption="Quarter 4" target="100" value="120" />
            </Box>
          </InnerCard>
        </Box>
      </SectionShell>

      <Box sx={{display: 'grid', gridTemplateRows: 'minmax(0, 0.72fr) minmax(0, 1.62fr) minmax(0, 1fr)', gap: 1.2, height: '100%', minHeight: 0, overflow: 'hidden'}}>
        <SectionShell actionLabel="" onExpand={() => onOpenDrilldown('Blu.AI')} title="Blu.AI">
          <Box sx={{display: 'grid', gap: 0.9}}>
            <AiAlertCard accent="#5AC85A" body="OEE increased by +4.2% in Cell 3 this week due to reduced setup times. Recommendation: replicate the production sequence in Cell 5." title="OEE up +4.2% this week in Cell 3" />
            <AiAlertCard accent="#E54C4C" body="Rejection rate +5.8% in Cell 2 due to Machine X wear. Recommendation: schedule immediate maintenance to avoid delivery risks for batch #402." title="Rejection rate up +5.8% in Cell 2" />
          </Box>
        </SectionShell>

        <SectionShell actionLabel="" onExpand={() => onOpenDrilldown('Plant Overview')} title="Plant Overview">
          <Box sx={{position: 'relative', borderRadius: '4px', overflow: 'hidden', bgcolor: '#E5E9F0', height: '100%', minHeight: 0}}>
            <Box component="img" src="/images/3Dview.png" alt="Plant overview" sx={{display: 'block', width: '100%', height: '100%', minHeight: 0, objectFit: 'cover'}} />
            <Box sx={{position: 'absolute', left: 48, top: 88, px: 1, py: 0.75, borderRadius: '5px', bgcolor: '#151C2B', border: '1px solid rgba(255,255,255,0.12)', minWidth: 130}}>
              <Typography sx={{fontSize: 9.5, color: '#F3F7FF', mb: 0.65, fontWeight: 800}}>Cell 5, Line 10, Zone 01</Typography>
              <Typography sx={{fontSize: 9.5, color: '#F3F7FF'}}>Breakdown - Z1 Feeder</Typography>
            </Box>
          </Box>
        </SectionShell>

        <SectionShell onExpand={() => onOpenDrilldown('Sustainability')} title="Sustainability">
          <InnerCard onExpand={() => onOpenDrilldown('Sustainability')} title="Overview">
            <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.7}}>
              <SustainabilityMetric label="Water Consumption" trend="+0.5%" unit="m3/1k units" value="142" />
              <SustainabilityMetric label="GHG Emissions" trend="+0.5%" unit="m3/1k units" value="200" />
              <SustainabilityMetric label="Energy Consumption" trend="+0.5%" unit="kWh/1k units" value="1.250" />
              <SustainabilityMetric label="Waste" trend="+0.5%" unit="Kg/1k units" value="480" />
            </Box>
          </InnerCard>
        </SectionShell>
      </Box>
    </Box>
  );
}

export default function ControlTowerScreen(props: ControlTowerScreenProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [drilldown, setDrilldown] = useState<DrilldownKind | null>(null);
  const [showAbsencesLeaves, setShowAbsencesLeaves] = useState(false);
  const [showBatchesOnHold, setShowBatchesOnHold] = useState(false);
  const [showCostOverview, setShowCostOverview] = useState(false);
  const [showEsosOverview, setShowEsosOverview] = useState(false);
  const [showHeadcount, setShowHeadcount] = useState(false);
  const [showIncidentsOverview, setShowIncidentsOverview] = useState(false);
  const [showOee, setShowOee] = useState(false);
  const [showOpenPositions, setShowOpenPositions] = useState(false);
  const [showOvertime, setShowOvertime] = useState(false);
  const [showProductionOverview, setShowProductionOverview] = useState(false);
  const [showProductionOutput, setShowProductionOutput] = useState(false);
  const [showProductionRanking, setShowProductionRanking] = useState(false);
  const [showQualityIssues, setShowQualityIssues] = useState(false);
  const [showQualityStatusInvestigation, setShowQualityStatusInvestigation] = useState(false);
  const [showRecognition, setShowRecognition] = useState(false);
  const [showSafetyStatusInvestigation, setShowSafetyStatusInvestigation] = useState(false);
  const [showSafetyTracking, setShowSafetyTracking] = useState(false);
  const [showTurnover, setShowTurnover] = useState(false);

  if (drilldown) {
    if (drilldown === 'Cost') {
      return <CostDrilldownScreen {...props} onBack={() => setDrilldown(null)} />;
    }

    if (drilldown === 'Delivery') {
      return <DeliveryDrilldownScreen {...props} onBack={() => setDrilldown(null)} />;
    }

    if (drilldown === 'People') {
      return <PeopleDrilldownScreen {...props} onBack={() => setDrilldown(null)} />;
    }

    if (drilldown === 'Plant Overview') {
      return <PlantOverviewDrilldownScreen {...props} onBack={() => setDrilldown(null)} />;
    }

    return <ControlTowerDrilldownScreen {...props} kind={drilldown} onBack={() => setDrilldown(null)} />;
  }

  return (
    <Box sx={{height: '100dvh', minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#09111F', overflow: 'hidden'}}>
      <TowerHeader {...props} />
      <Box sx={{position: 'relative', flexGrow: 1, minHeight: 0, px: {xs: 2, md: 5}, pt: 2.5, pb: 2, bgcolor: '#09111F', overflow: 'hidden'}}>
        <Box sx={{position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0}}>
        <Typography sx={{fontSize: 20, lineHeight: 1.2, fontWeight: 800, color: '#FFFFFF', mb: 2, flexShrink: 0}}>Control Tower</Typography>
        <Box
          sx={{
            position: 'absolute',
            left: {xs: 24, md: 24},
            top: '54%',
            transform: {xs: 'translateY(-50%)', md: 'translate(-50%, -50%)'},
            zIndex: 3,
          }}
        >
          {pageIndex > 0 ? (
            <IconButton
              onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
              sx={{width: 34, height: 34, bgcolor: '#2A5EE8', color: '#FFFFFF', '&:hover': {bgcolor: '#3A6AF0'}}}
            >
              <ChevronLeftIcon sx={{fontSize: 18}} />
            </IconButton>
          ) : null}
        </Box>
        <Box
          sx={{
            position: 'absolute',
            right: {xs: 24, md: 24},
            top: '54%',
            transform: {xs: 'translateY(-50%)', md: 'translate(50%, -50%)'},
            zIndex: 3,
          }}
        >
          {pageIndex < 1 ? (
            <IconButton
              onClick={() => setPageIndex((prev) => Math.min(1, prev + 1))}
              sx={{width: 34, height: 34, bgcolor: '#2A5EE8', color: '#FFFFFF', '&:hover': {bgcolor: '#3A6AF0'}}}
            >
              <ChevronRightIcon sx={{fontSize: 18}} />
            </IconButton>
          ) : null}
        </Box>

        <Box sx={{flex: '1 1 0', minHeight: 0, overflow: 'hidden'}}>
          {pageIndex === 0 ? (
            <PageOne
              onOpenBatchesOnHold={() => setShowBatchesOnHold(true)}
              onOpenDrilldown={setDrilldown}
              onOpenEsosOverview={() => setShowEsosOverview(true)}
              onOpenIncidentOverview={() => setShowIncidentsOverview(true)}
              onOpenOee={() => setShowOee(true)}
              onOpenProductionOverview={() => setShowProductionOverview(true)}
              onOpenProductionOutput={() => setShowProductionOutput(true)}
              onOpenProductionRanking={() => setShowProductionRanking(true)}
              onOpenQualityIssues={() => setShowQualityIssues(true)}
              onOpenQualityStatusInvestigation={() => setShowQualityStatusInvestigation(true)}
              onOpenSafetyStatusInvestigation={() => setShowSafetyStatusInvestigation(true)}
              onOpenSafetyTracking={() => setShowSafetyTracking(true)}
            />
          ) : (
            <PageTwo
              onOpenAbsencesLeaves={() => setShowAbsencesLeaves(true)}
              onOpenCostOverview={() => setShowCostOverview(true)}
              onOpenDrilldown={setDrilldown}
              onOpenHeadcount={() => setShowHeadcount(true)}
              onOpenOpenPositions={() => setShowOpenPositions(true)}
              onOpenOvertime={() => setShowOvertime(true)}
              onOpenRecognition={() => setShowRecognition(true)}
              onOpenTurnover={() => setShowTurnover(true)}
            />
          )}
        </Box>
        </Box>
      </Box>
      {showAbsencesLeaves ? <AbsencesLeavesDrilldown onClose={() => setShowAbsencesLeaves(false)} /> : null}
      {showBatchesOnHold ? <BatchesOnHoldDrilldown onClose={() => setShowBatchesOnHold(false)} /> : null}
      {showCostOverview ? <CostOverviewDrilldown onClose={() => setShowCostOverview(false)} /> : null}
      {showEsosOverview ? <EsosOverviewDrilldown onClose={() => setShowEsosOverview(false)} /> : null}
      {showHeadcount ? <HeadcountDrilldown onClose={() => setShowHeadcount(false)} /> : null}
      {showIncidentsOverview ? <IncidentsOverviewDrilldown onClose={() => setShowIncidentsOverview(false)} /> : null}
      {showOee ? <OeeDrilldown onClose={() => setShowOee(false)} /> : null}
      {showOpenPositions ? <OpenPositionsDrilldown onClose={() => setShowOpenPositions(false)} /> : null}
      {showOvertime ? <OvertimeDrilldown onClose={() => setShowOvertime(false)} /> : null}
      {showProductionOverview ? <ProductionOverviewDrilldown onClose={() => setShowProductionOverview(false)} /> : null}
      {showProductionOutput ? <ProductionOutputDrilldown onClose={() => setShowProductionOutput(false)} /> : null}
      {showProductionRanking ? <ProductionRankingDrilldown onClose={() => setShowProductionRanking(false)} /> : null}
      {showQualityIssues ? <QualityIssuesDrilldown onClose={() => setShowQualityIssues(false)} /> : null}
      {showQualityStatusInvestigation ? <QualityStatusInvestigationDrilldown onClose={() => setShowQualityStatusInvestigation(false)} /> : null}
      {showRecognition ? <RecognitionDrilldown onClose={() => setShowRecognition(false)} /> : null}
      {showSafetyStatusInvestigation ? <SafetyStatusInvestigationDrilldown onClose={() => setShowSafetyStatusInvestigation(false)} /> : null}
      {showSafetyTracking ? <SafetyTrackingDrilldown onClose={() => setShowSafetyTracking(false)} /> : null}
      {showTurnover ? <TurnoverDrilldown onClose={() => setShowTurnover(false)} /> : null}
    </Box>
  );
}
