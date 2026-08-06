import type {MouseEventHandler, ReactNode} from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  Apps as AppsIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  HomeOutlined as HomeOutlinedIcon,
  NotificationsNone as NotificationsNoneIcon,
  PersonOutline as PersonOutlineIcon,
  Search as SearchIcon,
  StarBorder as StarBorderIcon,
  SummarizeOutlined as SummarizeOutlinedIcon,
} from '@mui/icons-material';
import {planningCardSx, planningStatusTones, planningSurfaceSx, planningTokens} from './planningTheme';

type TopNavProps = {
  breadcrumb: string;
  searchPlaceholder?: string;
};

type SidebarItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  index?: number;
};

type SidebarProps = {
  mode: 'compact' | 'workflow';
  title?: string;
  items: SidebarItem[];
  activeId: string;
  onSelect: (id: string) => void;
};

type MetricCardProps = {
  label: string;
  value: ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'blue';
  icon?: ReactNode;
  helper?: string;
};

type SummaryTileProps = {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'blue';
};

type StatusPillProps = {
  label: string;
  tone: keyof typeof planningStatusTones;
};

type ActionButtonProps = {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

type FilterBarProps = {
  children: ReactNode;
  toggle?: {
    checked: boolean;
    label: string;
    onChange: (checked: boolean) => void;
  };
};

type DataTableProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

type InsightCardProps = {
  title: string;
  value?: ReactNode;
  subtitle?: string;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'blue';
  children?: ReactNode;
};

type ExceptionListItemProps = {
  status: 'Blocker' | 'Warning' | 'Info';
  title: string;
  context: string;
  description: string;
  suggestedAction: string;
};

const valueTone = {
  default: planningTokens.textPrimary,
  success: planningTokens.success,
  warning: planningTokens.warning,
  danger: planningTokens.danger,
  blue: planningTokens.primaryBlue,
} as const;

export function TopNav({breadcrumb, searchPlaceholder = 'Search everything...'}: TopNavProps) {
  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        height: planningTokens.topBarHeight,
        px: {xs: 2, md: 3},
        display: 'grid',
        gridTemplateColumns: {xs: '1fr', lg: 'auto minmax(320px, 420px) auto'},
        alignItems: 'center',
        gap: 2,
        bgcolor: planningTokens.primaryNavy,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 14px 28px rgba(7, 20, 61, 0.32)',
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0}}>
        <IconButton sx={{color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.08)', '&:hover': {bgcolor: 'rgba(255,255,255,0.14)'}}}>
          <AppsIcon />
        </IconButton>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0}}>
          <Avatar sx={{width: 34, height: 34, bgcolor: 'var(--planning-surface)', color: planningTokens.primaryNavy, fontWeight: 900}}>BD</Avatar>
          <Typography sx={{fontSize: {xs: 22, md: 18}, fontWeight: 900, color: '#FFFFFF', whiteSpace: 'nowrap'}}>
            BD Smart Factory
          </Typography>
        </Box>
      </Box>

      <TextField
        placeholder={searchPlaceholder}
        size="small"
        fullWidth
        sx={{
          display: {xs: 'none', lg: 'block'},
          '& .MuiOutlinedInput-root': {
            height: 44,
            bgcolor: 'rgba(255,255,255,0.08)',
            color: '#FFFFFF',
            borderRadius: 3,
            '& fieldset': {borderColor: 'rgba(255,255,255,0.16)'},
            '&:hover fieldset': {borderColor: 'rgba(255,255,255,0.28)'},
            '&.Mui-focused fieldset': {borderColor: 'rgba(255,255,255,0.32)'},
          },
          '& input::placeholder': {color: 'rgba(255,255,255,0.72)', opacity: 1},
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{color: 'rgba(255,255,255,0.72)'}} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Chip
                label="K"
                size="small"
                sx={{height: 24, bgcolor: 'rgba(255,255,255,0.12)', color: '#FFFFFF', borderRadius: 2}}
              />
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{display: 'flex', justifyContent: {xs: 'space-between', lg: 'flex-end'}, alignItems: 'center', gap: 1.25}}>
        <Typography sx={{display: {xs: 'none', xl: 'block'}, color: 'rgba(255,255,255,0.88)', fontSize: 13, fontWeight: 700}}>
          {breadcrumb}
        </Typography>
        <IconButton sx={{color: '#FFFFFF'}}><StarBorderIcon /></IconButton>
        <IconButton sx={{color: '#FFFFFF'}}><HomeOutlinedIcon /></IconButton>
        <IconButton sx={{color: '#FFFFFF'}}><SummarizeOutlinedIcon /></IconButton>
        <IconButton sx={{color: '#FFFFFF'}}>
          <Badge color="error" variant="dot">
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>
        <Button
          variant="contained"
          sx={{
            minWidth: 132,
            height: 40,
            px: 2,
            borderRadius: 3,
            bgcolor: planningTokens.primaryBlue,
            color: '#FFFFFF',
            fontWeight: 900,
            boxShadow: '0 12px 24px rgba(23, 105, 255, 0.34)',
            '&:hover': {bgcolor: planningTokens.primaryBlueAlt},
          }}
        >
          SHIFT ENTRY
        </Button>
        <Avatar sx={{width: 36, height: 36, bgcolor: '#F4C06B', color: planningTokens.primaryNavy, fontWeight: 900}}>MP</Avatar>
      </Box>
    </Box>
  );
}

