import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {Box, Button, IconButton, Paper, Typography} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import type {ReactNode} from 'react';
import type {WorkstationLineSummary} from '../types';

type WorkstationHeaderProps = {
  compact?: boolean;
  eyebrow?: string;
  filterControls?: ReactNode;
  headerActions?: ReactNode;
  onOpenLineLog: () => void;
  onOpenMeetingTopicDialog?: () => void;
  onToggleEdit?: () => void;
  isEditMode?: boolean;
  summary: WorkstationLineSummary;
};

export default function WorkstationHeader({
  compact = false,
  eyebrow = 'Tier 1',
  filterControls,
  headerActions,
  onOpenLineLog,
  onOpenMeetingTopicDialog,
  onToggleEdit,
  isEditMode = false,
  summary,
}: WorkstationHeaderProps) {

  return (
    <Paper
      elevation={0}
      sx={{
        p: compact ? {xs: 1.2, md: 1.4, xl: 1.6} : {xs: 1.5, md: 2, xl: 3},
        borderRadius: compact ? 2.2 : 4,
        bgcolor: 'background.paper',
        border: workstationVisuals.shellBorder,
      }}
    >
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap'}}>
        <Box sx={{minWidth: 0}}>
          <Typography variant="subtitle2" sx={{color: tokenBrand.dark, fontWeight: 800, letterSpacing: '0.08em', fontSize: compact ? 12 : undefined}}>
            {eyebrow}
          </Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.25, mt: compact ? 0.8 : 1.1, flexWrap: 'wrap'}}>
            <Typography variant="h5" sx={{color: workstationVisuals.tierTextHeading, fontWeight: 800, fontSize: compact ? 24 : undefined}}>
              {summary.product}
            </Typography>
            <Typography variant="h6" sx={{color: tokenNeutral.dark, fontWeight: 300}}>/</Typography>
            <Typography variant="h5" sx={{color: tokenInfo.darker, fontWeight: 800, fontSize: compact ? 24 : undefined}}>
              {summary.line}
            </Typography>
            <IconButton 
              size="small" 
              onClick={onToggleEdit || onOpenLineLog} 
              sx={{
                border: `1px solid ${tokenNeutral.main}`, 
                bgcolor: isEditMode ? tokenBrand.dark : tokenNeutral.lightest,
                color: isEditMode ? tokenCommon.white : workstationVisuals.tierTextHeading,
                '&:hover': {
                  bgcolor: isEditMode ? tokenBrand.main : tokenNeutral.lighter,
                }
              }}
            >
              <EditIcon sx={{fontSize: 14, color: 'inherit'}} />
            </IconButton>
          </Box>
        </Box>
        {filterControls ? (
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap', ml: {md: 'auto'}}}>
            {onOpenMeetingTopicDialog ? (
              <Button
                onClick={onOpenMeetingTopicDialog}
                startIcon={<AddIcon sx={{fontSize: 18}} />}
                variant="outlined"
                sx={{
                  height: 36,
                  borderRadius: 999,
                  px: 1.8,
                  borderColor: tokenBrand.light,
                  color: tokenBrand.main,
                  bgcolor: 'background.paper',
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    borderColor: tokenBrand.main,
                    bgcolor: tokenBrand.softBg,
                  },
                }}
              >
                Add meeting topic
              </Button>
            ) : null}
            {headerActions}
            {filterControls}
          </Box>
        ) : null}
      </Box>
    </Paper>
  );
}
