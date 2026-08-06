import { useState } from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import {
  ArrowOutward as ArrowOutwardIcon,
} from '@mui/icons-material';
import {
  tokenBrand,
  tokenError,
  tokenCommon,
  workstationVisuals,
  workstationWidgetTitleSx,
} from '../theme';
import WidgetShell from './WidgetShell';
import type { WorkstationWidgetProps } from '../types';

interface LossRow {
  zone: string;
  cell: string;
  reason: string;
  parts: number;
  isBottleneck: boolean;
}

const ALL_LOSSES: LossRow[] = [
  { zone: 'Zone 5', cell: 'Z5C20', reason: 'Machine Failures', parts: 4691, isBottleneck: true },
  { zone: 'Zone 5', cell: 'Z5C10', reason: 'Speed Losses', parts: 1860, isBottleneck: false },
  { zone: 'Zone 5', cell: 'Z5C12', reason: 'Quality Losses', parts: 1737, isBottleneck: true },
  { zone: 'Zone 1', cell: 'Z1C01', reason: 'Machine Failures', parts: 900, isBottleneck: true },
  { zone: 'Zone 1', cell: 'Z1C23', reason: 'Speed Losses', parts: 762, isBottleneck: false },
];

export default function OEETopLossesWidget({
  className,
  style,
  onExpand,
}: WorkstationWidgetProps) {
  const [onlyBottleneck, setOnlyBottleneck] = useState(false);
  const [groupByZone, setGroupByZone] = useState(true);

  const displayedRows = ALL_LOSSES.filter(
    (row) => !onlyBottleneck || row.isBottleneck
  );

  // Group by Zone logic
  const groups: Record<string, LossRow[]> = {};
  displayedRows.forEach((row) => {
    if (!groups[row.zone]) {
      groups[row.zone] = [];
    }
    groups[row.zone].push(row);
  });

  const headerAction = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <Button
        variant="outlined"
        onClick={() => setOnlyBottleneck(!onlyBottleneck)}
        sx={{
          height: 26,
          borderRadius: '8px',
          px: 1.5,
          border: '1px solid',
          borderColor: onlyBottleneck ? tokenBrand.main : 'rgba(15, 23, 42, 0.12)',
          color: onlyBottleneck ? tokenBrand.main : 'rgba(15, 23, 42, 0.7)',
          bgcolor: onlyBottleneck ? 'rgba(31, 99, 234, 0.04)' : tokenCommon.white,
          textTransform: 'none',
          fontSize: '0.72rem',
          fontWeight: 500,
          fontFamily: workstationVisuals.fontFamily,
          transition: 'all 0.15s ease',
          '&:hover': {
            bgcolor: onlyBottleneck ? 'rgba(31, 99, 234, 0.08)' : 'rgba(15, 23, 42, 0.04)',
            borderColor: onlyBottleneck ? tokenBrand.main : 'rgba(15, 23, 42, 0.2)',
          },
        }}
      >
        Only Bottleneck Stops
      </Button>
      <Button
        variant={groupByZone ? 'contained' : 'outlined'}
        onClick={() => setGroupByZone(!groupByZone)}
        sx={{
          height: 26,
          borderRadius: '8px',
          px: 1.5,
          border: groupByZone ? 'none' : '1px solid rgba(15, 23, 42, 0.12)',
          color: groupByZone ? tokenCommon.white : 'rgba(15, 23, 42, 0.7)',
          bgcolor: groupByZone ? tokenBrand.main : tokenCommon.white,
          textTransform: 'none',
          fontSize: '0.72rem',
          fontWeight: 600,
          fontFamily: workstationVisuals.fontFamily,
          transition: 'all 0.15s ease',
          boxShadow: 'none',
          '&:hover': {
            bgcolor: groupByZone ? tokenBrand.dark : 'rgba(15, 23, 42, 0.04)',
            boxShadow: 'none',
          },
        }}
      >
        Group by Zone
      </Button>
      <IconButton
        size="small"
        onClick={onExpand}
        sx={{ width: 24, height: 24, p: 0, color: tokenBrand.main, ml: 0.5 }}
      >
        <ArrowOutwardIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );

  const renderTableRows = () => {
    if (groupByZone) {
      return Object.keys(groups).map((zoneName) => {
        const rowsInGroup = groups[zoneName];
        if (rowsInGroup.length === 0) return null;

        return rowsInGroup.map((row, index) => {
          const isZone5 = row.zone === 'Zone 5';
          const isHighest = isZone5 && row.cell === 'Z5C20';

          // Background styles based on zone and highlights
          let cellBg = tokenCommon.white;
          let textColor = workstationVisuals.textPrimary;

          if (isZone5) {
            cellBg = isHighest ? tokenError.main : 'rgba(244, 67, 54, 0.12)';
            textColor = isHighest ? tokenCommon.white : workstationVisuals.textPrimary;
          }

          return (
            <tr key={`${row.zone}-${row.cell}`}>
              {index === 0 && (
                <td
                  rowSpan={rowsInGroup.length}
                  style={{
                    padding: '12px 16px',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    color: workstationVisuals.textPrimary,
                    fontFamily: workstationVisuals.fontFamily,
                    borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
                    borderRight: '1px solid rgba(15, 23, 42, 0.08)',
                    backgroundColor: isZone5
                      ? 'rgba(244, 67, 54, 0.12)'
                      : tokenCommon.white,
                    verticalAlign: 'middle',
                    textAlign: 'left',
                  }}
                >
                  {row.zone}
                </td>
              )}
              <td
                style={{
                  padding: '12px 16px',
                  fontSize: '0.82rem',
                  fontWeight: isHighest ? 600 : 500,
                  color: textColor,
                  fontFamily: workstationVisuals.fontFamily,
                  borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
                  backgroundColor: cellBg,
                }}
              >
                {row.cell}
              </td>
              <td
                style={{
                  padding: '12px 16px',
                  fontSize: '0.82rem',
                  fontWeight: isHighest ? 600 : 500,
                  color: textColor,
                  fontFamily: workstationVisuals.fontFamily,
                  borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
                  backgroundColor: cellBg,
                }}
              >
                {row.reason}
              </td>
              <td
                style={{
                  padding: '12px 16px',
                  fontSize: '0.82rem',
                  fontWeight: isHighest ? 600 : 500,
                  color: textColor,
                  fontFamily: workstationVisuals.fontFamily,
                  borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
                  textAlign: 'right',
                  backgroundColor: cellBg,
                }}
              >
                {row.parts.toLocaleString()}
              </td>
            </tr>
          );
        });
      });
    }

    // Flat layout when groupByZone is false
    return displayedRows.map((row) => {
      const isZone5 = row.zone === 'Zone 5';
      const isHighest = isZone5 && row.cell === 'Z5C20';

      let cellBg = tokenCommon.white;
      let textColor = workstationVisuals.textPrimary;

      if (isZone5) {
        cellBg = isHighest ? tokenError.main : 'rgba(244, 67, 54, 0.12)';
        textColor = isHighest ? tokenCommon.white : workstationVisuals.textPrimary;
      }

      return (
        <tr key={`${row.zone}-${row.cell}`}>
          <td
            style={{
              padding: '12px 16px',
              fontSize: '0.82rem',
              fontWeight: 500,
              color: workstationVisuals.textPrimary,
              fontFamily: workstationVisuals.fontFamily,
              borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
              borderRight: '1px solid rgba(15, 23, 42, 0.08)',
              backgroundColor: isZone5
                ? 'rgba(244, 67, 54, 0.12)'
                : tokenCommon.white,
            }}
          >
            {row.zone}
          </td>
          <td
            style={{
              padding: '12px 16px',
              fontSize: '0.82rem',
              fontWeight: isHighest ? 600 : 500,
              color: textColor,
              fontFamily: workstationVisuals.fontFamily,
              borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
              backgroundColor: cellBg,
            }}
          >
            {row.cell}
          </td>
          <td
            style={{
              padding: '12px 16px',
              fontSize: '0.82rem',
              fontWeight: isHighest ? 600 : 500,
              color: textColor,
              fontFamily: workstationVisuals.fontFamily,
              borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
              backgroundColor: cellBg,
            }}
          >
            {row.reason}
          </td>
          <td
            style={{
              padding: '12px 16px',
              fontSize: '0.82rem',
              fontWeight: isHighest ? 600 : 500,
              color: textColor,
              fontFamily: workstationVisuals.fontFamily,
              borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
              textAlign: 'right',
              backgroundColor: cellBg,
            }}
          >
            {row.parts.toLocaleString()}
          </td>
        </tr>
      );
    });
  };

  return (
    <WidgetShell
      title="Top Losses"
      action={headerAction}
      className={className}
      style={style}
    >
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', pt: 1 }}>
        <Box
          sx={{
            border: '1px solid rgba(15, 23, 42, 0.12)',
            borderRadius: '8px',
            overflow: 'hidden',
            bgcolor: tokenCommon.white,
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#FFFFFF' }}>
                <th
                  style={{
                    padding: '12px 16px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: workstationVisuals.textPrimary,
                    fontFamily: workstationVisuals.fontFamily,
                    borderBottom: '1px solid rgba(15, 23, 42, 0.12)',
                    borderRight: '1px solid rgba(15, 23, 42, 0.08)',
                  }}
                >
                  Zone
                </th>
                <th
                  style={{
                    padding: '12px 16px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: workstationVisuals.textPrimary,
                    fontFamily: workstationVisuals.fontFamily,
                    borderBottom: '1px solid rgba(15, 23, 42, 0.12)',
                  }}
                >
                  Cell
                </th>
                <th
                  style={{
                    padding: '12px 16px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: workstationVisuals.textPrimary,
                    fontFamily: workstationVisuals.fontFamily,
                    borderBottom: '1px solid rgba(15, 23, 42, 0.12)',
                  }}
                >
                  Reason
                </th>
                <th
                  style={{
                    padding: '12px 16px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: workstationVisuals.textPrimary,
                    fontFamily: workstationVisuals.fontFamily,
                    borderBottom: '1px solid rgba(15, 23, 42, 0.12)',
                    textAlign: 'right',
                  }}
                >
                  Parts
                </th>
              </tr>
            </thead>
            <tbody>{renderTableRows()}</tbody>
          </table>
        </Box>
      </Box>
    </WidgetShell>
  );
}
