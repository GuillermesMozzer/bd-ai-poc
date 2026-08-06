import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {useState} from 'react';
import {IconButton, Menu, MenuItem} from '@mui/material';
import {
  EditOutlined as EditIcon,
  TableRowsOutlined as TableIcon,
  VisibilityOffOutlined as HideIcon,
  VisibilityOutlined as ShowIcon,
} from '@mui/icons-material';

export type WidgetBreakdownMode = 'line' | 'department';

type WidgetBreakdownControlsProps = {
  breakdownBy: WidgetBreakdownMode;
  onBreakdownByChange: (mode: WidgetBreakdownMode) => void;
  onShowBreakdownChange: (show: boolean) => void;
  showBreakdown: boolean;
};

export default function WidgetBreakdownControls({
  breakdownBy,
  onBreakdownByChange,
  onShowBreakdownChange,
  showBreakdown,
}: WidgetBreakdownControlsProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <IconButton
        aria-label="Configure breakdown"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        size="small"
        sx={{width: 20, height: 20, color: workstationVisuals.textMuted}}
      >
        <EditIcon sx={{fontSize: 15}} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{horizontal: 'right', vertical: 'top'}}
        anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 0.4,
            borderRadius: 1.6,
            border: `1px solid ${tokenNeutral.main}`,
            boxShadow: '0 12px 24px rgba(15, 23, 42, 0.10)',
            minWidth: 160,
          },
        }}
      >
        <MenuItem
          selected={showBreakdown && breakdownBy === 'line'}
          onClick={() => {
            onBreakdownByChange('line');
            onShowBreakdownChange(true);
            setAnchorEl(null);
          }}
        >
          <TableIcon sx={{fontSize: 16, mr: 1, color: tokenBrand.main}} />
          By Line
        </MenuItem>
        <MenuItem
          selected={showBreakdown && breakdownBy === 'department'}
          onClick={() => {
            onBreakdownByChange('department');
            onShowBreakdownChange(true);
            setAnchorEl(null);
          }}
        >
          <TableIcon sx={{fontSize: 16, mr: 1, color: tokenBrand.main}} />
          By Department
        </MenuItem>
        <MenuItem
          onClick={() => {
            onShowBreakdownChange(!showBreakdown);
            setAnchorEl(null);
          }}
        >
          {showBreakdown ? <HideIcon sx={{fontSize: 16, mr: 1, color: workstationVisuals.tierTextMeta}} /> : <ShowIcon sx={{fontSize: 16, mr: 1, color: workstationVisuals.tierTextMeta}} />}
          {showBreakdown ? 'Hide table' : 'Show table'}
        </MenuItem>
      </Menu>
    </>
  );
}
