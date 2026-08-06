import {Settings as SettingsIcon} from '@mui/icons-material';
import {Box, Button, IconButton, Paper, Stack, Switch, Tooltip, Typography} from '@mui/material';
import type {V2ObjectCategoryConfig} from '../types';

type Props = {
  categories: V2ObjectCategoryConfig[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onOpenConfig: () => void;
};

function CategoryRow({
  cat,
  onToggle,
  indent = false,
}: {
  cat: V2ObjectCategoryConfig;
  onToggle: (id: string) => void;
  indent?: boolean;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        pl: indent ? 3 : 1.5,
        py: 0.65,
        '&:hover': {bgcolor: 'var(--planning-surface-muted)'},
      }}
    >
      <Box
        sx={{
          width: indent ? 8 : 10,
          height: indent ? 8 : 10,
          borderRadius: '50%',
          bgcolor: cat.enabled ? cat.color : '#CBD5E1',
          flexShrink: 0,
        }}
      />
      <Typography
        sx={{
          fontSize: indent ? 11.5 : 12,
          fontWeight: 600,
          color: cat.enabled ? '#08184A' : '#94A3B8',
          flex: 1,
          lineHeight: 1.3,
        }}
      >
        {cat.label}
      </Typography>
      <Switch
        size="small"
        checked={cat.enabled}
        onChange={() => onToggle(cat.id)}
        sx={{
          '& .MuiSwitch-switchBase.Mui-checked': {color: cat.color},
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {bgcolor: cat.color},
        }}
      />
    </Box>
  );
}

export default function V2ObjectsPanel({categories, onToggle, onSelectAll, onDeselectAll, onOpenConfig}: Props) {
  const allEnabled = categories.every(
    (c) => c.enabled && (c.children ?? []).every((ch) => ch.enabled),
  );
  const noneEnabled = categories.every(
    (c) => !c.enabled && (c.children ?? []).every((ch) => !ch.enabled),
  );

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid var(--planning-border)',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 0.75,
          borderBottom: '1px solid var(--planning-border)',
          bgcolor: 'var(--planning-surface-muted)',
        }}
      >
        <Typography sx={{fontSize: 11, fontWeight: 900, color: '#5B668A', letterSpacing: '0.08em', textTransform: 'uppercase'}}>
          Objects
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Button
            size="small"
            onClick={onSelectAll}
            disabled={allEnabled}
            sx={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'none',
              minWidth: 0,
              px: 0.8,
              py: 0.2,
              color: allEnabled ? '#CBD5E1' : '#4338CA',
              '&:hover': {bgcolor: 'var(--planning-ai-accent-bg)'},
            }}
          >
            All
          </Button>
          <Typography sx={{fontSize: 10, color: '#CBD5E1'}}>|</Typography>
          <Button
            size="small"
            onClick={onDeselectAll}
            disabled={noneEnabled}
            sx={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'none',
              minWidth: 0,
              px: 0.8,
              py: 0.2,
              color: noneEnabled ? '#CBD5E1' : '#5B668A',
              '&:hover': {bgcolor: 'var(--planning-surface-muted)'},
            }}
          >
            None
          </Button>
          <Tooltip title="Configure objects" placement="right">
            <IconButton
              size="small"
              onClick={onOpenConfig}
              sx={{color: '#8B95B5', '&:hover': {color: '#4338CA', bgcolor: 'var(--planning-ai-accent-bg)'}}}
            >
              <SettingsIcon sx={{fontSize: 15}} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Category list */}
      <Stack spacing={0}>
        {categories.map((cat) => (
          <Box key={cat.id}>
            <CategoryRow cat={cat} onToggle={onToggle} />
            {(cat.children ?? []).map((child) => (
              <CategoryRow key={child.id} cat={child} onToggle={onToggle} indent />
            ))}
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
