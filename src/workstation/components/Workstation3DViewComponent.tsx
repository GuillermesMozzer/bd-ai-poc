import {useEffect, useState} from 'react';
import {Alert, Box, Button, Divider, Drawer, IconButton, Snackbar, TextField, Typography} from '@mui/material';
import {
  NorthEast as NorthEastIcon,
  ViewInAr as ViewInArIcon,
} from '@mui/icons-material';
import {useOptionalShiftManagementContext} from '../../shiftManagement/contexts/ShiftManagementContext';
import {ShiftLogbook3DHierarchyView} from '../../shiftManagement/components/ShiftLogbookScreen';
import {tokenBrand, workstationVisuals} from '../theme';
import type {WorkstationContextualAiAssistantPayload, WorkstationWidgetProps} from '../types';
import WidgetShell from './WidgetShell';
import {
  threeDViewNotificationConfig,
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  useWidgetNotifications,
} from './WidgetNotifications';

type MaintenanceRequestDraft = {
  title: string;
  targetLabel: string;
  priority: string;
  description: string;
};

type Workstation3DViewComponentProps = WorkstationWidgetProps & {
  onOpenAiAssistant?: (payload: WorkstationContextualAiAssistantPayload) => void;
};

export default function Workstation3DViewComponent({
  className,
  onExpand,
  onOpenAiAssistant,
  selectedHeaderHierarchyId,
  style,
}: Workstation3DViewComponentProps) {
  const notifications = useWidgetNotifications(threeDViewNotificationConfig);
  const shiftManagementContext = useOptionalShiftManagementContext();
  const [selectedScope, setSelectedScope] = useState('Columbus West');
  const [maintenanceRequestDraft, setMaintenanceRequestDraft] = useState<MaintenanceRequestDraft | null>(null);
  const [maintenanceRequestNotice, setMaintenanceRequestNotice] = useState('');

  const openLogbookRecordCreation = (category: string, targetLabel: string) => {
    if (category === 'Maintenance Request') {
      setMaintenanceRequestDraft({
        title: `Maintenance request for ${targetLabel}`,
        targetLabel,
        priority: 'High',
        description: `Observed abnormal condition around ${targetLabel} from the 3D live context. Please inspect, triage, and confirm whether a work order is required.`,
      });
      return;
    }

    shiftManagementContext?.logbook.setPendingDashboardRecordAction({
      category,
      targetLabel,
    });
    onExpand?.();
  };

  const updateMaintenanceDraft = (patch: Partial<MaintenanceRequestDraft>) => {
    setMaintenanceRequestDraft((current) => current ? {...current, ...patch} : current);
  };

  const closeMaintenanceRequestDrawer = () => {
    setMaintenanceRequestDraft(null);
  };

  const submitMaintenanceRequest = () => {
    const targetLabel = maintenanceRequestDraft?.targetLabel || 'selected equipment';
    setMaintenanceRequestNotice(`Maintenance request created for ${targetLabel}.`);
    setMaintenanceRequestDraft(null);
  };

  useEffect(() => {
    const handleOpenMaintenanceRequest = (event: Event) => {
      const detail = (event as CustomEvent<Partial<MaintenanceRequestDraft>>).detail;
      setMaintenanceRequestDraft({
        title: detail?.title ?? `Maintenance request for ${detail?.targetLabel ?? selectedScope}`,
        targetLabel: detail?.targetLabel ?? selectedScope,
        priority: detail?.priority ?? 'High',
        description: detail?.description ?? `Observed abnormal condition around ${detail?.targetLabel ?? selectedScope}. Please inspect and triage.`,
      });
    };

    window.addEventListener('workstation:open-maintenance-request', handleOpenMaintenanceRequest);
    return () => window.removeEventListener('workstation:open-maintenance-request', handleOpenMaintenanceRequest);
  }, [selectedScope]);

  const headerAction = (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
      <WidgetNotificationBell active={notifications.active} onClick={notifications.openDialog} size={24} />
      <IconButton
        size="small"
        aria-label="Open Shift Logbook"
        onClick={onExpand}
        sx={{width: 24, height: 24, p: 0, color: tokenBrand.main}}
      >
        <NorthEastIcon sx={{fontSize: 18}} />
      </IconButton>
    </Box>
  );

  return (
    <>
      <WidgetShell
        title={
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0}}>
            <ViewInArIcon sx={{fontSize: 17, color: tokenBrand.main, flexShrink: 0}} />
            <Box sx={{minWidth: 0}}>
              <Typography sx={{fontSize: '0.92rem', fontWeight: 600, color: workstationVisuals.textPrimary, fontFamily: workstationVisuals.fontFamily, lineHeight: 1.1}} noWrap>
                3D View Component
              </Typography>
              <Typography sx={{fontSize: '0.62rem', color: workstationVisuals.textSecondary, fontFamily: workstationVisuals.fontFamily, lineHeight: 1.1}} noWrap>
                {selectedScope}
              </Typography>
            </Box>
          </Box>
        }
        action={headerAction}
        className={className}
        style={style}
      >
        <Box sx={{position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden'}}>
          <ShiftLogbook3DHierarchyView
            compact
            onCreateRecord={openLogbookRecordCreation}
            onOpenAiAssistant={onOpenAiAssistant}
            onOpenLogbook={onExpand}
            onSelectionChange={setSelectedScope}
            selectedHeaderHierarchyId={selectedHeaderHierarchyId}
          />
        </Box>
      </WidgetShell>

      <WidgetNotificationsDialog
        active={notifications.active}
        config={threeDViewNotificationConfig}
        draftState={notifications.draftState}
        onApplySuggestion={notifications.applySuggestion}
        onClose={notifications.closeDialog}
        onSave={notifications.saveDialog}
        onStateChange={notifications.setDraftState}
        open={notifications.open}
      />

      <Drawer
        anchor="right"
        open={Boolean(maintenanceRequestDraft)}
        onClose={closeMaintenanceRequestDrawer}
        PaperProps={{
          sx: {
            width: {xs: '100%', sm: 430},
            maxWidth: '100%',
            bgcolor: '#FFFFFF',
            borderLeft: '1px solid rgba(15, 23, 42, 0.12)',
            boxShadow: '0 18px 44px rgba(15, 23, 42, 0.18)',
          },
        }}
      >
        <Box sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
          <Box sx={{px: 2.4, py: 2.1}}>
            <Typography sx={{fontSize: '1.12rem', fontWeight: 850, color: workstationVisuals.textPrimary, fontFamily: workstationVisuals.fontFamily}}>
              Create Maintenance Request
            </Typography>
            <Typography sx={{mt: 0.4, fontSize: '0.78rem', color: workstationVisuals.textSecondary, fontFamily: workstationVisuals.fontFamily}}>
              From 3D View Component | Stay in Workstation
            </Typography>
          </Box>
          <Divider />
          <Box sx={{p: 2.4, display: 'flex', flexDirection: 'column', gap: 1.4, flex: 1, overflow: 'auto'}}>
            <TextField
              label="Title"
              size="small"
              value={maintenanceRequestDraft?.title ?? ''}
              onChange={(event) => updateMaintenanceDraft({title: event.target.value})}
              fullWidth
            />
            <TextField
              label="Equipment / Area"
              size="small"
              value={maintenanceRequestDraft?.targetLabel ?? ''}
              onChange={(event) => updateMaintenanceDraft({targetLabel: event.target.value})}
              fullWidth
            />
            <TextField
              label="Priority"
              size="small"
              value={maintenanceRequestDraft?.priority ?? ''}
              onChange={(event) => updateMaintenanceDraft({priority: event.target.value})}
              fullWidth
            />
            <TextField
              label="Problem description"
              value={maintenanceRequestDraft?.description ?? ''}
              onChange={(event) => updateMaintenanceDraft({description: event.target.value})}
              minRows={5}
              multiline
              fullWidth
            />
            <Box sx={{p: 1.2, borderRadius: '8px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0'}}>
              <Typography sx={{fontSize: '0.78rem', fontWeight: 800, color: workstationVisuals.textPrimary, fontFamily: workstationVisuals.fontFamily}}>
                BD Atlas AI suggestions
              </Typography>
              <Typography sx={{mt: 0.45, fontSize: '0.76rem', color: workstationVisuals.textSecondary, lineHeight: 1.45, fontFamily: workstationVisuals.fontFamily}}>
                Attach the 3D context, include the affected zone, and request triage for vibration, inspection status, and linked work orders.
              </Typography>
            </Box>
          </Box>
          <Divider />
          <Box sx={{p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1}}>
            <Button onClick={closeMaintenanceRequestDrawer} sx={{textTransform: 'none', borderRadius: '8px', fontWeight: 750}}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={submitMaintenanceRequest}
              sx={{textTransform: 'none', borderRadius: '8px', fontWeight: 850, bgcolor: tokenBrand.main, boxShadow: 'none', '&:hover': {bgcolor: tokenBrand.dark, boxShadow: 'none'}}}
            >
              Done
            </Button>
          </Box>
        </Box>
      </Drawer>
      <Snackbar
        open={Boolean(maintenanceRequestNotice)}
        autoHideDuration={3200}
        onClose={() => setMaintenanceRequestNotice('')}
        anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
      >
        <Alert severity="success" variant="filled" onClose={() => setMaintenanceRequestNotice('')} sx={{borderRadius: '8px'}}>
          {maintenanceRequestNotice}
        </Alert>
      </Snackbar>
    </>
  );
}
