import React from 'react';
import {
  ArrowBackRounded as ArrowBackRoundedIcon,
  AutorenewRounded as AutorenewRoundedIcon,
  RestartAltRounded as RestartAltRoundedIcon,
  SaveRounded as SaveRoundedIcon,
  SendRounded as SendRoundedIcon,
} from '@mui/icons-material';
import {Box, Button, IconButton, MenuItem, Paper, Stack, TextField, Typography} from '@mui/material';
import type {DailyProductionReport} from '../types';

const moduleCardSx = {
  borderRadius: 4,
  border: '1px solid var(--planning-border)',
  bgcolor: 'var(--planning-surface)',
  boxShadow: 'var(--planning-soft-shadow)',
} as const;

type HeaderProps = {
  report: DailyProductionReport;
  lastRefreshAt: string;
  onRefresh: () => void;
  onSave: () => void;
  onSubmit: () => void;
  onReset: () => void;
};

export default function DailyProductionReportHeader({
  report,
  lastRefreshAt,
  onRefresh,
  onSave,
  onSubmit,
  onReset,
}: HeaderProps) {
  return (
    <Paper elevation={0} sx={{...moduleCardSx, p: 2}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start'}}>
        <Box sx={{display: 'flex', gap: 1.2, alignItems: 'flex-start'}}>
          <IconButton aria-label="Back" sx={{border: '1px solid var(--planning-border)', borderRadius: 2, mt: 0.35}}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Box>
            <Typography sx={{fontSize: 30, fontWeight: 900, color: 'var(--planning-text-primary)'}}>Daily Production Status Report</Typography>
            <Typography sx={{fontSize: 13.5, color: 'var(--planning-text-secondary)', mt: 0.6, maxWidth: 980}}>
              Track daily plan vs actual production, line performance, downtime, quality, and key production notes.
            </Typography>
            <Typography sx={{fontSize: 12, color: '#98A2B3', mt: 0.9}}>
              Last refreshed: {new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }).format(new Date(lastRefreshAt))}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} sx={{flexWrap: 'wrap', rowGap: 1}}>
          <Button variant="outlined" startIcon={<AutorenewRoundedIcon />} onClick={onRefresh} sx={{textTransform: 'none', fontWeight: 800}}>
            Refresh
          </Button>
          <Button variant="outlined" startIcon={<RestartAltRoundedIcon />} onClick={onReset} sx={{textTransform: 'none', fontWeight: 800}}>
            Reset Demo Data
          </Button>
          <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={onSave} sx={{textTransform: 'none', fontWeight: 800}}>
            Save Report
          </Button>
          <Button variant="contained" color="secondary" startIcon={<SendRoundedIcon />} onClick={onSubmit} sx={{textTransform: 'none', fontWeight: 800}}>
            Submit Report
          </Button>
        </Stack>
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(4, minmax(0, 1fr))'}, gap: 1.1, mt: 2}}>
        <TextField
          label="Report Date"
          value={report.reportDate}
          size="small"
          InputLabelProps={{shrink: true}}
          inputProps={{readOnly: true}}
        />
        <TextField
          select
          label="Shift"
          value={report.shift}
          size="small"
          InputLabelProps={{shrink: true}}
        >
          <MenuItem value={report.shift}>{report.shift}</MenuItem>
        </TextField>
        <TextField
          label="Planner"
          value={report.planner}
          size="small"
          InputLabelProps={{shrink: true}}
          inputProps={{readOnly: true}}
        />
        <TextField
          label="Supervisor"
          value={report.supervisor}
          size="small"
          InputLabelProps={{shrink: true}}
          inputProps={{readOnly: true}}
        />
      </Box>
    </Paper>
  );
}