export function Sidebar({mode, title, items, activeId, onSelect}: SidebarProps) {
  if (mode === 'compact') {
    return (
      <Paper
        elevation={0}
        sx={{
          ...planningCardSx,
          width: 88,
          minWidth: 88,
          p: 1.25,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'center',
        }}
      >
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <Box
              key={item.id}
              component="button"
              onClick={() => onSelect(item.id)}
              sx={{
                width: 56,
                height: 56,
                border: 0,
                borderLeft: `4px solid ${active ? planningTokens.primaryBlue : 'transparent'}`,
                borderRadius: 3,
                bgcolor: active ? planningTokens.purpleHighlight : 'transparent',
                color: active ? planningTokens.primaryBlue : planningTokens.textSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                '&:hover': {bgcolor: planningTokens.purpleHighlight},
              }}
              title={item.label}
            >
              {item.icon ?? <PersonOutlineIcon />}
            </Box>
          );
        })}
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        ...planningCardSx,
        width: 286,
        minWidth: 286,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Typography sx={{fontSize: 12, fontWeight: 900, color: planningTokens.textSecondary, letterSpacing: '0.08em', textTransform: 'uppercase', px: 0.5}}>
        {title ?? 'Workflow Pages'}
      </Typography>
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <Box
            key={item.id}
            component="button"
            onClick={() => onSelect(item.id)}
            sx={{
              width: '100%',
              minHeight: 52,
              border: `1px solid ${active ? '#D8CCFF' : 'transparent'}`,
              borderLeft: `4px solid ${active ? '#8B5CF6' : 'transparent'}`,
              borderRadius: 3,
              bgcolor: active ? planningTokens.purpleHighlight : 'transparent',
              display: 'grid',
              gridTemplateColumns: '28px 1fr auto',
              gap: 1,
              alignItems: 'center',
              px: 1.2,
              color: planningTokens.textPrimary,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.18s ease',
              '&:hover': {bgcolor: planningTokens.surfaceMuted, borderColor: planningTokens.border},
            }}
          >
            <Typography sx={{fontSize: 12, fontWeight: 900, color: active ? '#7C3AED' : planningTokens.textMuted}}>
              {item.index}
            </Typography>
            <Typography sx={{fontSize: 14, fontWeight: active ? 900 : 700}}>
              {item.label}
            </Typography>
            <ChevronRightIcon sx={{fontSize: 18, color: active ? '#7C3AED' : planningTokens.textMuted}} />
          </Box>
        );
      })}
    </Paper>
  );
}

