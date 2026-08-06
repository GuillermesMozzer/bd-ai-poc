import { Box, Paper, Typography } from '@mui/material';
import { useState } from 'react';
import { tokenBrand, tokenDivider, tokenText } from '../../../workstation/theme';
import type { PlannerAiCoverageSummary } from '../../ai/types';
import { AIGapAnalysisPanel } from './AIGapAnalysisPanel';

type AICoverageHeatmapProps = {
  summary: PlannerAiCoverageSummary;
  showGapPanel?: boolean;
};

function getCellStyles(status: PlannerAiCoverageSummary['cells'][number]['status']) {
  if (status === 'critical') {
    return { bg: '#FEF2F2', border: '#FECACA', color: '#B91C1C' };
  }

  if (status === 'thin') {
    return { bg: '#FFF7ED', border: '#FED7AA', color: '#C2410C' };
  }

  return { bg: '#ECFDF3', border: '#BBF7D0', color: '#166534' };
}

export function AICoverageHeatmap({ summary, showGapPanel = true }: AICoverageHeatmapProps) {
  const [highlightedCellId, setHighlightedCellId] = useState<string | null>(null);
  const rowKeys = [...new Set(summary.cells.map((cell) => `${cell.category}__${cell.shift}`))];

  return (
    <Box sx={{ display: 'grid', gap: 1.2 }}>
      <Paper elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${tokenDivider}`, p: 1.8 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
          <Box>
            <Typography sx={{ color: tokenText.primary, fontSize: '0.84rem', fontWeight: 800 }}>
              Skills coverage heatmap
            </Typography>
            <Typography sx={{ mt: 0.3, color: tokenText.secondary, fontSize: '0.72rem', lineHeight: 1.45 }}>
              Coverage score {summary.coverageScore}. Day and night shift rows highlight thin staffing windows.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 1.1, overflowX: 'auto' }}>
          <Box
            sx={{
              minWidth: 720,
              display: 'grid',
              gridTemplateColumns: `180px repeat(${summary.zones.length}, minmax(92px, 1fr))`,
              gap: 0.55,
            }}
          >
            <Box />
            {summary.zones.map((zone) => (
              <Typography
                key={zone}
                sx={{ color: tokenText.primary, fontSize: '0.7rem', fontWeight: 800, textAlign: 'center' }}
              >
                {zone}
              </Typography>
            ))}

            {rowKeys.flatMap((rowKey) => {
              const [category, shift] = rowKey.split('__');
              const row = [
                <Typography
                  key={`${rowKey}-label`}
                  sx={{ color: tokenText.primary, fontSize: '0.69rem', fontWeight: 800, alignSelf: 'center' }}
                >
                  {category}
                  <Box component="span" sx={{ display: 'block', color: tokenText.secondary, fontWeight: 600, fontSize: '0.62rem' }}>
                    {shift === 'night' ? 'Night shift' : 'Day shift'}
                  </Box>
                </Typography>,
              ];

              summary.zones.forEach((zone) => {
                const cell = summary.cells.find(
                  (item) => item.zone === zone && item.category === category && item.shift === shift,
                );
                if (!cell) {
                  return;
                }
                const styles = getCellStyles(cell.status);
                const isSelected = highlightedCellId === cell.id;
                row.push(
                  <Box
                    key={cell.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${zone} ${category} ${shift} shift coverage ${cell.technicianCount}`}
                    onClick={() => setHighlightedCellId(cell.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setHighlightedCellId(cell.id);
                      }
                    }}
                    sx={{
                      p: 0.75,
                      borderRadius: '10px',
                      border: `1px solid ${isSelected ? tokenBrand.main : styles.border}`,
                      bgcolor: styles.bg,
                      textAlign: 'center',
                      cursor: 'pointer',
                      outline: isSelected ? `2px solid ${tokenBrand.main}` : 'none',
                    }}
                  >
                    <Typography sx={{ color: styles.color, fontSize: '0.76rem', fontWeight: 900 }}>
                      {cell.technicianCount}
                    </Typography>
                    <Typography sx={{ color: tokenText.secondary, fontSize: '0.62rem', lineHeight: 1.35 }}>
                      {cell.technicianNames.length ? cell.technicianNames.join(', ') : 'No visible cover'}
                    </Typography>
                  </Box>,
                );
              });

              return row;
            })}
          </Box>
        </Box>
      </Paper>

      {showGapPanel ? <AIGapAnalysisPanel summary={summary} highlightedCellId={highlightedCellId} /> : null}
    </Box>
  );
}
