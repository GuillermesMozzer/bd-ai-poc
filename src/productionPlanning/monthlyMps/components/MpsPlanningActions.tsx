import {
  AutoAwesome as AutoAwesomeIcon,
  Factory as FactoryIcon,
  Science as ScenarioIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import {Box, Button, CircularProgress, Stack, Typography} from '@mui/material';
import type {MpsPlan} from '../types';

type Props = {
  plan: MpsPlan;
  loadingAction: string | null;
  hasActiveScenario: boolean;
  onValidate: () => void;
  onCapacityCheck: () => void;
  onStockProjection: () => void;
  onCreateScenario: () => void;
  onCompareScenario: () => void;
  onApplyScenario: () => void;
  onOpenAssistant: () => void;
  onRelease: () => void;
  onReset: () => void;
};

export default function MpsPlanningActions({
  plan,
  loadingAction,
  hasActiveScenario,
  onValidate,
  onCapacityCheck,
  onStockProjection,
  onCreateScenario,
  onCompareScenario,
  onApplyScenario,
  onOpenAssistant,
  onRelease,
  onReset,
}: Props) {
  const isReleased = plan.status === 'Released' || plan.status === 'Superseded';
  const isLoading = (key: string) => loadingAction === key;

  return (
    <Box
      sx={{
        mb: 2,
        p: 1.4,
        borderRadius: 3,
        border: '1px solid #D8E2F0',
        bgcolor: 'var(--planning-surface)',
        boxShadow: '0 10px 24px rgba(8,24,74,0.05)',
      }}
    >
      <Typography sx={{fontSize: 11, fontWeight: 900, color: 'var(--planning-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.1}}>
        Planner Actions
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
        <ActionBtn
          label="Stock Projection"
          icon={<TimelineIcon sx={{fontSize: 16}} />}
          loading={isLoading('stock')}
          disabled={isReleased}
          onClick={onStockProjection}
          color="#1769FF"
        />
        <ActionBtn
          label="Create Scenario"
          icon={<ScenarioIcon sx={{fontSize: 16}} />}
          loading={isLoading('scenario-create')}
          disabled={isReleased}
          onClick={onCreateScenario}
          color="#1769FF"
        />
        <ActionBtn
          label="BLU.AI Assistant"
          icon={<AutoAwesomeIcon sx={{fontSize: 16}} />}
          loading={false}
          disabled={isReleased}
          onClick={onOpenAssistant}
          variant="contained"
          color="#6D28D9"
        />
        <ActionBtn
          label="Release MPS"
          icon={<FactoryIcon sx={{fontSize: 16}} />}
          loading={isLoading('release')}
          disabled={isReleased}
          onClick={onRelease}
          variant="contained"
          color="#1769FF"
        />
      </Stack>
    </Box>
  );
}

function ActionBtn({
  label,
  icon,
  loading,
  disabled,
  onClick,
  variant = 'outlined',
  color = '#6D28D9',
}: {
  label: string;
  icon: React.ReactNode;
  loading: boolean;
  disabled?: boolean;
  onClick: () => void;
  variant?: 'outlined' | 'contained';
  color?: string;
}) {
  const isContained = variant === 'contained';
  return (
    <Button
      size="small"
      variant={variant}
      startIcon={loading ? <CircularProgress size={14} sx={{color: isContained ? '#fff' : color}} /> : icon}
      disabled={disabled || loading}
      onClick={onClick}
      sx={{
        fontSize: 12,
        fontWeight: 800,
        borderRadius: 999,
        px: 1.7,
        minHeight: 34,
        textTransform: 'none',
        boxShadow: isContained ? '0 12px 24px rgba(23,105,255,0.22)' : 'none',
        ...(isContained
          ? {bgcolor: color, color: '#fff', '&:hover': {bgcolor: color, filter: 'brightness(0.96)'}}
          : {borderColor: '#BFDBFE', color, bgcolor: '#F0F6FF', '&:hover': {bgcolor: '#DBEAFE', borderColor: '#93C5FD'}}),
      }}
    >
      {label}
    </Button>
  );
}