export function MetricCard({label, value, tone = 'default', icon, helper}: MetricCardProps) {
  return (
    <Paper elevation={0} sx={{...planningSurfaceSx, p: 1.75, minHeight: 116}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5}}>
        <Box sx={{minWidth: 0}}>
          <Typography sx={{fontSize: 11, fontWeight: 900, color: planningTokens.textSecondary, textTransform: 'uppercase', letterSpacing: '0.08em'}}>
            {label}
          </Typography>
          <Typography sx={{fontSize: 20, fontWeight: 900, color: valueTone[tone], mt: 1.1, lineHeight: 1.05}}>
            {value}
          </Typography>
          {helper ? (
            <Typography sx={{fontSize: 12, color: planningTokens.textSecondary, mt: 0.8, lineHeight: 1.45}}>
              {helper}
            </Typography>
          ) : null}
        </Box>
        {icon ? (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 3,
              bgcolor: planningTokens.purpleHighlight,
              color: tone === 'success'
                ? planningTokens.success
                : tone === 'warning'
                  ? planningTokens.warning
                  : tone === 'danger'
                    ? planningTokens.danger
                    : planningTokens.primaryBlue,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        ) : null}
      </Box>
    </Paper>
  );
}

export function SummaryTile({label, value, icon, tone = 'default'}: SummaryTileProps) {
  return (
    <Paper elevation={0} sx={{...planningSurfaceSx, p: 1.35, minHeight: 92}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1}}>
        <Box>
          <Typography sx={{fontSize: 11, fontWeight: 800, color: planningTokens.textSecondary, textTransform: 'uppercase'}}>
            {label}
          </Typography>
          <Typography sx={{fontSize: 17, fontWeight: 900, color: valueTone[tone], mt: 0.9}}>
            {value}
          </Typography>
        </Box>
        {icon ? <Box sx={{color: planningTokens.primaryBlue}}>{icon}</Box> : null}
      </Box>
    </Paper>
  );
}

export function StatusPill({label, tone}: StatusPillProps) {
  const colors = planningStatusTones[tone];
  return (
    <Chip
      size="small"
      label={label}
      sx={{
        height: 28,
        bgcolor: colors.bg,
        color: colors.color,
        border: `1px solid ${colors.border}`,
        fontWeight: 900,
        borderRadius: 999,
      }}
    />
  );
}

export function ActionButton({label, variant = 'secondary', startIcon, endIcon, disabled, onClick}: ActionButtonProps) {
  const variantSx = variant === 'primary'
    ? {
        bgcolor: planningTokens.primaryBlue,
        color: '#FFFFFF',
        border: '1px solid transparent',
        boxShadow: '0 12px 22px rgba(23, 105, 255, 0.24)',
        '&:hover': {bgcolor: planningTokens.primaryBlueAlt},
      }
    : variant === 'ghost'
      ? {
          bgcolor: 'transparent',
          color: planningTokens.textSecondary,
          border: `1px solid ${planningTokens.border}`,
          '&:hover': {bgcolor: planningTokens.surfaceMuted},
        }
      : {
          bgcolor: planningTokens.surface,
          color: planningTokens.textPrimary,
          border: `1px solid ${planningTokens.border}`,
          '&:hover': {bgcolor: planningTokens.surfaceMuted},
        };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      startIcon={startIcon}
      endIcon={endIcon}
      sx={{
        height: 40,
        px: 2,
        borderRadius: 3,
        fontWeight: 800,
        textTransform: 'none',
        ...variantSx,
      }}
    >
      {label}
    </Button>
  );
}

