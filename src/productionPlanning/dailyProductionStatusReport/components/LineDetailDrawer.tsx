import React from 'react';
import {CloseRounded as CloseRoundedIcon} from '@mui/icons-material';
import {Box, Chip, Divider, Drawer, IconButton, Stack, Typography} from '@mui/material';
import type {DowntimeEvent, ProductionLineStatus} from '../types';
import ProductionLineStatusBadge from './ProductionLineStatusBadge';
import {formatCompactTimestamp, formatPercent, formatUnits} from '../utils';

type Props = {
  line: ProductionLineStatus | null;
  downtimeEvents: DowntimeEvent[];
  onClose: () => void;
};

export default function LineDetailDrawer({line, downtimeEvents, onClose}: Props) {
  return (
    <Drawer
      anchor="right"
      open={Boolean(line)}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: {xs: '100%', sm: 420},
          p: 2.2,
          bgcolor: 'var(--planning-surface)',
        },
      }}
    >
      {line ? (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.6}}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1}}>
            <Box>
              <Typography sx={{fontSize: 24, fontWeight: 900, color: 'var(--planning-text-primary)'}}>{line.lineName}</Typography>
              <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', mt: 0.4}}>{line.lineDescription}</Typography>
            </Box>
            <IconButton onClick={onClose}>
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          <ProductionLineStatusBadge status={line.status} />
          <Divider />

          <Stack spacing={1}>
            <Typography sx={{fontSize: 13, fontWeight: 800, color: '#1F2937'}}>Product / Campaign</Typography>
            <Typography sx={{fontSize: 13.5, color: 'var(--planning-text-secondary)'}}>{line.productCode} - {line.productDescription}</Typography>
            <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)'}}>{line.campaign}</Typography>
          </Stack>

          <Divider />

          <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.2}}>
            {[
              ['Plan', formatUnits(line.planUnits)],
              ['Actual', formatUnits(line.actualUnits)],
              ['Achievement', formatPercent(line.achievementPercent)],
              ['OEE', formatPercent(line.oeePercent)],
              ['Quality Yield', formatPercent(line.qualityYieldPercent)],
              ['Orders On-Time', formatPercent(line.ordersOnTimePercent)],
              ['Downtime', `${line.downtimeMinutes} min`],
              ['Supervisor', line.supervisor],
            ].map(([label, value]) => (
              <Box key={label} sx={{border: '1px solid #E4E7EC', borderRadius: 2.5, p: 1.2}}>
                <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', fontWeight: 800}}>{label}</Typography>
                <Typography sx={{fontSize: 14, color: '#1F2937', fontWeight: 900, mt: 0.45}}>{value}</Typography>
              </Box>
            ))}
          </Box>

          <Divider />

          <Box>
            <Typography sx={{fontSize: 13, fontWeight: 800, color: '#1F2937'}}>Reason for Gap / Notes</Typography>
            <Typography sx={{fontSize: 13.5, color: 'var(--planning-text-secondary)', mt: 0.6, lineHeight: 1.6}}>
              {line.reasonForGap}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{fontSize: 13, fontWeight: 800, color: '#1F2937'}}>Downtime Events</Typography>
            <Stack spacing={1} sx={{mt: 1}}>
              {downtimeEvents.length > 0 ? downtimeEvents.map((event) => (
                <Box key={event.id} sx={{border: '1px solid #E4E7EC', borderRadius: 2.5, p: 1.2}}>
                  <Typography sx={{fontSize: 13, fontWeight: 900, color: '#1F2937'}}>{event.reason}</Typography>
                  <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', mt: 0.45}}>
                    {formatCompactTimestamp(event.startTime)} to {formatCompactTimestamp(event.endTime)}
                  </Typography>
                  <Box sx={{display: 'flex', gap: 0.8, mt: 0.8, flexWrap: 'wrap'}}>
                    <Chip size="small" label={`${event.durationMinutes} min`} />
                    <Chip size="small" label={event.category} />
                    <Chip size="small" label={event.severity} />
                  </Box>
                </Box>
              )) : <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)'}}>No downtime events for this line.</Typography>}
            </Stack>
          </Box>

          <Typography sx={{fontSize: 12, color: '#98A2B3'}}>
            Last update: {formatCompactTimestamp(line.lastUpdatedAt)}
          </Typography>
        </Box>
      ) : null}
    </Drawer>
  );
}
