import React, {useMemo, useState, type ReactNode} from 'react';
import {
  ChevronRight as ChevronRightIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  ViewSidebarOutlined as SidebarIcon,
} from '@mui/icons-material';
import {
  Collapse,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import type {AppNavigationChildItem, AppNavigationItem, AppNavigationKey} from './navigationConfig';

type SideNavProps = {
  activeKey: AppNavigationKey;
  currentUserInitials: string;
  currentUserName: string;
  expanded: boolean;
  items: AppNavigationItem[];
  mobileOpen: boolean;
  onItemClick: (item: AppNavigationItem | AppNavigationChildItem) => void;
  onItemHover?: (item: AppNavigationItem) => void;
  onMobileClose: () => void;
  onToggleExpanded: () => void;
  workstationPanel?: ReactNode;
};

const collapsedWidth = 56;
const expandedWidth = 232;
const mobileWidth = 276;
const topNavigationKeys = new Set<AppNavigationKey>(['blu_ai', 'document_manager', 'smart_search', 'global_view', 'notification']);

const navPaperBase = {
  bgcolor: 'var(--drawer-panel-bg)',
  borderRight: '1px solid var(--paper-border-color)',
  boxShadow: 'none',
} as const;

const SideNavContent = React.memo(({
  activeKey,
  currentUserInitials,
  currentUserName,
  expanded,
  items,
  onItemClick,
  onItemHover,
  onToggleExpanded,
  workstationPanel,
  accordionOpenKeys,
  onToggleAccordion,
}: Omit<SideNavProps, 'mobileOpen' | 'onMobileClose'> & {
  accordionOpenKeys: Set<AppNavigationKey>;
  onToggleAccordion: (key: AppNavigationKey) => void;
}) => {
  const topItems = useMemo(() => items.filter((item) => topNavigationKeys.has(item.key)), [items]);
  const mainItems = useMemo(() => items.filter((item) => !topNavigationKeys.has(item.key)), [items]);

  const renderNavItem = (item: AppNavigationItem) => {
    const selected = item.key === activeKey;
    const disabled = Boolean(item.disabled);
    const isOpen = accordionOpenKeys.has(item.key);
    const folderChildren = (item.children ?? []).filter((child) => !child.disabled);
    const button = (
      <ListItemButton
        onClick={() => {
          if (disabled) return;
          onItemClick(item);
          if (expanded && folderChildren.length) onToggleAccordion(item.key);
        }}
        onMouseEnter={() => !disabled && onItemHover?.(item)}
        onFocus={() => !disabled && onItemHover?.(item)}
        selected={selected}
        disabled={disabled}
        sx={{
          minHeight: 34,
          px: expanded ? 1.15 : 0,
          py: 0.45,
          justifyContent: expanded ? 'flex-start' : 'center',
          borderRadius: 0,
          color: selected ? 'var(--active-theme-text-primary)' : 'var(--active-theme-text-secondary)',
          bgcolor: selected ? 'var(--token-brand-soft-bg)' : 'transparent',
          borderRight: selected ? '2px solid var(--active-theme-primary)' : '2px solid transparent',
          opacity: disabled ? 0.52 : 1,
          '&.Mui-selected': {
            bgcolor: 'var(--token-brand-soft-bg)',
          },
          '&.Mui-disabled': {
            opacity: 0.52,
            color: 'var(--active-theme-text-secondary)',
          },
          '& .MuiListItemIcon-root': {
            color: selected ? 'var(--active-theme-primary)' : 'var(--active-theme-text-secondary)',
          },
          '&:hover': disabled
            ? undefined
            : {
                bgcolor: selected ? 'var(--token-brand-soft-bg)' : 'var(--menu-hover-bg)',
              },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: expanded ? 24 : 'auto',
            justifyContent: 'center',
            color: 'inherit',
            '& svg': {fontSize: 18},
          }}
        >
          {item.icon}
        </ListItemIcon>
        {expanded ? (
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              fontSize: 12.2,
              fontWeight: selected ? 700 : 500,
              lineHeight: 1.15,
              noWrap: true,
            }}
            sx={{my: 0}}
          />
        ) : null}
        {expanded && folderChildren.length ? (
          isOpen ? <ExpandLessIcon sx={{fontSize: 16, color: 'var(--active-theme-text-secondary)'}} /> : <ExpandMoreIcon sx={{fontSize: 16, color: 'var(--active-theme-text-secondary)'}} />
        ) : null}
      </ListItemButton>
    );

    return (
      <Box key={item.key}>
        <ListItem disablePadding>
          {expanded ? (
            button
          ) : (
            <Tooltip title={disabled ? `${item.label} coming soon` : item.label} placement="right">
              <Box component="span" sx={{display: 'flex', width: '100%'}}>
                {button}
              </Box>
            </Tooltip>
          )}
        </ListItem>
        {expanded && folderChildren.length ? (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List disablePadding sx={{pb: 0.25}}>
              {folderChildren.map((child) => (
                <ListItem key={`${item.key}-${child.key}`} disablePadding>
                  <ListItemButton
                    onClick={() => !disabled && onItemClick(child)}
                    sx={{
                      minHeight: 30,
                      py: 0.25,
                      pl: 4.2,
                      pr: 1,
                      borderRadius: 0,
                      color: 'var(--active-theme-text-secondary)',
                      '&:hover': {bgcolor: 'var(--menu-hover-bg)'},
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 22,
                        color: 'inherit',
                        '& svg': {fontSize: 15},
                      }}
                    >
                      {child.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={child.label}
                      primaryTypographyProps={{fontSize: 11.4, fontWeight: 600, noWrap: true}}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        ) : null}
      </Box>
    );
  };

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
      <Box
        sx={{
          minHeight: 34,
          px: expanded ? 0.65 : 0,
          pt: 0.75,
          display: 'flex',
          alignItems: 'center',
          justifyContent: expanded ? 'flex-end' : 'center',
        }}
      >
        <IconButton
          onClick={onToggleExpanded}
          size="small"
          sx={{
            width: 25,
            height: 25,
            borderRadius: 0.8,
            color: 'var(--active-theme-text-secondary)',
            bgcolor: 'transparent',
            '&:hover': {bgcolor: 'var(--token-brand-soft-bg)'},
          }}
        >
          {expanded ? <SidebarIcon sx={{fontSize: 17}} /> : <ChevronRightIcon sx={{fontSize: 18}} />}
        </IconButton>
      </Box>

      <List sx={{px: 0, pt: 1.55, pb: 0, display: 'flex', flexDirection: 'column', gap: 0.95}}>
        {topItems.map(renderNavItem)}
      </List>

      <Divider sx={{mx: expanded ? 1.1 : 0.8, my: 1.25, borderColor: 'var(--token-divider)'}} />

      <List sx={{px: 0, py: 0, display: 'flex', flexDirection: 'column', gap: 0.95}}>
        {mainItems.map(renderNavItem)}
      </List>

      {expanded && workstationPanel ? (
        <>
          <Divider sx={{mx: 1.1, my: 1.25, borderColor: 'var(--token-divider)'}} />
          <Box sx={{px: 0.85, pb: 1.1}}>{workstationPanel}</Box>
        </>
      ) : null}

      <Box sx={{mt: 'auto', px: expanded ? 0.75 : 0, py: 1.25}}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: expanded ? 0.7 : 0,
            justifyContent: expanded ? 'flex-start' : 'center',
            px: expanded ? 0.25 : 0,
          }}
        >
          <Avatar
            sx={{
              width: 28,
              height: 28,
              bgcolor: 'var(--token-brand-soft-bg)',
              color: 'var(--active-theme-primary)',
              fontWeight: 800,
              fontSize: 11,
            }}
          >
            {currentUserInitials}
          </Avatar>
          {expanded ? (
            <Typography sx={{fontSize: 12, fontWeight: 500, color: 'var(--active-theme-text-primary)', lineHeight: 1.1}} noWrap>
              {currentUserName}
            </Typography>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
});

const SideNav = (props: SideNavProps) => {
  const {expanded, mobileOpen, onMobileClose} = props;
  const [accordionOpenKeys, setAccordionOpenKeys] = useState<Set<AppNavigationKey>>(
    new Set<AppNavigationKey>(['document_manager', 'workstation', 'logistic', 'maintenance', 'shopfloor']),
  );
  const toggleAccordion = (key: AppNavigationKey) => {
    setAccordionOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const mergedOpenKeys = useMemo(() => {
    const next = new Set(accordionOpenKeys);
    next.add(props.activeKey);
    return next;
  }, [accordionOpenKeys, props.activeKey]);

  return (
    <>
      <Box
        sx={{
          display: {xs: 'none', md: 'block'},
          width: expanded ? expandedWidth : collapsedWidth,
          flexShrink: 0,
          transition: 'width 0.18s ease',
        }}
      >
        <Box
          sx={{
            ...navPaperBase,
            width: '100%',
            height: '100vh',
            position: 'sticky',
            top: 0,
            overflow: 'hidden',
          }}
        >
          <SideNavContent
            activeKey={props.activeKey}
            currentUserInitials={props.currentUserInitials}
            currentUserName={props.currentUserName}
            expanded={props.expanded}
            items={props.items}
            onItemClick={props.onItemClick}
            onItemHover={props.onItemHover}
            onToggleExpanded={props.onToggleExpanded}
            workstationPanel={props.workstationPanel}
            accordionOpenKeys={mergedOpenKeys}
            onToggleAccordion={toggleAccordion}
          />
        </Box>
      </Box>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={onMobileClose}
        PaperProps={{
          sx: {
            ...navPaperBase,
            width: mobileWidth,
          },
        }}
        sx={{display: {xs: 'block', md: 'none'}}}
      >
        <SideNavContent
          activeKey={props.activeKey}
          currentUserInitials={props.currentUserInitials}
          currentUserName={props.currentUserName}
          expanded={true}
          items={props.items}
          onItemClick={props.onItemClick}
          onItemHover={props.onItemHover}
          onToggleExpanded={props.onToggleExpanded}
          workstationPanel={props.workstationPanel}
          accordionOpenKeys={mergedOpenKeys}
          onToggleAccordion={toggleAccordion}
        />
      </Drawer>
    </>
  );
};

export default React.memo(SideNav);
