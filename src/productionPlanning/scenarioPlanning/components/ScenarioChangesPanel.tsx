import {Box, Chip, IconButton, Paper, Tooltip, Typography} from '@mui/material';
import {
  Add as AddIcon,
  MoreHoriz as MoreIcon,
  TrendingUp as DemandIcon,
  Speed as CapacityIcon,
  EventBusy as CalendarIcon,
  Inventory as InventoryIcon,
  Rule as RuleIcon,
  SwapHoriz as AssignIcon,
} from '@mui/icons-material';
import {planningCardSx, planningTokens} from '../../ui/planningTheme';
import type {ScenarioChange} from '../types';

type Props = {
  changes: ScenarioChange[];
  onAddChange: () => void;
  onToggleChange: (id: string) => void;
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  DemandChange: <DemandIcon sx={{fontSize: 16}} />,
  CapacityChange: <CapacityIcon sx={{fontSize: 16}} />,
  CalendarEvent: <CalendarIcon sx={{fontSize: 16}} />,
  InventoryPolicyChange: <InventoryIcon sx={{fontSize: 16}} />,
  ProductRuleChange: <RuleIcon sx={{fontSize: 16}} />,
  LineAssignmentChange: <AssignIcon sx={{fontSize: 16}} />,
  MaterialConstraint: <InventoryIcon sx={{fontSize: 16}} />,
  PriorityChange: <RuleIcon sx={{fontSize: 16}} />,
};

const CATEGORY_COLORS: Record<string, {bg: string; color: string}> = {
  DemandChange: {bg: '#EFF6FF', color: '#1D4ED8'},
  CapacityChange: {bg: '#FFF7ED', color: '#C2410C'},
  CalendarEvent: {bg: '#F0FDF4', color: '#16A34A'},
  InventoryPolicyChange: {bg: '#F5F3FF', color: '#6D28D9'},
  default: {bg: '#F8FAFC', color: 'var(--planning-text-secondary)'},
};

export default function ScenarioChangesPanel({changes, onAddChange, onToggleChange}: Props) {
  const activeCount = changes.filter((c) => c.active).length;

  return (
    <Paper elevation={0} sx={{...planningCardSx, p: 0, overflow: 'hidden'}}>
      <Box sx={{
        px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${planningTokens.border}`,
      }}>
        <Typography sx={{fontSize: 13.5, fontWeight: 900, color: planningTokens.textPrimary}}>
          Scenario Changes ({activeCount})
        </Typography>
        <Tooltip title="Add a new scenario change">
          <Box
            component="button"
            onClick={onAddChange}
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.5, px: 1.2, py: 0.5,
              border: `1px solid ${planningTokens.primaryBlue}`,
              color: planningTokens.primaryBlue, bgcolor: 'transparent', borderRadius: 1.5,
              cursor: 'pointer', fontWeight: 800, fontSize: 12,
              '&:hover': {bgcolor: `color-mix(in srgb, ${planningTokens.primaryBlue} 4%, transparent)`},
            }}
          >
            <AddIcon sx={{fontSize: 15}} />
            Add Change
          </Box>
        </Tooltip>
      </Box>

      <Box sx={{display: 'flex', flexDirection: 'column', maxHeight: 420, overflowY: 'auto'}}>
        {changes.length === 0 && (
          <Box sx={{p: 2, textAlign: 'center'}}>
            <Typography sx={{fontSize: 13, color: planningTokens.textMuted}}>
              No changes defined. Click Add Change to start.
            </Typography>
          </Box>
        )}
        {changes.map((chg) => {
          const style = CATEGORY_COLORS[chg.category] ?? CATEGORY_COLORS.default;
          const icon = CATEGORY_ICONS[chg.category] ?? <RuleIcon sx={{fontSize: 16}} />;

          return (
            <Box key={chg.id} sx={{
              px: 2, py: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1.2,
              borderBottom: `1px solid ${planningTokens.border}`,
              opacity: chg.active ? 1 : 0.5,
            }}>
              <Box sx={{
                width: 30, height: 30, borderRadius: 1.5, flexShrink: 0,
                bgcolor: style.bg, color: style.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {icon}
              </Box>
              <Box sx={{flex: 1, minWidth: 0}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.3}}>
                  <Typography sx={{fontSize: 12.5, fontWeight: 800, color: planningTokens.textPrimary, lineHeight: 1.2}}>
                    {chg.title}
                  </Typography>
                  {chg.active && (
                    <Chip size="small" label="Active"
                      sx={{bgcolor: '#ECFDF3', color: '#16A34A', border: '1px solid #BBF7D0', fontWeight: 800, height: 16, fontSize: 10}} />
                  )}
                </Box>
                <Typography sx={{fontSize: 11.5, color: planningTokens.textMuted, lineHeight: 1.3}}>
                  {chg.description}
                </Typography>
                <Typography sx={{fontSize: 11, color: planningTokens.textMuted, mt: 0.3}}>
                  {chg.startPeriod}{chg.startPeriod !== chg.endPeriod ? ` – ${chg.endPeriod}` : ''}
                  {(chg.lineId || chg.productCode || chg.productFamily) && (
                    <span style={{marginLeft: 4}}>
                      · {chg.lineId ?? chg.productCode ?? chg.productFamily}
                    </span>
                  )}
                </Typography>
              </Box>
              <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5}}>
                <Tooltip title={chg.active ? 'Deactivate change' : 'Activate change'}>
                  <Box
                    component="button"
                    onClick={() => onToggleChange(chg.id)}
                    sx={{
                      fontSize: 10, fontWeight: 800, px: 1, py: 0.3, border: 'none', borderRadius: 1,
                      cursor: 'pointer',
                      bgcolor: chg.active ? planningTokens.danger : planningTokens.textMuted,
                      color: '#fff',
                    }}
                  >
                    {chg.active ? 'ON' : 'OFF'}
                  </Box>
                </Tooltip>
                <IconButton size="small" sx={{color: planningTokens.textMuted}}>
                  <MoreIcon sx={{fontSize: 15}} />
                </IconButton>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
