import { useState } from 'react';
import { Box, Typography, IconButton, Portal } from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  TrendingDown as TrendingDownIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import OeeModuleDrilldown, { type OeeModuleView } from './OEEProductionHour';
import {
  tokenCommon,
  workstationVisuals,
  workstationWidgetTitleSx,
} from '../theme';
import WidgetShell from './WidgetShell';
import type { WorkstationWidgetProps } from '../types';

interface RightStackCardProps {
  value: string;
  unit: string;
  label: string;
  borderColor: string;
  valueColor?: string;
  labelColor?: string;
  targetLabel: string;
  targetValue: React.ReactNode;
}

const getArcPoint = (percent: number, r: number, cx: number, cy: number) => {
  const angle = 180 - (percent * 1.8);
  const rad = (angle * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy - r * Math.sin(rad)
  };
};

const describeArc = (pStart: number, pEnd: number, r: number, cx: number, cy: number) => {
  const start = getArcPoint(pStart, r, cx, cy);
  const end = getArcPoint(pEnd, r, cx, cy);
  return `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;
};

function RightStackCard({
  value,
  unit,
  label,
  borderColor,
  valueColor = '#0F172A',
  labelColor = workstationVisuals.textSecondary,
  targetLabel,
  targetValue,
}: RightStackCardProps) {
  return (
    <Box sx={{
      border: '1px solid rgba(15, 23, 42, 0.06)',
      borderLeft: `4px solid ${borderColor}`,
      borderRadius: '8px',
      p: 1,
      bgcolor: tokenCommon.white,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: 48,
    }}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.4 }}>
          <Typography sx={{ fontSize: '1.4rem', fontWeight: 600, color: valueColor, lineHeight: 1, fontFamily: workstationVisuals.fontFamily }}>
            {value}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: valueColor === '#0F172A' ? workstationVisuals.textSecondary : 'rgba(244, 67, 54, 0.7)', fontFamily: workstationVisuals.fontFamily }}>
            {unit}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.72rem', color: labelColor, mt: 0.35, fontWeight: 500, fontFamily: workstationVisuals.fontFamily }}>
          {label}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: workstationVisuals.textSecondary, letterSpacing: '0.05em', mb: 0.25, fontFamily: workstationVisuals.fontFamily }}>
          {targetLabel}
        </Typography>
        {targetValue}
      </Box>
    </Box>
  );
}

export default function OEELineOverviewWidget({
  className,
  style,
}: WorkstationWidgetProps) {
  const [isOeeModuleOpen, setIsOeeModuleOpen] = useState(false);
  const [oeeModuleView, setOeeModuleView] = useState<OeeModuleView>('timeline');
  const titleElement = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography sx={workstationWidgetTitleSx}>Line Overview</Typography>
      <Box sx={{
        px: 1.25,
        py: 0.25,
        borderRadius: '12px',
        bgcolor: 'rgba(15, 23, 42, 0.06)',
        color: '#0F172A',
        fontSize: '0.72rem',
        fontWeight: 500,
        fontFamily: workstationVisuals.fontFamily,
      }}>
        Current Shift
      </Box>
      <Typography sx={{
        fontSize: '0.72rem',
        color: workstationVisuals.textSecondary,
        fontWeight: 500,
        fontFamily: workstationVisuals.fontFamily,
      }}>
        AFA10
      </Typography>
    </Box>
  );

  const actionElement = (
    <IconButton
      onClick={() => {
        console.log('OEE Line Overview action icon clicked');
        setIsOeeModuleOpen(true);
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      size="small"
      sx={{ p: 0.5, color: '#1F63EA' }}
    >
      <OpenInNewIcon sx={{ fontSize: 18 }} />
    </IconButton>
  );

  return (
    <>
    <WidgetShell
      title={titleElement}
      action={actionElement}
      className={className}
      style={style}
    >
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        height: '100%',
        minHeight: 0,
        pt: 0.5,
      }}>
        {/* Top Row: OEE Card & 3 KPI Cards */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' },
          gap: 1.5,
          flex: 1,
          minHeight: 0,
        }}>
          {/* Left: OEE Arc Gauge Card */}
          <Box sx={{
            border: '1px solid rgba(15, 23, 42, 0.06)',
            borderRadius: '12px',
            p: 2,
            bgcolor: tokenCommon.white,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: 120,
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: workstationVisuals.textPrimary, fontFamily: workstationVisuals.fontFamily }}>
                OEE
              </Typography>
              <AutoAwesomeIcon sx={{ fontSize: 16, color: '#94D5FF' }} />
            </Box>
            {/* Centered Graphic Container */}
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: 0 }}>
              {/* Svg Container */}
              <Box sx={{ position: 'relative', width: '100%', maxWidth: 260 }}>
                <svg viewBox="0 0 200 120" width="100%" height="100%">
                  <path d={describeArc(0, 80, 75, 100, 105)} fill="none" stroke="rgba(244, 67, 54, 0.2)" strokeWidth={6} strokeLinecap="round" />
                  <path d={describeArc(80, 100, 75, 100, 105)} fill="none" stroke="rgba(102, 187, 106, 0.2)" strokeWidth={6} strokeLinecap="round" />
                  <path d={describeArc(0, 41.7, 75, 100, 105)} fill="none" stroke="#F44336" strokeWidth={10} strokeLinecap="round" />
                </svg>
                {/* Text Overlay */}
                <Box sx={{ position: 'absolute', left: 0, right: 0, top: '48%', textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '2.2rem', fontWeight: 600, color: '#0F172A', lineHeight: 1, fontFamily: workstationVisuals.fontFamily }}>
                      41,7
                    </Typography>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 400, color: workstationVisuals.textSecondary, ml: 0.25, fontFamily: workstationVisuals.fontFamily }}>
                      %
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#F44336', mt: 0.5, fontFamily: workstationVisuals.fontFamily }}>
                    Target: 80%
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Right Stack of 3 Cards */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 1.2,
            height: '100%',
            minHeight: 0,
          }}>
            {/* Line Scrap Card */}
            <RightStackCard
              value="95.4"
              unit="%"
              label="Line Scrap"
              borderColor="#F44336"
              valueColor="#F44336"
              targetLabel="TARGET"
              targetValue={
                <Box sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: '6px',
                  bgcolor: '#E9EDEF',
                  color: '#0F172A',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  fontFamily: workstationVisuals.fontFamily,
                }}>
                  98%
                </Box>
              }
            />

            {/* Avg Line Speed Card */}
            <RightStackCard
              value="75"
              unit="PPM"
              label="Avg Line Speed"
              borderColor="#66BB6A"
              targetLabel="TARGET"
              targetValue={
                <Box sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: '6px',
                  bgcolor: '#E9EDEF',
                  color: '#0F172A',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  fontFamily: workstationVisuals.fontFamily,
                }}>
                  60 PPM
                </Box>
              }
            />

            {/* Total Line DT Card */}
            <RightStackCard
              value="1.54"
              unit="h"
              label="Total Line DT"
              borderColor="#66BB6A"
              targetLabel="VS LAST SHIFT"
              targetValue={
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.25,
                  px: 0.8,
                  py: 0.25,
                  borderRadius: '12px',
                  bgcolor: 'rgba(102, 187, 106, 0.1)',
                  color: '#4CAF50',
                }}>
                  <TrendingDownIcon sx={{ fontSize: 12, color: '#4CAF50' }} />
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#4CAF50', fontFamily: workstationVisuals.fontFamily }}>
                    -1.8%
                  </Typography>
                </Box>
              }
            />
          </Box>
        </Box>

        {/* Bottom Row: Shift Production & Current WO Status */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' },
          gap: 1.5,
        }}>
          {/* Shift Production Card */}
          <Box sx={{
            border: '1px solid rgba(15, 23, 42, 0.06)',
            borderLeft: '4px solid #F44336',
            borderRadius: '8px',
            p: 1.5,
            bgcolor: tokenCommon.white,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: 48,
          }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <Typography sx={{ fontSize: '1.4rem', fontWeight: 600, color: '#F44336', lineHeight: 1, fontFamily: workstationVisuals.fontFamily }}>
                  13,312
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: 'rgba(244, 67, 54, 0.7)', fontFamily: workstationVisuals.fontFamily }}>
                  Pieces
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.72rem', color: workstationVisuals.textSecondary, mt: 0.35, fontWeight: 500, fontFamily: workstationVisuals.fontFamily }}>
                Shift Production
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: workstationVisuals.textSecondary, letterSpacing: '0.05em', mb: 0.25, fontFamily: workstationVisuals.fontFamily }}>
                PROJECTED
              </Typography>
              <Box sx={{
                px: 1,
                py: 0.25,
                borderRadius: '6px',
                bgcolor: '#E9EDEF',
                color: '#0F172A',
                fontSize: '0.72rem',
                fontWeight: 600,
                fontFamily: workstationVisuals.fontFamily,
              }}>
                27,000
              </Box>
            </Box>
          </Box>

          {/* Current WO Status Card */}
          <Box sx={{
            border: '1px solid rgba(15, 23, 42, 0.06)',
            borderRadius: '8px',
            p: 1.5,
            bgcolor: tokenCommon.white,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            justifyContent: 'center',
            minHeight: 48,
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.8rem', color: workstationVisuals.textSecondary, fontFamily: workstationVisuals.fontFamily }}>
                  Current WO Status:
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', fontFamily: workstationVisuals.fontFamily }}>
                  15.9k
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.8rem', color: workstationVisuals.textSecondary, fontFamily: workstationVisuals.fontFamily }}>
                Target: 15k
              </Typography>
            </Box>
            <Box sx={{ position: 'relative', height: 8, bgcolor: '#E9EDEF', borderRadius: 999, mt: 0.5, mb: 0.5, flexShrink: 0 }}>
              {/* Green fill up to 79.5% */}
              <Box sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '79.5%',
                bgcolor: '#66BB6A',
                borderRadius: 999,
              }} />
              {/* Target indicator at 75% */}
              <Box sx={{
                position: 'absolute',
                left: '75%',
                top: -4,
                bottom: -4,
                width: 3,
                bgcolor: '#1F63EA',
                borderRadius: 1,
              }} />
            </Box>
          </Box>
        </Box>
      </Box>
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
