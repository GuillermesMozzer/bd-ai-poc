import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import { useMemo, useState } from 'react';
import {
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { Box, Button, Collapse, Divider, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import type { AppScreen } from '../../navigation/navigationConfig';
import { readPublishedWorkstations, type PublishedWorkstation } from '../publishedWorkstations';
import { useWorkstationContext } from '../contexts/WorkstationContext';

type WorkstationSubMenuProps = {
  activeScreen?: AppScreen;
  embedded?: boolean;
  activeWorkstationId?: string | null;
  activePredefinedWorkstationTitle?: string | null;
  onOpenApp?: (appName: string) => void;
  onOpenPredefined?: (title: string) => void;
  onOpenSavedWorkstation?: (workstationId: string) => void;
  onAddWorkstation?: () => void;
};

const predefinedWorkstations: Array<Pick<PublishedWorkstation, 'id' | 'title'>> = [
  {id: 'sample-operator-view', title: 'Operator View'},
  {id: 'sample-leader-view', title: 'Leader View'},
  {id: 'sample-tier-1', title: 'Tier 1'},
  {id: 'sample-tier-2', title: 'Tier 2'},
  {id: 'sample-tier-3', title: 'Tier 3'},
  {id: 'sample-maintenance-leader', title: 'Maintenance Leader'},
  {id: 'sample-maintenance-planner', title: 'Maintenance Planner'},
  {id: 'sample-spare-parts', title: 'Spare Parts'},
  {id: 'sample-maintenance-technician', title: 'Maintenance Technician'},
];

export default function WorkstationSubMenu({
  activeScreen: propActiveScreen,
  embedded = false,
  activeWorkstationId: propActiveWorkstationId,
  activePredefinedWorkstationTitle: propActivePredefinedWorkstationTitle,
  onOpenApp: propOnOpenApp,
  onOpenPredefined: propOnOpenPredefined,
  onOpenSavedWorkstation: propOnOpenSavedWorkstation,
  onAddWorkstation: propOnAddWorkstation,
}: WorkstationSubMenuProps) {
  const workstationContext = useWorkstationContext();

  const activeScreen = propActiveScreen ?? workstationContext.currentScreen;
  const activeWorkstationId = propActiveWorkstationId ?? workstationContext.activeWorkstationId;
  const activePredefinedWorkstationTitle = propActivePredefinedWorkstationTitle ?? workstationContext.activePredefinedWorkstationTitle;
  
  const onOpenApp = propOnOpenApp ?? ((app: string) => {
    // Basic mapping or just log for now
    console.log('Opening app:', app);
  });
  
  const onOpenPredefined = propOnOpenPredefined ?? workstationContext.openPredefinedWorkstation;
  const onOpenSavedWorkstation = propOnOpenSavedWorkstation ?? workstationContext.openPublishedWorkstation;
  const onAddWorkstation = propOnAddWorkstation ?? workstationContext.openBlankWorkstationDraft;
  const [expandedPredefinedKey, setExpandedPredefinedKey] = useState<string | null>('sample-operator-view');
  const [expandedMyWorkstationId, setExpandedMyWorkstationId] = useState<string | null>(null);

  const savedWorkstations = useMemo(() => {
    return readPublishedWorkstations()
      .map((workstation) => ({id: workstation.id, title: workstation.title}))
      .filter((workstation) => workstation.title.trim().length > 0)
      .slice(0, 10);
  }, [activeScreen]);

  const defaultWorkstreamApps: string[] = ['CIL', 'Centerline', 'Equipment Setup Changeover', 'Manage Activities'];
  const predefinedApps: Record<string, string[]> = {
    'Operator View': ['CIL', 'Centerline', 'Equipment Setup Changeover', 'Manage Activities'],
    'Leader View': ['CIL', 'Centerline', 'Equipment Setup Changeover', 'Manage Activities'],
    'Tier 1': ['CIL', 'Centerline', 'Equipment Setup Changeover', 'Manage Activities'],
    'Tier 2': ['CIL', 'Centerline', 'Equipment Setup Changeover', 'Manage Activities'],
    'Tier 3': ['CIL', 'Centerline', 'Equipment Setup Changeover', 'Manage Activities'],
    'Maintenance Leader': ['Maintenance Hub', 'Maintenance Backlog', 'Maintenance Calendar', 'Maintenance Analytics'],
    'Maintenance Planner': ['Maintenance Planner', 'Maintenance Calendar', 'Maintenance Analytics', 'Spare Parts Monitor', 'Maintenance Backlog'],
    'Spare Parts': ['Spare Parts Management', 'Equipment Ledger'],
    'Maintenance Technician': ['Maintenance', 'Maintenance Calendar', 'Maintenance Follow Up Board', 'Spare Parts Management', 'Equipment Ledger', 'CBM & PdM'],
  };

  const menuButtonSx = {
    minHeight: 38,
    borderRadius: 0,
    px: 1.2,
    '&.Mui-selected': {bgcolor: tokenNeutral.main},
    '&:hover': {bgcolor: tokenNeutral.lighter},
  } as const;

  const sectionLabelSx = {
    px: 1.2,
    pt: 1,
    pb: 0.45,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.08em',
    color: workstationVisuals.textSecondary,
    textTransform: 'uppercase',
  } as const;

  const renderWorkstreamCards = (apps: string[], keyPrefix: string) => (
    <Box sx={{px: 1.5, py: 0.9, display: 'grid', gap: 0.7}}>
      {apps.map((app) => (
        <Box
          key={`${keyPrefix}-${app}`}
          component="button"
          onClick={() => onOpenApp(app)}
          sx={{
            width: '100%',
            p: 0.95,
            borderRadius: 2,
            border: '1px solid rgba(148,163,184,0.24)',
            bgcolor: tokenCommon.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            '&:hover': {
              borderColor: 'rgba(29,78,216,0.35)',
              bgcolor: tokenNeutral.lightest,
              transform: 'translateY(-1px)',
            },
          }}
        >
          <Typography sx={{fontSize: 11.8, fontWeight: 700, color: workstationVisuals.tierTextHeading, lineHeight: 1.3}}>
            {app}
          </Typography>
          <ChevronRightIcon sx={{fontSize: 14, color: tokenBrand.main}} />
        </Box>
      ))}
    </Box>
  );

  return (
    <Box
      sx={{
        display: embedded ? 'flex' : {xs: 'none', md: 'flex'},
        flexDirection: 'column',
        width: embedded ? '100%' : 212,
        flexShrink: 0,
        minHeight: embedded ? 'auto' : '100vh',
        position: embedded ? 'relative' : 'sticky',
        top: embedded ? 'auto' : 0,
        bgcolor: embedded ? 'transparent' : tokenNeutral.lighter,
        borderRight: embedded ? 'none' : `1px solid ${tokenNeutral.dark}`,
        boxShadow: embedded ? 'none' : '5px 0 18px rgba(29,78,216,0.12)',
      }}
    >
      <Box sx={{px: 1.1, pt: 1.25, pb: 0.45}}>
        <Typography sx={{fontSize: 12, fontWeight: 500, color: workstationVisuals.tierTextLabel}}>
          Workstations
        </Typography>
      </Box>

      <List disablePadding sx={{px: 0, display: 'grid', gap: 0.55}}>
        <Divider sx={{mx: 1.1, mt: 0.75, mb: 0.45, borderColor: 'rgba(148,163,184,0.28)'}} />
        <Typography sx={{...sectionLabelSx, pt: 0.25}}>Predefined</Typography>
        {predefinedWorkstations.map((workstation) => {
          const selected = activePredefinedWorkstationTitle === workstation.title;
          const apps = predefinedApps[workstation.title] ?? defaultWorkstreamApps;
          const expanded = expandedPredefinedKey === workstation.id;
          return (
            <Box key={workstation.id}>
              <ListItemButton
                selected={selected}
                onClick={() => {
                  onOpenPredefined(workstation.title);
                  setExpandedPredefinedKey((prev) => (prev === workstation.id ? null : workstation.id));
                }}
                sx={{...menuButtonSx, pl: 2.2, bgcolor: selected ? tokenNeutral.main : 'transparent'}}
              >
                <ListItemText
                  primary={workstation.title}
                  primaryTypographyProps={{
                    fontSize: 13,
                    fontWeight: selected ? 800 : 600,
                    color: workstationVisuals.tierTextHeading,
                    noWrap: true,
                  }}
                />
                {expanded ? <ExpandLessIcon sx={{fontSize: 15}} /> : <ExpandMoreIcon sx={{fontSize: 15}} />}
              </ListItemButton>
              <Collapse in={expanded} timeout="auto" unmountOnExit>
                {renderWorkstreamCards(apps, workstation.id)}
              </Collapse>
            </Box>
          );
        })}

        <Divider sx={{mx: 1.1, mt: 0.75, mb: 0.45, borderColor: 'rgba(148,163,184,0.28)'}} />
        <Typography sx={{...sectionLabelSx, pt: 0.25}}>My Workstations</Typography>
        {savedWorkstations.map((workstation) => {
          const selected = activeWorkstationId === workstation.id;
          const saved = readPublishedWorkstations().find((item) => item.id === workstation.id);
          const apps = saved?.apps?.length ? saved.apps : defaultWorkstreamApps;
          const expanded = expandedMyWorkstationId === workstation.id;
          return (
            <Box key={workstation.id}>
              <ListItemButton
                selected={selected}
                onClick={() => {
                  onOpenSavedWorkstation(workstation.id);
                  setExpandedMyWorkstationId((prev) => (prev === workstation.id ? null : workstation.id));
                }}
                sx={{...menuButtonSx, pl: 2.2, bgcolor: selected ? tokenNeutral.main : 'transparent'}}
              >
                <ListItemText
                  primary={workstation.title}
                  primaryTypographyProps={{
                    fontSize: 13,
                    fontWeight: selected ? 800 : 600,
                    color: workstationVisuals.tierTextHeading,
                    noWrap: true,
                  }}
                />
                {expanded ? <ExpandLessIcon sx={{fontSize: 15}} /> : <ExpandMoreIcon sx={{fontSize: 15}} />}
              </ListItemButton>
              <Collapse in={expanded} timeout="auto" unmountOnExit>
                {renderWorkstreamCards(apps, workstation.id)}
              </Collapse>
            </Box>
          );
        })}
        <Box sx={{px: 1.5, pt: 0.5}}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AddIcon sx={{fontSize: 16}} />}
            onClick={onAddWorkstation}
            sx={{
              height: 34,
              borderRadius: 1.6,
              textTransform: 'none',
              fontWeight: 800,
              fontSize: 12.5,
              borderColor: tokenInfo.lightest,
              color: tokenBrand.main,
              bgcolor: tokenNeutral.lightest,
              '&:hover': {
                borderColor: tokenBrand.lightest,
                bgcolor: tokenNeutral.lighter,
              },
            }}
          >
            Add Workstation
          </Button>
        </Box>
      </List>

      <Box sx={{mt: 'auto'}} />
    </Box>
  );
}
