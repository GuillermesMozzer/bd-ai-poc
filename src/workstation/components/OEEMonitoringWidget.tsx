import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Menu, MenuItem, Typography, Button, Portal } from '@mui/material';
import {
  ErrorOutline as ErrorOutlineIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Room as RoomIcon,
  CalendarToday as CalendarTodayIcon,
  Speed as SpeedIcon,
  TrendingDown as TrendingDownIcon,
  DeleteOutline as DeleteOutlineIcon,
  Tag as TagIcon,
  Sensors as SensorsIcon,
  AutoAwesome as AutoAwesomeIcon,
  StarBorder as StarBorderIcon,
  Launch as LaunchIcon,
  Build as BuildIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import {
  tokenError,
  tokenWarning,
  tokenSuccess,
  workstationVisuals,
} from '../theme';
import OeeModuleDrilldown, { type OeeModuleView } from './OEEProductionHour';
import WidgetShell from './WidgetShell';
import type { WorkstationWidgetProps } from '../types';

type ZoneStatus = 'RUNNING' | 'STARVING' | 'BLOCKED';

interface ZoneData {
  id: number;
  name: string;
  defaultStatus: ZoneStatus;
  top: string;
  left: string;
  path: string;
  criticalItems: string[];
}

const ZONES: ZoneData[] = [
  {
    id: 1,
    name: 'Zone 1',
    defaultStatus: 'RUNNING',
    top: '10%',
    left: '40%',
    path: '',
    criticalItems: [],
  },
  {
    id: 2,
    name: 'Zone 2',
    defaultStatus: 'STARVING',
    top: '33%',
    left: '15%',
    path: '',
    criticalItems: [
      'Speed (78 Ppm)',
      'Downtime Duration (1h48min)',
      'Zone Scrap (Actual: 3.1%)',
      'Fault Count (Actual: 16)',
      'Bottleneck Impact (Actual: 28min)',
    ],
  },
  {
    id: 3,
    name: 'Zone 3',
    defaultStatus: 'RUNNING',
    top: '30%',
    left: '60%',
    path: '',
    criticalItems: [],
  },
  {
    id: 4,
    name: 'Zone 4',
    defaultStatus: 'RUNNING',
    top: '42%',
    left: '68%',
    path: '',
    criticalItems: [],
  },
  {
    id: 5,
    name: 'Zone 5',
    defaultStatus: 'BLOCKED',
    top: '70%',
    left: '50%',
    path: 'M 490,590 L 610,515 L 690,590 L 570,680 Z',
    criticalItems: [
      'Downtime Duration (1h48min)',
      'Bottleneck impact (28 min)',
    ],
  },
];

interface MetricData {
  name: string;
  iconType: 'speed' | 'downtime' | 'scrap' | 'fault' | 'bottleneck';
  status: 'OK' | 'CRITICAL';
  actual: string;
  targetOrLastShift: string;
  comparisonType: 'target' | 'lastShift';
}

const ZONE_METRICS_DATA: Record<number, MetricData[]> = {
  1: [
    { name: 'Speed', iconType: 'speed', status: 'OK', actual: '78 PPM', targetOrLastShift: '74 PPM', comparisonType: 'target' },
    { name: 'Downtime Duration', iconType: 'downtime', status: 'OK', actual: '1h48min', targetOrLastShift: '1h', comparisonType: 'lastShift' },
    { name: 'Zone Scrap', iconType: 'scrap', status: 'CRITICAL', actual: '3.1%', targetOrLastShift: '2.7%', comparisonType: 'target' },
    { name: 'Fault Count', iconType: 'fault', status: 'CRITICAL', actual: '16', targetOrLastShift: '10', comparisonType: 'lastShift' },
    { name: 'Bottleneck Impact', iconType: 'bottleneck', status: 'OK', actual: '28 min', targetOrLastShift: '15 min', comparisonType: 'lastShift' },
  ],
  2: [
    { name: 'Speed', iconType: 'speed', status: 'CRITICAL', actual: '62 PPM', targetOrLastShift: '74 PPM', comparisonType: 'target' },
    { name: 'Downtime Duration', iconType: 'downtime', status: 'CRITICAL', actual: '2h15min', targetOrLastShift: '1h', comparisonType: 'lastShift' },
    { name: 'Zone Scrap', iconType: 'scrap', status: 'CRITICAL', actual: '4.2%', targetOrLastShift: '2.7%', comparisonType: 'target' },
    { name: 'Fault Count', iconType: 'fault', status: 'CRITICAL', actual: '22', targetOrLastShift: '10', comparisonType: 'lastShift' },
    { name: 'Bottleneck Impact', iconType: 'bottleneck', status: 'CRITICAL', actual: '45 min', targetOrLastShift: '15 min', comparisonType: 'lastShift' },
  ],
  3: [
    { name: 'Speed', iconType: 'speed', status: 'OK', actual: '75 PPM', targetOrLastShift: '74 PPM', comparisonType: 'target' },
    { name: 'Downtime Duration', iconType: 'downtime', status: 'OK', actual: '0h45min', targetOrLastShift: '1h', comparisonType: 'lastShift' },
    { name: 'Zone Scrap', iconType: 'scrap', status: 'OK', actual: '1.8%', targetOrLastShift: '2.7%', comparisonType: 'target' },
    { name: 'Fault Count', iconType: 'fault', status: 'OK', actual: '4', targetOrLastShift: '10', comparisonType: 'lastShift' },
    { name: 'Bottleneck Impact', iconType: 'bottleneck', status: 'OK', actual: '12 min', targetOrLastShift: '15 min', comparisonType: 'lastShift' },
  ],
  4: [
    { name: 'Speed', iconType: 'speed', status: 'OK', actual: '76 PPM', targetOrLastShift: '74 PPM', comparisonType: 'target' },
    { name: 'Downtime Duration', iconType: 'downtime', status: 'OK', actual: '0h50min', targetOrLastShift: '1h', comparisonType: 'lastShift' },
    { name: 'Zone Scrap', iconType: 'scrap', status: 'OK', actual: '2.1%', targetOrLastShift: '2.7%', comparisonType: 'target' },
    { name: 'Fault Count', iconType: 'fault', status: 'OK', actual: '6', targetOrLastShift: '10', comparisonType: 'lastShift' },
    { name: 'Bottleneck Impact', iconType: 'bottleneck', status: 'OK', actual: '14 min', targetOrLastShift: '15 min', comparisonType: 'lastShift' },
  ],
  5: [
    { name: 'Speed', iconType: 'speed', status: 'OK', actual: '74 PPM', targetOrLastShift: '74 PPM', comparisonType: 'target' },
    { name: 'Downtime Duration', iconType: 'downtime', status: 'CRITICAL', actual: '1h58min', targetOrLastShift: '1h', comparisonType: 'lastShift' },
    { name: 'Zone Scrap', iconType: 'scrap', status: 'OK', actual: '2.4%', targetOrLastShift: '2.7%', comparisonType: 'target' },
    { name: 'Fault Count', iconType: 'fault', status: 'OK', actual: '8', targetOrLastShift: '10', comparisonType: 'lastShift' },
    { name: 'Bottleneck Impact', iconType: 'bottleneck', status: 'CRITICAL', actual: '32 min', targetOrLastShift: '15 min', comparisonType: 'lastShift' },
  ],
};

const getMetricIcon = (type: string, status: 'OK' | 'CRITICAL') => {
  const color = status === 'OK' ? '#2E7D32' : '#EF4444';
  switch (type) {
    case 'speed':
      return <SpeedIcon sx={{ fontSize: 18, color }} />;
    case 'downtime':
      return <TrendingDownIcon sx={{ fontSize: 18, color }} />;
    case 'scrap':
      return <DeleteOutlineIcon sx={{ fontSize: 18, color }} />;
    case 'fault':
      return <TagIcon sx={{ fontSize: 18, color }} />;
    case 'bottleneck':
      return <SensorsIcon sx={{ fontSize: 18, color }} />;
    default:
      return null;
  }
};

interface BoardCardData {
  zone: string;
  station: string;
  downtime: string;
  title: string;
  description: string;
  status: 'OPEN' | 'RESOLVED';
  time: string;
  categories: string[];
  borderColor: string;
  titleColor: string;
}

interface BoardColumnData {
  title: string;
  cards: BoardCardData[];
}

const BOARD_COLUMNS: BoardColumnData[] = [
  {
    title: 'Safety',
    cards: [
      {
        zone: 'Z5',
        station: 'C30',
        downtime: 'DT - 8 min',
        title: 'Start/Stop · Line restart',
        description: 'Restart after break: warm-up cycle and first-article approval before resuming 20GA run.',
        status: 'OPEN',
        time: '09:15AM',
        categories: ['D'],
        borderColor: '#A855F7',
        titleColor: '#7C3AED',
      },
      {
        zone: 'Z3',
        station: 'C30',
        downtime: 'DT - 15 min',
        title: 'CIL · Cleaning, Inspection',
        description: 'Start-of-shift CIL on Z3: guide rails cleaned, sensors inspected, cam followers lubricated.',
        status: 'RESOLVED',
        time: '09:45AM',
        categories: ['S', 'Q'],
        borderColor: '#F97316',
        titleColor: '#EA580C',
      },
      {
        zone: 'Z5',
        station: 'C30',
        downtime: 'DT - 30 min',
        title: 'Microstops · Station 30 infeed',
        description: 'Recurring micro-stops from part misalignment: ~12 short stops this hour.',
        status: 'RESOLVED',
        time: '09:45AM',
        categories: ['D'],
        borderColor: '#A855F7',
        titleColor: '#7C3AED',
      },
    ],
  },
  {
    title: 'Delivery',
    cards: [
      {
        zone: 'Z5',
        station: 'C30',
        downtime: 'DT - 18 min',
        title: 'Running Scrap · Hub flash',
        description: 'Intermittent flash on catheter hub; 18 units rejected at vision station.',
        status: 'RESOLVED',
        time: '10:37AM',
        categories: ['Q', 'C'],
        borderColor: '#1E3A8A',
        titleColor: '#1E3A8A',
      },
      {
        zone: 'Z5',
        station: 'C30',
        downtime: 'DT - 8 min',
        title: 'Start/Stop · Line restart',
        description: 'Restart after break: warm-up cycle and first-article approval before resuming 20GA run.',
        status: 'OPEN',
        time: '09:15AM',
        categories: ['D'],
        borderColor: '#A855F7',
        titleColor: '#7C3AED',
      },
      {
        zone: 'Z3',
        station: 'C30',
        downtime: 'DT - 15 min',
        title: 'CIL · Cleaning, Inspection',
        description: 'Start-of-shift CIL on Z3: guide rails cleaned, sensors inspected, cam followers lubricated.',
        status: 'RESOLVED',
        time: '09:45AM',
        categories: ['S', 'Q'],
        borderColor: '#F97316',
        titleColor: '#EA580C',
      },
    ],
  },
  {
    title: 'Quality',
    cards: [
      {
        zone: 'Z2',
        station: 'C35',
        downtime: 'DT - 45 min',
        title: 'Planned Maintenance · Quarterly PM',
        description: 'Scheduled PM on Station 20 servo: belt replacement and torque check per maintenance plan.',
        status: 'RESOLVED',
        time: '08:30AM',
        categories: ['C'],
        borderColor: '#3B82F6',
        titleColor: '#2563EB',
      },
      {
        zone: 'Z5',
        station: 'C30',
        downtime: 'DT - 30 min',
        title: 'Microstops · Station 30 infeed',
        description: 'Recurring micro-stops from part misalignment: ~12 short stops this hour.',
        status: 'RESOLVED',
        time: '09:45AM',
        categories: ['D'],
        borderColor: '#A855F7',
        titleColor: '#7C3AED',
      },
      {
        zone: 'Z5',
        station: 'C50',
        downtime: 'DT - 60 min',
        title: 'Rework Scrap · Labeling',
        description: 'Mislabeled pouches from Station 50 held for relabeling.',
        status: 'OPEN',
        time: '11:10AM',
        categories: ['Q', 'C'],
        borderColor: '#10B981',
        titleColor: '#059669',
      },
    ],
  },
  {
    title: 'Cost',
    cards: [
      {
        zone: 'Z5',
        station: 'C50',
        downtime: 'DT - 60 min',
        title: 'Rework Scrap · Labeling',
        description: 'Mislabeled pouches from Station 50 held for relabeling.',
        status: 'OPEN',
        time: '11:10AM',
        categories: ['Q', 'C'],
        borderColor: '#10B981',
        titleColor: '#059669',
      },
      {
        zone: 'Z5',
        station: 'C30',
        downtime: 'DT - 30 min',
        title: 'Microstops · Station 30 infeed',
        description: 'Recurring micro-stops from part misalignment: ~12 short stops this hour.',
        status: 'RESOLVED',
        time: '09:45AM',
        categories: ['D'],
        borderColor: '#A855F7',
        titleColor: '#7C3AED',
      },
      {
        zone: 'Z3',
        station: 'C30',
        downtime: 'DT - 15 min',
        title: 'CIL · Cleaning, Inspection',
        description: 'Start-of-shift CIL on Z3: guide rails cleaned, sensors inspected, cam followers lubricated.',
        status: 'RESOLVED',
        time: '09:45AM',
        categories: ['S', 'Q'],
        borderColor: '#F97316',
        titleColor: '#EA580C',
      },
    ],
  },
];

export default function OEEMonitoringWidget({
  className,
  style,
}: WorkstationWidgetProps) {
  const [mode, setMode] = useState<'3d' | 'dashboard'>('3d');
  const [isOeeModuleOpen, setIsOeeModuleOpen] = useState(false);
  const [oeeModuleView, setOeeModuleView] = useState<OeeModuleView>('timeline');

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Status state per zone
  const [zoneStatuses, setZoneStatuses] = useState<Record<number, ZoneStatus>>({
    1: 'RUNNING',
    2: 'STARVING',
    3: 'RUNNING',
    4: 'RUNNING',
    5: 'BLOCKED',
  });

  // Collapsible cards state
  const [expandedZones, setExpandedZones] = useState<Record<number, boolean>>({});

  // Menu state
  const [activeMenuZoneId, setActiveMenuZoneId] = useState<number | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<any>, zoneId: number) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveMenuZoneId(zoneId);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setActiveMenuZoneId(null);
  };

  const handleStatusChange = (zoneId: number, newStatus: ZoneStatus) => {
    setZoneStatuses((prev) => ({
      ...prev,
      [zoneId]: newStatus,
    }));
    handleCloseMenu();
  };

  const toggleExpand = (zoneId: number) => {
    setExpandedZones((prev) => ({
      ...prev,
      [zoneId]: !prev[zoneId],
    }));
  };

  const adjustPositions = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    ZONES.forEach((zone) => {
      const cardEl = cardRefs.current[zone.id];
      if (cardEl && expandedZones[zone.id]) {
        // Temporarily clear transform to measure its natural bounds
        cardEl.style.transform = 'none';

        const cardRect = cardEl.getBoundingClientRect();

        let dx = 0;
        let dy = 0;

        // Check horizontal bounds (12px margin from edges)
        if (cardRect.right > containerRect.right) {
          dx = containerRect.right - cardRect.right - 12;
        } else if (cardRect.left < containerRect.left) {
          dx = containerRect.left - cardRect.left + 12;
        }

        // Check vertical bounds (12px margin from edges)
        if (cardRect.bottom > containerRect.bottom) {
          dy = containerRect.bottom - cardRect.bottom - 12;
        } else if (cardRect.top < containerRect.top) {
          dy = containerRect.top - cardRect.top + 12;
        }

        cardEl.style.transform = `translate(${dx}px, ${dy}px)`;
      } else if (cardEl) {
        cardEl.style.transform = '';
      }
    });
  }, [expandedZones]);

  useEffect(() => {
    adjustPositions();
  }); // Run on every render to ensure positioning holds true after DOM updates

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      adjustPositions();
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [adjustPositions]);

  const getPathClassName = (status: ZoneStatus) => {
    switch (status) {
      case 'RUNNING':
        return 'zone-path-running';
      case 'STARVING':
        return 'zone-path-starving';
      case 'BLOCKED':
        return 'zone-path-blocked';
    }
  };

  const getPathGlowClassName = (status: ZoneStatus) => {
    switch (status) {
      case 'RUNNING':
        return 'zone-path-glow-running';
      case 'STARVING':
        return 'zone-path-glow-starving';
      case 'BLOCKED':
        return 'zone-path-glow-blocked';
    }
  };

  const getStatusColors = (status: ZoneStatus) => {
    switch (status) {
      case 'RUNNING':
        return {
          bg: '#E8F5E9',
          color: '#2E7D32',
          border: '#A5D6A7',
        };
      case 'STARVING':
        return {
          bg: '#FFF3E0',
          color: '#E65100',
          border: '#FFCC80',
        };
      case 'BLOCKED':
        return {
          bg: '#FFEBEE',
          color: '#C62828',
          border: '#FFCDD2',
        };
    }
  };

  return (
    <>
      <WidgetShell
      title="Overall Equipment Efficiency"
      action={
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', fontFamily: workstationVisuals.fontFamily, lineHeight: 1 }}>
            NEXIVA
          </Typography>
          <Typography sx={{ fontSize: '10px', color: '#64748B', fontFamily: workstationVisuals.fontFamily, mt: 0.25 }}>
            SKU: 80-APX-50000
          </Typography>
        </Box>
      }
      className={className}
      style={style}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes pulseRedGlow {
          0% {
            stroke-width: 2px;
            stroke-opacity: 0.5;
            filter: drop-shadow(0 0 2px rgba(244, 67, 54, 0.5));
          }
          50% {
            stroke-width: 4.5px;
            stroke-opacity: 0.9;
            filter: drop-shadow(0 0 6px rgba(244, 67, 54, 0.85));
          }
          100% {
            stroke-width: 2px;
            stroke-opacity: 0.5;
            filter: drop-shadow(0 0 2px rgba(244, 67, 54, 0.5));
          }
        }

        @keyframes pulseYellowGlow {
          0% {
            stroke-width: 2px;
            stroke-opacity: 0.5;
            filter: drop-shadow(0 0 2px rgba(255, 152, 0, 0.5));
          }
          50% {
            stroke-width: 4.5px;
            stroke-opacity: 0.9;
            filter: drop-shadow(0 0 6px rgba(255, 152, 0, 0.85));
          }
          100% {
            stroke-width: 2px;
            stroke-opacity: 0.5;
            filter: drop-shadow(0 0 2px rgba(255, 152, 0, 0.5));
          }
        }

        @keyframes pulseRedFill {
          0% {
            fill: rgba(244, 67, 54, 0.08);
          }
          50% {
            fill: rgba(245, 61, 61, 0.31);
          }
          100% {
            fill: rgba(244, 67, 54, 0.08);
          }
        }

        @keyframes pulseYellowFill {
          0% {
            fill: rgba(255, 152, 0, 0.08);
          }
          50% {
            fill: rgba(255, 152, 0, 0.28);
          }
          100% {
            fill: rgba(255, 152, 0, 0.08);
          }
        }

        .zone-path-glow {
          fill: none;
          transition: all 0.3s ease;
        }

        .zone-path-glow-running {
          stroke: #66BB6A;
          stroke-width: 1.5px;
          stroke-opacity: 0.15;
        }

        .zone-path-glow-starving {
          stroke: transparent;
        }

        .zone-path-glow-blocked {
          stroke: transparent;
        }

        .zone-path-base {
          stroke-width: 1px;
          fill: rgba(255, 255, 255, 0.01);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .zone-path-base:hover {
          fill: rgba(37, 99, 235, 0.12);
          stroke: #2563EB;
          stroke-width: 1.5px;
          stroke-opacity: 0.8;
        }

        .zone-path-running {
          stroke: #66BB6A;
        }

        .zone-path-starving {
          stroke: transparent;
          animation: pulseYellowFill 2s infinite ease-in-out;
        }

        .zone-path-blocked {
          stroke: transparent;
          animation: pulseRedFill 1.5s infinite ease-in-out;
        }
      ` }} />

      {/* Main Content Area */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          {/* 3D Map / Dashboard Toggles */}
          <Box sx={{ display: 'flex', border: '1px solid #E2E8F0', borderRadius: '8px', p: '2px', bgcolor: '#F8FAFC', flexShrink: 0 }}>
            <Button
              onClick={() => setMode('3d')}
              sx={{
                px: 2,
                py: 0.5,
                fontSize: '11px',
                fontWeight: 700,
                borderRadius: '6px',
                textTransform: 'uppercase',
                bgcolor: mode === '3d' ? '#E2EEFF' : 'transparent',
                color: mode === '3d' ? '#2563EB' : '#64748B',
                border: mode === '3d' ? '1px solid #BFDBFE' : '1px solid transparent',
                '&:hover': { bgcolor: mode === '3d' ? '#DBEAFE' : '#F1F5F9' },
                minWidth: 0,
                lineHeight: 1.5,
              }}
            >
              3D Map
            </Button>
            <Button
              onClick={() => setMode('dashboard')}
              sx={{
                px: 2,
                py: 0.5,
                fontSize: '11px',
                fontWeight: 700,
                borderRadius: '6px',
                textTransform: 'uppercase',
                bgcolor: mode === 'dashboard' ? '#E2EEFF' : 'transparent',
                color: mode === 'dashboard' ? '#2563EB' : '#64748B',
                border: mode === 'dashboard' ? '1px solid #BFDBFE' : '1px solid transparent',
                '&:hover': { bgcolor: mode === 'dashboard' ? '#DBEAFE' : '#F1F5F9' },
                minWidth: 0,
                lineHeight: 1.5,
              }}
            >
              Dashboard
            </Button>
          </Box>

          {/* Location Selector */}
          <Box sx={{ position: 'relative', width: 140, height: 36, border: '1px solid #C9CDD2', borderRadius: '8px', px: 1.2, display: 'flex', alignItems: 'center', bgcolor: '#FFFFFF', flexShrink: 0 }}>
            <Typography sx={{ position: 'absolute', top: -7, left: 10, px: 0.4, bgcolor: '#FFFFFF', fontSize: '9px', color: '#666C72', fontWeight: 500 }}>
              Location
            </Typography>
            <RoomIcon sx={{ fontSize: 14, color: '#94A3B8', mr: 0.5 }} />
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
              AFA10
            </Typography>
            <KeyboardArrowDownIcon sx={{ ml: 'auto', fontSize: 14, color: '#64748B' }} />
          </Box>

          {/* Date Picker */}
          <Box sx={{ position: 'relative', width: 160, height: 36, border: '1px solid #C9CDD2', borderRadius: '8px', px: 1.2, display: 'flex', alignItems: 'center', bgcolor: '#FFFFFF', flexShrink: 0 }}>
            <Typography sx={{ position: 'absolute', top: -7, left: 10, px: 0.4, bgcolor: '#FFFFFF', fontSize: '9px', color: '#666C72', fontWeight: 500 }}>
              Select date
            </Typography>
            <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8' }}>
              MM/DD/YYYY
            </Typography>
            <CalendarTodayIcon sx={{ ml: 'auto', fontSize: 14, color: '#2563EB' }} />
          </Box>
        </Box>

        {/* Content View */}
        {mode === '3d' ? (
          /* Image & SVG Container */
          <Box ref={containerRef} sx={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden', borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#dce9f5' }}>
            <Box
              component="img"
              src="/images/OEE Equipament.png"
              alt="OEE Equipment Layout"
              sx={{
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center center',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />

            {/* SVG Outline Overlay */}
            <Box
              component="svg"
              viewBox="0 0 1251 832"
              preserveAspectRatio="xMidYMid slice"
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                zIndex: 1,
                pointerEvents: 'none',
              }}
            >
              {ZONES.map((zone) => {
                const status = zoneStatuses[zone.id];
                return (
                  <React.Fragment key={zone.id}>
                    {/* Glow Path (underneath) */}
                    <path
                      d={zone.path}
                      className={`zone-path-glow ${getPathGlowClassName(status)}`}
                    />
                    {/* Interactive Sharp Path (on top) */}
                    <path
                      d={zone.path}
                      className={`zone-path-base ${getPathClassName(status)}`}
                      style={{ pointerEvents: 'auto' }}
                      onClick={(e) => handleOpenMenu(e, zone.id)}
                    />
                  </React.Fragment>
                );
              })}
            </Box>

            {/* Status Pills and Expandable Cards */}
            {ZONES.map((zone) => {
              const status = zoneStatuses[zone.id];
              const isExpanded = expandedZones[zone.id];
              const colors = getStatusColors(status);

              return (
                <Box
                  key={zone.id}
                  ref={(el) => {
                    cardRefs.current[zone.id] = el;
                  }}
                  sx={{
                    position: 'absolute',
                    top: zone.top,
                    left: zone.left,
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    pointerEvents: 'auto',
                    transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {!isExpanded ? (
                    /* Collapsed Pill */
                    <Box
                      onClick={() => toggleExpand(zone.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        px: 1.25,
                        py: 0.6,
                        bgcolor: '#FFFFFF',
                        border: '1px solid #C9CDD2',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#F8FAFC' },
                      }}
                    >
                      <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#1E293B', fontFamily: workstationVisuals.fontFamily }}>
                        {zone.name}
                      </Typography>

                      <Box
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenMenu(e, zone.id);
                        }}
                        sx={{
                          px: 0.8,
                          py: 0.2,
                          bgcolor: colors.bg,
                          border: `1px solid ${colors.border}`,
                          borderRadius: '4px',
                          cursor: 'pointer',
                          '&:hover': { opacity: 0.8 },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '9px',
                            fontWeight: 800,
                            color: colors.color,
                            lineHeight: 1.1,
                            letterSpacing: '0.5px',
                            fontFamily: workstationVisuals.fontFamily,
                          }}
                        >
                          {status}
                        </Typography>
                      </Box>

                      <KeyboardArrowDownIcon sx={{ fontSize: 14, color: '#64748B' }} />
                    </Box>
                  ) : (
                    /* Expanded Custom Metrics Card */
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: 290,
                        bgcolor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '16px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        p: 1.5,
                      }}
                    >
                      {/* Header */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1.5,
                          width: '100%',
                        }}
                      >
                        <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', fontFamily: workstationVisuals.fontFamily }}>
                          {zone.name}
                        </Typography>
                        <Box
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenMenu(e, zone.id);
                          }}
                          sx={{
                            px: 0.8,
                            py: 0.2,
                            bgcolor: colors.bg,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            '&:hover': { opacity: 0.8 },
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: '9px',
                              fontWeight: 800,
                              color: colors.color,
                              lineHeight: 1.1,
                              letterSpacing: '0.5px',
                              fontFamily: workstationVisuals.fontFamily,
                            }}
                          >
                            {status}
                          </Typography>
                        </Box>
                        <Box
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(zone.id);
                          }}
                          sx={{
                            ml: 'auto',
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            bgcolor: '#E2E8F0',
                            color: '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: '#CBD5E1' },
                          }}
                        >
                          <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
                        </Box>
                      </Box>

                      {/* Inner Box with metrics */}
                      <Box
                        sx={{
                          bgcolor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          overflow: 'hidden',
                        }}
                      >
                        {ZONE_METRICS_DATA[zone.id]?.map((metric, idx, arr) => (
                          <Box
                            key={metric.name}
                            sx={{
                              p: 1.25,
                              borderBottom: idx < arr.length - 1 ? '1px solid #E2E8F0' : 'none',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 0.5,
                            }}
                          >
                            {/* Metric Header */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {getMetricIcon(metric.iconType, metric.status)}
                                <Typography
                                  sx={{
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    color: '#1E293B',
                                    fontFamily: workstationVisuals.fontFamily,
                                  }}
                                >
                                  {metric.name}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  px: 0.8,
                                  py: 0.2,
                                  borderRadius: '10px',
                                  border: metric.status === 'OK' ? '1px solid #A5D6A7' : 'none',
                                  bgcolor: metric.status === 'OK' ? '#E8F5E9' : '#EF4444',
                                  color: metric.status === 'OK' ? '#2E7D32' : '#FFFFFF',
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: '9px',
                                    fontWeight: 800,
                                    lineHeight: 1.1,
                                    fontFamily: workstationVisuals.fontFamily,
                                  }}
                                >
                                  {metric.status}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Metric Details */}
                            <Box sx={{ display: 'flex', gap: 1.5, pl: 3.25 }}>
                              <Typography
                                sx={{
                                  fontSize: '11px',
                                  fontFamily: workstationVisuals.fontFamily,
                                  color: '#64748B',
                                }}
                              >
                                Actual:{' '}
                                <Box component="span" sx={{ fontWeight: 700, color: '#334155' }}>
                                  {metric.actual}
                                </Box>
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: '11px',
                                  fontFamily: workstationVisuals.fontFamily,
                                  color: '#94A3B8',
                                }}
                              >
                                {metric.comparisonType === 'target' ? 'Target' : 'vs Last Shift'}: {metric.targetOrLastShift}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        ) : (
          /* Production Analsys Board View */
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Header row */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '18px', fontWeight: 800, color: '#1E293B', fontFamily: workstationVisuals.fontFamily }}>
                Production Analsys Board
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <AutoAwesomeIcon sx={{ fontSize: 18, color: '#3B82F6', cursor: 'pointer' }} />
                <StarBorderIcon sx={{ fontSize: 18, color: '#3B82F6', cursor: 'pointer' }} />
                <LaunchIcon
                  onClick={() => setIsOeeModuleOpen(true)}
                  onMouseDown={(e) => e.stopPropagation()}
                  sx={{ fontSize: 18, color: '#3B82F6', cursor: 'pointer' }}
                />
              </Box>
            </Box>

            {/* Filters and KPI summary row */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Shift Selector */}
                <Box sx={{ position: 'relative', width: 100, height: 38, border: '1px solid #C9CDD2', borderRadius: '8px', px: 1.5, display: 'flex', alignItems: 'center', bgcolor: '#FFFFFF' }}>
                  <Typography sx={{ position: 'absolute', top: -7, left: 10, px: 0.4, bgcolor: '#FFFFFF', fontSize: '9px', color: '#666C72', fontWeight: 500 }}>
                    Shift
                  </Typography>
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
                    A
                  </Typography>
                  <KeyboardArrowDownIcon sx={{ ml: 'auto', fontSize: 16, color: '#64748B' }} />
                </Box>

                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#475569', fontFamily: workstationVisuals.fontFamily }}>
                  Filters
                </Typography>

                {/* S, Q, D, C filter badges */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {['S', 'Q', 'D', 'C'].map((filter) => (
                    <Box
                      key={filter}
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: '#2563EB',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 800,
                        fontFamily: workstationVisuals.fontFamily,
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      }}
                    >
                      {filter}
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* KPI cards */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                {/* KPI Card 1: Actual Quantity */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    pl: 1.5,
                    pr: 1.5,
                    py: 0.75,
                    position: 'relative',
                    width: 170,
                    height: 52,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: '#EF4444', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#EF4444', fontFamily: workstationVisuals.fontFamily, lineHeight: 1.2 }}>
                      9,1 <Box component="span" sx={{ fontSize: '10px', fontWeight: 600 }}>K</Box>
                    </Typography>
                    <Typography sx={{ fontSize: '9px', color: '#EF4444', fontWeight: 600, fontFamily: workstationVisuals.fontFamily }}>
                      Actual Quantity
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Typography sx={{ fontSize: '8px', color: '#64748B', fontWeight: 700, fontFamily: workstationVisuals.fontFamily, letterSpacing: '0.2px' }}>
                      PLANNED
                    </Typography>
                    <Box sx={{ bgcolor: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '4px', px: 0.5, py: 0.1 }}>
                      <Typography sx={{ fontSize: '9px', fontWeight: 800, color: '#334155', fontFamily: workstationVisuals.fontFamily }}>
                        16,4K
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* KPI Card 2: Actual Cost */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    pl: 1.5,
                    pr: 1.5,
                    py: 0.75,
                    position: 'relative',
                    width: 170,
                    height: 52,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: '#10B981', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#1E293B', fontFamily: workstationVisuals.fontFamily, lineHeight: 1.2 }}>
                      900 <Box component="span" sx={{ fontSize: '11px', fontWeight: 550, color: '#64748B' }}>$</Box>
                    </Typography>
                    <Typography sx={{ fontSize: '9px', color: '#64748B', fontWeight: 600, fontFamily: workstationVisuals.fontFamily }}>
                      Actual Cost
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Typography sx={{ fontSize: '8px', color: '#64748B', fontWeight: 700, fontFamily: workstationVisuals.fontFamily, letterSpacing: '0.2px' }}>
                      PLANNED
                    </Typography>
                    <Box sx={{ bgcolor: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '4px', px: 0.5, py: 0.1 }}>
                      <Typography sx={{ fontSize: '9px', fontWeight: 800, color: '#334155', fontFamily: workstationVisuals.fontFamily }}>
                        10K
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Kanban Columns */}
            <Box sx={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, overflow: 'auto' }}>
              {BOARD_COLUMNS.map((column) => (
                <Box
                  key={column.title}
                  sx={{
                    bgcolor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    p: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    height: '100%',
                    minWidth: 220,
                  }}
                >
                  <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#1E293B', fontFamily: workstationVisuals.fontFamily, mb: 0.5 }}>
                    {column.title}
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, overflowY: 'auto' }}>
                    {column.cards.map((card, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          bgcolor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderLeft: `4px solid ${card.borderColor}`,
                          borderRadius: '8px',
                          p: 1.5,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                        }}
                      >
                        {/* Metadata Row */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                            <RoomIcon sx={{ fontSize: 12, color: '#94A3B8' }} />
                            <Typography sx={{ fontSize: '10px', color: '#64748B', fontWeight: 700, fontFamily: workstationVisuals.fontFamily }}>
                              {card.zone}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                            <BuildIcon sx={{ fontSize: 11, color: '#94A3B8' }} />
                            <Typography sx={{ fontSize: '10px', color: '#64748B', fontWeight: 700, fontFamily: workstationVisuals.fontFamily }}>
                              {card.station}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                            <AccessTimeIcon sx={{ fontSize: 11, color: '#94A3B8' }} />
                            <Typography sx={{ fontSize: '10px', color: '#64748B', fontWeight: 700, fontFamily: workstationVisuals.fontFamily }}>
                              {card.downtime}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Title */}
                        <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: card.titleColor, fontFamily: workstationVisuals.fontFamily, lineHeight: 1.3 }}>
                          {card.title}
                        </Typography>

                        {/* Description */}
                        <Typography sx={{ fontSize: '10.5px', color: '#475569', fontFamily: workstationVisuals.fontFamily, lineHeight: 1.4 }}>
                          {card.description}
                        </Typography>

                        {/* Footer */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Box
                              sx={{
                                px: 0.75,
                                py: 0.2,
                                bgcolor: '#F1F5F9',
                                borderRadius: '4px',
                              }}
                            >
                              <Typography sx={{ fontSize: '8px', fontWeight: 800, color: '#475569', fontFamily: workstationVisuals.fontFamily }}>
                                {card.status}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                              <CalendarTodayIcon sx={{ fontSize: 10, color: '#94A3B8' }} />
                              <Typography sx={{ fontSize: '9.5px', color: '#64748B', fontWeight: 600, fontFamily: workstationVisuals.fontFamily }}>
                                {card.time}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Categories bubble badges */}
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {card.categories.map((cat) => (
                              <Box
                                key={cat}
                                sx={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: '50%',
                                  bgcolor: '#2563EB',
                                  color: '#FFFFFF',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '9px',
                                  fontWeight: 800,
                                  fontFamily: workstationVisuals.fontFamily,
                                }}
                              >
                                {cat}
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* View All chevron link */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.5,
                      cursor: 'pointer',
                      py: 0.5,
                      mt: 'auto',
                      '&:hover': { opacity: 0.8 },
                    }}
                  >
                    <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', fontFamily: workstationVisuals.fontFamily }}>
                      VIEW ALL
                    </Typography>
                    <KeyboardArrowDownIcon sx={{ fontSize: 14, color: '#2563EB' }} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* Live State Modifier Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        container={containerRef.current}
      >
        <MenuItem onClick={() => activeMenuZoneId !== null && handleStatusChange(activeMenuZoneId, 'RUNNING')}>
          Set Nominal (RUNNING)
        </MenuItem>
        <MenuItem onClick={() => activeMenuZoneId !== null && handleStatusChange(activeMenuZoneId, 'STARVING')}>
          Set Warning (STARVING)
        </MenuItem>
        <MenuItem onClick={() => activeMenuZoneId !== null && handleStatusChange(activeMenuZoneId, 'BLOCKED')}>
          Set Error (BLOCKED)
        </MenuItem>
      </Menu>
    </WidgetShell>

    {isOeeModuleOpen && (
      <Portal>
        <OeeModuleDrilldown
          activeView={oeeModuleView}
          onClose={() => setIsOeeModuleOpen(false)}
          onViewChange={setOeeModuleView}
        />
      </Portal>
    )}
  </>
);
}