export function FilterBar({children, toggle}: FilterBarProps) {
  return (
    <Paper elevation={0} sx={{...planningCardSx, p: 1.6}}>
      <Typography sx={{fontSize: 12, color: '#4F46E5', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>
        Filters
      </Typography>
      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(6, minmax(0, 1fr))'}, gap: 1.2, mt: 1.4}}>
        {children}
      </Box>
      {toggle ? (
        <Box sx={{mt: 1.3, display: 'flex', alignItems: 'center', gap: 1}}>
          <Switch checked={toggle.checked} onChange={(event) => toggle.onChange(event.target.checked)} />
          <Typography sx={{fontSize: 13, color: planningTokens.textPrimary, fontWeight: 700}}>
            {toggle.label}
          </Typography>
        </Box>
      ) : null}
    </Paper>
  );
}

export function DataTable({title, description, children, footer}: DataTableProps) {
  return (
    <Paper elevation={0} sx={{...planningCardSx, p: 1.25}}>
      {title ? (
        <Box sx={{px: 0.5, pb: 1.1}}>
          <Typography sx={{fontSize: 12, color: '#4F46E5', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>
            {title}
          </Typography>
          {description ? (
            <Typography sx={{fontSize: 13, color: planningTokens.textSecondary, mt: 0.7}}>
              {description}
            </Typography>
          ) : null}
        </Box>
      ) : null}
      <Box sx={{overflowX: 'auto'}}>{children}</Box>
      {footer ? <Box sx={{pt: 1}}>{footer}</Box> : null}
    </Paper>
  );
}

export function InsightCard({title, value, subtitle, tone = 'default', children}: InsightCardProps) {
  return (
    <Paper elevation={0} sx={{...planningSurfaceSx, p: 1.35}}>
      <Typography sx={{fontSize: 11, color: planningTokens.textSecondary, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em'}}>
        {title}
      </Typography>
      {value !== undefined ? (
        <Typography sx={{fontSize: 17, fontWeight: 900, color: valueTone[tone], mt: 0.8}}>
          {value}
        </Typography>
      ) : null}
      {subtitle ? (
        <Typography sx={{fontSize: 12, color: planningTokens.textSecondary, mt: 0.5, lineHeight: 1.45}}>
          {subtitle}
        </Typography>
      ) : null}
      {children ? <Box sx={{mt: 1.1}}>{children}</Box> : null}
    </Paper>
  );
}

export function ExceptionListItem({status, title, context, description, suggestedAction}: ExceptionListItemProps) {
  return (
    <Paper elevation={0} sx={{...planningSurfaceSx, p: 1.5}}>
      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', lg: '110px 180px 130px minmax(0, 1fr) auto'}, gap: 1.2, alignItems: 'start'}}>
        <StatusPill label={status} tone={status} />
        <Typography sx={{fontSize: 14, color: planningTokens.textPrimary, fontWeight: 900}}>{title}</Typography>
        <Typography sx={{fontSize: 13, color: planningTokens.textSecondary, fontWeight: 700}}>{context}</Typography>
        <Box>
          <Typography sx={{fontSize: 13.5, color: planningTokens.textPrimary, fontWeight: 800, lineHeight: 1.5}}>
            {description}
          </Typography>
          <Typography sx={{fontSize: 12.5, color: planningTokens.textSecondary, mt: 0.45, lineHeight: 1.55}}>
            Suggested action: {suggestedAction}
          </Typography>
        </Box>
        <ChevronRightIcon sx={{fontSize: 20, color: planningTokens.primaryBlue, mt: 0.3}} />
      </Box>
    </Paper>
  );
}

export function SectionHeader({eyebrow, title, subtitle}: {eyebrow: string; title: string; subtitle?: string}) {
  return (
    <Box>
      <Typography sx={{fontSize: 12, color: '#4F46E5', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em'}}>
        {eyebrow}
      </Typography>
      <Typography sx={{fontSize: {xs: 28, md: 34}, color: planningTokens.textPrimary, fontWeight: 900, mt: 0.7, letterSpacing: '-0.03em'}}>
        {title}
      </Typography>
      {subtitle ? (
        <Typography sx={{fontSize: 15, color: planningTokens.textSecondary, mt: 0.8, lineHeight: 1.6, maxWidth: 860}}>
          {subtitle}
        </Typography>
      ) : null}
    </Box>
  );
}

export function MoreActionsButton({label = 'More actions'}: {label?: string}) {
  return <ActionButton label={label} variant="secondary" endIcon={<ExpandMoreIcon />} />;
}
